const familyNames={alcalin:"Métaux alcalins",terreux:"Alcalino-terreux",transition:"Métaux de transition",pauvre:"Métaux pauvres",metalloide:"Métalloïdes",nonmetal:"Autres non-métaux",halogene:"Halogènes",noble:"Gaz nobles",lanthanide:"Lanthanides",actinide:"Actinides"};const colors=Object.fromEntries(["alcalin","terreux","transition","pauvre","metalloide","nonmetal","halogene","noble","lanthanide","actinide"].map(k=>[k,`var(--f-${k})`]));const isotopeSelection={};let elements=[],selected=6,activeFamily=null,familyViewSnapshot=null;const $=s=>document.querySelector(s);const clean=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();const fmt=n=>Number(n).toLocaleString("fr-FR",{maximumFractionDigits:5});document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-tab]").forEach(x=>{x.classList.toggle("active",x===b);if(x===b)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current")});window.scrollTo({top:0});document.querySelectorAll("main > section.panel").forEach(x=>x.classList.toggle("hidden",x.id!==b.dataset.tab))});function renderTable(q=""){const grid=$("#periodic");grid.innerHTML="";let matches=[];for(const e of elements){if(activeFamily&&e.family!==activeFamily)continue;const match=!q||clean(e.name).includes(clean(q))||clean(e.s)===clean(q)||String(e.z)===q.trim();if(match)matches.push(e);const b=document.createElement("button");b.dataset.z=e.z;b.className="element"+(!match?" dim":"")+(selected===e.z?" selected":"");b.style.cssText=`--c:${e.c};--r:${e.r>7?e.r+1:e.r};--fam:${colors[e.family]}`;b.title=`${e.name} (${e.s}), Z=${e.z}`;b.setAttribute("aria-label",b.title);b.innerHTML=`<span class="z">${e.z}</span><span class="symbol">${e.s}</span><span class="reference-a">A réf. ${e.a}</span><span class="mass">${fmt(e.mass)} u</span><span class="element-name">${e.name}</span>`;b.onclick=()=>{if(Date.now()-lastPanEnd<280)return;showElement(e.z)};grid.append(b)}$("#results").textContent=q?`${matches.length} élément(s) trouvé(s)${activeFamily?" dans cette famille":""}`:activeFamily?`${matches.length} éléments dans cette famille`:"";}function showElement(z,open=true){selected=z;const e=elements.find(x=>x.z===z);if(!e)return;renderTable($("#search").value);const variants=isotopes[z]||[];const preferred=variants.find(v=>(v.label||String(v.a))===isotopeSelection[z])||variants.find(v=>v.a===e.a&&!v.label)||variants.find(v=>v.stable)||variants[0];const opts=variants.length?variants.map((v,i)=>`<option value="${i}" ${v===preferred?"selected":""}>${e.s}-${v.label||v.a}${v.stable?" (stable)":""}</option>`).join(""):`<option value="0">${e.s}-${e.a} (isotope de référence indicatif)</option>`;$("#detailContent").innerHTML=`<div class="detailhead"><div class="tile" style="--fam:${colors[e.family]}"><small>Z = ${e.z}</small><b>${e.s}</b><small>${fmt(e.mass)} u</small></div><div><h2>${e.name}</h2><div class="chips"><span class="chip">${familyNames[e.family]}</span><span class="chip">Numéro atomique ${e.z}</span></div><label for="iso">Isotope étudié</label><select id="iso">${opts}</select></div></div><div class="chain-launch"><button type="button" id="traceDecay" class="btn btn-primary" aria-expanded="false" aria-controls="decayPanel">Tracer la désintégration →</button><button type="button" id="studyDecay" class="btn btn-ghost">Étudier sa décroissance</button><small id="studyDecayHint"></small><button type="button" id="studyEnergy" class="btn btn-ghost">Énergie de liaison et Aston</button><small id="studyEnergyHint"></small><small>Depuis l’isotope sélectionné jusqu’au premier noyau stable.</small></div><section id="decayPanel" hidden aria-labelledby="decayTitle"><div class="chain-heading"><h3 id="decayTitle">Parcours de désintégration</h3><button id="hideDecay" class="btn btn-ghost" type="button">Masquer le parcours</button></div><p class="chain-method">Parcours isotopique simplifié : les états excités intermédiaires ne sont pas tous représentés. La fission et les données manquantes interrompent le tracé.</p><p class="chain-method">À chaque étape, le mode le plus probable renseigné est choisi si les probabilités sont comparables ; sinon, le premier mode de la source est utilisé. Tu peux changer de branche.</p><p id="decayStatus" role="status"></p><ol id="decayPath" class="decay-path"></ol><details class="chain-precision"><summary>Sources et lecture du parcours</summary><p>Les périodes et les modes viennent des données AIEA embarquées. Les flèches suivent les bilans A et Z ; sauf état métastable explicitement renseigné, le niveau du fils est représenté au fondamental et les transitions rapides sont omises.</p><p>Pour Cs-137, les branches vers Ba-137m, Ba-137 fondamental et le niveau à 283,50 keV sont distinguées d’après <a href="https://www.nndc.bnl.gov/nudat3/getdecaydataset.jsp?dsid=137cs+bM+decay&amp;nucleus=137BA" target="_blank" rel="noopener noreferrer">NNDC / ENSDF</a>. Les pourcentages arrondis sont locaux à chaque étape, avec leurs incertitudes ENSDF ; ils ne sont pas une probabilité cumulée.</p><p>La période décrit une population de noyaux. Elle ne prédit pas la date de désintégration d’un noyau et les périodes ne s’additionnent pas pour donner une durée du parcours.</p></details></section><div id="isoData"></div><div class="note">La masse atomique moyenne (${fmt(e.mass)} u) n'est pas la masse du noyau. Le nombre de masse A est un entier propre à chaque isotope.</div>`;let chainShown=false,chainChoices={};
const drawChain=()=>renderDecayPath(e,variants[Number($("#iso").value)],chainChoices);
$("#traceDecay").onclick=()=>{chainShown=true;$("#decayPanel").hidden=false;$("#traceDecay").setAttribute("aria-expanded","true");drawChain();$("#decayTitle").tabIndex=-1;$("#decayTitle").focus({preventScroll:true});$("#decayPanel").scrollIntoView({block:"start",behavior:"instant"})};
$("#hideDecay").onclick=()=>{chainShown=false;$("#decayPanel").hidden=true;$("#traceDecay").setAttribute("aria-expanded","false");$("#traceDecay").focus({preventScroll:true})};
$("#decayPath").onchange=event=>{const input=event.target.closest("select[data-chain-step]");if(!input)return;const keep=+input.dataset.chainStep;const current=DecayChain.trace(isotopes,e.z,variants[Number($("#iso").value)],chainChoices);chainChoices=Object.fromEntries(current.nodes.slice(0,keep).filter(n=>n.choice!==undefined).map(n=>[n.id,n.choice]));chainChoices[input.dataset.chainId]=+input.value;drawChain();$("#decayPath").querySelector(`[data-chain-step="${keep}"]`)?.focus({preventScroll:true})};
$("#iso").onchange=()=>{isotopeSelection[z]=variants[Number($("#iso").value)].label||String(variants[Number($("#iso").value)].a);chainChoices={};renderIso(e,variants);if(chainShown)drawChain()};renderIso(e,variants);if(open)openDetail(z)}const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
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
let pendingDecayCalculation=null,pendingEnergy=null;
// v0.15 : masse atomique de l'isotope et masse de son noyau (calcul dans nuclear-mass.js).
function isoMasses(e,v){const row=nuclearProperties[`${e.z}:${v.a}`];return row&&window.NuclearMass?NuclearMass.masses(row,v.label?v.energy:0):null}
function massRows(e,v){
 const m=isoMasses(e,v),none='<span class="mass-none">Donnée indisponible</span>';
 if(!m)return `<li><span>Masse atomique de l’isotope</span><span>${none}</span></li><li><span>Masse du noyau</span><span>${none}</span></li>`;
 const tag=m.exact?"exacte par définition de l’unité u":m.estimated?"estimée (systématique AME2020, non mesurée)":m.excited?"fondamental AME2020 + énergie d’excitation":"AME2020";
 const atom=`<span class="mass"><strong>${NuclearMass.formatU(m.atom,m.atomDecimals)} u</strong><small>${m.exact?"":esc(NuclearMass.formatUncMicro(m.atomUnc))+" · "}${tag}</small></span>`;
 const nuc=`<span class="mass"><strong>${NuclearMass.formatU(m.nucleus,m.nucleusDecimals)} u</strong><small>${esc(NuclearMass.formatUncMicro(m.nucleusUnc))} · ${m.estimated?"calculée à partir d’une masse estimée":"calculée, électrons retirés"}</small></span>`;
 return `<li class="mass-row"><span>Masse atomique de l’isotope<small>atome neutre, ${e.z} électron${e.z>1?"s":""} compris</small></span>${atom}</li><li class="mass-row"><span>Masse du noyau<small>noyau seul, sans électrons</small></span>${nuc}</li>`;
}
function massHelp(e,v){
 const m=isoMasses(e,v),k=m&&m.electronBindingKeV;
 const be=m?(k<1?`${Math.round(k*1000).toLocaleString("fr-FR")} eV`:`${k.toLocaleString("fr-FR",{maximumSignificantDigits:3})} keV`):"";
 return `<details class="mass-help"><summary>Masse de l’atome ou masse du noyau ?</summary>
 <p><strong>Masse atomique de l’isotope :</strong> l’atome neutre entier, électrons compris. À ne pas confondre avec la masse atomique moyenne de l’élément (mélange des isotopes naturels) ni avec le nombre de masse A, qui est un entier.</p>
 <p><strong>Masse du noyau :</strong> on retire la masse des ${e.z} électron${e.z>1?"s":""}, puis on rajoute leur énergie de liaison${m?` (environ ${be} pour cet atome)`:""} :<br><span class="mass-eq">m<sub>noyau</sub> = m<sub>atome</sub> − Z·m<sub>e</sub> + B<sub>e</sub>/c²</span><br>B<sub>e</sub> est estimée par une formule empirique : la masse du noyau est donc « calculée » et donnée avec son incertitude.</p>
 <p><strong>Pour l’énergie de liaison :</strong> Δm = Z·m<sub>p</sub> + N·m<sub>n</sub> − m<sub>noyau</sub>, puis E<sub>l</sub> = Δm × 931,494 MeV (Δm en u), puis E<sub>l</sub>/A.<br>m<sub>p</sub> = 1,007 276 467 u · m<sub>n</sub> = 1,008 664 916 u · m<sub>e</sub> = 0,000 548 580 u (CODATA 2022).</p>
 </details>`;
}
function renderIso(e,variants){
 const v=variants[Number($("#iso").value)]||{a:e.a,decays:[]};
 const timeMap={as:"as",ps:"ps",ns:"ns",us:"us",ms:"ms",s:"s",m:"min",h:"h",d:"d",Y:"y"};
 const eligible=!v.stable&&!!timeMap[v.unit]&&Number(v.half)>0&&(!v.operator||v.operator==="AP");
 $("#studyDecay").disabled=!eligible;
 $("#studyDecayHint").textContent=eligible?"Période préremplie dans le formulaire ; activité initiale à saisir.":v.stable?"Isotope stable : aucune décroissance radioactive à calculer.":"La période est absente, donnée comme limite ou non exploitable pour ce calcul.";
 $("#studyDecay").onclick=()=>{if(!eligible)return;pendingDecayCalculation={name:`${e.s}-${v.label||v.a}`,half:v.half,unit:timeMap[v.unit],unc:v.unc,approx:v.operator==="AP",extracted:v.extracted,url:`https://nds.iaea.org/relnsd/v1/data?fields=${v.source}&nuclides=${v.a}${e.s.toLowerCase()}`};closeDetail()};
 const energyRow=!v.label&&nuclearProperties[`${e.z}:${v.a}`];
 $("#studyEnergy").disabled=!energyRow||(!energyRow.massMicroU&&!energyRow.bindingKeVPerNucleon);
 $("#studyEnergy").title=v.label?"Les propriétés embarquées décrivent uniquement l’état fondamental.":"Calculer avec la masse de cet isotope, jamais la masse atomique moyenne.";
 $("#studyEnergyHint").textContent=v.label?"Masses et liaison disponibles uniquement pour le fondamental ; l’isomère ne sera pas remplacé automatiquement.":!energyRow?"Propriétés isotopiques absentes : calcul indisponible.":"Données de masse et de liaison de cet isotope, avec leurs sources.";
 $("#studyEnergy").onclick=()=>{pendingEnergy={z:e.z,v};closeDetail()};
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
 <ul class="iso-facts">
 <li><span>Notation nucléaire</span><span class="nuclide" aria-label="${e.s} ${esc(v.label||v.a)}, Z = ${e.z}"><span class="nuclide-idx" aria-hidden="true"><span>${esc(v.label||v.a)}</span><span>${e.z}</span></span><span aria-hidden="true">${e.s}</span></span></li>
 <li><span>État</span><span>${v.label?`Métastable, énergie d’excitation ${esc(v.energy)} keV`:"Fondamental"}</span></li>
 ${massRows(e,v)}
 <li><span>${v.stable?"Stabilité":"Période radioactive"}</span><span>${esc(period)}</span></li>
 <li><span>Abondance naturelle</span><span>${v.abundance?`${esc(v.abundance)} %${v.abundanceUnc?` (incertitude ENSDF : ${esc(v.abundanceUnc)})`:""}`:"Non renseignée dans la source"}</span></li>
 </ul>
 ${massHelp(e,v)}
 ${v.decays.length?`<h3>Modes de désintégration renseignés</h3><ul class="decay-list">${v.decays.map(d=>`<li><strong>${esc(modeNames[d.mode]||d.mode)}</strong>${d.percent?` : ${esc(d.percent)} %${d.unc?` (incertitude ENSDF : ${esc(d.unc)})`:""}`:" : proportion non renseignée"}<br><small>Noyau(x) fils : ${esc(daughterLabel(e,v,d.mode))}</small></li>`).join("")}</ul><p><small>Jusqu’à trois modes fournis par la source. Les noyaux fils sont déduits des bilans A et Z ; leurs états excités et les émissions γ ne sont pas détaillés.</small></p>`:!v.stable?"<p>Modes non renseignés ; cela ne signifie pas que cet isotope est stable.</p>":""}
 <details class="isotope-source"><summary>Source et précision des données</summary><p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">AIEA — LiveChart, données de ${e.s}-${esc(v.label||v.a)}</a></p><p>Extraction indiquée par la source : ${esc(v.extracted||"non renseignée")}. Téléchargement : 19 octobre 2026.<br>Limite bibliographique ENSDF : ${esc(v.cutoff||"non renseignée")}.<br>Évaluation : ${esc(v.authors||"non renseignée")}.</p><p>Les incertitudes sont reproduites en notation ENSDF : 12,32 (2) signifie 12,32 ± 0,02. Les valeurs vides restent non renseignées ; les signes &lt;, &gt;, ≥ et ≈ sont conservés.</p><p><a href="https://nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html" target="_blank" rel="noopener noreferrer">Documentation et références de LiveChart</a></p></details>`;
}
$("#search").addEventListener("input",e=>renderTable(e.target.value));
const formulas=[["1 · Atome et noyau", [["A = Z + N", "Z : protons ; N : neutrons ; A : nucléons."], ["N = A − Z", "Pour un isotope donné."], ["nₑ = Z", "Atome électriquement neutre."], ["q = (Z − nₑ) e", "Ion monoatomique ; e = 1,602 × 10⁻¹⁹ C."], ["1 u = 1,66054 × 10⁻²⁷ kg", "1 u c² = 931,5 MeV."]]], ["2 · Activité et décroissance", [["𝒜(t) = λ N(t)", "1 Bq = 1 désintégration par seconde."], ["N(t) = N₀ e⁻λᵗ", "Un seul radionucléide, sans filiation."], ["𝒜(t) = 𝒜₀ e⁻λᵗ", "Même hypothèse ; t et T½ dans la même unité."], ["λ = ln(2) / T½", "Constante de décroissance."], ["t = ln(𝒜₀ / 𝒜) / λ", "Activité initiale et finale connues."], ["𝒜 = 𝒜₀ / 2ⁿ", "Après n périodes radioactives."]]], ["3 · Masse et énergie", [["Δm = Zmₚ + Nmₙ − mₙₒᵧₐᵤ", "Employer la masse du noyau, pas la masse atomique moyenne."], ["E_liaison = Δm c²", "Si Δm en u : E_liaison [MeV] = 931,5 × Δm [u]."], ["E_liaison / A", "Énergie de liaison par nucléon."], ["E = mc²", "1 eV = 1,602 × 10⁻¹⁹ J ; 1 MeV = 10⁶ eV."]]], ["4 · Dose et débit de dose", [["D = E_déposée / m", "Dose absorbée ; 1 Gy = 1 J·kg⁻¹."], ["Hₜ = wᵣ Dₜ", "Dose équivalente (Sv), un rayonnement."], ["Hₜ = Σᵣ wᵣ Dₜ,ᵣ", "Plusieurs rayonnements."], ["Ḣ = ΔH / Δt", "Débit moyen de dose équivalente."], ["H = Ḣ × t", "Débit constant ; 1 mSv = 10³ µSv = 10⁻³ Sv."]]], ["5 · Distance et écrans", [["Ḣ₂ = Ḣ₁ × (r₁ / r₂)²", "Source ponctuelle, sans écran ni diffusion."], ["I = I₀ e⁻μˣ", "Faisceau étroit ; atténuation exponentielle."], ["CDA = ln(2) / μ", "Couche de demi-atténuation."], ["I = I₀ / 2ⁿ", "Après n CDA."], ["DATE", "Distance — Activité — Temps — Écran."]]], ["6 · Conversions et repères", [["k = 10³ ; M = 10⁶ ; G = 10⁹", "Préfixes multiplicateurs."], ["m = 10⁻³ ; µ = 10⁻⁶ ; n = 10⁻⁹", "Préfixes sous-multiples."], ["1 h = 3 600 s ; 1 j = 86 400 s", "Conversions de temps."], ["1 nm = 10⁻⁹ m ; 1 fm = 10⁻¹⁵ m", "Conversions de longueur."], ["c = 3,00 × 10⁸ m·s⁻¹", "Vitesse de la lumière dans le vide."], ["ln(2) ≈ 0,693", "Vérifier les unités avant tout calcul."]]]];$("#formulaList").innerHTML=formulas.map(([title,items])=>{const[num,...rest]=title.split(" · ");return `<article class="formula"><div class="formula-head"><span class="formula-num">${num}</span><h2>${rest.join(" · ")}</h2></div>${items.map(([eq,desc])=>`<div class="formula-item"><div class="eq">${eq}</div><p>${desc}</p></div>`).join("")}</article>`}).join("");fetch("elements.json").then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(a=>{elements=a;window.dispatchEvent(new Event("elementsready"));buildFamilyLegend();renderTable();buildOverview();requestAnimationFrame(()=>{fitTable()})}).catch(err=>{$("#detail").textContent="Impossible de charger les éléments : "+err.message});if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(console.warn);

