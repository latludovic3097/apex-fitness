import { useRef } from "react"
import { Download, Upload, Trash2, FileSpreadsheet } from "lucide-react"
import { PageHeader } from "@/components/Header"
import { useStore } from "@/store/useStore"
import { useI18n } from "@/i18n/I18nProvider"
import { exportCSV, isDeloadActive, getDeloadDay } from "@/lib/engine"
import { mergeHistory } from "@/data/fitstark-data"
import { SectionTitle } from "@/components/SectionTitle"
import { CloudSyncSection } from "@/components/CloudSyncSection"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { GoalId, PathologyId } from "@/store/types"

const GOALS: { id: GoalId; emoji: string; label: string }[] = [
  { id: "force", emoji: "💪", label: "Force" },
  { id: "muscle", emoji: "🔥", label: "Muscle" },
  { id: "lean", emoji: "🌿", label: "M'affiner" },
  { id: "rehab", emoji: "🦴", label: "Reprise" },
]
const PATHS: { id: PathologyId; emoji: string; label: string }[] = [
  { id: "l5", emoji: "🦴", label: "Lombaires L5-S1" },
  { id: "shoulder", emoji: "💪", label: "Épaules" },
  { id: "knee", emoji: "🦵", label: "Genoux" },
  { id: "wrist", emoji: "✋", label: "Poignets" },
  { id: "elbow", emoji: "🦴", label: "Coudes" },
]

export function SettingsScreen() {
  const S = useStore()
  const { lang, setLang } = useI18n()
  const setGoal = useStore((s) => s.setGoal)
  const togglePathology = useStore((s) => s.togglePathology)
  const activateDeload = useStore((s) => s.activateDeload)
  const deactivateDeload = useStore((s) => s.deactivateDeload)
  const navTo = useStore((s) => s.navTo)
  const clearCustomProgram = useStore((s) => s.clearCustomProgram)
  const importData = useStore((s) => s.importData)
  const wipe = useStore((s) => s.wipe)
  const fileRef = useRef<HTMLInputElement>(null)
  const deloadOn = isDeloadActive(S)

  function downloadBackup() {
    const data = {
      history: S.hist,
      phase: S.phase,
      cardio: S.cardio,
      core: S.core,
      nut: S.nut,
      health: S.health,
      goal: S.goal,
    }
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }))
    a.download = `fitstark-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || "")
        const data = JSON.parse(text)
        const merged = mergeHistory(data.history || [], S.hist)
        importData({ ...data, history: merged.merged })
        alert(`Import : ${merged.added} séances ajoutées, ${merged.skipped} doublons ignorés.`)
      } catch {
        alert("Fichier invalide.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="pb-4">
      <PageHeader title="Réglages" />

      {/* Langue */}
      <SectionTitle>Langue</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="flex gap-2">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "flex-1 rounded-xl border-[1.5px] py-3 text-sm font-bold",
                lang === l ? "border-primary bg-primary text-white" : "border-border bg-secondary",
              )}
            >
              {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
            </button>
          ))}
        </div>
      </div>

      {/* Objectif */}
      <SectionTitle>Mon objectif</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-4 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-[1.5px] py-3 text-xs font-bold",
                S.goal === g.id ? "border-primary bg-[var(--ac10)] text-primary" : "border-border bg-secondary text-secondary-foreground",
              )}
            >
              <span className="text-xl">{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pathologies */}
      <SectionTitle>Zones sensibles (substitutions auto)</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="space-y-2">
          {PATHS.map((p) => {
            const active = S.health.pathologies.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => togglePathology(p.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border-[1.5px] px-4 py-3 text-left",
                  active ? "border-[var(--ok)] bg-[var(--ok10)]" : "border-border bg-secondary",
                )}
              >
                <span className="font-semibold">
                  {p.emoji} {p.label}
                </span>
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-xs font-black text-white",
                    active ? "bg-[var(--ok)]" : "bg-border",
                  )}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Deload */}
      <SectionTitle>Deload (récupération)</SectionTitle>
      <div className="mx-4 mb-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        <div>
          <div className="font-bold">Semaine de deload</div>
          <div className="text-xs text-muted-foreground">
            {deloadOn ? `Actif — jour ${getDeloadDay(S)}/7 (-20% charges)` : "Charges réduites 7 jours"}
          </div>
        </div>
        <Switch checked={deloadOn} onCheckedChange={(v) => (v ? activateDeload() : deactivateDeload())} />
      </div>

      {/* Sync cloud */}
      <CloudSyncSection />

      {/* Programme perso IA */}
      <SectionTitle>🧬 Entraînement personnalisé IA</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        {S.customProgram ? (
          <>
            <div className="font-bold">
              {(S.customProgram.methodName as any)?.[lang] || (S.customProgram.methodName as any)?.fr}
            </div>
            <div className="text-xs text-muted-foreground">
              {S.customProgram.duration} sem · {S.customProgram.frequency}×/sem · {S.customProgram.machines.length} machines
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => navTo("wizard")}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground"
              >
                Régénérer
              </button>
              <button
                onClick={() => {
                  if (confirm("Supprimer ton programme personnalisé ?")) clearCustomProgram()
                }}
                className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground"
              >
                Supprimer
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => navTo("wizard")}
            className="w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
          >
            🧬 Créer mon programme sur mesure
          </button>
        )}
      </div>

      {/* Données */}
      <SectionTitle>Données</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-2 gap-2">
          <DataBtn icon={FileSpreadsheet} label="Export CSV" onClick={() => exportCSV(S)} />
          <DataBtn icon={Download} label="Backup JSON" onClick={downloadBackup} />
          <DataBtn icon={Upload} label="Importer" onClick={() => fileRef.current?.click()} />
          <DataBtn
            icon={Trash2}
            label="Tout effacer"
            danger
            onClick={() => {
              if (confirm("Effacer toutes tes données ? (pense à faire un backup avant)")) wipe()
            }}
          />
          <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={onImport} />
        </div>
      </div>

      <p className="mx-4 mt-2 text-center text-xs text-muted-foreground">
        FITStark v9.0 · 100% local · open source · données privées (RGPD)
      </p>
    </div>
  )
}

function DataBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Download
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-sm font-bold",
        danger ? "text-primary" : "text-secondary-foreground",
      )}
    >
      <Icon className="size-4" /> {label}
    </button>
  )
}
