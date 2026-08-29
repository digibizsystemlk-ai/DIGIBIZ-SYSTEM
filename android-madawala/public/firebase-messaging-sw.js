/**
 * DIGIBIZ Web Push Notifications — Firebase Cloud Messaging Service Worker
 * Handles background push notifications when the app/browser is in background or closed.
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
    apiKey: "AIzaSyBLFefSjFXp84Hg7nnIfuJ18SFcM92bsno",
    authDomain: "digibiz-sys.firebaseapp.com",
    projectId: "digibiz-sys",
    storageBucket: "digibiz-sys.firebasestorage.app",
    messagingSenderId: "761278318158",
    appId: "1:761278318158:web:f4451f5cf5f8762192a51f"
});

const messaging = firebase.messaging();

// Handle Background Push Notification Payload
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationData = payload.notification || {};
    const data = payload.data || {};

    const notificationTitle = notificationData.title || data.title || '📰 DIGIBIZ Update';
    const notificationOptions = {
        body: notificationData.body || data.body || 'නවතම පද්ධති යාවත්කාලීනයක් හෝ භාවිත උපදෙසක් පළ විය.',
        icon: notificationData.icon || data.icon || '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        data: {
            url: data.url || (data.postId ? `/blog.html?id=${data.postId}` : '/blog.html'),
            postId: data.postId || ''
        },
        vibrate: [200, 100, 200],
        tag: data.postId ? `digibiz-blog-${data.postId}` : 'digibiz-blog-notification',
        renotify: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Click & Window Focus/Navigation
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Notification click received:', event.notification);
    event.notification.close();

    const targetUrl = (event.notification.data && event.notification.data.url) 
        ? event.notification.data.url 
        : '/blog.html';

    const fullUrl = new URL(targetUrl, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            // If already open, focus and navigate
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('/blog.html') && 'focus' in client) {
                    client.navigate(fullUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(fullUrl);
            }
        })
    );
});
