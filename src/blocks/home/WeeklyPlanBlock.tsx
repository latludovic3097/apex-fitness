import { useStore } from "@/store/useStore"
import { computeWeekPlan, type PlanDay } from "@/lib/engine"
import { DAY_SHORTS } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"
import { cn } from "@/lib/utils"

const SESS_LABEL: Record<string, string> = {
  push: "PUSH",
  pull: "PULL",
  legs: "LEGS",
  core: "CORE",
  rest: "repos",
}
const SESS_COLOR: Record<string, string> = {
  push: "var(--ac)",
  pull: "#457B9D",
  legs: "var(--ok)",
  core: "#8B5CF6",
  rest: "var(--mt)",
}

function dayClasses(status: PlanDay["status"]): string {
  switch (status) {
    case "today":
      return "bg-card border-[1.5px] border-primary shadow-[0_0_0_3px_var(--ac10)]"
    case "today_rest":
      return "bg-card border-[1.5px] border-muted-foreground"
    case "done":
      return "bg-card border border-[var(--ok)]"
    case "future":
      return "bg-card border border-border"
    case "future_rest":
    case "past_rest":
      return "bg-transparent border border-border opacity-55"
    default:
      return "bg-secondary border border-border"
  }
}

export function WeeklyPlanBlock() {
  const S = useStore()
  const start = useStore((s) => s.startSession)
  const plan = computeWeekPlan(S)
  const { tt } = useI18n()

  return (
    <>
      <SectionTitle>Planning idéal de la semaine</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-3.5 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-7 gap-1">
          {plan.map((d, i) => {
            const sess = d.sess || "rest"
            const clickable = d.status === "today" && sess !== "rest"
            const done = d.status === "done"
            const Tag = clickable ? "button" : "div"
            return (
              <Tag
                key={i}
                onClick={clickable ? () => start(sess) : undefined}
                className={cn(
                  "flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-2 text-center",
                  dayClasses(d.status),
                  clickable && "cursor-pointer",
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {tt(DAY_SHORTS[i])}
                </span>
                <span
                  className="text-xs font-extrabold leading-tight"
                  style={{ color: SESS_COLOR[sess] }}
                >
                  {done && "✓ "}
                  {tt(SESS_LABEL[sess] || sess)}
                </span>
              </Tag>
            )
          })}
        </div>
        <p className="mt-2.5 border-t border-border pt-2.5 text-xs leading-relaxed text-muted-foreground">
          {tt("Le planning s'")}
          <b className="font-semibold text-secondary-foreground">{tt("adapte")}</b>
          {tt(": séances faites cochées ✓, les restantes placées sur les jours libres.")}
        </p>
      </div>
    </>
  )
}
