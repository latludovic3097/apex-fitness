// APEX Fitness — Core pure functions (testables)
// Chargé par index.html ET tests.html. Aucune dépendance au state global S.

// ─── XSS ESCAPE ───
// Utilisé pour toutes les valeurs user-controllable (notes, noms importés CSV/JSON)
function esc(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

// ─── 1RM ESTIMATION ───
// ≤10 reps : moyenne Epley + Brzycki (DiStasio 2014, ±2.7kg)
// >10 reps : Mayhew (meilleur à haut volume)
function calc1RM(w, r){
  if(!w || !r || r <= 0) return 0;
  if(r === 1) return w;
  if(r <= 10){
    const epley = w * (1 + r/30);
    const brzycki = w / (1.0278 - 0.0278 * r);
    return Math.round((epley + brzycki) / 2);
  }
  return Math.round(w / (0.522 + 0.419 * Math.exp(-0.055 * r)));
}

// ─── APRE ADJUSTMENT ───
// Huang et al. 2025 : APRE classé #1 (SUCRA 93%)
// Tables APRE 6 (Force ≤6), APRE 10 (Hyper 7-12), APRE 3 (Deload >12)
function getAPREAdjustment(repsPerformed, targetRM){
  if(targetRM <= 6){
    if(repsPerformed <= 2) return { setAdj: -5, nextAdj: -5, status: "trop lourd" };
    if(repsPerformed <= 4) return { setAdj: -2.5, nextAdj: 0, status: "lourd" };
    if(repsPerformed <= 7) return { setAdj: 0, nextAdj: 0, status: "optimal" };
    if(repsPerformed <= 12) return { setAdj: 2.5, nextAdj: 2.5, status: "progression" };
    return { setAdj: 5, nextAdj: 5, status: "trop léger" };
  }
  if(targetRM <= 12){
    if(repsPerformed <= 6) return { setAdj: -5, nextAdj: -5, status: "trop lourd" };
    if(repsPerformed <= 8) return { setAdj: -2.5, nextAdj: 0, status: "lourd" };
    if(repsPerformed <= 12) return { setAdj: 0, nextAdj: 0, status: "optimal" };
    if(repsPerformed <= 16) return { setAdj: 2.5, nextAdj: 2.5, status: "progression" };
    return { setAdj: 5, nextAdj: 5, status: "trop léger" };
  }
  if(repsPerformed <= 12) return { setAdj: -2.5, nextAdj: 0, status: "lourd" };
  if(repsPerformed <= 20) return { setAdj: 0, nextAdj: 0, status: "optimal" };
  return { setAdj: 2.5, nextAdj: 2.5, status: "trop léger" };
}

// ─── NUTRITION ───
// Mifflin-St Jeor (1990) BMR + macros = poids × ratio (Helms 2014 : 2g/kg protéines en sèche)
function nutCalc(n){
  const bmr = n.sex === "M"
    ? (10*n.weight + 6.25*n.height - 5*n.age + 5)
    : (10*n.weight + 6.25*n.height - 5*n.age - 161);
  const tdee = bmr * n.activity;
  const target = Math.round(tdee + n.goal);
  const protein = Math.round(n.weight * n.proteinPerKg);
  const fat = Math.round(n.weight * n.fatPerKg);
  const carbs = Math.round((target - protein*4 - fat*9) / 4);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: target,
    protein: protein,
    fat: fat,
    carbs: Math.max(0, carbs),
    deficit: n.goal,
    weeklyChange: (n.goal*7/7700).toFixed(2)
  };
}

// ─── MERGE HISTORY ───
// Fusion dédupliquée par date(YYYY-MM-DD) + sessionName (case-insensitive)
// Pure : ne mute pas existing, retourne {merged, added, skipped}
function mergeHistory(incoming, existing){
  const sig = h => `${(h.date||"").slice(0,10)}|${(h.sessionName||h.sessionId||"").toLowerCase()}`;
  const seen = new Set((existing||[]).map(sig));
  const merged = [...(existing||[])];
  let added = 0, skipped = 0;
  (incoming||[]).forEach(h => {
    if(seen.has(sig(h))) skipped++;
    else { merged.push(h); seen.add(sig(h)); added++; }
  });
  merged.sort((a,b) => new Date(b.date) - new Date(a.date));
  return { merged: merged, added: added, skipped: skipped };
}

