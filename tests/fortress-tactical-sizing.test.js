const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles-fortress.css'), 'utf8');

test('gli slot tattici editor sono compatti per il piazzamento preciso', () => {
  assert.match(css, /\.fa-editor-anchor\s*\{[\s\S]*?width:18px;\s*height:18px;/);
});

test('il token giocatore tattico e ridotto al 50 percento senza spostare l anchor', () => {
  assert.match(css, /\.fa-tactical-render-anchor\.is-player \.fa-token\s*\{[\s\S]*?transform:scale\(\.5\);[\s\S]*?transform-origin:center center;/);
  assert.match(css, /\.fa-tactical-render-anchor\s*\{[\s\S]*?transform:translate\(-50%,-50%\)/);
});

test('solo i mostri tattici sono ridotti senza toccare mezzi e strutture', () => {
  assert.match(css, /\.fa-tactical-render-anchor\.is-enemy \.fa-enemy-visual\s*\{[\s\S]*?width:34px;[\s\S]*?height:34px;/);
  assert.doesNotMatch(css, /\.fa-tactical-render-anchor\.is-(?:vehicle|structure)[^{]*\{[^}]*transform:scale/);
});
