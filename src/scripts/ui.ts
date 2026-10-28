// Comportements de la page : thème clair ou sombre, menu des langues, apparition au défilement,
// durées « en cours » tenues à jour, badge de la page Made by, et animations des habillages (feux
// d'artifice du Nouvel An).

import { anneeQuiCommence, duree } from '../lib/dates';
import type { Langue } from '../lib/i18n';

const html = document.documentElement;
const THEME_KEY = 'orelink.theme';
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Thème ----------
// Par défaut, celui du système. Un choix au bouton vaut pour la visite en cours (sessionStorage) ;
// il est oublié si l'on revient au thème du système, ou si le système change de thème.

const systemTheme = () => (darkQuery.matches ? 'dark' : 'light');
const effectiveTheme = () => html.dataset.theme ?? (darkQuery.matches ? 'dark' : 'light');

function syncTheme() {
  const theme = effectiveTheme();
  const bg = getComputedStyle(html).getPropertyValue('--bg').trim();
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    m.content = bg;
    m.removeAttribute('media');
  });
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((b) =>
    b.setAttribute('aria-label', (theme === 'dark' ? b.dataset.labelLight : b.dataset.labelDark) ?? ''),
  );
}

function setTheme(theme: string | null) {
  const choice = theme === systemTheme() ? null : theme;
  if (choice) html.dataset.theme = choice;
  else delete html.dataset.theme;
  try {
    if (choice) sessionStorage.setItem(THEME_KEY, choice);
    else sessionStorage.removeItem(THEME_KEY);
  } catch {
    /* stockage indisponible : le choix vaut pour cette page */
  }
  syncTheme();
}

document.querySelectorAll('[data-theme-toggle]').forEach((button) =>
  button.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    // Fondu enchaîné entre les deux thèmes là où le navigateur sait le faire.
    if (still || !document.startViewTransition) setTheme(next);
    else document.startViewTransition(() => setTheme(next));
  }),
);
darkQuery.addEventListener('change', () => setTheme(null));
syncTheme();

// ---------- Menu des langues ----------
// Un popover (fermeture au clic ailleurs et à Échap gérée par le navigateur), placé sous son bouton.

const langMenu = document.querySelector<HTMLElement>('[data-lang-menu]');
const langButton = document.querySelector<HTMLElement>('[popovertarget="menu-langue"]');
if (langMenu && langButton && 'popover' in HTMLElement.prototype) {
  const place = () => {
    const r = langButton.getBoundingClientRect();
    langMenu.style.top = `${r.bottom + scrollY + 8}px`;
    langMenu.style.right = `${document.documentElement.clientWidth - r.right}px`;
  };
  langMenu.addEventListener('beforetoggle', (e) => (e as ToggleEvent).newState === 'open' && place());
  addEventListener('resize', () => langMenu.matches(':popover-open') && place());
}

// ---------- Apparition au défilement ----------

const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window && !still) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -6% 0px' },
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

// ---------- Descriptions et sections repliées : « Voir plus » / « Voir moins » ----------

function setOpen(block: HTMLElement, button: HTMLButtonElement, open: boolean) {
  block.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  button.textContent = (open ? button.dataset.labelLess : button.dataset.labelMore) ?? '';
}

