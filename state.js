// APEX Fitness — Gestion de l'état + business logic stateful
// Dépend de : core.js (calc1RM, getAPREAdjustment), data.js (PHASES, WODS, PROG)

// ─── STATE GLOBAL ───
const SK = "apex-fit-v8";
let S = {
  view: "home",
  hist: [],
  sess: null,
  ei: -1,
  log: {},
  notes: "",
  t0: null,
  phase: 0,
  cardio: {mode:"run",duration:30,incline:1,speed:10,distance:1000,resistance:5,notes:""},
  core: {startDate:null,coreLog:{},coreNotes:"",coreT0:null,ei:0},
  nut: {weight:75,height:178,age:30,sex:"M",activity:1.55,goal:-400,proteinPerKg:2,fatPerKg:0.8,weightLog:[]}
};

function loadS(){
  try{
    const d=JSON.parse(localStorage.getItem(SK));
    if(d){
      S.hist=d.history||[];
      S.phase=d.phase||0;
      if(d.cardio)S.cardio={...S.cardio,...d.cardio};
      if(d.core)S.core={...S.core,...d.core};
      if(d.nut)S.nut={...S.nut,...d.nut};
    }
    const a=localStorage.getItem(SK+"_a");
    if(a){
      const x=JSON.parse(a);
      if(x.sid){
        S.sess=buildSession(x.sid,x.exercises||null);
        S.ei=x.ei;S.log=x.log||{};S.notes=x.notes||"";S.t0=x.t0;
        if(S.sess)S.view="session";
      }
    }
  }catch{}
}
function saveS(){
  try{localStorage.setItem(SK,JSON.stringify({history:S.hist,phase:S.phase,cardio:S.cardio,core:S.core,nut:S.nut}));}catch{}
  scheduleCloudSync();
}
function saveA(){try{if(S.sess)localStorage.setItem(SK+"_a",JSON.stringify({sid:S.sess.id,ei:S.ei,log:S.log,notes:S.notes,t0:S.t0,exercises:S.sess.exercises}));else localStorage.removeItem(SK+"_a");}catch{}}

// ─── CLOUD SYNC (Firebase, optionnel) ───
// Push debouncé 2s après chaque saveS() si l'utilisateur est connecté.
// Si window.apexSync n'existe pas (mode local-only), no-op.
let _syncTimer = null;
let _syncStatus = "idle"; // "idle" | "syncing" | "synced" | "error" | "offline"
function scheduleCloudSync(){
  if(!window.apexSync || !window.apexSync.getUser || !window.apexSync.getUser()) return;
  clearTimeout(_syncTimer);
  _syncStatus = "syncing";
  _syncTimer = setTimeout(async () => {
    try{
      await window.apexSync.push({
        history: S.hist,
        phase: S.phase,
        cardio: S.cardio,
        core: S.core,
        nut: S.nut
      });
      _syncStatus = "synced";
    }catch(e){
      console.warn("[apex-sync] push failed:", e);
      _syncStatus = "error";
    }
    // Repaint la carte sync si on est sur Réglages
    if(S.view === "settings" && typeof R === "function") R();
  }, 2000);
}

// Pull au sign-in : merge cloud → local, puis push merged → cloud
async function pullAndMergeFromCloud(){
  if(!window.apexSync || !window.apexSync.getUser || !window.apexSync.getUser()) return;
  try{
    _syncStatus = "syncing";
    const cloud = await window.apexSync.pull();
    if(cloud){
      // Merge histories avec dédup (plus sûr que last-write-wins pour un array)
      const merged = mergeHistory(cloud.history || [], S.hist);
      S.hist = merged.merged;
      // Pour les scalaires : on prend la valeur cloud si présente (last sync wins)
      if(cloud.phase !== undefined) S.phase = cloud.phase;
      if(cloud.cardio) S.cardio = {...S.cardio, ...cloud.cardio};
      if(cloud.core) S.core = {...S.core, ...cloud.core};
      if(cloud.nut) S.nut = {...S.nut, ...cloud.nut};
    }
    saveS(); // déclenche un push remerge (cloud reçoit la fusion)
    _syncStatus = "synced";
    if(typeof R === "function") R();
  }catch(e){
    console.warn("[apex-sync] pull failed:", e);
    _syncStatus = "error";
    if(typeof R === "function") R();
  }
}
function getSyncStatus(){return _syncStatus;}

