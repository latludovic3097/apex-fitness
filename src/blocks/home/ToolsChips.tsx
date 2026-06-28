import { Map, Calculator, Dna } from "lucide-react"
import { useStore } from "@/store/useStore"
import { PlateCalculatorDialog } from "@/components/PlateCalculatorDialog"
import { SectionTitle } from "@/components/SectionTitle"
import { useI18n } from "@/i18n/I18nProvider"

export function ToolsChips() {
  const navTo = useStore((s) => s.navTo)
  const { tt } = useI18n()

  return (
    <>
      <SectionTitle>Outils</SectionTitle>
      <div className="mx-4 mb-3.5 rounded-2xl border border-border bg-card p-2.5 shadow-[var(--shadow-sm)]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button
            onClick={() => navTo("bodymap")}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-secondary px-3.5 text-[13px] font-bold text-primary active:scale-[0.97]"
          >
            <Map className="size-[18px]" />
            {tt("Carte musculaire")}
          </button>
          <PlateCalculatorDialog
            trigger={
              <button className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-secondary px-3.5 text-[13px] font-bold text-primary active:scale-[0.97]">
                <Calculator className="size-[18px]" />
                {tt("Plate calculator")}
              </button>
            }
          />
          <button
            onClick={() => navTo("wizard")}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-secondary px-3.5 text-[13px] font-bold text-primary active:scale-[0.97]"
          >
            <Dna className="size-[18px]" />
            {tt("Programme perso IA")}
          </button>
        </div>
      </div>
    </>
  )
}
