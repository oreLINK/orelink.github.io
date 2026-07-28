import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

// Un mois au format "AAAA-MM" (ex. "2024-03"). Validé au build.
const mois = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Format attendu : AAAA-MM (ex. 2024-03)');

// ── Expériences ─────────────────────────────────────────────────────────────
const experiences = defineCollection({
  loader: file('src/data/experiences.json'),
  schema: z.object({
    poste: z.string(),
    entreprise: z.string(),
    lieu: z.string(),
    dateDebut: mois,
    dateFin: mois.nullable(), // null = poste actuel
    resume: z.string(),
    missions: z.array(z.string()),
    stack: z.array(z.string()),
    logo: z.string().optional().default(''),
  }),
});

// ── Formations ──────────────────────────────────────────────────────────────
const formations = defineCollection({
  loader: file('src/data/formations.json'),
  schema: z.object({
    diplome: z.string(),
    etablissement: z.string(),
    lieu: z.string(),
    dateDebut: mois,
    dateFin: mois.nullable(),
    mention: z.string().optional().default(''),
    resume: z.string(),
    details: z.array(z.string()),
  }),
});

// ── Projets ─────────────────────────────────────────────────────────────────
const projets = defineCollection({
  loader: file('src/data/projets.json'),
  schema: z.object({
    nom: z.string(),
    date: mois,
    role: z.string().optional().default(''),
    resume: z.string(),
    description: z.array(z.string()),
    stack: z.array(z.string()),
    lien: z.string().url().or(z.literal('')).optional().default(''),
    repo: z.string().url().or(z.literal('')).optional().default(''),
  }),
});

// ── Associatif ──────────────────────────────────────────────────────────────
const associatif = defineCollection({
  loader: file('src/data/associatif.json'),
  schema: z.object({
    role: z.string(),
    organisation: z.string(),
    lieu: z.string().optional().default(''),
    dateDebut: mois,
    dateFin: mois.nullable(),
    resume: z.string(),
    details: z.array(z.string()),
  }),
});

export const collections = { experiences, formations, projets, associatif };
