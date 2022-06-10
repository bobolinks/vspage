self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      const url = event.request.url.replace(/^(http[s]?:\/\/localhost:\d+\/)((?!__wesim__|__rpc__|__FS__|__app__\/).*)(.+)$/, '$1__app__/$2$3');
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
