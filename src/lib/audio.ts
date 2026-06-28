// FITStark — bips Web Audio + vibration (port de state.js, anti-throttle iOS Safari).

let audioCtx: AudioContext | null = null

function ctx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtx = new Ctor()
    }
    if (audioCtx.state === "suspended") audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

export function beepShort() {
  const c = ctx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  o.frequency.value = 880
  g.gain.value = 0.28
  o.start()
  o.stop(c.currentTime + 0.1)
}

export function beepLong(freq = 660) {
  const c = ctx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  o.frequency.value = freq
  g.gain.value = 0.35
  o.start()
  o.stop(c.currentTime + 0.32)
}

export function beepEnd() {
  const c = ctx()
  if (!c) return
  ;[0, 0.18, 0.36].forEach((d) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.frequency.value = 988
    g.gain.value = 0.35
    o.start(c.currentTime + d)
    o.stop(c.currentTime + d + 0.22)
  })
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* ignore */
  }
}
