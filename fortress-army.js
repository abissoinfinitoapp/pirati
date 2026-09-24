/* =============================================================================
   Fortress Army — Libreria Armi (sola consultazione) + Guardaroba (skin
   cosmetiche). Il gameplay vero (mappa a zone, Turn Director, combattimento
   a dadi fisici) vive in fortress-game-ui.js, un modulo separato apposta per
   non far crescere questo file oltre le sue due sezioni indipendenti dalla
   partita.

   Il vecchio scheletro v0 (castelli/battaglia a monete/roster libero) è
   stato rimosso: non era mai stato collegato al loop/Director reali.
   ========================================================================= */

const STORAGE_KEY = "fortress-army-state-v2";

/* Catalogo Armi vero (100 voci, schema v2.4) in catalog/fortress-armi.js,
   caricato prima di questo file. Usato qui solo dalla Libreria (consultazione). */
const ARMI = window.FORTRESS_ARMI || [];

/* Catalogo Skin vero (50 voci, 10 personaggi x 5 tier) in
   catalog/fortress-skins.js. 100% estetico: nessun campo di gameplay letto
   o scritto da questo file. Motore puro in engine/fortress-skins-core.js. */
const SKINS = window.FORTRESS_SKINS || [];
const SKIN_RARITY_ORDER = (window.FORTRESS_SKINS_CATALOG && window.FORTRESS_SKINS_CATALOG.RARITY_ORDER) || [];
const CHARACTERS_FOR_SKINS = window.FORTRESS_CHARACTERS || [];
const skinsCore = window.FORTRESS_SKINS_CORE;

/* --- stato: solo Guardaroba (monete/skin possedute/equipaggiata per personaggio) ---
   "money" è una fixture DEV isolata (nessuna economia reale collegata):
   serve solo a testare acquisto -> possesso -> equip delle skin. */
let state = skinsCore.defaultState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state = Object.assign(skinsCore.defaultState(), saved);
  } catch (e) { /* salvataggio corrotto: si riparte da zero */ }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

/* --- helper --- */
const $ = (id) => document.getElementById(id);
const arma = (id) => ARMI.find((a) => a.id === id);

/* placeholder immagine: se il file non c'è, l'elemento sparisce da solo */
function imgOrNothing(src, alt, cls) {
  return `<img class="${cls}" src="${src}" alt="${alt}" onerror="this.remove()">`;
}

/* =========================================================================
   GUARDAROBA (skin cosmetiche) — 100% estetico: nessuna di queste funzioni
   legge o scrive poteri, statistiche, loot o stato di combattimento.
   ========================================================================= */

/* API pubblica per la mappa/token (fortress-game-ui.js) e per qualunque
   altra UI futura: deve solo chiedere "che immagine mostro per X". */
window.FORTRESS_SKINS_API = {
  getEquippedSkin: (characterId) => skinsCore.getEquippedSkin(state, SKINS, characterId),
  getCharacterDisplayImage: (characterId) => skinsCore.getCharacterDisplayImage(state, SKINS, CHARACTERS_FOR_SKINS, characterId)
};

/* Notifica UI-only (nessuno stato di gioco coinvolto): permette a
   fortress-game-ui.js di ridisegnare subito il token sulla mappa dopo un
   equip/unequip, senza aspettare la prossima azione di gioco. */
function notifySkinChanged(characterId) {
  window.dispatchEvent(new CustomEvent("fortress-skin-changed", { detail: { characterId } }));
}

const wardrobeState = { rarity: "all", characterId: "all" };

function populateWardrobeFilters() {
  const raritySel = $("fa-wardrobe-rarity");
  raritySel.innerHTML = ['<option value="all">Tutte</option>']
    .concat(SKIN_RARITY_ORDER.map((r) => `<option value="${r}">${RARITY_LABELS[r] || r}</option>`))
    .join("");

  const charSel = $("fa-wardrobe-character");
  charSel.innerHTML = ['<option value="all">Tutti</option>']
    .concat(CHARACTERS_FOR_SKINS.map((c) => `<option value="${c.id}">${c.name}</option>`))
    .join("");
}

