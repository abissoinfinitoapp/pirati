/* =============================================================================
   MOTORE PURO — Guardaroba (skin cosmetiche)
   -----------------------------------------------------------------------------
   Nessun dado, nessun combattimento, nessuna regola di gioco qui: solo lo
   stato del possesso/equip delle skin, che sono e restano 100% estetiche.

   La Base di un personaggio non è una skin e non appartiene a questo stato:
   vive nel catalogo personaggi (catalog/fortress-characters.js) ed è il
   fallback automatico quando equippedByCharacter non ha nulla per quel
   characterId (nessuna skin equipaggiata, o skin rimossa).

   Lo stato non muta mai in place: ogni funzione ritorna un nuovo oggetto
   stato (o lo stesso, invariato, se l'azione non è permessa).
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_SKINS_CORE = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  function defaultState() {
    /* Fixture DEV isolata: nessuna economia reale collegata, monete usate
       solo per testare acquisto/equip delle skin nel Guardaroba. */
    return { money: 2000, ownedSkinIds: [], equippedByCharacter: {} };
  }

  function findSkin(catalog, id) {
    return (catalog || []).find((s) => s.id === id) || null;
  }

  function ownsSkin(state, skin) {
    if (!skin) return false;
    return Array.isArray(state.ownedSkinIds) && state.ownedSkinIds.indexOf(skin.id) !== -1;
  }

  function canBuy(state, skin) {
    if (!skin || !skin.assetReady) return false;
    if (ownsSkin(state, skin)) return false;
    return (Number(state.money) || 0) >= skin.price;
  }

  function buySkin(state, catalog, skinId) {
    const skin = findSkin(catalog, skinId);
    if (!canBuy(state, skin)) return state;
    return Object.assign({}, state, {
      money: state.money - skin.price,
      ownedSkinIds: state.ownedSkinIds.concat(skin.id)
    });
  }

  function canEquip(state, skin) {
    if (!skin || !skin.assetReady) return false;
    return ownsSkin(state, skin);
  }

  function equipSkin(state, catalog, skinId) {
    const skin = findSkin(catalog, skinId);
    if (!canEquip(state, skin)) return state;
    return Object.assign({}, state, {
      equippedByCharacter: Object.assign({}, state.equippedByCharacter, { [skin.characterId]: skin.id })
    });
  }

  /* rimuove la skin equipaggiata per quel personaggio: la UI torna a
     mostrare automaticamente la Base (getCharacterDisplayImage) */
  function unequipSkin(state, characterId) {
    if (!getEquippedSkinId(state, characterId)) return state;
    const equippedByCharacter = Object.assign({}, state.equippedByCharacter);
    delete equippedByCharacter[characterId];
    return Object.assign({}, state, { equippedByCharacter });
  }

  function getEquippedSkinId(state, characterId) {
    return (state.equippedByCharacter && state.equippedByCharacter[characterId]) || null;
  }

  /* null quando il personaggio è alla Base (mai equipaggiato, o rimosso) */
  function getEquippedSkin(state, catalog, characterId) {
    const id = getEquippedSkinId(state, characterId);
    if (!id) return null;
    const skin = findSkin(catalog, id);
    return (skin && skin.characterId === characterId) ? skin : null;
  }

  /* unica funzione che la UI (schede personaggio, token mappa, setup) deve
     interrogare per sapere quale immagine mostrare: skin equipaggiata, o
     in sua assenza la Base canonica del personaggio */
  function getCharacterDisplayImage(state, catalog, characters, characterId) {
    const skin = getEquippedSkin(state, catalog, characterId);
    if (skin) return skin.image;
    const character = (characters || []).find((c) => c.id === characterId);
    return character ? character.image : "";
  }

  return {
    defaultState, findSkin, ownsSkin,
    canBuy, buySkin, canEquip, equipSkin, unequipSkin,
    getEquippedSkinId, getEquippedSkin, getCharacterDisplayImage
  };
});
