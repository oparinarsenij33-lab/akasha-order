// =========================================================
// ☠️ КАМИКАДЗЕ — самоликвидация старого воюющего SW (akasha-v2)
// Этот файл больше НЕ рабочий SW: при обновлении он чистит свой кэш
// и де-регистрирует себя, освобождая scope для единого /sw.js.
// =========================================================
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k === 'akasha-v2') return caches.delete(k); return null; }));
    }).then(function () { return self.registration.unregister(); })
  );
});
self.addEventListener('fetch', function () { /* ничего не перехватываем */ });
// =========================================================
