# CLAUDE.md

Guide for AI assistants working on **FITStark** (repo name `apex-fitness`, historic brand "APEX Fitness" — renamed in commit `3e5fbd8`).

## What this is

A French-language PWA for strength training (Push/Pull/Legs), cardio, core rehab and nutrition. Its differentiator is **lumbar-pathology adaptation (L5-S1) enabled by default**, plus scientifically-sourced progression (APRE, dual-formula 1RM, Mifflin-St Jeor). 100% local-first; cloud sync is opt-in.

Read `PRODUCT.md` (personas, brand rules, design principles) and `DESIGN.md` (tokens, typography, spacing) before touching UI. They are authoritative and were written deliberately — do not contradict them.

- Live: `https://apexfit-da753.web.app` (Firebase Hosting, project `apexfit-da753`)
- Language of the codebase: **French** — comments, commit messages, UI strings, doc files. Keep writing French. Code identifiers are English/mixed.

## Two-tier architecture — read this first

The repo contains **two generations of the app**. Getting this wrong is the single most common mistake here.

### Tier 1 — the live app: `src/` (React, v9.x)

Vite + React 18 + TypeScript + Tailwind v4 + shadcn/ui + Zustand. Entry: `index.html` → `src/main.tsx` → `src/App.tsx`. **This is what ships.** All feature work goes here.

### Tier 2 — legacy vanilla app (v8.x), frozen at repo root

`legacy-app.html` + the root `.js` files (`core.js`, `data.js`, `state.js`, `ui.js`, `lang.js`, `anatomy.js`, `pathologies.js`, `achievements.js`, `protocols.js`, `machines.js`, `custom_exercises.js`, `sync.js`, `firebase-config.js`). The pre-migration single-page app, kept for reference. Not deployed, not linked from `index.html`.

### The bridge: `src/data/fitstark-data.js`

The React app imports its domain data and pure functions from **one concatenated bundle**, `src/data/fitstark-data.js` (~1900 lines), assembled from the root legacy files and marked with `// ===== from <file>.js =====` separators:

| Bundle section | Origin file | Exports |
|---|---|---|
| `core.js` | `core.js` | `esc`, `calc1RM`, `getAPREAdjustment`, `nutCalc`, `mergeHistory`, `parseCSVtoHistory` |
| `data.js` | `data.js` | `I`, `MN`, `MC`, `PHASES`, `WODS`, `WU`, `PROG`, `IDEAL_CYCLE`, `CORE_PROGRAM`, `PROTEINS_DB` |
| `machines.js` | `machines.js` | `MACHINES`, `MACHINE_CATEGORIES` |
| `anatomy.js` | `anatomy.js` | `ANATOMY` |
| `pathologies.js` | `pathologies.js` | `PATHOLOGIES`, `EXERCISE_RISKS` |
| `achievements.js` | `achievements.js` | `ACHIEVEMENTS` |
| `protocols.js` | `protocols.js` | `TRAINING_OBJECTIVES` |
| `custom_exercises.js` | `custom_exercises.js` | custom-program catalogue, `getAlternativeExercises` |

Types for it live in the hand-maintained `src/data/fitstark-data.d.ts`. Same pattern for `src/data/lang.js` ← root `lang.js`.

**Rules:**

1. **`src/data/fitstark-data.js` is the source of truth for the app.** Edit it for any data change that must reach users.
2. There is **no build step that regenerates it** — the concatenation is manual and historic.
3. The root files have already drifted (`protocols.js` and `custom_exercises.js` are behind the bundle as of `51de9f8`; the other six are still byte-identical). Do not assume they match.
4. **Exception — `core.js` and `data.js` still gate CI** (see below). If you change a pure function or an exercise image path, mirror it into the root file too, or CI will test/lint stale content.
5. When adding a new export, also add its signature to `src/data/fitstark-data.d.ts` or TypeScript will not see it.

## Commands

```bash
npm install
npm run dev       # Vite dev server on port 3456
npm run build     # tsc -b && vite build → dist/
npm run preview
npm run lint      # BROKEN: eslint is not installed and there is no eslint config. Don't rely on it.
node ci-tests.mjs # unit tests — needs `npm install --no-save playwright` + `npx playwright install chromium`
```

`serve.ps1` is a Windows-only static server (PowerShell, port 5173) for opening `tests.html`/legacy files without Node. `.claude/launch.json` has hardcoded Windows paths from the author's machine — ignore them on Linux.

## Tests & CI

`.github/workflows/tests.yml` runs on push/PR to `main`:

1. **`node ci-tests.mjs`** — spins a static server on :8765, loads `tests.html` in headless Chromium, fails if any `.test.fail` is present. `tests.html` loads **only root `core.js`** and asserts 67 cases across 6 suites: `esc`, `calc1RM`, `getAPREAdjustment`, `nutCalc`, `mergeHistory`, `parseCSVtoHistory`.
2. **Image-URL lint** — an inline Python step that extracts every `imgs:[...]` / `img:I+"..."` path from **root `data.js`** and HEAD-checks each folder against `raw.githubusercontent.com/yuhonas/free-exercise-db`. A typo'd exercise folder fails the build.

