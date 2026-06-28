import { useCallback, useEffect, useRef, useState } from "react"
import { beepShort, beepLong, beepEnd, vibrate } from "@/lib/audio"
import { cn } from "@/lib/utils"

interface WodMovement {
  name: string
  img?: string
}
interface Wod {
  type: string
  name: string
  duration: number | null
  movements: WodMovement[]
}

/** Re-render forcé (les machines de timer vivent dans des refs, pas dans le state). */
function useForceRender() {
  const [, set] = useState(0)
  return useCallback(() => set((n) => (n + 1) % 1_000_000), [])
}

/** Ticker basé sur setInterval (et non rAF) : continue de tourner quand l'onglet
 *  est en arrière-plan ou l'écran éteint — essentiel pour un timer de WOD. L'état
 *  est ancré sur Date.now(), donc la fréquence de tick n'affecte pas la précision. */
function useRaf(running: boolean, onTick: () => void) {
  const cb = useRef(onTick)
  cb.current = onTick
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => cb.current(), 200)
    return () => clearInterval(id)
  }, [running])
}

const PHASE_BG: Record<string, string> = {
  work: "rgba(230,57,70,0.14)",
  rest: "rgba(42,157,143,0.16)",
  emom: "rgba(74,122,171,0.14)",
  amrap: "rgba(244,162,97,0.14)",
  rush: "rgba(230,57,70,0.20)",
  done: "rgba(42,157,143,0.20)",
  idle: "transparent",
}

function Shell({
  phase,
  pill,
  pillColor,
  children,
}: {
  phase: string
  pill: string
  pillColor: string
  children: React.ReactNode
}) {
  return (
    <div
      className="mt-3 flex flex-col items-center gap-3.5 rounded-2xl border-[1.5px] border-border p-4 transition-colors"
      style={{ background: PHASE_BG[phase] || "var(--cd2)" }}
    >
      <span
        className="rounded-full px-3.5 py-1 text-[13px] font-black uppercase tracking-[3px] text-white"
        style={{ background: pillColor }}
      >
        {pill}
      </span>
      {children}
    </div>
  )
}

function Ctrl({
  running,
  started,
  done,
  onToggle,
  onReset,
}: {
  running: boolean
  started: boolean
  done: boolean
  onToggle: () => void
  onReset: () => void
}) {
  return (
    <div className="flex w-full gap-2.5">
      <button
        onClick={onToggle}
        className={cn(
          "flex-1 rounded-xl py-3 text-sm font-extrabold tracking-wide text-white",
          running ? "bg-primary" : "bg-[var(--ok)]",
        )}
      >
        {running ? "PAUSE" : done ? "✓ FINI" : started ? "REPRENDRE" : "START"}
      </button>
      <button
        onClick={onReset}
        className="rounded-xl border-[1.5px] border-border bg-card px-5 py-3 text-sm font-bold text-secondary-foreground"
      >
        Reset
      </button>
    </div>
  )
}

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