// ─── CSV PARSER ───
// Format : Date;Session;Phase;Durée;Exercice;Muscle;Set;Kg;Reps;Volume;1RM est.;RIR;Notes
// Supporte : séparateur ;/, BOM, dates FR/ISO/2-digit-year, virgule décimale, colonnes optionnelles, fields entre ""
function parseCSVtoHistory(text){
  text = String(text||"").replace(/^﻿/, "");
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  if(lines.length < 2) return [];
  const sep = (lines[0].match(/;/g)||[]).length >= (lines[0].match(/,/g)||[]).length ? ";" : ",";
  const splitRow = row => {
    const out = []; let cur = "", q = false;
    for(let i = 0; i < row.length; i++){
      const c = row[i];
      if(c === '"'){
        if(q && row[i+1] === '"'){ cur += '"'; i++; }
        else q = !q;
      } else if(c === sep && !q){ out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const headers = splitRow(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, ""));
  const findCol = (...names) => {
    for(const n of names){
      const i = headers.findIndex(h => h === n || h.includes(n));
      if(i >= 0) return i;
    }
    return -1;
  };
  const C = {
    date: findCol("date"),
    session: findCol("session"),
    phase: findCol("phase"),
    duration: findCol("durée","duree","duration"),
    exercise: findCol("exercice","exercise"),
    muscle: findCol("muscle"),
    set: findCol("set"),
    kg: findCol("kg","poids","weight"),
    reps: findCol("reps","rep"),
    rir: findCol("rir"),
    notes: findCol("notes","note")
  };
  if(C.date < 0 || C.exercise < 0) return [];
  const sessIdFor = name => {
    const n = (name||"").toLowerCase();
    if(n.includes("push")) return "push";
    if(n.includes("pull")) return "pull";
    if(n.includes("leg") || n.includes("jambe")) return "legs";
    if(n.includes("cardio")) return "cardio";
    return "imported";
  };
  const parseDate = s => {
    if(!s) return null;
    s = s.trim().replace(/^"|"$/g, "");
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if(m){
      let y = m[3];
      if(y.length === 2) y = "20" + y;
      return `${y}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}T00:00:00.000Z`;
    }
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(m) return `${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`;
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString();
  };
  const map = {};
  for(let li = 1; li < lines.length; li++){
    const cols = splitRow(lines[li]);
    const dRaw = cols[C.date];
    if(!dRaw) continue;
    const iso = parseDate(dRaw);
    if(!iso) continue;
    const sessName = (C.session >= 0 ? cols[C.session] : "") || "Importé";
    const exName = cols[C.exercise] || "";
    if(!exName) continue;
    const key = iso.slice(0,10) + "|" + sessName.toLowerCase();
    if(!map[key]){
      map[key] = {
        id: "" + new Date(iso).getTime() + Object.keys(map).length,
        sessionId: sessIdFor(sessName),
        sessionName: sessName,
        phase: C.phase >= 0 ? (cols[C.phase] || "") : "",
        wodName: "",
        date: iso,
        duration: C.duration >= 0 ? parseInt(cols[C.duration]) || 0 : 0,
        exercises: [],
        notes: ""
      };
    }
    const entry = map[key];
    let ex = entry.exercises.find(e => e.name === exName);
    if(!ex){
      ex = {
        id: "imp_" + exName.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0,40),
        name: exName,
        sets: 0,
        reps: "",
        muscle: C.muscle >= 0 ? (cols[C.muscle] || "") : "",
        logged: {}
      };
      if(C.rir >= 0){
        const rv = cols[C.rir];
        if(rv !== "" && rv !== undefined){
          const r = parseInt(rv);
          if(!isNaN(r)) ex.rir = r;
        }
      }
      entry.exercises.push(ex);
    }
    if(C.set >= 0 && cols[C.set]){
      const si = parseInt(cols[C.set]) - 1;
      if(si >= 0){
        const w = parseFloat((cols[C.kg]||"").replace(",", ".")) || 0;
        const r = parseInt(cols[C.reps]) || 0;
        if(w > 0 || r > 0){
          ex.logged[si] = { weight: w, reps: r };
          ex.sets = Math.max(ex.sets, si + 1);
        }
      }
    }
    if(C.notes >= 0 && cols[C.notes] && !entry.notes){
      entry.notes = cols[C.notes];
    }
  }
  return Object.values(map).sort((a,b) => new Date(b.date) - new Date(a.date));
}

// Export Node (utile si on rajoute des tests CLI plus tard via vitest/jest)
if(typeof module !== "undefined" && module.exports){
  module.exports = { esc, calc1RM, getAPREAdjustment, nutCalc, mergeHistory, parseCSVtoHistory };
}
