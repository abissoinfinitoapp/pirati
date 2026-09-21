/* =============================================================================
   MOTORE PURO — La casa di Nonna Belarda
   -----------------------------------------------------------------------------
   Una SOLA casa, legata al Negozio delle Cose Inutili: ogni oggetto comprato
   (qualunque sia il prezzo) pesa altrettanto in cianfrusaglie e riempie la
   casa. Quando si riempie, esplode: la ciurma vince un oggetto nuovo (mai
   monete — è il catalogo in catalog/belarda.js a deciderlo) e la casa
   (paziente) viene ricostruita vuota. L'eccesso oltre la soglia non si
   perde: resta nella casa appena ricostruita.

   Nessun dado, nessuna scelta: solo funzioni pure, testabili senza browser.
   ========================================================================== */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_BELARDA_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const DEFAULT_THRESHOLD = 12000; // kg = 12 tonnellate
  const KG_PER_ITEM = 40;          // ogni pezzo comprato pesa altrettanto, a prescindere dal prezzo

  function withBelardaDefaults(saved) {
    const defaults = {
      fill: 0,
      threshold: DEFAULT_THRESHOLD,
      explosions: 0,
      recentRewardIds: [],
      lastReveal: null
    };
    const source = saved && typeof saved === "object" ? saved : {};
    const out = { ...defaults, ...source };
    out.recentRewardIds = Array.isArray(out.recentRewardIds) ? out.recentRewardIds.slice() : [];
    out.fill = Number.isFinite(out.fill) && out.fill >= 0 ? out.fill : 0;
    out.threshold = Number.isFinite(out.threshold) && out.threshold > 0 ? out.threshold : DEFAULT_THRESHOLD;
    out.explosions = Number.isFinite(out.explosions) && out.explosions >= 0 ? out.explosions : 0;
    out.lastReveal = out.lastReveal && typeof out.lastReveal === "object" && !Array.isArray(out.lastReveal)
      ? out.lastReveal
      : null;
    return out;
  }

  /* Aggiunge peso (kg) alla casa. Se supera la soglia, esplode: l'eccesso
     resta nella casa appena ricostruita. Non muta l'input. */
  function addWeight(belarda, kg) {
    const b = withBelardaDefaults(belarda);
    const amount = Number(kg) || 0;
    if (amount <= 0) return { fill: b.fill, exploded: false, before: b.fill, filled: b.fill, after: b.fill };
    const filled = b.fill + amount;
    const exploded = filled >= b.threshold;
    const after = exploded ? filled - b.threshold : filled;
    return { fill: after, exploded, before: b.fill, filled, after };
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

  return { DEFAULT_THRESHOLD, KG_PER_ITEM, withBelardaDefaults, addWeight, pickReward };
});
