/* Nucléa TIIN v0.15 — masse atomique et masse du noyau d'un isotope.
   Source des masses atomiques : colonne atomic_mass (micro-u) du CSV AIEA ground_states,
   issue de l'évaluation AME2020, déjà embarquée dans nuclear-properties.js. Aucune nouvelle table.
   Masse du noyau : m_noyau = m_atome − Z·mₑ + Bₑ(Z)/c², avec Bₑ(Z) l'énergie de liaison totale
   des électrons (formule de Lunney, Pearson et Thibault, Rev. Mod. Phys. 75, 1021 (2003),
   reprise par l'AME). Voir SOURCES.md, section v0.15. */
(function(root){
 // CODATA 2022 (NIST SP 961) : https://physics.nist.gov/cuu/pdf/wall_2022.pdf
 const ME_U=5.485799090441e-4;      // masse de l'électron (u)
 const MP_U=1.0072764665789;        // masse du proton (u)
 const MN_U=1.00866491606;          // masse du neutron (u)
 const U_KEV=931494.10372;          // énergie équivalente de 1 u (keV)
 // Énergie de liaison totale des électrons d'un atome neutre, en keV.
 // Formule ajustée sur Z = 18 à 106 : écart quadratique moyen de l'ordre de 0,2 à 0,3 %.
 // Incertitude retenue (majorant prudent) : 1 % pour Z ≥ 18 ; hors domaine d'ajustement (Z < 18), 2 % et au moins 5 eV.
 function electronBindingKeV(z){return (14.4381*Math.pow(z,2.39)+1.55468e-6*Math.pow(z,5.35))/1000}
 function electronBindingUncKeV(z){const b=electronBindingKeV(z);return z>=18?0.01*b:Math.max(0.02*b,0.005)}
 // Nombre de décimales : jusqu'au premier chiffre significatif de l'incertitude, entre 6 et 9.
 function decimalsFor(unc){if(!(unc>0))return 9;return Math.min(9,Math.max(6,Math.ceil(-Math.log10(unc))))}
 /* masses({z,a,massMicroU,massUncMicroU,massSystematics}, excitationKeV?) →
    null si la masse atomique est absente ; sinon les deux masses en u, leurs incertitudes et leur statut. */
 function masses(row,excitationKeV){
  if(!row||row.massMicroU===''||row.massMicroU==null)return null;
  const micro=Number(row.massMicroU),uncMicro=row.massUncMicroU===''?NaN:Number(row.massUncMicroU);
  if(!Number.isFinite(micro)||!Number.isInteger(row.z)||row.z<1)return null;
  const exc=Number(excitationKeV)||0;
  const atom=micro/1e6+exc/U_KEV;                              // état excité : + E*/c²
  const atomUnc=Number.isFinite(uncMicro)?uncMicro/1e6:NaN;
  const beKeV=electronBindingKeV(row.z),beU=beKeV/U_KEV,beUnc=electronBindingUncKeV(row.z)/U_KEV;
  const nucleus=atom-row.z*ME_U+beU;
  const nucleusUnc=Number.isFinite(atomUnc)?Math.hypot(atomUnc,beUnc):NaN;
  return {z:row.z,a:row.a,n:row.a-row.z,atom,atomUnc,nucleus,nucleusUnc,electronBindingKeV:beKeV,
   exact:row.z===6&&row.a===12&&!exc,estimated:row.massSystematics==='Y',excited:exc>0,
   atomDecimals:decimalsFor(atomUnc),nucleusDecimals:decimalsFor(nucleusUnc)};
 }
 // Écriture française avec groupes de trois décimales (espace fine insécable).
 function formatU(x,decimals){
  const [i,d]=x.toFixed(decimals).split('.');
  return i+(d?','+d.replace(/(\d{3})(?=\d)/g,'$1 '):'');
 }
 function formatUncMicro(unc){
  if(!Number.isFinite(unc))return 'incertitude non renseignée';
  const mu=unc*1e6;
  return '± '+(mu>=100?Math.round(mu).toLocaleString('fr-FR'):mu.toLocaleString('fr-FR',{maximumSignificantDigits:2}))+' µu';
 }
 const api={masses,formatU,formatUncMicro,electronBindingKeV,electronBindingUncKeV,decimalsFor,ME_U,MP_U,MN_U,U_KEV};
 root.NuclearMass=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
