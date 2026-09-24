const test = require("node:test");
const assert = require("node:assert/strict");
const loot = require("../engine/fortress-loot.js");
const armiCatalog = require("../catalog/fortress-armi.js");
const combat = require("../engine/fortress-combat.js");
const zonesCatalog = require("../catalog/fortress-zones.js");

function queueRng(values) {
  const q = values.slice();
  return () => {
    if (!q.length) throw new Error("queueRng: coda esaurita");
    return q.shift();
  };
}

const EPS = 1e-9;

/* Percorre una tabella {chiave: probabilità} nell'ordine di scrittura e
   verifica che appena sotto ogni soglia cumulativa esca la chiave corrente,
   e appena alla soglia esca la chiave successiva (o resti sull'ultima). */
function assertTableBoundaries(pick, table) {
  const keys = Object.keys(table);
  let acc = 0;
  keys.forEach((key, i) => {
    if (acc > 0) assert.equal(pick(queueRng([acc - EPS])), keys[i - 1], `appena sotto ${acc} deve restare "${keys[i - 1]}"`);
    assert.equal(pick(queueRng([acc + EPS])), key, `appena sopra ${acc} deve diventare "${key}"`);
    acc += table[key];
  });
  assert.equal(pick(queueRng([Math.min(0.999999, acc - EPS)])), keys[keys.length - 1]);
}

/* =========================================================================
   RARITÀ — boundary deterministici sulle 9 tabelle (3 fonti x 3 danger)
   ========================================================================= */

test("rarità armi — ambientale ★/★★/★★★: soglie esatte", () => {
  ["basso", "medio", "alto"].forEach((d) => {
    assertTableBoundaries((rng) => loot.weightedPick(rng, loot.AMBIENT_WEAPON_RARITY[d]), loot.AMBIENT_WEAPON_RARITY[d]);
  });
});

test("rarità armi — cassa ★/★★/★★★: soglie esatte", () => {
  ["basso", "medio", "alto"].forEach((d) => {
    assertTableBoundaries((rng) => loot.weightedPick(rng, loot.CHEST_WEAPON_RARITY[d]), loot.CHEST_WEAPON_RARITY[d]);
  });
});

test("rarità armi — Elite ★/★★/★★★: soglie esatte", () => {
  ["basso", "medio", "alto"].forEach((d) => {
    assertTableBoundaries((rng) => loot.weightedPick(rng, loot.ELITE_WEAPON_RARITY[d]), loot.ELITE_WEAPON_RARITY[d]);
  });
});

test("qualità Cura/Scudo — ambientale/drop normale: soglie esatte", () => {
  ["basso", "medio", "alto"].forEach((d) => {
    const table = loot.QUALITY_AMBIENT_OR_DROP[d];
    assert.equal(loot.weightedIndex(queueRng([table[0] - EPS]), table), 0);
    assert.equal(loot.weightedIndex(queueRng([table[0] + EPS]), table), 1);
    assert.equal(loot.weightedIndex(queueRng([table[0] + table[1] + EPS]), table), 2);
  });
});

test("qualità Cura/Scudo — cassa/Elite: soglie esatte", () => {
  ["basso", "medio", "alto"].forEach((d) => {
    const table = loot.QUALITY_CHEST_OR_ELITE[d];
    assert.equal(loot.weightedIndex(queueRng([table[0] - EPS]), table), 0);
    assert.equal(loot.weightedIndex(queueRng([table[0] + EPS]), table), 1);
    assert.equal(loot.weightedIndex(queueRng([table[0] + table[1] + EPS]), table), 2);
  });
});

test("distribuzione supporto (cura/scudo/utility) centralizzata 40/40/20", () => {
  assert.deepEqual(loot.SUPPORT_TYPE_TABLE, { cura: 0.40, scudo: 0.40, utility: 0.20 });
  assertTableBoundaries((rng) => loot.weightedPick(rng, loot.SUPPORT_TYPE_TABLE), loot.SUPPORT_TYPE_TABLE);
});

