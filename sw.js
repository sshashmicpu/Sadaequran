/* Sada-e-Quran | Service Worker (The Ultimate Offline Magic) */

const CACHE_NAME = 'sada-e-quran-v1.0.6'; 
const OFFLINE_URL = './index.html';

// وہ فائلیں جو پہلے ہی لمحے سیو ہونی چاہئیں
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './68961.png', // آپ کا لوگو/آئیکن
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Noto+Nastaliq+Urdu&family=Inter:wght@400;600&display=block'
];

// 1. Install: سب سے پہلے ضروری سامان کو تجوری (Cache) میں ڈالو
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

// 2. Activate: پرانے ورژن کو ہٹاؤ تاکہ نیا جادو کام کرے
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

// 3. Fetch: جب بھی کچھ لوڈ ہو، یہ پہرے دار چیک کرے گا
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // اگر تجوری میں مل گیا تو انٹرنیٹ کی ضرورت ہی نہیں
      if (cachedResponse) return cachedResponse;

      // اگر نہیں ملا تو انٹرنیٹ سے لاؤ اور ساتھ ہی تجوری میں بھی رکھ لو
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        // جادوئی حصہ: فونٹس، آڈیو فائلیں اور قرآنی ڈیٹا کو خودبخود سیو کرنا
        if (url.includes('fonts.gstatic.com') || url.includes('.mp3') || url.includes('alquran.cloud')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // اگر بالکل ہی انٹرنیٹ غائب ہو جائے تو ہوم پیج دکھاؤ
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL) || caches.match('./');
        }
      });
    })
  );
});
