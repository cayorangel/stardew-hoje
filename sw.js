// Guarda a página no aparelho para abrir sem internet.
// A página busca primeiro na rede (para receber atualizações) e usa a cópia guardada se estiver sem sinal.
// Ícones e manifesto: usa a cópia guardada e atualiza em segundo plano.
const CACHE = 'stardew-hoje-v1';
const CORE = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Só guarda respostas boas (nada de página de erro ou de login de Wi-Fi público)
const good = res => res && (res.ok || res.type === 'opaque');

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Página: rede primeiro, cópia guardada se cair
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put('./', copy))); }
        return res;
      }).catch(() => caches.match('./').then(r => r || caches.match('index.html')))
    );
    return;
  }

  // Fontes do Google e arquivos do próprio site: cópia guardada na hora, atualização em segundo plano
  const isFont = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  if (isFont || url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(hit => {
      const update = fetch(req).then(res => {
        if (good(res)) { const copy = res.clone(); return caches.open(CACHE).then(c => c.put(req, copy)).then(() => res); }
        return res;
      });
      e.waitUntil(update.catch(() => {}));
      return hit || update;
    }));
  }
  // O resto (sincronização) vai direto para a rede
});
