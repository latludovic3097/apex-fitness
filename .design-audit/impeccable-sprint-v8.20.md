# Impeccable Sprint v8.20 — Critique + Layout + Adapt + Polish

> Date : 2026-05-16
> Commande : `/impeccable` (4 commands en un sprint)
> Cible : home dashboard FITStark (post v8.19)
> Register : product

## Phase 1 — Critique heuristique

### Design Health Score v8.19 (avant ce sprint) : 29/40 — Acceptable

| # | Heuristique | Score | Issue principale |
|---|---|---|---|
| 1 | Visibility System Status | 3/4 | Auto-save silencieux (OK) |
| 2 | Match Real World | 3/4 | Emojis arbitraires (🗺/🏋️/🎨) |
| 3 | User Control & Freedom | 3/4 | Pas de quick back from deep flows |
| 4 | Consistency & Standards | 3/4 | .suggest-line HEX orphan, emoji vs SVG |
| 5 | Error Prevention | 4/4 | safeWipe + disclaimer + L5 alerts |
| 6 | Recognition vs Recall | 3/4 | Concepts sans tooltip |
| 7 | Flexibility & Efficiency | 2/4 | Pas de quick-start session |
| 8 | Aesthetic & Minimalist | 3/4 | Monotonie 6+ cartes |
| 9 | Error Recovery | 3/4 | No toast for Firebase non-fatal |
| 10 | Help & Docs | 2/4 | 8 concepts sans aide inline |

### Persona red flags

- **Le Lifter Blessé** : info L5-S1 en BAS du dashboard. Contredit principe #3.
- **L'intermédiaire structuré** : pas de quick-start last session.
- **Le CrossFitter hybride** : WOD du jour pas teasé en hero.

## Phase 2 — Layout

**Réorganisation home (8 cartes verticales → 3 rythmes distincts)** :

| Avant | Après |
|---|---|
| 8 cartes vertical | L5 banner (slim) + Cards meta + 3-up PPL + 3 wellness vertical + 2 chip outils |
| Mode Back Pain Safe en bas | Banner ambient en haut (collapsible `<details>`) |
| Cycle PPL Récupération + PPL cards verticaux | Tiles 3-up condensées (PUSH/PULL/LEGS) |
| Utility cards en bas | Chip list horizontal scrollable |

**Nouveaux composants CSS** :
- `.l5-banner` + `summary` + `.l5-body` (banner ambient L5-S1)
- `.home-row-3up` + `.home-tile` (grille 3-up PPL)
- `.tools-chips` + `.tool-chip` + `.tool-chip-ic` (chip list outils)

**Suppression** :
- Card "Mode Back Pain Safe" en bas (-12 lignes ui.js, déplacé en banner)
- Cycle PPL Récupération mini tracker (-1 ligne ui.js, info redondante avec tiles)
- Variable `ppls` non utilisée (-1 ligne)

## Phase 3 — Adapt

**Touch targets ≥44px conformes WCAG 2.5.5** :

| Élément | Avant | Après |
|---|---|---|
| `.pill` | 28-32px | 44px (min-height + padding ajusté) |
| `.nav-btn` | ~38px | 54px (min-height 48px + padding 6px) |
| `.home-tile` (nouveau) | n/a | 96px |
| `.tool-chip` (nouveau) | n/a | 44px |

**Reduced motion** : `@media(prefers-reduced-motion:reduce)` ajouté sur les transitions des nouveaux composants.

## Phase 4 — Polish

**Token cleanup** :
- Removed : `--in` (cyan #06b6d4), `--in10` (orphan post-refactor F-001)
- Added : `--info` (#4A7AAB bleu acier), `--info10` (rgba .10)
- `.suggest-line` : HEX hardcodé `#3D6790` → `var(--info)` + `var(--info10)`

**SVG icons inline** (remplace emojis dashboard) :
- 🗺 → SVG map (Feather polygon)
- 🏋️ → SVG barbell (custom : 1 bar + 4 plates)
- 🎨 → SVG sliders (Feather, pour CUSTOM)
- 💡 → SVG lightbulb (Lucide, dans card Recommandé)

Définis comme constants `SVG = { map, barbell, sliders, bulb }` en haut de ui.js.

**Tooltip system** :
- `.ttip-btn` (CSS) : bouton `?` 18×18px next aux concepts techniques
- `.ttip-pop` (CSS) : popover fond `--tx` texte blanc, click outside dismiss
- `showTip(el, text)` (JS) : function global pour positionner le popover
- `ttip(text)` (JS) : helper pour générer le bouton avec text escapé
- Appliqué sur :
  - "Fatigue" label dans score-card (texte : volume 7j vs hebdo, >75 = surcharge, citation Sports Med Open 2024)
  - "1RM Estimés (Epley)" dans 1RM card (formule W × (1 + reps/30), précision ±2.7 kg, citation DiStasio 2014)

Note : les tooltips n'apparaissent qu'en état actif (>=4 séances pour fatigue, >=1 set tracké pour 1RM). En empty state, ils n'apparaissent pas — par design.

## Verification (Playwright 412×915 local)

```
✓ l5_banner_present: true (DETAILS element, position 1)
✓ home_row_3up: 3 tiles [PUSH, PULL, LEGS]
✓ tools_chips: 2 chips [Carte musculaire, Plate calculator]
✓ svgs_in_chips: 2 SVG inline rendering
✓ nav_btn_min_height: 54px (was ~38)
✓ tile_min_height: 96px
✓ chip_min_height: 44px
✓ ttip_fn_exists: true (showTip global)
✓ --info token: #4A7AAB defined
✓ --in token: removed
✓ Old "Mode Back Pain Safe" bottom card: removed
✓ Cycle PPL Récupération: removed
✓ Console errors: 0
```

## Score audit attendu post-deploy

**Heuristics** : 29 → 33-35 / 40
- Aesthetic & Minimalist : 3 → 4 (monotonie cassée)
- Help & Docs : 2 → 3 (tooltips concepts ajoutés)
- Consistency : 3 → 4 (token cleanup, SVG cohérent)
- Recognition vs Recall : 3 → 4 (tooltips inline)

**Audit technical** : 18-19 → 19-20 / 20
- Theming 3 → 4 (--in cleanup, suggest-line tokenisé)
- Responsive 3 → 4 (touch targets ≥44px)
- Anti-patterns 3 → 4 (monotonie résolue)

## Reste à différer (cycles suivants)

- Quick-start last session button (persona "intermédiaire structuré")
- Toast/snackbar pour erreurs Firebase non-fatales
- Tooltips additionnels (RIR / APRE / BMR / TDEE) dans les pages session et nutrition
- Standardisation des emojis hors-dashboard (📊 📸 🏆 ⚡) en SVG si désiré
