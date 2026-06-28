// FITStark — Bibliothèque de protocoles d'entraînement validés scientifiquement
// Chaque OBJECTIVE a 1-3 METHODS validés par littérature peer-review.
// Sources principales :
// - Helgerud 2007 (HIIT 4×4) · Seiler 2010 (polarized) · Tabata 1996
// - Schoenfeld 2017/2019 (hypertrophie) · Cormie 2011 (puissance)
// - McGill 2010 (Big 3 lombaire) · Behm 2010 (core stability)
// - Mike Israetel (Renaissance Periodization) · Huang 2025 (APRE)
// - Beardsley 2018 (force/vélocité) · Krieger 2010 (volume)

const TRAINING_OBJECTIVES = {
  cardio_resp: {
    id: "cardio_resp",
    name: { fr: "Système cardio-respiratoire", en: "Cardiorespiratory" },
    icon: "🫁",
    color: "#06b6d4",
    desc: { fr: "Améliorer VO2max, capacité aérobie, endurance pulmonaire", en: "Improve VO2max, aerobic capacity, lung endurance" },
    sources: "Helgerud 2007 · Bacon 2013 · Milanović 2015",
    sessionType: "cardio",
    methods: [
      { id: "hiit44", name: { fr: "HIIT 4×4 Norvégien", en: "Norwegian HIIT 4×4" }, desc: { fr: "4 intervalles de 4 min à 85-95% FCmax, 3 min récup active. Le gold standard pour augmenter VO2max (+0.5 ml/kg/min/sem).", en: "4 intervals of 4 min at 85-95% HRmax, 3 min active recovery. Gold standard to boost VO2max (+0.5 ml/kg/min/wk)." }, work: 240, rest: 180, sets: 4, intensity: "85-95% FCmax" },
      { id: "tabata", name: { fr: "Tabata 20/10", en: "Tabata 20/10" }, desc: { fr: "8 rounds de 20s sprint / 10s récup, 4 min total. Augmente VO2max ET capacité anaérobie.", en: "8 rounds of 20s sprint / 10s rest, 4 min total. Boosts VO2max AND anaerobic capacity." }, work: 20, rest: 10, sets: 8, intensity: "All-out (RPE 9-10)" },
      { id: "polarized", name: { fr: "Polarisé Z2 (Seiler)", en: "Polarized Z2 (Seiler)" }, desc: { fr: "80% du temps en Z2 (basse intensité, conversation possible) + 20% en Z5 (HIIT court). Modèle des athlètes d'endurance d'élite.", en: "80% time in Z2 (low intensity, conversational) + 20% in Z5 (short HIIT). Elite endurance athletes' model." }, work: 1800, rest: 0, sets: 1, intensity: "Z2 = 60-70% FCmax" }
    ]
  },

  fat_loss: {
    id: "fat_loss",
    name: { fr: "Perte de gras", en: "Fat loss" },
    icon: "🔥",
    color: "#E63946",
    desc: { fr: "Brûler du gras corporel en conservant le muscle (déficit calorique + protéines)", en: "Burn body fat while preserving muscle (calorie deficit + protein)" },
    sources: "Boutcher 2011 · Helms 2014 · Trexler 2018",
    sessionType: "hybrid",
    methods: [
      { id: "metcon", name: { fr: "Metcon CrossFit-style", en: "CrossFit-style Metcon" }, desc: { fr: "Circuits métaboliques 12-20 min : compound mouvements + cardio. Max kcal/min, EPOC élevé.", en: "Metabolic circuits 12-20 min: compound movements + cardio. Max kcal/min, high EPOC." }, work: 900, rest: 60, sets: 1, reps: 12, intensity: "RPE 8-9",
        perLogType: {
          cardio:  { intensity: { fr: "RPE 8-9 (effort soutenu, court de souffle)", en: "RPE 8-9 (sustained effort, breathless)" } },
          weight:  { intensity: { fr: "RPE 8-9 (charges modérées, 10-15 reps non-stop)", en: "RPE 8-9 (moderate loads, 10-15 reps non-stop)" } },
          reps_bw: { intensity: { fr: "RPE 8-9 (enchaîne sans pause)", en: "RPE 8-9 (no pause between movements)" } }
        }
      },
      { id: "hiit_strength", name: { fr: "HIIT + force hybride", en: "Hybrid HIIT + strength" }, desc: { fr: "Alterne dans la séance : compound lift lourd 3-5 reps puis sprint cardio 30s à fond. Force maintenue, déficit accru.", en: "Alternate within session: heavy compound lift 3-5 reps then all-out 30s cardio sprint. Maintain strength, increase deficit." }, work: 30, rest: 90, sets: 8, reps: 4, intensity: "Lift 80-85% 1RM",
        perLogType: {
          cardio:  { intensity: { fr: "Sprint à fond pendant 30s (RPE 9-10, comme si tu fuyais un ours)", en: "All-out sprint for 30s (RPE 9-10, like running from a bear)" } },
          reps_bw: { intensity: { fr: "Max reps en 30s — mouvement explosif au poids du corps", en: "Max reps in 30s — explosive bodyweight movement" } },
          time:    { intensity: { fr: "Tiens la position 30s en contraction maximale", en: "Hold position 30s at max contraction" } }
        }
      },
      { id: "emom", name: { fr: "EMOM full-body", en: "Full-body EMOM" }, desc: { fr: "Every Minute On the Minute — un mouvement par minute pendant 20-30 min. Densité métabolique élevée.", en: "Every Minute On the Minute — one movement per minute for 20-30 min. High metabolic density." }, work: 60, rest: 0, sets: 25, reps: 10, intensity: "RPE 7-8",
        perLogType: {
          cardio:  { intensity: { fr: "RPE 7-8 (50-60s d'effort par minute, le reste = ton repos)", en: "RPE 7-8 (50-60s effort per minute, the rest is your break)" } }
        }
      }
    ]
  },

  explosivity: {
    id: "explosivity",
    name: { fr: "Explosivité / puissance", en: "Explosivity / power" },
    icon: "⚡",
    color: "#F4A261",
    desc: { fr: "Développer la vitesse de production de force (RFD), saut, sprint, frappes", en: "Develop rate of force development (RFD), jump, sprint, striking" },
    sources: "Cormie 2011 · Haff 2016 · Suchomel 2018",
    sessionType: "strength",
    methods: [
      { id: "plyo", name: { fr: "Pliométrie progressive", en: "Progressive plyometrics" }, desc: { fr: "Sauts en contre-mouvement, depth jumps, broad jumps. 3-5 reps × 4-6 sets, repos 2-3 min pour fraîcheur maximale.", en: "Counter-movement jumps, depth jumps, broad jumps. 3-5 reps × 4-6 sets, 2-3 min rest for max freshness." }, sets: 5, reps: 4, rest: 180, intensity: "Vitesse maximale, qualité > quantité" },
      { id: "olympic_derivatives", name: { fr: "Dérivés haltéro (Power Clean, Snatch)", en: "Olympic derivatives (Power Clean, Snatch)" }, desc: { fr: "Power Clean, Hang Snatch, Push Press. 3-5 reps × 5 sets à 70-85% 1RM. Vitesse de barre prioritaire.", en: "Power Clean, Hang Snatch, Push Press. 3-5 reps × 5 sets at 70-85% 1RM. Bar speed priority." }, sets: 5, reps: 3, rest: 180, intensity: "70-85% 1RM, vitesse max" },
      { id: "ballistic", name: { fr: "Mouvements balistiques", en: "Ballistic movements" }, desc: { fr: "Med ball throws, jump squats au poids du corps + lest léger, kettlebell swings. 5-8 reps × 4 sets.", en: "Med ball throws, jump squats bodyweight + light load, kettlebell swings. 5-8 reps × 4 sets." }, sets: 4, reps: 6, rest: 120, intensity: "Vitesse > charge" }
    ]
  },

  max_strength: {
    id: "max_strength",
    name: { fr: "Force maximale", en: "Maximal strength" },
    icon: "💪",
    color: "#E63946",
    desc: { fr: "Augmenter le 1RM sur les compound lifts (Squat, Bench, Deadlift, OHP)", en: "Increase 1RM on compound lifts (Squat, Bench, Deadlift, OHP)" },
    sources: "Wernbom 2007 · Schoenfeld 2017 · Huang 2025 (APRE)",
    sessionType: "strength",
    methods: [
      { id: "apre", name: { fr: "APRE (auto-régulation)", en: "APRE (auto-regulated)" }, desc: { fr: "4 sets : warm-up, 6 reps @75%, 6 reps @85%, AMRAP @90%. La charge du dernier set ajuste les sessions suivantes automatiquement. #1 mondial SUCRA 93%.", en: "4 sets: warm-up, 6 reps @75%, 6 reps @85%, AMRAP @90%. Last set's reps auto-adjust next sessions. #1 worldwide SUCRA 93%." }, sets: 4, reps: 6, rest: 240, intensity: "75-90% 1RM" },
      { id: "531", name: { fr: "5/3/1 Wendler", en: "5/3/1 Wendler" }, desc: { fr: "Cycles 4 semaines : 5×3, 3×3, 5/3/1, deload. Progression linéaire +2.5kg/cycle. Robuste sur 6+ mois.", en: "4-week cycles: 5×3, 3×3, 5/3/1, deload. Linear progression +2.5kg/cycle. Robust over 6+ months." }, sets: 3, reps: 5, rest: 240, intensity: "65-95% TM (Training Max)" },
      { id: "rpt", name: { fr: "Reverse Pyramid (RPT)", en: "Reverse Pyramid Training" }, desc: { fr: "Set 1 le plus lourd (4-6 reps), set 2 -10% (6-8 reps), set 3 -10% (8-10 reps). Volume optimal avec fatigue minimale.", en: "Set 1 heaviest (4-6 reps), set 2 -10% (6-8 reps), set 3 -10% (8-10 reps). Optimal volume with minimal fatigue." }, sets: 3, reps: 5, rest: 180, intensity: "85% → 75% → 65% 1RM" }
    ]
  },

  hypertrophy: {
    id: "hypertrophy",
    name: { fr: "Hypertrophie (muscle visible)", en: "Hypertrophy (visible muscle)" },
    icon: "🏋️",
    color: "#457B9D",
    desc: { fr: "Construire du volume musculaire : 8-12 reps, RIR 0-2, 10-20 sets/muscle/sem", en: "Build muscle volume: 8-12 reps, RIR 0-2, 10-20 sets/muscle/wk" },
    sources: "Schoenfeld 2017 · Krieger 2010 · Helms 2018",
    sessionType: "strength",
    methods: [
      { id: "ppl_hypertrophy", name: { fr: "Push-Pull-Legs hypertrophie", en: "Push-Pull-Legs hypertrophy" }, desc: { fr: "Split 6 jours : Push/Pull/Legs × 2. 4-5 sets × 8-12 reps. Volume haut, RIR 0-2 sur le dernier set.", en: "6-day split: Push/Pull/Legs × 2. 4-5 sets × 8-12 reps. High volume, RIR 0-2 on last set." }, sets: 4, reps: 10, rest: 90, intensity: "70-80% 1RM, RIR 0-2" },
      { id: "upper_lower", name: { fr: "Upper-Lower 4 jours", en: "Upper-Lower 4 days" }, desc: { fr: "Lun/Jeu Upper, Mar/Ven Lower. Compound + isolation. Bon compromis volume/récup.", en: "Mon/Thu Upper, Tue/Fri Lower. Compound + isolation. Good volume/recovery compromise." }, sets: 4, reps: 8, rest: 90, intensity: "RIR 1-3" },
      { id: "myoreps", name: { fr: "Myo-reps (Borge Fagerli)", en: "Myo-reps (Borge Fagerli)" }, desc: { fr: "Set d'activation 15-20 reps proche échec, puis 4-5 mini-sets de 3-5 reps avec 10-15s repos. Recrutement max en peu de temps.", en: "Activation set 15-20 reps near failure, then 4-5 mini-sets of 3-5 reps with 10-15s rest. Max recruitment in short time." }, sets: 5, reps: 4, rest: 15, intensity: "Échec technique" }
    ]
  },

  muscle_endurance: {
    id: "muscle_endurance",
    name: { fr: "Endurance musculaire", en: "Muscular endurance" },
    icon: "♾️",
    color: "#10b981",
    desc: { fr: "Tenir longtemps sous tension : 15-25 reps, repos courts (30-60s)", en: "Sustain effort over time: 15-25 reps, short rest (30-60s)" },
    sources: "Campos 2002 · Schoenfeld 2015",
    sessionType: "strength",
    methods: [
      { id: "high_reps", name: { fr: "Reps élevées (15-25)", en: "High reps (15-25)" }, desc: { fr: "Charges légères 40-55% 1RM, 4 sets de 15-25 reps, repos 45s. Stimule fibres lentes + capillarisation.", en: "Light loads 40-55% 1RM, 4 sets of 15-25 reps, 45s rest. Stimulates slow fibers + capillarization." }, sets: 4, reps: 20, rest: 45, intensity: "40-55% 1RM" },
      { id: "density_circuit", name: { fr: "Circuit de densité", en: "Density circuit" }, desc: { fr: "5-7 exercices enchaînés sans repos, 3-4 tours. Repos uniquement entre tours (90s).", en: "5-7 exercises back-to-back no rest, 3-4 rounds. Rest only between rounds (90s)." }, sets: 3, reps: 15, rest: 90, intensity: "RPE 7" }
    ]
  },

  mobility: {
    id: "mobility",
    name: { fr: "Mobilité / souplesse", en: "Mobility / flexibility" },
    icon: "🤸",
    color: "#8B5CF6",
    desc: { fr: "Améliorer l'amplitude articulaire et la qualité du mouvement (ATG, FRC)", en: "Improve joint range and movement quality (ATG, FRC)" },
    sources: "Kelly Starrett · ATG (Ben Patrick) · FRC (Andreo Spina)",
    sessionType: "mobility",
    methods: [
      { id: "atg_split", name: { fr: "ATG Knees Over Toes", en: "ATG Knees Over Toes" }, desc: { fr: "Tibialis raises, ATG split squat, backwards sled, Nordic curls. Progression hebdo en amplitude.", en: "Tibialis raises, ATG split squat, backwards sled, Nordic curls. Weekly range progression." }, sets: 3, reps: 10, rest: 60, intensity: "Lent, contrôle total" },
      { id: "frc", name: { fr: "FRC (Functional Range)", en: "FRC (Functional Range)" }, desc: { fr: "CARs (Controlled Articular Rotations) + PAILs/RAILs. 2 min par articulation, daily.", en: "CARs (Controlled Articular Rotations) + PAILs/RAILs. 2 min per joint, daily." }, sets: 3, reps: 5, rest: 30, intensity: "Tension isométrique 30-60%" }
    ]
  },

  core_stability: {
    id: "core_stability",
    name: { fr: "Stabilité du tronc (L5-S1 safe)", en: "Core stability (L5-S1 safe)" },
    icon: "🛡️",
    color: "#2A9D8F",
    desc: { fr: "Renforcer le caisson abdominal sans flexion lombaire chargée (protocole McGill)", en: "Strengthen abdominal box without loaded lumbar flexion (McGill protocol)" },
    sources: "McGill 2010 · Behm 2010 · Tom Morrison",
    sessionType: "core",
    methods: [
      { id: "mcgill_big3", name: { fr: "McGill Big 3", en: "McGill Big 3" }, desc: { fr: "Curl-up modifié + Side Plank + Bird Dog. 3 sets avec contractions descendantes 10/8/6. Le standard absolu post-hernie discale.", en: "Modified curl-up + Side Plank + Bird Dog. 3 sets with descending contractions 10/8/6. Gold standard post-disc-hernia." }, sets: 3, reps: 8, rest: 30, intensity: "Contractions isométriques 10s" },
      { id: "anti_rotation", name: { fr: "Anti-rotation (Pallof, Suitcase)", en: "Anti-rotation (Pallof, Suitcase)" }, desc: { fr: "Pallof Press + Suitcase Carry + Dead Bug. Renforce le tronc en stabilisation, jamais en flexion.", en: "Pallof Press + Suitcase Carry + Dead Bug. Strengthens core in stabilization, never flexion." }, sets: 3, reps: 12, rest: 60, intensity: "Tension constante 30-45s" }
    ]
  },

  joint_health: {
    id: "joint_health",
    name: { fr: "Santé articulaire", en: "Joint health" },
    icon: "🦴",
    color: "#F4A261",
    desc: { fr: "Prévention blessure + renfort tendineux (excentriques lents, Bulgarian protocols)", en: "Injury prevention + tendon strengthening (slow eccentrics, Bulgarian protocols)" },
    sources: "Alfredson 1998 · Beyer 2015 · Kongsgaard 2009",
    sessionType: "strength",
    methods: [
      { id: "heavy_slow", name: { fr: "Excentriques lents lourds (HSR)", en: "Heavy Slow Resistance (HSR)" }, desc: { fr: "Excentriques 3-4s sur charges modérées 70-80% 1RM. Standard pour tendinites (patellaire, achille).", en: "3-4s eccentrics on moderate loads 70-80% 1RM. Standard for tendinopathies (patellar, achilles)." }, sets: 4, reps: 6, rest: 180, intensity: "70-80% 1RM, tempo 3-1-1" },
      { id: "tib_raises", name: { fr: "Tibialis + chaîne postérieure", en: "Tibialis + posterior chain" }, desc: { fr: "Tibialis raises, calf raises lents, Nordic curls. Renforce les muscles trop souvent négligés.", en: "Tibialis raises, slow calf raises, Nordic curls. Strengthens often-neglected muscles." }, sets: 3, reps: 15, rest: 60, intensity: "Excentrique 3s" }
    ]
  },

  posture: {
    id: "posture",
    name: { fr: "Posture & dos", en: "Posture & back" },
    icon: "🪑",
    color: "#06b6d4",
    desc: { fr: "Corriger les déséquilibres posturaux dus au travail assis (cyphose, anteposition épaules)", en: "Correct postural imbalances from desk work (kyphosis, forward shoulders)" },
    sources: "Janda · Vladimir Kogan · McKenzie",
    sessionType: "strength",
    methods: [
      { id: "pull_dominant", name: { fr: "Pull-dominant (ratio 2:1)", en: "Pull-dominant (2:1 ratio)" }, desc: { fr: "2 séries de tirages pour 1 série de poussée. Face Pulls, Band Pull-Aparts, Rows quotidiens.", en: "2 pulling sets for 1 pushing set. Face Pulls, Band Pull-Aparts, daily Rows." }, sets: 4, reps: 12, rest: 60, intensity: "Volume modéré, fréquence haute" },
      { id: "thoracic_extension", name: { fr: "Extension thoracique", en: "Thoracic extension" }, desc: { fr: "Foam roller thoracique, Cobra, Cat-cow, Wall slides. Réveille la mobilité dorsale.", en: "Thoracic foam roller, Cobra, Cat-cow, Wall slides. Wakes up thoracic mobility." }, sets: 3, reps: 10, rest: 30, intensity: "Amplitude max, sans douleur" }
    ]
  },

  rehab: {
    id: "rehab",
    name: { fr: "Réadaptation post-blessure", en: "Post-injury rehab" },
    icon: "🏥",
    color: "#E76F51",
    desc: { fr: "Reprise progressive après douleur : volume bas, intensité contrôlée, focus forme", en: "Progressive return after pain: low volume, controlled intensity, form focus" },
    sources: "Cook 2003 · Kelly Starrett · Stuart McGill",
    sessionType: "strength",
    methods: [
      { id: "deload_protocol", name: { fr: "Deload progressif", en: "Progressive deload" }, desc: { fr: "15-20 reps légers (40-50% 1RM), repos 60s, amplitude réduite si gêne. Sortir du mode douleur avant de remettre du volume.", en: "15-20 light reps (40-50% 1RM), 60s rest, reduced range if discomfort. Exit pain mode before adding volume." }, sets: 3, reps: 18, rest: 60, intensity: "40-50% 1RM, RPE 5-6" },
      { id: "isometric_pain", name: { fr: "Isométriques anti-douleur", en: "Pain-relief isometrics" }, desc: { fr: "Holds isométriques 30-45s à 70% contraction max. Effet analgésique immédiat (Rio 2015) pour tendinites.", en: "Isometric holds 30-45s at 70% max contraction. Immediate analgesic effect (Rio 2015) for tendinopathies." }, sets: 5, reps: 1, rest: 60, intensity: "70% contraction max, 30-45s" }
    ]
  },

  sport_specific: {
    id: "sport_specific",
    name: { fr: "Performance sportive spécifique", en: "Sport-specific performance" },
    icon: "🎯",
    color: "#E63946",
    desc: { fr: "Préparation physique pour sport collectif/combat/endurance (transfert vers la discipline)", en: "Physical prep for team sport / combat / endurance (transfer to the discipline)" },
    sources: "Verkhoshansky · Bondarchuk · Joel Jamieson",
    sessionType: "hybrid",
    methods: [
      { id: "block_periodization", name: { fr: "Périodisation par blocs (Verkhoshansky)", en: "Block periodization (Verkhoshansky)" }, desc: { fr: "Blocs de 3-4 sem : accumulation (volume), transmutation (intensité), réalisation (puissance/peak).", en: "3-4 week blocks: accumulation (volume), transmutation (intensity), realization (power/peak)." }, sets: 4, reps: 6, rest: 180, intensity: "Variable par bloc" },
      { id: "conjugate", name: { fr: "Méthode conjuguée (Westside)", en: "Conjugate method (Westside)" }, desc: { fr: "Max Effort day (1-3RM) + Dynamic Effort day (vitesse 50-60% 1RM) + Repetition day. Force ET vitesse simultanées.", en: "Max Effort day (1-3RM) + Dynamic Effort day (speed 50-60% 1RM) + Repetition day. Strength AND speed simultaneously." }, sets: 8, reps: 3, rest: 60, intensity: "Variable selon journée" }
    ]
  }
};

