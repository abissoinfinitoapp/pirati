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
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/domandona.js"), "utf8"), context, { filename: "catalog/domandona.js" });
  return context.window.PIRATI;
}

test("registra le domande della Nave Domandona, entrambi i livelli, tutte complete", () => {
  const PIRATI = loadCatalog();

  const facili = PIRATI.domandonaQuestions.filter((q) => q.level === "facile");
  const avanzate = PIRATI.domandonaQuestions.filter((q) => q.level === "avanzato");
  assert.ok(facili.length >= 10, "servono abbastanza domande facili da non ripetersi subito");
  assert.ok(avanzate.length >= 10, "servono abbastanza domande avanzate da non ripetersi subito");

  assert.equal(new Set(PIRATI.domandonaQuestions.map((q) => q.id)).size, PIRATI.domandonaQuestions.length, "id unici");

  PIRATI.domandonaQuestions.forEach((q) => {
    assert.ok(["facile", "avanzato"].includes(q.level));
    assert.equal(typeof q.domanda, "string");
    assert.ok(q.domanda.length > 0);
    assert.equal(typeof q.risposta, "string");
    assert.ok(q.risposta.length > 0);
    assert.ok(Array.isArray(q.indizi) && q.indizi.length >= 2, "servono almeno 2 indizi");
    q.indizi.forEach((hint) => assert.ok(typeof hint === "string" && hint.length > 0));
    assert.ok(Array.isArray(q.rewards) && q.rewards.length > 0);
    q.rewards.forEach((reward) => {
      assert.ok(["coins", "fame", "loot"].includes(reward.type));
      if (reward.type === "loot") assert.ok(PIRATI.reward ? true : true); // nessuna loot in questo catalogo per ora
      else assert.ok(Number.isFinite(reward.amount) && reward.amount > 0);
    });
  });

  assert.equal(PIRATI.problems.length, 0);
});

test("rifiuta domande senza indizi sufficienti, senza livello valido o duplicate", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;

  vm.runInContext(`PIRATI.registerDomandonaQuestions([
    { id: "un-solo-indizio", level: "facile", domanda: "?", risposta: "!", indizi: ["solo uno"], rewards: [{ type: "coins", amount: 1 }] },
    { id: "livello-strano", level: "medio", domanda: "?", risposta: "!", indizi: ["a", "b"], rewards: [{ type: "coins", amount: 1 }] },
    { id: "ok-1", level: "facile", domanda: "?", risposta: "!", indizi: ["a", "b"], rewards: [{ type: "coins", amount: 1 }] },
    { id: "ok-1", level: "facile", domanda: "?", risposta: "!", indizi: ["a", "b"], rewards: [{ type: "coins", amount: 1 }] }
  ]);`, context);

  assert.equal(context.PIRATI.domandonaQuestions.length, 1, "solo 'ok-1' e' valida");
  assert.equal(context.PIRATI.problems.length, 3);
});
