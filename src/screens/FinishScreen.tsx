import { Clock, Dumbbell, Layers, ListChecks, Share2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import { shareWorkoutImage } from "@/lib/shareImage"
import type { HistoryEntry } from "@/store/types"

const COLORS = ["#E63946", "#2A9D8F", "#F4A261", "#4A7AAB", "#8B5CF6", "#FFD700"]

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    left: (i * 2.7) % 100,
    delay: (i % 9) * 0.18,
    dur: 2.4 + (i % 5) * 0.4,
    color: COLORS[i % COLORS.length],
    rot: (i * 47) % 360,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="finish-confetto"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  )
}

function stats(h: HistoryEntry) {
  let volume = 0
  let sets = 0
  h.exercises.forEach((ex) => {
    Object.entries(ex.logged || {}).forEach(([k, s]: [string, any]) => {
      if (k === "rir") return
      if ((s.weight || 0) > 0 || (s.reps || 0) > 0) sets += 1
      volume += (s.weight || 0) * (s.reps || 0)
    })
  })
  return { volume: Math.round(volume), sets, exercises: h.exercises.length }
}

const STAT_CONF = [
  { key: "duration", icon: Clock, label: "Durée", unit: "min" },
  { key: "volume", icon: Dumbbell, label: "Volume", unit: "kg" },
  { key: "sets", icon: Layers, label: "Séries", unit: "" },
  { key: "exercises", icon: ListChecks, label: "Exercices", unit: "" },
]

export function FinishScreen() {
  const h = useStore((s) => s.lastFinished)
  const dismiss = useStore((s) => s.dismissFinish)
  if (!h) {
    dismiss()
    return null
  }
  const st = stats(h)
  const values: Record<string, number> = {
    duration: h.duration,
    volume: st.volume,
    sets: st.sets,
    exercises: st.exercises,
  }
  const dateLabel = new Date(h.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  function share() {
    shareWorkoutImage(h!)
  }

  return (
    <div className="relative flex min-h-screen flex-col gap-4 overflow-hidden px-4 pb-10 pt-8">
      <Confetti />
      <div className="finish-pop relative text-center">
        <div className="text-sm font-black uppercase tracking-[4px] text-[var(--ok)]">Bravo</div>
        <h1 className="mt-1.5 text-[34px] font-black leading-none tracking-tight">Séance terminée</h1>
        <div className="mt-1.5 text-sm capitalize text-muted-foreground">
          {h.sessionName} · {dateLabel}
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2.5">
        {STAT_CONF.map((c, i) => {
          const Icon = c.icon
          return (
            <div
              key={c.key}
              className="finish-pop flex flex-col items-center gap-1 rounded-2xl border-[1.5px] border-border bg-card p-4 shadow-[var(--shadow-sm)]"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <Icon className="size-7 text-[var(--ok)]" />
              <div className="font-mono text-3xl font-black tracking-tight">{values[c.key]}</div>
              <div className="text-[10px] font-bold uppercase tracking-[2px] text-muted-foreground">
                {c.label}
                {c.unit ? ` (${c.unit})` : ""}
              </div>
            </div>
          )
        })}
      </div>

      <div className="finish-pop relative mt-2 flex flex-col gap-2.5" style={{ animationDelay: "0.5s" }}>
        <button
          onClick={share}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-extrabold text-primary-foreground shadow-[0_4px_14px_rgba(230,57,70,0.3)]"
        >
          <Share2 className="size-5" /> Partager ma séance
        </button>
        <button
          onClick={dismiss}
          className="rounded-xl border border-border bg-card py-3.5 text-sm font-bold text-secondary-foreground"
        >
          Voir l'historique
        </button>
      </div>
    </div>
  )
}
