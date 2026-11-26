const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
let roll=0; // valore restituito da Math.random: 0 = fortuna massima, 0.99 = nessun compagno
const math=Object.create(Math);math.random=()=>roll;
const giftMachineApi=require('../engine/fortress-gift-machine.js');
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:[],MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'Eroe '+i})),
 setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
 giftMachineApi,weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math:math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
const html=()=>root.innerHTML;
const book=()=>JSON.parse(saved.get('fortress-army-arena-companions-v1')||'{}');
const newDay=()=>saved.delete('fortress-army-arena-companion-gift-days-v1');
const start3=()=>run('arenaLoadRoster();arenaResetTournament();arenaNewTournament()');
const give=n=>run(`arenaGiftRoll(${n});arenaGiftReveal()`);

// 1) La schermata annuncia la possibilità; il 5 fortunato dà un compagno piccolo/medio al posto dell'arma.
start3();
assert.ok(html().includes('Con <strong>5 o 6</strong>'));
roll=0;give(5);
assert.equal(run('arena.players[0].pet.name'),'Gatto Fulminante');
assert.equal(run('arena.players[0].pet.bought'),true);
assert.equal(run('arena.players[0].giftWeapon'),null);
assert.equal(book().a0,'gatto-fulminante');
assert.ok(html().includes('HAI VINTO UN COMPAGNO'));
// Un secondo tiro per lo stesso giocatore non cambia nulla.
give(6);
assert.equal(run('arena.players[0].pet.name'),'Gatto Fulminante');
assert.equal(run('arena.players[0].giftWeapon'),null);
run('arenaGiftNext()');
assert.equal(run('arena.giftIndex'),1);

// 2) Il 6 fortunato dà una delle creature grandi.
roll=0.0;give(6);
assert.equal(run('arena.players[1].pet.name'),'Stupido Troll');
run('arenaGiftNext()');

// 3) 5 senza fortuna: arma leggendaria come prima.
roll=0.99;give(5);
assert.equal(run('arena.players[2].pet'),null);
assert.equal(run('arena.players[2].giftWeapon.rarity'),'leggendaria');
run('arenaGiftNext()');
assert.equal(run('arena.stage'),'ready');

// 4) Reset nello stesso giorno: chi ha il compagno lo tiene e riceve l'arma; chi ha già tirato non ritenta.
start3();roll=0;
assert.equal(run('arena.players[0].pet.name'),'Gatto Fulminante');
assert.ok(html().includes('è già con te'));
give(6);
assert.equal(run('arena.players[0].pet.name'),'Gatto Fulminante');
assert.equal(run('arena.players[0].giftWeapon.rarity'),'mitica');
run('arenaGiftNext()');give(1);run('arenaGiftNext()');
assert.ok(!html().includes('Con <strong>5 o 6</strong>'));
give(5);
assert.equal(run('arena.players[2].pet'),null);
assert.equal(run('arena.players[2].giftWeapon.rarity'),'leggendaria');

// 5) Il giorno dopo l'occasione torna. Con 1-4 non esce mai un compagno.
for(const n of [1,2,3,4]){newDay();saved.delete('fortress-army-arena-companions-v1');start3();roll=0;give(n);assert.equal(run('arena.players[0].pet'),null,'dado '+n);assert.ok(run('arena.players[0].giftWeapon'));}
newDay();start3();roll=0;give(5);
assert.equal(run('arena.players[0].pet.bought'),true);
// Anche il primo tiro basso consuma l'occasione del giorno.
newDay();saved.delete('fortress-army-arena-companions-v1');start3();roll=0;give(2);start3();give(6);
assert.equal(run('arena.players[0].pet'),null);

// 6) Con 5 o 6 si vince 3 volte su 4: in media un giocatore su quattro.
assert.equal(run('ARENA_COMPANION_GIFT_CHANCE'),75);
newDay();start3();roll=0.75;give(5);
assert.equal(run('arena.players[0].pet'),null);
newDay();start3();roll=0.74;give(5);
assert.equal(run('arena.players[0].pet.bought'),true);
console.log('V70: compagno come premio raro della Macchina dei Regali, una occasione al giorno OK');
