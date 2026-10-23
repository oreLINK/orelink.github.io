---
titre: Pottoka
resume: Apprendre le basque (euskara) en français, façon Duolingo, avec Pottoka, le poney pottok à la txapela rouge.
date: 2026-08
statut: en-ligne
role: Projet personnel
lien: https://orelink.github.io/pottoka/
depot: https://github.com/oreLINK/pottoka
stack: [React, Vite, CSS, JSON, Markdown]
ordre: 4
couleur: "#D23A4B"
---

## Le besoin

Peu d'outils permettent d'apprendre le basque depuis le français. Pottoka propose des leçons courtes, des exercices et des cours de lecture, dans le sens **français → basque**.

## Principes

- **Aucun backend, aucun compte** : rien n'est enregistré, chaque session repart de zéro.
- **Le contenu est séparé du code** : vocabulaire, exercices et leçons sont en JSON et en Markdown, modifiables sans toucher au JavaScript.
- **Une seule mise en page** qui s'adapte du téléphone à l'ordinateur, avec une barre latérale à partir de 900 px.

## Architecture

```text
src/
├─ data/        contenu : arbre des chapitres, leçons, cours, groupes de vocabulaire
├─ engine/      logique pure, testable, sans React
└─ components/  écrans et un composant par type d'exercice
```

Le moteur (`engine/`) fait le travail :

- il transforme une leçon en exercices concrets ;
- il corrige les réponses en normalisant la casse, les accents et la ponctuation ;
- il **génère les nombres basques** de façon algorithmique, car le basque compte en base 20 (vigésimal).

## Une difficulté : la justesse du contenu

Le contenu basque livré est un **contenu de départ à faire valider** par une personne bascophone. Les points à vérifier sont signalés dans les cours. Pour un outil d'apprentissage, la qualité du contenu compte autant que le code.

## Ce que j'en retiens

Séparer le contenu du moteur permet d'ajouter des leçons sans risque de casser l'application, et de faire relire le contenu par quelqu'un qui ne code pas.