// Renvoie tous les objectifs en tableau ordonné pour affichage UI
function listObjectives(){
  return Object.values(TRAINING_OBJECTIVES);
}

// v8.44 : Calcule la semaine actuelle du programme actif depuis sa date de création
// Renvoie un entier 1-based, plafonné à prog.duration (terminé)
function getCurrentProgramWeek(prog){
  if(!prog || !prog.createdAt) return 1;
  const startMs = new Date(prog.createdAt).getTime();
  const diffDays = Math.floor((Date.now() - startMs) / 864e5);
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(week, prog.duration || 12));
}

// v8.44 : compte le nombre de séances "custom_program" faites pour (weekIdx, sessIdx)
// → permet de marquer ✓ Terminée sur la home
function countCustomSessionsDone(hist, weekIdx, sessIdx){
  if(!Array.isArray(hist)) return 0;
  return hist.filter(h =>
    h.sessionId === "custom_program" &&
    h._cp && h._cp.weekIdx === weekIdx && h._cp.sessIdx === sessIdx
  ).length;
}

// v8.46 — Planning hebdomadaire adaptatif pour le programme personnalisé.
// Renvoie days[7] avec status (done/today/future/past_rest/today_rest/future_rest)
// + sessIdx (index de la séance du programme) ou null pour rest.
// Logique :
// 1. Mappe les N séances de la semaine en cours sur des jours par défaut selon la fréquence
// 2. Override avec les séances RÉELLEMENT faites cette semaine (S.hist + _cp ref)
// 3. Pour les séances restantes (pas encore faites), les répartit sur les jours futurs depuis aujourd'hui
function computeCustomWeekPlan(prog, hist){
  if(!prog) return null;
  const currentWeek = getCurrentProgramWeek(prog);
  const week = (prog.weeks || []).find(w => w.weekNum === currentWeek);
  if(!week) return null;
  const sessions = week.sessions || [];
  const isDeload = sessions.some(s => /Deload/i.test(s.intensity || ""));

  // Setup dates de la semaine en cours (lundi = jour 0)
  const now = new Date();
  const todayDow = now.getDay();
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - todayIdx);

  const days = [];
  for(let i = 0; i < 7; i++){
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({ date: d, dow: i, status: "pending", sess: null, sessIdx: null });
  }

  // 1) Remplit les jours avec les séances FAITES cette semaine (override absolu)
  const doneSlots = new Set();
  (hist || []).forEach(h => {
    if(h.sessionId !== "custom_program" || !h._cp) return;
    if(h._cp.weekIdx !== currentWeek) return;
    const hd = new Date(h.date);
    if(hd < monday) return;
    const dayIdx = Math.floor((hd.getTime() - monday.getTime()) / 864e5);
    if(dayIdx < 0 || dayIdx > 6) return;
    if(days[dayIdx].sess === null){
      days[dayIdx].sess = "cp_session";
      days[dayIdx].sessIdx = h._cp.sessIdx;
      days[dayIdx].status = "done";
      doneSlots.add(h._cp.sessIdx);
    }
  });

  // 2) Past sans rien : past_rest
  for(let i = 0; i < todayIdx; i++){
    if(days[i].status === "pending"){
      days[i].sess = "rest";
      days[i].status = "past_rest";
    }
  }

  // 3) Liste des séances restant à faire cette semaine
  const remainingSlots = sessions.map((_, idx) => idx).filter(idx => !doneSlots.has(idx));

  // 4) Distribue les séances restantes sur les jours libres depuis aujourd'hui
  // Stratégie : espace les séances autant que possible parmi les jours restants
  const freeDayIndices = [];
  for(let i = todayIdx; i < 7; i++){
    if(days[i].status === "pending") freeDayIndices.push(i);
  }
  // v8.61 — Bug fix : on ne peut placer QUE les séances qui rentrent dans les jours libres
  // Avant : si remainingSlots.length > freeDayIndices.length (4 séances, 3 jours), Math.round(i*step)
  // dépassait après splice → freeDayIndices[neg/oversized index] = undefined → days[undefined].status crash.
  // Fix : on cape le nombre à placer + on garde tous les accès défensifs.
  const toPlace = Math.min(remainingSlots.length, freeDayIndices.length);
  if(toPlace > 0){
    const usedIdx = new Set();
    for(let i = 0; i < toPlace; i++){
      // Espacement régulier dans la fenêtre libre disponible
      const evenPos = toPlace === 1 ? 0 : Math.round(i * (freeDayIndices.length - 1) / (toPlace - 1));
      let dayIdx = freeDayIndices[Math.max(0, Math.min(freeDayIndices.length - 1, evenPos))];
      // Si l'index "idéal" est déjà pris, prends le 1er jour libre restant
      if(dayIdx === undefined || usedIdx.has(dayIdx)){
        for(const d of freeDayIndices){
          if(!usedIdx.has(d)){ dayIdx = d; break; }
        }
      }
      if(dayIdx === undefined || !days[dayIdx]) continue;
      if(days[dayIdx].status === "pending"){
        days[dayIdx].sess = "cp_session";
        days[dayIdx].sessIdx = remainingSlots[i];
        days[dayIdx].status = (dayIdx === todayIdx) ? "today" : "future";
        usedIdx.add(dayIdx);
      }
    }
  }

  // 5) Tous les jours restants → rest
  for(let i = todayIdx; i < 7; i++){
    if(days[i].status === "pending"){
      days[i].sess = "rest";
      days[i].status = (i === todayIdx) ? "today_rest" : "future_rest";
    }
  }

  return { days, currentWeek, totalWeeks: prog.duration, isDeload, totalSessions: sessions.length };
}

