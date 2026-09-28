const assert = require('assert');
const combat = require('../engine/fortress-combat.js');
const zonesApi = require('../catalog/fortress-zones.js');
const loop = require('../engine/fortress-loop.js');

function game3(){
  const zones = zonesApi.buildLoopZones(combat);
  const s = loop.createGame({players:[{id:'p1',name:'P1'},{id:'p2',name:'P2'},{id:'p3',name:'P3'}],zones});
  ['p1','p2','p3'].forEach(id=>{const p=loop.getPlayer(s,id);p.zoneId='forest';p.nodeId='forest-n01';p.status='active';p.present=true;});
  return s;
}
let n=0;
function t(name,fn){n++;try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e);process.exitCode=1}}

t('vehicle requires three eligible players',()=>{
  const s=game3(); const z=loop.getZone(s,'forest');
  loop.ensureVehicleOpportunity(s,'forest',()=>0);
  loop.getPlayer(s,'p3').present=false;
  assert.throws(()=>loop.boardVehicleCrew(s,'forest','p1',['p2','p3']),/Zona Sicura|equipaggio/);
});

t('vehicle salvo damages structure and can damage vehicle on bad pilot roll',()=>{
  const s=game3(); loop.ensureVehicleOpportunity(s,'forest',()=>0);
  loop.boardVehicleCrew(s,'forest','p1',['p2','p3']);
  const z=loop.getZone(s,'forest'); const before=z.operationalStructure.hp;
  const out=loop.resolveVehicleSalvo(s,'forest',[1,6,6]);
  assert.equal(out.integrityDamage,8); assert(out.damage>0); assert(z.operationalStructure.hp<before);
  assert(loop.getPlayer(s,'p1').offensiveSpentThisRound);
  assert(loop.getPlayer(s,'p2').offensiveSpentThisRound);
  assert(loop.getPlayer(s,'p3').offensiveSpentThisRound);
});

t('vehicle disappears when visit closes',()=>{
  const s=game3(); loop.ensureVehicleOpportunity(s,'forest',()=>0);
  ['p1','p2','p3'].forEach(id=>{loop.getPlayer(s,id).zoneId='abandoned-city'});
  loop.closeVehicleVisitIfEmpty(s,'forest');
  const z=loop.getZone(s,'forest'); assert.equal(z.vehicleVisit.vehicle,null); assert.equal(z.vehicleVisit.checked,false);
});

t('explosive weapon gains demolition bonus on structure node',()=>{
  const s=game3(); const p=loop.getPlayer(s,'p1'); p.nodeId='forest-n04';
  const z=loop.getZone(s,'forest'); const before=z.operationalStructure.hp;
  const out=loop.damageStructureWithWeapon(s,'p1',{id:'rocket_launcher',name:'Lanciarazzi',power:1},[6]);
  assert(out.demolitionBonus>=5); assert(z.operationalStructure.hp<before);
});

if(!process.exitCode) console.log(`OK ${n}/${n}`);

t('operational structure gets its own physical-dice fire step',()=>{
  const s=game3();
  const prep=loop.prepareStructureStep(s,'forest');
  assert.equal(prep.type,'attack-player');
  const out=loop.resolveStructureStepFromRolls(s,prep,[6,6]);
  assert.equal(out.type,'structure-attack'); assert(out.total>=14);
});

t('structure prioritizes an occupied heavy vehicle',()=>{
  const s=game3(); loop.ensureVehicleOpportunity(s,'forest',()=>0); loop.boardVehicleCrew(s,'forest','p1',['p2','p3']);
  const prep=loop.prepareStructureStep(s,'forest'); assert.equal(prep.type,'attack-vehicle');
});


t('vehicle gunners can split fire between structure and enemy',()=>{
  const s=game3(); loop.ensureVehicleOpportunity(s,'forest',()=>0); loop.boardVehicleCrew(s,'forest','p1',['p2','p3']);
  const enemyId=loop.spawnEnemy(s,'normale','forest','forest-n04');
  const enemy=loop.getEnemy(s,enemyId); const z=loop.getZone(s,'forest'); const structureBefore=z.operationalStructure.hp; const enemyBefore=enemy.hp;
  const out=loop.resolveVehicleSalvo(s,'forest',[4,6,6],[{kind:'structure',id:z.operationalStructure.id},{kind:'enemy',id:enemyId}],()=>1);
  assert.equal(out.targetResults.length,2);
  assert(z.operationalStructure.hp<structureBefore);
  assert(enemy.hp<enemyBefore);
});

t('vehicle gunners can concentrate fire on same enemy',()=>{
  const s=game3(); loop.ensureVehicleOpportunity(s,'forest',()=>0); loop.boardVehicleCrew(s,'forest','p1',['p2','p3']);
  const enemyId=loop.spawnEnemy(s,'resistente','forest','forest-n04');
  const enemy=loop.getEnemy(s,enemyId); const before=enemy.hp+enemy.shield;
  const out=loop.resolveVehicleSalvo(s,'forest',[4,6,6],[{kind:'enemy',id:enemyId},{kind:'enemy',id:enemyId}],()=>1);
  const after=enemy.hp+enemy.shield;
  assert(after<before);
  assert.equal(out.targetResults.filter(x=>x.kind==='enemy').length,1);
});
