/* =============================================================================
   Fortress Army — Simulazione DEV del Loot V1 (nessuna UI, nessun bilanciamento
   automatico). Genera casse + loot ambientale su 1000 run seedate/deterministiche
   per 2/4/6/10 giocatori e stampa un report: casse totali, armi generate,
   distribuzione rarità, duplicati, supporti generati, armi medie per giocatore.

   Uso: node scripts/fortress-loot-simulation.js
   Non modifica alcuna percentuale: legge solo engine/fortress-loot.js.
   ========================================================================= */
const loot = require("../engine/fortress-loot.js");
const combat = require("../engine/fortress-combat.js");
const zonesCatalog = require("../catalog/fortress-zones.js");

const RUNS_PER_BRACKET = 1000;
const PLAYER_COUNTS = [2, 4, 6, 10];

/* mulberry32: PRNG seedabile e deterministico, solo per questa simulazione
   (mai usato in partita reale, che resta sempre a dadi fisici / Math.random). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newReport() {
  return {
    runs: 0,
    totalChests: 0,
    totalWeaponsFound: 0,
    totalDuplicates: 0,
    rarityCounts: {},
    supportCounts: { cura: 0, scudo: 0, utility: 0 }
  };
}

function bump(obj, key) { obj[key] = (obj[key] || 0) + 1; }

function runOneGame(playerCount, rng, report, weaponRarityById) {
  const zones = zonesCatalog.buildLoopZones(combat);
  loot.setupChests(zones, playerCount);
  const registry = loot.createLootRegistry();

  report.totalChests += zones.reduce((sum, z) => sum + z.chests.length, 0);

  // Set indipendente dal lootRegistry interno del motore (che si aggiorna
  // PRIMA di restituire il risultato): serve solo a contare i duplicati
  // realmente osservati in QUESTA run, senza toccare l'API di produzione.
  const seenInThisRun = new Set();

  function record(descriptor) {
    if (!descriptor) return;
    if (descriptor.kind === "weapon") {
      const alreadySeen = seenInThisRun.has(descriptor.weaponId);
      seenInThisRun.add(descriptor.weaponId);
      report.totalWeaponsFound += 1;
      if (alreadySeen) report.totalDuplicates += 1;
      bump(report.rarityCounts, weaponRarityById(descriptor.weaponId));
    } else {
      report.supportCounts[descriptor.kind] += 1;
    }
  }

  // 1 loot ambientale per zona (§7: si assume ogni zona esplorata una volta)
  zones.forEach((zone) => record(loot.rollAmbientLoot(zone.danger, rng, registry)));

  // Ogni cassa: 1 arma + 1 supporto garantiti
  zones.forEach((zone) => {
    zone.chests.forEach(() => {
      const found = loot.rollChestLoot(zone.danger, rng, registry);
      record(found.weapon);
      record(found.support);
    });
  });

  report.runs += 1;
}

function main() {
  const armiCatalog = require("../catalog/fortress-armi.js");
  const rarityById = (id) => {
    const w = armiCatalog.ARMI.find((x) => x.id === id);
    return w ? w.rarity : "sconosciuta";
  };

  console.log(`Simulazione Loot V1 — ${RUNS_PER_BRACKET} run per bracket giocatori, seed deterministico\n`);

  PLAYER_COUNTS.forEach((n) => {
    const report = newReport();
    const rng = mulberry32(1000 + n); // un seed diverso e fisso per bracket: run riproducibili
    for (let i = 0; i < RUNS_PER_BRACKET; i++) runOneGame(n, rng, report, rarityById);

    const totalRarityDraws = Object.values(report.rarityCounts).reduce((a, b) => a + b, 0);
    console.log(`— ${n} giocatori —`);
    console.log(`  casse totali/run:        ${(report.totalChests / report.runs).toFixed(2)}`);
    console.log(`  armi trovate/run:        ${(report.totalWeaponsFound / report.runs).toFixed(2)}`);
    console.log(`  armi medie/giocatore:    ${(report.totalWeaponsFound / report.runs / n).toFixed(2)}`);
    console.log(`  duplicati/run:           ${(report.totalDuplicates / report.runs).toFixed(3)} (${((report.totalDuplicates / report.totalWeaponsFound) * 100).toFixed(1)}% delle armi trovate)`);
    console.log(`  distribuzione rarità:    ${Object.entries(report.rarityCounts).map(([r, c]) => `${r} ${(c / totalRarityDraws * 100).toFixed(1)}%`).join(", ")}`);
    console.log(`  supporti/run:            cura ${(report.supportCounts.cura / report.runs).toFixed(2)}, scudo ${(report.supportCounts.scudo / report.runs).toFixed(2)}, utility ${(report.supportCounts.utility / report.runs).toFixed(2)}`);
    console.log("");
  });
}

main();
