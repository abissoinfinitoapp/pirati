/* =============================================================================
   Fortress Army — Prima interfaccia giocabile: Setup, Mappa a 9 zone, Token,
   Turn Director, Movimento, Combattimento a DADI FISICI.

   Modulo separato da fortress-army.js (che resta Libreria Armi + Guardaroba)
   per non farlo diventare enorme. IIFE dedicata: nessuna variabile condivisa
   con fortress-army.js, evita collisioni di scope tra i due script.

   REGOLA ASSOLUTA: questo file non tira MAI un dado durante una partita
   reale. Ogni risultato arriva da un pulsante 1-6 premuto da chi ha
   fisicamente tirato il dado. Legge SOLO le API già esposte da
   engine/fortress-director.js (che a sua volta usa engine/fortress-loop.js e
   engine/fortress-combat.js) — nessuna regola di gioco è ricalcolata qui.

   Nessun salvataggio: sessione solo in memoria.
   ========================================================================= */
(function () {
  "use strict";

  /* Pura, testabile in Node: converte il layout {row,col} di una zona in uno
     style CSS inline per posizionarla nella griglia. Non conosce e non deve
     mai conoscere QUALI id di zona esistono — solo coordinate numeriche.
     Questo è ciò che rende il posizionamento indipendente dai nomi di Map 01
     (vedi styles-fortress.css, che ora non ha più selettori per id). */
  function zoneLayoutStyle(layout) {
    if (!layout || !Number.isFinite(layout.row) || !Number.isFinite(layout.col)) return "";
    return ` style="grid-row:${layout.row};grid-column:${layout.col};"`;
  }

  /* Pura, testabile in Node: Guided Turn UI — "salta la schermata di scelta
     se non c'è davvero una scelta da fare" (bersaglio/arma). Riceve solo un
     array di bersagli già filtrati dal chiamante (mai una regola di chi è
     un bersaglio valido: quella resta 100% nel Director/loop) e restituisce
     l'unico elemento se ce n'è uno solo, altrimenti null (serve una scelta). */
  function pickAutoTarget(targets) {
    return (targets && targets.length === 1) ? targets[0] : null;
  }

  /* Stessa idea per l'arma: guarda solo quali slot arma (primary/secondary)
     sono valorizzati nell'equipaggiamento già risolto dal motore — nessuna
     nuova regola su cosa renda un'arma "usabile". */
  function pickAutoWeaponSlot(equipment) {
    if (!equipment) return null;
    const slots = ["primary", "secondary"].filter((slot) => equipment[slot]);
    return slots.length === 1 ? slots[0] : null;
  }

  if (typeof module === "object" && module.exports) {
    // In Node esponiamo solo le funzioni pure sopra, per i test: il resto di
    // questo file è browser-only (window/DOM) e si ferma qui.
    module.exports = { zoneLayoutStyle, pickAutoTarget, pickAutoWeaponSlot };
    return;
  }

  const loop = window.FORTRESS_LOOP;
  const director = window.FORTRESS_DIRECTOR;
  const combat = window.FORTRESS_COMBAT;
  const ZONES = window.FORTRESS_ZONES || [];
  const zonesApi = window.FORTRESS_ZONES_API;
  const CHARACTERS = window.FORTRESS_CHARACTERS || [];
  const ARMI = window.FORTRESS_ARMI || [];
  const ITEMS = window.FORTRESS_ITEMS;
  const loot = window.FORTRESS_LOOT;
  /* Guardaroba (skin cosmetiche): solo lettura, solo per scegliere quale
     immagine mostrare. Nessuna logica di gioco arriva da qui. */
  const skinsApi = window.FORTRESS_SKINS_API;
  function characterDisplayImage(characterId, fallback) {
    if (skinsApi) return skinsApi.getCharacterDisplayImage(characterId);
    return fallback;
  }

  /* Equip/unequip di una skin ridisegna subito il token sulla mappa: solo
     un refresh visivo (renderMap), nessuna azione di gioco, nessun dado,
     nessun tocco a loop/director/combat. */
  window.addEventListener("fortress-skin-changed", () => {
    if (uiMode === "game" && game) renderMap();
  });

  if (!loop || !director || !combat || !zonesApi) return; // pagina senza i motori caricati: niente da fare

  const $ = (id) => document.getElementById(id);
  const escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const imgTag = (src, alt, cls) => `<img${cls ? ` class="${cls}"` : ""} src="${src}" alt="${escapeHtml(alt)}" onerror="this.style.opacity='0.12'">`;

  const RANGE_LABELS = { vicino: "Vicino", medio: "Medio", lontano: "Lontano" };
  const ENEMY_LETTER = { normale: "N", aggressivo: "A", resistente: "R", distanza: "D", elite: "E" };
  const ENEMY_NAME = { normale: "Normale", aggressivo: "Aggressivo", resistente: "Resistente", distanza: "Distanza", elite: "Elite" };
  const DANGER_STARS = zonesApi.DANGER_STARS;
  // Massimo HP/Scudo giocatore: nessun campo maxHp/maxShield sul giocatore,
  // è una costante già cablata nell'engine (usaCuraAction/usaScudoAction
  // fanno Math.min(10, ...)). Duplicata qui SOLO per mostrarla, mai per
  // calcolare alcunché: la UI non decide mai un massimo diverso da quello.
  const PLAYER_MAX_STAT = 10;
  // Etichetta semplice dello special di un'arma, per la card di scelta arma
  // (Guided Turn UI): stesso vocabolario special di engine/fortress-combat.js,
  // solo il testo breve (il dettaglio completo resta nella Libreria Armi di
  // fortress-army.js, IIFE separata apposta — nessuna variabile condivisa).
  const WEAPON_SPECIAL_LABEL = {
    none: null,
    rangeless: "Gittata universale",
    ignoreShield: (n) => `Perfora Scudo (${n === 2 ? 2 : 1})`,
    critOnSix: "Critico sul 6",
    rerollOnes: "Rilancia gli 1",
    areaDamage: "Danno ad area",
    suppress: "Marchia il bersaglio",
    silent: "Silenzioso",
    chainStrike: "Colpo in catena",
    executionerStrike: "Colpo di grazia",
    silentKill: "Uccisione silenziosa"
  };
  function weaponSpecialLabel(weapon) {
    const special = weapon && weapon.special;
    if (!special || !special.type) return null;
    const entry = WEAPON_SPECIAL_LABEL[special.type];
    if (!entry) return null;
    return typeof entry === "function" ? entry(special.n) : entry;
  }

  function zoneStars(danger) { return DANGER_STARS[danger] || 1; }
  function zoneCatalogEntry(id) { return ZONES.find((z) => z.id === id); }
  function zoneNameOf(id) { const z = zoneCatalogEntry(id); return z ? z.name : id; }

  /* =========================================================================
     ARMA INIZIALE — fissa per tutti (§3), mai comprata/scelta/registrata come
     trovata: assegnata direttamente allo slot primary, MAI attraverso
     loop.equipFoundWeapon (quindi non entra mai in collectedWeaponIds).
     ========================================================================= */
  function applyStarterEquipment(state) {
    const weapon = ARMI.find((w) => w.id === loot.STARTER_WEAPON_ID);
    if (!weapon) return;
    state.players.forEach((p) => { p.equipment.primary = weapon; });
  }

  /* =========================================================================
     STATO SOLO-UI (mai gameState, mai Director state): modalità schermata,
     avatar scelti, flusso di attacco in corso, tiro in corso, ultimo esito
     da mostrare, piccolo log di eventi (loot ambientale/casse).
     ========================================================================= */
  let uiMode = "setup"; // "setup" | "game"
  let game = null;      // { state, dir, playerAvatars: {playerId:characterId}, landingIndex }
  let setupCount = 2;
  let setupPlayers = null;
  let setupError = null;
  let moveMode = false;
  let scannerMode = false; // in attesa che il giocatore scelga la zona adiacente da scansionare
  let magnifyMode = false; // Zone Magnify V1: vista nodi della zona corrente invece della World Map
  let attackFlow = null;      // { step: "target"|"weapon"|"preview", targetKind, targetId, weapon }
  let attackActorId = null;   // playerId di chi ha dichiarato l'attacco in corso (Guided Turn UI: serve dopo il CONTINUA per capire se il turno è cambiato)
  let diceSelections = null;  // array di risultati 1-6 in corso di inserimento
  let pendingResult = null;   // esito già risolto dal motore, in attesa del CONTINUA
  let chestResult = null;     // { weapon, support } appena trovati aprendo una cassa, in attesa di PRENDI/CHIUDI (Guided Turn UI)
  let turnTransition = null;  // { name, zoneName } — "ORA TOCCA A ..." mostrato quando il turno passa a un altro giocatore (Guided Turn UI, solo presentazione: mai gameState/Director state)
  let eventLog = [];

  function isLanding() { return game && !game.dir; }

  /* =========================================================================
     SETUP PARTITA
     ========================================================================= */
  const MAX_PLAYERS = 10; // pari al numero di personaggi/avatar disponibili in catalog/fortress-characters.js

  function ensureSetupPlayers() {
    if (!setupPlayers) {
      setupPlayers = Array.from({ length: MAX_PLAYERS }, (_, i) => ({ name: "Giocatore " + (i + 1), avatarId: null }));
    }
  }

  function renderSetup() {
    ensureSetupPlayers();
    const countOptions = Array.from({ length: MAX_PLAYERS - 1 }, (_, i) => i + 2); // 2..MAX_PLAYERS
    const countSelect = `<div class="fa-setup-count"><label for="fa-setup-count-select">Numero giocatori</label>
      <select id="fa-setup-count-select">${countOptions.map((n) => `<option value="${n}" ${n === setupCount ? "selected" : ""}>${n}</option>`).join("")}</select></div>`;

    const rows = Array.from({ length: setupCount }, (_, i) => {
      const p = setupPlayers[i];
      const avatars = CHARACTERS.map((c) => {
        const takenByOther = setupPlayers.slice(0, setupCount).some((other, j) => j !== i && other.avatarId === c.id);
        const selected = p.avatarId === c.id;
        return `<button type="button" class="fa-setup-avatar ${selected ? "is-selected" : ""} ${takenByOther ? "is-taken" : ""}"
            data-player-index="${i}" data-avatar-id="${c.id}" ${takenByOther ? "disabled" : ""}>
          ${imgTag(c.image, c.name)}<span>${escapeHtml(c.name)}</span>
        </button>`;
      }).join("");
      return `<div class="fa-setup-player-row">
        <input type="text" value="${escapeHtml(p.name)}" data-player-index="${i}" maxlength="18">
        <div class="fa-setup-avatar-grid">${avatars}</div>
      </div>`;
    }).join("");

    const allAvatarsChosen = setupPlayers.slice(0, setupCount).every((p) => p.avatarId);

    $("fa-setup-body").innerHTML = `
      ${countSelect}
      <div class="fa-setup-players">${rows}</div>
      ${setupError ? `<p class="fa-setup-error">${escapeHtml(setupError)}</p>` : ""}
      <div class="fa-setup-actions">
        <button type="button" class="fa-btn fa-btn-primary" id="fa-setup-start" ${allAvatarsChosen ? "" : "disabled"}>INIZIA PARTITA</button>
      </div>
    `;
  }

  function attemptStartGame() {
    const active = setupPlayers.slice(0, setupCount);
    if (active.some((p) => !p.avatarId)) { setupError = "Ogni giocatore deve scegliere un avatar."; renderSetup(); return; }
    setupError = null;
    startGameFromSetup(active);
  }

  function startGameFromSetup(activePlayers) {
    const players = activePlayers.map((p, i) => ({ id: "p" + (i + 1), name: p.name.trim() || ("Giocatore " + (i + 1)) }));
    const zones = zonesApi.buildLoopZones(combat);
    // zoneId/activationRound sono la configurazione di QUESTA mappa (Map 01):
    // l'engine non li assume mai, li riceve sempre da qui.
    const bossConfig = {
      zoneId: "central-fortress", activationRound: 10,
      hpPerPlayer: 50, shield: 10, summonEvery: 3, summonArchetype: "normale",
      phases: [
        { threshold: 1.0, attackProfile: { baseDice: 2, power: 4, range: "medio", special: { type: "none" } } },
        { threshold: 0.5, attackProfile: { baseDice: 3, power: 4, range: "medio", special: { type: "areaDamage" } } }
      ]
    };
    const state = loop.createGame({ players, zones, bossConfig });
    applyStarterEquipment(state);

    const playerAvatars = {};
    players.forEach((p, i) => { playerAvatars[p.id] = activePlayers[i].avatarId; });

    game = { state, dir: null, playerAvatars, landingIndex: 0 };
    eventLog = [];
    uiMode = "game";
    render();
  }

  /* =========================================================================
     ATTERRAGGIO — solo le 4 zone esterne, ordine fisso dei giocatori.
     Il round 1 NON viene consumato automaticamente: resta in coda fino a
     quando il Master preme PROSEGUI (gestito come ogni altro annuncio).
     ========================================================================= */
  function chooseLandingZone(zoneId) {
    const state = game.state;
    const player = state.players[game.landingIndex];
    const { lootFound } = loop.landPlayer(state, player.id, zoneId, Math.random);
    if (lootFound) pushEvent(`${player.name}: HAI TROVATO ${lootEntryLabel(lootFound)}`);
    game.landingIndex += 1;

    if (loop.allPlayersLanded(state)) {
      loop.beginExploration(state, Math.random);
      game.dir = director.createDirectorState(state); // coda annunci già contiene "round-start": 1
    }
    render();
  }

  /* Risolve un riferimento minimo di groundLoot ({kind, weaponId|itemId}) in
     un'etichetta leggibile, SOLO per la UI: mai una copia dello stato. */
  function resolveLootEntry(entry) {
    if (entry.kind === "weapon") return ARMI.find((w) => w.id === entry.weaponId);
    return ITEMS.findItem(entry.itemId);
  }
  function lootEntryLabel(entry) {
    const resolved = resolveLootEntry(entry);
    if (!resolved) return "???";
    return entry.kind === "weapon" ? `${resolved.name} (${resolved.rarity})` : resolved.name;
  }

  /* UI minima (§27): un oggetto a terra si raccoglie scegliendo lo slot.
     Nessuna assegnazione automatica: sempre un click esplicito, sempre
     tramite director.performEquipFound*/
  function groundLootMarkup(groundLoot) {
    if (!groundLoot || !groundLoot.length) return "";
    const rows = groundLoot.map((entry) => {
      const label = escapeHtml(lootEntryLabel(entry));
      const buttons = entry.kind === "weapon"
        ? `<button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="primary">→ Primary</button>
           <button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="secondary">→ Secondary</button>`
        : `<button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="${entry.kind}">Raccogli</button>`;
      return `<div class="fa-groundloot-row"><span>${label}</span>${buttons}</div>`;
    }).join("");
    return `<div class="fa-panel-section"><h4>A terra</h4>${rows}</div>`;
  }
  function pushEvent(text) {
    eventLog.unshift(text);
    if (eventLog.length > 5) eventLog.length = 5;
  }

  /* =========================================================================
     GUIDED TURN UI — header di turno, bersagli, transizione "ORA TOCCA A...",
     cassa aperta. Solo presentazione: nessuna nuova regola, legge sempre
     Director/loop già esistenti (§ istruzioni: "il Director decide, la UI
     traduce la decisione").
     ========================================================================= */

  /* Header enorme, sempre in cima al pannello durante il turno di un
     giocatore: chi gioca, dove si trova, quanta vita/scudo ha. Sostituisce
     il vecchio "TOCCA A X" testuale con qualcosa di leggibile da un bambino
     senza dover chiedere al Master. */
  function buildTurnHeaderMarkup(player, situation) {
    const character = CHARACTERS.find((c) => c.id === game.playerAvatars[player.id]);
    const img = character ? characterDisplayImage(character.id, character.image) : "";
    return `
      <div class="fa-turn-header">
        <div class="fa-turn-header-avatar">${imgTag(img, player.name)}</div>
        <div class="fa-turn-header-info">
          <div class="fa-turn-header-label">Tocca a</div>
          <div class="fa-turn-header-name">${escapeHtml(player.name).toUpperCase()}</div>
          <div class="fa-turn-header-zone">${escapeHtml(situation.zoneName)}</div>
          <div class="fa-turn-header-stats">
            <span class="fa-stat-hp">❤️ ${player.hp}/${PLAYER_MAX_STAT}</span>
            <span class="fa-stat-shield">🛡️ ${player.shield}/${PLAYER_MAX_STAT}</span>
          </div>
        </div>
      </div>`;
  }

  /* Bersagli d'attacco DAVVERO raggiungibili dal punto in cui si trova il
     giocatore ora: nemici sullo stesso nodo (Node Graph) o della zona intera
     (zone legacy) + il boss se qui. Riusa le stesse query del Director
     (loop.enemiesAtNode/enemiesInZone) usate per decidere se mostrare il
     pulsante ATTACCA: mai una seconda regola di "chi è raggiungibile". */
  function getAttackTargets(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const enemies = zone.nodes ? loop.enemiesAtNode(state, zone.id, player.nodeId) : loop.enemiesInZone(state, zone.id);
    const targets = enemies.map((e) => ({
      kind: "enemy", id: e.id, archetype: e.archetype, hp: e.hp, maxHp: e.maxHp, shield: e.shield, maxShield: e.maxShield
    }));
    const boss = state.boss;
    if (boss && boss.active && boss.hp > 0 && boss.zoneId === zone.id) {
      targets.push({ kind: "boss", id: null, archetype: null, hp: boss.hp, maxHp: boss.maxHp, shield: boss.shield, maxShield: boss.maxShield });
    }
    return targets;
  }

  /* Confronta chi era il giocatore corrente prima di un'azione con chi lo è
     dopo: se è cambiato (ed è ancora il turno di un giocatore, non fase
     nemici/boss/round — quelle hanno già i loro pannelli espliciti), prepara
     la schermata "ORA TOCCA A ...". Stato SOLO-UI: non tocca mai dir/state. */
  function checkTurnTransition(beforePlayerId) {
    const state = game.state, dir = game.dir;
    if (!dir || dir.directorPhase !== "player-turn") return;
    const afterId = director.getCurrentPlayerId(state, dir);
    if (!afterId || afterId === beforePlayerId) return;
    const p = loop.getPlayer(state, afterId);
    const zone = loop.getZone(state, p.zoneId);
    turnTransition = { name: p.name, zoneName: zone.name };
  }

  function renderTurnTransitionOverlay() {
    const overlay = $("fa-turn-transition-overlay");
    if (!turnTransition) { overlay.hidden = true; return; }
    overlay.hidden = false;
    $("fa-turn-transition-content").innerHTML = `
      <div class="fa-transition-label">Ora tocca a</div>
      <h2>${escapeHtml(turnTransition.name).toUpperCase()}</h2>
      <p>${escapeHtml(turnTransition.zoneName)}</p>
      <button type="button" class="fa-btn fa-btn-primary" id="fa-transition-continue">VAI</button>
    `;
  }

  function bindTurnTransitionEvents() {
    $("fa-turn-transition-overlay").addEventListener("click", (ev) => {
      if (ev.target.id === "fa-transition-continue") { turnTransition = null; render(); }
    });
  }

  /* Card di un oggetto appena trovato in una cassa, con scelta esplicita
     dello slot (mai equip automatico: §27/§18 Loot, invariato). Riusa
     resolveLootEntry/lootEntryLabel già usati per il log eventi. */
  function chestItemCardMarkup(entry) {
    if (!entry) return "";
    const resolved = resolveLootEntry(entry);
    if (!resolved) return "";
    const isWeapon = entry.kind === "weapon";
    const icon = isWeapon ? "" : (entry.kind === "cura" ? "❤️" : entry.kind === "scudo" ? "🛡️" : "🔧");
    const img = isWeapon
      ? `<div class="fa-chest-card-img">${imgTag(resolved.image, resolved.name)}</div>`
      : `<div class="fa-chest-card-img fa-chest-card-icon">${icon}</div>`;
    const meta = isWeapon
      ? `<span class="fa-rarity-tag rarity-${resolved.rarity}">${resolved.rarity}</span><span>POTENZA ${resolved.potenza}</span>`
      : "";
    const buttons = isWeapon
      ? `<button type="button" class="fa-btn fa-btn-primary" data-pickup="${entry.instanceId}" data-pickup-slot="primary">PRENDI · Primary</button>
         <button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="secondary">PRENDI · Secondary</button>`
      : `<button type="button" class="fa-btn fa-btn-primary" data-pickup="${entry.instanceId}" data-pickup-slot="${entry.kind}">PRENDI</button>`;
    return `<div class="fa-chest-card">
      ${img}
      <div class="fa-chest-card-name">${escapeHtml(resolved.name)}</div>
      ${meta ? `<div class="fa-chest-card-meta">${meta}</div>` : ""}
      <div class="fa-chest-card-actions">${buttons}</div>
    </div>`;
  }

  function renderChestOverlay() {
    const overlay = $("fa-chest-overlay");
    if (!chestResult) { overlay.hidden = true; return; }
    overlay.hidden = false;
    $("fa-chest-content").innerHTML = `
      <h2>HAI TROVATO</h2>
      <div class="fa-chest-cards">
        ${chestItemCardMarkup(chestResult.weapon)}
        ${chestItemCardMarkup(chestResult.support)}
      </div>
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-chest-close">HO FINITO</button>
    `;
  }

  function bindChestEvents() {
    $("fa-chest-overlay").addEventListener("click", (ev) => {
      if (ev.target.id === "fa-chest-close") { chestResult = null; render(); return; }
      const btn = ev.target.closest("[data-pickup]");
      if (btn) { handlePickup(Number(btn.dataset.pickup), btn.dataset.pickupSlot); }
    });
  }

  /* =========================================================================
     RENDER — dispatch principale
     ========================================================================= */
  function render() {
    $("fa-setup-screen").hidden = uiMode !== "setup";
    $("fa-game-screen").hidden = uiMode !== "game";
    if (uiMode === "setup") { renderSetup(); return; }

    const state = game.state;
    const currentPlayer = isLanding() ? null : director.getCurrentPlayer(state, game.dir);
    const currentZone = currentPlayer ? loop.getZone(state, currentPlayer.zoneId) : null;
    // SPOSTATI/Scanner scelgono la destinazione su una tile della World Map:
    // mentre sono attivi si torna sempre alla vista World, indipendentemente
    // dalla preferenza Magnify (che resta invariata e riprende dopo).
    const showMagnify = Boolean(magnifyMode && currentZone && currentZone.nodes && !moveMode && !scannerMode);

    $("fa-map-wrap").hidden = showMagnify;
    $("fa-magnify-wrap").hidden = !showMagnify;
    if (showMagnify) $("fa-magnify-wrap").innerHTML = renderMagnify(state, currentPlayer);
    else renderMap();

    renderPanel();
    renderAttackOverlay();
    renderChestOverlay();
    renderTurnTransitionOverlay();

    const dir = game.dir;
    if (dir && dir.pendingAnnouncements.length) renderAnnouncementOverlay(dir.pendingAnnouncements[0]);
    else $("fa-announcement-overlay").hidden = true;
  }

  /* =========================================================================
     MAPPA + TOKEN + COLLEGAMENTI SVG
     ========================================================================= */
  function renderMap() {
    const state = game.state;
    const currentPlayer = isLanding() ? null : director.getCurrentPlayer(state, game.dir);
    const reachableIds = (!isLanding() && moveMode && currentPlayer)
      ? director.getReachableZones(state, currentPlayer).map((z) => z.id)
      : null;
    const landingActive = isLanding();

    $("fa-map-zones").innerHTML = ZONES.map((z) => renderZoneTile(z, state, currentPlayer, reachableIds, landingActive)).join("");
    // getBoundingClientRect() forza un layout sincrono: non serve aspettare
    // un frame (requestAnimationFrame non è affidabile in ogni contesto).
    drawConnections();
  }

  function renderZoneTile(zoneDef, state, currentPlayer, reachableIds, landingActive) {
    const zone = loop.getZone(state, zoneDef.id);
    const stars = zoneStars(zoneDef.danger);
    const isCurrent = Boolean(currentPlayer && currentPlayer.zoneId === zoneDef.id);

    let selectable = false;
    if (landingActive) selectable = zoneDef.ring === "esterno";
    else if (reachableIds) selectable = reachableIds.includes(zoneDef.id);
    if (zone.stormState === "eliminated") selectable = false;

    const showingChoice = landingActive || Boolean(reachableIds);
    const dimmed = showingChoice && !selectable;

    const stormClass = zone.stormState === "warning" ? "is-storm-warning"
      : zone.stormState === "storm" ? "is-storm-storm"
      : zone.stormState === "eliminated" ? "is-storm-eliminated" : "";
    const stormBadge = zone.stormState === "warning" ? "TEMPESTA IN ARRIVO"
      : zone.stormState === "storm" ? "TEMPESTA"
      : zone.stormState === "eliminated" ? "ELIMINATA" : "";

    const tokens = state.players.filter((p) => p.zoneId === zoneDef.id && p.status !== "eliminated")
      .map((p) => tokenMarkup(p, currentPlayer)).join("");
    const enemies = loop.enemiesInZone(state, zoneDef.id).map(enemyMarkerMarkup).join("");
    const boss = state.boss;
    const bossHere = Boolean(boss && boss.active && boss.hp > 0 && boss.zoneId === zoneDef.id);

    return `<button type="button" class="fa-zone-tile ${zoneDef.ring === "centro" ? "is-central" : ""} ${isCurrent ? "is-current" : ""} ${selectable ? "is-selectable" : ""} ${dimmed ? "is-dimmed" : ""} ${stormClass}"
        data-zone="${zoneDef.id}" ${selectable ? "" : "disabled"}${zoneLayoutStyle(zoneDef.layout)}>
      ${imgTag(zoneDef.image, zoneDef.name, "fa-zone-img")}
      ${stormBadge ? `<span class="fa-zone-storm-badge">${stormBadge}</span>` : ""}
      <div class="fa-zone-body">
        <div class="fa-zone-name">${escapeHtml(zoneDef.name)}</div>
        <div class="fa-zone-meta">
          <span class="fa-danger-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</span>
          <span>${RANGE_LABELS[zoneDef.encounterRange]}</span>
          ${zoneDef.lootTier ? `<span>Loot ${zoneDef.lootTier}</span>` : ""}
        </div>
        ${tokens ? `<div class="fa-zone-tokens">${tokens}</div>` : ""}
        ${enemies ? `<div class="fa-zone-enemies">${enemies}</div>` : ""}
        ${bossHere ? `<div class="fa-boss-marker">👑 BOSS · HP ${boss.hp}/${boss.maxHp}${boss.maxShield ? ` · 🛡 ${boss.shield}` : ""}</div>` : ""}
      </div>
    </button>`;
  }

  function tokenMarkup(player, currentPlayer) {
    const character = CHARACTERS.find((c) => c.id === game.playerAvatars[player.id]);
    const isCurrent = Boolean(currentPlayer && currentPlayer.id === player.id);
    const isKo = player.status === "ko";
    const img = character ? characterDisplayImage(character.id, character.image) : "";
    return `<div class="fa-token ${isCurrent ? "is-current" : ""} ${isKo ? "is-ko" : ""}">
      ${imgTag(img, player.name)}
      <span>${escapeHtml(player.name)}${isKo ? " (KO)" : ""}</span>
    </div>`;
  }

  function enemyMarkerMarkup(e) {
    return `<span class="fa-enemy-marker" title="${ENEMY_NAME[e.archetype] || e.archetype}">${ENEMY_LETTER[e.archetype] || "?"} · ${e.hp}${e.maxShield ? `/🛡${e.shield}` : ""}</span>`;
  }

  /* =========================================================================
     ZONE MAGNIFY V1 — vista nodi della zona corrente (solo Forest per ora).
     Riusa l'immagine zona già esistente come background, tokenMarkup ed
     enemyMarkerMarkup già usati dalla World Map: nessuna nuova immagine,
     nessuna nuova primitiva di rendering, solo coordinate percentuali invece
     che griglia CSS. Le azioni (ATTACCA/APRI CASSA/...) restano nel pannello
     di turno esistente, già node-aware lato Director: qui c'è SOLO la mappa.
     ========================================================================= */
  function renderMagnify(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const zoneDef = zoneCatalogEntry(zone.id);
    const nodes = zone.nodes || [];

    const nodesMarkup = nodes.map((n) => {
      const isCurrent = player.nodeId === n.id;
      const enemies = loop.enemiesAtNode(state, zone.id, n.id);
      const chest = (zone.chests || []).find((c) => c.nodeId === n.id && !c.opened);
      const hasLoot = (zone.groundLoot || []).some((g) => g.nodeId === n.id);
      const tokens = state.players.filter((p) => p.zoneId === zone.id && p.nodeId === n.id && p.status !== "eliminated")
        .map((p) => tokenMarkup(p, player)).join("");
      return `<div class="fa-node ${isCurrent ? "is-current" : ""}" style="left:${n.x}%;top:${n.y}%;">
        <div class="fa-node-dot"></div>
        <div class="fa-node-markers">
          ${chest ? `<span class="fa-node-marker" title="Cassa">🎁</span>` : ""}
          ${hasLoot ? `<span class="fa-node-marker" title="Oggetti a terra">📦</span>` : ""}
          ${enemies.length ? `<span class="fa-node-marker fa-node-enemies">${enemies.map(enemyMarkerMarkup).join("")}</span>` : ""}
        </div>
        ${tokens ? `<div class="fa-node-tokens">${tokens}</div>` : ""}
      </div>`;
    }).join("");

    const currentNode = nodes.find((n) => n.id === player.nodeId);
    const canMove = !player.movedThisRound;
    const dirBtn = (direction, symbol) => {
      const target = canMove && currentNode && currentNode.connections && currentNode.connections[direction];
      return `<button type="button" class="fa-dir-btn" data-dir="${direction}" ${target ? "" : "disabled"} aria-label="${direction}">${symbol}</button>`;
    };

    return `
      <div class="fa-magnify-bg" style="background-image:url('${zoneDef ? zoneDef.image : ""}')">
        ${nodesMarkup}
      </div>
      <div class="fa-move-hint ${canMove ? "" : "is-used"}">${canMove ? "PUOI MUOVERTI UNA VOLTA" : "MOVIMENTO USATO"}</div>
      <div class="fa-magnify-controls">
        <div class="fa-dir-row">${dirBtn("up", "↑")}</div>
        <div class="fa-dir-row">${dirBtn("left", "←")}<span class="fa-dir-gap"></span>${dirBtn("right", "→")}</div>
        <div class="fa-dir-row">${dirBtn("down", "↓")}</div>
      </div>
    `;
  }

  function handleMoveNode(direction) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    try {
      director.performMoveNode(state, dir, playerId, direction);
    } catch (e) {
      pushEvent(e.message);
    }
    render();
  }

  function bindMagnifyEvents() {
    $("fa-magnify-wrap").addEventListener("click", (ev) => {
      const btn = ev.target.closest(".fa-dir-btn");
      if (!btn || btn.disabled) return;
      handleMoveNode(btn.dataset.dir);
    });
  }

  function drawConnections() {
    const svg = $("fa-map-connections");
    const wrap = $("fa-map-wrap");
    if (!svg || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    svg.setAttribute("width", Math.max(0, wrapRect.width - 32));
    svg.setAttribute("height", Math.max(0, wrapRect.height - 32));

    const seen = new Set();
    const lines = [];
    ZONES.forEach((z) => {
      z.connections.forEach((cid) => {
        const key = [z.id, cid].sort().join("|");
        if (seen.has(key)) return;
        seen.add(key);
        const elA = document.querySelector(`.fa-zone-tile[data-zone="${z.id}"]`);
        const elB = document.querySelector(`.fa-zone-tile[data-zone="${cid}"]`);
        if (!elA || !elB) return;
        const a = elA.getBoundingClientRect(), b = elB.getBoundingClientRect();
        const offsetLeft = wrapRect.left + 16, offsetTop = wrapRect.top + 16;
        const x1 = a.left + a.width / 2 - offsetLeft, y1 = a.top + a.height / 2 - offsetTop;
        const x2 = b.left + b.width / 2 - offsetLeft, y2 = b.top + b.height / 2 - offsetTop;
        lines.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`);
      });
    });
    svg.innerHTML = lines.join("");
  }

  /* =========================================================================
     PANNELLO DI TURNO
     ========================================================================= */
  function renderStormLine(stormState) {
    if (stormState === "warning") return `<p>🌪️ TEMPESTA IN ARRIVO</p>`;
    if (stormState === "storm") return `<p>🌪️ TEMPESTA</p>`;
    if (stormState === "eliminated") return `<p>❌ ELIMINATA</p>`;
    return `<p>✅ Sicura</p>`;
  }

  function actionButtonMarkup(a) {
    const cls = a.id === "fine_turno" ? "is-end-turn" : (a.id === "rianima" ? "is-rianima" : (a.id === "attacca" ? "is-primary" : ""));
    const targetAttr = a.targetId ? ` data-target="${a.targetId}"` : "";
    const chestAttr = a.chestId ? ` data-chest="${a.chestId}"` : "";
    const utilityAttr = a.utilityId ? ` data-utility="${a.utilityId}"` : "";
    return `<button type="button" class="fa-action-btn ${cls}" data-action="${a.id}"${targetAttr}${chestAttr}${utilityAttr}>${a.label}</button>`;
  }

  function renderPanel() {
    const panel = $("fa-turn-panel");

    if (isLanding()) {
      const player = game.state.players[game.landingIndex];
      panel.innerHTML = `
        <div class="fa-panel-turn">TOCCA A ${escapeHtml(player.name).toUpperCase()}</div>
        <div class="fa-panel-section"><h4>Atterraggio</h4><p>SCEGLI DOVE ATTERRARE — le quattro zone esterne sono evidenziate sulla mappa.</p></div>
      `;
      return;
    }

    const state = game.state, dir = game.dir;

    if (dir.pendingAnnouncements.length) {
      panel.innerHTML = `<div class="fa-panel-round">ROUND ${state.round}</div><p>Conferma l'annuncio per continuare.</p>`;
      return;
    }

    if (dir.directorPhase === "enemy-phase") {
      panel.innerHTML = `<div class="fa-panel-round">ROUND ${state.round}</div>
        <div class="fa-panel-section"><h4>Fase Nemici</h4>
        ${dir.awaitingRoll ? "<p>In attesa dei dadi fisici...</p>" : `<button type="button" class="fa-btn fa-btn-primary" id="fa-enemy-continue">CONTINUA</button>`}</div>`;
      return;
    }
    if (dir.directorPhase === "boss-phase") {
      panel.innerHTML = `<div class="fa-panel-round">ROUND ${state.round}</div>
        <div class="fa-panel-section"><h4>👑 Fase Boss</h4>
        ${dir.awaitingRoll ? "<p>In attesa dei dadi fisici...</p>" : `<button type="button" class="fa-btn fa-btn-primary" id="fa-boss-continue">CONTINUA</button>`}</div>`;
      return;
    }
    if (dir.directorPhase === "end-of-round") {
      panel.innerHTML = `<div class="fa-panel-round">ROUND ${state.round}</div>
        <div class="fa-panel-section"><h4>Fine Round</h4><button type="button" class="fa-btn fa-btn-primary" id="fa-end-round">PROSEGUI</button></div>`;
      return;
    }
    if (dir.directorPhase === "game-over") {
      panel.innerHTML = `<div class="fa-panel-round">PARTITA CONCLUSA</div><p>${state.phase === "vittoria" ? "🏆 La squadra ha vinto!" : "💀 La squadra è stata sconfitta."}</p>`;
      return;
    }

    const player = director.getCurrentPlayer(state, dir);
    if (!player) { panel.innerHTML = ""; return; }
    const situation = director.getSituation(state, player);
    const stormRisk = director.getStormRisk(state, player);
    const actions = (attackFlow || moveMode || scannerMode) ? [] : director.getAvailableActions(state, player);
    const stars = zoneStars(situation.danger);
    const equip = player.equipment;
    const equipLine = (label, item) => `<span>${label}: ${item ? escapeHtml(item.name) : "—"}</span>`;

    panel.innerHTML = `
      <div class="fa-panel-round">ROUND ${state.round}</div>
      ${buildTurnHeaderMarkup(player, situation)}

      ${situation.nodeId ? `<div class="fa-panel-section"><button type="button" class="fa-btn fa-btn-ghost" id="fa-magnify-toggle">${magnifyMode ? "🗺️ World Map" : "🔍 Vedi la zona"}</button></div>` : ""}

      <div class="fa-panel-section">
        <h4>Info zona</h4>
        <p>Pericolo ${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
        <p>Distanza: ${RANGE_LABELS[situation.encounterRange].toUpperCase()}</p>
        ${renderStormLine(situation.stormState)}
        ${stormRisk.atRisk ? `<p class="fa-storm-risk">⚠️ Se resti qui subirai ${stormRisk.damage} danni a fine round.</p>` : ""}
      </div>

      ${player.status === "ko" ? `<div class="fa-ko-banner"><strong>${escapeHtml(player.name).toUpperCase()} È A TERRA</strong><span>${player.koRoundsRemaining} round per salvarlo</span></div>` : ""}

      <div class="fa-panel-section">
        <h4>Situazione</h4>
        <ul class="fa-situation-list">
          ${situation.enemies.length ? `<li>${situation.enemies.length} nemici</li>` : ""}
          ${situation.bossHere ? `<li>👑 Il Boss è qui</li>` : ""}
          ${situation.companions.map((c) => `<li>${escapeHtml(c.name)}${c.status === "ko" ? " (KO)" : ""} ${c.sameNode ? "è qui" : "è nella zona, ma non qui vicino"}</li>`).join("")}
          ${situation.openChests.length ? `<li>${situation.openChests.length} cassa/e</li>` : ""}
          ${(!situation.enemies.length && !situation.bossHere && !situation.companions.length && !situation.openChests.length) ? "<li>Nessuno nei paraggi.</li>" : ""}
        </ul>
      </div>

      ${eventLog.length ? `<div class="fa-panel-section"><h4>Eventi recenti</h4><ul class="fa-situation-list">${eventLog.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul></div>` : ""}

      <div class="fa-panel-section">
        <h4>Inventario</h4>
        <div class="fa-inventory-line">${equipLine("Primary", equip.primary)}</div>
        <div class="fa-inventory-line">${equipLine("Secondary", equip.secondary)}</div>
        <div class="fa-inventory-line">${equipLine("Cura", equip.cura)}</div>
        <div class="fa-inventory-line">${equipLine("Scudo", equip.scudo)}</div>
        <div class="fa-inventory-line">${equipLine("Utility", equip.utility)}</div>
      </div>

      ${groundLootMarkup(situation.groundLoot)}

      <div class="fa-panel-section">
        <h4>Cosa vuoi fare?</h4>
        <div class="fa-action-list">${(moveMode || scannerMode) ? `<p>Scegli una zona evidenziata sulla mappa.</p>` : actions.map(actionButtonMarkup).join("")}</div>
        ${moveMode ? `<button type="button" class="fa-btn fa-btn-ghost" id="fa-move-cancel">Annulla spostamento</button>` : ""}
        ${scannerMode ? `<button type="button" class="fa-btn fa-btn-ghost" id="fa-scanner-cancel">Annulla Scanner</button>` : ""}
      </div>
    `;
  }

  function handlePlayerAction(actionId, targetId, chestId, utilityId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    const player = loop.getPlayer(state, playerId);
    let endsTurn = false;
    switch (actionId) {
      case "sposta": moveMode = true; break;
      case "attacca": {
        // Guided Turn UI: bersaglio unico -> selezionato subito, salta la
        // domanda inutile "CHI VUOI ATTACCARE?" (idem per l'arma sotto).
        const targets = getAttackTargets(state, player);
        const autoTarget = pickAutoTarget(targets);
        if (autoTarget) {
          attackFlow = { step: "weapon", targetKind: autoTarget.kind, targetId: autoTarget.id };
          const autoSlot = pickAutoWeaponSlot(player.equipment);
          if (autoSlot) { attackFlow.weapon = player.equipment[autoSlot]; attackFlow.step = "preview"; }
        } else {
          attackFlow = { step: "target" };
        }
        break;
      }
      case "rianima": director.performRianima(state, dir, playerId, targetId); endsTurn = true; break;
      case "aiuta": director.performAiuto(state, dir, playerId, targetId); endsTurn = true; break;
      case "scambia": director.performScambia(state, dir, playerId, targetId, "primary"); endsTurn = true; break;
      case "usa_cura": director.performUsaCura(state, dir, playerId); endsTurn = true; break;
      case "usa_scudo": director.performUsaScudo(state, dir, playerId); endsTurn = true; break;
      case "usa_utility": {
        if (utilityId === "scanner") { scannerMode = true; break; }
        const result = director.performUsaUtility(state, dir, playerId, null);
        if (result.type === "fumogeno") pushEvent("Fumogeno lanciato: -1 dado al prossimo attacco nemico qui.");
        if (result.type === "stim") pushEvent("Stim pronto: +1 dado al tuo prossimo attacco.");
        endsTurn = true;
        break;
      }
      case "apri_cassa": {
        const found = director.performApriCassa(state, dir, playerId, chestId, Math.random);
        chestResult = found;
        pushEvent(`HAI TROVATO: ${lootEntryLabel(found.weapon)} + ${lootEntryLabel(found.support)}`);
        break;
      }
      case "fine_turno": director.endPlayerTurn(state, dir, playerId); endsTurn = true; break;
      default: break;
    }
    if (endsTurn) checkTurnTransition(playerId);
    render();
  }

  function handlePickup(instanceId, slot) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    const player = loop.getPlayer(state, playerId);
    const zone = loop.getZone(state, player.zoneId);
    const entry = zone.groundLoot.find((g) => g.instanceId === instanceId);
    if (!entry) return;
    const resolved = resolveLootEntry(entry);
    if (!resolved) return;
    if (entry.kind === "weapon") director.performEquipFoundWeapon(state, dir, playerId, slot, entry.instanceId, resolved);
    else director.performEquipFoundSupportItem(state, dir, playerId, slot, entry.instanceId, resolved);
    // Modale cassa aperta (Guided Turn UI): la card appena presa sparisce; a
    // modale vuoto si chiude da sola (nessuna azione residua da compiere lì).
    if (chestResult) {
      if (chestResult.weapon && chestResult.weapon.instanceId === instanceId) chestResult.weapon = null;
      if (chestResult.support && chestResult.support.instanceId === instanceId) chestResult.support = null;
      if (!chestResult.weapon && !chestResult.support) chestResult = null;
    }
    render();
  }

  function bindPanelEvents() {
    $("fa-turn-panel").addEventListener("click", (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      if (btn.id === "fa-enemy-continue") { director.beginEnemyRollStep(game.state, game.dir); render(); return; }
      if (btn.id === "fa-boss-continue") { director.beginBossRollStep(game.state, game.dir); render(); return; }
      if (btn.id === "fa-end-round") { director.resolveEndOfRound(game.state, game.dir, Math.random); render(); return; }
      if (btn.id === "fa-move-cancel") { moveMode = false; render(); return; }
      if (btn.id === "fa-scanner-cancel") { scannerMode = false; render(); return; }
      if (btn.id === "fa-magnify-toggle") { magnifyMode = !magnifyMode; render(); return; }
      if (btn.dataset.pickup) { handlePickup(Number(btn.dataset.pickup), btn.dataset.pickupSlot); return; }
      const actionId = btn.dataset.action;
      if (actionId) handlePlayerAction(actionId, btn.dataset.target, btn.dataset.chest, btn.dataset.utility);
    });
  }

  function handleScanZone(zoneId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    scannerMode = false;
    try {
      const result = director.performUsaUtility(state, dir, playerId, zoneId);
      pushEvent(`SCANNER su ${escapeHtml(zoneNameOf(zoneId))}: ${result.enemyCount} nemici, ${result.chestCount} casse`);
      checkTurnTransition(playerId);
    } catch (e) {
      pushEvent(e.message);
    }
    render();
  }

  function bindMapEvents() {
    $("fa-map-zones").addEventListener("click", (ev) => {
      const tile = ev.target.closest(".fa-zone-tile");
      if (!tile || tile.disabled) return;
      const zoneId = tile.dataset.zone;
      if (isLanding()) { chooseLandingZone(zoneId); return; }
      if (moveMode) { handleMoveToZone(zoneId); return; }
      if (scannerMode) { handleScanZone(zoneId); return; }
    });
  }

  function handleMoveToZone(zoneId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    const outcome = director.performMove(state, dir, playerId, zoneId, Math.random);
    moveMode = false;
    if (outcome.lootFound) pushEvent(`HAI TROVATO: ${lootEntryLabel(outcome.lootFound)}`);
    render();
  }

  /* =========================================================================
     ANNUNCI DEL DIRECTOR — coda FIFO, un annuncio alla volta, consumato solo
     quando il Master preme PROSEGUI (mai saltato automaticamente).
     ========================================================================= */
  /* Un solo annuncio "storm-batch" per round (mai uno per zona): raggruppa
     per stato (warning/storm/eliminated) solo le zone il cui stato è
     davvero cambiato in QUESTO round — il Director le ha già filtrate,
     qui solo la presentazione. */
  function stormBatchBody(payload) {
    const lines = [];
    (payload.warning || []).forEach((z) => lines.push(`<span class="fa-storm-batch-line">⚠️ ${escapeHtml(z.zoneName)} — IN ARRIVO</span>`));
    (payload.storm || []).forEach((z) => lines.push(`<span class="fa-storm-batch-line">🌩️ ${escapeHtml(z.zoneName)} — TEMPESTA</span>`));
    (payload.eliminated || []).forEach((z) => lines.push(`<span class="fa-storm-batch-line">☠️ ${escapeHtml(z.zoneName)} — ELIMINATA</span>`));
    return `<span class="fa-storm-batch-list">${lines.join("")}</span>`;
  }

  const ANNOUNCEMENT_TEXT = {
    "round-start": (p) => ({ title: `ROUND ${p.round}`, body: "" }),
    "storm-batch": (p) => ({ title: "🌪️ LA TEMPESTA AVANZA", body: stormBatchBody(p) }),
    "boss-activated": () => ({ title: "👑 IL BOSS SI RISVEGLIA", body: "Central Fortress è ora attiva." }),
    ko: (p) => ({ title: `${escapeHtml((p.playerName || "").toUpperCase())} È A TERRA`, body: "Un compagno nella stessa zona può rianimarlo." }),
    eliminated: (p) => ({ title: `${escapeHtml((p.playerName || "").toUpperCase())} ELIMINATO`, body: "Nessuno lo ha salvato in tempo." }),
    reinforcement: (p) => ({ title: "RINFORZI", body: `Un nuovo nemico arriva a ${escapeHtml(zoneNameOf(p.zoneId))}.` }),
    victory: () => ({ title: "🏆 VITTORIA", body: "La squadra ha sconfitto il boss!" }),
    defeat: () => ({ title: "💀 SCONFITTA", body: "Tutta la squadra è stata eliminata." })
  };

  function renderAnnouncementOverlay(announcement) {
    const build = ANNOUNCEMENT_TEXT[announcement.type] || (() => ({ title: announcement.type, body: "" }));
    const { title, body } = build(announcement.payload || {});
    $("fa-announcement-overlay").hidden = false;
    $("fa-announcement-content").innerHTML = `
      <h2>${title}</h2>
      ${body ? `<p>${body}</p>` : ""}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-announcement-continue">PROSEGUI</button>
    `;
  }

  function bindAnnouncementEvents() {
    $("fa-announcement-overlay").addEventListener("click", (ev) => {
      if (ev.target.id === "fa-announcement-continue") {
        director.acknowledgeAnnouncement(game.state, game.dir);
        render();
      }
    });
  }

  /* =========================================================================
     ATTACCO A DADI FISICI — scegli bersaglio → scegli arma → anteprima pura
     → "TIRA N DADI FISICI" → inserimento risultati → eventuale ritiro fisico
     (rerollOnes) → risultato dal motore, mai ricalcolato qui.
     ========================================================================= */
  function buildAttackFlowMarkup() {
    const state = game.state, dir = game.dir;
    const player = director.getCurrentPlayer(state, dir);

    if (attackFlow.step === "target") {
      // Solo se ci sono davvero più bersagli validi (Guided Turn UI: un
      // bersaglio unico è già stato auto-selezionato da handlePlayerAction,
      // questa schermata non compare nemmeno). Node Graph: solo i nemici
      // raggiungibili dal nodo corrente (getAttackTargets), mai l'intera zona.
      const targets = getAttackTargets(state, player);
      const cards = targets.map((t) => {
        const label = t.kind === "boss" ? "👑 BOSS" : (ENEMY_NAME[t.archetype] || t.archetype);
        return `<button type="button" class="fa-target-card ${t.kind === "boss" ? "is-boss" : ""}" data-target-kind="${t.kind}"${t.id ? ` data-target-id="${t.id}"` : ""}>
          <span class="fa-target-card-name">${label}</span>
          <span class="fa-target-card-stats">
            <span>❤️ ${t.hp}/${t.maxHp}</span>
            ${t.maxShield ? `<span>🛡️ ${t.shield}/${t.maxShield}</span>` : ""}
          </span>
        </button>`;
      }).join("");
      return `<h2>CHI VUOI ATTACCARE?</h2><div class="fa-target-cards">${cards}</div>
        <button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-cancel">Annulla</button>`;
    }

    if (attackFlow.step === "weapon") {
      // Idem per l'arma: questa schermata compare solo con due armi valide.
      const slots = ["primary", "secondary"].filter((slot) => player.equipment[slot]);
      const cards = slots.map((slot) => {
        const w = player.equipment[slot];
        const special = weaponSpecialLabel(w);
        return `<button type="button" class="fa-weapon-card" data-weapon-slot="${slot}">
          <span class="fa-weapon-card-img">${imgTag(w.image, w.name)}</span>
          <span class="fa-weapon-card-info">
            <span class="fa-weapon-card-name">${escapeHtml(w.name)}</span>
            <span class="fa-weapon-card-stats">POTENZA ${w.potenza} · ${RANGE_LABELS[w.range].toUpperCase()}</span>
            ${special ? `<span class="fa-weapon-card-special">${escapeHtml(special)}</span>` : ""}
          </span>
        </button>`;
      }).join("");
      return `<h2>CON QUALE ARMA?</h2><div class="fa-weapon-cards">${cards || "<p>Nessuna arma equipaggiata.</p>"}</div>
        <button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-cancel">Annulla</button>`;
    }

    // preview
    const weapon = attackFlow.weapon;
    const preview = attackFlow.targetKind === "boss"
      ? director.buildBossAttackPreview(state, player.id, weapon)
      : director.buildAttackPreview(state, player.id, attackFlow.targetId, weapon);
    const diceWord = preview.diceCount > 1 ? "DADI FISICI" : "DADO FISICO";
    return `
      <h2>${escapeHtml(weapon.name)}</h2>
      <div class="fa-attack-weapon-img">${imgTag(weapon.image, weapon.name)}</div>
      <div class="fa-attack-potenza">POTENZA ${weapon.potenza}</div>
      <div class="fa-attack-range-row"><span>Arma: ${RANGE_LABELS[preview.weaponRange].toUpperCase()}</span><span>Scontro: ${RANGE_LABELS[preview.encounterRange].toUpperCase()}</span></div>
      <div class="fa-attack-dice-count">${"🎲".repeat(preview.diceCount)}</div>
      <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-roll">TIRA ${preview.diceCount} ${diceWord}</button>
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-cancel">Annulla</button>
    `;
  }

  function commitAttack() {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    attackActorId = playerId; // per il "ORA TOCCA A..." dopo il CONTINUA sul risultato
    const begin = attackFlow.targetKind === "boss"
      ? director.beginPlayerAttackOnBoss(state, dir, playerId, attackFlow.weapon)
      : director.beginPlayerAttackOnEnemy(state, dir, playerId, attackFlow.targetId, attackFlow.weapon);
    diceSelections = new Array(begin.diceCount).fill(null);
    render();
  }

  function buildDiceGroupsMarkup(count, labelFor) {
    return Array.from({ length: count }, (_, i) => `
      <div class="fa-dice-input-group" data-die-index="${i}">
        <div class="fa-dice-input-label">${labelFor(i)}</div>
        <div class="fa-dice-input-buttons">${[1, 2, 3, 4, 5, 6].map((v) => `<button type="button" class="fa-dice-btn" data-die="${i}" data-value="${v}">${v}</button>`).join("")}</div>
      </div>`).join("");
  }

  function buildDiceInputMarkup(awaitingRoll) {
    const n = awaitingRoll.diceCount;
    return `
      <h2>${diceContextTitle(awaitingRoll)}</h2>
      <div class="fa-attack-dice-count">${"🎲".repeat(n)}</div>
      <p class="fa-dice-hint">Inserisci qui i risultati dei dadi fisici</p>
      ${buildDiceGroupsMarkup(n, (i) => `DADO ${i + 1}`)}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-confirm-dice" disabled>CONFERMA RISULTATI</button>
    `;
  }

  function buildRerollMarkup(awaitingRoll) {
    const indices = awaitingRoll.pendingRerollIndices;
    const n = indices.length;
    return `
      <h2>RITIRA ${n} DAD${n > 1 ? "I" : "O"}</h2>
      <p>È uscito 1: ritira FISICAMENTE e registra il nuovo risultato. Se esce ancora 1, resta 1.</p>
      ${buildDiceGroupsMarkup(n, (i) => `DADO ${indices[i] + 1} (ritiro)`)}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-confirm-dice" disabled>CONFERMA RISULTATI</button>
    `;
  }

  function diceContextTitle(awaitingRoll) {
    if (awaitingRoll.actorType === "player") {
      const player = loop.getPlayer(game.state, awaitingRoll.actorId);
      const n = awaitingRoll.diceCount;
      return `${escapeHtml(player.name).toUpperCase()}, TIRA ${n} DAD${n > 1 ? "I" : "O"}`;
    }
    if (awaitingRoll.actorType === "enemy") {
      const enemy = loop.getEnemy(game.state, awaitingRoll.actorId);
      const target = loop.getPlayer(game.state, awaitingRoll.targetId);
      return `${ENEMY_NAME[enemy.archetype] || "Nemico"} attacca ${escapeHtml(target.name)}`;
    }
    if (awaitingRoll.actorType === "boss") {
      const target = loop.getPlayer(game.state, awaitingRoll.targetId);
      return `Il Boss attacca ${escapeHtml(target.name)}`;
    }
    return "Attacco";
  }

  function snapshotTarget(aw) {
    if (aw.targetKind === "boss") return { hp: game.state.boss.hp, shield: game.state.boss.shield };
    const enemy = loop.getEnemy(game.state, aw.targetId);
    return { hp: enemy.hp, shield: enemy.shield };
  }

  function confirmDiceInput() {
    const dir = game.dir, aw = dir.awaitingRoll;
    const preSnapshot = aw.actorType === "player" ? snapshotTarget(aw) : null;
    const outcome = director.submitRoll(game.state, dir, diceSelections.slice());
    handleRollOutcome(outcome, aw, preSnapshot);
  }

  function confirmReroll() {
    const dir = game.dir, aw = dir.awaitingRoll;
    const preSnapshot = aw.actorType === "player" ? snapshotTarget(aw) : null;
    const outcome = director.submitReroll(game.state, dir, diceSelections.slice());
    handleRollOutcome(outcome, aw, preSnapshot);
  }

  function handleRollOutcome(outcome, aw, preSnapshot) {
    if (outcome.status === "needs-reroll") {
      diceSelections = new Array(outcome.rerollIndices.length).fill(null);
      render();
      return;
    }
    pendingResult = buildPendingResult(outcome, aw, preSnapshot);
    diceSelections = null;
    render();
  }

  function buildPendingResult(outcome, aw, preSnapshot) {
    const state = game.state;
    if (aw.actorType === "player") {
      const weapon = aw.prepared.weapon;
      const after = snapshotTargetAfter(aw);
      const targetName = aw.targetKind === "boss" ? "Boss" : (loop.getEnemy(state, aw.targetId).archetype ? ENEMY_NAME[loop.getEnemy(state, aw.targetId).archetype] : "Nemico");
      return {
        title: aw.targetKind === "boss" ? "Attacco al Boss" : "Attacco",
        targetName,
        weaponPower: weapon.power,
        result: outcome.result,
        hpBefore: preSnapshot.hp, hpAfter: after.hp,
        shieldBefore: preSnapshot.shield, shieldAfter: after.shield,
        fallen: aw.targetKind === "boss" ? outcome.defeated : outcome.eliminated,
        fallenLabel: aw.targetKind === "boss" ? "👑 BOSS SCONFITTO" : "NEMICO ELIMINATO"
      };
    }
    const target = loop.getPlayer(state, outcome.targetId);
    return {
      title: aw.actorType === "boss" ? "Il Boss attacca" : `${ENEMY_NAME[loop.getEnemy(state, aw.actorId) ? loop.getEnemy(state, aw.actorId).archetype : ""] || "Un nemico"} attacca`,
      targetName: target.name,
      weaponPower: aw.prepared.weapon.power,
      result: outcome.result,
      hpBefore: outcome.hpBefore, hpAfter: outcome.hpAfter,
      shieldBefore: outcome.shieldBefore, shieldAfter: outcome.shieldAfter,
      fallen: outcome.statusBefore !== "ko" && outcome.statusAfter === "ko",
      fallenLabel: `${target.name.toUpperCase()} È A TERRA`
    };
  }

  function snapshotTargetAfter(aw) {
    if (aw.targetKind === "boss") return { hp: game.state.boss.hp, shield: game.state.boss.shield };
    const enemy = loop.getEnemy(game.state, aw.targetId);
    return { hp: enemy.hp, shield: enemy.shield };
  }

  function buildResultMarkup(r) {
    const rolls = r.result.rolls;
    const tags = [];
    if (rolls.some((v) => v === 12)) tags.push("CRITICO");
    if (r.result.ignoreShieldN) tags.push(`${r.result.ignoreShieldN} DANNI HANNO IGNORATO LO SCUDO`);
    if (r.result.secondaryHits && r.result.secondaryHits.length) tags.push("COLPO AD AREA");
    if (r.result.appliesSuppressMarker) tags.push("BERSAGLIO MARCHIATO");

    return `
      <h2>${r.title}</h2>
      ${r.targetName ? `<p>Bersaglio: <strong>${escapeHtml(r.targetName)}</strong></p>` : ""}
      <div class="fa-result-line">${rolls.join(" + ")}</div>
      <p>Power +${r.weaponPower}</p>
      <div class="fa-result-total">${r.result.total} DANNI!</div>
      <div class="fa-result-stat"><span>Scudo</span><strong>${r.shieldBefore} → ${r.shieldAfter}</strong></div>
      <div class="fa-result-stat"><span>Salute</span><strong>${r.hpBefore} → ${r.hpAfter}</strong></div>
      ${tags.length ? `<div class="fa-result-tags">${tags.map((t) => `<span class="fa-result-tag">${t}</span>`).join("")}</div>` : ""}
      ${r.fallen ? `<div class="fa-ko-banner"><strong>${r.fallenLabel}</strong></div>` : ""}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>
    `;
  }

  function renderAttackOverlay() {
    const overlay = $("fa-attack-overlay");
    const dir = game.dir;

    if (pendingResult) {
      overlay.hidden = false;
      $("fa-attack-content").innerHTML = buildResultMarkup(pendingResult);
      return;
    }
    if (dir && dir.awaitingRoll) {
      overlay.hidden = false;
      const aw = dir.awaitingRoll;
      const needed = aw.pendingRerollIndices.length || aw.diceCount;
      // diceSelections può non esistere ancora se questo tiro non è partito dal
      // flusso ATTACCA del giocatore (es. fase nemici/boss, avviata da "CONTINUA"):
      // lo inizializziamo qui, alla prima apparizione di questo tiro in attesa.
      if (!diceSelections || diceSelections.length !== needed) diceSelections = new Array(needed).fill(null);
      $("fa-attack-content").innerHTML = aw.pendingRerollIndices.length
        ? buildRerollMarkup(aw)
        : buildDiceInputMarkup(aw);
      return;
    }
    if (attackFlow) {
      overlay.hidden = false;
      $("fa-attack-content").innerHTML = buildAttackFlowMarkup();
      return;
    }
    overlay.hidden = true;
  }

  function bindAttackOverlayEvents() {
    $("fa-attack-overlay").addEventListener("click", (ev) => {
      const targetBtn = ev.target.closest("[data-target-kind]");
      if (targetBtn) {
        const player = director.getCurrentPlayer(game.state, game.dir);
        attackFlow.targetKind = targetBtn.dataset.targetKind;
        attackFlow.targetId = targetBtn.dataset.targetId || null;
        // Stessa regola "salta la scelta inutile" applicata anche qui: un
        // bersaglio andava scelto (erano più di uno), ma se l'arma è unica
        // non serve comunque chiedere anche quella.
        const autoSlot = pickAutoWeaponSlot(player.equipment);
        if (autoSlot) { attackFlow.weapon = player.equipment[autoSlot]; attackFlow.step = "preview"; }
        else attackFlow.step = "weapon";
        render();
        return;
      }
      const weaponBtn = ev.target.closest("[data-weapon-slot]");
      if (weaponBtn) {
        const player = director.getCurrentPlayer(game.state, game.dir);
        attackFlow.weapon = player.equipment[weaponBtn.dataset.weaponSlot];
        attackFlow.step = "preview";
        render();
        return;
      }
      if (ev.target.id === "fa-attack-roll") { commitAttack(); return; }
      if (ev.target.id === "fa-attack-cancel") { attackFlow = null; render(); return; }

      const dieBtn = ev.target.closest("[data-die]");
      if (dieBtn) {
        const idx = Number(dieBtn.dataset.die);
        const value = Number(dieBtn.dataset.value);
        diceSelections[idx] = value;
        const group = dieBtn.closest(".fa-dice-input-group");
        group.querySelectorAll(".fa-dice-btn").forEach((b) => b.classList.toggle("is-selected", Number(b.dataset.value) === value));
        const confirmBtn = $("fa-confirm-dice");
        if (confirmBtn) confirmBtn.disabled = diceSelections.some((v) => v === null || v === undefined);
        return;
      }
      if (ev.target.id === "fa-confirm-dice") {
        if (game.dir.awaitingRoll.pendingRerollIndices.length) confirmReroll();
        else confirmDiceInput();
        return;
      }
      if (ev.target.id === "fa-attack-continue") {
        pendingResult = null;
        attackFlow = null;
        if (attackActorId) { checkTurnTransition(attackActorId); attackActorId = null; }
        render();
      }
    });
  }

  /* =========================================================================
     AVVIO
     ========================================================================= */
  function bindSetupEvents() {
    $("fa-setup-screen").addEventListener("click", (ev) => {
      const avatarBtn = ev.target.closest("[data-avatar-id]");
      if (avatarBtn && !avatarBtn.disabled) {
        const i = Number(avatarBtn.dataset.playerIndex);
        setupPlayers[i].avatarId = avatarBtn.dataset.avatarId;
        renderSetup();
        return;
      }
      if (ev.target.id === "fa-setup-start") attemptStartGame();
    });
    $("fa-setup-screen").addEventListener("change", (ev) => {
      if (ev.target.id === "fa-setup-count-select") { setupCount = Number(ev.target.value); renderSetup(); return; }
      const input = ev.target.closest("input[data-player-index]");
      if (input) setupPlayers[Number(input.dataset.playerIndex)].name = input.value;
    });
  }

  bindSetupEvents();
  bindMapEvents();
  bindMagnifyEvents();
  bindPanelEvents();
  bindAnnouncementEvents();
  bindAttackOverlayEvents();
  bindTurnTransitionEvents();
  bindChestEvents();
  window.addEventListener("resize", () => { if (uiMode === "game") drawConnections(); });

  render();

  // Hook di sola verifica manuale (QA), utile durante lo sviluppo: mai in produzione.
  const IS_DEV = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (IS_DEV) {
    window.__fortressDebug = { getGame: () => game, rerender: render };
  }
})();
