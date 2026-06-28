import { useMemo, useState } from "react"
import { ChevronLeft, Pencil, RefreshCw, Trash2, Plus, ThumbsUp, ThumbsDown, ChefHat, Coffee, Sun, Apple, Moon } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { useI18n } from "@/i18n/I18nProvider"
import { GROCERY_CATALOG, type FoodCategory } from "@/data/groceryCatalog"
import { GROCERY_RECIPES, type MealTime } from "@/data/groceryRecipes"
import { getGroceryAlternatives, formatGroceryQty, getIngredientQty, getExtrasQties } from "@/lib/grocery"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { GroceryItem, GroceryPrefs } from "@/store/types"

const CATEGORY_ORDER: FoodCategory[] = ["protein", "carbs", "fat", "veg", "fruit", "dairy", "other"]
const CATEGORY_META: Record<FoodCategory, { emoji: string; label: string; color: string }> = {
  protein: { emoji: "🥩", label: "Protéines", color: "var(--ac)" },
  carbs: { emoji: "🍞", label: "Glucides", color: "var(--info)" },
  fat: { emoji: "🥑", label: "Lipides", color: "var(--wa)" },
  veg: { emoji: "🥦", label: "Légumes", color: "#2A9D8F" },
  fruit: { emoji: "🍎", label: "Fruits", color: "#E76F51" },
  dairy: { emoji: "🥛", label: "Laitier", color: "#457B9D" },
  other: { emoji: "🧄", label: "Basiques", color: "#8B5CF6" },
}
const MEAL_META: Record<MealTime, { icon: typeof Coffee; label: string }> = {
  breakfast: { icon: Coffee, label: "Petit-déjeuner" },
  lunch: { icon: Sun, label: "Déjeuner" },
  snack: { icon: Apple, label: "Collation" },
  dinner: { icon: Moon, label: "Dîner" },
}

