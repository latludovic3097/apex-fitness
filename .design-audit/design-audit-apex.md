# FITStark — Visual Audit
**Date:** 2026-05-14
**URL:** https://apexfit-da753.web.app/
**Scope:** Main PWA (onboarding → home → workout → plate calc → carte musculaire), desktop 1440×900 + mobile 390×844
**Method:** Playwright MCP headless Chromium

---

## First Impression

The medical disclaimer gate ("⚕️ Avertissement médical") is a strong professional choice. Setting expectations on liability before the app opens = mature product call.

The first thing my eye goes to: **FITStark in red caps, centered, oversized**. Then the disclaimer card. Then the cyan install prompt at the bottom — which immediately registers as wrong because nothing else on the page is cyan.

**One-word verdict:** *colorful* — and that's the central problem. The app uses 8+ accent colors as primary section identifiers, dissolving the brand red into background noise.

---

## Inferred Design System

**Fonts**
- Body: `-apple-system, "Segoe UI", sans-serif` (system stack)
- No custom webfont loaded
- Verdict: defensible for a free open-source app (zero font-load cost), but limits expressiveness. The "expressive purposeful typography" rule is not satisfied.

**Colors observed (home screen alone)**
| Use | Color |
|---|---|
| Brand red | `#E63946` (rgb 230,57,70) |
| Body bg | `#F5F5F7` (Apple light gray) |
| Body fg | `#1C1C1E` (Apple dark) |
| Muscle gradient — fresh | green/teal `#2A9D8F` |
| Muscle gradient — old | orange `#F4A261` → red |
| PLATE CALCULATOR | purple `#7C3AED` |
| CARTE MUSCULAIRE | orange-red gradient |
| PUSH section | red |
| PULL section | blue `#457B9D` |
| LEGS section | green |
| CARDIO section | cyan `#06B6D4` |
| CORE section | purple |
| NUTRITION section | green |
| PWA install banner | cyan `#06B6D4` |
| Section tag pills | pink, orange, peach, teal, blue, green (per-muscle-group) |

**Heading scale**
- Only **1 H1** in the entire document (correct, SEO-friendly): 32px / 700
- All other "headings" appear to be `<div>` styled as titles, not real h2/h3
- No semantic heading hierarchy
- A11y impact: screen-reader users have no document outline

**Touch targets undersized**
- Set completion circles `○`: ~24×24px (need 44×44)
- Phase indicators 1/2/3 in PHASE card: 24×24px
- Install banner buttons: 71×26px and 23×24px
- Privacy/terms footer links: 147×16px

---

## Hard-rejection test

The gstack design ruleset has 7 instant-fail patterns. FITStark hits 1.5 of them:

| Criterion | Status |
|---|:-:|
| Generic SaaS card grid as first impression | OK (gate is custom) |
| Beautiful image with weak brand | OK |
| Strong headline with no clear action | OK ("J'ai compris — Commencer") |
| Busy imagery behind text | OK |
| Sections repeating same mood statement | **HIT** (every card uses the same colored-left-border template) |
| Carousel with no narrative purpose | OK |
| App UI made of stacked cards instead of layout | **HIT** (home is 9 stacked cards on 1440px) |

---

## AI-Slop scorecard

| Pattern | Status | Where |
|---|:-:|---|
| 1. Purple/violet gradients | OK | — |
| 2. 3-column SaaS feature grid | OK | — |
| 3. Icons in colored circles | OK | — |
| 4. Centered everything | **HIT** | Onboarding, gate, home logo |
| 5. Uniform bubbly radius | mild | All cards same radius |
| 6. Decorative blobs/dividers | OK | — |
| 7. Emoji as design | **HIT** | 👋🎯🚀💪🔥🌿🏋️ in titles and buttons |
| 8. Colored left-border cards | **HIT (max)** | 8+ colors on home alone |
| 9. Generic hero copy | OK | "Bienvenue ! Lance ta première séance" is fine |
| 10. Cookie-cutter section rhythm | mild | Cards all same height |

**AI Slop grade: D+ (4.0/10)**

---

## Findings

### CRITICAL (High impact — fix before user growth)

