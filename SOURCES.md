# Nucléa TIIN v0.9 — sources et méthodes scientifiques


Téléchargement effectué le 19 octobre 2026. 3 383 états fondamentaux de Z = 1 à 118, plus deux états métastables : Tc-99m et Ba-137m. Le neutron libre et les deux systèmes de neutrons (Z = 0) ne figurent pas dans le tableau des éléments.

## Sources primaires

- AIEA, Nuclear Data Section, LiveChart : https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all
- Niveaux du Tc-99 : https://nds.iaea.org/relnsd/v1/data?fields=levels&nuclides=99tc — niveau 142,6836 keV pour Tc-99m.
- Niveaux du Ba-137 : https://nds.iaea.org/relnsd/v1/data?fields=levels&nuclides=137ba — niveau 661,659 keV pour Ba-137m.
- Documentation de l’API et références des évaluations : https://nds.iaea.org/relnsd/vcharthtml/api_v0_guide.html
- Autre outil institutionnel de consultation : NNDC / Brookhaven, NuDat 3 : https://www.nndc.bnl.gov/nudat3/ et https://www.nndc.bnl.gov/nudat3/guide/ . Les valeurs intégrées proviennent de l’AIEA ; NuDat n’a pas été utilisé comme deuxième validation indépendante de chaque ligne.

## Dates et limites

Le fichier global reçu indique Extraction_date = 2023-10-18 sur ses lignes. Les deux fichiers de niveaux indiquent 2026-10-19. La date de téléchargement ne constitue donc pas une date de réévaluation des données. Les limites bibliographiques et auteurs ENSDF sont conservés pour chaque fiche. La documentation LiveChart décrit notamment un instantané ENSDF d’avril 2022 ; les dates bibliographiques par noyau sont affichées sans les présenter comme une actualisation 2026.

Les deux états métastables sont sélectionnés par leur énergie dans les fichiers de niveaux, pas par la première ligne excitée. Les autres isomères ne sont pas inclus.

## Transformation

- A = Z + N ; regroupement par Z, tri par A puis état.
- Valeurs, unités, opérateurs, incertitudes, abondances et trois modes de désintégration recopiés sans arrondi numérique ; seules les légendes sont traduites.
- Incertitudes conservées en notation ENSDF : elles portent sur les derniers chiffres, avec notation asymétrique éventuelle. Les colonnes homonymes unc_hl du fichier levels sont distinguées : la première est l’incertitude ENSDF, la seconde est l’incertitude en secondes et n’est pas affichée comme ENSDF.
- Si la source donne une largeur de niveau en eV/keV/MeV, affichage de la période en secondes calculée par l’AIEA, avec la largeur d’origine ; aucune énergie n’est affichée comme une unité de temps.
- STABLE est le seul marqueur converti en stabilité. Valeurs absentes affichées comme non renseignées, jamais comme zéro ou stable.
- Les produits fils sont déduits des bilans A/Z des modes simples. Ils ne sont pas des chaînes de filiation évaluées ; les niveaux excités, rayonnements et probabilités de cascade ne sont pas déduits. La fission reste décrite par plusieurs fragments.
- Les six rubriques du formulaire et elements.json sont conservés depuis la v0.3.1.

Les fichiers CSV originaux et leurs empreintes SHA-256 sont inclus dans sources/. Ils servent à vérifier la traçabilité ; isotopes.js contient les données utilisées hors connexion par l’application. Le code de l’application ne requiert aucune connexion à l’API AIEA lors de la consultation.

## Définitions des familles — v0.5

Définitions pédagogiques rédigées pour cette application. Repères : OpenStax, Chemistry 2e, section 2.5, https://openstax.org/books/chemistry-2e/pages/2-5-the-periodic-table et Royal Society of Chemistry, https://periodic-table.rsc.org/ . Le regroupement suit le champ family de elements.json hérité de la v0.2. Les catégories métalloïdes et métaux pauvres ainsi que les éléments superlourds sont signalés avec leurs limites de classification et de connaissance.


## Parcours de désintégration — v0.7