// ─── STREAK / TIME-SINCE-LAST-SESSION ───
// Renvoie le nombre de jours depuis la dernière séance (toutes catégories confondues),
// ou null si aucune séance n'a jamais été faite.
function getDaysSinceLastSession(){
  if(!S.hist || !S.hist.length) return null;
  const lastDate = new Date(S.hist[0].date).getTime();
  return Math.floor((Date.now() - lastDate) / 864e5);
}

// Streak en jours = série continue où chaque jour a au moins une séance OU est dans une fenêtre de repos acceptable.
// Pour notre cas (3 sessions/sem en moyenne), on définit un streak comme "pas plus de 4 jours sans séance".
// Renvoie {weeks, sessions7, status, color, message} pour un affichage rapide.
function getStreakInfo(){
  const days = getDaysSinceLastSession();
  if(days === null) return { days: null, sessions7: 0, status: "new", color: "var(--mt)", message: "Bienvenue ! Lance ta première séance 💪" };
  const sessions7 = S.hist.filter(h => (Date.now() - new Date(h.date).getTime()) < 7*864e5).length;
  if(days === 0) return { days, sessions7, status: "active", color: "var(--ok)", message: `🔥 ${sessions7} séance${sessions7>1?"s":""} cette semaine — continue !` };
  if(days <= 2) return { days, sessions7, status: "ok", color: "var(--ok)", message: `Dernière séance il y a ${days===1?"hier":days+" jours"} — bon rythme` };
  if(days <= 4) return { days, sessions7, status: "warn", color: "var(--wa)", message: `⚠️ ${days} jours sans séance — pense à bouger` };
  if(days <= 7) return { days, sessions7, status: "alert", color: "var(--ac)", message: `🚨 ${days} jours sans séance — relance le rythme !` };
  return { days, sessions7, status: "lost", color: "var(--ac)", message: `${days} jours sans séance — repars en douceur` };
}

// ─── NOTIFICATIONS ───
// Web Notifications API (in-app + Service Worker).
// Le scheduling "background" pur n'est pas possible sur web sans push server,
// mais on déclenche un rappel à l'ouverture de l'app si le streak est interrompu.
const NOTIF_OPT_KEY = "apex_notif_enabled";
const NOTIF_LAST_KEY = "apex_notif_last_shown";

function isNotifEnabled(){return localStorage.getItem(NOTIF_OPT_KEY) === "1";}
function setNotifEnabled(v){localStorage.setItem(NOTIF_OPT_KEY, v ? "1" : "0");}
function notifPermissionState(){
  if(!("Notification" in window)) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}
