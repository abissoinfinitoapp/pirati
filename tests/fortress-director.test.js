const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const loop = require("../engine/fortress-loop.js");
const director = require("../engine/fortress-director.js");

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
}

function makeBossConfig(overrides) {
  return Object.assign({
    hpPerPlayer: 50,
    summonEvery: 3,
    summonArchetype: "normale",
    phases: [
      { threshold: 1.0, attackProfile: { baseDice: 2, power: 4, range: "medio", special: { type: "none" } } }
    ]
  }, overrides);
}

function newGame(n, overrides) {
  const state = loop.createGame({ players: makePlayers(n), bossConfig: makeBossConfig(overrides) });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}

function landAll(state, zoneId) {
  state.players.forEach((p) => loop.landPlayer(state, p.id, zoneId, () => 0.99));
}

/* Avvia una partita già esplorativa, con il Director creato e il primo
   annuncio (round-start iniziale) già confermato: pronta al primo turno. */
function startGame(n, overrides) {
  const state = newGame(n, overrides);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const dir = director.createDirectorState(state);
  director.acknowledgeAnnouncement(state, dir);
  return { state, dir };
}

/* Gioca un round intero senza che nessun giocatore compia azioni (solo FINE
   TURNO) e senza nemici/boss da risolvere: usata solo per far avanzare i
   round e osservare gli annunci automatici (Tempesta, boss...). */
function playFullRoundNoActions(state, dir, rng) {
  const roll = rng || (() => 0.99);
  while (dir.pendingAnnouncements.length) director.acknowledgeAnnouncement(state, dir);
  while (dir.directorPhase === "player-turn") {
    const id = director.getCurrentPlayerId(state, dir);
    director.endPlayerTurn(state, dir, id);
  }
  if (dir.directorPhase === "end-of-round") {
    director.resolveEndOfRound(state, dir, roll);
  }
}

/* ---- ordine giocatori ---- */

test("ordine giocatori fisso: rispetta l'ordine con cui sono stati creati", () => {
  const { state, dir } = startGame(3);
  assert.deepEqual(dir.turnOrder, ["p1", "p2", "p3"]);
  assert.equal(director.getCurrentPlayerId(state, dir), "p1");
});

test("un giocatore KO viene saltato automaticamente nel turno", () => {
  const { state, dir } = startGame(3);
  loop.getPlayer(state, "p2").status = "ko";
  director.endPlayerTurn(state, dir, "p1");
  assert.equal(director.getCurrentPlayerId(state, dir), "p3", "p2 è KO: si passa direttamente a p3");
});

test("un giocatore eliminato viene saltato automaticamente nel turno", () => {
  const { state, dir } = startGame(3);
  loop.getPlayer(state, "p2").status = "eliminated";
  director.endPlayerTurn(state, dir, "p1");
  assert.equal(director.getCurrentPlayerId(state, dir), "p3");
});

/* ---- fine turno ---- */

test("FINE TURNO può essere premuto senza essersi mosso né aver agito", () => {
  const { state, dir } = startGame(2);
  const p1 = loop.getPlayer(state, "p1");
  assert.equal(p1.movedThisRound, false);
  assert.equal(p1.actedThisRound, false);
  assert.doesNotThrow(() => director.endPlayerTurn(state, dir, "p1"));
  assert.equal(director.getCurrentPlayerId(state, dir), "p2");
});

test("il Director impedisce di agire per un giocatore diverso da quello di turno", () => {
  const { state, dir } = startGame(2);
  assert.throws(() => director.performMove(state, dir, "p2", "e2"));
  assert.throws(() => director.endPlayerTurn(state, dir, "p2"));
  assert.doesNotThrow(() => director.performMove(state, dir, "p1", "e2"));
});

/* ---- azioni contestuali ---- */

test("RIANIMA compare solo se un compagno KO è nella stessa zona", () => {
  const { state } = startGame(2);
  const p1 = loop.getPlayer(state, "p1");
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "rianima"), false);

  loop.getPlayer(state, "p2").status = "ko";
  const actions = director.getAvailableActions(state, p1);
  assert.equal(actions.some((a) => a.id === "rianima"), true);
  assert.equal(actions[0].id, "rianima", "RIANIMA deve comparire in evidenza, come prima azione");
});

