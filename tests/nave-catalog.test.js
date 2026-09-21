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
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/premi.js"), "utf8"), context, { filename: "catalog/premi.js" });
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/nave.js"), "utf8"), context, { filename: "catalog/nave.js" });
  return context.window.PIRATI;
}

test("registra i 6 livelli della nave (0-5), ognuno con requisiti validi", () => {
  const PIRATI = loadCatalog();

  assert.equal(PIRATI.shipUpgrades.length, 6);
  assert.equal(PIRATI.shipUpgrades.map((u) => u.level).join(","), "0,1,2,3,4,5", "un livello per ciascun numero da 0 a 5, in ordine");

  const zero = PIRATI.shipUpgrade(0);
  assert.equal(zero.cost, 0);
  assert.equal(zero.requires.length, 0);

  PIRATI.shipUpgrades.filter((u) => u.level > 0).forEach((u) => {
    assert.ok(u.cost > 0, `livello ${u.level}: il costo deve essere positivo`);
    assert.ok(u.requires.length === 1 || u.requires.length === 2, `livello ${u.level}: servono 1 o 2 premi richiesti`);
    u.requires.forEach((id) => assert.ok(PIRATI.reward(id), `livello ${u.level}: premio mancante "${id}"`));
    assert.ok(u.speed > 0 || u.strength > 0, `livello ${u.level}: deve dare almeno un bonus`);
  });

  assert.equal(PIRATI._state.problems.length, 0);
});

test("costi e soglie crescono col livello, mai a scendere", () => {
  const PIRATI = loadCatalog();
  const paid = PIRATI.shipUpgrades.filter((u) => u.level > 0);
  for (let i = 1; i < paid.length; i += 1) {
    assert.ok(paid[i].cost > paid[i - 1].cost, `il livello ${paid[i].level} deve costare più del ${paid[i - 1].level}`);
  }
});

test("rifiuta un livello duplicato, fuori scala o con un premio inesistente", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;

  vm.runInContext(`PIRATI.registerShipUpgrades([
    { level: 1, name: "A", text: "a", cost: 100, requires: ["non-esiste"], speed: 1, strength: 0 },
    { level: 1, name: "B", text: "b", cost: 100, requires: [], speed: 1, strength: 0 },
    { level: 9, name: "C", text: "c", cost: 100, requires: [], speed: 1, strength: 0 }
  ]);`, context);

  assert.equal(context.PIRATI.shipUpgrades.length, 0);
  assert.equal(context.PIRATI.problems.length, 3);
});
