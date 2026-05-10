// Service worker iptal edildi ve hafiza temizleniyor
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map(key => caches.delete(key)));
        })
    );
});

self.addEventListener('fetch', (e) => {
    // Hafizadan degil, her zaman internetten/sunucudan cek
    e.respondWith(fetch(e.request));
});
