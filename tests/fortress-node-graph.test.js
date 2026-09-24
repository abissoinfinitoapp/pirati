const test = require("node:test");
const assert = require("node:assert/strict");
const loop = require("../engine/fortress-loop.js");
const director = require("../engine/fortress-director.js");
const combat = require("../engine/fortress-combat.js");
const zonesApi = require("../catalog/fortress-zones.js");

/* Zone Magnify V1 — Node Graph SOLO su Forest (catalogo reale, mai una mappa
   sintetica per i test "veri": vogliamo esercitare esattamente i dati che il
   gioco userà). Le 8 zone senza nodes[] restano invariate rispetto a 2f637b8
   e sono testate con loop.createDefaultZoneLayout() (nessuna zona lì ha nodi:
   fallback legacy naturale). */

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
}
function newForestGame(n) {
  const zones = zonesApi.buildLoopZones(combat);
  const state = loop.createGame({ players: makePlayers(n), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}
function newLegacyGame(n, encounterOnE1) {
  const zones = loop.createDefaultZoneLayout();
  if (encounterOnE1) zones.find((z) => z.id === "e1").initialEncounter = [{ archetype: "normale" }];
  const state = loop.createGame({ players: makePlayers(n), zones });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}
/* Round successivo semplificato per i soli fini del movimento a nodi: il
   round vero passa da startRound, ma qui basta riaprire il budget movimento
   (stesso shortcut già usato altrove nella suite, es. fortress-battlefield). */
function resetMove(state, playerId) { loop.getPlayer(state, playerId).movedThisRound = false; }

/* =========================================================================
   1-2. Landing su Forest: entry node, nessuno spawn automatico
   ========================================================================= */
test("Forest: l'atterraggio posiziona nodeId sull'entryNodeId della zona", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const zone = loop.getZone(state, "forest");
  assert.equal(loop.getPlayer(state, "p1").nodeId, zone.entryNodeId);
  assert.equal(zone.entryNodeId, "forest-n01");
});

test("Forest: l'entry node non contiene un Encounter -> nessuno spawn automatico all'atterraggio", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "forest").length, 0);
});

/* =========================================================================
   3. Zona legacy continua a usare ensureInitialEncounter
   ========================================================================= */
test("zona legacy (senza nodes[]) continua a generare l'incontro zona-level come nel commit precedente", () => {
  const state = newLegacyGame(1, true);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(loop.enemiesInZone(state, "e1").length, 1);
  assert.equal(loop.getPlayer(state, "p1").nodeId, null, "nodeId resta null fuori dal Node Graph");
  assert.equal(loop.getZone(state, "e1").initialEncounterSpawned, true);
});

/* =========================================================================
   4-6. Movimento a nodi: direzione valida, assente, target inesistente
   ========================================================================= */
test("moveToNode: direzione valida sposta sul nodo collegato", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  assert.equal(loop.getPlayer(state, "p1").nodeId, "forest-n02");
});

test("moveToNode: direzione assente (nessun collegamento) viene rifiutata", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99); // su forest-n01: solo 'right' esiste
  assert.throws(() => loop.moveToNode(state, "p1", "left"), /collegamento/);
  assert.throws(() => loop.moveToNode(state, "p1", "up"), /collegamento/);
});

test("moveToNode: un nodo di destinazione inesistente viene rifiutato", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const zone = loop.getZone(state, "forest");
  // zone.nodes referenzia i dati statici del catalogo (require in cache,
  // condiviso tra tutti i test del processo): clonare qui PRIMA di corrompere
  // evita di mutare il catalogo reale per il resto della suite. Vogliamo
  // esercitare solo il ramo di rifiuto di moveToNode.
  zone.nodes = zone.nodes.map((n) => Object.assign({}, n, { connections: Object.assign({}, n.connections) }));
  const n01 = zone.nodes.find((n) => n.id === "forest-n01");
  n01.connections.right = "forest-nXX";
  assert.throws(() => loop.moveToNode(state, "p1", "right"), /destinazione inesistente/);
});

/* =========================================================================
   7-8. movedThisRound condiviso; movimento + azione principale indipendenti
   ========================================================================= */
test("moveToNode consuma movedThisRound: un secondo movimento nello stesso round è rifiutato", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  assert.throws(() => loop.moveToNode(state, "p1", "left"), /Movimento già usato/);
});

test("muoversi e poi compiere l'azione principale nello stesso round sono entrambi validi", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right"); // su forest-n02
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down");  // su forest-n04 (Encounter)
  assert.throws(() => loop.moveToNode(state, "p1", "up"), /Movimento già usato/, "un solo movimento per round");
  const enemyId = loop.enemiesInZone(state, "forest")[0].id;
  const outcome = loop.attackEnemyAction(state, "p1", enemyId, { baseDice: 1, range: "medio", power: 1, special: { type: "none" } }, () => 0.99);
  assert.ok(outcome, "l'azione principale resta disponibile dopo essersi mossi");
  assert.equal(loop.getPlayer(state, "p1").actedThisRound, true);
});