test("ATTACCA compare solo se ci sono nemici (o il boss) nella zona", () => {
  const { state } = startGame(1);
  const p1 = loop.getPlayer(state, "p1");
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "attacca"), false);

  loop.spawnEnemy(state, "normale", "e1");
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "attacca"), true);
});

test("ATTACCA compare anche quando solo il boss è presente nella zona (nessun nemico)", () => {
  const { state } = startGame(1);
  loop.activateBoss(state);
  const p1 = loop.getPlayer(state, "p1");
  p1.zoneId = "centro";
  assert.equal(state.enemies.length, 0);
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "attacca"), true);
});

test("APRI CASSA compare solo se la zona ha una cassa non aperta (costruita manualmente nel test)", () => {
  const { state } = startGame(1);
  const p1 = loop.getPlayer(state, "p1");
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "apri_cassa"), false);

  loop.getZone(state, "e1").chests = [{ id: "c1", opened: false }];
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "apri_cassa"), true);

  loop.getZone(state, "e1").chests[0].opened = true;
  assert.equal(director.getAvailableActions(state, p1).some((a) => a.id === "apri_cassa"), false);
});

test("FINE TURNO è sempre presente, in coda", () => {
  const { state } = startGame(1);
  const actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.equal(actions[actions.length - 1].id, "fine_turno");
});

/* ---- loot da movimento ---- */

test("performMove attiva il loot ambientale al primo ingresso in una zona", () => {
  const { state, dir } = startGame(1);
  const outcome = director.performMove(state, dir, "p1", "e2", () => 0.1);
  assert.ok(outcome.lootFound);
});

/* ---- annunci: Tempesta e rischio danno ---- */

test("annuncio Tempesta 'warning' generato automaticamente all'inizio del round 4", () => {
  const { state, dir } = startGame(1);
  while (state.round < 4) playFullRoundNoActions(state, dir);
  assert.equal(state.round, 4);
  const warning = dir.pendingAnnouncements.find((a) => a.type === "storm-warning");
  assert.ok(warning, "deve esserci un annuncio di allerta Tempesta per le zone esterne al round 4");
});

test("avviso di rischio danno Tempesta: solo se la zona è davvero in Tempesta in questo round", () => {
  const { state } = startGame(1);
  const p1 = loop.getPlayer(state, "p1");
  assert.equal(director.getStormRisk(state, p1).atRisk, false);

  loop.getZone(state, "e1").stormState = "storm";
  state.round = 5; // STORM_DAMAGE[5] = 3
  const risk = director.getStormRisk(state, p1);
  assert.equal(risk.atRisk, true);
  assert.equal(risk.damage, 3);
});

/* ---- coda annunci FIFO ---- */

test("gli annunci sono una coda FIFO: uno alla volta, nessuno sovrascrive l'altro", () => {
  const { state, dir } = startGame(1);
  dir.pendingAnnouncements.push({ type: "boss-activated", payload: {} });
  dir.pendingAnnouncements.push({ type: "ko", payload: { playerName: "Anna" } });
  assert.equal(dir.pendingAnnouncements.length, 2, "entrambi gli eventi devono restare in coda, nessuno sovrascrive l'altro");

  director.acknowledgeAnnouncement(state, dir); // rimuove "boss-activated" (il primo)
  assert.equal(dir.pendingAnnouncements.length, 1);
  assert.equal(dir.pendingAnnouncements[0].type, "ko", "il secondo annuncio resta visibile dopo aver confermato il primo");

  director.acknowledgeAnnouncement(state, dir); // rimuove "ko"
  assert.equal(dir.pendingAnnouncements.length, 0);
});

/* =========================================================================
   DADI FISICI — nessuna generazione automatica durante una partita reale.
   ========================================================================= */

