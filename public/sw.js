const CACHE_VERSION = 'findomus-v1';

const PRECACHE = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function () {});
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_VERSION;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  var path = url.pathname;

  if (path.startsWith('/api/')) return;

  if (path === '/manifest.webmanifest' || path === '/favicon.ico' || path === '/favicon.svg') {
    event.respondWith(
      caches.match(request).then(function (cached) {
        return cached || fetch(request);
      })
    );
    return;
  }

  var destination = request.destination;
  if (destination === 'image' || destination === 'font') {
    event.respondWith(
      caches.match(request).then(function (cached) {
        var fetched = fetch(request).then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(request, clone);
            });
          }
          return response;
        });
        return cached || fetched;
      })
    );
    return;
  }

  if (destination === 'script' || destination === 'style') {
    event.respondWith(
      caches.open(CACHE_VERSION).then(function (cache) {
        return cache.match(request).then(function (cached) {
          var fetched = fetch(request).then(function (response) {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match('/offline.html');
      })
    );
    return;
  }
});
