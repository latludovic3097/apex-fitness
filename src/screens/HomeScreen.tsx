import { useStore } from "@/store/useStore"
import { Header } from "@/components/Header"
import { PathologyBanner } from "@/blocks/home/PathologyBanner"
import { StreakBanner } from "@/blocks/home/StreakBanner"
import { StatsRow } from "@/blocks/home/StatsRow"
import { OneRepMaxBlock } from "@/blocks/home/OneRepMaxBlock"
import { PeriodizationBlock } from "@/blocks/home/PeriodizationBlock"
import { RemindersBlock } from "@/blocks/home/RemindersBlock"
import { RecommendationBlock } from "@/blocks/home/RecommendationBlock"
import { PplGrid } from "@/blocks/home/PplGrid"
import { CustomProgramBlock } from "@/blocks/home/CustomProgramBlock"
import { WeeklyPlanBlock } from "@/blocks/home/WeeklyPlanBlock"
import { ToolsChips } from "@/blocks/home/ToolsChips"
import { WellnessBlock } from "@/blocks/home/WellnessBlock"
import { TrainingSection } from "@/blocks/home/TrainingSection"

export function HomeScreen() {
  // Programme perso actif → le split PPL générique (périodisation, recommandation,
  // grille PUSH/PULL/LEGS, planning) devient un système concurrent et redondant.
  const hasCustomProgram = useStore((s) => !!s.customProgram)

  return (
    <div className="pb-2">
      <Header />
      <PathologyBanner />
      <StreakBanner />
      <StatsRow />
      <OneRepMaxBlock />
      <CustomProgramBlock />
      {hasCustomProgram ? (
        <RemindersBlock />
      ) : (
        <TrainingSection>
          <PeriodizationBlock />
          <RemindersBlock />
          <RecommendationBlock />
          <PplGrid />
          <WeeklyPlanBlock />
        </TrainingSection>
      )}
      <ToolsChips />
      <WellnessBlock />
    </div>
  )
}
