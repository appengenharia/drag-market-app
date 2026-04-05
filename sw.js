var CACHE_VERSION = 'market-car-v-1775414126';
var APP_CACHE = CACHE_VERSION;
var CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-config.js',
  './manifest.json',
  './logo.svg',
  './icon-48.png',
  './icon-72.png',
  './icon-96.png',
  './icon-192.png',
  './icon-512.png'
];

function cacheCoreAssets() {
  return caches.open(APP_CACHE).then(function (cache) {
    return Promise.all(
      CORE_ASSETS.map(function (asset) {
        return cache.add(asset).catch(function () {
          return null;
        });
      })
    );
  });
}

function isExternalRequest(url) {
  return url.origin !== self.location.origin;
}

function isHtmlRequest(request) {
  var acceptHeader = request.headers.get('accept') || '';

  return request.mode === 'navigate' || request.destination === 'document' || acceptHeader.indexOf('text/html') !== -1;
}

function isScriptStyleOrManifestRequest(request, url) {
  var pathname = url.pathname.toLowerCase();

  return request.destination === 'script' || request.destination === 'style' || pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('manifest.json');
}

function isImageRequest(request, url) {
  return request.destination === 'image' || /\.(png|svg|jpg|jpeg|webp|gif|ico)$/i.test(url.pathname);
}

function cacheResponse(request, response) {
  if (!response || !response.ok) {
    return response;
  }

  return caches.open(APP_CACHE).then(function (cache) {
    cache.put(request, response.clone());
    return response;
  });
}

function networkFirst(request) {
  return fetch(request)
    .then(function (response) {
      return cacheResponse(request, response);
    })
    .catch(function () {
      return caches.match(request).then(function (cachedResponse) {
        return cachedResponse || caches.match('./index.html');
      });
    });
}

function staleWhileRevalidate(request) {
  return caches.open(APP_CACHE).then(function (cache) {
    var cachedResponsePromise = cache.match(request);
    var networkResponsePromise = fetch(request)
      .then(function (response) {
        return cacheResponse(request, response);
      })
      .catch(function () {
        return null;
      });

    return cachedResponsePromise.then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return networkResponsePromise.then(function (networkResponse) {
        return networkResponse || caches.match('./index.html');
      });
    });
  });
}

function cacheFirst(request) {
  return caches.match(request).then(function (cachedResponse) {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(request)
      .then(function (response) {
        return cacheResponse(request, response);
      })
      .catch(function () {
        return null;
      });
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(cacheCoreAssets());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== APP_CACHE) {
            return caches.delete(key);
          }

          return null;
        })
      ).then(function () {
        return self.clients.claim();
      });
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  var url;

  if (request.method !== 'GET') {
    return;
  }

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  url = new URL(request.url);

  if (isExternalRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (isHtmlRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isScriptStyleOrManifestRequest(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

