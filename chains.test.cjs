const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').join(__dirname,'../');
const data=vm.runInNewContext(fs.readFileSync(root+'isotopes.js','utf8')+';isotopes');
const D=require('../decay-chain.js');
const at=(z,a,label)=>data[z].find(v=>v.a===a&&(label?v.label===label:!v.label));
for(const [z,a,label,endZ,endA,count] of [[1,3,null,2,3,2],[6,14,null,7,14,2],[27,60,null,28,60,2],[38,90,null,40,90,3],[43,99,'99m',44,99,3],[55,137,null,56,137,3],[92,238,null,82,206,15],[92,235,null,82,207,null],[90,232,null,82,208,null]]){
 const r=D.trace(data,z,at(z,a,label));const end=r.nodes.at(-1);assert.equal(r.status,'stable');assert.equal(end.z,endZ);assert.equal(end.v.a,endA);if(count)assert.equal(r.nodes.length,count);console.log(`${z}-${a}${label||''}: ${r.nodes.map(n=>n.id).join(' → ')}`);
}
let r=D.trace(data,55,at(55,137),{'55:137':1});assert.equal(r.nodes.length,2);
r=D.trace(data,6,at(6,12));assert.equal(r.nodes.length,1);assert.equal(r.status,'stable');
r=D.trace(data,92,at(92,238),{'92:238':1});assert.equal(r.status,'fission');
assert.equal(D.trace({'1':[{a:3,decays:[]}]},1,{a:3,decays:[]}).status,'missing');
assert.equal(D.trace({'1':[{a:3,decays:[{mode:'B-'}]}]},1,{a:3,decays:[{mode:'B-'}]}).status,'missing');
assert.equal(D.trace(data,92,at(92,238),{},1).status,'limit');
assert.equal(D.trace(data,1,{a:3,decays:[{mode:'unknown'}]}).status,'unsupported');
const cycles={'1':[{a:3,decays:[{mode:'B-'}]}],'2':[{a:3,decays:[{mode:'EC'}]}]};assert.equal(D.trace(cycles,1,cycles[1][0]).status,'cycle');
const tally={};for(const [z,vs] of Object.entries(data))for(const v of vs){const r=D.trace(data,+z,v);tally[r.status]=(tally[r.status]||0)+1;assert(r.nodes.length<=64);if(r.status==='stable')assert(r.nodes.at(-1).v.stable===true)}console.log(tally);
