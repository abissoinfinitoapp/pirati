const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:[],MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),
 setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=x=>vm.runInContext(x,ctx);
const json=x=>JSON.parse(JSON.stringify(run(x)));
const lupo='{id:"animal-1-lupo",species:"lupo",name:"Lupo",icon:"🐺",animal:true,maxHp:65,hp:20,shield:0,attacks:0,defends:0,lastMatch:0}';

run('arenaLoadRoster();arenaNewTournament();arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null})');

// 1) Il giocatore elimina una creatura e la cattura con tutti i suoi HP.
run(`arena.animals.fighters=[${lupo}];arena.match={a:"p0",b:"animal-1-lupo",attack:[6,6],defense:[1,1]};arena.stage="defense";arenaResolve()`);
assert.deepEqual(json('arena.players[0].pet'),{species:'lupo',name:'Lupo',icon:'🐺',hp:65,maxHp:65});
assert.equal(run('arena.result.captured.name'),'Lupo');

// 2) Quando difende deve scegliere: finche' non sceglie, niente dadi.
run('arena.match={a:"p1",b:"p0",attack:[4,4],defense:[]};arena.stage="defense"');
assert.equal(run('arenaPetChoicePending()'),true);
run('arenaInputDie(3)');assert.equal(run('arena.match.defense.length'),0);

// 3) Difesa con la creatura: scarto +1 = 40 danni, tutti presi dal Lupo (65 -> 25). Giocatore intatto.
run('arenaChoosePetDefense(true);arena.match.defense=[4,3];arenaResolve()');
assert.equal(run('arena.players[0].hp'),100);assert.equal(run('arena.players[0].shield'),40);
assert.equal(run('arena.players[0].pet.hp'),25);
assert.deepEqual(json('arena.result.pet'),{name:'Lupo',absorbed:40,lost:false,hp:25,maxHp:65});

// 4) Difesa da solo: la creatura resta intatta, il danno va su scudo e HP come sempre.
run('arena.match={a:"p1",b:"p0",attack:[4,4],defense:[]};arena.stage="defense";arenaChoosePetDefense(false);arena.match.defense=[4,3];arenaResolve()');
assert.equal(run('arena.players[0].pet.hp'),25);
assert.equal(run('arena.players[0].shield'),0);assert.equal(run('arena.players[0].hp'),100);
assert.equal(run('arena.result.pet'),null);

// 5) Danni oltre gli HP della creatura: lei cade, il resto passa al giocatore (scudo poi HP).
run('arena.players[0].shield=10;arena.match={a:"p1",b:"p0",attack:[4,4],defense:[]};arena.stage="defense";arenaChoosePetDefense(true);arena.match.defense=[4,3];arenaResolve()');
assert.equal(run('arena.players[0].pet'),null);
assert.equal(run('arena.players[0].shield'),0);assert.equal(run('arena.players[0].hp'),95); // 40-25=15: 10 scudo + 5 HP
assert.equal(run('arena.result.pet.lost'),true);

// 6) Anche il KO immediato viene assorbito dalla creatura.
run(`arena.players[0].hp=100;arena.players[0].pet={species:"orso",name:"Orso",icon:"🐻",hp:120,maxHp:120}`);
run('arena.match={a:"p1",b:"p0",attack:[6,6],defense:[]};arena.stage="defense";arenaChoosePetDefense(true);arena.match.defense=[1,1];arenaResolve()');
assert.equal(run('arena.players[0].hp'),100);assert.equal(run('arena.players[0].pet.hp'),20);

// 7) Chi viene eliminato perde la creatura; le creature non catturano.
run('arena.players[0].hp=10;arena.players[0].shield=0;arena.match={a:"p1",b:"p0",attack:[6,6],defense:[]};arena.stage="defense";arenaChoosePetDefense(false);arena.match.defense=[1,1];arenaResolve()');
assert.equal(run('arena.players[0].hp'),0);assert.equal(run('arena.players[0].pet'),null);
run(`arena.animals.fighters=[{id:"animal-2-orso",species:"orso",name:"Orso",icon:"🐻",animal:true,maxHp:120,hp:120,shield:0,attacks:0,defends:0,lastMatch:0}];arena.players[2].hp=5;arena.players[2].shield=0`);
run('arena.match={a:"animal-2-orso",b:"p2",attack:[6,6],defense:[1,1]};arena.stage="defense";arenaResolve()');
assert.equal(run('arena.animals.fighters[0].pet'),undefined);

// 8) Una nuova cattura sostituisce la precedente.
run(`arena.players[1].pet={species:"puma",name:"Puma",icon:"🐆",hp:10,maxHp:70};arena.animals.fighters.push(${lupo})`);
run('arena.match={a:"p1",b:"animal-1-lupo",attack:[6,6],defense:[1,1]};arena.stage="defense";arenaResolve()');
assert.equal(run('arena.players[1].pet.name'),'Lupo');assert.equal(run('arena.result.captured.replaced'),'Puma');
console.log('V64: cattura creature, scelta in difesa, assorbimento danni e perdita OK');
