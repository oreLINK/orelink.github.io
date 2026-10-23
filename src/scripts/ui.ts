// Comportements de la page : thème clair ou sombre, apparition au défilement, et durées
// « en cours » tenues à jour.

import { duree } from '../lib/dates';

const html = document.documentElement;
const THEME_KEY = 'orelink.theme';
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Thème ----------

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

document.querySelectorAll('[data-theme-toggle]').forEach((button) =>
  button.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
    syncTheme();
  }),
);
darkQuery.addEventListener('change', syncTheme);
syncTheme();

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

// ---------- Descriptions repliées : « Voir plus » / « Voir moins » ----------

const mores = [...document.querySelectorAll<HTMLElement>('[data-more]')];
const syncMore = () =>
  mores.forEach((more) => {
    if (more.classList.contains('is-open')) return;
    const text = more.querySelector<HTMLElement>('.entry-text')!;
    const clamped = text.scrollHeight > text.clientHeight + 1;
    more.classList.toggle('is-clamped', clamped);
    more.querySelector<HTMLButtonElement>('.more-toggle')!.hidden = !clamped;
  });
mores.forEach((more) => {
  const button = more.querySelector<HTMLButtonElement>('.more-toggle')!;
  button.addEventListener('click', () => {
    const open = more.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.textContent = (open ? button.dataset.labelLess : button.dataset.labelMore) ?? '';
    // En repliant, ramène le début de la tuile à l'écran s'il est passé au-dessus.
    if (!open) {
      const tile = more.closest<HTMLElement>('.role, .tile') ?? more;
      if (tile.getBoundingClientRect().top < 0) tile.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' });
    }
  });
});
syncMore();
addEventListener('resize', syncMore);
document.fonts?.ready.then(syncMore);

// ---------- Durées des postes en cours, au mois près ----------

const now = new Date();
document.querySelectorAll<HTMLElement>('[data-duree-debut]').forEach((el) => {
  el.textContent = duree(el.dataset.dureeDebut!, null, now);
});
