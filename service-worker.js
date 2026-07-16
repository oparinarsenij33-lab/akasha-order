const CACHE_NAME = 'akasha-v1';
const urlsToCache = [
  '/akasha-order/',
  '/akasha-order/index.html',
  '/akasha-order/style.css',
  '/akasha-order/script.js',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;700&display=swap'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Кэш открыт');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('❌ Ошибка кэширования:', err);
      })
  );
});

// Активация и очистка старого кэша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('️ Удаляю старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});