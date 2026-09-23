const test = require("node:test");
const assert = require("node:assert/strict");
const loop = require("../engine/fortress-loop.js");
const combat = require("../engine/fortress-combat.js");

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

/* ---- atterraggio ---- */

test("atterraggio consentito solo in zona esterna", () => {
  const state = newGame(2);
  assert.throws(() => loop.landPlayer(state, "p1", "centro", () => 0.99));
  assert.throws(() => loop.landPlayer(state, "p1", "i1", () => 0.99));
  assert.doesNotThrow(() => loop.landPlayer(state, "p1", "e1", () => 0.99));
});

test("il loot ambientale scatta una sola volta per zona, non per giocatore", () => {
  const state = newGame(3);
  const rng = () => 0.99; // sempre "rara" ma non importa qui
  loop.landPlayer(state, "p1", "e1", rng);
  const zone1 = loop.getZone(state, "e1");
  assert.equal(zone1.ambientLootClaimed, true);
  const logCountAfterFirst = state.log.length;
  loop.landPlayer(state, "p2", "e1", rng);
  loop.landPlayer(state, "p3", "e1", rng);
  assert.equal(state.log.length, logCountAfterFirst, "nessun nuovo loot ambientale per gli arrivi successivi nella stessa zona");
});

/* ---- movimento ---- */

test("movimento massimo 1 collegamento, mai verso una zona non adiacente", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  assert.throws(() => loop.moveAction(state, "p1", "e3"), "e3 non è adiacente a e1");
  assert.doesNotThrow(() => loop.moveAction(state, "p1", "e2"));
});

test("un solo movimento per round", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.moveAction(state, "p1", "e2");
  assert.throws(() => loop.moveAction(state, "p1", "e1"));
});

test("impossibile entrare volontariamente in una zona storm o eliminated", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99); // round 1
  loop.getZone(state, "e2").stormState = "storm";
  assert.throws(() => loop.moveAction(state, "p1", "e2"));
  loop.getZone(state, "e2").stormState = "eliminated";
  assert.throws(() => loop.moveAction(state, "p1", "e2"));
});

/* ---- casse ---- */

test("le casse si consumano una sola volta", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getZone(state, "e1").chests.push({ id: "c1", opened: false });
  loop.apriCassaAction(state, "p1", "c1", () => 0.1);
  assert.throws(() => loop.apriCassaAction(state, "p1", "c1", () => 0.1));
});

/* ---- scambia ---- */

test("SCAMBIA consuma l'azione principale del round", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getPlayer(state, "p1").equipment.primary = { id: "arma-test" };
  loop.scambiaAction(state, "p1", "p2", "primary");
  assert.equal(loop.getPlayer(state, "p2").equipment.primary.id, "arma-test");
  assert.equal(loop.getPlayer(state, "p1").actedThisRound, true);
  assert.throws(() => loop.scambiaAction(state, "p1", "p2", "utility"), "azione già usata");
});

/* ---- rianimazione ---- */

test("RIANIMA richiede la stessa zona e riporta HP 5 / Scudo 0", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const target = loop.getPlayer(state, "p2");
  loop.setPlayerKO(state, target);
  loop.rianimaAction(state, "p1", "p2");
  assert.equal(target.status, "active");
  assert.equal(target.hp, 5);
  assert.equal(target.shield, 0);
  assert.equal(target.koRoundsRemaining, null);
});

test("RIANIMA fallisce se non nella stessa zona", () => {
  const state = newGame(2);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e2", () => 0.99);
  loop.beginExploration(state, () => 0.99);
  loop.setPlayerKO(state, loop.getPlayer(state, "p2"));
  assert.throws(() => loop.rianimaAction(state, "p1", "p2"));
});

/* ---- KO / countdown ---- */

test("un giocatore appena andato KO non perde countdown nello stesso round", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99); // round 1
  const p = loop.getPlayer(state, "p1");
  loop.setPlayerKO(state, p); // koSinceRound = 1
  loop.endRound(state, () => 0.99); // fine round 1: non deve decrementare
  assert.equal(p.koRoundsRemaining, 3);
});

