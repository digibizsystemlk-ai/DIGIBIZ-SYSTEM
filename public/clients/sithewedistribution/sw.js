// sw.js - Service Worker for Sithewe Distribution
const CACHE_NAME = 'digibiz-suite-v2028-refresh-1788193896153';
const ASSETS_TO_CACHE = [
    '/clients/sithewedistribution/',
    '/clients/sithewedistribution/index.html',
    '/clients/sithewedistribution/manifest.json',
    '/clients/sithewedistribution/assets/icon-192.png',
    '/clients/sithewedistribution/assets/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Sithewe SW] Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                    console.warn('[Sithewe SW Cache addAll non-critical error]', err);
                });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;

    if (url.includes('firestore.googleapis.com') || 
        url.includes('identitytoolkit.googleapis.com') || 
        url.includes('securetoken.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then(cached => {
                        if (cached) return cached;
                        if (event.request.mode === 'navigate' || (event.request.headers && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
                            return caches.match('/clients/sithewedistribution/index.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});
