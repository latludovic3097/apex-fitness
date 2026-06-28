// FITStark — Configuration Firebase
//
// 1. Va sur https://console.firebase.google.com et crée un projet (gratuit)
// 2. Active Authentication → Sign-in method → Google (toggle on)
// 3. Active Firestore Database → Create database → mode production → région europe-west
// 4. Project settings → "Add web app" → copie le snippet `firebaseConfig`
// 5. Remplace les valeurs ci-dessous par les tiennes
// 6. Dans Firestore → Rules, colle :
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /users/{userId} {
//            allow read, write: if request.auth != null && request.auth.uid == userId;
//          }
//        }
//      }
// 7. Authentication → Settings → Authorized domains : ajoute ton domaine de prod
//    (déjà fait pour ce projet : apexfit-da753.web.app + apexfit-da753.firebaseapp.com sont auto-autorisés
//    par Firebase Hosting)
//
// 8. (v8.36) Pour activer Firebase Analytics — DAU/MAU, rétention, événements custom :
//    a) Project settings → Integrations → Google Analytics → "Enable"
//       (choisis ou crée un compte GA4, accepte les CGU)
//    b) Project settings → General → "Your apps" → web app → onglet "Config"
//       → tu verras maintenant un champ `measurementId: "G-XXXXXXXXXX"` dans le snippet
//    c) Colle la valeur dans `measurementId` ci-dessous
//    Tant que `measurementId` reste null, Analytics est désactivé (l'app fonctionne normalement).
//
// Tant que les valeurs sont les placeholders ci-dessous, la sync cloud reste
// désactivée et l'app fonctionne en local-only (zéro changement de comportement).
window.APEX_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDCdDvgH5AK_wWqDaNGbTgeF4O-zHHqXYM",
  authDomain: "apexfit-da753.firebaseapp.com",
  projectId: "apexfit-da753",
  storageBucket: "apexfit-da753.firebasestorage.app",
  messagingSenderId: "1096563254641",
  appId: "1:1096563254641:web:a6ea53deb76539d787c2d0",
  measurementId: "G-L3W348Q5NT"  // GA4 activé v8.37 — DAU/MAU, rétention, events custom
};

