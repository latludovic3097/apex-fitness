// FITStark — Gestion de l'état + business logic stateful
// Dépend de : core.js (calc1RM, getAPREAdjustment), data.js (PHASES, WODS, PROG)

// ─── L10 v8.24 : UTM tracking RGPD-pur (0 third-party, 0 IP, 0 fingerprint)
// Capture les paramètres UTM SI l'utilisateur arrive avec une URL taggée
// (ex: apexfit-da753.web.app/?utm_source=reddit&utm_medium=backpain).
// Persisté UNIQUEMENT en localStorage. Propagé à Firestore seulement si l'user
// se connecte avec Google (consentement explicite). Pas d'event tracking en
// continu : un seul capture au tout premier hit avec UTM.
(function captureAcquisition(){
  try {
    if(localStorage.getItem("apex_acquisition")) return; // déjà capturé
    const p = new URLSearchParams(window.location.search);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","ref"];
    const data = {};
    let hasAny = false;
    keys.forEach(k => { const v = p.get(k); if(v){ data[k] = v.slice(0,80); hasAny = true; } });
    if(!hasAny) return;
    data.firstVisit = new Date().toISOString();
    data.landing = location.pathname; // ex: /landing-c.html ou /
    localStorage.setItem("apex_acquisition", JSON.stringify(data));
  } catch(e) {}
})();

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
  nut: {weight:75,height:178,age:30,sex:"M",activity:1.55,goal:-400,proteinPerKg:2,fatPerKg:0.8,weightLog:[]},
  // P1 #8 : pathologies actives — par défaut L5-S1 (mode historique de l'app)
  health: {pathologies:["l5"]},
  // P1 #9 : programme custom — IDs d'exercices favoris choisis par l'utilisateur (depuis PROG)
  custom: {name:"CUSTOM", exerciseIds:[]},
  // v8.29 : objectif déclaré au onboarding ("force" | "muscle" | "lean" | "rehab")
  // Pilote les adaptations UI (cardio recommendation pour "lean", focus L5 pour "rehab")
  // tout en laissant S.phase libre de changer indépendamment.
  goal: "muscle"
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
      if(d.health)S.health={...S.health,...d.health};
      if(d.custom)S.custom={...S.custom,...d.custom};
      if(d.goal)S.goal=d.goal;
      if(d.customProgram)S.customProgram=d.customProgram;
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
// P0 #4 : détecte QuotaExceededError et avertit l'utilisateur (sinon silent fail → perte de données)
let _quotaWarned = false;
function saveS(){
  try{
    localStorage.setItem(SK,JSON.stringify({history:S.hist,phase:S.phase,cardio:S.cardio,core:S.core,nut:S.nut,health:S.health,custom:S.custom,goal:S.goal,customProgram:S.customProgram||null}));
    _quotaWarned = false; // reset si on a réussi
  }catch(e){
    if(!_quotaWarned && (e.name === "QuotaExceededError" || /quota/i.test(e.message||""))){
      _quotaWarned = true;
      console.error("[apex] localStorage saturé:", e);
      // Affiche un toast d'alerte (en évitant d'écraser le rendu)
      setTimeout(() => {
        if(confirm("⚠️ Stockage local saturé !\n\nTes dernières données n'ont pas pu être sauvegardées.\n\nClique OK pour télécharger un backup JSON tout de suite (recommandé), puis va dans Réglages → Effacer pour libérer de l'espace.")){
          if(typeof safeWipe === "function") safeWipe();
        }
      }, 100);
    }
  }
  scheduleCloudSync();
}

// P0 #3 : error boundary — capture les erreurs non rattrapées, montre un écran de récupération
window.addEventListener("error", e => {
  console.error("[apex] uncaught:", e.error || e.message);
  if(window._apexBootRecovering) return; // évite la boucle
  // On affiche un écran de secours uniquement si l'app est cassée (R n'arrive pas à rendre)
});
window.addEventListener("unhandledrejection", e => {
  console.error("[apex] unhandled rejection:", e.reason);
});