function getFilteredSkins() {
  return SKINS.filter((s) =>
    (wardrobeState.rarity === "all" || s.rarity === wardrobeState.rarity) &&
    (wardrobeState.characterId === "all" || s.characterId === wardrobeState.characterId)
  );
}

/* stato visuale della card: "unavailable" | "equipped" | "owned" | "buyable" */
function skinCardState(skin) {
  if (!skin.assetReady) return "unavailable";
  const equippedId = skinsCore.getEquippedSkinId(state, skin.characterId);
  if (equippedId === skin.id) return "equipped";
  if (skinsCore.ownsSkin(state, skin)) return "owned";
  return "buyable";
}

function wardrobeCardMarkup(skin) {
  const character = CHARACTERS_FOR_SKINS.find((c) => c.id === skin.characterId);
  const cardState = skinCardState(skin);
  const rarityLabel = RARITY_LABELS[skin.rarity] || skin.rarity;

  let stateTag = "";
  let actionHtml = "";
  if (cardState === "unavailable") {
    stateTag = `<span class="fa-skin-tag fa-skin-tag-inarrivo">In arrivo</span>`;
  } else if (cardState === "equipped") {
    stateTag = `<span class="fa-owned-tag">Equipaggiata</span>`;
    actionHtml = `<button type="button" class="fa-btn fa-btn-ghost" data-unequip-skin="${skin.characterId}">Torna alla Base</button>`;
  } else if (cardState === "owned") {
    actionHtml = `<button type="button" class="fa-btn fa-btn-ghost" data-equip-skin="${skin.id}">Equipaggia</button>`;
  } else {
    const canAfford = state.money >= skin.price;
    actionHtml = `<button type="button" class="fa-btn fa-btn-primary" data-buy-skin="${skin.id}" ${canAfford ? "" : "disabled"}>Compra · ${skin.price}💰</button>`;
  }

  return `<article class="fa-shop-card ${cardState === "equipped" ? "is-equipped" : ""} ${cardState === "unavailable" ? "is-unavailable" : ""}">
    <div class="fa-shop-img-wrap">${imgOrNothing(skin.image, skin.name, "fa-shop-img")}</div>
    <h3>${skin.name}</h3>
    <div class="fa-shop-meta">
      <span class="fa-rarity-tag rarity-${skin.rarity}">${rarityLabel}</span>
      <span class="fa-skin-character">${character ? character.name : skin.characterId}</span>
    </div>
    ${stateTag}
    ${actionHtml}
  </article>`;
}

function renderWardrobe() {
  $("fa-money").textContent = state.money;
  const list = getFilteredSkins();
  $("fa-wardrobe-count").textContent = `${list.length} di ${SKINS.length} skin`;
  $("fa-wardrobe-grid").innerHTML = list.length
    ? list.map(wardrobeCardMarkup).join("")
    : `<p class="fa-lib-empty">Nessuna skin trovata.</p>`;
}

function renderAll() { renderWardrobe(); }

function bindEvents() {
  document.getElementById("fortress-app").addEventListener("click", (ev) => {
    const buy = ev.target.closest("[data-buy-skin]");
    if (buy) {
      state = skinsCore.buySkin(state, SKINS, buy.dataset.buySkin);
      saveState(); renderWardrobe();
      return;
    }
    const equip = ev.target.closest("[data-equip-skin]");
    if (equip) {
      const skin = skinsCore.findSkin(SKINS, equip.dataset.equipSkin);
      state = skinsCore.equipSkin(state, SKINS, equip.dataset.equipSkin);
      saveState(); renderWardrobe();
      if (skin) notifySkinChanged(skin.characterId);
      return;
    }
    const unequip = ev.target.closest("[data-unequip-skin]");
    if (unequip) {
      const characterId = unequip.dataset.unequipSkin;
      state = skinsCore.unequipSkin(state, characterId);
      saveState(); renderWardrobe();
      notifySkinChanged(characterId);
    }
  });

  $("fa-wardrobe-rarity").addEventListener("change", (ev) => {
    wardrobeState.rarity = ev.target.value;
    renderWardrobe();
  });
  $("fa-wardrobe-character").addEventListener("change", (ev) => {
    wardrobeState.characterId = ev.target.value;
    renderWardrobe();
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
populateWardrobeFilters();
populateLibraryFilters();
bindLibraryEvents();
renderAll();
