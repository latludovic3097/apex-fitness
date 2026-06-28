import { useEffect, useState } from "react"
import { I18nProvider } from "@/i18n/I18nProvider"
import { useStore, needsOnboarding } from "@/store/useStore"
import { subscribeAuth } from "@/lib/firebase"
import { CLOUD_OPTIN_KEY } from "@/components/CloudSyncSection"
import { BottomNav } from "@/components/BottomNav"
import { HomeScreen } from "@/screens/HomeScreen"
import { SessionScreen } from "@/screens/SessionScreen"
import { HistoryScreen } from "@/screens/HistoryScreen"
import { NutritionScreen } from "@/screens/NutritionScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { OnboardingScreen } from "@/screens/OnboardingScreen"
import { CoreScreen } from "@/screens/CoreScreen"
import { CardioScreen } from "@/screens/CardioScreen"
import { BodyMapScreen } from "@/screens/BodyMapScreen"
import { ProgramWizardScreen } from "@/screens/ProgramWizardScreen"
import { FinishScreen } from "@/screens/FinishScreen"
import { GroceryListScreen } from "@/screens/GroceryListScreen"
import { MealPlanScreen } from "@/screens/MealPlanScreen"

function MainApp() {
  const view = useStore((s) => s.view)
  const sess = useStore((s) => s.sess)

  // Séance active → plein écran, nav masquée.
  if (sess && view === "session") return <SessionScreen />
  // Écran de fin de séance → plein écran.
  if (view === "finish") return <FinishScreen />
  // Wizard a sa propre barre d'action fixe en bas → masque la BottomNav pour éviter
  // qu'elle se superpose et intercepte les clics sur "Continuer" (même z-index/position).
  if (view === "wizard") return <ProgramWizardScreen />

  let screen
  switch (view) {
    case "home":
      screen = <HomeScreen />
      break
    case "history":
      screen = <HistoryScreen />
      break
    case "nutrition":
      screen = <NutritionScreen />
      break
    case "settings":
      screen = <SettingsScreen />
      break
    case "bodymap":
      screen = <BodyMapScreen />
      break
    case "core":
      screen = <CoreScreen />
      break
    case "cardio":
      screen = <CardioScreen />
      break
    case "grocery":
      screen = <GroceryListScreen />
      break
    case "mealplan":
      screen = <MealPlanScreen />
      break
    default:
      screen = <HomeScreen />
  }

  return (
    <>
      {screen}
      <div className="h-[75px]" />
      <BottomNav />
    </>
  )
}

export default function App() {
  const [onboarding, setOnboarding] = useState(() => needsOnboarding())
  const pullMerge = useStore((s) => s.cloudPullMerge)

  // Reprend la sync cloud au démarrage si l'utilisateur s'était connecté.
  useEffect(() => {
    if (localStorage.getItem(CLOUD_OPTIN_KEY) !== "1") return
    let unsub: (() => void) | undefined
    let did = false
    subscribeAuth((u) => {
      if (u && !did) {
        did = true
        pullMerge()
      }
    }).then((fn) => {
      unsub = fn
    })
    return () => unsub?.()
  }, [pullMerge])

  return (
    <I18nProvider>
      {onboarding ? (
        <OnboardingScreen onComplete={() => setOnboarding(false)} />
      ) : (
        <MainApp />
      )}
    </I18nProvider>
  )
}
