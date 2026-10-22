const assert=require('node:assert/strict');
const fs=require('node:fs');
const s=fs.readFileSync(__dirname+'/../fortress-game-ui.js','utf8');
assert.match(s,/id="fa-arena-gift-canvas"/,'canvas Rive Arena presente');
assert.match(s,/src: GIFT_RIVE_SRC, canvas/,'riusa asset Rive del gioco');
assert.match(s,/arenaGiftRiveTrigger\?\.fire\?\.\(\)/,'trigger Rive collegato');
assert.match(s,/fa-arena-gift-dice\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'D6 disposti su 3 colonne');
assert.match(s,/arena\.giftAnimating = false; arenaStore\(\)/,'ripristino gift dopo reload');
console.log('V55: canvas Rive, trigger, griglia mobile e recovery OK');
