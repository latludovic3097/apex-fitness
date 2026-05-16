---
name: motion-system
description: Audit all existing animations in Apex Fitness and consolidate them into a coherent motion system (tokens, naming conventions, consistent durations/easings). Run once after /add-motion to unify everything.
user-invocable: true
allowed-tools: Read, Edit
---

# Motion System — Apex Fitness

Consolide toutes les animations de l'app en un système cohérent avec des tokens partagés.

## Étapes

1. Lire `index.html` en entier — extraire tous les `transition:`, `animation:`, `@keyframes`, durées, easings existants
2. Détecter les incohérences : `0.3s` ici, `200ms` là, `ease` vs `ease-in-out` vs `cubic-bezier` mélangés
3. Générer le système de tokens
4. Remplacer toutes les valeurs hardcodées par les tokens dans le bloc `<style>`

## Système de tokens cible

```css
/* ═══ MOTION SYSTEM — APEX FITNESS ═══ */

/* Durées */
--dur-instant:  100ms;   /* feedback immédiat : active/press */
--dur-fast:     150ms;   /* hover, focus */
--dur-normal:   250ms;   /* transitions d'état, nav */
--dur-slow:     400ms;   /* animations d'entrée, spring */
--dur-lazy:     600ms;   /* progress bars, charts */

/* Easings */
--ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1);   /* entrées, déplacements */
--ease-in:      cubic-bezier(0.4, 0.0, 1.0, 1.0); /* sorties */
--ease-inout:   cubic-bezier(0.4, 0.0, 0.2, 1);   /* changements d'état */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* bounce, achievements */
--ease-linear:  linear;                             /* progress bars */

/* ─── KEYFRAMES ─── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes spring   { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes progressFill { from{width:0%} to{width:var(--target-w,100%)} }
@keyframes slideIn  { from{transform:translateX(-8px);opacity:0} to{transform:none;opacity:1} }

/* ─── CLASSES UTILITAIRES ─── */
.anim-fade-up   { animation: fadeUp    var(--dur-slow)   var(--ease-out)    both; }
.anim-fade-in   { animation: fadeIn    var(--dur-normal) var(--ease-out)    both; }
.anim-spring    { animation: spring    var(--dur-slow)   var(--ease-spring) both; }
.anim-slide-in  { animation: slideIn   var(--dur-normal) var(--ease-out)    both; }

/* Stagger pour les listes */
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
.stagger > *:nth-child(n+5) { animation-delay: 240ms; }
```

## Format du rapport d'audit

```
=== MOTION SYSTEM AUDIT — Apex Fitness ===

Incohérences détectées :
  - 4 durées différentes pour hover : 0.2s / 150ms / 200ms / 0.3s
    → uniformisé en var(--dur-fast) = 150ms
  - 3 easings différents : ease / ease-in-out / cubic-bezier(0.4,0,0.2,1)
    → uniformisé en var(--ease-out)
  - @keyframes "pulse" existant ✅ conservé
  - @keyframes "progressSlide" existant ✅ conservé et renommé en progressFill

Tokens ajoutés : 5 durées, 5 easings
Keyframes : 6 (4 nouveaux + 2 existants conservés)
Classes utilitaires : 4 + stagger

Remplacements effectués : {N} valeurs hardcodées → tokens
```

## Gotchas

- L'app a déjà `.pulse-dot` et `@keyframes pulse` dans `index.html` → les conserver tels quels (ils sont référencés dans `ui.js`).
- `@keyframes progressSlide` est utilisé pour la barre de progression indéterminée — ne pas supprimer, renommer prudemment.
- Apex est une PWA offline : tout doit rester dans `index.html`, pas de fichier CSS séparé (sauf si on ajoute une entrée dans `sw.js`).
- Après modification du bloc `<style>`, vérifier visuellement que `.pulse-dot` et les progress bars fonctionnent toujours.
