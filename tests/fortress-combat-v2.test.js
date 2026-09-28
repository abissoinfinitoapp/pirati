const test = require('node:test');
const assert = require('node:assert/strict');
const combat = require('../engine/fortress-combat.js');
const loop = require('../engine/fortress-loop.js');
const director = require('../engine/fortress-director.js');

function zoneGraph() {
  return [{
    id: 'forest', name: 'Forest', type: 'bosco', ring: 'esterno', danger: 'medio', encounterRange: 'medio',
    connections: [], stormState: 'sicura', ambientLootClaimed: true, initialEncounter: null, initialEncounterSpawned: true,
    chests: [], groundLoot: [], smokeActive: false, noiseTracker: combat.createNoiseTracker(),
    entryNodeId: 'n0',
    nodes: [
      { id: 'n0', connections: { right: 'n1' }, contents: [] },
      { id: 'n1', connections: { left: 'n0', right: 'n2' }, contents: [] },
      { id: 'n2', connections: { left: 'n1' }, contents: [] }
    ]
  }];
}

function makeGame(n = 3) {
  const state = loop.createGame({
    players: Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `P${i + 1}` })),
    zones: zoneGraph()
  });
  state.players.forEach((p) => { p.zoneId = 'forest'; p.nodeId = 'n1'; });
  state.phase = 'esplorazione';
  state.round = 1;
  return state;
}

const rifle = { id: 'rifle', name: 'Rifle', baseDice: 1, range: 'medio', power: 1, special: { type: 'none' } };

test('Combat V2: DIFESA 1..6 blocca 0/2/4/6/8/tutto', () => {
  assert.equal(combat.resolveDefense(10, 1).damageTaken, 10);
  assert.equal(combat.resolveDefense(10, 2).damageTaken, 8);
  assert.equal(combat.resolveDefense(10, 3).damageTaken, 6);
  assert.equal(combat.resolveDefense(10, 4).damageTaken, 4);
  assert.equal(combat.resolveDefense(10, 5).damageTaken, 2);
  assert.equal(combat.resolveDefense(10, 6).damageTaken, 0);
});

test('Combat V2: SCHIVA e RITIRATI hanno esiti distinti', () => {
  assert.deepEqual(combat.resolveDodge(9, 4), {
    type: 'dodge', roll: 4, incomingDamage: 9, damageTaken: 4,
    success: false, partial: true, freeMove: false
  });
  assert.equal(combat.resolveDodge(9, 6).freeMove, true);
  assert.equal(combat.resolveRetreat(9, 2).escaped, false);
  assert.equal(combat.resolveRetreat(9, 4).damageTaken, 4);
  assert.equal(combat.resolveRetreat(9, 5).damageTaken, 0);
  assert.equal(combat.resolveRetreat(9, 5).escaped, true);
});

test('Combat V2: destino — 1 resta KO, 2-5 torna a 2 HP, 6 torna a 4 HP', () => {
  assert.deepEqual(combat.resolveDestinyRevive(1), { success: false, roll: 1, hp: 0 });
  assert.deepEqual(combat.resolveDestinyRevive(2), { success: true, roll: 2, hp: 2 });
  assert.deepEqual(combat.resolveDestinyRevive(5), { success: true, roll: 5, hp: 2 });
  assert.deepEqual(combat.resolveDestinyRevive(6), { success: true, roll: 6, hp: 4 });
});

test('Combat V2: rialzare un compagno costa 2 HP e lo riporta a 3 HP', () => {
  const state = makeGame(2);
  const a = state.players[0], b = state.players[1];
  a.hp = 8;
  loop.setPlayerKO(state, b);
  loop.rianimaAction(state, a.id, b.id);
  assert.equal(a.hp, 6);
  assert.equal(a.contributions.rescues, 1);
  assert.equal(b.status, 'active');
  assert.equal(b.hp, 3);
});

test('Combat V2: un KO resta nella queue per il tiro del destino', () => {
  const state = makeGame(3);
  loop.setPlayerKO(state, state.players[1]);
  const q = director.buildRoundPlayerQueue(state, ['p1','p2','p3']);
  assert.ok(q.includes('p2'));
});

