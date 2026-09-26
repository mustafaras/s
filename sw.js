/* ── Şeyma · ÆON Service Worker ──
 * Amacı: yerel PWA bildirimlerini yönetmek (AEON mesajları).
 * Bu statik GitHub Pages uygulamasında klasik Web Push sunucusu olmadığından
 * push olayı dışarıdan tetiklenemez; uygulama ön planda / açıldığında
 * gösterilen native bildirimler sw.showNotification() üzerinden buradan geçer.
 */

const SW_VERSION = '20260926i';

// IIP-22: controlled, public-only offline package. This is deliberately an
// exact allowlist, not a runtime cache. Personal data, authenticated responses,
// panel payloads, media and third-party responses can never enter this cache.
const SW_OFFLINE_VERSION = 'iip22-20260926i';
const SW_OFFLINE_PREFIX = 'seyma-offline-v1-';
const SW_OFFLINE_CACHE = SW_OFFLINE_PREFIX + SW_OFFLINE_VERSION;
const SW_OFFLINE_TEMP = SW_OFFLINE_CACHE + '-temp';
const SW_OFFLINE_ESTIMATED_BYTES = 3800000;
const SW_OFFLINE_MANIFEST = Object.freeze([
  './',
  './index.html',
  './manifest.json?v=20260730f',
  './app/styles.css?v=20260924d',
  './app/kao.css?v=20260926i',
  './assets/aeon-icon-192.png',
  './assets/aeon-icon-512.png',
  './app/content/motivationProgramV2.js?v=20260730p',
  './app/content/motivationNarratives.js?v=20260730p',
  './app/content/saygiPeople.js?v=20260730p',
  './app/content/profileAssessmentV1.js?v=20260730p',
  './app/content/hijriCalendar.js?v=20260730p',
  './app/content/quranRevelationOrderV1.js?v=20260730p',
  './app/content/quranTransportV1.js?v=20260730p',
  './app/content/quranStrikingVersesV1.js?v=20260922b',
  './app/content/quranLexiconV1.js?v=20260926i',
  './app/content/quranGrammarV1.js?v=20260926i',
  './app/content/quranShortSurahsV1.js?v=20260926i',
  './app/content/quranPhonicsV1.js?v=20260924b',
  './app/content/esmaulHusnaV1.js?v=20260730p',
  './app/content/esmaulHusnaV2.js?v=20260730p',
  './app/content/zikirCoreContentV1.js?v=20260730p',
  './app/core/constants.js?v=20260824a',
  './app/core/dateUtils.js?v=20260903b',
  './app/core/state.js?v=20260910b',
  './app/core/syncGlue.js?v=20260904a',
  './app/core/helpers.js?v=20260903b',
  './app/core/prayer.js?v=20260921f',
  './app/core/zikir.js?v=20260915a',
  './app/core/quran.js?v=20260915a',
  './app/core/quranLearn.js?v=20260926i',
  './app/core/saygi.js?v=20260924e',
  './app/core/motivation.js?v=20260909a',
  './app/core/crisis.js?v=20260909a',
  './app/core/journal.js?v=20260909a',
  './app/core/health.js?v=20260918a',
  './app/core/library.js?v=20260910a',
  './app/core/report.js?v=20260910a',
  './app/core/map.js?v=20260915a',
  './app/core/profile.js?v=20260915a',
  './app/core/settings.js?v=20260926a',
  './app/core/mediaFx.js?v=20260909a',
  './app/core/timeTheme.js?v=20260908a',
  './app/core/skyFx.js?v=20260909a',
  './app/core/reminderCatalog.js?v=20260914a',
  './app/core/reminderEngine.js?v=20260818a',
  './app/core/reminderScheduler.js?v=20260818a',
  './app/core/reminderDelivery.js?v=20260818a',
  './app/core/reminders.js?v=20260914a',
  './app/core/reminderSurface.js?v=20260914d',
  './app/core/messaging.js?v=20260926i',
  './app/core/render.js?v=20260924a',
  './app/core/appSurface.js?v=20260926i',
  './app.js?v=20260926i',
  './sync.js?v=20260926i'
]);

function swManifestDescriptor() {
  return {
    version: SW_OFFLINE_VERSION,
    cacheName: SW_OFFLINE_CACHE,
    estimatedBytes: SW_OFFLINE_ESTIMATED_BYTES,
    entries: SW_OFFLINE_MANIFEST.slice()
  };
}

function swSensitiveUrl(url) {
  if (url.origin !== new URL(self.registration.scope).origin) return true;
  if (/\/(?:data|panel|v3-tanitim)(?:\/|\.|$)/i.test(url.pathname)) return true;
  if (/\.(?:mp4|webm|mov|m4a|mp3|wav|json)$/i.test(url.pathname) && !/\/manifest\.json$/i.test(url.pathname)) return true;
  for (const key of url.searchParams.keys()) {
    if (/(?:token|auth|secret|credential|signature|access[_-]?key|api[_-]?key)/i.test(key)) return true;
  }
  return false;
}

function swOfflineManifestUrls() {
  return SW_OFFLINE_MANIFEST.map(function (entry) { return new URL(entry, self.registration.scope).href; });
}

