import { useState } from "react"
import { Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"

const NOTIF_KEY = "apex_notif_enabled"

function isEnabled() {
  try {
    return localStorage.getItem(NOTIF_KEY) === "1"
  } catch {
    return false
  }
}

export function RemindersBlock() {
  const { tt } = useI18n()
  const [enabled, setEnabled] = useState(isEnabled)
  const [perm, setPerm] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported",
  )

  async function toggle(v: boolean) {
    if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        const p = await Notification.requestPermission()
        setPerm(p)
        if (p !== "granted") v = false
      } catch {
        /* ignore */
      }
    }
    setEnabled(v)
    try {
      localStorage.setItem(NOTIF_KEY, v ? "1" : "0")
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <SectionTitle>Rappels</SectionTitle>
      <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        <Bell className="size-5 shrink-0 text-[var(--wa)]" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{tt("Rappel d'entraînement")}</div>
          <div className="text-xs text-muted-foreground">
            {perm === "denied"
              ? tt("Notifications bloquées par le navigateur")
              : tt("Une alerte après 3+ jours sans séance (max 1/24h)")}
          </div>
        </div>
        <Switch checked={enabled} disabled={perm === "denied" || perm === "unsupported"} onCheckedChange={toggle} />
      </div>
    </>
  )
}