test("countdown KO normale: -1 per round successivo", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99); // round 1
  const p = loop.getPlayer(state, "p1");
  loop.setPlayerKO(state, p);
  loop.endRound(state, () => 0.99); // round 1: nessun decremento (appena KO)
  loop.startRound(state, () => 0.99); // round 2
  loop.endRound(state, () => 0.99); // round 2: -1
  assert.equal(p.koRoundsRemaining, 2);
});

test("countdown KO in Tempesta: -2 per round (normale + Tempesta)", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99); // round 1
  for (let i = 0; i < 4; i++) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); } // arriva a round 5
  assert.equal(state.round, 5);
  loop.getZone(state, "e1").stormState = "storm"; // forziamo per isolare il test dal danno Tempesta stesso
  const p = loop.getPlayer(state, "p1");
  loop.setPlayerKO(state, p); // koSinceRound = 5
  loop.endRound(state, () => 0.99); // fine round 5: appena KO, nessun decremento
  loop.startRound(state, () => 0.99); // round 6
  loop.endRound(state, () => 0.99); // fine round 6: -1 normale, -1 perché in storm
  assert.equal(p.koRoundsRemaining, 1);
});

test("KO eliminato quando il countdown arriva a 0", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const p = loop.getPlayer(state, "p1");
  loop.setPlayerKO(state, p);
  loop.endRound(state, () => 0.99); // round 1: appena ko
  for (let i = 0; i < 3; i++) { loop.startRound(state, () => 0.99); loop.endRound(state, () => 0.99); }
  assert.equal(p.status, "eliminated");
});

/* ---- zona eliminata ---- */

test("active o KO in una zona che diventa eliminated vengono eliminati subito", () => {
  const state = newGame(2);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e1", () => 0.99);
  loop.beginExploration(state, () => 0.99); // round 1
  loop.setPlayerKO(state, loop.getPlayer(state, "p2"));
  // portiamo la partita fino al round 7, dove le esterne diventano eliminated
  while (state.round < 7) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  assert.equal(state.round, 7);
  assert.equal(loop.getPlayer(state, "p1").status, "eliminated");
  assert.equal(loop.getPlayer(state, "p2").status, "eliminated");
});

/* ---- Tempesta ---- */

test("warning non infligge danno", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  while (state.round < 4) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  assert.equal(state.round, 4);
  assert.equal(loop.getZone(state, "e1").stormState, "warning");
  const hpBefore = loop.getPlayer(state, "p1").hp;
  loop.endRound(state, () => 0.99);
  assert.equal(loop.getPlayer(state, "p1").hp, hpBefore);
});

test("il danno Tempesta ignora lo Scudo e colpisce direttamente la Salute", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  while (state.round < 5) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  assert.equal(state.round, 5);
  assert.equal(loop.getZone(state, "e1").stormState, "storm");
  const p = loop.getPlayer(state, "p1");
  p.shield = 10; p.hp = 10;
  loop.endRound(state, () => 0.99);
  assert.equal(p.shield, 10, "lo Scudo non viene toccato dalla Tempesta");
  assert.equal(p.hp, 7, "10 - 3 di danno Tempesta al round 5");
});

test("danno Tempesta: 3 HP ai round 5 e 6, 5 HP ai round 8 e 9", () => {
  assert.equal(loop.STORM_DAMAGE[5], 3);
  assert.equal(loop.STORM_DAMAGE[6], 3);
  assert.equal(loop.STORM_DAMAGE[8], 5);
  assert.equal(loop.STORM_DAMAGE[9], 5);
});

/* ---- boss ---- */

test("il boss si attiva esattamente al round 10", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99); // round 1
  for (let i = 1; i < 10; i++) {
    assert.equal(state.boss.active, false, "non ancora al round " + i);
    loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99);
  }
  assert.equal(state.round, 10);
  assert.equal(state.boss.active, true);
});

