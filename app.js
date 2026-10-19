const familyNames={alcalin:"Métaux alcalins",terreux:"Alcalino-terreux",transition:"Métaux de transition",pauvre:"Métaux pauvres",metalloide:"Métalloïdes",nonmetal:"Autres non-métaux",halogene:"Halogènes",noble:"Gaz nobles",lanthanide:"Lanthanides",actinide:"Actinides"};const colors={alcalin:"#fbd7cc",terreux:"#fce5c4",transition:"#f8d6e2",pauvre:"#d9e3ed",metalloide:"#e6e8c6",nonmetal:"#d3eed9",halogene:"#fff0b9",noble:"#cfe8ef",lanthanide:"#e8d7f5",actinide:"#d4e7f9"};let elements=[],selected=6;const $=s=>document.querySelector(s);const clean=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();const fmt=n=>Number(n).toLocaleString("fr-FR",{maximumFractionDigits:5});document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("main section").forEach(x=>x.classList.toggle("hidden",x.id!==b.dataset.tab))});function renderTable(q=""){const grid=$("#periodic");grid.innerHTML="";let matches=[];for(const e of elements){const match=!q||clean(e.name).includes(clean(q))||clean(e.s)===clean(q)||String(e.z)===q.trim();if(match)matches.push(e);const b=document.createElement("button");b.dataset.z=e.z;b.className="element"+(!match?" dim":"")+(selected===e.z?" selected":"");b.style.cssText=`--c:${e.c};--r:${e.r};--bg:${colors[e.family]}`;b.title=`${e.name} (${e.s}), Z=${e.z}`;b.setAttribute("aria-label",b.title);b.innerHTML=`<span class="z">${e.z}</span><span class="symbol">${e.s}</span><span class="mass">${fmt(e.mass)}</span>`;b.onclick=()=>{if(Date.now()-lastPanEnd<280)return;showElement(e.z)};grid.append(b)}$("#results").textContent=q?`${matches.length} élément(s) trouvé(s)`:"";}function showElement(z,open=true){selected=z;const e=elements.find(x=>x.z===z);if(!e)return;renderTable($("#search").value);const variants=isotopes[z]||[];const preferred=variants.find(v=>v.a===e.a&&!v.label)||variants.find(v=>v.stable)||variants[0];const opts=variants.length?variants.map((v,i)=>`<option value="${i}" ${v===preferred?"selected":""}>${e.s}-${v.label||v.a}${v.stable?" (stable)":""}</option>`).join(""):`<option value="0">${e.s}-${e.a} (isotope de référence indicatif)</option>`;$("#detailContent").innerHTML=`<div class="detailhead"><div class="tile" style="--bg:${colors[e.family]}"><small>Z = ${e.z}</small><b>${e.s}</b><small>${fmt(e.mass)} u</small></div><div><h2>${e.name}</h2><div class="chips"><span class="chip">${familyNames[e.family]}</span><span class="chip">Numéro atomique ${e.z}</span></div><label for="iso">Isotope étudié : </label><select id="iso">${opts}</select></div></div><div id="isoData"></div><div class="note">La masse atomique moyenne (${fmt(e.mass)} u) n'est pas la masse du noyau. Le nombre de masse A est un entier propre à chaque isotope.</div>`;$("#iso").onchange=()=>renderIso(e,variants);renderIso(e,variants);if(open)openDetail(z)}const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const modeNames={"B-":"β−","B+":"β+","EC":"Capture électronique","EC+B+":"Capture électronique / β+","A":"α","IT":"Transition isomérique","SF":"Fission spontanée","N":"Émission de neutron","P":"Émission de proton","2N":"Émission de 2 neutrons","2P":"Émission de 2 protons","2B-":"Double β−","2B+":"Double β+","2EC":"Double capture électronique","B-N":"β− suivie de neutron","B-2N":"β− suivie de 2 neutrons","B-A":"β− suivie de α","ECP":"Capture électronique suivie de proton","B+P":"β+ suivie de proton","ECSF":"Capture électronique suivie de fission"};
const unitNames={s:"s",ms:"ms",m:"min",h:"h",d:"jours",Y:"ans",ns:"ns",us:"µs",ps:"ps",as:"as"};
const operators={GT:">",LT:"<",GE:"≥",AP:"≈"};
function daughterLabel(e,v,mode){
 const deltas={"B-":[1,0],"B+":[-1,0],EC:[-1,0],"EC+B+":[-1,0],A:[-2,-4],N:[0,-1],P:[-1,-1],"2N":[0,-2],"2P":[-2,-2],"2B-":[2,0],"2B+":[-2,0],"2EC":[-2,0],"B-N":[1,-1],"B-2N":[1,-2],"B-A":[-1,-4],ECP:[-2,-1],"B+P":[-2,-1]};
 if(mode==="IT")return `${e.s}-${v.a} (niveau inférieur)`;
 if(mode==="SF"||mode==="ECSF")return "Plusieurs fragments de fission";
 const d=deltas[mode],target=d&&elements.find(x=>x.z===e.z+d[0]);
 return target?`${target.s}-${v.a+d[1]} (état nucléaire non précisé)`:"Non déterminé dans cette fiche";
}
function renderIso(e,variants){
 const v=variants[Number($("#iso").value)]||{a:e.a,decays:[]};
 const stat=(name,value)=>`<div class="stat"><small>${name}</small><strong>${value}</strong></div>`;
 const query=`${v.a}${e.s.toLowerCase()}`;
 const url=`https://nds.iaea.org/relnsd/v1/data?fields=${v.source||"ground_states"}&nuclides=${query}`;
 let period="Non renseignée dans la source";
 if(v.stable)period="Stable selon la source";
 else if(v.half){
   if(unitNames[v.unit])period=`${operators[v.operator]||""} ${v.half} ${unitNames[v.unit]}${v.unc?` (incertitude ENSDF : ${v.unc})`:""}`;
   else period=`${operators[v.operator]||""} ${v.seconds||"Non renseigné"} s (conversion fournie par l’AIEA ; largeur du niveau : ${v.half} ${v.unit}${v.unc?`; incertitude ENSDF : ${v.unc}`:""})`;
 }
 $("#isoData").innerHTML=`<p class="isotope-count">${variants.length} isotope(s) / état(s) disponibles pour cet élément.</p><div class="stats">${stat("Protons (Z)",e.z)}${stat("Neutrons (N = A − Z)",v.a-e.z)}${stat("Nucléons (A)",v.a)}${stat("Électrons (atome neutre)",e.z)}</div>
 <p><strong>Notation nucléaire :</strong> <sup>${esc(v.label||v.a)}</sup><sub>${e.z}</sub>${e.s}</p>
 <p><strong>État :</strong> ${v.label?`métastable, énergie d’excitation ${esc(v.energy)} keV`:"fondamental"}</p>
 <p><strong>${v.stable?"Stabilité":"Période radioactive"} :</strong> ${esc(period)}</p>
 <p><strong>Abondance isotopique naturelle :</strong> ${v.abundance?`${esc(v.abundance)} %${v.abundanceUnc?` (incertitude ENSDF : ${esc(v.abundanceUnc)})`:""}`:"Non renseignée dans la source"}</p>
 ${v.decays.length?`<h3>Modes de désintégration renseignés</h3><ul class="decay-list">${v.decays.map(d=>`<li><strong>${esc(modeNames[d.mode]||d.mode)}</strong>${d.percent?` : ${esc(d.percent)} %${d.unc?` (incertitude ENSDF : ${esc(d.unc)})`:""}`:" : proportion non renseignée"}<br><small>Noyau(x) fils : ${esc(daughterLabel(e,v,d.mode))}</small></li>`).join("")}</ul><p><small>Jusqu’à trois modes fournis par la source. Les noyaux fils sont déduits des bilans A et Z ; leurs états excités et les émissions γ ne sont pas détaillés.</small></p>`:!v.stable?"<p>Modes non renseignés ; cela ne signifie pas que cet isotope est stable.</p>":""}
 <details class="isotope-source"><summary>Source et précision des données</summary><p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">AIEA — LiveChart, données de ${e.s}-${esc(v.label||v.a)}</a></p><p>Extraction indiquée par la source : ${esc(v.extracted||"non renseignée")}. Téléchargement : 19 octobre 2026.<br>Limite bibliographique ENSDF : ${esc(v.cutoff||"non renseignée")}.<br>Évaluation : ${esc(v.authors||"non renseignée")}.</p><p>Les incertitudes sont reproduites en notation ENSDF : 12,32 (2) signifie 12,32 ± 0,02. Les valeurs vides restent non renseignées ; les signes &lt;, &gt;, ≥ et ≈ sont conservés.</p><p><a href="https://nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html" target="_blank" rel="noopener noreferrer">Documentation et références de LiveChart</a></p></details>`;
}
$("#search").addEventListener("input",e=>renderTable(e.target.value));
const formulas=[["1 · Atome et noyau", [["A = Z + N", "Z : protons ; N : neutrons ; A : nucléons."], ["N = A − Z", "Pour un isotope donné."], ["nₑ = Z", "Atome électriquement neutre."], ["q = (Z − nₑ) e", "Ion monoatomique ; e = 1,602 × 10⁻¹⁹ C."], ["1 u = 1,66054 × 10⁻²⁷ kg", "1 u c² = 931,5 MeV."]]], ["2 · Activité et décroissance", [["𝒜(t) = λ N(t)", "1 Bq = 1 désintégration par seconde."], ["N(t) = N₀ e⁻λᵗ", "Un seul radionucléide, sans filiation."], ["𝒜(t) = 𝒜₀ e⁻λᵗ", "Même hypothèse ; t et T½ dans la même unité."], ["λ = ln(2) / T½", "Constante de décroissance."], ["t = ln(𝒜₀ / 𝒜) / λ", "Activité initiale et finale connues."], ["𝒜 = 𝒜₀ / 2ⁿ", "Après n périodes radioactives."]]], ["3 · Masse et énergie", [["Δm = Zmₚ + Nmₙ − mₙₒᵧₐᵤ", "Employer la masse du noyau, pas la masse atomique moyenne."], ["E_liaison = Δm c²", "Si Δm en u : E_liaison [MeV] = 931,5 × Δm [u]."], ["E_liaison / A", "Énergie de liaison par nucléon."], ["E = mc²", "1 eV = 1,602 × 10⁻¹⁹ J ; 1 MeV = 10⁶ eV."]]], ["4 · Dose et débit de dose", [["D = E_déposée / m", "Dose absorbée ; 1 Gy = 1 J·kg⁻¹."], ["Hₜ = wᵣ Dₜ", "Dose équivalente (Sv), un rayonnement."], ["Hₜ = Σᵣ wᵣ Dₜ,ᵣ", "Plusieurs rayonnements."], ["Ḣ = ΔH / Δt", "Débit moyen de dose équivalente."], ["H = Ḣ × t", "Débit constant ; 1 mSv = 10³ µSv = 10⁻³ Sv."]]], ["5 · Distance et écrans", [["Ḣ₂ = Ḣ₁ × (r₁ / r₂)²", "Source ponctuelle, sans écran ni diffusion."], ["I = I₀ e⁻μˣ", "Faisceau étroit ; atténuation exponentielle."], ["CDA = ln(2) / μ", "Couche de demi-atténuation."], ["I = I₀ / 2ⁿ", "Après n CDA."], ["DATE", "Distance — Activité — Temps — Écran."]]], ["6 · Conversions et repères", [["k = 10³ ; M = 10⁶ ; G = 10⁹", "Préfixes multiplicateurs."], ["m = 10⁻³ ; µ = 10⁻⁶ ; n = 10⁻⁹", "Préfixes sous-multiples."], ["1 h = 3 600 s ; 1 j = 86 400 s", "Conversions de temps."], ["1 nm = 10⁻⁹ m ; 1 fm = 10⁻¹⁵ m", "Conversions de longueur."], ["c = 3,00 × 10⁸ m·s⁻¹", "Vitesse de la lumière dans le vide."], ["ln(2) ≈ 0,693", "Vérifier les unités avant tout calcul."]]]];$("#formulaList").innerHTML=formulas.map(([title,items])=>`<article class="formula"><h2>${title}</h2>${items.map(([eq,desc])=>`<div class="eq">${eq}</div><p>${desc}</p>`).join("")}</article>`).join("");fetch("elements.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(a=>{elements=a;$("#legend").innerHTML=Object.entries(familyNames).map(([k,v])=>`<span style="--bg:${colors[k]}">${v}</span>`).join("");renderTable();buildOverview();requestAnimationFrame(()=>{fitTable()})}).catch(err=>{$("#detail").textContent="Impossible de charger les éléments : "+err.message});if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(console.warn);

// Navigation tactile du tableau — v0.2
let lastPanEnd=0, zoom=1, drag=null, pinch=null;
const viewport=$("#tableViewport"), periodic=$("#periodic"), overview=$("#overview"), overviewWindow=$("#overviewWindow");
function setZoom(value){const oldW=periodic.scrollWidth, oldH=periodic.scrollHeight, cx=(viewport.scrollLeft+viewport.clientWidth/2)/(oldW||1),cy=(viewport.scrollTop+viewport.clientHeight/2)/(oldH||1);zoom=Math.min(1.8,Math.max(.5,value));periodic.style.setProperty("--cell",(56*zoom)+"px");periodic.style.setProperty("--row",(66*zoom)+"px");requestAnimationFrame(()=>centerAt(cx,cy));}
function centerAt(x,y){viewport.scrollLeft=Math.max(0,periodic.scrollWidth*x-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,periodic.scrollHeight*y-viewport.clientHeight/2);updateWindow()}
function updateWindow(){const w=periodic.scrollWidth||1,h=periodic.scrollHeight||1;overviewWindow.style.left=(viewport.scrollLeft/w*100)+"%";overviewWindow.style.top=(viewport.scrollTop/h*100)+"%";overviewWindow.style.width=(Math.min(1,viewport.clientWidth/w)*100)+"%";overviewWindow.style.height=(Math.min(1,viewport.clientHeight/h)*100)+"%";}
function buildOverview(){const og=$("#overviewGrid");og.innerHTML="";for(const e of elements){const tile=document.createElement("span");tile.className="overview-tile";tile.style.cssText=`grid-column:${e.c};grid-row:${e.r};background:${colors[e.family]}`;tile.title=e.name;og.append(tile)}updateWindow()}
overview.addEventListener("pointerdown",e=>{overview.setPointerCapture(e.pointerId);const r=overview.getBoundingClientRect();centerAt(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)))});
overview.addEventListener("pointermove",e=>{if(e.buttons){const r=overview.getBoundingClientRect();centerAt(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)))}});
viewport.addEventListener("scroll",updateWindow,{passive:true});window.addEventListener("resize",updateWindow);
viewport.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY}});
viewport.addEventListener("pointermove",e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7)lastPanEnd=Date.now()});
window.addEventListener("pointerup",()=>{drag=null});
viewport.addEventListener("pointercancel",()=>{drag=null;lastPanEnd=Date.now()});
$("#zoomIn").onclick=()=>setZoom(zoom+.2);$("#zoomOut").onclick=()=>setZoom(zoom-.2);$("#resetView").onclick=fitTable;

