# Nucléa TIIN v0.9

Application statique pédagogique de physique nucléaire pour le Bac Pro TIIN. Évolution de l’archive v0.8 fournie ; aucun framework, serveur applicatif, compte, suivi de résultats ou traceur ajouté. Le design clair/sombre et les logos sont conservés. La police Lexend et sa licence OFL sont incluses localement.

## Utilisation

Servir ce dossier en HTTPS (GitHub Pages) ou via un serveur local pour les tests. Aucun assemblage ni compilation n’est nécessaire. Ne pas ouvrir directement index.html en file:// : le chargement JSON et le service worker exigent un serveur.

- **Éléments** : recherche d’élément/isotope, dix filtres de familles, fiches, filiation et transferts vers les calculateurs.
- **Formulaire** : calculateur de décroissance conservé et enrichi ; six rubriques en accordéons et 31 relations avec unités, hypothèses et exemples.
- **Explorer** : énergie de liaison, nuage d’Aston et trois modes DATE.
- **Exercices** : six thèmes, trois niveaux, valeurs variables, quatre aides et aucune note ni historique de réussite.
- **ⓘ** : références, crédits, mise à jour et effacement des données locales.

Le tableau se déplace dans sa zone dédiée. Un doigt ou la souris : déplacer ; deux doigts : zoomer ; double appui : zoomer ; molette : zoomer autour du pointeur ; boutons et touches +/− : ajuster ; Recentrer : rétablir la vue. Le défilement de la page reste natif hors de cette zone. La miniature tactile et les boutons restent disponibles sur téléphone. La recherche accepte uranium, U, 92, U235, U-235 et 235U. Sélectionner la suggestion ; si nécessaire, le filtre de famille est désactivé explicitement.

## État et sauvegarde

Les changements d’onglet conservent l’exercice, les valeurs et les outils en mémoire. Les préparations DATE valides sont enregistrées après modification validée du champ (sortie du champ/changement de sélection) ou une action de phase. Une saisie invalide n’écrase pas la dernière sauvegarde valide ; le message l’indique. Un brouillon initial n’est pas enregistré sans modification. Une sauvegarde invalide n’est pas remplacée automatiquement.

Le stockage du navigateur n’est pas chiffré ; il est propre à l’adresse du site et au profil de navigateur. Ne pas saisir de noms réels ni d’informations sensibles. Le changement de site, de profil ou la suppression du stockage du navigateur rend ces préparations indisponibles. Les réponses d’exercices et les calculateurs ne sont pas restaurés après rechargement complet ; ils sont conservés pendant la navigation entre outils.

## Tests reproductibles

Node.js et Python ne sont pas requis pour utiliser la PWA. Node.js est requis uniquement pour les tests :

```sh
npm test
npm install
npx playwright install chromium
npm run test:ui
```

`npm test` utilise uniquement les modules natifs de Node et exécute les tests scientifiques/données. `npm run test:ui` utilise Playwright (dépendance de développement épinglée) et lance successivement la non-régression responsive, les gestes/mises à jour, puis la sécurité. Les serveurs de test sont locaux et temporaires. Par défaut, Chromium installé par Playwright est utilisé. `PLAYWRIGHT_CHANNEL=msedge` permet d’utiliser Edge installé. `PLAYWRIGHT_MODULE_PATH` sert uniquement lorsqu’une installation locale fournie par l’environnement doit être utilisée ; elle peut être omise après npm install.

Les résultats scientifiques structurés sont écrits dans `test-results/science.json`. Les captures sont produites dans `test-results/`. Voir `VALIDATION.md` et `TESTS.txt` pour le périmètre réellement exécuté, sous Edge/Chromium aux largeurs 390, 820 et 1440 px. Les gestes tactiles sont simulés par CDP ; Android physique reste à valider.

## Documentation

- `AUDIT.md` : archive de départ et protection de la v0.8.
- `TECHNIQUE.md` : modules et stockage.
- `SOURCES.md` : données, unités et limites scientifiques.
- `VALIDATION.md` : tests exécutés et limites connues.
- `PUBLICATION.md` : mise à jour GitHub Pages et proposition de validation avant publication.

Le module DATE est un outil d’apprentissage, pas une étude dosimétrique réglementaire ou opérationnelle.

## Auteur et droits

Conception originale : Xavier Le Pallabre  
Ressource pédagogique développée à titre personnel, avec l’assistance d’outils d’intelligence artificielle.  
© 2026 Xavier Le Pallabre — Attribution de l’auteur original à conserver lors des réutilisations et adaptations, conformément à la licence applicable : [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr).

## Licence

Sauf mention contraire, le contenu de ce dépôt (code, textes, schémas, illustrations) est mis à disposition selon les termes de la licence **Creative Commons Attribution – Pas d'utilisation commerciale – Partage dans les mêmes conditions 4.0 International** ([CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr)). Texte complet : fichier `LICENSE`.

Tu peux le réutiliser, le copier et l'adapter, à trois conditions :
- **Attribution** : citer l'auteur original (Xavier Le Pallabre), indiquer la licence et signaler les modifications ;
- **Pas d'utilisation commerciale** : pas de vente ni d'usage dans un service payant ;
- **Partage dans les mêmes conditions** : diffuser les adaptations sous la même licence.

Le logo du Bac Pro TIIN est une création de Xavier Le Pallabre : il est couvert par cette licence, comme le reste de ses contenus.

Ne sont pas couverts par cette licence :
- la police Lexend (`assets/fonts/`), sous licence SIL Open Font License 1.1 (voir `assets/fonts/OFL.txt`) ;
- le logo du lycée Alexis de Tocqueville, propriété de l'établissement ;
- les données nucléaires issues de l'AIEA (LiveChart) et des autres sources listées dans `SOURCES.md`, qui restent soumises aux conditions de leurs producteurs.
