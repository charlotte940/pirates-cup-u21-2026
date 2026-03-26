// Firebase Messaging Service Worker
// This file must be in the public folder to be registered at the root scope

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration - Production
const firebaseConfig = {
  apiKey: 'AIzaSyB9Vm8F4mfWE81OHv3lIZvzQFsBJZAnw6s',
  authDomain: 'pirates-cup-u21-2026.firebaseapp.com',
  projectId: 'pirates-cup-u21-2026',
  storageBucket: 'pirates-cup-u21-2026.firebasestorage.app',
  messagingSenderId: '472150788224',
  appId: '1:472150788224:web:b0678aef5ac6a1c9317e65',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Pirates Cup U21';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification',
    icon: payload.notification?.icon || '/pirates-logo.png',
    badge: '/pirates-logo.png',
    tag: payload.data?.tag || 'pirates-cup-notification',
    requireInteraction: payload.data?.requireInteraction === 'true',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Default action: open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        const urlToOpen = notificationData?.url || '/';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push event (for custom push notifications)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push received:', event);

  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Pirates Cup U21';
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/pirates-logo.png',
      badge: '/pirates-logo.png',
      tag: data.tag || 'pirates-cup-push',
      data: data,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle service worker install
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installing');
  self.skipWaiting();
});

// Handle service worker activate
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activating');
  event.waitUntil(self.clients.claim());
});
