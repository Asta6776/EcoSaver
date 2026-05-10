// Increment this version every time you deploy an update!
const CACHE_VERSION = 'ecosaver-v1.0.1';
const CACHE_NAME = `static-${EcoSaver-v1.0.0}`;

const PRE_CACHE = [
  '.',
  'index.html',
  'manifest.json'
  // Add your icon files here if you want them pre-cached:
  // 'icon-192.png',
  // 'icon-512.png'
];

// Install – pre‑cache the core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(EcoSaver-v1.0.0).then(cache => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting(); // activate immediately
});

// Activate – delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== EcoSaver-v1.0.0).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch – network‑first for pages, cache‑first for assets
self.addEventListener('fetch', event => {
  const { request } = event;

  // For navigation (HTML) always try the network first → up‑to‑date page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Update the cache with the fresh copy
          const responseClone = response.clone();
          caches.open(EcoSaver-v1.0.0).then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For everything else (icons, SVGs, fonts, API calls…), cache first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(EcoSaver-v1.0.0).then(cache => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});