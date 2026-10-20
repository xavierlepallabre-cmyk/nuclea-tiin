(function(root){
 const finite=(x,name)=>{const text=String(x).trim().replace(',','.');if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text))throw Error(name+' : nombre invalide.');const v=typeof x==='number'?x:Number(text);if(!Number.isFinite(v)||v<0)throw Error(name+' doit être un nombre positif ou nul.');return v};
 function explore(s){
  const rate=finite(s.rate,'Débit'),distance=finite(s.distance,'Distance'),activity=finite(s.activity,'Activité relative'),minutes=finite(s.minutes,'Durée'),transmission=finite(s.transmission,'Transmission');
  if(distance<=0||activity>100||transmission>100)throw Error('Distance > 0 ; pourcentages entre 0 et 100.');
  const workers=s.workers;if(!Number.isInteger(workers)||workers<1||workers>20)throw Error('Équipe : de 1 à 20 personnes.');
  const setup=finite(s.setup,'Temps de pose'),removal=finite(s.removal,'Temps de retrait'),installers=s.installers;
  if(!Number.isInteger(installers)||installers<1||installers>20)throw Error('Équipe de pose : de 1 à 20 personnes.');
  const bare=rate*activity/100/(distance*distance),shielded=bare*transmission/100;
  const individual=shielded*minutes/60,without=bare*minutes/60*workers,installation=bare*(setup+removal)/60*installers,withShield=individual*workers+installation;
  if(![bare,shielded,individual,without,installation,withShield].every(Number.isFinite))throw Error('Calcul hors plage.');
  return {bare,shielded,individual,without,installation,withShield,gain:without-withShield};
 }
 function validate(prep){
  if(!prep||typeof prep!=='object'||!Array.isArray(prep.phases)||prep.phases.length<1||prep.phases.length>80)throw Error('De 1 à 80 phases sont nécessaires.');
  if(typeof prep.name!=='string'||prep.name.length>80||typeof prep.id!=='string'||prep.id.length>100)throw Error('Préparation invalide.');
  if(!Number.isInteger(prep.workers)||prep.workers<1||prep.workers>12)throw Error('De 1 à 12 intervenants sont nécessaires, en plus du chargé de travaux.');
  let work=finite(prep.work,'Débit zone'),retreat=finite(prep.retreat,'Débit repli');if(retreat>work)throw Error('Le point de repli doit être moins dosant ou égal à la zone de travail.');
  const people=['Chargé de travaux',...Array.from({length:prep.workers},(_,i)=>'Intervenant '+(i+1))],totals=Object.fromEntries(people.map(p=>[p,0]));
  const phases=prep.phases.map((phase,index)=>{
   if(!phase||typeof phase.name!=='string'||phase.name.length>100||!Array.isArray(phase.positions)||phase.positions.length!==people.length)throw Error('Phase ou équipe invalide.');
   const minutes=finite(phase.minutes,'Durée');if(minutes>100000)throw Error('Durée de phase excessive pour cet outil pédagogique.');
   if(phase.work!==null)work=finite(phase.work,'Débit zone');if(phase.retreat!==null)retreat=finite(phase.retreat,'Débit repli');
   if(retreat>work)throw Error('Phase '+(index+1)+' : le repli doit être moins dosant.');
   if(!['work','retreat'].includes(phase.positions[0])||!phase.positions.slice(1).some(p=>['work','retreat'].includes(p)))throw Error('Chaque phase exige exactement un chargé de travaux et au moins un intervenant.');
   if(phase.positions.some(p=>!['work','retreat','absent'].includes(p)))throw Error('Affectation invalide : un seul point par personne.');
   const doses=Object.fromEntries(people.map((name,i)=>[name,phase.positions[i]==='absent'?0:(phase.positions[i]==='work'?work:retreat)*minutes/60]));
   for(const name of people)totals[name]+=doses[name];const collective=Object.values(doses).reduce((a,b)=>a+b,0);if(!Number.isFinite(collective))throw Error('Dose hors plage.');
   return {name:phase.name,minutes,work,retreat,doses,collective};
  });const collective=Object.values(totals).reduce((a,b)=>a+b,0);if(!Number.isFinite(collective))throw Error('Dose cumulée hors plage.');return {people,phases,totals,collective};
 }
 function compare(a,b){const A=validate(a),B=validate(b),people=[...new Set([...A.people,...B.people])];return {rows:people.map(person=>({person,a:A.totals[person]||0,b:B.totals[person]||0,gain:(A.totals[person]||0)-(B.totals[person]||0)})),a:A.collective,b:B.collective,gain:A.collective-B.collective};}
 function restore(text){const arr=JSON.parse(text);if(!Array.isArray(arr)||arr.length>40)throw Error('Sauvegarde invalide.');const ids=new Set();return arr.map(p=>{validate(p);if(ids.has(p.id))throw Error('Identifiants de sauvegarde dupliqués.');ids.add(p.id);return {id:p.id,name:p.name,workers:p.workers,work:p.work,retreat:p.retreat,phases:p.phases.map(x=>({name:x.name,minutes:x.minutes,work:x.work,retreat:x.retreat,positions:[...x.positions]}))}});}
 const api={explore,validate,compare,restore};root.DateLearning=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
