/* =============================================================================
   Fortress Army — scheletro v0.
   Progetto separato da Pirati: stato, salvataggio ed economia tutti suoi.

   Contenuto placeholder (castelli/armi/skin) da sostituire quando arrivano
   i contenuti veri. Le immagini sono già cablate (assets/fortress/...) ma
   i file non esistono ancora: gli <img> spariscono da soli (onerror) finché
   non li aggiungi, lasciando la card solo testuale.
   ========================================================================= */

const STORAGE_KEY = "fortress-army-state-v1";
const HOME_CASTLE_NAME = "Bastione Nero";
const START_MONEY = 40;

/* --- contenuto placeholder: da spostare in file dedicati (content/catalog)
   quando la squadra decide i contenuti definitivi --- */
const CASTELLI = [
  { id: "torre-corvo", name: "Torre del Corvo", defense: 4, reward: 20 },
  { id: "bastione-ossa", name: "Bastione delle Ossa", defense: 5, reward: 28 },
  { id: "rocca-nera", name: "Rocca Nera", defense: 6, reward: 36 },
  { id: "fortezza-lupo", name: "Fortezza del Lupo", defense: 7, reward: 46 },
  { id: "cittadella-cenere", name: "Cittadella di Cenere", defense: 8, reward: 58 },
  { id: "trono-spezzato", name: "Il Trono Spezzato", defense: 10, reward: 90, boss: true }
];

/* Catalogo Armi vero (100 voci, schema v2.4) in catalog/fortress-armi.js,
   caricato prima di questo file. Le armi NON si comprano più: si trovano
   solo durante la partita (motore in engine/fortress-combat.js, non ancora
   integrato in questa UI). Qui serve solo per mostrare l'arma equipaggiata,
   se mai una verrà assegnata da un sistema futuro. */
const ARMI = window.FORTRESS_ARMI || [];

const SKIN = [
  { id: "mantello-cenere", name: "Mantello di Cenere", cost: 20 },
  { id: "elmo-teschio", name: "Elmo a Teschio", cost: 35 },
  { id: "armatura-ombra", name: "Armatura d'Ombra", cost: 60 }
];

/* --- stato --- */
function defaultState() {
  return {
    money: START_MONEY,
    players: [
      { id: "p1", name: "Giocatore 1", active: true },
      { id: "p2", name: "Giocatore 2", active: true },
      { id: "p3", name: "Giocatore 3", active: true },
      { id: "p4", name: "Giocatore 4", active: true }
    ],
    nextPlayerNum: 5,
    conqueredCastleIds: [],
    weapons: [],
    equippedWeaponId: null,
    skins: [],
    equippedSkinId: null,
    battle: null, // { castleId, rolls: { playerId: n } }
    log: []
  };
}

let state = defaultState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state = Object.assign(defaultState(), saved);
  } catch (e) { /* salvataggio corrotto: si riparte da zero */ }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

/* --- helper --- */
const $ = (id) => document.getElementById(id);
const castello = (id) => CASTELLI.find((c) => c.id === id);
const arma = (id) => ARMI.find((a) => a.id === id);
const skin = (id) => SKIN.find((s) => s.id === id);
const activePlayers = () => state.players.filter((p) => p.active);
const equippedWeapon = () => (state.equippedWeaponId ? arma(state.equippedWeaponId) : null);

function pushLog(text) {
  state.log.unshift(text);
  if (state.log.length > 40) state.log.length = 40;
}

/* placeholder immagine: se il file non c'è, l'elemento sparisce da solo */
function imgOrNothing(src, alt, cls) {
  return `<img class="${cls}" src="${src}" alt="${alt}" onerror="this.remove()">`;
}

/* =========================================================================
   RENDER
   ========================================================================= */

function renderAll() {
  renderStatus();
  renderRoster();
  renderCastles();
  renderBattle();
  renderWeaponsNotice();
  renderShop("fa-skins", SKIN, "skins", "equippedSkinId", () => "solo estetica");
  renderLog();
}

function renderStatus() {
  $("fa-home-castle").textContent = HOME_CASTLE_NAME;
  $("fa-money").textContent = state.money;
  $("fa-conquered-count").textContent = `${state.conqueredCastleIds.length}/${CASTELLI.length}`;
  const w = equippedWeapon();
  $("fa-equipped-weapon").textContent = w ? `${w.name} (+${w.power})` : "Nessuna";
}

