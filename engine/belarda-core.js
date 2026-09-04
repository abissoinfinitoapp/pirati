/* =============================================================================
   MOTORE PURO — La casa di Nonna Belarda
   -----------------------------------------------------------------------------
   Ogni azione della ciurma (quest, saccheggio, Pesce Crostone, incontri...)
   produce un po' di cianfrusaglie. Quando la ciurma sbarca su un'isola, le
   cianfrusaglie accumulate vengono consegnate alla casa di Nonna Belarda su
   QUELLA isola. Se la casa si riempie, esplode: la ciurma vince un premio e
   la casa (paziente) viene ricostruita vuota, pronta a riempirsi di nuovo.
   L'eccesso oltre la soglia non si perde: resta nella casa appena ricostruita.

   Nessun dado, nessuna scelta: solo funzioni pure, testabili senza browser.
   ========================================================================== */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_BELARDA_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const DEFAULT_THRESHOLD = 12000; // kg = 12 tonnellate

  function withBelardaDefaults(saved) {
    const defaults = {
      pending: 0,
      houses: {},
      threshold: DEFAULT_THRESHOLD,
      explosions: 0,
      recentRewardIds: [],
      lastReveal: null
    };
    const source = saved && typeof saved === "object" ? saved : {};
    const out = { ...defaults, ...source };
    out.houses = source.houses && typeof source.houses === "object" && !Array.isArray(source.houses)
      ? { ...source.houses }
      : {};
    out.recentRewardIds = Array.isArray(out.recentRewardIds) ? out.recentRewardIds.slice() : [];
    out.pending = Number.isFinite(out.pending) && out.pending >= 0 ? out.pending : 0;
    out.threshold = Number.isFinite(out.threshold) && out.threshold > 0 ? out.threshold : DEFAULT_THRESHOLD;
    out.explosions = Number.isFinite(out.explosions) && out.explosions >= 0 ? out.explosions : 0;
    out.lastReveal = out.lastReveal && typeof out.lastReveal === "object" && !Array.isArray(out.lastReveal)
      ? out.lastReveal
      : null;
    return out;
  }

  /* Consegna a Nonna Belarda tutte le cianfrusaglie in sospeso, sull'isola
     data. Restituisce il nuovo blocco case + se e' esplosa. Non muta l'input. */
  function deliverJunk(belarda, islandId) {
    if (!islandId) return null;
    const b = withBelardaDefaults(belarda);
    const before = Number(b.houses[islandId]) || 0;
    const filled = before + b.pending;
    const exploded = filled >= b.threshold;
    const houses = { ...b.houses, [islandId]: exploded ? filled - b.threshold : filled };
    return { houses, pending: 0, exploded, before, filled, after: houses[islandId] };
  }

  /* Sceglie un premio d'esplosione evitando gli ultimi visti (se ce ne sono
     abbastanza), come pickPair per i saccheggi. */
  function pickReward(rewards, recentIds, random) {
    if (!Array.isArray(rewards) || !rewards.length) return null;
    const recent = new Set((recentIds || []).slice(-2));
    const unseen = rewards.filter((entry) => !recent.has(entry.id));
    const pool = unseen.length && rewards.length > 2 ? unseen : rewards;
    const rng = typeof random === "function" ? random : Math.random;
    return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  }

  return { DEFAULT_THRESHOLD, withBelardaDefaults, deliverJunk, pickReward };
});
