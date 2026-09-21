/* =============================================================================
   MOTORE PURO — La Nave Domandona
   -----------------------------------------------------------------------------
   Niente biglietti: per sbarcare su un'isola con un'avventura da fare, la
   ciurma deve rispondere a una domanda della Nave Domandona (capita anche,
   senza obbligo, come incontro casuale in mare aperto). Risposta giusta:
   premio (tante monete) e, se serviva per sbarcare, si sbarca. Risposta
   sbagliata: nessuna penalita', ma la STESSA domanda resta "in sospeso" e
   riapparira' con un indizio piu' chiaro al prossimo incontro — e se serviva
   per sbarcare, stavolta niente sbarco: si sceglie un'altra rotta.

   Nessun dado: solo funzioni pure, testabili senza browser.
   ========================================================================== */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_DOMANDONA_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  function withDomandonaDefaults(saved) {
    const defaults = { pending: null, solvedIds: [], recentIds: [] };
    const source = saved && typeof saved === "object" ? saved : {};
    const out = { ...defaults, ...source };
    out.solvedIds = Array.isArray(out.solvedIds) ? out.solvedIds.slice() : [];
    out.recentIds = Array.isArray(out.recentIds) ? out.recentIds.slice() : [];
    out.pending = out.pending && typeof out.pending === "object" && typeof out.pending.questionId === "string" && out.pending.questionId
      ? { questionId: out.pending.questionId, hintLevel: Number.isFinite(out.pending.hintLevel) ? Math.max(0, Math.round(out.pending.hintLevel)) : 0 }
      : null;
    return out;
  }

  /* Sceglie una domanda del livello richiesto: evita quelle gia' risolte
     finche' ce ne sono di nuove, poi evita le ultime due viste di recente. */
  function pickQuestion(questions, level, solvedIds, recentIds, random) {
    if (!Array.isArray(questions) || !questions.length) return null;
    const pool0 = questions.filter((q) => q && q.level === level);
    if (!pool0.length) return null;
    const solved = new Set(solvedIds || []);
    const unsolved = pool0.filter((q) => !solved.has(q.id));
    const base = unsolved.length ? unsolved : pool0; // mazzo esaurito -> si ricicla
    const recent = new Set((recentIds || []).slice(-2));
    const unseen = base.filter((q) => !recent.has(q.id));
    const pool = unseen.length && base.length > 2 ? unseen : base;
    const rng = typeof random === "function" ? random : Math.random;
    return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  }

  /* Il prossimo indizio dopo una risposta sbagliata, senza mai superare
     l'ultimo indizio disponibile per quella domanda. */
  function bumpHint(currentLevel, maxIndex) {
    const cur = Number.isFinite(currentLevel) && currentLevel >= 0 ? Math.round(currentLevel) : 0;
    const max = Number.isFinite(maxIndex) && maxIndex >= 0 ? Math.round(maxIndex) : 0;
    return Math.min(cur + 1, max);
  }

  return { withDomandonaDefaults, pickQuestion, bumpHint };
});
