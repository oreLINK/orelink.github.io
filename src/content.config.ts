import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

// Toutes les données sont validées au build : une date mal écrite ou un champ manquant fait
// échouer `npm run build` avec un message clair, avant toute mise en ligne.

// Une date « AAAA-MM » (ex. 2024-03) ou une année seule « AAAA » (ex. 2019).
const date = z
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Format attendu : AAAA-MM (ex. 2024-03) ou AAAA');

// Chemin d'une image dans public/ (ex. "logos/acme.png") ou URL complète.
const image = z.string().optional();
const lien = z.string().url().optional();
const competences = z.array(z.string()).default([]);

// ── Expérience : une entreprise, un ou plusieurs postes (comme sur LinkedIn) ─────────────────
const experiences = defineCollection({
  loader: file('src/data/experiences.json'),
  schema: z.object({
    entreprise: z.string(),
    logo: image,
    site: lien,
    postes: z
      .array(
        z.object({
          titre: z.string(),
          contrat: z.string().optional(), // CDI, CDD, Freelance, Stage, Alternance…
          debut: date,
          fin: date.nullable(), // null = poste actuel
          lieu: z.string().optional(),
          mode: z.enum(['Sur site', 'Hybride', 'À distance']).optional(),
          description: z.string().optional(),
          competences,
        }),
      )
      .min(1),
  }),
});

// ── Formation ─────────────────────────────────────────────────────────────────────────────────
const formations = defineCollection({
  loader: file('src/data/formations.json'),
  schema: z.object({
    etablissement: z.string(),
    logo: image,
    diplome: z.string(),
    domaine: z.string().optional(),
    debut: date.optional(),
    fin: date.nullable().optional(),
    note: z.string().optional(),
    activites: z.string().optional(),
    description: z.string().optional(),
    competences,
  }),
});

// ── Licences et certifications ────────────────────────────────────────────────────────────────
const certifications = defineCollection({
  loader: file('src/data/certifications.json'),
  schema: z.object({
    nom: z.string(),
    organisme: z.string(),
    logo: image,
    obtention: date,
    expiration: date.optional(),
    identifiant: z.string().optional(),
    url: lien,
    competences,
  }),
});

// ── Bénévolat ─────────────────────────────────────────────────────────────────────────────────
const benevolat = defineCollection({
  loader: file('src/data/benevolat.json'),
  schema: z.object({
    role: z.string(),
    organisation: z.string(),
    logo: image,
    cause: z.string().optional(),
    debut: date,
    fin: date.nullable(),
    description: z.string().optional(),
  }),
});

// ── Projets : un fichier Markdown par projet ─────────────────────────────────────────────────
// L'en-tête (frontmatter) remplit la carte de la page d'accueil ; le corps est la page de doc
// « comment je l'ai réalisé », publiée à /projets/<nom-du-fichier>/.
const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: z.object({
    titre: z.string(),
    resume: z.string(),
    date: date, // début du projet
    statut: z.enum(['en-ligne', 'en-cours', 'archive']),
    role: z.string().optional(),
    lien: lien, // le projet en ligne
    depot: lien, // le code source
    stack: z.array(z.string()).default([]),
    ordre: z.number().optional(), // pour forcer l'ordre d'affichage (le plus petit d'abord)
    couleur: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur attendue : #RRGGBB').optional(), // pastille de la carte
  }),
});

export const collections = { experiences, formations, certifications, benevolat, projets };
