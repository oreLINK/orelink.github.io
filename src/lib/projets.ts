import { getCollection, type CollectionEntry } from 'astro:content';
import { ordre } from './dates';
import type { reglages } from './reglages';

type Projet = CollectionEntry<'projets'>;
type Textes = ReturnType<typeof reglages>['t'];

// L'état d'un projet se lit par un mot (réglable dans site.json) et une forme ; la couleur ne fait
// que l'accompagner.
export const statuts = (t: Textes) =>
  ({
    'en-ligne': { mot: t.statuts['en-ligne'], ton: 'ok' },
    'en-cours': { mot: t.statuts['en-cours'], ton: 'soon' },
    archive: { mot: t.statuts.archive, ton: 'none' },
  }) as const;

/** `ordre` d'abord (le plus petit en tête), puis du plus récent au plus ancien. */
export function trierProjets(projets: Projet[]): Projet[] {
  return [...projets].sort(
    (a, b) =>
      (a.data.ordre ?? Infinity) - (b.data.ordre ?? Infinity) || ordre(b.data.date) - ordre(a.data.date),
  );
}

/** Une page par projet, avec ses voisins pour « Précédent » / « Suivant » (getStaticPaths). */
export async function pagesProjets() {
  const projets = trierProjets(await getCollection('projets'));
  return projets.map((projet, i) => ({
    params: { slug: projet.id },
    props: { projet, precedent: projets[i - 1], suivant: projets[i + 1] },
  }));
}
