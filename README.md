# Portfolio Data Engineer — Astro

Site statique de portfolio (Data / Analytics Engineer), hébergé sur GitHub et
déployé via GitHub Pages. Toutes les données sont en JSON et validées au build.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère /dist
npm run preview    # prévisualise le build
```

## Où sont mes infos ?

Tout le contenu vit dans `src/data/` — un fichier par section :

| Fichier                     | Section       |
| --------------------------- | ------------- |
| `src/data/profil.json`      | Hero + À propos + contact |
| `src/data/experiences.json` | Expériences   |
| `src/data/formations.json`  | Formation     |
| `src/data/projets.json`     | Projets       |
| `src/data/associatif.json`  | Associatif    |

**Ajouter une entrée = ajouter un objet dans le tableau JSON concerné.** Rien
d'autre à toucher : la section affiche automatiquement la plus récente et le
panneau « voir tout » liste l'ensemble, trié par date décroissante.

Les dates sont au format `"AAAA-MM"` (ex. `"2024-03"`). Pour un poste en cours,
mettre `"dateFin": null` → il s'affiche « présent » et son nœud passe en couleur
signal.

### Validation automatique

Les schémas (`src/content.config.ts`) valident chaque entrée **au build** avec
Zod. Une date mal formée ou un champ manquant fait échouer `npm run build` avec
un message clair — impossible de déployer des données cassées.

## Personnaliser le design

Toutes les couleurs, typos et espacements sont des variables CSS en haut de
`src/styles/global.css` (bloc `:root`). Change `--signal` pour une autre couleur
d'accent, `--bg` pour le fond, etc.

Ton CV : dépose `cv.pdf` dans `public/` (référencé par `profil.json → liens.cv`).

## Déployer sur GitHub Pages

1. Dans `astro.config.mjs`, règle `site` et `base` :
   - repo `TON-PSEUDO.github.io` (page perso) → `base: '/'`
   - repo `mon-portfolio` (page projet) → `base: '/mon-portfolio'`
2. Pousse sur la branche `main`.
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Le workflow `.github/workflows/deploy.yml` build et publie automatiquement.

## Structure

```
src/
├── content.config.ts     # collections + schémas Zod (validation)
├── data/                 # ← tes infos, en JSON
├── lib/dates.ts          # tri + formatage des dates (fr-FR)
├── layouts/Base.astro    # <head>, polices, styles globaux
├── components/
│   ├── Section.astro     # nœud DAG + carte résumé + bouton « voir tout »
│   ├── BottomSheet.astro # panneau <dialog> réutilisable
│   └── EntryCard.astro   # carte (résumé/détail) pour les 4 types
├── styles/global.css     # thème « Console / DAG » (tokens en :root)
└── pages/index.astro     # assemblage de la page
```

Polices auto-hébergées via `@fontsource` (pas d'appel à Google Fonts — plus
respectueux du RGPD).
