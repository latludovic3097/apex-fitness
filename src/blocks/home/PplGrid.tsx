import { useStore } from "@/store/useStore"
import { getRecommendation } from "@/lib/engine"
import { PROG, MN } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"

interface PplSession {
  id: string
  name: string
  color: string
  muscles: string[]
}

export function PplGrid() {
  const S = useStore()
  const start = useStore((s) => s.startSession)
  const rec = getRecommendation(S)
  const { tt } = useI18n()
  const sessions = (PROG.sessions as PplSession[]).filter((s) =>
    ["push", "pull", "legs"].includes(s.id),
  )

  return (
    <>
      <SectionTitle>Programme PPL</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-3 gap-2">
          {sessions.map((s) => {
            const isRec = rec.id === s.id
            const lastDone = S.hist.find((h) => h.sessionId === s.id)
            const daysAgo = lastDone
              ? Math.floor((Date.now() - new Date(lastDone.date).getTime()) / 864e5)
              : null
            return (
              <button
                key={s.id}
                onClick={() => start(s.id)}
                className="flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-secondary px-2 pb-3 pt-3.5 text-center transition-transform active:scale-[0.97]"
                style={{ borderTop: `3px solid ${s.color}` }}
              >
                <span className="text-lg font-extrabold tracking-[1.5px]" style={{ color: s.color }}>
                  {s.name}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {isRec
                    ? tt("★ recommandé")
                    : daysAgo === null
                      ? tt("jamais")
                      : tt("il y a {n}j", { n: daysAgo })}
                </span>
                <span className="text-[10px] text-muted-foreground/80">
                  {s.muscles.map((m) => tt(MN[m] || m)).slice(0, 2).join(" · ")}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
