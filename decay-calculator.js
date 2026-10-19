/* Nucléa TIIN v0.8 : décroissance d’un radionucléide isolé. */
(function(root){
 const timeUnits={as:1e-18,ps:1e-12,ns:1e-9,us:1e-6,ms:1e-3,s:1,min:60,h:3600,d:86400,y:31557600};
 const activityUnits={Bq:1,kBq:1e3,MBq:1e6,GBq:1e9,TBq:1e12};
 function parse(value){
  const text=String(value).trim().replace(/[\s\u00a0\u202f]/g,'').replace(',','.');
  if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text))throw Error('Saisis un nombre, par exemple 12,5 ou 1e6.');
  const n=Number(text);if(!Number.isFinite(n))throw Error('La valeur dépasse la plage de calcul.');return n;
 }
 function scaled(value,unit,units,label){
  if(!Object.hasOwn(units,unit))throw Error('Unité inconnue.');
  const x=parse(value)*units[unit];
  if(!Number.isFinite(x)||(parse(value)!==0&&x===0))throw Error(`${label} : valeur hors de la plage de calcul.`);
  return x;
 }
 function calculate(input){
  const half=scaled(input.half,input.halfUnit,timeUnits,'Période');
  const initial=scaled(input.initial,input.initialUnit,activityUnits,'Activité initiale');
  if(!(half>0))throw Error('La période radioactive doit être strictement positive.');
  if(!(initial>0))throw Error('L’activité initiale doit être strictement positive.');
  let seconds,n,final;
  if(input.mode==='time'){
   final=scaled(input.target,input.targetUnit,activityUnits,'Activité visée');
   if(final===0)throw Error('Une activité exactement nulle n’est atteinte qu’à la limite d’un temps infini. Choisis une valeur positive.');
   if(final<0||final>initial)throw Error('L’activité visée doit être positive et inférieure ou égale à l’activité initiale.');
   n=(Math.log(initial)-Math.log(final))/Math.LN2;seconds=n*half;
  }else if(input.mode==='activity'){
   seconds=scaled(input.duration,input.durationUnit,timeUnits,'Durée');
   if(seconds<0)throw Error('La durée écoulée ne peut pas être négative.');
   n=seconds/half;final=Math.exp(Math.log(initial)-Math.LN2*n);
   if(seconds===0)final=initial;
  }else throw Error('Choisis le calcul à effectuer.');
  const lambda=Math.LN2/half;
  if(!Number.isFinite(n)||!Number.isFinite(seconds)||!Number.isFinite(lambda))throw Error('Ces valeurs dépassent la plage de calcul.');
  return {half,initial,seconds,n,final,lambda,fraction:Math.exp(-Math.LN2*n),underflow:final===0};
 }
 const api={parse,calculate,timeUnits,activityUnits};root.RadioactiveDecay=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 const q=s=>document.querySelector(s);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={as:'as',ps:'ps',ns:'ns',us:'µs',ms:'ms',s:'s',min:'min',h:'h',d:'jours',y:'ans'};
 const fmt=n=>!Number.isFinite(n)?'Hors plage':n===0?'0':Math.abs(n)<.0001||Math.abs(n)>=1e7?n.toExponential(4).replace('.',','):n.toLocaleString('fr-FR',{maximumSignificantDigits:6});
 let origin=null,last=null;
 function inputs(){return {mode:q('#rdMode').value,half:q('#rdHalf').value,halfUnit:q('#rdHalfUnit').value,initial:q('#rdInitial').value,initialUnit:q('#rdInitialUnit').value,duration:q('#rdDuration').value,durationUnit:q('#rdDurationUnit').value,target:q('#rdTarget').value,targetUnit:q('#rdTargetUnit').value}}
 function sourceNote(){
  const box=q('#rdOrigin');box.replaceChildren();
  if(!origin){box.textContent='Période saisie manuellement. Les incertitudes ne sont pas propagées.';return;}
  const p=document.createElement('span');p.textContent=`${origin.name} · période nominale ${origin.half} ${labels[origin.unit]}${origin.unc?` · incertitude ENSDF : ${origin.unc}`:''}${origin.approx?' · valeur approximative':''}. Extraction : ${origin.extracted}. `;
  const a=document.createElement('a');a.href=origin.url;a.textContent='Source AIEA';a.target='_blank';a.rel='noopener noreferrer';box.append(p,a,document.createTextNode(' · Incertitudes non propagées.'));
 }
 function chart(result,unit,displayUnit,nCursor){
  const width=640,height=280,left=55,right=20,top=20,bottom=45;
  const x=n=>left+n/10*(width-left-right),y=f=>top+(1-f)*(height-top-bottom);
  const points=Array.from({length:241},(_,i)=>{const n=i/24;return `${x(n)},${y(Math.pow(2,-n))}`}).join(' ');
  const ticks=[0,2,4,6,8,10].map(n=>`<line x1="${x(n)}" x2="${x(n)}" y1="${top}" y2="${height-bottom}" class="rd-grid"/><text x="${x(n)}" y="${height-bottom+20}" text-anchor="middle">${fmt(n*(result.half/timeUnits[unit]))}</text>`).join('');
  const horizontal=[0,.25,.5,.75,1].map(f=>`<line x1="${left}" x2="${width-right}" y1="${y(f)}" y2="${y(f)}" class="rd-grid"/><text x="${left-8}" y="${y(f)+4}" text-anchor="end">${f*100} %</text>`).join('');
  const marker=result.n<=10?`<circle cx="${x(result.n)}" cy="${y(result.fraction)}" r="6" class="rd-calculated"/>`:'';
  q('#rdChart').innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="rdChartTitle rdChartDesc"><title id="rdChartTitle">Décroissance de l’activité sur dix périodes</title><desc id="rdChartDesc">L’activité passe de 100 % à 50 % après une période, 25 % après deux périodes, puis continue à diminuer. Axe horizontal : durée en ${esc(labels[unit])}. Le tableau fournit les valeurs numériques.</desc>${ticks}${horizontal}<polyline points="${points}" class="rd-curve"/>${marker}<circle cx="${x(nCursor)}" cy="${y(Math.pow(2,-nCursor))}" r="5" class="rd-cursor"/><text x="${width/2}" y="${height-4}" text-anchor="middle">Durée (${esc(labels[unit])})</text></svg>`;
  q('#rdChartNote').textContent=result.n>10?'Le résultat calculé dépasse dix périodes et se situe hors de cette courbe.':'Le point orange représente le résultat calculé ; le point bleu suit le curseur.';
  const elapsed=nCursor*(result.half/timeUnits[unit]),activity=Math.exp(Math.log(result.initial)-Math.LN2*nCursor)/activityUnits[displayUnit];
  q('#rdExploreValue').textContent=`${fmt(nCursor)} période(s) · ${fmt(elapsed)} ${labels[unit]} · ${fmt(activity)} ${displayUnit} (${fmt(100*Math.pow(2,-nCursor))} %)`;
 }
 function update(){
  const input=inputs(),isTime=input.mode==='time';
  q('#rdDurationGroup').hidden=isTime;q('#rdDuration').disabled=isTime;
  q('#rdTargetGroup').hidden=!isTime;q('#rdTarget').disabled=!isTime;
  q('#rdOutputTimeGroup').hidden=!isTime;
  sourceNote();
  try{
   const r=calculate(input);const unit=isTime?q('#rdOutputTime').value:input.durationUnit;
   const outputUnit=input.initialUnit;
   const finalOut=r.final/activityUnits[outputUnit],durationOut=r.seconds/timeUnits[unit];
   if(!Number.isFinite(durationOut)||!Number.isFinite(finalOut))throw Error('Choisis une unité de résultat plus grande.');
   if(isTime&&r.seconds>0&&durationOut===0)throw Error('Choisis une unité de durée plus petite pour représenter le résultat.');
   last={r,unit,outputUnit};
   q('#rdError').textContent='';q('#rdResults').hidden=false;
   q('#rdAnswer').textContent=isTime?`${fmt(durationOut)} ${labels[unit]}`:r.underflow?'Activité inférieure à la précision numérique':finalOut===0&&r.final>0?'Activité trop faible dans cette unité':`${fmt(finalOut)} ${outputUnit}`;
   q('#rdAnswerLabel').textContent=isTime?'Durée pour atteindre l’activité visée':'Activité restante';
   q('#rdFraction').textContent=`${r.fraction===0?'Fraction restante sous la précision numérique':fmt(r.fraction*100)+' % de l’activité initiale'} · ${fmt(r.n)} période(s)`;
   const conversion=`T½ = ${fmt(r.half)} s ; A₀ = ${fmt(r.initial)} Bq${isTime?` ; A = ${fmt(r.final)} Bq`:` ; t = ${fmt(r.seconds)} s`}.`;
   const formula=isTime?'t = T½ × ln(A₀ / A) / ln(2)':'A(t) = A₀ × 2⁻⁽ᵗ/ᵀ½⁾';
   const replacement=isTime?`t = ${fmt(r.half)} × [ln(${fmt(r.initial)}) − ln(${fmt(r.final)})] / ln(2) = ${fmt(r.seconds)} s.`:`n = t / T½ = ${fmt(r.seconds)} / ${fmt(r.half)} = ${fmt(r.n)} ; A(t) = ${fmt(r.initial)} × 2^(−${fmt(r.n)}) Bq.`;
   q('#rdSteps').innerHTML=`<li><strong>Convertir dans les mêmes unités.</strong> ${esc(conversion)}</li><li><strong>Choisir la relation.</strong> ${esc(formula)}</li><li><strong>Remplacer les valeurs.</strong> ${esc(replacement)}</li><li><strong>Constante de décroissance.</strong> λ = ln(2) / T½ = ${esc(fmt(r.lambda))} s⁻¹.</li>`;
   q('#rdMilestones').innerHTML=[0,1,2,3,4,5,10].map(n=>`<tr><th scope="row">${n}</th><td>${esc(fmt(n*(r.half/timeUnits[unit])))} ${labels[unit]}</td><td>${esc(fmt(Math.exp(Math.log(r.initial)-n*Math.LN2)/activityUnits[outputUnit]))} ${outputUnit}</td><td>${esc(fmt(100*Math.pow(2,-n)))} %</td></tr>`).join('');
   chart(r,unit,outputUnit,Number(q('#rdExplore').value));
  }catch(err){last=null;q('#rdResults').hidden=true;q('#rdError').textContent=err.message;}
 }
 function init(){
  if(!q('#decayCalculator'))return;
  q('#rdForm').addEventListener('submit',e=>{e.preventDefault();update()});
  q('#rdForm').addEventListener('input',e=>{if(e.target.id==='rdHalf'||e.target.id==='rdHalfUnit')origin=null;update()});
  q('#rdForm').addEventListener('change',e=>{if(e.target.id==='rdHalf'||e.target.id==='rdHalfUnit')origin=null;update()});
  q('#rdExplore').addEventListener('input',()=>{if(last)chart(last.r,last.unit,last.outputUnit,Number(q('#rdExplore').value))});
  q('#rdExample').onclick=()=>{origin=null;q('#rdMode').value='activity';q('#rdHalf').value='8';q('#rdHalfUnit').value='d';q('#rdInitial').value='800';q('#rdInitialUnit').value='kBq';q('#rdDuration').value='24';q('#rdDurationUnit').value='d';q('#rdTarget').value='100';q('#rdTargetUnit').value='kBq';q('#rdExplore').value='3';update()};
  api.prefill=info=>{origin=info;q('#rdHalf').value=info.half;q('#rdHalfUnit').value=info.unit;q('#rdMode').value='activity';update();q('#decayCalculator').scrollIntoView({block:'start',behavior:'instant'});q('#rdInitial').focus({preventScroll:true})};
  update();
 }
 document.addEventListener('DOMContentLoaded',init);
})(globalThis);
