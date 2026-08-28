// SPI HOLDINGS - Service Worker (simple cache)
const CACHE_NAME = 'spi_holdings-v1';
const ASSETS = [
    '/clients/spi_holdings/',
    '/clients/spi_holdings/index.html',
    '/clients/spi_holdings/manifest.json'
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS).catch(() => { });
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { if (k !== CACHE_NAME) return caches.delete(k); }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;
    if (url.includes('firestore.googleapis.com') || url.includes('identitytoolkit.googleapis.com') || url.includes('securetoken.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request).then(function (response) {
            if (response && response.status === 200) {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, resClone));
            }
            return response;
        }).catch(function () {
            return caches.match(event.request).then(function (cached) {
                if (cached) return cached;
                if (event.request.mode === 'navigate') return caches.match('/clients/spi_holdings/index.html');
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
