const assert=require('node:assert/strict');
const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
ARMI:Array.from({length:12},(_,i)=>({id:'w'+i,name:'W'+i,rarity:'C'})),MAX_PLAYERS:10,
CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),
setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=x=>vm.runInContext(x,ctx);
run('arenaLoadRoster(); arenaNewTournament(); arena.players[1].hp=0; arena.players[2].hp=0; arena.stage="ready"; arena.animals.fighters=[{id:"animal-test",name:"Elefante",animal:true,maxHp:150,hp:150,shield:0,attacks:0,defends:0,lastMatch:0}]');
run('arenaChoosePair()');
assert.equal(run('arenaPlayer(arena.match.a).animal'),undefined,'prima sfida mista: attacca il bambino');
assert.equal(run('arenaPlayer(arena.match.b).animal'),true,'prima sfida mista: difende animale');
run('arena.match.attack=[6,6];arena.match.defense=[1,1];arenaResolve()');
assert.equal(run('arena.animals.fighters[0].hp'),0,'attacco del bambino elimina animale');
run('arena.animals.fighters=[{id:"animal-test2",name:"Orso",animal:true,maxHp:120,hp:120,shield:0,attacks:0,defends:0,lastMatch:0}];arena.stage="ready"');
run('arenaChoosePair()');
assert.equal(run('arenaPlayer(arena.match.a).animal'),true,'seconda sfida mista: attacca animale');
assert.equal(run('arenaPlayer(arena.match.b).animal'),undefined,'seconda sfida mista: difende bambino');
run('arena.stage="ready";arenaChoosePair()');
assert.equal(run('arenaPlayer(arena.match.a).animal'),undefined,'terza sfida mista: attacca bambino');
const stored=JSON.parse(saved.get('fortress-army-arena-pvp-v1'));
assert.equal(stored.mixedExchanges,3,'alternanza persistente');
console.log('V47: alternanza dei ruoli misti, danno agli animali e salvataggio OK');
