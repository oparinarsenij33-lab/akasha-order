// =========================================================
// ☠️ КАМИКАДЗЕ — самоликвидация старого SW (akasha-v2)
// =========================================================
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k === 'akasha-v2') return caches.delete(k); return null; }));
    }).then(function () { return self.registration.unregister(); })
  );
});
self.addEventListener('fetch', function () {});
// kamikaze-end
