// APEX Fitness — Rendu, actions, init
// Dépend de : core.js, data.js, state.js (chargés avant)

// ─── SVG icons inline (Phase 4 polish : cohérence cross-OS, remplace les emojis) ───
// Feather/Lucide-style 24px viewBox, stroke=currentColor pour thème.
const SVG = {
  map:'<svg class="tool-chip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  barbell:'<svg class="tool-chip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="2" y1="12" x2="22" y2="12"/><line x1="5" y1="8" x2="5" y2="16"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="18"/><line x1="19" y1="8" x2="19" y2="16"/></svg>',
  sliders:'<svg class="tool-chip-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
  bulb:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  // Phase 5 polish v8.21 : emojis hors-dashboard remplacés
  trophy:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  download:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  share:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
};

// ─── Tooltip popover (Phase 4 polish : aide inline pour APRE/RIR/BMR/TDEE/1RM/Fatigue) ───
let _ttipEl = null, _ttipDismiss = null;
function showTip(el, text){
  if(_ttipEl){ _ttipEl.remove(); _ttipEl = null; if(_ttipDismiss){ document.removeEventListener('click', _ttipDismiss); _ttipDismiss = null; } }
  const t = document.createElement('div');
  t.className = 'ttip-pop';
  t.setAttribute('role','tooltip');
  t.innerHTML = text;
  document.body.appendChild(t);
  const r = el.getBoundingClientRect();
  const w = t.offsetWidth, h = t.offsetHeight;
  let x = Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width/2 - w/2));
  let y = r.bottom + 8;
  if(y + h > window.innerHeight - 8) y = r.top - h - 8;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  _ttipEl = t;
  // Dismiss on next click anywhere except the same button
  setTimeout(()=>{
    _ttipDismiss = (e)=>{
      if(e.target === el || el.contains(e.target)) return;
      if(_ttipEl){ _ttipEl.remove(); _ttipEl = null; }
      document.removeEventListener('click', _ttipDismiss);
      _ttipDismiss = null;
    };
    document.addEventListener('click', _ttipDismiss);
  }, 0);
}
// Helper pour générer un bouton ?-tooltip
function ttip(text){
  const e = text.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
  return `<button type="button" class="ttip-btn" onclick="showTip(this,'${e}')" aria-label="Explication">?</button>`;
}

// ─── RENDER ROOT (P0 #3 : wrapped in safeRender for error boundary) ───
function R(){
  const a=document.getElementById("app");
  // Garde-fou : si le disclaimer n'a pas été accepté, R() ne doit rien faire
  // (sinon sync.js qui appelle R() au sync-ready override le disclaimer)
  if(!localStorage.getItem("apex_disclaimer")) return;
  // P0 #5 : onboarding wizard intercepte le rendu tant que l'utilisateur n'est pas onboardé
  if(!localStorage.getItem("apex_onboarded")){
    a.innerHTML = safeRender(rOnboarding);
    return;
  }
  // safeRender remplace tout le contenu par un écran de récupération en cas d'erreur
  const out = safeRender(() => {
    let h="";
    if(S.view==="home")h=rHome();
    else if(S.view==="session")h=rSession();
    else if(S.view==="cardio")h=rCardio();
    else if(S.view==="core")h=rCore();
    else if(S.view==="nutrition")h=rNutrition();
    else if(S.view==="bodymap")h=rBodyMap();
    else if(S.view==="plate")h=rPlateCalc();
    else if(S.view==="achievements")h=rAchievements();
    else if(S.view==="history")h=rHist();
    else if(S.view==="settings")h=rSett();
    if(S.view!=="session")h+=`<div class="nav">${[{id:"home",l:"Accueil",i:'<path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/>'},{id:"history",l:"Historique",i:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'},{id:"settings",l:"Réglages",i:'<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>'}].map(x=>`<button class="nav-btn ${S.view===x.id?'active':''}" onclick="nav('${x.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${x.i}</svg>${x.l}</button>`).join("")}</div>`;
    return h;
  });
  a.innerHTML = out;
  // PWA install banner overlay (P0 #2)
  renderPwaInstallBanner();
  // Update floating timer display
  if(T.on){const ft=document.getElementById("floatTimer");if(ft){const r=tGet();ft.textContent=`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`;}}
}

// ─── P0 #2 : PWA install prompt ───
let _deferredInstallPrompt = null;
let _pwaDismissed = false;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  _deferredInstallPrompt = e;
  _pwaDismissed = localStorage.getItem("apex_pwa_dismissed") === "1";
  if(!_pwaDismissed && document.getElementById("app")) renderPwaInstallBanner();
});
window.addEventListener("appinstalled", () => {
  _deferredInstallPrompt = null;
  const b = document.getElementById("pwaInstall"); if(b) b.remove();
});
function renderPwaInstallBanner(){
  if(!_deferredInstallPrompt || _pwaDismissed) return;
  if(document.getElementById("pwaInstall")) return;
  const b = document.createElement("div");
  b.id = "pwaInstall";
  // Bottom-right toast on desktop; full-width bottom bar on mobile (always above tab bar).
  // Reserves body padding-bottom so it never overlays interactive content (e.g. set rows).
  b.style.cssText = "position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 76px);max-width:340px;background:var(--cd);color:var(--t1);border:1px solid var(--bd);padding:10px 14px;border-radius:12px;z-index:9998;font-size:13px;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.12);display:flex;align-items:center;gap:10px;font-family:-apple-system,'Segoe UI',sans-serif";
  b.innerHTML = `<span style="font-size:18px">📱</span><span style="flex:1">Installer APEX comme une app</span><button id="pwaInstallBtn" style="background:var(--ac);color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">Installer</button><button id="pwaDismissBtn" style="background:transparent;color:var(--t2);border:none;padding:3px 6px;font-size:18px;cursor:pointer;line-height:1;opacity:.7" aria-label="Fermer">×</button>`;
  document.body.appendChild(b);
  // Mobile: stretch to full width above tab bar
  const mq = window.matchMedia("(max-width:480px)");
  const applyMobile = () => {
    if (mq.matches) {
      b.style.right = "8px"; b.style.left = "8px"; b.style.maxWidth = "none";
    } else {
      b.style.left = ""; b.style.right = "16px"; b.style.maxWidth = "340px";
    }
  };
  applyMobile(); mq.addEventListener("change", applyMobile);
  // Reserve space so banner never overlays content. Restore on remove.
  const prevPad = document.body.style.paddingBottom;
  document.body.style.paddingBottom = "calc(env(safe-area-inset-bottom,0px) + 140px)";
  const cleanup = () => { document.body.style.paddingBottom = prevPad; mq.removeEventListener("change", applyMobile); b.remove(); };
  document.getElementById("pwaInstallBtn").onclick = async () => {
    if(!_deferredInstallPrompt) return;
    _deferredInstallPrompt.prompt();
    const choice = await _deferredInstallPrompt.userChoice;
    _deferredInstallPrompt = null;
    cleanup();
    if(choice.outcome === "dismissed"){ _pwaDismissed = true; localStorage.setItem("apex_pwa_dismissed", "1"); }
  };
  document.getElementById("pwaDismissBtn").onclick = () => {
    _pwaDismissed = true;
    localStorage.setItem("apex_pwa_dismissed", "1");
    cleanup();
  };
}

// ─── P0 #6 : PLATE CALCULATOR ───
// Calcule la combinaison optimale de disques par côté pour atteindre un poids cible
// Disques standard : 25, 20, 15, 10, 5, 2.5, 1.25 kg. Barre 20kg par défaut.
const PLATES_AVAILABLE = [25, 20, 15, 10, 5, 2.5, 1.25]; // par côté, disponibilité illimitée
function calcPlates(targetKg, barKg){
  if(targetKg < barKg) return { error: `Poids cible (${targetKg}kg) < barre (${barKg}kg)` };
  const perSide = (targetKg - barKg) / 2;
  if(perSide === 0) return { perSide: 0, plates: [], reachable: targetKg, missing: 0 };
  const plates = [];
  let remain = perSide;
  for(const p of PLATES_AVAILABLE){
    while(remain >= p - 0.001){
      plates.push(p);
      remain -= p;
    }
  }
  const reached = perSide - remain;
  return {
    perSide: perSide,
    plates: plates,
    reachable: barKg + 2 * reached,
    missing: remain > 0.01 ? remain * 2 : 0
  };
}

let _plateTarget = 60;
let _plateBar = 20;
function setPlateTarget(v){ _plateTarget = parseFloat(v) || 0; R(); }
function setPlateBar(v){ _plateBar = parseFloat(v) || 0; R(); }

function rPlateCalc(){
  const result = calcPlates(_plateTarget, _plateBar);
  // Groupe les disques identiques pour affichage
  const grouped = {};
  if(result.plates) result.plates.forEach(p => grouped[p] = (grouped[p]||0)+1);
  const platesHtml = result.error
    ? `<div style="text-align:center;padding:20px;color:var(--ac);font-weight:700">${result.error}</div>`
    : result.perSide === 0
    ? `<div style="text-align:center;padding:20px;color:var(--ok);font-weight:700;font-size:15px">Juste la barre (${_plateBar} kg)</div>`
    : `<div style="display:flex;flex-direction:column;align-items:center;gap:14px">
        <div style="font-size:13px;color:var(--mt);font-weight:600;letter-spacing:1px;text-transform:uppercase">Par côté</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${Object.entries(grouped).sort((a,b)=>b[0]-a[0]).map(([p,n]) => {
          const color = p>=20?"var(--ac)":p>=15?"#E76F51":p>=10?"#F4A261":p>=5?"var(--in)":p>=2.5?"#10b981":"var(--mt)";
          return `<div style="background:${color};color:#fff;padding:10px 16px;border-radius:10px;font-weight:900;font-size:18px;box-shadow:var(--shadow-sm)">${p} kg ${n>1?`×${n}`:""}</div>`;
        }).join("")}</div>
        ${result.missing > 0.01 ? `<div style="font-size:13px;color:var(--wa);font-weight:600;margin-top:6px">⚠️ Impossible d'atteindre exactement : ${result.reachable.toFixed(2)} kg réel (manque ${result.missing.toFixed(2)} kg)</div>` : `<div style="font-size:13px;color:var(--ok);font-weight:600;margin-top:6px">✓ ${result.perSide} kg × 2 = ${result.perSide*2} kg + ${_plateBar} kg barre = <b>${_plateTarget} kg</b></div>`}
      </div>`;
  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:6px 12px;font-size:12px" onclick="nav('home')">← Accueil</button><div style="font-size:20px;font-weight:900;letter-spacing:2px;color:var(--ac)">PLATE CALCULATOR</div><div style="width:80px"></div></div></div>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:12px;text-transform:uppercase;color:var(--mt);letter-spacing:1px;font-weight:700;margin-bottom:6px">Poids cible (kg)</div>
          <input class="inp" type="number" min="0" step="0.5" value="${_plateTarget}" onchange="setPlateTarget(this.value)" style="font-size:22px;text-align:center;padding:14px">
        </div>
        <div>
          <div style="font-size:12px;text-transform:uppercase;color:var(--mt);letter-spacing:1px;font-weight:700;margin-bottom:6px">Barre (kg)</div>
          <input class="inp" type="number" min="0" step="0.5" value="${_plateBar}" onchange="setPlateBar(this.value)" style="font-size:22px;text-align:center;padding:14px">
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
        ${[40,50,60,70,80,90,100,110,120].map(w=>`<button class="pill" onclick="setPlateTarget(${w})" style="background:${_plateTarget===w?'var(--ac)':'var(--cd2)'};color:${_plateTarget===w?'#fff':'var(--t2)'};border-color:${_plateTarget===w?'var(--ac)':'var(--bd)'}">${w} kg</button>`).join("")}
      </div>
    </div>
    <div class="card" style="padding:22px">${platesHtml}</div>
    <div class="card" style="background:var(--in10);border-color:var(--in)"><div style="font-size:13px;color:var(--t2);line-height:1.6"><b style="color:var(--in)">💡 Disques utilisés</b><br>Standard olympique : 25, 20, 15, 10, 5, 2.5, 1.25 kg.<br>Barre par défaut : 20 kg (olympique). Femme/jeune : 15 kg. EZ : 7 kg.</div></div>`;
}

// ─── STREAK BANNER ───
// Toujours affiché en haut du Home : encourageant si on est dans le rythme, alertant si on a décroché.
function rStreakBanner(){
  const info = (typeof getStreakInfo === "function") ? getStreakInfo() : null;
  if(!info) return "";
  const bg = info.status === "active" || info.status === "ok" ? "var(--ok10)" :
             info.status === "warn" ? "rgba(244,162,97,.15)" :
             info.status === "alert" || info.status === "lost" ? "var(--ac10)" : "var(--cd2)";
  const border = info.color;
  return `<div class="card" style="background:${bg};border-color:${border};border-left:4px solid ${border};padding:12px 16px;margin-top:10px"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div style="font-size:13px;color:${border};font-weight:700;line-height:1.4">${info.message}</div>${info.status === "warn" || info.status === "alert" || info.status === "lost" ? `<button class="btn" style="background:${border};border-color:${border};width:auto;padding:8px 14px;font-size:12px;flex-shrink:0" onclick="goSess('${getRecommendation().id}')">Lancer</button>` : ""}</div></div>`;
}

