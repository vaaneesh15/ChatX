const CACHE_NAME = 'chatx-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  'https://cdn.socket.io/4.6.1/socket.io.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Для HTML всегда сеть, чтобы получать свежую версию
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }
  // Для API и WebSocket не кэшируем
  if (event.request.url.includes('/socket.io/') || 
      event.request.url.includes('/auth') ||
      event.request.url.includes('/verify') ||
      event.request.url.includes('/chats') ||
      event.request.url.includes('/messages') ||
      event.request.url.includes('/upload')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
