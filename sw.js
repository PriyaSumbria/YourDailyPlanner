
const CACHE_NAME = 'aether-planner-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});

// Listener for background messages if we ever use Push API
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Aether Planner', body: 'New Alert' };
    const options = {
        body: data.body,
        icon: '/icon.png', // Optional icon
        badge: '/badge.png', // Optional badge
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            { action: 'explore', title: 'Open App' },
            { action: 'close', title: 'Close' },
        ]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});
