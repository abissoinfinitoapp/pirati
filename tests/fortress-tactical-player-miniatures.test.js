const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'fortress-game-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles-fortress.css'), 'utf8');

const ids = ['automate','cat','duck','ghost','icekron','omalma','pandax','robotron','skulldrome','travis'];

assert(ui.includes('const TACTICAL_PLAYER_ASSETS = Object.freeze({'), 'mappa asset tattici mancante');
assert(ui.includes('function tacticalPlayerMarkup(player, currentPlayer)'), 'renderer miniature tattiche mancante');
assert(ui.includes('anchoredMarkup(a, tacticalPlayerMarkup(p, player), "is-player")'), 'gli slot player devono usare il renderer tattico');
assert(css.includes('.fa-tactical-player-img'), 'stile miniatura tattica mancante');
assert(css.includes('bottom: 0;'), 'la miniatura deve appoggiarsi allo slot con i piedi');

for (const id of ids) {
  const rel = `assets/fortress-img/tactical-characters/${id}.webp`;
  assert(ui.includes(`${id}: "${rel}"`), `mapping asset mancante: ${id}`);
  assert(fs.existsSync(path.join(root, rel)), `asset tattico mancante: ${rel}`);
}

console.log('fortress-tactical-player-miniatures: 6/6 OK');
