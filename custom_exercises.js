// FITStark — Catalogue d'exercices machine-aware (v8.43)
// Chaque exercice connaît : muscle, machines requises (TOUTES doivent être disponibles),
// objectifs où il a sa place, type (compound/isolation/cardio/plyo/core/mobility).
// Utilisé par pickExercisesForSession() pour générer la liste d'exercices d'une séance
// du programme personnalisé en fonction du matériel disponible + objectif.

const CUSTOM_EXERCISE_CATALOG = [
  // ─── CHEST ───
  { id: "bench_press", name: { fr: "Développé couché barre", en: "Bench Press" }, muscle: "chest", machines: ["flat_bench","barbell_olympic"], objectives: ["max_strength","hypertrophy","muscle_endurance"], type: "compound", imgs:["Barbell_Bench_Press_-_Medium_Grip/0.jpg", "Barbell_Bench_Press_-_Medium_Grip/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bench+Press+form" },
  { id: "db_bench_press", name: { fr: "Développé couché haltères", en: "DB Bench Press" }, muscle: "chest", machines: ["flat_bench","dumbbells"], objectives: ["max_strength","hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Dumbbell_Bench_Press/0.jpg", "Dumbbell_Bench_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Bench+Press+form" },
  { id: "incline_db_press", name: { fr: "Développé incliné haltères", en: "Incline DB Press" }, muscle: "chest", machines: ["incline_bench","dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "compound", imgs:["Incline_Dumbbell_Press/0.jpg", "Incline_Dumbbell_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Incline+DB+Press+form" },
  { id: "incline_bench_press", name: { fr: "Développé incliné barre", en: "Incline Bench Press" }, muscle: "chest", machines: ["incline_bench","barbell_olympic"], objectives: ["max_strength","hypertrophy"], type: "compound", yt:"https://www.youtube.com/results?search_query=Incline+Bench+Press+form" },
  { id: "chest_press_m", name: { fr: "Développé machine", en: "Chest Press Machine" }, muscle: "chest", machines: ["chest_press_machine"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Leverage_Chest_Press/0.jpg", "Leverage_Chest_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Chest+Press+Machine+form" },
  { id: "pec_deck_fly", name: { fr: "Pec deck (butterfly)", en: "Pec Deck Fly" }, muscle: "chest", machines: ["pec_deck"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Butterfly/0.jpg", "Butterfly/1.jpg"], yt:"https://www.youtube.com/results?search_query=Pec+Deck+Fly+form" },
  { id: "cable_crossover_fly", name: { fr: "Écarté poulies (crossover)", en: "Cable Crossover Fly" }, muscle: "chest", machines: ["cable_crossover"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Cable_Crossover/0.jpg", "Cable_Crossover/1.jpg"], yt:"https://www.youtube.com/results?search_query=Cable+Crossover+Fly+form" },
  { id: "dips_bw", name: { fr: "Dips poids du corps", en: "Bodyweight Dips" }, muscle: "chest", machines: ["dip_station"], objectives: ["max_strength","hypertrophy"], type: "compound", imgs:["Dips_-_Chest_Version/0.jpg", "Dips_-_Chest_Version/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bodyweight+Dips+form" },
  { id: "pushup_bw", name: { fr: "Pompes (push-ups)", en: "Push-ups" }, muscle: "chest", machines: ["mat_gym"], objectives: ["hypertrophy","muscle_endurance","rehab","posture"], type: "compound", imgs:["Pushups/0.jpg", "Pushups/1.jpg"], yt:"https://www.youtube.com/results?search_query=Push-ups+form", logType:"reps_bw" },

  // ─── BACK ───
  { id: "pullups_bw", name: { fr: "Tractions (pull-ups)", en: "Pull-ups" }, muscle: "back", machines: ["pull_up_bar"], objectives: ["max_strength","hypertrophy","muscle_endurance"], type: "compound", imgs:["Pullups/0.jpg", "Pullups/1.jpg"], yt:"https://www.youtube.com/results?search_query=Pull-ups+form" },
  { id: "lat_pulldown_ex", name: { fr: "Tirage vertical", en: "Lat Pulldown" }, muscle: "back", machines: ["lat_pulldown"], objectives: ["hypertrophy","muscle_endurance","rehab","posture"], type: "compound", imgs:["Wide-Grip_Lat_Pulldown/0.jpg", "Wide-Grip_Lat_Pulldown/1.jpg"], yt:"https://www.youtube.com/results?search_query=Lat+Pulldown+form" },
  { id: "seated_cable_row", name: { fr: "Tirage horizontal assis", en: "Seated Cable Row" }, muscle: "back", machines: ["seated_row"], objectives: ["hypertrophy","muscle_endurance","posture","rehab"], type: "compound", imgs:["Seated_Cable_Rows/0.jpg", "Seated_Cable_Rows/1.jpg"], yt:"https://www.youtube.com/results?search_query=Seated+Cable+Row+form" },
  { id: "barbell_row", name: { fr: "Rowing barre buste penché", en: "Barbell Row" }, muscle: "back", machines: ["barbell_olympic"], objectives: ["max_strength","hypertrophy"], type: "compound", imgs:["Bent_Over_Barbell_Row/0.jpg", "Bent_Over_Barbell_Row/1.jpg"], yt:"https://www.youtube.com/results?search_query=Barbell+Row+form" },
  { id: "db_row", name: { fr: "Rowing haltère un bras", en: "One-arm DB Row" }, muscle: "back", machines: ["flat_bench","dumbbells"], objectives: ["hypertrophy","muscle_endurance","posture"], type: "compound", imgs:["One-Arm_Dumbbell_Row/0.jpg", "One-Arm_Dumbbell_Row/1.jpg"], yt:"https://www.youtube.com/results?search_query=One-arm+DB+Row+form" },
  { id: "face_pulls", name: { fr: "Face Pulls", en: "Face Pulls" }, muscle: "back", machines: ["cable_crossover"], objectives: ["posture","hypertrophy","rehab","muscle_endurance"], type: "isolation", imgs:["Face_Pull/0.jpg", "Face_Pull/1.jpg"], yt:"https://www.youtube.com/results?search_query=Face+Pulls+form" },
  { id: "band_pull_apart", name: { fr: "Band Pull-Aparts", en: "Band Pull-Aparts" }, muscle: "back", machines: ["resistance_bands"], objectives: ["posture","rehab","muscle_endurance"], type: "isolation", imgs:["Band_Pull_Apart/0.jpg", "Band_Pull_Apart/1.jpg"], yt:"https://www.youtube.com/results?search_query=Band+Pull-Aparts+form" },
  { id: "hyperextension_ex", name: { fr: "Extension lombaire (hyperextension)", en: "Back Extension" }, muscle: "back", machines: ["hyperextension"], objectives: ["posture","rehab","hypertrophy"], type: "isolation", imgs:["Hyperextensions_Back_Extensions/0.jpg", "Hyperextensions_Back_Extensions/1.jpg"], yt:"https://www.youtube.com/results?search_query=Back+Extension+form" },

  // ─── SHOULDERS ───
  { id: "ohp_barbell", name: { fr: "OHP debout barre", en: "Standing OHP" }, muscle: "shoulders", machines: ["barbell_olympic","squat_rack"], objectives: ["max_strength","hypertrophy"], type: "compound", imgs:["Standing_Military_Press/0.jpg", "Standing_Military_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Standing+OHP+form" },
  { id: "db_shoulder_press", name: { fr: "Développé épaules haltères", en: "DB Shoulder Press" }, muscle: "shoulders", machines: ["incline_bench","dumbbells"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Seated_Dumbbell_Press/0.jpg", "Seated_Dumbbell_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Shoulder+Press+form" },
  { id: "shoulder_press_m", name: { fr: "Développé épaules machine", en: "Shoulder Press Machine" }, muscle: "shoulders", machines: ["shoulder_press_machine"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Machine_Shoulder_Military_Press/0.jpg", "Machine_Shoulder_Military_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Shoulder+Press+Machine+form" },
  { id: "lateral_raises_db", name: { fr: "Élévations latérales haltères", en: "DB Lateral Raises" }, muscle: "shoulders", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance","posture"], type: "isolation", imgs:["Side_Lateral_Raise/0.jpg", "Side_Lateral_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Lateral+Raises+form" },
  { id: "lateral_raise_m", name: { fr: "Élévations latérales machine", en: "Lateral Raise Machine" }, muscle: "shoulders", machines: ["lateral_raise_machine"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Lateral_Raise_-_With_Bands/0.jpg", "Lateral_Raise_-_With_Bands/1.jpg"], yt:"https://www.youtube.com/results?search_query=Lateral+Raise+Machine+form" },
  { id: "rear_delt_fly", name: { fr: "Oiseau (rear delt fly)", en: "Rear Delt Fly" }, muscle: "shoulders", machines: ["rear_delt_machine"], objectives: ["posture","hypertrophy","rehab"], type: "isolation", imgs:["Seated_Bent-Over_Rear_Delt_Raise/0.jpg", "Seated_Bent-Over_Rear_Delt_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=Rear+Delt+Fly+form" },

  // ─── BICEPS ───
  { id: "barbell_curl", name: { fr: "Curl barre", en: "Barbell Curl" }, muscle: "biceps", machines: ["barbell_ez"], objectives: ["max_strength","hypertrophy"], type: "isolation", imgs:["Barbell_Curl/0.jpg", "Barbell_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=Barbell+Curl+form" },
  { id: "db_curl", name: { fr: "Curl haltères", en: "DB Curl" }, muscle: "biceps", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Dumbbell_Bicep_Curl/0.jpg", "Dumbbell_Bicep_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Curl+form" },
  { id: "hammer_curl_ex", name: { fr: "Hammer Curl", en: "Hammer Curl" }, muscle: "biceps", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Hammer_Curls/0.jpg", "Hammer_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Hammer+Curl+form" },
  { id: "preacher_curl_ex", name: { fr: "Larry Scott (preacher curl)", en: "Preacher Curl" }, muscle: "biceps", machines: ["preacher_bench","barbell_ez"], objectives: ["hypertrophy"], type: "isolation", imgs:["Preacher_Curl/0.jpg", "Preacher_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=Preacher+Curl+form" },
  { id: "cable_curl", name: { fr: "Curl poulie basse", en: "Cable Curl" }, muscle: "biceps", machines: ["cable_low_pulley"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["High_Cable_Curls/0.jpg", "High_Cable_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Cable+Curl+form" },

  // ─── TRICEPS ───
  { id: "tricep_pushdown", name: { fr: "Pushdown poulie", en: "Tricep Pushdown" }, muscle: "triceps", machines: ["cable_crossover"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Triceps_Pushdown/0.jpg", "Triceps_Pushdown/1.jpg"], yt:"https://www.youtube.com/results?search_query=Tricep+Pushdown+form" },
  { id: "skull_crushers_ex", name: { fr: "Skull Crushers (barre EZ)", en: "Skull Crushers" }, muscle: "triceps", machines: ["flat_bench","barbell_ez"], objectives: ["hypertrophy"], type: "isolation", imgs:["EZ-Bar_Skullcrusher/0.jpg", "EZ-Bar_Skullcrusher/1.jpg"], yt:"https://www.youtube.com/results?search_query=Skull+Crushers+form" },
  { id: "oh_tricep_ext", name: { fr: "Extension triceps verticale", en: "Overhead Tricep Extension" }, muscle: "triceps", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Standing_Dumbbell_Triceps_Extension/0.jpg", "Standing_Dumbbell_Triceps_Extension/1.jpg"], yt:"https://www.youtube.com/results?search_query=Overhead+Tricep+Extension+form" },

  // ─── LEGS / QUADS / GLUTES ───
  { id: "back_squat_ex", name: { fr: "Back Squat barre", en: "Back Squat" }, muscle: "quads", machines: ["barbell_olympic","squat_rack"], objectives: ["max_strength","hypertrophy","explosivity"], type: "compound", imgs:["Barbell_Squat/0.jpg", "Barbell_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Back+Squat+form" },
  { id: "front_squat_ex", name: { fr: "Front Squat", en: "Front Squat" }, muscle: "quads", machines: ["barbell_olympic","squat_rack"], objectives: ["max_strength","hypertrophy"], type: "compound", imgs:["Clean_from_Blocks/0.jpg", "Clean_from_Blocks/1.jpg"], yt:"https://www.youtube.com/results?search_query=Front+Squat+form" },
  { id: "goblet_squat_ex", name: { fr: "Goblet Squat (haltère/KB)", en: "Goblet Squat" }, muscle: "quads", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Goblet_Squat/0.jpg", "Goblet_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Goblet+Squat+form" },
  { id: "leg_press_ex", name: { fr: "Presse à cuisses", en: "Leg Press" }, muscle: "quads", machines: ["leg_press"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Leg_Press/0.jpg", "Leg_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Leg+Press+form" },
  { id: "hack_squat_ex", name: { fr: "Hack Squat", en: "Hack Squat" }, muscle: "quads", machines: ["hack_squat"], objectives: ["hypertrophy","max_strength"], type: "compound", imgs:["Hack_Squat/0.jpg", "Hack_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Hack+Squat+form" },
  { id: "leg_extension_ex", name: { fr: "Leg Extension", en: "Leg Extension" }, muscle: "quads", machines: ["leg_extension"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "isolation", imgs:["Leg_Extensions/0.jpg", "Leg_Extensions/1.jpg"], yt:"https://www.youtube.com/results?search_query=Leg+Extension+form" },
  { id: "bulgarian_split_squat", name: { fr: "Bulgarian Split Squat", en: "Bulgarian Split Squat" }, muscle: "quads", machines: ["flat_bench","dumbbells"], objectives: ["hypertrophy","explosivity","mobility"], type: "compound", imgs:["Split_Squat_with_Dumbbells/0.jpg", "Split_Squat_with_Dumbbells/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bulgarian+Split+Squat+form" },
  { id: "lunges_db", name: { fr: "Fentes (lunges) haltères", en: "DB Lunges" }, muscle: "quads", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance","mobility"], type: "compound", imgs:["Dumbbell_Lunges/0.jpg", "Dumbbell_Lunges/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Lunges+form" },
  { id: "hip_thrust_ex", name: { fr: "Hip Thrust", en: "Hip Thrust" }, muscle: "glutes", machines: ["hip_thrust_machine"], objectives: ["hypertrophy","max_strength","posture"], type: "compound", imgs:["Barbell_Hip_Thrust/0.jpg", "Barbell_Hip_Thrust/1.jpg"], yt:"https://www.youtube.com/results?search_query=Hip+Thrust+form" },
  { id: "hip_thrust_barbell", name: { fr: "Hip Thrust barre", en: "Barbell Hip Thrust" }, muscle: "glutes", machines: ["flat_bench","barbell_olympic"], objectives: ["hypertrophy","max_strength"], type: "compound", imgs:["Barbell_Hip_Thrust/0.jpg", "Barbell_Hip_Thrust/1.jpg"], yt:"https://www.youtube.com/results?search_query=Barbell+Hip+Thrust+form" },

  // ─── HAMSTRINGS ───
  { id: "rdl_barbell", name: { fr: "Romanian Deadlift barre", en: "Romanian DL" }, muscle: "hamstrings", machines: ["barbell_olympic"], objectives: ["max_strength","hypertrophy"], type: "compound", imgs:["Romanian_Deadlift/0.jpg", "Romanian_Deadlift/1.jpg"], yt:"https://www.youtube.com/results?search_query=Romanian+DL+form" },
  { id: "rdl_db", name: { fr: "Romanian DL haltères", en: "DB Romanian DL" }, muscle: "hamstrings", machines: ["dumbbells"], objectives: ["hypertrophy","rehab"], type: "compound", imgs:["Stiff-Legged_Dumbbell_Deadlift/0.jpg", "Stiff-Legged_Dumbbell_Deadlift/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Romanian+DL+form" },
  { id: "leg_curl_lying_ex", name: { fr: "Leg Curl allongé", en: "Lying Leg Curl" }, muscle: "hamstrings", machines: ["leg_curl_lying"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "isolation", imgs:["Lying_Leg_Curls/0.jpg", "Lying_Leg_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Lying+Leg+Curl+form" },
  { id: "leg_curl_seated_ex", name: { fr: "Leg Curl assis", en: "Seated Leg Curl" }, muscle: "hamstrings", machines: ["leg_curl_seated"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Seated_Leg_Curl/0.jpg", "Seated_Leg_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=Seated+Leg+Curl+form" },
  { id: "ghr_ex", name: { fr: "Glute Ham Raise", en: "Glute Ham Raise" }, muscle: "hamstrings", machines: ["ghr"], objectives: ["max_strength","explosivity","joint_health"], type: "compound", imgs:["Glute_Ham_Raise/0.jpg", "Glute_Ham_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=Glute+Ham+Raise+form" },
  { id: "nordic_curl_ex", name: { fr: "Nordic Curl", en: "Nordic Curl" }, muscle: "hamstrings", machines: ["mat_gym"], objectives: ["joint_health","explosivity","mobility"], type: "isolation", imgs:["Lying_Leg_Curls/0.jpg", "Lying_Leg_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Nordic+Curl+form" },

  // ─── CALVES ───
  { id: "calf_raise_m", name: { fr: "Mollets debout machine", en: "Standing Calf Raise" }, muscle: "calves", machines: ["calf_raise_machine"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Standing_Calf_Raises/0.jpg", "Standing_Calf_Raises/1.jpg"], yt:"https://www.youtube.com/results?search_query=Standing+Calf+Raise+form" },
  { id: "calf_raise_db", name: { fr: "Mollets debout haltères", en: "DB Calf Raise" }, muscle: "calves", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Standing_Dumbbell_Calf_Raise/0.jpg", "Standing_Dumbbell_Calf_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Calf+Raise+form" },

  // ─── CORE ───
  { id: "plank_ex", name: { fr: "Planche (gainage)", en: "Plank" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab","posture"], type: "core", imgs:["Plank/0.jpg", "Plank/1.jpg"], yt:"https://www.youtube.com/results?search_query=Plank+form", logType:"time" },
  { id: "side_plank_ex", name: { fr: "Planche latérale", en: "Side Plank" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab","posture"], type: "core", imgs:["Side_Bridge/0.jpg", "Side_Bridge/1.jpg"], yt:"https://www.youtube.com/results?search_query=Side+Plank+form", logType:"time" },
  { id: "bird_dog_ex", name: { fr: "Bird Dog", en: "Bird Dog" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab","posture"], type: "core", imgs:["Kneeling_Jump_Squat/0.jpg", "Kneeling_Jump_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bird+Dog+form", logType:"time" },
  { id: "dead_bug_ex", name: { fr: "Dead Bug", en: "Dead Bug" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab"], type: "core", imgs:["Dead_Bug/0.jpg", "Dead_Bug/1.jpg"], yt:"https://www.youtube.com/results?search_query=Dead+Bug+form", logType:"reps_bw" },
  { id: "pallof_press_ex", name: { fr: "Pallof Press (anti-rotation)", en: "Pallof Press" }, muscle: "core", machines: ["cable_low_pulley"], objectives: ["core_stability","posture","rehab"], type: "core", imgs:["Pallof_Press/0.jpg", "Pallof_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Pallof+Press+form", logType:"time" },
  { id: "suitcase_carry_ex", name: { fr: "Suitcase Carry", en: "Suitcase Carry" }, muscle: "core", machines: ["dumbbells"], objectives: ["core_stability","posture"], type: "core", imgs:["Farmers_Walk/0.jpg", "Farmers_Walk/1.jpg"], yt:"https://www.youtube.com/results?search_query=Suitcase+Carry+form", logType:"distance_load" },
  { id: "leg_raises_chair", name: { fr: "Leg Raises (chaise romaine)", en: "Captain's Chair Leg Raises" }, muscle: "core", machines: ["captain_chair"], objectives: ["hypertrophy","muscle_endurance"], type: "core", imgs:["Hanging_Leg_Raise/0.jpg", "Hanging_Leg_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=Captain's+Chair+Leg+Raises+form", logType:"reps_bw" },

  // ─── POWER / EXPLOSIVITY (plyo) ───
  { id: "box_jumps", name: { fr: "Box Jumps", en: "Box Jumps" }, muscle: "quads", machines: ["plyo_box"], objectives: ["explosivity","fat_loss","sport_specific"], type: "plyo", imgs:["Box_Jump_Multiple_Response/0.jpg", "Box_Jump_Multiple_Response/1.jpg"], yt:"https://www.youtube.com/results?search_query=Box+Jumps+form", logType:"reps_bw" },
  { id: "broad_jumps", name: { fr: "Broad Jumps (saut en longueur)", en: "Broad Jumps" }, muscle: "quads", machines: ["mat_gym"], objectives: ["explosivity","sport_specific"], type: "plyo", imgs:["Standing_Long_Jump/0.jpg", "Standing_Long_Jump/1.jpg"], yt:"https://www.youtube.com/results?search_query=Broad+Jumps+form", logType:"reps_bw" },
  { id: "cmj_ex", name: { fr: "Counter-Movement Jumps", en: "Counter-Movement Jumps" }, muscle: "quads", machines: ["mat_gym"], objectives: ["explosivity","sport_specific"], type: "plyo", imgs:["Standing_Long_Jump/0.jpg", "Standing_Long_Jump/1.jpg"], yt:"https://www.youtube.com/results?search_query=Counter-Movement+Jumps+form", logType:"reps_bw" },
  { id: "kb_swing", name: { fr: "Kettlebell Swings", en: "Kettlebell Swings" }, muscle: "hamstrings", machines: ["kettlebells"], objectives: ["explosivity","fat_loss","cardio_resp","sport_specific"], type: "plyo", imgs:["One-Arm_Kettlebell_Swings/0.jpg", "One-Arm_Kettlebell_Swings/1.jpg"], yt:"https://www.youtube.com/results?search_query=Kettlebell+Swings+form" },
  { id: "med_ball_slam", name: { fr: "Med Ball Slams", en: "Med Ball Slams" }, muscle: "core", machines: ["slam_ball"], objectives: ["explosivity","fat_loss","sport_specific"], type: "plyo", imgs:["One-Arm_Medicine_Ball_Slam/0.jpg", "One-Arm_Medicine_Ball_Slam/1.jpg"], yt:"https://www.youtube.com/results?search_query=Med+Ball+Slams+form" },
  { id: "med_ball_throw", name: { fr: "Med Ball Throws", en: "Med Ball Throws" }, muscle: "shoulders", machines: ["med_ball"], objectives: ["explosivity","sport_specific"], type: "plyo", imgs:["Backward_Medicine_Ball_Throw/0.jpg", "Backward_Medicine_Ball_Throw/1.jpg"], yt:"https://www.youtube.com/results?search_query=Med+Ball+Throws+form" },
  { id: "power_clean_ex", name: { fr: "Power Clean", en: "Power Clean" }, muscle: "back", machines: ["barbell_olympic"], objectives: ["explosivity","max_strength","sport_specific"], type: "plyo", imgs:["Clean_and_Press/0.jpg", "Clean_and_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Power+Clean+form" },
  { id: "push_press_ex", name: { fr: "Push Press", en: "Push Press" }, muscle: "shoulders", machines: ["barbell_olympic","squat_rack"], objectives: ["explosivity","max_strength","sport_specific"], type: "plyo", imgs:["Push_Press/0.jpg", "Push_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Push+Press+form" },
  { id: "battle_ropes_ex", name: { fr: "Battle Ropes (waves)", en: "Battle Ropes" }, muscle: "shoulders", machines: ["battle_ropes"], objectives: ["fat_loss","cardio_resp","sport_specific","muscle_endurance"], type: "plyo", imgs:["Battling_Ropes/0.jpg", "Battling_Ropes/1.jpg"], yt:"https://www.youtube.com/results?search_query=Battle+Ropes+form", logType:"cardio" },
  { id: "sled_push", name: { fr: "Sled Push", en: "Sled Push" }, muscle: "quads", machines: ["sled"], objectives: ["explosivity","fat_loss","sport_specific","joint_health"], type: "plyo", imgs:["Sled_Push/0.jpg", "Sled_Push/1.jpg"], yt:"https://www.youtube.com/results?search_query=Sled+Push+form", logType:"distance_load" },

  // ─── CARDIO ───
  { id: "run_tread", name: { fr: "Tapis de course", en: "Treadmill run" }, muscle: "cardio", machines: ["treadmill"], objectives: ["cardio_resp","fat_loss"], type: "cardio", imgs:["Running_Treadmill/0.jpg", "Running_Treadmill/1.jpg"], yt:"https://www.youtube.com/results?search_query=Treadmill+run+form", logType:"cardio" },
  { id: "row_erg", name: { fr: "Rameur Concept2", en: "Rower (Concept2)" }, muscle: "cardio", machines: ["rower"], objectives: ["cardio_resp","fat_loss","sport_specific"], type: "cardio", imgs:["Seated_Cable_Rows/0.jpg", "Seated_Cable_Rows/1.jpg"], yt:"https://www.youtube.com/results?search_query=Rower+(Concept2)+form", logType:"cardio" },
  { id: "assault_bike_ex", name: { fr: "Assault bike / Air bike", en: "Assault bike" }, muscle: "cardio", machines: ["assault_bike"], objectives: ["cardio_resp","fat_loss","sport_specific"], type: "cardio", imgs:["Air_Bike/0.jpg", "Air_Bike/1.jpg"], yt:"https://www.youtube.com/results?search_query=Assault+bike+form", logType:"cardio" },
  { id: "ski_erg_ex", name: { fr: "Ski erg", en: "Ski erg" }, muscle: "cardio", machines: ["ski_erg"], objectives: ["cardio_resp","fat_loss","sport_specific"], type: "cardio", imgs:["Seated_Cable_Rows/0.jpg", "Seated_Cable_Rows/1.jpg"], yt:"https://www.youtube.com/results?search_query=Ski+erg+form", logType:"cardio" },
  { id: "elliptical_ex", name: { fr: "Vélo elliptique", en: "Elliptical" }, muscle: "cardio", machines: ["elliptical"], objectives: ["cardio_resp","fat_loss","rehab"], type: "cardio", imgs:["Elliptical_Trainer/0.jpg", "Elliptical_Trainer/1.jpg"], yt:"https://www.youtube.com/results?search_query=Elliptical+form", logType:"cardio" },
  { id: "stair_master_ex", name: { fr: "Stair master", en: "Stair master" }, muscle: "cardio", machines: ["stair_master"], objectives: ["cardio_resp","fat_loss"], type: "cardio", imgs:["Stairmaster/0.jpg", "Stairmaster/1.jpg"], yt:"https://www.youtube.com/results?search_query=Stair+master+form", logType:"cardio" },
  { id: "swim_ex", name: { fr: "Natation", en: "Swimming" }, muscle: "cardio", machines: ["swimming_pool"], objectives: ["cardio_resp","fat_loss","rehab","joint_health"], type: "cardio", imgs:["Bench_Jump/0.jpg", "Bench_Jump/1.jpg"], yt:"https://www.youtube.com/results?search_query=Swimming+form", logType:"cardio" },
  { id: "bike_classic_ex", name: { fr: "Vélo classique", en: "Stationary bike" }, muscle: "cardio", machines: ["bike_classic"], objectives: ["cardio_resp","fat_loss","rehab"], type: "cardio", imgs:["Bicycling_Stationary/0.jpg", "Bicycling_Stationary/1.jpg"], yt:"https://www.youtube.com/results?search_query=Stationary+bike+form", logType:"cardio" },
  { id: "jump_rope_ex", name: { fr: "Corde à sauter", en: "Jump rope" }, muscle: "cardio", machines: ["jump_rope"], objectives: ["cardio_resp","fat_loss","explosivity","sport_specific"], type: "cardio", imgs:["Rope_Jumping/0.jpg", "Rope_Jumping/1.jpg"], yt:"https://www.youtube.com/results?search_query=Jump+rope+form", logType:"cardio" },

  // ─── MOBILITY ───
  { id: "atg_split_squat", name: { fr: "ATG Split Squat", en: "ATG Split Squat" }, muscle: "quads", machines: ["mat_gym"], objectives: ["mobility","joint_health","rehab"], type: "mobility", imgs:["Split_Squat_with_Dumbbells/0.jpg", "Split_Squat_with_Dumbbells/1.jpg"], yt:"https://www.youtube.com/results?search_query=ATG+Split+Squat+form", logType:"reps_bw" },
  { id: "tibialis_raises", name: { fr: "Tibialis Raises", en: "Tibialis Raises" }, muscle: "calves", machines: ["mat_gym"], objectives: ["mobility","joint_health","rehab"], type: "mobility", imgs:["Anterior_Tibialis-SMR/0.jpg", "Anterior_Tibialis-SMR/1.jpg"], yt:"https://www.youtube.com/results?search_query=Tibialis+Raises+form", logType:"reps_bw" },
  { id: "cobra_stretch", name: { fr: "Cobra (extension dorsale)", en: "Cobra stretch" }, muscle: "core", machines: ["mat_gym"], objectives: ["mobility","posture","rehab"], type: "mobility", yt:"https://www.youtube.com/results?search_query=Cobra+stretch+yoga", logType:"reps_bw" },
  { id: "wall_slides_ex", name: { fr: "Wall Slides", en: "Wall Slides" }, muscle: "shoulders", machines: ["mat_gym"], objectives: ["mobility","posture","rehab"], type: "mobility", yt:"https://www.youtube.com/results?search_query=Wall+Slides+shoulder+mobility", logType:"reps_bw" },
  { id: "thoracic_extension_ex", name: { fr: "Extension thoracique (foam roller)", en: "Thoracic Extension" }, muscle: "back", machines: ["mat_gym"], objectives: ["mobility","posture","rehab"], type: "mobility", yt:"https://www.youtube.com/results?search_query=Thoracic+Extension+foam+roller", logType:"reps_bw" },
  { id: "cars_shoulders", name: { fr: "CARs épaules (rotations contrôlées)", en: "Shoulder CARs" }, muscle: "shoulders", machines: ["mat_gym"], objectives: ["mobility","joint_health","posture"], type: "mobility", imgs:["Arm_Circles/0.jpg", "Arm_Circles/1.jpg"], yt:"https://www.youtube.com/results?search_query=Shoulder+CARs+form", logType:"reps_bw" }
];

// Vérifie si TOUTES les machines requises par cet exercice sont disponibles
function _hasAllMachines(exMachines, available){
  if(!exMachines || !exMachines.length) return true;
  return exMachines.every(m => available.indexOf(m) !== -1);
}

// Sélecteur principal : renvoie une liste d'exercices adaptée à l'objectif + machines + session config
// Args: { objId, methodId, machineIds, sessionSets, sessionReps, sessionRest, count?, weekIdx?, sessIdx?, excludeIds? }
// Strategy v8.44 :
// 1. Filtre les exos compatibles (machines + objectif)
// 2. Groupe par muscle
// 3. Rotation déterministe : seed unique par (weekIdx × frequency + sessIdx)
//    → même séance répétée plus tard sélectionne des exos différents au sein de chaque muscle
// 4. Maximum 1 exo par muscle (puis 2 si pas assez)
function pickExercisesForSession({objId, methodId, machineIds, sessionSets, sessionReps, sessionRest, count, weekIdx, sessIdx, excludeIds}){
  if(typeof CUSTOM_EXERCISE_CATALOG === "undefined") return [];
  const obj = (typeof getObjective === "function") ? getObjective(objId) : null;
  const sessionType = obj ? obj.sessionType : "strength";
  const available = machineIds || [];
  const exclude = excludeIds || [];

  // Filtre : objectif compatible + machines disponibles + pas dans la liste à exclure
  let candidates = CUSTOM_EXERCISE_CATALOG.filter(e =>
    (!e.objectives || e.objectives.indexOf(objId) !== -1) &&
    _hasAllMachines(e.machines, available) &&
    exclude.indexOf(e.id) === -1
  );

  // Seed déterministe pour la rotation (week 1 sess 0 → seed=0, week 2 sess 0 → seed=7, etc.)
  const w = (weekIdx == null) ? 1 : weekIdx;
  const s = (sessIdx == null) ? 0 : sessIdx;
  const seed = (w - 1) * 7 + s;

  // Si sessionType = cardio, on garde 1 cardio (avec rotation entre les options disponibles)
  if(sessionType === "cardio"){
    const cardios = candidates.filter(e => e.type === "cardio");
    if(!cardios.length) return [];
    const chosen = cardios[seed % cardios.length];
    return [_buildSessionExercise(chosen, 0, sessionSets, sessionReps, sessionRest)];
  }

  // Si sessionType = core, on priorise type core
  if(sessionType === "core"){
    const cores = candidates.filter(e => e.type === "core");
    if(cores.length >= 3) candidates = cores;
  }

  // Trie par type prio : compound > plyo > isolation > core > mobility > cardio
  const typePriority = { compound: 1, plyo: 2, isolation: 3, core: 4, mobility: 5, cardio: 6 };
  candidates.sort((a, b) => (typePriority[a.type]||9) - (typePriority[b.type]||9));

  // Groupe par muscle pour rotation par-muscle
  const byMuscle = {};
  candidates.forEach(e => {
    if(!byMuscle[e.muscle]) byMuscle[e.muscle] = [];
    byMuscle[e.muscle].push(e);
  });

  // Ordre déterministe des muscles (par 1er type prio puis nom)
  const muscleOrder = Object.keys(byMuscle).sort((a, b) => {
    const aPrio = typePriority[byMuscle[a][0].type] || 9;
    const bPrio = typePriority[byMuscle[b][0].type] || 9;
    if(aPrio !== bPrio) return aPrio - bPrio;
    return a.localeCompare(b);
  });

  // Picking avec rotation : pour chaque muscle, on prend l'exo (seed % pool.length)
  // → garantit que la même séance répétée à différentes semaines pioche des exos différents
  // → ex : Bench (W1) → Incline DB (W2) → DB Bench (W3) → Bench (W4) si 3 exos chest dispo
  const targetCount = count || (sessionType === "hybrid" ? 5 : sessionType === "core" ? 4 : 5);
  const picked = [];

  // Première passe : 1 exo par muscle, rotation
  for(let i = 0; i < muscleOrder.length; i++){
    if(picked.length >= targetCount) break;
    const muscle = muscleOrder[i];
    const pool = byMuscle[muscle];
    // Décalage seed par muscle (pour ne pas que tous changent en même temps)
    const muscleShift = seed + i;
    const chosen = pool[muscleShift % pool.length];
    picked.push(chosen);
  }

  // Deuxième passe : si pas assez, autorise un 2ᵉ exo par muscle (rotation décalée)
  if(picked.length < targetCount){
    for(let i = 0; i < muscleOrder.length; i++){
      if(picked.length >= targetCount) break;
      const muscle = muscleOrder[i];
      const pool = byMuscle[muscle];
      if(pool.length < 2) continue;
      const muscleShift = seed + i + 1;
      const chosen = pool[muscleShift % pool.length];
      if(!picked.find(p => p.id === chosen.id)) picked.push(chosen);
    }
  }

  return picked.map((e, i) => _buildSessionExercise(e, i, sessionSets, sessionReps, sessionRest));
}

// v8.44 — Renvoie des alternatives pour un exo donné (même muscle, compatible avec
// les machines fournies, pas déjà dans la séance). Utilisé par le swap en cours de séance.
function getAlternativeExercises(exId, availableMachines, objId, currentSessionExIds, limit){
  if(typeof CUSTOM_EXERCISE_CATALOG === "undefined") return [];
  const orig = CUSTOM_EXERCISE_CATALOG.find(e => e.id === exId);
  if(!orig) return [];
  const used = currentSessionExIds || [];
  const available = availableMachines || [];
  return CUSTOM_EXERCISE_CATALOG.filter(e =>
    e.muscle === orig.muscle &&
    e.id !== exId &&
    used.indexOf(e.id) === -1 &&
    _hasAllMachines(e.machines, available) &&
    (!objId || !e.objectives || e.objectives.indexOf(objId) !== -1)
  ).slice(0, limit || 5);
}

// v8.44 — Renvoie les machines requises par un exo (pour afficher dans le swap UI)
function getExerciseMachines(exId){
  if(typeof CUSTOM_EXERCISE_CATALOG === "undefined") return [];
  const ex = CUSTOM_EXERCISE_CATALOG.find(e => e.id === exId);
  return ex ? (ex.machines || []) : [];
}

// Construit l'exercice au format attendu par S.sess.exercises
// v8.45 : stocke le nom canonique EN (matchant PROG) pour que getSuggestion et get1RM
// retrouvent les PR de l'historique. L'affichage utilise tr() à la volée (FR/EN).
function _buildSessionExercise(catEx, idx, sets, reps, rest){
  // Nom canonique = .en (sert de clé de matching avec S.hist)
  const canonical = (catEx.name && catEx.name.en) || (catEx.name && catEx.name.fr) || catEx.id;
  // v8.49 : propage imgs + yt + logType (kg/reps vs sec vs min/km vs m/kg)
  return {
    id: catEx.id,
    name: canonical,
    muscle: catEx.muscle,
    sets: sets || 4,
    reps: typeof reps === "number" ? String(reps) : (reps || "8-12"),
    rest: rest || 90,
    type: catEx.type,
    imgs: catEx.imgs || null,
    yt: catEx.yt || null,
    notes: "",
    logType: catEx.logType || "weight"
  };
}
