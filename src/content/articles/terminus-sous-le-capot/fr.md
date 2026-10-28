---
titre: "Terminus, sous le capot"
resume: Les choix techniques derrière Terminus. Calcul à rebours, temps réel ciblé, hors ligne, et ce que j'ai écarté.
date: 2026-10-28
projet: terminus
sujets: [Open data, Mobilité]
brouillon: true # matière mise de côté depuis la fiche projet ; à relire avant publication
---

## Architecture

- **Aucun framework, aucun build** : HTML, CSS et JavaScript en modules ES natifs, hébergés sur GitHub Pages.
- **Les API publiques sont appelées depuis le navigateur** : SIRI-Lite de Bordeaux Métropole pour le temps réel, la Géoplateforme IGN pour le géocodage, la marche à pied et le fond de carte.
- **Les données du réseau sont générées à l'avance** depuis le GTFS de TBM (arrêts, graphes, tracés, horaires du soir), un fichier par mode, chargé à la demande.
- **Le calcul est une fonction pure**, testée avec `node:test`, sans navigateur.

## Itinéraire à rebours, jusqu'à deux correspondances

Le moteur part de l'arrivée et remonte le temps. Les correspondances à pied entre stations proches sont **précalculées à la génération** : aucun appel réseau à l'exécution pour elles.

## Le temps réel, seulement là où il sert

Le flux GTFS-RT de tout le réseau pèse 2,7 Mo : trop lourd toutes les 30 secondes sur un téléphone. Terminus n'interroge que les quais du trajet affiché, à la montée et à la descente de chaque tronçon, soit environ 100 Ko par calcul.

## Ce que j'ai essayé, puis écarté

J'ai prototypé un calcul en ordre « Connection Scan ». Mêmes résultats sur 1 500 trajets, mais 10 à 60 % **plus lent** en JavaScript avec mon modèle d'objets. Je l'ai documenté et laissé de côté.

## Hors ligne dès la deuxième visite

Un service worker garde les pages, les styles et les données générées sur le téléphone. GitHub Pages ne les met en cache que 10 minutes.

## Industrialisation

- Les données sont **régénérées chaque lundi** par une GitHub Action : branche dédiée, pull request, fusion automatique si les tests passent, mise en ligne.
- La branche `main` n'accepte que des pull requests dont les tests passent.
- Un design system documenté (jetons, verre, mouvement, accessibilité), avec des thèmes de saison imposés par leurs dates. Ce portfolio en reprend le design.
