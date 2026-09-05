const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

function loadCatalog() {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;

  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/saccheggi.js"), "utf8"), context, { filename: "catalog/saccheggi.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/premi.js"), "utf8"), context, { filename: "catalog/premi.js" });
  return context.window.PIRATI;
}

function storyAppHarness() {
  const storage = new Map();
  const navigated = [];
  const elements = new Map();
  const element = (selector) => {
    if (!elements.has(selector)) {
      elements.set(selector, {
        innerHTML: "",
        textContent: "",
        disabled: false,
        classList: { contains() { return false; }, toggle() {}, add() {}, remove() {} },
        scrollIntoView() {},
        setAttribute() {},
        click() {}
      });
    }
    return elements.get(selector);
  };
  const context = vm.createContext({
    console: { log() {}, warn() {}, error() {} },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    },
    document: {
      querySelector(selector) {
        const viewMatch = /^\.nav-item\[data-view="([^"]+)"\]$/.exec(selector);
        if (viewMatch) return { click() { navigated.push(viewMatch[1]); } };
        return element(selector);
      },
      querySelectorAll() { return []; }
    }
  });
  context.window = context;
  context.globalThis = context;
  context.window.PIRATI_ASSET = (assetPath) => assetPath;

  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "engine/saccheggi-core.js"), "utf8"), context, { filename: "engine/saccheggi-core.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "engine/belarda-core.js"), "utf8"), context, { filename: "engine/belarda-core.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "engine/domandona-core.js"), "utf8"), context, { filename: "engine/domandona-core.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "engine/negozio-core.js"), "utf8"), context, { filename: "engine/negozio-core.js" });
  context.PIRATI = context.window.PIRATI;
  for (const relativePath of ["catalog/premi.js", "catalog/saccheggi.js", "catalog/poteri.js", "catalog/belarda.js", "catalog/domandona.js", "catalog/negozio.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context, { filename: relativePath });
  }
  vm.runInContext(`PIRATI.registerPack({
    id: "pack-story-raid",
    name: "Fixture StoryFlow raid",
    islands: [{ id: "isola-story-raid", name: "Isola StoryFlow" }],
    quests: [{
      id: "quest-story-raid",
      island: "isola-story-raid",
      title: "Avventura con saccheggio",
      readAloud: "Una vela appare.",
      readKids: { facile: ["Eccola!"], avanzato: ["Una vela all'orizzonte!"] },
      beats: ["Avvistamento"],
      choices: [{ label: "Avanti", stat: "coraggio", target: 6 }],
      rewards: [{ type: "coins", amount: 1 }],
      storyFlow: {
        start: "apertura",
        progression: [
          { scene_id: "apertura", scene: { read: "Guardate il mare." }, outcome: { title: "Vele", text: "Arrivano.", next: "navi-dolci" } },
          { id: "navi-dolci", type: "raid", pairId: "dolce-freddo", skippedText: "Le vele sono ormai lontane." },
          { scene_id: "finale", scene: { read: "Riprendete la rotta." }, completion: { action_label: "Concludi" } }
        ]
      }
    }]
  });`, context);

  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8")
    .replace(/\nbindEvents\(\);\r?\nrender\(\);\s*$/, `
globalThis.__storyRaidTest = {
  storyPhaseMarkup: typeof storyPhaseMarkup === "function" ? storyPhaseMarkup : undefined,
  startStoryRaid: typeof startStoryRaid === "function" ? startStoryRaid : undefined,
  advanceStoryRaid: typeof advanceStoryRaid === "function" ? advanceStoryRaid : undefined,
  closeRaid: typeof closeRaid === "function" ? closeRaid : undefined,
  getState: () => state,
  setState: (nextState) => { state = withDefaults(nextState); }
};`);
  vm.runInContext(appSource, context, { filename: "app.js" });
  return { api: context.__storyRaidTest, navigated, PIRATI: context.PIRATI };
}

function storyRaidState(overrides = {}) {
  return {
    day: 4,
    players: [],
    crew: { coins: 0, loot: [], powers: [], cardUse: {} },
    questCampaign: {
      selectedPackId: "pack-story-raid",
      selectedIslandId: "isola-story-raid",
      revealedQuestId: "quest-story-raid",
      completedQuestIds: [],
      story: {
        questId: "quest-story-raid",
        sceneId: "navi-dolci",
        phase: "SCENE",
        step: 2,
        notes: {}, choices: {}, destiny: {}, rolls: {}, resolved: {}, cards: {},
        completionSnapshot: null
      }
    },
    ...overrides
  };
}

test("registra dodici coppie di saccheggio curate e complete", () => {
  const PIRATI = loadCatalog();

  assert.equal(PIRATI.raidPairs.length, 12);
  assert.equal(PIRATI.raidPairs.flatMap(pair => pair.ships).length, 24);
  assert.deepEqual(Array.from(PIRATI.raidPairs, pair => pair.id), [
    "dolce-freddo", "salti-morbidi", "merenda-mare", "giocattoli-scomposti",
    "festa-impossibile", "piedi-in-fuga", "dolci-giganti", "ciurme-tenere",
    "storie-colorate", "cielo-da-gioco", "esperimenti-molli", "guardaroba-regale"
  ]);
  assert.deepEqual(Array.from(PIRATI.raidPairs, pair => `${pair.id}:${Array.from(pair.ships, ship => ship.id).join("/")}`), [
    "dolce-freddo:nave-gelato/nave-zucchero-filato",
    "salti-morbidi:galeone-cuscini/brigantino-trampolini",
    "merenda-mare:nave-patatine/veliero-cioccolata-calda",
    "giocattoli-scomposti:caravella-dinosauri/nave-robot-svitati",
    "festa-impossibile:vascello-bolle/galeone-fuochi-silenziosi",
    "piedi-in-fuga:nave-calzini-spaiati/veliero-scarpe-saltellanti",
    "dolci-giganti:galeone-torte/nave-caramelle-mutacolore",
    "ciurme-tenere:nave-pappagalli-cantanti/caravella-cuccioli-pirata",
    "storie-colorate:vascello-pennarelli-magici/nave-libri-parlanti",
    "cielo-da-gioco:galeone-palloni-infiniti/nave-aquiloni-cavalcabili",
    "esperimenti-molli:nave-mostri-gelatina/vascello-pozioni-ruttanti",
    "guardaroba-regale:caravella-corone-assurde/nave-mantelli-meta-invisibili"
  ]);
  assert.equal(new Set(PIRATI.raidPairs.map(pair => pair.id)).size, 12);
  assert.equal(new Set(PIRATI.raidPairs.flatMap(pair => pair.ships.map(ship => ship.id))).size, 24);
  assert.ok(PIRATI.raidPairs.every(pair => pair.ships.length === 2));
  assert.equal(PIRATI.raidPair("dolce-freddo").ships[0].image, "assets/saccheggi/nave-gelato.webp");
  assert.equal(PIRATI.raidPair("coppia-sconosciuta"), null);
  assert.ok(PIRATI.raidPairs.flatMap(pair => pair.ships).every(ship =>
    ["coraggio", "astuzia", "fortuna"].includes(ship.stat) &&
    [5, 6, 7].includes(ship.target) &&
    ship.image.endsWith(".webp") &&
    ship.sighting && ship.success && ship.fail && ship.missed &&
    Array.isArray(ship.rewards) && ship.rewards.length
  ));
  assert.deepEqual(Array.from(PIRATI.problems.filter(p => p.includes("saccheggio"))), []);

  const ships = Array.from(PIRATI.raidPairs).flatMap(pair => Array.from(pair.ships));
  assert.deepEqual(ships.reduce((counts, ship) => ({ ...counts, [ship.stat]: counts[ship.stat] + 1 }), { coraggio: 0, astuzia: 0, fortuna: 0 }), {
    coraggio: 8,
    astuzia: 8,
    fortuna: 8
  });
  assert.deepEqual(ships.reduce((counts, ship) => ({ ...counts, [ship.target]: counts[ship.target] + 1 }), { 5: 0, 6: 0, 7: 0 }), {
    5: 4,
    6: 16,
    7: 4
  });
  assert.equal(ships.filter(ship => ship.rewards.some(reward => reward.type === "fame")).length, 4);
  assert.equal(ships.filter(ship => ship.rewards.some(reward => reward.type === "loot")).length, 6);
  // ogni nave da' comunque un carico di monete: un galeone non si saccheggia per spiccioli
  assert.ok(ships.every(ship => ship.rewards.some(reward => reward.type === "coins")));
  assert.ok(ships.flatMap(ship => ship.rewards).every(reward => {
    if (reward.type === "coins") return Number.isInteger(reward.amount) && reward.amount >= 100000 && reward.amount <= 5000000;
    if (reward.type === "fame") return reward.amount === 1;
    return reward.type === "loot" && typeof reward.id === "string" && reward.id;
  }));
  for (const reward of PIRATI.raidPairs.flatMap(pair => pair.ships).flatMap(ship => ship.rewards)) {
    assert.ok(["coins", "fame", "loot"].includes(reward.type));
    if (reward.type === "loot") assert.ok(PIRATI.reward(reward.id), `premio mancante: ${reward.id}`);
  }
});

test("rifiuta le coppie di saccheggio con struttura o ricompense non valide", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  const PIRATI = context.window.PIRATI;

  PIRATI.registerRaidPairs([
    { id: "solo", ships: [{ id: "nave-sola" }] },
    {
      id: "malformata",
      ships: [
        { id: "nave-rotta", name: "", sighting: "", stat: "forza", target: 4, rewards: [{ type: "gemme" }], success: "", fail: "", missed: "" },
        { id: "nave-seconda", name: "Seconda", sighting: "Vista", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: "tre" }], success: "Fatto", fail: "No", missed: "Perso" }
      ]
    }
  ]);

  assert.equal(PIRATI.raidPairs.length, 0);
  assert.ok(PIRATI.problems.some(problem => problem.includes("saccheggio")));
});

