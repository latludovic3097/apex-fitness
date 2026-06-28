import { useState } from "react"
import { X, ShoppingCart, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { nutCalc, PROTEINS_DB } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { LineChart } from "@/components/LineChart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/i18n/I18nProvider"

const ACTIVITY = [
  { v: 1.2, label: "Sédentaire" },
  { v: 1.375, label: "Léger" },
  { v: 1.55, label: "Modéré" },
  { v: 1.725, label: "Intense" },
  { v: 1.9, label: "Athlète" },
]
const GOALS = [
  { v: -500, label: "Sèche -500" },
  { v: -300, label: "Déficit -300" },
  { v: 0, label: "Maintien" },
  { v: 300, label: "Prise +300" },
]

interface FoodItem {
  n: string
  pt: string
  p: number
  p100: number
}
interface FoodCategory {
  cat: string
  color: string
  items: FoodItem[]
}

export function NutritionScreen() {
  const nut = useStore((s) => s.nut)
  const patchNut = useStore((s) => s.patchNut)
  const logWeight = useStore((s) => s.logWeight)
  const delWeight = useStore((s) => s.delWeight)
  const navTo = useStore((s) => s.navTo)
  const groceryCount = useStore((s) => s.groceryList.items.length)
  const { tt } = useI18n()
  const r = nutCalc(nut)
  const [wInput, setWInput] = useState("")

  // 15 dernières pesées en ordre chronologique pour la courbe (les plus anciennes
  // à gauche, les plus récentes à droite — sens de lecture naturel).
  const chartData = [...nut.weightLog]
    .slice(0, 15)
    .reverse()
    .map((w) => ({
      label: new Date(w.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      value: w.weight,
    }))

  const macroCards = [
    { label: "Protéines", g: r.protein, kcal: r.protein * 4, color: "var(--ac)" },
    { label: "Lipides", g: r.fat, kcal: r.fat * 9, color: "var(--wa)" },
    { label: "Glucides", g: r.carbs, kcal: r.carbs * 4, color: "var(--info)" },
  ]

  return (
    <div className="pb-4">
      <PageHeader title="Nutrition" />

      {/* Cible journalière */}
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-5 text-center shadow-[var(--shadow-sm)]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Cible journalière
        </div>
        <div className="mt-1 font-mono text-5xl font-black text-foreground">{r.target}</div>
        <div className="text-sm font-semibold text-muted-foreground">kcal / jour</div>
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <span>BMR {r.bmr}</span>
          <span>·</span>
          <span>TDEE {r.tdee}</span>
          <span>·</span>
          <span>{Number(r.weeklyChange) >= 0 ? "+" : ""}{r.weeklyChange} kg/sem</span>
        </div>
      </div>

      {/* Macros */}
      <div className="mx-4 mb-3 grid grid-cols-3 gap-2">
        {macroCards.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-[var(--shadow-sm)]">
            <div className="font-mono text-2xl font-black" style={{ color: m.color }}>
              {m.g}
              <span className="text-xs">g</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {m.label}
            </div>
            <div className="text-[10px] text-muted-foreground/80">{m.kcal} kcal</div>
          </div>
        ))}
      </div>

      {/* Liste de courses intelligente */}
      <button
        onClick={() => navTo("grocery")}
        className="mx-4 mb-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-sm)] transition-transform active:scale-[0.985]"
        style={{ borderLeft: "5px solid #8B5CF6" }}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/12 text-[#8B5CF6]">
          <ShoppingCart className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-extrabold">{tt("Liste de courses intelligente")}</div>
          <div className="text-xs text-muted-foreground">
            {groceryCount > 0
              ? `${groceryCount} ${tt("articles")}`
              : tt("Générée selon ton objectif, la saison et tes goûts")}
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>

      {/* Profil */}
      <SectionTitle>Ton profil</SectionTitle>
      <div className="mx-4 mb-3 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        <Field label="Poids (kg)" value={nut.weight} onChange={(v) => patchNut({ weight: v })} />
        <Field label="Taille (cm)" value={nut.height} onChange={(v) => patchNut({ height: v })} />
        <Field label="Âge" value={nut.age} onChange={(v) => patchNut({ age: v })} />
        <div className="space-y-1.5">
          <Label>Sexe</Label>
          <div className="flex gap-1.5">
            {(["M", "F"] as const).map((s) => (
              <button
                key={s}
                onClick={() => patchNut({ sex: s })}
                className={`flex-1 rounded-lg border-[1.5px] py-2 text-sm font-bold ${
                  nut.sex === s ? "border-primary bg-primary text-white" : "border-border bg-card"
                }`}
              >
                {s === "M" ? "Homme" : "Femme"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activité */}
      <SectionTitle>Niveau d'activité</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {ACTIVITY.map((a) => (
            <button
              key={a.v}
              onClick={() => patchNut({ activity: a.v })}
              className={`inline-flex min-h-10 shrink-0 items-center rounded-full border-[1.5px] px-3.5 text-[13px] font-bold ${
                nut.activity === a.v ? "border-transparent bg-primary text-white" : "border-border bg-secondary text-secondary-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Objectif kcal */}
      <SectionTitle>Objectif</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-4 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.v}
              onClick={() => patchNut({ goal: g.v })}
              className={`rounded-xl border-[1.5px] py-2.5 text-xs font-bold ${
                nut.goal === g.v ? "border-[var(--ok)] bg-[var(--ok)] text-white" : "border-border bg-secondary text-secondary-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pesée */}
      <SectionTitle>Suivi du poids</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Pesée du jour
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="ex: 75,4"
            value={wInput}
            onChange={(e) => setWInput(e.target.value)}
            className="text-center font-mono text-base"
          />
          <button
            onClick={() => {
              const w = parseFloat(wInput.replace(",", "."))
              if (w >= 30 && w <= 250) {
                logWeight(w)
                setWInput("")
              } else {
                alert("Saisis un poids valide entre 30 et 250 kg (ex: 75.4 ou 75,4)")
              }
            }}
            className="shrink-0 rounded-lg bg-[var(--ok)] px-4 text-sm font-bold text-white"
          >
            Enregistrer
          </button>
        </div>

        {/* Courbe d'évolution */}
        {chartData.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Évolution sur les {chartData.length} dernières pesées
            </div>
            <LineChart data={chartData} color="#10b981" unit="kg" />
          </div>
        )}

        {/* Liste des pesées avec date + heure + supprimer */}
        {nut.weightLog.length > 0 ? (
          <div className="mt-3 border-t border-border pt-2">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Historique
            </div>
            {nut.weightLog.slice(0, 8).map((w, i) => {
              const d = new Date(w.date)
              const dateLabel = d.toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })
              const timeLabel = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              return (
                <div
                  key={`${w.date}-${i}`}
                  className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
                >
                  <div className="min-w-0 flex-1 text-secondary-foreground">
                    <span className="capitalize">{dateLabel}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">· {timeLabel}</span>
                  </div>
                  <span className="font-mono text-base font-extrabold">{w.weight} kg</span>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer cette pesée ?")) delWeight(i)
                    }}
                    aria-label="Supprimer cette pesée"
                    className="shrink-0 text-muted-foreground hover:text-primary"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 border-t border-border pt-3 text-center text-xs italic text-muted-foreground">
            Aucune pesée enregistrée.
          </p>
        )}
      </div>

      {/* Aliments protéinés (par catégorie) */}
      <SectionTitle>Aliments riches en protéines</SectionTitle>
      <div className="mx-4 mb-3 space-y-3">
        {(PROTEINS_DB as FoodCategory[]).map((cat) => (
          <div
            key={cat.cat}
            className="rounded-2xl border border-border bg-card p-3.5 shadow-[var(--shadow-sm)]"
            style={{ borderLeft: `4px solid ${cat.color}` }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: cat.color }}>
              {cat.cat}
            </div>
            <div className="space-y-1.5">
              {cat.items.slice(0, 5).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-secondary px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{f.n}</div>
                    <div className="text-[11px] text-muted-foreground">{f.pt}</div>
                  </div>
                  <span className="ml-2 shrink-0 font-mono text-sm font-black text-primary">{f.p}g</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  )
}