function rHome(){
  const today=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const ph=PHASES[S.phase],fat=getFatigue(),rec=getRecommendation();
  const recSess=PROG.sessions.find(s=>s.id===rec.id);
  const compounds=["Bench Press","Back Squat","Romanian Deadlift","OHP Debout","Pull-ups"];
  const rmCards=compounds.map(n=>{const rm=get1RM(n);return rm?`<div style="text-align:center;min-width:70px"><div style="font-size:16px;font-weight:900">${rm}<span style="font-size:12px;color:var(--mt)">kg</span></div><div style="font-size:10px;color:var(--mt);margin-top:1px">${n.length>12?n.slice(0,12)+'…':n}</div></div>`:null;}).filter(Boolean);

  return`<div class="hdr"><h1 class="logo" aria-label="APEX Fitness — Musculation L5-S1 safe">APEX</h1><div style="font-size:13px;color:var(--mt)">${today}</div></div>
  <details class="l5-banner">
    <summary><span class="l5-banner-dot"></span>Mode L5-S1 actif — règles de protection</summary>
    <div class="l5-body"><b>Obligatoire</b> : McGill Big 3 + Dead Bug<br><b>Interdit</b> : Bent-over rows, deadlift conventionnel<br><b>Modifié</b> : Burpees step-back, ceinture au squat<br><b>Alertes</b> : en temps réel sur chaque exercice sensible</div>
  </details>
  ${rStreakBanner()}
  ${S.hist.length>=4?`<div class="score-card">
    <div class="score-item"><div class="score-val" style="color:${fat.color}">${fat.score}</div><div class="score-lbl">Fatigue ${ttip("Compare ton volume 7 derniers jours à ta moyenne hebdo. <b>&gt;75</b> = surcharge, considère un deload (Sports Med Open 2024).")}</div></div>
    <div class="score-item"><div class="score-val">${S.hist.length}</div><div class="score-lbl">Séances</div></div>
    <div class="score-item"><div class="score-val">${S.hist.filter(h=>(Date.now()-new Date(h.date))<6048e5).length}</div><div class="score-lbl">7 jours</div></div>
  </div>
  <div class="card" style="padding:12px 16px"><div style="font-size:13px;color:${fat.color};font-weight:600">${fat.label}</div><div style="background:var(--bd);border-radius:4px;height:8px;margin-top:6px;overflow:hidden"><div class="fatigue-bar" style="width:${fat.score}%;background:${fat.color}"></div></div></div>`
  :`<div class="stats-row"><div class="stat-box"><div class="stat-val">${S.hist.length}</div><div class="stat-lbl">Séances</div></div><div class="stat-box"><div class="stat-val">${S.hist.filter(h=>(Date.now()-new Date(h.date))<6048e5).length}</div><div class="stat-lbl">7 jours</div></div></div>`}
  ${rmCards.length?`<div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:8px;display:flex;align-items:center">1RM Estimés (Epley) ${ttip("<b>1 Rep Max</b> estimé via la formule d Epley : W × (1 + reps/30). Précis à ±2.7 kg pour 3RM (DiStasio 2014).")}</div><div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px">${rmCards.join("")}</div></div>`:""}
  <div class="card" style="border-left:4px solid ${ph.color}"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600">Phase</div><div style="font-size:16px;font-weight:900;color:${ph.color};margin-top:2px">${ph.name}</div><div style="font-size:13px;color:var(--t2);margin-top:2px">${ph.desc} — ${ph.numSets}×${ph.reps}</div></div><div style="display:flex;gap:4px">${PHASES.map((p,i)=>`<button onclick="setPhase(${i})" style="width:24px;height:24px;border-radius:50%;border:2px solid ${p.color};background:${S.phase===i?p.color:'none'};cursor:pointer;color:${S.phase===i?'#fff':p.color};font-size:11px;font-weight:700">${i+1}</button>`).join("")}</div></div></div>
  ${recSess?`<div class="card" style="border-left:4px solid ${recSess.color};cursor:pointer" onclick="goSess('${rec.id}')"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--ok);font-weight:600;display:flex;align-items:center;gap:6px">${SVG.bulb}<span>Recommandé aujourd'hui</span></div><div style="font-size:16px;font-weight:900;color:${recSess.color};margin-top:4px">${recSess.name}</div><div style="font-size:13px;color:var(--mt);margin-top:2px">${rec.days>0?`Dernier il y a ${rec.days}j`:'Jamais fait'} — WOD: ${pickWOD(rec.id)?.name||'—'}</div></div>`:``}
  <h2 class="sec-title">Programme PPL</h2>
  <div class="home-row-3up">${PROG.sessions.map(s=>{const last=S.hist.find(h=>h.sessionId===s.id);const daysAgo=last?Math.floor((Date.now()-new Date(last.date))/864e5):null;const metaText=daysAgo===null?"Jamais":daysAgo===0?"Aujourd'hui":daysAgo===1?"Hier":`il y a ${daysAgo}j`;return`<button type="button" class="home-tile" style="border-top-color:${s.color}" onclick="goSess('${s.id}')" aria-label="Lancer ${s.name}"><div class="tile-name" style="color:${s.color}">${s.name}</div><div class="tile-meta">${metaText}</div></button>`;}).join("")}</div>
  <h2 class="sec-title">Wellness</h2>
  <div class="card sess-card sess-card-well" onclick="goCardio()"><div class="sess-inner"><div><div class="sess-name">CARDIO</div><div class="sess-meta">Course · Nage · Vélo — durée, pente, vitesse, distance, résistance</div>${(()=>{const lastC=S.hist.find(h=>h.sessionId==='cardio');return lastC?`<div class="sess-meta">Dernier : ${new Date(lastC.date).toLocaleDateString("fr-FR")} — ${lastC.cardio?.mode==='run'?'Course':lastC.cardio?.mode==='swim'?'Nage':'Vélo'}</div>`:"";})()}</div><div class="sess-icon">→</div></div></div>
  <div class="card sess-card sess-card-well" onclick="goCore()"><div class="sess-inner"><div><div class="sess-name">CORE</div><div class="sess-meta">Pallof Press + Suitcase Carry — programme 12 sem · 2×/sem · L5-S1 safe</div>${(()=>{const lastC=S.hist.find(h=>h.sessionId==='core');const wk=S.core.startDate?coreCurrentWeek():null;return lastC?`<div class="sess-meta">Dernier : ${new Date(lastC.date).toLocaleDateString("fr-FR")}${wk?` · Semaine ${wk}/12`:""}</div>`:wk?`<div class="sess-meta">Semaine ${wk}/12</div>`:`<div class="sess-meta" style="color:var(--ok)">Pas encore démarré</div>`;})()}</div><div class="sess-icon">→</div></div></div>
  <div class="card sess-card sess-card-well" onclick="nav('nutrition')"><div class="sess-inner"><div><div class="sess-name">NUTRITION</div><div class="sess-meta">${(()=>{const c=nutCalc(S.nut);return`Cible : <b style="color:var(--ok)">${c.target} kcal/j</b> · ${c.protein}g prot · ${c.fat}g lip · ${c.carbs}g glucides`;})()}</div>${S.nut.weightLog.length?`<div class="sess-meta">Dernière pesée : ${S.nut.weightLog[0].weight}kg le ${new Date(S.nut.weightLog[0].date).toLocaleDateString("fr-FR")}</div>`:`<div class="sess-meta" style="color:var(--ok)">Configurer mon plan calorique →</div>`}</div><div class="sess-icon">→</div></div></div>
  <h2 class="sec-title">Outils</h2>
  <div class="tools-chips">
    <button type="button" class="tool-chip" onclick="goBodyMap()" aria-label="Carte musculaire">${SVG.map}Carte musculaire</button>
    <button type="button" class="tool-chip" onclick="nav('plate')" aria-label="Plate calculator">${SVG.barbell}Plate calculator</button>
    ${(S.custom && S.custom.exerciseIds && S.custom.exerciseIds.length)?`<button type="button" class="tool-chip" onclick="goSess('custom')" aria-label="${esc(S.custom.name||"Custom")}">${SVG.sliders}${esc(S.custom.name||"Custom")}</button>`:""}
  </div>`;
}

function rWU(id){return(WU[id]||[]).map(w=>`<div class="wu-card"><div class="wu-top">${w.img?`<div class="wu-img"><img src="${w.img}" alt="${esc(w.name)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'"></div>`:''}<div style="flex:1"><div style="font-size:14px;font-weight:700">${w.name}</div><div style="font-size:13px;color:var(--ok);font-weight:600;margin-top:2px">${w.reps}</div>${w.notes?`<div style="font-size:13px;color:var(--t2);margin-top:3px">${w.notes}</div>`:''}<div class="wu-links"><a href="${wk(w.name)}" target="_blank" style="color:#4ecdc4;background:rgba(78,205,196,.1)">Wiki</a>${w.yt?`<a href="${w.yt}" target="_blank" style="color:#ff0000;background:rgba(255,0,0,.08)">▶ YouTube</a>`:''}</div></div></div></div>`).join("");}

// ─── BODY MAP ───
// Vue dédiée : silhouette anatomique face+dos avec heat-map par muscle, click → détail.
// Paths SVG dans anatomy.js, variantes M/F selon S.nut.sex (override via toggle).
let _selectedMuscle = null;     // session-only
let _bodyMapSex = null;         // override de sexe pour la vue ; null → utilise S.nut.sex

function getBodyMapSex(){
  return _bodyMapSex || S.nut.sex || "M";
}

// Génère le SVG pour une vue donnée (front | back) avec offset x et le sexe choisi.
function _renderAnatomyView(sex, view, xOffset, stats){
  const def = ANATOMY[sex] && ANATOMY[sex][view];
  if(!def) return "";
  const fill = m => muscleHeatColor(stats[m].daysAgo);
  const stroke = m => _selectedMuscle === m ? 'stroke="#fff" stroke-width="2"' : 'stroke="rgba(0,0,0,0.55)" stroke-width="0.7"';
  const click = m => `data-muscle="${m}" onclick="setBodyMapSelected('${m}')" style="cursor:pointer"`;
  // Helper : enrichit un path string brut <path d="..."/> avec attributs fill/stroke/click pour le muscle m
  const inject = (rawPath, m) => rawPath.replace(/<path /g, `<path fill="${fill(m)}" ${stroke(m)} ${click(m)} `);

  let musclesSVG = "";
  Object.entries(def.muscles).forEach(([m, paths]) => {
    if(Array.isArray(paths)) paths.forEach(p => { musclesSVG += inject(p, m); });
    else musclesSVG += inject(paths, m);
  });

  const label = view === "front" ? "FACE" : "DOS";
  return `<g transform="translate(${xOffset},0)">
    ${def.bg}
    ${musclesSVG}
    ${def.details}
    <text x="100" y="508" text-anchor="middle" fill="#9898a8" font-size="13" font-weight="800" letter-spacing="2">${label}</text>
  </g>`;
}

// Hotspot positions sur muscles.svg (Wikimedia).
// Calibrage pixel-perfect via analyse canvas du rendu réel :
//   silhouette FACE : 2.5%..47.7% horizontal (centre 25%, largeur 45%)
//   silhouette DOS  : 57.3%..97.5% horizontal (centre 77%, largeur 40%)
//   Gap au milieu   : ~10%
// Vertical (commun aux deux silhouettes, % de la hauteur image) :
//   tête:0-12% | épaules:12-22% | torse/bras:22-45% | hanches:45-55%
//   cuisses:50-72% | genoux:72-76% | mollets:76-92% | pieds:92-100%
const BODYMAP_HOTSPOTS = [
  // ─── FACE (centre du corps ≈ 25%) — positions pixel-perfect via scan canvas ───
  { muscle: "shoulders", left: 13, top: 16, width: 9, height: 9 },   // deltoide gauche
  { muscle: "shoulders", left: 29, top: 16, width: 9, height: 9 },   // deltoide droit
  { muscle: "chest",     left: 19, top: 22, width: 12, height: 8 },  // pectoraux centrés
  { muscle: "biceps",    left: 11, top: 27, width: 7, height: 11 },  // bras gauche
  { muscle: "biceps",    left: 33, top: 27, width: 7, height: 11 },  // bras droit
  { muscle: "core",      left: 19, top: 35, width: 12, height: 14 }, // abdomen
  { muscle: "quads",     left: 17, top: 53, width: 7, height: 18 },  // cuisse gauche
  { muscle: "quads",     left: 26, top: 53, width: 7, height: 18 },  // cuisse droite
  { muscle: "calves",    left: 18, top: 76, width: 7, height: 14 },  // mollet gauche
  { muscle: "calves",    left: 26, top: 76, width: 7, height: 14 },  // mollet droit
  // ─── DOS (centre du corps ≈ 77%) ───
  { muscle: "shoulders", left: 65, top: 16, width: 9, height: 9 },
  { muscle: "shoulders", left: 81, top: 16, width: 9, height: 9 },
  { muscle: "back",      left: 70, top: 22, width: 15, height: 22 }, // dos large
  { muscle: "triceps",   left: 66, top: 27, width: 6, height: 11 },
  { muscle: "triceps",   left: 84, top: 27, width: 6, height: 11 },
  { muscle: "hamstrings",left: 70, top: 53, width: 7, height: 18 },
  { muscle: "hamstrings",left: 78, top: 53, width: 7, height: 18 },
  { muscle: "calves",    left: 71, top: 76, width: 7, height: 14 },
  { muscle: "calves",    left: 77, top: 76, width: 7, height: 14 }
];

function rBodyMap(){
  const muscles = ["chest","shoulders","biceps","triceps","back","core","quads","hamstrings","calves"];
  const stats = {};
  muscles.forEach(m => stats[m] = getMuscleStats(m));

  const hotspotsHTML = BODYMAP_HOTSPOTS.map(h => {
    const color = muscleHeatColor(stats[h.muscle].daysAgo);
    const isSel = _selectedMuscle === h.muscle;
    return `<button class="bodymap-hotspot${isSel?' sel':''}"
      style="left:${h.left}%;top:${h.top}%;width:${h.width}%;height:${h.height}%"
      onclick="setBodyMapSelected('${h.muscle}')"
      aria-label="${MN[h.muscle]||h.muscle}"
      title="${MN[h.muscle]||h.muscle}">
      <span class="bodymap-dot" style="background:${color}"></span>
    </button>`;
  }).join("");

  const bodymap = `<div class="bodymap-container">
    <img src="muscles.svg" alt="Anatomie musculaire face et dos" loading="eager" decoding="async">
    ${hotspotsHTML}
  </div>`;

  // Detail panel
  let detail = `<div class="card" style="text-align:center;color:var(--mt);font-size:13px;padding:18px 14px;line-height:1.5">👆 Touche un muscle pour voir le détail (volume 30j, séances, dernier entraînement, 1RM)</div>`;
  if(_selectedMuscle){
    const s = stats[_selectedMuscle];
    const lastTxt = s.daysAgo === null ? "Jamais entraîné" : s.daysAgo === 0 ? "Aujourd'hui" : s.daysAgo === 1 ? "Hier" : `Il y a ${s.daysAgo} j`;
    const heatC = muscleHeatColor(s.daysAgo);
    const volTxt = s.volume30 >= 1000 ? (s.volume30/1000).toFixed(1) + " t" : s.volume30 ? Math.round(s.volume30) + " kg" : "—";
    detail = `<div class="card" style="border-left:4px solid ${heatC}">
      <div style="font-size:20px;font-weight:900;color:${heatC};margin-bottom:6px">${MN[_selectedMuscle]||_selectedMuscle}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        <div class="stat-box"><div class="stat-val">${volTxt}</div><div class="stat-lbl">Volume 30j</div></div>
        <div class="stat-box"><div class="stat-val">${s.sessions30}</div><div class="stat-lbl">Séances 30j</div></div>
        <div class="stat-box"><div class="stat-val" style="font-size:14px">${lastTxt}</div><div class="stat-lbl">Dernier</div></div>
        <div class="stat-box"><div class="stat-val">${s.max1RM ? s.max1RM + " kg" : "—"}</div><div class="stat-lbl">Best 1RM est.</div></div>
      </div>
    </div>`;
  }

  const legend = `<div class="card"><div style="font-size:12px;color:var(--t2);margin-bottom:8px;font-weight:600;letter-spacing:1px;text-transform:uppercase">Fraîcheur — couleur du muscle</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--t2)">
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#2A9D8F"></span>≤ 2 j</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#5DB8A8"></span>3-5 j</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#F4A261"></span>6-10 j</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#E76F51"></span>11-20 j</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#C0392B"></span>>20 j</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#c7c7cc"></span>jamais</span>
    </div></div>`;

  const attribution = `<div class="card" style="font-size:11px;color:var(--mt);text-align:center;padding:12px;line-height:1.5;font-weight:500">
    Illustration : <a href="https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg" target="_blank" style="color:#06b6d4">Muscles_front_and_back.svg</a> par Tomáš Kebert &amp; umimeto.org (basé sur OpenStax) ·
    <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" style="color:#06b6d4">CC BY-SA 4.0</a>
  </div>`;

  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:6px 12px;font-size:12px" onclick="nav('home')">← Accueil</button><div style="font-size:20px;font-weight:900;letter-spacing:2px;color:var(--ac)">CARTE MUSCULAIRE</div><div style="width:80px"></div></div></div>
    <div style="padding:14px 16px 4px">${bodymap}</div>
    ${detail}
    ${legend}
    ${attribution}`;
}

