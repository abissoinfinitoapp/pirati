const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'fortress-game-ui.js'), 'utf8');
function ok(cond, msg) { if (!cond) throw new Error(msg); }
const ids = [
  'boost','boss-appear','boss-attack','boss-defeated','boss-hit','boss-warning','chest-open','enemy-alert','enemy-turn',
  'gift-machine-jackpot','gift-machine-loop','gift-machine-slowdown','gift-machine-start','gift-machine-tick','gift-machine-win',
  'heal','invalid','inventory-equip','ko','loot-found','move','node-select','player-hit','rare-loot','roll-critical','roll-fail',
  'roll-request','roll-success','round-start','shelter-enter','shelter-exit','shield-hit','shield','storm-coming','storm-hit',
  'storm-warning','trap','turn-player','vehicle','victory','weapon-found','zone-enter'
];
ids.forEach((id) => {
  const file = path.join(root, 'sound', `${id}.mp3`);
  ok(fs.existsSync(file), `missing sound/${id}.mp3`);
  ok(ui.includes(`"${id}":"sound/${id}.mp3"`), `missing SFX map for ${id}`);
});
ok(ui.includes('function playSfx(id, options = {})'), 'central playSfx manager missing');
ok(ui.includes('started.catch(() => {})'), 'play() rejection must never break gameplay');
ok(ui.includes('document.addEventListener("pointerdown", unlockSfx'), 'mobile audio unlock hook missing');
ok(ui.includes('syncGameplaySfx();'), 'state-driven SFX sync missing from render');
ok(ui.includes('playSfx("chest-open")'), 'chest sound hook missing');
ok(ui.includes('playSfx("shelter-enter")'), 'shelter sound hook missing');
ok(ui.includes('playSfx("trap")'), 'trap sound hook missing');
ok(ui.includes('playSfx("heal")'), 'heal sound hook missing');
ok(ui.includes('playSfx("shield")'), 'shield sound hook missing');
ok(ui.includes('playSfx("zone-enter"'), 'zone enter sound hook missing');
ok(ui.includes('startSfxLoop("gift-machine-loop"'), 'gift machine loop hook missing');
ok(ui.includes('playSfx(jackpot ? "gift-machine-jackpot" : "gift-machine-win"'), 'gift reward sound hook missing');
ok(ui.includes('window.FORTRESS_SFX'), 'debug/API SFX handle missing');
console.log(`${ids.length + 13}/${ids.length + 13} sound system checks passed`);