There are **no tests for `src/`** — no vitest, no React testing library. `tests.html` is the only suite, and it covers pure functions in the legacy tier only. When you change logic in `src/lib/engine.ts`, verify manually in the browser; when you change a pure function that also exists in `core.js`, add a case to `tests.html`.

## `src/` layout

```
src/
  App.tsx              switch on store.view → screen; onboarding gate; cloud-sync resume
  main.tsx             React root
  index.css            Tailwind v4 + FITStark design tokens mapped onto shadcn semantic vars
  store/
    useStore.ts        Zustand store — ALL app state + actions (675 lines)
    types.ts           domain types (Exercise, Session, AppState, PathologyId, GoalId…)
  lib/
    engine.ts          pure domain logic ported from core.js + state.js; takes `S: AppState` as a param
    firebase.ts        Auth + Firestore, SDK loaded via dynamic import (bundle stays light if unused)
    grocery.ts         grocery-list + meal-plan generation
    shareImage.ts      canvas share card · audio.ts  timer beeps · utils.ts  cn()
  screens/             one file per full view (Home, Session, History, Nutrition, Settings, BodyMap,
                       Core, Cardio, ProgramWizard, Finish, GroceryList, MealPlan, Onboarding)
  blocks/home/         the Home screen's composable sections (StreakBanner, WeeklyPlanBlock, PplGrid…)
  components/          shared widgets (ExerciseCard, RestTimer, WodTimer, StatTile, BottomNav…)
  components/ui/       shadcn primitives — regenerate with the CLI, don't hand-edit
  i18n/                I18nProvider (fr/en) + dict.ts (React-only strings)
  data/                the vanilla bundles + grocery catalogue/recipes (TS)
```

### State conventions

- **One Zustand store**, no context for app state. Components read with selectors: `useStore((s) => s.sess)`. `const S = useStore()` (whole state) is used where a helper needs the full `AppState` — it re-renders on every change, so prefer selectors in leaf components.
- **Navigation is `store.view`**, a `ScreenId` string — no router. `App.tsx` returns full-screen views (`session`, `finish`, `wizard`) *before* rendering `BottomNav`, because the wizard has its own fixed bottom bar.
- **Persistence is manual, not `zustand/persist`**, and uses the **vanilla v8 localStorage format** so existing users load without migration:
  - `apex-fit-v8` — history, phase, cardio, core, nutrition, health, goal, customProgram, deload, grocery, meal plan
  - `apex-fit-v8_a` — the *active session* snapshot (restored on reload mid-workout)
  - `apex_disclaimer`, `apex_onboarded`, cloud opt-in key from `CloudSyncSection`
  Every mutating action calls `persist()` / `persistActive()`. **Never break this format** — see design principle #2 ("tracking sacré").
- `engine.ts` functions are pure and take `S` explicitly. Keep them free of DOM/store imports so they stay portable and testable.

### i18n

`useI18n()` gives `t` (React dict keys), `tr` (translate a vanilla-data source string), `tt` (React dict → vanilla dict → identity fallback). Source strings are **French**; `src/i18n/dict.ts` maps FR → EN. New user-visible strings: write French inline, add the EN entry to `dict.ts`, render through `tt`.

## Design & UI rules

Full spec in `DESIGN.md`; the non-negotiables:

- Light theme, Hevy/iOS-inspired. Tokens are declared in `src/index.css` `:root` (`--bg --cd --cd2 --bd --tx --t2 --mt --ac --ok --wa --info`) and mapped onto shadcn semantic vars (`--primary`, `--card`, …). **Use the tokens, never raw hex** in components.
- `--ac: #E63946` (brand red) only for: brand voice, primary CTA, active state, important alert, focus ring. `--ok` green = wellness (cardio/core/nutrition). `--wa` orange = L5-S1 / deload warnings, ≤5% of visible surface.
- Banned: gradient text, glassmorphism, decorative gradients, side-stripe borders >1px (the `.sess-card` 5px left border is the one grandfathered exception), SaaS hero-metric patterns, gamified copy ("Bravo !", congratulation emoji).
- Mobile-first at 480px. Touch targets ≥44px. Pinch-zoom must stay enabled (`maximum-scale=5`, never `user-scalable=no`). Respect `prefers-reduced-motion`.
- Colour is never the sole carrier of information — APRE status colours always ship with a text label.
- Icons: `lucide-react`. Utility merging: `cn()` from `@/lib/utils`. Import alias `@/` → `src/`.

## Domain model cheat-sheet