function setBodyMapSelected(m){ _selectedMuscle = m; R(); }
function goBodyMap(){ _selectedMuscle = null; nav("bodymap"); }

function rSession(){
  const s=S.sess;if(!s)return"";
  const ei=S.ei,ex=ei>=0&&ei<s.exercises.length?s.exercises[ei]:null;
  const isW=ei===-1,isWod=ei===s.exercises.length;
  const pct=((ei+2)/(s.exercises.length+2)*100).toFixed(0);
  const elapsed=S.t0?Math.round((Date.now()-S.t0)/6e4):0;
  const ph=PHASES[S.phase];
  const wod=pickWOD(s.id);
  let pills=`<button class="pill ${isW?'active':''}" style="${isW?'background:var(--ok);color:#fff':''}" onclick="setEi(-1)">WU</button>`;
  s.exercises.forEach((_,i)=>{pills+=`<button class="pill ${ei===i?'active':''}" style="${ei===i?`background:${s.color};color:#fff`:''}" onclick="setEi(${i})">${i+1}</button>`;});
  pills+=`<button class="pill ${isWod?'active':''}" style="${isWod?'background:var(--wa);color:#fff':''}" onclick="setEi(${s.exercises.length})">WOD</button>`;

  let content="";
  if(isW){
    content=`<div class="card"><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:var(--ok);margin-bottom:14px">ÉCHAUFFEMENT</div>${rWU(s.id)}<button class="btn" style="margin-top:16px" onclick="setEi(0)">Commencer →</button></div>`;
  } else if(ex){
    const mc=MC[ex.muscle]||s.color;const rest=ph.rest||ex.rest;const nSets=ph.numSets||ex.sets;
    const imgs=ex.imgs?`<div class="ex-imgs">${ex.imgs.map((p,i)=>`<div class="ex-img-wrap"><img src="${I}${p}" alt="${esc(ex.name)} — ${i?'position de fin':'position de départ'}" loading="lazy" decoding="async" onerror="this.parentElement.innerHTML='<div style=padding:20px;text-align:center;font-size:12px;color:var(--mt)>—</div>'"><div class="ex-img-label">${i?'Fin':'Départ'}</div></div>`).join("")}</div>`:"";
    const links=`<div class="link-row"><a class="ex-link" href="${wk(ex.name)}" target="_blank"><svg style="color:#4ecdc4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5" stroke="#fff" stroke-width="2" fill="none"/></svg>MuscleWiki</a><a class="ex-link" href="${ex.yt}" target="_blank"><svg style="color:#ff0000" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C17 2.6 12 2.6 12 2.6s-5 0-8.3.3c-.5.1-1.5.1-2.3 1-.7.7-.9 2.3-.9 2.3S.2 8.1.2 10v1.8c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 8.1.2s5 0 8.3-.3c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V10c0-1.9-.3-3.8-.3-3.8z"/><path d="M9.6 15.6V8.4l6.4 3.6z" fill="#fff"/></svg>YouTube</a></div>`;
    const coach=ex.coaching?`<div style="margin-bottom:12px">${ex.coaching.map(c=>`<div style="display:flex;gap:6px;padding:3px 0;font-size:13px;color:var(--t2)"><span style="color:var(--ok);font-weight:700">✦</span>${c}</div>`).join("")}</div>`:"";
    // P1 #8 : warnings issus de toutes les pathologies activées (en plus du l5warn historique)
    const userPaths = (S.health && S.health.pathologies) || [];
    const dynamicRisks = typeof getExerciseRisks === "function" ? getExerciseRisks(ex.name, userPaths) : [];
    const l5alert = ex.l5warn ? `<div class="l5-alert">⚡ ${ex.l5warn}</div>` : "";
    const pathAlerts = dynamicRisks.map(r => {
      const p = PATHOLOGIES[r.pathology] || { icon: "⚠️", color: "var(--wa)", short: r.pathology };
      const bg = r.level === "avoid" ? "rgba(230,57,70,.10)" : "rgba(244,162,97,.10)";
      const border = r.level === "avoid" ? "var(--ac)" : p.color;
      return `<div class="l5-alert" style="background:${bg};border-color:${border};color:${r.level==='avoid'?'var(--ac)':p.color}">${p.icon} <b>${p.short}${r.level==='avoid'?' — À ÉVITER':''} :</b> ${r.msg}${r.alt?` <i>(Alt : ${r.alt})</i>`:''}</div>`;
    }).join("");
    const sug=getSuggestion(ex.name);
    const sugHtml=sug?`<div class="suggest-line">🎯 ${sug.reason}</div>`:"";
    const sessCount=S.hist.filter(h=>(Date.now()-new Date(h.date))<36288e5).length;
    const deloadHtml=sessCount>=15&&S.phase!==2?`<div class="l5-alert" style="border-color:var(--ac);background:var(--ac10)">⚠️ ${sessCount} séances en 6 sem. sans deload — <b style="cursor:pointer;text-decoration:underline" onclick="setPhase(2)">Passer en Deload ?</b></div>`:"";
    const rm=get1RM(ex.name);
    const rmHtml=rm?`<div style="font-size:12px;color:var(--mt);text-align:center;margin-top:4px">1RM estimé: <b style="color:var(--tx)">${rm}kg</b></div>`:"";
    let sH=`<div class="sets-header"><span>Set</span><span>Kg</span><span>Reps</span><span></span></div>`;
    for(let si=0;si<nSets;si++){const l=S.log[ex.id]?.[si];sH+=`<div class="set-row"><div class="set-num ${l?'set-done':'set-empty'}">${si+1}</div><input class="inp" type="number" inputmode="decimal" placeholder="${sug?sug.weight:0}" value="${l?.weight||''}" data-e="${ex.id}" data-s="${si}" data-f="w" onchange="onInp(this)"><input class="inp" type="number" inputmode="numeric" placeholder="0" value="${l?.reps||''}" data-e="${ex.id}" data-s="${si}" data-f="r" onchange="onInp(this)"><div style="text-align:center;font-size:15px;color:${l?'var(--ok)':'var(--mt)'}">${l?'✓':'○'}</div></div>`;}
    let pr="";const prev=S.hist.find(h=>h.exercises.some(e=>e.name===ex.name));if(prev){const pe=prev.exercises.find(e=>e.name===ex.name);const b=Math.max(0,...Object.values(pe.logged||{}).map(s=>s.weight||0));if(b>0)pr=`<div class="pr-line">📊 Record: <b>${b}kg</b> — ${new Date(prev.date).toLocaleDateString("fr-FR")}</div>`;}
    content=`<div class="card" style="padding:20px">
      <div style="margin-bottom:14px"><div class="ex-name">${ex.name}<span class="phase-badge" style="background:${ph.color}22;color:${ph.color}">${ph.name} ${ph.reps}</span></div><div class="ex-sets-info">${nSets}×${ph.reps} — Repos ${rest}s</div><div class="ex-muscle-badge" style="background:${mc}22;color:${mc}">${MN[ex.muscle]}</div></div>
      ${l5alert}${pathAlerts}${deloadHtml}${imgs}${links}<div class="ex-notes">💡 ${ex.notes}</div>${coach}${sugHtml}${sH}
      <div style="margin-top:8px;margin-bottom:4px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--mt);margin-bottom:4px;font-weight:600">RIR — Reps en Réserve (optionnel)</div><div style="display:flex;gap:4px">${[0,1,2,3,4].map(r=>{const active=S.log[ex.id]?.rir===r;return`<button onclick="setRIR('${ex.id}',${r})" style="flex:1;padding:6px;border-radius:8px;border:1px solid ${active?'var(--ok)':'var(--bd)'};background:${active?'var(--ok10)':'none'};color:${active?'var(--ok)':'var(--mt)'};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${r}</button>`;}).join("")}</div><div style="font-size:11px;color:var(--mt);margin-top:3px;text-align:center">0 = failure · 1 = pouvais en faire 1 de + · 4 = facile</div></div>
      <div class="timer" id="timerbox"><div class="timer-circle"><svg viewBox="0 0 52 52" style="transform:rotate(-90deg)"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--bd)" stroke-width="3"/><circle id="tring" cx="26" cy="26" r="22" fill="none" stroke="${mc}" stroke-width="3" stroke-dasharray="${2*Math.PI*22}" stroke-dashoffset="${2*Math.PI*22}" stroke-linecap="round"/></svg><div class="timer-time" id="tdisp">${Math.floor(rest/60)}:${String(rest%60).padStart(2,"0")}</div></div><div style="flex:1"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);margin-bottom:5px;font-weight:600">⏱ ${rest}s</div><div style="display:flex;gap:6px"><button class="tbtn tbtn-go" id="tbtn" onclick="tToggle(${rest})">Start</button><button class="tbtn tbtn-reset" onclick="tReset(${rest})">Reset</button></div></div></div>
      ${pr}${rmHtml}
      <div class="ex-nav">${ei>0?`<button class="btn2" aria-label="Exercice précédent" onclick="setEi(${ei-1})">←</button>`:''}<button class="btn" onclick="setEi(${ei+1})">${ei<s.exercises.length-1?'Suivant →':'WOD →'}</button></div>
    </div>`;
  } else if(isWod&&wod){
    const isForTime=!wod.duration||wod.type==="For Time";
    const wodSec=isForTime?3600:wod.duration*60;
    const wodDir=isForTime?"up":"down";
    const wodLabel=isForTime?`${wod.type} — chrono libre (max 60min)`:`${wod.type} ${wod.duration} min — décompte`;
    const wodInit=isForTime?"0:00":`${Math.floor(wodSec/60)}:${String(wodSec%60).padStart(2,"0")}`;
    const wt=`<div class="timer" id="timerbox"><div class="timer-circle"><svg viewBox="0 0 52 52" style="transform:rotate(-90deg)"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--bd)" stroke-width="3"/><circle id="tring" cx="26" cy="26" r="22" fill="none" stroke="var(--wa)" stroke-width="3" stroke-dasharray="${2*Math.PI*22}" stroke-dashoffset="${2*Math.PI*22}" stroke-linecap="round"/></svg><div class="timer-time" id="tdisp">${wodInit}</div></div><div style="flex:1"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);margin-bottom:5px;font-weight:600">⏱ ${wodLabel}</div><div style="display:flex;gap:6px"><button class="tbtn tbtn-go" id="tbtn" onclick="tToggle(${wodSec},'${wodDir}')">Start</button><button class="tbtn tbtn-reset" onclick="tReset(${wodSec},'${wodDir}')">Reset</button></div></div></div>`;
    const wodHeaderDur=isForTime?`<span style="background:var(--wa)22;color:var(--wa);padding:2px 8px;border-radius:6px;font-size:13px;margin-left:8px">For Time</span>`:`<span style="background:var(--wa)22;color:var(--wa);padding:2px 8px;border-radius:6px;font-size:13px;margin-left:8px">${wod.duration} min</span>`;
    content=`<div class="card"><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:var(--wa);margin-bottom:4px">WOD — ${wod.type}${wodHeaderDur}</div><div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:10px">${wod.name}</div>${wt}<div style="margin-top:14px">${wod.movements.map(m=>`<div class="wod-move">${m.img?`<div class="wod-img"><img src="${m.img}" alt="${esc(m.name)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'"></div>`:''}<div style="flex:1"><div style="font-size:13px">${m.name}</div><div style="display:flex;gap:4px;margin-top:3px"><a href="${wk(m.name)}" target="_blank" style="font-size:10px;color:#4ecdc4;text-decoration:none;background:rgba(78,205,196,.1);padding:2px 6px;border-radius:4px;font-weight:600">Wiki</a>${m.yt?`<a href="${m.yt}" target="_blank" style="font-size:10px;color:#ff0000;text-decoration:none;background:rgba(255,0,0,.08);padding:2px 6px;border-radius:4px;font-weight:600">▶ Vidéo</a>`:``}</div></div></div>`).join("")}</div><div style="margin-top:16px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);margin-bottom:6px;font-weight:600">Notes</div><textarea class="inp" id="sN" placeholder="Ressenti, PR..." oninput="S.notes=this.value;saveA()">${esc(S.notes)}</textarea></div><button class="btn btn-ok" style="margin-top:14px" onclick="finish()">✓ Terminer</button></div>`;
  }
  return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" aria-label="Quitter la séance" onclick="if(confirm('Quitter ?')){S.sess=null;saveA();nav('home')}">←</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:${s.color}">${s.name}</div><div style="font-size:13px;color:var(--mt)">${elapsed}min</div></div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${s.color}"></div></div></div><div class="pills">${pills}</div>
    ${(T.on||T.done)&&ex&&!document.getElementById("timerbox")?`<div onclick="setEi(S._timerExIdx)" style="position:fixed;top:0;left:50%;transform:translateX(-50%);max-width:480px;width:100%;background:var(--cd2);border-bottom:2px solid ${T.done?'var(--ok)':'var(--ac)'};padding:8px 16px;display:flex;align-items:center;justify-content:space-between;z-index:99;cursor:pointer"><div style="font-size:13px;color:${T.done?'var(--ok)':'var(--ac)'};font-weight:700">${T.done?'✓ Timer fini !':'⏱ Timer en cours...'}</div><div style="font-size:13px;font-weight:700;font-family:monospace" id="floatTimer"></div></div>`:``}
    ${content}`;
}

// P1 #10 : ACHIEVEMENTS CARD (badges débloqués + progression)
function rAchievementsCard(){
  if(typeof computeAchievements !== "function") return "";
  const all = computeAchievements(S.hist, S);
  const earned = all.filter(a => a.earned);
  const inProgress = all.filter(a => !a.earned && a.progress > 0).sort((a,b) => b.progress - a.progress).slice(0, 3);
  const badge = (a, isEarned) => {
    const opa = isEarned ? "1" : "0.4";
    const color = isEarned ? "var(--tx)" : "var(--mt)";
    return `<div style="text-align:center;flex-shrink:0;width:78px;opacity:${opa}" title="${a.ach.desc}">
      <div style="font-size:34px;filter:${isEarned?'none':'grayscale(0.7)'};margin-bottom:3px">${a.ach.icon}</div>
      <div style="font-size:11px;font-weight:700;color:${color};line-height:1.2">${a.ach.name}</div>
      ${!isEarned ? `<div style="font-size:10px;color:var(--mt);margin-top:2px">${Math.round(a.progress*100)}%</div>` : ''}
    </div>`;
  };
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:13px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:1px;display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:14px;display:inline-block">${SVG.trophy.replace('width="18" height="18"','width="14" height="14"')}</span><span>Achievements (${earned.length}/${all.length})</span></div>
      <button class="btn2" style="padding:5px 10px;font-size:11px" onclick="nav('achievements')">Voir tout →</button>
    </div>
    ${earned.length ? `<div style="display:flex;gap:8px;overflow-x:auto;padding:4px 0">${earned.slice(-6).reverse().map(a=>badge(a,true)).join("")}</div>` : `<div style="font-size:13px;color:var(--mt);text-align:center;padding:10px">Aucun badge encore — lance ta 1re séance !</div>`}
    ${inProgress.length ? `<div style="margin-top:14px;border-top:1px solid var(--bd);padding-top:12px">
      <div style="font-size:11px;color:var(--mt);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">Bientôt débloqués</div>
      <div style="display:flex;gap:8px;overflow-x:auto;padding:4px 0">${inProgress.map(a=>badge(a,false)).join("")}</div>
    </div>` : ''}
  </div>`;
}

// Vue dédiée : tous les achievements groupés par catégorie
function rAchievements(){
  const all = computeAchievements(S.hist, S);
  const cats = {};
  all.forEach(a => {
    const c = a.ach.cat || "Autre";
    if(!cats[c]) cats[c] = [];
    cats[c].push(a);
  });
  const catLabels = { "assiduité":"Assiduité", "streak":"Régularité", "variété":"Variété", "performance":"Performance", "cardio":"Cardio", "core":"Core" };
  const earned = all.filter(a => a.earned).length;
  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:6px 12px;font-size:12px" onclick="nav('history')">← Historique</button><h1 class="page-title" style="color:var(--ac);display:inline-flex;align-items:center;gap:8px"><span style="width:20px;height:20px;display:inline-block">${SVG.trophy.replace('width="18" height="18"','width="20" height="20"')}</span><span>ACHIEVEMENTS</span></h1><div style="width:80px"></div></div></div>
    <div class="card" style="text-align:center;padding:18px"><div style="font-size:32px;font-weight:900;color:var(--ac)">${earned} / ${all.length}</div><div style="font-size:13px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-top:4px">Badges débloqués</div></div>
    ${Object.entries(cats).map(([cat, items]) => `
      <h2 class="sec-title">${catLabels[cat] || cat}</h2>
      <div class="card">${items.map(a => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--bd);opacity:${a.earned?1:0.5}">
          <div style="font-size:32px;flex-shrink:0;filter:${a.earned?'none':'grayscale(0.7)'}">${a.ach.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:800;color:${a.earned?'var(--tx)':'var(--t2)'}">${a.ach.name}</div>
            <div style="font-size:12px;color:var(--mt);margin-top:2px">${a.ach.desc}</div>
          </div>
          ${a.earned ? '<div style="color:var(--ok);font-size:22px;font-weight:900">✓</div>' : `<div style="font-size:12px;color:var(--mt);font-weight:700">${Math.round(a.progress*100)}%</div>`}
        </div>`).join("")}
      </div>
    `).join("")}`;
}

// P1 #12 : SHARE WORKOUT TO INSTAGRAM (Canvas → image carrée + Web Share API)
async function shareLastWorkout(){
  if(!S.hist.length) return alert("Aucune séance à partager !");
  const h = S.hist[0];
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  // Background dégradé
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, "#E63946");
  grad.addColorStop(1, "#264653");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);
  // Logo APEX en haut
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "900 90px -apple-system, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "10px";
  ctx.fillText("APEX FITNESS", 540, 140);
  ctx.font = "700 32px -apple-system, sans-serif";
  ctx.fillText(new Date(h.date).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}), 540, 195);
  // Carte centrale
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.roundRect ? (ctx.beginPath(), ctx.roundRect(80, 270, 920, 600, 30), ctx.fill()) : ctx.fillRect(80, 270, 920, 600);
  // Session name
  ctx.fillStyle = "#fff";
  ctx.font = "900 110px -apple-system, sans-serif";
  ctx.fillText(h.sessionName || "Séance", 540, 410);
  ctx.font = "700 36px -apple-system, sans-serif";
  ctx.fillText(`${h.duration||0} min · ${h.phase||""}`, 540, 470);
  // Top exercices (top 3 par volume)
  const exos = (h.exercises||[]).map(e => {
    const vol = Object.values(e.logged||{}).reduce((s,x) => s + (x.weight||0)*(x.reps||0), 0);
    const max = Math.max(0, ...Object.values(e.logged||{}).map(x => x.weight||0));
    return { name: e.name, vol, max };
  }).filter(e => e.vol > 0).sort((a,b) => b.vol - a.vol).slice(0, 4);
  let y = 560;
  ctx.font = "700 38px -apple-system, sans-serif";
  ctx.textAlign = "left";
  exos.forEach(e => {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(e.name.length > 22 ? e.name.slice(0,21)+"…" : e.name, 130, y);
    ctx.textAlign = "right";
    ctx.fillStyle = "#F4A261";
    ctx.fillText(`${e.max} kg`, 950, y);
    ctx.textAlign = "left";
    y += 65;
  });
  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 26px -apple-system, sans-serif";
  ctx.fillText("apexfit-da753.web.app", 540, 1020);
  // Convertit en blob et partage
  canvas.toBlob(async blob => {
    if(!blob) return alert("Erreur génération image");
    const file = new File([blob], `apex-${new Date(h.date).toISOString().slice(0,10)}.png`, { type: "image/png" });
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      try {
        await navigator.share({
          files: [file],
          title: `Ma séance ${h.sessionName}`,
          text: `Séance ${h.sessionName} de ${h.duration}min — via APEX Fitness 💪`
        });
      } catch(e) { /* user cancelled */ }
    } else {
      // Fallback : téléchargement direct
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      alert("Image téléchargée — tu peux la partager manuellement sur Instagram 📸");
    }
  }, "image/png", 0.95);
}

// P1 #11 : CALENDAR HEATMAP (GitHub-style 12 dernières semaines)
function rCalendarHeatmap(){
  // Comptabilise sessions par jour
  const byDay = {};
  S.hist.forEach(h => {
    const d = new Date(h.date); d.setHours(0,0,0,0);
    const k = d.toISOString().slice(0,10);
    byDay[k] = (byDay[k] || 0) + 1;
  });
  const today = new Date(); today.setHours(0,0,0,0);
  // 12 semaines = 84 jours
  const weeks = 12, days = weeks * 7;
  const cells = [];
  // Trouve le lundi le plus ancien dans la fenêtre
  for(let i = days - 1; i >= 0; i--){
    const d = new Date(today); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0,10);
    const count = byDay[k] || 0;
    cells.push({ date: d, count });
  }
  // Couleur selon intensité
  const color = c => c === 0 ? "var(--cd2)" : c === 1 ? "rgba(42,157,143,.45)" : c === 2 ? "rgba(42,157,143,.70)" : "var(--ok)";
  // Aligne sur grille semaines (lundi=0..dimanche=6)
  // Le premier cellule peut commencer un mardi etc, on remplit avec des cases invisibles
  const firstDow = (cells[0].date.getDay() + 6) % 7; // 0=mon..6=sun
  const padding = Array.from({length: firstDow}).map(() => null);
  const grid = [...padding, ...cells];
  // Découpe en colonnes (semaines)
  const cols = [];
  for(let i = 0; i < grid.length; i += 7) cols.push(grid.slice(i, i+7));
  const cellSize = 13, gap = 3;
  const gridHtml = cols.map((col, ci) =>
    col.map((c, ri) => {
      if(!c) return `<div style="width:${cellSize}px;height:${cellSize}px"></div>`;
      const title = `${c.date.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})} — ${c.count} séance${c.count>1?"s":""}`;
      return `<div title="${title}" style="width:${cellSize}px;height:${cellSize}px;background:${color(c.count)};border-radius:3px"></div>`;
    }).join("")
  ).join("");
  return `<div class="card">
    <div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">Activité 12 dernières semaines</div>
    <div style="display:grid;grid-template-columns:repeat(${cols.length},${cellSize}px);grid-template-rows:repeat(7,${cellSize}px);gap:${gap}px;justify-content:center">${gridHtml}</div>
    <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--mt);margin-top:10px;justify-content:flex-end">
      <span>Moins</span>
      <span style="width:11px;height:11px;background:${color(0)};border-radius:2px"></span>
      <span style="width:11px;height:11px;background:${color(1)};border-radius:2px"></span>
      <span style="width:11px;height:11px;background:${color(2)};border-radius:2px"></span>
      <span style="width:11px;height:11px;background:${color(3)};border-radius:2px"></span>
      <span>Plus</span>
    </div>
  </div>`;
}

function rHist(){
  const names=[];S.hist.forEach(h=>h.exercises.forEach(e=>{if(Object.keys(e.logged||{}).length&&!names.includes(e.name))names.push(e.name);}));
  const wv={};S.hist.forEach(h=>{const d=new Date(h.date),ws=new Date(d);ws.setDate(d.getDate()-d.getDay()+1);const k=ws.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});if(!wv[k])wv[k]={s:k,v:0};h.exercises.forEach(x=>Object.values(x.logged||{}).forEach(s=>{wv[k].v+=((s.weight||0)*(s.reps||0));}));});
  const wvData=Object.values(wv).slice(-10);
  const getExProg=(n)=>S.hist.filter(h=>h.exercises.some(e=>e.name===n)).reverse().map(h=>{const x=h.exercises.find(e=>e.name===n);const sets=Object.values(x.logged||{});return{d:new Date(h.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),kg:sets.length?Math.max(...sets.map(s=>s.weight||0)):0};}).slice(-10);

  let charts="";
  if(wvData.length>1)charts+=`<div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:8px">Volume hebdo (kg×reps)</div>${svgBar(wvData,"s","v","#E63946",300,120)}</div>`;
  if(names.length)charts+=`<div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:8px">Poids max par exercice</div><select class="inp" style="margin-bottom:8px" onchange="document.getElementById('exC').innerHTML=getExChartHTML(this.value)">${names.map(n=>`<option>${n}</option>`).join("")}</select><div id="exC">${svgLine(getExProg(names[0]),"d","kg","#457B9D",300,120)}</div></div>`;

  if(!S.hist.length)return`<div class="hdr"><h1 class="page-title">Historique</h1></div>${charts}<div class="card" style="text-align:center;color:var(--mt);padding:30px">Aucune séance 💪</div>`;
  return`<div class="hdr"><h1 class="page-title">Historique</h1></div><div style="padding:0 14px 8px;display:flex;gap:8px"><button class="btn2" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px" onclick="exportCSV()">${SVG.download}CSV (Excel)</button><button class="btn2" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px" onclick="shareLastWorkout()">${SVG.share}Partager</button></div>${rCalendarHeatmap()}${rAchievementsCard()}${charts}`+
  S.hist.map((h,hi)=>{const col=h.sessionId==='cardio'?'#06b6d4':(PROG.sessions.find(s=>s.id===h.sessionId)?.color||"var(--ac)");const di="d"+hi;
    if(h.cardio){const c=h.cardio,ic=c.mode==='run'?'🏃':c.mode==='swim'?'🏊':'🚴';const stats=c.mode==='run'?`${c.duration}min · ${c.speed}km/h · ${c.incline}% pente`:c.mode==='swim'?`${c.distance}m · ${c.duration}min`:`${c.duration}min · ${c.incline}% · rés.${c.resistance}`;return`<div class="card"><div class="hist-top"><div style="font-size:14px;font-weight:900;letter-spacing:2px;color:${col}">${ic} ${esc(h.sessionName)}</div><div style="font-size:12px;color:var(--mt)">${new Date(h.date).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})} • ${h.duration}min</div></div><div style="font-size:13px;color:var(--t2);margin-top:4px">${stats}</div>${h.notes?`<div style="font-size:13px;color:var(--mt);margin-top:5px;font-style:italic">"${esc(h.notes)}"</div>`:''}</div>`;}
    const det=h.exercises.map(x=>{const sets=Object.entries(x.logged||{});return sets.length?sets.map(([si,s])=>`<div style="display:grid;grid-template-columns:1fr 38px 38px 45px;gap:3px;font-size:12px;padding:2px 0"><span>${esc(x.name)}</span><span>${s.weight}kg</span><span>${s.reps}r</span><span style="color:var(--mt)">${(s.weight||0)*(s.reps||0)}</span></div>`).join(""):`<div style="font-size:12px;color:var(--mt)">${esc(x.name)}: —</div>`;}).join("");
    return`<div class="card"><div class="hist-top"><div style="font-size:14px;font-weight:900;letter-spacing:2px;color:${col}">${esc(h.sessionName)}${h.phase?`<span class="phase-badge" style="background:var(--cd2);color:var(--t2)">${esc(h.phase)}</span>`:''}</div><div style="font-size:12px;color:var(--mt)">${new Date(h.date).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})} • ${h.duration}min</div></div>${h.wodName?`<div style="font-size:12px;color:var(--wa);margin-bottom:4px">WOD: ${esc(h.wodName)}</div>`:''}<div class="hist-exos">${h.exercises.map(x=>{const b=Math.max(0,...Object.values(x.logged||{}).map(s=>s.weight||0));return`<div class="hist-exo">${esc(x.name)}: <b>${b}kg</b></div>`;}).join("")}</div>${h.notes?`<div style="font-size:13px;color:var(--mt);margin-top:5px;font-style:italic">"${esc(h.notes)}"</div>`:''}<button class="hist-toggle" onclick="const d=document.getElementById('${di}');d.classList.toggle('open');this.textContent=d.classList.contains('open')?'Masquer':'Détails'">Détails</button><div class="hist-detail" id="${di}">${det}</div></div>`;}).join("");
}

