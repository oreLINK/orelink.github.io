# Thèmes du site

Le site a deux réglages visuels indépendants :

| | Quoi | Qui décide |
|---|---|---|
| **Apparence** | Clair ou sombre | Le visiteur (bouton en haut à droite), sinon le réglage de son appareil |
| **Thème d'habillage** | Une ambiance posée sur le site : saison, fête, grand événement | Le calendrier, d'après `src/data/themes.json` |

Les deux se combinent : chaque thème d'habillage existe en **deux versions**, une version
**jour** (apparence claire) et une version **nuit** (apparence sombre), chacune avec son décor
et ses animations. Quand le visiteur passe du clair au sombre, le décor change avec un fondu.

## Trois niveaux de priorité

| Niveau | Rôle | Dates | Priorité |
|---|---|---|---|
| **Spéciaux** | Grands événements ponctuels (Coupe du monde, Roland-Garros…) | Avec l'année : `AAAA-MM-JJ` | 1, l'emporte toujours |
| **Récurrents** | Fêtes qui reviennent chaque année | Chaque année : `MM-JJ` | 2 |
| **Saisons** | Fond permanent : les 4 couvrent toute l'année | Chaque année : `MM-JJ` | 3 |
| *Défaut* | Le site sans habillage | Seulement si aucun thème n'est en période (saisons désactivées) | dernier recours |

À une date donnée, le site prend **le premier thème actif en période**, en partant du haut. Par
exemple le 21 juin, la Fête de la musique passe avant l'Été ; le 15 octobre, Halloween passe
avant l'Automne. À l'intérieur d'un même niveau, le premier de la liste l'emporte.

Le **thème par défaut** (gris neutres, accent bleu réglé dans `src/data/site.json` →
`couleurs`) ne s'affiche donc plus que si les saisons sont désactivées, ou avec
`"forcer": "aucun"`.

## Les thèmes

Le contenu, la mise en page et les textes ne changent jamais : le décor passe derrière. Les
animations s'arrêtent si l'appareil demande moins de mouvement (le décor reste affiché,
immobile), et les décors sont allégés sur téléphone.

### Saisons (dates astronomiques)

| Thème | Période | Jour (clair) | Nuit (sombre) | Accent |
|---|---|---|---|---|
| **Printemps** | 20 mars – 20 juin | Pétales de cerisier qui volent ; fond vert et rose | Lucioles qui clignotent, quelques étoiles | Vert |
| **Été** | 21 juin – 22 sept. | Halo de soleil, dunes de sable en bas | Voie lactée en diagonale, lueur chaude sur l'horizon, étoiles filantes | Turquoise |
| **Automne** | 23 sept. – 20 déc. | Feuilles qui tombent en tournoyant | Lune rousse, brume qui dérive, quelques feuilles sombres | Bordeaux |
| **Hiver** | 21 déc. – 19 mars | Neige et congères en bas | Aurore boréale qui ondule, étoiles, neige et congères | Bleu glacier |

### Récurrents

| Thème | Période | Jour (clair) | Nuit (sombre) | Accent |
|---|---|---|---|---|
| **Halloween** | 1er – 31 oct. | Toile d'araignée et son araignée au bout d'un fil, feuilles qui tombent | Lune en croissant, étoiles, chauves-souris (dont une qui traverse le ciel) | Orange citrouille |
| **Noël** | 1er – 26 déc. | Neige qui tombe sur un fond rouge et vert | Neige et ciel étoilé | Rouge |
| **Nouvel An** | 31 déc. – 2 janv. | Ballons dorés aux chiffres de la nouvelle année, confettis | Feux d'artifice : fusées, gerbes (pivoine, saule, anneau, crépitement) qui retombent | Doré |
| **Fête de la musique** | 21 juin | Notes qui s'envolent, égaliseur en bas | Notes et égaliseur en néon, deux projecteurs qui balaient la scène | Violet |

