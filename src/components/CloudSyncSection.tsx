import { useEffect, useRef, useState } from "react"
import { Cloud, CloudOff, LoaderCircle, Check } from "lucide-react"
import { useStore } from "@/store/useStore"
import {
  subscribeAuth,
  signIn,
  signOutCloud,
  onSyncStatus,
  getCloudUser,
  type CloudUser,
  type SyncStatus,
} from "@/lib/firebase"
import { SectionTitle } from "@/components/SectionTitle"

export const CLOUD_OPTIN_KEY = "apex_cloud_optin"

export function CloudSyncSection() {
  const [user, setUser] = useState<CloudUser | null>(getCloudUser())
  const [status, setStatus] = useState<SyncStatus>("idle")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const pullMerge = useStore((s) => s.cloudPullMerge)
  const synced = useRef(false)

  useEffect(() => {
    onSyncStatus(setStatus)
    let unsub: (() => void) | undefined
    subscribeAuth((u) => {
      setUser(u)
      if (u && !synced.current) {
        synced.current = true
        pullMerge()
      }
      if (!u) synced.current = false
    }).then((fn) => {
      unsub = fn
    })
    return () => unsub?.()
  }, [pullMerge])

  async function handleSignIn() {
    setErr(null)
    setBusy(true)
    try {
      await signIn()
      localStorage.setItem(CLOUD_OPTIN_KEY, "1")
    } catch (e: any) {
      setErr(e?.message || "Connexion impossible")
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOutCloud()
      localStorage.removeItem(CLOUD_OPTIN_KEY)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionTitle>Sync cloud (optionnel)</SectionTitle>
      <div className="mx-4 mb-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-sm)]">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <Cloud className="size-5 text-[var(--ok)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{user.email}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {status === "syncing" ? (
                    <>
                      <LoaderCircle className="size-3 animate-spin" /> Synchronisation…
                    </>
                  ) : status === "error" ? (
                    "⚠️ Erreur de sync"
                  ) : (
                    <>
                      <Check className="size-3 text-[var(--ok)]" /> Données synchronisées
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={busy}
              className="mt-3 w-full rounded-xl border border-border bg-secondary py-2.5 text-sm font-bold text-secondary-foreground disabled:opacity-50"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-secondary-foreground">
              <CloudOff className="size-5 text-muted-foreground" />
              <p className="text-[13px] leading-snug">
                Connecte-toi pour synchroniser ton historique entre tes appareils. Données privées
                (toi seul y accèdes via Firestore).
              </p>
            </div>
            <button
              onClick={handleSignIn}
              disabled={busy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-extrabold text-background disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Cloud className="size-4" />}
              Se connecter avec Google
            </button>
            {err && <div className="mt-2 text-xs text-primary">{err}</div>}
          </>
        )}
      </div>
    </>
  )
}
