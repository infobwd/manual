/* WD Books — static public-only offline app shell.
   Scope is limited to /manual/ by the SW registration in experience.js. */
const CACHE_VERSION = "wd-manual-public-v4-guide-20261023";
const CACHE_PREFIX = "wd-manual-public-";
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./assets/styles.css", "./assets/app-experience.css",
  "./assets/manuals-data.js", "./assets/wd-growth-individual-guide.js", "./assets/experience.js", "./assets/app.js",
  "./icons/icon-192.png", "./icons/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(APP_SHELL.map(path => new Request(path, { cache: "reload" })));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_VERSION).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  // Public GitHub Pages app shell only. Navigations may have credentials="include"
  // even on public Pages, so excluding those would break offline Home Screen launch.
  // Never cache unknown endpoints or requests carrying Authorization.
  if (request.headers.has("authorization")) return;
  const permitted = new Set(APP_SHELL.map(path => new URL(path, scope).pathname));
  if (!permitted.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const isNavigation = request.mode === "navigate";
    try {
      // Network-first prevents long-lived stale manuals after a Pages redeploy.
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await cache.match(request, { ignoreSearch: isNavigation });
      if (cached) return cached;
      if (isNavigation) {
        const fallback = await cache.match("./index.html");
        if (fallback) return fallback;
      }
      return Response.error();
    }
  })());
});