function renderRoster() {
  $("fa-roster").innerHTML = state.players.map((p) => `
    <div class="fa-player ${p.active ? "" : "is-inactive"}">
      <input type="text" value="${p.name}" data-player-name="${p.id}" maxlength="18">
      <button type="button" data-player-toggle="${p.id}" title="${p.active ? "Metti in panchina" : "Rimetti in gioco"}">${p.active ? "🟢" : "⚪"}</button>
      <button type="button" data-player-remove="${p.id}" title="Rimuovi">✕</button>
    </div>`).join("");
}

function renderCastles() {
  $("fa-castles").innerHTML = CASTELLI.map((c) => {
    const conquered = state.conqueredCastleIds.includes(c.id);
    const busy = Boolean(state.battle);
    return `<div class="fa-castle-card ${conquered ? "is-conquered" : ""} ${c.boss ? "is-boss" : ""}">
      ${imgOrNothing(`assets/fortress/castelli/${c.id}.webp`, c.name, "fa-castle-img")}
      <h3>${c.boss ? "👑 " : ""}${c.name}</h3>
      <div class="fa-castle-meta"><span>Difesa <b>${c.defense}</b></span><span>Bottino <b>${c.reward}💰</b></span></div>
      ${conquered
        ? `<span class="fa-conquered-tag">✔ Conquistato</span>`
        : `<button type="button" class="fa-btn fa-btn-primary" data-attack-castle="${c.id}" ${busy ? "disabled" : ""}>⚔️ Attacca</button>`}
    </div>`;
  }).join("");
}

function renderBattle() {
  const box = $("fa-battle");
  const b = state.battle;
  if (!b) { box.hidden = true; return; }
  box.hidden = false;
  const c = castello(b.castleId);
  const roster = activePlayers();
  const w = equippedWeapon();
  $("fa-battle-title").textContent = `Attacco a ${c.name}`;
  $("fa-battle-sub").textContent = `Ogni giocatore attivo tira 1d6. La media${w ? ` + il bonus di ${w.name} (+${w.power})` : ""} deve superare la difesa (${c.defense}).`;

  $("fa-battle-rolls").innerHTML = roster.length ? roster.map((p) => {
    const cur = Number(b.rolls[p.id]) || 0;
    return `<div class="fa-battle-roll-row">
      <span>${p.name}</span>
      <div class="fa-dice-row">${[1, 2, 3, 4, 5, 6].map((n) => `<button type="button" class="${cur === n ? "is-picked" : ""}" data-battle-roll="${p.id}:${n}">${n}</button>`).join("")}</div>
    </div>`;
  }).join("") : `<p class="helper-text">Nessun giocatore in gioco: aggiungine uno nella squadra.</p>`;

  const allIn = roster.length > 0 && roster.every((p) => Number(b.rolls[p.id]) >= 1 && Number(b.rolls[p.id]) <= 6);
  $("fa-battle-resolve").disabled = !allIn;

  const result = $("fa-battle-result");
  const resolveBtn = $("fa-battle-resolve");
  const cancelBtn = $("fa-battle-cancel");
  if (b.result) {
    result.hidden = false;
    result.className = "fa-battle-result " + (b.result.win ? "is-win" : "is-lose");
    result.innerHTML = `<strong>${b.result.title}</strong><p>${b.result.text}</p>`;
    resolveBtn.hidden = true;
    cancelBtn.textContent = "Continua ▸";
  } else {
    result.hidden = true;
    resolveBtn.hidden = false;
    cancelBtn.textContent = "Ritirata (annulla)";
  }
}

/* Le armi non si comprano più: si trovano durante la partita (motore in
   engine/fortress-combat.js, non ancora integrato in questa UI — la mappa/
   il loop di gioco sono uno step separato). L'Armeria a monete precedente
   (weaponCardMarkup/renderWeaponsShop/openWeaponCats) è stata rimossa: usava
   campi (cost/bonus) che il nuovo catalogo non ha più. */
function renderWeaponsNotice() {
  $("fa-weapons").innerHTML = ""; // il testo esplicativo è già nell'intestazione statica del pannello
}

