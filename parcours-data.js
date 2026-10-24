/* Nucléa TIIN v0.17 — données des parcours élève.
   Ce fichier ne contient que du contenu pédagogique : le moteur (parcours.js) l'affiche,
   le suivi (parcours-progress.js) mémorise la progression, les outils scientifiques restent inchangés.
   Pour réorganiser un parcours : déplacer, ajouter ou retirer des objets dans "steps" ou "blocks".

   Phases d'une étape : par défaut decouvrir, observer, manipuler, comprendre, verifier ;
   un parcours peut définir les siennes (champ phases, 5 au maximum), comme la découverte de l'application.
   Blocs possibles :
     {type:'text', html}                       court paragraphe
     {type:'tool', label, action}              bouton qui ouvre un outil existant
     {type:'read', id, q, answer, hint, explain, action?}   relevé ou calcul saisi par l'élève
        answer : {value, tol, rel?, unit?}     rel:true → tolérance relative
     {type:'choice', id, q, options, correct, explain, action?}   question à choix
     {type:'keys', items}                      « À retenir »
   Actions (voir Tools dans parcours.js) :
     {tool:'table'} · {tool:'element', z, iso, chain?} · {tool:'visual', id}
     {tool:'decay', z, iso, initial, initialUnit, duration, durationUnit}
     {tool:'energy', z, a} · {tool:'exercise', theme, level} · {tool:'date', mode}
     {tool:'formulas', topic}                  topic = index de rubrique (0 à 5)
     {tool:'spot', tab?, target}              ouvre l'onglet et met en évidence une zone de l'interface
   Les identifiants (id) d'étapes et de questions servent au suivi : ne pas les renommer après diffusion. */
