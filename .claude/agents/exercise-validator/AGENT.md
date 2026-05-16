---
name: exercise-validator
description: Validate data integrity after changes to data.js, pathologies.js, or achievements.js. Checks cross-file consistency: exercise names, pathology coverage, achievement references, l5safe flags. Trigger automatically after edits to these files, or run manually to audit the full dataset.
allowed-tools: Read, Glob
---

# Exercise Validator

Vérifie la cohérence des données entre `data.js`, `pathologies.js` et `achievements.js`.

## Quand utiliser

- Après toute modification de `data.js` (ajout/suppression/renommage d'exercice)
- Après toute modification de `pathologies.js`
- Avant un déploiement sur GitHub Pages
- En audit périodique de la base de données

## Checks à effectuer

### 1. Cohérence PROG ↔ EXERCISE_RISKS

Pour chaque exercice dans `PROG.sessions[*].compounds` et `PROG.sessions[*].pools[*].exercises` :
- Son `name` a-t-il une entrée dans `EXERCISE_RISKS` ? (si non → listing pour review)
- Si `l5safe: false` ou `l5warn` présent → l'entrée `EXERCISE_RISKS[name].l5` existe-t-elle ? (incohérence si non)
- Si `EXERCISE_RISKS[name].shoulder.level === "avoid"` → est-ce que l'exercice a un `shoulderAlt` ou note visible ?

### 2. Alternatives valides (avoid → alt)

Pour chaque `EXERCISE_RISKS[name][path].alt = "NomAlternatif"` :
- Vérifier que `"NomAlternatif"` existe bien dans `PROG` (compounds ou pools)
- Si l'alternative est introuvable → signaler (lien cassé)

### 3. Achievements ↔ sessionIds

Pour chaque `check(h, S)` dans `ACHIEVEMENTS` qui référence un `sessionId` :
- Vérifier que les IDs `"push"`, `"pull"`, `"legs"`, `"cardio"`, `"core"` existent dans `PROG.sessions[*].id`
- Si un achievement référence un ID de session inexistant → erreur

### 4. IDs uniques dans PROG

Collecter tous les `id` de tous les exercices (compounds + pools) de PROG :
- Détecter les doublons → signaler avec le nom de la session et du pool

### 5. Muscles valides

Pour chaque exercice, vérifier que `muscle` est une clé valide de `MN` :
- Valeurs autorisées : `chest` | `shoulders` | `triceps` | `back` | `biceps` | `quads` | `hamstrings` | `calves` | `core`
- Signaler tout `muscle` inconnu

### 6. l5safe manquant

Chaque exercice dans `PROG` DOIT avoir `l5safe: true` ou `l5safe: false` explicite.
Signaler les exercices où la propriété est absente.

## Format du rapport

```
=== EXERCISE VALIDATOR — {date} ===

✅ {N} exercices validés | ⚠️ {N} warnings | 🔴 {N} erreurs

🔴 ERREURS (à corriger avant déploiement) :
  - ID dupliqué "lb4" dans PULL → "Barbell Curls" et "Pendlay Row"
  - Alternative invalide : EXERCISE_RISKS["Arnold Press"].shoulder.alt = "Lateral Raises" → introuvable dans PROG

⚠️ WARNINGS (review recommandée) :
  - "Cable Kickback" présent dans PROG mais absent de EXERCISE_RISKS
  - "Leg Press" : l5safe manquant

✅ PASS :
  - Tous les IDs sont uniques
  - Tous les muscles sont valides
  - Tous les achievements référencent des sessions valides

Verdict : ✅ CLEAN | ⚠️ WARNINGS | 🔴 BLOCKER — corriger avant deploy
```

## Gotchas

- Lire `data.js` EN ENTIER (le fichier est long ~600+ lignes) — utiliser `Read` sans limit ou avec offset/limit successifs si nécessaire.
- Les exercices sont dans 2 endroits : `session.compounds[]` (exercices principaux) ET `session.pools[].exercises[]` (exercices accessoires). Ne pas en oublier un.
- `EXERCISE_RISKS` utilise le `name` exact comme clé (ex: `"Bench Press"` pas `"bench_press"`). Attention à la casse et aux accents.
- Un exercice absent de `EXERCISE_RISKS` n'est pas forcément une erreur — ça peut juste vouloir dire qu'il est safe pour toutes les pathologies. C'est un warning, pas une erreur.
- Les achievements qui référencent `"cardio"` et `"core"` sont corrects — ces sessions existent dans le state même si elles ne sont pas dans `PROG.sessions`.
