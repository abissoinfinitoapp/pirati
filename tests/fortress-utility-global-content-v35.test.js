const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'fortress-game-ui.js'), 'utf8');
function ok(cond, msg){ if(!cond) throw new Error(msg); }
const globalProgress = 'if (progress) progress.innerHTML = `<div class="fa-utility-card"><h3>🎒 B-Pack & Progressi</h3>';
const globalGifts = 'if (gifts) {';
const noPlayer = 'if (!player) {';
const iProgress = ui.indexOf(globalProgress);
const iGifts = ui.indexOf(globalGifts, iProgress);
const iNoPlayer = ui.indexOf(noPlayer, iGifts);
const checks = [
  [iProgress >= 0, 'B-Pack renderer missing'],
  [iGifts > iProgress, 'Regali renderer missing'],
  [iNoPlayer > iGifts, 'global utility content must render before active-player guard'],
  [ui.includes('Nessun giocatore attivo da mostrare.'), 'explicit inventory empty state missing'],
  [ui.includes('AVVIA GIRO REGALI'), 'gift machine action missing'],
  [ui.includes('B-Pack & Progressi'), 'B-Pack content missing']
];
checks.forEach(([cond,msg]) => ok(cond,msg));
console.log(`${checks.length}/${checks.length} utility global-content V35 checks passed`);
