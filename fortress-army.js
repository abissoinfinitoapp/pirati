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

/* Catalogo Armi vero (100 voci) in catalog/fortress-armi.js, caricato prima
   di questo file. Fallback minimo se per qualche motivo non è disponibile. */
const ARMI = window.FORTRESS_ARMI || [
  { id: "spada-arrugginita", name: "Spada Arrugginita", category: "mischia", rarity: "comune", cost: 15, bonus: 1 }
];
const CATEGORIE_ARMI = window.FORTRESS_CATEGORIE_ARMI || { mischia: "Mischia" };

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
  renderWeaponsShop();
  renderShop("fa-skins", SKIN, "skins", "equippedSkinId", () => "solo estetica");
  renderLog();
}

function renderStatus() {
  $("fa-home-castle").textContent = HOME_CASTLE_NAME;
  $("fa-money").textContent = state.money;
  $("fa-conquered-count").textContent = `${state.conqueredCastleIds.length}/${CASTELLI.length}`;
  const w = equippedWeapon();
  $("fa-equipped-weapon").textContent = w ? `${w.name} (+${w.bonus})` : "Nessuna";
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
  $("fa-battle-sub").textContent = `Ogni giocatore attivo tira 1d6. La media${w ? ` + il bonus di ${w.name} (+${w.bonus})` : ""} deve superare la difesa (${c.defense}).`;

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

/* Armeria: 100 armi raggruppate per categoria in accordion (altrimenti una
   griglia sola sarebbe ingestibile). openWeaponCats non è salvato: è solo
   lo stato "aperto/chiuso" di questa sessione di gioco. */
let openWeaponCats = new Set();

function weaponCardMarkup(item) {
  const owned = state.weapons.includes(item.id);
  const isEquipped = state.equippedWeaponId === item.id;
  const canAfford = state.money >= item.cost;
  return `<div class="fa-shop-card rarity-${item.rarity} ${owned ? "is-owned" : ""} ${isEquipped ? "is-equipped" : ""}">
    ${imgOrNothing(`assets/fortress/weapons/${item.id}.webp`, item.name, "fa-shop-img")}
    <span class="fa-rarity-tag rarity-${item.rarity}">${item.rarity}</span>
    <h3>${item.name}</h3>
    <span class="fa-shop-cost">+${item.bonus} all'attacco</span>
    ${owned
      ? (isEquipped
          ? `<span class="fa-owned-tag">Equipaggiata</span>`
          : `<button type="button" class="fa-btn fa-btn-ghost" data-equip="weapons:${item.id}">Equipaggia</button>`)
      : `<button type="button" class="fa-btn fa-btn-primary" data-buy="weapons:${item.id}" ${canAfford ? "" : "disabled"}>Compra · ${item.cost}💰</button>`}
  </div>`;
}

function renderWeaponsShop() {
  const box = $("fa-weapons");
  box.innerHTML = Object.keys(CATEGORIE_ARMI).map((catKey) => {
    const items = ARMI.filter((a) => a.category === catKey);
    if (!items.length) return "";
    const ownedCount = items.filter((i) => state.weapons.includes(i.id)).length;
    return `<details class="fa-shop-category" data-cat="${catKey}" ${openWeaponCats.has(catKey) ? "open" : ""}>
      <summary>${CATEGORIE_ARMI[catKey]} <span class="fa-cat-count">${ownedCount}/${items.length}</span></summary>
      <div class="fa-shop-grid">${items.map(weaponCardMarkup).join("")}</div>
    </details>`;
  }).join("");
  box.querySelectorAll("details[data-cat]").forEach((d) => {
    d.addEventListener("toggle", () => {
      if (d.open) openWeaponCats.add(d.dataset.cat);
      else openWeaponCats.delete(d.dataset.cat);
    });
  });
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
  const total = avg + (w ? w.bonus : 0);
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
      buyItem(key, id, key === "weapons" ? ARMI : SKIN);
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
   AVVIO
   ========================================================================= */

loadState();
bindEvents();
renderAll();
