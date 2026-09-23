/* =============================================================================
   Fortress Army — Censimento personaggi (10 immagini già separate).

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
    { id: "automate", name: "Automate", image: "assets/fortress-img/automate.webp" },
    { id: "cat", name: "Cat", image: "assets/fortress-img/cat.webp" },
    { id: "duck", name: "Duck", image: "assets/fortress-img/duck.webp" },
    { id: "ghost", name: "Ghost", image: "assets/fortress-img/ghost.webp" },
    { id: "icekron", name: "Icekron", image: "assets/fortress-img/icekron.webp" },
    { id: "omalma", name: "Omalma", image: "assets/fortress-img/omalma.webp" },
    { id: "pandax", name: "Pandax", image: "assets/fortress-img/pandax.webp" },
    { id: "robotron", name: "Robotron", image: "assets/fortress-img/robotron.webp" },
    { id: "skulldrome", name: "Skulldrome", image: "assets/fortress-img/skulldrome.webp" },
    { id: "travis", name: "Travis", image: "assets/fortress-img/travis.webp" }
  ];

  return { CHARACTERS };
});
