// Billets (src/content/articles/<nom>/) dans une langue : le français, ou sa traduction (en.md)
// quand elle existe. Sans traduction, la page anglaise montre le texte français, signalé comme tel.
// `affichage → billets` (site.json) coupe toute la rubrique : ni lien, ni pages, ni flux RSS. Le
// contenu reste vérifié au build dans tous les cas.
import { getCollection, type CollectionEntry } from 'astro:content';
import { reglages } from './reglages';
import { url } from './paths';
import type { Langue } from './i18n';

export type Billet = {
  id: string;
  titre: string;
  resume: string;
  sujets: string[]; // pas affichés pour l'instant ; repris dans le flux RSS
  date: string;
  miseAJour?: string;
  projet?: string; // id du projet lié
  traduit: boolean; // le texte est dans la langue de la page
  minutes: number; // temps de lecture
  entree: CollectionEntry<'billets'> | CollectionEntry<'billetsEn'>; // à passer à render()
};

const MOTS_PAR_MINUTE = 200;
const tempsDeLecture = (texte = '') => Math.max(1, Math.round(texte.split(/\s+/).filter(Boolean).length / MOTS_PAR_MINUTE));

async function charger(langue: Langue): Promise<Billet[]> {
  const francais = await getCollection('billets');
  const traductions = await getCollection('billetsEn');
  const projets = (await getCollection('projets')).map((p) => p.id);

  const orphelin = traductions.find((t) => !francais.some((b) => b.id === t.id));
  if (orphelin) throw new Error(`Billet : src/content/articles/${orphelin.id}/en.md n'a pas de fr.md à côté`);
  const sansProjet = francais.find((b) => b.data.projet && !projets.includes(b.data.projet.id));
  if (sansProjet) {
    throw new Error(`Billet « ${sansProjet.id} » : le projet « ${sansProjet.data.projet!.id} » n'existe pas dans src/content/projets/`);
  }

  return francais
    .filter((b) => import.meta.env.DEV || !b.data.brouillon)
    .map((b) => {
      const en = langue === 'en' ? traductions.find((t) => t.id === b.id) : undefined;
      const entree = en ?? b;
      return {
        id: b.id,
        titre: en?.data.titre ?? b.data.titre,
        resume: en?.data.resume ?? b.data.resume,
        sujets: en?.data.sujets ?? b.data.sujets,
        date: b.data.date,
        miseAJour: b.data.miseAJour,
        projet: b.data.projet?.id,
        traduit: langue === 'fr' || en !== undefined,
        minutes: tempsDeLecture(entree.body),
        entree,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

const cache = new Map<Langue, Promise<Billet[]>>();

/** Billets publiés, du plus récent au plus ancien ; aucun si la rubrique est coupée. */
export async function billets(langue: Langue): Promise<Billet[]> {
  if (!cache.has(langue)) cache.set(langue, charger(langue));
  const tous = await cache.get(langue)!;
  return reglages(langue).affichage.billets ? tous : [];
}

/** Les billets liés à un projet. */
export const billetsDuProjet = async (projet: string, langue: Langue) => (await billets(langue)).filter((b) => b.projet === projet);

/** La liste (/articles/) et une page par billet (getStaticPaths) ; rien si la rubrique est vide ou coupée. */
export async function pagesBillets(langue: Langue) {
  const liste = await billets(langue);
  if (liste.length === 0) return [];
  return [
    { params: { chemin: undefined }, props: {} },
    ...liste.map((billet) => ({ params: { chemin: billet.id }, props: { billet } })),
  ];
}

/** Le flux RSS n'existe que s'il y a des billets publiés (getStaticPaths de [flux].xml.ts). */
export const cheminsFlux = async (langue: Langue) => ((await billets(langue)).length > 0 ? [{ params: { flux: 'rss' } }] : []);

const echapper = (texte: string) =>
  texte.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/** Flux RSS 2.0 des billets d'une langue : titre, lien, date, résumé et sujets de chacun. */
export async function fluxRss(langue: Langue, site: URL): Promise<Response> {
  const { profil, t } = reglages(langue);
  const adresse = (chemin: string) => new URL(url(chemin, langue), site).href;
  const items = (await billets(langue)).map((b) => {
    const lien = adresse(`articles/${b.id}/`);
    return [
      '    <item>',
      `      <title>${echapper(b.titre)}</title>`,
      `      <link>${lien}</link>`,
      `      <guid isPermaLink="true">${lien}</guid>`,
      `      <pubDate>${new Date(`${b.date}T00:00:00Z`).toUTCString()}</pubDate>`,
      `      <description>${echapper(b.resume)}</description>`,
      ...b.sujets.map((s) => `      <category>${echapper(s)}</category>`),
      '    </item>',
    ].join('\n');
  });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${echapper(`${t.billetsTitre} · ${profil.prenom} ${profil.nom}`)}</title>`,
    `    <link>${adresse('articles/')}</link>`,
    `    <description>${echapper(t.billetsIntro)}</description>`,
    `    <language>${langue}</language>`,
    `    <atom:link href="${adresse('articles/rss.xml')}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
