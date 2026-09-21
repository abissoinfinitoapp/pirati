/* =============================================================================
   CATALOGO — La casa di Nonna Belarda
   -----------------------------------------------------------------------------
   Quando la casa di Nonna Belarda esplode di cianfrusaglie, il motore ne
   pesca una a caso (evitando le ultime due usate) e la assegna alla ciurma.
   "text" e' la frase che racconta cosa salta fuori dal crollo; "rewards"
   usa la stessa struttura dei saccheggi (coins/fame/loot), ma qui e' sempre
   un oggetto nuovo (loot) — non monete: i bambini hanno chiesto di ricevere
   navi, gioielli e cose curiose, non un numero che sale.
   ========================================================================== */

PIRATI.registerBelardaLoot([
  {
    id: "scatole-di-cartone",
    text: "Dodici tonnellate di scatole di cartone crollano in una valanga: tra i cartoni rotola fuori una Barchetta di Latta, ancora perfetta.",
    rewards: [{ type: "loot", id: "barchetta-latta" }]
  },
  {
    id: "armadio-di-specchi",
    text: "Un intero armadio di specchi scoppiettanti — un quintale buono da solo — si rovescia in strada: nella cornice più grande è incastrato un Galeone in Bottiglia.",
    rewards: [{ type: "loot", id: "galeone-bottiglia" }]
  },
  {
    id: "soffitta-di-ombrelli",
    text: "Centinaia di ombrelli spaiati piovono dalla soffitta, quintale dopo quintale: uno, foderato d'oro vero, nasconde nel manico un Anello con la Gemma Verde. Nonna Belarda vi applaude commossa: +1 Fama.",
    rewards: [{ type: "loot", id: "anello-gemma" }, { type: "fame", amount: 1 }]
  },
  {
    id: "baule-doppio-fondo",
    text: "Sotto una montagna di posate spaiate — pesa più di un'automobile — spunta un vecchio baule col doppio fondo: dentro, uno Scrigno di Velluto, vuoto e pronto per il prossimo tesoro.",
    rewards: [{ type: "loot", id: "scrigno-velluto" }]
  },
  {
    id: "montagna-di-lattine",
    text: "Una montagna di lattine vuote frana rumorosamente, tonnellata su tonnellata... e in fondo, intatta, una Moneta d'Oro Gigante che Nonna Belarda aveva completamente dimenticato.",
    rewards: [{ type: "loot", id: "moneta-gigante" }]
  },
  {
    id: "scaffale-di-bambole",
    text: "Uno scaffale di bambole spettinate — dodici tonnellate in tutto, giura Nonna Belarda — si rovescia tutto insieme: tra i vestitini spunta un Pappagallo Impagliato che Canta Ancora. +1 Fama.",
    rewards: [{ type: "loot", id: "pappagallo-canta" }, { type: "fame", amount: 1 }]
  },
  {
    id: "soffitta-di-cappelli",
    text: "Una soffitta intera di cappelli fuori moda frana in un turbine di piume e nastri: rotola fuori una Corona Ammaccata, un po' storta ma innegabilmente regale.",
    rewards: [{ type: "loot", id: "corona-ammaccata" }]
  },
  {
    id: "cesta-di-bottoni",
    text: "Una cesta di bottoni spaiati — pesa quanto una balena piccola — si rovescia tintinnando: tra i bottoni luccica una Collana di Perle Vere.",
    rewards: [{ type: "loot", id: "collana-perle" }]
  },
  {
    id: "pila-di-valigie",
    text: "Una pila di valigie di ogni colore, alta come una nave, crolla tutta insieme: da una tasca segreta esce una Mappa di un'Isola che Non Esiste. Nonna Belarda sussurra: «Quella l'ho cercata per anni». +1 Fama.",
    rewards: [{ type: "loot", id: "mappa-isola" }, { type: "fame", amount: 1 }]
  },
  {
    id: "cataste-di-libri",
    text: "Cataste di libri mai letti — tonnellate di carta ingiallita — si rovesciano come una cascata: tra le pagine cade un Occhiale con un Solo Vetro.",
    rewards: [{ type: "loot", id: "occhiali-vetro" }]
  },
  {
    id: "matassa-di-reti",
    text: "Una gigantesca matassa di reti da pesca, annodate su se stesse da decenni, si srotola tutta insieme: impigliato dentro, un Cannocchiale Arrugginito ma Preciso.",
    rewards: [{ type: "loot", id: "cannocchiale-arruginito" }]
  },
  {
    id: "barili-di-chiodi",
    text: "File di barili pieni di chiodi arrugginiti rotolano giù per la collina come tuoni: da uno spunta un Vecchio Timone di Legno, consumato da mille mani.",
    rewards: [{ type: "loot", id: "vecchio-timone" }]
  },
  {
    id: "nido-di-orologi",
    text: "Un intero nido di orologi rotti — nessuno segna la stessa ora — precipita ticchettando: tra le lancette spunta una Bussola che Punta Sempre a Nord-Ovest.",
    rewards: [{ type: "loot", id: "bussola-nord" }]
  },
  {
    id: "torre-di-piatti",
    text: "Una torre di piatti spaiati, altissima, crolla in un fragore di ceramica che si sente da tre isole: nel centro della pila, intatto, un Vascello dei Sogni. +1 Fama.",
    rewards: [{ type: "loot", id: "vascello-sogni" }, { type: "fame", amount: 1 }]
  }
]);
