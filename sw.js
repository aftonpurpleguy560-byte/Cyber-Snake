self.addEventListener('install', (e) => {
  console.log('Cyber Snake Service Worker Kuruldu!');
});

// Basit bir bildirim gönderme fonksiyonu
self.addEventListener('push', (e) => {
  const options = {
    body: 'Yeni rekor kırmaya hazır mısın?',
    icon: 'icon.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };
  e.waitUntil(self.registration.showNotification('Cyber Snake', options));
});

