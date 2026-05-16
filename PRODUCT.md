# Product

## Register

product

## Users

Trois personas, par ordre de priorité :

1. **Le lifter blessé** (primaire) — 28-45 ans, pathologie lombaire (L5-S1 typiquement), veut continuer à s'entraîner sans aggraver. Marché : 46-106M de personnes dans le monde (23-53% des lifters ont des douleurs de dos). Aucune autre app musculation ne traite ce besoin.
2. **L'intermédiaire structuré** — 25-40 ans, veut un PPL avec périodisation scientifique sans payer un coach 100€/mois.
3. **Le CrossFitter hybride** — veut tracker force ET WODs dans une seule app, pas deux.

**Contexte d'usage** : en salle de sport, smartphone en main, entre deux sets, fatigué, wifi instable, parfois en sueur. Lectures de 0.5 à 3 secondes. Touch uniquement, jamais clavier. Lumière variable (néons agressifs ou pénombre).

**Job to be done** : "Je veux savoir quoi faire au prochain set, combien charger, et que ça soit enregistré sans réfléchir."

## Product Purpose

APEX Fitness est une PWA d'entraînement complète (Force + Cardio + Core + Nutrition) en français, 100% locale, zéro pub, zéro abonnement, ~120KB.

Elle se différencie sur quatre axes :

1. **Adaptation aux pathologies lombaires** (L5-S1) — programme Core Heavy 12 semaines anti-flexion intégré, substitutions automatiques (bent-over row → bench-supported DB row), alertes contextuelles temps réel (Romanian Deadlift, Back Squat, OHP).
2. **Progression scientifiquement validée** — protocole APRE (Huang 2025, SUCRA 93%), McGill Big 3 (McGill 2016), Mifflin-St Jeor 1990, dual formula 1RM (Epley + Brzycki ≤10 reps, Mayhew >10).
3. **WODs rotatifs LRU** intégrés au programme de force (15 WODs total, rotation automatique).
4. **Tracking timestamp-absolu** — timer basé sur `Date.now()` + `requestAnimationFrame` (anti-throttle navigateur), persistance temps réel des sets en localStorage, restauration session active après fermeture.

Sources scientifiques sont citées ouvertement (10 références peer-reviewed dans la spec). Le PWA fonctionne offline après installation. Service worker auto-update avec toast cliquable.

**Succès** = (a) un lifter avec hernie discale finit une séance complète sans douleur aggravée, (b) ses données sont là demain, dans un mois, sur son nouveau téléphone.

## Brand Personality

**Trois mots** : *rigoureux, bienveillant, accessible*.

- **Rigoureux** : chaque feature affichée a une source scientifique derrière. Pas de "recommandé par nos experts", des citations nominatives (Huang 2025, McGill 2016, Mifflin 1990).
- **Bienveillant** : adapte le programme au corps, pas l'inverse. Le mode L5-S1 est par défaut, pas un addon. Disclaimer médical avant la première séance. Backup JSON forcé avant tout effacement.
- **Accessible** : zéro abonnement, zéro pub, zéro tracking, 100% local. La science d'élite mise à disposition d'un public qui n'a pas les moyens d'un coach pro ou d'un kiné spécialisé performance.

**Tone of voice** : direct, factuel, technique quand il le faut (RIR, APRE, Brzycki) sans condescendance. Français. Vouvoiement absent — usage personnel, on tutoie. Pas de "Bravo !" gamifié, pas d'emojis félicitations. L'app valide via les chiffres (1RM estimé, fatigue score) pas via la flatterie.

## Anti-references

À ne SURTOUT PAS ressembler à :

- **Apps fitness mainstream gamifiées** — MyFitnessPal, Strava, Nike Training Club, Freeletics, Strong : badges, streaks, push notifs agressives, copy "Tu as tué ta séance !", hero gradient or/violet, popups premium déguisés.
- **SaaS template AI-slop** — gradient text, glassmorphism décoratif, side-stripe borders multi-couleurs, hero metric cliché (gros chiffre + label + flèche verte), cartes identiques en grille infinie.
- **Crypto/neon-on-black** — palette cyan/violet saturée, animations agressives, "trade your gains".

Le piège secondaire à éviter : se réfugier dans l'**éditorial sport-magazine** (typo display lourde, mises en page "Men's Health 2019") pour fuir le SaaS. Pas mieux.

## Design Principles

Par ordre de priorité décroissante (les principes du haut écrasent ceux du bas en cas de conflit) :

1. **Lisibilité mobile une main, en 0.5 seconde.** L'utilisateur est en salle, fatigué, parfois en sueur. Tout élément critique (charge à mettre, reps cible, timer) doit être lisible immédiatement sans pincer, sans tourner le téléphone, sans réfléchir. Hiérarchie typographique > densité d'info. Touch targets ≥44px, jamais en bas-bas où le pouce ne va pas.
2. **Tracking fiable, sacré.** L'app peut être moche, mais elle ne doit JAMAIS perdre une donnée. Timer = `Date.now()` absolu. Sets sauvés à chaque `onchange`. Session active restaurable. Backup JSON forcé avant tout `confirm()` destructif. Si on doute, on persiste.
3. **L5-S1 safe by default.** L'adaptation pathologie n'est pas un toggle dans les réglages, c'est le mode normal. Les substitutions, alertes, exclusions (sit-up, hyperextension) sont activées d'office. Le user qui n'a pas de problème de dos ne voit rien de spécial.
4. **Science visible, sources nommées.** Chaque feature numérique majeure (APRE, 1RM, fatigue score, BMR) a sa citation accessible. Pas de "selon les études", on cite Huang 2025, McGill 2016, Mifflin 1990. Cette discipline est la barrière contre le "wellness influenceur".
5. **Discipline brand : un rouge, le reste neutre.** `#E63946` est la voix de la marque. `--ok` vert pour le wellness (cardio/core/nutrition). Le reste (texte, bordures, fonds) est en niveaux de gris légèrement teintés. Pas de gradient text. Pas de side-stripe borders > 1px. Pas de cartes identiques en série.

## Accessibility & Inclusion

- **Pinch-to-zoom autorisé** (`maximum-scale=5`, pas `user-scalable=no`). Bug historique connu, fixé.
- **Mobile-first strict** : design pour 480px max, adapté tablette/desktop ensuite mais le téléphone est la cible #1.
- **Contraste mode sombre** : interface principale en sombre (réduction fatigue oculaire salle de sport éclairée), texte clair sur fond sombre, ratio ≥4.5:1 sur les éléments critiques.
- **Touch targets ≥44px** sur tous les boutons d'action en séance (input poids/reps, bouton "set complété", bouton "exercice suivant").
- **Reduced motion** : respecter `prefers-reduced-motion: reduce`. Pas d'animations décoratives. Le cercle SVG du timer est utile, pas décoratif.
- **Indépendance couleur** : le code couleur APRE (🔴🟠🟢🔵⚪) doit toujours être doublé d'une étiquette texte ("trop lourd -5kg", "optimal", etc.). Aucune info portée uniquement par la couleur.
- **Pas de tracking utilisateur** : pas d'analytics tiers, pas de cookies tiers. Firebase Auth + Firestore uniquement pour la sync utilisateur explicitement loggé.
- **Disclaimer médical** au premier lancement, acceptation requise, persisté localement.
