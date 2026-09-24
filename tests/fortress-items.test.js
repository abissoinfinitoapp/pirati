const test = require("node:test");
const assert = require("node:assert/strict");
const items = require("../catalog/fortress-items.js");

test("3 Cure, 3 Scudi, 3 Utility, 9 in totale, id univoci", () => {
  assert.equal(items.CURA.length, 3);
  assert.equal(items.SCUDO.length, 3);
  assert.equal(items.UTILITY.length, 3);
  assert.equal(items.ALL.length, 9);
  assert.equal(new Set(items.ALL.map((i) => i.id)).size, 9);
});

test("Cura/Scudo: livello 3 è 'full', livelli 1/2 hanno un amount numerico", () => {
  [items.CURA, items.SCUDO].forEach((list) => {
    assert.equal(list[0].full, false);
    assert.equal(typeof list[0].amount, "number");
    assert.equal(list[1].full, false);
    assert.equal(typeof list[1].amount, "number");
    assert.equal(list[2].full, true);
    assert.equal(list[2].amount, null);
    assert.ok(list[1].amount > list[0].amount, "il livello 2 cura/ripara più del livello 1");
  });
});

test("Utility: scanner, fumogeno, stim, nessun livello di qualità", () => {
  const ids = items.UTILITY.map((i) => i.id).sort();
  assert.deepEqual(ids, ["fumogeno", "scanner", "stim"]);
});

test("findItem risolve per id, null se sconosciuto", () => {
  assert.equal(items.findItem("medikit").kind, "cura");
  assert.equal(items.findItem("scanner").kind, "utility");
  assert.equal(items.findItem("non-esiste"), null);
});
