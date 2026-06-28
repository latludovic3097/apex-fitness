// FITStark — Génération de liste de courses (heuristique, pas un solveur).
// S'appuie sur nutCalc() pour les cibles macro (déjà adaptées à l'objectif
// Sèche/Déficit/Maintien/Prise via nut.goal) et sur le catalogue saisonnier.

import { nutCalc } from "@/data/fitstark-data"
import { GROCERY_CATALOG, type GroceryCatalogItem } from "@/data/groceryCatalog"
import { GROCERY_RECIPES, type RecipeIdea } from "@/data/groceryRecipes"
import type { GroceryItem, GroceryPrefs, MealPlanDay, MealSlot, NutritionState } from "@/store/types"

const PICK_COUNT: Record<string, number> = {
  protein: 3,
  carbs: 2,
  fat: 1,
  veg: 3,
  fruit: 2,
  dairy: 1,
  other: 2,
}

/** Hémisphère sud → saisons inversées de 6 mois (approximation, pas de données par item). */
function effectiveMonth(hemisphere: "nord" | "sud"): number {
  const m = new Date().getMonth() + 1
  return hemisphere === "sud" ? ((m + 6 - 1) % 12) + 1 : m
}

function inSeason(item: GroceryCatalogItem, month: number): boolean {
  return !item.seasonMonths || item.seasonMonths.includes(month)
}

function pickItems(category: string, month: number, prefs: GroceryPrefs): GroceryCatalogItem[] {
  const n = PICK_COUNT[category] || 2
  const pool = GROCERY_CATALOG.filter(
    (i) => i.category === category && inSeason(i, month) && !prefs.dislikedIds.includes(i.id),
  )
  const fallback = pool.length ? pool : GROCERY_CATALOG.filter((i) => i.category === category && !prefs.dislikedIds.includes(i.id))
  const sorted = [...fallback].sort((a, b) => {
    const aLiked = prefs.likedIds.includes(a.id) ? 0 : 1
    const bLiked = prefs.likedIds.includes(b.id) ? 0 : 1
    return aLiked - bLiked
  })
  return sorted.slice(0, n)
}

function round(n: number): number {
  return Math.max(1, Math.round(n))
}

export function generateGroceryItems(nut: NutritionState, prefs: GroceryPrefs, days: number): GroceryItem[] {
  const macros = nutCalc(nut)
  const month = effectiveMonth(prefs.hemisphere)
  const items: GroceryItem[] = []

  const macroTargets: { category: "protein" | "carbs" | "fat"; dailyGrams: number }[] = [
    { category: "protein", dailyGrams: macros.protein },
    { category: "carbs", dailyGrams: macros.carbs },
    { category: "fat", dailyGrams: macros.fat },
  ]

  macroTargets.forEach(({ category, dailyGrams }) => {
    const picked = pickItems(category, month, prefs)
    if (!picked.length || dailyGrams <= 0) return
    const perItemDaily = dailyGrams / picked.length
    picked.forEach((cat) => {
      const qty = round((days * perItemDaily) / ((cat.macroPer100g || 20) / 100))
      items.push({
        id: crypto.randomUUID(),
        catalogId: cat.id,
        name: cat.name,
        category: cat.category,
        qty,
        unit: cat.unit,
        checked: false,
      })
    })
  })

  ;(["veg", "fruit", "dairy", "other"] as const).forEach((category) => {
    const picked = pickItems(category, month, prefs)
    picked.forEach((cat) => {
      const qty = round(days * (cat.qtyPerDay || 1))
      items.push({
        id: crypto.randomUUID(),
        catalogId: cat.id,
        name: cat.name,
        category: cat.category,
        qty,
        unit: cat.unit,
        checked: false,
      })
    })
  })

  return items
}

/** Alternatives possibles pour un item généré : même catégorie, pas déjà dans la liste. */
export function getGroceryAlternatives(category: string, currentCatalogIds: string[]): GroceryCatalogItem[] {
  return GROCERY_CATALOG.filter((i) => i.category === category && !currentCatalogIds.includes(i.id))
}

export function formatGroceryQty(qty: number, unit: string): string {
  if (unit === "g" && qty >= 1000) return `${(qty / 1000).toFixed(1)} kg`
  if (unit === "mL" && qty >= 1000) return `${(qty / 1000).toFixed(1)} L`
  return `${qty} ${unit}`
}

const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"]

/**
 * Planning de repas à partir de la liste de courses VALIDÉE (pas tout le catalogue) :
 * ne propose que des recettes pour des aliments réellement achetés. Rotation par index
 * (pas aléatoire) pour garantir une vraie variété au lieu de répétitions par hasard.
 */
