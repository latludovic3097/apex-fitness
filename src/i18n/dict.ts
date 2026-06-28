// Dictionnaire React-spécifique : couvre les strings UI ajoutées par la migration
// (sections, labels, boutons) qui ne sont pas dans le dict `D` du fichier vanilla.
// Clé = string FR (= source dans le code), valeur = traduction EN.

export const DICT_EN: Record<string, string> = {
  // Header & nav
  "Changer de langue": "Change language",
  "Réglages": "Settings",
  "Accueil": "Home",

  // Home — bannières / streak
  "Première séance ? Lance-toi 💪": "First workout ? Let's go 💪",
  "Mode protection actif —": "Protection mode active —",
  "zone sensible": "sensitive area",
  "zones sensibles": "sensitive areas",
  "🔥 {n} séances cette semaine — en feu !": "🔥 {n} workouts this week — on fire !",
  "🔥 Séance faite aujourd'hui !": "🔥 Workout done today !",
  "Hier encore actif — garde le rythme": "Active yesterday — keep the pace",
  "Dernière séance il y a {n} jours": "Last workout {n} days ago",
  "⚠️ {n} jours sans séance — reprends le rythme": "⚠️ {n} days without a workout — get back on track",
  "🚨 {n} jours d'arrêt — relance-toi maintenant": "🚨 {n} days off — restart now",
  "🚨 {n} jours sans séance — ne lâche pas !": "🚨 {n} days without a workout — don't give up !",
  "Dos neutre, charnière de hanche, McGill Big 3": "Neutral spine, hip hinge, McGill Big 3",
  "Amplitude contrôlée, pas de press derrière nuque": "Controlled range, no behind-the-neck press",
  "Pas de flexion profonde chargée brutale": "No abrupt deep loaded flexion",
  "Prise neutre, évite l'hyperextension": "Neutral grip, avoid hyperextension",
  "Excentriques lents (HSR), évite la surcharge": "Slow eccentrics (HSR), avoid overload",

  // Home — stats
  "Fatigue": "Fatigue",
  "Séances": "Workouts",
  "7 jours": "7 days",

  // Home — weekly plan days
  "Lun": "Mon",
  "Mar": "Tue",
  "Mer": "Wed",
  "Jeu": "Thu",
  "Ven": "Fri",
  "Sam": "Sat",
  "Dim": "Sun",

  // Home — 1RM
  "1RM estimés": "Estimated 1RM",

  // Home — periodization & training section
  "Entraînement": "Training",
  "Programme de base": "Base program",
  "Force": "Strength",
  "Hypertrophie": "Hypertrophy",
  "Deload": "Deload",
  "reps": "reps",

  // Home — reminders
  "Rappels": "Reminders",
  "Rappel d'entraînement": "Workout reminder",
  "Une alerte après 3+ jours sans séance (max 1/24h)": "An alert after 3+ days without a workout (max 1/24h)",
  "Notifications bloquées par le navigateur": "Notifications blocked by browser",

  // Home — recommendation
  "Recommandé aujourd'hui": "Recommended today",
  "Reprise idéale": "Ideal restart",
  "Dernier il y a": "Last one",
  "jamais fait": "never done",
  "Pectoraux, épaules, triceps. Développé et poussées verticales.": "Chest, shoulders, triceps. Press and vertical push.",
  "Dos en volume contrôlé, rows et tirages. Bon pour la posture.": "Back in controlled volume, rows and pulls. Great for posture.",
  "Quadriceps, ischios, fessiers. La base de la force globale.": "Quads, hamstrings, glutes. The foundation of global strength.",

  // Home — PPL
  "Programme PPL": "PPL Program",
  "★ recommandé": "★ recommended",
  "jamais": "never",
  "il y a {n}j": "{n}d ago",

  // Home — weekly plan
  "Planning idéal de la semaine": "Weekly ideal plan",
  "Le planning s'": "The plan ",
  "adapte": "adapts",
  ": séances faites cochées ✓, les restantes placées sur les jours libres.":
    ": completed workouts checked ✓, remaining ones placed on free days.",
  "repos": "rest",

  // Home — tools chips
  "Outils": "Tools",
  "Carte musculaire": "Body map",
  "Plate calculator": "Plate calculator",
  "Programme perso IA": "AI custom program",

  // Home — wellness
  "Wellness": "Wellness",
  "Cardio": "Cardio",
  "Core": "Core",
  "Nutrition": "Nutrition",
  "Course · Nage · Vélo — Z2 / HIIT": "Running · Swimming · Bike — Z2 / HIIT",
  "Programme L5-S1 safe · McGill Big 3": "L5-S1 safe program · McGill Big 3",
  "Calculateur Mifflin · macros": "Mifflin calculator · macros",

  // Custom program
  "Mon programme": "My program",
  "Semaine": "Week",
  "Modifier / régénérer le programme": "Edit / regenerate program",
  "Choisis ta séance": "Choose your session",
  "Séance": "Session",

  // Session / Exercise card
  "Quitter": "Quit",
  "Exercice": "Exercise",
  "séries": "sets",
  "Suivant →": "Next →",
  "WOD →": "WOD →",
  "← Préc.": "← Prev.",
  "✓ Terminer la séance": "✓ Finish workout",
  "Échauffement": "Warm-up",
  "Protocole McGill Big 3 + activation. Prépare le dos et les articulations.":
    "McGill Big 3 protocol + activation. Prepares the back and joints.",
  "RIR — reps en réserve": "RIR — reps in reserve",
  "repos {n}s": "rest {n}s",
  "Adapté": "Adapted",
  "remplace": "replaces",
  "Record perso estimé": "Estimated personal record",
  "DÉPART": "START",
  "FIN": "END",

  // History
  "Historique": "History",
  "Aucune séance encore. Lance ta première séance depuis l'accueil !":
    "No workouts yet. Start your first one from the home screen!",
  "Volume des 12 dernières semaines": "Volume over the last 12 weeks",
  "Tes séances": "Your workouts",
  "Détails": "Details",
  "Masquer": "Hide",
  "Achievements": "Achievements",
  "Partager cette séance": "Share this workout",

  // Nutrition
  "Suivi du poids": "Weight tracking",
  "Pesée du jour": "Today's weigh-in",
  "Évolution sur les": "Evolution over the last",
  "dernières pesées": "weigh-ins",
  "Aucune pesée enregistrée.": "No weigh-in recorded.",
  "Enregistrer": "Save",
  "Supprimer cette pesée ?": "Delete this weigh-in?",
  "Cible journalière": "Daily target",
  "kcal / jour": "kcal / day",
  "Protéines": "Protein",
  "Lipides": "Fat",
  "Glucides": "Carbs",
  "Ton profil": "Your profile",
  "Poids (kg)": "Weight (kg)",
  "Taille (cm)": "Height (cm)",
  "Âge": "Age",
  "Sexe": "Sex",
  "Homme": "Male",
  "Femme": "Female",
  "Niveau d'activité": "Activity level",
  "Sédentaire": "Sedentary",
  "Léger": "Light",
  "Modéré": "Moderate",
  "Intense": "Intense",
  "Athlète": "Athlete",
  "Objectif": "Goal",
  "Sèche -500": "Cut -500",
  "Déficit -300": "Deficit -300",
  "Maintien": "Maintenance",
  "Prise +300": "Bulk +300",
  "Aliments riches en protéines": "Protein-rich foods",

  // Settings
  "Langue": "Language",
  "Mon objectif": "My goal",
  "Muscle": "Muscle",
  "M'affiner": "Get lean",
  "Reprise": "Recovery",
  "Zones sensibles (substitutions auto)": "Sensitive areas (auto substitutions)",
  "Lombaires L5-S1": "L5-S1 lower back",
  "Épaules": "Shoulders",
  "Genoux": "Knees",
  "Poignets": "Wrists",
  "Coudes": "Elbows",
  "Deload (récupération)": "Deload (recovery)",
  "Semaine de deload": "Deload week",
  "Actif — jour": "Active — day",
  "Charges réduites 7 jours": "Reduced loads for 7 days",
  "Sync cloud (optionnel)": "Cloud sync (optional)",
  "Se connecter avec Google": "Sign in with Google",
  "Se déconnecter": "Sign out",
  "Synchronisation…": "Syncing…",
  "Données synchronisées": "Data synced",
  "Connecte-toi pour synchroniser ton historique entre tes appareils. Données privées (toi seul y accèdes via Firestore).":
    "Sign in to sync your history across devices. Private data (only you can access via Firestore).",
  "🧬 Entraînement personnalisé IA": "🧬 AI custom training",
  "Régénérer": "Regenerate",
  "Supprimer": "Delete",
  "🧬 Créer mon programme sur mesure": "🧬 Create my custom program",
  "Supprimer ton programme personnalisé ?": "Delete your custom program?",
  "Données": "Data",
  "Export CSV": "Export CSV",
  "Backup JSON": "JSON backup",
  "Importer": "Import",
  "Tout effacer": "Wipe all",
  "FITStark v9.0 · 100% local · open source · données privées (RGPD)":
    "FITStark v9.0 · 100% local · open source · private data (GDPR)",

  // Wizard
  "🧬 Programme perso IA": "🧬 AI custom program",
  "Retour": "Back",
  "Quel est ton objectif principal ?": "What's your main goal?",
  "Méthode validée pour": "Validated method for",
  "Ton matériel": "Your equipment",
  "Tout": "All",
  "Rien": "None",
  "Durée du programme": "Program duration",
  "sem": "wk",
  "Fréquence (séances/semaine)": "Frequency (sessions/week)",
  "Niveau": "Level",
  "Débutant": "Beginner",
  "Intermédiaire": "Intermediate",
  "Avancé": "Advanced",
  "Continuer": "Continue",
  "🧬 Générer mon programme": "🧬 Generate my program",
  "semaines": "weeks",
  "par sem": "per wk",
  "machines": "machines",
  "Progression linéaire +5%/semaine · deload automatique aux semaines 4 et 8":
    "Linear progression +5%/week · automatic deload on weeks 4 and 8",

  // Finish screen
  "Bravo": "Well done",
  "Séance terminée": "Workout finished",
  "Durée": "Duration",
  "Volume": "Volume",
  "Séries": "Sets",
  "Exercices": "Exercises",
  "Partager ma séance": "Share my workout",
  "Voir l'historique": "View history",

  // Body map
  "Touche un muscle. La couleur indique sa fraîcheur (jours depuis la dernière sollicitation).":
    "Tap a muscle. Color indicates its freshness (days since last work).",
  "Couleur = fraîcheur de chaque muscle (jours depuis la dernière sollicitation). Rouge = négligé, vert = récemment travaillé.":
    "Color = freshness of each muscle (days since last work). Red = neglected, green = recently trained.",
  "Anatomie musculaire face et dos": "Front and back muscle anatomy",
  "Volume 30j": "Volume 30d",
  "Séances 30j": "Sessions 30d",
  "Dernière séance": "Last session",
  "Meilleur 1RM": "Best 1RM",
  "Hier": "Yesterday",
  "Il y a {n} j": "{n}d ago",
  "Légende": "Legend",
  "Illustration": "Illustration",
  "Aujourd'hui": "Today",
  "Jamais entraîné": "Never trained",
  "Frais (≤2j)": "Fresh (≤2d)",
  "Récent (≤5j)": "Recent (≤5d)",
  "À surveiller": "Watch",
  "Négligé": "Neglected",
  "Oublié": "Forgotten",
  "Jamais": "Never",
  "Pectoraux": "Chest",
  "Dos": "Back",
  "Biceps": "Biceps",
  "Triceps": "Triceps",
  "Quadriceps": "Quads",
  "Ischio-jambiers": "Hamstrings",
  "Mollets": "Calves",
  "Fessiers": "Glutes",

  // Grocery list
  "Liste de courses": "Grocery list",
  "Liste de courses intelligente": "Smart grocery list",
  "Générée selon ton objectif, la saison et tes goûts": "Generated from your goal, season and taste",
  "articles": "items",
  "Cocher": "Check",
  "Modifier": "Edit",
  "Remplacer": "Replace",
  "Ajouter un aliment": "Add a food",
  "Régénérer la liste ? Les cases cochées seront perdues.": "Regenerate the list? Checked items will be lost.",
  "Génère une liste de courses adaptée à ton objectif nutrition, à la saison et à tes préférences. Tu pourras tout modifier ensuite.":
    "Generates a grocery list matched to your nutrition goal, the season, and your preferences. You can edit everything afterwards.",
  "Nombre de jours": "Number of days",
  "Hémisphère (saisonnalité)": "Hemisphere (seasonality)",
  "Hémisphère nord": "Northern hemisphere",
  "Hémisphère sud": "Southern hemisphere",
  "Tes préférences": "Your preferences",
  "Touche une fois pour aimer 👍, deux fois pour éviter 👎.": "Tap once to like 👍, twice to avoid 👎.",
  "Générer ma liste": "Generate my list",
  "Légumes": "Vegetables",
  "Fruits": "Fruit",
  "Laitier": "Dairy",
  "Basiques": "Staples",
  "Modifier l'aliment": "Edit food",
  "Nom": "Name",
  "Quantité": "Quantity",
  "Unité": "Unit",
  "Choisis une alternative dans la même catégorie.": "Pick an alternative in the same category.",
  "Aucune alternative disponible.": "No alternative available.",
  "Catégorie": "Category",
  "ex : Pain au levain": "e.g. Sourdough bread",
  "Ajouter": "Add",
  "Idées repas": "Meal ideas",
  "Idées de préparation pour ta semaine.": "Prep ideas for your week.",
  "Portion type : ~{qty}": "Typical portion: ~{qty}",
  "Pour ce repas : ~{qty} de {food}": "For this meal: ~{qty} of {food}",
  "Petit-déjeuner": "Breakfast",
  "Déjeuner": "Lunch",
  "Collation": "Snack",
  "Dîner": "Dinner",
  "Planifier mes repas": "Plan my meals",

  // Meal plan
  "Planning de la semaine": "Weekly meal plan",
  "Choisis les repas que tu veux planifier. Le planning utilisera uniquement les aliments de ta liste de courses validée.":
    "Choose the meals you want to plan. The schedule will only use foods from your validated grocery list.",
  "Quels repas planifier ?": "Which meals to plan?",
  "Génère d'abord ta liste de courses pour pouvoir planifier tes repas.": "Generate your grocery list first to plan your meals.",
  "Générer le planning": "Generate the plan",
  "Sur {n} jours, à partir des aliments de ta liste de courses.": "Over {n} days, based on the foods in your grocery list.",
  "Jour": "Day",
  "Conseils de prép": "Prep tips",
  "Régénérer le planning ?": "Regenerate the plan?",
  "Cuis les féculents (riz, quinoa, pâtes) en grande quantité en début de semaine — ils se gardent 3-4 jours au frigo.":
    "Cook starches (rice, quinoa, pasta) in bulk early in the week — they keep 3-4 days in the fridge.",
  "Prépare et pèse tes portions de protéines à l'avance, en boîtes individuelles prêtes à réchauffer.":
    "Prep and weigh your protein portions ahead of time, in individual containers ready to reheat.",
  "Lave et coupe les légumes robustes (carotte, chou-fleur, poivron) dès le retour des courses.":
    "Wash and chop sturdy vegetables (carrot, cauliflower, bell pepper) as soon as you're back from shopping.",
  "Achète les aliments très périssables (salade, fraises, poisson frais) à mi-semaine plutôt qu'en une fois.":
    "Buy highly perishable foods (lettuce, strawberries, fresh fish) midweek rather than all at once.",
  "Objectif nutrition": "Nutrition goal",
  "Modifier les repas": "Edit meals",
  "Vise ~{kcal} kcal pour ce repas": "Aim for ~{kcal} kcal for this meal",
  "Repas hors planning": "Meals outside the plan",
  "Pas dans ton planning — si tu manges ces repas à l'extérieur, voici quoi viser.":
    "Not in your plan — if you eat these meals out, here's what to aim for.",
  "Privilégie une protéine maigre (poulet, poisson, œufs) et beaucoup de légumes. Limite pain/féculents et sauces grasses, évite la friture et l'alcool.":
    "Favor a lean protein (chicken, fish, eggs) and plenty of vegetables. Limit bread/starches and fatty sauces, avoid fried food and alcohol.",
  "Ne te restreins pas sur les féculents (riz, pâtes, pain) et ajoute une source de bons lipides (huile d'olive, avocat, oléagineux) en plus de ta protéine.":
    "Don't hold back on starches (rice, pasta, bread) and add a source of healthy fat (olive oil, avocado, nuts) on top of your protein.",
  "Vise un repas équilibré classique : une portion de protéine, une portion de féculents, des légumes — sans excès ni restriction particulière.":
    "Aim for a classic balanced meal: a portion of protein, a portion of starches, vegetables — no excess or particular restriction.",

  // Core / Cardio
  "Core L5-S1": "L5-S1 Core",
  "Programme McGill Big 3 · 12 semaines": "McGill Big 3 program · 12 weeks",
  "séances cette semaine": "sessions this week",
  "🚀 Démarrer le programme (semaine 1)": "🚀 Start program (week 1)",
  "Technique": "Technique",
  "Vidéo": "Video",
  "✓ Marquer la séance Core faite": "✓ Mark Core session as done",
  "Course": "Running",
  "Nage": "Swimming",
  "Vélo": "Bike",
  "Vitesse": "Speed",
  "Pente": "Incline",
  "Distance": "Distance",
  "Résistance": "Resistance",
  "💡 Pour l'objectif « M'affiner » : vise 2-3 séances de cardio Z2 (60-70 % FCmax) par semaine en complément du PPL.":
    "💡 For 'Get lean' goal: aim for 2-3 Z2 cardio sessions (60-70 % HRmax) per week alongside PPL.",
  "✓ Enregistrer la séance cardio": "✓ Save cardio session",

  // Recettes — ingrédients secondaires
  "Avec :": "With:",
  "Assaisonnement :": "Seasoning:",
}
