(function(root){
 const U_MEV=931.49410372,M_H=1.007825031898,M_N=1.0086649159;
 function binding(row){
  if(!row||!Number.isInteger(row.z)||!Number.isInteger(row.a)||row.z<1||row.a<row.z)throw Error('Propriétés absentes ou isotope invalide.');
  const mass=row.massMicroU!==''?Number(row.massMicroU)/1e6:null;
  const ref=row.bindingKeVPerNucleon!==''?Number(row.bindingKeVPerNucleon)/1000:null;
  if((mass!==null&&!Number.isFinite(mass))||(ref!==null&&!Number.isFinite(ref)))throw Error('Propriétés non numériques.');
  const delta=mass!==null?row.z*M_H+(row.a-row.z)*M_N-mass:null;
  return {z:row.z,n:row.a-row.z,a:row.a,mass,delta,approxTotal:delta===null?null:delta*U_MEV,approxPer:delta===null?null:delta*U_MEV/row.a,referencePer:ref,referenceTotal:ref===null?null:ref*row.a,referenceDelta:ref===null?null:ref*row.a/U_MEV};
 }
 function aston(rows){return Object.values(rows).filter(r=>r.bindingKeVPerNucleon!==''&&Number.isFinite(Number(r.bindingKeVPerNucleon))).map(r=>({...r,value:Number(r.bindingKeVPerNucleon)/1000}));}
 const api={binding,aston,U_MEV,M_H,M_N};root.NuclearEnergy=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 const q=s=>document.querySelector(s),fmt=x=>x===null?'Non renseigné':Number(x).toLocaleString('fr-FR',{maximumSignificantDigits:8});
 function init(){
  const host=q('#exploreTools'),card=document.createElement('article');card.className='card';card.id='energyTool';
  card.innerHTML=`<h2>Énergie de liaison et courbe d’Aston</h2>
  <p class="energy-intro">Plus l’énergie de liaison par nucléon est grande, plus le noyau est stable. Choisis un isotope ou touche la courbe.</p>
  <div class="energy-pick">
   <div class="energy-field"><label for="energyIsotope">Isotope</label><input id="energyIsotope" list="energyOptions" placeholder="Fe-56" autocomplete="off" inputmode="text"><datalist id="energyOptions"></datalist></div>
   <div class="energy-field energy-unit"><label for="energyOutputUnit">Unité</label><select id="energyOutputUnit"><option>MeV</option><option>keV</option><option>J</option></select></div>
  </div>
  <div id="energyResult" aria-live="polite"></div>
  <div class="aston-head"><h3>Courbe d’Aston</h3>
   <div class="aston-zoom" role="group" aria-label="Échelle verticale"><button type="button" data-zoom="0" aria-pressed="true">Vue complète</button><button type="button" data-zoom="1" aria-pressed="false">Zoom 7–9 MeV</button></div></div>
  <p class="aston-hint">Touche la courbe, ou fais glisser ton doigt le long des points pour parcourir les isotopes.</p>
  <div id="astonPlot" class="aston-plot"></div>
  <div id="astonCandidates" aria-label="Isotopes proches du point touché"></div>
  <p id="astonMaximum"></p>
  <details class="aston-more"><summary>Fusion, fission et courbe d’Aston</summary><p>Les noyaux proches du maximum sont fortement liés. La fusion de noyaux légers et la fission de noyaux lourds peuvent libérer de l’énergie lorsque les produits sont plus liés par nucléon. Cela n’implique pas que toute réaction soit possible ; la barrière de réaction et les produits exacts comptent.</p></details>
  <p class="rd-convention">Source : AIEA/AME2020, extraction 18 octobre 2023. Aucun point interpolé. Les isomères ne sont pas représentés. <a href="SOURCES.md">Méthode et unités</a>.</p>`;
  host.append(card);
  const points=aston(nuclearProperties),max=points.reduce((a,b)=>b.value>a.value?b:a),svgNS='http://www.w3.org/2000/svg';
  let selected='26:56',zoom=0,geo=null,layer=null;
  for(const row of Object.values(nuclearProperties)){const option=document.createElement('option');option.value=`${row.symbol}-${row.a}`;option.dataset.key=`${row.z}:${row.a}`;q('#energyOptions').append(option)}
  const el=(tag,attrs,parent)=>{const e=document.createElementNS(svgNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.append(e);return e};
  // Le graphique est dessiné en pixels réels du conteneur : textes et points gardent leur taille sur téléphone.
  function draw(){
   const box=q('#astonPlot'),W=Math.max(280,Math.round(box.clientWidth||700)),narrow=W<560;
   const H=Math.round(narrow?Math.min(420,W*1.05):Math.max(300,W*.46));
   const L=44,R=14,T=18,B=42,pw=W-L-R,ph=H-T-B,[y0,y1]=zoom?[7,9.1]:[0,10],[a0,a1]=zoom?[0,300]:[0,300];
   const x=a=>L+(a-a0)/(a1-a0)*pw,y=v=>T+ph-(v-y0)/(y1-y0)*ph;geo={x,y,W,H,L,T,pw,ph,y0,y1};
   const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,width:W,height:H,role:'img','aria-label':'Énergie de liaison par nucléon en MeV selon le nombre de masse A ; sélection par champ ou par toucher.'});
   const grid=el('g',{class:'aston-grid'},svg);
   const yt=zoom?[7,7.5,8,8.5,9]:[0,2,4,6,8,10];
   for(const v of yt){el('line',{x1:L,x2:L+pw,y1:y(v),y2:y(v)},grid);el('text',{x:L-8,y:y(v)+4,'text-anchor':'end'},svg).textContent=String(v).replace('.',',')}
   for(const a of (narrow?[0,100,200,300]:[0,50,100,150,200,250,300])){el('line',{x1:x(a),x2:x(a),y1:T,y2:T+ph},grid);el('text',{x:x(a),y:T+ph+18,'text-anchor':'middle'},svg).textContent=a}
   el('text',{x:L+pw,y:H-6,'text-anchor':'end',class:'aston-axis'},svg).textContent='Nombre de masse A';
   el('text',{x:L,y:12,class:'aston-axis'},svg).textContent='E/A (MeV/nucléon)';
   el('rect',{x:x(50),y:T,width:x(65)-x(50),height:ph,class:'aston-region'},svg);
   const pts=el('g',{class:'aston-points'},svg),r=narrow?2.1:1.8;
   for(const row of points){if(row.value<y0-.05)continue;el('circle',{cx:x(row.a),cy:y(row.value),r},pts)}
   // repères fusion / fission
   // Repères placés dans une zone vide du nuage : en bas à droite en vue complète, en haut à droite en zoom.
   const tagY=zoom?y(8.98):y(1.2),tag=(t,a,anchor)=>el('text',{x:x(a),y:tagY,'text-anchor':anchor,class:'aston-tag'},svg).textContent=t;
   tag('← fusion',zoom?115:70,'start');tag('fission →',300,'end');
   el('circle',{cx:x(max.a),cy:y(max.value),r:5,class:'aston-max'},svg);
   layer=el('g',{class:'aston-layer'},svg);
   // toucher et glisser : le point le plus proche (en pixels) devient la sélection
   let dragging=false;
   const pick=(ev,list)=>{const c=svg.createSVGPoint();c.x=ev.clientX;c.y=ev.clientY;const loc=c.matrixTransform(svg.getScreenCTM().inverse());
    const near=points.filter(p=>p.value>=y0-.05).map(p=>({p,d:Math.hypot(x(p.a)-loc.x,y(p.value)-loc.y)})).sort((a,b)=>a.d-b.d);
    if(list){q('#astonCandidates').replaceChildren();for(const {p} of near.slice(0,4)){const b=document.createElement('button');b.type='button';b.className='aston-chip';b.textContent=`${p.symbol}-${p.a} · ${fmt(Math.round(p.value*1000)/1000)}`;b.onclick=()=>choose(`${p.z}:${p.a}`);q('#astonCandidates').append(b)}}
    if(near[0])choose(`${near[0].p.z}:${near[0].p.a}`,true)};
   svg.addEventListener('pointerdown',e=>{dragging=true;try{svg.setPointerCapture(e.pointerId)}catch(_){}pick(e,false)});
   svg.addEventListener('pointermove',e=>{if(dragging)pick(e,false)});
   const end=e=>{if(!dragging)return;dragging=false;pick(e,true)};
   svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',()=>dragging=false);
   svg.addEventListener('click',e=>{if(!dragging&&!e.pointerType)pick(e,true)});
   q('#astonPlot').replaceChildren(svg);mark();
  }
  // Seul le calque de sélection est redessiné : le nuage de 3 000 points reste en place pendant le glissé.
  function mark(){
   if(!layer||!geo)return;layer.replaceChildren();const row=points.find(p=>`${p.z}:${p.a}`===selected);if(!row||row.value<geo.y0-.05)return;
   const cx=geo.x(row.a),cy=geo.y(row.value);
   el('line',{x1:cx,x2:cx,y1:cy,y2:geo.T+geo.ph,class:'aston-guide'},layer);
   el('circle',{cx,cy,r:7,class:'aston-selected'},layer);
   const label=`${row.symbol}-${row.a} · ${fmt(Math.round(row.value*1000)/1000)} MeV`,w=label.length*7.4+16,h=26;
   let bx=cx-w/2;bx=Math.max(geo.L,Math.min(geo.L+geo.pw-w,bx));let by=cy-h-14;if(by<geo.T)by=cy+14;
   el('rect',{x:bx,y:by,width:w,height:h,rx:6,class:'aston-label-bg'},layer);
   el('text',{x:bx+w/2,y:by+17,'text-anchor':'middle',class:'aston-label'},layer).textContent=label;
  }
  function choose(key,fromChart){
   selected=key;const row=nuclearProperties[key],result=q('#energyResult');result.replaceChildren();
   if(!row){result.textContent='Propriétés absentes pour cet état. Les isomères ne sont pas remplacés par leur fondamental.';mark();return;}
   const r=binding(row),energyUnit=q('#energyOutputUnit').value,scale=energyUnit==='keV'?1000:energyUnit==='J'?1.602176634e-13:1,ef=x=>NucleaUnits.fmt(x*scale);
   if(document.activeElement!==q('#energyIsotope')||!fromChart)q('#energyIsotope').value=`${row.symbol}-${row.a}`;
   // La réponse d'abord, le calcul détaillé ensuite.
   const key0=document.createElement('div');key0.className='energy-key';
   const nm=document.createElement('span');nm.className='energy-nuclide';nm.textContent=`${row.symbol}-${row.a}`;
   const main=document.createElement('strong');main.textContent=r.referencePer===null?'Énergie de liaison non renseignée':`E/A = ${ef(r.referencePer)} ${energyUnit}/nucléon`;
   const sub=document.createElement('span');sub.textContent=(r.referencePer===null?'':`E = ${ef(r.referenceTotal)} ${energyUnit} · `)+`Z = ${r.z} ; N = ${r.n} ; A = ${r.a}`;
   key0.append(nm,main,sub);result.append(key0);
   const det=document.createElement('details');det.className='energy-details';const sm=document.createElement('summary');sm.textContent='Voir le calcul à partir des masses';det.append(sm);
   const lines=[['Données',`Masse atomique isotopique : ${fmt(r.mass)} u (incertitude source : ${row.massUncMicroU||'non renseignée'} µu).`],['Relation avec masses atomiques neutres','Δm ≈ Z m(¹H) + N mₙ − m(atome). E ≈ Δm c². Les électrons se compensent au premier ordre ; la différence d’énergie de liaison électronique est négligée.'],['Application numérique',r.mass===null?'Masse absente : calcul à partir des masses désactivé.':`Δm ≈ ${r.z} × ${M_H} + ${r.n} × ${M_N} − ${r.mass} = ${fmt(r.delta)} u.`],['Résultat pédagogique à partir des masses',r.mass===null?'Non disponible.':`E ≈ ${ef(r.approxTotal)} ${energyUnit} ; E/A ≈ ${ef(r.approxPer)} ${energyUnit}/nucléon.`],['Référence tabulée AIEA',r.referencePer===null?'Énergie de liaison non renseignée.':`E/A = ${ef(r.referencePer)} ${energyUnit}/nucléon ; E = ${ef(r.referenceTotal)} ${energyUnit} ; équivalent Δm = ${fmt(r.referenceDelta)} u. Incertitude source sur E/A : ${row.bindingUncKeV||'non renseignée'} keV/nucléon.`],['Interprétation','L’énergie de liaison est l’énergie à fournir pour séparer les nucléons. Les valeurs issues des masses sont une approximation pédagogique ; le nuage d’Aston utilise exclusivement la valeur tabulée.']];
   for(const [title,body] of lines){const p=document.createElement('p'),b=document.createElement('strong');b.textContent=title+' : ';p.append(b,document.createTextNode(body));det.append(p)}
   const source=document.createElement('a');source.href=`https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=${row.a}${row.symbol.toLowerCase()}`;source.target='_blank';source.rel='noopener noreferrer';source.textContent=`Source AIEA — ${row.extracted} ; masse ${row.massSystematics==='Y'?'estimée par systématique':'du jeu AME2020'} ; aucune propagation d’incertitudes.`;det.append(source);
   result.append(det);mark();
  }
  q('#energyIsotope').onchange=()=>{const row=Object.values(nuclearProperties).find(r=>`${r.symbol}-${r.a}`.toLowerCase()===q('#energyIsotope').value.trim().toLowerCase());const next=row?`${row.z}:${row.a}`:'missing';if(next!==selected)choose(next)};
  q('#astonMaximum').textContent=`Maximum du jeu représenté : ${max.symbol}-${max.a}, ${fmt(max.value)} MeV/nucléon (cercle). Bande verte : région A = 50 à 65.`;
  q('#energyOutputUnit').onchange=()=>choose(selected);
  card.querySelectorAll('.aston-zoom button').forEach(b=>b.onclick=()=>{zoom=+b.dataset.zoom;card.querySelectorAll('.aston-zoom button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()});
  // Redessiner quand la largeur change (rotation, onglet affiché) ; un conteneur masqué a une largeur nulle.
  let lastW=0;const ro=new ResizeObserver(()=>{const w=q('#astonPlot').clientWidth;if(w&&Math.abs(w-lastW)>8){lastW=w;draw()}});ro.observe(q('#astonPlot'));
  api.open=(z,v)=>{document.querySelector('[data-tab="explore"]').click();choose(v.label?'missing':`${z}:${v.a}`);card.scrollIntoView({block:'start'});};
  draw();choose(selected);
 }
 document.addEventListener('DOMContentLoaded',init);
})(globalThis);
