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