test("anteprima: il numero di dadi mostrato è quello reale per 1, 2 e 3 dadi", () => {
  const { state } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "medio";

  const w1 = { baseDice: 1, range: "vicino", power: 1, special: { type: "none" } }; // vicino vs medio -> mod 0 -> 1 dado
  assert.equal(director.buildAttackPreview(state, "p1", enemyId, w1).diceCount, 1);

  const w2 = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } }; // medio vs medio -> mod +1 -> 2 dadi
  assert.equal(director.buildAttackPreview(state, "p1", enemyId, w2).diceCount, 2);

  state.pendingAiuto.p1 = true;
  const w3 = { baseDice: 2, range: "medio", power: 1, special: { type: "none" } }; // 2 base +1 ideale +1 aiuto = 4 -> clamp 3
  assert.equal(director.buildAttackPreview(state, "p1", enemyId, w3).diceCount, 3);
});

test("submitRoll con un input fisico corretto risolve l'attacco (nessun calcolo del Director)", () => {
  const { state, dir } = startGame(1);
  loop.getZone(state, "e1").encounterRange = "medio";
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const weapon = { baseDice: 1, range: "medio", power: 2, special: { type: "none" } }; // 2 dadi

  const begin = director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  assert.equal(begin.diceCount, 2);

  const outcome = director.submitRoll(state, dir, [5, 4]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.result.total, 11); // 5 + 4 + power(2), MAI la POTENZA
});

test("submitRoll rifiuta un numero di risultati diverso da diceCount", () => {
  const { state, dir } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "medio";
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } }; // 2 dadi
  director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  assert.throws(() => director.submitRoll(state, dir, [5]));
  assert.throws(() => director.submitRoll(state, dir, [5, 4, 3]));
  // il tiro resta in attesa: un input rifiutato non deve far perdere lo stato
  assert.ok(dir.awaitingRoll);
  assert.doesNotThrow(() => director.submitRoll(state, dir, [5, 4]));
});

test("submitRoll rifiuta un risultato dado pari a 0", () => {
  const { state, dir } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "medio";
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  assert.throws(() => director.submitRoll(state, dir, [0, 4]));
});

test("submitRoll rifiuta un risultato dado pari a 7", () => {
  const { state, dir } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "medio";
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  assert.throws(() => director.submitRoll(state, dir, [7, 4]));
});

test("un 6 fisico attiva il critico (vale 12), nessun tiro digitale aggiuntivo", () => {
  const { state, dir } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "lontano";
  const weapon = { baseDice: 1, range: "lontano", power: 1, special: { type: "critOnSix" } }; // ideale -> 1+1=2 dadi
  const begin = director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  assert.equal(begin.diceCount, 2);

  const outcome = director.submitRoll(state, dir, [6, 3]);
  assert.equal(outcome.status, "resolved");
  assert.deepEqual(outcome.result.rolls, [12, 3], "il 6 fisico diventa 12, per la regola già esistente");
  assert.equal(outcome.result.total, 12 + 3 + 1);
});

test("rerollOnes: un 1 fisico richiede un ritiro fisico, nessuna generazione automatica", () => {
  const { state, dir } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "vicino";
  const weapon = { baseDice: 2, range: "vicino", power: 1, special: { type: "rerollOnes" } }; // ideale -> 2+1=3 dadi
  const begin = director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  assert.equal(begin.diceCount, 3);

  const first = director.submitRoll(state, dir, [1, 5, 3]);
  assert.equal(first.status, "needs-reroll", "l'app non genera mai il nuovo valore da sola");
  assert.deepEqual(first.rerollIndices, [0]);
  assert.equal(dir.awaitingRoll.pendingRerollIndices.length, 1);

  const done = director.submitReroll(state, dir, [4]);
  assert.equal(done.status, "resolved");
  assert.deepEqual(done.result.rolls, [4, 5, 3]);
  assert.equal(done.result.total, 4 + 5 + 3 + 1);
});

test("rerollOnes: se il ritiro fisico è ancora 1, resta 1 — nessun secondo ritiro", () => {
  const { state, dir } = startGame(1);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "vicino";
  const weapon = { baseDice: 2, range: "vicino", power: 1, special: { type: "rerollOnes" } };
  director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
  director.submitRoll(state, dir, [1, 5, 3]);
  const done = director.submitReroll(state, dir, [1]);
  assert.equal(done.status, "resolved");
  assert.deepEqual(done.result.rolls, [1, 5, 3], "il secondo 1 resta: nessun ulteriore ritiro");
});

