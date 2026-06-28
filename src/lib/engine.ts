/* eslint-disable @typescript-eslint/no-explicit-any */
// FITStark — Moteur logique (port fidèle de core.js + state.js, sans couplage DOM).
// Chaque fonction prend l'état `S` en paramètre au lieu d'un global.

import {
  PROG,
  PHASES,
  WODS,
  EXERCISE_RISKS,
  calc1RM,
  getAPREAdjustment,
} from "@/data/fitstark-data"
import type { AppState, Exercise, Session } from "@/store/types"

const DAY = 864e5
const WEEK = 6048e5

// ─── Streak / jours depuis dernière séance ───
export function getDaysSinceLastSession(S: AppState): number | null {
  if (!S.hist || !S.hist.length) return null
  const lastDate = new Date(S.hist[0].date).getTime()
  return Math.floor((Date.now() - lastDate) / DAY)
}

export type StreakStatus = "new" | "active" | "ok" | "warn" | "alert" | "lost"
export interface StreakInfo {
  days: number | null
  sessions7: number
  status: StreakStatus
  color: string
}

export function getStreakInfo(S: AppState): StreakInfo {
  const days = getDaysSinceLastSession(S)
  if (days === null) return { days: null, sessions7: 0, status: "new", color: "var(--mt)" }
  const sessions7 = S.hist.filter((h) => Date.now() - new Date(h.date).getTime() < 7 * DAY).length
  if (days === 0) return { days, sessions7, status: "active", color: "var(--ok)" }
  if (days <= 2) return { days, sessions7, status: "ok", color: "var(--ok)" }
  if (days <= 4) return { days, sessions7, status: "warn", color: "var(--wa)" }
  if (days <= 7) return { days, sessions7, status: "alert", color: "var(--ac)" }
  return { days, sessions7, status: "lost", color: "var(--ac)" }
}

// ─── Stats par muscle (body map) ───
export function getMuscleStats(S: AppState, muscleKey: string) {
  const now = Date.now()
  let volume30 = 0
  let max1RM = 0
  let lastDate: string | null = null
  const seen30 = new Set<string>()
  S.hist.forEach((h) => {
    const hDate = new Date(h.date).getTime()
    const ageDays = (now - hDate) / DAY
    let hitMuscle = false
    h.exercises.forEach((ex) => {
      if (ex.muscle !== muscleKey) return
      hitMuscle = true
      Object.values(ex.logged || {}).forEach((s: any) => {
        const w = s.weight || 0
        const r = s.reps || 0
        if (ageDays <= 30) volume30 += w * r
        if (w && r) {
          const rm = calc1RM(w, r)
          if (rm > max1RM) max1RM = rm
        }
      })
    })
    if (hitMuscle) {
      if (!lastDate || hDate > new Date(lastDate).getTime()) lastDate = h.date
      if (ageDays <= 30) seen30.add(h.id || h.date)
    }
  })
  const daysAgo = lastDate ? Math.floor((now - new Date(lastDate).getTime()) / DAY) : null
  return { volume30, sessions30: seen30.size, lastDate, daysAgo, max1RM }
}

export function muscleHeatColor(daysAgo: number | null): string {
  if (daysAgo === null) return "#c7c7cc"
  if (daysAgo <= 2) return "#2A9D8F"
  if (daysAgo <= 5) return "#5DB8A8"
  if (daysAgo <= 10) return "#F4A261"
  if (daysAgo <= 20) return "#E76F51"
  return "#C0392B"
}

// ─── Suggestion APRE ───
export interface Suggestion {
  weight: number
  reason: string
  status: string
}

