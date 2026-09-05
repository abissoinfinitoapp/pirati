const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/domandona-core.js");

test("withDomandonaDefaults inizializza lo stato e non condivide array col salvataggio", () => {
  const empty = core.withDomandonaDefaults({});
  assert.equal(empty.tickets, 0);
  assert.equal(empty.pending, null);
  assert.deepEqual(empty.solvedIds, []);

  const saved = { solvedIds: ["a"], recentIds: ["a"] };
  const out = core.withDomandonaDefaults(saved);
  out.solvedIds.push("b");
  assert.deepEqual(saved.solvedIds, ["a"], "non deve mutare l'oggetto salvato");
});

test("withDomandonaDefaults scarta valori corrotti", () => {
  const out = core.withDomandonaDefaults({ tickets: -3, solvedIds: "boh", pending: { questionId: 5 } });
  assert.equal(out.tickets, 0);
  assert.deepEqual(out.solvedIds, []);
  assert.equal(out.pending, null, "un pending senza questionId testuale non e' valido");
});

test("withDomandonaDefaults conserva un pending valido e ripulisce l'hintLevel", () => {
  const out = core.withDomandonaDefaults({ pending: { questionId: "capitale-italia", hintLevel: -2 } });
  assert.deepEqual(out.pending, { questionId: "capitale-italia", hintLevel: 0 });
});

test("pickQuestion filtra per livello e ignora le domande gia' risolte", () => {
  const questions = [
    { id: "a", level: "facile" }, { id: "b", level: "facile" },
    { id: "c", level: "facile" }, { id: "d", level: "avanzato" }
  ];
  const picked = core.pickQuestion(questions, "facile", ["a", "b"], [], () => 0);
  assert.equal(picked.id, "c");
});

test("pickQuestion ricicla tutto il mazzo quando e' tutto risolto", () => {
  const questions = [{ id: "a", level: "facile" }, { id: "b", level: "facile" }];
  const picked = core.pickQuestion(questions, "facile", ["a", "b"], [], () => 0);
  assert.equal(picked.id, "a");
});

test("pickQuestion evita le ultime due viste quando il mazzo e' abbastanza grande", () => {
  const questions = ["a", "b", "c", "d"].map((id) => ({ id, level: "facile" }));
  const picked = core.pickQuestion(questions, "facile", [], ["a", "b"], () => 0);
  assert.equal(picked.id, "c");
});

test("pickQuestion su catalogo vuoto o livello assente non lancia", () => {
  assert.equal(core.pickQuestion([], "facile", [], [], () => 0), null);
  assert.equal(core.pickQuestion([{ id: "a", level: "facile" }], "avanzato", [], [], () => 0), null);
});

test("bumpHint avanza di un indizio senza mai superare l'ultimo disponibile", () => {
  assert.equal(core.bumpHint(0, 2), 1);
  assert.equal(core.bumpHint(1, 2), 2);
  assert.equal(core.bumpHint(2, 2), 2, "resta sull'ultimo indizio, non lo supera mai");
});