/* =========================================================================
   9-10. Encounter: spawn una volta, nessun respawn dopo la pulizia
   ========================================================================= */
test("arrivo sul nodo Encounter genera i nemici una sola volta", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  assert.equal(loop.enemiesInZone(state, "forest").length, 0);
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down"); // forest-n04, Encounter
  assert.equal(loop.enemiesInZone(state, "forest").length, 1);
  assert.equal(loop.getZone(state, "forest").nodeStates["forest-n04"].encounterSpawned, true);
});

test("tornare su un Encounter già ripulito non lo rigenera", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down"); // Encounter generato
  const enemyId = loop.enemiesInZone(state, "forest")[0].id;
  loop.getEnemy(state, enemyId).hp = 0; // ripulito
  assert.equal(loop.enemiesInZone(state, "forest").length, 0);

  // p2 raggiunge lo stesso nodo (round successivi)
  loop.moveToNode(state, "p2", "right");
  resetMove(state, "p2");
  loop.moveToNode(state, "p2", "down");
  assert.equal(loop.enemiesInZone(state, "forest").length, 0, "nessun respawn");
});

/* =========================================================================
   11-12. Enemy.nodeId, enemiesAtNode
   ========================================================================= */
test("il nemico generato dall'Encounter riceve zoneId e nodeId", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down");
  const enemy = loop.enemiesInZone(state, "forest")[0];
  assert.equal(enemy.zoneId, "forest");
  assert.equal(enemy.nodeId, "forest-n04");
});

test("enemiesAtNode filtra per nodo, enemiesInZone resta a livello zona", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down");
  assert.equal(loop.enemiesAtNode(state, "forest", "forest-n04").length, 1);
  assert.equal(loop.enemiesAtNode(state, "forest", "forest-n02").length, 0);
  assert.equal(loop.enemiesInZone(state, "forest").length, 1);
});

/* =========================================================================
   13. ATTACCA solo sullo stesso nodo
   ========================================================================= */
test("ATTACCA compare solo per il giocatore sul nodo dell'Encounter, non per un compagno altrove in Forest", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down"); // p1 sul nodo Encounter
  const p1Actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  const p2Actions = director.getAvailableActions(state, loop.getPlayer(state, "p2")); // p2 ancora su forest-n01
  assert.ok(p1Actions.some((a) => a.id === "attacca"));
  assert.ok(!p2Actions.some((a) => a.id === "attacca"), "p2 non è sul nodo del nemico");
});

/* =========================================================================
   14. Battlefield resta zone-level
   ========================================================================= */
test("isBattlefield resta zoneId-level: vero per l'intera Forest, non solo per il nodo dell'Encounter", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  assert.equal(director.isBattlefield(state, "forest"), false, "nessun nemico ancora generato");
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down");
  assert.equal(director.isBattlefield(state, "forest"), true, "Campo di zona, anche se p2 è su un nodo diverso");
});

/* =========================================================================
   15-17. Chest slot, APRI CASSA node-local, groundLoot con nodeId
   ========================================================================= */
test("la cassa runtime generata da loot.setupChests riceve il nodeId dello chestSlot", () => {
  const state = newForestGame(2);
  const zone = loop.getZone(state, "forest");
  assert.equal(zone.chests.length, 1, "Forest (lootTier basso) produce sempre 1 cassa");
  assert.equal(zone.chests[0].nodeId, "forest-n03");
});

test("APRI CASSA compare solo sul nodo che contiene quella cassa", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  let actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(!actions.some((a) => a.id === "apri_cassa"), "non sul nodo entry");
  loop.moveToNode(state, "p1", "right");
  actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(!actions.some((a) => a.id === "apri_cassa"), "non sul nodo bivio");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "up"); // forest-n03, la cassa
  actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(actions.some((a) => a.id === "apri_cassa"), "ora sì");
});

test("apriCassaAction rifiuta l'apertura da un nodo diverso da quello della cassa", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  const chestId = loop.getZone(state, "forest").chests[0].id;
  assert.throws(() => loop.apriCassaAction(state, "p1", chestId, () => 0.1), /raggiungibile/);
});

test("il groundLoot prodotto dalla cassa conserva il nodeId della cassa", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "up"); // nodo cassa
  const chestId = loop.getZone(state, "forest").chests[0].id;
  const found = loop.apriCassaAction(state, "p1", chestId, () => 0.1);
  assert.equal(found.weapon.nodeId, "forest-n03");
  assert.equal(found.support.nodeId, "forest-n03");
});

