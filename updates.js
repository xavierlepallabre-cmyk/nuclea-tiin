/* Contrôle des mises à jour ; aucune suppression du stockage utilisateur. */
document.addEventListener('DOMContentLoaded',()=>{
 const bar=document.createElement('aside');bar.className='update-bar';bar.hidden=true;bar.setAttribute('aria-live','polite');bar.innerHTML='<span>Une mise à jour est prête. Les préparations enregistrées sont conservées. Une actualisation réinitialise les saisies non enregistrées et l’exercice en cours.</span><button type="button" class="btn btn-primary">Actualiser maintenant</button><button type="button" class="btn btn-ghost">Plus tard</button>';document.body.append(bar);
 let waiting=null,accepted=false;bar.querySelectorAll('button')[0].onclick=()=>{if(!waiting)return;accepted=true;waiting.postMessage({type:'ACTIVATE_UPDATE'})};bar.querySelectorAll('button')[1].onclick=()=>bar.hidden=true;
 if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('controllerchange',()=>{if(accepted)location.reload()});navigator.serviceWorker.ready.then(reg=>{
  if(!reg)return;function offer(){if(reg.waiting&&navigator.serviceWorker.controller){waiting=reg.waiting;bar.hidden=false}}
  offer();reg.addEventListener('updatefound',()=>{const installing=reg.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed')offer()})});
  const check=document.querySelector('#checkUpdate');if(check)check.onclick=()=>reg.update().then(()=>{offer();document.querySelector('#updateStatus').textContent=reg.waiting?'Une mise à jour est disponible.':'Vérification effectuée : aucune mise à jour en attente.'}).catch(()=>document.querySelector('#updateStatus').textContent='Vérification indisponible hors connexion.');
 }).catch(()=>{});}
 const clear=document.querySelector('#clearLocalData');clear.onclick=()=>{if(!confirm('Effacer toutes les préparations et préférences locales de Nucléa TIIN sur cet appareil ?'))return;try{for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key?.startsWith('nuclea-'))localStorage.removeItem(key)}location.reload()}catch(e){document.querySelector('#updateStatus').textContent='Le navigateur refuse l’effacement.'}};
});
