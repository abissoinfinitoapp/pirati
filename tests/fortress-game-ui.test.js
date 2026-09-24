const test = require("node:test");
const assert = require("node:assert/strict");
const { pickAutoTarget, pickAutoWeaponSlot } = require("../fortress-game-ui.js");

/* Guided Turn UI: "salta la schermata di scelta se non c'è davvero una
   scelta da fare". Queste due funzioni sono pure (nessun DOM, nessun
   Director/loop): ricevono solo dati già filtrati dal chiamante e decidono
   se serve un tap in più al bambino. Nessuna regola di gioco qui — solo
   "quanti elementi ci sono". */

test("pickAutoTarget: un solo bersaglio -> selezionato subito", () => {
  const targets = [{ kind: "enemy", id: "e1", hp: 5, maxHp: 10 }];
  assert.deepEqual(pickAutoTarget(targets), targets[0]);
});

test("pickAutoTarget: più bersagli -> nessuna auto-selezione, serve la scelta", () => {
  const targets = [
    { kind: "enemy", id: "e1", hp: 5, maxHp: 10 },
    { kind: "enemy", id: "e2", hp: 8, maxHp: 10 }
  ];
  assert.equal(pickAutoTarget(targets), null);
});

test("pickAutoTarget: nessun bersaglio -> null (nessun crash)", () => {
  assert.equal(pickAutoTarget([]), null);
  assert.equal(pickAutoTarget(null), null);
  assert.equal(pickAutoTarget(undefined), null);
});

test("pickAutoWeaponSlot: una sola arma equipaggiata -> quello slot", () => {
  const equipment = { primary: { id: "w1" }, secondary: null, cura: null, scudo: null, utility: null };
  assert.equal(pickAutoWeaponSlot(equipment), "primary");
});

test("pickAutoWeaponSlot: solo secondary equipaggiata -> secondary", () => {
  const equipment = { primary: null, secondary: { id: "w2" } };
  assert.equal(pickAutoWeaponSlot(equipment), "secondary");
});

test("pickAutoWeaponSlot: due armi equipaggiate -> null, serve la scelta", () => {
  const equipment = { primary: { id: "w1" }, secondary: { id: "w2" } };
  assert.equal(pickAutoWeaponSlot(equipment), null);
});

test("pickAutoWeaponSlot: nessuna arma equipaggiata -> null", () => {
  assert.equal(pickAutoWeaponSlot({ primary: null, secondary: null }), null);
  assert.equal(pickAutoWeaponSlot(null), null);
});