// Fait glisser la hauteur (et le fondu du bas) de `el` entre son état avant et après `change`.
// Un clic pendant le glissement repart de la hauteur atteinte.
const slides = new WeakMap<HTMLElement, Animation>();
function slide(el: HTMLElement, change: () => void) {
  if (still || !el.animate) return change();
  const from = { height: `${el.offsetHeight}px`, '--fade': getComputedStyle(el).getPropertyValue('--fade') };
  slides.get(el)?.cancel();
  change();
  el.classList.remove('is-sliding');
  const to = { height: `${el.offsetHeight}px`, '--fade': getComputedStyle(el).getPropertyValue('--fade') };
  el.classList.add('is-sliding');
  // Plus le trajet est long, plus il prend son temps (une description : ~0,35 s ; une section : ~0,7 s).
  const distance = Math.abs(parseFloat(to.height) - parseFloat(from.height));
  const duration = Math.min(700, 300 + distance * 0.2);
  const anim = el.animate([from, to], { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  slides.set(el, anim);
  anim.onfinish = () => {
    if (slides.get(el) !== anim) return;
    el.classList.remove('is-sliding');
    slides.delete(el);
  };
}

// En repliant, ramène le début du bloc (`top`) à l'écran s'il est passé au-dessus.
function wireToggle(block: HTMLElement, button: HTMLButtonElement, clip: HTMLElement, top: HTMLElement) {
  button.addEventListener('click', () => {
    const open = !block.classList.contains('is-open');
    slide(clip, () => setOpen(block, button, open));
    if (!open && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
  });
}

const mores = [...document.querySelectorAll<HTMLElement>('[data-more]')];
const syncMore = () =>
  mores.forEach((more) => {
    if (more.classList.contains('is-open')) return;
    const text = more.querySelector<HTMLElement>('.entry-text')!;
    const clamped = text.scrollHeight > text.clientHeight + 1;
    more.classList.toggle('is-clamped', clamped);
    more.querySelector<HTMLButtonElement>('.more-toggle')!.hidden = !clamped;
  });
mores.forEach((more) =>
  wireToggle(
    more,
    more.querySelector<HTMLButtonElement>('.more-toggle')!,
    more.querySelector<HTMLElement>('.entry-text')!,
    more.closest<HTMLElement>('.role, .tile') ?? more,
  ),
);

// Une section n'est repliée que si cela cache au moins FOLD_SLACK pixels : replier pour quelques
// lignes n'apporterait rien.
const FOLD_SLACK = 100;
const folds = [...document.querySelectorAll<HTMLElement>('[data-fold]')];
const syncFolds = () =>
  folds.forEach((fold) => {
    if (fold.classList.contains('is-open')) return;
    const max = parseFloat(getComputedStyle(fold).getPropertyValue('--fold-max'));
    const list = fold.querySelector<HTMLElement>('.fold-body > *')!;
    const clamped = list.offsetHeight > max + FOLD_SLACK;
    fold.classList.toggle('is-clamped', clamped);
    fold.querySelector<HTMLButtonElement>('.fold-toggle')!.hidden = !clamped;
  });
folds.forEach((fold) => {
  const body = fold.querySelector<HTMLElement>('.fold-body')!;
  const button = fold.querySelector<HTMLButtonElement>('.fold-toggle')!;
  wireToggle(fold, button, body, fold.closest<HTMLElement>('.section') ?? fold);
  // Au clavier, un élément caché sous le pli qui reçoit le focus ouvre la section.
  fold.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (!fold.classList.contains('is-clamped') || fold.classList.contains('is-open') || !body.contains(target)) return;
    if (body.scrollTop > 0 || target.getBoundingClientRect().bottom > body.getBoundingClientRect().bottom) {
      setOpen(fold, button, true);
      body.scrollTop = 0;
    }
  });
});

// Les descriptions d'abord : leur repli change la hauteur des sections.
const syncFolding = () => {
  syncMore();
  syncFolds();
};
syncFolding();
addEventListener('resize', syncFolding);
document.fonts?.ready.then(syncFolding);

// ---------- Langues : niveau en bulle au survol, au focus ou au toucher ----------

const langs = [...document.querySelectorAll<HTMLElement>('[data-lang]')];
const TIP_MARGIN = 8; // px gardés entre la bulle et le bord de l'écran

function showTip(lang: HTMLElement, show: boolean) {
  if (show) langs.forEach((other) => other !== lang && showTip(other, false));
  lang.classList.toggle('is-open', show);
  if (!show) return;
  // Centrée sur le drapeau, la bulle est décalée si elle sortirait de l'écran.
  const tip = lang.querySelector<HTMLElement>('.lang-tip')!;
  tip.style.removeProperty('--shift');
  const r = tip.getBoundingClientRect();
  const shift = Math.max(TIP_MARGIN - r.left, 0) + Math.min(innerWidth - TIP_MARGIN - r.right, 0);
  tip.style.setProperty('--shift', `${shift}px`);
}

langs.forEach((lang) => {
  const button = lang.querySelector<HTMLButtonElement>('.lang-flag')!;
  lang.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && showTip(lang, true));
  lang.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && showTip(lang, false));
  button.addEventListener('focus', () => showTip(lang, true));
  button.addEventListener('blur', () => showTip(lang, false));
  button.addEventListener('click', () => showTip(lang, true)); // au toucher, sans focus sur iOS
});
// Un toucher ailleurs ou Échap referme la bulle.
document.addEventListener('click', (e) => {
  if (!(e.target as Element).closest('[data-lang]')) langs.forEach((l) => showTip(l, false));
});
document.addEventListener('keydown', (e) => e.key === 'Escape' && langs.forEach((l) => showTip(l, false)));

// ---------- Page Made by : choix du badge et copie ----------
// Le code de chaque variante est dans la page (JSON, voir src/vues/MadeBy.astro) : on affiche celui du
// thème et du café choisis, et on le copie tel quel (HTML) ou en image SVG, logo du café réinséré.

