const fs = require('fs');
const path = require('path');
const ui = fs.readFileSync(path.join(__dirname, '..', 'fortress-game-ui.js'), 'utf8');
function ok(cond, msg){ if(!cond) throw new Error(msg); }
ok(ui.includes('function supportItemEffectLabel(item)'), 'helper effetti supporto assente');
ok(ui.includes('sameSupportAlreadyEquipped'), 'manca rilevamento supporto identico');
ok(ui.includes('replacingSupport'), 'manca rilevamento sostituzione supporto');
ok(ui.includes('✅ GIÀ NEL TUO INVENTARIO'), 'manca stato già posseduto');
ok(ui.includes('replacingSupport ? "SOSTITUISCI" : "RACCOGLI"'), 'manca distinzione raccogli/sostituisci');
ok(ui.includes('Questa è un\'altra copia e resta a terra.'), 'manca spiegazione duplicato');
ok(ui.includes('resterà a terra.'), 'manca spiegazione oggetto sostituito');
ok(ui.includes('"CURA COMPLETA"'), 'manca etichetta cura completa');
ok(ui.includes('`+${item.amount || 0} HP`'), 'manca effetto HP');
console.log('9/9 ground loot support UI tests passed');