#### F-001 · Install banner overlaps content on every screen
**Where:** Workout screen (mobile), Anatomy, Plate Calc, Home — banner floats mid-page.
**Impact:** On mobile workout, SETS 2-5 input rows are **unreachable** while banner is visible. P0 functional bug, not just visual.
**Fix:** Make the banner `position: fixed; bottom: env(safe-area-inset-bottom);` above the tab bar, or auto-dismiss after 5s, or replace the cyan with a less-aggressive subtle bar that doesn't overlap.
**Screenshot:** `app-workout-mobile.png`

#### F-002 · 8+ accent colors used as primary section identification
**Where:** Home dashboard.
**Impact:** Brand red is one of 8 competing accents. Users can't anchor on the brand. Reads as "AI-generated dashboard template."
**Fix:** Either pick a strict semantic system (e.g. red=load/strength, green=recovery/cardio, blue=tracking) and use these 3 colors EVERYWHERE in that meaning. Or normalize everything to brand red + neutral charcoal, with section icons doing differentiation.
**Recommended approach:** Reduce to 3 semantic colors max + brand red.
**Screenshot:** `app-home-mobile.png`

#### F-003 · Desktop layout is single-column on 1440px viewport
**Where:** Every screen.
**Impact:** Massive horizontal whitespace on both sides. The home dashboard would benefit from a 2-3 column grid at >960px. Workout screen could put "Départ/Fin photos + cues" side-by-side with "SET/KG/REPS table" instead of stacking.
**Fix:** Add desktop breakpoint (`min-width: 960px`) with `grid-template-columns: repeat(2, 1fr)` or `repeat(auto-fit, minmax(360px, 1fr))` on the main container.
**Screenshot:** `app-home-desktop.png`, `app-workout-active.png`

#### F-004 · Bottom tab bar floats mid-content on desktop
**Where:** All long-scrolling screens at 1440×900.
**Impact:** Tab bar (Accueil/Historique/Réglages) appears mid-flow at the bottom of the visible 900px viewport, NOT fixed at the screen bottom. Users see it mid-page and assume they've scrolled past content.
**Fix:** `position: fixed; bottom: 0;` with `padding-bottom: 56px` on the main scroll container.
**Screenshot:** `app-home-desktop.png`

### HIGH (Fix before next deploy)

#### F-005 · Onboarding goal cards: inconsistent semantic colors
**Where:** Step 2 of onboarding (Force/Hypertrophie/Deload selector).
**Impact:** Force title is red, Hypertrophie is blue, Deload is green. None of these colors appear on the resulting workout screen — so the visual language is set up and then dropped.
**Fix:** Two options:
- **A (system):** commit to a goal-based color system used everywhere (badge on workout screen, accent in stats, hint in scheduler). Cost: 6 hours of refactor.
- **B (normalize):** make all 3 titles `var(--fg)` and only highlight the selected card with the brand red border. Cost: 5 minutes.
**Recommended:** B. Color-as-semantics works in apps that fully commit; partial commitment is worse than none.
**Screenshot:** `app-onboarding-2.png`

#### F-006 · Cyan PWA install banner clashes with brand
**Where:** Persistent banner at bottom of every screen.
**Impact:** Cyan `#06B6D4` is foreign to the palette (the only other cyan in the app is the small Disques info box on plate calc). On the workout screen, the cyan + red CTA = visual clash.
**Fix:** Restyle install banner with `--bg: var(--card)` + `--fg: var(--fg)` + brand-red CTA. Or move to a discreet sticky-bottom bar with neutral surface.
**Screenshot:** Visible across all app screens

#### F-007 · No semantic heading hierarchy
**Where:** Every screen.
**Impact:** Only 1 H1 in DOM (which is correct — used for SEO). But every section title in the app (PUSH, CARTE MUSCULAIRE, PLATE CALCULATOR, etc.) is rendered with styled `<div>` or h-elements not in document order. Screen readers can't generate an outline. Tab keyboard nav is unstructured.
**Fix:** Map titles to proper `<h2>` / `<h3>` with consistent visual styling via class, not via tag choice.

#### F-008 · Console deprecation warnings
**Where:** Page load.
**Impact:** Two warnings:
- `enableIndexedDbPersistence()` deprecated → use `FirestoreSettings.cache`
- `<meta name="apple-mobile-web-app-capable">` deprecated → add `<meta name="mobile-web-app-capable">`
**Fix:** Both <5 min changes. Worth doing before the next deploy.

### MEDIUM

