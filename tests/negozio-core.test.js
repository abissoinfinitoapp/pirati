const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/negozio-core.js");

const ITEMS = [
  { id: "unicorno", price: 10, perPrestigio: 5000 },
  { id: "banana", price: 1000, perPrestigio: 200 },
  { id: "supereroe", price: 700, perPrestigio: 350 }
];

test("withPlayerShopDefaults azzera gli acquisti se il salvataggio è di un altro giorno", () => {
  const ieri = { day: 4, bought: { unicorno: 3000 } };
  assert.deepEqual(core.withPlayerShopDefaults(ieri, 5), { day: 5, bought: {} });
  assert.deepEqual(core.withPlayerShopDefaults(ieri, 4).bought, { unicorno: 3000 });
});

test("withPlayerShopDefaults scarta valori corrotti e non muta il salvataggio", () => {
  const saved = { day: 2, bought: { unicorno: -5, banana: "boh", supereroe: 10 } };
  const out = core.withPlayerShopDefaults(saved, 2);
  assert.deepEqual(out.bought, { supereroe: 10 });
  assert.equal(saved.bought.unicorno, -5, "non deve mutare il salvataggio");
});

test("prestigioFromBought somma le frazioni di oggetti diversi", () => {
  // 100 banane = 0.5 punti, 175 supereroi = 0.5 punti -> 1 punto pieno
  const r = core.prestigioFromBought({ banana: 100, supereroe: 175 }, ITEMS);
  assert.equal(r.points, 1);
  assert.ok(Math.abs(r.progress - 1) < 1e-6);
  assert.equal(r.spent, 100 * 1000 + 175 * 700);
});

test("prestigioFromBought: servono 3 punti per fare il Capitano", () => {
  assert.equal(core.prestigioFromBought({ banana: 400 }, ITEMS).isCaptainEligible, false); // 2 punti
  assert.equal(core.prestigioFromBought({ banana: 600 }, ITEMS).isCaptainEligible, true);  // 3 punti
  assert.equal(core.PRESTIGIO_CAPITANO, 3);
});

test("prestigioFromBought ignora oggetti sconosciuti e quantità non valide", () => {
  const r = core.prestigioFromBought({ fantasma: 999999, banana: -10 }, ITEMS);
  assert.equal(r.points, 0);
  assert.equal(r.spent, 0);
});

test("canAfford controlla monete, prezzo e quantità", () => {
  assert.equal(core.canAfford(1000, 10, 100), true);
  assert.equal(core.canAfford(999, 10, 100), false);
  assert.equal(core.canAfford(1000, 10, 0), false);
});

test("spreeNextIndex avanza nella coda e finisce a -1", () => {
  assert.equal(core.spreeNextIndex(0, 3), 1);
  assert.equal(core.spreeNextIndex(2, 3), -1);
  assert.equal(core.spreeNextIndex(-1, 0), -1);
});