test("HP del boss = 50 x numero di giocatori iniziali", () => {
  const state3 = newGame(3);
  landAll(state3, "e1");
  loop.beginExploration(state3, () => 0.99);
  while (state3.round < 10) { loop.endRound(state3, () => 0.99); loop.startRound(state3, () => 0.99); }
  assert.equal(state3.boss.maxHp, 150);

  const state5 = newGame(5);
  landAll(state5, "e1");
  loop.beginExploration(state5, () => 0.99);
  while (state5.round < 10) { loop.endRound(state5, () => 0.99); loop.startRound(state5, () => 0.99); }
  assert.equal(state5.boss.maxHp, 250);
});

test("l'eliminazione di un giocatore non riduce l'HP massimo del boss", () => {
  const state = newGame(4);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getPlayer(state, "p1").status = "eliminated";
  while (state.round < 10) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  assert.equal(state.boss.maxHp, 200, "sempre basato sui 4 giocatori iniziali, non sui 3 superstiti");
});

/* ---- nemici: movimento e target ---- */

test("un nemico normale non lascia mai la propria zona", () => {
  const state = newGame(1);
  landAll(state, "e3");
  loop.beginExploration(state, () => 0.99);
  const id = loop.spawnEnemy(state, "normale", "e1"); // lontano dal giocatore
  loop.resolveEnemyPhase(state, () => 0.99);
  assert.equal(loop.getEnemy(state, id).zoneId, "e1");
});

test("un aggressivo senza bersagli nella zona percorre un solo collegamento verso il giocatore più vicino", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const id = loop.spawnEnemy(state, "aggressivo", "e3"); // e3 -> e2 -> e1 (o e3 -> e4 -> e1)
  loop.resolveEnemyPhase(state, () => 0.99);
  const enemy = loop.getEnemy(state, id);
  assert.ok(["e2", "e4"].includes(enemy.zoneId), "deve muoversi di un solo passo lungo il cammino più breve");
});

test("BFS: distanza più breve corretta sul grafo di default", () => {
  const zones = loop.createDefaultZoneLayout();
  const { dist } = loop.bfsFrom(zones, "e1");
  assert.equal(dist.e1, 0);
  assert.equal(dist.e2, 1);
  assert.equal(dist.i1, 1);
  assert.equal(dist.centro, 2);
  assert.equal(dist.e3, 2); // via e2 o e4
});

test("tie-break bersaglio: rotazione deterministica tra candidati a pari distanza", () => {
  const players = [{ id: "pA" }, { id: "pB" }, { id: "pC" }];
  assert.equal(loop.pickTarget(players, null).id, "pA");
  assert.equal(loop.pickTarget(players, "pA").id, "pB");
  assert.equal(loop.pickTarget(players, "pB").id, "pC");
  assert.equal(loop.pickTarget(players, "pC").id, "pA");
});

test("Elite ha 36 HP e usa areaDamage, entrambi dalla configurazione", () => {
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.elite.hp, 36);
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.elite.attackProfile.special.type, "areaDamage");
});

/* ---- encounterRange ---- */

test("encounterRange è letto dalla zona, non ricalcolato dal type", () => {
  const zones = loop.createDefaultZoneLayout();
  const custom = zones.find((z) => z.id === "e2");
  custom.encounterRange = "vicino"; // forziamo un valore diverso dal default del type "bosco"
  const state = loop.createGame({ players: makePlayers(1), zones, bossConfig: makeBossConfig() });
  assert.equal(loop.getZone(state, "e2").encounterRange, "vicino");
});

/* ---- vittoria / sconfitta ---- */

test("vittoria quando il boss è sconfitto", () => {
  const state = newGame(1, { phases: [{ threshold: 1.0, attackProfile: { baseDice: 1, power: 0, range: "medio", special: { type: "none" } } }] });
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  while (state.round < 10) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  state.players[0].zoneId = "centro";
  state.boss.hp = 1; // sul punto di morire
  // il boss non è un "enemy" del catalogo nemici: risolviamo il colpo finale
  // direttamente col motore, per isolare il test dalla fase boss completa
  const zone = loop.getZone(state, "centro");
  const result = combat.resolveAttack({ weapon: { baseDice: 2, range: "medio", power: 5, special: { type: "none" } }, encounterRange: zone.encounterRange, rng: () => 6 });
  state.boss.hp = Math.max(0, state.boss.hp - result.total);
  loop.checkVictoryOrDefeat(state);
  assert.equal(state.phase, "vittoria");
  assert.equal(state.winner, "squadra");
});

