// Dates au format « AAAA-MM » ou « AAAA » ; null = « aujourd'hui » (poste ou mission en cours).
// Affichage à la LinkedIn : « mars 2024 – aujourd'hui · 2 ans 8 mois » ; en anglais
// « Mar 2024 – Present · 2 yrs 8 mos ».
import type { Langue } from './i18n';

const FORMATS = {
  fr: {
    nomsMois: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    aujourdhui: 'aujourd’hui',
    ans: (n: number) => `${n} an${n > 1 ? 's' : ''}`,
    mois: (n: number) => `${n} mois`,
  },
  en: {
    nomsMois: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    aujourdhui: 'Present',
    ans: (n: number) => `${n} yr${n > 1 ? 's' : ''}`,
    mois: (n: number) => `${n} mo${n > 1 ? 's' : ''}`,
  },
} satisfies Record<Langue, unknown>;

const lire = (d: string) => {
  const [annee, mois] = d.split('-').map(Number);
  return { annee, mois: mois || null };
};

/** "2024-03" → "mars 2024" ; "2019" → "2019" ; null → "aujourd'hui". */
export function dateLisible(d: string | null | undefined, langue: Langue = 'fr'): string {
  const f = FORMATS[langue];
  if (!d) return f.aujourdhui;
  const { annee, mois } = lire(d);
  return mois ? `${f.nomsMois[mois - 1]} ${annee}` : String(annee);
}

/** "mars 2024 – aujourd'hui". Une seule date si début et fin sont identiques. */
export function periode(debut: string | undefined, fin: string | null | undefined, langue: Langue = 'fr'): string {
  if (!debut) return fin ? dateLisible(fin, langue) : '';
  if (fin === debut) return dateLisible(debut, langue);
  return `${dateLisible(debut, langue)} – ${dateLisible(fin, langue)}`;
}

/** Nombre de mois, bornes comprises (comme LinkedIn : de mars à mars = 1 mois). */
export function nbMois(debut: string, fin: string | null, maintenant = new Date()): number {
  const a = lire(debut);
  const b = fin ? lire(fin) : { annee: maintenant.getFullYear(), mois: maintenant.getMonth() + 1 };
  return (b.annee - a.annee) * 12 + ((b.mois ?? 12) - (a.mois ?? 1)) + 1;
}

/** 32 → "2 ans 8 mois" ; 12 → "1 an" ; 3 → "3 mois". */
export function dureeLisible(mois: number, langue: Langue = 'fr'): string {
  const f = FORMATS[langue];
  const ans = Math.floor(mois / 12);
  const reste = mois % 12;
  const parts = [];
  if (ans) parts.push(f.ans(ans));
  if (reste || !ans) parts.push(f.mois(Math.max(reste, 1)));
  return parts.join(' ');
}

export const duree = (debut: string, fin: string | null, langue: Langue = 'fr', maintenant?: Date) =>
  dureeLisible(nbMois(debut, fin, maintenant), langue);

/** Valeur triable : la plus récente est la plus grande ; null (en cours) passe devant. */
export function ordre(d: string | null | undefined): number {
  if (d === null) return Number.POSITIVE_INFINITY;
  if (!d) return Number.NEGATIVE_INFINITY;
  const { annee, mois } = lire(d);
  return annee * 12 + (mois ?? 1);
}

/** Copie triée du plus récent au plus ancien. */
export function plusRecentsDabord<T>(items: T[], cle: (item: T) => string | null | undefined): T[] {
  return [...items].sort((x, y) => ordre(cle(y)) - ordre(cle(x)));
}
