import { useState } from "react"
import { Share2 } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { computeAchievements, getAchievementStats } from "@/data/fitstark-data"
import { shareWorkoutImage } from "@/lib/shareImage"
import { SectionTitle } from "@/components/SectionTitle"
import { cn } from "@/lib/utils"
import type { HistoryEntry } from "@/store/types"

const DAY = 864e5

interface Ach {
  ach: { id: string; icon: string; name: string; desc: string }
  earned: boolean
  progress: number
}

function weeklyVolume(hist: HistoryEntry[]): { week: string; vol: number }[] {
  const now = Date.now()
  const weeks: number[] = Array(12).fill(0)
  hist.forEach((h) => {
    const wk = Math.floor((now - new Date(h.date).getTime()) / (7 * DAY))
    if (wk < 0 || wk > 11) return
    let v = 0
    h.exercises.forEach((x) =>
      Object.values(x.logged || {}).forEach((s: { weight?: number; reps?: number }) => {
        v += (s.weight || 0) * (s.reps || 0)
      }),
    )
    weeks[wk] += v
  })
  return weeks.map((vol, i) => ({ week: `S-${i}`, vol })).reverse()
}

export function HistoryScreen() {
  const hist = useStore((s) => s.hist)
  const S = useStore()
  const achievements = computeAchievements(hist, S) as Ach[]
  const stats = getAchievementStats(hist, S)
  const volumes = weeklyVolume(hist)
  const maxVol = Math.max(1, ...volumes.map((v) => v.vol))

  return (
    <div className="pb-4">
      <PageHeader title="Historique" />

      {hist.length === 0 ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mb-2 text-4xl">🏋️</div>
          <p className="text-sm text-muted-foreground">
            Aucune séance encore. Lance ta première séance depuis l'accueil !
          </p>
        </div>
      ) : (
        <>
          {/* Volume hebdo */}
          <SectionTitle>Volume des 12 dernières semaines</SectionTitle>
          <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
            <div className="flex h-24 items-end gap-1">
              {volumes.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: `${Math.max(3, (v.vol / maxVol) * 100)}%` }}
                  title={`${Math.round(v.vol)} kg`}
                />
              ))}
            </div>
          </div>

          {/* Liste des séances */}
          <SectionTitle>Tes séances ({hist.length})</SectionTitle>
          <div className="mx-4 space-y-2.5">
            {hist.map((h, i) => (
              <HistoryCard key={h.id || i} h={h} />
            ))}
          </div>
        </>
      )}

      {/* Achievements */}
      <SectionTitle>
        Achievements ({stats.earned}/{stats.total})
      </SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-2 gap-2">
          {achievements.map(({ ach, earned, progress }) => (
            <div
              key={ach.id}
              className={cn(
                "rounded-xl border p-3 transition-opacity",
                earned ? "border-[var(--ok)] bg-[var(--ok10)]" : "border-border bg-secondary opacity-80",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("text-2xl", !earned && "grayscale")}>{ach.icon}</span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold">{ach.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{ach.desc}</div>
                </div>
              </div>
              {!earned && progress > 0 && (
                <div className="mt-2 h-1.5 rounded-full bg-border">
                  <div
                    className="h-1.5 rounded-full bg-[var(--ok)]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HistoryCard({ h }: { h: HistoryEntry }) {
  const [open, setOpen] = useState(false)
  const date = new Date(h.date).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  const topExos = h.exercises.slice(0, 4).map((ex) => {
    const sets = Object.values(ex.logged || {}) as { weight?: number; reps?: number }[]
    const maxW = Math.max(0, ...sets.map((s) => s.weight || 0))
    return { name: ex.name, maxW }
  })

  return (
    <div
      className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]"
      style={{ borderLeft: "5px solid var(--ac)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 text-lg font-extrabold tracking-wide">{h.sessionName}</div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {date} · {h.duration} min
          </span>
          <button
            onClick={() => shareWorkoutImage(h)}
            aria-label="Partager cette séance"
            className="text-muted-foreground hover:text-primary"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {topExos.map((ex, i) => (
          <span key={i} className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
            {ex.name}
            {ex.maxW > 0 && <b className="ml-1 font-extrabold text-foreground">{ex.maxW}kg</b>}
          </span>
        ))}
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-xs font-semibold text-primary underline"
      >
        {open ? "Masquer" : "Détails"}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 text-xs text-secondary-foreground">
          {h.exercises.map((ex, i) => {
            const sets = Object.entries(ex.logged || {}).filter(
              ([k]) => k !== "rir",
            ) as [string, { weight?: number; reps?: number }][]
            return (
              <div key={i}>
                <b className="font-bold text-foreground">{ex.name}</b>
                {" — "}
                {sets.length
                  ? sets.map(([, s]) => `${s.weight || 0}×${s.reps || 0}`).join(", ")
                  : "—"}
                {ex.rir != null && <span className="text-muted-foreground"> · RIR {ex.rir}</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
