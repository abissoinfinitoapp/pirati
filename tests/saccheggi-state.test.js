const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const core = require("../engine/saccheggi-core.js");

const root = path.join(__dirname, "..");

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function runScript(context, relativePath) {
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context, {
    filename: relativePath
  });
}

function appHarness(savedState) {
  const storage = new Map();
  if (savedState !== undefined) storage.set("pirati-master-state-v1", JSON.stringify(savedState));
  const navigated = [];
  const context = vm.createContext({
    console: { log() {}, warn() {}, error() {} },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    },
    document: {
      querySelector(selector) {
        const viewMatch = /^\.nav-item\[data-view="([^"]+)"\]$/.exec(selector);
        if (viewMatch) {
          const view = viewMatch[1];
          if (!["mappa", "quests"].includes(view)) {
            throw new Error(`Destinazione vista non valida: ${view}`);
          }
          return { click() { navigated.push(view); } };
        }
        return null;
      },
      querySelectorAll() { return []; }
    }
  });
  context.window = context;
  context.globalThis = context;
  context.window.PIRATI_ASSET = (assetPath) => assetPath;

  runScript(context, "engine/pirati-core.js");
  runScript(context, "engine/saccheggi-core.js");
  runScript(context, "catalog/premi.js");
  runScript(context, "catalog/saccheggi.js");
  runScript(context, "catalog/poteri.js");

  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8")
    .replace(/\nbindEvents\(\);\r?\nrender\(\);\s*$/, `
globalThis.__raidTest = {
  withDefaults,
  startRaid: typeof startRaid === "function" ? startRaid : undefined,
  chooseRaidShip: typeof chooseRaidShip === "function" ? chooseRaidShip : undefined,
  setRaidRoll: typeof setRaidRoll === "function" ? setRaidRoll : undefined,
  resolveRaidAttempt: typeof resolveRaidAttempt === "function" ? resolveRaidAttempt : undefined,
  closeRaid: typeof closeRaid === "function" ? closeRaid : undefined,
  getState: () => state,
  setState: (nextState) => { state = withDefaults(nextState); }
};`);
  vm.runInContext(appSource, context, { filename: "app.js" });

  return {
    api: context.__raidTest,
    PIRATI: context.PIRATI,
    navigated,
    saved: () => JSON.parse(storage.get("pirati-master-state-v1"))
  };
}

function baseState(overrides = {}) {
  return {
    day: 4,
    fame: 0,
    players: [
      { id: "p1", name: "Lia", characterId: "luna", active: true },
      { id: "p2", name: "Roc", characterId: "rocco", active: true }
    ],
    crew: { coins: 0, loot: [], powers: [], cardUse: {} },
    log: [],
    ...overrides
  };
}

test("il modulo puro migra lo stato raid e assegna le ricompense una volta sola", () => {
  assert.deepEqual(core.withRaidDefaults({}).recentPairIds, []);
  assert.equal(core.withRaidDefaults({ usedDay: 4 }).usedDay, 4);

  const resultState = {
    day: 4,
    fame: 0,
    crew: { coins: 0, loot: [] },
    raid: { rewardsApplied: false }
  };
  const ship = { rewards: [{ type: "coins", amount: 3 }] };

  assert.equal(core.applyRaidRewardsOnce(resultState, ship), true);
  assert.equal(core.applyRaidRewardsOnce(resultState, ship), false);
  assert.equal(resultState.crew.coins, 3);
});

test("una ricompensa sconosciuta viene segnalata e non blocca le altre", () => {
  const problems = [];
  const context = vm.createContext({
    console,
    PIRATI: { _state: { problems }, reward: () => null }
  });
  context.window = context;
  context.globalThis = context;
  runScript(context, "engine/saccheggi-core.js");
  const resultState = {
    day: 4,
    fame: 0,
    crew: { coins: 0, loot: [] },
    raid: { rewardsApplied: false }
  };

  context.PIRATI_SACCH_CORE.applyRaidRewardsOnce(resultState, {
    rewards: [
      { type: "loot", id: "bottino-rimosso" },
      { type: "mistero", amount: 100 },
      { type: "coins", amount: 3 }
    ]
  });

  assert.equal(resultState.crew.coins, 3);
  assert.deepEqual(resultState.crew.loot, []);
  assert.equal(resultState.raid.rewardsApplied, true);
  assert.ok(problems.some(problem => problem.includes("bottino-rimosso")));
  assert.ok(problems.some(problem => problem.includes("mistero")));
});

