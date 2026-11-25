const CACHE_NAME = 'nopEKONOMI-2026-11-25-v14';
const ASSETS = [
  './',
  './nopEKONOMI.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const accept = req.headers.get('accept') || '';
  const isHtml = req.mode === 'navigate' || accept.includes('text/html');
  if(isHtml){
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        return res;
      }).catch(err => {
        // #region agent log
        fetch('http://127.0.0.1:7378/ingest/d3775674-b797-47ef-a42a-ab3621e89ce9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5ad466'},body:JSON.stringify({sessionId:'5ad466',runId:'post-fix',hypothesisId:'E',location:'sw.js:fetch',message:'html fetch failed',data:{name:err&&err.name,message:String(err&&err.message||err).slice(0,180)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return caches.match(req);
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
