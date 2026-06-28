import { useI18n } from "@/i18n/I18nProvider"

interface StatTileProps {
  value: string | number
  label: string
  valueColor?: string
  bar?: { pct: number; color: string }
}

export function StatTile({ value, label, valueColor, bar }: StatTileProps) {
  const { tt } = useI18n()
  return (
    <div className="flex-1 rounded-2xl border border-border bg-card p-3.5 text-center shadow-[var(--shadow-sm)]">
      <div className="text-2xl font-black" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {tt(label)}
      </div>
      {bar && (
        <div className="mt-1.5 h-[5px] rounded bg-border">
          <div
            className="h-[5px] rounded transition-[width] duration-300"
            style={{ width: `${bar.pct}%`, background: bar.color }}
          />
        </div>
      )}
    </div>
  )
}