L'année des ballons est calculée dans le navigateur : de juillet à décembre, c'est l'année
suivante ; de janvier à juin, l'année en cours.

### Spéciaux

Aucun pour l'instant. Prévus : un habillage **Football** (Coupe du monde, Euro), **Rugby**
(Coupe du monde de rugby) et **Tennis** (Roland-Garros). Chaque événement ne sera qu'une
ligne dans `themes.json`, qui réutilise l'habillage de son sport (voir « Ajouter un
événement spécial »).

## Les réglages : `src/data/themes.json`

```json
{
  "forcer": "",

  "speciaux": [],

  "recurrents": [
    { "id": "halloween", "nom": "Halloween", "actif": true, "debut": "10-01", "fin": "10-31", "accentClair": "#C2410C", "accentSombre": "#FB923C" }
  ],

  "saisons": [
    { "id": "printemps", "nom": "Printemps", "actif": true, "debut": "03-20", "fin": "06-20", "accentClair": "#2E7D46", "accentSombre": "#86D19C" }
  ]
}
```

(Extrait : le fichier contient les 4 récurrents et les 4 saisons.)

| Champ | Rôle |
|---|---|
| `forcer` | `""` : chaque thème suit ses dates (normal). L'`id` d'un thème (ex. `"halloween"`) : ce thème toute l'année. `"aucun"` : jamais d'habillage, le site reste au thème par défaut. |
| `id` | Saisons et récurrents : le thème dessiné dans le code, à ne pas changer. Spéciaux : un nom libre pour l'événement (ex. `"coupe-du-monde-2026"`). |
| `nom` | Son nom, pour s'y retrouver. |
| `habillage` | Spéciaux seulement : le dessin à utiliser (ex. `"football"`). |
| `actif` | `true` : il s'affiche pendant sa période. `false` : il est désactivé. |
| `debut` | Premier jour, **dès minuit**. `MM-JJ` (saisons, récurrents) ou `AAAA-MM-JJ` (spéciaux). |
| `fin` | Dernier jour, **jusqu'à 23 h 59** inclus, même format. |
| `accentClair` / `accentSombre` | Couleur d'accent du thème, en apparence claire et sombre (`#RRGGBB`). |

Ce fichier est vérifié au build : une date mal écrite (`"1-10"`, `"10-32"`), une couleur
invalide, un `id` en double ou un `forcer` inconnu fait échouer `npm run build` avec un
message qui désigne le champ.

### Exemples

**Désactiver un thème** (ex. la Fête de la musique) : dans son entrée,

```json
"actif": false
```

