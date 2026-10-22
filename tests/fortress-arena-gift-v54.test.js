const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const giftSource=fs.readFileSync(__dirname+'/../fortress-gift-machine.js','utf8');
const rarities=['comune','non-comune','rara','epica','leggendaria','mitica'];
const catalog={ARMI:rarities.map((r,i)=>({id:'w'+i,name:'Arma '+r,rarity:r})),getImage:()=>null};
const env={FORTRESS_ARMI_API:catalog,Math};vm.createContext(env);vm.runInContext(giftSource,env);
for(let n=1;n<=6;n++)assert.equal(env.FORTRESS_GIFT_MACHINE.drawArenaWeapon(n,()=>0).rarity,rarities[n-1]);
assert.ok(env.FORTRESS_GIFT_MACHINE.drawWeapon,'estrazione originale Avventura conservata');
const source=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
const start=source.indexOf('  const ARENA_KEY =');const code=source.slice(start,source.indexOf('  /* =========================================================================\n     AVVIO',start));
const saved=new Map(),root={hidden:false,innerHTML:'',addEventListener(){}};
const ctx={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},giftMachineApi:env.FORTRESS_GIFT_MACHINE,
 MAX_PLAYERS:10,CHARACTERS:Array.from({length:10},(_,i)=>({id:'a'+i,name:'A'+i})),setupPlayers:Array.from({length:3},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:true})),setupCount:3,defaultSetupPlayers:()=>Array.from({length:10},(_,i)=>({id:'p'+i,name:'P'+i,avatarId:'a'+i,present:i<3})),escapeHtml:String,renderSetup(){},playSfx(){},document:{createElement(){return root},body:{appendChild(){}}},$(){return null},Math};
vm.createContext(ctx);vm.runInContext(code,ctx);const run=s=>vm.runInContext(s,ctx);
run('arenaLoadRoster();arenaNewTournament()');assert.equal(run('arena.stage'),'gift');
for(let n=1;n<=3;n++){run('arenaGiftRoll('+n+')');assert.equal(run('arenaGiftBonus(arena.players['+(n-1)+'])'),n-1);run('arenaGiftReveal();arenaGiftNext()');}
assert.equal(run('arena.stage'),'ready');assert.equal(run('arenaDiceTotal(arena.players[2],[3,3],true)'),8);
run('arenaEquipWeapon(arena.players[2], ARENA_LOOT_WEAPONS[0])');assert.equal(run('arena.players[2].giftWeapon'),null);
run('arenaJoinPlayer(3)');assert.equal(run('arena.players.length'),4);assert.equal(run('arena.players[3].giftWeapon.rarity'),'comune');
run('arena.stage="attack";arenaJoinPlayer(4)');assert.equal(run('arena.players.length'),4,'nessun join durante tiro');
console.log('V54: tiro D6, bonus, sostituzione, ingresso tardivo e compatibilità gift OK');