// Navigation tactile du tableau — v0.2
let lastPanEnd=0, zoom=1, drag=null, pinch=null, cellStretch=1; // cellStretch : cases élargies quand la hauteur limite le zoom
const viewport=$("#tableViewport"), periodic=$("#periodic"), overview=$("#overview"), overviewWindow=$("#overviewWindow");
function setZoom(value){const oldW=periodic.scrollWidth, oldH=periodic.scrollHeight, cx=(viewport.scrollLeft+viewport.clientWidth/2)/(oldW||1),cy=(viewport.scrollTop+viewport.clientHeight/2)/(oldH||1);zoom=Math.min(2.8,Math.max(.3,value));periodic.dataset.density=zoom<(cellStretch>1?.5:.65)?"far":zoom<1.1?"medium":"near";periodic.style.setProperty("--cell",(56*zoom*cellStretch)+"px");periodic.style.setProperty("--row",(66*zoom)+"px");requestAnimationFrame(()=>centerAt(cx,cy));}
function centerAt(x,y){viewport.scrollLeft=Math.max(0,periodic.scrollWidth*x-viewport.clientWidth/2);viewport.scrollTop=Math.max(0,periodic.scrollHeight*y-viewport.clientHeight/2);updateWindow()}
function updateWindow(){const w=periodic.scrollWidth||1,h=periodic.scrollHeight||1;overviewWindow.style.left=(viewport.scrollLeft/w*100)+"%";overviewWindow.style.top=(viewport.scrollTop/h*100)+"%";overviewWindow.style.width=(Math.min(1,viewport.clientWidth/w)*100)+"%";overviewWindow.style.height=(Math.min(1,viewport.clientHeight/h)*100)+"%";}
function buildOverview(){const og=$("#overviewGrid");og.innerHTML="";for(const e of elements){if(activeFamily&&e.family!==activeFamily)continue;const tile=document.createElement("span");tile.className="overview-tile";tile.style.cssText=`grid-column:${e.c};grid-row:${e.r};background:${colors[e.family]}`;tile.title=e.name;og.append(tile)}updateWindow()}
overview.addEventListener("pointerdown",e=>{overview.setPointerCapture(e.pointerId);const r=overview.getBoundingClientRect();centerAt(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)))});
overview.addEventListener("pointermove",e=>{if(e.buttons){const r=overview.getBoundingClientRect();centerAt(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height)))}});
viewport.addEventListener("scroll",updateWindow,{passive:true});window.addEventListener("resize",updateWindow);
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
  if(pendingEnergy){const info=pendingEnergy;pendingEnergy=null;NuclearEnergy.open(info.z,info.v);}
  if(pendingDecayCalculation){
    const info=pendingDecayCalculation;pendingDecayCalculation=null;
    document.querySelector('nav [data-tab="formulas"]').click();
    RadioactiveDecay.prefill(info);
  }

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
    const items=[...detail.querySelectorAll('button,select,a[href],input,summary,[tabindex="0"]')].filter(x=>x.getClientRects().length&&!x.disabled);
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
function fitTable(){
  if(activeFamily){updateWindow();return;}
  if(!viewport.clientWidth)return; // tableau masqué : il sera ajusté à l'affichage de l'onglet
  if(window.matchMedia("(min-width: 701px)").matches){
    // v0.19 — tablette et ordinateur : tout le tableau tient dans l'écran d'accueil, en largeur et en hauteur.
    const byWidth=(viewport.clientWidth-16-68)/(18*56);
    const top=viewport.getBoundingClientRect().top+window.scrollY;
    const byHeight=(window.innerHeight-top-16-36-30)/(9.32*66);
    const z=Math.max(.55,Math.min(1.8,byWidth,byHeight));
    // Si la hauteur limite, les cases s'élargissent (jusqu'à 1,4 fois) pour occuper la largeur disponible.
    cellStretch=Math.max(1,Math.min(1.4,byWidth/z));setZoom(z);
  }else{cellStretch=1;setZoom(1)}
  requestAnimationFrame(()=>centerAt(0,0));
}
// A reloaded page starts on the table; stale overlay state must not trap Back.
if(history.state?.nucleaDetail){const state={...history.state};delete state.nucleaDetail;history.replaceState(state,"")}

