// Service Worker do site OBPC Jardim São Fernando
// v2: só guarda arquivos do próprio site. Antes ele tentava guardar também a rádio ao vivo
// (que nunca termina), vídeos e o Firebase — isso enchia a memória do celular sem necessidade.
const CACHE_NAME = 'obpc-sf-cache-v2';

// Arquivos essenciais para funcionar offline
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instala o service worker e guarda os arquivos essenciais em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Remove caches antigos quando uma nova versão é instalada (o Estúdio de Mídia tem o seu, "midia-…", que fica)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key.indexOf('midia-') !== 0)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro (conteúdo sempre atualizado);
// se falhar (sem internet), usa o que estiver em cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // rádio, Firebase, Cloudinary, YouTube: direto da internet
  if (req.headers.has('range')) return;               // pedaços de áudio/vídeo: não guardar

  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.ok && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(req).then((m) => m || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