test("sconfitta quando tutti i giocatori sono eliminated", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  state.players.forEach((p) => { p.status = "eliminated"; });
  loop.checkVictoryOrDefeat(state);
  assert.equal(state.phase, "sconfitta");
  assert.equal(state.winner, "sistema");
});

/* ---- integrazione con fortress-combat.js: nessuna duplicazione ---- */

test("l'attacco di un giocatore usa davvero fortress-combat.js (crit verificabile con rng fissato)", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getZone(state, "e1").encounterRange = "medio"; // fissato esplicitamente per il test
  const weapon = { baseDice: 1, range: "medio", power: 0, special: { type: "critOnSix" } };
  // gittata coincidente (medio/medio): 1 dado base +1 = 2 dadi
  const rng = combat.makeQueueRng([6, 6]);
  const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, rng);
  assert.deepEqual(result.rolls, [12, 12]);
  assert.equal(result.total, 24);
});

/* ---- Shield nemici/boss (correzione ignoreShield) ---- */

test("archetipi nemico: shield di configurazione (normale/aggressivo 0, distanza 2, resistente 5, elite 6)", () => {
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.normale.shield, 0);
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.aggressivo.shield, 0);
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.distanza.shield, 2);
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.resistente.shield, 5);
  assert.equal(loop.DEFAULT_ENEMY_ARCHETYPES.elite.shield, 6);
});

test("spawnEnemy inizializza shield/maxShield dall'archetipo", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const id = loop.spawnEnemy(state, "elite", "e1");
  const enemy = loop.getEnemy(state, id);
  assert.equal(enemy.hp, 36);
  assert.equal(enemy.shield, 6);
  assert.equal(enemy.maxShield, 6);
});

test("danno normale contro shield: assorbe prima lo Scudo, poi la Salute", () => {
  const target = { hp: 10, shield: 5 };
  loop.applyDamage(target, { total: 6, ignoreShieldN: 0 });
  assert.equal(target.shield, 0);
  assert.equal(target.hp, 9);
});

test("ignoreShield(1): 1 punto bypassa lo Scudo verso la Salute, il resto segue l'ordine normale", () => {
  // total 3 <= shield 5: senza ignoreShield lo Scudo assorbirebbe tutto (nessun danno alla Salute)
  const senzaSpecial = { hp: 10, shield: 5 };
  loop.applyDamage(senzaSpecial, { total: 3, ignoreShieldN: 0 });
  assert.equal(senzaSpecial.hp, 10, "senza ignoreShield lo scudo assorbe tutto, nessun danno alla Salute");

  const conIgnoreShield1 = { hp: 10, shield: 5 };
  loop.applyDamage(conIgnoreShield1, { total: 3, ignoreShieldN: 1 });
  assert.equal(conIgnoreShield1.hp, 9, "1 punto bypassa e colpisce la Salute");
  assert.equal(conIgnoreShield1.shield, 3, "i restanti 2 punti sono assorbiti normalmente dallo Scudo");
});

test("ignoreShield(2): 2 punti bypassano", () => {
  const target = { hp: 10, shield: 5 };
  loop.applyDamage(target, { total: 3, ignoreShieldN: 2 });
  assert.equal(target.hp, 8, "2 punti bypassano direttamente alla Salute");
  assert.equal(target.shield, 4, "il punto restante è assorbito dallo Scudo");
});

test("lo Scudo non diventa mai negativo", () => {
  const target = { hp: 10, shield: 2 };
  loop.applyDamage(target, { total: 5, ignoreShieldN: 0 });
  assert.equal(target.shield, 0);
  assert.equal(target.hp, 7); // 2 assorbiti dallo scudo, 3 alla Salute
});

