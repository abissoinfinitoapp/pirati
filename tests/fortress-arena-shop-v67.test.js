const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const bal={a0:50,a1:0};
const walletApi={getBalance:id=>bal[id]||0,spend(id,n){if((bal[id]||0)<n)return false;bal[id]-=n;return true;}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:[],MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'Eroe '+i,image:`img/a${i}.webp`})),
 setupPlayers:Array.from({length:4},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:4,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<4})),
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},walletApi,
 document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
const html=()=>root.innerHTML;
const setup=(extra='')=>run(`arenaLoadRoster();arenaNewTournament();arena.exchange=2;arena.players.forEach(p=>{p.hp=100;p.shield=40;p.maxHp=100;p.skill=null;p.boost=false});arena.stage="ready";${extra}renderArena()`);

// 1) Il negozio compare tra i combattenti in "ready" con i 4 oggetti, chiuso di default.
bal.a0=50;bal.a1=0;
setup();
assert.ok(html().includes('<details class="fa-arena-damage-guide fa-arena-shop"'));
assert.ok(!/fa-arena-shop"\s+open/.test(html()),'negozio chiuso di default');
for(const id of ['potion-small','potion-large','shield','dice']) assert.ok(html().includes(`data-item="${id}"`),'manca '+id);
// 2) Il portafoglio appare nella scheda giocatore.
assert.ok(html().includes('Portafoglio: <strong>50€</strong>'));

// 3) Pozione piccola: scala 10€ e cura 40 HP (fino al massimo).
setup('arena.players[0].hp=70;');
run('arenaBuyItem(arena.players[0].id,"potion-small")');
assert.equal(bal.a0,40);
assert.equal(run('arena.players[0].hp'),100,'cura limitata al max');

// 4) Saldo insufficiente: niente acquisto né cura.
bal.a0=5; setup('arena.players[0].hp=50;');
run('arenaBuyItem(arena.players[0].id,"potion-small")');
assert.equal(bal.a0,5);assert.equal(run('arena.players[0].hp'),50);
assert.ok(html().includes('Soldi insufficienti'));

// 5) Pozione a HP pieni: bloccata senza spendere.
bal.a0=50; setup('arena.players[0].hp=100;');
run('arenaBuyItem(arena.players[0].id,"potion-large")');
assert.equal(bal.a0,50);

// 6) Scudo: +30 e costa 8€.
bal.a0=50; setup('arena.players[0].shield=10;');
run('arenaBuyItem(arena.players[0].id,"shield")');
assert.equal(bal.a0,42);assert.equal(run('arena.players[0].shield'),40);

// 7) Dado in più: imposta il boost, che il prossimo attacco consuma; non si ricompra due volte.
bal.a0=50; setup();
run('arenaBuyItem(arena.players[0].id,"dice")');
assert.equal(run('arena.players[0].boost'),true);assert.equal(bal.a0,35);
run('arenaBuyItem(arena.players[0].id,"dice")');
assert.equal(bal.a0,35,'il dado non si compra due volte');

// 8) Fuori dal tabellone "ready" non si compra nulla.
bal.a0=50; setup(); run('arena.stage="attack";arenaBuyItem(arena.players[0].id,"shield")');
assert.equal(bal.a0,50);

// 9) Il motore puro scala solo con saldo sufficiente.
const core=require('../engine/fortress-skins-core.js');
let st=core.addMoney(core.defaultState(),'a0',20);
assert.equal(core.getBalance(core.spendMoney(st,'a0',15),'a0'),5);
assert.equal(core.spendMoney(st,'a0',25),st,'spesa oltre il saldo: stato invariato');
assert.equal(core.spendMoney(st,'a0',0),st);

console.log('V67: negozio arena (pozioni, scudo, dado) con saldo e prezzi OK');