export function getSuggestion(S: AppState, exName: string): Suggestion | null {
  const entries = S.hist.filter((h) => h.exercises.some((e) => e.name === exName)).slice(0, 3)
  if (!entries.length) return null
  const lastEx = entries[0].exercises.find((e) => e.name === exName)
  if (!lastEx) return null
  const sets = Object.values(lastEx.logged || {}) as any[]
  if (!sets.length) return null
  const maxWeight = Math.max(...sets.map((s) => s.weight || 0))
  const repsAtMax = sets.filter((s) => s.weight === maxWeight).map((s) => s.reps || 0)
  const bestReps = Math.max(...repsAtMax)
  const ph = PHASES[S.phase]
  const targetRM = parseInt(ph.reps.split("-")[1]) || 8
  const adj = getAPREAdjustment(bestReps, targetRM)
  let sugWeight = Math.round((maxWeight + adj.nextAdj) / 2.5) * 2.5
  const lastRIR = lastEx.rir
  let rirNote = ""
  if (lastRIR !== undefined && lastRIR !== null) {
    if (lastRIR <= 1) rirNote = " | RIR≤1: proche du max"
    else if (lastRIR >= 3) rirNote = " | RIR≥3: marge dispo"
  }
  if (isDeloadActive(S)) {
    sugWeight = Math.round((sugWeight * 0.8) / 2.5) * 2.5
    rirNote += " | 🛌 Deload -20%"
  }
  const icons: Record<string, string> = {
    "trop lourd": "🔴",
    lourd: "🟠",
    optimal: "🟢",
    progression: "🔵",
    "trop léger": "⚪",
  }
  return {
    weight: sugWeight,
    reason: `${icons[adj.status]} APRE: ${maxWeight}kg × ${bestReps}r → ${adj.status} → ${sugWeight}kg${rirNote}`,
    status: adj.status,
  }
}

// ─── 1RM best observé ───
export function get1RM(S: AppState, exName: string): number {
  let best = 0
  S.hist.forEach((h) => {
    h.exercises
      .filter((e) => e.name === exName)
      .forEach((ex) => {
        Object.values(ex.logged || {}).forEach((s: any) => {
          if (s.weight && s.reps) {
            const rm = calc1RM(s.weight, s.reps)
            if (rm > best) best = rm
          }
        })
      })
  })
  return best
}

/** 1RM estimés affichés sur l'accueil (Bench/Squat/RDL/OHP/Pull-ups). */
export const KEY_LIFTS = [
  { name: "Bench Press", label: "Bench" },
  { name: "Back Squat", label: "Squat" },
  { name: "Romanian DL", label: "RDL" },
  { name: "OHP Debout", label: "OHP" },
  { name: "Pull-ups", label: "Pull-ups" },
]

// ─── Deload ───
export function isDeloadActive(S: AppState): boolean {
  if (!S.deload || !S.deload.active || !S.deload.startedAt) return false
  const days = (Date.now() - new Date(S.deload.startedAt).getTime()) / DAY
  return days < 7
}
export function getDeloadDay(S: AppState): number {
  if (!isDeloadActive(S)) return 0
  return Math.min(7, Math.floor((Date.now() - new Date(S.deload!.startedAt!).getTime()) / DAY) + 1)
}

// ─── Fatigue ───
export interface Fatigue {
  score: number
  label: string
  color: string
}
export function getFatigue(S: AppState): Fatigue {
  if (S.hist.length < 4) return { score: 50, label: "Données insuffisantes", color: "var(--mt)" }
  const now = Date.now()
  let vol7 = 0
  const weekMap: Record<number, number> = {}
  S.hist.forEach((h) => {
    const diff = now - new Date(h.date).getTime()
    let v = 0
    h.exercises.forEach((x) =>
      Object.values(x.logged || {}).forEach((s: any) => {
        v += (s.weight || 0) * (s.reps || 0)
      }),
    )
    if (diff < WEEK) vol7 += v
    const wk = Math.floor(diff / WEEK)
    weekMap[wk] = (weekMap[wk] || 0) + v
  })
  const wkVals = Object.values(weekMap)
  const avg = wkVals.length ? wkVals.reduce((a, b) => a + b, 0) / wkVals.length : 1
  const ratio = avg > 0 ? vol7 / avg : 1
  const score = Math.min(100, Math.round(ratio * 50))
  if (score > 75) return { score, label: "⚠️ Surcharge — envisage un deload", color: "var(--ac)" }
  if (score > 55) return { score, label: "Bon rythme — continue !", color: "var(--ok)" }
  return { score, label: "Volume faible — tu peux pousser", color: "#457B9D" }
}

