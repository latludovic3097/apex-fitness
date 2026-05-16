# Design

## Visual theme

**Aesthetic** : light-mode app, inspiré Hevy / iOS. Surfaces blanches sur fond off-white. Ombres très douces. Bordures fines presque silver. Coins arrondis 11-16px. Sensibilité "outil pro mobile" : familier, prévisible, lisible, jamais ostentatoire.

**Mood physique** : un lifter avec mal de dos, sweat shirt encore froid, néons LED de la salle au-dessus, smartphone tenu d'une main entre deux sets. La lecture dure 0.5 à 3 secondes. Le contraste doit traverser une légère buée d'écran.

**Anti-modes** : pas de glassmorphism, pas de gradients décoratifs, pas de display fonts en headers d'app, pas de hero metrics façon SaaS, pas de side-stripe rainbow par section.

## Color palette

Stratégie : **Restrained**. Un rouge accent + neutres légèrement teintés + un vert wellness pour le secondaire santé.

### Tokens actuels

```css
--bg:#f5f5f7         /* fond page (off-white iOS-like) */
--cd:#ffffff         /* surface carte primaire */
--cd2:#f0f0f3       /* surface carte secondaire / muted */
--bd:#e5e5ea         /* bordures (silver très clair) */
--tx:#1c1c1e         /* texte primaire (near-black) */
--t2:#48484a         /* texte secondaire (dark gray) */
--mt:#6c6c70         /* texte muted (contraste AA 5.7:1) */

--ac:#E63946         /* ROUGE ACCENT — voix de marque, cohérent depuis v1 */
--ok:#2A9D8F         /* vert wellness (cardio/core/nutrition) */
--wa:#F4A261         /* orange warning (L5-S1 alertes) */
--in:#06b6d4         /* cyan info — usage légitime restant à valider, voir audit */

--ac10:rgba(230,57,70,.10)   /* tint pour ex-notes (background ac10 + border-left ac) */
--ok10:rgba(42,157,143,.10)
--wa10:rgba(244,162,97,.10)
--in10:rgba(6,182,212,.10)
```

### Règles de couleur