function rSett(){
  return`<div class="hdr"><h1 class="page-title">Réglages</h1></div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Périodisation</div>${PHASES.map((p,i)=>`<div onclick="setPhase(${i})" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;margin-bottom:6px;cursor:pointer;border:2px solid ${S.phase===i?p.color:'var(--bd)'};background:${S.phase===i?p.color+'15':'none'}"><div style="width:12px;height:12px;border-radius:50%;background:${p.color}"></div><div><div style="font-size:13px;font-weight:700;color:${p.color}">${p.name}</div><div style="font-size:13px;color:var(--t2)">${p.desc} — ${p.numSets}×${p.reps} — repos ${p.rest}s</div></div></div>`).join("")}</div>
  ${rCustomBuilderCard()}
  ${rPathologiesCard()}
  ${rSyncCard()}
  ${rNotifCard()}
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Données</div><div style="display:flex;flex-direction:column;gap:8px"><button class="btn2" onclick="exportCSV()">📊 CSV (Excel)</button><button class="btn2" onclick="doExp()">📤 JSON backup</button><button class="btn2" onclick="doImpUI()">📥 Importer</button>${S.hist.length?`<button class="btn2" style="color:var(--ac);border-color:var(--ac)" onclick="safeWipe()">🗑 Effacer (avec backup)</button>`:""}</div><div id="io"></div></div>
  <div class="card"><div style="font-size:13px;color:var(--t2);line-height:1.6"><b style="color:var(--wa)">⚠️</b> Données en localStorage + sync cloud (Firebase).<br><br><b style="color:var(--ac)">APEX FITNESS</b> v8.x — Cloud Sync<br>APRE progression (Huang 2025) • 1RM Epley+Brzycki • RIR tracker<br>Fatigue score • Back Pain Safe mode<br>Périodisation • Cardio • Core 12 sem • Nutrition</div></div>
  <div class="card" style="text-align:center;font-size:13px;color:var(--mt);padding:14px;line-height:2">
    <a href="/privacy.html" target="_blank" rel="noopener" style="color:var(--in);text-decoration:none;font-weight:600">Politique de confidentialité</a>
    &nbsp;·&nbsp;
    <a href="/terms.html" target="_blank" rel="noopener" style="color:var(--in);text-decoration:none;font-weight:600">Conditions d'utilisation</a>
    <br>
    <a href="https://github.com/latludovic3097/apex-fitness" target="_blank" rel="noopener" style="color:var(--mt);text-decoration:none;font-size:12px">Code source — GitHub ↗</a>
  </div>`;
}

// ─── P1 #9 : CUSTOM BUILDER (sélection multi-exercices pour une séance perso) ───
function rCustomBuilderCard(){
  const sel = (S.custom && S.custom.exerciseIds) || [];
  const all = typeof getAllExercises === "function" ? getAllExercises() : [];
  // Groupe par muscle
  const byMuscle = {};
  all.forEach(e => {
    if(!byMuscle[e.muscle]) byMuscle[e.muscle] = [];
    byMuscle[e.muscle].push(e);
  });
  const muscleOrder = ["chest","shoulders","back","biceps","triceps","quads","hamstrings","calves","core"];
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:6px">🎨 Programme personnalisé</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">Choisis 4-8 exercices pour ta séance "CUSTOM". Elle apparaîtra sur l'accueil. ${sel.length} sélectionné${sel.length>1?"s":""}.</div>
    <div style="margin-bottom:12px"><input class="inp" type="text" placeholder="Nom de la séance (ex: Bras intense)" value="${esc((S.custom&&S.custom.name)||"")}" oninput="setCustomName(this.value)" style="font-size:14px"></div>
    ${muscleOrder.filter(m => byMuscle[m]).map(m => `
      <details style="margin-bottom:6px;border:1px solid var(--bd);border-radius:10px;overflow:hidden">
        <summary style="padding:9px 12px;font-size:13px;font-weight:700;cursor:pointer;background:var(--cd2);color:${MC[m]}">${MN[m]} <span style="float:right;color:var(--mt);font-weight:500">${byMuscle[m].filter(e=>sel.includes(e.id)).length}/${byMuscle[m].length}</span></summary>
        <div style="padding:6px 12px">
          ${byMuscle[m].map(e => `
            <label style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--bd);font-size:13px;cursor:pointer">
              <input type="checkbox" ${sel.includes(e.id)?"checked":""} onchange="toggleCustomExercise('${e.id}')" style="width:18px;height:18px;accent-color:#8B5CF6">
              <span style="flex:1">${esc(e.name)}</span>
              <span style="font-size:11px;color:var(--mt)">${e.reps}</span>
            </label>
          `).join("")}
        </div>
      </details>
    `).join("")}
    ${sel.length>0?`<button class="btn" style="background:#8B5CF6;border-color:#8B5CF6;margin-top:12px" onclick="goSess('custom')">🚀 Lancer ${esc((S.custom&&S.custom.name)||"CUSTOM")}</button>`:""}
  </div>`;
}
function setCustomName(v){ if(!S.custom)S.custom={exerciseIds:[]}; S.custom.name = v || "CUSTOM"; saveS(); }
function toggleCustomExercise(id){
  if(!S.custom) S.custom = { name:"CUSTOM", exerciseIds:[] };
  if(!S.custom.exerciseIds) S.custom.exerciseIds = [];
  const i = S.custom.exerciseIds.indexOf(id);
  if(i>=0) S.custom.exerciseIds.splice(i,1);
  else S.custom.exerciseIds.push(id);
  saveS();
  // Pas besoin de R() ici — le checkbox change visuellement de lui-même
  // Mais on doit actualiser le compteur du <summary>
  R();
}