- **PROG** — `PROG.sessions[]`, each with `id` (`push`/`pull`/`legs`), `compounds[]` (main lifts) and `pools[]` (accessory groups; one exercise picked per pool per session). Exercises carry `l5safe`, `l5warn`, `logType` (`weight` | `reps_bw` | `cardio` | `time` | `distance_load`), `imgs`, `mw`, `yt`.
- **PHASES** — `force` (5×4-6, 180s) / `hyper` (4×8-12, 90s) / `deload` (3×15-20, 60s).
- **APRE** — `getAPREAdjustment(repsPerformed, targetRM)` returns `{setAdj, nextAdj, status}` using the APRE 6/10/3 tables (Huang 2025, SUCRA 93%).
- **1RM** — `calc1RM(w, r)`: mean of Epley + Brzycki for r≤10, Mayhew above.
- **Pathologies** — `PATHOLOGIES` (l5, shoulder, knee, wrist, elbow) × `EXERCISE_RISKS[exerciseName][pathology] = {level: "warn"|"avoid", msg, alt?}`. `applyPathologySubstitutions()` in `engine.ts` swaps `avoid` exercises for their `alt`. `health.pathologies` defaults to `["l5"]`.
- **WODs** — `WODS[sessionId][]` with `risks[]`; `pickWOD()` does LRU rotation and filters by the user's pathologies.
- **Deload** — auto-suggested after ~15 sessions in 6 weeks.

`EXERCISE_RISKS` is keyed by the exact `name` string. Renaming an exercise in `PROG` silently orphans its risk entry, its `alt` links and any achievement referencing it — run the `exercise-validator` agent after any such edit.

## Project skills & agents (`.claude/`)

- `/run-tests` — run `tests.html` via Playwright and report failures (its file:// path is Windows-specific; prefer `node ci-tests.mjs`)
- `/add-exercise` — add an exercise to `PROG` with the right shape and pathology flags
- `/visual-audit`, `/add-motion`, `/motion-system` — screenshot every view, then add/consolidate micro-interactions
- `exercise-validator` agent — cross-file data integrity (PROG ↔ EXERCISE_RISKS ↔ ACHIEVEMENTS, duplicate ids, missing `l5safe`, broken `alt` links). Run after editing any data file.

`.claude/settings.json` registers a `PostToolUse` hook that runs Prettier on root `*.js|html|css` after every Write/Edit. It does **not** cover `src/` — match surrounding style there (2-space indent, no semicolons in `src/`, double quotes).

## Deployment

`firebase.json` serves `dist/` with SPA rewrites; `sw.js` and `index.html` are sent `no-cache`, hashed `/assets/**` are immutable for a year.

```bash
npm run build && firebase deploy --only hosting
```

`public/` is copied verbatim into `dist/` — it holds `sw.js`, `manifest.json`, `muscles.svg`, icons. **`public/sw.js` is a self-destructing service worker**: it clears all caches, unregisters itself and reloads open clients, so v8 users stuck on the old cached vanilla app get the React build. Don't turn it back into a caching SW without a migration plan.

Vite only builds `index.html`. The marketing/legal pages at the root (`landing-a…d.html`, `landing-en.html`, `guide.html`, `privacy.html`, `terms.html`, `tests.html`, `legacy-app.html`) are **not** part of the build output and won't be deployed unless you add them as Rollup inputs or move them into `public/`.

The Firebase web config in `src/lib/firebase.ts` (and legacy `firebase-config.js`) is a public client key, not a secret — access is enforced by Firestore rules restricting a user to `users/{uid}`. See `FIREBASE-SETUP.md`.

## Reference docs

| File | Contents |
|---|---|
| `PRODUCT.md` | personas, purpose, brand personality, anti-references, design principles, a11y |
| `DESIGN.md` | colour tokens, typography scale, known issues, audit input |
| `FITSTARK-PROJECT-SPEC.md` | full functional spec + the 10 peer-reviewed scientific sources |
| `FIREBASE-SETUP.md` | Firebase project setup, Firestore rules, Analytics |
| `guide.md` / `guide.html` | end-user guide (with screenshots in `guide-assets/`) |
| `article-l5s1.md` | long-form content on the L5-S1 approach |
| `.design-audit/` | dated screenshots + `impeccable-audit.md` design review |

## Conventions when contributing

- **Commits**: Conventional Commits with a scope, subject in French — `feat(program): …`, `fix(launch): …`, `refactor(home): …`, `docs(design): …`, `style(design): …`.
- **Versioning**: `package.json` is at `9.0.0` (React era). Legacy commit subjects reference `v8.x` — that numbering belongs to the vanilla app and the `?v=8.77` cache-busting query strings in `legacy-app.html`.
- Scientific claims in the UI must cite a named source (Huang 2025, McGill 2016, Mifflin 1990) — this is a product rule, not decoration.
- Before any deploy: `node ci-tests.mjs` green, `exercise-validator` clean, and `npm run build` type-checks.
