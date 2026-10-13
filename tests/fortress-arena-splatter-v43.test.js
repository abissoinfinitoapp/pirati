const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(), root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:Array.from({length:12},(_,i)=>({id:'w'+i,name:'W'+i,rarity:'C'})),MAX_PLAYERS:10,
 CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),
 setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},
 document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
run('arenaLoadRoster();arenaNewTournament();arena.stage="ready"');
assert.equal(run('arenaBeginSplatter()'),true);
assert.equal(run('arena.stage'),'splatter');
run("renderArena()");assert.match(root.innerHTML,/SPLATTER HOUSE/);
run('arenaSplatterInput(1)');
assert.equal(run('arena.players[0].hp'),100,'No damage until every roll');
run('arenaSplatterInput(2)');
assert.equal(run('arena.players[1].hp'),100);
run('arenaSplatterInput(3)');
assert.equal(run('arena.stage'),'splatter-result');
assert.equal(run('arena.players[0].hp'),60);
assert.equal(run('arena.players[1].hp'),60);
assert.equal(run('arena.players[2].hp'),100);
run('arenaFinishSplatter()');
assert.equal(run('arena.stage'),'ready');
assert.equal(run('arena.splatter.count'),1);
run('arena.splatter.target=2;arena.exchange=3');
assert.equal(run('arenaBeginSplatter()'),true);
run('arena.players.forEach(p=>{p.hp=20;p.shield=0})');
run('arenaSplatterInput(1);arenaSplatterInput(2);arenaSplatterInput(1)');
assert.equal(run('arenaAlive().length'),0);
run('arenaFinishSplatter()');
assert.equal(run('arena.stage'),'splatter-winner');
assert.equal(run('arena.winner'),null);
assert.equal(saved.get('fortress-army-arena-splatter-wins-v1'),'1');
assert.equal(saved.get('fortress-army-arena-prizes-v1'),undefined);
run('arenaResetTournament()');
assert.equal(run('arena'),null);
assert.equal(saved.get('fortress-army-arena-splatter-wins-v1'),'1');
console.log('V43: sequential physical rolls, simultaneous damage, survivors, total elimination, no prize, persistent wins, reset OK');
