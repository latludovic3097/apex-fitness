import { ChevronLeft, Youtube, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { coreCurrentWeek, coreSessionsThisWeek } from "@/lib/engine"
import { CORE_PROGRAM } from "@/data/fitstark-data"

interface CoreEx {
  id: string
  name: string
  muscle: string
  mw: string
  yt: string
  coaching: string[]
  notes: string
  prog: { w: number; s: number; r?: number; h?: number; d?: number }[]
}

export function CoreScreen() {
  const S = useStore()
  const navTo = useStore((s) => s.navTo)
  const core = useStore((s) => s.core)
  const patch = useStore((s) => s.patchHealth) // unused fallback
  void patch
  const logManualSession = useStore((s) => s.logManualSession)
  const setCoreStart = () => {
    if (!core.startDate) {
      useStore.setState((s) => ({ core: { ...s.core, startDate: new Date().toISOString() } }))
    }
  }
  const week = coreCurrentWeek(S)
  const doneThisWeek = coreSessionsThisWeek(S)
  const exercises = (CORE_PROGRAM.exercises as CoreEx[]) || []

  return (
    <div className="pb-4">
      <button onClick={() => navTo("home")} className="flex items-center gap-1 px-4 pt-5 text-sm font-bold text-muted-foreground">
        <ChevronLeft className="size-5" /> Accueil
      </button>
      <PageHeader title="Core L5-S1" />

      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-5 text-center shadow-[var(--shadow-sm)]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Programme McGill Big 3 · 12 semaines
        </div>
        <div className="mt-1 font-mono text-4xl font-black text-foreground">
          Semaine {week}<span className="text-xl text-muted-foreground">/12</span>
        </div>
        <div className="mt-1 text-sm font-semibold text-[var(--ok)]">
          {doneThisWeek}/2 séances cette semaine
        </div>
        {!core.startDate && (
          <button
            onClick={setCoreStart}
            className="mt-3 w-full rounded-xl bg-[var(--ok)] py-3 text-sm font-extrabold text-white"
          >
            🚀 Démarrer le programme (semaine 1)
          </button>
        )}
      </div>

      {exercises.map((ex) => {
        const p = ex.prog[Math.min(ex.prog.length - 1, week - 1)]
        return (
          <div key={ex.id} className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] shadow-[var(--shadow-sm)]">
            <div className="text-lg font-black">{ex.name}</div>
            <div className="mt-1 text-sm font-bold text-[var(--ok)]">
              {p.w} kg · {p.s} séries × {p.r ? `${p.r} reps` : `${p.d}s/côté`}
              {p.h ? ` · tenue ${p.h}s` : ""}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-secondary-foreground">{ex.notes}</p>
            <ul className="mt-2 space-y-1 text-[13px] text-secondary-foreground">
              {ex.coaching.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--ok)]">•</span> {c}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <a href={ex.mw} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-bold">
                <BookOpen className="size-4" /> Technique
              </a>
              <a href={ex.yt} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-bold">
                <Youtube className="size-4" /> Vidéo
              </a>
            </div>
          </div>
        )
      })}

      <div className="mx-4">
        <button
          onClick={() =>
            logManualSession({
              sessionId: "core",
              sessionName: "Core L5-S1",
              coreWeek: week,
              duration: 20,
              exercises: exercises.map((e) => ({ name: e.name, muscle: e.muscle, logged: {} })),
            })
          }
          className="w-full rounded-xl bg-[var(--ok)] py-3.5 text-[15px] font-extrabold text-white shadow-[var(--shadow-sm)]"
        >
          ✓ Marquer la séance Core faite
        </button>
      </div>
    </div>
  )
}