// Récupère un objectif par son id, ou null
function getObjective(id){
  return TRAINING_OBJECTIVES[id] || null;
}

// Génère un programme structuré sur N semaines avec freq sessions/sem
// objId : id de l'objectif (ex: "explosivity")
// methodId : id de la méthode choisie (ex: "plyo")
// machineIds : liste des machines disponibles
// duration : nombre de semaines (4-12)
// frequency : sessions par semaine (2-5)
// level : "beginner" | "intermediate" | "advanced"
function generateProgram({objId, methodId, machineIds, duration, frequency, level}){
  const obj = getObjective(objId);
  if(!obj) return null;
  const method = obj.methods.find(m => m.id === methodId) || obj.methods[0];
  // Multiplicateurs de volume selon niveau
  const volMult = level === "beginner" ? 0.7 : level === "advanced" ? 1.3 : 1.0;
  const repsMult = level === "beginner" ? 0.85 : level === "advanced" ? 1.15 : 1.0;
  // Construit les sessions semaine par semaine avec progression linéaire +5% volume/sem
  const weeks = [];
  for(let w = 1; w <= duration; w++){
    const progression = 1 + ((w - 1) * 0.05);  // +5% par semaine
    const sessions = [];
    for(let s = 0; s < frequency; s++){
      sessions.push({
        dayLabel: `S${w}-J${s+1}`,
        sets: Math.round((method.sets || 4) * volMult * progression),
        reps: Math.round((method.reps || 8) * repsMult),
        rest: method.rest || 90,
        work: method.work || null,
        intensity: method.intensity || "RPE 7-8"
      });
    }
    // Deload semaine 4 et 8 si duration >= 8
    if((w === 4 && duration >= 8) || w === 8){
      sessions.forEach(s => { s.sets = Math.max(2, Math.round(s.sets * 0.6)); s.intensity = "Deload — volume -40%"; });
    }
    weeks.push({ weekNum: w, sessions });
  }
  return {
    objective: obj.id,
    objectiveName: obj.name,
    method: method.id,
    methodName: method.name,
    machines: machineIds || [],
    duration, frequency, level,
    createdAt: new Date().toISOString(),
    weeks
  };
}
