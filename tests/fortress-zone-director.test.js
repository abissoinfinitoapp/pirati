const test = require('node:test');
const assert = require('node:assert/strict');
const zoneDirector = require('../engine/fortress-zone-director.js');
const zonesApi = require('../catalog/fortress-zones.js');
const combat = require('../engine/fortress-combat.js');
const loop = require('../engine/fortress-loop.js');

const explorable = zonesApi.ZONES.filter(z => z.id !== 'central-fortress');

function reachableNodes(zone) {
  const seen = new Set([zone.entryNodeId]);
  const q = [zone.entryNodeId];
  while (q.length) {
    const id = q.shift();
    const n = zone.nodes.find(x => x.id === id);
    for (const next of Object.values(n.connections || {})) if (!seen.has(next)) { seen.add(next); q.push(next); }
  }
  return seen;
}

function reachableZones(startId) {
  const byId = new Map(zonesApi.ZONES.map(z => [z.id,z]));
  const seen = new Set([startId]);
  const q = [startId];
  while (q.length) {
    const id = q.shift();
    for (const next of byId.get(id).connections) if (!seen.has(next)) { seen.add(next); q.push(next); }
  }
  return seen;
}

test('Zone Director espone profili e template riutilizzabili', () => {
  assert.ok(Object.keys(zoneDirector.PROFILE_LIBRARY).length >= 8);
  assert.ok(Object.keys(zoneDirector.NODE_TEMPLATES).length >= 5);
});

test('tutte le 8 zone esplorative sono Node Graph generici e completamente percorribili', () => {
  assert.equal(explorable.length, 8);
  for (const z of explorable) {
    assert.ok(z.nodes && z.nodes.length >= 4, `${z.id}: nodes mancanti`);
    assert.ok(z.entryNodeId, `${z.id}: entry mancante`);
    const reached = reachableNodes(z);
    assert.equal(reached.size, z.nodes.length, `${z.id}: grafo non completamente connesso`);
  }
});

test('ogni zona esplorativa ha Encounter distribuito, Safe Entry libera e identità tattica', () => {
  for (const z of explorable) {
    assert.ok(z.encounter && z.encounter.composition.length >= 6, `${z.id}: encounter insufficiente`);
    assert.ok(z.encounter.composition.every(e => e.nodeId !== z.entryNodeId), `${z.id}: nemico sulla Safe Entry`);
    assert.ok(z.operationalStructure, `${z.id}: struttura mancante`);
    assert.ok(z.shelterOpportunity, `${z.id}: ripari mancanti`);
    assert.ok(z.partyBoostOpportunity, `${z.id}: Party Boost mancante`);
    assert.ok(z.vehicleOpportunity, `${z.id}: mezzo mancante`);
  }
});

test('tutte le zone della World Map sono raggiungibili da qualunque zona esterna', () => {
  for (const start of zonesApi.ZONES.filter(z => z.ring === 'esterno')) {
    assert.equal(reachableZones(start.id).size, zonesApi.ZONES.length, `${start.id}: World Map spezzata`);
  }
});

test('runtime: entrare in ciascuna zona esplorativa genera subito tutti i nemici sui nodi senza duplicarli', () => {
  for (const def of explorable) {
    const state = loop.createGame({ players:[{id:'p1',name:'P1'}], zones:zonesApi.buildLoopZones(combat), bossConfig:{zoneId:'central-fortress',activationRound:10} });
    const p = loop.getPlayer(state,'p1');
    p.zoneId = def.id;
    p.nodeId = def.entryNodeId;
    loop.ensureNodeEncounter(state, def.id, def.entryNodeId);
    const expected = def.encounter.composition.length;
    assert.equal(loop.enemiesInZone(state,def.id).length, expected, `${def.id}: spawn errato`);
    loop.ensureNodeEncounter(state, def.id, def.entryNodeId);
    assert.equal(loop.enemiesInZone(state,def.id).length, expected, `${def.id}: encounter duplicato`);
    assert.ok(loop.enemiesInZone(state,def.id).every(e => def.nodes.some(n => n.id === e.nodeId)), `${def.id}: enemy node invalido`);
  }
});

test('Forest resta compatibile con il pilot già validato', () => {
  const z = zonesApi.ZONES.find(z => z.id === 'forest');
  assert.equal(z.entryNodeId,'forest-n01');
  assert.equal(z.nodes.length,4);
  assert.equal(z.encounter.composition.length,6);
  assert.equal(z.operationalStructure.id,'forest-armored-camp');
});

