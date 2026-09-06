const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/teschio-core.js");

test("withTeschioDefaults inizializza e non condivide array col salvataggio", () => {
  const empty = core.withTeschioDefaults({});
  assert.deepEqual(empty.facce, []);
  assert.equal(empty.lastShowDay, null);
  const saved = { facce: ["a"], lastShowDay: 3 };
  const out = core.withTeschioDefaults(saved);
  out.facce.push("b");
  assert.deepEqual(saved.facce, ["a"], "non muta il salvataggio");
  assert.equal(out.lastShowDay, 3);
});

test("dayAvailable: lo show e' una volta per giornata di gioco", () => {
  assert.equal(core.dayAvailable({ lastShowDay: 5 }, 5), false);
  assert.equal(core.dayAvailable({ lastShowDay: 5 }, 6), true);
  assert.equal(core.dayAvailable(null, 1), true);
});

test("pickSfida evita le ultime quattro viste quando ci sono alternative", () => {
  const sfide = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  const picked = core.pickSfida(sfide, ["a", "b", "c", "d"], () => 0);
  assert.equal(picked.id, "e");
});

test("pickFaccia da' prima le facce nuove, poi ripesca da tutte", () => {
  const facce = ["a", "b", "c"].map((id) => ({ id }));
  assert.equal(core.pickFaccia(facce, ["a", "b"], () => 0).id, "c");
  assert.equal(core.pickFaccia(facce, ["a", "b", "c"], () => 0).id, "a", "collezione piena: doppioni");
});

test("applyShowRewards: monete personali a chi tiene, meta' al crollo piu' buffo", () => {
  const state = { players: [{ id: "p1", coins: 0 }, { id: "p2", coins: 100 }, { id: "p3", coins: 0 }] };
  const sfida = { premio: 300000 };
  const res = core.applyShowRewards(state, sfida, ["p1"], "p3");
  assert.equal(state.players[0].coins, 300000);
  assert.equal(state.players[1].coins, 100, "p2 non ha tenuto e non e' il piu' buffo: niente");
  assert.equal(state.players[2].coins, 150000, "p3 crollo piu' buffo: meta' premio");
  assert.equal(res.total, 450000);
});

test("applyShowRewards regge stati strani senza lanciare", () => {
  assert.deepEqual(core.applyShowRewards(null, { premio: 10 }, [], null), { total: 0 });
  assert.deepEqual(core.applyShowRewards({ players: "x" }, { premio: 10 }, [], null), { total: 0 });
});
