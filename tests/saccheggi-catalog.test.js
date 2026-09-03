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
  assert.ok(ships.flatMap(ship => ship.rewards).every(reward => {
    if (reward.type === "coins") return Number.isInteger(reward.amount) && reward.amount >= 2 && reward.amount <= 5;
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
