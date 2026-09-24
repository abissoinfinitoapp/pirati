const test = require("node:test");
const assert = require("node:assert/strict");
const loop = require("../engine/fortress-loop.js");
const director = require("../engine/fortress-director.js");
const combat = require("../engine/fortress-combat.js");
const zonesApi = require("../catalog/fortress-zones.js");

/* Enemy Squads / Multi-node Encounter V1 — Forest pilota. Come
   fortress-node-graph.test.js: SOLO il catalogo reale (zonesApi.buildLoopZones),
   mai una mappa sintetica per i test "veri". Grafo Forest usato dai test:
     n01(entry) --1-- n02(bivio) --1-- n03(cassa)
                         |
                         1
                         |
                        n04
   quindi da n02 tutto è a distanza 1 ("medio"); da n01/n03/n04 il nodo
   opposto rispetto a n02 è a distanza 2 ("lontano"). Composizione Encounter
   (catalog/fortress-zones.js): n02 = aggressivo+normale, n03 = distanza+
   resistente, n04 = normale+normale (6 totali, invariati come HP/archetipi). */

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
}
function newForestGame(n) {
  const zones = zonesApi.buildLoopZones(combat);
  const state = loop.createGame({ players: makePlayers(n), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}
function newLegacyGame(n) {
  const zones = loop.createDefaultZoneLayout();
  const state = loop.createGame({ players: makePlayers(n), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}
/* Posiziona un giocatore direttamente su un nodo Forest senza passare da
   moveToNode (che consuma movedThisRound e richiede collegamenti reali):
   utile per costruire scenari di test mirati, mai per bypassare le regole
   verificate altrove (movimento/atterraggio hanno i propri test dedicati). */
function placeAt(state, playerId, nodeId) {
  const p = loop.getPlayer(state, playerId);
  p.zoneId = "forest";
  p.nodeId = nodeId;
}

/* =========================================================================
   getNodeDistance / nodeDistanceToRange — BFS pura, mai coordinate x/y
   ========================================================================= */
test("getNodeDistance: stesso nodo = 0 -> vicino", () => {
  const zone = zonesApi.buildLoopZones(combat).find((z) => z.id === "forest");
  assert.equal(loop.getNodeDistance(zone, "forest-n02", "forest-n02"), 0);
  assert.equal(loop.nodeDistanceToRange(0), "vicino");
});

test("getNodeDistance: 1 collegamento = medio", () => {
  const zone = zonesApi.buildLoopZones(combat).find((z) => z.id === "forest");
  assert.equal(loop.getNodeDistance(zone, "forest-n01", "forest-n02"), 1);
  assert.equal(loop.nodeDistanceToRange(1), "medio");
});

test("getNodeDistance: 2+ collegamenti = lontano", () => {
  const zone = zonesApi.buildLoopZones(combat).find((z) => z.id === "forest");
  assert.equal(loop.getNodeDistance(zone, "forest-n01", "forest-n03"), 2);
  assert.equal(loop.nodeDistanceToRange(2), "lontano");
  assert.equal(loop.nodeDistanceToRange(3), "lontano");
});

test("getNodeDistance è deterministica: stessa coppia di nodi, stesso risultato ogni volta", () => {
  const zone = zonesApi.buildLoopZones(combat).find((z) => z.id === "forest");
  const a = loop.getNodeDistance(zone, "forest-n03", "forest-n04");
  const b = loop.getNodeDistance(zone, "forest-n03", "forest-n04");
  assert.equal(a, b);
  assert.equal(a, 2);
});

test("getNodeDistance: nodo inesistente/irraggiungibile -> null, mai un crash", () => {
  const zone = zonesApi.buildLoopZones(combat).find((z) => z.id === "forest");
  assert.equal(loop.getNodeDistance(zone, "forest-n01", "forest-nXX"), null);
  assert.equal(loop.getNodeDistance(null, "a", "b"), null);
  assert.equal(loop.getNodeDistance(zone, null, "forest-n01"), null);
});

test("resolveEncounterRange: fallback a zone.encounterRange fuori dal Node Graph", () => {
  const zones = loop.createDefaultZoneLayout();
  const legacyZone = zones.find((z) => z.id === "e1");
  assert.equal(loop.resolveEncounterRange(legacyZone, null, null), legacyZone.encounterRange);
  assert.equal(loop.resolveEncounterRange(legacyZone, "qualsiasi", "cosa"), legacyZone.encounterRange, "zona senza zone.nodes: sempre il fallback");
});

/* =========================================================================
   Player Attack — la gittata deriva dai nodi (non più un valore fisso)
   ========================================================================= */
test("previewPlayerAttack: stesso nodo del bersaglio -> vicino", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n02");
  placeAt(state, "p1", "forest-n02");
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const pv = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
  assert.equal(pv.encounterRange, "vicino");
});

test("previewPlayerAttack: 1 collegamento dal bersaglio -> medio", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n02");
  placeAt(state, "p1", "forest-n01");
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const pv = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
  assert.equal(pv.encounterRange, "medio");
});

test("previewPlayerAttack: 2+ collegamenti dal bersaglio -> lontano", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n03");
  placeAt(state, "p1", "forest-n04"); // n04 -> n02 -> n03: 2 collegamenti
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const pv = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
  assert.equal(pv.encounterRange, "lontano");
});

test("declarePlayerAttack: funziona su un nemico raggiungibile ma su un nodo diverso", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n03");
  placeAt(state, "p1", "forest-n02");
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const declared = loop.declarePlayerAttack(state, "p1", enemyId, weapon);
  assert.equal(declared.encounterRange, "medio");
});

