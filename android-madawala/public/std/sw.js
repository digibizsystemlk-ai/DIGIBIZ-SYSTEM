const CACHE_NAME = "digibiz-std-v1";
const PRECACHE_URLS = [
  // Core Entrypoints
  "/",
  "/index.html",
  "/std/modules/quick_billing/app.html",
  "/std/modules/quick_billing/app.js",
  "/std/modules/quick_billing/products.html",
  "/std/modules/quick_billing/customers.html",
  "/std/modules/quick_billing/credit.html",
  "/std/modules/quick_billing/user-manual.html",
  "/std/modules/quick_billing/manifest.json",
  "/std/modules/distributor/web/distributor-repapp.html",

  // Core Scripts & Framework
  "/std/core/pwa-init.js",
  "/std/core/firebase-init.js",
  "/std/core/sidebar.js",
  "/std/core/business-types.js",
  "/std/core/auth-roles.js",
  "/std/core/dashboard-core.js",
  "/std/core/aggregate-utils.js",
  "/std/core/subscription-manager.js",
  "/scripts/admin-impersonation.js",
  "/std/core/auth-utils.js",
  "/std/core/offline-auth.js",

  // Vendor Libraries
  "/std/assets/vendor/html2canvas.min.js",
  "/std/assets/vendor/sweetalert2.all.min.js",
  "/std/assets/vendor/firebase-app-compat.js",
  "/std/assets/vendor/firebase-auth-compat.js",
  "/std/assets/vendor/firebase-firestore-compat.js",

  // Manifests & Icons
  "/std/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg"
];

// Force immediate activation and precache critical offline assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache assets individually so one failure does not break the entire cache
      for (const url of PRECACHE_URLS) {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn('[SW] Precache item notice for ' + url + ':', e);
        }
      }
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

// Cache-First / Network-First with comprehensive Offline Fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip Firebase Auth, Firestore streams, and external Google APIs
  if (url.origin.includes('googleapis.com') || url.origin.includes('google.com') || url.origin.includes('gstatic.com') || url.origin.includes('firebaseio.com')) {
    return;
  }

  // 1. Navigation / HTML Requests: Network-First with smart offline fallback
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
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
          // A. Exact cached match
          let cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;

          // B. Direct pathname match
          cached = await caches.match(url.pathname);
          if (cached) return cached;

          // C. Quick Billing app fallback
          if (url.pathname.includes('/quick_billing/')) {
            const qbCached = await caches.match("/std/modules/quick_billing/app.html');
            if (qbCached) return qbCached;
          }

          // D. Distributor rep app fallback
          if (url.pathname.includes('/distributor/')) {
            const distCached = await caches.match("/std/modules/distributor/web/distributor-repapp.html');
            if (distCached) return distCached;
          }

          // E. Default root fallback
          const rootCached = await caches.match("/std/modules/quick_billing/app.html') || await caches.match('/');
          if (rootCached) return rootCached;

          return new Response('<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;color:#1e293b;"><h2>📶 Offline Mode Active</h2><p>Please check your connection or reopen the app from home screen.</p><button onclick="location.reload()" style="padding:10px 18px;background:#059669;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;">🔄 Retry</button></body></html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Scripts, CSS, and Assets: Network-First for real-time freshness, cache fallback for offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(event.request, { ignoreSearch: true });
        });
      })
  );
});
