---
name: add-exercise
description: Add a new exercise to PROG in data.js with the correct format (id, muscle, imgs, APRE fields, pathology flags). Use when the user wants to add an exercise to the Push/Pull/Legs program. Also updates EXERCISE_RISKS in pathologies.js if needed.
user-invocable: true
allowed-tools: Read, Edit, Glob
argument-hint: "[exercise-name] [session: push|pull|legs] [pool-label] [muscle]"
---

# Add Exercise

Ajoute un exercice dans `PROG` (data.js) avec le bon format, et les risques associés dans `EXERCISE_RISKS` (pathologies.js).

## Format exact d'un exercice dans PROG

```js
{
  id:       "px99",           // unique dans tout PROG — préfixe: p=push, l=pull, q=legs, cx=core
  name:     "Nom Exercice",   // doit matcher exactement EXERCISE_RISKS si risques existent
  sets:     3,
  reps:     "10-12",          // string : "4-6" | "8-10" | "10-12" | "12-15" | "15-20"
  rest:     90,               // secondes : 45|60|75|90|120|180
  muscle:   "chest",          // une valeur de MN : chest|shoulders|triceps|back|biceps|quads|hamstrings|calves|core
  imgs:     ["NomDossierExercise/0.jpg", "NomDossierExercise/1.jpg"],
  mw:       "https://musclewiki.com/exercise/slug",
  yt:       "https://www.youtube.com/results?search_query=nom+exercice+form",
  notes:    "<b>Point clé</b>. Excentrique 3s.",
  coaching: ["Cue court 1", "Cue court 2"],
  l5safe:   true              // TOUJOURS présent — true si l'exercice est safe pour L5-S1
  // Si l5safe:false ou si précaution L5 :
  // l5warn: "Message de précaution pour L5-S1"
}
```

## Étapes

1. Lire `$ARGUMENTS` pour extraire : nom, session (push/pull/legs), pool cible, muscle principal
2. Si $ARGUMENTS manquant → demander ces 4 infos
3. Lire `data.js` pour trouver le pool cible et le prochain `id` disponible
4. Générer l'objet exercice complet (demander les infos manquantes si nécessaire)
5. Déterminer si l'exercice a des risques pathologiques → ajouter dans `EXERCISE_RISKS` de `pathologies.js`
6. Insérer dans le bon pool de `data.js` via Edit
7. Lancer `/run-tests` pour vérifier qu'aucune régression

## Règles métier

### IDs
- Push : `p1`–`p99` (compounds `p1-p9`, pools `pc`, `ps`, `pt` + numéro)
- Pull : `l1`–`l99` (compounds `l1-l9`, pools `lb`, `lr` + numéro)
- Legs : `q1`–`q99` (compounds `q1-q9`, pools `qh`, `qc`, `qq` + numéro)

### Phases APRE et reps
- `force` (APRE6) : `reps:"4-6"`, `rest:120-180`, `sets:4-5`
- `hyper` (APRE10) : `reps:"8-12"`, `rest:75-90`, `sets:3-4`
- `deload` (APRE3) : `reps:"15-20"`, `rest:45-60`, `sets:3`

### l5safe
- `l5safe: true` = exercice sûr pour hernies L5-S1 ou à adapter avec précaution
- Toujours ajouter `l5warn` si l'exercice sollicite les lombaires (row penché, squat, DL, OHP lourd)
- Exercices à ne JAMAIS ajouter sans `l5warn` : DL classique, Good Morning, T-Bar Row, Ab Wheel

### pathologies.js
- Si l'exercice a des risques → ajouter une entrée dans `EXERCISE_RISKS`
- Format : `"Nom Exercice": { pathKey: { level:"warn"|"avoid", msg:"...", alt:"Alternative" } }`
- Pathologies disponibles : `l5` | `shoulder` | `knee` | `wrist` | `elbow`

## Exemple de sortie

```
✅ Exercice ajouté : "Pendlay Row"
   Session    : PULL → pool "Dos acc." (après Cable Row)
   ID         : lb4
   Muscle     : back
   l5safe     : true (l5warn ajouté)
   Risques    : l5 warn → ajouté dans pathologies.js

À vérifier manuellement :
  - Image path : "Pendlay_Row/0.jpg" (vérifier sur free-exercise-db)
  - MuscleWiki URL : https://musclewiki.com/exercise/barbell-pendlay-row
```

## Gotchas

- Les images viennent de `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/` — vérifier que le dossier existe sur ce repo avant d'utiliser un chemin.
- Si l'image n'existe pas sur free-exercise-db, utiliser l'image d'un exercice similaire déjà présent dans PROG.
- Le `name` dans PROG doit être **exactement** le même que dans `EXERCISE_RISKS` (casse comprise) pour que `getExerciseRisks()` fonctionne.
- Ne pas supprimer d'exercices existants depuis ce skill — utiliser une conversation dédiée.
