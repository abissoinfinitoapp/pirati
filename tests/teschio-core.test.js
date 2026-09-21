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

test("applyShowRewards: meta' personale a chi tiene/al piu' buffo, l'altra meta' divisa tra TUTTI gli attivi", () => {
  const state = { players: [{ id: "p1", coins: 0 }, { id: "p2", coins: 100 }, { id: "p3", coins: 0 }] };
  const sfida = { premio: 300000 };
  const res = core.applyShowRewards(state, sfida, ["p1"], "p3");
  // p1 tiene: 150000 personali + 75000 dal fondo comune
  assert.equal(state.players[0].coins, 225000);
  // p2 non ha tenuto e non e' il piu' buffo: nessuna quota personale, ma prende comunque la sua fetta del fondo
  assert.equal(state.players[1].coins, 75100, "nessuno resta a zero");
  // p3 crollo piu' buffo: 75000 personali (meta' della consolazione) + 75000 dal fondo comune
  assert.equal(state.players[2].coins, 150000);
  assert.equal(res.total, 450000, "il totale distribuito non cambia rispetto a prima, solo la spartizione");
});

test("applyShowRewards: il fondo comune si divide solo tra i pirati attivi", () => {
  const state = { players: [{ id: "p1", coins: 0 }, { id: "p2", coins: 0 }, { id: "p3", coins: 0 }] };
  const sfida = { premio: 200000 };
  // p3 e' assente oggi: non tiene, non e' il piu' buffo, e non e' tra gli attivi
  const res = core.applyShowRewards(state, sfida, ["p1"], null, ["p1", "p2"]);
  assert.equal(state.players[0].coins, 150000, "100000 personali + 50000 dal fondo (diviso tra 2 attivi)");
  assert.equal(state.players[1].coins, 50000, "solo la quota del fondo");
  assert.equal(state.players[2].coins, 0, "assente: nessuna quota, ma non e' un bug, e' fuori gioco oggi");
  assert.equal(res.total, 200000);
});

test("applyShowRewards regge stati strani senza lanciare", () => {
  assert.deepEqual(core.applyShowRewards(null, { premio: 10 }, [], null), { total: 0 });
  assert.deepEqual(core.applyShowRewards({ players: "x" }, { premio: 10 }, [], null), { total: 0 });
});
