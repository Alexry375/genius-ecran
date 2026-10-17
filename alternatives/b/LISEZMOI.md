# Écran de la soirée Genius N7 (version b)

## L'idée en trois lignes
Le carré doré de la charte devient un personnage : il porte « N7 » pendant l'attente, s'allume en ampoule à l'ouverture, se pose en sceau sur le nom de chaque guest puis se retire pour le révéler, et finit en porte ouverte vers l'apéro.
Les guests pas encore annoncés restent sous scellé, une barre d'or. On ne les remplace pas par du vide : c'est un rendez-vous, « Deux noms sous scellé. Ils s'ouvrent sur scène. »
Noir, crème et or, de grands caractères, un grain de pellicule et une lumière chaude venue d'en haut, comme sur la scène. Tout ce qui compte se trouve dans les 3/4 supérieurs de l'écran, au-dessus des fauteuils.

## Lancer
Ouvrir `index.html` dans Chrome ou Firefox, puis appuyer sur **F** pour passer en plein écran. Aucune connexion internet n'est nécessaire : la police, le logo et le code QR sont dans `assets/`.
Le contenu s'adapte à n'importe quel écran en gardant le format 16:9 (1920×1080).

## Touches
| Touche | Effet |
|---|---|
| → ou Espace (ou Entrée, Page suivante) | écran suivant |
| ← (ou Page précédente) | écran précédent |
| Début / Fin | premier / dernier écran |
| F | plein écran |
| B | noir total (une deuxième pression le retire) |
| L | bascule le lieu de l'apéro : La Mêlée ou Foyer des étudiants |
| R | affiche la fiche de régie : écran en cours, écran suivant, lieu de l'apéro |

L'écran d'attente tourne seul en boucle sur 4 plans (titre, casting, phrase, apéro), avec l'heure réelle et un compte à rebours jusqu'à l'ouverture. Le code QR vers https://luma.com/msnjs8ts reste affiché en permanence.

## Déroulé (15 écrans)
1. Attente, en boucle
2. Ouverture : la lumière s'allume
3. Titre, pendant le discours de Genius N7
4. Acte I, entrée en scène → 5. fond du guest → 6. merci
7. Acte II, entrée en scène → 8. fond → 9. merci
10. Acte III, entrée en scène → 11. fond → 12. merci
13. Clôture
14. Générique : remerciements et emplacements des partenaires (défile tout seul)
15. Envoi vers l'apéro

## Modifier les données
Tout se trouve dans l'objet `window.SOIREE`, en tête de `index.html` (lignes 13 à 80). Modifiez-le, enregistrez, puis rechargez la page avec F5.
- **Guests 2 et 3** : remplir `nom` et éventuellement `ligne` (une ligne de présentation). Tant que `nom` est vide, le guest reste sous scellé partout. Une fois le nom rempli, le sceau doré glisse pour le révéler au moment de l'entrée en scène.
- `devoilerPendantAttente: false` garde les noms 2 et 3 scellés pendant l'attente, même s'ils sont remplis. Avec `true`, ils sont visibles dès l'attente.
- **Horaires** (`horaires`) : seule `ouverture` est affichée, par le compte à rebours de l'attente. Les valeurs par défaut viennent du briefing guest (p. 8). Les sources ne concordent pas encore (plaquette, briefing, Luma) : c'est à faire confirmer par Tristan.
- **Apéro** : `apero: "melee"` ou `"foyer"` (ou touche L le soir même). Les libellés se trouvent dans `lieuxApero`.
- **Partenaires** : un emplacement marqué par ligne de `partenaires`. Déposez le logo dans `partenaires/`, puis indiquez par exemple `logo: "partenaires/logo-1.png"`.
- **Générique** : liste `equipe`.

## Fonds des guests
Déposez une image plein écran (16:9, idéalement 1920×1080) dans `fonds/` sous ces noms :
- `fonds/acte-1.jpg` (ou .jpeg, .png, .webp)
- `fonds/acte-2.jpg`
- `fonds/acte-3.jpg`

L'image remplace automatiquement l'emplacement sobre (fond noir, numéro d'acte en filigrane). Pour un autre nom de fichier, modifiez `fond` dans `guests`.

## Captures
`captures/01.png` à `21.png` : les 4 plans de l'attente (01 à 04), l'ouverture (05 et 06), l'acte I sous scellé puis révélé (07 et 08), les fonds et les mercis, l'acte II et l'acte III scellés, la clôture, le générique en cours de défilement et à sa fin (18 et 19), l'apéro à La Mêlée (20) et au Foyer des étudiants (21).