// Wrap safe rendering : utilisé par ui.js R() pour ne pas crasher tout l'écran si une erreur survient
function safeRender(renderFn){
  try{
    return renderFn();
  }catch(e){
    // v8.57 — log complet pour debug (stack + view + état pertinent)
    console.error("[apex] render crashed:", e);
    console.error("[apex] view:", S?.view, "| sess?", !!S?.sess, "| customProgram?", !!S?.customProgram, "| hist:", S?.hist?.length, "| stack:", e?.stack);
    const stackLine = (e?.stack||"").split("\n").slice(0,4).join(" | ");
    return `<div style="padding:24px 20px;max-width:480px;margin:0 auto">
      <div style="font-size:30px;font-weight:900;letter-spacing:5px;color:#E63946;margin-bottom:22px">FITSTARK</div>
      <div style="background:#fff;border-radius:16px;border:1px solid #e5e5ea;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.07)">
        <div style="font-size:18px;font-weight:800;margin-bottom:14px;color:#E63946">⚠️ Oups, l'écran a planté</div>
        <div style="font-size:14px;color:#48484a;line-height:1.7;margin-bottom:18px">
          Une erreur inattendue est survenue lors de l'affichage. Tes données sont en sécurité.<br><br>
          <code style="background:#f0f0f3;padding:6px 10px;border-radius:6px;font-size:11px;display:block;word-break:break-all;margin-bottom:8px">${esc(String(e.message||e).slice(0,200))}</code>
          <details style="font-size:11px;color:#6c6c70;margin-top:6px"><summary style="cursor:pointer">Détails techniques (pour debug)</summary><code style="background:#f0f0f3;padding:6px 10px;border-radius:6px;font-size:10px;display:block;word-break:break-all;margin-top:6px;line-height:1.6">${esc(stackLine.slice(0,400))}</code></details>
        </div>
        <button onclick="S.view='home';S.sess=null;S.customProgram=null;saveS();saveA();location.reload()" style="background:#E63946;color:#fff;border:none;border-radius:12px;padding:14px 24px;font-size:15px;font-weight:800;cursor:pointer;width:100%;font-family:inherit">Reset complet + Recharger</button>
      </div>
    </div>`;
  }
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
        nut: S.nut,
        health: S.health,
        goal: S.goal
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
      if(cloud.health) S.health = {...S.health, ...cloud.health};
      if(cloud.core) S.core = {...S.core, ...cloud.core};
      if(cloud.nut) S.nut = {...S.nut, ...cloud.nut};
      if(cloud.goal) S.goal = cloud.goal;
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
  const _T = window.T || ((k,p)=>{if(!p)return k;let s=k;Object.keys(p).forEach(x=>s=s.replace("{"+x+"}",p[x]));return s;});
  const days = getDaysSinceLastSession();
  if(days === null) return { days: null, sessions7: 0, status: "new", color: "var(--mt)", message: _T("streak_msg_new") };
  const sessions7 = S.hist.filter(h => (Date.now() - new Date(h.date).getTime()) < 7*864e5).length;
  if(days === 0) return { days, sessions7, status: "active", color: "var(--ok)", message: _T(sessions7>1?"streak_msg_active_pl":"streak_msg_active", {n:sessions7}) };
  if(days <= 2) return { days, sessions7, status: "ok", color: "var(--ok)", message: _T(days===1?"streak_msg_ok_y":"streak_msg_ok_d", {n:days}) };
  if(days <= 4) return { days, sessions7, status: "warn", color: "var(--wa)", message: _T("streak_msg_warn", {n:days}) };
  if(days <= 7) return { days, sessions7, status: "alert", color: "var(--ac)", message: _T("streak_msg_alert", {n:days}) };
  return { days, sessions7, status: "lost", color: "var(--ac)", message: _T("streak_msg_lost", {n:days}) };
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
  const ok = showLocalNotif("FITStark 💪", info.message.replace(/^[⚠️🚨🔥]\s*/, ""));
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
function tTick(){const r=tGet(),p=T.dir==="down"?(T.total-r)/T.total:r/T.total;const d=document.getElementById("tdisp"),rng=document.getElementById("tring"),bx=document.getElementById("timerbox");if(d)d.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`;if(rng){rng.style.strokeDashoffset=2*Math.PI*22*(1-p);rng.style.transition="stroke-dashoffset .3s";}if((T.dir==="down"&&r<=0)||(T.dir!=="down"&&r>=T.total)){T.on=false;T.done=true;if(rng)rng.setAttribute("stroke","var(--ok)");if(bx)bx.classList.add("done");const b=document.getElementById("tbtn");if(b){b.textContent="✓";b.className="tbtn tbtn-go";}beep();releaseWakeLock();cancelAnimationFrame(tRAF);return;}tRAF=requestAnimationFrame(tTick);}
function tToggle(tot,dir){dir=dir||"down";if(T.done||T.total!==tot||T.dir!==dir){cancelAnimationFrame(tRAF);T={on:false,at:0,total:tot,dir:dir,rem:dir==="up"?0:tot,done:false};const bx=document.getElementById("timerbox");if(bx)bx.classList.remove("done");}S._timerExIdx=S.ei;T.dir=dir;T.total=tot;if(T.on){T.on=false;T.rem=tGet();cancelAnimationFrame(tRAF);const b=document.getElementById("tbtn");if(b){b.textContent="Start";b.className="tbtn tbtn-go";}releaseWakeLock();}else{if(!T.at&&T.rem===0)T.rem=T.dir==="down"?tot:0;T.at=Date.now();T.on=true;const b=document.getElementById("tbtn");if(b){b.textContent="Pause";b.className="tbtn tbtn-pause";}tTick();requestWakeLock();}}
function tReset(tot,dir){cancelAnimationFrame(tRAF);T={on:false,at:0,total:tot,dir:dir||"down",rem:dir==="up"?0:tot,done:false};const d=document.getElementById("tdisp"),rng=document.getElementById("tring"),bx=document.getElementById("timerbox"),b=document.getElementById("tbtn");if(d)d.textContent=`${Math.floor(T.rem/60)}:${String(T.rem%60).padStart(2,"0")}`;if(rng){rng.style.strokeDashoffset=2*Math.PI*22;}if(bx)bx.classList.remove("done");if(b){b.textContent="Start";b.className="tbtn tbtn-go";}}
function tStop(){cancelAnimationFrame(tRAF);T={on:false,at:0,total:0,dir:"down",rem:0,done:false};releaseWakeLock();}

// ─── TABATA TIMER (v8.67) ─── state machine 8/16/N × (workS effort + restS repos)
let TB = { on:false, phase:'idle', round:0, rounds:8, secLeft:20, atMs:0, raf:null, workS:20, restS:10, _lastBeep:-1 };
function tabBeepShort(){try{initAudio();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=880;g.gain.value=.28;o.start();o.stop(audioCtx.currentTime+.10);}catch{}}
function tabBeepLong(freq){try{initAudio();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=freq||660;g.gain.value=.35;o.start();o.stop(audioCtx.currentTime+.32);}catch{}}
function tabBeepEnd(){try{initAudio();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();[0,.18,.36].forEach(d=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=988;g.gain.value=.35;o.start(audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d+.22);});}catch{}}
function tabVibe(p){if(navigator.vibrate){try{navigator.vibrate(p);}catch{}}}
function tabataStart(workS, restS, rounds){
  if(TB.on){ tabataPause(); return; }
  if(TB.phase==='idle' || TB.phase==='done'){
    TB = { on:true, phase:'work', round:1, rounds:rounds, secLeft:workS, atMs:Date.now(), raf:null, workS:workS, restS:restS, _lastBeep:-1 };
    tabBeepLong(660); tabVibe(80); speakWod("C'est parti, round 1");
  } else {
    // reprise après pause : décaler atMs pour conserver le temps déjà écoulé
    const phaseLen = TB.phase==='work' ? TB.workS : TB.restS;
    const alreadyElapsed = phaseLen - TB.secLeft;
    TB.atMs = Date.now() - alreadyElapsed*1000;
    TB.on = true;
  }
  S._timerExIdx = S.ei;
  requestWakeLock();
  tabataTick();
  tabataRender();
}
function tabataPause(){TB.on=false;if(TB.raf)cancelAnimationFrame(TB.raf);releaseWakeLock();tabataRender();}
function tabataReset(workS, restS, rounds){
  if(TB.raf) cancelAnimationFrame(TB.raf);
  TB = { on:false, phase:'idle', round:0, rounds:rounds, secLeft:workS, atMs:0, raf:null, workS:workS, restS:restS, _lastBeep:-1 };
  releaseWakeLock();
  tabataRender();
}
function tabataTick(){
  if(!TB.on) return;
  const elapsed = Math.floor((Date.now() - TB.atMs)/1000);
  const phaseLen = TB.phase==='work' ? TB.workS : TB.restS;
  const remaining = phaseLen - elapsed;
  if(remaining <= 0){
    if(TB.phase==='work'){
      TB.phase = 'rest'; TB.atMs = Date.now(); TB.secLeft = TB.restS; TB._lastBeep = -1;
      tabBeepLong(440); tabVibe(60); speakWod("Repos");
    } else { // rest done
      if(TB.round >= TB.rounds){
        TB.on=false; TB.phase='done'; TB.secLeft=0;
        tabBeepEnd(); tabVibe([120,60,120,60,200]); speakWod("Terminé, bien joué");
        if(TB.raf) cancelAnimationFrame(TB.raf);
        releaseWakeLock();
        tabataRender();
        return;
      }
      TB.round += 1; TB.phase='work'; TB.atMs = Date.now(); TB.secLeft = TB.workS; TB._lastBeep = -1;
      tabBeepLong(660); tabVibe(80); speakWod("Round " + TB.round);
    }
    tabataRender();
    TB.raf = requestAnimationFrame(tabataTick);
    return;
  }
  // bips countdown 3-2-1
  if(remaining <= 3 && remaining !== TB._lastBeep){
    tabBeepShort();
    TB._lastBeep = remaining;
  }
  TB.secLeft = remaining;
  tabataRender();
  TB.raf = requestAnimationFrame(tabataTick);
}
function tabataRender(){
  const wrap = document.getElementById('tabata-stage-wrap');
  if(!wrap) return;
  wrap.setAttribute('data-phase', TB.phase);
  const t = document.getElementById('tab-time');
  if(t) t.textContent = TB.phase==='idle' ? TB.workS : (TB.phase==='done' ? '✓' : TB.secLeft);
  const r = document.getElementById('tab-round');
  if(r) r.textContent = TB.phase==='idle' ? '0' : TB.round;
  const pl = document.getElementById('tab-phase-label');
  if(pl){
    pl.textContent = TB.phase==='idle' ? 'PRÊT' : TB.phase==='work' ? 'EFFORT' : TB.phase==='rest' ? 'REPOS' : '✓ TERMINÉ';
    pl.className = 'tab-phase-pill phase-' + TB.phase;
  }
  const startBtn = document.getElementById('tab-start');
  if(startBtn){
    if(TB.on){ startBtn.textContent = 'PAUSE'; startBtn.className = 'tbtn tbtn-pause'; }
    else if(TB.phase==='done'){ startBtn.textContent = '✓ FINI'; startBtn.className = 'tbtn tbtn-go'; }
    else if(TB.phase==='work' || TB.phase==='rest'){ startBtn.textContent = 'REPRENDRE'; startBtn.className = 'tbtn tbtn-go'; }
    else { startBtn.textContent = 'START'; startBtn.className = 'tbtn tbtn-go'; }
  }
  // Segments
  const segs = wrap.querySelectorAll('.tab-seg');
  const cur = (TB.phase==='idle' || TB.phase==='done') ? -1 : 2*(TB.round-1) + (TB.phase==='rest' ? 1 : 0);
  segs.forEach((seg, i) => {
    seg.classList.remove('seg-past','seg-active','seg-future');
    if(TB.phase==='done') seg.classList.add('seg-past');
    else if(TB.phase==='idle') seg.classList.add('seg-future');
    else if(i < cur) seg.classList.add('seg-past');
    else if(i === cur) seg.classList.add('seg-active');
    else seg.classList.add('seg-future');
  });
  // Cercle de progression interne (autour du chiffre)
  const ring = document.getElementById('tab-phase-progress');
  if(ring){
    const phaseLen = TB.phase==='work' ? TB.workS : (TB.phase==='rest' ? TB.restS : TB.workS);
    const pct = TB.phase==='idle' ? 0 : TB.phase==='done' ? 1 : 1 - (TB.secLeft / phaseLen);
    const c = 2 * Math.PI * 76;
    ring.style.strokeDasharray = c;
    ring.style.strokeDashoffset = c * (1 - pct);
    ring.setAttribute('stroke', TB.phase==='rest' ? 'var(--ok)' : TB.phase==='work' ? 'var(--ac)' : 'var(--bd)');
  }
}

// ─── EMOM TIMER (v8.69) ─── pastilles minute par minute + top sonore
let EM = { on:false, atMs:0, totalMin:10, curMin:0, secLeft:60, raf:null, _lastBeep:-1 };
function emomStart(totalMin){
  if(EM.on){ emomPause(); return; }
  if(EM.curMin === 0 || EM.curMin > EM.totalMin){
    EM = { on:true, atMs:Date.now(), totalMin:totalMin, curMin:1, secLeft:60, raf:null, _lastBeep:-1 };
    tabBeepLong(660); tabVibe(80); speakWod("C'est parti, minute 1");
  } else {
    const elapsed = 60 - EM.secLeft;
    EM.atMs = Date.now() - elapsed*1000;
    EM.on = true;
  }
  S._timerExIdx = S.ei;
  requestWakeLock();
  emomTick();
  emomRender();
}
function emomPause(){EM.on=false; if(EM.raf)cancelAnimationFrame(EM.raf); releaseWakeLock(); emomRender();}
function emomReset(totalMin){
  if(EM.raf) cancelAnimationFrame(EM.raf);
  EM = { on:false, atMs:0, totalMin:totalMin, curMin:0, secLeft:60, raf:null, _lastBeep:-1 };
  releaseWakeLock();
  emomRender();
}
function emomTick(){
  if(!EM.on) return;
  const elapsed = Math.floor((Date.now() - EM.atMs)/1000);
  const remaining = 60 - elapsed;
  if(remaining <= 0){
    if(EM.curMin >= EM.totalMin){
      EM.on=false; EM.curMin = EM.totalMin + 1;
      tabBeepEnd(); tabVibe([120,60,120,60,200]); speakWod("Terminé, bien joué");
      if(EM.raf) cancelAnimationFrame(EM.raf);
      releaseWakeLock();
      emomRender();
      return;
    }
    EM.curMin += 1; EM.atMs = Date.now(); EM.secLeft = 60; EM._lastBeep = -1;
    tabBeepLong(660); tabVibe(80); speakWod("Top, minute " + EM.curMin);
    emomRender();
    EM.raf = requestAnimationFrame(emomTick);
    return;
  }
  if(remaining <= 3 && remaining !== EM._lastBeep){ tabBeepShort(); EM._lastBeep = remaining; }
  EM.secLeft = remaining;
  emomRender();
  EM.raf = requestAnimationFrame(emomTick);
}
function emomRender(){
  const wrap = document.getElementById('emom-wrap');
  if(!wrap) return;
  const idle = EM.curMin === 0;
  const done = !EM.on && EM.curMin > EM.totalMin;
  wrap.setAttribute('data-phase', done ? 'done' : idle ? 'idle' : 'work');
  const t = document.getElementById('em-time');
  if(t) t.textContent = idle ? '60' : done ? '✓' : EM.secLeft;
  const cur = document.getElementById('em-curmin');
  if(cur) cur.textContent = done ? EM.totalMin : (idle ? 0 : EM.curMin);
  const pl = document.getElementById('em-phase');
  if(pl){
    pl.textContent = idle ? 'PRÊT' : done ? '✓ TERMINÉ' : 'EN COURS';
    pl.className = 'tab-phase-pill phase-' + (idle?'idle':done?'done':'emom');
  }
  const startBtn = document.getElementById('em-start');
  if(startBtn){
    if(EM.on){ startBtn.textContent='PAUSE'; startBtn.className='tbtn tbtn-pause'; }
    else if(done){ startBtn.textContent='✓ FINI'; startBtn.className='tbtn tbtn-go'; }
    else if(EM.curMin > 0){ startBtn.textContent='REPRENDRE'; startBtn.className='tbtn tbtn-go'; }
    else { startBtn.textContent='START'; startBtn.className='tbtn tbtn-go'; }
  }
  const pills = wrap.querySelectorAll('.em-pill');
  pills.forEach((p, i) => {
    const m = i + 1;
    p.classList.remove('pill-past','pill-active','pill-future');
    if(done || m < EM.curMin) p.classList.add('pill-past');
    else if(m === EM.curMin && !idle) p.classList.add('pill-active');
    else p.classList.add('pill-future');
  });
  const ring = document.getElementById('em-progress');
  if(ring){
    const pct = idle ? 0 : done ? 1 : 1 - (EM.secLeft / 60);
    const c = 2 * Math.PI * 100;
    ring.style.strokeDasharray = c;
    ring.style.strokeDashoffset = c * (1 - pct);
  }
}

// ─── AMRAP TIMER (v8.69) ─── cercle + compteur de tours + splits
let AM = { on:false, atMs:0, totalSec:480, secLeft:480, rounds:0, splits:[], raf:null, _lastBeep:-1 };
function amrapStart(totalMin){
  if(AM.on){ amrapPause(); return; }
  const tot = totalMin * 60;
  if(AM.secLeft <= 0 || AM.secLeft === AM.totalSec){
    AM = { on:true, atMs:Date.now(), totalSec:tot, secLeft:tot, rounds:0, splits:[], raf:null, _lastBeep:-1 };
    tabBeepLong(660); tabVibe(80); speakWod("C'est parti, fais le max de tours");
  } else {
    const elapsed = AM.totalSec - AM.secLeft;
    AM.atMs = Date.now() - elapsed*1000;
    AM.on = true;
  }
  S._timerExIdx = S.ei;
  requestWakeLock();
  amrapTick();
  amrapRender();
}
function amrapPause(){AM.on=false; if(AM.raf)cancelAnimationFrame(AM.raf); releaseWakeLock(); amrapRender();}
function amrapReset(totalMin){
  if(AM.raf) cancelAnimationFrame(AM.raf);
  const tot = totalMin * 60;
  AM = { on:false, atMs:0, totalSec:tot, secLeft:tot, rounds:0, splits:[], raf:null, _lastBeep:-1 };
  releaseWakeLock();
  amrapRender();
}
function amrapAddRound(){
  if(!AM.on) return;
  AM.rounds += 1;
  AM.splits.push(AM.totalSec - AM.secLeft);
  tabBeepShort(); tabVibe(50);
  amrapRender();
}
function amrapTick(){
  if(!AM.on) return;
  const elapsed = Math.floor((Date.now() - AM.atMs)/1000);
  const remaining = AM.totalSec - elapsed;
  if(remaining <= 0){
    AM.on=false; AM.secLeft = 0;
    tabBeepEnd(); tabVibe([120,60,120,60,200]); speakWod("Time, " + AM.rounds + " tours");
    if(AM.raf) cancelAnimationFrame(AM.raf);
    releaseWakeLock();
    amrapRender();
    return;
  }
  // Annonce à 60s restantes : dernière minute
  if(remaining === 60 && AM._lastBeep !== 60){
    tabBeepLong(440); tabVibe(60); speakWod("Dernière minute, à fond"); AM._lastBeep = 60;
  }
  else if((remaining <= 3 || remaining === 5 || remaining === 10) && remaining !== AM._lastBeep){
    tabBeepShort(); AM._lastBeep = remaining;
  }
  AM.secLeft = remaining;
  amrapRender();
  AM.raf = requestAnimationFrame(amrapTick);
}
function amrapRender(){
  const wrap = document.getElementById('amrap-wrap');
  if(!wrap) return;
  const idle = AM.secLeft === AM.totalSec && !AM.on;
  const done = AM.secLeft === 0 && AM.totalSec > 0;
  const lastMin = AM.secLeft <= 60 && AM.secLeft > 0 && AM.on;
  wrap.setAttribute('data-phase', done ? 'done' : lastMin ? 'rush' : idle ? 'idle' : 'work');
  const clock = document.getElementById('am-clock');
  if(clock){
    const m = Math.floor(AM.secLeft/60), s = AM.secLeft % 60;
    clock.textContent = `${m}:${String(s).padStart(2,'0')}`;
  }
  const rounds = document.getElementById('am-rounds');
  if(rounds) rounds.textContent = AM.rounds;
  const pl = document.getElementById('am-phase');
  if(pl){
    pl.textContent = idle ? 'PRÊT' : done ? '✓ TERMINÉ' : lastMin ? 'DERNIÈRE MINUTE' : 'EN COURS';
    pl.className = 'tab-phase-pill phase-' + (idle?'idle':done?'done':lastMin?'rush':'work');
  }
  const startBtn = document.getElementById('am-start');
  if(startBtn){
    if(AM.on){ startBtn.textContent='PAUSE'; startBtn.className='tbtn tbtn-pause'; }
    else if(done){ startBtn.textContent='✓ FINI'; startBtn.className='tbtn tbtn-go'; }
    else if(AM.secLeft < AM.totalSec){ startBtn.textContent='REPRENDRE'; startBtn.className='tbtn tbtn-go'; }
    else { startBtn.textContent='START'; startBtn.className='tbtn tbtn-go'; }
  }
  const ring = document.getElementById('am-progress');
  if(ring){
    const pct = AM.totalSec ? 1 - (AM.secLeft / AM.totalSec) : 0;
    const c = 2 * Math.PI * 110;
    ring.style.strokeDasharray = c;
    ring.style.strokeDashoffset = c * (1 - pct);
  }
  const splitsBox = document.getElementById('am-splits');
  if(splitsBox){
    if(AM.splits.length === 0){
      splitsBox.innerHTML = '<div class="am-no-splits">Tape « + 1 TOUR » à chaque tour complété</div>';
    } else {
      splitsBox.innerHTML = AM.splits.map((s, i) => {
        const m = Math.floor(s/60), sec = s % 60;
        const prev = i > 0 ? AM.splits[i-1] : 0;
        const delta = s - prev;
        const dm = Math.floor(delta/60), ds = delta % 60;
        return `<div class="am-split-row"><span class="am-split-n">#${i+1}</span><span class="am-split-t">${m}:${String(sec).padStart(2,'0')}</span><span class="am-split-d">+${dm}:${String(ds).padStart(2,'0')}</span></div>`;
      }).join('');
    }
  }
  const addBtn = document.getElementById('am-add');
  if(addBtn){
    addBtn.disabled = !AM.on;
    addBtn.style.opacity = AM.on ? '1' : '0.45';
  }
}

