# APEX Fitness — Activer la synchronisation cloud (Firebase)

Guide pas-à-pas pour activer la sync de l'historique entre tous tes appareils.
**Tout est gratuit** dans le quota Firebase Spark (1 Go Firestore, 50k reads/jour, 20k writes/jour).

---

## 1. Créer un projet Firebase

1. Va sur **https://console.firebase.google.com**
2. Clique **"Ajouter un projet"** → nomme-le `apex-fitness` (ou ce que tu veux)
3. **Désactive Google Analytics** (pas nécessaire pour cet usage)
4. Clique **"Créer le projet"** → attends ~1 min

---

## 2. Activer Authentication (Google sign-in)

### 2a. Configure l'écran de consentement OAuth (OBLIGATOIRE — sinon erreur "The requested action is invalid")

1. Va sur **https://console.cloud.google.com/apis/credentials/consent?project=TON-PROJECT-ID**
2. **User Type** : **External** → **Créer**
3. App information :
   - **App name** : nom de ton app (ex: APEX Fitness)
   - **User support email** : ton Gmail
   - **Application home page** : `https://TON-USERNAME.github.io/TON-REPO/`
   - **Authorized domains** : ⚠️ NE PAS mettre `github.io` (rejeté — Public Suffix List). Deux options : (a) laisser **vide** (OK en mode Testing, c'est facultatif), ou (b) ajouter le sous-domaine complet `TON-USERNAME.github.io` (ex: `latludovic3097.github.io`) — Google le traite comme ton domaine personnel
   - **Developer contact email** : ton Gmail
   - → **Save and Continue**
4. **Scopes** : skip → **Save and Continue**
5. **Test users** : **Add Users** → ajoute ton Gmail (sinon Google bloquera la connexion) → **Save and Continue**
6. **Summary** → **Back to Dashboard**

> L'app reste en mode "Testing" : tant que tu es dans Test users, ça fonctionne. Pour passer "In production" publique, Google demande une vérification — pas nécessaire pour usage perso ou bêta privée.

### 2b. Active le provider Google dans Firebase

1. Menu de gauche → **Build → Authentication** → **"Démarrer"**
2. Onglet **"Sign-in method"** → ligne **"Google"** → bouton **"Activer"**
3. Choisis un email de support → **Enregistrer**
4. Vérifie qu'un **"Web client ID"** apparaît dans "Web SDK configuration" (auto-créé)

### 2c. Authorized domains (liste Firebase, distincte des HTTP referrers Cloud)

1. Onglet **"Settings"** → **"Authorized domains"** → **"Ajouter un domaine"** :
   - Ajoute `TON-USERNAME.github.io` (ton domaine GitHub Pages)
   - Le `localhost` est déjà autorisé pour les tests

---

## 3. Activer Firestore Database

1. Menu de gauche → **Build → Firestore Database** → **"Créer une base de données"**
2. Sélectionne **"Démarrer en mode production"** (on configurera les règles juste après)
3. Région recommandée : **`europe-west1`** (Belgique, faible latence pour la France)
4. Clique **"Activer"** → attends ~30 sec

### 3a. Configurer les Security Rules

1. Onglet **"Rules"** dans Firestore
2. Remplace TOUT le contenu par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Clique **"Publier"** → attends la confirmation

> **Pourquoi** : ces règles garantissent qu'un utilisateur connecté ne peut lire/écrire QUE son propre document `users/{son-uid}`. Personne d'autre ne peut accéder à tes données, même avec ton API key (qui est publique par design).

---

## 4. Récupérer la config Firebase

1. Roue dentée en haut à gauche → **"Paramètres du projet"**
2. Onglet **"Général"** → descends à **"Vos applications"**
3. Clique l'icône **`</>`** (web) → nomme l'app `apex-fitness-web` → **"Enregistrer l'application"**
4. Tu vois maintenant un snippet `firebaseConfig` qui ressemble à :

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "apex-fitness-xxxxx.firebaseapp.com",
  projectId: "apex-fitness-xxxxx",
  storageBucket: "apex-fitness-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef0123456789"
};
```

5. **Copie ces 6 valeurs**.

---

## 4b. ⚠️ IMPORTANT — Restreindre la clé API (sécurité)

La clé API Firebase est **publique par design** (elle identifie le projet, pas une identité), mais il faut la **restreindre** pour empêcher qu'elle soit utilisée depuis un autre domaine que le tien (sinon quelqu'un pourrait bouffer ton quota gratuit).

1. Va sur **https://console.cloud.google.com/apis/credentials?project=TON-PROJECT-ID**
2. Sous **"API Keys"** clique sur **"Browser key (auto created by Firebase)"**
3. Section **"Application restrictions"** :
   - Sélectionne **"Websites"** (HTTP referrers)
   - **"Add"** → ajoute uniquement :
     - `https://TON-USERNAME.github.io/*` (ex : `https://latludovic3097.github.io/*`)
   - **"Done"**

   > **Note localhost** : Google Cloud refuse `http://localhost:*` (wildcard de port non accepté). Tu n'en as pas besoin de toute façon — Firebase Auth utilise une liste séparée (Authentication → Settings → Authorized domains) où `localhost` est déjà autorisé par défaut. Si tu tiens à autoriser le local sur l'API key, ajoute un port spécifique (ex : `http://localhost:5173/*`).
4. Section **"API restrictions"** :
   - Sélectionne **"Restrict key"**
   - Coche uniquement :
     - **Identity Toolkit API** (Firebase Auth)
     - **Cloud Firestore API** (Firestore)
     - **Token Service API**