test("HP corretti quando il bypass supera anche lo Scudo residuo", () => {
  const target = { hp: 10, shield: 1 };
  loop.applyDamage(target, { total: 4, ignoreShieldN: 2 });
  // 2 bypassano -> hp 10->8; resto 2 -> scudo 1->0, il punto in eccesso (1) -> hp 8->7
  assert.equal(target.shield, 0);
  assert.equal(target.hp, 7);
});

test("un nemico è eliminato solo quando HP <= 0, non quando lo Scudo arriva a 0", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const id = loop.spawnEnemy(state, "resistente", "e1"); // hp 20, shield 5
  const enemy = loop.getEnemy(state, id);
  loop.applyDamageToEnemy(enemy, { total: 5, ignoreShieldN: 0 }); // consuma solo lo Scudo
  assert.equal(enemy.shield, 0);
  assert.equal(enemy.hp, 20);
  assert.ok(enemy.hp > 0, "resta vivo: lo Scudo a 0 non elimina il nemico");
});

test("boss con Scudo configurabile, non legato al numero di giocatori", () => {
  const state = newGame(2, { shield: 10 });
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  while (state.round < 10) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  assert.equal(state.boss.active, true);
  assert.equal(state.boss.maxShield, 10);
  assert.equal(state.boss.shield, 10);
});

test("un'arma ignoreShield ha un vantaggio reale sulla stessa arma senza special, contro un nemico protetto", () => {
  function setup() {
    const s = newGame(1);
    landAll(s, "e1");
    loop.beginExploration(s, () => 0.99);
    loop.getZone(s, "e1").encounterRange = "medio";
    return s;
  }
  const weaponPlain = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const weaponPierce = { baseDice: 1, range: "medio", power: 1, special: { type: "ignoreShield", n: 2 } };
  // gittata coincidente (medio/medio): 1 dado base +1 = 2 dadi; rng fissato a [1,1] -> somma 2 + power 1 = 3
  // 3 <= shield dell'Elite (6): senza ignoreShield lo Scudo assorbe tutto, con ignoreShield(2) 2 punti passano

  const stateA = setup();
  const idA = loop.spawnEnemy(stateA, "elite", "e1");
  loop.attackEnemyAction(stateA, "p1", idA, weaponPlain, combat.makeQueueRng([1, 1]));
  const enemyA = loop.getEnemy(stateA, idA);

  const stateB = setup();
  const idB = loop.spawnEnemy(stateB, "elite", "e1");
  loop.attackEnemyAction(stateB, "p1", idB, weaponPierce, combat.makeQueueRng([1, 1]));
  const enemyB = loop.getEnemy(stateB, idB);

  assert.equal(enemyA.hp, 36, "senza ignoreShield, lo Scudo dell'Elite assorbe tutto: nessun danno alla Salute");
  assert.equal(enemyB.hp, 34, "con ignoreShield(2), 2 punti bypassano lo Scudo e colpiscono la Salute");
  assert.ok(enemyB.hp < enemyA.hp, "l'arma con ignoreShield infligge più danno reale sullo stesso nemico protetto");
});

/* =========================================================================
   Primitive "step" per il futuro Turn Director: getEnemyPhaseOrder,
   resolveEnemyStep, resolveBossStep, loot ambientale condiviso, anteprima
   dadi pura. Nessuna di queste deve cambiare il comportamento delle funzioni
   già esistenti (resolveEnemyPhase/resolveBossPhase restano wrapper).
   ========================================================================= */

test("getEnemyPhaseOrder: ordine stabile per id, solo nemici vivi", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const idB = loop.spawnEnemy(state, "normale", "e1");
  const idA = loop.spawnEnemy(state, "normale", "e1");
  const order = loop.getEnemyPhaseOrder(state);
  assert.deepEqual(order, [idA, idB].sort());

  loop.getEnemy(state, idA).hp = 0;
  const order2 = loop.getEnemyPhaseOrder(state);
  assert.equal(order2.includes(idA), false);
  assert.equal(order2.length, 1);
});