// ─── FOR TIME (v8.69) ─── chrono ascendant + check par mouvement
let FT = { on:false, atMs:0, elapsed:0, splits:{}, raf:null };
function ftimeStart(){
  if(FT.on){ ftimePause(); return; }
  if(FT.elapsed === 0){
    FT = { on:true, atMs:Date.now(), elapsed:0, splits:{}, raf:null };
    tabBeepLong(660); tabVibe(80); speakWod("C'est parti, fonce");
  } else {
    FT.atMs = Date.now() - FT.elapsed*1000;
    FT.on = true;
  }
  S._timerExIdx = S.ei;
  requestWakeLock();
  ftimeTick();
  ftimeRender();
}
function ftimePause(){FT.on=false; if(FT.raf)cancelAnimationFrame(FT.raf); releaseWakeLock(); ftimeRender();}
function ftimeReset(){
  if(FT.raf) cancelAnimationFrame(FT.raf);
  FT = { on:false, atMs:0, elapsed:0, splits:{}, raf:null };
  releaseWakeLock();
  document.querySelectorAll('.ft-check').forEach(c => { c.checked = false; });
  ftimeRender();
}
function ftimeTick(){
  if(!FT.on) return;
  FT.elapsed = Math.floor((Date.now() - FT.atMs)/1000);
  ftimeRender();
  FT.raf = requestAnimationFrame(ftimeTick);
}
function ftimeToggleMove(idx){
  const cb = document.querySelector('.ft-check[data-i="'+idx+'"]');
  if(!cb) return;
  if(cb.checked && FT.splits[idx] === undefined){
    FT.splits[idx] = FT.elapsed;
    tabBeepShort(); tabVibe(50);
  } else if(!cb.checked){
    delete FT.splits[idx];
  }
  const total = document.querySelectorAll('.ft-check').length;
  const done = Object.keys(FT.splits).length;
  if(done === total && total > 0 && FT.on){
    FT.on = false;
    if(FT.raf) cancelAnimationFrame(FT.raf);
    tabBeepEnd(); tabVibe([120,60,120,60,200]);
    const m = Math.floor(FT.elapsed/60), s = FT.elapsed%60;
    speakWod(`Terminé en ${m} minutes ${s} secondes, bien joué`);
    releaseWakeLock();
  }
  ftimeRender();
}
function ftimeRender(){
  const wrap = document.getElementById('ftime-wrap');
  if(!wrap) return;
  const total = document.querySelectorAll('.ft-check').length;
  const done = Object.keys(FT.splits).length;
  const isDone = done > 0 && done === total;
  wrap.setAttribute('data-phase', isDone ? 'done' : FT.on ? 'work' : FT.elapsed > 0 ? 'paused' : 'idle');
  const clock = document.getElementById('ft-clock');
  if(clock){
    const m = Math.floor(FT.elapsed/60), s = FT.elapsed % 60;
    clock.textContent = `${m}:${String(s).padStart(2,'0')}`;
  }
  const pl = document.getElementById('ft-phase');
  if(pl){
    pl.textContent = isDone ? '✓ TERMINÉ' : FT.on ? 'EN COURS' : FT.elapsed > 0 ? 'PAUSE' : 'PRÊT';
    pl.className = 'tab-phase-pill phase-' + (isDone?'done':FT.on?'work':FT.elapsed>0?'paused':'idle');
  }
  const startBtn = document.getElementById('ft-start');
  if(startBtn){
    if(FT.on){ startBtn.textContent='PAUSE'; startBtn.className='tbtn tbtn-pause'; }
    else if(isDone){ startBtn.textContent='✓ FINI'; startBtn.className='tbtn tbtn-go'; }
    else if(FT.elapsed > 0){ startBtn.textContent='REPRENDRE'; startBtn.className='tbtn tbtn-go'; }
    else { startBtn.textContent='START'; startBtn.className='tbtn tbtn-go'; }
  }
  document.querySelectorAll('.ft-move').forEach((row, idx) => {
    const split = FT.splits[idx];
    const splitEl = row.querySelector('.ft-split-time');
    if(splitEl){
      if(split !== undefined){
        const m = Math.floor(split/60), s = split % 60;
        splitEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
        splitEl.classList.add('shown');
      } else {
        splitEl.textContent = '';
        splitEl.classList.remove('shown');
      }
    }
    row.classList.toggle('done', split !== undefined);
  });
  const prog = document.getElementById('ft-progress');
  if(prog) prog.textContent = `${done} / ${total}`;
}

