# Écran de la soirée : version A, « le carré »

## L'idée
Le carré doré de la charte, celui qui porte « N7 », est le seul personnage de l'écran. Il traverse toute la soirée sans jamais disparaître.
Pendant l'attente, il porte le code QR. Il devient un point de veille dans le noir, puis l'ampoule G qui s'allume pour l'ouverture. Il porte ensuite le numéro de chaque acte, avant de s'ouvrir en grand comme une fenêtre sur l'image du guest. À la fin, il devient la page crème du générique, puis le fond doré de l'apéro.
Tant qu'un guest n'est pas annoncé, il reste « en coulisse » : l'écran ne s'excuse pas de le taire, il en fait un rendez-vous. (Depuis le 17/10, les trois noms sont publics et affichés dès l'attente.)

## Lancer
1. Ouvrir `index.html` dans Chrome, Edge ou Firefox (double-clic). Internet n'est pas nécessaire : les polices, le code QR et le logo sont intégrés au fichier.
2. Appuyer sur **F** pour passer en plein écran. L'image s'adapte à n'importe quelle résolution en 16:9.
3. La page reprend au dernier écran affiché. Si elle est rechargée par erreur pendant la soirée, on ne perd donc pas sa place. **Début** ramène à l'attente.

## Touches
| Touche | Effet |
|---|---|
| → · espace · Page↓ · Entrée | écran suivant |
| ← · Page↑ · Retour arrière | écran précédent |
| Début / Fin | premier / dernier écran |
| B ou . | noir total (encore une fois pour revenir) |
| F | plein écran |
| H | régie : liste des écrans, état des fonds des guests, aide |

Une télécommande de présentation fonctionne aussi, car elle envoie Page↓ et Page↑.

## Déroulé (18 écrans, dans l'ordre)
1. **Attente.** Ce sont quatre tableaux qui tournent seuls toutes les 11 s, avec l'heure, « Lever de rideau dans N min » et le code QR Luma.
2. **Noir salle.** Le carré se réduit à un point qui respire : « La soirée commence ».
3. **Ouverture.** Le G s'allume.
4. **Acte I** (entrée), puis le **fond plein écran de l'acte I**, puis l'**entracte** (« Merci », avec le nom).
5. Même chose pour les **actes II** et **III** (l'acte III n'a pas d'entracte).
6. **Clôture** : « Trois histoires. Et maintenant, la vôtre. »
7. **Générique** : il défile seul et finit sur le logo.
8. **Apéro** : La Mêlée ou le Foyer des étudiants.

## Modifier les données
Tout se trouve dans l'objet `window.SOIREE`, **tout en haut de `index.html`**. Modifiez, enregistrez, puis rechargez avec F5.
- `guests` : nom et `ligne` (ligne de présentation sous le nom) des trois guests. `null` à la place d'un nom le remet « en coulisse ».
- `garderLeSecretPendantAttente` : avec `true`, les noms 2 et 3 n'apparaissent qu'à l'entrée de leur acte. Avec `false`, ils apparaissent dès l'attente.
- `apero` : `"melee"` ou `"foyer"`. `flecheApero` : `"→"`, `"←"`, `"↑"` ou `""`, selon le vrai chemin depuis l'amphi.
- `horaires.ouverture` règle le compte à rebours de l'attente. **À confirmer :** la plaquette et le briefing guest ne donnent pas les mêmes horaires (voir le commentaire dans le fichier). Seule l'heure d'ouverture s'affiche.
- `partenaires` : quatre logos sur carte crème, dans `logos/` (AIn7, Toulouse INP-ENSEEIHT, N7 Développement à confirmer, La Mêlée). `null` affiche un emplacement marqué « Logo partenaire ».
- `generique` : les lignes du générique de fin. `logo` (facultatif) ajoute une petite image sous les noms : TVn7 et CAn7, sur carte charbon, dans `logos/`.

## Fonds des guests
Déposez les images préparées par Tristan dans le dossier **`fonds/`**, au format 1920×1080 :
`fonds/acte-1.jpg`, `fonds/acte-2.jpg`, `fonds/acte-3.jpg`.
Pour un autre nom ou un autre format (`.png`…), modifiez `fond` dans `SOIREE`. Tant que le fichier manque, un emplacement sobre s'affiche (fond charbon, avec « Acte I · … » en petit). La régie (touche **H**) indique pour chaque acte si l'image a bien été trouvée.

## Captures
Les images 1920×1080 sont dans `captures/` :
- 01 à 04 : attente ;
- 05 : noir salle ;
- 06 : ouverture ;
- 07 à 14 : actes, fonds et entractes ;
- 15 : clôture ;
- 16 et 17 : générique (crédits avec logos TVn7 / CAn7, puis partenaires) ;
- 18 : apéro à La Mêlée ;
- 19 : variante apéro au Foyer des étudiants.

Pour tester l'attente à une heure donnée : `index.html?heure=18:20`.

## Mise à jour du 17/10/2026 (guests annoncés)
- Les trois guests sont renseignés, sans secret : Tristan Vincent (« Créateur de contenu · plus de 600 000 abonnés »), Thibaut Lucas (« Ingénieur ENSEEIHT · cofondateur et CEO de Picsellia »), Sébastien Bonnet (« Entrepreneur · MonOrdo, Urry, Dropp »).
- Logos officiels ajoutés : AIn7, Toulouse INP-ENSEEIHT, N7 Développement (**soutien à confirmer**), La Mêlée ; au générique, les logos TVn7 et CAn7 (les clubs écrivent « TVn7 » et « CAn7 »). Sources et droits : `ressources/visuels/collecte/SOURCES.md`.
- Les fonds des guests présents dans `fonds/` sont une **proposition** (fonds sobres en charte, sans photo) : à valider, ou à remplacer par les images de Tristan sous le même nom.

