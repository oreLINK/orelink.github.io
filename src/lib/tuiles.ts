// Fiches projet : chaque partie (un intertitre ## et ce qui le suit) devient sa propre tuile de
// verre. Les parties « Avant », « Pendant » et « Après » forment une frise : un jalon par tuile,
// reliés par un trait (global.css, .step). Plugin rehype branché dans astro.config.mjs ; il ne
// touche qu'au Markdown de src/content/projets/, les billets gardent un seul bloc de texte.
import type { Element, ElementContent, Root } from 'hast';

const ETAPES = ['Avant', 'Pendant', 'Après'];

const element = (tagName: string, className: string[], children: ElementContent[] = []): Element => ({
  type: 'element',
  tagName,
  properties: { className },
  children,
});

const texte = (n: ElementContent): string =>
  n.type === 'text' ? n.value : n.type === 'element' ? n.children.map(texte).join('') : '';

export function tuilesParQuestion() {
  return (arbre: Root, fichier: { path?: string; history?: string[] }) => {
    const chemin = fichier.path ?? fichier.history?.[0] ?? '';
    if (!/[\\/]content[\\/]projets[\\/]/.test(chemin)) return;
    const tuiles: Element[] = [];
    for (const noeud of arbre.children as ElementContent[]) {
      const titre = noeud.type === 'element' && noeud.tagName === 'h2';
      if (titre || tuiles.length === 0) {
        if (!titre && noeud.type === 'text' && !noeud.value.trim()) continue; // retours à la ligne en tête
        tuiles.push(element('section', ['prose', 'glass', 'reveal']));
      }
      tuiles.at(-1)!.children.push(noeud);
    }
    // La frise : un jalon dans chaque étape ; la dernière est mise en avant.
    const etapes = tuiles.filter((t) => ETAPES.includes(texte(t.children[0]).trim()));
    etapes.forEach((t, i) => {
      (t.properties.className as string[]).push('step', ...(i === etapes.length - 1 ? ['is-last'] : []));
      t.children.push(element('span', ['step-dot']));
    });
    arbre.children = tuiles;
  };
}
