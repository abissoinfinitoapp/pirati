const test = require("node:test");
const assert = require("node:assert/strict");
const combat = require("../engine/fortress-combat.js");

/* ---- dadi effettivi: clamp, bonus/malus di gittata ---- */

test("gittata coincidente: +1 dado", () => {
  assert.equal(combat.computeDiceCount({ baseDice: 2, weaponRange: "vicino", encounterRange: "vicino" }), 3);
});

test("gittata estrema opposta: -1 dado", () => {
  assert.equal(combat.computeDiceCount({ baseDice: 2, weaponRange: "vicino", encounterRange: "lontano" }), 1);
});

test("gittata intermedia (un passo): nessun modificatore", () => {
  assert.equal(combat.computeDiceCount({ baseDice: 2, weaponRange: "vicino", encounterRange: "medio" }), 2);
});

test("rangeless: mai bonus né malus, qualunque gittata", () => {
  ["vicino", "medio", "lontano"].forEach((enc) => {
    assert.equal(combat.computeDiceCount({ baseDice: 1, weaponRange: "medio", encounterRange: enc, isRangeless: true }), 1);
  });
});

test("un'arma Media non prende mai -1 (nessuna gittata è a distanza 2 da Medio)", () => {
  assert.equal(combat.computeDiceCount({ baseDice: 1, weaponRange: "medio", encounterRange: "vicino" }), 1);
  assert.equal(combat.computeDiceCount({ baseDice: 1, weaponRange: "medio", encounterRange: "lontano" }), 1);
  assert.equal(combat.computeDiceCount({ baseDice: 1, weaponRange: "medio", encounterRange: "medio" }), 2);
});

test("clamp: mai sotto 1 dado", () => {
  assert.equal(combat.computeDiceCount({ baseDice: 1, weaponRange: "vicino", encounterRange: "lontano" }), 1);
  assert.equal(combat.computeDiceCount({ baseDice: 1, weaponRange: "vicino", encounterRange: "lontano", aiuto: false }), 1);
});

test("clamp: mai sopra 3 dadi, qualunque somma di bonus", () => {
  assert.equal(combat.computeDiceCount({ baseDice: 2, weaponRange: "vicino", encounterRange: "vicino", aiuto: true, effectBonus: 5 }), 3);
});

test("nessuna combinazione produce 0 o 4+ dadi (scansione esaustiva)", () => {
  const ranges = ["vicino", "medio", "lontano"];
  [1, 2].forEach((baseDice) => {
    ranges.forEach((weaponRange) => {
      ranges.forEach((encounterRange) => {
        [false, true].forEach((rangeless) => {
          [false, true].forEach((aiuto) => {
            [0, 1, 2].forEach((effectBonus) => {
              const n = combat.computeDiceCount({ baseDice, weaponRange, encounterRange, isRangeless: rangeless, aiuto, effectBonus });
              assert.ok(n >= 1 && n <= 3, `dadi fuori range: ${n}`);
            });
          });
        });
      });
    });
  });
});

/* ---- AIUTA ---- */

test("Aiuta: +1 dado, non cumulabile (booleano, non contatore)", () => {
  const senza = combat.computeDiceCount({ baseDice: 1, weaponRange: "lontano", encounterRange: "medio", aiuto: false });
  const con = combat.computeDiceCount({ baseDice: 1, weaponRange: "lontano", encounterRange: "medio", aiuto: true });
  assert.equal(con, senza + 1);
});

test("Aiuta rispetta comunque il tetto di 3 dadi", () => {
  const n = combat.computeDiceCount({ baseDice: 2, weaponRange: "vicino", encounterRange: "vicino", aiuto: true });
  assert.equal(n, 3);
});

test("il dado aggiunto da Aiuta passa dagli stessi special dell'arma aiutata (critOnSix)", () => {
  // 3 dadi (2 base + aiuto), tutti e tre risultano 6: devono valere 12 ciascuno, incluso quello di Aiuta
  const rng = combat.makeQueueRng([6, 6, 6]);
  const res = combat.resolveAttack({
    weapon: { baseDice: 2, range: "vicino", power: 0, special: { type: "critOnSix" } },
    encounterRange: "vicino", aiuto: true, rng
  });
  assert.equal(res.diceCount, 3);
  assert.deepEqual(res.rolls, [12, 12, 12]);
  assert.equal(res.total, 36);
});

