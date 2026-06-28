// FITStark — Bibliothèque de machines / équipements de salle
// Catégorisé pour faciliter la sélection multi-machines dans le wizard du module
// Entraînement Personnalisé (v8.42).

const MACHINE_CATEGORIES = {
  free_weights: { fr: "Poids libres", en: "Free weights", icon: "🏋️" },
  racks: { fr: "Racks & barres", en: "Racks & bars", icon: "🦴" },
  cables: { fr: "Câbles & poulies", en: "Cables & pulleys", icon: "🔗" },
  machines_upper: { fr: "Machines haut du corps", en: "Upper body machines", icon: "💪" },
  machines_lower: { fr: "Machines bas du corps", en: "Lower body machines", icon: "🦵" },
  cardio: { fr: "Cardio", en: "Cardio", icon: "🏃" },
  bodyweight: { fr: "Poids du corps", en: "Bodyweight", icon: "🤸" },
  functional: { fr: "Fonctionnel", en: "Functional", icon: "⚡" }
};

const MACHINES = [
  // ─── Poids libres ───
  { id: "dumbbells", cat: "free_weights", name: { fr: "Haltères (paire)", en: "Dumbbells (pair)" }, muscles: ["chest","shoulders","back","arms","quads"] },
  { id: "kettlebells", cat: "free_weights", name: { fr: "Kettlebells", en: "Kettlebells" }, muscles: ["full_body","hamstrings","shoulders"] },
  { id: "barbell_olympic", cat: "free_weights", name: { fr: "Barre olympique 20 kg", en: "Olympic barbell 20 kg" }, muscles: ["chest","back","quads","hamstrings"] },
  { id: "barbell_ez", cat: "free_weights", name: { fr: "Barre EZ", en: "EZ bar" }, muscles: ["biceps","triceps"] },
  { id: "trap_bar", cat: "free_weights", name: { fr: "Barre hexagonale (trap bar)", en: "Trap bar" }, muscles: ["hamstrings","quads","back"] },

  // ─── Racks ───
  { id: "power_rack", cat: "racks", name: { fr: "Power rack", en: "Power rack" }, muscles: ["chest","back","quads","hamstrings"] },
  { id: "squat_rack", cat: "racks", name: { fr: "Squat rack", en: "Squat rack" }, muscles: ["quads","hamstrings","back"] },
  { id: "smith_machine", cat: "racks", name: { fr: "Smith machine", en: "Smith machine" }, muscles: ["chest","shoulders","quads"] },
  { id: "flat_bench", cat: "racks", name: { fr: "Banc plat", en: "Flat bench" }, muscles: ["chest","triceps"] },
  { id: "incline_bench", cat: "racks", name: { fr: "Banc inclinable", en: "Adjustable bench" }, muscles: ["chest","shoulders"] },
  { id: "decline_bench", cat: "racks", name: { fr: "Banc décliné", en: "Decline bench" }, muscles: ["chest","core"] },
  { id: "preacher_bench", cat: "racks", name: { fr: "Banc Larry Scott (preacher)", en: "Preacher bench" }, muscles: ["biceps"] },
  { id: "hyperextension", cat: "racks", name: { fr: "Banc lombaire (hyperextension)", en: "Hyperextension bench" }, muscles: ["lower_back","glutes","hamstrings"] },

  // ─── Câbles ───
  { id: "cable_crossover", cat: "cables", name: { fr: "Crossover (poulies hautes)", en: "Cable crossover" }, muscles: ["chest","shoulders","back","arms"] },
  { id: "cable_low_pulley", cat: "cables", name: { fr: "Poulie basse", en: "Low pulley" }, muscles: ["biceps","triceps","shoulders"] },
  { id: "lat_pulldown", cat: "cables", name: { fr: "Tirage vertical (lat pulldown)", en: "Lat pulldown" }, muscles: ["back","biceps"] },
  { id: "seated_row", cat: "cables", name: { fr: "Tirage horizontal assis", en: "Seated cable row" }, muscles: ["back","biceps"] },

  // ─── Machines haut du corps ───
  { id: "pec_deck", cat: "machines_upper", name: { fr: "Pec deck (butterfly)", en: "Pec deck (butterfly)" }, muscles: ["chest"] },
  { id: "chest_press_machine", cat: "machines_upper", name: { fr: "Machine développé couché", en: "Chest press machine" }, muscles: ["chest","triceps"] },
  { id: "shoulder_press_machine", cat: "machines_upper", name: { fr: "Machine épaules", en: "Shoulder press machine" }, muscles: ["shoulders","triceps"] },
  { id: "lateral_raise_machine", cat: "machines_upper", name: { fr: "Machine élévations latérales", en: "Lateral raise machine" }, muscles: ["shoulders"] },
  { id: "rear_delt_machine", cat: "machines_upper", name: { fr: "Machine épaules arrière (reverse pec deck)", en: "Reverse pec deck" }, muscles: ["shoulders","back"] },
  { id: "bicep_machine", cat: "machines_upper", name: { fr: "Machine biceps", en: "Bicep curl machine" }, muscles: ["biceps"] },
  { id: "tricep_machine", cat: "machines_upper", name: { fr: "Machine triceps", en: "Tricep extension machine" }, muscles: ["triceps"] },

  // ─── Machines bas du corps ───
  { id: "leg_press", cat: "machines_lower", name: { fr: "Presse à cuisses", en: "Leg press" }, muscles: ["quads","glutes","hamstrings"] },
  { id: "hack_squat", cat: "machines_lower", name: { fr: "Hack squat", en: "Hack squat" }, muscles: ["quads","glutes"] },
  { id: "leg_extension", cat: "machines_lower", name: { fr: "Leg extension", en: "Leg extension" }, muscles: ["quads"] },
  { id: "leg_curl_lying", cat: "machines_lower", name: { fr: "Leg curl allongé", en: "Lying leg curl" }, muscles: ["hamstrings"] },
  { id: "leg_curl_seated", cat: "machines_lower", name: { fr: "Leg curl assis", en: "Seated leg curl" }, muscles: ["hamstrings"] },
  { id: "hip_thrust_machine", cat: "machines_lower", name: { fr: "Machine hip thrust", en: "Hip thrust machine" }, muscles: ["glutes"] },
  { id: "calf_raise_machine", cat: "machines_lower", name: { fr: "Machine mollets", en: "Calf raise machine" }, muscles: ["calves"] },
  { id: "ghr", cat: "machines_lower", name: { fr: "Glute-Ham Raise (GHR)", en: "Glute-Ham Raise" }, muscles: ["hamstrings","glutes"] },
  { id: "belt_squat", cat: "machines_lower", name: { fr: "Belt squat", en: "Belt squat" }, muscles: ["quads","glutes"] },

  // ─── Cardio ───
  { id: "treadmill", cat: "cardio", name: { fr: "Tapis de course", en: "Treadmill" }, muscles: ["cardio"] },
  { id: "rower", cat: "cardio", name: { fr: "Rameur (Concept2)", en: "Rower (Concept2)" }, muscles: ["cardio","back","full_body"] },
  { id: "assault_bike", cat: "cardio", name: { fr: "Assault bike / Air bike", en: "Assault bike / Air bike" }, muscles: ["cardio","full_body"] },
  { id: "elliptical", cat: "cardio", name: { fr: "Vélo elliptique", en: "Elliptical" }, muscles: ["cardio"] },
  { id: "stair_master", cat: "cardio", name: { fr: "Stair master", en: "Stair master" }, muscles: ["cardio","glutes"] },
  { id: "ski_erg", cat: "cardio", name: { fr: "Ski erg", en: "Ski erg" }, muscles: ["cardio","back","core"] },
  { id: "bike_classic", cat: "cardio", name: { fr: "Vélo classique", en: "Bike (classic)" }, muscles: ["cardio","quads"] },
  { id: "swimming_pool", cat: "cardio", name: { fr: "Piscine", en: "Swimming pool" }, muscles: ["cardio","full_body"] },

  // ─── Poids du corps ───
  { id: "pull_up_bar", cat: "bodyweight", name: { fr: "Barre de traction", en: "Pull-up bar" }, muscles: ["back","biceps"] },
  { id: "dip_station", cat: "bodyweight", name: { fr: "Barres parallèles (dips)", en: "Dip station" }, muscles: ["chest","triceps"] },
  { id: "captain_chair", cat: "bodyweight", name: { fr: "Chaise romaine (leg raises)", en: "Captain's chair" }, muscles: ["core"] },
  { id: "mat_gym", cat: "bodyweight", name: { fr: "Tapis de sol", en: "Gym mat" }, muscles: ["core"] },

  // ─── Fonctionnel ───
  { id: "med_ball", cat: "functional", name: { fr: "Medicine ball", en: "Medicine ball" }, muscles: ["core","full_body"] },
  { id: "slam_ball", cat: "functional", name: { fr: "Slam ball", en: "Slam ball" }, muscles: ["core","cardio"] },
  { id: "battle_ropes", cat: "functional", name: { fr: "Cordes ondulatoires", en: "Battle ropes" }, muscles: ["shoulders","cardio","core"] },
  { id: "plyo_box", cat: "functional", name: { fr: "Plyo box", en: "Plyo box" }, muscles: ["quads","cardio"] },
  { id: "sled", cat: "functional", name: { fr: "Sled (push/pull)", en: "Sled (push/pull)" }, muscles: ["quads","glutes","cardio"] },
  { id: "resistance_bands", cat: "functional", name: { fr: "Bandes élastiques", en: "Resistance bands" }, muscles: ["full_body"] },
  { id: "trx", cat: "functional", name: { fr: "TRX (sangles)", en: "TRX (straps)" }, muscles: ["full_body","core"] },
  { id: "jump_rope", cat: "functional", name: { fr: "Corde à sauter", en: "Jump rope" }, muscles: ["cardio","calves"] }
];

// Récupère les machines groupées par catégorie pour l'affichage UI
function machinesByCategory(){
  const grouped = {};
  Object.keys(MACHINE_CATEGORIES).forEach(catId => { grouped[catId] = []; });
  MACHINES.forEach(m => {
    if(!grouped[m.cat]) grouped[m.cat] = [];
    grouped[m.cat].push(m);
  });
  return grouped;
}

// Récupère une machine par id
function getMachine(id){
  return MACHINES.find(m => m.id === id) || null;
}