function swOfflineRequestKey(request) {
  if (!request || String(request.method || 'GET').toUpperCase() !== 'GET') return '';
  let url;
  try { url = new URL(request.url); } catch (error) { return ''; }
  if (swSensitiveUrl(url)) return '';
  const scope = new URL(self.registration.scope);
  const safeNavigation = request.mode === 'navigate' &&
    (url.pathname === scope.pathname || url.pathname === scope.pathname + 'index.html');
  const key = safeNavigation ? new URL('./index.html', scope).href : url.href;
  return swOfflineManifestUrls().indexOf(key) >= 0 ? key : '';
}

async function swInstallOfflinePackage() {
  const urls = swOfflineManifestUrls();
  await caches.delete(SW_OFFLINE_TEMP);
  const temporary = await caches.open(SW_OFFLINE_TEMP);
  try {
    await temporary.addAll(urls);
    const downloaded = await temporary.keys();
    if (downloaded.length !== urls.length) throw new Error('offline package incomplete');
    await caches.delete(SW_OFFLINE_CACHE);
    const target = await caches.open(SW_OFFLINE_CACHE);
    for (const request of downloaded) {
      const response = await temporary.match(request);
      if (!response) throw new Error('offline package response missing');
      await target.put(request, response);
    }
    const installed = await target.keys();
    if (installed.length !== urls.length) throw new Error('offline package copy incomplete');
    await caches.delete(SW_OFFLINE_TEMP);
    return { status: 'ready', version: SW_OFFLINE_VERSION, entries: installed.length };
  } catch (error) {
    await caches.delete(SW_OFFLINE_TEMP);
    await caches.delete(SW_OFFLINE_CACHE);
    throw error;
  }
}

async function swOfflineCacheNames() {
  const names = await caches.keys();
  return names.filter(function (name) {
    return name.indexOf(SW_OFFLINE_PREFIX) === 0 && !name.endsWith('-temp');
  });
}

async function swMatchOfflineRequest(request) {
  const key = swOfflineRequestKey(request);
  if (!key) return undefined;
  const names = await swOfflineCacheNames();
  names.sort(function (a, b) {
    if (a === SW_OFFLINE_CACHE) return -1;
    if (b === SW_OFFLINE_CACHE) return 1;
    return b.localeCompare(a);
  });
  for (const name of names) {
    const response = await caches.match(key, { cacheName: name });
    if (response) return response;
  }
  return undefined;
}

async function swNetworkFirstNavigation(request) {
  try {
    const response = await self['fetch'](request);
    if (response) return response;
  } catch (error) {}
  return swMatchOfflineRequest(request);
}

async function swOfflineStatus() {
  const names = await swOfflineCacheNames();
  const current = names.indexOf(SW_OFFLINE_CACHE) >= 0;
  return {
    status: current ? 'ready' : (names.length ? 'rollback' : 'absent'),
    version: SW_OFFLINE_VERSION,
    estimatedBytes: SW_OFFLINE_ESTIMATED_BYTES,
    installedVersions: names.slice().sort(),
    updatePolicy: 'no-forced-reload'
  };
}

async function swRemoveOfflinePackage() {
  const names = (await caches.keys()).filter(function (name) { return name.indexOf(SW_OFFLINE_PREFIX) === 0; });
  const failed = [];
  for (const name of names) {
    try { if (!await caches.delete(name)) failed.push(name); } catch (error) { failed.push(name); }
  }
  return { status: failed.length ? 'partial' : 'removed', failed: failed };
}

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
  // A new worker waits normally. It must not replace/reload an active counter
  // or note session. Failed or quota-limited installs reject atomically, so the
  // previous worker and its package remain available.
  event.waitUntil(swInstallOfflinePackage());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (event) {
  const key = swOfflineRequestKey(event.request);
  if (!key) return;
  if (event.request.mode === 'navigate') {
    // Navigations check the network without writing the response to CacheStorage.
    // This prevents an installed offline shell from hiding later deployments.
    event.respondWith(swNetworkFirstNavigation(event.request));
    return;
  }
  event.respondWith(swMatchOfflineRequest(event.request).then(function (response) {
    // Exact public allowlist only; the network fallback is never written back.
    return response || self['fetch'](event.request);
  }));
});

self.addEventListener('message', function (event) {
  const data = event.data && typeof event.data === 'object' ? event.data : {};
  const reply = event.ports && event.ports[0]
    ? function (payload) { event.ports[0].postMessage(payload); }
    : function (payload) { if (event.source && event.source.postMessage) event.source.postMessage(payload); };
  let task;
  if (data.type === 'SEYMA_OFFLINE_STATUS') task = swOfflineStatus();
  else if (data.type === 'SEYMA_OFFLINE_INSTALL') task = swInstallOfflinePackage();
  else if (data.type === 'SEYMA_OFFLINE_REMOVE') task = swRemoveOfflinePackage();
  else return;
  event.waitUntil(Promise.resolve(task).then(reply, function (error) {
    reply({ status: error && error.name === 'QuotaExceededError' ? 'quota' : 'incomplete', error: 'offline-package-failed' });
  }));
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
      icon: payload.icon || './assets/aeon-icon-192.png',
      badge: payload.badge || './assets/aeon-icon-192.png',
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