Le parcours est calculé localement depuis l’isotope choisi ; les données isotopiques de la v0.6 sont conservées. Chaque étape porte un lien AIEA et la date de son extraction. Seul le marqueur stable explicite de la source permet de conclure à un noyau stable.

Les flèches appliquent les bilans des modes de désintégration aux nombres A et Z, puis recherchent le noyau fils dans le jeu embarqué. Il s’agit d’un parcours isotopique simplifié : faute de schémas de niveaux complets, le noyau fils est représenté à l’état fondamental ; les cascades rapides et la plupart des isomères intermédiaires ne sont pas détaillés. Par exemple, le parcours U-238 représente Pa-234 au niveau isotopique et ne résout pas Pa-234m. Les périodes affichées sont celles de l’état effectivement représenté, pas une durée totale de filiation.

Les états Tc-99m et Ba-137m déjà embarqués peuvent servir de point de départ ; leur transition isomérique est suivie vers leur fondamental. Les autres transitions isomériques sans niveau inférieur identifié interrompent le tracé.

Pour Cs-137, trois branches β− vers les niveaux du Ba-137 sont décrites explicitement selon NNDC / ENSDF :
https://www.nndc.bnl.gov/nudat3/getdecaydataset.jsp?dsid=137cs+bM+decay&nucleus=137BA
Consulté le 19 octobre 2026 ; évaluation E. Browne et J. K. Tuli, NDS 108, 2173 (2007), limite bibliographique 1 octobre 2006.
- 94.7 %, incertitude ENSDF 2 : niveau métastable 661.659 keV.
- 5.3 %, incertitude ENSDF 2 : niveau fondamental.
- 0.00058 %, incertitude ENSDF 8 : niveau 283.50 keV, puis retour rapide au fondamental, transition γ non dessinée.
Les valeurs sont reprises arrondies telles que publiées et ne somment donc pas nécessairement exactement à 100. Elles sont des probabilités locales, sans calcul de probabilité cumulée. La transition isomérique du Ba-137m inclut émission γ et conversion interne, sans imposer un photon γ pour chaque transition.

La branche numérique la plus probable est choisie par défaut si tous les pourcentages du nœud sont des nombres non qualifiés. Si des pourcentages sont inconnus ou qualifiés, l’ordre de la source est conservé. Le choix peut être changé à chaque embranchement ; les choix en aval sont alors recalculés.

Une fission n’a pas de fils unique et interrompt le parcours. Donnée absente, mode non pris en charge, boucle ou limite de 64 noyaux : arrêt explicite sans affirmer une stabilité. Aucune durée totale ni date de désintégration d’un noyau individuel n’est déduite des périodes.


## Calculateur de décroissance — v0.8

Référence des relations : OpenStax, University Physics Volume 3, section 10.3 Radioactive Decay : https://openstax.org/books/university-physics-volume-3/pages/10-3-radioactive-decay . Relations : A(t) = A0 exp(−λt), λ = ln(2)/T½ ; inversion t = T½[ln(A0) − ln(A)]/ln(2).

Modèle : activité propre d’un seul radionucléide, sans production par un parent ni apport de matière. L’activité des descendants n’est pas calculée. Les périodes nominales transférées depuis les fiches proviennent des données AIEA déjà embarquées ; le lien et la date d’extraction sont affichés. Les incertitudes sont rappelées mais ne sont pas propagées.

Conversions : seconde, attoseconde, picoseconde, nanoseconde, microseconde, milliseconde, minute = 60 s, heure = 3 600 s, jour = 86 400 s, année conventionnelle = 365,25 jours (31 557 600 s). Cette convention est explicitement affichée. Pour une période source donnée en années, la valeur nominale en années est conservée, sans présenter cette conversion conventionnelle comme la colonne half_life_sec de l’AIEA.

Les périodes absentes ou données seulement comme limites ne sont pas préremplies. Les valeurs approximatives AP sont acceptées et signalées. Les isotopes stables n’activent pas le calcul de décroissance.

Le calcul inverse est effectué par différence de logarithmes pour éviter de déborder lors du quotient A0/A. Une activité positive peut tomber sous la précision numérique lors d’un calcul direct ; elle est alors signalée, sans conclure à une extinction physique. La courbe porte sur dix périodes ; un résultat situé au-delà est annoncé hors de la courbe. Les points de repère sont également disponibles sous forme de tableau accessible.


