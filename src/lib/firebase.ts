/* eslint-disable @typescript-eslint/no-explicit-any */
// FITStark — Cloud sync (Firebase Auth Google + Firestore users/{uid}).
// Port de sync.js vanilla. Le SDK Firebase est chargé en DYNAMIC IMPORT : il ne
// pèse sur le bundle que si l'utilisateur active la sync (1ère init).

// Clé API publique côté client (non secrète — la sécurité est assurée par les
// Firestore Security Rules : un user ne lit/écrit que users/{son uid}).
const CONFIG = {
  apiKey: "AIzaSyDCdDvgH5AK_wWqDaNGbTgeF4O-zHHqXYM",
  authDomain: "apexfit-da753.firebaseapp.com",
  projectId: "apexfit-da753",
  storageBucket: "apexfit-da753.firebasestorage.app",
  messagingSenderId: "1096563254641",
  appId: "1:1096563254641:web:a6ea53deb76539d787c2d0",
  measurementId: "G-L3W348Q5NT",
}

export interface CloudUser {
  uid: string
  email: string | null
  displayName: string | null
}

type AuthListener = (u: CloudUser | null) => void

interface FB {
  auth: any
  db: any
  authMod: any
  fsMod: any
}

let fb: FB | null = null
let initPromise: Promise<FB> | null = null
let currentUser: CloudUser | null = null
const listeners = new Set<AuthListener>()

function toUser(u: any): CloudUser | null {
  if (!u) return null
  return { uid: u.uid, email: u.email ?? null, displayName: u.displayName ?? null }
}

async function ensure(): Promise<FB> {
  if (fb) return fb
  if (!initPromise) {
    initPromise = (async () => {
      const appMod = await import("firebase/app")
      const authMod = await import("firebase/auth")
      const fsMod = await import("firebase/firestore")
      const app = appMod.initializeApp(CONFIG)
      const auth = authMod.getAuth(app)
      let db: any
      try {
        db = fsMod.initializeFirestore(app, {
          localCache: fsMod.persistentLocalCache({
            tabManager: fsMod.persistentMultipleTabManager(),
          }),
        })
      } catch {
        db = fsMod.getFirestore(app)
      }
      authMod.onAuthStateChanged(auth, (u: any) => {
        currentUser = toUser(u)
        listeners.forEach((cb) => {
          try {
            cb(currentUser)
          } catch (e) {
            console.warn(e)
          }
        })
      })
      // filet de sécurité si retour d'un signInWithRedirect (Safari ITP, mobile…)
      authMod.getRedirectResult(auth).catch(() => {})
      fb = { auth, db, authMod, fsMod }
      return fb
    })()
  }
  return initPromise
}

export function getCloudUser(): CloudUser | null {
  return currentUser
}

/** S'abonne aux changements d'auth (déclenche l'init Firebase à la 1ère écoute). */
export async function subscribeAuth(cb: AuthListener): Promise<() => void> {
  await ensure()
  listeners.add(cb)
  cb(currentUser)
  return () => listeners.delete(cb)
}

export async function signIn(): Promise<void> {
  const f = await ensure()
  const provider = new f.authMod.GoogleAuthProvider()
  try {
    await f.authMod.signInWithPopup(f.auth, provider)
  } catch (e: any) {
    const fallback = [
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment",
      "auth/web-storage-unsupported",
    ]
    if (e?.code && fallback.includes(e.code)) {
      await f.authMod.signInWithRedirect(f.auth, provider)
    } else {
      throw e
    }
  }
}

export async function signOutCloud(): Promise<void> {
  const f = await ensure()
  return f.authMod.signOut(f.auth)
}

export async function pull(): Promise<any | null> {
  if (!currentUser) return null
  const f = await ensure()
  const ref = f.fsMod.doc(f.db, "users", currentUser.uid)
  const snap = await f.fsMod.getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function push(payload: Record<string, any>): Promise<boolean> {
  if (!currentUser || !fb) return false
  const f = fb
  const ref = f.fsMod.doc(f.db, "users", currentUser.uid)
  await f.fsMod.setDoc(
    ref,
    { ...payload, lastSync: f.fsMod.serverTimestamp(), email: currentUser.email || null },
    { merge: true },
  )
  return true
}

// Push debouncé 2s après chaque sauvegarde locale. No-op si Firebase pas
// initialisé ou si pas connecté (n'entraîne JAMAIS le chargement du SDK).
let _timer: ReturnType<typeof setTimeout> | null = null
let _lastPayload: Record<string, any> | null = null
let _onStatus: ((s: SyncStatus) => void) | null = null
export type SyncStatus = "idle" | "syncing" | "synced" | "error"

export function onSyncStatus(cb: (s: SyncStatus) => void) {
  _onStatus = cb
}

export function schedulePush(payload: Record<string, any>) {
  _lastPayload = payload
  if (!fb || !currentUser) return // pas connecté → on ne charge pas le SDK
  if (_timer) clearTimeout(_timer)
  _onStatus?.("syncing")
  _timer = setTimeout(async () => {
    try {
      await push(_lastPayload || payload)
      _onStatus?.("synced")
    } catch (e) {
      console.warn("[cloud] push failed", e)
      _onStatus?.("error")
    }
  }, 2000)
}