- **Le rouge `--ac` ne sort que pour** : (1) la voix de marque (logo APEX, titres marketing courts), (2) le call-to-action primaire (.btn), (3) un état actif (.nav-btn.active, .pill.active), (4) une alerte importante (l5-alert tinted background mais texte sombre, pas de pavé rouge), (5) le focus-visible (outline 3px solid `--ac`).
- **Le vert `--ok`** = catégorie wellness (cardio, core, nutrition, set-done). Pas de mélange avec `--ac`.
- **L'orange `--wa`** = warning L5-S1, deload alert. Le ratio sur la page ne dépasse jamais 5% de la surface visible.
- **Pas de `#fff` ou `#000` purs** : les vars `--cd`/`--tx` les remplacent — déjà teintés vers le gris froid iOS.
- **Pas de gradients texte.** Pas de `background-clip: text`.
- **Pas de side-stripe borders > 1px** sauf le pattern établi `.sess-card` (border-left:5px solid var(...))` — c'est l'exception du système. Aucune nouvelle introduction.

### Token bug à corriger

`var(--t1)` est référencé dans `.page-title` (index.html ligne 61) mais n'existe PAS dans `:root`. Régression du refactor light theme : `--t1` était la variante texte du dark theme, remplacée par `--tx`. Conséquence : titres "HISTORIQUE" et "RÉGLAGES" tombent en couleur par défaut héritée (var-not-defined → fallback). À fixer dans l'audit.

## Typography

**Font stack** : `-apple-system, 'Segoe UI', sans-serif` — system fonts. Aucune webfont chargée (perf + offline-first). Conforme au product register : product UI = system fonts légitimes.

### Échelle actuelle (extraite du CSS)

| Token | Taille | Weight | Letter-spacing | Usage |
|------|------|------|------|------|
| Logo APEX | 30px | 900 | 5px | Header home uniquement |
| sec-title | 22px | 900 | 1px (uppercase) | Titres de section ("Programme PPL", "Cardio", "Nutrition") |
| sess-name | 24px | 900 | 3px (uppercase) | Nom de session/carte ("PUSH", "CARTE MUSCULAIRE") |
| page-title | 20px | 800 | 2px (uppercase) | Header pages secondaires ("Historique", "Réglages") |
| ex-name | 20px | 900 | 0.3px | Nom d'exercice en page session |
| stat-val / score-val | 22-24px | 900 | normal | Valeurs numériques (séances, fatigue) |
| btn | 15px | 800 | 0.5px | Boutons primaires |
| Body / pill / muscle-tag | 11-15px | 500-700 | 0-1px | Corps de texte, étiquettes |
| stat-lbl / score-lbl | 10-11px | 600-700 | 0.5-1px (uppercase) | Petits labels |

### Problèmes identifiés (input pour l'audit)

1. **Pas de hiérarchie : trois niveaux 22-30px tous en 900 uppercase se battent.** Logo (30px), sess-name (24px), sec-title (22px). Ratio < 1.25 entre eux, plus dense en weight + tracking similaire = l'œil ne sait pas où aller.
2. **`.sess-name` plus gros que `.sec-title`** : la carte hurle plus que le titre de catégorie qui la contient. Inverse de la hiérarchie attendue.
3. **`.page-title` 20px 800 vs `.sec-title` 22px 900** : presque identique. Un seul niveau aurait suffi.

### Cible (recommandation produit)

- Tighter ratio (1.125-1.2 entre paliers, conforme au product register).
- Un seul niveau "hero" à 28-30px réservé à des moments forts (logo en home, page d'accueil onboarding).
- Sec-title → 16-18px, weight 700, letter-spacing 0.5-1px, **non uppercase ou en small-caps subtil**.
- Sess-name → 18-20px, weight 800, letter-spacing 1.5-2px (réduit), garde l'uppercase comme signature d'identité de session.
- Stat-val et score-val sont des chiffres → ils peuvent rester larges (tabular numbers) mais font-weight 700 suffit, le tracking à 0.

## Layout & spacing

**Container** : `max-width: 480px; margin: 0 auto;` — mobile-first strict, centré sur tablette/desktop. Pas de version "responsive desktop" séparée.

**Padding-bottom body** : 75px pour compenser la nav fixe.

**Espacements verticaux** (extraits du CSS) :
- `.hdr` : 22px haut, 14px bas, 18px latéral
- `.sec-title` : 18px haut, 10px bas, 16px latéral
- `.card` : margin 0 16px 12px, padding 18px
- `.stats-row` / `.score-card` : padding 0 16px, gap 8px

Le rythme est régulier (12-18px) — propre, pas de scroll trapeze. Le problème n'est pas le spacing, c'est la hiérarchie typographique.

**Grilles d'inputs sets** : `grid-template-columns: 34px 1fr 1fr 34px` — set-num / poids / reps / état. Cohérent entre header et rows. Bon exemple de tabular layout en product UI.

## Components inventory

### Sessions / Cartes principales

- `.sess-card` : carte de session (PUSH, PULL, LEGS) — bordure gauche 5px solid `--ac` par défaut.
- `.sess-card-util` (F-002) : bordure gauche `--bd` neutre + titre `--ac` rouge — pour cartes utility (Carte Musculaire, Plate Calculator, Custom).
- `.sess-card-well` (F-002) : bordure gauche + titre `--ok` vert — pour wellness (Cardio, Core, Nutrition).
- L'icône en sortie de carte (`.sess-icon`) suit la catégorie (red pour training, dimmed gray pour util, ok pour wellness).

**Le système F-002 est fondateur** : c'est la signature visuelle qui distingue training / wellness / utility en un coup d'œil. À préserver.

### Boutons

- `.btn` : primaire rouge plein (start session, finish workout).
- `.btn-ok` : secondaire vert (actions wellness positives).
- `.btn2` : tertiaire neutre (export, partage, navigation secondaire).
- `.tbtn-go` / `.tbtn-pause` / `.tbtn-reset` : variantes timer.

Cohérence vocabulaire : 3 niveaux clairs. Ne pas en ajouter un 4ᵉ.

### Inputs

- `.inp` : `font-family: monospace` + `font-weight: 600`. Choix volontaire pour saisie de chiffres (poids, reps). Border-color → `--ac` au focus + shadow ring rouge léger.

### Timer

- `.timer` : container 14px radius, fond `--cd2`, bordure 1.5px `--bd`.
- `.timer.done` : 2px border `--ok` + fond `--ok10`.
- Cercle SVG animé 56×56px à gauche, contenu à droite.

### Feedback states

- `.set-done` : `--ok10` background + `--ok` text.
- `.set-empty` : `--cd2` background + `--mt` text.
- `.ex-notes` : `--ac10` background + border-left 3px `--ac` (exception au ban de side-stripes — justifiée pour "notes coach" sémantique).
- `.l5-alert` : `--wa10` background + `--wa` border 1.5px + texte `#B97534` (warm brown, contraste OK).
- `.suggest-line` : background `rgba(69,123,157,.10)` + texte `#3D6790` (bleu acier).

