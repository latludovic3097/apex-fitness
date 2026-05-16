// FITStark — Paths SVG anatomiques pour la carte musculaire
// Organisation : ANATOMY[sex].view = { bg, muscles, details }
//   bg       : éléments non cliquables (tête, mains, pieds, articulations) — gris
//   muscles  : { muscleKey: pathData|[paths] } — cliquables, fill = heat-color
//   details  : décorations (séparations pec, ab segments, etc.) — strokes fins
//
// viewBox : 0 0 200 510 par silhouette (front et back côte-à-côte → 400×510)
// Convention : x=100 = ligne médiane verticale. Les paths gauche/droite sont
//              listés séparément pour permettre des onclick groupés mais
//              un visuel symétrique correct.

const ANATOMY = {

  // ════════════════════════════════════════════════════════════════
  //   MALE
  // ════════════════════════════════════════════════════════════════
  M: {
    front: {
      // ─── Éléments décoratifs non-cliquables (gris) ───
      bg: `
        <ellipse cx="100" cy="38" rx="24" ry="30" fill="#c7c7cc"/>
        <path d="M 88 66 L 86 92 L 114 92 L 112 66 Z" fill="#c7c7cc" opacity="0.7"/>
        <path d="M 30 285 C 26 300 28 318 35 322 L 50 322 C 56 305 54 288 50 285 Z" fill="#c7c7cc" opacity="0.6"/>
        <path d="M 170 285 C 174 300 172 318 165 322 L 150 322 C 144 305 146 288 150 285 Z" fill="#c7c7cc" opacity="0.6"/>
        <ellipse cx="88" cy="408" rx="14" ry="9" fill="#c7c7cc" opacity="0.55"/>
        <ellipse cx="112" cy="408" rx="14" ry="9" fill="#c7c7cc" opacity="0.55"/>
        <path d="M 75 478 L 78 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
        <path d="M 125 478 L 122 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
      `,
      // ─── Muscles cliquables ───
      muscles: {
        // Épaules / deltoïdes (avant + médian visibles de face)
        shoulders: [
          // Gauche
          `<path d="M 60 96 C 48 100 38 112 35 128 C 33 138 36 148 42 152 L 68 152 C 72 144 73 130 71 116 C 69 106 66 98 60 96 Z"/>`,
          // Droite
          `<path d="M 140 96 C 152 100 162 112 165 128 C 167 138 164 148 158 152 L 132 152 C 128 144 127 130 129 116 C 131 106 134 98 140 96 Z"/>`
        ],
        // Pectoraux
        chest: [
          `<path d="M 72 102 C 82 100 95 100 99 110 L 99 154 C 95 162 84 164 76 158 C 70 152 65 130 72 102 Z"/>`,
          `<path d="M 128 102 C 118 100 105 100 101 110 L 101 154 C 105 162 116 164 124 158 C 130 152 135 130 128 102 Z"/>`
        ],
        // Biceps (visibles de face) + brachial
        biceps: [
          `<path d="M 36 152 C 30 162 27 180 30 200 C 32 218 39 226 47 222 C 54 218 56 206 54 192 C 52 175 48 160 42 152 Z"/>`,
          `<path d="M 164 152 C 170 162 173 180 170 200 C 168 218 161 226 153 222 C 146 218 144 206 146 192 C 148 175 152 160 158 152 Z"/>`
        ],
        // Abdominaux (rectus abdominis) — un seul path, segments visibles via "details"
        core: `<path d="M 86 158 C 92 154 108 154 114 158 L 116 274 C 110 280 90 280 84 274 Z"/>`,
        // Quadriceps
        quads: [
          `<path d="M 76 282 C 73 295 70 330 73 368 C 76 394 86 408 95 405 L 99 405 L 99 282 C 93 280 80 280 76 282 Z"/>`,
          `<path d="M 124 282 C 127 295 130 330 127 368 C 124 394 114 408 105 405 L 101 405 L 101 282 C 107 280 120 280 124 282 Z"/>`
        ],
        // Mollets visibles de face (faible mais distinct)
        calves: [
          `<path d="M 80 420 C 77 438 76 462 82 478 L 95 478 C 95 458 91 432 88 420 Z"/>`,
          `<path d="M 120 420 C 123 438 124 462 118 478 L 105 478 C 105 458 109 432 112 420 Z"/>`
        ]
      },
      // ─── Détails de définition musculaire (lignes fines) ───
      details: `
        <!-- Séparation entre pectoraux -->
        <path d="M 100 110 L 100 158" stroke="rgba(0,0,0,0.45)" stroke-width="1.2" fill="none"/>
        <!-- Linea alba abdomen -->
        <path d="M 100 160 L 100 274" stroke="rgba(0,0,0,0.4)" stroke-width="1" fill="none"/>
        <!-- 6-pack horizontaux -->
        <path d="M 88 184 L 112 184" stroke="rgba(0,0,0,0.4)" stroke-width="1" fill="none"/>
        <path d="M 88 212 L 112 212" stroke="rgba(0,0,0,0.4)" stroke-width="1" fill="none"/>
        <path d="M 88 240 L 112 240" stroke="rgba(0,0,0,0.4)" stroke-width="1" fill="none"/>
        <!-- Séparation deltoïde / pec gauche -->
        <path d="M 68 110 Q 70 130 68 152" stroke="rgba(0,0,0,0.35)" stroke-width="1" fill="none"/>
        <path d="M 132 110 Q 130 130 132 152" stroke="rgba(0,0,0,0.35)" stroke-width="1" fill="none"/>
        <!-- Vastus medialis (intérieur quad) -->
        <path d="M 92 360 Q 90 390 95 405" stroke="rgba(0,0,0,0.3)" stroke-width="1" fill="none"/>
        <path d="M 108 360 Q 110 390 105 405" stroke="rgba(0,0,0,0.3)" stroke-width="1" fill="none"/>
      `
    },
    back: {
      bg: `
        <ellipse cx="100" cy="38" rx="24" ry="30" fill="#c7c7cc"/>
        <path d="M 86 66 L 88 92 L 112 92 L 114 66 Z" fill="#c7c7cc" opacity="0.7"/>
        <path d="M 30 285 C 26 300 28 318 35 322 L 50 322 C 56 305 54 288 50 285 Z" fill="#c7c7cc" opacity="0.6"/>
        <path d="M 170 285 C 174 300 172 318 165 322 L 150 322 C 144 305 146 288 150 285 Z" fill="#c7c7cc" opacity="0.6"/>
        <ellipse cx="88" cy="408" rx="14" ry="9" fill="#c7c7cc" opacity="0.55"/>
        <ellipse cx="112" cy="408" rx="14" ry="9" fill="#c7c7cc" opacity="0.55"/>
        <path d="M 75 478 L 78 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
        <path d="M 125 478 L 122 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
      `,
      muscles: {
        // Deltoïdes postérieurs
        shoulders: [
          `<path d="M 60 96 C 48 100 38 112 35 128 C 33 138 36 148 42 152 L 68 152 C 72 144 73 130 71 116 C 69 106 66 98 60 96 Z"/>`,
          `<path d="M 140 96 C 152 100 162 112 165 128 C 167 138 164 148 158 152 L 132 152 C 128 144 127 130 129 116 C 131 106 134 98 140 96 Z"/>`
        ],
        // Trapèzes + dorsaux + lombaires (groupé "back")
        back: `<path d="M 72 92 C 80 96 92 96 100 96 C 108 96 120 96 128 92 L 132 110 C 138 130 142 160 132 200 L 124 230 C 116 248 108 252 100 252 C 92 252 84 248 76 230 L 68 200 C 58 160 62 130 68 110 Z"/>`,
        // Triceps
        triceps: [
          `<path d="M 36 152 C 30 162 27 180 30 200 C 32 218 39 226 47 222 C 54 218 56 206 54 192 C 52 175 48 160 42 152 Z"/>`,
          `<path d="M 164 152 C 170 162 173 180 170 200 C 168 218 161 226 153 222 C 146 218 144 206 146 192 C 148 175 152 160 158 152 Z"/>`
        ],
        // Ischio-jambiers
        hamstrings: [
          `<path d="M 76 282 C 73 295 70 330 73 368 C 76 394 86 408 95 405 L 99 405 L 99 282 C 93 280 80 280 76 282 Z"/>`,
          `<path d="M 124 282 C 127 295 130 330 127 368 C 124 394 114 408 105 405 L 101 405 L 101 282 C 107 280 120 280 124 282 Z"/>`
        ],
        // Mollets (gastrocnemius — bien visible de dos)
        calves: [
          `<path d="M 80 420 C 75 438 74 466 82 478 L 95 478 C 95 458 90 430 86 420 Z"/>`,
          `<path d="M 120 420 C 125 438 126 466 118 478 L 105 478 C 105 458 110 430 114 420 Z"/>`
        ]
      },
      details: `
        <!-- Colonne vertébrale -->
        <path d="M 100 96 L 100 252" stroke="rgba(0,0,0,0.4)" stroke-width="1.5" fill="none"/>
        <!-- Séparations dorsaux -->
        <path d="M 80 130 Q 86 140 92 145" stroke="rgba(0,0,0,0.3)" stroke-width="1" fill="none"/>
        <path d="M 120 130 Q 114 140 108 145" stroke="rgba(0,0,0,0.3)" stroke-width="1" fill="none"/>
        <!-- Glutes (fessiers — élément décoratif sur le bas du back) -->
        <path d="M 78 252 C 80 268 86 282 100 282 C 114 282 120 268 122 252" stroke="rgba(0,0,0,0.35)" stroke-width="1.3" fill="none"/>
        <!-- Séparation hamstrings (medial/lateral) -->
        <path d="M 88 320 L 88 395" stroke="rgba(0,0,0,0.25)" stroke-width="0.8" fill="none"/>
        <path d="M 112 320 L 112 395" stroke="rgba(0,0,0,0.25)" stroke-width="0.8" fill="none"/>
        <!-- Séparation mollets -->
        <path d="M 87 430 Q 86 450 88 472" stroke="rgba(0,0,0,0.3)" stroke-width="0.9" fill="none"/>
        <path d="M 113 430 Q 114 450 112 472" stroke="rgba(0,0,0,0.3)" stroke-width="0.9" fill="none"/>
      `
    }
  },

  // ════════════════════════════════════════════════════════════════
  //   FEMALE
  //   Différences clés : épaules + étroites, taille + marquée,
  //   hanches + larges, courbe poitrine, abdomen + lisse
  // ════════════════════════════════════════════════════════════════
  F: {
    front: {
      bg: `
        <ellipse cx="100" cy="38" rx="22" ry="28" fill="#c7c7cc"/>
        <path d="M 88 64 L 88 90 L 112 90 L 112 64 Z" fill="#c7c7cc" opacity="0.7"/>
        <!-- Cheveux légers (pour distinguer F de M) -->
        <path d="M 78 28 Q 78 56 86 70 L 86 60 Q 80 46 80 32 Z" fill="#c7c7cc" opacity="0.45"/>
        <path d="M 122 28 Q 122 56 114 70 L 114 60 Q 120 46 120 32 Z" fill="#c7c7cc" opacity="0.45"/>
        <path d="M 32 282 C 28 296 30 314 37 318 L 50 318 C 56 302 54 285 50 282 Z" fill="#c7c7cc" opacity="0.55"/>
        <path d="M 168 282 C 172 296 170 314 163 318 L 150 318 C 144 302 146 285 150 282 Z" fill="#c7c7cc" opacity="0.55"/>
        <ellipse cx="88" cy="412" rx="13" ry="8" fill="#c7c7cc" opacity="0.5"/>
        <ellipse cx="112" cy="412" rx="13" ry="8" fill="#c7c7cc" opacity="0.5"/>
        <path d="M 75 478 L 78 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
        <path d="M 125 478 L 122 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
      `,
      muscles: {
        // Épaules plus étroites
        shoulders: [
          `<path d="M 65 95 C 56 100 48 110 45 124 C 43 132 46 142 51 146 L 70 146 C 73 138 73 124 71 114 C 69 104 68 96 65 95 Z"/>`,
          `<path d="M 135 95 C 144 100 152 110 155 124 C 157 132 154 142 149 146 L 130 146 C 127 138 127 124 129 114 C 131 104 132 96 135 95 Z"/>`
        ],
        // Pectoraux + courbe poitrine (plus arrondi)
        chest: [
          `<path d="M 72 100 C 82 96 96 96 99 108 C 99 124 96 138 88 148 C 78 152 70 142 70 128 C 70 116 70 106 72 100 Z"/>`,
          `<path d="M 128 100 C 118 96 104 96 101 108 C 101 124 104 138 112 148 C 122 152 130 142 130 128 C 130 116 130 106 128 100 Z"/>`
        ],
        // Biceps + fins
        biceps: [
          `<path d="M 42 146 C 38 158 36 180 38 198 C 40 214 47 220 54 216 C 60 212 62 200 60 188 C 58 172 54 156 49 146 Z"/>`,
          `<path d="M 158 146 C 162 158 164 180 162 198 C 160 214 153 220 146 216 C 140 212 138 200 140 188 C 142 172 146 156 151 146 Z"/>`
        ],
        // Abdomen + lisse, taille + marquée
        core: `<path d="M 84 156 C 92 154 108 154 116 156 L 122 220 C 124 250 122 268 116 282 C 108 286 92 286 84 282 C 78 268 76 250 78 220 Z"/>`,
        // Hanches + larges → quads partent + écartées
        quads: [
          `<path d="M 72 290 C 68 305 66 340 70 372 C 73 396 84 410 94 405 L 99 405 L 99 290 C 90 286 76 286 72 290 Z"/>`,
          `<path d="M 128 290 C 132 305 134 340 130 372 C 127 396 116 410 106 405 L 101 405 L 101 290 C 110 286 124 286 128 290 Z"/>`
        ],
        calves: [
          `<path d="M 80 425 C 77 442 76 466 82 480 L 95 480 C 95 460 91 437 88 425 Z"/>`,
          `<path d="M 120 425 C 123 442 124 466 118 480 L 105 480 C 105 460 109 437 112 425 Z"/>`
        ]
      },
      details: `
        <!-- Courbes poitrine -->
        <path d="M 70 130 Q 80 140 92 138" stroke="rgba(0,0,0,0.4)" stroke-width="1.2" fill="none"/>
        <path d="M 130 130 Q 120 140 108 138" stroke="rgba(0,0,0,0.4)" stroke-width="1.2" fill="none"/>
        <!-- Linea alba (abdomen) — légère -->
        <path d="M 100 156 L 100 282" stroke="rgba(0,0,0,0.3)" stroke-width="0.8" fill="none"/>
        <!-- Taille (courbe naturelle) -->
        <path d="M 78 220 Q 100 224 122 220" stroke="rgba(0,0,0,0.25)" stroke-width="0.7" fill="none"/>
        <!-- Hanches -->
        <path d="M 68 290 Q 100 285 132 290" stroke="rgba(0,0,0,0.3)" stroke-width="0.8" fill="none"/>
      `
    },
    back: {
      bg: `
        <ellipse cx="100" cy="38" rx="22" ry="28" fill="#c7c7cc"/>
        <path d="M 88 64 L 88 90 L 112 90 L 112 64 Z" fill="#c7c7cc" opacity="0.7"/>
        <path d="M 76 18 Q 70 60 86 80 L 100 80 L 114 80 Q 130 60 124 18 Z" fill="#c7c7cc" opacity="0.4"/>
        <path d="M 32 282 C 28 296 30 314 37 318 L 50 318 C 56 302 54 285 50 282 Z" fill="#c7c7cc" opacity="0.55"/>
        <path d="M 168 282 C 172 296 170 314 163 318 L 150 318 C 144 302 146 285 150 282 Z" fill="#c7c7cc" opacity="0.55"/>
        <ellipse cx="88" cy="412" rx="13" ry="8" fill="#c7c7cc" opacity="0.5"/>
        <ellipse cx="112" cy="412" rx="13" ry="8" fill="#c7c7cc" opacity="0.5"/>
        <path d="M 75 478 L 78 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
        <path d="M 125 478 L 122 495 L 100 495 L 100 478 Z" fill="#c7c7cc" opacity="0.6"/>
      `,
      muscles: {
        shoulders: [
          `<path d="M 65 95 C 56 100 48 110 45 124 C 43 132 46 142 51 146 L 70 146 C 73 138 73 124 71 114 C 69 104 68 96 65 95 Z"/>`,
          `<path d="M 135 95 C 144 100 152 110 155 124 C 157 132 154 142 149 146 L 130 146 C 127 138 127 124 129 114 C 131 104 132 96 135 95 Z"/>`
        ],
        // Dos + étroit en haut, plus large vers la taille
        back: `<path d="M 74 92 C 82 96 92 96 100 96 C 108 96 118 96 126 92 L 130 110 C 134 134 134 168 126 200 L 120 232 C 112 248 106 252 100 252 C 94 252 88 248 80 232 L 74 200 C 66 168 66 134 70 110 Z"/>`,
        triceps: [
          `<path d="M 42 146 C 38 158 36 180 38 198 C 40 214 47 220 54 216 C 60 212 62 200 60 188 C 58 172 54 156 49 146 Z"/>`,
          `<path d="M 158 146 C 162 158 164 180 162 198 C 160 214 153 220 146 216 C 140 212 138 200 140 188 C 142 172 146 156 151 146 Z"/>`
        ],
        // Hanches + larges → glutes + arrondis (intégrés au début des hamstrings)
        hamstrings: [
          `<path d="M 72 290 C 68 305 66 340 70 372 C 73 396 84 410 94 405 L 99 405 L 99 290 C 90 286 76 286 72 290 Z"/>`,
          `<path d="M 128 290 C 132 305 134 340 130 372 C 127 396 116 410 106 405 L 101 405 L 101 290 C 110 286 124 286 128 290 Z"/>`
        ],
        calves: [
          `<path d="M 80 425 C 75 442 74 466 82 480 L 95 480 C 95 460 90 437 88 425 Z"/>`,
          `<path d="M 120 425 C 125 442 126 466 118 480 L 105 480 C 105 460 110 437 114 425 Z"/>`
        ]
      },
      details: `
        <path d="M 100 96 L 100 252" stroke="rgba(0,0,0,0.35)" stroke-width="1.2" fill="none"/>
        <!-- Glutes (très visibles en silhouette F) -->
        <path d="M 70 252 C 72 274 86 290 100 290 C 114 290 128 274 130 252" stroke="rgba(0,0,0,0.45)" stroke-width="1.5" fill="none"/>
        <path d="M 100 252 L 100 290" stroke="rgba(0,0,0,0.4)" stroke-width="1.1" fill="none"/>
        <!-- Hanches élargies -->
        <path d="M 68 290 Q 100 285 132 290" stroke="rgba(0,0,0,0.3)" stroke-width="0.8" fill="none"/>
        <!-- Mollets -->
        <path d="M 87 435 Q 86 455 88 474" stroke="rgba(0,0,0,0.3)" stroke-width="0.9" fill="none"/>
        <path d="M 113 435 Q 114 455 112 474" stroke="rgba(0,0,0,0.3)" stroke-width="0.9" fill="none"/>
      `
    }
  }
};
