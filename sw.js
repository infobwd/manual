/* WD Books — static public-only offline app shell.
   Update 1.3.65: FLIP-10 unified phone and tablet reader controls;
   release version imported without stale HTTP cache reuse;
   Scope is limited to /manual/ by the SW registration in experience.js. */
importScripts("./assets/app-version.js");
const CACHE_VERSION = "wd-manual-public-" + self.WD_BOOKS_VERSION;
const CACHE_PREFIX = "wd-manual-public-";
// A new version preloads the entire shell atomically before it can activate.
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./assets/app-version.js", "./assets/audio-reader.css", "./assets/audio-reader-core.js", "./assets/audio-reader.js", "./assets/audio-listening-lock.js", "./assets/styles.css", "./assets/app-experience.css", "./assets/mobile-reader.css", "./assets/google-sans-platform.css", "./assets/home-p0a.css", "./assets/toc-p0b.css",
  "./assets/reader-flip-choice.css", "./assets/home-load-guard.js", "./assets/teleprompter-core.js", "./assets/teleprompter.js", "./assets/teleprompter.css", "./assets/flipbook-capability.js", "./assets/manuals-data.js", "./assets/wd-growth-individual-guide.js", "./assets/wd-growth-plc-information-guide.js", "./assets/bwd-term2-supervision-readiness-2569.js", "./assets/experience.js", "./assets/catalog-core.js", "./assets/catalog-ui.js", "./assets/mybooks-selectors.js", "./assets/reader-coordinator.js", "./assets/app.js", "./assets/app-zoom-guard.js",
  "./icons/icon-192.png", "./icons/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(APP_SHELL.map(path => new Request(path, { cache: "reload" })));
    // Wait for the user's confirmation before activating an update.
  })());
});
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
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
    // Avoid mixing active cached JavaScript with a newer HTML release.
    if (!isNavigation && (url.pathname.endsWith(".js") || url.pathname.endsWith(".css"))) {
      const stable = await cache.match(new Request(url.origin + url.pathname), { ignoreSearch: true });
      if (stable) return stable;
    }
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