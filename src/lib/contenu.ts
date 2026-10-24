// Les listes de src/data/ (expériences, formations…) dans une langue : la version française, avec
// la traduction de src/data/en/ posée dessus (voir i18n.ts).
import { getCollection, type CollectionEntry } from 'astro:content';
import { traduire, traductionDe, type Langue } from './i18n';

type Liste = 'experiences' | 'formations' | 'certifications' | 'benevolat';

export async function liste<C extends Liste>(nom: C, langue: Langue) {
  const entrees = (await getCollection(nom)).map((e) => ({ id: e.id, ...(e.data as CollectionEntry<C>['data']) }));
  return traduire(entrees, traductionDe(nom, langue), `src/data/${langue}/${nom}.json`);
}
