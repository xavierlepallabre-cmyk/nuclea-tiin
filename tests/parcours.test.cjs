// v0.17 : cohérence des données du parcours élève et du suivi de progression.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const D=require('../parcours-data.js'),Prog=require('../parcours-progress.js'),M=require('../nuclear-mass.js');
const ctx={};vm.createContext(ctx);vm.runInContext(read('isotopes.js')+';this.isotopes=isotopes;'+read('nuclear-properties.js')+';this.props=nuclearProperties;',ctx);vm.runInContext(read('decay-chain.js'),ctx);
const {isotopes,props,DecayChain}=ctx,elements=JSON.parse(read('elements.json'));
const visualIds=[...read('visuals.js').matchAll(/\{id:'([a-z]+)'/g)].map(m=>m[1]);
const iso=(z,a)=>(isotopes[z]||[]).find(v=>String(v.label||v.a)===String(a));
// 1. Structure : parcours, identifiants uniques, phases remplies, actions valides.
const avail=D.parcours.filter(x=>x.available);assert.deepEqual(avail.map(x=>x.id),['decouverte','bases'],'la découverte de l’application vient en premier');
assert(new Set(D.parcours.map(x=>x.id)).size===D.parcours.length);
const stepIds=new Set(),taskIds=new Set(),tasks={},spots=new Set();
for(const p of avail){const PH=D.phasesOf(p);assert(PH.length>=2&&PH.length<=5&&p.steps.length&&p.intro);
for(const s of p.steps){
 assert(!stepIds.has(s.id),s.id);stepIds.add(s.id);assert(s.title&&s.summary&&s.minutes>0);
 for(const [k] of PH)assert(Array.isArray(s.phases[k])&&s.phases[k].length,`${s.id}/${k} vide`);
 assert.deepEqual(Object.keys(s.phases),PH.map(x=>x[0]));
 for(const b of Object.values(s.phases).flat()){
  assert(['text','tool','read','choice','keys'].includes(b.type),b.type);
  if(b.id){assert(!taskIds.has(b.id),b.id);taskIds.add(b.id);tasks[b.id]=b}
  if(b.type==='choice')assert(Number.isInteger(b.correct)&&b.correct>=0&&b.correct<b.options.length&&b.explain,b.id);
  if(b.type==='read')assert(Number.isFinite(b.answer.value)&&b.answer.tol>=0&&b.hint&&b.explain,b.id);
  const a=b.action;if(!a)continue;
  switch(a.tool){
   case 'table':break;
   case 'element':assert(elements.find(e=>e.z===a.z)&&iso(a.z,a.iso),`${b.id||'outil'} : ${a.z}-${a.iso}`);break;
   case 'visual':assert(visualIds.includes(a.id),a.id);break;
   case 'decay':{const v=iso(a.z,a.iso);assert(v&&!v.stable&&Number(v.half)>0);break}
   case 'energy':assert(props[`${a.z}:${a.a}`]);break;
   case 'exercise':assert(a.theme>=0&&a.theme<=5&&[1,2,3].includes(a.level));break;
   case 'date':assert(['free','mission','prepare'].includes(a.mode));break;
   case 'formulas':assert(a.topic>=0&&a.topic<=5);break;
   case 'spot':assert(typeof a.target==='string'&&a.target);spots.add(a.target);if(a.tab)assert(['table','formulas','explore','exercises'].includes(a.tab));break;
   default:assert.fail('outil inconnu '+a.tool);
  }
 }
}}
assert.equal(D.get('decouverte').phases.length,3);assert.equal(D.get('bases').steps.length,6);
// Les zones mises en évidence existent dans l'application.
const html=read('index.html')+read('exercises.js')+read('energy.js')+read('date-ui.js')+read('qcm-entry.js');
for(const t of spots){const id=t.replace(/^#/,'');assert(new RegExp(`id=["']${id}["']|id=\\\\?["']${id}|\\.id=['"]${id}['"]|id=\\\\"${id}`).test(html)||html.includes(`id="${id}"`)||html.includes(`id='${id}'`)||html.includes(`.id='${id}'`),'zone absente : '+t)}
// 2. Les réponses attendues sont celles des données embarquées.
const ok=(id,x)=>{const a=tasks[id].answer,tol=a.rel?Math.abs(a.value)*a.tol:a.tol;assert(Math.abs(x-a.value)<=tol+1e-12,`${id} : attendu ${a.value}, données ${x}`)};
ok('a-fe-p',26);ok('a-fe-n',56-26);ok('a-fe-e',26);ok('a-u-n',238-92);ok('a-oxygene',elements.find(e=>e.s==='O').z);
ok('i-c14-n',14-6);ok('i-q2',131-53);ok('i-co60-t',Number(iso(27,60).half));assert.equal(iso(27,60).unit,'d');
assert(!iso(6,14).stable&&iso(6,12).stable&&iso(6,13).stable&&iso(27,59).stable);
const t131=Number(iso(53,131).half);ok('d-i131',t131);ok('d-calc',800*Math.pow(2,-16.05/t131));ok('d-time',3*t131);
const chain=DecayChain.trace(isotopes,92,iso(92,238),{});assert.equal(chain.nodes.at(-1).id,'82:206');ok('r-chain',chain.nodes.length-1);
const he=M.masses(props['2:4']);ok('l-he-m',he.nucleus);
const dm=2*1.007276+2*1.008665-4.001506;ok('l-dm',dm);ok('l-e',dm*931.494);ok('l-ea',dm*931.494/4);
const fe=Number(props['26:56'].bindingKeVPerNucleon),u=Number(props['92:238'].bindingKeVPerNucleon),h=Number(props['2:4'].bindingKeVPerNucleon);assert(fe>u&&fe>h);
ok('p-dose',100*0.5);ok('p-q1',0.5/2*60);ok('p-cda',Math.log2(8));
// Découverte de l'application : les réponses correspondent à l'interface réelle.
const formulaGroups=(read('app.js').match(/\["\d · [^"]+", \[/g)||[]).length;
ok('t-nobles',elements.filter(e=>e.family==='noble').length);ok('t-carbone',isotopes[6].length);ok('t-rubriques',formulaGroups);ok('t-visuels',visualIds.length);
ok('t-aides',require('../exercises.js').generate(0,1).hints.length);
const co=DecayChain.trace(isotopes,27,iso(27,60),{});assert.equal(co.nodes.at(-1).id,'28:60');assert.equal(tasks['t-chaine'].options[tasks['t-chaine'].correct],'Ni-60');
// 3. Suivi : enregistrement, reprise, fin d'étape, réinitialisation, données corrompues, stockage refusé.
const mem=()=>{const m={};return {getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},raw:m}};
const p=D.get('bases'),st=mem(),a1=Prog.create(st),ids=p.steps.map(s=>s.id);
assert.equal(a1.mode,null);assert.equal(a1.resumeStep('decouverte',ids),'atome');
a1.setMode('parcours');a1.open('bases','atome');a1.setPhase('bases','atome',3);a1.recordTask('bases','atome','a-oxygene',false,'7');a1.recordTask('bases','atome','a-oxygene',true,'8');assert.equal(a1.active,'bases');
const a2=Prog.create(st);assert.equal(a2.mode,'parcours');assert.equal(a2.active,'bases');assert.equal(a2.step('bases','atome').phase,3);assert.deepEqual(a2.task('bases','atome','a-oxygene'),{ok:true,tries:2,value:'8'});
a2.complete('bases','atome');assert.equal(a2.resumeStep('bases',ids),'isotopes');assert.equal(a2.doneCount('bases',ids),1);
a2.restartStep('bases','atome');assert.equal(a2.status('bases','atome'),'started');assert.equal(a2.task('bases','atome','a-oxygene'),null);
a2.reset('bases');assert.equal(Prog.create(st).status('bases','atome'),'todo');assert.equal(Prog.create(st).mode,'parcours');
st.setItem(Prog.KEY,'{pas du json');assert.equal(Prog.create(st).mode,null);
st.setItem(Prog.KEY,JSON.stringify({v:1,mode:'pirate',parcours:{decouverte:{steps:{atome:{status:'hack',phase:99,tasks:{x:{ok:1,tries:-5,value:'<script>'.repeat(20)}}}}}}}));
const s3=Prog.create(st);assert.equal(s3.mode,null);assert.equal(s3.status('decouverte','atome'),'started');assert.equal(s3.step('decouverte','atome').phase,4);assert(s3.task('decouverte','atome','x').value.length<=40);
const refused=Prog.create({getItem:()=>null,setItem:()=>{throw Error('refusé')}});refused.setMode('libre');assert.equal(refused.mode,'libre');assert(!refused.persistent&&refused.message);
console.log(`Parcours : ${avail.map(x=>x.steps.length).join(' + ')} étapes, ${taskIds.size} activités, ${spots.size} zones d’interface, outils et réponses cohérents avec les données ; suivi local, reprise, réinitialisation et stockage refusé : OK`);
