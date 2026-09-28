const fs = require('fs');
const assert = require('assert');
const ui = fs.readFileSync(require('path').join(__dirname, '..', 'fortress-game-ui.js'), 'utf8');

assert.ok(ui.includes('const regularPlayersAtNode = state.players.filter'), 'separa i player normali per nodo');
assert.ok(ui.includes('!p.hiddenInShelter &&'), 'i nascosti sono esclusi dal pool player');
assert.ok(ui.includes('const shelteredPlayersAtNode = state.players.filter'), 'costruisce il pool dei nascosti separatamente');
assert.ok(ui.includes('String(p.hiddenNodeId || p.nodeId || "") === String(n.id)'), 'hiddenNodeId guida la posizione visiva del nascosto');
assert.ok(ui.includes('const regularPlayers = regularPlayersAtNode;'), 'usa il pool normale già filtrato');
assert.ok(ui.includes('const shelteredPlayers = shelteredPlayersAtNode;'), 'usa il pool rifugio già filtrato');
assert.ok(ui.includes('runtimeEntityAnchors(zone.id, n.id, "shelter", shelteredPlayers)'), 'i nascosti usano gli slot shelter');
console.log('7/7 shelter hiddenNode rendering tests passed');
