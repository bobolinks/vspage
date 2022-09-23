const version = 'v1.0.1';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(version).then(function (cache) {
      return cache.addAll([
        '/__ide__/',
        '/__ide__/index.html',
        '/__ide__/WAWebview-2.19.4.js',
      ]);
    })
  );
});

self.addEventListener('activate', function (event) {
  var cacheWhitelist = [version];

  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      const url = event.request.url.replace(/^(http[s]?:\/\/localhost:\d+\/)((?!__ide__|__rpc__|__fs__|__app__\/).*)(.+)$/, '$1__app__/$2$3');
      const request = new Request(url, {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'no-cors',
        credentials: event.request.credentials,
        redirect: 'follow'
      });
      return fetch(request).then(function (response) {
        return response;
      }).catch(function (error) {
        console.error('Fetching failed:', error);
        throw error;
      });
    })
  );
});
