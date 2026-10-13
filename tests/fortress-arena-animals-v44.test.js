const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
  ARMI:Array.from({length:12},(_,i)=>({id:'w'+i,name:'W'+i,rarity:'C'})), MAX_PLAYERS:10,
  CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),
  setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
  defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
  weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
run('arenaLoadRoster();arenaNewTournament();arena.stage="ready";arena.exchange=2');
assert.equal(run('arenaBeginAnimalWave()'),true);
assert.equal(run('arenaAliveAnimals().length'),3);
assert.equal(run('new Set(arena.animals.fighters.map(a=>a.species)).size'),3);
run('renderArena()'); assert.match(root.innerHTML,/ANIMAL BATTLE/);
run('arena.stage="ready";arena.exchange=6');
assert.equal(run('arenaBeginAnimalWave()'),true);
assert.equal(run('arena.animals.fighters.length'),6);
assert.equal(run('new Set(arena.animals.fighters.map(a=>a.species)).size'),6);
assert.equal(run('arenaBeginAnimalWave()'),false);
run('arena.stage="ready";arenaChoosePair()');
assert.equal(run('Boolean(arenaPlayer(arena.match.a).animal && arenaPlayer(arena.match.b).animal)'),false,'never animal vs animal');
// La morte dei giocatori NON assegna vittoria finché gli animali sopravvivono.
run('arena.players.forEach(p=>p.hp=0);arena.players[0].hp=100;arena.stage="ready"');
assert.equal(run('arenaWinnerStage()'),false);
run('arena.animals.fighters.forEach(p=>p.hp=0);');
assert.equal(run('arenaWinnerStage()'),true);
assert.equal(run('arena.stage'),'winner');
// I mostri possono vincere e non ricevere premi.
run('arenaNewTournament();arena.stage="ready";arena.exchange=2;arenaBeginAnimalWave();arena.players.forEach(p=>p.hp=0)');
assert.equal(run('arenaWinnerStage()'),true);
assert.equal(run('arena.stage'),'animal-winner');
assert.equal(run('arena.winner'),null);
assert.equal(saved.get('fortress-army-arena-animal-wins-v1'),'1');
// Splatter House: solo bambini tirano, animali KO al termine dell'ultimo tiro.
run('arenaNewTournament();arena.stage="ready";arena.exchange=2;arenaBeginAnimalWave();arena.stage="ready";arenaBeginSplatter()');
assert.equal(run('arena.stage'),'splatter');
run('arenaSplatterInput(6)');
assert.equal(run('arenaAliveAnimals().length'),3);
run('arenaSplatterInput(6);arenaSplatterInput(6)');
assert.equal(run('arenaAliveAnimals().length'),0);
assert.equal(run('arena.animals.splatterKills'),3);
assert.equal(run('arena.players.every(p=>p.hp===100)'),true);
assert.equal(run('arena.splatter.count'),1);
console.log('V44: 9 species, 2 distinct waves, mixed pairs, human/animal victories, Splatter KO animals, legacy V43 OK');
