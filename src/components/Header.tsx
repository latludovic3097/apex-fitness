import { Globe, Settings } from "lucide-react"
import { Logo } from "./Logo"
import { useI18n } from "@/i18n/I18nProvider"
import { useStore } from "@/store/useStore"

export function Header() {
  const { lang, toggle, tt } = useI18n()
  const navTo = useStore((s) => s.navTo)
  return (
    <header className="flex items-center justify-between px-[18px] pb-[14px] pt-[22px]">
      <Logo className="text-2xl" />
      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground"
          aria-label={tt("Changer de langue")}
        >
          <Globe className="size-4" />
          {lang.toUpperCase()}
        </button>
        <button
          onClick={() => navTo("settings")}
          className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          aria-label={tt("Réglages")}
        >
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  )
}

export function PageHeader({ title }: { title: string }) {
  const { tt } = useI18n()
  return (
    <header className="flex items-center justify-between px-[18px] pb-[14px] pt-[22px]">
      <h2 className="m-0 text-[22px] font-extrabold uppercase tracking-[2px] text-foreground">
        {tt(title)}
      </h2>
    </header>
  )
}