test('Combat V2: il tiro del destino fallito non elimina e quello riuscito riattiva', () => {
  const state = makeGame(1);
  const p = state.players[0];
  loop.setPlayerKO(state, p);
  let r = loop.destinyReviveAction(state, p.id, 1);
  assert.equal(r.success, false);
  assert.equal(p.status, 'ko');
  r = loop.destinyReviveAction(state, p.id, 6);
  assert.equal(r.success, true);
  assert.equal(p.status, 'active');
  assert.equal(p.hp, 4);
});

test('Combat V2: identità nemici stabile e distinta dall’archetipo', () => {
  const state = makeGame(1);
  const id1 = loop.spawnEnemy(state, 'distanza', 'forest', 'n2');
  const id2 = loop.spawnEnemy(state, 'distanza', 'forest', 'n2');
  const a = loop.getEnemy(state, id1), b = loop.getEnemy(state, id2);
  assert.equal(a.name, 'Occhio Rosso');
  assert.equal(b.name, 'Falco');
  assert.equal(a.archetype, 'distanza');
});

test('Combat V2: HP/scudi archetipi seguono il nuovo bilanciamento', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(loop.DEFAULT_ENEMY_ARCHETYPES).map(([k,v]) => [k, [v.hp, v.shield]])),
    { normale:[8,0], aggressivo:[10,0], resistente:[16,4], distanza:[8,2], elite:[56,6] }
  );
});

test('Combat V2: attacco di squadra somma i contributi senza bonus artificiale', () => {
  const r = combat.resolveTeamAttack([
    { playerId:'p1', playerName:'P1', weaponName:'A', rolls:[5], power:1, total:6 },
    { playerId:'p2', playerName:'P2', weaponName:'B', rolls:[4], power:2, total:6 }
  ]);
  assert.equal(r.total, 12);
  assert.equal(r.participants.length, 2);
});

test('Combat V2: team attack massimo 3 e consuma l’azione offensiva di tutti, non il turno intero dei compagni', () => {
  const state = makeGame(3);
  state.players.forEach((p) => { p.equipment.primary = rifle; });
  const enemyId = loop.spawnEnemy(state, 'resistente', 'forest', 'n1');
  const d = loop.declareTeamAttack(state, 'p1', enemyId, state.players.map((p) => ({ playerId:p.id, weapon:rifle })));
  const rolls = { p1:[4], p2:[3], p3:[2] };
  // stesso nodo = incontro vicino; arma media base 1 resta a 1 dado.
  const out = loop.resolveTeamAttackFromRolls(state, d, rolls);
  assert.equal(out.status, 'resolved');
  assert.equal(out.contributions.length, 3);
  assert.equal(state.players[0].actedThisRound, true);
  assert.equal(state.players[1].actedThisRound, false);
  assert.equal(state.players[1].offensiveSpentThisRound, true);
});

test('Combat V2: reazione DIFENDITI applica solo il danno residuo e conta la difesa', () => {
  const state = makeGame(1);
  const p = state.players[0];
  p.shield = 0;
  const out = loop.applyCombatReaction(state, p.id, 7, 'defend', 4);
  assert.equal(out.reaction.damageTaken, 1);
  assert.equal(p.hp, 9);
  assert.equal(p.contributions.defenses, 1);
});

test('Combat V2: RITIRATI con successo sposta solo su nodo collegato', () => {
  const state = makeGame(1);
  const p = state.players[0];
  p.shield = 0;
  const out = loop.applyCombatReaction(state, p.id, 8, 'retreat', 5, 'n0');
  assert.equal(out.reaction.escaped, true);
  assert.equal(p.nodeId, 'n0');
  assert.throws(() => loop.applyCombatReaction(state, p.id, 8, 'retreat', 5, 'n2'), /collegato valido/);
});

