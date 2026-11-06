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
const html=()=>root.innerHTML;
const at=n=>{const i=html().indexOf(n);assert.ok(i>=0,'manca '+n);return i;};
const duel=(att,def,extra='')=>run(`arenaLoadRoster();arenaNewTournament();arena.exchange=2;arena.match={a:arena.players[0].id,b:arena.players[1].id,attack:${JSON.stringify(att)},defense:${JSON.stringify(def)}};${extra}arenaResolve();renderArena()`);
const count=(re)=>(html().match(re)||[]).length;

// 1) KO: l'attaccante vince, il difensore è eliminato
duel([6,6],[1,1]);
assert.equal(run('arena.stage'),'result');
assert.equal(count(/class="fa-arena-outcome-card/g),2);
assert.equal(count(/fa-arena-ribbon">🏆 VINCE/g),1);
assert.ok(/fa-arena-outcome-card is-ko/.test(html()));
assert.ok(html().includes('💀 ELIMINATO'));assert.ok(html().includes('P1 È ELIMINATO'));
assert.ok(html().includes('fa-arena-ko'));
// ordine: esito → pulsante → dettaglio chiuso → combattenti
assert.ok(at('<div class="fa-arena-outcome"')<at('data-arena="next"'));
assert.ok(at('data-arena="next"')<at('<details class="fa-arena-damage-guide"'));
assert.ok(at('<details class="fa-arena-damage-guide"')<at('<section class="fa-arena-cards"'));
assert.ok(!/<details class="fa-arena-damage-guide" open/.test(html()),'dettaglio sempre chiuso');
assert.ok(html().includes('KO immediato: lo scudo non protegge'));
// before/after registrati
assert.equal(run('arena.result.before.d.hp'),100);assert.equal(run('arena.result.after.d.hp'),0);

// 2) Parata: vince chi difende, l'attaccante è "PARATO", nessun K.O.
duel([1,1],[6,6]);
assert.ok(html().includes('🛡️ PARATO'));assert.ok(html().includes('✅ NESSUN DANNO'));
assert.equal(count(/fa-arena-ribbon">🏆 VINCE/g),1);
assert.ok(!/fa-arena-outcome-card[^"]*is-ko/.test(html()));

// 3) Colpo a segno senza KO: HP e scudo persi, prima→dopo
duel([3,3],[2,2]);
assert.equal(run('arena.result.eliminated'),false);
assert.ok(html().includes('🎯 COLPO A SEGNO'));
assert.ok(/💥 −30 HP · 🛡️ −40/.test(html()));
assert.ok(html().includes('❤️ 100→70'));assert.ok(html().includes('🛡️ 40→0'));
assert.ok(/fa-arena-outcome-card is-hit/.test(html()));

// 4) Salvataggi precedenti alla V60 (senza before/after) non rompono il riepilogo
run('delete arena.result.before;delete arena.result.after;renderArena()');
assert.ok(html().includes('❤️ 100→70'));

// 5) Creature: foto in assets/fortress/enemy; emoji solo se l'id non è tra quelli con immagine
run('arena.animals.fighters.push({id:"animal-1-puma",species:"puma",name:"Puma",icon:"🐆",animal:true,maxHp:70,hp:70,shield:0});arena.match={a:arena.players[0].id,b:"animal-1-puma",attack:[4,4],defense:[2,2]};arenaResolve();renderArena()');
assert.ok(html().includes('src="assets/fortress/enemy/puma.webp"'));
run('ARENA_CREATURE_IMAGES_READY.delete("puma");renderArena()');
assert.ok(html().includes('🐆'));assert.ok(!html().includes('enemy/puma.webp'));
// Ogni creatura del pool ha davvero il suo file: nessun 404 in gioco
const ids=run('ARENA_BEAST_POOL.map(c=>c.id)');
assert.equal(ids.length,24);
const senzaFoto=new Set(run('Array.from(ARENA_CREATURES_WITHOUT_IMAGE)'));
for(const id of ids) if(!senzaFoto.has(id)) assert.ok(fs.existsSync(__dirname+'/../assets/fortress/enemy/'+id+'.webp'),'manca assets/fortress/enemy/'+id+'.webp');
// Le creature senza foto mostrano l'emoji, mai un'immagine rotta
for(const id of senzaFoto) assert.equal(run(`arenaCreatureImage(${JSON.stringify(id)})`),null);
console.log('V60: riepilogo scontro con card vincitore/colpito/K.O., creature con foto OK');
