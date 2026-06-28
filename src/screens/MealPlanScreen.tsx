import { useMemo } from "react"
import { ChevronLeft, RefreshCw, Pencil, Coffee, Sun, Apple, Moon, Lightbulb, Target, UtensilsCrossed } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { useI18n } from "@/i18n/I18nProvider"
import { getMealPlanPrepTips, getMealSlotTargets, getGoalMode, getEatingOutTip, getIngredientQty, getExtrasQties, formatGroceryQty } from "@/lib/grocery"
import { GROCERY_RECIPES } from "@/data/groceryRecipes"
import { cn } from "@/lib/utils"
import type { MealSlot } from "@/store/types"

const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"]
const SLOT_META: Record<MealSlot, { icon: typeof Coffee; label: string }> = {
  breakfast: { icon: Coffee, label: "Petit-déjeuner" },
  lunch: { icon: Sun, label: "Déjeuner" },
  snack: { icon: Apple, label: "Collation" },
  dinner: { icon: Moon, label: "Dîner" },
}
const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

const GENERIC_TIPS = [
  "Cuis les féculents (riz, quinoa, pâtes) en grande quantité en début de semaine — ils se gardent 3-4 jours au frigo.",
  "Prépare et pèse tes portions de protéines à l'avance, en boîtes individuelles prêtes à réchauffer.",
  "Lave et coupe les légumes robustes (carotte, chou-fleur, poivron) dès le retour des courses.",
  "Achète les aliments très périssables (salade, fraises, poisson frais) à mi-semaine plutôt qu'en une fois.",
]

function goalLabel(goal: number): string {
  if (goal <= -450) return "Sèche -500"
  if (goal <= -150) return "Déficit -300"
  if (goal < 150) return "Maintien"
  return "Prise +300"
}

