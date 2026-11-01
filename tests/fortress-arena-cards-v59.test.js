const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},ARMI:[],MAX_PLAYERS:10,
 CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'Eroe '+i,image:`img/a${i}.webp`})),
 setupPlayers:Array.from({length:4},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:4,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<4})),
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
const at=(needle)=>{const i=root.innerHTML.indexOf(needle);assert.ok(i>=0,'manca '+needle);return i;};

run('arenaLoadRoster();arenaNewTournament();arena.match={a:arena.players[0].id,b:arena.players[1].id,attack:[],defense:[]};arena.stage="attack";arena.exchange=1;renderArena()');
// Ordine su smartphone: duellanti → dadi → istruzioni sul valore → combattenti
assert.ok(at('<div class="fa-arena-duel"')<at('fa-arena-roll-slots'));
assert.ok(at('fa-arena-roll-slots')<at('class="fa-arena-dice"'));
assert.ok(at('class="fa-arena-dice"')<at('<details class="fa-arena-damage-guide"'));
assert.ok(at('<details class="fa-arena-damage-guide"')<at('<section class="fa-arena-cards"'));
// Un pulsante per ogni combattente, una sola scheda con la foto del personaggio
assert.equal((root.innerHTML.match(/data-arena="card"/g)||[]).length,4);
assert.equal((root.innerHTML.match(/class="fa-arena-card /g)||[]).length,1);
assert.ok(root.innerHTML.includes('src="img/a0.webp"'),'foto del personaggio nella scheda');
assert.ok(/data-card="p0"[^>]*>P0</.test(root.innerHTML)||root.innerHTML.includes('P0</button>'));
// Scheda predefinita = chi sta tirando (attaccante); scelta manuale valida solo per lo stesso scontro/stadio
assert.equal(run('arenaSelectedFighter().id'),run('arena.players[0].id'));
run('arenaCardChoice={key:arenaCardKey(),id:arena.players[2].id}');
assert.equal(run('arenaSelectedFighter().name'),run('arena.players[2].name'));
run('arena.stage="defense"');
assert.equal(run('arenaSelectedFighter().id'),run('arena.players[1].id'),'cambio stadio: torna a chi tira');
// Eliminati: scheda con K.O. e pulsante attenuato
run('arena.players[3].hp=0;arenaCardChoice={key:arenaCardKey(),id:arena.players[3].id};renderArena()');
assert.ok(root.innerHTML.includes('fa-arena-ko'));assert.ok(root.innerHTML.includes('is-out'));
// Creature: foto in assets/fortress/enemy; emoji solo se l'immagine non è attiva
run('arena.animals.fighters.push({id:"animal-1-puma",species:"puma",name:"Puma",icon:"🐆",animal:true,maxHp:70,hp:70,shield:0});arenaCardChoice={key:arenaCardKey(),id:"animal-1-puma"};renderArena()');
assert.ok(root.innerHTML.includes('src="assets/fortress/enemy/puma.webp"'));
run('ARENA_CREATURE_IMAGES_READY.delete("puma");renderArena()');
assert.ok(root.innerHTML.includes('fa-arena-photo-emoji'));assert.ok(root.innerHTML.includes('🐆'));
console.log('V59: layout mobile Deathmatch (duellanti, dadi, istruzioni, pulsanti + scheda unica) OK');
