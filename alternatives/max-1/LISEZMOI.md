# Écran de la soirée entrepreneuriat · Genius N7 · jeudi 26 novembre 2026

## L'idée en trois lignes

L'N7 est une école d'électriciens, le logo de Genius est une ampoule, et la charte (charbon, brique, cuivre, or, crème) a les couleurs d'un filament qui chauffe.
La soirée est donc une « mise sous tension » : un trait de lumière court d'écran en écran, et chaque acte allume son tube (un, puis deux, puis trois).
Les deux invités qu'on n'annonce pas encore sont « sous tension » : leurs lettres couvent en cuivre et ne s'allument qu'au moment où ils montent sur scène.

## Lancer

1. Copier tout le dossier `max-1` sur l'ordinateur de projection (pas seulement `index.html` : les polices sont dans `polices/`, les fonds dans `fonds/`).
2. Ouvrir `index.html` dans Google Chrome (double-clic, ou glisser le fichier dans une fenêtre Chrome).
3. Appuyer sur F pour le plein écran.

Aucune connexion internet n'est nécessaire : polices, logo et code QR sont dans le dossier ou dans la page.
L'écran d'attente tourne seul, en boucle, jusqu'au premier appui sur la flèche droite.
À faire avant le jour J : un essai sur le vidéoprojecteur de l'amphi B00, la mise en veille de l'ordinateur coupée, et le même dossier copié sur l'ordinateur de secours.

## Touches (pas besoin de souris)

- Flèche droite ou Espace : écran suivant (Entrée, Page suivante et flèche bas marchent aussi, donc une télécommande de présentation ordinaire convient).
- Flèche gauche : écran précédent, montré directement dans son état final (Page précédente, flèche haut et Retour arrière marchent aussi).
- R : rejouer l'animation de l'écran en cours.
- B (ou la touche point) : écran noir ; la même touche le rallume.
- F : plein écran (et sortie du plein écran).
- H : régie. Liste des 14 écrans avec l'heure prévue, l'écran en cours, et les alertes (fond manquant, nom vide). La régie s'affiche sur l'image projetée : ne l'ouvrir qu'hors public.
- Régie ouverte : touches 1 à 9 pour sauter aux écrans 1 à 9, touche 0 pour l'écran 10.
- Début / Fin : premier / dernier écran.

Le pointeur de la souris disparaît tout seul.

## Les 14 écrans, dans l'ordre

1. Attente (boucle) : titre, « Trois histoires qui se répondent », Acte I Tristan Vincent, actes II et III « sous tension », heure d'ouverture, « La conversation continue ». Le code QR d'inscription Luma (luma.com/msnjs8ts) reste à l'écran sur tous les plans.
2. Ouverture : « Mise sous tension », le filament chauffe, éclair, logo, « Genius N7 présente, avec AIn7 », le titre s'allume lettre par lettre.
3. Programme : les trois actes ; I allumé, II et III sous tension.
4. Acte I : le nom de Tristan Vincent s'embrase.
5. Fond de l'acte I, pendant l'intervention.
6. Merci (acte I) ; acte II « à suivre ».
7. Acte II : « sous tension » grésille, éclair, le nom (ou « Deuxième histoire ») s'allume.
8. Fond de l'acte II.
9. Merci (acte II) ; acte III « à suivre ».
10. Acte III.
11. Fond de l'acte III.
12. Clôture : les trois actes s'allument en cascade.
13. Générique : les remerciements défilent, puis « MERCI. ».
14. Envoi vers l'apéro (boucle) : « La conversation continue », à La Mêlée ou au Foyer des étudiants.

Une image de chaque écran est dans `captures/` (01.png à 14.png). Les fichiers avec une lettre (02-b.png, 07-c.png…) montrent des moments des animations ; 14-b.png montre la variante « Foyer des étudiants ».

## Modifier les données

Tout ce qui peut changer est dans un seul bloc, tout en haut de `index.html` : l'objet `SOIREE`. Rien d'autre à toucher.
Ouvrir `index.html` avec un éditeur de texte (Bloc-notes, TextEdit, VS Code), changer le texte entre guillemets, enregistrer, puis recharger la page dans Chrome (F5).
Garder les guillemets et les virgules en fin de ligne. En cas d'oubli, la page affiche un message qui le signale au lieu des écrans.

- Horaires (`horaires`) : À CONFIRMER, les sources ne concordent pas (briefing : ouverture 18:45 ; plaquette : portes 18:15, première conférence 18:30 ; page Luma : 19:00). Les valeurs actuelles sont celles du briefing. Le public ne voit que l'heure d'ouverture, sur l'écran d'attente, avec « on commence dans X minutes » calculé sur l'horloge de l'ordinateur (vérifier l'heure de l'ordinateur, ou mettre `compteARebours: false`). Les autres heures servent de repères dans la régie.
- Guests 2 et 3 (`guests`) : écrire le nom dans `nom` et, si on veut, une ligne de présentation dans `ligne`. Avec `surprise: true`, le nom reste caché (« sous tension ») jusqu'à l'écran de son acte ; avec `surprise: false`, il est annoncé dès l'écran d'attente et sur le programme. Tant que `nom` est vide, l'écran affiche « Deuxième histoire » / « Troisième histoire ».
- Lieu de l'apéro (`apero.lieu`) : `"melee"` pour La Mêlée (valeur actuelle) ou `"foyer"` pour le Foyer des étudiants. `apero.indication` accepte une phrase facultative, par exemple « Suivez le fléchage. ».
- Partenaires (`partenaires`) : la liste est vide, donc rien ne s'affiche. Pour en ajouter un : déposer son logo dans `partenaires/`, puis ajouter une ligne `{ nom: "Nom", logo: "partenaires/nom.png", carte: false },`. Un logo PNG à fond transparent est redessiné en couleur crème ; mettre `carte: true` pour un logo sur fond blanc (JPG), posé tel quel sur une carte crème. Les partenaires apparaissent alors dans l'attente (« Avec le soutien de ») et dans le générique.
- Générique (`generique`) : les lignes de remerciements, dans l'ordre.
- Réglages : `dureePlan` (secondes par plan de l'écran d'attente, 8 par défaut) ; `grain: false` si l'ordinateur peine.

## Fonds des guests (pendant les interventions)

Déposer les images plein écran dans le dossier `fonds/`, avec ces noms exacts :

- `fonds/acte-1.jpg` : Tristan Vincent
- `fonds/acte-2.jpg` : guest 2
- `fonds/acte-3.jpg` : guest 3

Les formats .jpg, .jpeg, .png et .webp sont acceptés (même nom, autre extension). Taille idéale : 1920 × 1080 ; une autre proportion est recadrée au centre.
Tant qu'un fichier manque, l'écran du fond affiche une version sobre (les tubes de l'acte et une petite signature), et la régie (touche H) le signale.

## Répétition

Pour voir le compte à rebours comme le soir même, ouvrir la page avec une heure simulée : ajouter `?heure=18:33` à la fin de l'adresse dans Chrome (exemple : `…/max-1/index.html?heure=18:33`).
