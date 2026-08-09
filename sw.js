/* Joshua Dia portfolio — minimal service worker
   network-first for pages (always fresh), cache fallback for offline */
var VERSION = "jd-v1";
var CORE = [
  "./",
  "index.html",
  "joshua-portrait.jpg",
  "favicon.svg",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  /* pages: network first, fall back to cache when offline */
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(function (res) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
          return res;
        })
        .catch(function () {
          return caches.match(e.request).then(function (m) { return m || caches.match("index.html"); });
        })
    );
    return;
  }

  /* assets: cache first, then network (and cache what we fetch) */
  e.respondWith(
    caches.match(e.request).then(function (m) {
      return (
        m ||
        fetch(e.request).then(function (res) {
          if (res.ok && e.request.url.indexOf(self.location.origin) === 0) {
            var copy = res.clone();
            caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
          }
          return res;
        })
      );
    })
  );
});
