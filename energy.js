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
  card.innerHTML='<h2>Énergie de liaison et courbe d’Aston</h2><p>Chaque point représente un isotope fondamental distinct : énergie de liaison par nucléon en fonction de A.</p><label for="energyIsotope">Choisir un isotope (état fondamental)</label><input id="energyIsotope" list="energyOptions" placeholder="Fe-56" autocomplete="off"><datalist id="energyOptions"></datalist><label for="energyOutputUnit">Unité des résultats en énergie (nuage conservé en MeV/nucléon)</label><select id="energyOutputUnit"><option>MeV</option><option>keV</option><option>J</option></select><div id="energyResult" aria-live="polite"></div><h3>Courbe d’Aston</h3><p>Toucher le nuage pour choisir un point ; si des isotopes sont proches, utiliser les candidats proposés.</p><div id="astonPlot" class="aston-plot"></div><div id="astonCandidates"></div><p id="astonMaximum"></p><p>Les noyaux proches du maximum sont fortement liés. La fusion de noyaux légers et la fission de noyaux lourds peuvent libérer de l’énergie lorsque les produits sont plus liés par nucléon. Cela n’implique pas que toute réaction soit possible ; la barrière de réaction et les produits exacts comptent.</p><p class="rd-convention">Source : AIEA/AME2020, extraction 18 octobre 2023. Aucun point interpolé. Les isomères ne sont pas représentés. <a href="SOURCES.md">Méthode et unités</a>.</p>';
  host.append(card);const points=aston(nuclearProperties),max=points.reduce((a,b)=>b.value>a.value?b:a),x=a=>48+a/300*650,y=v=>260-v/9*230;
  const svgNS='http://www.w3.org/2000/svg';let selected='26:56';
  for(const row of Object.values(nuclearProperties)){const option=document.createElement('option');option.value=`${row.symbol}-${row.a}`;option.dataset.key=`${row.z}:${row.a}`;q('#energyOptions').append(option)}
  function draw(){
   const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 730 310');svg.setAttribute('role','img');svg.setAttribute('aria-label','Énergie de liaison par nucléon en MeV selon le nombre de masse A ; sélection par champ ou par toucher.');
   function text(a,b,t){const e=document.createElementNS(svgNS,'text');e.setAttribute('x',a);e.setAttribute('y',b);e.textContent=t;svg.append(e)}
   for(const a of [0,50,100,150,200,250,300])text(x(a)-8,283,a);for(const b of [0,2,4,6,8])text(10,y(b)+4,b);text(320,307,'Nombre de masse A');text(15,15,'E/A (MeV/nucléon)');
   const region=document.createElementNS(svgNS,'rect');region.setAttribute('x',x(50));region.setAttribute('y',25);region.setAttribute('width',x(65)-x(50));region.setAttribute('height',235);region.setAttribute('class','aston-region');svg.append(region);
   for(const row of points){const e=document.createElementNS(svgNS,'circle');e.setAttribute('cx',x(row.a));e.setAttribute('cy',y(row.value));e.setAttribute('r',`${row.z}:${row.a}`===selected?5:1.6);e.setAttribute('class',`${row.z}:${row.a}`===selected?'aston-selected':'aston-point');svg.append(e)}
   svg.addEventListener('click',event=>{const c=svg.createSVGPoint();c.x=event.clientX;c.y=event.clientY;const loc=c.matrixTransform(svg.getScreenCTM().inverse());const closest=[...points].sort((a,b)=>Math.hypot(x(a.a)-loc.x,y(a.value)-loc.y)-Math.hypot(x(b.a)-loc.x,y(b.value)-loc.y)).slice(0,8);q('#astonCandidates').replaceChildren();for(const row of closest){const b=document.createElement('button');b.className='btn btn-ghost';b.textContent=`${row.symbol}-${row.a} · ${fmt(row.value)} MeV/A`;b.onclick=()=>choose(`${row.z}:${row.a}`);q('#astonCandidates').append(b)}choose(`${closest[0].z}:${closest[0].a}`)});
   q('#astonPlot').replaceChildren(svg);
  }
  function choose(key){
   selected=key;const row=nuclearProperties[key],result=q('#energyResult');result.replaceChildren();if(!row){result.textContent='Propriétés absentes pour cet état. Les isomères ne sont pas remplacés par leur fondamental.';return;}
   const r=binding(row),energyUnit=q('#energyOutputUnit').value,scale=energyUnit==='keV'?1000:energyUnit==='J'?1.602176634e-13:1,ef=x=>NucleaUnits.fmt(x*scale);q('#energyIsotope').value=`${row.symbol}-${row.a}`;
   const lines=[['Données',`Z = ${r.z} ; N = ${r.n} ; A = ${r.a}. Masse atomique isotopique : ${fmt(r.mass)} u (incertitude source : ${row.massUncMicroU||'non renseignée'} µu).`],['Relation avec masses atomiques neutres','Δm ≈ Z m(¹H) + N mₙ − m(atome). E ≈ Δm c². Les électrons se compensent au premier ordre ; la différence d’énergie de liaison électronique est négligée.'],['Application numérique',r.mass===null?'Masse absente : calcul à partir des masses désactivé.':`Δm ≈ ${r.z} × ${M_H} + ${r.n} × ${M_N} − ${r.mass} = ${fmt(r.delta)} u.`],['Résultat pédagogique à partir des masses',r.mass===null?'Non disponible.':`E ≈ ${ef(r.approxTotal)} ${energyUnit} ; E/A ≈ ${ef(r.approxPer)} ${energyUnit}/nucléon.`],['Référence tabulée AIEA',r.referencePer===null?'Énergie de liaison non renseignée.':`E/A = ${ef(r.referencePer)} ${energyUnit}/nucléon ; E = ${ef(r.referenceTotal)} ${energyUnit} ; équivalent Δm = ${fmt(r.referenceDelta)} u. Incertitude source sur E/A : ${row.bindingUncKeV||'non renseignée'} keV/nucléon.`],['Interprétation','L’énergie de liaison est l’énergie à fournir pour séparer les nucléons. Les valeurs issues des masses sont une approximation pédagogique ; le nuage d’Aston utilise exclusivement la valeur tabulée.']];
   for(const [title,body] of lines){const p=document.createElement('p'),b=document.createElement('strong');b.textContent=title+' : ';p.append(b,document.createTextNode(body));result.append(p)}
   const source=document.createElement('a');source.href=`https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=${row.a}${row.symbol.toLowerCase()}`;source.target='_blank';source.rel='noopener noreferrer';source.textContent=`Source AIEA — ${row.extracted} ; masse ${row.massSystematics==='Y'?'estimée par systématique':'du jeu AME2020'} ; aucune propagation d’incertitudes.`;result.append(source);draw();
  }
  q('#energyIsotope').onchange=()=>{const row=Object.values(nuclearProperties).find(r=>`${r.symbol}-${r.a}`.toLowerCase()===q('#energyIsotope').value.toLowerCase());const next=row?`${row.z}:${row.a}`:'missing';if(next!==selected)choose(next)};
  q('#astonMaximum').textContent=`Maximum du jeu représenté : ${max.symbol}-${max.a}, ${fmt(max.value)} MeV/nucléon. Région A = 50 à 65 mise en évidence.`;
  q('#energyOutputUnit').onchange=()=>choose(selected);
  api.open=(z,v)=>{document.querySelector('[data-tab="explore"]').click();choose(v.label?'missing':`${z}:${v.a}`);card.scrollIntoView({block:'start'});};choose(selected);
 }
 document.addEventListener('DOMContentLoaded',init);
})(globalThis);
