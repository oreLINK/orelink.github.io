<div align="center">

# oreLINK · Portfolio

**Portfolio of Aurélien Bertrand, Data Engineer based in Bordeaux, France.**
A static site in French and English, driven entirely by data files: a profile page, a
projects page with one overview per project, and tech notes (optional).

[**orelink.github.io**](https://orelink.github.io) · [English version](https://orelink.github.io/en/)

[![Deploy](https://github.com/oreLINK/orelink.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/oreLINK/orelink.github.io/actions/workflows/deploy.yml)
[![CI](https://github.com/oreLINK/orelink.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/oreLINK/orelink.github.io/actions/workflows/ci.yml)
![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

</div>

---

## Highlights

- **Data-driven**: profile, experience, education, certifications, volunteering, labels and
  themes all live in JSON files. No content is hard-coded.
- **Validated at build time**: every file is checked against a schema (zod). A malformed
  date, an invalid color or a broken translation blocks deployment with a precise error.
- **Projects and notes**: every project has an overview page; notes (*billets*) can be
  linked to a project, are written in Markdown in both languages and come with an RSS feed.
- **Bilingual**: French at `/`, English at `/en/`, on the same page. Translation files hold
  only the text; everything else comes from the French source.
- **Light and dark**: follows the device setting, with a toggle to switch.
- **Seasonal skins**: one season is always active (spring, summer, autumn, winter), with
  holidays layered on top (Halloween, Christmas, New Year, Fête de la musique), each with a
  day and a night version. See [THEMES.md](THEMES.md).
- **Lightweight**: HTML and CSS generated at build time, a single small browser script,
  self-hosted fonts, no third-party calls.
- **Accessible**: keyboard navigation, screen-reader labels, checked contrast in both
  themes, animations disabled when the device asks for reduced motion, readable without
  JavaScript.
- **Mobile-first**, as much as desktop.

## Tech stack

| Purpose | Choice |
|---|---|
| Generator | [Astro 5](https://astro.build), fully static output |
| Language | TypeScript (strict) |
| Data | JSON and Markdown, validated with zod (Astro content collections) |
| Styling | Plain CSS: design tokens, frosted glass, View Transitions |
| Fonts | Plus Jakarta Sans, JetBrains Mono (`@fontsource`, self-hosted) |
| Hosting | GitHub Pages, deployed with GitHub Actions |

## Getting started

Requirements: **Node.js 22** and npm.

```bash
npm install
npm run dev        # dev server: http://localhost:4321
npm run build      # builds dist/ and validates all data
npm run preview    # serves dist/ to check the final output
```

`npm run build` doubles as the test suite: if it passes, the content is valid and the site
is ready to ship.

## Editing the content

Everything on the page comes from these files; the code never needs to change.

| File | Content |
|---|---|
| `src/data/profil.json` | Name, photo, job, location, spoken languages, email, links, "About" |
| `src/data/site.json` | Title and description, accent color, **section order and titles**, every UI label |
| `src/data/experiences.json` | Experience: one company, one or more positions |
| `src/data/formations.json` | Education |
| `src/data/certifications.json` | Certifications |
| `src/data/benevolat.json` | Volunteering |
| `src/content/projets/*.md` | Projects: one file per project (tile and overview page) |
| `src/content/articles/<name>/` | Notes: one folder per note, `fr.md`, optional `en.md`, images |
| `src/data/en/*.json` | English translation (text only) |
| `src/data/themes.json` | Seasonal and holiday skins, see [THEMES.md](THEMES.md) |

To add an entry, add an object with a unique `id` to the relevant array. Display order is
computed automatically, from most recent to oldest.

<details>
<summary><strong><code>site.json</code> settings</strong></summary>

- `affichage`: what is shown, set separately for `local` (`npm run dev`) and `deploye`
  (`npm run build`, i.e. the live site and `npm run preview`). Each block has the same keys:

  ```json
  "profil": { "experience": true, "formation": true, "certifications": true, "benevolat": true },
  "projets": { "aLaUne": true, "page": true, "fiches": "auto" },
  "billets": false,
  "madeBy": true
  ```

  - `profil`: the sections of the profile page.
  - `projets.aLaUne`: the "Featured projects" section of the profile page.
  - `projets.page`: the `/projets/` page, its navigation link and every link to it ("All
    projects", breadcrumb, "Back to Projects").
  - `projets.fiches`: the `/projets/<name>/` overview pages and every link to them
    ("View details"). `"auto"` (the default) follows `projets.page`. Without overviews, a
    project linked from a note points to the Projects page instead, or to nothing.
  - `billets`: the notes section (navigation link, pages, RSS feed). Notes are still
    validated at build time either way.
  - `madeBy`: the unlisted `/madeby/` page (see below).

  With only the profile left, the navigation bar disappears.
- `sections`: array order is page order; `titre` changes a section's heading. An empty
  section disappears on its own.
- `hauteurSectionRepliee`: above this height (in pixels), a section collapses behind a
  "Show all" button.
- `projetsALaUne`: how many project tiles the home page shows (the first ones by `ordre`);
  the Projects page shows them all.
- `couleurs.accentClair` / `couleurs.accentSombre`: button and link color in light and dark
  themes (`#RRGGBB`), used when no skin is active.
- `textes`: every label on the site ("Contact me", "See more"…).

</details>

<details>
<summary><strong><code>profil.json</code> settings</strong></summary>

- `photo`: put the image in `public/` (e.g. `public/img/photo.jpg`) and set
  `"photo": "img/photo.jpg"`. Leave it empty to show initials instead.
- `statut`: availability badge; `ton` is `ok` (green), `soon` (orange) or `none` (grey).
  An empty `statut.texte` hides the badge.
- `langues`: one flag per language next to the location, with `nom` and `niveau` shown in a
  tooltip. `code` is `fr`, `en` or `es` (flags drawn in `src/components/Drapeau.astro`).
- `liens.cv`: put `public/cv.pdf` in place and set `"cv": "cv.pdf"`. An empty link hides its
  button.
- `liens.buymeacoffee`: your Buy Me a Coffee page, used by the "Made by" badge. Empty: the
  badge code shows a `TON-PSEUDO` placeholder.

</details>

<details>
<summary><strong>Dates, logos and projects</strong></summary>

**Dates**: `"YYYY-MM"` format (e.g. `"2024-03"`), or `"YYYY"` alone for education. For an
ongoing position or commitment, use `"fin": null`: the page shows "Present" and the duration
("2 yrs 8 mos") updates itself.

**Logos**: optional `logo` field, a path inside `public/` (e.g. `"logos/acme.png"`) or a URL.
Square images work best (400 × 400). Without a logo, initials are shown.

**Projects**: a `src/content/projets/<name>.md` file creates a tile on the `/projets/` page
(and on the home page if it is among the first `projetsALaUne`) **and** a `/projets/<name>/`
overview page. Keep it to the big picture; the details go in notes.

```yaml
---
titre: Terminus
resume: One or two sentences.
date: 2026-09                 # project start
statut: en-ligne              # en-ligne | en-cours | archive
role: Side project
lien: https://…               # live project (optional)
depot: https://github.com/…   # source code (optional)
stack: [HTML, CSS]
ordre: 1                      # optional: forces the order (lowest first)
couleur: "#E8962E"            # optional: badge color
---

## Quelle était la situation au départ ?
## Qu'est-ce que ça fait ?
## Comment je l'ai construit, et pourquoi ?
## Comment ça tourne sans moi ?
## Qu'est-ce que j'en ai tiré ?
```

The body is plain Markdown, and each `##` heading starts its own tile on the page. Every
overview follows the same five questions, in this order:

1. **Quelle était la situation au départ ?** The context, the problem, for whom, the
   constraints (budget, data, privacy…).
2. **Qu'est-ce que ça fait ?** What the product does, ideally its three key features.
3. **Comment je l'ai construit, et pourquoi ?** Architecture and two or three decisions,
   with the options that were set aside (`###` subheadings).
4. **Comment ça tourne sans moi ?** Automation, tests, deployment, monitoring, cost.
5. **Qu'est-ce que j'en ai tiré ?** What worked, what I would do differently, what's next.
   For a project still in progress: **Où j'en suis ?**

Skip a question rather than leave it empty. Keep a page to a two- or three-minute read:
details belong in a note. Put a non-breaking space before `?`.

</details>

<details>
<summary><strong>Notes (billets)</strong></summary>

One folder per note in `src/content/articles/`; the folder name is the address
(`/articles/<name>/`, `/en/articles/<name>/`). Images go in the folder, next to the text, and
are referenced as `![Description](./chart.png)`.

`fr.md` holds the full header and the French text:

```yaml
---
titre: Forecasting powder…
resume: One or two sentences.
date: 2026-10-21            # publication date (YYYY-MM-DD)
miseAJour: 2026-11-02       # optional: last significant update
projet: bluebird            # optional: file name of the related project
sujets: [Data, Météo]       # topics: in the RSS feed only, not shown for now
brouillon: true             # optional: shown with `npm run dev`, never published
---

Text…
```

`en.md` (optional) holds only the translation: `titre`, `resume`, optionally `sujets`, and
the English text. Without it, the English page shows the French text with a notice. An
unknown project, an unknown field in `en.md` or an `en.md` without `fr.md` fails the build.

The notes section only appears when `affichage → billets` is `true` in `site.json` and at
least one note is published. Drafts count as published with `npm run dev` only: set
`affichage.local.billets` to `true` to preview them.

</details>

<details>
<summary><strong>English translation</strong></summary>

Files in `src/data/en/` contain **only the text to translate**: everything else (dates,
logos, links…) comes from the French file with the same name.

- Entries are matched by `id` (experience, education, certifications, volunteering,
  `site.json` sections).
- Lists without an `id` (positions within a company, profile languages) follow the French
  order; plain text lists (skills) are replaced as a whole.
- A missing field stays in French; an unknown field or `id` fails the build.
- Project pages are written in French only; the surrounding interface is translated.
- Notes are translated with an `en.md` next to `fr.md` (see above).

</details>

## "Made by ore_link" badge

`/madeby/` is an unlisted page (no link leads to it, `noindex`) that hands out the
badge to put on other sites: a preview of every variant (themes `auto`, `clair`, `sombre`,
`accent`, with or without the Buy Me a Coffee button), the matching HTML code, and two copy
buttons: the HTML (no JavaScript needed on the target site) or a standalone SVG image (for
READMEs and anywhere HTML is not allowed). The badge is defined once in `src/lib/badge.ts`;
the coffee logo is the official one, `public/logos/buymeacoffee.svg`.

## Architecture

```
src/
├── data/                   # content and settings (JSON); data/en/: translations
├── content/projets/        # one Markdown file per project
├── content/articles/       # one folder per note (fr.md, en.md, images)
├── content.config.ts       # data schemas
├── lib/                    # settings per language, translations, dates, links, decor
├── layouts/Base.astro      # <head>, pre-render scripts, header and footer
├── vues/                   # pages shared by both languages: profile, projects, notes
├── pages/                  # routes: /, /projets/…, /articles/… (and /en/…), 404
├── components/
│   ├── sections/           # one home page section per file
│   └── habillages/         # decor for the seasonal and holiday skins
├── scripts/ui.ts           # all browser-side JavaScript
└── styles/
    ├── tokens.css          # design tokens (light / dark)
    ├── global.css          # layout and components
    └── habillages/         # one file per skin
```

The codebase (file names, identifiers, comments) is written in French; see
[AGENTS.md](AGENTS.md) for conventions.

## Deployment

| Branch | Role | Write access |
|---|---|---|
| `dev` | Development | Direct push |
| `main` | Production, what is live | Pull requests from `dev` only |
| `gh-pages` | Built site (`dist/`), served by GitHub Pages | Deployment workflow only |

1. Work happens on `dev`; CI builds the site on every push.
2. A `dev` → `main` pull request must pass two checks: **Build** (the site builds) and
   **Source dev** (the PR comes from `dev`).
3. On merge, [`deploy.yml`](.github/workflows/deploy.yml) builds `main` and publishes `dist/`
   to `gh-pages`. The site is live one to two minutes later.

<details>
<summary><strong>Repository protection</strong></summary>

Rules are defined as GitHub *rulesets* (Settings → Rules → Rulesets):

- **main**: pull request required, Build and Source dev checks required, no force push or
  deletion. Nobody can bypass them, admins included.
- **gh-pages**: writes restricted to the "gh-pages deploy (GitHub Actions)" deploy key
  (Settings → Deploy keys), whose private key is the workflow's `GH_PAGES_DEPLOY_KEY`
  secret. No force push or deletion.

GitHub Pages serves the `gh-pages` branch, `/` folder (Settings → Pages). To redeploy
without changes: Actions → Deploy to gh-pages → Run workflow.

</details>

## Documentation

| Document | Audience |
|---|---|
| [README.md](README.md) | Project overview and content editing |
| [THEMES.md](THEMES.md) | Light / dark appearance and skins: calendar, settings, adding a theme |
| [AGENTS.md](AGENTS.md) | Code conventions, for contributors and coding agents |

## Author

**Aurélien Bertrand** (oreLINK) · Data Engineer at Betclic Group, Bordeaux
[LinkedIn](https://www.linkedin.com/in/aurelienbertrand/) · [GitHub](https://github.com/oreLINK)
