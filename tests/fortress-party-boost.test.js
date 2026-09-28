const assert = require('assert');
const combat = require('../engine/fortress-combat.js');
const zonesApi = require('../catalog/fortress-zones.js');
const loop = require('../engine/fortress-loop.js');

function game3(){
  const zones = zonesApi.buildLoopZones(combat);
  const s = loop.createGame({players:[{id:'p1',name:'P1'},{id:'p2',name:'P2'},{id:'p3',name:'P3'}],zones});
  ['p1','p2','p3'].forEach(id=>{const p=loop.getPlayer(s,id);p.zoneId='forest';p.nodeId='forest-n02';p.status='active';p.present=true;p.actedThisRound=false;p.offensiveSpentThisRound=false;});
  return s;
}

let n=0;
function t(name,fn){n++;try{fn();console.log('PASS',name)}catch(e){console.error('FAIL',name,e);process.exitCode=1}}

t('Party Boost spawn is one visible event on an eligible node',()=>{
  const s=game3(); const z=loop.getZone(s,'forest');
  const seq=[0.10,0.00]; let i=0;
  const ev=loop.ensurePartyBoostOpportunity(s,'forest',()=>seq[i++]);
  assert(ev); assert.notEqual(ev.nodeId,z.entryNodeId); assert.notEqual(ev.nodeId,z.operationalStructure.nodeId);
  assert.strictEqual(loop.ensurePartyBoostOpportunity(s,'forest',()=>0.99),ev);
});

t('one success gives one Team Attack charge',()=>{
  const s=game3(); const z=loop.getZone(s,'forest');
  z.partyBoostVisit={serial:0,checked:true,event:{id:'b',name:'Party Boost',nodeId:'forest-n02',consumed:false,charges:0,successes:0,tier:null}};
  const out=loop.resolvePartyBoost(s,'p1',[
    {playerId:'p1',choice:3,roll:3},
    {playerId:'p2',choice:2,roll:4},
    {playerId:'p3',choice:5,roll:1}
  ]);
  assert.equal(out.tier,'party'); assert.equal(out.charges,1); assert.equal(loop.getPartyBoostCharges(s,'forest'),1);
});

t('two successes give two Team Attack charges',()=>{
  const s=game3(); const z=loop.getZone(s,'forest');
  z.partyBoostVisit={serial:0,checked:true,event:{id:'b',name:'Party Boost',nodeId:'forest-n02',consumed:false,charges:0,successes:0,tier:null}};
  const out=loop.resolvePartyBoost(s,'p1',[
    {playerId:'p1',choice:3,roll:3},
    {playerId:'p2',choice:4,roll:4},
    {playerId:'p3',choice:5,roll:1}
  ]);
  assert.equal(out.tier,'big'); assert.equal(out.charges,2);
});

t('Team Attack receives +1 die per participant and consumes one charge',()=>{
  const s=game3(); const z=loop.getZone(s,'forest');
  z.partyBoostVisit={serial:0,checked:true,event:{id:'b',name:'Party Boost',nodeId:'forest-n02',consumed:true,charges:2,successes:2,tier:'big'}};
  const enemyId=loop.spawnEnemy(s,'normale','forest','forest-n02');
  const w={id:'test',name:'Test',baseDice:1,range:'vicino',power:0,special:null};
  const declared=loop.declareTeamAttack(s,'p1',enemyId,[{playerId:'p1',weapon:w},{playerId:'p2',weapon:w}]);
  assert.equal(declared.partyBoostApplied,true);
  assert.equal(declared.participants[0].diceCount,3);
  assert.equal(declared.participants[1].diceCount,3);
  const out=loop.resolveTeamAttackFromRolls(s,declared,{p1:[1,1,1],p2:[1,1,1]},null,()=>0.99);
  assert.equal(out.partyBoostApplied,true);
  assert.equal(out.partyBoostChargesRemaining,1);
});

if(!process.exitCode) console.log(`OK ${n}/${n}`);