### Navigation

- `.nav` : fixe en bas, max-width 480px, fond `--cd`, top border 1px `--bd`. Box-shadow upward subtle.
- `.nav-btn` : icône SVG 22px + label 12px. Active = `--ac` + weight 800.

### Pills (selectors)

- `.pills` : container scroll-snap-x avec mask-gradient à droite (signal de scroll). Padding 12-16px, gap 5-6px.
- `.pill` : 7-14px padding, radius 18px, border 1.5px `--bd`. Active = fond plein, border transparent, texte blanc.

## Motion

- Transitions : `0.12s` sur `.sess-card:active` (transform + box-shadow).
- `.timer-time` updates : `requestAnimationFrame` (anti-throttle).
- `.fatigue-bar` width transition : `.3s`.
- `.prog-fill` width transition : `.3s`.

**Pas de motion décorative.** Conforme product register : motion = feedback d'état, jamais ornement. Respect `prefers-reduced-motion` est implicite (peu d'animations CSS de toute façon).

## Iconography

Emojis natifs utilisés ponctuellement pour catégoriser (🗺 carte musculaire, 🏋️ plate calculator, etc.) — choix pragmatique en zéro-dépendance. SVG inline pour les éléments core (nav-btn icons, timer circle, ex-link icons). Pas d'icon library externe.

Limite : les emojis varient selon l'OS (Apple vs Google vs Microsoft). Acceptable pour ce projet — la marque ne repose pas sur l'iconographie.

## Accessibility patterns

- `:focus-visible` : outline 3px solid `--ac` + offset 2-3px, radius 6px. Pattern propre.
- `.inp:focus-visible` : ring shadow rouge à 20% opacity (plus visible que l'outline standard sur input).
- `.sr-only` : pattern WCAG standard (h1 caché lu par screen readers, "APEX Fitness — Application de musculation...").
- Pinch-to-zoom autorisé : `maximum-scale=5` (non `user-scalable=no`).
- Disclaimer médical bloquant au premier lancement (`apex_disclaimer` localStorage flag).

## What's working

1. Brand discipline du rouge `--ac` : utilisé pour 5 rôles précis, jamais décoratif. Le système F-002 (util/well/training) renforce cette discipline.
2. Échelle d'inputs `.inp` en monospace : excellent choix pour la saisie poids/reps en salle.
3. Timer feedback state (`.timer.done` border vert) : clair sans être ostentatoire.
4. Spacings réguliers (12-18px verticaux) : rythme prévisible, scroll prédictible.
5. Container 480px strict + nav fixe bas : pattern mobile-app éprouvé.

## What's broken or undefined

À traiter dans l'audit :

1. **Bug `var(--t1)` non défini** dans `.page-title` (régression refactor light theme).
2. **Trois niveaux typographiques 22-30px** en concurrence (logo, sec-title, sess-name) sans ratio clair → hiérarchie cassée sur la home.
3. **Cartes utility (Carte Musculaire, Plate Calculator, Custom) affichées AVANT le titre "Programme PPL"** sur la home → l'utility outrepasse le job-to-be-done principal.
4. **`.sess-name` (24px 900) plus gros que `.sec-title` (22px 900)** : inverse de la hiérarchie attendue (titre catégorie < nom d'item).
5. **`--in` cyan `#06b6d4`** : défini mais peu/pas utilisé légitimement après le refactor F-001. Soit on lui donne un rôle (info state ?), soit on le supprime.
6. **`.suggest-line` utilise une couleur HEX hardcodée `#3D6790`** au lieu d'un token : casse le système.
7. **Pas de "today/now framing" en haut de home** : la spec mentionne Rest Day Intelligence mais le rendering ne le met pas en haut. Le user qui ouvre l'app doit voir IMMÉDIATEMENT "Aujourd'hui : PUSH (Force)" ou "3 jours sans LEGS".
