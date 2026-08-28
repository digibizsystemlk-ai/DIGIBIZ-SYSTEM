// Madawala Tea Shop - Service Worker (PWA)
const CACHE_NAME = 'madawala-pwa-v7';
const ASSETS = [
    '/clients/madawalateashop/',
    '/clients/madawalateashop/index.html',
    '/clients/madawalateashop/manifest.json',
    '/clients/madawalateashop/assets/icon-192.png',
    '/clients/madawalateashop/assets/icon-512.png'
];

self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.allSettled(
                ASSETS.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('[SW] Cache add skipped:', url);
                    });
                })
            );
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.map(function(key) {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;
    if (url.includes('firestore.googleapis.com') || 
        url.includes('identitytoolkit.googleapis.com') || 
        url.includes('securetoken.googleapis.com') ||
        url.includes('google.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(function() {
                return caches.match(event.request).then(function(cached) {
                    if (cached) return cached;
                    if (event.request.mode === 'navigate') {
                        return caches.match('/clients/madawalateashop/index.html');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
