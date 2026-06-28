// FITStark — Rendu, actions, init
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
// v8.52 — Bug fix : utilise encodeURIComponent pour échapper proprement le texte qui
// contient apostrophes, guillemets, <b>, etc. L'ancien escape `&#39;` était décodé par
// le parser HTML AVANT que JS s'exécute, ce qui cassait `onclick="showTip(this,'l'échec')"`
// → `'l'échec'` (erreur de syntaxe → click silencieusement no-op).
function ttip(text){
  // encodeURIComponent ne touche pas A-Z a-z 0-9 - _ . ! ~ * ' ( ), donc on force aussi
  // l'apostrophe à %27 et l'exclamation à %21 pour être 100% safe en JS string.
  const enc = encodeURIComponent(text).replace(/'/g, "%27").replace(/!/g, "%21");
  return `<button type="button" class="ttip-btn" onclick="showTip(this,decodeURIComponent('${enc}'))" aria-label="Explication">?</button>`;
}

// v8.51 — Wrap les termes techniques avec une explication inline + tooltip détaillé
// v8.54 — Ajoute une traduction courte INLINE entre parenthèses pour comprendre au 1er coup d'œil
// Ex : "RPE" → "RPE (effort ressenti) [?]" où [?] ouvre la définition complète.
const JARGON_TERMS = [
  // Triés par longueur décroissante pour éviter les matchs partiels (1RM avant RM, EMOM avant EM)
  "McGill Big 3", "VO2max", "FCmax", "EMOM", "AMRAP", "TDEE", "EPOC", "HIIT", "APRE", "Deload",
  "1RM", "BMR", "RPE", "RIR", "HSR", "PR", "Z2", "Z5"
];
// Traduction courte (3-4 mots) pour expliquer chaque terme inline.
// Affichée en italique grisée à côté du terme, sans avoir besoin de cliquer.
const JARGON_SHORT = {
  "RPE":          { fr: "effort ressenti 1-10",     en: "perceived effort 1-10" },
  "RIR":          { fr: "reps en réserve",          en: "reps in reserve" },
  "FCmax":        { fr: "fréquence cardiaque max",  en: "max heart rate" },
  "1RM":          { fr: "charge max à 1 rep",       en: "max load for 1 rep" },
  "Z2":           { fr: "zone cardio modérée",      en: "moderate cardio zone" },
  "Z5":           { fr: "zone sprint max",          en: "max sprint zone" },
  "VO2max":       { fr: "endurance cardio max",     en: "max cardio endurance" },
  "EPOC":         { fr: "after-burn post-effort",   en: "post-workout after-burn" },
  "EMOM":         { fr: "1 set par minute",         en: "1 set per minute" },
  "AMRAP":        { fr: "max reps en temps donné",  en: "max reps in given time" },
  "Deload":       { fr: "semaine récup -40%",       en: "recovery week -40%" },
  "APRE":         { fr: "auto-progression #1",      en: "auto-progression #1" },
  "BMR":          { fr: "calories au repos",        en: "resting calories" },
  "TDEE":         { fr: "total kcal/jour",          en: "total kcal/day" },
  "PR":           { fr: "record personnel",         en: "personal record" },
  "HIIT":         { fr: "intervalles intenses",     en: "intense intervals" },
  "HSR":          { fr: "excentriques lents",       en: "slow eccentrics" },
  "McGill Big 3": { fr: "protocole anti-dos",       en: "back-safe protocol" }
};

function wrapJargon(text){
  if(!text || typeof text !== "string") return text || "";
  const _T = window.T || ((k)=>k);
  const lang = (window.LANG && window.LANG.getLang) ? window.LANG.getLang() : "fr";
  let out = text;
  for(const term of JARGON_TERMS){
    const safeT = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s/g, '\\s');
    const re = new RegExp(`(^|[^A-Za-z0-9])(${safeT})(?![A-Za-z0-9])`, 'g');
    const key = "jargon_" + term.replace(/\s/g, '_');
    const def = _T(key);
    const shortObj = JARGON_SHORT[term];
    const shortTxt = shortObj ? (shortObj[lang] || shortObj.fr) : "";
    if(def && def !== key){
      out = out.replace(re, (m, before, t) => {
        const inline = shortTxt ? ` <span style="color:var(--mt);font-size:11px;font-style:italic">(${shortTxt})</span>` : "";
        return `${before}${t}${inline}${ttip(def)}`;
      });
    }
  }
  return out;
}

// ─── Custom WOD picker : filtre durée (v8.23) ─────────────────────────────
// State session-only (pas persisté) : 'all' | 'express' | 'standard' | 'long'.
// Reset à 'all' à chaque chargement.
let _wodFilter = 'all';
function setWodFilter(filter){ _wodFilter = filter; R(); }
function matchWodFilter(w, filter){
  if(filter === 'all') return true;
  if(filter === 'express') return w.duration !== null && w.duration <= 8;
  if(filter === 'standard') return w.duration !== null && w.duration >= 10 && w.duration <= 12;
  if(filter === 'long') return w.duration === null || w.duration >= 15;
  return true;
}

// ─── L1 fix v8.24 : détecte un localStorage cassé (iOS Safari Private, quotas)
// Sans ça, l'app boucle sur le disclaimer ou crash silencieusement.
function _localStorageBroken(){
  try{
    const k="__apex_ls_test__";
    localStorage.setItem(k,"1");
    if(localStorage.getItem(k)!=="1") return true;
    localStorage.removeItem(k);
    return false;
  }catch(e){ return true; }
}

