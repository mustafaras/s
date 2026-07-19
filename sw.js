/* ── Şeyma · ÆON Service Worker ──
 * Amacı: yerel PWA bildirimlerini yönetmek (AEON mesajları).
 * Bu statik GitHub Pages uygulamasında klasik Web Push sunucusu olmadığından
 * push olayı dışarıdan tetiklenemez; uygulama ön planda / açıldığında
 * gösterilen native bildirimler sw.showNotification() üzerinden buradan geçer.
 */

const SW_VERSION = '20260718j';

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
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      var url = self.location.origin + self.location.pathname.replace(/\/sw\.js$/, '/index.html');
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && (client.url.indexOf('index.html') > -1 || client.url === self.location.origin + '/')) {
          client.postMessage({ type: 'aeon-open-mesaj' });
          return client.focus ? client.focus() : clients.openWindow(url);
        }
      }
      return clients.openWindow(url);
    })
  );
});