async function requestNotifPermission(){
  if(!("Notification" in window)) return "unsupported";
  if(Notification.permission === "granted") return "granted";
  if(Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}
function showLocalNotif(title, body){
  try{
    if(!("Notification" in window)) return false;
    if(Notification.permission !== "granted") return false;
    const n = new Notification(title, {
      body: body,
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "apex-reminder", // remplace toute notif précédente du même tag
      requireInteraction: false
    });
    n.onclick = () => { window.focus(); n.close(); };
    return true;
  }catch(e){console.warn("[apex-notif]", e); return false;}
}

// Vérifie si on doit envoyer un rappel et le fait. Throttle 24h via localStorage.
// ─── BODY MAP : stats par muscle ───
// Parcourt l'historique pour chaque muscle key (chest, shoulders, etc.)
// Renvoie : volume30j, sessions30j, dernierEntrainement, max1RM, daysAgo (depuis dernière fois)
function getMuscleStats(muscleKey){
  const now = Date.now();
  let volume30 = 0, sessions30 = 0, lastDate = null, max1RM = 0;
  const seen30 = new Set();
  S.hist.forEach(h => {
    const hDate = new Date(h.date).getTime();
    const ageDays = (now - hDate) / 864e5;
    let hitMuscle = false;
    h.exercises.forEach(ex => {
      if(ex.muscle !== muscleKey) return;
      hitMuscle = true;
      Object.values(ex.logged || {}).forEach(s => {
        const w = s.weight || 0, r = s.reps || 0;
        if(ageDays <= 30) volume30 += w * r;
        if(w && r){
          const rm = calc1RM(w, r);
          if(rm > max1RM) max1RM = rm;
        }
      });
    });
    if(hitMuscle){
      if(!lastDate || hDate > new Date(lastDate).getTime()) lastDate = h.date;
      if(ageDays <= 30) seen30.add(h.id || h.date);
    }
  });
  sessions30 = seen30.size;
  const daysAgo = lastDate ? Math.floor((now - new Date(lastDate).getTime()) / 864e5) : null;
  return { volume30, sessions30, lastDate, daysAgo, max1RM };
}

// Couleur heat-map en fonction du nb de jours depuis dernière sollicitation du muscle
function muscleHeatColor(daysAgo){
  if(daysAgo === null) return "#c7c7cc";        // jamais sollicité (gris clair, light theme)
  if(daysAgo <= 2) return "#2A9D8F";            // frais (vert vif)
  if(daysAgo <= 5) return "#5DB8A8";            // récent (vert moyen, plus visible sur fond clair)
  if(daysAgo <= 10) return "#F4A261";           // à surveiller (orange)
  if(daysAgo <= 20) return "#E76F51";           // négligé (rouge pâle)
  return "#C0392B";                              // oublié (rouge foncé)
}

function checkAndShowReminder(){
  if(!isNotifEnabled()) return;
  if(notifPermissionState() !== "granted") return;
  const last = parseInt(localStorage.getItem(NOTIF_LAST_KEY) || "0");
  if(Date.now() - last < 24*36e5) return; // pas plus d'1 notif par 24h
  const info = getStreakInfo();
  if(!info || info.status === "active" || info.status === "ok" || info.status === "new") return;
  const ok = showLocalNotif("APEX Fitness 💪", info.message.replace(/^[⚠️🚨🔥]\s*/, ""));
  if(ok) localStorage.setItem(NOTIF_LAST_KEY, String(Date.now()));
}

// ─── AUDIO (iOS Safari : init au premier gesture, resume avant chaque bip) ───
let audioCtx;
function initAudio(){if(audioCtx)return;try{audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();}catch{}}
document.addEventListener("touchstart",initAudio,{once:true,passive:true});
document.addEventListener("click",initAudio,{once:true});
// "Wiki" link via recherche Google — résiste aux 404 de slug MuscleWiki
function wk(n){return"https://www.google.com/search?q="+encodeURIComponent("musclewiki "+(n||"").replace(/^\d+[-\s]?(\d+[-\s]?)*/,"").replace(/\(.*?\)/g,"").trim());}
function beep(){try{initAudio();if(!audioCtx)return;if(audioCtx.state==="suspended")audioCtx.resume();[0,.2,.4].forEach(d=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=880;g.gain.value=.3;o.start(audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d+.15);});}catch{}}

