/* eslint-disable @typescript-eslint/no-explicit-any */
// FITStark — Store Zustand. Persistance compatible avec l'app vanilla
// (clés localStorage `apex-fit-v8` + `apex-fit-v8_a`) : les données des
// utilisateurs existants se chargent sans migration.

import { create } from "zustand"
import { PHASES, pickExercisesForSession, getCurrentProgramWeek, mergeHistory } from "@/data/fitstark-data"
import { buildSession } from "@/lib/engine"
import { generateGroceryItems, generateMealPlan } from "@/lib/grocery"
import { schedulePush, pull as cloudPull, push as cloudPush } from "@/lib/firebase"
import type {
  AppState,
  CardioState,
  CoreState,
  CustomProgram,
  GoalId,
  GroceryItem,
  GroceryPrefs,
  HealthState,
  HistoryEntry,
  MealSlot,
  NutritionState,
  PathologyId,
  ScreenId,
  Session,
  SessionId,
} from "./types"

const SK = "apex-fit-v8"
const SK_A = SK + "_a"
const DISCLAIMER_KEY = "apex_disclaimer"
const ONBOARD_KEY = "apex_onboarded"

const defaultCardio: CardioState = {
  mode: "run",
  duration: 30,
  incline: 1,
  speed: 10,
  distance: 1000,
  resistance: 5,
  notes: "",
}
const defaultCore: CoreState = {
  startDate: null,
  coreLog: {},
  coreNotes: "",
  coreT0: null,
  ei: 0,
}
const defaultNut: NutritionState = {
  weight: 75,
  height: 178,
  age: 30,
  sex: "M",
  activity: 1.55,
  goal: -400,
  proteinPerKg: 2,
  fatPerKg: 0.8,
  weightLog: [],
}
const defaultGroceryPrefs: GroceryPrefs = {
  days: 7,
  hemisphere: "nord",
  likedIds: [],
  dislikedIds: [],
}
const defaultMealSlots: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"]

function freshState(): AppState {
  return {
    view: "home",
    hist: [],
    sess: null,
    ei: -1,
    log: {},
    notes: "",
    t0: null,
    phase: 0,
    cardio: { ...defaultCardio },
    core: { ...defaultCore },
    nut: { ...defaultNut },
    health: { pathologies: ["l5"] },
    custom: { name: "CUSTOM", exerciseIds: [] },
    goal: "muscle",
    groceryPrefs: { ...defaultGroceryPrefs },
    groceryList: { generatedAt: null, days: 7, items: [] },
    mealPlanSlots: [...defaultMealSlots],
    mealPlan: { generatedAt: null, days: 7, slots: [...defaultMealSlots], plan: [] },
  }
}

// ─── Persistance (format vanilla) ───
function persist(s: AppState) {
  try {
    localStorage.setItem(
      SK,
      JSON.stringify({
        history: s.hist,
        phase: s.phase,
        cardio: s.cardio,
        core: s.core,
        nut: s.nut,
        health: s.health,
        custom: s.custom,
        goal: s.goal,
        customProgram: s.customProgram || null,
        deload: s.deload || null,
        groceryPrefs: s.groceryPrefs,
        groceryList: s.groceryList,
        mealPlanSlots: s.mealPlanSlots,
        mealPlan: s.mealPlan,
      }),
    )
  } catch (e) {
    console.error("[fitstark] persist failed", e)
  }
  // Push cloud debouncé (no-op si non connecté — ne charge pas le SDK Firebase).
  schedulePush({
    history: s.hist,
    phase: s.phase,
    cardio: s.cardio,
    core: s.core,
    nut: s.nut,
    health: s.health,
    goal: s.goal,
  })
}

function persistActive(s: AppState) {
  try {
    if (s.sess) {
      localStorage.setItem(
        SK_A,
        JSON.stringify({
          sid: s.sess.id,
          name: s.sess.name,
          color: s.sess.color,
          cp: s.sess._cp || null,
          ei: s.ei,
          log: s.log,
          notes: s.notes,
          t0: s.t0,
          exercises: s.sess.exercises,
        }),
      )
    } else {
      localStorage.removeItem(SK_A)
    }
  } catch {
    /* ignore */
  }
}

