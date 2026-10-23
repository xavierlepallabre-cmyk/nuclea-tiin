/* Nucléa TIIN v0.17 — moteur du parcours élève.
   Affiche les parcours décrits dans parcours-data.js, mémorise la progression via parcours-progress.js
   et ouvre les outils existants (fiches, calculateurs, visuels, exercices, DATE) sans les dupliquer. */
document.addEventListener('DOMContentLoaded',()=>{
 const host=document.querySelector('#parcours');if(!host||!window.NucleaParcoursData||!window.NucleaProgress)return;
 const D=NucleaParcoursData,P=NucleaProgress.store,PHASES=D.PHASES;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fr=(x,d=6)=>Number(x).toLocaleString('fr-FR',{maximumFractionDigits:d});
 const parcours=D.parcours.find(p=>p.available),pid=parcours.id,ids=parcours.steps.map(s=>s.id);
 let view={step:null,phase:0},returnTo=null;

 /* ---------- Ouverture des outils existants ---------- */
 const go=tab=>document.querySelector(`nav [data-tab="${tab}"]`)?.click();
 const timeMap={as:'as',ps:'ps',ns:'ns',us:'us',ms:'ms',s:'s',m:'min',h:'h',d:'d',Y:'y'};
 const Tools={
  table(){go('table')},
  element(a){go('table');isotopeSelection[a.z]=String(a.iso);showElement(a.z,true);
   if(a.chain)requestAnimationFrame(()=>{const b=$('#traceDecay');if(b&&b.getAttribute('aria-expanded')!=='true')b.click()})},
  visual(a){window.NucleaVisuals?.open(a.id)},
  decay(a){
   const el=elements.find(e=>e.z===a.z),v=(isotopes[a.z]||[]).find(x=>String(x.label||x.a)===String(a.iso));if(!el||!v)return;
   go('formulas');
   const mode=$('#rdMode');mode.value='activity';mode.dispatchEvent(new Event('change',{bubbles:true}));
   $('#rdInitial').value=a.initial;$('#rdInitialUnit').value=a.initialUnit;$('#rdDuration').value=a.duration;$('#rdDurationUnit').value=a.durationUnit;
   RadioactiveDecay.prefill({name:`${el.s}-${a.iso}`,half:v.half,unit:timeMap[v.unit],unc:v.unc,approx:v.operator==='AP',extracted:v.extracted,url:`https://nds.iaea.org/relnsd/v1/data?fields=${v.source}&nuclides=${v.a}${el.s.toLowerCase()}`});
   $('#rdForm').requestSubmit();$('#decayCalculator').scrollIntoView({block:'start'})},
  energy(a){NuclearEnergy.open(a.z,{a:a.a})},
  exercise(a){go('exercises');$(`#exerciseTheme [data-value="${a.theme}"]`)?.click();$(`#exerciseLevel [data-value="${a.level}"]`)?.click();$('#exerciseTools')?.scrollIntoView({block:'start'})},
  date(a){go('explore');const s=$('#dateTool');s?.querySelector(`[data-date="${a.mode}"]`)?.click();s?.scrollIntoView({block:'start'})},
  formulas(a){go('formulas');const d=document.querySelector(`#formulaList > details[data-topic="${a.topic}"]`);if(d){d.open=true;d.scrollIntoView({block:'start'})}}
 };
 function launch(action,blockId){
  const step=parcours.steps.find(s=>s.id===view.step);
  returnTo={step:view.step,phase:view.phase,block:blockId,title:step?step.title:'',n:ids.indexOf(view.step)+1};
  Tools[action.tool]?.(action);showReturn();
 }

 /* ---------- Bandeau « Retour au parcours » ---------- */
 const bar=document.createElement('div');bar.id='pcReturn';bar.className='pc-return';bar.hidden=true;
 bar.innerHTML='<button type="button" class="pc-return-go"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg><span></span></button><button type="button" class="pc-return-x" aria-label="Masquer ce rappel">×</button>';
 document.body.append(bar);
 function showReturn(){if(!returnTo)return;bar.querySelector('span').textContent=`Retour au parcours · étape ${returnTo.n}`;bar.querySelector('.pc-return-go').setAttribute('aria-label',`Retour à l’étape ${returnTo.n} : ${returnTo.title}`);bar.hidden=false;document.body.classList.add('pc-has-return')}
 function hideReturn(){bar.hidden=true;document.body.classList.remove('pc-has-return')}
 bar.querySelector('.pc-return-x').onclick=()=>{returnTo=null;hideReturn()};
 bar.querySelector('.pc-return-go').onclick=()=>{
  const back=()=>{const r=returnTo;returnTo=null;hideReturn();go('parcours');openStep(r.step,r.phase,r.block)};
  if(typeof detailOpen!=='undefined'&&detailOpen&&history.state?.nucleaDetail){window.addEventListener('popstate',()=>setTimeout(back,0),{once:true});closeDetail()}
  else{if(typeof detailOpen!=='undefined'&&detailOpen)hideDetail();back()}
 };
 // Revenir au parcours par l'onglet masque aussi le rappel.
 document.querySelector('nav [data-tab="parcours"]')?.addEventListener('click',()=>{if(!returnTo)return;returnTo=null;hideReturn()});

 /* ---------- Accueil du parcours ---------- */
 function renderHome(){
  view.step=null;
  const done=P.doneCount(pid,ids),started=ids.some(id=>P.status(pid,id)!=='todo'),next=P.resumeStep(pid,ids),nextStep=parcours.steps.find(s=>s.id===next),all=done===ids.length;
  const later=D.parcours.filter(p=>!p.available).map(p=>esc(p.title)).join(' · ');
  host.innerHTML=`<div class="page-head"><div><p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Démarrer ici</p><h1>Parcours élève</h1><p class="lead">Par où commencer ? Suis les étapes dans l’ordre en manipulant les outils, ou explore librement l’application.</p></div></div>
  <article class="card pc-hero" aria-labelledby="pcHeroTitle">
   <p class="pc-eyebrow">${esc(parcours.title)} · ${ids.length} étapes</p>
   <h2 id="pcHeroTitle">${all?'Parcours terminé':started?`Étape ${ids.indexOf(next)+1} : ${esc(nextStep.title)}`:'Commencer par la structure de l’atome'}</h2>
   <p>${esc(parcours.intro)}</p>
   <div class="pc-progress" role="progressbar" aria-label="Étapes terminées" aria-valuemin="0" aria-valuemax="${ids.length}" aria-valuenow="${done}"><span style="width:${100*done/ids.length}%"></span></div>
   <p class="pc-count">${done} étape${done>1?'s':''} terminée${done>1?'s':''} sur ${ids.length}</p>
   <div class="pc-actions"><button type="button" class="btn btn-primary" id="pcContinue">${all?'Revoir la première étape':started?'Continuer mon parcours':'Commencer le parcours'}</button><button type="button" class="btn btn-ghost" id="pcFree">Explorer librement</button></div>
  </article>
  <h2 class="pc-list-title">Les étapes</h2>
  <ol class="pc-steps">${parcours.steps.map((s,i)=>{const st=P.status(pid,s.id),cur=started&&s.id===next&&!all;return `<li><button type="button" class="pc-step${cur?' is-current':''}" data-step="${s.id}"><span class="pc-num pc-${st}" aria-hidden="true">${st==='done'?'✓':i+1}</span><span class="pc-step-text"><strong>${esc(s.title)}</strong><span>${esc(s.summary)}</span></span><span class="pc-chip pc-chip-${cur?'current':st}">${cur?'En cours':st==='done'?'Terminée':st==='started'?'Commencée':'À découvrir'}</span></button></li>`}).join('')}</ol>
  ${later?`<p class="pc-later"><b>À venir :</b> ${later}.</p>`:''}
  <div class="pc-store"><p>${P.persistent?'Ta progression est enregistrée sur cet appareil uniquement, sans compte.':esc(P.message)}</p>
   <button type="button" class="btn btn-ghost" id="pcReset">Réinitialiser le parcours</button>
   <div class="pc-confirm" id="pcConfirm" hidden><p>Effacer la progression des ${ids.length} étapes sur cet appareil ?</p><button type="button" class="btn btn-primary" id="pcResetYes">Oui, tout effacer</button><button type="button" class="btn btn-ghost" id="pcResetNo">Annuler</button></div></div>`;
  $('#pcContinue').onclick=()=>{P.setMode('parcours');const s=all?ids[0]:next;const st=P.step(pid,s);openStep(s,st&&!all?st.phase:0)};
  $('#pcFree').onclick=()=>{P.setMode('libre');go('table')};
  host.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{P.setMode('parcours');const st=P.step(pid,b.dataset.step);openStep(b.dataset.step,st?st.phase:0)});
  $('#pcReset').onclick=()=>{$('#pcConfirm').hidden=false;$('#pcResetNo').focus()};
  $('#pcResetNo').onclick=()=>{$('#pcConfirm').hidden=true;$('#pcReset').focus()};
  $('#pcResetYes').onclick=()=>{P.reset(pid);renderHome();$('#pcContinue').focus()};
 }

 /* ---------- Étape ---------- */
 function openStep(sid,phase=0,focusBlock){
  const step=parcours.steps.find(s=>s.id===sid);if(!step){renderHome();return}
  P.open(pid,sid);view={step:sid,phase};P.setPhase(pid,sid,phase);
  const i=ids.indexOf(sid),st=P.step(pid,sid),done=st.status==='done',last=phase===PHASES.length-1;
  const [pk,pname]=PHASES[phase];
  host.innerHTML=`<div class="pc-top"><button type="button" class="pc-back" id="pcBack"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>Toutes les étapes</button><span class="pc-where">Étape ${i+1} sur ${ids.length} · environ ${step.minutes} min</span></div>
  <h1 class="pc-title">${esc(step.title)}${done?' <span class="pc-chip pc-chip-done">Terminée</span>':''}</h1>
  <ol class="pc-phases" aria-label="Phases de l’étape">${PHASES.map(([k,n],j)=>`<li><button type="button" data-phase="${j}" ${j===phase?'aria-current="step"':''} class="${j<phase||done?'is-past':''}"><span>${j+1}</span>${n}</button></li>`).join('')}</ol>
  <article class="card pc-phase" aria-labelledby="pcPhaseTitle"><h2 id="pcPhaseTitle">${pname}</h2>${(step.phases[pk]||[]).map((b,k)=>block(b,`${sid}-${pk}-${k}`)).join('')}</article>
  <div class="pc-nav">${phase>0?`<button type="button" class="btn btn-ghost" data-go="${phase-1}">← ${PHASES[phase-1][1]}</button>`:'<span></span>'}
   ${last?(done?(i<ids.length-1?`<button type="button" class="btn btn-primary" id="pcNextStep">Étape suivante : ${esc(parcours.steps[i+1].title)} →</button>`:'<button type="button" class="btn btn-primary" id="pcHome">Retour au parcours</button>'):'<button type="button" class="btn btn-primary" id="pcFinish">Terminer l’étape</button>'):`<button type="button" class="btn btn-primary" data-go="${phase+1}">${PHASES[phase+1][1]} →</button>`}</div>
  <p class="pc-restart"><button type="button" class="pc-link" id="pcRestart">Recommencer cette étape</button></p>`;
  $('#pcBack').onclick=()=>{renderHome();host.querySelector(`[data-step="${sid}"]`)?.focus()};
  host.querySelectorAll('[data-phase],[data-go]').forEach(b=>b.onclick=()=>{openStep(sid,+(b.dataset.phase??b.dataset.go));focusTitle()});
  $('#pcFinish')&&($('#pcFinish').onclick=()=>{P.complete(pid,sid);openStep(sid,phase);$('#pcNextStep,#pcHome')?.focus()});
  $('#pcNextStep')&&($('#pcNextStep').onclick=()=>{openStep(ids[i+1],0);focusTitle()});
  $('#pcHome')&&($('#pcHome').onclick=()=>renderHome());
  $('#pcRestart').onclick=()=>{P.restartStep(pid,sid);openStep(sid,0);focusTitle()};
  wire(sid);
  if(focusBlock){const el=host.querySelector(`[data-block="${focusBlock}"]`);if(el){el.scrollIntoView({block:'center'});el.querySelector('input,button')?.focus({preventScroll:true})}}
  else window.scrollTo({top:0});
 }
 const focusTitle=()=>{const t=host.querySelector('.pc-title');if(t){t.tabIndex=-1;t.focus({preventScroll:true})}window.scrollTo({top:0})};

 /* ---------- Blocs ---------- */
 const toolBtn=(a,label,id)=>`<button type="button" class="pc-tool" data-tool='${esc(JSON.stringify(a))}' data-for="${id}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>${esc(label||toolLabel(a))}</button>`;
 function toolLabel(a){
  const el=a.z?elements.find(e=>e.z===a.z):null;
  return {table:'Ouvrir le tableau périodique',element:el?`Ouvrir la fiche ${el.s}-${a.iso} (${el.name.toLowerCase()})`:'Ouvrir la fiche',visual:`Ouvrir le visuel « ${({decroissance:'Décroissance radioactive',attenuation:'Atténuation des gamma',distance:'Débit de dose et distance',desintegrations:'Désintégrations α, β, γ',filiation:'Chaîne de filiation'})[a.id]||a.id} »`,decay:'Ouvrir le calculateur de décroissance',energy:'Ouvrir le calculateur d’énergie de liaison',exercise:'Ouvrir les exercices',date:'Ouvrir l’outil DATE',formulas:'Ouvrir le formulaire'}[a.tool]||'Ouvrir l’outil';
 }
 function block(b,id){
  if(b.type==='text')return `<p class="pc-text">${b.html}</p>`;
  if(b.type==='keys')return `<div class="pc-keys"><p>À retenir</p><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  if(b.type==='tool')return `<div class="pc-block" data-block="${id}">${toolBtn(b.action,b.label,id)}</div>`;
  const t=P.task(pid,view.step,b.id),tool=b.action?toolBtn(b.action,null,id):'';
  if(b.type==='read')return `<div class="pc-block pc-task" data-block="${id}" data-task="${b.id}"><p class="pc-q">${b.q}</p>${tool}
   <form class="pc-answer" novalidate><label class="sr-only" for="in-${b.id}">Ta réponse</label><input id="in-${b.id}" inputmode="decimal" autocomplete="off" placeholder="Ta réponse" value="${t?esc(t.value):''}" ${t&&t.ok?'readonly':''}>${b.answer.unit?`<span class="pc-unit">${esc(b.answer.unit)}</span>`:''}<button type="submit" class="btn btn-primary" ${t&&t.ok?'disabled':''}>Vérifier</button></form>
   <div class="pc-feedback" role="status">${t?feedbackRead(b,t):''}</div></div>`;
  if(b.type==='choice')return `<div class="pc-block pc-task" data-block="${id}" data-task="${b.id}"><p class="pc-q" id="q-${b.id}">${b.q}</p>${tool}
   <div class="pc-options" role="group" aria-labelledby="q-${b.id}">${b.options.map((o,k)=>`<button type="button" data-opt="${k}" ${t&&t.ok?'disabled':''} class="${t&&t.ok&&k===b.correct?'is-right':''}">${o}</button>`).join('')}</div>
   <div class="pc-feedback" role="status">${t?feedbackChoice(b,t):''}</div></div>`;
  return '';
 }
 const expected=b=>`${fr(b.answer.value)}${b.answer.unit?' '+b.answer.unit:''}`;
 function feedbackRead(b,t){
  if(t.ok)return `<p class="pc-ok"><b>Correct.</b> ${b.explain||''}</p>`;
  if(t.tries>=2)return `<p class="pc-no"><b>Réponse attendue : ${esc(expected(b))}.</b> ${b.explain||''} Tu peux corriger ta saisie.</p>`;
  return `<p class="pc-no"><b>Pas encore.</b> ${b.hint||'Vérifie ta lecture et ton unité.'}</p>`;
 }
 function feedbackChoice(b,t){return t.ok?`<p class="pc-ok"><b>Correct.</b> ${b.explain||''}</p>`:`<p class="pc-no"><b>Pas encore.</b> ${t.tries>=2?b.explain:'Relis la consigne ou rouvre l’outil, puis essaie une autre réponse.'}</p>`}
 // Saisie libre : virgule ou point, espaces ignorés, notation 3e-6 acceptée.
 function parse(s){const c=String(s).replace(/[\s  ]/g,'').replace(',','.');return /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(c)?Number(c):NaN}
 function isRight(ans,x){const tol=ans.rel?Math.abs(ans.value)*ans.tol:ans.tol;return Number.isFinite(x)&&Math.abs(x-ans.value)<=tol+1e-12}
 function wire(sid){
  const step=parcours.steps.find(s=>s.id===sid),blocks=Object.values(step.phases).flat();
  host.querySelectorAll('.pc-tool').forEach(b=>b.onclick=()=>launch(JSON.parse(b.dataset.tool),b.dataset.for));
  host.querySelectorAll('.pc-task').forEach(el=>{
   const b=blocks.find(x=>x.id===el.dataset.task),fb=el.querySelector('.pc-feedback');
   if(b.type==='read')el.querySelector('form').onsubmit=e=>{e.preventDefault();const input=el.querySelector('input');if(input.readOnly)return;
    const x=parse(input.value);if(!Number.isFinite(x)){fb.innerHTML='<p class="pc-no">Saisis un nombre, par exemple 26 ou 1925,28.</p>';return}
    const t=P.recordTask(pid,sid,b.id,isRight(b.answer,x),input.value);fb.innerHTML=feedbackRead(b,t);if(t.ok){input.readOnly=true;el.querySelector('button[type=submit]').disabled=true}};
   if(b.type==='choice')el.querySelectorAll('[data-opt]').forEach(o=>o.onclick=()=>{const k=+o.dataset.opt,ok=k===b.correct,t=P.recordTask(pid,sid,b.id,ok,String(k));
    o.classList.add(ok?'is-right':'is-wrong');fb.innerHTML=feedbackChoice(b,t);if(ok)el.querySelectorAll('[data-opt]').forEach(x=>x.disabled=true)});
  });
 }

 /* ---------- Démarrage ---------- */
 renderHome();
 document.querySelector('nav [data-tab="parcours"]')?.addEventListener('click',()=>{if(view.step===null)renderHome()});
 // Un nouvel élève arrive sur le parcours ; celui qui a choisi « Explorer librement » retrouve le tableau.
 if(P.mode!=='libre')go('parcours');
 window.NucleaParcours={open:openStep,home:renderHome,tools:Tools};
});