// v0.3: one history entry per open sheet; switching element replaces it.
let detailOpen=false, returnFocus=null, tablePosition=null, closing=false;
const detail=$("#detail"), backdrop=$("#detailBackdrop");
function openDetail(z,fromHistory=false){
  if(!detailOpen){
    returnFocus=document.activeElement;
    tablePosition={left:viewport.scrollLeft,top:viewport.scrollTop};
    detailOpen=true;
    document.body.classList.add("detail-open");
    detail.hidden=false;backdrop.hidden=false;
    document.querySelector("header").inert=true;
    document.querySelector("nav").inert=true;
    for(const child of $("#table").children)if(child!==detail&&child!==backdrop)child.inert=true;
    $("#closeDetail").focus({preventScroll:true});
  }
  detail.scrollTop=0;
  if(!fromHistory){
    const state={...history.state,nucleaDetail:z};
    if(history.state?.nucleaDetail)history.replaceState(state,"");
    else history.pushState(state,"");
  }
}
function hideDetail(){
  if(!detailOpen)return;
  detailOpen=false;closing=false;detail.hidden=true;backdrop.hidden=true;
  document.body.classList.remove("detail-open");
  document.querySelector("header").inert=false;document.querySelector("nav").inert=false;
  for(const child of $("#table").children)child.inert=false;
  if(tablePosition){viewport.scrollLeft=tablePosition.left;viewport.scrollTop=tablePosition.top;updateWindow()}
  const target=returnFocus?.isConnected?returnFocus:document.querySelector(`.element[data-z="${selected}"]`);
  target?.focus({preventScroll:true});
}
function closeDetail(){
  if(!detailOpen||closing)return;
  if(history.state?.nucleaDetail){closing=true;history.back()}
  else hideDetail();
}
window.addEventListener("popstate",()=>{
  closing=false;
  if(history.state?.nucleaDetail){showElement(history.state.nucleaDetail,false);openDetail(history.state.nucleaDetail,true)}
  else hideDetail();
});
$("#closeDetail").onclick=closeDetail;
backdrop.onclick=closeDetail;
document.addEventListener("keydown",e=>{
  if(!detailOpen)return;
  if(e.key==="Escape"){e.preventDefault();closeDetail()}
  if(e.key==="Tab"){
    const items=[...detail.querySelectorAll('button,select,a[href],input,[tabindex="0"]')];
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
function fitTable(){
  const available=viewport.clientWidth-16;
  if(window.matchMedia("(min-width: 701px) and (hover: hover) and (pointer: fine)").matches){
    setZoom(Math.max(.5,Math.min(1.8,(available-68)/(18*56))));
  }else setZoom(1);
  requestAnimationFrame(()=>centerAt(0,0));
}
// A reloaded page starts on the table; stale overlay state must not trap Back.
if(history.state?.nucleaDetail){const state={...history.state};delete state.nucleaDetail;history.replaceState(state,"")}

let lastViewportWidth=viewport.clientWidth;
new ResizeObserver(()=>{
  const width=viewport.clientWidth;
  if(width&&width!==lastViewportWidth){
    lastViewportWidth=width;
    if(window.matchMedia("(min-width: 701px) and (hover: hover) and (pointer: fine)").matches&&!detailOpen)fitTable();
    else updateWindow();
  }
}).observe(viewport);

window.matchMedia("(hover: hover) and (pointer: fine)").addEventListener("change",()=>{if(!detailOpen)fitTable()});
