/* CYBER SNAKE - OFFLINE SERVICE WORKER
   Purpleguy © 2026 - tablet power 
*/

const CACHE_NAME = 'cyber-snake-v2';

// Önbelleğe alınacak dosyalar (Vercel'deki dosya isimlerinle aynı olmalı)
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/528/528105.png'
];

// Kurulum: Dosyaları hafızaya al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Siber Önbellek Hazırlanıyor...');
      return cache.addAll(assets);
    })
  );
});

// Aktivasyon: Eski önbellekleri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Getirme: İnternet yoksa hafızadaki dosyayı kullan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Bildirim Yakalayıcı (İleride Push Notification kullanırsan)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Yeni bir siber mesajın var!',
        icon: 'https://cdn-icons-png.flaticon.com/512/528/528105.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/528/528105.png'
    };
    event.waitUntil(
        self.registration.showNotification('Cyber Snake', options)
    );
});
