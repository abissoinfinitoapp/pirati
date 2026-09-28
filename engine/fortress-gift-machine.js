/* =============================================================================
   Fortress Army — Macchina Regali V1
   Il D6 è SEMPRE fisico: questo modulo riceve il risultato 1..6 e usa solo
   quel valore per scegliere una tabella di rarità. Il 3 è volutamente il
   risultato con la probabilità più alta di Rara/Epica; il 6 non è un jackpot
   automatico. Poi pesca un'arma reale dal catalogo.
   ========================================================================= */
(function (root, factory) {
  const armiCatalog = typeof module === "object" && module.exports
    ? require("../catalog/fortress-armi.js")
    : root.FORTRESS_ARMI_API;
  const api = factory(armiCatalog);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_GIFT_MACHINE = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function (armiCatalog) {
  "use strict";

  const RARITY_BY_ROLL = Object.freeze({
    1: Object.freeze({ comune: 0.55, "non-comune": 0.30, rara: 0.12, epica: 0.03 }),
    2: Object.freeze({ comune: 0.35, "non-comune": 0.40, rara: 0.20, epica: 0.05 }),
    3: Object.freeze({ comune: 0.08, "non-comune": 0.22, rara: 0.40, epica: 0.22, leggendaria: 0.07, mitica: 0.01 }),
    4: Object.freeze({ comune: 0.15, "non-comune": 0.35, rara: 0.32, epica: 0.14, leggendaria: 0.04 }),
    5: Object.freeze({ comune: 0.10, "non-comune": 0.25, rara: 0.32, epica: 0.22, leggendaria: 0.09, mitica: 0.02 }),
    6: Object.freeze({ comune: 0.20, "non-comune": 0.30, rara: 0.27, epica: 0.15, leggendaria: 0.07, mitica: 0.01 })
  });

  function assertRoll(roll) {
    const n = Number(roll);
    if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error("Risultato D6 non valido");
    return n;
  }

  function weightedPick(table, rng) {
    const r = (rng || Math.random)();
    let acc = 0;
    const keys = Object.keys(table);
    for (const key of keys) {
      acc += table[key];
      if (r < acc) return key;
    }
    return keys[keys.length - 1];
  }

  function uniqueCatalogWeapons() {
    const map = new Map();
    (armiCatalog.ARMI || []).forEach((w) => { if (w && w.id && !map.has(w.id)) map.set(w.id, w); });
    return Array.from(map.values());
  }

  function weaponsForRarity(rarity) {
    return uniqueCatalogWeapons().filter((w) => w.rarity === rarity && w.id !== "assault_base");
  }

  function drawWeapon(roll, rng, seenWeaponIds) {
    const resolvedRoll = assertRoll(roll);
    const table = RARITY_BY_ROLL[resolvedRoll];
    const rarity = weightedPick(table, rng);
    let candidates = weaponsForRarity(rarity);
    if (!candidates.length) candidates = uniqueCatalogWeapons().filter((w) => w.id !== "assault_base");
    const seen = new Set(Array.isArray(seenWeaponIds) ? seenWeaponIds : []);
    const unseen = candidates.filter((w) => !seen.has(w.id));
    const pool = unseen.length ? unseen : candidates;
    if (!pool.length) throw new Error("Catalogo armi vuoto");
    const random = rng || Math.random;
    const idx = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    const weapon = pool[idx];
    return {
      roll: resolvedRoll,
      rarity,
      weaponId: weapon.id,
      weapon,
      image: armiCatalog.getImage ? armiCatalog.getImage(weapon) : weapon.image || null,
      power: armiCatalog.computePower ? armiCatalog.computePower(weapon) : null,
      potenza: armiCatalog.computePotenza ? armiCatalog.computePotenza(weapon) : null,
      baseDice: armiCatalog.getBaseDice ? armiCatalog.getBaseDice(weapon) : null,
      range: armiCatalog.getRange ? armiCatalog.getRange(weapon) : null
    };
  }

  function favorableChance(roll) {
    const table = RARITY_BY_ROLL[assertRoll(roll)];
    return (table.rara || 0) + (table.epica || 0);
  }

  return { RARITY_BY_ROLL, drawWeapon, favorableChance, assertRoll };
});
