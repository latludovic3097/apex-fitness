---
name: add-motion
description: Add micro-interactions and animations to a specific Apex Fitness view or element. CSS-only approach (no JS required for most animations). Use after /visual-audit to action specific items.
user-invocable: true
allowed-tools: Read, Edit, Glob
argument-hint: "[view: home|session|cardio|achievements|history|nav|all] [type: hover|fade|spring|pulse|all]"
---

# Add Motion — Apex Fitness

Injecte des micro-interactions CSS dans les vues demandées. L'app utilise `innerHTML` — toutes les animations se font via CSS dans `index.html`.

## Stack technique

- **Vanilla JS** avec rendu `innerHTML` dans `ui.js`
- **CSS** dans le bloc `<style>` de `index.html` (seul endroit à modifier)
- **Pas de framework** → keyframes CSS + classes utilitaires
- Classes appliquées via les strings HTML dans `ui.js`

## Catalogue d'animations disponibles

### Hover & Active (boutons, cards)
```css
/* Bouton principal */
.btn-primary {
  transition: transform 150ms var(--ease-out), box-shadow 150ms var(--ease-out);
}
.btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.btn-primary:active { transform: translateY(0) scale(.97); }

/* Card */
.card {
  transition: transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out);
}
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.10); }
```

### Fade-in au chargement (listes, cards)
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 300ms var(--ease-out) both; }
/* Stagger : .fade-up:nth-child(n) { animation-delay: calc(n * 60ms); } */
```

### Spring / Bounce (achievements débloqués, CTA)
```css
@keyframes spring {
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity: 1; }
}
.spring-in { animation: spring 400ms var(--ease-spring) both; }
```

### Progress bar animée
```css
@keyframes progressFill {
  from { width: 0%; }
  to   { width: var(--target-width); }
}
.progress-bar { animation: progressFill 600ms var(--ease-out) both; }
```

### Nav active indicator
```css
.nav-btn { transition: color 200ms var(--ease-out), background 200ms var(--ease-out); }
.nav-btn.active { /* déjà stylé — ajouter transition si absent */ }
```

## Tokens d'animation (à ajouter en haut du bloc `<style>`)
```css
--ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--dur-fast:   150ms;
--dur-normal: 250ms;
--dur-slow:   400ms;
```

## Étapes

1. Lire `index.html` → identifier le bloc `<style>` existant
2. Selon `$ARGUMENTS`, cibler les vues/types demandés
3. Ajouter les tokens si absents
4. Injecter les classes CSS nécessaires dans `<style>`
5. Identifier dans `ui.js` quels éléments HTML générés ont besoin de recevoir les nouvelles classes (ex: ajouter `class="card"` là où c'est manquant)
6. Modifier `ui.js` en conséquence via Edit si des classes doivent être ajoutées au HTML généré

## Gotchas

- `index.html` a déjà des styles inline (`.pulse-dot`, `@keyframes pulse`, `@keyframes progressSlide`) — ne pas dupliquer.
- Modifier `ui.js` pour ajouter des classes dans les strings HTML = prudence, le fichier est dense. Préférer des sélecteurs CSS larges (ex: `button`, `.nav-btn`) plutôt que de modifier `ui.js`.
- L'app tourne en PWA offline — pas de CDN, tout doit être en CSS pur dans `index.html`.
- Tester après chaque bloc CSS ajouté avec `/run-tests` pour vérifier qu'aucune logique n'est cassée.
