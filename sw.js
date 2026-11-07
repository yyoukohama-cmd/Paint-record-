const CACHE = 'aic-paint-v40';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png', 'favicon-64.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Online: always take the newest file. Offline: use the saved copy.
self.addEventListener('push', e => { let d = {}; try { d = e.data.json(); } catch (x) { d = { ti: 'AIC Paint Record', m: e.data ? e.data.text() : '' }; } let h = 0; const t = String(d.m || ''); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => { if (l.some(c => c.visibilityState === 'visible')) return; return self.registration.showNotification(d.ti || 'AIC Paint Record', { body: d.m || '', icon: 'icon-192.png', badge: 'favicon-64.png', tag: 'aic-' + (h >>> 0), data: { g: d.g || null } }); })); });
self.addEventListener('notificationclick', e => { e.notification.close(); const g = (e.notification.data || {}).g || null; e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => { if (l.length) { const c = l[0]; if (g) c.postMessage({ type: 'aic-nav', g }); return c.focus(); } return self.clients.openWindow('./' + (g ? '#nav=' + encodeURIComponent(JSON.stringify(g)) : '')); })); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