// ─── TIMER (Date.now() based, anti-throttle navigateur) ───
let T = {on:false,at:0,total:0,dir:"down",rem:0,done:false}, tRAF;
function tGet(){if(!T.on)return T.rem;const e=Math.floor((Date.now()-T.at)/1000);return T.dir==="down"?Math.max(0,T.rem-e):Math.min(T.total,e+T.rem);}
function tTick(){const r=tGet(),p=T.dir==="down"?(T.total-r)/T.total:r/T.total;const d=document.getElementById("tdisp"),rng=document.getElementById("tring"),bx=document.getElementById("timerbox");if(d)d.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`;if(rng){rng.style.strokeDashoffset=2*Math.PI*22*(1-p);rng.style.transition="stroke-dashoffset .3s";}if((T.dir==="down"&&r<=0)||(T.dir!=="down"&&r>=T.total)){T.on=false;T.done=true;if(rng)rng.setAttribute("stroke","var(--ok)");if(bx)bx.classList.add("done");const b=document.getElementById("tbtn");if(b){b.textContent="✓";b.className="tbtn tbtn-go";}beep();cancelAnimationFrame(tRAF);return;}tRAF=requestAnimationFrame(tTick);}
function tToggle(tot,dir){dir=dir||"down";if(T.done||T.total!==tot||T.dir!==dir){cancelAnimationFrame(tRAF);T={on:false,at:0,total:tot,dir:dir,rem:dir==="up"?0:tot,done:false};const bx=document.getElementById("timerbox");if(bx)bx.classList.remove("done");}S._timerExIdx=S.ei;T.dir=dir;T.total=tot;if(T.on){T.on=false;T.rem=tGet();cancelAnimationFrame(tRAF);const b=document.getElementById("tbtn");if(b){b.textContent="Start";b.className="tbtn tbtn-go";}}else{if(!T.at&&T.rem===0)T.rem=T.dir==="down"?tot:0;T.at=Date.now();T.on=true;const b=document.getElementById("tbtn");if(b){b.textContent="Pause";b.className="tbtn tbtn-pause";}tTick();}}
function tReset(tot,dir){cancelAnimationFrame(tRAF);T={on:false,at:0,total:tot,dir:dir||"down",rem:dir==="up"?0:tot,done:false};const d=document.getElementById("tdisp"),rng=document.getElementById("tring"),bx=document.getElementById("timerbox"),b=document.getElementById("tbtn");if(d)d.textContent=`${Math.floor(T.rem/60)}:${String(T.rem%60).padStart(2,"0")}`;if(rng){rng.style.strokeDashoffset=2*Math.PI*22;}if(bx)bx.classList.remove("done");if(b){b.textContent="Start";b.className="tbtn tbtn-go";}}
function tStop(){cancelAnimationFrame(tRAF);T={on:false,at:0,total:0,dir:"down",rem:0,done:false};}

// ─── BUSINESS LOGIC (utilise S + données) ───

// Suggestion APRE basée sur la dernière séance + RIR
function getSuggestion(exName){
  const entries = S.hist.filter(h => h.exercises.some(e => e.name === exName)).slice(0, 3);
  if(!entries.length) return null;
  const lastEx = entries[0].exercises.find(e => e.name === exName);
  const sets = Object.values(lastEx.logged || {});
  if(!sets.length) return null;
  const maxWeight = Math.max(...sets.map(s => s.weight || 0));
  const repsAtMax = sets.filter(s => s.weight === maxWeight).map(s => s.reps || 0);
  const bestReps = Math.max(...repsAtMax);
  const ph = PHASES[S.phase];
  const targetRM = parseInt(ph.reps.split("-")[1]) || 8;
  const adj = getAPREAdjustment(bestReps, targetRM);
  const sugWeight = Math.round((maxWeight + adj.nextAdj) / 2.5) * 2.5;
  const lastRIR = lastEx.rir;
  let rirNote = "";
  if(lastRIR !== undefined && lastRIR !== null){
    if(lastRIR <= 1) rirNote = " | RIR≤1: proche du max";
    else if(lastRIR >= 3) rirNote = " | RIR≥3: marge dispo";
  }
  const icons = {"trop lourd":"🔴","lourd":"🟠","optimal":"🟢","progression":"🔵","trop léger":"⚪"};
  return {
    weight: sugWeight,
    reason: `${icons[adj.status]} APRE: ${maxWeight}kg × ${bestReps}r → ${adj.status} → ${sugWeight}kg${rirNote}`,
    status: adj.status
  };
}

// Best 1RM observé pour un exercice (parcourt tout l'historique)
function get1RM(exName){
  let best=0;
  S.hist.forEach(h=>{h.exercises.filter(e=>e.name===exName).forEach(ex=>{Object.values(ex.logged||{}).forEach(s=>{if(s.weight&&s.reps){const rm=calc1RM(s.weight,s.reps);if(rm>best)best=rm;}});});});
  return best;
}

// Score de fatigue : volume 7 derniers jours / moyenne hebdo
function getFatigue(){
  if(S.hist.length<4)return{score:50,label:"Données insuffisantes",color:"var(--mt)"};
  const now=Date.now();
  let vol7=0;
  const weekMap={};
  S.hist.forEach(h=>{
    const d=new Date(h.date),diff=now-d.getTime();
    let v=0;h.exercises.forEach(x=>Object.values(x.logged||{}).forEach(s=>{v+=(s.weight||0)*(s.reps||0);}));
    if(diff<6048e5)vol7+=v;
    const wk=Math.floor(diff/6048e5);if(!weekMap[wk])weekMap[wk]=0;weekMap[wk]+=v;
  });
  const wkVals=Object.values(weekMap);
  const avg=wkVals.length?wkVals.reduce((a,b)=>a+b,0)/wkVals.length:1;
  const ratio=avg>0?vol7/avg:1;
  const score=Math.min(100,Math.round(ratio*50));
  if(score>75)return{score,label:"⚠️ Surcharge — envisage un deload",color:"var(--ac)"};
  if(score>55)return{score,label:"Bon rythme — continue !",color:"var(--ok)"};
  return{score,label:"Volume faible — tu peux pousser",color:"#457B9D"};
}

// Recommande la session la moins récemment faite (rest day intelligence)
function getRecommendation(){
  const sessIds=["push","pull","legs"];
  const last={};
  sessIds.forEach(id=>{const h=S.hist.find(x=>x.sessionId===id);last[id]=h?new Date(h.date).getTime():0;});
  const sorted=[...sessIds].sort((a,b)=>last[a]-last[b]);
  const rec=sorted[0];
  const daysSince=last[rec]?Math.floor((Date.now()-last[rec])/864e5):99;
  return{id:rec,days:daysSince};
}

// Sélectionne le WOD le moins récemment utilisé pour cette session (LRU)
function pickWOD(sessId){
  const pool=WODS[sessId];if(!pool||!pool.length)return pool?pool[0]:null;
  const used={};
  S.hist.filter(h=>h.sessionId===sessId).forEach(h=>{if(h.wodName&&!used[h.wodName])used[h.wodName]=h.date;});
  const sorted=[...pool].sort((a,b)=>{
    const da=used[a.name]?new Date(used[a.name]).getTime():0;
    const db=used[b.name]?new Date(used[b.name]).getTime():0;
    return da-db;
  });
  return sorted[0];
}

// LRU sur les pools d'accessoires (rotation 2-4 sessions, Helms/RTS)
function pickPoolExercise(pool){
  if(!pool||!pool.length)return pool?.[0]||null;
  const used={};
  S.hist.forEach(h=>{h.exercises.forEach(ex=>{if(pool.some(p=>p.name===ex.name)&&!used[ex.name])used[ex.name]=h.date;});});
  return [...pool].sort((a,b)=>{
    const da=used[a.name]?new Date(used[a.name]).getTime():0;
    const db=used[b.name]?new Date(used[b.name]).getTime():0;
    return da-db;
  })[0];
}

// Construit une session (compounds fixes + 1 accessoire LRU par pool)
function buildSession(sessId,savedExercises){
  const base=PROG.sessions.find(s=>s.id===sessId);if(!base)return null;
  const sess=Object.assign({},base);
  if(savedExercises&&savedExercises.length){
    const allEx=[...base.compounds,...base.pools.flatMap(p=>p.exercises)];
    const restored=savedExercises.map(sv=>allEx.find(e=>e.id===sv.id)||sv).filter(Boolean);
    sess.exercises=restored.length?restored:[...base.compounds,...base.pools.map(p=>pickPoolExercise(p.exercises))].filter(Boolean);
  }else{
    sess.exercises=[...base.compounds,...base.pools.map(p=>pickPoolExercise(p.exercises))].filter(Boolean);
  }
  return sess;
}

// Core program : helpers de semaine en cours / sessions cette semaine
function coreCurrentWeek(){if(!S.core.startDate)return 1;const days=Math.floor((Date.now()-new Date(S.core.startDate).getTime())/864e5);return Math.min(12,Math.max(1,Math.floor(days/7)+1));}
function coreSessionsThisWeek(){const wk=coreCurrentWeek(),now=Date.now();return S.hist.filter(h=>h.sessionId==="core"&&h.coreWeek===wk&&(now-new Date(h.date).getTime())<7*864e5).length;}

// ─── EXPORT CSV ───
// Format : Date;Session;Phase;Durée;Exercice;Muscle;Set;Kg;Reps;Volume;1RM est.;RIR;Notes (Excel FR + BOM UTF-8)
function exportCSV(){
  let csv="Date;Session;Phase;Durée;Exercice;Muscle;Set;Kg;Reps;Volume;1RM est.;RIR;Notes\n";
  S.hist.forEach(h=>{h.exercises.forEach(ex=>{const sets=Object.entries(ex.logged||{});if(!sets.length)csv+=`${new Date(h.date).toLocaleDateString("fr-FR")};${h.sessionName};${h.phase||""};${h.duration};${ex.name};${ex.muscle};;;;;;;\n`;else sets.forEach(([si,s])=>{const rm=s.weight&&s.reps?calc1RM(s.weight,s.reps):0;csv+=`${new Date(h.date).toLocaleDateString("fr-FR")};${h.sessionName};${h.phase||""};${h.duration};${ex.name};${ex.muscle};${parseInt(si)+1};${s.weight};${s.reps};${(s.weight||0)*(s.reps||0)};${rm};${ex.rir!==undefined&&ex.rir!==null?ex.rir:""};${(h.notes||"").replace(/;/g,",")}\n`;});});});
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8;"}));a.download=`apex-${new Date().toISOString().slice(0,10)}.csv`;a.click();
}

// ─── CHARTS SVG (sans librairie) ───
function svgBar(data,lk,vk,col,w,h){
  if(!data.length)return'<div style="text-align:center;color:var(--mt);padding:16px;font-size:13px">—</div>';
  const mx=Math.max(...data.map(d=>d[vk]))||1;const bW=Math.min(28,Math.floor((w-40)/data.length)-3);const cH=h-25;
  let s=`<svg width="100%" viewBox="0 0 ${w} ${h}"><line x1="28" y1="0" x2="28" y2="${cH}" stroke="var(--bd)"/><line x1="28" y1="${cH}" x2="${w}" y2="${cH}" stroke="var(--bd)"/><text x="25" y="10" text-anchor="end" font-size="9" fill="var(--mt)">${mx}</text>`;
  data.forEach((d,i)=>{const bh=Math.max(2,(d[vk]/mx)*cH);const x=30+i*(bW+3);s+=`<rect x="${x}" y="${cH-bh}" width="${bW}" height="${bh}" rx="2" fill="${col}" opacity=".8"><title>${d[lk]}: ${d[vk]}</title></rect>`;if(data.length<=10)s+=`<text x="${x+bW/2}" y="${cH+11}" text-anchor="middle" font-size="9" fill="var(--mt)">${d[lk]}</text>`;});
  return s+"</svg>";
}
function svgLine(data,lk,vk,col,w,h){
  if(data.length<2)return svgBar(data,lk,vk,col,w,h);
  const mx=Math.max(...data.map(d=>d[vk]))||1;const cH=h-25;const cW=w-40;const step=cW/(data.length-1);
  let pts="",dots="",lbls="",s=`<svg width="100%" viewBox="0 0 ${w} ${h}"><line x1="28" y1="0" x2="28" y2="${cH}" stroke="var(--bd)"/><line x1="28" y1="${cH}" x2="${w}" y2="${cH}" stroke="var(--bd)"/><text x="25" y="10" text-anchor="end" font-size="9" fill="var(--mt)">${mx}</text>`;
  data.forEach((d,i)=>{const x=30+i*step,y=cH-(d[vk]/mx)*cH;pts+=(i?` L`:`M`)+`${x},${y}`;dots+=`<circle cx="${x}" cy="${y}" r="3.5" fill="${col}"><title>${d[lk]}: ${d[vk]}kg</title></circle>`;if(data.length<=10)lbls+=`<text x="${x}" y="${cH+12}" text-anchor="middle" font-size="9" fill="var(--mt)">${d[lk]}</text>`;});
  return s+`<path d="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`+dots+lbls+"</svg>";
}
