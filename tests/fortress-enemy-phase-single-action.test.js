const test = require('node:test');
const assert = require('node:assert/strict');
const loop = require('../engine/fortress-loop.js');
const director = require('../engine/fortress-director.js');

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `Giocatore ${i + 1}` }));
}

function makeState(n = 2) {
  const state = loop.createGame({ players: makePlayers(n), bossConfig: {
    hpPerPlayer: 50,
    summonEvery: 3,
    summonArchetype: 'normale',
    phases: [{ threshold: 1, attackProfile: { baseDice: 2, power: 4, range: 'medio', special: { type: 'none' } } }]
  }});
  state.players.forEach((p) => { p.zoneId = null; });
  state.players.forEach((p) => loop.landPlayer(state, p.id, 'e1', () => 0.99));
  loop.beginExploration(state, () => 0.99);
  const dir = director.createDirectorState(state);
  director.acknowledgeAnnouncement(state, dir);
  return { state, dir };
}

function resolveEnemyAttackWithFullDefence(state, dir, begin) {
  assert.equal(begin.type, 'awaiting-reaction');
  director.chooseEnemyReaction(state, dir, 'defend');
  const enemyRoll = director.submitRoll(state, dir, Array(begin.diceCount).fill(1));
  assert.equal(enemyRoll.status, 'awaiting-reaction-roll');
  return director.submitRoll(state, dir, [6]);
}

test('fase nemici: con più mostri agisce un solo nemico e poi la fase termina', () => {
  const { state, dir } = makeState(2);
  loop.getZone(state, 'e1').encounterRange = 'medio';
  const e1 = loop.spawnEnemy(state, 'normale', 'e1');
  const e2 = loop.spawnEnemy(state, 'normale', 'e1');

  director.beginEnemyPhase(state, dir);
  const begin = director.beginEnemyRollStep(state, dir);
  const actorId = begin.enemyId;
  resolveEnemyAttackWithFullDefence(state, dir, begin);

  assert.equal(dir.enemyPhase, null, 'dopo un solo attacco la fase nemici deve chiudersi');
  assert.notEqual(dir.directorPhase, 'enemy-phase');
  const otherId = actorId === e1 ? e2 : e1;
  assert.equal(loop.getEnemy(state, otherId).lastTargetId, null, 'il secondo mostro non deve aver attaccato nello stesso turno');
});

test('fase nemici: l’attaccante ruota deterministicamente tra una fase e la successiva', () => {
  const { state, dir } = makeState(2);
  loop.getZone(state, 'e1').encounterRange = 'medio';
  loop.spawnEnemy(state, 'normale', 'e1');
  loop.spawnEnemy(state, 'normale', 'e1');
  loop.spawnEnemy(state, 'normale', 'e1');

  director.beginEnemyPhase(state, dir);
  const first = director.beginEnemyRollStep(state, dir);
  resolveEnemyAttackWithFullDefence(state, dir, first);

  director.beginEnemyPhase(state, dir);
  const second = director.beginEnemyRollStep(state, dir);
  assert.notEqual(second.enemyId, first.enemyId, 'la fase successiva deve partire dal mostro seguente');
});

test('fase nemici: il bersaglio ruota tra giocatori equivalenti invece di concentrare tutti gli attacchi', () => {
  const { state, dir } = makeState(2);
  loop.getZone(state, 'e1').encounterRange = 'medio';
  loop.spawnEnemy(state, 'normale', 'e1');
  loop.spawnEnemy(state, 'normale', 'e1');

  director.beginEnemyPhase(state, dir);
  const first = director.beginEnemyRollStep(state, dir);
  resolveEnemyAttackWithFullDefence(state, dir, first);

  director.beginEnemyPhase(state, dir);
  const second = director.beginEnemyRollStep(state, dir);
  assert.notEqual(second.targetId, first.targetId, 'a parità di validità il bersaglio deve ruotare');
});

test('scenario test bambini: entry sicura + giocatore nascosto lasciano un solo bersaglio esposto, ma riceve un solo attacco', () => {
  const { state, dir } = makeState(3);
  const zone = loop.getZone(state, 'e1');
  zone.entryNodeId = 'e1-n01';
  zone.nodes = [
    { id:'e1-n01', connections:{ right:'e1-n02' } },
    { id:'e1-n02', connections:{ left:'e1-n01', right:'e1-n03' } },
    { id:'e1-n03', connections:{ left:'e1-n02' } }
  ];
  zone.encounterRange = 'medio';

  loop.getPlayer(state, 'p1').nodeId = 'e1-n01';
  loop.getPlayer(state, 'p2').nodeId = 'e1-n02';
  loop.getPlayer(state, 'p3').nodeId = 'e1-n03';
  loop.getPlayer(state, 'p3').hiddenInShelter = true;
  loop.getPlayer(state, 'p3').hiddenNodeId = 'e1-n03';

  const a = loop.spawnEnemy(state, 'normale', 'e1');
  const b = loop.spawnEnemy(state, 'normale', 'e1');
  loop.getEnemy(state, a).nodeId = 'e1-n02';
  loop.getEnemy(state, b).nodeId = 'e1-n02';

  director.beginEnemyPhase(state, dir);
  const begin = director.beginEnemyRollStep(state, dir);
  assert.equal(begin.targetId, 'p2', 'entry e giocatore nascosto non devono deviare il primo attacco dal bersaglio esposto');
  resolveEnemyAttackWithFullDefence(state, dir, begin);

  assert.equal(dir.enemyPhase, null);
  const untouched = begin.enemyId === a ? b : a;
  assert.equal(loop.getEnemy(state, untouched).lastTargetId, null, 'il secondo mostro non attacca p2 nello stesso turno');
});
