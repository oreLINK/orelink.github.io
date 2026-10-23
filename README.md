# Portfolio · orelink.github.io

Site statique (Astro), une seule page qui défile, pensée autant pour l'ordinateur que
pour le téléphone. Publié sur GitHub Pages à chaque merge dans `main` (voir
« Branches et mise en ligne »).

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/ (et vérifie tous les réglages)
npm run preview    # sert dist/
```

## Branches et mise en ligne

| Branche | Rôle | Qui peut y écrire |
|---|---|---|
| `dev` | développement : on y pousse son travail | tout le monde (push direct) |
| `main` | production : ce qui est en ligne | personne en direct, uniquement par PR depuis `dev` |
| `gh-pages` | le site construit (`dist/`), servi par GitHub Pages | uniquement l'action de déploiement |

Le circuit :

1. Travailler sur `dev`, pousser : la CI construit le site à chaque push.
2. Ouvrir une PR `dev` → `main`. Deux vérifications doivent passer pour pouvoir merger :
   **Build** (le site se construit) et **Source dev** (la PR part bien de `dev`).
3. Merger la PR : `.github/workflows/deploy.yml` construit `main` et publie `dist/` dans
   `gh-pages`. Le site est en ligne une à deux minutes plus tard.

Les règles sont des *rulesets* GitHub (Settings → Rules → Rulesets) :

- **main** : PR obligatoire, vérifications Build et Source dev obligatoires, ni force push ni
  suppression. Personne ne les contourne, administrateur compris.
- **gh-pages** : écriture réservée à la clé de déploiement « gh-pages deploy (GitHub
  Actions) » (Settings → Deploy keys), dont la partie privée est le secret
  `GH_PAGES_DEPLOY_KEY` de l'action. Ni force push ni suppression.

GitHub Pages sert la branche `gh-pages`, dossier `/` (Settings → Pages). Pour relancer une
mise en ligne sans changement : Actions → Deploy to gh-pages → Run workflow.

## Modifier le site : les fichiers de réglage

Tout ce qui s'affiche vient de ces fichiers. On n'a jamais besoin de toucher au code.

| Fichier | Ce qu'il règle |
|---|---|
| `src/data/profil.json` | Prénom, nom, photo, situation, disponibilité, lieu, e-mail, liens, « À propos » |
| `src/data/site.json` | Titre de l'onglet, description, couleur d'accent, **ordre et titres des sections**, tous les libellés (boutons, mentions…) |
| `src/data/experiences.json` | Expérience : une entreprise, un ou plusieurs postes |
| `src/data/formations.json` | Formation |
| `src/data/certifications.json` | Licences et certifications |
| `src/data/benevolat.json` | Bénévolat |
| `src/content/projets/*.md` | Projets : un fichier par projet (tuile de l'accueil + page de doc) |

Pour ajouter une entrée, ajouter un objet dans le tableau JSON concerné, avec un `id`
unique. L'ordre se calcule tout seul, du plus récent au plus ancien.

### `site.json`

- `sections` : l'ordre du tableau est l'ordre sur la page. `"afficher": false` masque une
  section ; `titre` change son titre. Une section vide disparaît d'elle-même.
- `couleurs.accentClair` / `couleurs.accentSombre` : la couleur des boutons et des liens,
  en thème clair et en thème sombre (`#RRGGBB`).
- `textes` : chaque libellé du site (« Me contacter », « Comment je l'ai fait », « En
  ligne »…).

### `profil.json`

- `photo` : déposer l'image dans `public/` (ex. `public/photo.jpg`) et écrire
  `"photo": "photo.jpg"`. Vide, ce sont les initiales qui s'affichent.
- `statut.ton` : couleur de la pastille de disponibilité, `ok` (vert), `soon` (orange)
  ou `none` (gris). Vider `statut.texte` masque la pastille.
- `liens.cv` : déposer `public/cv.pdf` et écrire `"cv": "cv.pdf"`. Un lien vide masque
  son bouton.

### Dates

Format `"AAAA-MM"` (ex. `"2024-03"`), ou `"AAAA"` seul pour une formation. Pour un poste
ou un bénévolat en cours, mettre `"fin": null` : la page affiche « aujourd'hui », et la
durée (« 2 ans 8 mois ») se met à jour toute seule.

### Logos d'organisations

Champ `logo` facultatif (entreprise, école, organisme) : un chemin dans `public/`
(ex. `"logos/acme.png"`) ou une URL. Sans logo, les initiales s'affichent.

### Projets

Un fichier `src/content/projets/<nom>.md` = une tuile sur l'accueil **et** une page
`/projets/<nom>/` « Comment je l'ai réalisé » :

```yaml
---
titre: Terminus
resume: Une ou deux phrases.
date: 2026-09            # début du projet
statut: en-ligne         # en-ligne | en-cours | archive
role: Projet personnel
lien: https://…          # le projet en ligne (facultatif)
depot: https://github.com/…  # le code (facultatif)
stack: [HTML, CSS]
ordre: 1                 # facultatif : force l'ordre (le plus petit d'abord)
couleur: "#E8962E"       # facultatif : couleur de la pastille du projet
---

## Le besoin
…
```

Le corps est du Markdown classique. Les titres `##` forment le sommaire de la page.

### Vérification

Tous ces fichiers sont vérifiés au build. Une date mal écrite, une couleur invalide ou
un champ manquant fait échouer `npm run build` (donc la mise en ligne), avec un message
qui désigne le fichier et le champ.

## Design

- Police : Plus Jakarta Sans, hébergée avec le site (`@fontsource-variable`), sans appel
  à un service tiers.
- `src/styles/tokens.css` : couleurs (gris neutres, clair et sombre), verre, formes.
- `src/styles/global.css` : mise en page et composants.
- Le bouton en haut à droite passe du thème clair au sombre ; le choix est gardé sur
  l'appareil. Sans choix, le site suit le réglage du système.
- Les animations s'arrêtent si l'appareil demande moins de mouvement.

## Structure

```
src/
├── data/                  # réglages et contenu (JSON)
├── content/projets/       # un .md par projet
├── content.config.ts      # vérification du contenu
├── lib/reglages.ts        # vérification de site.json et profil.json
├── layouts/Base.astro     # <head>, haut de page, pied de page
├── components/sections/   # une section par fichier
├── components/            # tuile projet, logo d'organisation, étiquettes, icônes
├── pages/                 # accueil, page de projet, 404
├── scripts/ui.ts          # thème, apparition, durées
└── styles/                # jetons et composants
```
