// v0.15 : masses atomiques et nucléaires des fiches isotopiques.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..'),M=require('../nuclear-mass.js');
const props=vm.runInNewContext(fs.readFileSync(path.join(root,'nuclear-properties.js'),'utf8')+';nuclearProperties');
const isotopes=vm.runInNewContext(fs.readFileSync(path.join(root,'isotopes.js'),'utf8')+';isotopes');
const elements=JSON.parse(fs.readFileSync(path.join(root,'elements.json'),'utf8'));
// 1. Références CODATA 2022 indépendantes : proton, deuton, triton, particule α (masses des noyaux).
for(const [k,ref] of [['1:1',1.0072764665789],['1:2',2.013553212544],['1:3',3.01550071597],['2:4',4.001506179129]]){
 const m=M.masses(props[k]);assert(Math.abs(m.nucleus-ref)<m.nucleusUnc,`${k} : ${m.nucleus} ≠ ${ref}`);}
// 2. Isotopes de contrôle : la masse du noyau redonne l'énergie de liaison AME2020 une fois la liaison des électrons prise en compte.
const IH=0.0135984; // keV, énergie d'ionisation de l'hydrogène (la référence AME utilise m(¹H))
for(const k of ['6:12','6:13','6:14','2:4','26:56','92:235','92:238']){
 const r=props[k],m=M.masses(r),dm=r.z*M.MP_U+(r.a-r.z)*M.MN_U-m.nucleus,perA=dm*M.U_KEV/r.a;
 const ref=(r.a*Number(r.bindingKeVPerNucleon)-(m.electronBindingKeV-r.z*IH))/r.a;
 assert(Math.abs(perA-ref)<0.01,`${k} : ${perA} keV/A ≠ ${ref}`);
 assert(m.nucleus<m.atom&&Math.abs(m.atom-r.a)<0.5,`${k} : ordre des masses`);
 // la masse du noyau n'est jamais A, ni la masse atomique moyenne de l'élément
 const el=elements.find(e=>e.z===r.z);assert(m.nucleus!==r.a&&Math.abs(m.atom-el.mass)>1e-6,`${k} : masse moyenne`);}
const c12=M.masses(props['6:12']);assert(c12.exact&&c12.atom===12&&M.formatU(c12.nucleus,c12.nucleusDecimals).replace(/\u202f/g,' ').startsWith('11,996 709 6'));
// 3. Couverture : toute masse atomique AME embarquée donne une masse du noyau ; les absences restent absentes.
let ok=0,none=0;for(const r of Object.values(props)){const m=M.masses(r);if(r.massMicroU===''){assert.equal(m,null);none++}else{assert(Number.isFinite(m.nucleus)&&m.nucleusDecimals>=6&&m.nucleusDecimals<=9);ok++}}
assert.equal(ok,3356);assert.equal(none,27);
// 4. Isomères : masse du fondamental + E*/c².
const tc=isotopes[43].find(v=>v.label==='99m'),mt=M.masses(props['43:99'],tc.energy),mg=M.masses(props['43:99']);
assert(Math.abs((mt.atom-mg.atom)*M.U_KEV-142.6836)<1e-6&&mt.excited);
assert.equal(M.masses(null),null);
console.log(`Masses : ${ok} isotopes couverts, ${none} sans donnée ; p, d, t, α conformes CODATA ; C-12/13/14, He-4, Fe-56, U-235/238 cohérents avec AME2020 : OK`);
