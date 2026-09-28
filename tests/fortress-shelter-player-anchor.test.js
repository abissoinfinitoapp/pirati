const fs = require("fs");
const path = require("path");
const ui = fs.readFileSync(path.join(__dirname, "..", "fortress-game-ui.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "styles-fortress.css"), "utf8");

function ok(cond, msg) { if (!cond) throw new Error(msg); }

ok(ui.includes('const shelteredPlayers = nodePlayers.filter((p) => p.hiddenInShelter);'), 'separa player nascosti');
ok(ui.includes('const regularPlayers = nodePlayers.filter((p) => !p.hiddenInShelter);'), 'separa player normali');
ok(ui.includes('runtimeEntityAnchors(zone.id, n.id, "shelter", shelteredPlayers)'), 'usa slot shelter');
ok(ui.includes('"is-player is-sheltered-player"'), 'classe player nel rifugio');
ok(ui.includes('else fallbackPlayers.push(p);'), 'fallback se manca slot');
ok(css.includes('.fa-tactical-render-anchor.is-player.is-sheltered-player'), 'z-index rifugio');
console.log('6/6 shelter player anchor tests passed');
