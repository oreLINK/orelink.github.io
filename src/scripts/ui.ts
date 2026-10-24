// Comportements de la page : thème clair ou sombre, menu des langues, apparition au défilement,
// et durées « en cours » tenues à jour.

import { duree } from '../lib/dates';
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

// ---------- Durées des postes en cours, au mois près ----------

const now = new Date();
document.querySelectorAll<HTMLElement>('[data-duree-debut]').forEach((el) => {
  el.textContent = duree(el.dataset.dureeDebut!, null, html.lang as Langue, now);
});
