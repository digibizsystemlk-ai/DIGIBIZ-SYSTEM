// sw.js - Enhanced Service Worker for Delight Bakers Rep App

const CACHE_NAME = 'delightbakers-repapp-v3';
const ASSETS_TO_CACHE = [
    '/clients/delightbakers/',
    '/clients/delightbakers/index.html',
    '/clients/delightbakers/manifest.json',
    '/clients/delightbakers/assets/icon-192.png',
    '/clients/delightbakers/assets/icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                    console.warn('[SW Cache addAll non-critical error]', err);
                });
            })
    );
});

// Activate event - clean old caches
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

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;

    // Skip firestore & auth endpoints
    if (url.includes('firestore.googleapis.com') || 
        url.includes('identitytoolkit.googleapis.com') || 
        url.includes('securetoken.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request)
                    .then(cached => {
                        if (cached) return cached;
                        // Return index.html for navigate requests
                        if (event.request.mode === 'navigate' || (event.request.headers && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
                            return caches.match('/clients/delightbakers/index.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});
