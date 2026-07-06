const CACHE_NAME = 'astrovax-automint-v1';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// شبكة أولاً لأي طلب API (أسعار حية، أوامر تداول)، وملف محلي احتياطي فقط لهيكل الصفحة نفسها
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isAppShell = APP_SHELL.some((f) => url.endsWith(f.replace('./', '')));
  if (!isAppShell) return; // اترك كل طلبات API تذهب للشبكة مباشرة دائماً، بلا أي تخزين مؤقت لبيانات التداول

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
