// COURIER PRO (Tharindu Senanayake) - Scoped Service Worker (Cache Bust & Network First)
const CACHE_NAME = 'digibiz-suite-v2028-refresh-1788193896153';
const ASSETS = [
    '/clients/tharindusenanayake/',
    '/clients/tharindusenanayake/index.html',
    '/clients/tharindusenanayake/manifest.json'
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS).catch(function () { });
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) {
                if (k !== CACHE_NAME) return caches.delete(k);
            }));
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
                caches.open(CACHE_NAME).then(function (c) { c.put(event.request, resClone); });
            }
            return response;
        }).catch(function () {
            return caches.match(event.request).then(function (cached) {
                if (cached) return cached;
                if (event.request.mode === 'navigate') return caches.match('/clients/tharindusenanayake/index.html');
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
