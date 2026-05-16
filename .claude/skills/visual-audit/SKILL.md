---
name: visual-audit
description: Screenshot every view of Apex Fitness via Playwright and identify missing micro-interactions (hover, focus, transitions, loading states, empty states). Produces a prioritized list of what to animate.
user-invocable: true
allowed-tools: Read, Glob, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click
---

# Visual Audit — Apex Fitness

Capture chaque vue de l'app et liste les éléments sans animation/transition.

## Étapes

1. Naviguer vers `file:///D:/AgentsIA/FitnessApp/apex-fitness-repo/index.html`
2. Capturer screenshot + snapshot de chaque vue : home, session, cardio, core, nutrition, bodymap, achievements, history, settings
3. Pour chaque vue, identifier :
   - Boutons sans `transition` CSS (hover flat)
   - Cards sans `hover:shadow` ou `transform`
   - Listes sans animation d'entrée (les items apparaissent instantanément)
   - États vides (0 séances, 0 achievements) sans illustration/animation
   - Indicateurs de chargement absents
   - La barre de nav : bouton actif a-t-il une transition ?
4. Lire `ui.js` pour repérer les éléments générés en innerHTML qui manquent de classes d'animation

## Navigation entre les vues

Les vues sont contrôlées par `S.view` via les fonctions `nav()` :
```js
// Simuler navigation via snapshot + click sur nav-btn
// Vue home : chargement initial
// Vue history : cliquer le bouton nav Historique
// Vue settings : cliquer le bouton nav Réglages
// Vue session : nécessite une séance active — skipper si pas de données
```

## Format du rapport

```
=== VISUAL AUDIT — Apex Fitness ===

Vue HOME :
  🔴 Boutons de lancement séance — pas de hover effect (plat)
  🔴 Cards d'exercice — apparition instantanée, pas de fade-in
  ⚠️  Barre de nav — transition active/inactive trop abrupte

Vue ACHIEVEMENTS :
  🔴 Badges non débloqués — état "vide" sans animation de progression
  ⚠️  Barre de progression — pas d'animation sur mount

Vue HISTORY :
  ✅ Pas d'éléments interactifs critiques manquants

PRIORITÉ D'ACTION :
  P1 (impact fort, effort faible) :
    - Hover + active states sur tous les boutons (~10 lignes CSS)
    - Transition nav active indicator
  P2 (impact moyen) :
    - Fade-in sur les cards au chargement
    - Animation barre progression achievements
  P3 (nice-to-have) :
    - Skeleton screen sur vue history
```

## Gotchas

- L'app utilise `innerHTML` pour le rendu → les animations doivent être dans le CSS global (pas inline).
- La nav est dans `ui.js` ligne ~28 — les `.nav-btn.active` sont déjà stylés, vérifier si `transition` est présent dans l'index.html `<style>`.
- Vue `session` nécessite des données dans `localStorage` pour s'afficher — ne pas bloquer l'audit sur ça.
- Les CSS custom properties utilisées : `var(--in)`, `var(--bg)`, `var(--card)` — les vérifier dans `index.html` `<style>`.
