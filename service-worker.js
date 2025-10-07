// service-worker.js
const CACHE_NAME = 'webar-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './nav.html',
  './manifest.json',
  './offline.html',
  './assets/hiro_preview.svg'
];

/**
 * Install: cache core assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // cache.addAll will reject if any resource fails — we catch and continue to avoid broken installs
      try {
        await cache.addAll(ASSETS);
      } catch (err) {
        // Fallback: add individually and ignore individual failures
        console.warn('cache.addAll failed, falling back to individual caching', err);
        for (const asset of ASSETS) {
          try {
            await cache.add(asset);
          } catch (e) {
            console.warn('failed to cache', asset, e);
          }
        }
      }
    })()
  );

  // Make this service worker take control more quickly
  self.skipWaiting();
});

/**
 * Activate: remove old caches and claim clients
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return Promise.resolve();
        })
      );
      await self.clients.claim();
    })()
  );
});

/**
 * Fetch: handle requests
 *
 * - Navigation (HTML) -> network-first, fallback to cache -> final fallback offline.html
 * - Other GET requests -> cache-first with background update (stale-while-revalidate)
 */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  const acceptHeader = req.headers.get('Accept') || '';

  // Treat navigations and HTML requests as navigation requests
  const isNavigation = req.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for HTML so users get newest content
          const networkResponse = await fetch(req);
          // Update cache copy for offline use
          const cache = await caches.open(CACHE_NAME);
          // Put a clone in cache (don't await to speed up response)
          cache.put(req, networkResponse.clone()).catch(() => {});
          return networkResponse;
        } catch (err) {
          // On network failure, try cached page, then offline fallback
          const cached = await caches.match(req);
          if (cached) return cached;
          const indexCached = await caches.match('./index.html');
          if (indexCached) return indexCached;
          const offline = await caches.match('./offline.html');
          if (offline) return offline;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // For other assets (images, scripts, css, etc.) use cache-first with background update
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResp = await cache.match(req);
      if (cachedResp) {
        // Update cache in background (stale-while-revalidate)
        event.waitUntil(
          (async () => {
            try {
              const fresh = await fetch(req);
              if (fresh && fresh.ok) {
                await cache.put(req, fresh.clone());
              }
            } catch (e) {
              /* network update failed; ignore */
            }
          })()
        );
        return cachedResp;
      }

      // no cached resource -> try network, cache and return it
      try {
        const netResp = await fetch(req);
        if (netResp && netResp.ok) {
          // Try to cache, but don't block returning the response
          cache.put(req, netResp.clone()).catch(() => {});
        }
        return netResp;
      } catch (err) {
        // final fallback: try a generic cached asset (root) or offline page
        const fallback = await caches.match('./');
        return fallback || (await caches.match('./offline.html')) || new Response('Offline', { status: 503 });
      }
    })()
  );
});
