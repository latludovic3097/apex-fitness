# Impeccable Audit — FITStark home dashboard

> Date : 2026-05-16
> Commande : `/impeccable audite l'interface de frontend/index.html et améliore la hiérarchie visuelle du dashboard`
> Cible : `D:\AgentsIA\FitnessApp\apex-fitness-repo\index.html` + `ui.js` (rendering home)
> Register : product

## Audit Health Score : 15/20 — Good

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3/4 | Bug `var(--t1)` non défini + `<div>` au lieu de `<h2>` pour sec-title |
| 2 | Performance | 3/4 | Bien optimisé (system fonts, defer, RAF timer, SW). Images d'exercices pas lazy-loaded |
| 3 | Theming | 3/4 | Tokens propres mais `var(--t1)` cassé + `.suggest-line` hardcode `#3D6790` |
| 4 | Responsive | 3/4 | Mobile-first strict OK, mais touch target `.pill` ~30px (sub-44px) |
| 5 | Anti-Patterns | 3/4 | Pas d'AI slop majeur. F-002 préserve la discipline. Monotonie de 6+ cartes consécutives sur home |

## Anti-Patterns Verdict

Pas d'AI slop majeur. Le système est discipliné : un seul rouge `--ac` avec 5 rôles précis, neutres iOS-teintés, pas de gradient text, pas de glassmorphism. F-002 (util/well/training) est un anti-slop actif.

Les tells résiduels sont structurels, pas esthétiques : monotonie de 6+ cartes consécutives sur home, inversion de hiérarchie typographique (item > conteneur), ordre des sections qui place l'utility devant le job-to-be-done.

## Findings

### P0 — Blocking

- **F-A01 · `var(--t1)` non défini** · index.html:61 · Theming
  Impact : `.page-title` (Historique, Réglages) tombe sur une couleur indéfinie. Sous Chrome récent ça hérite du contexte (potentiellement OK par chance), mais pas garanti cross-browser.
  Fix : remplacer par `var(--tx)`.

### P1 — Major

- **F-H01 · Hiérarchie typographique cassée** · index.html:60-66 · Anti-Pattern
  Impact : 3 niveaux à 22-30px tous en 900 uppercase (logo, sec-title, sess-name) avec ratio < 1.25. Le squint test échoue. L'œil ne sait pas où aller en 0.5s, ce qui contredit le principe directeur #1 du PRODUCT.md.
  Fix : refondre l'échelle. Direction "sec-title silencieux" choisie — sec-title devient 14px / 600 / non-uppercase / muted, sess-name passe à 20px, logo à 26px, page-title prend 24px.

- **F-H02 · `.sess-name` (24px) > `.sec-title` (22px)** · index.html:66,82 · Anti-Pattern
  Impact : inversion structurelle. La carte hurle plus que le titre de catégorie qui la contient. Brouille la sémantique visuelle "groupe / item".
  Fix : appliqué par F-H01.

- **F-H03 · Utility cards affichées AVANT "Programme PPL"** · ui.js:190-192 · Anti-Pattern
  Impact : CARTE MUSCULAIRE / PLATE CALCULATOR / CUSTOM apparaissent avant le job-to-be-done principal. Le lifter scroll 3 cartes avant d'arriver à sa séance. Contredit le principe #1.
  Fix : réordonner — PPL → Wellness (Cardio/Core/Nutrition regroupés) → Outils.

- **F-A02 · Heading semantic absente** · ui.js:193,195,197,199 · A11y
  Impact : `<div class="sec-title">` partout. Screen readers ne peuvent pas naviguer par section. Échec WCAG 2.4.6.
  Fix : `<h2 class="sec-title">` + reset margin h2 dans CSS.

### P2 — Minor

- **F-T01 · `.suggest-line` hardcode HEX** · index.html:120 · Theming
  `#3D6790` + `rgba(69,123,157,.10)` orphelins du système. À traiter dans un futur cycle (pas critique pour l'audit hiérarchie).

- **F-T02 · `--in` cyan sans rôle clair** · index.html:44 · Theming
  Défini mais peu utilisé après refactor F-001. À nettoyer.

- **F-R01 · Touch target `.pill` sub-44px** · index.html:96 · Responsive
  ~28-32px actuel vs WCAG 2.5.5 qui demande 44px. À traiter avec `/impeccable adapt` plus tard.

- **F-AP01 · Monotonie de 6+ cartes consécutives** · ui.js:190-200 · Anti-Pattern
  F-002 atténue mais le rythme reste monotone. Hors-scope pour le fix de hiérarchie actuel (changerait le tap-target). Note pour un cycle `/impeccable layout` plus profond.

### P3 — Polish

- **F-A03 · Pas de h1 visible** · index.html:153 · A11y. Le `.sr-only h1` existe mais le logo `.logo` n'est pas un h1.
- **F-AP02 · Pas de "today/now framing"** · le Rest Day card existe mais pourrait être placé plus haut. À considérer dans un cycle UX.

## Patterns systémiques

1. **Hiérarchie typo "tout en gras uppercase"** : héritage de la phase "v1 sport branding". Le projet a évolué vers light-mode iOS-inspired mais la typo n'a pas suivi. → résolu par F-H01.
2. **`R()` rebuild full innerHTML** : pattern accepté pour ce projet (perf OK car DOM petit) — pas un finding.
3. **Discipline brand red préservée** : aucune nouvelle régression depuis F-002. Le système tient.

## Positive findings

- F-002 system (util/well/training) — fondation visuelle solide, à préserver absolument.
- Focus-visible + sr-only patterns propres.
- Zero webfont, mobile-first strict, service worker discipliné.
- Brand red `--ac` utilisé avec discipline (5 rôles précis).
- CSS variables system bien défini (à part le bug `--t1` résiduel).

## Recommended Actions

1. **[P0] H3** : fix `var(--t1)` → `var(--tx)`. 1 ligne.
2. **[P1] H1** : refondre l'échelle typographique (logo 26px, page-title 24px, sess-name 20px, sec-title 14px discret muted).
3. **[P1] H4** : `<div class="sec-title">` → `<h2 class="sec-title">` + reset margin h2.
4. **[P1] H2** : réordonner home (PPL → Wellness → Outils), regrouper Cardio/Core/Nutrition sous un seul "Wellness".
5. **[P2] cycle suivant** : `/impeccable adapt` pour touch targets pills.
6. **[P2] cycle suivant** : `/impeccable polish` pour `.suggest-line` token et nettoyage `--in`.

Re-run `/impeccable audit` après pour mesurer le score corrigé (attendu : 18-19/20).
