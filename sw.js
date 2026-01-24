/* Sada-e-Quran | Service Worker (Final Version)
  Updates: Auto-activation, No-crash fetching, Offline support.
*/

const CACHE_NAME = 'sada-e-quran-v1.0.0';
const OFFLINE_URL = 'index.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '68961.png',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu&family=Inter:wght@400;600&display=swap'
];

// 1. Install Event: Naye assets ko cache mein save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Naye version ko foran install karne ke liye
  self.skipWaiting();
});

// 2. Activate Event: Purane versions ko khatam karna aur control sambhalna
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Foran active ho kar page ko control karna
  self.clients.claim();
});

// 3. Fetch Event: Network errors aur offline mode ko handle karna
self.addEventListener('fetch', (event) => {
  // Audio files aur API calls ke liye Network-Only strategy (app crash se bachane ke liye)
  if (event.request.url.includes('.mp3') || event.request.url.includes('alquran.cloud')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Agar internet chala jaye to empty response dein taake player freeze na ho
        return new Response('', { status: 408, statusText: 'Network Error' });
      })
    );
    return;
  }

  // Baqi assets ke liye: Pehle Network, phir Cache (Stale-while-revalidate style)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Agar network sahi hai, to response return karein
        return response;
      })
      .catch(() => {
        // Agar network fail ho, to cache se file uthayein
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Agar kuch bhi nahi milta (offline), to index.html dikhayein
          return caches.match(OFFLINE_URL);
        });
      })
  );
});

// 4. Update Message: UI se aane wale signals ko handle karna
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
