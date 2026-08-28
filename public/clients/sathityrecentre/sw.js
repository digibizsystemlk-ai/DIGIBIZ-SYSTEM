// ================================================================
//  SERVICE WORKER - BULLETPROOF PWA OFFLINE SUPPORT
// ================================================================

var CACHE_NAME = 'sathi-tyre-pwa-v5';
var CORE_ASSETS = [
    '/clients/sathityrecentre/mobile.html',
    '/clients/sathityrecentre/mobile',
    '/clients/sathityrecentre/index.html',
    '/clients/sathityrecentre/manifest.json'
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
                .then(function(response) {
                    if (response && response.status === 200) {
                        var responseClone = response.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(function() {
                    return caches.match(event.request).then(function(cached) {
                        if (cached) return cached;
                        return caches.match('/clients/sathityrecentre/mobile.html').then(function(fallback) {
                            if (fallback) return fallback;
                            return caches.match('/clients/sathityrecentre/mobile');
                        });
                    });
                })
        );
        return;
    }

    // For other assets (CSS, JS, images, fonts): Cache first, fallback to network
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                // Return cached version and fetch fresh in background
                fetch(event.request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(function() {});
                return cachedResponse;
            }

            return fetch(event.request).then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    var responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});
