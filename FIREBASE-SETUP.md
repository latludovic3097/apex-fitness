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

1. Menu de gauche → **Build → Authentication** → **"Démarrer"**
2. Onglet **"Sign-in method"** → ligne **"Google"** → bouton **"Activer"**
3. Choisis un email de support → **Enregistrer**
4. Onglet **"Settings"** → **"Authorized domains"** → **"Ajouter un domaine"** :
   - Ajoute `latludovic3097.github.io` (ton domaine GitHub Pages)
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

> **Sécurité** : ces valeurs SONT publiques. C'est OK. La sécurité repose 100% sur les Security Rules de Firestore (étape 3a) et sur les Authorized domains (étape 2.4). Quelqu'un qui copie ton apiKey ne peut RIEN faire avec, à moins d'avoir aussi un compte Google connecté autorisé sur ton domaine, ET les règles n'autorisent l'accès qu'à son propre document.

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
| `auth/unauthorized-domain` | Domaine pas dans Authorized domains | Cf. étape 2.4 |
| `permission-denied` à l'écriture | Security Rules pas configurées | Cf. étape 3a |
| `auth/api-key-not-valid` | apiKey mal copiée | Recopie depuis Project Settings |
| Popup bloqué | Bloqueur de popup | Autoriser pour le domaine, ou utiliser signInWithRedirect (modif code) |
| Sync ne se déclenche pas | F12 → Console → cherche `[apex-sync]` | Logs détaillés |