test("resolveEnemyStep applica il danno di un solo nemico alla volta: lo stato dopo lo step 1 non anticipa lo step 2", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getZone(state, "e1").encounterRange = "medio"; // coincide col range "normale" -> mod +1, diceCount 2
  loop.spawnEnemy(state, "normale", "e1");
  loop.spawnEnemy(state, "normale", "e1");
  const order = loop.getEnemyPhaseOrder(state);
  assert.equal(order.length, 2);

  const step1 = loop.resolveEnemyStep(state, order[0], combat.makeQueueRng([3, 3]));
  assert.equal(step1.type, "attack");
  assert.equal(step1.shieldBefore, 10);
  assert.equal(step1.shieldAfter, 2); // 3+3+power2=8 danni, tutti assorbiti dallo Scudo (10->2)
  assert.equal(step1.hpBefore, 10);
  assert.equal(step1.hpAfter, 10, "nessun danno alla Salute: lo Scudo residuo assorbe tutto");
  const playerAfterStep1 = loop.getPlayer(state, step1.targetId);
  assert.equal(playerAfterStep1.shield, 2);
  assert.equal(playerAfterStep1.hp, 10);

  const step2 = loop.resolveEnemyStep(state, order[1], combat.makeQueueRng([3, 3]));
  assert.equal(step2.type, "attack");
  assert.equal(step2.shieldBefore, 2, "il secondo step parte da dove il primo ha lasciato lo Scudo, non da quello iniziale");
  assert.equal(step2.shieldAfter, 0);
  assert.equal(step2.hpBefore, 10, "l'HP non deve già riflettere il secondo colpo prima che venga risolto");
  assert.equal(step2.hpAfter, 4, "8 danni: 2 residui di Scudo + 6 alla Salute");
});

test("resolveEnemyStep su un nemico già a 0 HP o inesistente: skipped, nessun errore", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const id = loop.spawnEnemy(state, "normale", "e1");
  loop.getEnemy(state, id).hp = 0;
  assert.deepEqual(loop.resolveEnemyStep(state, id, () => 0.99), { type: "skipped", enemyId: id });
  assert.deepEqual(loop.resolveEnemyStep(state, "id-inesistente", () => 0.99), { type: "skipped", enemyId: "id-inesistente" });
});

test("resolveBossStep risolve un solo attacco con prima/dopo dettagliati; resolveBossPhase resta un wrapper identico", () => {
  const state = newGame(1, { phases: [{ threshold: 1.0, attackProfile: { baseDice: 1, power: 3, range: "medio", special: { type: "none" } } }] });
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  while (state.round < 10) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  // la Tempesta esterna a round 7 elimina chi resta a e1 per tutto il ciclo: qui vogliamo
  // isolare solo resolveBossStep, quindi riportiamo il giocatore attivo prima di spostarlo.
  state.players[0].status = "active";
  state.players[0].hp = 10;
  state.players[0].shield = 10;
  state.players[0].zoneId = "centro"; // encounterRange "vicino" (default del type "citta")
  assert.equal(state.boss.active, true);

  const step1 = loop.resolveBossStep(state, combat.makeQueueRng([4]));
  assert.equal(step1.type, "attack");
  assert.equal(step1.targetId, "p1");
  assert.equal(step1.shieldBefore, 10);
  assert.equal(step1.shieldAfter, 3); // arma Medio vs scontro Vicino -> mod 0 -> 1 dado; 4+power3=7 assorbiti dallo Scudo
  assert.equal(step1.hpAfter, 10);
  assert.equal(loop.getPlayer(state, "p1").shield, 3);

  const step2 = loop.resolveBossPhase(state, combat.makeQueueRng([4])); // wrapper: stesso comportamento
  assert.equal(step2.type, "attack");
  assert.equal(step2.shieldBefore, 3);
  assert.equal(step2.shieldAfter, 0);
  assert.equal(step2.hpAfter, 6); // 7 danni: 3 residui di Scudo + 4 alla Salute (10->6)
});

