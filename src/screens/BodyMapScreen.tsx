import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { getMuscleStats, muscleHeatColor } from "@/lib/engine"
import { MN } from "@/data/fitstark-data"
import { useI18n } from "@/i18n/I18nProvider"
import { cn } from "@/lib/utils"

interface Hotspot {
  muscle: string
  left: number
  top: number
  width: number
  height: number
}

// Positions calibrées sur muscles.svg (illustration Wikimedia, 2 silhouettes face/dos
// côte à côte). Voir attribution en bas de l'écran.
const HOTSPOTS: Hotspot[] = [
  // ─── Face (silhouette gauche) ───
  { muscle: "shoulders", left: 13, top: 16, width: 9, height: 9 },
  { muscle: "shoulders", left: 29, top: 16, width: 9, height: 9 },
  { muscle: "chest", left: 19, top: 22, width: 12, height: 8 },
  { muscle: "biceps", left: 11, top: 27, width: 7, height: 11 },
  { muscle: "biceps", left: 33, top: 27, width: 7, height: 11 },
  { muscle: "core", left: 19, top: 35, width: 12, height: 14 },
  { muscle: "quads", left: 17, top: 53, width: 7, height: 18 },
  { muscle: "quads", left: 26, top: 53, width: 7, height: 18 },
  { muscle: "calves", left: 18, top: 76, width: 7, height: 14 },
  { muscle: "calves", left: 26, top: 76, width: 7, height: 14 },
  // ─── Dos (silhouette droite) ───
  { muscle: "shoulders", left: 65, top: 16, width: 9, height: 9 },
  { muscle: "shoulders", left: 81, top: 16, width: 9, height: 9 },
  { muscle: "back", left: 70, top: 22, width: 15, height: 22 },
  { muscle: "triceps", left: 66, top: 27, width: 6, height: 11 },
  { muscle: "triceps", left: 84, top: 27, width: 6, height: 11 },
  { muscle: "hamstrings", left: 70, top: 53, width: 7, height: 18 },
  { muscle: "hamstrings", left: 78, top: 53, width: 7, height: 18 },
  { muscle: "calves", left: 71, top: 76, width: 7, height: 14 },
  { muscle: "calves", left: 77, top: 76, width: 7, height: 14 },
]

const LEGEND = [
  { c: "#2A9D8F", l: "Frais (≤2j)" },
  { c: "#5DB8A8", l: "Récent (≤5j)" },
  { c: "#F4A261", l: "À surveiller" },
  { c: "#E76F51", l: "Négligé" },
  { c: "#C0392B", l: "Oublié" },
  { c: "#c7c7cc", l: "Jamais" },
]

export function BodyMapScreen() {
  const S = useStore()
  const navTo = useStore((s) => s.navTo)
  const { tt } = useI18n()
  const [selected, setSelected] = useState<string | null>(null)

  const sel = selected ? getMuscleStats(S, selected) : null

  return (
    <div className="pb-4">
      <button onClick={() => navTo("home")} className="flex items-center gap-1 px-4 pt-5 text-sm font-bold text-muted-foreground">
        <ChevronLeft className="size-5" /> {tt("Accueil")}
      </button>
      <PageHeader title="Carte musculaire" />

      <p className="mx-4 mb-3 text-[13px] text-muted-foreground">
        {tt("Couleur = fraîcheur de chaque muscle (jours depuis la dernière sollicitation). Rouge = négligé, vert = récemment travaillé.")}
      </p>

      <div className="mx-4 mb-3 overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-sm)]">
        <div className="relative">
          <img
            src="/muscles.svg"
            alt={tt("Anatomie musculaire face et dos")}
            loading="eager"
            decoding="async"
            className="block w-full select-none"
            draggable={false}
          />
          {HOTSPOTS.map((h, i) => {
            const st = getMuscleStats(S, h.muscle)
            const color = muscleHeatColor(st.daysAgo)
            const isSel = selected === h.muscle
            return (
              <button
                key={i}
                onClick={() => setSelected(h.muscle)}
                aria-label={tt(MN[h.muscle] || h.muscle)}
                title={tt(MN[h.muscle] || h.muscle)}
                className={cn(
                  "absolute flex items-center justify-center rounded-lg border-0 bg-transparent p-0 transition-colors",
                  isSel ? "bg-primary/10 shadow-[inset_0_0_0_2px_var(--ac)]" : "hover:bg-black/[0.04]",
                )}
                style={{ left: `${h.left}%`, top: `${h.top}%`, width: `${h.width}%`, height: `${h.height}%` }}
              >
                <span
                  className={cn(
                    "size-[22px] rounded-full border-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform",
                    isSel && "scale-125",
                  )}
                  style={{ background: color }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {!selected || !sel ? (
        <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] text-center text-[13px] leading-relaxed text-muted-foreground shadow-[var(--shadow-sm)]">
          {tt("Touche un muscle. La couleur indique sa fraîcheur (jours depuis la dernière sollicitation).")}
        </div>
      ) : (
        <div
          className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] shadow-[var(--shadow-sm)]"
          style={{ borderLeft: `4px solid ${muscleHeatColor(sel.daysAgo)}` }}
        >
          <div className="mb-2.5 text-xl font-black" style={{ color: muscleHeatColor(sel.daysAgo) }}>
            {tt(MN[selected] || selected)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatBox
              value={sel.volume30 >= 1000 ? `${(sel.volume30 / 1000).toFixed(1)} t` : sel.volume30 ? `${Math.round(sel.volume30)} kg` : "—"}
              label={tt("Volume 30j")}
            />
            <StatBox value={String(sel.sessions30)} label={tt("Séances 30j")} />
            <StatBox
              value={
                sel.daysAgo === null
                  ? tt("Jamais entraîné")
                  : sel.daysAgo === 0
                    ? tt("Aujourd'hui")
                    : sel.daysAgo === 1
                      ? tt("Hier")
                      : tt("Il y a {n} j", { n: sel.daysAgo })
              }
              label={tt("Dernière séance")}
              small
            />
            <StatBox value={sel.max1RM ? `${sel.max1RM} kg` : "—"} label={tt("Meilleur 1RM")} />
          </div>
        </div>
      )}

      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] shadow-[var(--shadow-sm)]">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{tt("Légende")}</div>
        <div className="flex flex-wrap gap-2.5">
          {LEGEND.map((x) => (
            <div key={x.l} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-3.5 rounded-[3px]" style={{ background: x.c }} />
              {tt(x.l)}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mb-2 text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
        {tt("Illustration")} :{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg"
          target="_blank"
          rel="noreferrer"
          className="text-[#06b6d4]"
        >
          Muscles_front_and_back.svg
        </a>{" "}
        · Tomáš Kebert &amp; umimeto.org ·{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="text-[#06b6d4]">
          CC BY-SA 4.0
        </a>
      </div>
    </div>
  )
}

function StatBox({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div className="rounded-xl bg-secondary p-3 text-center">
      <div className={cn("font-black text-foreground", small ? "text-sm" : "text-lg")}>{value}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}
