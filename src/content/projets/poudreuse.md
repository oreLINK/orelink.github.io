---
titre: Poudreuse
resume: Un jeu de gestion de station de ski en 3D isométrique, sur des massifs montagneux générés à partir d'une graine.
date: 2026-09
statut: en-cours
role: Projet personnel
depot: https://github.com/oreLINK/poudreuse
stack: [TypeScript, Three.js, Web Worker, Vite]
ordre: 3
couleur: "#4BA3C7"
---

## Qu'est-ce que ça fait ?

Construire sa station de ski (pistes, remontées mécaniques, bâtiments) sur une montagne crédible. Chaque partie se joue sur un **massif généré procéduralement** : la même graine redonne toujours exactement le même domaine, et l'adresse se partage (`?size=grand&seed=4217`).

Le domaine vit :

- **Le temps** : jour, nuit et saisons.
- **Le climat et la météo** : températures, vent, nuages, brouillard, précipitations, tempêtes.
- **Le manteau neigeux** : enneigement, risque d'avalanche, déclenchements et écoulement.
- **Les remontées** : un moteur générique (débrayable, pince fixe, pulsé, va-et-vient), avec pylônes automatiques et prise en compte du vent.

## Comment je l'ai construit, et pourquoi ?

### Générer une montagne crédible

La génération est faite de **données pures, sans Three.js**, exécutées dans un Web Worker pour ne pas bloquer l'affichage :

1. un réseau de vallées (archétypes, affluents, cols, lacs) ;
2. une **érosion hydraulique par gouttes**, qui creuse le relief comme le ferait l'eau ;
3. l'hydrologie : remplissage des cuvettes, écoulement, lacs et torrents ;
4. les forêts étagées, une aire plate pour la station et des altitudes réalistes.

### Organisation du code

Les paramètres sont rangés par thème (monde, terrain, neige, climat, remontées…), séparés de la simulation (`sim/`), de la génération (`gen/`) et du rendu (`render/`). On peut ainsi régler le jeu sans toucher au moteur.

## Comment ça tourne sans moi ?

Des tests vérifient le déterminisme de la génération, les altitudes, les pentes, le drainage, les lacs et les rivières.

## Où j'en suis ?

Le projet est en cours et pas encore en ligne. Viendront ensuite la gestion des skieurs et la publication sur GitHub Pages.