test('Combat V2: Fumogeno durante un attacco garantisce la fuga e viene consumato', () => {
  const state = makeGame(1);
  const p = state.players[0];
  p.equipment.utility = { id: 'fumogeno', name: 'Fumogeno' };
  const out = loop.fumogenoRetreatAction(state, p.id, 'n0');
  assert.equal(out.escaped, true);
  assert.equal(out.damageTaken, 0);
  assert.equal(p.nodeId, 'n0');
  assert.equal(p.equipment.utility, null);
});

test('Combat V2: un nemico sopravvissuto risponde subito e non agisce di nuovo nella fase nemici dello stesso round', () => {
  const state = makeGame(2);
  state.players.forEach((p) => { p.equipment.primary = rifle; });
  const enemyId = loop.spawnEnemy(state, 'resistente', 'forest', 'n1');
  const dir = director.createDirectorState(state);
  dir.pendingAnnouncements = [];
  dir.directorPhase = 'player-turn';
  dir.roundPlayerQueue = ['p1','p2'];
  dir.currentPlayerIndex = 0;
  director.beginPlayerAttackOnEnemy(state, dir, 'p1', enemyId, rifle);
  director.submitRoll(state, dir, [2]);
  assert.ok(dir.pendingReaction);
  const choice = director.chooseEnemyReaction(state, dir, 'defend');
  director.submitRoll(state, dir, new Array(choice.diceCount).fill(2));
  director.submitRoll(state, dir, [6]);
  assert.equal(loop.getEnemy(state, enemyId).respondedThisRound, true);
  assert.ok(!loop.getEnemyPhaseOrder(state).includes(enemyId));
});

test('Combat V2: team attack lascia una sola risposta del nemico sopravvissuto contro un partecipante', () => {
  const state = makeGame(3);
  state.players.forEach((p) => { p.equipment.primary = rifle; });
  const enemyId = loop.spawnEnemy(state, 'elite', 'forest', 'n1');
  const dir = director.createDirectorState(state);
  dir.pendingAnnouncements = [];
  dir.directorPhase = 'player-turn';
  dir.roundPlayerQueue = ['p1','p2','p3'];
  dir.currentPlayerIndex = 0;
  director.beginTeamAttack(state, dir, 'p1', enemyId, [
    {playerId:'p1', weapon:rifle}, {playerId:'p2', weapon:rifle}, {playerId:'p3', weapon:rifle}
  ]);
  const out = director.submitTeamAttackRolls(state, dir, {p1:[2],p2:[2],p3:[2]});
  assert.equal(out.status, 'resolved');
  assert.ok(dir.pendingReaction, 'l’Elite sopravvissuta prepara una sola risposta al team');
  assert.ok(['p1','p2','p3'].includes(dir.pendingReaction.targetId));
});

test('Combat V2: Elite area fa reagire separatamente i compagni sullo stesso nodo', () => {
  const state = makeGame(3);
  const enemyId = loop.spawnEnemy(state, 'elite', 'forest', 'n1');
  const dir = director.createDirectorState(state);
  dir.pendingAnnouncements = [];
  dir.directorPhase = 'enemy-phase';
  dir.enemyPhase = { order:[enemyId], cursor:0 };
  const begin = director.beginEnemyRollStep(state, dir);
  assert.equal(begin.type, 'awaiting-reaction');
  const chosen = director.chooseEnemyReaction(state, dir, 'defend');
  director.submitRoll(state, dir, new Array(chosen.diceCount).fill(4));
  const first = director.submitRoll(state, dir, [6]);
  assert.equal(first.status, 'resolved');
  assert.ok(dir.pendingReaction, 'resta il secondo bersaglio Area da risolvere');
  assert.equal(dir.pendingReaction.isAreaSecondary, true);
  assert.notEqual(dir.pendingReaction.targetId, first.targetId);
  assert.ok(dir.pendingReaction.fixedIncomingDamage > 0);
});