function renderShop(boxId, catalog, ownedKey, equippedKey, effectLabel) {
  $(boxId).innerHTML = catalog.map((item) => {
    const owned = state[ownedKey].includes(item.id);
    const isEquipped = state[equippedKey] === item.id;
    const canAfford = state.money >= item.cost;
    return `<div class="fa-shop-card ${owned ? "is-owned" : ""} ${isEquipped ? "is-equipped" : ""}">
      ${imgOrNothing(`assets/fortress/${ownedKey}/${item.id}.webp`, item.name, "fa-shop-img")}
      <h3>${item.name}</h3>
      <span class="fa-shop-cost">${effectLabel(item)}</span>
      ${owned
        ? (isEquipped
            ? `<span class="fa-owned-tag">Equipaggiata</span>`
            : `<button type="button" class="fa-btn fa-btn-ghost" data-equip="${ownedKey}:${item.id}">Equipaggia</button>`)
        : `<button type="button" class="fa-btn fa-btn-primary" data-buy="${ownedKey}:${item.id}" ${canAfford ? "" : "disabled"}>Compra · ${item.cost}💰</button>`}
    </div>`;
  }).join("");
}

function renderLog() {
  $("fa-log").innerHTML = state.log.length
    ? state.log.map((l) => `<li>${l}</li>`).join("")
    : `<li class="fa-log-empty">Ancora nessuna impresa da raccontare.</li>`;
}

/* =========================================================================
   AZIONI
   ========================================================================= */

function addPlayer() {
  const id = "p" + Date.now();
  state.players.push({ id, name: `Giocatore ${state.nextPlayerNum}`, active: true });
  state.nextPlayerNum += 1;
  saveState(); renderRoster();
}

function removePlayer(id) {
  state.players = state.players.filter((p) => p.id !== id);
  if (state.battle) delete state.battle.rolls[id];
  saveState(); renderRoster(); renderBattle();
}

function renamePlayer(id, name) {
  const p = state.players.find((p) => p.id === id);
  if (p) p.name = name.trim() || p.name;
  saveState();
}

function togglePlayerActive(id) {
  const p = state.players.find((p) => p.id === id);
  if (!p) return;
  p.active = !p.active;
  saveState(); renderRoster(); renderBattle();
}

function startBattle(castleId) {
  if (state.battle || state.conqueredCastleIds.includes(castleId)) return;
  state.battle = { castleId, rolls: {} };
  saveState(); renderCastles(); renderBattle();
  document.getElementById("fa-battle").scrollIntoView({ behavior: "smooth", block: "center" });
}

function cancelBattle() {
  state.battle = null;
  saveState(); renderCastles(); renderBattle();
}

function setBattleRoll(playerId, n) {
  if (!state.battle) return;
  if (state.battle.rolls[playerId] === n) delete state.battle.rolls[playerId];
  else state.battle.rolls[playerId] = n;
  saveState(); renderBattle();
}

function resolveBattle() {
  const b = state.battle;
  if (!b) return;
  const c = castello(b.castleId);
  const roster = activePlayers();
  const rolls = roster.map((p) => Number(b.rolls[p.id]) || 0);
  const avg = rolls.reduce((a, n) => a + n, 0) / rolls.length;
  const w = equippedWeapon();
  const total = avg + (w ? w.power : 0);
  const win = total >= c.defense;

  if (win) {
    state.conqueredCastleIds.push(c.id);
    state.money += c.reward;
    b.result = {
      win: true,
      title: `${c.name} è caduta!`,
      text: `Attacco a ${total.toFixed(1)} contro difesa ${c.defense}. Bottino: +${c.reward}💰.`
    };
    pushLog(`⚔️ ${c.name} conquistata (${total.toFixed(1)} vs ${c.defense}) — +${c.reward}💰`);
  } else {
    b.result = {
      win: false,
      title: `Ritirata da ${c.name}`,
      text: `Attacco a ${total.toFixed(1)} contro difesa ${c.defense}: non basta. Si riprova un altro giorno.`
    };
    pushLog(`🛡️ Ritirata da ${c.name} (${total.toFixed(1)} vs ${c.defense})`);
  }
  saveState(); renderAll();
}

function closeBattle() {
  state.battle = null;
  saveState(); renderCastles(); renderBattle();
}

