/* eslint-disable @typescript-eslint/no-explicit-any */
import { Check } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useI18n } from "@/i18n/I18nProvider"
import { computeCustomWeekPlan, DAY_SHORTS } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { cn } from "@/lib/utils"

export function CustomProgramBlock() {
  const { lang, tt } = useI18n()
  const prog = useStore((s) => s.customProgram)
  const hist = useStore((s) => s.hist)
  const start = useStore((s) => s.startCustomSession)
  const navTo = useStore((s) => s.navTo)
  if (!prog) return null

  const plan = computeCustomWeekPlan(prog, hist) as any
  if (!plan) return null
  const name = (prog.methodName as any)?.[lang] || (prog.methodName as any)?.fr || "Programme perso"
  // Séances faites cette semaine, pour le statut ✓ du sélecteur libre (indépendant du planning auto).
  const doneThisWeek = new Set(
    hist
      .filter((h: any) => h.sessionId === "custom_program" && h._cp && h._cp.weekIdx === plan.currentWeek)
      .map((h: any) => h._cp.sessIdx),
  )

  return (
    <>
      <SectionTitle>🧬 Mon programme — {name}</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-[#8B5CF6]/40 bg-card p-3.5 shadow-[var(--shadow-sm)]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-[#8B5CF6]">
            {tt("Semaine")} {plan.currentWeek}/{plan.totalWeeks}
          </span>
          {plan.isDeload && (
            <span className="rounded-full bg-[var(--info10)] px-2.5 py-1 text-[11px] font-bold text-[var(--info)]">
              🛌 {tt("Deload")}
            </span>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {plan.days.map((d: any, i: number) => {
            const isSession = d.sess === "cp_session"
            const clickable = d.status === "today" && isSession
            const done = d.status === "done"
            const Tag: any = clickable ? "button" : "div"
            return (
              <Tag
                key={i}
                onClick={clickable ? () => start(d.sessIdx) : undefined}
                className={cn(
                  "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-2 text-center",
                  d.status === "today" && "border-[1.5px] border-[#8B5CF6] bg-card shadow-[0_0_0_3px_rgba(139,92,246,0.12)]",
                  d.status === "today_rest" && "border-[1.5px] border-muted-foreground bg-card",
                  done && "border border-[var(--ok)] bg-card",
                  d.status === "future" && "border border-border bg-card",
                  (d.status === "future_rest" || d.status === "past_rest") && "border border-border bg-transparent opacity-55",
                  clickable && "cursor-pointer",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {tt(DAY_SHORTS[i])}
                </span>
                <span
                  className="text-[11px] font-extrabold leading-tight"
                  style={{ color: isSession ? "#8B5CF6" : "var(--mt)" }}
                >
                  {done ? "✓" : isSession ? `S${d.sessIdx + 1}` : tt("repos")}
                </span>
              </Tag>
            )
          })}
        </div>

        {/* Choix libre de la séance — comme la grille PPL, indépendant du planning auto. */}
        <div className="mb-1.5 mt-3.5 text-xs font-bold text-secondary-foreground">{tt("Choisis ta séance")}</div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: plan.totalSessions }, (_, idx) => {
            const done = doneThisWeek.has(idx)
            return (
              <button
                key={idx}
                onClick={() => start(idx)}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] text-center transition-transform active:scale-[0.97]",
                  done
                    ? "border-[var(--ok)] bg-[var(--ok10)] text-[var(--ok)]"
                    : "border-[#8B5CF6]/35 bg-card text-[#8B5CF6]",
                )}
              >
                {done && <Check className="size-3.5" />}
                <span className="text-[11px] font-extrabold leading-tight">
                  {tt("Séance")} {idx + 1}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => navTo("wizard")}
          className="mt-3 w-full rounded-lg border border-border bg-secondary py-2 text-xs font-bold text-muted-foreground"
        >
          {tt("Modifier / régénérer le programme")}
        </button>
      </div>
    </>
  )
}
