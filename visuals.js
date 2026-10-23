/* Phénomènes animés v0.10 : cartes de l'onglet Explorer et visionneuse plein écran.
   Les visuels sont des pages autonomes du dossier visuels/, chargées dans un cadre. */
(function(){
 const VISUALS=[
  {id:'decroissance',title:'Décroissance radioactive',text:'Des noyaux qui se désintègrent au hasard, et la loi qui en sort.',icon:'<path d="M4 5c3 0 4 9 8 11s5 2 8 2"/><path d="M4 20h16M4 4v16"/>'},
  {id:'attenuation',title:'Atténuation des gamma',text:'Un faisceau traverse un écran : CDA, CDT et transmission.',icon:'<path d="M3 12h5M16 12h5M17.5 9.5 21 12l-3.5 2.5"/><rect x="9" y="4" width="5" height="16" rx="1"/>'},
  {id:'distance',title:'Débit de dose et distance',text:'Source ponctuelle en 1/d², tuyauterie en 1/d.',icon:'<circle cx="6" cy="12" r="2"/><path d="M10 8a6 6 0 0 1 0 8M13.5 5a10 10 0 0 1 0 14M17 2.5a13.5 13.5 0 0 1 0 19"/>'},
  {id:'desintegrations',title:'Désintégrations α, β, γ',text:'Dans le noyau et dans le diagramme N-Z.',icon:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)"/>'},
  {id:'filiation',title:'Chaîne de filiation',text:'Équilibres séculaire et transitoire, générateur ⁹⁹Mo/⁹⁹ᵐTc.',icon:'<circle cx="6" cy="7" r="3"/><circle cx="18" cy="17" r="3"/><path d="M8.5 9 15.5 15"/><path d="M14 16.5l1.6-1.4.2 2.1"/>'}
 ];
 const grid=document.querySelector('#visualGrid'),viewer=document.querySelector('#visualViewer'),frame=document.querySelector('#visualFrame'),title=document.querySelector('#visualTitle');
 if(!grid||!viewer)return;
 let opener=null,open=null;
 for(const v of VISUALS){
  const b=document.createElement('button');b.type='button';b.className='visual-card';b.dataset.visual=v.id;
  b.innerHTML=`<span class="visual-icon"><svg aria-hidden="true" viewBox="0 0 24 24">${v.icon}</svg></span><span class="visual-text"><strong>${v.title}</strong><span>${v.text}</span></span><svg class="visual-go" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>`;
  b.onclick=()=>show(v,true);grid.append(b);
 }
 function show(v,push){
  opener=document.activeElement;open=v.id;
  title.textContent=v.title;frame.title=v.title;
  // replace() : charger le visuel sans ajouter d'entrée à l'historique, pour que Retour ferme la visionneuse.
  const url=new URL('visuels/'+v.id+'.html',location.href).href;
  if(frame.contentWindow.location.href!==url)frame.contentWindow.location.replace(url);
  viewer.hidden=false;document.body.classList.add('visual-open');
  if(push)history.pushState({...history.state,nucleaVisual:v.id},'');
  document.querySelector('#closeVisual').focus();
 }
 function hide(){
  if(!open)return;open=null;viewer.hidden=true;document.body.classList.remove('visual-open');
  frame.contentWindow.location.replace('about:blank');
  if(opener&&opener.focus)opener.focus();
 }
 function close(){if(!open)return;if(history.state?.nucleaVisual)history.back();else hide()}
 document.querySelector('#closeVisual').onclick=close;
 window.addEventListener('popstate',()=>{
  const id=history.state?.nucleaVisual;
  if(id){const v=VISUALS.find(x=>x.id===id);if(v&&open!==id)show(v,false)}else hide();
 });
 document.addEventListener('keydown',e=>{if(open&&e.key==='Escape'){e.preventDefault();close()}});
 // Ouverture depuis un autre module (parcours élève).
 window.NucleaVisuals={open:id=>{const v=VISUALS.find(x=>x.id===id);if(v)show(v,true)}};
 // Une page rechargée repart sur l'application : ne pas laisser un état de visionneuse orphelin.
 if(history.state?.nucleaVisual){const s={...history.state};delete s.nucleaVisual;history.replaceState(s,'')}
 // Le thème choisi dans l'application suit dans le visuel ouvert.
 new MutationObserver(()=>{try{const d=frame.contentDocument?.documentElement;if(!d)return;const t=document.documentElement.dataset.theme;if(t)d.dataset.theme=t;else delete d.dataset.theme}catch(e){}}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
