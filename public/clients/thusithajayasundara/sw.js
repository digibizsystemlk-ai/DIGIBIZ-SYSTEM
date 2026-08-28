// ================================================================
//  SERVICE WORKER - THUSITHA JAYASUNDARA COCONUT PRODUCTS PWA
// ================================================================

var CACHE_NAME = 'thusitha-coconut-pwa-v1';
var CORE_ASSETS = [
    '/clients/thusithajayasundara/index.html',
    '/clients/thusithajayasundara/',
    '/clients/thusithajayasundara/manifest.json'
];

// Install: Cache essential core files (ignore errors gracefully)
self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.allSettled(
                CORE_ASSETS.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('Could not cache asset:', url, err);
                    });
                })
            );
        })
    );
});

// Activate: Clean up older caches and claim clients immediately
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(name) {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch: Safe Network-First for navigation, Cache-First for static
self.addEventListener('fetch', function(event) {
    // Only handle GET requests and skip browser extensions / Firebase API endpoints
    if (event.request.method !== 'GET') return;
    var url = event.request.url;
    if (url.includes('firestore.googleapis.com') || 
        url.includes('identitytoolkit.googleapis.com') || 
        url.includes('securetoken.googleapis.com')) {
        return;
    }

    // For HTML navigation: Network first, fallback to cache
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(function(networkResponse) {
                    return caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(function() {
                    return caches.match(event.request).then(function(cachedResponse) {
                        if (cachedResponse) return cachedResponse;
                        return caches.match('/clients/thusithajayasundara/index.html');
                    });
                })
        );
        return;
    }

    // For other assets (images, fonts, stylesheets)
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    var responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(function() {
                // Ignore network failure for non-critical assets
            });
        })
    );
});