export function generateMealPlan(items: GroceryItem[], slots: MealSlot[], days: number): MealPlanDay[] {
  const linked = items.filter((i): i is GroceryItem & { catalogId: string } => !!i.catalogId && !!GROCERY_RECIPES[i.catalogId])
  const orderedSlots = SLOT_ORDER.filter((s) => slots.includes(s))
  const plan: MealPlanDay[] = []

  for (let d = 0; d < days; d++) {
    const meals = orderedSlots
      .map((slot, slotIdx) => {
        const collect = (filter: (r: RecipeIdea) => boolean) => {
          const out: { item: GroceryItem; recipe: RecipeIdea }[] = []
          linked.forEach((item) => {
            GROCERY_RECIPES[item.catalogId].filter(filter).forEach((recipe) => out.push({ item, recipe }))
          })
          return out
        }
        // Repas complet pour ce créneau d'abord ; sinon un repas complet sur un autre
        // créneau ; sinon, en dernier recours, une idée d'usage (condiment) plutôt
        // qu'un créneau vide.
        const exact = collect((r) => r.meal === slot && r.standalone !== false)
        const anyStandalone = exact.length ? exact : collect((r) => r.standalone !== false)
        const candidatePool = anyStandalone.length ? anyStandalone : collect(() => true)
        if (!candidatePool.length) return null
        const pick = candidatePool[(d * 5 + slotIdx) % candidatePool.length]
        return {
          slot,
          recipeTitle: pick.recipe.title,
          steps: pick.recipe.steps,
          catalogId: pick.item.catalogId!,
          foodName: pick.item.name,
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
    plan.push({ dayIndex: d, meals })
  }
  return plan
}

/** Conseils d'anticipation : ingrédients qui reviennent souvent → à préparer en lot. */
export function getMealPlanPrepTips(plan: MealPlanDay[]): string[] {
  const counts: Record<string, { name: string; count: number }> = {}
  plan.forEach((day) =>
    day.meals.forEach((m) => {
      if (!counts[m.catalogId]) counts[m.catalogId] = { name: m.foodName, count: 0 }
      counts[m.catalogId].count++
    }),
  )
  const tips = Object.values(counts)
    .filter((c) => c.count >= 3)
    .sort((a, b) => b.count - a.count)
    .map((c) => `${c.name} revient dans ${c.count} repas cette semaine — prépare-en une grande quantité en une fois (cuisson en lot) et garde-la au frigo 3-4 jours.`)
  return tips
}

// ─── Cohérence avec l'objectif nutrition (Sèche/Déficit/Maintien/Prise) ───
// La liste de courses est déjà dimensionnée sur les macros cibles (nutCalc tient
// compte de nut.goal). Ce qui manquait : combien manger À CHAQUE repas, et quoi
// viser quand un repas n'est pas planifié (donc pris à l'extérieur).

export type GoalMode = "cut" | "bulk" | "maintain"

export function getGoalMode(nutGoalDelta: number): GoalMode {
  if (nutGoalDelta <= -200) return "cut"
  if (nutGoalDelta >= 200) return "bulk"
  return "maintain"
}

// Répartition usuelle des macros sur la journée — fixe, pas re-pondérée selon les
// créneaux sélectionnés : un repas non planifié reste "pris quelque part", la cible
// du créneau sert alors de repère pour le repas extérieur, pas une portion à zéro.
const SLOT_SHARE: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  snack: 0.1,
  dinner: 0.3,
}

export interface SlotTarget {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export function getMealSlotTargets(nut: NutritionState): Record<MealSlot, SlotTarget> {
  const m = nutCalc(nut)
  const out = {} as Record<MealSlot, SlotTarget>
  ;(Object.keys(SLOT_SHARE) as MealSlot[]).forEach((slot) => {
    const share = SLOT_SHARE[slot]
    out[slot] = {
      kcal: Math.round(m.target * share),
      protein: Math.round(m.protein * share),
      carbs: Math.round(m.carbs * share),
      fat: Math.round(m.fat * share),
    }
  })
  return out
}

const EATING_OUT_TIPS: Record<GoalMode, string> = {
  cut: "Privilégie une protéine maigre (poulet, poisson, œufs) et beaucoup de légumes. Limite pain/féculents et sauces grasses, évite la friture et l'alcool.",
  bulk: "Ne te restreins pas sur les féculents (riz, pâtes, pain) et ajoute une source de bons lipides (huile d'olive, avocat, oléagineux) en plus de ta protéine.",
  maintain: "Vise un repas équilibré classique : une portion de protéine, une portion de féculents, des légumes — sans excès ni restriction particulière.",
}

export function getEatingOutTip(mode: GoalMode): string {
  return EATING_OUT_TIPS[mode]
}

// ─── Quantité de l'aliment principal d'une recette ───
// Calculée, jamais inventée : pour protéine/glucides/lipides on convertit la cible
// macro (g) en quantité d'aliment via macroPer100g ; pour légume/fruit/laitier/autre
// on reprend qtyPerDay du catalogue (déjà calibré "1 portion"). Sans cible macro
// fournie (dialogue idées-recette hors planning), on retombe sur une portion de
// référence standard par macro.
const REFERENCE_MACRO_SERVING = { protein: 30, carbs: 50, fat: 12 }

export interface IngredientQty {
  qty: number
  unit: string
}

export function getIngredientQty(
  catalogId: string,
  macroTarget?: { protein: number; carbs: number; fat: number },
): IngredientQty | null {
  const item = GROCERY_CATALOG.find((i) => i.id === catalogId)
  if (!item) return null
  if (item.macroPer100g) {
    const ref = macroTarget || REFERENCE_MACRO_SERVING
    const macroGrams = item.category === "protein" ? ref.protein : item.category === "carbs" ? ref.carbs : ref.fat
    const qty = Math.max(10, Math.round((macroGrams / item.macroPer100g) * 100))
    return { qty, unit: item.unit }
  }
  return { qty: item.qtyPerDay || 1, unit: item.unit }
}

export interface ExtraQty {
  name: string
  qty: number
  unit: string
}

/** Résout une liste d'IDs catalogue (extras d'une recette) en noms + quantités de référence. */
export function getExtrasQties(extras: string[]): ExtraQty[] {
  return extras
    .map((id) => {
      const item = GROCERY_CATALOG.find((c) => c.id === id)
      if (!item) return null
      const q = getIngredientQty(id)
      if (!q) return null
      return { name: item.name, qty: q.qty, unit: q.unit }
    })
    .filter((x): x is ExtraQty => x !== null)
}
