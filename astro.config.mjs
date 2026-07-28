// @ts-check
import { defineConfig } from 'astro/config';

// ── Déploiement GitHub Pages ────────────────────────────────────────────────
// 1. Page "utilisateur"  (repo nommé  <pseudo>.github.io)  ->  base: '/'
// 2. Page "projet"       (repo nommé  mon-portfolio)       ->  base: '/mon-portfolio'
//
// Adapte les deux lignes ci-dessous à ton repo, puis pousse sur `main`.
// La GitHub Action (.github/workflows/deploy.yml) fait le reste.

export default defineConfig({
  site: 'https://orelink.github.io',
  base: '/',
});
