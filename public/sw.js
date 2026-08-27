// Barbershop Counter — minimal PWA service worker.
//
// SAFETY RULES:
// - Only GET requests are intercepted.
// - Only a small allowlist of safe, immutable static shell assets are cached.
// - Never cache POST/authenticated mutations: server actions (login/logout/
//   counter updates/jornada) are POST-only, so they fall through to network.
// - All other GET requests (pages, API, /counter, /admin) are network-first
//   and never cached, so session data is never stored offline.
// - Serves fresh data by default; offline is best-effort for the shell only.

const CACHE_NAME = "bshopcounter-shell-v1";
const PRECACHE = [
  "/",
  "/barber-pole-bg.svg",
  "/pwa-icon-192.png",
  "/pwa-icon-512.png",
  "/pwa-icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isShellAsset(url) {
  return (
    url.pathname === "/barber-pole-bg.svg" ||
    url.pathname.startsWith("/pwa-icon-") ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname.startsWith("/_next/static/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never handle non-GET (POST = login/logout/updates/server actions).
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Static shell assets (immutable): cache-first with network fallback.
  if (isShellAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Everything else (pages, /counter, /admin, API): network-first, never cached.
  event.respondWith(
    fetch(request).catch(() => caches.match("/")),
  );
});
