/* =============================================================================
   Fortress Army — Catalogo Oggetti di Supporto (Cura, Scudo, Utility).

   Nessuna dipendenza dal catalogo Armi. Cura/Scudo hanno 3 livelli di
   qualità (indice 0/1/2 = Livello 1/2/3), Utility non ha livelli: sono 3
   oggetti distinti con effetti diversi tra loro.

   Compatibile Node (require, per i test) e browser (window.FORTRESS_*).
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.FORTRESS_ITEMS = api;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  /* Ordine = ordine di qualità crescente (indice 0/1/2 = Livello 1/2/3).
     `amount: null` + `full: true` = riporta al massimo (10), mai un numero
     scritto altrove: il massimo vive in engine/fortress-loop.js (clamp). */
  const CURA = [
    { id: "bende", name: "Bende", kind: "cura", amount: 3, full: false },
    { id: "medikit", name: "Medikit", kind: "cura", amount: 6, full: false },
    { id: "kit_medico", name: "Kit Medico", kind: "cura", amount: null, full: true }
  ];

  const SCUDO = [
    { id: "mini_scudo", name: "Mini Scudo", kind: "scudo", amount: 3, full: false },
    { id: "batteria_scudo", name: "Batteria Scudo", kind: "scudo", amount: 6, full: false },
    { id: "scudo_totale", name: "Scudo Totale", kind: "scudo", amount: null, full: true }
  ];

  /* Nessun livello di qualità: ogni Utility è un oggetto a sé. */
  const UTILITY = [
    { id: "scanner", name: "Scanner", kind: "utility" },
    { id: "fumogeno", name: "Fumogeno", kind: "utility" },
    { id: "stim", name: "Stim", kind: "utility" }
  ];

  const ALL = CURA.concat(SCUDO, UTILITY);

  function findItem(id) {
    return ALL.find((it) => it.id === id) || null;
  }

  return { CURA, SCUDO, UTILITY, ALL, findItem };
});
