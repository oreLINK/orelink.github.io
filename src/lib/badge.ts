// Badge « Made by ore_link » à poser sur d'autres sites, pour la page /madeby/ : le code
// HTML (avec son CSS, sans JavaScript) et une version image SVG, pour chaque thème, avec ou sans
// bouton Buy Me a Coffee. Une seule source : l'aperçu de la page et ce qu'on copie sont le même code.

export const THEMES_BADGE = ['auto', 'clair', 'sombre', 'accent'] as const;
export type ThemeBadge = (typeof THEMES_BADGE)[number];

export type Variante = { theme: ThemeBadge; cafe: boolean };
type Liens = { portfolio: string; bmc: string; logoBmc: string }; // adresses du portfolio, de la page café, du logo

/** Identifiant d'une variante : « auto-cafe », « clair-seul »… */
export const idVariante = ({ theme, cafe }: Variante) => `${theme}-${cafe ? 'cafe' : 'seul'}`;

// Couleurs : « sombre » est le badge noir, « clair » le blanc ; « auto » passe de l'un à l'autre
// selon l'appareil (noir sur un appareil en clair, blanc en sombre), comme les badges Apple.
const COULEURS = {
  sombre: { bg: '#000000', fg: '#FFFFFF', muted: '#C8CCD4', line: '#8E9199', sep: '#9DB1FF', iconBg: '#2F54D4', iconFg: '#FFFFFF', glow: 'rgb(47 84 212 / 0.55)' },
  clair: { bg: '#FFFFFF', fg: '#111318', muted: '#4E535E', line: '#111318', sep: '#2F54D4', iconBg: '#2F54D4', iconFg: '#FFFFFF', glow: 'rgb(47 84 212 / 0.14)' },
  accent: { bg: '#2F54D4', fg: '#FFFFFF', muted: '#DCE3FF', line: '#2F54D4', sep: '#C3D1FF', iconBg: '#FFFFFF', iconFg: '#2F54D4', glow: 'rgb(255 255 255 / 0.28)' },
};
type Couleurs = (typeof COULEURS)['sombre'];
const autoSombre = { ...COULEURS.clair, line: '#FFFFFF' }; // badge blanc d'un appareil en sombre

const vars = (c: Couleurs) =>
  `--ob-bg: ${c.bg}; --ob-fg: ${c.fg}; --ob-muted: ${c.muted}; --ob-line: ${c.line}; --ob-sep: ${c.sep};\n` +
  `    --ob-icon-bg: ${c.iconBg}; --ob-icon-fg: ${c.iconFg}; --ob-glow: ${c.glow};`;

/** Le CSS du badge, préfixé par .orelink-badge : il ne touche pas au site qui l'accueille, et inversement. */
export const CSS_BADGE = `  .orelink-badge {
    ${vars(COULEURS.sombre)}
    box-sizing: border-box; display: inline-flex; align-items: center; gap: 6px; padding: 4px; margin: 0;
    vertical-align: middle; border-radius: 16px; text-align: left;
    font: 600 16px/1 "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: radial-gradient(120% 160% at 0% 0%, var(--ob-glow), transparent 60%), var(--ob-bg);
    box-shadow: inset 0 0 0 1px var(--ob-line), 0 10px 26px -14px rgb(17 19 24 / 0.45);
    -webkit-font-smoothing: antialiased;
  }
  .orelink-badge[data-theme="clair"] {
    ${vars(COULEURS.clair)}
  }
  @media (prefers-color-scheme: dark) {
    .orelink-badge[data-theme="auto"], .orelink-badge:not([data-theme]) {
      ${vars(autoSombre)}
    }
  }
  .orelink-badge[data-theme="accent"] {
    ${vars(COULEURS.accent)}
  }
  .orelink-badge *, .orelink-badge *::before, .orelink-badge *::after { box-sizing: border-box; margin: 0; }
  .orelink-badge a { color: var(--ob-fg); text-decoration: none; border: 0; background: none; box-shadow: none; }
  .orelink-badge svg, .orelink-badge img { border: 0; padding: 0; margin: 0; background: none; box-shadow: none; max-width: none; border-radius: 0; }
  .orelink-badge a:focus-visible { outline: 2px solid var(--ob-sep); outline-offset: 2px; }
  .orelink-badge .orelink-badge__main { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 4px 12px 4px 4px; border-radius: 12px; }
  .orelink-badge .orelink-badge__mark { display: block; width: 36px; height: 36px; flex: none; }
  .orelink-badge .orelink-badge__mark-bg { fill: var(--ob-icon-bg); }
  .orelink-badge .orelink-badge__mark-o { fill: none; stroke: var(--ob-icon-fg); stroke-width: 5; }
  .orelink-badge .orelink-badge__mark-u { fill: var(--ob-icon-fg); }
  .orelink-badge .orelink-badge__text { display: flex; flex-direction: column; gap: 3px; }
  .orelink-badge .orelink-badge__small { font-size: 10.5px; font-weight: 600; letter-spacing: 0.01em; color: var(--ob-muted); }
  .orelink-badge .orelink-badge__big { font: 600 18px/1 "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace; letter-spacing: -0.03em; color: var(--ob-fg); white-space: nowrap; }
  .orelink-badge .orelink-badge__sep { color: var(--ob-sep); font-weight: 700; }
  .orelink-badge .orelink-badge__cafe { display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; border-radius: 12px; background: #FFDD00; }
  .orelink-badge .orelink-badge__cafe:hover { background: #FFE433; }
  .orelink-badge .orelink-badge__bmc { display: block; width: auto; height: 22px; max-width: none; flex: none; }
`;

