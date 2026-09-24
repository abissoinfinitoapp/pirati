const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zonesApi = require("../catalog/fortress-zones.js");
const combat = require("../engine/fortress-combat.js");
const loop = require("../engine/fortress-loop.js");

const { ZONES, DANGER_STARS, validateZones, buildLoopZones } = zonesApi;

test("ci sono esattamente 9 zone, id univoci", () => {
  assert.equal(ZONES.length, 9);
  assert.equal(new Set(ZONES.map((z) => z.id)).size, 9);
});

test("esattamente 4 zone esterne, 4 interne, 1 centro", () => {
  const byRing = { esterno: 0, interno: 0, centro: 0 };
  ZONES.forEach((z) => { byRing[z.ring] = (byRing[z.ring] || 0) + 1; });
  assert.equal(byRing.esterno, 4);
  assert.equal(byRing.interno, 4);
  assert.equal(byRing.centro, 1);
});

test("nessun problema di validazione rilevato a caricamento", () => {
  assert.deepEqual(zonesApi.zoneProblems, []);
});

test("ogni collegamento è simmetrico e punta a un id esistente", () => {
  const ids = new Set(ZONES.map((z) => z.id));
  ZONES.forEach((z) => {
    z.connections.forEach((cid) => {
      assert.ok(ids.has(cid), `${z.id} collega a un id inesistente: ${cid}`);
      const other = ZONES.find((o) => o.id === cid);
      assert.ok(other.connections.includes(z.id), `${z.id} <-> ${cid} non è simmetrico`);
    });
  });
});

test("danger/encounterRange usano solo il vocabolario richiesto dal motore", () => {
  const validDanger = ["basso", "medio", "alto"];
  const validRange = ["vicino", "medio", "lontano"];
  ZONES.forEach((z) => {
    assert.ok(validDanger.includes(z.danger), `${z.id}: danger non valido`);
    assert.ok(validRange.includes(z.encounterRange), `${z.id}: encounterRange non valido`);
  });
});

test("DANGER_STARS copre tutti i valori di danger usati dalle zone", () => {
  ZONES.forEach((z) => assert.ok(DANGER_STARS[z.danger] >= 1 && DANGER_STARS[z.danger] <= 3, z.id));
});

test("central-fortress è l'unica zona centro ed è collegata esattamente alle 4 zone interne", () => {
  const centro = ZONES.find((z) => z.ring === "centro");
  assert.equal(centro.id, "central-fortress");
  const interne = ZONES.filter((z) => z.ring === "interno").map((z) => z.id).sort();
  assert.deepEqual(centro.connections.slice().sort(), interne);
});

test("ogni immagine di zona esiste su disco, esattamente i nomi già presenti nel progetto", () => {
  ZONES.forEach((z) => {
    const full = path.join(__dirname, "..", z.image);
    assert.ok(fs.existsSync(full), `manca il file: ${z.image}`);
  });
});

test("buildLoopZones produce zone utilizzabili da createGame/landPlayer/beginExploration senza modificare il loop", () => {
  const zones = buildLoopZones(combat);
  assert.equal(zones.length, 9);
  zones.forEach((z) => {
    assert.equal(z.stormState, "sicura");
    assert.equal(z.ambientLootClaimed, false);
    assert.deepEqual(z.chests, []);
    assert.ok(z.noiseTracker && typeof z.noiseTracker.noise === "number");
  });

  const players = [{ id: "p1", name: "Test" }];
  const bossConfig = { hpPerPlayer: 10, phases: [{ threshold: 1, attackProfile: { baseDice: 1, power: 1, range: "medio", special: { type: "none" } } }] };
  const state = loop.createGame({ players, zones, bossConfig });
  state.players[0].zoneId = null;

  assert.doesNotThrow(() => loop.landPlayer(state, "p1", "forest", () => 0.99));
  assert.throws(() => loop.landPlayer(state, "p1", "central-fortress", () => 0.99), /esterna/);
  assert.doesNotThrow(() => loop.beginExploration(state, () => 0.99));
  assert.equal(state.round, 1);
});

test("buildLoopZones non è una seconda mappa duplicata: usa esattamente i dati di ZONES", () => {
  const zones = buildLoopZones(combat);
  ZONES.forEach((z) => {
    const built = zones.find((b) => b.id === z.id);
    assert.equal(built.name, z.name);
    assert.equal(built.ring, z.ring);
    assert.equal(built.danger, z.danger);
    assert.equal(built.encounterRange, z.encounterRange);
    assert.deepEqual(built.connections, z.connections);
  });
});

