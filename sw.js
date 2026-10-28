// Guarda a página no aparelho para abrir sem internet.
// Ao publicar uma base nova, troque a versão para forçar a atualização.
const VERSAO = 'wilson-2026-10-19';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Cache primeiro; se faltar, rede. Só guarda respostas do próprio site.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(guardado => guardado || fetch(e.request).then(r => {
      if (r.ok) {
        const copia = r.clone();
        caches.open(VERSAO).then(c => c.put(e.request, copia));
      }
      return r;
    }))
  );
});
