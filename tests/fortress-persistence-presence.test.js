const test = require('node:test');
const assert = require('node:assert/strict');
const loop = require('../engine/fortress-loop.js');
const director = require('../engine/fortress-director.js');

function baseState() {
  return loop.createGame({
    players: [{id:'p1',name:'Anna'},{id:'p2',name:'Luca'}],
    zones: loop.createDefaultZoneLayout()
  });
}

test('presenza: un assente non conta nel Party né tra gli attivi', () => {
  const state = baseState();
  state.players.forEach(p => { p.zoneId = 'e1'; });
  loop.setPlayerPresence(state, 'p2', false, 'e1');
  assert.equal(loop.playersInZone(state, 'e1').length, 1);
  assert.equal(loop.activePlayersInZone(state, 'e1').length, 1);
  assert.equal(loop.isSolo(state, 'p1'), true);
});

test('late join: riattiva/crea dal roster sulla zona indicata senza cambiare initialPlayerCount', () => {
  const state = baseState();
  const initial = state.initialPlayerCount;
  const beforeChests = state.zones.map(z => (z.chests || []).length);
  const out = loop.setPlayerPresence(state, 'p3', true, 'e1', {
    id:'p3', name:'Marta', equipment:{ primary:{id:'starter-test',name:'Starter'} }
  });
  assert.equal(out.player.present, true);
  assert.equal(out.player.zoneId, 'e1');
  assert.equal(state.initialPlayerCount, initial);
  assert.deepEqual(state.zones.map(z => (z.chests || []).length), beforeChests);
});

test('Director: chi arriva durante la fase giocatori viene messo in fondo allo stesso round', () => {
  const state = baseState();
  state.players.forEach(p => { p.zoneId = 'e1'; });
  const dir = director.createDirectorState(state);
  dir.directorPhase = 'player-turn';
  dir.roundPlayerQueue = ['p1','p2'];
  dir.currentPlayerIndex = 0;
  loop.setPlayerPresence(state, 'p3', true, 'e1', { id:'p3', name:'Marta', equipment:{} });
  director.registerPresentPlayer(state, dir, 'p3');
  assert.deepEqual(dir.roundPlayerQueue, ['p1','p2','p3']);
  assert.equal(dir.turnOrder.includes('p3'), true);
});

test('Director: se il giocatore corrente viene disattivato passa al presente successivo', () => {
  const state = baseState();
  state.players.forEach(p => { p.zoneId = 'e1'; });
  const dir = director.createDirectorState(state);
  dir.directorPhase = 'player-turn';
  dir.roundPlayerQueue = ['p1','p2'];
  dir.currentPlayerIndex = 0;
  loop.setPlayerPresence(state, 'p1', false, 'e1');
  director.handlePlayerDeactivated(state, dir, 'p1');
  assert.equal(director.getCurrentPlayerId(state, dir), 'p2');
});
