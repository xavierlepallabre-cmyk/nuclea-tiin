/* Nucléa TIIN v0.17 — moteur du parcours élève.
   Affiche les parcours décrits dans parcours-data.js, mémorise la progression via parcours-progress.js
   et ouvre les outils existants (fiches, calculateurs, visuels, exercices, DATE) sans les dupliquer.
   Trois vues : liste des parcours → un parcours (ses étapes) → une étape (ses phases). */
document.addEventListener('DOMContentLoaded',()=>{
 const host=document.querySelector('#parcours');if(!host||!window.NucleaParcoursData||!window.NucleaProgress)return;
 const D=NucleaParcoursData,P=NucleaProgress.store;
 const $=s=>document.querySelector(s);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fr=(x,d=6)=>Number(x).toLocaleString('fr-FR',{maximumFractionDigits:d});
 const available=D.parcours.filter(p=>p.available),later=D.parcours.filter(p=>!p.available);
 const byId=id=>available.find(p=>p.id===id),idsOf=p=>p.steps.map(s=>s.id),phasesOf=p=>D.phasesOf(p);
 let view={pid:null,step:null,phase:0},returnTo=null;

 /* ---------- Ouverture des outils existants ---------- */
 const go=tab=>document.querySelector(`nav [data-tab="${tab}"]`)?.click();
 const timeMap={as:'as',ps:'ps',ns:'ns',us:'us',ms:'ms',s:'s',m:'min',h:'h',d:'d',Y:'y'};
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const Tools={
  table(){go('table')},
  // Mettre en évidence une zone de l'interface (découverte de l'application).
  spot(a){if(a.tab)go(a.tab);const el=document.querySelector(a.target);if(!el)return;
   const box=el.closest('details');if(box&&!box.open)box.open=true;
   el.scrollIntoView({block:'center',behavior:reduced()?'auto':'smooth'});el.classList.remove('pc-spot');void el.offsetWidth;el.classList.add('pc-spot');
   clearTimeout(el._pcSpot);el._pcSpot=setTimeout(()=>el.classList.remove('pc-spot'),4000)},
  element(a){go('table');isotopeSelection[a.z]=String(a.iso);showElement(a.z,true);
   if(a.chain)requestAnimationFrame(()=>{const b=$('#traceDecay');if(b&&b.getAttribute('aria-expanded')!=='true')b.click()})},
  visual(a){window.NucleaVisuals?.open(a.id)},
  decay(a){
   const el=elements.find(e=>e.z===a.z),v=(isotopes[a.z]||[]).find(x=>String(x.label||x.a)===String(a.iso));if(!el||!v)return;
   go('formulas');
   const mode=$('#rdMode');mode.value='activity';mode.dispatchEvent(new Event('change',{bubbles:true}));
   $('#rdInitial').value=a.initial;$('#rdInitialUnit').value=a.initialUnit;$('#rdDuration').value=a.duration;$('#rdDurationUnit').value=a.durationUnit;
   RadioactiveDecay.prefill({name:`${el.s}-${a.iso}`,half:v.half,unit:timeMap[v.unit],unc:v.unc,approx:v.operator==='AP',extracted:v.extracted,url:`https://nds.iaea.org/relnsd/v1/data?fields=${v.source}&nuclides=${v.a}${el.s.toLowerCase()}`});
   $('#rdForm').requestSubmit();RadioactiveDecay.reveal();$('#decayCalculator').scrollIntoView({block:'start'})},
  energy(a){NuclearEnergy.open(a.z,{a:a.a})},
  exercise(a){go('exercises');$(`#exerciseTheme [data-value="${a.theme}"]`)?.click();$(`#exerciseLevel [data-value="${a.level}"]`)?.click();$('#exerciseTools')?.scrollIntoView({block:'start'})},
  date(a){go('explore');const s=$('#dateTool');s?.querySelector(`[data-date="${a.mode}"]`)?.click();s?.scrollIntoView({block:'start'})},
  formulas(a){go('formulas');const d=document.querySelector(`#formulaList > details[data-topic="${a.topic}"]`);if(d){d.open=true;d.scrollIntoView({block:'start'})}}
 };
 function launch(action,blockId){
  const p=byId(view.pid),step=p&&p.steps.find(s=>s.id===view.step);
  returnTo={pid:view.pid,step:view.step,phase:view.phase,block:blockId,title:step?step.title:'',n:p?idsOf(p).indexOf(view.step)+1:0};
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
  const back=()=>{const r=returnTo;returnTo=null;hideReturn();go('parcours');openStep(r.pid,r.step,r.phase,r.block)};
  if(typeof detailOpen!=='undefined'&&detailOpen&&history.state?.nucleaDetail){window.addEventListener('popstate',()=>setTimeout(back,0),{once:true});closeDetail()}
  else{if(typeof detailOpen!=='undefined'&&detailOpen)hideDetail();back()}
 };
 document.querySelector('nav [data-tab="parcours"]')?.addEventListener('click',()=>{if(!returnTo)return;returnTo=null;hideReturn()});

 /* ---------- Vue 1 : les parcours ---------- */
 const progressBar=(done,n,label)=>`<div class="pc-progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done}"><span style="width:${100*done/n}%"></span></div>`;
 const count=(done,n)=>`${done} étape${done>1?'s':''} terminée${done>1?'s':''} sur ${n}`;
 // Parcours à proposer : celui en cours s'il n'est pas fini, sinon le premier non terminé.
 function suggested(){
  const act=byId(P.active);if(act&&P.doneCount(act.id,idsOf(act))<act.steps.length&&idsOf(act).some(id=>P.status(act.id,id)!=='todo'))return act;
  return available.find(p=>P.doneCount(p.id,idsOf(p))<p.steps.length)||available[0];
 }
 function renderHome(){
  view={pid:null,step:null,phase:0};
  const s=suggested(),sids=idsOf(s),started=sids.some(id=>P.status(s.id,id)!=='todo'),allDone=available.every(p=>P.doneCount(p.id,idsOf(p))===p.steps.length);
  const next=P.resumeStep(s.id,sids),nextStep=s.steps.find(x=>x.id===next),first=s===available[0]&&!started;
  host.innerHTML=`<div class="page-head"><div><p class="tag"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>Démarrer ici</p><h1>Parcours élève</h1><p class="lead">Par où commencer ? Suis un parcours pas à pas, ou explore librement l’application.</p></div></div>
  <article class="card pc-hero" aria-labelledby="pcHeroTitle">
   <p class="pc-eyebrow">${first?'Nouveau sur Nucléa TIIN ?':allDone?'Parcours terminés':started?'Reprendre':'Parcours suivant'} · ${esc(s.title)}</p>
   <h2 id="pcHeroTitle">${first?'Commence par découvrir l’application':allDone?'Tous les parcours sont terminés':started?`Étape ${sids.indexOf(next)+1} : ${esc(nextStep.title)}`:esc(s.title)}</h2>
   <p>${esc(s.intro)}</p>
   ${progressBar(P.doneCount(s.id,sids),sids.length,'Étapes terminées')}<p class="pc-count">${count(P.doneCount(s.id,sids),sids.length)}</p>
   <div class="pc-actions"><button type="button" class="btn btn-primary" id="pcContinue" data-pid="${s.id}">${allDone?'Revoir les parcours':started?'Continuer mon parcours':first?'Commencer la découverte':'Commencer ce parcours'}</button><button type="button" class="btn btn-ghost" id="pcFree">Explorer librement</button></div>
  </article>
  <h2 class="pc-list-title">Parcours disponibles</h2>
  <ul class="pc-cards">${available.map(p=>{const ids=idsOf(p),d=P.doneCount(p.id,ids),st=ids.some(id=>P.status(p.id,id)!=='todo');const min=p.steps.reduce((t,x)=>t+x.minutes,0);
   return `<li><button type="button" class="pc-card" data-pid="${p.id}"><span class="pc-card-head"><strong>${esc(p.title)}</strong><span class="pc-chip pc-chip-${d===ids.length?'done':st?'started':'todo'}">${d===ids.length?'Terminé':st?'Commencé':'À découvrir'}</span></span><span class="pc-card-text">${esc(p.intro)}</span><span class="pc-card-meta">${ids.length} étapes · environ ${min} min · ${count(d,ids.length)}</span>${progressBar(d,ids.length,'Étapes terminées')}</button></li>`}).join('')}</ul>
  ${later.length?`<p class="pc-later"><b>À venir :</b> ${later.map(p=>esc(p.title)).join(' · ')}.</p>`:''}
  <div class="pc-store"><p>${P.persistent?'Ta progression est enregistrée sur cet appareil uniquement, sans compte.':esc(P.message)}</p></div>`;
  $('#pcContinue').onclick=()=>{P.setMode('parcours');if(allDone){renderParcours(available[0].id);return}const st=P.step(s.id,next);openStep(s.id,next,st?st.phase:0)};
  $('#pcFree').onclick=()=>{P.setMode('libre');go('table')};
  host.querySelectorAll('.pc-card').forEach(b=>b.onclick=()=>{renderParcours(b.dataset.pid);focusTitle()});
 }

 /* ---------- Vue 2 : un parcours ---------- */
 function renderParcours(pid){
  const p=byId(pid);if(!p){renderHome();return}
  view={pid,step:null,phase:0};
  const ids=idsOf(p),done=P.doneCount(pid,ids),started=ids.some(id=>P.status(pid,id)!=='todo'),next=P.resumeStep(pid,ids),all=done===ids.length;
  host.innerHTML=`<div class="pc-top"><button type="button" class="pc-back" id="pcBackHome"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>Tous les parcours</button></div>
  <h1 class="pc-title">${esc(p.title)}</h1>
  <article class="card pc-hero" aria-label="Progression">
   <p>${esc(p.intro)}</p>${progressBar(done,ids.length,'Étapes terminées')}<p class="pc-count">${count(done,ids.length)}</p>
   <div class="pc-actions"><button type="button" class="btn btn-primary" id="pcStart">${all?'Revoir la première étape':started?`Continuer : étape ${ids.indexOf(next)+1}`:'Commencer ce parcours'}</button></div>
  </article>
  <h2 class="pc-list-title">Les étapes</h2>
  <ol class="pc-steps">${p.steps.map((s,i)=>{const st=P.status(pid,s.id),cur=started&&s.id===next&&!all;return `<li><button type="button" class="pc-step${cur?' is-current':''}" data-step="${s.id}"><span class="pc-num pc-${st}" aria-hidden="true">${st==='done'?'✓':i+1}</span><span class="pc-step-text"><strong>${esc(s.title)}</strong><span>${esc(s.summary)}</span></span><span class="pc-chip pc-chip-${cur?'current':st}">${cur?'En cours':st==='done'?'Terminée':st==='started'?'Commencée':'À découvrir'}</span></button></li>`}).join('')}</ol>
  <div class="pc-store"><button type="button" class="btn btn-ghost" id="pcReset">Réinitialiser ce parcours</button>
   <div class="pc-confirm" id="pcConfirm" hidden><p>Effacer la progression des ${ids.length} étapes de « ${esc(p.title)} » sur cet appareil ?</p><button type="button" class="btn btn-primary" id="pcResetYes">Oui, tout effacer</button><button type="button" class="btn btn-ghost" id="pcResetNo">Annuler</button></div></div>`;
  $('#pcBackHome').onclick=()=>{renderHome();host.querySelector(`.pc-card[data-pid="${pid}"]`)?.focus()};
  $('#pcStart').onclick=()=>{P.setMode('parcours');const sid=all?ids[0]:next,st=P.step(pid,sid);openStep(pid,sid,st&&!all?st.phase:0)};
  host.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{P.setMode('parcours');const st=P.step(pid,b.dataset.step);openStep(pid,b.dataset.step,st?st.phase:0)});
  $('#pcReset').onclick=()=>{$('#pcConfirm').hidden=false;$('#pcResetNo').focus()};
  $('#pcResetNo').onclick=()=>{$('#pcConfirm').hidden=true;$('#pcReset').focus()};
  $('#pcResetYes').onclick=()=>{P.reset(pid);renderParcours(pid);$('#pcStart').focus()};
 }

 /* ---------- Vue 3 : une étape ---------- */
 function openStep(pid,sid,phase=0,focusBlock){
  const p=byId(pid),step=p&&p.steps.find(s=>s.id===sid);if(!step){renderHome();return}
  const PH=phasesOf(p),ids=idsOf(p);phase=Math.max(0,Math.min(PH.length-1,phase));
  P.open(pid,sid);view={pid,step:sid,phase};P.setPhase(pid,sid,phase);
  const i=ids.indexOf(sid),st=P.step(pid,sid),done=st.status==='done',last=phase===PH.length-1;
  const [pk,pname]=PH[phase];
  host.innerHTML=`<div class="pc-top"><button type="button" class="pc-back" id="pcBack"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>${esc(p.title)}</button><span class="pc-where">Étape ${i+1} sur ${ids.length} · environ ${step.minutes} min</span></div>
  <h1 class="pc-title">${esc(step.title)}${done?' <span class="pc-chip pc-chip-done">Terminée</span>':''}</h1>
  <ol class="pc-phases" style="--n:${PH.length}" aria-label="Phases de l’étape">${PH.map(([k,n],j)=>`<li><button type="button" data-phase="${j}" ${j===phase?'aria-current="step"':''} class="${j<phase||done?'is-past':''}"><span>${j+1}</span>${n}</button></li>`).join('')}</ol>
  <article class="card pc-phase" aria-labelledby="pcPhaseTitle"><h2 id="pcPhaseTitle">${pname}</h2>${(step.phases[pk]||[]).map((b,k)=>block(b,`${sid}-${pk}-${k}`)).join('')}</article>
  <div class="pc-nav">${phase>0?`<button type="button" class="btn btn-ghost" data-go="${phase-1}">← ${PH[phase-1][1]}</button>`:'<span></span>'}
   ${last?(done?(i<ids.length-1?`<button type="button" class="btn btn-primary" id="pcNextStep">Étape suivante : ${esc(p.steps[i+1].title)} →</button>`:'<button type="button" class="btn btn-primary" id="pcHome">Retour aux parcours</button>'):'<button type="button" class="btn btn-primary" id="pcFinish">Terminer l’étape</button>'):`<button type="button" class="btn btn-primary" data-go="${phase+1}">${PH[phase+1][1]} →</button>`}</div>
  <p class="pc-restart"><button type="button" class="pc-link" id="pcRestart">Recommencer cette étape</button></p>`;
  $('#pcBack').onclick=()=>{renderParcours(pid);host.querySelector(`[data-step="${sid}"]`)?.focus()};
  host.querySelectorAll('[data-phase],[data-go]').forEach(b=>b.onclick=()=>{openStep(pid,sid,+(b.dataset.phase??b.dataset.go));focusTitle()});
  $('#pcFinish')&&($('#pcFinish').onclick=()=>{P.complete(pid,sid);openStep(pid,sid,phase);$('#pcNextStep,#pcHome')?.focus()});
  $('#pcNextStep')&&($('#pcNextStep').onclick=()=>{openStep(pid,ids[i+1],0);focusTitle()});
  $('#pcHome')&&($('#pcHome').onclick=()=>{renderHome();focusTitle()});
  $('#pcRestart').onclick=()=>{P.restartStep(pid,sid);openStep(pid,sid,0);focusTitle()};
  wire(p,sid);
  if(focusBlock){const el=host.querySelector(`[data-block="${focusBlock}"]`);if(el){el.scrollIntoView({block:'center'});el.querySelector('input,button')?.focus({preventScroll:true})}}
  else window.scrollTo({top:0});
 }
 const focusTitle=()=>{const t=host.querySelector('.pc-title, h1');if(t){t.tabIndex=-1;t.focus({preventScroll:true})}window.scrollTo({top:0})};

 /* ---------- Blocs ---------- */
 const toolBtn=(a,label,id)=>`<button type="button" class="pc-tool${a.tool==='spot'?' pc-tool-spot':''}" data-tool='${esc(JSON.stringify(a))}' data-for="${id}">${a.tool==='spot'?'<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>':'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'}${esc(label||toolLabel(a))}</button>`;
 function toolLabel(a){
  const el=a.z?elements.find(e=>e.z===a.z):null;
  return {table:'Ouvrir le tableau périodique',spot:'Me montrer où c’est',element:el?`Ouvrir la fiche ${el.s}-${a.iso} (${el.name.toLowerCase()})`:'Ouvrir la fiche',visual:`Ouvrir le visuel « ${({decroissance:'Décroissance radioactive',attenuation:'Atténuation des gamma',distance:'Débit de dose et distance',desintegrations:'Désintégrations α, β, γ',filiation:'Chaîne de filiation'})[a.id]||a.id} »`,decay:'Ouvrir le calculateur de décroissance',energy:'Ouvrir le calculateur d’énergie de liaison',exercise:'Ouvrir les exercices',date:'Ouvrir l’outil DATE',formulas:'Ouvrir le formulaire'}[a.tool]||'Ouvrir l’outil';
 }
 function block(b,id){
  if(b.type==='text')return `<p class="pc-text">${b.html}</p>`;
  if(b.type==='keys')return `<div class="pc-keys"><p>À retenir</p><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
  if(b.type==='tool')return `<div class="pc-block" data-block="${id}">${toolBtn(b.action,b.label,id)}</div>`;
  const t=P.task(view.pid,view.step,b.id),tool=b.action?toolBtn(b.action,null,id):'';
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
 function wire(p,sid){
  const pid=p.id,step=p.steps.find(s=>s.id===sid),blocks=Object.values(step.phases).flat();
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
 document.querySelector('nav [data-tab="parcours"]')?.addEventListener('click',()=>{if(view.step===null&&view.pid===null)renderHome()});
 // Un nouvel élève arrive sur le parcours ; celui qui a choisi « Explorer librement » retrouve le tableau.
 if(P.mode!=='libre')go('parcours');
 window.NucleaParcours={open:openStep,parcours:renderParcours,home:renderHome,tools:Tools};
});