test("withDefaults aggiunge raid e azzera riferimenti rimossi conservando il giorno consumato", () => {
  const { api } = appHarness();

  assert.deepEqual(plain(api.withDefaults({}).raid), core.withRaidDefaults({}));
  const migrated = api.withDefaults(baseState({
    raid: {
      usedDay: 4,
      pairId: "coppia-rimossa",
      shipId: "nave-rimossa",
      phase: "roll",
      rolls: { p1: 6 },
      recentPairIds: "malformati",
      returnTo: "story",
      rewardsApplied: false
    }
  }));

  assert.equal(migrated.raid.usedDay, 4);
  assert.equal(migrated.raid.phase, "idle");
  assert.equal(migrated.raid.pairId, null);
  assert.equal(migrated.raid.shipId, null);
  assert.deepEqual(plain(migrated.raid.rolls), {});
  assert.deepEqual(plain(migrated.raid.recentPairIds), []);
});

test("withDefaults azzera combinazioni phase-attempt-premio incoerenti senza riaprire il giorno consumato", () => {
  const { api } = appHarness();
  const invalidRaids = [
    { usedDay: null, pairId: "dolce-freddo", shipId: null, attempt: 0, phase: "choice", rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 1, phase: "retry-choice", rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 3, phase: "roll", rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 1, phase: "roll", rewardsApplied: true },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 1, phase: "choice", outcome: null, rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 1, phase: "roll", outcome: { success: false }, rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 2, phase: "retry-choice", outcome: null, rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 2, phase: "result", outcome: null, rewardsApplied: false },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 1, phase: "result", outcome: { success: false }, rewardsApplied: true },
    { usedDay: 4, pairId: "dolce-freddo", shipId: "nave-gelato", attempt: 1, phase: "result", outcome: { success: true }, rewardsApplied: false }
  ];

  invalidRaids.forEach((raid, index) => {
    const migrated = api.withDefaults(baseState({ raid }));
    assert.equal(migrated.raid.phase, "idle", `fixture ${index + 1}`);
    assert.equal(migrated.raid.attempt, 1, `fixture ${index + 1}`);
    assert.equal(migrated.raid.usedDay, raid.shipId ? 4 : null, `fixture ${index + 1}`);
  });

  const retryRoll = api.withDefaults(baseState({
    raid: {
      usedDay: 4,
      pairId: "dolce-freddo",
      shipId: "nave-gelato",
      attempt: 2,
      phase: "roll",
      rewardsApplied: false
    }
  }));
  assert.equal(retryRoll.raid.phase, "roll");
  assert.equal(retryRoll.raid.attempt, 2);
});

test("startRaid salva la coppia e chooseRaidShip consuma subito il tentativo giornaliero", () => {
  const { api, saved } = appHarness();
  assert.equal(typeof api.startRaid, "function");
  api.setState(baseState());

  api.startRaid("dolce-freddo", "story");
  assert.equal(api.getState().raid.phase, "choice");
  assert.equal(api.getState().raid.pairId, "dolce-freddo");
  assert.deepEqual(plain(api.getState().raid.recentPairIds), ["dolce-freddo"]);
  assert.equal(api.getState().raid.returnTo, "story");
  assert.equal(saved().raid.pairId, "dolce-freddo");

  api.chooseRaidShip("nave-non-della-coppia");
  assert.equal(api.getState().raid.phase, "choice");
  api.chooseRaidShip("nave-gelato");
  assert.equal(api.getState().raid.usedDay, 4);
  assert.equal(api.getState().raid.phase, "roll");
  assert.equal(api.getState().raid.shipId, "nave-gelato");
  assert.deepEqual(plain(api.getState().raid.rolls), {});
  assert.equal(saved().raid.usedDay, 4);
});

test("un successo assegna il premio e scrive il Diario una sola volta", () => {
  const { api, PIRATI } = appHarness();
  const expectedCoins = PIRATI.raidPair("dolce-freddo").ships
    .find(s => s.id === "nave-gelato").rewards.find(r => r.type === "coins").amount;
  api.setState(baseState({
    raid: {
      usedDay: 4,
      pairId: "dolce-freddo",
      shipId: "nave-gelato",
      attempt: 1,
      phase: "roll",
      rolls: {},
      outcome: null,
      recentPairIds: ["dolce-freddo"],
      returnTo: "map",
      rewardsApplied: false
    }
  }));

  api.setRaidRoll("p1", 6);
  api.setRaidRoll("p2", 6);
  api.resolveRaidAttempt();
  const first = plain(api.getState());

  assert.equal(first.raid.phase, "result");
  assert.equal(first.raid.outcome.success, true);
  assert.equal(first.crew.coins, expectedCoins);
  assert.equal(first.log.length, 1);

  api.resolveRaidAttempt();
  assert.equal(api.getState().crew.coins, expectedCoins);
  assert.equal(api.getState().log.length, 1);
});

