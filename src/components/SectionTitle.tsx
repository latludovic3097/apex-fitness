import type { ReactNode } from "react"
import { useI18n } from "@/i18n/I18nProvider"

export function SectionTitle({ children }: { children: ReactNode }) {
  const { tt } = useI18n()
  const content = typeof children === "string" ? tt(children) : children
  return (
    <h3 className="m-0 px-4 pb-1.5 pt-7 text-sm font-bold tracking-[0.3px] text-muted-foreground">
      {content}
    </h3>
  )
}