// ─── RENDER ROOT (P0 #3 : wrapped in safeRender for error boundary) ───
function R(){
  const a=document.getElementById("app");
  // L1 fix : si le navigateur a bloqué localStorage (Safari Private, cookies off),
  // on ne peut RIEN faire. On affiche un écran clair plutôt que de boucler.
  if(_localStorageBroken()){
    a.innerHTML = `<div style="padding:60px 24px;text-align:center;max-width:480px;margin:0 auto">
      <div style="font-size:42px;margin-bottom:18px">🔒</div>
      <h1 style="font-size:22px;font-weight:900;letter-spacing:1px;color:#E63946;margin-bottom:14px;text-transform:uppercase">Stockage bloqué</h1>
      <p style="font-size:15px;color:#48484a;line-height:1.6;margin-bottom:18px">
        FITStark a besoin du stockage local de ton navigateur pour fonctionner.
        Pour le moment il est bloqué, ce qui arrive le plus souvent dans :
      </p>
      <ul style="text-align:left;font-size:14px;color:#48484a;line-height:1.7;list-style:none;padding:0;margin:0 auto 24px;max-width:340px">
        <li style="padding:6px 0;border-bottom:1px solid #e5e5ea"><b style="color:#1c1c1e">Safari iOS</b> en navigation privée</li>
        <li style="padding:6px 0;border-bottom:1px solid #e5e5ea"><b style="color:#1c1c1e">Chrome</b> en navigation privée ou cookies désactivés</li>
        <li style="padding:6px 0"><b style="color:#1c1c1e">Bloqueurs de pubs</b> trop agressifs (rare)</li>
      </ul>
      <p style="font-size:14px;color:#48484a;line-height:1.6">
        <b style="color:#1c1c1e">Solution :</b> ouvre cet onglet en mode normal (pas privé),
        ou autorise le stockage pour <code style="background:#f0f0f3;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px">apexfit-da753.web.app</code>.
      </p>
      <p style="font-size:12px;color:#6c6c70;margin-top:24px">
        Tes données restent 100 % sur ton appareil. Aucun envoi serveur.
      </p>
    </div>`;
    return;
  }
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
    else if(S.view==="finish")h=rFinish();
    else if(S.view==="session")h=rSession();
    else if(S.view==="cardio")h=rCardio();
    else if(S.view==="core")h=rCore();
    else if(S.view==="nutrition")h=rNutrition();
    else if(S.view==="bodymap")h=rBodyMap();
    else if(S.view==="plate")h=rPlateCalc();
    else if(S.view==="achievements")h=rAchievements();
    else if(S.view==="history")h=rHist();
    else if(S.view==="settings")h=rSett();
    else if(S.view==="customProgramWizard")h=rCustomProgramWizard();
    else if(S.view==="customProgramView")h=rCustomProgramView();
    if(S.view!=="session" && S.view!=="customProgramWizard"){const _Tnav=window.T||((k)=>k);h+=`<div class="nav">${[{id:"home",l:_Tnav("nav_home"),i:'<path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/>'},{id:"history",l:_Tnav("nav_history"),i:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'},{id:"settings",l:_Tnav("nav_settings"),i:'<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>'}].map(x=>`<button class="nav-btn ${S.view===x.id?'active':''}" onclick="nav('${x.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${x.i}</svg>${x.l}</button>`).join("")}</div>`;}
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
  b.innerHTML = `<span style="font-size:18px">📱</span><span style="flex:1">Installer FITStark comme une app</span><button id="pwaInstallBtn" style="background:var(--ac);color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">Installer</button><button id="pwaDismissBtn" style="background:transparent;color:var(--t2);border:none;padding:3px 6px;font-size:18px;cursor:pointer;line-height:1;opacity:.7" aria-label="Fermer">×</button>`;
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
  const _T = window.T || ((k)=>k);
  const result = calcPlates(_plateTarget, _plateBar);
  // Groupe les disques identiques pour affichage
  const grouped = {};
  if(result.plates) result.plates.forEach(p => grouped[p] = (grouped[p]||0)+1);
  const platesHtml = result.error
    ? `<div style="text-align:center;padding:20px;color:var(--ac);font-weight:700">${result.error}</div>`
    : result.perSide === 0
    ? `<div style="text-align:center;padding:20px;color:var(--ok);font-weight:700;font-size:15px">${_T("plate_just_bar")} (${_plateBar} kg)</div>`
    : `<div style="display:flex;flex-direction:column;align-items:center;gap:14px">
        <div style="font-size:13px;color:var(--mt);font-weight:600;letter-spacing:1px;text-transform:uppercase">${_T("plate_per_side")}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${Object.entries(grouped).sort((a,b)=>b[0]-a[0]).map(([p,n]) => {
          const color = p>=20?"var(--ac)":p>=15?"#E76F51":p>=10?"#F4A261":p>=5?"var(--in)":p>=2.5?"#10b981":"var(--mt)";
          return `<div style="background:${color};color:#fff;padding:10px 16px;border-radius:10px;font-weight:900;font-size:18px;box-shadow:var(--shadow-sm)">${p} kg ${n>1?`×${n}`:""}</div>`;
        }).join("")}</div>
        ${result.missing > 0.01 ? `<div style="font-size:13px;color:var(--wa);font-weight:600;margin-top:6px">⚠️ ${_T("plate_impossible")} : ${result.reachable.toFixed(2)} kg ${_T("plate_real")} (${_T("plate_missing")} ${result.missing.toFixed(2)} kg)</div>` : `<div style="font-size:13px;color:var(--ok);font-weight:600;margin-top:6px">✓ ${result.perSide} kg × 2 = ${result.perSide*2} kg + ${_plateBar} kg = <b>${_plateTarget} kg</b></div>`}
      </div>`;
  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:6px 12px;font-size:12px" onclick="nav('home')">${_T("plate_back")}</button><div style="font-size:20px;font-weight:900;letter-spacing:2px;color:var(--ac)">${_T("plate_title")}</div><div style="width:80px"></div></div></div>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:12px;text-transform:uppercase;color:var(--mt);letter-spacing:1px;font-weight:700;margin-bottom:6px">${_T("plate_target")}</div>
          <input class="inp" type="number" min="0" step="0.5" value="${_plateTarget}" onchange="setPlateTarget(this.value)" style="font-size:22px;text-align:center;padding:14px">
        </div>
        <div>
          <div style="font-size:12px;text-transform:uppercase;color:var(--mt);letter-spacing:1px;font-weight:700;margin-bottom:6px">${_T("plate_bar")}</div>
          <input class="inp" type="number" min="0" step="0.5" value="${_plateBar}" onchange="setPlateBar(this.value)" style="font-size:22px;text-align:center;padding:14px">
        </div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
        ${[40,50,60,70,80,90,100,110,120].map(w=>`<button class="pill" onclick="setPlateTarget(${w})" style="background:${_plateTarget===w?'var(--ac)':'var(--cd2)'};color:${_plateTarget===w?'#fff':'var(--t2)'};border-color:${_plateTarget===w?'var(--ac)':'var(--bd)'}">${w} kg</button>`).join("")}
      </div>
    </div>
    <div class="card" style="padding:22px">${platesHtml}</div>
    <div class="card" style="background:var(--in10);border-color:var(--in)"><div style="font-size:13px;color:var(--t2);line-height:1.6"><b style="color:var(--in)">${_T("plate_legend_title")}</b><br>${_T("plate_legend_std")}<br>${_T("plate_legend_bar")}</div></div>`;
}

// ─── STREAK BANNER ───
// Toujours affiché en haut du Home : encourageant si on est dans le rythme, alertant si on a décroché.
function rStreakBanner(){
  let info = null;
  try { info = (typeof getStreakInfo === "function") ? getStreakInfo() : null; }
  catch(e){ console.warn("[apex] getStreakInfo failed:", e); return ""; }
  if(!info || typeof info !== "object") return "";
  const status = info.status || "new";
  const bg = status === "active" || status === "ok" ? "var(--ok10)" :
             status === "warn" ? "rgba(244,162,97,.15)" :
             status === "alert" || status === "lost" ? "var(--ac10)" : "var(--cd2)";
  const border = info.color || "var(--mt)";
  const msg = info.message || "";
  const showBtn = status === "warn" || status === "alert" || status === "lost";
  let btnHtml = "";
  if(showBtn){
    try {
      const rec = (typeof getRecommendation === "function") ? getRecommendation() : null;
      if(rec && rec.id){
        btnHtml = `<button class="btn" style="background:${border};border-color:${border};width:auto;padding:8px 14px;font-size:12px;flex-shrink:0" onclick="goSess('${rec.id}')">${(window.T||((k)=>k))("streak_btn_launch")}</button>`;
      }
    } catch(e){ console.warn("[apex] streak btn:", e); }
  }
  return `<div class="card" style="background:${bg};border-color:${border};border-left:4px solid ${border};padding:12px 16px;margin-top:10px"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div style="font-size:13px;color:${border};font-weight:700;line-height:1.4">${msg}</div>${btnHtml}</div></div>`;
}

// v8.35 : Banner dynamique reflétant les pathologies réellement actives (mise à jour live depuis Réglages)
// Règles par pathologie : Obligatoire / Interdit / Modifié / Alertes — basées sur Squat University,
// McGill, Starrett, Tom Morrison + pathologies.js EXERCISE_RISKS.
// v8.55 : PATHOLOGY_RULES utilise maintenant des clés i18n résolues au render time
const PATHOLOGY_RULES = {
  l5:       { obligatoire: "path_l5_mandatory", interdit: "path_l5_forbidden", modifie: "path_l5_modified" },
  shoulder: { obligatoire: "path_sh_mandatory", interdit: "path_sh_forbidden", modifie: "path_sh_modified" },
  knee:     { obligatoire: "path_kn_mandatory", interdit: "path_kn_forbidden", modifie: "path_kn_modified" },
  wrist:    { obligatoire: "path_wr_mandatory", interdit: "path_wr_forbidden", modifie: "path_wr_modified" },
  elbow:    { obligatoire: "path_el_mandatory", interdit: "path_el_forbidden", modifie: "path_el_modified" }
};
function rPathologyBanner(){
  const T = window.T || ((k)=>k);
  const trL = window.tr || ((s)=>s);
  const active = (S.health && S.health.pathologies) || [];
  if(!active.length){
    return `<details class="l5-banner" style="background:rgba(108,108,112,.06);border-color:var(--bd)">
      <summary><span class="l5-banner-dot" style="background:var(--mt);box-shadow:0 0 0 4px rgba(108,108,112,.15)"></span><span style="color:var(--t2)">${T("home_no_pathology")}</span></summary>
      <div class="l5-body" style="color:var(--t2)">${T("home_pathology_off")}</div>
    </details>`;
  }
  // Header label : 1 pathologie = nom complet · 2+ = "multi-pathologies (X, Y, Z)"
  const labels = active.map(k => trL((PATHOLOGIES[k] && PATHOLOGIES[k].short) || k));
  const headerTxt = active.length === 1
    ? T("home_path_mode", { name: trL((PATHOLOGIES[active[0]] && PATHOLOGIES[active[0]].label) || active[0]) })
    : T("home_multi_mode", { names: labels.join(", ") });
  // Pour chaque pathologie active, sa section de règles
  const sections = active.map(k => {
    const rules = PATHOLOGY_RULES[k];
    const p = PATHOLOGIES[k];
    if(!rules || !p) return "";
    const head = active.length > 1 ? `<div style="font-weight:800;color:${p.color};margin-top:8px;margin-bottom:4px">${p.icon} ${trL(p.label)}</div>` : "";
    // v8.55 : résout les clés i18n au render time
    return `${head}<b>${T("home_path_obligatoire")}</b> : ${T(rules.obligatoire)}<br><b>${T("home_path_interdit")}</b> : ${T(rules.interdit)}<br><b>${T("home_path_modifie")}</b> : ${T(rules.modifie)}`;
  }).join(active.length > 1 ? "" : "<br>");
  const alertsLine = ``;
  return `<details class="l5-banner">
    <summary><span class="l5-banner-dot"></span>${headerTxt}</summary>
    <div class="l5-body">${sections}${alertsLine}</div>
  </details>`;
}

// v8.72 — Bannière deload : recommandation auto sur fatigue ≥ 75, ou suivi de la semaine deload
function rDeloadBanner(){
  if(typeof isDeloadActive === 'function' && isDeloadActive()){
    const day = getDeloadDay();
    return `<div class="deload-banner active">
      <div class="dl-icon">🛌</div>
      <div class="dl-mid">
        <div class="dl-eyebrow">Mode récupération · Jour ${day}/7</div>
        <div class="dl-msg">Charges réduites de 20% · Volume libre · Écoute ton corps</div>
      </div>
      <button class="dl-cta" onclick="if(confirm('Sortir du mode récupération ?'))deactivateDeload()">Reprendre</button>
    </div>`;
  }
  const fat = (typeof getFatigue === 'function') ? getFatigue() : null;
  if(!fat || fat.score < 75 || S.hist.length < 4) return '';
  return `<div class="deload-banner suggest">
    <div class="dl-icon">⚠️</div>
    <div class="dl-mid">
      <div class="dl-eyebrow">Surcharge détectée · Score ${fat.score}/100</div>
      <div class="dl-msg">Une semaine deload (-20% charge) accélère la progression et prévient les blessures</div>
    </div>
    <button class="dl-cta" onclick="activateDeload()">Activer 7j</button>
  </div>`;
}

// v8.77 — Carte historique progression d'un exercice
// Affichée sous chaque exercice de la page session : dernière perf, PB, tendance, mini-graph.
function rExerciseHistoryCard(ex){
  if(!ex || !ex.name) return '';
  const logType = ex.logType || "weight";
  if(logType !== "weight") return ''; // pas pertinent pour bw/time/distance — on peut étendre plus tard
  // Récupère toutes les performances pour cet exo (chronologique ascendant)
  const entries = [];
  (S.hist||[]).forEach(h => {
    h.exercises.forEach(e => {
      if(e.name !== ex.name) return;
      const sets = Object.values(e.logged||{}).filter(s => (s.weight||0) > 0 && (s.reps||0) > 0);
      if(!sets.length) return;
      const maxWeight = Math.max(...sets.map(s => s.weight||0));
      const bestSet = sets.find(s => s.weight === maxWeight) || sets[0];
      const volume = sets.reduce((sum, s) => sum + (s.weight||0)*(s.reps||0), 0);
      const rm = (typeof calc1RM === "function") ? calc1RM(bestSet.weight, bestSet.reps) : 0;
      entries.push({
        date: h.date,
        weight: maxWeight,
        reps: bestSet.reps,
        volume: volume,
        rm: rm,
        sets: sets.length
      });
    });
  });
  if(!entries.length) return `<div class="ex-hist-empty">
    <div class="ex-hist-empty-icon">📊</div>
    <div class="ex-hist-empty-msg">Première séance — pas encore d'historique</div>
  </div>`;
  entries.sort((a,b) => new Date(a.date) - new Date(b.date));
  const last = entries[entries.length - 1];
  // PB charge max (la meilleure perf de l'historique)
  const pbWeight = Math.max(...entries.map(e => e.weight));
  const pbEntry = entries.find(e => e.weight === pbWeight) || last;
  const pbRm = Math.max(...entries.map(e => e.rm));
  // PB volume (meilleure séance en volume total)
  const pbVolume = Math.max(...entries.map(e => e.volume));
  // Tendance : compare les 3 dernières séances aux 3 précédentes (par 1RM estimé pour normaliser)
  let trend = 'stable', trendIcon = '→', trendColor = 'var(--mt)';
  if(entries.length >= 4){
    const recent = entries.slice(-3);
    const prev = entries.slice(-6, -3);
    if(prev.length){
      const recentAvg = recent.reduce((s,e)=>s+e.rm,0) / recent.length;
      const prevAvg = prev.reduce((s,e)=>s+e.rm,0) / prev.length;
      const diff = (recentAvg - prevAvg) / Math.max(1, prevAvg) * 100;
      if(diff >= 2) { trend = 'progression'; trendIcon = '↗'; trendColor = 'var(--ok)'; }
      else if(diff <= -2) { trend = 'régression'; trendIcon = '↘'; trendColor = 'var(--ac)'; }
    }
  }
  // Données pour le mini-graph (10 dernières séances, charge max)
  const last10 = entries.slice(-10);
  const chartData = last10.map(e => ({
    d: new Date(e.date).toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit'}),
    kg: e.weight
  }));
  const chart = (typeof svgLine === "function") ? svgLine(chartData, 'd', 'kg', '#457B9D', 300, 100) : '';
  // Jours depuis dernière séance
  const daysSince = Math.floor((Date.now() - new Date(last.date).getTime()) / 864e5);
  const dateStr = daysSince === 0 ? "Aujourd'hui" : daysSince === 1 ? 'Hier' : `Il y a ${daysSince}j`;
  // Compare last vs PB charge
  const lastVsPB = last.weight >= pbWeight ? '🏆 PB en cours' : `${Math.round((last.weight/pbWeight)*100)}% du PB`;
  return `<div class="ex-hist-card">
    <div class="ex-hist-head">
      <div class="ex-hist-title">📊 Progression</div>
      <div class="ex-hist-count">${entries.length} séance${entries.length>1?'s':''}</div>
    </div>
    <div class="ex-hist-stats">
      <div class="ex-hist-stat">
        <div class="ex-hist-stat-lbl">Dernière</div>
        <div class="ex-hist-stat-val">${last.weight}<span class="u">kg</span> × ${last.reps}</div>
        <div class="ex-hist-stat-sub">${dateStr}</div>
      </div>
      <div class="ex-hist-stat">
        <div class="ex-hist-stat-lbl">🏆 PB charge</div>
        <div class="ex-hist-stat-val" style="color:var(--ac)">${pbWeight}<span class="u">kg</span> × ${pbEntry.reps}</div>
        <div class="ex-hist-stat-sub">${lastVsPB}</div>
      </div>
      <div class="ex-hist-stat">
        <div class="ex-hist-stat-lbl">Tendance</div>
        <div class="ex-hist-stat-val" style="color:${trendColor}">${trendIcon} ${trend === 'progression' ? '+' : trend === 'régression' ? '-' : '='}</div>
        <div class="ex-hist-stat-sub">${entries.length>=4?'vs 3 séances avant':'pas assez de data'}</div>
      </div>
    </div>
    <div class="ex-hist-meta-row">
      <div class="ex-hist-meta"><b>1RM estimé :</b> ${pbRm} kg</div>
      <div class="ex-hist-meta"><b>PB volume :</b> ${pbVolume} kg</div>
    </div>
    ${chart ? `<div class="ex-hist-chart">${chart}</div>` : ''}
  </div>`;
}

// v8.70 — Bannière célébration PB (apparaît après finish() si nouveau record WOD)
function rPBBanner(){
  if(!S._lastPB) return '';
  const r = S._lastPB;
  const txt = (typeof formatWodResult === 'function') ? formatWodResult(r) : '—';
  return `<div class="pb-banner" onclick="dismissPB()" role="button" aria-label="Fermer la célébration record">
    <div class="pb-trophy">🏆</div>
    <div class="pb-mid">
      <div class="pb-eyebrow">Nouveau record</div>
      <div class="pb-name">${esc(r.wodName||'')}</div>
      <div class="pb-score">${esc(r.type)} — <b>${txt}</b></div>
    </div>
    <div class="pb-close" aria-hidden="true">×</div>
  </div>`;
}
function rHome(){
  const today=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const ph=PHASES[S.phase],fat=getFatigue(),rec=getRecommendation();
  const recSess=PROG.sessions.find(s=>s.id===rec.id);
  const compounds=["Bench Press","Back Squat","Romanian Deadlift","OHP Debout","Pull-ups"];
  const _trL = window.tr || ((s)=>s);
  const rmCards=compounds.map(n=>{const rm=get1RM(n);const nDisp=_trL(n);return rm?`<div style="text-align:center;min-width:70px"><div style="font-size:16px;font-weight:900">${rm}<span style="font-size:12px;color:var(--mt)">kg</span></div><div style="font-size:10px;color:var(--mt);margin-top:1px">${nDisp.length>12?nDisp.slice(0,12)+'…':nDisp}</div></div>`:null;}).filter(Boolean);

  return`<div class="hdr"><h1 class="logo" aria-label="FITStark — Musculation adaptée aux pathologies">FIT<span class="brand-accent">Stark</span></h1><div style="font-size:13px;color:var(--mt)">${today}</div></div>
  ${rPBBanner()}
  ${rDeloadBanner()}
  ${rPathologyBanner()}
  ${rStreakBanner()}
  ${S.hist.length>=4?`<div class="score-card">
    <div class="score-item"><div class="score-val" style="color:${fat.color}">${fat.score}</div><div class="score-lbl">${(window.T||((k)=>k))("home_fatigue")} ${ttip("Compare ton volume 7 derniers jours à ta moyenne hebdo. <b>&gt;75</b> = surcharge, considère un deload (Sports Med Open 2024).")}</div></div>
    <div class="score-item"><div class="score-val">${S.hist.length}</div><div class="score-lbl">${(window.T||((k)=>k))("home_sessions")}</div></div>
    <div class="score-item"><div class="score-val">${S.hist.filter(h=>(Date.now()-new Date(h.date))<6048e5).length}</div><div class="score-lbl">${(window.T||((k)=>k))("home_7days")}</div></div>
  </div>
  <div class="card" style="padding:12px 16px"><div style="font-size:13px;color:${fat.color};font-weight:600">${fat.label}</div><div style="background:var(--bd);border-radius:4px;height:8px;margin-top:6px;overflow:hidden"><div class="fatigue-bar" style="width:${fat.score}%;background:${fat.color}"></div></div></div>`
  :`<div class="stats-row"><div class="stat-box"><div class="stat-val">${S.hist.length}</div><div class="stat-lbl">${(window.T||((k)=>k))("home_sessions")}</div></div><div class="stat-box"><div class="stat-val">${S.hist.filter(h=>(Date.now()-new Date(h.date))<6048e5).length}</div><div class="stat-lbl">${(window.T||((k)=>k))("home_7days")}</div></div></div>`}
  ${rmCards.length?`<div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:8px;display:flex;align-items:center">${(window.T||((k)=>k))("home_1rm_title")} ${ttip("<b>1 Rep Max</b> estimé via la formule d Epley : W × (1 + reps/30). Précis à ±2.7 kg pour 3RM (DiStasio 2014).")}</div><div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px">${rmCards.join("")}</div></div>`:""}
  <div class="card" style="border-left:4px solid ${ph.color}"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600">${(window.T||((k)=>k))("sess_phase")}</div><div style="font-size:16px;font-weight:900;color:${ph.color};margin-top:2px">${_trL(ph.name)}</div><div style="font-size:13px;color:var(--t2);margin-top:2px">${_trL(ph.desc)} — ${ph.numSets}×${ph.reps}</div></div><div style="display:flex;gap:4px">${PHASES.map((p,i)=>`<button onclick="setPhase(${i})" style="width:24px;height:24px;border-radius:50%;border:2px solid ${p.color};background:${S.phase===i?p.color:'none'};cursor:pointer;color:${S.phase===i?'#fff':p.color};font-size:11px;font-weight:700">${i+1}</button>`).join("")}</div></div></div>
  ${(recSess && !S.customProgram)?(()=>{const recWod=pickWOD(rec.id);const _T=window.T||((k)=>k);const _tr=window.tr||((s)=>s);const lastTxt=rec.days>0?_T("home_last_long",{n:rec.days}):_T("home_never_did");return`<div class="card" style="border-left:4px solid ${recSess.color};cursor:pointer" onclick="goSess('${rec.id}')"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--ok);font-weight:600;display:flex;align-items:center;gap:6px">${SVG.bulb}<span>${_T("home_recommended")}</span></div><div style="font-size:16px;font-weight:900;color:${recSess.color};margin-top:4px">${_tr(recSess.name)}</div><div style="font-size:13px;color:var(--mt);margin-top:2px">${lastTxt} — ${_T("home_rec_wod")}: ${recWod?.name||'—'}</div>${recWod?.desc?`<div style="font-size:12px;color:var(--mt);font-style:italic;margin-top:4px;line-height:1.4">${esc(_tr(recWod.desc))}</div>`:""}</div>`;})():``}
  ${typeof rCustomProgramHomeSection==="function"?`<h2 class="sec-title">${(window.T||((k)=>k))("cp_home_title")}</h2>${rCustomProgramHomeSection()}`:""}
  ${(S.customProgram && typeof rCustomWeekGrid==="function")?rCustomWeekGrid():""}
  ${S.customProgram?"":`<h2 class="sec-title">${(window.T||((k)=>k))("home_sec_program")}</h2>
  <div class="home-row-3up">${PROG.sessions.map(s=>{const _T=window.T||((k)=>k);const _tr=window.tr||((s)=>s);const last=S.hist.find(h=>h.sessionId===s.id);const daysAgo=last?Math.floor((Date.now()-new Date(last.date))/864e5):null;const metaText=daysAgo===null?_T("home_never_done"):daysAgo===0?_T("home_last_today"):daysAgo===1?_T("home_last_yesterday"):_T("home_last_days_ago",{n:daysAgo});return`<button type="button" class="home-tile" style="border-top-color:${s.color}" onclick="goSess('${s.id}')" aria-label="${_tr(s.name)}"><div class="tile-name" style="color:${s.color}">${_tr(s.name)}</div><div class="tile-meta">${metaText}</div></button>`;}).join("")}</div>
  <h2 class="sec-title">${(window.T||((k)=>k))("home_sec_planning")}</h2>`}
  ${S.customProgram?"":`
  ${(()=>{
    // v8.41 — Bannière d'adaptation : montre la PPL recommandée aujourd'hui (oldest)
    // + nombre de jours depuis la dernière fois. Rend l'adaptation EXPLICITE.
    const _T = window.T || ((k)=>k);
    const _tr = window.tr || ((s)=>s);
    if(typeof getRecommendation !== "function" || typeof computeWeekPlan !== "function") return "";
    const plan = computeWeekPlan();
    const today = plan.find(d => d.status === "today" || d.status === "today_rest");
    // Si tous les PPL ont été faits cette semaine, on affiche un message de félicitations
    const doneThisWeek = plan.filter(d => d.status === "done").map(d => d.sess);
    const pplDone = ["push","pull","legs"].filter(p => doneThisWeek.includes(p));
    if(pplDone.length === 3){
      return `<div class="card" style="border-left:4px solid var(--ok);background:var(--ok10);padding:14px;margin-bottom:8px">
        <div style="font-size:13px;color:var(--ok);font-weight:700">${_T("plan_rec_all_done")}</div>
      </div>`;
    }
    // Sinon : récupère la PPL recommandée + son label + count de jours
    const rec = getRecommendation();
    const recSessObj = PROG.sessions.find(s => s.id === rec.id);
    if(!recSessObj) return "";
    const recName = _tr(recSessObj.name);
    const bannerHtml = rec.days >= 99
      ? _T("plan_rec_never", { name: recName })
      : _T("plan_rec_today", { name: recName, days: rec.days });
    return `<div class="card" style="border-left:4px solid ${recSessObj.color};background:${recSessObj.color}11;padding:14px;margin-bottom:8px;cursor:pointer" onclick="goSess('${rec.id}')">
      <div style="font-size:11px;color:var(--mt);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${_T("plan_rec_title")}</div>
      <div style="font-size:14px;color:var(--tx);line-height:1.5">${bannerHtml}</div>
    </div>`;
  })()}
  <div class="card week-card">
    <div class="week-intro">${(window.T||((k)=>k))("home_week_intro")}</div>
    <div class="week-source">Schoenfeld 2019 · Grgic 2022 · McGill 2016 · Krzysztofik 2019</div>
    <div class="week-grid" role="list">${(()=>{
      const _T=window.T||((k)=>k);
      const plan = computeWeekPlan();
      // v8.41 — Identifie la séance recommandée du jour (PPL la plus ancienne)
      const rec = typeof getRecommendation === "function" ? getRecommendation() : null;
      const recId = rec ? rec.id : null;
      const DAY_KEYS = ["day_mon","day_tue","day_wed","day_thu","day_fri","day_sat","day_sun"];
      const PLAN_KEY = { push:"plan_push", pull:"plan_pull", legs:"plan_legs", core:"plan_core", rest:"plan_rest" };
      const PLAN_CLS = { push:"push", pull:"pull", legs:"legs", core:"core", rest:"rest" };
      const onclickFor = s => {
        if(s === "push" || s === "pull" || s === "legs") return `goSess('${s}')`;
        if(s === "core") return `goCore()`;
        return "";
      };
      return plan.map((d, i) => {
        const cls = PLAN_CLS[d.sess] || "rest";
        const label = _T(PLAN_KEY[d.sess] || "plan_rest");
        const short = _T(DAY_KEYS[i]);
        const isClickable = ["today","future","done"].includes(d.status) && d.sess !== "rest";
        const tag = isClickable ? "button" : "div";
        const tabAttr = isClickable ? ` type="button"` : "";
        const onclickAttr = isClickable ? ` onclick="${onclickFor(d.sess)}"` : "";
        const ariaPress = d.status === "today" ? ` aria-current="date"` : "";
        const ariaLabel = ` aria-label="${short} ${label}"`;
        // v8.41 — Badge ⭐ Reco sur la tile du jour si c'est la PPL recommandée
        const isRecToday = d.status === "today" && d.sess === recId;
        const recBadge = isRecToday ? `<div style="position:absolute;top:-6px;right:-6px;background:var(--ac);color:#fff;font-size:9px;font-weight:900;padding:2px 5px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.3);letter-spacing:.3px">${_T("plan_rec_badge")}</div>` : "";
        const tileStyle = isRecToday ? ` style="position:relative;box-shadow:0 0 0 2px var(--ac), 0 2px 8px rgba(230,57,70,.25)"` : ` style="position:relative"`;
        const sessHtml = d.status === "done"
          ? `<div class="day-sess day-sess-${cls}"><span class="day-check">✓</span> ${label}</div>`
          : `<div class="day-sess day-sess-${cls}">${label}</div>`;
        return `<${tag} class="day-tile day-tile-${d.status}"${tileStyle}${tabAttr}${onclickAttr}${ariaPress}${ariaLabel}>${recBadge}<div class="day-name">${short}</div>${sessHtml}</${tag}>`;
      }).join("");
    })()}</div>
    <div class="week-foot">${(window.T||((k)=>k))("home_week_foot")}</div>
  </div>`}
  <h2 class="sec-title">${(window.T||((k)=>k))("home_sec_wellness")}</h2>
  <div class="card sess-card sess-card-well" onclick="goCardio()"><div class="sess-inner"><div><div class="sess-name">CARDIO</div><div class="sess-meta">${(window.T||((k)=>k))("tile_cardio_meta")}</div>${(()=>{const _T=window.T||((k)=>k);const lastC=S.hist.find(h=>h.sessionId==='cardio');if(!lastC)return "";const modeLbl=lastC.cardio?.mode==='run'?_T("tile_cardio_run"):lastC.cardio?.mode==='swim'?_T("tile_cardio_swim"):_T("tile_cardio_bike");const locale=(window.LANG&&LANG.getLang()==='en')?"en-US":"fr-FR";return `<div class="sess-meta">${_T("tile_cardio_last")} : ${new Date(lastC.date).toLocaleDateString(locale)} — ${modeLbl}</div>`;})()}</div><div class="sess-icon">→</div></div></div>
  <div class="card sess-card sess-card-well" onclick="goCore()"><div class="sess-inner"><div><div class="sess-name">CORE</div><div class="sess-meta">${(window.T||((k)=>k))("tile_core_meta")}</div>${(()=>{const _T=window.T||((k)=>k);const locale=(window.LANG&&LANG.getLang()==='en')?"en-US":"fr-FR";const lastC=S.hist.find(h=>h.sessionId==='core');const wk=S.core.startDate?coreCurrentWeek():null;return lastC?`<div class="sess-meta">${_T("tile_cardio_last")} : ${new Date(lastC.date).toLocaleDateString(locale)}${wk?` · ${_T("tile_core_week",{n:wk})}`:""}</div>`:wk?`<div class="sess-meta">${_T("tile_core_week",{n:wk})}</div>`:`<div class="sess-meta" style="color:var(--ok)">${_T("tile_core_notstarted")}</div>`;})()}</div><div class="sess-icon">→</div></div></div>
  <div class="card sess-card sess-card-well" onclick="nav('nutrition')"><div class="sess-inner"><div><div class="sess-name">NUTRITION</div><div class="sess-meta">${(()=>{const _T=window.T||((k)=>k);const c=nutCalc(S.nut);return `${_T("tile_nut_target")} : <b style="color:var(--ok)">${c.target} ${_T("tile_nut_kcal")}</b> · ${c.protein}g ${_T("tile_nut_prot")} · ${c.fat}g ${_T("tile_nut_fat")} · ${c.carbs}g ${_T("tile_nut_carbs")}`;})()}</div>${(()=>{const _T=window.T||((k)=>k);const locale=(window.LANG&&LANG.getLang()==='en')?"en-US":"fr-FR";return S.nut.weightLog.length?`<div class="sess-meta">${_T("tile_nut_last")} : ${S.nut.weightLog[0].weight}kg — ${new Date(S.nut.weightLog[0].date).toLocaleDateString(locale)}</div>`:`<div class="sess-meta" style="color:var(--ok)">${_T("tile_nut_config")} →</div>`;})()}</div><div class="sess-icon">→</div></div></div>
  <h2 class="sec-title">${(window.T||((k)=>k))("home_sec_tools")}</h2>
  <div class="tools-chips">
    <button type="button" class="tool-chip" onclick="goBodyMap()" aria-label="${(window.T||((k)=>k))("tool_bodymap")}">${SVG.map}${(window.T||((k)=>k))("tool_bodymap")}</button>
    <button type="button" class="tool-chip" onclick="nav('plate')" aria-label="${(window.T||((k)=>k))("tool_plate")}">${SVG.barbell}${(window.T||((k)=>k))("tool_plate")}</button>
    ${(S.custom && S.custom.exerciseIds && S.custom.exerciseIds.length)?(()=>{const _T=window.T||((k)=>k);const lbl=S.custom.name||_T("custom_label");return `<button type="button" class="tool-chip" onclick="goSess('custom')" aria-label="${esc(lbl)}">${SVG.sliders}${esc(lbl)}</button>`;})():""}
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
  const _Tdet = window.T || ((k)=>k);
  const _trDet = window.tr || ((s)=>s);
  let detail = `<div class="card" style="text-align:center;color:var(--mt);font-size:13px;padding:18px 14px;line-height:1.5">${_Tdet("bm_hint_tap")}</div>`;
  if(_selectedMuscle){
    const s = stats[_selectedMuscle];
    const lastTxt = s.daysAgo === null ? _Tdet("bm_never_trained")
                  : s.daysAgo === 0 ? _Tdet("bm_today")
                  : s.daysAgo === 1 ? _Tdet("bm_yesterday")
                  : _Tdet("bm_days_ago", { n: s.daysAgo });
    const heatC = muscleHeatColor(s.daysAgo);
    const volTxt = s.volume30 >= 1000 ? (s.volume30/1000).toFixed(1) + " t" : s.volume30 ? Math.round(s.volume30) + " kg" : "—";
    detail = `<div class="card" style="border-left:4px solid ${heatC}">
      <div style="font-size:20px;font-weight:900;color:${heatC};margin-bottom:6px">${_trDet(MN[_selectedMuscle]||_selectedMuscle)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        <div class="stat-box"><div class="stat-val">${volTxt}</div><div class="stat-lbl">${_Tdet("bm_volume_30")}</div></div>
        <div class="stat-box"><div class="stat-val">${s.sessions30}</div><div class="stat-lbl">${_Tdet("bm_sessions_30")}</div></div>
        <div class="stat-box"><div class="stat-val" style="font-size:14px">${lastTxt}</div><div class="stat-lbl">${_Tdet("bm_last")}</div></div>
        <div class="stat-box"><div class="stat-val">${s.max1RM ? s.max1RM + " kg" : "—"}</div><div class="stat-lbl">${_Tdet("bm_best_1rm")}</div></div>
      </div>
    </div>`;
  }

  const _Tbm = window.T || ((k)=>k);
  const legend = `<div class="card"><div style="font-size:12px;color:var(--t2);margin-bottom:8px;font-weight:600;letter-spacing:1px;text-transform:uppercase">${_Tbm("bm_legend_title")}</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--t2)">
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#2A9D8F"></span>${_Tbm("bm_legend_2")}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#5DB8A8"></span>${_Tbm("bm_legend_3")}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#F4A261"></span>${_Tbm("bm_legend_6")}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#E76F51"></span>${_Tbm("bm_legend_11")}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#C0392B"></span>${_Tbm("bm_legend_20")}</span>
      <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:14px;border-radius:3px;background:#c7c7cc"></span>${_Tbm("bm_legend_never")}</span>
    </div></div>`;

  const attribution = `<div class="card" style="font-size:11px;color:var(--mt);text-align:center;padding:12px;line-height:1.5;font-weight:500">
    ${_Tbm("bm_credit")} : <a href="https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg" target="_blank" style="color:#06b6d4">Muscles_front_and_back.svg</a> · Tomáš Kebert &amp; umimeto.org · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" style="color:#06b6d4">CC BY-SA 4.0</a>
  </div>`;

  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:6px 12px;font-size:12px" onclick="nav('home')">${_Tbm("nut_back")}</button><div style="font-size:20px;font-weight:900;letter-spacing:2px;color:var(--ac)">${_Tbm("bm_title_full").toUpperCase()}</div><div style="width:80px"></div></div></div>
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
    content=`<div class="card"><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:var(--ok);margin-bottom:14px">${(window.T||((k)=>k))("sess_warmup_title")}</div>${rWU(s.id)}<button class="btn" style="margin-top:16px" onclick="setEi(0)">${(window.T||((k)=>k))("sess_start_btn")}</button></div>`;
  } else if(ex){
    const mc=MC[ex.muscle]||s.color;const rest=ph.rest||ex.rest;const nSets=ph.numSets||ex.sets;
    const imgs=ex.imgs?`<div class="ex-imgs">${ex.imgs.map((p,i)=>`<div class="ex-img-wrap"><img src="${I}${p}" alt="${esc(ex.name)}" loading="lazy" decoding="async" onerror="this.parentElement.innerHTML='<div style=padding:20px;text-align:center;font-size:12px;color:var(--mt)>—</div>'"><div class="ex-img-label">${i?(window.T||((k)=>k))("sess_img_end"):(window.T||((k)=>k))("sess_img_start")}</div></div>`).join("")}</div>`:"";
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
      const _trL = window.tr || ((s)=>s);
      const _cur = window.LANG ? LANG.getLang() : "fr";
      const avoidLabel = _cur === "en" ? " — AVOID" : " — À ÉVITER";
      const altLabel = _cur === "en" ? "Alt: " : "Alt : ";
      return `<div class="l5-alert" style="background:${bg};border-color:${border};color:${r.level==='avoid'?'var(--ac)':p.color}">${p.icon} <b>${_trL(p.short)}${r.level==='avoid'?avoidLabel:''} :</b> ${_trL(r.msg)}${r.alt?` <i>(${altLabel}${_trL(r.alt)})</i>`:''}</div>`;
    }).join("");
    // v8.49 — suggestion APRE uniquement pour les exos pesés (sinon ça n'a pas de sens)
    const _isWeightLog = (ex.logType || "weight") === "weight";
    const sug = _isWeightLog ? getSuggestion(ex.name) : null;
    const sugHtml=sug?`<div class="suggest-line">🎯 ${sug.reason}</div>`:"";
    const sessCount=S.hist.filter(h=>(Date.now()-new Date(h.date))<36288e5).length;
    const deloadHtml=sessCount>=15&&S.phase!==2?`<div class="l5-alert" style="border-color:var(--ac);background:var(--ac10)">⚠️ ${sessCount} séances en 6 sem. sans deload — <b style="cursor:pointer;text-decoration:underline" onclick="setPhase(2)">Passer en Deload ?</b></div>`:"";
    const rm=get1RM(ex.name);
    // v8.49 — Affiche le 1RM seulement pour les exos pesés (logType absent ou "weight")
    const _logType = ex.logType || "weight";
    const isWeightLog = _logType === "weight";
    const rmHtml=(isWeightLog && rm)?`<div style="font-size:12px;color:var(--mt);text-align:center;margin-top:4px">1RM estimé: <b style="color:var(--tx)">${rm}kg</b></div>`:"";
    // En-tête + lignes adaptés au logType
    const _Tx = window.T || ((k)=>k);
    let sH = "";
    let logTypeHint = "";
    if(_logType === "reps_bw"){
      logTypeHint = `<div style="background:var(--ok10);border-left:3px solid var(--ok);padding:8px 10px;border-radius:6px;font-size:12px;color:var(--t2);margin-bottom:8px">${_Tx("sess_logtype_hint_reps_bw")}</div>`;
      sH=`<div class="sets-header" style="grid-template-columns:40px 1fr 40px"><span>Set</span><span>${_Tx("sess_col_reps")}</span><span></span></div>`;
      for(let si=0;si<nSets;si++){const l=S.log[ex.id]?.[si];sH+=`<div class="set-row" style="grid-template-columns:40px 1fr 40px"><div class="set-num ${l?.reps?'set-done':'set-empty'}">${si+1}</div><input class="inp" type="number" inputmode="numeric" placeholder="0" value="${l?.reps||''}" data-e="${ex.id}" data-s="${si}" data-f="r" onchange="onInp(this)"><div style="text-align:center;font-size:15px;color:${l?.reps?'var(--ok)':'var(--mt)'}">${l?.reps?'✓':'○'}</div></div>`;}
    } else if(_logType === "time"){
      logTypeHint = `<div style="background:var(--ok10);border-left:3px solid var(--ok);padding:8px 10px;border-radius:6px;font-size:12px;color:var(--t2);margin-bottom:8px">${_Tx("sess_logtype_hint_time")}</div>`;
      sH=`<div class="sets-header" style="grid-template-columns:40px 1fr 40px"><span>Set</span><span>${_Tx("sess_col_time")}</span><span></span></div>`;
      for(let si=0;si<nSets;si++){const l=S.log[ex.id]?.[si];sH+=`<div class="set-row" style="grid-template-columns:40px 1fr 40px"><div class="set-num ${l?.time?'set-done':'set-empty'}">${si+1}</div><input class="inp" type="number" inputmode="numeric" placeholder="30" value="${l?.time||''}" data-e="${ex.id}" data-s="${si}" data-f="t" onchange="onInp(this)"><div style="text-align:center;font-size:15px;color:${l?.time?'var(--ok)':'var(--mt)'}">${l?.time?'✓':'○'}</div></div>`;}
    } else if(_logType === "cardio"){
      logTypeHint = `<div style="background:var(--ok10);border-left:3px solid var(--ok);padding:8px 10px;border-radius:6px;font-size:12px;color:var(--t2);margin-bottom:8px">${_Tx("sess_logtype_hint_cardio")}</div>`;
      sH=`<div class="sets-header"><span>Set</span><span>${_Tx("sess_col_min")}</span><span>${_Tx("sess_col_km")}</span><span></span></div>`;
      for(let si=0;si<nSets;si++){const l=S.log[ex.id]?.[si];sH+=`<div class="set-row"><div class="set-num ${l?.duration?'set-done':'set-empty'}">${si+1}</div><input class="inp" type="number" inputmode="decimal" placeholder="10" value="${l?.duration||''}" data-e="${ex.id}" data-s="${si}" data-f="dur" onchange="onInp(this)"><input class="inp" type="number" inputmode="decimal" step="0.1" placeholder="—" value="${l?.km||''}" data-e="${ex.id}" data-s="${si}" data-f="km" onchange="onInp(this)"><div style="text-align:center;font-size:15px;color:${l?.duration?'var(--ok)':'var(--mt)'}">${l?.duration?'✓':'○'}</div></div>`;}
    } else if(_logType === "distance_load"){
      logTypeHint = `<div style="background:var(--ok10);border-left:3px solid var(--ok);padding:8px 10px;border-radius:6px;font-size:12px;color:var(--t2);margin-bottom:8px">${_Tx("sess_logtype_hint_distance_load")}</div>`;
      sH=`<div class="sets-header"><span>Set</span><span>${_Tx("sess_col_m")}</span><span>${_Tx("sess_col_kg")}</span><span></span></div>`;
      for(let si=0;si<nSets;si++){const l=S.log[ex.id]?.[si];sH+=`<div class="set-row"><div class="set-num ${l?.distance?'set-done':'set-empty'}">${si+1}</div><input class="inp" type="number" inputmode="numeric" placeholder="30" value="${l?.distance||''}" data-e="${ex.id}" data-s="${si}" data-f="dist" onchange="onInp(this)"><input class="inp" type="number" inputmode="decimal" placeholder="20" value="${l?.weight||''}" data-e="${ex.id}" data-s="${si}" data-f="w" onchange="onInp(this)"><div style="text-align:center;font-size:15px;color:${l?.distance?'var(--ok)':'var(--mt)'}">${l?.distance?'✓':'○'}</div></div>`;}
    } else {
      // logType="weight" : comportement historique (kg + reps)
      sH=`<div class="sets-header"><span>Set</span><span>${_Tx("sess_col_kg")}</span><span>${_Tx("sess_col_reps")}</span><span></span></div>`;
      for(let si=0;si<nSets;si++){const l=S.log[ex.id]?.[si];sH+=`<div class="set-row"><div class="set-num ${l?'set-done':'set-empty'}">${si+1}</div><input class="inp" type="number" inputmode="decimal" placeholder="${sug?sug.weight:0}" value="${l?.weight||''}" data-e="${ex.id}" data-s="${si}" data-f="w" onchange="onInp(this)"><input class="inp" type="number" inputmode="numeric" placeholder="0" value="${l?.reps||''}" data-e="${ex.id}" data-s="${si}" data-f="r" onchange="onInp(this)"><div style="text-align:center;font-size:15px;color:${l?'var(--ok)':'var(--mt)'}">${l?'✓':'○'}</div></div>`;}
    }
    sH = logTypeHint + sH;
    // v8.49 — PR uniquement pour les exos pesés
    let pr="";if(isWeightLog){const prev=S.hist.find(h=>h.exercises.some(e=>e.name===ex.name));if(prev){const pe=prev.exercises.find(e=>e.name===ex.name);const b=Math.max(0,...Object.values(pe.logged||{}).map(s=>s.weight||0));if(b>0)pr=`<div class="pr-line">📊 Record: <b>${b}kg</b> — ${new Date(prev.date).toLocaleDateString("fr-FR")}</div>`;}}
    const subBadge = ex._substitutedFrom ? (() => {
      const p = PATHOLOGIES[ex._substitutedFor] || { icon: "⚕️", color: "var(--ok)", short: ex._substitutedFor };
      return `<div class="l5-alert" style="background:rgba(42,157,143,.10);border-color:${p.color};color:${p.color}">${p.icon} <b>${(window.T||((k)=>k))("sess_substituted")} (${(window.tr||((s)=>s))(p.short)}) :</b> ${(window.tr||((s)=>s))(ex._substitutedFrom)} → ${(window.tr||((s)=>s))(ex.name)}. ${(window.T||((k)=>k))("sess_substituted_for")}</div>`;
    })() : "";
    // v8.44 — Bouton swap pour les séances custom_program uniquement
    const isCustomProgSess = s.id === "custom_program";
    const swapBtn = isCustomProgSess ? `<button onclick="toggleSwapPanel('${ex.id}')" style="background:none;border:1px solid var(--bd);color:var(--mt);padding:5px 10px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;margin-left:6px">${(window.T||((k)=>k))("swap_btn")}</button>` : "";
    const swapPanel = (isCustomProgSess && _swapOpenFor === ex.id) ? rSwapPanel(ex) : "";
    // v8.50 — Prescription du protocole (FC cible, format, intensité concrète) — uniquement pour custom_program
    const prescriptionCard = (S.sess.id === "custom_program" && typeof rPrescriptionCard === "function") ? rPrescriptionCard(ex) : "";
    content=`<div class="card" style="padding:20px">
      <div style="margin-bottom:14px"><div class="ex-name" style="display:flex;align-items:center;flex-wrap:wrap;gap:6px">${(window.tr||((s)=>s))(ex.name)}<span class="phase-badge" style="background:${ph.color}22;color:${ph.color}">${(window.tr||((s)=>s))(ph.name)} ${ph.reps}</span>${swapBtn}</div><div class="ex-sets-info">${nSets}×${ph.reps} — ${(window.T||((k)=>k))("sess_rest")} ${rest}s</div><div class="ex-muscle-badge" style="background:${mc}22;color:${mc}">${(window.tr||((s)=>s))(MN[ex.muscle])}</div></div>
      ${prescriptionCard}${swapPanel}${subBadge}${l5alert}${pathAlerts}${deloadHtml}${imgs}${links}${ex.notes?`<div class="ex-notes">💡 ${ex.notes}</div>`:""}${coach}${sugHtml}${sH}
      <div style="margin-top:8px;margin-bottom:4px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--mt);margin-bottom:4px;font-weight:600">${(window.T||((k)=>k))("sess_rir_title")}</div><div style="display:flex;gap:4px">${[0,1,2,3,4].map(r=>{const active=S.log[ex.id]?.rir===r;return`<button onclick="setRIR('${ex.id}',${r})" style="flex:1;padding:6px;border-radius:8px;border:1px solid ${active?'var(--ok)':'var(--bd)'};background:${active?'var(--ok10)':'none'};color:${active?'var(--ok)':'var(--mt)'};font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${r}</button>`;}).join("")}</div><div style="font-size:11px;color:var(--mt);margin-top:3px;text-align:center">${(window.T||((k)=>k))("sess_rir_legend")}</div></div>
      <div class="timer" id="timerbox"><div class="timer-circle"><svg viewBox="0 0 52 52" style="transform:rotate(-90deg)"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--bd)" stroke-width="3"/><circle id="tring" cx="26" cy="26" r="22" fill="none" stroke="${mc}" stroke-width="3" stroke-dasharray="${2*Math.PI*22}" stroke-dashoffset="${2*Math.PI*22}" stroke-linecap="round"/></svg><div class="timer-time" id="tdisp">${Math.floor(rest/60)}:${String(rest%60).padStart(2,"0")}</div></div><div style="flex:1"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);margin-bottom:5px;font-weight:600">⏱ ${rest}s</div><div style="display:flex;gap:6px"><button class="tbtn tbtn-go" id="tbtn" onclick="tToggle(${rest})">Start</button><button class="tbtn tbtn-reset" onclick="tReset(${rest})">Reset</button></div></div></div>
      ${pr}${rmHtml}
      ${rExerciseHistoryCard(ex)}
      <div class="ex-nav">${ei>0?`<button class="btn2" aria-label="${(window.T||((k)=>k))("sess_back_aria")}" onclick="setEi(${ei-1})">←</button>`:''}<button class="btn" onclick="setEi(${ei+1})">${ei<s.exercises.length-1?(window.T||((k)=>k))("sess_next_btn"):(window.T||((k)=>k))("sess_wod_btn")}</button></div>
    </div>`;
  } else if(isWod&&!wod){
    // v8.76 — Safety net : si pour une raison X le pickWOD retourne null malgré le fallback,
    // on affiche un message clair au lieu d'une page vide (bug screenshot user).
    content=`<div class="card" style="text-align:center;padding:30px 20px">
      <div style="font-size:48px;margin-bottom:12px">🔥</div>
      <div style="font-size:16px;font-weight:800;color:var(--tx);margin-bottom:6px">Aucun WOD configuré</div>
      <div style="font-size:13px;color:var(--mt);margin-bottom:18px;line-height:1.5">Ce programme n'a pas de WOD assigné. Tu peux choisir un WOD depuis le menu Custom WOD ou terminer la séance ici.</div>
      <button class="btn btn-ok" onclick="finish()">${(window.T||((k)=>k))("sess_finish_btn")}</button>
    </div>`;
  } else if(isWod&&wod){
    const isForTime=!wod.duration||wod.type==="For Time";
    const isTabata=wod.type==="Tabata";
    const wodSec=isForTime?3600:wod.duration*60;
    const wodDir=isForTime?"up":"down";
    const wodLabel=isForTime?`${wod.type} — ${(window.T||((k)=>k))("sess_wod_freetimer")} (max 60min)`:`${wod.type} ${wod.duration} ${(window.T||((k)=>k))("sess_wod_min")} — ${(window.T||((k)=>k))("sess_wod_countdown")}`;
    const wodInit=isForTime?"0:00":`${Math.floor(wodSec/60)}:${String(wodSec%60).padStart(2,"0")}`;
    let wt;
    if(isTabata){
      // v8.67 — Timer Tabata dédié : anneau 16/32 segments work/rest + couleur dynamique
      const workS=20, restS=10;
      const rounds=Math.max(1, Math.round((wod.duration||4)*60/(workS+restS)));
      const totalSegs=rounds*2;
      const ringR=100, cx=120, cy=120, segGap=2;
      const segArc=(360/totalSegs)-segGap;
      let segments='';
      for(let i=0;i<totalSegs;i++){
        const startA=(i*(segArc+segGap))-90;
        const endA=startA+segArc;
        const sx=cx+ringR*Math.cos(startA*Math.PI/180);
        const sy=cy+ringR*Math.sin(startA*Math.PI/180);
        const ex=cx+ringR*Math.cos(endA*Math.PI/180);
        const ey=cy+ringR*Math.sin(endA*Math.PI/180);
        const isWork=(i%2)===0;
        const cls='tab-seg '+(isWork?'seg-work':'seg-rest');
        segments+=`<path class="${cls}" d="M${sx.toFixed(2)} ${sy.toFixed(2)} A${ringR} ${ringR} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}" data-i="${i}"/>`;
      }
      const totalMin=Math.round(rounds*(workS+restS)/60*10)/10;
      const _vm = typeof isWodVoiceMuted==='function' && isWodVoiceMuted();
      wt=`<div class="tabata-wrap" id="tabata-stage-wrap" data-phase="idle">
        <button class="tab-fs-btn" onclick="toggleTimerFullscreen()" title="Mode focus" aria-label="Mode focus">⛶</button>
        <button class="tab-voice-btn" data-muted="${_vm?1:0}" onclick="toggleWodVoice()" title="Voix on/off" aria-label="Voix on/off">${_vm?'🔇':'🔊'}</button>
        <div class="tab-headline">
          <div class="tab-round-lbl">ROUND <span id="tab-round">0</span> / <span id="tab-rounds-total">${rounds}</span></div>
          <div class="tab-phase-pill" id="tab-phase-label">PRÊT</div>
        </div>
        <div class="tab-ring-wrap">
          <svg class="tab-ring" viewBox="0 0 240 240">
            <g>${segments}</g>
            <circle id="tab-phase-progress" cx="120" cy="120" r="76" fill="none" stroke="var(--bd)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(2*Math.PI*76).toFixed(2)}" stroke-dashoffset="${(2*Math.PI*76).toFixed(2)}" transform="rotate(-90 120 120)"/>
          </svg>
          <div class="tab-center">
            <div class="tab-time" id="tab-time">${workS}</div>
            <div class="tab-unit">SECONDES</div>
          </div>
        </div>
        <div class="tab-actions">
          <button class="tbtn tbtn-go" id="tab-start" onclick="tabataStart(${workS},${restS},${rounds})">START</button>
          <button class="tbtn tbtn-reset" onclick="tabataReset(${workS},${restS},${rounds})">RESET</button>
        </div>
        <div class="tab-hint">${rounds} × (${workS}s effort + ${restS}s repos) — ${totalMin} min</div>
      </div>`;
    } else if(wod.type==="EMOM"){
      // v8.69 — Timer EMOM dédié : rangée de pastilles + cercle de progression de la minute en cours
      const totalMin=wod.duration||10;
      const pills=Array.from({length:totalMin},(_,i)=>`<div class="em-pill" data-i="${i}"><span class="em-pill-n">${i+1}</span></div>`).join('');
      const c100=(2*Math.PI*100).toFixed(2);
      const _vmEm = typeof isWodVoiceMuted==='function' && isWodVoiceMuted();
      wt=`<div class="emom-wrap tabata-wrap" id="emom-wrap" data-phase="idle">
        <button class="tab-fs-btn" onclick="toggleTimerFullscreen()" title="Mode focus" aria-label="Mode focus">⛶</button>
        <button class="tab-voice-btn" data-muted="${_vmEm?1:0}" onclick="toggleWodVoice()" title="Voix on/off" aria-label="Voix on/off">${_vmEm?'🔇':'🔊'}</button>
        <div class="tab-headline">
          <div class="tab-round-lbl">MINUTE <span id="em-curmin">0</span> / ${totalMin}</div>
          <div class="tab-phase-pill" id="em-phase">PRÊT</div>
        </div>
        <div class="tab-ring-wrap em-ring-wrap">
          <svg class="tab-ring" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="100" stroke="var(--bd)" stroke-width="6" fill="none"/>
            <circle id="em-progress" cx="120" cy="120" r="100" stroke="var(--info)" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="${c100}" stroke-dashoffset="${c100}" transform="rotate(-90 120 120)"/>
          </svg>
          <div class="tab-center">
            <div class="tab-time em-time" id="em-time">60</div>
            <div class="tab-unit">SECONDES AVANT TOP</div>
          </div>
        </div>
        <div class="em-pills-row">${pills}</div>
        <div class="tab-actions">
          <button class="tbtn tbtn-go" id="em-start" onclick="emomStart(${totalMin})">START</button>
          <button class="tbtn tbtn-reset" onclick="emomReset(${totalMin})">RESET</button>
        </div>
        <div class="tab-hint">À chaque top, tu enchaînes la minute suivante</div>
      </div>`;
    } else if(wod.type==="AMRAP"){
      // v8.69 — Timer AMRAP dédié : grand cercle de temps + compteur de tours + splits
      const totalMin=wod.duration||10;
      const c110=(2*Math.PI*110).toFixed(2);
      const _vmAm = typeof isWodVoiceMuted==='function' && isWodVoiceMuted();
      wt=`<div class="amrap-wrap tabata-wrap" id="amrap-wrap" data-phase="idle">
        <button class="tab-fs-btn" onclick="toggleTimerFullscreen()" title="Mode focus" aria-label="Mode focus">⛶</button>
        <button class="tab-voice-btn" data-muted="${_vmAm?1:0}" onclick="toggleWodVoice()" title="Voix on/off" aria-label="Voix on/off">${_vmAm?'🔇':'🔊'}</button>
        <div class="tab-headline">
          <div class="tab-round-lbl">AMRAP · ${totalMin} MIN</div>
          <div class="tab-phase-pill" id="am-phase">PRÊT</div>
        </div>
        <div class="tab-ring-wrap am-ring-wrap">
          <svg class="tab-ring" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="110" stroke="var(--bd)" stroke-width="6" fill="none"/>
            <circle id="am-progress" cx="130" cy="130" r="110" stroke="var(--wa)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${c110}" stroke-dashoffset="${c110}" transform="rotate(-90 130 130)"/>
          </svg>
          <div class="tab-center am-center">
            <div class="am-rounds" id="am-rounds">0</div>
            <div class="am-rounds-lbl">TOURS</div>
            <div class="am-clock" id="am-clock">${totalMin}:00</div>
          </div>
        </div>
        <button class="am-add-btn" id="am-add" onclick="amrapAddRound()" disabled style="opacity:.45">＋ 1 TOUR</button>
        <div class="am-splits" id="am-splits"><div class="am-no-splits">Tape « + 1 TOUR » à chaque tour complété</div></div>
        <div class="tab-actions">
          <button class="tbtn tbtn-go" id="am-start" onclick="amrapStart(${totalMin})">START</button>
          <button class="tbtn tbtn-reset" onclick="amrapReset(${totalMin})">RESET</button>
        </div>
        <div class="tab-hint">Max de tours en ${totalMin} min</div>
      </div>`;
    } else if(wod.type==="For Time"){
      // v8.69 — Timer For Time dédié : chrono ascendant + checklist mouvements avec split times
      const moves=(wod.movements||[]).map((m,i)=>`<div class="ft-move" data-i="${i}">
        <input type="checkbox" class="ft-check" id="ftc-${i}" data-i="${i}" onchange="ftimeToggleMove(${i})">
        <label class="ft-move-lbl" for="ftc-${i}">${esc(m.name)}</label>
        <div class="ft-split-time"></div>
      </div>`).join('');
      const movesCount=(wod.movements||[]).length;
      const _vmFt = typeof isWodVoiceMuted==='function' && isWodVoiceMuted();
      wt=`<div class="ftime-wrap tabata-wrap" id="ftime-wrap" data-phase="idle">
        <button class="tab-fs-btn" onclick="toggleTimerFullscreen()" title="Mode focus" aria-label="Mode focus">⛶</button>
        <button class="tab-voice-btn" data-muted="${_vmFt?1:0}" onclick="toggleWodVoice()" title="Voix on/off" aria-label="Voix on/off">${_vmFt?'🔇':'🔊'}</button>
        <div class="tab-headline">
          <div class="tab-round-lbl">FOR TIME · <span id="ft-progress">0 / ${movesCount}</span></div>
          <div class="tab-phase-pill" id="ft-phase">PRÊT</div>
        </div>
        <div class="ft-clock-box">
          <div class="ft-clock" id="ft-clock">0:00</div>
          <div class="ft-clock-lbl">CHRONO ASCENDANT</div>
        </div>
        <div class="ft-moves">${moves}</div>
        <div class="tab-actions">
          <button class="tbtn tbtn-go" id="ft-start" onclick="ftimeStart()">START</button>
          <button class="tbtn tbtn-reset" onclick="ftimeReset()">RESET</button>
        </div>
        <div class="tab-hint">Coche chaque mouvement complété pour enregistrer ton split</div>
      </div>`;
    } else {
      wt=`<div class="timer" id="timerbox"><div class="timer-circle"><svg viewBox="0 0 52 52" style="transform:rotate(-90deg)"><circle cx="26" cy="26" r="22" fill="none" stroke="var(--bd)" stroke-width="3"/><circle id="tring" cx="26" cy="26" r="22" fill="none" stroke="var(--wa)" stroke-width="3" stroke-dasharray="${2*Math.PI*22}" stroke-dashoffset="${2*Math.PI*22}" stroke-linecap="round"/></svg><div class="timer-time" id="tdisp">${wodInit}</div></div><div style="flex:1"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);margin-bottom:5px;font-weight:600">⏱ ${wodLabel}</div><div style="display:flex;gap:6px"><button class="tbtn tbtn-go" id="tbtn" onclick="tToggle(${wodSec},'${wodDir}')">Start</button><button class="tbtn tbtn-reset" onclick="tReset(${wodSec},'${wodDir}')">Reset</button></div></div></div>`;
    }
    const wodHeaderDur=isForTime?`<span style="background:var(--wa)22;color:var(--wa);padding:2px 8px;border-radius:6px;font-size:13px;margin-left:8px">For Time</span>`:`<span style="background:var(--wa)22;color:var(--wa);padding:2px 8px;border-radius:6px;font-size:13px;margin-left:8px">${wod.duration} min</span>`;
    // v8.33 : bannière de compatibilité WOD vs pathologies actives
    const userPaths_w = (S.health && S.health.pathologies) || [];
    const wodRisks = (typeof wodRiskPathologies === "function") ? wodRiskPathologies(wod, userPaths_w) : [];
    let wodBanner = "";
    if(userPaths_w.length){
      if(wodRisks.length){
        // WOD risqué (probable Custom choisi manuellement)
        const labels = wodRisks.map(k => (PATHOLOGIES[k] && PATHOLOGIES[k].short) || k).join(", ");
        wodBanner = `<div class="l5-alert" style="background:rgba(230,57,70,.10);border-color:var(--ac);color:var(--ac);margin-bottom:10px">⚠️ <b>Mouvements à risque (${labels}) :</b> ce WOD contient des mouvements à éviter pour ta/tes pathologie(s). Modifie ou skip les mouvements concernés.</div>`;
      } else {
        // WOD validé sécurisé
        const labels = userPaths_w.map(k => (PATHOLOGIES[k] && PATHOLOGIES[k].short) || k).join(", ");
        wodBanner = `<div class="l5-alert" style="background:rgba(42,157,143,.10);border-color:var(--ok);color:var(--ok);margin-bottom:10px">✓ <b>${(window.T||((k)=>k))("sess_wod_compatible")} (${labels}) :</b> ${(window.T||((k)=>k))("sess_wod_no_risk")}</div>`;
      }
    }
    content=`<div class="card"><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:var(--wa);margin-bottom:4px">WOD — ${wod.type}${wodHeaderDur}</div><div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:${wod.desc?'4px':'10px'}">${wod.name}</div>${wod.desc?`<div style="font-size:12px;color:var(--mt);font-style:italic;margin-bottom:10px;line-height:1.4">${esc((window.tr||((s)=>s))(wod.desc))}</div>`:""}${wodBanner}${wt}<div style="margin-top:14px">${wod.movements.map(m=>`<div class="wod-move">${m.img?`<div class="wod-img"><img src="${m.img}" alt="${esc(m.name)}" loading="lazy" decoding="async" onerror="this.parentElement.style.display='none'"></div>`:''}<div style="flex:1"><div style="font-size:13px">${m.name}</div><div style="display:flex;gap:4px;margin-top:3px"><a href="${wk(m.name)}" target="_blank" style="font-size:10px;color:#4ecdc4;text-decoration:none;background:rgba(78,205,196,.1);padding:2px 6px;border-radius:4px;font-weight:600">Wiki</a>${m.yt?`<a href="${m.yt}" target="_blank" style="font-size:10px;color:#ff0000;text-decoration:none;background:rgba(255,0,0,.08);padding:2px 6px;border-radius:4px;font-weight:600">${(window.T||((k)=>k))("sess_video_label")}</a>`:``}</div></div></div>`).join("")}</div><div style="margin-top:16px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);margin-bottom:6px;font-weight:600">${(window.T||((k)=>k))("sess_notes_label")}</div><textarea class="inp" id="sN" placeholder="${(window.T||((k)=>k))("sess_notes_placeholder")}" oninput="S.notes=this.value;saveA()">${esc(S.notes)}</textarea></div><button class="btn btn-ok" style="margin-top:14px" onclick="finish()">${(window.T||((k)=>k))("sess_finish_btn")}</button></div>`;
  }
  return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" aria-label="${(window.T||((k)=>k))("sess_quit_confirm")}" onclick="if(confirm((window.T||((k)=>k))('sess_quit_confirm'))){S.sess=null;saveA();nav('home')}">←</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:${s.color}">${s.name}</div><div style="font-size:13px;color:var(--mt)">${elapsed}min</div></div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${s.color}"></div></div></div><div class="pills">${pills}</div>
    ${(T.on||T.done)&&ex&&!document.getElementById("timerbox")?`<div onclick="setEi(S._timerExIdx)" style="position:fixed;top:0;left:50%;transform:translateX(-50%);max-width:480px;width:100%;background:var(--cd2);border-bottom:2px solid ${T.done?'var(--ok)':'var(--ac)'};padding:8px 16px;display:flex;align-items:center;justify-content:space-between;z-index:99;cursor:pointer"><div style="font-size:13px;color:${T.done?'var(--ok)':'var(--ac)'};font-weight:700">${T.done?'✓ Timer fini !':'⏱ Timer en cours...'}</div><div style="font-size:13px;font-weight:700;font-family:monospace" id="floatTimer"></div></div>`:``}
    ${content}`;
}

// P1 #10 : ACHIEVEMENTS CARD (badges débloqués + progression)
function rAchievementsCard(){
  if(typeof computeAchievements !== "function") return "";
  const _T = window.T || ((k)=>k);
  const _tr = window.tr || ((s)=>s);
  const all = computeAchievements(S.hist, S);
  const earned = all.filter(a => a.earned);
  const inProgress = all.filter(a => !a.earned && a.progress > 0).sort((a,b) => b.progress - a.progress).slice(0, 3);
  const badge = (a, isEarned) => {
    const opa = isEarned ? "1" : "0.4";
    const color = isEarned ? "var(--tx)" : "var(--mt)";
    return `<div style="text-align:center;flex-shrink:0;width:78px;opacity:${opa}" title="${_tr(a.ach.desc)}">
      <div style="font-size:34px;filter:${isEarned?'none':'grayscale(0.7)'};margin-bottom:3px">${a.ach.icon}</div>
      <div style="font-size:11px;font-weight:700;color:${color};line-height:1.2">${_tr(a.ach.name)}</div>
      ${!isEarned ? `<div style="font-size:10px;color:var(--mt);margin-top:2px">${Math.round(a.progress*100)}%</div>` : ''}
    </div>`;
  };
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:13px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:1px;display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:14px;display:inline-block">${SVG.trophy.replace('width="18" height="18"','width="14" height="14"')}</span><span>${_T("ach_card_title")} (${earned.length}/${all.length})</span></div>
      <button class="btn2" style="padding:5px 10px;font-size:11px" onclick="nav('achievements')">${_T("ach_view_all")}</button>
    </div>
    ${earned.length ? `<div style="display:flex;gap:8px;overflow-x:auto;padding:4px 0">${earned.slice(-6).reverse().map(a=>badge(a,true)).join("")}</div>` : `<div style="font-size:13px;color:var(--mt);text-align:center;padding:10px">${_T("ach_empty")}</div>`}
    ${inProgress.length ? `<div style="margin-top:14px;border-top:1px solid var(--bd);padding-top:12px">
      <div style="font-size:11px;color:var(--mt);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">${_T("ach_coming")}</div>
      <div style="display:flex;gap:8px;overflow-x:auto;padding:4px 0">${inProgress.map(a=>badge(a,false)).join("")}</div>
    </div>` : ''}
  </div>`;
}