5. **"Save"** en bas

> Sans cette étape, GitHub Secret Scanning va alerter sur ta clé (faux positif technique, mais bonne pratique de la verrouiller). Avec les restrictions, même si quelqu'un copie ta clé, elle ne marche que depuis ton domaine et seulement pour les APIs sélectionnées.

---

## 5. Coller les valeurs dans le code

1. Ouvre `firebase-config.js` à la racine du repo (ou édite directement sur GitHub)
2. Remplace l'objet `window.APEX_FIREBASE_CONFIG = { ... }` par tes 6 valeurs :

```js
window.APEX_FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "apex-fitness-xxxxx.firebaseapp.com",
  projectId: "apex-fitness-xxxxx",
  storageBucket: "apex-fitness-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef0123456789"
};
```

3. Commit + push → GitHub Pages redéploie en ~30 sec

> **Sécurité** : ces valeurs SONT publiques. C'est OK **à condition d'avoir fait l'étape 4b** (restriction de la clé). La sécurité globale repose sur 3 couches :
> 1. **API key restrictions** (étape 4b) → la clé ne marche que depuis ton domaine
> 2. **Authorized domains** (étape 2.4) → Auth ne fonctionne que depuis tes domaines
> 3. **Firestore Security Rules** (étape 3a) → chaque user ne peut lire/écrire que son propre doc
>
> Si GitHub Secret Scanning alerte sur ta clé, c'est un **faux positif** : ferme l'alerte avec **"Close as → Revoked"** une fois les 3 couches en place.

---

## 6. Tester

1. Ouvre l'app → **Réglages** → carte **"☁️ Cloud Sync"**
2. Tu devrais voir le bouton **"🔐 Se connecter avec Google"** (au lieu du message "non configurée")
3. Clique → popup Google → connecte-toi
4. La carte affiche **"Connecté en tant que [ton email]"** + **"✅ Synchronisé"**
5. Va sur Firestore Console → Data → tu vois `users/{ton-uid}` avec ton historique

### Tester multi-appareils

1. Ouvre l'app sur ton téléphone (PWA installée)
2. Connecte-toi avec le même compte Google
3. L'historique du desktop apparaît sur le mobile
4. Fais une séance sur le mobile → l'historique se met à jour sur le desktop dans les 2 sec

---

## Fonctionnement interne

- **Push** : 2 sec après chaque modification locale (debounced) → écriture Firestore
- **Pull au sign-in** : récupère le doc cloud → fusionne avec le local (dédup historique par `date+sessionName`) → re-push le merge
- **Conflit** : last-write-wins pour les scalaires (phase, poids, etc.) ; fusion dédupliquée pour l'array `history`
- **Offline** : Firestore IndexedDB persistence activée → les changements offline sont mis en file et envoyés au retour
- **localStorage** reste la source de vérité primaire — la sync cloud est une couche additionnelle, jamais bloquante

---

## Désactiver la sync

1. Réglages → carte Cloud Sync → **"Se déconnecter"** (les données restent en local)
2. Ou : remets les valeurs placeholder dans `firebase-config.js` → l'app revient en mode local-only

---

## Quotas gratuits Firebase Spark (largement suffisants)

- **Firestore reads/jour** : 50 000 → un utilisateur normal fait ~10 reads/jour
- **Firestore writes/jour** : 20 000 → ~10 writes/jour pour 1 séance avec 30 sets
- **Stockage** : 1 Go → l'historique d'un utilisateur fait ~50 Ko sur 1 an
- **Authentication** : illimité gratuit pour Google sign-in

Tu peux supporter plusieurs centaines d'utilisateurs sans payer un centime.

---

## En cas de souci

| Erreur | Cause probable | Solution |
|---|---|---|
| **"The requested action is invalid"** (page Google) | OAuth consent screen pas configuré | Cf. étape 2a |
| `auth/unauthorized-domain` | Domaine pas dans Authorized domains | Cf. étape 2c |
| `auth/operation-not-allowed` | Provider Google pas activé | Cf. étape 2b |
| `permission-denied` à l'écriture Firestore | Security Rules pas configurées | Cf. étape 3a |
| `auth/api-key-not-valid` | apiKey mal copiée OU restrictions trop strictes | Recopie depuis Project Settings, vérifie HTTP referrers étape 4b |
| **Cette application n'est pas vérifiée** (Google) | Mode Testing (normal) | Avancé → Accéder à... → choisir compte. Tant que tu es dans Test users, OK |
| Popup bloqué | Bloqueur de popup | Autoriser pour le domaine, ou utiliser signInWithRedirect (modif code) |
| Sync ne se déclenche pas | F12 → Console → cherche `[apex-sync]` | Logs détaillés |
| Alerte "API Key leaked" sur GitHub | Faux positif (Firebase keys sont publiques par design) | Étape 4b ci-dessus + ferme l'alerte avec "Revoked" |

---

## Si tu dois rotater la clé (compromise, alerte GitHub, etc.)

1. **https://console.cloud.google.com/apis/credentials?project=TON-PROJECT-ID**
2. Clique sur "Browser key" → bouton **"Regenerate key"** en haut à droite
3. Copie la nouvelle clé
4. Vérifie/rajoute les restrictions (cf. étape 4b)
5. Update `firebase-config.js` avec la nouvelle clé → commit + push
6. L'ancienne clé est immédiatement invalidée par Google
7. Sur GitHub : ferme l'alerte avec **"Close as → Revoked"**

L'ancienne clé reste dans l'historique git, mais ne fonctionne plus → aucun risque résiduel.
