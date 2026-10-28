// Flux RSS des billets en anglais, à /en/articles/rss.xml.
import type { APIRoute } from 'astro';
import { fluxRss, cheminsFlux } from '../../../lib/billets';

export const getStaticPaths = () => cheminsFlux('en');
export const GET: APIRoute = ({ site }) => fluxRss('en', site!);