/** Le badge seul (sans son CSS). */
export function badgeHtml({ theme, cafe }: Variante, { portfolio, bmc, logoBmc }: Liens): string {
  const lignes = [
    `<div class="orelink-badge" data-theme="${theme}">`,
    `  <a class="orelink-badge__main" href="${portfolio}" target="_blank" rel="noopener">`,
    `    <svg class="orelink-badge__mark" viewBox="0 0 64 64" aria-hidden="true"><rect class="orelink-badge__mark-bg" width="64" height="64" rx="14"/><circle class="orelink-badge__mark-o" cx="22" cy="33" r="8.5"/><rect class="orelink-badge__mark-u" x="35" y="41" width="17" height="5" rx="1"/></svg>`,
    `    <span class="orelink-badge__text"><span class="orelink-badge__small">Made by</span><span class="orelink-badge__big">ore<span class="orelink-badge__sep">_</span>link</span></span>`,
    `  </a>`,
  ];
  if (cafe) {
    lignes.push(
      `  <a class="orelink-badge__cafe" href="${bmc}" target="_blank" rel="noopener">`,
      `    <img class="orelink-badge__bmc" src="${logoBmc}" width="107" height="22" alt="Buy me a coffee">`,
      `  </a>`,
    );
  }
  lignes.push(`</div>`);
  return lignes.join('\n');
}

/** Le bloc à copier : un commentaire de mode d'emploi, le badge et son CSS. */
export function codeHtml(variante: Variante, liens: Liens): string {
  return [
    `<!-- Badge « Made by ore_link » · ${liens.portfolio}`,
    `     data-theme : "auto" (suit le thème de l'appareil), "clair", "sombre" ou "accent". -->`,
    badgeHtml(variante, liens),
    `<style>`,
    CSS_BADGE + `</style>`,
  ].join('\n');
}

// ---------- Version image (SVG) ----------
// Pour les endroits qui n'acceptent pas le HTML (README, Markdown, outils de design). Une image SVG
// ne charge rien d'extérieur : le logo Buy Me a Coffee y est donc intégré, à la place de LOGO_BMC.

export const LOGO_BMC = '%LOGO_BMC%';
const H = 52;
const LARGEUR_SEUL = 154;
const LARGEUR_CAFE = 295;

const reglesSvg = (c: Couleurs) =>
  `.bg{fill:${c.bg}}.line{stroke:${c.line}}.small{fill:${c.muted}}.big{fill:${c.fg}}.sep{fill:${c.sep}}` +
  `.mbg{fill:${c.iconBg}}.mo{stroke:${c.iconFg}}.mu{fill:${c.iconFg}}.glow{stop-color:${c.glow}}`;

/** Le badge en image SVG, autonome (le logo café est à insérer à la place de LOGO_BMC). */
export function badgeSvg({ theme, cafe }: Variante): string {
  const l = cafe ? LARGEUR_CAFE : LARGEUR_SEUL;
  const couleurs = theme === 'auto' ? COULEURS.sombre : COULEURS[theme];
  const style =
    reglesSvg(couleurs) +
    (theme === 'auto' ? `@media (prefers-color-scheme: dark){${reglesSvg(autoSombre)}}` : '') +
    `text{font-weight:600}.small{font:600 10.5px "Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}` +
    `.big{font:600 18px "JetBrains Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace;letter-spacing:-0.54px}.sep{font-weight:700}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${H}" viewBox="0 0 ${l} ${H}" role="img" aria-label="Made by ore_link${cafe ? ' · Buy me a coffee' : ''}">`,
    `<style>${style}</style>`,
    `<defs><radialGradient id="orelink-badge-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(${l * 1.2} ${H * 1.6})"><stop class="glow" offset="0"/><stop class="glow" offset="0.6" stop-opacity="0"/></radialGradient></defs>`,
    `<rect class="bg" width="${l}" height="${H}" rx="16"/>`,
    `<rect width="${l}" height="${H}" rx="16" fill="url(#orelink-badge-glow)"/>`,
    `<rect class="line" x="0.5" y="0.5" width="${l - 1}" height="${H - 1}" rx="15.5" fill="none"/>`,
    `<svg x="8" y="8" width="36" height="36" viewBox="0 0 64 64"><rect class="mbg" width="64" height="64" rx="14"/><circle class="mo" cx="22" cy="33" r="8.5" fill="none" stroke-width="5"/><rect class="mu" x="35" y="41" width="17" height="5" rx="1"/></svg>`,
    `<text class="small" x="54" y="19">Made by</text>`,
    `<text class="big" x="54" y="38">ore<tspan class="sep">_</tspan>link</text>`,
    ...(cafe
      ? [`<rect x="160" y="4" width="131" height="44" rx="12" fill="#FFDD00"/>`, `<svg x="172" y="15" width="107" height="22" viewBox="0 0 195 40">${LOGO_BMC}</svg>`]
      : []),
    `</svg>`,
  ].join('\n');
}

/**
 * Le contenu du logo officiel Buy Me a Coffee (public/logos/buymeacoffee.svg), prêt à intégrer :
 * sans sa balise <svg>, coordonnées arrondies au centième (invisible à cette taille), et des
 * identifiants propres au badge pour ne pas entrer en conflit avec la page qui l'accueille.
 */
export function logoBmcIntegre(svgOfficiel: string): string {
  return svgOfficiel
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/-?\d+\.\d+/g, (n) => Number(n).toFixed(2).replace(/\.?0+$/, ''))
    .replace(/clip0_\w+/g, 'orelink-bmc-a')
    .replace(/clip1_\w+/g, 'orelink-bmc-b')
    .replace(/\s*\n\s*/g, '');
}
