# Écran de scène · Soirée entrepreneuriat Genius N7 (version C)

## L'idée en trois lignes
Les trois actes s'écrivent avec le carré doré de la charte, étiré en barres de lumière : I, II, III. On les lit comme des chiffres romains et on les voit comme des faisceaux de projecteur.
Les noms qu'on ne connaît pas encore sont gardés sous un scellé doré qui porte leur heure de passage. On ne les cache pas, on leur donne rendez-vous, et le scellé se lève à l'entrée en scène.
Le noir et l'or tiennent tout le spectacle. À la clôture, l'or inonde l'écran et la salle passe au crème : « La conversation commence. »

## Lancer
1. Ouvrir `index.html` dans Chrome ou Firefox (double-clic). Aucune connexion internet n'est nécessaire, car la police et le code QR sont dans le dossier.
2. Appuyer sur **F** pour passer en plein écran. L'image se cale toute seule en 16:9 (1920×1080), quelle que soit la résolution du projecteur.
3. L'écran d'attente tourne en boucle tout seul (trois plans, 9 s chacun). Moins de 90 minutes avant l'ouverture, le troisième plan affiche un compte à rebours en minutes.

## Touches
| Touche | Effet |
|---|---|
| → ou Espace (ou Entrée, Page suivante, ↓) | avancer (écran suivant, ou temps suivant d'un même écran) |
| ← (ou Page précédente, ↑, Retour arrière) | reculer |
| B ou . | noir total (appuyer de nouveau pour revenir) |
| F | plein écran |
| R | régie : numéro d'écran, écran suivant, image de fond manquante |
| Début / Fin | premier / dernier écran |

Pour répéter à partir d'un écran précis, ajouter `#numéro.temps` à l'adresse, par exemple `index.html#10.2`.

## Déroulé (une pression = un pas)
1. Attente (boucle) : titre, programme sous scellés, heure d'ouverture, code QR Luma.
2. Ouverture : « Genius N7 · AIn7 présentent », puis « Soirée Entrepreneuriat » (2 temps).
3. Programme des trois actes.
4. Pour chaque acte : **entrée** (barres + nom ; si le guest est en surprise, 1er temps scellé, 2e temps le scellé se lève), puis **fond du guest** (plein écran pendant les 20 minutes), puis **Merci** (avec l'annonce de l'acte suivant).
5. Clôture : récapitulatif, puis l'or inonde l'écran : « La conversation commence. » (2 temps).
6. Remerciements (guests, organisation, TVN7, CAN7, ENSEEIHT, emplacements partenaires).
7. Envoi vers l'apéro (boucle) : flèche + lieu.

## Modifier les données
Tout se trouve dans l'objet `SOIREE`, **en tête de `index.html`** (lignes 10 à 66). On l'ouvre avec n'importe quel éditeur de texte, on modifie, on enregistre et on recharge la page.
- `guests` : les guests 2 et 3 sont à `nom: null` pour l'instant. Écrire leur nom et leur rôle, par exemple `nom: "Prénom Nom", role: "…"`.
  - `surprise: true` : le nom reste sous scellé sur l'écran d'attente et dans le programme, puis se révèle au 2e appui de son entrée en scène.
  - `surprise: false` : le nom est affiché partout dès l'attente.
- `apero` : `"mele"` (La Mêlée) ou `"foyer"` (Foyer des étudiants, ENSEEIHT). C'est tout ce qu'il faut changer pour basculer.
- `horaires` : ce sont les valeurs du briefing guest (p. 8). **Attention, les sources ne concordent pas** : la plaquette indique 18:15 / 18:30 / 19:00 / 19:30 / 20:15, et la page Luma affiche 19h–22h. Il faut les aligner sur le déroulé final de Tristan.
- `partenaires` : un emplacement par entrée. Mettre le fichier dans `partenaires/` et écrire `logo: "partenaires/fichier.png"`. Sans logo, l'emplacement reste marqué en pointillés.
- `equipes` : le générique technique (TVN7, CAN7).

## Fonds des guests
Déposer les images plein écran (idéalement 1920×1080, au format JPG ou PNG) dans **`fonds/`** :
`fonds/guest-1.jpg`, `fonds/guest-2.jpg`, `fonds/guest-3.jpg` (ces noms se changent dans `SOIREE.guests[].fond`).
Tant que le fichier manque, un fond noir sobre marqué « Acte I/II/III » le remplace, et la régie (touche R) signale l'image absente.

## Captures (`captures/`)
01–03 attente (3 plans) · 04–05 ouverture · 06 programme · 07 acte I · 08 fond guest 1 (emplacement vide) · 09 merci I · 10 acte II (nom non renseigné : scellé) · 11 fond 2 · 12 merci II · 13 acte III · 14 fond 3 · 15 merci III · 16–17 clôture · 18 remerciements · 19 apéro (La Mêlée).
20–22 sont des **démonstrations** avec un nom fictif « Prénom Nom » (sans rapport avec un guest réel) : 20 = scellé avant la révélation, 21 = nom révélé, 22 = apéro au Foyer des étudiants.

## Contenu du dossier
`index.html` (tout le code), `fonts/` (Inter, licence OFL incluse), `img/` (code QR vers https://luma.com/msnjs8ts, grain), `fonds/`, `partenaires/`, `captures/`.
