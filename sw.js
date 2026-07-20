// =========================================================
// 📦 SERVICE WORKER — кэш оболочки Акаши (быстрый заход + работа при обрыве связи)
// =========================================================
var CACHE = 'akasha-shell-v1';
var CORE = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json'];

// кэшируем пофайлово и глотаем ошибку, если какого-то файла нет (чтобы install не падал)
function safePrecache(urls) {
  return Promise.all(urls.map(function (u) {
    return caches.open(CACHE).then(function (c) {
      return c.add(u).catch(function (e) { console.warn('SW: пропуск', u, e); });
    });
  }));
}

self.addEventListener('install', function (ev) {
  ev.waitUntil(safePrecache(CORE).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (ev) {
  if (ev.request.method !== 'GET') return;
  var url = new URL(ev.request.url);
  var host = url.hostname;
  // данные Firebase НЕ кэшируем — они всегда свежие при сети
  if (host.indexOf('firestore.googleapis.com') !== -1 || host.indexOf('firebasestorage.googleapis.com') !== -1) return;

  // переходы между страницами — сначала сеть, при обрыве отдаём оболочку из кэша
  if (ev.request.mode === 'navigate') {
    ev.respondWith(
      fetch(ev.request).catch(function () {
        return caches.match('/index.html').then(function (r) { return r || caches.match('/'); });
      })
    );
    return;
  }

  // всё остальное (стили, скрипты, шрифты, иконки) — сначала кэш, потом сеть + докэш
  ev.respondWith(
    caches.match(ev.request).then(function (cached) {
      if (cached) return cached;
      return fetch(ev.request).then(function (res) {
        if (res && res.status === 200 && (url.origin === self.location.origin || host === 'fonts.gstatic.com' || host === 'www.gstatic.com' || host === 'fonts.googleapis.com')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(ev.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});
// =========================================================
