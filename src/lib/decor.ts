// Positions « au hasard » des décors d'habillage (flocons, feuilles, étoiles…). Elles sont tirées
// d'une graine fixe : identiques à chaque build, et on en obtient d'autres en changeant la graine.

export function hasard(graine: number) {
  let etat = graine >>> 0;
  // mulberry32 : petit générateur pseudo-aléatoire, suffisant pour placer un décor.
  const suivant = () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    /** Un nombre entre a et b, arrondi au dixième (ou à `decimales`). */
    entre: (a: number, b: number, decimales = 1) => Number((a + suivant() * (b - a)).toFixed(decimales)),
    /** Un élément de la liste. */
    parmi: <T>(liste: readonly T[]) => liste[Math.floor(suivant() * liste.length)],
    /** Un écart autour de 0, plus souvent petit que grand (loi normale). */
    normale: (ecart: number) => ecart * Math.sqrt(-2 * Math.log(1 - suivant())) * Math.cos(2 * Math.PI * suivant()),
  };
}

/** Variables CSS d'un élément de décor : `{ x: '12%', dur: '4s' }` → `--x: 12%; --dur: 4s`. */
export const vars = (valeurs: Record<string, string | number>) =>
  Object.entries(valeurs)
    .map(([nom, valeur]) => `--${nom}: ${valeur}`)
    .join('; ');
