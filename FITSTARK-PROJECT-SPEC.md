# FITStark FITNESS — Spécification complète du projet

> **Document de référence pour Claude Code**
> Dernière mise à jour : 3 mai 2026
> Version actuelle de l'app : v8.0 — Force + Cardio + Core + Nutrition
> Cache Service Worker : `apex-v8.0`
> Ce document sert de source de vérité pour tout développement futur.

---

## 1. Vision & Positionnement

### Tagline
> "L'app de force qui s'adapte à ton corps — même quand ton dos ne suit pas."

### Pitch
FITStark Fitness est une PWA d'entraînement complète (Force + Cardio + Core + Nutrition) qui se différencie par :
1. **Adaptation aux pathologies lombaires** (L5-S1) — aucun concurrent ne le fait, programme Core Heavy 12 semaines anti-flexion intégré
2. **Progression scientifiquement validée** (protocole APRE, #1 mondial, SUCRA 93%)
3. **WODs rotatifs** intégrés au programme de force — hybride musculation + conditioning
4. **Nutrition Mifflin-St Jeor** intégrée avec macros + suivi de poids + DB protéines (USDA / Ciqual ANSES)
5. **Cardio multi-mode** : course, nage, vélo avec dérivés (vitesse, allure, FC zones)
6. **Zéro dépendance, zéro abonnement, zéro pub** — vanilla HTML/CSS/JS, ~120KB

### Public cible (3 personas)
1. **Le lifter blessé** (primaire) — 28-45 ans, pathologie lombaire, veut continuer à s'entraîner safe. Marché : 46-106M de personnes dans le monde (23-53% des lifters ont des douleurs de dos).
2. **L'intermédiaire structuré** — 25-40 ans, veut un PPL avec périodisation sans payer un coach.
3. **Le CrossFitter hybride** — veut tracker force ET WODs dans une seule app.

---

## 2. Architecture technique actuelle

### Stack
- **Frontend** : HTML/CSS/JS vanilla — fichier unique `index.html` (~120KB, 864 lignes)
- **Storage** : localStorage (navigateur) + sauvegarde session active en temps réel
- **Images exercices** : free-exercise-db (GitHub, domaine public) — `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/`
- **Liens vidéo** : Recherche Google MuscleWiki + YouTube (résilient aux 404 de slug)
- **PWA** : manifest.json + Service Worker (cache offline + détection auto de nouvelle version + toast)
- **Hébergement** : Firebase Hosting — `https://apexfit-da753.web.app` (alias `.firebaseapp.com`)
- **Source code** : GitHub `latludovic3097/apex-fitness` (Pages désactivé, repo gardé pour versioning)
- **Son** : Web Audio API (AudioContext) — 3 bips à la fin du timer (init au premier gesture pour iOS Safari)
- **Sécurité** : helper `esc()` pour escape XSS sur toutes les valeurs user-controllable (notes, imports CSV/JSON)

### Fichiers du projet
```
index.html        — App complète (66KB)
manifest.json     — Config PWA
sw.js             — Service Worker (cache offline)
icon-192.png      — Icône PWA petite
icon-512.png      — Icône PWA grande
README.md         — Documentation
```

### Clés localStorage
- `apex-fit-v8` — données principales : `{history, phase, cardio, core, nut}`
- `apex-fit-v8_a` — session active : `{sid, ei, log, notes, t0, exercises}`
- `apex_disclaimer` — flag disclaimer médical accepté

### Pattern de rendu
- Rendu complet via `R()` qui reconstruit le innerHTML de `#app`
- Les inputs de sets utilisent `onchange="onInp(this)"` avec data-attributes pour éviter de re-render (pas de perte de focus)
- Le timer utilise `Date.now()` + `requestAnimationFrame` (anti-throttle navigateur)
- Le timer persiste en arrière-plan quand l'utilisateur navigue entre exercices (bannière flottante)

---

## 3. Fonctionnalités implémentées (v7.0)

### 3.1 Programme PPL
- 3 sessions : PUSH (pectoraux/épaules/triceps), PULL (dos/biceps/épaules), LEGS (quads/ischio/mollets/core)
- 6 exercices par session, chacun avec :
  - 2 images anatomiques (position départ + fin) depuis free-exercise-db
  - Lien MuscleWiki (guide + vidéo)
  - Lien YouTube (tutoriel forme)
  - Notes techniques avec points clés en gras
  - Coaching tips (2-3 par exercice)
  - Flag L5-S1 safe + alerte orange si exercice sensible
  - Record précédent (PR) affiché
  - Suggestion de charge APRE
  - Estimation 1RM

### 3.2 Échauffement structuré
- Chaque session a 6 mouvements d'échauffement spécifiques
- McGill Big 3 (Curl-up, Side Plank, Bird Dog) + Dead Bug dans chaque session
- Push ajoute : Band Pull-Aparts + Shoulder CARs
- Pull ajoute : Band Pull-Aparts + Scapular Pull-ups
- Legs ajoute : Goblet Squat léger + Glute Bridges
- Chaque mouvement a : image, reps, notes techniques, liens MuscleWiki + YouTube

### 3.3 WODs rotatifs
- 5 WODs par session (15 au total), types : AMRAP, For Time, EMOM, Tabata, Chipper
- Rotation automatique : le WOD le moins récemment fait est sélectionné (LRU logic)
- Le nom du WOD est sauvé dans l'historique
- Chaque mouvement du WOD a : image, lien MuscleWiki, lien YouTube
- Timer adapté au type de WOD (countdown pour AMRAP/EMOM/Tabata, pas de timer pour For Time/Chipper)

#### Pool PUSH
| # | Type | Nom | Mouvements |
|---|------|-----|------------|
| 1 | AMRAP 8min | Push Storm | 10 Push-ups, 10 DB Thrusters, 10 Sit-ups McGill |
| 2 | For Time | 21-15-9 | DB Push Press + Step-back Burpees |
| 3 | EMOM 10min | Push EMOM | pair: 12 KB Swings, impair: 8 Diamond Push-ups |
| 4 | Tabata 4min | Push Tabata | Push-ups 20s/10s ×8 |
| 5 | AMRAP 10min | Ground to OH | 5 Devil's Press, 10 Plate Ground-to-OH, 15 Flutter Kicks |

#### Pool PULL
| # | Type | Nom | Mouvements |
|---|------|-----|------------|
| 1 | EMOM 10min | Pull EMOM | pair: 12 Ring Rows, impair: 8 DB Rows/bras |
| 2 | For Time | Pull Chipper | 5 rounds: 5 Pull-ups + 10 KB Swings + 15 Sit-ups |
| 3 | AMRAP 8min | Row Storm | 8 Renegade Rows, 12 Band Pull-Aparts, 16 Dead Bugs |
| 4 | Tabata 4min | Pull Tabata | Body Rows 20s/10s ×8 |
| 5 | AMRAP 12min | Endurance Pull | 6 DB Rows/bras, 8 Hammer Curls légers, 200m Run |

#### Pool LEGS
| # | Type | Nom | Mouvements |
|---|------|-----|------------|
| 1 | Chipper | Leg Chipper | 20 Burpees, 30 KB Swings, 40 Air Squats, 30 KB Swings, 20 Burpees |
| 2 | For Time | Leg Builder | 5×12 Goblet Squats + 5×12 KB Deadlifts + 5×12 Box Step-ups |
| 3 | EMOM 12min | Legs EMOM | min1: 10 Air Squats, min2: 8 Lunges, min3: 6 Glute Bridges |
| 4 | AMRAP 10min | Quad Blaster | 15 Wall Balls, 10 Step-back Lunges, 5 Broad Jumps |
| 5 | Tabata 4min | Squat Tabata | Goblet Squat / Glute Bridge alternés |

### 3.4 Périodisation 3 phases
| Phase | Sets | Reps | Repos | Description |
|-------|------|------|-------|-------------|
| Force | 5 | 4-6 | 180s | Charges lourdes, APRE 3/6 |
| Hypertrophie | 4 | 8-12 | 90s | Volume modéré, APRE 10 |
| Deload | 3 | 15-20 | 60s | Récupération active |

- Sélecteur de phase sur la home + dans les réglages
- La phase ajuste automatiquement : nombre de sets, reps cibles, repos
- Badge de phase visible sur chaque exercice

### 3.5 Auto-progression APRE
**Source scientifique** : Huang et al. 2025, méta-analyse réseau — APRE classé #1 (SUCRA 93%), supérieur au VBT, RPE, et PBRT. Mann et al. — APRE > périodisation linéaire sur 6 semaines chez des joueurs D1.

**Implémentation** : table d'ajustement APRE adaptée à chaque phase :

Pour APRE 6 (Force) :
- 0-2 reps → 🔴 trop lourd, -5kg
- 3-4 reps → 🟠 lourd, maintiens
- 5-7 reps → 🟢 optimal
- 8-12 reps → 🔵 progression, +2.5kg
- 13+ reps → ⚪ trop léger, +5kg

L'app analyse le dernier set AMRAP de la session précédente et affiche la suggestion avec code couleur.

### 3.6 Estimation 1RM
**Sources** : DiStasio 2014 (±2.7kg pour Epley à 3RM), études comparatives de 7 formules.

**Implémentation** :
- ≤10 reps : moyenne Epley + Brzycki (meilleure précision)
  - Epley : `1RM = W × (1 + R/30)`
  - Brzycki : `1RM = W / (1.0278 - 0.0278 × R)`
- >10 reps : Mayhew (meilleur à haut volume)
  - Mayhew : `1RM = W / (0.522 + 0.419 × e^(-0.055 × R))`
- Affiché sur la home pour les compound lifts + sous chaque exercice
- Inclus dans l'export CSV

### 3.7 RIR Tracker (Reps In Reserve)
- Sélecteur 0-4 après chaque exercice
- 0 = failure, 1 = pouvais en faire 1 de plus, 4 = facile
- Sauvé dans l'historique et l'export CSV
- Utilisé par l'algo APRE pour affiner les suggestions
- Source : Larsen 2021, Zhang 2021 — RIR-based RPE > protocoles à % fixes

### 3.8 Fatigue Score
- Compare le volume des 7 derniers jours à la moyenne hebdomadaire
- Score 0-100 avec code couleur :
  - Rouge (>75) : surcharge — envisage un deload
  - Vert (55-75) : bon rythme
  - Bleu (<55) : volume faible, tu peux pousser
- Barre de progression visuelle sur la home

### 3.9 Rest Day Intelligence
- Recommande la session la moins récemment faite
- Affiche le nombre de jours depuis la dernière session de ce type
- Affiche le WOD qui sera utilisé
- Carte clickable sur la home

### 3.10 Alerte Deload automatique
- Après ~15 séances en 6 semaines sans phase Deload
- Alerte orange avec bouton pour passer directement en Deload
- Source : Sports Med Open 2024 (246 athlètes) — deload moyen toutes les 5.6 semaines

### 3.11 Mode Back Pain Safe (L5-S1)
- Disclaimer médical au premier lancement (acceptation obligatoire)
- Rappel sur la home : obligatoire/interdit/modifié
- Flag `l5safe` et `l5warn` sur chaque exercice
- Alertes orange en temps réel sur les exercices sensibles :
  - Romanian Deadlift : "DOS NEUTRE OBLIGATOIRE. Arrête si douleur."
  - Back Squat : "Ceinture obligatoire. Stop si douleur lombaire."
  - OHP : "Attention à ne pas cambrer — abdos et fessiers serrés"
  - Bench DB Row : "Toujours sur banc — jamais de row penché libre"
- Substitutions intégrées : bent-over row → bench-supported DB row, deadlift conventionnel → Romanian DL amplitude réduite, burpees → step-back burpees

### 3.12 Timer
- **Timestamp-based** : `Date.now()` comme référence absolue (anti-throttle)
- **requestAnimationFrame** pour les updates UI
- **Son** : 3 bips via Web Audio API (AudioContext, 880Hz) à la fin
- **Persistance** : le timer continue quand l'utilisateur navigue entre exercices
- **Bannière flottante** : quand le timer tourne et l'utilisateur est sur un autre exercice, une barre en haut montre le temps restant (clickable pour revenir)
- Cercle SVG animé avec progression

### 3.13 Tracking & Historique
- Saisie poids (kg) + reps pour chaque set
- Sauvegarde en temps réel dans localStorage (pas de perte si changement d'onglet)
- Session active restaurée si l'app est fermée et rouverte
- Historique détaillé : date, durée, phase, WOD utilisé, tous les sets/reps/kg/volume, notes, RIR
- Bouton "Détails" pour déplier chaque entrée
- Graphiques SVG (sans librairie) :
  - Volume hebdomadaire (barres)
  - Poids max par exercice (ligne, sélecteur dropdown)

### 3.14 Export / Import
- **CSV** : séparateur `;` (compatible Excel FR), BOM UTF-8, colonnes : Date, Session, Phase, Durée, Exercice, Muscle, Set, Kg, Reps, Volume, 1RM est., RIR, Notes
- **JSON backup** : export complet (history + phase + cardio + core + nut)
- **Import fichier** : sélecteur natif `<input type=file>` accepte CSV (séparateur `;`/`,`, BOM, dates FR/ISO, virgule décimale, colonnes optionnelles) et JSON
- **Fusion intelligente** : dédup par `date(YYYY-MM-DD) + sessionName` — préserve les séances existantes en cas de conflit
- **Effacement sécurisé** : `safeWipe()` force un téléchargement de backup JSON AVANT le `confirm()` de suppression

### 3.15 Cardio (multi-mode)
3 modes : **Course** (durée, vitesse km/h, inclinaison %), **Nage** (distance m, durée min), **Vélo** (durée, inclinaison, résistance 1-20).
Dérivés calculés en live : km parcourus, allure min/km (course), allure /100m (nage).
Encart pédagogique zones FC (220-âge) + pyramide polarisée Seiler 2010 (80% Z2 / 10% Z3 / 10% Z4-5).
Persisté dans `S.cardio`, archivé dans `S.hist` avec `sessionId="cardio"`.

### 3.16 Core Heavy (programme 12 semaines, L5-S1 safe)
Programme structuré sur 12 semaines, 2 séances/semaine, ~12 min en fin de séance PPL.
2 exercices uniquement, **aucune flexion lombaire chargée** :
- **Cable Pallof Press** — anti-rotation, charge progressive 25→55kg
- **Heavy Suitcase Carry** — anti-flexion latérale, charge 22→44kg/main

Validés McGill / Behm / Escamilla. Sit-up, crunch, russian twist explicitement exclus.
État : `S.core = {startDate, coreLog, coreNotes, coreT0, ei}`.
Auto-calcul de la semaine en cours via `coreCurrentWeek()`. Critères de stop : sciatique, douleur >24h.

### 3.17 Nutrition (Mifflin-St Jeor + macros + DB protéines)
- **BMR** : Mifflin-St Jeor 1990 — formules différenciées H/F
- **TDEE** = BMR × facteur d'activité (5 paliers : sédentaire 1.2 → athlète 1.9)
- **Cible kcal** = TDEE + objectif (-500 à +500 kcal/j)
- **Macros** : protéines = poids × `proteinPerKg` (défaut 2g/kg, Helms 2014), lipides = poids × `fatPerKg` (défaut 0.8g/kg), glucides = reste des kcal
- **Suivi de poids** : pesées datées, graphique SVG ligne, historique avec suppression individuelle
- **DB protéines** : ~50 aliments classés par catégorie (viandes, poissons, œufs/laitages, végétaux, compléments), tri par densité protéique décroissante, sources USDA FoodData Central + Ciqual ANSES
- État : `S.nut = {weight, height, age, sex, activity, goal, proteinPerKg, fatPerKg, weightLog}`

---

## 4. Protocole L5-S1 — Détail médical

### Échauffement obligatoire (toutes les sessions)
1. McGill Curl-up : 3×10, hold 10s — activation abdominale sans flexion lombaire
2. Side Plank : 2×30s/côté — stabilité latérale
3. Bird Dog : 2×8/côté, hold 5s — contrôle anti-rotation
4. Dead Bug : 2×10 — coordination sans charge lombaire

### Exercices interdits
- Bent-over barbell row → remplacé par Bench-Supported DB Row (unilatéral)
- Deadlift conventionnel → remplacé par Romanian Deadlift amplitude réduite
- Burpees classiques → Step-back burpees uniquement
- Good mornings, hyperextensions lourdes

### Exercices sous surveillance (alertes actives)
- Back Squat : ceinture obligatoire, profondeur contrôlée
- Romanian Deadlift : dos strictement neutre, arrêt immédiat si douleur
- OHP Debout : gainage strict, pas de cambrure compensatoire
- Farmer's Walk : épaules basses, pas courts

### Sources
- McGill, S. (2015). Back Mechanic. Backfitpro Inc.
- McGill, S. (2016). Ultimate Back Fitness and Performance. Backfitpro Inc.
- Squat University (2018). The McGill Big 3 for Core Stability.

---

## 5. Sources scientifiques

| Référence | Sujet | Finding clé |
|-----------|-------|-------------|
| Huang et al. 2025 (Shanghai University of Sport) | Méta-analyse réseau APRE vs VBT vs RPE vs PBRT | APRE = #1 (SUCRA 93% squat, bench) |
| Mann et al. 2010 (J Strength Cond Res) | APRE vs périodisation linéaire, 23 D1 football | APRE > LP en bench 1RM, squat 1RM, reps à 225lb |
| DiStasio 2014 (Southern Illinois University) | Validation Epley/Brzycki pour squat 1RM | Epley à 3RM : ±2.7kg, Brzycki à 5RM : ±3.1kg |
| Larsen 2021 (Systematic Review) | RIR-based RPE vs % fixe | RIR-RPE > PBRT pour gains de force |
| Zhang 2021 (SR/Meta-analysis) | Autorégulation vs % fixe chez athlètes | Autorégulé > fixe globalement |
| Sports Med Open 2024 (246 athlètes) | Pratiques de deload en force | Deload moyen : 6.4j tous les 5.6 sem |
| Chaves et al. 2024 (Int J Sports Med) | Surcharge par charge vs par reps | Les deux fonctionnent, charge légèrement supérieure |
| Hoy et al. 2012 | Prévalence mal de dos | 84% auront au moins 1 épisode dans leur vie |
| Training Room NOLA 2023 | Douleurs lombaires chez lifters | 23-53% rapportent des douleurs |
| PubMed 2023 (Narrative Review) | Chronic LBP chez weight lifters | Jusqu'à 59% d'injuries chroniques |

---

## 6. Bugs connus & corrigés (historique)

| Bug | Cause | Fix |
|-----|-------|-----|
| Timer repart à zéro si changement d'onglet | `setInterval` throttlé par le navigateur | Timer basé sur `Date.now()` + `requestAnimationFrame` |
| Timer se coupe quand on change d'exercice | `setEi()` appelait `tStop()` | Supprimé `tStop()` de `setEi()`, ajouté bannière flottante |
| Données saisies perdues en naviguant | État en mémoire JS perdu au re-render | Sauvegarde `S.log` dans localStorage en temps réel via `saveA()` |
| Historique enregistre tout à zéro | `R()` re-render détruisait les values des inputs | `onchange` via `onInp()` sauve dans `S.log` sans re-render complet |
| App ne charge pas (écran blanc) | Artifact React trop lourd + Google Fonts bloquant | Passage en HTML pur vanilla JS, suppression fonts externes |
| Son fin de timer non fonctionnel | Pas de son implémenté | Web Audio API, 3 bips 880Hz via `AudioContext` |
| Bip timer muet sur iOS Safari | iOS exige création d'AudioContext sur gesture utilisateur | `initAudio()` lié à `touchstart`/`click` `{once:true}`, `resume()` avant chaque beep |
| Cache SW bloque les nouvelles versions chez l'utilisateur | Cache-first sans détection d'update | SW v8.0 : message `SKIP_WAITING` + `clients.claim()` ; client : `updatefound` → toast "Nouvelle version disponible" cliquable, `controllerchange` → reload auto, `reg.update()` au `visibilitychange` |
| Faille XSS dans les notes (innerHTML interpolation) | Templates litéraux sans escape | Helper `esc()` appliqué à `h.notes`, `S.notes`, `c.notes`, `S.core.coreNotes`, `h.sessionName`, `h.wodName`, `h.phase`, `x.name` |
| Pinch-to-zoom bloqué (a11y) | `user-scalable=no` dans le viewport | Remplacé par `maximum-scale=5` |
| Effacement historique irréversible | Un seul `confirm()` puis `S.hist=[]` | `safeWipe()` force le téléchargement d'un backup JSON complet avant le `confirm()` |

---

## 7. Roadmap — Features à implémenter

### Tier 1 — Priorité haute (court terme)

#### 7.1 Firebase Auth + Firestore (CRITIQUE)
**Pourquoi** : localStorage = perte de données si cache vidé ou changement de téléphone. C'est le bloquant #1 pour la rétention.
**Spec** :
- Login Google (Firebase Auth)
- Sync automatique de l'historique dans Firestore
- Fallback localStorage si offline
- Migration transparente des données existantes
- Gratuit jusqu'à 1GB (Spark plan)

#### 7.2 Bibliothèque de pathologies
**Pourquoi** : ne pas se limiter au L5-S1 — épaules, genoux, poignets sont aussi très courants.
**Spec** :
- L'utilisateur sélectionne ses pathologies dans les réglages
- Chaque exercice a des flags de compatibilité par pathologie
- Substitutions automatiques proposées
- Alertes contextuelles adaptées

#### 7.3 Notifications / rappels
**Pourquoi** : sans rappel, pas de rétention.
**Spec** :
- Push notifications (si PWA installée)
- Rappel si >3 jours sans séance
- Rappel d'export hebdomadaire

#### 7.4 Warm-up dynamique
**Pourquoi** : si l'utilisateur a signalé une douleur la dernière fois, l'échauffement devrait s'adapter.
**Spec** :
- Après chaque séance, question optionnelle : "Douleur ressentie ?" avec body map simplifié
- Si douleur épaule → ajouter rotations externes, CARs, étirements spécifiques
- Si douleur dos → allonger le McGill Big 3, ajouter Cat-Camel

### Tier 2 — Différenciant (moyen terme)

#### 7.5 Coach IA post-séance (Claude API)
**Pourquoi** : analyse personnalisée des données = valeur premium.
**Spec** :
- Après chaque séance, bouton "Analyse IA"
- Envoie l'historique récent à Claude Sonnet via l'API Anthropic
- Feedback personnalisé : stagnation, suggestions de variation, alerte surcharge
- Utiliser `claude-sonnet-4-20250514` (léger, rapide, pas cher)
- Limiter à 1000 tokens par appel

#### 7.6 Body map interactif
**Pourquoi** : visualisation unique que personne ne fait.
**Spec** :
- SVG d'une silhouette humaine (face + dos)
- Chaque muscle cliquable → affiche : volume cumulé, fréquence, dernier entraînement, PR
- Code couleur par fraîcheur (vert = récent, rouge = négligé)
- Heatmap du volume par muscle

#### 7.7 Superset / Circuit mode
**Pourquoi** : beaucoup de programmes intermédiaires utilisent des supersets.
**Spec** :
- Possibilité de lier 2 exercices
- Timer unique entre les deux
- Alternance automatique A/B/A/B

#### 7.8 Programme custom
**Pourquoi** : le PPL prédéfini ne convient pas à tout le monde.
**Spec** :
- Éditeur de programme : ajouter/supprimer/réordonner des exercices
- Bibliothèque d'exercices (free-exercise-db, 800+ exercices)
- Sauvegarder plusieurs programmes
- Partager un programme via JSON/lien

### Tier 3 — Premium / Backend (long terme)

#### 7.9 Sync multi-device
- Firebase Realtime Database ou Supabase
- Sync automatique en background
- Résolution de conflits last-write-wins

#### 7.10 Communauté / Social
- Partage de séances (lien public)
- Leaderboard ratio force/poids de corps
- Programmes partagés par la communauté
- Anonymisé par défaut

#### 7.11 Photo progress
- Capture photo mensuelle
- Alignement automatique (face/profil)
- Timelapse généré côté client

#### 7.12 App Store (TWA / Capacitor)
- Wrapper la PWA en TWA (Trusted Web Activity) pour Google Play
- Ou Capacitor pour iOS + Android
- Même codebase, distribution native

---

## 8. Modèle économique

### Freemium
- **Gratuit** : tout ce qui est implémenté actuellement (tracking, APRE, WODs, 1RM, export CSV, périodisation, mode L5-S1)
- **Premium (9.99€/mois)** : Coach IA, bibliothèque de pathologies étendue, body map, warm-up dynamique, programmes custom
- **Lifetime (79€)** : accès permanent au premium

### Canaux d'acquisition
1. Reddit (r/Fitness, r/weightroom, r/backpain) — partage open source
2. YouTube — tutoriels "S'entraîner avec une hernie discale"
3. TikTok — clips courts de l'app en action
4. Kinés / Ostéos — partenariats de recommandation
5. GitHub — visibilité développeur, contributions open source

---

## 9. Contraintes de développement

### Ce qui doit rester vrai
- **Vanilla JS** : pas de framework (React, Vue, etc.) sauf si migration vers une app native
- **Single file** possible pour la PWA de base (déploiement GitHub Pages simple)
- **Offline first** : l'app doit fonctionner sans connexion
- **Mobile first** : max-width 480px, touch-optimized
- **Pas de tracking utilisateur** : pas de analytics, pas de cookies tiers
- **Pas de pub** : jamais

### Conventions de code
- Noms de variables courts dans le HTML monolithique (S = state, R = render, T = timer, etc.)
- `localStorage` pour la persistance, avec `saveS()` (données permanentes) et `saveA()` (session active)
- Images depuis `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/[NOM]/0.jpg`
- Liens MuscleWiki : `https://musclewiki.com/exercise/[slug]`
- Liens YouTube : `https://www.youtube.com/results?search_query=[termes]`
- Séparateur CSV : `;` (Excel FR)
- Timer : toujours `Date.now()` based, jamais `setInterval` seul
- Formules 1RM : toujours dual (Epley+Brzycki ≤10, Mayhew >10)

### Hardware utilisateur de référence
- Smartphone Android/iOS récent
- Connexion intermittente (salle de sport = wifi instable)
- Usage en salle : une main, entre les sets

---

## 10. Structure de données

### Entrée d'historique (dans `S.hist[]`)
```json
{
  "id": "1714000000000",
  "sessionId": "push",
  "sessionName": "PUSH",
  "phase": "Force",
  "wodName": "Push Storm",
  "date": "2026-04-18T10:30:00.000Z",
  "duration": 55,
  "exercises": [
    {
      "id": "p1",
      "name": "Bench Press",
      "sets": 4,
      "reps": "6-8",
      "muscle": "chest",
      "logged": {
        "0": {"weight": 80, "reps": 8},
        "1": {"weight": 80, "reps": 7},
        "2": {"weight": 82.5, "reps": 6},
        "3": {"weight": 82.5, "reps": 5}
      },
      "rir": 2
    }
  ],
  "notes": "Bon feeling, épaule droite un peu tendue"
}
```

### State global (`S`)
```json
{
  "view": "home|session|history|settings",
  "hist": [],
  "sess": null,
  "ei": -1,
  "log": {},
  "notes": "",
  "t0": null,
  "phase": 0
}
```

---

## 10b. Versioning & déploiement

### Service Worker
- Cache nommé `apex-vX.Y` — **doit être bumpé à chaque release** (sinon les utilisateurs gardent l'ancienne version en cache)
- Stratégie : cache-first, fallback réseau, fallback final sur `index.html`
- Auto-update : nouvelle version détectée → toast cliquable → SW reçoit `SKIP_WAITING` → `controllerchange` → reload auto
- `reg.update()` appelé sur `visibilitychange` (PWA mobile qui revient au premier plan)

### Workflow de release
Source unique : `apex-fitness-repo/` (le seul dossier qui compte).

À chaque release :
1. Éditer les fichiers dans `apex-fitness-repo/`
2. Bumper la version cache dans `sw.js` (`apex-vX.Y`)
3. Commit + push (versioning sur GitHub)
4. Déployer sur Firebase Hosting : `firebase deploy --only hosting`

Le fichier `apex-fitness.html` à la racine est un artefact historique (peut être supprimé si pas utilisé pour preview). Le dossier `apex-fitness-github-pages/` a été supprimé (GitHub Pages désactivé).

## 11. Checklist de validation avant release

- [ ] Timer ne se coupe pas en changeant d'exercice
- [ ] Timer bippe 3 fois à la fin
- [ ] Timer ne dérive pas si onglet en arrière-plan
- [ ] Données saisies persistent si changement d'onglet
- [ ] Session active restaurée après fermeture/réouverture
- [ ] Historique enregistre correctement tous les sets/reps/kg
- [ ] Export CSV ouvrable dans Excel FR (séparateur ;, BOM UTF-8)
- [ ] Import JSON restaure toutes les données
- [ ] Suggestion APRE affichée pour chaque exercice (après 1+ session)
- [ ] 1RM affiché sur la home + sous chaque exercice
- [ ] RIR sauvé dans l'historique et le CSV
- [ ] Alerte deload après ~15 séances en 6 semaines
- [ ] Disclaimer médical au premier lancement
- [ ] Toutes les images d'exercices chargent (avec fallback si erreur)
- [ ] Tous les liens MuscleWiki/YouTube fonctionnent
- [ ] WOD change d'une séance à l'autre (rotation LRU)
- [ ] Chaque mouvement de WOD a image + liens
- [ ] L'app s'installe en PWA sur mobile
- [ ] L'app fonctionne offline après installation
- [ ] Aucune erreur dans la console JS

---

*Ce document est la source de vérité pour le projet FITStark Fitness. Toute modification de l'app doit être reflétée ici.*