/* ---- critOnSix ---- */

test("critOnSix: un 6 vale 12, un 5 resta 5", () => {
  assert.deepEqual(combat.applyCritOnSix([5, 6]), [5, 12]);
});

test("critOnSix: ogni 6 è indipendente, anche con più dadi", () => {
  assert.deepEqual(combat.applyCritOnSix([6, 6, 3]), [12, 12, 3]);
});

/* ---- rerollOnes ---- */

test("rerollOnes: un 1 viene rilanciato una volta", () => {
  const rng = combat.makeQueueRng([4]); // il rilancio del primo 1
  assert.deepEqual(combat.applyRerollOnes([1, 5], rng), [4, 5]);
});

test("rerollOnes: se il rilancio è di nuovo 1, resta 1 (nessun loop)", () => {
  const rng = combat.makeQueueRng([1]); // il rilancio dà di nuovo 1
  assert.deepEqual(combat.applyRerollOnes([1], rng), [1]);
});

/* ---- ignoreShield ---- */

test("ignoreShield n=1 e n=2 vengono riportati nel risultato", () => {
  // gittata coincidente (vicino/vicino): 2 base +1 = 3 dadi, servono 3 valori in coda
  const r1 = combat.resolveAttack({ weapon: { baseDice: 2, range: "vicino", power: 1, special: { type: "ignoreShield", n: 1 } }, encounterRange: "vicino", rng: combat.makeQueueRng([3, 3, 3]) });
  assert.equal(r1.ignoreShieldN, 1);
  const r2 = combat.resolveAttack({ weapon: { baseDice: 2, range: "vicino", power: 1, special: { type: "ignoreShield", n: 2 } }, encounterRange: "vicino", rng: combat.makeQueueRng([3, 3, 3]) });
  assert.equal(r2.ignoreShieldN, 2);
});

/* ---- areaDamage (tempered) ---- */

test("areaDamage: principale 100%, fino a 2 secondari al 50% arrotondato per difetto", () => {
  // dadi 2+3(vicino ideale)=3? uso un'arma Medio ideale per controllare il totale a mano:
  // baseDice1 Medio, encounter Medio => 2 dadi, rng [5,6] => sum 11, + power0 = totale 11 (come da esempio dell'utente)
  const rng = combat.makeQueueRng([5, 6]);
  const res = combat.resolveAttack({
    weapon: { baseDice: 1, range: "medio", power: 0, special: { type: "areaDamage" } },
    encounterRange: "medio", rng
  });
  assert.equal(res.total, 11);
  assert.deepEqual(res.secondaryHits, [5, 5]);
});

/* ---- suppress ---- */

test("suppress: marca il bersaglio, il chiamante decide quando consumarlo", () => {
  // gittata coincidente (medio/medio): 2 base +1 = 3 dadi
  const res = combat.resolveAttack({
    weapon: { baseDice: 2, range: "medio", power: 1, special: { type: "suppress" } },
    encounterRange: "medio", rng: combat.makeQueueRng([2, 2, 2])
  });
  assert.equal(res.appliesSuppressMarker, true);
});

/* ---- silent / silentKill ---- */

test("silent: non genera Rumore, nessun'altra conseguenza", () => {
  const res = combat.resolveAttack({
    weapon: { baseDice: 1, range: "vicino", power: 0, special: { type: "silent" } },
    encounterRange: "vicino", rng: combat.makeQueueRng([3, 3])
  });
  assert.equal(res.generatesNoise, false);
  assert.equal(res.resetsNoise, false);
  assert.equal(res.disablesReinforcements, false);
});

test("silentKill: non genera Rumore; se elimina il bersaglio azzera E disabilita i rinforzi", () => {
  // gittata coincidente (lontano/lontano): 1 base +1 = 2 dadi
  const senzaKill = combat.resolveAttack({
    weapon: { baseDice: 1, range: "lontano", power: 7, special: { type: "silentKill" } },
    encounterRange: "lontano", rng: combat.makeQueueRng([4, 4]), targetEliminated: false
  });
  assert.equal(senzaKill.generatesNoise, false);
  assert.equal(senzaKill.resetsNoise, false);

  const conKill = combat.resolveAttack({
    weapon: { baseDice: 1, range: "lontano", power: 7, special: { type: "silentKill" } },
    encounterRange: "lontano", rng: combat.makeQueueRng([4, 4]), targetEliminated: true
  });
  assert.equal(conKill.resetsNoise, true);
  assert.equal(conKill.disablesReinforcements, true);
});

