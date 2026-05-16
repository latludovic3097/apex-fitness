// FITStark — Bibliothèque de pathologies & risques par exercice
// Sources : Squat University (Aaron Horschig), McGill (Back Mechanic), Kelly Starrett (Becoming a Supple Leopard),
// Tom Morrison (Strength & Conditioning), revue PubMed sur biomécanique des exercices à risque.

const PATHOLOGIES = {
  l5:       { label: "Lombaires (L5-S1)",        icon: "🏥", color: "#E63946", short: "Dos" },
  shoulder: { label: "Épaules",                  icon: "💪", color: "#F4A261", short: "Épaule" },
  knee:     { label: "Genoux",                   icon: "🦵", color: "#E76F51", short: "Genou" },
  wrist:    { label: "Poignets",                 icon: "✋", color: "#8B5CF6", short: "Poignet" },
  elbow:    { label: "Coudes",                   icon: "🦴", color: "#06b6d4", short: "Coude" }
};

// EXERCISE_RISKS[exerciseName][pathologyKey] = { level: "warn"|"avoid", msg: "..." }
// "warn"  = à faire avec précaution + modification de forme
// "avoid" = à éviter complètement, alternative proposée dans `alt`
const EXERCISE_RISKS = {
  // ─── PUSH ───
  "Bench Press": {
    shoulder: { level: "warn", msg: "Coudes à 45° max (pas 90°). Omoplates rétractées et plaquées au banc. Si impingement → préfère le DB bench press, plus tolérant." },
    wrist:    { level: "warn", msg: "Barre dans la base de la paume (pas les doigts). Bracelets de force si poignets douloureux." }
  },
  "OHP Debout": {
    shoulder: { level: "warn", msg: "Mouvement à risque pour les épaules : impingement fréquent avec la barre. Préfère le DB OHP (paumes neutres) ou le Landmine Press." },
    l5:       { level: "warn", msg: "Pas de cambrure lombaire compensatoire — abdos et fessiers serrés. Si dos faible → assis avec dossier (Seated DB Press)." }
  },
  "Incline DB Press": {
    shoulder: { level: "warn", msg: "Banc à 30° (pas 45° ou plus = stress acromion). Pause 1s à mi-course pour contrôle." }
  },
  "Dips Poitrine": {
    shoulder: { level: "avoid", msg: "Très risqué pour la coiffe des rotateurs. À éviter si épaules sensibles. Alt : DB Bench Press incliné.", alt: "Incline DB Press" },
    wrist:    { level: "warn", msg: "Poignets en hyperextension sous charge. Si gêne → utilise des barres parallèles épaisses." }
  },
  "Triceps Dips": {
    shoulder: { level: "warn", msg: "Coudes ne doivent pas remonter au-dessus des épaules. Stop avant si claquement / douleur." },
    elbow:    { level: "warn", msg: "Forte tension sur les tendons. Évite si tendinite. Alt : Cable Pushdown (plus doux)." }
  },
  "Lateral Raises": {
    shoulder: { level: "warn", msg: "Ne dépasse pas la hauteur des épaules. Pouce légèrement vers le haut (anti-impingement)." }
  },
  "Arnold Press": {
    shoulder: { level: "avoid", msg: "Rotation sous charge en position vulnérable. Alt si épaules sensibles : Neutral DB Press (paumes face-à-face).", alt: "Lateral Raises" }
  },
  "Skull Crushers": {
    elbow:    { level: "warn", msg: "Stress maximal sur les tendons du triceps. Si tendinite → swap pour OH Triceps Extension (plus tolérant)." }
  },
  "OH Triceps Ext.": {
    shoulder: { level: "warn", msg: "Mobilité épaule requise. Si raideur → fais-le assis avec dossier." },
    elbow:    { level: "warn", msg: "Excentrique lent 3s pour ménager les tendons." }
  },
  "Triceps Pushdown": {
    elbow:    { level: "warn", msg: "Coudes COLLÉS au tronc (pas devant). Si tendinite : préfère une corde plutôt que la barre." }
  },
  // ─── PULL ───
  "Pull-ups": {
    shoulder: { level: "warn", msg: "Démarre avec les omoplates rétractées (scapular pull-up). Ne descends pas en hyperextension passive si épaules fragiles." },
    elbow:    { level: "warn", msg: "Coudes en supination = stress biceps. Alt si tendinite : Chin-ups prise neutre (paumes face-à-face)." }
  },
  "Bench DB Row": {
    l5:       { level: "warn", msg: "Banc indispensable. JAMAIS de version bent-over libre sans support." }
  },
  "T-Bar Row": {
    l5:       { level: "avoid", msg: "Position penchée + charge lourde = très à risque. Alt : Chest-Supported Row (banc incliné).", alt: "Chest-Supported Row" }
  },
  "Cable Row": {
    l5:       { level: "warn", msg: "Dos NEUTRE. Ne fléchis pas le tronc à la fin du mouvement (cherche pas à 'tirer plus loin')." }
  },
  "Chest-Supported Row": {
    // Aucun risque significatif — c'est l'alternative safe par excellence
  },
  "Face Pulls": {
    // Safe pour toutes pathologies — c'est même un correctif de la santé épaule
  },
  "Barbell Curls": {
    elbow:    { level: "warn", msg: "Barre droite = stress poignet/coude. Préfère la barre EZ. Excentrique 3s." },
    wrist:    { level: "warn", msg: "Barre EZ obligatoire si tendinite poignet." }
  },
  "Preacher Curl": {
    elbow:    { level: "warn", msg: "Isolation totale = stress max sur les tendons. Stop avant la pleine extension si tendinite." }
  },
  "Hammer Curls": {
    // Prise neutre = la plus douce pour coudes et poignets ✓
  },
  // ─── LEGS ───
  "Back Squat": {
    l5:       { level: "warn", msg: "CEINTURE OBLIGATOIRE. Dos neutre, abdos durs (Valsalva). Stop si douleur lombaire pendant ou après." },
    knee:     { level: "warn", msg: "Genoux suivent les orteils (légèrement vers l'extérieur). Profondeur à adapter selon morpho (parallèle suffit). Échauffe avec Goblet Squat léger." }
  },
  "Romanian DL": {
    l5:       { level: "avoid", msg: "TRÈS RISQUÉ si L5-S1 instable. Dos STRICTEMENT neutre, charnière hanche pure, amplitude réduite. Stop si moindre douleur. Alt : KB Deadlift.", alt: "Goblet Squat" }
  },
  "Bulgarian Split Squat": {
    knee:     { level: "warn", msg: "Genou avant ne dépasse pas le pied (sauf si morpho fémur long). Pied arrière surélevé pas trop haut (30 cm max). Stop si douleur rotule." },
    l5:       { level: "warn", msg: "Tronc droit, pas penché en avant. Si lombaires faibles → version DB plutôt que barbell." }
  },
  "Lunges": {
    knee:     { level: "warn", msg: "Genou avant à 90°, ne dépasse pas le pied. Pas long. Si rotule sensible → préfère les Reverse Lunges (moins de cisaillement)." }
  },
  "Step-ups": {
    knee:     { level: "warn", msg: "Pousse sur le talon (pas la pointe). Hauteur du banc adaptée — ne force pas la flexion." }
  },
  "Goblet Squat": {
    // Très safe — l'alternative recommandée si Back Squat à risque
  },
  "Leg Curl": {
    knee:     { level: "warn", msg: "Si douleur derrière le genou (popliteus) → réduit l'amplitude. Pause 1s en fin de contraction (pas de claquement)." }
  },
  "Nordic Curl": {
    knee:     { level: "warn", msg: "Mouvement très exigeant. Si débutant : retiens-toi avec les mains les 80% du chemin. Stop immédiat si crampe." }
  },
  "Calf Raises": {
    // Pas de risque significatif
  },
  "Farmer's Walk": {
    l5:       { level: "warn", msg: "Posture verticale stricte, épaules basses, abdos durs. Si lombaires : commence léger (50% du poids de corps total)." },
    wrist:    { level: "warn", msg: "Si tu peux pas tenir 30m → trop lourd. N'utilise pas de straps si poignets douloureux." }
  },
  "Ab Wheel": {
    l5:       { level: "avoid", msg: "TRÈS risqué pour L5-S1. Le rollout charge les disques en flexion + extension brutale. Alt : Dead Bug (sécurité).", alt: "Plank" }
  },
  "Plank": {
    wrist:    { level: "warn", msg: "Sur les coudes (forearm plank) si poignets douloureux. Hanches pas trop hautes ni basses." }
  }
};

// Renvoie tous les warnings applicables pour un exercice donné, filtrés par les pathologies activées de l'utilisateur
function getExerciseRisks(exName, enabledPaths){
  const risks = EXERCISE_RISKS[exName];
  if(!risks || !enabledPaths || !enabledPaths.length) return [];
  const out = [];
  enabledPaths.forEach(p => {
    if(risks[p]) out.push({ pathology: p, ...risks[p] });
  });
  return out;
}
