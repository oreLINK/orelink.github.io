// @ts-check
import { defineConfig } from 'astro/config';

// Déploiement GitHub Pages (repo orelink.github.io → page « utilisateur », base '/').
// Pour un repo « projet » (ex. mon-portfolio), passer base à '/mon-portfolio'.
export default defineConfig({
  site: 'https://orelink.github.io',
  base: '/',
  trailingSlash: 'always',
  markdown: {
    // Coloration des blocs de code par variables CSS : elle suit les jetons du thème.
    shikiConfig: { theme: 'css-variables' },
  },
});
