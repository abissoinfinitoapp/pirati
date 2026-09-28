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

   Persistence V1: roster e sessione attiva vengono salvati in localStorage.
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

  function getEquippedWeaponSlots(equipment) {
    if (!equipment) return [];
    return ["primary", "secondary"].filter((slot) => equipment[slot]);
  }

  function resolvePreferredWeaponSlot(equipment, preferredSlot) {
    const slots = getEquippedWeaponSlots(equipment);
    if (!slots.length) return null;
    if (preferredSlot && slots.includes(preferredSlot)) return preferredSlot;
    return slots.includes("primary") ? "primary" : slots[0];
  }

  function buildAttackFlowFromSelectedSlot(equipment, targets, preferredSlot) {
    const resolvedSlot = resolvePreferredWeaponSlot(equipment, preferredSlot);
    if (!resolvedSlot) return { step: "weapon" };
    const weapon = equipment[resolvedSlot];
    const autoTarget = pickAutoTarget(targets);
    if (autoTarget) return {
      step: "preview", weaponSlot: resolvedSlot, weapon, targetKind: autoTarget.kind, targetId: autoTarget.id || null
    };
    return { step: "target", weaponSlot: resolvedSlot, weapon };
  }

  /* L'ordine decisionale corretto e' arma -> bersaglio: la gittata
     dell'arma deve essere nota PRIMA di scegliere chi attaccare. Questa
     funzione pura costruisce solo lo stato UI iniziale, senza decidere
     quali bersagli siano validi (arrivano gia' filtrati dal motore). */
  function buildInitialAttackFlow(equipment, targets) {
    const autoSlot = pickAutoWeaponSlot(equipment);
    if (!autoSlot) return { step: "weapon" };
    const weapon = equipment[autoSlot];
    const autoTarget = pickAutoTarget(targets);
    if (autoTarget) return {
      step: "preview", weapon, targetKind: autoTarget.kind, targetId: autoTarget.id || null
    };
    return { step: "target", weapon };
  }

  /* Starter sempre disponibile + sole armi realmente SBLOCCATE
     nell'Arsenale. Nessuna arma della Libreria diventa utilizzabile per
     magia: gli id sconosciuti vengono ignorati e lo starter e' deduplicato. */
  function getStartingWeaponChoices(catalog, starterId, unlockedIds) {
    const byId = new Map((catalog || []).map((w) => [w.id, w]));
    const ids = [starterId].concat(Array.isArray(unlockedIds) ? unlockedIds : []);
    const seen = new Set();
    return ids.reduce((out, id) => {
      if (!id || seen.has(id) || !byId.has(id)) return out;
      seen.add(id); out.push(byId.get(id)); return out;
    }, []);
  }

  /* Action Hub mobile-first: decide SOLO quale vista UI locale mostrare.
     Nessuna regola di gioco: attacco/cassa hanno precedenza sulla lista azioni. */
  function getActionHubMode(uiState) {
    if (uiState && uiState.attackFlow) return "attack";
    if (uiState && uiState.tradeFlow) return "trade";
    if (uiState && uiState.chestResult) return "chest";
    return "actions";
  }

  /* Il piccolo hub vive accanto al movimento solo nella vista Node Graph e
     durante un vero turno giocatore. CAMBIA ZONA riporta volutamente
     alla World Map, quindi in quei due modi l'hub locale non è attivo. */
  function shouldUseActionHub(ctx) {
    return Boolean(ctx && ctx.magnifyMode && ctx.nodeId && ctx.directorPhase === "player-turn" && !ctx.moveMode && !ctx.scannerMode);
  }

  /* Pura, testabile in Node: trasforma l'esito già risolto dal motore in una
     sequenza narrativa esplicita. Non calcola danni e non decide KO: serve
     solo a evitare il vecchio riepilogo ambiguo "8 DANNI!", chiarendo
     sempre CHI attacca, CHI subisce e a cosa appartengono le statistiche. */
  function buildCombatResultView(result) {
    const actorType = result && result.actorType;
    const attackerName = String((result && result.attackerName) || (actorType === "player" ? "Giocatore" : actorType === "boss" ? "Boss" : "Nemico"));
    const targetName = String((result && result.targetName) || "Bersaglio");
    const total = Number(result && result.total) || 0;
    const shieldBefore = Number(result && result.shieldBefore) || 0;
    const shieldAfter = Number(result && result.shieldAfter) || 0;
    const ignoreShieldN = Number(result && result.ignoreShieldN) || 0;
    const isPlayerAttack = actorType === "player";

    return {
      heading: `${attackerName.toUpperCase()} ATTACCA ${targetName.toUpperCase()}`,
      rollLabel: isPlayerAttack ? "I TUOI DADI" : actorType === "boss" ? "TIRO DEL BOSS" : "TIRO DEL NEMICO",
      powerLabel: isPlayerAttack ? "POWER ARMA" : actorType === "boss" ? "POWER BOSS" : "POWER NEMICO",
      damageLabel: isPlayerAttack
        ? `HAI INFLITTO ${total} DANNI`
        : `${targetName.toUpperCase()} SUBISCE ${total} DANNI`,
      shieldLabel: `🛡️ Scudo ${targetName}`,
      healthLabel: `❤️ Salute ${targetName}`,
      // 0 → 0 non aggiunge informazione. Se invece uno special ignora uno
      // scudo esistente, mostrarlo invariato aiuta a capire dove è passato
      // il danno (la tag "IGNORATO LO SCUDO" spiega il perché).
      showShield: shieldBefore !== shieldAfter || (shieldBefore > 0 && ignoreShieldN > 0)
    };
  }

  /* Tactical slots V2: funzioni pure condivise tra runtime/editor e test.
     Ogni punto grafico ha identità propria e appartiene a un nodo gameplay,
     ma NON introduce nuovi collegamenti o regole di movimento. */
  function tacticalSlotId(nodeId, type, ordinal) {
    const clean = (v) => String(v || "slot").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
    return `${clean(nodeId)}-${clean(type)}-${String(Math.max(1, Number(ordinal) || 1)).padStart(2, "0")}`;
  }

  function normalizeTacticalNodeSlots(nodeId, bucket) {
    if (!bucket || typeof bucket !== "object") return {};
    const out = {};
    Object.entries(bucket).forEach(([type, raw]) => {
      const list = Array.isArray(raw) ? raw : [raw];
      const used = new Set();
      const normalized = list.reduce((acc, item, index) => {
        if (!item || !Number.isFinite(Number(item.x)) || !Number.isFinite(Number(item.y))) return acc;
        let id = item.id ? String(item.id) : tacticalSlotId(nodeId, type, index + 1);
        if (used.has(id)) id = tacticalSlotId(nodeId, type, index + 1);
        used.add(id);
        acc.push({
          id,
          parentNodeId: String(nodeId),
          type: String(type),
          x: Number(item.x),
          y: Number(item.y)
        });
        return acc;
      }, []);
      if (normalized.length) out[type] = normalized;
    });
    return out;
  }

  function stableStringHash(value) {
    let h = 2166136261;
    const s = String(value || "");
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function assignTacticalSlots(entities, slots, previousAssignments) {
    const activeIds = [...new Set((entities || []).map((e) => String(e && e.id || "")).filter(Boolean))].sort();
    const validSlots = (slots || []).filter((s) => s && s.id).slice().sort((a,b) => String(a.id).localeCompare(String(b.id)));
    const slotIds = new Set(validSlots.map((s) => String(s.id)));
    const used = new Set();
    const assigned = {};
    const previous = previousAssignments && typeof previousAssignments === "object" ? previousAssignments : {};

    activeIds.forEach((entityId) => {
      const prior = previous[entityId];
      if (prior && slotIds.has(String(prior)) && !used.has(String(prior))) {
        assigned[entityId] = String(prior);
        used.add(String(prior));
      }
    });

    activeIds.forEach((entityId) => {
      if (assigned[entityId] || used.size >= validSlots.length) return;
      const start = validSlots.length ? stableStringHash(entityId) % validSlots.length : 0;
      for (let step = 0; step < validSlots.length; step += 1) {
        const slotId = String(validSlots[(start + step) % validSlots.length].id);
        if (!used.has(slotId)) { assigned[entityId] = slotId; used.add(slotId); break; }
      }
    });
    return assigned;
  }

  /* Layout ufficiali incorporati nel progetto.
     Sono la baseline versionata: il localStorage può sovrascriverli solo dopo
     un esplicito Salva Layout dall'editor. */
  const OFFICIAL_ZONE_LAYOUTS = Object.freeze({
    forest: {"format":"fortress-army-zone-layout","version":4,"zoneId":"forest","entryNodeId":"forest-n01","nodes":[{"id":"forest-n01","x":40.02,"y":88.93,"anchors":{"players":[{"id":"forest-n01-players-01","parentNodeId":"forest-n01","type":"players","x":28.532110194487252,"y":81.18352754258456},{"id":"forest-n01-players-02","parentNodeId":"forest-n01","type":"players","x":50.13742346324616,"y":67.4487409137544},{"id":"forest-n01-players-03","parentNodeId":"forest-n01","type":"players","x":29.798442651512282,"y":86.33763222467333},{"id":"forest-n01-players-04","parentNodeId":"forest-n01","type":"players","x":46.33027898594015,"y":85.469241516895},{"id":"forest-n01-players-05","parentNodeId":"forest-n01","type":"players","x":39.08257167133215,"y":83.75495665377977},{"id":"forest-n01-players-06","parentNodeId":"forest-n01","type":"players","x":47.43472008045233,"y":76.76091103326706},{"id":"forest-n01-players-07","parentNodeId":"forest-n01","type":"players","x":33.76146832657082,"y":82.64384441238806},{"id":"forest-n01-players-08","parentNodeId":"forest-n01","type":"players","x":50.18323338127585,"y":84.43287031991142},{"id":"forest-n01-players-09","parentNodeId":"forest-n01","type":"players","x":40.76452407385281,"y":78.67559315450082},{"id":"forest-n01-players-10","parentNodeId":"forest-n01","type":"players","x":36.48318114092198,"y":77.5962264581425}],"vehicle":[{"id":"forest-n01-vehicle-01","parentNodeId":"forest-n01","type":"vehicle","x":44.49606764981257,"y":64.00752597384982}],"chest":[{"id":"forest-n01-chest-01","parentNodeId":"forest-n01","type":"chest","x":39.78593180343685,"y":76.32638649158395}],"loot":[{"id":"forest-n01-loot-01","parentNodeId":"forest-n01","type":"loot","x":56.60550132502975,"y":59.05654478116391}],"shelter":[{"id":"forest-n01-shelter-01","parentNodeId":"forest-n01","type":"shelter","x":59.848836706766384,"y":72.84557115463983}],"boost":[{"id":"forest-n01-boost-01","parentNodeId":"forest-n01","type":"boost","x":44.587158442004956,"y":82.7708302255663}]}},{"id":"forest-n02","x":63.8,"y":57.16,"anchors":{"enemies":[{"id":"forest-n02-enemies-01","parentNodeId":"forest-n02","type":"enemies","x":61.956023736860075,"y":52.845568770454044},{"id":"forest-n02-enemies-02","parentNodeId":"forest-n02","type":"enemies","x":70.75125749231526,"y":49.72387484141759},{"id":"forest-n02-enemies-03","parentNodeId":"forest-n02","type":"enemies","x":65.11681371826498,"y":37.66038803827195},{"id":"forest-n02-enemies-04","parentNodeId":"forest-n02","type":"enemies","x":50.64131997988691,"y":49.93551787875947},{"id":"forest-n02-enemies-05","parentNodeId":"forest-n02","type":"enemies","x":82.11177116731811,"y":53.37467091424125},{"id":"forest-n02-enemies-06","parentNodeId":"forest-n02","type":"enemies","x":87.28813463360024,"y":82.05191555477323},{"id":"forest-n02-enemies-07","parentNodeId":"forest-n02","type":"enemies","x":75.83600741338091,"y":79.03604337147304},{"id":"forest-n02-enemies-08","parentNodeId":"forest-n02","type":"enemies","x":77.34768438161737,"y":45.33234289714268},{"id":"forest-n02-enemies-09","parentNodeId":"forest-n02","type":"enemies","x":57.46679016849456,"y":61.57572712217059},{"id":"forest-n02-enemies-10","parentNodeId":"forest-n02","type":"enemies","x":37.99816634511023,"y":46.231812181926905},{"id":"forest-n02-enemies-11","parentNodeId":"forest-n02","type":"enemies","x":58.199729984440864,"y":33.110119047619044},{"id":"forest-n02-enemies-12","parentNodeId":"forest-n02","type":"enemies","x":46.01465665743234,"y":42.739751906622026},{"id":"forest-n02-enemies-13","parentNodeId":"forest-n02","type":"enemies","x":52.8401331368829,"y":40.83498557408651},{"id":"forest-n02-enemies-14","parentNodeId":"forest-n02","type":"enemies","x":61.36051996584576,"y":75.54398230143956},{"id":"forest-n02-enemies-15","parentNodeId":"forest-n02","type":"enemies","x":87.19652108838376,"y":64.37996194476173}],"shelter":[{"id":"forest-n02-shelter-01","parentNodeId":"forest-n02","type":"shelter","x":57.69583346780009,"y":46.91964467366537}],"chest":[{"id":"forest-n02-chest-01","parentNodeId":"forest-n02","type":"chest","x":91.68574836590638,"y":53.16303253173829}],"loot":[{"id":"forest-n02-loot-01","parentNodeId":"forest-n02","type":"loot","x":95.76271783537632,"y":30.729168483189174}],"trap":[{"id":"forest-n02-trap-01","parentNodeId":"forest-n02","type":"trap","x":68.27759740882698,"y":32.26355779738653}],"vehicle":[{"id":"forest-n02-vehicle-01","parentNodeId":"forest-n02","type":"vehicle","x":85.95969104663962,"y":39.30059705461775}]}},{"id":"forest-n03","x":22.6,"y":58.35,"anchors":{"enemies":[{"id":"forest-n03-enemies-01","parentNodeId":"forest-n03","type":"enemies","x":15.277142140525982,"y":57.50165507906959},{"id":"forest-n03-enemies-02","parentNodeId":"forest-n03","type":"enemies","x":4.420521836742435,"y":42.89847805386498},{"id":"forest-n03-enemies-03","parentNodeId":"forest-n03","type":"enemies","x":37.311042738036534,"y":45.914352280753},{"id":"forest-n03-enemies-04","parentNodeId":"forest-n03","type":"enemies","x":30.48556940400743,"y":26.65509201231457},{"id":"forest-n03-enemies-05","parentNodeId":"forest-n03","type":"enemies","x":25.26340231053853,"y":16.390544573465984}],"shelter":[{"id":"forest-n03-shelter-01","parentNodeId":"forest-n03","type":"shelter","x":19.85799239952942,"y":68.03075801758538}],"chest":[{"id":"forest-n03-chest-01","parentNodeId":"forest-n03","type":"chest","x":22.514889009715013,"y":47.29001646950131}],"loot":[{"id":"forest-n03-loot-01","parentNodeId":"forest-n03","type":"loot","x":47.06825331790064,"y":42.4222883724031}],"trap":[{"id":"forest-n03-trap-01","parentNodeId":"forest-n03","type":"trap","x":33.279889477439184,"y":39.35350974400838}],"structure":[{"id":"forest-n03-structure-01","parentNodeId":"forest-n03","type":"structure","x":5.199266852586238,"y":30.464616616566975}],"vehicle":[{"id":"forest-n03-vehicle-01","parentNodeId":"forest-n03","type":"vehicle","x":22.59713721532272,"y":74.35151672363281}]}},{"id":"forest-n04","x":48.53,"y":26.18,"anchors":{"enemies":[{"id":"forest-n04-enemies-01","parentNodeId":"forest-n04","type":"enemies","x":27.09573926871845,"y":19.141865684872585},{"id":"forest-n04-enemies-02","parentNodeId":"forest-n04","type":"enemies","x":48.52761300626204,"y":30.182208591037327},{"id":"forest-n04-enemies-03","parentNodeId":"forest-n04","type":"enemies","x":44.82363653371788,"y":8.295304434640068},{"id":"forest-n04-enemies-04","parentNodeId":"forest-n04","type":"enemies","x":17.567568842738428,"y":9.406414940243675},{"id":"forest-n04-enemies-05","parentNodeId":"forest-n04","type":"enemies","x":24.576272412621922,"y":5.75562250046503},{"id":"forest-n04-enemies-06","parentNodeId":"forest-n04","type":"enemies","x":87.37975446965962,"y":25.96726372128441},{"id":"forest-n04-enemies-07","parentNodeId":"forest-n04","type":"enemies","x":37.17361298394747,"y":30.411705743698846},{"id":"forest-n04-enemies-08","parentNodeId":"forest-n04","type":"enemies","x":71.80486044362647,"y":18.665675208682107},{"id":"forest-n04-enemies-09","parentNodeId":"forest-n04","type":"enemies","x":78.08062419756368,"y":21.787367321196058},{"id":"forest-n04-enemies-10","parentNodeId":"forest-n04","type":"enemies","x":42.258362905013115,"y":22.686842055547803},{"id":"forest-n04-enemies-11","parentNodeId":"forest-n04","type":"enemies","x":94.98396181055743,"y":34.00959014892578},{"id":"forest-n04-enemies-12","parentNodeId":"forest-n04","type":"enemies","x":93.70133443246941,"y":21.73446110316685},{"id":"forest-n04-enemies-13","parentNodeId":"forest-n04","type":"enemies","x":69.28538415126559,"y":37.501656668526785},{"id":"forest-n04-enemies-14","parentNodeId":"forest-n04","type":"enemies","x":55.542830228833814,"y":31.41699654715402},{"id":"forest-n04-enemies-15","parentNodeId":"forest-n04","type":"enemies","x":62.780577098022846,"y":38.82440476190476}],"chest":[{"id":"forest-n04-chest-01","parentNodeId":"forest-n04","type":"chest","x":55.9092969913855,"y":10.782076517740885}],"loot":[{"id":"forest-n04-loot-01","parentNodeId":"forest-n04","type":"loot","x":65.94136707942774,"y":16.496364048549104}],"shelter":[{"id":"forest-n04-shelter-01","parentNodeId":"forest-n04","type":"shelter","x":40.10535966604683,"y":12.528108869280134}],"trap":[{"id":"forest-n04-trap-01","parentNodeId":"forest-n04","type":"trap","x":34.333486137907485,"y":23.004302978515625}],"structure":[{"id":"forest-n04-structure-01","parentNodeId":"forest-n04","type":"structure","x":97.09115513149403,"y":27.448745000930057}],"boost":[{"id":"forest-n04-boost-01","parentNodeId":"forest-n04","type":"boost","x":56.41319979886917,"y":21.628635951450892}],"vehicle":[{"id":"forest-n04-vehicle-01","parentNodeId":"forest-n04","type":"vehicle","x":60.4901503958104,"y":10.358795892624627}]}}],"edges":[["forest-n01","forest-n02"],["forest-n02","forest-n03"],["forest-n02","forest-n04"],["forest-n03","forest-n04"]]}
  });

  function officialZoneConfig(zoneId) {
    const config = OFFICIAL_ZONE_LAYOUTS[String(zoneId || "")];
    return config ? JSON.parse(JSON.stringify(config)) : null;
  }

  function tacticalLayoutFromPortableConfig(config) {
    if (!config || !config.zoneId) return null;
    const out = { version:2, zoneId:String(config.zoneId), nodes:{} };
    (config.nodes || []).forEach((node) => {
      if (!node || !node.id || !node.anchors || typeof node.anchors !== "object") return;
      const normalized = normalizeTacticalNodeSlots(String(node.id), node.anchors);
      if (Object.keys(normalized).length) out.nodes[String(node.id)] = normalized;
    });
    return out;
  }

  if (typeof module === "object" && module.exports) {
    // In Node esponiamo solo le funzioni pure sopra, per i test: il resto di
    // questo file è browser-only (window/DOM) e si ferma qui.
    module.exports = { zoneLayoutStyle, pickAutoTarget, pickAutoWeaponSlot, getEquippedWeaponSlots, resolvePreferredWeaponSlot, buildInitialAttackFlow, buildAttackFlowFromSelectedSlot, getStartingWeaponChoices, getActionHubMode, shouldUseActionHub, buildCombatResultView, tacticalSlotId, normalizeTacticalNodeSlots, assignTacticalSlots, officialZoneConfig, tacticalLayoutFromPortableConfig };
    return;
  }

  const loop = window.FORTRESS_LOOP;
  const director = window.FORTRESS_DIRECTOR;
  const combat = window.FORTRESS_COMBAT;
  const ZONES = window.FORTRESS_ZONES || [];
  const zonesApi = window.FORTRESS_ZONES_API;
  const zoneDirectorApi = window.FORTRESS_ZONE_DIRECTOR;
  const CHARACTERS = window.FORTRESS_CHARACTERS || [];
  const ARMI = window.FORTRESS_ARMI || [];
  const ITEMS = window.FORTRESS_ITEMS;
  const loot = window.FORTRESS_LOOT;
  const giftMachineApi = window.FORTRESS_GIFT_MACHINE || null;
  const weaponsApi = window.FORTRESS_ARMI_API || null;
  const arsenalApi = window.FORTRESS_ARSENAL_API || null;
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
     LOADOUT INIZIALE — scelta preparatoria dall'Arsenale.
     Lo starter e' sempre disponibile; le altre scelte devono essere realmente
     sbloccate per l'avatar scelto. L'assegnazione e' diretta allo slot primary:
     non passa da equipFoundWeapon, quindi NON conta come arma trovata nella run.
     Secondary parte vuoto: resta importante trovare armi durante la partita.
     ========================================================================= */
  function startingChoicesForSetupPlayer(setupPlayer) {
    const unlocked = setupPlayer && setupPlayer.avatarId && arsenalApi
      ? arsenalApi.getUnlockedWeaponIds(setupPlayer.avatarId)
      : [];
    return getStartingWeaponChoices(ARMI, loot.STARTER_WEAPON_ID, unlocked);
  }

  function applyStartingEquipment(state, activePlayers) {
    state.players.forEach((p, i) => {
      const setupPlayer = activePlayers[i];
      const choices = startingChoicesForSetupPlayer(setupPlayer);
      const selectedId = setupPlayer && setupPlayer.startingWeaponId;
      const weapon = choices.find((w) => w.id === selectedId) || choices[0] || null;
      p.equipment.primary = weapon;
      p.equipment.secondary = null;
    });
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
  let scannerMode = false; // legacy UI flag mantenuto solo per compatibilità; Scanner ora agisce localmente sulle casse
  let magnifyMode = true; // Zone Magnify V1: vista nodi della zona corrente invece della World Map
  let actionHubWeaponSlot = "primary"; // stato solo-UI: una sola arma attiva per volta nel piccolo hub locale
  let launchFlow = null;      // { mode: "initial"|"move", playerId, zoneId } — D6 fisico prima di entrare in zona
  let attackFlow = null;      // { step: "target"|"weapon"|"preview", weaponSlot, targetKind, targetId, weapon }
  let vehicleFlow = null;     // { step:"crew"|"target", initiatorId, pilotId, gunnerIds[], gunnerTargets[] }
  let partyBoostFlow = null;  // { step:"declare"|"roll"|"result", initiatorId, participantIds, choices, rolls, result }
  let tradeFlow = null;       // { targetId } — scelta esplicita dell'oggetto da dare a un compagno
  let destinyFlow = false;    // KO: scelta fisica del D6 per il rialzo del destino
  let attackActorId = null;   // playerId di chi ha dichiarato l'attacco in corso (Guided Turn UI: serve dopo il CONTINUA per capire se il turno è cambiato)
  let diceSelections = null;  // array di risultati 1-6 in corso di inserimento
  let pendingResult = null;   // esito già risolto dal motore, in attesa del CONTINUA
  let chestResult = null;     // { weapon, support } appena trovati aprendo una cassa, in attesa di PRENDI/CHIUDI (Guided Turn UI)
  let turnTransition = null;  // { name, zoneName } — "ORA TOCCA A ..." mostrato quando il turno passa a un altro giocatore (Guided Turn UI, solo presentazione: mai gameState/Director state)
  let eventLog = [];
  let presenceOpen = false;
  let savedSession = null;
  let mapEditorState = { zoneId: null, draft: null, selectedNodeId: null, connectMode: false, connectFromId: null, dirty: false, status: "", drag: null, suppressClick: false, tacticalMode: false, anchorDraft: null, selectedAnchor: null, anchorDrag: null };
  let giftMachineFlow = null; // { participantIds, index, step, roll, reward, seenWeaponIds } · step: handoff | roll | armed | animating | reward | slot | done
  let giftRiveInstance = null;
  let giftRiveTrigger = null;
  let giftRevealTimer = null;
  let giftAnimationStartedAt = 0;
  const GIFT_RIVE_SRC = "assets/fortress/rive/macchinario_regali.riv";
  const GIFT_RIVE_MACHINE_CANDIDATES = ["regalo", "State Machine 1"];
  const GIFT_RIVE_TRIGGER_NAME = "start";
  const GIFT_REVEAL_FALLBACK_MS = 5000;


  function isLanding() { return game && !game.dir; }

  /* =========================================================================
     SETUP PARTITA
     ========================================================================= */
  const MAX_PLAYERS = 10; // pari al numero di personaggi/avatar disponibili in catalog/fortress-characters.js
  const SESSION_STORAGE_KEY = "fortress-army-active-session-v1";
  const ROSTER_STORAGE_KEY = "fortress-army-roster-v1";
  const SESSION_VERSION = 1;
  const MAP_LAYOUT_STORAGE_KEY = "fortress-army-node-layouts-v1";
  const TACTICAL_ANCHOR_STORAGE_KEY = "fortress-army-tactical-anchors-v1";
  const BASE_MAP_LAYOUTS = Object.fromEntries(ZONES.map((z) => [z.id, zoneDirectorApi.cloneNodeLayout(z)]));

  function defaultSetupPlayers() {
    return Array.from({ length: MAX_PLAYERS }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1), avatarId: null, startingWeaponId: null, present: i < 2 }));
  }

  function loadRoster() {
    try {
      const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.players)) return;
      const defaults = defaultSetupPlayers();
      setupPlayers = defaults.map((d, i) => Object.assign({}, d, saved.players[i] || {}, { id: d.id, present: saved.players[i] ? saved.players[i].present !== false : d.present }));
      setupCount = Math.max(2, Math.min(MAX_PLAYERS, Number(saved.count) || 2));
    } catch (e) {}
  }

  function saveRoster() {
    if (!setupPlayers) return;
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify({ version: 1, count: setupCount, players: setupPlayers }));
    } catch (e) {}
  }

  function ensureSetupPlayers() {
    if (!setupPlayers) setupPlayers = defaultSetupPlayers();
  }

  function loadSavedSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== SESSION_VERSION || !parsed.game || !parsed.game.state) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function clearSavedSession() {
    try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) {}
    savedSession = null;
  }

  function persistSession() {
    if (uiMode !== "game" || !game) return;
    ensureSetupPlayers();
    try {
      const snapshot = {
        version: SESSION_VERSION, savedAt: new Date().toISOString(),
        game, roster: { count: setupCount, players: setupPlayers },
        ui: {
          magnifyMode, moveMode, scannerMode, actionHubWeaponSlot, launchFlow, attackFlow, vehicleFlow, partyBoostFlow, tradeFlow, destinyFlow,
          attackActorId, diceSelections, pendingResult, chestResult, turnTransition, eventLog, presenceOpen
        }
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
      savedSession = snapshot;
    } catch (e) {}
  }

  function resumeSavedSession() {
    const snapshot = savedSession || loadSavedSession();
    if (!snapshot) return;
    game = snapshot.game;
    (game.state.players || []).forEach((p) => { if (p.present == null) p.present = true; });
    if (snapshot.roster && Array.isArray(snapshot.roster.players)) {
      setupCount = Math.max(2, Math.min(MAX_PLAYERS, Number(snapshot.roster.count) || 2));
      const defaults = defaultSetupPlayers();
      setupPlayers = defaults.map((d, i) => Object.assign({}, d, snapshot.roster.players[i] || {}, { id: d.id }));
      saveRoster();
    }
    if (snapshot.ui) {
      magnifyMode = snapshot.ui.magnifyMode !== false;
      moveMode = Boolean(snapshot.ui.moveMode); scannerMode = Boolean(snapshot.ui.scannerMode);
      actionHubWeaponSlot = snapshot.ui.actionHubWeaponSlot || "primary";
      launchFlow = snapshot.ui.launchFlow || null;
      attackFlow = snapshot.ui.attackFlow || null; vehicleFlow = snapshot.ui.vehicleFlow || null; partyBoostFlow = snapshot.ui.partyBoostFlow || null; tradeFlow = snapshot.ui.tradeFlow || null; destinyFlow = Boolean(snapshot.ui.destinyFlow);
      attackActorId = snapshot.ui.attackActorId || null; diceSelections = snapshot.ui.diceSelections || null; pendingResult = snapshot.ui.pendingResult || null;
      chestResult = snapshot.ui.chestResult || null; turnTransition = snapshot.ui.turnTransition || null; eventLog = Array.isArray(snapshot.ui.eventLog) ? snapshot.ui.eventLog : [];
      presenceOpen = Boolean(snapshot.ui.presenceOpen);
    }
    uiMode = "game";
    render();
  }

  function renderSetup() {
    ensureSetupPlayers();
    const countOptions = Array.from({ length: MAX_PLAYERS - 1 }, (_, i) => i + 2); // 2..MAX_PLAYERS
    const countSelect = `<div class="fa-setup-count"><label for="fa-setup-count-select">Bambini registrati nel roster</label>
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

      let loadout = "";
      if (p.avatarId) {
        const choices = startingChoicesForSetupPlayer(p);
        if (!choices.some((w) => w.id === p.startingWeaponId)) p.startingWeaponId = choices.length ? choices[0].id : null;
        const selectedWeapon = choices.find((w) => w.id === p.startingWeaponId) || choices[0];
        const options = choices.map((w) => `<option value="${w.id}" ${w.id === p.startingWeaponId ? "selected" : ""}>${escapeHtml(w.name)} · ${RANGE_LABELS[w.range]}</option>`).join("");
        loadout = `<div class="fa-setup-loadout">
          <label>ARMA DI PARTENZA</label>
          <select data-start-weapon data-player-index="${i}">${options}</select>
          ${selectedWeapon ? `<div class="fa-setup-loadout-preview">
            <span class="fa-setup-loadout-img">${imgTag(selectedWeapon.image, selectedWeapon.name)}</span>
            <span><strong>${escapeHtml(selectedWeapon.name)}</strong><small>📏 ${RANGE_LABELS[selectedWeapon.range].toUpperCase()} · 🎲 ${selectedWeapon.baseDice} base · POWER +${selectedWeapon.power}</small></span>
          </div>` : ""}
          ${choices.length === 1 ? `<small class="fa-setup-loadout-hint">Sblocca altre armi nell'Arsenale per poterle scegliere a inizio partita.</small>` : ""}
        </div>`;
      }
      return `<div class="fa-setup-player-row ${p.present ? "is-present" : "is-absent"}">
        <div class="fa-roster-row-head"><input type="text" value="${escapeHtml(p.name)}" data-player-index="${i}" maxlength="18">
          <label class="fa-presence-toggle"><input type="checkbox" data-setup-presence="${i}" ${p.present ? "checked" : ""}> PRESENTE OGGI</label></div>
        <div class="fa-setup-avatar-grid">${avatars}</div>
        ${loadout}
      </div>`;
    }).join("");

    const registered = setupPlayers.slice(0, setupCount);
    const presentCount = registered.filter((p) => p.present).length;
    const allAvatarsChosen = registered.every((p) => p.avatarId && p.startingWeaponId);
    const canStart = allAvatarsChosen && presentCount >= 2;
    const resume = savedSession ? (() => {
      const st = savedSession.game && savedSession.game.state;
      const presentNames = st ? st.players.filter((p) => p.present !== false).map((p) => p.name).join(", ") : "";
      const round = st && st.round ? st.round : 0;
      return `<div class="fa-resume-card"><div><strong>💾 PARTITA IN CORSO</strong><span>Round ${round || "atterraggio"} · ${escapeHtml(presentNames || "roster salvato")}</span></div><div class="fa-resume-actions"><button type="button" class="fa-btn fa-btn-primary" id="fa-resume-game">CONTINUA PARTITA</button><button type="button" class="fa-btn fa-btn-ghost" id="fa-new-game">NUOVA PARTITA</button></div></div>`;
    })() : "";

    $("fa-setup-body").innerHTML = `
      ${resume}
      ${countSelect}
      <div class="fa-setup-players">${rows}</div>
      ${setupError ? `<p class="fa-setup-error">${escapeHtml(setupError)}</p>` : ""}
      <p class="fa-panel-mini-help">Presenti oggi: <strong>${presentCount}</strong>. Gli assenti restano nel roster e possono essere riattivati durante la missione.</p>
      <div class="fa-setup-actions">
        <button type="button" class="fa-btn fa-btn-primary" id="fa-setup-start" ${canStart ? "" : "disabled"}>INIZIA PARTITA</button>
      </div>
    `;
  }

  function attemptStartGame() {
    const registered = setupPlayers.slice(0, setupCount);
    if (registered.some((p) => !p.avatarId || !p.startingWeaponId)) { setupError = "Completa avatar e arma iniziale di tutto il roster."; renderSetup(); return; }
    const active = registered.filter((p) => p.present);
    if (active.length < 2) { setupError = "Servono almeno 2 bambini presenti per iniziare."; renderSetup(); return; }
    setupError = null;
    saveRoster();
    clearSavedSession();
    startGameFromSetup(active);
  }

  function startGameFromSetup(activePlayers) {
    const players = activePlayers.map((p, i) => ({ id: p.id || ("p" + (i + 1)), name: p.name.trim() || ("Giocatore " + (i + 1)) }));
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
    applyStartingEquipment(state, activePlayers);

    const playerAvatars = {};
    players.forEach((p, i) => { playerAvatars[p.id] = activePlayers[i].avatarId; });

    game = { state, dir: null, playerAvatars, landingIndex: 0 };
    eventLog = []; presenceOpen = false;
    uiMode = "game";
    persistSession();
    render();
  }

  /* =========================================================================
     ATTERRAGGIO — solo le 4 zone esterne, ordine fisso dei giocatori.
     Il round 1 NON viene consumato automaticamente: resta in coda fino a
     quando il Master preme PROSEGUI (gestito come ogni altro annuncio).
     ========================================================================= */
  function chooseLandingZone(zoneId) {
    const player = game.state.players[game.landingIndex];
    launchFlow = { mode: "initial", playerId: player.id, zoneId };
    render();
  }

  function beginMoveLaunch(zoneId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    launchFlow = { mode: "move", playerId, zoneId };
    moveMode = false;
    render();
  }

  function resolveLaunchFlow(roll) {
    if (!launchFlow) return;
    const state = game.state;
    const flow = launchFlow;
    const player = loop.getPlayer(state, flow.playerId);
    let outcome;
    if (flow.mode === "initial") {
      outcome = loop.landPlayer(state, flow.playerId, flow.zoneId, Math.random, roll);
      if (outcome.lootFound) pushEvent(`${player.name}: A TERRA — ${lootEntryLabel(outcome.lootFound)}`);
      game.landingIndex += 1;
      if (loop.allPlayersLanded(state)) {
        loop.beginExploration(state, Math.random);
        game.dir = director.createDirectorState(state);
      }
    } else {
      outcome = director.performMove(state, game.dir, flow.playerId, flow.zoneId, Math.random, roll);
      if (outcome.lootFound) pushEvent(`${player.name}: A TERRA — ${lootEntryLabel(outcome.lootFound)}`);
      if (player.status === "ko") {
        pushEvent(`${player.name}: L'IMPATTO LO MANDA KO`);
        director.endPlayerTurn(state, game.dir, flow.playerId);
      }
    }
    const landing = outcome.landing;
    const zone = loop.getZone(state, flow.zoneId);
    const label = landing.outcome === "disastroso" ? "ATTERRAGGIO DISASTROSO" : landing.outcome === "ostile" ? "ATTERRAGGIO OSTILE" : "ATTERRAGGIO PERFETTO";
    pushEvent(`${player.name}: ${label} a ${zone.name}${landing.damage ? ` · -${landing.damage} HP` : " · nessun danno"}`);
    launchFlow = null;
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

  /* Un'arma a terra è UNA sola arma: i due pulsanti non rappresentano due
     raccolte, ma la scelta dello slot in cui equipaggiarla. La UI lo dice
     esplicitamente per non confondere inventario e raccolta. */
  function groundLootMarkup(groundLoot, currentPlayer) {
    if (!groundLoot || !groundLoot.length) return "";
    const rows = groundLoot.map((entry) => {
      const label = escapeHtml(lootEntryLabel(entry));
      const isWeapon = entry.kind === "weapon";
      const owner = entry.ownerPlayerId ? loop.getPlayer(game.state, entry.ownerPlayerId) : null;
      const assignedToOther = Boolean(owner && currentPlayer && owner.id !== currentPlayer.id);
      const assignedToCurrent = Boolean(owner && currentPlayer && owner.id === currentPlayer.id);
      let buttons = "";
      if (!assignedToOther) {
        buttons = isWeapon
          ? `<div class="fa-groundloot-actions"><button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="primary">EQUIPAGGIA COME PRIMARIA</button>
             <button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="secondary">EQUIPAGGIA COME SECONDARIA</button></div>`
          : `<button type="button" class="fa-btn fa-btn-primary" data-pickup="${entry.instanceId}" data-pickup-slot="${entry.kind}">RACCOGLI</button>`;
      }
      let help;
      if (assignedToOther) help = `<small>🎯 ASSEGNATO A <strong>${escapeHtml(owner.name)}</strong>. Solo lui può raccoglierlo; dopo potrete scambiarlo.</small>`;
      else if (assignedToCurrent) help = `<small>🎯 ASSEGNATO A TE. ${isWeapon ? "Scegli in quale slot equipaggiarlo." : "Raccoglilo per metterlo nel tuo inventario."}</small>`;
      else help = isWeapon
        ? `<small>È una sola arma: scegli in quale slot equipaggiarla. In combattimento userai l'arma selezionata in <strong>ARMA ATTIVA</strong>.</small>`
        : `<small>Non è ancora nel tuo inventario.</small>`;
      const inspect = isWeapon ? `<button type="button" class="fa-weapon-inspect" data-inspect-weapon="${entry.weaponId}" aria-label="Vedi dettagli di ${label}" title="Vedi arma">🔍</button>` : "";
      return `<div class="fa-groundloot-row ${assignedToOther ? "is-assigned-other" : ""}"><span class="fa-groundloot-item"><strong>📦 ${label}</strong>${inspect}${help}</span>${buttons}</div>`;
    }).join("");
    return `<div class="fa-panel-section fa-groundloot-panel"><h4>A TERRA · ${groundLoot.some((e) => !e.ownerPlayerId || (currentPlayer && e.ownerPlayerId === currentPlayer.id)) ? "PUOI RACCOGLIERE" : "LOOT ASSEGNATO"}</h4>${rows}</div>`;
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
    // Node Graph: i nemici diventano bersagli solo quando il giocatore
    // raggiunge il loro nodo. Nelle zone legacy resta valido l'intero zoneId.
    const enemies = zone.nodes
      ? loop.enemiesAtNode(state, zone.id, player.nodeId)
      : loop.enemiesInZone(state, zone.id);
    const targets = enemies.map((e) => ({
      kind: "enemy", id: e.id, name: e.name, archetype: e.archetype, hp: e.hp, maxHp: e.maxHp, shield: e.shield, maxShield: e.maxShield,
      range: loop.resolveEncounterRange(zone, player.nodeId, e.nodeId)
    }));
    const boss = state.boss;
    if (boss && boss.active && boss.hp > 0 && boss.zoneId === zone.id) {
      targets.push({ kind: "boss", id: null, archetype: null, hp: boss.hp, maxHp: boss.maxHp, shield: boss.shield, maxShield: boss.maxShield, range: zone.encounterRange });
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
      ? `<button type="button" class="fa-btn fa-btn-primary" data-pickup="${entry.instanceId}" data-pickup-slot="primary">EQUIPAGGIA COME PRIMARIA</button>
         <button type="button" class="fa-btn fa-btn-ghost" data-pickup="${entry.instanceId}" data-pickup-slot="secondary">EQUIPAGGIA COME SECONDARIA</button>`
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
    const player = game && game.dir ? director.getCurrentPlayer(game.state, game.dir) : null;
    const inHub = player && shouldUseActionHub({ magnifyMode, nodeId: player.nodeId, directorPhase: game.dir.directorPhase, moveMode, scannerMode });
    if (!chestResult || inHub) { overlay.hidden = true; return; }
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

  function currentPresenceEntryZoneId() {
    if (!game || !game.state) return null;
    if (game.dir) {
      const focus = getLocalFocusPlayer(game.state, game.dir);
      if (focus && focus.zoneId) return focus.zoneId;
    }
    const present = game.state.players.find((p) => p.present !== false && p.zoneId);
    return present ? present.zoneId : null;
  }

  function runtimeSpecForRosterMember(member) {
    const choices = startingChoicesForSetupPlayer(member);
    const weapon = choices.find((w) => w.id === member.startingWeaponId) || choices[0] || null;
    return { id: member.id, name: member.name.trim() || member.id, equipment: { primary: weapon } };
  }

  function setRosterPresence(playerId, present) {
    if (!game || !game.dir) return;
    if (game.dir.awaitingRoll || game.dir.pendingReaction || game.dir.teamAttackPending) return;
    ensureSetupPlayers();
    const member = setupPlayers.slice(0, setupCount).find((p) => p.id === playerId);
    if (!member) return;
    const currentlyPresent = game.state.players.filter((p) => p.present !== false);
    if (!present && currentlyPresent.length <= 1) return;
    const entryZoneId = currentPresenceEntryZoneId();
    if (!entryZoneId) return;
    const existing = loop.getPlayer(game.state, playerId);
    loop.setPlayerPresence(game.state, playerId, present, entryZoneId, existing ? null : runtimeSpecForRosterMember(member));
    member.present = present;
    if (present) {
      game.playerAvatars[playerId] = member.avatarId;
      director.registerPresentPlayer(game.state, game.dir, playerId);
      pushEvent(`${member.name}: È ARRIVATO · entra dalla ZONA SICURA`);
    } else {
      director.handlePlayerDeactivated(game.state, game.dir, playerId);
      attackFlow = null; vehicleFlow = null; partyBoostFlow = null; tradeFlow = null; destinyFlow = false;
      pushEvent(`${member.name}: ASSENTE · fuori dal combattimento`);
    }
    saveRoster();
    persistSession();
    render();
  }

  function renderPresenceBar() {
    const bar = $("fa-presence-bar");
    if (!bar) return;
    if (uiMode !== "game" || !game || !game.dir) { bar.hidden = true; return; }
    bar.hidden = false;
    ensureSetupPlayers();
    const locked = Boolean(game.dir.awaitingRoll || game.dir.pendingReaction || game.dir.teamAttackPending);
    const presentCount = game.state.players.filter((p) => p.present !== false).length;
    const cards = setupPlayers.slice(0, setupCount).map((member) => {
      const runtime = loop.getPlayer(game.state, member.id);
      const present = Boolean(runtime && runtime.present !== false);
      const disabled = locked || (!present && !currentPresenceEntryZoneId()) || (present && presentCount <= 1);
      const character = CHARACTERS.find((c) => c.id === member.avatarId);
      const avatar = character ? characterDisplayImage(character.id, character.image) : "";
      const hp = runtime ? Math.max(0, Number(runtime.hp) || 0) : null;
      const shield = runtime ? Math.max(0, Number(runtime.shield) || 0) : null;
      const zone = runtime && runtime.zoneId ? zoneNameOf(runtime.zoneId) : "Fuori missione";
      const primary = runtime && runtime.equipment && runtime.equipment.primary ? runtime.equipment.primary.name : (member.startingWeaponId ? ((ARMI.find((w) => w.id === member.startingWeaponId) || {}).name || "Arma iniziale") : "—");
      const stateLabel = present ? "PRESENTE" : "ASSENTE";
      return `<article class="fa-presence-card ${present ? "is-present" : "is-absent"}">
        <div class="fa-presence-avatar">${avatar ? imgTag(avatar, member.name) : `<span>${escapeHtml((member.name || "?").slice(0,1).toUpperCase())}</span>`}</div>
        <div class="fa-presence-card-body">
          <div class="fa-presence-card-head"><div><span class="fa-presence-status">${present ? "●" : "○"} ${stateLabel}</span><h3>${escapeHtml(member.name)}</h3></div><button type="button" class="fa-presence-action ${present ? "is-disable" : "is-enable"}" data-presence-player="${member.id}" data-presence-value="${present ? "0" : "1"}" ${disabled ? "disabled" : ""}>${present ? "DISATTIVA" : "ATTIVA"}</button></div>
          <div class="fa-presence-stats">
            <span>❤️ <strong>${hp == null ? "—" : `${hp}/10`}</strong></span>
            <span>🛡️ <strong>${shield == null ? "—" : `${shield}/10`}</strong></span>
          </div>
          <div class="fa-presence-meta"><p><b>Zona</b><span>${escapeHtml(zone)}</span></p><p><b>Arma</b><span>${escapeHtml(primary || "—")}</span></p></div>
        </div>
      </article>`;
    }).join("");
    bar.innerHTML = `<div class="fa-presence-roster-head"><div><p class="fa-eyebrow">Roster permanente</p><h3>👥 Squadra · ${presentCount} presenti</h3><small>Gli assenti restano nel roster. Chi viene riattivato entra dalla Zona Sicura.</small></div></div>${locked ? `<p class="fa-panel-mini-help">Completa prima il tiro/reazione in corso per modificare le presenze.</p>` : ""}<div class="fa-presence-cards">${cards}</div>`;
  }

  function bindPresenceEvents() {
    const bar = $("fa-presence-bar");
    if (!bar) return;
    bar.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-presence-player]");
      if (btn && !btn.disabled) setRosterPresence(btn.dataset.presencePlayer, btn.dataset.presenceValue === "1");
    });
  }

  /* =========================================================================
     RENDER — dispatch principale
     ========================================================================= */
  function getLocalFocusPlayer(state, dir) {
    const current = director.getCurrentPlayer(state, dir);
    if (current) return current;
    if (!dir || !magnifyMode) return null;
    const pendingTargetId = dir.pendingReaction && dir.pendingReaction.targetId;
    if (pendingTargetId) {
      const target = loop.getPlayer(state, pendingTargetId);
      if (target && target.nodeId) return target;
    }
    const lastTargetId = dir.lastStepResult && dir.lastStepResult.targetId;
    if (lastTargetId) {
      const target = loop.getPlayer(state, lastTargetId);
      if (target && target.nodeId) return target;
    }
    if (dir.directorPhase === "enemy-phase" && dir.enemyPhase) {
      const enemyId = dir.enemyPhase.order[dir.enemyPhase.cursor];
      const enemy = enemyId ? loop.getEnemy(state, enemyId) : null;
      if (enemy) {
        const sameNode = state.players.find((p) => p.present !== false && p.status !== "eliminated" && p.zoneId === enemy.zoneId && p.nodeId === enemy.nodeId);
        if (sameNode) return sameNode;
        const sameZone = state.players.find((p) => p.present !== false && p.status !== "eliminated" && p.zoneId === enemy.zoneId && p.nodeId);
        if (sameZone) return sameZone;
      }
    }
    return state.players.find((p) => p.present !== false && p.status !== "eliminated" && p.nodeId) || null;
  }

  function renderShellBar(player) {
    const shell = $("fa-game-shellbar");
    if (!shell || uiMode !== "game" || !game.state) return;
    const state = game.state;
    const dir = game.dir;
    const focus = player || (!isLanding() && dir ? director.getCurrentPlayer(state, dir) : null);
    const presentCount = state.players.filter((p) => p.present !== false && p.status !== "eliminated").length;
    const zone = focus && focus.zoneId ? loop.getZone(state, focus.zoneId) : null;
    const hp = focus ? `${focus.hp}/10` : "—";
    const shield = focus ? `${focus.shield}/10` : "—";
    const round = state.round || 1;
    $("fa-shell-current").innerHTML = focus
      ? `<span class="fa-shell-round">ROUND ${round}</span><strong>TOCCA A ${escapeHtml(focus.name).toUpperCase()}</strong><span>❤️ ${hp} · 🛡️ ${shield}</span>`
      : `<span class="fa-shell-round">ROUND ${round}</span><strong>FORTRESS ARMY</strong>`;
    $("fa-shell-meta").innerHTML = `<span>👥 ${presentCount} PRESENTI</span><span>📍 ${escapeHtml(zone ? zone.name : "World Map")}</span><span>🎒 B-PACK ${escapeHtml($("fa-money") ? $("fa-money").textContent : "0")}</span>`;
    const worldBtn = $("fa-shell-world");
    if (worldBtn) worldBtn.textContent = magnifyMode ? "🗺️ WORLD MAP" : "🔍 ZONA";
  }


  function giftPresentPlayers() {
    if (!game || !game.state) return [];
    return game.state.players.filter((p) => p.present !== false);
  }

  function giftCurrentPlayer() {
    if (!giftMachineFlow || !game || !game.state) return null;
    const id = giftMachineFlow.participantIds[giftMachineFlow.index];
    return id ? loop.getPlayer(game.state, id) : null;
  }

  function giftRarityLabel(rarity) {
    const labels = { comune:"COMUNE", "non-comune":"NON COMUNE", rara:"RARA", epica:"EPICA", leggendaria:"LEGENDARIA", mitica:"MITICA" };
    return labels[rarity] || String(rarity || "").toUpperCase();
  }

  const GIFT_RIVE_CONFIGS = [
    { artboard: "regalo", stateMachine: "regalo" },
    { artboard: null, stateMachine: "regalo" },
    { artboard: "regalo", stateMachine: "State Machine 1" },
    { artboard: null, stateMachine: "State Machine 1" },
    { artboard: "regalo", stateMachine: null },
    { artboard: null, stateMachine: null }
  ];

  function giftCanvasHasPixels(canvas) {
    if (!canvas || !canvas.width || !canvas.height) return false;
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return true; // WebGL/other renderer: don't reject it just because 2D isn't available.
      const w = Math.max(1, Math.min(canvas.width, 360));
      const h = Math.max(1, Math.min(canvas.height, 260));
      const data = ctx.getImageData(0, 0, w, h).data;
      for (let i = 3; i < data.length; i += 16) if (data[i] > 4) return true;
    } catch (_) { return true; }
    return false;
  }

  function showGiftRiveStatus(message, isError = false) {
    const stage = document.querySelector(".fa-gift-stage");
    if (!stage) return;
    let note = stage.querySelector(".fa-gift-rive-status");
    if (!note) {
      note = document.createElement("div");
      note.className = "fa-gift-rive-status";
      stage.appendChild(note);
    }
    note.classList.toggle("is-error", Boolean(isError));
    note.textContent = message || "";
    note.hidden = !message;
  }

  function cleanupGiftRive() {
    if (giftRiveInstance) {
      try { giftRiveInstance.cleanup(); } catch (_) {}
    }
    giftRiveInstance = null;
    giftRiveTrigger = null;
  }

  function initGiftRive(configIndex = 0) {
    if (giftRiveInstance) return;
    const canvas = $("fa-gift-rive-canvas");
    if (!canvas) return;
    if (!window.rive || !window.rive.Rive) {
      showGiftRiveStatus("Rive non disponibile: runtime non caricato.", true);
      return;
    }

    const config = GIFT_RIVE_CONFIGS[configIndex] || GIFT_RIVE_CONFIGS[0];
    const options = {
      src: GIFT_RIVE_SRC,
      canvas,
      autoplay: true,
      layout: window.rive.Layout ? new window.rive.Layout({
        fit: window.rive.Fit ? window.rive.Fit.Contain : undefined,
        alignment: window.rive.Alignment ? window.rive.Alignment.Center : undefined
      }) : undefined,
      onLoad: () => {
        try { giftRiveInstance.resizeDrawingSurfaceToCanvas(); } catch (_) {}
        giftRiveTrigger = null;
        if (config.stateMachine) {
          try {
            const inputs = giftRiveInstance.stateMachineInputs(config.stateMachine) || [];
            giftRiveTrigger = inputs.find((input) => input && input.name === GIFT_RIVE_TRIGGER_NAME) || null;
          } catch (_) {}
        }
        // Give Rive one real frame before deciding whether this configuration renders.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!giftRiveInstance) return;
          if (!giftCanvasHasPixels(canvas) && configIndex + 1 < GIFT_RIVE_CONFIGS.length) {
            cleanupGiftRive();
            initGiftRive(configIndex + 1);
            return;
          }
          showGiftRiveStatus("");
          // If the artboard renders but this variant has no trigger, retry a trigger-capable variant.
          if (!giftRiveTrigger && config.stateMachine && configIndex + 1 < GIFT_RIVE_CONFIGS.length) {
            cleanupGiftRive();
            initGiftRive(configIndex + 1);
          }
        }));
      },
      onLoadError: () => {
        cleanupGiftRive();
        if (configIndex + 1 < GIFT_RIVE_CONFIGS.length) initGiftRive(configIndex + 1);
        else showGiftRiveStatus("Impossibile caricare il macchinario Rive.", true);
      },
      onStateChange: (event) => {
        if (!giftMachineFlow || giftMachineFlow.step !== "animating") return;
        if (Date.now() - giftAnimationStartedAt < 700) return;
        const states = Array.isArray(event && event.data) ? event.data : [event && event.data];
        if (states.some((name) => /idle/i.test(String(name || "")))) revealGiftReward();
      }
    };
    if (config.artboard) options.artboard = config.artboard;
    if (config.stateMachine) options.stateMachines = config.stateMachine;

    showGiftRiveStatus("CARICAMENTO MACCHINARIO…");
    try {
      giftRiveInstance = new window.rive.Rive(options);
    } catch (_) {
      cleanupGiftRive();
      if (configIndex + 1 < GIFT_RIVE_CONFIGS.length) initGiftRive(configIndex + 1);
      else showGiftRiveStatus("Impossibile avviare il macchinario Rive.", true);
    }
  }

  function fireGiftRive() {
    initGiftRive();
    giftAnimationStartedAt = Date.now();
    const attemptFire = (tries = 0) => {
      try {
        if (giftRiveTrigger && typeof giftRiveTrigger.fire === "function") {
          giftRiveTrigger.fire();
          return;
        }
      } catch (_) {}
      if (tries < 12) setTimeout(() => attemptFire(tries + 1), 100);
    };
    attemptFire();
    if (giftRevealTimer) clearTimeout(giftRevealTimer);
    giftRevealTimer = setTimeout(revealGiftReward, GIFT_REVEAL_FALLBACK_MS);
  }

  function revealGiftReward() {
    if (!giftMachineFlow || giftMachineFlow.step !== "animating") return;
    if (giftRevealTimer) { clearTimeout(giftRevealTimer); giftRevealTimer = null; }
    giftMachineFlow.step = "reward";
    renderGiftMachine();
  }

  function startGiftMachine() {
    if (!game || !game.state || !giftMachineApi) return;
    const participants = giftPresentPlayers();
    if (!participants.length) return;
    giftMachineFlow = {
      participantIds: participants.map((p) => p.id),
      index: 0,
      step: "handoff",
      roll: null,
      reward: null,
      seenWeaponIds: []
    };
    const utility = $("fa-utility-overlay");
    if (utility) utility.hidden = true;
    const overlay = $("fa-gift-overlay");
    if (overlay) overlay.hidden = false;
    initGiftRive();
    renderGiftMachine();
  }

  function closeGiftMachine() {
    const overlay = $("fa-gift-overlay");
    if (overlay) overlay.hidden = true;
  }

  function resolveGiftRoll(roll) {
    if (!giftMachineFlow || giftMachineFlow.step !== "roll" || !giftMachineApi) return;
    const reward = giftMachineApi.drawWeapon(Number(roll), Math.random, giftMachineFlow.seenWeaponIds);
    giftMachineFlow.roll = Number(roll);
    giftMachineFlow.reward = reward;
    giftMachineFlow.seenWeaponIds.push(reward.weaponId);
    // Appena il Master inserisce il D6, parte subito il trigger Rive `start`.
    // Il premio resta nascosto fino al termine dell'animazione.
    giftMachineFlow.step = "animating";
    renderGiftMachine();
    fireGiftRive();
  }

  function collectGiftReward(slot) {
    if (!giftMachineFlow || !giftMachineFlow.reward) return;
    const player = giftCurrentPlayer();
    if (!player) return;
    const reward = giftMachineFlow.reward;
    const eq = player.equipment || {};
    let targetSlot = slot || null;
    if (!targetSlot) {
      if (!eq.primary) targetSlot = "primary";
      else if (!eq.secondary) targetSlot = "secondary";
      else { giftMachineFlow.step = "slot"; renderGiftMachine(); return; }
    }
    loop.collectGiftWeapon(game.state, player.id, targetSlot, reward.weapon);
    pushEvent(`${player.name}: REGALO — ${reward.weapon.name}`);
    giftMachineFlow.index += 1;
    giftMachineFlow.roll = null;
    giftMachineFlow.reward = null;
    if (giftMachineFlow.index >= giftMachineFlow.participantIds.length) {
      giftMachineFlow.step = "done";
      game.state.giftMachineCompleted = true;
    } else {
      giftMachineFlow.step = "handoff";
    }
    render();
    const overlay = $("fa-gift-overlay");
    if (overlay) overlay.hidden = false;
    renderGiftMachine();
  }

  function giftRewardMarkup(reward) {
    if (!reward || !reward.weapon) return "";
    const w = reward.weapon;
    const img = reward.image || (weaponsApi && weaponsApi.getImage ? weaponsApi.getImage(w) : w.image);
    const special = w.special && w.special.type && w.special.type !== "none" ? w.special.type : "Nessun effetto speciale";
    return `<div class="fa-gift-reward-card rarity-${escapeHtml(w.rarity)}">
      <div class="fa-gift-reward-glow"></div>
      <div class="fa-gift-reward-image">${imgTag(img, w.name)}</div>
      <div class="fa-gift-reward-copy"><span class="fa-gift-rarity">${escapeHtml(giftRarityLabel(w.rarity))}</span><h3>${escapeHtml(w.name)}</h3>
      <div class="fa-gift-stats"><span>⚡ POTENZA <b>${reward.potenza == null ? "—" : reward.potenza}</b></span><span>🎲 DADI <b>${reward.baseDice == null ? "—" : reward.baseDice}</b></span><span>📏 <b>${escapeHtml(String(reward.range || "—").toUpperCase())}</b></span></div>
      <small>${escapeHtml(w.description || "")} · ${escapeHtml(special)}</small></div>
    </div>`;
  }

  function renderGiftMachine() {
    const overlay = $("fa-gift-overlay");
    if (!overlay || overlay.hidden || !giftMachineFlow) return;
    const turn = $("fa-gift-turn"), controls = $("fa-gift-controls"), rewardWindow = $("fa-gift-reward-window");
    const total = giftMachineFlow.participantIds.length;
    const player = giftCurrentPlayer();
    const step = giftMachineFlow.step;
    if (step === "done") {
      if (turn) turn.innerHTML = `<strong>🎉 GIRO REGALI COMPLETATO</strong><span>${total} bambini · ${total} premi consegnati</span>`;
      if (rewardWindow) rewardWindow.hidden = true;
      if (controls) controls.innerHTML = `<div class="fa-gift-done"><h3>TUTTI HANNO RICEVUTO IL LORO REGALO</h3><button type="button" class="fa-btn fa-btn-primary" data-gift-action="close">TORNA AL GIOCO</button></div>`;
      return;
    }
    if (!player) return;
    if (turn) turn.innerHTML = `<span>GIRO ${giftMachineFlow.index + 1} / ${total}</span><strong>🎁 TOCCA A ${escapeHtml(player.name).toUpperCase()}</strong>`;
    if (rewardWindow) {
      const showReward = step === "reward" || step === "slot";
      rewardWindow.hidden = !showReward;
      rewardWindow.innerHTML = showReward ? giftRewardMarkup(giftMachineFlow.reward) : "";
    }
    if (!controls) return;
    if (step === "handoff") {
      controls.innerHTML = `<div class="fa-gift-handoff"><p>PROSSIMO BAMBINO</p><h3>${escapeHtml(player.name).toUpperCase()}</h3><button type="button" class="fa-btn fa-btn-primary fa-gift-big-btn" data-gift-action="ready">VAI ALLA MACCHINA</button></div>`;
    } else if (step === "roll") {
      controls.innerHTML = `<div class="fa-gift-roll"><h3>${escapeHtml(player.name)}, TIRA 1 D6 FISICO</h3><p>Inserisci il risultato. Il 3 favorisce Rara/Epica, ma nessun numero garantisce una rarità.</p><div class="fa-gift-dice-grid">${[1,2,3,4,5,6].map((v)=>`<button type="button" class="fa-dice-btn fa-gift-die" data-gift-roll="${v}">${v}</button>`).join("")}</div></div>`;
    } else if (step === "animating") {
      controls.innerHTML = `<div class="fa-gift-working"><span class="fa-gift-working-dot">●</span><strong>IL MACCHINARIO STA PESCANDO IL REGALO DI ${escapeHtml(player.name).toUpperCase()}…</strong></div>`;
    } else if (step === "reward") {
      controls.innerHTML = `<div class="fa-gift-collect"><p>RISULTATO D6: <b>${giftMachineFlow.roll}</b></p><button type="button" class="fa-btn fa-btn-primary fa-gift-big-btn" data-gift-action="collect">🎁 RACCOGLI</button></div>`;
    } else if (step === "slot") {
      const eq = player.equipment || {};
      controls.innerHTML = `<div class="fa-gift-slot"><h3>DOVE METTI ${escapeHtml(giftMachineFlow.reward.weapon.name)}?</h3><p>Lo slot sostituito lascerà l'arma precedente a terra.</p><div class="fa-gift-slot-grid"><button type="button" class="fa-btn fa-btn-primary" data-gift-slot="primary"><b>PRIMARIA</b><span>${eq.primary ? escapeHtml(eq.primary.name) : "VUOTO"}</span></button><button type="button" class="fa-btn fa-btn-primary" data-gift-slot="secondary"><b>SECONDARIA</b><span>${eq.secondary ? escapeHtml(eq.secondary.name) : "VUOTO"}</span></button></div></div>`;
    }
  }

  function bindGiftMachineEvents() {
    const overlay = $("fa-gift-overlay");
    if (!overlay) return;
    overlay.addEventListener("click", (ev) => {
      if (ev.target.closest("#fa-gift-close")) { closeGiftMachine(); return; }
      const die = ev.target.closest("[data-gift-roll]");
      if (die) { resolveGiftRoll(Number(die.dataset.giftRoll)); return; }
      const slot = ev.target.closest("[data-gift-slot]");
      if (slot) { collectGiftReward(slot.dataset.giftSlot); return; }
      const action = ev.target.closest("[data-gift-action]");
      if (!action) return;
      if (action.dataset.giftAction === "ready") { giftMachineFlow.step = "roll"; renderGiftMachine(); return; }
      if (action.dataset.giftAction === "collect") { collectGiftReward(); return; }
      if (action.dataset.giftAction === "close") { closeGiftMachine(); return; }
    });
  }

  function renderUtilityContent() {
    if (!game.state || uiMode !== "game") return;
    const state = game.state, dir = game.dir;
    const player = isLanding() ? state.players[game.landingIndex] : (dir ? getLocalFocusPlayer(state, dir) : null);
    const session = $("fa-utility-session");
    const inventory = $("fa-utility-inventory");
    const progress = $("fa-utility-progress");
    const gifts = $("fa-utility-gifts");
    if (!player) {
      if (session) session.innerHTML = `<div class="fa-utility-card"><p>Nessun giocatore attivo.</p></div>`;
      if (inventory) inventory.innerHTML = `<div class="fa-utility-card"><p>Nessun inventario disponibile.</p></div>`;
      return;
    }
    const zone = player.zoneId ? loop.getZone(state, player.zoneId) : null;
    let situation = null;
    try { if (dir && player.zoneId) situation = director.getSituation(state, player); } catch (_) {}
    const structure = zone && zone.operationalStructure && !zone.operationalStructure.destroyed ? zone.operationalStructure : null;
    const zoneEnemies = zone ? loop.enemiesInZone(state, zone.id).filter((enemy) => enemy.hp > 0) : [];
    const zoneParty = zone ? state.players.filter((p) => p.present !== false && p.status !== "eliminated" && p.zoneId === zone.id) : [];
    if (session) session.innerHTML = `<div class="fa-utility-card"><h3>🎯 Sessione</h3>
      <div class="fa-utility-facts"><span><b>Round</b>${state.round}</span><span><b>Zona</b>${escapeHtml(zone ? zone.name : "—")}</span><span><b>Nemici nella zona</b>${zoneEnemies.length}</span><span><b>Party nella zona</b>${zoneParty.length}</span></div>
      ${structure ? `<div class="fa-utility-structure"><b>🏢 ${escapeHtml(structure.name)}</b><span>❤️ ${structure.hp}/${structure.maxHp || structure.hp}</span></div>` : ""}
      ${eventLog.length ? `<h4>Eventi recenti</h4><ul class="fa-situation-list">${eventLog.slice(-5).map((e)=>`<li>${escapeHtml(e)}</li>`).join("")}</ul>` : ""}
    </div>`;
    const eq = player.equipment || {};
    const row = (label, item) => `<div class="fa-utility-equip-row"><span>${label}</span><strong>${item ? escapeHtml(item.name) : "—"}</strong></div>`;
    if (inventory) inventory.innerHTML = `<div class="fa-utility-card"><h3>🎒 Inventario di ${escapeHtml(player.name)}</h3>${row("Primaria",eq.primary)}${row("Secondaria",eq.secondary)}${row("Cura",eq.cura)}${row("Scudo",eq.scudo)}${row("Utility",eq.utility)}</div>`;
    if (progress) progress.innerHTML = `<div class="fa-utility-card"><h3>🎒 B-Pack & Progressi</h3><div class="fa-progress-big">${escapeHtml($("fa-money") ? $("fa-money").textContent : "0")} <small>B-Pack</small></div><p>Arsenale, cosmetici e ricompense cooperative restano accessibili da questo centro.</p></div>`;
    if (gifts) {
      const present = giftPresentPlayers();
      const completed = Boolean(state.giftMachineCompleted);
      gifts.innerHTML = `<div class="fa-utility-card fa-gift-utility-card"><h3>🎁 Macchina Regali</h3><p>Un giro, un regalo per ogni bambino presente. Ogni premio è un'arma reale della Libreria.</p><div class="fa-utility-facts"><span><b>Bambini</b>${present.length}</span><span><b>Stato</b>${completed ? "COMPLETATO" : "PRONTO"}</span></div>${completed ? `<p class="fa-panel-mini-help">Il giro Regali di questa missione è già stato completato.</p>` : `<button type="button" class="fa-btn fa-btn-primary" id="fa-start-gift-machine">🎁 AVVIA GIRO REGALI</button>`}</div>`;
    }
  }


  function embedLibraryInUtility() {
    const host = $("fa-utility-library-host");
    const panel = document.querySelector("#fa-library .fa-library-panel");
    if (!host || !panel) return;
    ["fa-library-controls", "fa-library-count", "fa-library-grid"].forEach((id) => {
      const node = id === "fa-library-controls"
        ? panel.querySelector(".fa-library-controls")
        : $(id);
      if (node && node.parentNode !== host) host.appendChild(node);
    });
    try {
      if (typeof renderLibraryGrid === "function") renderLibraryGrid();
    } catch (_) {}
  }

  function restoreLibraryFromUtility() {
    const host = $("fa-utility-library-host");
    const panel = document.querySelector("#fa-library .fa-library-panel");
    if (!host || !panel) return;
    Array.from(host.children).forEach((node) => panel.appendChild(node));
  }

  function setUtilityTab(tab) {
    document.querySelectorAll("[data-utility-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.utilityTab === tab));
    document.querySelectorAll("[data-utility-panel]").forEach((p) => p.classList.toggle("is-active", p.dataset.utilityPanel === tab));
    renderUtilityContent();
    if (tab === "presenze") renderPresenceBar();
    if (tab === "armi") embedLibraryInUtility();
  }

  function openUtility(tab = "sessione") {
    const overlay = $("fa-utility-overlay");
    if (!overlay) return;
    overlay.hidden = false;
    setUtilityTab(tab);
  }

  window.FORTRESS_GAME_UI_API = Object.assign({}, window.FORTRESS_GAME_UI_API || {}, {
    openUtility,
    setUtilityTab
  });

  function bindShellEvents() {
    const screen = $("fa-game-screen");
    if (screen) screen.addEventListener("click", (ev) => {
      if (ev.target.closest("#fa-shell-utility")) { openUtility("sessione"); return; }
      if (ev.target.closest("#fa-shell-world")) {
        moveMode = false; scannerMode = false; magnifyMode = !magnifyMode; render(); return;
      }
    });
    const utility = $("fa-utility-overlay");
    if (utility) utility.addEventListener("click", (ev) => {
      if (ev.target.id === "fa-utility-overlay" || ev.target.closest("#fa-utility-close")) {
        restoreLibraryFromUtility();
        utility.hidden = true;
        return;
      }
      if (ev.target.closest("#fa-start-gift-machine")) { startGiftMachine(); return; }
      const tile = ev.target.closest("[data-utility-tab]");
      if (tile) { setUtilityTab(tile.dataset.utilityTab); return; }
    });
  }

  function render() {
    $("fa-setup-screen").hidden = uiMode !== "setup";
    $("fa-game-screen").hidden = uiMode !== "game";
    if (uiMode === "setup") { renderSetup(); return; }

    const state = game.state;
    const currentPlayer = isLanding() ? null : getLocalFocusPlayer(state, game.dir);
    const currentZone = currentPlayer ? loop.getZone(state, currentPlayer.zoneId) : null;
    // CAMBIA ZONA sceglie la destinazione su una tile della World Map:
    // mentre sono attivi si torna sempre alla vista World, indipendentemente
    // dalla preferenza Magnify (che resta invariata e riprende dopo).
    const showMagnify = Boolean(magnifyMode && currentZone && currentZone.nodes && !moveMode && !scannerMode);

    $("fa-map-wrap").hidden = showMagnify;
    $("fa-magnify-wrap").hidden = !showMagnify;
    if (showMagnify) $("fa-magnify-wrap").innerHTML = renderMagnify(state, currentPlayer);
    else renderMap();

    renderPanel();
    renderShellBar(currentPlayer);
    renderUtilityContent();
    document.body.classList.toggle("fa-game-active", uiMode === "game");
    const turnPanel = $("fa-turn-panel");
    const ordinaryPlayerDock = Boolean(game.dir && game.dir.directorPhase === "player-turn" && showMagnify && !game.dir.pendingReaction && !game.dir.awaitingRoll && !game.dir.pendingAnnouncements.length);
    if (turnPanel) turnPanel.classList.toggle("fa-shell-hidden-panel", ordinaryPlayerDock);
    renderLaunchOverlay();
    renderAttackOverlay();
    renderChestOverlay();
    renderTurnTransitionOverlay();
    renderPresenceBar();
    renderGiftMachine();

    const dir = game.dir;
    if (dir && dir.pendingAnnouncements.length) renderAnnouncementOverlay(dir.pendingAnnouncements[0]);
    else $("fa-announcement-overlay").hidden = true;
    persistSession();
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

    const tokens = state.players.filter((p) => p.present !== false && p.zoneId === zoneDef.id && p.status !== "eliminated")
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
      <span>${escapeHtml(player.name)}${isKo ? " (KO)" : ""}${player.hiddenInShelter ? " · 🫥 NASCOSTO" : ""}</span>
    </div>`;
  }

  const TACTICAL_PLAYER_ASSETS = Object.freeze({
    automate: "assets/fortress-img/tactical-characters/automate.webp",
    cat: "assets/fortress-img/tactical-characters/cat.webp",
    duck: "assets/fortress-img/tactical-characters/duck.webp",
    ghost: "assets/fortress-img/tactical-characters/ghost.webp",
    icekron: "assets/fortress-img/tactical-characters/icekron.webp",
    omalma: "assets/fortress-img/tactical-characters/omalma.webp",
    pandax: "assets/fortress-img/tactical-characters/pandax.webp",
    robotron: "assets/fortress-img/tactical-characters/robotron.webp",
    skulldrome: "assets/fortress-img/tactical-characters/skulldrome.webp",
    travis: "assets/fortress-img/tactical-characters/travis.webp"
  });

  /* Miniatura tattica: lo slot rappresenta il punto a terra. L'immagine viene
     quindi appoggiata con i piedi sullo slot invece di essere centrata come
     il vecchio token circolare. Le altre UI continuano a usare tokenMarkup(). */
  function tacticalPlayerMarkup(player, currentPlayer) {
    const characterId = game && game.playerAvatars ? game.playerAvatars[player.id] : null;
    const character = CHARACTERS.find((c) => c.id === characterId);
    const isCurrent = Boolean(currentPlayer && currentPlayer.id === player.id);
    const isKo = player.status === "ko";
    const tacticalImg = characterId ? TACTICAL_PLAYER_ASSETS[characterId] : "";
    const fallbackImg = character ? characterDisplayImage(character.id, character.image) : "";
    return `<div class="fa-tactical-player ${isCurrent ? "is-current" : ""} ${isKo ? "is-ko" : ""} ${player.hiddenInShelter ? "is-hidden" : ""}">
      <span class="fa-tactical-player-ring" aria-hidden="true"></span>
      ${tacticalImg ? `<img class="fa-tactical-player-img" src="${escapeHtml(tacticalImg)}" alt="${escapeHtml(player.name)}" draggable="false" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">` : ""}
      ${fallbackImg ? `<img class="fa-tactical-player-fallback" src="${escapeHtml(fallbackImg)}" alt="${escapeHtml(player.name)}" draggable="false" style="display:${tacticalImg ? "none" : "block"}">` : `<span class="fa-tactical-player-initial">${escapeHtml((player.name || "?").slice(0,1).toUpperCase())}</span>`}
      <span class="fa-tactical-player-name">${escapeHtml(player.name)}${isKo ? " · KO" : ""}${player.hiddenInShelter ? " · 🫥" : ""}</span>
    </div>`;
  }

  function enemyMarkerMarkup(e) {
    const type = ENEMY_NAME[e.archetype] || e.archetype;
    const name = e.name || type;
    const elite = String(e.archetype || "").toLowerCase() === "elite";
    return `<span class="fa-enemy-marker" title="${escapeHtml(name)} · ${escapeHtml(type)}">
      <span class="fa-enemy-visual">
        <img class="fa-enemy-map-img" src="${escapeHtml(enemyMapAsset(e))}" alt="${escapeHtml(name)}" draggable="false">
        ${elite ? `<img class="fa-enemy-elite-overlay" src="${escapeHtml(mapActorAsset("enemy-elite-overlay.webp"))}" alt="Elite" draggable="false">` : ""}
      </span>
      <span class="fa-enemy-marker-name">${escapeHtml(name)}</span>
      <span class="fa-enemy-marker-stats">❤️${e.hp}${e.maxShield ? ` · 🛡${e.shield}` : ""}</span>
    </span>`;
  }

  /* Enemy Squads V1: più nemici possono stare sullo stesso nodo. Raggruppa
     per archetipo — un solo nemico di un tipo: marker pieno di sempre
     (HP/Scudo reali); più di uno: marker compatto "N ×2" (mai N badge
     sovrapposti illeggibili), col dettaglio nel title al passaggio. */
  function nodeEnemyMarkersMarkup(enemiesAtThisNode) {
    return enemiesAtThisNode.slice().sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)))
      .map((e) => enemyMarkerMarkup(e)).join("");
  }

  /* =========================================================================
     ZONE MAGNIFY V1 — vista nodi della zona corrente (solo Forest per ora).
     Riusa l'immagine zona già esistente come background, tokenMarkup ed
     enemyMarkerMarkup già usati dalla World Map: nessuna nuova immagine,
     nessuna nuova regola. Sotto la mappa vive ora l'Action Hub: movimento,
     raccolta, uso oggetti e sequenza arma→bersaglio restano nello stesso
     centro decisionale, particolarmente importante su telefono.
     ========================================================================= */
  function syncActionHubWeaponSlot(player) {
    const resolved = resolvePreferredWeaponSlot(player && player.equipment, actionHubWeaponSlot);
    actionHubWeaponSlot = resolved || "primary";
    return resolved;
  }

  function actionHubWeaponStrip(player) {
    const activeSlot = syncActionHubWeaponSlot(player);
    const rows = getEquippedWeaponSlots(player && player.equipment).map((slot) => {
      const w = player.equipment[slot];
      const slotLabel = slot === "primary" ? "P" : "S";
      const selected = slot === activeSlot;
      return `<button type="button" class="fa-action-hub-weapon ${selected ? "is-selected" : ""}" data-action-hub-weapon-slot="${slot}" aria-pressed="${selected ? "true" : "false"}"><b>${slotLabel}</b><strong>${escapeHtml(w.name)}</strong><em>📏 ${RANGE_LABELS[w.range].toUpperCase()}</em></button>`;
    }).join("");
    return rows ? `<div class="fa-action-hub-loadout"><div class="fa-action-hub-subtitle">ARMA ATTIVA</div><div class="fa-action-hub-weapon-help">Scegline una: <strong>ATTACCA</strong> userà solo l'arma evidenziata.</div><div class="fa-action-hub-weapons">${rows}</div></div>` : "";
  }

  function renderNodeLegend() {
    return `<div class="fa-node-legend" aria-label="Legenda nodi">
      <span><strong>🎁</strong> Cassa</span>
      <span><strong>📦</strong> Oggetti</span>
      <span><strong>👾</strong> Nemici</span>
      <span><strong>🏚️</strong> Riparo</span>
      <span><strong>🪤</strong> Trappola</span>
      <span><strong>N</strong> Normale</span>
      <span><strong>A</strong> Aggressivo</span>
      <span><strong>R</strong> Resistente</span>
      <span><strong>D</strong> Distanza</span>
      <span><strong>E</strong> Elite</span>
    </div>`;
  }

  function buildTradeFlowMarkup(state, player) {
    const target = tradeFlow ? loop.getPlayer(state, tradeFlow.targetId) : null;
    if (!target) return `<button type="button" class="fa-btn fa-btn-ghost" id="fa-trade-cancel">ANNULLA</button>`;
    const slots = ["primary", "secondary", "cura", "scudo", "utility"].filter((slot) => player.equipment && player.equipment[slot]);
    const slotLabel = { primary: "PRIMARY", secondary: "SECONDARY", cura: "CURA", scudo: "SCUDO", utility: "UTILITY" };
    const choices = slots.map((slot) => {
      const item = player.equipment[slot];
      return `<button type="button" class="fa-trade-choice" data-trade-slot="${slot}"><span><small>${slotLabel[slot]}</small><strong>${escapeHtml(item.name)}</strong></span><b>DAI → ${escapeHtml(target.name)}</b></button>`;
    }).join("");
    return `<div class="fa-action-hub-kicker">DAI UN OGGETTO</div>
      <h3>A ${escapeHtml(target.name).toUpperCase()}</h3>
      <p class="fa-trade-help">Puoi consegnare solo un oggetto che è già nel tuo inventario. Quello ancora a terra non è cedibile. Il tuo slot si svuota; se lo stesso slot del compagno è occupato, il suo oggetto viene lasciato a terra.</p>
      <div class="fa-trade-list">${choices || "<p>Non hai oggetti da dare.</p>"}</div>
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-trade-cancel">ANNULLA</button>`;
  }

  function vehicleCrewCandidates(state, player) {
    if (!player || !player.zoneId) return [];
    return loop.availableVehicleCrew(state, player.zoneId).filter((p) => !p.offensiveSpentThisRound);
  }

  function buildVehicleCrewMarkup(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const visit = zone && zone.vehicleVisit;
    const vehicle = visit && visit.vehicle;
    const candidates = vehicleCrewCandidates(state, player);
    if (!vehicle) return `<div class="fa-action-hub-kicker">MEZZO NON DISPONIBILE</div><p>In questa visita non c'è un mezzo pesante.</p>`;
    if (candidates.length < 3) return `<div class="fa-action-hub-kicker">🚛 ${escapeHtml(vehicle.name).toUpperCase()}</div><h3>SERVONO 3 GIOCATORI</h3><p>Porta almeno 3 giocatori disponibili nella Zona Sicura per formare l'equipaggio.</p><button type="button" class="fa-btn fa-btn-ghost" id="fa-vehicle-cancel">CHIUDI</button>`;
    vehicleFlow = vehicleFlow || { step:"crew", initiatorId:player.id, pilotId:player.id, gunnerIds:[] };
    if (!vehicleFlow.pilotId || !candidates.some((p)=>p.id===vehicleFlow.pilotId)) vehicleFlow.pilotId = player.id;
    const used = new Set([vehicleFlow.pilotId].concat(vehicleFlow.gunnerIds || []));
    const roleOptions = (role, selectedId) => candidates.map((p) => `<option value="${escapeHtml(p.id)}" ${p.id===selectedId?"selected":""}>${escapeHtml(p.name)}</option>`).join("");
    const gunnerIds = (vehicleFlow.gunnerIds || []).slice(0,2);
    while (gunnerIds.length < 2) {
      const next = candidates.find((p)=>!used.has(p.id));
      if (!next) break;
      gunnerIds.push(next.id); used.add(next.id);
    }
    vehicleFlow.gunnerIds = gunnerIds;
    return `<div class="fa-action-hub-kicker">🚛 ${escapeHtml(vehicle.name).toUpperCase()} · 🔧 ${vehicle.integrity}/${vehicle.maxIntegrity}</div>
      <h3>FORMA L'EQUIPAGGIO</h3>
      <p class="fa-panel-mini-help">Assegna i ruoli prima di attaccare. Nessun dado viene tirato finché non confermi.</p>
      <div class="fa-vehicle-crew-grid">
        <label><span>🛞 PILOTA</span><select data-vehicle-role="pilot">${roleOptions("pilot", vehicleFlow.pilotId)}</select></label>
        <label><span>🎯 TIRATORE 1</span><select data-vehicle-role="gunner1">${roleOptions("gunner1", vehicleFlow.gunnerIds[0])}</select></label>
        <label><span>🎯 TIRATORE 2</span><select data-vehicle-role="gunner2">${roleOptions("gunner2", vehicleFlow.gunnerIds[1])}</select></label>
      </div>
      <div class="fa-action-list fa-action-hub-list"><button type="button" class="fa-action-btn is-primary" id="fa-vehicle-crew-confirm">CONFERMA EQUIPAGGIO</button><button type="button" class="fa-action-btn" id="fa-vehicle-cancel">ANNULLA</button></div>`;
  }

  function buildVehicleTargetMarkup(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const visit = zone && zone.vehicleVisit;
    const structure = zone && zone.operationalStructure && !zone.operationalStructure.destroyed ? zone.operationalStructure : null;
    const vehicle = visit && visit.vehicle;
    if (!vehicle) return `<div class="fa-action-hub-kicker">NESSUN MEZZO</div><p>Il mezzo non è più disponibile.</p><button type="button" class="fa-btn fa-btn-ghost" id="fa-vehicle-cancel">CHIUDI</button>`;
    const enemies = loop.enemiesInZone(state, player.zoneId).filter((e)=>e.hp>0);
    const targets = [];
    if (structure) targets.push({ kind:"structure", id:structure.id, name:structure.name, meta:`❤️ ${structure.hp}/${structure.maxHp} · CORAZZA ${structure.armor || 0}`, icon:"🏢" });
    enemies.forEach((e)=>targets.push({ kind:"enemy", id:e.id, name:e.name || ENEMY_NAME[e.archetype] || "Nemico", meta:`${escapeHtml(ENEMY_NAME[e.archetype] || e.archetype || "Nemico")} · ❤️ ${e.hp}/${e.maxHp}${e.shield ? ` · 🛡️ ${e.shield}/${e.maxShield || e.shield}` : ""}`, icon:"👾" }));
    if (!targets.length) return `<div class="fa-action-hub-kicker">NESSUN BERSAGLIO</div><p>Non ci sono strutture operative o nemici vivi nella zona.</p><button type="button" class="fa-btn fa-btn-ghost" id="fa-vehicle-cancel">CHIUDI</button>`;
    vehicleFlow.gunnerTargets = Array.isArray(vehicleFlow.gunnerTargets) ? vehicleFlow.gunnerTargets.slice(0,2) : [null,null];
    while (vehicleFlow.gunnerTargets.length < 2) vehicleFlow.gunnerTargets.push(null);
    const names = [vehicleFlow.pilotId].concat(vehicleFlow.gunnerIds || []).map((id)=>{ const p=loop.getPlayer(state,id); return p?p.name:id; });
    const renderTargetSet = (gunnerIndex) => {
      const selected = vehicleFlow.gunnerTargets[gunnerIndex];
      const gunner = loop.getPlayer(state, (vehicleFlow.gunnerIds || [])[gunnerIndex]);
      return `<div class="fa-vehicle-gunner-target"><h4>🎯 ${escapeHtml(gunner ? gunner.name.toUpperCase() : `TIRATORE ${gunnerIndex+1}`)}</h4><div class="fa-vehicle-target-grid">${targets.map((t)=>{
        const isSelected = selected && selected.kind===t.kind && selected.id===t.id;
        return `<button type="button" class="fa-vehicle-target-card${isSelected ? " is-selected" : ""}" data-vehicle-target-gunner="${gunnerIndex}" data-vehicle-target-kind="${t.kind}" data-vehicle-target-id="${escapeHtml(t.id)}" aria-pressed="${isSelected ? "true" : "false"}"><strong>${t.icon} ${escapeHtml(t.name)}</strong><span>${t.meta}</span></button>`;
      }).join("")}</div></div>`;
    };
    const ready = vehicleFlow.gunnerTargets.every((t)=>t && t.kind && t.id);
    return `<div class="fa-action-hub-kicker">🚛 ${escapeHtml(vehicle.name).toUpperCase()}</div>
      <h3>SCEGLI I BERSAGLI</h3>
      <p class="fa-panel-mini-help">Ogni tiratore sceglie il proprio bersaglio. Potete concentrare il fuoco sullo stesso obiettivo oppure dividervi.</p>
      ${renderTargetSet(0)}${renderTargetSet(1)}
      <p class="fa-panel-mini-help">Equipaggio: ${names.map(escapeHtml).join(" · ")}</p>
      <div class="fa-action-list fa-action-hub-list"><button type="button" class="fa-action-btn is-primary" id="fa-vehicle-fire" ${ready ? "" : "disabled"}>${ready ? "AVVIA ATTACCO DEL MEZZO" : "SCEGLI 2 BERSAGLI"}</button><button type="button" class="fa-action-btn" id="fa-vehicle-back">CAMBIA EQUIPAGGIO</button><button type="button" class="fa-action-btn" id="fa-vehicle-cancel">ANNULLA</button></div>`;
  }

  function buildVehicleFlowMarkup(state, player) {
    return vehicleFlow && vehicleFlow.step === "target" ? buildVehicleTargetMarkup(state, player) : buildVehicleCrewMarkup(state, player);
  }


  function partyBoostFlowComplete(map, ids) {
    return ids.length > 0 && ids.every((id) => Number.isInteger(Number(map && map[id])) && Number(map[id]) >= 1 && Number(map[id]) <= 6);
  }

  function buildPartyBoostFlowMarkup(state) {
    const flow = partyBoostFlow;
    if (!flow) return "";
    const participants = (flow.participantIds || []).map((id) => loop.getPlayer(state, id)).filter(Boolean);
    if (flow.step === "result") {
      const r = flow.result || {};
      const title = r.tier === "big" ? "⚡ BIG BOOST" : (r.tier === "party" ? "⚡ PARTY BOOST" : "⚡ BOOST FALLITO");
      const rows = (r.results || []).map((x) => `<div class="fa-boost-result-row ${x.success ? "is-success" : ""}"><strong>${escapeHtml(x.playerName)}</strong><span>SCELTA ${x.choice} · 🎲 ${x.roll} ${x.success ? "✓" : ""}</span></div>`).join("");
      return `<div class="fa-action-hub-kicker">EVENTO DI SQUADRA</div><h3>${title}</h3><div class="fa-boost-results">${rows}</div><div class="fa-boost-summary"><strong>${r.successes || 0} SUCCESSI</strong><span>${r.charges ? `+1 dado ai prossimi ${r.charges} Attacchi di Squadra` : "Nessuna carica ottenuta"}</span></div><button type="button" class="fa-btn fa-btn-primary" id="fa-boost-close">CONTINUA</button>`;
    }
    if (flow.step === "roll") {
      return `<div class="fa-action-hub-kicker">⚡ PARTY BOOST</div><h3>ORA TIRATE 1 D6 A TESTA</h3><p class="fa-panel-mini-help">Il successo arriva solo se il dado coincide con il numero dichiarato.</p><div class="fa-boost-grid">${participants.map((p) => `<div class="fa-boost-card"><strong>${escapeHtml(p.name)}</strong><span>HA SCELTO <b>${flow.choices[p.id]}</b></span><div class="fa-dice-input-buttons">${[1,2,3,4,5,6].map((v)=>`<button type="button" class="fa-dice-btn ${Number(flow.rolls[p.id])===v ? "is-selected" : ""}" data-boost-roll-player="${p.id}" data-value="${v}">${v}</button>`).join("")}</div></div>`).join("")}</div><button type="button" class="fa-btn fa-btn-primary" id="fa-boost-submit" ${partyBoostFlowComplete(flow.rolls, flow.participantIds) ? "" : "disabled"}>CONFERMA PARTY BOOST</button><button type="button" class="fa-btn fa-btn-ghost" id="fa-boost-back">CAMBIA NUMERI</button>`;
    }
    return `<div class="fa-action-hub-kicker">⚡ PARTY BOOST</div><h3>OGNUNO SCEGLIE UN NUMERO</h3><p class="fa-panel-mini-help">Scegliete da 1 a 6 senza sapere ancora cosa uscirà. Poi ognuno tirerà 1 D6 fisico.</p><div class="fa-boost-grid">${participants.map((p) => `<div class="fa-boost-card"><strong>${escapeHtml(p.name)}</strong><div class="fa-dice-input-buttons">${[1,2,3,4,5,6].map((v)=>`<button type="button" class="fa-dice-btn ${Number(flow.choices[p.id])===v ? "is-selected" : ""}" data-boost-choice-player="${p.id}" data-value="${v}">${v}</button>`).join("")}</div></div>`).join("")}</div><button type="button" class="fa-btn fa-btn-primary" id="fa-boost-roll-start" ${partyBoostFlowComplete(flow.choices, flow.participantIds) ? "" : "disabled"}>NUMERI SCELTI · TIRATE I DADI</button><button type="button" class="fa-btn fa-btn-ghost" id="fa-boost-cancel">ANNULLA</button>`;
  }

  function renderActionHub(state, player) {
    const dir = game.dir;
    if (!shouldUseActionHub({ magnifyMode, nodeId: player && player.nodeId, directorPhase: dir && dir.directorPhase, moveMode, scannerMode })) return "";

    if (dir.pendingReaction && !dir.awaitingRoll) {
      return `<section class="fa-action-hub is-flow" aria-label="Reazione al nemico">${enemyReactionMarkup(dir, state)}</section>`;
    }
    if (destinyFlow || player.status === "ko") {
      return `<section class="fa-action-hub is-flow" aria-label="Rialzo del destino">${destinyMarkup(player)}</section>`;
    }
    if (partyBoostFlow) {
      return `<section class="fa-action-hub is-flow" aria-label="Party Boost">${buildPartyBoostFlowMarkup(state)}</section>`;
    }
    if (vehicleFlow) {
      return `<section class="fa-action-hub is-flow" aria-label="Mezzo pesante">${buildVehicleFlowMarkup(state, player)}</section>`;
    }
    const mode = getActionHubMode({ attackFlow, tradeFlow, chestResult });
    if (mode === "attack") {
      return `<section class="fa-action-hub is-flow" aria-label="Azioni del turno">${buildAttackFlowMarkup()}</section>`;
    }
    if (mode === "trade") {
      return `<section class="fa-action-hub is-flow" aria-label="Dai oggetto">${buildTradeFlowMarkup(state, player)}</section>`;
    }
    if (mode === "chest") {
      return `<section class="fa-action-hub is-flow" aria-label="Oggetti trovati">
        <div class="fa-action-hub-kicker">CASSA APERTA</div>
        <h3>HAI TROVATO</h3>
        <div class="fa-chest-cards">${chestItemCardMarkup(chestResult.weapon)}${chestItemCardMarkup(chestResult.support)}</div>
        <button type="button" class="fa-btn fa-btn-ghost" id="fa-chest-close">HO FINITO</button>
      </section>`;
    }

    const situation = director.getSituation(state, player);
    let actions = director.getAvailableActions(state, player);
    const waiting = waitingTeamCompanions(state, player);
    const canAttackHere = actions.some((a) => a.id === "attacca");
    if (canAttackHere && waiting.length) {
      actions = [{ id: "attacco_squadra", label: `🤝 ATTACCO DI SQUADRA · ${Math.min(3, 1 + waiting.length)} GIOCATORI` }].concat(actions);
    }
    if (!hasFutureJoinablePlayer(state, dir, player)) actions = actions.filter((a) => a.id !== "attendi");
    return `<section class="fa-action-hub" aria-label="Azioni del turno">
      <div class="fa-action-hub-kicker">TOCCA A ${escapeHtml(player.name).toUpperCase()}</div>
      ${actionHubWeaponStrip(player)}
      <h3>COSA PUOI FARE QUI</h3>
      ${groundLootMarkup(situation.groundLoot, player)}
      <div class="fa-action-list fa-action-hub-list">${actions.map(actionButtonMarkup).join("")}</div>
    </section>`;
  }

  const MAP_OBJECT_ASSET_BASE = "assets/fortress/map-objects/";
  const MAP_ACTOR_ASSET_BASE = "assets/fortress/map-actors/";

  function mapObjectAsset(name) {
    return `${MAP_OBJECT_ASSET_BASE}${name}`;
  }

  function mapActorAsset(name) {
    return `${MAP_ACTOR_ASSET_BASE}${name}`;
  }

  function enemyMapAsset(enemy) {
    const type = String(enemy && enemy.archetype || "normale").toLowerCase();
    if (type === "aggressivo") return mapActorAsset("enemy-aggressive.webp");
    if (type === "distanza") return mapActorAsset("enemy-ranged.webp");
    if (type === "resistente") return mapActorAsset("enemy-resistant.webp");
    if (type === "elite") return mapActorAsset("enemy-resistant.webp");
    return mapActorAsset("enemy-normal.webp");
  }

  function vehicleMapAsset(vehicle) {
    const name = String(vehicle && vehicle.name || "").toLowerCase();
    if (/autobus|bus/.test(name)) return mapActorAsset("vehicle-armored-bus.webp");
    if (/ruspa|bulldozer/.test(name)) return mapActorAsset("vehicle-assault-bulldozer.webp");
    if (/camion|truck/.test(name)) return mapActorAsset("vehicle-armored-truck.webp");
    return mapActorAsset("vehicle-military.webp");
  }

  function structureMapAsset(structure, zone) {
    const id = String(structure && structure.id || "").toLowerCase();
    const name = String(structure && structure.name || "").toLowerCase();
    const zoneId = String(zone && zone.id || "").toLowerCase();
    if (zoneId === "central-fortress" || /fortezza/.test(name)) return mapObjectAsset("fortezza-centrale.webp");
    if (/depot|ammo|munizion/.test(id + " " + name)) return mapObjectAsset("deposito-munizioni.webp");
    if (/radar|radio|watch|torre/.test(id + " " + name)) return mapObjectAsset("torre-radar.webp");
    if (/generator|generatore|seal|sigillo/.test(id + " " + name)) return mapObjectAsset("generatore.webp");
    return mapObjectAsset("bunker.webp");
  }

  function shelterMapAsset(shelter) {
    const name = String(shelter && shelter.name || "").toLowerCase();
    if (/bunker/.test(name)) return mapObjectAsset("bunker.webp");
    if (/trincea|postazione|barricata/.test(name)) return mapObjectAsset("barricata.webp");
    return mapObjectAsset("riparo-capanno.webp");
  }

  function mapObjectImage(src, alt, cls = "") {
    return `<img class="fa-map-object-img ${cls}" src="${escapeHtml(src)}" alt="${escapeHtml(alt || "")}" draggable="false">`;
  }

  function renderMagnify(state, player) {
    const zone = loop.getZone(state, player.zoneId);
    const zoneDef = zoneCatalogEntry(zone.id);
    const nodes = zone.nodes || [];

    const anchoredParts = [];
    const nodesMarkup = nodes.map((n) => {
      const isCurrent = player.nodeId === n.id;
      const isSafeEntry = Boolean(zone.entryNodeId && n.id === zone.entryNodeId);
      const enemies = loop.enemiesAtNode(state, zone.id, n.id);
      const chest = (zone.chests || []).find((c) => c.nodeId === n.id && !c.opened);
      const hasLoot = (zone.groundLoot || []).some((g) => g.nodeId === n.id);
      const shelter = loop.getShelterAtNode ? loop.getShelterAtNode(state, zone.id, n.id) : null;
      const structure = zone.operationalStructure && !zone.operationalStructure.destroyed && zone.operationalStructure.nodeId === n.id
        ? zone.operationalStructure : null;
      const partyBoostEvent = loop.getPartyBoostEvent ? loop.getPartyBoostEvent(state, zone.id) : null;
      const boostHere = partyBoostEvent && partyBoostEvent.nodeId === n.id ? partyBoostEvent : null;
      const nodePlayers = state.players.filter((p) => p.present !== false && p.zoneId === zone.id && p.nodeId === n.id && p.status !== "eliminated");
      const vehicle = isSafeEntry && zone.vehicleVisit && zone.vehicleVisit.active && zone.vehicleVisit.vehicle ? zone.vehicleVisit.vehicle : null;

      const entryAnchor = runtimeNodeAnchor(zone.id, n.id, "entry");
      const chestAnchor = runtimeNodeAnchor(zone.id, n.id, "chest");
      const lootAnchor = runtimeNodeAnchor(zone.id, n.id, "loot");
      const shelterAnchor = runtimeNodeAnchor(zone.id, n.id, "shelter");
      const trapAnchor = runtimeNodeAnchor(zone.id, n.id, "trap");
      const structureAnchor = runtimeNodeAnchor(zone.id, n.id, "structure");
      const boostAnchor = runtimeNodeAnchor(zone.id, n.id, "boost");
      const vehicleAnchor = runtimeNodeAnchor(zone.id, n.id, "vehicle");

      const safeHtml = isSafeEntry ? `<div class="fa-safe-node-label fa-safe-node-visual">${mapObjectImage(mapObjectAsset("entry.webp"), "Zona Sicura", "fa-map-object-entry")}<span>ZONA SICURA</span></div>` : "";
      const chestHtml = chest ? `<span class="fa-node-marker fa-node-object fa-node-chest" title="Cassa">${mapObjectImage(mapObjectAsset("cassa.webp"), "Cassa")}</span>` : "";
      const lootHtml = hasLoot ? `<span class="fa-node-marker fa-node-object fa-node-ground-loot" title="Oggetti a terra">${mapObjectImage(mapObjectAsset("loot-terra.webp"), "Loot a terra")}</span>` : "";
      const shelterHtml = shelter ? `<span class="fa-node-marker fa-node-shelter fa-node-object fa-node-shelter-visual" title="${escapeHtml(shelter.name)}">${mapObjectImage(shelterMapAsset(shelter), shelter.name)}<b>${escapeHtml(shelter.name)}</b></span>` : "";
      const trapHtml = shelter && shelter.trap && shelter.trap.armed ? `<span class="fa-node-marker fa-node-trap fa-node-object" title="Trappola armata">${mapObjectImage(mapObjectAsset("mina.webp"), "Trappola armata")}</span>` : "";
      const structureHtml = structure ? `<span class="fa-node-marker fa-node-structure fa-node-object fa-node-structure-visual" title="${escapeHtml(structure.name)} · HP ${structure.hp}/${structure.maxHp}">${mapObjectImage(structureMapAsset(structure, zone), structure.name)}<b>${escapeHtml(structure.name)}</b><small>❤️ ${structure.hp}/${structure.maxHp} · 🛡️ ${structure.armor || 0}</small></span>` : "";
      const boostHtml = boostHere ? `<span class="fa-node-marker fa-node-party-boost fa-node-object fa-node-boost-visual ${boostHere.consumed ? "is-consumed" : ""}" title="${boostHere.consumed ? `Party Boost consumato · ${boostHere.charges || 0} cariche` : "Evento Party Boost"}">${mapObjectImage(mapObjectAsset("party-boost.webp"), "Party Boost")}<b>${boostHere.consumed ? (boostHere.charges > 0 ? `BOOST ×${boostHere.charges}` : "BOOST USATO") : "PARTY BOOST"}</b></span>` : "";
      const vehicleHtml = vehicle ? `<button type="button" class="fa-node-vehicle-marker" data-vehicle-open title="Apri mezzo pesante"><img class="fa-map-vehicle-img" src="${escapeHtml(vehicleMapAsset(vehicle))}" alt="${escapeHtml(vehicle.name)}" draggable="false"><b>${escapeHtml(vehicle.name)}</b><small>🔧 ${vehicle.integrity}/${vehicle.maxIntegrity}</small></button>` : "";

      if (entryAnchor && safeHtml) anchoredParts.push(anchoredMarkup(entryAnchor, safeHtml, "is-entry"));
      if (chestAnchor && chestHtml) anchoredParts.push(anchoredMarkup(chestAnchor, chestHtml, "is-chest"));
      if (lootAnchor && lootHtml) anchoredParts.push(anchoredMarkup(lootAnchor, lootHtml, "is-loot"));
      if (shelterAnchor && shelterHtml) anchoredParts.push(anchoredMarkup(shelterAnchor, shelterHtml, "is-shelter"));
      if (trapAnchor && trapHtml) anchoredParts.push(anchoredMarkup(trapAnchor, trapHtml, "is-trap"));
      if (structureAnchor && structureHtml) anchoredParts.push(anchoredMarkup(structureAnchor, structureHtml, "is-structure"));
      if (boostAnchor && boostHtml) anchoredParts.push(anchoredMarkup(boostAnchor, boostHtml, "is-boost"));
      if (vehicleAnchor && vehicleHtml) anchoredParts.push(anchoredMarkup(vehicleAnchor, vehicleHtml, "is-vehicle"));

      const fallbackEnemies = [];
      const enemyAnchors = runtimeEntityAnchors(zone.id, n.id, "enemies", enemies);
      enemies.forEach((e) => {
        const a = enemyAnchors.get(String(e.id));
        if (a) anchoredParts.push(anchoredMarkup(a, enemyMarkerMarkup(e), "is-enemy"));
        else fallbackEnemies.push(e);
      });
      const fallbackPlayers = [];
      const playerAnchors = runtimeEntityAnchors(zone.id, n.id, "players", nodePlayers);
      nodePlayers.forEach((p) => {
        const a = playerAnchors.get(String(p.id));
        if (a) anchoredParts.push(anchoredMarkup(a, tacticalPlayerMarkup(p, player), "is-player"));
        else fallbackPlayers.push(p);
      });
      const tokens = fallbackPlayers.map((p) => tokenMarkup(p, player)).join("");

      return `<div class="fa-node ${isCurrent ? "is-current" : ""} ${isSafeEntry ? "is-safe-entry" : ""}" style="left:${n.x}%;top:${n.y}%;">
        ${!entryAnchor ? safeHtml : ""}
        <div class="fa-node-dot"></div>
        <div class="fa-node-markers">
          ${!chestAnchor ? chestHtml : ""}
          ${!lootAnchor ? lootHtml : ""}
          ${!shelterAnchor ? shelterHtml : ""}
          ${!trapAnchor ? trapHtml : ""}
          ${!structureAnchor ? structureHtml : ""}
          ${!boostAnchor ? boostHtml : ""}
          ${!vehicleAnchor ? vehicleHtml : ""}
          ${fallbackEnemies.length ? `<span class="fa-node-marker fa-node-enemies">${nodeEnemyMarkersMarkup(fallbackEnemies)}</span>` : ""}
        </div>
        ${tokens ? `<div class="fa-node-tokens">${tokens}</div>` : ""}
      </div>`;
    }).join("");

    const currentNode = nodes.find((n) => n.id === player.nodeId);
    const isPlayerTurn = game.dir && game.dir.directorPhase === "player-turn";
    const canMove = isPlayerTurn && !player.movedThisRound;
    const connectionBaseDir = (key) => {
      const m = String(key || "").match(/^(left|right|up|down)/);
      return m ? m[1] : "right";
    };
    const connectionArrow = (key) => ({ up:"↑", down:"↓", left:"←", right:"→" })[connectionBaseDir(key)] || "→";
    const connectionTargetLabel = (targetId) => {
      const target = nodes.find((n) => n.id === targetId);
      if (!target) return String(targetId || "NODO");
      const m = String(target.id).match(/-n0?(\d+)$/i);
      return m ? `N${Number(m[1])}` : String(target.id).split("-").pop().toUpperCase();
    };
    const moveConnections = currentNode && currentNode.connections ? Object.entries(currentNode.connections).filter(([,targetId]) => targetId) : [];
    const moveButtons = moveConnections.map(([key,targetId]) => `<button type="button" class="fa-dir-btn fa-node-link-btn" data-dir="${escapeHtml(key)}" ${canMove ? "" : "disabled"} aria-label="Vai a ${escapeHtml(connectionTargetLabel(targetId))}"><span>${connectionArrow(key)}</span><b>${escapeHtml(connectionTargetLabel(targetId))}</b></button>`).join("");

    return `
      <div class="fa-magnify-bg" style="background-image:url('${zoneDef ? zoneDef.image : ""}')">
        ${nodesMarkup}
        ${anchoredParts.join("")}
      </div>
      ${renderNodeLegend()}
      <div class="fa-magnify-command-row">
        ${isPlayerTurn ? `<div class="fa-movement-hub">
          <div class="fa-move-hint ${canMove ? "" : "is-used"}">${canMove ? "PUOI MUOVERTI UNA VOLTA" : "MOVIMENTO USATO"}</div>
          ${zone.entryNodeId && player.nodeId === zone.entryNodeId ? `<div class="fa-safe-zone-help"><strong>🟢 ZONA SICURA</strong><span>Qui sei al riparo. Per combattere entra nel nodo dei nemici.</span></div>` : ""}
          <div class="fa-magnify-controls fa-node-link-controls">
            ${moveButtons || `<span class="fa-no-node-links">NESSUN COLLEGAMENTO</span>`}
          </div>
        </div>` : `<div class="fa-movement-hub"><div class="fa-move-hint is-used">⚔️ FASE NEMICI · RESTATE SUL NODO</div></div>`}
        ${renderActionHub(state, player)}
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
      const dirBtn = ev.target.closest(".fa-dir-btn");
      if (dirBtn) { if (!dirBtn.disabled) handleMoveNode(dirBtn.dataset.dir); return; }

      const vehicleMarker = ev.target.closest("[data-vehicle-open]");
      if (vehicleMarker) {
        const playerId = director.getCurrentPlayerId(game.state, game.dir);
        const player = playerId && loop.getPlayer(game.state, playerId);
        const zone = player && loop.getZone(game.state, player.zoneId);
        if (!player || !zone || player.nodeId !== zone.entryNodeId || game.dir.directorPhase !== "player-turn") {
          pushEvent("MEZZO PESANTE — per usarlo torna nella Zona Sicura durante il tuo turno"); render(); return;
        }
        vehicleFlow = { step:"crew", initiatorId:player.id, pilotId:player.id, gunnerIds:[] }; render(); return;
      }
      const roleSelect = ev.target.closest("[data-vehicle-role]");
      if (roleSelect && vehicleFlow) {
        const role = roleSelect.dataset.vehicleRole, value = roleSelect.value;
        if (role === "pilot") vehicleFlow.pilotId = value;
        else {
          const idx = role === "gunner1" ? 0 : 1;
          vehicleFlow.gunnerIds = vehicleFlow.gunnerIds || [];
          vehicleFlow.gunnerIds[idx] = value;
        }
        return;
      }
      const vehicleTarget = ev.target.closest("[data-vehicle-target-gunner]");
      if (vehicleTarget && vehicleFlow) {
        const idx = Number(vehicleTarget.dataset.vehicleTargetGunner);
        vehicleFlow.gunnerTargets = Array.isArray(vehicleFlow.gunnerTargets) ? vehicleFlow.gunnerTargets : [null,null];
        vehicleFlow.gunnerTargets[idx] = { kind: vehicleTarget.dataset.vehicleTargetKind, id: vehicleTarget.dataset.vehicleTargetId };
        render(); return;
      }
      if (ev.target.id === "fa-vehicle-cancel") { vehicleFlow = null; render(); return; }
      if (ev.target.id === "fa-vehicle-back" && vehicleFlow) { vehicleFlow.step = "crew"; vehicleFlow.gunnerTargets = [null,null]; render(); return; }
      if (ev.target.id === "fa-vehicle-crew-confirm" && vehicleFlow) {
        const ids = [vehicleFlow.pilotId].concat(vehicleFlow.gunnerIds || []);
        if (ids.length !== 3 || new Set(ids).size !== 3) { pushEvent("MEZZO PESANTE — pilota e tiratori devono essere 3 giocatori diversi"); render(); return; }
        vehicleFlow.step = "target"; vehicleFlow.gunnerTargets = [null,null]; render(); return;
      }
      if (ev.target.id === "fa-vehicle-fire" && vehicleFlow) {
        const targets = Array.isArray(vehicleFlow.gunnerTargets) ? vehicleFlow.gunnerTargets : [];
        if (targets.length !== 2 || targets.some((t)=>!t || !t.kind || !t.id)) { pushEvent("MEZZO PESANTE — ogni tiratore deve scegliere un bersaglio"); render(); return; }
        const currentId = director.getCurrentPlayerId(game.state, game.dir);
        try {
          director.beginVehicleSalvo(game.state, game.dir, currentId, vehicleFlow.pilotId, vehicleFlow.gunnerIds || [], targets);
          const zone = loop.getZone(game.state, loop.getPlayer(game.state, currentId).zoneId);
          pushEvent(`MEZZO PESANTE — ${zone.vehicleVisit.vehicle.name}: bersagli confermati, ora tirate 3 D6`);
          vehicleFlow = null;
        } catch (e) { pushEvent(e.message); }
        render(); return;
      }

      const boostChoice = ev.target.closest("[data-boost-choice-player]");
      if (boostChoice && partyBoostFlow && partyBoostFlow.step === "declare") {
        partyBoostFlow.choices[boostChoice.dataset.boostChoicePlayer] = Number(boostChoice.dataset.value); render(); return;
      }
      const boostRoll = ev.target.closest("[data-boost-roll-player]");
      if (boostRoll && partyBoostFlow && partyBoostFlow.step === "roll") {
        partyBoostFlow.rolls[boostRoll.dataset.boostRollPlayer] = Number(boostRoll.dataset.value); render(); return;
      }
      if (ev.target.id === "fa-boost-cancel") { partyBoostFlow = null; render(); return; }
      if (ev.target.id === "fa-boost-back" && partyBoostFlow) { partyBoostFlow.step = "declare"; partyBoostFlow.rolls = {}; render(); return; }
      if (ev.target.id === "fa-boost-roll-start" && partyBoostFlow) { partyBoostFlow.step = "roll"; render(); return; }
      if (ev.target.id === "fa-boost-submit" && partyBoostFlow) {
        const currentId = director.getCurrentPlayerId(game.state, game.dir);
        const declarations = partyBoostFlow.participantIds.map((id)=>({playerId:id, choice:Number(partyBoostFlow.choices[id]), roll:Number(partyBoostFlow.rolls[id])}));
        try {
          const result = director.performPartyBoost(game.state, game.dir, currentId, declarations);
          partyBoostFlow.step = "result"; partyBoostFlow.result = result;
          pushEvent(`${result.tier === "big" ? "BIG BOOST" : result.tier === "party" ? "PARTY BOOST" : "BOOST FALLITO"} · ${result.successes} successi`);
        } catch (e) { pushEvent(e.message); }
        render(); return;
      }
      if (ev.target.id === "fa-boost-close") { partyBoostFlow = null; render(); return; }

      const activeWeaponBtn = ev.target.closest("[data-action-hub-weapon-slot]");
      if (activeWeaponBtn) { actionHubWeaponSlot = activeWeaponBtn.dataset.actionHubWeaponSlot; render(); return; }
      const destinyBtn = ev.target.closest("[data-destiny-roll]");
      if (destinyBtn) {
        const playerId = director.getCurrentPlayerId(game.state, game.dir);
        const before = playerId;
        const result = director.performDestinyRevive(game.state, game.dir, playerId, Number(destinyBtn.dataset.destinyRoll));
        const p = loop.getPlayer(game.state, playerId);
        pushEvent(result.success ? `${p.name}: IL DESTINO LO RIALZA · ${result.hp} HP` : `${p.name}: IL DESTINO DICE 1 · RESTA A TERRA`);
        destinyFlow = false; checkTurnTransition(before); render(); return;
      }
      const tradeBtn = ev.target.closest("[data-trade-slot]");
      if (tradeBtn) { handleTradeChoice(tradeBtn.dataset.tradeSlot); return; }
      if (ev.target.id === "fa-trade-cancel") { tradeFlow = null; render(); return; }

      if (handleAttackChoiceEvent(ev)) return;

      if (ev.target.id === "fa-chest-close") { chestResult = null; render(); return; }
      const pickupBtn = ev.target.closest("[data-pickup]");
      if (pickupBtn) { handlePickup(Number(pickupBtn.dataset.pickup), pickupBtn.dataset.pickupSlot); return; }

      const actionBtn = ev.target.closest("[data-action]");
      if (actionBtn) {
        handlePlayerAction(actionBtn.dataset.action, actionBtn.dataset.target, actionBtn.dataset.chest, actionBtn.dataset.utility);
      }
    });
    $("fa-magnify-wrap").addEventListener("change", (ev) => {
      const roleSelect = ev.target.closest("[data-vehicle-role]");
      if (!roleSelect || !vehicleFlow) return;
      const role = roleSelect.dataset.vehicleRole, value = roleSelect.value;
      if (role === "pilot") vehicleFlow.pilotId = value;
      else {
        const idx = role === "gunner1" ? 0 : 1;
        vehicleFlow.gunnerIds = vehicleFlow.gunnerIds || [];
        vehicleFlow.gunnerIds[idx] = value;
      }
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

  /* Enemy Squads V1: un nemico può muoversi di un nodo invece di attaccare
     (mai un tiro fisico in quel caso). Mostra un feedback breve e chiaro
     ("NEMICO SI MUOVE") per l'ultimo step risolto, finché non se ne prepara
     un altro — coerente col resto della Guided Turn UI, nessun controllo
     manuale aggiunto. */
  function enemyStepFeedbackMarkup(dir, state) {
    const last = dir.lastStepResult;
    if (!last || last.type !== "move") return "";
    const enemy = loop.getEnemy(state, last.enemyId);
    const label = enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico";
    const trap = last.trapTriggered;
    return `<div class="fa-enemy-move-banner"><strong>${escapeHtml(label).toUpperCase()} SI MUOVE</strong><span>${trap ? `🪤 ${escapeHtml(trap.trapName)} SCATTA · ${trap.damage} DANNI${trap.eliminated ? " · ELIMINATO" : ""}` : "Si avvicina di un nodo"}</span></div>`;
  }

  function nodeMoveChoicesMarkup(player, reactionType) {
    const zone = loop.getZone(game.state, player.zoneId);
    if (!zone || !zone.nodes || player.nodeId == null) {
      return `<button type="button" class="fa-action-btn" data-reaction="${reactionType}">${reactionType === "dodge" ? "💨 SCHIVA" : "🏃 RITIRATI"}</button>`;
    }
    const node = zone.nodes.find((n) => n.id === player.nodeId);
    const connections = node && node.connections ? node.connections : {};
    const arrowFor = (key) => {
      const m = String(key || "").match(/^(left|right|up|down)/);
      return ({ up:"↑", down:"↓", left:"←", right:"→" })[m ? m[1] : "right"] || "→";
    };
    const rows = Object.entries(connections).filter(([, nodeId]) => nodeId).map(([dir, nodeId]) =>
      `<button type="button" class="fa-action-btn" data-reaction="${reactionType}" data-retreat-node="${nodeId}">${reactionType === "dodge" ? "💨 SCHIVA" : "🏃 RITIRATI"} ${arrowFor(dir)}</button>`
    ).join("");
    return rows || `<button type="button" class="fa-action-btn" data-reaction="${reactionType}">${reactionType === "dodge" ? "💨 SCHIVA" : "🏃 RITIRATI"}</button>`;
  }

  function enemyReactionMarkup(dir, state) {
    const pending = dir.pendingReaction;
    if (!pending) return "";
    const enemy = loop.getEnemy(state, pending.enemyId);
    const target = loop.getPlayer(state, pending.targetId);
    if (!enemy || !target) return "";
    const weapons = ["primary", "secondary"].filter((slot) => target.equipment && target.equipment[slot]);
    const counterButtons = !target.offensiveSpentThisRound ? weapons.map((slot) => {
      const w = target.equipment[slot];
      return `<button type="button" class="fa-action-btn is-primary" data-reaction="counter" data-counter-slot="${slot}">⚔️ CONTRATTACCA · ${escapeHtml(w.name)}</button>`;
    }).join("") : `<div class="fa-reaction-note">Azione offensiva già usata: contrattacco non disponibile.</div>`;
    const smokeButtons = target.equipment && target.equipment.utility && target.equipment.utility.id === "fumogeno"
      ? nodeMoveChoicesMarkup(target, "smoke-retreat").replaceAll("🏃 RITIRATI", "💨 USA FUMOGENO · FUGA SICURA")
      : "";
    return `<div class="fa-reaction-card">
      <div class="fa-action-hub-kicker">${pending.isAreaSecondary ? "💥 COLPO AD AREA · " : ""}${escapeHtml(enemy.name || ENEMY_NAME[enemy.archetype] || "NEMICO").toUpperCase()} ATTACCA ${escapeHtml(target.name).toUpperCase()}</div>
      <h3>COME REAGISCI?</h3>
      <p class="fa-reaction-help">Scegli prima la reazione. Poi tirerete i dadi fisici.</p>
      <div class="fa-action-list fa-action-hub-list">
        <button type="button" class="fa-action-btn" data-reaction="defend">🛡️ DIFENDITI</button>
        ${nodeMoveChoicesMarkup(target, "dodge")}
        ${nodeMoveChoicesMarkup(target, "retreat")}
        ${smokeButtons}
        ${counterButtons}
      </div>
    </div>`;
  }

  function destinyMarkup(player) {
    return `<div class="fa-destiny-card">
      <div class="fa-action-hub-kicker">${escapeHtml(player.name).toUpperCase()} È A TERRA</div>
      <h3>IL DESTINO TI DÀ UN'ALTRA POSSIBILITÀ</h3>
      <p>🎲 Tira <strong>1 D6 fisico</strong>: <strong>1</strong> resti KO · <strong>2–5</strong> torni con 2 HP · <strong>6</strong> torni con 4 HP.</p>
      <div class="fa-destiny-dice">${[1,2,3,4,5,6].map((v) => `<button type="button" class="fa-dice-btn" data-destiny-roll="${v}">${v}</button>`).join("")}</div>
    </div>`;
  }

  function waitingTeamCompanions(state, player) {
    if (!player || !player.zoneId || !player.nodeId) return [];
    return state.players.filter((p) => p.id !== player.id && p.present !== false && p.status === "active" &&
      p.zoneId === player.zoneId && p.nodeId === player.nodeId &&
      p.waitingForPartyThisRound && !p.offensiveSpentThisRound &&
      getEquippedWeaponSlots(p.equipment).length);
  }

  function hasFutureJoinablePlayer(state, dir, player) {
    if (!dir || dir.directorPhase !== "player-turn" || !player) return false;
    const zone = loop.getZone(state, player.zoneId);
    const targetNode = zone && zone.nodes && zone.nodes.find((n) => n.id === player.nodeId);
    for (let i = dir.currentPlayerIndex + 1; i < dir.roundPlayerQueue.length; i++) {
      const p = loop.getPlayer(state, dir.roundPlayerQueue[i]);
      if (!p || p.present === false || p.status !== "active" || p.id === player.id || p.offensiveSpentThisRound || p.zoneId !== player.zoneId) continue;
      if (!zone || !zone.nodes) return true;
      if (p.nodeId === player.nodeId) return true;
      if (p.movedThisRound || !p.nodeId || !targetNode) continue;
      const sourceNode = zone.nodes.find((n) => n.id === p.nodeId);
      const links = sourceNode && sourceNode.connections ? Object.values(sourceNode.connections) : [];
      if (links.includes(player.nodeId)) return true;
    }
    return false;
  }

  function actionButtonMarkup(a) {
    const cls = a.id === "fine_turno" ? "is-end-turn" : (a.id === "rianima" ? "is-rianima" : ((a.id === "attacca" || a.id === "attacco_squadra") ? "is-primary" : ""));
    const targetAttr = a.targetId ? ` data-target="${a.targetId}"` : "";
    const chestAttr = a.chestId ? ` data-chest="${a.chestId}"` : "";
    const utilityAttr = a.utilityId ? ` data-utility="${a.utilityId}"` : "";
    return `<button type="button" class="fa-action-btn ${cls}" data-action="${a.id}"${targetAttr}${chestAttr}${utilityAttr}>${a.label}</button>`;
  }

  function partyTacticalSummaryMarkup(state, player) {
    if (!player || !player.zoneId) return "";
    const zone = loop.getZone(state, player.zoneId);
    const members = state.players.filter((p) => p.present !== false && p.zoneId === player.zoneId && p.status !== "eliminated" && (!zone.nodes || p.nodeId === player.nodeId));
    if (members.length < 2) return "";
    const rows = members.map((p) => {
      const eq = p.equipment || {};
      const resources = [eq.cura, eq.scudo, eq.utility].filter(Boolean).map((x) => x.name).join(" · ") || "nessuna risorsa";
      const c = p.contributions || { damage:0, defenses:0, supports:0, rescues:0 };
      const wait = p.waitingForPartyThisRound ? `<b class="fa-party-waiting">⏳ ATTENDE LA SQUADRA</b>` : "";
      return `<div class="fa-party-tactical-row"><strong>${escapeHtml(p.name)}</strong><span>❤️ ${p.hp}/10 · 🛡️ ${p.shield}/10</span>${wait}<small>${escapeHtml(resources)}</small><em>⚔️ ${c.damage || 0} · 🛡️ ${c.defenses || 0} · 🤝 ${c.supports || 0} · ❤️ ${c.rescues || 0}</em></div>`;
    }).join("");
    return `<div class="fa-panel-section"><h4>Squadra qui con te</h4><p class="fa-panel-mini-help">Risorse visibili per decidere insieme. Gli oggetti restano del loro proprietario.</p><div class="fa-party-tactical">${rows}</div></div>`;
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
        ${enemyStepFeedbackMarkup(dir, state)}
        ${dir.pendingReaction && !dir.awaitingRoll ? enemyReactionMarkup(dir, state) : ""}
        ${dir.awaitingRoll ? "<p>In attesa dei dadi fisici...</p>" : (!dir.pendingReaction ? `<button type="button" class="fa-btn fa-btn-primary" id="fa-enemy-continue">CONTINUA</button>` : "")}</div>`;
      return;
    }
    if (dir.directorPhase === "structure-phase") {
      const zoneId=dir.structurePhase && dir.structurePhase.order[dir.structurePhase.cursor];
      const zone=zoneId ? loop.getZone(state,zoneId) : null; const st=zone && zone.operationalStructure;
      panel.innerHTML=`<div class="fa-panel-round">ROUND ${state.round}</div><div class="fa-panel-section"><h4>🏢 Fase Struttura</h4><p>${st ? escapeHtml(st.name) : "Postazione"} apre il fuoco.</p>${dir.awaitingRoll ? "<p>In attesa dei dadi fisici...</p>" : `<button type="button" class="fa-btn fa-btn-primary" id="fa-structure-continue">CONTINUA</button>`}</div>`;
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
      const giftButton = state.phase === "vittoria" && !state.giftMachineCompleted ? `<button type="button" class="fa-btn fa-btn-primary" id="fa-gameover-gifts">🎁 VAI ALLA MACCHINA REGALI</button>` : "";
      panel.innerHTML = `<div class="fa-panel-round">PARTITA CONCLUSA</div><p>${state.phase === "vittoria" ? "🏆 La squadra ha vinto!" : "💀 La squadra è stata sconfitta."}</p>${giftButton}`;
      return;
    }

    if (dir.pendingReaction && !dir.awaitingRoll) {
      panel.innerHTML = `<div class="fa-panel-round">ROUND ${state.round}</div><div class="fa-panel-section">${enemyReactionMarkup(dir, state)}</div>`;
      return;
    }

    const player = director.getCurrentPlayer(state, dir);
    if (!player) { panel.innerHTML = ""; return; }
    const situation = director.getSituation(state, player);
    const stormRisk = director.getStormRisk(state, player);
    const inActionHub = shouldUseActionHub({ magnifyMode, nodeId: situation.nodeId, directorPhase: dir.directorPhase, moveMode, scannerMode });
    const actions = (attackFlow || moveMode || scannerMode) ? [] : director.getAvailableActions(state, player);
    const stars = zoneStars(situation.danger);
    const equip = player.equipment;
    const equipLine = (label, item, actionId, actionAllowed = true) => {
      if (!item) return `<span>${label}: —</span>`;
      const weaponMeta = item.range ? ` · 📏 ${RANGE_LABELS[item.range].toUpperCase()}${Number.isFinite(item.baseDice) ? ` · 🎲 ${item.baseDice}` : ""}` : "";
      const canUse = actionId && actionAllowed && dir.directorPhase === "player-turn" && !player.actedThisRound;
      const useButton = canUse ? `<button type="button" class="fa-inventory-use" data-action="${actionId}">USA ORA</button>` : "";
      return `<span>${label}: <strong>${escapeHtml(item.name)}</strong>${weaponMeta}</span>${useButton}`;
    };

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

      ${player.status === "ko" ? `<div class="fa-ko-banner"><strong>${escapeHtml(player.name).toUpperCase()} È A TERRA</strong><span>Al suo turno può tentare il rialzo del destino.</span></div>` : ""}

      <div class="fa-panel-section">
        <h4>Situazione</h4>
        <ul class="fa-situation-list">
          ${situation.enemies.length ? `<li>${situation.enemies.length} nemici</li>` : ""}
          ${situation.bossHere ? `<li>👑 Il Boss è qui</li>` : ""}
          ${situation.companions.map((c) => `<li>${escapeHtml(c.name)}${c.status === "ko" ? " (KO)" : ""} ${c.sameNode ? "è qui" : "è nella zona, ma non qui vicino"}</li>`).join("")}
          ${situation.openChests.length ? `<li>${situation.openChests.length} cassa/e</li>` : ""}
          ${situation.structure && !situation.structure.destroyed ? `<li>🏢 ${escapeHtml(situation.structure.name)} · ${situation.structure.hp}/${situation.structure.maxHp} HP · CORAZZA ${situation.structure.armor || 0}</li>` : ""}
          ${situation.vehicle && situation.vehicle.active ? `<li>🚛 ${escapeHtml(situation.vehicle.name)} · ${situation.vehicle.integrity}/${situation.vehicle.maxIntegrity} INTEGRITÀ</li>` : ""}
          ${(!situation.enemies.length && !situation.bossHere && !situation.companions.length && !situation.openChests.length && !situation.structure) ? "<li>Nessuno nei paraggi.</li>" : ""}
        </ul>
      </div>

      ${situation.structure ? `<div class="fa-panel-section fa-structure-status"><h4>🏢 ${escapeHtml(situation.structure.name)}</h4><div class="fa-structure-bar"><span style="width:${Math.max(0,Math.min(100,(situation.structure.hp/situation.structure.maxHp)*100))}%"></span></div><p><strong>${situation.structure.hp}/${situation.structure.maxHp}</strong> · CORAZZA ${situation.structure.armor || 0}${situation.structure.destroyed ? " · DISTRUTTA" : ""}</p><p>${(situation.structure.activeTags || []).map(escapeHtml).join(" · ")}</p></div>` : ""}
      ${situation.vehicle && situation.vehicle.active ? `<div class="fa-panel-section fa-vehicle-status"><h4>🚛 ${escapeHtml(situation.vehicle.name)}</h4><p>🔧 ${situation.vehicle.integrity}/${situation.vehicle.maxIntegrity} INTEGRITÀ · Equipaggio: 1 pilota + 2 tiratori</p></div>` : ""}

      ${partyTacticalSummaryMarkup(state, player)}

      ${eventLog.length ? `<div class="fa-panel-section"><h4>Eventi recenti</h4><ul class="fa-situation-list">${eventLog.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul></div>` : ""}

      <div class="fa-panel-section">
        <h4>Inventario</h4>
        <div class="fa-inventory-line">${equipLine("Primary", equip.primary)}</div>
        <div class="fa-inventory-line">${equipLine("Secondary", equip.secondary)}</div>
        <div class="fa-inventory-line">${equipLine("Cura", equip.cura, "usa_cura", player.hp < PLAYER_MAX_STAT)}</div>
        <div class="fa-inventory-line">${equipLine("Scudo", equip.scudo, "usa_scudo", player.shield < PLAYER_MAX_STAT)}</div>
        <div class="fa-inventory-line">${equipLine("Utility", equip.utility)}</div>
      </div>

      ${inActionHub ? "" : groundLootMarkup(situation.groundLoot, player)}

      ${inActionHub ? `<div class="fa-panel-section fa-panel-hub-note"><h4>Azioni</h4><p>Usa il pannello azioni sotto la mappa.</p></div>` : tradeFlow ? `<div class="fa-panel-section">${buildTradeFlowMarkup(state, player)}</div>` : `<div class="fa-panel-section">
        <h4>Cosa vuoi fare?</h4>
        <div class="fa-action-list">${moveMode ? `<p>Scegli una zona evidenziata sulla mappa.</p>` : actions.map(actionButtonMarkup).join("")}</div>
        ${moveMode ? `<button type="button" class="fa-btn fa-btn-ghost" id="fa-move-cancel">Annulla spostamento</button>` : ""}
      </div>`}
    `;
  }

  function handlePlayerAction(actionId, targetId, chestId, utilityId) {
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    const player = loop.getPlayer(state, playerId);
    let endsTurn = false;
    switch (actionId) {
      case "sposta": moveMode = true; break;
      case "destiny_revive": destinyFlow = true; break;
      case "attacca": {
        const targets = getAttackTargets(state, player);
        const inHub = shouldUseActionHub({ magnifyMode, nodeId: player.nodeId, directorPhase: dir.directorPhase, moveMode, scannerMode });
        attackFlow = inHub
          ? buildAttackFlowFromSelectedSlot(player.equipment, targets, actionHubWeaponSlot)
          : buildInitialAttackFlow(player.equipment, targets);
        break;
      }
      case "attacco_squadra": {
        const targets = getAttackTargets(state, player);
        attackFlow = buildAttackFlowFromSelectedSlot(player.equipment, targets, actionHubWeaponSlot);
        attackFlow.teamParticipantIds = waitingTeamCompanions(state, player).slice(0, 2).map((p) => p.id);
        attackFlow.teamWeaponSlots = {};
        if (attackFlow.step === "preview") attackFlow.step = "team-select";
        else attackFlow.teamAutoStart = true;
        break;
      }
      case "mezzo_pesante": {
        vehicleFlow = { step:"crew", initiatorId:playerId, pilotId:playerId, gunnerIds:[] };
        pushEvent(`MEZZO PESANTE — prepara prima l'equipaggio`);
        break;
      }
      case "demolisci": {
        const weapon = player.equipment[actionHubWeaponSlot] || player.equipment.primary || player.equipment.secondary;
        if (!weapon) { pushEvent("DEMOLIZIONE — nessuna arma equipaggiata"); break; }
        director.beginStructureAttack(state, dir, playerId, weapon);
        pushEvent(`DEMOLIZIONE — ${player.name} usa ${weapon.name}`);
        break;
      }
      case "rianima": director.performRianima(state, dir, playerId, targetId); endsTurn = true; break;
      case "aiuta": director.performAiuto(state, dir, playerId, targetId); endsTurn = true; break;
      case "attendi": {
        director.performAttendiSquadra(state, dir, playerId);
        pushEvent(`${player.name}: ATTENDE LA SQUADRA · resta esposto alla fase nemici`);
        endsTurn = true;
        break;
      }
      case "nasconditi": {
        const result = director.performNasconditi(state, dir, playerId);
        pushEvent(`${player.name}: NASCOSTO NEL RIPARO · i nemici preferiranno bersagli esposti`);
        endsTurn = true;
        break;
      }
      case "piazza_trappola": {
        const result = director.performPiazzaTrappola(state, dir, playerId);
        pushEvent(`${player.name}: TRAPPOLA ARMATA · ${result.damage} danni al primo nemico che entra`);
        endsTurn = true;
        break;
      }
      case "party_boost": {
        const participants = loop.partyBoostParticipants(state, playerId);
        partyBoostFlow = { step:"declare", initiatorId:playerId, participantIds:participants.map((p)=>p.id), choices:{}, rolls:{}, result:null };
        pushEvent(`PARTY BOOST — ${participants.length} giocatori pronti`);
        break;
      }
      case "scambia": tradeFlow = { targetId }; break;
      case "usa_cura": director.performUsaCura(state, dir, playerId); endsTurn = true; break;
      case "usa_scudo": director.performUsaScudo(state, dir, playerId); endsTurn = true; break;
      case "usa_utility": {
        const result = director.performUsaUtility(state, dir, playerId, utilityId === "scanner" ? chestId : null, Math.random);
        if (result.type === "scanner") pushEvent(`SCANNER CASSA — ${lootEntryLabel(result.weapon)} + ${lootEntryLabel(result.support)}`);
        if (result.type === "fumogeno") pushEvent("Fumogeno lanciato: -1 dado al prossimo attacco nemico qui.");
        if (result.type === "stim") pushEvent("Stim pronto: +1 dado al tuo prossimo attacco.");
        endsTurn = true;
        break;
      }
      case "apri_cassa": {
        const found = director.performApriCassa(state, dir, playerId, chestId, Math.random);
        chestResult = found;
        pushEvent(`CASSA APERTA — a terra: ${lootEntryLabel(found.weapon)} + ${lootEntryLabel(found.support)}`);
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
    pushEvent(`${player.name}: RACCOLTO — ${lootEntryLabel(entry)}`);
    // Modale cassa aperta (Guided Turn UI): la card appena presa sparisce; a
    // modale vuoto si chiude da sola (nessuna azione residua da compiere lì).
    if (chestResult) {
      if (chestResult.weapon && chestResult.weapon.instanceId === instanceId) chestResult.weapon = null;
      if (chestResult.support && chestResult.support.instanceId === instanceId) chestResult.support = null;
      if (!chestResult.weapon && !chestResult.support) chestResult = null;
    }
    render();
  }

  function handleTradeChoice(slot) {
    if (!tradeFlow) return;
    const state = game.state, dir = game.dir;
    const playerId = director.getCurrentPlayerId(state, dir);
    const player = loop.getPlayer(state, playerId);
    const target = loop.getPlayer(state, tradeFlow.targetId);
    const item = player && player.equipment ? player.equipment[slot] : null;
    if (!item || !target) { tradeFlow = null; render(); return; }
    const itemName = item.name || slot;
    director.performScambia(state, dir, playerId, target.id, slot);
    pushEvent(`${player.name}: DATO — ${itemName} → ${target.name}`);
    tradeFlow = null;
    checkTurnTransition(playerId);
    render();
  }

  function bindPanelEvents() {
    $("fa-turn-panel").addEventListener("click", (ev) => {
      const btn = ev.target.closest("button");
      if (!btn) return;
      if (btn.id === "fa-gameover-gifts") { startGiftMachine(); return; }
      if (btn.id === "fa-enemy-continue") { director.beginEnemyRollStep(game.state, game.dir); render(); return; }
      if (btn.id === "fa-structure-continue") { director.beginStructureRollStep(game.state, game.dir); render(); return; }
      if (btn.dataset.reaction) {
        const pending = game.dir.pendingReaction;
        const target = pending ? loop.getPlayer(game.state, pending.targetId) : null;
        const weapon = btn.dataset.counterSlot && target ? target.equipment[btn.dataset.counterSlot] : null;
        const reactionStart = director.chooseEnemyReaction(game.state, game.dir, btn.dataset.reaction, { weapon, retreatNodeId: btn.dataset.retreatNode || null });
        if (reactionStart && reactionStart.type === "resolved-smoke-retreat") {
          const p = target;
          pushEvent(`${p.name}: FUMOGENO · FUGA SICURA, 0 DANNI`);
        }
        render(); return;
      }
      if (btn.dataset.destinyRoll) {
        const playerId = director.getCurrentPlayerId(game.state, game.dir);
        const before = playerId;
        const result = director.performDestinyRevive(game.state, game.dir, playerId, Number(btn.dataset.destinyRoll));
        const p = loop.getPlayer(game.state, playerId);
        pushEvent(result.success ? `${p.name}: IL DESTINO LO RIALZA · ${result.hp} HP` : `${p.name}: IL DESTINO DICE 1 · RESTA A TERRA`);
        destinyFlow = false; checkTurnTransition(before); render(); return;
      }
      if (btn.id === "fa-boss-continue") { director.beginBossRollStep(game.state, game.dir); render(); return; }
      if (btn.id === "fa-end-round") { director.resolveEndOfRound(game.state, game.dir, Math.random); render(); return; }
      if (btn.id === "fa-move-cancel") { moveMode = false; render(); return; }
      if (btn.id === "fa-magnify-toggle") { magnifyMode = !magnifyMode; render(); return; }
      if (btn.id === "fa-trade-cancel") { tradeFlow = null; render(); return; }
      if (btn.dataset.tradeSlot) { handleTradeChoice(btn.dataset.tradeSlot); return; }
      if (btn.dataset.pickup) { handlePickup(Number(btn.dataset.pickup), btn.dataset.pickupSlot); return; }
      const actionId = btn.dataset.action;
      if (actionId) handlePlayerAction(actionId, btn.dataset.target, btn.dataset.chest, btn.dataset.utility);
    });
  }

  function bindMapEvents() {
    $("fa-map-zones").addEventListener("click", (ev) => {
      const tile = ev.target.closest(".fa-zone-tile");
      if (!tile || tile.disabled) return;
      const zoneId = tile.dataset.zone;
      if (isLanding()) { chooseLandingZone(zoneId); return; }
      if (moveMode) { beginMoveLaunch(zoneId); return; }
    });
  }

  function handleMoveToZone(zoneId) { beginMoveLaunch(zoneId); }

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

  function eligibleTeamCompanions(state, leader) {
    if (!leader || !leader.zoneId || !leader.nodeId) return [];
    return state.players.filter((p) => p.id !== leader.id && p.present !== false && p.status === "active" && p.zoneId === leader.zoneId && p.nodeId === leader.nodeId && !p.offensiveSpentThisRound && getEquippedWeaponSlots(p.equipment).length);
  }

  function defaultTeamWeapon(player) {
    const slot = resolvePreferredWeaponSlot(player && player.equipment, "primary");
    return slot ? player.equipment[slot] : null;
  }

  function buildTeamSelectMarkup(player) {
    const companions = eligibleTeamCompanions(game.state, player);
    const selected = new Set(attackFlow.teamParticipantIds || []);
    attackFlow.teamWeaponSlots = attackFlow.teamWeaponSlots || {};
    const cards = companions.map((p) => {
      const slots = getEquippedWeaponSlots(p.equipment);
      const chosenSlot = resolvePreferredWeaponSlot(p.equipment, attackFlow.teamWeaponSlots[p.id]);
      attackFlow.teamWeaponSlots[p.id] = chosenSlot;
      const w = chosenSlot ? p.equipment[chosenSlot] : null;
      const on = selected.has(p.id);
      const weaponChoices = slots.map((slot) => {
        const sw = p.equipment[slot];
        const active = slot === chosenSlot;
        return `<button type="button" class="fa-team-weapon-choice ${active ? "is-selected" : ""}" data-team-weapon-player="${p.id}" data-team-weapon-slot="${slot}">${slot === "primary" ? "P" : "S"} · ${escapeHtml(sw.name)}</button>`;
      }).join("");
      return `<div class="fa-team-member ${on ? "is-selected" : ""}">
        <button type="button" class="fa-team-member-toggle" data-team-member="${p.id}" aria-pressed="${on ? "true" : "false"}"><strong>${escapeHtml(p.name)}</strong><span>${on ? "✓ PARTECIPA" : "+ INVITA"}</span></button>
        <div class="fa-team-member-weapon"><small>ARMA PER QUESTO ATTACCO</small>${weaponChoices}</div>
        ${w ? `<span class="fa-team-member-dice">🎲 ${w.baseDice} base</span>` : ""}
      </div>`;
    }).join("");
    const count = 1 + selected.size;
    return `<h2>ATTACCO DI SQUADRA</h2>
      <p class="fa-target-help">Tu partecipi sempre. Invita fino a 2 compagni sul tuo nodo. Ognuno tirerà i dadi della propria arma e consumerà la propria azione offensiva.</p>
      <div class="fa-team-leader"><strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(attackFlow.weapon.name)} · arma del leader</span></div>
      <div class="fa-team-members">${cards || "<p>Nessun compagno disponibile.</p>"}</div>
      <div class="fa-team-count">PARTECIPANTI: ${count}/3</div>
      <button type="button" class="fa-btn fa-btn-primary" id="fa-team-confirm" ${count < 2 ? "disabled" : ""}>PREPARA ATTACCO DI SQUADRA</button>
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-team-back">Indietro</button>`;
  }

  function buildTeamRollMarkup() {
    const participants = attackFlow.teamDeclared && attackFlow.teamDeclared.participants || [];
    return `<h2>ATTACCO DI SQUADRA · TIRATE INSIEME</h2>
      <p class="fa-target-help">Ogni giocatore tira fisicamente i propri dadi. Inserite i risultati sotto il suo nome.</p>
      <div class="fa-team-rolls">${participants.map((part) => `
        <div class="fa-team-roll-player"><h3>${escapeHtml(part.playerName)} · ${escapeHtml(part.weaponName)}</h3>
          ${buildTeamDiceGroupsMarkup(part.playerId, part.diceCount, attackFlow.teamRolls && attackFlow.teamRolls[part.playerId])}
        </div>`).join("")}</div>
      <button type="button" class="fa-btn fa-btn-primary" id="fa-team-submit" ${teamRollsComplete() ? "" : "disabled"}>CONFERMA ATTACCO</button>
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-cancel">Annulla</button>`;
  }

  function buildTeamRerollMarkup() {
    const pending = attackFlow.teamPendingRerolls || [];
    return `<h2>ATTACCO DI SQUADRA · RITIRO</h2>
      <p class="fa-target-help">È uscito 1 su un'arma con ritiro: quel giocatore ritira fisicamente solo i dadi indicati.</p>
      <div class="fa-team-rolls">${pending.map((part) => {
        const player = loop.getPlayer(game.state, part.playerId);
        const values = attackFlow.teamRerolls && attackFlow.teamRerolls[part.playerId] || [];
        return `<div class="fa-team-roll-player"><h3>${escapeHtml(player ? player.name : part.playerId)}</h3>${Array.from({length: part.rerollIndices.length}, (_, i) => `<div class="fa-dice-input-group"><div class="fa-dice-input-label">RITIRO DADO ${part.rerollIndices[i] + 1}</div><div class="fa-dice-input-buttons">${[1,2,3,4,5,6].map((v) => `<button type="button" class="fa-dice-btn ${values[i] === v ? "is-selected" : ""}" data-team-reroll-player="${part.playerId}" data-team-reroll="${i}" data-value="${v}">${v}</button>`).join("")}</div></div>`).join("")}</div>`;
      }).join("")}</div>
      <button type="button" class="fa-btn fa-btn-primary" id="fa-team-reroll-submit" ${teamRerollsComplete() ? "" : "disabled"}>CONFERMA RITIRI</button>`;
  }

  function teamRerollsComplete() {
    const pending = attackFlow && attackFlow.teamPendingRerolls || [];
    return pending.length > 0 && pending.every((p) => {
      const vals = attackFlow.teamRerolls && attackFlow.teamRerolls[p.playerId];
      return Array.isArray(vals) && vals.length === p.rerollIndices.length && vals.every((v) => Number.isInteger(v));
    });
  }

  function buildTeamDiceGroupsMarkup(playerId, count, values) {
    const chosen = values || [];
    return Array.from({ length: count }, (_, i) => `<div class="fa-dice-input-group" data-team-player="${playerId}" data-team-die-index="${i}">
      <div class="fa-dice-input-label">DADO ${i + 1}</div>
      <div class="fa-dice-input-buttons">${[1,2,3,4,5,6].map((v) => `<button type="button" class="fa-dice-btn ${chosen[i] === v ? "is-selected" : ""}" data-team-die-player="${playerId}" data-team-die="${i}" data-value="${v}">${v}</button>`).join("")}</div>
    </div>`).join("");
  }

  function teamRollsComplete() {
    const parts = attackFlow && attackFlow.teamDeclared && attackFlow.teamDeclared.participants || [];
    return parts.length > 0 && parts.every((p) => Array.isArray(attackFlow.teamRolls && attackFlow.teamRolls[p.playerId]) && attackFlow.teamRolls[p.playerId].length === p.diceCount && attackFlow.teamRolls[p.playerId].every((v) => Number.isInteger(v)));
  }

  function startTeamAttack() {
    const state = game.state, dir = game.dir;
    const leader = director.getCurrentPlayer(state, dir);
    const participantIds = [leader.id].concat(attackFlow.teamParticipantIds || []).slice(0, 3);
    const specs = participantIds.map((id) => {
      const p = loop.getPlayer(state, id);
      const slot = id === leader.id ? null : resolvePreferredWeaponSlot(p.equipment, attackFlow.teamWeaponSlots && attackFlow.teamWeaponSlots[id]);
      return { playerId: id, weapon: id === leader.id ? attackFlow.weapon : (slot ? p.equipment[slot] : defaultTeamWeapon(p)) };
    });
    attackActorId = leader.id;
    const declared = director.beginTeamAttack(state, dir, leader.id, attackFlow.targetId, specs);
    attackFlow.teamDeclared = declared;
    attackFlow.teamRolls = Object.fromEntries(declared.participants.map((p) => [p.playerId, new Array(p.diceCount).fill(null)]));
    attackFlow.step = "team-roll";
    render();
  }

  function flattenLootAssignments(lootFound) {
    return (lootFound || []).flatMap((drop) => (drop && drop.items) || []).map((entry) => {
      const owner = entry.ownerPlayerId ? loop.getPlayer(game.state, entry.ownerPlayerId) : null;
      return { label: lootEntryLabel(entry), ownerName: owner ? owner.name : null };
    });
  }

  function lootAssignmentsMarkup(items) {
    if (!items || !items.length) return "";
    return `<div class="fa-loot-assignment"><strong>🎁 LOOT DELLO SCONTRO</strong>${items.map((x) => `<span>${escapeHtml(x.label)}${x.ownerName ? ` → <b>${escapeHtml(x.ownerName)}</b>` : ""}</span>`).join("")}</div>`;
  }

  function submitTeamAttack(rerollsByPlayer) {
    const outcome = director.submitTeamAttackRolls(game.state, game.dir, attackFlow.teamRolls, rerollsByPlayer || null);
    if (outcome.status === "needs-reroll") {
      attackFlow.teamPendingRerolls = outcome.pending;
      attackFlow.teamRerolls = Object.fromEntries(outcome.pending.map((p) => [p.playerId, new Array(p.rerollIndices.length).fill(null)]));
      attackFlow.step = "team-reroll";
      render();
      return;
    }
    const enemy = loop.getEnemy(game.state, outcome.enemyId);
    pendingResult = {
      actorType: "team",
      targetName: enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico",
      contributions: outcome.contributions,
      total: outcome.total,
      hpBefore: outcome.hpBefore, hpAfter: outcome.hpAfter, maxHp: enemy ? enemy.maxHp : outcome.hpBefore,
      shieldBefore: outcome.shieldBefore, shieldAfter: outcome.shieldAfter, maxShield: enemy ? enemy.maxShield : outcome.shieldBefore,
      eliminated: outcome.eliminated,
      lootAssignments: flattenLootAssignments(outcome.lootFound)
    };
    attackFlow = null;
    render();
  }

  /* =========================================================================
     ATTACCO A DADI FISICI — scegli bersaglio → scegli arma → anteprima pura
     → "TIRA N DADI FISICI" → inserimento risultati → eventuale ritiro fisico
     (rerollOnes) → risultato dal motore, mai ricalcolato qui.
     ========================================================================= */
  function buildAttackFlowMarkup() {
    const state = game.state, dir = game.dir;
    const player = director.getCurrentPlayer(state, dir);

    if (attackFlow.step === "team-select") return buildTeamSelectMarkup(player);
    if (attackFlow.step === "team-roll") return buildTeamRollMarkup();
    if (attackFlow.step === "team-reroll") return buildTeamRerollMarkup();

    if (attackFlow.step === "target") {
      const weapon = attackFlow.weapon;
      const targets = getAttackTargets(state, player);
      const cards = targets.map((t) => {
        const label = t.kind === "boss" ? "👑 BOSS" : `👾 ${escapeHtml(t.name || ENEMY_NAME[t.archetype] || t.archetype)}`;
        const preview = t.kind === "boss"
          ? director.buildBossAttackPreview(state, player.id, weapon)
          : director.buildAttackPreview(state, player.id, t.id, weapon);
        const diceWord = preview.diceCount === 1 ? "DADO" : "DADI";
        return `<button type="button" class="fa-target-card ${t.kind === "boss" ? "is-boss" : ""} dice-${preview.diceCount}" data-target-kind="${t.kind}"${t.id ? ` data-target-id="${t.id}"` : ""}>
          <span class="fa-target-card-name">${label}</span>
          ${t.kind === "enemy" ? `<small class="fa-target-card-type">${escapeHtml(ENEMY_NAME[t.archetype] || t.archetype)}</small>` : ""}
          <span class="fa-target-card-stats">
            <span>❤️ ${t.hp}/${t.maxHp}</span>
            ${t.maxShield ? `<span>🛡️ ${t.shield}/${t.maxShield}</span>` : ""}
            <span class="fa-target-card-range">📏 ${RANGE_LABELS[preview.encounterRange].toUpperCase()}</span>
            <strong class="fa-target-card-dice">🎲 ${preview.diceCount} ${diceWord}</strong>
          </span>
        </button>`;
      }).join("");
      const canChangeWeapon = ["primary", "secondary"].filter((slot) => player.equipment[slot]).length > 1;
      return `<h2>CHI VUOI ATTACCARE?</h2>
        <div class="fa-selected-weapon">
          <span class="fa-selected-weapon-img">${imgTag(weapon.image, weapon.name)}</span>
          <span><small>ARMA SCELTA</small><strong>${escapeHtml(weapon.name)}</strong><em>📏 GITTATA ${RANGE_LABELS[weapon.range].toUpperCase()} · 🎲 ${weapon.baseDice} base</em></span>
        </div>
        <p class="fa-target-help">La distanza cambia quanti dadi tirerai. Scegli il bersaglio guardando il numero di dadi.</p>
        <div class="fa-target-cards">${cards}</div>
        ${canChangeWeapon ? `<button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-change-weapon">↔ CAMBIA ARMA</button>` : ""}
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
            <span class="fa-weapon-card-stats">📏 ${RANGE_LABELS[w.range].toUpperCase()} · 🎲 ${w.baseDice} base · POWER +${w.power} · POTENZA ${w.potenza}</span>
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
      ${attackFlow.targetKind === "enemy" && eligibleTeamCompanions(state, player).length ? `<button type="button" class="fa-btn fa-btn-primary" id="fa-team-start">🤝 ATTACCA INSIEME</button><button type="button" class="fa-btn fa-btn-ghost" id="fa-attack-roll">ATTACCA DA SOLO · TIRA ${preview.diceCount} ${diceWord}</button>` : `<button type="button" class="fa-btn fa-btn-primary" id="fa-attack-roll">TIRA ${preview.diceCount} ${diceWord}</button>`}
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
    if (awaitingRoll.actorType === "enemy" || awaitingRoll.actorType === "enemy-pre-reaction") {
      const enemy = loop.getEnemy(game.state, awaitingRoll.actorId);
      const target = loop.getPlayer(game.state, awaitingRoll.targetId);
      const enemyName = enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico";
      return `${escapeHtml(enemyName).toUpperCase()} ATTACCA ${escapeHtml(target.name).toUpperCase()} · TIRA I DADI DEL NEMICO`;
    }
    if (awaitingRoll.actorType === "reaction") {
      const target = loop.getPlayer(game.state, awaitingRoll.actorId);
      const reaction = game.dir.pendingReaction && game.dir.pendingReaction.reactionType;
      const label = reaction === "defend" ? "DIFENDITI" : reaction === "dodge" ? "SCHIVA" : "RITIRATI";
      return `${escapeHtml(target.name).toUpperCase()} · ${label} · TIRA 1 D6`;
    }
    if (awaitingRoll.actorType === "counter") {
      const target = loop.getPlayer(game.state, awaitingRoll.actorId);
      return `${escapeHtml(target.name).toUpperCase()} · CONTRATTACCA`;
    }
    if (awaitingRoll.actorType === "structure") {
      return `🏢 ${escapeHtml(awaitingRoll.prepared.structureName.toUpperCase())} ATTACCA ${escapeHtml(String(awaitingRoll.prepared.targetName).toUpperCase())} · TIRA ${awaitingRoll.diceCount} D6`;
    }
    if (awaitingRoll.actorType === "structure-attack") {
      const p = loop.getPlayer(game.state, awaitingRoll.actorId);
      const z = loop.getZone(game.state, awaitingRoll.zoneId);
      const st = z && z.operationalStructure;
      return `💥 ${p ? escapeHtml(p.name.toUpperCase()) : "GIOCATORE"} DEMOLISCE ${st ? escapeHtml(st.name.toUpperCase()) : "STRUTTURA"} · TIRA ${awaitingRoll.diceCount} D6`;
    }
    if (awaitingRoll.actorType === "vehicle") {
      const zone = loop.getZone(game.state, awaitingRoll.zoneId);
      const visit = zone && zone.vehicleVisit;
      const crew = visit && visit.crew;
      const pilot = crew ? loop.getPlayer(game.state, crew.pilotId) : null;
      const g1 = crew ? loop.getPlayer(game.state, crew.gunnerIds[0]) : null;
      const g2 = crew ? loop.getPlayer(game.state, crew.gunnerIds[1]) : null;
      return `🚛 ${visit && visit.vehicle ? escapeHtml(visit.vehicle.name.toUpperCase()) : "MEZZO PESANTE"} · 3 D6: ${pilot ? escapeHtml(pilot.name) : "Pilota"} PILOTA · ${g1 ? escapeHtml(g1.name) : "Tiratore 1"} · ${g2 ? escapeHtml(g2.name) : "Tiratore 2"}`;
    }
    if (awaitingRoll.actorType === "boss") {
      const target = loop.getPlayer(game.state, awaitingRoll.targetId);
      return `Il Boss attacca ${escapeHtml(target.name)}`;
    }
    return "Attacco";
  }

  function snapshotTarget(aw) {
    if (aw.targetKind === "boss") return { hp: game.state.boss.hp, maxHp: game.state.boss.maxHp, shield: game.state.boss.shield, maxShield: game.state.boss.maxShield };
    const enemy = loop.getEnemy(game.state, aw.targetId);
    return { hp: enemy.hp, maxHp: enemy.maxHp, shield: enemy.shield, maxShield: enemy.maxShield };
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
    if (outcome.status === "awaiting-reaction-roll" || outcome.status === "awaiting-counter-roll") {
      diceSelections = null;
      render();
      return;
    }
    pendingResult = buildPendingResult(outcome, aw, preSnapshot);
    diceSelections = null;
    render();
  }

  function buildPendingResult(outcome, aw, preSnapshot) {
    const state = game.state;
    if (aw.actorType === "structure") {
      return Object.assign({actorType:"structure"},outcome);
    }
    if (aw.actorType === "structure-attack") {
      const zone = loop.getZone(state, aw.zoneId); const structure = zone && zone.operationalStructure; const player = loop.getPlayer(state, aw.actorId);
      return { actorType:"structure-attack", attackerName:player ? player.name : "Giocatore", weaponName:aw.weapon ? aw.weapon.name : "Arma", rolls:aw.rolls || [], damage:outcome.damage, demolitionBonus:outcome.demolitionBonus, structureName:structure ? structure.name : "Struttura", structureHp:outcome.structureHp, structureMaxHp:structure ? structure.maxHp : 0, structureDestroyed:outcome.structureDestroyed };
    }
    if (aw.actorType === "vehicle") {
      const zone = loop.getZone(state, aw.zoneId);
      const vehicle = zone && zone.vehicleVisit && zone.vehicleVisit.vehicle;
      return { actorType:"vehicle", vehicleName: vehicle ? vehicle.name : "Mezzo pesante", pilotRoll:outcome.pilotRoll, gunnerRolls:outcome.gunnerRolls, gunDamages:outcome.gunDamages || [], aimBonus:outcome.aimBonus, integrityDamage:outcome.integrityDamage, vehicleIntegrity:outcome.vehicleIntegrity, vehicleMaxIntegrity:outcome.vehicleMaxIntegrity || (vehicle ? vehicle.maxIntegrity : 0), targetResults:outcome.targetResults || [], lootFound:outcome.lootFound || [] };
    }
    if (aw.actorType === "reaction") {
      const enemy = loop.getEnemy(state, outcome.enemyId);
      const target = loop.getPlayer(state, outcome.targetId);
      return {
        actorType: "reaction",
        attackerName: enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico",
        targetName: target ? target.name : "Giocatore",
        reactionType: outcome.reaction.type,
        reactionRoll: outcome.reaction.roll,
        incomingDamage: outcome.enemyResult.total,
        damageTaken: outcome.reaction.damageTaken,
        hpBefore: outcome.hpBefore, hpAfter: outcome.hpAfter, maxHp: PLAYER_MAX_STAT,
        shieldBefore: outcome.shieldBefore, shieldAfter: outcome.shieldAfter, maxShield: PLAYER_MAX_STAT,
        fallen: outcome.statusAfter === "ko",
        fallenLabel: target ? `${target.name.toUpperCase()} È A TERRA` : "GIOCATORE A TERRA"
      };
    }
    if (aw.actorType === "counter") {
      const enemy = loop.getEnemy(state, outcome.enemyId);
      const target = loop.getPlayer(state, outcome.targetId);
      return {
        actorType: "counter",
        attackerName: target ? target.name : "Giocatore",
        targetName: enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico",
        enemyResult: outcome.enemyResult,
        counterResult: outcome.counterResult,
        playerHpBefore: outcome.playerHpBefore, playerHpAfter: outcome.playerHpAfter,
        playerShieldBefore: outcome.playerShieldBefore, playerShieldAfter: outcome.playerShieldAfter,
        enemyHpBefore: outcome.enemyHpBefore, enemyHpAfter: outcome.enemyHpAfter,
        enemyShieldBefore: outcome.enemyShieldBefore, enemyShieldAfter: outcome.enemyShieldAfter,
        enemyMaxHp: enemy ? enemy.maxHp : 0, enemyMaxShield: enemy ? enemy.maxShield : 0,
        enemyEliminated: outcome.enemyEliminated,
        playerFallen: outcome.playerStatusAfter === "ko",
        lootAssignments: flattenLootAssignments(outcome.lootFound)
      };
    }
    if (aw.actorType === "player") {
      const attacker = loop.getPlayer(state, aw.actorId);
      const weapon = aw.prepared.weapon;
      const after = snapshotTargetAfter(aw);
      const enemy = aw.targetKind === "boss" ? null : loop.getEnemy(state, aw.targetId);
      const targetName = aw.targetKind === "boss" ? "Boss" : (enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico");
      return {
        actorType: "player",
        attackerName: attacker ? attacker.name : "Giocatore",
        targetName,
        weaponPower: weapon.power,
        result: outcome.result,
        hpBefore: preSnapshot.hp, hpAfter: after.hp, maxHp: preSnapshot.maxHp,
        shieldBefore: preSnapshot.shield, shieldAfter: after.shield, maxShield: preSnapshot.maxShield,
        fallen: aw.targetKind === "boss" ? outcome.defeated : outcome.eliminated,
        fallenLabel: aw.targetKind === "boss" ? "👑 BOSS SCONFITTO" : "NEMICO ELIMINATO",
        lootAssignments: flattenLootAssignments(outcome.lootFound)
      };
    }
    const target = loop.getPlayer(state, outcome.targetId);
    const enemy = aw.actorType === "enemy" ? loop.getEnemy(state, aw.actorId) : null;
    return {
      actorType: aw.actorType,
      attackerName: aw.actorType === "boss" ? "Boss" : (enemy ? (enemy.name || ENEMY_NAME[enemy.archetype] || "Nemico") : "Nemico"),
      targetName: target.name,
      weaponPower: aw.prepared.weapon.power,
      result: outcome.result,
      hpBefore: outcome.hpBefore, hpAfter: outcome.hpAfter, maxHp: PLAYER_MAX_STAT,
      shieldBefore: outcome.shieldBefore, shieldAfter: outcome.shieldAfter, maxShield: PLAYER_MAX_STAT,
      fallen: outcome.statusBefore !== "ko" && outcome.statusAfter === "ko",
      fallenLabel: `${target.name.toUpperCase()} È A TERRA`
    };
  }

  function snapshotTargetAfter(aw) {
    if (aw.targetKind === "boss") return { hp: game.state.boss.hp, maxHp: game.state.boss.maxHp, shield: game.state.boss.shield, maxShield: game.state.boss.maxShield };
    const enemy = loop.getEnemy(game.state, aw.targetId);
    return { hp: enemy.hp, maxHp: enemy.maxHp, shield: enemy.shield, maxShield: enemy.maxShield };
  }

  function buildResultMarkup(r) {
    if (r.actorType === "structure") {
      const remain = r.targetKind==="vehicle" ? `🚛 ${r.integrityAfter}/${r.maxIntegrity}` : `❤️ ${r.hpAfter}/${PLAYER_MAX_STAT} · 🛡️ ${r.shieldAfter}/${PLAYER_MAX_STAT}`;
      return `<h2 class="fa-result-heading">🏢 ${escapeHtml(r.structureName).toUpperCase()} APRE IL FUOCO</h2><div class="fa-result-roll-block"><div class="fa-result-line">🎲 ${r.rolls.join(" + ")} + ${r.power}</div></div><div class="fa-result-total is-incoming">💥 ${r.total} DANNI A ${escapeHtml(r.targetName).toUpperCase()}</div><div class="fa-result-remaining is-incoming"><strong>${remain}</strong></div>${r.destroyed ? `<div class="fa-ko-banner"><strong>🚛 MEZZO DISTRUTTO</strong></div>` : ""}<button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>`;
    }
    if (r.actorType === "structure-attack") {
      return `<h2 class="fa-result-heading">💥 DEMOLIZIONE</h2><div class="fa-team-result-row"><strong>${escapeHtml(r.attackerName)}</strong><span>${escapeHtml(r.weaponName)} · bonus demolizione +${r.demolitionBonus}</span></div><div class="fa-result-total is-outgoing">💥 ${r.damage} DANNI ALLA STRUTTURA</div><div class="fa-result-remaining is-outgoing"><small>${escapeHtml(r.structureName).toUpperCase()}</small><strong>🏢 ${r.structureHp}/${r.structureMaxHp}</strong></div>${r.structureDestroyed ? `<div class="fa-ko-banner"><strong>🏢 STRUTTURA DISTRUTTA</strong></div>` : ""}<button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>`;
    }
    if (r.actorType === "vehicle") {
      const targetRows = (r.targetResults || []).map((t) => {
        if (t.kind === "structure") return `<div class="fa-team-result-row"><strong>🏢 ${escapeHtml(t.name)}</strong><span>💥 ${t.damage} · ❤️ ${t.hp}/${t.maxHp}${t.demolitionBonus ? ` · DEM +${t.demolitionBonus}` : ""}${t.destroyed ? " · DISTRUTTA" : ""}</span></div>`;
        return `<div class="fa-team-result-row"><strong>👾 ${escapeHtml(t.name)}</strong><span>💥 ${t.damage} · ❤️ ${t.hp}/${t.maxHp}${t.shield ? ` · 🛡️ ${t.shield}/${t.maxShield}` : ""}${t.eliminated ? " · ELIMINATO" : ""}</span></div>`;
      }).join("");
      return `<h2 class="fa-result-heading">🚛 ${escapeHtml(r.vehicleName).toUpperCase()}</h2>
        <div class="fa-team-result-row"><strong>PILOTA</strong><span>🎲 ${r.pilotRoll}${r.aimBonus ? ` · MIRA +${r.aimBonus}` : ""}${r.integrityDamage ? ` · 🔧 -${r.integrityDamage}` : ""}</span></div>
        <div class="fa-team-result-row"><strong>TIRATORE 1</strong><span>🎲 ${r.gunnerRolls[0]} · 💥 ${r.gunDamages[0] || 0}</span></div>
        <div class="fa-team-result-row"><strong>TIRATORE 2</strong><span>🎲 ${r.gunnerRolls[1]} · 💥 ${r.gunDamages[1] || 0}</span></div>
        <div class="fa-team-result-list">${targetRows}</div>
        <div class="fa-result-remaining is-outgoing"><strong>🚛 ${r.vehicleIntegrity}/${r.vehicleMaxIntegrity}</strong></div>
        <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>`;
    }

    if (r.actorType === "team") {
      return `<h2 class="fa-result-heading">🤝 ATTACCO DI SQUADRA</h2>
        <div class="fa-team-result-list">${r.contributions.map((c) => `<div class="fa-team-result-row"><strong>${escapeHtml(c.playerName)}</strong><span>🎲 ${c.rolls.join(" + ")} + POWER ${c.power} = <b>${c.total}</b></span><small>${escapeHtml(c.weaponName)}</small></div>`).join("")}</div>
        <div class="fa-result-total is-outgoing">TOTALE SQUADRA: ${r.total}</div>
        <div class="fa-result-remaining is-outgoing"><small>${escapeHtml(r.targetName).toUpperCase()} ORA HA</small><strong>❤️ ${r.hpAfter}/${r.maxHp}</strong><span>🛡️ ${r.shieldAfter}/${r.maxShield}</span></div>
        ${r.eliminated ? `<div class="fa-ko-banner"><strong>${escapeHtml(r.targetName).toUpperCase()} ELIMINATO</strong></div>` : ""}
        ${lootAssignmentsMarkup(r.lootAssignments)}
        <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>`;
    }
    if (r.actorType === "reaction") {
      const reactionLabel = r.reactionType === "defend" ? "🛡️ DIFESA" : r.reactionType === "dodge" ? "💨 SCHIVATA" : "🏃 RITIRATA";
      const avoided = Math.max(0, r.incomingDamage - r.damageTaken);
      return `
        <h2 class="fa-result-heading">${escapeHtml(r.attackerName).toUpperCase()} ATTACCA ${escapeHtml(r.targetName).toUpperCase()}</h2>
        <div class="fa-result-roll-block">
          <div class="fa-result-roll-label">${reactionLabel}</div>
          <div class="fa-result-line">🎲 ${r.reactionRoll}</div>
          <div class="fa-result-power">Danno potenziale ${r.incomingDamage} · evitato ${avoided}</div>
        </div>
        <div class="fa-result-total is-incoming">${r.damageTaken === 0 ? "✨ 0 DANNI" : `💥 SUBISCI ${r.damageTaken} DANNI`}</div>
        <div class="fa-result-remaining is-incoming"><small>TI RESTANO</small><strong>❤️ ${r.hpAfter}/${r.maxHp}</strong><span>🛡️ ${r.shieldAfter}/${r.maxShield}</span></div>
        <div class="fa-result-stat"><span>❤️ Salute ${escapeHtml(r.targetName)}</span><strong>${r.hpBefore} → ${r.hpAfter}</strong></div>
        ${r.fallen ? `<div class="fa-ko-banner"><strong>${r.fallenLabel}</strong></div>` : ""}
        <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>`;
    }
    if (r.actorType === "counter") {
      return `
        <h2 class="fa-result-heading">⚔️ CONTRATTACCO SIMULTANEO</h2>
        <div class="fa-team-result-row"><strong>${escapeHtml(r.attackerName)}</strong><span>🎲 ${r.counterResult.rolls.join(" + ")} · 💥 ${r.counterResult.total}</span></div>
        <div class="fa-team-result-row"><strong>${escapeHtml(r.targetName)}</strong><span>🎲 ${r.enemyResult.rolls.join(" + ")} · 💥 ${r.enemyResult.total}</span></div>
        <div class="fa-result-remaining is-outgoing"><small>${escapeHtml(r.targetName).toUpperCase()} ORA HA</small><strong>❤️ ${r.enemyHpAfter}/${r.enemyMaxHp}</strong><span>🛡️ ${r.enemyShieldAfter}/${r.enemyMaxShield}</span></div>
        <div class="fa-result-remaining is-incoming"><small>${escapeHtml(r.attackerName).toUpperCase()} ORA HA</small><strong>❤️ ${r.playerHpAfter}/${PLAYER_MAX_STAT}</strong><span>🛡️ ${r.playerShieldAfter}/${PLAYER_MAX_STAT}</span></div>
        ${r.enemyEliminated ? `<div class="fa-ko-banner"><strong>${escapeHtml(r.targetName).toUpperCase()} ELIMINATO</strong></div>` : ""}
        ${r.playerFallen ? `<div class="fa-ko-banner"><strong>${escapeHtml(r.attackerName).toUpperCase()} È A TERRA</strong></div>` : ""}
        ${lootAssignmentsMarkup(r.lootAssignments)}
        <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>`;
    }
    const rolls = r.result.rolls;
    const tags = [];
    if (rolls.some((v) => v === 12)) tags.push("CRITICO");
    if (r.result.ignoreShieldN) tags.push(`${r.result.ignoreShieldN} DANNI HANNO IGNORATO LO SCUDO`);
    if (r.result.secondaryHits && r.result.secondaryHits.length) tags.push("COLPO AD AREA");
    if (r.result.appliesSuppressMarker) tags.push("BERSAGLIO MARCHIATO");

    const view = buildCombatResultView({
      actorType: r.actorType,
      attackerName: r.attackerName,
      targetName: r.targetName,
      total: r.result.total,
      shieldBefore: r.shieldBefore,
      shieldAfter: r.shieldAfter,
      ignoreShieldN: r.result.ignoreShieldN || 0
    });
    const directionClass = r.actorType === "player" ? "is-outgoing" : "is-incoming";

    return `
      <h2 class="fa-result-heading">${escapeHtml(view.heading)}</h2>
      <div class="fa-result-roll-block">
        <div class="fa-result-roll-label">🎲 ${escapeHtml(view.rollLabel)}</div>
        <div class="fa-result-line">${rolls.join(" + ")}</div>
        <div class="fa-result-power">${escapeHtml(view.powerLabel)} +${r.weaponPower}</div>
      </div>
      <div class="fa-result-total ${directionClass}">💥 ${escapeHtml(view.damageLabel)}</div>
      <div class="fa-result-remaining ${directionClass}">
        <small>${r.actorType === "player" ? `${escapeHtml(r.targetName).toUpperCase()} ORA HA` : "TI RESTANO"}</small>
        <strong>❤️ ${r.hpAfter}/${r.maxHp || PLAYER_MAX_STAT}</strong>
        <span>🛡️ ${r.shieldAfter}/${r.maxShield || PLAYER_MAX_STAT}</span>
      </div>
      ${view.showShield ? `<div class="fa-result-stat"><span>${escapeHtml(view.shieldLabel)}</span><strong>${r.shieldBefore} → ${r.shieldAfter}</strong></div>` : ""}
      <div class="fa-result-stat"><span>${escapeHtml(view.healthLabel)}</span><strong>${r.hpBefore} → ${r.hpAfter}</strong></div>
      ${tags.length ? `<div class="fa-result-tags">${tags.map((t) => `<span class="fa-result-tag">${t}</span>`).join("")}</div>` : ""}
      ${r.fallen ? `<div class="fa-ko-banner"><strong>${r.fallenLabel}</strong></div>` : ""}
      ${lootAssignmentsMarkup(r.lootAssignments)}
      <button type="button" class="fa-btn fa-btn-primary" id="fa-attack-continue">CONTINUA</button>
    `;
  }

  function buildLaunchMarkup() {
    if (!launchFlow) return "";
    const player = loop.getPlayer(game.state, launchFlow.playerId);
    const zone = loop.getZone(game.state, launchFlow.zoneId);
    const bonus = Math.max(0, Number(player.launchKitBonus) || 0);
    return `
      <h2>🚀 LANCIO VERSO ${escapeHtml(zone.name.toUpperCase())}</h2>
      <p><strong>${escapeHtml(player.name)}</strong> deve tirare 1 D6 fisico.</p>
      <div class="fa-launch-outcomes">
        <div><strong>1–2</strong><span>ATTERRAGGIO DISASTROSO · −4 HP</span></div>
        <div><strong>3–4</strong><span>ATTERRAGGIO OSTILE · −2 HP</span></div>
        <div><strong>5–6</strong><span>ATTERRAGGIO PERFETTO · 0 HP</span></div>
      </div>
      ${bonus ? `<p class="fa-launch-bonus">KIT DI LANCIO: +${bonus} al risultato</p>` : ""}
      <div class="fa-dice-row fa-launch-roll-grid" aria-label="Risultato del dado di lancio">
        ${[1,2,3,4,5,6].map((v) => `<button type="button" class="fa-dice-btn fa-launch-roll-btn" data-launch-roll="${v}">${v}</button>`).join("")}
      </div>
      <p class="fa-modal-note">Il danno da atterraggio colpisce direttamente gli HP e non consuma lo Scudo.</p>
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-launch-cancel">ANNULLA</button>`;
  }

  function renderLaunchOverlay() {
    const overlay = $("fa-launch-overlay");
    if (!launchFlow) { overlay.hidden = true; return; }
    overlay.hidden = false;
    $("fa-launch-content").innerHTML = buildLaunchMarkup();
  }

  function bindLaunchEvents() {
    $("fa-launch-overlay").addEventListener("click", (ev) => {
      const rollBtn = ev.target.closest("[data-launch-roll]");
      if (rollBtn) { resolveLaunchFlow(Number(rollBtn.dataset.launchRoll)); return; }
      if (ev.target.id === "fa-launch-cancel") { launchFlow = null; render(); }
    });
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
      const player = director.getCurrentPlayer(game.state, game.dir);
      const inHub = player && shouldUseActionHub({ magnifyMode, nodeId: player.nodeId, directorPhase: game.dir.directorPhase, moveMode, scannerMode });
      if (!inHub) {
        overlay.hidden = false;
        $("fa-attack-content").innerHTML = buildAttackFlowMarkup();
        return;
      }
    }
    overlay.hidden = true;
  }

  function handleAttackChoiceEvent(ev) {
    const targetBtn = ev.target.closest("[data-target-kind]");
    if (targetBtn && attackFlow) {
      attackFlow.targetKind = targetBtn.dataset.targetKind;
      attackFlow.targetId = targetBtn.dataset.targetId || null;
      attackFlow.step = attackFlow.teamAutoStart && attackFlow.targetKind === "enemy" ? "team-select" : "preview";
      attackFlow.teamAutoStart = false;
      render();
      return true;
    }
    const weaponBtn = ev.target.closest("[data-weapon-slot]");
    if (weaponBtn && attackFlow) {
      const player = director.getCurrentPlayer(game.state, game.dir);
      actionHubWeaponSlot = weaponBtn.dataset.weaponSlot;
      attackFlow.weaponSlot = actionHubWeaponSlot;
      attackFlow.weapon = player.equipment[actionHubWeaponSlot];
      const targets = getAttackTargets(game.state, player);
      const autoTarget = pickAutoTarget(targets);
      if (autoTarget) {
        attackFlow.targetKind = autoTarget.kind;
        attackFlow.targetId = autoTarget.id || null;
        attackFlow.step = "preview";
      } else {
        attackFlow.targetKind = null;
        attackFlow.targetId = null;
        attackFlow.step = "target";
      }
      render();
      return true;
    }
    const teamWeaponBtn = ev.target.closest("[data-team-weapon-player]");
    if (teamWeaponBtn && attackFlow && attackFlow.step === "team-select") {
      attackFlow.teamWeaponSlots = attackFlow.teamWeaponSlots || {};
      attackFlow.teamWeaponSlots[teamWeaponBtn.dataset.teamWeaponPlayer] = teamWeaponBtn.dataset.teamWeaponSlot;
      render();
      return true;
    }
    const teamMemberBtn = ev.target.closest("[data-team-member]");
    if (teamMemberBtn && attackFlow && attackFlow.step === "team-select") {
      const id = teamMemberBtn.dataset.teamMember;
      const ids = new Set(attackFlow.teamParticipantIds || []);
      if (ids.has(id)) ids.delete(id); else if (ids.size < 2) ids.add(id);
      attackFlow.teamParticipantIds = Array.from(ids);
      render();
      return true;
    }
    const teamDieBtn = ev.target.closest("[data-team-die-player]");
    if (teamDieBtn && attackFlow && attackFlow.step === "team-roll") {
      const pid = teamDieBtn.dataset.teamDiePlayer;
      const idx = Number(teamDieBtn.dataset.teamDie);
      attackFlow.teamRolls[pid][idx] = Number(teamDieBtn.dataset.value);
      render();
      return true;
    }
    if (ev.target.id === "fa-team-start") {
      attackFlow.step = "team-select";
      attackFlow.teamParticipantIds = [];
      attackFlow.teamWeaponSlots = {};
      render();
      return true;
    }
    if (ev.target.id === "fa-team-back") { attackFlow.step = "preview"; attackFlow.teamParticipantIds = []; render(); return true; }
    if (ev.target.id === "fa-team-confirm") { startTeamAttack(); return true; }
    if (ev.target.id === "fa-team-submit") { submitTeamAttack(); return true; }
    const teamRerollBtn = ev.target.closest("[data-team-reroll-player]");
    if (teamRerollBtn && attackFlow && attackFlow.step === "team-reroll") {
      const pid = teamRerollBtn.dataset.teamRerollPlayer;
      const idx = Number(teamRerollBtn.dataset.teamReroll);
      attackFlow.teamRerolls[pid][idx] = Number(teamRerollBtn.dataset.value);
      render();
      return true;
    }
    if (ev.target.id === "fa-team-reroll-submit") { submitTeamAttack(attackFlow.teamRerolls); return true; }
    if (ev.target.id === "fa-attack-change-weapon") {
      attackFlow = { step: "weapon", weaponSlot: actionHubWeaponSlot };
      render();
      return true;
    }
    if (ev.target.id === "fa-attack-roll") { commitAttack(); return true; }
    if (ev.target.id === "fa-attack-cancel") { attackFlow = null; render(); return true; }
    return false;
  }

  function bindAttackOverlayEvents() {
    $("fa-attack-overlay").addEventListener("click", (ev) => {
      if (handleAttackChoiceEvent(ev)) return;

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
        // Se il nemico sopravvissuto deve ancora rispondere all'attacco del
        // giocatore, manteniamo l'attore finché la reazione non è conclusa.
        if (!game.dir.pendingReaction && attackActorId) { checkTurnTransition(attackActorId); attackActorId = null; }
        render();
      }
    });
  }


  /* =========================================================================
     NODE LAYOUT EDITOR V1
     Layout geografico separato dal gameplay: modifica solo coordinate,
     collegamenti e entry node. Tutti i contenuti dinamici restano al Director.
     ========================================================================= */
  const TACTICAL_ANCHOR_TYPES = [
    { key:"players", label:"GIOCATORE", icon:"👤" },
    { key:"enemies", label:"NEMICO", icon:"👾" },
    { key:"vehicle", label:"MEZZO", icon:"🚙" },
    { key:"structure", label:"STRUTTURA", icon:"🏚️" },
    { key:"chest", label:"CASSA", icon:"🎁" },
    { key:"loot", label:"LOOT", icon:"✨" },
    { key:"shelter", label:"RIPARO", icon:"🛖" },
    { key:"trap", label:"TRAPPOLA", icon:"🪤" },
    { key:"boost", label:"BOOST", icon:"⚡" }
  ];
  const runtimeTacticalAssignments = new Map();

  function emptyTacticalAnchorLayout(zoneId) { return { version:2, zoneId, nodes:{} }; }

  function normalizeTacticalLayout(layout, zoneId) {
    const source = layout && typeof layout === "object" ? layout : emptyTacticalAnchorLayout(zoneId);
    const out = emptyTacticalAnchorLayout(source.zoneId || zoneId);
    Object.entries(source.nodes || {}).forEach(([nodeId, bucket]) => {
      const normalized = normalizeTacticalNodeSlots(nodeId, bucket);
      if (Object.keys(normalized).length) out.nodes[nodeId] = normalized;
    });
    return out;
  }

  function readStoredTacticalAnchors() {
    try {
      const raw = localStorage.getItem(TACTICAL_ANCHOR_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !parsed.layouts || typeof parsed.layouts !== "object") return {};
      const out = {};
      Object.entries(parsed.layouts).forEach(([zoneId, layout]) => { out[zoneId] = normalizeTacticalLayout(layout, zoneId); });
      return out;
    } catch (e) { return {}; }
  }

  function officialTacticalAnchorsForZone(zoneId) {
    const config = officialZoneConfig(zoneId);
    return tacticalLayoutFromPortableConfig(config) || emptyTacticalAnchorLayout(zoneId);
  }

  function tacticalAnchorsForZone(zoneId) {
    const all = readStoredTacticalAnchors();
    const hasSaved = Object.prototype.hasOwnProperty.call(all, zoneId);
    const source = hasSaved ? all[zoneId] : officialTacticalAnchorsForZone(zoneId);
    return JSON.parse(JSON.stringify(source || emptyTacticalAnchorLayout(zoneId)));
  }

  function storeTacticalAnchors(layout) {
    const all = readStoredTacticalAnchors();
    const normalized = normalizeTacticalLayout(layout, layout.zoneId);
    all[normalized.zoneId] = JSON.parse(JSON.stringify(normalized));
    localStorage.setItem(TACTICAL_ANCHOR_STORAGE_KEY, JSON.stringify({ version:2, savedAt:new Date().toISOString(), layouts:all }));
  }

  function nodeAnchorBucket(nodeId, create = false) {
    if (!mapEditorState.anchorDraft) mapEditorState.anchorDraft = emptyTacticalAnchorLayout(mapEditorState.zoneId);
    if (!mapEditorState.anchorDraft.nodes[nodeId] && create) mapEditorState.anchorDraft.nodes[nodeId] = {};
    return mapEditorState.anchorDraft.nodes[nodeId] || null;
  }

  function tacticalTypeDef(key) { return TACTICAL_ANCHOR_TYPES.find((t) => t.key === key) || null; }

  function listNodeAnchors(nodeId) {
    const bucket = nodeAnchorBucket(nodeId, false) || {};
    const out = [];
    TACTICAL_ANCHOR_TYPES.forEach((def) => {
      (Array.isArray(bucket[def.key]) ? bucket[def.key] : []).forEach((slot, index) => out.push({ ...slot, type:def.key, index, def }));
    });
    return out;
  }

  function nextTacticalSlotOrdinal(nodeId, type) {
    const bucket = nodeAnchorBucket(nodeId, false) || {};
    const used = new Set((Array.isArray(bucket[type]) ? bucket[type] : []).map((s) => String(s.id || "")));
    let ordinal = 1;
    while (used.has(tacticalSlotId(nodeId, type, ordinal))) ordinal += 1;
    return ordinal;
  }

  function addTacticalAnchor(type) {
    const node = editorNode(mapEditorState.selectedNodeId);
    const def = tacticalTypeDef(type);
    if (!node || !def) throw new Error("Seleziona prima un nodo");
    const bucket = nodeAnchorBucket(node.id, true);
    if (!Array.isArray(bucket[type])) bucket[type] = [];
    const offsetSeed = listNodeAnchors(node.id).length;
    const ordinal = nextTacticalSlotOrdinal(node.id, type);
    const slot = {
      id:tacticalSlotId(node.id, type, ordinal),
      parentNodeId:node.id,
      type,
      x:Math.max(2,Math.min(98,Number(node.x) + ((offsetSeed % 3)-1)*4)),
      y:Math.max(2,Math.min(98,Number(node.y) + (Math.floor(offsetSeed/3)+1)*4))
    };
    bucket[type].push(slot);
    mapEditorState.selectedAnchor = { nodeId:node.id, type, slotId:slot.id };
    mapEditorState.dirty = true;
    mapEditorState.status = `${def.icon} ${def.label}: slot ${slot.id} aggiunto. Trascinalo nel punto esatto della scena.`;
  }

  function selectedTacticalSlot() {
    const sel = mapEditorState.selectedAnchor;
    if (!sel) return null;
    const bucket = nodeAnchorBucket(sel.nodeId, false);
    const arr = bucket && Array.isArray(bucket[sel.type]) ? bucket[sel.type] : [];
    return arr.find((slot) => String(slot.id) === String(sel.slotId)) || null;
  }

  function removeSelectedTacticalAnchor() {
    const sel = mapEditorState.selectedAnchor;
    if (!sel) throw new Error("Seleziona prima un punto tattico");
    const bucket = nodeAnchorBucket(sel.nodeId, false);
    const def = tacticalTypeDef(sel.type);
    if (!bucket || !def) return;
    const arr = Array.isArray(bucket[sel.type]) ? bucket[sel.type] : [];
    const index = arr.findIndex((slot) => String(slot.id) === String(sel.slotId));
    if (index >= 0) arr.splice(index,1);
    if (!arr.length) delete bucket[sel.type];
    mapEditorState.selectedAnchor = null;
    mapEditorState.dirty = true;
    mapEditorState.status = "Slot tattico rimosso.";
  }

  function runtimeAnchorLayout(zoneId) {
    const all = readStoredTacticalAnchors();
    if (Object.prototype.hasOwnProperty.call(all, zoneId)) return all[zoneId];
    const official = officialTacticalAnchorsForZone(zoneId);
    return official && Object.keys(official.nodes || {}).length ? official : null;
  }

  function runtimeNodeSlots(zoneId, nodeId, type) {
    const layout = runtimeAnchorLayout(zoneId);
    const bucket = layout && layout.nodes && layout.nodes[nodeId];
    return bucket && Array.isArray(bucket[type]) ? bucket[type] : [];
  }

  function runtimeNodeAnchor(zoneId, nodeId, type, index = 0) {
    return runtimeNodeSlots(zoneId, nodeId, type)[index] || null;
  }

  function runtimeEntityAnchors(zoneId, nodeId, type, entities) {
    const slots = runtimeNodeSlots(zoneId, nodeId, type);
    if (!slots.length || !entities || !entities.length) return new Map();
    const key = `${zoneId}|${nodeId}|${type}`;
    const previous = runtimeTacticalAssignments.get(key) || {};
    const next = assignTacticalSlots(entities, slots, previous);
    runtimeTacticalAssignments.set(key, next);
    const bySlotId = new Map(slots.map((slot) => [String(slot.id), slot]));
    return new Map(Object.entries(next).map(([entityId, slotId]) => [entityId, bySlotId.get(String(slotId))]).filter(([,slot]) => slot));
  }

  function anchoredMarkup(anchor, html, cls = "") {
    if (!anchor || !html) return "";
    return `<div class="fa-tactical-render-anchor ${cls}" data-tactical-slot-id="${escapeHtml(anchor.id || "")}" style="left:${Number(anchor.x)}%;top:${Number(anchor.y)}%">${html}</div>`;
  }

  function runtimeLayoutFromPortableConfig(config) {
    if (!config || !config.zoneId) throw new Error("Config ufficiale mancante");
    const layout = {
      version: 1,
      zoneId: String(config.zoneId),
      entryNodeId: config.entryNodeId || null,
      nodes: (config.nodes || []).map((n) => ({ id:String(n.id), x:Number(n.x), y:Number(n.y), connections:{} }))
    };
    portableConfigEdges(config).forEach(([a,b]) => zoneDirectorApi.toggleNodeConnection(layout, String(a), String(b)));
    return layout;
  }

  function applyOfficialZoneLayouts() {
    Object.keys(OFFICIAL_ZONE_LAYOUTS).forEach((zoneId) => {
      const zone = ZONES.find((z) => z.id === zoneId);
      if (!zone) return;
      try {
        const config = officialZoneConfig(zoneId);
        validatePortableMapConfig(config, zoneId);
        const layout = runtimeLayoutFromPortableConfig(config);
        zoneDirectorApi.applyNodeLayout(zone, layout);
        BASE_MAP_LAYOUTS[zoneId] = zoneDirectorApi.cloneNodeLayout(zone);
      } catch (e) {
        console.warn("[Fortress Army] Layout ufficiale ignorato", zoneId, e.message);
      }
    });
  }

  function readStoredMapLayouts() {
    try {
      const raw = localStorage.getItem(MAP_LAYOUT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && parsed.layouts && typeof parsed.layouts === "object" ? parsed.layouts : {};
    } catch (e) { return {}; }
  }

  function loadSavedMapLayouts() {
    const layouts = readStoredMapLayouts();
    Object.entries(layouts).forEach(([zoneId, layout]) => {
      const zone = ZONES.find((z) => z.id === zoneId);
      if (!zone) return;
      try { zoneDirectorApi.applyNodeLayout(zone, layout); } catch (e) { console.warn("[Fortress Army] Layout ignorato", zoneId, e.message); }
    });
  }

  function storeMapLayout(layout) {
    const layouts = readStoredMapLayouts();
    layouts[layout.zoneId] = JSON.parse(JSON.stringify(layout));
    localStorage.setItem(MAP_LAYOUT_STORAGE_KEY, JSON.stringify({ version:1, savedAt:new Date().toISOString(), layouts }));
  }

  function layoutEdges(nodes) {
    const seen = new Set(), edges = [];
    (nodes || []).forEach((n) => Object.values(n.connections || {}).forEach((targetId) => {
      if (!targetId || targetId === n.id) return;
      const pair = [String(n.id), String(targetId)].sort();
      const key = pair.join("|");
      if (seen.has(key)) return;
      seen.add(key);
      edges.push(pair);
    }));
    edges.sort((a,b) => `${a[0]}|${a[1]}`.localeCompare(`${b[0]}|${b[1]}`));
    return edges;
  }

  function portableConfigEdges(config) {
    if (Array.isArray(config && config.edges)) return config.edges.map((edge) => Array.isArray(edge) ? edge.slice(0,2) : edge);
    const seen = new Set(), edges = [];
    (config && config.nodes || []).forEach((n) => Object.values(n.connections || {}).forEach((targetId) => {
      if (!targetId || targetId === n.id) return;
      const pair = [String(n.id), String(targetId)].sort();
      const key = pair.join("|");
      if (seen.has(key)) return;
      seen.add(key);
      edges.push(pair);
    }));
    return edges;
  }

  function buildPortableMapConfig(layout) {
    if (!layout) throw new Error("Layout mancante");
    return {
      format: "fortress-army-zone-layout",
      version: 4,
      zoneId: layout.zoneId,
      entryNodeId: layout.entryNodeId || null,
      nodes: (layout.nodes || []).map((n) => ({
        id: n.id,
        x: Math.round(Number(n.x) * 100) / 100,
        y: Math.round(Number(n.y) * 100) / 100,
        ...((mapEditorState.anchorDraft && mapEditorState.anchorDraft.nodes && mapEditorState.anchorDraft.nodes[n.id]) ? { anchors: JSON.parse(JSON.stringify(mapEditorState.anchorDraft.nodes[n.id])) } : {})
      })),
      edges: layoutEdges(layout.nodes)
    };
  }

  function validatePortableMapConfig(config, expectedZoneId) {
    if (!config || typeof config !== "object") throw new Error("Config JSON non valida");
    if (config.format && config.format !== "fortress-army-zone-layout") throw new Error("Formato config non riconosciuto");
    if (!config.zoneId) throw new Error("zoneId mancante");
    if (expectedZoneId && config.zoneId !== expectedZoneId) throw new Error(`Questa config appartiene a ${config.zoneId}, non a ${expectedZoneId}`);
    if (!Array.isArray(config.nodes) || !config.nodes.length) throw new Error("La config non contiene nodi");
    const ids = new Set();
    config.nodes.forEach((n) => {
      if (!n || !n.id) throw new Error("Nodo senza id");
      if (ids.has(n.id)) throw new Error(`Nodo duplicato: ${n.id}`);
      ids.add(n.id);
      if (!Number.isFinite(Number(n.x)) || !Number.isFinite(Number(n.y))) throw new Error(`Coordinate non valide per ${n.id}`);
      if (Number(n.x) < 0 || Number(n.x) > 100 || Number(n.y) < 0 || Number(n.y) > 100) throw new Error(`Coordinate fuori mappa per ${n.id}`);
    });
    if (!config.entryNodeId || !ids.has(config.entryNodeId)) throw new Error("Entry node assente o non valido");

    const edgeKeys = new Set();
    portableConfigEdges(config).forEach((edge) => {
      if (!Array.isArray(edge) || edge.length !== 2) throw new Error("Edge non valido: servono esattamente due nodi");
      const a = String(edge[0] || ""), b = String(edge[1] || "");
      if (!ids.has(a) || !ids.has(b)) throw new Error(`Collegamento verso nodo inesistente: ${a} ↔ ${b}`);
      if (a === b) throw new Error(`Collegamento di un nodo con se stesso: ${a}`);
      const key = [a,b].sort().join("|");
      if (edgeKeys.has(key)) throw new Error(`Collegamento duplicato: ${a} ↔ ${b}`);
      edgeKeys.add(key);
    });
    return true;
  }

  function exportCurrentMapConfig() {
    const zone = editorZone();
    if (!zone || !mapEditorState.draft) throw new Error("Nessun layout da esportare");
    const config = buildPortableMapConfig(mapEditorState.draft);
    validatePortableMapConfig(config, zone.id);
    const blob = new Blob([JSON.stringify(config, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fortress-zone-layout-${zone.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    mapEditorState.status = `✓ ${zone.name}: config V4 esportata con collegamenti + slot tattici persistenti.`;
    renderMapEditor();
  }

  function importMapConfigObject(config) {
    const zone = editorZone();
    if (!zone) throw new Error("Zona editor mancante");
    validatePortableMapConfig(config, zone.id);
    const portable = {
      version: 1,
      zoneId: config.zoneId,
      entryNodeId: config.entryNodeId,
      nodes: config.nodes.map((n) => ({
        id: n.id,
        x: Number(n.x),
        y: Number(n.y),
        connections: {}
      }))
    };
    portableConfigEdges(config).forEach(([a,b]) => zoneDirectorApi.toggleNodeConnection(portable, String(a), String(b)));
    mapEditorState.anchorDraft = emptyTacticalAnchorLayout(config.zoneId);
    config.nodes.forEach((n) => {
      if (n.anchors && typeof n.anchors === "object") {
        const normalized = normalizeTacticalNodeSlots(n.id, n.anchors);
        if (Object.keys(normalized).length) mapEditorState.anchorDraft.nodes[n.id] = normalized;
      }
    });
    const probe = JSON.parse(JSON.stringify(zone));
    zoneDirectorApi.applyNodeLayout(probe, portable);
    mapEditorState.draft = portable;
    mapEditorState.selectedNodeId = null;
    mapEditorState.connectFromId = null;
    mapEditorState.connectMode = false;
    mapEditorState.dirty = true;
    mapEditorState.status = `✓ ${zone.name}: config importata. Controllala e premi Salva Layout.`;
    renderMapEditor();
  }

  function activeStateZone(zoneId) {
    return game && game.state && (game.state.zones || []).find((z) => z.id === zoneId);
  }

  function syncLayoutToActiveGame(zoneId) {
    const def = ZONES.find((z) => z.id === zoneId), live = activeStateZone(zoneId);
    if (!def || !live) return;
    live.nodes = JSON.parse(JSON.stringify(def.nodes || []));
    live.entryNodeId = def.entryNodeId || null;
  }

  function editorZone() { return ZONES.find((z) => z.id === mapEditorState.zoneId) || ZONES[0] || null; }
  function editorNode(id) { return mapEditorState.draft && mapEditorState.draft.nodes.find((n) => n.id === id); }
  function editorNodeLabel(node) {
    const m = String(node.id || "").match(/n(\d+)$/i);
    return m ? `N${Number(m[1])}` : String(node.id || "NODO").split("-").pop().toUpperCase();
  }

  function editorConnectionsMarkup() {
    const draft = mapEditorState.draft;
    if (!draft) return "";
    const byId = new Map((draft.nodes || []).map((n) => [n.id,n]));
    const seen = new Set(), lines = [];
    (draft.nodes || []).forEach((n) => Object.values(n.connections || {}).forEach((targetId) => {
      const t = byId.get(targetId); if (!t) return;
      const key = [n.id,targetId].sort().join("|"); if (seen.has(key)) return; seen.add(key);
      lines.push(`<line x1="${n.x}" y1="${n.y}" x2="${t.x}" y2="${t.y}" />`);
    }));
    return lines.join("");
  }

  function ensureTacticalEditorControls() {
    const board = $("fa-map-editor-board");
    if (!board || $("fa-map-editor-tacticalbar")) return;
    board.insertAdjacentHTML("beforebegin", `<div id="fa-map-editor-tacticalbar" class="fa-map-editor-tacticalbar">
      <button type="button" class="fa-btn fa-btn-ghost" id="fa-map-editor-tactical-toggle">🎯 PUNTI TATTICI</button>
      <div class="fa-tactical-anchor-tools" id="fa-tactical-anchor-tools" hidden></div>
    </div>`);
  }

  function renderTacticalEditorControls() {
    ensureTacticalEditorControls();
    const toggle = $("fa-map-editor-tactical-toggle"), tools = $("fa-tactical-anchor-tools");
    if (!toggle || !tools) return;
    toggle.classList.toggle("is-active", mapEditorState.tacticalMode);
    toggle.textContent = mapEditorState.tacticalMode ? "✓ PUNTI TATTICI" : "🎯 PUNTI TATTICI";
    tools.hidden = !mapEditorState.tacticalMode;
    if (!mapEditorState.tacticalMode) return;
    if (!mapEditorState.selectedNodeId) {
      tools.innerHTML = `<span class="fa-tactical-editor-hint">Seleziona uno dei nodi principali per piazzare i suoi elementi.</span>`;
      return;
    }
    const label = editorNodeLabel(editorNode(mapEditorState.selectedNodeId));
    tools.innerHTML = `<strong>${escapeHtml(label)}</strong>${TACTICAL_ANCHOR_TYPES.map((d)=>`<button type="button" class="fa-tactical-add-btn" data-add-tactical-anchor="${d.key}" title="Aggiungi ${d.label}">${d.icon} ${d.label} +</button>`).join("")}<button type="button" class="fa-tactical-remove-btn" id="fa-map-editor-anchor-remove" ${mapEditorState.selectedAnchor?"":"disabled"}>− RIMUOVI SELEZIONATO</button>`;
  }


  function editorTacticalParentLinesMarkup() {
    if (!mapEditorState.tacticalMode || !mapEditorState.selectedNodeId) return "";
    const parent = editorNode(mapEditorState.selectedNodeId);
    if (!parent) return "";
    return listNodeAnchors(parent.id).map((slot) => `<line class="fa-map-editor-slot-link" x1="${parent.x}" y1="${parent.y}" x2="${slot.x}" y2="${slot.y}" />`).join("");
  }

  function renderMapEditorBoard() {
    const board = $("fa-map-editor-board"), zone = editorZone(), draft = mapEditorState.draft;
    if (!board || !zone || !draft) return;
    if (!(draft.nodes || []).length) {
      board.style.backgroundImage = `url('${zone.image || ""}')`;
      board.innerHTML = `<div class="fa-map-editor-empty"><strong>${escapeHtml(zone.name)}</strong><span>Questa zona non ha ancora un Node Graph.</span><button type="button" class="fa-btn fa-btn-primary" id="fa-map-editor-create">CREA 5 NODI BASE</button></div>`;
      return;
    }
    board.style.backgroundImage = `url('${zone.image || ""}')`;
    const nodes = draft.nodes.map((n) => `<button type="button" class="fa-editor-node ${draft.entryNodeId===n.id?"is-entry":""} ${mapEditorState.selectedNodeId===n.id?"is-selected":""} ${mapEditorState.connectFromId===n.id?"is-connect-from":""}" data-editor-node="${escapeHtml(n.id)}" style="left:${n.x}%;top:${n.y}%" aria-label="${escapeHtml(editorNodeLabel(n))}"><i class="fa-editor-node-crosshair" aria-hidden="true"></i><span>${editorNodeLabel(n)}</span>${draft.entryNodeId===n.id?"<small>ENTRY</small>":""}</button>`).join("");
    let anchors = "";
    if (mapEditorState.tacticalMode && mapEditorState.selectedNodeId) {
      anchors = listNodeAnchors(mapEditorState.selectedNodeId).map((a) => {
        const selected = mapEditorState.selectedAnchor && mapEditorState.selectedAnchor.nodeId===mapEditorState.selectedNodeId && mapEditorState.selectedAnchor.type===a.type && String(mapEditorState.selectedAnchor.slotId)===String(a.id);
        const suffix = String(a.index+1);
        return `<button type="button" class="fa-editor-anchor ${selected?"is-selected":""}" data-editor-anchor-type="${a.type}" data-editor-anchor-id="${escapeHtml(a.id)}" style="left:${a.x}%;top:${a.y}%" title="${escapeHtml(a.def.label)} · ${escapeHtml(a.id)}"><span>${a.def.icon}</span><small>${escapeHtml(a.def.label.charAt(0))}${suffix}</small></button>`;
      }).join("");
    }
    board.innerHTML = `<svg class="fa-map-editor-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${editorConnectionsMarkup()}${editorTacticalParentLinesMarkup()}</svg>${nodes}${anchors}`;
  }

  function renderMapEditor() {
    const overlay = $("fa-map-editor"); if (!overlay) return;
    if (!mapEditorState.zoneId) mapEditorState.zoneId = (ZONES[0] && ZONES[0].id) || null;
    const zone = editorZone();
    if (!mapEditorState.draft && zone) mapEditorState.draft = zoneDirectorApi.cloneNodeLayout(zone);
    const select = $("fa-map-editor-zone");
    if (select) select.innerHTML = ZONES.map((z) => `<option value="${z.id}" ${z.id===mapEditorState.zoneId?"selected":""}>${escapeHtml(z.name)}${z.nodes&&z.nodes.length?"":" · senza nodi"}</option>`).join("");
    const status = $("fa-map-editor-status");
    if (status) status.textContent = mapEditorState.status || (mapEditorState.connectMode ? (mapEditorState.connectFromId ? "Scegli il secondo nodo da collegare/scollegare." : "Scegli il primo nodo.") : "Trascina liberamente i nodi: le coordinate vengono salvate in percentuale.");
    const connectBtn = $("fa-map-editor-connect"); if (connectBtn) connectBtn.classList.toggle("is-active", mapEditorState.connectMode);
    renderTacticalEditorControls();
    renderMapEditorBoard();
  }

  function openMapEditor() {
    mapEditorState.zoneId = mapEditorState.zoneId || (ZONES[0] && ZONES[0].id);
    const zone = editorZone();
    mapEditorState.draft = zone ? zoneDirectorApi.cloneNodeLayout(zone) : null;
    mapEditorState.anchorDraft = zone ? tacticalAnchorsForZone(zone.id) : null;
    mapEditorState.selectedNodeId = null; mapEditorState.connectMode = false; mapEditorState.connectFromId = null; mapEditorState.tacticalMode = false; mapEditorState.selectedAnchor = null; mapEditorState.dirty = false; mapEditorState.status = "";
    $("fa-map-editor").hidden = false; renderMapEditor();
  }

  function chooseEditorNode(nodeId) {
    if (mapEditorState.connectMode) {
      if (!mapEditorState.connectFromId) { mapEditorState.connectFromId = nodeId; mapEditorState.selectedNodeId = nodeId; mapEditorState.status = "Ora scegli il secondo nodo."; renderMapEditor(); return; }
      if (mapEditorState.connectFromId === nodeId) { mapEditorState.connectFromId = null; mapEditorState.status = "Selezione collegamento annullata."; renderMapEditor(); return; }
      try {
        const out = zoneDirectorApi.toggleNodeConnection(mapEditorState.draft, mapEditorState.connectFromId, nodeId);
        mapEditorState.status = out.connected ? "Collegamento creato." : "Collegamento rimosso.";
        mapEditorState.dirty = true;
      } catch (e) { mapEditorState.status = e.message; }
      mapEditorState.connectFromId = null; mapEditorState.selectedNodeId = nodeId; renderMapEditor(); return;
    }
    mapEditorState.selectedNodeId = nodeId; mapEditorState.selectedAnchor = null; mapEditorState.status = `${editorNodeLabel(editorNode(nodeId))} selezionato.`; renderMapEditor();
  }

  function bindMapEditorEvents() {
    const overlay = $("fa-map-editor"), board = $("fa-map-editor-board"); if (!overlay || !board) return;
    document.querySelectorAll("[data-open-map-editor]").forEach((open) => open.addEventListener("click", openMapEditor));
    overlay.addEventListener("click", (ev) => {
      if (ev.target.id === "fa-map-editor" || ev.target.closest("#fa-map-editor-close")) { overlay.hidden = true; return; }
      if (ev.target.id === "fa-map-editor-tactical-toggle") {
        mapEditorState.tacticalMode = !mapEditorState.tacticalMode; mapEditorState.connectMode = false; mapEditorState.connectFromId = null; mapEditorState.selectedAnchor = null;
        mapEditorState.status = mapEditorState.tacticalMode ? "Seleziona un nodo principale, poi aggiungi e trascina i suoi punti tattici." : "Punti tattici chiusi."; renderMapEditor(); return;
      }
      const addAnchorBtn = ev.target.closest("[data-add-tactical-anchor]");
      if (addAnchorBtn) { try { addTacticalAnchor(addAnchorBtn.dataset.addTacticalAnchor); renderMapEditor(); } catch(e) { mapEditorState.status=e.message; renderMapEditor(); } return; }
      if (ev.target.id === "fa-map-editor-anchor-remove") { try { removeSelectedTacticalAnchor(); renderMapEditor(); } catch(e) { mapEditorState.status=e.message; renderMapEditor(); } return; }
      const anchorBtn = ev.target.closest("[data-editor-anchor-type]");
      if (anchorBtn) { mapEditorState.selectedAnchor = { nodeId:mapEditorState.selectedNodeId, type:anchorBtn.dataset.editorAnchorType, slotId:anchorBtn.dataset.editorAnchorId }; mapEditorState.status = `Slot ${anchorBtn.dataset.editorAnchorId} selezionato. Trascinalo oppure rimuovilo.`; renderMapEditor(); return; }
      if (ev.target.id === "fa-map-editor-create") {
        mapEditorState.draft = zoneDirectorApi.createTemplateLayout(mapEditorState.zoneId, "diamond5"); mapEditorState.dirty = true; mapEditorState.status = "5 nodi creati. Ora posizionali sulla mappa."; renderMapEditor(); return;
      }
      if (ev.target.id === "fa-map-editor-entry") {
        if (!mapEditorState.selectedNodeId) { mapEditorState.status = "Seleziona prima un nodo."; renderMapEditor(); return; }
        mapEditorState.draft.entryNodeId = mapEditorState.selectedNodeId; mapEditorState.dirty = true; mapEditorState.status = `${editorNodeLabel(editorNode(mapEditorState.selectedNodeId))} impostato come Entry.`; renderMapEditor(); return;
      }
      if (ev.target.id === "fa-map-editor-connect") {
        mapEditorState.connectMode = !mapEditorState.connectMode; mapEditorState.connectFromId = null; mapEditorState.status = mapEditorState.connectMode ? "Scegli il primo nodo." : "Modifica collegamenti disattivata."; renderMapEditor(); return;
      }
      if (ev.target.id === "fa-map-editor-reset") {
        const base = BASE_MAP_LAYOUTS[mapEditorState.zoneId];
        mapEditorState.draft = JSON.parse(JSON.stringify(base));
        if (OFFICIAL_ZONE_LAYOUTS[mapEditorState.zoneId]) mapEditorState.anchorDraft = officialTacticalAnchorsForZone(mapEditorState.zoneId);
        mapEditorState.selectedNodeId = null; mapEditorState.selectedAnchor = null; mapEditorState.connectFromId = null; mapEditorState.dirty = true; mapEditorState.status = "Layout ufficiale ripristinato. Premi Salva Layout per renderlo permanente su questo dispositivo."; renderMapEditor(); return;
      }
      if (ev.target.id === "fa-map-editor-export") {
        try { exportCurrentMapConfig(); } catch (e) { mapEditorState.status = e.message; renderMapEditor(); }
        return;
      }
      if (ev.target.id === "fa-map-editor-import") {
        const input = $("fa-map-editor-import-file"); if (input) { input.value = ""; input.click(); }
        return;
      }
      if (ev.target.id === "fa-map-editor-save") {
        const zone = editorZone();
        try {
          zoneDirectorApi.applyNodeLayout(zone, mapEditorState.draft); storeMapLayout(zoneDirectorApi.cloneNodeLayout(zone));
          if (mapEditorState.anchorDraft) storeTacticalAnchors(mapEditorState.anchorDraft);
          syncLayoutToActiveGame(zone.id); persistSession();
          mapEditorState.draft = zoneDirectorApi.cloneNodeLayout(zone); mapEditorState.dirty = false; mapEditorState.status = `✓ ${zone.name}: layout salvato permanentemente su questo dispositivo.`; renderMapEditor();
          if (uiMode === "game") render();
        } catch (e) { mapEditorState.status = e.message; renderMapEditor(); }
        return;
      }
      const node = ev.target.closest("[data-editor-node]");
      if (node && !mapEditorState.suppressClick) chooseEditorNode(node.dataset.editorNode);
      mapEditorState.suppressClick = false;
    });
    $("fa-map-editor-zone").addEventListener("change", (ev) => {
      mapEditorState.zoneId = ev.target.value; const zone = editorZone(); mapEditorState.draft = zoneDirectorApi.cloneNodeLayout(zone); mapEditorState.anchorDraft = tacticalAnchorsForZone(zone.id); mapEditorState.selectedNodeId = null; mapEditorState.selectedAnchor = null; mapEditorState.connectFromId = null; mapEditorState.connectMode = false; mapEditorState.tacticalMode = false; mapEditorState.dirty = false; mapEditorState.status = ""; renderMapEditor();
    });
    const importFile = $("fa-map-editor-import-file");
    if (importFile) importFile.addEventListener("change", async (ev) => {
      const file = ev.target.files && ev.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const config = JSON.parse(text);
        importMapConfigObject(config);
      } catch (e) {
        mapEditorState.status = `Import fallito: ${e.message}`;
        renderMapEditor();
      }
    });
    board.addEventListener("pointerdown", (ev) => {
      const anchorEl = ev.target.closest("[data-editor-anchor-type]");
      if (anchorEl && mapEditorState.tacticalMode) {
        const type = anchorEl.dataset.editorAnchorType, slotId = anchorEl.dataset.editorAnchorId;
        mapEditorState.selectedAnchor = { nodeId:mapEditorState.selectedNodeId, type, slotId };
        mapEditorState.anchorDrag = { nodeId:mapEditorState.selectedNodeId, type, slotId, pointerId:ev.pointerId, startX:ev.clientX, startY:ev.clientY, moved:false };
        anchorEl.setPointerCapture && anchorEl.setPointerCapture(ev.pointerId); anchorEl.classList.add("is-dragging"); ev.preventDefault(); return;
      }
      const el = ev.target.closest("[data-editor-node]"); if (!el || mapEditorState.connectMode || mapEditorState.tacticalMode) return;
      const n = editorNode(el.dataset.editorNode); if (!n) return;
      mapEditorState.drag = { id:n.id, pointerId:ev.pointerId, startX:ev.clientX, startY:ev.clientY, moved:false };
      el.setPointerCapture && el.setPointerCapture(ev.pointerId); el.classList.add("is-dragging"); ev.preventDefault();
    });
    board.addEventListener("pointermove", (ev) => {
      const ad = mapEditorState.anchorDrag;
      if (ad && ad.pointerId === ev.pointerId) {
        const rect = board.getBoundingClientRect(); if (!rect.width || !rect.height) return;
        const bucket = nodeAnchorBucket(ad.nodeId, false), def = tacticalTypeDef(ad.type); if (!bucket || !def) return;
        const target = (Array.isArray(bucket[ad.type]) ? bucket[ad.type] : []).find((slot) => String(slot.id) === String(ad.slotId)); if (!target) return;
        target.x = Math.max(1,Math.min(99,((ev.clientX-rect.left)/rect.width)*100)); target.y = Math.max(1,Math.min(99,((ev.clientY-rect.top)/rect.height)*100));
        if (Math.hypot(ev.clientX-ad.startX,ev.clientY-ad.startY)>3) ad.moved = true;
        const el = board.querySelector(`[data-editor-anchor-id="${CSS.escape(String(ad.slotId))}"]`); if (el) { el.style.left=`${target.x}%`; el.style.top=`${target.y}%`; }
        mapEditorState.dirty = true; ev.preventDefault(); return;
      }
      const drag = mapEditorState.drag; if (!drag || drag.pointerId !== ev.pointerId) return;
      const rect = board.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      const n = editorNode(drag.id); if (!n) return;
      n.x = Math.max(3,Math.min(97,((ev.clientX-rect.left)/rect.width)*100)); n.y = Math.max(4,Math.min(96,((ev.clientY-rect.top)/rect.height)*100));
      if (Math.hypot(ev.clientX-drag.startX,ev.clientY-drag.startY)>4) drag.moved = true;
      const el = board.querySelector(`[data-editor-node="${drag.id}"]`); if (el) { el.style.left=`${n.x}%`; el.style.top=`${n.y}%`; }
      const svg = board.querySelector(".fa-map-editor-lines"); if (svg) svg.innerHTML = editorConnectionsMarkup();
      mapEditorState.dirty = true; ev.preventDefault();
    });
    const finishDrag = (ev) => {
      const ad = mapEditorState.anchorDrag;
      if (ad && ad.pointerId === ev.pointerId) {
        const bucket = nodeAnchorBucket(ad.nodeId, false), def = tacticalTypeDef(ad.type), target = bucket && def ? (Array.isArray(bucket[ad.type]) ? bucket[ad.type] : []).find((slot) => String(slot.id) === String(ad.slotId)) : null;
        const el = board.querySelector(`[data-editor-anchor-id="${CSS.escape(String(ad.slotId))}"]`); if (el) el.classList.remove("is-dragging");
        if (target) mapEditorState.status = `${def.icon} ${def.label} · X ${Number(target.x).toFixed(2)}% · Y ${Number(target.y).toFixed(2)}%`;
        mapEditorState.anchorDrag = null; renderMapEditor(); return;
      }
      const drag = mapEditorState.drag; if (!drag || drag.pointerId !== ev.pointerId) return;
      const el = board.querySelector(`[data-editor-node="${drag.id}"]`); if (el) el.classList.remove("is-dragging");
      mapEditorState.selectedNodeId = drag.id; mapEditorState.suppressClick = drag.moved; const movedNode = editorNode(drag.id); mapEditorState.status = drag.moved && movedNode ? `${editorNodeLabel(movedNode)} · X ${Number(movedNode.x).toFixed(2)}% · Y ${Number(movedNode.y).toFixed(2)}%` : mapEditorState.status; mapEditorState.drag = null;
      if (drag.moved) renderMapEditor();
    };
    board.addEventListener("pointerup", finishDrag); board.addEventListener("pointercancel", finishDrag);
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
        setupPlayers[i].startingWeaponId = null;
        saveRoster();
        renderSetup();
        return;
      }
      if (ev.target.id === "fa-resume-game") { resumeSavedSession(); return; }
      if (ev.target.id === "fa-new-game") { clearSavedSession(); renderSetup(); return; }
      if (ev.target.id === "fa-setup-start") attemptStartGame();
    });
    $("fa-setup-screen").addEventListener("change", (ev) => {
      if (ev.target.id === "fa-setup-count-select") { setupCount = Number(ev.target.value); saveRoster(); renderSetup(); return; }
      const presence = ev.target.closest("input[data-setup-presence]");
      if (presence) { setupPlayers[Number(presence.dataset.setupPresence)].present = presence.checked; saveRoster(); renderSetup(); return; }
      const weaponSelect = ev.target.closest("select[data-start-weapon]");
      if (weaponSelect) {
        setupPlayers[Number(weaponSelect.dataset.playerIndex)].startingWeaponId = weaponSelect.value;
        saveRoster();
        renderSetup();
        return;
      }
      const input = ev.target.closest("input[data-player-index]");
      if (input) { setupPlayers[Number(input.dataset.playerIndex)].name = input.value; saveRoster(); }
    });
  }

  applyOfficialZoneLayouts();
  loadSavedMapLayouts();
  loadRoster();
  ensureSetupPlayers();
  savedSession = loadSavedSession();

  bindSetupEvents();
  bindMapEvents();
  bindMagnifyEvents();
  bindPanelEvents();
  bindAnnouncementEvents();
  bindLaunchEvents();
  bindAttackOverlayEvents();
  bindTurnTransitionEvents();
  bindChestEvents();
  bindPresenceEvents();
  bindShellEvents();
  bindGiftMachineEvents();
  bindMapEditorEvents();
  window.addEventListener("resize", () => { if (uiMode === "game") drawConnections(); });

  render();

  // Hook di sola verifica manuale (QA), utile durante lo sviluppo: mai in produzione.
  const IS_DEV = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (IS_DEV) {
    window.__fortressDebug = { getGame: () => game, rerender: render };
  }
})();
