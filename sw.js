const V="sba-v3",SHELL=["./","./Index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=="GET")return;
  // Respons API Apps Script TIDAK pernah di-cache/di-intersep: selalu dari jaringan
  if(/(^|\.)(script\.google\.com|googleusercontent\.com)$/.test(u.hostname)||u.searchParams.has("action"))return;
  if(u.origin!==location.origin&&u.hostname!=="cdn.tailwindcss.com")return;
  // Stale-while-revalidate untuk shell (HTML/JS/CSS/ikon)
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||(r.mode==="navigate"?await c.match("./Index.html"):null)||Response.error();
  }));
});