// ─── P1 #8 : PATHOLOGIES CARD (multi-select) ───
function rPathologiesCard(){
  const active = (S.health && S.health.pathologies) || [];
  const items = Object.entries(PATHOLOGIES).map(([k, p]) => {
    const on = active.includes(k);
    return `<button onclick="togglePathology('${k}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:11px;border:2px solid ${on?p.color:'var(--bd)'};background:${on?p.color+'15':'var(--cd)'};cursor:pointer;font-family:inherit;text-align:left;width:100%;margin-bottom:6px;transition:all .12s">
      <span style="font-size:22px">${p.icon}</span>
      <span style="flex:1;font-size:14px;font-weight:700;color:${on?p.color:'var(--tx)'}">${p.label}</span>
      <span style="font-size:18px;color:${on?p.color:'var(--mt)'};font-weight:900">${on?'✓':''}</span>
    </button>`;
  }).join("");
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:6px">🏥 Pathologies / Précautions</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">Sélectionne tes zones sensibles. L'app affichera des alertes ciblées pendant les exercices à risque + suggestions d'alternatives.</div>
    ${items}
    ${active.length===0?'<div style="font-size:12px;color:var(--mt);text-align:center;padding:8px;font-style:italic">Aucune pathologie sélectionnée — pas d\'alerte pendant les séances.</div>':''}
  </div>`;
}
function togglePathology(key){
  if(!S.health) S.health = { pathologies: [] };
  if(!S.health.pathologies) S.health.pathologies = [];
  const i = S.health.pathologies.indexOf(key);
  if(i >= 0) S.health.pathologies.splice(i, 1);
  else S.health.pathologies.push(key);
  saveS();
  R();
}

// ─── CLOUD SYNC CARD ───
function rSyncCard(){
  if(!window.apexSync){
    return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">☁️ Cloud Sync</div>
      <div style="font-size:13px;color:var(--mt)">Chargement du module sync…</div></div>`;
  }
  if(!window.apexSync.isConfigured()){
    return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">☁️ Cloud Sync</div>
      <div style="font-size:13px;color:var(--t2);line-height:1.6">
        Sync cloud non activée. Pour synchroniser ton historique entre tes appareils (gratuit, via Firebase) :
        <br><br>1. Crée un projet sur <a href="https://console.firebase.google.com" target="_blank" style="color:#4ecdc4">console.firebase.google.com</a>
        <br>2. Édite <code style="background:var(--cd2);padding:2px 6px;border-radius:4px;font-size:12px">firebase-config.js</code> avec tes credentials
        <br>3. Cf. <a href="FIREBASE-SETUP.md" target="_blank" style="color:#4ecdc4">FIREBASE-SETUP.md</a> pour le détail
      </div>
    </div>`;
  }
  const user = window.apexSync.getUser();
  if(!user){
    return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">☁️ Cloud Sync</div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:14px;line-height:1.6">Connecte-toi pour synchroniser ton historique entre tous tes appareils. Tes données restent privées (toi seul peux y accéder).</div>
      <button class="btn" onclick="syncSignIn()" style="background:#4285F4;border-color:#4285F4">🔐 Se connecter avec Google</button>
    </div>`;
  }
  const status = (typeof getSyncStatus === "function") ? getSyncStatus() : "idle";
  const statusLabels = {
    idle: "Prêt",
    syncing: "🔄 Synchronisation en cours…",
    synced: "✅ Synchronisé",
    error: "⚠️ Erreur de sync (réessai au prochain enregistrement)",
    offline: "📡 Hors-ligne (les changements seront sync au retour)"
  };
  const statusColors = {idle:"var(--mt)", syncing:"#457B9D", synced:"var(--ok)", error:"var(--ac)", offline:"var(--wa)"};
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">☁️ Cloud Sync</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:6px">Connecté en tant que <b style="color:var(--tx)">${esc(user.email||"")}</b></div>
    <div style="font-size:13px;color:${statusColors[status]||"var(--mt)"};margin-bottom:14px;font-weight:600">${statusLabels[status]||status}</div>
    <div style="font-size:12px;color:var(--mt);margin-bottom:14px;line-height:1.5">Push automatique 2s après chaque modif. Sécurisé par Firestore Security Rules.</div>
    <button class="btn2" onclick="syncSignOut()">Se déconnecter</button>
  </div>`;
}

// ─── NOTIFICATIONS CARD ───
function rNotifCard(){
  const support = typeof notifPermissionState === "function" ? notifPermissionState() : "unsupported";
  if(support === "unsupported"){
    return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">🔔 Rappels</div>
      <div style="font-size:13px;color:var(--mt)">Ton navigateur ne supporte pas les notifications.</div></div>`;
  }
  const enabled = isNotifEnabled();
  const perm = support; // "default" | "granted" | "denied"
  let body = "";
  if(perm === "denied"){
    body = `<div style="font-size:13px;color:var(--ac);line-height:1.5;margin-bottom:8px">⚠️ Notifications bloquées dans le navigateur.</div>
      <div style="font-size:12px;color:var(--mt);line-height:1.5">Pour les ré-activer : icône 🔒 à gauche de l'URL → "Notifications" → "Autoriser" → recharger.</div>`;
  } else if(perm === "default"){
    body = `<div style="font-size:13px;color:var(--t2);margin-bottom:14px;line-height:1.5">Reçois un rappel discret si tu n'as pas fait de séance depuis quelques jours. Une seule notif maximum par 24h, jamais de spam.</div>
      <button class="btn" onclick="enableNotif()" style="background:#457B9D;border-color:#457B9D">🔔 Activer les rappels</button>`;
  } else {
    // granted
    body = `<div style="font-size:13px;color:var(--t2);margin-bottom:8px">Permission accordée par le navigateur.</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0">
        <span style="font-size:13px;color:var(--tx);font-weight:600">Rappels après ≥3 jours sans séance</span>
        <button onclick="toggleNotif()" style="background:${enabled?'var(--ok)':'var(--cd2)'};border:1px solid ${enabled?'var(--ok)':'var(--bd)'};border-radius:14px;width:48px;height:26px;cursor:pointer;position:relative;padding:0;font-family:inherit"><div style="position:absolute;top:2px;${enabled?'right:2px':'left:2px'};width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s"></div></button>
      </div>
      <button class="btn2" onclick="testNotif()" style="margin-top:6px">Tester une notif</button>`;
  }
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">🔔 Rappels</div>${body}</div>`;
}

