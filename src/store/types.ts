// FITStark — Types du domaine (port TS du modèle de données vanilla)

export type ScreenId =
  | "home"
  | "session"
  | "history"
  | "nutrition"
  | "settings"
  | "bodymap"
  | "core"
  | "cardio"
  | "wizard"
  | "finish"
  | "grocery"
  | "mealplan"

export type SessionId = "push" | "pull" | "legs" | "core" | "custom" | string

export type GoalId = "force" | "muscle" | "lean" | "rehab"

export type PathologyId = "l5" | "shoulder" | "knee" | "wrist" | "elbow"

export interface LoggedSet {
  weight: number
  reps: number
}

/** Un exercice tel que défini dans PROG / catalogue, enrichi à l'exécution. */
export interface Exercise {
  id?: string
  name: string
  muscle: string
  sets: number
  reps: string
  rest: number
  imgs?: string[]
  mw?: string
  yt?: string
  notes?: string
  coaching?: string[]
  l5safe?: boolean
  l5warn?: string
  type?: string
  /** "weight" | "reps_bw" | "cardio" | "time" — pilote les libellés de colonnes. */
  logType?: string
  logged?: Record<string, LoggedSet>
  rir?: number | null
  _substitutedFrom?: string
  _substitutedFor?: string
}

export interface Pool {
  label: string
  exercises: Exercise[]
}

export interface Session {
  id: SessionId
  name: string
  color: string
  muscles: string[]
  compounds: Exercise[]
  pools: Pool[]
  /** Liste résolue (compounds + 1 accessoire par pool, substitutions appliquées). */
  exercises?: Exercise[]
  /** Référence séance de programme perso (pour le suivi hebdo). */
  _cp?: { weekIdx: number; sessIdx: number }
}

export interface CustomProgramSession {
  dayLabel: string
  sets: number
  reps: number
  rest: number
  work: number | null
  intensity: string
}
export interface CustomProgram {
  objective: string
  objectiveName: { fr: string; en: string }
  method: string
  methodName: { fr: string; en: string }
  machines: string[]
  duration: number
  frequency: number
  level: string
  createdAt: string
  weeks: { weekNum: number; sessions: CustomProgramSession[] }[]
}

export interface HistoryExercise {
  name: string
  muscle: string
  logged: Record<string, LoggedSet>
  rir?: number | null
}

export interface HistoryEntry {
  id?: string
  date: string
  sessionId: SessionId
  sessionName: string
  phase?: string
  duration: number
  notes?: string
  wodName?: string
  coreWeek?: number
  _cp?: { weekIdx: number; sessIdx: number }
  exercises: HistoryExercise[]
}

export interface CardioState {
  mode: "run" | "swim" | "bike"
  duration: number
  incline: number
  speed: number
  distance: number
  resistance: number
  notes: string
}

export interface CoreState {
  startDate: string | null
  coreLog: Record<string, LoggedSet>
  coreNotes: string
  coreT0: number | null
  ei: number
}

export interface NutritionState {
  weight: number
  height: number
  age: number
  sex: "M" | "F"
  activity: number
  goal: number
  proteinPerKg: number
  fatPerKg: number
  weightLog: { date: string; weight: number }[]
}

export interface HealthState {
  pathologies: PathologyId[]
}

export interface CustomState {
  name: string
  exerciseIds: string[]
  wodIdx?: number
}

export interface DeloadState {
  active?: boolean
  startedAt?: string | null
}

export interface GroceryItem {
  id: string
  /** id du catalogue d'origine, ou null pour un ajout 100% manuel. */
  catalogId: string | null
  name: string
  category: string
  qty: number
  unit: string
  checked: boolean
}

export interface GroceryPrefs {
  days: number
  hemisphere: "nord" | "sud"
  likedIds: string[]
  dislikedIds: string[]
}

export interface GroceryListState {
  generatedAt: string | null
  days: number
  items: GroceryItem[]
}

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner"

export interface PlannedMeal {
  slot: MealSlot
  recipeTitle: string
  steps: string[]
  catalogId: string
  foodName: string
}

export interface MealPlanDay {
  dayIndex: number
  meals: PlannedMeal[]
}

export interface MealPlanState {
  generatedAt: string | null
  days: number
  slots: MealSlot[]
  plan: MealPlanDay[]
}

/** Miroir TS de l'objet `S` du state.js vanilla. */
export interface AppState {
  view: ScreenId
  hist: HistoryEntry[]
  sess: Session | null
  ei: number
  /** Keyé par id d'exercice : { [setIdx]: {weight, reps}, rir?: number }. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: Record<string, any>
  notes: string
  t0: number | null
  phase: number
  cardio: CardioState
  core: CoreState
  nut: NutritionState
  health: HealthState
  custom: CustomState
  goal: GoalId
  customProgram?: CustomProgram | null
  deload?: DeloadState
  /** Dernière séance terminée (transitoire, pour l'écran de fin). */
  lastFinished?: HistoryEntry | null
  groceryPrefs: GroceryPrefs
  groceryList: GroceryListState
  mealPlanSlots: MealSlot[]
  mealPlan: MealPlanState
}
