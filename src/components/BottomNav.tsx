import { House, CalendarDays, Apple, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/store/useStore"
import { useI18n } from "@/i18n/I18nProvider"
import type { ScreenId } from "@/store/types"

const TABS: { id: ScreenId; key: string; fallback: string; Icon: typeof House }[] = [
  { id: "home", key: "nav_home", fallback: "Accueil", Icon: House },
  { id: "history", key: "nav_history", fallback: "Historique", Icon: CalendarDays },
  { id: "nutrition", key: "nav_nutrition", fallback: "Nutrition", Icon: Apple },
  { id: "settings", key: "nav_settings", fallback: "Réglages", Icon: Settings2 },
]

export function BottomNav() {
  const view = useStore((s) => s.view)
  const navTo = useStore((s) => s.navTo)
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 justify-around border-t border-border bg-card px-0 pb-3 pt-2 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      {TABS.map(({ id, key, fallback, Icon }) => {
        const active = view === id
        const label = t(key) === key ? fallback : t(key)
        return (
          <button
            key={id}
            onClick={() => navTo(id)}
            className={cn(
              "flex min-h-12 min-w-[60px] flex-col items-center justify-center gap-1 px-3.5 py-1.5 text-xs font-semibold",
              active ? "font-extrabold text-primary" : "text-muted-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-[22px]" strokeWidth={active ? 2.5 : 2} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
