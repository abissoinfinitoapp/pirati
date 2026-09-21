const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/nave-core.js");

test("withShipDefaults inizializza al livello 0 e blocca valori fuori scala", () => {
  assert.equal(core.withShipDefaults({}).level, 0);
  assert.equal(core.withShipDefaults(null).level, 0);
  assert.equal(core.withShipDefaults({ level: 3 }).level, 3);
  assert.equal(core.withShipDefaults({ level: -4 }).level, 0);
  assert.equal(core.withShipDefaults({ level: 99 }).level, core.MAX_LEVEL);
});

test("canUpgrade: rifiuta se non è il livello immediatamente successivo", () => {
  const upgrade = { level: 3, cost: 100, requires: [] };
  const res = core.canUpgrade(0, upgrade, 999999, []);
  assert.equal(res.ok, false);
  assert.equal(res.wrongLevel, true);
});

test("canUpgrade: segnala sia le monete sia i premi mancanti", () => {
  const upgrade = { level: 2, cost: 1000, requires: ["timone", "bussola"] };
  const res = core.canUpgrade(1, upgrade, 300, ["timone"]);
  assert.equal(res.ok, false);
  assert.equal(res.missingCoins, 700);
  assert.deepEqual(res.missingItemIds, ["bussola"]);
});

test("canUpgrade: ok quando monete e premi ci sono entrambi", () => {
  const upgrade = { level: 2, cost: 1000, requires: ["timone", "bussola"] };
  const res = core.canUpgrade(1, upgrade, 1000, ["timone", "bussola", "altro-premio"]);
  assert.equal(res.ok, true);
  assert.equal(res.missingCoins, 0);
  assert.deepEqual(res.missingItemIds, []);
});

test("canUpgrade: conta le copie, non solo la presenza dell'id", () => {
  const upgrade = { level: 1, cost: 0, requires: ["gemella", "gemella"] };
  const conUnaSola = core.canUpgrade(0, upgrade, 0, ["gemella"]);
  assert.equal(conUnaSola.ok, false);
  assert.deepEqual(conUnaSola.missingItemIds, ["gemella"]);
  const conDue = core.canUpgrade(0, upgrade, 0, ["gemella", "gemella"]);
  assert.equal(conDue.ok, true);
});

test("totalBonus: somma solo i livelli sbloccati, mai quelli futuri", () => {
  const levels = [
    { level: 0, speed: 0, strength: 0 },
    { level: 1, speed: 1, strength: 0 },
    { level: 2, speed: 0, strength: 1 },
    { level: 3, speed: 1, strength: 0 }
  ];
  assert.deepEqual(core.totalBonus(levels, 0), { speed: 0, strength: 0 });
  assert.deepEqual(core.totalBonus(levels, 2), { speed: 1, strength: 1 });
  assert.deepEqual(core.totalBonus(levels, 3), { speed: 2, strength: 1 });
});

test("totalBonus regge input vuoti o mancanti senza lanciare", () => {
  assert.deepEqual(core.totalBonus([], 5), { speed: 0, strength: 0 });
  assert.deepEqual(core.totalBonus(null, 5), { speed: 0, strength: 0 });
});
