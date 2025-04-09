// Service Worker for TNTC Airdrop DApp

const CACHE_NAME = 'tntc-airdrop-cache-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/logo.png',
  '/assets/css/style.css',
  '/assets/css/responsive.css',
  '/assets/bootstrap/css/bootstrap.min.css',
  '/assets/css/animate.css',
  '/assets/css/spop.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream that can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API calls or wallet connections
                if (!event.request.url.includes('/api/') && 
                    !event.request.url.includes('walletconnect') &&
                    !event.request.url.includes('infura')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 