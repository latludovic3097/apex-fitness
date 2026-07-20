import { useMemo, useState } from "react"
import { ChevronLeft, X } from "lucide-react"
import { useStore } from "@/store/useStore"
import { pickWOD } from "@/lib/engine"
import { WU, I } from "@/data/fitstark-data"
import { ExerciseCard } from "@/components/ExerciseCard"
import { WodTimer } from "@/components/WodTimer"
import { cn } from "@/lib/utils"

type TabKey = { kind: "wu" } | { kind: "ex"; idx: number } | { kind: "wod" }

function imgUrl(src: string) {
  return !src ? "" : src.startsWith("http") ? src : I + src
}

export function SessionScreen() {
  const sess = useStore((s) => s.sess)!
  const S = useStore()
  const finish = useStore((s) => s.finishSession)
  const cancel = useStore((s) => s.cancelSession)

  const exercises = sess.exercises || []
  const warmup = (WU as Record<string, unknown[]>)[sess.id] as
    | { name: string; reps: string; img: string; notes: string; mw?: string; yt?: string }[]
    | undefined
  const wod = useMemo(() => pickWOD(S, sess.id), [S, sess.id])

  const tabs: TabKey[] = useMemo(() => {
    const t: TabKey[] = []
    if (warmup && warmup.length) t.push({ kind: "wu" })
    exercises.forEach((_, idx) => t.push({ kind: "ex", idx }))
    if (wod) t.push({ kind: "wod" })
    return t
  }, [warmup, exercises, wod])

  const [tab, setTab] = useState(() => {
    const firstEx = tabs.findIndex((t) => t.kind === "ex")
    return firstEx >= 0 ? firstEx : 0
  })
  const current = tabs[tab]
  const isLast = tab === tabs.length - 1

  return (
    <div className="pb-28">
      {/* Header séance */}
      <header
        className="flex items-center justify-between px-4 pb-3 pt-5"
        style={{ borderBottom: `3px solid ${sess.color}` }}
      >
        <button onClick={cancel} className="flex items-center gap-1 text-sm font-bold text-muted-foreground">
          <ChevronLeft className="size-5" /> Quitter
        </button>
        <h2 className="text-xl font-black tracking-[2px]" style={{ color: sess.color }}>
          {sess.name}
        </h2>
        <button onClick={cancel} aria-label="Annuler" className="text-muted-foreground">
          <X className="size-5" />
        </button>
      </header>

      {/* Pills de navigation */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-3">
        {tabs.map((t, i) => {
          const label = t.kind === "wu" ? "WU" : t.kind === "wod" ? "WOD" : String(t.idx + 1)
          const active = i === tab
          return (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full border-[1.5px] px-4 text-[13px] font-bold",
                active
                  ? "border-transparent text-white"
                  : "border-border bg-card text-secondary-foreground",
              )}
              style={active ? { background: sess.color } : undefined}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Contenu */}
      {current?.kind === "wu" && warmup && (
        <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] shadow-[var(--shadow-sm)]">
          <div className="mb-2 text-lg font-black tracking-wide">Échauffement</div>
          <p className="mb-3 text-[13px] text-muted-foreground">
            Protocole McGill Big 3 + activation. Prépare le dos et les articulations.
          </p>
          {warmup.map((w, i) => (
            <div key={i} className="flex gap-3.5 border-b border-border py-3.5 last:border-0">
              {w.img && (
                <div className="size-[70px] shrink-0 overflow-hidden rounded-xl border-[1.5px] border-border bg-secondary">
                  <img src={imgUrl(w.img)} alt="" className="size-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold">{w.name}</div>
                <div className="text-[13px] font-semibold text-[var(--ok)]">{w.reps}</div>
                {w.notes && <div className="mt-1 text-xs text-muted-foreground">{w.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {current?.kind === "ex" && exercises[current.idx] && (
        <ExerciseCard key={exercises[current.idx].id ?? exercises[current.idx].name} ex={exercises[current.idx]} position={current.idx + 1} total={exercises.length} />
      )}

      {current?.kind === "wod" && wod && <WodCard wod={wod} />}

      {/* Barre d'action bas */}
      <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[480px] -translate-x-1/2 gap-2.5 border-t border-border bg-card p-3">
        <button
          onClick={() => setTab((t) => Math.max(0, t - 1))}
          disabled={tab === 0}
          className="rounded-xl border border-border bg-secondary px-5 py-3.5 text-sm font-bold text-secondary-foreground disabled:opacity-40"
        >
          ← Préc.
        </button>
        {isLast ? (
          <button
            onClick={finish}
            className="flex-1 rounded-xl bg-[var(--ok)] py-3.5 text-[15px] font-extrabold text-white shadow-[var(--shadow-sm)]"
          >
            ✓ Terminer la séance
          </button>
        ) : (
          <button
            onClick={() => setTab((t) => Math.min(tabs.length - 1, t + 1))}
            className="flex-1 rounded-xl bg-primary py-3.5 text-[15px] font-extrabold text-primary-foreground shadow-[var(--shadow-sm)]"
          >
            {tabs[tab + 1]?.kind === "wod" ? "WOD →" : "Suivant →"}
          </button>
        )}
      </div>
    </div>
  )
}

interface WodMovement {
  name: string
  img?: string
}
interface Wod {
  type: string
  name: string
  desc: string
  duration: number | null
  movements: WodMovement[]
}

function WodCard({ wod }: { wod: Wod }) {
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] shadow-[var(--shadow-sm)]">
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#8B5CF6]">
        WOD · {wod.type}
        {wod.duration ? ` · ${wod.duration} min` : ""}
      </div>
      <div className="mt-1 text-xl font-black">{wod.name}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-secondary-foreground">{wod.desc}</p>
      <div className="mt-3 space-y-2">
        {wod.movements.map((m, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5">
            {m.img && (
              <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                <img src={imgUrl(m.img)} alt="" className="size-full object-cover" loading="lazy" />
              </div>
            )}
            <span className="text-sm font-semibold">{m.name}</span>
          </div>
        ))}
      </div>
      <WodTimer wod={wod} />
    </div>
  )
}
