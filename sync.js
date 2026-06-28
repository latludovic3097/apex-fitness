// FITStark — Cloud Sync wrapper (Firebase Auth + Firestore)
// Module ES chargé après firebase-config.js. Expose `window.apexSync` quand prêt.
// Si la config est en placeholder, le module reste inerte (mode local-only).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut as fbSignOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const cfg = window.APEX_FIREBASE_CONFIG;
const isPlaceholder =
  !cfg ||
  !cfg.apiKey ||
  cfg.apiKey === "YOUR_API_KEY" ||
  String(cfg.apiKey).includes("YOUR_API_KEY") ||
  String(cfg.projectId || "").includes("your-project");

let app, auth, db, currentUser = null;
let analytics = null;
const authListeners = new Set();

if (!isPlaceholder) {
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    // New Firestore cache API (v10+): replaces deprecated enableIndexedDbPersistence
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    onAuthStateChanged(auth, user => {
      currentUser = user;
      authListeners.forEach(cb => { try { cb(user); } catch (e) { console.warn(e); } });
    });
    // L2 fix v8.24 : récupère le résultat si l'utilisateur revient d'un signInWithRedirect
    // (popup bloquée par Safari ITP, popup blockers, mobile WebView, etc).
    // onAuthStateChanged se déclenche en parallèle ; ce catch n'est qu'un filet de
    // sécurité pour log les erreurs spécifiques au redirect flow.
    getRedirectResult(auth).catch(e => {
      if (e && e.code && e.code !== "auth/no-auth-event") {
        console.warn("[apex-sync] redirect result:", e.code);
      }
    });

    // v8.36 : Firebase Analytics (DAU/MAU, rétention, events custom)
    // Init asynchrone — si measurementId est absent ou si le browser bloque les cookies tiers,
    // analytics reste null et apexAnalytics.log() devient un noop. Aucune erreur visible.
    if (cfg.measurementId && typeof cfg.measurementId === "string" && cfg.measurementId.startsWith("G-")) {
      import("https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js")
        .then(({ getAnalytics, isSupported }) => isSupported().then(ok => {
          if (ok) {
            analytics = getAnalytics(app);
            document.dispatchEvent(new CustomEvent("apex:analytics-ready"));
          }
        }))
        .catch(e => console.warn("[apex-sync] analytics init failed:", e));
    }
  } catch (e) {
    console.warn("[apex-sync] init failed:", e);
  }
}

// Wrapper analytics : safe-to-call partout, noop si analytics pas initialisé
const _logEventRef = { fn: null };
if (!isPlaceholder && cfg.measurementId && cfg.measurementId.startsWith("G-")) {
  import("https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js")
    .then(mod => { _logEventRef.fn = mod.logEvent; })
    .catch(() => {});
}
window.apexAnalytics = {
  isEnabled: () => !!analytics,
  log(name, params) {
    if (!analytics || !_logEventRef.fn) return;
    try { _logEventRef.fn(analytics, name, params || {}); } catch (e) { console.warn("[apex-analytics]", e); }
  }
};

window.apexSync = {
  isConfigured: () => !isPlaceholder && !!app,

  getUser: () => currentUser,

  onAuthChange(cb) {
    authListeners.add(cb);
    cb(currentUser);
    return () => authListeners.delete(cb);
  },

  async signIn() {
    if (isPlaceholder || !auth) throw new Error("Firebase non configuré (cf. firebase-config.js)");
    const provider = new GoogleAuthProvider();
    // L2 fix v8.24 : popup d'abord (UX fluide), sinon fallback redirect.
    // Couvre Safari ITP, popup blockers, mobile WebView, browsers en mode embarqué.
    try {
      return await signInWithPopup(auth, provider);
    } catch (e) {
      const fallback = [
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
        "auth/web-storage-unsupported"
      ];
      if (e && fallback.includes(e.code)) {
        console.warn("[apex-sync] popup failed (" + e.code + "), fallback redirect");
        return signInWithRedirect(auth, provider);
      }
      throw e;
    }
  },

  async signOut() {
    if (!auth) return;
    return fbSignOut(auth);
  },

  // Lit le doc cloud de l'utilisateur courant. Renvoie null si pas connecté ou doc inexistant.
  async pull() {
    if (!currentUser || !db) return null;
    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },

  // Écrit le snapshot dans le doc cloud (merge: true pour ne pas écraser des champs futurs).
  async push(payload) {
    if (!currentUser || !db) return false;
    const ref = doc(db, "users", currentUser.uid);
    // L10 v8.24 : transmet aussi le tracking d'acquisition (UTM source/medium/campaign)
    // si l'user en a un en localStorage. Aide à mesurer quel canal marche post-launch.
    // 100 % RGPD : seulement les paramètres UTM que l'user a en URL, jamais d'IP ni
    // fingerprint. Si pas d'UTM (visite directe), le champ n'est pas envoyé.
    let acquisition = null;
    try {
      const raw = localStorage.getItem("apex_acquisition");
      if (raw) acquisition = JSON.parse(raw);
    } catch (e) {}
    await setDoc(ref, {
      ...payload,
      ...(acquisition ? { acquisition } : {}),
      lastSync: serverTimestamp(),
      email: currentUser.email || null
    }, { merge: true });
    return true;
  }
};

document.dispatchEvent(new CustomEvent("apex:sync-ready"));