// ════════════════════════ TABATA ════════════════════════
interface TabMachine {
  phase: "idle" | "work" | "rest" | "done"
  round: number
  secLeft: number
  running: boolean
  anchor: number
  lastBeep: number
}
function TabataTimer({ duration }: { duration: number }) {
  const rounds = Math.max(1, Math.round((duration * 60) / 30))
  const workS = 20
  const restS = 10
  const m = useRef<TabMachine>({ phase: "idle", round: 0, secLeft: workS, running: false, anchor: 0, lastBeep: -1 })
  const render = useForceRender()

  const tick = useCallback(() => {
    const s = m.current
    if (s.phase !== "work" && s.phase !== "rest") return
    const phaseLen = s.phase === "work" ? workS : restS
    const elapsed = Math.floor((Date.now() - s.anchor) / 1000)
    const remaining = phaseLen - elapsed
    if (remaining <= 3 && remaining > 0 && remaining !== s.lastBeep) {
      beepShort()
      s.lastBeep = remaining
    }
    if (remaining > 0) {
      if (remaining !== s.secLeft) {
        s.secLeft = remaining
        render()
      }
      return
    }
    // transition de phase
    if (s.phase === "work") {
      s.phase = "rest"
      s.anchor = Date.now()
      s.secLeft = restS
      s.lastBeep = -1
      beepLong(440)
      vibrate(60)
    } else if (s.round >= rounds) {
      s.phase = "done"
      s.running = false
      s.secLeft = 0
      beepEnd()
      vibrate([120, 60, 120, 60, 200])
    } else {
      s.round += 1
      s.phase = "work"
      s.anchor = Date.now()
      s.secLeft = workS
      s.lastBeep = -1
      beepLong(660)
      vibrate(80)
    }
    render()
  }, [rounds, render])

  useRaf(m.current.running, tick)

  const toggle = () => {
    const s = m.current
    if (s.running) {
      s.running = false
    } else if (s.phase === "idle" || s.phase === "done") {
      s.phase = "work"
      s.round = 1
      s.secLeft = workS
      s.anchor = Date.now()
      s.lastBeep = -1
      s.running = true
      beepLong(660)
      vibrate(80)
    } else {
      const phaseLen = s.phase === "work" ? workS : restS
      s.anchor = Date.now() - (phaseLen - s.secLeft) * 1000
      s.lastBeep = -1
      s.running = true
    }
    render()
  }
  const reset = () => {
    m.current = { phase: "idle", round: 0, secLeft: workS, running: false, anchor: 0, lastBeep: -1 }
    render()
  }

  const s = m.current
  const pill = s.phase === "idle" ? "PRÊT" : s.phase === "work" ? "EFFORT" : s.phase === "rest" ? "REPOS" : "✓ TERMINÉ"
  const pillColor = s.phase === "work" ? "var(--ac)" : s.phase === "rest" || s.phase === "done" ? "var(--ok)" : "var(--mt)"
  return (
    <Shell phase={s.phase} pill={pill} pillColor={pillColor}>
      <div className="flex w-full items-center justify-between px-1 text-[11px] font-extrabold uppercase tracking-[3px] text-secondary-foreground">
        <span>
          Round <span className="font-mono text-base text-foreground">{s.phase === "idle" ? 0 : s.round}/{rounds}</span>
        </span>
        <span>Tabata 20/10</span>
      </div>
      <div
        className="font-mono text-[110px] font-black leading-none"
        style={{ color: s.phase === "work" ? "var(--ac)" : s.phase === "rest" ? "var(--ok)" : "var(--tx)" }}
      >
        {s.phase === "idle" ? workS : s.phase === "done" ? "✓" : s.secLeft}
      </div>
      <Ctrl running={s.running} started={s.phase !== "idle"} done={s.phase === "done"} onToggle={toggle} onReset={reset} />
    </Shell>
  )
}

// ════════════════════════ EMOM ════════════════════════
interface EmMachine {
  curMin: number
  secLeft: number
  running: boolean
  anchor: number
  lastBeep: number
}
function EmomTimer({ minutes }: { minutes: number }) {
  const m = useRef<EmMachine>({ curMin: 0, secLeft: 60, running: false, anchor: 0, lastBeep: -1 })
  const render = useForceRender()

  const tick = useCallback(() => {
    const s = m.current
    const elapsed = Math.floor((Date.now() - s.anchor) / 1000)
    const remaining = 60 - elapsed
    if (remaining <= 3 && remaining > 0 && remaining !== s.lastBeep) {
      beepShort()
      s.lastBeep = remaining
    }
    if (remaining > 0) {
      if (remaining !== s.secLeft) {
        s.secLeft = remaining
        render()
      }
      return
    }
    if (s.curMin >= minutes) {
      s.running = false
      s.curMin = minutes + 1
      beepEnd()
      vibrate([120, 60, 120, 60, 200])
    } else {
      s.curMin += 1
      s.anchor = Date.now()
      s.secLeft = 60
      s.lastBeep = -1
      beepLong(660)
      vibrate(80)
    }
    render()
  }, [minutes, render])

  useRaf(m.current.running, tick)

  const toggle = () => {
    const s = m.current
    if (s.running) {
      s.running = false
    } else {
      if (s.curMin === 0 || s.curMin > minutes) {
        s.curMin = 1
        s.secLeft = 60
        beepLong(660)
        vibrate(80)
      }
      s.anchor = Date.now() - (60 - s.secLeft) * 1000
      s.lastBeep = -1
      s.running = true
    }
    render()
  }
  const reset = () => {
    m.current = { curMin: 0, secLeft: 60, running: false, anchor: 0, lastBeep: -1 }
    render()
  }

  const s = m.current
  const idle = s.curMin === 0
  const done = !s.running && s.curMin > minutes
  return (
    <Shell
      phase={done ? "done" : idle ? "idle" : "emom"}
      pill={idle ? "PRÊT" : done ? "✓ TERMINÉ" : "EN COURS"}
      pillColor={done ? "var(--ok)" : idle ? "var(--mt)" : "var(--info)"}
    >
      <div className="font-mono text-[110px] font-black leading-none" style={{ color: idle || done ? "var(--tx)" : "var(--info)" }}>
        {idle ? 60 : done ? "✓" : s.secLeft}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: minutes }).map((_, i) => {
          const min = i + 1
          const state = done || min < s.curMin ? "past" : min === s.curMin && !idle ? "active" : "future"
          return (
            <div
              key={i}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border-[1.5px] font-mono text-sm font-black",
                state === "past" && "border-[var(--ok)] bg-[var(--ok)] text-white",
                state === "active" && "scale-110 border-[var(--info)] bg-[var(--info)] text-white",
                state === "future" && "border-border bg-card text-muted-foreground opacity-60",
              )}
            >
              {state === "past" ? "✓" : min}
            </div>
          )
        })}
      </div>
      <Ctrl running={s.running} started={s.curMin > 0 && !done} done={done} onToggle={toggle} onReset={reset} />
    </Shell>
  )
}

