const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/saccheggi-core.js");

test("un tentativo consumato resta indisponibile soltanto nello stesso giorno", () => {
  assert.equal(core.dayAvailable({ usedDay: 8 }, 8), false);
  assert.equal(core.dayAvailable({ usedDay: 8 }, 9), true);
});

test("pickPair esclude le ultime quattro coppie quando restano alternative", () => {
  const pairs = ["a", "b", "c", "d", "e", "f"].map(id => ({ id }));
  assert.equal(core.pickPair(pairs, ["a", "b", "c", "d"], () => 0).id, "e");
});

test("scoreRolls somma statistiche e bonus di squadra", () => {
  const players = [
    { id: "p1", stats: { astuzia: 3 } },
    { id: "p2", stats: { astuzia: 1 } }
  ];
  const score = core.scoreRolls(players, { p1: 4, p2: 6 }, "astuzia", 1);
  assert.deepEqual(score.entries.map(x => x.total), [7, 7]);
  assert.equal(score.average, 8);
});

test("il primo fallimento porta alla seconda scelta, il secondo chiude", () => {
  assert.deepEqual(core.resolveAttempt(5.9, 6, 1), { success: false, nextPhase: "retry-choice" });
  assert.deepEqual(core.resolveAttempt(5.9, 6, 2), { success: false, nextPhase: "result" });
  assert.deepEqual(core.resolveAttempt(6, 6, 2), { success: true, nextPhase: "result" });
});

test("withRaidDefaults inizializza lo stato e conserva valori validi", () => {
  assert.deepEqual(core.withRaidDefaults({}), {
    usedDay: null,
    pairId: null,
    shipId: null,
    attempt: 1,
    phase: "idle",
    rolls: {},
    outcome: null,
    recentPairIds: [],
    returnTo: "map",
    rewardsApplied: false
  });
  assert.deepEqual(core.withRaidDefaults({ usedDay: 4, recentPairIds: ["p1"], rolls: { p1: 5 } }), {
    usedDay: 4,
    pairId: null,
    shipId: null,
    attempt: 1,
    phase: "idle",
    rolls: { p1: 5 },
    outcome: null,
    recentPairIds: ["p1"],
    returnTo: "map",
    rewardsApplied: false
  });
});

test("applyRaidRewardsOnce assegna ricompense una sola volta", () => {
  const state = {
    day: 3,
    fame: 2,
    crew: { coins: 1, fame: 99, loot: [] },
    raid: { rewardsApplied: false }
  };
  const ship = {
    id: "nave-gelato",
    rewards: [
      { type: "coins", amount: 3 },
      { type: "fame", amount: 2 },
      { type: "loot", id: "gelato" }
    ]
  };

  assert.equal(core.applyRaidRewardsOnce(state, ship), true);
  assert.equal(state.crew.coins, 4);
  assert.equal(state.fame, 4);
  assert.deepEqual(state.crew.loot, [{ id: "gelato", questId: null, day: 3 }]);
  assert.equal(state.raid.rewardsApplied, true);
  assert.equal(core.applyRaidRewardsOnce(state, ship), false);
  assert.equal(state.crew.coins, 4);
  assert.equal(state.fame, 4);
  assert.deepEqual(state.crew.loot, [{ id: "gelato", questId: null, day: 3 }]);
});
