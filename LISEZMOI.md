# Le fil : l'écran de la Soirée entrepreneuriat Genius N7

## L'idée en trois lignes

Un seul fil incandescent traverse toute la soirée sans jamais se rompre : c'est le filament de l'ampoule Genius.
Il trace l'ampoule et l'allume, écrit le titre puis, à la main, le nom de chaque guest ; la troisième ligne reste tendue, comme une promesse.
À la fin, il se démultiplie, inonde l'écran d'or et écrit l'endroit où la conversation continue.

## Lancer l'écran

1. Copier le dossier `max-3` en entier sur l'ordinateur relié au vidéoprojecteur. Il contient tout (polices comprises) : aucune connexion à internet n'est nécessaire.
2. Ouvrir `index.html` dans Chrome ou Edge (l'écran a été vérifié dans Chrome). Avec Safari ou Firefox, faire un essai complet avant le soir.
3. Placer la fenêtre sur le vidéoprojecteur, puis appuyer sur **F** pour le plein écran.

L'écran démarre sur l'attente : le fil s'allume, trace l'ampoule Genius, puis écrit le titre et la date (environ 23 secondes). Ensuite l'écran reste posé sur le titre, aussi longtemps qu'il le faut, pendant que la salle se remplit. Le lancer quelques minutes avant l'ouverture des portes.

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

1. **Attente** : le fil s'allume, trace l'ampoule Genius, la lumière dorée, puis écrit le titre et la date. Cette ouverture se joue une seule fois (environ 23 secondes). Ensuite l'écran reste posé sur le titre, la date et le lieu (jeudi 26 novembre 2026, amphi B00, ENSEEIHT), sans rien écrire de nouveau, jusqu'à l'appui suivant : le fil reste allumé, sa lumière monte et redescend doucement (une fois toutes les 6,5 secondes) et, comme dans les autres moments, un éclat plus clair le parcourt toutes les 8 secondes. Pendant l'ouverture, la date et le lieu sont aussi écrits en petit en bas de l'écran ; quand la date s'écrit en grand sous le titre, cette ligne du bas s'efface et ne revient pas, pour qu'ils ne soient jamais écrits deux fois. Revenir au moment 1 (← depuis l'acte I, ou la touche 1) rejoue l'ouverture une fois (le fil, déjà allumé, ne se rallume pas), puis l'écran se pose de nouveau sur le titre.
2. **Acte I** : à l'entrée de Tristan Vincent.
3. **Acte II** : à l'entrée de Thibaut Lucas.
4. **Acte III** : à l'entrée du troisième guest.
5. **Apéro** : pour envoyer tout le monde vers l'apéro.

## Changer le lieu de l'apéro, ajouter le troisième guest

Tout se règle dans un seul fichier : **`reglages.js`** (à ouvrir avec n'importe quel éditeur de texte). Enregistrer, puis recharger la page (Ctrl+R, ou Cmd+R sur Mac).

- `lieuApero` : le lieu, **avec son article**. `"La Mêlée"` donne « à La Mêlée » ; `"le Foyer des étudiants"` donne « au Foyer des étudiants ».
- `troisiemeGuest` : laisser `""` tant que rien n'est confirmé (l'acte III reste alors une ligne tendue). Le jour où c'est confirmé, écrire son nom, par exemple `"Prénom Nom"` : le fil l'écrit à son entrée.
- `troisiemeGuestPresentation` : une ligne facultative sous son nom.

Garder les guillemets droits autour de chaque texte. Si le fichier est mal recopié, l'écran reprend les valeurs de départ (La Mêlée, pas de troisième nom) : regarder l'écran après chaque modification.

## Bon à savoir

- Fluidité : chaque image demande beaucoup de calcul. Pour en afficher 60 par seconde, l'écran fait dessiner les images par plusieurs calculateurs à la fois : des tâches de fond du navigateur, une par cœur du processeur (ses unités de calcul) moins une, six au plus. Chacune dessine une image sur plusieurs, exactement de la même façon ; la page les affiche dans l'ordre et à l'heure. Contrepartie : une touche agit avec un dixième de seconde de délai environ. Si l'ordinateur peine malgré tout, l'écran le mesure pendant l'ouverture de l'attente et calcule ensuite une image un peu moins fine pour rester fluide ; sur un ordinateur ordinaire, rien ne change. `index.html?q=0` impose la pleine définition. En cas de souci d'affichage, `index.html?calcul=page` fait tout calculer par la page elle-même, comme avant (moins fluide : une vingtaine d'images par seconde sur l'ordinateur d'essai).
- La flèche de la souris est masquée sur l'écran.
- Pour vérifier un instant précis sans attendre : `index.html?m=5&t=16` montre le moment 5 (apéro) à 16 secondes, image figée.
- Le dossier `captures` montre chaque moment à plusieurs instants, en 1920 × 1080 ; le nom de chaque image dit ce qu'elle montre, et l'instant (entre parenthèses) permet de la refaire avec `index.html?m=…&t=…`. Attente (`m=1`) : `01a-allumage` (1,6 s), `01b-fil-allume` (4 s), `01c-ampoule-tracee` (7,8 s), `01d-genius-ain7` (10,5 s), `01e-lumiere-doree` (12 s), `01f-lumiere-doree-pleine` (13,5 s), `01g-titre-en-ecriture` (20 s), `01h-titre-et-date` (26 s, l'ouverture est finie), puis l'écran posé sur le titre : `01i-pose-1-minute` (60 s) et `01j-pose-5-minutes` (300 s). Acte I (`m=2`) : `02a-acte1-ecriture` (1,8 s), `02b-acte1-tristan-vincent` (6,5 s). Acte II (`m=3`) : `03a-acte2-ecriture` (1,8 s), `03b-acte2-thibaut-lucas` (6,5 s). Acte III (`m=4`) : `04a-acte3-entree` (1,5 s), `04b-acte3-ligne-tendue` (5 s). Apéro (`m=5`) : `05a-apero-brins` (3,9 s), `05b-apero-or` (4,9 s), `05c-apero-lieu-en-ecriture` (7 s), `05d-apero-final` (16 s).
- Polices : B612 (créée pour les écrans de cockpit d'Airbus) pour les légendes, Hershey Script pour l'écriture du fil. Elles sont dans le dossier `polices`, avec leurs licences (`polices/LICENCES.txt`).
- Dans « AIn7 », le I est volontairement dessiné avec des empattements (des barres en haut et en bas) : en B612, le I simple se lit « l » de loin, et le nom devenait « Aln7 ».