/* ---- Rumore / Rinforzi ---- */

test("Rumore: sotto soglia 3 nessun controllo scatta", () => {
  let tracker = combat.createNoiseTracker();
  tracker = combat.registerAttackNoise(tracker, { generatesNoise: true });
  tracker = combat.registerAttackNoise(tracker, { generatesNoise: true });
  const check = combat.checkReinforcements(tracker, combat.makeQueueRng([6]));
  assert.equal(check.reinforcementArrived, false);
  assert.equal(check.tracker.noise, 2);
});

test("Rumore: a soglia 3, tiro 5-6 porta un rinforzo, il contatore si azzera comunque", () => {
  let tracker = combat.createNoiseTracker();
  [1, 2, 3].forEach(() => { tracker = combat.registerAttackNoise(tracker, { generatesNoise: true }); });
  assert.equal(tracker.noise, 3);
  const checkFail = combat.checkReinforcements(tracker, combat.makeQueueRng([4]));
  assert.equal(checkFail.reinforcementArrived, false);
  assert.equal(checkFail.tracker.noise, 0);
  assert.equal(checkFail.tracker.checked, true);
});

test("Rumore: un solo controllo per incontro", () => {
  let tracker = combat.createNoiseTracker();
  [1, 2, 3].forEach(() => { tracker = combat.registerAttackNoise(tracker, { generatesNoise: true }); });
  const primo = combat.checkReinforcements(tracker, combat.makeQueueRng([6]));
  tracker = primo.tracker;
  // rumore risale a 3 di nuovo, ma il controllo è già stato fatto in questo incontro
  [1, 2, 3].forEach(() => { tracker = combat.registerAttackNoise(tracker, { generatesNoise: true }); });
  const secondo = combat.checkReinforcements(tracker, combat.makeQueueRng([6]));
  assert.equal(secondo.reinforcementArrived, false);
  assert.equal(secondo.rolled, null);
});

test("silent non aggiunge Rumore", () => {
  let tracker = combat.createNoiseTracker();
  tracker = combat.registerAttackNoise(tracker, { generatesNoise: false });
  tracker = combat.registerAttackNoise(tracker, { generatesNoise: false });
  tracker = combat.registerAttackNoise(tracker, { generatesNoise: false });
  assert.equal(tracker.noise, 0);
});

test("silentKill su kill azzera il Rumore e disabilita i rinforzi per il resto dell'incontro", () => {
  let tracker = combat.createNoiseTracker();
  [1, 2].forEach(() => { tracker = combat.registerAttackNoise(tracker, { generatesNoise: true }); });
  assert.equal(tracker.noise, 2);
  tracker = combat.registerAttackNoise(tracker, { generatesNoise: false, resetsNoise: true, disablesReinforcements: true });
  assert.equal(tracker.noise, 0);
  assert.equal(tracker.disabled, true);
  // altri 5 attacchi rumorosi non riattivano nulla: il tracker è disabilitato
  for (let i = 0; i < 5; i++) tracker = combat.registerAttackNoise(tracker, { generatesNoise: true });
  assert.equal(tracker.noise, 0);
  const check = combat.checkReinforcements(tracker, combat.makeQueueRng([6]));
  assert.equal(check.reinforcementArrived, false);
});

/* =========================================================================
   DADI FISICI — resolveAttackFromRolls. Nessuna generazione automatica:
   i risultati arrivano sempre dall'esterno (dadi fisici in partita reale,
   valori fissi nei test). Deve riusare esattamente le stesse regole di
   resolveAttack (computeDiceCount/applyCritOnSix/applyRerollOnes/power/
   ignoreShield/areaDamage), mai una copia.
   ========================================================================= */