test("landPlayer e moveAction restituiscono { player, lootFound }", () => {
  const state = newGame(1);
  const landed = loop.landPlayer(state, "p1", "e1", () => 0.99);
  assert.equal(landed.player.id, "p1");
  assert.notEqual(landed.lootFound, undefined);

  loop.beginExploration(state, () => 0.99);
  const moved = loop.moveAction(state, "p1", "e2", () => 0.99);
  assert.equal(moved.player.zoneId, "e2");
  assert.notEqual(moved.lootFound, undefined);
});

test("loot ambientale: si attiva anche al primo movimento in una zona nuova, non solo all'atterraggio", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  assert.equal(loop.getZone(state, "e2").ambientLootClaimed, false);

  const { lootFound } = loop.moveAction(state, "p1", "e2", () => 0.1);
  assert.ok(lootFound, "il primo ingresso in e2 deve generare loot ambientale");
  assert.equal(loop.getZone(state, "e2").ambientLootClaimed, true);
});

test("loot ambientale: nessun secondo loot rientrando nella stessa zona", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.moveAction(state, "p1", "e2", () => 0.1); // consuma il loot di e2
  state.players[0].movedThisRound = false;
  state.players[0].zoneId = "e1";
  const { lootFound } = loop.moveAction(state, "p1", "e2", () => 0.1);
  assert.equal(lootFound, null, "e2 è già stata saccheggiata: nessun secondo loot");
});

test("previewPlayerAttack: i dadi effettivi coincidono sempre con quelli dell'attacco reale", () => {
  function setup(encounterRange) {
    const state = newGame(1);
    landAll(state, "e1");
    loop.beginExploration(state, () => 0.99);
    loop.getZone(state, "e1").encounterRange = encounterRange;
    const enemyId = loop.spawnEnemy(state, "normale", "e1");
    return { state, enemyId };
  }

  // range neutro: arma Medio, scontro Vicino -> differenza 1 -> mod 0
  {
    const { state, enemyId } = setup("vicino");
    const weapon = { baseDice: 2, range: "medio", power: 1, special: { type: "none" } };
    const preview = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
    assert.equal(preview.diceCount, 2);
    const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, combat.makeQueueRng([2, 2, 2]));
    assert.equal(preview.diceCount, result.diceCount);
  }

  // range ideale: arma e scontro coincidenti -> mod +1
  {
    const { state, enemyId } = setup("medio");
    const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
    const preview = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
    assert.equal(preview.diceCount, 2);
    const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, combat.makeQueueRng([2, 2, 2]));
    assert.equal(preview.diceCount, result.diceCount);
  }

  // range sfavorevole: estremi opposti (arma Vicino, scontro Lontano) -> mod -1
  {
    const { state, enemyId } = setup("lontano");
    const weapon = { baseDice: 2, range: "vicino", power: 1, special: { type: "none" } };
    const preview = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
    assert.equal(preview.diceCount, 1);
    const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, combat.makeQueueRng([2, 2, 2]));
    assert.equal(preview.diceCount, result.diceCount);
  }

  // Aiuto: +1 dado, isolato dal modificatore di gittata (mod 0)
  {
    const { state, enemyId } = setup("vicino");
    state.pendingAiuto["p1"] = true;
    const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
    const preview = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
    assert.equal(preview.diceCount, 2);
    const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, combat.makeQueueRng([2, 2, 2]));
    assert.equal(preview.diceCount, result.diceCount);
  }

  // suppress: marcatore sul nemico -> +1 dado, isolato dal modificatore di gittata (mod 0)
  {
    const { state, enemyId } = setup("vicino");
    loop.getEnemy(state, enemyId).suppressed = true;
    const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
    const preview = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
    assert.equal(preview.diceCount, 2);
    assert.equal(preview.effectBonus, 1);
    const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, combat.makeQueueRng([2, 2, 2]));
    assert.equal(preview.diceCount, result.diceCount);
  }

  // clamp a 3: base 2 + ideale(+1) + aiuto(+1) = 4 -> clampato a 3, sia in anteprima sia nell'attacco reale
  {
    const { state, enemyId } = setup("medio");
    state.pendingAiuto["p1"] = true;
    const weapon = { baseDice: 2, range: "medio", power: 1, special: { type: "none" } };
    const preview = loop.previewPlayerAttack(state, "p1", enemyId, weapon);
    assert.equal(preview.diceCount, 3);
    const { result } = loop.attackEnemyAction(state, "p1", enemyId, weapon, combat.makeQueueRng([2, 2, 2]));
    assert.equal(result.diceCount, 3);
    assert.equal(preview.diceCount, result.diceCount);
  }
});