test("kind ambientale (arma/cura/scudo/utility) 25/30/30/15", () => {
  assert.deepEqual(loot.AMBIENT_KIND_TABLE, { arma: 0.25, cura: 0.30, scudo: 0.30, utility: 0.15 });
  assertTableBoundaries((rng) => loot.weightedPick(rng, loot.AMBIENT_KIND_TABLE), loot.AMBIENT_KIND_TABLE);
});

/* =========================================================================
   ESTRAZIONE ARMA — rarità -> categoria -> arma, nessuna seconda tabella
   ========================================================================= */

test("categorie per rarità derivano SEMPRE dal catalogo reale", () => {
  const cats = loot.categoriesForRarity("mitica");
  assert.deepEqual(cats.sort(), ["esotica"]);
  const comuni = loot.categoriesForRarity("comune");
  assert.ok(comuni.length > 5, "molte categorie hanno almeno un'arma comune");
  comuni.forEach((c) => assert.ok(armiCatalog.ARCHETYPES[c], `categoria sconosciuta al catalogo: ${c}`));
});

test("drawWeaponId pesca sempre un id realmente presente in ARMI (nessuna seconda tabella)", () => {
  const rng = () => 0.5; // riusabile all'infinito, non importa quale specifica arma esca
  for (let i = 0; i < 25; i++) {
    const id = loot.drawWeaponId(rng, loot.CHEST_WEAPON_RARITY.alto, []);
    assert.ok(armiCatalog.ARMI.some((w) => w.id === id), `id non trovato nel catalogo: ${id}`);
  }
});

test("drawWeaponId: rarità->categoria->arma segue esattamente i tre valori forniti", () => {
  // basso: comune [0,.6) — prendiamo comune con r=0.1
  // categorie comuni ordinate per prima apparizione in ARMI: assalto è la prima
  const categories = loot.categoriesForRarity("comune");
  const firstCategory = categories[0];
  const weapons = loot.weaponsForRarityAndCategory("comune", firstCategory);
  const rng = queueRng([0.1, 0, 0]); // rarità=comune, categoria=indice 0, arma=indice 0
  const id = loot.drawWeaponId(rng, loot.AMBIENT_WEAPON_RARITY.basso, []);
  assert.equal(id, weapons[0].id);
});

test("protezione duplicati: ritenta fino a 3 volte, poi accetta comunque", () => {
  const categories = loot.categoriesForRarity("comune");
  const firstCategory = categories[0];
  const weapons = loot.weaponsForRarityAndCategory("comune", firstCategory);
  const duplicateId = weapons[0].id;
  // ogni tentativo pesca sempre la STESSA arma (rarità=comune, categoria idx 0, arma idx 0):
  // 3 tentativi x 3 valori (rarità, categoria, arma) = 9 valori consumati esattamente
  const rng = queueRng([0.1, 0, 0, 0.1, 0, 0, 0.1, 0, 0]);
  const id = loot.drawWeaponId(rng, loot.AMBIENT_WEAPON_RARITY.basso, [duplicateId]);
  assert.equal(id, duplicateId, "dopo 3 tentativi si accetta comunque il duplicato");
});

test("protezione duplicati: se il secondo tentativo trova un'alternativa, la usa", () => {
  const categories = loot.categoriesForRarity("comune");
  const firstCategory = categories[0];
  const weapons = loot.weaponsForRarityAndCategory("comune", firstCategory);
  assert.ok(weapons.length > 1, "serve più di un'arma comune in questa categoria per il test");
  const seen = [weapons[0].id];
  // primo tentativo ripesca weapons[0] (duplicato) -> ritenta; secondo tentativo pesca weapons[1] (nuovo) -> accetta
  const rng = queueRng([0.1, 0, 0, 0.1, 0, 1 / weapons.length + EPS]);
  const id = loot.drawWeaponId(rng, loot.AMBIENT_WEAPON_RARITY.basso, seen);
  assert.equal(id, weapons[1].id);
});

/* =========================================================================
   FONTI DI LOOT — §7
   ========================================================================= */

