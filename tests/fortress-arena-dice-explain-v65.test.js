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
const text=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
const need=h=>[...h.matchAll(/<tr class="([^"]*)"><td>([^<]*)<\/td>/g)].map(m=>m[2]);

// 1) La scala usa la stessa regola di arenaResolve: per ogni scarto, il gradino giusto.
const expected={'-6':0,'-4':0,'-3':1,'-1':1,'0':2,'1':3,'2':4,'3':5,'4':6,'9':6};
for(const [delta,row] of Object.entries(expected)) assert.equal(run(`arenaLadderRow(${delta})`),row,`scarto ${delta}`);

// 2) Attacco 8, nessun bonus: quanto devono fare i 2 dadi di difesa.
assert.deepEqual(need(run('arenaLadderHtml(8,0,100,-1)')),['12','da 9 a 11','8','7','6','5','4 o meno']);
// Attacco 3: i colpi forti e il K.O. sono impossibili.
assert.deepEqual(need(run('arenaLadderHtml(3,0,100,-1)')),['7 o più','da 4 a 6','3','2','impossibile','impossibile','impossibile']);
// Attacco 16: niente difesa perfetta; un bonus d'arma +3 abbassa i numeri richiesti.
assert.deepEqual(need(run('arenaLadderHtml(16,0,100,-1)')),['impossibile','impossibile','impossibile','impossibile','impossibile','impossibile','12 o meno']);
assert.deepEqual(need(run('arenaLadderHtml(16,3,100,-1)')),['impossibile','impossibile','impossibile','12','11','10','9 o meno']);

// 3) Il totale con i bonus coincide con la somma dei pezzi mostrati.
run('arenaLoadRoster();arenaNewTournament();arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null});arena.players[0].skill="fire"');
assert.equal(run('arenaDiceTotal(arena.players[0],[4,4],true)'),10);
assert.deepEqual(JSON.parse(JSON.stringify(run('arenaBonusParts(arena.players[0],[4,4],true)'))),[{label:'Potenza di Fuoco',value:2}]);

// 4) Spiegazione: attacco 4+4+2=10, difesa 3+4=7, scarto 3 → devastante (80): scudo 40, vita −40.
run('arena.match={a:"p0",b:"p1",attack:[4,4],defense:[3,4]};arena.stage="defense";arenaResolve()');
const ex=text(run('arenaExplainHtml(arenaPlayer("p0"),arenaPlayer("p1"),arena.result,arena.match)'));
assert.ok(ex.includes('attacca: 4 + 4 + 2 (Potenza di Fuoco) = 10'),ex);
assert.ok(ex.includes('difende: 3 + 4 = 7'),ex);
assert.ok(ex.includes("10 − 7: l'attacco è più alto di 3 → 💥 COLPO DEVASTANTE"),ex);
assert.ok(ex.includes('80 punti di danno → 🛡️ lo scudo ne ferma 40 → ❤️ la vita perde 40'),ex);

// 5) Parata: la difesa più alta lo dice in chiaro.
run('arena.players.forEach(p=>{p.hp=100;p.shield=40;p.skill=null});arena.match={a:"p0",b:"p2",attack:[2,3],defense:[3,4]};arena.stage="defense";arenaResolve()');
const ex2=text(run('arenaExplainHtml(arenaPlayer("p0"),arenaPlayer("p2"),arena.result,arena.match)'));
assert.ok(ex2.includes('la difesa è più alta di 2 → 🛡️ PARATA'),ex2);
assert.ok(ex2.includes('10 punti di danno → 🛡️ lo scudo ne ferma 10 → ❤️ la vita resta intatta'),ex2);

// 6) Pannello di difesa: mostra il totale d'attacco ed evidenzia il gradino appena i dadi sono inseriti.
const help=run('arenaDefenseHelp(arenaPlayer("p0"),arenaPlayer("p1"),8,[5,3])');
assert.ok(help.includes('ha fatto <span class="fa-arena-big">8</span>'));
assert.ok(/is-active"><td>8<\/td><td><strong>😬 PARATA AL LIMITE/.test(help));
console.log('V65: scala della difesa e spiegazione del risultato OK');