// ════════════════════════ AMRAP ════════════════════════
interface AmMachine {
  secLeft: number
  rounds: number
  splits: number[]
  running: boolean
  anchor: number
  lastBeep: number
}
function AmrapTimer({ minutes }: { minutes: number }) {
  const total = minutes * 60
  const m = useRef<AmMachine>({ secLeft: total, rounds: 0, splits: [], running: false, anchor: 0, lastBeep: -1 })
  const render = useForceRender()

  const tick = useCallback(() => {
    const s = m.current
    const elapsed = Math.floor((Date.now() - s.anchor) / 1000)
    const remaining = total - elapsed
    if (remaining <= 0) {
      s.secLeft = 0
      s.running = false
      beepEnd()
      vibrate([120, 60, 120, 60, 200])
      render()
      return
    }
    if (remaining === 60 && s.lastBeep !== 60) {
      beepLong(440)
      vibrate(60)
      s.lastBeep = 60
    } else if ((remaining <= 3 || remaining === 5 || remaining === 10) && remaining !== s.lastBeep) {
      beepShort()
      s.lastBeep = remaining
    }
    if (remaining !== s.secLeft) {
      s.secLeft = remaining
      render()
    }
  }, [total, render])

  useRaf(m.current.running, tick)

  const toggle = () => {
    const s = m.current
    if (s.running) {
      s.running = false
    } else {
      if (s.secLeft <= 0 || s.secLeft === total) {
        s.secLeft = total
        s.rounds = 0
        s.splits = []
        beepLong(660)
        vibrate(80)
      }
      s.anchor = Date.now() - (total - s.secLeft) * 1000
      s.lastBeep = -1
      s.running = true
    }
    render()
  }
  const reset = () => {
    m.current = { secLeft: total, rounds: 0, splits: [], running: false, anchor: 0, lastBeep: -1 }
    render()
  }
  const addRound = () => {
    const s = m.current
    if (!s.running) return
    s.rounds += 1
    s.splits.push(total - s.secLeft)
    beepShort()
    vibrate(50)
    render()
  }

  const s = m.current
  const done = s.secLeft === 0
  const rush = s.secLeft <= 60 && s.secLeft > 0 && s.running
  const idle = s.secLeft === total && !s.running
  return (
    <Shell
      phase={done ? "done" : rush ? "rush" : idle ? "idle" : "amrap"}
      pill={idle ? "PRÊT" : done ? "✓ TERMINÉ" : rush ? "DERNIÈRE MINUTE" : "EN COURS"}
      pillColor={done ? "var(--ok)" : rush ? "var(--ac)" : idle ? "var(--mt)" : "var(--wa)"}
    >
      <div
        className="font-mono text-[100px] font-black leading-none"
        style={{ color: done ? "var(--ok)" : rush ? "var(--ac)" : "var(--wa)" }}
      >
        {s.rounds}
      </div>
      <div className="text-[11px] font-black uppercase tracking-[3px] text-muted-foreground">tours · {mmss(s.secLeft)}</div>
      <button
        onClick={addRound}
        disabled={!s.running}
        className="w-full rounded-xl bg-[var(--wa)] py-4 text-lg font-black tracking-wide text-white disabled:opacity-40"
      >
        + 1 TOUR
      </button>
      <Ctrl running={s.running} started={s.secLeft < total} done={done} onToggle={toggle} onReset={reset} />
    </Shell>
  )
}