function buyItem(ownedKey, id, catalog) {
  const item = catalog.find((i) => i.id === id);
  if (!item || state[ownedKey].includes(id) || state.money < item.cost) return;
  state.money -= item.cost;
  state[ownedKey].push(id);
  pushLog(`🛒 Comprato: ${item.name} (-${item.cost}💰)`);
  saveState(); renderAll();
}

function equipItem(equippedKey, id) {
  state[equippedKey] = id;
  saveState(); renderAll();
}

function resetGame() {
  if (!confirm("Azzerare la partita di Fortress Army? Non si può annullare.")) return;
  state = defaultState();
  saveState(); renderAll();
}

/* =========================================================================
   EVENTI
   ========================================================================= */

function bindEvents() {
  $("fa-add-player").addEventListener("click", addPlayer);
  $("fa-reset").addEventListener("click", resetGame);

  $("fa-roster").addEventListener("click", (ev) => {
    const toggle = ev.target.closest("[data-player-toggle]");
    if (toggle) return togglePlayerActive(toggle.dataset.playerToggle);
    const remove = ev.target.closest("[data-player-remove]");
    if (remove) return removePlayer(remove.dataset.playerRemove);
  });
  $("fa-roster").addEventListener("change", (ev) => {
    const input = ev.target.closest("[data-player-name]");
    if (input) renamePlayer(input.dataset.playerName, input.value);
  });

  $("fa-castles").addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-attack-castle]");
    if (btn) startBattle(btn.dataset.attackCastle);
  });

  $("fa-battle-resolve").addEventListener("click", resolveBattle);
  $("fa-battle-cancel").addEventListener("click", () => {
    if (state.battle && state.battle.result) closeBattle();
    else cancelBattle();
  });
  $("fa-battle-rolls").addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-battle-roll]");
    if (!btn) return;
    const [playerId, n] = btn.dataset.battleRoll.split(":");
    setBattleRoll(playerId, Number(n));
  });

  document.getElementById("fortress-app").addEventListener("click", (ev) => {
    const buy = ev.target.closest("[data-buy]");
    if (buy) {
      const [key, id] = buy.dataset.buy.split(":");
      if (key === "weapons") return; // le armi non si comprano più: si trovano in partita
      buyItem(key, id, SKIN);
      return;
    }
    const equip = ev.target.closest("[data-equip]");
    if (equip) {
      const [key, id] = equip.dataset.equip.split(":");
      equipItem(key === "weapons" ? "equippedWeaponId" : "equippedSkinId", id);
    }
  });
}

/* =========================================================================
   LIBRERIA ARMI — sola consultazione.
   Legge esclusivamente window.FORTRESS_ARMI (già la vista arricchita, mai
   mutata qui: filtro/ordino sempre su copie). Nessuna azione di gioco:
   niente acquisto, equip, loot o modifica di stato da questa sezione.
   ========================================================================= */

const RARITY_LABELS = {
  comune: "Comune", "non-comune": "Non comune", rara: "Rara",
  epica: "Epica", leggendaria: "Leggendaria", mitica: "Mitica"
};
const RANGE_LABELS = { vicino: "Vicino", medio: "Medio", lontano: "Lontano" };

/* Testo leggibile per ogni special, centralizzato in un solo posto (non
   ripetuto su card + dettaglio): rispecchia le regole reali applicate da
   engine/fortress-combat.js, mai inventato. */
const SPECIAL_INFO = {
  none: { label: "Nessuno", text: () => "Nessun effetto speciale." },
  rangeless: { label: "Gittata universale", text: () => "Nessun bonus né malus di gittata: funziona sempre allo stesso modo." },
  ignoreShield: {
    label: (n) => `Perfora Scudo (${n === 2 ? 2 : 1})`,
    text: (n) => (n === 2 ? "2 danni ignorano lo Scudo." : "1 danno ignora lo Scudo.")
  },
  critOnSix: { label: "Critico sul 6", text: () => "Con un 6 il dado vale 12." },
  rerollOnes: { label: "Rilancia gli 1", text: () => "Rilancia una volta ogni dado che mostra 1." },
  areaDamage: { label: "Danno ad area", text: () => "Colpisce anche fino a 2 nemici vicini al 50% del danno." },
  suppress: { label: "Marchia il bersaglio", text: () => "Il prossimo alleato che colpisce questo nemico tira un dado in più." },
  silent: { label: "Silenzioso", text: () => "Questo attacco non genera Rumore." },
  chainStrike: { label: "Colpo in catena", text: () => "Colpisce anche un secondo nemico vicino al 50% del danno." },
  executionerStrike: { label: "Colpo di grazia", text: () => "Contro un nemico già ferito (sotto metà vita) infligge danno extra." },
  silentKill: { label: "Uccisione silenziosa", text: () => "Se elimina il bersaglio: azzera il Rumore e blocca i Rinforzi per il resto dello scontro." }
};

