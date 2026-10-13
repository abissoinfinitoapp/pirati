const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');
const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const store=new Map();let confirmed=true;
const root={hidden:false,innerHTML:'',addEventListener() {}};
const ctx={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},confirm:()=>confirmed,
 ARMI:Array.from({length:10},(_,i)=>({id:'w'+i,name:'W'+i,rarity:'C'})),MAX_PLAYERS:10,
 CHARACTERS:[{id:'a',name:'A'},{id:'b',name:'B'}],setupPlayers:[{id:'p1',name:'P1',avatarId:'a',present:true},{id:'p2',name:'P2',avatarId:'b',present:true}],setupCount:2,
 defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:`empty${i}`,name:`Empty ${i}`,avatarId:null,present:false})),weaponsApi:{},imgTag:()=>'',escapeHtml:String,
 renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);
const run=s=>vm.runInContext(s,ctx);
run('arenaLoadRoster();arenaNewTournament()');
assert.equal(run('arena.stage'),'weapons');
assert.match(root.innerHTML,/data-arena="reset"/);
store.set('fortress-army-arena-prizes-v1','SAVED_PRIZES');
const roster=store.get('fortress-army-arena-roster-v1');
run('arenaResetTournament()');
assert.equal(run('arena'),null);
assert.equal(store.has('fortress-army-arena-pvp-v1'),false);
assert.equal(store.get('fortress-army-arena-prizes-v1'),'SAVED_PRIZES');
assert.equal(store.get('fortress-army-arena-roster-v1'),roster);
assert.match(root.innerHTML,/data-arena="start"/);
run('arenaNewTournament()');
assert.equal(run('arena.players.length'),2);
assert.match(source,/if \(typeof confirm !== "function" \|\| !confirm\(/);
console.log('V42: reset, ritorno al roster e isolamento Avventura OK');
