const CACHE_NAME = "digibiz-v2026_08_17";
const PRECACHE_URLS = [
  "/v2026_08_17/assets/vendor/html2canvas.min.js",
  "/v2026_08_17/assets/vendor/sweetalert2.all.min.js",
  "/v2026_08_17/assets/vendor/firebase-app-compat.js",
  "/v2026_08_17/assets/vendor/firebase-auth-compat.js",
  "/v2026_08_17/assets/vendor/firebase-firestore-compat.js",
  "/v2026_08_17/modules/distributor/web/distributor-repapp.html",
  "/v2026_08_17/core/pwa-init.js",
  "/v2026_08_17/core/firebase-init.js",
  "/v2026_08_17/manifest.json"
];

// Force immediate activation and precache critical offline assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => console.warn('[SW] Precache warn:', err));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Network-First with full offline Cache Fallback Strategy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Network-First with automatic Cache Fallback for pages and scripts
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;
          return new Response('Network error or offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // Fallback Network-first for static images/media
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});