(function(root){
const parcours=[
/* ================= Découverte de l'application (interface) ================= */
{id:'decouverte',title:'Découverte de l’application',available:true,
 intro:'Six étapes courtes pour apprendre à te servir de Nucléa TIIN : où trouver chaque outil et comment l’utiliser.',
 phases:[['decouvrir','Découvrir'],['essayer','Essayer'],['retenir','À retenir']],
 steps:[
 {id:'ui-tableau',title:'Le tableau périodique',minutes:4,
  summary:'Onglet Éléments : se déplacer, rechercher, filtrer, ouvrir une fiche.',
  phases:{
  decouvrir:[
   {type:'text',html:'L’onglet <b>Éléments</b> affiche les 118 éléments. Sur téléphone, fais glisser le tableau avec le doigt, pince pour zoomer ou touche la <b>miniature</b> pour te déplacer.'},
   {type:'tool',label:'Montrer la recherche',action:{tool:'spot',tab:'table',target:'#search'}},
   {type:'text',html:'La <b>recherche</b> accepte un nom (uranium), un symbole (U), un numéro (92) ou un isotope (U235, U-235).'},
   {type:'tool',label:'Montrer les familles',action:{tool:'spot',tab:'table',target:'#legend'}},
   {type:'text',html:'Les <b>familles</b> colorent le tableau. Touche une famille pour n’afficher qu’elle et lire sa définition ; touche-la à nouveau pour revenir aux 118 éléments.'}],
  essayer:[
   {type:'read',id:'t-nobles',q:'Touche la famille « Gaz nobles ». Combien d’éléments restent affichés ?',action:{tool:'spot',tab:'table',target:'#legend'},answer:{value:7,tol:0},hint:'Compte les cases restées colorées.',explain:'7 gaz nobles : He, Ne, Ar, Kr, Xe, Rn et Og.'},
   {type:'choice',id:'t-search',q:'Tape « U235 » dans la recherche et choisis la proposition. Que se passe-t-il ?',action:{tool:'spot',tab:'table',target:'#search'},options:['La fiche de l’uranium s’ouvre, sur l’isotope 235','Un calcul de décroissance démarre','Rien : il faut taper « uranium »'],correct:0,explain:'La recherche ouvre directement la fiche, déjà réglée sur l’isotope demandé.'}],
  retenir:[
   {type:'keys',items:['Éléments : le tableau des 118 éléments.','Recherche : nom, symbole, Z ou isotope (U235).','Familles : filtrer le tableau et lire leur définition.','Toucher une case ouvre la fiche de l’élément.']}]}},
 {id:'ui-fiche',title:'La fiche d’un élément',minutes:5,
  summary:'Choisir un isotope, lire ses données, accéder aux calculs.',
  phases:{
  decouvrir:[
   {type:'text',html:'La fiche s’ouvre par-dessus le tableau. En haut, la liste <b>Isotope étudié</b> permet de changer d’isotope. Dessous : composition du noyau, notation, période, masses, modes de désintégration.'},
   {type:'text',html:'Trois boutons mènent aux calculs : <b>Tracer la désintégration</b> (filiation), <b>Étudier sa décroissance</b> (calculateur prérempli) et <b>Énergie de liaison et Aston</b>. Ferme la fiche avec la croix ou le bouton Retour du téléphone.'},
   {type:'tool',label:'Ouvrir la fiche du carbone',action:{tool:'element',z:6,iso:'12'}}],
  essayer:[
   {type:'read',id:'t-carbone',q:'Dans la fiche du carbone, combien d’isotopes ou états sont disponibles ?',action:{tool:'element',z:6,iso:'12'},answer:{value:14,tol:0},hint:'La phrase « … isotope(s) / état(s) disponibles » est juste au-dessus des données.',explain:'14 isotopes du carbone sont décrits, du plus léger au plus lourd connu.'},
   {type:'choice',id:'t-chaine',q:'Ouvre la fiche du cobalt 60 et touche « Tracer la désintégration ». Sur quel noyau stable le parcours s’arrête-t-il ?',action:{tool:'element',z:27,iso:'60'},options:['Fe-60','Ni-60','Co-59'],correct:1,explain:'Le cobalt 60 se désintègre en nickel 60, stable.'},
   {type:'choice',id:'t-source',q:'Où vérifier d’où viennent les données d’un isotope ?',options:['Dans « Source et précision des données », en bas de la fiche','Dans l’onglet Exercices','Nulle part'],correct:0,explain:'Chaque fiche donne sa source (AIEA), sa date d’extraction et la précision des valeurs.'}],
  retenir:[
   {type:'keys',items:['« Isotope étudié » change l’isotope affiché.','Les boutons de la fiche ouvrent la filiation, la décroissance et l’énergie de liaison.','La source des données est en bas de chaque fiche.','Croix ou bouton Retour : revenir au tableau.']}]}},
 {id:'ui-formulaire',title:'Le formulaire et le calculateur',minutes:4,
  summary:'Onglet Formulaire : les formules par rubrique et le calcul de décroissance.',
  phases:{
  decouvrir:[
   {type:'text',html:'L’onglet <b>Formulaire</b> commence par le <b>calculateur de décroissance</b> : activité restante après une durée, ou durée pour atteindre une activité.'},
   {type:'tool',label:'Montrer le calculateur',action:{tool:'spot',tab:'formulas',target:'#decayCalculator'}},
   {type:'text',html:'Dessous, les formules sont rangées par <b>rubriques</b>. Touche une rubrique pour la déplier, puis une formule pour voir ses conditions d’emploi et un exemple.'},
   {type:'tool',label:'Montrer les rubriques',action:{tool:'spot',tab:'formulas',target:'#formulaList'}}],
  essayer:[
   {type:'read',id:'t-rubriques',q:'Combien de rubriques compte le formulaire ?',action:{tool:'spot',tab:'formulas',target:'#formulaList'},answer:{value:6,tol:0},hint:'Compte les titres numérotés 1 à …',explain:'6 rubriques : atome et noyau, activité et décroissance, masse et énergie, dose, distance et écrans, conversions.'},
   {type:'choice',id:'t-exemple',q:'Dans le calculateur, touche « Charger un exemple » puis « Calculer ». Qu’apparaît-il sous le résultat ?',action:{tool:'spot',tab:'formulas',target:'#decayCalculator'},options:['Les étapes du calcul et une courbe de décroissance','Le tableau périodique','Un QCM noté'],correct:0,explain:'Le calculateur montre le résultat, le détail du calcul et la courbe que l’on peut explorer.'}],
  retenir:[
   {type:'keys',items:['Formulaire : calculateur de décroissance puis 6 rubriques de formules.','Chaque formule indique ses conditions d’emploi.','Depuis une fiche, « Étudier sa décroissance » remplit le calculateur pour toi.']}]}},
 {id:'ui-explorer',title:'Explorer : phénomènes et outils',minutes:4,
  summary:'Visuels animés en plein écran, énergie de liaison, outil DATE.',
  phases:{
  decouvrir:[
   {type:'text',html:'L’onglet <b>Explorer</b> réunit les <b>phénomènes animés</b> : chacun s’ouvre en plein écran et se manipule avec des curseurs. <b>Fermer</b> ou le bouton Retour ramène à Explorer.'},
   {type:'tool',label:'Montrer les phénomènes animés',action:{tool:'spot',tab:'explore',target:'#visualGrid'}},
   {type:'text',html:'Plus bas, les <b>outils de calcul</b> : énergie de liaison et courbe d’Aston, puis <b>DATE</b> pour comparer des façons d’organiser une intervention.'},
   {type:'tool',label:'Montrer l’outil DATE',action:{tool:'spot',tab:'explore',target:'#dateTool'}}],
  essayer:[
   {type:'read',id:'t-visuels',q:'Combien de phénomènes animés propose Explorer ?',action:{tool:'spot',tab:'explore',target:'#visualGrid'},answer:{value:5,tol:0},hint:'Compte les cartes sous « Phénomènes animés ».',explain:'5 visuels : décroissance, atténuation, distance, désintégrations, filiation.'},
   {type:'choice',id:'t-fermer',q:'Ouvre « Décroissance radioactive ». Comment revenir à Explorer ?',action:{tool:'visual',id:'decroissance'},options:['Avec « Fermer » ou le bouton Retour du téléphone','En fermant l’application','En rechargeant la page'],correct:0,explain:'« Fermer » ou Retour : tu retrouves Explorer là où tu l’avais laissé.'},
   {type:'choice',id:'t-zoom',q:'Sur la courbe d’Aston, à quoi sert le bouton « Zoom 7–9 MeV » ?',action:{tool:'spot',tab:'explore',target:'#energyTool'},options:['À séparer les noyaux autour du maximum de la courbe','À changer d’unité','À lancer une animation'],correct:0,explain:'En vue complète, les noyaux lourds se tassent en haut : le zoom les sépare.'}],
  retenir:[
   {type:'keys',items:['Explorer : phénomènes animés en plein écran, puis outils de calcul.','« Fermer » ou Retour : revenir à Explorer.','Énergie de liaison et Aston, DATE : sous les phénomènes animés.']}]}},
 {id:'ui-exercices',title:'S’entraîner',minutes:4,
  summary:'Onglet Exercices : thème, niveau, aides ; le QCM de classe.',
  phases:{
  decouvrir:[
   {type:'text',html:'Dans <b>Exercices</b>, choisis un <b>thème</b> et un <b>niveau</b> (1 à 3) : l’énoncé apparaît. Saisis ta réponse et son unité, puis <b>Vérifier</b>. Les aides arrivent une par une, jusqu’à la correction. Aucun résultat n’est enregistré.'},
   {type:'tool',label:'Montrer les thèmes',action:{tool:'spot',tab:'exercises',target:'#exerciseTheme'}},
   {type:'text',html:'La carte <b>QCM de classe</b> sert uniquement pendant une séance organisée par l’enseignant, sur le Wi-Fi de la classe.'},
   {type:'tool',label:'Montrer le QCM de classe',action:{tool:'spot',tab:'exercises',target:'#joinCollective'}}],
  essayer:[
   {type:'read',id:'t-aides',q:'Ouvre un exercice et touche « Un coup de pouce » jusqu’au bout. Combien d’aides au maximum ?',action:{tool:'exercise',theme:0,level:1},answer:{value:4,tol:0},hint:'Le compteur affiche 2/4, 3/4…',explain:'4 aides : indice, formule, application, correction.'},
   {type:'choice',id:'t-qcm',q:'Le QCM de classe fonctionne :',options:['seulement pendant une séance, sur le Wi-Fi de la classe et le PC de l’enseignant','partout, avec Internet','sans l’enseignant, à la maison'],correct:0,explain:'Le QCM passe par le PC de l’enseignant ; les exercices individuels, eux, marchent partout.'}],
  retenir:[
   {type:'keys',items:['Exercices : thème + niveau, puis Vérifier.','Aides une par une, jusqu’à la correction ; rien n’est noté.','QCM de classe : seulement en séance, avec l’enseignant.']}]}},
 {id:'ui-reglages',title:'Réglages et hors connexion',minutes:3,
  summary:'Thème, À propos, installation, utilisation sans réseau, mises à jour.',
  phases:{
  decouvrir:[
   {type:'text',html:'En haut à droite : <b>ⓘ</b> ouvre « À propos » (sources, mises à jour) et la <b>lune / soleil</b> passe en thème sombre ou clair.'},
   {type:'tool',label:'Montrer le bouton de thème',action:{tool:'spot',target:'#themeToggle'}},
   {type:'text',html:'Installe l’application : menu du navigateur → <b>Ajouter à l’écran d’accueil</b>. Après un premier chargement, elle fonctionne <b>sans réseau</b>. Quand une nouvelle version est prête, un bandeau propose <b>Actualiser maintenant</b> ; ta progression est conservée.'}],
  essayer:[
   {type:'choice',id:'t-theme',q:'Touche la lune (ou le soleil). Que se passe-t-il ?',action:{tool:'spot',target:'#themeToggle'},options:['L’application passe en thème sombre (ou clair)','Le parcours recommence','Les données sont effacées'],correct:0,explain:'Le thème est mémorisé sur ton appareil ; touche à nouveau pour revenir.'},
   {type:'choice',id:'t-horsligne',q:'L’application est installée et tu n’as plus de réseau :',options:['tout fonctionne : tableau, fiches, calculs, visuels et parcours','plus rien ne s’affiche','seul le tableau s’affiche'],correct:0,explain:'Tout est enregistré sur le téléphone au premier chargement. Seul le QCM de classe demande le Wi-Fi de la classe.'},
   {type:'choice',id:'t-retrouver',q:'Où retrouver les parcours plus tard ?',options:['Dans l’onglet Parcours','Dans À propos','Il faut réinstaller l’application'],correct:0,explain:'L’onglet Parcours garde ta progression ; tu peux aussi explorer librement à tout moment.'}],
  retenir:[
   {type:'keys',items:['ⓘ : À propos ; lune / soleil : thème.','Ajouter à l’écran d’accueil, puis utilisation sans réseau.','Mise à jour : « Actualiser maintenant », progression conservée.','Onglet Parcours : reprendre là où tu t’étais arrêté.']}]}}
 ]},
/* ================= Physique nucléaire : les bases ================= */
{id:'bases',title:'Physique nucléaire : les bases',available:true,
 intro:'Six étapes, du noyau de l’atome à la radioprotection. Chaque étape te fait manipuler les outils de Nucléa TIIN.',
 steps:[
 /* ------------------------------------------------------------------ 1 */
 {id:'atome',title:'Structure de l’atome',minutes:10,
  summary:'Protons, neutrons, électrons ; Z, A et N.',
  phases:{
  decouvrir:[
   {type:'text',html:'Un atome est formé d’un <b>noyau</b> très petit, qui contient des <b>protons</b> et des <b>neutrons</b> (les nucléons), entouré d’<b>électrons</b>.'},
   {type:'text',html:'<b>Z</b>, le numéro atomique, est le nombre de protons : il identifie l’élément. <b>A</b>, le nombre de masse, est le nombre de nucléons. On en déduit le nombre de neutrons : <b>N = A − Z</b>.'}],
  observer:[
   {type:'text',html:'Dans le tableau périodique, les éléments sont rangés par Z croissant.'},
   {type:'read',id:'a-oxygene',q:'Quel est le numéro atomique Z de l’oxygène ?',action:{tool:'table'},
    answer:{value:8,tol:0},hint:'Cherche « O » dans le tableau : le nombre affiché en haut de la case est Z.',explain:'Z = 8 : tout atome d’oxygène possède 8 protons.'}],
  manipuler:[
   {type:'text',html:'Ouvre la fiche du fer 56 et relève les nombres de particules.'},
   {type:'read',id:'a-fe-p',q:'Fer 56 : combien de protons ?',action:{tool:'element',z:26,iso:'56'},answer:{value:26,tol:0},hint:'Z = nombre de protons.',explain:'Z = 26.'},
   {type:'read',id:'a-fe-n',q:'Fer 56 : combien de neutrons ?',answer:{value:30,tol:0},hint:'N = A − Z.',explain:'N = 56 − 26 = 30.'},
   {type:'read',id:'a-fe-e',q:'Combien d’électrons possède l’atome de fer neutre ?',answer:{value:26,tol:0},hint:'Atome neutre : autant de charges − que de charges +.',explain:'Autant d’électrons que de protons : 26.'},
   {type:'read',id:'a-u-n',q:'Uranium 238 : combien de neutrons ?',action:{tool:'element',z:92,iso:'238'},answer:{value:146,tol:0},hint:'Relève Z sur la fiche, puis calcule A − Z.',explain:'N = 238 − 92 = 146.'}],
  comprendre:[
   {type:'keys',items:['Z (protons) identifie l’élément.','A = Z + N : nombre de nucléons.','N = A − Z.','Atome neutre : nombre d’électrons = Z.','A est un nombre entier : ce n’est pas une masse.']}],
  verifier:[
   {type:'choice',id:'a-q1',q:'Un noyau contient 17 protons et 18 neutrons. Que vaut A ?',options:['17','18','35','52'],correct:2,explain:'A = Z + N = 17 + 18 = 35 (c’est le chlore 35).'},
   {type:'choice',id:'a-q2',q:'Deux atomes ont tous les deux Z = 6. Que peut-on affirmer ?',options:['Ils ont le même nombre de neutrons','Ce sont deux atomes du même élément, le carbone','Ils ont la même masse'],correct:1,explain:'Z fixe l’élément. Le nombre de neutrons, et donc la masse, peuvent différer : ce sont alors des isotopes.'},
   {type:'tool',label:'S’entraîner : Atome et noyau, niveau 1',action:{tool:'exercise',theme:0,level:1}}]}},
 /* ------------------------------------------------------------------ 2 */
 {id:'isotopes',title:'Isotopes et stabilité',minutes:15,
  summary:'Élément ou isotope ; stable ou radioactif ; notation nucléaire.',
  phases:{
  decouvrir:[
   {type:'text',html:'Des <b>isotopes</b> sont des atomes du même élément (même Z) qui n’ont pas le même nombre de neutrons. Ils ont les mêmes propriétés chimiques, mais pas le même noyau.'},
   {type:'text',html:'Certains noyaux sont <b>stables</b>. D’autres sont <b>radioactifs</b> : ils finissent par se transformer. Notation : <span class="pc-nuclide"><sup>A</sup><sub>Z</sub>X</span>, par exemple <span class="pc-nuclide"><sup>14</sup><sub>6</sub>C</span>.'}],
  observer:[
   {type:'text',html:'Ouvre la fiche du carbone, puis change d’isotope dans la liste « Isotope étudié » : C-12, C-13, C-14.'},
   {type:'read',id:'i-c14-n',q:'Combien de neutrons dans le carbone 14 ?',action:{tool:'element',z:6,iso:'14'},answer:{value:8,tol:0},hint:'N = A − Z, avec Z = 6 pour tous les carbones.',explain:'N = 14 − 6 = 8, contre 6 pour le carbone 12.'},
   {type:'choice',id:'i-c-radio',q:'Parmi C-12, C-13 et C-14, lequel est radioactif ?',options:['C-12','C-13','C-14'],correct:2,explain:'Le carbone 14 est radioactif (période d’environ 5 700 ans). C-12 et C-13 sont stables.'}],
  manipuler:[
   {type:'read',id:'i-co60-t',q:'Cobalt 60 : relève sa période radioactive, en jours.',action:{tool:'element',z:27,iso:'60'},answer:{value:1925.28,tol:1,unit:'jours'},hint:'Ligne « Période radioactive » de la fiche.',explain:'1 925,28 jours, soit environ 5,27 ans.'},
   {type:'choice',id:'i-co59',q:'Et le cobalt 59 ?',action:{tool:'element',z:27,iso:'59'},options:['Il est stable','Il est radioactif'],correct:0,explain:'Le cobalt 59 est le seul isotope stable du cobalt. Le cobalt 60 est produit par activation neutronique du cobalt 59 dans les réacteurs.'},
   {type:'choice',id:'i-vallee',q:'Ouvre « Désintégrations α, β, γ », choisis β⁻ puis ⁶⁰Co, et regarde la vallée de stabilité. Par rapport aux noyaux stables, le ⁶⁰Co a :',action:{tool:'visual',id:'desintegrations'},options:['trop de neutrons','trop de protons','trop de nucléons au total'],correct:0,explain:'Il est sous la vallée de stabilité : un neutron se transforme en proton (désintégration β⁻).'}],
  comprendre:[
   {type:'keys',items:['Même élément = même Z. Isotopes = même Z, N différent.','Notation ᴬ_Z X : A en haut, Z en bas.','Un isotope est stable ou radioactif, quel que soit son élément.','Trop de neutrons → β⁻ ; trop de protons → β⁺ ; noyau lourd → souvent α.']}],
  verifier:[
   {type:'choice',id:'i-q1',q:'Quelle est la différence entre ²³⁵U et ²³⁸U ?',options:['3 protons','3 neutrons','3 électrons'],correct:1,explain:'Même Z = 92, donc même nombre de protons. 238 − 235 = 3 neutrons de plus.'},
   {type:'read',id:'i-q2',q:'Iode 131 (Z = 53) : combien de neutrons ?',answer:{value:78,tol:0},hint:'N = A − Z.',explain:'N = 131 − 53 = 78.'}]}},
 /* ------------------------------------------------------------------ 3 */
 {id:'radioactivite',title:'Radioactivité',minutes:15,
  summary:'Désintégrations α, β, γ ; transformation des noyaux ; filiations.',
  phases:{
  decouvrir:[
   {type:'text',html:'Un noyau instable se transforme spontanément en émettant un rayonnement. <b>α</b> : un noyau d’hélium 4 est éjecté. <b>β⁻</b> : un neutron devient proton et un électron est émis. <b>β⁺</b> : un proton devient neutron et un positon est émis. <b>γ</b> : un photon emporte l’énergie d’excitation du noyau.'},
   {type:'text',html:'Dans toute désintégration, le nombre de nucléons A et la charge Z sont <b>conservés</b>.'}],
  observer:[
   {type:'choice',id:'r-ra',q:'Ouvre « Désintégrations α, β, γ », choisis α puis ²²⁶Ra et touche « Désintégrer ». Quel noyau fils obtiens-tu ?',action:{tool:'visual',id:'desintegrations'},options:['²²²Rn (radon)','²²²Ra (radium)','²³⁰Th (thorium)','²²⁶Ac (actinium)'],correct:0,explain:'α : A − 4 et Z − 2. Le radium 226 (Z = 88) donne le radon 222 (Z = 86).'}],
  manipuler:[
   {type:'choice',id:'r-co',q:'Même visuel, β⁻ et ⁶⁰Co : quel est le noyau fils ?',options:['⁶⁰Fe','⁶⁰Ni','⁵⁶Mn'],correct:1,explain:'β⁻ : Z + 1, A inchangé. Cobalt (Z = 27) → nickel (Z = 28).'},
   {type:'choice',id:'r-g',q:'Choisis maintenant γ. Que change l’émission γ pour le noyau ?',options:['A diminue de 4','Z augmente de 1','Ni A ni Z : seul son état d’énergie change'],correct:2,explain:'Le photon γ n’a ni masse au repos ni charge : le noyau reste le même, il passe simplement à un état moins excité.'},
   {type:'read',id:'r-chain',q:'Ouvre la fiche de l’uranium 238 et touche « Tracer la désintégration ». Combien de désintégrations faut-il pour atteindre le plomb 206 stable ?',action:{tool:'element',z:92,iso:'238',chain:true},answer:{value:14,tol:0},hint:'Compte les flèches entre U-238 et Pb-206 en gardant les branches proposées par défaut.',explain:'14 désintégrations (8 α et 6 β⁻) séparent ²³⁸U de ²⁰⁶Pb.'},
   {type:'tool',label:'Voir aussi : Chaîne de filiation (visuel)',action:{tool:'visual',id:'filiation'}}],
  comprendre:[
   {type:'keys',items:['α : A − 4, Z − 2.','β⁻ : A inchangé, Z + 1.','β⁺ : A inchangé, Z − 1.','γ : A et Z inchangés.','Une filiation enchaîne des désintégrations jusqu’à un noyau stable.']}],
  verifier:[
   {type:'choice',id:'r-q1',q:'Le polonium 210 (Z = 84) subit une désintégration α. Il donne :',options:['²⁰⁶Pb (Z = 82)','²¹⁰Bi (Z = 83)','²⁰⁶Hg (Z = 80)'],correct:0,explain:'A − 4 = 206 et Z − 2 = 82 : plomb 206.'},
   {type:'choice',id:'r-q2',q:'Quel rayonnement est arrêté par une simple feuille de papier ?',options:['α','β⁻','γ'],correct:0,explain:'Les α sont arrêtés par une feuille de papier ou la couche superficielle de la peau. Ils restent dangereux en cas de contamination interne.'}]}},
 /* ------------------------------------------------------------------ 4 */
 {id:'decroissance',title:'Activité et décroissance',minutes:20,
  summary:'Activité en becquerels, période radioactive, loi de décroissance.',
  phases:{
  decouvrir:[
   {type:'text',html:'L’<b>activité</b> A d’une source est le nombre de désintégrations par seconde. Elle s’exprime en <b>becquerels</b> : 1 Bq = 1 désintégration par seconde.'},
   {type:'text',html:'La <b>période radioactive</b> T½ est la durée au bout de laquelle la moitié des noyaux s’est désintégrée. L’activité est alors divisée par 2.'}],
  observer:[
   {type:'choice',id:'d-sim',q:'Ouvre « Décroissance radioactive » et lance la simulation. Après 2 périodes, il reste environ :',action:{tool:'visual',id:'decroissance'},options:['50 % des noyaux','25 % des noyaux','0 % des noyaux'],correct:1,explain:'La moitié de la moitié : 1/2 × 1/2 = 1/4, soit 25 %.'}],
  manipuler:[
   {type:'read',id:'d-i131',q:'Ouvre la fiche de l’iode 131 et relève sa période, en jours.',action:{tool:'element',z:53,iso:'131'},answer:{value:8.0252,tol:0.01,unit:'jours'},hint:'Ligne « Période radioactive ».',explain:'T½ = 8,0252 jours.'},
   {type:'read',id:'d-calc',q:'Le calculateur s’ouvre avec 800 kBq d’iode 131 et une durée de 16,05 jours, soit 2 périodes. Quelle activité reste-t-il ?',action:{tool:'decay',z:53,iso:'131',initial:'800',initialUnit:'kBq',duration:'16.05',durationUnit:'d'},answer:{value:200,tol:0.01,rel:true,unit:'kBq'},hint:'Lis le résultat sous « Calculer ». Après 2 périodes, l’activité est divisée par… ?',explain:'800 / 2² = 200 kBq.'},
   {type:'read',id:'d-time',q:'Dans le calculateur, choisis « La durée pour atteindre une activité » et vise 100 kBq. Combien de jours faut-il ?',answer:{value:24.08,tol:0.01,rel:true,unit:'jours'},hint:'800 → 400 → 200 → 100 : combien de périodes ?',explain:'3 périodes : 3 × 8,0252 ≈ 24,08 jours.'}],
  comprendre:[
   {type:'keys',items:['Activité A en Bq : désintégrations par seconde.','Après n périodes : A = A₀ / 2ⁿ.','2 périodes : activité divisée par 4. 10 périodes : divisée par environ 1 000.','On ne peut pas prédire quand un noyau donné se désintégrera : la loi est statistique.']},
   {type:'tool',label:'Voir les formules : Activité et décroissance',action:{tool:'formulas',topic:1}}],
  verifier:[
   {type:'choice',id:'d-q1',q:'Une source de cobalt 60 a une activité de 400 MBq. Que vaut-elle environ 10,5 ans plus tard (2 périodes) ?',options:['200 MBq','100 MBq','0 MBq'],correct:1,explain:'400 / 4 = 100 MBq.'},
   {type:'choice',id:'d-q2',q:'Le césium 137 a une période d’environ 30 ans. Au bout de 60 ans, il reste :',options:['la moitié de l’activité','le quart de l’activité','plus rien'],correct:1,explain:'60 ans = 2 périodes : activité divisée par 4.'},
   {type:'tool',label:'S’entraîner : Activité et décroissance, niveau 1',action:{tool:'exercise',theme:1,level:1}}]}},
 /* ------------------------------------------------------------------ 5 */
 {id:'liaison',title:'Défaut de masse et énergie de liaison',minutes:20,
  summary:'Les trois masses, défaut de masse, E = Δm c², énergie par nucléon.',
  phases:{
  decouvrir:[
   {type:'text',html:'Un noyau est plus <b>léger</b> que la somme de ses protons et neutrons pris séparément. Cette différence est le <b>défaut de masse</b> Δm. Elle correspond à l’<b>énergie de liaison</b> qui tient le noyau : E = Δm c².'},
   {type:'text',html:'Trois masses à ne pas confondre : la <b>masse atomique moyenne</b> de l’élément (mélange de ses isotopes naturels), la <b>masse atomique de l’isotope</b> (atome entier, électrons compris) et la <b>masse du noyau</b> (sans les électrons). Pour Δm, on utilise la masse du noyau.'}],
  observer:[
   {type:'read',id:'l-he-m',q:'Ouvre la fiche de l’hélium 4 et relève la masse du noyau, en u, avec 6 décimales.',action:{tool:'element',z:2,iso:'4'},answer:{value:4.001506,tol:0.000002,unit:'u'},hint:'Ligne « Masse du noyau » (pas la masse atomique de l’isotope).',explain:'m(noyau) = 4,001 506 u, un peu moins que la masse atomique 4,002 603 u, qui compte 2 électrons.'},
   {type:'choice',id:'l-moy',q:'La masse atomique moyenne de l’hélium (4,0026 u) convient-elle pour calculer Δm de l’hélium 4 ?',options:['Oui, c’est la même chose','Non : elle mélange des isotopes et inclut les électrons'],correct:1,explain:'Il faut la masse du noyau de l’isotope étudié.'}],
  manipuler:[
   {type:'text',html:'Données : m<sub>p</sub> = 1,007 276 u ; m<sub>n</sub> = 1,008 665 u ; 1 u ↔ 931,494 MeV.'},
   {type:'read',id:'l-dm',q:'Calcule Δm = 2 m<sub>p</sub> + 2 m<sub>n</sub> − m<sub>noyau</sub> pour l’hélium 4, en u.',answer:{value:0.030376,tol:0.005,rel:true,unit:'u'},hint:'2 × 1,007 276 + 2 × 1,008 665 = 4,031 882 u.',explain:'Δm = 4,031 882 − 4,001 506 ≈ 0,030 376 u.'},
   {type:'read',id:'l-e',q:'Énergie de liaison : E = Δm × 931,494. Résultat en MeV ?',answer:{value:28.30,tol:0.01,rel:true,unit:'MeV'},hint:'0,030 376 × 931,494.',explain:'E ≈ 28,30 MeV.'},
   {type:'read',id:'l-ea',q:'Énergie de liaison par nucléon E / A, en MeV par nucléon ?',answer:{value:7.074,tol:0.01,rel:true,unit:'MeV/nucléon'},hint:'A = 4.',explain:'28,30 / 4 ≈ 7,07 MeV par nucléon.'},
   {type:'choice',id:'l-calc',q:'Compare avec le calculateur d’énergie de liaison et sa courbe d’Aston. Quel isotope a la plus grande énergie de liaison par nucléon parmi He-4, Fe-56 et U-238 ?',action:{tool:'energy',z:26,a:56},options:['He-4','Fe-56','U-238'],correct:1,explain:'Fe-56 : environ 8,79 MeV par nucléon, près du sommet de la courbe d’Aston. U-238 : environ 7,57. He-4 : environ 7,07.'}],
  comprendre:[
   {type:'keys',items:['Δm = Z m<sub>p</sub> + N m<sub>n</sub> − m<sub>noyau</sub> : utiliser la masse du noyau.','E = Δm × 931,494 MeV, avec Δm en u.','E / A mesure la solidité du noyau.','Le sommet de la courbe d’Aston est vers le fer et le nickel : la fusion des noyaux légers et la fission des noyaux lourds peuvent libérer de l’énergie.']},
   {type:'tool',label:'Voir les formules : Masse et énergie',action:{tool:'formulas',topic:2}}],
  verifier:[
   {type:'choice',id:'l-q1',q:'Pourquoi la fission d’un noyau d’uranium libère-t-elle de l’énergie ?',options:['Les fragments sont plus liés par nucléon que l’uranium','L’uranium perd ses électrons','Les neutrons créent de la masse'],correct:0,explain:'Les fragments (A ≈ 90 à 140) sont plus haut sur la courbe d’Aston : l’écart d’énergie de liaison est libéré.'},
   {type:'choice',id:'l-q2',q:'Pour calculer le défaut de masse d’un isotope, quelle masse relève-t-on dans sa fiche ?',options:['La masse atomique moyenne de l’élément','La masse du noyau de cet isotope','Le nombre de masse A'],correct:1,explain:'A est un entier, et la masse moyenne mélange les isotopes : seule la masse du noyau convient.'},
   {type:'tool',label:'S’entraîner : Masse et énergie, niveau 1',action:{tool:'exercise',theme:2,level:1}}]}},
 /* ------------------------------------------------------------------ 6 */
 {id:'radioprotection',title:'Introduction à la radioprotection',minutes:20,
  summary:'Dose et débit de dose ; temps, distance, écrans ; ALARA et DATE.',
  phases:{
  decouvrir:[
   {type:'text',html:'L’activité dit combien de désintégrations se produisent. Pour l’intervenant, on évalue la <b>dose</b> reçue, en <b>sieverts</b> (Sv), et le <b>débit de dose</b>, en Sv/h. Pour un débit constant : <b>dose = débit × durée</b>.'},
   {type:'text',html:'La démarche <b>ALARA</b> consiste à réduire les doses aussi bas que raisonnablement possible. Ses leviers se résument par <b>DATE</b> : Distance, Activité, Temps, Écran.'},
   {type:'tool',label:'Voir les formules : Dose et débit de dose (Gy, Sv)',action:{tool:'formulas',topic:3}}],
  observer:[
   {type:'choice',id:'p-dist',q:'Ouvre « Débit de dose et distance », source ponctuelle, débit de 100 µSv/h à 1 m. Place l’intervenant à 2 m. Que lis-tu ?',action:{tool:'visual',id:'distance'},options:['50 µSv/h','25 µSv/h','12,5 µSv/h'],correct:1,explain:'Source ponctuelle : loi en 1/d². Distance × 2 → débit ÷ 4.'},
   {type:'choice',id:'p-ligne',q:'Passe en source linéaire (tuyauterie). Tout près de la tuyauterie, doubler la distance divise le débit par :',options:['environ 2','environ 4','environ 8'],correct:0,explain:'Près d’une source linéaire, le débit varie en 1/d : distance × 2 → débit ÷ 2 seulement.'}],
  manipuler:[
   {type:'read',id:'p-cda',q:'Ouvre « Atténuation des gamma ». Combien de CDA (couches de demi-atténuation) faut-il pour diviser le débit par 8 ?',action:{tool:'visual',id:'attenuation'},answer:{value:3,tol:0},hint:'Chaque CDA divise par 2. Utilise le bouton « +1 CDA ».',explain:'2 × 2 × 2 = 8 : 3 CDA.'},
   {type:'read',id:'p-dose',q:'Un intervenant travaille 30 min dans un débit de 100 µSv/h. Quelle dose reçoit-il, en µSv ?',answer:{value:50,tol:0.5,unit:'µSv'},hint:'Dose = débit × durée, avec la durée en heures.',explain:'100 µSv/h × 0,5 h = 50 µSv.'},
   {type:'choice',id:'p-date',q:'Ouvre l’outil DATE, mode « Mission », situation « Intervention sur une vanne », puis « Organiser cette mission dans Explorer ». L’écran est-il toujours favorable ?',action:{tool:'date',mode:'mission'},options:['Oui, un écran réduit toujours la dose totale','Non : sa pose et son retrait exposent aussi, il faut comparer les doses totales'],correct:1,explain:'Pour une opération courte, la dose reçue pendant la pose et le retrait peut dépasser le gain. On compare la dose collective totale avant de décider.'}],
  comprendre:[
   {type:'keys',items:['Dose (Sv) = débit (Sv/h) × durée (h).','Source ponctuelle : débit en 1/d². Source linéaire proche : en 1/d.','Chaque CDA divise le débit par 2.','DATE : Distance, Activité, Temps, Écran ; ALARA : comparer les options sur la dose totale.']}],
  verifier:[
   {type:'read',id:'p-q1',q:'Le débit est de 2 mSv/h. Combien de minutes faut-il pour recevoir 0,5 mSv ?',answer:{value:15,tol:0.2,unit:'min'},hint:'Durée = dose / débit, puis conversion en minutes.',explain:'0,5 / 2 = 0,25 h = 15 min.'},
   {type:'choice',id:'p-q2',q:'Source ponctuelle : 36 µSv/h à 1 m. Quel débit à 3 m ?',options:['12 µSv/h','4 µSv/h','9 µSv/h'],correct:1,explain:'36 / 3² = 4 µSv/h.'},
   {type:'tool',label:'S’entraîner : Distance et écrans, niveau 1',action:{tool:'exercise',theme:4,level:1}}]}}
 ]},
/* Parcours prévus : ils apparaissent comme « À venir » tant que available vaut false. */
{id:'radioactivite',title:'Radioactivité et décroissance',available:false},
{id:'radioprotection',title:'Radioprotection',available:false},
{id:'interventions',title:'Interventions nucléaires',available:false},
{id:'premiere',title:'Parcours Première TIIN',available:false},
{id:'terminale',title:'Parcours Terminale TIIN',available:false}
];
const PHASES=[['decouvrir','Découvrir'],['observer','Observer'],['manipuler','Manipuler'],['comprendre','Comprendre'],['verifier','Vérifier']];
const api={parcours,PHASES,get:id=>parcours.find(p=>p.id===id),phasesOf:p=>p.phases||PHASES};
root.NucleaParcoursData=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
