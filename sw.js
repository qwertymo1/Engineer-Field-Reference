/* Engineer Field Reference service worker - build eb9570b95a */
const VER='eb9570b95a';
const SHELL='efr-shell-'+VER;
const IMGS='efr-images-v1';
const CORE=["./", "index.html", "app.js?v=eb9570b95a", "content.json?v=eb9570b95a", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(SHELL).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>(k.startsWith('efr-shell-')&&k!==SHELL)?caches.delete(k):null));
    await self.clients.claim();
  })());
});
self.addEventListener('message',e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;
  // images: cache-first (fill the cache as pages are viewed; survive offline after)
  if(url.pathname.indexOf('/images/')!==-1){
    e.respondWith(caches.open(IMGS).then(async c=>{
      const hit=await c.match(req); if(hit) return hit;
      try{ const res=await fetch(req); if(res&&res.ok) c.put(req,res.clone()); return res; }
      catch(err){ return hit||Response.error(); }
    }));
    return;
  }
  // shell + content: network-first so updates land fast, fall back to cache offline
  e.respondWith((async()=>{
    try{
      const res=await fetch(req);
      if(res&&res.ok){ const c=await caches.open(SHELL); c.put(req,res.clone()); }
      return res;
    }catch(err){
      const c=await caches.open(SHELL);
      const hit=await c.match(req) || await c.match('index.html') || await c.match('./');
      return hit||Response.error();
    }
  })());
});
