const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("../catalog/fortress-skins.js");
const characters = require("../catalog/fortress-characters.js");

const GAMEPLAY_FIELDS = [
  "power", "bonus", "stat", "stats", "modifier", "modifiers", "effect",
  "effects", "special", "damage", "loot", "movement", "combat"
];

test("il catalogo ha esattamente 40 skin", () => {
  assert.equal(catalog.SKINS.length, 40);
});

test("10 personaggi x 4 skin ciascuno", () => {
  const byCharacter = {};
  catalog.SKINS.forEach((s) => {
    byCharacter[s.characterId] = (byCharacter[s.characterId] || 0) + 1;
  });
  assert.equal(Object.keys(byCharacter).length, 10);
  Object.values(byCharacter).forEach((count) => assert.equal(count, 4));
});

test("id univoci", () => {
  const ids = catalog.SKINS.map((s) => s.id);
  assert.equal(new Set(ids).size, 40);
});

test("characterId sempre tra i 10 personaggi reali", () => {
  const validIds = new Set(characters.CHARACTERS.map((c) => c.id));
  catalog.SKINS.forEach((s) => assert.ok(validIds.has(s.characterId), s.id));
});

test("nessuna skin *-base nel catalogo: la Base non appartiene all'economia", () => {
  catalog.SKINS.forEach((s) => {
    assert.notEqual(s.id, `${s.characterId}-base`, s.id);
    assert.notEqual(s.rarity, "comune", s.id);
  });
});

test("ogni personaggio ha un'immagine base canonica <id>-base.webp", () => {
  characters.CHARACTERS.forEach((c) => {
    assert.equal(c.image, `assets/fortress-img/${c.id}-base.webp`, c.id);
  });
});

test("prezzi coerenti con la rarità (4 tier, niente Comune)", () => {
  const expected = { "non-comune": 300, rara: 700, epica: 1400, leggendaria: 2500 };
  assert.deepEqual(catalog.RARITY_ORDER, ["non-comune", "rara", "epica", "leggendaria"]);
  catalog.SKINS.forEach((s) => assert.equal(s.price, expected[s.rarity], s.id));
});

test("nessun campo di gameplay nel catalogo skin", () => {
  catalog.SKINS.forEach((s) => {
    GAMEPLAY_FIELDS.forEach((field) => assert.equal(field in s, false, `${s.id} ha il campo ${field}`));
    assert.deepEqual(
      Object.keys(s).sort(),
      ["assetReady", "characterId", "id", "image", "name", "price", "rarity"].sort()
    );
  });
});

test("ogni immagine punta a assets/fortress-img/<id>.webp", () => {
  catalog.SKINS.forEach((s) => assert.equal(s.image, `assets/fortress-img/${s.id}.webp`));
});
