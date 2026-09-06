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
    PIRATI_ASSET: (p) => "assets/" + p
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/teschio.js"), "utf8"), context, { filename: "catalog/teschio.js" });
  return context.window.PIRATI;
}

test("registra le sfide del Teschio, tutte complete e con durata/premio sensati", () => {
  const PIRATI = loadCatalog();

  assert.ok(PIRATI.teschioSfide.length >= 16, "servono abbastanza sfide da non ripetersi");
  assert.equal(new Set(PIRATI.teschioSfide.map((s) => s.id)).size, PIRATI.teschioSfide.length, "id unici");

  const cats = new Set(PIRATI.teschioSfide.map((s) => s.categoria));
  ["posa", "smorfia", "verso", "scioglilingua"].forEach((c) => assert.ok(cats.has(c), `manca la categoria ${c}`));

  PIRATI.teschioSfide.forEach((s) => {
    assert.ok(["posa", "smorfia", "verso", "scioglilingua"].includes(s.categoria));
    assert.ok(typeof s.sfida === "string" && s.sfida.length > 0);
    assert.ok(typeof s.annuncio === "string" && s.annuncio.length > 0);
    assert.ok(Number.isInteger(s.durata) && s.durata >= 10 && s.durata <= 30, `${s.id}: durata ${s.durata}`);
    assert.ok(Number.isInteger(s.premio) && s.premio > 0);
  });

  assert.ok(PIRATI.teschioFacce.length >= 12);
  assert.equal(new Set(PIRATI.teschioFacce.map((f) => f.id)).size, PIRATI.teschioFacce.length, "id facce unici");
  PIRATI.teschioFacce.forEach((f) => {
    assert.ok(typeof f.nome === "string" && f.nome.length > 0);
    assert.ok(f.image.endsWith(".webp"));
  });

  assert.equal(PIRATI.problems.length, 0);
});

test("rifiuta sfide con durata fuori scala o senza campi", () => {
  const context = vm.createContext({
    window: {}, console: { log() {}, warn() {} }, PIRATI_ASSET: (p) => "assets/" + p
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;

  vm.runInContext(`PIRATI.registerTeschioSfide([
    { id: "troppo-lunga", categoria: "posa", sfida: "x", annuncio: "y", durata: 90, premio: 1 },
    { id: "senza-premio", categoria: "verso", sfida: "x", annuncio: "y", durata: 12 },
    { id: "ok", categoria: "smorfia", sfida: "x", annuncio: "y", durata: 12, premio: 100 }
  ]);`, context);

  assert.equal(context.PIRATI.teschioSfide.length, 1);
  assert.equal(context.PIRATI.problems.length, 2);
});
