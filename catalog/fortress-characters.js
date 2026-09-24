/* =============================================================================
   Fortress Army — Censimento personaggi (10 immagini già separate).

   L'immagine canonica è <id>-base.webp: il look gratuito di ogni personaggio,
   sempre disponibile, mostrato finché nessuna skin (catalog/fortress-skins.js)
   è equipaggiata. I vecchi file <id>.webp restano su disco per storico ma non
   sono più il riferimento grafico principale.

   Nessuna abilità/meccanica di gioco qui: solo id, name, image.
   Compatibile Node (require, per i test) e browser (window.FORTRESS_*).
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.FORTRESS_CHARACTERS = api.CHARACTERS;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  const CHARACTERS = [
    { id: "automate", name: "Automate", image: "assets/fortress-img/automate-base.webp" },
    { id: "cat", name: "Cat", image: "assets/fortress-img/cat-base.webp" },
    { id: "duck", name: "Duck", image: "assets/fortress-img/duck-base.webp" },
    { id: "ghost", name: "Ghost", image: "assets/fortress-img/ghost-base.webp" },
    { id: "icekron", name: "Icekron", image: "assets/fortress-img/icekron-base.webp" },
    { id: "omalma", name: "Omalma", image: "assets/fortress-img/omalma-base.webp" },
    { id: "pandax", name: "Pandax", image: "assets/fortress-img/pandax-base.webp" },
    { id: "robotron", name: "Robotron", image: "assets/fortress-img/robotron-base.webp" },
    { id: "skulldrome", name: "Skulldrome", image: "assets/fortress-img/skulldrome-base.webp" },
    { id: "travis", name: "Travis", image: "assets/fortress-img/travis-base.webp" }
  ];

  return { CHARACTERS };
});
