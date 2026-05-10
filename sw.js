// Increment this version every time you update the app.
const CACHE_VERSION = 'ecosaver-v1.0.0';
const CACHE_NAME = `static-${CACHE_VERSION}`;

const PRE_CACHE = [
  '.',
  'index.html',
  'manifest.json',
  // Add other static assets if any (icons, CSS files, etc.)
];

// Install: pre‑cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting(); // activate new SW immediately
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for others
self.addEventListener('fetch', event => {
  const { request } = event;

  // For navigation requests (HTML), always network-first so the user gets the latest index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Update cache with fresh copy
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For everything else (icons, SVGs, fonts), cache-first with network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});