# Le fil : l'écran de la Soirée entrepreneuriat Genius N7

## L'idée en trois lignes

Un seul fil incandescent traverse toute la soirée sans jamais se rompre : c'est le filament de l'ampoule Genius.
Il trace l'ampoule et l'allume, écrit le titre puis, à la main, le nom de chaque guest ; la troisième ligne reste tendue, comme une promesse.
À la fin, il se démultiplie, inonde l'écran d'or et écrit l'endroit où la conversation continue.

## Lancer l'écran

1. Copier le dossier `max-3` en entier sur l'ordinateur relié au vidéoprojecteur. Il contient tout (polices comprises) : aucune connexion à internet n'est nécessaire.
2. Ouvrir `index.html` dans Chrome ou Edge (l'écran a été vérifié dans Chrome). Avec Safari ou Firefox, faire un essai complet avant le soir.
3. Placer la fenêtre sur le vidéoprojecteur, puis appuyer sur **F** pour le plein écran.

L'écran démarre sur l'attente, qui tourne en boucle (un tour dure 60 secondes) pendant que la salle se remplit. Le lancer quelques minutes avant l'ouverture des portes.

Brancher l'ordinateur sur secteur. L'écran demande à l'ordinateur de rester éveillé tant qu'il est affiché ; par précaution, couper aussi la mise en veille et l'économiseur d'écran.

## Les touches

| Touche | Effet |
| :-- | :-- |
| → ou Espace (ou Page suivante, Entrée) | moment suivant |
| ← (ou Page précédente, Retour arrière) | revenir au moment précédent |
| 1, 2, 3, 4, 5 | aller directement à un moment (sur un clavier AZERTY, pas besoin de Maj) |
| F | plein écran (F de nouveau, ou Échap, pour en sortir) |

Une touche maintenue enfoncée ne compte qu'une fois : pour passer encore au moment d'après, la relâcher puis appuyer de nouveau.

La plupart des télécommandes de présentation fonctionnent aussi : elles envoient Page suivante et Page précédente, ou les flèches.

Sur un téléphone (sans clavier) : toucher la moitié droite de l'écran pour passer au moment suivant, la moitié gauche pour revenir au précédent. Seul le doigt compte : un clic de souris ne fait rien, pour qu'un clic par mégarde en régie ne change pas l'écran. En portrait, l'image s'affiche en entier, en bandeau au milieu de l'écran ; tourner le téléphone pour la voir plus grande.

Les cinq moments :

1. **Attente** : le fil s'allume, trace l'ampoule Genius, la lumière dorée, le titre, la date, l'annonce des trois actes. En boucle. La date et le lieu (jeudi 26 novembre 2026, amphi B00, ENSEEIHT) restent écrits en bas de l'écran pendant toute l'attente ; ils ne s'effacent que le temps où la date s'écrit en grand sous le titre.
2. **Acte I** : à l'entrée de Tristan Vincent.
3. **Acte II** : à l'entrée de Thibaut Lucas.
4. **Acte III** : à l'entrée du troisième guest.
5. **Apéro** : pour envoyer tout le monde vers l'apéro.

## Changer le lieu de l'apéro, ajouter le troisième guest

Tout se règle dans un seul fichier : **`reglages.js`** (à ouvrir avec n'importe quel éditeur de texte). Enregistrer, puis recharger la page (Ctrl+R, ou Cmd+R sur Mac).

- `lieuApero` : le lieu, **avec son article**. `"La Mêlée"` donne « à La Mêlée » ; `"le Foyer des étudiants"` donne « au Foyer des étudiants ».
- `troisiemeGuest` : laisser `""` tant que rien n'est confirmé (l'acte III reste alors une ligne tendue, et l'attente annonce « Son nom s’écrira ce soir. »). Le jour où c'est confirmé, écrire son nom, par exemple `"Prénom Nom"` : le fil l'écrit, dans la boucle d'attente comme à son entrée.
- `troisiemeGuestPresentation` : une ligne facultative sous son nom.

Garder les guillemets droits autour de chaque texte. Si le fichier est mal recopié, l'écran reprend les valeurs de départ (La Mêlée, pas de troisième nom) : regarder l'écran après chaque modification.

## Bon à savoir

- Fluidité : si l'ordinateur peine, l'écran le mesure pendant les premiers tours de l'attente et calcule alors une image un peu moins fine pour rester fluide. Sur un ordinateur ordinaire, rien ne change. `index.html?q=0` impose la pleine définition.
- La flèche de la souris est masquée sur l'écran.
- Pour vérifier un instant précis sans attendre : `index.html?m=5&t=16` montre le moment 5 (apéro) à 16 secondes, image figée.
- Le dossier `captures` montre chaque moment à plusieurs instants, en 1920 × 1080 : `01a` à `01l` pour l'attente, `02` acte I, `03` acte II, `04` acte III, `05` apéro.
- Polices : B612 (créée pour les écrans de cockpit d'Airbus) pour les légendes, Hershey Script pour l'écriture du fil. Elles sont dans le dossier `polices`, avec leurs licences (`polices/LICENCES.txt`).
- Dans « AIn7 », le I est volontairement dessiné avec des empattements (des barres en haut et en bas) : en B612, le I simple se lit « l » de loin, et le nom devenait « Aln7 ».
