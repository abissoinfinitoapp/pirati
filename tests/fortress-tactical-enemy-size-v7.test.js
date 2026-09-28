const fs = require('fs');
const assert = require('assert');
const css = fs.readFileSync(__dirname + '/../styles-fortress.css', 'utf8');
const js = fs.readFileSync(__dirname + '/../fortress-game-ui.js', 'utf8');
assert.match(css, /\.fa-enemy-visual\s*\{[\s\S]*?width:\s*39px;[\s\S]*?height:\s*58px;/);
assert.doesNotMatch(css, /\.fa-tactical-render-anchor\.is-enemy \.fa-enemy-marker\s*\{[\s\S]*?transform:\s*scale/);
assert.doesNotMatch(js, /fa-tactical-enemy-scale/);
assert.match(js, /anchoredMarkup\(a, enemyMarkerMarkup\(e\), "is-enemy"\)/);
console.log('4/4 tactical enemy sizing V7 tests passed');