/* =========================================================================
   Dadi fisici a livello loop: declarePlayerAttack/declareBossAttack
   congelano il contesto (aiuto/effectBonus/suppress consumato) una volta
   sola, valido anche attraverso un ritiro fisico successivo.
   ========================================================================= */

test("declarePlayerAttack consuma il marcatore suppress una sola volta: il contesto resta congelato anche dopo un ritiro fisico", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getZone(state, "e1").encounterRange = "vicino";
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  loop.getEnemy(state, enemyId).suppressed = true;

  const weapon = { baseDice: 2, range: "vicino", power: 1, special: { type: "rerollOnes" } };
  const declared = loop.declarePlayerAttack(state, "p1", enemyId, weapon);
  assert.equal(declared.effectBonus, 1, "il marcatore suppress deve valere +1 dado alla dichiarazione");
  assert.equal(loop.getEnemy(state, enemyId).suppressed, false, "il marcatore è consumato subito, prima di qualunque dado");
  assert.equal(declared.diceCount, 3); // baseDice2 + ideale(+1) + suppress(+1) = 4 -> clamp 3

  const first = loop.resolvePlayerAttackFromRolls(state, declared, [1, 5, 3]);
  assert.equal(first.status, "needs-reroll");
  // il secondo giro usa lo STESSO oggetto "declared": nessuna nuova lettura di enemy.suppressed (già false)
  const done = loop.resolvePlayerAttackFromRolls(state, declared, [1, 5, 3], [4]);
  assert.equal(done.status, "resolved");
  assert.equal(done.result.diceCount, declared.diceCount);
});

test("attackBossAction e declareBossAttack/resolveBossAttackFromRolls: stesso motore del combattimento contro i nemici", () => {
  const state = newGame(1, { phases: [{ threshold: 1.0, attackProfile: { baseDice: 1, power: 2, range: "medio", special: { type: "none" } } }] });
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.activateBoss(state);
  state.players[0].zoneId = "centro"; // encounterRange "vicino"

  const weapon = { baseDice: 2, range: "vicino", power: 1, special: { type: "none" } }; // ideale -> 3 dadi
  const declared = loop.declareBossAttack(state, "p1", weapon);
  assert.equal(declared.diceCount, 3);

  const outcome = loop.resolveBossAttackFromRolls(state, declared, [2, 2, 2]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.result.total, 7); // 2+2+2+power1
  assert.equal(state.boss.hp, state.boss.maxHp - 7); // scudo di configurazione assente (0): tutto il danno va alla Salute
});

test("resolveEnemyStepFromRolls usa il bersaglio già bloccato da prepareEnemyStep, mai un secondo pickTarget", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getZone(state, "e1").encounterRange = "medio";
  const enemyId = loop.spawnEnemy(state, "normale", "e1");

  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "attack");
  assert.equal(prepared.targetId, "p1");

  const outcome = loop.resolveEnemyStepFromRolls(state, prepared, [3, 3]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.targetId, "p1");
  assert.equal(outcome.result.total, 8); // 3+3+power2
});

test("resolveBossStepFromRolls usa il bersaglio già bloccato da prepareBossStep", () => {
  const state = newGame(1, { phases: [{ threshold: 1.0, attackProfile: { baseDice: 1, power: 3, range: "medio", special: { type: "none" } } }] });
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.activateBoss(state);
  state.players[0].zoneId = "centro";

  const prepared = loop.prepareBossStep(state);
  assert.equal(prepared.type, "attack");
  assert.equal(prepared.targetId, "p1");

  const outcome = loop.resolveBossStepFromRolls(state, prepared, [4]);
  assert.equal(outcome.status, "resolved");
  assert.equal(outcome.result.total, 7); // 4+power3
});