// ─── Planning hebdo adaptatif ───
export type DayStatus =
  | "done"
  | "today"
  | "future"
  | "past_rest"
  | "today_rest"
  | "future_rest"
  | "pending"
export interface PlanDay {
  date: Date
  dow: number
  sess: string | null
  status: DayStatus
}

function computeIdealCycleDynamic(S: AppState): string[] {
  const PPL = ["push", "pull", "legs"]
  const lastDone: Record<string, number> = {}
  PPL.forEach((id) => {
    const h = S.hist.find((x) => x.sessionId === id)
    lastDone[id] = h ? new Date(h.date).getTime() : 0
  })
  const sorted = [...PPL].sort((a, b) => lastDone[a] - lastDone[b])
  return [sorted[0], "core", sorted[1], "rest", sorted[2], "rest", "rest"]
}

export function computeWeekPlan(S: AppState): PlanDay[] {
  const now = new Date()
  const todayDow = now.getDay()
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - todayIdx)
  const TRACKED = ["push", "pull", "legs", "core"]
  const days: PlanDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({ date: d, dow: i, sess: null, status: "pending" })
  }
  S.hist.forEach((h) => {
    if (!TRACKED.includes(h.sessionId)) return
    const hd = new Date(h.date)
    if (hd < monday) return
    const idx = Math.floor((hd.getTime() - monday.getTime()) / DAY)
    if (idx < 0 || idx > 6) return
    if (!days[idx].sess) {
      days[idx].sess = h.sessionId
      days[idx].status = "done"
    }
  })
  for (let i = 0; i < todayIdx; i++) {
    if (days[i].status === "pending") {
      days[i].sess = "rest"
      days[i].status = "past_rest"
    }
  }
  const idealCycle = computeIdealCycleDynamic(S)
  const doneThisWeek = days.filter((d) => d.status === "done").map((d) => d.sess)
  const doneCoreThisWeek = doneThisWeek.includes("core")
  const remaining = idealCycle.filter((s) => {
    if (s === "rest") return true
    if (s === "core") return !doneCoreThisWeek
    return !doneThisWeek.includes(s)
  })
  const daysLeft = 7 - todayIdx
  while (remaining.length > daysLeft) {
    const lastRest = remaining.lastIndexOf("rest")
    if (lastRest === -1) break
    remaining.splice(lastRest, 1)
  }
  if (remaining.length > daysLeft) remaining.length = daysLeft
  for (let i = 0; i < daysLeft; i++) {
    const idx = todayIdx + i
    if (days[idx].status === "done") continue
    const sess = i < remaining.length ? remaining[i] : "rest"
    days[idx].sess = sess
    if (idx === todayIdx) days[idx].status = sess === "rest" ? "today_rest" : "today"
    else days[idx].status = sess === "rest" ? "future_rest" : "future"
  }
  return days
}

export function getRecommendation(S: AppState): { id: string; days: number } {
  const sessIds = ["push", "pull", "legs"]
  const last: Record<string, number> = {}
  sessIds.forEach((id) => {
    const h = S.hist.find((x) => x.sessionId === id)
    last[id] = h ? new Date(h.date).getTime() : 0
  })
  const sorted = [...sessIds].sort((a, b) => last[a] - last[b])
  const rec = sorted[0]
  const daysSince = last[rec] ? Math.floor((Date.now() - last[rec]) / DAY) : 99
  return { id: rec, days: daysSince }
}