// Vue dédiée : tous les achievements groupés par catégorie
function rAchievements(){
  const _T = window.T || ((k)=>k);
  const _tr = window.tr || ((s)=>s);
  const all = computeAchievements(S.hist, S);
  const cats = {};
  all.forEach(a => {
    const c = a.ach.cat || "Autre";
    if(!cats[c]) cats[c] = [];
    cats[c].push(a);
  });
  const catLabels = {
    "assiduité":   _T("ach_cat_assiduity"),
    "streak":      _T("ach_cat_streak"),
    "variété":     _T("ach_cat_variety"),
    "performance": _T("ach_cat_performance"),
    "cardio":      _T("ach_cat_cardio"),
    "core":        _T("ach_cat_core")
  };
  const earned = all.filter(a => a.earned).length;
  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:6px 12px;font-size:12px" onclick="nav('history')">${_T("ach_back")}</button><h1 class="page-title" style="color:var(--ac);display:inline-flex;align-items:center;gap:8px"><span style="width:20px;height:20px;display:inline-block">${SVG.trophy.replace('width="18" height="18"','width="20" height="20"')}</span><span>${_T("ach_title")}</span></h1><div style="width:80px"></div></div></div>
    <div class="card" style="text-align:center;padding:18px"><div style="font-size:32px;font-weight:900;color:var(--ac)">${earned} / ${all.length}</div><div style="font-size:13px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-top:4px">${_T("ach_unlocked")}</div></div>
    ${Object.entries(cats).map(([cat, items]) => `
      <h2 class="sec-title">${catLabels[cat] || cat}</h2>
      <div class="card">${items.map(a => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--bd);opacity:${a.earned?1:0.5}">
          <div style="font-size:32px;flex-shrink:0;filter:${a.earned?'none':'grayscale(0.7)'}">${a.ach.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:800;color:${a.earned?'var(--tx)':'var(--t2)'}">${_tr(a.ach.name)}</div>
            <div style="font-size:12px;color:var(--mt);margin-top:2px">${_tr(a.ach.desc)}</div>
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

  // v8.66 — Card de partage enrichie : volume total + WOD inclus
  // Calcule le VOLUME TOTAL d'entraînement (kg × reps cumulés)
  let totalVolume = 0;
  let totalSets = 0;
  (h.exercises || []).forEach(e => {
    Object.values(e.logged || {}).forEach(x => {
      const w = x.weight || 0, r = x.reps || 0;
      if(w > 0 && r > 0){ totalVolume += w * r; totalSets += 1; }
    });
  });
  // Format : >= 1000 kg → "X.Yt", sinon "X kg"
  const fmtVolume = totalVolume >= 1000
    ? (totalVolume / 1000).toFixed(1).replace(/\.0$/, "") + " t"
    : Math.round(totalVolume) + " kg";

  // Background dégradé
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, "#E63946");
  grad.addColorStop(1, "#264653");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Logo FITStark en haut
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "900 80px -apple-system, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("FITSTARK", 540, 120);
  ctx.font = "700 28px -apple-system, sans-serif";
  ctx.fillText(new Date(h.date).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}), 540, 165);

  // Carte centrale (plus haute pour caser WOD + volume)
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.roundRect ? (ctx.beginPath(), ctx.roundRect(60, 215, 960, 720, 30), ctx.fill()) : ctx.fillRect(60, 215, 960, 720);

  // Session name
  ctx.fillStyle = "#fff";
  ctx.font = "900 100px -apple-system, sans-serif";
  ctx.fillText(h.sessionName || "Séance", 540, 320);

  // Duration + phase
  ctx.font = "700 32px -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(`${h.duration||0} min${h.phase ? " · " + h.phase : ""}`, 540, 370);

  // WOD badge (si présent)
  let cursorY = 425;
  if(h.wodName){
    ctx.fillStyle = "rgba(244,162,97,0.18)";
    const wodTxt = `🔥 WOD : ${h.wodName.length > 28 ? h.wodName.slice(0, 27) + "…" : h.wodName}`;
    ctx.font = "800 28px -apple-system, sans-serif";
    const wodWidth = Math.min(820, ctx.measureText(wodTxt).width + 40);
    const wodX = 540 - wodWidth / 2;
    ctx.roundRect ? (ctx.beginPath(), ctx.roundRect(wodX, cursorY, wodWidth, 56, 14), ctx.fill()) : ctx.fillRect(wodX, cursorY, wodWidth, 56);
    ctx.fillStyle = "#F4A261";
    ctx.fillText(wodTxt, 540, cursorY + 38);
    cursorY += 80;
  }

  // VOLUME TOTAL — gros chiffre en évidence
  if(totalVolume > 0){
    ctx.fillStyle = "rgba(42,157,143,0.18)";
    ctx.roundRect ? (ctx.beginPath(), ctx.roundRect(170, cursorY, 740, 110, 18), ctx.fill()) : ctx.fillRect(170, cursorY, 740, 110);
    // Volume value (très gros)
    ctx.fillStyle = "#FFD480";
    ctx.font = "900 64px -apple-system, sans-serif";
    ctx.fillText(fmtVolume, 540, cursorY + 60);
    // Label "VOLUME TOTAL"
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "700 22px -apple-system, sans-serif";
    ctx.fillText(`VOLUME TOTAL · ${totalSets} SETS`, 540, cursorY + 92);
    cursorY += 130;
  }

  // Top exercices par volume (3 max si WOD présent, 4 sinon)
  const maxExos = h.wodName ? 3 : 4;
  const exos = (h.exercises||[]).map(e => {
    const vol = Object.values(e.logged||{}).reduce((s,x) => s + (x.weight||0)*(x.reps||0), 0);
    const max = Math.max(0, ...Object.values(e.logged||{}).map(x => x.weight||0));
    return { name: e.name, vol, max };
  }).filter(e => e.vol > 0).sort((a,b) => b.vol - a.vol).slice(0, maxExos);
  ctx.font = "700 32px -apple-system, sans-serif";
  exos.forEach(e => {
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(e.name.length > 22 ? e.name.slice(0,21)+"…" : e.name, 130, cursorY);
    ctx.textAlign = "right";
    ctx.fillStyle = "#F4A261";
    ctx.fillText(`${e.max} kg`, 950, cursorY);
    cursorY += 55;
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
    // v8.66 — texte de partage enrichi avec volume + WOD
    const shareText = [
      `Séance ${h.sessionName} de ${h.duration}min`,
      totalVolume > 0 ? `Volume : ${fmtVolume}` : "",
      h.wodName ? `WOD : ${h.wodName}` : "",
      "via FITStark 💪"
    ].filter(Boolean).join(" · ");
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      try {
        await navigator.share({
          files: [file],
          title: `Ma séance ${h.sessionName}`,
          text: shareText
        });
      } catch(e) { /* user cancelled */ }
    } else {
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
  const _Thm = window.T || ((k)=>k);
  return `<div class="card">
    <div style="font-size:13px;font-weight:700;color:var(--t2);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">${_Thm("heatmap_title")}</div>
    <div style="display:grid;grid-template-columns:repeat(${cols.length},${cellSize}px);grid-template-rows:repeat(7,${cellSize}px);gap:${gap}px;justify-content:center">${gridHtml}</div>
    <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--mt);margin-top:10px;justify-content:flex-end">
      <span>${_Thm("heatmap_less")}</span>
      <span style="width:11px;height:11px;background:${color(0)};border-radius:2px"></span>
      <span style="width:11px;height:11px;background:${color(1)};border-radius:2px"></span>
      <span style="width:11px;height:11px;background:${color(2)};border-radius:2px"></span>
      <span style="width:11px;height:11px;background:${color(3)};border-radius:2px"></span>
      <span>${_Thm("heatmap_more")}</span>
    </div>
  </div>`;
}

function rHist(){
  const names=[];S.hist.forEach(h=>h.exercises.forEach(e=>{if(Object.keys(e.logged||{}).length&&!names.includes(e.name))names.push(e.name);}));
  const wv={};S.hist.forEach(h=>{const d=new Date(h.date),ws=new Date(d);ws.setDate(d.getDate()-d.getDay()+1);const k=ws.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"});if(!wv[k])wv[k]={s:k,v:0};h.exercises.forEach(x=>Object.values(x.logged||{}).forEach(s=>{wv[k].v+=((s.weight||0)*(s.reps||0));}));});
  const wvData=Object.values(wv).slice(-10);
  const getExProg=(n)=>S.hist.filter(h=>h.exercises.some(e=>e.name===n)).reverse().map(h=>{const x=h.exercises.find(e=>e.name===n);const sets=Object.values(x.logged||{});return{d:new Date(h.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),kg:sets.length?Math.max(...sets.map(s=>s.weight||0)):0};}).slice(-10);

  const _T = window.T || ((k)=>k);
  const _tr = window.tr || ((s)=>s);
  const locale = (window.LANG && LANG.getLang()==='en') ? "en-US" : "fr-FR";
  let charts="";
  if(wvData.length>1)charts+=`<div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:8px">${_T("hist_vol_weekly")}</div>${svgBar(wvData,"s","v","#E63946",300,120)}</div>`;
  if(names.length)charts+=`<div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:8px">${_T("hist_max_per_ex")}</div><select class="inp" style="margin-bottom:8px" onchange="document.getElementById('exC').innerHTML=getExChartHTML(this.value)">${names.map(n=>`<option value="${esc(n)}">${esc(_tr(n))}</option>`).join("")}</select><div id="exC">${svgLine(getExProg(names[0]),"d","kg","#457B9D",300,120)}</div></div>`;

  // v8.70 — Section Records WOD : meilleur score par WOD complété
  const wodPBs = (typeof getAllWodPBs === 'function') ? getAllWodPBs() : [];
  const wodPBsHtml = wodPBs.length ? `<div class="card wod-pb-card">
    <div style="font-size:13px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:6px">🏆 Records WOD <span style="color:var(--mt);font-weight:500;letter-spacing:0;text-transform:none">(${wodPBs.length})</span></div>
    <div class="wod-pb-list">${wodPBs.slice(0,12).map(r => {
      const txt = formatWodResult(r);
      const colorByType = {Tabata:'var(--ac)', EMOM:'var(--info)', AMRAP:'var(--wa)', 'For Time':'var(--ok)'};
      const c = colorByType[r.type] || 'var(--mt)';
      const d = new Date(r.date).toLocaleDateString(locale, {day:'2-digit', month:'short'});
      return `<div class="wod-pb-row">
        <div class="wod-pb-type" style="background:${c}22;color:${c}">${r.type}</div>
        <div class="wod-pb-name">${esc(r.wodName)}</div>
        <div class="wod-pb-score">${txt}</div>
        <div class="wod-pb-date">${d}</div>
      </div>`;
    }).join('')}</div>
  </div>` : '';

  if(!S.hist.length)return`<div class="hdr"><h1 class="page-title">${_T("hist_title")}</h1></div>${charts}<div class="card" style="text-align:center;color:var(--mt);padding:30px">${_T("hist_empty")}</div>`;
  return`<div class="hdr"><h1 class="page-title">${_T("hist_title")}</h1></div><div style="padding:0 14px 8px;display:flex;gap:8px"><button class="btn2" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px" onclick="exportCSV()">${SVG.download}${_T("hist_csv")}</button><button class="btn2" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px" onclick="shareLastWorkout()">${SVG.share}${_T("hist_share")}</button></div>${rCalendarHeatmap()}${rAchievementsCard()}${wodPBsHtml}${charts}`+
  S.hist.map((h,hi)=>{const col=h.sessionId==='cardio'?'#06b6d4':(PROG.sessions.find(s=>s.id===h.sessionId)?.color||"var(--ac)");const di="d"+hi;
    if(h.cardio){const c=h.cardio,ic=c.mode==='run'?'🏃':c.mode==='swim'?'🏊':'🚴';const stats=c.mode==='run'?`${c.duration}min · ${c.speed}km/h · ${c.incline}% ${_T("hist_incline")}`:c.mode==='swim'?`${c.distance}m · ${c.duration}min`:`${c.duration}min · ${c.incline}% · ${_T("hist_resistance")}${c.resistance}`;return`<div class="card"><div class="hist-top"><div style="font-size:14px;font-weight:900;letter-spacing:2px;color:${col}">${ic} ${esc(_tr(h.sessionName))}</div><div style="font-size:12px;color:var(--mt)">${new Date(h.date).toLocaleDateString(locale,{weekday:"short",day:"numeric",month:"short"})} • ${h.duration}min</div></div><div style="font-size:13px;color:var(--t2);margin-top:4px">${stats}</div>${h.notes?`<div style="font-size:13px;color:var(--mt);margin-top:5px;font-style:italic">"${esc(h.notes)}"</div>`:''}</div>`;}
    const det=h.exercises.map(x=>{const sets=Object.entries(x.logged||{});return sets.length?sets.map(([si,s])=>`<div style="display:grid;grid-template-columns:1fr 38px 38px 45px;gap:3px;font-size:12px;padding:2px 0"><span>${esc(_tr(x.name))}</span><span>${s.weight}kg</span><span>${s.reps}r</span><span style="color:var(--mt)">${(s.weight||0)*(s.reps||0)}</span></div>`).join(""):`<div style="font-size:12px;color:var(--mt)">${esc(_tr(x.name))}: —</div>`;}).join("");
    // v8.70 — Affichage résultat WOD + badge PB
    const wr = h.wodResult;
    let wodLine = '';
    if(h.wodName){
      const colorByType = {Tabata:'var(--ac)', EMOM:'var(--info)', AMRAP:'var(--wa)', 'For Time':'var(--ok)'};
      const wc = wr ? (colorByType[wr.type] || 'var(--wa)') : 'var(--wa)';
      const resTxt = wr ? formatWodResult(wr) : '';
      const pbBadge = wr && wr.isPB ? `<span style="background:linear-gradient(135deg,#FFD700,#FFA500);color:#000;font-size:10px;font-weight:900;padding:2px 7px;border-radius:6px;letter-spacing:1px;margin-left:6px">🏆 PB</span>` : '';
      const compIcon = wr && wr.completed ? '<span style="color:var(--ok);font-weight:900">✓</span> ' : (wr ? '<span style="color:var(--mt)">⚠ </span>' : '');
      wodLine = `<div style="font-size:12px;color:${wc};margin-bottom:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">${compIcon}<b>${esc(wr?.type||'WOD')}</b> · ${esc(h.wodName)} ${resTxt?`<span style="color:var(--t2);font-family:monospace;font-weight:700">${resTxt}</span>`:''}${pbBadge}</div>`;
    }
    return`<div class="card"><div class="hist-top"><div style="font-size:14px;font-weight:900;letter-spacing:2px;color:${col}">${esc(_tr(h.sessionName))}${h.phase?`<span class="phase-badge" style="background:var(--cd2);color:var(--t2)">${esc(_tr(h.phase))}</span>`:''}</div><div style="font-size:12px;color:var(--mt)">${new Date(h.date).toLocaleDateString(locale,{weekday:"short",day:"numeric",month:"short"})} • ${h.duration}min</div></div>${wodLine}<div class="hist-exos">${h.exercises.map(x=>{const b=Math.max(0,...Object.values(x.logged||{}).map(s=>s.weight||0));return`<div class="hist-exo">${esc(_tr(x.name))}: <b>${b}kg</b></div>`;}).join("")}</div>${h.notes?`<div style="font-size:13px;color:var(--mt);margin-top:5px;font-style:italic">"${esc(h.notes)}"</div>`:''}<button class="hist-toggle" onclick="const d=document.getElementById('${di}');d.classList.toggle('open');this.textContent=d.classList.contains('open')?'${_T("hist_hide")}':'${_T("hist_details")}'">${_T("hist_details")}</button><div class="hist-detail" id="${di}">${det}</div></div>`;}).join("");
}

// v8.38 — Card de sélection langue (FR/EN)
function rLangCard(){
  const cur = window.LANG ? LANG.getLang() : "fr";
  const T = window.T || ((k)=>k);
  return `<div class="card">
    <div style="font-size:14px;font-weight:700;margin-bottom:6px">${T("set_lang")}</div>
    <div style="font-size:12px;color:var(--mt);margin-bottom:12px">${T("set_lang_sub")}</div>
    <div style="display:flex;gap:8px">
      <button onclick="if(window.LANG){LANG.setLang('fr');}" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${cur==='fr'?'#E63946':'var(--bd)'};background:${cur==='fr'?'#E6394615':'var(--cd)'};cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;color:${cur==='fr'?'#E63946':'var(--tx)'}">🇫🇷 ${T("lang_fr")}</button>
      <button onclick="if(window.LANG){LANG.setLang('en');}" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${cur==='en'?'#E63946':'var(--bd)'};background:${cur==='en'?'#E6394615':'var(--cd)'};cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;color:${cur==='en'?'#E63946':'var(--tx)'}">🇬🇧 ${T("lang_en")}</button>
    </div>
  </div>`;
}
function rSett(){
  const T = window.T || ((k)=>k);
  return`<div class="hdr"><h1 class="page-title">${T("set_title")}</h1></div>
  <div class="card" style="display:flex;gap:8px;padding:14px 16px">
    <a href="/guide.html" target="_blank" rel="noopener" class="btn2" style="flex:1;text-align:center;text-decoration:none;color:var(--tx);padding:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700">📖 Guide</a>
    <a href="/landing-b.html" target="_blank" rel="noopener" class="btn2" style="flex:1;text-align:center;text-decoration:none;color:var(--tx);padding:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700">✨ À propos</a>
    <a href="https://ko-fi.com/leonydas3097" target="_blank" rel="noopener" class="btn2" style="flex:1;text-align:center;text-decoration:none;color:#fff;background:#FF5E5B;border-color:#FF5E5B;padding:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700">☕ Soutenir</a>
  </div>
  ${rLangCard()}
  ${rGoalCard()}
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">${(window.LANG&&LANG.getLang()==='en')?'Periodization':'Périodisation'}</div>${PHASES.map((p,i)=>`<div onclick="setPhase(${i})" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;margin-bottom:6px;cursor:pointer;border:2px solid ${S.phase===i?p.color:'var(--bd)'};background:${S.phase===i?p.color+'15':'none'}"><div style="width:12px;height:12px;border-radius:50%;background:${p.color}"></div><div><div style="font-size:13px;font-weight:700;color:${p.color}">${(window.tr||((s)=>s))(p.name)}</div><div style="font-size:13px;color:var(--t2)">${(window.tr||((s)=>s))(p.desc)} — ${p.numSets}×${p.reps} — ${(window.T||((k)=>k))("sess_rest")} ${p.rest}s</div></div></div>`).join("")}</div>
  ${rCustomBuilderCard()}
  ${rPathologiesCard()}
  ${rCustomProgramCard()}
  ${rSyncCard()}
  ${rNotifCard()}
  <div class="card" style="border-left:4px solid var(--in);background:rgba(69,123,157,.06)">
    <div style="font-size:14px;font-weight:700;margin-bottom:6px">${T("set_redo_onb_title")}</div>
    <div style="font-size:12px;color:var(--t2);margin-bottom:12px;line-height:1.5">${T("set_redo_onb_desc")}</div>
    <button class="btn2" style="background:var(--in);border-color:var(--in);color:#fff" onclick="restartOnboarding()">${T("set_redo_onb_btn")}</button>
  </div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">${T("set_data_title")}</div><div style="display:flex;flex-direction:column;gap:8px"><button class="btn2" onclick="exportCSV()">${T("set_export_csv")}</button><button class="btn2" onclick="doExp()">${T("set_export_json")}</button><button class="btn2" onclick="doImpUI()">${T("set_import")}</button>${S.hist.length?`<button class="btn2" style="color:var(--ac);border-color:var(--ac)" onclick="safeWipe()">${T("set_wipe")}</button>`:""}</div><div id="io"></div></div>
  <div class="card"><div style="font-size:13px;color:var(--t2);line-height:1.6">${T("data_localstorage")}<br><br><b style="color:var(--ac)">FITSTARK</b> v8.x — Cloud Sync<br>${T("data_about_features")}<br>${T("data_about_modes")}<br>${T("data_about_modules")}</div></div>
  <div class="card" style="text-align:center;font-size:13px;color:var(--mt);padding:14px;line-height:2">
    <a href="/privacy.html" target="_blank" rel="noopener" style="color:var(--in);text-decoration:none;font-weight:600">${T("footer_privacy")}</a>
    &nbsp;·&nbsp;
    <a href="/terms.html" target="_blank" rel="noopener" style="color:var(--in);text-decoration:none;font-weight:600">${T("footer_terms")}</a>
    <br>
    <a href="https://github.com/latludovic3097/apex-fitness" target="_blank" rel="noopener" style="color:var(--mt);text-decoration:none;font-size:12px">${T("footer_source")} — GitHub ↗</a>
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
  const _T = window.T || ((k)=>k);
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:6px">${_T("custom_builder_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">${_T("custom_choose_hint")} ${sel.length>1?_T("custom_selected_n_pl",{n:sel.length}):_T("custom_selected_n",{n:sel.length})}.</div>
    <div style="margin-bottom:12px"><input class="inp" type="text" placeholder="${_T("custom_name_placeholder")}" value="${esc((S.custom&&S.custom.name)||"")}" oninput="setCustomName(this.value)" style="font-size:14px"></div>
    ${muscleOrder.filter(m => byMuscle[m]).map(m => `
      <details style="margin-bottom:6px;border:1px solid var(--bd);border-radius:10px;overflow:hidden">
        <summary style="padding:9px 12px;font-size:13px;font-weight:700;cursor:pointer;background:var(--cd2);color:${MC[m]}">${(window.tr||((s)=>s))(MN[m])} <span style="float:right;color:var(--mt);font-weight:500">${byMuscle[m].filter(e=>sel.includes(e.id)).length}/${byMuscle[m].length}</span></summary>
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
    ${(typeof WODS!=="undefined" && WODS.custom && WODS.custom.length)?`
      <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--bd)">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px"><span style="font-size:14px">🔥</span>${(window.T||((k)=>k))("wod_optional")}</div>
        <div style="font-size:12px;color:var(--t2);margin-bottom:10px;line-height:1.5">
          ${(window.T||((k)=>k))("cw_add_wod_intro")} ${(S.custom && typeof S.custom.wodIdx==="number" && WODS.custom[S.custom.wodIdx])?`<b style="color:#8B5CF6">${esc(WODS.custom[S.custom.wodIdx].name)}</b> ${(window.T||((k)=>k))("cw_wod_selected")}. <button type="button" onclick="setCustomWod(null)" style="background:none;border:none;color:var(--mt);text-decoration:underline;cursor:pointer;font-family:inherit;font-size:12px;padding:0">${(window.T||((k)=>k))("cw_remove")}</button>`:(window.T||((k)=>k))("cw_no_wod")}
        </div>
        <div class="wod-filter-row" role="tablist">
          ${[['all',(window.T||((k)=>k))("cw_filter_all")],['express',(window.T||((k)=>k))("cw_filter_express")],['standard',(window.T||((k)=>k))("cw_filter_standard")],['long',(window.T||((k)=>k))("cw_filter_long")]].map(([k,lbl])=>`<button type="button" class="wod-filter${_wodFilter===k?' active':''}" role="tab" aria-selected="${_wodFilter===k?'true':'false'}" onclick="setWodFilter('${k}')">${lbl}</button>`).join("")}
        </div>
        ${(()=>{
          const cats={};
          WODS.custom.forEach((w,i)=>{
            if(!matchWodFilter(w, _wodFilter)) return;
            const c=w.cat||"Autre";
            (cats[c]=cats[c]||[]).push({w,idx:i});
          });
          const entries=Object.entries(cats);
          if(!entries.length) return `<div style="font-size:13px;color:var(--mt);text-align:center;padding:18px;background:var(--cd2);border-radius:10px">Aucun WOD ne correspond à ce filtre.</div>`;
          const _userPaths = (S.health && S.health.pathologies) || [];
          return entries.map(([cat,list])=>`
            <details style="margin-bottom:6px;border:1px solid var(--bd);border-radius:10px;overflow:hidden">
              <summary style="padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer;background:var(--cd2);color:var(--tx);list-style:none;min-height:44px;display:flex;align-items:center">${(window.tr||((s)=>s))(cat)} <span style="margin-left:auto;color:var(--mt);font-weight:500;font-size:12px">${list.length} WOD${list.length>1?'s':''}</span></summary>
              <div style="padding:8px">${list.map(({w,idx})=>{
                const wodRisks = (typeof wodRiskPathologies === "function") ? wodRiskPathologies(w, _userPaths) : [];
                const riskBadge = wodRisks.length
                  ? `<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(230,57,70,.10);color:var(--ac);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:4px">⚠️ Risque ${wodRisks.map(k => (PATHOLOGIES[k] && PATHOLOGIES[k].short) || k).join(", ")}</div>`
                  : (_userPaths.length ? `<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(42,157,143,.10);color:var(--ok);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:4px">✓ Compatible</div>` : "");
                return `<button type="button" class="custom-wod-card${(S.custom&&S.custom.wodIdx===idx)?' active':''}" onclick="setCustomWod(${idx})" aria-pressed="${(S.custom&&S.custom.wodIdx===idx)?'true':'false'}">
                  <div class="wod-type-tag">${w.type}${w.duration?` · ${w.duration} min`:''}</div>
                  <div class="wod-card-name">${esc(w.name)}</div>
                  <div class="wod-card-desc">${esc((window.tr||((s)=>s))(w.desc))}</div>
                  ${riskBadge}
                </button>`;
              }).join("")}</div>
            </details>`).join("");
        })()}
      </div>`:""}
    ${sel.length>0?`<button class="btn" style="background:#8B5CF6;border-color:#8B5CF6;margin-top:12px" onclick="goSess('custom')">${_T("custom_launch",{name:esc((S.custom&&S.custom.name)||_T("custom_label_upper"))})}</button>`:""}
  </div>`;
}
function setCustomWod(idx){
  const _defaultName = (window.T||((k)=>k))("custom_label_upper");
  if(!S.custom) S.custom = { name:_defaultName, exerciseIds:[] };
  if(idx === null || idx === S.custom.wodIdx) delete S.custom.wodIdx;
  else S.custom.wodIdx = idx;
  saveS(); R();
}
function setCustomName(v){ if(!S.custom)S.custom={exerciseIds:[]}; S.custom.name = v || (window.T||((k)=>k))("custom_label_upper"); saveS(); }
function toggleCustomExercise(id){
  if(!S.custom) S.custom = { name:(window.T||((k)=>k))("custom_label_upper"), exerciseIds:[] };
  if(!S.custom.exerciseIds) S.custom.exerciseIds = [];
  const i = S.custom.exerciseIds.indexOf(id);
  if(i>=0) S.custom.exerciseIds.splice(i,1);
  else S.custom.exerciseIds.push(id);
  saveS();
  // Pas besoin de R() ici — le checkbox change visuellement de lui-même
  // Mais on doit actualiser le compteur du <summary>
  R();
}

// ─── v8.29 : MON OBJECTIF CARD (single-select, modifie aussi S.phase) ───
function rGoalCard(){
  const _T = window.T || ((k)=>k);
  const current = S.goal || "muscle";
  const goals = [
    {k:"force",  name:_T("goal_force_name"),  desc:_T("goal_force_desc"),  emoji:"💪", color:"#E63946", phase:0},
    {k:"muscle", name:_T("goal_muscle_name"), desc:_T("goal_muscle_desc"), emoji:"🔥", color:"#457B9D", phase:1},
    {k:"lean",   name:_T("goal_lean_name"),   desc:_T("goal_lean_desc"),   emoji:"🌿", color:"#2A9D8F", phase:1},
    {k:"rehab",  name:_T("goal_rehab_name"),  desc:_T("goal_rehab_desc"),  emoji:"🦴", color:"#F4A261", phase:2}
  ];
  const items = goals.map(g => {
    const on = current === g.k;
    return `<button onclick="setGoal('${g.k}', ${g.phase})" style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:11px;border:2px solid ${on?g.color:'var(--bd)'};background:${on?g.color+'15':'var(--cd)'};cursor:pointer;font-family:inherit;text-align:left;width:100%;margin-bottom:6px;transition:all .12s">
      <span style="font-size:22px;flex-shrink:0">${g.emoji}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:800;color:${on?g.color:'var(--tx)'};margin-bottom:2px">${g.name}</div>
        <div style="font-size:12px;color:var(--t2);line-height:1.4">${g.desc}</div>
      </div>
      <span style="font-size:18px;color:${on?g.color:'var(--mt)'};font-weight:900;flex-shrink:0">${on?'✓':''}</span>
    </button>`;
  }).join("");
  return `<div class="card">
    <div style="font-size:14px;font-weight:700;margin-bottom:6px">${_T("goal_card_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">${_T("goal_card_sub")}</div>
    ${items}
  </div>`;
}
function setGoal(key, phaseIdx){
  S.goal = key;
  S.phase = phaseIdx;
  saveS();
  R();
}

// ─── P1 #8 : PATHOLOGIES CARD (multi-select) ───

// v8.50 — Card "Comment exécuter" : montre la prescription concrète (FC, intensité, format)
// pour chaque exercice d'une séance custom_program. Convertit "85-95% FCmax" → BPM réel
// selon l'âge de l'utilisateur (formule Fox: 220 - age).
function rPrescriptionCard(ex){
  if(!S.sess || !S.sess._cpMethod) return "";
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const m = S.sess._cpMethod;
  const sc = S.sess._cpSessConfig || {};
  const logType = ex.logType || "weight";
  const userAge = (S.nut && S.nut.age) || 30;
  const maxHR = 220 - userAge;

  // v8.53 : si la méthode a un override pour ce logType, utilise-le (résout les mismatches type HIIT_strength)
  const override = (m.perLogType && m.perLogType[logType]) || null;
  let intensity = override && override.intensity ? _pl(override.intensity) : (m.intensity || "");

  // Garde anti-mismatch : si l'exo est cardio mais intensity parle de "1RM" (méthode pas hybride
  // mais le picker a pris un cardio quand même), affiche un fallback générique cardio.
  if(logType === "cardio" && /1RM|lift\s+\d+/i.test(intensity)){
    intensity = (window.LANG && LANG.getLang() === "en")
      ? "Sustained intense effort over the full duration"
      : "Effort intense soutenu sur toute la durée";
  }
  // Pareil pour les exos isométriques : intensity en "% 1RM" n'a pas de sens
  if(logType === "time" && /1RM/i.test(intensity)){
    intensity = (window.LANG && LANG.getLang() === "en")
      ? "Max isometric contraction, hold steady"
      : "Contraction isométrique max, tiens stable";
  }

  // Parse "85-95% FCmax" ou "70-80% 1RM" depuis l'intensity finale
  let hrLine = "";
  let intensityNote = "";
  const hrPctMatch = intensity.match(/(\d+)\s*[-––—\/]\s*(\d+)\s*%\s*FCmax/i);
  if(hrPctMatch && logType === "cardio"){
    const low = Math.round(maxHR * parseInt(hrPctMatch[1])/100);
    const high = Math.round(maxHR * parseInt(hrPctMatch[2])/100);
    hrLine = `<div><b>${_T("presc_hr_target")} :</b> <span style="color:${m.objColor};font-weight:800">${low}-${high} ${_T("presc_hr_bpm")}</span> <span style="color:var(--mt);font-size:11px">${_T("presc_hr_age_note",{age:userAge})}</span></div>`;
  } else if(/all[-\s]?out|max(?:imal)?\s*(?:effort)?|RPE\s*9|RPE\s*10/i.test(intensity) && logType === "cardio"){
    intensityNote = `<div style="margin-top:4px">${_T("presc_max_effort")}</div>`;
  } else if(/Z2|polaris/i.test(intensity) && logType === "cardio"){
    const low = Math.round(maxHR * 0.6);
    const high = Math.round(maxHR * 0.7);
    hrLine = `<div><b>${_T("presc_hr_target")} :</b> <span style="color:${m.objColor};font-weight:800">${low}-${high} ${_T("presc_hr_bpm")}</span> <span style="color:var(--mt);font-size:11px">${_T("presc_hr_age_note",{age:userAge})}</span></div>`;
    intensityNote = `<div style="margin-top:4px">${_T("presc_z2_note")}</div>`;
  } else if(/85[-––]95.*FCmax|HIIT/i.test(intensity) && logType === "cardio"){
    intensityNote = `<div style="margin-top:4px">${_T("presc_hiit_note")}</div>`;
  } else if(/RIR/i.test(intensity)){
    intensityNote = `<div style="margin-top:4px">${wrapJargon(_T("presc_rir_note"))}</div>`;
  } else if(/\d+\s*%\s*1RM/i.test(intensity)){
    intensityNote = `<div style="margin-top:4px">${wrapJargon(_T("presc_pct_1rm_note"))}</div>`;
  }

  // Format de la séance (selon logType)
  let formatLine = "";
  if(logType === "cardio" && m.work){
    const workStr = m.work >= 60 ? `${Math.round(m.work/60)} min` : `${m.work}s`;
    formatLine = `<div><b>${_T("presc_format")} :</b> ${_T("presc_format_intervals",{n:sc.sets||m.sets,work:workStr,rest:sc.rest||m.rest})}</div>`;
  } else if(logType === "time"){
    const hold = (typeof sc.reps === "number" ? sc.reps : (m.reps || 30));
    formatLine = `<div><b>${_T("presc_format")} :</b> ${_T("presc_format_time",{n:sc.sets||m.sets,hold:hold,rest:sc.rest||m.rest})}</div>`;
  } else if(logType === "weight" || logType === "reps_bw"){
    formatLine = `<div><b>${_T("presc_format")} :</b> ${_T("presc_format_strength",{n:sc.sets||m.sets,reps:sc.reps||m.reps,rest:sc.rest||m.rest})}</div>`;
  }

  // v8.51 — Wrap les termes techniques avec des tooltips (FCmax, RPE, RIR, etc.)
  const intensityWrapped = wrapJargon(intensity);
  const descWrapped = wrapJargon(_pl(m.desc));
  const nameWrapped = wrapJargon(_pl(m.name));
  return `<div style="background:${m.objColor}10;border-left:4px solid ${m.objColor};padding:12px 14px;border-radius:9px;margin-bottom:12px;font-size:12px;color:var(--t2);line-height:1.7">
    <div style="font-weight:800;color:${m.objColor};font-size:13px;margin-bottom:6px">${_T("presc_title")} · ${m.objIcon} ${nameWrapped}</div>
    <div style="color:var(--mt);font-style:italic;margin-bottom:8px;line-height:1.5">${descWrapped}</div>
    <div style="display:flex;flex-direction:column;gap:2px">
      <div><b>${_T("presc_intensity")} :</b> ${intensityWrapped}</div>
      ${hrLine}
      ${formatLine}
      ${intensityNote}
    </div>
  </div>`;
}

// v8.46 — Grille planning hebdomadaire (Mon-Sun) pour le programme personnalisé.
// Reprend l'esthétique de l'ancienne grille PPL, adaptée aux séances du custom program.
// Click sur une case avec une séance → lance directement cette séance.
function rCustomWeekGrid(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const prog = S.customProgram;
  if(!prog || typeof computeCustomWeekPlan !== "function") return "";
  const plan = computeCustomWeekPlan(prog, S.hist);
  if(!plan) return "";
  const obj = (typeof getObjective === "function") ? getObjective(prog.objective) : null;
  const objColor = obj ? obj.color : "var(--ac)";
  const objIcon = obj ? obj.icon : "🧬";
  const objName = obj ? _pl(obj.name) : prog.objective;
  const sources = obj ? obj.sources : "";
  const week = (prog.weeks || []).find(w => w.weekNum === plan.currentWeek);
  const sessions = week ? (week.sessions || []) : [];
  // Nb séances restant à faire cette semaine
  const doneCount = plan.days.filter(d => d.status === "done").length;
  const remaining = plan.totalSessions - doneCount;
  const DAY_KEYS = ["day_mon","day_tue","day_wed","day_thu","day_fri","day_sat","day_sun"];

  // Mini-bannière "recommandation" : prochaine séance à faire
  const todayCell = plan.days.find(d => d.status === "today");
  const nextFuture = plan.days.find(d => d.status === "future");
  const recCell = todayCell || nextFuture;
  let recBanner = "";
  if(recCell && recCell.sessIdx !== null){
    const s = sessions[recCell.sessIdx];
    const sessLabel = _T("cp_view_session", { n: recCell.sessIdx + 1 });
    const dayLabel = _T(DAY_KEYS[recCell.dow]);
    const sessDetails = s ? (s.work ? `${s.work}s × ${s.sets} sets` : `${s.sets} × ${s.reps} reps`) : "";
    recBanner = `<div class="card" style="border-left:4px solid ${objColor};background:${objColor}11;padding:14px;margin-bottom:8px;cursor:pointer" onclick="launchCustomSession(${plan.currentWeek},${recCell.sessIdx})">
      <div style="font-size:11px;color:var(--mt);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${_T("plan_rec_title")}</div>
      <div style="font-size:14px;color:var(--tx);line-height:1.5"><b>${sessLabel}</b> ${todayCell?"":`(${dayLabel})`} — ${sessDetails}</div>
    </div>`;
  } else if(remaining === 0){
    recBanner = `<div class="card" style="border-left:4px solid var(--ok);background:var(--ok10);padding:14px;margin-bottom:8px">
      <div style="font-size:13px;color:var(--ok);font-weight:700">${_T("plan_rec_all_done")}</div>
    </div>`;
  }

  // Grille 7 jours
  const cellsHtml = plan.days.map((d, i) => {
    const short = _T(DAY_KEYS[i]);
    const isClickable = ["today","future","done"].includes(d.status) && d.sess !== "rest";
    const tag = isClickable ? "button" : "div";
    const tabAttr = isClickable ? ` type="button"` : "";
    const onclickAttr = isClickable ? ` onclick="launchCustomSession(${plan.currentWeek},${d.sessIdx})"` : "";
    const ariaPress = d.status === "today" ? ` aria-current="date"` : "";
    let label, cls;
    if(d.sess === "rest"){
      label = _T("plan_rest");
      cls = "rest";
    } else {
      label = _T("cp_plan_short", { n: d.sessIdx + 1 });
      cls = "core"; // Réutilise la classe core pour la couleur tag (sera surchargée par style inline)
    }
    const sessHtml = d.status === "done"
      ? `<div class="day-sess" style="background:${objColor};color:#fff"><span class="day-check">✓</span> ${label}</div>`
      : (d.sess === "rest"
          ? `<div class="day-sess day-sess-rest">${label}</div>`
          : `<div class="day-sess" style="background:${objColor}22;color:${objColor};border-color:${objColor}88">${label}</div>`);
    const ariaLabel = ` aria-label="${short} ${label}"`;
    return `<${tag} class="day-tile day-tile-${d.status}"${tabAttr}${onclickAttr}${ariaPress}${ariaLabel}><div class="day-name">${short}</div>${sessHtml}</${tag}>`;
  }).join("");

  return `<h2 class="sec-title">${_T("cp_plan_title")}</h2>
  ${recBanner}
  <div class="card week-card">
    <div class="week-intro">${_T("cp_plan_intro", { n: plan.totalSessions, w: plan.currentWeek, total: plan.totalWeeks })}${plan.isDeload?` <span style="color:var(--wa);font-weight:700">· Deload</span>`:''}</div>
    ${sources?`<div class="week-source">${sources}</div>`:""}
    <div class="week-grid" role="list" aria-label="Planning hebdo custom program">${cellsHtml}</div>
    <div class="week-foot">${_T("cp_plan_foot")}</div>
  </div>`;
}

// v8.44 — Section Custom Program affichée sur la home page
function rCustomProgramHomeSection(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const prog = S.customProgram;
  if(!prog){
    return `<div class="card" style="border-left:4px solid var(--ac);background:linear-gradient(135deg,var(--ac10),var(--cd2));padding:18px;margin-bottom:8px">
      <div style="font-size:16px;font-weight:900;margin-bottom:6px">${_T("cp_home_cta_title")}</div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:14px;line-height:1.5">${_T("cp_home_cta_desc")}</div>
      <button class="btn" onclick="startCustomProgramWizard()">${_T("cp_home_cta_btn")}</button>
    </div>`;
  }
  const obj = (typeof getObjective === "function") ? getObjective(prog.objective) : null;
  const objColor = obj ? obj.color : "var(--ac)";
  const objName = obj ? _pl(obj.name) : prog.objective;
  const currentWeek = (typeof getCurrentProgramWeek === "function") ? getCurrentProgramWeek(prog) : 1;
  const totalWeeks = prog.duration || 8;
  if(currentWeek > totalWeeks){
    return `<div class="card" style="border-left:4px solid var(--ok);background:var(--ok10);padding:18px;margin-bottom:8px">
      <div style="font-size:16px;font-weight:900;color:var(--ok);margin-bottom:6px">${_T("cp_home_finished")}</div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">${_T("cp_home_finished_desc",{n:totalWeeks})}</div>
      <div style="display:flex;gap:8px">
        <button class="btn2" onclick="nav('customProgramView')" style="flex:1">${_T("cp_home_view_full")}</button>
        <button class="btn" onclick="startCustomProgramWizard()" style="flex:1">${_T("cp_home_cta_btn")}</button>
      </div>
    </div>`;
  }
  const week = (prog.weeks||[]).find(w => w.weekNum === currentWeek);
  if(!week) return "";
  const isDeload = (week.sessions||[]).some(s => /Deload/i.test(s.intensity||""));
  const sessionsHtml = (week.sessions||[]).map((s, si) => {
    const doneCount = (typeof countCustomSessionsDone === "function") ? countCustomSessionsDone(S.hist, currentWeek, si) : 0;
    const isDone = doneCount > 0;
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--bd)">
      <div style="width:30px;height:30px;border-radius:50%;background:${isDone?'var(--ok)':objColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0">${isDone?'✓':si+1}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:${isDone?'var(--ok)':'var(--tx)'}">${_T("cp_view_session",{n:si+1})}${isDone?` <span style="font-size:11px;color:var(--mt);font-weight:500">${_T("cp_home_session_done")}</span>`:''}</div>
        <div style="font-size:11px;color:var(--mt);margin-top:2px">${s.work?`${s.work}s × ${s.sets} sets`:`${s.sets} × ${s.reps} reps`} · ${s.rest}s repos</div>
      </div>
      <button class="btn" style="padding:8px 14px;font-size:12px;background:${isDone?'var(--cd2)':objColor};border-color:${isDone?'var(--bd)':objColor};color:${isDone?'var(--t2)':'#fff'};margin:0;width:auto;flex-shrink:0" onclick="launchCustomSession(${currentWeek},${si})">${isDone?'↻':_T("cp_launch_session")}</button>
    </div>`;
  }).join("");
  return `<div class="card" style="border-left:4px solid ${objColor};background:${objColor}11;padding:14px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <div style="font-size:15px;font-weight:900;color:${objColor}">${obj?obj.icon:'🧬'} ${objName}</div>
      <button class="btn2" style="padding:4px 10px;font-size:11px" onclick="nav('customProgramView')">${_T("cp_home_view_full")}</button>
    </div>
    <div style="font-size:11px;color:var(--mt);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">${_T("cp_home_week",{n:currentWeek,total:totalWeeks})}${isDeload?` · <span style="color:var(--wa)">Deload</span>`:''}</div>
    ${sessionsHtml}
  </div>`;
}

// ─── v8.42 — Module Entraînement Personnalisé IA ──────────────────────────
// Card dans Réglages : entrée vers le wizard 5 étapes + affichage du programme actif
function rCustomProgramCard(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const prog = S.customProgram || null;
  if(prog && typeof getObjective === "function"){
    // Programme actif : affiche un résumé cliquable
    const obj = getObjective(prog.objective);
    const objColor = obj ? obj.color : "var(--ac)";
    const objName = obj ? _pl(obj.name) : prog.objective;
    const totalSess = (prog.weeks || []).reduce((s, w) => s + (w.sessions||[]).length, 0);
    return `<div class="card" style="border-left:4px solid ${objColor};background:${objColor}11">
      <div style="font-size:11px;color:var(--mt);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${_T("cp_settings_card_active")}</div>
      <div style="font-size:15px;font-weight:900;color:${objColor};margin-bottom:6px">${obj?obj.icon:'🧬'} ${objName}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:10px">${prog.duration} sem · ${prog.frequency}×/sem · ${totalSess} séances · ${(prog.machines||[]).length} machines</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" style="flex:1;min-width:120px;background:${objColor};border-color:${objColor}" onclick="nav('customProgramView')">${_T("cp_settings_card_view")}</button>
        <button class="btn2" style="flex:1;min-width:120px" onclick="editCustomProgramMachines()">🏋️ Machines</button>
        <button class="btn2" style="flex:1;min-width:80px;color:var(--ac);border-color:var(--ac)" onclick="deleteCustomProgram()">${_T("cp_settings_card_delete")}</button>
      </div>
    </div>`;
  }
  // Pas de programme : affiche le call-to-action
  return `<div class="card" style="border-left:4px solid var(--ac);background:var(--ac10)">
    <div style="font-size:15px;font-weight:900;margin-bottom:6px">${_T("cp_settings_card_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">${_T("cp_settings_card_desc")}</div>
    <button class="btn" onclick="startCustomProgramWizard()">${_T("cp_settings_card_btn")}</button>
  </div>`;
}

// État du wizard (en mémoire, persisté quand le programme est généré)
let _cpStep = 0;
let _cpDraft = { objId: null, methodId: null, machineIds: [], duration: 8, frequency: 3, level: "intermediate" };

function startCustomProgramWizard(){
  _cpStep = 0;
  // v8.44 : toutes les machines pré-cochées par défaut (l'utilisateur décoche ce qu'il n'a pas)
  const allMachineIds = (typeof MACHINES !== "undefined") ? MACHINES.map(m => m.id) : [];
  _cpDraft = { objId: null, methodId: null, machineIds: allMachineIds, duration: 8, frequency: 3, level: "intermediate" };
  S.view = "customProgramWizard";
  R();
}

// v8.44 : permet de relancer le wizard pour modifier les machines d'un programme actif
function editCustomProgramMachines(){
  if(!S.customProgram) return;
  _cpStep = 2; // direct à l'étape machines
  _cpDraft = {
    objId: S.customProgram.objective,
    methodId: S.customProgram.method,
    machineIds: (S.customProgram.machines || []).slice(),
    duration: S.customProgram.duration,
    frequency: S.customProgram.frequency,
    level: S.customProgram.level,
    _editing: true
  };
  S.view = "customProgramWizard";
  R();
}
function cpNext(){ _cpStep = Math.min(4, _cpStep + 1); R(); }
function cpPrev(){ if(_cpStep === 0){ S.view = "settings"; } else { _cpStep--; } R(); }
function cpPickObj(id){ _cpDraft.objId = id; _cpDraft.methodId = null; cpNext(); }
function cpPickMethod(id){ _cpDraft.methodId = id; cpNext(); }
function cpToggleMachine(id){
  const i = _cpDraft.machineIds.indexOf(id);
  if(i >= 0) _cpDraft.machineIds.splice(i, 1);
  else _cpDraft.machineIds.push(id);
  R();
}
function cpSelectAllMachines(){
  if(typeof MACHINES === "undefined") return;
  _cpDraft.machineIds = MACHINES.map(m => m.id);
  R();
}
function cpClearMachines(){ _cpDraft.machineIds = []; R(); }
function cpSetDuration(v){ _cpDraft.duration = parseInt(v) || 8; R(); }
function cpSetFreq(v){ _cpDraft.frequency = parseInt(v) || 3; R(); }
function cpSetLevel(v){ _cpDraft.level = v; R(); }
function cpFinish(){
  if(typeof generateProgram !== "function"){ alert("Module protocols.js non chargé"); return; }
  // v8.44 mode édition : conserve l'existant, met juste à jour les machines
  if(_cpDraft._editing && S.customProgram){
    S.customProgram.machines = _cpDraft.machineIds.slice();
    saveS();
    S.view = S.customProgram ? "home" : "settings";
    R();
    return;
  }
  const prog = generateProgram(_cpDraft);
  if(!prog){ alert("Échec génération"); return; }
  S.customProgram = prog;
  if(window.apexAnalytics) window.apexAnalytics.log("custom_program_created", {
    objective: prog.objective, method: prog.method,
    duration: prog.duration, frequency: prog.frequency, level: prog.level,
    machines_count: (prog.machines||[]).length
  });
  saveS();
  S.view = "home"; // v8.44 : retour à la home pour voir le programme intégré
  R();
}
function deleteCustomProgram(){
  const _T = window.T || ((k)=>k);
  if(!confirm(_T("cp_view_delete_confirm"))) return;
  delete S.customProgram;
  saveS();
  S.view = "settings";
  R();
}

// v8.44 — État du panneau de swap (mémorise l'exId pour lequel le panneau est ouvert)
let _swapOpenFor = null;

function toggleSwapPanel(exId){
  _swapOpenFor = (_swapOpenFor === exId) ? null : exId;
  R();
}

// Panneau inline affiché sous l'exercice quand l'utilisateur clique "Pas dispo"
// Montre 3-5 alternatives pour le même muscle, compatibles avec les machines du programme
function rSwapPanel(ex){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const _tr = window.tr || ((s)=>s);
  const prog = S.customProgram;
  if(!prog) return "";
  const currentIds = (S.sess.exercises||[]).map(e => e.id);
  const alts = (typeof getAlternativeExercises === "function")
    ? getAlternativeExercises(ex.id, prog.machines || [], prog.objective, currentIds, 5)
    : [];

  // Liste des machines de l'exo actuel pour l'option "retirer la machine"
  const exMachines = (typeof getExerciseMachines === "function") ? getExerciseMachines(ex.id) : [];
  const removeMachineBtns = exMachines.map(mid => {
    const m = (typeof getMachine === "function") ? getMachine(mid) : null;
    if(!m) return "";
    return `<button onclick="removeProgramMachine('${mid}','${ex.id}')" style="background:none;border:1px solid var(--bd);color:var(--ac);padding:6px 10px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;margin:3px 3px 0 0">🗑 ${_pl(m.name)}</button>`;
  }).join("");

  const altsHtml = alts.length ? alts.map(a => `
    <button onclick="applySwap('${ex.id}','${a.id}')" style="display:block;width:100%;padding:10px 12px;border-radius:9px;border:1px solid var(--bd);background:var(--cd);color:var(--tx);cursor:pointer;font-family:inherit;text-align:left;margin-bottom:6px">
      <div style="font-size:13px;font-weight:700">${_pl(a.name)}</div>
      <div style="font-size:11px;color:var(--mt);margin-top:2px">${a.type}${a.machines&&a.machines.length?' · '+a.machines.map(mid=>{const m=(typeof getMachine==="function")?getMachine(mid):null;return m?_pl(m.name):mid;}).join(', '):''}</div>
    </button>
  `).join("") : `<div style="font-size:12px;color:var(--mt);padding:10px;font-style:italic;line-height:1.5">${_T("swap_no_alt")}</div>`;

  return `<div style="background:var(--cd2);border:1px dashed var(--bd);border-radius:10px;padding:12px;margin-bottom:12px">
    <div style="font-size:12px;font-weight:700;color:var(--t2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">${_T("swap_title")}</div>
    ${altsHtml}
    ${exMachines.length ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd)">
      <div style="font-size:11px;color:var(--mt);margin-bottom:6px;line-height:1.4">${_T("swap_remove_machine")}</div>
      ${removeMachineBtns}
    </div>` : ""}
    <button class="btn2" style="width:100%;margin-top:10px;padding:8px;font-size:12px" onclick="toggleSwapPanel('${ex.id}')">${_T("swap_close")}</button>
  </div>`;
}

// Remplace l'exercice courant par l'alternative sélectionnée
function applySwap(oldExId, newExId){
  if(!S.sess) return;
  const idx = (S.sess.exercises||[]).findIndex(e => e.id === oldExId);
  if(idx < 0) return;
  const newCatEx = (typeof CUSTOM_EXERCISE_CATALOG !== "undefined")
    ? CUSTOM_EXERCISE_CATALOG.find(e => e.id === newExId) : null;
  if(!newCatEx) return;
  const oldEx = S.sess.exercises[idx];
  // v8.45 — nom canonique EN pour matcher l'historique (suggestions de poids préservées)
  // v8.48 — propage imgs + yt pour que la nouvelle session UI affiche image/vidéo
  const canonical = (newCatEx.name && newCatEx.name.en) || (newCatEx.name && newCatEx.name.fr) || newCatEx.id;
  S.sess.exercises[idx] = {
    id: newCatEx.id,
    name: canonical,
    muscle: newCatEx.muscle,
    sets: oldEx.sets,
    reps: oldEx.reps,
    rest: oldEx.rest,
    type: newCatEx.type,
    imgs: newCatEx.imgs || null,
    yt: newCatEx.yt || null,
    notes: "",
    logType: newCatEx.logType || "weight"
  };
  // Reset les logs de cet exercice (puisqu'on change d'exo)
  delete S.log[oldExId];
  _swapOpenFor = null;
  if(window.apexAnalytics) window.apexAnalytics.log("exercise_swapped", {
    from: oldExId, to: newExId, muscle: newCatEx.muscle
  });
  saveA();
  R();
}

// Retire définitivement une machine du programme + swap l'exo actuel
// (force l'utilisateur à revoir Réglages si besoin de la rajouter)
function removeProgramMachine(machineId, currentExId){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const m = (typeof getMachine === "function") ? getMachine(machineId) : null;
  if(!m || !S.customProgram) return;
  if(!confirm(_T("swap_remove_confirm",{name:_pl(m.name)}))) return;
  // Retire la machine du programme
  S.customProgram.machines = (S.customProgram.machines||[]).filter(id => id !== machineId);
  // Auto-swap : pick le 1er alt compatible et le mette en place
  if(typeof getAlternativeExercises === "function"){
    const currentIds = (S.sess.exercises||[]).map(e => e.id);
    const alts = getAlternativeExercises(currentExId, S.customProgram.machines, S.customProgram.objective, currentIds, 1);
    if(alts.length){ applySwap(currentExId, alts[0].id); return; }
  }
  // Si pas d'alt, on retire juste l'exo de la séance
  S.sess.exercises = (S.sess.exercises||[]).filter(e => e.id !== currentExId);
  if(S.ei >= S.sess.exercises.length) S.ei = Math.max(0, S.sess.exercises.length - 1);
  _swapOpenFor = null;
  saveS();
  saveA();
  R();
}

// v8.43 — Lance une séance du programme personnalisé avec exercices auto-sélectionnés
// weekIdx : index 1-based de la semaine, sessIdx : index 0-based de la séance dans la semaine
function launchCustomSession(weekIdx, sessIdx){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const prog = S.customProgram;
  if(!prog) return;
  const week = (prog.weeks||[]).find(w => w.weekNum === weekIdx);
  if(!week) return;
  const sessConfig = (week.sessions||[])[sessIdx];
  if(!sessConfig) return;

  // Génère la liste d'exercices via le catalogue machine-aware
  const sessSets = sessConfig.sets || 4;
  const sessReps = sessConfig.reps || 10;
  const sessRest = sessConfig.rest || 90;
  let exercises = (typeof pickExercisesForSession === "function")
    ? pickExercisesForSession({
        objId: prog.objective,
        methodId: prog.method,
        machineIds: prog.machines || [],
        sessionSets: sessSets,
        sessionReps: sessReps,
        sessionRest: sessRest,
        weekIdx: weekIdx,    // v8.44 rotation déterministe
        sessIdx: sessIdx
      })
    : [];

  // v8.77 — Sécurise les programmes perso : applique substitutions L5/épaule + déduplique
  if(typeof applyPathologySubstitutions === "function") exercises = applyPathologySubstitutions(exercises);
  if(typeof dedupeExercises === "function") exercises = dedupeExercises(exercises);

  if(!exercises.length){
    alert(_T("cp_no_exercises"));
    return;
  }

  // Construit S.sess compatible avec la session UI existante
  const obj = (typeof getObjective === "function") ? getObjective(prog.objective) : null;
  const sessName = `${obj?obj.icon:'🧬'} ${obj?_pl(obj.name):'Custom'} — S${weekIdx} J${sessIdx+1}`;
  // v8.50 : attache le protocole choisi (méthode) à la session pour pouvoir afficher
  // la prescription d'intensité (FC cible, format, RPE) pendant chaque exercice.
  const method = obj ? obj.methods.find(m => m.id === prog.method) : null;
  const cpMethod = method ? {
    name: method.name, desc: method.desc, intensity: method.intensity,
    work: method.work, rest: method.rest, sets: method.sets, reps: method.reps,
    objIcon: obj.icon, objColor: obj.color, objId: obj.id,
    perLogType: method.perLogType || null  // v8.53 : override par logType (hiit_strength, metcon, emom)
  } : null;
  S.sess = {
    id: "custom_program",
    name: sessName,
    color: obj ? obj.color : "var(--ac)",
    exercises: exercises,
    _cpMethod: cpMethod,
    _cpSessConfig: sessConfig    // sets/reps/rest/intensity calculés pour CETTE séance précisément
  };
  S.log = {};
  S.t0 = Date.now();
  S.ei = 0;
  S.notes = "";
  S.view = "session";
  // Tag pour distinguer dans S.hist
  S._customProgramRef = { weekIdx, sessIdx, objective: prog.objective };
  saveA();
  if(window.apexAnalytics) window.apexAnalytics.log("custom_session_launched", {
    objective: prog.objective, week: weekIdx, session: sessIdx+1,
    exercises_count: exercises.length
  });
  R();
}

// Vue : Wizard 5 étapes
function rCustomProgramWizard(){
  const _T = window.T || ((k)=>k);
  const progress = ((_cpStep + 1) / 5) * 100;
  const steps = [rCpStep1, rCpStep2, rCpStep3, rCpStep4, rCpStep5];
  const stepFn = steps[_cpStep] || steps[0];
  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <button class="btn2" style="padding:5px 10px;font-size:12px" onclick="cpPrev()">${_T("cp_back")}</button>
      <div style="font-size:14px;font-weight:900;letter-spacing:2px;color:var(--ac)">${_T("cp_title")}</div>
      <div style="font-size:11px;color:var(--mt)">${_T("cp_step_of",{n:_cpStep+1})}</div>
    </div>
    <div style="background:var(--bd);border-radius:4px;height:5px;margin-top:10px;overflow:hidden"><div style="height:5px;background:var(--ac);width:${progress}%;transition:width .3s"></div></div>
  </div>
  ${stepFn()}`;
}

// Step 1 : Choix objectif
function rCpStep1(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const objs = typeof listObjectives === "function" ? listObjectives() : [];
  return `<div class="card" style="padding:18px">
    <div style="font-size:18px;font-weight:900;margin-bottom:4px">${_T("cp_s1_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:16px;line-height:1.5">${_T("cp_s1_sub")}</div>
    <div style="display:grid;grid-template-columns:1fr;gap:8px">
      ${objs.map(o => `
        <button onclick="cpPickObj('${o.id}')" style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:11px;border:2px solid ${_cpDraft.objId===o.id?o.color:'var(--bd)'};background:${_cpDraft.objId===o.id?o.color+'15':'var(--cd)'};cursor:pointer;font-family:inherit;text-align:left;width:100%;transition:all .12s">
          <span style="font-size:28px">${o.icon}</span>
          <span style="flex:1">
            <div style="font-size:14px;font-weight:900;color:${o.color}">${_pl(o.name)}</div>
            <div style="font-size:12px;color:var(--t2);margin-top:2px;line-height:1.4">${_pl(o.desc)}</div>
            <div style="font-size:10px;color:var(--mt);margin-top:4px;font-style:italic">${o.sources}</div>
          </span>
        </button>
      `).join("")}
    </div>
  </div>`;
}

// Step 2 : Choix méthode (au sein de l'objectif)
function rCpStep2(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const obj = typeof getObjective === "function" ? getObjective(_cpDraft.objId) : null;
  if(!obj) return `<div class="card"><button class="btn2" onclick="cpPrev()">${_T("cp_prev")}</button></div>`;
  return `<div class="card" style="padding:18px">
    <div style="font-size:11px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px">${obj.icon} ${_pl(obj.name)}</div>
    <div style="font-size:18px;font-weight:900;margin-bottom:4px">${_T("cp_s2_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:16px;line-height:1.5">${_T("cp_s2_sub")}</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${obj.methods.map(m => `
        <button onclick="cpPickMethod('${m.id}')" style="display:block;padding:14px;border-radius:11px;border:2px solid ${_cpDraft.methodId===m.id?obj.color:'var(--bd)'};background:${_cpDraft.methodId===m.id?obj.color+'15':'var(--cd)'};cursor:pointer;font-family:inherit;text-align:left;width:100%;transition:all .12s">
          <div style="font-size:14px;font-weight:900;color:${obj.color};margin-bottom:4px">${_pl(m.name)}</div>
          <div style="font-size:12px;color:var(--t2);line-height:1.4">${_pl(m.desc)}</div>
          <div style="font-size:11px;color:var(--mt);margin-top:6px">Sets: <b>${m.sets||"—"}</b> · Reps: <b>${m.reps||"—"}</b> · Repos: <b>${m.rest||"—"}s</b> · ${m.intensity||""}</div>
        </button>
      `).join("")}
    </div>
    <button class="btn2" style="margin-top:14px;width:100%" onclick="cpPrev()">${_T("cp_prev")}</button>
  </div>`;
}

// Step 3 : Sélection machines
function rCpStep3(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const grouped = typeof machinesByCategory === "function" ? machinesByCategory() : {};
  const selCount = _cpDraft.machineIds.length;
  const selLabel = selCount > 1 ? _T("cp_s3_selected_pl",{n:selCount}) : _T("cp_s3_selected",{n:selCount});
  return `<div class="card" style="padding:18px">
    <div style="font-size:18px;font-weight:900;margin-bottom:4px">${_T("cp_s3_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:10px;line-height:1.5">${_T("cp_s3_sub")}</div>
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
      <div style="flex:1;font-size:12px;color:var(--mt);font-weight:700">${selLabel}</div>
      <button class="btn2" style="padding:5px 10px;font-size:11px" onclick="cpSelectAllMachines()">${_T("cp_s3_select_all")}</button>
      <button class="btn2" style="padding:5px 10px;font-size:11px" onclick="cpClearMachines()">${_T("cp_s3_clear")}</button>
    </div>
    ${Object.entries(grouped).filter(([cat,items])=>items.length).map(([cat,items]) => {
      const meta = (typeof MACHINE_CATEGORIES !== "undefined" && MACHINE_CATEGORIES[cat]) ? MACHINE_CATEGORIES[cat] : null;
      const catLabel = meta ? _pl(meta) : cat;
      const catIcon = meta ? meta.icon : "•";
      return `<details style="margin-bottom:8px;border:1px solid var(--bd);border-radius:10px;overflow:hidden" ${items.some(m => _cpDraft.machineIds.includes(m.id))?'open':''}>
        <summary style="padding:10px 12px;font-size:13px;font-weight:700;cursor:pointer;background:var(--cd2)">${catIcon} ${catLabel} <span style="float:right;color:var(--mt);font-weight:500">${items.filter(m=>_cpDraft.machineIds.includes(m.id)).length}/${items.length}</span></summary>
        <div style="padding:6px 12px">
          ${items.map(m => `
            <label style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--bd);font-size:13px;cursor:pointer">
              <input type="checkbox" ${_cpDraft.machineIds.includes(m.id)?"checked":""} onchange="cpToggleMachine('${m.id}')" style="width:18px;height:18px;accent-color:var(--ac)">
              <span style="flex:1">${_pl(m.name)}</span>
            </label>
          `).join("")}
        </div>
      </details>`;
    }).join("")}
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn2" onclick="cpPrev()" style="flex:1">${_T("cp_prev")}</button>
      <button class="btn" onclick="cpNext()" style="flex:2">${_T("cp_next")}</button>
    </div>
  </div>`;
}

// Step 4 : Config durée / freq / niveau
function rCpStep4(){
  const _T = window.T || ((k)=>k);
  const lvlOpts = [
    { id: "beginner",    label: _T("cp_s4_level_beg"), desc: _T("cp_s4_level_beg_desc") },
    { id: "intermediate",label: _T("cp_s4_level_int"), desc: _T("cp_s4_level_int_desc") },
    { id: "advanced",    label: _T("cp_s4_level_adv"), desc: _T("cp_s4_level_adv_desc") }
  ];
  return `<div class="card" style="padding:18px">
    <div style="font-size:18px;font-weight:900;margin-bottom:18px">${_T("cp_s4_title")}</div>

    <div style="margin-bottom:18px">
      <div style="font-size:12px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">${_T("cp_s4_duration")}</div>
      <div style="display:flex;gap:6px">
        ${[4,6,8,12].map(w => `<button onclick="cpSetDuration(${w})" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${_cpDraft.duration===w?'var(--ac)':'var(--bd)'};background:${_cpDraft.duration===w?'var(--ac10)':'var(--cd)'};color:${_cpDraft.duration===w?'var(--ac)':'var(--tx)'};font-weight:700;font-family:inherit;cursor:pointer;font-size:13px">${_T("cp_s4_duration_weeks",{n:w})}</button>`).join("")}
      </div>
    </div>

    <div style="margin-bottom:18px">
      <div style="font-size:12px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">${_T("cp_s4_freq")}</div>
      <div style="display:flex;gap:6px">
        ${[2,3,4,5].map(f => `<button onclick="cpSetFreq(${f})" style="flex:1;padding:12px;border-radius:10px;border:2px solid ${_cpDraft.frequency===f?'var(--ac)':'var(--bd)'};background:${_cpDraft.frequency===f?'var(--ac10)':'var(--cd)'};color:${_cpDraft.frequency===f?'var(--ac)':'var(--tx)'};font-weight:700;font-family:inherit;cursor:pointer;font-size:13px">${_T("cp_s4_freq_n",{n:f})}</button>`).join("")}
      </div>
    </div>

    <div style="margin-bottom:18px">
      <div style="font-size:12px;color:var(--mt);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px">${_T("cp_s4_level")}</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${lvlOpts.map(o => `<button onclick="cpSetLevel('${o.id}')" style="padding:12px;border-radius:10px;border:2px solid ${_cpDraft.level===o.id?'var(--ac)':'var(--bd)'};background:${_cpDraft.level===o.id?'var(--ac10)':'var(--cd)'};color:var(--tx);font-family:inherit;cursor:pointer;text-align:left">
          <div style="font-size:13px;font-weight:900;color:${_cpDraft.level===o.id?'var(--ac)':'var(--tx)'}">${o.label}</div>
          <div style="font-size:11px;color:var(--mt);margin-top:2px">${o.desc}</div>
        </button>`).join("")}
      </div>
    </div>

    <div style="display:flex;gap:10px">
      <button class="btn2" onclick="cpPrev()" style="flex:1">${_T("cp_prev")}</button>
      <button class="btn" onclick="cpNext()" style="flex:2">${_T("cp_next")}</button>
    </div>
  </div>`;
}

// Step 5 : Récap + bouton "Générer"
function rCpStep5(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const obj = typeof getObjective === "function" ? getObjective(_cpDraft.objId) : null;
  const method = obj ? obj.methods.find(m => m.id === _cpDraft.methodId) : null;
  const machineNames = (_cpDraft.machineIds||[]).map(id => {
    const m = typeof getMachine === "function" ? getMachine(id) : null;
    return m ? _pl(m.name) : id;
  });
  const lvlLbl = { beginner: _T("cp_s4_level_beg"), intermediate: _T("cp_s4_level_int"), advanced: _T("cp_s4_level_adv") };
  const totalSess = _cpDraft.duration * _cpDraft.frequency;
  return `<div class="card" style="padding:18px">
    <div style="font-size:18px;font-weight:900;margin-bottom:14px">${_T("cp_s5_title")}</div>
    <div style="background:var(--cd2);border-radius:12px;padding:16px;font-size:13px;line-height:1.9;color:var(--tx)">
      <b>${_T("cp_s5_objective")} :</b> ${obj?obj.icon:""} <span style="color:${obj?obj.color:'var(--ac)'};font-weight:800">${obj?_pl(obj.name):"—"}</span><br>
      <b>${_T("cp_s5_method")} :</b> ${method?_pl(method.name):"—"}<br>
      <b>${_T("cp_s5_duration")} :</b> ${_cpDraft.duration} sem<br>
      <b>${_T("cp_s5_freq")} :</b> ${_cpDraft.frequency}× / sem<br>
      <b>${_T("cp_s5_level")} :</b> ${lvlLbl[_cpDraft.level]||_cpDraft.level}<br>
      <b>${_T("cp_s5_machines")} :</b> ${machineNames.length ? machineNames.slice(0,6).join(", ") + (machineNames.length>6?` + ${machineNames.length-6}`:"") : "—"}<br>
      <b>Total :</b> <span style="color:var(--ok);font-weight:800">${_T("cp_s5_total_sessions",{n:totalSess})}</span>
    </div>
    ${obj?`<div style="background:${obj.color}11;border-left:3px solid ${obj.color};padding:10px 12px;margin:12px 0 0;border-radius:8px;font-size:11px;color:var(--t2);line-height:1.5">
      <b style="color:${obj.color}">${_T("cp_view_sources")} :</b> ${obj.sources}
    </div>`:""}
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn2" onclick="cpPrev()" style="flex:1">${_T("cp_prev")}</button>
      <button class="btn" onclick="cpFinish()" style="flex:2">${_T("cp_finish")}</button>
    </div>
  </div>`;
}

// Vue : Affichage du programme actif (semaines × séances) + launcher v8.43
function rCustomProgramView(){
  const _T = window.T || ((k)=>k);
  const _pl = window.pickLang || ((o)=>typeof o==="string"?o:(o&&o.fr)||"");
  const prog = S.customProgram;
  if(!prog) { S.view = "settings"; setTimeout(R, 0); return ""; }
  const obj = typeof getObjective === "function" ? getObjective(prog.objective) : null;
  const objColor = obj ? obj.color : "var(--ac)";
  const method = obj ? obj.methods.find(m => m.id === prog.method) : null;
  return `<div style="padding:14px 16px;border-bottom:1px solid var(--bd)">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <button class="btn2" style="padding:5px 10px;font-size:12px" onclick="nav('settings')">${_T("cp_back")}</button>
      <div style="font-size:14px;font-weight:900;letter-spacing:2px;color:${objColor}">${obj?obj.icon:'🧬'} ${obj?_pl(obj.name):'—'}</div>
      <div style="width:60px"></div>
    </div>
  </div>
  <div class="card" style="background:${objColor}11;border-left:4px solid ${objColor}">
    <div style="font-size:14px;font-weight:900;color:${objColor};margin-bottom:4px">${method?_pl(method.name):''}</div>
    <div style="font-size:12px;color:var(--t2);line-height:1.4">${method?_pl(method.desc):''}</div>
    <div style="font-size:11px;color:var(--mt);margin-top:8px">${prog.duration} sem · ${prog.frequency}×/sem · ${_T("cp_s4_level_"+prog.level.slice(0,3))} · ${obj?obj.sources:''}</div>
  </div>
  ${(prog.weeks||[]).map(w => {
    const isDeload = (w.sessions||[]).some(s => /Deload/i.test(s.intensity||""));
    return `<details class="card" style="padding:0" ${w.weekNum===1?'open':''}>
      <summary style="padding:12px 14px;font-size:13px;font-weight:700;cursor:pointer;display:flex;justify-content:space-between;align-items:center">
        <span>${_T("cp_view_week",{n:w.weekNum})}${isDeload?` <span style="color:var(--wa);font-size:11px">· ${_T("cp_view_deload")}</span>`:''}</span>
        <span style="color:var(--mt);font-size:11px;font-weight:500">${(w.sessions||[]).length} séances</span>
      </summary>
      <div style="padding:0 14px 12px">
        ${(w.sessions||[]).map((s,si) => `
          <div style="border-top:1px solid var(--bd);padding:10px 0;font-size:12px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div style="font-weight:700;color:${objColor}">${_T("cp_view_session",{n:si+1})}</div>
              <button class="btn" style="padding:6px 12px;font-size:11px;background:${objColor};border-color:${objColor};margin:0;width:auto" onclick="launchCustomSession(${w.weekNum},${si})">${_T("cp_launch_session")}</button>
            </div>
            <div style="color:var(--t2);line-height:1.6">
              ${s.work ? `Work : <b>${s.work}s</b> × ${s.sets} sets` : `Sets : <b>${s.sets}</b> × <b>${s.reps} reps</b>`}<br>
              Repos : <b>${s.rest}s</b><br>
              Intensité : <b>${s.intensity}</b>
            </div>
          </div>
        `).join("")}
      </div>
    </details>`;
  }).join("")}`;
}

function rPathologiesCard(){
  const T = window.T || ((k)=>k);
  const trL = window.tr || ((s)=>s);
  const active = (S.health && S.health.pathologies) || [];
  const items = Object.entries(PATHOLOGIES).map(([k, p]) => {
    const on = active.includes(k);
    return `<button onclick="togglePathology('${k}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:11px;border:2px solid ${on?p.color:'var(--bd)'};background:${on?p.color+'15':'var(--cd)'};cursor:pointer;font-family:inherit;text-align:left;width:100%;margin-bottom:6px;transition:all .12s">
      <span style="font-size:22px">${p.icon}</span>
      <span style="flex:1;font-size:14px;font-weight:700;color:${on?p.color:'var(--tx)'}">${trL(p.label)}</span>
      <span style="font-size:18px;color:${on?p.color:'var(--mt)'};font-weight:900">${on?'✓':''}</span>
    </button>`;
  }).join("");
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:6px">🏥 ${T("set_pathologies")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.5">${T("set_path_sub")}</div>
    ${items}
    <div style="margin-top:10px;padding:11px 13px;background:rgba(42,157,143,.10);border:1.5px solid var(--ok);border-radius:10px;font-size:12px;color:var(--ok);line-height:1.55;font-weight:600">
      ${T("set_path_disclaimer")}
    </div>
  </div>`;
}
function togglePathology(key){
  if(!S.health) S.health = { pathologies: [] };
  if(!S.health.pathologies) S.health.pathologies = [];
  const i = S.health.pathologies.indexOf(key);
  const wasActive = i >= 0;
  if(wasActive) S.health.pathologies.splice(i, 1);
  else S.health.pathologies.push(key);
  saveS();
  if(window.apexAnalytics) window.apexAnalytics.log("pathology_changed", {
    key, enabled: !wasActive, active_count: S.health.pathologies.length
  });
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
    const _T = window.T || ((k)=>k);
    return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">${_T("sync_title")}</div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:14px;line-height:1.6">${_T("sync_desc")}</div>
      <button class="btn" onclick="syncSignIn()" style="background:#4285F4;border-color:#4285F4">${_T("sync_signin_google")}</button>
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
  const _T2 = window.T || ((k)=>k);
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">${_T2("sync_title")}</div>
    <div style="font-size:13px;color:var(--t2);margin-bottom:6px">${_T2("sync_signed_in_as")} <b style="color:var(--tx)">${esc(user.email||"")}</b></div>
    <div style="font-size:13px;color:${statusColors[status]||"var(--mt)"};margin-bottom:14px;font-weight:600">${statusLabels[status]||status}</div>
    <button class="btn2" onclick="syncSignOut()">${_T2("sync_signout")}</button>
  </div>`;
}

// ─── NOTIFICATIONS CARD ───
function rNotifCard(){
  const _T = window.T || ((k)=>k);
  const support = typeof notifPermissionState === "function" ? notifPermissionState() : "unsupported";
  if(support === "unsupported"){
    return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">${_T("notif_title")}</div>
      <div style="font-size:13px;color:var(--mt)">${_T("notif_unsupported")}</div></div>`;
  }
  const enabled = isNotifEnabled();
  const perm = support;
  let body = "";
  if(perm === "denied"){
    body = `<div style="font-size:13px;color:var(--ac);line-height:1.5;margin-bottom:8px">${_T("notif_denied")}</div>`;
  } else if(perm === "default"){
    body = `<div style="font-size:13px;color:var(--t2);margin-bottom:14px;line-height:1.5">${_T("notif_desc")}</div>
      <button class="btn" onclick="enableNotif()" style="background:#457B9D;border-color:#457B9D">${_T("notif_enable")}</button>`;
  } else {
    body = `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0">
        <span style="font-size:13px;color:var(--tx);font-weight:600">${_T("notif_enabled")}</span>
        <button onclick="toggleNotif()" style="background:${enabled?'var(--ok)':'var(--cd2)'};border:1px solid ${enabled?'var(--ok)':'var(--bd)'};border-radius:14px;width:48px;height:26px;cursor:pointer;position:relative;padding:0;font-family:inherit"><div style="position:absolute;top:2px;${enabled?'right:2px':'left:2px'};width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s"></div></button>
      </div>`;
  }
  return `<div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px">${_T("notif_title")}</div>${body}</div>`;
}