test("attacco nemico da risultati fisici: nessun dado generato dall'app", () => {
  const { state, dir } = startGame(1);
  loop.getZone(state, "e1").encounterRange = "medio";
  loop.spawnEnemy(state, "normale", "e1");
  director.endPlayerTurn(state, dir, "p1");
  assert.equal(dir.directorPhase, "enemy-phase");

  const begin = director.beginEnemyRollStep(state, dir);
  assert.equal(begin.type, "awaiting-roll");
  assert.equal(begin.diceCount, 2); // normale: baseDice 1, medio ideale +1

  const outcome = director.submitRoll(state, dir, [3, 3]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.result.total, 8); // 3+3+power(2)
});

test("attacco boss da risultati fisici: nessun dado generato dall'app", () => {
  const { state, dir } = startGame(1);
  loop.activateBoss(state);
  state.players[0].zoneId = "centro";
  director.endPlayerTurn(state, dir, "p1");
  assert.equal(dir.directorPhase, "boss-phase");

  const begin = director.beginBossRollStep(state, dir);
  assert.equal(begin.type, "awaiting-roll");
  assert.equal(begin.diceCount, 2); // arma boss medio vs scontro vicino -> mod 0 -> baseDice invariato

  const outcome = director.submitRoll(state, dir, [4, 4]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.result.total, 12); // 4+4+power(4)
  assert.equal(dir.directorPhase, "end-of-round");
});

test("attacco giocatore contro il boss: stesso motore, Scudo e dadi fisici di un nemico normale", () => {
  const { state, dir } = startGame(1);
  loop.activateBoss(state);
  state.boss.shield = 5;
  state.players[0].zoneId = "centro"; // encounterRange "vicino" (default del type "citta")
  const weapon = { baseDice: 2, range: "lontano", power: 1, special: { type: "ignoreShield", n: 1 } };

  const preview = director.buildBossAttackPreview(state, "p1", weapon);
  assert.equal(preview.diceCount, 1); // lontano vs vicino: estremi opposti -> mod -1 -> 2-1=1 dado

  const begin = director.beginPlayerAttackOnBoss(state, dir, "p1", weapon);
  assert.equal(begin.diceCount, 1);

  const outcome = director.submitRoll(state, dir, [5]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.result.total, 6); // 5 + power(1)
  assert.equal(state.boss.hp, state.boss.maxHp - 1, "1 danno ignora lo Scudo");
  assert.equal(state.boss.shield, 0, "i restanti 5 danni sono assorbiti dallo Scudo residuo");
});

test("stessi risultati fisici producono sempre lo stesso risultato (determinismo)", () => {
  function run() {
    const state = newGame(1);
    landAll(state, "e1");
    loop.beginExploration(state, () => 0.99);
    const dir = director.createDirectorState(state);
    director.acknowledgeAnnouncement(state, dir);
    loop.getZone(state, "e1").encounterRange = "medio";
    const enemyId = loop.spawnEnemy(state, "normale", "e1");
    const weapon = { baseDice: 1, range: "medio", power: 2, special: { type: "critOnSix" } };
    director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, weapon);
    return director.submitRoll(state, dir, [6, 4]);
  }
  const a = run();
  const b = run();
  assert.deepEqual(a.result.rolls, b.result.rolls);
  assert.equal(a.result.total, b.result.total);
  assert.equal(a.result.total, 12 + 4 + 2);
});

/* ---- il Director non tocca mai gameState direttamente ---- */

test("il Director non assegna mai direttamente campi di gameState: ogni mutazione passa da una funzione del loop", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "engine", "fortress-director.js"), "utf8");
  const forbidden = /\b(player|target|enemy|boss|zone)\.(hp|shield|status|zoneId|movedThisRound|actedThisRound)\s*=(?!=)/;
  assert.equal(forbidden.test(source), false, "trovata una scrittura diretta su un campo di gameState nel Director");
});