// ─── WOD selection ───
export function wodRiskPathologies(wod: any, pathologies: string[]): string[] {
  if (!wod || !pathologies || !pathologies.length) return []
  const tagged = Array.isArray(wod.risks) ? wod.risks : []
  if (!tagged.length) return []
  return pathologies.filter((p) => tagged.includes(p))
}

export function pickWOD(S: AppState, sessId: string): any {
  if (sessId === "custom") {
    const idx = S.custom && typeof S.custom.wodIdx === "number" ? S.custom.wodIdx : null
    if (idx === null || !WODS.custom || !WODS.custom[idx]) return null
    return WODS.custom[idx]
  }
  const fullPool = WODS[sessId] || WODS.custom
  if (!fullPool || !fullPool.length) return fullPool ? fullPool[0] : null
  const paths = (S.health && S.health.pathologies) || []
  const compatible = paths.length
    ? fullPool.filter((w: any) => wodRiskPathologies(w, paths).length === 0)
    : fullPool
  const pool = compatible.length ? compatible : fullPool
  const used: Record<string, string> = {}
  S.hist
    .filter((h) => h.sessionId === sessId)
    .forEach((h) => {
      if (h.wodName && !used[h.wodName]) used[h.wodName] = h.date
    })
  const sorted = [...pool].sort((a: any, b: any) => {
    const da = used[a.name] ? new Date(used[a.name]).getTime() : 0
    const db = used[b.name] ? new Date(used[b.name]).getTime() : 0
    return da - db
  })
  return sorted[0]
}

function pickPoolExercise(S: AppState, pool: Exercise[], excludeNames?: Set<string>): Exercise | null {
  if (!pool || !pool.length) return null
  const available =
    excludeNames && excludeNames.size ? pool.filter((e) => !excludeNames.has(e.name)) : pool
  const effective = available.length ? available : pool
  const used: Record<string, string> = {}
  S.hist.forEach((h) => {
    h.exercises.forEach((ex) => {
      if (effective.some((p) => p.name === ex.name) && !used[ex.name]) used[ex.name] = h.date
    })
  })
  return [...effective].sort((a, b) => {
    const da = used[a.name] ? new Date(used[a.name]).getTime() : 0
    const db = used[b.name] ? new Date(used[b.name]).getTime() : 0
    return da - db
  })[0]
}

export function getAllExercises(): Exercise[] {
  const seen: Record<string, Exercise> = {}
  PROG.sessions.forEach((s: any) => {
    s.compounds.forEach((e: Exercise) => {
      if (!seen[e.id!]) seen[e.id!] = e
    })
    s.pools.forEach((p: any) =>
      p.exercises.forEach((e: Exercise) => {
        if (!seen[e.id!]) seen[e.id!] = e
      }),
    )
  })
  return Object.values(seen)
}

function buildCustomSession(S: AppState): Session | null {
  const ids = (S.custom && S.custom.exerciseIds) || []
  if (!ids.length) return null
  const all = getAllExercises()
  const exercises = ids.map((id) => all.find((e) => e.id === id)).filter(Boolean) as Exercise[]
  return {
    id: "custom",
    name: S.custom.name || "CUSTOM",
    color: "#8B5CF6",
    muscles: [...new Set(exercises.map((e) => e.muscle))],
    compounds: [],
    pools: [],
    exercises,
  }
}

export function applyPathologySubstitutions(S: AppState, exercises: Exercise[]): Exercise[] {
  const paths = (S.health && S.health.pathologies) || []
  if (!paths.length || typeof EXERCISE_RISKS === "undefined") return exercises
  const allEx = getAllExercises()
  return exercises.map((ex) => {
    const risks = EXERCISE_RISKS[ex.name]
    if (!risks) return ex
    for (const p of paths) {
      const r = risks[p]
      if (r && r.level === "avoid" && r.alt) {
        const altEx = allEx.find((e) => e.name === r.alt)
        if (altEx && altEx.name !== ex.name) {
          return Object.assign({}, altEx, {
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            _substitutedFrom: ex.name,
            _substitutedFor: p,
          })
        }
      }
    }
    return ex
  })
}

