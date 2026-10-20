(function(root){
 const groups={time:{min:1,h:60,d:1440},rate:{'µSv/h':.001,'mSv/h':1},dose:{'µSv':.001,'mSv':1,Sv:1000},distance:{cm:.01,m:1},energy:{keV:.001,MeV:1,J:1/1.602176634e-13},mass:{u:1,kg:1/1.66053906892e-27},activity:{Bq:1,kBq:1e3,MBq:1e6,GBq:1e9}};
 function parse(value){const s=String(value).trim().replace(/[\s\u00a0\u202f]/g,'').replace(',','.');if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s)||!Number.isFinite(Number(s)))throw Error('Saisir un nombre fini, avec virgule, point ou e.');return Number(s)}
 function convert(value,group,from,to){if(!groups[group]||!Object.hasOwn(groups[group],from)||!Object.hasOwn(groups[group],to))throw Error('Unité inconnue');const x=parse(value)*groups[group][from]/groups[group][to];if(!Number.isFinite(x)||(parse(value)!==0&&x===0))throw Error('Conversion hors plage');return x;}
 function value(id){return parse(document.getElementById(id).value)}
 function fmt(n){if(!Number.isFinite(n))return 'Hors plage';return n===0?'0':Math.abs(n)<.0001||Math.abs(n)>=1e7?n.toExponential(4).replace('.',','):n.toLocaleString('fr-FR',{maximumSignificantDigits:6})}
 const api={parse,convert,groups,value,fmt};root.NucleaUnits=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 document.addEventListener('change',e=>{const s=e.target;if(!s.matches('select[data-unit-for]'))return;const input=document.getElementById(s.dataset.unitFor),previous=s.dataset.previous;if(previous&&input.value.trim()){try{input.value=String(convert(input.value,s.dataset.unitGroup,previous,s.value))}catch(err){s.value=previous;input.setCustomValidity(err.message);return}}input.setCustomValidity('');s.dataset.previous=s.value;},true);
 function decorate(){document.querySelectorAll('input[data-scientific]:not([data-exponent-ready])').forEach(input=>{input.dataset.exponentReady='1';const b=document.createElement('button');b.className='exponent-btn';b.type='button';b.textContent='×10ⁿ';b.setAttribute('aria-label','Ajouter un exposant');b.onclick=()=>{if(!/e/i.test(input.value))input.value+='e';input.focus()};input.after(b)})}
 document.addEventListener('DOMContentLoaded',()=>{decorate();new MutationObserver(decorate).observe(document.querySelector('main'),{childList:true,subtree:true})});
})(globalThis);
