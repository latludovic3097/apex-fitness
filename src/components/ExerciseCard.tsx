import { useState } from "react"
import { TriangleAlert, Youtube, BookOpen, Repeat } from "lucide-react"
import { useStore } from "@/store/useStore"
import { getSuggestion, get1RM } from "@/lib/engine"
import { I, MN, MC, MACHINES, getAlternativeExercises } from "@/data/fitstark-data"
import { useI18n } from "@/i18n/I18nProvider"
import { RestTimer } from "./RestTimer"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/store/types"

function imgUrl(src: string) {
  return src.startsWith("http") ? src : I + src
}

/** Libellés des 2 colonnes de saisie selon le type de log de l'exercice. */
const COL_LABELS: Record<string, [string, string]> = {
  weight: ["Kg", "Reps"],
  reps_bw: ["Lest", "Reps"],
  cardio: ["Min", "Dist"],
  time: ["Sec", "Tours"],
  distance_load: ["Kg", "m"],
}

export function ExerciseCard({ ex, position, total }: { ex: Exercise; position: number; total: number }) {
  const S = useStore()
  const logMap = useStore((s) => s.log)
  const log = logMap[ex.id!] || {}
  const logSet = useStore((s) => s.logSet)
  const setRIR = useStore((s) => s.setRIR)
  const swapExercise = useStore((s) => s.swapExercise)
  const sess = useStore((s) => s.sess)
  const customProgram = useStore((s) => s.customProgram)
  const { lang } = useI18n()

  const [swapOpen, setSwapOpen] = useState(false)

  const suggestion = getSuggestion(S, ex.name)
  const pr = get1RM(S, ex.name)
  const muscleColor = MC[ex.muscle] || "var(--ac)"
  const rir = log.rir as number | undefined
  const l5Active = S.health.pathologies.includes("l5")

  const ALL_MACHINE_IDS = (MACHINES as { id: string }[]).map((m) => m.id)
  const availableMachines = customProgram?.machines?.length ? customProgram.machines : ALL_MACHINE_IDS
  const currentIds = (sess?.exercises || []).map((e: any) => e.id).filter(Boolean)
  const alternatives = getAlternativeExercises(ex.id || "", availableMachines, customProgram?.objective || "", currentIds, 6, ex.muscle)

  function handleSwap(alt: any) {
    const replacement = {
      id: alt.id,
      name: alt.name.en || alt.name.fr,
      muscle: alt.muscle,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      type: alt.type,
      imgs: alt.imgs || null,
      yt: alt.yt || null,
      notes: "",
      logType: alt.logType || "weight",
      _substitutedFrom: ex.name,
      _substitutedFor: "équipement",
    }
    swapExercise(ex.id!, replacement as never)
    setSwapOpen(false)
  }

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-[18px] shadow-[var(--shadow-sm)]">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Exercice {position} / {total}
      </div>

      {/* Images départ / fin — côte à côte, centrées, occupent toute la largeur */}
      {ex.imgs && ex.imgs.length > 0 && (
        <div className="mb-3.5 flex justify-center gap-2.5 py-1">
          {ex.imgs.slice(0, 2).map((src, i) => (
            <div
              key={i}
              className="relative aspect-square flex-1 max-w-[48%] overflow-hidden rounded-xl border-[1.5px] border-border bg-secondary"
            >
              <img src={imgUrl(src)} alt="" className="size-full object-cover" loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 bg-black/85 py-0.5 text-center text-[11px] font-bold tracking-wide text-white">
                {i === 0 ? "DÉPART" : "FIN"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Liens */}
      <div className="mb-3.5 flex gap-2">
        {ex.mw && (
          <a
            href={ex.mw}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs font-bold text-foreground"
          >
            <BookOpen className="size-5 shrink-0" /> MuscleWiki
          </a>
        )}
        {ex.yt && (
          <a
            href={ex.yt}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs font-bold text-foreground"
          >
            <Youtube className="size-5 shrink-0" /> YouTube
          </a>
        )}
      </div>

      {/* Nom + badge muscle */}
      <div className="text-xl font-black tracking-[0.3px]">{ex.name}</div>
      <div className="mt-1 text-sm font-semibold text-secondary-foreground">
        {ex.sets} séries × {ex.reps} reps · repos {ex.rest}s
      </div>
      <span
        className="mt-2 inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
        style={{ background: muscleColor }}
      >
        {MN[ex.muscle] || ex.muscle}
      </span>

      {ex._substitutedFrom && (
        <div className="mt-2.5 rounded-xl bg-[var(--ok10)] px-3 py-2 text-xs font-semibold text-[var(--ok)]">
          ⚡ Adapté ({ex._substitutedFor}) — remplace « {ex._substitutedFrom} »
        </div>
      )}

      {/* Changer d'exercice (équipement indisponible) */}
      <button
        onClick={() => setSwapOpen((o) => !o)}
        className="mt-2.5 flex w-full items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs font-bold text-foreground"
      >
        <Repeat className="size-4 shrink-0" /> Équipement pris ? Changer d'exercice
      </button>

      {swapOpen && (
        <div className="mt-2 flex flex-col gap-1.5">
          {alternatives.length === 0 && (
            <div className="rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground">
              Aucune alternative disponible pour ce muscle avec ton matériel.
            </div>
          )}
          {alternatives.map((alt: any) => (
            <button
              key={alt.id}
              onClick={() => handleSwap(alt)}
              className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left"
            >
              {alt.imgs?.[0] && (
                <img
                  src={imgUrl(alt.imgs[0])}
                  alt=""
                  className="size-10 shrink-0 rounded-lg border border-border object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-foreground">{alt.name[lang] || alt.name.fr}</div>
                <div className="truncate text-[11px] font-medium text-muted-foreground">{alt.type}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Notes coach */}
      {ex.notes && (
        <div
          className="mt-3.5 rounded-xl border-l-[3px] border-primary bg-[var(--ac10)] px-4 py-3 text-sm font-medium leading-relaxed text-secondary-foreground"
          dangerouslySetInnerHTML={{ __html: ex.notes }}
        />
      )}

      {/* Alerte L5-S1 */}
      {l5Active && ex.l5warn && (
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border-[1.5px] border-[var(--wa)] bg-[var(--wa10)] px-3.5 py-3 text-[13px] font-semibold text-[#B97534]">
          <TriangleAlert className="size-4 shrink-0" /> {ex.l5warn}
        </div>
      )}

      {/* Suggestion APRE */}
      {suggestion && (
        <div className="mt-2.5 rounded-xl border border-[var(--info)]/20 bg-[var(--info10)] px-3 py-2.5 text-center text-[13px] font-bold text-[var(--info)]">
          🎯 {suggestion.weight} kg suggéré
          <div className="mt-0.5 text-[11px] font-medium opacity-90">{suggestion.reason}</div>
        </div>
      )}

      {/* Grille de sets — libellés adaptés au type de log */}
      <div className="mt-4">
        <div className="mb-1.5 grid grid-cols-[34px_1fr_1fr_34px] gap-1.5">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">#</span>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">{(COL_LABELS[ex.logType || "weight"] || COL_LABELS.weight)[0]}</span>
          <span className="text-[11px] font-semibold uppercase text-muted-foreground">{(COL_LABELS[ex.logType || "weight"] || COL_LABELS.weight)[1]}</span>
          <span />
        </div>
        {Array.from({ length: ex.sets }).map((_, i) => {
          const set = log[i] || {}
          const done = (set.weight || 0) > 0 && (set.reps || 0) > 0
          return (
            <div key={i} className="mb-1.5 grid grid-cols-[34px_1fr_1fr_34px] items-center gap-1.5">
              <div
                className={cn(
                  "flex size-[30px] items-center justify-center rounded-[9px] text-sm font-extrabold",
                  done ? "bg-[var(--ok10)] text-[var(--ok)]" : "bg-secondary text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <input
                type="number"
                inputMode="decimal"
                placeholder={suggestion ? String(suggestion.weight) : "—"}
                defaultValue={set.weight || ""}
                onChange={(e) => logSet(ex.id!, i, { weight: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-white px-3 py-2.5 text-center font-mono text-[15px] font-semibold outline-none focus:border-primary"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="—"
                defaultValue={set.reps || ""}
                onChange={(e) => logSet(ex.id!, i, { reps: parseInt(e.target.value) || 0 })}
                className="w-full rounded-[10px] border-[1.5px] border-border bg-white px-3 py-2.5 text-center font-mono text-[15px] font-semibold outline-none focus:border-primary"
              />
              <div className="text-center text-base">{done ? "✓" : ""}</div>
            </div>
          )
        })}
      </div>

      {/* RIR */}
      <div className="mt-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
          RIR — reps en réserve
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((v) => (
            <button
              key={v}
              onClick={() => setRIR(ex.id!, v)}
              className={cn(
                "flex-1 rounded-lg border-[1.5px] py-2 text-sm font-bold",
                rir === v
                  ? "border-[var(--info)] bg-[var(--info)] text-white"
                  : "border-border bg-card text-secondary-foreground",
              )}
            >
              {v}
              {v === 4 ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Timer de repos */}
      <RestTimer seconds={ex.rest} />

      {pr > 0 && (
        <div className="mt-3 rounded-xl bg-secondary py-2.5 text-center text-[13px] font-semibold text-secondary-foreground">
          🏆 Record perso estimé : {pr} kg (1RM)
        </div>
      )}
    </div>
  )
}
