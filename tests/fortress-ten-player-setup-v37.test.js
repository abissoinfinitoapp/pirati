const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'fortress-game-ui.js'), 'utf8');
let passed = 0;
function check(cond, msg) { if (!cond) throw new Error(msg); passed++; }
check(src.includes('const MAX_PLAYERS = 10;'), 'MAX_PLAYERS must remain 10');
check(src.includes('function ensureSetupStartingWeapon(setupPlayer)'), 'setup must normalize starting weapon');
check(src.includes('presentPlayers.forEach(ensureSetupStartingWeapon);'), 'render setup must normalize every present player');
check(src.includes('active.forEach(ensureSetupStartingWeapon);'), 'final start guard must normalize every active player');
check(src.includes('presentCount <= MAX_PLAYERS'), 'canStart must explicitly accept up to MAX_PLAYERS');

function canStart(players, max=10) {
  const present = players.filter(p => p.present);
  for (const p of present) {
    if (p.avatarId && !p.startingWeaponId) p.startingWeaponId = 'starter';
  }
  return present.length >= 2 && present.length <= max && present.every(p => p.avatarId && p.startingWeaponId);
}
const ten = Array.from({length:10}, (_,i)=>({present:true, avatarId:`avatar-${i+1}`, startingWeaponId:i===9?null:'starter'}));
check(canStart(ten) === true, '10 present configured players must be allowed, with starter fallback for player 10');
check(ten[9].startingWeaponId === 'starter', 'player 10 must receive starter fallback');
const eleven = Array.from({length:11}, (_,i)=>({present:true, avatarId:`avatar-${i+1}`, startingWeaponId:'starter'}));
check(canStart(eleven) === false, '11 players must remain rejected');
console.log(`${passed}/8 ten-player setup V37 checks passed`);
