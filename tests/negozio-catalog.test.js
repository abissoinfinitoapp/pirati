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
  vm.runInContext(fs.readFileSync(path.join(root, "catalog/negozio.js"), "utf8"), context, { filename: "catalog/negozio.js" });
  return context.window.PIRATI;
}

test("registra 30 oggetti del Negozio, tutti con prezzo, perPrestigio e immagine", () => {
  const PIRATI = loadCatalog();

  assert.equal(PIRATI.negozio.length, 30);
  assert.equal(new Set(PIRATI.negozio.map((i) => i.id)).size, 30, "id unici");

  PIRATI.negozio.forEach((item) => {
    assert.ok(typeof item.name === "string" && item.name.length > 0);
    assert.ok(Number.isInteger(item.price) && item.price > 0);
    assert.ok(Number.isInteger(item.perPrestigio) && item.perPrestigio > 0);
    assert.ok(item.image.endsWith(".webp"));
    // il costo per un punto di Prestigio resta in una fascia sensata
    const costoPerPunto = item.price * item.perPrestigio;
    assert.ok(costoPerPunto >= 20000 && costoPerPunto <= 300000, `${item.id}: ${costoPerPunto} monete per punto`);
  });

  assert.equal(PIRATI.problems.length, 0);
});

test("rifiuta oggetti senza prezzo valido o duplicati", () => {
  const context = vm.createContext({
    window: {},
    console: { log() {}, warn() {} },
    PIRATI_ASSET: (assetPath) => "assets/" + assetPath
  });
  context.window.window = context.window;
  context.window.PIRATI_ASSET = context.PIRATI_ASSET;
  vm.runInContext(fs.readFileSync(path.join(root, "engine/pirati-core.js"), "utf8"), context, { filename: "engine/pirati-core.js" });
  context.PIRATI = context.window.PIRATI;

  vm.runInContext(`PIRATI.registerNegozio([
    { id: "gratis", name: "Roba", price: 0, perPrestigio: 100 },
    { id: "senza-prestigio", name: "Roba", price: 10, perPrestigio: 0 },
    { id: "ok", name: "Roba", price: 10, perPrestigio: 100 },
    { id: "ok", name: "Roba", price: 10, perPrestigio: 100 }
  ]);`, context);

  assert.equal(context.PIRATI.negozio.length, 1);
  assert.equal(context.PIRATI.problems.length, 3);
});
