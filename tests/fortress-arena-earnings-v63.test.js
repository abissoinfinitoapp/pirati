const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const skinsCore=require('../engine/fortress-skins-core.js');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
let wallet=skinsCore.defaultState();
const walletApi={getBalance:id=>skinsCore.getBalance(wallet,id),addMoney(id,n){wallet=skinsCore.addMoney(wallet,id,n);return skinsCore.getBalance(wallet,id);}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:[],MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),
 setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
 walletApi,skinsCoreApi:skinsCore,
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=x=>vm.runInContext(x,ctx);
const bal=id=>skinsCore.getBalance(wallet,id);

run('arenaLoadRoster();arenaNewTournament()');
// Vittoria normale (attacco 6 > difesa 5, scarto 1): 5€ all'attaccante, nulla al difensore.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null});arena.match={a:"p0",b:"p1",attack:[3,3],defense:[2,3]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),5);assert.equal(bal('a1'),0);assert.equal(bal('a2'),0);
assert.deepEqual(JSON.parse(JSON.stringify(run('arena.result.earnings'))),[{id:'p0',name:'P0',amount:5}]);

// Vittoria epica (scarto +8): 8€ all'attaccante.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"p1",attack:[6,6],defense:[2,2]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),13);assert.equal(bal('a1'),0);

// Parata perfetta (difesa supera l'attacco di 10): 5€ al difensore, nulla all'attaccante.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"p2",attack:[1,1],defense:[6,6]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),13);assert.equal(bal('a2'),5);

// I guadagni sono nel riepilogo del torneo.
assert.deepEqual(JSON.parse(JSON.stringify(run('arena.earned'))),{p0:13,p2:5});

// Cattura di un animale: vittoria epica (8€) + 3€ per la cattura. Gli animali non guadagnano.
run('arena.animals.fighters=[{id:"animal-1-lupo",species:"lupo",name:"Lupo",icon:"x",animal:true,maxHp:65,hp:65,shield:0,attacks:0,defends:0,lastMatch:0}]');
run('arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"animal-1-lupo",attack:[6,6],defense:[2,2]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),24);
assert.equal(run('arena.result.captured.name'),'Lupo');
assert.equal(skinsCore.totalBalance(wallet),24+0+5);
assert.equal(Object.keys(wallet.walletByCharacter).some(k=>k.startsWith('animal')),false);

// Un RESET del torneo non toglie i soldi gia' guadagnati.
run('arenaResetTournament()');
assert.equal(bal('a0'),24);assert.equal(bal('a1'),0);assert.equal(bal('a2'),5);

// Vittoria del campione: 15€ una sola volta.
run('arenaNewTournament();arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null});arena.players.slice(1).forEach(p=>{p.hp=0});arena.players[0].hp=100;arena.animals.fighters=[];arena.stage="result";arena.exchange=3');
run('arenaWinnerStage()');
assert.equal(bal('a0'),39);
run('arenaWinnerStage()');
assert.equal(bal('a0'),39,'il premio del campione non si ripaga');

// Senza portafoglio (moduli non caricati) l'arena funziona lo stesso.
ctx.walletApi=null;
run('arenaNewTournament();arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"p1",attack:[3,3],defense:[2,3]};arena.stage="defense";arenaResolve()');
assert.deepEqual(JSON.parse(JSON.stringify(run('arena.result.earnings'))),[]);
console.log('V68: vittoria 5€, epica 8€, parata perfetta 5€, cattura 3€, campione 15€ OK');
