// Les fichiers de réglage du site (src/data/site.json et src/data/profil.json), vérifiés au build :
// un champ manquant ou mal écrit fait échouer `npm run build` avec un message qui le désigne.
// Chaque langue a sa version : le français, avec la traduction de src/data/en/ posée dessus.
import { z } from 'astro/zod';
import siteJson from '../data/site.json';
import profilJson from '../data/profil.json';
import themesJson from '../data/themes.json';
import { traduire, traductionDe, type Langue } from './i18n';

const couleur = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur attendue : #RRGGBB');
const texte = z.string().min(1);

const siteSchema = z.object({
  meta: z.object({ titre: texte, description: texte }),
  logo: z.object({ avant: texte, separateur: texte, apres: texte }), // ore_link : le séparateur est en couleur d'accent
  couleurs: z.object({ accentClair: couleur, accentSombre: couleur }),
  sections: z.array(
    z.object({
      id: z.enum(['experience', 'projets', 'formation', 'certifications', 'benevolat']),
      titre: texte,
      afficher: z.boolean().default(true),
    }),
  ),
  hauteurSectionRepliee: z.number().int().positive(), // en pixels : au-delà, la section se replie avec « Tout afficher »
  textes: z.object({
    meContacter: texte,
    aPropos: texte,
    activites: texte,
    voirPlus: texte,
    voirMoins: texte,
    toutAfficher: texte, // bouton des sections repliées, suivi du nombre entre parenthèses
    delivreeEn: texte,
    expireEn: texte,
    expireeEn: texte,
    identifiant: texte,
    afficherCertification: texte,
    commentJeLaiFait: texte,
    commentJeLaiRealise: texte,
    voirLeProjet: texte,
    codeSource: texte,
    retour: texte,
    statut: texte,
    commenceEn: texte,
    role: texte,
    technologies: texte,
    sommaire: texte,
    precedent: texte,
    suivant: texte,
    statuts: z.object({ 'en-ligne': texte, 'en-cours': texte, archive: texte }),
    themeClair: texte,
    themeSombre: texte,
    allerAuContenu: texte,
    codeDuSite: texte,
    introuvableTitre: texte,
    introuvableTexte: texte,
    retourAccueil: texte,
    chez: texte, // « Data Engineer chez Betclic Group »
    competences: texte,
    liensExternes: texte,
    autresProjets: texte,
    changerDeLangue: texte,
  }),
  piedDePage: z.object({ lienCodeDuSite: z.string().url().or(z.literal('')) }),
});

const lienOuVide = z.string().url().or(z.literal(''));

const profilSchema = z.object({
  pseudo: z.string(), // affiché en grand ; vide = prénom et nom en grand
  prenom: texte,
  nom: texte,
  photo: z.string(), // fichier dans public/ (ex. "photo.jpg"), vide = initiales
  poste: z.object({
    titre: texte,
    entreprise: texte,
    logo: z.string(), // fichier dans public/ (ex. "logos/betclic.png") ou URL ; vide = initiales
    site: lienOuVide,
  }),
  statut: z.object({ texte: z.string(), ton: z.enum(['ok', 'soon', 'none']) }),
  localisation: z.string(),
  // Un drapeau par langue, le niveau en bulle ; `code` : un drapeau dessiné dans Drapeau.astro.
  langues: z.array(z.object({ code: z.enum(['fr', 'en', 'es']), nom: texte, niveau: texte })).default([]),
  email: z.string().email().or(z.literal('')),
  liens: z.object({ linkedin: lienOuVide, github: lienOuVide, cv: z.string() }),
  aPropos: z.string(),
});

// Thèmes d'habillage (voir THEMES.md). `id` : un habillage dessiné dans le code
// (src/styles/habillages/<id>.css et src/components/habillages/).
export const HABILLAGES = ['halloween'] as const;
const jourDeLAnnee = z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Format attendu : MM-JJ (ex. 10-31)');
const themesSchema = z.object({
  forcer: z.enum(['', 'aucun', ...HABILLAGES]), // vide = selon les dates ; « aucun » = jamais d'habillage
  themes: z.array(
    z.object({
      id: z.enum(HABILLAGES),
      nom: texte,
      actif: z.boolean(),
      debut: jourDeLAnnee, // premier jour, dès minuit (heure du visiteur)
      fin: jourDeLAnnee, // dernier jour, jusqu'à 23 h 59 ; avant `debut` = à cheval sur deux années
      accentClair: couleur,
      accentSombre: couleur,
    }),
  ),
});

function verifier<T>(schema: z.ZodType<T>, valeur: unknown, fichier: string): T {
  const resultat = schema.safeParse(valeur);
  if (resultat.success) return resultat.data;
  const details = resultat.error.issues.map((i) => `  - ${i.path.join('.')} : ${i.message}`).join('\n');
  throw new Error(`Réglage invalide dans ${fichier} :\n${details}`);
}

export const themes = verifier(themesSchema, themesJson, 'src/data/themes.json');

function charger(langue: Langue) {
  const ou = (fichier: string) => (langue === 'fr' ? `src/data/${fichier}.json` : `src/data/${fichier}.json + src/data/${langue}/${fichier}.json`);
  const site = verifier(siteSchema, traduire(siteJson, traductionDe('site', langue), ou('site')), ou('site'));
  const profil = verifier(profilSchema, traduire(profilJson, traductionDe('profil', langue), ou('profil')), ou('profil'));
  return { site, profil, t: site.textes };
}

const cache = new Map<Langue, ReturnType<typeof charger>>();

/** Réglages et textes du site dans une langue : `const { site, profil, t } = reglages(langue)`. */
export function reglages(langue: Langue) {
  if (!cache.has(langue)) cache.set(langue, charger(langue));
  return cache.get(langue)!;
}
