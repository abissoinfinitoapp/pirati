const assert=require('node:assert/strict');
const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const code=source.slice(source.indexOf('  const ARENA_KEY ='),source.indexOf('  /* =========================================================================\n     AVVIO',source.indexOf('  const ARENA_KEY =')));
assert.ok(code.length>5000);
const memory=new Map();
const context={localStorage:{setItem:(k,v)=>memory.set(k,v),getItem:(k)=>memory.get(k)||null},
 ARMI:Array.from({length:12},(_,i)=>({id:`w${i}`,name:`Arma ${i}`,rarity:i===0?'L':'C'})),
 setupPlayers:Array.from({length:10},(_,i)=>({id:`p${i}`,name:`Player ${i}`,avatarId:'a',present:true})),setupCount:10,
 escapeHtml:(s)=>String(s),renderSetup(){},playSfx(){},document:{createElement(){return {addEventListener(){},hidden:false}} ,body:{appendChild(){}}},$(){return null},Math};
vm.createContext(context);vm.runInContext(code,context);
const run=(expr)=>vm.runInContext(expr,context);
run('arenaNewTournament()');assert.equal(run('arena.players.length'),10);assert.equal(run('arena.stage'),'weapons');
run('arena.players.forEach(p=>p.weaponId=p.choices[0]);arena.stage="ready";arenaChoosePair()');
assert.equal(run('arena.match.attack.length'),0);
run('arena.match.attack=[1,6];arena.match.defense=[2,2];arenaResolve()');
assert.equal(run('arena.result.delta'),3);assert.equal(run('arena.result.percent'),80);assert.equal(run('arenaPlayer(arena.match.b).hp'),20);
run('arena.stage="ready";arenaChoosePair();arena.match.attack=[6,6];arena.match.defense=[1,1];arenaResolve()');
assert.equal(run('arena.result.eliminated'),true);
run('arena.stage="ready";arenaChoosePair();arena.match.attack=[2,2];arena.match.defense=[6,6];arenaResolve()');
assert.equal(run('arena.result.percent'),0);
assert.equal(run('arena.players.length'),10);
assert.equal(run('arenaPickWeapons().length'),3);
assert.equal(memory.has('fortress-army-active-session-v1'),false);
console.log('Arena smoke test: 10 partecipanti, 3 armi, +3/KO/parata, sessione Avventura intatta OK');
