// APEX Fitness — Cloud Sync wrapper (Firebase Auth + Firestore)
// Module ES chargé après firebase-config.js. Expose `window.apexSync` quand prêt.
// Si la config est en placeholder, le module reste inerte (mode local-only).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut,
  onAuthStateChanged
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
  } catch (e) {
    console.warn("[apex-sync] init failed:", e);
  }
}

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
    return signInWithPopup(auth, provider);
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
    await setDoc(ref, {
      ...payload,
      lastSync: serverTimestamp(),
      email: currentUser.email || null
    }, { merge: true });
    return true;
  }
};

document.dispatchEvent(new CustomEvent("apex:sync-ready"));
