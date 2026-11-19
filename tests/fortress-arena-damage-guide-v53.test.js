const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.resolve(__dirname,'../fortress-game-ui.js'),'utf8');
assert.match(src,/function arenaDamageGuide\(defender\)/);
assert.match(src,/Math\.ceil\(hpMax\*\.4\)/);
assert.match(src,/Math\.ceil\(hpMax\*\.7\)/);
assert.match(src,/Math\.ceil\(hpMax\*\.8\)/);
assert.match(src,/const levels=\[0,40,70,80,100\]/);
assert.match(src,/arenaDamageGuide\(d\)/);
assert.match(src,/punti di danno → \$\{steps\.join/); // V65: danno → scudo → vita spiegati passo per passo
assert.match(src,/K.O.: lo scudo non serve/);
console.log('V53 damage guide: OK');
