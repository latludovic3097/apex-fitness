// FITStark — Constantes et données de programme (immutables, sans logique)
// Sources : free-exercise-db (yuhonas, GitHub, domaine public) · MuscleWiki · USDA FoodData Central · Ciqual ANSES

const I = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const MN = {chest:"Pectoraux",shoulders:"Épaules",triceps:"Triceps",back:"Dos",biceps:"Biceps",quads:"Quadriceps",hamstrings:"Ischio-jambiers",calves:"Mollets",core:"Core"};
const MC = {chest:"#E63946",shoulders:"#457B9D",triceps:"#F4A261",back:"#457B9D",biceps:"#E76F51",quads:"#2A9D8F",hamstrings:"#264653",calves:"#E9C46A",core:"#2A9D8F"};

const PHASES = [
  {id:"force",name:"Force",color:"#E63946",numSets:5,reps:"4-6",rest:180,desc:"Charges lourdes"},
  {id:"hyper",name:"Hypertrophie",color:"#457B9D",numSets:4,reps:"8-12",rest:90,desc:"Volume modéré"},
  {id:"deload",name:"Deload",color:"#2A9D8F",numSets:3,reps:"15-20",rest:60,desc:"Récupération"}
];

// ─── WOD POOLS ───
const WODS = {
push:[
{type:"AMRAP",duration:8,name:"Push Storm",desc:"Pectoraux + épaules + abdo en endurance cardio. 8 min pour bien transpirer.",movements:[
  {name:"10 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+proper+form"},
  {name:"10 DB Thrusters",img:I+"Dumbbell_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-thruster",yt:"https://www.youtube.com/results?search_query=dumbbell+thruster+form"},
  {name:"10 Sit-ups McGill",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-crunch",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up+form"}]},
{type:"For Time",duration:null,name:"21-15-9",desc:"Sprint pectoraux + épaules + cardio via burpees. Pur sprint qui te met sur les genoux.",movements:[
  {name:"21-15-9 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press+form"},
  {name:"21-15-9 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{type:"EMOM",duration:10,name:"Push EMOM",desc:"Volume contrôlé pectoraux + hanches en EMOM. Bon travail technique sous fatigue.",movements:[
  {name:"Pair: 12 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"Impair: 8 Diamond Push-ups",img:I+"Push-Ups_-_Close_Triceps_Position/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-diamond-push-up",yt:"https://www.youtube.com/results?search_query=diamond+push+up+form"}]},
{type:"Tabata",duration:4,name:"Push Tabata",desc:"Pectoraux + triceps en 4 min de pur HIIT. Brûle-graisse express.",movements:[
  {name:"Push-ups 20s on / 10s off ×8",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=tabata+push+ups"}]},
{type:"AMRAP",duration:10,name:"Ground to OH",desc:"Full-body push + jambes via Devil's Press. Travail puissance verticale.",movements:[
  {name:"5 Devil's Press (DB)",img:I+"Dumbbell_Bench_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=devil+press+dumbbell+form"},
  {name:"10 Plate Ground-to-OH",img:I+"Clean_and_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=plate+ground+to+overhead+form"},
  {name:"15 Flutter Kicks",img:I+"Flutter_Kicks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-flutter-kicks",yt:"https://www.youtube.com/results?search_query=flutter+kicks+form"}]},
{type:"AMRAP",duration:12,name:"Press Circuit",desc:"Volume épaules + triceps en circuit. Pump sans charge lombaire.",movements:[
  {name:"8 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press+form"},
  {name:"10 Pike Push-ups",img:I+"Decline_Push-Up/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pike-push-up",yt:"https://www.youtube.com/results?search_query=pike+push+up+shoulders+form"},
  {name:"12 Bench Tricep Dips",img:I+"Dips_-_Triceps_Version/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-bench-dip",yt:"https://www.youtube.com/results?search_query=bench+tricep+dips+form"}]},
{type:"For Time",duration:null,name:"Push Chipper",desc:"Pectoraux + triceps en pyramide descendante. Endurance musculaire pure.",movements:[
  {name:"30 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"20 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press"},
  {name:"10 Diamond Push-ups",img:I+"Push-Ups_-_Close_Triceps_Position/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-diamond-push-up",yt:"https://www.youtube.com/results?search_query=diamond+push+up"},
  {name:"20 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press"},
  {name:"30 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"}]},
{type:"EMOM",duration:10,name:"Shoulder Pump",desc:"Isolation épaules : deltoïdes latéraux + Arnold press. Volume pur.",movements:[
  {name:"Pair: 10 DB Lateral Raises",img:I+"Side_Lateral_Raise/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-lateral-raise",yt:"https://www.youtube.com/results?search_query=lateral+raise+form"},
  {name:"Impair: 8 DB Arnold Press",img:I+"Arnold_Dumbbell_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-arnold-press",yt:"https://www.youtube.com/results?search_query=arnold+press+form"}]}
],
pull:[
{type:"EMOM",duration:10,name:"Pull EMOM",desc:"Dos en volume contrôlé, rows et tirages. Bon pour la posture.",movements:[
  {name:"Pair: 12 Ring/Band Rows",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row+ring+row+form"},
  {name:"Impair: 8 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=one+arm+dumbbell+row+form"}]},
{type:"For Time",duration:null,name:"Pull Chipper",desc:"Dos + cardio en circuit dense. Force-endurance corps entier.",movements:[
  {name:"5 rounds: 5 Pull-ups",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form"},
  {name:"10 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"15 Sit-ups",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-crunch",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up"}]},
{type:"AMRAP",duration:8,name:"Row Storm",desc:"Dos haut + posture par renegade rows et dead bugs. Anti-rotation.",movements:[
  {name:"8 Renegade Rows",img:I+"Dumbbell_Bench_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=renegade+row+form"},
  {name:"12 Band Pull-Aparts",img:I+"Band_Pull_Apart/0.jpg",mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart+form"},
  {name:"16 Dead Bugs",img:I+"Dead_Bug/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-dead-bug",yt:"https://www.youtube.com/results?search_query=dead+bug+exercise"}]},
{type:"Tabata",duration:4,name:"Pull Tabata",desc:"Dos en 4 min HIIT. Inverted rows à haute fréquence.",movements:[
  {name:"Body Rows 20s/10s ×8",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row+form"}]},
{type:"AMRAP",duration:12,name:"Endurance Pull",desc:"Dos + biceps + cardio low-impact (200m run). Volume + cœur.",movements:[
  {name:"6 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=dumbbell+row+form"},
  {name:"8 Hammer Curls légers",img:I+"Hammer_Curls/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl+form"},
  {name:"200m Run",img:"",mw:"",yt:""}]},
{type:"AMRAP",duration:10,name:"Back Attack",desc:"Dos large : pull-ups, rows, band pull-aparts. Travail postural.",movements:[
  {name:"6 Pull-ups (ou Inverted Rows)",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form"},
  {name:"10 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=dumbbell+row+form"},
  {name:"15 Band Pull-Aparts",img:I+"Band_Pull_Apart/0.jpg",mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart"}]},
{type:"For Time",duration:null,name:"Curl Ladder",desc:"Biceps + dos via pyramide hammer curls et inverted rows.",movements:[
  {name:"21-15-9 Hammer Curls",img:I+"Hammer_Curls/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl+form"},
  {name:"21-15-9 Inverted Rows",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row+form"}]},
{type:"EMOM",duration:8,name:"Pull Power",desc:"Dos + scapula en EMOM. Inverted rows + face pulls. Anti-protraction épaules.",movements:[
  {name:"Pair: 8 Inverted Rows",img:I+"Inverted_Row/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-inverted-row",yt:"https://www.youtube.com/results?search_query=inverted+row"},
  {name:"Impair: 10 Face Pulls + 5 Scap. Pull-ups",img:I+"Face_Pull/0.jpg",mw:"https://musclewiki.com/exercise/cable-face-pull",yt:"https://www.youtube.com/results?search_query=face+pull+form"}]}
],
legs:[
{type:"Chipper",duration:null,name:"Leg Chipper",desc:"Jambes + cardio plein gaz. Burpees, swings, squats en pyramide.",movements:[
  {name:"20 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"},
  {name:"30 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"40 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"30 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"20 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{type:"For Time",duration:null,name:"Leg Builder",desc:"Volume cuisses + fessiers + ischios. Hypertrophie sans charge lombaire.",movements:[
  {name:"5×12 Goblet Squats",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form"},
  {name:"5×12 KB Deadlifts",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+deadlift+form"},
  {name:"5×12 Box Step-ups",img:I+"Barbell_Step_Ups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-step-up",yt:"https://www.youtube.com/results?search_query=box+step+up+form"}]},
{type:"EMOM",duration:12,name:"Legs EMOM",desc:"Cuisses + fessiers en EMOM. Unilatéral et bilatéral mixés.",movements:[
  {name:"Min 1: 10 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"Min 2: 8 Lunges",img:I+"Bodyweight_Walking_Lunge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-lunge",yt:"https://www.youtube.com/results?search_query=walking+lunge+form"},
  {name:"Min 3: 6 Glute Bridges lestés",img:I+"Butt_Lift_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",yt:"https://www.youtube.com/results?search_query=weighted+glute+bridge+form"}]},
{type:"AMRAP",duration:10,name:"Quad Blaster",desc:"Quadriceps en feu. Wall balls + lunges + broad jumps explosifs.",movements:[
  {name:"15 Wall Balls",img:I+"Goblet_Squat/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=wall+ball+crossfit+form"},
  {name:"10 Step-back Lunges",img:I+"Bodyweight_Walking_Lunge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-lunge",yt:"https://www.youtube.com/results?search_query=reverse+lunge+form"},
  {name:"5 Broad Jumps",img:I+"Frog_Hops/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=broad+jump+form+technique"}]},
{type:"Tabata",duration:4,name:"Squat Tabata",desc:"Cuisses + fessiers en 4 min HIIT alternés. Pur métabolique.",movements:[
  {name:"Goblet Squat / Glute Bridge alternés",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+glute+bridge+tabata"}]},
{type:"For Time",duration:null,name:"Leg Pyramid",desc:"Volume jambes en pyramide montée puis descente. Endurance musculaire.",movements:[
  {name:"10→20→30→20→10 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"5→10→15→10→5 Goblet Squats",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form"}]},
{type:"EMOM",duration:10,name:"Hip Hinge Focus",desc:"Ischios + fessiers via KB DL (dos neutre) et glute bridges. Posture.",movements:[
  {name:"Pair: 10 KB Deadlifts (dos neutre ⚡)",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+deadlift+form"},
  {name:"Impair: 12 Glute Bridges lestés",img:I+"Butt_Lift_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",yt:"https://www.youtube.com/results?search_query=glute+bridge+weighted"}]},
{type:"AMRAP",duration:8,name:"Step & Swing",desc:"Jambes + abdo + cardio via step-ups, swings, flutter kicks. 8 min punch.",movements:[
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
{cat:"Full-body",type:"AMRAP",duration:8,name:"Burpee Storm",desc:"Brûle un max de calories en 8 min : cœur, jambes, épaules. Step-back uniquement, zéro charge sur la colonne.",movements:[
  {name:"AMRAP : Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{cat:"Full-body",type:"For Time",duration:null,name:"DT Modifié",desc:"Le classique CrossFit DT en version dos sécurisée. Force-endurance corps entier en 12-18 min.",movements:[
  {name:"5 rounds : 12 KB Romanian DL (dos neutre ⚡)",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+romanian+deadlift+form"},
  {name:"9 DB Push Press",img:I+"Dumbbell_Shoulder_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-push-press",yt:"https://www.youtube.com/results?search_query=dumbbell+push+press+form"},
  {name:"6 DB Front Squats",img:I+"Dumbbell_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=dumbbell+front+squat+form"}]},
{cat:"Full-body",type:"AMRAP",duration:20,name:"Cindy Modifiée",desc:"Référence mondiale CrossFit. Endurance musculaire pure, accessible à tous niveaux.",movements:[
  {name:"5 Pull-ups (ou Inverted Rows)",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+or+inverted+row"},
  {name:"10 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"15 Air Squats",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"}]},
{cat:"Full-body",type:"AMRAP",duration:12,name:"Devil's Conditioning",desc:"Cardio + force totale en 12 min. Travaille épaules, hanches, abdo en gainage.",movements:[
  {name:"5 DB Devil's Press",img:I+"Dumbbell_Bench_Press/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=devils+press+dumbbell+form"},
  {name:"10 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"15 Mountain Climbers",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-mountain-climber",yt:"https://www.youtube.com/results?search_query=mountain+climbers+form"}]},
{cat:"Full-body",type:"For Time",duration:null,name:"21-15-9 Hero Pump",desc:"Sprint cardio-musculaire intense. Te met sur les genoux en 10-15 min, full-body brûle-graisse.",movements:[
  {name:"21-15-9 DB Thrusters",img:I+"Dumbbell_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-thruster",yt:"https://www.youtube.com/results?search_query=dumbbell+thruster+form"},
  {name:"21-15-9 Step-back Burpees",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-burpee",yt:"https://www.youtube.com/results?search_query=step+back+burpee+form"}]},
{cat:"Full-body",type:"Tabata",duration:8,name:"Ladder Tabata",desc:"Brûle-graisse rapide. 8 min = équivalent métabolique de 30-40 min de cardio classique.",movements:[
  {name:"R1-2 : Jumping Jacks 20s/10s",img:I+"Jumping_Jacks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-jumping-jack",yt:"https://www.youtube.com/results?search_query=jumping+jacks"},
  {name:"R3-4 : Air Squats 20s/10s",img:I+"Bodyweight_Squat/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-squat",yt:"https://www.youtube.com/results?search_query=air+squat+form"},
  {name:"R5-6 : Push-ups 20s/10s",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"R7-8 : Mountain Climbers 20s/10s",img:I+"Mountain_Climbers/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-mountain-climber",yt:"https://www.youtube.com/results?search_query=mountain+climbers+form"}]},
// ─── HAUT DU CORPS (4) ───
{cat:"Haut du corps",type:"EMOM",duration:10,name:"Push-Pull Pump",desc:"Pectoraux + dos en alternance. Volume max sur le haut du corps sans fatiguer les jambes.",movements:[
  {name:"Pair : 10 Push-ups",img:I+"Pushups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-push-up",yt:"https://www.youtube.com/results?search_query=push+up+form"},
  {name:"Impair : 8 DB Rows/bras",img:I+"One-Arm_Dumbbell_Row/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-row",yt:"https://www.youtube.com/results?search_query=one+arm+dumbbell+row+form"}]},
{cat:"Haut du corps",type:"AMRAP",duration:8,name:"Shoulder Burner",desc:"Sculpte les épaules sous trois angles en 8 min. Aucun mouvement debout, dos protégé.",movements:[
  {name:"10 DB Lateral Raises",img:I+"Side_Lateral_Raise/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-lateral-raise",yt:"https://www.youtube.com/results?search_query=lateral+raise+form"},
  {name:"8 Arnold Press",img:I+"Arnold_Dumbbell_Press/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-arnold-press",yt:"https://www.youtube.com/results?search_query=arnold+press+form"},
  {name:"6 Pike Push-ups",img:I+"Decline_Push-Up/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pike-push-up",yt:"https://www.youtube.com/results?search_query=pike+push+up+shoulders+form"}]},
{cat:"Haut du corps",type:"For Time",duration:null,name:"Pull Volume",desc:"Dos large + posture. Volume de tirage : 50 pull-ups + 100 pull-aparts. Évite le doublon avec le Pull Power EMOM.",movements:[
  {name:"50 Pull-ups (band-assist OK)",img:I+"Pullups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-pull-up",yt:"https://www.youtube.com/results?search_query=pull+up+form+band+assist"},
  {name:"100 Band Pull-Aparts",img:I+"Band_Pull_Apart/0.jpg",mw:"https://musclewiki.com/exercise/band-pull-apart",yt:"https://www.youtube.com/results?search_query=band+pull+apart+form"}]},
{cat:"Haut du corps",type:"EMOM",duration:12,name:"Arm Day Express",desc:"Biceps + triceps en superset. 12 min pour des bras bien gonflés, sans charge lombaire.",movements:[
  {name:"Pair : 8 Hammer Curls",img:I+"Hammer_Curls/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-hammer-curl",yt:"https://www.youtube.com/results?search_query=hammer+curl+form"},
  {name:"Impair : 10 Bench Tricep Dips",img:I+"Dips_-_Triceps_Version/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-bench-dip",yt:"https://www.youtube.com/results?search_query=bench+tricep+dips+form"}]},
// ─── BAS DU CORPS (4) ───
{cat:"Bas du corps",type:"AMRAP",duration:10,name:"Leg Volume",desc:"Cuisses + fessiers + ischios. Tout le bas du corps sans aucune flexion lombaire chargée.",movements:[
  {name:"10 Goblet Squats",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+form"},
  {name:"8 KB Romanian DL (dos neutre ⚡)",img:I+"Stiff-Legged_Barbell_Deadlift/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-deadlift",yt:"https://www.youtube.com/results?search_query=kettlebell+romanian+deadlift+form"},
  {name:"6 Reverse Lunges/jambe",img:I+"Dumbbell_Lunges/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-reverse-lunge",yt:"https://www.youtube.com/results?search_query=reverse+lunge+form"}]},
{cat:"Bas du corps",type:"EMOM",duration:12,name:"Glute Builder",desc:"Fessiers explosifs. Améliore aussi la posture et protège le bas du dos.",movements:[
  {name:"Pair : 12 KB Swings",img:I+"Kettlebell_Sumo_High_Pull/0.jpg",mw:"https://musclewiki.com/exercise/kettlebell-swing",yt:"https://www.youtube.com/results?search_query=kettlebell+swing+form"},
  {name:"Impair : 10 Glute Bridges chargés",img:I+"Butt_Lift_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-glute-bridge",yt:"https://www.youtube.com/results?search_query=glute+bridge+weighted+form"}]},
{cat:"Bas du corps",type:"Tabata",duration:4,name:"Quad Pump",desc:"Cuisses en feu. 4 min de pur travail des quadriceps en haute intensité.",movements:[
  {name:"Goblet Squat 20s on / 10s off ×8",img:I+"Goblet_Squat/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-goblet-squat",yt:"https://www.youtube.com/results?search_query=goblet+squat+tabata"}]},
{cat:"Bas du corps",type:"For Time",duration:null,name:"Walking Power",desc:"Force des jambes + gainage debout. Travaille aussi les avant-bras (grip) et la posture.",movements:[
  {name:"10 rounds : 20m Farmer's Walk (lourd)",img:I+"Dumbbell_Shrug/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-farmers-walk",yt:"https://www.youtube.com/results?search_query=farmers+walk+form"},
  {name:"10 Step-ups/jambe",img:I+"Barbell_Step_Ups/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-step-up",yt:"https://www.youtube.com/results?search_query=step+up+exercise+form"}]},
// ─── CORE STABILITÉ L5-S1 (3) ───
{cat:"Core stabilité",type:"AMRAP",duration:10,name:"McGill Big 3 Plus",desc:"Renforce le dos sans flexion. Protocole McGill validé scientifiquement pour les hernies lombaires.",movements:[
  {name:"5 McGill Curl-ups (hold 10s)",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-crunch",yt:"https://www.youtube.com/results?search_query=mcgill+curl+up+form"},
  {name:"5 Side Plank/côté (10s)",img:I+"Side_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",yt:"https://www.youtube.com/results?search_query=side+plank+mcgill"},
  {name:"5 Bird Dogs/côté (hold 5s)",img:I+"Donkey_Kicks/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-bird-dog",yt:"https://www.youtube.com/results?search_query=bird+dog+exercise+form"},
  {name:"30s Pallof Press (chaque côté)",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/cable-pallof-press",yt:"https://www.youtube.com/results?search_query=pallof+press+form"}]},
{cat:"Core stabilité",type:"EMOM",duration:8,name:"Anti-Rotation",desc:"Stabilité du tronc latérale et anti-rotation. Idéal hernie lombaire et posture quotidienne.",movements:[
  {name:"Pair : 10 Pallof Press/côté",img:I+"Cable_Crunch/0.jpg",mw:"https://musclewiki.com/exercise/cable-pallof-press",yt:"https://www.youtube.com/results?search_query=pallof+press+form"},
  {name:"Impair : 30s Suitcase Carry",img:I+"Dumbbell_Shrug/0.jpg",mw:"https://musclewiki.com/exercise/dumbbell-suitcase-carry",yt:"https://www.youtube.com/results?search_query=suitcase+carry+form"}]},
{cat:"Core stabilité",type:"Tabata",duration:4,name:"Plank Fortress",desc:"Gainage pur. Renforce le caisson abdominal sans charger la colonne ni faire de flexion.",movements:[
  {name:"R1-3 : Front Plank 20s/10s",img:I+"Plank/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-plank",yt:"https://www.youtube.com/results?search_query=front+plank+form"},
  {name:"R4-6 : Side Plank 20s/10s (alterne)",img:I+"Side_Bridge/0.jpg",mw:"https://musclewiki.com/exercise/bodyweight-side-plank",yt:"https://www.youtube.com/results?search_query=side+plank+form"},
  {name:"R7-8 : Reverse Plank 20s/10s",img:I+"Butt_Lift_Bridge/0.jpg",mw:"",yt:"https://www.youtube.com/results?search_query=reverse+plank+form"}]},
// ─── CARDIO (3) ───
{cat:"Cardio",type:"EMOM",duration:10,name:"HIIT Runner",desc:"10 min HIIT cardio pur. Plus efficace que 45 min de jogging stable pour brûler du gras.",movements:[
  {name:"Chaque min : 30s sprint + 30s marche",img:"",mw:"",yt:"https://www.youtube.com/results?search_query=HIIT+running+30s+sprint"}]},
{cat:"Cardio",type:"For Time",duration:null,name:"Row Sprint 5×500m",desc:"Cardio puissance sans impact articulaire. Améliore la VO2max, idéal protection du dos.",movements:[
  {name:"5×500m Rameur (ou vélo équivalent)",img:"",mw:"",yt:"https://www.youtube.com/results?search_query=rowing+500m+sprint+form"},
  {name:"90s repos entre chaque",img:"",mw:"",yt:""}]},
{cat:"Cardio",type:"AMRAP",duration:10,name:"Jump Rope Ladder",desc:"Cardio + coordination + jambes. 10 min pour brûler 150-200 kcal, low-impact contrôlé.",movements:[
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
   {id:"gu3",name:"Step-ups",sets:3,reps:"12/côté",rest:75,muscle:"quads",imgs:["Barbell_Step_Ups/0.jpg","Barbell_Step_Ups/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-step-up",yt:"https://www.youtube.com/results?search_query=dumbbell+step+up+form",notes:"<b>Pied entier sur le banc</b>. Pousse sur le talon.",coaching:["Contrôle la descente"],l5safe:true}
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
   {id:"gf1",name:"Farmer's Walk",sets:3,reps:"30m",rest:60,muscle:"core",imgs:["Farmers_Walk/0.jpg","Farmers_Walk/1.jpg"],mw:"https://musclewiki.com/exercise/dumbbell-farmers-walk",yt:"https://www.youtube.com/results?search_query=farmer+walk",notes:"<b>Gainage total</b>.",coaching:["Épaules basses"],l5safe:true},
   {id:"gf2",name:"Plank",sets:3,reps:"45-60s",rest:60,muscle:"core",imgs:["Plank/0.jpg","Plank/1.jpg"],mw:"https://musclewiki.com/exercise/plank",yt:"https://www.youtube.com/results?search_query=plank+form",notes:"<b>Corps aligné</b>. Pas de cambre.",coaching:["Hanches ni haut ni bas","Respire"],l5safe:true},
   {id:"gf3",name:"Ab Wheel",sets:3,reps:"8-12",rest:75,muscle:"core",imgs:["Ab_Roller/0.jpg","Ab_Roller/1.jpg"],mw:"https://musclewiki.com/exercise/ab-roller",yt:"https://www.youtube.com/results?search_query=ab+wheel+rollout+form",notes:"<b>Rollout lent</b>. Ne pas cambrer.",coaching:["Expire en rentrant","Stop avant le sol"],l5safe:true,l5warn:"Rollout partiel uniquement si L5-S1 — stop si douleur."}
  ]}
 ]
}
]};

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