/* =========================================================================
   LAYOUT — dato puro di presentazione (riga/colonna), mai letto dall'engine.
   ========================================================================= */

test("ogni zona ha un layout {row,col} numerico, nessuna mancante", () => {
  ZONES.forEach((z) => {
    assert.ok(z.layout, `${z.id}: manca layout`);
    assert.equal(typeof z.layout.row, "number", `${z.id}: row non numerico`);
    assert.equal(typeof z.layout.col, "number", `${z.id}: col non numerico`);
  });
});

test("buildLoopZones NON porta il layout nello stato di gioco: è solo un dato UI del catalogo", () => {
  const zones = buildLoopZones(combat);
  zones.forEach((z) => assert.equal("layout" in z, false, `${z.id}: il layout non deve entrare nello stato di gioco`));
});

/* =========================================================================
   BOSS su Map 01 REALE — regressione del bug boss.zoneId hardcoded
   ("centro" letterale, mai combaciante con "central-fortress"). Usa SEMPRE
   buildLoopZones(), mai createDefaultZoneLayout(): quel bug non emergeva
   perché la mappa di fallback del loop ha per costruzione una zona "centro".
   ========================================================================= */

function makeBossConfig(overrides) {
  return Object.assign({
    zoneId: "central-fortress", activationRound: 10,
    hpPerPlayer: 10, summonEvery: 3, summonArchetype: "normale",
    phases: [{ threshold: 1.0, attackProfile: { baseDice: 1, power: 1, range: "medio", special: { type: "none" } } }]
  }, overrides);
}

function newMap01Game(n, bossOverrides) {
  const zones = buildLoopZones(combat);
  const players = Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
  const state = loop.createGame({ players, zones, bossConfig: makeBossConfig(bossOverrides) });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}

test("Map 01 reale: state.boss.zoneId è central-fortress, mai 'centro'", () => {
  const state = newMap01Game(1);
  assert.equal(state.boss.zoneId, "central-fortress");
});

test("Map 01 reale: getZone(state, boss.zoneId) restituisce davvero una zona (prima del fix era undefined)", () => {
  const state = newMap01Game(1);
  const zone = loop.getZone(state, state.boss.zoneId);
  assert.ok(zone, "la zona del boss deve esistere");
  assert.equal(zone.ring, "centro");
});

test("Map 01 reale: il Boss si attiva esattamente all'activationRound configurato", () => {
  const state = newMap01Game(2);
  state.players.forEach((p) => loop.landPlayer(state, p.id, "forest", () => 0.99));
  loop.beginExploration(state, () => 0.99);
  for (let i = 1; i < 10; i++) {
    assert.equal(state.boss.active, false, "non ancora al round " + i);
    loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99);
  }
  assert.equal(state.round, 10);
  assert.equal(state.boss.active, true);
});

test("Map 01 reale: prima dell'activationRound il Boss resta inattivo anche se la zona è raggiunta", () => {
  const state = newMap01Game(1);
  state.players.forEach((p) => loop.landPlayer(state, p.id, "forest", () => 0.99));
  loop.beginExploration(state, () => 0.99);
  loop.getPlayer(state, "p1").zoneId = "central-fortress";
  assert.equal(state.boss.active, false);
  assert.throws(() => loop.declareBossAttack(state, "p1", { baseDice: 1, range: "medio", power: 1, special: { type: "none" } }), /non valido/);
});

test("Map 01 reale: un giocatore nella zona del Boss può dichiarare l'attacco una volta attivo", () => {
  const state = newMap01Game(1);
  state.players.forEach((p) => loop.landPlayer(state, p.id, "forest", () => 0.99));
  loop.beginExploration(state, () => 0.99);
  // Spostato subito al centro: le zone esterne diventano "eliminated" con la
  // Tempesta prima del round 10, cosa irrilevante per questo test.
  loop.getPlayer(state, "p1").zoneId = "central-fortress";
  while (state.round < 10) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  assert.doesNotThrow(() => loop.declareBossAttack(state, "p1", weapon));
});

test("una configurazione con zoneId/activationRound diversi funziona senza toccare l'engine (mappa di default)", () => {
  const state = loop.createGame({
    players: [{ id: "p1", name: "Test" }],
    bossConfig: makeBossConfig({ zoneId: "e2", activationRound: 3 })
  });
  state.players[0].zoneId = null;
  assert.equal(state.boss.zoneId, "e2");
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.beginExploration(state, () => 0.99);
  loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); // round 2
  assert.equal(state.boss.active, false);
  loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); // round 3
  assert.equal(state.round, 3);
  assert.equal(state.boss.active, true, "si attiva al round 3 configurato, non al 10 di default");
});
