import { ChevronLeft, Footprints, Waves, Bike } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { CardioState } from "@/store/types"

const MODES = [
  { id: "run" as const, icon: Footprints, label: "Course" },
  { id: "swim" as const, icon: Waves, label: "Nage" },
  { id: "bike" as const, icon: Bike, label: "Vélo" },
]

export function CardioScreen() {
  const navTo = useStore((s) => s.navTo)
  const cardio = useStore((s) => s.cardio)
  const patchCardio = useStore((s) => s.patchCardio)
  const logManualSession = useStore((s) => s.logManualSession)

  const num = (k: keyof CardioState, label: string, unit?: string) => (
    <div className="space-y-1.5">
      <Label>
        {label}
        {unit ? ` (${unit})` : ""}
      </Label>
      <Input
        type="number"
        inputMode="decimal"
        value={cardio[k] as number}
        onChange={(e) => patchCardio({ [k]: parseFloat(e.target.value) || 0 } as Partial<CardioState>)}
      />
    </div>
  )

  return (
    <div className="pb-4">
      <button onClick={() => navTo("home")} className="flex items-center gap-1 px-4 pt-5 text-sm font-bold text-muted-foreground">
        <ChevronLeft className="size-5" /> Accueil
      </button>
      <PageHeader title="Cardio" />

      {/* Mode */}
      <div className="mx-4 mb-3 grid grid-cols-3 gap-2">
        {MODES.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => patchCardio({ mode: id })}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-2xl border-[1.5px] py-4 text-sm font-bold",
              cardio.mode === id ? "border-[var(--ok)] bg-[var(--ok10)] text-[var(--ok)]" : "border-border bg-card text-secondary-foreground",
            )}
          >
            <Icon className="size-6" />
            {label}
          </button>
        ))}
      </div>

      {/* Paramètres selon le mode */}
      <div className="mx-4 mb-3 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        {num("duration", "Durée", "min")}
        {cardio.mode === "run" && (
          <>
            {num("speed", "Vitesse", "km/h")}
            {num("incline", "Pente", "%")}
          </>
        )}
        {cardio.mode === "swim" && num("distance", "Distance", "m")}
        {cardio.mode === "bike" && (
          <>
            {num("resistance", "Résistance")}
            {num("incline", "Pente", "%")}
          </>
        )}
      </div>

      <div className="mx-4 rounded-2xl bg-[var(--ok10)] px-4 py-3 text-[13px] leading-relaxed text-[var(--ok)]">
        💡 Pour l'objectif « M'affiner » : vise 2-3 séances de cardio Z2 (60-70 % FCmax) par semaine
        en complément du PPL.
      </div>

      <div className="mx-4 mt-3">
        <button
          onClick={() =>
            logManualSession({
              sessionId: "cardio",
              sessionName: `Cardio ${MODES.find((m) => m.id === cardio.mode)?.label}`,
              duration: cardio.duration,
              exercises: [],
            })
          }
          className="w-full rounded-xl bg-[var(--ok)] py-3.5 text-[15px] font-extrabold text-white shadow-[var(--shadow-sm)]"
        >
          ✓ Enregistrer la séance cardio
        </button>
      </div>
    </div>
  )
}
