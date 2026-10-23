import type { CollectionEntry } from 'astro:content';
import { ordre } from './dates';
import { t } from './reglages';

type Projet = CollectionEntry<'projets'>;

// L'état d'un projet se lit par un mot (réglable dans site.json) et une forme ; la couleur ne fait
// que l'accompagner.
export const STATUTS = {
  'en-ligne': { mot: t.statuts['en-ligne'], ton: 'ok' },
  'en-cours': { mot: t.statuts['en-cours'], ton: 'soon' },
  archive: { mot: t.statuts.archive, ton: 'none' },
} as const;

/** `ordre` d'abord (le plus petit en tête), puis du plus récent au plus ancien. */
export function trierProjets(projets: Projet[]): Projet[] {
  return [...projets].sort(
    (a, b) =>
      (a.data.ordre ?? Infinity) - (b.data.ordre ?? Infinity) || ordre(b.data.date) - ordre(a.data.date),
  );
}
