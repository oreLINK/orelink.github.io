// Flux RSS des billets en français, à /articles/rss.xml (seulement si la rubrique est affichée).
import type { APIRoute } from 'astro';
import { fluxRss, cheminsFlux } from '../../lib/billets';

export const getStaticPaths = () => cheminsFlux('fr');
export const GET: APIRoute = ({ site }) => fluxRss('fr', site!);
