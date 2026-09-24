/* =============================================================================
   Fortress Army — Turn Director (motore puro della regia di partita).

   Nessun DOM, nessuna grafica. Trasforma le regole già presenti in
   engine/fortress-loop.js (che resta l'unica fonte delle regole) in un
   flusso guidato "un giocatore alla volta, un evento alla volta" adatto a
   essere condotto da un Master con dei bambini.

   TUTTI I DADI SONO FISICI: durante una partita reale il Director non genera
   mai un risultato di dado. Chiede quanti dadi servono (diceCount), il
   Master/bambino li tira fisicamente, il Director riceve i risultati e li fa
   risolvere dal motore (loop.*FromRolls, che a sua volta riusa esattamente
   combat.resolveAttackFromRolls). L'RNG resta disponibile SOLO nelle funzioni
   del loop pensate per test/simulazione (attackEnemyAction, attackBossAction,
   resolveEnemyStep, resolveBossStep) — il Director non le usa mai.

   Il Director tiene SOLO un cursore proprio (ordine turni, fase, coda
   annunci, tiro in corso) — mai una copia di gameState. Ogni mutazione reale
   passa sempre da una funzione del loop: il Director stesso non assegna mai
   direttamente un campo di gameState.

   Compatibile Node (require, per i test) e browser (window.FORTRESS_*).
   ========================================================================= */