// ─── VOIX (v8.71) ─── Web Speech API pour annonces vocales pendant les timers WOD
let _ttsVoice = null;
function _pickTTSVoice(){
  if(_ttsVoice) return _ttsVoice;
  if(!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  if(!voices.length) return null;
  // Préférence : voix française premium (Thomas, Audrey, Amelie, etc.) > fr-FR > fr-CA
  const score = (v) => {
    let s = 0;
    if(v.lang === 'fr-FR') s += 100;
    else if(v.lang && v.lang.startsWith('fr')) s += 50;
    if(/thomas|audrey|amelie|aurelie|virginie|chantal/i.test(v.name)) s += 30;
    if(/premium|enhanced|neural/i.test(v.name)) s += 20;
    if(v.localService) s += 5;
    return s;
  };
  voices.sort((a,b) => score(b) - score(a));
  _ttsVoice = voices[0];
  return _ttsVoice;
}
if('speechSynthesis' in window){
  speechSynthesis.onvoiceschanged = () => { _ttsVoice = null; _pickTTSVoice(); };
}
function speakWod(text, opts){
  if(!('speechSynthesis' in window)) return;
  if(localStorage.getItem('apex_voice_muted') === '1') return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = (opts&&opts.rate) || 1.15;
    u.pitch = (opts&&opts.pitch) || 1.05;
    u.volume = 1.0;
    const v = _pickTTSVoice();
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  } catch(e) {}
}
function toggleWodVoice(){
  const cur = localStorage.getItem('apex_voice_muted') === '1';
  localStorage.setItem('apex_voice_muted', cur ? '0' : '1');
  if(!cur) try{ speechSynthesis.cancel(); }catch{}
  R();
}
function isWodVoiceMuted(){ return localStorage.getItem('apex_voice_muted') === '1'; }

