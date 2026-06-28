import { Lightbulb } from "lucide-react"
import { useStore } from "@/store/useStore"
import { getRecommendation, pickWOD } from "@/lib/engine"
import { PROG } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"

interface PplSession {
  id: string
  name: string
  color: string
}

const BLURB: Record<string, string> = {
  push: "Pectoraux, épaules, triceps. Développé et poussées verticales.",
  pull: "Dos en volume contrôlé, rows et tirages. Bon pour la posture.",
  legs: "Quadriceps, ischios, fessiers. La base de la force globale.",
}

export function RecommendationBlock() {
  const S = useStore()
  const start = useStore((s) => s.startSession)
  const { tt } = useI18n()
  const rec = getRecommendation(S)
  const sess = (PROG.sessions as PplSession[]).find((x) => x.id === rec.id)
  if (!sess) return null
  const wod = pickWOD(S, rec.id) as { name: string; type: string } | null
  const last = rec.days >= 99 ? tt("jamais fait") : `${tt("Dernier il y a")} ${rec.days}j`

  return (
    <>
      <SectionTitle>Recommandé aujourd'hui</SectionTitle>
      <button
        onClick={() => start(rec.id)}
        className="mx-4 mb-3 flex w-full items-stretch gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-sm)] transition-transform active:scale-[0.985]"
        style={{ borderLeft: `5px solid ${sess.color}` }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Lightbulb className="size-3.5" /> {tt("Reprise idéale")}
          </div>
          <div className="mt-0.5 text-xl font-black tracking-[1px]" style={{ color: sess.color }}>
            {sess.name}
          </div>
          <div className="mt-0.5 text-[13px] font-semibold text-secondary-foreground">
            {last}
            {wod ? ` — WOD : ${wod.name}` : ""}
          </div>
          <div className="mt-1 text-[13px] italic leading-snug text-muted-foreground">
            {tt(BLURB[rec.id] || "")}
          </div>
        </div>
        <span
          className="flex shrink-0 items-center rounded-xl px-4 text-sm font-extrabold text-white"
          style={{ background: sess.color }}
        >
          ▶
        </span>
      </button>
    </>
  )
}