function hydrate(): AppState {
  const s = freshState()
  try {
    const d = JSON.parse(localStorage.getItem(SK) || "null")
    if (d) {
      s.hist = d.history || []
      s.phase = d.phase || 0
      if (d.cardio) s.cardio = { ...s.cardio, ...d.cardio }
      if (d.core) s.core = { ...s.core, ...d.core }
      if (d.nut) s.nut = { ...s.nut, ...d.nut }
      if (d.health) s.health = { ...s.health, ...d.health }
      if (d.custom) s.custom = { ...s.custom, ...d.custom }
      if (d.goal) s.goal = d.goal
      if (d.customProgram) s.customProgram = d.customProgram
      if (d.deload) s.deload = d.deload
      if (d.groceryPrefs) s.groceryPrefs = { ...s.groceryPrefs, ...d.groceryPrefs }
      if (d.groceryList) s.groceryList = d.groceryList
      if (d.mealPlanSlots) s.mealPlanSlots = d.mealPlanSlots
      // Plan dérivé (régénérable) : on ignore un format obsolète (ex: ancien champ
      // `prep` remplacé par `steps`) plutôt que de charger des données mal formées.
      const planShapeValid = (d.mealPlan?.plan || []).every((day: any) =>
        (day.meals || []).every((m: any) => Array.isArray(m.steps)),
      )
      if (d.mealPlan && planShapeValid) s.mealPlan = d.mealPlan
    }
    const a = JSON.parse(localStorage.getItem(SK_A) || "null")
    if (a && a.sid) {
      let sess: Session | null
      if (a.sid === "custom_program" && a.exercises) {
        // séance de programme perso : non reconstructible via PROG → on restaure depuis le snapshot
        sess = {
          id: "custom_program",
          name: a.name || "Séance perso",
          color: a.color || "#8B5CF6",
          muscles: [...new Set((a.exercises as { muscle: string }[]).map((e) => e.muscle))],
          compounds: [],
          pools: [],
          exercises: a.exercises,
          _cp: a.cp || undefined,
        }
      } else {
        sess = buildSession(s, a.sid, a.exercises || undefined)
      }
      if (sess) {
        s.sess = sess
        s.ei = a.ei ?? -1
        s.log = a.log || {}
        s.notes = a.notes || ""
        s.t0 = a.t0 ?? null
        s.view = "session"
      }
    }
  } catch (e) {
    console.warn("[fitstark] hydrate error", e)
  }
  return s
}

interface StoreActions {
  navTo: (view: ScreenId) => void
  startSession: (sessId: SessionId) => void
  setExerciseIndex: (ei: number) => void
  logSet: (exId: string, setIdx: number, patch: { weight?: number; reps?: number }) => void
  setRIR: (exId: string, rir: number) => void
  setNotes: (notes: string) => void
  finishSession: () => void
  dismissFinish: () => void
  cancelSession: () => void
  swapExercise: (exId: string, replacement: Session["exercises"] extends (infer E)[] ? E : never) => void
  setPhase: (phase: number) => void
  togglePathology: (p: PathologyId) => void
  setGoal: (goal: GoalId) => void
  patchNut: (patch: Partial<NutritionState>) => void
  logWeight: (weight: number) => void
  delWeight: (idx: number) => void
  patchCardio: (patch: Partial<CardioState>) => void
  patchHealth: (patch: Partial<HealthState>) => void
  activateDeload: () => void
  deactivateDeload: () => void
  logManualSession: (entry: Partial<HistoryEntry> & { sessionId: string; sessionName: string }) => void
  setCustomProgram: (prog: CustomProgram) => void
  clearCustomProgram: () => void
  startCustomSession: (sessIdx: number) => void
  cloudPullMerge: () => Promise<void>
  importData: (data: any) => void
  wipe: () => void
  setGroceryPrefs: (patch: Partial<GroceryPrefs>) => void
  toggleGroceryPref: (catalogId: string, kind: "liked" | "disliked") => void
  generateGroceryList: (days?: number) => void
  toggleGroceryItem: (id: string) => void
  addGroceryItem: (item: { name: string; category: string; qty: number; unit: string }) => void
  updateGroceryItem: (id: string, patch: Partial<GroceryItem>) => void
  removeGroceryItem: (id: string) => void
  swapGroceryItem: (id: string, replacement: GroceryItem) => void
  clearGroceryList: () => void
  toggleMealPlanSlot: (slot: MealSlot) => void
  generateMealPlanFromList: () => void
  clearMealPlan: () => void
}

