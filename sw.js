const CACHE_NAME = "atlas-bobines-pwa-20260708";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json?v=20260708",
    "./style.css",
    "./script.js?v=20260707-2355",
    "./firebase.js?v=20260707-2355",
    "./historicoBobina.js?v=20260707-2355",
    "./historicoAgropainel.js?v=20260707-2355",
    "./icon.png?v=20260708",
    "./icon-192.png?v=20260708",
    "./icon-512.png?v=20260708",
    "./apple-touch-icon.png?v=20260708",
    "./favicon-32.png?v=20260708"
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
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            });
        })
    );
});