test('runtime World Map: il giocatore può scegliere un collegamento e passare Forest → Ancient Ruins → Central Fortress', () => {
  const state = loop.createGame({ players:[{id:'p1',name:'P1'}], zones:zonesApi.buildLoopZones(combat), bossConfig:{zoneId:'central-fortress',activationRound:10} });
  loop.landPlayer(state,'p1','forest',()=>0.99,6);
  const p = loop.getPlayer(state,'p1');
  assert.equal(p.nodeId,'forest-n01');
  p.movedThisRound = false;
  loop.moveAction(state,'p1','ancient-ruins',()=>0.99,6);
  assert.equal(p.zoneId,'ancient-ruins');
  assert.equal(p.nodeId,'ancient-ruins-n01');
  assert.equal(loop.enemiesInZone(state,'ancient-ruins').length,6);
  p.movedThisRound = false;
  loop.moveAction(state,'p1','central-fortress',()=>0.99,6);
  assert.equal(p.zoneId,'central-fortress');
  assert.equal(p.nodeId,'central-fortress-n01');
});

test('Node Layout Editor: clone/apply modifica coordinate senza cambiare ids e contenuti', () => {
  const source = zonesApi.ZONES.find(z => z.id === 'forest');
  const copy = JSON.parse(JSON.stringify(source));
  const layout = zoneDirector.cloneNodeLayout(copy);
  layout.nodes[0].x = 27;
  layout.nodes[0].y = 73;
  zoneDirector.applyNodeLayout(copy, layout);
  assert.equal(copy.nodes[0].id, 'forest-n01');
  assert.equal(copy.nodes[0].x, 27);
  assert.equal(copy.nodes[0].y, 73);
  assert.equal(copy.entryNodeId, 'forest-n01');
  assert.ok(copy.nodes.find(n => n.id === 'forest-n03').contents);
});

test('Node Layout Editor: collegamenti si possono creare e rimuovere in modo simmetrico', () => {
  const layout = zoneDirector.createTemplateLayout('editor-test', 'diamond5');
  const a = layout.nodes[0], b = layout.nodes[1];
  // il template li collega già: il primo toggle rimuove.
  let out = zoneDirector.toggleNodeConnection(layout, a.id, b.id);
  assert.equal(out.connected, false);
  assert.equal(Object.values(a.connections).includes(b.id), false);
  assert.equal(Object.values(b.connections).includes(a.id), false);
  out = zoneDirector.toggleNodeConnection(layout, a.id, b.id);
  assert.equal(out.connected, true);
  assert.ok(Object.values(a.connections).includes(b.id));
  assert.ok(Object.values(b.connections).includes(a.id));
});

test('Node Layout Editor: può creare un layout base anche per una zona senza Node Graph', () => {
  const layout = zoneDirector.createTemplateLayout('central-fortress', 'diamond5');
  assert.equal(layout.zoneId, 'central-fortress');
  assert.equal(layout.nodes.length, 5);
  assert.equal(layout.entryNodeId, 'central-fortress-n01');
});


test('Node Layout Editor: uno stesso nodo accetta più collegamenti nella stessa direzione geometrica', () => {
  const layout = {
    version: 1,
    zoneId: 'multi-edge',
    entryNodeId: 'a',
    nodes: [
      { id:'a', x:10, y:50, connections:{} },
      { id:'b', x:60, y:40, connections:{} },
      { id:'c', x:70, y:60, connections:{} },
      { id:'d', x:80, y:50, connections:{} }
    ]
  };
  const first = zoneDirector.toggleNodeConnection(layout,'a','b');
  const second = zoneDirector.toggleNodeConnection(layout,'a','c');
  const third = zoneDirector.toggleNodeConnection(layout,'a','d');
  assert.equal(first.connected,true);
  assert.equal(second.connected,true);
  assert.equal(third.connected,true);
  assert.deepEqual(new Set(Object.values(layout.nodes[0].connections)), new Set(['b','c','d']));
  assert.ok(Object.keys(layout.nodes[0].connections).some(k => k === 'right'));
  assert.ok(Object.keys(layout.nodes[0].connections).some(k => k === 'right2'));
  assert.ok(Object.keys(layout.nodes[0].connections).some(k => k === 'right3'));
});


test("Map 01: tutti i 9 layout ufficiali sono applicati, con entry valida e grafo connesso", () => {
  assert.equal(Object.keys(zonesApi.OFFICIAL_LAYOUTS || {}).length, 9);
  zonesApi.ZONES.forEach((zone) => {
    assert.ok(zone.nodes && zone.nodes.length >= 4, `${zone.id}: nodi ufficiali mancanti`);
    assert.ok(zone.entryNodeId, `${zone.id}: entry mancante`);
    const ids = new Set(zone.nodes.map((n) => n.id));
    assert.ok(ids.has(zone.entryNodeId), `${zone.id}: entry non valida`);
    const adj = new Map(zone.nodes.map((n) => [n.id, new Set(Object.values(n.connections || {}))]));
    const seen = new Set([zone.entryNodeId]), queue = [zone.entryNodeId];
    while (queue.length) {
      const id = queue.shift();
      (adj.get(id) || []).forEach((next) => { if (!seen.has(next)) { seen.add(next); queue.push(next); } });
    }
    assert.equal(seen.size, zone.nodes.length, `${zone.id}: grafo non completamente raggiungibile`);
  });
});
