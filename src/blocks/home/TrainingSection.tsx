import type { ReactNode } from "react"
import { Dumbbell } from "lucide-react"
import { useI18n } from "@/i18n/I18nProvider"

/** Conteneur visuel pour regrouper les blocs liés à l'entraînement standard
 *  (Programme de base, Rappels, Recommandé, PPL, Planning). Bordure douce
 *  + halo coloré pour signaler qu'ils traitent du même thème. */
export function TrainingSection({ children }: { children: ReactNode }) {
  const { tt } = useI18n()
  return (
    <section
      aria-labelledby="training-group-title"
      className="mx-3 my-3 rounded-3xl border-[1.5px] border-primary/25 bg-gradient-to-b from-[var(--ac10)]/40 to-transparent px-1 py-2 shadow-[0_0_0_4px_rgba(230,57,70,0.04)]"
    >
      <div
        id="training-group-title"
        className="mx-3 mb-1 mt-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[3px] text-primary"
      >
        <Dumbbell className="size-3.5" />
        {tt("Entraînement")}
      </div>
      <div className="-mx-3">{children}</div>
    </section>
  )
}
