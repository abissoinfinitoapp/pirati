const test = require("node:test");
const assert = require("node:assert/strict");
const armi = require("../catalog/fortress-armi.js");
const loot = require("../engine/fortress-loot.js");
const loop = require("../engine/fortress-loop.js");
const arsenal = require("../engine/fortress-arsenal-core.js");

const SPECIAL_40 = [
  ["rocket_hound", "lontano", "areaDamage"],
  ["grenade_bouncer", "medio", "areaDamage"],
  ["titan_slingshot", "lontano", "silent"],
  ["magnetic_harpoon", "medio", "chainStrike"],
  ["reactive_crossbow", "lontano", "ignoreShield", 1],
  ["sonic_cannon", "medio", "suppress"],
  ["industrial_nailer", "medio", "rerollOnes"],
  ["disc_launcher", "medio", "chainStrike"],
  ["junk_cannon", "vicino", "critOnSix"],
  ["plunger_blaster", "medio", "suppress"],
  ["pulse_boomerang", "medio", "chainStrike"],
  ["scrap_launcher", "medio", "areaDamage"],
  ["goo_cannon", "medio", "suppress"],
  ["ball_launcher", "medio", "none"],
  ["tesla_gauntlet", "vicino", "chainStrike"],
  ["magnet_blaster", "medio", "ignoreShield", 1],
  ["spring_launcher", "medio", "critOnSix"],
  ["dual_pulse", "medio", "rerollOnes"],
  ["gravity_cannon", "medio", "suppress"],
  ["fish_launcher", "medio", "critOnSix"],
  ["bee_swarm_launcher", "medio", "chainStrike"],
  ["freeze_ray", "medio", "suppress"],
  ["bubble_bazooka", "medio", "areaDamage"],
  ["barrel_launcher", "medio", "areaDamage"],
  ["vacuum_cannon", "vicino", "suppress"],
  ["meteor_slinger", "lontano", "critOnSix"],
  ["popcorn_blaster", "medio", "areaDamage"],
  ["shock_hammer", "vicino", "chainStrike"],
  ["tornado_blaster", "medio", "suppress"],
  ["rubber_chicken_launcher", "medio", "critOnSix"],
  ["paint_blast", "medio", "suppress"],
  ["pizza_cannon", "medio", "chainStrike"],
  ["rocket_boot_blaster", "medio", "areaDamage"],
  ["snowball_mortar", "lontano", "areaDamage"],
  ["toy_tank_launcher", "medio", "areaDamage"],
  ["banana_boomerang", "medio", "chainStrike"],
  ["magnetic_yoyo", "vicino", "ignoreShield", 1],
  ["lava_sprayer", "vicino", "areaDamage"],
  ["cloud_cannon", "lontano", "chainStrike"],
  ["rocket_umbrella", "medio", "areaDamage"]
];

const byId = (id) => armi.ARMI.find((w) => w.id === id);
const rawById = (id) => armi.ARMI_100.find((w) => w.id === id);

function queueRng(values) {
  const q = values.slice();
  return () => {
    if (!q.length) throw new Error("queueRng: coda esaurita");
    return q.shift();
  };
}

test("le 40 Armi Speciali canoniche esistono tutte una sola volta", () => {
  assert.equal(SPECIAL_40.length, 40);
  assert.equal(new Set(SPECIAL_40.map(([id]) => id)).size, 40);
  SPECIAL_40.forEach(([id]) => assert.ok(byId(id), `arma speciale mancante: ${id}`));
});

test("le 40 Armi Speciali mantengono range e special canonici", () => {
  SPECIAL_40.forEach(([id, range, specialType, n]) => {
    const w = byId(id);
    assert.equal(w.range, range, `${id}: range`);
    assert.equal(w.special.type, specialType, `${id}: special`);
    if (n !== undefined) assert.equal(w.special.n, n, `${id}: special.n`);
  });
});

test("rarità delle 40: 6 Comune, 9 Non comune, 10 Rara, 9 Epica, 6 Leggendaria, nessuna Mitica", () => {
  const counts = {};
  SPECIAL_40.forEach(([id]) => {
    const rarity = byId(id).rarity;
    counts[rarity] = (counts[rarity] || 0) + 1;
  });
  assert.deepEqual(counts, { epica: 9, "non-comune": 9, rara: 10, comune: 6, leggendaria: 6 });
  assert.equal(counts.mitica || 0, 0);
});

test("le 40 non hardcodano campi derivati", () => {
  SPECIAL_40.forEach(([id]) => {
    const w = rawById(id);
    ["power", "specialValue", "potenza", "baseDice", "range"].forEach((field) => {
      assert.equal(field in w, false, `${id}: ${field} non deve essere nel dato grezzo`);
    });
  });
});

test("il Loot può estrarre realmente una delle nuove 40 armi", () => {
  const targetId = "industrial_nailer"; // comune, assalto/standard
  const target = byId(targetId);
  const categories = loot.categoriesForRarity(target.rarity);
  const catIndex = categories.indexOf(target.category);
  assert.ok(catIndex >= 0);
  const candidates = loot.weaponsForRarityAndCategory(target.rarity, target.category);
  const weaponIndex = candidates.findIndex((w) => w.id === targetId);
  assert.ok(weaponIndex >= 0);
  const rng = queueRng([
    0.25, // unica rarità nella tabella custom
    (catIndex + 0.25) / categories.length,
    (weaponIndex + 0.25) / candidates.length
  ]);
  const drawn = loot.drawWeaponId(rng, { [target.rarity]: 1 }, []);
  assert.equal(drawn, targetId);
});

test("una nuova arma può essere raccolta/equipaggiata e registrata nella run", () => {
  const state = loop.createGame({ players: [{ id: "p1", name: "P1" }] });
  state.players[0].zoneId = null;
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  const zone = loop.getZone(state, "e1");
  zone.groundLoot.length = 0;
  zone.groundLoot.push({ kind: "weapon", weaponId: "rocket_hound", instanceId: 999 });
  const w = byId("rocket_hound");
  loop.equipFoundWeapon(state, "p1", "primary", 999, w);
  const p = loop.getPlayer(state, "p1");
  assert.equal(p.equipment.primary.id, "rocket_hound");
  assert.ok(p.collectedWeaponIds.includes("rocket_hound"));
});

test("una nuova arma entra normalmente in discovery e sblocco vittoria dell'Arsenale", () => {
  let state = arsenal.createArsenalState();
  state = arsenal.discoverWeapon(state, "rocket_hound");
  assert.equal(arsenal.getWeaponCollectionStatus(state, "rocket_hound"), "scoperta");
  const eligible = arsenal.getEligibleVictoryUnlocks(
    state,
    ["rocket_hound"],
    [],
    (id) => byId(id).rarity
  );
  assert.deepEqual(eligible, ["rocket_hound"]);
  state = arsenal.unlockWeapon(state, "rocket_hound");
  assert.equal(arsenal.getWeaponCollectionStatus(state, "rocket_hound"), "sbloccata");
});
