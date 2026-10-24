/* Nucléa TIIN v0.17 — suivi local de la progression du parcours élève.
   Enregistré dans le navigateur de l'appareil (localStorage), sans compte ni envoi réseau.
   Le service worker ne touche jamais au localStorage : une mise à jour de la PWA conserve la progression.
   Si le stockage est refusé (navigation privée, politique), la progression reste en mémoire pour la session. */
(function(root){
 const KEY='nuclea-parcours-v1',VERSION=1;
 const blank=()=>({v:VERSION,mode:null,active:'decouverte',parcours:{}});
 function sanitize(d){
  if(!d||typeof d!=='object'||d.v!==VERSION)return blank();
  const out=blank();
  if(d.mode==='parcours'||d.mode==='libre')out.mode=d.mode;
  if(typeof d.active==='string')out.active=d.active;
  for(const [pid,p] of Object.entries(d.parcours||{})){
   if(!p||typeof p!=='object')continue;const steps={};
   for(const [sid,s] of Object.entries(p.steps||{})){
    if(!s||typeof s!=='object')continue;
    const tasks={};for(const [tid,t] of Object.entries(s.tasks||{}))if(t&&typeof t==='object')tasks[tid]={ok:!!t.ok,tries:Math.max(0,Math.min(99,Number(t.tries)||0)),value:String(t.value??'').slice(0,40)};
    steps[sid]={status:s.status==='done'?'done':'started',phase:Math.max(0,Math.min(4,Number(s.phase)||0)),tasks,doneAt:typeof s.doneAt==='string'?s.doneAt:null};
   }
   out.parcours[pid]={current:typeof p.current==='string'?p.current:null,steps};
  }
  return out;
 }
 function create(storage){
  let state=blank(),persistent=true,message='';
  try{const raw=storage&&storage.getItem(KEY);if(raw)state=sanitize(JSON.parse(raw))}catch(e){if(e instanceof SyntaxError)state=blank();else{persistent=false;message='Progression non enregistrée sur cet appareil (stockage indisponible).'}}
  // Vérifier dès le départ que l'écriture est possible, pour prévenir l'élève avant qu'il ne commence.
  try{if(storage){storage.setItem(KEY+'-test','1');storage.removeItem&&storage.removeItem(KEY+'-test')}}catch(e){persistent=false;message='Progression non enregistrée sur cet appareil (stockage indisponible) : elle sera perdue à la fermeture.'}
  const save=()=>{if(!storage)return;try{storage.setItem(KEY,JSON.stringify(state));persistent=true;message=''}catch(e){persistent=false;message='Progression non enregistrée sur cet appareil (stockage indisponible).'}};
  const pp=pid=>state.parcours[pid]||(state.parcours[pid]={current:null,steps:{}});
  const api={
   KEY,
   get mode(){return state.mode},
   get active(){return state.active},
   get persistent(){return persistent},
   get message(){return message},
   setMode(m){state.mode=m;save()},
   current(pid){return pp(pid).current},
   step(pid,sid){return pp(pid).steps[sid]||null},
   status(pid,sid){const s=pp(pid).steps[sid];return s?s.status:'todo'},
   open(pid,sid){const p=pp(pid);p.current=sid;if(!p.steps[sid])p.steps[sid]={status:'started',phase:0,tasks:{},doneAt:null};state.active=pid;save();return p.steps[sid]},
   setPhase(pid,sid,phase){const s=api.open(pid,sid);s.phase=Math.max(0,Math.min(4,phase));save()},
   recordTask(pid,sid,tid,ok,value){const s=api.open(pid,sid),t=s.tasks[tid]||{ok:false,tries:0,value:''};t.tries++;t.ok=t.ok||!!ok;t.value=String(value??'').slice(0,40);s.tasks[tid]=t;save();return t},
   task(pid,sid,tid){const s=pp(pid).steps[sid];return s&&s.tasks[tid]||null},
   complete(pid,sid){const s=api.open(pid,sid);s.status='done';s.doneAt=new Date().toISOString().slice(0,10);save()},
   restartStep(pid,sid){pp(pid).steps[sid]={status:'started',phase:0,tasks:{},doneAt:null};pp(pid).current=sid;save()},
   reset(pid){delete state.parcours[pid];save()},
   doneCount(pid,ids){return ids.filter(id=>api.status(pid,id)==='done').length},
   // Étape où reprendre : l'étape en cours si elle n'est pas finie, sinon la première non terminée.
   resumeStep(pid,ids){const c=pp(pid).current;if(c&&ids.includes(c)&&api.status(pid,c)!=='done')return c;return ids.find(id=>api.status(pid,id)!=='done')||c||ids[0]}
  };
  return api;
 }
 let storage=null;try{storage=root.localStorage}catch(e){storage=null}
 const api={create,sanitize,KEY,store:typeof root.window!=='undefined'?create(storage):null};
 root.NucleaProgress=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