async function enableNotif(){
  const result = await requestNotifPermission();
  if(result === "granted"){ setNotifEnabled(true); R(); }
  else if(result === "denied") alert("Permission refusée. Tu peux la ré-activer dans les paramètres du navigateur.");
}
function toggleNotif(){ setNotifEnabled(!isNotifEnabled()); R(); }
function testNotif(){
  const ok = showLocalNotif("APEX Fitness 💪", "Test : c'est bien toi ! Les rappels fonctionneront comme ça.");
  if(!ok) alert("Notification non envoyée. Vérifie la permission dans les réglages du navigateur.");
}

function syncSignIn(){
  if(!window.apexSync) return alert("Module sync pas chargé");
  window.apexSync.signIn().then(()=>{
    if(typeof pullAndMergeFromCloud === "function") pullAndMergeFromCloud();
  }).catch(e=>{
    // Erreurs UX silencieuses (user a fermé la popup ou cliqué 2 fois) — pas de spam d'alerte
    const silentCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/popup-blocked"];
    if(silentCodes.includes(e.code)) return;
    alert("Connexion échouée : "+(e.message||e.code||e));
  });
}
function syncSignOut(){
  if(!window.apexSync) return;
  window.apexSync.signOut().then(()=>R());
}

// Repaint dès qu'un changement d'auth survient
function _initApexSyncHooks(){
  if(!window.apexSync) return;
  window.apexSync.onAuthChange(user=>{
    if(user && typeof pullAndMergeFromCloud === "function") pullAndMergeFromCloud();
    R();
  });
}
if(window.apexSync) _initApexSyncHooks();
else document.addEventListener("apex:sync-ready", _initApexSyncHooks, {once:true});

// ─── CARDIO ───
function setCardio(k,v){S.cardio[k]=v;saveA();}
function setCardioMode(m){S.cardio.mode=m;R();}
function rCardio(){
  const c=S.cardio,el=Date.now()-(S._cardioT0||Date.now());
  const modes=[{id:"run",l:"Course",ic:"🏃"},{id:"swim",l:"Nage",ic:"🏊"},{id:"bike",l:"Vélo",ic:"🚴"}];
  const modeTabs=modes.map(m=>`<button onclick="setCardioMode('${m.id}')" style="flex:1;padding:12px 8px;border-radius:10px;border:2px solid ${c.mode===m.id?'#06b6d4':'var(--bd)'};background:${c.mode===m.id?'rgba(6,182,212,.15)':'none'};color:${c.mode===m.id?'#06b6d4':'var(--t2)'};font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">${m.ic} ${m.l}</button>`).join("");
  const fieldRow=(lbl,k,v,unit,step,min,max)=>`<div style="margin-bottom:14px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:4px">${lbl}${unit?` (${unit})`:""}</div><input class="inp" type="number" step="${step||1}" min="${min||0}"${max?` max="${max}"`:""} value="${v}" onchange="setCardio('${k}',parseFloat(this.value)||0)"></div>`;
  let fields="";
  if(c.mode==="run"){
    fields=fieldRow("Durée","duration",c.duration,"min",1,1)+fieldRow("Vitesse","speed",c.speed,"km/h",0.1,0)+fieldRow("Inclinaison / pente","incline",c.incline,"%",0.5,0,30);
  } else if(c.mode==="swim"){
    fields=fieldRow("Distance","distance",c.distance,"m",50,0)+fieldRow("Durée","duration",c.duration,"min",1,1);
  } else {
    fields=fieldRow("Durée","duration",c.duration,"min",1,1)+fieldRow("Pente / inclinaison","incline",c.incline,"%",0.5,0,30)+fieldRow("Résistance","resistance",c.resistance,"1-20",1,1,20);
  }
  let derived="";
  if(c.mode==="run"&&c.duration&&c.speed){const km=(c.speed*c.duration/60).toFixed(2);const pace=c.speed>0?(60/c.speed):0;const pMin=Math.floor(pace),pSec=Math.round((pace-pMin)*60);derived=`<div style="display:flex;gap:8px;margin-top:4px"><div class="stat-box"><div class="stat-val">${km}</div><div class="stat-lbl">km</div></div><div class="stat-box"><div class="stat-val">${pMin}:${String(pSec).padStart(2,"0")}</div><div class="stat-lbl">min/km</div></div></div>`;}
  else if(c.mode==="swim"&&c.duration&&c.distance){const pace=c.duration*60/(c.distance/100);const pM=Math.floor(pace/60),pS=Math.round(pace%60);derived=`<div style="display:flex;gap:8px;margin-top:4px"><div class="stat-box"><div class="stat-val">${pM}:${String(pS).padStart(2,"0")}</div><div class="stat-lbl">/100m</div></div><div class="stat-box"><div class="stat-val">${(c.distance/1000).toFixed(2)}</div><div class="stat-lbl">km</div></div></div>`;}
  return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" aria-label="Retour à l'accueil" onclick="if(confirm('Quitter ?')){nav('home')}">←</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#06b6d4">CARDIO</div><div style="font-size:13px;color:var(--mt)">${Math.round(el/6e4)}min</div></div></div>
  <div class="card"><div style="display:flex;gap:6px;margin-bottom:14px">${modeTabs}</div>${fields}${derived}<div style="margin-top:10px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:4px">Notes</div><textarea class="inp" placeholder="Ressenti, météo, FC moyenne…" oninput="setCardio('notes',this.value)">${esc(c.notes||"")}</textarea></div><button class="btn btn-ok" style="margin-top:14px" onclick="finishCardio()">✓ Enregistrer</button></div>
  <div class="card"><div style="font-size:13px;color:var(--t2);line-height:1.5"><b style="color:#06b6d4">💡 Zones FC (220-âge)</b><br>Z2 endurance (60-70%) · Z3 tempo (70-80%) · Z4 seuil (80-90%) · Z5 VO2max (90-100%)<br><br><b style="color:#06b6d4">Pyramide polarisée</b> : 80% Z2 · 10% Z3 · 10% Z4-5 (Seiler 2010)</div></div>`;
}

// ─── CORE ───
function rCore(){
  if(!S.core.startDate){
    return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" onclick="nav('home')">←</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#a855f7">CORE HEAVY</div><div></div></div></div>
    <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#a855f7">Programme 12 semaines — L5-S1 safe</div>
    <div style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:14px">2 exercices, 2 séances/semaine, ~12 min en fin de séance Push/Pull/Legs.<br><br><b>1. Cable Pallof Press</b> — anti-rotation, charge progressive 25→55kg<br><b>2. Heavy Suitcase Carry</b> — anti-flexion latérale, charge 22→44kg/main<br><br>Validés McGill / Behm / Escamilla. Aucun exercice en flexion lombaire chargée (sit-up, crunch, russian twist exclus).</div>
    <button class="btn" style="background:#a855f7;border-color:#a855f7" onclick="coreStart()">🚀 Démarrer le programme (semaine 1)</button>
    </div>
    <div class="card" style="background:rgba(168,85,247,.1);border-color:#a855f7"><div style="font-size:13px;font-weight:700;color:#a855f7;margin-bottom:6px">⚡ Critères pour stopper / réduire</div><div style="font-size:13px;color:var(--t2);line-height:1.6">• Sciatique (irradiation jambe) → STOP, repos 5j<br>• Douleur lombaire >24h → -20% charge la semaine suivante<br>• Perte de neutralité bassin/épaules → trop lourd</div></div>`;
  }
  const wk=coreCurrentWeek(),sw=coreSessionsThisWeek(),el=S.core.coreT0?Math.round((Date.now()-S.core.coreT0)/6e4):0;
  const ei=S.core.ei||0,exs=CORE_PROGRAM.exercises,ex=exs[ei],t=ex.prog[wk-1];
  const log=S.core.coreLog[ex.id]||{};
  const isCarry=ex.id==="suitcase";
  const sH=Array.from({length:t.s}).map((_,si)=>{const l=log[si]||{};
    const wF=`<input class="inp" type="number" inputmode="decimal" step="0.5" placeholder="${t.w}" value="${l.weight||''}" onchange="coreLog('${ex.id}',${si},'weight',parseFloat(this.value)||0)">`;
    const rF=isCarry?`<input class="inp" type="number" inputmode="numeric" placeholder="${t.d}m" value="${l.reps||''}" onchange="coreLog('${ex.id}',${si},'reps',parseInt(this.value)||0)">`:`<input class="inp" type="number" inputmode="numeric" placeholder="${t.r}/côté" value="${l.reps||''}" onchange="coreLog('${ex.id}',${si},'reps',parseInt(this.value)||0)">`;
    return`<div class="set-row"><div class="set-num ${l.weight?'set-done':'set-empty'}">${si+1}</div>${wF}${rF}<div style="text-align:center;font-size:15px;color:${l.weight?'var(--ok)':'var(--mt)'}">${l.weight?'✓':'○'}</div></div>`;
  }).join("");
  const targetLine=isCarry?`${t.s}× ${t.d}m × ${t.w}kg / main`:`${t.s}× ${t.r}/côté × ${t.w}kg (tenue ${t.h}s)`;
  return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" aria-label="Retour à l'accueil" onclick="if(confirm('Quitter ?')){nav('home')}">←</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#a855f7">CORE — S${wk}</div><div style="font-size:13px;color:var(--mt)">${el}min · ${sw}/2 cette sem.</div></div><div class="prog-bar"><div class="prog-fill" style="width:${(wk/12)*100}%;background:#a855f7"></div></div></div>
  <div class="pills">${exs.map((e,i)=>`<button class="pill ${ei===i?'active':''}" style="${ei===i?`background:#a855f7;color:#fff`:''}" onclick="coreSetEi(${i})">${i+1}. ${e.name.split(' ').slice(-1)[0]}</button>`).join('')}</div>
  <div class="card" style="padding:20px"><div class="ex-name">${ex.name}<span class="phase-badge" style="background:rgba(168,85,247,.15);color:#a855f7">Sem ${wk}</span></div>
  <div class="ex-sets-info">${targetLine}</div><div class="ex-muscle-badge" style="background:rgba(168,85,247,.15);color:#a855f7">${ex.muscle}</div>
  <a href="${ex.yt}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#ff0000;color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;margin:10px 0"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C17 2.6 12 2.6 12 2.6s-5 0-8.3.3c-.5.1-1.5.1-2.3 1-.7.7-.9 2.3-.9 2.3S.2 8.1.2 10v1.8c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 8.1.2s5 0 8.3-.3c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V10c0-1.9-.3-3.8-.3-3.8z"/><path d="M9.6 15.6V8.4l6.4 3.6z" fill="#fff"/></svg>▶ Regarder la démo vidéo (recommandé avant chaque séance)</a>
  <div style="text-align:center;font-size:12px;color:var(--mt);margin-top:-6px;margin-bottom:8px"><a href="${ex.mw}" target="_blank" style="color:#4ecdc4">↗ Recherche technique sur Google</a></div>
  ${ex.coaching.map(c=>`<div style="display:flex;gap:6px;padding:3px 0;font-size:13px;color:var(--t2)"><span style="color:#a855f7;font-weight:700">✦</span>${c}</div>`).join("")}
  <div class="ex-notes" style="margin-top:8px">💡 ${ex.notes}</div>
  <div class="sets-header"><span>Set</span><span>Kg</span><span>${isCarry?'Mètres':'Reps'}</span><span></span></div>${sH}
  <div class="ex-nav">${ei>0?`<button class="btn2" aria-label="Exercice précédent" onclick="coreSetEi(${ei-1})">←</button>`:'<div></div>'}${ei<exs.length-1?`<button class="btn" style="background:#a855f7;border-color:#a855f7" onclick="coreSetEi(${ei+1})">Suivant →</button>`:`<button class="btn btn-ok" onclick="finishCore()">✓ Terminer</button>`}</div>
  </div>
  <div class="card" style="padding:12px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:6px">Notes séance</div><textarea class="inp" placeholder="Ressenti, douleur lombaire, qualité d'exécution…" oninput="S.core.coreNotes=this.value;saveS()">${esc(S.core.coreNotes||"")}</textarea></div>`;
}
function coreStart(){S.core.startDate=new Date().toISOString();S.core.coreLog={};S.core.ei=0;S.core.coreT0=Date.now();S.view="core";saveS();R();}
function goCore(){if(!S.core.startDate){S.view="core";R();return;}S.core.coreT0=Date.now();S.core.coreLog={};S.core.coreNotes="";S.core.ei=0;S.view="core";saveS();R();}
function coreSetEi(i){S.core.ei=i;saveS();R();}
function coreLog(eid,si,f,v){if(!S.core.coreLog[eid])S.core.coreLog[eid]={};if(!S.core.coreLog[eid][si])S.core.coreLog[eid][si]={};S.core.coreLog[eid][si][f]=v;saveS();R();}
function finishCore(){const wk=coreCurrentWeek(),dur=Math.round((Date.now()-(S.core.coreT0||Date.now()))/6e4);S.hist.unshift({id:""+Date.now(),sessionId:"core",sessionName:"CORE Heavy",phase:"S"+wk,wodName:"",date:new Date().toISOString(),duration:dur,exercises:CORE_PROGRAM.exercises.map(e=>({id:e.id,name:e.name,muscle:e.muscle,logged:S.core.coreLog[e.id]||{}})),notes:S.core.coreNotes||"",coreWeek:wk});S.core.coreLog={};S.core.coreNotes="";S.core.coreT0=null;S.core.ei=0;S.view="home";saveS();R();}

// ─── NUTRITION ───
function nutSet(k,v){S.nut[k]=v;saveS();R();}
function nutLogWeight(){const raw=(document.getElementById("nutW").value||"").trim().replace(",",".");const w=parseFloat(raw);if(!w||w<30||w>250){alert("Saisis un poids valide entre 30 et 250 kg (ex: 75.4 ou 75,4)");return;}S.nut.weightLog.unshift({date:new Date().toISOString(),weight:w});S.nut.weight=w;saveS();R();}
function nutDelWeight(i){if(confirm("Supprimer cette pesée ?")){S.nut.weightLog.splice(i,1);saveS();R();}}
function rNutrition(){
  const n=S.nut,c=nutCalc(n);
  const actLabels={1.2:"Sédentaire",1.375:"Léger (1-3×/sem)",1.55:"Modéré (3-5×/sem)",1.725:"Élevé (6-7×/sem)",1.9:"Athlète"};
  const goalLabels={"-500":"Sèche agressive (-500 kcal)","-400":"Sèche (-400 kcal)","-300":"Sèche soft (-300 kcal)","0":"Maintien","250":"Prise de masse soft (+250)","500":"Prise de masse (+500)"};
  const wlData=[...n.weightLog].reverse().slice(-15).map(w=>({d:new Date(w.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),kg:w.weight}));
  const chart=wlData.length>1?svgLine(wlData,"d","kg","#10b981",300,120):"";
  const macroPct=c.target>0?{p:Math.round(c.protein*4/c.target*100),f:Math.round(c.fat*9/c.target*100),cb:Math.round(c.carbs*4/c.target*100)}:{p:0,f:0,cb:0};
  return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" onclick="nav('home')">← Accueil</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#10b981">NUTRITION</div><div style="font-size:13px;color:var(--mt)">Mifflin-St Jeor</div></div></div>
  <div class="card" style="border-left:4px solid #10b981;padding:18px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600">🎯 Cible journalière</div><div style="font-size:32px;font-weight:900;color:#10b981;margin:4px 0">${c.target}<span style="font-size:14px;color:var(--mt)"> kcal</span></div><div style="font-size:13px;color:var(--t2)">BMR ${c.bmr} · TDEE ${c.tdee} · ${c.deficit>=0?'+':''}${c.deficit} kcal/j → ${c.weeklyChange} kg/sem</div></div>
  <div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:10px">Macros (${n.proteinPerKg}g prot/kg · ${n.fatPerKg}g lipides/kg)</div>
  <div style="display:flex;gap:8px;margin-bottom:10px"><div class="stat-box" style="background:rgba(239,68,68,.1)"><div class="stat-val" style="color:#ef4444">${c.protein}g</div><div class="stat-lbl">Protéines · ${macroPct.p}%</div></div><div class="stat-box" style="background:rgba(245,158,11,.1)"><div class="stat-val" style="color:#f59e0b">${c.carbs}g</div><div class="stat-lbl">Glucides · ${macroPct.cb}%</div></div><div class="stat-box" style="background:rgba(168,85,247,.1)"><div class="stat-val" style="color:#a855f7">${c.fat}g</div><div class="stat-lbl">Lipides · ${macroPct.f}%</div></div></div>
  <div style="font-size:12px;color:var(--mt);line-height:1.5">Protéines = ${n.proteinPerKg}×${n.weight}=${c.protein}g · Lipides = ${n.fatPerKg}×${n.weight}=${c.fat}g · Glucides = reste des kcal</div></div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Mes paramètres</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">Poids (kg)</div><input class="inp" type="number" step="0.1" min="30" max="250" value="${n.weight}" onchange="nutSet('weight',parseFloat(this.value)||0)"></div>
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">Taille (cm)</div><input class="inp" type="number" step="1" min="120" max="220" value="${n.height}" onchange="nutSet('height',parseInt(this.value)||0)"></div>
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">Âge</div><input class="inp" type="number" step="1" min="14" max="100" value="${n.age}" onchange="nutSet('age',parseInt(this.value)||0)"></div>
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">Sexe</div><div style="display:flex;gap:6px"><button onclick="nutSet('sex','M')" style="flex:1;padding:8px;border-radius:8px;border:1px solid ${n.sex==='M'?'#10b981':'var(--bd)'};background:${n.sex==='M'?'rgba(16,185,129,.15)':'none'};color:${n.sex==='M'?'#10b981':'var(--mt)'};font-weight:700;font-family:inherit;cursor:pointer">Homme</button><button onclick="nutSet('sex','F')" style="flex:1;padding:8px;border-radius:8px;border:1px solid ${n.sex==='F'?'#10b981':'var(--bd)'};background:${n.sex==='F'?'rgba(16,185,129,.15)':'none'};color:${n.sex==='F'?'#10b981':'var(--mt)'};font-weight:700;font-family:inherit;cursor:pointer">Femme</button></div></div>
  </div>
  <div style="margin-top:14px"><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">Activité</div><select class="inp" onchange="nutSet('activity',parseFloat(this.value))">${Object.entries(actLabels).map(([k,v])=>`<option value="${k}" ${parseFloat(k)===n.activity?'selected':''}>${v} (×${k})</option>`).join("")}</select></div>
  <div style="margin-top:10px"><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">Objectif</div><select class="inp" onchange="nutSet('goal',parseInt(this.value))">${Object.entries(goalLabels).map(([k,v])=>`<option value="${k}" ${parseInt(k)===n.goal?'selected':''}>${v}</option>`).join("")}</select></div>
  </div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:10px">Suivi du poids</div>
  <div style="margin-bottom:10px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:6px">Pesée du jour (kg) — virgule ou point acceptés</div><input class="inp" id="nutW" type="text" inputmode="decimal" pattern="[0-9]+([.,][0-9]+)?" placeholder="ex: 75,4" style="width:100%;font-size:18px;text-align:center;padding:14px;letter-spacing:1px" autocomplete="off"><button class="btn" style="background:#10b981;border-color:#10b981;width:100%;margin-top:8px;padding:12px" onclick="nutLogWeight()">+ Enregistrer ma pesée</button></div>
  ${chart?`<div style="margin-bottom:10px">${chart}</div>`:""}
  ${n.weightLog.length?n.weightLog.slice(0,8).map((w,i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:14px"><span style="color:var(--t2)">${new Date(w.date).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})}</span><span style="font-weight:700">${w.weight} kg</span><button onclick="nutDelWeight(${i})" aria-label="Supprimer cette pesée" style="background:none;border:none;color:var(--mt);cursor:pointer;font-size:14px">×</button></div>`).join(""):'<div style="text-align:center;color:var(--mt);font-size:13px;padding:20px">Aucune pesée enregistrée</div>'}
  </div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:6px">🍽 Aliments riches en protéines</div>
  <div style="font-size:13px;color:var(--mt);margin-bottom:14px">Cible : <b style="color:#10b981">${c.protein} g de protéines/jour</b> · Sources USDA / Ciqual ANSES · Tri par densité décroissante.</div>
  ${PROTEINS_DB.map(cat=>`<details style="margin-bottom:8px;border:1px solid var(--bd);border-radius:10px;overflow:hidden"><summary style="padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer;background:var(--cd2);color:${cat.color}">${cat.cat} <span style="float:right;font-size:13px;color:var(--mt);font-weight:400">${cat.items.length} aliments</span></summary><div style="padding:8px 12px">${cat.items.map(it=>{const ratio=it.p100>=20?"★★★":it.p100>=10?"★★":"★";return`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bd);font-size:14px"><div style="flex:1;min-width:0"><div style="font-weight:600;color:var(--tx)">${it.n}</div><div style="font-size:12px;color:var(--mt);margin-top:2px">${it.pt} · ${it.p100}g/100g <span style="color:${cat.color}">${ratio}</span></div></div><div style="font-size:15px;font-weight:900;color:${cat.color};white-space:nowrap;margin-left:10px">${it.p}<span style="font-size:12px;color:var(--mt);font-weight:400"> g</span></div></div>`;}).join("")}</div></details>`).join("")}
  <div style="font-size:12px;color:var(--mt);margin-top:10px;line-height:1.5"><b>Lecture</b> : portion typique → protéines apportées · densité g/100g · ★ = densité (★★★ ≥20g/100g, ★★ ≥10g, ★ <10g)</div>
  </div>
  <div class="card" style="background:rgba(16,185,129,.08);border-color:#10b981"><div style="font-size:13px;color:var(--t2);line-height:1.6"><b style="color:#10b981">📚 Référence Mifflin-St Jeor (1990)</b><br>BMR (H) = 10×kg + 6.25×cm − 5×âge + 5<br>BMR (F) = 10×kg + 6.25×cm − 5×âge − 161<br>TDEE = BMR × facteur d'activité<br><br><b style="color:#10b981">Recommandations</b><br>• Protéines 2g/kg : préserve le muscle en déficit (Helms 2014)<br>• Lipides ≥0.8g/kg : santé hormonale<br>• Glucides : remplissent le reste<br>• Pesée hebdo à jeun, moyenne sur 7j</div></div>`;
}

