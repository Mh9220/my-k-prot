// My-k-prot : fonctionne hors ligne. Change VERSION à chaque mise à jour.
const VERSION = "my-k-prot-v3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== "fonts").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.host.includes("fonts.googleapis.com") || url.host.includes("fonts.gstatic.com")) {
    e.respondWith(caches.open("fonts").then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
  e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
    .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html"))));
});
