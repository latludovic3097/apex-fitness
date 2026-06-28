// Déclarations TS pour le bundle data vanilla (fitstark-data.js).
// Les données statiques sont typées `any` (portées verbatim) ; les fonctions
// pures clés ont une vraie signature.
/* eslint-disable @typescript-eslint/no-explicit-any */

// core.js
export function esc(s: unknown): string
export function calc1RM(w: number, r: number): number
export function getAPREAdjustment(
  repsPerformed: number,
  targetRM: number,
): { setAdj: number; nextAdj: number; status: string }
export function nutCalc(n: {
  sex: string
  weight: number
  height: number
  age: number
  activity: number
  goal: number
  proteinPerKg: number
  fatPerKg: number
}): {
  bmr: number
  tdee: number
  target: number
  protein: number
  fat: number
  carbs: number
  deficit: number
  weeklyChange: string
}
export function mergeHistory(
  incoming: any[],
  existing: any[],
): { merged: any[]; added: number; skipped: number }
export function parseCSVtoHistory(text: string): any[]

// data.js
export const I: string
export const MN: Record<string, string>
export const MC: Record<string, string>
export const PHASES: { id: string; name: string; color: string; numSets: number; reps: string; rest: number; desc: string }[]
export const WODS: Record<string, any[]>
export const WU: Record<string, any[]>
export const PROG: { sessions: any[] }
export const IDEAL_CYCLE: string[]
export const PLAN_LABELS: Record<string, string>
export const DAY_SHORTS: string[]
export const CORE_PROGRAM: any
export const PROTEINS_DB: any[]

// machines.js
export const MACHINE_CATEGORIES: Record<string, any>
export const MACHINES: any[]
export function machinesByCategory(): any
export function getMachine(id: string): any

// anatomy.js
export const ANATOMY: any

// pathologies.js
export const PATHOLOGIES: Record<string, any>
export const EXERCISE_RISKS: Record<string, Record<string, { level: string; alt?: string; note?: string }>>
export function getExerciseRisks(exName: string, enabledPaths: string[]): any

// achievements.js
export const ACHIEVEMENTS: any[]
export function computeAchievements(hist: any[], S: any): any[]
export function getAchievementStats(hist: any[], S: any): { earned: number; total: number }

// protocols.js
export const TRAINING_OBJECTIVES: Record<string, any>
export function listObjectives(): any[]
export function getCurrentProgramWeek(prog: any): number
export function countCustomSessionsDone(hist: any[], weekIdx: number, sessIdx: number): number
export function computeCustomWeekPlan(prog: any, hist: any[]): any
export function getObjective(id: string): any
export function generateProgram(opts: any): any

// custom_exercises.js
export const CUSTOM_EXERCISE_CATALOG: any[]
export function pickExercisesForSession(opts: any): any[]
export function getAlternativeExercises(
  exId: string,
  availableMachines: string[],
  objId: string,
  currentSessionExIds: string[],
  limit?: number,
): any[]
export function getExerciseMachines(exId: string): any[]
