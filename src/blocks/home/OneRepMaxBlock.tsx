import { useStore } from "@/store/useStore"
import { get1RM, KEY_LIFTS } from "@/lib/engine"
import { SectionTitle } from "@/components/SectionTitle"

export function OneRepMaxBlock() {
  const S = useStore()
  const lifts = KEY_LIFTS.map((l) => ({ ...l, rm: get1RM(S, l.name) })).filter((l) => l.rm > 0)
  if (!lifts.length) return null

  return (
    <>
      <SectionTitle>1RM estimés</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-2 gap-2">
          {lifts.map((l) => (
            <div
              key={l.name}
              className="flex items-center justify-between rounded-xl bg-secondary px-3.5 py-3"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {l.label}
              </span>
              <span className="font-mono text-lg font-black text-foreground">
                {l.rm}
                <span className="ml-0.5 text-xs font-semibold text-muted-foreground">kg</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
