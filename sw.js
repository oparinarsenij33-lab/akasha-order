// =========================================================
// 📦 SERVICE WORKER v3 — ЕДИНЫЙ (network-first для своих, кэш при обрыве)
// Правки в script.js/style.css видны СРАЗУ при сети; без сети — оболочка из кэша.
// =========================================================
var CACHE = 'akasha-v3';
var CORE = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json', '/icon-192.png', '/icon-512.png'];

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
  // данные Firebase — никогда не трогаем (всегда сеть)
  if (host.indexOf('firestore.googleapis.com') !== -1 || host.indexOf('firebasestorage.googleapis.com') !== -1) return;
  // шрифты/иконки Google и gstatic — статика, cache-first (быстрее, не меняются)
  if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com' || host === 'www.gstatic.com') {
    ev.respondWith(
      caches.match(ev.request).then(function (cached) {
        return cached || fetch(ev.request).then(function (res) {
          if (res && res.status === 200) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(ev.request, copy); }); }
          return res;
        }).catch(function () { return cached; });
      })
    );
    return;
  }
  // ВСЁ СВОЁ (html, css, js, картинки) — network-first: при сети всегда СВЕЖЕЕ, при обрыве — кэш
  ev.respondWith(
    fetch(ev.request).then(function (res) {
      if (res && res.status === 200 && url.origin === self.location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(ev.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(ev.request).then(function (cached) {
        return cached || caches.match('/index.html').then(function (r) { return r || caches.match('/'); });
      });
    })
  );
});
// =========================================================
