/* eslint-disable */
// @ts-nocheck
// FITStark — Internationalization (i18n) — v8.38
// Système de traduction FR + EN. Clé = string source (dans le code), valeurs = traductions.
// Helper : tr("Mon texte FR") → renvoie la version EN si lang === "en", sinon retourne tel quel.
// Pour les labels UI purs : t("nav_home") → utilise une clé courte.

(function(){
  // ─── Langue active (persistance localStorage + auto-détection navigateur) ───
  const STORED = localStorage.getItem("apex_lang");
  const browserLang = (navigator.language || navigator.userLanguage || "fr").toLowerCase();
  const _autoDetect = browserLang.startsWith("fr") ? "fr" : "en";
  let _lang = (STORED === "fr" || STORED === "en") ? STORED : _autoDetect;

  function setLang(code){
    if(code !== "fr" && code !== "en") return;
    _lang = code;
    localStorage.setItem("apex_lang", code);
    try { document.documentElement.lang = code; } catch(e){}
    if(typeof R === "function") R();
  }
  function getLang(){ return _lang; }

  // ─── Dictionnaire UI (clés courtes pour labels statiques) ───
  // Format : KEY → { fr: "...", en: "..." }
  const UI = {
    // Navigation
    nav_home:      { fr: "Accueil",       en: "Home" },
    nav_workout:   { fr: "Séance",        en: "Workout" },
    nav_history:   { fr: "Historique",    en: "History" },
    nav_progress:  { fr: "Progrès",       en: "Progress" },
    nav_nutrition: { fr: "Nutrition",     en: "Nutrition" },
    nav_settings:  { fr: "Réglages",      en: "Settings" },
    nav_tools:     { fr: "Outils",        en: "Tools" },
    nav_anatomy:   { fr: "Anatomie",      en: "Anatomy" },
    nav_achievements:{ fr: "Achievements",en: "Achievements" },

    // Disclaimer
    disclaimer_title:     { fr: "⚕️ Avertissement médical",      en: "⚕️ Medical disclaimer" },
    disclaimer_intro:     { fr: "Cette application propose des programmes d'entraînement adaptés à plusieurs zones sensibles (protocole McGill pour le dos, substitutions automatiques pour les autres articulations). Cependant :", en: "This app offers training programs adapted to several sensitive areas (McGill protocol for the back, automatic substitutions for other joints). However:" },
    disclaimer_b1:        { fr: "Elle ne remplace en aucun cas un avis médical.", en: "It does not replace medical advice in any way." },
    disclaimer_b2:        { fr: "Consultez un médecin, kinésithérapeute ou ostéopathe avant de commencer tout programme si vous avez une pathologie diagnostiquée, notamment :", en: "Consult a doctor, physiotherapist or osteopath before starting any program if you have a diagnosed condition, notably:" },
    disclaimer_l5:        { fr: "Lombaires (L5-S1) : hernie discale, protrusion, spondylolisthésis, lombalgie chronique", en: "Lower back (L5-S1): herniated disc, protrusion, spondylolisthesis, chronic low back pain" },
    disclaimer_shoulder:  { fr: "Épaules : conflit sous-acromial, tendinopathie de la coiffe, instabilité, SLAP", en: "Shoulders: subacromial impingement, rotator cuff tendinopathy, instability, SLAP tear" },
    disclaimer_knee:      { fr: "Genoux : syndrome fémoro-patellaire, tendinite rotulienne, lésion méniscale, LCA", en: "Knees: patellofemoral pain, patellar tendinitis, meniscus injury, ACL" },
    disclaimer_wrist:     { fr: "Poignets : tendinite, syndrome du canal carpien, entorse, TFCC", en: "Wrists: tendinitis, carpal tunnel syndrome, sprain, TFCC" },
    disclaimer_elbow:     { fr: "Coudes : épicondylite (tennis/golf elbow), tendinopathie du biceps distal", en: "Elbows: epicondylitis (tennis/golf elbow), distal biceps tendinopathy" },
    disclaimer_b3:        { fr: "Arrêtez immédiatement tout exercice provoquant une douleur aiguë.", en: "Stop immediately any exercise causing sharp pain." },
    disclaimer_b4:        { fr: "Les suggestions de charges sont basées sur le protocole APRE (validé scientifiquement) mais restent des estimations — écoutez votre corps.", en: "Load suggestions are based on the APRE protocol (scientifically validated) but remain estimates — listen to your body." },
    disclaimer_b5:        { fr: "Les formules de 1RM (Epley/Brzycki) ont une marge d'erreur de ±3-5kg.", en: "1RM formulas (Epley/Brzycki) have a margin of error of ±3-5kg." },
    disclaimer_accept:    { fr: "En utilisant cette application, vous reconnaissez assumer la responsabilité de votre entraînement.", en: "By using this app, you acknowledge taking responsibility for your training." },
    disclaimer_btn:       { fr: "J'ai compris — Commencer", en: "I understand — Get started" },
    disclaimer_footer:    { fr: "Progression basée sur APRE (Huang et al. 2025, SUCRA 93%)<br>1RM: moyenne Epley + Brzycki (DiStasio 2014, ±2.7kg)", en: "Progression based on APRE (Huang et al. 2025, SUCRA 93%)<br>1RM: avg Epley + Brzycki (DiStasio 2014, ±2.7kg)" },
    disclaimer_footer2:   { fr: 'En cliquant, tu acceptes la <a href="/privacy.html" target="_blank" rel="noopener" style="color:#E63946;font-weight:600;text-decoration:underline">politique de confidentialité</a> et les <a href="/terms.html" target="_blank" rel="noopener" style="color:#E63946;font-weight:600;text-decoration:underline">conditions d\'utilisation</a>.', en: 'By clicking, you accept the <a href="/privacy.html" target="_blank" rel="noopener" style="color:#E63946;font-weight:600;text-decoration:underline">privacy policy</a> and <a href="/terms.html" target="_blank" rel="noopener" style="color:#E63946;font-weight:600;text-decoration:underline">terms of use</a>.' },

    // Language picker labels
    lang_picker_label:    { fr: "Langue", en: "Language" },
    lang_fr:              { fr: "Français", en: "French" },
    lang_en:              { fr: "Anglais",  en: "English" },

    // Onboarding
    onb_welcome_title:    { fr: "Bienvenue sur FITStark", en: "Welcome to FITStark" },
    onb_welcome_sub:      { fr: "Quelques questions pour personnaliser tes séances.", en: "A few questions to personalize your sessions." },
    onb_step:             { fr: "Étape", en: "Step" },
    onb_next:             { fr: "Suivant", en: "Next" },
    onb_back:             { fr: "Retour", en: "Back" },
    onb_finish:           { fr: "Démarrer ma 1re séance", en: "Start my 1st session" },
    onb_skip_finish:      { fr: "Aller à l'accueil", en: "Go to home" },
    onb_sex:              { fr: "Sexe", en: "Sex" },
    onb_male:             { fr: "Homme", en: "Male" },
    onb_female:           { fr: "Femme", en: "Female" },
    onb_height:           { fr: "Taille (cm)", en: "Height (cm)" },
    onb_weight:           { fr: "Poids (kg)", en: "Weight (kg)" },
    onb_age:              { fr: "Âge", en: "Age" },
    onb_goal_title:       { fr: "Quel est ton objectif ?", en: "What's your goal?" },
    onb_goal_force:       { fr: "Force pure", en: "Pure strength" },
    onb_goal_muscle:      { fr: "Prise de muscle", en: "Build muscle" },
    onb_goal_lean:        { fr: "Sèche / tonification", en: "Cut / tone" },
    onb_goal_rehab:       { fr: "Récupération / réathlétisation", en: "Recovery / rehab" },
    onb_path_title:       { fr: "Pathologies déclarées (optionnel)", en: "Declared conditions (optional)" },
    onb_path_sub:         { fr: "Active uniquement celles diagnostiquées par un professionnel. Les exercices à risque seront substitués automatiquement.", en: "Only toggle ones diagnosed by a professional. Risky exercises will be automatically substituted." },
    onb_path_none:        { fr: "Aucune", en: "None" },

    // Home
    home_today:           { fr: "Aujourd'hui", en: "Today" },
    home_start_session:   { fr: "Démarrer ma séance", en: "Start my session" },
    home_resume:          { fr: "Reprendre", en: "Resume" },
    home_no_pathology:    { fr: "Aucune pathologie déclarée — alertes désactivées", en: "No condition declared — alerts off" },
    home_pathology_off:   { fr: "Active une pathologie dans Réglages pour activer les avertissements et substitutions.", en: "Toggle a condition in Settings to enable warnings and substitutions." },
    home_path_mode:       { fr: "Mode {name} actif — règles de protection", en: "{name} mode active — protection rules" },
    home_multi_mode:      { fr: "Mode multi-pathologies actif ({names}) — règles de protection", en: "Multi-condition mode active ({names}) — protection rules" },
    home_path_obligatoire:{ fr: "Obligatoire", en: "Mandatory" },
    home_path_interdit:   { fr: "Interdit", en: "Forbidden" },
    home_path_modifie:    { fr: "Modifié", en: "Modified" },

    // Session UI
    sess_warmup:          { fr: "Échauffement", en: "Warmup" },
    sess_compound:        { fr: "Exercices principaux", en: "Compound lifts" },
    sess_accessory:       { fr: "Accessoires", en: "Accessories" },
    sess_wod:             { fr: "WOD", en: "WOD" },
    sess_finish:          { fr: "Terminer la séance", en: "Finish session" },
    sess_set:             { fr: "Série", en: "Set" },
    sess_reps:            { fr: "Reps", en: "Reps" },
    sess_weight:          { fr: "Poids", en: "Weight" },
    sess_rest:            { fr: "Repos", en: "Rest" },
    sess_rir:             { fr: "RIR", en: "RIR" },
    sess_notes:           { fr: "Notes", en: "Notes" },
    sess_swap:            { fr: "Changer", en: "Swap" },
    sess_skip:            { fr: "Passer", en: "Skip" },
    sess_done:            { fr: "Fait", en: "Done" },
    sess_phase:           { fr: "Phase", en: "Phase" },
    sess_substituted:     { fr: "Substitué automatiquement", en: "Auto-substituted" },
    sess_substituted_for: { fr: "L'exercice d'origine est à éviter pour ta pathologie. Charge / reps conservées.", en: "The original exercise should be avoided for your condition. Load / reps preserved." },
    sess_wod_compatible:  { fr: "WOD compatible avec tes pathologies", en: "WOD compatible with your conditions" },
    sess_wod_warning:     { fr: "WOD à risque pour", en: "WOD risky for" },

    // Settings
    set_title:            { fr: "Réglages", en: "Settings" },
    set_account:          { fr: "Compte", en: "Account" },
    set_signin:           { fr: "Se connecter avec Google", en: "Sign in with Google" },
    set_signout:          { fr: "Se déconnecter", en: "Sign out" },
    set_signed_in_as:     { fr: "Connecté en tant que", en: "Signed in as" },
    set_lang:             { fr: "Langue de l'application", en: "App language" },
    set_lang_sub:         { fr: "Le changement est appliqué immédiatement.", en: "Change is applied immediately." },
    set_pathologies:      { fr: "Pathologies", en: "Conditions" },
    set_path_sub:         { fr: "Active celles diagnostiquées par un professionnel.", en: "Toggle the ones diagnosed by a professional." },
    set_path_disclaimer:  { fr: "⚕️ Ces substitutions sont basées sur des protocoles courants pour blessures musculo-squelettiques. Consulte ton kiné ou médecin avant de t'entraîner avec une blessure active.", en: "⚕️ These substitutions are based on common protocols for musculoskeletal injuries. Consult your physiotherapist or doctor before training with an active injury." },
    set_profile:          { fr: "Profil", en: "Profile" },
    set_export:           { fr: "Exporter mes données", en: "Export my data" },
    set_import:           { fr: "Importer des données", en: "Import data" },
    set_reset:            { fr: "Réinitialiser l'application", en: "Reset the app" },
    set_reset_confirm:    { fr: "Tout supprimer ? Cette action est irréversible.", en: "Delete everything? This action is irreversible." },
    set_phase:            { fr: "Phase actuelle", en: "Current phase" },
    set_kofi:             { fr: "Soutenir le projet", en: "Support the project" },

    // PWA install
    pwa_title:            { fr: "Installer FITStark", en: "Install FITStark" },
    pwa_desc:             { fr: "Installe l'app sur ton écran d'accueil pour un accès rapide.", en: "Install the app on your home screen for quick access." },
    pwa_install:          { fr: "Installer", en: "Install" },
    pwa_later:            { fr: "Plus tard", en: "Later" },

    // Onboarding wizard
    onb_continue:           { fr: "Continuer →", en: "Continue →" },
    onb_back2:              { fr: "← Retour", en: "← Back" },
    onb_skip_default:       { fr: "Passer (utiliser les valeurs par défaut)", en: "Skip (use default values)" },
    onb1_title:             { fr: "👋 Bienvenue !", en: "👋 Welcome!" },
    onb1_sub:               { fr: "On commence par quelques infos pour adapter ton entraînement. Tout est privé, stocké sur ton appareil.", en: "Let's start with a few details to tailor your training. Everything is private, stored on your device." },
    onb1_sex:               { fr: "Sexe", en: "Sex" },
    onb1_male:              { fr: "♂ Homme", en: "♂ Male" },
    onb1_female:            { fr: "♀ Femme", en: "♀ Female" },
    onb1_weight:            { fr: "Poids (kg)", en: "Weight (kg)" },
    onb1_height:            { fr: "Taille (cm)", en: "Height (cm)" },
    onb1_age:               { fr: "Âge", en: "Age" },
    onb2_title:             { fr: "🎯 Quel est ton objectif ?", en: "🎯 What's your goal?" },
    onb2_sub:               { fr: "Détermine la programmation de tes séances. Tu peux changer à tout moment dans Réglages.", en: "Sets the programming for your sessions. You can change anytime in Settings." },
    onb2_g1_name:           { fr: "Prendre de la force", en: "Build strength" },
    onb2_g1_desc:           { fr: "Charges lourdes, 4-6 reps, repos 180s. APRE auto-progression #1 mondial. Ta priorité = la barre qui monte.", en: "Heavy loads, 4-6 reps, 180s rest. APRE auto-progression #1 worldwide. Your priority = bar goes up." },
    onb2_g2_name:           { fr: "Gagner du muscle", en: "Build muscle" },
    onb2_g2_desc:           { fr: "Volume modéré, 8-12 reps, repos 90s. Pour construire du muscle visible (hypertrophie classique).", en: "Moderate volume, 8-12 reps, 90s rest. To build visible muscle (classic hypertrophy)." },
    onb2_g3_name:           { fr: "M'affiner / définition", en: "Cut / definition" },
    onb2_g3_desc:           { fr: "Volume musculaire 8-12 reps + cardio Z2 polarisé Seiler + macros déficit. Retention force, perte de gras.", en: "Muscle volume 8-12 reps + Seiler polarized Z2 cardio + deficit macros. Strength retention, fat loss." },
    onb2_g4_name:           { fr: "Reprise post-blessure", en: "Post-injury recovery" },
    onb2_g4_desc:           { fr: "Phase Deload : 15-20 reps légers, repos 60s, focus forme et amplitude. Mode L5-S1 safe renforcé.", en: "Deload phase: 15-20 light reps, 60s rest, focus on form and range. Enhanced L5-S1 safe mode." },
    onb3_title:             { fr: "🏥 Tes zones sensibles ?", en: "🏥 Your sensitive areas?" },
    onb3_sub:               { fr: "L'app affichera des <b>alertes contextuelles</b> et proposera des <b>substitutions automatiques</b> pour les exercices à risque. <b>Tu peux en sélectionner plusieurs, ou aucune si tu n'as rien.</b>", en: "The app will show <b>contextual alerts</b> and propose <b>automatic substitutions</b> for risky exercises. <b>Select several, or none if you don't have any.</b>" },
    onb3_none_note:         { fr: "Aucune zone sensible — pas d'alerte pendant les séances.", en: "No sensitive area — no alerts during sessions." },
    onb4_title:             { fr: "🚀 Tu es prêt !", en: "🚀 You're ready!" },
    onb4_sub:               { fr: "Ton profil est configuré. Voici un récap :", en: "Your profile is set up. Here's a recap:" },
    onb4_profile:           { fr: "Profil", en: "Profile" },
    onb4_yrs:               { fr: "ans", en: "yrs" },
    onb4_goal:              { fr: "Objectif", en: "Goal" },
    onb4_prog:              { fr: "Programmation", en: "Programming" },
    onb4_zones:             { fr: "Zones sensibles", en: "Sensitive areas" },
    onb4_program:           { fr: "Programme", en: "Program" },
    onb4_program_val:       { fr: "Push / Pull / Legs / Core en 4 séances/sem", en: "Push / Pull / Legs / Core, 4 sessions/wk" },
    onb4_none:              { fr: "Aucune", en: "None" },
    onb4_cardio_tip:        { fr: "<b style=\"color:var(--ok)\">+ Cardio Z2 recommandé.</b> Ajoute 2-3 séances cardio basse intensité par semaine pour optimiser la perte de gras sans perdre du muscle (Seiler 2010).", en: "<b style=\"color:var(--ok)\">+ Z2 cardio recommended.</b> Add 2-3 low-intensity cardio sessions per week to optimize fat loss without losing muscle (Seiler 2010)." },
    onb4_rehab_tip:         { fr: "<b style=\"color:#B97534\">⚠ Reprise = prudence.</b> Écoute ton corps. Arrête si douleur. Tu pourras passer en phase Force ou Hypertrophie quand tu te sentiras prêt.", en: "<b style=\"color:#B97534\">⚠ Recovery = caution.</b> Listen to your body. Stop if pain. You can move to Strength or Hypertrophy phase when ready." },
    onb4_recommended:       { fr: "💡 Recommandé pour démarrer", en: "💡 Recommended to start" },
    onb4_exercises:         { fr: "exercices · ~45 min", en: "exercises · ~45 min" },
    onb4_start_btn:         { fr: "🏋️ Lancer {name} maintenant", en: "🏋️ Start {name} now" },
    onb4_later:             { fr: "Plus tard — aller à l'accueil", en: "Later — go to home" },

    // Achievements
    ach_title:              { fr: "ACHIEVEMENTS", en: "ACHIEVEMENTS" },
    ach_back:               { fr: "← Historique", en: "← History" },
    ach_card_title:         { fr: "Achievements", en: "Achievements" },
    ach_view_all:           { fr: "Voir tout →", en: "See all →" },
    ach_empty:              { fr: "Aucun badge encore — lance ta 1re séance !", en: "No badge yet — start your 1st session!" },
    ach_coming:             { fr: "Bientôt débloqués", en: "Coming soon" },
    ach_unlocked:           { fr: "Badges débloqués", en: "Badges unlocked" },
    ach_cat_assiduity:      { fr: "Assiduité", en: "Consistency" },
    ach_cat_streak:         { fr: "Régularité", en: "Streak" },
    ach_cat_variety:        { fr: "Variété", en: "Variety" },
    ach_cat_performance:    { fr: "Performance", en: "Performance" },
    ach_cat_cardio:         { fr: "Cardio", en: "Cardio" },
    ach_cat_core:           { fr: "Core", en: "Core" },

    // History
    hist_title:             { fr: "Historique", en: "History" },
    hist_empty:             { fr: "Aucune séance 💪", en: "No sessions yet 💪" },
    hist_csv:               { fr: "CSV (Excel)", en: "CSV (Excel)" },
    hist_share:             { fr: "Partager", en: "Share" },
    hist_vol_weekly:        { fr: "Volume hebdo (kg×reps)", en: "Weekly volume (kg×reps)" },
    hist_max_per_ex:        { fr: "Poids max par exercice", en: "Max weight per exercise" },
    hist_details:           { fr: "Détails", en: "Details" },
    hist_hide:              { fr: "Masquer", en: "Hide" },
    hist_run:               { fr: "Course", en: "Running" },
    hist_swim:              { fr: "Nage", en: "Swim" },
    hist_bike:              { fr: "Vélo", en: "Bike" },
    hist_incline:           { fr: "pente", en: "incline" },
    hist_resistance:        { fr: "rés.", en: "res." },

    // Nutrition
    nut_back:               { fr: "← Accueil", en: "← Home" },
    nut_title:              { fr: "NUTRITION", en: "NUTRITION" },
    nut_target:             { fr: "🎯 Cible journalière", en: "🎯 Daily target" },
    nut_kcal:               { fr: "kcal", en: "kcal" },
    nut_kg_per_week:        { fr: "kg/sem", en: "kg/wk" },
    nut_macros_title:       { fr: "Macros", en: "Macros" },
    nut_protein:            { fr: "Protéines", en: "Protein" },
    nut_carbs:              { fr: "Glucides", en: "Carbs" },
    nut_fat:                { fr: "Lipides", en: "Fat" },
    nut_my_params:          { fr: "Mes paramètres", en: "My parameters" },
    nut_weight_label:       { fr: "Poids (kg)", en: "Weight (kg)" },
    nut_height_label:       { fr: "Taille (cm)", en: "Height (cm)" },
    nut_age_label:          { fr: "Âge", en: "Age" },
    nut_sex_label:          { fr: "Sexe", en: "Sex" },
    nut_male:               { fr: "Homme", en: "Male" },
    nut_female:             { fr: "Femme", en: "Female" },
    nut_activity:           { fr: "Activité", en: "Activity" },
    nut_goal:               { fr: "Objectif", en: "Goal" },
    nut_act_1:              { fr: "Sédentaire", en: "Sedentary" },
    nut_act_2:              { fr: "Léger (1-3×/sem)", en: "Light (1-3×/wk)" },
    nut_act_3:              { fr: "Modéré (3-5×/sem)", en: "Moderate (3-5×/wk)" },
    nut_act_4:              { fr: "Élevé (6-7×/sem)", en: "High (6-7×/wk)" },
    nut_act_5:              { fr: "Athlète", en: "Athlete" },
    nut_g_n500:             { fr: "Sèche agressive (-500 kcal)", en: "Aggressive cut (-500 kcal)" },
    nut_g_n400:             { fr: "Sèche (-400 kcal)", en: "Cut (-400 kcal)" },
    nut_g_n300:             { fr: "Sèche soft (-300 kcal)", en: "Soft cut (-300 kcal)" },
    nut_g_0:                { fr: "Maintien", en: "Maintenance" },
    nut_g_250:              { fr: "Prise de masse soft (+250)", en: "Soft bulk (+250)" },
    nut_g_500:              { fr: "Prise de masse (+500)", en: "Bulk (+500)" },
    nut_weight_track:       { fr: "Suivi du poids", en: "Weight tracking" },
    nut_today_weigh:        { fr: "Pesée du jour (kg) — virgule ou point acceptés", en: "Today's weigh-in (kg) — comma or dot accepted" },
    nut_log_btn:            { fr: "+ Enregistrer ma pesée", en: "+ Log my weigh-in" },
    nut_no_weighs:          { fr: "Aucune pesée enregistrée", en: "No weigh-ins recorded" },
    nut_protein_foods:      { fr: "🍽 Aliments riches en protéines", en: "🍽 Protein-rich foods" },
    nut_target_short:       { fr: "Cible", en: "Target" },
    nut_per_day:            { fr: "g de protéines/jour", en: "g protein/day" },

    // Plate calculator
    plate_back:             { fr: "← Accueil", en: "← Home" },
    plate_title:            { fr: "PLATE CALCULATOR", en: "PLATE CALCULATOR" },
    plate_per_side:         { fr: "Par côté", en: "Per side" },
    plate_just_bar:         { fr: "Juste la barre", en: "Just the bar" },
    plate_target:           { fr: "Poids cible (kg)", en: "Target weight (kg)" },
    plate_bar:              { fr: "Barre (kg)", en: "Bar (kg)" },
    plate_impossible:       { fr: "Impossible d'atteindre exactement", en: "Cannot reach exactly" },
    plate_real:             { fr: "réel", en: "actual" },
    plate_missing:          { fr: "manque", en: "missing" },

    // BodyMap
    bm_back:                { fr: "← Accueil", en: "← Home" },
    bm_title:               { fr: "Carte musculaire", en: "Body map" },
    bm_male:                { fr: "Homme", en: "Male" },
    bm_female:              { fr: "Femme", en: "Female" },
    bm_front:               { fr: "Face", en: "Front" },
    bm_back_view:           { fr: "Dos", en: "Back" },
    bm_select_hint:         { fr: "Touche un muscle pour voir les détails.", en: "Tap a muscle to see details." },

    // Streak banner
    streak_label:           { fr: "Série", en: "Streak" },
    streak_days:            { fr: "jours", en: "days" },
    streak_keep:            { fr: "Continue !", en: "Keep going!" },

    // Phases (mapped from data.js PHASES[i].name)
    phase_force:          { fr: "Force", en: "Strength" },
    phase_hyper:          { fr: "Hypertrophie", en: "Hypertrophy" },
    phase_deload:         { fr: "Deload", en: "Deload" },
    phase_force_desc:     { fr: "Charges lourdes", en: "Heavy loads" },
    phase_hyper_desc:     { fr: "Volume modéré", en: "Moderate volume" },
    phase_deload_desc:    { fr: "Récupération", en: "Recovery" },

    // Toast / alerts
    alert_saved:          { fr: "Sauvegardé", en: "Saved" },
    alert_synced:         { fr: "Synchronisé", en: "Synced" },
    alert_error:          { fr: "Erreur", en: "Error" },
    alert_sync_failed:    { fr: "Connexion échouée", en: "Sign-in failed" },
    alert_session_done:   { fr: "Séance terminée !", en: "Session complete!" },

    // Home sections + planning
    home_sec_program:     { fr: "Programme Push-Pull-Legs", en: "Push-Pull-Legs Program" },
    home_sec_planning:    { fr: "Planning idéal de la semaine", en: "Ideal weekly plan" },
    home_sec_wellness:    { fr: "Wellness", en: "Wellness" },
    home_sec_tools:       { fr: "Outils", en: "Tools" },
    home_recommended:     { fr: "Recommandé aujourd'hui", en: "Recommended today" },
    home_week_intro:      { fr: "Idéal scientifique : <b>4 séances/semaine</b> (Push, Pull, Legs, Core), <b>48 h</b> entre séances PPL. Le planning <b>s'adapte</b> : si tu fais Push mardi (au lieu de lundi), Core glisse mercredi, Pull jeudi, etc. <b>Click une tile pour lancer la séance.</b>", en: "Scientific ideal: <b>4 sessions/week</b> (Push, Pull, Legs, Core), <b>48h</b> between PPL sessions. The plan <b>adapts</b>: if you do Push on Tuesday (instead of Monday), Core shifts to Wednesday, Pull to Thursday, etc. <b>Click a tile to start the session.</b>" },
    home_week_foot:       { fr: "<b>Comment ça marche</b> : ✓ = déjà fait cette semaine. La case du jour est encadrée en rouge. <b>Click sur Push, Pull, Legs ou Core</b> pour lancer la séance. Le mardi Core (McGill Big 3 + Pallof) sert d'<b>active recovery</b> : low fatigue, anti-flexion lombaire. Les jours de repos peuvent accueillir un cardio léger (Z2).", en: "<b>How it works</b>: ✓ = already done this week. Today's cell is outlined in red. <b>Click Push, Pull, Legs or Core</b> to start the session. Tuesday Core (McGill Big 3 + Pallof) acts as <b>active recovery</b>: low fatigue, anti-lumbar-flexion. Rest days can host light cardio (Z2).", },
    home_never_done:      { fr: "Jamais",       en: "Never" },
    home_last_today:      { fr: "Aujourd'hui",  en: "Today" },
    home_last_yesterday:  { fr: "Hier",         en: "Yesterday" },
    home_last_days_ago:   { fr: "il y a {n}j",  en: "{n}d ago" },
    home_last_long:       { fr: "Dernier il y a {n}j", en: "Last {n}d ago" },
    home_never_did:       { fr: "Jamais fait",  en: "Never done" },
    home_rec_wod:         { fr: "WOD",          en: "WOD" },
    home_1rm_title:       { fr: "1RM Estimés (Epley)", en: "Estimated 1RM (Epley)" },
    home_fatigue:         { fr: "Fatigue",      en: "Fatigue" },
    home_sessions:        { fr: "Séances",      en: "Sessions" },
    home_7days:           { fr: "7 jours",      en: "7 days" },
    home_periodization:   { fr: "Périodisation", en: "Periodization" },

    // ─── Module Entraînement Personnalisé IA (v8.42) ───
    cp_settings_card_title: { fr: "🧬 Entraînement Personnalisé IA", en: "🧬 Custom AI Training" },
    cp_settings_card_desc:  { fr: "Crée un programme adapté à ton objectif et ton matériel — protocoles validés par la science.", en: "Build a program tailored to your goal and equipment — science-validated protocols." },
    cp_settings_card_btn:   { fr: "Créer mon programme", en: "Build my program" },
    cp_settings_card_active:{ fr: "Programme actif", en: "Active program" },
    cp_settings_card_view:  { fr: "Voir le programme", en: "View program" },
    cp_settings_card_delete:{ fr: "Supprimer", en: "Delete" },

    cp_back:                { fr: "← Retour", en: "← Back" },
    cp_title:               { fr: "ENTRAÎNEMENT PERSONNALISÉ", en: "CUSTOM TRAINING" },
    cp_step_of:             { fr: "Étape {n}/5", en: "Step {n}/5" },
    cp_next:                { fr: "Continuer →", en: "Continue →" },
    cp_prev:                { fr: "← Précédent", en: "← Previous" },
    cp_finish:              { fr: "🚀 Générer mon programme", en: "🚀 Generate my program" },

    // Step 1 : Objectif
    cp_s1_title:            { fr: "🎯 Quel est ton objectif principal ?", en: "🎯 What's your main goal?" },
    cp_s1_sub:              { fr: "Chaque objectif active des protocoles validés scientifiquement (références listées).", en: "Each goal activates science-validated protocols (references listed)." },

    // Step 2 : Méthode
    cp_s2_title:            { fr: "📚 Méthode d'entraînement", en: "📚 Training method" },
    cp_s2_sub:              { fr: "Choisis la méthode validée qui te correspond le mieux.", en: "Pick the validated method that suits you best." },

    // Step 3 : Machines
    cp_s3_title:            { fr: "🏋️ Quel matériel as-tu accès ?", en: "🏋️ What equipment do you have access to?" },
    cp_s3_sub:              { fr: "Sélectionne TOUT ce que tu peux utiliser. On adaptera les exercices à ton matériel disponible.", en: "Select EVERYTHING you can use. We'll adapt exercises to your available equipment." },
    cp_s3_selected:         { fr: "{n} machine sélectionnée", en: "{n} machine selected" },
    cp_s3_selected_pl:      { fr: "{n} machines sélectionnées", en: "{n} machines selected" },
    cp_s3_select_all:       { fr: "Tout sélectionner", en: "Select all" },
    cp_s3_clear:            { fr: "Tout désélectionner", en: "Clear all" },

    // Step 4 : Config
    cp_s4_title:            { fr: "⚙️ Paramètres du programme", en: "⚙️ Program parameters" },
    cp_s4_duration:         { fr: "Durée du programme", en: "Program duration" },
    cp_s4_duration_weeks:   { fr: "{n} semaines", en: "{n} weeks" },
    cp_s4_freq:             { fr: "Fréquence (séances/semaine)", en: "Frequency (sessions/week)" },
    cp_s4_freq_n:           { fr: "{n}× / sem", en: "{n}× / wk" },
    cp_s4_level:            { fr: "Ton niveau", en: "Your level" },
    cp_s4_level_beg:        { fr: "Débutant", en: "Beginner" },
    cp_s4_level_int:        { fr: "Intermédiaire", en: "Intermediate" },
    cp_s4_level_adv:        { fr: "Avancé", en: "Advanced" },
    cp_s4_level_beg_desc:   { fr: "< 1 an d'expérience, focus technique", en: "< 1 year experience, focus on form" },
    cp_s4_level_int_desc:   { fr: "1-3 ans d'expérience, volume modéré", en: "1-3 years experience, moderate volume" },
    cp_s4_level_adv_desc:   { fr: "3+ ans, volume haut, deload programmé", en: "3+ years, high volume, scheduled deload" },

    // Step 5 : Récap
    cp_s5_title:            { fr: "📋 Récap de ton programme", en: "📋 Your program summary" },
    cp_s5_objective:        { fr: "Objectif", en: "Goal" },
    cp_s5_method:           { fr: "Méthode", en: "Method" },
    cp_s5_machines:         { fr: "Matériel", en: "Equipment" },
    cp_s5_duration:         { fr: "Durée", en: "Duration" },
    cp_s5_freq:             { fr: "Fréquence", en: "Frequency" },
    cp_s5_level:            { fr: "Niveau", en: "Level" },
    cp_s5_total_sessions:   { fr: "{n} séances au total", en: "{n} sessions total" },

    // Program view
    cp_view_title:          { fr: "📒 Mon programme personnalisé", en: "📒 My custom program" },
    cp_view_week:           { fr: "Semaine {n}", en: "Week {n}" },
    cp_view_deload:         { fr: "Deload — récup active", en: "Deload — active recovery" },
    cp_view_session:        { fr: "Séance {n}", en: "Session {n}" },
    cp_view_sources:        { fr: "Sources scientifiques", en: "Scientific sources" },
    cp_view_delete_confirm: { fr: "Supprimer ce programme personnalisé ? Cette action est irréversible.", en: "Delete this custom program? This action is irreversible." },
    cp_launch_session:      { fr: "▶ Lancer", en: "▶ Launch" },
    cp_no_exercises:        { fr: "Aucun exercice ne correspond à ce matériel et cet objectif. Ajoute des machines dans Réglages.", en: "No exercise matches this equipment and goal. Add machines in Settings." },

    // v8.44 — Home section + swap UI
    cp_home_title:          { fr: "🧬 Mon programme personnalisé", en: "🧬 My custom program" },
    cp_home_week:           { fr: "Semaine {n}/{total}", en: "Week {n}/{total}" },
    cp_home_this_week:      { fr: "Cette semaine", en: "This week" },
    cp_home_session_done:   { fr: "✓ Terminée", en: "✓ Done" },
    cp_home_cta_title:      { fr: "🧬 Crée ton programme personnalisé", en: "🧬 Build your custom program" },
    cp_home_cta_desc:       { fr: "Choisis ton objectif et ton matériel — on te génère un programme validé par la science, adapté à ta salle.", en: "Pick your goal and equipment — we'll generate a science-backed program tailored to your gym." },
    cp_home_cta_btn:        { fr: "Commencer", en: "Get started" },
    cp_home_view_full:      { fr: "Voir le programme complet", en: "View full program" },
    cp_home_finished:       { fr: "🎉 Programme terminé !", en: "🎉 Program finished!" },
    cp_home_finished_desc:  { fr: "Tu as bouclé les {n} semaines. Crée un nouveau programme pour continuer.", en: "You've completed all {n} weeks. Create a new program to continue." },

    // Swap UI (mid-session)
    swap_btn:               { fr: "🔄 Pas dispo", en: "🔄 Not avail." },
    swap_title:             { fr: "Alternatives pour cibler ce muscle", en: "Alternatives for this muscle" },
    swap_close:             { fr: "Annuler", en: "Cancel" },
    swap_remove_machine:    { fr: "Cette machine n'est pas dans ma salle → la retirer", en: "This machine isn't in my gym → remove it" },
    swap_no_alt:            { fr: "Aucune alternative compatible avec ton matériel. Va dans Réglages pour ajouter des machines.", en: "No alternative matches your equipment. Go to Settings to add machines." },
    swap_remove_confirm:    { fr: "Retirer {name} de ton programme ? Cette machine ne sera plus utilisée pour les futures séances.", en: "Remove {name} from your program? This machine won't be used in future sessions." },
    swap_picked:            { fr: "Exercice remplacé ✓", en: "Exercise swapped ✓" },

    // Custom / Personnalisé (v8.42 rename)
    custom_label:         { fr: "Personnalisé", en: "Custom" },
    custom_label_upper:   { fr: "PERSONNALISÉ", en: "CUSTOM" },
    custom_builder_title: { fr: "🎨 Programme personnalisé", en: "🎨 Custom program" },
    custom_choose_hint:   { fr: "Choisis 4-8 exercices pour ta séance personnalisée. Elle apparaîtra sur l'accueil.", en: "Pick 4-8 exercises for your custom session. It will appear on the home screen." },
    custom_name_placeholder: { fr: "Nom de la séance (ex: Bras intense)", en: "Session name (e.g. Arms intense)" },
    custom_launch:        { fr: "🚀 Lancer {name}", en: "🚀 Start {name}" },
    custom_selected_n:    { fr: "{n} sélectionné", en: "{n} selected" },
    custom_selected_n_pl: { fr: "{n} sélectionnés", en: "{n} selected" },

    // Onboarding final CTA (v8.45) + Step 2 advanced (v8.46 — placed correctly in UI dict)
    onb4_custom_btn:      { fr: "🧬 Créer mon programme personnalisé", en: "🧬 Build my custom program" },
    onb4_custom_hint:     { fr: "Recommandé : adapte chaque séance à ton matériel + objectif", en: "Recommended: tailors each session to your equipment + goal" },

    // Étape 2 onboarding : bouton vers le programme sur mesure
    // Copy v8.47 : explique CLAIREMENT ce qui se passe au click (séparation visuelle d'avec le PPL standard)
    onb2_advanced_section_title: { fr: "Tu veux aller plus loin ?", en: "Want to go further?" },
    onb2_advanced_btn:    { fr: "🧬 Construire un programme sur mesure →", en: "🧬 Build a tailored program →" },
    onb2_advanced_hint:   { fr: "Au lieu du programme PPL standard, on te génère un plan sur 4 à 12 semaines avec un protocole scientifique précis (5/3/1, APRE, HIIT 4×4, McGill Big 3…) et les exercices choisis selon ton matériel disponible.", en: "Instead of the standard PPL program, we generate a 4 to 12 week plan with a precise science-validated protocol (5/3/1, APRE, HIIT 4×4, McGill Big 3…) and exercises picked from your available equipment." },

    // v8.51 — Définitions du jargon technique (tooltips dans la card prescription)
    jargon_FCmax:         { fr: "<b>FC max</b> (Fréquence cardiaque maximale) : nombre maximal de battements/min que ton cœur peut atteindre. Formule Fox : <b>220 − ton âge</b>. Ex : 30 ans → 190 bpm.", en: "<b>Max HR</b> (Maximum Heart Rate): your heart's highest beat rate per minute. Fox formula: <b>220 − your age</b>. E.g., age 30 → 190 bpm." },
    jargon_RPE:           { fr: "<b>RPE</b> (Rate of Perceived Exertion) : échelle subjective d'effort de 1 à 10. <b>RPE 7</b> = lourd, 3 reps en réserve. <b>RPE 10</b> = effort max, impossible de faire 1 rep de plus.", en: "<b>RPE</b> (Rate of Perceived Exertion): subjective effort scale 1-10. <b>RPE 7</b> = heavy, 3 reps in reserve. <b>RPE 10</b> = max effort, can't do one more rep." },
    jargon_RIR:           { fr: "<b>RIR</b> (Reps In Reserve) : nombre de reps que tu pourrais ENCORE faire avant l'échec technique. <b>RIR 0</b> = échec. <b>RIR 2</b> = il te reste 2 reps en réserve.", en: "<b>RIR</b> (Reps In Reserve): how many more reps you could do before technical failure. <b>RIR 0</b> = failure. <b>RIR 2</b> = 2 reps left in the tank." },
    "jargon_1RM":         { fr: "<b>1RM</b> (One Rep Max) : la charge maximale que tu peux soulever <b>1 seule fois</b> avec une forme parfaite. Utilisé pour calculer les % de charge d'entraînement.", en: "<b>1RM</b> (One Rep Max): the maximum load you can lift <b>once</b> with perfect form. Used to calculate training percentages." },
    jargon_Z2:            { fr: "<b>Zone 2</b> (Z2, échelle de Seiler) : effort modéré soutenu, <b>60-70% FCmax</b>. Tu dois pouvoir tenir une conversation. Base aérobie, brûle-graisse.", en: "<b>Zone 2</b> (Z2, Seiler scale): sustained moderate effort, <b>60-70% Max HR</b>. You should be able to hold a conversation. Aerobic base, fat burning." },
    jargon_Z5:            { fr: "<b>Zone 5</b> (Z5) : effort maximal court, <b>90-100% FCmax</b>. Sprints courts, intervalles HIIT. Améliore VO2max et puissance.", en: "<b>Zone 5</b> (Z5): short max effort, <b>90-100% Max HR</b>. Short sprints, HIIT intervals. Improves VO2max and power." },
    jargon_VO2max:        { fr: "<b>VO2max</b> : volume maximal d'oxygène que ton corps peut consommer par minute. Indicateur clé d'endurance et de longévité (Mayo Clinic).", en: "<b>VO2max</b>: max oxygen volume your body can use per minute. Key indicator of endurance and longevity (Mayo Clinic)." },
    jargon_EPOC:          { fr: "<b>EPOC</b> (Excess Post-exercise Oxygen Consumption) : surconsommation d'oxygène après l'effort. Effet \"after-burn\" qui brûle des calories pendant 6-24h post-séance.", en: "<b>EPOC</b> (Excess Post-exercise Oxygen Consumption): post-exercise oxygen overconsumption. \"After-burn\" effect burning calories 6-24h post-workout." },
    jargon_EMOM:          { fr: "<b>EMOM</b> (Every Minute On the Minute) : démarre un set au début de chaque minute. Le temps restant après les reps = ton repos. Si tu finis en 30s, tu te reposes 30s.", en: "<b>EMOM</b> (Every Minute On the Minute): start a set at the top of each minute. Remaining time = your rest. Finish in 30s → rest 30s." },
    jargon_AMRAP:         { fr: "<b>AMRAP</b> (As Many Reps As Possible) : fais le plus de reps possibles dans un temps donné. Effort max, sans s'arrêter, jusqu'à la fin du chrono.", en: "<b>AMRAP</b> (As Many Reps As Possible): do as many reps as possible in a set time. Max effort, no stopping until time's up." },
    jargon_Deload:        { fr: "<b>Deload</b> : semaine de récupération active avec volume et/ou intensité réduits (−40% typiquement). Indispensable toutes les 4-8 sem. pour éviter le surentraînement.", en: "<b>Deload</b>: active recovery week with reduced volume and/or intensity (typically −40%). Essential every 4-8 weeks to prevent overtraining." },
    jargon_APRE:          { fr: "<b>APRE</b> (Auto-Regulated Progressive Resistance Exercise) : protocole d'auto-progression où la charge du dernier set ajuste automatiquement les sessions suivantes. #1 mondial SUCRA 93% (Huang 2025).", en: "<b>APRE</b> (Auto-Regulated Progressive Resistance Exercise): self-adjusting protocol where last set's reps auto-adjust the next sessions. #1 worldwide SUCRA 93% (Huang 2025)." },
    jargon_BMR:           { fr: "<b>BMR</b> (Basal Metabolic Rate) : calories que ton corps brûle au repos (juste pour rester en vie). Calculé via Mifflin-St Jeor selon poids/taille/âge/sexe.", en: "<b>BMR</b> (Basal Metabolic Rate): calories your body burns at rest (just staying alive). Calculated via Mifflin-St Jeor from weight/height/age/sex." },
    jargon_TDEE:          { fr: "<b>TDEE</b> (Total Daily Energy Expenditure) : total des calories brûlées par jour = BMR × facteur d'activité. C'est ta cible de maintien.", en: "<b>TDEE</b> (Total Daily Energy Expenditure): total daily calories burned = BMR × activity factor. Your maintenance target." },
    jargon_PR:            { fr: "<b>PR</b> (Personal Record) : ton meilleur résultat à vie sur un exercice donné (kg, temps, distance, reps). Battre un PR = signe net de progression.", en: "<b>PR</b> (Personal Record): your lifetime best on a given exercise (kg, time, distance, reps). Beating a PR = clear progress signal." },
    "jargon_HIIT":        { fr: "<b>HIIT</b> (High-Intensity Interval Training) : alternance d'efforts très intenses et de récupérations courtes. Brûle plus de gras que le cardio stable, en moins de temps.", en: "<b>HIIT</b> (High-Intensity Interval Training): alternating very intense efforts and short recoveries. Burns more fat than steady cardio, in less time." },
    "jargon_HSR":         { fr: "<b>HSR</b> (Heavy Slow Resistance) : excentriques lents (3-4s) avec charges modérées 70-80% 1RM. Standard pour réhabilitation tendinite patellaire/Achille.", en: "<b>HSR</b> (Heavy Slow Resistance): slow eccentrics (3-4s) with moderate loads 70-80% 1RM. Standard for patellar/Achilles tendinopathy rehab." },
    "jargon_McGill":      { fr: "<b>McGill Big 3</b> : protocole de Stuart McGill (chercheur en biomécanique lombaire) — Curl-up modifié + Side Plank + Bird Dog. Renforce le caisson abdominal sans charger les disques lombaires.", en: "<b>McGill Big 3</b>: protocol by Stuart McGill (lumbar biomechanics researcher) — Modified Curl-up + Side Plank + Bird Dog. Strengthens abdominal box without loading lumbar discs." },

    // v8.64 — Bouton "Refaire l'onboarding"
    set_redo_onb_title:   { fr: "🔄 Refaire la configuration initiale", en: "🔄 Redo initial setup" },
    set_redo_onb_desc:    { fr: "Relance le wizard 4 étapes (profil → pathologies → objectif → récap). Ton historique reste intact.", en: "Replay the 4-step wizard (profile → pathologies → goal → recap). Your history stays intact." },
    set_redo_onb_btn:     { fr: "Relancer maintenant", en: "Restart now" },
    set_redo_onb_confirm: { fr: "Refaire la configuration initiale ?\n\nTu vas repasser par les 4 étapes du wizard.\nTon historique de séances et tes données restent intacts.", en: "Redo initial setup?\n\nYou'll go through the 4 wizard steps again.\nYour session history and data stay intact." },

    // v8.60 — Session view + WOD + Cardio (strings restantes)
    sess_warmup_title:    { fr: "ÉCHAUFFEMENT", en: "WARMUP" },
    sess_start_btn:       { fr: "Commencer →", en: "Start →" },
    sess_next_btn:        { fr: "Suivant →", en: "Next →" },
    sess_wod_btn:         { fr: "WOD →", en: "WOD →" },
    sess_finish_btn:      { fr: "✓ Terminer", en: "✓ Finish" },
    sess_save_btn:        { fr: "✓ Enregistrer", en: "✓ Save" },
    sess_img_start:       { fr: "Départ", en: "Start" },
    sess_img_end:         { fr: "Fin", en: "End" },
    sess_rir_title:       { fr: "RIR — Reps en Réserve (optionnel)", en: "RIR — Reps In Reserve (optional)" },
    sess_rir_legend:      { fr: "0 = failure · 1 = pouvais en faire 1 de + · 4 = facile", en: "0 = failure · 1 = could do 1 more · 4 = easy" },
    sess_notes_label:     { fr: "Notes", en: "Notes" },
    sess_notes_placeholder: { fr: "Ressenti, PR…", en: "Feel, PR…" },
    sess_cardio_notes_ph: { fr: "Ressenti, météo, FC moyenne…", en: "Feel, weather, avg HR…" },
    sess_video_label:     { fr: "▶ Vidéo", en: "▶ Video" },
    sess_wod_for_time:    { fr: "For Time", en: "For Time" },
    sess_wod_min:         { fr: "min", en: "min" },
    sess_wod_compatible:  { fr: "WOD compatible", en: "Compatible WOD" },
    sess_wod_no_risk:     { fr: "aucun mouvement à éviter détecté pour ta/tes pathologie(s).", en: "no movement to avoid detected for your pathology(ies)." },
    sess_wod_countdown:   { fr: "DÉCOMPTE", en: "COUNTDOWN" },
    sess_wod_freetimer:   { fr: "chrono libre", en: "free timer" },
    sess_back_aria:       { fr: "Exercice précédent", en: "Previous exercise" },
    sess_quit_confirm:    { fr: "Quitter ?", en: "Quit?" },

    // v8.59 — Calendar heatmap
    heatmap_title:        { fr: "Activité 12 dernières semaines", en: "Activity last 12 weeks" },
    heatmap_less:         { fr: "Moins", en: "Less" },
    heatmap_more:         { fr: "Plus", en: "More" },

    // v8.58 — Body map muscle detail + Mon objectif + Custom WOD
    bm_volume_30:         { fr: "Volume 30j", en: "Volume 30d" },
    bm_sessions_30:       { fr: "Séances 30j", en: "Sessions 30d" },
    bm_last:              { fr: "Dernier", en: "Last" },
    bm_best_1rm:          { fr: "Best 1RM est.", en: "Best 1RM est." },
    bm_never_trained:     { fr: "Jamais entraîné", en: "Never trained" },
    bm_today:             { fr: "Aujourd'hui", en: "Today" },
    bm_yesterday:         { fr: "Hier", en: "Yesterday" },
    bm_days_ago:          { fr: "Il y a {n} j", en: "{n} days ago" },

    // rGoalCard (Mon objectif)
    goal_card_title:      { fr: "🎯 Mon objectif", en: "🎯 My goal" },
    goal_card_sub:        { fr: "Détermine la programmation par défaut. Changer ici met aussi à jour la <b>Périodisation</b> ci-dessous.", en: "Sets the default programming. Changing here also updates <b>Periodization</b> below." },
    goal_force_name:      { fr: "Prendre de la force", en: "Build strength" },
    goal_force_desc:      { fr: "Charges lourdes 4-6 reps, repos 180s. APRE auto-progression.", en: "Heavy loads 4-6 reps, 180s rest. APRE auto-progression." },
    goal_muscle_name:     { fr: "Gagner du muscle", en: "Build muscle" },
    goal_muscle_desc:     { fr: "Volume modéré 8-12 reps, repos 90s. Hypertrophie classique.", en: "Moderate volume 8-12 reps, 90s rest. Classic hypertrophy." },
    goal_lean_name:       { fr: "M'affiner / définition", en: "Cut / definition" },
    goal_lean_desc:       { fr: "Hypertrophie + cardio Z2 + macros déficit. Retention force, perte gras.", en: "Hypertrophy + Z2 cardio + deficit macros. Strength retention, fat loss." },
    goal_rehab_name:      { fr: "Reprise post-blessure", en: "Post-injury recovery" },
    goal_rehab_desc:      { fr: "Deload 15-20 reps, repos 60s. Focus forme + ROM. Mode L5-S1 safe renforcé.", en: "Deload 15-20 reps, 60s rest. Focus on form + ROM. Enhanced L5-S1 safe mode." },

    // Custom WOD picker
    cw_optional_wod:      { fr: "Optional WOD", en: "Optional WOD" },
    cw_add_wod_intro:     { fr: "Ajoute un WOD à la fin de ta séance.", en: "Add a WOD at the end of your session." },
    cw_wod_selected:      { fr: "sélectionné", en: "selected" },
    cw_remove:            { fr: "retirer", en: "remove" },
    cw_no_wod:            { fr: "Aucun WOD pour le moment.", en: "No WOD selected." },
    cw_filter_all:        { fr: "Tous", en: "All" },
    cw_filter_express:    { fr: "≤8 min", en: "≤8 min" },
    cw_filter_standard:   { fr: "10-12 min", en: "10-12 min" },
    cw_filter_long:       { fr: "≥15 min", en: "≥15 min" },
    cw_cat_fullbody:      { fr: "Full-body", en: "Full-body" },
    cw_cat_upper:         { fr: "Haut du corps", en: "Upper body" },
    cw_cat_lower:         { fr: "Bas du corps", en: "Lower body" },
    cw_wods_count:        { fr: "WODs", en: "WODs" },

    // v8.55 — Gros batch traductions manquantes
    streak_msg_new:       { fr: "Bienvenue ! Lance ta première séance 💪", en: "Welcome! Start your first session 💪" },
    streak_msg_active:    { fr: "🔥 {n} séance cette semaine — continue !", en: "🔥 {n} session this week — keep going!" },
    streak_msg_active_pl: { fr: "🔥 {n} séances cette semaine — continue !", en: "🔥 {n} sessions this week — keep going!" },
    streak_msg_ok_y:      { fr: "Dernière séance hier — bon rythme", en: "Last session yesterday — good rhythm" },
    streak_msg_ok_d:      { fr: "Dernière séance il y a {n} jours — bon rythme", en: "Last session {n} days ago — good rhythm" },
    streak_msg_warn:      { fr: "⚠️ {n} jours sans séance — pense à bouger", en: "⚠️ {n} days without a session — time to move" },
    streak_msg_alert:     { fr: "🚨 {n} jours sans séance — relance le rythme !", en: "🚨 {n} days without a session — get back to it!" },
    streak_msg_lost:      { fr: "{n} jours sans séance — repars en douceur", en: "{n} days without a session — restart gently" },
    streak_btn_launch:    { fr: "Lancer", en: "Start" },

    // Pathology rules (PATHOLOGY_RULES)
    path_rules_mandatory: { fr: "Obligatoire", en: "Mandatory" },
    path_rules_forbidden: { fr: "Interdit", en: "Forbidden" },
    path_rules_modified:  { fr: "Modifié", en: "Modified" },
    path_l5_mandatory:    { fr: "McGill Big 3 + Dead Bug", en: "McGill Big 3 + Dead Bug" },
    path_l5_forbidden:    { fr: "Rowing buste penché, deadlift conventionnel, Ab Wheel", en: "Bent-over rows, conventional deadlift, Ab Wheel" },
    path_l5_modified:     { fr: "Burpees step-back, ceinture au squat, RDL → Goblet Squat", en: "Step-back burpees, belt for squat, RDL → Goblet Squat" },
    path_sh_mandatory:    { fr: "Face Pulls hebdo, échauffement coiffe rotateurs", en: "Weekly Face Pulls, rotator cuff warmup" },
    path_sh_forbidden:    { fr: "Behind-the-neck press, Dips poitrine, Arnold Press lourd", en: "Behind-the-neck press, chest Dips, heavy Arnold Press" },
    path_sh_modified:     { fr: "OHP → DB neutre, Bench coudes 45°, Lateral max hauteur épaule", en: "OHP → neutral DB, Bench elbows at 45°, Lateral max shoulder height" },
    path_kn_mandatory:    { fr: "Échauffement Goblet léger avant squat, étirements quad/IT band", en: "Light Goblet warmup before squat, quad/IT band stretches" },
    path_kn_forbidden:    { fr: "Pistol squats lourds, Broad Jumps répétés, sauts en profondeur", en: "Heavy pistol squats, repeated Broad Jumps, depth jumps" },
    path_kn_modified:     { fr: "Genou suit l'orteil, Reverse Lunges > Walking, pas long contrôlé", en: "Knee tracks toe, Reverse Lunges > Walking, controlled long stride" },
    path_wr_mandatory:    { fr: "Barre EZ pour curls, bracelets de force si nécessaire", en: "EZ bar for curls, wrist wraps if needed" },
    path_wr_forbidden:    { fr: "Barre droite chargée, push-ups poignet plat sous fatigue", en: "Heavy straight bar, flat-wrist push-ups under fatigue" },
    path_wr_modified:     { fr: "Plank sur avant-bras, dips sur barres parallèles épaisses, paume en base", en: "Forearm plank, dips on thick parallel bars, palm-base grip" },
    path_el_mandatory:    { fr: "Excentrique lent 3s sur curls et extensions, barre EZ", en: "Slow 3s eccentric on curls and extensions, EZ bar" },
    path_el_forbidden:    { fr: "Skull crushers volume haut, Preacher Curl pleine extension", en: "High-volume skull crushers, full-range Preacher Curl" },
    path_el_modified:     { fr: "Triceps coudes collés au tronc, corde > barre, chin-ups → neutres", en: "Triceps elbows pinned to torso, rope > bar, chin-ups → neutral grip" },
    path_mode_single:     { fr: "Mode {label} actif — règles de protection", en: "Mode {label} active — protection rules" },
    path_mode_multi:      { fr: "Mode multi-pathologies actif ({labels}) — règles de protection", en: "Multi-pathology mode active ({labels}) — protection rules" },
    path_mode_none:       { fr: "Aucune pathologie déclarée — alertes désactivées", en: "No pathology declared — alerts disabled" },
    path_mode_none_hint:  { fr: "Tu peux en activer dans Réglages si tu as une zone sensible.", en: "You can enable one in Settings if you have a sensitive area." },

    // Body map
    bm_title_full:        { fr: "Carte musculaire", en: "Body map" },
    bm_hint_tap:          { fr: "👆 Touche un muscle pour voir le détail (volume 30j, séances, dernier entraînement, 1RM)", en: "👆 Tap a muscle to see details (30-day volume, sessions, last workout, 1RM)" },
    bm_legend_title:      { fr: "Fraîcheur — couleur du muscle", en: "Recency — muscle color" },
    bm_legend_2:          { fr: "≤ 2 j", en: "≤ 2 d" },
    bm_legend_3:          { fr: "3-5 j", en: "3-5 d" },
    bm_legend_6:          { fr: "6-10 j", en: "6-10 d" },
    bm_legend_11:         { fr: "11-20 j", en: "11-20 d" },
    bm_legend_20:         { fr: "> 20 j", en: "> 20 d" },
    bm_legend_never:      { fr: "jamais", en: "never" },
    bm_credit:            { fr: "Illustration", en: "Illustration" },

    // Plate calc footer
    plate_legend_title:   { fr: "💡 Disques utilisés", en: "💡 Plates used" },
    plate_legend_std:     { fr: "Standard olympique : 25, 20, 15, 10, 5, 2.5, 1.25 kg.", en: "Olympic standard: 25, 20, 15, 10, 5, 2.5, 1.25 kg." },
    plate_legend_bar:     { fr: "Barre par défaut : 20 kg (olympique). Femme/jeune : 15 kg. EZ : 7 kg.", en: "Default bar: 20 kg (Olympic). Women/youth: 15 kg. EZ: 7 kg." },

    // Cloud sync card
    sync_title:           { fr: "☁️ Cloud Sync", en: "☁️ Cloud Sync" },
    sync_desc:            { fr: "Connecte-toi pour synchroniser ton historique entre tous tes appareils. Tes données restent privées (toi seul peux y accéder).", en: "Sign in to sync your history across all your devices. Your data stays private (only you can access it)." },
    sync_signin_google:   { fr: "🔐 Se connecter avec Google", en: "🔐 Sign in with Google" },
    sync_signed_in_as:    { fr: "Connecté en tant que", en: "Signed in as" },
    sync_signout:         { fr: "Se déconnecter", en: "Sign out" },
    sync_pull:            { fr: "⬇ Récupérer du cloud", en: "⬇ Pull from cloud" },
    sync_push:            { fr: "⬆ Pousser vers le cloud", en: "⬆ Push to cloud" },
    sync_last_synced:     { fr: "Dernière synchro", en: "Last synced" },

    // Notifications card
    notif_title:          { fr: "🔔 Rappels", en: "🔔 Reminders" },
    notif_desc:           { fr: "Reçois un rappel discret si tu n'as pas fait de séance depuis quelques jours. Une seule notif maximum par 24h, jamais de spam.", en: "Get a gentle reminder if you haven't worked out in a few days. Max one notification per 24h, never spam." },
    notif_enable:         { fr: "🔔 Activer les rappels", en: "🔔 Enable reminders" },
    notif_enabled:        { fr: "Rappels après ≥3 jours sans séance", en: "Reminders after ≥3 days without a session" },
    notif_disable:        { fr: "Désactiver", en: "Disable" },
    notif_denied:         { fr: "Notifications bloquées par le navigateur. Active-les dans les réglages du navigateur.", en: "Notifications blocked by the browser. Enable them in browser settings." },
    notif_unsupported:    { fr: "Notifications non supportées par ce navigateur.", en: "Notifications not supported by this browser." },

    // Data footer + about
    data_localstorage:    { fr: "⚠️ Données en localStorage + sync cloud (Firebase).", en: "⚠️ Data in localStorage + cloud sync (Firebase)." },
    data_about_features:  { fr: "APRE progression (Huang 2025) • 1RM Epley+Brzycki • RIR tracker", en: "APRE progression (Huang 2025) • 1RM Epley+Brzycki • RIR tracker" },
    data_about_modes:     { fr: "Fatigue score • Back Pain Safe mode", en: "Fatigue score • Back Pain Safe mode" },
    data_about_modules:   { fr: "Périodisation • Cardio • Core 12 sem • Nutrition", en: "Periodization • Cardio • Core 12 wk • Nutrition" },
    footer_privacy:       { fr: "Politique de confidentialité", en: "Privacy policy" },
    footer_terms:         { fr: "Conditions d'utilisation", en: "Terms of use" },
    footer_source:        { fr: "Code source", en: "Source code" },

    // v8.54 — Gaps de traduction restants
    set_data_title:       { fr: "Données", en: "Data" },
    set_export_csv:       { fr: "📊 CSV (Excel)", en: "📊 CSV (Excel)" },
    set_export_json:      { fr: "📤 Backup JSON", en: "📤 JSON backup" },
    set_import:           { fr: "📥 Importer", en: "📥 Import" },
    set_wipe:             { fr: "🗑 Effacer (avec backup)", en: "🗑 Erase (with backup)" },
    wod_optional:         { fr: "WOD optionnel", en: "Optional WOD" },
    core_start_btn:       { fr: "🚀 Démarrer le programme (semaine 1)", en: "🚀 Start program (week 1)" },
    nut_mifflin_ref:      { fr: "📚 Référence Mifflin-St Jeor (1990)", en: "📚 Mifflin-St Jeor reference (1990)" },
    nut_recommendations:  { fr: "Recommandations", en: "Recommendations" },
    nut_rec_protein:      { fr: "Protéines 2g/kg : préserve le muscle en déficit (Helms 2014)", en: "Protein 2g/kg: preserves muscle in deficit (Helms 2014)" },
    nut_rec_fat:          { fr: "Lipides ≥0.8g/kg : santé hormonale", en: "Fat ≥0.8g/kg: hormonal health" },
    nut_rec_carbs:        { fr: "Glucides : remplissent le reste", en: "Carbs: fill the rest" },
    nut_rec_weigh:        { fr: "Pesée hebdo à jeun, moyenne sur 7j", en: "Weekly fasting weigh-in, 7-day average" },

    // v8.50 — Card prescription (intensité, FC cible, format de la séance)
    presc_title:          { fr: "📋 Comment exécuter", en: "📋 How to execute" },
    presc_intensity:      { fr: "Intensité cible", en: "Target intensity" },
    presc_hr_target:      { fr: "FC cible", en: "Target HR" },
    presc_hr_bpm:         { fr: "bpm", en: "bpm" },
    presc_hr_age_note:    { fr: "(estimation pour {age} ans)", en: "(estimate for age {age})" },
    presc_format:         { fr: "Format", en: "Format" },
    presc_format_intervals: { fr: "{n} séries de {work} effort + {rest}s récup", en: "{n} sets of {work} effort + {rest}s rest" },
    presc_format_strength:  { fr: "{n} séries × {reps} reps · repos {rest}s", en: "{n} sets × {reps} reps · {rest}s rest" },
    presc_format_time:      { fr: "{n} séries de {hold} secondes de tenue · repos {rest}s entre séries", en: "{n} sets of {hold} seconds hold · {rest}s rest between sets" },
    presc_max_effort:     { fr: "🔥 Effort maximal — comme si tu fuyais un ours. Pas de retenue.", en: "🔥 Maximal effort — like running from a bear. No holding back." },
    presc_z2_note:        { fr: "🌿 Allure conversation : tu dois pouvoir tenir une discussion sans haleter.", en: "🌿 Conversational pace: you should be able to chat without panting." },
    presc_hiit_note:      { fr: "💨 Essoufflement marqué : tu peux dire 3-4 mots à la fois max.", en: "💨 Heavy breathing: only 3-4 words at a time max." },
    presc_rir_note:       { fr: "🎯 RIR cible : arrête ta série à 0-2 reps de l'échec technique.", en: "🎯 Target RIR: stop your set 0-2 reps shy of technical failure." },
    presc_pct_1rm_note:   { fr: "💪 Calcule depuis ton 1RM (visible sur l'accueil).", en: "💪 Calculate from your 1RM (shown on home)." },
    presc_session_label:  { fr: "Pour cette séance", en: "For this session" },

    // v8.49 — Headers de set selon logType
    sess_col_kg:      { fr: "Kg",       en: "Kg" },
    sess_col_reps:    { fr: "Reps",     en: "Reps" },
    sess_col_time:    { fr: "Secondes", en: "Seconds" },
    sess_col_min:     { fr: "Minutes",  en: "Minutes" },
    sess_col_km:      { fr: "km",       en: "km" },
    sess_col_m:       { fr: "Mètres",   en: "Meters" },
    sess_logtype_hint_reps_bw: { fr: "📌 Exercice au poids du corps — note juste le nombre de répétitions.", en: "📌 Bodyweight exercise — just log the rep count." },
    sess_logtype_hint_time:    { fr: "📌 Exercice isométrique — note le temps tenu (en secondes).", en: "📌 Isometric exercise — log the hold time (in seconds)." },
    sess_logtype_hint_cardio:  { fr: "📌 Exercice cardio — note la durée (min) et la distance optionnelle (km).", en: "📌 Cardio exercise — log duration (min) and optional distance (km)." },
    sess_logtype_hint_distance_load: { fr: "📌 Carry / portage — note la distance parcourue (m) et la charge utilisée (kg).", en: "📌 Carry exercise — log the distance walked (m) and the load used (kg)." },

    // Custom weekly planning labels (v8.46)
    cp_plan_title:        { fr: "Planning idéal de la semaine", en: "Ideal weekly plan" },
    cp_plan_intro:        { fr: "Tes <b>{n} séances</b> de la semaine {w}/{total} réparties intelligemment. Le planning <b>s'adapte</b> : si tu décales une séance, les suivantes glissent automatiquement.", en: "Your <b>{n} sessions</b> for week {w}/{total} smartly spread. The plan <b>adapts</b>: if you shift a session, the next ones slide automatically." },
    cp_plan_short:        { fr: "S{n}", en: "S{n}" },
    cp_plan_foot:         { fr: "<b>Comment ça marche</b> : ✓ = séance déjà faite. La case du jour est encadrée en rouge. <b>Click sur une case</b> pour lancer la séance. Les jours sans séance peuvent accueillir un cardio léger (Z2).", en: "<b>How it works</b>: ✓ = session done. Today's cell is outlined in red. <b>Click a cell</b> to start the session. Rest days can host light cardio (Z2)." },

    // Planning recommendation banner (v8.41)
    plan_rec_title:       { fr: "🎯 Adaptation auto", en: "🎯 Auto adaptation" },
    plan_rec_today:       { fr: "<b>{name}</b> — recommandée aujourd'hui car c'est la séance pas faite depuis <b>{days} jours</b>.", en: "<b>{name}</b> — recommended today because it's the session you haven't done in <b>{days} days</b>." },
    plan_rec_never:       { fr: "<b>{name}</b> — recommandée aujourd'hui : <b>jamais faite</b>.", en: "<b>{name}</b> — recommended today: <b>never done</b>." },
    plan_rec_all_done:    { fr: "✓ Tous les PPL faits cette semaine — semaine complète !", en: "✓ All PPL done this week — full week!" },
    plan_rec_badge:       { fr: "⭐ Reco", en: "⭐ Top" },

    // Days of week (short)
    day_mon: { fr: "Lun", en: "Mon" },
    day_tue: { fr: "Mar", en: "Tue" },
    day_wed: { fr: "Mer", en: "Wed" },
    day_thu: { fr: "Jeu", en: "Thu" },
    day_fri: { fr: "Ven", en: "Fri" },
    day_sat: { fr: "Sam", en: "Sat" },
    day_sun: { fr: "Dim", en: "Sun" },
    plan_push: { fr: "Push", en: "Push" },
    plan_pull: { fr: "Pull", en: "Pull" },
    plan_legs: { fr: "Legs", en: "Legs" },
    plan_core: { fr: "Core", en: "Core" },
    plan_rest: { fr: "Repos", en: "Rest" },

    // Tools chips
    tool_bodymap:         { fr: "Carte musculaire", en: "Body map" },
    tool_plate:           { fr: "Plate calculator", en: "Plate calculator" },

    // Cardio / Core / Nutrition tiles
    tile_cardio_meta:     { fr: "Course · Nage · Vélo — durée, pente, vitesse, distance, résistance", en: "Running · Swim · Bike — duration, incline, speed, distance, resistance" },
    tile_cardio_last:     { fr: "Dernier", en: "Last" },
    tile_cardio_run:      { fr: "Course", en: "Running" },
    tile_cardio_swim:     { fr: "Nage", en: "Swim" },
    tile_cardio_bike:     { fr: "Vélo", en: "Bike" },
    tile_core_meta:       { fr: "Pallof Press + Suitcase Carry — programme 12 sem · 2×/sem · L5-S1 safe", en: "Pallof Press + Suitcase Carry — 12-week program · 2×/wk · L5-S1 safe" },
    tile_core_week:       { fr: "Semaine {n}/12", en: "Week {n}/12" },
    tile_core_notstarted: { fr: "Pas encore démarré", en: "Not started yet" },
    tile_nut_target:      { fr: "Cible", en: "Target" },
    tile_nut_kcal:        { fr: "kcal/j", en: "kcal/day" },
    tile_nut_prot:        { fr: "prot", en: "protein" },
    tile_nut_fat:         { fr: "lip", en: "fat" },
    tile_nut_carbs:       { fr: "glucides", en: "carbs" },
    tile_nut_last:        { fr: "Dernière pesée", en: "Last weigh-in" },
    tile_nut_config:      { fr: "Configurer mon plan calorique", en: "Configure my calorie plan" },

    // Misc
    misc_duration:        { fr: "Durée", en: "Duration" },
    misc_min:             { fr: "min", en: "min" },
    misc_sec:             { fr: "s", en: "s" },
    misc_kg:              { fr: "kg", en: "kg" },
    misc_total:           { fr: "Total", en: "Total" },
    misc_streak:          { fr: "Série", en: "Streak" },
    misc_volume:          { fr: "Volume", en: "Volume" },
    misc_pr:              { fr: "Record", en: "PR" },
    misc_categories:      { fr: "Catégories", en: "Categories" },
    misc_full_body:       { fr: "Full-body", en: "Full-body" },
    misc_upper_body:      { fr: "Haut du corps", en: "Upper body" },
    misc_lower_body:      { fr: "Bas du corps", en: "Lower body" },
    misc_core:            { fr: "Core stabilité", en: "Core stability" },
    misc_cardio:          { fr: "Cardio", en: "Cardio" }
  };

  // ─── Dictionnaire de traduction directe : key = string telle qu'écrite dans le code, value = { fr, en } ───
  // Permet de traduire les chaînes embarquées dans data.js / pathologies.js sans refactorer ces fichiers.
  // Si une clé manque, tr() retourne la chaîne d'origine (fallback safe).
  const D = {
    // ─── Noms de sessions ───
    "PUSH":               { fr: "PUSH",   en: "PUSH" },
    "PULL":               { fr: "PULL",   en: "PULL" },
    "LEGS":               { fr: "LEGS",   en: "LEGS" },
    "CARDIO":             { fr: "CARDIO", en: "CARDIO" },
    "CUSTOM":             { fr: "CUSTOM", en: "CUSTOM" },

    // ─── Phases (depuis data.js) ───
    "Force":              { fr: "Force",         en: "Strength" },
    "Hypertrophie":       { fr: "Hypertrophie",  en: "Hypertrophy" },
    "Deload":             { fr: "Deload",        en: "Deload" },
    "Charges lourdes":    { fr: "Charges lourdes", en: "Heavy loads" },
    "Volume modéré":      { fr: "Volume modéré",   en: "Moderate volume" },
    "Récupération":       { fr: "Récupération",    en: "Recovery" },

    // ─── Pathologies (labels) ───
    "Lombaires (L5-S1)":  { fr: "Lombaires (L5-S1)", en: "Lower back (L5-S1)" },
    "Épaules":            { fr: "Épaules",          en: "Shoulders" },
    "Genoux":             { fr: "Genoux",           en: "Knees" },
    "Poignets":           { fr: "Poignets",         en: "Wrists" },
    "Coudes":             { fr: "Coudes",           en: "Elbows" },
    "Dos":                { fr: "Dos",              en: "Back" },
    "Épaule":             { fr: "Épaule",           en: "Shoulder" },
    "Genou":              { fr: "Genou",            en: "Knee" },
    "Poignet":            { fr: "Poignet",          en: "Wrist" },
    "Coude":              { fr: "Coude",            en: "Elbow" },

    // ─── Catégories Custom WOD ───
    "Full-body":          { fr: "Full-body",        en: "Full-body" },
    "Haut du corps":      { fr: "Haut du corps",    en: "Upper body" },
    "Bas du corps":       { fr: "Bas du corps",     en: "Lower body" },
    "Core stabilité":     { fr: "Core stabilité",   en: "Core stability" },
    "Cardio":             { fr: "Cardio",           en: "Cardio" },

    // ─── Noms de muscles (MN dict dans data.js) ───
    "Pectoraux":          { fr: "Pectoraux",     en: "Chest" },
    "Triceps":            { fr: "Triceps",       en: "Triceps" },
    "Dos":                { fr: "Dos",           en: "Back" },
    "Biceps":             { fr: "Biceps",        en: "Biceps" },
    "Quadriceps":         { fr: "Quadriceps",    en: "Quadriceps" },
    "Ischio-jambiers":    { fr: "Ischio-jambiers", en: "Hamstrings" },
    "Mollets":            { fr: "Mollets",       en: "Calves" },
    "Core":               { fr: "Core",          en: "Core" },
    "Fessiers":           { fr: "Fessiers",      en: "Glutes" },
    "Cardio":             { fr: "Cardio",        en: "Cardio" },
    "Bras":               { fr: "Bras",          en: "Arms" },
    "Full body":          { fr: "Full body",     en: "Full body" },
    "Lombaires":          { fr: "Lombaires",     en: "Lower back" },
    "Full-body":          { fr: "Full-body",     en: "Full-body" },
    "Haut du corps":      { fr: "Haut du corps", en: "Upper body" },
    "Bas du corps":       { fr: "Bas du corps",  en: "Lower body" },
    "Autre":              { fr: "Autre",         en: "Other" },

    // ─── Noms d'exercices (PROG principal) ───
    // FR mode → traduction française des noms anglais
    // EN mode → garde le nom anglais d'origine
    "Bench Press":             { fr: "Développé couché",          en: "Bench Press" },
    "OHP Debout":              { fr: "Développé militaire debout", en: "Standing OHP" },
    "Incline DB Press":        { fr: "Développé incliné haltères", en: "Incline DB Press" },
    "Cable Fly":               { fr: "Écarté à la poulie",        en: "Cable Fly" },
    "Dips Poitrine":           { fr: "Dips poitrine",             en: "Chest Dips" },
    "Lateral Raises":          { fr: "Élévations latérales",      en: "Lateral Raises" },
    "Arnold Press":            { fr: "Arnold Press",              en: "Arnold Press" },
    "Cable Lateral Raise":     { fr: "Élévations latérales poulie", en: "Cable Lateral Raise" },
    "Triceps Pushdown":        { fr: "Extensions triceps poulie", en: "Triceps Pushdown" },
    "Skull Crushers":          { fr: "Barre au front",            en: "Skull Crushers" },
    "OH Triceps Ext.":         { fr: "Extensions triceps au-dessus", en: "OH Triceps Ext." },
    "Triceps Dips":            { fr: "Dips triceps",              en: "Triceps Dips" },
    "Pull-ups":                { fr: "Tractions",                 en: "Pull-ups" },
    "Bench DB Row":            { fr: "Rowing haltère au banc",    en: "Bench DB Row" },
    "T-Bar Row":               { fr: "Rowing T-Bar",              en: "T-Bar Row" },
    "Cable Row":               { fr: "Rowing à la poulie",        en: "Cable Row" },
    "Chest-Supported Row":     { fr: "Rowing buste appuyé",       en: "Chest-Supported Row" },
    "Face Pulls":              { fr: "Face Pulls",                en: "Face Pulls" },
    "Barbell Curls":           { fr: "Curl à la barre",           en: "Barbell Curls" },
    "Preacher Curl":           { fr: "Curl pupitre",              en: "Preacher Curl" },
    "Hammer Curls":            { fr: "Curl marteau",              en: "Hammer Curls" },
    "Back Squat":              { fr: "Squat à la barre (dos)",    en: "Back Squat" },
    "Romanian DL":             { fr: "Soulevé de terre roumain",  en: "Romanian DL" },
    "Bulgarian Split Squat":   { fr: "Squat bulgare",             en: "Bulgarian Split Squat" },
    "Lunges":                  { fr: "Fentes",                    en: "Lunges" },
    "Step-ups":                { fr: "Montées sur banc",          en: "Step-ups" },
    "Goblet Squat":            { fr: "Goblet Squat",              en: "Goblet Squat" },
    "Leg Curl":                { fr: "Leg Curl",                  en: "Leg Curl" },
    "Nordic Curl":             { fr: "Nordic Curl",               en: "Nordic Curl" },
    "Calf Raises":             { fr: "Mollets debout",            en: "Calf Raises" },
    "Farmer's Walk":           { fr: "Marche du fermier",         en: "Farmer's Walk" },
    "Ab Wheel":                { fr: "Roue abdominale",           en: "Ab Wheel" },
    "Plank":                   { fr: "Gainage planche",           en: "Plank" },

    // Labels de pools (PROG)
    "Poitrine acc.":           { fr: "Poitrine acc.",  en: "Chest acc." },
    "Épaules acc.":            { fr: "Épaules acc.",   en: "Shoulders acc." },
    "Triceps A":               { fr: "Triceps A",      en: "Triceps A" },
    "Triceps B":               { fr: "Triceps B",      en: "Triceps B" },
    "Dos acc.":                { fr: "Dos acc.",       en: "Back acc." },
    "Quad uni":                { fr: "Quad uni.",      en: "Quad uni." },
    "Ischio":                  { fr: "Ischio",         en: "Hamstrings" },

    // ─── v8.45 : Exos custom_exercises catalog (canonique EN → display FR) ───
    "DB Bench Press":             { fr: "Développé couché haltères", en: "DB Bench Press" },
    "Incline DB Press":           { fr: "Développé incliné haltères", en: "Incline DB Press" },
    "Incline Bench Press":        { fr: "Développé incliné barre", en: "Incline Bench Press" },
    "Chest Press Machine":        { fr: "Développé machine", en: "Chest Press Machine" },
    "Pec Deck Fly":               { fr: "Pec deck (butterfly)", en: "Pec Deck Fly" },
    "Cable Crossover Fly":        { fr: "Écarté poulies (crossover)", en: "Cable Crossover Fly" },
    "Bodyweight Dips":            { fr: "Dips poids du corps", en: "Bodyweight Dips" },
    "Push-ups":                   { fr: "Pompes (push-ups)", en: "Push-ups" },
    "Lat Pulldown":               { fr: "Tirage vertical", en: "Lat Pulldown" },
    "Seated Cable Row":           { fr: "Tirage horizontal assis", en: "Seated Cable Row" },
    "Barbell Row":                { fr: "Rowing barre buste penché", en: "Barbell Row" },
    "One-arm DB Row":             { fr: "Rowing haltère un bras", en: "One-arm DB Row" },
    "Band Pull-Aparts":           { fr: "Band Pull-Aparts", en: "Band Pull-Aparts" },
    "Back Extension":             { fr: "Extension lombaire", en: "Back Extension" },
    "Standing OHP":               { fr: "OHP debout barre", en: "Standing OHP" },
    "DB Shoulder Press":          { fr: "Développé épaules haltères", en: "DB Shoulder Press" },
    "Shoulder Press Machine":     { fr: "Développé épaules machine", en: "Shoulder Press Machine" },
    "DB Lateral Raises":          { fr: "Élévations latérales haltères", en: "DB Lateral Raises" },
    "Lateral Raise Machine":      { fr: "Élévations latérales machine", en: "Lateral Raise Machine" },
    "Rear Delt Fly":              { fr: "Oiseau (rear delt fly)", en: "Rear Delt Fly" },
    "Barbell Curl":               { fr: "Curl barre", en: "Barbell Curl" },
    "DB Curl":                    { fr: "Curl haltères", en: "DB Curl" },
    "Hammer Curl":                { fr: "Hammer Curl", en: "Hammer Curl" },
    "Preacher Curl":              { fr: "Larry Scott (preacher curl)", en: "Preacher Curl" },
    "Cable Curl":                 { fr: "Curl poulie basse", en: "Cable Curl" },
    "Tricep Pushdown":            { fr: "Pushdown poulie", en: "Tricep Pushdown" },
    "Overhead Tricep Extension":  { fr: "Extension triceps verticale", en: "Overhead Tricep Extension" },
    "Front Squat":                { fr: "Front Squat", en: "Front Squat" },
    "Hack Squat":                 { fr: "Hack Squat", en: "Hack Squat" },
    "Leg Extension":              { fr: "Leg Extension", en: "Leg Extension" },
    "Bulgarian Split Squat":      { fr: "Bulgarian Split Squat", en: "Bulgarian Split Squat" },
    "DB Lunges":                  { fr: "Fentes haltères", en: "DB Lunges" },
    "Hip Thrust":                 { fr: "Hip Thrust", en: "Hip Thrust" },
    "Barbell Hip Thrust":         { fr: "Hip Thrust barre", en: "Barbell Hip Thrust" },
    "DB Romanian DL":             { fr: "Romanian DL haltères", en: "DB Romanian DL" },
    "Lying Leg Curl":             { fr: "Leg Curl allongé", en: "Lying Leg Curl" },
    "Seated Leg Curl":            { fr: "Leg Curl assis", en: "Seated Leg Curl" },
    "Glute Ham Raise":            { fr: "Glute Ham Raise", en: "Glute Ham Raise" },
    "Nordic Curl":                { fr: "Nordic Curl", en: "Nordic Curl" },
    "Standing Calf Raise":        { fr: "Mollets debout machine", en: "Standing Calf Raise" },
    "DB Calf Raise":              { fr: "Mollets haltères", en: "DB Calf Raise" },
    "Side Plank":                 { fr: "Planche latérale", en: "Side Plank" },
    "Bird Dog":                   { fr: "Bird Dog", en: "Bird Dog" },
    "Dead Bug":                   { fr: "Dead Bug", en: "Dead Bug" },
    "Pallof Press":               { fr: "Pallof Press", en: "Pallof Press" },
    "Suitcase Carry":             { fr: "Suitcase Carry", en: "Suitcase Carry" },
    "Captain's Chair Leg Raises": { fr: "Leg Raises chaise romaine", en: "Captain's Chair Leg Raises" },
    "Box Jumps":                  { fr: "Box Jumps", en: "Box Jumps" },
    "Broad Jumps":                { fr: "Saut en longueur", en: "Broad Jumps" },
    "Counter-Movement Jumps":     { fr: "Counter-Movement Jumps", en: "Counter-Movement Jumps" },
    "Kettlebell Swings":          { fr: "Kettlebell Swings", en: "Kettlebell Swings" },
    "Med Ball Slams":             { fr: "Med Ball Slams", en: "Med Ball Slams" },
    "Med Ball Throws":            { fr: "Med Ball Throws", en: "Med Ball Throws" },
    "Power Clean":                { fr: "Power Clean", en: "Power Clean" },
    "Push Press":                 { fr: "Push Press", en: "Push Press" },
    "Battle Ropes":               { fr: "Battle Ropes", en: "Battle Ropes" },
    "Sled Push":                  { fr: "Sled Push", en: "Sled Push" },
    "Treadmill run":              { fr: "Tapis de course", en: "Treadmill run" },
    "Rower (Concept2)":           { fr: "Rameur Concept2", en: "Rower (Concept2)" },
    "Assault bike":               { fr: "Assault bike", en: "Assault bike" },
    "Ski erg":                    { fr: "Ski erg", en: "Ski erg" },
    "Elliptical":                 { fr: "Vélo elliptique", en: "Elliptical" },
    "Stair master":               { fr: "Stair master", en: "Stair master" },
    "Swimming":                   { fr: "Natation", en: "Swimming" },
    "Stationary bike":            { fr: "Vélo classique", en: "Stationary bike" },
    "Jump rope":                  { fr: "Corde à sauter", en: "Jump rope" },
    "ATG Split Squat":            { fr: "ATG Split Squat", en: "ATG Split Squat" },
    "Tibialis Raises":            { fr: "Tibialis Raises", en: "Tibialis Raises" },
    "Cobra stretch":              { fr: "Cobra (extension dorsale)", en: "Cobra stretch" },
    "Wall Slides":                { fr: "Wall Slides", en: "Wall Slides" },
    "Thoracic Extension":         { fr: "Extension thoracique (foam roller)", en: "Thoracic Extension" },
    "Shoulder CARs":              { fr: "CARs épaules", en: "Shoulder CARs" },

    // ─── Noms d'achievements (FR → EN) ───
    "Premier pas":             { fr: "Premier pas",            en: "First step" },
    "Régulier":                { fr: "Régulier",               en: "Regular" },
    "Discipliné":              { fr: "Discipliné",             en: "Disciplined" },
    "Centurion":               { fr: "Centurion",              en: "Centurion" },
    "3 jours d'affilée":       { fr: "3 jours d'affilée",      en: "3 days in a row" },
    "Une semaine pleine":      { fr: "Une semaine pleine",     en: "Full week" },
    "Cycle PPL complet":       { fr: "Cycle PPL complet",      en: "Full PPL cycle" },
    "Touche-à-tout":           { fr: "Touche-à-tout",          en: "Jack of all trades" },
    "Anatomie complète":       { fr: "Anatomie complète",      en: "Full anatomy" },
    "Premier PR":              { fr: "Premier PR",             en: "First PR" },
    "Bench Press 80 kg":       { fr: "Bench Press 80 kg",      en: "Bench Press 80 kg" },
    "Back Squat 100 kg":       { fr: "Back Squat 100 kg",      en: "Back Squat 100 kg" },
    "Endurance":               { fr: "Endurance",              en: "Endurance" },
    "Core Master":             { fr: "Core Master",            en: "Core Master" },

    // ─── Descriptions d'achievements ───
    "Termine ta 1ère séance":                        { fr: "Termine ta 1ère séance",         en: "Complete your 1st session" },
    "10 séances totales":                            { fr: "10 séances totales",             en: "10 total sessions" },
    "30 séances totales":                            { fr: "30 séances totales",             en: "30 total sessions" },
    "100 séances — sacré niveau":                    { fr: "100 séances — sacré niveau",     en: "100 sessions — impressive" },
    "3 jours consécutifs avec séance":               { fr: "3 jours consécutifs avec séance", en: "3 consecutive days with a session" },
    "7 jours consécutifs":                           { fr: "7 jours consécutifs",            en: "7 consecutive days" },
    "Push + Pull + Legs au moins 1 fois":            { fr: "Push + Pull + Legs au moins 1 fois", en: "Push + Pull + Legs at least once" },
    "Une séance de chaque type (PPL + Cardio + Core)":{ fr: "Une séance de chaque type (PPL + Cardio + Core)", en: "One session of each type (PPL + Cardio + Core)" },
    "Tous les muscles entraînés en 30j":             { fr: "Tous les muscles entraînés en 30j", en: "All muscles trained in 30d" },
    "Premier record enregistré":                     { fr: "Premier record enregistré",      en: "First PR logged" },
    "1RM estimé Bench Press ≥ 80 kg":                { fr: "1RM estimé Bench Press ≥ 80 kg", en: "Estimated 1RM Bench Press ≥ 80 kg" },
    "1RM estimé Back Squat ≥ 100 kg":                { fr: "1RM estimé Back Squat ≥ 100 kg", en: "Estimated 1RM Back Squat ≥ 100 kg" },
    "10 séances cardio totales":                     { fr: "10 séances cardio totales",      en: "10 total cardio sessions" },
    "Programme Core Heavy 12 semaines terminé":      { fr: "Programme Core Heavy 12 semaines terminé", en: "12-week Core Heavy program completed" },

    // ─── Descriptions de WOD ───
    "Pectoraux + épaules + abdo en endurance cardio. 8 min pour bien transpirer.": { fr: "Pectoraux + épaules + abdo en endurance cardio. 8 min pour bien transpirer.", en: "Chest + shoulders + abs cardio endurance. 8 min of good sweat." },
    "Sprint pectoraux + épaules + cardio via burpees. Pur sprint qui te met sur les genoux.": { fr: "Sprint pectoraux + épaules + cardio via burpees. Pur sprint qui te met sur les genoux.", en: "Chest + shoulders + cardio sprint via burpees. Pure sprint that brings you to your knees." },
    "Volume contrôlé pectoraux + hanches en EMOM. Bon travail technique sous fatigue.": { fr: "Volume contrôlé pectoraux + hanches en EMOM. Bon travail technique sous fatigue.", en: "Controlled chest + hips volume in EMOM. Good technical work under fatigue." },
    "Pectoraux + triceps en 4 min de pur HIIT. Brûle-graisse express.": { fr: "Pectoraux + triceps en 4 min de pur HIIT. Brûle-graisse express.", en: "Chest + triceps in 4 min of pure HIIT. Express fat-burn." },
    "Full-body push + jambes via Devil's Press. Travail puissance verticale.": { fr: "Full-body push + jambes via Devil's Press. Travail puissance verticale.", en: "Full-body push + legs via Devil's Press. Vertical power work." },
    "Volume épaules + triceps en circuit. Pump sans charge lombaire.": { fr: "Volume épaules + triceps en circuit. Pump sans charge lombaire.", en: "Shoulders + triceps volume circuit. Pump without lumbar load." },
    "Pectoraux + triceps en pyramide descendante. Endurance musculaire pure.": { fr: "Pectoraux + triceps en pyramide descendante. Endurance musculaire pure.", en: "Chest + triceps descending pyramid. Pure muscular endurance." },
    "Isolation épaules : deltoïdes latéraux + Arnold press. Volume pur.": { fr: "Isolation épaules : deltoïdes latéraux + Arnold press. Volume pur.", en: "Shoulder isolation: lateral delts + Arnold press. Pure volume." },
    "Dos en volume contrôlé, rows et tirages. Bon pour la posture.": { fr: "Dos en volume contrôlé, rows et tirages. Bon pour la posture.", en: "Controlled back volume, rows and pulldowns. Good for posture." },
    "Dos + cardio en circuit dense. Force-endurance corps entier.": { fr: "Dos + cardio en circuit dense. Force-endurance corps entier.", en: "Back + cardio dense circuit. Full-body strength-endurance." },
    "Dos haut + posture par renegade rows et dead bugs. Anti-rotation.": { fr: "Dos haut + posture par renegade rows et dead bugs. Anti-rotation.", en: "Upper back + posture via renegade rows and dead bugs. Anti-rotation." },
    "Dos en 4 min HIIT. Inverted rows à haute fréquence.": { fr: "Dos en 4 min HIIT. Inverted rows à haute fréquence.", en: "Back in 4 min HIIT. High-frequency inverted rows." },
    "Dos + biceps + cardio low-impact (200m run). Volume + cœur.": { fr: "Dos + biceps + cardio low-impact (200m run). Volume + cœur.", en: "Back + biceps + low-impact cardio (200m run). Volume + heart." },
    "Dos large : pull-ups, rows, band pull-aparts. Travail postural.": { fr: "Dos large : pull-ups, rows, band pull-aparts. Travail postural.", en: "Wide back: pull-ups, rows, band pull-aparts. Postural work." },
    "Biceps + dos via pyramide hammer curls et inverted rows.": { fr: "Biceps + dos via pyramide hammer curls et inverted rows.", en: "Biceps + back via hammer curls and inverted rows pyramid." },
    "Dos + scapula en EMOM. Inverted rows + face pulls. Anti-protraction épaules.": { fr: "Dos + scapula en EMOM. Inverted rows + face pulls. Anti-protraction épaules.", en: "Back + scapula EMOM. Inverted rows + face pulls. Anti-shoulder protraction." },
    "Jambes + cardio plein gaz. Burpees, swings, squats en pyramide.": { fr: "Jambes + cardio plein gaz. Burpees, swings, squats en pyramide.", en: "Legs + cardio full throttle. Burpees, swings, pyramid squats." },
    "Volume cuisses + fessiers + ischios. Hypertrophie sans charge lombaire.": { fr: "Volume cuisses + fessiers + ischios. Hypertrophie sans charge lombaire.", en: "Quads + glutes + hamstrings volume. Hypertrophy without lumbar load." },
    "Cuisses + fessiers en EMOM. Unilatéral et bilatéral mixés.": { fr: "Cuisses + fessiers en EMOM. Unilatéral et bilatéral mixés.", en: "Quads + glutes EMOM. Unilateral and bilateral mixed." },
    "Quadriceps en feu. Wall balls + lunges + broad jumps explosifs.": { fr: "Quadriceps en feu. Wall balls + lunges + broad jumps explosifs.", en: "Quads on fire. Wall balls + lunges + explosive broad jumps." },
    "Cuisses + fessiers en 4 min HIIT alternés. Pur métabolique.": { fr: "Cuisses + fessiers en 4 min HIIT alternés. Pur métabolique.", en: "Quads + glutes alternating 4-min HIIT. Pure metabolic." },
    "Volume jambes en pyramide montée puis descente. Endurance musculaire.": { fr: "Volume jambes en pyramide montée puis descente. Endurance musculaire.", en: "Legs volume pyramid up then down. Muscular endurance." },
    "Ischios + fessiers via KB DL (dos neutre) et glute bridges. Posture.": { fr: "Ischios + fessiers via KB DL (dos neutre) et glute bridges. Posture.", en: "Hamstrings + glutes via KB DL (neutral back) and glute bridges. Posture." },
    "Jambes + abdo + cardio via step-ups, swings, flutter kicks. 8 min punch.": { fr: "Jambes + abdo + cardio via step-ups, swings, flutter kicks. 8 min punch.", en: "Legs + abs + cardio via step-ups, swings, flutter kicks. 8-min punch." },
    "Brûle un max de calories en 8 min : cœur, jambes, épaules. Step-back uniquement, zéro charge sur la colonne.": { fr: "Brûle un max de calories en 8 min : cœur, jambes, épaules. Step-back uniquement, zéro charge sur la colonne.", en: "Burn max calories in 8 min: heart, legs, shoulders. Step-back only, zero spinal load." },
    "Le classique CrossFit DT en version dos sécurisée. Force-endurance corps entier en 12-18 min.": { fr: "Le classique CrossFit DT en version dos sécurisée. Force-endurance corps entier en 12-18 min.", en: "The CrossFit DT classic in back-safe version. Full-body strength-endurance in 12-18 min." },
    "Référence mondiale CrossFit. Endurance musculaire pure, accessible à tous niveaux.": { fr: "Référence mondiale CrossFit. Endurance musculaire pure, accessible à tous niveaux.", en: "CrossFit world benchmark. Pure muscular endurance, accessible to all levels." },
    "Cardio + force totale en 12 min. Travaille épaules, hanches, abdo en gainage.": { fr: "Cardio + force totale en 12 min. Travaille épaules, hanches, abdo en gainage.", en: "Cardio + total strength in 12 min. Works shoulders, hips, abs in bracing." },
    "Sprint cardio-musculaire intense. Te met sur les genoux en 10-15 min, full-body brûle-graisse.": { fr: "Sprint cardio-musculaire intense. Te met sur les genoux en 10-15 min, full-body brûle-graisse.", en: "Intense cardio-muscle sprint. Drops you in 10-15 min, full-body fat-burner." },
    "Brûle-graisse rapide. 8 min = équivalent métabolique de 30-40 min de cardio classique.": { fr: "Brûle-graisse rapide. 8 min = équivalent métabolique de 30-40 min de cardio classique.", en: "Quick fat-burn. 8 min = metabolic equivalent of 30-40 min classic cardio." },
    "Pectoraux + dos en alternance. Volume max sur le haut du corps sans fatiguer les jambes.": { fr: "Pectoraux + dos en alternance. Volume max sur le haut du corps sans fatiguer les jambes.", en: "Chest + back alternating. Max upper-body volume without tiring legs." },
    "Sculpte les épaules sous trois angles en 8 min. Aucun mouvement debout, dos protégé.": { fr: "Sculpte les épaules sous trois angles en 8 min. Aucun mouvement debout, dos protégé.", en: "Sculpt shoulders from three angles in 8 min. No standing movements, back protected." },
    "Dos large + posture. Volume de tirage : 50 pull-ups + 100 pull-aparts. Évite le doublon avec le Pull Power EMOM.": { fr: "Dos large + posture. Volume de tirage : 50 pull-ups + 100 pull-aparts. Évite le doublon avec le Pull Power EMOM.", en: "Wide back + posture. Pulling volume: 50 pull-ups + 100 pull-aparts. Avoids overlap with Pull Power EMOM." },
    "Biceps + triceps en superset. 12 min pour des bras bien gonflés, sans charge lombaire.": { fr: "Biceps + triceps en superset. 12 min pour des bras bien gonflés, sans charge lombaire.", en: "Biceps + triceps superset. 12 min for fully-pumped arms, no lumbar load." },
    "Cuisses + fessiers + ischios. Tout le bas du corps sans aucune flexion lombaire chargée.": { fr: "Cuisses + fessiers + ischios. Tout le bas du corps sans aucune flexion lombaire chargée.", en: "Quads + glutes + hamstrings. Full lower body with zero loaded lumbar flexion." },
    "Fessiers explosifs. Améliore aussi la posture et protège le bas du dos.": { fr: "Fessiers explosifs. Améliore aussi la posture et protège le bas du dos.", en: "Explosive glutes. Also improves posture and protects lower back." },
    "Cuisses en feu. 4 min de pur travail des quadriceps en haute intensité.": { fr: "Cuisses en feu. 4 min de pur travail des quadriceps en haute intensité.", en: "Quads on fire. 4 min of pure high-intensity quad work." },
    "Force des jambes + gainage debout. Travaille aussi les avant-bras (grip) et la posture.": { fr: "Force des jambes + gainage debout. Travaille aussi les avant-bras (grip) et la posture.", en: "Leg strength + standing bracing. Also works forearms (grip) and posture." },
    "Renforce le dos sans flexion. Protocole McGill validé scientifiquement pour les hernies lombaires.": { fr: "Renforce le dos sans flexion. Protocole McGill validé scientifiquement pour les hernies lombaires.", en: "Strengthens back without flexion. McGill protocol scientifically validated for lumbar hernias." },
    "Stabilité du tronc latérale et anti-rotation. Idéal hernie lombaire et posture quotidienne.": { fr: "Stabilité du tronc latérale et anti-rotation. Idéal hernie lombaire et posture quotidienne.", en: "Lateral trunk stability and anti-rotation. Ideal for lumbar hernia and daily posture." },
    "Gainage pur. Renforce le caisson abdominal sans charger la colonne ni faire de flexion.": { fr: "Gainage pur. Renforce le caisson abdominal sans charger la colonne ni faire de flexion.", en: "Pure bracing. Strengthens abdominal box without spinal load or flexion." },
    "10 min HIIT cardio pur. Plus efficace que 45 min de jogging stable pour brûler du gras.": { fr: "10 min HIIT cardio pur. Plus efficace que 45 min de jogging stable pour brûler du gras.", en: "10 min pure HIIT cardio. More effective than 45 min steady jog for burning fat." },
    "Cardio puissance sans impact articulaire. Améliore la VO2max, idéal protection du dos.": { fr: "Cardio puissance sans impact articulaire. Améliore la VO2max, idéal protection du dos.", en: "Power cardio without joint impact. Improves VO2max, ideal for back protection." },
    "Cardio + coordination + jambes. 10 min pour brûler 150-200 kcal, low-impact contrôlé.": { fr: "Cardio + coordination + jambes. 10 min pour brûler 150-200 kcal, low-impact contrôlé.", en: "Cardio + coordination + legs. 10 min to burn 150-200 kcal, controlled low-impact." },

    // ─── Messages de pathologie (pathologies.js EXERCISE_RISKS.msg) ───
    "Coudes à 45° max (pas 90°). Omoplates rétractées et plaquées au banc. Si impingement → préfère le DB bench press, plus tolérant.": { fr: "Coudes à 45° max (pas 90°). Omoplates rétractées et plaquées au banc. Si impingement → préfère le DB bench press, plus tolérant.", en: "Elbows at 45° max (not 90°). Scapulae retracted and pinned to bench. If impingement → prefer DB bench press, more tolerant." },
    "Barre dans la base de la paume (pas les doigts). Bracelets de force si poignets douloureux.": { fr: "Barre dans la base de la paume (pas les doigts). Bracelets de force si poignets douloureux.", en: "Bar in the palm base (not fingers). Wrist wraps if wrists hurt." },
    "Mouvement à risque pour les épaules : impingement fréquent avec la barre. Préfère le DB OHP (paumes neutres) ou le Landmine Press.": { fr: "Mouvement à risque pour les épaules : impingement fréquent avec la barre. Préfère le DB OHP (paumes neutres) ou le Landmine Press.", en: "Risky for shoulders: frequent impingement with the bar. Prefer DB OHP (neutral palms) or Landmine Press." },
    "Pas de cambrure lombaire compensatoire — abdos et fessiers serrés. Si dos faible → assis avec dossier (Seated DB Press).": { fr: "Pas de cambrure lombaire compensatoire — abdos et fessiers serrés. Si dos faible → assis avec dossier (Seated DB Press).", en: "No compensatory lumbar arch — abs and glutes squeezed. If weak back → seated with back support (Seated DB Press)." },
    "Banc à 30° (pas 45° ou plus = stress acromion). Pause 1s à mi-course pour contrôle.": { fr: "Banc à 30° (pas 45° ou plus = stress acromion). Pause 1s à mi-course pour contrôle.", en: "Bench at 30° (not 45° or more = acromion stress). 1s pause mid-rep for control." },
    "Très risqué pour la coiffe des rotateurs. À éviter si épaules sensibles. Alt : DB Bench Press incliné.": { fr: "Très risqué pour la coiffe des rotateurs. À éviter si épaules sensibles. Alt : DB Bench Press incliné.", en: "Very risky for rotator cuff. Avoid if sensitive shoulders. Alt: incline DB Bench Press." },
    "Poignets en hyperextension sous charge. Si gêne → utilise des barres parallèles épaisses.": { fr: "Poignets en hyperextension sous charge. Si gêne → utilise des barres parallèles épaisses.", en: "Wrists in hyperextension under load. If discomfort → use thick parallel bars." },
    "Coudes ne doivent pas remonter au-dessus des épaules. Stop avant si claquement / douleur.": { fr: "Coudes ne doivent pas remonter au-dessus des épaules. Stop avant si claquement / douleur.", en: "Elbows must not rise above shoulders. Stop before if popping / pain." },
    "Forte tension sur les tendons. Évite si tendinite. Alt : Cable Pushdown (plus doux).": { fr: "Forte tension sur les tendons. Évite si tendinite. Alt : Cable Pushdown (plus doux).", en: "Heavy tendon tension. Avoid if tendinitis. Alt: Cable Pushdown (gentler)." },
    "Ne dépasse pas la hauteur des épaules. Pouce légèrement vers le haut (anti-impingement).": { fr: "Ne dépasse pas la hauteur des épaules. Pouce légèrement vers le haut (anti-impingement).", en: "Don't exceed shoulder height. Thumb slightly up (anti-impingement)." },
    "Rotation sous charge en position vulnérable. Alt si épaules sensibles : Neutral DB Press (paumes face-à-face).": { fr: "Rotation sous charge en position vulnérable. Alt si épaules sensibles : Neutral DB Press (paumes face-à-face).", en: "Rotation under load in vulnerable position. Alt if sensitive shoulders: Neutral DB Press (palms facing)." },
    "Stress maximal sur les tendons du triceps. Si tendinite → swap pour OH Triceps Extension (plus tolérant).": { fr: "Stress maximal sur les tendons du triceps. Si tendinite → swap pour OH Triceps Extension (plus tolérant).", en: "Maximum stress on triceps tendons. If tendinitis → swap for OH Triceps Extension (more tolerant)." },
    "Mobilité épaule requise. Si raideur → fais-le assis avec dossier.": { fr: "Mobilité épaule requise. Si raideur → fais-le assis avec dossier.", en: "Shoulder mobility required. If stiffness → do it seated with back support." },
    "Excentrique lent 3s pour ménager les tendons.": { fr: "Excentrique lent 3s pour ménager les tendons.", en: "Slow 3s eccentric to spare tendons." },
    "Coudes COLLÉS au tronc (pas devant). Si tendinite : préfère une corde plutôt que la barre.": { fr: "Coudes COLLÉS au tronc (pas devant). Si tendinite : préfère une corde plutôt que la barre.", en: "Elbows GLUED to torso (not forward). If tendinitis: prefer rope over bar." },
    "Démarre avec les omoplates rétractées (scapular pull-up). Ne descends pas en hyperextension passive si épaules fragiles.": { fr: "Démarre avec les omoplates rétractées (scapular pull-up). Ne descends pas en hyperextension passive si épaules fragiles.", en: "Start with retracted scapulae (scapular pull-up). Don't drop into passive hyperextension if fragile shoulders." },
    "Coudes en supination = stress biceps. Alt si tendinite : Chin-ups prise neutre (paumes face-à-face).": { fr: "Coudes en supination = stress biceps. Alt si tendinite : Chin-ups prise neutre (paumes face-à-face).", en: "Supinated elbows = biceps stress. Alt if tendinitis: neutral-grip chin-ups (palms facing)." },
    "Banc indispensable. JAMAIS de version bent-over libre sans support.": { fr: "Banc indispensable. JAMAIS de version bent-over libre sans support.", en: "Bench essential. NEVER free bent-over version without support." },
    "Position penchée + charge lourde = très à risque. Alt : Chest-Supported Row (banc incliné).": { fr: "Position penchée + charge lourde = très à risque. Alt : Chest-Supported Row (banc incliné).", en: "Bent position + heavy load = very risky. Alt: Chest-Supported Row (incline bench)." },
    "Dos NEUTRE. Ne fléchis pas le tronc à la fin du mouvement (cherche pas à 'tirer plus loin').": { fr: "Dos NEUTRE. Ne fléchis pas le tronc à la fin du mouvement (cherche pas à 'tirer plus loin').", en: "NEUTRAL back. Don't flex torso at end of movement (don't try to 'pull further')." },
    "Barre droite = stress poignet/coude. Préfère la barre EZ. Excentrique 3s.": { fr: "Barre droite = stress poignet/coude. Préfère la barre EZ. Excentrique 3s.", en: "Straight bar = wrist/elbow stress. Prefer EZ bar. 3s eccentric." },
    "Barre EZ obligatoire si tendinite poignet.": { fr: "Barre EZ obligatoire si tendinite poignet.", en: "EZ bar mandatory if wrist tendinitis." },
    "Isolation totale = stress max sur les tendons. Stop avant la pleine extension si tendinite.": { fr: "Isolation totale = stress max sur les tendons. Stop avant la pleine extension si tendinite.", en: "Total isolation = max stress on tendons. Stop before full extension if tendinitis." },
    "CEINTURE OBLIGATOIRE. Dos neutre, abdos durs (Valsalva). Stop si douleur lombaire pendant ou après.": { fr: "CEINTURE OBLIGATOIRE. Dos neutre, abdos durs (Valsalva). Stop si douleur lombaire pendant ou après.", en: "BELT MANDATORY. Neutral back, hard abs (Valsalva). Stop if lumbar pain during or after." },
    "Genoux suivent les orteils (légèrement vers l'extérieur). Profondeur à adapter selon morpho (parallèle suffit). Échauffe avec Goblet Squat léger.": { fr: "Genoux suivent les orteils (légèrement vers l'extérieur). Profondeur à adapter selon morpho (parallèle suffit). Échauffe avec Goblet Squat léger.", en: "Knees track toes (slightly outward). Adjust depth to your build (parallel suffices). Warm up with light Goblet Squat." },
    "TRÈS RISQUÉ si L5-S1 instable. Dos STRICTEMENT neutre, charnière hanche pure, amplitude réduite. Stop si moindre douleur. Alt : KB Deadlift.": { fr: "TRÈS RISQUÉ si L5-S1 instable. Dos STRICTEMENT neutre, charnière hanche pure, amplitude réduite. Stop si moindre douleur. Alt : KB Deadlift.", en: "VERY RISKY if L5-S1 unstable. STRICTLY neutral back, pure hip hinge, reduced range. Stop at slightest pain. Alt: KB Deadlift." },
    "Genou avant ne dépasse pas le pied (sauf si morpho fémur long). Pied arrière surélevé pas trop haut (30 cm max). Stop si douleur rotule.": { fr: "Genou avant ne dépasse pas le pied (sauf si morpho fémur long). Pied arrière surélevé pas trop haut (30 cm max). Stop si douleur rotule.", en: "Front knee doesn't pass foot (unless long femur). Rear foot not too high (30 cm max). Stop if patella pain." },
    "Tronc droit, pas penché en avant. Si lombaires faibles → version DB plutôt que barbell.": { fr: "Tronc droit, pas penché en avant. Si lombaires faibles → version DB plutôt que barbell.", en: "Torso upright, not leaning forward. If weak lower back → DB version instead of barbell." },
    "Genou avant à 90°, ne dépasse pas le pied. Pas long. Si rotule sensible → préfère les Reverse Lunges (moins de cisaillement).": { fr: "Genou avant à 90°, ne dépasse pas le pied. Pas long. Si rotule sensible → préfère les Reverse Lunges (moins de cisaillement).", en: "Front knee at 90°, doesn't pass foot. Long step. If patella sensitive → prefer Reverse Lunges (less shear)." },
    "Pousse sur le talon (pas la pointe). Hauteur du banc adaptée — ne force pas la flexion.": { fr: "Pousse sur le talon (pas la pointe). Hauteur du banc adaptée — ne force pas la flexion.", en: "Push through heel (not toe). Bench height adapted — don't force flexion." },
    "Si douleur derrière le genou (popliteus) → réduit l'amplitude. Pause 1s en fin de contraction (pas de claquement).": { fr: "Si douleur derrière le genou (popliteus) → réduit l'amplitude. Pause 1s en fin de contraction (pas de claquement).", en: "If pain behind knee (popliteus) → reduce range. 1s pause at end of contraction (no snapping)." },
    "Mouvement très exigeant. Si débutant : retiens-toi avec les mains les 80% du chemin. Stop immédiat si crampe.": { fr: "Mouvement très exigeant. Si débutant : retiens-toi avec les mains les 80% du chemin. Stop immédiat si crampe.", en: "Very demanding movement. If beginner: support with hands 80% of the way. Stop immediately if cramp." },
    "Posture verticale stricte, épaules basses, abdos durs. Si lombaires : commence léger (50% du poids de corps total).": { fr: "Posture verticale stricte, épaules basses, abdos durs. Si lombaires : commence léger (50% du poids de corps total).", en: "Strict vertical posture, low shoulders, hard abs. If lumbar issues: start light (50% of bodyweight total)." },
    "Si tu peux pas tenir 30m → trop lourd. N'utilise pas de straps si poignets douloureux.": { fr: "Si tu peux pas tenir 30m → trop lourd. N'utilise pas de straps si poignets douloureux.", en: "If you can't hold 30m → too heavy. Don't use straps if wrists hurt." },
    "TRÈS risqué pour L5-S1. Le rollout charge les disques en flexion + extension brutale. Alt : Dead Bug (sécurité).": { fr: "TRÈS risqué pour L5-S1. Le rollout charge les disques en flexion + extension brutale. Alt : Dead Bug (sécurité).", en: "VERY risky for L5-S1. Rollout loads discs in flexion + sharp extension. Alt: Dead Bug (safer)." },
    "Sur les coudes (forearm plank) si poignets douloureux. Hanches pas trop hautes ni basses.": { fr: "Sur les coudes (forearm plank) si poignets douloureux. Hanches pas trop hautes ni basses.", en: "On forearms (forearm plank) if wrists hurt. Hips not too high or low." }
  };

  // ─── Helpers exportés ───
  function t(key, vars){
    const entry = UI[key];
    let s = entry ? (entry[_lang] || entry.fr) : key;
    if(vars){
      Object.keys(vars).forEach(k => { s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]); });
    }
    return s;
  }
  function tr(src){
    if(!src) return src;
    const entry = D[src];
    if(!entry) return src;
    return entry[_lang] || src;
  }

  // Helper pour les objets {fr, en} (utilisé par protocols.js et machines.js)
  // pickLang({fr:"Force", en:"Strength"}) → "Force" ou "Strength" selon la langue
  // Fallback gracieux : si c'est déjà une string, la retourne telle quelle
  function pickLang(obj){
    if(obj == null) return "";
    if(typeof obj === "string") return obj;
    return obj[_lang] || obj.fr || obj.en || String(obj);
  }

  // Expose globalement
  window.LANG = { t, tr, setLang, getLang, pickLang };
  // Aliases courts pour usage dans templates
  window.T = t;          // T("nav_home") → "Accueil" / "Home"
  window.tr = tr;        // tr("Bench Press") → "Développé couché" / "Bench Press"
  window.pickLang = pickLang; // pickLang({fr,en}) → string

  // Met à jour <html lang> dès le chargement
  try { document.documentElement.lang = _lang; } catch(e){}
})();

// ===== ESM re-exports of globals exposed by the IIFE above =====
export const LANG = window.LANG;
export const T = window.T;
export const tr = window.tr;
export const pickLang = window.pickLang;