export function GroceryListScreen() {
  const navTo = useStore((s) => s.navTo)
  const { tt } = useI18n()
  const prefs = useStore((s) => s.groceryPrefs)
  const list = useStore((s) => s.groceryList)
  const setPrefs = useStore((s) => s.setGroceryPrefs)
  const togglePref = useStore((s) => s.toggleGroceryPref)
  const generate = useStore((s) => s.generateGroceryList)
  const toggleItem = useStore((s) => s.toggleGroceryItem)
  const updateItem = useStore((s) => s.updateGroceryItem)
  const removeItem = useStore((s) => s.removeGroceryItem)
  const swapItem = useStore((s) => s.swapGroceryItem)
  const addItem = useStore((s) => s.addGroceryItem)
  const clearList = useStore((s) => s.clearGroceryList)

  const [editId, setEditId] = useState<string | null>(null)
  const [swapId, setSwapId] = useState<string | null>(null)
  const [recipeId, setRecipeId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const checkedCount = list.items.filter((i) => i.checked).length
  const pct = list.items.length ? Math.round((checkedCount / list.items.length) * 100) : 0

  const grouped = useMemo(() => {
    const m: Record<string, GroceryItem[]> = {}
    list.items.forEach((i) => {
      if (!m[i.category]) m[i.category] = []
      m[i.category].push(i)
    })
    return m
  }, [list.items])

  return (
    <div className="pb-4">
      <button onClick={() => navTo("nutrition")} className="flex items-center gap-1 px-4 pt-5 text-sm font-bold text-muted-foreground">
        <ChevronLeft className="size-5" /> {tt("Nutrition")}
      </button>
      <PageHeader title="Liste de courses" />

      {list.items.length === 0 ? (
        <ConfigPanel
          prefs={prefs}
          setPrefs={setPrefs}
          togglePref={togglePref}
          onGenerate={() => generate()}
        />
      ) : (
        <>
          <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">
                {checkedCount}/{list.items.length} {tt("articles")}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-border">
              <div className="h-1.5 rounded-full bg-[var(--ok)] transition-[width]" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((category) => {
            const meta = CATEGORY_META[category]
            return (
              <div key={category}>
                <div className="mx-4 mb-1.5 mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                  <span>{meta.emoji}</span> {tt(meta.label)}
                </div>
                <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
                  <div className="space-y-1.5">
                    {grouped[category].map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl bg-secondary px-3 py-2.5",
                          item.checked && "opacity-50",
                        )}
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          aria-label={tt("Cocher")}
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-black text-white",
                            item.checked ? "border-[var(--ok)] bg-[var(--ok)]" : "border-muted-foreground bg-transparent",
                          )}
                        >
                          {item.checked ? "✓" : ""}
                        </button>
                        <div className={cn("min-w-0 flex-1", item.checked && "line-through")}>
                          <div className="truncate text-sm font-semibold">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{formatGroceryQty(item.qty, item.unit)}</div>
                        </div>
                        {item.catalogId && GROCERY_RECIPES[item.catalogId] && (
                          <button
                            onClick={() => setRecipeId(item.id)}
                            aria-label={tt("Idées repas")}
                            className="shrink-0 text-muted-foreground hover:text-primary"
                          >
                            <ChefHat className="size-4" />
                          </button>
                        )}
                        <button onClick={() => setEditId(item.id)} aria-label={tt("Modifier")} className="shrink-0 text-muted-foreground hover:text-primary">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => setSwapId(item.id)} aria-label={tt("Remplacer")} className="shrink-0 text-muted-foreground hover:text-primary">
                          <RefreshCw className="size-4" />
                        </button>
                        <button onClick={() => removeItem(item.id)} aria-label={tt("Supprimer")} className="shrink-0 text-muted-foreground hover:text-primary">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="mx-4 mb-3">
            <button
              onClick={() => navTo("mealplan")}
              className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-extrabold text-primary-foreground shadow-[var(--shadow-sm)]"
            >
              📅 {tt("Planifier mes repas")}
            </button>
          </div>

          <div className="mx-4 mb-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card py-3 text-sm font-bold text-primary"
            >
              <Plus className="size-4" /> {tt("Ajouter un aliment")}
            </button>
            <button
              onClick={() => {
                if (confirm(tt("Régénérer la liste ? Les cases cochées seront perdues."))) clearList()
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-3 text-sm font-bold text-secondary-foreground"
            >
              <RefreshCw className="size-4" /> {tt("Régénérer")}
            </button>
          </div>
        </>
      )}

      {editId && (
        <EditItemDialog
          item={list.items.find((i) => i.id === editId) || null}
          onClose={() => setEditId(null)}
          onSave={(patch) => {
            updateItem(editId, patch)
            setEditId(null)
          }}
        />
      )}

      {swapId && (
        <SwapItemDialog
          item={list.items.find((i) => i.id === swapId) || null}
          currentCatalogIds={list.items.map((i) => i.catalogId).filter(Boolean) as string[]}
          onClose={() => setSwapId(null)}
          onSwap={(replacement) => {
            swapItem(swapId, replacement)
            setSwapId(null)
          }}
        />
      )}

      {recipeId && (
        <RecipesDialog
          item={list.items.find((i) => i.id === recipeId) || null}
          onClose={() => setRecipeId(null)}
        />
      )}

      <AddItemDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addItem} />
    </div>
  )
}

function ConfigPanel({
  prefs,
  setPrefs,
  togglePref,
  onGenerate,
}: {
  prefs: GroceryPrefs
  setPrefs: (p: Partial<GroceryPrefs>) => void
  togglePref: (catalogId: string, kind: "liked" | "disliked") => void
  onGenerate: () => void
}) {
  const { tt } = useI18n()

  return (
    <>
      <p className="mx-4 mb-3 text-[13px] text-muted-foreground">
        {tt(
          "Génère une liste de courses adaptée à ton objectif nutrition, à la saison et à tes préférences. Tu pourras tout modifier ensuite.",
        )}
      </p>

      <div className="mx-4 mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tt("Nombre de jours")}</div>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="flex gap-2">
          {[3, 5, 7, 10, 14].map((d) => (
            <button
              key={d}
              onClick={() => setPrefs({ days: d })}
              className={cn(
                "flex-1 rounded-xl border-[1.5px] py-2.5 text-sm font-bold",
                prefs.days === d ? "border-primary bg-primary text-white" : "border-border bg-secondary text-secondary-foreground",
              )}
            >
              {d}j
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tt("Hémisphère (saisonnalité)")}</div>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="flex gap-2">
          {(["nord", "sud"] as const).map((h) => (
            <button
              key={h}
              onClick={() => setPrefs({ hemisphere: h })}
              className={cn(
                "flex-1 rounded-xl border-[1.5px] py-2.5 text-sm font-bold",
                prefs.hemisphere === h ? "border-primary bg-primary text-white" : "border-border bg-secondary text-secondary-foreground",
              )}
            >
              {h === "nord" ? tt("Hémisphère nord") : tt("Hémisphère sud")}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tt("Tes préférences")}</div>
      <p className="mx-4 mb-3 text-[12px] text-muted-foreground">{tt("Touche une fois pour aimer 👍, deux fois pour éviter 👎.")}</p>
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category]
        const catalogItems = GROCERY_CATALOG.filter((i) => i.category === category)
        return (
          <div key={category} className="mx-4 mb-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)]">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>
              <span>{meta.emoji}</span> {tt(meta.label)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {catalogItems.map((item) => {
                const liked = prefs.likedIds.includes(item.id)
                const disliked = prefs.dislikedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => togglePref(item.id, liked ? "disliked" : "liked")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold",
                      liked && "border-[var(--ok)] bg-[var(--ok10)] text-[var(--ok)]",
                      disliked && "border-primary bg-[var(--ac10)] text-primary line-through",
                      !liked && !disliked && "border-border bg-secondary text-secondary-foreground",
                    )}
                  >
                    {liked && <ThumbsUp className="size-3" />}
                    {disliked && <ThumbsDown className="size-3" />}
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="mx-4 mb-3">
        <button
          onClick={onGenerate}
          className="w-full rounded-xl bg-[var(--ok)] py-3.5 text-[15px] font-extrabold text-white shadow-[var(--shadow-sm)]"
        >
          🛒 {tt("Générer ma liste")}
        </button>
      </div>
    </>
  )
}

function EditItemDialog({
  item,
  onClose,
  onSave,
}: {
  item: GroceryItem | null
  onClose: () => void
  onSave: (patch: Partial<GroceryItem>) => void
}) {
  const { tt } = useI18n()
  const [name, setName] = useState(item?.name || "")
  const [qty, setQty] = useState(item?.qty || 0)
  const [unit, setUnit] = useState(item?.unit || "g")

  if (!item) return null

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{tt("Modifier l'aliment")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="gi-name">{tt("Nom")}</Label>
            <Input id="gi-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gi-qty">{tt("Quantité")}</Label>
              <Input id="gi-qty" type="number" inputMode="decimal" value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gi-unit">{tt("Unité")}</Label>
              <Input id="gi-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
          </div>
          <button
            onClick={() => onSave({ name, qty, unit })}
            className="w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
          >
            {tt("Enregistrer")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SwapItemDialog({
  item,
  currentCatalogIds,
  onClose,
  onSwap,
}: {
  item: GroceryItem | null
  currentCatalogIds: string[]
  onClose: () => void
  onSwap: (replacement: GroceryItem) => void
}) {
  const { tt } = useI18n()
  if (!item) return null
  const alternatives = getGroceryAlternatives(item.category, currentCatalogIds)

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{tt("Remplacer")} {item.name}</DialogTitle>
          <DialogDescription>{tt("Choisis une alternative dans la même catégorie.")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {alternatives.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{tt("Aucune alternative disponible.")}</p>
          ) : (
            alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() =>
                  onSwap({
                    id: item.id,
                    catalogId: alt.id,
                    name: alt.name,
                    category: alt.category,
                    qty: item.qty,
                    unit: alt.unit,
                    checked: item.checked,
                  })
                }
                className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-left text-sm font-semibold"
              >
                {alt.name}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RecipesDialog({ item, onClose }: { item: GroceryItem | null; onClose: () => void }) {
  const { tt } = useI18n()
  if (!item || !item.catalogId) return null
  const recipes = GROCERY_RECIPES[item.catalogId] || []

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="size-5 text-primary" /> {item.name}
          </DialogTitle>
          <DialogDescription>{tt("Idées de préparation pour ta semaine.")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          {recipes.map((r, i) => {
            const meal = MEAL_META[r.meal]
            const Icon = meal.icon
            const qty = getIngredientQty(item.catalogId!)
            const extrasQties = r.extras ? getExtrasQties(r.extras) : []
            return (
              <div key={i} className="rounded-xl border border-border bg-secondary p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{r.title}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--ac10)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    <Icon className="size-3" /> {tt(meal.label)}
                  </span>
                </div>
                {qty && (
                  <div className="mb-1.5 text-[11px] font-bold text-[var(--ok)]">
                    {tt("Portion type : ~{qty}", { qty: formatGroceryQty(qty.qty, qty.unit) })}
                  </div>
                )}
                <ol className="space-y-1">
                  {(r.steps || []).map((s, si) => (
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
                {r.seasoning && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    <span className="font-semibold">{tt("Assaisonnement :")}</span> {r.seasoning}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddItemDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (item: { name: string; category: string; qty: number; unit: string }) => void
}) {
  const { tt } = useI18n()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<FoodCategory>("other")
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState("pièce")

  function submit() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), category, qty, unit })
    setName("")
    setQty(1)
    setUnit("pièce")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{tt("Ajouter un aliment")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="add-name">{tt("Nom")}</Label>
            <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={tt("ex : Pain au levain")} />
          </div>
          <div className="space-y-1.5">
            <Label>{tt("Catégorie")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold",
                    category === c ? "border-primary bg-[var(--ac10)] text-primary" : "border-border bg-secondary text-secondary-foreground",
                  )}
                >
                  {CATEGORY_META[c].emoji} {tt(CATEGORY_META[c].label)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-qty">{tt("Quantité")}</Label>
              <Input id="add-qty" type="number" inputMode="decimal" value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-unit">{tt("Unité")}</Label>
              <Input id="add-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
          </div>
          <button onClick={submit} className="w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-primary-foreground">
            {tt("Ajouter")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
