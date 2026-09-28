/* =============================================================================
   Fortress Army — Map 01 / Zone Definitions V2

   Le zone dichiarano identità e contenuto; engine/fortress-zone-director.js
   materializza Node Graph, Encounter e opportunità condivise. In questo modo
   aggiungere una nuova mappa significa soprattutto aggiungere dati, non
   duplicare logiche di gioco.
   ========================================================================= */
(function (root, factory) {
  const zoneDirector = typeof module === "object" && module.exports
    ? require("../engine/fortress-zone-director.js")
    : root.FORTRESS_ZONE_DIRECTOR;
  const api = factory(zoneDirector);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.FORTRESS_ZONES = api.ZONES;
    root.FORTRESS_ZONES_API = api;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function (zoneDirector) {
  "use strict";

  if (!zoneDirector) throw new Error("FORTRESS_ZONE_DIRECTOR non caricato");

  const DANGER_STARS = { basso: 1, medio: 2, alto: 3 };

  /* -------------------------------------------------------------------------
     MAP 01 — dichiarazioni compatte.
     Le otto zone normali usano il Node Graph generico. Central Fortress resta
     volutamente speciale: è il dominio del Boss/finale e non viene forzata
     dentro il template delle zone esplorative.
     ------------------------------------------------------------------------- */
  const RAW_ZONES = [
    {
      id:"abandoned-city", name:"Abandoned City", image:"assets/fortress-img/abandoned-city.webp",
      ring:"esterno", danger:"medio", encounterRange:"vicino", lootTier:"medio", layout:{row:3,col:1},
      profile:"urban", template:"diamond5", entryNode:"n01", chestSlots:["n03","n04"],
      encounterPlan:[
        {archetype:"aggressivo",node:"n02"},{archetype:"normale",node:"n02"},
        {archetype:"distanza",node:"n03"},{archetype:"normale",node:"n04"},
        {archetype:"resistente",node:"n05"},{archetype:"normale",node:"n05"}
      ],
      operationalStructure:{ id:"city-radio-hub", name:"Centro Radio Fortificato", node:"n05", hp:38, armor:2, attackDice:2, attackPower:2, activeTags:["ANTENNE ATTIVE","TORRETTA ATTIVA"] },
      connections:["forest","frontier-camp","industrial-zone"]
    },
    {
      id:"forest", name:"Forest", image:"assets/fortress-img/forest.webp",
      ring:"esterno", danger:"basso", encounterRange:"lontano", lootTier:"basso", layout:{row:1,col:2},
      profile:"wilderness",
      // Forest rimane il riferimento validato: stessa topologia e stessi id.
      nodes:[
        { id:"forest-n01", x:15, y:50, connections:{right:"forest-n02"} },
        { id:"forest-n02", x:45, y:50, connections:{left:"forest-n01",up:"forest-n03",down:"forest-n04"} },
        { id:"forest-n03", x:45, y:20, connections:{down:"forest-n02"}, contents:[{type:"chestSlot",slot:0}] },
        { id:"forest-n04", x:45, y:80, connections:{up:"forest-n02"} }
      ],
      entryNodeId:"forest-n01",
      encounter:{ composition:[
        {archetype:"aggressivo",nodeId:"forest-n02"},{archetype:"normale",nodeId:"forest-n02"},
        {archetype:"distanza",nodeId:"forest-n03"},{archetype:"resistente",nodeId:"forest-n03"},
        {archetype:"normale",nodeId:"forest-n04"},{archetype:"normale",nodeId:"forest-n04"}
      ]},
      operationalStructure:{ id:"forest-armored-camp", name:"Accampamento Blindato", nodeId:"forest-n04", hp:40, armor:3, attackDice:2, attackPower:2, activeTags:["TORRI ATTIVE","RADAR ATTIVO"] },
      connections:["abandoned-city","hill-outpost","ancient-ruins"]
    },
    {
      id:"hill-outpost", name:"Hill Outpost", image:"assets/fortress-img/hill-outpost.webp",
      ring:"esterno", danger:"medio", encounterRange:"lontano", lootTier:"medio", layout:{row:3,col:3},
      profile:"highground", template:"corridor5", entryNode:"n01", chestSlots:["n03","n05"],
      encounterPlan:[
        {archetype:"normale",node:"n02"},{archetype:"distanza",node:"n03"},
        {archetype:"distanza",node:"n04"},{archetype:"resistente",node:"n05"},{archetype:"normale",node:"n05"},{archetype:"normale",node:"n04"}
      ],
      operationalStructure:{ id:"hill-radar", name:"Radar di Vetta", node:"n05", hp:36, armor:2, attackDice:2, attackPower:2, activeTags:["RADAR ATTIVO","MIRINO LUNGO"] },
      connections:["forest","frontier-camp","military-base"]
    },
    {
      id:"frontier-camp", name:"Frontier Camp", image:"assets/fortress-img/frontier-camp.webp",
      ring:"esterno", danger:"basso", encounterRange:"medio", lootTier:"basso/medio", layout:{row:5,col:2},
      profile:"frontier", template:"cross5", entryNode:"n01", chestSlots:["n03","n05"],
      encounterPlan:[
        {archetype:"aggressivo",node:"n02"},{archetype:"normale",node:"n03"},
        {archetype:"normale",node:"n04"},{archetype:"aggressivo",node:"n05"},{archetype:"normale",node:"n04"},{archetype:"normale",node:"n03"}
      ],
      operationalStructure:{ id:"frontier-watch", name:"Torre di Frontiera", node:"n04", hp:34, armor:2, attackDice:2, attackPower:1, activeTags:["FARO ATTIVO","TORRETTA ATTIVA"] },
      connections:["hill-outpost","abandoned-city","supply-depot"]
    },
    {
      id:"industrial-zone", name:"Industrial Zone", image:"assets/fortress-img/industrial-zone.webp",
      ring:"interno", danger:"alto", encounterRange:"medio", lootTier:"alto", layout:{row:4,col:1},
      profile:"industrial", template:"split6", entryNode:"n01", chestSlots:["n03","n06"],
      encounterPlan:[
        {archetype:"aggressivo",node:"n02"},{archetype:"normale",node:"n03"},{archetype:"resistente",node:"n03"},
        {archetype:"normale",node:"n04"},{archetype:"aggressivo",node:"n05"},{archetype:"resistente",node:"n06"},{archetype:"distanza",node:"n06"}
      ],
      operationalStructure:{ id:"industrial-generator", name:"Generatore Corazzato", node:"n06", hp:44, armor:3, attackDice:2, attackPower:2, activeTags:["RETE ATTIVA","TORRETTE ATTIVE"] },
      connections:["abandoned-city","ancient-ruins","supply-depot","central-fortress"]
    },
    {
      id:"ancient-ruins", name:"Ancient Ruins", image:"assets/fortress-img/ancient-ruins.webp",
      ring:"interno", danger:"medio", encounterRange:"lontano", lootTier:"medio/alto", layout:{row:2,col:2},
      profile:"ruins", template:"loop5", entryNode:"n01", chestSlots:["n03","n04"],
      encounterPlan:[
        {archetype:"normale",node:"n02"},{archetype:"distanza",node:"n03"},{archetype:"resistente",node:"n03"},
        {archetype:"normale",node:"n04"},{archetype:"aggressivo",node:"n05"},{archetype:"normale",node:"n05"}
      ],
      operationalStructure:{ id:"ruins-seal", name:"Sigillo Meccanico Antico", node:"n04", hp:40, armor:3, attackDice:1, attackPower:3, activeTags:["SIGILLO ATTIVO","IMPULSO ATTIVO"] },
      connections:["forest","industrial-zone","military-base","central-fortress"]
    },
    {
      id:"military-base", name:"Military Base", image:"assets/fortress-img/military-base.webp",
      ring:"interno", danger:"alto", encounterRange:"vicino", lootTier:"alto", layout:{row:4,col:3},
      profile:"military", template:"split6", entryNode:"n01", chestSlots:["n04","n06"],
      encounterPlan:[
        {archetype:"aggressivo",node:"n02"},{archetype:"resistente",node:"n03"},{archetype:"normale",node:"n03"},
        {archetype:"aggressivo",node:"n04"},{archetype:"distanza",node:"n05"},{archetype:"resistente",node:"n06"},{archetype:"elite",node:"n06"}
      ],
      operationalStructure:{ id:"military-command", name:"Centro Comando Blindato", node:"n06", hp:48, armor:4, attackDice:2, attackPower:3, activeTags:["TORRI ATTIVE","RADAR ATTIVO","COMANDO ATTIVO"] },
      connections:["hill-outpost","ancient-ruins","supply-depot","central-fortress"]
    },
    {
      id:"supply-depot", name:"Supply Depot", image:"assets/fortress-img/supply-depot.webp",
      ring:"interno", danger:"medio", encounterRange:"medio", lootTier:"alto", layout:{row:4,col:2},
      profile:"depot", template:"diamond5", entryNode:"n01", chestSlots:["n03","n04"],
      encounterPlan:[
        {archetype:"normale",node:"n02"},{archetype:"aggressivo",node:"n03"},{archetype:"resistente",node:"n03"},
        {archetype:"normale",node:"n04"},{archetype:"distanza",node:"n05"},{archetype:"resistente",node:"n05"}
      ],
      operationalStructure:{ id:"depot-ammo-core", name:"Deposito Munizioni Corazzato", node:"n05", hp:42, armor:3, attackDice:2, attackPower:2, activeTags:["SERRANDE ATTIVE","TORRETTA ATTIVA"] },
      connections:["frontier-camp","military-base","industrial-zone","central-fortress"]
    },
    {
      id:"central-fortress", name:"Central Fortress", image:"assets/fortress-img/central-fortress.webp",
      ring:"centro", danger:"alto", encounterRange:"medio", lootTier:null, layout:{row:3,col:2},
      connections:["industrial-zone","ancient-ruins","military-base","supply-depot"]
    }
  ];

  // Layout ufficiali Map 01 esportati dall'Editor Mappe (26/09/2026).
  // Sono dati geografici permanenti: coordinate + grafo. Il contenuto dinamico
  // continua a essere generato dal Zone Director.
  const OFFICIAL_LAYOUTS = {
  "abandoned-city": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "abandoned-city",
    "entryNodeId": "abandoned-city-n01",
    "nodes": [
      {
        "id": "abandoned-city-n01",
        "x": 20.47,
        "y": 82.06
      },
      {
        "id": "abandoned-city-n02",
        "x": 41.33,
        "y": 55.6
      },
      {
        "id": "abandoned-city-n03",
        "x": 35.69,
        "y": 23.11
      },
      {
        "id": "abandoned-city-n04",
        "x": 62.76,
        "y": 45.86
      },
      {
        "id": "abandoned-city-n05",
        "x": 66.52,
        "y": 12.43
      }
    ],
    "edges": [
      [
        "abandoned-city-n01",
        "abandoned-city-n02"
      ],
      [
        "abandoned-city-n02",
        "abandoned-city-n03"
      ],
      [
        "abandoned-city-n02",
        "abandoned-city-n04"
      ],
      [
        "abandoned-city-n03",
        "abandoned-city-n05"
      ],
      [
        "abandoned-city-n04",
        "abandoned-city-n05"
      ]
    ]
  },
  "ancient-ruins": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "ancient-ruins",
    "entryNodeId": "ancient-ruins-n01",
    "nodes": [
      {
        "id": "ancient-ruins-n01",
        "x": 13.15,
        "y": 6.93
      },
      {
        "id": "ancient-ruins-n02",
        "x": 24.54,
        "y": 36.93
      },
      {
        "id": "ancient-ruins-n03",
        "x": 55.41,
        "y": 60.56
      },
      {
        "id": "ancient-ruins-n04",
        "x": 79.61,
        "y": 49.45
      },
      {
        "id": "ancient-ruins-n05",
        "x": 55.92,
        "y": 12.93
      }
    ],
    "edges": [
      [
        "ancient-ruins-n01",
        "ancient-ruins-n02"
      ],
      [
        "ancient-ruins-n02",
        "ancient-ruins-n03"
      ],
      [
        "ancient-ruins-n03",
        "ancient-ruins-n04"
      ],
      [
        "ancient-ruins-n04",
        "ancient-ruins-n05"
      ]
    ]
  },
  "central-fortress": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "central-fortress",
    "entryNodeId": "central-fortress-n01",
    "nodes": [
      {
        "id": "central-fortress-n01",
        "x": 51.25,
        "y": 94.26
      },
      {
        "id": "central-fortress-n02",
        "x": 50.17,
        "y": 52.11
      },
      {
        "id": "central-fortress-n03",
        "x": 26.48,
        "y": 25.52
      },
      {
        "id": "central-fortress-n04",
        "x": 74.94,
        "y": 27.74
      },
      {
        "id": "central-fortress-n05",
        "x": 49.2,
        "y": 28.78
      }
    ],
    "edges": [
      [
        "central-fortress-n01",
        "central-fortress-n02"
      ],
      [
        "central-fortress-n02",
        "central-fortress-n03"
      ],
      [
        "central-fortress-n02",
        "central-fortress-n04"
      ],
      [
        "central-fortress-n02",
        "central-fortress-n05"
      ],
      [
        "central-fortress-n03",
        "central-fortress-n05"
      ],
      [
        "central-fortress-n04",
        "central-fortress-n05"
      ]
    ]
  },
  "forest": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "forest",
    "entryNodeId": "forest-n01",
    "nodes": [
      {
        "id": "forest-n01",
        "x": 40.02,
        "y": 88.93
      },
      {
        "id": "forest-n02",
        "x": 63.66,
        "y": 56.76
      },
      {
        "id": "forest-n03",
        "x": 22.6,
        "y": 58.35
      },
      {
        "id": "forest-n04",
        "x": 48.53,
        "y": 26.18
      }
    ],
    "edges": [
      [
        "forest-n01",
        "forest-n02"
      ],
      [
        "forest-n02",
        "forest-n03"
      ],
      [
        "forest-n02",
        "forest-n04"
      ],
      [
        "forest-n03",
        "forest-n04"
      ]
    ]
  },
  "frontier-camp": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "frontier-camp",
    "entryNodeId": "frontier-camp-n01",
    "nodes": [
      {
        "id": "frontier-camp-n01",
        "x": 19.08,
        "y": 71.37
      },
      {
        "id": "frontier-camp-n02",
        "x": 66.52,
        "y": 85.44
      },
      {
        "id": "frontier-camp-n03",
        "x": 49.75,
        "y": 43.54
      },
      {
        "id": "frontier-camp-n04",
        "x": 20.39,
        "y": 27.98
      },
      {
        "id": "frontier-camp-n05",
        "x": 54.42,
        "y": 12
      }
    ],
    "edges": [
      [
        "frontier-camp-n01",
        "frontier-camp-n02"
      ],
      [
        "frontier-camp-n01",
        "frontier-camp-n03"
      ],
      [
        "frontier-camp-n01",
        "frontier-camp-n04"
      ],
      [
        "frontier-camp-n02",
        "frontier-camp-n03"
      ],
      [
        "frontier-camp-n03",
        "frontier-camp-n04"
      ],
      [
        "frontier-camp-n03",
        "frontier-camp-n05"
      ],
      [
        "frontier-camp-n04",
        "frontier-camp-n05"
      ]
    ]
  },
  "hill-outpost": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "hill-outpost",
    "entryNodeId": "hill-outpost-n01",
    "nodes": [
      {
        "id": "hill-outpost-n01",
        "x": 45.34,
        "y": 83.33
      },
      {
        "id": "hill-outpost-n02",
        "x": 77.16,
        "y": 72.95
      },
      {
        "id": "hill-outpost-n03",
        "x": 29.06,
        "y": 38.17
      },
      {
        "id": "hill-outpost-n04",
        "x": 73.72,
        "y": 22.16
      },
      {
        "id": "hill-outpost-n05",
        "x": 48.45,
        "y": 7.88
      }
    ],
    "edges": [
      [
        "hill-outpost-n01",
        "hill-outpost-n02"
      ],
      [
        "hill-outpost-n01",
        "hill-outpost-n03"
      ],
      [
        "hill-outpost-n02",
        "hill-outpost-n03"
      ],
      [
        "hill-outpost-n02",
        "hill-outpost-n04"
      ],
      [
        "hill-outpost-n03",
        "hill-outpost-n04"
      ],
      [
        "hill-outpost-n04",
        "hill-outpost-n05"
      ]
    ]
  },
  "industrial-zone": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "industrial-zone",
    "entryNodeId": "industrial-zone-n01",
    "nodes": [
      {
        "id": "industrial-zone-n01",
        "x": 34.7,
        "y": 7.48
      },
      {
        "id": "industrial-zone-n02",
        "x": 8.69,
        "y": 30.23
      },
      {
        "id": "industrial-zone-n03",
        "x": 55.32,
        "y": 27.16
      },
      {
        "id": "industrial-zone-n04",
        "x": 64.72,
        "y": 67.9
      },
      {
        "id": "industrial-zone-n05",
        "x": 85.83,
        "y": 36.79
      },
      {
        "id": "industrial-zone-n06",
        "x": 48.36,
        "y": 49.7
      }
    ],
    "edges": [
      [
        "industrial-zone-n01",
        "industrial-zone-n02"
      ],
      [
        "industrial-zone-n01",
        "industrial-zone-n03"
      ],
      [
        "industrial-zone-n02",
        "industrial-zone-n04"
      ],
      [
        "industrial-zone-n03",
        "industrial-zone-n05"
      ],
      [
        "industrial-zone-n03",
        "industrial-zone-n06"
      ],
      [
        "industrial-zone-n04",
        "industrial-zone-n05"
      ],
      [
        "industrial-zone-n04",
        "industrial-zone-n06"
      ]
    ]
  },
  "military-base": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "military-base",
    "entryNodeId": "military-base-n01",
    "nodes": [
      {
        "id": "military-base-n01",
        "x": 40.83,
        "y": 94.19
      },
      {
        "id": "military-base-n02",
        "x": 54.16,
        "y": 70.71
      },
      {
        "id": "military-base-n03",
        "x": 18,
        "y": 38.85
      },
      {
        "id": "military-base-n04",
        "x": 71.92,
        "y": 35.74
      },
      {
        "id": "military-base-n05",
        "x": 10.36,
        "y": 8.78
      },
      {
        "id": "military-base-n06",
        "x": 42.31,
        "y": 18.63
      }
    ],
    "edges": [
      [
        "military-base-n01",
        "military-base-n02"
      ],
      [
        "military-base-n02",
        "military-base-n03"
      ],
      [
        "military-base-n03",
        "military-base-n04"
      ],
      [
        "military-base-n03",
        "military-base-n05"
      ],
      [
        "military-base-n03",
        "military-base-n06"
      ],
      [
        "military-base-n04",
        "military-base-n06"
      ],
      [
        "military-base-n05",
        "military-base-n06"
      ]
    ]
  },
  "supply-depot": {
    "format": "fortress-army-zone-layout",
    "version": 2,
    "zoneId": "supply-depot",
    "entryNodeId": "supply-depot-n01",
    "nodes": [
      {
        "id": "supply-depot-n01",
        "x": 15.03,
        "y": 9.15
      },
      {
        "id": "supply-depot-n02",
        "x": 32,
        "y": 23.15
      },
      {
        "id": "supply-depot-n03",
        "x": 52.11,
        "y": 14.63
      },
      {
        "id": "supply-depot-n04",
        "x": 46.53,
        "y": 56.19
      },
      {
        "id": "supply-depot-n05",
        "x": 83.37,
        "y": 32.04
      }
    ],
    "edges": [
      [
        "supply-depot-n01",
        "supply-depot-n02"
      ],
      [
        "supply-depot-n02",
        "supply-depot-n03"
      ],
      [
        "supply-depot-n02",
        "supply-depot-n04"
      ],
      [
        "supply-depot-n03",
        "supply-depot-n05"
      ],
      [
        "supply-depot-n04",
        "supply-depot-n05"
      ]
    ]
  }
};

  const ZONES = RAW_ZONES.map((raw) => {
    const zone = zoneDirector.materializeZoneDefinition(raw);
    const layout = OFFICIAL_LAYOUTS[zone.id];
    if (layout) zoneDirector.applyNodeLayout(zone, layout);
    return zone;
  });

  const VALID_RING = ["esterno", "interno", "centro"];
  const VALID_DANGER = ["basso", "medio", "alto"];
  const VALID_RANGE = ["vicino", "medio", "lontano"];

  function validateZones(list) {
    const problems = [];
    const ids = new Set(list.map((z) => z.id));
    list.forEach((z) => {
      const where = `#${z.id}`;
      if (VALID_RING.indexOf(z.ring) === -1) problems.push(`${where}: ring non valido "${z.ring}"`);
      if (VALID_DANGER.indexOf(z.danger) === -1) problems.push(`${where}: danger non valido "${z.danger}"`);
      if (VALID_RANGE.indexOf(z.encounterRange) === -1) problems.push(`${where}: encounterRange non valido "${z.encounterRange}"`);
      (z.connections || []).forEach((cid) => {
        if (!ids.has(cid)) { problems.push(`${where}: collegamento a id inesistente "${cid}"`); return; }
        const other = list.find((o) => o.id === cid);
        if (other && other.connections.indexOf(z.id) === -1) problems.push(`${where} <-> ${cid}: collegamento non simmetrico`);
      });
      problems.push(...zoneDirector.validateDefinition(z));
    });
    const idCounts = {};
    list.forEach((z) => { idCounts[z.id] = (idCounts[z.id] || 0) + 1; });
    Object.entries(idCounts).forEach(([id,n]) => { if (n > 1) problems.push(`id duplicato: ${id}`); });
    return problems;
  }

  const zoneProblems = validateZones(ZONES);
  if (zoneProblems.length && typeof console !== "undefined") console.warn("[Fortress Army] Zone mappa: " + zoneProblems.length + " problemi:\n" + zoneProblems.join("\n"));

  function buildLoopZones(combat) {
    return ZONES.map((z) => ({
      id:z.id, name:z.name, type:null, ring:z.ring, connections:z.connections.slice(), danger:z.danger,
      encounterRange:z.encounterRange, lootTier:z.lootTier, stormState:"sicura", ambientLootClaimed:false,
      initialEncounter:z.initialEncounter || null,
      nodes:z.nodes || null, entryNodeId:z.entryNodeId || null, encounter:z.encounter || null,
      operationalStructure:z.operationalStructure ? Object.assign({}, z.operationalStructure, { maxHp:z.operationalStructure.hp, destroyed:false }) : null,
      shelterOpportunity:z.shelterOpportunity || null, shelterVisit:{serial:0,checked:false,shelters:[]},
      partyBoostOpportunity:z.partyBoostOpportunity || null, partyBoostVisit:{serial:0,checked:false,event:null},
      vehicleOpportunity:z.vehicleOpportunity || null, vehicleVisit:{serial:0,active:false,checked:false,vehicle:null,crew:null},
      encounterSpawned:false, initialEncounterSpawned:false, chests:[], groundLoot:[], smokeActive:false,
      noiseTracker:combat.createNoiseTracker()
    }));
  }

  return { RAW_ZONES, ZONES, OFFICIAL_LAYOUTS, DANGER_STARS, validateZones, zoneProblems, buildLoopZones };
});