let lastViewportWidth=viewport.clientWidth;
new ResizeObserver(()=>{
  const width=viewport.clientWidth;
  if(width&&width!==lastViewportWidth){
    lastViewportWidth=width;
    if(window.matchMedia("(min-width: 701px)").matches&&!detailOpen)fitTable();
    else updateWindow();
  }
}).observe(viewport);

window.matchMedia("(hover: hover) and (pointer: fine)").addEventListener("change",()=>{if(!detailOpen)fitTable()});
// Le tableau peut être masqué au démarrage (onglet Parcours) : l'ajuster quand on l'affiche.
document.querySelector('nav [data-tab="table"]')?.addEventListener("click",()=>requestAnimationFrame(()=>{if(!detailOpen&&!activeFamily)fitTable()}));
window.matchMedia("(orientation: portrait)").addEventListener("change",()=>setTimeout(()=>{if(!detailOpen)fitTable()},250));

const familyDefinitions={
 alcalin:"Métaux du groupe 1, à l’exception de l’hydrogène. Leur électron externe se perd facilement : ils forment généralement des ions +1 et sont très réactifs.",
 terreux:"Métaux du groupe 2. Ils possèdent deux électrons externes et forment généralement des ions +2.",
 transition:"Métaux du bloc central du tableau. Ils conduisent bien l’électricité et présentent souvent plusieurs états d’oxydation. La classification pédagogique utilisée ici regroupe les métaux des colonnes 3 à 12, hors séries séparées.",
 pauvre:"Métaux du bloc p, situés à droite des métaux de transition. « Métaux pauvres » est une catégorie usuelle, dont les limites varient selon les classifications.",
 metalloide:"Éléments aux propriétés intermédiaires entre métaux et non-métaux. Certains sont semi-conducteurs. Cette catégorie n’a pas de frontière universellement fixée.",
 nonmetal:"Éléments non métalliques regroupés ici en dehors des halogènes et des gaz nobles. Leurs propriétés sont variées ; ils conduisent généralement mal l’électricité, avec des exceptions comme le graphite.",
 halogene:"Éléments du groupe 17. Les halogènes courants sont réactifs et peuvent former des ions −1. Les propriétés des éléments superlourds de ce groupe sont moins bien connues.",
 noble:"Éléments du groupe 18. Les gaz nobles courants ont une couche électronique externe complète et une faible réactivité chimique. L’oganesson est un élément superlourd dont les propriétés sont moins bien connues.",
 lanthanide:"Série des 15 éléments du lanthane au lutécium (Z = 57 à 71), présentée séparément pour alléger le tableau. Ces métaux ont des propriétés chimiques proches.",
 actinide:"Série des 15 éléments de l’actinium au lawrencium (Z = 89 à 103). Tous sont radioactifs ; elle comprend notamment le thorium, l’uranium et le plutonium."
};
function buildFamilyLegend(){
 $("#legend").innerHTML=Object.entries(familyNames).map(([k,v])=>`<button type="button" data-family="${k}" style="--fam:${colors[k]}" aria-pressed="false" aria-controls="periodic familyDefinition">${v}</button>`).join("");
 $("#legend").onclick=e=>{const b=e.target.closest("button[data-family]");if(b)toggleFamily(b.dataset.family)};
 $("#clearFamily").onclick=()=>toggleFamily(activeFamily);
}
function toggleFamily(key){
 if(!key)return;
 if(!activeFamily)familyViewSnapshot={zoom,left:viewport.scrollLeft,top:viewport.scrollTop};
 activeFamily=activeFamily===key?null:key;
 $("#table").classList.toggle("family-filtered",!!activeFamily);
 for(const b of $("#legend").querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.family===activeFamily));
 $("#familyDefinition").hidden=!activeFamily;
 if(activeFamily){
  $("#familyTitle").textContent=familyNames[activeFamily];
  $("#familyDescription").textContent=familyDefinitions[activeFamily];
  $("#familyDefinition").style.setProperty("--fam",colors[activeFamily]);
 }
 renderTable($("#search").value);buildOverview();
 if(activeFamily){viewport.scrollLeft=0;viewport.scrollTop=0;updateWindow()}
 else if(familyViewSnapshot){
  const saved=familyViewSnapshot;setZoom(saved.zoom);
  requestAnimationFrame(()=>{viewport.scrollLeft=saved.left;viewport.scrollTop=saved.top;updateWindow()});
  familyViewSnapshot=null;
 }
}

