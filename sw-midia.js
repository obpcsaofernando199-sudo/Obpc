/* Service worker do Estúdio de Mídia — só guarda o "esqueleto" do app.
   Nunca guarda Cloudinary, Firebase ou Workers (uploads e dados vão sempre direto). */
var VERSAO = 'midia-v2';
var ARQUIVOS = [
  './midia-estudio.html',
  './manifest-midia.json',
  './icone-midia-180.png',
  './icone-midia-192.png',
  './icone-midia-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSAO).then(function (c) {
      return Promise.all(ARQUIVOS.map(function (a) { return c.add(a).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== VERSAO && k.indexOf('midia-') === 0; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // só arquivos do próprio site
  // rede primeiro (sempre a versão mais nova); se estiver sem internet, usa o que está guardado
  e.respondWith(
    fetch(req).then(function (r) {
      if (r && r.ok) { var cp = r.clone(); caches.open(VERSAO).then(function (c) { c.put(req, cp); }); }
      return r;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('./midia-estudio.html'); });
    })
  );
});
