/* ── Şeyma · ÆON Service Worker ──
 * Amacı: yerel PWA bildirimlerini yönetmek (AEON mesajları).
 * Bu statik GitHub Pages uygulamasında klasik Web Push sunucusu olmadığından
 * push olayı dışarıdan tetiklenemez; uygulama ön planda / açıldığında
 * gösterilen native bildirimler sw.showNotification() üzerinden buradan geçer.
 */

const SW_VERSION = '20260818a';

// Reminder notifications are delivered by the foreground app. The service
// worker only transports an already-created click back to the app; it never
// schedules, retries, or reconstructs a reminder.
const SW_REMINDER_TARGETS = Object.freeze({
  faith: Object.freeze({ targetId: 'faith' }),
  zikr: Object.freeze({ targetId: 'zikr' }),
  room: Object.freeze({ targetId: 'room' }),
  saygi: Object.freeze({ targetId: 'saygi' }),
  reading: Object.freeze({ targetId: 'reading' }),
  gunluk: Object.freeze({ targetId: 'gunluk' }),
  health: Object.freeze({ targetId: 'saglik' }),
  settings: Object.freeze({ targetId: 'ayarlar' })
});
const SW_REMINDER_ACTIONS = Object.freeze({ open: true, snooze: true, todayOff: true, mute: true });
const SW_REMINDER_SNOOZE_OPTIONS = Object.freeze({ '10m': true, '30m': true, '1h': true, thisEvening: true, tomorrow: true });
const SW_SAFE_TOKEN_RE = /^[A-Za-z0-9._:%|+\-]+$/;
const SW_SAFE_TIMEZONE_RE = /^[A-Za-z0-9_./+\-]{1,80}$/;

// REM-52: the two notification channels own disjoint tag and payload-type
// namespaces. Anything in the reminder namespace is reminder-owned even when
// its payload is malformed; it is dropped, never downgraded to the ÆON route.
const SW_REMINDER_TAG_PREFIX = 'seyma-reminder-v1:';
const SW_REMINDER_PREVIEW_TAG = 'reminder-preview-v1';
const SW_REMINDER_PAYLOAD_TYPES = Object.freeze({ reminder: true, 'reminder-preview': true });
const SW_AEON_TAG_PREFIX = 'aeon-';

// Honest capability statement. A static GitHub Pages service worker has no
// alarm, no timer and no reminder push endpoint: it can only carry a click the
// operating system already delivered back into the open app.
const SW_CAPABILITIES = Object.freeze({
  backgroundScheduling: false,
  backgroundReplay: false,
  closedAppTimedDelivery: false,
  reminderPush: false,
  aeonPush: true,
  reminderRole: 'click-transport-only'
});

function swNotificationChannel(notification) {
  const record = notification && typeof notification === 'object' ? notification : {};
  const payload = record.data && typeof record.data === 'object' ? record.data : {};
  const tag = String(record.tag == null ? '' : record.tag);
  const type = String(payload.type == null ? '' : payload.type);
  if (SW_REMINDER_PAYLOAD_TYPES[type] || tag === SW_REMINDER_PREVIEW_TAG || tag.indexOf(SW_REMINDER_TAG_PREFIX) === 0) return 'reminder';
  if (tag.indexOf(SW_AEON_TAG_PREFIX) === 0) return 'aeon';
  return '';
}

function swSafeToken(value, max) {
  const token = String(value == null ? '' : value);
  return token && token.length <= (max || 240) && SW_SAFE_TOKEN_RE.test(token) ? token : '';
}

