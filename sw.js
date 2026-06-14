const CACHE_NAME = "flashcards-v16";
const ASSETS = [
  "./",
  "./index.html",
  "./info.html",
  "./credits.html",
  "./styles.css",
  "./app.js",
  "./data/flashcards.json",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./images/puzzles/studeren1.jpg",
  "./images/puzzles/studeren2.jpg",
  "./images/puzzles/studeren3.jpg",
  "./images/puzzles/studeren4.jpg",
  "./images/puzzles/studeren5.jpg",
  "./images/puzzles/studeren6.jpg",
  "./images/puzzles/studeren7.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