// v8.71 — Mode focus plein écran sur le timer WOD
function toggleTimerFullscreen(){
  const wrap = document.querySelector('.tabata-wrap');
  if(!wrap) return;
  const willBeFs = !wrap.classList.contains('fs');
  document.querySelectorAll('.tabata-wrap').forEach(w => w.classList.toggle('fs', willBeFs));
  document.body.classList.toggle('timer-focus', willBeFs);
  // update tous les boutons fs visibles
  document.querySelectorAll('.tab-fs-btn').forEach(b => { b.textContent = willBeFs ? '⤡' : '⛶'; b.title = willBeFs ? 'Quitter le mode focus' : 'Mode focus'; });
  if(willBeFs){
    if(document.documentElement.requestFullscreen){
      document.documentElement.requestFullscreen().catch(()=>{});
    }
  } else {
    if(document.fullscreenElement && document.exitFullscreen){
      document.exitFullscreen().catch(()=>{});
    }
  }
}
// Sync : si l'utilisateur quitte le fullscreen via Esc, retire la classe focus
document.addEventListener('fullscreenchange', () => {
  if(!document.fullscreenElement && document.body.classList.contains('timer-focus')){
    document.querySelectorAll('.tabata-wrap').forEach(w => w.classList.remove('fs'));
    document.body.classList.remove('timer-focus');
    document.querySelectorAll('.tab-fs-btn').forEach(b => { b.textContent = '⛶'; b.title = 'Mode focus'; });
  }
});

