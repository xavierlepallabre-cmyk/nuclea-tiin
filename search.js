/* Nucléa TIIN v0.26 — recherche dans toute l'application (loupe de l'en-tête).
   Index construit à la première ouverture, à partir des contenus déjà chargés :
   éléments et isotopes, formules, calculateurs et outils, phénomènes animés, étapes de parcours, thèmes d'exercices.
   Rien n'est enregistré : la recherche fonctionne hors connexion et sans mémoire. */
document.addEventListener('DOMContentLoaded',()=>{
 const $=s=>document.querySelector(s);
 const btn=$('#searchOpen'),dlg=$('#searchDialog'),input=$('#searchAll'),out=$('#searchResults'),status=$('#searchStatus');
 if(!btn||!dlg)return;
 const clean=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’']/g,' ');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};

 // Mots-clés ajoutés aux rubriques, pour trouver une formule par la notion et pas seulement par son écriture.
 const FORMULA_KEYS=[
  'atome noyau proton neutron nucleon electron ion charge numero atomique nombre de masse unite de masse atomique',
  'activite becquerel bq desintegration periode demi vie decroissance constante radioactive lambda exponentielle',
  'masse energie defaut de masse energie de liaison mev joule einstein equivalence masse energie',
  'dose gray gy sievert sv dose absorbee dose equivalente facteur de ponderation debit de dose',
  'distance ecran attenuation cda couche de demi attenuation carre inverse protection date coefficient',
  'conversion unite prefixe kilo mega giga milli micro nano heure seconde vitesse lumiere'];
 const VISUAL_KEYS={
  decroissance:'loi de decroissance periode demi vie hasard noyaux',
  attenuation:'ecran plomb beton cda cdt gamma transmission',
  distance:'debit de dose inverse carre source ponctuelle tuyauterie',
  desintegrations:'alpha beta gamma beta moins beta plus capture electronique diagramme n z transformation',
  vallee:'vallee de stabilite carte des noyaux nucleides diagramme n z segre stable instable nombres magiques',
  filiation:'chaine filiation equilibre seculaire transitoire generateur molybdene technetium'};
 const TOOLS=[
  {t:'Calculateur de décroissance',s:'Formulaire · activité restante, temps écoulé, nombre de périodes',k:'calcul activite restante periode becquerel decroissance temps',go:()=>show('formulas','#decayCalculator')},
  {t:'Énergie de liaison et courbe d’Aston',s:'Explorer · outil de calcul',k:'energie de liaison par nucleon aston defaut de masse fer 56 fission fusion',go:()=>show('explore','#energyTool')},
  {t:'Module DATE',s:'Explorer · distance, activité, temps, écran',k:'date dose collective releve chantier preparation intervention radioprotection optimisation alara',go:()=>show('explore','#dateTool')},
  {t:'Tableau périodique',s:'Éléments · familles, fiches, isotopes',k:'tableau periodique mendeleiev familles elements',go:()=>show('table','#tableViewport')}];
 const EX_KEYS=['atome noyau','activite decroissance periode','masse energie liaison','dose debit gray sievert','distance ecran cda','conversion unites prefixes'];

 let IDX=null;
 function build(){
  IDX=[];
  const els=(typeof elements!=='undefined'&&Array.isArray(elements))?elements:[];
  for(const e of els)IDX.push({g:'el',t:`${e.name} (${e.s})`,s:`Élément · Z = ${e.z}`,k:clean(`${e.name} ${e.s} ${e.z}`),sym:e.s,z:e.z,go:()=>openElement(e.z)});
  if(typeof formulas!=='undefined')formulas.forEach(([title,items],g)=>{const rub=title.split(' · ').slice(1).join(' · ');
   items.forEach(([eq,txt],i)=>IDX.push({g:'fo',t:eq,s:`Formulaire · ${rub} — ${txt}`,k:clean(`${eq} ${txt} ${rub} ${FORMULA_KEYS[g]||''}`),go:()=>openFormula(g,i)}));});
  for(const T of TOOLS)IDX.push({g:'to',t:T.t,s:T.s,k:clean(`${T.t} ${T.s} ${T.k}`),go:T.go});
  for(const v of (window.NucleaVisuals?.list||[]))IDX.push({g:'vi',t:v.title,s:'Phénomène animé · '+v.text,k:clean(`${v.title} ${v.text} ${VISUAL_KEYS[v.id]||''}`),go:()=>window.NucleaVisuals.open(v.id)});
  for(const p of (window.NucleaParcoursData?.parcours||[]).filter(p=>p.available))for(const st of p.steps)
   IDX.push({g:'pa',t:st.title,s:`Parcours · ${p.title}${st.summary?' — '+st.summary:''}`,k:clean(`${st.title} ${st.summary||''} ${p.title}`),go:()=>{show('parcours');window.NucleaParcours?.open(p.id,st.id)}});
  document.querySelectorAll('#exerciseTheme .ex-theme').forEach((b,i)=>{const name=b.textContent.trim();
   IDX.push({g:'ex',t:`Exercices : ${name}`,s:'S’entraîner · trois niveaux, aides, sans note',k:clean(`exercice entrainement ${name} ${EX_KEYS[i]||''}`),go:()=>{show('exercises');b.click();b.scrollIntoView({block:'center'})}})});
 }
 const GROUPS=[['se','???'],['is','Isotope'],['el','Éléments'],['fo','Formules'],['to','Outils'],['vi','Phénomènes animés'],['pa','Parcours'],['ex','Exercices']];

 /* Un isotope tapé directement : U-235, 235U, uranium 235, Co 60, C14 */
 function isotopeHit(q){
  const t=clean(q).replace(/[-_]/g,' ').replace(/\s+/g,' ').trim();
  const m=t.match(/^(\d{1,3})\s*([a-z]+)$/)||t.match(/^([a-z]+)\s*(\d{1,3})m?$/);if(!m)return null;
  const [a,w]=/^\d/.test(m[1])?[+m[1],m[2]]:[+m[2],m[1]];
  const els=(typeof elements!=='undefined')?elements:[];
  const e=els.find(x=>clean(x.s)===w)||els.find(x=>clean(x.name)===w)||(w.length>=3&&els.find(x=>clean(x.name).startsWith(w)));if(!e)return null;
  const list=(typeof isotopes!=='undefined'&&isotopes[e.z])||[];const v=list.find(x=>!x.label&&x.a===a);
  if(!v)return {g:'is',t:`${e.s}-${a}`,s:`${e.name} ${a} ne figure pas dans les données AIEA embarquées`,go:()=>openElement(e.z),missing:true};
  const sup=String(a).replace(/\d/g,d=>SUP[d]);
  return {g:'is',t:`${sup}${e.s} — ${e.name} ${a}`,s:`Isotope · Z = ${e.z}, N = ${a-e.z} · ${v.stable?'stable':'radioactif'}`,go:()=>openElement(e.z,a)};
 }
 function search(q){
  const toks=clean(q).split(/\s+/).filter(Boolean);if(!toks.length)return [];
  if(clean(q).trim()==='235')return [{g:'se',t:'Un neutron, et tout bascule…',s:'Touche ici. Tu as trouvé quelque chose.',go:()=>window.NucleaVisuals?.open('reaction'),score:2000}];
  if(!IDX)build();
  const hits=[];const iso=isotopeHit(q);if(iso)hits.push({...iso,score:1000});
  const ct=clean(q).trim();
  for(const it of IDX){if(!toks.every(t=>it.k.includes(t)))continue;
   const tt=clean(it.t);let sc=10;
   if(it.g==='el'&&(clean(it.sym)===ct||String(it.z)===ct))sc=500;
   else if(tt===ct)sc=300;else if(tt.startsWith(ct))sc=200;else if(tt.includes(ct))sc=120;else if(toks.every(t=>tt.includes(t)))sc=80;
   hits.push({...it,score:sc});}
  return hits.sort((a,b)=>b.score-a.score);
 }
 let current=[],active=-1;
 function render(){
  const q=input.value;current=search(q);active=current.length?0:-1;
  if(!q.trim()){out.innerHTML=`<p class="sr-empty">Tape un mot : un élément (uranium, Co), un isotope (U-235), une notion (période, becquerel, CDA, sievert…), un phénomène ou un parcours.</p>`;status.textContent='';return}
  if(!current.length){out.innerHTML=`<p class="sr-empty">Aucun résultat pour « ${esc(q)} ». Essaie un autre mot, ou un mot plus court.</p>`;status.textContent='Aucun résultat';return}
  let html='',n=0;const shown=[];
  for(const [g,label] of GROUPS){const L=current.filter(h=>h.g===g).slice(0,g==='el'?4:6);if(!L.length)continue;
   html+=`<h3 class="sr-group">${label}</h3><ul class="sr-list" role="listbox" aria-label="${label}">`;
   for(const h of L){shown.push(h);html+=`<li role="option" id="sr-${n}" class="sr-item${n===0?' on':''}" data-i="${n}" aria-selected="${n===0}"><span class="sr-t">${esc(h.t)}</span><span class="sr-s">${esc(h.s)}</span></li>`;n++}
   html+='</ul>';}
  current=shown;out.innerHTML=html;status.textContent=`${shown.length} résultat${shown.length>1?'s':''}`;
  input.setAttribute('aria-activedescendant','sr-0');
 }
 function move(d){if(!current.length)return;active=(active+d+current.length)%current.length;
  out.querySelectorAll('.sr-item').forEach((li,i)=>{li.classList.toggle('on',i===active);li.setAttribute('aria-selected',String(i===active))});
  const li=out.querySelector(`#sr-${active}`);li?.scrollIntoView({block:'nearest'});input.setAttribute('aria-activedescendant','sr-'+active);}
 function choose(i){const h=current[i];if(!h)return;dlg.hidden=true;document.body.classList.remove('search-open');btn.focus({preventScroll:true});
  // Revenir d'abord à l'entrée d'historique d'avant la recherche, puis ouvrir le contenu : le bouton Retour reste naturel.
  if(history.state?.nucleaSearch){window.addEventListener('popstate',()=>setTimeout(()=>h.go(),20),{once:true});history.back()}else h.go()}
 out.addEventListener('click',e=>{const li=e.target.closest('.sr-item');if(li)choose(+li.dataset.i)});
 input.addEventListener('input',render);
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Enter'){e.preventDefault();choose(active)}});

 /* Navigation vers le contenu trouvé */
 function show(tab,sel){document.querySelector(`.tabs [data-tab="${tab}"],[data-tab="${tab}"]`)?.click();
  if(sel)setTimeout(()=>{const el=document.querySelector(sel);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});flash(el)}},80);}
 function flash(el){el.classList.remove('sr-flash');void el.offsetWidth;el.classList.add('sr-flash');setTimeout(()=>el.classList.remove('sr-flash'),2200)}
 function openElement(z,a){show('table');if(a&&typeof isotopeSelection==='object')isotopeSelection[z]=String(a);if(typeof showElement==='function')showElement(z,true)}
 function openFormula(g,i){show('formulas');setTimeout(()=>{const outer=document.querySelectorAll('#formulaList > details')[g];if(!outer)return;outer.open=true;
  const inner=outer.querySelectorAll('details.formula-item')[i];if(inner){inner.open=true;inner.scrollIntoView({behavior:'smooth',block:'center'});flash(inner)}},90)}

 /* Ouverture et fermeture */
 let opener=null;
 function open(){opener=document.activeElement;dlg.hidden=false;document.body.classList.add('search-open');input.value='';render();
  history.pushState({...history.state,nucleaSearch:true},'');setTimeout(()=>input.focus(),20)}
 function close(back=true){if(dlg.hidden)return;dlg.hidden=true;document.body.classList.remove('search-open');
  if(back&&history.state?.nucleaSearch)history.back();else if(history.state?.nucleaSearch){const s={...history.state};delete s.nucleaSearch;history.replaceState(s,'')}
  if(back&&opener?.focus)opener.focus()}
 btn.onclick=open;$('#searchClose').onclick=()=>close();
 dlg.addEventListener('click',e=>{if(e.target===dlg)close()});
 window.addEventListener('popstate',()=>{if(!dlg.hidden&&!history.state?.nucleaSearch){dlg.hidden=true;document.body.classList.remove('search-open')}});
 document.addEventListener('keydown',e=>{
  if(!dlg.hidden&&e.key==='Escape'){e.preventDefault();close();return}
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
  if(dlg.hidden&&((e.key==='/'&&!typing)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))){e.preventDefault();open()}});
 window.NucleaSearch={open,close,search:q=>search(q).map(h=>({group:h.g,title:h.t}))};
});
