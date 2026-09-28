/* =============================================================================
   Fortress Army — Loop di partita puro (v2, round-based).

   Nessun DOM, nessuna UI, nessuna grafica di mappa. Orchestra round, zone,
   nemici, boss, loot, KO — ma delega SEMPRE la matematica di un attacco a
   engine/fortress-combat.js. Non ridefinisce dadi/gittata/special/Rumore/Aiuta.

   gameState è dati puri (serializzabile). L'unica fonte di verità per la
   posizione è player.zoneId / enemy.zoneId: le presenze per zona si derivano,
   non si salvano due volte.

   RNG sempre iniettabile: nessuna funzione qui dentro chiama Math.random()
   direttamente se non come default esplicito.
   ========================================================================= */
(function (root, factory) {
  const combat = typeof module === "object" && module.exports
    ? require("./fortress-combat.js")
    : root.FORTRESS_COMBAT;
  const loot = typeof module === "object" && module.exports
    ? require("./fortress-loot.js")
    : root.FORTRESS_LOOT;
  const api = factory(combat, loot);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_LOOP = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function (combat, loot) {
  "use strict";

  const RING_ORDER = ["esterno", "interno", "centro"];

  /* =========================================================================
     ARCHETIPI NEMICO — configurazione dati, mai numeri sparsi nella logica.
     ========================================================================= */
  /* shield è provvisorio (da simulare), ma va preso dalla configurazione
     dell'archetipo: mai un numero sparso nella risoluzione del combattimento. */
  const DEFAULT_ENEMY_ARCHETYPES = {
    normale: {
      hp: 8, shield: 0, movement: "static",
      attackProfile: { baseDice: 1, power: 1, range: "medio", special: { type: "none" } }
    },
    aggressivo: {
      hp: 10, shield: 0, movement: "chase",
      attackProfile: { baseDice: 2, power: 1, range: "vicino", special: { type: "none" } }
    },
    resistente: {
      hp: 16, shield: 4, movement: "static",
      attackProfile: { baseDice: 1, power: 2, range: "medio", special: { type: "ignoreShield", n: 1 } }
    },
    distanza: {
      hp: 8, shield: 2, movement: "static",
      attackProfile: { baseDice: 1, power: 2, range: "lontano", special: { type: "critOnSix" } }
    },
    elite: {
      hp: 56, shield: 6, movement: "static",
      attackProfile: { baseDice: 2, power: 2, range: "medio", special: { type: "areaDamage" } }
    }
  };

  const ENEMY_IDENTITIES = {
    normale: ["Ruggine", "Chiodo", "Morsa", "Grigio", "Bullone", "Randa"],
    aggressivo: ["Mastino", "Furia", "Zanna", "Spaccaossa", "Razzo", "Iena"],
    resistente: ["Bunker", "Corazza", "Muro", "Titanio", "Bastione", "Blocco"],
    distanza: ["Occhio Rosso", "Falco", "Mirino", "Corvo", "Lince", "Vetro"],
    elite: ["Cerbero", "Colosso", "Re Nero", "Leviatano", "Titano", "Nemesi"]
  };

  /* =========================================================================
     MAPPA DI DEFAULT — 4 esterne + 4 interne + 1 centro, nessuna griglia.
     encounterRange è un dato esplicito della zona (default dal type in fase
     di creazione, ma salvato — mai ricalcolato a runtime dal type).
     ========================================================================= */
  const TYPE_DEFAULT_RANGE = { citta: "vicino", bosco: "lontano", deposito: "medio" };

  function makeZone({ id, name, type, ring, connections, danger, encounterRange, initialEncounter }) {
    return {
      id, name, type, ring,
      connections: connections.slice(),
      danger,
      encounterRange: encounterRange || TYPE_DEFAULT_RANGE[type] || "medio",
      stormState: "sicura",
      ambientLootClaimed: false,
      // initialEncounter: composizione dati puri (mai deciso qui) dell'incontro
      // iniziale della zona, es. [{ archetype: "normale" }]. null/assente =
      // nessun incontro. initialEncounterSpawned è il flag runtime "già
      // generato" (vedi ensureInitialEncounter): mai enemies.length, che
      // tornerebbe a 0 dopo la pulizia causando un respawn involontario.
      initialEncounter: initialEncounter || null,
      initialEncounterSpawned: false,
      chests: [],
      groundLoot: [],
      smokeActive: false,
      operationalStructure: null,
      shelterOpportunity: null,
      shelterVisit: { serial: 0, checked: false, shelters: [] },
      partyBoostOpportunity: null,
      partyBoostVisit: { serial: 0, checked: false, event: null },
      vehicleOpportunity: null,
      vehicleVisit: { serial: 0, active: false, checked: false, vehicle: null, crew: null },
      noiseTracker: combat.createNoiseTracker()
    };
  }

  function createDefaultZoneLayout() {
    return [
      makeZone({ id: "e1", name: "Città Nord", type: "citta", ring: "esterno", danger: "medio", connections: ["e2", "e4", "i1"] }),
      makeZone({ id: "e2", name: "Bosco Est", type: "bosco", ring: "esterno", danger: "basso", connections: ["e1", "e3", "i2"] }),
      makeZone({ id: "e3", name: "Deposito Sud", type: "deposito", ring: "esterno", danger: "alto", connections: ["e2", "e4", "i3"] }),
      makeZone({ id: "e4", name: "Collina Ovest", type: "bosco", ring: "esterno", danger: "basso", connections: ["e3", "e1", "i4"] }),
      makeZone({ id: "i1", name: "Rovine Nord", type: "deposito", ring: "interno", danger: "medio", connections: ["e1", "i2", "i4", "centro"] }),
      makeZone({ id: "i2", name: "Zona Industriale Est", type: "citta", ring: "interno", danger: "alto", connections: ["e2", "i1", "i3", "centro"] }),
      makeZone({ id: "i3", name: "Avamposto Sud", type: "deposito", ring: "interno", danger: "medio", connections: ["e3", "i2", "i4", "centro"] }),
      makeZone({ id: "i4", name: "Base Ovest", type: "citta", ring: "interno", danger: "alto", connections: ["e4", "i3", "i1", "centro"] }),
      makeZone({ id: "centro", name: "Cittadella Centrale", type: "citta", ring: "centro", danger: "alto", connections: ["i1", "i2", "i3", "i4"] })
    ];
  }

  /* =========================================================================
     QUERY DERIVATE — mai salvate due volte.
     ========================================================================= */
  const getPlayer = (state, id) => state.players.find((p) => p.id === id);
  const getZone = (state, id) => state.zones.find((z) => z.id === id);
  const getEnemy = (state, id) => state.enemies.find((e) => e.id === id);
  const isPresentPlayer = (p) => Boolean(p && p.present !== false);
  const playersInZone = (state, zoneId) => state.players.filter((p) => isPresentPlayer(p) && p.zoneId === zoneId);
  const activePlayersInZone = (state, zoneId) => playersInZone(state, zoneId).filter((p) => p.status === "active");
  const enemiesInZone = (state, zoneId) => state.enemies.filter((e) => e.zoneId === zoneId && e.hp > 0);
  // Node Graph: filtro fine per interazioni node-local (ATTACCA nelle zone Node Graph).
  // enemiesInZone resta l'unica lettura di Battlefield/Enemy phase, invariata.
  const enemiesAtNode = (state, zoneId, nodeId) => state.enemies.filter((e) => e.zoneId === zoneId && e.nodeId === nodeId && e.hp > 0);
  const activePlayers = (state) => state.players.filter((p) => isPresentPlayer(p) && p.status === "active");

  function pushLog(state, text) {
    state.log.unshift(text);
    if (state.log.length > 60) state.log.length = 60;
  }

  /* =========================================================================
     CREAZIONE PARTITA
     ========================================================================= */
  function createGame({ players, zones, bossConfig }) {
    const zoneList = zones || createDefaultZoneLayout();
    // Quantità di casse fissata UNA VOLTA qui, dal numero INIZIALE di
    // giocatori: mai ricalcolata durante la run (§6). Zone senza lootTier
    // (es. la mappa di default usata dai test) risolvono a "boss" (0 casse):
    // vedi loot.resolveLootTierBucket.
    loot.setupChests(zoneList, players.length);
    zoneList.forEach((zone) => {
      assignChestsToNodeSlots(zone); // no-op sulle zone senza nodes[]
      if (!zone.shelterVisit) zone.shelterVisit = { serial: 0, checked: false, shelters: [] };
      if (!zone.partyBoostVisit) zone.partyBoostVisit = { serial: 0, checked: false, event: null };
      if (!zone.vehicleVisit) zone.vehicleVisit = { serial: 0, active: false, checked: false, vehicle: null, crew: null };
      if (zone.operationalStructure) {
        zone.operationalStructure.maxHp = Number(zone.operationalStructure.maxHp || zone.operationalStructure.hp) || 1;
        zone.operationalStructure.hp = Math.min(zone.operationalStructure.maxHp, Number(zone.operationalStructure.hp) || zone.operationalStructure.maxHp);
        zone.operationalStructure.destroyed = zone.operationalStructure.hp <= 0;
      }
    });
    return {
      phase: "atterraggio",
      round: 0,
      initialPlayerCount: players.length,
      players: players.map((p) => ({
        id: p.id, name: p.name, status: "active", present: p.present !== false,
        zoneId: null,
        nodeId: null, // Node Graph (Zone Magnify): valido solo se zoneId ha zone.nodes; null altrove
        hp: 10, shield: 10, launchKitBonus: Number(p.launchKitBonus) || 0,
        koRoundsRemaining: null, koSinceRound: null,
        movedThisRound: false, actedThisRound: false, offensiveSpentThisRound: false, waitingForPartyThisRound: false,
        hiddenInShelter: false, hiddenNodeId: null,
        contributions: { damage: 0, defenses: 0, supports: 0, rescues: 0 },
        equipment: { primary: null, secondary: null, cura: null, scudo: null, utility: null },
        collectedWeaponIds: [] // run-level: mai la starter, serve solo allo sblocco a vittoria
      })),
      zones: zoneList,
      enemies: [],
      enemyIdentityCounters: {},
      // zoneId viene SEMPRE dalla configurazione mappa/boss (bossConfig.zoneId):
      // l'engine non conosce alcun nome di zona reale. Il default "centro"
      // resta solo per compatibilità con i test che usano ancora
      // createDefaultZoneLayout() senza specificare zoneId esplicitamente.
      boss: bossConfig ? { active: false, hp: 0, maxHp: 0, shield: 0, maxShield: 0, config: bossConfig, phaseIndex: 0, roundsSinceActivation: 0, zoneId: bossConfig.zoneId || "centro", lastTargetId: null, suppressed: false, noiseTracker: combat.createNoiseTracker() } : null,
      pendingAiuto: {}, // playerId aiutato -> true, consumato dal suo prossimo attacco, azzerato a inizio round
      pendingStim: {}, // playerId -> true, consumato dal SUO prossimo attacco (mai azzerato a inizio round: sopravvive fino a quando serve)
      lootRegistry: loot.createLootRegistry(), // { seenWeaponIds, nextInstanceId }: run-level, mai per-zona/per-giocatore
      teamLootCursor: 0, // rotazione deterministica dei drop ottenuti con Attacco di Squadra
      log: [],
      winner: null
    };
  }


  /* =========================================================================
     PRESENZA ROSTER / LATE JOIN
     Il roster vive nella UI/persistenza. Qui il motore gestisce solo la
     presenza nella run corrente. Un giocatore assente non conta nel Party,
     non viene bersagliato e non subisce eventi di zona. Riattivarlo non
     rigenera casse, loot o encounter: viene semplicemente posizionato
     sull'entry sicura della zona corrente indicata dal chiamante.
     ========================================================================= */
  function createRuntimePlayer(spec) {
    const equipment = spec && spec.equipment ? spec.equipment : {};
    return {
      id: spec.id, name: spec.name, status: "active", present: true,
      zoneId: null, nodeId: null, hp: 10, shield: 10, launchKitBonus: Number(spec.launchKitBonus) || 0,
      koRoundsRemaining: null, koSinceRound: null,
      movedThisRound: false, actedThisRound: false, offensiveSpentThisRound: false, waitingForPartyThisRound: false,
      hiddenInShelter: false, hiddenNodeId: null,
      contributions: { damage: 0, defenses: 0, supports: 0, rescues: 0 },
      equipment: { primary: equipment.primary || null, secondary: equipment.secondary || null, cura: equipment.cura || null, scudo: equipment.scudo || null, utility: equipment.utility || null },
      collectedWeaponIds: []
    };
  }

  function setPlayerPresence(state, playerId, present, entryZoneId, newPlayerSpec) {
    let player = getPlayer(state, playerId);
    if (!player) {
      if (!present || !newPlayerSpec) throw new Error("Giocatore roster inesistente");
      player = createRuntimePlayer(newPlayerSpec);
      state.players.push(player);
    }
    if (player.status === "eliminated" && present) throw new Error("Un giocatore eliminato non può rientrare nella stessa run");
    player.present = Boolean(present);
    player.waitingForPartyThisRound = false;
    player.hiddenInShelter = false;
    player.hiddenNodeId = null;
    if (!present) return { player, present: false };

    const zone = getZone(state, entryZoneId || player.zoneId);
    if (!zone) throw new Error("Zona di rientro non valida");
    player.zoneId = zone.id;
    player.nodeId = zone.nodes && zone.entryNodeId ? zone.entryNodeId : null;
    ensureShelterOpportunity(state, zone.id);
    player.movedThisRound = false;
    player.actedThisRound = false;
    player.offensiveSpentThisRound = false;
    return { player, present: true, entryZoneId: zone.id, entryNodeId: player.nodeId };
  }

  /* =========================================================================
     LANCIO / ATTERRAGGIO V1
     Ogni ingresso volontario in una nuova zona può ricevere un D6 fisico.
     1-2 = disastroso (-4 HP), 3-4 = ostile (-2 HP), 5-6 = perfetto.
     Il danno è da impatto e bypassa lo Scudo. launchKitBonus è già parte del
     contratto del player ma parte da 0: i Kit di Lancio verranno aggiunti
     successivamente senza cambiare questa API.
     ========================================================================= */
  function resolveLandingRoll(state, player, rawRoll) {
    const roll = Number(rawRoll);
    if (!Number.isInteger(roll) || roll < 1 || roll > 6) throw new Error("Il tiro di lancio deve essere un D6 da 1 a 6");
    const bonus = Math.max(0, Number(player.launchKitBonus) || 0);
    const effectiveRoll = Math.min(6, roll + bonus);
    const damage = effectiveRoll <= 2 ? 4 : effectiveRoll <= 4 ? 2 : 0;
    const outcome = effectiveRoll <= 2 ? "disastroso" : effectiveRoll <= 4 ? "ostile" : "perfetto";
    if (damage > 0) {
      player.hp = Math.max(0, player.hp - damage);
      if (player.hp <= 0 && player.status === "active") setPlayerKO(state, player);
    }
    pushLog(state, `${player.name}: atterraggio ${outcome} (${roll}${bonus ? `+${bonus}` : ""})${damage ? `, -${damage} HP` : ""}`);
    return { rawRoll: roll, bonus, effectiveRoll, outcome, damage, hpAfter: player.hp };
  }

  function landPlayer(state, playerId, zoneId, rng, landingRoll) {
    const player = getPlayer(state, playerId);
    const zone = getZone(state, zoneId);
    if (!player || !zone) throw new Error("Giocatore o zona inesistente");
    if (zone.ring !== "esterno") throw new Error("Si può atterrare solo in una zona esterna");
    player.zoneId = zoneId;
    enterZone(state, player, zone);
    const landing = landingRoll == null ? null : resolveLandingRoll(state, player, landingRoll);
    const shelters = ensureShelterOpportunity(state, zone.id, rng);
    const vehicleFound = ensureVehicleOpportunity(state, zone.id, rng);
    const lootFound = enterZoneAmbient(state, zone, rng);
    return { player, lootFound, landing, vehicleFound, shelters };
  }

  function allPlayersLanded(state) {
    return state.players.filter(isPresentPlayer).every((p) => p.zoneId !== null);
  }

  function beginExploration(state, rng) {
    if (!allPlayersLanded(state)) throw new Error("Non tutti i giocatori sono atterrati");
    state.phase = "esplorazione";
    startRound(state, rng);
  }

  /* Aggiunge un riferimento minimo (mai il record intero del catalogo) a
     zone.groundLoot, con un instanceId run-level per distinguere due copie
     identiche presenti insieme nella stessa zona (§15). Unico punto che
     scrive su groundLoot: ogni fonte di loot passa sempre da qui. */
  function pushGroundLoot(state, zone, descriptor, nodeId, ownerPlayerId) {
    const entry = Object.assign({ instanceId: loot.nextGroundLootInstanceId(state.lootRegistry) }, descriptor);
    if (nodeId) entry.nodeId = nodeId;
    if (ownerPlayerId) entry.ownerPlayerId = ownerPlayerId;
    zone.groundLoot.push(entry);
    return entry;
  }

  function lootDescriptorLabel(d) {
    return d.kind === "weapon" ? `arma (${d.weaponId})` : `${d.kind} (${d.itemId})`;
  }

  /* Loot ambientale: una sola volta per zona, chiunque arrivi per primo.
     La risoluzione (che cosa esce) vive interamente in engine/fortress-loot.js:
     qui resta solo la regola "una volta per zona". */
  function enterZoneAmbient(state, zone, rng) {
    if (zone.ambientLootClaimed) return null;
    zone.ambientLootClaimed = true;
    const roll = rng || Math.random;
    const found = loot.rollAmbientLoot(zone.danger, roll, state.lootRegistry);
    const entry = pushGroundLoot(state, zone, found);
    pushLog(state, `Loot ambientale in ${zone.name}: ${lootDescriptorLabel(found)}`);
    return entry;
  }

  /* =========================================================================
     RIPARI + TRAPPOLE V1
     - I ripari sono proprietà temporanee della visita e non cambiano la
       topologia del Node Graph.
     - 0–2 nodi eleggibili vengono marcati come riparo alla prima entrata.
     - NASCONDITI consuma l'azione principale; chi è nascosto viene evitato
       dal targeting se esiste almeno un bersaglio esposto. Se sono tutti
       nascosti resta attaccabile con -1 dado.
     - Mina Improvvisata: piazzabile solo in un riparo sgombro; si attiva al
       primo nemico che entra nel nodo e infligge 8 danni, poi sparisce.
     ========================================================================= */
  function ensureShelterOpportunity(state, zoneId, rng) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.nodes || !zone.shelterOpportunity) return [];
    const visit = zone.shelterVisit || (zone.shelterVisit = { serial: 0, checked: false, shelters: [] });
    if (visit.checked) return visit.shelters;
    visit.checked = true;
    const excluded = new Set([zone.entryNodeId, zone.operationalStructure && zone.operationalStructure.nodeId].filter(Boolean));
    const eligible = zone.nodes.filter((n) => !excluded.has(n.id));
    if (!eligible.length) { visit.shelters = []; return visit.shelters; }
    const roll = rng || Math.random;
    const weights = Array.isArray(zone.shelterOpportunity.countWeights) ? zone.shelterOpportunity.countWeights : [0.2, 0.5, 0.3];
    const r = Math.max(0, Math.min(0.999999, Number(roll())));
    let count = r < (weights[0] || 0) ? 0 : r < ((weights[0] || 0) + (weights[1] || 0)) ? 1 : 2;
    count = Math.min(Number(zone.shelterOpportunity.maxPerVisit) || 2, count, eligible.length);
    const pool = eligible.slice();
    const names = zone.shelterOpportunity.names || ["Riparo"];
    const shelters = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.min(pool.length - 1, Math.floor(Math.max(0, Math.min(0.999999, Number(roll()))) * pool.length));
      const node = pool.splice(idx, 1)[0];
      shelters.push({
        id: `${zone.id}-shelter-${visit.serial || 0}-${i + 1}`,
        nodeId: node.id,
        name: names[i % names.length] || "Riparo",
        trap: null
      });
    }
    visit.shelters = shelters;
    if (shelters.length) pushLog(state, `${zone.name}: individuati ${shelters.length} ripari`);
    else pushLog(state, `${zone.name}: nessun riparo utile in questa visita`);
    return shelters;
  }

  function getActiveShelters(state, zoneId) {
    const zone = getZone(state, zoneId);
    return zone && zone.shelterVisit && Array.isArray(zone.shelterVisit.shelters) ? zone.shelterVisit.shelters : [];
  }

  function getShelterAtNode(state, zoneId, nodeId) {
    return getActiveShelters(state, zoneId).find((s) => s.nodeId === nodeId) || null;
  }

  function hideInShelterAction(state, playerId) {
    const player = getPlayer(state, playerId); ensureCanAct(player);
    const shelter = getShelterAtNode(state, player.zoneId, player.nodeId);
    if (!shelter) throw new Error("Qui non c'è un riparo");
    player.hiddenInShelter = true;
    player.hiddenNodeId = player.nodeId;
    player.actedThisRound = true;
    pushLog(state, `${player.name} si nasconde in ${shelter.name}`);
    return { type: "hide", playerId, shelterId: shelter.id, nodeId: shelter.nodeId };
  }

  function placeTrapAction(state, playerId) {
    const player = getPlayer(state, playerId); ensureCanAct(player);
    const item = player.equipment && player.equipment.utility;
    if (!item || item.id !== "mina_improvvisata") throw new Error("Mina Improvvisata non disponibile");
    const shelter = getShelterAtNode(state, player.zoneId, player.nodeId);
    if (!shelter) throw new Error("La trappola va piazzata in un Riparo");
    if (shelter.trap && shelter.trap.armed) throw new Error("Questo riparo ha già una trappola armata");
    if (enemiesAtNode(state, player.zoneId, player.nodeId).length) throw new Error("Prima libera il riparo dai nemici");
    shelter.trap = { type: "mina", name: item.name || "Mina Improvvisata", damage: Number(item.damage) || 8, ownerPlayerId: player.id, armed: true };
    player.equipment.utility = null;
    player.actedThisRound = true;
    pushLog(state, `${player.name} piazza una trappola in ${shelter.name}`);
    return { type: "place-trap", shelterId: shelter.id, nodeId: shelter.nodeId, damage: shelter.trap.damage };
  }

  function triggerShelterTrap(state, zone, enemy) {
    const shelter = getShelterAtNode(state, zone.id, enemy.nodeId);
    if (!shelter || !shelter.trap || !shelter.trap.armed) return null;
    const trap = shelter.trap;
    trap.armed = false;
    const before = enemy.hp;
    enemy.hp = Math.max(0, enemy.hp - (Number(trap.damage) || 8));
    const result = { shelterId: shelter.id, trapName: trap.name, damage: before - enemy.hp, enemyId: enemy.id, enemyName: enemy.name || enemy.archetype, eliminated: enemy.hp <= 0 };
    if (enemy.hp <= 0) result.lootFound = resolveEnemyDeathLoot(state, enemy, null, { ownerPlayerId: trap.ownerPlayerId });
    pushLog(state, `${trap.name} scatta su ${result.enemyName}: ${result.damage} danni${result.eliminated ? " · ELIMINATO" : ""}`);
    shelter.trap = null;
    return result;
  }

  /* =========================================================================
     STRUTTURE OPERATIVE + MEZZI PESANTI V1
     - La struttura è un obiettivo di zona con una sola barra HP e corazza.
     - Il mezzo è temporaneo per VISITA: quando la zona torna senza presenti,
       la visita si chiude; al prossimo ingresso la disponibilità viene ritirata.
     - Equipaggio minimo/esatto V1: 1 pilota + 2 tiratori, tutti sul nodo safe.
     ========================================================================= */
  function getStructurePhaseOrder(state) {
    return state.zones.filter((z) => {
      const st = z.operationalStructure;
      return st && !st.destroyed && st.hp > 0 && activePlayersInZone(state, z.id).length > 0;
    }).map((z) => z.id).sort();
  }

  function prepareStructureStep(state, zoneId) {
    const zone = getZone(state, zoneId); const st = getOperationalStructure(state, zoneId);
    if (!zone || !st) return { type:"idle", zoneId };
    const visit = zone.vehicleVisit;
    if (visit && visit.active && visit.vehicle && visit.vehicle.integrity > 0 && visit.crew) {
      return { type:"attack-vehicle", zoneId, structureId:st.id, structureName:st.name, diceCount:Number(st.attackDice)||2, power:Number(st.attackPower)||2, targetName:visit.vehicle.name };
    }
    const allCandidates = activePlayersInZone(state, zoneId);
    const exposed = allCandidates.filter((p) => !p.hiddenInShelter);
    const candidates = (exposed.length ? exposed : allCandidates).slice().sort((a,b)=>(a.hp-b.hp)||(a.id<b.id?-1:1));
    if (!candidates.length) return { type:"idle", zoneId };
    const target=candidates[0];
    return { type:"attack-player", zoneId, structureId:st.id, structureName:st.name, diceCount:Number(st.attackDice)||2, power:Number(st.attackPower)||2, targetId:target.id, targetName:target.name };
  }

  function resolveStructureStepFromRolls(state, prepared, rolls) {
    if (!prepared || !/^attack-/.test(prepared.type)) return prepared;
    if (!Array.isArray(rolls) || rolls.length !== prepared.diceCount || rolls.some((r)=>!Number.isInteger(Number(r))||Number(r)<1||Number(r)>6)) throw new Error("Dadi struttura non validi");
    const total=rolls.reduce((a,b)=>a+Number(b),0)+(Number(prepared.power)||0);
    const zone=getZone(state,prepared.zoneId);
    if (prepared.type === "attack-vehicle") {
      const vehicle=zone && zone.vehicleVisit && zone.vehicleVisit.vehicle;
      if (!vehicle) return {type:"idle",zoneId:prepared.zoneId};
      const before=vehicle.integrity; vehicle.integrity=Math.max(0,vehicle.integrity-total);
      if (vehicle.integrity<=0) { zone.vehicleVisit.active=false; zone.vehicleVisit.crew=null; }
      pushLog(state, `${prepared.structureName}: torri colpiscono ${prepared.targetName} per ${total}`);
      return {type:"structure-attack",targetKind:"vehicle",zoneId:prepared.zoneId,structureName:prepared.structureName,targetName:prepared.targetName,rolls:rolls.map(Number),power:prepared.power,total,integrityBefore:before,integrityAfter:vehicle.integrity,maxIntegrity:vehicle.maxIntegrity,destroyed:vehicle.integrity<=0};
    }
    const target=getPlayer(state,prepared.targetId); if(!target||target.status!=="active") return {type:"idle",zoneId:prepared.zoneId};
    const hpBefore=target.hp, shieldBefore=target.shield; applyDamageToPlayer(state,target,{total,ignoreShieldN:0});
    pushLog(state, `${prepared.structureName}: torri colpiscono ${target.name} per ${total}`);
    return {type:"structure-attack",targetKind:"player",zoneId:prepared.zoneId,structureName:prepared.structureName,targetId:target.id,targetName:target.name,rolls:rolls.map(Number),power:prepared.power,total,hpBefore,hpAfter:target.hp,shieldBefore,shieldAfter:target.shield,statusAfter:target.status};
  }


  /* =========================================================================
     PARTY BOOST V1 — evento di visita visibile sul Node Graph.
     Una sola opportunità per visita. Il bonus si applica ESCLUSIVAMENTE agli
     Attacchi di Squadra e viene consumato una carica per attacco risolto.
     ========================================================================= */
  function ensurePartyBoostOpportunity(state, zoneId, rng) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.nodes || !zone.partyBoostOpportunity) return null;
    const visit = zone.partyBoostVisit || (zone.partyBoostVisit = { serial: 0, checked: false, event: null });
    if (visit.checked) return visit.event;
    visit.checked = true;
    const roll = typeof rng === "function" ? rng : Math.random;
    const chance = Number(zone.partyBoostOpportunity.chance);
    if (roll() >= (Number.isFinite(chance) ? chance : 0.6)) {
      visit.event = null;
      pushLog(state, `${zone.name}: nessun Party Boost in questa visita`);
      return null;
    }
    const excluded = new Set([zone.entryNodeId, zone.operationalStructure && zone.operationalStructure.nodeId].filter(Boolean));
    const eligible = zone.nodes.filter((n) => !excluded.has(n.id));
    if (!eligible.length) { visit.event = null; return null; }
    const idx = Math.min(eligible.length - 1, Math.floor(roll() * eligible.length));
    const node = eligible[Math.max(0, idx)];
    visit.event = {
      id: `${zone.id}-party-boost-${visit.serial || 0}`,
      name: zone.partyBoostOpportunity.name || "Party Boost",
      nodeId: node.id,
      consumed: false,
      charges: 0,
      successes: 0,
      tier: null
    };
    pushLog(state, `${zone.name}: individuato evento Party Boost`);
    return visit.event;
  }

  function getPartyBoostEvent(state, zoneId) {
    const zone = getZone(state, zoneId);
    return zone && zone.partyBoostVisit ? zone.partyBoostVisit.event : null;
  }

  function partyBoostParticipants(state, playerId) {
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") return [];
    const zone = getZone(state, player.zoneId);
    if (!zone) return [];
    return activePlayersInZone(state, zone.id).filter((p) => !zone.nodes || p.nodeId === player.nodeId);
  }

  function resolvePartyBoost(state, playerId, declarations) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const zone = getZone(state, player.zoneId);
    const event = getPartyBoostEvent(state, zone.id);
    if (!event || event.consumed) throw new Error("Party Boost non disponibile");
    if (zone.nodes && player.nodeId !== event.nodeId) throw new Error("Devi raggiungere il nodo Party Boost");
    const participants = partyBoostParticipants(state, playerId);
    if (participants.length < 2) throw new Error("Servono almeno 2 giocatori sul nodo Party Boost");
    const rows = Array.isArray(declarations) ? declarations : [];
    if (rows.length !== participants.length) throw new Error("Devono partecipare tutti i membri del Party presenti sul nodo");
    const byId = new Map(rows.map((r) => [r.playerId, r]));
    const results = participants.map((p) => {
      const r = byId.get(p.id);
      const choice = Number(r && r.choice), roll = Number(r && r.roll);
      if (!Number.isInteger(choice) || choice < 1 || choice > 6 || !Number.isInteger(roll) || roll < 1 || roll > 6) throw new Error("Scelta o dado Party Boost non valido");
      return { playerId: p.id, playerName: p.name, choice, roll, success: choice === roll };
    });
    const successes = results.filter((r) => r.success).length;
    event.consumed = true;
    event.successes = successes;
    event.charges = successes >= 2 ? 2 : (successes >= 1 ? 1 : 0);
    event.tier = successes >= 2 ? "big" : (successes >= 1 ? "party" : "none");
    player.actedThisRound = true;
    const label = event.tier === "big" ? "BIG BOOST" : (event.tier === "party" ? "PARTY BOOST" : "BOOST FALLITO");
    pushLog(state, `${label}: ${successes} successi · ${event.charges} cariche`);
    return { type: "party-boost", zoneId: zone.id, eventId: event.id, tier: event.tier, successes, charges: event.charges, results };
  }

  function getPartyBoostCharges(state, zoneId) {
    const event = getPartyBoostEvent(state, zoneId);
    return event && event.consumed ? Number(event.charges) || 0 : 0;
  }

  function getOperationalStructure(state, zoneId) {
    const zone = getZone(state, zoneId);
    return zone && zone.operationalStructure && !zone.operationalStructure.destroyed ? zone.operationalStructure : null;
  }

  function closeVehicleVisitIfEmpty(state, zoneId) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.vehicleVisit) return;
    if (playersInZone(state, zoneId).length === 0) {
      if (zone.shelterVisit) {
        zone.shelterVisit.checked = false;
        zone.shelterVisit.shelters = [];
        zone.shelterVisit.serial = (zone.shelterVisit.serial || 0) + 1;
      }
      if (zone.partyBoostVisit) {
        zone.partyBoostVisit.checked = false;
        zone.partyBoostVisit.event = null;
        zone.partyBoostVisit.serial = (zone.partyBoostVisit.serial || 0) + 1;
      }
      zone.vehicleVisit.active = false;
      zone.vehicleVisit.checked = false;
      zone.vehicleVisit.vehicle = null;
      zone.vehicleVisit.crew = null;
      zone.vehicleVisit.serial = (zone.vehicleVisit.serial || 0) + 1;
    }
  }

  function ensureVehicleOpportunity(state, zoneId, rng) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.vehicleOpportunity) return null;
    const visit = zone.vehicleVisit || (zone.vehicleVisit = { serial: 0, active: false, checked: false, vehicle: null, crew: null });
    const eligible = activePlayersInZone(state, zoneId).length >= 3;
    if (!eligible || visit.checked) return visit.vehicle;
    visit.checked = true;
    const roll = (rng || Math.random)();
    const chance = Math.max(0, Math.min(1, Number(zone.vehicleOpportunity.chance) || 0));
    if (roll >= chance) { pushLog(state, `${zone.name}: nessun mezzo pesante disponibile in questa visita`); return null; }
    const pool = zone.vehicleOpportunity.pool || [];
    if (!pool.length) return null;
    const idx = Math.min(pool.length - 1, Math.floor((rng || Math.random)() * pool.length));
    const spec = pool[idx];
    visit.vehicle = { id: spec.id, name: spec.name, integrity: spec.integrity, maxIntegrity: spec.integrity, demolitionBonus: spec.demolitionBonus || 0 };
    visit.active = true;
    visit.crew = null;
    pushLog(state, `${zone.name}: trovato ${spec.name} — servono 3 giocatori`);
    return visit.vehicle;
  }

  function availableVehicleCrew(state, zoneId) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.vehicleVisit || !zone.vehicleVisit.active || !zone.vehicleVisit.vehicle) return [];
    return activePlayersInZone(state, zoneId).filter((p) => !zone.nodes || p.nodeId === zone.entryNodeId);
  }

  function boardVehicleCrew(state, zoneId, pilotId, gunnerIds) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.vehicleVisit || !zone.vehicleVisit.vehicle) throw new Error("Nessun mezzo disponibile");
    const ids = [pilotId].concat(gunnerIds || []);
    if (ids.length !== 3 || new Set(ids).size !== 3) throw new Error("Il mezzo richiede esattamente 1 pilota e 2 tiratori");
    const eligible = new Set(availableVehicleCrew(state, zoneId).map((p) => p.id));
    ids.forEach((id) => { if (!eligible.has(id)) throw new Error("Tutto l'equipaggio deve essere presente nella Zona Sicura"); });
    zone.vehicleVisit.crew = { pilotId, gunnerIds: gunnerIds.slice(0,2) };
    pushLog(state, `${zone.vehicleVisit.vehicle.name}: equipaggio pronto (${ids.join(", ")})`);
    return zone.vehicleVisit.crew;
  }

  function resolveVehicleSalvo(state, zoneId, rolls, targetSpecs, lootRng) {
    const zone = getZone(state, zoneId);
    const visit = zone && zone.vehicleVisit;
    if (!visit || !visit.vehicle || !visit.crew) throw new Error("Mezzo/equipaggio non pronto");
    if (!Array.isArray(rolls) || rolls.length !== 3 || rolls.some((r) => !Number.isInteger(Number(r)) || Number(r) < 1 || Number(r) > 6)) throw new Error("Servono 3 D6: pilota + 2 tiratori");
    let specs = Array.isArray(targetSpecs) ? targetSpecs.slice(0, 2) : [];
    if (!specs.length) {
      const legacyStructure = getOperationalStructure(state, zoneId);
      if (legacyStructure) specs = [{ kind:"structure", id:legacyStructure.id }, { kind:"structure", id:legacyStructure.id }];
    }
    if (specs.length !== 2 || specs.some((t) => !t || !["structure", "enemy"].includes(t.kind) || !t.id)) throw new Error("Ogni tiratore deve scegliere un bersaglio");

    const [pilotRaw, g1Raw, g2Raw] = rolls.map(Number);
    let integrityDamage = 0, aimBonus = 0;
    if (pilotRaw === 1) integrityDamage = 8;
    else if (pilotRaw === 2) integrityDamage = 5;
    else if (pilotRaw === 5 || pilotRaw === 6) aimBonus = 1;
    visit.vehicle.integrity = Math.max(0, visit.vehicle.integrity - integrityDamage);

    const gunDamage = (raw) => {
      const r = Math.min(6, raw + aimBonus);
      if (r <= 2) return 0;
      if (r <= 4) return 6;
      if (r === 5) return 8;
      return 10;
    };
    const gunDamages = [gunDamage(g1Raw), gunDamage(g2Raw)];
    const groups = new Map();
    specs.forEach((spec, index) => {
      const key = `${spec.kind}:${spec.id}`;
      if (!groups.has(key)) groups.set(key, { kind: spec.kind, id: spec.id, gunnerIndexes: [], baseDamage: 0 });
      const g = groups.get(key);
      g.gunnerIndexes.push(index);
      g.baseDamage += gunDamages[index];
    });

    const crewIds = [visit.crew.pilotId].concat(visit.crew.gunnerIds);
    const results = [];
    const lootFound = [];
    groups.forEach((g) => {
      if (g.kind === "structure") {
        const structure = getOperationalStructure(state, zoneId);
        if (!structure || structure.id !== g.id) throw new Error("Struttura bersaglio non valida");
        const demolition = g.baseDamage > 0 ? (visit.vehicle.demolitionBonus || 0) : 0;
        const armor = Number(structure.armor) || 0;
        const dealt = Math.max(0, g.baseDamage + demolition - armor);
        structure.hp = Math.max(0, structure.hp - dealt);
        structure.destroyed = structure.hp <= 0;
        results.push({ kind:"structure", id:structure.id, name:structure.name, gunnerIndexes:g.gunnerIndexes, baseDamage:g.baseDamage, demolitionBonus:demolition, armor, damage:dealt, hp:structure.hp, maxHp:structure.maxHp, destroyed:structure.destroyed });
        if (structure.destroyed) pushLog(state, `${structure.name} DISTRUTTO dal ${visit.vehicle.name}`);
        else pushLog(state, `${visit.vehicle.name}: ${dealt} danni demolizione a ${structure.name}`);
      } else {
        const enemy = getEnemy(state, g.id);
        if (!enemy || enemy.zoneId !== zoneId || enemy.hp <= 0) throw new Error("Nemico bersaglio non valido");
        const hpBefore = enemy.hp, shieldBefore = enemy.shield;
        applyDamageToEnemy(enemy, { total:g.baseDamage, ignoreShieldN:0 });
        const eliminated = enemy.hp <= 0;
        if (eliminated) {
          const drop = resolveEnemyDeathLoot(state, enemy, lootRng, { teamPlayerIds: crewIds });
          if (drop) lootFound.push(drop);
        }
        results.push({ kind:"enemy", id:enemy.id, name:enemy.name || enemy.archetype || "Nemico", archetype:enemy.archetype, gunnerIndexes:g.gunnerIndexes, baseDamage:g.baseDamage, damage:g.baseDamage, hpBefore, hp:enemy.hp, maxHp:enemy.maxHp, shieldBefore, shield:enemy.shield, maxShield:enemy.maxShield, eliminated });
        pushLog(state, `${visit.vehicle.name}: ${g.baseDamage} danni a ${enemy.name || enemy.archetype || "nemico"}`);
      }
    });

    crewIds.forEach((id) => { const p = getPlayer(state,id); if (p) { p.offensiveSpentThisRound = true; p.actedThisRound = true; } });
    if (visit.vehicle.integrity <= 0) { visit.active = false; visit.crew = null; }
    const structureResult = results.find((r)=>r.kind==="structure") || null;
    const totalDamage = results.reduce((sum,r)=>sum+(Number(r.damage)||0),0);
    return { type:"vehicle-salvo", pilotRoll:pilotRaw, gunnerRolls:[g1Raw,g2Raw], gunDamages, aimBonus, integrityDamage, vehicleIntegrity:visit.vehicle.integrity, vehicleMaxIntegrity:visit.vehicle.maxIntegrity, targets:specs, targetResults:results, lootFound,
      damage: totalDamage,
      baseDamage: gunDamages.reduce((a,b)=>a+b,0),
      demolitionBonus: structureResult ? structureResult.demolitionBonus : 0,
      armor: structureResult ? structureResult.armor : 0,
      structureHp: structureResult ? structureResult.hp : null,
      structureDestroyed: structureResult ? structureResult.destroyed : false
    };
  }

  function damageStructureWithWeapon(state, playerId, weapon, rolls) {
    const player = getPlayer(state, playerId); ensureCanAttack(player);
    const zone = getZone(state, player.zoneId); const structure = getOperationalStructure(state, player.zoneId);
    if (!structure) throw new Error("Nessuna struttura operativa");
    if (zone.nodes && player.nodeId !== structure.nodeId) throw new Error("Per demolire a piedi devi raggiungere il nodo della struttura");
    if (!Array.isArray(rolls) || !rolls.length || rolls.some((r)=>!Number.isInteger(Number(r))||r<1||r>6)) throw new Error("Dadi demolizione non validi");
    const explosive = /rocket|grenade|launcher|bazooka|cannon|missile|barrel|bomb|explos/i.test(String(weapon.id||"")+" "+String(weapon.name||""));
    const specialBonus = Number(weapon.demolitionBonus) || (explosive ? 5 : 0);
    const raw = rolls.reduce((a,b)=>a+Number(b),0) + (Number(weapon.power)||0) + specialBonus;
    const damage = Math.max(0, raw - (Number(structure.armor)||0));
    structure.hp=Math.max(0,structure.hp-damage); structure.destroyed=structure.hp<=0;
    player.offensiveSpentThisRound=true; player.actedThisRound=true; player.contributions.damage += damage;
    return {type:"structure-attack", damage, demolitionBonus:specialBonus, structureHp:structure.hp, structureDestroyed:structure.destroyed};
  }

  /* =========================================================================
     MOVIMENTO
     ========================================================================= */
  function moveAction(state, playerId, targetZoneId, rng, landingRoll) {
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    if (player.movedThisRound) throw new Error("Movimento già usato in questo round");
    const currentZone = getZone(state, player.zoneId);
    const previousZoneId = currentZone.id;
    if (!currentZone.connections.includes(targetZoneId)) throw new Error("Zona non collegata");
    const target = getZone(state, targetZoneId);
    if (target.stormState === "storm" || target.stormState === "eliminated") {
      throw new Error("Non si può entrare volontariamente in una zona in Tempesta o eliminata");
    }
    player.hiddenInShelter = false;
    player.hiddenNodeId = null;
    player.zoneId = targetZoneId;
    player.movedThisRound = true;
    // Stessa funzione condivisa con landPlayer: sia "l'ingresso zona" (Node
    // Graph o incontro iniziale legacy) sia "un solo loot ambientale per
    // zona" vivono in un'unica implementazione, mai duplicate tra atterraggio
    // e movimento World.
    enterZone(state, player, target);
    const landing = landingRoll == null ? null : resolveLandingRoll(state, player, landingRoll);
    closeVehicleVisitIfEmpty(state, previousZoneId);
    const shelters = ensureShelterOpportunity(state, target.id, rng);
    const vehicleFound = ensureVehicleOpportunity(state, target.id, rng);
    const lootFound = enterZoneAmbient(state, target, rng);
    return { player, lootFound, landing, vehicleFound, shelters };
  }

  /* =========================================================================
     INGRESSO ZONA — unico punto usato da landPlayer/moveAction. Se la zona ha
     un Node Graph (zone.nodes, per tutte le zone esplorative) posiziona il player
     sull'entry node e processa i SUOI contenuti (ensureNodeEncounter): MAI
     ensureInitialEncounter in questo caso, per evitare un doppio spawn
     zona+nodo. Zone senza zone.nodes restano bit-per-bit come nel commit
     precedente: nodeId torna a null, ensureInitialEncounter zona-level. */
  function enterZone(state, player, zone) {
    if (zone.nodes && zone.entryNodeId) {
      player.nodeId = zone.entryNodeId;
      ensureNodeEncounter(state, zone.id, zone.entryNodeId);
    } else {
      player.nodeId = null;
      ensureInitialEncounter(state, zone.id);
    }
  }

  /* =========================================================================
     AZIONI PRINCIPALI
     ========================================================================= */
  function ensureCanAct(player) {
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    if (player.actedThisRound) throw new Error("Azione principale già usata in questo round");
  }

  function ensureCanAttack(player) {
    ensureCanAct(player);
    if (player.offensiveSpentThisRound) throw new Error("Azione offensiva già usata in questo round");
    player.hiddenInShelter = false;
    player.hiddenNodeId = null;
  }

  function aiutoAction(state, helperId, targetId) {
    const helper = getPlayer(state, helperId);
    ensureCanAct(helper);
    const target = getPlayer(state, targetId);
    if (!target || target.zoneId !== helper.zoneId) throw new Error("Supporto richiede la stessa zona");
    const zone = getZone(state, helper.zoneId);
    if (zone.nodes) {
      if (target.nodeId !== helper.nodeId) throw new Error("Per supportare un compagno dovete essere sullo stesso nodo");
      if (zone.entryNodeId && helper.nodeId === zone.entryNodeId) throw new Error("Il nodo di approdo è neutro: qui non serve supporto al combattimento");
      const enemiesHere = enemiesAtNode(state, zone.id, helper.nodeId);
      const bossHere = state.boss && state.boss.active && state.boss.hp > 0 && state.boss.zoneId === zone.id;
      if (!enemiesHere.length && !bossHere) throw new Error("Nessun combattimento in corso su questo nodo");
    }
    state.pendingAiuto[targetId] = true;
    helper.actedThisRound = true;
    helper.contributions.supports += 1;
  }

  function attendiSquadraAction(state, playerId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const zone = getZone(state, player.zoneId);
    if (!zone || !zone.nodes || player.nodeId == null) throw new Error("ATTENDI LA SQUADRA richiede un nodo di combattimento");
    if (zone.entryNodeId && player.nodeId === zone.entryNodeId) throw new Error("Sei nella zona sicura: qui non serve attendere la squadra");
    const enemiesHere = enemiesAtNode(state, zone.id, player.nodeId);
    const bossHere = state.boss && state.boss.active && state.boss.hp > 0 && state.boss.zoneId === zone.id;
    if (!enemiesHere.length && !bossHere) throw new Error("Nessun combattimento su questo nodo");
    player.actedThisRound = true;
    player.waitingForPartyThisRound = true;
    pushLog(state, `${player.name} attende la squadra sul nodo di combattimento`);
    return { type: "wait-for-party", playerId, nodeId: player.nodeId, offensiveSpentThisRound: player.offensiveSpentThisRound };
  }

  /* Distribuisce i secondari (areaDamage/chainStrike) su altri bersagli
     validi nella stessa zona, in ordine deterministico per id. */
  function applySecondaryHits(secondaryHits, others, applyFn) {
    const ordered = others.slice().sort((a, b) => (a.id < b.id ? -1 : 1));
    secondaryHits.forEach((amount, i) => { if (ordered[i]) applyFn(ordered[i], amount); });
  }

  /* Anteprima pura (nessun dado tirato, nessuna mutazione, richiamabile quante
     volte serve per mostrare/aggiornare uno schermo): riusa ESATTAMENTE
     combat.computeDiceCount/rangeModifier con gli stessi input che l'attacco
     reale userebbe (aiuto pendente, marcatore suppress, gittata di zona).
     Serve perché quegli input vivono solo qui nel loop: il combat engine da
     solo non li conosce. Nessuna formula duplicata, solo dati raccolti. */
  function previewPlayerAttack(state, playerId, enemyId, weapon) {
    const player = getPlayer(state, playerId);
    const enemy = getEnemy(state, enemyId);
    if (!player || !enemy) throw new Error("Giocatore o nemico inesistente");
    const zone = getZone(state, player.zoneId);
    const encounterRange = resolveEncounterRange(zone, player.nodeId, enemy.nodeId);
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    const aiuto = Boolean(state.pendingAiuto[playerId]);
    const effectBonus = (enemy.suppressed ? 1 : 0) + (state.pendingStim[playerId] ? 1 : 0);

    const diceCount = combat.computeDiceCount({
      baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange,
      isRangeless, aiuto, effectBonus
    });
    const rangeMod = combat.rangeModifier(weapon.range, encounterRange, isRangeless);

    return {
      diceCount, rangeModifier: rangeMod,
      weaponRange: weapon.range, encounterRange,
      aiuto, effectBonus,
      enemyHp: enemy.hp, enemyMaxHp: enemy.maxHp, enemyShield: enemy.shield, enemyMaxShield: enemy.maxShield
    };
  }

  /* Stessa anteprima pura, ma contro il boss: nessuna mutazione, riusa
     computeDiceCount/rangeModifier, richiamabile quante volte serve. */
  function previewBossAttack(state, playerId, weapon) {
    const player = getPlayer(state, playerId);
    const boss = state.boss;
    if (!player || !boss || !boss.active) throw new Error("Giocatore o boss inesistente/non attivo");
    const zone = getZone(state, player.zoneId);
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    const aiuto = Boolean(state.pendingAiuto[playerId]);
    const effectBonus = (boss.suppressed ? 1 : 0) + (state.pendingStim[playerId] ? 1 : 0);

    const diceCount = combat.computeDiceCount({
      baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange: zone.encounterRange,
      isRangeless, aiuto, effectBonus
    });
    const rangeMod = combat.rangeModifier(weapon.range, zone.encounterRange, isRangeless);

    return {
      diceCount, rangeModifier: rangeMod,
      weaponRange: weapon.range, encounterRange: zone.encounterRange,
      aiuto, effectBonus,
      bossHp: boss.hp, bossMaxHp: boss.maxHp, bossShield: boss.shield, bossMaxShield: boss.maxShield
    };
  }

  /* =========================================================================
     ATTACCO GIOCATORE → NEMICO — "dichiara" (una tantum, blocca aiuto/
     suppress/POTENZA-modificatori per tutta la durata dell'attacco, anche
     attraverso un ritiro fisico) + "risolvi da dadi" (mai calcoli propri:
     tutto passa da combat.resolveAttackFromRolls) + wrapper RNG per
     test/simulazioni.
     ========================================================================= */

  /* Mutazione minima e una tantum: valida che si possa attaccare, consuma il
     marcatore suppress (se presente, esattamente come faceva prima l'attacco
     unico), e congela aiuto/effectBonus/targetBelowHalfHp/diceCount per tutta
     la durata dell'attacco — anche se servirà un ritiro fisico più avanti. */
  function declarePlayerAttack(state, playerId, enemyId, weapon) {
    const player = getPlayer(state, playerId);
    ensureCanAttack(player);
    const enemy = getEnemy(state, enemyId);
    if (!enemy || enemy.zoneId !== player.zoneId || enemy.hp <= 0) throw new Error("Bersaglio non valido");
    const zone = getZone(state, player.zoneId);
    // L'entry del Node Graph è sempre neutra: atterrare mostra il teatro di
    // scontro ma non consente di ingaggiare. Il giocatore deve lasciare
    // volontariamente l'entry e raggiungere un nodo di combattimento.
    if (zone.nodes && zone.entryNodeId && player.nodeId === zone.entryNodeId) {
      throw new Error("L'area di approdo è neutra: spostati su un nodo dei nemici per attaccare");
    }
    // Node Graph: il combattimento parte solo quando giocatore e nemico
    // occupano lo stesso nodo. I nemici restano visibili in anticipo sulla
    // mappa, ma non diventano attaccabili finché non vengono raggiunti.
    if (zone.nodes && player.nodeId != null && enemy.nodeId != null
      && player.nodeId !== enemy.nodeId) {
      throw new Error("Devi raggiungere il nodo del nemico prima di attaccare");
    }
    const encounterRange = resolveEncounterRange(zone, player.nodeId, enemy.nodeId);
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    const aiuto = Boolean(state.pendingAiuto[playerId]);
    const effectBonus = (enemy.suppressed ? 1 : 0) + (state.pendingStim[playerId] ? 1 : 0);
    enemy.suppressed = false; // consumato ORA, alla dichiarazione, prima di qualunque dado
    const targetBelowHalfHp = enemy.hp < enemy.maxHp / 2;
    const diceCount = combat.computeDiceCount({
      baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange,
      isRangeless, aiuto, effectBonus
    });
    return { kind: "player-vs-enemy", playerId, enemyId, weapon, encounterRange, aiuto, effectBonus, targetBelowHalfHp, diceCount };
  }

  /* Loot alla morte di UN nemico, idempotente (§7 punto 7): un nemico produce
     loot una volta sola quando passa realmente da vivo a morto, marcato con
     enemy.lootResolved. Copre sia il bersaglio primario sia i secondari di
     areaDamage/chainStrike (entrambi passano da qui). Il Boss non è mai
     coinvolto (nessun "enemy" del catalogo nemici, nessun loot da run: §7). */
  function resolveEnemyDeathLoot(state, enemy, lootRng, ownership) {
    if (enemy.hp > 0 || enemy.lootResolved) return null;
    enemy.lootResolved = true;
    const zone = getZone(state, enemy.zoneId);
    const roll = lootRng || Math.random;
    const drop = enemy.archetype === "elite"
      ? loot.rollEliteLoot(zone.danger, roll, state.lootRegistry)
      : { support: loot.rollNormalEnemyLoot(zone.danger, roll) };
    const descriptors = [drop.weapon, drop.support].filter(Boolean);
    const entries = [];
    const teamOwners = ownership && Array.isArray(ownership.teamPlayerIds) ? ownership.teamPlayerIds.filter(Boolean) : null;
    descriptors.forEach((descriptor) => {
      let ownerPlayerId = ownership && ownership.ownerPlayerId || null;
      if (teamOwners && teamOwners.length) {
        const cursor = Number.isInteger(state.teamLootCursor) ? state.teamLootCursor : 0;
        ownerPlayerId = teamOwners[cursor % teamOwners.length];
        state.teamLootCursor = cursor + 1;
      }
      entries.push(pushGroundLoot(state, zone, descriptor, enemy.nodeId || null, ownerPlayerId));
    });
    return entries.length ? { enemyId: enemy.id, zoneId: zone.id, items: entries } : null;
  }

  /* Tail comune a RNG e dadi fisici: applica il risultato già calcolato dal
     combat engine, mai un ricalcolo. lootRng è INDIPENDENTE dal rng dei dadi
     di combattimento (che nel gioco reale sono fisici, non generati qui): di
     default Math.random, mai la stessa coda usata per validare i tiri. */
  function finishPlayerAttackOnEnemy(state, player, enemy, weapon, aiuto, outcome, lootRng) {
    applyDamageToEnemy(enemy, outcome);
    const eliminated = enemy.hp <= 0;
    const lootFound = [];
    const primaryDrop = resolveEnemyDeathLoot(state, enemy, lootRng, { ownerPlayerId: player.id });
    if (primaryDrop) lootFound.push(primaryDrop);

    if (outcome.secondaryHits && outcome.secondaryHits.length) {
      const others = enemiesInZone(state, enemy.zoneId).filter((e) => e.id !== enemy.id);
      applySecondaryHits(outcome.secondaryHits, others, (target, amount) => {
        applyDamageToEnemy(target, { total: amount, ignoreShieldN: 0 });
        const drop = resolveEnemyDeathLoot(state, target, lootRng, { ownerPlayerId: player.id });
        if (drop) lootFound.push(drop);
      });
    }
    if (outcome.appliesSuppressMarker) enemy.suppressed = true; // nuovo marcatore per il prossimo alleato

    const noiseResult = weapon.special && weapon.special.type === "silentKill"
      ? Object.assign({}, outcome, { resetsNoise: eliminated, disablesReinforcements: eliminated })
      : outcome;
    const zone = getZone(state, player.zoneId);
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, noiseResult);

    if (aiuto) delete state.pendingAiuto[player.id];
    delete state.pendingStim[player.id];
    player.actedThisRound = true;
    player.offensiveSpentThisRound = true;
    player.waitingForPartyThisRound = false;
    player.contributions.damage += Math.max(0, outcome.total || 0);
    pushLog(state, `${player.name} attacca ${enemy.name || enemy.archetype || "il nemico"}: ${outcome.total} danni${eliminated ? " (eliminato)" : ""}`);
    return { result: outcome, eliminated, lootFound };
  }

  /* Risolve da risultati di dadi FISICI. `declared` è ESATTAMENTE l'oggetto
     restituito da declarePlayerAttack: non viene mai ricalcolato qui, quindi
     resta identico anche a cavallo di un ritiro fisico (rerollOnes). */
  function resolvePlayerAttackFromRolls(state, declared, rolls, rerollValues, lootRng) {
    const player = getPlayer(state, declared.playerId);
    const enemy = getEnemy(state, declared.enemyId);
    if (!player || !enemy) throw new Error("Giocatore o nemico non più validi rispetto alla dichiarazione dell'attacco");

    const outcome = combat.resolveAttackFromRolls(
      { weapon: declared.weapon, encounterRange: declared.encounterRange, aiuto: declared.aiuto, effectBonus: declared.effectBonus, targetBelowHalfHp: declared.targetBelowHalfHp },
      rolls, rerollValues
    );
    if (outcome.status === "needs-reroll") return outcome;

    return Object.assign({ status: "resolved" }, finishPlayerAttackOnEnemy(state, player, enemy, declared.weapon, declared.aiuto, outcome, lootRng));
  }

  /* Wrapper di compatibilità per test/simulazioni (RNG, mai in partita reale). */
  function attackEnemyAction(state, playerId, enemyId, weapon, rng, lootRng) {
    const declared = declarePlayerAttack(state, playerId, enemyId, weapon);
    const player = getPlayer(state, playerId);
    const enemy = getEnemy(state, enemyId);
    const roll = rng || Math.random;
    const outcome = combat.resolveAttack({
      weapon, encounterRange: declared.encounterRange, aiuto: declared.aiuto,
      effectBonus: declared.effectBonus, targetBelowHalfHp: declared.targetBelowHalfHp, rng: roll
    });
    return finishPlayerAttackOnEnemy(state, player, enemy, weapon, declared.aiuto, outcome, lootRng);
  }

  /* Combat V2 — attacco di squadra. Il leader usa la propria azione;
     fino a due compagni sullo stesso nodo possono impegnare la loro azione
     OFFENSIVA del round senza perdere le azioni non offensive del proprio
     turno successivo. Ogni partecipante mantiene arma/dadi/special propri. */
  function declareTeamAttack(state, leaderId, enemyId, participantSpecs) {
    const leader = getPlayer(state, leaderId);
    ensureCanAttack(leader);
    const enemy = getEnemy(state, enemyId);
    if (!enemy || enemy.hp <= 0 || enemy.zoneId !== leader.zoneId) throw new Error("Bersaglio non valido");
    const zone = getZone(state, leader.zoneId);
    if (zone.nodes && leader.nodeId !== enemy.nodeId) throw new Error("Devi essere sul nodo del nemico");

    const specs = Array.isArray(participantSpecs) ? participantSpecs.slice() : [];
    if (!specs.some((x) => x.playerId === leaderId)) throw new Error("Il leader deve partecipare all'attacco di squadra");
    if (specs.length < 2 || specs.length > 3) throw new Error("Un attacco di squadra richiede 2 o 3 giocatori");
    const seen = new Set();
    const participants = specs.map((spec) => {
      if (!spec || !spec.playerId || !spec.weapon) throw new Error("Partecipante squadra non valido");
      if (seen.has(spec.playerId)) throw new Error("Partecipante duplicato nell'attacco di squadra");
      seen.add(spec.playerId);
      const player = getPlayer(state, spec.playerId);
      if (!player || player.present === false || player.status !== "active" || player.zoneId !== leader.zoneId) throw new Error("Partecipante non disponibile");
      if (zone.nodes && player.nodeId !== leader.nodeId) throw new Error("Tutti i partecipanti devono essere sullo stesso nodo");
      if (player.offensiveSpentThisRound) throw new Error(`${player.name} ha già usato la sua azione offensiva`);
      if (player.id === leaderId && player.actedThisRound) throw new Error("Azione principale già usata in questo round");
      const encounterRange = resolveEncounterRange(zone, player.nodeId, enemy.nodeId);
      const isRangeless = Boolean(spec.weapon.special && spec.weapon.special.type === "rangeless");
      const aiuto = Boolean(state.pendingAiuto[player.id]);
      const partyBoostForTeam = getPartyBoostCharges(state, zone.id) > 0;
      const effectBonus = (enemy.suppressed ? 1 : 0) + (state.pendingStim[player.id] ? 1 : 0) + (partyBoostForTeam ? 1 : 0);
      const diceCount = combat.computeDiceCount({
        baseDice: spec.weapon.baseDice, weaponRange: spec.weapon.range, encounterRange,
        isRangeless, aiuto, effectBonus
      });
      return { playerId: player.id, playerName: player.name, weapon: spec.weapon, encounterRange, aiuto, effectBonus, diceCount, targetBelowHalfHp: enemy.hp < enemy.maxHp / 2 };
    });
    enemy.suppressed = false;
    const partyBoostApplied = getPartyBoostCharges(state, zone.id) > 0;
    return { kind: "team-vs-enemy", leaderId, enemyId, participants, zoneId: zone.id, partyBoostApplied };
  }

  function resolveTeamAttackFromRolls(state, declared, rollsByPlayer, rerollsByPlayer, lootRng) {
    const enemy = getEnemy(state, declared.enemyId);
    if (!enemy || enemy.hp <= 0) throw new Error("Bersaglio di squadra non più valido");
    const resolvedParts = [];
    const pending = [];
    declared.participants.forEach((part) => {
      const rolls = rollsByPlayer && rollsByPlayer[part.playerId];
      const rerolls = rerollsByPlayer && rerollsByPlayer[part.playerId];
      const outcome = combat.resolveAttackFromRolls({
        weapon: part.weapon, encounterRange: part.encounterRange, aiuto: part.aiuto,
        effectBonus: part.effectBonus, targetBelowHalfHp: part.targetBelowHalfHp
      }, rolls, rerolls);
      if (outcome.status === "needs-reroll") pending.push({ playerId: part.playerId, rerollIndices: outcome.rerollIndices, diceCount: outcome.diceCount, rolls: outcome.rolls });
      else resolvedParts.push({ part, outcome });
    });
    if (pending.length) return { status: "needs-reroll", pending };

    const hpBefore = enemy.hp, shieldBefore = enemy.shield;
    const contributionRows = [];
    const zone = getZone(state, enemy.zoneId);
    resolvedParts.forEach(({ part, outcome }) => {
      applyDamageToEnemy(enemy, outcome);
      zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, outcome);
      const player = getPlayer(state, part.playerId);
      player.offensiveSpentThisRound = true;
      player.waitingForPartyThisRound = false;
      if (player.id === declared.leaderId) player.actedThisRound = true;
      player.contributions.damage += Math.max(0, outcome.total || 0);
      if (part.aiuto) delete state.pendingAiuto[player.id];
      delete state.pendingStim[player.id];
      contributionRows.push({
        playerId: player.id, playerName: player.name, weaponName: part.weapon.name,
        rolls: outcome.rolls.slice(), power: part.weapon.power, total: outcome.total
      });
    });
    const summary = combat.resolveTeamAttack(contributionRows);
    if (declared.partyBoostApplied) {
      const event = getPartyBoostEvent(state, declared.zoneId || enemy.zoneId);
      if (event && event.charges > 0) event.charges -= 1;
    }
    const eliminated = enemy.hp <= 0;
    const lootFound = [];
    const drop = resolveEnemyDeathLoot(state, enemy, lootRng, { teamPlayerIds: declared.participants.map((p) => p.playerId) });
    if (drop) lootFound.push(drop);
    pushLog(state, `${summary.participants.map((p) => p.playerName).join(" + ")} attaccano ${enemy.name || enemy.archetype}: ${summary.total} contributo totale`);
    return {
      status: "resolved", type: "team-attack", enemyId: enemy.id,
      hpBefore, hpAfter: enemy.hp, shieldBefore, shieldAfter: enemy.shield,
      eliminated, contributions: summary.participants, total: summary.total, lootFound,
      partyBoostApplied: Boolean(declared.partyBoostApplied),
      partyBoostChargesRemaining: getPartyBoostCharges(state, declared.zoneId || enemy.zoneId)
    };
  }

  function fumogenoRetreatAction(state, playerId, retreatNodeId) {
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    const item = player.equipment && player.equipment.utility;
    if (!item || item.id !== "fumogeno") throw new Error("Fumogeno non disponibile");
    const zone = getZone(state, player.zoneId);
    if (!zone || !zone.nodes || player.nodeId == null) throw new Error("Il Fumogeno di ritirata richiede un Node Graph");
    const current = zone.nodes.find((n) => n.id === player.nodeId);
    if (!current) throw new Error("Nodo corrente inesistente");
    const valid = Object.values(current.connections || {}).filter(Boolean);
    if (!retreatNodeId || !valid.includes(retreatNodeId)) throw new Error("Nodo di ritirata non collegato");
    player.equipment.utility = null;
    player.nodeId = retreatNodeId;
    player.movedThisRound = true;
    pushLog(state, `${player.name} usa ${item.name}: fuga sicura`);
    return { type: "fumogeno-retreat", escaped: true, damageTaken: 0, fromNodeId: current.id, toNodeId: retreatNodeId };
  }

  function applyCombatReaction(state, playerId, incomingDamage, reactionType, roll, retreatNodeId, ignoreShieldN) {
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    let reaction;
    if (reactionType === "defend") reaction = combat.resolveDefense(incomingDamage, roll);
    else if (reactionType === "dodge") reaction = combat.resolveDodge(incomingDamage, roll);
    else if (reactionType === "retreat") reaction = combat.resolveRetreat(incomingDamage, roll);
    else throw new Error("Reazione non valida");

    const hpBefore = player.hp, shieldBefore = player.shield;
    applyDamageToPlayer(state, player, { total: reaction.damageTaken, ignoreShieldN: Math.min(reaction.damageTaken, ignoreShieldN || 0) });
    if (reactionType === "defend" && reaction.damageTaken < reaction.incomingDamage) player.contributions.defenses += 1;

    if ((reactionType === "retreat" && reaction.escaped) || (reactionType === "dodge" && reaction.freeMove)) {
      const zone = getZone(state, player.zoneId);
      if (zone.nodes && player.nodeId != null) {
        const current = zone.nodes.find((n) => n.id === player.nodeId);
        const connected = current ? Object.values(current.connections || {}).filter(Boolean) : [];
        if (!retreatNodeId || !connected.includes(retreatNodeId)) throw new Error("Serve un nodo collegato valido per lo spostamento di reazione");
        player.nodeId = retreatNodeId;
      }
    }
    return { reaction, hpBefore, hpAfter: player.hp, shieldBefore, shieldAfter: player.shield, statusAfter: player.status };
  }

  function markCounterattack(state, playerId) {
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    if (player.offensiveSpentThisRound) throw new Error("Azione offensiva già usata in questo round");
    player.offensiveSpentThisRound = true;
    return { playerId, offensiveSpentThisRound: true };
  }

  function rianimaAction(state, playerId, targetId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const target = getPlayer(state, targetId);
    if (!target || target.status !== "ko" || target.zoneId !== player.zoneId) throw new Error("Rianimazione non valida");
    const zone = getZone(state, player.zoneId);
    if (zone.nodes && target.nodeId !== player.nodeId) throw new Error("Per rialzare un compagno dovete essere sullo stesso nodo");

    target.status = "active";
    target.hp = 3;
    target.shield = 0;
    target.koRoundsRemaining = null;
    target.koSinceRound = null;
    player.hp = Math.max(0, player.hp - 2);
    player.actedThisRound = true;
    player.contributions.rescues += 1;
    if (player.hp <= 0) setPlayerKO(state, player);
    pushLog(state, `${player.name} rialza ${target.name}: ${target.name} torna a 3 HP, ${player.name} paga 2 HP`);
    return { rescuerId: player.id, targetId: target.id, rescuerHp: player.hp, targetHp: target.hp };
  }

  function destinyReviveAction(state, playerId, roll) {
    const player = getPlayer(state, playerId);
    if (!player || player.status !== "ko") throw new Error("Solo un giocatore KO può tentare il rialzo del destino");
    const resolved = combat.resolveDestinyRevive(roll);
    if (!resolved.success) {
      pushLog(state, `${player.name} tenta il rialzo del destino: 1, resta KO`);
      return resolved;
    }
    player.status = "active";
    player.hp = resolved.hp;
    player.shield = 0;
    player.koRoundsRemaining = null;
    player.koSinceRound = null;
    player.actedThisRound = true;
    player.offensiveSpentThisRound = true;
    pushLog(state, `${player.name} torna in gioco grazie al destino con ${resolved.hp} HP`);
    return resolved;
  }

  /* Slot arma -> "weapon" nel loot; slot supporto -> stesso nome dello slot
     (coincide già col "kind" usato in groundLoot). */
  function slotToLootKind(slot) {
    return (slot === "primary" || slot === "secondary") ? "weapon" : slot;
  }

  /* SCAMBIA: trasferimento a SENSO UNICO (§5 decisione). Il mittente dà
     l'oggetto e il suo slot resta vuoto (non c'è "resto" automatico). Se lo
     slot del destinatario era occupato, il SUO oggetto precedente non viene
     mai distrutto: va a terra nella zona (§15 groundLoot), mai sovrascritto
     silenziosamente. Costa comunque l'azione principale di chi dà. */
  function scambiaAction(state, fromId, toId, slot) {
    const from = getPlayer(state, fromId);
    ensureCanAct(from);
    const to = getPlayer(state, toId);
    if (!to || to.status !== "active" || to.zoneId !== from.zoneId) throw new Error("Scambio non valido");
    const zone = getZone(state, from.zoneId);
    if (zone.nodes && to.nodeId !== from.nodeId) throw new Error("Per dare un oggetto dovete essere sullo stesso nodo");
    const item = from.equipment[slot];
    if (item === undefined) throw new Error("Slot inesistente");
    if (!item) throw new Error("Niente da scambiare in questo slot");
    const previous = to.equipment[slot];
    to.equipment[slot] = item;
    from.equipment[slot] = null;
    if (previous) {
      const kind = slotToLootKind(slot);
      pushGroundLoot(state, zone, kind === "weapon" ? { kind, weaponId: previous.id } : { kind, itemId: previous.id }, zone.nodes ? from.nodeId : null);
    }
    from.actedThisRound = true;
    pushLog(state, `${from.name} dà ${item.name || slot} a ${to.name}`);
  }

  /* Cura: clamp a 10 HP. "full" (Kit Medico) riporta al massimo, altrimenti
     somma item.amount. Azione principale. */
  function usaCuraAction(state, playerId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const item = player.equipment.cura;
    if (!item) throw new Error("Nessuna Cura equipaggiata");
    if (player.hp >= 10) throw new Error("Vita già al massimo");
    player.hp = item.full ? 10 : Math.min(10, player.hp + (item.amount || 0));
    player.equipment.cura = null;
    player.actedThisRound = true;
    pushLog(state, `${player.name} usa ${item.name}`);
  }

  /* Scudo: clamp a 10 Shield, stessa logica di usaCuraAction. */
  function usaScudoAction(state, playerId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const item = player.equipment.scudo;
    if (!item) throw new Error("Nessuno Scudo equipaggiato");
    if (player.shield >= 10) throw new Error("Scudo già al massimo");
    player.shield = item.full ? 10 : Math.min(10, player.shield + (item.amount || 0));
    player.equipment.scudo = null;
    player.actedThisRound = true;
    pushLog(state, `${player.name} usa ${item.name}`);
  }

  /* Utility: un solo punto d'ingresso, dispatch sull'oggetto equipaggiato.
     Le tre Utility consumano SEMPRE l'azione principale, oltre all'oggetto
     stesso — nessuna eccezione tra Scanner/Fumogeno/Stim (decisione presa).
     Il bonus/malus (Fumogeno/Stim) resta comunque congelato al momento in
     cui viene preparato l'attacco reale (prepareEnemyStep/prepareBossStep/
     declarePlayerAttack/declareBossAttack), mai qui: usarlo non tira dadi. */
  function usaUtilityAction(state, playerId, targetChestId, rng) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const item = player.equipment.utility;
    if (!item) throw new Error("Nessuna Utility equipaggiata");
    let result;
    if (item.id === "scanner") {
      const zone = getZone(state, player.zoneId);
      const chest = (zone.chests || []).find((c) => c.id === targetChestId && !c.opened);
      if (!chest) throw new Error("Nessuna cassa chiusa da scansionare");
      if (chest.nodeId && chest.nodeId !== player.nodeId) throw new Error("Scanner utilizzabile solo vicino alla cassa");
      if (!chest.scannedLoot) {
        const roll = rng || Math.random;
        chest.scannedLoot = loot.rollChestLoot(zone.danger, roll, state.lootRegistry);
      }
      result = {
        type: "scanner", chestId: chest.id,
        weapon: chest.scannedLoot.weapon,
        support: chest.scannedLoot.support
      };
    } else if (item.id === "fumogeno") {
      const zone = getZone(state, player.zoneId);
      zone.smokeActive = true; // non stacka: è già un booleano
      result = { type: "fumogeno", zoneId: zone.id };
    } else if (item.id === "stim") {
      state.pendingStim[playerId] = true; // non stacka: è già un booleano
      result = { type: "stim", playerId };
    } else {
      throw new Error("Utility sconosciuta: " + item.id);
    }
    player.equipment.utility = null;
    player.actedThisRound = true;
    pushLog(state, `${player.name} usa ${item.name}`);
    return result;
  }

  /* Placeholder generico: nessuna regola numerica specifica assegnata ancora
     (leve, terminali, NPC...). Consuma comunque l'azione. */
  function interagisciAction(state, playerId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    player.actedThisRound = true;
    pushLog(state, `${player.name} interagisce con la zona`);
  }

  /* Cassa: sempre 1 arma + 1 supporto garantiti (§7), entrambi finiscono in
     groundLoot — l'assegnazione a un giocatore specifico è un passo separato
     (equipFoundWeapon/equipFoundSupportItem), mai automatica. */
  function apriCassaAction(state, playerId, chestId, rng) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const zone = getZone(state, player.zoneId);
    const chest = zone.chests.find((c) => c.id === chestId);
    if (!chest || chest.opened) throw new Error("Cassa non disponibile");
    // Node Graph: una cassa con nodeId (assegnata da assignChestsToNodeSlots)
    // si apre solo da quel nodo — chest.nodeId è assente sulle zone legacy,
    // quindi questo controllo è naturalmente no-op lì.
    if (chest.nodeId && chest.nodeId !== player.nodeId) throw new Error("Cassa non raggiungibile da qui");
    chest.opened = true;
    const roll = rng || Math.random;
    const found = chest.scannedLoot || loot.rollChestLoot(zone.danger, roll, state.lootRegistry);
    // Il groundLoot della cassa eredita il nodeId della cassa stessa (§9): non
    // deve comparire/essere raccoglibile da un altro nodo della stessa zona.
    const weaponEntry = pushGroundLoot(state, zone, found.weapon, chest.nodeId);
    const supportEntry = pushGroundLoot(state, zone, found.support, chest.nodeId);
    player.actedThisRound = true;
    pushLog(state, `${player.name} apre una cassa in ${zone.name}: ${lootDescriptorLabel(found.weapon)} + ${lootDescriptorLabel(found.support)}`);
    return { weapon: weaponEntry, support: supportEntry };
  }

  /* Raccogliere un oggetto già a terra (appena rivelato o lasciato da un
     compagno) non costa l'azione principale (§18: solo APRIRE la cassa la
     costa, distribuirne/raccoglierne il contenuto no). Sostituzione atomica:
     l'oggetto nuovo entra, quello vecchio (se presente) va a terra — mai
     distrutto silenziosamente (§4). weaponObject è già risolto dal chiamante
     (stesso principio di declarePlayerAttack: il loop non conosce il
     catalogo Armi, riceve oggetti già pronti). */
  function equipFoundWeapon(state, playerId, slot, groundLootInstanceId, weaponObject) {
    if (slot !== "primary" && slot !== "secondary") throw new Error("Slot arma non valido: " + slot);
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    const zone = getZone(state, player.zoneId);
    // Node Graph: un'entry con nodeId (es. il drop di una cassa, §9) si può
    // raccogliere solo dallo stesso nodo. Entry senza nodeId (comportamento
    // legacy, es. loot ambientale) restano raccoglibili da tutta la zona.
    const idx = zone.groundLoot.findIndex((g) => g.instanceId === groundLootInstanceId && (g.nodeId == null || g.nodeId === player.nodeId));
    if (idx === -1 || zone.groundLoot[idx].kind !== "weapon") throw new Error("Arma non trovata a terra in questa zona");
    if (zone.groundLoot[idx].ownerPlayerId && zone.groundLoot[idx].ownerPlayerId !== player.id) throw new Error("Questo loot è assegnato a un altro giocatore");
    if (zone.groundLoot[idx].weaponId !== weaponObject.id) throw new Error("L'arma risolta non corrisponde al loot a terra");
    zone.groundLoot.splice(idx, 1);
    const previous = player.equipment[slot];
    player.equipment[slot] = weaponObject;
    if (previous) pushGroundLoot(state, zone, { kind: "weapon", weaponId: previous.id });
    if (player.collectedWeaponIds.indexOf(weaponObject.id) === -1) player.collectedWeaponIds.push(weaponObject.id);
    pushLog(state, `${player.name} equipaggia ${weaponObject.name} (${slot})`);
  }

  /* Stessa logica di equipFoundWeapon per Cura/Scudo/Utility. itemObject è
     già risolto dal chiamante (catalog/fortress-items.js). */
  /* Premio Macchina Regali: fuori dal turno di combattimento. Permette a
     qualunque bambino PRESENTE di equipaggiare l'arma vinta senza consumare
     azioni. Se lo slot era occupato, l'arma precedente torna a terra nella
     zona corrente, esattamente come per il loot normale. */
  function collectGiftWeapon(state, playerId, slot, weaponObject) {
    if (slot !== "primary" && slot !== "secondary") throw new Error("Slot arma non valido: " + slot);
    const player = getPlayer(state, playerId);
    if (!player || player.present === false) throw new Error("Giocatore non presente");
    if (!weaponObject || !weaponObject.id) throw new Error("Arma premio non valida");
    const previous = player.equipment[slot];
    player.equipment[slot] = weaponObject;
    if (previous && player.zoneId) {
      const zone = getZone(state, player.zoneId);
      pushGroundLoot(state, zone, { kind: "weapon", weaponId: previous.id }, zone.nodes ? player.nodeId : null);
    }
    if (player.collectedWeaponIds.indexOf(weaponObject.id) === -1) player.collectedWeaponIds.push(weaponObject.id);
    pushLog(state, `${player.name} raccoglie dalla Macchina Regali ${weaponObject.name} (${slot})`);
    return { playerId: player.id, slot, weaponId: weaponObject.id, replacedWeaponId: previous ? previous.id : null };
  }

  function equipFoundSupportItem(state, playerId, slot, groundLootInstanceId, itemObject) {
    if (slot !== "cura" && slot !== "scudo" && slot !== "utility") throw new Error("Slot supporto non valido: " + slot);
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    const zone = getZone(state, player.zoneId);
    const idx = zone.groundLoot.findIndex((g) => g.instanceId === groundLootInstanceId && (g.nodeId == null || g.nodeId === player.nodeId));
    if (idx === -1 || zone.groundLoot[idx].kind !== slot) throw new Error("Oggetto non trovato a terra in questa zona");
    if (zone.groundLoot[idx].ownerPlayerId && zone.groundLoot[idx].ownerPlayerId !== player.id) throw new Error("Questo loot è assegnato a un altro giocatore");
    if (zone.groundLoot[idx].itemId !== itemObject.id) throw new Error("L'oggetto risolto non corrisponde al loot a terra");
    zone.groundLoot.splice(idx, 1);
    const previous = player.equipment[slot];
    player.equipment[slot] = itemObject;
    if (previous) pushGroundLoot(state, zone, { kind: slot, itemId: previous.id });
    pushLog(state, `${player.name} equipaggia ${itemObject.name} (${slot})`);
  }

  /* =========================================================================
     BFS — solo per l'Aggressivo, nessun pathfinding spaziale.
     ========================================================================= */
  function bfsFrom(zones, startId) {
    const dist = { [startId]: 0 };
    const prev = {};
    const queue = [startId];
    while (queue.length) {
      const cur = queue.shift();
      const zone = zones.find((z) => z.id === cur);
      const neighbors = zone.connections.slice().sort();
      for (const n of neighbors) {
        if (!(n in dist)) { dist[n] = dist[cur] + 1; prev[n] = cur; queue.push(n); }
      }
    }
    return { dist, prev };
  }

  function nearestZoneWithActivePlayer(state, fromZoneId) {
    const { dist, prev } = bfsFrom(state.zones, fromZoneId);
    const candidates = state.zones
      .filter((z) => z.id !== fromZoneId && dist[z.id] !== undefined && activePlayersInZone(state, z.id).length > 0)
      .sort((a, b) => (dist[a.id] - dist[b.id]) || (a.id < b.id ? -1 : 1));
    if (!candidates.length) return null;
    const targetId = candidates[0].id;
    let step = targetId;
    while (prev[step] !== fromZoneId && prev[step] !== undefined) step = prev[step];
    return { targetZoneId: targetId, firstStep: step, distance: dist[targetId] };
  }

  /* =========================================================================
     TIE-BREAK BERSAGLIO — rotazione deterministica tra candidati a pari
     distanza, mai casuale. Usato sia dai nemici sia dal boss.
     ========================================================================= */
  function pickTarget(candidates, lastTargetId) {
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0];
    const ids = candidates.map((c) => c.id);
    const idx = ids.indexOf(lastTargetId);
    const nextIdx = (idx + 1) % ids.length;
    return candidates[nextIdx];
  }

  /* =========================================================================
     FASE NEMICI
     ========================================================================= */
  /* Ordine deterministico della fase nemici: calcolato UNA VOLTA (solo id,
     nessun esito precalcolato) così un chiamante passo-passo (il futuro
     Director) sa quanti nemici agiranno e in che ordine, senza dover
     rieseguire la stessa risoluzione più volte. */
  function getEnemyPhaseOrder(state) {
    return state.enemies.filter((e) => e.hp > 0 && !e.respondedThisRound).sort((a, b) => (a.id < b.id ? -1 : 1)).map((e) => e.id);
  }

  /* Multi-node Encounter V1 — decisione nemica dentro un Node Graph,
     SEMPRE deterministica (mai random):
       1. bersagli = candidates (già filtrati: active, stessa zona);
       2. raggiungibili = quelli con un nodeId a distanza risolvibile;
       3. "può attaccare da qui" dipende dal profilo:
          - melee (attackProfile.range === "vicino", oggi solo aggressivo):
            solo se un bersaglio è già sullo STESSO nodo — altrimenti si
            avvicina, non spara da lontano "a caso";
          - ranged/altro (medio/lontano): qualunque bersaglio raggiungibile
            va bene, resta fermo e attacca (mai avanza inutilmente);
       4. se nessun bersaglio è attaccabile da qui ma ne esiste uno
          raggiungibile, un solo passo (firstNodeStepToward) verso il più
          vicino: mai un tiro fisico, mai un secondo movimento;
       5. parità di distanza: pickTarget (stessa rotazione già usata sopra),
          mai una scelta casuale;
       6. nessun bersaglio raggiungibile: idle (nodo irraggiungibile gestito
          esplicitamente, mai un crash). */
  function prepareNodeEnemyStep(state, enemy, zone, candidates) {
    const weapon = enemy.attackProfile;
    const isMelee = weapon.range === "vicino";

    // L'entry del Node Graph è un'area neutra di approdo: finché il giocatore
    // resta lì non è ingaggiabile dai nemici. L'ingaggio inizia solo quando
    // sceglie volontariamente di lasciare l'entry e raggiunge i nodi di scontro.
    const engagedCandidates = zone.entryNodeId
      ? candidates.filter((p) => p.nodeId !== zone.entryNodeId)
      : candidates;
    const reachableAll = engagedCandidates
      .map((p) => ({ player: p, distance: getNodeDistance(zone, enemy.nodeId, p.nodeId) }))
      .filter((c) => c.distance != null);
    const exposedReachable = reachableAll.filter((c) => !c.player.hiddenInShelter);
    const reachable = exposedReachable.length ? exposedReachable : reachableAll;
    const attackable = isMelee ? reachable.filter((c) => c.distance === 0) : reachable;

    if (attackable.length) {
      const minDistance = Math.min.apply(null, attackable.map((c) => c.distance));
      const nearest = attackable.filter((c) => c.distance === minDistance).map((c) => c.player);
      const target = pickTarget(nearest, enemy.lastTargetId);
      const encounterRange = resolveEncounterRange(zone, enemy.nodeId, target.nodeId);
      const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
      const effectBonus = (zone.smokeActive ? -1 : 0) + (target.hiddenInShelter ? -1 : 0); // riparo: se tutti sono nascosti resta attaccabile ma con -1 dado
      zone.smokeActive = false;
      const diceCount = combat.computeDiceCount({
        baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange,
        isRangeless, aiuto: false, effectBonus
      });
      return { type: "attack", enemyId: enemy.id, targetId: target.id, weapon, encounterRange, effectBonus, diceCount };
    }

    if (reachable.length) {
      const minDistance = Math.min.apply(null, reachable.map((c) => c.distance));
      const nearest = reachable.filter((c) => c.distance === minDistance).map((c) => c.player);
      const target = pickTarget(nearest, enemy.lastTargetId);
      const step = firstNodeStepToward(zone, enemy.nodeId, target.nodeId);
      if (step) {
        const fromNodeId = enemy.nodeId;
        enemy.nodeId = step;
        const trapTriggered = triggerShelterTrap(state, zone, enemy);
        return { type: "move", enemyId: enemy.id, fromNodeId, toNodeId: enemy.nodeId, trapTriggered };
      }
    }

    return { type: "idle", enemyId: enemy.id };
  }

  /* Prepara UN SOLO nemico della fase, SENZA tirare dadi: stessa identica
     logica di targeting/movimento che prima viveva dentro il forEach di
     resolveEnemyPhase, ma si ferma un istante prima del combat engine.
     Il bersaglio (targetId) è deciso qui e va passato invariato a
     resolveEnemyStepFromRolls: mai un secondo pickTarget dopo aver preso i
     dadi fisici. Se l'id non esiste più o l'enemy è già a 0 HP (snapshot
     dell'ordine ormai stale), nessun errore: "skipped". */
  function prepareEnemyStep(state, enemyId) {
    const enemy = getEnemy(state, enemyId);
    if (!enemy || enemy.hp <= 0) return { type: "skipped", enemyId };

    const candidates = activePlayersInZone(state, enemy.zoneId);
    if (candidates.length) {
      const zone = getZone(state, enemy.zoneId);
      // Multi-node Encounter V1: dentro un Node Graph con un nodeId proprio,
      // il nemico decide ATTACCA oppure MUOVITI DI 1 NODO (mai entrambe,
      // mai un tiro fisico se si muove — vedi prepareNodeEnemyStep). Zone
      // legacy o nemico senza nodeId: comportamento invariato, attacca
      // sempre chi trova nella zona con la gittata di zona.
      if (zone.nodes && enemy.nodeId != null) return prepareNodeEnemyStep(state, enemy, zone, candidates);

      const target = pickTarget(candidates, enemy.lastTargetId);
      const weapon = enemy.attackProfile;
      const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
      // Fumogeno: -1 dado, congelato QUI (mai ricalcolato dopo un ritiro
      // fisico) e consumato SOLO perché questo step è davvero un attacco
      // (non da movimento/idle, vedi §14).
      const effectBonus = zone.smokeActive ? -1 : 0;
      zone.smokeActive = false;
      const diceCount = combat.computeDiceCount({
        baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange: zone.encounterRange,
        isRangeless, aiuto: false, effectBonus
      });
      return { type: "attack", enemyId: enemy.id, targetId: target.id, weapon, encounterRange: zone.encounterRange, effectBonus, diceCount };
    }

    const archetypeDef = DEFAULT_ENEMY_ARCHETYPES[enemy.archetype];
    if (archetypeDef && archetypeDef.movement === "chase") {
      const move = nearestZoneWithActivePlayer(state, enemy.zoneId);
      if (move) {
        const fromZoneId = enemy.zoneId;
        enemy.zoneId = move.firstStep;
        return { type: "move", enemyId: enemy.id, fromZoneId, toZoneId: enemy.zoneId };
      }
    }
    return { type: "idle", enemyId: enemy.id };
  }

  /* Tail comune a RNG e dadi fisici: applica un esito di attacco NEMICO→
     giocatore già calcolato dal combat engine (mai un ricalcolo). */
  function applyEnemyAttackOutcome(state, enemy, target, outcome) {
    const hpBefore = target.hp, shieldBefore = target.shield, statusBefore = target.status;
    applyDamageToPlayer(state, target, outcome);

    const secondaryHits = [];
    if (outcome.secondaryHits && outcome.secondaryHits.length) {
      const others = activePlayersInZone(state, enemy.zoneId).filter((p) => p.id !== target.id);
      applySecondaryHits(outcome.secondaryHits, others, (p, amount) => {
        const hpB = p.hp, shieldB = p.shield, statusB = p.status;
        applyDamageToPlayer(state, p, { total: amount });
        secondaryHits.push({
          playerId: p.id, amount, ignoreShieldN: 0,
          hpBefore: hpB, hpAfter: p.hp,
          shieldBefore: shieldB, shieldAfter: p.shield,
          statusBefore: statusB, statusAfter: p.status
        });
      });
    }

    const zone = getZone(state, enemy.zoneId);
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, outcome);
    enemy.lastTargetId = target.id;
    pushLog(state, `${enemy.archetype} attacca ${target.name}: ${outcome.total} danni`);

    return {
      type: "attack", enemyId: enemy.id, targetId: target.id, result: outcome,
      ignoreShieldN: outcome.ignoreShieldN || 0,
      hpBefore, hpAfter: target.hp,
      shieldBefore, shieldAfter: target.shield,
      statusBefore, statusAfter: target.status,
      secondaryHits
    };
  }

  /* Risolve da risultati di dadi FISICI. `prepared` è ESATTAMENTE l'oggetto
     restituito da prepareEnemyStep: il bersaglio non viene mai deciso di nuovo qui. */
  function prepareEnemyResponseToAttacker(state, enemyId, targetId) {
    const enemy = getEnemy(state, enemyId);
    const target = getPlayer(state, targetId);
    if (!enemy || enemy.hp <= 0) return { type: "skipped", enemyId, reason: "enemy-defeated" };
    if (!target || target.status !== "active" || target.zoneId !== enemy.zoneId) return { type: "skipped", enemyId, reason: "target-unavailable" };
    const zone = getZone(state, enemy.zoneId);
    if (zone.nodes && enemy.nodeId !== target.nodeId) return { type: "skipped", enemyId, reason: "target-left-node" };
    const weapon = enemy.attackProfile;
    const encounterRange = resolveEncounterRange(zone, enemy.nodeId, target.nodeId);
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    const effectBonus = 0;
    const diceCount = combat.computeDiceCount({ baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange, isRangeless, aiuto: false, effectBonus });
    return { type: "attack", enemyId: enemy.id, targetId: target.id, weapon, encounterRange, effectBonus, diceCount, immediateResponse: true };
  }

  function resolvePreparedEnemyOutcomeFromRolls(prepared, rolls, rerollValues) {
    if (prepared.type !== "attack") throw new Error("Questo step non prevede un tiro di dadi");
    return combat.resolveAttackFromRolls(
      { weapon: prepared.weapon, encounterRange: prepared.encounterRange, effectBonus: prepared.effectBonus },
      rolls, rerollValues
    );
  }

  function resolveEnemyStepFromRolls(state, prepared, rolls, rerollValues) {
    const outcome = resolvePreparedEnemyOutcomeFromRolls(prepared, rolls, rerollValues);
    if (outcome.status === "needs-reroll") return outcome;

    const enemy = getEnemy(state, prepared.enemyId);
    const target = getPlayer(state, prepared.targetId);
    if (!enemy || !target) throw new Error("Nemico o bersaglio non più validi rispetto alla preparazione dello step");
    return Object.assign({ status: "resolved" }, applyEnemyAttackOutcome(state, enemy, target, outcome));
  }

  function resolveEnemyReactionFromRolls(state, prepared, enemyRolls, reactionType, reactionRoll, retreatNodeId, rerollValues) {
    const outcome = resolvePreparedEnemyOutcomeFromRolls(prepared, enemyRolls, rerollValues);
    if (outcome.status === "needs-reroll") return outcome;
    const enemy = getEnemy(state, prepared.enemyId);
    const target = getPlayer(state, prepared.targetId);
    if (!enemy || !target) throw new Error("Nemico o bersaglio non più validi");

    const reactionResult = applyCombatReaction(state, target.id, outcome.total, reactionType, reactionRoll, retreatNodeId, outcome.ignoreShieldN || 0);
    const zone = getZone(state, enemy.zoneId);
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, outcome);
    enemy.lastTargetId = target.id;
    pushLog(state, `${enemy.name || enemy.archetype} attacca ${target.name}: ${outcome.total} potenziali, ${reactionResult.reaction.damageTaken} subiti dopo ${reactionType}`);
    return {
      status: "resolved", type: "attack-reaction", enemyId: enemy.id, targetId: target.id,
      enemyResult: outcome, reaction: reactionResult.reaction,
      hpBefore: reactionResult.hpBefore, hpAfter: reactionResult.hpAfter,
      shieldBefore: reactionResult.shieldBefore, shieldAfter: reactionResult.shieldAfter,
      statusAfter: reactionResult.statusAfter, secondaryHits: []
    };
  }

  function resolveCounterattackAgainstOutcomeFromRolls(state, prepared, enemyOutcome, weapon, counterRolls, counterRerolls) {
    const enemy = getEnemy(state, prepared.enemyId);
    const player = getPlayer(state, prepared.targetId);
    if (!enemy || !player || player.status !== "active") throw new Error("Contrattacco non più valido");
    if (player.offensiveSpentThisRound) throw new Error("Azione offensiva già usata: non puoi contrattaccare");
    const zone = getZone(state, player.zoneId);
    const encounterRange = resolveEncounterRange(zone, player.nodeId, enemy.nodeId);
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    const effectBonus = (enemy.suppressed ? 1 : 0) + (state.pendingStim[player.id] ? 1 : 0);
    const counterOutcome = combat.resolveAttackFromRolls({
      weapon, encounterRange, isRangeless, aiuto: Boolean(state.pendingAiuto[player.id]), effectBonus,
      targetBelowHalfHp: enemy.hp < enemy.maxHp / 2
    }, counterRolls, counterRerolls);
    if (counterOutcome.status === "needs-reroll") return { status: "needs-counter-reroll", detail: counterOutcome };

    const playerHpBefore = player.hp, playerShieldBefore = player.shield;
    const enemyHpBefore = enemy.hp, enemyShieldBefore = enemy.shield;
    // Simultaneo: entrambi gli esiti vengono applicati anche se uno dei due va KO/0.
    applyDamageToPlayer(state, player, enemyOutcome);
    applyDamageToEnemy(enemy, counterOutcome);
    player.offensiveSpentThisRound = true;
    player.contributions.damage += Math.max(0, counterOutcome.total || 0);
    delete state.pendingStim[player.id];
    if (state.pendingAiuto[player.id]) delete state.pendingAiuto[player.id];
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, enemyOutcome);
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, counterOutcome);
    enemy.lastTargetId = player.id;
    const lootFound = [];
    const drop = resolveEnemyDeathLoot(state, enemy, null, { ownerPlayerId: player.id });
    if (drop) lootFound.push(drop);
    pushLog(state, `${player.name} contrattacca ${enemy.name || enemy.archetype}: ${counterOutcome.total} danni; subisce ${enemyOutcome.total}`);
    return {
      status: "resolved", type: "counterattack", enemyId: enemy.id, targetId: player.id,
      enemyResult: enemyOutcome, counterResult: counterOutcome,
      playerHpBefore, playerHpAfter: player.hp, playerShieldBefore, playerShieldAfter: player.shield,
      enemyHpBefore, enemyHpAfter: enemy.hp, enemyShieldBefore, enemyShieldAfter: enemy.shield,
      enemyEliminated: enemy.hp <= 0, playerStatusAfter: player.status, lootFound
    };
  }

  function resolveCounterattackFromRolls(state, prepared, enemyRolls, weapon, counterRolls, enemyRerolls, counterRerolls) {
    const enemyOutcome = resolvePreparedEnemyOutcomeFromRolls(prepared, enemyRolls, enemyRerolls);
    if (enemyOutcome.status === "needs-reroll") return { status: "needs-enemy-reroll", detail: enemyOutcome };
    return resolveCounterattackAgainstOutcomeFromRolls(state, prepared, enemyOutcome, weapon, counterRolls, counterRerolls);
  }

  /* Wrapper di compatibilità per test/simulazioni (RNG, mai in partita reale). */
  function resolveEnemyStep(state, enemyId, rng) {
    const prepared = prepareEnemyStep(state, enemyId);
    if (prepared.type !== "attack") return prepared;
    const roll = rng || Math.random;
    const enemy = getEnemy(state, prepared.enemyId);
    const target = getPlayer(state, prepared.targetId);
    const outcome = combat.resolveAttack({ weapon: prepared.weapon, encounterRange: prepared.encounterRange, effectBonus: prepared.effectBonus, rng: roll });
    return applyEnemyAttackOutcome(state, enemy, target, outcome);
  }

  /* Wrapper di compatibilità: stesso ordine, stesso comportamento di sempre.
     Chi non ha bisogno dello step-by-step continua a chiamare questa. */
  function resolveEnemyPhase(state, rng) {
    getEnemyPhaseOrder(state).forEach((id) => resolveEnemyStep(state, id, rng));
  }

  /* Applica danno a QUALUNQUE bersaglio con hp/shield (giocatore, nemico o
     boss): Scudo prima, poi Salute. Se l'arma ha ignoreShield(N), N punti del
     danno totale bypassano lo Scudo e colpiscono subito la Salute; il resto
     del danno segue l'ordine normale Scudo→Salute. Unica implementazione,
     riusata per ogni tipo di bersaglio — mai duplicata.
     Diversa dalla Tempesta (che ignora SEMPRE lo Scudo, vedi endRound). */
  function applyDamage(target, result) {
    let dmg = result.total;
    const bypass = Math.min(result.ignoreShieldN || 0, dmg);
    if (bypass > 0) {
      target.hp = Math.max(0, target.hp - bypass);
      dmg -= bypass;
    }
    if (dmg > 0 && target.shield > 0) {
      const fromShield = Math.min(target.shield, dmg);
      target.shield -= fromShield;
      dmg -= fromShield;
    }
    if (dmg > 0) target.hp = Math.max(0, target.hp - dmg);
  }

  function applyDamageToPlayer(state, player, result) {
    applyDamage(player, result);
    if (player.hp <= 0 && player.status === "active") setPlayerKO(state, player);
  }

  function applyDamageToEnemy(enemy, result) {
    applyDamage(enemy, result);
  }

  function setPlayerKO(state, player) {
    player.status = "ko";
    player.hp = 0;
    // Combat V2: nessun countdown che espelle un bambino dalla partita.
    // Finché almeno un compagno è attivo, al proprio turno il KO può
    // tentare il rialzo del destino con 1 D6.
    player.koRoundsRemaining = null;
    player.koSinceRound = state.round;
    pushLog(state, `${player.name} va KO`);
  }

  /* =========================================================================
     FASE BOSS
     ========================================================================= */
  /* Sceglie la fase più avanzata (soglia più bassa) tra quelle il cui
     threshold è >= al rapporto hp/maxHp corrente. */
  function currentBossPhase(boss) {
    const ratio = boss.hp / boss.maxHp;
    const phases = boss.config.phases;
    const eligible = phases.filter((p) => ratio <= p.threshold);
    return eligible.length ? eligible.reduce((a, b) => (a.threshold < b.threshold ? a : b)) : phases[phases.length - 1];
  }

  /* Prepara l'attacco del boss (un solo attacco a round) SENZA tirare dadi:
     stessa scelta di fase/bersaglio di sempre, bloccata prima del combat
     engine e mai ridecisa dopo un ritiro fisico. */
  function prepareBossStep(state) {
    const boss = state.boss;
    if (!boss || !boss.active || boss.hp <= 0) return { type: "idle" };
    const zone = getZone(state, boss.zoneId);
    const candidates = activePlayersInZone(state, boss.zoneId);
    if (!candidates.length) return { type: "idle" }; // il boss non attacca chi non è nella sua zona

    const phase = currentBossPhase(boss);
    const target = pickTarget(candidates, boss.lastTargetId);
    const weapon = phase.attackProfile;
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    // Fumogeno: stesso principio di prepareEnemyStep, congelato qui.
    const effectBonus = zone.smokeActive ? -1 : 0;
    zone.smokeActive = false;
    const diceCount = combat.computeDiceCount({
      baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange: zone.encounterRange,
      isRangeless, aiuto: false, effectBonus
    });
    return { type: "attack", targetId: target.id, weapon, encounterRange: zone.encounterRange, effectBonus, diceCount };
  }

  /* Tail comune a RNG e dadi fisici: applica un esito di attacco BOSS→
     giocatore già calcolato dal combat engine (mai un ricalcolo). */
  function applyBossAttackOutcome(state, target, outcome) {
    const boss = state.boss;
    const hpBefore = target.hp, shieldBefore = target.shield, statusBefore = target.status;
    applyDamageToPlayer(state, target, outcome);

    const secondaryHits = [];
    if (outcome.secondaryHits && outcome.secondaryHits.length) {
      const others = activePlayersInZone(state, boss.zoneId).filter((p) => p.id !== target.id);
      applySecondaryHits(outcome.secondaryHits, others, (p, amount) => {
        const hpB = p.hp, shieldB = p.shield, statusB = p.status;
        applyDamageToPlayer(state, p, { total: amount });
        secondaryHits.push({
          playerId: p.id, amount, ignoreShieldN: 0,
          hpBefore: hpB, hpAfter: p.hp,
          shieldBefore: shieldB, shieldAfter: p.shield,
          statusBefore: statusB, statusAfter: p.status
        });
      });
    }

    const zone = getZone(state, boss.zoneId);
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, outcome);
    boss.lastTargetId = target.id;
    pushLog(state, `Il boss attacca ${target.name}: ${outcome.total} danni`);

    return {
      type: "attack", targetId: target.id, result: outcome,
      ignoreShieldN: outcome.ignoreShieldN || 0,
      hpBefore, hpAfter: target.hp,
      shieldBefore, shieldAfter: target.shield,
      statusBefore, statusAfter: target.status,
      secondaryHits
    };
  }

  /* Risolve da risultati di dadi FISICI. `prepared` è ESATTAMENTE l'oggetto
     restituito da prepareBossStep. */
  function resolveBossStepFromRolls(state, prepared, rolls, rerollValues) {
    if (prepared.type !== "attack") throw new Error("Questo step non prevede un tiro di dadi");
    const outcome = combat.resolveAttackFromRolls(
      { weapon: prepared.weapon, encounterRange: prepared.encounterRange, effectBonus: prepared.effectBonus },
      rolls, rerollValues
    );
    if (outcome.status === "needs-reroll") return outcome;

    const target = getPlayer(state, prepared.targetId);
    if (!target) throw new Error("Bersaglio non più valido rispetto alla preparazione dello step");
    return Object.assign({ status: "resolved" }, applyBossAttackOutcome(state, target, outcome));
  }

  /* Wrapper di compatibilità per test/simulazioni (RNG, mai in partita reale). */
  function resolveBossStep(state, rng) {
    const prepared = prepareBossStep(state);
    if (prepared.type !== "attack") return prepared;
    const roll = rng || Math.random;
    const target = getPlayer(state, prepared.targetId);
    const outcome = combat.resolveAttack({ weapon: prepared.weapon, encounterRange: prepared.encounterRange, effectBonus: prepared.effectBonus, rng: roll });
    return applyBossAttackOutcome(state, target, outcome);
  }

  /* Wrapper di compatibilità: stesso comportamento di sempre. */
  function resolveBossPhase(state, rng) {
    return resolveBossStep(state, rng);
  }

  /* =========================================================================
     ATTACCO GIOCATORE → BOSS — stesso identico principio (dichiara/risolvi da
     dadi/wrapper RNG) e stesso combat engine dell'attacco contro un nemico:
     nessun combattimento boss separato. Il boss non ha un'entità "enemy" nel
     catalogo nemici: applyDamage/applyDamageToEnemy sono già generiche su
     qualunque bersaglio con hp/shield, quindi si riusano direttamente su
     state.boss senza bisogno di una terza implementazione di applyDamage.
     ========================================================================= */

  function declareBossAttack(state, playerId, weapon) {
    const player = getPlayer(state, playerId);
    ensureCanAttack(player);
    const boss = state.boss;
    if (!boss || !boss.active || boss.hp <= 0 || boss.zoneId !== player.zoneId) throw new Error("Bersaglio boss non valido");
    const zone = getZone(state, player.zoneId);
    const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
    const aiuto = Boolean(state.pendingAiuto[playerId]);
    const effectBonus = (boss.suppressed ? 1 : 0) + (state.pendingStim[playerId] ? 1 : 0);
    boss.suppressed = false; // consumato ORA, alla dichiarazione, prima di qualunque dado
    const targetBelowHalfHp = boss.hp < boss.maxHp / 2;
    const diceCount = combat.computeDiceCount({
      baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange: zone.encounterRange,
      isRangeless, aiuto, effectBonus
    });
    return { kind: "player-vs-boss", playerId, weapon, encounterRange: zone.encounterRange, aiuto, effectBonus, targetBelowHalfHp, diceCount };
  }

  function finishPlayerAttackOnBoss(state, player, weapon, aiuto, outcome) {
    const boss = state.boss;
    applyDamage(boss, outcome); // stessa funzione condivisa hp/shield di sempre
    const defeated = boss.hp <= 0;

    if (outcome.appliesSuppressMarker) boss.suppressed = true;
    // areaDamage/chainStrike: il boss non ha altri "bersagli boss" nella
    // propria zona — i secondari, se presenti, non hanno un bersaglio valido
    // e restano semplicemente non applicati (stessa sorte che avrebbero
    // contro un nemico solitario senza compagni nella stessa zona).

    const zone = getZone(state, player.zoneId);
    zone.noiseTracker = combat.registerAttackNoise(zone.noiseTracker, outcome);

    if (aiuto) delete state.pendingAiuto[player.id];
    delete state.pendingStim[player.id];
    player.actedThisRound = true;
    player.offensiveSpentThisRound = true;
    player.contributions.damage += Math.max(0, outcome.total || 0);
    pushLog(state, `${player.name} attacca il boss: ${outcome.total} danni${defeated ? " (sconfitto)" : ""}`);
    checkVictoryOrDefeat(state);
    return { result: outcome, defeated };
  }

  function resolveBossAttackFromRolls(state, declared, rolls, rerollValues) {
    const player = getPlayer(state, declared.playerId);
    if (!player) throw new Error("Giocatore non più valido rispetto alla dichiarazione dell'attacco");

    const outcome = combat.resolveAttackFromRolls(
      { weapon: declared.weapon, encounterRange: declared.encounterRange, aiuto: declared.aiuto, effectBonus: declared.effectBonus, targetBelowHalfHp: declared.targetBelowHalfHp },
      rolls, rerollValues
    );
    if (outcome.status === "needs-reroll") return outcome;

    return Object.assign({ status: "resolved" }, finishPlayerAttackOnBoss(state, player, declared.weapon, declared.aiuto, outcome));
  }

  /* Wrapper di compatibilità per test/simulazioni (RNG, mai in partita reale). */
  function attackBossAction(state, playerId, weapon, rng) {
    const declared = declareBossAttack(state, playerId, weapon);
    const player = getPlayer(state, playerId);
    const roll = rng || Math.random;
    const outcome = combat.resolveAttack({
      weapon, encounterRange: declared.encounterRange, aiuto: declared.aiuto,
      effectBonus: declared.effectBonus, targetBelowHalfHp: declared.targetBelowHalfHp, rng: roll
    });
    return finishPlayerAttackOnBoss(state, player, weapon, declared.aiuto, outcome);
  }

  /* =========================================================================
     TEMPESTA — tabella fissa round-per-round, nessuna formula generica.
     ========================================================================= */
  const STORM_TABLE = {
    4: { ring: "esterno", state: "warning" },
    5: { ring: "esterno", state: "storm" },
    7: { ring: "esterno", state: "eliminated" },
    // round 7 dichiara ANCHE l'allerta interna
    8: { ring: "interno", state: "storm" },
    10: { ring: "interno", state: "eliminated" }
  };
  const STORM_TABLE_SECONDARY = { 7: { ring: "interno", state: "warning" } };
  const STORM_DAMAGE = { 5: 3, 6: 3, 8: 5, 9: 5 };

  function applyStormTransition(state, round) {
    const primary = STORM_TABLE[round];
    if (primary) state.zones.filter((z) => z.ring === primary.ring).forEach((z) => { z.stormState = primary.state; });
    const secondary = STORM_TABLE_SECONDARY[round];
    if (secondary) state.zones.filter((z) => z.ring === secondary.ring).forEach((z) => { z.stormState = secondary.state; });
  }

  /* Elimina immediatamente chiunque (active o ko) si trovi in una zona
     appena diventata "eliminated" in QUESTO round. */
  function eliminatePlayersInNewlyEliminatedZones(state, round) {
    const justEliminatedRings = [];
    if (STORM_TABLE[round] && STORM_TABLE[round].state === "eliminated") justEliminatedRings.push(STORM_TABLE[round].ring);
    if (!justEliminatedRings.length) return;
    state.zones.filter((z) => justEliminatedRings.includes(z.ring)).forEach((zone) => {
      playersInZone(state, zone.id).forEach((p) => {
        if (p.status !== "eliminated") {
          p.status = "eliminated";
          pushLog(state, `${p.name} eliminato: la zona ${zone.name} è stata inghiottita dalla Tempesta`);
        }
      });
    });
  }

  /* =========================================================================
     INIZIO ROUND
     ========================================================================= */
  function startRound(state, rng) {
    state.round += 1;
    applyStormTransition(state, state.round);
    eliminatePlayersInNewlyEliminatedZones(state, state.round);
    // Round di attivazione dalla configurazione (bossConfig.activationRound):
    // default 10 solo per compatibilità con i bossConfig di test che non lo
    // specificano. La Tempesta (STORM_TABLE) resta comunque fissa: per Map 01
    // activationRound=10 coincide non a caso con "interno eliminato".
    if (state.boss && !state.boss.active && state.round === (state.boss.config.activationRound || 10)) activateBoss(state);
    state.players.forEach((p) => { p.movedThisRound = false; p.actedThisRound = false; p.offensiveSpentThisRound = false; p.waitingForPartyThisRound = false; });
    state.enemies.forEach((e) => { e.respondedThisRound = false; });
    state.pendingAiuto = {};
  }

  function activateBoss(state) {
    const boss = state.boss;
    boss.active = true;
    boss.maxHp = boss.config.hpPerPlayer * state.initialPlayerCount;
    boss.hp = boss.maxHp;
    // Shield NON scala coi giocatori (a differenza dell'HP): resta un numero
    // esplicito di configurazione, provvisorio finché non si simula.
    boss.maxShield = boss.config.shield || 0;
    boss.shield = boss.maxShield;
    pushLog(state, `Il boss si attiva! HP: ${boss.maxHp}, Scudo: ${boss.maxShield}`);
  }

  /* =========================================================================
     FINE ROUND
     ========================================================================= */
  function endRound(state, rng) {
    const roll = rng || Math.random;

    // 1. Rumore/Rinforzi per ogni zona con nemici vivi
    state.zones.forEach((zone) => {
      if (!enemiesInZone(state, zone.id).length) return;
      const check = combat.checkReinforcements(zone.noiseTracker, roll);
      zone.noiseTracker = check.tracker;
      if (check.reinforcementArrived) spawnEnemy(state, "normale", zone.id);
    });

    // 2. Danno Tempesta: diretto alla Salute, ignora lo Scudo
    const dmg = STORM_DAMAGE[state.round];
    if (dmg) {
      state.zones.filter((z) => z.stormState === "storm").forEach((zone) => {
        activePlayersInZone(state, zone.id).forEach((p) => {
          p.hp = Math.max(0, p.hp - dmg);
          if (p.hp <= 0) setPlayerKO(state, p);
        });
      });
    }

    // 3. Combat V2: nessun countdown KO. Il giocatore resta a terra e
    // avrà un tentativo del destino al proprio turno, salvo sconfitta totale
    // del Party (tutti contemporaneamente KO/eliminati).

    // 4. Evocazione boss
    if (state.boss && state.boss.active && state.boss.hp > 0) {
      state.boss.roundsSinceActivation += 1;
      const every = state.boss.config.summonEvery || 3;
      if (state.boss.config.summonEvery && state.boss.roundsSinceActivation % every === 0) {
        spawnEnemy(state, state.boss.config.summonArchetype || "normale", state.boss.zoneId);
        pushLog(state, "Il boss evoca un rinforzo");
      }
    }

    // 5. Vittoria/sconfitta
    checkVictoryOrDefeat(state);
  }

  function spawnEnemy(state, archetype, zoneId, nodeId) {
    const def = DEFAULT_ENEMY_ARCHETYPES[archetype];
    if (!def) throw new Error("Archetipo nemico sconosciuto: " + archetype);
    const id = archetype + "_" + Math.random().toString(36).slice(2, 8);
    const identities = ENEMY_IDENTITIES[archetype] || [archetype];
    const identityIndex = state.enemyIdentityCounters[archetype] || 0;
    state.enemyIdentityCounters[archetype] = identityIndex + 1;
    state.enemies.push({
      id, name: identities[identityIndex % identities.length], archetype, zoneId, nodeId: nodeId || null, hp: def.hp, maxHp: def.hp,
      shield: def.shield || 0, maxShield: def.shield || 0,
      attackProfile: def.attackProfile, lastTargetId: null,
      suppressed: false, lootResolved: false, respondedThisRound: false
    });
    return id;
  }

  /* =========================================================================
     INCONTRO INIZIALE — al massimo UNA volta per zona, alla prima entrata di
     un giocatore (atterraggio o movimento, stessa funzione per entrambi).
     Mai un secondo spawn, anche dopo che la zona è stata ripulita: il flag
     initialEncounterSpawned (mai enemies.length, che dopo la pulizia torna a
     0) è marcato SUBITO, prima di spawnare, così due chiamate ravvicinate
     (es. due giocatori che atterrano di fila) non generano un doppione. La
     composizione (quali archetipi, quanti) è dato puro di zone.initialEncounter
     dal catalogo mappa: l'engine si limita a eseguirla, zero know-how di
     quale mappa/zona sia. I rinforzi (endRound) restano l'unico meccanismo
     successivo, invariato: qui si risolve solo la nascita del primo gruppo. */
  function ensureInitialEncounter(state, zoneId) {
    const zone = getZone(state, zoneId);
    if (!zone || zone.initialEncounterSpawned) return;
    zone.initialEncounterSpawned = true;
    (zone.initialEncounter || []).forEach((e) => spawnEnemy(state, e.archetype, zoneId));
  }

  /* =========================================================================
     NODE GRAPH (Zone Magnify V1) — per ogni zona con zone.nodes. Il catalogo (zone.nodes) resta dato statico, mai mutato: qui si
     legge soltanto.
     ========================================================================= */

  /* BFS pura sul grafo nodi di UNA zona — stesso pattern di bfsFrom (sopra,
     zone-level), qui applicato a zone.nodes invece che a state.zones. Vicini
     ordinati per id (mai un ordine di iterazione implicito): deterministica.
     Le coordinate x/y dei nodi (solo visuali) non entrano MAI in questo
     calcolo — la distanza è sempre "numero di collegamenti". */
  function nodeBfsFrom(zone, startId) {
    const dist = { [startId]: 0 };
    const prev = {};
    const queue = [startId];
    while (queue.length) {
      const cur = queue.shift();
      const node = zone.nodes.find((n) => n.id === cur);
      if (!node) continue;
      const neighbors = Object.values(node.connections || {}).slice().sort();
      neighbors.forEach((n) => {
        if (!(n in dist)) { dist[n] = dist[cur] + 1; prev[n] = cur; queue.push(n); }
      });
    }
    return { dist, prev };
  }

  /* Distanza (numero di collegamenti) tra due nodi della STESSA zona.
     null = non raggiungibile (grafo disconnesso) o zona senza Node Graph:
     il chiamante decide sempre esplicitamente il fallback, mai un valore
     inventato qui. */
  function getNodeDistance(zone, fromNodeId, toNodeId) {
    if (!zone || !zone.nodes || fromNodeId == null || toNodeId == null) return null;
    if (fromNodeId === toNodeId) return 0;
    const { dist } = nodeBfsFrom(zone, fromNodeId);
    return Object.prototype.hasOwnProperty.call(dist, toNodeId) ? dist[toNodeId] : null;
  }

  /* V1 (unica regola, mai coordinate x/y): stesso nodo -> vicino,
     1 collegamento -> medio, 2+ -> lontano. */
  function nodeDistanceToRange(distance) {
    if (distance == null) return null;
    if (distance === 0) return "vicino";
    if (distance === 1) return "medio";
    return "lontano";
  }

  /* Gittata Encounter di una coppia soggetto/bersaglio: deriva dalla
     distanza reale nel Node Graph quando ENTRAMBI hanno nodeId in una zona
     con zone.nodes; altrimenti (boss, zone legacy, entità senza nodeId)
     resta il comportamento di sempre, zone.encounterRange. Unico punto che
     decide "quale gittata usare per questo attacco": mai duplicato. */
  function resolveEncounterRange(zone, subjectNodeId, targetNodeId) {
    if (zone.nodes && subjectNodeId != null && targetNodeId != null) {
      const range = nodeDistanceToRange(getNodeDistance(zone, subjectNodeId, targetNodeId));
      if (range) return range;
    }
    return zone.encounterRange;
  }

  /* Primo passo (un solo nodo) del percorso più breve verso toNodeId,
     stesso pattern "risali la catena prev" già usato da
     nearestZoneWithActivePlayer (sotto, livello zona). null se già lì o non
     raggiungibile: mai un passo inventato. */
  function firstNodeStepToward(zone, fromNodeId, toNodeId) {
    if (!zone.nodes || fromNodeId == null || toNodeId == null || fromNodeId === toNodeId) return null;
    const { dist, prev } = nodeBfsFrom(zone, fromNodeId);
    if (!Object.prototype.hasOwnProperty.call(dist, toNodeId)) return null;
    let step = toNodeId;
    while (prev[step] !== fromNodeId && prev[step] !== undefined) step = prev[step];
    return step;
  }

  /* Nemici della zona davvero raggiungibili da un nodo (Node Graph):
     enemiesInZone filtrata per distanza risolvibile. Zone legacy/nodeId
     assente: invariato, l'intera zona (stesso comportamento di sempre). */
  function enemiesReachableFromNode(state, zoneId, nodeId) {
    const zone = getZone(state, zoneId);
    const all = enemiesInZone(state, zoneId);
    if (!zone.nodes || nodeId == null) return all;
    return all.filter((e) => getNodeDistance(zone, nodeId, e.nodeId) != null);
  }

  /* Assegna deterministicamente le casse REALMENTE generate da
     loot.setupChests (mai un numero deciso qui) agli chestSlot dei nodi,
     nell'ordine slot crescente. Zone senza zone.nodes: no-op. Se una zona
     avesse più casse che slot, le eccedenti restano senza nodeId (mai perse:
     restano aperte/raccoglibili a livello zona, comportamento legacy) — per
     Forest oggi lootTier "basso" produce sempre esattamente 1 cassa, uguale
     al numero di chestSlot disponibili. */
  function assignChestsToNodeSlots(zone) {
    if (!zone.nodes) return;
    const slots = [];
    zone.nodes.forEach((n) => (n.contents || []).forEach((c) => {
      if (c.type === "chestSlot") slots.push({ nodeId: n.id, slot: c.slot });
    }));
    slots.sort((a, b) => a.slot - b.slot);
    zone.chests.forEach((chest, i) => { if (slots[i]) chest.nodeId = slots[i].nodeId; });
  }

  /* Multi-node Encounter V1 — stesso pattern sicuro di ensureInitialEncounter
     ("già generato" marcato SUBITO, mai un secondo spawn anche dopo la
     pulizia — mai enemiesInZone/enemiesAtNode, che tornerebbero a 0), ma
     scope a livello ZONA (zone.encounterSpawned), non più per nodo: resta
     "1 Encounter per zona" anche quando la sua composizione copre più nodi
     (zone.encounter.composition, dato puro del catalogo — ogni entry porta
     già il proprio nodeId). L'intero Encounter viene generato appena si entra
     nella zona Node Graph: in questo modo la mappa locale mostra subito i
     pericoli reali sui nodi, senza marker cosmetici o nemici fantasma. */
  function ensureNodeEncounter(state, zoneId, nodeId) {
    const zone = getZone(state, zoneId);
    if (!zone || !zone.encounter || zone.encounterSpawned) return;
    const composition = zone.encounter.composition || [];
    zone.encounterSpawned = true;
    composition.forEach((e) => spawnEnemy(state, e.archetype, zoneId, e.nodeId));
  }

  /* Unica funzione autorevole per il movimento a nodi, quattro direzioni
     fisse. La destinazione viene ESCLUSIVAMENTE da currentNode.connections
     (mai calcolata altrimenti), il target deve esistere nella stessa zona.
     Stesso movedThisRound di moveAction (World): nessun budget separato, un
     solo movimento per round in totale, world o nodo che sia. */
  function moveToNode(state, playerId, direction) {
    const player = getPlayer(state, playerId);
    if (!player || player.present === false || player.status !== "active") throw new Error("Giocatore non attivo");
    if (player.movedThisRound) throw new Error("Movimento già usato in questo round");
    const zone = getZone(state, player.zoneId);
    if (!zone || !zone.nodes) throw new Error("La zona corrente non ha un Node Graph");
    const currentNode = zone.nodes.find((n) => n.id === player.nodeId);
    if (!currentNode) throw new Error("Nodo corrente inesistente");
    const targetNodeId = currentNode.connections && currentNode.connections[direction];
    if (!targetNodeId) throw new Error("Nessun collegamento in quella direzione");
    const targetNode = zone.nodes.find((n) => n.id === targetNodeId);
    if (!targetNode) throw new Error("Nodo di destinazione inesistente");
    player.nodeId = targetNodeId;
    player.hiddenInShelter = false;
    player.hiddenNodeId = null;
    player.movedThisRound = true;
    ensureNodeEncounter(state, zone.id, targetNodeId);
    return { player };
  }

  /* =========================================================================
     PARTY — mai una struttura persistita: si deriva sempre da zoneId+status.
     getActivePartyMembers è lo stesso alias di activePlayersInZone (nessuna
     seconda implementazione): 1 solo attivo nella zona = "solo", 2+ = "party".
     Un giocatore KO resta fisicamente nella zona ma non è mai un membro
     attivo del Party.
     ========================================================================= */
  const getActivePartyMembers = activePlayersInZone;

  function isSolo(state, playerId) {
    const player = getPlayer(state, playerId);
    if (!player) throw new Error("Giocatore inesistente");
    return getActivePartyMembers(state, player.zoneId).length <= 1;
  }

  function isInParty(state, playerId) {
    return !isSolo(state, playerId);
  }

  function checkVictoryOrDefeat(state) {
    if (state.boss && state.boss.active && state.boss.hp <= 0 && state.phase !== "vittoria") {
      state.phase = "vittoria"; state.winner = "squadra";
      pushLog(state, "Il boss è sconfitto! La squadra vince.");
      return;
    }
    const presentPlayers = state.players.filter(isPresentPlayer);
    if (presentPlayers.length && presentPlayers.every((p) => p.status === "ko" || p.status === "eliminated") && state.phase !== "sconfitta") {
      state.phase = "sconfitta"; state.winner = "sistema";
      pushLog(state, "Tutta la squadra è a terra: fine run.");
    }
  }

  return {
    DEFAULT_ENEMY_ARCHETYPES, ENEMY_IDENTITIES, STORM_TABLE, STORM_DAMAGE,
    createDefaultZoneLayout, createGame, createRuntimePlayer, setPlayerPresence,
    getPlayer, getZone, getEnemy, isPresentPlayer, playersInZone, activePlayersInZone, enemiesInZone, enemiesAtNode, activePlayers,
    getNodeDistance, nodeDistanceToRange, resolveEncounterRange, firstNodeStepToward, enemiesReachableFromNode,
    getActivePartyMembers, isSolo, isInParty,
    getActiveShelters, getShelterAtNode, ensureShelterOpportunity, hideInShelterAction, placeTrapAction,
    ensurePartyBoostOpportunity, getPartyBoostEvent, partyBoostParticipants, resolvePartyBoost, getPartyBoostCharges,
    getOperationalStructure, getStructurePhaseOrder, prepareStructureStep, resolveStructureStepFromRolls, ensureVehicleOpportunity, availableVehicleCrew, boardVehicleCrew, resolveVehicleSalvo, damageStructureWithWeapon, closeVehicleVisitIfEmpty,
    landPlayer, resolveLandingRoll, allPlayersLanded, beginExploration,
    moveAction, moveToNode, aiutoAction, attendiSquadraAction,
    previewPlayerAttack, declarePlayerAttack, resolvePlayerAttackFromRolls, attackEnemyAction,
    declareTeamAttack, resolveTeamAttackFromRolls, applyCombatReaction, fumogenoRetreatAction, markCounterattack,
    previewBossAttack, declareBossAttack, resolveBossAttackFromRolls, attackBossAction,
    rianimaAction, destinyReviveAction, scambiaAction, usaCuraAction, usaScudoAction, usaUtilityAction, interagisciAction, apriCassaAction,
    equipFoundWeapon, equipFoundSupportItem, collectGiftWeapon, resolveEnemyDeathLoot,
    bfsFrom, nearestZoneWithActivePlayer, pickTarget,
    getEnemyPhaseOrder, prepareEnemyStep, prepareEnemyResponseToAttacker, resolvePreparedEnemyOutcomeFromRolls, resolveEnemyStepFromRolls,
    resolveEnemyReactionFromRolls, resolveCounterattackAgainstOutcomeFromRolls, resolveCounterattackFromRolls, resolveEnemyStep, resolveEnemyPhase,
    prepareBossStep, resolveBossStepFromRolls, resolveBossStep, resolveBossPhase,
    startRound, endRound, activateBoss, spawnEnemy, ensureInitialEncounter,
    ensureNodeEncounter, assignChestsToNodeSlots,
    checkVictoryOrDefeat, applyDamage, applyDamageToPlayer, applyDamageToEnemy, setPlayerKO
  };
});