function swReminderClickPayload(data, action, tag) {
  if (!data || typeof data !== 'object' || data.type !== 'reminder') return null;
  // A reminder payload must carry a reminder tag; a reminder body riding an
  // ÆON tag is a namespace collision, not a route.
  const notificationTag = String(tag == null ? '' : tag);
  if (notificationTag && notificationTag.indexOf(SW_REMINDER_TAG_PREFIX) !== 0) return null;
  const target = SW_REMINDER_TARGETS[String(data.deepLink || '')];
  const occurrenceId = swSafeToken(data.occurrenceId, 240);
  const reminderId = swSafeToken(data.reminderId, 240);
  if (!target || !occurrenceId || !reminderId || data.targetId !== target.targetId) return null;
  if (data.openDetail !== undefined && typeof data.openDetail !== 'boolean') return null;
  if (data.therapyToolId !== undefined && data.therapyToolId !== '' && (!swSafeToken(data.therapyToolId, 80) || String(data.deepLink) !== 'room')) return null;
  if (data.timezone !== undefined && (!SW_SAFE_TIMEZONE_RE.test(String(data.timezone)) || String(data.timezone).length > 80)) return null;
  if (data.snoozeOption !== undefined && data.snoozeOption !== '' && !SW_REMINDER_SNOOZE_OPTIONS[String(data.snoozeOption)]) return null;

  let clickAction = String(action || 'open');
  if (!SW_REMINDER_ACTIONS[clickAction]) return null;
  if (clickAction === 'mute') clickAction = 'todayOff';
  return {
    type: 'reminder',
    occurrenceId: occurrenceId,
    reminderId: reminderId,
    deepLink: String(data.deepLink),
    targetId: target.targetId,
    openDetail: data.openDetail === true,
    action: clickAction,
    snoozeOption: data.snoozeOption ? String(data.snoozeOption) : '',
    timezone: data.timezone ? String(data.timezone) : '',
    therapyToolId: data.therapyToolId ? String(data.therapyToolId) : ''
  };
}

function swAppUrl() {
  const origin = String(self.location && self.location.origin || '');
  const path = String(self.location && self.location.pathname || '/sw.js');
  return origin + path.replace(/\/sw\.js$/, '/index.html');
}

function swIsAppClient(client) {
  if (!client || typeof client.url !== 'string' || !client.url) return false;
  try {
    const app = new URL(swAppUrl());
    const candidate = new URL(client.url);
    const directory = app.pathname.replace(/index\.html$/, '');
    return candidate.origin === app.origin && (candidate.pathname === app.pathname || candidate.pathname === directory);
  } catch (error) {
    return false;
  }
}

function swDispatchToClient(client, message) {
  if (!client) return Promise.resolve();
  try {
    client.postMessage(message);
  } catch (error) {
    // A stale client must not trigger a retry loop or block another click.
  }
  if (typeof client.focus !== 'function') return Promise.resolve();
  try {
    return Promise.resolve(client.focus()).catch(function () {});
  } catch (error) {
    return Promise.resolve();
  }
}

function swRouteNotificationClick(event, message) {
  return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
    for (let i = 0; i < clientList.length; i++) {
      if (swIsAppClient(clientList[i])) return swDispatchToClient(clientList[i], message);
    }
    // One openWindow attempt is the complete closed-app boundary. There is no
    // timer, replay queue, or background reminder guarantee here.
    return clients.openWindow(swAppUrl()).then(function (client) {
      return swDispatchToClient(client, message);
    }).catch(function () {});
  });
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
  if (!event.data) return;
  var payload;
  try { payload = event.data.json(); } catch (e) { payload = { title: 'ÆON', body: 'Yeni mesaj' }; }
  // Reminder delivery is foreground-only. A reminder-shaped push must never
  // become a background alarm; the existing ÆON push channel stays intact.
  if (swNotificationChannel({ tag: payload && payload.tag, data: payload && (payload.data || payload) }) === 'reminder') return;
  event.waitUntil(
    self.registration.showNotification(payload.title || 'ÆON', {
      body: payload.body || 'Yeni bir ÆON mesajı var',
      icon: payload.icon || './aeon-icon-192.png',
      badge: payload.badge || './aeon-icon-192.png',
      tag: payload.tag || 'aeon-message',
      renotify: !!payload.renotify,
      requireInteraction: !!payload.requireInteraction,
      data: payload.data || {},
      silent: false
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  if (event.notification && typeof event.notification.close === 'function') event.notification.close();
  const notification = event.notification;
  const data = notification && notification.data;
  const channel = swNotificationChannel(notification);
  const isReminder = channel === 'reminder';
  const reminderPayload = isReminder ? swReminderClickPayload(data, event.action, notification && notification.tag) : null;
  // Invalid reminder payloads are ignored, never downgraded to an ÆON route.
  if (isReminder && !reminderPayload) return;
  const message = reminderPayload
    ? { type: 'reminder-native-click', payload: reminderPayload }
    : { type: 'aeon-open-mesaj' };
  event.waitUntil(swRouteNotificationClick(event, message));
});
