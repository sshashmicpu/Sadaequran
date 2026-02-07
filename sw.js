/* Sada-e-Quran | Service Worker (Smart Offline Version) */

const CACHE_NAME = 'sada-e-quran-v1.1.0'; 
const OFFLINE_URL = 'index.html';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './68961.png',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu&family=Inter:wght@400;600&display=swap'
];

// 1. Install: Basic files ko save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate: Purana kachra saaf karna
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: Asli Jadu yahan hai
self.addEventListener('fetch', (event) => {
  // Hum har request ko check karenge (Audio aur API samait)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Agar cache mein hai to wahi se dedo
      if (cachedResponse) {
        return cachedResponse;
      }

      // Agar cache mein nahi hai to internet se mangwao
      return fetch(event.request).then((networkResponse) => {
        // Agar response sahi hai aur ye Audio ya API hai, to isay save karlo agli baar ke liye
        if (networkResponse && networkResponse.status === 200 && 
           (event.request.url.includes('.mp3') || event.request.url.includes('alquran.cloud'))) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Agar internet nahi hai aur file cache mein bhi nahi mili
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
