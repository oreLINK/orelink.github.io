---
titre: Bluebird
resume: Les chances de neige, créneau par créneau et station par station, dans les Pyrénées, recalculées toutes les 6 heures.
date: 2026-10
statut: en-ligne
role: Projet personnel
lien: https://orelink.github.io/bluebird/
depot: https://github.com/oreLINK/bluebird
stack: [Python, Parquet, Svelte, Vite, GitHub Actions, Open-Meteo]
ordre: 2
couleur: "#2F7FE0"
---

## Le besoin

Un *bluebird day*, pour les skieurs, c'est le premier jour de grand soleil après une tempête de neige. Bluebird aide à les trouver : pour chaque station d'un massif, il donne la probabilité qu'il neige ce matin, ce midi, cet après-midi, ce soir, cette nuit et demain, et la probabilité de trouver de la poudreuse sur les pistes ou hors-piste.

Les stations sont classées par probabilité dans des tuiles, à la manière d'une page de paris sportifs.

## Architecture : un pipeline en couches

Tout part de fichiers de configuration YAML (massifs, stations, indicateurs, tuiles, sources). Le pipeline Python suit quatre couches :

| Couche | Rôle | Format |
|---|---|---|
| Bronze | Extraction brute des prévisions d'ensemble | `.json.gz` |
| Silver | Mise en forme propre et typée | `.parquet` |
| Gold | Calcul des indicateurs | `.parquet` |
| Diamond | Fichiers prêts pour le site | `.json` |

Le site (Svelte et Vite) embarque la configuration au build et ne lit que les JSON de la couche Diamond.

## Les indicateurs

- `snowfall_chance` : va-t-il neiger sur ce créneau ?
- `onpiste_powder_chance` : la neige fraîche couvrira-t-elle les pistes après le damage ?
- `offpiste_powder_chance` : trouvera-t-on de la poudreuse vierge hors-piste ?

Ils sont calculés à partir de **prévisions d'ensemble** : plusieurs scénarios météo, d'où une vraie probabilité plutôt qu'un oui ou non.

## Automatisation

Une GitHub Action relance le pipeline **toutes les 6 heures**, avec un job par source. Le pied de page du site montre l'état de chaque source, transformation, indicateur et tuile après le dernier rafraîchissement : si une source tombe, on le voit.

## Rewind

En fin de saison, un **Rewind** fait le bilan à partir des prévisions archivées : la station la plus enneigée, la plus longue chute de neige, les pistes et les hors-pistes les mieux servis. Le premier, *Rewind 25/26*, couvre la saison du 1er décembre 2025 au 1er mai 2026.

## Ce que j'en retiens

Le découpage en couches rend chaque étape testable et rejouable. Ajouter une station ou un indicateur se fait dans la configuration, pas dans le code.
