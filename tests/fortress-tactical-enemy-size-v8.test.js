const fs = require('fs');
const assert = require('assert');
const css = fs.readFileSync('styles-fortress.css','utf8');
const html = fs.readFileSync('fortress-army.html','utf8');
assert.match(css, /\.fa-enemy-visual\s*\{[\s\S]*?width:\s*39px;[\s\S]*?height:\s*58px;/);
assert.match(css, /@media \(max-width:700px\)[\s\S]*?\.fa-enemy-visual \{ width: 39px; height: 58px; \}/);
assert.match(html, /styles-fortress\.css\?v=8/);
console.log('3/3 OK');
