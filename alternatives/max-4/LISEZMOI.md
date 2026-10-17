# La Servante — l'écran de la soirée entrepreneuriat Genius N7

Jeudi 26 novembre 2026, amphi B00 de l'ENSEEIHT. Ce dossier contient tout ce que le grand écran montre quand il est seul face à la salle : pendant qu'elle se remplit, à l'entrée de chacun des trois guests, et au moment d'envoyer tout le monde à l'apéro.

## L'idée, en trois lignes

Au théâtre, quand la scène est vide, on laisse une seule ampoule allumée sur un pied : la servante. Ici, la servante, c'est le G-ampoule de Genius N7.
L'écran devient le mur du fond qu'elle éclaire, et chaque mot de la soirée est une ombre portée sur ce mur : il descend des cintres, entre par les coulisses, monte de la salle, frôle la lampe.
Quand le spectacle commence, on emporte la servante et chaque acte s'ouvre en plein feu, aux couleurs du logo ; elle revient, rallumée, pour « Tous sortent, ».

## Lancer

1. Copier **tout le dossier** `max-4` sur l'ordinateur relié au projecteur (pas seulement `index.html` : la page a besoin de `reglages.js` et du dossier `images`).
2. Ouvrir `index.html` (double-clic) avec Chrome, Edge ou Firefox. **Aucune connexion internet n'est nécessaire** : les polices et les images sont dans le dossier.
3. Placer la fenêtre sur l'écran du projecteur, puis appuyer sur **F** (ou double-cliquer) pour passer en plein écran.
4. Cliquer une fois dans la page si les touches ne répondent pas (la page doit être la fenêtre active).

La page est pensée pour un écran 16:9 (1920 × 1080). Sur un écran d'une autre forme, l'image est réduite avec des bandes noires, jamais déformée ni coupée. Le pointeur de la souris disparaît tout seul. Il n'y a aucun son.

Avant le jour J : faire un essai sur le vrai projecteur, et couper la mise en veille de l'ordinateur.

## Les touches

| Touche | Effet |
| --- | --- |
| **→**, **espace**, **Page suivante**, **Entrée** | moment suivant (une télécommande de présentation fonctionne) |
| **←**, **Page précédente**, **Retour arrière** | moment précédent, affiché directement composé, sans rejouer l'entrée (l'attente, elle, repart de sa page de titre) |
| **0** | l'attente (repart de la page de titre) |
| **1**, **2**, **3** | Acte I, Acte II, Acte III |
| **4** | l'apéro |
| **F** ou double-clic | plein écran (et retour) |
| **H** | montrer ou cacher l'aide des touches |

Un deuxième appui trop rapproché est ignoré : un double appui par erreur ne saute pas un acte.

## Le déroulé

| Moment | Ce que voit la salle |
| --- | --- |
| **0. L'attente** (au lancement, en boucle) | La servante s'allume. Puis un tour de 60 secondes recommence sans fin : la page de titre se forme dans la lumière, le lieu et la date descendent des cintres, les personnages entrent par ordre d'entrée en scène, puis « LA SALLE », puis deux didascalies (indications de mise en scène) qui changent à chaque tour, sept en tout, dont une où la lumière baisse vraiment. |
| **1. Acte I** | La lampe vacille, on emporte la servante, noir. Plein feu : « Acte I », « Entre », puis TRISTAN VINCENT, qui entre côté cour (par la droite). |
| **2. Acte II** | « Entre THIBAUT LUCAS », côté jardin (par la gauche). |
| **3. Acte III** | Le troisième guest, qui entre par le fond. |
| **4. L'apéro** | La servante revient et se rallume : « Tous sortent, direction La Mêlée, buffet et rencontres. » L'écran reste ainsi. |

Pendant les interventions, c'est l'image de l'organisateur qui passe à l'écran. En revenant sur cette page, elle montre encore l'acte précédent : **→** passe au suivant.

## Les deux réglages : le fichier `reglages.js`, et rien d'autre

Ouvrir `reglages.js` avec n'importe quel éditeur de texte (Bloc-notes, TextEdit…), modifier, enregistrer, puis recharger la page (**F5**, ou **Ctrl+R** / **Cmd+R**).

### Ajouter le troisième guest

Remplacer la ligne

```js
{ nom: "", role: "" },
```

par exemple par

```js
{ nom: "Prénom Nom", role: "ce qu'il ou elle fait" },
```

Écrire le nom normalement, avec ses accents : l'écran le passe lui-même en capitales. La ligne `role` est facultative (laissée vide, seul le nom apparaît). Le nom s'affiche alors partout tout seul : dans la liste des personnages de l'attente et à l'Acte III.

Tant que le nom reste vide, l'écran garde le secret, et c'est voulu : pendant l'attente, « QUELQU'UN » s'arrête dans les coulisses, au bord du cadre, sans entrer tout à fait, avec « son nom attend en coulisses. » ; à l'Acte III, « Entre QUELQU'UN que l'on annonce. », et c'est la voix sur scène qui dit le nom.

Les deux premiers guests et leur présentation se modifient de la même façon, sur les deux lignes au-dessus.

### Changer le lieu de l'apéro

```js
apero: "La Mêlée",
```

S'écrit tel qu'on veut le lire après « direction ». Deux possibilités prévues : `"La Mêlée"` ou `"le Foyer des étudiants"` (la minuscule à « le » est voulue : « direction le Foyer des étudiants », sur deux lignes).

## Les captures

Le dossier `captures/` montre chaque moment en 1920 × 1080, à plusieurs instants :

- `01a` à `01r` : l'attente (allumage, page de titre, lieu et date, les personnages, « QUELQU'UN » dans les coulisses, la salle, les didascalies, la lumière qui baisse, puis la servante emportée au passage à l'Acte I) ;
- `02a` à `02c` : Acte I ; `03a`, `03b` : Acte II ; `04a`, `04b` : Acte III ;
- `05a` à `05c` : l'apéro ;
- `01s-variante-troisieme-nomme`, `04c-variante-troisieme-nomme`, `05d-variante-foyer` : ce que donnent les réglages une fois le troisième nom écrit (ici un nom d'exemple) et avec l'apéro au Foyer des étudiants.

## Contenu du dossier

- `index.html` : l'écran (les polices y sont intégrées, le G-ampoule y est dessiné d'après le logo Genius N7) ;
- `reglages.js` : les deux réglages ;
- `images/` : la texture du mur et les halos de la lampe ;
- `polices/` : EB Garamond, la police utilisée, avec sa licence libre (SIL Open Font License).

Pour refaire des captures : ouvrir `index.html?capture=1`, la page s'arrête et attend qu'on lui demande un instant précis avec `__aller(moment, secondes)` depuis la console du navigateur.
