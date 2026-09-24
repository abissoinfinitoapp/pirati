/* =============================================================================
   Fortress Army — Motore puro del Loot V1.

   Nessun DOM, nessun combattimento, nessuna regola di Party/Inventario qui
   dentro: solo estrazione (rarità/qualità/quantità) e le tabelle correlate,
   tutte centralizzate qui e in un solo posto.

   RNG sempre iniettabile (di default Math.random, come nel resto del
   progetto): ogni funzione che "estrae" accetta rng() -> [0,1).

   Non duplica computeDiceCount (Utility): quello resta in engine/fortress-loop.js.
   ========================================================================= */
(function (root, factory) {
  const armiCatalog = typeof module === "object" && module.exports
    ? require("../catalog/fortress-armi.js")
    : root.FORTRESS_ARMI_API;
  const itemsCatalog = typeof module === "object" && module.exports
    ? require("../catalog/fortress-items.js")
    : root.FORTRESS_ITEMS;
  const api = factory(armiCatalog, itemsCatalog);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_LOOT = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function (armiCatalog, itemsCatalog) {
  "use strict";

  /* =========================================================================
     ARMA INIZIALE — fissa per tutti (equità, nessuna randomizzazione).
     Non entra mai in collectedWeaponIds/discovery/sblocco: è assegnata
     direttamente a equipment.primary, mai attraverso drawWeaponId/equipFoundWeapon.
     ========================================================================= */
  const STARTER_WEAPON_ID = "assault_base";

  /* =========================================================================
     TABELLE — uniche fonti di verità, mai percentuali sparse nel codice.
     ========================================================================= */

  /* §7 Loot ambientale: 1 sola volta per zona, per tutta la run. */
  const AMBIENT_KIND_TABLE = { arma: 0.25, cura: 0.30, scudo: 0.30, utility: 0.15 };

  /* §3/§18 decisione: distribuzione UNICA e centralizzata del "che supporto
     è" (cura/scudo/utility), usata da Cassa, Elite e drop nemico normale. */
  const SUPPORT_TYPE_TABLE = { cura: 0.40, scudo: 0.40, utility: 0.20 };

  /* §8/§9/§10 rarità armi, per danger di zona ("basso"=★, "medio"=★★, "alto"=★★★). */
  const AMBIENT_WEAPON_RARITY = {
    basso: { comune: 0.60, "non-comune": 0.35, rara: 0.05 },
    medio: { comune: 0.35, "non-comune": 0.45, rara: 0.17, epica: 0.03 },
    alto: { comune: 0.15, "non-comune": 0.40, rara: 0.30, epica: 0.12, leggendaria: 0.03 }
  };
  const CHEST_WEAPON_RARITY = {
    basso: { comune: 0.35, "non-comune": 0.45, rara: 0.17, epica: 0.03 },
    medio: { comune: 0.15, "non-comune": 0.35, rara: 0.30, epica: 0.15, leggendaria: 0.05 },
    alto: { comune: 0.05, "non-comune": 0.20, rara: 0.35, epica: 0.25, leggendaria: 0.13, mitica: 0.02 }
  };
  const ELITE_WEAPON_RARITY = {
    basso: { "non-comune": 0.40, rara: 0.45, epica: 0.14, leggendaria: 0.01 },
    medio: { "non-comune": 0.15, rara: 0.45, epica: 0.30, leggendaria: 0.09, mitica: 0.01 },
    alto: { "non-comune": 0.05, rara: 0.30, epica: 0.35, leggendaria: 0.26, mitica: 0.04 }
  };

  /* §15/§16 qualità Cura/Scudo (indice 0/1/2 = Livello 1/2/3), per danger.
     Ambientale e drop nemico normale condividono la stessa tabella. */
  const QUALITY_AMBIENT_OR_DROP = {
    basso: [0.70, 0.25, 0.05],
    medio: [0.45, 0.40, 0.15],
    alto: [0.25, 0.45, 0.30]
  };
  const QUALITY_CHEST_OR_ELITE = {
    basso: [0.50, 0.40, 0.10],
    medio: [0.30, 0.45, 0.25],
    alto: [0.15, 0.40, 0.45]
  };

  /* §6 quantità casse — per lootTier (mai per id di zona) e bracket giocatori
     INIZIALI (mai giocatori presenti al momento dell'apertura). */
  const PLAYER_BRACKETS = [[2, 4, "2-4"], [5, 7, "5-7"], [8, 10, "8-10"]];
  const CHEST_COUNT_TABLE = {
    basso: { "2-4": 1, "5-7": 1, "8-10": 1 },
    medio: { "2-4": 1, "5-7": 1, "8-10": 2 },
    alto: { "2-4": 1, "5-7": 2, "8-10": 2 },
    boss: { "2-4": 0, "5-7": 0, "8-10": 0 }
  };

  /* =========================================================================
     HELPER DI ESTRAZIONE GENERICI
     ========================================================================= */

  /* Pesca una chiave da una tabella {chiave: probabilità}, nell'ordine in cui
     le chiavi sono state scritte (le soglie cumulative sono deterministiche
     e testabili). Fallback sull'ultima chiave per sicurezza in virgola mobile. */
  function weightedPick(rng, table) {
    const keys = Object.keys(table);
    const r = rng();
    let acc = 0;
    for (const key of keys) {
      acc += table[key];
      if (r < acc) return key;
    }
    return keys[keys.length - 1];
  }

  /* Indice 0-based da un array di probabilità (es. qualità Livello 1/2/3). */
  function weightedIndex(rng, probs) {
    const r = rng();
    let acc = 0;
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i];
      if (r < acc) return i;
    }
    return probs.length - 1;
  }

  /* Pesca uniforme su un array non vuoto. */
  function uniformPick(rng, list) {
    const idx = Math.min(list.length - 1, Math.floor(rng() * list.length));
    return list[idx];
  }

  /* =========================================================================
     ESTRAZIONE ARMA — §11 rarità -> categoria -> arma (mai un secondo
     elenco delle 100 armi: le categorie/armi vengono sempre lette dal
     catalogo reale). §12 protezione duplicati: fino a 3 tentativi totali,
     poi si accetta comunque il risultato.
     ========================================================================= */

  function categoriesForRarity(rarity) {
    const set = new Set();
    armiCatalog.ARMI.forEach((w) => { if (w.rarity === rarity) set.add(w.category); });
    return Array.from(set);
  }

  function weaponsForRarityAndCategory(rarity, category) {
    return armiCatalog.ARMI.filter((w) => w.rarity === rarity && w.category === category);
  }

  const MAX_DUPLICATE_ATTEMPTS = 3;

  function drawWeaponId(rng, rarityTable, seenWeaponIds) {
    const seen = seenWeaponIds || [];
    let weaponId = null;
    for (let attempt = 1; attempt <= MAX_DUPLICATE_ATTEMPTS; attempt++) {
      const rarity = weightedPick(rng, rarityTable);
      const categories = categoriesForRarity(rarity);
      const category = uniformPick(rng, categories);
      const candidates = weaponsForRarityAndCategory(rarity, category);
      weaponId = uniformPick(rng, candidates).id;
      if (seen.indexOf(weaponId) === -1 || attempt === MAX_DUPLICATE_ATTEMPTS) break;
    }
    return weaponId;
  }

  function createLootRegistry() {
    return { seenWeaponIds: [], nextInstanceId: 1 };
  }

  function registerSeenWeapon(lootRegistry, weaponId) {
    if (lootRegistry.seenWeaponIds.indexOf(weaponId) === -1) lootRegistry.seenWeaponIds.push(weaponId);
  }

  function nextGroundLootInstanceId(lootRegistry) {
    return lootRegistry.nextInstanceId++;
  }

  /* =========================================================================
     ESTRAZIONE SUPPORTO (Cura/Scudo/Utility)
     ========================================================================= */

  function buildSupportDescriptor(kind, danger, qualityTable, rng) {
    if (kind === "cura") {
      const idx = weightedIndex(rng, qualityTable[danger]);
      return { kind: "cura", itemId: itemsCatalog.CURA[idx].id };
    }
    if (kind === "scudo") {
      const idx = weightedIndex(rng, qualityTable[danger]);
      return { kind: "scudo", itemId: itemsCatalog.SCUDO[idx].id };
    }
    return { kind: "utility", itemId: uniformPick(rng, itemsCatalog.UTILITY).id };
  }

  /* =========================================================================
     FONTI DI LOOT — §7
     ========================================================================= */

  /* Loot ambientale: chiamata SOLO dal loop quando la zona non è ancora
     stata reclamata (la gestione "una volta per zona" resta nel loop). */
  function rollAmbientLoot(danger, rng, lootRegistry) {
    const kind = weightedPick(rng, AMBIENT_KIND_TABLE);
    if (kind === "arma") {
      const weaponId = drawWeaponId(rng, AMBIENT_WEAPON_RARITY[danger], lootRegistry.seenWeaponIds);
      registerSeenWeapon(lootRegistry, weaponId);
      return { kind: "weapon", weaponId };
    }
    return buildSupportDescriptor(kind, danger, QUALITY_AMBIENT_OR_DROP, rng);
  }

  /* Cassa: sempre 1 arma garantita + 1 supporto garantito. */
  function rollChestLoot(danger, rng, lootRegistry) {
    const weaponId = drawWeaponId(rng, CHEST_WEAPON_RARITY[danger], lootRegistry.seenWeaponIds);
    registerSeenWeapon(lootRegistry, weaponId);
    const supportKind = weightedPick(rng, SUPPORT_TYPE_TABLE);
    const support = buildSupportDescriptor(supportKind, danger, QUALITY_CHEST_OR_ELITE, rng);
    return { weapon: { kind: "weapon", weaponId }, support };
  }

  /* Elite: stessa forma della cassa, tabelle rarità Elite. */
  function rollEliteLoot(danger, rng, lootRegistry) {
    const weaponId = drawWeaponId(rng, ELITE_WEAPON_RARITY[danger], lootRegistry.seenWeaponIds);
    registerSeenWeapon(lootRegistry, weaponId);
    const supportKind = weightedPick(rng, SUPPORT_TYPE_TABLE);
    const support = buildSupportDescriptor(supportKind, danger, QUALITY_CHEST_OR_ELITE, rng);
    return { weapon: { kind: "weapon", weaponId }, support };
  }

  /* Nemico standard (normale/aggressivo/resistente/distanza): 75% niente,
     25% supporto. Mai un'arma garantita. */
  function rollNormalEnemyLoot(danger, rng) {
    if (rng() >= 0.25) return null;
    const kind = weightedPick(rng, SUPPORT_TYPE_TABLE);
    return buildSupportDescriptor(kind, danger, QUALITY_AMBIENT_OR_DROP, rng);
  }

  /* =========================================================================
     CASSE — quantità per run, §6
     ========================================================================= */

  /* Il gioco reale supporta 2-10 giocatori; qui si clampa (mai un errore)
     perché diverse fixture di test usano 1 solo giocatore per isolare
     scenari di combattimento che non hanno nulla a che fare con le casse. */
  function bracketFor(initialPlayerCount) {
    const n = Math.max(2, Math.min(10, Math.round(initialPlayerCount) || 2));
    const found = PLAYER_BRACKETS.find(([lo, hi]) => n >= lo && n <= hi);
    return found[2];
  }

  /* "basso/medio" o "medio/alto" (lootTier composito) -> arrotonda al tier
     più alto tra quelli citati. lootTier null o assente (Central Fortress, o
     una mappa che non usa questo campo, es. quella sintetica dei test) -> "boss"
     (0 casse): mai un errore per una zona che semplicemente non lo definisce. */
  function resolveLootTierBucket(lootTier) {
    if (lootTier === null || lootTier === undefined) return "boss";
    const RANK = { basso: 1, medio: 2, alto: 3 };
    let best = null;
    String(lootTier).split("/").map((s) => s.trim()).forEach((part) => {
      if (RANK[part] && (!best || RANK[part] > RANK[best])) best = part;
    });
    if (!best) throw new Error("lootTier sconosciuto: " + lootTier);
    return best;
  }

  function chestCountFor(lootTier, initialPlayerCount) {
    const bucket = resolveLootTierBucket(lootTier);
    return CHEST_COUNT_TABLE[bucket][bracketFor(initialPlayerCount)];
  }

  /* Popola zone[].chests UNA VOLTA, subito dopo createGame: la quantità non
     cambia mai durante la run. Ogni zona deve avere già .chests = [] e
     .lootTier (mai letto da danger, mai dall'id della zona). */
  function setupChests(zones, initialPlayerCount) {
    zones.forEach((zone) => {
      const count = chestCountFor(zone.lootTier, initialPlayerCount);
      for (let i = 0; i < count; i++) {
        zone.chests.push({ id: `${zone.id}_chest_${i + 1}`, opened: false });
      }
    });
  }

  return {
    STARTER_WEAPON_ID,
    AMBIENT_KIND_TABLE, SUPPORT_TYPE_TABLE,
    AMBIENT_WEAPON_RARITY, CHEST_WEAPON_RARITY, ELITE_WEAPON_RARITY,
    QUALITY_AMBIENT_OR_DROP, QUALITY_CHEST_OR_ELITE,
    CHEST_COUNT_TABLE, PLAYER_BRACKETS, MAX_DUPLICATE_ATTEMPTS,
    weightedPick, weightedIndex, uniformPick,
    categoriesForRarity, weaponsForRarityAndCategory, drawWeaponId,
    createLootRegistry, registerSeenWeapon, nextGroundLootInstanceId,
    buildSupportDescriptor,
    rollAmbientLoot, rollChestLoot, rollEliteLoot, rollNormalEnemyLoot,
    bracketFor, resolveLootTierBucket, chestCountFor, setupChests
  };
});
