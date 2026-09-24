/* =============================================================================
   MOTORE PURO — Arsenale permanente (progressione collezione).
   -----------------------------------------------------------------------------
   Nessun DOM, nessun Supabase, nessun localStorage: solo dati e transizioni
   di stato. La persistenza reale arriverà in uno step successivo — per ora
   il chiamante tiene questo stato in memoria (si azzera al reload).

   Uno stato per giocatore/profilo: questo modulo opera su UN SOLO stato
   Arsenale alla volta; il chiamante gestisce una mappa se ne servono più.

   Conserva solo ID (mai una copia delle statistiche arma).
   Stati progressivi: sconosciuta -> scoperta -> sbloccata (sbloccata implica
   sempre scoperta).
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_ARSENAL_CORE = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  function createArsenalState() {
    return { discoveredWeaponIds: [], unlockedWeaponIds: [] };
  }

  function discoverWeapon(arsenalState, weaponId) {
    if (arsenalState.discoveredWeaponIds.indexOf(weaponId) !== -1) return arsenalState;
    return Object.assign({}, arsenalState, {
      discoveredWeaponIds: arsenalState.discoveredWeaponIds.concat(weaponId)
    });
  }

  /* Sbloccare implica sempre anche la scoperta, anche se per qualche motivo
     non fosse già stata registrata (non dovrebbe succedere: si sblocca solo
     ciò che si è già raccolto/rivelato durante una run). */
  function unlockWeapon(arsenalState, weaponId) {
    if (arsenalState.unlockedWeaponIds.indexOf(weaponId) !== -1) return arsenalState;
    const discovered = arsenalState.discoveredWeaponIds.indexOf(weaponId) === -1
      ? arsenalState.discoveredWeaponIds.concat(weaponId)
      : arsenalState.discoveredWeaponIds;
    return Object.assign({}, arsenalState, {
      discoveredWeaponIds: discovered,
      unlockedWeaponIds: arsenalState.unlockedWeaponIds.concat(weaponId)
    });
  }

  function getWeaponCollectionStatus(arsenalState, weaponId) {
    if (arsenalState.unlockedWeaponIds.indexOf(weaponId) !== -1) return "sbloccata";
    if (arsenalState.discoveredWeaponIds.indexOf(weaponId) !== -1) return "scoperta";
    return "sconosciuta";
  }

  /* "Scoperte" nel contatore include anche le già sbloccate (sbloccata è
     uno stato più avanzato di scoperta, non un percorso alternativo). */
  function getArsenalStats(arsenalState, totalWeaponCount) {
    const discoveredCount = arsenalState.discoveredWeaponIds.length;
    return {
      discovered: discoveredCount,
      unlocked: arsenalState.unlockedWeaponIds.length,
      total: totalWeaponCount
    };
  }

  /* Armi eleggibili allo sblocco a vittoria: quelle raccolte in QUESTA run
     (mai la starter, che non entra mai in collectedWeaponIds), escluse le
     già sbloccate permanentemente. Le Mitiche sono eleggibili SOLO se ancora
     equipaggiate (primary/secondary) nel momento in cui il Boss è sconfitto:
     equippedWeaponIdsAtVictory è quell'istantanea, calcolata dal chiamante. */
  function getEligibleVictoryUnlocks(arsenalState, collectedWeaponIds, equippedWeaponIdsAtVictory, weaponRarityById) {
    const equipped = equippedWeaponIdsAtVictory || [];
    return (collectedWeaponIds || []).filter((weaponId) => {
      if (arsenalState.unlockedWeaponIds.indexOf(weaponId) !== -1) return false;
      const rarity = weaponRarityById ? weaponRarityById(weaponId) : null;
      if (rarity === "mitica" && equipped.indexOf(weaponId) === -1) return false;
      return true;
    });
  }

  return {
    createArsenalState, discoverWeapon, unlockWeapon,
    getWeaponCollectionStatus, getArsenalStats, getEligibleVictoryUnlocks
  };
});
