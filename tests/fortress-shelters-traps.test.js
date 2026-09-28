const test = require('node:test');
const assert = require('node:assert/strict');
const combat = require('../engine/fortress-combat.js');
const zonesApi = require('../catalog/fortress-zones.js');
const items = require('../catalog/fortress-items.js');
const loop = require('../engine/fortress-loop.js');
const director = require('../engine/fortress-director.js');

function makeState(n=2){
  const zones = zonesApi.buildLoopZones(combat);
  const players = Array.from({length:n},(_,i)=>({id:`p${i+1}`,name:`P${i+1}`}));
  const state = loop.createGame({players,zones});
  state.players.forEach(p=>{p.zoneId='forest';p.nodeId='forest-n02';p.present=true;p.status='active';});
  return state;
}

function setShelter(state,nodeId='forest-n02'){
  const z=loop.getZone(state,'forest');
  z.shelterVisit={serial:0,checked:true,shelters:[{id:'sh1',nodeId,name:'Capanno Abbandonato',trap:null}]};
  return z.shelterVisit.shelters[0];
}

test('Forest genera 0-2 ripari casuali senza usare entry o nodo struttura',()=>{
  const s=makeState(1); const z=loop.getZone(s,'forest');
  z.shelterVisit={serial:0,checked:false,shelters:[]};
  const seq=[0.95,0.0,0.99]; let i=0;
  const shelters=loop.ensureShelterOpportunity(s,'forest',()=>seq[i++]);
  assert.equal(shelters.length,2);
  assert.deepEqual(new Set(shelters.map(x=>x.nodeId)),new Set(['forest-n02','forest-n03']));
  assert(!shelters.some(x=>x.nodeId===z.entryNodeId));
  assert(!shelters.some(x=>x.nodeId===z.operationalStructure.nodeId));
});

test('ripari vengono ritirati quando la visita termina',()=>{
  const s=makeState(1); const z=loop.getZone(s,'forest');
  setShelter(s,'forest-n02');
  s.players[0].zoneId='abandoned-city';
  loop.closeVehicleVisitIfEmpty(s,'forest');
  assert.equal(z.shelterVisit.checked,false);
  assert.equal(z.shelterVisit.shelters.length,0);
  assert.equal(z.shelterVisit.serial,1);
});

test('NASCONDITI consuma azione e marca il giocatore nel riparo',()=>{
  const s=makeState(1); setShelter(s);
  const out=loop.hideInShelterAction(s,'p1');
  const p=loop.getPlayer(s,'p1');
  assert.equal(out.type,'hide');
  assert.equal(p.hiddenInShelter,true);
  assert.equal(p.hiddenNodeId,'forest-n02');
  assert.equal(p.actedThisRound,true);
});

test('nemico preferisce un bersaglio esposto rispetto a uno nascosto',()=>{
  const s=makeState(2); setShelter(s);
  const p1=loop.getPlayer(s,'p1'), p2=loop.getPlayer(s,'p2');
  p1.hiddenInShelter=true; p1.hiddenNodeId='forest-n02';
  p2.hiddenInShelter=false;
  s.enemies=[];
  const eid=loop.spawnEnemy(s,'normale','forest','forest-n02');
  const prep=loop.prepareEnemyStep(s,eid);
  assert.equal(prep.type,'attack');
  assert.equal(prep.targetId,'p2');
});

test('se tutti sono nascosti restano attaccabili ma il riparo toglie 1 dado',()=>{
  const s=makeState(2); setShelter(s);
  s.players.forEach(p=>{p.hiddenInShelter=true;p.hiddenNodeId='forest-n02';});
  s.enemies=[];
  const eid=loop.spawnEnemy(s,'normale','forest','forest-n02');
  const prep=loop.prepareEnemyStep(s,eid);
  assert.equal(prep.type,'attack');
  assert.equal(prep.effectBonus,-1);
  assert.equal(prep.diceCount,1); // clamp minimo Combat V2
});

test('Mina Improvvisata si piazza solo nel riparo e viene consumata',()=>{
  const s=makeState(1); setShelter(s);
  const p=loop.getPlayer(s,'p1');
  p.equipment.utility=items.findItem('mina_improvvisata');
  s.enemies=[];
  const out=loop.placeTrapAction(s,'p1');
  const sh=loop.getShelterAtNode(s,'forest','forest-n02');
  assert.equal(out.type,'place-trap');
  assert.equal(sh.trap.armed,true);
  assert.equal(sh.trap.damage,8);
  assert.equal(p.equipment.utility,null);
});

test('mina scatta quando un nemico entra nel nodo e può eliminarlo',()=>{
  const s=makeState(1); const p=loop.getPlayer(s,'p1');
  p.nodeId='forest-n03';
  const z=loop.getZone(s,'forest');
  z.shelterVisit={serial:0,checked:true,shelters:[{id:'sh3',nodeId:'forest-n03',name:'Rovine Coperte',trap:{type:'mina',name:'Mina Improvvisata',damage:8,ownerPlayerId:'p1',armed:true}}]};
  s.enemies=[];
  const eid=loop.spawnEnemy(s,'aggressivo','forest','forest-n02');
  const e=loop.getEnemy(s,eid); e.hp=8; e.maxHp=10;
  const prep=loop.prepareEnemyStep(s,eid);
  assert.equal(prep.type,'move');
  assert.equal(prep.toNodeId,'forest-n03');
  assert(prep.trapTriggered);
  assert.equal(prep.trapTriggered.damage,8);
  assert.equal(prep.trapTriggered.eliminated,true);
  assert.equal(e.hp,0);
  assert.equal(loop.getShelterAtNode(s,'forest','forest-n03').trap,null);
});

test('Director espone NASCONDITI e PIAZZA TRAPPOLA nel riparo',()=>{
  const s=makeState(1); setShelter(s);
  const p=loop.getPlayer(s,'p1');
  p.equipment.utility=items.findItem('mina_improvvisata');
  s.enemies=[];
  const ids=director.getAvailableActions(s,p).map(a=>a.id);
  assert(ids.includes('nasconditi'));
  assert(ids.includes('piazza_trappola'));
});

test('attaccare da un riparo rompe immediatamente lo stato nascosto',()=>{
  const s=makeState(1); setShelter(s);
  const p=loop.getPlayer(s,'p1'); p.hiddenInShelter=true; p.hiddenNodeId='forest-n02';
  s.enemies=[]; const eid=loop.spawnEnemy(s,'normale','forest','forest-n02');
  const weapon={id:'test',name:'Test',baseDice:1,range:'medio',power:0,special:{type:'none'}};
  loop.declarePlayerAttack(s,'p1',eid,weapon);
  assert.equal(p.hiddenInShelter,false);
  assert.equal(p.hiddenNodeId,null);
});
