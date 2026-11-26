const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../engine/fortress-skins-core.js');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
let wallet=core.defaultState();
const walletApi={getBalance:id=>core.getBalance(wallet,id),
 addMoney(id,n){wallet=core.addMoney(wallet,id,n);return core.getBalance(wallet,id);},
 spend(id,n){const next=core.spendMoney(wallet,id,n);if(next===wallet)return false;wallet=next;return true;}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:[],MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'Eroe '+i})),
 setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
 walletApi,skinsCoreApi:core,
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
const json=s=>JSON.parse(JSON.stringify(run(s)));
const html=()=>root.innerHTML;
const book=()=>JSON.parse(saved.get('fortress-army-arena-companions-v1')||'{}');
const fresh=()=>run(`arenaLoadRoster();arenaNewTournament();arena.stage="ready";arena.players.forEach(p=>{p.hp=100;p.shield=0;p.skill=null;p.boost=false;p.giftWeapon=null})`);
const duel=(a,b,stage='attack')=>run(`arena.match={a:"${a}",b:"${b}",attack:[],defense:[]};arena.stage="${stage}"`);

// 1) Le sei creature richieste: prezzi tra 50 e 150, il Dragone di Lava è il più forte in attacco.
assert.deepEqual(json('ARENA_COMPANIONS.map(c=>c.name)'),['Gatto Fulminante','Cincillà Allegro','Pungitopo Rotante','Ragno Velenoso','Stupido Troll','Dragone di Lava']);
assert.ok(run('ARENA_COMPANIONS.every(c=>c.price>=50&&c.price<=150)'));
assert.equal(run('ARENA_COMPANIONS.filter(c=>c.attackBonus===2).map(c=>c.id).join()'),'dragone-di-lava');

// Ogni compagno ha la sua foto su disco.
for(const id of json('ARENA_COMPANIONS.map(c=>c.id)')){
  assert.equal(run(`arenaCreatureImage("${id}")`),`assets/fortress/enemy/${id}.webp`);
  assert.ok(fs.existsSync(`${__dirname}/../assets/fortress/enemy/${id}.webp`),id);
}

// 2) Acquisto: serve il saldo; si paga una volta sola e si ha un solo compagno.
fresh();
run('arenaBuyCompanion("p0","dragone-di-lava")');
assert.equal(run('arena.players[0].pet'),null);
wallet=core.addMoney(wallet,'a0',200);
run('renderArena()');
assert.ok(html().includes('data-arena="buy-companion"'));
run('arenaBuyCompanion("p0","dragone-di-lava")');
assert.equal(core.getBalance(wallet,'a0'),50);
assert.equal(run('arena.players[0].pet.bought'),true);
assert.equal(book().a0,'dragone-di-lava');
run('arenaBuyCompanion("p0","gatto-fulminante")');
assert.equal(core.getBalance(wallet,'a0'),50);

// 3) Attacco: prima si sceglie, poi si tira. Con il compagno +2.
duel('p0','p1');
assert.equal(run('arenaPetAttackPending()'),true);
run('arenaInputDie(3);renderArena()');
assert.equal(run('arena.match.attack.length'),0);
assert.ok(html().includes('data-arena="pet-attack"'));
run('arenaChoosePetAttack(true);arenaInputDie(3);arenaInputDie(3);arenaConfirmDice()');
assert.equal(run('arenaDiceTotal(arena.players[0],arena.match.attack,true)'),8);
run('arena.match.defense=[2,2];arenaResolve()'); // 8 contro 4: colpo, il compagno resta intatto
assert.equal(run('arena.result.attack'),8);
assert.equal(run('arena.players[0].pet.hp'),120);

// 4) Attacco parato: il compagno perde 20 HP e il bonus resta nel riepilogo.
run('arena.players[1].hp=100');duel('p0','p1');
run('arenaChoosePetAttack(true);arena.match.attack=[1,1];arena.stage="defense";arena.match.defense=[6,6];arenaResolve();renderArena()');
assert.equal(run('arena.players[0].pet.hp'),100);
assert.equal(run('arena.result.petAttack.hurt'),20);
assert.ok(html().includes('Dragone di Lava perde 20 HP'));

// 5) Attacco da solo: niente bonus, niente rischio.
duel('p0','p1');
run('arenaChoosePetAttack(false);arena.match.attack=[1,1];arena.stage="defense";arena.match.defense=[6,6];arenaResolve()');
assert.equal(run('arena.result.attack'),2);
assert.equal(run('arena.players[0].pet.hp'),100);

