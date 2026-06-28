import { useStore } from "@/store/useStore"
import { PHASES } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"
import { cn } from "@/lib/utils"

interface Phase {
  id: string
  name: string
  color: string
  reps: string
  rest: number
  desc: string
}

export function PeriodizationBlock() {
  const phase = useStore((s) => s.phase)
  const setPhase = useStore((s) => s.setPhase)
  const { tt } = useI18n()
  const phases = PHASES as Phase[]

  return (
    <>
      <SectionTitle>Programme de base</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="flex gap-2">
          {phases.map((p, i) => {
            const active = phase === i
            return (
              <button
                key={p.id}
                onClick={() => setPhase(i)}
                className={cn(
                  "flex-1 rounded-xl border p-3 text-center transition-colors",
                  active ? "text-white" : "border-border bg-secondary text-foreground",
                )}
                style={active ? { background: p.color, borderColor: p.color } : undefined}
              >
                <div className="text-sm font-extrabold">{tt(p.name)}</div>
                <div className={cn("mt-0.5 text-[11px] font-medium", active ? "text-white/85" : "text-muted-foreground")}>
                  {p.reps} {tt("reps")} · {p.rest}s
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
