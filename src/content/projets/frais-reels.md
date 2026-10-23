---
titre: Simulateur Frais Réels
resume: Calculer ses frais réels de salarié et les comparer à l'abattement forfaitaire de 10 %, sans qu'aucune donnée ne quitte le navigateur.
date: 2026-04
statut: en-ligne
role: Projet personnel
lien: https://orelink.github.io/frais-reels/
depot: https://github.com/oreLINK/frais-reels
stack: [React, Vite, Tailwind CSS, jsPDF]
ordre: 6
couleur: "#1F8A5B"
---

## Le besoin

Chaque année, les salariés peuvent déduire leurs frais réels au lieu de l'abattement forfaitaire de 10 %. Le calcul est fastidieux et la question reste : *est-ce que ça vaut le coup ?* Le simulateur y répond pour les revenus 2025 (déclaration 2026).

## Le parcours

1. **Accueil** : les dates limites de déclaration.
2. **Liste des pièces** à avoir sous la main, en cinq catégories.
3. **Simulateur en cinq étapes**, une question à la fois.
4. **Synthèse** : trois scénarios comparés, et un **PDF complet** à télécharger.

## Architecture

- **Un fichier central pour la fiscalité** (`config/fiscalite.js`) : tous les barèmes de l'année au même endroit, faciles à mettre à jour l'an prochain.
- **Des références légales** (BOFiP) associées à chaque règle.
- **Un moteur de calcul fait de fonctions pures**, sans effet de bord, séparé de l'interface.
- **Un état global** géré avec `useReducer`.

## Confidentialité

Aucun backend, aucun cookie, aucun `localStorage` : tout le calcul a lieu dans le navigateur. La mesure d'audience (GoatCounter) ne compte que les visites, sans cookie ni donnée personnelle, et sans aucun lien avec les montants saisis.

## Déploiement

GitHub Actions vérifie le build sur chaque pull request et publie sur GitHub Pages à chaque push sur `main`.
