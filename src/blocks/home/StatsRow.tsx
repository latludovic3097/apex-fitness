import { useStore } from "@/store/useStore"
import { getFatigue } from "@/lib/engine"
import { StatTile } from "@/components/StatTile"

export function StatsRow() {
  const S = useStore()
  const fatigue = getFatigue(S)
  const sessions7 = S.hist.filter(
    (h) => Date.now() - new Date(h.date).getTime() < 7 * 864e5,
  ).length

  return (
    <div className="mb-3.5 flex gap-2 px-4">
      <StatTile
        value={fatigue.score}
        label="Fatigue"
        valueColor={fatigue.color}
        bar={{ pct: fatigue.score, color: fatigue.color }}
      />
      <StatTile value={S.hist.length} label="Séances" />
      <StatTile value={sessions7} label="7 jours" valueColor="var(--ok)" />
    </div>
  )
}
