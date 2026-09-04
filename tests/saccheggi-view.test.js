const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/saccheggi-core.js");

const pair = {
  id: "dolce-freddo",
  ships: [
    {
      id: "nave-gelato",
      name: "La Gelatiera del Mare",
      image: "assets/saccheggi/nave-gelato.webp",
      stat: "coraggio",
      target: 5,
      rewards: [{ type: "coins", amount: 3 }],
      fail: "Beffa gelata.",
      missed: "Tre monete perdute."
    },
    {
      id: "nave-zucchero-filato",
      name: "La Nuvola Zuccherina",
      image: "assets/saccheggi/nave-zucchero-filato.webp",
      stat: "astuzia",
      target: 6,
      rewards: [{ type: "coins", amount: 4 }],
      fail: "Beffa appiccicosa.",
      missed: "Quattro monete perdute."
    }
  ]
};

const players = [
  { id: "p1", name: "Lia", characterName: "Luna", active: true, statValue: 3 },
  { id: "p2", name: "Roc", characterName: "Rocco", active: true, statValue: 1 }
];

function view(raid, overrides = {}) {
  return core.raidViewModel({
    raid,
    day: 4,
    players,
    pair,
    fallbackImage: "assets/sfondi/logo.webp",
    ...overrides
  });
}

test("l'ingresso distingue saccheggio disponibile, in corso e concluso", () => {
  assert.deepEqual(view({ phase: "idle", usedDay: null }).entry, {
    kind: "available",
    label: "🏴‍☠️ Navi all'orizzonte!",
    disabled: false
  });
  assert.deepEqual(view({ phase: "choice", usedDay: null }).entry, {
    kind: "in-progress",
    label: "Riprendi il saccheggio",
    disabled: false
  });
  assert.deepEqual(view({ phase: "idle", usedDay: 4 }).entry, {
    kind: "used",
    label: "Il saccheggio di oggi è concluso",
    disabled: true
  });
  assert.equal(view({ phase: "idle", usedDay: null }, { players: [] }).entry.disabled, true);
  assert.equal(view({ phase: "idle", usedDay: null }).lockNavigation, false);
  assert.equal(view({ phase: "roll", usedDay: 4, shipId: "nave-gelato", rolls: {} }).lockNavigation, true);
});

test("la prima scelta nasconde entrambi i premi e prepara un fallback per ogni immagine", () => {
  const model = view({ phase: "choice", usedDay: null, shipId: null, rolls: {} });

  assert.deepEqual(model.ships.map(ship => ({
    id: ship.id,
    rewardVisible: ship.rewardVisible,
    fallbackImage: ship.fallbackImage
  })), [
    { id: "nave-gelato", rewardVisible: false, fallbackImage: "assets/sfondi/logo.webp" },
    { id: "nave-zucchero-filato", rewardVisible: false, fallbackImage: "assets/sfondi/logo.webp" }
  ]);
});

test("il retry rivela solo l'alternativa e distingue stessa nave da altra nave", () => {
  const model = view({
    phase: "retry-choice",
    usedDay: 4,
    shipId: "nave-gelato",
    attempt: 2,
    rolls: {},
    outcome: { success: false }
  });

  assert.equal(model.heading, "Secondo e ultimo tentativo");
  assert.deepEqual(model.reveals, [
    { kind: "fail", shipId: "nave-gelato", text: "Beffa gelata." },
    { kind: "missed", shipId: "nave-zucchero-filato", text: "Quattro monete perdute." }
  ]);
  assert.deepEqual(model.ships.map(ship => ({
    id: ship.id,
    rewardVisible: ship.rewardVisible,
    retryAction: ship.retryAction
  })), [
    { id: "nave-gelato", rewardVisible: false, retryAction: "same" },
    { id: "nave-zucchero-filato", rewardVisible: true, retryAction: "other" }
  ]);
});

test("la risoluzione resta disabilitata finché manca anche un solo tiro valido", () => {
  assert.equal(view({
    phase: "roll",
    usedDay: 4,
    shipId: "nave-gelato",
    attempt: 1,
    rolls: { p1: 6 }
  }).canResolve, false);

  assert.equal(view({
    phase: "roll",
    usedDay: 4,
    shipId: "nave-gelato",
    attempt: 1,
    rolls: { p1: 6, p2: 4 }
  }).canResolve, true);

  assert.equal(view({
    phase: "roll",
    usedDay: 4,
    shipId: "nave-gelato",
    attempt: 1,
    rolls: { p1: 6, p2: 9 }
  }).canResolve, false);
});
