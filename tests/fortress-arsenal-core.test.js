const test = require("node:test");
const assert = require("node:assert/strict");
const arsenal = require("../engine/fortress-arsenal-core.js");

test("stato iniziale: nessuna arma scoperta né sbloccata", () => {
  const state = arsenal.createArsenalState();
  assert.deepEqual(state.discoveredWeaponIds, []);
  assert.deepEqual(state.unlockedWeaponIds, []);
  assert.equal(arsenal.getWeaponCollectionStatus(state, "assault_base"), "sconosciuta");
});

test("discoverWeapon: sconosciuta -> scoperta, idempotente", () => {
  let state = arsenal.createArsenalState();
  state = arsenal.discoverWeapon(state, "assault_redeye");
  assert.equal(arsenal.getWeaponCollectionStatus(state, "assault_redeye"), "scoperta");
  const again = arsenal.discoverWeapon(state, "assault_redeye");
  assert.equal(again, state, "riscoprire la stessa arma non cambia nulla");
});

test("unlockWeapon: scoperta -> sbloccata; sbloccata implica sempre anche scoperta", () => {
  let state = arsenal.createArsenalState();
  state = arsenal.discoverWeapon(state, "assault_redeye");
  state = arsenal.unlockWeapon(state, "assault_redeye");
  assert.equal(arsenal.getWeaponCollectionStatus(state, "assault_redeye"), "sbloccata");
  assert.ok(state.discoveredWeaponIds.includes("assault_redeye"));
});

test("unlockWeapon senza discovery precedente registra comunque entrambe", () => {
  let state = arsenal.createArsenalState();
  state = arsenal.unlockWeapon(state, "melee_endless");
  assert.equal(arsenal.getWeaponCollectionStatus(state, "melee_endless"), "sbloccata");
  assert.ok(state.discoveredWeaponIds.includes("melee_endless"));
});

test("getArsenalStats: 'scoperte' include anche le già sbloccate", () => {
  let state = arsenal.createArsenalState();
  state = arsenal.discoverWeapon(state, "a");
  state = arsenal.discoverWeapon(state, "b");
  state = arsenal.unlockWeapon(state, "b");
  const stats = arsenal.getArsenalStats(state, 100);
  assert.equal(stats.discovered, 2, "b è scoperta E sbloccata: conta una volta sola in 'scoperte'");
  assert.equal(stats.unlocked, 1);
  assert.equal(stats.total, 100);
});

test("getArsenalStats: sblocco senza discovery preventiva è comunque conteggiato tra le scoperte", () => {
  let state = arsenal.createArsenalState();
  state = arsenal.unlockWeapon(state, "c");
  const stats = arsenal.getArsenalStats(state, 100);
  assert.equal(stats.discovered, 1);
  assert.equal(stats.unlocked, 1);
});

/* ---- eleggibilità sblocco a vittoria ---- */

const rarityById = (id) => ({ mitica_equip: "mitica", mitica_persa: "mitica", rara_normale: "rara" }[id] || "comune");

test("eleggibili: raccolte in questa run, escluse le già sbloccate", () => {
  const state = arsenal.createArsenalState();
  const collected = ["rara_normale", "gia_sbloccata"];
  const withUnlock = arsenal.unlockWeapon(state, "gia_sbloccata");
  const eligible = arsenal.getEligibleVictoryUnlocks(withUnlock, collected, [], rarityById);
  assert.deepEqual(eligible, ["rara_normale"]);
});

test("la starter non è mai eleggibile perché non entra mai in collectedWeaponIds", () => {
  const state = arsenal.createArsenalState();
  const collected = ["rara_normale"]; // niente "assault_base": il loop non lo aggiunge mai
  const eligible = arsenal.getEligibleVictoryUnlocks(state, collected, [], rarityById);
  assert.ok(!eligible.includes("assault_base"));
});

test("Mitica raccolta ma NON equipaggiata a vittoria: non eleggibile", () => {
  const state = arsenal.createArsenalState();
  const collected = ["mitica_persa"];
  const equippedAtVictory = []; // l'ha lasciata/sostituita prima della vittoria
  const eligible = arsenal.getEligibleVictoryUnlocks(state, collected, equippedAtVictory, rarityById);
  assert.deepEqual(eligible, []);
});

test("Mitica ancora equipaggiata a vittoria: eleggibile", () => {
  const state = arsenal.createArsenalState();
  const collected = ["mitica_equip"];
  const equippedAtVictory = ["mitica_equip"];
  const eligible = arsenal.getEligibleVictoryUnlocks(state, collected, equippedAtVictory, rarityById);
  assert.deepEqual(eligible, ["mitica_equip"]);
});

test("nessuna arma collezionata eleggibile -> nessuna ricompensa", () => {
  const state = arsenal.createArsenalState();
  const eligible = arsenal.getEligibleVictoryUnlocks(state, [], [], rarityById);
  assert.deepEqual(eligible, []);
});
