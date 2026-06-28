import { HeartPulse, Activity, Apple, type LucideIcon } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { ScreenId } from "@/store/types"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"

interface WellnessItem {
  id: ScreenId
  icon: LucideIcon
  name: string
  meta: string
}

const ITEMS: WellnessItem[] = [
  { id: "cardio", icon: HeartPulse, name: "Cardio", meta: "Course · Nage · Vélo — Z2 / HIIT" },
  { id: "core", icon: Activity, name: "Core", meta: "Programme L5-S1 safe · McGill Big 3" },
  { id: "nutrition", icon: Apple, name: "Nutrition", meta: "Calculateur Mifflin · macros" },
]

export function WellnessBlock() {
  const navTo = useStore((s) => s.navTo)
  const { tt } = useI18n()
  return (
    <>
      <SectionTitle>Wellness</SectionTitle>
      <div className="px-4">
        {ITEMS.map(({ id, icon: Icon, name, meta }) => (
          <button
            key={id}
            onClick={() => navTo(id)}
            className="mb-3 flex w-full items-center justify-between rounded-2xl border border-border bg-card p-[18px] text-left shadow-[var(--shadow-sm)] transition-transform active:scale-[0.985]"
            style={{ borderLeft: "5px solid var(--ok)" }}
          >
            <div className="min-w-0">
              <div className="text-xl font-extrabold tracking-[1.5px] text-[var(--ok)]">{tt(name)}</div>
              <div className="mt-1 text-[13px] font-medium text-secondary-foreground">{tt(meta)}</div>
            </div>
            <Icon className="size-[22px] shrink-0 text-[var(--ok)] opacity-70" />
          </button>
        ))}
      </div>
    </>
  )
}
