const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},
 ARMI:Array.from({length:12},(_,i)=>({id:'w'+i,name:'W'+i,rarity:'C'})),MAX_PLAYERS:10,
 CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),
 setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),
 weaponsApi:{},imgTag:()=>'',escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=x=>vm.runInContext(x,ctx);
run('arenaLoadRoster();arenaNewTournament();arena.players[1].hp=0;arena.players[2].hp=0;arenaWinnerStage();renderArena()');
assert.match(root.innerHTML,/Scegli una skill leggendaria/);
assert.equal(run('arena.skillChoices.length'),3);
const option=run('arena.skillChoices[0]');
run(`arenaAwardSkill(${JSON.stringify(option)})`);
assert.equal(run('arena.skillAwarded'),option);
assert.equal(JSON.parse(saved.get('fortress-army-arena-champion-skills-v1')).p0,option);
run('arenaNewTournament()');
assert.equal(run('arena.players[0].skill'),option);
assert.equal(run('arenaSkillBook().p0'),undefined);
run('arena.players[0].hp=0;arenaEliminateSkill(arena.players[0])');
assert.equal(run('arena.players[0].skill'),null);
for(const [id,expression,expect] of [
 ['fire','arenaDiceTotal(arena.players[0],[1,6],true)',9],
 ['devastating','arenaDiceTotal(arena.players[0],[1,6],true)',11],
 ['destiny','arenaSkillDice(arena.players[0],true)',3]]) {
 run(`arena.players[0].hp=100;arena.players[0].skill=${JSON.stringify(id)}`);
 assert.equal(run(expression),expect,id);
}
run('arena.players[0].skill="reroll";arena.match={a:"p0",b:"p1",attack:[1,6],defense:[],rerolled:{}};arena.stage="attack"');
run('arenaReroll()');assert.equal(run('arena.match.attack.length'),0);assert.equal(run('arena.match.rerolled.attack'),true);
run('arena.players[0].skill="fire";arena.players[1].hp=100;arena.players[1].skill=null;arena.match={a:"p0",b:"p1",attack:[2,2],defense:[1,2]};arena.stage="defense";arenaResolve()');
assert.equal(run('arena.result.attack'),6);
assert.equal(run('arena.result.delta'),3);
run('arena.players[1].hp=100;arena.players[1].skill="phoenix";arena.players[1].skillUsed={};arena.match={a:"p0",b:"p1",attack:[6,6],defense:[1,1]};arenaResolve()');
assert.equal(run('arena.players[1].hp'),40);
assert.equal(run('arena.players[1].skillUsed.phoenix'),true);
run('arena.match={a:"p0",b:"p1",attack:[6,6],defense:[1,1]};arenaResolve()');
assert.equal(run('arena.players[1].hp'),0);assert.equal(run('arena.players[1].skill'),null);
console.log('V46: reward selection, next tournament activation, death removal, dice bonuses, reroll and phoenix OK');
// Difesa eccellente, Schivata, Armatura e Vampiro
run('arena.players[0].hp=100;arena.players[0].skill="vampire";arena.players[1].hp=100;arena.players[1].skill="dodge";arena.players[1].skillUsed={};arena.match={a:"p0",b:"p1",attack:[3,4],defense:[2,3]};arenaResolve()');
assert.equal(run('arena.players[1].hp'),100);
assert.equal(run('arena.players[1].skillUsed.dodge'),true);
run('arena.players[1].skill="armor";arena.players[1].hp=100;arena.match={a:"p0",b:"p1",attack:[3,4],defense:[2,3]};arenaResolve()');
assert.equal(run('arena.result.percent'),40);
run('arena.players[0].hp=30;arena.players[1].skill=null;arena.match={a:"p0",b:"p1",attack:[3,4],defense:[2,3]};arenaResolve()');
assert.equal(run('arena.players[0].hp'),70);
run('arena.players[0].skill="defense";arena.players[0].hp=200;arena.players[0].maxHp=200;arena.players[0].shield=200;arena.players[0].skillUsed={};arena.players[1].hp=100;arena.players[2].hp=100;arena.animals.fighters=[];arena.stage="ready";arenaBeginSplatter()');
run('arenaSplatterInput(1);arenaSplatterInput(6);arenaSplatterInput(6)');
assert.equal(run('arena.players[0].hp'),200); // shield assorbe Splatter
assert.equal(run('arena.players[0].shield'),160);
console.log('V46: dodge, armor, vampire, shield and Splatter interaction OK');
