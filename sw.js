const C='apex-v8.25';
const U=['./index.html','./manifest.json','./core.js?v=8.25','./data.js?v=8.25','./anatomy.js?v=8.25','./pathologies.js?v=8.25','./achievements.js?v=8.25','./state.js?v=8.25','./ui.js?v=8.25','./firebase-config.js?v=8.25','./sync.js?v=8.25','./muscles.svg'];
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
