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

  const loop = window.FORTRESS_LOOP;
  const director = window.FORTRESS_DIRECTOR;
  const combat = window.FORTRESS_COMBAT;
  const ZONES = window.FORTRESS_ZONES || [];
  const zonesApi = window.FORTRESS_ZONES_API;
  const CHARACTERS = window.FORTRESS_CHARACTERS || [];
  const ARMI = window.FORTRESS_ARMI || [];
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

  function zoneStars(danger) { return DANGER_STARS[danger] || 1; }
  function zoneCatalogEntry(id) { return ZONES.find((z) => z.id === id); }
  function zoneNameOf(id) { const z = zoneCatalogEntry(id); return z ? z.name : id; }

  /* =========================================================================
     FIXTURE DEV — SOLO per testare il combattimento prima del Loot definitivo.
     Nessuna regola di gioco: assegna un'arma base a ciascun giocatore usando
     lo slot equipment.primary già esistente nel loop. Da eliminare (una sola
     funzione, un solo punto di chiamata) quando il Loot vero sarà pronto.
     ========================================================================= */
  const DEV_STARTING_WEAPON_ID = "assault_base";
  function applyDevStartingEquipment(state) {
    const weapon = ARMI.find((w) => w.id === DEV_STARTING_WEAPON_ID);
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
  let attackFlow = null;      // { step: "target"|"weapon"|"preview", targetKind, targetId, weapon }
  let diceSelections = null;  // array di risultati 1-6 in corso di inserimento
  let pendingResult = null;   // esito già risolto dal motore, in attesa del CONTINUA
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
    const bossConfig = {
      hpPerPlayer: 50, shield: 10, summonEvery: 3, summonArchetype: "normale",
      phases: [
        { threshold: 1.0, attackProfile: { baseDice: 2, power: 4, range: "medio", special: { type: "none" } } },
        { threshold: 0.5, attackProfile: { baseDice: 3, power: 4, range: "medio", special: { type: "areaDamage" } } }
      ]
    };
    const state = loop.createGame({ players, zones, bossConfig });
    applyDevStartingEquipment(state);

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
    if (lootFound) pushEvent(`${player.name}: HAI TROVATO ${lootLabel(lootFound)}`);
    game.landingIndex += 1;

    if (loop.allPlayersLanded(state)) {
      loop.beginExploration(state, Math.random);
      game.dir = director.createDirectorState(state); // coda annunci già contiene "round-start": 1
    }
    render();
  }

  function lootLabel(loot) {
    return `${(loot.tipo || "").toUpperCase()} · ${(loot.rarita || "").toUpperCase()}`;
  }
  function pushEvent(text) {
    eventLog.unshift(text);
    if (eventLog.length > 5) eventLog.length = 5;
  }

  /* =========================================================================
     RENDER — dispatch principale
     ========================================================================= */
  function render() {
    $("fa-setup-screen").hidden = uiMode !== "setup";
    $("fa-game-screen").hidden = uiMode !== "game";
    if (uiMode === "setup") { renderSetup(); return; }

    renderMap();
    renderPanel();
    renderAttackOverlay();

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
        data-zone="${zoneDef.id}" ${selectable ? "" : "disabled"}>
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
    return `<button type="button" class="fa-action-btn ${cls}" data-action="${a.id}"${targetAttr}${chestAttr}>${a.label}</button>`;
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
    const actions = (attackFlow || moveMode) ? [] : director.getAvailableActions(state, player);
    const stars = zoneStars(situation.danger);

    panel.innerHTML = `
      <div class="fa-panel-round">ROUND ${state.round}</div>
      <div class="fa-panel-turn">TOCCA A ${escapeHtml(player.name).toUpperCase()}</div>

      <div class="fa-panel-section"><h4>Posizione</h4><p>${escapeHtml(situation.zoneName)}</p></div>

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
          ${situation.companions.map((c) => `<li>${escapeHtml(c.name)}${c.status === "ko" ? " (KO)" : ""} è qui</li>`).join("")}
          ${situation.openChests.length ? `<li>${situation.openChests.length} cassa/e</li>` : ""}
          ${(!situation.enemies.length && !situation.bossHere && !situation.companions.length && !situation.openChests.length) ? "<li>Nessuno nei paraggi.</li>" : ""}
        </ul>
      </div>

      ${eventLog.length ? `<div class="fa-panel-section"><h4>Eventi recenti</h4><ul class="fa-situation-list">${eventLog.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul></div>` : ""}

      <div class="fa-panel-section">
        <h4>Cosa vuoi fare?</h4>
        <div class="fa-action-list">${moveMode ? `<p>Scegli una zona evidenziata sulla mappa.</p>` : actions.map(actionButtonMarkup).join("")}</div>
        ${moveMode ? `<button type="button" class="fa-btn fa-btn-ghost" id="fa-move-cancel">Annulla spostamento</button>` : ""}
      </div>
    `;
  }

  function handlePlayerAction(actionId, targetId, chestId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    switch (actionId) {
      case "sposta": moveMode = true; break;
      case "attacca": attackFlow = { step: "target" }; break;
      case "rianima": director.performRianima(state, dir, playerId, targetId); break;
      case "aiuta": director.performAiuto(state, dir, playerId, targetId); break;
      case "scambia": director.performScambia(state, dir, playerId, targetId, "primary"); break;
      case "usa_oggetto": director.performUsaOggetto(state, dir, playerId); break;
      case "apri_cassa": {
        const loot = director.performApriCassa(state, dir, playerId, chestId, Math.random);
        if (loot) pushEvent(`HAI TROVATO: ${lootLabel(loot)}`);
        break;
      }
      case "fine_turno": director.endPlayerTurn(state, dir, playerId); break;
      default: break;
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
      const actionId = btn.dataset.action;
      if (actionId) handlePlayerAction(actionId, btn.dataset.target, btn.dataset.chest);
    });
  }

  function bindMapEvents() {
    $("fa-map-zones").addEventListener("click", (ev) => {
      const tile = ev.target.closest(".fa-zone-tile");
      if (!tile || tile.disabled) return;
      const zoneId = tile.dataset.zone;
      if (isLanding()) { chooseLandingZone(zoneId); return; }
      if (moveMode) { handleMoveToZone(zoneId); return; }
    });
  }

  function handleMoveToZone(zoneId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    const outcome = director.performMove(state, dir, playerId, zoneId, Math.random);
    moveMode = false;
    if (outcome.lootFound) pushEvent(`HAI TROVATO: ${lootLabel(outcome.lootFound)}`);
    render();
  }

  /* =========================================================================
     ANNUNCI DEL DIRECTOR — coda FIFO, un annuncio alla volta, consumato solo
     quando il Master preme PROSEGUI (mai saltato automaticamente).
     ========================================================================= */
  const ANNOUNCEMENT_TEXT = {
    "round-start": (p) => ({ title: `ROUND ${p.round}`, body: "" }),
    "storm-warning": (p) => ({ title: "⚠️ ATTENZIONE", body: `La Tempesta investirà presto ${escapeHtml(zoneNameOf(p.zoneId))}.` }),
    "storm-arrived": (p) => ({ title: "🌪️ LA TEMPESTA È ARRIVATA", body: `${escapeHtml(zoneNameOf(p.zoneId))} è ora in Tempesta.` }),
    "storm-eliminated": (p) => ({ title: "🌪️ ZONA INGHIOTTITA", body: `${escapeHtml(zoneNameOf(p.zoneId))} non è più raggiungibile.` }),
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
      const situation = director.getSituation(state, player);
      const enemyBtns = situation.enemies.map((e) => `<button type="button" class="fa-action-btn" data-target-kind="enemy" data-target-id="${e.id}">
        ${ENEMY_NAME[e.archetype] || e.archetype} · HP ${e.hp}/${e.maxHp}${e.maxShield ? ` · Scudo ${e.shield}/${e.maxShield}` : ""}
      </button>`).join("");
      const bossBtn = situation.bossHere
        ? `<button type="button" class="fa-action-btn is-primary" data-target-kind="boss">👑 BOSS · HP ${state.boss.hp}/${state.boss.maxHp}${state.boss.maxShield ? ` · Scudo ${state.boss.shield}/${state.boss.maxShield}` : ""}</button>`
        : "";
      return `<h2>Scegli il bersaglio</h2><div class="fa-action-list">${enemyBtns}${bossBtn}</div>
        <button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-cancel">Annulla</button>`;
    }

    if (attackFlow.step === "weapon") {
      const slots = ["primary", "secondary"].filter((slot) => player.equipment[slot]);
      const options = slots.map((slot) => {
        const w = player.equipment[slot];
        return `<button type="button" class="fa-action-btn" data-weapon-slot="${slot}">${escapeHtml(w.name)} · POTENZA ${w.potenza}</button>`;
      }).join("");
      return `<h2>Scegli l'arma</h2><div class="fa-action-list">${options || "<p>Nessuna arma equipaggiata.</p>"}</div>
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
      <p>TIRA ${n} DAD${n > 1 ? "I" : "O"} FISIC${n > 1 ? "I" : "O"}, poi registra i risultati:</p>
      ${buildDiceGroupsMarkup(n, (i) => `DADO ${i + 1}`)}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-confirm-dice" disabled>CONFERMA RISULTATI</button>
    `;
  }

  function buildRerollMarkup(awaitingRoll) {
    const indices = awaitingRoll.pendingRerollIndices;
    return `
      <h2>RITIRA ${indices.length > 1 ? "QUESTI DADI" : "QUESTO DADO"}</h2>
      <p>È uscito 1: ritira FISICAMENTE ${indices.length > 1 ? "questi dadi" : "questo dado"} e registra il nuovo risultato. Se esce ancora 1, resta 1.</p>
      ${buildDiceGroupsMarkup(indices.length, (i) => `DADO ${indices[i] + 1} (ritiro)`)}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-confirm-dice" disabled>CONFERMA RISULTATI</button>
    `;
  }

  function diceContextTitle(awaitingRoll) {
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
      <div class="fa-result-total">DANNO ${r.result.total}</div>
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
        attackFlow.targetKind = targetBtn.dataset.targetKind;
        attackFlow.targetId = targetBtn.dataset.targetId || null;
        attackFlow.step = "weapon";
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
  bindPanelEvents();
  bindAnnouncementEvents();
  bindAttackOverlayEvents();
  window.addEventListener("resize", () => { if (uiMode === "game") drawConnections(); });

  render();

  // Hook di sola verifica manuale (QA), utile durante lo sviluppo: mai in produzione.
  const IS_DEV = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (IS_DEV) {
    window.__fortressDebug = { getGame: () => game, rerender: render };
  }
})();
