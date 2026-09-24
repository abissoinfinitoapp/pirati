/* =============================================================================
   Fortress Army — Configurazione delle 9 zone della mappa (prima interfaccia
   giocabile). Fonte di verità unica per nome/immagine/anello/pericolo/gittata/
   loot indicativo/collegamenti: la UI legge SOLO da qui, mai numeri sparsi
   nel rendering. Il motore (engine/fortress-loop.js) continua a gestire
   stato e regole — questo file produce solo l'input che createGame({zones})
   già accetta, senza duplicare né modificare il loop.

   Vocabolario obbligato dal motore (mai libero):
   - ring: "esterno" | "interno" | "centro" (letto da landPlayer/Tempesta)
   - danger: "basso" | "medio" | "alto" (letto da rollLootCategory)
   - encounterRange: "vicino" | "medio" | "lontano" (letto da RANGE_ORDER)
   "lootTier" è invece solo testo informativo per il pannello: il loop non lo
   legge mai (il Loot vero resta quello provvisorio già esistente).
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.FORTRESS_ZONES = api.ZONES;
    root.FORTRESS_ZONES_API = api;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  /* Stelle di pericolo per la UI, derivate dal vocabolario del motore:
     mai un secondo numero di pericolo scritto a mano sulla zona. */
  const DANGER_STARS = { basso: 1, medio: 2, alto: 3 };

  /* layout: posizione della tile nella griglia della mappa (riga/colonna,
     1-based). Puro dato di presentazione per la UI — mai letto dall'engine,
     mai un nome di zona nel CSS (vedi fortress-game-ui.js/styles-fortress.css):
     una mappa futura porta semplicemente le proprie coordinate qui.

     initialEncounter: composizione (dati puri) dell'incontro che l'engine
     genera alla prima entrata di un giocatore nella zona (vedi
     engine/fortress-loop.js ensureInitialEncounter) — mai più di una volta
     per zona, mai rigenerato dopo la pulizia. Assente = nessun incontro.
     Scelta MVP: 1× "normale" per ciascuna delle 8 zone non-centrali;
     central-fortress ne resta priva (dominio del Boss, sistema indipendente):
     valore facilmente ribilanciabile qui, mai nell'engine. */
  const ZONES = [
    { id: "abandoned-city", name: "Abandoned City", image: "assets/fortress-img/abandoned-city.webp",
      ring: "esterno", danger: "medio", encounterRange: "vicino", lootTier: "medio",
      layout: { row: 3, col: 1 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["forest", "frontier-camp", "industrial-zone"] },
    { id: "forest", name: "Forest", image: "assets/fortress-img/forest.webp",
      ring: "esterno", danger: "basso", encounterRange: "lontano", lootTier: "basso",
      layout: { row: 1, col: 2 },
      // Prima zona migrata al Node Graph (Zone Magnify V1): niente più
      // initialEncounter a livello zona, sostituito dal nodo Encounter sotto.
      // entryNodeId è dove landPlayer/moveAction posizionano il player.nodeId
      // quando si entra in Forest (atterraggio o dalla World Map). Nodi:
      // n01 entry -> n02 bivio (passaggio) -> n03 cassa / n04 Encounter,
      // così n02 offre una scelta direzionale reale (su/giù), non un corridoio.
      entryNodeId: "forest-n01",
      nodes: [
        { id: "forest-n01", x: 15, y: 50, connections: { right: "forest-n02" } },
        { id: "forest-n02", x: 45, y: 50, connections: { left: "forest-n01", up: "forest-n03", down: "forest-n04" } },
        { id: "forest-n03", x: 45, y: 20, connections: { down: "forest-n02" },
          contents: [{ type: "chestSlot", slot: 0 }] },
        { id: "forest-n04", x: 45, y: 80, connections: { up: "forest-n02" },
          contents: [{ type: "encounter", composition: [{ archetype: "normale" }] }] }
      ],
      connections: ["abandoned-city", "hill-outpost", "ancient-ruins"] },
    { id: "hill-outpost", name: "Hill Outpost", image: "assets/fortress-img/hill-outpost.webp",
      ring: "esterno", danger: "medio", encounterRange: "lontano", lootTier: "medio",
      layout: { row: 3, col: 3 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["forest", "frontier-camp", "military-base"] },
    { id: "frontier-camp", name: "Frontier Camp", image: "assets/fortress-img/frontier-camp.webp",
      ring: "esterno", danger: "basso", encounterRange: "medio", lootTier: "basso/medio",
      layout: { row: 5, col: 2 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["hill-outpost", "abandoned-city", "supply-depot"] },

    { id: "industrial-zone", name: "Industrial Zone", image: "assets/fortress-img/industrial-zone.webp",
      ring: "interno", danger: "alto", encounterRange: "medio", lootTier: "alto",
      layout: { row: 4, col: 1 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["abandoned-city", "ancient-ruins", "supply-depot", "central-fortress"] },
    { id: "ancient-ruins", name: "Ancient Ruins", image: "assets/fortress-img/ancient-ruins.webp",
      ring: "interno", danger: "medio", encounterRange: "lontano", lootTier: "medio/alto",
      layout: { row: 2, col: 2 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["forest", "industrial-zone", "military-base", "central-fortress"] },
    { id: "military-base", name: "Military Base", image: "assets/fortress-img/military-base.webp",
      ring: "interno", danger: "alto", encounterRange: "vicino", lootTier: "alto",
      layout: { row: 4, col: 3 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["hill-outpost", "ancient-ruins", "supply-depot", "central-fortress"] },
    { id: "supply-depot", name: "Supply Depot", image: "assets/fortress-img/supply-depot.webp",
      ring: "interno", danger: "medio", encounterRange: "medio", lootTier: "alto",
      layout: { row: 4, col: 2 },
      initialEncounter: [{ archetype: "normale" }],
      connections: ["frontier-camp", "military-base", "industrial-zone", "central-fortress"] },

    { id: "central-fortress", name: "Central Fortress", image: "assets/fortress-img/central-fortress.webp",
      ring: "centro", danger: "alto", encounterRange: "medio", lootTier: null,
      layout: { row: 3, col: 2 },
      connections: ["industrial-zone", "ancient-ruins", "military-base", "supply-depot"] }
  ];

  const VALID_RING = ["esterno", "interno", "centro"];
  const VALID_DANGER = ["basso", "medio", "alto"];
  const VALID_RANGE = ["vicino", "medio", "lontano"];

  function validateZones(list) {
    const problems = [];
    const ids = new Set(list.map((z) => z.id));
    list.forEach((z) => {
      const where = `#${z.id}`;
      if (!ids.has(z.id) || ids.size !== list.length) { /* controllato una volta sotto */ }
      if (VALID_RING.indexOf(z.ring) === -1) problems.push(`${where}: ring non valido "${z.ring}"`);
      if (VALID_DANGER.indexOf(z.danger) === -1) problems.push(`${where}: danger non valido "${z.danger}"`);
      if (VALID_RANGE.indexOf(z.encounterRange) === -1) problems.push(`${where}: encounterRange non valido "${z.encounterRange}"`);
      z.connections.forEach((cid) => {
        if (!ids.has(cid)) { problems.push(`${where}: collegamento a id inesistente "${cid}"`); return; }
        const other = list.find((o) => o.id === cid);
        if (other && other.connections.indexOf(z.id) === -1) problems.push(`${where} <-> ${cid}: collegamento non simmetrico`);
      });
    });
    const idCounts = {};
    list.forEach((z) => { idCounts[z.id] = (idCounts[z.id] || 0) + 1; });
    Object.entries(idCounts).forEach(([id, n]) => { if (n > 1) problems.push(`id duplicato: ${id}`); });
    return problems;
  }

  const zoneProblems = validateZones(ZONES);
  if (zoneProblems.length && typeof console !== "undefined") {
    console.warn("[Fortress Army] Zone mappa: " + zoneProblems.length + " problemi:\n" + zoneProblems.join("\n"));
  }

  /* Costruisce l'array di zone nel formato ESATTO che engine/fortress-loop.js
     si aspetta da createGame({zones}) — stesso shape che il loop produrrebbe
     internamente con la sua mappa di default — senza che il loop esporti
     nulla di nuovo: riusa solo combat.createNoiseTracker(), già pubblico.
     `combat` va passato dal chiamante (mai un require/window impliciti qui
     dentro), così questo file resta utilizzabile anche nei test Node. */
  function buildLoopZones(combat) {
    return ZONES.map((z) => ({
      id: z.id,
      name: z.name,
      type: null, // mai letto dal loop se encounterRange è già esplicito (vedi sopra)
      ring: z.ring,
      connections: z.connections.slice(),
      danger: z.danger,
      encounterRange: z.encounterRange,
      lootTier: z.lootTier, // legge SOLO loot.setupChests(): mai il danger, mai l'id della zona
      stormState: "sicura",
      ambientLootClaimed: false,
      initialEncounter: z.initialEncounter || null,
      // Node Graph (Zone Magnify): z.nodes è dato statico del catalogo, mai
      // mutato — qui è solo REFERENZIATO (stesso array), mai clonato/copiato
      // in modo che l'engine possa leggere connections/contents. nodeStates è
      // invece lo stato runtime mutabile, separato dalla Map Definition come
      // richiesto: un flag encounterSpawned per nodo, mai "cleared" salvato
      // (si deriva sempre da enemiesAtNode). Zone senza z.nodes restano
      // esattamente come nel commit precedente: nodes/entryNodeId assenti,
      // nodeStates un oggetto vuoto mai consultato.
      nodes: z.nodes || null,
      entryNodeId: z.entryNodeId || null,
      nodeStates: (z.nodes || []).reduce((acc, n) => { acc[n.id] = { encounterSpawned: false }; return acc; }, {}),
      initialEncounterSpawned: false,
      chests: [],
      groundLoot: [],
      smokeActive: false,
      noiseTracker: combat.createNoiseTracker()
    }));
  }

  return { ZONES, DANGER_STARS, validateZones, zoneProblems, buildLoopZones };
});
