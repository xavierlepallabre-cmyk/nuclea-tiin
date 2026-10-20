(function(root){
 const unitGroups={count:{'sans unité':1},charge:{C:1},activity:{Bq:1,kBq:1e3,MBq:1e6},time:{s:1,min:60,h:3600,jours:86400},energy:{MeV:1,J:1/1.602176634e-13},dose:{mSv:1,'µSv':.001,Sv:1000},collective:{'H.mSv':1,'H.µSv':.001},length:{m:1,cm:.01,mm:.001}};
 function generate(theme,level,random=Math.random){
  if(!Number.isInteger(theme)||theme<0||theme>5||![1,2,3].includes(level))throw Error('Thème ou niveau invalide.');
  let dateParams=null;const pick=arr=>arr[Math.min(arr.length-1,Math.max(0,Math.floor(random()*arr.length)))],k=pick([1,2,3,4]),n=pick([1,2,3,4]);let question,answer,group,unit,hint,formula,numeric,correction,date=false;
  if(theme===0){const [z,a]=pick([[6,12],[6,14],[8,16],[11,23],[26,56],[27,60],[53,131],[92,235]]),neutrons=a-z;
   group='count';unit='sans unité';hint='Identifier protons, neutrons et nucléons.';
   if(level===1){question=`Un noyau possède Z = ${z} protons et N = ${neutrons} neutrons. Calculer A.`;answer=a;formula='A = Z + N';numeric=`${z} + ${neutrons} = ${a}`;}
   else if(level===2){question=`Une fiche indique A = ${a} et Z = ${z}. Combien de neutrons contient ce noyau ?`;answer=neutrons;formula='N = A − Z';numeric=`${a} − ${z} = ${neutrons}`;}
   else{question=`Lors de l’étude d’une ionisation, un atome de Z = ${z} a perdu ${k} électron(s). Calculer sa charge en coulombs, avec e = 1,602176634 × 10⁻¹⁹ C.`;answer=k*1.602176634e-19;group='charge';unit='C';formula='q = (Z − nₑ)e';numeric=`nₑ = ${z} − ${k} ; q = ${k} × 1,602176634 × 10⁻¹⁹ C.`;}
  }else if(theme===1){const a0=800*k,half=8,days=n*half;group=level===3?'time':'activity';unit=level===3?'jours':'kBq';hint='Compter les périodes ou utiliser le logarithme pour une activité cible.';
   if(level===1){question=`Une source de ${a0} kBq a une période de ${half} jours. Quelle activité reste-t-il après ${days} jours ?`;answer=a0*1000/2**n;formula='A = A₀ / 2ⁿ ; n = t/T½';numeric=`n = ${days}/${half} = ${n} ; A = ${a0}/2^${n} = ${a0/2**n} kBq.`;}
   else if(level===2){question=`Activité initiale : ${a0*1000} Bq. Période : 2 h. Durée : ${120*n} min. Calculer l’activité restante en kBq.`;answer=a0*1000/2**n;formula='A = A₀ × 2⁻⁽ᵗ/ᵀ½⁾';numeric=`${120*n} min = ${2*n} h ; n = ${n} ; A = ${a0/2**n} kBq.`;}
   else{question=`Préparation d’une source pédagogique isolée : de ${a0} kBq à ${a0/8} kBq, période 8 jours. Quelle attente faut-il prévoir ? L’activité des descendants n’est pas incluse.`;answer=24*86400;formula='t = T½ ln(A₀/A)/ln(2)';numeric=`Le rapport est 8 = 2³ ; t = 3 × 8 = 24 jours.`;}
  }else if(theme===2){const delta=.01*k,energy=delta*931.5;hint='Employer un défaut de masse, jamais la masse atomique moyenne.';group='energy';unit=level===2?'J':'MeV';
   if(level===1){question=`Un défaut de masse vaut ${delta} u. Calculer l’énergie correspondante en MeV avec 1 u c² = 931,5 MeV.`;answer=energy;formula='E = Δm c²';numeric=`E = ${delta} × 931,5 = ${energy} MeV.`;}
   else if(level===2){question=`Une réaction libère ${k} MeV. Convertir cette énergie en joules (1 eV = 1,602176634 × 10⁻¹⁹ J).`;answer=k;formula='1 MeV = 10⁶ eV';numeric=`E = ${k} × 10⁶ × 1,602176634 × 10⁻¹⁹ J.`;}
   else{const a=10*k;question=`Étude pédagogique d’un noyau fictif de A = ${a} : Δm = ${delta} u. Calculer son énergie de liaison par nucléon en MeV/nucléon. Aucun isotope réel n’est attribué à ces données.`;answer=energy/a;group='perNucleon';unit='MeV/nucléon';formula='E/A = Δm c²/A';numeric=`E/A = ${delta} × 931,5 / ${a} = ${energy/a} MeV/nucléon.`;}
  }else if(theme===3){hint='Convertir la durée en heures ; distinguer dose individuelle et somme collective.';group='dose';unit='mSv';
   if(level===1){question=`Débit constant : ${.2*k} mSv/h pendant 2 h. Calculer la dose individuelle.`;answer=.4*k;formula='H = débit × t';numeric=`H = ${.2*k} × 2 = ${.4*k} mSv.`;}
   else if(level===2){question=`Débit constant : ${120*k} µSv/h pendant 15 min. Calculer la dose en µSv.`;answer=.03*k;unit='µSv';formula='H = débit × t';numeric=`15 min = 0,25 h ; H = ${120*k} × 0,25 = ${30*k} µSv.`;}
   else{question=`DATE : pendant 30 min, un intervenant travaille à ${.2*k} mSv/h ; le chargé de travaux reste au repli à ${.02*k} mSv/h. Calculer la dose collective en H.mSv.`;answer=.11*k;group='collective';unit='H.mSv';date=true;dateParams={kind:'prepare',rate:.2*k,retreat:.02*k,minutes:30};formula='Hcollective = Σ (débit au point occupé × durée)';numeric=`30 min = 0,5 h ; somme = (${.2*k} + ${.02*k}) × 0,5 = ${.11*k} H.mSv.`;}
  }else if(theme===4){hint='Préciser le modèle : source ponctuelle ou transmission d’un écran. Compter aussi la pose et le retrait.';
   if(level===1){question=`Source ponctuelle : ${100*k} µSv/h à 1 m. Quel débit à 2 m, sans écran ni diffusion ?`;answer=25*k;group='rate';unit='µSv/h';formula='débit₂ = débit₁(r₁/r₂)²';numeric=`${100*k} × (1/2)² = ${25*k} µSv/h.`;}
   else if(level===2){question=`Une intensité initiale de ${800*k} unités traverse ${n} CDA. Donner la fraction restante en pourcentage.`;answer=100/2**n;group='percent';unit='%';formula='I/I₀ = 1/2ⁿ';numeric=`100/2^${n} = ${100/2**n} %.`;}
   else{question=`DATE : deux personnes travaillent 30 min à ${.1*k} mSv/h. Un écran transmet 50 % ; sa pose et son retrait prennent ensemble 20 min par deux personnes au débit sans écran. Calculer le gain de dose collective (sans écran moins avec écran) en H.mSv.`;answer=(.1*k)-(.05*k+(.1*k)*2/3);group='collective';unit='H.mSv';date=true;dateParams={kind:'screen',rate:.1*k,minutes:30};formula='Gain = dose sans écran − (dose de travail avec écran + dose pose/retrait)';numeric=`Sans : ${.1*k} H.mSv ; avec : ${.05*k} + ${.1*k*2/3} H.mSv. Le gain est négatif : l’écran augmente ici la collective.`;}
  }else{hint='Écrire le facteur de conversion avant le calcul.';
   if(level===1){question=`Convertir ${k} MBq en Bq.`;answer=k*1e6;group='activity';unit='Bq';formula='1 MBq = 10⁶ Bq';numeric=`${k} × 10⁶ Bq.`;}
   else if(level===2){question=`Convertir ${250*k} µSv en mSv.`;answer=.25*k;group='dose';unit='mSv';formula='1 mSv = 1 000 µSv';numeric=`${250*k}/1000 = ${.25*k} mSv.`;}
   else{question=`Un mode opératoire comporte ${15*k} minutes de présence. Pour un calcul de dose, exprimer cette durée en heures.`;answer=15*k*60;group='time';unit='h';formula='1 h = 60 min';numeric=`${15*k}/60 = ${.25*k} h.`;}
  }
  correction=numeric+' Vérifier l’unité demandée et les hypothèses du modèle.';
  return {theme,level,question,answer,group,unit,hints:[hint,formula,numeric,correction],date,dateParams};
 }
 unitGroups.perNucleon={'MeV/nucléon':1,'keV/nucléon':.001};unitGroups.rate={'µSv/h':1,'mSv/h':1000};unitGroups.percent={'%':1};
 function check(ex,value,unit){const allowed=unitGroups[ex.group];if(!allowed||!Object.hasOwn(allowed,unit))return {kind:'unit',message:'L’unité ne correspond pas à la grandeur demandée.'};
 const s=String(value).trim().replace(',','.');if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s)||!Number.isFinite(Number(s)))return {kind:'input',message:'Saisir un nombre fini (virgule, point ou e).'};
 const got=Number(s)*allowed[unit],tolerance=Math.max(Math.abs(ex.answer)*.015,1e-30);
 return Math.abs(got-ex.answer)<=tolerance?{kind:'ok',message:'La valeur est cohérente avec le modèle et l’unité choisie.'}:{kind:'value',message:'L’unité convient. Revoir les valeurs, conversions et étapes du calcul avec les aides.'};
 }
 const api={generate,check,unitGroups};root.LearningExercises=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 document.addEventListener('DOMContentLoaded',()=>{
  const $=s=>document.querySelector(s),host=$('#exerciseTools');let ex=null,help=0,theme=0,level=1;
  const THEMES=[
   ['Atome et noyau','<circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)"/>'],
   ['Activité et décroissance','<path d="M4 5c3 0 4 9 8 11s5 2 8 2"/><path d="M4 20h16M4 4v16"/>'],
   ['Masse et énergie','<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>'],
   ['Dose et débit de dose','<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10 7h4M10 11h4"/><circle cx="12" cy="16" r="1.6"/>'],
   ['Distance et écrans','<circle cx="5" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 1 0 7"/><rect x="13" y="4" width="4" height="16" rx="1"/><path d="M19 12h2"/>'],
   ['Conversions et repères','<path d="M4 8h13l-3-3M20 16H7l3 3"/>']
  ];
  const LEVELS=[[1,'Direct','Application directe'],[2,'Calculs','Calculs et conversions'],[3,'Situation','Situation TIIN']];
  const UNIT_LABELS={count:'Nombre',charge:'Charge',activity:'Activité',time:'Durée',energy:'Énergie',perNucleon:'Énergie par nucléon',dose:'Dose',rate:'Débit de dose',collective:'Dose collective',length:'Longueur',percent:'Pourcentage'};
  host.innerHTML=`<div class="ex-pick card">
   <div class="ex-step"><h2 class="ex-label" id="exThemeLabel">Thème</h2>
    <div id="exerciseTheme" class="ex-themes" role="radiogroup" aria-labelledby="exThemeLabel">${THEMES.map(([name,icon],i)=>`<button type="button" role="radio" class="ex-theme" data-value="${i}" aria-checked="false"><svg aria-hidden="true" viewBox="0 0 24 24">${icon}</svg><span>${name}</span></button>`).join('')}</div></div>
   <div class="ex-step"><h2 class="ex-label" id="exLevelLabel">Niveau</h2>
    <div id="exerciseLevel" class="ex-levels" role="radiogroup" aria-labelledby="exLevelLabel">${LEVELS.map(([v,short,long])=>`<button type="button" role="radio" class="ex-level" data-value="${v}" aria-checked="false" title="${long}"><b>${v}</b><span>${short}</span></button>`).join('')}</div>
    <p class="ex-level-hint" id="exLevelHint"></p></div>
  </div>
  <article class="card ex-card" aria-labelledby="exerciseQuestion">
   <div class="ex-card-head"><span class="ex-meta" id="exMeta"></span><button id="exerciseNew" type="button" class="ex-link"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></svg>Autre énoncé</button></div>
   <h2 id="exerciseQuestion"></h2>
   <form id="exForm" class="ex-answer" novalidate>
    <div class="ex-field"><label for="exerciseAnswer">Ma réponse</label><input data-scientific inputmode="decimal" id="exerciseAnswer" autocomplete="off" placeholder="ex. 2,5 ou 3e-6"></div>
    <div class="ex-field ex-unit"><label for="exerciseUnit">Unité</label><select id="exerciseUnit"></select></div>
    <button id="exerciseCheck" type="submit" class="btn btn-primary ex-check">Vérifier</button>
   </form>
   <div id="exerciseFeedback" class="ex-feedback" role="status" hidden></div>
   <button id="exerciseNext" type="button" class="btn btn-primary ex-next" hidden>Exercice suivant →</button>
   <ol id="exerciseHints" class="ex-hints"></ol>
   <div class="ex-tools">
    <button id="exerciseHelp" type="button" class="ex-link"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5v.01"/></svg><span id="exHelpText">Un coup de pouce</span></button>
    <button id="exerciseFormula" type="button" class="ex-link"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8.5 8.5h7M8.5 12h3M14 12h1.5M8.5 15.5h3"/></svg>Formulaire</button>
    <button id="exerciseDate" type="button" class="ex-link" hidden><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4z"/></svg>Explorer DATE</button>
   </div>
  </article>
  <p class="ex-note">Aucun résultat n’est enregistré. Ta réponse en cours reste là si tu changes d’onglet.</p>`;
  // Unités regroupées par grandeur : l'élève choisit encore l'unité, mais dans une liste lisible.
  for(const [group,units] of Object.entries(unitGroups)){const og=document.createElement('optgroup');og.label=UNIT_LABELS[group]||group;for(const unit of Object.keys(units)){if($('#exerciseUnit').querySelector(`option[value="${CSS.escape(unit)}"]`))continue;const o=document.createElement('option');o.value=unit;o.textContent=unit;og.append(o)}if(og.children.length)$('#exerciseUnit').append(og)}
  const mark=(sel,val)=>document.querySelectorAll(sel+' [role="radio"]').forEach(b=>{const on=+b.dataset.value===val;b.setAttribute('aria-checked',String(on));b.tabIndex=on?0:-1});
  function start(){
   ex=generate(theme,level);help=0;mark('#exerciseTheme',theme);mark('#exerciseLevel',level);
   $('#exLevelHint').textContent=LEVELS[level-1][2];
   $('#exMeta').textContent=`${THEMES[theme][0]} · niveau ${level}`;
   $('#exerciseQuestion').textContent=ex.question;$('#exerciseAnswer').value='';$('#exerciseUnit').value=ex.unit;
   const fb=$('#exerciseFeedback');fb.hidden=true;fb.textContent='';fb.className='ex-feedback';
   $('#exerciseNext').hidden=true;$('#exerciseHints').replaceChildren();$('#exerciseHelp').disabled=false;$('#exHelpText').textContent='Un coup de pouce';$('#exerciseDate').hidden=!ex.date;
  }
  // Sélecteurs à choix unique : clic, et flèches du clavier comme un vrai groupe radio.
  function radios(sel,set){const g=$(sel);g.addEventListener('click',e=>{const b=e.target.closest('[role="radio"]');if(b){set(+b.dataset.value);start()}});
   g.addEventListener('keydown',e=>{const list=[...g.querySelectorAll('[role="radio"]')],i=list.indexOf(document.activeElement);if(i<0)return;const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(!d)return;e.preventDefault();const n=list[(i+d+list.length)%list.length];set(+n.dataset.value);start();n.focus()})}
  radios('#exerciseTheme',v=>theme=v);radios('#exerciseLevel',v=>level=v);
  $('#exerciseNew').onclick=start;$('#exerciseNext').onclick=()=>{start();$('#exerciseAnswer').focus({preventScroll:true});$('#exerciseQuestion').scrollIntoView({block:'center',behavior:'smooth'})};
  $('#exForm').onsubmit=e=>{e.preventDefault();const r=check(ex,$('#exerciseAnswer').value,$('#exerciseUnit').value),fb=$('#exerciseFeedback');
   fb.hidden=false;fb.className='ex-feedback is-'+r.kind;
   fb.innerHTML='<strong>'+({ok:'Bravo !',unit:'Attention à l’unité',input:'Réponse illisible',value:'Pas encore'})[r.kind]+'</strong><span></span>';fb.querySelector('span').textContent=r.message;
   $('#exerciseNext').hidden=r.kind!=='ok'};
  $('#exerciseHelp').onclick=()=>{if(help>=4)return;const li=document.createElement('li');li.innerHTML='<b></b> ';li.firstChild.textContent=['Indice','Formule','Application','Correction'][help];li.append(ex.hints[help]);$('#exerciseHints').append(li);help++;
   $('#exerciseHelp').disabled=help===4;$('#exHelpText').textContent=help===4?'Correction affichée':help===3?'Voir la correction':'Aide suivante ('+(help+1)+'/4)'};
  $('#exerciseFormula').onclick=()=>document.querySelector('[data-tab="formulas"]').click();
  $('#exerciseDate').onclick=()=>{document.querySelector('[data-tab="explore"]').click();if(ex.dateParams&&DateLearning.applyExercise)DateLearning.applyExercise(ex.dateParams);$('#dateTool').scrollIntoView({block:'start'})};
  // Un changement d'unité équivalente conserve la grandeur ; les unités incompatibles restent proposées pour le diagnostic.
  let previousUnit=null;$('#exerciseUnit').addEventListener('focus',()=>previousUnit=$('#exerciseUnit').value);$('#exerciseUnit').onchange=()=>{const allowed=unitGroups[ex.group],next=$('#exerciseUnit').value;if(previousUnit&&allowed[previousUnit]&&allowed[next]&&$('#exerciseAnswer').value.trim()){try{$('#exerciseAnswer').value=String(Number($('#exerciseAnswer').value.replace(',','.'))*allowed[previousUnit]/allowed[next])}catch(e){}}previousUnit=next};start();
 });
})(globalThis);
