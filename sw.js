const CACHE_NAME = "atlas-bobines-pwa-20260711-4";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json?v=20260711-4",
    "./style.css",
    "./script.js?v=20260711-4",
    "./firebase.js?v=20260707-2355",
    "./historicoBobina.js?v=20260707-2355",
    "./historicoAgropainel.js?v=20260707-2355",
    "./icon.png?v=20260711-4",
    "./icon-72x72.png?v=20260711-4",
    "./icon-96x96.png?v=20260711-4",
    "./icon-128x128.png?v=20260711-4",
    "./icon-144x144.png?v=20260711-4",
    "./icon-152x152.png?v=20260711-4",
    "./icon-180x180.png?v=20260711-4",
    "./icon-192x192.png?v=20260711-4",
    "./icon-maskable-192x192.png?v=20260711-4",
    "./icon-384x384.png?v=20260711-4",
    "./icon-512x512.png?v=20260711-4",
    "./icon-maskable-512x512.png?v=20260711-4",
    "./favicon-16x16.png?v=20260711-4",
    "./favicon-32x32.png?v=20260711-4",
    "./favicon.ico?v=20260711-4",
    "./apple-touch-icon.png?v=20260711-4"
];

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key.startsWith("atlas-bobines-pwa-") && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