test("la risoluzione usa una sola volta soltanto le carte bonus possedute e valide", () => {
  const { api } = appHarness();
  api.setState(baseState({
    crew: {
      grade: 1,
      coins: 0,
      loot: [],
      powers: [{ id: "fionda-parole" }, { id: "palafitta-pieghevole" }],
      cardUse: {}
    },
    raid: {
      usedDay: 4,
      pairId: "dolce-freddo",
      shipId: "nave-zucchero-filato",
      attempt: 1,
      phase: "roll",
      rolls: { p1: 2, p2: 2 },
      outcome: null,
      recentPairIds: ["dolce-freddo"],
      returnTo: "map",
      rewardsApplied: false,
      cardBonuses: [
        { id: "fionda-parole", amount: 99 },
        { id: "fionda-parole", amount: 99 },
        { id: "tamburo-marea", amount: 99 },
        { id: "palafitta-pieghevole", amount: 99 },
        { id: "carta-rimossa", amount: 99 }
      ]
    }
  }));

  api.resolveRaidAttempt();

  assert.equal(api.getState().raid.outcome.average, 6);
  assert.equal(api.getState().raid.outcome.success, true);
  assert.equal(api.getState().crew.cardUse["fionda-parole"], "d4");
  assert.equal(api.getState().crew.cardUse["tamburo-marea"], undefined);
  assert.equal(api.getState().crew.cardUse["palafitta-pieghevole"], undefined);
});

test("il primo fallimento offre il retry e il secondo chiude senza premio", () => {
  const { api } = appHarness();
  api.setState(baseState());
  api.startRaid("dolce-freddo", "map");
  api.chooseRaidShip("nave-zucchero-filato");

  api.setRaidRoll("p1", 1);
  api.setRaidRoll("p2", 1);
  api.resolveRaidAttempt();
  assert.equal(api.getState().raid.phase, "retry-choice");
  assert.equal(api.getState().raid.attempt, 2);
  assert.equal(api.getState().raid.outcome.success, false);
  assert.deepEqual(plain(api.getState().raid.rolls), {});
  assert.equal(api.getState().log.length, 0);

  api.getState().day = 5;
  api.chooseRaidShip("nave-gelato");
  assert.equal(api.getState().raid.usedDay, 4);
  assert.equal(api.getState().raid.attempt, 2);
  api.setRaidRoll("p1", 1);
  api.setRaidRoll("p2", 1);
  api.resolveRaidAttempt();
  assert.equal(api.getState().raid.phase, "result");
  assert.equal(api.getState().raid.outcome.success, false);
  assert.equal(api.getState().crew.coins, 0);
  assert.equal(api.getState().fame, 0);
  assert.deepEqual(plain(api.getState().crew.loot), []);
  assert.equal(api.getState().log.length, 1);
});

test("resolveRaidAttempt non duplica il Diario quando il premio risulta già applicato", () => {
  const { api } = appHarness();
  api.setState(baseState({
    crew: { coins: 3, loot: [], powers: [], cardUse: {} },
    raid: {
      usedDay: 4,
      pairId: "dolce-freddo",
      shipId: "nave-gelato",
      attempt: 1,
      phase: "roll",
      rolls: { p1: 6, p2: 6 },
      outcome: null,
      recentPairIds: ["dolce-freddo"],
      returnTo: "map",
      rewardsApplied: false
    }
  }));
  api.getState().raid.rewardsApplied = true;

  api.resolveRaidAttempt();

  assert.equal(api.getState().crew.coins, 3);
  assert.equal(api.getState().log.length, 0);
});

test("closeRaid pulisce solo il flusso transitorio e torna alla vista chiamante", () => {
  const { api, navigated, saved } = appHarness();
  api.setState(baseState({
    raid: {
      usedDay: 4,
      pairId: "dolce-freddo",
      shipId: "nave-gelato",
      attempt: 1,
      phase: "result",
      rolls: { p1: 6, p2: 6 },
      outcome: { success: true },
      recentPairIds: ["dolce-freddo"],
      returnTo: "story",
      rewardsApplied: true
    }
  }));

  api.closeRaid();

  assert.deepEqual(plain(api.getState().raid), {
    usedDay: 4,
    pairId: null,
    shipId: null,
    attempt: 1,
    phase: "idle",
    rolls: {},
    outcome: null,
    recentPairIds: ["dolce-freddo"],
    returnTo: "map",
    rewardsApplied: false
  });
  assert.deepEqual(navigated, ["quests"]);
  assert.equal(saved().raid.usedDay, 4);
});

test("le destinazioni importate sono normalizzate e non raggiungono mai il selettore DOM", () => {
  const { api, navigated } = appHarness();
  api.setState(baseState({
    raid: {
      usedDay: 4,
      pairId: "dolce-freddo",
      shipId: "nave-gelato",
      attempt: 1,
      phase: "result",
      rolls: { p1: 6, p2: 6 },
      outcome: { success: true },
      recentPairIds: ["dolce-freddo"],
      returnTo: 'quests"] *',
      rewardsApplied: true
    }
  }));
  assert.equal(api.getState().raid.returnTo, "map");

  assert.doesNotThrow(() => api.closeRaid());
  assert.deepEqual(navigated, ["mappa"]);
});
