const fs = require('fs');
const assert = require('assert');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname,'fortress-game-ui.js'),'utf8');
const css = fs.readFileSync(path.join(__dirname,'styles-fortress.css'),'utf8');

assert(js.includes('MAGNIFY_MIN_SCALE = 1'));
assert(js.includes('MAGNIFY_MAX_SCALE = 2.5'));
assert(js.includes('MAGNIFY_FOCUS_SCALE = 1.6'));
assert(js.includes('data-map-focus-player'));
assert(js.includes('function focusMagnifyOnCurrentPlayer'));
assert(js.includes('data-map-reset'));
assert(js.includes('data-map-zoom="in"'));
assert(js.includes('addEventListener("pointermove"'));
assert(js.includes('addEventListener("wheel"'));
assert(css.includes('.fa-tactical-map-viewport'));
assert(css.includes('touch-action:none'));
assert(css.includes('transform:none'));
assert(!css.includes('will-change:transform'));
assert(js.includes('scene.style.width = `${magnifyView.scale * 100}%`'));
assert(js.includes('scene.style.height = `${magnifyView.scale * 100}%`'));
assert(!js.includes('scale(${magnifyView.scale})'));
assert(js.includes('const baseWidth = scene.offsetWidth / Math.max(magnifyView.scale, .001)'));
// Il focus deve essere esplicito: render() applica la view, ma non chiama focusMagnifyOnCurrentPlayer().
const renderBlock = js.slice(js.indexOf('function render()'), js.indexOf('function tokenMarkup'));
assert(!renderBlock.includes('focusMagnifyOnCurrentPlayer()'));
console.log('fortress tactical map zoom: 18/18');
