/* =============================================================================
   Fortress Army — Motore di combattimento puro (v2.4).

   Nessun DOM, nessuna UI, nessuna conoscenza della mappa/Tempesta/boss (fasi
   future). Riceve dati, restituisce risultati. Ogni funzione che usa
   casualità accetta un `rng` iniettabile — di default un d6 vero, nei test
   una coda di risultati prefissati (vedi makeQueueRng).
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_COMBAT = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  const RANGE_ORDER = { vicino: 1, medio: 2, lontano: 3 };
  const MIN_DICE = 1;
  const MAX_DICE = 3;
  const NOISE_THRESHOLD = 3;
  const REINFORCEMENT_ROLL_SUCCESS = [5, 6];

  /* ---- RNG ---- */
  function defaultRng() { return 1 + Math.floor(Math.random() * 6); }

  /* Per i test: rng che consuma una coda di valori 1-6 predefiniti.
     Lancia un errore se la coda finisce (niente fortuna nascosta nei test). */
  function makeQueueRng(values) {
    const queue = values.slice();
    return function () {
      if (!queue.length) throw new Error("makeQueueRng: coda esaurita, il test non ha previsto abbastanza tiri");
      return queue.shift();
    };
  }

  /* =========================================================================
     GITTATA E DADI EFFETTIVI
     ========================================================================= */

  /* Modificatore di gittata: +1 se coincide, -1 se è l'estremo opposto
     (Vicino/Lontano), 0 altrimenti. Rangeless annulla sempre il modificatore. */
  function rangeModifier(weaponRange, encounterRange, isRangeless) {
    if (isRangeless) return 0;
    const a = RANGE_ORDER[weaponRange];
    const b = RANGE_ORDER[encounterRange];
    if (a === undefined || b === undefined) throw new Error("Gittata sconosciuta");
    const diff = Math.abs(a - b);
    if (diff === 0) return 1;
    if (diff === 2) return -1;
    return 0;
  }

  function clampDice(n) {
    return Math.max(MIN_DICE, Math.min(MAX_DICE, n));
  }

  /* Dadi effettivi = baseDice + modificatore gittata + aiuto (0 o 1, mai di più)
     + eventuale bonus d'effetto, sempre clampato [1,3]. */
  function computeDiceCount({ baseDice, weaponRange, encounterRange, isRangeless, aiuto, effectBonus }) {
    const mod = rangeModifier(weaponRange, encounterRange, Boolean(isRangeless));
    const aiutoBonus = aiuto ? 1 : 0; // non cumulabile: booleano, non contatore
    const total = baseDice + mod + aiutoBonus + (effectBonus || 0);
    return clampDice(total);
  }

  function rollDice(count, rng) {
    const roll = rng || defaultRng;
    const rolls = [];
    for (let i = 0; i < count; i++) rolls.push(roll());
    return rolls;
  }

  /* =========================================================================
     SPECIAL CHE MODIFICANO I DADI (critOnSix, rerollOnes)
     ========================================================================= */

  /* Ogni 6 vale 12. Indipendente per ogni dado, nessun limite al numero
     di dadi che possono attivarlo nello stesso tiro. */
  function applyCritOnSix(rolls) {
    return rolls.map((n) => (n === 6 ? 12 : n));
  }

  /* Ogni 1 viene rilanciato una sola volta; il secondo risultato resta
     anche se è di nuovo 1 (nessun loop). */
  function applyRerollOnes(rolls, rng) {
    const roll = rng || defaultRng;
    return rolls.map((n) => (n === 1 ? roll() : n));
  }

  function sumRolls(rolls) {
    return rolls.reduce((a, n) => a + n, 0);
  }

  /* =========================================================================
     RISOLUZIONE DI UN ATTACCO
     ========================================================================= */

  /**
   * Risolve un attacco completo.
   * @param {object} p
   *  weapon: { baseDice, range, power, special:{type,n?} }
   *  encounterRange: "vicino"|"medio"|"lontano"
   *  aiuto: bool — un compagno ha rinunciato al proprio attacco per questo
   *  effectBonus: number — eventuale bonus dadi da altre fonti (default 0)
   *  targetBelowHalfHp: bool — per executionerStrike
   *  targetEliminated: bool — per silentKill (l'attacco ha eliminato il bersaglio?)
   *  rng: funzione dado iniettabile
   */
  function resolveAttack(p) {
    const weapon = p.weapon;
    const rng = p.rng || defaultRng;
    const specialType = weapon.special ? weapon.special.type : "none";
    const isRangeless = specialType === "rangeless";

    const diceCount = computeDiceCount({
      baseDice: weapon.baseDice,
      weaponRange: weapon.range,
      encounterRange: p.encounterRange,
      isRangeless,
      aiuto: Boolean(p.aiuto),
      effectBonus: p.effectBonus || 0
    });

    let rolls = rollDice(diceCount, rng);
    if (specialType === "critOnSix") rolls = applyCritOnSix(rolls);
    else if (specialType === "rerollOnes") rolls = applyRerollOnes(rolls, rng);

    let total = sumRolls(rolls) + weapon.power;

    const result = {
      diceCount, rolls, total,
      generatesNoise: specialType !== "silent" && specialType !== "silentKill",
      ignoreShieldN: 0,
      secondaryHits: [],
      appliesSuppressMarker: false,
      resetsNoise: false,
      disablesReinforcements: false
    };

    if (specialType === "ignoreShield") {
      result.ignoreShieldN = weapon.special.n === 2 ? 2 : 1;
    } else if (specialType === "areaDamage") {
      const secondary = Math.floor(total * 0.5);
      result.secondaryHits = [secondary, secondary]; // fino a 2 secondari, il chiamante li applica solo se il nemico esiste
    } else if (specialType === "chainStrike") {
      result.secondaryHits = [Math.floor(total * 0.5)]; // un solo secondario
    } else if (specialType === "suppress") {
      result.appliesSuppressMarker = true;
    } else if (specialType === "executionerStrike") {
      if (p.targetBelowHalfHp) total = result.total = total + weapon.power;
    } else if (specialType === "silentKill") {
      if (p.targetEliminated) { result.resetsNoise = true; result.disablesReinforcements = true; }
    }

    return result;
  }

  /* =========================================================================
     RUMORE / RINFORZI
     ========================================================================= */

  function createNoiseTracker() {
    return { noise: 0, checked: false, disabled: false };
  }

  /* Da chiamare dopo ogni attacco: aggiorna il contatore in base a se
     l'attacco genera rumore (vedi resolveAttack().generatesNoise) e alle
     conseguenze di un silentKill andato a segno. */
  function registerAttackNoise(tracker, attackResult) {
    if (tracker.disabled) return tracker;
    let next = Object.assign({}, tracker);
    if (attackResult.resetsNoise) next.noise = 0;
    else if (attackResult.generatesNoise) next.noise += 1;
    if (attackResult.disablesReinforcements) next.disabled = true;
    return next;
  }

  /* Un solo controllo per incontro. Sotto soglia, o già disabilitato/già
     controllato: nessun effetto. Il contatore si azzera dopo il controllo,
     scatti o no il rinforzo. */
  function checkReinforcements(tracker, rng) {
    if (tracker.disabled || tracker.checked || tracker.noise < NOISE_THRESHOLD) {
      return { tracker, reinforcementArrived: false, rolled: null };
    }
    const roll = (rng || defaultRng)();
    const arrived = REINFORCEMENT_ROLL_SUCCESS.indexOf(roll) !== -1;
    return {
      tracker: Object.assign({}, tracker, { noise: 0, checked: true }),
      reinforcementArrived: arrived,
      rolled: roll
    };
  }

  return {
    RANGE_ORDER, MIN_DICE, MAX_DICE, NOISE_THRESHOLD,
    defaultRng, makeQueueRng,
    rangeModifier, clampDice, computeDiceCount, rollDice,
    applyCritOnSix, applyRerollOnes, sumRolls,
    resolveAttack,
    createNoiseTracker, registerAttackNoise, checkReinforcements
  };
});
