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
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/belarda.js"), "utf8"), context, { filename: "catalog/belarda.js" });
  return context.window.PIRATI;
}

test("registra i premi della casa di Nonna Belarda, tutti con id, testo e ricompense valide", () => {
  const PIRATI = loadCatalog();

  assert.ok(PIRATI.belardaLoot.length >= 4, "servono almeno 4 varianti per non ripetersi subito");
  assert.equal(new Set(PIRATI.belardaLoot.map((e) => e.id)).size, PIRATI.belardaLoot.length, "id unici");
  PIRATI.belardaLoot.forEach((entry) => {
    assert.equal(typeof entry.text, "string");
    assert.ok(entry.text.length > 0);
    assert.ok(Array.isArray(entry.rewards) && entry.rewards.length > 0);
    entry.rewards.forEach((reward) => {
      assert.ok(["coins", "fame", "loot"].includes(reward.type));
      if (reward.type === "loot") assert.ok(PIRATI.reward(reward.id), `premio mancante: ${reward.id}`);
      else assert.ok(Number.isFinite(reward.amount) && reward.amount > 0);
    });
  });
  assert.equal(PIRATI.problems.length, 0);
});

test("rifiuta una voce senza 'text' o con ricompense non valide", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;

  vm.runInContext(`PIRATI.registerBelardaLoot([
    { id: "senza-testo", rewards: [{ type: "coins", amount: 1 }] },
    { id: "premio-rotto", text: "boh", rewards: [{ type: "coins", amount: -1 }] }
  ]);`, context);

  assert.equal(context.PIRATI.belardaLoot.length, 0);
  assert.equal(context.PIRATI.problems.length, 2);
});