const madeBy = document.querySelector<HTMLElement>('[data-made-by]');
const donneesBadge = document.querySelector<HTMLElement>('[data-variantes]');
if (madeBy && donneesBadge) {
  type Donnees = { repere: string; logoBmc: string; variantes: Record<string, { html: string; svg: string }> };
  const { repere, logoBmc, variantes }: Donnees = JSON.parse(donneesBadge.textContent ?? '{}');
  const choix = { theme: 'auto', cafe: true };
  const id = () => `${choix.theme}-${choix.cafe ? 'cafe' : 'seul'}`;
  const code = madeBy.querySelector<HTMLElement>('[data-code]')!;
  const presser = (selecteur: string, actif: (b: HTMLElement) => boolean) =>
    madeBy.querySelectorAll<HTMLElement>(selecteur).forEach((b) => b.setAttribute('aria-pressed', String(actif(b))));
  const afficher = () => {
    code.textContent = variantes[id()].html;
    presser('[data-theme-badge]', (b) => b.dataset.themeBadge === choix.theme);
    presser('[data-cafe]', (b) => (b.dataset.cafe === '1') === choix.cafe);
    madeBy.querySelectorAll<HTMLElement>('[data-variante]').forEach((li) => li.classList.toggle('is-selected', li.dataset.variante === id()));
  };
  madeBy.querySelectorAll<HTMLElement>('[data-theme-badge]').forEach((b) =>
    b.addEventListener('click', () => {
      choix.theme = b.dataset.themeBadge ?? 'auto';
      afficher();
    }),
  );
  madeBy.querySelectorAll<HTMLElement>('[data-cafe]').forEach((b) =>
    b.addEventListener('click', () => {
      choix.cafe = b.dataset.cafe === '1';
      afficher();
    }),
  );
  // « Copié » remplace un instant le libellé du bouton.
  madeBy.querySelectorAll<HTMLButtonElement>('[data-copier]').forEach((bouton) => {
    const libelle = bouton.querySelector('span')!;
    const initial = libelle.textContent;
    let minuterie = 0;
    bouton.addEventListener('click', async () => {
      const v = variantes[id()];
      try {
        await navigator.clipboard.writeText(bouton.dataset.copier === 'svg' ? v.svg.replace(repere, logoBmc) : v.html);
      } catch {
        return; // presse-papiers refusé : le code reste sélectionnable à la main
      }
      libelle.textContent = bouton.dataset.labelCopie ?? initial;
      clearTimeout(minuterie);
      minuterie = window.setTimeout(() => (libelle.textContent = initial), 1600);
    });
  });
}

// ---------- Liens externes : dans un nouvel onglet ----------
// Les liens internes du site sont relatifs (« /projets/… ») : une adresse complète (https://…) mène
// toujours ailleurs, même sur le même domaine (ex. les projets en ligne sous orelink.github.io).

document.querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]').forEach((a) => {
  a.target = '_blank';
  a.relList.add('noopener');
});

// ---------- Durées des postes en cours, au mois près ----------

const now = new Date();
document.querySelectorAll<HTMLElement>('[data-duree-debut]').forEach((el) => {
  el.textContent = duree(el.dataset.dureeDebut!, null, html.lang as Langue, now);
});

// ---------- Nouvel An : ballons aux chiffres de l'année, feux d'artifice ----------

// Les ballons sont posés au build : on les remet à l'année du jour de la visite.
document.querySelectorAll('[data-annee] text').forEach((texte, i) => {
  texte.textContent = String(anneeQuiCommence(now))[i] ?? '';
});

