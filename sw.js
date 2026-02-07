/* Sada-e-Quran | Service Worker (Font & Audio Optimized) */

const CACHE_NAME = 'sada-e-quran-v1.0.8'; 
const OFFLINE_URL = './index.html';

// Critical assets to save immediately on first load
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './68961.png',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu&family=Inter:wght@400;600&display=block'
];

// 1. Install: Lock essential files into the cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Sada-e-Quran: Magic Shield Installing...');
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.log('Sada-e-Quran Cache Fail:', url));
        })
      );
    })
  );
});

// 2. Activate: Clean up old versions so the new magic takes over
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  console.log('Sada-e-Quran: Magic Shield Activated!');
  self.clients.claim();
});

// 3. Fetch: The "Guardian" that serves files from cache or saves new ones
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return it immediately (no internet needed)
      if (cachedResponse) return cachedResponse;

      // If not in cache, fetch from internet
      return fetch(event.request).then((networkResponse) => {
        // Only cache valid responses
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        // DYNAMIC MAGIC: Automatically save Fonts, MP3s, and Quran API data as they are used
        if (url.includes('fonts.gstatic.com') || url.includes('.mp3') || url.includes('alquran.cloud')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // If internet is totally gone and file isn't cached
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL) || caches.match('./');
        }
      });
    })
  );
});