test("declarePlayerAttack: rifiuta un bersaglio su un nodo davvero irraggiungibile", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n03");
  placeAt(state, "p1", "forest-n01");
  const zone = loop.getZone(state, "forest");
  zone.nodes = zone.nodes.map((n) => Object.assign({}, n, { connections: Object.assign({}, n.connections) }));
  zone.nodes.find((n) => n.id === "forest-n01").connections = {};
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  assert.throws(() => loop.declarePlayerAttack(state, "p1", enemyId, weapon), /raggiungibile/);
});

test("fallback legacy: una zona senza Node Graph continua a usare encounterRange di zona", () => {
  const state = newLegacyGame(1);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const zone = loop.getZone(state, "e1");
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const pv = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
  assert.equal(pv.encounterRange, zone.encounterRange);
});

/* =========================================================================
   Decisione nemica: ATTACCA oppure MUOVITI DI 1 NODO, mai entrambe
   ========================================================================= */
test("nemico ranged (range !== vicino) attacca da fermo se un bersaglio è raggiungibile, anche non adiacente", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "distanza", "forest", "forest-n03"); // range: "lontano"
  placeAt(state, "p1", "forest-n01"); // distanza 2, non adiacente
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "attack");
  assert.equal(prepared.targetId, "p1");
  assert.equal(prepared.encounterRange, "lontano");
  assert.equal(loop.getEnemy(state, enemyId).nodeId, "forest-n03", "il ranged non avanza inutilmente");
});

test("nemico melee (range === vicino) NON sullo stesso nodo si avvicina di un nodo invece di attaccare", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "aggressivo", "forest", "forest-n02"); // range: "vicino"
  placeAt(state, "p1", "forest-n03"); // non sullo stesso nodo
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "move");
  assert.equal(prepared.fromNodeId, "forest-n02");
  assert.equal(prepared.toNodeId, "forest-n03");
  assert.equal(loop.getEnemy(state, enemyId).nodeId, "forest-n03");
  assert.equal(prepared.diceCount, undefined, "nessun tiro fisico su un movimento");
});

test("nemico melee GIA' sullo stesso nodo di un bersaglio attacca (non si sposta inutilmente)", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "aggressivo", "forest", "forest-n02");
  placeAt(state, "p1", "forest-n02");
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "attack");
  assert.equal(prepared.encounterRange, "vicino");
  assert.equal(loop.getEnemy(state, enemyId).nodeId, "forest-n02");
});