// Une fusée monte en laissant une traînée, puis éclate en gerbe : pivoine (sphère colorée), saule
// (or, longues retombées), anneau ou crépitement (étincelles qui scintillent). Les étincelles
// subissent la gravité et le frottement de l'air ; le canvas s'efface un peu à chaque image, ce
// qui dessine les traînées. Ne tourne que si l'habillage Nouvel An est affiché en apparence
// sombre, page visible et mouvement accepté ; sinon le canvas reste vide.
const feux = document.querySelector<HTMLCanvasElement>('[data-feux]');
if (feux && !still) {
  const ctx = feux.getContext('2d')!;
  const COULEURS = ['252 211 77', '249 168 212', '103 232 249', '255 255 255', '196 181 253', '134 239 172', '253 164 175'];
  const GRAVITE = 0.045;
  const MAX_ETINCELLES = 900;
  type Fusee = { x: number; y: number; vx: number; vy: number; cible: number; couleur: string };
  type Etincelle = { x: number; y: number; px: number; py: number; vx: number; vy: number; vie: number; usure: number; frottement: number; gravite: number; couleur: string; crepite: boolean; epaisseur: number };

  let largeur = 0;
  let hauteur = 0;
  let fusees: Fusee[] = [];
  let etincelles: Etincelle[] = [];
  let prochaine = 0;
  let precedent = 0;
  let boucle = 0;
  const hasard = (a: number, b: number) => a + Math.random() * (b - a);
  const choisir = <T>(liste: T[]) => liste[Math.floor(Math.random() * liste.length)];
  // Le canvas n'est affiché (offsetParent) qu'avec l'habillage Nouvel An en apparence sombre.
  const actif = () => !document.hidden && feux.offsetParent !== null;

  const dimensionner = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    largeur = feux.clientWidth;
    hauteur = feux.clientHeight;
    feux.width = largeur * dpr;
    feux.height = hauteur * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const lancer = () => {
    const cible = hauteur * hasard(0.1, 0.42);
    const depart = hauteur + 8;
    fusees.push({ x: largeur * hasard(0.12, 0.88), y: depart, cible, vx: hasard(-0.4, 0.4), vy: -Math.sqrt(2 * GRAVITE * 1.6 * (depart - cible)), couleur: choisir(COULEURS) });
  };

  const eclater = (f: Fusee) => {
    const type = choisir(['pivoine', 'pivoine', 'saule', 'anneau', 'crepitement']);
    const n = type === 'anneau' ? 46 : type === 'saule' ? 70 : 84;
    const couleur = type === 'saule' ? '253 214 120' : f.couleur;
    const seconde = choisir(COULEURS);
    const vitesse = hasard(2.6, 3.8) * Math.min(1, Math.max(0.7, largeur / 1100));
    for (let i = 0; i < n && etincelles.length < MAX_ETINCELLES; i++) {
      const angle = type === 'anneau' ? (i / n) * Math.PI * 2 : Math.random() * Math.PI * 2;
      const v = type === 'anneau' ? vitesse : vitesse * Math.cbrt(Math.random());
      etincelles.push({
        x: f.x, y: f.y, px: f.x, py: f.y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, vie: 1,
        usure: type === 'saule' ? hasard(0.005, 0.008) : hasard(0.011, 0.017),
        frottement: type === 'saule' ? 0.972 : 0.982,
        gravite: type === 'saule' ? GRAVITE * 0.8 : GRAVITE,
        couleur: type === 'pivoine' && i % 3 === 0 ? seconde : couleur,
        crepite: type === 'crepitement',
        epaisseur: type === 'saule' ? 1.4 : 1.8,
      });
    }
    // Un bref éclair au point d'explosion.
    const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 46);
    halo.addColorStop(0, `rgb(${couleur} / 0.35)`);
    halo.addColorStop(1, 'rgb(0 0 0 / 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(f.x - 46, f.y - 46, 92, 92);
  };

  const trait = (x0: number, y0: number, x1: number, y1: number, couleur: string, alpha: number, epaisseur: number) => {
    ctx.strokeStyle = `rgb(${couleur} / ${alpha})`;
    ctx.lineWidth = epaisseur;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  const image = (maintenant: number) => {
    if (!actif()) {
      boucle = 0;
      fusees = [];
      etincelles = [];
      ctx.clearRect(0, 0, largeur, hauteur);
      return;
    }
    const k = Math.min((maintenant - (precedent || maintenant)) / 16.67, 3); // pas de temps, en images à 60 Hz
    precedent = maintenant;
    // Efface un peu l'image précédente : les traînées s'estompent.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgb(0 0 0 / ${0.16 * k})`;
    ctx.fillRect(0, 0, largeur, hauteur);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    if (maintenant > prochaine) {
      lancer();
      if (Math.random() < 0.25) lancer();
      prochaine = maintenant + hasard(900, 2300);
    }
    fusees = fusees.filter((f) => {
      const x0 = f.x;
      const y0 = f.y;
      f.vy += GRAVITE * 1.6 * k;
      f.x += f.vx * k;
      f.y += f.vy * k;
      trait(x0, y0, f.x, f.y, f.couleur, 0.9, 2);
      if (f.vy >= -0.6 || f.y <= f.cible) {
        eclater(f);
        return false;
      }
      return true;
    });
    etincelles = etincelles.filter((e) => {
      e.px = e.x;
      e.py = e.y;
      e.vx *= e.frottement ** k;
      e.vy = e.vy * e.frottement ** k + e.gravite * k;
      e.x += e.vx * k;
      e.y += e.vy * k;
      e.vie -= e.usure * k;
      if (e.vie <= 0) return false;
      trait(e.px, e.py, e.x, e.y, e.couleur, e.crepite && Math.random() >= 0.45 ? 0.08 : e.vie, e.epaisseur);
      return true;
    });
    boucle = requestAnimationFrame(image);
  };

  const relancer = () => {
    if (boucle || !actif()) return;
    dimensionner();
    precedent = 0;
    boucle = requestAnimationFrame(image);
  };
  new MutationObserver(relancer).observe(html, { attributes: true, attributeFilter: ['data-habillage', 'data-theme'] });
  darkQuery.addEventListener('change', relancer);
  document.addEventListener('visibilitychange', relancer);
  addEventListener('resize', () => boucle && dimensionner());
  relancer();
}