// v0.6 : thème clair / sombre et état du réseau.
(function(){
 const root=document.documentElement,media=window.matchMedia("(prefers-color-scheme: dark)");
 const current=()=>root.dataset.theme||(media.matches?"dark":"light");
 const syncMeta=()=>{const c=current()==="dark"?"#12204A":"#FFFFFF";document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{m.setAttribute("content",c);m.removeAttribute("media")});$("#themeToggle").setAttribute("aria-pressed",String(current()==="dark"))};
 $("#themeToggle").onclick=()=>{const next=current()==="dark"?"light":"dark";root.dataset.theme=next;try{localStorage.setItem("nuclea-theme",next)}catch(e){}syncMeta()};
 media.addEventListener("change",syncMeta);syncMeta();
 const net=()=>{$("#netStatus").hidden=navigator.onLine};
 window.addEventListener("online",net);window.addEventListener("offline",net);net();
})();

function chainPeriod(v){
 if(v.stable)return "Stable selon la source";
 if(!v.half)return "Période non renseignée";
 const op=operators[v.operator]||"";
 return unitNames[v.unit]?`T½ : ${op} ${v.half} ${unitNames[v.unit]}${v.unc?` (incertitude ENSDF : ${v.unc})`:""}`:`T½ : ${op} ${v.seconds||"non renseignée"} s (conversion AIEA depuis une largeur de niveau)`;
}
function renderDecayPath(e,v,choices){
 const result=DecayChain.trace(isotopes,e.z,v,choices);
 const last=result.nodes[result.nodes.length-1],lastElement=elements.find(x=>x.z===last.z);
 $("#decayStatus").className="chain-status "+(result.status==="stable"?"chain-success":"chain-stop");
 $("#decayStatus").textContent=result.status==="stable"?`${result.nodes.length-1} transition(s) représentée(s) → ${lastElement?.s||last.z}-${last.v.label||last.v.a}, stable. ${result.message}`:result.message;
 $("#decayPath").innerHTML=result.nodes.map((n,i)=>{
  const el=elements.find(x=>x.z===n.z),symbol=el?.s||`Z${n.z}`;
  const source=`https://nds.iaea.org/relnsd/v1/data?fields=${n.v.source||"ground_states"}&nuclides=${n.v.a}${symbol.toLowerCase()}`;
  const optionLabel=b=>`${modeNames[b.mode]||b.mode}${b.percent?` · ${b.percent} %`:" · proportion non renseignée"}${b.target?` → ${elements.find(x=>x.z===b.target.z)?.s||b.target.z}-${b.target.label||b.target.a}`:""}`;
  const b=n.branches[n.choice];
  return `<li class="chain-step" data-nuclide="${esc(n.id)}"><div class="chain-card ${n.v.stable?"chain-stable":""}"><span class="chain-index">${i===0?"Départ":`Étape ${i}`}</span><strong class="chain-nuclide">${symbol}-${esc(n.v.label||n.v.a)}${n.v.stable?' <span class="chain-stable-label">Stable</span>':""}</strong><span>${esc(el?.name||"")} · Z = ${n.z} · A = ${n.v.a} · N = ${n.v.a-n.z}</span><span>${esc(chainPeriod(n.v))}</span><a href="${esc(source)}" target="_blank" rel="noopener noreferrer">Source AIEA · extraction ${esc(n.v.extracted||"non renseignée")}</a></div>${b?`<div class="chain-arrow"><span aria-hidden="true">↓</span>${n.branches.length>1?`<label for="branch-${i}">Branche à suivre</label><select id="branch-${i}" data-chain-step="${i}" data-chain-id="${esc(n.id)}">${n.branches.map((x,j)=>`<option value="${j}" ${j===n.choice?"selected":""}>${esc(optionLabel(x))}</option>`).join("")}</select>`:`<strong>${esc(optionLabel(b))}</strong>`}${b.unc?`<small>Incertitude ENSDF sur le pourcentage : ${esc(b.unc)}</small>`:""}${b.note?`<small>${esc(b.note)}</small>`:""}${n.projected?"<small>Fils représenté au niveau isotopique ; états excités non détaillés.</small>":""}</div>`:""}</li>`;
 }).join("");
}
