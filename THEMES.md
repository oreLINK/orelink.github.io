# Thèmes du site

Le site a deux réglages visuels indépendants :

| | Quoi | Qui décide |
|---|---|---|
| **Apparence** | Clair ou sombre | Le visiteur (bouton en haut à droite), sinon le réglage de son appareil |
| **Thème d'habillage** | Une ambiance saisonnière posée sur le site (Halloween…) | Le calendrier, d'après `src/data/themes.json` |

Les deux se combinent : chaque thème d'habillage existe en **deux versions**, une version
**jour** (apparence claire) et une version **nuit** (apparence sombre), chacune avec son décor
et ses animations. Quand le visiteur passe du clair au sombre, le décor change avec un fondu.

## Le thème par défaut

C'est le site tel qu'il est le reste de l'année : gris neutres, accent bleu (réglé dans
`src/data/site.json` → `couleurs`). Il s'affiche dès qu'aucun thème d'habillage n'est en
période, ou quand ils sont tous désactivés. Il n'a rien à régler ici.

## Halloween

Actif **chaque année du 1er octobre à 0 h au 31 octobre à 23 h 59**. Sobre, pour rester pro.

Dans les deux versions :

- l'accent passe au **orange citrouille** (boutons, liens, le « _ » du logo) ;
- le fond se réchauffe : un halo orange en haut à gauche, violet en bas à droite.

| | Version jour (apparence claire) | Version nuit (apparence sombre) |
|---|---|---|
| Décor | Une **toile d'araignée** très pâle en haut à gauche, avec son **araignée** au bout d'un fil | Une **lune** en croissant en haut à droite, quelques **étoiles**, des **chauves-souris** |
| Animations | L'araignée monte et descend en se balançant ; des **feuilles d'automne** tombent lentement en tournoyant | La lune luit doucement, les étoiles scintillent, deux chauves-souris planent près de la lune en battant des ailes et une troisième **traverse le ciel** de temps en temps |
| Sur téléphone | 4 feuilles au lieu de 6 | 5 étoiles au lieu de 7, une chauve-souris qui plane au lieu de deux |

Les animations s'arrêtent si l'appareil demande moins de mouvement : le décor reste affiché,
immobile. Le contenu, la mise en page et les textes ne changent pas ; le décor passe derrière.

## Les réglages : `src/data/themes.json`

```json
{
  "forcer": "",

  "themes": [
    {
      "id": "halloween",
      "nom": "Halloween",
      "actif": true,
      "debut": "10-01",
      "fin": "10-31",
      "accentClair": "#C2410C",
      "accentSombre": "#FB923C"
    }
  ]
}
```

| Champ | Rôle |
|---|---|
| `forcer` | `""` : chaque thème suit ses dates (normal). `"halloween"` : ce thème toute l'année. `"aucun"` : jamais de thème, le site reste au thème par défaut. |
| `id` | Le thème dessiné dans le code (aujourd'hui : `halloween`). Ne pas changer. |
| `nom` | Son nom, pour s'y retrouver. |
| `actif` | `true` : il s'affiche pendant sa période. `false` : il est désactivé. |
| `debut` | Premier jour, au format `MM-JJ` (`"10-01"` = 1er octobre), **dès minuit**. |
| `fin` | Dernier jour, au format `MM-JJ`, **jusqu'à 23 h 59** inclus. |
| `accentClair` / `accentSombre` | Couleur d'accent du thème, en apparence claire et sombre (`#RRGGBB`). |

Ce fichier est vérifié au build : une date mal écrite (`"1-10"`, `"10-32"`), une couleur
invalide ou un `id` inconnu fait échouer `npm run build` avec un message qui désigne le champ.

### Exemples

**Désactiver Halloween** :

```json
"actif": false
```

**Changer la période** (ex. seulement la dernière semaine d'octobre) :

```json
"debut": "10-25",
"fin": "10-31"
```

Une période peut passer le 31 décembre : `"debut": "12-15"`, `"fin": "01-05"` couvre du
15 décembre au 5 janvier.

**Désactiver tous les thèmes d'un coup**, sans toucher à chacun :

```json
"forcer": "aucun"
```

**Garder Halloween en ligne hors saison** (ex. pour une démonstration) :

```json
"forcer": "halloween"
```

## Comment la date est choisie

Le site est statique : le thème se décide **dans le navigateur du visiteur**, à l'ouverture
de la page, avec **sa date et son heure locales**. Il n'y a donc rien à republier le
1er octobre ni le 1er novembre : le site bascule tout seul. Le choix se fait avant
l'affichage, sans flash du thème par défaut.

## Prévisualiser un thème

Ajouter `?theme=` à l'adresse, à n'importe quelle date et sans rien modifier :

- `https://orelink.github.io/?theme=halloween` : le site en habillage Halloween ;
- `https://orelink.github.io/?theme=aucun` : le site au thème par défaut, même en octobre.

Fonctionne aussi en local (`npm run dev`, puis `http://localhost:4321/?theme=halloween`) et
sur les pages anglaises (`/en/?theme=halloween`). Cela ne vaut que pour la page ouverte.

## Ajouter un thème (pour le code)

Un thème d'habillage, c'est quatre morceaux. Exemple pour un thème `noel` :

1. **Le déclarer** dans `src/lib/reglages.ts` : ajouter `'noel'` à `HABILLAGES`.
2. **Son décor** dans `src/components/habillages/Noel.astro`, sur le modèle de
   `Halloween.astro` : un bloc `decor decor-noel` qui contient deux parties,
   `decor-jour` (affichée en apparence claire) et `decor-nuit` (en apparence sombre). Le
   site choisit tout seul la bonne partie ; le décor entier reste caché tant que le thème
   n'est pas actif. L'ajouter dans le `.backdrop` de `src/layouts/Base.astro`, à côté de
   `<Halloween />`. Penser à ce qui a du sens à chaque moment : pas de chauves-souris en
   plein jour, pas de soleil la nuit…
3. **Ses couleurs et animations** dans `src/styles/habillages/noel.css`, sur le modèle de
   `halloween.css` : les jetons du fond (`--light`, `--shade-1`, `--shade-2`) et du décor
   (`--decor`) en clair et en sombre sous `:root[data-habillage="noel"]`, la règle
   `[data-habillage="noel"] .decor-noel { display: block; }`, puis le style des éléments.
   Mettre les animations dans `@media (prefers-reduced-motion: no-preference)`. L'importer
   en tête de `src/styles/global.css`, à côté de `halloween.css`.
4. **Sa période** dans `src/data/themes.json` : une entrée avec `"id": "noel"`.

Si deux thèmes actifs se chevauchent, le premier de la liste l'emporte.

## Fichiers

| Fichier | Contenu |
|---|---|
| `src/data/themes.json` | Activation, dates et couleurs d'accent des thèmes |
| `src/lib/reglages.ts` | Liste des thèmes existants (`HABILLAGES`) et vérification de `themes.json` |
| `src/layouts/Base.astro` | Le petit script qui choisit le thème selon la date (dans `<head>`) |
| `src/styles/habillages/halloween.css` | Fond, décor et animations d'Halloween |
| `src/components/habillages/Halloween.astro` | Décor jour (toile, araignée, feuilles) et nuit (lune, étoiles, chauves-souris) ; nombre, taille et rythme des feuilles et des étoiles en tête du fichier |
| `src/styles/global.css` | Bascule jour / nuit des décors (règles `.decor-jour` / `.decor-nuit`) |
| `src/styles/tokens.css` | Le thème par défaut, en clair et en sombre |
