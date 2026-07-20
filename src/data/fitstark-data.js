/* eslint-disable */
// @ts-nocheck
// ===== from core.js =====
// FITStark — Core pure functions (testables)
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
// ===== from data.js =====
// FITStark — Constantes et données de programme (immutables, sans logique)
// Sources : free-exercise-db (yuhonas, GitHub, domaine public) · MuscleWiki · USDA FoodData Central · Ciqual ANSES

const I = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const MN = {chest:"Pectoraux",shoulders:"Épaules",triceps:"Triceps",back:"Dos",biceps:"Biceps",quads:"Quadriceps",hamstrings:"Ischio-jambiers",calves:"Mollets",core:"Core",glutes:"Fessiers",cardio:"Cardio",arms:"Bras",full_body:"Full body",lower_back:"Lombaires"};
const MC = {chest:"#E63946",shoulders:"#457B9D",triceps:"#F4A261",back:"#457B9D",biceps:"#E76F51",quads:"#2A9D8F",hamstrings:"#264653",calves:"#E9C46A",core:"#2A9D8F",glutes:"#E76F51",cardio:"#06b6d4",arms:"#F4A261",full_body:"#8B5CF6",lower_back:"#264653"};

const PHASES = [
  {id:"force",name:"Force",color:"#E63946",numSets:5,reps:"4-6",rest:180,desc:"Charges lourdes"},
  {id:"hyper",name:"Hypertrophie",color:"#457B9D",numSets:4,reps:"8-12",rest:90,desc:"Volume modéré"},
  {id:"deload",name:"Deload",color:"#2A9D8F",numSets:3,reps:"15-20",rest:60,desc:"Récupération"}
];