test('Combat V2 Party: ATTENDI consuma il turno ma conserva l’azione offensiva per unirsi al Team Attack', () => {
  const state = makeGame(2);
  state.players.forEach((p) => { p.equipment.primary = rifle; });
  const enemyId = loop.spawnEnemy(state, 'normale', 'forest', 'n1');
  const wait = loop.attendiSquadraAction(state, 'p1');
  assert.equal(wait.type, 'wait-for-party');
  assert.equal(state.players[0].actedThisRound, true);
  assert.equal(state.players[0].offensiveSpentThisRound, false);
  assert.equal(state.players[0].waitingForPartyThisRound, true);
  const declared = loop.declareTeamAttack(state, 'p2', enemyId, [
    { playerId:'p2', weapon:rifle }, { playerId:'p1', weapon:rifle }
  ]);
  assert.equal(declared.participants.length, 2);
});

test('Combat V2 Loot: chi elimina da solo riceve il drop assegnato a sé', () => {
  const state = makeGame(2);
  const enemyId = loop.spawnEnemy(state, 'normale', 'forest', 'n1');
  const enemy = loop.getEnemy(state, enemyId);
  enemy.hp = 1; enemy.shield = 0;
  const declared = loop.declarePlayerAttack(state, 'p1', enemyId, rifle);
  const out = loop.resolvePlayerAttackFromRolls(state, declared, [6], null, () => 0);
  assert.equal(out.eliminated, true);
  assert.ok(out.lootFound.length > 0);
  assert.ok(out.lootFound[0].items.every((x) => x.ownerPlayerId === 'p1'));
});

test('Combat V2 Loot: Team Attack assegna i drop a rotazione tra i partecipanti', () => {
  const state = makeGame(3);
  state.players.forEach((p) => { p.equipment.primary = rifle; });
  const killElite = () => {
    const enemyId = loop.spawnEnemy(state, 'elite', 'forest', 'n1');
    const enemy = loop.getEnemy(state, enemyId);
    enemy.hp = 1; enemy.shield = 0;
    state.players.forEach((p) => { p.actedThisRound = false; p.offensiveSpentThisRound = false; });
    const d = loop.declareTeamAttack(state, 'p1', enemyId, [
      {playerId:'p1', weapon:rifle}, {playerId:'p2', weapon:rifle}, {playerId:'p3', weapon:rifle}
    ]);
    return loop.resolveTeamAttackFromRolls(state, d, {p1:[6],p2:[6],p3:[6]}, null, () => 0);
  };
  const first = killElite();
  const owners1 = first.lootFound[0].items.map((x) => x.ownerPlayerId);
  assert.deepEqual(owners1, ['p1','p2']);
  const second = killElite();
  const owners2 = second.lootFound[0].items.map((x) => x.ownerPlayerId);
  assert.deepEqual(owners2, ['p3','p1']);
});

test('Combat V2 Loot: un giocatore non può raccogliere il drop assegnato a un compagno', () => {
  const state = makeGame(2);
  const enemyId = loop.spawnEnemy(state, 'normale', 'forest', 'n1');
  const enemy = loop.getEnemy(state, enemyId);
  enemy.hp = 1; enemy.shield = 0;
  const d = loop.declarePlayerAttack(state, 'p1', enemyId, rifle);
  const out = loop.resolvePlayerAttackFromRolls(state, d, [6], null, () => 0);
  const entry = out.lootFound[0].items[0];
  const item = { id: entry.itemId, name: 'Test' };
  assert.throws(() => loop.equipFoundSupportItem(state, 'p2', entry.kind, entry.instanceId, item), /assegnato a un altro giocatore/);
  assert.doesNotThrow(() => loop.equipFoundSupportItem(state, 'p1', entry.kind, entry.instanceId, item));
});

test('Combat V2 Party: il Director propone ATTENDI sul nodo di combattimento e non nella zona sicura', () => {
  const state = makeGame(1);
  const p = state.players[0];
  loop.spawnEnemy(state, 'normale', 'forest', 'n1');
  let actions = director.getAvailableActions(state, p).map((a) => a.id);
  assert.ok(actions.includes('attendi'));
  p.nodeId = 'n0';
  actions = director.getAvailableActions(state, p).map((a) => a.id);
  assert.ok(!actions.includes('attendi'));
});
