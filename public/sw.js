const CACHE_NAME = 'cinebai-tmdb-metadata-v1';
const TMDB_API_ORIGIN = 'https://api.themoviedb.org';
const MEDIA_EXTENSION_RE = /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|m3u8|ts|mp3|ogg)$/i;

function isCacheableTmdbMetadataRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== TMDB_API_ORIGIN) return false;
  if (MEDIA_EXTENSION_RE.test(url.pathname)) return false;
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (!isCacheableTmdbMetadataRequest(event.request)) {
    return;
  }

  const cacheKey = event.request.url;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(cacheKey, { ignoreVary: true });

      const networkPromise = fetch(event.request)
        .then((response) => {
          const contentType = response.headers.get('content-type') || '';
          if (response.ok && response.type !== 'opaque' && contentType.includes('application/json')) {
            void cache.put(cacheKey, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkPromise);
        return cached;
      }

      const networkResponse = await networkPromise;
      if (networkResponse) {
        return networkResponse;
      }

      return new Response(JSON.stringify({ status_message: 'Offline and uncached' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  );
});
