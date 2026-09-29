const fs = require('fs');
const path = require('path');
const ui = fs.readFileSync(path.join(__dirname, '..', 'fortress-game-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles-fortress.css'), 'utf8');
function ok(cond, msg) { if (!cond) throw new Error(msg); }
ok(ui.includes('ensureGlobalDiagnosticsUi();'), 'global diagnostic UI must initialize at startup');
ok(ui.includes('id = "fa-global-diag-toggle"'), 'global DIAG button missing');
ok(ui.includes('diagnosticEvent("resume:click")'), 'resume click must be logged');
ok(ui.includes('diagnosticCheckpoint("resume:before-render")'), 'resume before-render checkpoint missing');
ok(ui.includes('diagnosticEvent("resume:done")'), 'resume completion missing');
ok(ui.includes('openGlobalDiagnostics("errore durante PROSEGUI")'), 'resume error must open diagnostics');
ok(ui.includes('diagnosticEvent("boot:ready"'), 'boot ready event missing');
ok(css.includes('.fa-global-diag-toggle'), 'global DIAG CSS missing');
ok(css.includes('z-index: 2147483000'), 'global DIAG must sit above setup/game UI');
console.log('9/9 global diagnostics tests passed');
