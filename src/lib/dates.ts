// Dates au format « AAAA-MM » ou « AAAA » ; null = « aujourd'hui » (poste ou mission en cours).
// Affichage à la LinkedIn : « mars 2024 – aujourd'hui · 2 ans 8 mois ».
import site from '../data/site.json';

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const lire = (d: string) => {
  const [annee, mois] = d.split('-').map(Number);
  return { annee, mois: mois || null };
};

/** "2024-03" → "mars 2024" ; "2019" → "2019" ; null → "aujourd'hui". */
export function dateLisible(d: string | null | undefined): string {
  if (!d) return site.textes.aujourdhui;
  const { annee, mois } = lire(d);
  return mois ? `${MOIS[mois - 1]} ${annee}` : String(annee);
}

/** "mars 2024 – aujourd'hui". Une seule date si début et fin sont identiques. */
export function periode(debut: string | undefined, fin: string | null | undefined): string {
  if (!debut) return fin ? dateLisible(fin) : '';
  if (fin === debut) return dateLisible(debut);
  return `${dateLisible(debut)} – ${dateLisible(fin)}`;
}

/** Nombre de mois, bornes comprises (comme LinkedIn : de mars à mars = 1 mois). */
export function nbMois(debut: string, fin: string | null, maintenant = new Date()): number {
  const a = lire(debut);
  const b = fin ? lire(fin) : { annee: maintenant.getFullYear(), mois: maintenant.getMonth() + 1 };
  return (b.annee - a.annee) * 12 + ((b.mois ?? 12) - (a.mois ?? 1)) + 1;
}

/** 32 → "2 ans 8 mois" ; 12 → "1 an" ; 3 → "3 mois". */
export function dureeLisible(mois: number): string {
  const ans = Math.floor(mois / 12);
  const reste = mois % 12;
  const parts = [];
  if (ans) parts.push(`${ans} an${ans > 1 ? 's' : ''}`);
  if (reste || !ans) parts.push(`${Math.max(reste, 1)} mois`);
  return parts.join(' ');
}

export const duree = (debut: string, fin: string | null, maintenant?: Date) =>
  dureeLisible(nbMois(debut, fin, maintenant));

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
