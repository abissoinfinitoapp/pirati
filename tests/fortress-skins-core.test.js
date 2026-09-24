const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/fortress-skins-core.js");

const CATALOG = [
  { id: "duck-navy", characterId: "duck", name: "Duck Navy", rarity: "rara", price: 700, image: "duck-navy.webp", assetReady: true },
  { id: "duck-golden", characterId: "duck", name: "Duck Golden", rarity: "leggendaria", price: 2500, image: "duck-golden.webp", assetReady: false },
  { id: "cat-jungle", characterId: "cat", name: "Cat Jungle", rarity: "non-comune", price: 300, image: "cat-jungle.webp", assetReady: true }
];

const CHARACTERS = [
  { id: "duck", name: "Duck", image: "duck-base.webp" },
  { id: "cat", name: "Cat", image: "cat-base.webp" }
];

test("defaultState non ha nessun campo di combattimento", () => {
  assert.deepEqual(Object.keys(core.defaultState()).sort(), ["equippedByCharacter", "money", "ownedSkinIds"]);
});

test("nessuna skin è mai posseduta di default: la Base non appartiene all'ownership", () => {
  const state = core.defaultState();
  assert.equal(core.ownsSkin(state, CATALOG[0]), false);
  assert.equal(core.canEquip(state, CATALOG[0]), false);
});

test("acquisto: skin non posseduta -> posseduta, monete scalate", () => {
  let state = Object.assign(core.defaultState(), { money: 1000 });
  assert.equal(core.ownsSkin(state, CATALOG[0]), false);
  state = core.buySkin(state, CATALOG, "duck-navy");
  assert.equal(state.money, 300);
  assert.equal(core.ownsSkin(state, CATALOG[0]), true);
});

test("acquisto rifiutato se non bastano le monete: stato invariato", () => {
  const state = Object.assign(core.defaultState(), { money: 100 });
  const after = core.buySkin(state, CATALOG, "duck-navy");
  assert.equal(after, state);
  assert.equal(core.ownsSkin(after, CATALOG[0]), false);
});

test("skin con assetReady false non è mai acquistabile né equipaggiabile", () => {
  let state = Object.assign(core.defaultState(), { money: 999999, ownedSkinIds: ["duck-golden"] });
  assert.equal(core.canBuy(state, CATALOG[1]), false);
  assert.equal(core.canEquip(state, CATALOG[1]), false);
  const after = core.equipSkin(state, CATALOG, "duck-golden");
  assert.equal(core.getEquippedSkinId(after, "duck"), null);
});

test("equip: una sola skin equipaggiata per personaggio, cambia l'immagine", () => {
  let state = Object.assign(core.defaultState(), { money: 1000 });
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
  assert.equal(core.getEquippedSkinId(state, "duck"), "duck-navy");
  assert.equal(core.getCharacterDisplayImage(state, CATALOG, CHARACTERS, "duck"), "duck-navy.webp");
});

test("equip di un personaggio non tocca l'equip di un altro personaggio", () => {
  let state = Object.assign(core.defaultState(), { money: 1000 });
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
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
  let state = Object.assign(core.defaultState(), { money: 1000 });
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
  let state = Object.assign(core.defaultState(), { money: 1000, someUnrelatedField: "invariato" });
  state = core.buySkin(state, CATALOG, "duck-navy");
  state = core.equipSkin(state, CATALOG, "duck-navy");
  state = core.unequipSkin(state, "duck");
  assert.equal(state.someUnrelatedField, "invariato");
});
