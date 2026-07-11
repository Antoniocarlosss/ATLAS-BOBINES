const CACHE_NAME = "atlas-bobines-pwa-20260711";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./style.css",
    "./script.js?v=20260707-2355",
    "./firebase.js?v=20260707-2355",
    "./historicoBobina.js?v=20260707-2355",
    "./historicoAgropainel.js?v=20260707-2355",
    "./icon.png",
    "./icon-72x72.png",
    "./icon-96x96.png",
    "./icon-128x128.png",
    "./icon-144x144.png",
    "./icon-152x152.png",
    "./icon-180x180.png",
    "./icon-192x192.png",
    "./icon-192.png",
    "./icon-384x384.png",
    "./icon-512x512.png",
    "./icon-512.png",
    "./favicon-16x16.png",
    "./favicon-32x32.png",
    "./favicon.ico",
    "./apple-touch-icon.png"
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
