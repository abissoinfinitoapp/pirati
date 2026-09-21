/* =============================================================================
   MOTORE PURO — La nave della ciurma
   -----------------------------------------------------------------------------
   Una SOLA nave, condivisa da tutta la ciurma, con 6 livelli (0-5): dalla
   barchetta di partenza al vascello finale. Ogni upgrade costa monete del
   forziere comune E il possesso di 1-2 premi della casa di Nonna Belarda
   (consumati: spariscono dal Bottino, montati sulla nave). Ogni livello
   può aggiungere Velocità (miglia extra in navigazione) o Forza (bonus
   nelle prove di Coraggio contro mostri e assalti).

   Nessun dado, nessuna scelta: solo funzioni pure, testabili senza browser.
   ========================================================================== */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_NAVE_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const MAX_LEVEL = 5;

  function withShipDefaults(saved) {
    const rawLevel = saved && Number.isFinite(saved.level) ? Math.round(saved.level) : 0;
    return { level: Math.max(0, Math.min(MAX_LEVEL, rawLevel)) };
  }

  function countBy(ids) {
    const counts = {};
    (ids || []).forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    return counts;
  }

  /* Il prossimo livello è ottenibile? Serve essere esattamente al livello
     precedente (non si salta), avere abbastanza monete nel forziere comune
     e possedere ancora, nel Bottino, una copia di ciascun premio richiesto
     (le copie già usate per upgrade precedenti non contano più). */
  function canUpgrade(shipLevel, upgrade, coinsAvailable, ownedLootIds) {
    const level = Number.isFinite(shipLevel) ? shipLevel : 0;
    if (!upgrade || upgrade.level !== level + 1) {
      return { ok: false, wrongLevel: true, missingCoins: 0, missingItemIds: [] };
    }
    const missingCoins = Math.max(0, (upgrade.cost || 0) - (coinsAvailable || 0));
    const owned = countBy(ownedLootIds);
    const needed = countBy(upgrade.requires);
    const missingItemIds = [];
    Object.keys(needed).forEach((id) => {
      const short = needed[id] - (owned[id] || 0);
      for (let i = 0; i < short; i += 1) missingItemIds.push(id);
    });
    return { ok: missingCoins === 0 && missingItemIds.length === 0, wrongLevel: false, missingCoins, missingItemIds };
  }

  /* Somma i bonus di velocità/forza di tutti i livelli sbloccati (1..shipLevel). */
  function totalBonus(levels, shipLevel) {
    const list = Array.isArray(levels) ? levels : [];
    const level = Number.isFinite(shipLevel) ? shipLevel : 0;
    return list.reduce((sum, lvl) => {
      if (!lvl || lvl.level <= 0 || lvl.level > level) return sum;
      return { speed: sum.speed + (lvl.speed || 0), strength: sum.strength + (lvl.strength || 0) };
    }, { speed: 0, strength: 0 });
  }

  return { MAX_LEVEL, withShipDefaults, canUpgrade, totalBonus };
});