#### F-009 · Step indicator overflows on mobile workout
**Where:** Workout screen stepper (WU/1/2/3/4/5/6/WOD) at 390px width.
**Impact:** WOD pill is cut off at the right edge. User doesn't see the full plan.
**Fix:** `overflow-x: auto; scroll-snap-type: x mandatory;` on the stepper container, or reduce gap, or use shorter labels (W/1/2/3/4/5/6/D).
**Screenshot:** `app-workout-mobile.png`

#### F-010 · Set completion circles are 24×24px (need 44×44)
**Where:** Workout screen, right side of each SET row.
**Impact:** Hard to tap on mobile with sweaty hands mid-workout. Real use-case failure.
**Fix:** Increase the hit area to min 44×44px. The visual ring can stay small but wrap it in a button with padding.

#### F-011 · FITStark logo is dressed as a header but functions as branding
**Where:** Top of every screen.
**Impact:** "FITStark" in 20px red caps with 4px letter-spacing reads as marketing header, not as in-app branding. On the home dashboard especially, the visual weight competes with the actual page content.
**Fix:** On screens that aren't the gate or home, demote FITStark to a small (12-14px) muted label, OR replace with a contextual page title.

#### F-012 · Carte musculaire freshness gradient adds 6 more colors
**Where:** Anatomy heat-map screen.
**Impact:** The 5-color freshness scale (green → teal → orange → red → dark red) is semantically justified — but it appears on top of the home screen's already-busy palette. Net result: 14+ colors.
**Fix:** Lock the freshness gradient as the **only** semantic gradient in the app. Remove the multi-color section borders so the freshness scale gets to "speak."

### POLISH

#### F-013 · Decorative emojis in titles (AI slop pattern #7)
**Where:** Onboarding (👋🎯🚀), workout (💡✦), home (💡🏋️).
**Impact:** Each individually is fine; collectively they read as AI-template.
**Fix:** Remove or replace with consistent custom SVG icons. Keep the 💡 for hint blocks if you commit to it as a "tip" pattern.

#### F-014 · No motion or micro-interactions
**Where:** Everywhere.
**Impact:** Set completion is instant. Step changes are instant. Onboarding transitions are instant. The app feels static.
**Fix:** Add 3 intentional motions: (1) entrance fade on screen change (150ms ease-out), (2) checkmark animation on set completion (300ms scale + opacity), (3) timer countdown number animation (subtle scale on each second). Total cost: ~30 min.

#### F-015 · Centered single-column on desktop
**Where:** Onboarding screens.
**Impact:** AI slop pattern #4 (centered everything). On a 1440px viewport, the onboarding card is 360px wide centered with massive empty space. Looks like a mobile mockup deployed without thought to desktop.
**Fix:** Side-by-side layout for the onboarding form fields at desktop width, OR keep narrow column but make it a deliberate splash design with brand imagery on one side.

---

## Legal pages addendum (privacy.html + terms.html)

Audited 2026-05-14 same session.

### F-016 · CRITICAL · `privacy.html` 3-col tables overflow on mobile (P0)
**Where:** `privacy.html` mobile (390px viewport).
**Impact:** Document width = 536px on a 390px viewport — **146px of horizontal overflow**. User sees a horizontal scrollbar on the whole page. The "Donnée / Exemple / Finalité" data tables (sections 2.1, 2.2, 3) are the culprits. Three tables, each ~393px wide on a 390px viewport.
**Fix options:**
- **A (quick):** wrap each `<table>` in `<div style="overflow-x:auto">` so horizontal scroll is local to the table, not the document. ~5 min.
- **B (proper):** mobile-only stacked card layout — at <640px each table row becomes a card with label-above-value pairs. ~20 min, much better UX.
**Recommended:** B for a public legal page that real users will read. RGPD compliance matters — readability matters.
**Screenshot:** `privacy-mobile.png`

### Strengths (legal pages)
- **Real semantic H1/H2/H3** (30px → 22px → 17px) — exactly what the main app should have
- **TL;DR box** at the top of both pages with red left-border + light pink bg — best info-design pattern on the whole site
- **Max-width 760px** on desktop = correct reading measure
- **Clean typography:** `-apple-system` system stack, weight discipline (900 H1 → 800 H2 → 700 H3)
- **No AI slop patterns** — single accent (red), no decorative gradients, no emoji-as-design
- **TL;DR is the standout idea** — should be borrowed into the main app for the medical disclaimer gate

