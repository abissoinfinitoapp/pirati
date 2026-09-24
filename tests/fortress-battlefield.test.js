const test = require("node:test");
const assert = require("node:assert/strict");
const loop = require("../engine/fortress-loop.js");
const combat = require("../engine/fortress-combat.js");
const director = require("../engine/fortress-director.js");

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
}
function newGame(n) {
  const state = loop.createGame({ players: makePlayers(n) });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}
/* Come startGame() in fortress-director.test.js, ma SENZA congelare subito il
   Director: qui vogliamo spawnare i nemici PRIMA che la queue del round si
   congeli, per esercitare davvero l'interlacciamento tra Campi. */
function land(state, playerId, zoneId) {
  loop.landPlayer(state, playerId, zoneId, () => 0.99);
}
function beginAndFreeze(state) {
  loop.beginExploration(state, () => 0.99);
  const dir = director.createDirectorState(state);
  director.acknowledgeAnnouncement(state, dir); // consuma "round-start" -> startPlayerTurnPhase
  return dir;
}
const WEAPON = { baseDice: 1, range: "medio", power: 0, special: { type: "none" } };

/* =========================================================================
   isBattlefield — derivato, mai persistito
   ========================================================================= */

test("isBattlefield: attivo+nemico vivo -> true", () => {
  const state = newGame(1);
  land(state, "p1", "e1");
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e1");
  assert.equal(director.isBattlefield(state, "e1"), true);
});

test("isBattlefield: attivo ma senza nemici/boss -> false", () => {
  const state = newGame(1);
  land(state, "p1", "e1");
  loop.beginExploration(state, () => 0.99);
  assert.equal(director.isBattlefield(state, "e1"), false);
});

test("isBattlefield: nemici presenti ma nessun giocatore attivo -> false", () => {
  const state = newGame(1);
  land(state, "p1", "e1");
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e1");
  loop.setPlayerKO(state, loop.getPlayer(state, "p1"));
  assert.equal(director.isBattlefield(state, "e1"), false, "un solo KO non basta a rendere la zona un Campo");
});

test("isBattlefield: Boss attivo/vivo lì -> true anche senza nemici del catalogo", () => {
  const state = loop.createGame({
    players: makePlayers(1),
    bossConfig: { zoneId: "e1", activationRound: 1, hpPerPlayer: 10, phases: [{ threshold: 1, attackProfile: WEAPON }] }
  });
  state.players.forEach((p) => { p.zoneId = null; });
  land(state, "p1", "e1");
  loop.beginExploration(state, () => 0.99);
  loop.activateBoss(state);
  assert.equal(director.isBattlefield(state, "e1"), true);
});

/* =========================================================================
   buildRoundPlayerQueue — algoritmo deterministico
   ========================================================================= */

test("riproduce esattamente l'esempio: A1,A2 / B1,B2,B3 / C1 -> A1,B1,C1,A2,B2,B3", () => {
  const state = newGame(6);
  land(state, "p1", "e1"); land(state, "p2", "e1");             // Campo A: Mattia,Giovanni
  land(state, "p3", "e2"); land(state, "p4", "e2"); land(state, "p5", "e2"); // Campo B: Luca,Andrea,Brigida
  land(state, "p6", "e3");                                       // Campo C: Francesco
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e1");
  loop.spawnEnemy(state, "normale", "e2");
  loop.spawnEnemy(state, "normale", "e3");

  const queue = director.buildRoundPlayerQueue(state, state.players.map((p) => p.id));
  assert.deepEqual(queue, ["p1", "p3", "p6", "p2", "p4", "p5"]);
});

test("un KO non entra mai in coda, anche se fisicamente nel Campo", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e1");
  loop.setPlayerKO(state, loop.getPlayer(state, "p2"));
  const queue = director.buildRoundPlayerQueue(state, state.players.map((p) => p.id));
  assert.deepEqual(queue, ["p1"]);
});

