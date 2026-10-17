# Écran de scène · Soirée entrepreneuriat Genius N7 · jeudi 26 novembre 2026 · amphi B00, ENSEEIHT

## L'idée en trois lignes

Une façade de brique toulousaine, la nuit. Chaque acte y est une fenêtre dorée, comme le carré N7 de la charte.
Pendant l'attente, seule la fenêtre de Tristan Vincent est allumée. Les deux autres s'allumeront sur scène : ce qui n'est pas encore annoncé devient une promesse.
À la fin, tout l'immeuble s'allume, puis la lumière sort des trois fenêtres et devient le crème de la charte : le merci, puis direction l'apéro.

## Lancer l'écran

1. Ouvrir `index.html` dans Google Chrome (Edge ou Firefox conviennent aussi) : un double-clic suffit.
2. Appuyer sur **F** pour passer en plein écran.
3. Internet n'est pas nécessaire : les polices, le code QR et les images sont dans le dossier.
4. Pour l'ordinateur de secours, copier **le dossier entier** (sur une clé USB par exemple). Il fonctionne de la même façon.

Le format est 16:9 (1920 × 1080). Sur un autre format, l'image s'adapte avec des bandes noires.
Faire une répétition sur l'ordinateur de la soirée, branché au projecteur, pour vérifier que les animations restent fluides.

## Les touches (pas besoin de souris)

| Touche | Effet |
|---|---|
| → ou Espace (ou le bouton « suivant » d'une télécommande de présentation) | écran suivant |
| ← | écran précédent |
| B (ou point) | écran noir ; appuyer de nouveau pour revenir |
| F | plein écran |
| H | aide de régie : liste des écrans et fonds trouvés. Le public la voit aussi : à garder pour les répétitions |
| un numéro puis Entrée | aller directement à cet écran (par exemple 7 puis Entrée : entrée de l'acte II) |
| Début / Fin | premier / dernier écran |

L'écran d'attente tourne en boucle tout seul : trois plans d'environ 25 secondes chacun (le titre, les trois fenêtres, la promesse), avec le code QR d'inscription.
Si la page est rechargée (F5) en pleine soirée, elle revient sur l'écran en cours.

## Le déroulé

| N° | Écran | Captures |
|---|---|---|
| 0 | Attente, en boucle : titre, fenêtres, promesse, code QR | 01, 02, 03 |
| 1 | Ouverture : le logo G s'allume, « Genius N7 présente, avec AIn7 » | 04 |
| 2 | Titre : Soirée entrepreneuriat | 05 |
| 3 | « Trois histoires qui se répondent. » | 06 |
| 4 | Acte I, entrée : la caméra rejoint la fenêtre puis entre dans la lumière, carte dorée avec le nom | 07 |
| 5 | Acte I, fond du guest pendant qu'il parle (ici l'emplacement sobre) | 08 |
| 6 | Acte I, merci | 09 |
| 7 à 9 | Acte II : la fenêtre s'allume, entrée, fond, merci | 10, 11, 12, 13 |
| 10 à 12 | Acte III : entrée, fond, merci | 14, 15, 16 |
| 13 | Clôture : les trois fenêtres allumées | 17 |
| 14 | Remerciements : tout l'immeuble s'allume, la lumière gagne l'écran, puis le générique | 18, 19, 20 |
| 15 | Apéro : « La conversation continue → La Mêlée » | 21 |

Toutes les captures sont dans `captures/`, en 1920 × 1080.

## Modifier les textes : un seul endroit

Tout se trouve **en haut de `index.html`**, dans le bloc `window.SOIREE`. Ouvrir le fichier avec un éditeur de texte (Bloc-notes, TextEdit, VS Code), changer ce qui est entre guillemets, enregistrer, puis recharger la page (F5).

- **guests** : une ligne par acte, avec `nom`, `descriptif`, `annonce` et `fond`.
  - `annonce: true` : le nom est visible dès l'écran d'attente.
  - `annonce: false` : le nom reste secret et n'apparaît qu'à l'entrée de l'acte.
  - Nom vide : l'écran affiche « ACTE II » sans nom, et c'est le présentateur qui annonce. C'est le réglage actuel des actes II et III, car leurs noms ne sont pas confirmés.
  - Avec deux guests seulement, supprimer la ligne de l'acte III : les textes passent tout seuls à « Deux histoires ».
- **apero** : `lieu` vaut `"La Mêlée"` ou `"Foyer des étudiants"`. `precision` est une ligne facultative, par exemple pour indiquer le chemin ; vide, rien ne s'affiche.
- **horaires** : à confirmer. La plaquette, le briefing des guests et la page Luma ne donnent pas les mêmes heures. Tant que `horairesConfirmes` vaut `false`, aucune heure n'apparaît à l'écran. Une fois les heures tranchées, les corriger et passer à `true` : l'heure d'ouverture s'affiche alors sur l'attente et l'heure de l'apéro sur le dernier écran.
- **partenaires** : quand la liste est vide, rien ne s'affiche. Pour en ajouter un, déposer son logo dans `partenaires/` (PNG à fond transparent de préférence) et ajouter une ligne `{ nom: "Nom", logo: "partenaires/fichier.png" },`. Les logos apparaissent dans le générique de fin, sous « Avec le soutien de ».
- **generique** : les lignes du générique de fin (rôle, puis noms). Les noms des guests s'y ajoutent seuls, mais seulement quand tous les guests sont nommés.
- **inscription** : le lien du code QR (la page Luma).

## Les fonds des guests

Déposer les images préparées par Tristan dans `fonds/`, sous les noms `acte-1.jpg`, `acte-2.jpg` et `acte-3.jpg`, au format 1920 × 1080.
Les formats .jpg, .jpeg, .png et .webp sont acceptés, ainsi qu'une vidéo .mp4 ou .webm (en gardant le même nom).
L'image est montrée en entier, sans recadrage. S'il n'y a pas de fichier, un emplacement sobre s'affiche : la façade dans le noir, avec la fenêtre de l'acte allumée.
La touche H indique pour chaque acte si le fond a bien été trouvé.

Les fauteuils masquent environ le dixième inférieur de l'écran : l'essentiel des textes est placé au-dessus, et les fonds doivent suivre la même règle.

## Répéter, vérifier

- Pour ouvrir un écran précis figé à un instant donné, ajouter à l'adresse `index.html?ecran=4&t=6` (ici : écran 4 à 6 secondes).
- Ce qui a été vérifié :
  - le code QR est relu par un lecteur et mène à https://luma.com/msnjs8ts, même sur une capture réduite ;
  - tous les écrans avec trois guests et avec deux guests ;
  - les noms longs ;
  - le Foyer des étudiants et les partenaires ;
  - la navigation complète en avant et en arrière.
- À confirmer avant le 26 novembre : les noms des guests 2 et 3, les horaires, le lieu de l'apéro et les partenaires.

Polices : Inter (licence libre OFL, dans `polices/`). Code QR : qrcode-generator (licence MIT, dans `lib/`).
