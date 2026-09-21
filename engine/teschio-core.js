/* =============================================================================
   MOTORE PURO — Lo Show del Teschio Multicolore
   -----------------------------------------------------------------------------
   Il Teschio pesca una sfida assurda (stare su una gamba, dito nel naso,
   uno scioglilingua...). Parte un conto alla rovescia di pochi secondi e
   TUTTI i pirati la fanno insieme. Allo scadere il Master tocca ogni pirata:
   ha tenuto o e' crollato. Chi tiene prende monete personali; a ogni show
   completato la ciurma sblocca una nuova "faccia del Teschio" da collezione.

   Nessun dado. Solo funzioni pure, testabili senza browser.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_TESCHIO_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function withTeschioDefaults(saved) {
    const defaults = { lastShowDay: null, facce: [], recentSfideIds: [], showsFatti: 0 };
    const source = saved && typeof saved === "object" ? saved : {};
    const out = { ...defaults, ...source };
    out.facce = Array.isArray(out.facce) ? out.facce.slice() : [];
    out.recentSfideIds = Array.isArray(out.recentSfideIds) ? out.recentSfideIds.slice() : [];
    out.showsFatti = Number.isFinite(out.showsFatti) && out.showsFatti >= 0 ? Math.round(out.showsFatti) : 0;
    out.lastShowDay = Number.isFinite(out.lastShowDay) ? out.lastShowDay : null;
    return out;
  }

  const dayAvailable = (teschio, day) => !teschio || teschio.lastShowDay !== day;

  /* Sceglie una sfida evitando le ultime 4 viste, se restano alternative. */
  function pickSfida(sfide, recentIds, random) {
    if (!Array.isArray(sfide) || !sfide.length) return null;
    const recent = new Set((recentIds || []).slice(-4));
    const unseen = sfide.filter((s) => !recent.has(s.id));
    const pool = unseen.length && sfide.length >= 5 ? unseen : sfide;
    const rng = typeof random === "function" ? random : Math.random;
    return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  }

  /* Sceglie una faccia non ancora posseduta; se sono tutte prese, ne ripesca
     una a caso (la collezione ricomincia a "doppioni"). */
  function pickFaccia(facce, ownedIds, random) {
    if (!Array.isArray(facce) || !facce.length) return null;
    const owned = new Set(ownedIds || []);
    const nuove = facce.filter((f) => !owned.has(f.id));
    const pool = nuove.length ? nuove : facce;
    const rng = typeof random === "function" ? random : Math.random;
    return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  }

  /* Applica l'esito dello show: chi ha tenuto (o il "crollo piu' buffo") si
     tiene META' di quello che guadagna come monete personali; l'altra meta'
     va in un fondo comune diviso in parti uguali tra TUTTI i pirati attivi
     oggi, tenuto o no. Cosi' nessuno resta mai a zero: i piu' bravi diventano
     solo un po' piu' ricchi. Muta lo stato passato (come applyRaidRewardsOnce). */
  function applyShowRewards(state, sfida, passerIds, buffoId, activeIds) {
    if (!state || typeof state !== "object" || !Array.isArray(state.players) || !sfida) return { total: 0 };
    const premio = Number(sfida.premio) || 0;
    const consolazione = Math.round(premio / 2);
    const passers = new Set(Array.isArray(passerIds) ? passerIds : []);
    const active = Array.isArray(activeIds) && activeIds.length ? activeIds : state.players.map((p) => p.id);

    let personalTotal = 0;
    let poolTotal = 0;
    state.players.forEach((p) => {
      let earned = 0;
      if (passers.has(p.id)) earned = premio;
      else if (buffoId && p.id === buffoId) earned = consolazione;
      if (earned > 0) {
        const personal = Math.round(earned / 2);
        p.coins = (Number(p.coins) || 0) + personal;
        personalTotal += personal;
        poolTotal += earned - personal;
      }
    });

    const heads = Math.max(1, active.length);
    const each = Math.floor(poolTotal / heads);
    let poolGiven = 0;
    if (each > 0) {
      active.forEach((id) => {
        const p = state.players.find((pp) => pp.id === id);
        if (p) { p.coins = (Number(p.coins) || 0) + each; poolGiven += each; }
      });
    }

    return { total: personalTotal + poolGiven, premio, consolazione, pool: poolTotal, each, heads };
  }

  return { withTeschioDefaults, dayAvailable, pickSfida, pickFaccia, applyShowRewards };
});