export function MealPlanScreen() {
  const navTo = useStore((s) => s.navTo)
  const { tt } = useI18n()
  const groceryList = useStore((s) => s.groceryList)
  const slots = useStore((s) => s.mealPlanSlots)
  const toggleSlot = useStore((s) => s.toggleMealPlanSlot)
  const mealPlan = useStore((s) => s.mealPlan)
  const generate = useStore((s) => s.generateMealPlanFromList)
  const clearPlan = useStore((s) => s.clearMealPlan)
  const nut = useStore((s) => s.nut)

  const tips = mealPlan.plan.length ? [...getMealPlanPrepTips(mealPlan.plan), ...GENERIC_TIPS] : []
  const slotTargets = useMemo(() => getMealSlotTargets(nut), [nut])
  const mode = getGoalMode(nut.goal)
  const unplannedSlots = SLOT_ORDER.filter((s) => !mealPlan.slots.includes(s))

  return (
    <div className="pb-4">
      <button onClick={() => navTo("grocery")} className="flex items-center gap-1 px-4 pt-5 text-sm font-bold text-muted-foreground">
        <ChevronLeft className="size-5" /> {tt("Liste de courses")}
      </button>
      <PageHeader title="Planning de la semaine" />

      {mealPlan.plan.length === 0 ? (
        <>
          <p className="mx-4 mb-3 text-[13px] text-muted-foreground">
            {tt(
              "Choisis les repas que tu veux planifier. Le planning utilisera uniquement les aliments de ta liste de courses validée.",
            )}
          </p>

          <div className="mx-4 mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tt("Quels repas planifier ?")}</div>
          <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
            <div className="grid grid-cols-2 gap-2">
              {SLOT_ORDER.map((slot) => {
                const meta = SLOT_META[slot]
                const Icon = meta.icon
                const active = slots.includes(slot)
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] py-3 text-sm font-bold",
                      active ? "border-primary bg-[var(--ac10)] text-primary" : "border-border bg-secondary text-secondary-foreground",
                    )}
                  >
                    <Icon className="size-4" /> {tt(meta.label)}
                  </button>
                )
              })}
            </div>
          </div>

          {groceryList.items.length === 0 ? (
            <p className="mx-4 text-center text-sm text-muted-foreground">
              {tt("Génère d'abord ta liste de courses pour pouvoir planifier tes repas.")}
            </p>
          ) : (
            <div className="mx-4 mb-3">
              <button
                onClick={generate}
                disabled={!slots.length}
                className="w-full rounded-xl bg-[var(--ok)] py-3.5 text-[15px] font-extrabold text-white shadow-[var(--shadow-sm)] disabled:opacity-40"
              >
                📅 {tt("Générer le planning")}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mx-4 mb-1 text-[13px] text-muted-foreground">
            {tt("Sur {n} jours, à partir des aliments de ta liste de courses.", { n: mealPlan.days })}
          </p>
          <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ac10)] px-3 py-1.5 text-xs font-bold text-primary">
              <Target className="size-3.5" /> {tt("Objectif nutrition")} : {tt(goalLabel(nut.goal))}
            </div>
            <button
              onClick={clearPlan}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground"
            >
              <Pencil className="size-3.5" /> {tt("Modifier les repas")}
            </button>
          </div>

          {mealPlan.plan.map((day) => (
            <div key={day.dayIndex}>
              <div className="mx-4 mb-1.5 mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {tt(DAY_LABELS[day.dayIndex % 7])} · {tt("Jour")} {day.dayIndex + 1}
              </div>
              <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
                <div className="space-y-1.5">
                  {day.meals.map((meal, i) => {
                    const meta = SLOT_META[meal.slot]
                    const Icon = meta.icon
                    const target = slotTargets[meal.slot]
                    const qty = getIngredientQty(meal.catalogId, target)
                    const recipe = (GROCERY_RECIPES[meal.catalogId] || []).find((r) => r.title === meal.recipeTitle)
                    const extrasQties = recipe?.extras ? getExtrasQties(recipe.extras) : []
                    return (
                      <div key={i} className="rounded-xl bg-secondary p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                          <Icon className="size-3.5" /> {tt(meta.label)}
                        </div>
                        <div className="text-sm font-bold">{meal.recipeTitle}</div>
                        {qty && (
                          <div className="mt-0.5 text-[11px] font-bold text-[var(--ok)]">
                            {tt("Pour ce repas : ~{qty} de {food}", { qty: formatGroceryQty(qty.qty, qty.unit), food: meal.foodName })}
                          </div>
                        )}
                        <ol className="mt-1 space-y-0.5">
                          {(meal.steps || []).map((s, si) => (
                            <li key={si} className="flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
                              <span className="shrink-0 font-bold text-primary">{si + 1}.</span> {s}
                            </li>
                          ))}
                        </ol>
                        {extrasQties.length > 0 && (
                          <div className="mt-1.5 border-t border-border/50 pt-1.5">
                            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{tt("Avec :")}</div>
                            <ul className="space-y-0.5">
                              {extrasQties.map((e, ei) => (
                                <li key={ei} className="text-[11px] text-muted-foreground">
                                  · {e.name} <span className="font-semibold text-foreground">~{formatGroceryQty(e.qty, e.unit)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {recipe?.seasoning && (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            <span className="font-semibold">{tt("Assaisonnement :")}</span> {recipe.seasoning}
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/80">
                          <Target className="size-3" />
                          {tt("Vise ~{kcal} kcal pour ce repas", { kcal: target.kcal })} · {target.protein}g P · {target.carbs}g G · {target.fat}g L
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}

          {unplannedSlots.length > 0 && (
            <>
              <div className="mx-4 mb-1.5 mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--info)]">
                <UtensilsCrossed className="size-3.5" /> {tt("Repas hors planning")}
              </div>
              <p className="mx-4 mb-1.5 text-[12px] text-muted-foreground">
                {tt("Pas dans ton planning — si tu manges ces repas à l'extérieur, voici quoi viser.")}
              </p>
              <div className="mx-4 mb-3 space-y-2">
                {unplannedSlots.map((slot) => {
                  const meta = SLOT_META[slot]
                  const Icon = meta.icon
                  const target = slotTargets[slot]
                  return (
                    <div key={slot} className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)]">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--info)]">
                        <Icon className="size-3.5" /> {tt(meta.label)}
                      </div>
                      <p className="text-xs leading-relaxed text-secondary-foreground">{tt(getEatingOutTip(mode))}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--ok)]">
                        <Target className="size-3" />
                        {tt("Vise ~{kcal} kcal pour ce repas", { kcal: target.kcal })} · {target.protein}g P · {target.carbs}g G · {target.fat}g L
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {tips.length > 0 && (
            <>
              <div className="mx-4 mb-1.5 mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--wa)]">
                <Lightbulb className="size-3.5" /> {tt("Conseils de prép")}
              </div>
              <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)]">
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-secondary-foreground">
                      <span className="text-[var(--wa)]">•</span> {tt(tip)}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <div className="mx-4 mb-3">
            <button
              onClick={() => {
                if (confirm(tt("Régénérer le planning ?"))) clearPlan()
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-3 text-sm font-bold text-secondary-foreground"
            >
              <RefreshCw className="size-4" /> {tt("Régénérer")}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
