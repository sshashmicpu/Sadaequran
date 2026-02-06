/* Sada-e-Quran | Service Worker (Fixed Version) */

const CACHE_NAME = 'sada-e-quran-v1.0.1'; // Version barha diya
const OFFLINE_URL = 'index.html';

const ASSETS_TO_CACHE = [
  './',               // '/' ki jagah './' istemal karein
  './index.html',     // './' ke sath path dein
  './manifest.json',
  './68961.png',      // Logo path check kar lein
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu&family=Inter:wght@400;600&display=swap'
];

// 1. Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event (Offline Support)
self.addEventListener('fetch', (event) => {
  // Audio aur API ke liye Network-Only
  if (event.request.url.includes('.mp3') || event.request.url.includes('alquran.cloud')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 408 })));
    return;
  }

  // Pehle Cache check karein, phir Network (Offline ke liye behtar hai)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