/* =========================================================================
   18. Raccolta loot solo dallo stesso nodo
   ========================================================================= */
test("raccogliere il loot della cassa richiede di essere sullo stesso nodo", () => {
  const state = newForestGame(1);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "up"); // nodo cassa
  const chestId = loop.getZone(state, "forest").chests[0].id;
  const found = loop.apriCassaAction(state, "p1", chestId, () => 0.1);

  // p1 si allontana e prova a raccogliere lo stesso oggetto da un altro nodo:
  // deve fallire (raccogliere non consuma l'azione principale, ma richiede
  // comunque di essere fisicamente lì).
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down"); // via dal nodo cassa
  assert.throws(
    () => loop.equipFoundWeapon(state, "p1", "primary", found.weapon.instanceId, { id: found.weapon.weaponId, name: "x" }),
    /non trovata a terra/
  );
});

/* =========================================================================
   19. RIANIMA/SCAMBIA/AIUTA solo stesso nodo in Forest
   ========================================================================= */
test("AIUTA e SCAMBIA compaiono solo verso un compagno sullo stesso nodo in Forest", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right"); // p1 su n02, p2 resta su n01
  let actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(!actions.some((a) => a.id === "aiuta" || a.id === "scambia"), "p2 non è più sullo stesso nodo");

  loop.moveToNode(state, "p2", "right"); // p2 raggiunge p1 su n02
  actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(actions.some((a) => a.id === "aiuta"));
  assert.ok(actions.some((a) => a.id === "scambia"));
});

test("RIANIMA compare solo se il compagno KO è sullo stesso nodo in Forest", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.setPlayerKO(state, loop.getPlayer(state, "p2")); // KO su forest-n01
  loop.moveToNode(state, "p1", "right"); // p1 lascia n01
  const actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(!actions.some((a) => a.id === "rianima"));
});

/* =========================================================================
   20. Comportamento legacy invariato nelle altre zone
   ========================================================================= */
test("una zona legacy (senza nodes[]) mostra ancora RIANIMA/AIUTA/SCAMBIA/ATTACCA a livello di zona intera", () => {
  const state = newLegacyGame(2, true);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e1", () => 0.99);
  const actions = director.getAvailableActions(state, loop.getPlayer(state, "p1"));
  assert.ok(actions.some((a) => a.id === "attacca"));
  assert.ok(actions.some((a) => a.id === "aiuta"));
  assert.ok(actions.some((a) => a.id === "scambia"));
});

/* =========================================================================
   21. Nessun doppio spawn del vecchio initialEncounter su Forest
   ========================================================================= */
test("Forest (migrata) non innesca mai più ensureInitialEncounter zona-level: nessun doppio spawn", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  assert.equal(loop.getZone(state, "forest").initialEncounterSpawned, false, "il percorso legacy non viene mai eseguito su Forest");
  loop.moveToNode(state, "p1", "right");
  resetMove(state, "p1");
  loop.moveToNode(state, "p1", "down");
  assert.equal(loop.enemiesInZone(state, "forest").length, 1, "un solo gruppo, generato una sola volta");
});

/* =========================================================================
   22. Testo informativo "Situazione": sameNode distingue vicinanza reale
   nelle zone col Node Graph, senza toccare Party/Director/azioni.
   ========================================================================= */
test("getSituation.companions: sameNode è true per un compagno sullo stesso nodo in Forest", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99); // entrambi sull'entry node
  const situation = director.getSituation(state, loop.getPlayer(state, "p1"));
  assert.equal(situation.companions.find((c) => c.id === "p2").sameNode, true);
});

test("getSituation.companions: sameNode è false per un compagno nella stessa zona ma su un altro nodo", () => {
  const state = newForestGame(2);
  loop.landPlayer(state, "p1", "forest", () => 0.99);
  loop.landPlayer(state, "p2", "forest", () => 0.99);
  loop.moveToNode(state, "p1", "right"); // p1 lascia l'entry node, p2 resta lì
  const situation = director.getSituation(state, loop.getPlayer(state, "p1"));
  assert.equal(situation.companions.find((c) => c.id === "p2").sameNode, false);
  // Nessun impatto su Party/azioni: AIUTA/SCAMBIA già invariati (vedi test 19),
  // qui verifichiamo solo il dato informativo aggiuntivo.
});

test("getSituation.companions: nelle zone legacy sameNode resta sempre true (nessun cambiamento)", () => {
  const state = newLegacyGame(2, false);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e1", () => 0.99);
  const situation = director.getSituation(state, loop.getPlayer(state, "p1"));
  assert.equal(situation.companions.find((c) => c.id === "p2").sameNode, true);
});
