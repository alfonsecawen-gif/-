const CACHE_VERSION = "campus-market-v66";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./css/app.css",
    "./js/config.js",
    "./js/app.js",
    "./img/optimized/DSC00355-768.jpg",
    "./img/optimized/DSC00371_1-768.jpg",
    "./img/optimized/DSC00454-768.jpg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key.startsWith("campus-") && !key.startsWith(CACHE_VERSION))
                .map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.pathname.includes("/api/")) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (request.destination === "document") {
        event.respondWith(networkFirst(request).catch(() => caches.match("./index.html")));
        return;
    }

    if (["style", "script"].includes(request.destination)) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (["image", "font"].includes(request.destination)) {
        event.respondWith(cacheFirst(request));
    }
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response && response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
    }
    return response;
}

async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
    }
}