## v0.9 — unités, liaison, Aston et DATE (20 octobre 2026)

La population des 3 385 états et les CSV d’origine ne changent pas. Les propriétés complémentaires proviennent exclusivement des colonnes atomic_mass, unc_am, binding et unc_ba du CSV ground_states déjà fourni. atomic_mass est en micro-u ; binding est une énergie de liaison PAR NUCLÉON en keV, non une énergie totale. Référence officielle de définition des champs : AIEA NDLab, https://iaea-nds.github.io/ndlab/_static/ndlab-tutorial.html . Vérifications d’échelle : C-12 a une masse de 12 u et He-4 une liaison totale proche de 28,296 MeV.

La référence de liaison est E/A = binding/1000 en MeV par nucléon, E = A × E/A, avec équivalent de masse E/(931,49410372 MeV/u). Une valeur absente reste absente. Les deux isomères n’héritent pas silencieusement des masses de leur fondamental : ce calcul y est désactivé avec explication.

Calcul pédagogique avec masses atomiques neutres : Δm ≈ Z m(¹H) + N m_n − m_atome ; m(¹H) = 1,007825031898 u et m_n = 1,0086649159 u proviennent des lignes H-1 et neutron du même CSV. Les électrons se compensent au premier ordre ; les différences d’énergie de liaison électronique ne sont pas corrigées. Ce résultat approximatif est distingué de la valeur de référence. Le nuage d’Aston utilise uniquement les valeurs tabulées, conserve les isobares distincts et ne fabrique aucun point : 3 356 états fondamentaux ont une liaison disponible. Maximum constaté dans ce jeu : Ni-62. Les incertitudes originales sont affichées ; aucune propagation complète n’est présentée.

Constantes de conversion : 1 u c² = 931,49410372 MeV et 1 u = 1,66053906892 × 10⁻²⁷ kg, CODATA 2022 : https://physics.nist.gov/cuu/pdf/wall_2022.pdf . 1 eV = 1,602176634 × 10⁻¹⁹ J. Les constantes arrondies du formulaire historique restent identifiées dans les exemples pédagogiques ; elles ne remplacent pas les données isotopiques.

DATE Explorer : débit = débit de référence à 1 m × fraction d’activité / distance², puis multiplication par la transmission de l’écran. La composition radioactive et la géométrie sont inchangées ; ce n’est pas un calcul de débit à partir de Bq seuls. Source ponctuelle, géométrie appropriée, pas de diffusion ni d’autres phénomènes non modélisés. Dose = débit constant × durée. Les doses de pose et retrait sont comptées au débit sans écran pour l’équipe de pose. Une transmission imposée ne garantit pas l’efficacité d’un écran réel.

Préparation : doses individuelles par point et phase, puis sommes individuelles et collectives. H.mSv désigne ici personne-mSv, pour distinguer la somme collective du mSv individuel. Les changements de débit d’une phase sont hérités par les phases suivantes, jusqu’à un nouvel ajustement. Les relèves répartissent les doses ; à temps-personne et débits inchangés, elles ne réduisent pas la collective.

Repères de radioprotection : AIEA, Basic Safety Standards, principes d’optimisation/ALARA et distinction des doses individuelles et collectives : https://nucleus.iaea.org/sites/nss-oui/Published%20Collections/m_3761d926-c16f-4477-a63b-741a9db1c16c/m_3761d926-c16f-4477-a63b-741a9db1c16c__50_0.Html . ASNR, principes de radioprotection : https://reglementation-controle.asnr.fr/information/publications/fiches-d-information-du-public/les-principes-de-radioprotection . Ces références fondent les explications ; les nombres de missions sont fictifs et ne constituent pas des prescriptions.

Exercices : les questions d’identification des noyaux utilisent des isotopes réels prédéfinis. Les jeux variables de missions et les données explicitement fictives sont encadrés. Les réponses acceptent une tolérance relative de 1,5 % sur la valeur dans la dimension attendue ; une unité incompatible reçoit un message distinct. Ni notes, ni classement, ni statistiques de réussite ne sont produits.