test("rifiuta gli ID duplicati di coppie e navi", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  const PIRATI = context.window.PIRATI;
  const pair = {
    id: "unica",
    ships: [
      { id: "nave-uno", name: "Uno", sighting: "Forse una nuvola.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 2 }], success: "Presa.", fail: "Beffa.", missed: "Perse 2 monete." },
      { id: "nave-due", name: "Due", sighting: "Forse una balena.", stat: "fortuna", target: 6, rewards: [{ type: "fame", amount: 1 }], success: "Presa.", fail: "Beffa.", missed: "Perso 1 punto Fama." }
    ]
  };

  PIRATI.registerRaidPairs([pair, pair]);

  assert.equal(PIRATI.raidPairs.length, 1);
  assert.ok(PIRATI.problems.some(problem => problem.includes("coppia duplicata")));
});

test("rifiuta una coppia distinta che riusa un ID nave già registrato", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  const PIRATI = context.window.PIRATI;

  PIRATI.registerRaidPairs([
    {
      id: "prima",
      ships: [
        { id: "nave-condivisa", name: "Condivisa", sighting: "Forse una nuvola.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 2 }], success: "Presa.", fail: "Beffa.", missed: "Perse 2 monete." },
        { id: "nave-prima", name: "Prima", sighting: "Forse una balena.", stat: "fortuna", target: 6, rewards: [{ type: "fame", amount: 1 }], success: "Presa.", fail: "Beffa.", missed: "Perso 1 punto Fama." }
      ]
    }
  ]);
  PIRATI.registerRaidPairs([
    {
      id: "seconda",
      ships: [
        { id: "nave-condivisa", name: "Condivisa", sighting: "Forse una nuvola.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 2 }], success: "Presa.", fail: "Beffa.", missed: "Perse 2 monete." },
        { id: "nave-seconda", name: "Seconda", sighting: "Forse un gabbiano.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 3 }], success: "Presa.", fail: "Beffa.", missed: "Perse 3 monete." }
      ]
    }
  ]);

  assert.equal(PIRATI.raidPairs.length, 1);
  assert.equal(PIRATI.raidPair("seconda"), null);
  assert.ok(PIRATI.problems.some(problem => problem.includes('saccheggio "seconda": nave duplicata')));
});

test("valida i riferimenti alle coppie negli step raid dello StoryFlow", () => {
  const PIRATI = loadCatalog();
  const storyPack = (packId, questId, pairId) => ({
    id: packId,
    name: "Fixture StoryFlow",
    islands: [{ id: `isola-${packId}`, name: "Isola fixture" }],
    quests: [{
      id: questId,
      island: `isola-${packId}`,
      title: "Avventura fixture",
      readAloud: "Una storia di prova.",
      readKids: { facile: ["Ciao."], avanzato: ["Salve, ciurma."] },
      beats: ["Primo momento"],
      choices: [{ label: "Avanti", stat: "coraggio", target: 6 }],
      rewards: [{ type: "coins", amount: 1 }],
      storyFlow: {
        start: "apertura",
        progression: [
          {
            scene_id: "apertura",
            scene: { read: "Due vele compaiono all'orizzonte." },
            outcome: { title: "Vele!", text: "La ciurma si prepara.", next: "navi-dolci" }
          },
          {
            id: "navi-dolci",
            type: "raid",
            pairId,
            skippedText: "Le due navi sono già oltre l'orizzonte."
          },
          {
            scene_id: "finale",
            scene: { read: "La rotta continua." },
            completion: { action_label: "Concludi" }
          }
        ]
      }
    }]
  });

  const beforeValid = PIRATI.problems.length;
  PIRATI.registerPack(storyPack("pack-raid-valido", "quest-raid-valido", "dolce-freddo"));
  assert.deepEqual(Array.from(PIRATI.problems).slice(beforeValid), []);
  const raidStep = PIRATI.quest("quest-raid-valido").storyFlow.scenes["navi-dolci"];
  assert.deepEqual(JSON.parse(JSON.stringify(raidStep)), {
    id: "navi-dolci",
    type: "raid",
    pairId: "dolce-freddo",
    skippedText: "Le due navi sono già oltre l'orizzonte.",
    scene_id: "navi-dolci"
  });

  const beforeInvalid = PIRATI.problems.length;
  PIRATI.registerPack(storyPack("pack-raid-invalido", "quest-raid-invalido", "coppia-assente"));
  const invalidProblems = Array.from(PIRATI.problems).slice(beforeInvalid);
  assert.equal(invalidProblems.length, 1);
  assert.match(invalidProblems[0], /coppia di saccheggio sconosciuta/);
});

test("uno step StoryFlow avvia il saccheggio e closeRaid riprende esattamente dalla scena successiva", () => {
  const { api, navigated } = storyAppHarness();
  assert.equal(typeof api.startStoryRaid, "function");
  assert.equal(typeof api.advanceStoryRaid, "function");
  api.setState(storyRaidState());

  const markup = api.storyPhaseMarkup();
  assert.match(markup, /Avvistamento piratesco/);
  assert.match(markup, /data-story-raid-start/);
  api.startStoryRaid();
  assert.equal(api.getState().raid.phase, "choice");
  assert.equal(api.getState().raid.pairId, "dolce-freddo");
  assert.equal(api.getState().raid.returnTo, "story");

  Object.assign(api.getState().raid, {
    usedDay: 4,
    shipId: "nave-gelato",
    phase: "result",
    outcome: { success: false },
    rewardsApplied: false
  });
  api.closeRaid();

  assert.equal(api.getState().questCampaign.story.sceneId, "finale");
  assert.equal(api.getState().questCampaign.story.phase, "SCENE");
  assert.equal(api.getState().questCampaign.story.step, 3);
  assert.deepEqual(JSON.parse(JSON.stringify(api.getState().questCampaign.story.resolved)), {});
  assert.deepEqual(JSON.parse(JSON.stringify(api.getState().questCampaign.completedQuestIds)), []);
  assert.deepEqual(navigated, ["quests"]);
});

test("uno step StoryFlow già consumato mostra il testo di passaggio e prosegue senza costo", () => {
  const { api } = storyAppHarness();
  api.setState(storyRaidState({
    raid: { usedDay: 4, phase: "idle", recentPairIds: ["dolce-freddo"] }
  }));

  const before = JSON.parse(JSON.stringify(api.getState().raid));
  const markup = api.storyPhaseMarkup();
  assert.match(markup, /Le vele sono ormai lontane\./);
  assert.match(markup, /data-story-raid-next/);
  api.advanceStoryRaid();

  assert.equal(api.getState().questCampaign.story.sceneId, "finale");
  assert.deepEqual(JSON.parse(JSON.stringify(api.getState().raid)), before);
});

test("uno step StoryFlow senza skippedText usa il testo di passaggio predefinito", () => {
  const { api, PIRATI } = storyAppHarness();
  delete PIRATI.quest("quest-story-raid").storyFlow.scenes["navi-dolci"].skippedText;
  api.setState(storyRaidState({ raid: { usedDay: 4, phase: "idle" } }));

  assert.match(api.storyPhaseMarkup(), /Le due navi sono ormai troppo lontane\./);
});

test("uno step StoryFlow con pairId non valido apre una coppia casuale e conserva la diagnostica", () => {
  const { api, PIRATI } = storyAppHarness();
  PIRATI.quest("quest-story-raid").storyFlow.scenes["navi-dolci"].pairId = "coppia-assente";
  api.setState(storyRaidState());
  const problemsBefore = PIRATI.problems.length;

  api.startStoryRaid();

  assert.equal(api.getState().raid.phase, "choice");
  assert.ok(PIRATI.raidPair(api.getState().raid.pairId));
  assert.ok(PIRATI.problems.slice(problemsBefore).some(problem => problem.includes("coppia sconosciuta (coppia-assente)")));
});
