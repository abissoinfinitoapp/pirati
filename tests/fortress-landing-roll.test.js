const test = require('node:test');
const assert = require('node:assert/strict');
const loop = require('../engine/fortress-loop.js');

function state() {
  return loop.createGame({ players:[{id:'p1',name:'Anna'}], zones: loop.createDefaultZoneLayout() });
}

test('tiro lancio 1-2: atterraggio disastroso, -4 HP e scudo intatto', () => {
  const s = state();
  const out = loop.landPlayer(s, 'p1', 'e1', () => 0.99, 2);
  assert.equal(out.landing.outcome, 'disastroso');
  assert.equal(out.landing.damage, 4);
  assert.equal(s.players[0].hp, 6);
  assert.equal(s.players[0].shield, 10);
});

test('tiro lancio 3-4: atterraggio ostile, -2 HP', () => {
  const s = state();
  const out = loop.landPlayer(s, 'p1', 'e1', () => 0.99, 4);
  assert.equal(out.landing.outcome, 'ostile');
  assert.equal(s.players[0].hp, 8);
});

test('tiro lancio 5-6: atterraggio perfetto, nessun danno', () => {
  const s = state();
  const out = loop.landPlayer(s, 'p1', 'e1', () => 0.99, 5);
  assert.equal(out.landing.outcome, 'perfetto');
  assert.equal(s.players[0].hp, 10);
});

test('launchKitBonus modifica il risultato effettivo e viene clampato a 6', () => {
  const s = state();
  const p = s.players[0];
  p.launchKitBonus = 2;
  const out = loop.landPlayer(s, 'p1', 'e1', () => 0.99, 4);
  assert.equal(out.landing.effectiveRoll, 6);
  assert.equal(out.landing.outcome, 'perfetto');
  assert.equal(p.hp, 10);
});

test('cambio zona usa lo stesso tiro di lancio e non consuma lo scudo', () => {
  const s = state();
  loop.landPlayer(s, 'p1', 'e1', () => 0.99, 6);
  loop.beginExploration(s, () => 0.99);
  const out = loop.moveAction(s, 'p1', 'e2', () => 0.99, 1);
  assert.equal(out.landing.damage, 4);
  assert.equal(s.players[0].zoneId, 'e2');
  assert.equal(s.players[0].hp, 6);
  assert.equal(s.players[0].shield, 10);
});

test('il danno da atterraggio può mandare KO senza intaccare lo scudo', () => {
  const s = state();
  loop.landPlayer(s, 'p1', 'e1', () => 0.99, 6);
  loop.beginExploration(s, () => 0.99);
  s.players[0].hp = 3;
  const out = loop.moveAction(s, 'p1', 'e2', () => 0.99, 1);
  assert.equal(out.landing.damage, 4);
  assert.equal(s.players[0].hp, 0);
  assert.equal(s.players[0].status, 'ko');
  assert.equal(s.players[0].shield, 10);
});
