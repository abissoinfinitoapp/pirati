const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:[],MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'Eroe '+i,image:`img/a${i}.webp`})),
 setupPlayers:Array.from({length:4},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:4,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<4})),
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
const html=()=>root.innerHTML;
const PET='{species:"puma",name:"Puma",icon:"🐆",hp:50,maxHp:70}';
// Attaccante p0 (100 HP), difensore p1 con Puma catturata.
const setup=(extra='')=>run(`arenaLoadRoster();arenaNewTournament();arena.exchange=2;arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null;p.boost=false});arena.players[1].pet=${PET};arena.match={a:arena.players[0].id,b:arena.players[1].id,attack:[],defense:[]};arena.stage="attack";${extra}renderArena()`);

// 1) Con una creatura catturata l'attaccante deve scegliere prima di tirare.
setup();
assert.equal(run('arenaStealChoicePending()'),true);
assert.ok(html().includes('data-choice="steal"'),'manca il pulsante RUBA');
assert.ok(html().includes('data-choice="fight"'),'manca il pulsante COMBATTI');
assert.ok(!html().includes('aria-label="Tiro dei dadi"'),'il tiro non deve comparire prima della scelta');
run('arenaInputDie(3);arenaConfirmDice();renderArena()');
assert.equal(run('arena.match.attack.length'),0,'con la scelta pendente i dadi non si inseriscono');

// 2) COMBATTI: scontro normale, il sorteggio non c'è.
run('arenaChooseSteal(false);renderArena()');
assert.equal(run('arena.match.steal'),false);
assert.equal(run('arena.match.stealTarget'),undefined);
assert.ok(html().includes('aria-label="Tiro dei dadi"'));
assert.ok(!html().includes('FURTO:'));

// 3) RUBA: il numero sorteggiato sta tra 2 e 12 e compare nel banner.
setup();
run('arenaChooseSteal(true)');
const target=run('arena.match.stealTarget');
assert.ok(Number.isInteger(target)&&target>=2&&target<=12,'sorteggio fuori da 2-12: '+target);
assert.ok(html().includes(`<strong>${target}</strong> (±2)`));
assert.ok(html().includes('CONFERMA TIRO → VEDI SE RUBI'));

// 4) Furto riuscito con tiro esatto: la creatura passa all'attaccante con i suoi HP.
setup('arena.match.steal=true;arena.match.stealTarget=7;');
run('arenaInputDie(3);arenaInputDie(4);arenaConfirmDice()');
assert.equal(run('arena.stage'),'steal-result');
assert.equal(run('arena.stealResult.success'),true);
assert.equal(run('arena.players[0].pet.name'),'Puma');
assert.equal(run('arena.players[0].pet.hp'),50,'gli HP della creatura restano');
assert.equal(run('arena.players[1].pet'),null,'il proprietario perde la creatura');
assert.equal(run('arena.players[0].hp'),100,'nessun danno con il furto riuscito');
assert.ok(html().includes('FURTO RIUSCITO'));
assert.ok(html().includes('RUBA Puma'));

// 5) Tolleranza ±2: scarto 2 riesce, scarto 3 fallisce con almeno 40 HP di danno.
setup('arena.match.steal=true;arena.match.stealTarget=7;');
run('arenaInputDie(5);arenaInputDie(5);arenaConfirmDice()'); // totale 10: scarto 3
assert.equal(run('arena.stealResult.gap'),3);
assert.equal(run('arena.stealResult.success'),false);
assert.equal(run('arena.players[0].hp'),60,'fuori tolleranza: almeno 40 HP di danno');
assert.equal(run('arena.players[1].pet.name'),'Puma','la creatura resta al proprietario');
assert.ok(html().includes('FURTO FALLITO'));

setup('arena.match.steal=true;arena.match.stealTarget=7;');
run('arenaInputDie(2);arenaInputDie(3);arenaConfirmDice()'); // totale 5: scarto 2, dentro
assert.equal(run('arena.stealResult.success'),true,'scarto 2 deve riuscire');

// 6) Il furto fallito può eliminare l'attaccante, che perde la creatura che aveva.
setup('arena.players[0].hp=40;arena.match.steal=true;arena.match.stealTarget=12;arena.players[0].pet={species:"lupo",name:"Lupo",icon:"🐺",hp:10,maxHp:40};');
run('arenaInputDie(1);arenaInputDie(1);arenaConfirmDice()');
assert.equal(run('arena.players[0].hp'),0);
assert.equal(run('arena.players[0].pet'),null);

// 7) Dopo il furto c'è il pulsante "prossimo" e i colpi risultano registrati.
setup('arena.match.steal=true;arena.match.stealTarget=7;');
run('arenaInputDie(3);arenaInputDie(4);arenaConfirmDice()');
assert.ok(html().includes('data-arena="next"'));
assert.equal(run('arena.players[0].attacks'),1);
assert.equal(run('arena.players[1].defends'),1);
console.log('V66: furto creatura (scelta, sorteggio ±2, danno minimo 40 HP) OK');
