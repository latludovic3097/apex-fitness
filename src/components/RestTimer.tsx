import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ;[0, 0.2, 0.4].forEach((d) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      o.frequency.value = 880
      g.gain.value = 0.3
      o.start(ctx.currentTime + d)
      o.stop(ctx.currentTime + d + 0.15)
    })
  } catch {
    /* ignore */
  }
}

/** Timer de récup circulaire (Date.now based, anti-throttle). */
export function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const atRef = useRef(0)
  const remAtStartRef = useRef(seconds)
  const rafRef = useRef(0)

  useEffect(() => {
    setRemaining(seconds)
    setRunning(false)
    setDone(false)
  }, [seconds])

  const tick = useCallback(() => {
    const elapsed = Math.floor((Date.now() - atRef.current) / 1000)
    const rem = Math.max(0, remAtStartRef.current - elapsed)
    setRemaining(rem)
    if (rem <= 0) {
      setRunning(false)
      setDone(true)
      beep()
      clearInterval(rafRef.current)
    }
  }, [])

  const toggle = () => {
    if (running) {
      const elapsed = Math.floor((Date.now() - atRef.current) / 1000)
      remAtStartRef.current = Math.max(0, remAtStartRef.current - elapsed)
      setRunning(false)
      clearInterval(rafRef.current)
    } else {
      if (done) {
        setDone(false)
        remAtStartRef.current = seconds
        setRemaining(seconds)
      }
      atRef.current = Date.now()
      setRunning(true)
      clearInterval(rafRef.current)
      rafRef.current = setInterval(tick, 250) as unknown as number
    }
  }

  const reset = () => {
    clearInterval(rafRef.current)
    setRunning(false)
    setDone(false)
    remAtStartRef.current = seconds
    setRemaining(seconds)
  }

  useEffect(() => () => clearInterval(rafRef.current), [])

  const pct = seconds > 0 ? (seconds - remaining) / seconds : 0
  const R = 22
  const C = 2 * Math.PI * R
  const mm = Math.floor(remaining / 60)
  const ss = String(remaining % 60).padStart(2, "0")

  return (
    <div
      className={cn(
        "mt-3 flex items-center gap-3.5 rounded-2xl border-[1.5px] bg-secondary p-3.5",
        done ? "border-2 border-[var(--ok)] bg-[var(--ok10)]" : "border-border",
      )}
    >
      <div className="relative size-14 shrink-0">
        <svg viewBox="0 0 52 52" className="size-14 -rotate-90">
          <circle cx="26" cy="26" r={R} fill="none" stroke="var(--bd)" strokeWidth="4" />
          <circle
            cx="26"
            cy="26"
            r={R}
            fill="none"
            stroke={done ? "var(--ok)" : "var(--ac)"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-extrabold">
          {done ? "✓" : `${mm}:${ss}`}
        </div>
      </div>
      <div className="flex flex-1 gap-2">
        <button
          onClick={toggle}
          className={cn(
            "flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white",
            running ? "bg-primary" : "bg-[var(--ok)]",
          )}
        >
          {running ? "Pause" : done ? "↻ Rejouer" : "Start"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border-[1.5px] border-border bg-card px-4 py-2 text-sm font-bold text-secondary-foreground"
        >
          Reset
        </button>
      </div>
      <div className="text-xs font-semibold text-muted-foreground">repos {seconds}s</div>
    </div>
  )
}
