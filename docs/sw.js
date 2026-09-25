/* Página de Benny: sin conexión, cualquier navegación muestra el 404 cacheado.
   La copia se refresca en cada navegación con red, así nunca queda vieja. */
const CACHE = "benny-offline";
const OFFLINE = new URL("404.html", self.location).pathname;
const refresh = () => caches.open(CACHE).then(c => c.add(OFFLINE));

self.addEventListener("install", e => {
  e.waitUntil(refresh().then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  const res = fetch(e.request);
  e.respondWith(res.catch(() => caches.match(OFFLINE)));
  e.waitUntil(res.then(refresh).catch(() => {}));
});
