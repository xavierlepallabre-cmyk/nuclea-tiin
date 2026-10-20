# Validation Nucléa TIIN v0.9 — 20 octobre 2026

## Environnement et résultat

Tests exécutés sous Windows avec Node.js et Microsoft Edge / moteur Chromium via Playwright 1.62.1. Tests tactiles simulés via CDP. Aucun test sur appareil Android physique n’a été réalisé ; cette validation reste à effectuer avant publication générale.

- Sept suites scientifiques/données : réussies, résultat structuré dans test-results/science.json.
- Suite d’interface aux largeurs 390, 820 et 1440 px : réussie.
- Suite gestes et mise à jour PWA : réussie.
- Suite restauration, injection et stockage refusé : réussie.
- Contrôle syntaxique des scripts et intégrité de l’archive : réalisés.
- Captures des thèmes clair/sombre et écrans nouveaux : dans test-results/, avec revue visuelle.

## Sciences et données

- 118 éléments, dix familles, 3 385 états et empreintes des données/logos d’origine.
- 800 kBq, T½ = 8 jours, t = 24 jours → 100 kBq ; inverse → 24 jours.
- Unités mixtes, virgule, notation scientifique, limites, sous-flux et saisies invalides.
- Filiation sur tous les états et cas de référence : H-3, C-14, Co-60, Sr-90, Tc-99m, Cs-137, U-238, U-235 et Th-232 ; arrêts sur données absentes, fission et boucles.
- Liaison de C-12 et He-4, maximum du jeu à Ni-62, présence d’isobares distincts dans Aston, absence de création d’états.
- DATE : doses individuelles/collectives, relèves à collective inchangée, changements de débits hérités, pose/retrait d’écran et comparaison de variantes, validation des affectations et restaurations.
- Dix-huit types d’exercices, 216 générations de test avec répétitions ; contrôle dans les unités équivalentes et message distinct pour unité incompatible.

## Interface et contexte

Les dix filtres sont activés/désactivés sur chaque format avec vérification du nombre d’éléments. Recherche U235 et sélection directe, fiches, filiation, Retour/Avancer, Échap, navigation et six rubriques sont vérifiés. Le sélecteur de radionucléides, les conversions 800 kBq → 0,8 MBq, le curseur et la conservation d’une durée supérieure à dix périodes sont testés.

Aston : choix d’un isotope et unité d’énergie, sélection du nuage et liste de candidats. DATE : cinq missions, chargement de paramètres, phases ajoutées/dupliquées/réordonnées/supprimées, variantes, reprise après rechargement et contenus textuels non interprétés comme HTML. Exercices : six thèmes et trois niveaux, quatre aides et réponse conservée lors de la consultation du formulaire.

Les gestes testés sont déplacement, pincement, double appui, clic de sélection et molette. Le défilement horizontal est limité aux tableaux de résultats lorsqu’il est nécessaire ; aucun débordement de page n’est constaté aux formats testés. Les champs numériques utilisent le clavier décimal demandé au navigateur ; l’affichage du clavier Android réel n’a pas été observé.

Les suites vérifient l’absence d’erreur JavaScript et de requête externe nécessaire à l’usage. La police Lexend est locale. Les modes clairs/sombres sont contrôlés par captures.

## PWA et stockage

Une actualisation de service worker est simulée avec un nouveau nom de cache. La mise à jour attend l’acceptation, active la nouvelle version et conserve une préparation nommée. Après désactivation du réseau : fiches, filiation, Aston, calcul DATE, reprise de préparation et aides d’exercices restent accessibles.

Une sauvegarde invalide n’est pas écrasée automatiquement. Les chaînes de type HTML restent du texte. L’effacement des préparations et de toutes les données locales est testé ; le refus d’écriture par le navigateur est signalé sans bloquer l’application.

## Limites connues

1. Android physique, performances sur téléphone d’entrée de gamme et gestes système d’une PWA installée : validation complémentaire requise. Les simulations ne constituent pas cette validation.
2. Données nucléaires d’origine conservées, notamment extraction principale du 18 octobre 2023 ; pas de contre-évaluation indépendante de chaque valeur.
3. Parcours isotopique historique simplifié : tous les niveaux excités et isomères ne sont pas résolus.
4. Défaut de masse calculé depuis des atomes neutres : approximation sans correction détaillée des liaisons électroniques. La référence tabulée est distinguée ; les incertitudes ne sont pas propagées intégralement.
5. DATE : modèles idéalisés à débits constants par phase, transmission imposée, pas de diffusion/contamination/transport détaillé. Aucun résultat ne constitue une autorisation d’intervention ni une limite réglementaire.
6. Préparations : sauvegarde de l’état valide après validation de champ/action. Une saisie invalide reste un brouillon non sauvegardé. Bornes documentées : 40 préparations, 80 phases, 12 intervenants plus le chargé.
7. Les préparations survivent à une actualisation à adresse/profil identiques ; les calculateurs et exercices en mémoire ne sont pas restaurés après rechargement complet.
8. Bibliothèque d’exercices limitée à 18 types de base avec données variables ; elle peut être enrichie sans changer l’architecture. Aucun suivi de performance.
9. Aucune publication en ligne effectuée. Prévisualisation et accord nécessaires avant remplacement de la version publiée.

## Reproduire

Voir README.md : npm test ; npm install ; npx playwright install chromium ; npm run test:ui. Les tests utilisent des serveurs temporaires sur localhost. Leur dépendance Playwright n’est pas nécessaire à la PWA publiée.
