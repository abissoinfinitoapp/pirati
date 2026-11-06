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
const book=()=>JSON.parse(saved.get('fortress-army-arena-champion-skills-v1')||'{}');

// 1) p0 vince il primo torneo e conquista una skill.
run('arenaLoadRoster();arenaNewTournament();arena.players[1].hp=0;arena.players[2].hp=0;arenaWinnerStage();renderArena()');
// Finché il campione non sceglie, il torneo non si può annullare e il bottone RESET non compare.
assert.equal(run('arenaPrizePending()'),true);
assert.doesNotMatch(root.innerHTML,/data-arena="reset"/);
run('arenaAwardSkill(arena.skillChoices[0])');
const prize=run('arena.skillAwarded');
assert.equal(book().p0,prize);
assert.equal(run('arenaPrizePending()'),false);

// 2) Nuovo torneo: p0 usa la skill, ma resta nel libretto finché il torneo non finisce.
run('arena=null;arenaNewTournament()');
assert.equal(run('arena.players[0].skill'),prize);
assert.equal(book().p0,prize);

// 3) Qualcuno resetta il torneo a metà: p0 NON perde la skill.
run('arenaResetTournament()');
assert.equal(run('arena'),null);
assert.equal(book().p0,prize);

// 4) Reset ripetuti: la skill torna sempre attiva nel torneo seguente.
run('arenaNewTournament()');
assert.equal(run('arena.players[0].skill'),prize);
run('arenaResetTournament();arenaNewTournament()');
assert.equal(run('arena.players[0].skill'),prize);
assert.equal(book().p0,prize);

// 5) Torneo concluso davvero (p1 vince): la skill di p0 si consuma, p1 ne conquista una nuova.
run('arena.players[0].hp=0;arena.players[2].hp=0;arenaWinnerStage()');
assert.equal(book().p0,undefined);
run('arenaPrepareSkillChoices();arenaAwardSkill(arena.skillChoices[0])');
assert.ok(book().p1);

// 6) Il consumo avviene una volta sola e non cancella una skill appena conquistata dal vincitore.
run('arenaConsumeStartingSkills()');
assert.ok(book().p1);

// 7) Il vincitore con skill già in mano: la nuova skill sostituisce quella usata, non viene cancellata.
run('arena=null;arenaNewTournament()');
const old=run('arena.players[1].skill');
assert.ok(old);
run('arena.players[0].hp=0;arena.players[2].hp=0;arenaWinnerStage();arenaPrepareSkillChoices();arenaAwardSkill(arena.skillChoices[0])');
assert.ok(book().p1);
console.log('V62: la skill del campione resta salvata dopo i reset e si consuma solo a torneo concluso OK');
