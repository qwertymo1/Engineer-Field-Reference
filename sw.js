/* Engineer Field Reference service worker - build b85ce19884 */
const VER='b85ce19884';
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
      try{ const res=await tfetch(req,{},15000); if(res&&res.ok) c.put(req,res.clone()); return res; }
      catch(err){ return Response.error(); }
    }));
    return;
  }
  // Everything else is CACHE-FIRST from this build's precached shell, so the app opens
  // instantly with no signal -- even when the phone's network hangs instead of failing
  // (airplane mode / no bars).  Updates still arrive: the browser re-checks sw.js on every
  // launch with signal; a new build installs a new SW that precaches the new shell,
  // takes over, and the page reloads onto it.
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      const c=await caches.open(SHELL);
      const hit=(await c.match('index.html'))||(await c.match('./'));
      if(hit) return hit;
      try{ return await tfetch(req.url,{credentials:'same-origin'},8000); }
      catch(err){ return Response.error(); }
    })());
    return;
  }
  e.respondWith((async()=>{
    const c=await caches.open(SHELL);
    const hit=(await c.match(bare(url)))||(await c.match(req,{ignoreSearch:true}));
    if(hit) return hit;
    try{ const res=await tfetch(req,{cache:'no-cache'},20000); if(res&&res.ok) c.put(bare(url),res.clone()); return res; }
    catch(err){ return Response.error(); }
  })());
});
// fetch that gives up instead of waiting forever on a dead connection
function tfetch(r,o,ms){
  const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),ms);
  return fetch(r,Object.assign({},o,{signal:ac.signal})).finally(()=>clearTimeout(t));
}
