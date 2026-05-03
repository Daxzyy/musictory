const CACHE = 'musictory-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/silence.wav', '/']))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('silence.wav')) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});

self.addEventListener('message', e => {
  if (e.data === 'keepAlive') {
    e.waitUntil(Promise.resolve());
  }
});
