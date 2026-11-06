const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/fortress-skins-core.js");

const CATALOG = [
  { id: "duck-navy", characterId: "duck", name: "Duck Navy", rarity: "rara", price: 200, image: "duck-navy.webp", assetReady: true },
  { id: "duck-golden", characterId: "duck", name: "Duck Golden", rarity: "leggendaria", price: 500, image: "duck-golden.webp", assetReady: false },
  { id: "cat-jungle", characterId: "cat", name: "Cat Jungle", rarity: "non-comune", price: 100, image: "cat-jungle.webp", assetReady: true }
];

const funded = (amount, id = "duck") => core.addMoney(core.defaultState(), id, amount);

const CHARACTERS = [
  { id: "duck", name: "Duck", image: "duck-base.webp" },
  { id: "cat", name: "Cat", image: "cat-base.webp" }
];

test("defaultState non ha nessun campo di combattimento", () => {
  assert.deepEqual(Object.keys(core.defaultState()).sort(), ["equippedByCharacter", "ownedSkinIds", "walletByCharacter"]);
});

test("nessuna skin è mai posseduta di default: la Base non appartiene all'ownership", () => {
  const state = core.defaultState();
  assert.equal(core.ownsSkin(state, CATALOG[0]), false);
  assert.equal(core.canEquip(state, CATALOG[0]), false);
});

test("acquisto: skin non posseduta -> posseduta, monete scalate", () => {
  let state = Object.assign(funded(1000), {});
  assert.equal(core.ownsSkin(state, CATALOG[0]), false);
  state = core.buySkin(state, CATALOG, "duck-navy");
  assert.equal(core.getBalance(state, "duck"), 800);
  assert.equal(core.ownsSkin(state, CATALOG[0]), true);
});

test("acquisto rifiutato se non bastano le monete: stato invariato", () => {
  const state = funded(100 - 1);
  const after = core.buySkin(state, CATALOG, "duck-navy");
  assert.equal(after, state);
  assert.equal(core.ownsSkin(after, CATALOG[0]), false);
});

test("skin con assetReady false non è mai acquistabile né equipaggiabile", () => {
  let state = Object.assign(funded(999999), { ownedSkinIds: ["duck-golden"] });
  assert.equal(core.canBuy(state, CATALOG[1]), false);
  assert.equal(core.canEquip(state, CATALOG[1]), false);
  const after = core.equipSkin(state, CATALOG, "duck-golden");
  assert.equal(core.getEquippedSkinId(after, "duck"), null);
});

test("equip: una sola skin equipaggiata per personaggio, cambia l'immagine", () => {
  let state = Object.assign(funded(1000), {});
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
  assert.equal(core.getEquippedSkinId(state, "duck"), "duck-navy");
  assert.equal(core.getCharacterDisplayImage(state, CATALOG, CHARACTERS, "duck"), "duck-navy.webp");
});

test("equip di un personaggio non tocca l'equip di un altro personaggio", () => {
  let state = Object.assign(funded(1000), {});
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
  state = core.addMoney(state, "cat", 100);
  state = core.buySkin(state, CATALOG, "cat-jungle");
  state = core.equipSkin(state, CATALOG, "cat-jungle");
  assert.equal(core.getEquippedSkinId(state, "duck"), "duck-navy");
  assert.equal(core.getEquippedSkinId(state, "cat"), "cat-jungle");
});

test("nessuna skin equipaggiata -> immagine Base canonica del personaggio", () => {
  const state = core.defaultState();
  assert.equal(core.getEquippedSkin(state, CATALOG, "duck"), null);
  assert.equal(core.getCharacterDisplayImage(state, CATALOG, CHARACTERS, "duck"), "duck-base.webp");
});

test("rimuovendo la skin equipaggiata si torna automaticamente alla Base", () => {
  let state = Object.assign(funded(1000), {});
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
  assert.equal(core.getCharacterDisplayImage(state, CATALOG, CHARACTERS, "duck"), "duck-navy.webp");

  state = core.unequipSkin(state, "duck");
  assert.equal(core.getEquippedSkinId(state, "duck"), null);
  assert.equal(core.getCharacterDisplayImage(state, CATALOG, CHARACTERS, "duck"), "duck-base.webp");
});

test("unequip su un personaggio già alla Base non cambia nulla", () => {
  const state = core.defaultState();
  const after = core.unequipSkin(state, "duck");
  assert.equal(after, state);
});

test("cambio skin non modifica nessun campo estraneo allo stato Guardaroba (nessuno stato di combattimento coinvolto)", () => {
  let state = Object.assign(funded(1000), { someUnrelatedField: "invariato" });
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
  state = core.unequipSkin(state, "duck");
  assert.equal(state.someUnrelatedField, "invariato");
});

test("il portafoglio e' per personaggio: i soldi di Cat non comprano skin di Duck", () => {
  const state = funded(5000, "cat");
  assert.equal(core.canBuy(state, CATALOG[0]), false);
  assert.equal(core.buySkin(state, CATALOG, "duck-navy"), state);
  assert.equal(core.canBuy(state, CATALOG[2]), true);
});

test("l'acquisto scala solo il portafoglio del personaggio della skin", () => {
  let state = core.addMoney(funded(500, "duck"), "cat", 40);
  state = core.buySkin(state, CATALOG, "duck-navy");
  assert.equal(core.getBalance(state, "duck"), 300);
  assert.equal(core.getBalance(state, "cat"), 40);
  assert.equal(core.totalBalance(state), 340);
});

test("addMoney accetta solo interi positivi e non muta lo stato", () => {
  const state = core.defaultState();
  for (const bad of [0, -3, NaN, "x", null, undefined]) assert.equal(core.addMoney(state, "duck", bad), state);
  assert.equal(core.addMoney(state, "", 2), state);
  const next = core.addMoney(state, "duck", 2);
  assert.notEqual(next, state);
  assert.equal(core.getBalance(state, "duck"), 0);
  assert.equal(core.getBalance(next, "duck"), 2);
});

test("guadagno per scontro: 1 euro a testa, 2 per uno scarto epico (>= 4) a proprio favore", () => {
  assert.deepEqual(core.exchangePayout(0, true, true), { attacker: 1, defender: 1 });
  assert.deepEqual(core.exchangePayout(3, true, true), { attacker: 1, defender: 1 });
  assert.deepEqual(core.exchangePayout(4, true, true), { attacker: 2, defender: 1 });
  assert.deepEqual(core.exchangePayout(-3, true, true), { attacker: 1, defender: 1 });
  assert.deepEqual(core.exchangePayout(-4, true, true), { attacker: 1, defender: 2 });
  assert.deepEqual(core.exchangePayout(9, true, true), { attacker: 2, defender: 1 });
});

test("gli animali non guadagnano e il massimo per scontro e' 2 euro", () => {
  assert.deepEqual(core.exchangePayout(5, true, false), { attacker: 2, defender: 0 });
  assert.deepEqual(core.exchangePayout(-5, false, true), { attacker: 0, defender: 2 });
  for (let delta = -20; delta <= 20; delta++) {
    const p = core.exchangePayout(delta, true, true);
    assert.ok(p.attacker <= 2 && p.defender <= 2);
  }
});
