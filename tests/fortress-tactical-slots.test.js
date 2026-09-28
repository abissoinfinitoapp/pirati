const test = require('node:test');
const assert = require('node:assert/strict');
const { tacticalSlotId, normalizeTacticalNodeSlots, assignTacticalSlots } = require('../fortress-game-ui.js');

test('genera id stabili e leggibili per gli slot tattici', () => {
  assert.equal(tacticalSlotId('forest-n1', 'enemies', 1), 'forest-n1-enemies-01');
  assert.equal(tacticalSlotId('forest-n1', 'players', 12), 'forest-n1-players-12');
});

test('migra il vecchio formato anchor V1 nel formato slot V2 senza perdere coordinate', () => {
  const old = {
    players: [{ x: 20, y: 30 }, { x: 25, y: 35 }],
    chest: { x: 70, y: 80 }
  };
  const out = normalizeTacticalNodeSlots('forest-n1', old);
  assert.deepEqual(out.players.map(s => [s.id, s.x, s.y]), [
    ['forest-n1-players-01', 20, 30],
    ['forest-n1-players-02', 25, 35]
  ]);
  assert.equal(out.chest[0].id, 'forest-n1-chest-01');
  assert.equal(out.chest[0].parentNodeId, 'forest-n1');
  assert.equal(out.chest[0].type, 'chest');
  assert.equal(out.chest[0].x, 70);
  assert.equal(out.chest[0].y, 80);
});

test('mantiene lo slot dei token superstiti quando un altro token scompare', () => {
  const slots = [1,2,3].map(i => ({ id:`forest-n1-enemies-0${i}`, x:i*10, y:i*10 }));
  const first = assignTacticalSlots([{id:'enemy-a'}, {id:'enemy-b'}, {id:'enemy-c'}], slots, {});
  const second = assignTacticalSlots([{id:'enemy-b'}, {id:'enemy-c'}], slots, first);
  assert.equal(second['enemy-b'], first['enemy-b']);
  assert.equal(second['enemy-c'], first['enemy-c']);
  assert.equal(Object.keys(second).length, 2);
});

test('assegnazione iniziale non dipende dall ordine dell array entita', () => {
  const slots = [1,2,3,4].map(i => ({ id:`n1-enemies-0${i}` }));
  const a = assignTacticalSlots([{id:'z'}, {id:'a'}, {id:'m'}], slots, {});
  const b = assignTacticalSlots([{id:'m'}, {id:'z'}, {id:'a'}], slots, {});
  assert.deepEqual(a, b);
});

test('se gli slot sono meno dei token, assegna una sola entita per slot e lascia fallback alle altre', () => {
  const slots = [{id:'n1-players-01'}, {id:'n1-players-02'}];
  const out = assignTacticalSlots([{id:'p1'}, {id:'p2'}, {id:'p3'}], slots, {});
  assert.equal(Object.keys(out).length, 2);
  assert.equal(new Set(Object.values(out)).size, 2);
});
