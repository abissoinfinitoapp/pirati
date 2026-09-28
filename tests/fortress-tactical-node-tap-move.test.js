const fs = require('fs');
const assert = require('assert');
const ui = fs.readFileSync(require.resolve('../fortress-game-ui.js'), 'utf8');
const css = fs.readFileSync(require.resolve('../styles-fortress.css'), 'utf8');

assert(ui.includes('const moveDirectionByNodeId = new Map('), 'reachable nodes must derive from current node connections');
assert(ui.includes('const moveDirection = canMove ? moveDirectionByNodeId.get(String(n.id)) : null;'), 'move targets must exist only while movement is available');
assert(ui.includes('data-node-move-dir="${escapeHtml(moveDirection)}"'), 'reachable node must expose its existing movement direction');
assert(ui.includes('handleMoveNode(nodeMove.dataset.nodeMoveDir);'), 'node tap must reuse the existing movement handler');
assert(ui.includes('director.performMoveNode(state, dir, playerId, direction);'), 'movement handler must still delegate to director.performMoveNode');
assert(ui.includes('magnifySuppressNodeClickUntil = Date.now() + 350;'), 'pan/pinch must suppress accidental node taps');
assert(css.includes('.fa-tactical-map-viewport .fa-node-move-target::before'), 'touch hit area must be larger than the visible node dot');
assert(css.includes('.fa-tactical-map-viewport .fa-node.is-move-target'), 'reachable nodes must have a dedicated visual state');

console.log('fortress-tactical-node-tap-move: 8/8 OK');
