/* eslint-disable @typescript-eslint/no-explicit-any */
// FITStark — Génère une image carrée 1080×1080 (format Instagram) du récap de
// séance et la partage via Web Share API (fallback téléchargement).
// Port de shareLastWorkout() de ui.js.

import type { HistoryEntry } from "@/store/types"

function rr(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    ctx.fill()
  } else {
    ctx.fillRect(x, y, w, h)
  }
}

export async function shareWorkoutImage(h: HistoryEntry): Promise<void> {
  const canvas = document.createElement("canvas")
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  let totalVolume = 0
  let totalSets = 0
  ;(h.exercises || []).forEach((e) => {
    Object.entries(e.logged || {}).forEach(([k, x]: [string, any]) => {
      if (k === "rir") return
      const w = x.weight || 0
      const r = x.reps || 0
      if (w > 0 && r > 0) {
        totalVolume += w * r
        totalSets += 1
      }
    })
  })
  const fmtVolume =
    totalVolume >= 1000
      ? (totalVolume / 1000).toFixed(1).replace(/\.0$/, "") + " t"
      : Math.round(totalVolume) + " kg"

  // Fond dégradé
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080)
  grad.addColorStop(0, "#E63946")
  grad.addColorStop(1, "#264653")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1080)

  // Logo
  ctx.fillStyle = "rgba(255,255,255,0.95)"
  ctx.font = "900 80px -apple-system, 'Segoe UI', sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("FITSTARK", 540, 120)
  ctx.font = "700 28px -apple-system, sans-serif"
  ctx.fillText(
    new Date(h.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
    540,
    165,
  )

  // Carte centrale
  ctx.fillStyle = "rgba(255,255,255,0.10)"
  rr(ctx, 60, 215, 960, 720, 30)

  // Nom de séance
  ctx.fillStyle = "#fff"
  ctx.font = "900 100px -apple-system, sans-serif"
  ctx.fillText(h.sessionName || "Séance", 540, 320)

  // Durée + phase
  ctx.font = "700 32px -apple-system, sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.85)"
  ctx.fillText(`${h.duration || 0} min${h.phase ? " · " + h.phase : ""}`, 540, 370)

  let cursorY = 425
  if (h.wodName) {
    ctx.fillStyle = "rgba(244,162,97,0.18)"
    const wodTxt = `🔥 WOD : ${h.wodName.length > 28 ? h.wodName.slice(0, 27) + "…" : h.wodName}`
    ctx.font = "800 28px -apple-system, sans-serif"
    const wodWidth = Math.min(820, ctx.measureText(wodTxt).width + 40)
    rr(ctx, 540 - wodWidth / 2, cursorY, wodWidth, 56, 14)
    ctx.fillStyle = "#F4A261"
    ctx.fillText(wodTxt, 540, cursorY + 38)
    cursorY += 80
  }

  if (totalVolume > 0) {
    ctx.fillStyle = "rgba(42,157,143,0.18)"
    rr(ctx, 170, cursorY, 740, 110, 18)
    ctx.fillStyle = "#FFD480"
    ctx.font = "900 64px -apple-system, sans-serif"
    ctx.fillText(fmtVolume, 540, cursorY + 60)
    ctx.fillStyle = "rgba(255,255,255,0.75)"
    ctx.font = "700 22px -apple-system, sans-serif"
    ctx.fillText(`VOLUME TOTAL · ${totalSets} SETS`, 540, cursorY + 92)
    cursorY += 130
  }

  const maxExos = h.wodName ? 3 : 4
  const exos = (h.exercises || [])
    .map((e) => {
      const vals = Object.entries(e.logged || {}).filter(([k]) => k !== "rir").map(([, x]) => x as any)
      const vol = vals.reduce((s, x) => s + (x.weight || 0) * (x.reps || 0), 0)
      const max = Math.max(0, ...vals.map((x) => x.weight || 0))
      return { name: e.name, vol, max }
    })
    .filter((e) => e.vol > 0)
    .sort((a, b) => b.vol - a.vol)
    .slice(0, maxExos)
  ctx.font = "700 32px -apple-system, sans-serif"
  exos.forEach((e) => {
    ctx.textAlign = "left"
    ctx.fillStyle = "rgba(255,255,255,0.9)"
    ctx.fillText(e.name.length > 22 ? e.name.slice(0, 21) + "…" : e.name, 130, cursorY)
    ctx.textAlign = "right"
    ctx.fillStyle = "#F4A261"
    ctx.fillText(`${e.max} kg`, 950, cursorY)
    cursorY += 55
  })

  ctx.textAlign = "center"
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = "600 26px -apple-system, sans-serif"
  ctx.fillText("apexfit-da753.web.app", 540, 1020)

  await new Promise<void>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Erreur lors de la génération de l'image")
        return resolve()
      }
      const file = new File([blob], `fitstark-${new Date(h.date).toISOString().slice(0, 10)}.png`, {
        type: "image/png",
      })
      const shareText = [
        `Séance ${h.sessionName} de ${h.duration} min`,
        totalVolume > 0 ? `Volume : ${fmtVolume}` : "",
        h.wodName ? `WOD : ${h.wodName}` : "",
        "via FITStark 💪",
      ]
        .filter(Boolean)
        .join(" · ")
      const nav = navigator as any
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: `Ma séance ${h.sessionName}`, text: shareText })
        } catch {
          /* annulé par l'utilisateur */
        }
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
        alert("Image téléchargée — partage-la sur Instagram 📸")
      }
      resolve()
    }, "image/png")
  })
}
