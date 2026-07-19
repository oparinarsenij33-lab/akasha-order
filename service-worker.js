const CACHE_NAME = 'akasha-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;700&display=swap'
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Кэш открыт');
        return cache.addAll(urlsToCache.map(url => {
          // Убираем точку в начале для относительных путей
          return url.replace('./', '');
        }));
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
            console.log('🗑️ Удаляю старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

//  ИСПРАВЛЕНИЕ: Перехват запросов — НЕ КЭШИРУЕМ HTML
self.addEventListener('fetch', event => {
    // НЕ кэшируем HTML — всегда берём свежий с сервера
    if (event.request.url.endsWith('.html') || 
        event.request.url.endsWith('/') || 
        event.request.url.includes('index.html')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // Остальное (CSS, JS, картинки, шрифты) — из кэша
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
