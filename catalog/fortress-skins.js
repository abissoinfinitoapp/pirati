/* =============================================================================
   Fortress Army — Catalogo Skin (cosmetiche, 100% estetiche).

   Nessun campo di gameplay: id, characterId, name, rarity, price, image,
   assetReady. Le skin non modificano MAI poteri, statistiche, loot o
   combattimento: sono solo l'immagine mostrata per un personaggio.

   L'immagine base canonica di ogni personaggio (assets/fortress-img/<id>-base.webp,
   in catalog/fortress-characters.js) NON è una skin e NON appartiene a
   questo catalogo: è il look gratuito del personaggio, sempre disponibile
   (non si compra, non si "possiede"), mostrato finché nessuna skin è
   equipaggiata o dopo che una skin viene rimossa.

   Fonte di verità unica: CHARACTER_SKIN_DATA (suffisso + nome variante).
   Rarità e prezzo sono SEMPRE derivati dalla posizione nell'elenco variants,
   mai scritti a mano riga per riga.

   Compatibile Node (require, per i test) e browser (window.FORTRESS_*).
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.FORTRESS_SKINS = api.SKINS;
    /* metadati di catalogo (rarità/prezzi): non confondere con
       window.FORTRESS_SKINS_API, che è l'API runtime di equip esposta da
       fortress-army.js (getEquippedSkin / getCharacterDisplayImage). */
    root.FORTRESS_SKINS_CATALOG = api;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  /* ordine = ordine di rarità crescente; ogni personaggio ha esattamente
     queste 4 varianti cosmetiche (la Base non è qui: vive nel catalogo
     personaggi e non appartiene all'economia del Guardaroba) */
  const RARITY_ORDER = ["non-comune", "rara", "epica", "leggendaria"];
  const RARITY_PRICE = { "non-comune": 300, rara: 700, epica: 1400, leggendaria: 2500 };

  const CHARACTER_SKIN_DATA = [
    { characterId: "automate", name: "Automate", variants: [
      { suffix: "desert", label: "Deserto" },
      { suffix: "arctic", label: "Artico" },
      { suffix: "neon", label: "Neon" },
      { suffix: "prime", label: "Prime" }
    ] },
    { characterId: "cat", name: "Cat", variants: [
      { suffix: "jungle", label: "Giungla" },
      { suffix: "midnight", label: "Notturna" },
      { suffix: "neon-pop", label: "Neon Pop" },
      { suffix: "royal", label: "Reale" }
    ] },
    { characterId: "duck", name: "Duck", variants: [
      { suffix: "ranger", label: "Ranger" },
      { suffix: "navy", label: "Marina" },
      { suffix: "electric", label: "Elettrica" },
      { suffix: "golden", label: "Dorata" }
    ] },
    { characterId: "ghost", name: "Ghost", variants: [
      { suffix: "mist", label: "Nebbia" },
      { suffix: "abyss", label: "Abisso" },
      { suffix: "plasma", label: "Plasma" },
      { suffix: "ancient", label: "Antica" }
    ] },
    { characterId: "icekron", name: "Icekron", variants: [
      { suffix: "frostguard", label: "Guardia di Gelo" },
      { suffix: "storm", label: "Tempesta" },
      { suffix: "crystal", label: "Cristallo" },
      { suffix: "emperor", label: "Imperatore" }
    ] },
    { characterId: "omalma", name: "Omalma", variants: [
      { suffix: "moss", label: "Muschio" },
      { suffix: "sunset", label: "Tramonto" },
      { suffix: "void", label: "Vuoto" },
      { suffix: "celestial", label: "Celeste" }
    ] },
    { characterId: "pandax", name: "Pandax", variants: [
      { suffix: "bamboo", label: "Bambù" },
      { suffix: "urban", label: "Urbana" },
      { suffix: "cyber", label: "Cyber" },
      { suffix: "imperial", label: "Imperiale" }
    ] },
    { characterId: "robotron", name: "Robotron", variants: [
      { suffix: "scrap", label: "Rottame" },
      { suffix: "titan", label: "Titano" },
      { suffix: "overdrive", label: "Overdrive" },
      { suffix: "apex", label: "Apex" }
    ] },
    { characterId: "skulldrome", name: "Skulldrome", variants: [
      { suffix: "boneguard", label: "Guardia d'Ossa" },
      { suffix: "ember", label: "Brace" },
      { suffix: "necrotech", label: "Necrotech" },
      { suffix: "king", label: "Re" }
    ] },
    { characterId: "travis", name: "Travis", variants: [
      { suffix: "ranger", label: "Ranger" },
      { suffix: "street", label: "Strada" },
      { suffix: "neon-strike", label: "Neon Strike" },
      { suffix: "champion", label: "Campione" }
    ] }
  ];

  const SKINS = [];
  CHARACTER_SKIN_DATA.forEach((char) => {
    char.variants.forEach((variant, index) => {
      const rarity = RARITY_ORDER[index];
      SKINS.push({
        id: `${char.characterId}-${variant.suffix}`,
        characterId: char.characterId,
        name: `${char.name} ${variant.label}`,
        rarity,
        price: RARITY_PRICE[rarity],
        image: `assets/fortress-img/${char.characterId}-${variant.suffix}.webp`,
        assetReady: true
      });
    });
  });

  return { SKINS, RARITY_ORDER, RARITY_PRICE, CHARACTER_SKIN_DATA };
});
