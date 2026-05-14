// APEX Fitness — Système d'achievements (badges débloquables)
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
