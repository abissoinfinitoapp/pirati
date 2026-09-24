const test = require("node:test");
const assert = require("node:assert/strict");
const loop = require("../engine/fortress-loop.js");
const director = require("../engine/fortress-director.js");

/* Incontro iniziale: al massimo UNA volta per zona, alla prima entrata di un
   giocatore (atterraggio o movimento, stessa ensureInitialEncounter per
   entrambi). Qui usiamo SEMPRE createDefaultZoneLayout() con initialEncounter
   iniettato a mano su singole zone: l'engine non sa nulla di Map01, quindi i
   test non devono saperlo neanche loro (zero id reali di Map01). */
function zonesWithEncounter(zoneId, encounter) {
  const zones = loop.createDefaultZoneLayout();
  const zone = zones.find((z) => z.id === zoneId);
  zone.initialEncounter = encounter;
  return zones;
}

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
}

const NORMAL_ONE = [{ archetype: "normale" }];

/* =========================================================================
   1. Prima entrata -> genera l'incontro
   ========================================================================= */
test("prima entrata (atterraggio) genera l'incontro configurato", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  assert.equal(loop.enemiesInZone(state, "e1").length, 0, "prima dell'atterraggio: nessun nemico");
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 1, "dopo l'atterraggio: incontro generato");
  assert.equal(loop.getZone(state, "e1").initialEncounterSpawned, true);
});

/* =========================================================================
   2. Secondo giocatore nella stessa zona -> nessun duplicato
   ========================================================================= */
test("un secondo giocatore che atterra nella stessa zona non genera un secondo incontro", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(2), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 1);
  loop.landPlayer(state, "p2", "e1", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 1, "nessun nemico aggiuntivo per il secondo giocatore");
});

/* =========================================================================
   3. Uscita/rientro -> nessun nuovo incontro iniziale
   4. Zona ripulita -> resta ripulita
   ========================================================================= */
test("zona ripulita: uscire e rientrare via movimento non rigenera l'incontro (e1<->e2 sono collegate)", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  const enemyId = loop.enemiesInZone(state, "e1")[0].id;
  loop.getEnemy(state, enemyId).hp = 0; // zona ripulita
  assert.equal(loop.enemiesInZone(state, "e1").length, 0, "la zona è davvero ripulita");

  loop.moveAction(state, "p1", "e2", () => 0.99); // esce
  loop.getPlayer(state, "p1").movedThisRound = false; // stesso reset che farebbe startRound al round successivo
  loop.moveAction(state, "p1", "e1", () => 0.99); // rientra
  assert.equal(loop.enemiesInZone(state, "e1").length, 0, "nessun respawn al rientro");
  assert.equal(loop.getZone(state, "e1").initialEncounterSpawned, true);
});

test("zona ripulita: chiamare di nuovo ensureInitialEncounter direttamente resta no-op", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  const enemyId = loop.enemiesInZone(state, "e1")[0].id;
  loop.getEnemy(state, enemyId).hp = 0; // zona ripulita
  assert.equal(loop.enemiesInZone(state, "e1").length, 0);

  // Rientra chiamando di nuovo ensureInitialEncounter direttamente (stessa
  // funzione richiamata da landPlayer/moveAction all'ingresso): deve restare
  // no-op perché initialEncounterSpawned è già true.
  loop.ensureInitialEncounter(state, "e1");
  assert.equal(loop.enemiesInZone(state, "e1").length, 0, "nessun respawn dopo la pulizia");
  assert.equal(loop.getZone(state, "e1").initialEncounterSpawned, true);
});

/* =========================================================================
   5. Zona configurata senza incontro -> resta senza nemici
   ========================================================================= */
test("una zona senza initialEncounter configurato resta senza nemici all'ingresso", () => {
  const zones = loop.createDefaultZoneLayout(); // nessuna zona ha initialEncounter
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 0);
  assert.equal(loop.getZone(state, "e1").initialEncounterSpawned, true, "il flag si marca comunque, per coerenza");
});

/* =========================================================================
   6. Due zone diverse -> incontri indipendenti
   ========================================================================= */
