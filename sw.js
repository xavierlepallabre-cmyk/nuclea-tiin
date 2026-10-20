const CACHE='nuclea-tiin-v013';
const FONT_CACHE='nuclea-tiin-fonts';
const ASSETS=['./','./index.html','./style.css','./app.js','./assets/fonts/lexend-0.ttf','./assets/fonts/lexend-1.ttf','./assets/fonts/lexend-2.ttf','./assets/fonts/lexend-3.ttf','./assets/fonts/lexend-4.ttf','./assets/fonts/lexend.css','./isotopes.js','./decay-chain.js','./decay-calculator.js','./navigation.js','./formulas.js','./units.js','./nuclear-properties.js','./energy.js','./date-model.js','./date-ui.js','./exercises.js','./updates.js','./visuals.js','./visuels/decroissance.html','./visuels/attenuation.html','./visuels/distance.html','./visuels/desintegrations.html','./visuels/filiation.html','./SOURCES.md','./elements.json','./icon.svg','./manifest.webmanifest','./assets/logo-tocqueville.png','./assets/logo-bac-pro-tiin.png','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil((async()=>{const keys=await caches.keys();const legacy=keys.some(k=>/^nuclea-tiin-v0[3-8]/.test(k))&&!keys.some(k=>/^nuclea-tiin-v09/.test(k));const cache=await caches.open(CACHE);// cache:'reload' : télécharger chaque fichier depuis le serveur, jamais depuis le cache HTTP du navigateur,
 // sinon une mise à jour peut mélanger des fichiers de deux versions.
 await cache.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})));if(legacy)await self.skipWaiting()})()));
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nuclea-tiin-')&&k!==CACHE&&k!==FONT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;const url=new URL(e.request.url);
 if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
  e.respondWith(caches.open(FONT_CACHE).then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r}).catch(()=>new Response('',{status:503})))));return;
 }
 if(url.origin!==self.location.origin)return;
 // Version-consistent shell; new assets activate only after the user accepts the waiting worker.
 e.respondWith(caches.open(CACHE).then(async cache=>{
  const hit=await cache.match(e.request);if(hit)return hit;
  try{return await fetch(e.request)}catch(error){if(e.request.mode==='navigate')return await cache.match('./index.html');throw error}
 }));
});
