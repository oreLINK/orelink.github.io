// Langues du site : le français à la racine (/), l'anglais sous /en/.
// Les textes traduits vivent dans src/data/en/ : chaque fichier ne reprend que les champs à
// traduire (repérés par `id` dans les listes qui en ont, sinon par position) ; tout le reste
// (dates, logos, liens…) vient du fichier français.

export const LANGUES = {
  fr: { nom: 'Français', drapeau: 'fr' },
  en: { nom: 'English', drapeau: 'en' },
} as const;
export type Langue = keyof typeof LANGUES;
export const PAR_DEFAUT: Langue = 'fr';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** La langue d'une page, d'après son adresse (« /en/… » → anglais). */
export const langueDe = (url: URL): Langue => (url.pathname.slice(BASE.length).startsWith('/en/') ? 'en' : 'fr');

/** Le chemin d'une page sans sa langue : « /en/projets/x/ » → « projets/x/ ». */
export const cheminSansLangue = (url: URL): string => url.pathname.slice(BASE.length).replace(/^\/(en\/)?/, '');

const traductions = import.meta.glob<unknown>('../data/en/*.json', { eager: true, import: 'default' });

/** Le fichier de traduction de src/data/en/ (ex. « experiences »), s'il existe. */
export function traductionDe(fichier: string, langue: Langue): unknown {
  if (langue === PAR_DEFAUT) return undefined;
  return traductions[`../data/${langue}/${fichier}.json`];
}

const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Pose la traduction sur la version française. Un champ inconnu ou un `id` absent du fichier
 * français fait échouer le build : une faute de frappe ne passe pas inaperçue.
 */
export function traduire<T>(base: T, trad: unknown, ou: string): T {
  if (trad === undefined) return base;
  if (Array.isArray(base) && Array.isArray(trad)) {
    // Une liste de textes (ex. compétences) est remplacée en entier.
    if (!base.some(estObjet)) return trad as T;
    const id = (x: unknown) => (estObjet(x) && typeof x.id === 'string' ? x.id : undefined);
    const parId = base.every((b) => id(b) !== undefined);
    if (parId) {
      const inconnu = trad.map(id).find((i) => i !== undefined && !base.some((b) => id(b) === i));
      if (inconnu) throw new Error(`Traduction : « ${inconnu} » n'existe pas dans la version française (${ou})`);
    }
    return base.map((item, i) =>
      parId ? traduire(item, trad.find((x) => id(x) === id(item)), `${ou}[${id(item)}]`) : traduire(item, trad[i], `${ou}[${i}]`),
    ) as T;
  }
  if (estObjet(base) && estObjet(trad)) {
    const resultat: Record<string, unknown> = { ...base };
    for (const [cle, valeur] of Object.entries(trad)) {
      if (cle === 'id') continue;
      if (!(cle in base)) throw new Error(`Traduction : champ « ${cle} » inconnu dans ${ou}`);
      resultat[cle] = traduire(base[cle], valeur, `${ou}.${cle}`);
    }
    return resultat as T;
  }
  return trad as T;
}
