import { useState } from "react"
import { useStore, completeOnboarding } from "@/store/useStore"
import { Logo } from "@/components/Logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { GoalId, PathologyId } from "@/store/types"

const PATHS: { id: PathologyId; emoji: string; label: string }[] = [
  { id: "l5", emoji: "🦴", label: "Lombaires (L5-S1)" },
  { id: "shoulder", emoji: "💪", label: "Épaules" },
  { id: "knee", emoji: "🦵", label: "Genoux" },
  { id: "wrist", emoji: "✋", label: "Poignets" },
  { id: "elbow", emoji: "🦴", label: "Coudes" },
]
const GOALS: { id: GoalId; emoji: string; label: string; desc: string }[] = [
  { id: "force", emoji: "💪", label: "Prendre de la force", desc: "Lourd, 4-6 reps" },
  { id: "muscle", emoji: "🔥", label: "Gagner du muscle", desc: "Modéré, 8-12 reps" },
  { id: "lean", emoji: "🌿", label: "M'affiner", desc: "Volume + cardio Z2" },
  { id: "rehab", emoji: "🦴", label: "Reprise post-blessure", desc: "Léger, 15-20 reps" },
]

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const patchNut = useStore((s) => s.patchNut)
  const patchHealth = useStore((s) => s.patchHealth)
  const setGoal = useStore((s) => s.setGoal)
  const nut = useStore((s) => s.nut)
  const [step, setStep] = useState(0)
  const [paths, setPaths] = useState<PathologyId[]>(["l5"])
  const [goal, setGoalLocal] = useState<GoalId>("muscle")

  function finish() {
    patchHealth({ pathologies: paths })
    setGoal(goal)
    completeOnboarding()
    onComplete()
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-10">
      <div className="mb-6 text-center">
        <Logo className="text-3xl" />
        <div className="mt-1 text-sm text-muted-foreground">Étape {step + 1} / 4</div>
        <div className="mx-auto mt-3 flex max-w-[200px] gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-extrabold">⚕️ Avertissement médical</h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">
              FITStark t'aide à structurer ton entraînement mais{" "}
              <b>ne remplace pas un avis médical</b>, surtout en cas de pathologie. En cas de
              douleur, arrête immédiatement et consulte un professionnel de santé.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-lg font-extrabold">Ton profil</h2>
            <div className="mb-3 flex gap-2">
              {(["M", "F"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => patchNut({ sex: s })}
                  className={cn(
                    "flex-1 rounded-xl border-[1.5px] py-2.5 text-sm font-bold",
                    nut.sex === s ? "border-primary bg-primary text-white" : "border-border bg-card",
                  )}
                >
                  {s === "M" ? "Homme" : "Femme"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ProfileField label="Poids" value={nut.weight} onChange={(v) => patchNut({ weight: v })} />
              <ProfileField label="Taille" value={nut.height} onChange={(v) => patchNut({ height: v })} />
              <ProfileField label="Âge" value={nut.age} onChange={(v) => patchNut({ age: v })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-extrabold">🏥 Tes zones sensibles</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              L'app remplace automatiquement les exercices à risque. Aucune ? Laisse vide.
            </p>
            <div className="mt-3 space-y-2">
              {PATHS.map((p) => {
                const active = paths.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      setPaths((cur) =>
                        cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id],
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border-[1.5px] px-4 py-3 text-left font-semibold",
                      active ? "border-[var(--ok)] bg-[var(--ok10)]" : "border-border bg-card",
                    )}
                  >
                    <span>
                      {p.emoji} {p.label}
                    </span>
                    {active && <span className="text-[var(--ok)]">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-lg font-extrabold">🎯 Ton objectif</h2>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoalLocal(g.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left",
                    goal === g.id ? "border-primary bg-[var(--ac10)]" : "border-border bg-card",
                  )}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <div className="font-bold">{g.label}</div>
                    <div className="text-xs text-muted-foreground">{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-border bg-secondary px-5 py-3.5 text-sm font-bold text-secondary-foreground"
          >
            ←
          </button>
        )}
        <button
          onClick={() => (step < 3 ? setStep((s) => s + 1) : finish())}
          className="flex-1 rounded-xl bg-primary py-3.5 text-[15px] font-extrabold text-primary-foreground"
        >
          {step === 0 ? "J'accepte et je continue" : step < 3 ? "Continuer" : "🏋️ C'est parti !"}
        </button>
      </div>
    </div>
  )
}

function ProfileField({
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
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  )
}