// ─── ACTIONS ───
function nav(v){S.view=v;if(v!=="session")tStop();R();}
function goSess(id){S.sess=buildSession(id);S.ei=-1;S.log={};S.notes="";S.t0=Date.now();S.view="session";saveA();R();}
function goCardio(){S._cardioT0=Date.now();S.view="cardio";R();}
function finishCardio(){const c=S.cardio,m=c.mode,label=m==='run'?'Course':m==='swim'?'Nage':'Vélo',dur=c.duration||Math.round((Date.now()-(S._cardioT0||Date.now()))/6e4);const params=m==='run'?{duration:dur,speed:c.speed,incline:c.incline}:m==='swim'?{distance:c.distance,duration:dur}:{duration:dur,incline:c.incline,resistance:c.resistance};S.hist.unshift({id:""+Date.now(),sessionId:"cardio",sessionName:"CARDIO — "+label,phase:"",wodName:"",date:new Date().toISOString(),duration:dur,exercises:[],cardio:{mode:m,...params},notes:c.notes||""});S.cardio.notes="";S.view="home";saveS();saveA();R();}
function setEi(i){S.ei=i;saveA();R();}
function setPhase(i){S.phase=i;saveS();R();}
function setRIR(eid,rir){if(!S.log[eid])S.log[eid]={};S.log[eid].rir=rir;saveA();R();}
function onInp(el){const e=el.dataset.e,si=parseInt(el.dataset.s),f=el.dataset.f;if(!S.log[e])S.log[e]={};const p=S.log[e][si]||{weight:0,reps:0};if(f==="w")p.weight=parseFloat(el.value)||0;else p.reps=parseInt(el.value)||0;S.log[e][si]=p;saveA();const row=el.closest('.set-row');if(row){const n=row.querySelector('.set-num');const c=row.querySelector('div:last-child');if(n)n.className='set-num set-done';if(c){c.style.color='var(--ok)';c.textContent='✓';}}}
function finish(){const s=S.sess,ph=PHASES[S.phase],wod=pickWOD(s.id);S.hist.unshift({id:""+Date.now(),sessionId:s.id,sessionName:s.name,phase:ph.name,wodName:wod?.name||"",date:new Date().toISOString(),duration:Math.round((Date.now()-S.t0)/6e4),exercises:s.exercises.map(x=>({id:x.id,name:x.name,sets:x.sets,reps:x.reps,muscle:x.muscle,logged:S.log[x.id]||{},rir:S.log[x.id]?.rir})),notes:S.notes});S.sess=null;saveS();saveA();S.view="home";R();}
window.getExChartHTML=function(n){const d=S.hist.filter(h=>h.exercises.some(e=>e.name===n)).reverse().map(h=>{const x=h.exercises.find(e=>e.name===n);const s=Object.values(x.logged||{});return{d:new Date(h.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),kg:s.length?Math.max(...s.map(s=>s.weight||0)):0};}).slice(-10);return svgLine(d,"d","kg","#457B9D",300,120);};

