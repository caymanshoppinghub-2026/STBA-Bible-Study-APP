self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.clients.claim().then(function() {
      return caches.keys();
    }).then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function(clients) {
      return Promise.all(
        clients.map(function(client) {
          if (client && 'navigate' in client) {
            return client.navigate(client.url).catch(function() {});
          }
          return Promise.resolve();
        })
      );
    }).then(function() {
      return self.registration.unregister();
    })
  );
});