## v0.15 — masse atomique de l’isotope et masse du noyau (21 octobre 2026)

Chaque fiche isotopique affiche deux masses propres à l’isotope, distinctes de la masse atomique moyenne de l’élément (conservée dans la fiche générale) et du nombre de masse A (entier).

**Masse atomique de l’isotope.** Colonne atomic_mass (micro-u) et son incertitude unc_am du CSV AIEA ground_states déjà embarqué (nuclear-properties.js), issues de l’évaluation AME2020 (W. J. Huang et al., Chinese Phys. C 45, 030002 ; M. Wang et al., Chinese Phys. C 45, 030003, 2021). Aucune nouvelle table : conversion micro-u → u sans arrondi intermédiaire. C-12 vaut 12 u exactement par définition. Les 808 masses marquées me_systematics = Y sont signalées « estimée (systématique AME2020, non mesurée) ». Pour Tc-99m et Ba-137m : masse du fondamental + E*/c², avec E* = 142,6836 keV et 661,659 keV (fichiers de niveaux déjà cités).

**Masse du noyau.** Aucune masse nucléaire évaluée n’étant fournie par la source, elle est calculée à partir de la masse atomique :

m_noyau = m_atome − Z·mₑ + Bₑ(Z)/c²

avec mₑ = 5,485 799 090 441 × 10⁻⁴ u et 1 u c² = 931 494,103 72 keV (CODATA 2022, https://physics.nist.gov/cuu/pdf/wall_2022.pdf). Bₑ(Z) est l’énergie de liaison totale des électrons de l’atome neutre, estimée par la formule empirique utilisée par l’AME : Bₑ(Z) = 14,4381 Z^2,39 + 1,55468 × 10⁻⁶ Z^5,35 eV (D. Lunney, J. M. Pearson, C. Thibault, Rev. Mod. Phys. 75, 1021, 2003). La correction est positive ; elle vaut environ 1 keV pour le carbone et 763 keV pour l’uranium. La formule est ajustée sur Z = 18 à 106 avec un écart quadratique moyen de l’ordre de 0,2 à 0,3 % (comparaison avec des calculs relativistes : https://arxiv.org/abs/2408.04231). Incertitude retenue, volontairement prudente : 1 % de Bₑ pour Z ≥ 18 ; 2 % et au moins 5 eV pour Z < 18. Elle est combinée quadratiquement à l’incertitude AME de la masse atomique. La masse du noyau est toujours présentée comme « calculée ».

**Affichage.** Décimales jusqu’au premier chiffre significatif de l’incertitude, entre 6 et 9 ; groupes de trois décimales ; incertitude en µu. Aucune valeur n’est inventée : 27 états fondamentaux sans masse AME (Mg-18, Br-101, Kr-102, Rb-105, Rb-106, Sr-108, Y-110, Y-111, Zr-114, Nb-117, Lu-149, Hf-151, Th-207, U-214, U-244 à U-251, U-253 à U-255, Cf-236, Lv-294) affichent « Donnée indisponible ». Couverture : 3 356 fondamentaux sur 3 383, plus les deux isomères.

**Vérifications (tests/masses.test.cjs).** Les masses calculées des noyaux de ¹H, ²H, ³H et ⁴He redonnent les masses CODATA 2022 du proton, du deuton, du triton et de la particule α à mieux que leur incertitude affichée (écarts de quelques nano-u). Pour C-12, C-13, C-14, He-4, Fe-56, U-235 et U-238, Δm = Z mₚ + N mₙ − m_noyau donne une énergie de liaison par nucléon égale à la valeur AME2020 corrigée de la liaison des électrons, à 0,1 eV par nucléon près. La valeur AME de référence, calculée avec des masses atomiques, est légèrement plus grande : l’écart vaut (Bₑ − 13,6 Z eV)/A, soit 0,08 keV par nucléon pour C-12 et 3,2 keV par nucléon pour U-238. Le calculateur « Énergie de liaison » de l’onglet Explorer, fondé sur les masses atomiques, n’est pas modifié.
