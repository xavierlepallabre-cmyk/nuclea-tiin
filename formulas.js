/* Enrichissement du formulaire conservé : deux niveaux d’accordéons. */
document.addEventListener('DOMContentLoaded',()=>{
 const quantities=[
 'A et Z, N, nₑ : nombres sans unité ; q : charge en C ; e : charge élémentaire en C ; u : unité de masse atomique.',
 '𝒜 et 𝒜₀ : activités en Bq ; N et N₀ : nombres de noyaux ; t et T½ : durées dans la même unité ; λ : inverse de cette unité de temps ; n : nombre de périodes.',
 'Z : protons ; N : neutrons ; A : nucléons ; masses en kg ou en u ; E : énergie en J ou en MeV ; c : vitesse en m/s.',
 'D : dose absorbée en Gy ; E : énergie en J ; m : masse en kg ; H : dose équivalente en Sv ; wᵣ : facteur sans unité ; débit en Sv/h et t en h.',
 'r₁ et r₂ : distances dans la même unité ; débits dans la même unité ; I et I₀ : intensités ; μ : inverse d’une longueur ; x et CDA : longueurs dans la même unité ; n : nombre de CDA.',
 'Préfixes : facteurs sans dimension ; durées en s ; longueurs en m ; c : vitesse en m/s ; ln(2) : nombre sans unité.'
 ];
 const examples=[
 ['Carbone-14 : Z = 6, N = 8 → A = 14.','Uranium-235 : A = 235, Z = 92 → N = 143.','Atome neutre de cobalt : Z = 27 → 27 électrons.','Ion Na⁺ : Z = 11 et nₑ = 10 → q = +1,602 × 10⁻¹⁹ C.','Une masse de 2 u vaut 3,32108 × 10⁻²⁷ kg.'],
 ['λ = 0,1 s⁻¹ et N = 1 000 → 𝒜 = 100 Bq.','N₀ = 1 000 et λt = ln(2) → N = 500.','𝒜₀ = 800 kBq et t = 3 T½ → 𝒜 = 100 kBq.','T½ = 8 jours → λ = 0,08664 jour⁻¹.','De 800 à 100 kBq avec T½ = 8 jours : t = 24 jours.','Après 4 périodes, 160 Bq deviennent 10 Bq.'],
 ['Pour un noyau fictif : somme des masses libres = 4,030 u, masse du noyau = 4,000 u → Δm = 0,030 u.','Δm = 0,030 u → E = 27,945 MeV (constante pédagogique 931,5).','E = 28 MeV pour A = 4 → 7 MeV par nucléon.','Une énergie de 2 MeV vaut 3,204 × 10⁻¹³ J avec les constantes arrondies du formulaire.'],
 ['0,02 J déposés dans 2 kg → D = 0,01 Gy.','Rayonnement avec wᵣ = 1 et D = 2 mGy → H = 2 mSv.','Deux contributions : 1 mSv + 3 mSv → H = 4 mSv.','0,2 mSv reçus en 0,5 h → débit moyen = 0,4 mSv/h.','0,4 mSv/h pendant 15 min = 0,25 h → 0,1 mSv.'],
 ['100 µSv/h à 1 m → 25 µSv/h à 2 m dans le modèle ponctuel.','μx = ln(2) → transmission de 50 %.','μ = 0,1 cm⁻¹ → CDA ≈ 6,93 cm.','Après 3 CDA, I/I₀ = 1/8 = 12,5 %.','Préparer hors zone réduit le temps exposé ; une relève répartit les doses sans nécessairement diminuer la dose collective.'],
 ['2,5 MBq = 2,5 × 10⁶ Bq.','250 µSv = 0,25 mSv.','15 min = 900 s = 0,25 h.','3 nm = 3 × 10⁻⁹ m.','En 2 s, la lumière parcourt environ 6,00 × 10⁸ m dans le vide.','ln(2) ≈ 0,693 ; vérifier que λt est sans dimension.']
 ];
 const groupHyp=[
 'Un isotope est défini par Z et A. Ne pas utiliser la masse atomique moyenne comme nombre A.',
 'Un radionucléide isolé sans apport ni production par un parent ; l’activité des descendants n’est pas incluse.',
 'Distinguer masses atomiques neutres et masses nucléaires ; utiliser le calculateur sourcé pour les isotopes réels.',
 'Les facteurs de pondération doivent être connus ; un débit constant est nécessaire pour H = débit × temps.',
 'La loi en 1/r² suppose une source ponctuelle et une géométrie appropriée ; l’atténuation exponentielle est un modèle de faisceau étroit, sans diffusion prise en compte.',
 'Le préfixe porte sur l’unité complète ; conserver les unités et les puissances de dix pendant la conversion.'
 ];
 document.querySelectorAll('#formulaList .formula').forEach((article,group)=>{
  const outer=document.createElement('details');outer.className='formula';outer.name='formula-rubrique';outer.dataset.topic=group;const summary=document.createElement('summary');summary.append(article.querySelector('.formula-head'));outer.append(summary);
  article.querySelectorAll('.formula-item').forEach((item,index)=>{
   const inner=document.createElement('details');inner.className='formula-item';const sum=document.createElement('summary');sum.append(item.querySelector('.eq'));inner.append(sum);
   for(const [title,text] of [['Grandeurs et unités',quantities[group]],['Hypothèses',item.querySelector('p').textContent+' '+groupHyp[group]],['Exemple résolu',examples[group][index]||'Vérifier les unités avant de remplacer les valeurs.']]){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=title+' : ';p.append(strong,document.createTextNode(text));inner.append(p);}
   if(group===1){const button=document.createElement('button');button.className='btn btn-ghost';button.textContent='Aller à l’exemple : calcul de décroissance';button.onclick=()=>{document.querySelector('#decayCalculator').scrollIntoView({block:'start'});document.querySelector('#rdInitial').focus({preventScroll:true})};inner.append(button)}
   if(group===2||group===3||group===4){const button=document.createElement('button');button.className='btn btn-ghost';button.textContent=group===2?'Ouvrir énergie de liaison et Aston':'Ouvrir le module DATE';button.onclick=()=>{document.querySelector('[data-tab="explore"]').click();document.querySelector(group===2?'#energyTool':'#dateTool').scrollIntoView({block:'start'})};inner.append(button);}
   outer.append(inner);
  });
  // Rubrique 2 : le calcul guidé de décroissance est rangé ici, comme exemple d'application.
  const calc=group===1&&document.querySelector('#decayCalculator');if(calc)outer.append(calc);
  outer.addEventListener('toggle',()=>{if(outer.open)document.querySelectorAll('#formulaList > details').forEach(other=>{if(other!==outer)other.open=false})});article.replaceWith(outer);
 });
});
