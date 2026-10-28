---
titre: Terminus
resume: Le dernier tram pour rentrer chez soi, à Bordeaux Métropole. Un compte à rebours qui dit quand partir, et par où passer.
date: 2026-09
statut: en-ligne
role: Projet personnel
lien: https://orelink.github.io/terminus/
depot: https://github.com/oreLINK/terminus
stack: [HTML, CSS, JavaScript, Leaflet, GitHub Actions]
ordre: 1
couleur: "#E8962E"
---

## Avant

### Quelle était la situation au départ ?

Le soir, en ville, une seule question compte : *à quelle heure faut-il partir pour attraper le dernier tram ?* Les applications de transport répondent à « comment aller de A à B maintenant », pas à « jusqu'à quand puis-je rester ».

Il fallait donc un outil qui réponde à cette question-là, sur le réseau de Bordeaux Métropole, et qui se consulte sur le téléphone, d'une main, dehors, la nuit.

## Pendant

### Qu'est-ce que j'ai construit ?

Terminus part de la destination et remonte le temps : il trouve le dernier trajet possible et affiche un compte à rebours jusqu'au moment de partir.

- **Le dernier départ possible**, jusqu'à deux correspondances, et par où passer.
- **Les horaires en temps réel**, sur le trajet affiché.
- **Hors ligne** dès la deuxième visite.

Le choix qui a tout guidé : **aucun serveur**. Les données du réseau (TBM) sont préparées à l'avance, et le téléphone ne demande en direct que ce qui sert au trajet affiché : environ 100 Ko par calcul, au lieu de 2,7 Mo pour tout le réseau.

## Après

### Qu'est-ce que ça a changé ?

**Il tourne tout seul.** Chaque lundi, les données du réseau sont régénérées, testées puis mises en ligne automatiquement. Une mise à jour qui casserait un calcul n'est jamais publiée.

**Ce que j'en retiens.** Un site statique peut aller très loin, avec calcul d'itinéraire, temps réel et cartes, sans serveur. La vraie difficulté n'est pas le code mais **la donnée** : la fiabilité des horaires, les cas limites après minuit et la vérification des résultats.

**Et au-delà de Terminus**, le design system créé pour lui (jetons, verre, mouvement, accessibilité) sert aujourd'hui à ce portfolio.
