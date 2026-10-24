// Liens internes et fichiers de public/, préfixés par la base du site (astro.config.mjs).
import { PAR_DEFAUT, type Langue } from './i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** "projets/terminus/" → "/projets/terminus/" (avec la base du site) ; en anglais → "/en/projets/terminus/". */
export const url = (chemin = '', langue: Langue = PAR_DEFAUT) =>
  `${BASE}/${langue === PAR_DEFAUT ? '' : `${langue}/`}${chemin.replace(/^\//, '')}`;

/** Un fichier de public/ ("logos/acme.png"), ou une URL complète laissée telle quelle. */
export const asset = (chemin: string) => (/^https?:\/\//.test(chemin) ? chemin : `${BASE}/${chemin.replace(/^\//, '')}`);
