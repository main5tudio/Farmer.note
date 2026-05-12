const CACHE_NAME = 'farm-note-v1';
const urlsToCache = [
  '/Farmer.note/',
  '/Farmer.note/index.html',
  '/Farmer.note/style.css',
  '/Farmer.note/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
