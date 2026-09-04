const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/belarda-core.js");

test("withBelardaDefaults inizializza lo stato e non condivide 'houses' col salvataggio", () => {
  const empty = core.withBelardaDefaults({});
  assert.deepEqual(empty.houses, {});
  assert.equal(empty.pending, 0);
  assert.equal(empty.threshold, core.DEFAULT_THRESHOLD);

  const saved = { houses: { vulcano: 4 }, pending: 2 };
  const out = core.withBelardaDefaults(saved);
  out.houses.vulcano = 999;
  assert.equal(saved.houses.vulcano, 4, "non deve mutare l'oggetto salvato");
});

test("withBelardaDefaults scarta valori corrotti", () => {
  const out = core.withBelardaDefaults({ pending: -3, threshold: 0, houses: "boh", recentRewardIds: "x" });
  assert.equal(out.pending, 0);
  assert.equal(out.threshold, core.DEFAULT_THRESHOLD);
  assert.deepEqual(out.houses, {});
  assert.deepEqual(out.recentRewardIds, []);
});

test("deliverJunk accumula senza esplodere sotto soglia", () => {
  const belarda = { pending: 5, houses: { vulcano: 3 }, threshold: 12 };
  const result = core.deliverJunk(belarda, "vulcano");
  assert.equal(result.exploded, false);
  assert.equal(result.after, 8);
  assert.equal(result.pending, 0);
  assert.deepEqual(result.houses, { vulcano: 8 });
});

test("deliverJunk fa esplodere la casa e riporta l'eccesso nella casa ricostruita", () => {
  const belarda = { pending: 6, houses: { vulcano: 9 }, threshold: 12 };
  const result = core.deliverJunk(belarda, "vulcano");
  assert.equal(result.exploded, true);
  assert.equal(result.filled, 15);
  assert.equal(result.after, 3); // 15 - 12, non si perde l'eccesso
});

test("deliverJunk consegna solo all'isola scelta, le altre case restano ferme", () => {
  const belarda = { pending: 4, houses: { vulcano: 5, corallo: 7 }, threshold: 12 };
  const result = core.deliverJunk(belarda, "vulcano");
  assert.deepEqual(result.houses, { vulcano: 9, corallo: 7 });
});

test("deliverJunk senza isola non fa nulla", () => {
  assert.equal(core.deliverJunk({ pending: 3, houses: {}, threshold: 12 }, null), null);
});

test("pickReward evita gli ultimi due premi quando ce ne sono abbastanza", () => {
  const rewards = ["a", "b", "c", "d"].map((id) => ({ id }));
  const picked = core.pickReward(rewards, ["a", "b"], () => 0);
  assert.equal(picked.id, "c");
});

test("pickReward torna a pescare da tutti se il catalogo è troppo piccolo", () => {
  const rewards = ["a", "b"].map((id) => ({ id }));
  const picked = core.pickReward(rewards, ["a", "b"], () => 0);
  assert.equal(picked.id, "a");
});

test("pickReward su catalogo vuoto non lancia", () => {
  assert.equal(core.pickReward([], [], () => 0), null);
  assert.equal(core.pickReward(null, [], () => 0), null);
});
