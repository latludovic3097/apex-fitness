/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useI18n } from "@/i18n/I18nProvider"
import {
  listObjectives,
  getObjective,
  generateProgram,
  machinesByCategory,
  MACHINE_CATEGORIES,
  MACHINES,
} from "@/data/fitstark-data"
import { cn } from "@/lib/utils"

const LEVELS = [
  { id: "beginner", label: "Débutant" },
  { id: "intermediate", label: "Intermédiaire" },
  { id: "advanced", label: "Avancé" },
]
const DURATIONS = [4, 6, 8, 10, 12]
const FREQS = [2, 3, 4, 5, 6]
const ALL_MACHINE_IDS: string[] = (MACHINES as { id: string }[]).map((m) => m.id)

export function ProgramWizardScreen() {
  const { lang } = useI18n()
  const pick = (o: { fr: string; en: string }) => (o ? o[lang] || o.fr : "")
  const navTo = useStore((s) => s.navTo)
  const setCustomProgram = useStore((s) => s.setCustomProgram)

  const [step, setStep] = useState(0)
  const [objId, setObjId] = useState<string | null>(null)
  const [methodId, setMethodId] = useState<string | null>(null)
  const [machineIds, setMachineIds] = useState<string[]>(ALL_MACHINE_IDS)
  const [duration, setDuration] = useState(8)
  const [frequency, setFrequency] = useState(3)
  const [level, setLevel] = useState("intermediate")

  const objectives = listObjectives() as any[]
  const obj = objId ? (getObjective(objId) as any) : null
  const method = obj?.methods?.find((m: any) => m.id === methodId) || null
  const grouped = machinesByCategory() as Record<string, any[]>

  function generate() {
    const prog = generateProgram({ objId, methodId, machineIds, duration, frequency, level })
    if (prog) {
      setCustomProgram(prog)
      navTo("home")
    }
  }

  const canNext =
    (step === 0 && objId) ||
    (step === 1 && methodId) ||
    step === 2 ||
    step === 3 ||
    step === 4

  return (
    <div className="pb-28">
      <header className="px-4 pb-2 pt-5">
        <button
          onClick={() => (step === 0 ? navTo("home") : setStep((s) => s - 1))}
          className="flex items-center gap-1 text-sm font-bold text-muted-foreground"
        >
          <ChevronLeft className="size-5" /> {step === 0 ? "Accueil" : "Retour"}
        </button>
        <h2 className="mt-2 text-[22px] font-extrabold tracking-tight">🧬 Programme perso IA</h2>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
      </header>

      {/* Étape 1 — Objectif */}
      {step === 0 && (
        <div className="px-4">
          <p className="mb-3 text-sm text-muted-foreground">Quel est ton objectif principal ?</p>
          <div className="space-y-2">
            {objectives.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setObjId(o.id)
                  setMethodId(null)
                  // auto-advance pour fluidifier le parcours (choix unique)
                  setTimeout(() => setStep(1), 180)
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border-[1.5px] p-3.5 text-left",
                  objId === o.id ? "border-primary bg-[var(--ac10)]" : "border-border bg-card",
                )}
              >
                <span className="text-2xl" style={{ color: o.color }}>
                  {o.icon}
                </span>
                <div className="min-w-0">
                  <div className="font-bold">{pick(o.name)}</div>
                  <div className="text-xs leading-snug text-muted-foreground">{pick(o.desc)}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground/70">{o.sources}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2 — Méthode */}
      {step === 1 && obj && (
        <div className="px-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Méthode validée pour « {pick(obj.name)} »
          </p>
          <div className="space-y-2">
            {obj.methods.map((m: any) => (
              <button
                key={m.id}
                onClick={() => {
                  setMethodId(m.id)
                  setTimeout(() => setStep(2), 180)
                }}
                className={cn(
                  "w-full rounded-2xl border-[1.5px] p-4 text-left",
                  methodId === m.id ? "border-primary bg-[var(--ac10)]" : "border-border bg-card",
                )}
              >
                <div className="font-bold">{pick(m.name)}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-secondary-foreground">{pick(m.desc)}</div>
                {m.intensity && (
                  <div className="mt-2 inline-block rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
                    {m.intensity}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 3 — Machines */}
      {step === 2 && (
        <div className="px-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ton matériel ({machineIds.length})</p>
            <div className="flex gap-2 text-xs font-bold">
              <button onClick={() => setMachineIds(ALL_MACHINE_IDS)} className="text-primary">
                Tout
              </button>
              <button onClick={() => setMachineIds([])} className="text-muted-foreground">
                Rien
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {Object.keys(grouped).map((catId) => {
              const cat = (MACHINE_CATEGORIES as any)[catId]
              const list = grouped[catId]
              if (!list?.length) return null
              const checked = list.filter((m) => machineIds.includes(m.id)).length
              return (
                <div
                  key={catId}
                  className="rounded-2xl border-[1.5px] border-border bg-card p-3.5 shadow-[var(--shadow-sm)]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold text-secondary-foreground">
                      {cat?.icon} {pick(cat)}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground">
                      {checked}/{list.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((m) => {
                      const on = machineIds.includes(m.id)
                      return (
                        <button
                          key={m.id}
                          onClick={() =>
                            setMachineIds((cur) =>
                              cur.includes(m.id) ? cur.filter((x) => x !== m.id) : [...cur, m.id],
                            )
                          }
                          className={cn(
                            "rounded-full border-[1.5px] px-3 py-1.5 text-xs font-semibold",
                            on ? "border-[var(--ok)] bg-[var(--ok10)] text-[var(--ok)]" : "border-border bg-card text-muted-foreground",
                          )}
                        >
                          {on ? "✓ " : ""}
                          {pick(m.name)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Étape 4 — Configuration */}
      {step === 3 && (
        <div className="px-4 space-y-5">
          <div>
            <div className="mb-2 text-sm font-bold">Durée du programme</div>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "flex-1 rounded-xl border-[1.5px] py-3 text-sm font-bold",
                    duration === d ? "border-primary bg-primary text-white" : "border-border bg-card",
                  )}
                >
                  {d}<span className="text-xs font-medium">sem</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold">Fréquence (séances/semaine)</div>
            <div className="flex gap-2">
              {FREQS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "flex-1 rounded-xl border-[1.5px] py-3 text-sm font-bold",
                    frequency === f ? "border-primary bg-primary text-white" : "border-border bg-card",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold">Niveau</div>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={cn(
                    "flex-1 rounded-xl border-[1.5px] py-3 text-xs font-bold",
                    level === l.id ? "border-primary bg-primary text-white" : "border-border bg-card",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Étape 5 — Récap */}
      {step === 4 && obj && method && (
        <div className="px-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]">
            <div className="text-center text-3xl" style={{ color: obj.color }}>
              {obj.icon}
            </div>
            <div className="mt-1 text-center text-lg font-black">{pick(obj.name)}</div>
            <div className="mt-0.5 text-center text-sm font-semibold text-primary">{pick(method.name)}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Recap value={`${duration}`} label="semaines" />
              <Recap value={`${frequency}×`} label="par sem" />
              <Recap value={`${machineIds.length}`} label="machines" />
            </div>
            <div className="mt-3 rounded-xl bg-secondary p-3 text-center text-xs text-muted-foreground">
              Progression linéaire +5%/semaine · deload automatique aux semaines 4 et 8
            </div>
          </div>
        </div>
      )}

      {/* Barre d'action */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-border bg-card p-3">
        {step < 4 ? (
          <button
            onClick={() => canNext && setStep((s) => s + 1)}
            disabled={!canNext}
            className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-extrabold text-primary-foreground disabled:opacity-40"
          >
            Continuer
          </button>
        ) : (
          <button
            onClick={generate}
            className="w-full rounded-xl bg-[var(--ok)] py-3.5 text-[15px] font-extrabold text-white"
          >
            🧬 Générer mon programme
          </button>
        )}
      </div>
    </div>
  )
}

function Recap({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <div className="font-mono text-2xl font-black text-foreground">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