async function enableNotif(){
  const result = await requestNotifPermission();
  if(result === "granted"){ setNotifEnabled(true); R(); }
  else if(result === "denied") alert("Permission refusée. Tu peux la ré-activer dans les paramètres du navigateur.");
}
function toggleNotif(){ setNotifEnabled(!isNotifEnabled()); R(); }
function testNotif(){
  const ok = showLocalNotif("FITStark 💪", "Test : c'est bien toi ! Les rappels fonctionneront comme ça.");
  if(!ok) alert("Notification non envoyée. Vérifie la permission dans les réglages du navigateur.");
}

function syncSignIn(){
  if(!window.apexSync) return alert("Module sync pas chargé");
  window.apexSync.signIn().then(()=>{
    if(window.apexAnalytics) window.apexAnalytics.log("login", { method: "google" });
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
  <div class="card"><div style="display:flex;gap:6px;margin-bottom:14px">${modeTabs}</div>${fields}${derived}<div style="margin-top:10px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:4px">${(window.T||((k)=>k))("sess_notes_label")}</div><textarea class="inp" placeholder="${(window.T||((k)=>k))("sess_cardio_notes_ph")}" oninput="setCardio('notes',this.value)">${esc(c.notes||"")}</textarea></div><button class="btn btn-ok" style="margin-top:14px" onclick="finishCardio()">${(window.T||((k)=>k))("sess_save_btn")}</button></div>
  <div class="card"><div style="font-size:13px;color:var(--t2);line-height:1.5"><b style="color:#06b6d4">💡 Zones FC (220-âge)</b><br>Z2 endurance (60-70%) · Z3 tempo (70-80%) · Z4 seuil (80-90%) · Z5 VO2max (90-100%)<br><br><b style="color:#06b6d4">Pyramide polarisée</b> : 80% Z2 · 10% Z3 · 10% Z4-5 (Seiler 2010)</div></div>`;
}

// ─── CORE ───
function rCore(){
  if(!S.core.startDate){
    return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" onclick="nav('home')">←</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#a855f7">CORE HEAVY</div><div></div></div></div>
    <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#a855f7">Programme 12 semaines — L5-S1 safe</div>
    <div style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:14px">2 exercices, 2 séances/semaine, ~12 min en fin de séance Push/Pull/Legs.<br><br><b>1. Cable Pallof Press</b> — anti-rotation, charge progressive 25→55kg<br><b>2. Heavy Suitcase Carry</b> — anti-flexion latérale, charge 22→44kg/main<br><br>Validés McGill / Behm / Escamilla. Aucun exercice en flexion lombaire chargée (sit-up, crunch, russian twist exclus).</div>
    <button class="btn" style="background:#a855f7;border-color:#a855f7" onclick="coreStart()">${(window.T||((k)=>k))("core_start_btn")}</button>
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
  <div class="ex-nav">${ei>0?`<button class="btn2" aria-label="${(window.T||((k)=>k))("sess_back_aria")}" onclick="coreSetEi(${ei-1})">←</button>`:'<div></div>'}${ei<exs.length-1?`<button class="btn" style="background:#a855f7;border-color:#a855f7" onclick="coreSetEi(${ei+1})">${(window.T||((k)=>k))("sess_next_btn")}</button>`:`<button class="btn btn-ok" onclick="finishCore()">${(window.T||((k)=>k))("sess_finish_btn")}</button>`}</div>
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
  const _T = window.T || ((k)=>k);
  const locale = (window.LANG && LANG.getLang()==='en') ? "en-US" : "fr-FR";
  const actLabels={1.2:_T("nut_act_1"),1.375:_T("nut_act_2"),1.55:_T("nut_act_3"),1.725:_T("nut_act_4"),1.9:_T("nut_act_5")};
  const goalLabels={"-500":_T("nut_g_n500"),"-400":_T("nut_g_n400"),"-300":_T("nut_g_n300"),"0":_T("nut_g_0"),"250":_T("nut_g_250"),"500":_T("nut_g_500")};
  const wlData=[...n.weightLog].reverse().slice(-15).map(w=>({d:new Date(w.date).toLocaleDateString(locale,{day:"2-digit",month:"2-digit"}),kg:w.weight}));
  const chart=wlData.length>1?svgLine(wlData,"d","kg","#10b981",300,120):"";
  const macroPct=c.target>0?{p:Math.round(c.protein*4/c.target*100),f:Math.round(c.fat*9/c.target*100),cb:Math.round(c.carbs*4/c.target*100)}:{p:0,f:0,cb:0};
  return`<div style="padding:12px 16px;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center"><button class="btn2" style="padding:5px 10px;font-size:13px" onclick="nav('home')">${_T("nut_back")}</button><div style="font-size:18px;font-weight:900;letter-spacing:3px;color:#10b981">${_T("nut_title")}</div><div style="font-size:13px;color:var(--mt)">Mifflin-St Jeor</div></div></div>
  <div class="card" style="border-left:4px solid #10b981;padding:18px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600">${_T("nut_target")}</div><div style="font-size:32px;font-weight:900;color:#10b981;margin:4px 0">${c.target}<span style="font-size:14px;color:var(--mt)"> ${_T("nut_kcal")}</span></div><div style="font-size:13px;color:var(--t2)">BMR ${c.bmr} · TDEE ${c.tdee} · ${c.deficit>=0?'+':''}${c.deficit} kcal/j → ${c.weeklyChange} ${_T("nut_kg_per_week")}</div></div>
  <div class="card"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:10px">${_T("nut_macros_title")} (${n.proteinPerKg}g/kg · ${n.fatPerKg}g/kg)</div>
  <div style="display:flex;gap:8px;margin-bottom:10px"><div class="stat-box" style="background:rgba(239,68,68,.1)"><div class="stat-val" style="color:#ef4444">${c.protein}g</div><div class="stat-lbl">${_T("nut_protein")} · ${macroPct.p}%</div></div><div class="stat-box" style="background:rgba(245,158,11,.1)"><div class="stat-val" style="color:#f59e0b">${c.carbs}g</div><div class="stat-lbl">${_T("nut_carbs")} · ${macroPct.cb}%</div></div><div class="stat-box" style="background:rgba(168,85,247,.1)"><div class="stat-val" style="color:#a855f7">${c.fat}g</div><div class="stat-lbl">${_T("nut_fat")} · ${macroPct.f}%</div></div></div>
  </div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:12px">${_T("nut_my_params")}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">${_T("nut_weight_label")}</div><input class="inp" type="number" step="0.1" min="30" max="250" value="${n.weight}" onchange="nutSet('weight',parseFloat(this.value)||0)"></div>
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">${_T("nut_height_label")}</div><input class="inp" type="number" step="1" min="120" max="220" value="${n.height}" onchange="nutSet('height',parseInt(this.value)||0)"></div>
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">${_T("nut_age_label")}</div><input class="inp" type="number" step="1" min="14" max="100" value="${n.age}" onchange="nutSet('age',parseInt(this.value)||0)"></div>
  <div><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">${_T("nut_sex_label")}</div><div style="display:flex;gap:6px"><button onclick="nutSet('sex','M')" style="flex:1;padding:8px;border-radius:8px;border:1px solid ${n.sex==='M'?'#10b981':'var(--bd)'};background:${n.sex==='M'?'rgba(16,185,129,.15)':'none'};color:${n.sex==='M'?'#10b981':'var(--mt)'};font-weight:700;font-family:inherit;cursor:pointer">${_T("nut_male")}</button><button onclick="nutSet('sex','F')" style="flex:1;padding:8px;border-radius:8px;border:1px solid ${n.sex==='F'?'#10b981':'var(--bd)'};background:${n.sex==='F'?'rgba(16,185,129,.15)':'none'};color:${n.sex==='F'?'#10b981':'var(--mt)'};font-weight:700;font-family:inherit;cursor:pointer">${_T("nut_female")}</button></div></div>
  </div>
  <div style="margin-top:14px"><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">${_T("nut_activity")}</div><select class="inp" onchange="nutSet('activity',parseFloat(this.value))">${Object.entries(actLabels).map(([k,v])=>`<option value="${k}" ${parseFloat(k)===n.activity?'selected':''}>${v} (×${k})</option>`).join("")}</select></div>
  <div style="margin-top:10px"><div style="font-size:12px;text-transform:uppercase;color:var(--mt);font-weight:600;margin-bottom:4px">${_T("nut_goal")}</div><select class="inp" onchange="nutSet('goal',parseInt(this.value))">${Object.entries(goalLabels).map(([k,v])=>`<option value="${k}" ${parseInt(k)===n.goal?'selected':''}>${v}</option>`).join("")}</select></div>
  </div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:10px">${_T("nut_weight_track")}</div>
  <div style="margin-bottom:10px"><div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--mt);font-weight:600;margin-bottom:6px">${_T("nut_today_weigh")}</div><input class="inp" id="nutW" type="text" inputmode="decimal" pattern="[0-9]+([.,][0-9]+)?" placeholder="ex: 75,4" style="width:100%;font-size:18px;text-align:center;padding:14px;letter-spacing:1px" autocomplete="off"><button class="btn" style="background:#10b981;border-color:#10b981;width:100%;margin-top:8px;padding:12px" onclick="nutLogWeight()">${_T("nut_log_btn")}</button></div>
  ${chart?`<div style="margin-bottom:10px">${chart}</div>`:""}
  ${n.weightLog.length?n.weightLog.slice(0,8).map((w,i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:14px"><span style="color:var(--t2)">${new Date(w.date).toLocaleDateString(locale,{weekday:"short",day:"numeric",month:"short"})}</span><span style="font-weight:700">${w.weight} kg</span><button onclick="nutDelWeight(${i})" style="background:none;border:none;color:var(--mt);cursor:pointer;font-size:14px">×</button></div>`).join(""):`<div style="text-align:center;color:var(--mt);font-size:13px;padding:20px">${_T("nut_no_weighs")}</div>`}
  </div>
  <div class="card"><div style="font-size:14px;font-weight:700;margin-bottom:6px">${_T("nut_protein_foods")}</div>
  <div style="font-size:13px;color:var(--mt);margin-bottom:14px">${_T("nut_target_short")} : <b style="color:#10b981">${c.protein} ${_T("nut_per_day")}</b> · USDA / Ciqual ANSES</div>
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
function onInp(el){
  const e=el.dataset.e, si=parseInt(el.dataset.s), f=el.dataset.f;
  if(!S.log[e]) S.log[e]={};
  const p = S.log[e][si] || {};
  // v8.49 — support multi-logTypes
  const v = el.value;
  if(f==="w")    p.weight   = parseFloat(v)||0;
  else if(f==="r")   p.reps     = parseInt(v)||0;
  else if(f==="t")   p.time     = parseInt(v)||0;     // secondes (hold isométrique)
  else if(f==="dur") p.duration = parseFloat(v)||0;   // minutes (cardio)
  else if(f==="km")  p.km       = parseFloat(v)||0;   // distance cardio
  else if(f==="dist")p.distance = parseInt(v)||0;     // mètres (carries)
  S.log[e][si] = p;
  saveA();
  const row = el.closest('.set-row');
  if(row){
    const n = row.querySelector('.set-num');
    const c = row.querySelector('div:last-child');
    if(n) n.className = 'set-num set-done';
    if(c){ c.style.color='var(--ok)'; c.textContent='✓'; }
  }
}
function finish(){
  const s=S.sess,ph=PHASES[S.phase],wod=pickWOD(s.id);
  const dur=Math.round((Date.now()-S.t0)/6e4);
  const cpRef=S._customProgramRef||null;
  // v8.70 — capture résultat WOD + détection PB
  const wodResult = (typeof captureWodResult === 'function') ? captureWodResult(wod) : null;
  let isPB = false;
  if(wodResult && wodResult.score !== undefined && wodResult.completed){
    const prevBest = getWodPB(wodResult.wodName, wodResult.type);
    if(!prevBest || wodResult.score > prevBest.score) isPB = true;
    if(isPB) wodResult.isPB = true;
  }
  S.hist.unshift({
    id:""+Date.now(),sessionId:s.id,sessionName:s.name,phase:ph.name,
    wodName:wod?.name||"", wodResult: wodResult,
    date:new Date().toISOString(),duration:dur,
    exercises:s.exercises.map(x=>({id:x.id,name:x.name,sets:x.sets,reps:x.reps,muscle:x.muscle,logged:S.log[x.id]||{},rir:S.log[x.id]?.rir})),
    notes:S.notes,_cp:cpRef
  });
  if(window.apexAnalytics)window.apexAnalytics.log("session_completed",{session_id:s.id,session_name:s.name,phase:ph.name,wod_name:wod?.name||"",duration_min:dur,exercises_count:s.exercises.length,total_sessions:S.hist.length,wod_completed:wodResult?.completed||false,is_pb:isPB});
  S.sess=null;S._customProgramRef=null;
  if(isPB) S._lastPB = wodResult;
  // v8.71 — écran de fin de séance avec récap animé (au lieu d'aller direct à home)
  S._finishId = S.hist[0].id;
  saveS();saveA();
  S.view="finish";
  R();
}
// v8.71 — Écran de fin de séance : récap animé volume + sets + WOD + badges PB
function rFinish(){
  const h = (S.hist||[]).find(x => x.id === S._finishId) || S.hist[0];
  if(!h){ S.view="home"; return rHome(); }
  setTimeout(runFinishCountups, 30);
  const _tr = window.tr || ((s)=>s);
  // Volume total + sets complétés
  let totalVolume = 0, totalSets = 0, totalReps = 0, maxLoad = 0;
  (h.exercises||[]).forEach(e => {
    Object.values(e.logged||{}).forEach(x => {
      const w = x.weight||0, r = x.reps||0;
      if(w>0 && r>0){ totalVolume += w*r; totalSets += 1; totalReps += r; if(w>maxLoad) maxLoad = w; }
    });
  });
  const fmtVol = totalVolume >= 1000 ? (totalVolume/1000).toFixed(1).replace(/\.0$/,'') + ' t' : Math.round(totalVolume) + ' kg';
  const wr = h.wodResult;
  const wodLine = wr ? (typeof formatWodResult==='function' ? formatWodResult(wr) : '') : '';
  const isPB = wr && wr.isPB;
  // Confetti SVG strips
  const confettiHtml = isPB ? `<div class="finish-confetti">${Array.from({length:24},(_,i)=>{
    const colors=['#FFD700','#FF7A1F','#E63946','#00FF88','#4A7AAB','#a855f7'];
    const c = colors[i%colors.length];
    const left = (i*4.2 + (i%3)*7) % 100;
    const delay = (i*0.08).toFixed(2);
    const dur = (1.8 + (i%5)*0.25).toFixed(2);
    const rot = (i*23) % 360;
    return `<span class="finish-confetto" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;background:${c};transform:rotate(${rot}deg)"></span>`;
  }).join('')}</div>` : '';
  // Sous-titre dynamique
  const minutes = h.duration||0;
  const subtitle = isPB ? 'NOUVEAU RECORD !' : (minutes >= 60 ? 'Grosse séance.' : minutes >= 30 ? 'Bien joué.' : 'Court mais intense.');
  return `<div class="finish-wrap">
    ${confettiHtml}
    <div class="finish-header">
      <div class="finish-eyebrow">${isPB?'🏆':'✓'} ${subtitle}</div>
      <div class="finish-title">${esc(_tr(h.sessionName))}</div>
      <div class="finish-meta">${new Date(h.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} · ${minutes} min</div>
    </div>
    <div class="finish-stats-grid">
      <div class="finish-stat">
        <div class="finish-stat-icon">🔥</div>
        <div class="finish-stat-val" data-countup="${totalVolume}" data-fmt="${totalVolume>=1000?'t':'kg'}">${fmtVol}</div>
        <div class="finish-stat-lbl">VOLUME TOTAL</div>
      </div>
      <div class="finish-stat">
        <div class="finish-stat-icon">💪</div>
        <div class="finish-stat-val" data-countup="${totalSets}" data-fmt="">${totalSets}</div>
        <div class="finish-stat-lbl">SETS COMPLÉTÉS</div>
      </div>
      <div class="finish-stat">
        <div class="finish-stat-icon">⚡</div>
        <div class="finish-stat-val" data-countup="${totalReps}" data-fmt="">${totalReps}</div>
        <div class="finish-stat-lbl">REPS TOTALES</div>
      </div>
      <div class="finish-stat">
        <div class="finish-stat-icon">🏋️</div>
        <div class="finish-stat-val" data-countup="${maxLoad}" data-fmt="kg">${maxLoad} kg</div>
        <div class="finish-stat-lbl">CHARGE MAX</div>
      </div>
    </div>
    ${h.wodName ? `<div class="finish-wod ${isPB?'is-pb':''}">
      <div class="finish-wod-icon">${isPB?'🏆':'🔥'}</div>
      <div class="finish-wod-body">
        <div class="finish-wod-eyebrow">${esc(wr?.type||'WOD')} ${isPB?'· PERSONAL BEST':(wr?.completed?'· COMPLÉTÉ':'')}</div>
        <div class="finish-wod-name">${esc(h.wodName)}</div>
        ${wodLine ? `<div class="finish-wod-score">${esc(wodLine)}</div>` : ''}
      </div>
    </div>` : ''}
    <div class="finish-actions">
      <button class="btn finish-share" onclick="shareLastWorkout()">📤 Partager ma séance</button>
      <div class="finish-actions-row">
        <button class="btn2" onclick="nav('history')">Voir l'historique</button>
        <button class="btn2" onclick="finishContinue()">Continuer</button>
      </div>
    </div>
  </div>`;
}
function finishContinue(){ S._finishId = null; S.view='home'; saveS(); R(); }
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
function doImpUI(){document.getElementById("io").innerHTML=`<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px"><div style="font-size:14px;color:var(--t2);font-weight:600">📁 Importer depuis un fichier</div><input type="file" accept=".csv,.json,text/csv,application/json,text/plain" onchange="doImpFile(this)" style="font-size:14px;color:var(--tx);width:100%;padding:12px;border:1px dashed var(--bd);border-radius:10px;background:var(--bg);cursor:pointer;box-sizing:border-box;font-family:inherit"><div style="font-size:12px;color:var(--mt);text-align:center;margin-top:4px">— ou coller du JSON —</div><textarea class="inp" id="impT" style="min-height:50px;font-size:11px" placeholder="{...JSON...}"></textarea><button class="btn" onclick="doImp()">Importer JSON collé</button><div style="font-size:12px;color:var(--mt);line-height:1.5"><b>Formats acceptés</b> : CSV (export d'une ancienne version d'FITStark, séparateur <code>;</code> ou <code>,</code>) ou JSON. Les séances sont fusionnées avec l'historique existant (dédup par date + nom de session).</div></div>`;}
function doImp(){try{const d=JSON.parse(document.getElementById("impT").value);if(d.history){const r=mergeHistory(d.history,S.hist);S.hist=r.merged;if(d.phase!==undefined)S.phase=d.phase;saveS();R();alert(`✓ ${r.added} séance(s) importée(s)${r.skipped?`, ${r.skipped} doublon(s) ignoré(s)`:""}`);}else alert("JSON sans champ 'history'");}catch(e){alert("JSON invalide : "+e.message);}}
function doImpFile(el){const f=el.files&&el.files[0];if(!f)return;const rd=new FileReader();rd.onload=ev=>{const txt=ev.target.result;try{let hist,phase;const isCSV=f.name.toLowerCase().endsWith(".csv")||(txt.replace(/^﻿/,"").trim()[0]!=="{"&&(txt.includes(";")||txt.toLowerCase().includes("exercice")));if(isCSV){hist=parseCSVtoHistory(txt);if(!hist.length){alert("Aucune séance détectée dans le CSV. Vérifie que les colonnes incluent au moins Date, Session, Exercice.");return;}}else{const d=JSON.parse(txt);hist=d.history||[];phase=d.phase;if(!hist.length){alert("JSON sans historique");return;}}const r=mergeHistory(hist,S.hist);S.hist=r.merged;if(phase!==undefined)S.phase=phase;saveS();R();alert(`✓ ${r.added} séance(s) importée(s)${r.skipped?`, ${r.skipped} doublon(s) ignoré(s)`:""}`);}catch(e){alert("Erreur d'import : "+e.message);}};rd.onerror=()=>alert("Lecture du fichier impossible");rd.readAsText(f,"utf-8");el.value="";}

// ─── INIT ───
loadS();
// ─── P0 #5 : ONBOARDING WIZARD (4 écrans après le disclaimer, v8.29) ───
let _onbStep = 0;
let _onbProfile = { sex: "M", height: 178, weight: 75, age: 30, goal: 1, pathologies: [] };
// v8.65 — Garde défensive : Safari iOS / WebView (Messenger, Instagram, etc.) avait des cas
// où _onbProfile.pathologies devenait undefined. Cette fn garantit que tous les champs sont OK.
function _onbEnsureProfile(){
  if(!_onbProfile || typeof _onbProfile !== "object") _onbProfile = {};
  if(typeof _onbProfile.sex !== "string") _onbProfile.sex = "M";
  if(typeof _onbProfile.height !== "number") _onbProfile.height = 178;
  if(typeof _onbProfile.weight !== "number") _onbProfile.weight = 75;
  if(typeof _onbProfile.age !== "number") _onbProfile.age = 30;
  if(typeof _onbProfile.goal !== "number") _onbProfile.goal = 1;
  if(!Array.isArray(_onbProfile.pathologies)) _onbProfile.pathologies = [];
}

// 4 objectifs accessibles + mapping vers la programmation interne
// Goal 0 (Force)       → Phase 0 (Force, 4-6 reps, repos 180s)
// Goal 1 (Muscle)      → Phase 1 (Hypertrophie, 8-12 reps, repos 90s) — DEFAULT
// Goal 2 (M'affiner)   → Phase 1 (Hypertrophie) + recommandation cardio Z2
// Goal 3 (Reprise)     → Phase 2 (Deload, 15-20 reps, repos 60s) + focus prudence
const GOAL_TO_PHASE = [0, 1, 1, 2];
const GOAL_KEYS = ["force", "muscle", "lean", "rehab"];

function rOnboarding(){
  _onbEnsureProfile();
  // v8.74 — Onboarding raccourci : 3 étapes (Profil+Objectif fusionnés → Pathologies → Récap)
  // L'objectif est désormais sélectionné via mini-cards à la fin de l'étape 1.
  const steps = [rOnbStep1, rOnbStep3, rOnbStep4];
  const stepFn = steps[_onbStep] || steps[0];
  const progress = ((_onbStep + 1) / steps.length) * 100;
  return `<div style="padding:24px 20px;max-width:480px;margin:0 auto">
    <div style="font-size:30px;font-weight:900;letter-spacing:5px;color:var(--ac);margin-bottom:8px;text-align:center">FITSTARK</div>
    <div style="background:var(--bd);border-radius:4px;height:6px;margin-bottom:20px;overflow:hidden"><div style="height:6px;background:var(--ac);width:${progress}%;transition:width .3s"></div></div>
    ${stepFn()}
  </div>`;
}
function rOnbStep1(){
  const p = _onbProfile;
  const _T = window.T || ((k)=>k);
  // v8.74 — Objectif inclus directement ici (fusion avec ex-étape 2)
  const goals = [
    { id:0, name:_T("onb2_g1_name"), emoji:"💪", color:"#E63946" },
    { id:1, name:_T("onb2_g2_name"), emoji:"🔥", color:"#457B9D" },
    { id:2, name:_T("onb2_g3_name"), emoji:"🌿", color:"#2A9D8F" },
    { id:3, name:_T("onb2_g4_name"), emoji:"🦴", color:"#F4A261" }
  ];
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">${_T("onb1_title")}</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:20px;line-height:1.6">${_T("onb1_sub")}</div>
    <div style="margin-bottom:16px">
      <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${_T("onb1_sex")}</div>
      <div style="display:flex;gap:8px">
        <button onclick="onbSet('sex','M')" style="flex:1;padding:14px;border-radius:11px;border:2px solid ${p.sex==='M'?'var(--ac)':'var(--bd)'};background:${p.sex==='M'?'var(--ac10)':'var(--cd)'};color:${p.sex==='M'?'var(--ac)':'var(--tx)'};font-weight:700;cursor:pointer;font-family:inherit;font-size:14px">${_T("onb1_male")}</button>
        <button onclick="onbSet('sex','F')" style="flex:1;padding:14px;border-radius:11px;border:2px solid ${p.sex==='F'?'var(--ac)':'var(--bd)'};background:${p.sex==='F'?'var(--ac10)':'var(--cd)'};color:${p.sex==='F'?'var(--ac)':'var(--tx)'};font-weight:700;cursor:pointer;font-family:inherit;font-size:14px">${_T("onb1_female")}</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div>
        <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${_T("onb1_weight")}</div>
        <input class="inp" type="number" min="30" max="250" step="0.1" value="${p.weight}" onchange="onbSet('weight',parseFloat(this.value)||0)" style="font-size:18px;text-align:center;padding:14px">
      </div>
      <div>
        <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${_T("onb1_height")}</div>
        <input class="inp" type="number" min="120" max="220" step="1" value="${p.height}" onchange="onbSet('height',parseInt(this.value)||0)" style="font-size:18px;text-align:center;padding:14px">
      </div>
    </div>
    <div style="margin-bottom:20px">
      <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">${_T("onb1_age")}</div>
      <input class="inp" type="number" min="14" max="100" value="${p.age}" onchange="onbSet('age',parseInt(this.value)||0)" style="font-size:18px;text-align:center;padding:14px">
    </div>
    <!-- v8.74 — Objectif intégré, sélection en 2x2 -->
    <div style="margin-bottom:20px;padding-top:18px;border-top:1px solid var(--bd)">
      <div style="font-size:13px;color:var(--t2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">${_T("onb2_title")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${goals.map(g => `
          <button onclick="onbSet('goal',${g.id})" style="background:${p.goal===g.id?g.color+'18':'var(--cd)'};border:2px solid ${p.goal===g.id?g.color:'var(--bd)'};border-radius:13px;padding:14px 10px;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .12s">
            <span style="font-size:28px;line-height:1">${g.emoji}</span>
            <span style="font-size:13px;font-weight:900;color:${p.goal===g.id?g.color:'var(--t2)'};text-align:center;line-height:1.15">${g.name}</span>
          </button>
        `).join("")}
      </div>
    </div>
    <button class="btn" onclick="onbNext()">${_T("onb_continue")}</button>
    <button onclick="onbSwitchToAdvanced()" style="background:none;color:var(--ac);border:1.5px solid var(--ac);border-radius:11px;width:100%;padding:12px;margin-top:8px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700">⚙️ ${_T("onb2_advanced_btn")}</button>
    <button onclick="onbSkip()" style="background:none;color:var(--mt);border:none;width:100%;padding:10px;margin-top:6px;cursor:pointer;font-family:inherit;font-size:13px;text-decoration:underline">${_T("onb_skip_default")}</button>
  </div>`;
}
function rOnbStep2(){
  const p = _onbProfile;
  const _T = window.T || ((k)=>k);
  const goals = [
    { id:0, name:_T("onb2_g1_name"), emoji:"💪", color:"#E63946", desc:_T("onb2_g1_desc") },
    { id:1, name:_T("onb2_g2_name"), emoji:"🔥", color:"#457B9D", desc:_T("onb2_g2_desc") },
    { id:2, name:_T("onb2_g3_name"), emoji:"🌿", color:"#2A9D8F", desc:_T("onb2_g3_desc") },
    { id:3, name:_T("onb2_g4_name"), emoji:"🦴", color:"#F4A261", desc:_T("onb2_g4_desc") }
  ];
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">${_T("onb2_title")}</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:20px;line-height:1.6">${_T("onb2_sub")}</div>
    ${goals.map(g => `
      <div onclick="onbSet('goal',${g.id})" style="background:${p.goal===g.id?g.color+'18':'var(--cd2)'};border:2px solid ${p.goal===g.id?g.color:'var(--bd)'};border-radius:13px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all .12s">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><span style="font-size:24px">${g.emoji}</span><span style="font-size:16px;font-weight:900;color:${g.color}">${g.name}</span></div>
        <div style="font-size:12px;color:var(--t2);line-height:1.4">${g.desc}</div>
      </div>
    `).join("")}
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn2" onclick="onbBack()" style="flex:1">${_T("onb_back2")}</button>
      <button class="btn" onclick="onbNext()" style="flex:2">${_T("onb_continue")}</button>
    </div>
    <div style="margin-top:22px;padding:14px;border-radius:12px;background:var(--ac10);border:1px solid var(--ac)">
      <div style="font-size:11px;color:var(--ac);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${_T("onb2_advanced_section_title")}</div>
      <div style="font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:10px">${_T("onb2_advanced_hint")}</div>
      <button onclick="onbSwitchToAdvanced()" style="width:100%;padding:11px;border-radius:10px;border:none;background:var(--ac);color:#fff;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px">${_T("onb2_advanced_btn")}</button>
    </div>
  </div>`;
}
// v8.46 — Bascule de l'étape 2 onboarding vers le wizard programme avancé
// L'utilisateur a saisi ses infos (étape 1), il choisit "Programme avancé" → on saute
// les étapes pathologies + récap onboarding et on entre directement dans le wizard.
function onbSwitchToAdvanced(){
  // Sauve les infos déjà saisies (sex/weight/height/age)
  S.nut.sex = _onbProfile.sex;
  S.nut.height = _onbProfile.height;
  S.nut.weight = _onbProfile.weight;
  S.nut.age = _onbProfile.age;
  // Mappe le goal sélectionné à un objectif du wizard (optionnel : pre-fill)
  const GOAL_TO_OBJECTIVE = { 0: "max_strength", 1: "hypertrophy", 2: "fat_loss", 3: "rehab" };
  const presetObj = GOAL_TO_OBJECTIVE[_onbProfile.goal] || null;
  S.phase = GOAL_TO_PHASE[_onbProfile.goal];
  S.goal = GOAL_KEYS[_onbProfile.goal] || "muscle";
  // Pathologies : si l'utilisateur a déjà sélectionné quelque chose à l'étape 3, on l'utilise,
  // sinon vide (il pourra les ajouter via Réglages plus tard)
  if(!S.health) S.health = {};
  S.health.pathologies = (_onbProfile.pathologies || []).slice();
  localStorage.setItem("apex_onboarded", "1");
  saveS();
  if(window.apexAnalytics) window.apexAnalytics.log("onboarding_completed", {
    goal: S.goal, sex: S.nut.sex, age: S.nut.age,
    pathologies_count: S.health.pathologies.length,
    next_step: "custom_program_wizard_from_step2"
  });
  // Bascule dans le wizard avec objectif pré-rempli
  startCustomProgramWizard();
  if(presetObj && typeof getObjective === "function" && getObjective(presetObj)){
    _cpDraft.objId = presetObj;
    _cpStep = 1; // step 2 = méthode (après pick objectif)
    R();
  }
}

// NOUVELLE étape v8.29 : sélection multi-pathologies (mirror rPathologiesCard)
function rOnbStep3(){
  const _T = window.T || ((k)=>k);
  const _tr = window.tr || ((s)=>s);
  const sel = _onbProfile.pathologies;
  const items = Object.entries(PATHOLOGIES).map(([k, pa]) => {
    const on = sel.includes(k);
    return `<button onclick="onbTogglePath('${k}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:11px;border:2px solid ${on?pa.color:'var(--bd)'};background:${on?pa.color+'15':'var(--cd)'};cursor:pointer;font-family:inherit;text-align:left;width:100%;margin-bottom:6px;transition:all .12s">
      <span style="font-size:22px">${pa.icon}</span>
      <span style="flex:1;font-size:14px;font-weight:700;color:${on?pa.color:'var(--tx)'}">${_tr(pa.label)}</span>
      <span style="font-size:18px;color:${on?pa.color:'var(--mt)'};font-weight:900">${on?'✓':''}</span>
    </button>`;
  }).join("");
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">${_T("onb3_title")}</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:14px;line-height:1.5">${_T("onb3_sub")}</div>
    ${items}
    ${sel.length===0?`<div style="font-size:12px;color:var(--mt);text-align:center;padding:10px;font-style:italic">${_T("onb3_none_note")}</div>`:''}
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn2" onclick="onbBack()" style="flex:1">${_T("onb_back2")}</button>
      <button class="btn" onclick="onbNext()" style="flex:2">${_T("onb_continue")}</button>
    </div>
  </div>`;
}
function rOnbStep4(){
  const _T = window.T || ((k)=>k);
  const _tr = window.tr || ((s)=>s);
  // Calcule la session recommandée
  const recId = typeof getRecommendation === "function" ? getRecommendation().id : "push";
  const recSess = PROG.sessions.find(s => s.id === recId);
  // 4 goal labels mapping vers les 3 phases
  const goalLabels = [_T("onb2_g1_name"), _T("onb2_g2_name"), _T("onb2_g3_name"), _T("onb2_g4_name")];
  const goalColors = ["#E63946", "#457B9D", "#2A9D8F", "#F4A261"];
  const phaseIdx = GOAL_TO_PHASE[_onbProfile.goal];
  const ph = PHASES[phaseIdx];
  // Pathologies sélectionnées
  const sel = _onbProfile.pathologies;
  const pathoLabel = sel.length === 0
    ? `<span style="color:var(--mt);font-style:italic">${_T("onb4_none")}</span>`
    : sel.map(k => _tr(PATHOLOGIES[k]?.short || k)).join(', ');
  // Cardio bonus pour "M'affiner"
  const cardioTip = _onbProfile.goal === 2
    ? `<div style="background:var(--ok10);border-left:3px solid var(--ok);padding:10px 12px;margin:12px 0 0;border-radius:8px;font-size:12px;color:var(--t2);line-height:1.5">${_T("onb4_cardio_tip")}</div>`
    : '';
  // Rappel prudence pour "Reprise"
  const rehabTip = _onbProfile.goal === 3
    ? `<div style="background:var(--wa10);border-left:3px solid var(--wa);padding:10px 12px;margin:12px 0 0;border-radius:8px;font-size:12px;color:var(--t2);line-height:1.5">${_T("onb4_rehab_tip")}</div>`
    : '';
  return `<div class="card" style="padding:22px">
    <div style="font-size:22px;font-weight:900;margin-bottom:6px">${_T("onb4_title")}</div>
    <div style="font-size:14px;color:var(--t2);margin-bottom:18px;line-height:1.6">${_T("onb4_sub")}</div>
    <div style="background:var(--cd2);border-radius:12px;padding:16px;margin-bottom:16px;font-size:14px;color:var(--tx);line-height:2">
      <b>${_T("onb4_profile")} :</b> ${_onbProfile.sex==='M'?'♂':'♀'} ${_onbProfile.height} cm, ${_onbProfile.weight} kg, ${_onbProfile.age} ${_T("onb4_yrs")}<br>
      <b>${_T("onb4_goal")} :</b> <span style="color:${goalColors[_onbProfile.goal]};font-weight:800">${goalLabels[_onbProfile.goal]}</span><br>
      <b>${_T("onb4_prog")} :</b> ${_tr(ph.name)} — ${ph.numSets}×${ph.reps}, ${_T("sess_rest")} ${ph.rest}s<br>
      <b>${_T("onb4_zones")} :</b> ${pathoLabel}<br>
      <b>${_T("onb4_program")} :</b> ${_T("onb4_program_val")}
    </div>
    ${cardioTip}
    ${rehabTip}
    ${recSess?`<div class="card sess-card" style="border-left-color:${recSess.color};margin:14px 0 14px 0;background:${recSess.color}11">
      <div class="sess-inner"><div><div class="sess-meta" style="color:var(--ok);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0">${_T("onb4_recommended")}</div><div class="sess-name" style="color:${recSess.color};margin-top:4px">${_tr(recSess.name)}</div><div class="sess-meta">${recSess.compounds.length + recSess.pools.length} ${_T("onb4_exercises")}</div></div></div>
    </div>`:""}
    <button class="btn" style="background:var(--ac);border-color:var(--ac)" onclick="onbFinishToCustomProgram()">${_T("onb4_custom_btn")}</button>
    <div style="font-size:11px;color:var(--mt);text-align:center;margin-top:4px;font-style:italic">${_T("onb4_custom_hint")}</div>
    <button class="btn2" onclick="onbFinish(true,'${recId}')" style="width:100%;margin-top:10px">${_T("onb4_start_btn",{name:recSess?_tr(recSess.name):""})}</button>
    <button class="btn2" onclick="onbFinish(false)" style="width:100%;margin-top:8px;background:none;color:var(--mt);border-color:var(--bd)">${_T("onb4_later")}</button>
  </div>`;
}
// v8.45 — Finit l'onboarding ET lance directement le wizard du programme personnalisé
function onbFinishToCustomProgram(){
  // Applique le profil (mêmes effets que onbFinish(false) sans lancer de séance)
  S.nut.sex = _onbProfile.sex;
  S.nut.height = _onbProfile.height;
  S.nut.weight = _onbProfile.weight;
  S.nut.age = _onbProfile.age;
  S.phase = GOAL_TO_PHASE[_onbProfile.goal];
  S.goal = GOAL_KEYS[_onbProfile.goal] || "muscle";
  if(!S.health) S.health = {};
  S.health.pathologies = _onbProfile.pathologies.slice();
  localStorage.setItem("apex_onboarded", "1");
  saveS();
  if(window.apexAnalytics) window.apexAnalytics.log("onboarding_completed", {
    goal: S.goal, sex: S.nut.sex, age: S.nut.age,
    pathologies_count: S.health.pathologies.length,
    has_pathology: S.health.pathologies.length > 0,
    next_step: "custom_program_wizard"
  });
  // Bascule directement dans le wizard
  startCustomProgramWizard();
}

// v8.64 — Permet de relancer l'onboarding depuis Réglages (utile pour démo + debug)
// Garde l'historique de séances et toutes les données, efface juste le flag onboarded.
function restartOnboarding(){
  const _T = window.T || ((k)=>k);
  if(!confirm(_T("set_redo_onb_confirm"))) return;
  // Pré-remplit le wizard avec les valeurs actuelles (l'user n'a pas à tout retaper)
  if(typeof _onbProfile === "object"){
    _onbProfile.sex = (S.nut && S.nut.sex) || "M";
    _onbProfile.weight = (S.nut && S.nut.weight) || 75;
    _onbProfile.height = (S.nut && S.nut.height) || 178;
    _onbProfile.age = (S.nut && S.nut.age) || 30;
    // Remap S.goal back to goal index (force→0, muscle→1, lean→2, rehab→3)
    const goalIdx = { force:0, muscle:1, lean:2, rehab:3 }[S.goal] ?? 1;
    _onbProfile.goal = goalIdx;
    _onbProfile.pathologies = ((S.health && S.health.pathologies) || []).slice();
  }
  if(typeof _onbStep !== "undefined") _onbStep = 0;
  localStorage.removeItem("apex_onboarded");
  R();
}
function onbSet(k,v){ _onbProfile[k] = v; R(); }
function onbNext(){ _onbStep++; R(); }
function onbBack(){ _onbStep = Math.max(0, _onbStep - 1); R(); }
function onbSkip(){ onbFinish(false); }
function onbTogglePath(key){
  _onbEnsureProfile();
  const i = _onbProfile.pathologies.indexOf(key);
  if(i >= 0) _onbProfile.pathologies.splice(i, 1);
  else _onbProfile.pathologies.push(key);
  R();
}
function onbFinish(launchSession, sessId){
  // Applique le profil au state
  S.nut.sex = _onbProfile.sex;
  S.nut.height = _onbProfile.height;
  S.nut.weight = _onbProfile.weight;
  S.nut.age = _onbProfile.age;
  // v8.29 : mappe goal → phase + sauvegarde l'objectif utilisateur ET les pathologies
  S.phase = GOAL_TO_PHASE[_onbProfile.goal];
  S.goal = GOAL_KEYS[_onbProfile.goal] || "muscle";
  if(!S.health) S.health = {};
  S.health.pathologies = _onbProfile.pathologies.slice();
  localStorage.setItem("apex_onboarded", "1");
  saveS();
  if(window.apexAnalytics) window.apexAnalytics.log("onboarding_completed", {
    goal: S.goal,
    sex: S.nut.sex,
    age: S.nut.age,
    pathologies_count: S.health.pathologies.length,
    has_pathology: S.health.pathologies.length > 0
  });
  if(launchSession && sessId){ goSess(sessId); }
  else { S.view = "home"; R(); }
}

// v8.38 — Disclaimer bilingue avec toggle FR/EN en haut. Persiste le choix de langue
// avant même que l'utilisateur accepte (impacte aussi l'onboarding qui suit).
function renderDisclaimer(){
  const curLang = window.LANG ? LANG.getLang() : "fr";
  const T = window.T || ((k)=>k);
  document.getElementById("app").innerHTML = `<div style="padding:24px 20px;max-width:480px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px">
      <div style="font-size:30px;font-weight:900;letter-spacing:5px;color:#E63946">FITSTARK</div>
      <div style="display:flex;gap:6px;background:#fff;border:1px solid #e5e5ea;border-radius:10px;padding:4px">
        <button onclick="if(window.LANG){LANG.setLang('fr');renderDisclaimer();}" style="background:${curLang==='fr'?'#E63946':'transparent'};color:${curLang==='fr'?'#fff':'#48484a'};border:none;border-radius:7px;padding:6px 12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">FR</button>
        <button onclick="if(window.LANG){LANG.setLang('en');renderDisclaimer();}" style="background:${curLang==='en'?'#E63946':'transparent'};color:${curLang==='en'?'#fff':'#48484a'};border:none;border-radius:7px;padding:6px 12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">EN</button>
      </div>
    </div>
    <div style="background:#fff;border-radius:16px;border:1px solid #e5e5ea;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.07)">
      <div style="font-size:18px;font-weight:800;margin-bottom:14px;color:#B97534">${T("disclaimer_title")}</div>
      <div style="font-size:14px;color:#48484a;line-height:1.7">
        ${T("disclaimer_intro")}<br><br>
        <b style="color:#1c1c1e">• ${T("disclaimer_b1")}</b><br>
        • ${T("disclaimer_b2")}<br>
        &nbsp;&nbsp;— <b>${T("disclaimer_l5").split(":")[0]}</b> :${T("disclaimer_l5").split(":").slice(1).join(":")}<br>
        &nbsp;&nbsp;— <b>${T("disclaimer_shoulder").split(":")[0]}</b> :${T("disclaimer_shoulder").split(":").slice(1).join(":")}<br>
        &nbsp;&nbsp;— <b>${T("disclaimer_knee").split(":")[0]}</b> :${T("disclaimer_knee").split(":").slice(1).join(":")}<br>
        &nbsp;&nbsp;— <b>${T("disclaimer_wrist").split(":")[0]}</b> :${T("disclaimer_wrist").split(":").slice(1).join(":")}<br>
        &nbsp;&nbsp;— <b>${T("disclaimer_elbow").split(":")[0]}</b> :${T("disclaimer_elbow").split(":").slice(1).join(":")}<br>
        • ${T("disclaimer_b3")}<br>
        • ${T("disclaimer_b4")}<br>
        • ${T("disclaimer_b5")}<br><br>
        <b style="color:#1c1c1e">${T("disclaimer_accept")}</b>
      </div>
      <button onclick="localStorage.setItem('apex_disclaimer','1');loadS();R();" style="background:#E63946;color:#fff;border:none;border-radius:12px;padding:15px 24px;font-size:15px;font-weight:800;cursor:pointer;width:100%;margin-top:18px;font-family:inherit;letter-spacing:.5px">${T("disclaimer_btn")}</button>
    </div>
    <div style="font-size:12px;color:#8e8e93;margin-top:14px;text-align:center;font-weight:500">${T("disclaimer_footer")}<br><br>${T("disclaimer_footer2")}</div>
  </div>`;
}
if(!localStorage.getItem("apex_disclaimer")){
  renderDisclaimer();
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