test("loot ambientale: kind coerente con AMBIENT_KIND_TABLE, arma sempre valida", () => {
  const registry = loot.createLootRegistry();
  const asArma = loot.rollAmbientLoot("medio", queueRng([0.1, 0.1, 0, 0]), registry);
  assert.equal(asArma.kind, "weapon");
  assert.ok(armiCatalog.ARMI.some((w) => w.id === asArma.weaponId));

  const asCura = loot.rollAmbientLoot("medio", queueRng([0.30, 0]), registry);
  assert.equal(asCura.kind, "cura");
});

test("cassa: sempre 1 arma + 1 supporto, entrambi con id validi", () => {
  const registry = loot.createLootRegistry();
  const found = loot.rollChestLoot("alto", () => 0.5, registry);
  assert.equal(found.weapon.kind, "weapon");
  assert.ok(armiCatalog.ARMI.some((w) => w.id === found.weapon.weaponId));
  assert.ok(["cura", "scudo", "utility"].includes(found.support.kind));
});

test("Elite: sempre 1 arma + 1 supporto, tabella rarità Elite (mai Comune)", () => {
  const registry = loot.createLootRegistry();
  for (let i = 0; i < 15; i++) {
    const found = loot.rollEliteLoot("basso", Math.random, registry);
    const weapon = armiCatalog.ARMI.find((w) => w.id === found.weapon.weaponId);
    assert.notEqual(weapon.rarity, "comune", "un Elite non droppa mai un'arma Comune");
  }
});

test("nemico standard: 75% niente, 25% supporto (mai un'arma)", () => {
  const niente = loot.rollNormalEnemyLoot("medio", queueRng([0.25])); // >= 0.25 -> niente
  assert.equal(niente, null);
  const supporto = loot.rollNormalEnemyLoot("medio", queueRng([0.24999999, 0, 0]));
  assert.ok(["cura", "scudo", "utility"].includes(supporto.kind));
});

/* =========================================================================
   CASSE — quantità per run, §6
   ========================================================================= */

test("chestCountFor: 8/12/15 sulla tabella lootTier x bracket", () => {
  assert.equal(loot.chestCountFor("basso", 3), 1);
  assert.equal(loot.chestCountFor("basso", 6), 1);
  assert.equal(loot.chestCountFor("basso", 9), 1);
  assert.equal(loot.chestCountFor("medio", 3), 1);
  assert.equal(loot.chestCountFor("medio", 6), 1);
  assert.equal(loot.chestCountFor("medio", 9), 2);
  assert.equal(loot.chestCountFor("alto", 3), 1);
  assert.equal(loot.chestCountFor("alto", 6), 2);
  assert.equal(loot.chestCountFor("alto", 9), 2);
  assert.equal(loot.chestCountFor(null, 3), 0);
  assert.equal(loot.chestCountFor(null, 9), 0);
});

test("lootTier composito arrotonda al tier più alto citato", () => {
  assert.equal(loot.resolveLootTierBucket("basso/medio"), "medio");
  assert.equal(loot.resolveLootTierBucket("medio/alto"), "alto");
  assert.equal(loot.resolveLootTierBucket("alto"), "alto");
  assert.equal(loot.resolveLootTierBucket(null), "boss");
});

test("setupChests sulla mappa reale produce esattamente 8/12/15 casse totali", () => {
  [[2, 8], [3, 8], [4, 8], [5, 12], [6, 12], [7, 12], [8, 15], [9, 15], [10, 15]].forEach(([n, expectedTotal]) => {
    const zones = zonesCatalog.buildLoopZones(combat);
    loot.setupChests(zones, n);
    const total = zones.reduce((sum, z) => sum + z.chests.length, 0);
    assert.equal(total, expectedTotal, `con ${n} giocatori mi aspetto ${expectedTotal} casse totali`);
    const central = zones.find((z) => z.id === "central-fortress");
    assert.equal(central.chests.length, 0, "Central Fortress non ha mai casse");
  });
});

test("setupChests: id univoci, tutte non aperte", () => {
  const zones = zonesCatalog.buildLoopZones(combat);
  loot.setupChests(zones, 6);
  const allChests = zones.flatMap((z) => z.chests);
  assert.ok(allChests.length > 0);
  allChests.forEach((c) => assert.equal(c.opened, false));
  assert.equal(new Set(allChests.map((c) => c.id)).size, allChests.length);
});
