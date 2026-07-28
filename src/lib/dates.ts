// Utilitaires de dates au format "AAAA-MM" (ou null = "présent").

const fmt = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' });

/** "2024-03" -> valeur triable (nombre). null -> +Infinity (le plus récent). */
export function ordre(mois: string | null): number {
  if (mois === null) return Number.POSITIVE_INFINITY;
  const [a, m] = mois.split('-').map(Number);
  return a * 12 + (m - 1);
}

/** "2024-03" -> "mars 2024". null -> "présent". */
export function moisLisible(mois: string | null): string {
  if (mois === null) return 'présent';
  const [a, m] = mois.split('-').map(Number);
  return fmt.format(new Date(a, m - 1, 1));
}

/** "janv. 2022 — présent" */
export function periode(debut: string, fin: string | null): string {
  return `${moisLisible(debut)} — ${moisLisible(fin)}`;
}

/** Trie une liste (copie) par une date décroissante — le plus récent d'abord. */
export function parDateDesc<T>(items: T[], cle: (item: T) => string | null): T[] {
  return [...items].sort((x, y) => ordre(cle(y)) - ordre(cle(x)));
}
