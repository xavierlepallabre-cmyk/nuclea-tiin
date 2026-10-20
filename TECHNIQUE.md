# Architecture technique — v0.9

Le point d’entrée reste index.html. Les scripts defer sont chargés dans leur ordre explicite. Le projet est statique ; seuls les tests utilisent Playwright et les outils de développement Node/Python.

## Modules

| Fichier | Rôle |
|---|---|
| app.js | Éléments, fiches, filtres, état sélectionné, navigation et transferts contextuels. Fermeture/historique des fiches conservés. |
| isotopes.js / elements.json | Population et données d’origine, inchangées. |
| decay-chain.js | Moteur de parcours isotopique v0.7, inchangé. |
| decay-calculator.js | Moteur direct/inverse v0.8 conservé ; unités, curseur et sélection isotopique enrichis dans la couche interface. |
| navigation.js | Suggestions isotopiques et gestes de carte ; capture des pointeurs limitée au tableau. |
| formulas.js | Transformation du rendu des six rubriques en accordéons, exemples et liens contextuels. |
| units.js | Validation numérique, conversions et boutons ×10ⁿ des nouveaux modules. |
| nuclear-properties.js | Propriétés complémentaires des 3 383 fondamentaux existants ; aucune nouvelle population. |
| energy.js | Calculs de liaison et nuage d’Aston, sélection d’un seul isotope. |
| date-model.js | Calculs purs : simulation DATE, phases, doses, validation, comparaison et restauration. |
| date-ui.js | Trois modes DATE et sauvegarde des préparations. |
| exercises.js | Génération de 18 types d’exercices, aides et contrôle d’unités/réponses. |
| updates.js / sw.js | Proposition d’actualisation et cache versionné. |

Les données d’éléments chargées déclenchent l’événement `elementsready` pour remplir le catalogue des radionucléides. Les transferts de fiche attendent la fermeture déjà gérée avant de changer d’outil. Les états d’interface vivent dans le DOM et les fermetures de modules : aucune reconstruction générale à chaque changement d’onglet.

## Données complémentaires

`python tools/build-properties.py` régénère nuclear-properties.js à partir du CSV local. La liste des états de isotopes.js n’est pas modifiée. Les champs sont conservés comme chaînes de référence, puis convertis explicitement lors du calcul. Les sources originales et leurs empreintes d’audit sont inchangées. Les arrondis des résultats n’interviennent qu’à l’affichage ; calculs en nombres JavaScript double précision, sans propagation générale d’incertitude.

## Préparations

Clé localStorage : `nuclea-preparations-v09`. Tableau de préparations contenant id, name, workers, work, retreat, phases. Débits internes en mSv/h et durées de phase en minutes. Une phase contient name, minutes, work/retreat (null = héritage), et positions, index 0 réservé au chargé de travaux. Valeurs autorisées : work, retreat, absent ; le chargé ne peut pas être absent. Au moins un intervenant participe. Une position unique par personne rend impossible l’affectation simultanée à deux points.

Bornes : 40 préparations, 80 phases par préparation, 1 à 12 intervenants plus un chargé de travaux. Les limites préservent l’usage local. La validation d’une restauration reconstruit les seuls champs autorisés, vérifie types, bornes, affectations et calculs. Les chaînes saisies sont insérées comme texte ou échappées avant insertion HTML. Aucune évaluation de code utilisateur.

La pose/retrait d’un écran est calculée dans le mode Explorer au débit non atténué. Dans une préparation, l’utilisateur représente les opérations par des phases et actualise les débits à partir du moment approprié ; le logiciel ne devine pas une réduction de dose.

## PWA

Cache applicatif : `nuclea-tiin-v09`. Les scripts, données, icônes, logos et police locale nécessaires sont préchargés. Les références web ne sont consultées que si l’utilisateur ouvre leurs liens. Une mise à jour depuis une version moderne reste en attente ; elle s’active après acceptation. Les caches d’application obsolètes sont supprimés à l’activation, jamais localStorage. La première migration depuis les caches v0.3–v0.8 est activée automatiquement pour éviter que l’ancien code dépourvu de bannière bloque l’adoption ; recharger ensuite la page. Pour une prochaine livraison, changer le nom de cache et le numéro d’interface.

Une actualisation conserve les préparations enregistrées, mais réinitialise les saisies en mémoire et l’exercice courant ; le message d’actualisation le signale. La police locale dispose d’un repli système. HTTPS est requis hors localhost.