test("il movimento nemico è sempre di UN solo nodo, mai un salto diretto al bersaglio", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "aggressivo", "forest", "forest-n04");
  placeAt(state, "p1", "forest-n01"); // n04 -> n01 sono a distanza 2 (via n02)
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "move");
  assert.equal(prepared.toNodeId, "forest-n02", "un solo passo verso n01, non n01 direttamente");
  assert.notEqual(prepared.toNodeId, "forest-n01");
});

test("scelta del bersaglio deterministica: stesso stato, stesso risultato ogni volta (mai random)", () => {
  const state = newForestGame(3);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.landPlayer(state, "p3", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n02"); // range: "medio", tutti e 3 a distanza 1
  placeAt(state, "p1", "forest-n01");
  placeAt(state, "p2", "forest-n03");
  placeAt(state, "p3", "forest-n04");
  const first = loop.prepareEnemyStep(state, enemyId);
  // Nulla è cambiato nello stato rispetto a prima (un "attack" non muta
  // nodeId): richiamare prepareEnemyStep di nuovo deve scegliere lo STESSO
  // bersaglio, prova diretta che non c'è alcun elemento casuale in mezzo.
  const second = loop.prepareEnemyStep(state, enemyId);
  assert.equal(first.type, "attack");
  assert.equal(second.type, "attack");
  assert.equal(first.targetId, second.targetId);
});

test("i giocatori KO sono esclusi dal targeting nemico", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n02");
  placeAt(state, "p1", "forest-n02");
  placeAt(state, "p2", "forest-n02");
  loop.setPlayerKO(state, loop.getPlayer(state, "p1"));
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "attack");
  assert.equal(prepared.targetId, "p2", "p1 è KO: mai un bersaglio valido");
});

test("nessun bersaglio raggiungibile (grafo disconnesso): idle, mai un crash", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "forest", "forest-n04");
  placeAt(state, "p1", "forest-n01");
  const zone = loop.getZone(state, "forest");
  zone.nodes = zone.nodes.map((n) => Object.assign({}, n, { connections: Object.assign({}, n.connections) }));
  zone.nodes.find((n) => n.id === "forest-n04").connections = {}; // isola n04
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "idle");
  assert.equal(loop.getEnemy(state, enemyId).nodeId, "forest-n04", "nessun movimento inventato");
});

/* =========================================================================
   Fase Nemici — un movimento non richiede dadi e fa comunque avanzare
   il cursore del Director al nemico successivo (getEnemyPhaseOrder invariato)
   ========================================================================= */
test("Enemy Phase: un nemico che si muove non genera awaitingRoll e il Director passa al successivo da solo", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const mover = loop.spawnEnemy(state, "aggressivo", "forest", "forest-n04");
  const shooter = loop.spawnEnemy(state, "distanza", "forest", "forest-n03");
  placeAt(state, "p1", "forest-n01");
  const dir = director.createDirectorState(state);
  dir.pendingAnnouncements = [];
  dir.directorPhase = "enemy-phase";
  dir.enemyPhase = { order: loop.getEnemyPhaseOrder(state), cursor: 0 };
  assert.deepEqual(dir.enemyPhase.order.slice().sort(), [mover, shooter].sort());

  const firstStep = director.beginEnemyRollStep(state, dir);
  assert.equal(firstStep.type, "move");
  assert.equal(dir.awaitingRoll, null, "un movimento non è mai un tiro fisico in attesa");
  assert.equal(dir.enemyPhase.cursor, 1, "il Director avanza da solo, nessun controllo manuale");

  const secondStep = director.beginEnemyRollStep(state, dir);
  assert.equal(secondStep.type, "awaiting-roll", "il ranged, raggiungibile, attacca invece");
});

/* =========================================================================
   Nessuna regressione: Battlefield resta zone-level, KO/eliminated invariati
   ========================================================================= */
test("Battlefield resta zone-level anche con l'Encounter sparso su 3 nodi", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  assert.equal(director.isBattlefield(state, "forest"), false);
  loop.moveToNode(state, "p1", "right"); // spawna i 6 nemici su n02/n03/n04
  assert.equal(director.isBattlefield(state, "forest"), true);
  assert.equal(loop.enemiesInZone(state, "forest").length, 6);
});
