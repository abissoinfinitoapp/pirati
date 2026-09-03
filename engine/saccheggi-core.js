(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_SACCH_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const dayAvailable = (raid, day) => !raid || raid.usedDay !== day;

  function pickPair(pairs, recentIds, random) {
    if (!Array.isArray(pairs) || !pairs.length) return null;
    const recent = new Set((recentIds || []).slice(-4));
    const unseen = pairs.filter(pair => !recent.has(pair.id));
    const pool = unseen.length >= 1 && pairs.length >= 5 ? unseen : pairs;
    const rng = typeof random === "function" ? random : Math.random;
    return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  }

  function scoreRolls(players, rolls, stat, cardBonus) {
    const entries = players.map(player => {
      const die = Number(rolls[player.id]);
      if (!Number.isInteger(die) || die < 1 || die > 6) {
        throw new RangeError("Ogni dado deve essere fra 1 e 6.");
      }
      const statValue = Number(player.stats[stat]) || 0;
      return { id: player.id, die, stat: statValue, total: die + statValue };
    });
    if (!entries.length) throw new RangeError("Serve almeno un pirata presente.");
    const average = entries.reduce((sum, entry) => sum + entry.total, 0) / entries.length + (Number(cardBonus) || 0);
    return { entries, average };
  }

  function resolveAttempt(average, target, attempt) {
    const success = average >= target;
    return { success, nextPhase: success || attempt >= 2 ? "result" : "retry-choice" };
  }

  function withRaidDefaults(savedRaid) {
    const defaults = {
      usedDay: null,
      pairId: null,
      shipId: null,
      attempt: 1,
      phase: "idle",
      rolls: {},
      outcome: null,
      recentPairIds: [],
      returnTo: "map",
      rewardsApplied: false
    };
    const saved = savedRaid && typeof savedRaid === "object" ? savedRaid : {};
    const raid = { ...defaults, ...saved };
    raid.recentPairIds = Array.isArray(raid.recentPairIds) ? raid.recentPairIds.slice() : [];
    raid.rolls = raid.rolls && typeof raid.rolls === "object" && !Array.isArray(raid.rolls)
      ? { ...raid.rolls }
      : {};
    return raid;
  }

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function reportRewardProblem(state, message) {
    const candidates = [
      state && state.problems,
      state && state._state && state._state.problems,
      root && root.PIRATI && root.PIRATI._state && root.PIRATI._state.problems
    ];
    const problems = candidates.find(Array.isArray);
    if (problems) problems.push(`saccheggio: ${message}`);
  }

  function applyRaidRewardsOnce(state, ship) {
    if (!isRecord(state) || !isRecord(state.raid) || !isRecord(state.crew)) {
      reportRewardProblem(state, "stato del saccheggio non valido");
      return false;
    }
    if (state.raid.rewardsApplied) return false;

    const crew = state.crew;
    if (!Array.isArray(crew.loot)) crew.loot = [];
    const rewards = ship && Array.isArray(ship.rewards) ? ship.rewards : [];

    rewards.forEach((reward) => {
      if (!reward || typeof reward !== "object") {
        reportRewardProblem(state, "ricompensa non valida ignorata");
        return;
      }
      if (reward.type === "coins") {
        const amount = Number(reward.amount);
        if (Number.isFinite(amount)) crew.coins = (Number(crew.coins) || 0) + amount;
        else reportRewardProblem(state, "quantità di monete non valida ignorata");
      } else if (reward.type === "fame") {
        const amount = Number(reward.amount);
        if (Number.isFinite(amount)) state.fame = (Number(state.fame) || 0) + amount;
        else reportRewardProblem(state, "quantità di Fama non valida ignorata");
      } else if (reward.type === "loot") {
        if (typeof reward.id === "string" && reward.id) {
          crew.loot.push({ id: reward.id, questId: null, day: state.day });
        } else {
          reportRewardProblem(state, "bottino senza ID ignorato");
        }
      } else {
        reportRewardProblem(state, `tipo di ricompensa sconosciuto (${reward.type}) ignorato`);
      }
    });

    state.raid.rewardsApplied = true;
    return true;
  }

  return { dayAvailable, pickPair, scoreRolls, resolveAttempt, withRaidDefaults, applyRaidRewardsOnce };
});