function dedupeExercises(exercises: Exercise[]): Exercise[] {
  if (!exercises || !exercises.length) return exercises
  const seen = new Set<string>()
  return exercises.filter((ex) => {
    if (!ex || !ex.name) return false
    if (seen.has(ex.name)) return false
    seen.add(ex.name)
    return true
  })
}

function buildFreshExercises(S: AppState, base: any): Exercise[] {
  const subbedCompounds = applyPathologySubstitutions(S, [...base.compounds])
  const takenNames = new Set(subbedCompounds.map((e) => e.name))
  const poolPicks = base.pools.map((p: any) => {
    const picked = pickPoolExercise(S, p.exercises, takenNames)
    if (picked) takenNames.add(picked.name)
    return picked
  })
  const final = applyPathologySubstitutions(
    S,
    [...subbedCompounds, ...poolPicks].filter(Boolean) as Exercise[],
  )
  return dedupeExercises(final)
}

export function buildSession(S: AppState, sessId: string, savedExercises?: Exercise[]): Session | null {
  if (sessId === "custom") {
    const cs = buildCustomSession(S)
    if (cs) cs.exercises = dedupeExercises(applyPathologySubstitutions(S, cs.exercises!))
    return cs
  }
  const base = PROG.sessions.find((s: any) => s.id === sessId)
  if (!base) return null
  const sess: Session = Object.assign({}, base)
  if (savedExercises && savedExercises.length) {
    const allEx = [...base.compounds, ...base.pools.flatMap((p: any) => p.exercises)]
    const restored = savedExercises
      .map((sv) => allEx.find((e: any) => e.id === sv.id) || sv)
      .filter(Boolean) as Exercise[]
    sess.exercises = restored.length ? restored : buildFreshExercises(S, base)
  } else {
    sess.exercises = buildFreshExercises(S, base)
  }
  return sess
}

// ─── Core program helpers ───
export function coreCurrentWeek(S: AppState): number {
  if (!S.core.startDate) return 1
  const days = Math.floor((Date.now() - new Date(S.core.startDate).getTime()) / DAY)
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1))
}
export function coreSessionsThisWeek(S: AppState): number {
  const wk = coreCurrentWeek(S)
  const now = Date.now()
  return S.hist.filter(
    (h) => h.sessionId === "core" && h.coreWeek === wk && now - new Date(h.date).getTime() < 7 * DAY,
  ).length
}

// ─── Export CSV ───
export function exportCSV(S: AppState): void {
  let csv = "Date;Session;Phase;Durée;Exercice;Muscle;Set;Kg;Reps;Volume;1RM est.;RIR;Notes\n"
  S.hist.forEach((h) => {
    h.exercises.forEach((ex) => {
      const sets = Object.entries(ex.logged || {})
      const dateStr = new Date(h.date).toLocaleDateString("fr-FR")
      if (!sets.length) {
        csv += `${dateStr};${h.sessionName};${h.phase || ""};${h.duration};${ex.name};${ex.muscle};;;;;;;\n`
      } else {
        sets.forEach(([si, s]: [string, any]) => {
          const rm = s.weight && s.reps ? calc1RM(s.weight, s.reps) : 0
          csv += `${dateStr};${h.sessionName};${h.phase || ""};${h.duration};${ex.name};${ex.muscle};${parseInt(si) + 1};${s.weight};${s.reps};${(s.weight || 0) * (s.reps || 0)};${rm};${ex.rir !== undefined && ex.rir !== null ? ex.rir : ""};${(h.notes || "").replace(/;/g, ",")}\n`
        })
      }
    })
  })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }))
  a.download = `apex-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}
