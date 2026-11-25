// Кэширует приложение, чтобы оно открывалось без интернета (режим PWA).
var CACHE = "neon-goals-v4";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    var old = ks.filter(function (k) { return k !== CACHE; });
    return Promise.all(old.map(function (k) { return caches.delete(k); })).then(function () { return old.length > 0; });
  }).then(function (hadOld) {
    return self.clients.claim().then(function () {
      if (!hadOld) return;
      return self.clients.matchAll({ type: "window" }).then(function (cs) { cs.forEach(function (c) { c.navigate(c.url); }); });
    });
  }));
});
// Сначала сеть (чтобы обновления доходили), без сети берётся копия из кэша.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request); }));
});