function specialInfo(special) {
  const s = special || { type: "none" };
  const info = SPECIAL_INFO[s.type] || SPECIAL_INFO.none;
  return {
    label: typeof info.label === "function" ? info.label(s.n) : info.label,
    text: info.text(s.n)
  };
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* Uniche fonti di verità per etichette categoria/rarità: quelle già esposte
   dal catalogo, mai un secondo elenco duplicato. */
const libraryCategories = () => window.FORTRESS_CATEGORIE_ARMI || {};
const libraryRarityOrder = () => (window.FORTRESS_ARMI_API && window.FORTRESS_ARMI_API.RARITY_ORDER) || Object.keys(RARITY_LABELS);

const libraryState = { search: "", category: "all", rarity: "all", sort: "catalogo" };

function populateLibraryFilters() {
  const catSel = $("fa-library-category");
  catSel.innerHTML = ['<option value="all">Tutte</option>']
    .concat(Object.entries(libraryCategories()).map(([key, label]) => `<option value="${key}">${label}</option>`))
    .join("");

  const raritySel = $("fa-library-rarity");
  raritySel.innerHTML = ['<option value="all">Tutte</option>']
    .concat(libraryRarityOrder().map((r) => `<option value="${r}">${RARITY_LABELS[r] || r}</option>`))
    .join("");

  const sortSel = $("fa-library-sort");
  sortSel.innerHTML = [
    ["catalogo", "Ordine catalogo"],
    ["name-asc", "Nome A-Z"],
    ["potenza-asc", "POTENZA crescente"],
    ["potenza-desc", "POTENZA decrescente"],
    ["rarity-asc", "Rarità crescente"],
    ["rarity-desc", "Rarità decrescente"]
  ].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

/* Filtra e ordina SEMPRE su una copia: ARMI (window.FORTRESS_ARMI) non viene
   mai mutato da questa sezione. */
function getFilteredWeapons() {
  const q = libraryState.search.trim().toLowerCase();
  const filtered = ARMI.filter((w) => {
    if (libraryState.category !== "all" && w.category !== libraryState.category) return false;
    if (libraryState.rarity !== "all" && w.rarity !== libraryState.rarity) return false;
    if (q && !w.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const rarityOrder = libraryRarityOrder();
  switch (libraryState.sort) {
    case "name-asc": filtered.sort((a, b) => a.name.localeCompare(b.name, "it")); break;
    case "potenza-asc": filtered.sort((a, b) => a.potenza - b.potenza); break;
    case "potenza-desc": filtered.sort((a, b) => b.potenza - a.potenza); break;
    case "rarity-asc": filtered.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)); break;
    case "rarity-desc": filtered.sort((a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)); break;
    default: break; // "catalogo": ARMI.filter() preserva già l'ordine originale delle 100 armi
  }
  return filtered;
}

function libraryCardMarkup(w) {
  const sp = specialInfo(w.special);
  return `<article class="fa-lib-card" data-open-weapon="${w.id}" tabindex="0" role="button" aria-label="Dettagli di ${w.name}">
    <div class="fa-lib-card-img">${imgOrNothing(w.image, w.name, "fa-lib-img")}</div>
    <h3 class="fa-lib-name">${w.name}</h3>
    <span class="fa-rarity-tag rarity-${w.rarity}">${RARITY_LABELS[w.rarity] || w.rarity}</span>
    <div class="fa-lib-potenza">POTENZA <b>${w.potenza}</b></div>
    <div class="fa-lib-meta">
      <span>🎲 ${w.baseDice}</span>
      <span>📏 ${RANGE_LABELS[w.range] || w.range}</span>
      <span>${libraryCategories()[w.category] || w.category}</span>
    </div>
    <div class="fa-lib-special">${sp.label}</div>
  </article>`;
}

function renderLibraryGrid() {
  const list = getFilteredWeapons();
  const filtersActive = Boolean(libraryState.search) || libraryState.category !== "all" || libraryState.rarity !== "all";
  $("fa-library-count").textContent = filtersActive ? `${list.length} di ${ARMI.length} armi` : `${ARMI.length} armi`;
  $("fa-library-grid").innerHTML = list.length
    ? list.map(libraryCardMarkup).join("")
    : `<p class="fa-lib-empty">Nessuna arma trovata.</p>`;
}

function openWeaponDetail(id) {
  const w = arma(id);
  if (!w) return;
  const sp = specialInfo(w.special);
  $("fa-weapon-detail-content").innerHTML = `
    <button type="button" class="fa-btn fa-btn-ghost fa-modal-close" id="fa-weapon-detail-close">✕ Chiudi</button>
    <div class="fa-detail-img">${imgOrNothing(w.image, w.name, "fa-detail-img-el")}</div>
    <h2>${w.name}</h2>
    <span class="fa-rarity-tag rarity-${w.rarity}">${RARITY_LABELS[w.rarity] || w.rarity}</span>
    <p class="fa-detail-desc">${w.description || ""}</p>
    <div class="fa-detail-stats">
      <div><span>Categoria</span><b>${libraryCategories()[w.category] || w.category}</b></div>
      <div><span>Archetipo</span><b>${capitalize(w.archetype)}</b></div>
      <div><span>POTENZA</span><b>${w.potenza}</b></div>
      <div><span>Power</span><b>+${w.power}</b></div>
      <div><span>Dadi base</span><b>🎲 ${w.baseDice}</b></div>
      <div><span>Gittata</span><b>📏 ${RANGE_LABELS[w.range] || w.range}</b></div>
    </div>
    <div class="fa-detail-special">
      <h3>${sp.label}</h3>
      <p>${sp.text}</p>
    </div>
  `;
  $("fa-weapon-detail").hidden = false;
}

function closeWeaponDetail() {
  $("fa-weapon-detail").hidden = true;
  $("fa-weapon-detail-content").innerHTML = "";
}

function openLibrary() {
  $("fa-library").hidden = false;
  renderLibraryGrid();
}

function closeLibrary() {
  $("fa-library").hidden = true;
  closeWeaponDetail();
}

function bindLibraryEvents() {
  $("fa-open-library").addEventListener("click", openLibrary);
  $("fa-library-close").addEventListener("click", closeLibrary);

  $("fa-library-search").addEventListener("input", (ev) => {
    libraryState.search = ev.target.value;
    renderLibraryGrid();
  });
  $("fa-library-category").addEventListener("change", (ev) => {
    libraryState.category = ev.target.value;
    renderLibraryGrid();
  });
  $("fa-library-rarity").addEventListener("change", (ev) => {
    libraryState.rarity = ev.target.value;
    renderLibraryGrid();
  });
  $("fa-library-sort").addEventListener("change", (ev) => {
    libraryState.sort = ev.target.value;
    renderLibraryGrid();
  });

  $("fa-library-grid").addEventListener("click", (ev) => {
    const card = ev.target.closest("[data-open-weapon]");
    if (card) openWeaponDetail(card.dataset.openWeapon);
  });
  $("fa-library-grid").addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const card = ev.target.closest("[data-open-weapon]");
    if (!card) return;
    ev.preventDefault();
    openWeaponDetail(card.dataset.openWeapon);
  });

  $("fa-library").addEventListener("click", (ev) => {
    if (ev.target === $("fa-library")) closeLibrary();
  });
  $("fa-weapon-detail").addEventListener("click", (ev) => {
    if (ev.target === $("fa-weapon-detail") || ev.target.closest("#fa-weapon-detail-close")) closeWeaponDetail();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    if (!$("fa-weapon-detail").hidden) closeWeaponDetail();
    else if (!$("fa-library").hidden) closeLibrary();
  });
}

/* =========================================================================
   AVVIO
   ========================================================================= */

loadState();
bindEvents();
populateLibraryFilters();
bindLibraryEvents();
renderAll();
