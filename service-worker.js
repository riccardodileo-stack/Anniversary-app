const APP_CACHE = "our-journey-shell-v3";
const RUNTIME_CACHE = "our-journey-runtime-v3";
const MAP_CACHE = "our-journey-map-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  const currentCaches = [APP_CACHE, RUNTIME_CACHE, MAP_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => !currentCaches.includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Le richieste di ricerca geografica devono sempre restare aggiornate.
  if (url.hostname.includes("nominatim.openstreetmap.org")) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    })));
    return;
  }

  // Le porzioni di mappa già viste vengono conservate per i successivi avvii offline.
  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(cacheFirst(request, MAP_CACHE));
    return;
  }

  // Leaflet viene memorizzato alla prima apertura; così l'interfaccia cartografica
  // può avviarsi anche senza rete e mostrare i segnaposto già salvati.
  if (url.hostname === "unpkg.com") {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Per la navigazione e i file locali: cache immediata, aggiornamento in background.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, APP_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response("Risorsa non disponibile offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(response => {
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  if (cached) {
    network.catch(() => null);
    return cached;
  }

  const response = await network;
  if (response) return response;
  if (request.mode === "navigate") return cache.match("./index.html");
  return new Response("Contenuto non disponibile offline", { status: 503, statusText: "Offline" });
}