// 6) Il compagno comprato non si può rubare.
duel('p1','p0');
assert.equal(run('arenaStealChoicePending()'),false);
// ...e chi ha un compagno non può rubare le creature catturate (non ha posto).
run('arena.players[1].pet={species:"puma",name:"Puma",icon:"🐆",hp:50,maxHp:70}');
duel('p0','p1');run('arenaChoosePetAttack(false)');
assert.equal(run('arenaStealChoicePending()'),false);
run('arena.players[1].pet=null');

// 7) A 0 HP in difesa è esausto, non muore: niente più difesa né attacco in questo torneo.
run('arena.players[0].hp=100;arena.players[0].pet.hp=10');
duel('p1','p0','defense');
run('arenaChoosePetDefense(true);arena.match.attack=[3,3];arena.match.defense=[3,2];arenaResolve()');
assert.equal(run('arena.players[0].pet.hp'),0);
assert.equal(run('arena.players[0].hp'),70);
assert.equal(book().a0,'dragone-di-lava');
duel('p0','p1');assert.equal(run('arenaPetAttackPending()'),false);
duel('p1','p0','defense');assert.equal(run('arenaPetChoicePending()'),false);

// 8) RESET e nuovo torneo: il padrone è vivo, il compagno torna con tutti gli HP.
run('arenaResetTournament()');fresh();
assert.equal(run('arena.players[0].pet.name'),'Dragone di Lava');
assert.equal(run('arena.players[0].pet.hp'),120);

// 9) La cattura di una creatura libera non sostituisce il compagno (il bonus in euro resta).
run('arena.animals.fighters=[{id:"animal-1-lupo",species:"lupo",name:"Lupo",icon:"🐺",animal:true,maxHp:65,hp:20,shield:0,attacks:0,defends:0,lastMatch:0}]');
duel('p0','animal-1-lupo');
run('arenaChoosePetAttack(false);arena.match.attack=[6,6];arena.stage="defense";arena.match.defense=[1,1];arenaResolve();renderArena()');
assert.equal(run('arena.players[0].pet.name'),'Dragone di Lava');
assert.equal(run('arena.result.captured.kept'),'Dragone di Lava');
assert.ok(html().includes('tiene il suo compagno'));
assert.ok(run('arena.result.earnings.some(e=>e.amount===3)'));

// 10) Padrone eliminato: il compagno muore con lui, anche dopo un RESET.
run('arena.players[0].hp=10');
duel('p1','p0','defense');
run('arenaChoosePetDefense(false);arena.match.attack=[6,6];arena.match.defense=[1,1];arenaResolve();renderArena()');
assert.equal(run('arena.players[0].pet'),null);
assert.equal(book().a0,undefined);
assert.ok(html().includes('muore insieme a P0'));
run('arenaResetTournament()');fresh();
assert.equal(run('arena.players[0].pet'),null);

// 11) Muore anche se il padrone cade attaccando (arma maledetta o furto fallito) o nella Splatter House.
wallet=core.addMoney(wallet,'a1',100);
run('arenaBuyCompanion("p1","gatto-fulminante");arena.exchange=10;arena.splatter={target:1,count:0,rolls:[],outcomes:[],nextAt:5}');
assert.equal(book().a1,'gatto-fulminante');
run('arena.players[1].hp=30;arenaBeginSplatter();arenaSplatterInput(6);arenaSplatterInput(1);arenaSplatterInput(6);renderArena()');
assert.equal(run('arena.players[1].pet'),null);
assert.equal(book().a1,undefined);
assert.ok(html().includes('Gatto Fulminante muore con il padrone'));

// 12) Il campione conserva il compagno nel torneo successivo.
fresh();wallet=core.addMoney(wallet,'a2',100);
run('arenaBuyCompanion("p2","cincilla-allegro");arena.players[0].hp=0;arena.players[1].hp=0;arenaWinnerStage();renderArena()');
assert.ok(html().includes('sopravvive e torna nel prossimo torneo'));
run('arena=null');fresh();
assert.equal(run('arena.players[2].pet.name'),'Cincillà Allegro');

// 13) Una creatura libera che attacca non riceve la scelta del furto.
run('arena.players[0].pet={species:"puma",name:"Puma",icon:"🐆",hp:50,maxHp:70};arena.animals.fighters=[{id:"animal-1-lupo",species:"lupo",name:"Lupo",icon:"🐺",animal:true,maxHp:65,hp:65,shield:0,attacks:0,defends:0,lastMatch:0}]');
duel('animal-1-lupo','p0');
assert.equal(run('arenaStealChoicePending()'),false);
console.log('V69: compagni in vendita, attacco insieme, niente furto, esaurimento e morte con il padrone OK');
