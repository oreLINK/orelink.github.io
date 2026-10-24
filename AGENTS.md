# AGENTS.md

Consignes pour les agents de code (et les humains) qui travaillent sur ce dépôt. Le
fonctionnement du site pour son propriétaire est dans [README.md](README.md) ; les thèmes
saisonniers dans [THEMES.md](THEMES.md).

## Le projet

Portfolio personnel statique (Astro 5, TypeScript strict), une seule page qui défile, en
français (`/`, par défaut) et en anglais (`/en/`). Aucun framework client, aucune
dépendance d'exécution : du HTML/CSS généré au build, plus un seul script navigateur
(`src/scripts/ui.ts`). Déployé sur GitHub Pages.

## Commandes

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/ ET valide toutes les données : c'est le test du projet
npm run preview    # sert dist/ (pour vérifier le rendu final)
```

Il n'y a pas de suite de tests : **`npm run build` doit passer** après chaque changement.
Il vérifie les JSON de `src/data/` (zod), les traductions et les types. Pour un changement
visuel, vérifier aussi le rendu dans un navigateur, en clair **et** en sombre, sur
ordinateur **et** à ~390 px de large (pas de défilement horizontal).

## Où sont les choses

| Chemin | Rôle |
|---|---|
| `src/data/*.json` | Tout le contenu et les réglages (profil, expériences, formations, certifications, bénévolat, textes, thèmes). Source de vérité, en français. |
| `src/data/en/*.json` | Traduction anglaise : **uniquement les champs à traduire** (voir « Langues »). |
| `src/content/projets/*.md` | Un projet par fichier (en français seulement). |
| `src/content.config.ts` | Schémas des listes de `src/data/` et des projets. |
| `src/lib/reglages.ts` | Schémas de `site.json`, `profil.json`, `themes.json` ; `reglages(langue)` → `{ site, profil, t }`. |
| `src/lib/i18n.ts` | Langues, `langueDe(Astro.url)`, pose des traductions sur le français. |
| `src/lib/contenu.ts` | `liste(nom, langue)` : une liste de `src/data/` traduite. |
| `src/lib/dates.ts` | Dates « AAAA-MM », périodes et durées, en fr et en en. |
| `src/lib/paths.ts` | `url(chemin, langue)` pour les liens internes, `asset(chemin)` pour `public/`. |
| `src/vues/` | Pages communes aux deux langues (accueil, projet). |
| `src/pages/` | Routes seulement : `/`, `/en/`, `/projets/[slug]/`, `/en/projets/[slug]/`, 404. Elles rendent une vue. |
| `src/components/sections/` | Une section de l'accueil par fichier. |
| `src/layouts/Base.astro` | `<head>`, scripts d'avant-rendu (thème, habillage), haut de page, pied de page. |
| `src/scripts/ui.ts` | Tout le JS navigateur : thème, menu des langues, replis « Voir plus », bulles, liens externes. |
| `src/styles/tokens.css` | Jetons de design (couleurs clair/sombre, verre, rayons). |
| `src/styles/global.css` | Mise en page et composants. |
| `src/styles/habillages/`, `src/components/habillages/` | Thèmes saisonniers (Halloween…). |
| `public/logos/` | Logos d'organisations, carrés (400 × 400 de préférence). |

## Conventions

- **Français partout dans le code** : noms de fichiers, de variables, de fonctions et
  commentaires (`langue`, `periode`, `plusRecentsDabord`…). Les classes CSS sont en
  anglais court (`tile`, `entry`, `fold`, `cert`). Suivre le style du fichier modifié.
- **Commentaires** : un en-tête court par fichier ou bloc qui dit *pourquoi*, pas de
  commentaire ligne à ligne. Garder la densité actuelle.
- **Aucun texte affiché en dur** dans les composants : les libellés viennent de
  `site.json → textes` (lus via `reglages(langueDe(Astro.url)).t`), le contenu des JSON de
  `src/data/`. Un nouveau libellé = une clé dans `src/data/site.json`, dans
  `src/data/en/site.json` **et** dans le schéma de `src/lib/reglages.ts`.
- **Liens internes relatifs** via `url(…, langue)` ; ne jamais écrire une adresse complète
  vers le site lui-même. Toute adresse en `https://…` est traitée comme externe et s'ouvre
  dans un nouvel onglet (`ui.ts`).
- **Couleurs** : uniquement via les jetons de `tokens.css` (`var(--ink)`, `var(--accent)`…),
  avec leur version sombre. L'accent vient de `site.json → couleurs`.
- **Mouvement** : toute animation dans `@media (prefers-reduced-motion: no-preference)`, ou
  désactivée quand `still` est vrai dans `ui.ts`.
- **Sans JavaScript, tout reste lisible** : les états repliés/masqués ne s'appliquent que sous
  `.js` (classe posée sur `<html>` avant le rendu).
- **Accessibilité** : zones cliquables d'au moins 44 px (2.75rem), `aria-label` traduit sur
  les boutons à icône, contrastes AA en clair et en sombre.
- **Pas de nouvelle dépendance** sans demande explicite. Scripts externes interdits (polices
  auto-hébergées via `@fontsource`).

## Données et langues

- Ajouter une entrée : un objet avec un `id` unique dans le JSON concerné ; l'ordre
  d'affichage se calcule (du plus récent au plus ancien).
- La traduction (`src/data/en/<fichier>.json`) ne contient que les textes : les entrées sont
  retrouvées par `id`, les listes sans `id` (postes d'une entreprise, langues du profil) par
  position, les listes de textes (compétences) sont remplacées en entier. Un champ absent
  reste en français ; un champ ou un `id` inconnu **fait échouer le build** (c'est voulu).
- Les pages de projets ne sont pas traduites (seule l'interface autour l'est).

## Thèmes

Deux axes indépendants, détaillés dans [THEMES.md](THEMES.md) :

- **Apparence** clair/sombre : système par défaut, choix au bouton gardé pour la visite
  (`sessionStorage`).
- **Habillage** saisonnier (`src/data/themes.json`) : choisi dans le navigateur selon la date
  du visiteur ; chaque habillage a une version jour (clair) et nuit (sombre).
  Prévisualisation : `?theme=halloween` ou `?theme=aucun`.

## Git

- Travailler sur `dev`. `main` n'accepte que des PR **depuis `dev`** (CI : Build + Source dev) ;
  chaque merge dans `main` déploie sur `gh-pages`. Ne jamais pousser sur `main` ni `gh-pages`.
- Ne pas commiter ni pousser sans demande explicite.
- Ne pas commiter `dist/`, `.astro/` ni `node_modules/`.
