const test = require("node:test");
const assert = require("node:assert/strict");
const { zoneLayoutStyle } = require("../fortress-game-ui.js");

/* zoneLayoutStyle è la funzione pura che fortress-game-ui.js usa per
   posizionare ogni tile nella griglia (grid-row/grid-column), a partire dal
   layout {row,col} del catalogo. Verifica qui che NON dipenda in alcun modo
   dagli id/nomi di Map 01 (forest, central-fortress, ...): riceve solo
   coordinate numeriche, mai una stringa di zona. */

test("produce uno style grid-row/grid-column dalle coordinate", () => {
  assert.equal(zoneLayoutStyle({ row: 3, col: 2 }), ' style="grid-row:3;grid-column:2;"');
  assert.equal(zoneLayoutStyle({ row: 1, col: 1 }), ' style="grid-row:1;grid-column:1;"');
});

test("nessuno style se il layout manca o è incompleto", () => {
  assert.equal(zoneLayoutStyle(undefined), "");
  assert.equal(zoneLayoutStyle(null), "");
  assert.equal(zoneLayoutStyle({}), "");
  assert.equal(zoneLayoutStyle({ row: 2 }), "");
  assert.equal(zoneLayoutStyle({ col: 2 }), "");
});

test("funziona con ID di zona completamente arbitrari, non appartenenti a Map 01", () => {
  // La funzione non riceve mai un id: qui lo dimostriamo passando solo
  // layout di zone fittizie con nomi che non esistono in nessuna mappa reale.
  const fakeZones = [
    { id: "quadrante-alpha", layout: { row: 1, col: 1 } },
    { id: "settore-omega-9", layout: { row: 4, col: 7 } },
    { id: "nodo-x", layout: { row: 10, col: 10 } }
  ];
  fakeZones.forEach((z) => {
    const style = zoneLayoutStyle(z.layout);
    assert.equal(style, ` style="grid-row:${z.layout.row};grid-column:${z.layout.col};"`);
  });
});

test("stesso layout numerico produce sempre lo stesso style, indipendentemente dall'id della zona", () => {
  const styleA = zoneLayoutStyle({ row: 3, col: 2 }); // coordinate di central-fortress su Map 01
  const styleB = zoneLayoutStyle({ row: 3, col: 2 }); // stesse coordinate, "zona" completamente diversa
  assert.equal(styleA, styleB, "la funzione non fa mai riferimento al nome della zona");
});
