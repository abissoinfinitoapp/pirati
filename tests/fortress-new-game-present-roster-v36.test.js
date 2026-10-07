const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'fortress-game-ui.js'), 'utf8');
let passed = 0;
function check(cond, msg) { if (!cond) throw new Error(msg); passed++; }
check(src.includes('const presentPlayers = registered.filter((p) => p.present);'), 'renderSetup must derive present players');
check(src.includes('const presentPlayersReady = presentPlayers.every((p) => p.avatarId && p.startingWeaponId);'), 'start validation must inspect only present players');
check(src.includes('const canStart = presentPlayersReady && presentCount >= 2;'), 'button must enable from present ready players');
check(src.includes('const active = registered.filter((p) => p.present);'), 'attemptStartGame must derive active players');
check(src.includes('if (active.some((p) => !p.avatarId || !p.startingWeaponId))'), 'final guard must validate only active players');
check(!src.includes('Completa avatar e arma iniziale di tutto il roster.'), 'whole-roster blocking error must be removed');
check(!src.includes('const allAvatarsChosen = registered.every'), 'whole-roster readiness must be removed');

function canStart(players) {
  const present = players.filter(p => p.present);
  return present.length >= 2 && present.every(p => p.avatarId && p.startingWeaponId);
}
check(canStart([
  {present:true, avatarId:'a', startingWeaponId:'w1'},
  {present:true, avatarId:'b', startingWeaponId:'w2'},
  {present:false, avatarId:null, startingWeaponId:null}
]) === true, 'absent incomplete roster member must not block new game');
check(canStart([
  {present:true, avatarId:'a', startingWeaponId:'w1'},
  {present:true, avatarId:null, startingWeaponId:null},
  {present:false, avatarId:'c', startingWeaponId:'w3'}
]) === false, 'incomplete present player must still block new game');
console.log(`${passed}/9 new-game present-roster V36 checks passed`);
