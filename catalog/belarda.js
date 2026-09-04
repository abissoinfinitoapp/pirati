/* =============================================================================
   CATALOGO — La casa di Nonna Belarda
   -----------------------------------------------------------------------------
   Quando la casa di Nonna Belarda su un'isola esplode di cianfrusaglie, il
   motore ne pesca uno a caso (evitando gli ultimi due usati) e lo assegna
   alla ciurma. "text" e' la frase che racconta cosa salta fuori dal crollo;
   "rewards" usa la stessa struttura dei saccheggi (coins/fame/loot).
   ========================================================================== */

PIRATI.registerBelardaLoot([
  {
    id: "scatole-di-cartone",
    text: "Dodici tonnellate di scatole di cartone crollano in una valanga: rotolano fuori sacchetti di monete per 350.000, dimenticati chissà quando.",
    rewards: [{ type: "coins", amount: 350000 }]
  },
  {
    id: "armadio-di-specchi",
    text: "Un intero armadio di specchi scoppiettanti — un quintale buono da solo — si rovescia in strada: nella cornice più grande è incastrato un malloppo da 550.000 monete.",
    rewards: [{ type: "coins", amount: 550000 }]
  },
  {
    id: "soffitta-di-ombrelli",
    text: "Centinaia di ombrelli spaiati piovono dalla soffitta, quintale dopo quintale: uno, foderato d'oro vero, vale da solo 250.000 monete. Nonna Belarda vi applaude commossa: +1 Fama.",
    rewards: [{ type: "coins", amount: 250000 }, { type: "fame", amount: 1 }]
  },
  {
    id: "baule-doppio-fondo",
    text: "Sotto una montagna di posate spaiate — pesa più di un'automobile — spunta un vecchio baule col doppio fondo: dentro, una Campanella di Marea e 200.000 monete.",
    rewards: [{ type: "loot", id: "campanella-marea" }, { type: "coins", amount: 200000 }]
  },
  {
    id: "montagna-di-lattine",
    text: "Una montagna di lattine vuote frana rumorosamente, tonnellata su tonnellata... e in fondo, intatto, un forziere con 900.000 monete che Nonna Belarda aveva completamente dimenticato.",
    rewards: [{ type: "coins", amount: 900000 }]
  },
  {
    id: "scaffale-di-bambole",
    text: "Uno scaffale di bambole spettinate — dodici tonnellate in tutto, giura Nonna Belarda — si rovescia tutto insieme: tra i vestitini trovate una Fiala di Lucciole ancora accesa e 300.000 monete.",
    rewards: [{ type: "loot", id: "fiala-lucciole" }, { type: "coins", amount: 300000 }]
  }
]);