test("resolveAttackFromRolls: stesso risultato di resolveAttack a parità di dadi (nessuna arma speciale)", () => {
  const weapon = { baseDice: 2, range: "medio", power: 2, special: { type: "none" } };
  const p = { weapon, encounterRange: "medio" }; // ideale -> 3 dadi
  const fromRng = combat.resolveAttack(Object.assign({}, p, { rng: combat.makeQueueRng([5, 4, 3]) }));
  const fromRolls = combat.resolveAttackFromRolls(p, [5, 4, 3]);
  assert.equal(fromRolls.status, "resolved");
  assert.equal(fromRolls.total, fromRng.total);
  assert.deepEqual(fromRolls.rolls, fromRng.rolls);
  assert.equal(fromRolls.total, 5 + 4 + 3 + 2);
});

test("resolveAttackFromRolls rifiuta un numero di risultati diverso da diceCount", () => {
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const p = { weapon, encounterRange: "medio" }; // 2 dadi (ideale)
  assert.throws(() => combat.resolveAttackFromRolls(p, [5]));
  assert.throws(() => combat.resolveAttackFromRolls(p, [5, 4, 3]));
});

test("resolveAttackFromRolls rifiuta valori di dado fuori dall'intervallo 1-6", () => {
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "none" } };
  const p = { weapon, encounterRange: "medio" };
  assert.throws(() => combat.resolveAttackFromRolls(p, [0, 4]));
  assert.throws(() => combat.resolveAttackFromRolls(p, [7, 4]));
  assert.throws(() => combat.resolveAttackFromRolls(p, [3.5, 4]));
});

test("resolveAttackFromRolls: un 6 fisico attiva il critico (vale 12), come da regola esistente", () => {
  const weapon = { baseDice: 1, range: "medio", power: 1, special: { type: "critOnSix" } };
  const p = { weapon, encounterRange: "medio" }; // ideale -> 2 dadi
  const outcome = combat.resolveAttackFromRolls(p, [6, 3]);
  assert.equal(outcome.status, "resolved");
  assert.deepEqual(outcome.rolls, [12, 3]);
  assert.equal(outcome.total, 12 + 3 + 1);
});

test("resolveAttackFromRolls: rerollOnes richiede un ritiro fisico esplicito, mai generato da solo", () => {
  const weapon = { baseDice: 2, range: "vicino", power: 1, special: { type: "rerollOnes" } };
  const p = { weapon, encounterRange: "vicino" }; // ideale -> 3 dadi
  const first = combat.resolveAttackFromRolls(p, [1, 5, 3]);
  assert.equal(first.status, "needs-reroll");
  assert.deepEqual(first.rerollIndices, [0]);
  assert.equal(first.diceCount, 3);

  const done = combat.resolveAttackFromRolls(p, [1, 5, 3], [4]);
  assert.equal(done.status, "resolved");
  assert.deepEqual(done.rolls, [4, 5, 3]);
  assert.equal(done.total, 4 + 5 + 3 + 1);
});

test("resolveAttackFromRolls: se il ritiro fisico è ancora 1, resta 1 — nessun secondo ritiro", () => {
  const weapon = { baseDice: 1, range: "vicino", power: 0, special: { type: "rerollOnes" } };
  const p = { weapon, encounterRange: "vicino" }; // ideale -> 2 dadi
  combat.resolveAttackFromRolls(p, [1, 4]); // scarta il "needs-reroll", serve solo a validare l'indice
  const done = combat.resolveAttackFromRolls(p, [1, 4], [1]);
  assert.equal(done.status, "resolved");
  assert.deepEqual(done.rolls, [1, 4]);
});

test("resolveAttackFromRolls: più dadi da 1 richiedono un ritiro per ciascuno, nell'ordine originale", () => {
  const weapon = { baseDice: 3, range: "vicino", power: 0, special: { type: "rerollOnes" } };
  const p = { weapon, encounterRange: "vicino" }; // ideale, clamp a 3 -> 3 dadi
  const first = combat.resolveAttackFromRolls(p, [1, 1, 4]);
  assert.equal(first.status, "needs-reroll");
  assert.deepEqual(first.rerollIndices, [0, 1]);

  const done = combat.resolveAttackFromRolls(p, [1, 1, 4], [5, 2]);
  assert.equal(done.status, "resolved");
  assert.deepEqual(done.rolls, [5, 2, 4]);
});
