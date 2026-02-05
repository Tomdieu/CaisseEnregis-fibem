// service-worker.js
// Pre-cache critical assets for offline functionality

const CACHE_NAME = 'pos-v1.0.0';
const urlsToCache = [
  '/',
  '/dashboard/pos',
  '/dashboard/pos/sales',
  '/dashboard/pos/products',
  '/dashboard/pos/customers',
  '/dashboard/pos/reports',
  '/dashboard/pos/receipts',
  '/dashboard/pos/settings',
  '/_next/static/css/main.css',
  '/_next/static/chunks/main.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // For POS-specific routes, try network first, then fall back to cache
  if (event.request.url.includes('/dashboard/pos')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, clone it and store in cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return from cache if network fails
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Return offline indicator for POS pages
              return caches.match('/');
            });
        })
    );
  } else {
    // For other requests, use standard cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available, otherwise fetch from network
          return response || fetch(event.request);
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});