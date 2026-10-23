// Les fichiers de réglage du site (src/data/site.json et src/data/profil.json), vérifiés au build :
// un champ manquant ou mal écrit fait échouer `npm run build` avec un message qui le désigne.
import { z } from 'astro/zod';
import siteJson from '../data/site.json';
import profilJson from '../data/profil.json';

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
  textes: z.object({
    meContacter: texte,
    aPropos: texte,
    aujourdhui: texte,
    activites: texte,
    voirPlus: texte,
    voirMoins: texte,
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
  email: z.string().email().or(z.literal('')),
  liens: z.object({ linkedin: lienOuVide, github: lienOuVide, cv: z.string() }),
  aPropos: z.string(),
});

function verifier<T>(schema: z.ZodType<T>, valeur: unknown, fichier: string): T {
  const resultat = schema.safeParse(valeur);
  if (resultat.success) return resultat.data;
  const details = resultat.error.issues.map((i) => `  - ${i.path.join('.')} : ${i.message}`).join('\n');
  throw new Error(`Réglage invalide dans ${fichier} :\n${details}`);
}

export const site = verifier(siteSchema, siteJson, 'src/data/site.json');
export const profil = verifier(profilSchema, profilJson, 'src/data/profil.json');
export const t = site.textes;