// ─── DATA IO ───
function doExp(){document.getElementById("io").innerHTML=`<textarea class="inp" style="margin-top:10px;min-height:70px;font-size:11px" onclick="this.select()" readonly>${esc(JSON.stringify({history:S.hist,phase:S.phase},null,2))}</textarea>`;}
function safeWipe(){
  if(!S.hist.length)return;
  const data=JSON.stringify({history:S.hist,phase:S.phase,cardio:S.cardio,core:S.core,nut:S.nut},null,2);
  const a=document.createElement("a");
  const url=URL.createObjectURL(new Blob([data],{type:"application/json"}));
  a.href=url;a.download=`apex-backup-avant-effacement-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  setTimeout(()=>{
    if(confirm(`✅ Backup téléchargé (${S.hist.length} séances).\n\nConfirmer l'effacement DÉFINITIF de l'historique ?\n\nCette action est irréversible — garde le fichier de backup en lieu sûr.`)){
      S.hist=[];saveS();R();
    }
  },300);
}
function doImpUI(){document.getElementById("io").innerHTML=`<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px"><div style="font-size:14px;color:var(--t2);font-weight:600">📁 Importer depuis un fichier</div><input type="file" accept=".csv,.json,text/csv,application/json,text/plain" onchange="doImpFile(this)" style="font-size:14px;color:var(--tx);width:100%;padding:12px;border:1px dashed var(--bd);border-radius:10px;background:var(--bg);cursor:pointer;box-sizing:border-box;font-family:inherit"><div style="font-size:12px;color:var(--mt);text-align:center;margin-top:4px">— ou coller du JSON —</div><textarea class="inp" id="impT" style="min-height:50px;font-size:11px" placeholder="{...JSON...}"></textarea><button class="btn" onclick="doImp()">Importer JSON collé</button><div style="font-size:12px;color:var(--mt);line-height:1.5"><b>Formats acceptés</b> : CSV (export d'une ancienne version d'APEX, séparateur <code>;</code> ou <code>,</code>) ou JSON. Les séances sont fusionnées avec l'historique existant (dédup par date + nom de session).</div></div>`;}
function doImp(){try{const d=JSON.parse(document.getElementById("impT").value);if(d.history){const r=mergeHistory(d.history,S.hist);S.hist=r.merged;if(d.phase!==undefined)S.phase=d.phase;saveS();R();alert(`✓ ${r.added} séance(s) importée(s)${r.skipped?`, ${r.skipped} doublon(s) ignoré(s)`:""}`);}else alert("JSON sans champ 'history'");}catch(e){alert("JSON invalide : "+e.message);}}
function doImpFile(el){const f=el.files&&el.files[0];if(!f)return;const rd=new FileReader();rd.onload=ev=>{const txt=ev.target.result;try{let hist,phase;const isCSV=f.name.toLowerCase().endsWith(".csv")||(txt.replace(/^﻿/,"").trim()[0]!=="{"&&(txt.includes(";")||txt.toLowerCase().includes("exercice")));if(isCSV){hist=parseCSVtoHistory(txt);if(!hist.length){alert("Aucune séance détectée dans le CSV. Vérifie que les colonnes incluent au moins Date, Session, Exercice.");return;}}else{const d=JSON.parse(txt);hist=d.history||[];phase=d.phase;if(!hist.length){alert("JSON sans historique");return;}}const r=mergeHistory(hist,S.hist);S.hist=r.merged;if(phase!==undefined)S.phase=phase;saveS();R();alert(`✓ ${r.added} séance(s) importée(s)${r.skipped?`, ${r.skipped} doublon(s) ignoré(s)`:""}`);}catch(e){alert("Erreur d'import : "+e.message);}};rd.onerror=()=>alert("Lecture du fichier impossible");rd.readAsText(f,"utf-8");el.value="";}

// ─── INIT ───
loadS();
// ─── P0 #5 : ONBOARDING WIZARD (3 écrans après le disclaimer) ───
let _onbStep = 0;
let _onbProfile = { sex: "M", height: 178, weight: 75, age: 30, goal: 0 };

function rOnboarding(){
  const steps = [rOnbStep1, rOnbStep2, rOnbStep3];
  const stepFn = steps[_onbStep] || steps[0];
  const progress = ((_onbStep + 1) / steps.length) * 100;
  return `<div style="padding:24px 20px;max-width:480px;margin:0 auto">
    <div style="font-size:30px;font-weight:900;letter-spacing:5px;color:var(--ac);margin-bottom:8px;text-align:center">APEX FITNESS</div>
    <div style="background:var(--bd);border-radius:4px;height:6px;margin-bottom:20px;overflow:hidden"><div style="height:6px;background:var(--ac);width:${progress}%;transition:width .3s"></div></div>
    ${stepFn()}
  </div>`;
}
function rOnbStep1(){
  const p = _onbProfile;
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">👋 Bienvenue !</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:20px;line-height:1.6">On commence par quelques infos pour adapter ton entraînement. Tout est privé, stocké sur ton appareil.</div>
    <div style="margin-bottom:16px">
      <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Sexe</div>
      <div style="display:flex;gap:8px">
        <button onclick="onbSet('sex','M')" style="flex:1;padding:14px;border-radius:11px;border:2px solid ${p.sex==='M'?'var(--ac)':'var(--bd)'};background:${p.sex==='M'?'var(--ac10)':'var(--cd)'};color:${p.sex==='M'?'var(--ac)':'var(--tx)'};font-weight:700;cursor:pointer;font-family:inherit;font-size:14px">♂ Homme</button>
        <button onclick="onbSet('sex','F')" style="flex:1;padding:14px;border-radius:11px;border:2px solid ${p.sex==='F'?'var(--ac)':'var(--bd)'};background:${p.sex==='F'?'var(--ac10)':'var(--cd)'};color:${p.sex==='F'?'var(--ac)':'var(--tx)'};font-weight:700;cursor:pointer;font-family:inherit;font-size:14px">♀ Femme</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div>
        <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Poids (kg)</div>
        <input class="inp" type="number" min="30" max="250" step="0.1" value="${p.weight}" onchange="onbSet('weight',parseFloat(this.value)||0)" style="font-size:18px;text-align:center;padding:14px">
      </div>
      <div>
        <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Taille (cm)</div>
        <input class="inp" type="number" min="120" max="220" step="1" value="${p.height}" onchange="onbSet('height',parseInt(this.value)||0)" style="font-size:18px;text-align:center;padding:14px">
      </div>
    </div>
    <div style="margin-bottom:24px">
      <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Âge</div>
      <input class="inp" type="number" min="14" max="100" value="${p.age}" onchange="onbSet('age',parseInt(this.value)||0)" style="font-size:18px;text-align:center;padding:14px">
    </div>
    <button class="btn" onclick="onbNext()">Continuer →</button>
    <button onclick="onbSkip()" style="background:none;color:var(--mt);border:none;width:100%;padding:12px;margin-top:8px;cursor:pointer;font-family:inherit;font-size:13px;text-decoration:underline">Passer (utiliser les valeurs par défaut)</button>
  </div>`;
}
function rOnbStep2(){
  const p = _onbProfile;
  const goals = [
    { id: 0, name: "Force", emoji: "💪", color: "#E63946", desc: "Charges lourdes, 4-6 reps, repos long. Ta priorité = la barre qui monte." },
    { id: 1, name: "Hypertrophie", emoji: "🔥", color: "#457B9D", desc: "Volume modéré, 8-12 reps. Construire du muscle visible." },
    { id: 2, name: "Deload / Maintien", emoji: "🌿", color: "#2A9D8F", desc: "Récupération active, 15-20 reps légers. À utiliser entre 2 cycles." }
  ];
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">🎯 Quel est ton objectif ?</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:20px;line-height:1.6">Ton choix détermine les charges et les répétitions suggérées. Tu peux changer à tout moment dans Réglages.</div>
    ${goals.map(g => `
      <div onclick="onbSet('goal',${g.id})" style="background:${p.goal===g.id?g.color+'18':'var(--cd2)'};border:2px solid ${p.goal===g.id?g.color:'var(--bd)'};border-radius:13px;padding:16px;margin-bottom:10px;cursor:pointer;transition:all .12s">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><span style="font-size:28px">${g.emoji}</span><span style="font-size:18px;font-weight:900;color:${g.color}">${g.name}</span></div>
        <div style="font-size:13px;color:var(--t2);line-height:1.5">${g.desc}</div>
      </div>
    `).join("")}
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn2" onclick="onbBack()" style="flex:1">← Retour</button>
      <button class="btn" onclick="onbNext()" style="flex:2">Continuer →</button>
    </div>
  </div>`;
}
function rOnbStep3(){
  // Calcule la session recommandée (utilise getRecommendation si possible, sinon push par défaut)
  const recId = typeof getRecommendation === "function" ? getRecommendation().id : "push";
  const recSess = PROG.sessions.find(s => s.id === recId);
  const goals = ["Force", "Hypertrophie", "Deload"];
  const ph = PHASES[_onbProfile.goal];
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">🚀 Tu es prêt !</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:24px;line-height:1.6">Ton profil est configuré. Voici un récap :</div>
    <div style="background:var(--cd2);border-radius:12px;padding:16px;margin-bottom:16px;font-size:14px;color:var(--tx);line-height:2">
      <b>Profil :</b> ${_onbProfile.sex==='M'?'♂':'♀'} ${_onbProfile.height} cm, ${_onbProfile.weight} kg, ${_onbProfile.age} ans<br>
      <b>Objectif :</b> <span style="color:${ph.color};font-weight:800">${goals[_onbProfile.goal]}</span> — ${ph.numSets}×${ph.reps}, repos ${ph.rest}s<br>
      <b>Programme :</b> PPL (Push / Pull / Legs) en 3 séances/sem
    </div>
    ${recSess?`<div class="card sess-card" style="border-left-color:${recSess.color};margin:0 0 14px 0;background:${recSess.color}11">
      <div class="sess-inner"><div><div class="sess-meta" style="color:var(--ok);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0">💡 Recommandé pour démarrer</div><div class="sess-name" style="color:${recSess.color};margin-top:4px">${recSess.name}</div><div class="sess-meta">${recSess.compounds.length + recSess.pools.length} exercices · ~45 min</div></div></div>
    </div>`:""}
    <button class="btn" onclick="onbFinish(true,'${recId}')">🏋️ Lancer ${recSess?recSess.name:""} maintenant</button>
    <button class="btn2" onclick="onbFinish(false)" style="width:100%;margin-top:10px">Plus tard — aller à l'accueil</button>
  </div>`;
}
function onbSet(k,v){ _onbProfile[k] = v; R(); }
function onbNext(){ _onbStep++; R(); }
function onbBack(){ _onbStep = Math.max(0, _onbStep - 1); R(); }
function onbSkip(){ onbFinish(false); }
function onbFinish(launchSession, sessId){
  // Applique le profil au state
  S.nut.sex = _onbProfile.sex;
  S.nut.height = _onbProfile.height;
  S.nut.weight = _onbProfile.weight;
  S.nut.age = _onbProfile.age;
  S.phase = _onbProfile.goal;
  localStorage.setItem("apex_onboarded", "1");
  saveS();
  if(launchSession && sessId){ goSess(sessId); }
  else { S.view = "home"; R(); }
}

if(!localStorage.getItem("apex_disclaimer")){
  document.getElementById("app").innerHTML=`<div style="padding:24px 20px;max-width:480px;margin:0 auto">
    <div style="font-size:30px;font-weight:900;letter-spacing:5px;color:#E63946;margin-bottom:22px">APEX FITNESS</div>
    <div style="background:#fff;border-radius:16px;border:1px solid #e5e5ea;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.07)">
      <div style="font-size:18px;font-weight:800;margin-bottom:14px;color:#B97534">⚕️ Avertissement médical</div>
      <div style="font-size:14px;color:#48484a;line-height:1.7">
        Cette application propose un programme d'entraînement adapté aux contraintes lombaires (protocole McGill). Cependant :<br><br>
        <b style="color:#1c1c1e">• Elle ne remplace en aucun cas un avis médical.</b><br>
        • Consultez un médecin ou kinésithérapeute avant de commencer tout programme si vous avez une pathologie diagnostiquée (hernie, protrusion, spondylolisthésis, etc.).<br>
        • Arrêtez immédiatement tout exercice provoquant une douleur aiguë.<br>
        • Les suggestions de charges sont basées sur le protocole APRE (validé scientifiquement) mais restent des estimations — écoutez votre corps.<br>
        • Les formules de 1RM (Epley/Brzycki) ont une marge d'erreur de ±3-5kg.<br><br>
        <b style="color:#1c1c1e">En utilisant cette application, vous reconnaissez assumer la responsabilité de votre entraînement.</b>
      </div>
      <button onclick="localStorage.setItem('apex_disclaimer','1');loadS();R();" style="background:#E63946;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-size:15px;font-weight:800;cursor:pointer;width:100%;margin-top:18px;font-family:inherit;letter-spacing:.5px">J'ai compris — Commencer</button>
    </div>
    <div style="font-size:12px;color:#8e8e93;margin-top:14px;text-align:center;font-weight:500">Progression basée sur APRE (Huang et al. 2025, SUCRA 93%)<br>1RM: moyenne Epley + Brzycki (DiStasio 2014, ±2.7kg)<br><br>En cliquant, tu acceptes la <a href="/privacy.html" target="_blank" rel="noopener" style="color:#E63946;font-weight:600;text-decoration:underline">politique de confidentialité</a> et les <a href="/terms.html" target="_blank" rel="noopener" style="color:#E63946;font-weight:600;text-decoration:underline">conditions d'utilisation</a>.</div>
  </div>`;
} else {
  // P0 #5 : utilisateurs existants (avec historique) considérés onboardés automatiquement
  if(!localStorage.getItem("apex_onboarded") && S.hist.length > 0){
    localStorage.setItem("apex_onboarded","1");
  }
  // Pré-remplit l'onboarding wizard avec les valeurs courantes de S
  _onbProfile = { sex: S.nut.sex, height: S.nut.height, weight: S.nut.weight, age: S.nut.age, goal: S.phase };
  R();
}

// Rappel : déclenche un check après 1.5s pour ne pas bloquer le rendu initial.
// La notif ne s'envoie que si user a opt-in + permission OK + pas de notif récente (throttle 24h).
setTimeout(()=>{ if(typeof checkAndShowReminder === "function") checkAndShowReminder(); }, 1500);
