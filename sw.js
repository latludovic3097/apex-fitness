const C='apex-v8.23';
const U=['./index.html','./manifest.json','./core.js?v=8.23','./data.js?v=8.23','./anatomy.js?v=8.23','./pathologies.js?v=8.23','./achievements.js?v=8.23','./state.js?v=8.23','./ui.js?v=8.23','./firebase-config.js?v=8.23','./sync.js?v=8.23','./muscles.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(U))));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.hostname.includes('gstatic.com')||url.hostname.includes('googleapis.com')||url.hostname.includes('firebaseio.com')){
    e.respondWith(fetch(e.request).catch(()=>new Response('',{status:503})));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.status===200){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl));}return res;}).catch(()=>caches.match('./index.html'))));
});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
