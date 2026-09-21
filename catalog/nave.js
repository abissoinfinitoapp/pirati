/* =============================================================================
   CATALOGO — La nave della ciurma
   -----------------------------------------------------------------------------
   6 livelli (0 = nave di partenza, 1-5 = upgrade): ogni upgrade costa monete
   del forziere comune ("cost", da state.crew.coins) E il possesso di 1-2
   premi della casa di Nonna Belarda ("requires": id dal catalogo premi in
   catalog/premi.js) — vengono consumati, spariscono dal Bottino.

   "speed" e "strength" sono bonus fissi che restano attivi da quel livello
   in poi: speed = miglia in più quando la ciurma naviga, strength = bonus
   nelle prove di Coraggio contro mostri e assalti sulla mappa.
   ========================================================================== */

PIRATI.registerShipUpgrades([
  {
    level: 0,
    name: "Barchetta Scalcinata",
    text: "Assi scricchiolanti, una vela rattoppata coi calzini spaiati: la nave con cui la ciurma è partita.",
    image: window.PIRATI_ASSET("upgrades/livello-0.webp"),
    cost: 0,
    requires: [],
    speed: 0,
    strength: 0
  },
  {
    level: 1,
    name: "Chiglia Rinforzata",
    text: "Con la Barchetta di Latta come modello, il falegname rinforza lo scafo: la nave fila più dritta.",
    image: window.PIRATI_ASSET("upgrades/livello-1.webp"),
    cost: 300000,
    requires: ["barchetta-latta"],
    speed: 1,
    strength: 0
  },
  {
    level: 2,
    name: "Timone Vero",
    text: "Il Vecchio Timone al posto del bastone legato con lo spago: ora si vira sul serio, e si tiene testa a chiunque.",
    image: window.PIRATI_ASSET("upgrades/livello-2.webp"),
    cost: 700000,
    requires: ["vecchio-timone"],
    speed: 0,
    strength: 1
  },
  {
    level: 3,
    name: "Rotta Tracciata",
    text: "Bussola e mappa fissate in plancia: la ciurma non si perde più e guadagna velocità in ogni traversata.",
    image: window.PIRATI_ASSET("upgrades/livello-3.webp"),
    cost: 1500000,
    requires: ["bussola-nord", "mappa-isola"],
    speed: 1,
    strength: 0
  },
  {
    level: 4,
    name: "Prua Dorata",
    text: "Scrigno e corona fusi nella polena: la nave incute rispetto, e i mostri ci pensano due volte.",
    image: window.PIRATI_ASSET("upgrades/livello-4.webp"),
    cost: 2500000,
    requires: ["scrigno-velluto", "corona-ammaccata"],
    speed: 0,
    strength: 1
  },
  {
    level: 5,
    name: "Vascello dei Sogni",
    text: "L'ultimo pezzo, il Galeone in Bottiglia aperto e montato in miniatura sul ponte: la nave più bella dei sette mari.",
    image: window.PIRATI_ASSET("upgrades/livello-5.webp"),
    cost: 4000000,
    requires: ["vascello-sogni", "galeone-bottiglia"],
    speed: 1,
    strength: 1
  }
]);