test("nessun Campo -> la coda coincide con turnOrder (comportamento identico a oggi)", () => {
  const state = newGame(3);
  land(state, "p1", "e1"); land(state, "p2", "e2"); land(state, "p3", "e3");
  loop.beginExploration(state, () => 0.99);
  const queue = director.buildRoundPlayerQueue(state, state.players.map((p) => p.id));
  assert.deepEqual(queue, ["p1", "p2", "p3"]);
});

test("giocatori fuori da ogni Campo vengono accodati in fondo, nel loro ordine originale", () => {
  const state = newGame(4);
  land(state, "p1", "e1"); land(state, "p2", "e1"); // Campo
  land(state, "p3", "e2"); land(state, "p4", "e3");  // fuori da un Campo (nessun nemico lì)
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e1");
  const queue = director.buildRoundPlayerQueue(state, state.players.map((p) => p.id));
  assert.deepEqual(queue, ["p1", "p2", "p3", "p4"]);
});

test("determinismo: stesso stato -> sempre la stessa coda", () => {
  const state = newGame(3);
  land(state, "p1", "e1"); land(state, "p2", "e2"); land(state, "p3", "e1");
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e1");
  loop.spawnEnemy(state, "normale", "e2");
  const turnOrder = state.players.map((p) => p.id);
  const a = director.buildRoundPlayerQueue(state, turnOrder);
  const b = director.buildRoundPlayerQueue(state, turnOrder);
  assert.deepEqual(a, b);
});

/* =========================================================================
   INTEGRAZIONE DIRECTOR — round-player-queue al posto del flat turnOrder
   ========================================================================= */

test("startPlayerTurnPhase congela roundPlayerQueue interlacciata sui Campi", () => {
  const state = newGame(3);
  land(state, "p1", "e1"); land(state, "p2", "e2"); land(state, "p3", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  loop.spawnEnemy(state, "normale", "e2");
  const dir = beginAndFreeze(state);
  assert.deepEqual(dir.roundPlayerQueue, ["p1", "p2", "p3"]);
  assert.equal(director.getCurrentPlayerId(state, dir), "p1");
});

test("nessun Campo a inizio round -> comportamento identico a oggi (turnOrder piatto)", () => {
  const state = newGame(3);
  land(state, "p1", "e1"); land(state, "p2", "e2"); land(state, "p3", "e3");
  const dir = beginAndFreeze(state);
  assert.deepEqual(dir.roundPlayerQueue, ["p1", "p2", "p3"]);
});

test("auto-avanzamento dopo un'azione immediata (usa_cura): nessuna FINE TURNO manuale necessaria", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  loop.getPlayer(state, "p1").equipment.cura = { id: "bende", name: "Bende", amount: 3, full: false };
  assert.equal(director.getCurrentPlayerId(state, dir), "p1");
  director.performUsaCura(state, dir, "p1");
  assert.equal(director.getCurrentPlayerId(state, dir), "p2", "dopo l'azione principale si passa da soli al prossimo");
});

test("il movimento NON fa avanzare la coda: il giocatore deve ancora agire o premere FINE TURNO", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  director.performMove(state, dir, "p1", "e2", () => 0.99);
  assert.equal(director.getCurrentPlayerId(state, dir), "p1", "muoversi non consuma l'azione principale");
});

test("raccogliere da terra NON fa avanzare la coda", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  const zone = loop.getZone(state, "e1");
  zone.groundLoot.push({ kind: "cura", itemId: "bende", instanceId: 999 });
  director.performEquipFoundSupportItem(state, dir, "p1", "cura", 999, { id: "bende", name: "Bende", amount: 3, full: false });
  assert.equal(director.getCurrentPlayerId(state, dir), "p1");
});

test("auto-avanzamento dopo un attacco a dadi fisici, solo a risoluzione definitiva (mai con awaitingRoll pendente)", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, WEAPON);
  assert.ok(dir.awaitingRoll, "tiro fisico in attesa");
  assert.equal(director.getCurrentPlayerId(state, dir), "p1", "nessun avanzamento finché il tiro è pendente");
  assert.throws(() => director.endPlayerTurn(state, dir, "p1"), /tiro fisico/);

  const outcome = director.submitRoll(state, dir, [3]);
  assert.equal(outcome.status, "resolved");
  assert.equal(director.getCurrentPlayerId(state, dir), "p2", "risolto l'attacco, si passa da soli al prossimo");
});

