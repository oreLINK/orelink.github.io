import { getCollection, type CollectionEntry } from 'astro:content';
import { ordre } from './dates';
import { url } from './paths';
import { reglages } from './reglages';
import type { Langue } from './i18n';

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

/** La page Projets et une fiche par projet, chacune si elle est affichée (getStaticPaths). */
export async function pagesProjets(langue: Langue) {
  const { affichage } = reglages(langue);
  const projets = affichage.fichesProjets ? await getCollection('projets') : [];
  return [
    ...(affichage.pageProjets ? [{ params: { chemin: undefined }, props: {} }] : []),
    ...projets.map((projet) => ({ params: { chemin: projet.id }, props: { projet } })),
  ];
}

/** Où mène un projet : sa fiche, sinon la page Projets, sinon nulle part (réglages d'affichage). */
export function lienProjet(id: string, langue: Langue): string | undefined {
  const { affichage } = reglages(langue);
  if (affichage.fichesProjets) return url(`projets/${id}/`, langue);
  if (affichage.pageProjets) return url('projets/', langue);
  return undefined;
}