(function (root, factory) {
  const loop = typeof module === "object" && module.exports
    ? require("./fortress-loop.js")
    : root.FORTRESS_LOOP;
  const api = factory(loop);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FORTRESS_DIRECTOR = api;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function (loop) {
  "use strict";

  /* =========================================================================
     CREAZIONE / ORDINE TURNI
     ========================================================================= */

  /* Ordine fisso, salvato come soli id (mai una copia dei dati giocatore):
     lo snapshot di state.players al momento in cui inizia l'esplorazione.
     Non ruota mai round dopo round. È la sola sorgente d'ordine usata per
     costruire roundPlayerQueue a ogni round: mai riordinata direttamente. */
  function createDirectorState(state) {
    return {
      turnOrder: state.players.map((p) => p.id),
      roundPlayerQueue: [], // congelata a ogni startPlayerTurnPhase, vedi buildRoundPlayerQueue
      currentPlayerIndex: -1,
      directorPhase: "round-announcement",
      pendingAnnouncements: [{ type: "round-start", payload: { round: state.round } }],
      enemyPhase: null,
      awaitingRoll: null,
      lastStepResult: null
    };
  }

  /* =========================================================================
     CAMPI DI BATTAGLIA (derivati, mai persistiti) — zoneId È l'identità del
     Campo. Un Campo esiste quando la zona ha almeno un giocatore active/non-KO
     E almeno un nemico vivo o il Boss attivo/vivo lì. Riusa solo query già
     esistenti nel loop (activePlayersInZone/enemiesInZone): nessuna nuova
     regola di simulazione, solo una vista di orchestrazione del Director.
     ========================================================================= */
  function isBattlefield(state, zoneId) {
    if (!loop.activePlayersInZone(state, zoneId).length) return false;
    if (loop.enemiesInZone(state, zoneId).length) return true;
    const boss = state.boss;
    return Boolean(boss && boss.active && boss.hp > 0 && boss.zoneId === zoneId);
  }

  /* Costruisce la queue giocatori di QUESTO round, una volta sola, deterministica
     (nessun random): raggruppa gli attivi per zona nell'ordine di turnOrder,
     tiene solo le zone che sono davvero Campi, alterna i Campi "a colonne"
     (un membro per Campo, poi il secondo, ecc. — mai tutto un Campo di fila),
     poi accoda in fondo chi non apparteneva a nessun Campo, nell'ordine
     originale di turnOrder. Ogni giocatore attivo compare ESATTAMENTE una
     volta nell'array risultante. */
  function buildRoundPlayerQueue(state, turnOrder) {
    const membersByZone = {};
    const zoneOrder = [];
    turnOrder.forEach((playerId) => {
      const player = loop.getPlayer(state, playerId);
      if (!player || player.status !== "active") return;
      if (!membersByZone[player.zoneId]) { membersByZone[player.zoneId] = []; zoneOrder.push(player.zoneId); }
      membersByZone[player.zoneId].push(playerId);
    });

    const battlefieldZones = zoneOrder.filter((zoneId) => isBattlefield(state, zoneId));

    const queue = [];
    const placed = new Set();
    const cursors = {};
    battlefieldZones.forEach((zoneId) => { cursors[zoneId] = 0; });
    let added = true;
    while (added) {
      added = false;
      battlefieldZones.forEach((zoneId) => {
        const members = membersByZone[zoneId];
        const idx = cursors[zoneId];
        if (idx < members.length) {
          queue.push(members[idx]);
          placed.add(members[idx]);
          cursors[zoneId] += 1;
          added = true;
        }
      });
    }

    turnOrder.forEach((playerId) => {
      const player = loop.getPlayer(state, playerId);
      if (player && player.status === "active" && !placed.has(playerId)) queue.push(playerId);
    });

    return queue;
  }

  function getCurrentPlayerId(state, dir) {
    if (dir.directorPhase !== "player-turn") return null;
    return dir.roundPlayerQueue[dir.currentPlayerIndex] || null;
  }

  function getCurrentPlayer(state, dir) {
    const id = getCurrentPlayerId(state, dir);
    return id ? loop.getPlayer(state, id) : null;
  }

  /* Primo/prossimo indice in `queue` il cui giocatore è status === "active",
     scansionando SENZA giro (mai wraparound): serve a sapere sia "chi tocca
     ora" sia "la queue di questo round è finita" (ritorna -1). KO ed eliminati
     vengono sempre saltati automaticamente — la queue è congelata ma ogni
     elemento è validato SOLO quando gli tocca, mai in anticipo. */
  function advanceIndex(state, queue, fromIndex) {
    for (let i = fromIndex; i < queue.length; i++) {
      const player = loop.getPlayer(state, queue[i]);
      if (player && player.status === "active") return i;
    }
    return -1;
  }

  /* Costruisce roundPlayerQueue UNA VOLTA, a inizio della fase giocatori del
     round: mai ricostruita dopo (niente riordinamenti/duplicazioni). Se un
     Campo termina o un giocatore entra in uno nuovo a metà round, se ne
     accorgerà la queue del round SUCCESSIVO, mai questa. */
  function startPlayerTurnPhase(state, dir) {
    dir.roundPlayerQueue = buildRoundPlayerQueue(state, dir.turnOrder);
    const firstActive = advanceIndex(state, dir.roundPlayerQueue, 0);
    if (firstActive === -1) {
      // nessun giocatore attivo: la vittoria/sconfitta è già gestita da
      // resolveEndOfRound, ma per sicurezza il Director non resta bloccato
      dir.currentPlayerIndex = dir.roundPlayerQueue.length;
      beginEnemyPhase(state, dir);
      return;
    }
    dir.currentPlayerIndex = firstActive;
    dir.directorPhase = "player-turn";
  }

  /* =========================================================================
     GUARDIE INTERNE
     ========================================================================= */

  function assertCurrentPlayer(state, dir, playerId) {
    const currentId = getCurrentPlayerId(state, dir);
    if (playerId !== currentId) {
      throw new Error(`Non è il turno di questo giocatore: tocca a ${currentId || "nessuno"}`);
    }
  }

  function assertPlayerTurnPhase(dir) {
    if (dir.directorPhase !== "player-turn") {
      throw new Error(`Nessuna azione giocatore possibile in fase "${dir.directorPhase}"`);
    }
  }

  function assertNoPendingAnnouncements(dir) {
    if (dir.pendingAnnouncements.length) {
      throw new Error("Ci sono annunci da confermare (PROSEGUI) prima di continuare");
    }
  }

  function assertNoAwaitingRoll(dir) {
    if (dir.awaitingRoll) {
      throw new Error("C'è già un tiro fisico in attesa: completalo prima di iniziarne un altro");
    }
  }

  /* =========================================================================
     SITUAZIONE / AZIONI DISPONIBILI (viste derivate, mai una copia)
     ========================================================================= */

  function getSituation(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const boss = state.boss;
    return {
      zoneId: zone.id, zoneName: zone.name, danger: zone.danger,
      encounterRange: zone.encounterRange, stormState: zone.stormState,
      nodeId: player.nodeId, // Node Graph (Zone Magnify): null nelle zone legacy
      enemies: loop.enemiesInZone(state, zone.id).map((e) => ({
        id: e.id, archetype: e.archetype, hp: e.hp, maxHp: e.maxHp, shield: e.shield, maxShield: e.maxShield
      })),
      bossHere: Boolean(boss && boss.active && boss.hp > 0 && boss.zoneId === zone.id),
      // sameNode: SOLO informativo (mai letto da Party/Director/azioni, che
      // restano invariati). Nelle zone senza Node Graph è sempre true (stesso
      // testo "è qui" di sempre); nelle zone con Node Graph distingue chi è
      // fisicamente vicino da chi è solo nella stessa zona, perché il testo
      // non deve suggerire una prossimità che AIUTA/SCAMBIA/RIANIMA già oggi
      // non permettono.
      companions: loop.playersInZone(state, zone.id).filter((p) => p.id !== player.id).map((p) => ({
        id: p.id, name: p.name, status: p.status,
        sameNode: !zone.nodes || p.nodeId === player.nodeId
      })),
      openChests: (zone.chests || []).filter((c) => !c.opened).map((c) => ({ id: c.id })),
      // Node Graph: un'entry con nodeId (es. drop di una cassa) è visibile
      // solo dallo stesso nodo del giocatore — mai dall'altra parte della
      // zona. Entry senza nodeId (loot ambientale, comportamento legacy)
      // restano visibili in tutta la zona.
      groundLoot: (zone.groundLoot || []).filter((g) => g.nodeId == null || g.nodeId === player.nodeId)
    };
  }

  /* Solo le zone raggiungibili con l'unico movimento della zona corrente,
     escluse Tempesta/eliminate — stessa regola già applicata da moveAction,
     qui solo interrogata per mostrarla, mai duplicata. */
  function getReachableZones(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    return zone.connections
      .map((id) => loop.getZone(state, id))
      .filter((z) => z.stormState !== "storm" && z.stormState !== "eliminated")
      .map((z) => ({
        id: z.id, name: z.name, danger: z.danger, stormState: z.stormState,
        companions: loop.playersInZone(state, z.id).map((p) => ({ id: p.id, name: p.name })),
        knownEnemies: loop.enemiesInZone(state, z.id).map((e) => ({ id: e.id, archetype: e.archetype }))
      }));
  }

  /* Avviso non bloccante: "se finisci il round qui, subirai N danni".
     Legge solo la tabella già esposta da loop.STORM_DAMAGE per il round
     corrente (la stessa che endRound userà davvero) — nessuna soglia
     reinventata, e non impedisce mai la scelta del bambino. */
  function getStormRisk(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    if (zone.stormState !== "storm") return { atRisk: false, damage: 0 };
    const damage = (loop.STORM_DAMAGE && loop.STORM_DAMAGE[state.round]) || 0;
    return { atRisk: damage > 0, damage };
  }

  function hasActiveBoss(state) {
    return Boolean(state.boss && state.boss.active && state.boss.hp > 0);
  }

  /* Ordine richiesto: RIANIMA in evidenza, poi ATTACCA, SPOSTATI, APRI CASSA,
     AIUTA, SCAMBIA, USA OGGETTO; separato, sempre presente, FINE TURNO.
     NOTA: "INTERAGISCI" non è ancora derivabile da un dato di zona reale (non
     esiste oggi un concetto di "punto di interesse" nel modello zona) — non
     lo mostriamo per non offrire un pulsante sempre presente ma senza alcuna
     condizione di validità reale. Da rivedere quando esisterà quel dato. */
  function getAvailableActions(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const actions = [];

    // Node Graph (Zone Magnify V1, oggi solo Forest): RIANIMA/ATTACCA/APRI
    // CASSA/AIUTA/SCAMBIA richiedono di essere sullo stesso nodo, non solo
    // nella stessa zona. Il Party resta zona-level (Battlefield/queue
    // invariati, vedi isBattlefield/buildRoundPlayerQueue): qui si restringe
    // SOLO la disponibilità di queste azioni. Zone senza zone.nodes: stesso
    // comportamento zona-level di sempre, zero cambiamenti.
    const hasNodeGraph = Boolean(zone.nodes);
    const sameSpot = (otherNodeId) => !hasNodeGraph || otherNodeId === player.nodeId;

    const koCompanion = loop.playersInZone(state, zone.id).find((p) => p.status === "ko" && sameSpot(p.nodeId));
    if (koCompanion && !player.actedThisRound) {
      actions.push({ id: "rianima", label: "RIANIMA " + koCompanion.name, targetId: koCompanion.id });
    }
    const bossHere = state.boss && state.boss.active && state.boss.hp > 0 && state.boss.zoneId === zone.id;
    const enemiesHere = hasNodeGraph ? loop.enemiesAtNode(state, zone.id, player.nodeId) : loop.enemiesInZone(state, zone.id);
    if (!player.actedThisRound && (enemiesHere.length > 0 || bossHere)) {
      actions.push({ id: "attacca", label: "ATTACCA" });
    }
    if (!player.movedThisRound && zone.connections.some((id) => {
      const z = loop.getZone(state, id);
      return z.stormState !== "storm" && z.stormState !== "eliminated";
    })) {
      actions.push({ id: "sposta", label: "SPOSTATI" });
    }
    if (!player.actedThisRound) {
      const openChest = (zone.chests || []).find((c) => !c.opened && sameSpot(c.nodeId));
      if (openChest) actions.push({ id: "apri_cassa", label: "APRI CASSA", chestId: openChest.id });

      const activeCompanion = loop.playersInZone(state, zone.id).find((p) => p.id !== player.id && p.status === "active" && sameSpot(p.nodeId));
      if (activeCompanion) actions.push({ id: "aiuta", label: "AIUTA " + activeCompanion.name, targetId: activeCompanion.id });
      if (activeCompanion) actions.push({ id: "scambia", label: "SCAMBIA con " + activeCompanion.name, targetId: activeCompanion.id });

      if (player.equipment.cura) actions.push({ id: "usa_cura", label: "USA CURA" });
      if (player.equipment.scudo) actions.push({ id: "usa_scudo", label: "USA SCUDO" });
      // Scanner/Fumogeno/Stim consumano tutti e tre l'azione principale
      // (decisione presa): stesso blocco "!player.actedThisRound" di
      // Cura/Scudo/Aiuta/Scambia/Apri Cassa, nessuna eccezione tra loro.
      if (player.equipment.utility) {
        actions.push({ id: "usa_utility", label: "USA " + player.equipment.utility.name.toUpperCase(), utilityId: player.equipment.utility.id });
      }
    }

    actions.push({ id: "fine_turno", label: "FINE TURNO" });
    return actions;
  }

  /* =========================================================================
     ANTEPRIMA ATTACCO — nessun calcolo qui, solo dati reali (mai un dado)
     ========================================================================= */

  function buildAttackPreview(state, playerId, enemyId, weapon) {
    const pv = loop.previewPlayerAttack(state, playerId, enemyId, weapon);
    return {
      weapon: { name: weapon.name, image: weapon.image, rarity: weapon.rarity, potenza: weapon.potenza, power: weapon.power, special: weapon.special },
      weaponRange: pv.weaponRange, encounterRange: pv.encounterRange,
      rangeModifier: pv.rangeModifier, diceCount: pv.diceCount,
      aiuto: pv.aiuto, effectBonus: pv.effectBonus,
      enemy: { hp: pv.enemyHp, maxHp: pv.enemyMaxHp, shield: pv.enemyShield, maxShield: pv.enemyMaxShield }
    };
  }

  function buildBossAttackPreview(state, playerId, weapon) {
    const pv = loop.previewBossAttack(state, playerId, weapon);
    return {
      weapon: { name: weapon.name, image: weapon.image, rarity: weapon.rarity, potenza: weapon.potenza, power: weapon.power, special: weapon.special },
      weaponRange: pv.weaponRange, encounterRange: pv.encounterRange,
      rangeModifier: pv.rangeModifier, diceCount: pv.diceCount,
      aiuto: pv.aiuto, effectBonus: pv.effectBonus,
      boss: { hp: pv.bossHp, maxHp: pv.bossMaxHp, shield: pv.bossShield, maxShield: pv.bossMaxShield }
    };
  }

  /* =========================================================================
     AZIONI DEL GIOCATORE DI TURNO (non a dadi) — validano solo "tocca a te
     davvero?", poi delegano 1:1 alla funzione del loop corrispondente.
     ========================================================================= */

  function performMove(state, dir, playerId, targetZoneId, rng) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    return loop.moveAction(state, playerId, targetZoneId, rng);
  }

  /* Movimento a nodi (Zone Magnify V1): stesso movedThisRound di performMove,
     mai un budget separato. Non fa mai avanzare la coda (come performMove):
     il giocatore può ancora agire dopo essersi mosso. */
  function performMoveNode(state, dir, playerId, direction) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    return loop.moveToNode(state, playerId, direction);
  }

  /* Chiamata alla fine di ogni azione principale immediata (mai per il
     movimento, mai per un raccolto da terra: nessuno dei due consuma
     l'azione principale). Se l'azione ha davvero consumato l'azione
     principale (player.actedThisRound), il Director passa da solo al
     prossimo della queue — "il sistema non deve chiedere manualmente chi
     viene dopo". FINE TURNO resta comunque disponibile per chi rinuncia. */
  function autoAdvanceIfActed(state, dir, playerId) {
    const player = loop.getPlayer(state, playerId);
    if (player && player.actedThisRound) endPlayerTurn(state, dir, playerId);
  }

  function performRianima(state, dir, playerId, targetId) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    const result = loop.rianimaAction(state, playerId, targetId);
    autoAdvanceIfActed(state, dir, playerId);
    return result;
  }

  function performAiuto(state, dir, playerId, targetId) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    const result = loop.aiutoAction(state, playerId, targetId);
    autoAdvanceIfActed(state, dir, playerId);
    return result;
  }

  function performScambia(state, dir, playerId, targetId, slot) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    const result = loop.scambiaAction(state, playerId, targetId, slot);
    autoAdvanceIfActed(state, dir, playerId);
    return result;
  }

  function performUsaCura(state, dir, playerId) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    const result = loop.usaCuraAction(state, playerId);
    autoAdvanceIfActed(state, dir, playerId);
    return result;
  }

  function performUsaScudo(state, dir, playerId) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    const result = loop.usaScudoAction(state, playerId);
    autoAdvanceIfActed(state, dir, playerId);
    return result;
  }

  /* Scanner/Fumogeno/Stim: tutte e tre consumano l'azione principale, oltre
     all'oggetto Utility stesso (nessuna eccezione tra loro). */
  function performUsaUtility(state, dir, playerId, targetZoneId) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    const result = loop.usaUtilityAction(state, playerId, targetZoneId);
    autoAdvanceIfActed(state, dir, playerId);
    return result;
  }

  /* Raccogliere non consuma l'azione principale (§18/§27 Loot): nessun
     auto-avanzamento qui, il giocatore può ancora agire dopo. */
  function performEquipFoundWeapon(state, dir, playerId, slot, groundLootInstanceId, weaponObject) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    return loop.equipFoundWeapon(state, playerId, slot, groundLootInstanceId, weaponObject);
  }

  function performEquipFoundSupportItem(state, dir, playerId, slot, groundLootInstanceId, itemObject) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    return loop.equipFoundSupportItem(state, playerId, slot, groundLootInstanceId, itemObject);
  }

  /* NIENTE auto-avanzamento qui (a differenza delle altre azioni principali):
     l'apertura consuma comunque actedThisRound (regola invariata, decisa da
     loop.apriCassaAction), ma il giocatore resta "corrente" finché non preme
     FINE TURNO. Serve perché l'equip di quanto trovato (performEquipFound*)
     richiede assertCurrentPlayer — se il turno fosse già passato al prossimo
     in coda, chi ha aperto la cassa non potrebbe più raccogliere ciò che ha
     appena trovato nello stesso turno. */
  function performApriCassa(state, dir, playerId, chestId, rng) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    return loop.apriCassaAction(state, playerId, chestId, rng);
  }

  /* FINE TURNO: puro Director, nessuna action type nel loop. Il bambino può
     chiuderlo anche senza essersi mosso o aver agito — e questa stessa
     funzione è anche l'auto-avanzamento interno dopo un'azione già risolta
     (vedi autoAdvanceIfActed e il ramo "player" di applyRollOutcome). */
  function endPlayerTurn(state, dir, playerId) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    assertNoAwaitingRoll(dir);
    const next = advanceIndex(state, dir.roundPlayerQueue, dir.currentPlayerIndex + 1);
    if (next === -1) {
      dir.currentPlayerIndex = dir.roundPlayerQueue.length;
      beginEnemyPhase(state, dir);
    } else {
      dir.currentPlayerIndex = next;
    }
  }

  /* =========================================================================
     DADI FISICI — un solo "tiro in attesa" alla volta (dir.awaitingRoll).
     Nessuna generazione automatica: il Director si limita a dire quanti dadi
     servono, ricevere i risultati e farli risolvere dal loop.
     ========================================================================= */

  /* Sceglie quale funzione del loop completa la risoluzione, in base a chi
     sta attaccando e chi/cosa sta colpendo. Nessuna logica di combattimento
     qui: solo un dispatch verso le primitive già del loop. */
  function resolverFor(aw) {
    if (aw.actorType === "player") {
      return aw.targetKind === "boss" ? loop.resolveBossAttackFromRolls : loop.resolvePlayerAttackFromRolls;
    }
    if (aw.actorType === "enemy") return loop.resolveEnemyStepFromRolls;
    if (aw.actorType === "boss") return loop.resolveBossStepFromRolls;
    throw new Error("actorType sconosciuto in awaitingRoll: " + aw.actorType);
  }

  function beginPlayerAttackOnEnemy(state, dir, playerId, enemyId, weapon) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    assertNoAwaitingRoll(dir);
    const prepared = loop.declarePlayerAttack(state, playerId, enemyId, weapon);
    dir.awaitingRoll = {
      actorType: "player", actorId: playerId, targetKind: "enemy", targetId: enemyId,
      diceCount: prepared.diceCount, prepared, rolls: null, pendingRerollIndices: []
    };
    return { diceCount: prepared.diceCount };
  }

  function beginPlayerAttackOnBoss(state, dir, playerId, weapon) {
    assertPlayerTurnPhase(dir);
    assertCurrentPlayer(state, dir, playerId);
    assertNoAwaitingRoll(dir);
    const prepared = loop.declareBossAttack(state, playerId, weapon);
    dir.awaitingRoll = {
      actorType: "player", actorId: playerId, targetKind: "boss", targetId: null,
      diceCount: prepared.diceCount, prepared, rolls: null, pendingRerollIndices: []
    };
    return { diceCount: prepared.diceCount };
  }

  /* Prepara il prossimo nemico della coda della fase nemici SENZA tirare
     dadi: se lo step non richiede dadi (movimento/idle/scartato) è già
     completo, e il Director avanza da solo alla voce successiva. */
  function beginEnemyRollStep(state, dir) {
    if (dir.directorPhase !== "enemy-phase" || !dir.enemyPhase) throw new Error("Non siamo nella fase nemici");
    assertNoPendingAnnouncements(dir);
    assertNoAwaitingRoll(dir);
    const enemyId = dir.enemyPhase.order[dir.enemyPhase.cursor];
    const prepared = loop.prepareEnemyStep(state, enemyId);
    if (prepared.type !== "attack") {
      dir.lastStepResult = prepared;
      advanceEnemyCursor(state, dir);
      return prepared;
    }
    dir.awaitingRoll = {
      actorType: "enemy", actorId: enemyId, targetKind: "player", targetId: prepared.targetId,
      diceCount: prepared.diceCount, prepared, rolls: null, pendingRerollIndices: []
    };
    return { type: "awaiting-roll", diceCount: prepared.diceCount, enemyId, targetId: prepared.targetId };
  }

  function advanceEnemyCursor(state, dir) {
    dir.enemyPhase.cursor += 1;
    if (dir.enemyPhase.cursor >= dir.enemyPhase.order.length) {
      dir.enemyPhase = null;
      beginBossPhase(state, dir);
    }
  }

  /* Prepara l'attacco del boss SENZA tirare dadi. */
  function beginBossRollStep(state, dir) {
    if (dir.directorPhase !== "boss-phase") throw new Error("Non siamo nella fase boss");
    assertNoPendingAnnouncements(dir);
    assertNoAwaitingRoll(dir);
    const prepared = loop.prepareBossStep(state);
    if (prepared.type !== "attack") {
      dir.lastStepResult = prepared;
      dir.directorPhase = "end-of-round";
      return prepared;
    }
    dir.awaitingRoll = {
      actorType: "boss", actorId: null, targetKind: "player", targetId: prepared.targetId,
      diceCount: prepared.diceCount, prepared, rolls: null, pendingRerollIndices: []
    };
    return { type: "awaiting-roll", diceCount: prepared.diceCount, targetId: prepared.targetId };
  }

  /* Riceve il tiro FISICO iniziale (array di interi 1-6, validati dal combat
     engine, mai qui) e lo fa risolvere. Se l'arma ha rerollOnes e uno o più
     dadi mostrano 1, ritorna { status: "needs-reroll", rerollIndices } senza
     applicare alcun danno: il chiamante deve far ritirare FISICAMENTE solo
     quei dadi e richiamare submitReroll. */
  function submitRoll(state, dir, rolls) {
    if (!dir.awaitingRoll) throw new Error("Nessun tiro in attesa");
    const aw = dir.awaitingRoll;
    const outcome = resolverFor(aw)(state, aw.prepared, rolls);
    return applyRollOutcome(state, dir, outcome);
  }

  /* Completa un attacco dopo un ritiro fisico: passa gli stessi rolls
     originali (mai ricreati) più i nuovi valori ritirati. */
  function submitReroll(state, dir, rerollValues) {
    if (!dir.awaitingRoll || !dir.awaitingRoll.pendingRerollIndices.length) {
      throw new Error("Nessun ritiro in attesa");
    }
    const aw = dir.awaitingRoll;
    const outcome = resolverFor(aw)(state, aw.prepared, aw.rolls, rerollValues);
    return applyRollOutcome(state, dir, outcome);
  }

  function applyRollOutcome(state, dir, outcome) {
    if (outcome.status === "needs-reroll") {
      dir.awaitingRoll.rolls = outcome.rolls;
      dir.awaitingRoll.pendingRerollIndices = outcome.rerollIndices;
      return outcome;
    }
    const actorType = dir.awaitingRoll.actorType;
    const actorId = dir.awaitingRoll.actorId;
    dir.lastStepResult = outcome;
    dir.awaitingRoll = null;
    if (actorType === "enemy") {
      enqueueKoAnnouncementsFromStep(state, dir, outcome);
      advanceEnemyCursor(state, dir);
    } else if (actorType === "boss") {
      enqueueKoAnnouncementsFromStep(state, dir, outcome);
      dir.directorPhase = "end-of-round";
    } else if (actorType === "player") {
      // Solo ORA che l'attacco è risolto in via definitiva (mai durante un
      // ritiro fisico pendente) il Director passa al prossimo della queue.
      autoAdvanceIfActed(state, dir, actorId);
    }
    return outcome;
  }

  /* =========================================================================
     FASE NEMICI / BOSS — avvio e chiusura fase (nessun dado qui dentro)
     ========================================================================= */

  function beginEnemyPhase(state, dir) {
    dir.directorPhase = "enemy-phase";
    dir.lastStepResult = null;
    const order = loop.getEnemyPhaseOrder(state);
    if (!order.length) {
      beginBossPhase(state, dir);
      return;
    }
    dir.enemyPhase = { order, cursor: 0 };
  }

  function beginBossPhase(state, dir) {
    dir.directorPhase = hasActiveBoss(state) ? "boss-phase" : "end-of-round";
  }

  function enqueueKoAnnouncementsFromStep(state, dir, step) {
    if (!step || step.type !== "attack") return;
    const checks = [{ playerId: step.targetId, statusBefore: step.statusBefore, statusAfter: step.statusAfter }]
      .concat(step.secondaryHits || []);
    checks.forEach((c) => {
      if (c.statusBefore !== "ko" && c.statusAfter === "ko") {
        const p = loop.getPlayer(state, c.playerId);
        dir.pendingAnnouncements.push({ type: "ko", payload: { playerId: c.playerId, playerName: p ? p.name : c.playerId } });
      }
    });
  }

  /* =========================================================================
     FINE ROUND — delega interamente a loop.endRound/startRound; il Director
     osserva solo le differenze di stato per generare gli annunci (mai una
     ricostruzione delle regole di Tempesta/rinforzi/KO).
     ========================================================================= */

  function resolveEndOfRound(state, dir, rng) {
    if (dir.directorPhase !== "end-of-round") throw new Error("Non siamo in fine round");
    assertNoPendingAnnouncements(dir);
    assertNoAwaitingRoll(dir);

    const playersBefore = state.players.map((p) => ({ id: p.id, status: p.status }));
    const enemyIdsBefore = new Set(state.enemies.map((e) => e.id));
    const bossActiveBefore = Boolean(state.boss && state.boss.active);

    loop.endRound(state, rng);

    state.enemies.forEach((e) => {
      if (!enemyIdsBefore.has(e.id)) {
        dir.pendingAnnouncements.push({ type: "reinforcement", payload: { zoneId: e.zoneId } });
      }
    });
    playersBefore.forEach((before) => {
      const now = loop.getPlayer(state, before.id);
      if (before.status !== "ko" && now.status === "ko") {
        dir.pendingAnnouncements.push({ type: "ko", payload: { playerId: now.id, playerName: now.name } });
      }
      if (before.status !== "eliminated" && now.status === "eliminated") {
        dir.pendingAnnouncements.push({ type: "eliminated", payload: { playerId: now.id, playerName: now.name } });
      }
    });

    if (state.phase === "vittoria") {
      dir.pendingAnnouncements.push({ type: "victory", payload: {} });
      dir.directorPhase = "game-over";
      return;
    }
    if (state.phase === "sconfitta") {
      dir.pendingAnnouncements.push({ type: "defeat", payload: {} });
      dir.directorPhase = "game-over";
      return;
    }

    const zonesBefore = state.zones.map((z) => ({ id: z.id, stormState: z.stormState }));
    loop.startRound(state, rng);

    state.zones.forEach((z) => {
      const before = zonesBefore.find((b) => b.id === z.id);
      if (before && before.stormState !== z.stormState) {
        const type = z.stormState === "warning" ? "storm-warning"
          : z.stormState === "storm" ? "storm-arrived"
          : z.stormState === "eliminated" ? "storm-eliminated"
          : null;
        if (type) dir.pendingAnnouncements.push({ type, payload: { zoneId: z.id, zoneName: z.name } });
      }
    });
    if (!bossActiveBefore && state.boss && state.boss.active) {
      dir.pendingAnnouncements.push({ type: "boss-activated", payload: {} });
    }
    dir.pendingAnnouncements.push({ type: "round-start", payload: { round: state.round } });

    dir.directorPhase = "round-announcement";
    dir.lastStepResult = null;
  }

  /* =========================================================================
     CODA ANNUNCI (FIFO) — un annuncio alla volta, mai sovrascritto
     ========================================================================= */

  function acknowledgeAnnouncement(state, dir) {
    if (!dir.pendingAnnouncements.length) return;
    dir.pendingAnnouncements.shift();
    if (dir.pendingAnnouncements.length === 0 && dir.directorPhase === "round-announcement") {
      startPlayerTurnPhase(state, dir);
    }
  }

  return {
    createDirectorState,
    isBattlefield, buildRoundPlayerQueue,
    getCurrentPlayerId, getCurrentPlayer,
    getSituation, getReachableZones, getAvailableActions, getStormRisk, hasActiveBoss,
    buildAttackPreview, buildBossAttackPreview,
    performMove, performMoveNode, performRianima, performAiuto, performScambia,
    performUsaCura, performUsaScudo, performUsaUtility,
    performEquipFoundWeapon, performEquipFoundSupportItem, performApriCassa,
    endPlayerTurn,
    beginPlayerAttackOnEnemy, beginPlayerAttackOnBoss,
    beginEnemyRollStep, beginBossRollStep,
    submitRoll, submitReroll,
    beginEnemyPhase, beginBossPhase,
    resolveEndOfRound, acknowledgeAnnouncement
  };
});
