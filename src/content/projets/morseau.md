---
titre: Morseau
resume: Apprendre le code morse, un éclat à la fois, dans la lumière d'un timonier qui l'émet à la lampe de signalisation.
date: 2026-07
statut: en-cours
role: Projet personnel
lien: https://orelink.github.io/morseau/
depot: https://github.com/oreLINK/morseau
stack: [Svelte, TypeScript, Vite]
ordre: 5
couleur: "#1F4E8C"
---

## Qu'est-ce que ça fait ?

Un site statique inspiré de Duolingo pour apprendre le morse. Chaque caractère se lit dans les éclats de la lampe d'un timonier.

## Comment je l'ai construit, et pourquoi ?

### Séparer la logique morse de son affichage

Le même moteur servira aux quatre sections, donc il ne dépend ni de Svelte ni du DOM :

- `timing.ts` : les durées (point, trait, silences) selon la vitesse en mots par minute ;
- `morse-engine.ts` : transforme un texte en **ligne de temps d'évènements de lampe** (allumée, éteinte) ;
- `transmission.ts` : joue cette ligne de temps et expose l'état de la lampe à l'interface.

### Étendre le site : ajouter une animation

Une animation est un composant qui reçoit deux propriétés, `lit` (la lampe est-elle allumée ?) et `playing`. On l'enregistre dans un registre, et elle entre dans le tirage au hasard sans autre changement.

### Étendre le site : ajouter une langue

Le morse « français » recouvre deux choses distinctes : les textes de l'interface **et** les caractères enseignés, car les lettres accentuées ont leurs propres codes. Les deux sont donc séparés :

- l'interface : un fichier de traduction par langue ;
- les caractères : un alphabet qui étend la base internationale et ajoute ses lettres.

La base internationale (A à Z, chiffres, ponctuation, signaux de service) n'est jamais dupliquée.

## Comment ça tourne sans moi ?

Une GitHub Action construit et publie le site sur GitHub Pages à chaque push sur `main`.

## Où j'en suis ?

Le site est prévu en quatre sections : un répertoire, puis deviner un caractère, un mot, un message. La première est en ligne.
