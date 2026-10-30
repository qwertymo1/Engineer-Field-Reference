/* Engineer Field Reference service worker - build 4c75d624ee */
const VER='4c75d624ee';
const SHELL='efr-shell-'+VER;
const IMGS='efr-images-v1';
const CORE=["./", "index.html", "app.js", "content.json", "pmcs.json", "pdf-lib.min.js", "da2404-blank.pdf", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener('install',e=>{
  // cache:'reload' bypasses the browser HTTP cache so a new SW never precaches stale files
  e.waitUntil(caches.open(SHELL).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
function bare(u){return u.origin+u.pathname;}
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
  // navigations: network-first, fall back to the cached app shell when offline
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{ const res=await fetch(req.url,{cache:'no-cache',credentials:'same-origin'}); if(res&&res.ok){const c=await caches.open(SHELL);c.put('index.html',res.clone());} return res; }
      catch(err){ const c=await caches.open(SHELL); return (await c.match('index.html'))||(await c.match('./'))||Response.error(); }
    })());
    return;
  }
  // shell assets (app.js, content.json, manifest, icons): network-first with the HTTP cache
  // bypassed (no-cache), stored under the bare path; offline falls back to the SAME resource
  // -- never the HTML shell for a script/json request
  e.respondWith((async()=>{
    const c=await caches.open(SHELL);
    try{ const res=await fetch(req,{cache:'no-cache'}); if(res&&res.ok) c.put(bare(url),res.clone()); return res; }
    catch(err){ const hit=(await c.match(bare(url)))||(await c.match(req,{ignoreSearch:true})); return hit||Response.error(); }
  })());
});
