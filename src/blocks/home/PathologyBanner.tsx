import { useStore } from "@/store/useStore"
import type { PathologyId } from "@/store/types"
import { useI18n } from "@/i18n/I18nProvider"

const LABELS: Record<PathologyId, { emoji: string; name: string; rule: string }> = {
  l5: { emoji: "🦴", name: "Lombaires L5-S1", rule: "Dos neutre, charnière de hanche, McGill Big 3" },
  shoulder: { emoji: "💪", name: "Épaules", rule: "Amplitude contrôlée, pas de press derrière nuque" },
  knee: { emoji: "🦵", name: "Genoux", rule: "Pas de flexion profonde chargée brutale" },
  wrist: { emoji: "✋", name: "Poignets", rule: "Prise neutre, évite l'hyperextension" },
  elbow: { emoji: "🦴", name: "Coudes", rule: "Excentriques lents (HSR), évite la surcharge" },
}

export function PathologyBanner() {
  const paths = useStore((s) => s.health.pathologies)
  const { tt } = useI18n()
  if (!paths.length) return null

  return (
    <details className="mx-4 mb-3.5 overflow-hidden rounded-xl border border-[var(--ok)] bg-[var(--ok10)]" open>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 px-3.5 text-[13px] font-bold text-[var(--ok)] [&::-webkit-details-marker]:hidden">
        <span className="size-2.5 shrink-0 rounded-full bg-[var(--ok)] shadow-[0_0_0_4px_var(--ok10)]" />
        {tt("Mode protection actif —")} {paths.length}{" "}
        {tt(paths.length > 1 ? "zones sensibles" : "zone sensible")}
      </summary>
      <div className="px-3.5 pb-3.5 pt-1 text-[13px] leading-relaxed text-secondary-foreground">
        {paths.map((p) => {
          const l = LABELS[p]
          if (!l) return null
          return (
            <div key={p} className="mb-1.5 last:mb-0">
              <b className="font-semibold text-foreground">
                {l.emoji} {tt(l.name)}
              </b>{" "}
              — {tt(l.rule)}
            </div>
          )
        })}
      </div>
    </details>
  )
}