// ─── RECORDS WOD (v8.70) ─── capture résultat WOD + détection PB
function captureWodResult(wod){
  if(!wod) return null;
  const t = wod.type;
  if(t === "Tabata"){
    const total = (typeof TB!=='undefined' && TB.rounds) || Math.max(1, Math.round((wod.duration||4)*60/30));
    const done = (typeof TB!=='undefined' && TB.phase === 'done') ? total : (typeof TB!=='undefined' ? (TB.round||0) : 0);
    return { type:'Tabata', wodName:wod.name, rounds:done, totalRounds:total, completed: done >= total, score: done };
  }
  if(t === "EMOM"){
    const total = (typeof EM!=='undefined' && EM.totalMin) || wod.duration || 0;
    const cur = typeof EM!=='undefined' ? (EM.curMin || 0) : 0;
    const done = cur > total ? total : cur;
    return { type:'EMOM', wodName:wod.name, minutes:done, totalMin:total, completed: done >= total && total > 0, score: done };
  }
  if(t === "AMRAP"){
    const r = typeof AM!=='undefined' ? (AM.rounds||0) : 0;
    const sp = typeof AM!=='undefined' ? (AM.splits||[]).slice() : [];
    return { type:'AMRAP', wodName:wod.name, rounds:r, splits:sp, totalMin:wod.duration||0, completed: r > 0, score: r };
  }
  if(t === "For Time"){
    const totalMoves = (wod.movements||[]).length;
    const sp = typeof FT!=='undefined' ? (FT.splits||{}) : {};
    const done = Object.keys(sp).length;
    const t0 = typeof FT!=='undefined' ? (FT.elapsed||0) : 0;
    const isOK = done >= totalMoves && totalMoves > 0;
    // Pour le For Time, score = -temps (moins de temps = meilleur). Si incomplet, score très négatif.
    return { type:'For Time', wodName:wod.name, timeSec:t0, movesCompleted:done, totalMoves:totalMoves, completed: isOK, score: isOK ? -t0 : -99999 - (totalMoves - done) };
  }
  return null;
}
function getWodPB(wodName, type){
  const all = (S.hist||[]).filter(h => h.wodResult && h.wodResult.wodName === wodName && h.wodResult.type === type);
  if(!all.length) return null;
  let best = all[0].wodResult;
  for(const h of all){
    const r = h.wodResult;
    if(r.score > best.score) best = r;
  }
  return best;
}
function getAllWodPBs(){
  const map = {};
  (S.hist||[]).forEach(h => {
    if(!h.wodResult || !h.wodResult.wodName) return;
    const r = h.wodResult, k = r.type + '::' + r.wodName;
    if(!map[k] || r.score > map[k].score) map[k] = {...r, date: h.date};
  });
  return Object.values(map).sort((a,b) => new Date(b.date) - new Date(a.date));
}
function formatWodResult(r){
  if(!r) return '—';
  if(r.type === 'For Time'){
    if(!r.completed) return `${r.movesCompleted}/${r.totalMoves} mouv.`;
    const m = Math.floor(r.timeSec/60), s = r.timeSec%60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }
  if(r.type === 'AMRAP') return `${r.rounds} tour${r.rounds>1?'s':''}`;
  if(r.type === 'EMOM') return r.completed ? `✓ ${r.totalMin} min` : `${r.minutes}/${r.totalMin} min`;
  if(r.type === 'Tabata') return r.completed ? `✓ ${r.totalRounds} rounds` : `${r.rounds}/${r.totalRounds} rounds`;
  return '—';
}
function dismissPB(){ if(S._lastPB){ S._lastPB = null; saveS(); R(); } }
// v8.71 — Count-up animé pour l'écran de fin de séance
function runFinishCountups(){
  document.querySelectorAll('.finish-stat-val[data-countup]').forEach(el => {
    const target = parseFloat(el.dataset.countup) || 0;
    const fmt = el.dataset.fmt || '';
    if(target <= 0){ el.textContent = fmt==='kg'?'0 kg':fmt==='t'?'0 kg':'0'; return; }
    const start = performance.now();
    const dur = 1100;
    function tick(now){
      const t = Math.min(1, (now - start)/dur);
      const eased = 1 - Math.pow(1-t, 3);
      const v = target * eased;
      let txt;
      if(fmt === 't'){ txt = v >= 1000 ? (v/1000).toFixed(1).replace(/\.0$/,'') + ' t' : Math.round(v) + ' kg'; }
      else if(fmt === 'kg'){ txt = Math.round(v) + ' kg'; }
      else { txt = Math.round(v).toString(); }
      el.textContent = txt;
      if(t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ─── WAKE LOCK (garde l'écran allumé pendant le timer / la séance) ───
let _wakeLock = null;
async function requestWakeLock(){
  if(!("wakeLock" in navigator)) return;
  if(_wakeLock) return;
  try{
    _wakeLock = await navigator.wakeLock.request("screen");
    _wakeLock.addEventListener("release", () => { _wakeLock = null; });
  }catch(e){ /* user gesture required ou non-supporté → silencieux */ }
}
async function releaseWakeLock(){
  if(!_wakeLock) return;
  try{ await _wakeLock.release(); }catch{}
  _wakeLock = null;
}
// Re-demande quand la page redevient visible (Android relâche au lock)
document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "visible" && T.on) requestWakeLock();
});

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
  let sugWeight = Math.round((maxWeight + adj.nextAdj) / 2.5) * 2.5;
  const lastRIR = lastEx.rir;
  let rirNote = "";
  if(lastRIR !== undefined && lastRIR !== null){
    if(lastRIR <= 1) rirNote = " | RIR≤1: proche du max";
    else if(lastRIR >= 3) rirNote = " | RIR≥3: marge dispo";
  }
  // v8.72 — Mode deload : -20% charge recommandée pendant 7 jours
  if(typeof isDeloadActive === 'function' && isDeloadActive()){
    sugWeight = Math.round(sugWeight * 0.8 / 2.5) * 2.5;
    rirNote += " | 🛌 Deload -20%";
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

// ─── DELOAD (v8.72) ─── Semaine de récupération automatique sur fatigue détectée
function isDeloadActive(){
  if(!S.deload || !S.deload.active || !S.deload.startedAt) return false;
  const days = (Date.now() - new Date(S.deload.startedAt).getTime()) / 864e5;
  if(days >= 7){
    S.deload.active = false; // auto-désactivation après 7 jours
    saveS();
    return false;
  }
  return true;
}
function getDeloadDay(){
  if(!isDeloadActive()) return 0;
  return Math.min(7, Math.floor((Date.now() - new Date(S.deload.startedAt).getTime()) / 864e5) + 1);
}
function activateDeload(){
  if(!S.deload) S.deload = {};
  S.deload.active = true;
  S.deload.startedAt = new Date().toISOString();
  saveS();
  R();
}
function deactivateDeload(){
  if(S.deload){ S.deload.active = false; S.deload.startedAt = null; saveS(); R(); }
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

// ─── Planning hebdo adaptatif (v8.28, refactor v8.39) ─────────────────────
// Calcule l'état des 7 jours de la semaine courante en fonction de S.hist.
// Pour chaque jour : status ∈ {done, today, future, past_rest, today_rest, future_rest}
// + sess (push|pull|legs|core|rest) + date.
//
// v8.39 : ordre PPL dynamique. La PREMIÈRE séance affichée est celle non faite
// depuis le plus longtemps (ou jamais), Core EXCLU du tri (active recovery).
// Logique : on calcule l'ordre canonique [oldest_PPL, core, next_PPL, rest, last_PPL, rest, rest]
// → on filtre les PPL déjà faits cette semaine → on projette depuis aujourd'hui.
function computeIdealCycleDynamic(){
  // Trie les 3 PPL par date de dernière exécution croissante (jamais = ancien)
  // Source : S.hist global, pas seulement cette semaine
  const PPL = ["push", "pull", "legs"];
  const lastDone = {};
  PPL.forEach(id => {
    const h = S.hist.find(x => x.sessionId === id);
    lastDone[id] = h ? new Date(h.date).getTime() : 0;
  });
  // Plus petit timestamp = plus ancien (ou 0 si jamais fait → priorité max)
  const sorted = [...PPL].sort((a, b) => lastDone[a] - lastDone[b]);
  // Ordre canonique : oldest PPL en 1er, Core en active recovery entre les deux 1ers,
  // puis les 2 autres PPL espacés par rest days
  return [sorted[0], "core", sorted[1], "rest", sorted[2], "rest", "rest"];
}
function computeWeekPlan(){
  const now = new Date();
  const todayDow = now.getDay();             // 0 = dimanche
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1;  // 0 = lundi
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - todayIdx);
  const TRACKED = ["push", "pull", "legs", "core"];
  // Squelette 7 jours
  const days = [];
  for(let i = 0; i < 7; i++){
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({date: d, dow: i, sess: null, status: "pending"});
  }
  // Remplit les jours faits (depuis S.hist cette semaine)
  S.hist.forEach(h => {
    if(!TRACKED.includes(h.sessionId)) return;
    const hd = new Date(h.date);
    if(hd < monday) return;
    const idx = Math.floor((hd.getTime() - monday.getTime()) / 864e5);
    if(idx < 0 || idx > 6) return;
    if(!days[idx].sess){ days[idx].sess = h.sessionId; days[idx].status = "done"; }
  });
  // Past sans rien : past_rest (raté / repos passif)
  for(let i = 0; i < todayIdx; i++){
    if(days[i].status === "pending"){ days[i].sess = "rest"; days[i].status = "past_rest"; }
  }
  // v8.39 : utilise l'ordre dynamique basé sur "PPL non fait depuis le plus longtemps"
  // (Core est neutre — toujours présent dans le cycle, mais ne change pas l'ordre des PPL).
  const idealCycle = computeIdealCycleDynamic();
  // Calcule ce qu'il reste à faire — filtre les PPL déjà faits cette semaine
  // (Core et rest jamais filtrés : Core peut être refait, rest est neutre)
  const doneThisWeek = days.filter(d => d.status === "done").map(d => d.sess);
  const doneCoreThisWeek = doneThisWeek.includes("core");
  const remaining = idealCycle.filter(s => {
    if(s === "rest") return true;
    if(s === "core") return !doneCoreThisWeek;  // Core déjà fait → on l'enlève aussi
    return !doneThisWeek.includes(s);            // PPL déjà fait → on l'enlève
  });
  // Trim rests par la fin si on a trop d'items pour les jours restants
  const daysLeft = 7 - todayIdx;
  while(remaining.length > daysLeft){
    const lastRest = remaining.lastIndexOf("rest");
    if(lastRest === -1) break;
    remaining.splice(lastRest, 1);
  }
  // Si encore trop (cas extrême : tous PPL+Core restants mais 1 seul jour) : on coupe
  if(remaining.length > daysLeft) remaining.length = daysLeft;
  // Projette today + future
  for(let i = 0; i < daysLeft; i++){
    const idx = todayIdx + i;
    if(days[idx].status === "done") continue;
    const sess = i < remaining.length ? remaining[i] : "rest";
    days[idx].sess = sess;
    if(idx === todayIdx){
      days[idx].status = sess === "rest" ? "today_rest" : "today";
    } else {
      days[idx].status = sess === "rest" ? "future_rest" : "future";
    }
  }
  return days;
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

// Renvoie la liste des pathologies pour lesquelles ce WOD est marqué à risque.
// Source de vérité : champ `risks: [...]` taggé manuellement sur chaque WOD dans data.js (v8.34).
// Analyse mouvement-par-mouvement validée par les sources (McGill, Squat University, Starrett, Morrison)
// + revue PubMed sur biomécanique des exercices à risque.
// Si un WOD n'a pas de champ `risks` (cas legacy), on assume aucun risque connu (compatible).
function wodRiskPathologies(wod, pathologies){
  if(!wod || !pathologies || !pathologies.length) return [];
  const tagged = Array.isArray(wod.risks) ? wod.risks : [];
  if(!tagged.length) return [];
  return pathologies.filter(p => tagged.includes(p));
}

// Sélectionne le WOD le moins récemment utilisé pour cette session (LRU).
// Filtre d'abord les WODs incompatibles avec les pathologies actives.
// Si tous les WODs sont incompatibles, retombe sur le pool complet (mieux qu'aucun WOD).
// Exception "custom" : le WOD est choisi manuellement par l'utilisateur via S.custom.wodIdx.
function pickWOD(sessId){
  if(sessId === "custom"){
    const idx = S.custom && typeof S.custom.wodIdx === "number" ? S.custom.wodIdx : null;
    if(idx === null || !WODS.custom || !WODS.custom[idx]) return null;
    return WODS.custom[idx];
  }
  // v8.76 — Fix bug page WOD vide pour les programmes perso (sessId === "custom_program"
  // ou tout autre sessId non standard). Fallback sur WODS.custom (pool fullbody varié)
  // pour qu'il y ait toujours un WOD proposé, avec rotation LRU et filtrage pathologies.
  const fullPool = WODS[sessId] || WODS.custom;
  if(!fullPool || !fullPool.length) return fullPool ? fullPool[0] : null;
  const paths = (S.health && S.health.pathologies) || [];
  const compatible = paths.length
    ? fullPool.filter(w => wodRiskPathologies(w, paths).length === 0)
    : fullPool;
  const pool = compatible.length ? compatible : fullPool;
  const used = {};
  S.hist.filter(h => h.sessionId === sessId).forEach(h => { if(h.wodName && !used[h.wodName]) used[h.wodName] = h.date; });
  const sorted = [...pool].sort((a, b) => {
    const da = used[a.name] ? new Date(used[a.name]).getTime() : 0;
    const db = used[b.name] ? new Date(used[b.name]).getTime() : 0;
    return da - db;
  });
  return sorted[0];
}

// LRU sur les pools d'accessoires (rotation 2-4 sessions, Helms/RTS)
// v8.77 — accepte un excludeNames Set pour éviter les doublons dans la séance
function pickPoolExercise(pool, excludeNames){
  if(!pool||!pool.length)return null;
  // Filtre les exos déjà présents dans la séance (par name)
  const available = excludeNames && excludeNames.size
    ? pool.filter(e => !excludeNames.has(e.name))
    : pool;
  // Si tous filtrés (pool entièrement déjà présent), on retombe sur le pool complet pour ne pas crasher
  const effective = available.length ? available : pool;
  const used={};
  S.hist.forEach(h=>{h.exercises.forEach(ex=>{if(effective.some(p=>p.name===ex.name)&&!used[ex.name])used[ex.name]=h.date;});});
  return [...effective].sort((a,b)=>{
    const da=used[a.name]?new Date(used[a.name]).getTime():0;
    const db=used[b.name]?new Date(used[b.name]).getTime():0;
    return da-db;
  })[0];
}

// P1 #9 : récupère TOUS les exercices disponibles (compounds + tous les pools, déduplique par id)
function getAllExercises(){
  const seen = {};
  PROG.sessions.forEach(s => {
    s.compounds.forEach(e => { if(!seen[e.id]) seen[e.id] = e; });
    s.pools.forEach(p => p.exercises.forEach(e => { if(!seen[e.id]) seen[e.id] = e; }));
  });
  return Object.values(seen);
}

// P1 #9 : construit une session custom à partir des exercise IDs sélectionnés par l'utilisateur
function buildCustomSession(){
  const ids = (S.custom && S.custom.exerciseIds) || [];
  if(!ids.length) return null;
  const all = getAllExercises();
  const exercises = ids.map(id => all.find(e => e.id === id)).filter(Boolean);
  return {
    id: "custom",
    name: S.custom.name || "CUSTOM",
    color: "#8B5CF6",
    muscles: [...new Set(exercises.map(e => e.muscle))],
    compounds: [],
    pools: [],
    exercises
  };
}

// Substitue les exercices "à éviter" (level: "avoid") par leur alternative quand l'utilisateur
// a la pathologie correspondante. Conserve sets/reps/rest de l'exercice d'origine.
// Idempotent : si l'exercice résultant n'a plus de risque "avoid", il ne sera pas re-swapé.
function applyPathologySubstitutions(exercises){
  const paths = (S.health && S.health.pathologies) || [];
  if(!paths.length || typeof EXERCISE_RISKS === "undefined") return exercises;
  const allEx = getAllExercises();
  return exercises.map(ex => {
    const risks = EXERCISE_RISKS[ex.name];
    if(!risks) return ex;
    for(const p of paths){
      const r = risks[p];
      if(r && r.level === "avoid" && r.alt){
        const altEx = allEx.find(e => e.name === r.alt);
        if(altEx && altEx.name !== ex.name){
          return Object.assign({}, altEx, {
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            _substitutedFrom: ex.name,
            _substitutedFor: p
          });
        }
      }
    }
    return ex;
  });
}

// Construit une session (compounds fixes + 1 accessoire LRU par pool)
function buildSession(sessId,savedExercises){
  if(sessId === "custom"){
    const cs = buildCustomSession();
    if(cs) cs.exercises = dedupeExercises(applyPathologySubstitutions(cs.exercises));
    return cs;
  }
  const base=PROG.sessions.find(s=>s.id===sessId);if(!base)return null;
  const sess=Object.assign({},base);
  if(savedExercises&&savedExercises.length){
    const allEx=[...base.compounds,...base.pools.flatMap(p=>p.exercises)];
    const restored=savedExercises.map(sv=>allEx.find(e=>e.id===sv.id)||sv).filter(Boolean);
    sess.exercises=restored.length?restored:_buildFreshExercises(base);
  }else{
    sess.exercises=_buildFreshExercises(base);
  }
  return sess;
}
// v8.77 — Construit la liste d'exos en évitant les doublons après substitution pathologie.
// Ordre : substituer compounds d'abord → noms déjà pris → pool picks excluent ces noms.
function _buildFreshExercises(base){
  // 1. Substituer les compounds en premier (Romanian DL → Goblet Squat si L5)
  const subbedCompounds = applyPathologySubstitutions([...base.compounds]);
  const takenNames = new Set(subbedCompounds.map(e => e.name));
  // 2. Pour chaque pool, picker en excluant les noms déjà présents
  const poolPicks = base.pools.map(p => {
    const picked = pickPoolExercise(p.exercises, takenNames);
    if(picked) takenNames.add(picked.name);
    return picked;
  });
  // 3. Substituer encore une fois les pool picks (au cas où un pool pick aurait besoin d'être substitué)
  const final = applyPathologySubstitutions([...subbedCompounds, ...poolPicks].filter(Boolean));
  // 4. Dédoublonner par sécurité (par name)
  return dedupeExercises(final);
}
// v8.77 — Filet de sécurité : garde le premier de chaque name unique
function dedupeExercises(exercises){
  if(!exercises || !exercises.length) return exercises;
  const seen = new Set();
  return exercises.filter(ex => {
    if(!ex || !ex.name) return false;
    if(seen.has(ex.name)) return false;
    seen.add(ex.name);
    return true;
  });
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
