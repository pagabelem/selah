const C = "selah-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || r.url.includes("/api/")) return;
  e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(C).then((x) => x.put(r, c)); return res; }).catch(() => caches.match(r).then((m) => m || caches.match("/"))));
});
self.addEventListener("push", (e) => {
  const d = e.data ? e.data.json() : { title: "Selah", body: "" };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "/icon.svg", data: { url: d.url || "/" } }));
});
self.addEventListener("notificationclick", (e) => { e.notification.close(); e.waitUntil(clients.openWindow(e.notification.data.url)); });