**Changer une période** (ex. Halloween seulement la dernière semaine d'octobre) :

```json
"debut": "10-25",
"fin": "10-31"
```

Une période annuelle peut passer le 31 décembre : l'Hiver (`"12-21"` → `"03-19"`) et le
Nouvel An (`"12-31"` → `"01-02"`) le font déjà.

**Revenir au site sans habillage le reste de l'année** : désactiver les 4 saisons. Les fêtes
restent actives pendant leur période.

**Désactiver tous les thèmes d'un coup**, sans toucher à chacun :

```json
"forcer": "aucun"
```

**Garder un thème en ligne hors période** (ex. pour une démonstration) :

```json
"forcer": "nouvel-an"
```

## Comment la date est choisie

Le site est statique : le thème se décide **dans le navigateur du visiteur**, à l'ouverture
de la page, avec **sa date et son heure locales**. Il n'y a donc rien à republier quand une
période commence ou se termine : le site bascule tout seul. Le choix se fait avant
l'affichage, sans flash d'un autre thème.

## Prévisualiser un thème

Ajouter `?theme=` à l'adresse, à n'importe quelle date et sans rien modifier :

- `https://orelink.github.io/?theme=noel` : le site en habillage Noël (marche avec tous les
  `id` : `printemps`, `ete`, `automne`, `hiver`, `halloween`, `noel`, `nouvel-an`,
  `fete-musique`, ou l'`id` d'un événement spécial) ;
- `https://orelink.github.io/?theme=aucun` : le site au thème par défaut.

Fonctionne aussi en local (`npm run dev`, puis `http://localhost:4321/?theme=noel`) et sur les
pages anglaises (`/en/?theme=noel`). Cela ne vaut que pour la page ouverte. Pour voir l'autre
version (jour ou nuit), utiliser le bouton d'apparence en haut à droite.

## Ajouter un événement spécial

Quand l'habillage de son sport existe déjà, une ligne suffit dans `speciaux` :

```json
{ "id": "coupe-du-monde-2026", "nom": "Coupe du monde 2026", "habillage": "football", "actif": true, "debut": "2026-06-11", "fin": "2026-07-19", "accentClair": "#15803D", "accentSombre": "#86EFAC" }
```

Sinon, il faut d'abord dessiner l'habillage (section suivante).

## Ajouter un habillage (pour le code)

Un habillage, c'est quatre morceaux. Exemple pour `football` :

1. **Le déclarer** dans `src/lib/reglages.ts` : ajouter `'football'` à `HABILLAGES`.
2. **Son décor** dans `src/components/habillages/Football.astro`, sur le modèle des autres :
   un bloc `decor decor-football` qui contient deux parties, `decor-jour` (affichée en
   apparence claire) et `decor-nuit` (en apparence sombre). Le site choisit tout seul la
   bonne partie ; le décor entier reste caché tant que l'habillage n'est pas actif. L'ajouter
   dans le `.backdrop` de `src/layouts/Base.astro`, avec les autres. Penser à ce qui a du sens
   à chaque moment : pas de chauves-souris en plein jour, pas de soleil la nuit…
   - Positions « au hasard » mais fixes : `hasard(graine)` de `src/lib/decor.ts`.
   - Étoiles et neige toutes faites : `<Etoiles />` et `<Flocons />`.
   - Moins d'éléments sur téléphone : la classe `is-wide` les masque sous 36rem.
3. **Ses couleurs et animations** dans `src/styles/habillages/football.css`, sur le modèle des
   autres : les jetons du fond (`--light`, `--shade-1`, `--shade-2`) en clair et en sombre
   sous `:root[data-habillage="football"]`, la règle
   `[data-habillage="football"] .decor-football { display: block; }`, puis le style des
   éléments. Mettre les animations dans `@media (prefers-reduced-motion: no-preference)`.
   L'importer en tête de `src/styles/global.css`, avec les autres. Les pièces communes
   (scintillement, chutes, neige) sont dans `commun.css`.
4. **Sa période** dans `src/data/themes.json` : une entrée de saison ou de récurrent avec
   `"id": "football"`, ou un événement spécial avec `"habillage": "football"`.

## Fichiers

| Fichier | Contenu |
|---|---|
| `src/data/themes.json` | Activation, dates et couleurs d'accent de tous les thèmes |
| `src/lib/reglages.ts` | Liste des habillages existants (`HABILLAGES`) et vérification de `themes.json` |
| `src/layouts/Base.astro` | Le petit script qui choisit le thème selon la date et les priorités (dans `<head>`) |
| `src/components/habillages/*.astro` | Le décor jour et nuit de chaque habillage, plus `Etoiles` et `Flocons` (partagés) |
| `src/styles/habillages/*.css` | Fond, décor et animations de chaque habillage ; `commun.css` pour les pièces partagées |
| `src/lib/decor.ts` | Positions pseudo-aléatoires (graine fixe) des éléments de décor |
| `src/scripts/ui.ts` | Feux d'artifice et année des ballons du Nouvel An |
| `src/styles/global.css` | Bascule jour / nuit des décors (règles `.decor-jour` / `.decor-nuit`) |
| `src/styles/tokens.css` | Le thème par défaut, en clair et en sombre |
