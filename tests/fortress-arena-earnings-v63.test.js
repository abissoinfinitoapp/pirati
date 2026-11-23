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
// Scontro normale (scarto +1): 2€ a testa (V68: base 2€), ai personaggi giusti.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null});arena.match={a:"p0",b:"p1",attack:[3,3],defense:[2,3]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),2);assert.equal(bal('a1'),2);assert.equal(bal('a2'),0);
assert.deepEqual(JSON.parse(JSON.stringify(run('arena.result.earnings'))),[{id:'p0',name:'P0',amount:2},{id:'p1',name:'P1',amount:2}]);

// Scarto epico dell'attaccante (+8): 3€ a lui (base+epico), 2€ al difensore.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"p1",attack:[6,6],defense:[2,2]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),5);assert.equal(bal('a1'),4);

// Difesa perfetta (scarto <= -4): 3€ al difensore (base+epico), 2€ all'attaccante.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"p2",attack:[1,1],defense:[6,6]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),7);assert.equal(bal('a2'),3);

// I guadagni sono nel riepilogo del torneo.
assert.deepEqual(JSON.parse(JSON.stringify(run('arena.earned'))),{p0:7,p1:4,p2:3});

// Gli animali non guadagnano.
run('arena.animals.fighters=[{id:"animal-1-lupo",species:"lupo",name:"Lupo",icon:"x",animal:true,maxHp:65,hp:65,shield:0,attacks:0,defends:0,lastMatch:0}]');
run('arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"animal-1-lupo",attack:[6,6],defense:[2,2]};arena.stage="defense";arenaResolve()');
assert.equal(bal('a0'),10);
assert.equal(skinsCore.totalBalance(wallet),10+4+3);
assert.equal(Object.keys(wallet.walletByCharacter).some(k=>k.startsWith('animal')),false);

// Un RESET del torneo non toglie i soldi gia' guadagnati.
run('arenaResetTournament()');
assert.equal(bal('a0'),10);assert.equal(bal('a1'),4);assert.equal(bal('a2'),3);

// Senza portafoglio (moduli non caricati) l'arena funziona lo stesso.
ctx.walletApi=null;
run('arenaNewTournament();arena.players.forEach(p=>{p.hp=100;p.shield=40});arena.match={a:"p0",b:"p1",attack:[3,3],defense:[2,3]};arena.stage="defense";arenaResolve()');
assert.deepEqual(JSON.parse(JSON.stringify(run('arena.result.earnings'))),[]);
console.log('V63: guadagno per scontro, scarto epico, animali esclusi, reset senza perdite OK');
