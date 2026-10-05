const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'fortress-game-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles-fortress.css'), 'utf8');
function ok(cond, msg){ if(!cond) throw new Error(msg); }
const checks = [
  [ui.includes('function syncSetupRosterFromSnapshot(snapshot)'), 'snapshot roster sync helper missing'],
  [ui.includes('if (savedSession) syncSetupRosterFromSnapshot(savedSession);'), 'startup must hydrate roster from saved session'],
  [ui.includes('function resumePresenceSelection()'), 'resume presence selection helper missing'],
  [ui.includes('resumeSavedSession(resumePresenceSelection())'), 'resume must use selected attendance'],
  [ui.includes('data-resume-presence='), 'resume attendance controls missing'],
  [ui.includes('CHI GIOCA OGGI?'), 'resume attendance heading missing'],
  [ui.includes('applyResumePresenceSelection(presenceSelection);'), 'resume attendance must be applied to runtime'],
  [ui.includes('syncSetupRosterFromGame();\n    const locked = !game.dir'), 'presence panel must sync runtime roster and remain visible during landing'],
  [ui.includes('uiMode !== "game" || !game || !game.state'), 'presence panel visibility guard must not require director'],
  [css.includes('.fa-utility-grid{\n  display:flex!important;'), 'utility menu must be compact horizontal rail'],
  [css.includes('overflow-x:auto;'), 'utility rail must scroll horizontally'],
  [css.includes('height:100dvh;'), 'mobile utility must use full dynamic viewport height'],
  [css.includes('.fa-resume-presence-list'), 'resume presence styles missing']
];
checks.forEach(([cond,msg]) => ok(cond,msg));
console.log(`${checks.length}/${checks.length} utility/presence V34 checks passed`);
