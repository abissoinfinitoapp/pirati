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
      hp: 10, shield: 0, movement: "static",
      attackProfile: { baseDice: 1, power: 2, range: "medio", special: { type: "none" } }
    },
    aggressivo: {
      hp: 10, shield: 0, movement: "chase",
      attackProfile: { baseDice: 2, power: 1, range: "vicino", special: { type: "rerollOnes" } }
    },
    resistente: {
      hp: 20, shield: 5, movement: "static",
      attackProfile: { baseDice: 1, power: 3, range: "medio", special: { type: "ignoreShield", n: 1 } }
    },
    distanza: {
      hp: 10, shield: 2, movement: "static",
      attackProfile: { baseDice: 1, power: 3, range: "lontano", special: { type: "critOnSix" } }
    },
    elite: {
      hp: 36, shield: 6, movement: "static",
      attackProfile: { baseDice: 2, power: 3, range: "medio", special: { type: "areaDamage" } }
    }
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
  const playersInZone = (state, zoneId) => state.players.filter((p) => p.zoneId === zoneId);
  const activePlayersInZone = (state, zoneId) => playersInZone(state, zoneId).filter((p) => p.status === "active");
  const enemiesInZone = (state, zoneId) => state.enemies.filter((e) => e.zoneId === zoneId && e.hp > 0);
  // Node Graph: filtro fine per interazioni node-local (ATTACCA in Forest).
  // enemiesInZone resta l'unica lettura di Battlefield/Enemy phase, invariata.
  const enemiesAtNode = (state, zoneId, nodeId) => state.enemies.filter((e) => e.zoneId === zoneId && e.nodeId === nodeId && e.hp > 0);
  const activePlayers = (state) => state.players.filter((p) => p.status === "active");

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
    zoneList.forEach(assignChestsToNodeSlots); // no-op sulle zone senza nodes[]
    return {
      phase: "atterraggio",
      round: 0,
      initialPlayerCount: players.length,
      players: players.map((p) => ({
        id: p.id, name: p.name, status: "active",
        zoneId: null,
        nodeId: null, // Node Graph (Zone Magnify): valido solo se zoneId ha zone.nodes; null altrove
        hp: 10, shield: 10,
        koRoundsRemaining: null, koSinceRound: null,
        movedThisRound: false, actedThisRound: false,
        equipment: { primary: null, secondary: null, cura: null, scudo: null, utility: null },
        collectedWeaponIds: [] // run-level: mai la starter, serve solo allo sblocco a vittoria
      })),
      zones: zoneList,
      enemies: [],
      // zoneId viene SEMPRE dalla configurazione mappa/boss (bossConfig.zoneId):
      // l'engine non conosce alcun nome di zona reale. Il default "centro"
      // resta solo per compatibilità con i test che usano ancora
      // createDefaultZoneLayout() senza specificare zoneId esplicitamente.
      boss: bossConfig ? { active: false, hp: 0, maxHp: 0, shield: 0, maxShield: 0, config: bossConfig, phaseIndex: 0, roundsSinceActivation: 0, zoneId: bossConfig.zoneId || "centro", lastTargetId: null, suppressed: false, noiseTracker: combat.createNoiseTracker() } : null,
      pendingAiuto: {}, // playerId aiutato -> true, consumato dal suo prossimo attacco, azzerato a inizio round
      pendingStim: {}, // playerId -> true, consumato dal SUO prossimo attacco (mai azzerato a inizio round: sopravvive fino a quando serve)
      lootRegistry: loot.createLootRegistry(), // { seenWeaponIds, nextInstanceId }: run-level, mai per-zona/per-giocatore
      log: [],
      winner: null
    };
  }

  /* =========================================================================
     ATTERRAGGIO — solo zone esterne, nessun dado. L'arrivo usa la stessa
     procedura "entra in zona" di ogni movimento successivo.
     ========================================================================= */
  function landPlayer(state, playerId, zoneId, rng) {
    const player = getPlayer(state, playerId);
    const zone = getZone(state, zoneId);
    if (!player || !zone) throw new Error("Giocatore o zona inesistente");
    if (zone.ring !== "esterno") throw new Error("Si può atterrare solo in una zona esterna");
    player.zoneId = zoneId;
    enterZone(state, player, zone);
    const lootFound = enterZoneAmbient(state, zone, rng);
    return { player, lootFound };
  }

  function allPlayersLanded(state) {
    return state.players.every((p) => p.zoneId !== null);
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
  function pushGroundLoot(state, zone, descriptor, nodeId) {
    const entry = Object.assign({ instanceId: loot.nextGroundLootInstanceId(state.lootRegistry) }, descriptor);
    if (nodeId) entry.nodeId = nodeId; // Node Graph: solo chi lo passa esplicitamente (oggi solo apriCassaAction)
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
     MOVIMENTO
     ========================================================================= */
  function moveAction(state, playerId, targetZoneId, rng) {
    const player = getPlayer(state, playerId);
    if (!player || player.status !== "active") throw new Error("Giocatore non attivo");
    if (player.movedThisRound) throw new Error("Movimento già usato in questo round");
    const currentZone = getZone(state, player.zoneId);
    if (!currentZone.connections.includes(targetZoneId)) throw new Error("Zona non collegata");
    const target = getZone(state, targetZoneId);
    if (target.stormState === "storm" || target.stormState === "eliminated") {
      throw new Error("Non si può entrare volontariamente in una zona in Tempesta o eliminata");
    }
    player.zoneId = targetZoneId;
    player.movedThisRound = true;
    // Stessa funzione condivisa con landPlayer: sia "l'ingresso zona" (Node
    // Graph o incontro iniziale legacy) sia "un solo loot ambientale per
    // zona" vivono in un'unica implementazione, mai duplicate tra atterraggio
    // e movimento World.
    enterZone(state, player, target);
    const lootFound = enterZoneAmbient(state, target, rng);
    return { player, lootFound };
  }

  /* =========================================================================
     INGRESSO ZONA — unico punto usato da landPlayer/moveAction. Se la zona ha
     un Node Graph (zone.nodes, oggi solo Forest) posiziona il player
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
    if (!player || player.status !== "active") throw new Error("Giocatore non attivo");
    if (player.actedThisRound) throw new Error("Azione principale già usata in questo round");
  }

  function aiutoAction(state, helperId, targetId) {
    const helper = getPlayer(state, helperId);
    ensureCanAct(helper);
    const target = getPlayer(state, targetId);
    if (!target || target.zoneId !== helper.zoneId) throw new Error("Aiuta richiede la stessa zona");
    state.pendingAiuto[targetId] = true;
    helper.actedThisRound = true;
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
    ensureCanAct(player);
    const enemy = getEnemy(state, enemyId);
    if (!enemy || enemy.zoneId !== player.zoneId || enemy.hp <= 0) throw new Error("Bersaglio non valido");
    const zone = getZone(state, player.zoneId);
    // Node Graph: un bersaglio nella stessa zona ma su un nodo irraggiungibile
    // (grafo disconnesso) resta comunque rifiutato — "stessa zona" non basta
    // più da sola a garantire che l'attacco sia davvero possibile.
    if (zone.nodes && player.nodeId != null && enemy.nodeId != null
      && getNodeDistance(zone, player.nodeId, enemy.nodeId) == null) {
      throw new Error("Bersaglio non raggiungibile da qui");
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
  function resolveEnemyDeathLoot(state, enemy, lootRng) {
    if (enemy.hp > 0 || enemy.lootResolved) return null;
    enemy.lootResolved = true;
    const zone = getZone(state, enemy.zoneId);
    const roll = lootRng || Math.random;
    const drop = enemy.archetype === "elite"
      ? loot.rollEliteLoot(zone.danger, roll, state.lootRegistry)
      : { support: loot.rollNormalEnemyLoot(zone.danger, roll) };
    const entries = [];
    if (drop.weapon) entries.push(pushGroundLoot(state, zone, drop.weapon));
    if (drop.support) entries.push(pushGroundLoot(state, zone, drop.support));
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
    const primaryDrop = resolveEnemyDeathLoot(state, enemy, lootRng);
    if (primaryDrop) lootFound.push(primaryDrop);

    if (outcome.secondaryHits && outcome.secondaryHits.length) {
      const others = enemiesInZone(state, enemy.zoneId).filter((e) => e.id !== enemy.id);
      applySecondaryHits(outcome.secondaryHits, others, (target, amount) => {
        applyDamageToEnemy(target, { total: amount, ignoreShieldN: 0 });
        const drop = resolveEnemyDeathLoot(state, target, lootRng);
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
    pushLog(state, `${player.name} attacca ${enemy.archetype || "il nemico"}: ${outcome.total} danni${eliminated ? " (eliminato)" : ""}`);
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

  function rianimaAction(state, playerId, targetId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const target = getPlayer(state, targetId);
    if (!target || target.status !== "ko" || target.zoneId !== player.zoneId) throw new Error("Rianimazione non valida");
    target.status = "active";
    target.hp = 5;
    target.shield = 0;
    target.koRoundsRemaining = null;
    target.koSinceRound = null;
    player.actedThisRound = true;
    pushLog(state, `${player.name} rianima ${target.name}`);
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
    const item = from.equipment[slot];
    if (item === undefined) throw new Error("Slot inesistente");
    if (!item) throw new Error("Niente da scambiare in questo slot");
    const zone = getZone(state, from.zoneId);
    const previous = to.equipment[slot];
    to.equipment[slot] = item;
    from.equipment[slot] = null;
    if (previous) {
      const kind = slotToLootKind(slot);
      pushGroundLoot(state, zone, kind === "weapon" ? { kind, weaponId: previous.id } : { kind, itemId: previous.id });
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
  function usaUtilityAction(state, playerId, targetZoneId) {
    const player = getPlayer(state, playerId);
    ensureCanAct(player);
    const item = player.equipment.utility;
    if (!item) throw new Error("Nessuna Utility equipaggiata");
    let result;
    if (item.id === "scanner") {
      const zone = getZone(state, player.zoneId);
      if (!targetZoneId || zone.connections.indexOf(targetZoneId) === -1) throw new Error("Serve una zona adiacente");
      const targetZone = getZone(state, targetZoneId);
      if (targetZone.stormState === "eliminated") throw new Error("Zona non più raggiungibile");
      result = {
        type: "scanner", zoneId: targetZoneId,
        enemyCount: enemiesInZone(state, targetZoneId).length,
        chestCount: (targetZone.chests || []).filter((c) => !c.opened).length
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
    const found = loot.rollChestLoot(zone.danger, roll, state.lootRegistry);
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
    if (!player || player.status !== "active") throw new Error("Giocatore non attivo");
    const zone = getZone(state, player.zoneId);
    // Node Graph: un'entry con nodeId (es. il drop di una cassa, §9) si può
    // raccogliere solo dallo stesso nodo. Entry senza nodeId (comportamento
    // legacy, es. loot ambientale) restano raccoglibili da tutta la zona.
    const idx = zone.groundLoot.findIndex((g) => g.instanceId === groundLootInstanceId && (g.nodeId == null || g.nodeId === player.nodeId));
    if (idx === -1 || zone.groundLoot[idx].kind !== "weapon") throw new Error("Arma non trovata a terra in questa zona");
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
  function equipFoundSupportItem(state, playerId, slot, groundLootInstanceId, itemObject) {
    if (slot !== "cura" && slot !== "scudo" && slot !== "utility") throw new Error("Slot supporto non valido: " + slot);
    const player = getPlayer(state, playerId);
    if (!player || player.status !== "active") throw new Error("Giocatore non attivo");
    const zone = getZone(state, player.zoneId);
    const idx = zone.groundLoot.findIndex((g) => g.instanceId === groundLootInstanceId && (g.nodeId == null || g.nodeId === player.nodeId));
    if (idx === -1 || zone.groundLoot[idx].kind !== slot) throw new Error("Oggetto non trovato a terra in questa zona");
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
    return state.enemies.filter((e) => e.hp > 0).sort((a, b) => (a.id < b.id ? -1 : 1)).map((e) => e.id);
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

    const reachable = candidates
      .map((p) => ({ player: p, distance: getNodeDistance(zone, enemy.nodeId, p.nodeId) }))
      .filter((c) => c.distance != null);
    const attackable = isMelee ? reachable.filter((c) => c.distance === 0) : reachable;

    if (attackable.length) {
      const minDistance = Math.min.apply(null, attackable.map((c) => c.distance));
      const nearest = attackable.filter((c) => c.distance === minDistance).map((c) => c.player);
      const target = pickTarget(nearest, enemy.lastTargetId);
      const encounterRange = resolveEncounterRange(zone, enemy.nodeId, target.nodeId);
      const isRangeless = Boolean(weapon.special && weapon.special.type === "rangeless");
      const effectBonus = zone.smokeActive ? -1 : 0; // vedi nota Fumogeno sopra: solo se davvero un attacco
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
        return { type: "move", enemyId: enemy.id, fromNodeId, toNodeId: enemy.nodeId };
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
  function resolveEnemyStepFromRolls(state, prepared, rolls, rerollValues) {
    if (prepared.type !== "attack") throw new Error("Questo step non prevede un tiro di dadi");
    const outcome = combat.resolveAttackFromRolls(
      { weapon: prepared.weapon, encounterRange: prepared.encounterRange, effectBonus: prepared.effectBonus },
      rolls, rerollValues
    );
    if (outcome.status === "needs-reroll") return outcome;

    const enemy = getEnemy(state, prepared.enemyId);
    const target = getPlayer(state, prepared.targetId);
    if (!enemy || !target) throw new Error("Nemico o bersaglio non più validi rispetto alla preparazione dello step");
    return Object.assign({ status: "resolved" }, applyEnemyAttackOutcome(state, enemy, target, outcome));
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
    player.koRoundsRemaining = 3;
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
    ensureCanAct(player);
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
    state.players.forEach((p) => { p.movedThisRound = false; p.actedThisRound = false; });
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

    // 3. Countdown KO — chi è entrato in KO in QUESTO round non perde nulla ora
    state.players.filter((p) => p.status === "ko").forEach((p) => {
      if (p.koSinceRound === state.round) return;
      p.koRoundsRemaining -= 1;
      const zone = getZone(state, p.zoneId);
      if (zone.stormState === "storm") p.koRoundsRemaining -= 1;
      if (p.koRoundsRemaining <= 0) { p.status = "eliminated"; pushLog(state, `${p.name} eliminato: nessuno lo ha rianimato in tempo`); }
    });

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
    const id = archetype + "_" + Math.random().toString(36).slice(2, 8);
    state.enemies.push({
      id, archetype, zoneId, nodeId: nodeId || null, hp: def.hp, maxHp: def.hp,
      shield: def.shield || 0, maxShield: def.shield || 0,
      attackProfile: def.attackProfile, lastTargetId: null,
      suppressed: false, lootResolved: false
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
     NODE GRAPH (Zone Magnify V1) — solo per zone con zone.nodes (oggi solo
     Forest). Il catalogo (zone.nodes) resta dato statico, mai mutato: qui si
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
    if (!player || player.status !== "active") throw new Error("Giocatore non attivo");
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
    if (state.players.length && state.players.every((p) => p.status === "eliminated") && state.phase !== "sconfitta") {
      state.phase = "sconfitta"; state.winner = "sistema";
      pushLog(state, "Tutta la squadra è stata eliminata.");
    }
  }

  return {
    DEFAULT_ENEMY_ARCHETYPES, STORM_TABLE, STORM_DAMAGE,
    createDefaultZoneLayout, createGame,
    getPlayer, getZone, getEnemy, playersInZone, activePlayersInZone, enemiesInZone, enemiesAtNode, activePlayers,
    getNodeDistance, nodeDistanceToRange, resolveEncounterRange, firstNodeStepToward, enemiesReachableFromNode,
    getActivePartyMembers, isSolo, isInParty,
    landPlayer, allPlayersLanded, beginExploration,
    moveAction, moveToNode, aiutoAction,
    previewPlayerAttack, declarePlayerAttack, resolvePlayerAttackFromRolls, attackEnemyAction,
    previewBossAttack, declareBossAttack, resolveBossAttackFromRolls, attackBossAction,
    rianimaAction, scambiaAction, usaCuraAction, usaScudoAction, usaUtilityAction, interagisciAction, apriCassaAction,
    equipFoundWeapon, equipFoundSupportItem, resolveEnemyDeathLoot,
    bfsFrom, nearestZoneWithActivePlayer, pickTarget,
    getEnemyPhaseOrder, prepareEnemyStep, resolveEnemyStepFromRolls, resolveEnemyStep, resolveEnemyPhase,
    prepareBossStep, resolveBossStepFromRolls, resolveBossStep, resolveBossPhase,
    startRound, endRound, activateBoss, spawnEnemy, ensureInitialEncounter,
    ensureNodeEncounter, assignChestsToNodeSlots,
    checkVictoryOrDefeat, applyDamage, applyDamageToPlayer, applyDamageToEnemy, setPlayerKO
  };
});