// ════════════════════════ FOR TIME / CHIPPER ════════════════════════
interface FtMachine {
  elapsed: number
  running: boolean
  anchor: number
  splits: Record<number, number>
}
function ForTimeTimer({ movements }: { movements: WodMovement[] }) {
  const total = movements.length
  const m = useRef<FtMachine>({ elapsed: 0, running: false, anchor: 0, splits: {} })
  const render = useForceRender()

  const tick = useCallback(() => {
    const s = m.current
    const e = Math.floor((Date.now() - s.anchor) / 1000)
    if (e !== s.elapsed) {
      s.elapsed = e
      render()
    }
  }, [render])

  useRaf(m.current.running, tick)

  const toggle = () => {
    const s = m.current
    if (s.running) {
      s.running = false
    } else {
      s.anchor = Date.now() - s.elapsed * 1000
      if (s.elapsed === 0) {
        beepLong(660)
        vibrate(80)
      }
      s.running = true
    }
    render()
  }
  const reset = () => {
    m.current = { elapsed: 0, running: false, anchor: 0, splits: {} }
    render()
  }
  const toggleMove = (i: number) => {
    const s = m.current
    if (s.splits[i] === undefined) {
      s.splits[i] = s.elapsed
      beepShort()
      vibrate(50)
    } else {
      delete s.splits[i]
    }
    if (Object.keys(s.splits).length === total && total > 0) {
      s.running = false
      beepEnd()
      vibrate([120, 60, 120, 60, 200])
    }
    render()
  }

  const s = m.current
  const doneCount = Object.keys(s.splits).length
  const allDone = doneCount > 0 && doneCount === total
  return (
    <Shell
      phase={allDone ? "done" : s.running ? "work" : s.elapsed > 0 ? "rest" : "idle"}
      pill={allDone ? "✓ TERMINÉ" : s.running ? "EN COURS" : s.elapsed > 0 ? "PAUSE" : "PRÊT"}
      pillColor={allDone ? "var(--ok)" : s.running ? "var(--info)" : "var(--mt)"}
    >
      <div className="font-mono text-[88px] font-black leading-none" style={{ color: allDone ? "var(--ok)" : "var(--info)" }}>
        {mmss(s.elapsed)}
      </div>
      <div className="w-full space-y-2">
        {movements.map((mv, i) => {
          const split = s.splits[i]
          return (
            <button
              key={i}
              onClick={() => toggleMove(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-colors",
                split !== undefined ? "border-[var(--ok)] bg-[var(--ok10)]" : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-md border-[1.5px] text-xs font-black",
                  split !== undefined ? "border-[var(--ok)] bg-[var(--ok)] text-white" : "border-border",
                )}
              >
                {split !== undefined ? "✓" : ""}
              </span>
              <span className={cn("flex-1 text-sm font-bold", split !== undefined && "text-[var(--ok)] line-through")}>
                {mv.name}
              </span>
              {split !== undefined && <span className="font-mono text-sm font-black text-[var(--ok)]">{mmss(split)}</span>}
            </button>
          )
        })}
      </div>
      <Ctrl running={s.running} started={s.elapsed > 0} done={allDone} onToggle={toggle} onReset={reset} />
    </Shell>
  )
}

export function WodTimer({ wod }: { wod: Wod }) {
  const type = (wod.type || "").toLowerCase()
  if (type === "tabata") return <TabataTimer duration={wod.duration || 4} />
  if (type === "emom") return <EmomTimer minutes={wod.duration || 10} />
  if (type === "amrap") return <AmrapTimer minutes={wod.duration || 8} />
  return <ForTimeTimer movements={wod.movements} />
}
