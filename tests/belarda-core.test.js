const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/belarda-core.js");

test("withBelardaDefaults inizializza lo stato e non condivide 'recentRewardIds' col salvataggio", () => {
  const empty = core.withBelardaDefaults({});
  assert.equal(empty.fill, 0);
  assert.equal(empty.threshold, core.DEFAULT_THRESHOLD);
  assert.deepEqual(empty.recentRewardIds, []);

  const saved = { fill: 4, recentRewardIds: ["a"] };
  const out = core.withBelardaDefaults(saved);
  out.recentRewardIds.push("b");
  assert.deepEqual(saved.recentRewardIds, ["a"], "non deve mutare l'array salvato");
});

test("withBelardaDefaults scarta valori corrotti", () => {
  const out = core.withBelardaDefaults({ fill: -3, threshold: 0, recentRewardIds: "x" });
  assert.equal(out.fill, 0);
  assert.equal(out.threshold, core.DEFAULT_THRESHOLD);
  assert.deepEqual(out.recentRewardIds, []);
});

test("addWeight accumula senza esplodere sotto soglia", () => {
  const belarda = { fill: 3, threshold: 12 };
  const result = core.addWeight(belarda, 5);
  assert.equal(result.exploded, false);
  assert.equal(result.fill, 8);
  assert.equal(result.after, 8);
});

test("addWeight fa esplodere la casa e riporta l'eccesso nella casa ricostruita", () => {
  const belarda = { fill: 9, threshold: 12 };
  const result = core.addWeight(belarda, 6);
  assert.equal(result.exploded, true);
  assert.equal(result.filled, 15);
  assert.equal(result.fill, 3); // 15 - 12, non si perde l'eccesso
});

test("addWeight con peso zero o negativo non fa nulla", () => {
  const belarda = { fill: 5, threshold: 12 };
  assert.deepEqual(core.addWeight(belarda, 0), { fill: 5, exploded: false, before: 5, filled: 5, after: 5 });
  assert.deepEqual(core.addWeight(belarda, -10), { fill: 5, exploded: false, before: 5, filled: 5, after: 5 });
});

test("KG_PER_ITEM: 300 pezzi comprati riempiono esattamente la soglia di default", () => {
  const result = core.addWeight({ fill: 0, threshold: core.DEFAULT_THRESHOLD }, 300 * core.KG_PER_ITEM);
  assert.equal(result.exploded, true);
  assert.equal(result.fill, 0, "riempie esattamente, niente eccesso");
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
