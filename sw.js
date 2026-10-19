const CACHE="nuclea-tiin-v06";
const FONT_CACHE="nuclea-tiin-fonts";
const ASSETS=["./","./index.html","./style.css","./app.js","./isotopes.js","./SOURCES.md","./elements.json","./icon.svg","./manifest.webmanifest","./assets/logo-tocqueville.png","./assets/logo-bac-pro-tiin.png","./assets/icon-192.png","./assets/icon-512.png","./assets/icon-maskable-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("nuclea-tiin-")&&k!==CACHE&&k!==FONT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  // Police Lexend (Google Fonts) : mise en cache au premier chargement pour l'usage hors connexion.
  if(url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open(FONT_CACHE).then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok||r.type==="opaque")c.put(e.request,r.clone());return r}).catch(()=>new Response("",{status:503})))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
