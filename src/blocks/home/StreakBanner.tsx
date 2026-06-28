import { Flame, TriangleAlert, Zap } from "lucide-react"
import { useStore } from "@/store/useStore"
import { getStreakInfo, getRecommendation } from "@/lib/engine"
import { PROG } from "@/data/fitstark-data"
import { useI18n } from "@/i18n/I18nProvider"

const ICON = {
  new: Zap,
  active: Flame,
  ok: Flame,
  warn: TriangleAlert,
  alert: TriangleAlert,
  lost: TriangleAlert,
}

function message(
  tt: (src: string, vars?: Record<string, unknown>) => string,
  status: string,
  days: number | null,
  sessions7: number,
): string {
  switch (status) {
    case "new":
      return tt("Première séance ? Lance-toi 💪")
    case "active":
      return sessions7 > 1
        ? tt("🔥 {n} séances cette semaine — en feu !", { n: sessions7 })
        : tt("🔥 Séance faite aujourd'hui !")
    case "ok":
      return days === 1
        ? tt("Hier encore actif — garde le rythme")
        : tt("Dernière séance il y a {n} jours", { n: days })
    case "warn":
      return tt("⚠️ {n} jours sans séance — reprends le rythme", { n: days })
    case "alert":
      return tt("🚨 {n} jours d'arrêt — relance-toi maintenant", { n: days })
    default:
      return tt("🚨 {n} jours sans séance — ne lâche pas !", { n: days })
  }
}

export function StreakBanner() {
  const S = useStore()
  const start = useStore((s) => s.startSession)
  const info = getStreakInfo(S)
  const Icon = ICON[info.status as keyof typeof ICON] || Flame
  const rec = getRecommendation(S)
  const recSess = PROG.sessions.find((x: { id: string }) => x.id === rec.id)
  const showCta = info.status === "warn" || info.status === "alert" || info.status === "lost"
  const { tt } = useI18n()

  return (
    <div
      className="mx-4 mb-3.5 flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-[var(--shadow-sm)]"
      style={{ borderColor: info.color }}
    >
      <Icon className="size-6 shrink-0" style={{ color: info.color }} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold" style={{ color: info.color }}>
          {message(tt, info.status, info.days, info.sessions7)}
        </div>
      </div>
      {showCta && recSess && (
        <button
          onClick={() => start(rec.id)}
          className="shrink-0 rounded-xl bg-primary px-3.5 py-2 text-xs font-extrabold text-primary-foreground"
        >
          ▶ {recSess.name}
        </button>
      )}
    </div>
  )
}