export type Store = AppState & StoreActions

export const useStore = create<Store>((set, get) => ({
  ...hydrate(),

  navTo: (view) => set({ view }),

  startSession: (sessId) => {
    const S = get()
    const sess = buildSession(S, sessId)
    if (!sess) return
    set({ sess, ei: 0, log: {}, notes: "", t0: Date.now(), view: "session" })
    persistActive(get())
  },

  setExerciseIndex: (ei) => {
    set({ ei })
    persistActive(get())
  },

  logSet: (exId, setIdx, patch) => {
    set((s) => {
      const log = { ...s.log }
      const cur = { ...(log[exId] || {}) }
      cur[setIdx] = { ...(cur[setIdx] || { weight: 0, reps: 0 }), ...patch }
      log[exId] = cur
      return { log }
    })
    persistActive(get())
  },

  setRIR: (exId, rir) => {
    set((s) => {
      const log = { ...s.log }
      log[exId] = { ...(log[exId] || {}), rir }
      return { log }
    })
    persistActive(get())
  },

  setNotes: (notes) => {
    set({ notes })
    persistActive(get())
  },

  finishSession: () => {
    const S = get()
    const s = S.sess
    if (!s || !s.exercises) return
    const ph = PHASES[S.phase]
    const dur = Math.max(1, Math.round((Date.now() - (S.t0 || Date.now())) / 6e4))
    const entry = {
      id: "" + Date.now(),
      sessionId: s.id,
      sessionName: s.name,
      phase: ph.name,
      date: new Date().toISOString(),
      duration: dur,
      notes: S.notes,
      ...(s._cp ? { _cp: s._cp } : {}),
      exercises: s.exercises.map((x) => ({
        id: x.id,
        name: x.name,
        sets: x.sets,
        reps: x.reps,
        muscle: x.muscle,
        logged: S.log[x.id!] || {},
        rir: S.log[x.id!]?.rir,
      })),
    } as any
    const hist = [entry, ...S.hist]
    set({ hist, sess: null, ei: -1, log: {}, notes: "", t0: null, view: "finish", lastFinished: entry })
    persist(get())
    persistActive(get())
  },

  dismissFinish: () => set({ lastFinished: null, view: "history" }),

  cancelSession: () => {
    set({ sess: null, ei: -1, log: {}, notes: "", t0: null, view: "home" })
    persistActive(get())
  },

  swapExercise: (exId, replacement) => {
    set((s) => {
      if (!s.sess || !s.sess.exercises) return {}
      const exercises = s.sess.exercises.map((e) => (e.id === exId ? (replacement as any) : e))
      return { sess: { ...s.sess, exercises } }
    })
    persistActive(get())
  },

  setPhase: (phase) => {
    set({ phase })
    persist(get())
  },

  togglePathology: (p) => {
    set((s) => {
      const has = s.health.pathologies.includes(p)
      const pathologies = has
        ? s.health.pathologies.filter((x) => x !== p)
        : [...s.health.pathologies, p]
      return { health: { ...s.health, pathologies } }
    })
    persist(get())
  },

  setGoal: (goal) => {
    set({ goal })
    persist(get())
  },

  patchNut: (patch) => {
    set((s) => ({ nut: { ...s.nut, ...patch } }))
    persist(get())
  },

  logWeight: (weight) => {
    set((s) => ({
      nut: {
        ...s.nut,
        weight,
        weightLog: [{ date: new Date().toISOString(), weight }, ...s.nut.weightLog],
      },
    }))
    persist(get())
  },

  delWeight: (idx) => {
    set((s) => {
      const weightLog = s.nut.weightLog.filter((_, i) => i !== idx)
      return { nut: { ...s.nut, weightLog } }
    })
    persist(get())
  },

  patchCardio: (patch) => {
    set((s) => ({ cardio: { ...s.cardio, ...patch } }))
    persist(get())
  },

  patchHealth: (patch) => {
    set((s) => ({ health: { ...s.health, ...patch } }))
    persist(get())
  },

  activateDeload: () => {
    set({ deload: { active: true, startedAt: new Date().toISOString() } })
    persist(get())
  },

  deactivateDeload: () => {
    set({ deload: { active: false, startedAt: null } })
    persist(get())
  },

  logManualSession: (entry) => {
    const full = {
      id: "" + Date.now(),
      date: new Date().toISOString(),
      duration: 0,
      exercises: [],
      ...entry,
    } as HistoryEntry
    set((s) => ({ hist: [full, ...s.hist], view: "history" }))
    persist(get())
  },

  setCustomProgram: (prog) => {
    set({ customProgram: prog })
    persist(get())
  },

  clearCustomProgram: () => {
    set({ customProgram: null })
    persist(get())
  },

  startCustomSession: (sessIdx) => {
    const S = get()
    const prog = S.customProgram
    if (!prog) return
    const week = getCurrentProgramWeek(prog)
    const wk = prog.weeks.find((w) => w.weekNum === week) || prog.weeks[week - 1]
    const session = wk?.sessions?.[sessIdx]
    if (!session) return
    const exercises = pickExercisesForSession({
      objId: prog.objective,
      methodId: prog.method,
      machineIds: prog.machines,
      sessionSets: session.sets,
      sessionReps: session.reps,
      sessionRest: session.rest,
      weekIdx: week,
      sessIdx,
    })
    exercises.forEach((e: any) => {
      if (!e.notes) e.notes = `<b>Intensité :</b> ${session.intensity}`
    })
    const sess: Session = {
      id: "custom_program",
      name: `S${week} · Séance ${sessIdx + 1}`,
      color: "#8B5CF6",
      muscles: [...new Set(exercises.map((e: any) => e.muscle))] as string[],
      compounds: [],
      pools: [],
      exercises,
      _cp: { weekIdx: week, sessIdx },
    }
    set({ sess, ei: 0, log: {}, notes: "", t0: Date.now(), view: "session" })
    persistActive(get())
  },

  cloudPullMerge: async () => {
    try {
      const cloud = await cloudPull()
      if (!cloud) {
        // pas de doc cloud encore : on pousse l'état local actuel
        const n = get()
        await cloudPush({
          history: n.hist,
          phase: n.phase,
          cardio: n.cardio,
          core: n.core,
          nut: n.nut,
          health: n.health,
          goal: n.goal,
        })
        return
      }
      const S = get()
      const merged = mergeHistory(cloud.history || [], S.hist)
      set({
        hist: merged.merged,
        phase: cloud.phase ?? S.phase,
        cardio: cloud.cardio ? { ...S.cardio, ...cloud.cardio } : S.cardio,
        core: cloud.core ? { ...S.core, ...cloud.core } : S.core,
        nut: cloud.nut ? { ...S.nut, ...cloud.nut } : S.nut,
        health: cloud.health ? { ...S.health, ...cloud.health } : S.health,
        goal: cloud.goal || S.goal,
      })
      persist(get())
      const n = get()
      await cloudPush({
        history: n.hist,
        phase: n.phase,
        cardio: n.cardio,
        core: n.core,
        nut: n.nut,
        health: n.health,
        goal: n.goal,
      })
    } catch (e) {
      console.warn("[cloud] pull/merge failed", e)
    }
  },

  importData: (data) => {
    set((s) => ({
      hist: data.history || s.hist,
      phase: data.phase ?? s.phase,
      cardio: data.cardio ? { ...s.cardio, ...data.cardio } : s.cardio,
      core: data.core ? { ...s.core, ...data.core } : s.core,
      nut: data.nut ? { ...s.nut, ...data.nut } : s.nut,
      health: data.health ? { ...s.health, ...data.health } : s.health,
      goal: data.goal || s.goal,
      groceryPrefs: data.groceryPrefs ? { ...s.groceryPrefs, ...data.groceryPrefs } : s.groceryPrefs,
      groceryList: data.groceryList || s.groceryList,
      mealPlanSlots: data.mealPlanSlots || s.mealPlanSlots,
      mealPlan: data.mealPlan || s.mealPlan,
    }))
    persist(get())
  },

  wipe: () => {
    try {
      localStorage.removeItem(SK)
      localStorage.removeItem(SK_A)
    } catch {
      /* ignore */
    }
    set(freshState())
  },

  setGroceryPrefs: (patch) => {
    set((s) => ({ groceryPrefs: { ...s.groceryPrefs, ...patch } }))
    persist(get())
  },

  toggleGroceryPref: (catalogId, kind) => {
    set((s) => {
      const liked = new Set(s.groceryPrefs.likedIds)
      const disliked = new Set(s.groceryPrefs.dislikedIds)
      if (kind === "liked") {
        liked.has(catalogId) ? liked.delete(catalogId) : (liked.add(catalogId), disliked.delete(catalogId))
      } else {
        disliked.has(catalogId) ? disliked.delete(catalogId) : (disliked.add(catalogId), liked.delete(catalogId))
      }
      return { groceryPrefs: { ...s.groceryPrefs, likedIds: [...liked], dislikedIds: [...disliked] } }
    })
    persist(get())
  },

  generateGroceryList: (days) => {
    const S = get()
    const useDays = days || S.groceryPrefs.days
    const items = generateGroceryItems(S.nut, S.groceryPrefs, useDays)
    set({ groceryList: { generatedAt: new Date().toISOString(), days: useDays, items } })
    persist(get())
  },

  toggleGroceryItem: (id) => {
    set((s) => ({
      groceryList: {
        ...s.groceryList,
        items: s.groceryList.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
      },
    }))
    persist(get())
  },

  addGroceryItem: (item) => {
    set((s) => ({
      groceryList: {
        ...s.groceryList,
        items: [
          ...s.groceryList.items,
          { id: crypto.randomUUID(), catalogId: null, checked: false, ...item },
        ],
      },
    }))
    persist(get())
  },

  updateGroceryItem: (id, patch) => {
    set((s) => ({
      groceryList: {
        ...s.groceryList,
        items: s.groceryList.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      },
    }))
    persist(get())
  },

  removeGroceryItem: (id) => {
    set((s) => ({
      groceryList: { ...s.groceryList, items: s.groceryList.items.filter((i) => i.id !== id) },
    }))
    persist(get())
  },

  swapGroceryItem: (id, replacement) => {
    set((s) => ({
      groceryList: {
        ...s.groceryList,
        items: s.groceryList.items.map((i) => (i.id === id ? { ...replacement, id, checked: i.checked } : i)),
      },
    }))
    persist(get())
  },

  clearGroceryList: () => {
    set({ groceryList: { generatedAt: null, days: get().groceryPrefs.days, items: [] } })
    persist(get())
  },

  toggleMealPlanSlot: (slot) => {
    set((s) => {
      const has = s.mealPlanSlots.includes(slot)
      const slots = has ? s.mealPlanSlots.filter((x) => x !== slot) : [...s.mealPlanSlots, slot]
      return { mealPlanSlots: slots }
    })
    persist(get())
  },

  generateMealPlanFromList: () => {
    const S = get()
    const days = S.groceryList.days || S.groceryPrefs.days
    const plan = generateMealPlan(S.groceryList.items, S.mealPlanSlots, days)
    set({ mealPlan: { generatedAt: new Date().toISOString(), days, slots: [...S.mealPlanSlots], plan } })
    persist(get())
  },

  clearMealPlan: () => {
    set((s) => ({ mealPlan: { generatedAt: null, days: s.groceryList.days, slots: s.mealPlanSlots, plan: [] } }))
    persist(get())
  },
}))

// ─── Disclaimer / onboarding (hors store, flags localStorage simples) ───
export function needsDisclaimer(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) !== "1"
  } catch {
    return false
  }
}
export function acceptDisclaimer() {
  try {
    localStorage.setItem(DISCLAIMER_KEY, "1")
  } catch {
    /* ignore */
  }
}
export function needsOnboarding(): boolean {
  try {
    // Les utilisateurs vanilla existants ont déjà accepté le disclaimer → on ne
    // les renvoie pas dans l'onboarding.
    return localStorage.getItem(ONBOARD_KEY) !== "1" && localStorage.getItem(DISCLAIMER_KEY) !== "1"
  } catch {
    return false
  }
}
export function completeOnboarding() {
  try {
    localStorage.setItem(ONBOARD_KEY, "1")
    localStorage.setItem(DISCLAIMER_KEY, "1")
  } catch {
    /* ignore */
  }
}
