/* Navigation et interaction carte v0.9 ; ne remplace pas la fermeture des fiches. */
(function(){
 const suggest=document.querySelector('#searchSuggestions'),search=document.querySelector('#search');
 function matches(text){
  const query=clean(text).trim(),isotope=query.replace(/[\s-]/g,'').match(/^([a-z]{1,3})(\d{1,3}m?)$|^(\d{1,3}m?)([a-z]{1,3})$/);
  if(isotope){const symbol=isotope[1]||isotope[4],id=isotope[2]||isotope[3],el=elements.find(e=>e.s.toLowerCase()===symbol);if(!el)return [];
   const v=(isotopes[el.z]||[]).find(v=>(v.label||String(v.a))===id);return v?[{el,v}]:[];}
  return elements.filter(e=>clean(e.name).includes(query)||e.s.toLowerCase()===query||String(e.z)===query).slice(0,8).map(el=>({el}));
 }
 function accept(item){
  const {el,v}=item,masked=activeFamily&&activeFamily!==el.family;
  if(masked)toggleFamily(activeFamily);
  if(v){isotopeSelection[el.z]=v.label||String(v.a);showElement(el.z)}
  else{selected=el.z;renderTable(search.value);document.querySelector(`.element[data-z="${el.z}"]`)?.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});}
  suggest.hidden=true;search.setAttribute('aria-expanded','false');
  document.querySelector('#results').textContent=`${el.name}${v?' · '+el.s+'-'+(v.label||v.a):''}${masked?' — filtre de famille désactivé pour afficher ce résultat.':''}`;
 }
 let items=[];
 search.addEventListener('input',()=>{
  items=search.value.trim()?matches(search.value):[];suggest.replaceChildren();suggest.hidden=!search.value.trim();search.setAttribute('aria-expanded',String(!suggest.hidden));
  if(!items.length&&search.value.trim())suggest.textContent='Aucun résultat. Exemples : uranium, U, 92, U235, U-235, 235U.';
  for(const item of items){const button=document.createElement('button');button.type='button';button.textContent=`${item.el.name} · ${item.el.s}${item.v?'-'+(item.v.label||item.v.a):' · Z = '+item.el.z}${activeFamily&&activeFamily!==item.el.family?' · hors famille sélectionnée':''}`;button.onclick=()=>accept(item);suggest.append(button)}
 });
 search.addEventListener('keydown',e=>{if(e.key==='Enter'&&items.length){e.preventDefault();accept(items[0])}if(e.key==='Escape'){suggest.hidden=true;search.setAttribute('aria-expanded','false')}if(e.key==='ArrowDown'){suggest.querySelector('button')?.focus();e.preventDefault()}});
 document.addEventListener('click',e=>{if(!suggest.contains(e.target)&&e.target!==search){suggest.hidden=true;search.setAttribute('aria-expanded','false')}});
 const pointers=new Map();let start=null,pinchState=null,moved=false,tapTimer=null,lastTap=0,lastTapPoint=null;
 function anchorZoom(value,x,y){
  const rect=viewport.getBoundingClientRect(),px=x-rect.left,py=y-rect.top;
  const rx=(viewport.scrollLeft+px)/(periodic.scrollWidth||1),ry=(viewport.scrollTop+py)/(periodic.scrollHeight||1);
  setZoom(value);requestAnimationFrame(()=>{viewport.scrollLeft=rx*periodic.scrollWidth-px;viewport.scrollTop=ry*periodic.scrollHeight-py;updateWindow()});
 }
 viewport.addEventListener('pointerdown',e=>{
  if(activeFamily||e.button>0)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});viewport.setPointerCapture(e.pointerId);
  if(pointers.size===1){start={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};moved=false}
  if(pointers.size===2){const [a,b]=[...pointers.values()];pinchState={d:Math.hypot(a.x-b.x,a.y-b.y),zoom};clearTimeout(tapTimer);moved=true;lastPanEnd=Date.now()}
 });
 viewport.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId)||activeFamily)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2&&pinchState){const [a,b]=[...pointers.values()];anchorZoom(pinchState.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinchState.d),(a.x+b.x)/2,(a.y+b.y)/2);lastPanEnd=Date.now();return}
  if(pointers.size===1&&start){const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)>7)moved=true;if(moved){viewport.scrollLeft=start.left-dx;viewport.scrollTop=start.top-dy;lastPanEnd=Date.now()}}
 });
 function finish(e){
  if(!pointers.has(e.pointerId))return;
  if(e.type==='pointerup'&&pointers.size===1&&!moved&&!activeFamily){
   const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.element');
   const now=Date.now();
   if(now-lastTap<300&&lastTapPoint&&Math.hypot(e.clientX-lastTapPoint.x,e.clientY-lastTapPoint.y)<35){clearTimeout(tapTimer);anchorZoom(zoom<1.4?zoom*1.6:1,e.clientX,e.clientY);lastTap=0;lastPanEnd=now}
   else{clearTimeout(tapTimer);lastTap=now;lastTapPoint={x:e.clientX,y:e.clientY};if(target){tapTimer=setTimeout(()=>showElement(+target.dataset.z),310)}}
  }
  if(moved)lastPanEnd=Date.now();pointers.delete(e.pointerId);if(!pointers.size){start=null;pinchState=null}else moved=true;
 }
 viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);
 // Pointer interaction handles tapping; keyboard and programmatic clicks keep native element handlers.
 viewport.addEventListener('click',e=>{if(!activeFamily&&e.detail>0){e.preventDefault();e.stopImmediatePropagation()}},true);
 viewport.addEventListener('wheel',e=>{if(activeFamily)return;e.preventDefault();anchorZoom(zoom*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
 viewport.addEventListener('keydown',e=>{if((e.key==='+'||e.key==='-')&&!activeFamily){e.preventDefault();setZoom(zoom+(e.key==='+'?.15:-.15))}});
})();