### Verdict on legal pages
**Design Score: 8.5 / A-** — far better than the main app. These pages are what the rest of the app should look like in terms of restraint and typography discipline. Use them as the visual reference for the redesign.

---

## Strengths (don't break these)

These elements are above-average for a free fitness PWA. Worth preserving when fixing the issues above.

- **Real exercise photos** (Départ + Fin labels) on the workout screen — uncommon for free apps, genuinely useful for form correction
- **Évidence-based content** with citations (Huang, McGill, Mifflin-St Jeor, Epley/Brzycki) — credibility moat
- **Medical disclaimer gate** before app entry — professional/legal maturity rare in side-project PWAs
- **Plate calculator** is well-structured: input + quick-pick chips + clear result + plate breakdown
- **Carte musculaire** with CC BY-SA attribution = great concept + ethical asset usage
- **Service worker caching** = FCP 36ms on revisit (effectively instant)
- **Zero console errors** (only 2 deprecation warnings, both trivial)
- **Onboarding is 3 short screens** with a "Passer" skip option = respects users
- **RIR (Reps in Reserve) input** with 0-4 chips and inline definition = serious lifter UX

---

## Litmus scorecard

| Check | Status |
|---|:-:|
| Brand/product unmistakable in first screen? | **partial** — FITStark present but cyan banner steals attention |
| One strong visual anchor present? | **NO** — 8 competing accents |
| Page understandable by scanning headlines only? | **YES** — content is well-labeled |
| Each section has one job? | **YES** — each card is a clear task |
| Are cards actually necessary? | **PARTIAL** — workout screen yes, home dashboard no |
| Does motion improve hierarchy or atmosphere? | **NO** — zero motion |
| Would design feel premium with all decorative shadows removed? | **NO** — shadows + colored borders are doing the visual work |

---

## Design Score

| Category | Weight | Grade | Score |
|---|:-:|:-:|:-:|
| Visual Hierarchy | 15% | C | 5.0 |
| Typography | 15% | C+ | 6.0 |
| Spacing & Layout | 15% | C- | 4.5 |
| Color & Contrast | 10% | D | 4.0 |
| Interaction States | 10% | B | 7.0 |
| Responsive | 10% | C | 5.5 |
| Content Quality | 10% | A | 9.0 |
| AI Slop | 5% | D+ | 4.0 |
| Motion | 5% | F | 1.0 |
| Performance | 5% | A | 9.5 |

**Weighted Design Score: 5.6 / 10 → C+**
**AI Slop Score: 4.0 / 10 → D+**

---

## Quick Wins (< 30 min each, highest leverage)

If you only have a few hours, do these in order. Score impact in parens.

1. **Fix install banner positioning** (F-001) — `position: fixed; bottom: 56px;` so it sits above the tab bar instead of mid-content. Eliminates the P0 mobile workout bug. *Hierarchy +1, Responsive +1.5*
2. **Reduce home dashboard to brand red + 2 semantic colors max** (F-002) — Pick: red for "lift/strength", green for "recovery/freshness", neutral for everything else. Repaint borders. *Color +3, AI Slop +3*
3. **Make FITStark logo a small muted label everywhere except home/gate** (F-011) — 5-min CSS change, instantly de-marketingifies the app. *Hierarchy +1*
4. **Fix mobile stepper overflow** (F-009) — `overflow-x: auto; scroll-snap-type: x mandatory;`. *Responsive +0.5*
5. **Fix 2 console deprecation warnings** (F-008) — ship hygiene. *Perf +0.5*

**Estimated effect of doing all 5: Design Score 5.6 → 7.2 (C+ → B+).**

## Next Pass (after quick wins)

6. Add 3 intentional motions (F-014) — entrance fade, set-complete checkmark, timer scale. *Motion +5*
7. Desktop 2-column grid on >960px (F-003) — *Responsive +2, Layout +1*
8. Fixed-bottom tab bar (F-004) — *Responsive +1*
9. Map section titles to real `<h2>/<h3>` (F-007) — *Typo +2, A11y win*

**Estimated effect of all 9 fixes: Design Score 7.2 → 8.5 (B+ → A-).**

---

## Files

Screenshots: `.design-audit/screenshots/`
Report: `.design-audit/design-audit-apex.md`

**STATUS:** DONE — full visual audit complete. 15 findings logged, scored, prioritized. Awaiting decision on whether to enter fix loop or stop at report.
