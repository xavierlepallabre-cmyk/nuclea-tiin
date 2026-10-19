# Nucléa TIIN v0.4 — provenance des isotopes

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