// ─── WOD POOLS ───
const WODS = {
push:[
{type:"AMRAP",duration:8,name:"Push Storm",risks:["l5","shoulder","wrist"],desc:"Pectoraux + épaules + abdo en endurance cardio. 8 min pour bien transpirer.",movements:[
  {name:"10 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+proper+form"},
  {name:"10 DB Thrusters",img:I+"Dumbbell_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-thruster",yt:"https://www.youtube.com/results?search_query=dumbbell+thruster+form"},
  {name:"10 Sit-ups McGill",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-crunch",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up+form"}]},
{type:"For Time",duration:null,name:"21-15-9",risks:["l5","shoulder"],desc:"Sprint pectoraux + épaules + cardio via burpees. Pur sprint qui te met sur les genoux.",movements:[
  {name:"21-15-9 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press+form"},
  {name:"21-15-9 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{type:"EMOM",duration:10,name:"Push EMOM",risks:["l5","wrist","elbow"],desc:"Volume contrôlé pectoraux + hanches en EMOM. Bon travail technique sous fatigue.",movements:[
  {name:"Pair: 12 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"Impair: 8 Diamond Push-ups",img:I+"Push-Ups_-_Close_Triceps_Position/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-diamond-push-up",yt:"https://www.youtube.com/results?search_query=diamond+push+up+form"}]},
{type:"Tabata",duration:4,name:"Push Tabata",risks:["wrist"],desc:"Pectoraux + triceps en 4 min de pur HIIT. Brûle-graisse express.",movements:[
  {name:"Push-ups 20s on / 10s off ×8",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=tabata+push+ups"}]},
{type:"AMRAP",duration:10,name:"Ground to OH",risks:["l5","shoulder","wrist"],desc:"Full-body push + jambes via Devil's Press. Travail puissance verticale.",movements:[
  {name:"5 Devil's Press (DB)",img:I+"Dumbbell_Bench_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=devil+press+dumbbell+form"},
  {name:"10 Plate Ground-to-OH",img:I+"Clean_and_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=plate+ground+to+overhead+form"},
  {name:"15 Flutter Kicks",img:I+"Flutter_Kicks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-flutter-kicks",yt:"https://www.youtube.com/results?search_query=flutter+kicks+form"}]},
{type:"AMRAP",duration:12,name:"Press Circuit",risks:["shoulder","wrist","elbow"],desc:"Volume épaules + triceps en circuit. Pump sans charge lombaire.",movements:[
  {name:"8 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press+form"},
  {name:"10 Pike Push-ups",img:I+"Decline_Push-Up/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pike-push-up",yt:"https://www.youtube.com/results?search_query=pike+push+up+shoulders+form"},
  {name:"12 Bench Tricep Dips",img:I+"Dips_-_Triceps_Version/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-bench-dip",yt:"https://www.youtube.com/results?search_query=bench+tricep+dips+form"}]},
{type:"For Time",duration:null,name:"Push Chipper",risks:["shoulder","wrist","elbow"],desc:"Pectoraux + triceps en pyramide descendante. Endurance musculaire pure.",movements:[
  {name:"30 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"20 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press"},
  {name:"10 Diamond Push-ups",img:I+"Push-Ups_-_Close_Triceps_Position/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-diamond-push-up",yt:"https://www.youtube.com/results?search_query=diamond+push+up"},
  {name:"20 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press"},
  {name:"30 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"}]},
{type:"EMOM",duration:10,name:"Shoulder Pump",risks:["shoulder"],desc:"Isolation épaules : deltoïdes latéraux + Arnold press. Volume pur.",movements:[
  {name:"Pair: 10 DB Lateral Raises",img:I+"Side_Lateral_Raise/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-lateral-raise",yt:"https://www.youtube.com/results?search_query=lateral+raise+form"},
  {name:"Impair: 8 DB Arnold Press",img:I+"Arnold_Dumbbell_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-arnold-press",yt:"https://www.youtube.com/results?search_query=arnold+press+form"}]}
],
pull:[
{type:"EMOM",duration:10,name:"Pull EMOM",risks:[],desc:"Dos en volume contrôlé, rows et tirages. Bon pour la posture.",movements:[
  {name:"Pair: 12 Ring/Band Rows",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row+ring+row+form"},
  {name:"Impair: 8 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=one+arm+dumbbell+row+form"}]},
{type:"For Time",duration:null,name:"Pull Chipper",risks:["l5","shoulder","elbow"],desc:"Dos + cardio en circuit dense. Force-endurance corps entier.",movements:[
  {name:"5 rounds: 5 Pull-ups",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form"},
  {name:"10 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"15 Sit-ups",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-crunch",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up"}]},
{type:"AMRAP",duration:8,name:"Row Storm",risks:["wrist"],desc:"Dos haut + posture par renegade rows et dead bugs. Anti-rotation.",movements:[
  {name:"8 Renegade Rows",img:I+"Dumbbell_Bench_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=renegade+row+form"},
  {name:"12 Band Pull-Aparts",img:I+"Band_Pull_Apart/0.jpg",mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart+form"},
  {name:"16 Dead Bugs",img:I+"Dead_Bug/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-dead-bug",yt:"https://www.youtube.com/results?search_query=dead+bug+exercise"}]},
{type:"Tabata",duration:4,name:"Pull Tabata",risks:[],desc:"Dos en 4 min HIIT. Inverted rows à haute fréquence.",movements:[
  {name:"Body Rows 20s/10s ×8",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row+form"}]},
{type:"AMRAP",duration:12,name:"Endurance Pull",risks:[],desc:"Dos + biceps + cardio low-impact (200m run). Volume + cœur.",movements:[
  {name:"6 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=dumbbell+row+form"},
  {name:"8 Hammer Curls légers",img:I+"Hammer_Curls/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl+form"},
  {name:"200m Run",img:"",mw:"",yt:""}]},
{type:"AMRAP",duration:10,name:"Back Attack",risks:["shoulder","elbow"],desc:"Dos large : pull-ups, rows, band pull-aparts. Travail postural.",movements:[
  {name:"6 Pull-ups (ou Inverted Rows)",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form"},
  {name:"10 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=dumbbell+row+form"},
  {name:"15 Band Pull-Aparts",img:I+"Band_Pull_Apart/0.jpg",mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart"}]},
{type:"For Time",duration:null,name:"Curl Ladder",risks:["elbow"],desc:"Biceps + dos via pyramide hammer curls et inverted rows.",movements:[
  {name:"21-15-9 Hammer Curls",img:I+"Hammer_Curls/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl+form"},
  {name:"21-15-9 Inverted Rows",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row+form"}]},
{type:"EMOM",duration:8,name:"Pull Power",risks:[],desc:"Dos + scapula en EMOM. Inverted rows + face pulls. Anti-protraction épaules.",movements:[
  {name:"Pair: 8 Inverted Rows",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row"},
  {name:"Impair: 10 Face Pulls + 5 Scap. Pull-ups",img:I+"Face_Pull/0.jpg",mw:"https://musclewiki.com/exercise/cable-face-pull",yt:"https://www.youtube.com/results?search_query=face+pull+form"}]}
],
legs:[
{type:"Chipper",duration:null,name:"Leg Chipper",risks:["l5"],desc:"Jambes + cardio plein gaz. Burpees, swings, squats en pyramide.",movements:[
  {name:"20 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"},
  {name:"30 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"40 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"30 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"20 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{type:"For Time",duration:null,name:"Leg Builder",risks:[],desc:"Volume cuisses + fessiers + ischios. Hypertrophie sans charge lombaire.",movements:[
  {name:"5×12 Goblet Squats",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form"},
  {name:"5×12 KB Deadlifts",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+deadlift+form"},
  {name:"5×12 Box Step-ups",img:I+"Barbell_Step_Ups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-step-up",yt:"https://www.youtube.com/results?search_query=box+step+up+form"}]},
{type:"EMOM",duration:12,name:"Legs EMOM",risks:[],desc:"Cuisses + fessiers en EMOM. Unilatéral et bilatéral mixés.",movements:[
  {name:"Min 1: 10 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"Min 2: 8 Lunges",img:I+"Bodyweight_Walking_Lunge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-lunge",yt:"https://www.youtube.com/results?search_query=walking+lunge+form"},
  {name:"Min 3: 6 Glute Bridges lestés",img:I+"Butt_Lift_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",yt:"https://www.youtube.com/results?search_query=weighted+glute+bridge+form"}]},
{type:"AMRAP",duration:10,name:"Quad Blaster",risks:["l5","shoulder","knee"],desc:"Quadriceps en feu. Wall balls + lunges + broad jumps explosifs.",movements:[
  {name:"15 Wall Balls",img:I+"Goblet_Squat/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=wall+ball+crossfit+form"},
  {name:"10 Step-back Lunges",img:I+"Bodyweight_Walking_Lunge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-lunge",yt:"https://www.youtube.com/results?search_query=reverse+lunge+form"},
  {name:"5 Broad Jumps",img:I+"Frog_Hops/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=broad+jump+form+technique"}]},
{type:"Tabata",duration:4,name:"Squat Tabata",risks:[],desc:"Cuisses + fessiers en 4 min HIIT alternés. Pur métabolique.",movements:[
  {name:"Goblet Squat / Glute Bridge alternés",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+glute+bridge+tabata"}]},
{type:"For Time",duration:null,name:"Leg Pyramid",risks:[],desc:"Volume jambes en pyramide montée puis descente. Endurance musculaire.",movements:[
  {name:"10→20→30→20→10 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"5→10→15→10→5 Goblet Squats",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form"}]},
{type:"EMOM",duration:10,name:"Hip Hinge Focus",risks:[],desc:"Ischios + fessiers via KB DL (dos neutre) et glute bridges. Posture.",movements:[
  {name:"Pair: 10 KB Deadlifts (dos neutre ⚡)",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+deadlift+form"},
  {name:"Impair: 12 Glute Bridges lestés",img:I+"Butt_Lift_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",yt:"https://www.youtube.com/results?search_query=glute+bridge+weighted"}]},
{type:"AMRAP",duration:8,name:"Step & Swing",risks:["l5"],desc:"Jambes + abdo + cardio via step-ups, swings, flutter kicks. 8 min punch.",movements:[
  {name:"10 Box Step-ups (5/côté)",img:I+"Barbell_Step_Ups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-step-up",yt:"https://www.youtube.com/results?search_query=step+up+exercise+form"},
  {name:"15 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"20 Flutter Kicks",img:I+"Flutter_Kicks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-flutter-kicks",yt:"https://www.youtube.com/results?search_query=flutter+kicks+core"}]}
],
// ─── CUSTOM WOD POOL : 20 WODs L5-S1 safe, sélectionnables manuellement dans le builder Custom ───
// Catégories : Full-body (6), Haut (4), Bas (4), Core (3), Cardio (3).
// Champ `desc` = explication simple (1 phrase) de ce que le WOD travaille efficacement.
// Champ `cat` = catégorie pour le regroupement UI.
custom:[
// ─── FULL-BODY CONDITIONING (6) ───
{cat:"Full-body",type:"AMRAP",duration:8,name:"Burpee Storm",risks:[],desc:"Brûle un max de calories en 8 min : cœur, jambes, épaules. Step-back uniquement, zéro charge sur la colonne.",movements:[
  {name:"AMRAP : Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{cat:"Full-body",type:"For Time",duration:null,name:"DT Modifié",risks:["shoulder"],desc:"Le classique CrossFit DT en version dos sécurisée. Force-endurance corps entier en 12-18 min.",movements:[
  {name:"5 rounds : 12 KB Romanian DL (dos neutre ⚡)",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+romanian+deadlift+form"},
  {name:"9 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press+form"},
  {name:"6 DB Front Squats",img:I+"Dumbbell_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=dumbbell+front+squat+form"}]},
{cat:"Full-body",type:"AMRAP",duration:20,name:"Cindy Modifiée",risks:["wrist"],desc:"Référence mondiale CrossFit. Endurance musculaire pure, accessible à tous niveaux.",movements:[
  {name:"5 Pull-ups (ou Inverted Rows)",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+or+inverted+row"},
  {name:"10 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"15 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"}]},
{cat:"Full-body",type:"AMRAP",duration:12,name:"Devil's Conditioning",risks:["l5","shoulder","wrist"],desc:"Cardio + force totale en 12 min. Travaille épaules, hanches, abdo en gainage.",movements:[
  {name:"5 DB Devil's Press",img:I+"Dumbbell_Bench_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=devils+press+dumbbell+form"},
  {name:"10 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"15 Mountain Climbers",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-mountain-climber",yt:"https://www.youtube.com/results?search_query=mountain+climbers+form"}]},
{cat:"Full-body",type:"For Time",duration:null,name:"21-15-9 Hero Pump",risks:["l5","shoulder"],desc:"Sprint cardio-musculaire intense. Te met sur les genoux en 10-15 min, full-body brûle-graisse.",movements:[
  {name:"21-15-9 DB Thrusters",img:I+"Dumbbell_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-thruster",yt:"https://www.youtube.com/results?search_query=dumbbell+thruster+form"},
  {name:"21-15-9 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{cat:"Full-body",type:"Tabata",duration:8,name:"Ladder Tabata",risks:["wrist"],desc:"Brûle-graisse rapide. 8 min = équivalent métabolique de 30-40 min de cardio classique.",movements:[
  {name:"R1-2 : Jumping Jacks 20s/10s",img:I+"Jumping_Jacks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-jumping-jack",yt:"https://www.youtube.com/results?search_query=jumping+jacks"},
  {name:"R3-4 : Air Squats 20s/10s",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"R5-6 : Push-ups 20s/10s",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"R7-8 : Mountain Climbers 20s/10s",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-mountain-climber",yt:"https://www.youtube.com/results?search_query=mountain+climbers+form"}]},
// ─── HAUT DU CORPS (4) ───
{cat:"Haut du corps",type:"EMOM",duration:10,name:"Push-Pull Pump",risks:["wrist"],desc:"Pectoraux + dos en alternance. Volume max sur le haut du corps sans fatiguer les jambes.",movements:[
  {name:"Pair : 10 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"Impair : 8 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=one+arm+dumbbell+row+form"}]},
{cat:"Haut du corps",type:"AMRAP",duration:8,name:"Shoulder Burner",risks:["shoulder","wrist"],desc:"Sculpte les épaules sous trois angles en 8 min. Aucun mouvement debout, dos protégé.",movements:[
  {name:"10 DB Lateral Raises",img:I+"Side_Lateral_Raise/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-lateral-raise",yt:"https://www.youtube.com/results?search_query=lateral+raise+form"},
  {name:"8 Arnold Press",img:I+"Arnold_Dumbbell_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-arnold-press",yt:"https://www.youtube.com/results?search_query=arnold+press+form"},
  {name:"6 Pike Push-ups",img:I+"Decline_Push-Up/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pike-push-up",yt:"https://www.youtube.com/results?search_query=pike+push+up+shoulders+form"}]},
{cat:"Haut du corps",type:"For Time",duration:null,name:"Pull Volume",risks:["shoulder","elbow"],desc:"Dos large + posture. Volume de tirage : 50 pull-ups + 100 pull-aparts. Évite le doublon avec le Pull Power EMOM.",movements:[
  {name:"50 Pull-ups (band-assist OK)",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form+band+assist"},
  {name:"100 Band Pull-Aparts",img:I+"Band_Pull_Apart/0.jpg",mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart+form"}]},
{cat:"Haut du corps",type:"EMOM",duration:12,name:"Arm Day Express",risks:["shoulder","wrist","elbow"],desc:"Biceps + triceps en superset. 12 min pour des bras bien gonflés, sans charge lombaire.",movements:[
  {name:"Pair : 8 Hammer Curls",img:I+"Hammer_Curls/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl+form"},
  {name:"Impair : 10 Bench Tricep Dips",img:I+"Dips_-_Triceps_Version/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-bench-dip",yt:"https://www.youtube.com/results?search_query=bench+tricep+dips+form"}]},
// ─── BAS DU CORPS (4) ───
{cat:"Bas du corps",type:"AMRAP",duration:10,name:"Leg Volume",risks:[],desc:"Cuisses + fessiers + ischios. Tout le bas du corps sans aucune flexion lombaire chargée.",movements:[
  {name:"10 Goblet Squats",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form"},
  {name:"8 KB Romanian DL (dos neutre ⚡)",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+romanian+deadlift+form"},
  {name:"6 Reverse Lunges/jambe",img:I+"Dumbbell_Lunges/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-reverse-lunge",yt:"https://www.youtube.com/results?search_query=reverse+lunge+form"}]},
{cat:"Bas du corps",type:"EMOM",duration:12,name:"Glute Builder",risks:["l5"],desc:"Fessiers explosifs. Améliore aussi la posture et protège le bas du dos.",movements:[
  {name:"Pair : 12 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"Impair : 10 Glute Bridges chargés",img:I+"Butt_Lift_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",yt:"https://www.youtube.com/results?search_query=glute+bridge+weighted+form"}]},
{cat:"Bas du corps",type:"Tabata",duration:4,name:"Quad Pump",risks:[],desc:"Cuisses en feu. 4 min de pur travail des quadriceps en haute intensité.",movements:[
  {name:"Goblet Squat 20s on / 10s off ×8",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+tabata"}]},
{cat:"Bas du corps",type:"For Time",duration:null,name:"Walking Power",risks:["l5"],desc:"Force des jambes + gainage debout. Travaille aussi les avant-bras (grip) et la posture.",movements:[
  {name:"10 rounds : 20m Farmer's Walk (lourd)",img:I+"Dumbbell_Shrug/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-farmers-walk",yt:"https://www.youtube.com/results?search_query=farmers+walk+form"},
  {name:"10 Step-ups/jambe",img:I+"Barbell_Step_Ups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-step-up",yt:"https://www.youtube.com/results?search_query=step+up+exercise+form"}]},
// ─── CORE STABILITÉ L5-S1 (3) ───
{cat:"Core stabilité",type:"AMRAP",duration:10,name:"McGill Big 3 Plus",risks:[],desc:"Renforce le dos sans flexion. Protocole McGill validé scientifiquement pour les hernies lombaires.",movements:[
  {name:"5 McGill Curl-ups (hold 10s)",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-crunch",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up+form"},
  {name:"5 Side Plank/côté (10s)",img:I+"Side_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",yt:"https://www.youtube.com/results?search_query=side+plank+mcgill"},
  {name:"5 Bird Dogs/côté (hold 5s)",img:I+"Donkey_Kicks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-bird-dog",yt:"https://www.youtube.com/results?search_query=bird+dog+exercise+form"},
  {name:"30s Pallof Press (chaque côté)",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/cable-pallof-press",yt:"https://www.youtube.com/results?search_query=pallof+press+form"}]},
{cat:"Core stabilité",type:"EMOM",duration:8,name:"Anti-Rotation",risks:[],desc:"Stabilité du tronc latérale et anti-rotation. Idéal hernie lombaire et posture quotidienne.",movements:[
  {name:"Pair : 10 Pallof Press/côté",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/cable-pallof-press",yt:"https://www.youtube.com/results?search_query=pallof+press+form"},
  {name:"Impair : 30s Suitcase Carry",img:I+"Dumbbell_Shrug/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-suitcase-carry",yt:"https://www.youtube.com/results?search_query=suitcase+carry+form"}]},
{cat:"Core stabilité",type:"Tabata",duration:4,name:"Plank Fortress",risks:["wrist"],desc:"Gainage pur. Renforce le caisson abdominal sans charger la colonne ni faire de flexion.",movements:[
  {name:"R1-3 : Front Plank 20s/10s",img:I+"Plank/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-plank",yt:"https://www.youtube.com/results?search_query=front+plank+form"},
  {name:"R4-6 : Side Plank 20s/10s (alterne)",img:I+"Side_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",yt:"https://www.youtube.com/results?search_query=side+plank+form"},
  {name:"R7-8 : Reverse Plank 20s/10s",img:I+"Butt_Lift_Bridge/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=reverse+plank+form"}]},
// ─── CARDIO (3) ───
{cat:"Cardio",type:"EMOM",duration:10,name:"HIIT Runner",risks:["knee"],desc:"10 min HIIT cardio pur. Plus efficace que 45 min de jogging stable pour brûler du gras.",movements:[
  {name:"Chaque min : 30s sprint + 30s marche",img:"",mw:"",yt:"https://www.youtube.com/results?search_query=HIIT+running+30s+sprint"}]},
{cat:"Cardio",type:"For Time",duration:null,name:"Row Sprint 5×500m",risks:[],desc:"Cardio puissance sans impact articulaire. Améliore la VO2max, idéal protection du dos.",movements:[
  {name:"5×500m Rameur (ou vélo équivalent)",img:"",mw:"",yt:"https://www.youtube.com/results?search_query=rowing+500m+sprint+form"},
  {name:"90s repos entre chaque",img:"",mw:"",yt:""}]},
{cat:"Cardio",type:"AMRAP",duration:10,name:"Jump Rope Ladder",risks:["knee"],desc:"Cardio + coordination + jambes. 10 min pour brûler 150-200 kcal, low-impact contrôlé.",movements:[
  {name:"50 Jump Rope (ou jumping jacks)",img:I+"Jumping_Jacks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-jumping-jack",yt:"https://www.youtube.com/results?search_query=jump+rope+form"},
  {name:"10 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"5 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]}
]};

// ─── WARMUPS ───
const WU = {
push:[
{name:"McGill Curl-up",reps:"3×10 (10s hold)",img:I+"Cable_Crunch/0.jpg",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up+form",mw:"https://musclewiki.com/exercise/bodyweight-crunch",notes:"Mains sous le dos. Soulève 2-3cm. PAS de crunch."},
{name:"Side Plank",reps:"2×30s/côté",img:I+"Side_Bridge/0.jpg",yt:"https://www.youtube.com/results?search_query=side+plank+mcgill",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",notes:"Coude sous épaule. Corps en ligne."},
{name:"Bird Dog",reps:"2×8/côté",img:I+"Plank/0.jpg",yt:"https://www.youtube.com/results?search_query=bird+dog+core",mw:"https://musclewiki.com/exercise/bodyweight-bird-dog",notes:"Bras+jambe opposés. Hold 5s."},
{name:"Dead Bug",reps:"2×10",img:I+"Dead_Bug/0.jpg",yt:"https://www.youtube.com/results?search_query=dead+bug+exercise",mw:"https://musclewiki.com/exercise/bodyweight-dead-bug",notes:"Dos plaqué au sol."},
{name:"Band Pull-Aparts",reps:"2×15",img:I+"Band_Pull_Apart/0.jpg",yt:"https://www.youtube.com/results?search_query=band+pull+apart",mw:"https://musclewiki.com/exercise/band-pull-apart",notes:"Squeeze omoplates."},
{name:"Shoulder CARs",reps:"2×5/bras",img:"",yt:"https://www.youtube.com/results?search_query=shoulder+CARs+mobility",mw:"",notes:"Cercles complets contrôlés."}
],
pull:[
{name:"McGill Curl-up",reps:"3×10",img:I+"Cable_Crunch/0.jpg",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up",mw:"https://musclewiki.com/exercise/bodyweight-crunch",notes:"Soulève 2-3cm."},
{name:"Side Plank",reps:"2×30s/côté",img:I+"Side_Bridge/0.jpg",yt:"https://www.youtube.com/results?search_query=side+plank",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",notes:"Hanche haute."},
{name:"Bird Dog",reps:"2×8/côté",img:I+"Plank/0.jpg",yt:"https://www.youtube.com/results?search_query=bird+dog",mw:"https://musclewiki.com/exercise/bodyweight-bird-dog",notes:"Hold 5s."},
{name:"Dead Bug",reps:"2×10",img:I+"Dead_Bug/0.jpg",yt:"https://www.youtube.com/results?search_query=dead+bug",mw:"https://musclewiki.com/exercise/bodyweight-dead-bug",notes:"Dos plaqué."},
{name:"Band Pull-Aparts",reps:"2×15",img:I+"Band_Pull_Apart/0.jpg",yt:"https://www.youtube.com/results?search_query=band+pull+apart",mw:"https://musclewiki.com/exercise/band-pull-apart",notes:"Omoplates."},
{name:"Scapular Pull-ups",reps:"2×8",img:I+"Scapular_Pull-Up/0.jpg",yt:"https://www.youtube.com/results?search_query=scapular+pull+up",mw:"",notes:"Rétracte sans plier les coudes."}
],
legs:[
{name:"McGill Curl-up",reps:"3×10",img:I+"Cable_Crunch/0.jpg",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up",mw:"https://musclewiki.com/exercise/bodyweight-crunch",notes:"PAS de crunch."},
{name:"Side Plank",reps:"2×30s/côté",img:I+"Side_Bridge/0.jpg",yt:"https://www.youtube.com/results?search_query=side+plank",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",notes:"Corps en ligne."},
{name:"Bird Dog",reps:"2×8/côté",img:I+"Plank/0.jpg",yt:"https://www.youtube.com/results?search_query=bird+dog",mw:"https://musclewiki.com/exercise/bodyweight-bird-dog",notes:"Hold 5s."},
{name:"Dead Bug",reps:"2×10",img:I+"Dead_Bug/0.jpg",yt:"https://www.youtube.com/results?search_query=dead+bug",mw:"https://musclewiki.com/exercise/bodyweight-dead-bug",notes:"Dos plaqué."},
{name:"Goblet Squat",reps:"2×8",img:I+"Goblet_Squat/0.jpg",yt:"https://www.youtube.com/results?search_query=goblet+squat+warmup",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",notes:"Profond. Genoux dehors."},
{name:"Glute Bridges",reps:"2×12",img:I+"Butt_Lift_Bridge/0.jpg",yt:"https://www.youtube.com/results?search_query=glute+bridge+activation",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",notes:"Squeeze fessiers 2s."}
]};

// ─── PROGRAMME PPL ───
// Helms/RTS 2014-2020 — primaires fixes (Bench/Squat/RDL/OHP/Pulls/Row), accessoires en rotation LRU 2-4 sessions
// Colquhoun et al. 2018 JSCR — variation accessoires → hypertrophie supérieure
// Krieger 2010 meta-analysis — pools variés recrutent portions différentes du muscle
const PROG = {sessions:[
{id:"push",name:"PUSH",color:"#E63946",muscles:["chest","shoulders","triceps"],
 compounds:[
  {id:"p1",name:"Bench Press",sets:4,reps:"6-8",rest:120,muscle:"chest",imgs:["Barbell_Bench_Press_-_Medium_Grip/0.jpg","Barbell_Bench_Press_-_Medium_Grip/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-bench-press",yt:"https://www.youtube.com/results?search_query=bench+press+form",notes:"<b>Omoplates rétractées</b>. Coudes 45°.",coaching:["Barre en U pour lats","Pas de rebond"],l5safe:true},
  {id:"p2",name:"OHP Debout",sets:3,reps:"8-10",rest:90,muscle:"shoulders",imgs:["Standing_Military_Press/0.jpg","Standing_Military_Press/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-overhead-press",yt:"https://www.youtube.com/results?search_query=overhead+press+form",notes:"<b>Gainage strict</b>. Lock-out.",coaching:["Fessiers serrés","Full ROM"],l5safe:true,l5warn:"Attention à ne pas cambrer — serre les abdos et fessiers"}
 ],
 pools:[
  {label:"Poitrine acc.",exercises:[
   {id:"pc1",name:"Incline DB Press",sets:3,reps:"10-12",rest:90,muscle:"chest",imgs:["Incline_Dumbbell_Press/0.jpg","Incline_Dumbbell_Press/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-incline-bench-press",yt:"https://www.youtube.com/results?search_query=incline+dumbbell+press",notes:"Banc <b>30°</b>. Excentrique 3s.",coaching:["Haltères se touchent en haut"],l5safe:true},
   {id:"pc2",name:"Cable Fly",sets:3,reps:"12-15",rest:60,muscle:"chest",imgs:["Cable_Crossover/0.jpg","Cable_Crossover/1.jpg"],mw:"https://musclewiki.com/exercise/cable-fly",yt:"https://www.youtube.com/results?search_query=cable+fly+chest+form",notes:"<b>Étirement complet</b>. Coudes légèrement fléchis.",coaching:["Allonge avant de contracter"],l5safe:true},
   {id:"pc3",name:"Dips Poitrine",sets:3,reps:"8-12",rest:90,muscle:"chest",imgs:["Dips_-_Chest_Version/0.jpg","Dips_-_Chest_Version/1.jpg"],mw:"https://musclewiki.com/exercise/bodyweight-chest-dip",yt:"https://www.youtube.com/results?search_query=chest+dips+form",notes:"<b>Buste penché</b> en avant pour cibler la poitrine.",coaching:["Descente 2-3s","Coudes légèrement en dehors"],l5safe:true}
  ]},
  {label:"Épaules acc.",exercises:[
   {id:"ps1",name:"Lateral Raises",sets:3,reps:"12-15",rest:60,muscle:"shoulders",imgs:["Side_Lateral_Raise/0.jpg","Side_Lateral_Raise/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-lateral-raise",yt:"https://www.youtube.com/results?search_query=lateral+raise+form",notes:"<b>Pas d'élan</b>.",coaching:["Pause 1s en haut"],l5safe:true},
   {id:"ps2",name:"Arnold Press",sets:3,reps:"10-12",rest:75,muscle:"shoulders",imgs:["Arnold_Dumbbell_Press/0.jpg","Arnold_Dumbbell_Press/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-arnold-press",yt:"https://www.youtube.com/results?search_query=arnold+press+form",notes:"<b>Rotation supination→pronation</b>. Full ROM.",coaching:["Départ paume vers toi","Contrôle total"],l5safe:true},
   {id:"ps3",name:"Cable Lateral Raise",sets:3,reps:"15-20",rest:45,muscle:"shoulders",imgs:["Side_Lateral_Raise/0.jpg","Side_Lateral_Raise/1.jpg"],mw:"https://musclewiki.com/exercise/cable-lateral-raise",yt:"https://www.youtube.com/results?search_query=cable+lateral+raise",notes:"Câble basse poulie. <b>Tension constante</b>.",coaching:["Coude légèrement fléchi","Pause 1s"],l5safe:true}
  ]},
  {label:"Triceps A",exercises:[
   {id:"pt1",name:"Triceps Pushdown",sets:3,reps:"12-15",rest:60,muscle:"triceps",imgs:["Triceps_Pushdown/0.jpg","Triceps_Pushdown/1.jpg"],mw:"https://musclewiki.com/exercise/cable-pushdown",yt:"https://www.youtube.com/results?search_query=tricep+pushdown",notes:"<b>Coudes collés</b>.",coaching:["Squeeze 1s"],l5safe:true},
   {id:"pt2",name:"Skull Crushers",sets:3,reps:"10-12",rest:75,muscle:"triceps",imgs:["EZ-Bar_Skullcrusher/0.jpg","EZ-Bar_Skullcrusher/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-skull-crusher",yt:"https://www.youtube.com/results?search_query=skull+crusher+form",notes:"Barre EZ sur front. <b>Coudes verticaux</b>.",coaching:["Excentrique lent 3s","Coudes fixes"],l5safe:true}
  ]},
  {label:"Triceps B",exercises:[
   {id:"pt3",name:"OH Triceps Ext.",sets:3,reps:"10-12",rest:60,muscle:"triceps",imgs:["Standing_Dumbbell_Triceps_Extension/0.jpg","Standing_Dumbbell_Triceps_Extension/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-overhead-triceps-extension",yt:"https://www.youtube.com/results?search_query=overhead+tricep+extension",notes:"<b>Étirement complet</b>.",coaching:["Coudes stables"],l5safe:true},
   {id:"pt4",name:"Triceps Dips",sets:3,reps:"10-15",rest:75,muscle:"triceps",imgs:["Dips_-_Triceps_Version/0.jpg","Dips_-_Triceps_Version/1.jpg"],mw:"https://musclewiki.com/exercise/bodyweight-triceps-dip",yt:"https://www.youtube.com/results?search_query=tricep+dips+bench+form",notes:"<b>Torse vertical</b>. Coudes vers l'arrière.",coaching:["Descente 2s","Pas de balancement"],l5safe:true},
   {id:"pt5",name:"Cable Kickback",sets:3,reps:"15-20",rest:45,muscle:"triceps",imgs:["Tricep_Dumbbell_Kickback/0.jpg","Tricep_Dumbbell_Kickback/1.jpg"],mw:"https://musclewiki.com/exercise/cable-triceps-kickback",yt:"https://www.youtube.com/results?search_query=cable+tricep+kickback+form",notes:"<b>Extension complète</b>. Contraction 1s.",coaching:["Bras parallèle au sol"],l5safe:true}
  ]}
 ]
},
{id:"pull",name:"PULL",color:"#457B9D",muscles:["back","biceps","shoulders"],
 compounds:[
  {id:"l1",name:"Pull-ups",sets:4,reps:"6-10",rest:120,muscle:"back",imgs:["Pullups/0.jpg","Pullups/1.jpg"],mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form",notes:"<b>Full ROM</b>.",coaching:["Descente 3s"],l5safe:true},
  {id:"l2",name:"Bench DB Row",sets:4,reps:"8-10",rest:90,muscle:"back",imgs:["One-Arm_Dumbbell_Row/0.jpg","One-Arm_Dumbbell_Row/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=dumbbell+row+bench",notes:"<b>Unilatéral sur banc</b>.",coaching:["⚡ Remplace le bent-over row (L5-S1)"],l5safe:true,l5warn:"Toujours sur banc — jamais de row penché libre"}
 ],
 pools:[
  {label:"Dos acc.",exercises:[
   {id:"lb1",name:"Cable Row",sets:3,reps:"10-12",rest:90,muscle:"back",imgs:["Seated_Cable_Rows/0.jpg","Seated_Cable_Rows/1.jpg"],mw:"https://musclewiki.com/exercise/cable-seated-row",yt:"https://www.youtube.com/results?search_query=cable+row+form",notes:"<b>Tirez vers le nombril</b>. Omoplate serrée 1s.",coaching:["Dos neutre","Pas de balancement"],l5safe:true},
   {id:"lb2",name:"T-Bar Row",sets:3,reps:"8-10",rest:90,muscle:"back",imgs:["T-Bar_Row_with_Handle/0.jpg","T-Bar_Row_with_Handle/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-t-bar-row",yt:"https://www.youtube.com/results?search_query=t+bar+row+form",notes:"<b>Buste à 45°</b>. Squeezing scapulaires.",coaching:["Pas d'arrondi lombaire"],l5safe:true,l5warn:"Buste à 45° strict — gainage si L5-S1"},
   {id:"lb3",name:"Chest-Supported Row",sets:3,reps:"10-12",rest:75,muscle:"back",imgs:["Dumbbell_Incline_Row/0.jpg","Dumbbell_Incline_Row/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-incline-row",yt:"https://www.youtube.com/results?search_query=chest+supported+row+form",notes:"Banc incliné, <b>poitrine appuyée</b>. Zéro tension lombaire.",coaching:["Elbows back","Squeeze 1s"],l5safe:true}
  ]},
  {label:"Deltoïdes post.",exercises:[
   {id:"lr1",name:"Face Pulls",sets:3,reps:"15-20",rest:60,muscle:"shoulders",imgs:["Face_Pull/0.jpg","Face_Pull/1.jpg"],mw:"https://musclewiki.com/exercise/cable-face-pull",yt:"https://www.youtube.com/results?search_query=face+pull+form",notes:"<b>Rotation externe</b>.",coaching:["Écarte les mains"],l5safe:true},
   {id:"lr2",name:"Reverse Flyes",sets:3,reps:"12-15",rest:60,muscle:"shoulders",imgs:["Seated_Bent-Over_Rear_Delt_Raise/0.jpg","Seated_Bent-Over_Rear_Delt_Raise/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-reverse-fly",yt:"https://www.youtube.com/results?search_query=reverse+fly",notes:"<b>Banc incliné</b>.",coaching:["Léger, squeeze 1s"],l5safe:true},
   {id:"lr3",name:"Band Pull-Aparts",sets:3,reps:"20-25",rest:45,muscle:"shoulders",imgs:["Band_Pull_Apart/0.jpg","Band_Pull_Apart/1.jpg"],mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart+form",notes:"Élastique à hauteur des épaules. <b>Étirement max.</b>",coaching:["Lent excentrique"],l5safe:true}
  ]},
  {label:"Biceps compos.",exercises:[
   {id:"lb4",name:"Barbell Curls",sets:3,reps:"10-12",rest:60,muscle:"biceps",imgs:["Barbell_Curl/0.jpg","Barbell_Curl/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-curl",yt:"https://www.youtube.com/results?search_query=barbell+curl",notes:"Barre EZ. <b>Excentrique 3s</b>.",coaching:["Abdos serrés"],l5safe:true},
   {id:"lb5",name:"Preacher Curl",sets:3,reps:"10-12",rest:75,muscle:"biceps",imgs:["Preacher_Curl/0.jpg","Preacher_Curl/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-preacher-curl",yt:"https://www.youtube.com/results?search_query=preacher+curl+form",notes:"<b>Isolation totale</b>. Étirement 1s en bas.",coaching:["Coudes sur le pupitre","Excentrique 3s"],l5safe:true},
   {id:"lb6",name:"Incline DB Curl",sets:3,reps:"10-12",rest:75,muscle:"biceps",imgs:["Alternate_Incline_Dumbbell_Curl/0.jpg","Alternate_Incline_Dumbbell_Curl/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-incline-curl",yt:"https://www.youtube.com/results?search_query=incline+dumbbell+curl",notes:"Banc à 45°. <b>Étirement maximal biceps</b>.",coaching:["Paume vers le haut","Supination en haut"],l5safe:true}
  ]},
  {label:"Biceps iso.",exercises:[
   {id:"li1",name:"Hammer Curls",sets:3,reps:"10-12",rest:60,muscle:"biceps",imgs:["Hammer_Curls/0.jpg","Hammer_Curls/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl",notes:"<b>Pas de swing</b>.",coaching:["Coudes fixes"],l5safe:true},
   {id:"li2",name:"Concentration Curl",sets:3,reps:"12-15",rest:60,muscle:"biceps",imgs:["Concentration_Curls/0.jpg","Concentration_Curls/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-concentration-curl",yt:"https://www.youtube.com/results?search_query=concentration+curl+form",notes:"<b>Coude contre la jambe</b>. Isolation totale.",coaching:["Contraction peak 1s","Excentrique 2s"],l5safe:true},
   {id:"li3",name:"Cable Curl",sets:3,reps:"12-15",rest:60,muscle:"biceps",imgs:["High_Cable_Curls/0.jpg","High_Cable_Curls/1.jpg"],mw:"https://musclewiki.com/exercise/cable-curl",yt:"https://www.youtube.com/results?search_query=cable+curl+form",notes:"Câble basse poulie. <b>Tension constante</b>.",coaching:["Coudes fixes","Contraction 1s"],l5safe:true}
  ]}
 ]
},
{id:"legs",name:"LEGS",color:"#2A9D8F",muscles:["quads","hamstrings","calves","core"],
 compounds:[
  {id:"g1",name:"Back Squat",sets:4,reps:"6-8",rest:150,muscle:"quads",imgs:["Barbell_Squat/0.jpg","Barbell_Squat/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-squat",yt:"https://www.youtube.com/results?search_query=back+squat+form",notes:"<b>Ceinture recommandée</b>.",coaching:["Valsalva","Genoux dehors"],l5safe:true,l5warn:"Ceinture obligatoire. Stop si douleur lombaire."},
  {id:"g2",name:"Romanian DL",sets:3,reps:"8-10",rest:120,muscle:"hamstrings",imgs:["Romanian_Deadlift/0.jpg","Romanian_Deadlift/1.jpg"],mw:"https://musclewiki.com/exercise/barbell-romanian-deadlift",yt:"https://www.youtube.com/results?search_query=romanian+deadlift",notes:"<b>Charnière hanche</b>.",coaching:["⚡ DOS NEUTRE OBLIGATOIRE"],l5safe:false,l5warn:"ATTENTION L5-S1 : dos strictement neutre. Arrête immédiatement si douleur."}
 ],
 pools:[
  {label:"Quad uni.",exercises:[
   {id:"gu1",name:"Bulgarian Split Squat",sets:3,reps:"10/côté",rest:90,muscle:"quads",imgs:["Split_Squat_with_Dumbbells/0.jpg","Split_Squat_with_Dumbbells/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-bulgarian-split-squat",yt:"https://www.youtube.com/results?search_query=bulgarian+split+squat",notes:"<b>Torse droit</b>.",coaching:["80% sur jambe avant"],l5safe:true},
   {id:"gu2",name:"Lunges",sets:3,reps:"12/côté",rest:75,muscle:"quads",imgs:["Dumbbell_Lunges/0.jpg","Dumbbell_Lunges/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-lunge",yt:"https://www.youtube.com/results?search_query=dumbbell+lunges+form",notes:"<b>Genou avant à 90°</b>.",coaching:["Pas long","Torse vertical"],l5safe:true},
   {id:"gu3",name:"Step-ups",sets:3,reps:"12/côté",rest:75,muscle:"quads",imgs:["Barbell_Step_Ups/0.jpg","Barbell_Step_Ups/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-step-up",yt:"https://www.youtube.com/results?search_query=dumbbell+step+up+form",notes:"<b>Pied entier sur le banc</b>. Pousse sur le talon.",coaching:["Contrôle la descente"],l5safe:true},
   {id:"gu4",name:"Goblet Squat",sets:3,reps:"10-12",rest:75,muscle:"quads",imgs:["Goblet_Squat/0.jpg","Goblet_Squat/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form",notes:"<b>Alternative safe au Back Squat / Romanian DL</b> si lombaires fragiles. Talons au sol, coudes entre les genoux.",coaching:["Torse vertical","Profondeur naturelle","Pas de cambrure"],l5safe:true}
  ]},
  {label:"Ischios iso.",exercises:[
   {id:"gh1",name:"Leg Curl",sets:3,reps:"12-15",rest:60,muscle:"hamstrings",imgs:["Lying_Leg_Curls/0.jpg","Lying_Leg_Curls/1.jpg"],mw:"https://musclewiki.com/exercise/machine-leg-curl",yt:"https://www.youtube.com/results?search_query=leg+curl",notes:"<b>Contraction 1s</b>.",coaching:["Pas de claquement"],l5safe:true},
   {id:"gh2",name:"Nordic Curl",sets:3,reps:"5-8",rest:120,muscle:"hamstrings",imgs:["Glute_Ham_Raise/0.jpg","Glute_Ham_Raise/1.jpg"],mw:"https://musclewiki.com/exercise/nordic-hamstring-curl",yt:"https://www.youtube.com/results?search_query=nordic+hamstring+curl+form",notes:"<b>Excentrique maximal</b> — freine la descente lentement.",coaching:["Aide avec les bras si besoin"],l5safe:true},
   {id:"gh3",name:"Seated Leg Curl",sets:3,reps:"12-15",rest:60,muscle:"hamstrings",imgs:["Seated_Leg_Curl/0.jpg","Seated_Leg_Curl/1.jpg"],mw:"https://musclewiki.com/exercise/machine-seated-leg-curl",yt:"https://www.youtube.com/results?search_query=seated+leg+curl+form",notes:"<b>Pied fléchi</b>. Squeeze 1s en bas.",coaching:["Étirement en haut"],l5safe:true}
  ]},
  {label:"Mollets.",exercises:[
   {id:"gc1",name:"Calf Raises",sets:4,reps:"15-20",rest:45,muscle:"calves",imgs:["Standing_Calf_Raises/0.jpg","Standing_Calf_Raises/1.jpg"],mw:"https://musclewiki.com/exercise/machine-calf-raise",yt:"https://www.youtube.com/results?search_query=calf+raise",notes:"<b>Pause 2s en bas</b>.",coaching:["Full ROM"],l5safe:true},
   {id:"gc2",name:"Seated Calf Raise",sets:4,reps:"15-20",rest:45,muscle:"calves",imgs:["Seated_Calf_Raise/0.jpg","Seated_Calf_Raise/1.jpg"],mw:"https://musclewiki.com/exercise/machine-seated-calf-raise",yt:"https://www.youtube.com/results?search_query=seated+calf+raise+form",notes:"<b>Soléaire ciblé</b>. Pause 2s en bas.",coaching:["Genou fléchi","Full ROM"],l5safe:true},
   {id:"gc3",name:"Single-Leg Calf Raise",sets:3,reps:"15/côté",rest:45,muscle:"calves",imgs:["Standing_Dumbbell_Calf_Raise/0.jpg","Standing_Dumbbell_Calf_Raise/1.jpg"],mw:"https://musclewiki.com/exercise/single-leg-calf-raise",yt:"https://www.youtube.com/results?search_query=single+leg+calf+raise",notes:"<b>Unilatéral</b> — révèle les déséquilibres.",coaching:["Descente lente 3s"],l5safe:true}
  ]},
  {label:"Fonctionnel.",exercises:[
   {id:"gf1",name:"Farmer's Walk",sets:3,reps:"30m",rest:60,muscle:"core",imgs:["Farmers_Walk/0.jpg","Farmers_Walk/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-farmers-walk",yt:"https://www.youtube.com/results?search_query=farmer+walk",notes:"<b>Gainage total</b>.",coaching:["Épaules basses"],l5safe:true,logType:"distance_load"},
   {id:"gf2",name:"Plank",sets:3,reps:"45-60s",rest:60,muscle:"core",imgs:["Plank/0.jpg","Plank/1.jpg"],mw:"https://musclewiki.com/exercise/plank",yt:"https://www.youtube.com/results?search_query=plank+form",notes:"<b>Corps aligné</b>. Pas de cambre.",coaching:["Hanches ni haut ni bas","Respire"],l5safe:true,logType:"time"},
   {id:"gf3",name:"Ab Wheel",sets:3,reps:"8-12",rest:75,muscle:"core",imgs:["Ab_Roller/0.jpg","Ab_Roller/1.jpg"],mw:"https://musclewiki.com/exercise/ab-roller",yt:"https://www.youtube.com/results?search_query=ab+wheel+rollout+form",notes:"<b>Rollout lent</b>. Ne pas cambrer.",coaching:["Expire en rentrant","Stop avant le sol"],l5safe:true,l5warn:"Rollout partiel uniquement si L5-S1 — stop si douleur.",logType:"reps_bw"}
  ]}
 ]
}
]};

// ─── PLANNING HEBDOMADAIRE : ADAPTATIF (v8.28) ───
// Auparavant statique (v8.27), désormais calculé dynamiquement par computeWeekPlan()
// dans state.js à partir de S.hist.
//
// Séquence idéale 4 séances/semaine (Push, Pull, Legs, Core) avec rests intercalés :
// fondée sur Schoenfeld 2019, Grgic 2022, McGill 2016, Krzysztofik 2019.
// Si l'utilisateur fait Push mardi au lieu de lundi, le planning shift en conséquence
// (Core mercredi, Pull jeudi, rest vendredi, Legs samedi).
//
// IDEAL_CYCLE : ordre canonique appliqué depuis aujourd'hui en fonction de
// ce qui reste à faire cette semaine. Le mardi Core sert d'active recovery
// entre Push (lun) et Pull (mer) : low fatigue, anti-flexion lombaire.
const IDEAL_CYCLE = ["push", "core", "pull", "rest", "legs", "rest", "rest"];

// Mapping affichage (couleurs, labels) pour la grille
const PLAN_LABELS = {
  push:  {label:"Push",  cls:"push"},
  pull:  {label:"Pull",  cls:"pull"},
  legs:  {label:"Legs",  cls:"legs"},
  core:  {label:"Core",  cls:"core"},
  rest:  {label:"Repos", cls:"rest"}
};
const DAY_SHORTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── CORE HEAVY 12 SEMAINES (L5-S1 safe, McGill-validated) ───
// Pallof Press: anti-rotation | Suitcase Carry: anti-flexion latérale (QL+obliques)
// Sources : McGill 2010, Behm 2010, Escamilla 2010 — pas de flexion lombaire chargée
const CORE_PROGRAM = {
  exercises:[
    {id:"pallof",name:"Cable Pallof Press",muscle:"obliques",
     mw:"https://www.google.com/search?q=pallof+press+squat+university+technique",
     yt:"https://www.youtube.com/results?search_query=Squat+University+Pallof+Press+how+to",
     coaching:["Position demi-fente, genou côté poulie au sol","Mains au sternum, poignée à 2 mains","Pousse les bras DEVANT (pas vers la poulie)","Tiens 2-3s à pleine extension, retour 2s","Bassin et épaules figés — rien ne tourne"],
     notes:"Anti-rotation chargée. Le câble veut te tordre, tu résistes.",
     prog:[{w:25,s:4,r:10,h:2},{w:27.5,s:4,r:10,h:2},{w:30,s:4,r:10,h:2},{w:32.5,s:4,r:10,h:2},{w:35,s:4,r:8,h:3},{w:37.5,s:4,r:8,h:3},{w:40,s:4,r:8,h:3},{w:42.5,s:4,r:8,h:3},{w:45,s:4,r:6,h:3},{w:47.5,s:4,r:6,h:3},{w:50,s:4,r:6,h:3},{w:55,s:4,r:6,h:3}]},
    {id:"suitcase",name:"Heavy Suitcase Carry",muscle:"obliques",
     mw:"https://www.google.com/search?q=suitcase+carry+stuart+mcgill+technique",
     yt:"https://www.youtube.com/results?search_query=suitcase+carry+single+arm+farmer+walk+technique",
     coaching:["KB ou haltère lourd dans UNE seule main (PAS deux comme un farmer's walk)","Épaules tirées en arrière, posture droite","Tronc figé : ton voisin doit pas voir que tu portes du poids","L'épaule du côté chargé reste haute (= QL travaille)","Marche la distance, puis change de côté"],
     notes:"McGill : « l'un des meilleurs exercices pour le tronc ». Asymétrie = QL + obliques en stiffness max. Une seule main, pas deux.",
     prog:[{w:22,s:3,d:30},{w:24,s:3,d:30},{w:26,s:3,d:30},{w:28,s:3,d:30},{w:30,s:3,d:35},{w:32,s:3,d:35},{w:34,s:3,d:35},{w:36,s:3,d:40},{w:38,s:4,d:40},{w:40,s:4,d:40},{w:42,s:4,d:40},{w:44,s:4,d:40}]}
  ]
};

// ─── DB PROTÉINES (USDA FoodData Central + Ciqual ANSES) ───
// Tri par densité protéique décroissante dans chaque catégorie
const PROTEINS_DB = [
  {cat:"🥩 Viandes maigres",color:"#ef4444",items:[
    {n:"Blanc de poulet rôti",pt:"100 g",p:31,p100:31},
    {n:"Blanc de dinde rôti",pt:"100 g",p:30,p100:30},
    {n:"Filet mignon de porc cuit",pt:"100 g",p:28,p100:28},
    {n:"Bavette de bœuf grillée",pt:"100 g",p:26,p100:26},
    {n:"Steak haché 5% MG cuit",pt:"100 g",p:26,p100:26},
    {n:"Foie de veau cuit",pt:"100 g",p:27,p100:27},
    {n:"Steak haché 15% MG cuit",pt:"100 g",p:23,p100:23},
    {n:"Jambon blanc dégraissé",pt:"1 tranche 40 g",p:8,p100:21},
    {n:"Bresaola",pt:"30 g",p:10,p100:33}
  ]},
  {cat:"🐟 Poissons & fruits de mer",color:"#06b6d4",items:[
    {n:"Thon au naturel (1 boîte égouttée)",pt:"140 g",p:32,p100:23},
    {n:"Bar / dorade cuit",pt:"100 g",p:23,p100:23},
    {n:"Saumon cuit",pt:"100 g",p:22,p100:22},
    {n:"Maquereau au naturel",pt:"100 g",p:22,p100:22},
    {n:"Sardines à l'huile (1 boîte)",pt:"90 g égoutté",p:22,p100:25},
    {n:"Crevettes cuites",pt:"100 g",p:20,p100:20},
    {n:"Cabillaud cuit",pt:"100 g",p:18,p100:18},
    {n:"Surimi",pt:"100 g",p:10,p100:10}
  ]},
  {cat:"🥚 Œufs & laitages",color:"#f59e0b",items:[
    {n:"Skyr 0% nature",pt:"150 g (1 pot)",p:17,p100:11.3},
    {n:"Yaourt grec 0% MG",pt:"150 g",p:15,p100:10},
    {n:"Parmesan râpé",pt:"30 g",p:11,p100:36},
    {n:"Cottage cheese",pt:"100 g",p:11,p100:11},
    {n:"Œuf XL (~75 g)",pt:"1 œuf",p:9.5,p100:13},
    {n:"Œuf L (~65 g)",pt:"1 œuf",p:8,p100:13},
    {n:"Comté",pt:"30 g",p:8,p100:27},
    {n:"Lait demi-écrémé",pt:"250 ml",p:8,p100:3.3},
    {n:"Fromage blanc 0%",pt:"100 g",p:8,p100:8},
    {n:"Mozzarella",pt:"100 g (1 boule)",p:19,p100:19},
    {n:"Œuf M (~55 g)",pt:"1 œuf",p:7,p100:13}
  ]},
  {cat:"🌱 Sources végétales",color:"#10b981",items:[
    {n:"Seitan (gluten de blé)",pt:"100 g",p:25,p100:25},
    {n:"Tempeh",pt:"100 g",p:19,p100:19},
    {n:"Tofu ferme",pt:"100 g",p:17,p100:17},
    {n:"Edamame cuit",pt:"100 g",p:11,p100:11},
    {n:"Lentilles vertes cuites",pt:"100 g",p:9,p100:9},
    {n:"Pois chiches cuits",pt:"100 g",p:8,p100:8},
    {n:"Haricots rouges cuits",pt:"100 g",p:8,p100:8},
    {n:"Beurre de cacahuète",pt:"30 g (1 c. à s.)",p:7,p100:25},
    {n:"Amandes",pt:"30 g (~23 amandes)",p:6,p100:21},
    {n:"Quinoa cuit",pt:"100 g",p:4,p100:4}
  ]},
  {cat:"💊 Compléments",color:"#a855f7",items:[
    {n:"Whey isolate (1 dose)",pt:"30 g poudre",p:25,p100:84},
    {n:"Caséine micellaire (1 dose)",pt:"30 g poudre",p:23,p100:77},
    {n:"Whey concentrée (1 dose)",pt:"30 g poudre",p:22,p100:75},
    {n:"Protéines de pois (1 dose)",pt:"30 g poudre",p:22,p100:75}
  ]}
];
// ===== from machines.js =====
// FITStark — Bibliothèque de machines / équipements de salle
// Catégorisé pour faciliter la sélection multi-machines dans le wizard du module
// Entraînement Personnalisé (v8.42).

const MACHINE_CATEGORIES = {
  free_weights: { fr: "Poids libres", en: "Free weights", icon: "🏋️" },
  racks: { fr: "Racks & barres", en: "Racks & bars", icon: "🦴" },
  cables: { fr: "Câbles & poulies", en: "Cables & pulleys", icon: "🔗" },
  machines_upper: { fr: "Machines haut du corps", en: "Upper body machines", icon: "💪" },
  machines_lower: { fr: "Machines bas du corps", en: "Lower body machines", icon: "🦵" },
  cardio: { fr: "Cardio", en: "Cardio", icon: "🏃" },
  bodyweight: { fr: "Poids du corps", en: "Bodyweight", icon: "🤸" },
  functional: { fr: "Fonctionnel", en: "Functional", icon: "⚡" }
};

const MACHINES = [
  // ─── Poids libres ───
  { id: "dumbbells", cat: "free_weights", name: { fr: "Haltères (paire)", en: "Dumbbells (pair)" }, muscles: ["chest","shoulders","back","arms","quads"] },
  { id: "kettlebells", cat: "free_weights", name: { fr: "Kettlebells", en: "Kettlebells" }, muscles: ["full_body","hamstrings","shoulders"] },
  { id: "barbell_olympic", cat: "free_weights", name: { fr: "Barre olympique 20 kg", en: "Olympic barbell 20 kg" }, muscles: ["chest","back","quads","hamstrings"] },
  { id: "barbell_ez", cat: "free_weights", name: { fr: "Barre EZ", en: "EZ bar" }, muscles: ["biceps","triceps"] },
  { id: "trap_bar", cat: "free_weights", name: { fr: "Barre hexagonale (trap bar)", en: "Trap bar" }, muscles: ["hamstrings","quads","back"] },

  // ─── Racks ───
  { id: "power_rack", cat: "racks", name: { fr: "Power rack", en: "Power rack" }, muscles: ["chest","back","quads","hamstrings"] },
  { id: "squat_rack", cat: "racks", name: { fr: "Squat rack", en: "Squat rack" }, muscles: ["quads","hamstrings","back"] },
  { id: "smith_machine", cat: "racks", name: { fr: "Smith machine", en: "Smith machine" }, muscles: ["chest","shoulders","quads"] },
  { id: "flat_bench", cat: "racks", name: { fr: "Banc plat", en: "Flat bench" }, muscles: ["chest","triceps"] },
  { id: "incline_bench", cat: "racks", name: { fr: "Banc inclinable", en: "Adjustable bench" }, muscles: ["chest","shoulders"] },
  { id: "decline_bench", cat: "racks", name: { fr: "Banc décliné", en: "Decline bench" }, muscles: ["chest","core"] },
  { id: "preacher_bench", cat: "racks", name: { fr: "Banc Larry Scott (preacher)", en: "Preacher bench" }, muscles: ["biceps"] },
  { id: "hyperextension", cat: "racks", name: { fr: "Banc lombaire (hyperextension)", en: "Hyperextension bench" }, muscles: ["lower_back","glutes","hamstrings"] },

  // ─── Câbles ───
  { id: "cable_crossover", cat: "cables", name: { fr: "Crossover (poulies hautes)", en: "Cable crossover" }, muscles: ["chest","shoulders","back","arms"] },
  { id: "cable_low_pulley", cat: "cables", name: { fr: "Poulie basse", en: "Low pulley" }, muscles: ["biceps","triceps","shoulders"] },
  { id: "lat_pulldown", cat: "cables", name: { fr: "Tirage vertical (lat pulldown)", en: "Lat pulldown" }, muscles: ["back","biceps"] },
  { id: "seated_row", cat: "cables", name: { fr: "Tirage horizontal assis", en: "Seated cable row" }, muscles: ["back","biceps"] },

  // ─── Machines haut du corps ───
  { id: "pec_deck", cat: "machines_upper", name: { fr: "Pec deck (butterfly)", en: "Pec deck (butterfly)" }, muscles: ["chest"] },
  { id: "chest_press_machine", cat: "machines_upper", name: { fr: "Machine développé couché", en: "Chest press machine" }, muscles: ["chest","triceps"] },
  { id: "shoulder_press_machine", cat: "machines_upper", name: { fr: "Machine épaules", en: "Shoulder press machine" }, muscles: ["shoulders","triceps"] },
  { id: "lateral_raise_machine", cat: "machines_upper", name: { fr: "Machine élévations latérales", en: "Lateral raise machine" }, muscles: ["shoulders"] },
  { id: "rear_delt_machine", cat: "machines_upper", name: { fr: "Machine épaules arrière (reverse pec deck)", en: "Reverse pec deck" }, muscles: ["shoulders","back"] },
  { id: "bicep_machine", cat: "machines_upper", name: { fr: "Machine biceps", en: "Bicep curl machine" }, muscles: ["biceps"] },
  { id: "tricep_machine", cat: "machines_upper", name: { fr: "Machine triceps", en: "Tricep extension machine" }, muscles: ["triceps"] },

  // ─── Machines bas du corps ───
  { id: "leg_press", cat: "machines_lower", name: { fr: "Presse à cuisses", en: "Leg press" }, muscles: ["quads","glutes","hamstrings"] },
  { id: "hack_squat", cat: "machines_lower", name: { fr: "Hack squat", en: "Hack squat" }, muscles: ["quads","glutes"] },
  { id: "leg_extension", cat: "machines_lower", name: { fr: "Leg extension", en: "Leg extension" }, muscles: ["quads"] },
  { id: "leg_curl_lying", cat: "machines_lower", name: { fr: "Leg curl allongé", en: "Lying leg curl" }, muscles: ["hamstrings"] },
  { id: "leg_curl_seated", cat: "machines_lower", name: { fr: "Leg curl assis", en: "Seated leg curl" }, muscles: ["hamstrings"] },
  { id: "hip_thrust_machine", cat: "machines_lower", name: { fr: "Machine hip thrust", en: "Hip thrust machine" }, muscles: ["glutes"] },
  { id: "calf_raise_machine", cat: "machines_lower", name: { fr: "Machine mollets", en: "Calf raise machine" }, muscles: ["calves"] },
  { id: "ghr", cat: "machines_lower", name: { fr: "Glute-Ham Raise (GHR)", en: "Glute-Ham Raise" }, muscles: ["hamstrings","glutes"] },
  { id: "belt_squat", cat: "machines_lower", name: { fr: "Belt squat", en: "Belt squat" }, muscles: ["quads","glutes"] },

  // ─── Cardio ───
  { id: "treadmill", cat: "cardio", name: { fr: "Tapis de course", en: "Treadmill" }, muscles: ["cardio"] },
  { id: "rower", cat: "cardio", name: { fr: "Rameur (Concept2)", en: "Rower (Concept2)" }, muscles: ["cardio","back","full_body"] },
  { id: "assault_bike", cat: "cardio", name: { fr: "Assault bike / Air bike", en: "Assault bike / Air bike" }, muscles: ["cardio","full_body"] },
  { id: "elliptical", cat: "cardio", name: { fr: "Vélo elliptique", en: "Elliptical" }, muscles: ["cardio"] },
  { id: "stair_master", cat: "cardio", name: { fr: "Stair master", en: "Stair master" }, muscles: ["cardio","glutes"] },
  { id: "ski_erg", cat: "cardio", name: { fr: "Ski erg", en: "Ski erg" }, muscles: ["cardio","back","core"] },
  { id: "bike_classic", cat: "cardio", name: { fr: "Vélo classique", en: "Bike (classic)" }, muscles: ["cardio","quads"] },
  { id: "swimming_pool", cat: "cardio", name: { fr: "Piscine", en: "Swimming pool" }, muscles: ["cardio","full_body"] },

  // ─── Poids du corps ───
  { id: "pull_up_bar", cat: "bodyweight", name: { fr: "Barre de traction", en: "Pull-up bar" }, muscles: ["back","biceps"] },
  { id: "dip_station", cat: "bodyweight", name: { fr: "Barres parallèles (dips)", en: "Dip station" }, muscles: ["chest","triceps"] },
  { id: "captain_chair", cat: "bodyweight", name: { fr: "Chaise romaine (leg raises)", en: "Captain's chair" }, muscles: ["core"] },
  { id: "mat_gym", cat: "bodyweight", name: { fr: "Tapis de sol", en: "Gym mat" }, muscles: ["core"] },

  // ─── Fonctionnel ───
  { id: "med_ball", cat: "functional", name: { fr: "Medicine ball", en: "Medicine ball" }, muscles: ["core","full_body"] },
  { id: "slam_ball", cat: "functional", name: { fr: "Slam ball", en: "Slam ball" }, muscles: ["core","cardio"] },
  { id: "battle_ropes", cat: "functional", name: { fr: "Cordes ondulatoires", en: "Battle ropes" }, muscles: ["shoulders","cardio","core"] },
  { id: "plyo_box", cat: "functional", name: { fr: "Plyo box", en: "Plyo box" }, muscles: ["quads","cardio"] },
  { id: "sled", cat: "functional", name: { fr: "Sled (push/pull)", en: "Sled (push/pull)" }, muscles: ["quads","glutes","cardio"] },
  { id: "resistance_bands", cat: "functional", name: { fr: "Bandes élastiques", en: "Resistance bands" }, muscles: ["full_body"] },
  { id: "trx", cat: "functional", name: { fr: "TRX (sangles)", en: "TRX (straps)" }, muscles: ["full_body","core"] },
  { id: "jump_rope", cat: "functional", name: { fr: "Corde à sauter", en: "Jump rope" }, muscles: ["cardio","calves"] }
];

// Récupère les machines groupées par catégorie pour l'affichage UI
function machinesByCategory(){
  const grouped = {};
  Object.keys(MACHINE_CATEGORIES).forEach(catId => { grouped[catId] = []; });
  MACHINES.forEach(m => {
    if(!grouped[m.cat]) grouped[m.cat] = [];
    grouped[m.cat].push(m);
  });
  return grouped;
}

// Récupère une machine par id
function getMachine(id){
  return MACHINES.find(m => m.id === id) || null;
}
// ===== from anatomy.js =====
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
// ===== from pathologies.js =====
// FITStark — Bibliothèque de pathologies & risques par exercice
// Sources : Squat University (Aaron Horschig), McGill (Back Mechanic), Kelly Starrett (Becoming a Supple Leopard),
// Tom Morrison (Strength & Conditioning), revue PubMed sur biomécanique des exercices à risque.

const PATHOLOGIES = {
  l5:       { label: "Lombaires (L5-S1)",        icon: "🏥", color: "#E63946", short: "Dos" },
  shoulder: { label: "Épaules",                  icon: "💪", color: "#F4A261", short: "Épaule" },
  knee:     { label: "Genoux",                   icon: "🦵", color: "#E76F51", short: "Genou" },
  wrist:    { label: "Poignets",                 icon: "✋", color: "#8B5CF6", short: "Poignet" },
  elbow:    { label: "Coudes",                   icon: "🦴", color: "#06b6d4", short: "Coude" }
};

// EXERCISE_RISKS[exerciseName][pathologyKey] = { level: "warn"|"avoid", msg: "..." }
// "warn"  = à faire avec précaution + modification de forme
// "avoid" = à éviter complètement, alternative proposée dans `alt`
const EXERCISE_RISKS = {
  // ─── PUSH ───
  "Bench Press": {
    shoulder: { level: "warn", msg: "Coudes à 45° max (pas 90°). Omoplates rétractées et plaquées au banc. Si impingement → préfère le DB bench press, plus tolérant." },
    wrist:    { level: "warn", msg: "Barre dans la base de la paume (pas les doigts). Bracelets de force si poignets douloureux." }
  },
  "OHP Debout": {
    shoulder: { level: "warn", msg: "Mouvement à risque pour les épaules : impingement fréquent avec la barre. Préfère le DB OHP (paumes neutres) ou le Landmine Press." },
    l5:       { level: "warn", msg: "Pas de cambrure lombaire compensatoire — abdos et fessiers serrés. Si dos faible → assis avec dossier (Seated DB Press)." }
  },
  "Incline DB Press": {
    shoulder: { level: "warn", msg: "Banc à 30° (pas 45° ou plus = stress acromion). Pause 1s à mi-course pour contrôle." }
  },
  "Dips Poitrine": {
    shoulder: { level: "avoid", msg: "Très risqué pour la coiffe des rotateurs. À éviter si épaules sensibles. Alt : DB Bench Press incliné.", alt: "Incline DB Press" },
    wrist:    { level: "warn", msg: "Poignets en hyperextension sous charge. Si gêne → utilise des barres parallèles épaisses." }
  },
  "Triceps Dips": {
    shoulder: { level: "warn", msg: "Coudes ne doivent pas remonter au-dessus des épaules. Stop avant si claquement / douleur." },
    elbow:    { level: "warn", msg: "Forte tension sur les tendons. Évite si tendinite. Alt : Cable Pushdown (plus doux)." }
  },
  "Lateral Raises": {
    shoulder: { level: "warn", msg: "Ne dépasse pas la hauteur des épaules. Pouce légèrement vers le haut (anti-impingement)." }
  },
  "Arnold Press": {
    shoulder: { level: "avoid", msg: "Rotation sous charge en position vulnérable. Alt si épaules sensibles : Neutral DB Press (paumes face-à-face).", alt: "Lateral Raises" }
  },
  "Skull Crushers": {
    elbow:    { level: "warn", msg: "Stress maximal sur les tendons du triceps. Si tendinite → swap pour OH Triceps Extension (plus tolérant)." }
  },
  "OH Triceps Ext.": {
    shoulder: { level: "warn", msg: "Mobilité épaule requise. Si raideur → fais-le assis avec dossier." },
    elbow:    { level: "warn", msg: "Excentrique lent 3s pour ménager les tendons." }
  },
  "Triceps Pushdown": {
    elbow:    { level: "warn", msg: "Coudes COLLÉS au tronc (pas devant). Si tendinite : préfère une corde plutôt que la barre." }
  },
  // ─── PULL ───
  "Pull-ups": {
    shoulder: { level: "warn", msg: "Démarre avec les omoplates rétractées (scapular pull-up). Ne descends pas en hyperextension passive si épaules fragiles." },
    elbow:    { level: "warn", msg: "Coudes en supination = stress biceps. Alt si tendinite : Chin-ups prise neutre (paumes face-à-face)." }
  },
  "Bench DB Row": {
    l5:       { level: "warn", msg: "Banc indispensable. JAMAIS de version bent-over libre sans support." }
  },
  "T-Bar Row": {
    l5:       { level: "avoid", msg: "Position penchée + charge lourde = très à risque. Alt : Chest-Supported Row (banc incliné).", alt: "Chest-Supported Row" }
  },
  "Cable Row": {
    l5:       { level: "warn", msg: "Dos NEUTRE. Ne fléchis pas le tronc à la fin du mouvement (cherche pas à 'tirer plus loin')." }
  },
  "Chest-Supported Row": {
    // Aucun risque significatif — c'est l'alternative safe par excellence
  },
  "Face Pulls": {
    // Safe pour toutes pathologies — c'est même un correctif de la santé épaule
  },
  "Barbell Curls": {
    elbow:    { level: "warn", msg: "Barre droite = stress poignet/coude. Préfère la barre EZ. Excentrique 3s." },
    wrist:    { level: "warn", msg: "Barre EZ obligatoire si tendinite poignet." }
  },
  "Preacher Curl": {
    elbow:    { level: "warn", msg: "Isolation totale = stress max sur les tendons. Stop avant la pleine extension si tendinite." }
  },
  "Hammer Curls": {
    // Prise neutre = la plus douce pour coudes et poignets ✓
  },
  // ─── LEGS ───
  "Back Squat": {
    l5:       { level: "warn", msg: "CEINTURE OBLIGATOIRE. Dos neutre, abdos durs (Valsalva). Stop si douleur lombaire pendant ou après." },
    knee:     { level: "warn", msg: "Genoux suivent les orteils (légèrement vers l'extérieur). Profondeur à adapter selon morpho (parallèle suffit). Échauffe avec Goblet Squat léger." }
  },
  "Romanian DL": {
    l5:       { level: "avoid", msg: "TRÈS RISQUÉ si L5-S1 instable. Dos STRICTEMENT neutre, charnière hanche pure, amplitude réduite. Stop si moindre douleur. Alt : KB Deadlift.", alt: "Goblet Squat" }
  },
  "Bulgarian Split Squat": {
    knee:     { level: "warn", msg: "Genou avant ne dépasse pas le pied (sauf si morpho fémur long). Pied arrière surélevé pas trop haut (30 cm max). Stop si douleur rotule." },
    l5:       { level: "warn", msg: "Tronc droit, pas penché en avant. Si lombaires faibles → version DB plutôt que barbell." }
  },
  "Lunges": {
    knee:     { level: "warn", msg: "Genou avant à 90°, ne dépasse pas le pied. Pas long. Si rotule sensible → préfère les Reverse Lunges (moins de cisaillement)." }
  },
  "Step-ups": {
    knee:     { level: "warn", msg: "Pousse sur le talon (pas la pointe). Hauteur du banc adaptée — ne force pas la flexion." }
  },
  "Goblet Squat": {
    // Très safe — l'alternative recommandée si Back Squat à risque
  },
  "Leg Curl": {
    knee:     { level: "warn", msg: "Si douleur derrière le genou (popliteus) → réduit l'amplitude. Pause 1s en fin de contraction (pas de claquement)." }
  },
  "Nordic Curl": {
    knee:     { level: "warn", msg: "Mouvement très exigeant. Si débutant : retiens-toi avec les mains les 80% du chemin. Stop immédiat si crampe." }
  },
  "Calf Raises": {
    // Pas de risque significatif
  },
  "Farmer's Walk": {
    l5:       { level: "warn", msg: "Posture verticale stricte, épaules basses, abdos durs. Si lombaires : commence léger (50% du poids de corps total)." },
    wrist:    { level: "warn", msg: "Si tu peux pas tenir 30m → trop lourd. N'utilise pas de straps si poignets douloureux." }
  },
  "Ab Wheel": {
    l5:       { level: "avoid", msg: "TRÈS risqué pour L5-S1. Le rollout charge les disques en flexion + extension brutale. Alt : Dead Bug (sécurité).", alt: "Plank" }
  },
  "Plank": {
    wrist:    { level: "warn", msg: "Sur les coudes (forearm plank) si poignets douloureux. Hanches pas trop hautes ni basses." }
  }
};

// Renvoie tous les warnings applicables pour un exercice donné, filtrés par les pathologies activées de l'utilisateur
function getExerciseRisks(exName, enabledPaths){
  const risks = EXERCISE_RISKS[exName];
  if(!risks || !enabledPaths || !enabledPaths.length) return [];
  const out = [];
  enabledPaths.forEach(p => {
    if(risks[p]) out.push({ pathology: p, ...risks[p] });
  });
  return out;
}
// ===== from achievements.js =====
// FITStark — Système d'achievements (badges débloquables)
// Chaque achievement a un id, label, description, icône, et une fonction `check(hist, S)`
// qui renvoie { earned: boolean, progress: 0..1 (pour les progressifs) }

const ACHIEVEMENTS = [
  // ─── ASSIDUITÉ ───
  { id: "first",    cat:"assiduité", icon:"🌱", name:"Premier pas",      desc:"Termine ta 1ère séance",
    check: h => ({ earned: h.length >= 1, progress: Math.min(1, h.length/1) }) },
  { id: "ten",      cat:"assiduité", icon:"🔥", name:"Régulier",         desc:"10 séances totales",
    check: h => ({ earned: h.length >= 10, progress: Math.min(1, h.length/10) }) },
  { id: "thirty",   cat:"assiduité", icon:"⚡", name:"Discipliné",       desc:"30 séances totales",
    check: h => ({ earned: h.length >= 30, progress: Math.min(1, h.length/30) }) },
  { id: "hundred",  cat:"assiduité", icon:"💎", name:"Centurion",        desc:"100 séances — sacré niveau",
    check: h => ({ earned: h.length >= 100, progress: Math.min(1, h.length/100) }) },
  // ─── STREAKS ───
  { id: "streak3",  cat:"streak", icon:"🎯", name:"3 jours d'affilée",   desc:"3 jours consécutifs avec séance",
    check: h => {
      const days = new Set(h.map(x => new Date(x.date).toDateString()));
      let max = 0, cur = 0;
      const today = new Date(); today.setHours(0,0,0,0);
      for(let i = 0; i < 365; i++){
        const d = new Date(today); d.setDate(d.getDate() - i);
        if(days.has(d.toDateString())) cur++; else { max = Math.max(max, cur); cur = 0; }
      }
      max = Math.max(max, cur);
      return { earned: max >= 3, progress: Math.min(1, max/3) };
    } },
  { id: "week",     cat:"streak", icon:"⭐", name:"Une semaine pleine",  desc:"7 jours consécutifs",
    check: h => {
      const days = new Set(h.map(x => new Date(x.date).toDateString()));
      let max = 0, cur = 0;
      const today = new Date(); today.setHours(0,0,0,0);
      for(let i = 0; i < 365; i++){
        const d = new Date(today); d.setDate(d.getDate() - i);
        if(days.has(d.toDateString())) cur++; else { max = Math.max(max, cur); cur = 0; }
      }
      return { earned: Math.max(max, cur) >= 7, progress: Math.min(1, Math.max(max,cur)/7) };
    } },
  // ─── VARIÉTÉ ───
  { id: "ppl",      cat:"variété", icon:"🔄", name:"Cycle PPL complet",  desc:"Push + Pull + Legs au moins 1 fois",
    check: h => {
      const ids = new Set(h.map(x => x.sessionId));
      const n = ["push","pull","legs"].filter(s => ids.has(s)).length;
      return { earned: n === 3, progress: n/3 };
    } },
  { id: "all_modes",cat:"variété", icon:"🌟", name:"Touche-à-tout",      desc:"Une séance de chaque type (PPL + Cardio + Core)",
    check: h => {
      const ids = new Set(h.map(x => x.sessionId));
      const n = ["push","pull","legs","cardio","core"].filter(s => ids.has(s)).length;
      return { earned: n === 5, progress: n/5 };
    } },
  { id: "all_muscles", cat:"variété", icon:"🗺️", name:"Anatomie complète", desc:"Tous les muscles entraînés en 30j",
    check: h => {
      const now = Date.now();
      const muscles = new Set();
      h.forEach(x => {
        if((now - new Date(x.date).getTime()) > 30*864e5) return;
        (x.exercises||[]).forEach(e => { if(e.muscle) muscles.add(e.muscle); });
      });
      const required = ["chest","shoulders","triceps","back","biceps","quads","hamstrings","calves","core"];
      const n = required.filter(m => muscles.has(m)).length;
      return { earned: n === required.length, progress: n/required.length };
    } },
  // ─── PERFORMANCE ───
  { id: "first_pr", cat:"performance", icon:"🏆", name:"Premier PR",      desc:"Premier record enregistré",
    check: h => {
      const hasWeight = h.some(x => (x.exercises||[]).some(e =>
        Object.values(e.logged||{}).some(s => s.weight > 0)
      ));
      return { earned: hasWeight, progress: hasWeight?1:0 };
    } },
  { id: "bench_pr", cat:"performance", icon:"💪", name:"Bench Press 80 kg", desc:"1RM estimé Bench Press ≥ 80 kg",
    check: (h, S) => {
      let best = 0;
      h.forEach(x => (x.exercises||[]).forEach(e => {
        if(e.name === "Bench Press") Object.values(e.logged||{}).forEach(s => {
          if(s.weight && s.reps){
            const rm = calc1RM(s.weight, s.reps);
            if(rm > best) best = rm;
          }
        });
      }));
      return { earned: best >= 80, progress: Math.min(1, best/80) };
    } },
  { id: "squat_pr", cat:"performance", icon:"🦵", name:"Back Squat 100 kg", desc:"1RM estimé Back Squat ≥ 100 kg",
    check: (h, S) => {
      let best = 0;
      h.forEach(x => (x.exercises||[]).forEach(e => {
        if(e.name === "Back Squat") Object.values(e.logged||{}).forEach(s => {
          if(s.weight && s.reps){
            const rm = calc1RM(s.weight, s.reps);
            if(rm > best) best = rm;
          }
        });
      }));
      return { earned: best >= 100, progress: Math.min(1, best/100) };
    } },
  // ─── CARDIO ───
  { id: "cardio10", cat:"cardio", icon:"🏃", name:"Endurance",           desc:"10 séances cardio totales",
    check: h => {
      const n = h.filter(x => x.sessionId === "cardio").length;
      return { earned: n >= 10, progress: Math.min(1, n/10) };
    } },
  // ─── CORE ───
  { id: "core_done", cat:"core", icon:"🛡️", name:"Core Master",         desc:"Programme Core Heavy 12 semaines terminé",
    check: h => {
      const cores = h.filter(x => x.sessionId === "core");
      // Au moins 1 séance "core" en semaine 12
      const week12 = cores.some(x => x.coreWeek === 12);
      return { earned: week12, progress: cores.length / 24 }; // 2/sem × 12 sem
    } }
];

// Renvoie [{ ach, earned, progress }] pour l'historique S.hist
function computeAchievements(hist, S){
  return ACHIEVEMENTS.map(ach => {
    try {
      const r = ach.check(hist, S) || {};
      return { ach, earned: !!r.earned, progress: r.progress || 0 };
    } catch (e) {
      return { ach, earned: false, progress: 0 };
    }
  });
}

// Stat rapide : nombre d'achievements gagnés vs total
function getAchievementStats(hist, S){
  const all = computeAchievements(hist, S);
  return { earned: all.filter(a => a.earned).length, total: all.length };
}
// ===== from protocols.js =====
// FITStark — Bibliothèque de protocoles d'entraînement validés scientifiquement
// Chaque OBJECTIVE a 1-3 METHODS validés par littérature peer-review.
// Sources principales :
// - Helgerud 2007 (HIIT 4×4) · Seiler 2010 (polarized) · Tabata 1996
// - Schoenfeld 2017/2019 (hypertrophie) · Cormie 2011 (puissance)
// - McGill 2010 (Big 3 lombaire) · Behm 2010 (core stability)
// - Mike Israetel (Renaissance Periodization) · Huang 2025 (APRE)
// - Beardsley 2018 (force/vélocité) · Krieger 2010 (volume)

const TRAINING_OBJECTIVES = {
  hybrid: {
    id: "hybrid",
    name: { fr: "Athlète hybride (force + endurance)", en: "Hybrid athlete (strength + endurance)" },
    icon: "🏋️",
    color: "#8C2F17",
    desc: { fr: "Développer force maximale ET capacité aérobie en parallèle, sans que l'un sabote l'autre", en: "Build maximal strength AND aerobic capacity in parallel without interference" },
    sources: "Wilson 2012 · Seiler 2009 · Rønnestad 2020 · Hepburn",
    sessionType: "hybrid",
    methods: [
      { id: "hepburn_polarized", name: { fr: "Hepburn + Polarisé 80/20", en: "Hepburn + Polarized 80/20" }, desc: { fr: "Progression Hepburn sur les gros mouvements (5×5 → 5×8 puis on ajoute de la charge) couplée à 80% du volume cardio en Zone 2 et 20% en haute intensité. Sépare force et cardio d'au moins 6h.", en: "Hepburn progression on the big lifts (5×5 → 5×8 then add load) paired with 80% of cardio volume in Zone 2 and 20% at high intensity. Separate strength and cardio by at least 6h." }, sets: 5, reps: 5, rest: 180, intensity: "Force RPE 7-8 · Cardio Z2/Z5" },
      { id: "concurrent_block", name: { fr: "Blocs concurrents", en: "Concurrent blocks" }, desc: { fr: "Alterne des blocs d'accumulation (volume force + tempo seuil) et des blocs d'intensification (force max 3×3 + intervalles VO2max 5×5min).", en: "Alternate accumulation blocks (strength volume + threshold tempo) and intensification blocks (max strength 3×3 + VO2max intervals 5×5min)." }, sets: 4, reps: 6, rest: 150, intensity: "Variable par bloc" },
      { id: "strength_endurance_circuit", name: { fr: "Circuit force-endurance", en: "Strength-endurance circuit" }, desc: { fr: "Compound lourd suivi d'un effort cardio, en superset, pour la densité et la résistance à la fatigue.", en: "Heavy compound followed by a cardio effort, in superset, for density and fatigue resistance." }, sets: 4, reps: 8, rest: 90, work: 60, intensity: "RPE 8" }
    ]
  },

  cardio_resp: {
    id: "cardio_resp",
    name: { fr: "Système cardio-respiratoire", en: "Cardiorespiratory" },
    icon: "🫁",
    color: "#06b6d4",
    desc: { fr: "Améliorer VO2max, capacité aérobie, endurance pulmonaire", en: "Improve VO2max, aerobic capacity, lung endurance" },
    sources: "Helgerud 2007 · Bacon 2013 · Milanović 2015",
    sessionType: "cardio",
    methods: [
      { id: "hiit44", name: { fr: "HIIT 4×4 Norvégien", en: "Norwegian HIIT 4×4" }, desc: { fr: "4 intervalles de 4 min à 85-95% FCmax, 3 min récup active. Le gold standard pour augmenter VO2max (+0.5 ml/kg/min/sem).", en: "4 intervals of 4 min at 85-95% HRmax, 3 min active recovery. Gold standard to boost VO2max (+0.5 ml/kg/min/wk)." }, work: 240, rest: 180, sets: 4, intensity: "85-95% FCmax" },
      { id: "tabata", name: { fr: "Tabata 20/10", en: "Tabata 20/10" }, desc: { fr: "8 rounds de 20s sprint / 10s récup, 4 min total. Augmente VO2max ET capacité anaérobie.", en: "8 rounds of 20s sprint / 10s rest, 4 min total. Boosts VO2max AND anaerobic capacity." }, work: 20, rest: 10, sets: 8, intensity: "All-out (RPE 9-10)" },
      { id: "polarized", name: { fr: "Polarisé Z2 (Seiler)", en: "Polarized Z2 (Seiler)" }, desc: { fr: "80% du temps en Z2 (basse intensité, conversation possible) + 20% en Z5 (HIIT court). Modèle des athlètes d'endurance d'élite.", en: "80% time in Z2 (low intensity, conversational) + 20% in Z5 (short HIIT). Elite endurance athletes' model." }, work: 1800, rest: 0, sets: 1, intensity: "Z2 = 60-70% FCmax" }
    ]
  },

  fat_loss: {
    id: "fat_loss",
    name: { fr: "Perte de gras", en: "Fat loss" },
    icon: "🔥",
    color: "#E63946",
    desc: { fr: "Brûler du gras corporel en conservant le muscle (déficit calorique + protéines)", en: "Burn body fat while preserving muscle (calorie deficit + protein)" },
    sources: "Boutcher 2011 · Helms 2014 · Trexler 2018",
    sessionType: "hybrid",
    methods: [
      { id: "metcon", name: { fr: "Metcon CrossFit-style", en: "CrossFit-style Metcon" }, desc: { fr: "Circuits métaboliques 12-20 min : compound mouvements + cardio. Max kcal/min, EPOC élevé.", en: "Metabolic circuits 12-20 min: compound movements + cardio. Max kcal/min, high EPOC." }, work: 900, rest: 60, sets: 1, reps: 12, intensity: "RPE 8-9",
        perLogType: {
          cardio:  { intensity: { fr: "RPE 8-9 (effort soutenu, court de souffle)", en: "RPE 8-9 (sustained effort, breathless)" } },
          weight:  { intensity: { fr: "RPE 8-9 (charges modérées, 10-15 reps non-stop)", en: "RPE 8-9 (moderate loads, 10-15 reps non-stop)" } },
          reps_bw: { intensity: { fr: "RPE 8-9 (enchaîne sans pause)", en: "RPE 8-9 (no pause between movements)" } }
        }
      },
      { id: "hiit_strength", name: { fr: "HIIT + force hybride", en: "Hybrid HIIT + strength" }, desc: { fr: "Alterne dans la séance : compound lift lourd 3-5 reps puis sprint cardio 30s à fond. Force maintenue, déficit accru.", en: "Alternate within session: heavy compound lift 3-5 reps then all-out 30s cardio sprint. Maintain strength, increase deficit." }, work: 30, rest: 90, sets: 8, reps: 4, intensity: "Lift 80-85% 1RM",
        perLogType: {
          cardio:  { intensity: { fr: "Sprint à fond pendant 30s (RPE 9-10, comme si tu fuyais un ours)", en: "All-out sprint for 30s (RPE 9-10, like running from a bear)" } },
          reps_bw: { intensity: { fr: "Max reps en 30s — mouvement explosif au poids du corps", en: "Max reps in 30s — explosive bodyweight movement" } },
          time:    { intensity: { fr: "Tiens la position 30s en contraction maximale", en: "Hold position 30s at max contraction" } }
        }
      },
      { id: "emom", name: { fr: "EMOM full-body", en: "Full-body EMOM" }, desc: { fr: "Every Minute On the Minute — un mouvement par minute pendant 20-30 min. Densité métabolique élevée.", en: "Every Minute On the Minute — one movement per minute for 20-30 min. High metabolic density." }, work: 60, rest: 0, sets: 25, reps: 10, intensity: "RPE 7-8",
        perLogType: {
          cardio:  { intensity: { fr: "RPE 7-8 (50-60s d'effort par minute, le reste = ton repos)", en: "RPE 7-8 (50-60s effort per minute, the rest is your break)" } }
        }
      }
    ]
  },

  explosivity: {
    id: "explosivity",
    name: { fr: "Explosivité / puissance", en: "Explosivity / power" },
    icon: "⚡",
    color: "#F4A261",
    desc: { fr: "Développer la vitesse de production de force (RFD), saut, sprint, frappes", en: "Develop rate of force development (RFD), jump, sprint, striking" },
    sources: "Cormie 2011 · Haff 2016 · Suchomel 2018",
    sessionType: "strength",
    methods: [
      { id: "plyo", name: { fr: "Pliométrie progressive", en: "Progressive plyometrics" }, desc: { fr: "Sauts en contre-mouvement, depth jumps, broad jumps. 3-5 reps × 4-6 sets, repos 2-3 min pour fraîcheur maximale.", en: "Counter-movement jumps, depth jumps, broad jumps. 3-5 reps × 4-6 sets, 2-3 min rest for max freshness." }, sets: 5, reps: 4, rest: 180, intensity: "Vitesse maximale, qualité > quantité" },
      { id: "olympic_derivatives", name: { fr: "Dérivés haltéro (Power Clean, Snatch)", en: "Olympic derivatives (Power Clean, Snatch)" }, desc: { fr: "Power Clean, Hang Snatch, Push Press. 3-5 reps × 5 sets à 70-85% 1RM. Vitesse de barre prioritaire.", en: "Power Clean, Hang Snatch, Push Press. 3-5 reps × 5 sets at 70-85% 1RM. Bar speed priority." }, sets: 5, reps: 3, rest: 180, intensity: "70-85% 1RM, vitesse max" },
      { id: "ballistic", name: { fr: "Mouvements balistiques", en: "Ballistic movements" }, desc: { fr: "Med ball throws, jump squats au poids du corps + lest léger, kettlebell swings. 5-8 reps × 4 sets.", en: "Med ball throws, jump squats bodyweight + light load, kettlebell swings. 5-8 reps × 4 sets." }, sets: 4, reps: 6, rest: 120, intensity: "Vitesse > charge" }
    ]
  },

  max_strength: {
    id: "max_strength",
    name: { fr: "Force maximale", en: "Maximal strength" },
    icon: "💪",
    color: "#E63946",
    desc: { fr: "Augmenter le 1RM sur les compound lifts (Squat, Bench, Deadlift, OHP)", en: "Increase 1RM on compound lifts (Squat, Bench, Deadlift, OHP)" },
    sources: "Wernbom 2007 · Schoenfeld 2017 · Huang 2025 (APRE)",
    sessionType: "strength",
    methods: [
      { id: "apre", name: { fr: "APRE (auto-régulation)", en: "APRE (auto-regulated)" }, desc: { fr: "4 sets : warm-up, 6 reps @75%, 6 reps @85%, AMRAP @90%. La charge du dernier set ajuste les sessions suivantes automatiquement. #1 mondial SUCRA 93%.", en: "4 sets: warm-up, 6 reps @75%, 6 reps @85%, AMRAP @90%. Last set's reps auto-adjust next sessions. #1 worldwide SUCRA 93%." }, sets: 4, reps: 6, rest: 240, intensity: "75-90% 1RM" },
      { id: "531", name: { fr: "5/3/1 Wendler", en: "5/3/1 Wendler" }, desc: { fr: "Cycles 4 semaines : 5×3, 3×3, 5/3/1, deload. Progression linéaire +2.5kg/cycle. Robuste sur 6+ mois.", en: "4-week cycles: 5×3, 3×3, 5/3/1, deload. Linear progression +2.5kg/cycle. Robust over 6+ months." }, sets: 3, reps: 5, rest: 240, intensity: "65-95% TM (Training Max)" },
      { id: "rpt", name: { fr: "Reverse Pyramid (RPT)", en: "Reverse Pyramid Training" }, desc: { fr: "Set 1 le plus lourd (4-6 reps), set 2 -10% (6-8 reps), set 3 -10% (8-10 reps). Volume optimal avec fatigue minimale.", en: "Set 1 heaviest (4-6 reps), set 2 -10% (6-8 reps), set 3 -10% (8-10 reps). Optimal volume with minimal fatigue." }, sets: 3, reps: 5, rest: 180, intensity: "85% → 75% → 65% 1RM" }
    ]
  },

  hypertrophy: {
    id: "hypertrophy",
    name: { fr: "Hypertrophie (muscle visible)", en: "Hypertrophy (visible muscle)" },
    icon: "🏋️",
    color: "#457B9D",
    desc: { fr: "Construire du volume musculaire : 8-12 reps, RIR 0-2, 10-20 sets/muscle/sem", en: "Build muscle volume: 8-12 reps, RIR 0-2, 10-20 sets/muscle/wk" },
    sources: "Schoenfeld 2017 · Krieger 2010 · Helms 2018",
    sessionType: "strength",
    methods: [
      { id: "ppl_hypertrophy", name: { fr: "Push-Pull-Legs hypertrophie", en: "Push-Pull-Legs hypertrophy" }, desc: { fr: "Split 6 jours : Push/Pull/Legs × 2. 4-5 sets × 8-12 reps. Volume haut, RIR 0-2 sur le dernier set.", en: "6-day split: Push/Pull/Legs × 2. 4-5 sets × 8-12 reps. High volume, RIR 0-2 on last set." }, sets: 4, reps: 10, rest: 90, intensity: "70-80% 1RM, RIR 0-2" },
      { id: "upper_lower", name: { fr: "Upper-Lower 4 jours", en: "Upper-Lower 4 days" }, desc: { fr: "Lun/Jeu Upper, Mar/Ven Lower. Compound + isolation. Bon compromis volume/récup.", en: "Mon/Thu Upper, Tue/Fri Lower. Compound + isolation. Good volume/recovery compromise." }, sets: 4, reps: 8, rest: 90, intensity: "RIR 1-3" },
      { id: "myoreps", name: { fr: "Myo-reps (Borge Fagerli)", en: "Myo-reps (Borge Fagerli)" }, desc: { fr: "Set d'activation 15-20 reps proche échec, puis 4-5 mini-sets de 3-5 reps avec 10-15s repos. Recrutement max en peu de temps.", en: "Activation set 15-20 reps near failure, then 4-5 mini-sets of 3-5 reps with 10-15s rest. Max recruitment in short time." }, sets: 5, reps: 4, rest: 15, intensity: "Échec technique" }
    ]
  },

  muscle_endurance: {
    id: "muscle_endurance",
    name: { fr: "Endurance musculaire", en: "Muscular endurance" },
    icon: "♾️",
    color: "#10b981",
    desc: { fr: "Tenir longtemps sous tension : 15-25 reps, repos courts (30-60s)", en: "Sustain effort over time: 15-25 reps, short rest (30-60s)" },
    sources: "Campos 2002 · Schoenfeld 2015",
    sessionType: "strength",
    methods: [
      { id: "high_reps", name: { fr: "Reps élevées (15-25)", en: "High reps (15-25)" }, desc: { fr: "Charges légères 40-55% 1RM, 4 sets de 15-25 reps, repos 45s. Stimule fibres lentes + capillarisation.", en: "Light loads 40-55% 1RM, 4 sets of 15-25 reps, 45s rest. Stimulates slow fibers + capillarization." }, sets: 4, reps: 20, rest: 45, intensity: "40-55% 1RM" },
      { id: "density_circuit", name: { fr: "Circuit de densité", en: "Density circuit" }, desc: { fr: "5-7 exercices enchaînés sans repos, 3-4 tours. Repos uniquement entre tours (90s).", en: "5-7 exercises back-to-back no rest, 3-4 rounds. Rest only between rounds (90s)." }, sets: 3, reps: 15, rest: 90, intensity: "RPE 7" }
    ]
  },

  mobility: {
    id: "mobility",
    name: { fr: "Mobilité / souplesse", en: "Mobility / flexibility" },
    icon: "🤸",
    color: "#8B5CF6",
    desc: { fr: "Améliorer l'amplitude articulaire et la qualité du mouvement (ATG, FRC)", en: "Improve joint range and movement quality (ATG, FRC)" },
    sources: "Kelly Starrett · ATG (Ben Patrick) · FRC (Andreo Spina)",
    sessionType: "mobility",
    methods: [
      { id: "atg_split", name: { fr: "ATG Knees Over Toes", en: "ATG Knees Over Toes" }, desc: { fr: "Tibialis raises, ATG split squat, backwards sled, Nordic curls. Progression hebdo en amplitude.", en: "Tibialis raises, ATG split squat, backwards sled, Nordic curls. Weekly range progression." }, sets: 3, reps: 10, rest: 60, intensity: "Lent, contrôle total" },
      { id: "frc", name: { fr: "FRC (Functional Range)", en: "FRC (Functional Range)" }, desc: { fr: "CARs (Controlled Articular Rotations) + PAILs/RAILs. 2 min par articulation, daily.", en: "CARs (Controlled Articular Rotations) + PAILs/RAILs. 2 min per joint, daily." }, sets: 3, reps: 5, rest: 30, intensity: "Tension isométrique 30-60%" }
    ]
  },

  core_stability: {
    id: "core_stability",
    name: { fr: "Stabilité du tronc (L5-S1 safe)", en: "Core stability (L5-S1 safe)" },
    icon: "🛡️",
    color: "#2A9D8F",
    desc: { fr: "Renforcer le caisson abdominal sans flexion lombaire chargée (protocole McGill)", en: "Strengthen abdominal box without loaded lumbar flexion (McGill protocol)" },
    sources: "McGill 2010 · Behm 2010 · Tom Morrison",
    sessionType: "core",
    methods: [
      { id: "mcgill_big3", name: { fr: "McGill Big 3", en: "McGill Big 3" }, desc: { fr: "Curl-up modifié + Side Plank + Bird Dog. 3 sets avec contractions descendantes 10/8/6. Le standard absolu post-hernie discale.", en: "Modified curl-up + Side Plank + Bird Dog. 3 sets with descending contractions 10/8/6. Gold standard post-disc-hernia." }, sets: 3, reps: 8, rest: 30, intensity: "Contractions isométriques 10s" },
      { id: "anti_rotation", name: { fr: "Anti-rotation (Pallof, Suitcase)", en: "Anti-rotation (Pallof, Suitcase)" }, desc: { fr: "Pallof Press + Suitcase Carry + Dead Bug. Renforce le tronc en stabilisation, jamais en flexion.", en: "Pallof Press + Suitcase Carry + Dead Bug. Strengthens core in stabilization, never flexion." }, sets: 3, reps: 12, rest: 60, intensity: "Tension constante 30-45s" }
    ]
  },

  joint_health: {
    id: "joint_health",
    name: { fr: "Santé articulaire", en: "Joint health" },
    icon: "🦴",
    color: "#F4A261",
    desc: { fr: "Prévention blessure + renfort tendineux (excentriques lents, Bulgarian protocols)", en: "Injury prevention + tendon strengthening (slow eccentrics, Bulgarian protocols)" },
    sources: "Alfredson 1998 · Beyer 2015 · Kongsgaard 2009",
    sessionType: "strength",
    methods: [
      { id: "heavy_slow", name: { fr: "Excentriques lents lourds (HSR)", en: "Heavy Slow Resistance (HSR)" }, desc: { fr: "Excentriques 3-4s sur charges modérées 70-80% 1RM. Standard pour tendinites (patellaire, achille).", en: "3-4s eccentrics on moderate loads 70-80% 1RM. Standard for tendinopathies (patellar, achilles)." }, sets: 4, reps: 6, rest: 180, intensity: "70-80% 1RM, tempo 3-1-1" },
      { id: "tib_raises", name: { fr: "Tibialis + chaîne postérieure", en: "Tibialis + posterior chain" }, desc: { fr: "Tibialis raises, calf raises lents, Nordic curls. Renforce les muscles trop souvent négligés.", en: "Tibialis raises, slow calf raises, Nordic curls. Strengthens often-neglected muscles." }, sets: 3, reps: 15, rest: 60, intensity: "Excentrique 3s" }
    ]
  },

  posture: {
    id: "posture",
    name: { fr: "Posture & dos", en: "Posture & back" },
    icon: "🪑",
    color: "#06b6d4",
    desc: { fr: "Corriger les déséquilibres posturaux dus au travail assis (cyphose, anteposition épaules)", en: "Correct postural imbalances from desk work (kyphosis, forward shoulders)" },
    sources: "Janda · Vladimir Kogan · McKenzie",
    sessionType: "strength",
    methods: [
      { id: "pull_dominant", name: { fr: "Pull-dominant (ratio 2:1)", en: "Pull-dominant (2:1 ratio)" }, desc: { fr: "2 séries de tirages pour 1 série de poussée. Face Pulls, Band Pull-Aparts, Rows quotidiens.", en: "2 pulling sets for 1 pushing set. Face Pulls, Band Pull-Aparts, daily Rows." }, sets: 4, reps: 12, rest: 60, intensity: "Volume modéré, fréquence haute" },
      { id: "thoracic_extension", name: { fr: "Extension thoracique", en: "Thoracic extension" }, desc: { fr: "Foam roller thoracique, Cobra, Cat-cow, Wall slides. Réveille la mobilité dorsale.", en: "Thoracic foam roller, Cobra, Cat-cow, Wall slides. Wakes up thoracic mobility." }, sets: 3, reps: 10, rest: 30, intensity: "Amplitude max, sans douleur" }
    ]
  },

  rehab: {
    id: "rehab",
    name: { fr: "Réadaptation post-blessure", en: "Post-injury rehab" },
    icon: "🏥",
    color: "#E76F51",
    desc: { fr: "Reprise progressive après douleur : volume bas, intensité contrôlée, focus forme", en: "Progressive return after pain: low volume, controlled intensity, form focus" },
    sources: "Cook 2003 · Kelly Starrett · Stuart McGill",
    sessionType: "strength",
    methods: [
      { id: "deload_protocol", name: { fr: "Deload progressif", en: "Progressive deload" }, desc: { fr: "15-20 reps légers (40-50% 1RM), repos 60s, amplitude réduite si gêne. Sortir du mode douleur avant de remettre du volume.", en: "15-20 light reps (40-50% 1RM), 60s rest, reduced range if discomfort. Exit pain mode before adding volume." }, sets: 3, reps: 18, rest: 60, intensity: "40-50% 1RM, RPE 5-6" },
      { id: "isometric_pain", name: { fr: "Isométriques anti-douleur", en: "Pain-relief isometrics" }, desc: { fr: "Holds isométriques 30-45s à 70% contraction max. Effet analgésique immédiat (Rio 2015) pour tendinites.", en: "Isometric holds 30-45s at 70% max contraction. Immediate analgesic effect (Rio 2015) for tendinopathies." }, sets: 5, reps: 1, rest: 60, intensity: "70% contraction max, 30-45s" }
    ]
  },

  sport_specific: {
    id: "sport_specific",
    name: { fr: "Performance sportive spécifique", en: "Sport-specific performance" },
    icon: "🎯",
    color: "#E63946",
    desc: { fr: "Préparation physique pour sport collectif/combat/endurance (transfert vers la discipline)", en: "Physical prep for team sport / combat / endurance (transfer to the discipline)" },
    sources: "Verkhoshansky · Bondarchuk · Joel Jamieson",
    sessionType: "hybrid",
    methods: [
      { id: "block_periodization", name: { fr: "Périodisation par blocs (Verkhoshansky)", en: "Block periodization (Verkhoshansky)" }, desc: { fr: "Blocs de 3-4 sem : accumulation (volume), transmutation (intensité), réalisation (puissance/peak).", en: "3-4 week blocks: accumulation (volume), transmutation (intensity), realization (power/peak)." }, sets: 4, reps: 6, rest: 180, intensity: "Variable par bloc" },
      { id: "conjugate", name: { fr: "Méthode conjuguée (Westside)", en: "Conjugate method (Westside)" }, desc: { fr: "Max Effort day (1-3RM) + Dynamic Effort day (vitesse 50-60% 1RM) + Repetition day. Force ET vitesse simultanées.", en: "Max Effort day (1-3RM) + Dynamic Effort day (speed 50-60% 1RM) + Repetition day. Strength AND speed simultaneously." }, sets: 8, reps: 3, rest: 60, intensity: "Variable selon journée" }
    ]
  }
};

// Renvoie tous les objectifs en tableau ordonné pour affichage UI
function listObjectives(){
  return Object.values(TRAINING_OBJECTIVES);
}

// v8.44 : Calcule la semaine actuelle du programme actif depuis sa date de création
// Renvoie un entier 1-based, plafonné à prog.duration (terminé)
function getCurrentProgramWeek(prog){
  if(!prog || !prog.createdAt) return 1;
  const startMs = new Date(prog.createdAt).getTime();
  const diffDays = Math.floor((Date.now() - startMs) / 864e5);
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(week, prog.duration || 12));
}

// v8.44 : compte le nombre de séances "custom_program" faites pour (weekIdx, sessIdx)
// → permet de marquer ✓ Terminée sur la home
function countCustomSessionsDone(hist, weekIdx, sessIdx){
  if(!Array.isArray(hist)) return 0;
  return hist.filter(h =>
    h.sessionId === "custom_program" &&
    h._cp && h._cp.weekIdx === weekIdx && h._cp.sessIdx === sessIdx
  ).length;
}

// v8.46 — Planning hebdomadaire adaptatif pour le programme personnalisé.
// Renvoie days[7] avec status (done/today/future/past_rest/today_rest/future_rest)
// + sessIdx (index de la séance du programme) ou null pour rest.
// Logique :
// 1. Mappe les N séances de la semaine en cours sur des jours par défaut selon la fréquence
// 2. Override avec les séances RÉELLEMENT faites cette semaine (S.hist + _cp ref)
// 3. Pour les séances restantes (pas encore faites), les répartit sur les jours futurs depuis aujourd'hui
function computeCustomWeekPlan(prog, hist){
  if(!prog) return null;
  const currentWeek = getCurrentProgramWeek(prog);
  const week = (prog.weeks || []).find(w => w.weekNum === currentWeek);
  if(!week) return null;
  const sessions = week.sessions || [];
  const isDeload = sessions.some(s => /Deload/i.test(s.intensity || ""));

  // Setup dates de la semaine en cours (lundi = jour 0)
  const now = new Date();
  const todayDow = now.getDay();
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - todayIdx);

  const days = [];
  for(let i = 0; i < 7; i++){
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({ date: d, dow: i, status: "pending", sess: null, sessIdx: null });
  }

  // 1) Remplit les jours avec les séances FAITES cette semaine (override absolu)
  const doneSlots = new Set();
  (hist || []).forEach(h => {
    if(h.sessionId !== "custom_program" || !h._cp) return;
    if(h._cp.weekIdx !== currentWeek) return;
    const hd = new Date(h.date);
    if(hd < monday) return;
    const dayIdx = Math.floor((hd.getTime() - monday.getTime()) / 864e5);
    if(dayIdx < 0 || dayIdx > 6) return;
    if(days[dayIdx].sess === null){
      days[dayIdx].sess = "cp_session";
      days[dayIdx].sessIdx = h._cp.sessIdx;
      days[dayIdx].status = "done";
      doneSlots.add(h._cp.sessIdx);
    }
  });

  // 2) Past sans rien : past_rest
  for(let i = 0; i < todayIdx; i++){
    if(days[i].status === "pending"){
      days[i].sess = "rest";
      days[i].status = "past_rest";
    }
  }

  // 3) Liste des séances restant à faire cette semaine
  const remainingSlots = sessions.map((_, idx) => idx).filter(idx => !doneSlots.has(idx));

  // 4) Distribue les séances restantes sur les jours libres depuis aujourd'hui
  // Stratégie : espace les séances autant que possible parmi les jours restants
  const freeDayIndices = [];
  for(let i = todayIdx; i < 7; i++){
    if(days[i].status === "pending") freeDayIndices.push(i);
  }
  // v8.61 — Bug fix : on ne peut placer QUE les séances qui rentrent dans les jours libres
  // Avant : si remainingSlots.length > freeDayIndices.length (4 séances, 3 jours), Math.round(i*step)
  // dépassait après splice → freeDayIndices[neg/oversized index] = undefined → days[undefined].status crash.
  // Fix : on cape le nombre à placer + on garde tous les accès défensifs.
  const toPlace = Math.min(remainingSlots.length, freeDayIndices.length);
  if(toPlace > 0){
    const usedIdx = new Set();
    for(let i = 0; i < toPlace; i++){
      // Espacement régulier dans la fenêtre libre disponible
      const evenPos = toPlace === 1 ? 0 : Math.round(i * (freeDayIndices.length - 1) / (toPlace - 1));
      let dayIdx = freeDayIndices[Math.max(0, Math.min(freeDayIndices.length - 1, evenPos))];
      // Si l'index "idéal" est déjà pris, prends le 1er jour libre restant
      if(dayIdx === undefined || usedIdx.has(dayIdx)){
        for(const d of freeDayIndices){
          if(!usedIdx.has(d)){ dayIdx = d; break; }
        }
      }
      if(dayIdx === undefined || !days[dayIdx]) continue;
      if(days[dayIdx].status === "pending"){
        days[dayIdx].sess = "cp_session";
        days[dayIdx].sessIdx = remainingSlots[i];
        days[dayIdx].status = (dayIdx === todayIdx) ? "today" : "future";
        usedIdx.add(dayIdx);
      }
    }
  }

  // 5) Tous les jours restants → rest
  for(let i = todayIdx; i < 7; i++){
    if(days[i].status === "pending"){
      days[i].sess = "rest";
      days[i].status = (i === todayIdx) ? "today_rest" : "future_rest";
    }
  }

  return { days, currentWeek, totalWeeks: prog.duration, isDeload, totalSessions: sessions.length };
}

// Récupère un objectif par son id, ou null
function getObjective(id){
  return TRAINING_OBJECTIVES[id] || null;
}

// Génère un programme structuré sur N semaines avec freq sessions/sem
// objId : id de l'objectif (ex: "explosivity")
// methodId : id de la méthode choisie (ex: "plyo")
// machineIds : liste des machines disponibles
// duration : nombre de semaines (4-12)
// frequency : sessions par semaine (2-5)
// level : "beginner" | "intermediate" | "advanced"
function generateProgram({objId, methodId, machineIds, duration, frequency, level}){
  const obj = getObjective(objId);
  if(!obj) return null;
  const method = obj.methods.find(m => m.id === methodId) || obj.methods[0];
  // Multiplicateurs de volume selon niveau
  const volMult = level === "beginner" ? 0.7 : level === "advanced" ? 1.3 : 1.0;
  const repsMult = level === "beginner" ? 0.85 : level === "advanced" ? 1.15 : 1.0;
  // Construit les sessions semaine par semaine avec progression linéaire +5% volume/sem
  const weeks = [];
  for(let w = 1; w <= duration; w++){
    const progression = 1 + ((w - 1) * 0.05);  // +5% par semaine
    const sessions = [];
    for(let s = 0; s < frequency; s++){
      sessions.push({
        dayLabel: `S${w}-J${s+1}`,
        sets: Math.round((method.sets || 4) * volMult * progression),
        reps: Math.round((method.reps || 8) * repsMult),
        rest: method.rest || 90,
        work: method.work || null,
        intensity: method.intensity || "RPE 7-8"
      });
    }
    // Deload semaine 4 et 8 si duration >= 8
    if((w === 4 && duration >= 8) || w === 8){
      sessions.forEach(s => { s.sets = Math.max(2, Math.round(s.sets * 0.6)); s.intensity = "Deload — volume -40%"; });
    }
    weeks.push({ weekNum: w, sessions });
  }
  return {
    objective: obj.id,
    objectiveName: obj.name,
    method: method.id,
    methodName: method.name,
    machines: machineIds || [],
    duration, frequency, level,
    createdAt: new Date().toISOString(),
    weeks
  };
}
// ===== from custom_exercises.js =====
// FITStark — Catalogue d'exercices machine-aware (v8.43)
// Chaque exercice connaît : muscle, machines requises (TOUTES doivent être disponibles),
// objectifs où il a sa place, type (compound/isolation/cardio/plyo/core/mobility).
// Utilisé par pickExercisesForSession() pour générer la liste d'exercices d'une séance
// du programme personnalisé en fonction du matériel disponible + objectif.

const CUSTOM_EXERCISE_CATALOG = [
  // ─── CHEST ───
  { id: "bench_press", name: { fr: "Développé couché barre", en: "Bench Press" }, muscle: "chest", machines: ["flat_bench","barbell_olympic"], objectives: ["max_strength","hypertrophy","muscle_endurance","hybrid"], type: "compound", imgs:["Barbell_Bench_Press_-_Medium_Grip/0.jpg", "Barbell_Bench_Press_-_Medium_Grip/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bench+Press+form" },
  { id: "db_bench_press", name: { fr: "Développé couché haltères", en: "DB Bench Press" }, muscle: "chest", machines: ["flat_bench","dumbbells"], objectives: ["max_strength","hypertrophy","muscle_endurance","rehab","hybrid"], type: "compound", imgs:["Dumbbell_Bench_Press/0.jpg", "Dumbbell_Bench_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Bench+Press+form" },
  { id: "incline_db_press", name: { fr: "Développé incliné haltères", en: "Incline DB Press" }, muscle: "chest", machines: ["incline_bench","dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "compound", imgs:["Incline_Dumbbell_Press/0.jpg", "Incline_Dumbbell_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Incline+DB+Press+form" },
  { id: "incline_bench_press", name: { fr: "Développé incliné barre", en: "Incline Bench Press" }, muscle: "chest", machines: ["incline_bench","barbell_olympic"], objectives: ["max_strength","hypertrophy"], type: "compound", yt:"https://www.youtube.com/results?search_query=Incline+Bench+Press+form" },
  { id: "chest_press_m", name: { fr: "Développé machine", en: "Chest Press Machine" }, muscle: "chest", machines: ["chest_press_machine"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Leverage_Chest_Press/0.jpg", "Leverage_Chest_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Chest+Press+Machine+form" },
  { id: "pec_deck_fly", name: { fr: "Pec deck (butterfly)", en: "Pec Deck Fly" }, muscle: "chest", machines: ["pec_deck"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Butterfly/0.jpg", "Butterfly/1.jpg"], yt:"https://www.youtube.com/results?search_query=Pec+Deck+Fly+form" },
  { id: "cable_crossover_fly", name: { fr: "Écarté poulies (crossover)", en: "Cable Crossover Fly" }, muscle: "chest", machines: ["cable_crossover"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Cable_Crossover/0.jpg", "Cable_Crossover/1.jpg"], yt:"https://www.youtube.com/results?search_query=Cable+Crossover+Fly+form" },
  { id: "dips_bw", name: { fr: "Dips poids du corps", en: "Bodyweight Dips" }, muscle: "chest", machines: ["dip_station"], objectives: ["max_strength","hypertrophy","hybrid"], type: "compound", imgs:["Dips_-_Chest_Version/0.jpg", "Dips_-_Chest_Version/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bodyweight+Dips+form" },
  { id: "pushup_bw", name: { fr: "Pompes (push-ups)", en: "Push-ups" }, muscle: "chest", machines: ["mat_gym"], objectives: ["hypertrophy","muscle_endurance","rehab","posture"], type: "compound", imgs:["Pushups/0.jpg", "Pushups/1.jpg"], yt:"https://www.youtube.com/results?search_query=Push-ups+form", logType:"reps_bw" },

  // ─── BACK ───
  { id: "pullups_bw", name: { fr: "Tractions (pull-ups)", en: "Pull-ups" }, muscle: "back", machines: ["pull_up_bar"], objectives: ["max_strength","hypertrophy","muscle_endurance","hybrid"], type: "compound", imgs:["Pullups/0.jpg", "Pullups/1.jpg"], yt:"https://www.youtube.com/results?search_query=Pull-ups+form" },
  { id: "lat_pulldown_ex", name: { fr: "Tirage vertical", en: "Lat Pulldown" }, muscle: "back", machines: ["lat_pulldown"], objectives: ["hypertrophy","muscle_endurance","rehab","posture","hybrid"], type: "compound", imgs:["Wide-Grip_Lat_Pulldown/0.jpg", "Wide-Grip_Lat_Pulldown/1.jpg"], yt:"https://www.youtube.com/results?search_query=Lat+Pulldown+form" },
  { id: "seated_cable_row", name: { fr: "Tirage horizontal assis", en: "Seated Cable Row" }, muscle: "back", machines: ["seated_row"], objectives: ["hypertrophy","muscle_endurance","posture","rehab"], type: "compound", imgs:["Seated_Cable_Rows/0.jpg", "Seated_Cable_Rows/1.jpg"], yt:"https://www.youtube.com/results?search_query=Seated+Cable+Row+form" },
  { id: "barbell_row", name: { fr: "Rowing barre buste penché", en: "Barbell Row" }, muscle: "back", machines: ["barbell_olympic"], objectives: ["max_strength","hypertrophy","hybrid"], type: "compound", imgs:["Bent_Over_Barbell_Row/0.jpg", "Bent_Over_Barbell_Row/1.jpg"], yt:"https://www.youtube.com/results?search_query=Barbell+Row+form" },
  { id: "db_row", name: { fr: "Rowing haltère un bras", en: "One-arm DB Row" }, muscle: "back", machines: ["flat_bench","dumbbells"], objectives: ["hypertrophy","muscle_endurance","posture","hybrid"], type: "compound", imgs:["One-Arm_Dumbbell_Row/0.jpg", "One-Arm_Dumbbell_Row/1.jpg"], yt:"https://www.youtube.com/results?search_query=One-arm+DB+Row+form" },
  { id: "face_pulls", name: { fr: "Face Pulls", en: "Face Pulls" }, muscle: "back", machines: ["cable_crossover"], objectives: ["posture","hypertrophy","rehab","muscle_endurance"], type: "isolation", imgs:["Face_Pull/0.jpg", "Face_Pull/1.jpg"], yt:"https://www.youtube.com/results?search_query=Face+Pulls+form" },
  { id: "band_pull_apart", name: { fr: "Band Pull-Aparts", en: "Band Pull-Aparts" }, muscle: "back", machines: ["resistance_bands"], objectives: ["posture","rehab","muscle_endurance"], type: "isolation", imgs:["Band_Pull_Apart/0.jpg", "Band_Pull_Apart/1.jpg"], yt:"https://www.youtube.com/results?search_query=Band+Pull-Aparts+form" },
  { id: "hyperextension_ex", name: { fr: "Extension lombaire (hyperextension)", en: "Back Extension" }, muscle: "back", machines: ["hyperextension"], objectives: ["posture","rehab","hypertrophy"], type: "isolation", imgs:["Hyperextensions_Back_Extensions/0.jpg", "Hyperextensions_Back_Extensions/1.jpg"], yt:"https://www.youtube.com/results?search_query=Back+Extension+form" },

  // ─── SHOULDERS ───
  { id: "ohp_barbell", name: { fr: "OHP debout barre", en: "Standing OHP" }, muscle: "shoulders", machines: ["barbell_olympic","squat_rack"], objectives: ["max_strength","hypertrophy","hybrid"], type: "compound", imgs:["Standing_Military_Press/0.jpg", "Standing_Military_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Standing+OHP+form" },
  { id: "db_shoulder_press", name: { fr: "Développé épaules haltères", en: "DB Shoulder Press" }, muscle: "shoulders", machines: ["incline_bench","dumbbells"], objectives: ["hypertrophy","muscle_endurance","rehab","hybrid"], type: "compound", imgs:["Seated_Dumbbell_Press/0.jpg", "Seated_Dumbbell_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Shoulder+Press+form" },
  { id: "shoulder_press_m", name: { fr: "Développé épaules machine", en: "Shoulder Press Machine" }, muscle: "shoulders", machines: ["shoulder_press_machine"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Machine_Shoulder_Military_Press/0.jpg", "Machine_Shoulder_Military_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Shoulder+Press+Machine+form" },
  { id: "lateral_raises_db", name: { fr: "Élévations latérales haltères", en: "DB Lateral Raises" }, muscle: "shoulders", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance","posture"], type: "isolation", imgs:["Side_Lateral_Raise/0.jpg", "Side_Lateral_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Lateral+Raises+form" },
  { id: "lateral_raise_m", name: { fr: "Élévations latérales machine", en: "Lateral Raise Machine" }, muscle: "shoulders", machines: ["lateral_raise_machine"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Lateral_Raise_-_With_Bands/0.jpg", "Lateral_Raise_-_With_Bands/1.jpg"], yt:"https://www.youtube.com/results?search_query=Lateral+Raise+Machine+form" },
  { id: "rear_delt_fly", name: { fr: "Oiseau (rear delt fly)", en: "Rear Delt Fly" }, muscle: "shoulders", machines: ["rear_delt_machine"], objectives: ["posture","hypertrophy","rehab"], type: "isolation", imgs:["Seated_Bent-Over_Rear_Delt_Raise/0.jpg", "Seated_Bent-Over_Rear_Delt_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=Rear+Delt+Fly+form" },

  // ─── BICEPS ───
  { id: "barbell_curl", name: { fr: "Curl barre", en: "Barbell Curl" }, muscle: "biceps", machines: ["barbell_ez"], objectives: ["max_strength","hypertrophy"], type: "isolation", imgs:["Barbell_Curl/0.jpg", "Barbell_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=Barbell+Curl+form" },
  { id: "db_curl", name: { fr: "Curl haltères", en: "DB Curl" }, muscle: "biceps", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Dumbbell_Bicep_Curl/0.jpg", "Dumbbell_Bicep_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Curl+form" },
  { id: "hammer_curl_ex", name: { fr: "Hammer Curl", en: "Hammer Curl" }, muscle: "biceps", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Hammer_Curls/0.jpg", "Hammer_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Hammer+Curl+form" },
  { id: "preacher_curl_ex", name: { fr: "Larry Scott (preacher curl)", en: "Preacher Curl" }, muscle: "biceps", machines: ["preacher_bench","barbell_ez"], objectives: ["hypertrophy"], type: "isolation", imgs:["Preacher_Curl/0.jpg", "Preacher_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=Preacher+Curl+form" },
  { id: "cable_curl", name: { fr: "Curl poulie basse", en: "Cable Curl" }, muscle: "biceps", machines: ["cable_low_pulley"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["High_Cable_Curls/0.jpg", "High_Cable_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Cable+Curl+form" },

  // ─── TRICEPS ───
  { id: "tricep_pushdown", name: { fr: "Pushdown poulie", en: "Tricep Pushdown" }, muscle: "triceps", machines: ["cable_crossover"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Triceps_Pushdown/0.jpg", "Triceps_Pushdown/1.jpg"], yt:"https://www.youtube.com/results?search_query=Tricep+Pushdown+form" },
  { id: "skull_crushers_ex", name: { fr: "Skull Crushers (barre EZ)", en: "Skull Crushers" }, muscle: "triceps", machines: ["flat_bench","barbell_ez"], objectives: ["hypertrophy"], type: "isolation", imgs:["EZ-Bar_Skullcrusher/0.jpg", "EZ-Bar_Skullcrusher/1.jpg"], yt:"https://www.youtube.com/results?search_query=Skull+Crushers+form" },
  { id: "oh_tricep_ext", name: { fr: "Extension triceps verticale", en: "Overhead Tricep Extension" }, muscle: "triceps", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Standing_Dumbbell_Triceps_Extension/0.jpg", "Standing_Dumbbell_Triceps_Extension/1.jpg"], yt:"https://www.youtube.com/results?search_query=Overhead+Tricep+Extension+form" },

  // ─── LEGS / QUADS / GLUTES ───
  { id: "back_squat_ex", name: { fr: "Back Squat barre", en: "Back Squat" }, muscle: "quads", machines: ["barbell_olympic","squat_rack"], objectives: ["max_strength","hypertrophy","explosivity","hybrid"], type: "compound", imgs:["Barbell_Squat/0.jpg", "Barbell_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Back+Squat+form" },
  { id: "front_squat_ex", name: { fr: "Front Squat", en: "Front Squat" }, muscle: "quads", machines: ["barbell_olympic","squat_rack"], objectives: ["max_strength","hypertrophy","hybrid"], type: "compound", imgs:["Clean_from_Blocks/0.jpg", "Clean_from_Blocks/1.jpg"], yt:"https://www.youtube.com/results?search_query=Front+Squat+form" },
  { id: "goblet_squat_ex", name: { fr: "Goblet Squat (haltère/KB)", en: "Goblet Squat" }, muscle: "quads", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance","rehab","hybrid"], type: "compound", imgs:["Goblet_Squat/0.jpg", "Goblet_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Goblet+Squat+form" },
  { id: "leg_press_ex", name: { fr: "Presse à cuisses", en: "Leg Press" }, muscle: "quads", machines: ["leg_press"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "compound", imgs:["Leg_Press/0.jpg", "Leg_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Leg+Press+form" },
  { id: "hack_squat_ex", name: { fr: "Hack Squat", en: "Hack Squat" }, muscle: "quads", machines: ["hack_squat"], objectives: ["hypertrophy","max_strength"], type: "compound", imgs:["Hack_Squat/0.jpg", "Hack_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Hack+Squat+form" },
  { id: "leg_extension_ex", name: { fr: "Leg Extension", en: "Leg Extension" }, muscle: "quads", machines: ["leg_extension"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "isolation", imgs:["Leg_Extensions/0.jpg", "Leg_Extensions/1.jpg"], yt:"https://www.youtube.com/results?search_query=Leg+Extension+form" },
  { id: "bulgarian_split_squat", name: { fr: "Bulgarian Split Squat", en: "Bulgarian Split Squat" }, muscle: "quads", machines: ["flat_bench","dumbbells"], objectives: ["hypertrophy","explosivity","mobility","hybrid"], type: "compound", imgs:["Split_Squat_with_Dumbbells/0.jpg", "Split_Squat_with_Dumbbells/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bulgarian+Split+Squat+form" },
  { id: "lunges_db", name: { fr: "Fentes (lunges) haltères", en: "DB Lunges" }, muscle: "quads", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance","mobility","hybrid"], type: "compound", imgs:["Dumbbell_Lunges/0.jpg", "Dumbbell_Lunges/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Lunges+form" },
  { id: "hip_thrust_ex", name: { fr: "Hip Thrust", en: "Hip Thrust" }, muscle: "glutes", machines: ["hip_thrust_machine"], objectives: ["hypertrophy","max_strength","posture"], type: "compound", imgs:["Barbell_Hip_Thrust/0.jpg", "Barbell_Hip_Thrust/1.jpg"], yt:"https://www.youtube.com/results?search_query=Hip+Thrust+form" },
  { id: "hip_thrust_barbell", name: { fr: "Hip Thrust barre", en: "Barbell Hip Thrust" }, muscle: "glutes", machines: ["flat_bench","barbell_olympic"], objectives: ["hypertrophy","max_strength"], type: "compound", imgs:["Barbell_Hip_Thrust/0.jpg", "Barbell_Hip_Thrust/1.jpg"], yt:"https://www.youtube.com/results?search_query=Barbell+Hip+Thrust+form" },

  // ─── HAMSTRINGS ───
  { id: "rdl_barbell", name: { fr: "Romanian Deadlift barre", en: "Romanian DL" }, muscle: "hamstrings", machines: ["barbell_olympic"], objectives: ["max_strength","hypertrophy","hybrid"], type: "compound", imgs:["Romanian_Deadlift/0.jpg", "Romanian_Deadlift/1.jpg"], yt:"https://www.youtube.com/results?search_query=Romanian+DL+form" },
  { id: "rdl_db", name: { fr: "Romanian DL haltères", en: "DB Romanian DL" }, muscle: "hamstrings", machines: ["dumbbells"], objectives: ["hypertrophy","rehab"], type: "compound", imgs:["Stiff-Legged_Dumbbell_Deadlift/0.jpg", "Stiff-Legged_Dumbbell_Deadlift/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Romanian+DL+form" },
  { id: "leg_curl_lying_ex", name: { fr: "Leg Curl allongé", en: "Lying Leg Curl" }, muscle: "hamstrings", machines: ["leg_curl_lying"], objectives: ["hypertrophy","muscle_endurance","rehab"], type: "isolation", imgs:["Lying_Leg_Curls/0.jpg", "Lying_Leg_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Lying+Leg+Curl+form" },
  { id: "leg_curl_seated_ex", name: { fr: "Leg Curl assis", en: "Seated Leg Curl" }, muscle: "hamstrings", machines: ["leg_curl_seated"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Seated_Leg_Curl/0.jpg", "Seated_Leg_Curl/1.jpg"], yt:"https://www.youtube.com/results?search_query=Seated+Leg+Curl+form" },
  { id: "ghr_ex", name: { fr: "Glute Ham Raise", en: "Glute Ham Raise" }, muscle: "hamstrings", machines: ["ghr"], objectives: ["max_strength","explosivity","joint_health"], type: "compound", imgs:["Glute_Ham_Raise/0.jpg", "Glute_Ham_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=Glute+Ham+Raise+form" },
  { id: "nordic_curl_ex", name: { fr: "Nordic Curl", en: "Nordic Curl" }, muscle: "hamstrings", machines: ["mat_gym"], objectives: ["joint_health","explosivity","mobility"], type: "isolation", imgs:["Lying_Leg_Curls/0.jpg", "Lying_Leg_Curls/1.jpg"], yt:"https://www.youtube.com/results?search_query=Nordic+Curl+form" },

  // ─── CALVES ───
  { id: "calf_raise_m", name: { fr: "Mollets debout machine", en: "Standing Calf Raise" }, muscle: "calves", machines: ["calf_raise_machine"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Standing_Calf_Raises/0.jpg", "Standing_Calf_Raises/1.jpg"], yt:"https://www.youtube.com/results?search_query=Standing+Calf+Raise+form" },
  { id: "calf_raise_db", name: { fr: "Mollets debout haltères", en: "DB Calf Raise" }, muscle: "calves", machines: ["dumbbells"], objectives: ["hypertrophy","muscle_endurance"], type: "isolation", imgs:["Standing_Dumbbell_Calf_Raise/0.jpg", "Standing_Dumbbell_Calf_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=DB+Calf+Raise+form" },

  // ─── CORE ───
  { id: "plank_ex", name: { fr: "Planche (gainage)", en: "Plank" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab","posture"], type: "core", imgs:["Plank/0.jpg", "Plank/1.jpg"], yt:"https://www.youtube.com/results?search_query=Plank+form", logType:"time" },
  { id: "side_plank_ex", name: { fr: "Planche latérale", en: "Side Plank" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab","posture"], type: "core", imgs:["Side_Bridge/0.jpg", "Side_Bridge/1.jpg"], yt:"https://www.youtube.com/results?search_query=Side+Plank+form", logType:"time" },
  { id: "bird_dog_ex", name: { fr: "Bird Dog", en: "Bird Dog" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab","posture"], type: "core", imgs:["Kneeling_Jump_Squat/0.jpg", "Kneeling_Jump_Squat/1.jpg"], yt:"https://www.youtube.com/results?search_query=Bird+Dog+form", logType:"time" },
  { id: "dead_bug_ex", name: { fr: "Dead Bug", en: "Dead Bug" }, muscle: "core", machines: ["mat_gym"], objectives: ["core_stability","rehab"], type: "core", imgs:["Dead_Bug/0.jpg", "Dead_Bug/1.jpg"], yt:"https://www.youtube.com/results?search_query=Dead+Bug+form", logType:"reps_bw" },
  { id: "pallof_press_ex", name: { fr: "Pallof Press (anti-rotation)", en: "Pallof Press" }, muscle: "core", machines: ["cable_low_pulley"], objectives: ["core_stability","posture","rehab"], type: "core", imgs:["Pallof_Press/0.jpg", "Pallof_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Pallof+Press+form", logType:"time" },
  { id: "suitcase_carry_ex", name: { fr: "Suitcase Carry", en: "Suitcase Carry" }, muscle: "core", machines: ["dumbbells"], objectives: ["core_stability","posture"], type: "core", imgs:["Farmers_Walk/0.jpg", "Farmers_Walk/1.jpg"], yt:"https://www.youtube.com/results?search_query=Suitcase+Carry+form", logType:"distance_load" },
  { id: "leg_raises_chair", name: { fr: "Leg Raises (chaise romaine)", en: "Captain's Chair Leg Raises" }, muscle: "core", machines: ["captain_chair"], objectives: ["hypertrophy","muscle_endurance"], type: "core", imgs:["Hanging_Leg_Raise/0.jpg", "Hanging_Leg_Raise/1.jpg"], yt:"https://www.youtube.com/results?search_query=Captain's+Chair+Leg+Raises+form", logType:"reps_bw" },

  // ─── POWER / EXPLOSIVITY (plyo) ───
  { id: "box_jumps", name: { fr: "Box Jumps", en: "Box Jumps" }, muscle: "quads", machines: ["plyo_box"], objectives: ["explosivity","fat_loss","sport_specific","hybrid"], type: "plyo", imgs:["Box_Jump_Multiple_Response/0.jpg", "Box_Jump_Multiple_Response/1.jpg"], yt:"https://www.youtube.com/results?search_query=Box+Jumps+form", logType:"reps_bw" },
  { id: "broad_jumps", name: { fr: "Broad Jumps (saut en longueur)", en: "Broad Jumps" }, muscle: "quads", machines: ["mat_gym"], objectives: ["explosivity","sport_specific"], type: "plyo", imgs:["Standing_Long_Jump/0.jpg", "Standing_Long_Jump/1.jpg"], yt:"https://www.youtube.com/results?search_query=Broad+Jumps+form", logType:"reps_bw" },
  { id: "cmj_ex", name: { fr: "Counter-Movement Jumps", en: "Counter-Movement Jumps" }, muscle: "quads", machines: ["mat_gym"], objectives: ["explosivity","sport_specific"], type: "plyo", imgs:["Standing_Long_Jump/0.jpg", "Standing_Long_Jump/1.jpg"], yt:"https://www.youtube.com/results?search_query=Counter-Movement+Jumps+form", logType:"reps_bw" },
  { id: "kb_swing", name: { fr: "Kettlebell Swings", en: "Kettlebell Swings" }, muscle: "hamstrings", machines: ["kettlebells"], objectives: ["explosivity","fat_loss","cardio_resp","sport_specific","hybrid"], type: "plyo", imgs:["One-Arm_Kettlebell_Swings/0.jpg", "One-Arm_Kettlebell_Swings/1.jpg"], yt:"https://www.youtube.com/results?search_query=Kettlebell+Swings+form" },
  { id: "med_ball_slam", name: { fr: "Med Ball Slams", en: "Med Ball Slams" }, muscle: "core", machines: ["slam_ball"], objectives: ["explosivity","fat_loss","sport_specific","hybrid"], type: "plyo", imgs:["One-Arm_Medicine_Ball_Slam/0.jpg", "One-Arm_Medicine_Ball_Slam/1.jpg"], yt:"https://www.youtube.com/results?search_query=Med+Ball+Slams+form" },
  { id: "med_ball_throw", name: { fr: "Med Ball Throws", en: "Med Ball Throws" }, muscle: "shoulders", machines: ["med_ball"], objectives: ["explosivity","sport_specific"], type: "plyo", imgs:["Backward_Medicine_Ball_Throw/0.jpg", "Backward_Medicine_Ball_Throw/1.jpg"], yt:"https://www.youtube.com/results?search_query=Med+Ball+Throws+form" },
  { id: "power_clean_ex", name: { fr: "Power Clean", en: "Power Clean" }, muscle: "back", machines: ["barbell_olympic"], objectives: ["explosivity","max_strength","sport_specific","hybrid"], type: "plyo", imgs:["Clean_and_Press/0.jpg", "Clean_and_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Power+Clean+form" },
  { id: "push_press_ex", name: { fr: "Push Press", en: "Push Press" }, muscle: "shoulders", machines: ["barbell_olympic","squat_rack"], objectives: ["explosivity","max_strength","sport_specific","hybrid"], type: "plyo", imgs:["Push_Press/0.jpg", "Push_Press/1.jpg"], yt:"https://www.youtube.com/results?search_query=Push+Press+form" },
  { id: "battle_ropes_ex", name: { fr: "Battle Ropes (waves)", en: "Battle Ropes" }, muscle: "shoulders", machines: ["battle_ropes"], objectives: ["fat_loss","cardio_resp","sport_specific","muscle_endurance"], type: "plyo", imgs:["Battling_Ropes/0.jpg", "Battling_Ropes/1.jpg"], yt:"https://www.youtube.com/results?search_query=Battle+Ropes+form", logType:"cardio" },
  { id: "sled_push", name: { fr: "Sled Push", en: "Sled Push" }, muscle: "quads", machines: ["sled"], objectives: ["explosivity","fat_loss","sport_specific","joint_health","hybrid"], type: "plyo", imgs:["Sled_Push/0.jpg", "Sled_Push/1.jpg"], yt:"https://www.youtube.com/results?search_query=Sled+Push+form", logType:"distance_load" },

  // ─── CARDIO ───
  { id: "run_tread", name: { fr: "Tapis de course", en: "Treadmill run" }, muscle: "cardio", machines: ["treadmill"], objectives: ["cardio_resp","fat_loss","hybrid"], type: "cardio", imgs:["Running_Treadmill/0.jpg", "Running_Treadmill/1.jpg"], yt:"https://www.youtube.com/results?search_query=Treadmill+run+form", logType:"cardio" },
  { id: "row_erg", name: { fr: "Rameur Concept2", en: "Rower (Concept2)" }, muscle: "cardio", machines: ["rower"], objectives: ["cardio_resp","fat_loss","sport_specific","hybrid"], type: "cardio", imgs:["Seated_Cable_Rows/0.jpg", "Seated_Cable_Rows/1.jpg"], yt:"https://www.youtube.com/results?search_query=Rower+(Concept2)+form", logType:"cardio" },
  { id: "assault_bike_ex", name: { fr: "Assault bike / Air bike", en: "Assault bike" }, muscle: "cardio", machines: ["assault_bike"], objectives: ["cardio_resp","fat_loss","sport_specific","hybrid"], type: "cardio", imgs:["Air_Bike/0.jpg", "Air_Bike/1.jpg"], yt:"https://www.youtube.com/results?search_query=Assault+bike+form", logType:"cardio" },
  { id: "ski_erg_ex", name: { fr: "Ski erg", en: "Ski erg" }, muscle: "cardio", machines: ["ski_erg"], objectives: ["cardio_resp","fat_loss","sport_specific","hybrid"], type: "cardio", imgs:["Seated_Cable_Rows/0.jpg", "Seated_Cable_Rows/1.jpg"], yt:"https://www.youtube.com/results?search_query=Ski+erg+form", logType:"cardio" },
  { id: "elliptical_ex", name: { fr: "Vélo elliptique", en: "Elliptical" }, muscle: "cardio", machines: ["elliptical"], objectives: ["cardio_resp","fat_loss","rehab"], type: "cardio", imgs:["Elliptical_Trainer/0.jpg", "Elliptical_Trainer/1.jpg"], yt:"https://www.youtube.com/results?search_query=Elliptical+form", logType:"cardio" },
  { id: "stair_master_ex", name: { fr: "Stair master", en: "Stair master" }, muscle: "cardio", machines: ["stair_master"], objectives: ["cardio_resp","fat_loss"], type: "cardio", imgs:["Stairmaster/0.jpg", "Stairmaster/1.jpg"], yt:"https://www.youtube.com/results?search_query=Stair+master+form", logType:"cardio" },
  { id: "swim_ex", name: { fr: "Natation", en: "Swimming" }, muscle: "cardio", machines: ["swimming_pool"], objectives: ["cardio_resp","fat_loss","rehab","joint_health"], type: "cardio", imgs:["Bench_Jump/0.jpg", "Bench_Jump/1.jpg"], yt:"https://www.youtube.com/results?search_query=Swimming+form", logType:"cardio" },
  { id: "bike_classic_ex", name: { fr: "Vélo classique", en: "Stationary bike" }, muscle: "cardio", machines: ["bike_classic"], objectives: ["cardio_resp","fat_loss","rehab","hybrid"], type: "cardio", imgs:["Bicycling_Stationary/0.jpg", "Bicycling_Stationary/1.jpg"], yt:"https://www.youtube.com/results?search_query=Stationary+bike+form", logType:"cardio" },
  { id: "jump_rope_ex", name: { fr: "Corde à sauter", en: "Jump rope" }, muscle: "cardio", machines: ["jump_rope"], objectives: ["cardio_resp","fat_loss","explosivity","sport_specific","hybrid"], type: "cardio", imgs:["Rope_Jumping/0.jpg", "Rope_Jumping/1.jpg"], yt:"https://www.youtube.com/results?search_query=Jump+rope+form", logType:"cardio" },

  // ─── MOBILITY ───
  { id: "atg_split_squat", name: { fr: "ATG Split Squat", en: "ATG Split Squat" }, muscle: "quads", machines: ["mat_gym"], objectives: ["mobility","joint_health","rehab"], type: "mobility", imgs:["Split_Squat_with_Dumbbells/0.jpg", "Split_Squat_with_Dumbbells/1.jpg"], yt:"https://www.youtube.com/results?search_query=ATG+Split+Squat+form", logType:"reps_bw" },
  { id: "tibialis_raises", name: { fr: "Tibialis Raises", en: "Tibialis Raises" }, muscle: "calves", machines: ["mat_gym"], objectives: ["mobility","joint_health","rehab"], type: "mobility", imgs:["Anterior_Tibialis-SMR/0.jpg", "Anterior_Tibialis-SMR/1.jpg"], yt:"https://www.youtube.com/results?search_query=Tibialis+Raises+form", logType:"reps_bw" },
  { id: "cobra_stretch", name: { fr: "Cobra (extension dorsale)", en: "Cobra stretch" }, muscle: "core", machines: ["mat_gym"], objectives: ["mobility","posture","rehab"], type: "mobility", yt:"https://www.youtube.com/results?search_query=Cobra+stretch+yoga", logType:"reps_bw" },
  { id: "wall_slides_ex", name: { fr: "Wall Slides", en: "Wall Slides" }, muscle: "shoulders", machines: ["mat_gym"], objectives: ["mobility","posture","rehab"], type: "mobility", yt:"https://www.youtube.com/results?search_query=Wall+Slides+shoulder+mobility", logType:"reps_bw" },
  { id: "thoracic_extension_ex", name: { fr: "Extension thoracique (foam roller)", en: "Thoracic Extension" }, muscle: "back", machines: ["mat_gym"], objectives: ["mobility","posture","rehab"], type: "mobility", yt:"https://www.youtube.com/results?search_query=Thoracic+Extension+foam+roller", logType:"reps_bw" },
  { id: "cars_shoulders", name: { fr: "CARs épaules (rotations contrôlées)", en: "Shoulder CARs" }, muscle: "shoulders", machines: ["mat_gym"], objectives: ["mobility","joint_health","posture"], type: "mobility", imgs:["Arm_Circles/0.jpg", "Arm_Circles/1.jpg"], yt:"https://www.youtube.com/results?search_query=Shoulder+CARs+form", logType:"reps_bw" }
];

// Vérifie si TOUTES les machines requises par cet exercice sont disponibles
function _hasAllMachines(exMachines, available){
  if(!exMachines || !exMachines.length) return true;
  return exMachines.every(m => available.indexOf(m) !== -1);
}

// Sélecteur principal : renvoie une liste d'exercices adaptée à l'objectif + machines + session config
// Args: { objId, methodId, machineIds, sessionSets, sessionReps, sessionRest, count?, weekIdx?, sessIdx?, excludeIds? }
// Strategy v8.44 :
// 1. Filtre les exos compatibles (machines + objectif)
// 2. Groupe par muscle
// 3. Rotation déterministe : seed unique par (weekIdx × frequency + sessIdx)
//    → même séance répétée plus tard sélectionne des exos différents au sein de chaque muscle
// 4. Maximum 1 exo par muscle (puis 2 si pas assez)
function pickExercisesForSession({objId, methodId, machineIds, sessionSets, sessionReps, sessionRest, count, weekIdx, sessIdx, excludeIds}){
  if(typeof CUSTOM_EXERCISE_CATALOG === "undefined") return [];
  const obj = (typeof getObjective === "function") ? getObjective(objId) : null;
  const sessionType = obj ? obj.sessionType : "strength";
  const available = machineIds || [];
  const exclude = excludeIds || [];

  // Filtre : objectif compatible + machines disponibles + pas dans la liste à exclure
  let candidates = CUSTOM_EXERCISE_CATALOG.filter(e =>
    (!e.objectives || e.objectives.indexOf(objId) !== -1) &&
    _hasAllMachines(e.machines, available) &&
    exclude.indexOf(e.id) === -1
  );

  // Seed déterministe pour la rotation (week 1 sess 0 → seed=0, week 2 sess 0 → seed=7, etc.)
  const w = (weekIdx == null) ? 1 : weekIdx;
  const s = (sessIdx == null) ? 0 : sessIdx;
  const seed = (w - 1) * 7 + s;

  // Si sessionType = cardio, on garde 1 cardio (avec rotation entre les options disponibles)
  if(sessionType === "cardio"){
    const cardios = candidates.filter(e => e.type === "cardio");
    if(!cardios.length) return [];
    const chosen = cardios[seed % cardios.length];
    return [_buildSessionExercise(chosen, 0, sessionSets, sessionReps, sessionRest)];
  }

  // Si sessionType = core, on priorise type core
  if(sessionType === "core"){
    const cores = candidates.filter(e => e.type === "core");
    if(cores.length >= 3) candidates = cores;
  }

  // Trie par type prio : compound > plyo > isolation > core > mobility > cardio
  const typePriority = { compound: 1, plyo: 2, isolation: 3, core: 4, mobility: 5, cardio: 6 };
  candidates.sort((a, b) => (typePriority[a.type]||9) - (typePriority[b.type]||9));

  // Groupe par muscle pour rotation par-muscle
  const byMuscle = {};
  candidates.forEach(e => {
    if(!byMuscle[e.muscle]) byMuscle[e.muscle] = [];
    byMuscle[e.muscle].push(e);
  });

  // Ordre déterministe des muscles (par 1er type prio puis nom)
  const muscleOrder = Object.keys(byMuscle).sort((a, b) => {
    const aPrio = typePriority[byMuscle[a][0].type] || 9;
    const bPrio = typePriority[byMuscle[b][0].type] || 9;
    if(aPrio !== bPrio) return aPrio - bPrio;
    return a.localeCompare(b);
  });

  // Picking avec rotation : pour chaque muscle, on prend l'exo (seed % pool.length)
  // → garantit que la même séance répétée à différentes semaines pioche des exos différents
  // → ex : Bench (W1) → Incline DB (W2) → DB Bench (W3) → Bench (W4) si 3 exos chest dispo
  const targetCount = count || (sessionType === "hybrid" ? 5 : sessionType === "core" ? 4 : 5);
  const picked = [];

  // Première passe : 1 exo par muscle, rotation
  for(let i = 0; i < muscleOrder.length; i++){
    if(picked.length >= targetCount) break;
    const muscle = muscleOrder[i];
    const pool = byMuscle[muscle];
    // Décalage seed par muscle (pour ne pas que tous changent en même temps)
    const muscleShift = seed + i;
    const chosen = pool[muscleShift % pool.length];
    picked.push(chosen);
  }

  // Deuxième passe : si pas assez, autorise un 2ᵉ exo par muscle (rotation décalée)
  if(picked.length < targetCount){
    for(let i = 0; i < muscleOrder.length; i++){
      if(picked.length >= targetCount) break;
      const muscle = muscleOrder[i];
      const pool = byMuscle[muscle];
      if(pool.length < 2) continue;
      const muscleShift = seed + i + 1;
      const chosen = pool[muscleShift % pool.length];
      if(!picked.find(p => p.id === chosen.id)) picked.push(chosen);
    }
  }

  return picked.map((e, i) => _buildSessionExercise(e, i, sessionSets, sessionReps, sessionRest));
}

// v8.44 — Renvoie des alternatives pour un exo donné (même muscle, compatible avec
// les machines fournies, pas déjà dans la séance). Utilisé par le swap en cours de séance.
// Fallback muscleHint : les programmes intégrés PPL ont des exos (p1, l1, lb1...) absents
// du catalogue ; on utilise alors le muscle fourni par l'appelant pour retrouver des alternatives.
function getAlternativeExercises(exId, availableMachines, objId, currentSessionExIds, limit, muscleHint){
  if(typeof CUSTOM_EXERCISE_CATALOG === "undefined") return [];
  const orig = CUSTOM_EXERCISE_CATALOG.find(e => e.id === exId);
  // Muscle cible : celui de l'exo catalogue s'il existe, sinon l'indice fourni (programmes intégrés PPL)
  const targetMuscle = orig ? orig.muscle : muscleHint;
  if(!targetMuscle) return [];
  const used = currentSessionExIds || [];
  const available = availableMachines || [];
  return CUSTOM_EXERCISE_CATALOG.filter(e =>
    e.muscle === targetMuscle &&
    e.id !== exId &&
    used.indexOf(e.id) === -1 &&
    _hasAllMachines(e.machines, available) &&
    (!objId || !e.objectives || e.objectives.indexOf(objId) !== -1)
  ).slice(0, limit || 6);
}

// v8.44 — Renvoie les machines requises par un exo (pour afficher dans le swap UI)
function getExerciseMachines(exId){
  if(typeof CUSTOM_EXERCISE_CATALOG === "undefined") return [];
  const ex = CUSTOM_EXERCISE_CATALOG.find(e => e.id === exId);
  return ex ? (ex.machines || []) : [];
}

// Construit l'exercice au format attendu par S.sess.exercises
// v8.45 : stocke le nom canonique EN (matchant PROG) pour que getSuggestion et get1RM
// retrouvent les PR de l'historique. L'affichage utilise tr() à la volée (FR/EN).
function _buildSessionExercise(catEx, idx, sets, reps, rest){
  // Nom canonique = .en (sert de clé de matching avec S.hist)
  const canonical = (catEx.name && catEx.name.en) || (catEx.name && catEx.name.fr) || catEx.id;
  // v8.49 : propage imgs + yt + logType (kg/reps vs sec vs min/km vs m/kg)
  return {
    id: catEx.id,
    name: canonical,
    muscle: catEx.muscle,
    sets: sets || 4,
    reps: typeof reps === "number" ? String(reps) : (reps || "8-12"),
    rest: rest || 90,
    type: catEx.type,
    imgs: catEx.imgs || null,
    yt: catEx.yt || null,
    notes: "",
    logType: catEx.logType || "weight"
  };
}
export { esc, calc1RM, getAPREAdjustment, nutCalc, mergeHistory, parseCSVtoHistory, I, MN, MC, PHASES, WODS, WU, PROG, IDEAL_CYCLE, PLAN_LABELS, DAY_SHORTS, CORE_PROGRAM, PROTEINS_DB, MACHINE_CATEGORIES, MACHINES, machinesByCategory, getMachine, ANATOMY, PATHOLOGIES, EXERCISE_RISKS, getExerciseRisks, ACHIEVEMENTS, computeAchievements, getAchievementStats, TRAINING_OBJECTIVES, listObjectives, getCurrentProgramWeek, countCustomSessionsDone, computeCustomWeekPlan, getObjective, generateProgram, CUSTOM_EXERCISE_CATALOG, pickExercisesForSession, getAlternativeExercises, getExerciseMachines };
