---
name: run-tests
description: Run the APEX Fitness unit test suite (tests.html) via Playwright and report failures. Use when core.js, state.js, or data.js is modified, or before any deployment.
user-invocable: true
allowed-tools: Read, Bash, Glob, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot
---

# Run Tests

Lance la suite de tests unitaires de `tests.html` via Playwright et rapporte uniquement les échecs.

## Étapes

1. Vérifier que le serveur local tourne (ouvrir `tests.html` directement en file:// OU via http://localhost si serveur actif)
2. Naviguer vers `tests.html` avec Playwright
3. Attendre que la page soit chargée (le script s'exécute automatiquement au chargement)
4. Prendre un snapshot pour lire les résultats `.pass` / `.fail` / `.summary`
5. Parser et rapporter

## Commandes

```bash
# Option 1 — serveur local actif
# → navigate vers http://localhost:8080/tests.html (ou le port utilisé)

# Option 2 — ouvrir directement le fichier (si pas de serveur)
# → navigate vers file:///D:/AgentsIA/FitnessApp/apex-fitness-repo/tests.html
```

## Ce que teste tests.html

- **calc1RM** : formules Epley, Brzycki, Mayhew — précision ±2.7kg
- **getAPREAdjustment** : tables APRE 6 / 10 / 3 — ajustements de charge
- **Fonctions utilitaires** : esc(), formatTime(), etc.

## Format du rapport

```
=== APEX TESTS ===
Total : {N} tests | ✅ {pass} PASS | ❌ {fail} FAIL

Échecs :
  ❌ [Suite] — {nom du test}
     Attendu : {expected}
     Obtenu  : {actual}

Verdict : ✅ ALL PASS | 🔴 {N} FAILURES — ne pas déployer
```

## Gotchas

- `tests.html` charge uniquement `core.js` — pas `state.js`, `data.js`, `ui.js`. Seules les fonctions pures de `core.js` sont testées.
- Si le navigateur Playwright n'est pas lancé, utilise `mcp__playwright__browser_navigate` avec `file://` en chemin absolu.
- La page affiche un bloc `.summary.ok` (fond vert) si tous les tests passent, `.summary.ko` (fond rouge) sinon.
- Ne pas déployer sur GitHub Pages si des tests échouent.