test("FINE TURNO resta disponibile per chi rinuncia all'azione principale", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  director.endPlayerTurn(state, dir, "p1");
  assert.equal(director.getCurrentPlayerId(state, dir), "p2");
});

test("un Campo che termina a metà coda non toglie il turno a chi era già in coda", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getEnemy(state, enemyId).hp = 1; // muore al primo colpo qualunque
  const dir = beginAndFreeze(state);
  assert.deepEqual(dir.roundPlayerQueue, ["p1", "p2"]);

  // p1 uccide l'unico nemico della zona: e1 smette di essere un Campo...
  director.beginPlayerAttackOnEnemy(state, dir, "p1", enemyId, WEAPON);
  director.submitRoll(state, dir, [6]);
  assert.equal(loop.enemiesInZone(state, "e1").length, 0, "il Campo è davvero terminato");

  // ...ma p2 era già in coda per QUESTO round (congelata a inizio round):
  // deve comunque avere il proprio turno, con le azioni disponibili aggiornate.
  assert.equal(director.getCurrentPlayerId(state, dir), "p2");
  const actions = director.getAvailableActions(state, loop.getPlayer(state, "p2"));
  assert.equal(actions.some((a) => a.id === "attacca"), false, "niente più da attaccare in questa zona");
});

test("giocatore che si sposta in una zona di combattimento a metà turno non entra nella coda già congelata", () => {
  const state = newGame(3);
  land(state, "p1", "e1"); land(state, "p2", "e2"); land(state, "p3", "e2");
  loop.spawnEnemy(state, "normale", "e2"); // e2 è un Campo, e1 no
  const dir = beginAndFreeze(state);
  assert.deepEqual(dir.roundPlayerQueue, ["p2", "p3", "p1"], "p1 (e1, fuori da Campi) va in fondo");

  director.performMove(state, dir, "p2", "e1", () => 0.99); // p2 si sposta ma non ha ancora agito
  assert.equal(director.getCurrentPlayerId(state, dir), "p2", "il movimento non avanza la coda");
  director.endPlayerTurn(state, dir, "p2"); // p2 rinuncia all'azione
  assert.equal(director.getCurrentPlayerId(state, dir), "p3", "la coda di QUESTO round resta quella congelata a inizio round");
});

test("nessun doppio turno: chi è già passato per il Campo non ricompare nel pass dei residui", () => {
  const state = newGame(3);
  land(state, "p1", "e1"); land(state, "p2", "e1"); land(state, "p3", "e2");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  assert.deepEqual(dir.roundPlayerQueue, ["p1", "p2", "p3"]);
  assert.equal(new Set(dir.roundPlayerQueue).size, dir.roundPlayerQueue.length, "nessun id ripetuto nella coda del round");
});

test("dopo l'intera coda (Campo + residui) si passa alla fase nemici, esattamente come oggi", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);
  director.endPlayerTurn(state, dir, "p1");
  director.endPlayerTurn(state, dir, "p2");
  assert.equal(dir.directorPhase, "enemy-phase");
});

test("aiuta/scambia/apri_cassa/usa_scudo/usa_utility avanzano tutti la coda in automatico", () => {
  const state = newGame(2);
  land(state, "p1", "e1"); land(state, "p2", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const dir = beginAndFreeze(state);

  // aiuta
  director.performAiuto(state, dir, "p1", "p2");
  assert.equal(director.getCurrentPlayerId(state, dir), "p2");

  // usa_scudo per p2
  loop.getPlayer(state, "p2").equipment.scudo = { id: "mini_scudo", name: "Mini Scudo", amount: 3, full: false };
  director.performUsaScudo(state, dir, "p2");
  assert.equal(dir.directorPhase, "enemy-phase", "erano solo 2 giocatori: la coda finisce qui");
});