test("due zone diverse generano i propri incontri in modo indipendente", () => {
  const zones = loop.createDefaultZoneLayout();
  zones.find((z) => z.id === "e1").initialEncounter = [{ archetype: "normale" }];
  zones.find((z) => z.id === "e2").initialEncounter = [{ archetype: "normale" }, { archetype: "aggressivo" }];
  const state = loop.createGame({ players: makePlayers(2), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e2", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 1);
  assert.equal(loop.enemiesInZone(state, "e2").length, 2);
  assert.deepEqual(loop.enemiesInZone(state, "e2").map((e) => e.archetype).sort(), ["aggressivo", "normale"]);
});

/* =========================================================================
   7. Landing e movimento usano la stessa logica
   ========================================================================= */
test("il movimento genera l'incontro iniziale esattamente come l'atterraggio", () => {
  const zones = loop.createDefaultZoneLayout();
  zones.find((z) => z.id === "e2").initialEncounter = NORMAL_ONE;
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99); // e1 senza encounter configurato
  assert.equal(loop.enemiesInZone(state, "e2").length, 0, "e2 non ancora visitata");
  loop.moveAction(state, "p1", "e2", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e2").length, 1, "il movimento genera l'incontro come l'atterraggio");
});

/* =========================================================================
   8. Nemico generato -> getAvailableActions contiene "attacca"
   ========================================================================= */
test("dopo l'incontro iniziale, ATTACCA compare tra le azioni disponibili", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  const player = loop.getPlayer(state, "p1");
  const actions = director.getAvailableActions(state, player);
  assert.ok(actions.some((a) => a.id === "attacca"), "ATTACCA deve comparire con un nemico vivo nella zona");
});

/* =========================================================================
   9. Giocatori + nemico nella stessa zona -> Battlefield derivato
   ========================================================================= */
test("la zona con incontro iniziale e un giocatore attivo diventa un Campo di Battaglia", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  assert.equal(director.isBattlefield(state, "e1"), false, "prima dell'ingresso non è ancora un Campo");
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(director.isBattlefield(state, "e1"), true);
});

/* =========================================================================
   10. KO non altera il criterio isBattlefield già esistente
   ========================================================================= */
test("un giocatore KO non basta da solo a rendere la zona un Campo, anche con l'incontro iniziale già generato", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(director.isBattlefield(state, "e1"), true);
  loop.setPlayerKO(state, loop.getPlayer(state, "p1"));
  assert.equal(director.isBattlefield(state, "e1"), false, "stesso criterio di prima: KO non conta come membro attivo");
});

/* =========================================================================
   11. Boss activation/rinforzi non regrediscono
   ========================================================================= */
test("l'attivazione del Boss all'activationRound configurato resta invariata in presenza di incontri iniziali", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const bossConfig = { zoneId: "centro", activationRound: 3, hpPerPlayer: 10, phases: [{ threshold: 1, attackProfile: { baseDice: 1, power: 1, range: "medio", special: { type: "none" } } }] };
  const state = loop.createGame({ players: makePlayers(1), zones, bossConfig });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.beginExploration(state, () => 0.99);
  assert.equal(state.boss.active, false);
  loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); // round 2
  assert.equal(state.boss.active, false);
  loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); // round 3
  assert.equal(state.boss.active, true, "l'activationRound configurato resta rispettato");
});

test("i rinforzi continuano a funzionare, invariati, su una zona già popolata dall'incontro iniziale", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.beginExploration(state, () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 1);

  const zone = loop.getZone(state, "e1");
  zone.noiseTracker = { noise: 3, checked: false, disabled: false }; // sopra soglia, pronto al check
  loop.endRound(state, () => 6); // 6 è un tiro di successo per il rinforzo
  assert.equal(loop.enemiesInZone(state, "e1").length, 2, "il rinforzo si aggiunge come sempre, indipendente dall'incontro iniziale");
});

/* =========================================================================
   12. Nessun doppio spawn da chiamate ripetute
   ========================================================================= */
test("chiamate ripetute a ensureInitialEncounter non producono doppi spawn", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.ensureInitialEncounter(state, "e1");
  loop.ensureInitialEncounter(state, "e1");
  loop.ensureInitialEncounter(state, "e1");
  assert.equal(loop.enemiesInZone(state, "e1").length, 1, "una sola chiamata ha effetto, le altre sono no-op");
});

test("landPlayer + ensureInitialEncounter richiamato di nuovo non duplica l'incontro", () => {
  const zones = zonesWithEncounter("e1", NORMAL_ONE);
  const state = loop.createGame({ players: makePlayers(1), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  loop.landPlayer(state, "p1", "e1", () => 0.99); // spawna già qui
  loop.ensureInitialEncounter(state, "e1"); // chiamata ridondante
  assert.equal(loop.enemiesInZone(state, "e1").length, 1);
});
