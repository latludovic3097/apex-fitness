# APEX Fitness Tracker v4.0

Programme Push/Pull/Legs adapté L5-S1 avec tracking complet.

## Fonctionnalités

- **Programme PPL** : Push, Pull, Legs + WODs
- **Périodisation 3 phases** : Force → Hypertrophie → Endurance/Deload
- **Échauffement détaillé** : McGill Big 3 + Dead Bug avec images et vidéos
- **Images anatomiques** pour chaque exercice (free-exercise-db)
- **Liens MuscleWiki + YouTube** pour tutoriels
- **Coaching** : 3 tips par exercice
- **Tracking** : sets/reps/kg avec historique détaillé
- **Export CSV** : ouvrable dans Excel directement (séparateur ;)
- **Export/Import JSON** : backup complet
- **Record précédent** affiché par exercice
- **Timer de repos** avec animation
- **PWA installable** : hors-ligne, icône écran d'accueil
- **Adapté L5-S1** : protocole de protection intégré

## Stockage des données

Les données sont en **localStorage** (navigateur). Elles persistent tant que :
- Tu ne vides pas le cache du navigateur
- Tu ne supprimes pas les données du site
- Tu ne changes pas de navigateur/téléphone

**→ Exporte régulièrement en CSV ou JSON pour sécuriser tes données.**

## Déploiement GitHub Pages (5 min)

```bash
# 1. Crée un repo sur github.com: "apex-fitness"
# 2. Clone-le
git clone https://github.com/TON-USERNAME/apex-fitness.git
cd apex-fitness

# 3. Copie tous les fichiers de ce dossier dedans
# 4. Push
git add .
git commit -m "APEX Fitness v4.0"
git push

# 5. Active GitHub Pages:
#    Settings > Pages > Source: main > / (root) > Save
#    → https://TON-USERNAME.github.io/apex-fitness/
```

Sur ton téléphone : ouvre l'URL → menu Chrome → "Ajouter à l'écran d'accueil"

## Stack

- HTML/CSS/JS vanilla (0 dépendance, 42KB)
- Images : free-exercise-db (domaine public)
- Storage : localStorage
- PWA : manifest.json + Service Worker
