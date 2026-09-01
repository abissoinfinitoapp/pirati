/* =============================================================================
   PIRATI - Motore contenuti modulare
   -----------------------------------------------------------------------------
   Questo file NON contiene contenuti di gioco: solo il "registro" che raccoglie
   i pacchetti (isole + quest), il catalogo premi e il catalogo poteri.

   I contenuti vivono in file separati caricati PRIMA di app.js:
     - content/pack-XX-*.js   -> PIRATI.registerPack({...})
     - catalog/premi.js       -> PIRATI.registerRewards({...})
     - catalog/poteri.js      -> PIRATI.registerPowers([...])

   Funziona anche aprendo index.html da file:// perche' usa <script>, non fetch.
   ========================================================================== */

window.PIRATI = (function () {
  "use strict";

  const state = {
    packs: [],
    islands: [],            // ordine di apparizione = ordine di registrazione
    quests: [],             // tutte le quest di tutti i pacchetti, gia' ordinate
    islandById: new Map(),
    questById: new Map(),
    rewards: { loot: [], trophy: [], title: [] },
    rewardById: new Map(),
    powers: [],
    powerById: new Map(),
    enemies: [],
    bosses: [],
    enemyById: new Map(),
    events: [],
    eventById: new Map(),
    words: [],               // parole del Pesce Crostone (una al giorno)
    wordById: new Map(),
    map: null,               // { id, start, nodes:{}, legs:{}, routes:{} }
    gradeLadder: [
      { grade: 1, questsNeeded: 0, name: "Mozzi Coraggiosi" },
      { grade: 2, questsNeeded: 3, name: "Corsari Provetti" },
      { grade: 3, questsNeeded: 6, name: "Lupi di Mare" },
      { grade: 4, questsNeeded: 10, name: "Leggende dei Sette Mari" },
      { grade: 5, questsNeeded: 15, name: "Signori del Teschio d'Oro" }
    ],
    problems: []            // avvisi di validazione, visibili in console
  };

  const REWARD_TYPES = ["loot", "coins", "trophy", "title", "power", "fame"];
  const POWER_CATEGORIES = ["carta", "magia", "arma", "marchingegno"];
  const STATS = ["coraggio", "astuzia", "fortuna"];
  const READING_LEVELS = ["facile", "avanzato"];

  function warn(msg) {
    state.problems.push(msg);
    console.warn("[PIRATI] " + msg);
  }

  /* ---------- registrazione pacchetti quest -------------------------------- */

  function registerPack(pack) {
    if (!pack || typeof pack !== "object") return warn("registerPack: pacchetto non valido.");
    if (!pack.id) return warn("registerPack: manca 'id' nel pacchetto.");
    if (state.packs.some((p) => p.id === pack.id)) return warn(`Pacchetto duplicato: "${pack.id}".`);
    state.packs.push(pack);

    (pack.islands || []).forEach((island) => {
      if (!island.id) return warn(`[${pack.id}] isola senza 'id'.`);
      if (state.islandById.has(island.id)) return warn(`[${pack.id}] isola duplicata: "${island.id}".`);
      const clean = {
        id: island.id,
        name: island.name || island.id,
        icon: island.icon || "•",
        color: island.color || "sea",
        blurb: island.blurb || "",
        packId: pack.id
      };
      state.islands.push(clean);
      state.islandById.set(clean.id, clean);
    });

    (pack.quests || []).forEach((quest, index) => {
      const q = normalizeQuest(quest, pack, index);
      if (!q) return;
      if (state.questById.has(q.id)) return warn(`[${pack.id}] quest duplicata: "${q.id}".`);
      state.quests.push(q);
      state.questById.set(q.id, q);
    });

    resortQuests();
  }

  function normalizeQuest(quest, pack, index) {
    if (!quest || !quest.id) { warn(`[${pack.id}] quest #${index} senza 'id'.`); return null; }
    const where = `[${pack.id}] quest "${quest.id}"`;

    if (!quest.island) warn(`${where}: manca 'island'.`);
    if (!quest.title) warn(`${where}: manca 'title'.`);
    if (!quest.readAloud) warn(`${where}: manca 'readAloud' (il testo che legge l'adulto).`);
    if (!Array.isArray(quest.beats) || quest.beats.length < 1) warn(`${where}: 'beats' vuoto (servono 2-3 scene).`);
    if (!Array.isArray(quest.choices) || quest.choices.length < 1) warn(`${where}: 'choices' vuoto (serve almeno 1 approccio).`);

    (quest.choices || []).forEach((c, i) => {
      if (!c.stat || !STATS.includes(String(c.stat).toLowerCase()))
        warn(`${where}: choice #${i} 'stat' deve essere coraggio/astuzia/fortuna.`);
      if (typeof c.target !== "number") warn(`${where}: choice #${i} manca 'target' numerico.`);
    });

    const readKids = quest.readKids && typeof quest.readKids === "object" ? quest.readKids : {};
    READING_LEVELS.forEach((lvl) => {
      if (!Array.isArray(readKids[lvl]) || !readKids[lvl].length)
        warn(`${where}: 'readKids.${lvl}' mancante (righe che leggono i bambini a turno).`);
    });

    const rewards = (Array.isArray(quest.rewards) ? quest.rewards : []).map((r, i) => {
      if (!r || !REWARD_TYPES.includes(r.type)) { warn(`${where}: reward #${i} 'type' sconosciuto (${r && r.type}).`); return null; }
      return r;
    }).filter(Boolean);
    if (!rewards.length) warn(`${where}: nessun premio in 'rewards' (i bambini vogliono vedere tanti premi!).`);

    return {
      id: quest.id,
      packId: pack.id,
      island: quest.island,
      title: quest.title || quest.id,
      kind: quest.kind || "Avventura",
      difficulty: Number(quest.difficulty) || 5,
      minutes: Number(quest.minutes) || 55,
      order: Number.isFinite(Number(quest.order)) ? Number(quest.order) : (index + 1) / 100,
      readAloud: quest.readAloud || "",
      readKids: {
        facile: Array.isArray(readKids.facile) ? readKids.facile : [],
        avanzato: Array.isArray(readKids.avanzato) ? readKids.avanzato : []
      },
      goal: quest.goal || "",
      beats: Array.isArray(quest.beats) ? quest.beats : [],
      choices: (quest.choices || []).map((c) => ({
        label: c.label || "Approccio",
        stat: String(c.stat || "fortuna").toLowerCase(),
        target: Number(c.target) || 6,
        result: c.result || ""
      })),
      groupChallenge: quest.groupChallenge || "",
      rewards,
      growth: quest.growth || "",
      fail: quest.fail || "",
      escape: quest.escape || "",
      storyFlow: normalizeStoryFlow(quest.storyFlow, where)
    };
  }

  /* ---------- avventura guidata (storyFlow) --------------------------------
     Opzionale. Struttura definita nel contratto tecnico
     quest_json/quest-director-v2-tempio-contratto-tecnico.json:
       { start, progression: [ { scene_id, phase_flow, scene:{read,ask,hints,
         rescue,masterTip}, interaction?, choices?[{id,label,reaction_title,
         reaction,next}], resolution?{policy,destiny,destiny_screen,dice,group},
         outcomes?{success,fail_forward}, outcome?, completion? } ], reward_screen? }
     Il motore fa solo indicizzazione + validazione: passa le scene COSÌ COME
     SONO (nessuna riscrittura di logica narrativa). ------------------------ */
  const STORY_POLICIES = ["narrative", "dice", "group", "destiny", "destiny_group_or_dice"];

  function normalizeStoryFlow(flow, where) {
    if (flow == null) return null;
    const prog = Array.isArray(flow.progression) ? flow.progression : null;
    if (!prog || !prog.length) { warn(`${where}: 'storyFlow' senza 'progression' (array di scene).`); return null; }

    const scenes = {};
    const order = [];
    prog.forEach((entry, i) => {
      const id = entry.scene_id || entry.id;
      if (!id) { warn(`${where}: storyFlow scena #${i} senza 'scene_id'.`); return; }
      if (scenes[id]) { warn(`${where}: storyFlow scena duplicata "${id}".`); return; }
      const clone = JSON.parse(JSON.stringify(entry));
      clone.scene_id = id;
      clone.id = id;              // alias comodo per app.js
      scenes[id] = clone;
      order.push(id);

      const sc = clone.scene || {};
      if (sc.ask && (!Array.isArray(sc.hints) || !sc.hints.length))
        warn(`${where}: storyFlow scena "${id}" ha 'ask' ma nessun 'hints'.`);
      if (sc.ask && !sc.rescue)
        warn(`${where}: storyFlow scena "${id}" ha 'ask' ma nessun 'rescue'.`);

      const r = clone.resolution;
      if (r) {
        const policy = String(r.policy || "").toLowerCase();
        if (!STORY_POLICIES.includes(policy))
          warn(`${where}: storyFlow scena "${id}" resolution.policy "${r.policy}" sconosciuta.`);
        const needsDice = policy === "dice" || policy === "destiny" || policy === "destiny_group_or_dice";
        if (needsDice && !(r.dice && STATS.includes(String(r.dice.stat || "").toLowerCase())))
          warn(`${where}: storyFlow scena "${id}" policy "${policy}" richiede resolution.dice {stat,target}.`);
      }
      const ways = (clone.choices ? 1 : 0) + (clone.outcomes ? 1 : 0) + (clone.outcome ? 1 : 0) + (clone.completion ? 1 : 0);
      if (!ways) warn(`${where}: storyFlow scena "${id}" senza 'choices', 'outcomes', 'outcome' né 'completion'.`);
    });

    const start = flow.start || order[0];
    if (!scenes[start]) warn(`${where}: storyFlow.start "${start}" non è una scena.`);

    const nextsOf = (s) => {
      const outs = [];
      (s.choices || []).forEach((c) => { if (!c.next) warn(`${where}: storyFlow scena "${s.scene_id}" scelta "${c.id}" senza 'next'.`); outs.push(c.next); });
      if (s.outcomes) { ["success", "fail_forward"].forEach((k) => { if (s.outcomes[k]) outs.push(s.outcomes[k].next); }); }
      if (s.outcome) outs.push(s.outcome.next);
      return outs.filter(Boolean);
    };
    const reachable = new Set();
    const visit = (id) => {
      if (!id || reachable.has(id)) return;
      if (!scenes[id]) { warn(`${where}: storyFlow collegamento a scena inesistente "${id}".`); return; }
      reachable.add(id);
      nextsOf(scenes[id]).forEach(visit);
    };
    visit(start);
    order.forEach((id) => { if (!reachable.has(id)) warn(`${where}: storyFlow scena "${id}" non raggiungibile da "${start}".`); });

    return { start, order, scenes, rewardScreen: flow.reward_screen || flow.rewardScreen || null };
  }

  function resortQuests() {
    // ordine campagna: per pacchetto (registrazione), poi per isola
    // (ordine di registrazione dell'isola), poi per 'order' dentro l'isola.
    const packRank = new Map(state.packs.map((p, i) => [p.id, i]));
    const islandRank = new Map(state.islands.map((isl, i) => [isl.id, i]));
    state.quests.sort((a, b) => {
      return (packRank.get(a.packId) - packRank.get(b.packId))
        || ((islandRank.has(a.island) ? islandRank.get(a.island) : 999) - (islandRank.has(b.island) ? islandRank.get(b.island) : 999))
        || (a.order - b.order);
    });
  }

  /* ---------- catalogo premi --------------------------------------------- */

  function registerRewards(catalog) {
    if (!catalog || typeof catalog !== "object") return warn("registerRewards: catalogo non valido.");
    ["loot", "trophy", "title"].forEach((bucket) => {
      (catalog[bucket] || []).forEach((entry) => {
        if (!entry.id) return warn(`registerRewards: voce '${bucket}' senza 'id'.`);
        if (state.rewardById.has(entry.id)) return warn(`Premio duplicato: "${entry.id}".`);
        const clean = {
          id: entry.id,
          bucket,
          name: entry.name || entry.id,
          icon: entry.icon || "🎁",
          rarity: entry.rarity || "comune",
          text: entry.text || ""
        };
        state.rewards[bucket].push(clean);
        state.rewardById.set(clean.id, clean);
      });
    });
  }

  /* ---------- catalogo poteri ------------------------------------------- */

  function registerPowers(list) {
    if (!Array.isArray(list)) return warn("registerPowers: serve un array.");
    list.forEach((p) => {
      if (!p.id) return warn("registerPowers: potere senza 'id'.");
      if (state.powerById.has(p.id)) return warn(`Potere duplicato: "${p.id}".`);
      const cat = String(p.category || "carta").toLowerCase();
      if (!POWER_CATEGORIES.includes(cat)) warn(`Potere "${p.id}": categoria "${p.category}" sconosciuta (carta/magia/arma/marchingegno).`);
      const clean = {
        id: p.id,
        name: p.name || p.id,
        icon: p.icon || "✦",
        category: cat,
        grade: Number(p.grade) || 1,
        cooldown: p.cooldown || "quest",       // "quest" | "giorno" | "permanente"
        effect: p.effect || "",
        startsWith: Boolean(p.startsWith),      // in dotazione dall'inizio
        passive: p.passive || null,            // es. { stat:"coraggio", amount:1 }
        play: p.play || { type: "narrative" }, // cosa fa quando la giochi
        legendary: Boolean(p.legendary),       // carta rara: non si pesca dalle quest
        howTo: p.howTo || "",                  // come si ottiene (per le leggendarie)
        art: p.art || "",                      // descrizione per l'immagine
        image: p.image || window.PIRATI_ASSET(`carte/${p.id}.webp`)
      };
      state.powers.push(clean);
      state.powerById.set(clean.id, clean);
    });
  }

  /* ---------- bestiario: nemici e boss --------------------------------- */

  function registerEnemies(list) {
    if (!Array.isArray(list)) return warn("registerEnemies: serve un array.");
    list.forEach((e) => {
      if (!e.id) return warn("registerEnemies: nemico senza 'id'.");
      if (state.enemyById.has(e.id)) return warn(`Nemico duplicato: "${e.id}".`);
      if (typeof e.threat !== "number") warn(`Nemico "${e.id}": manca 'threat' numerico.`);
      const clean = {
        id: e.id,
        name: e.name || e.id,
        title: e.name || e.id,          // alias per compatibilita'
        vibe: e.vibe || "",
        threat: Number(e.threat) || 6,
        reward: e.reward || "",
        trick: e.trick || "",
        art: e.art || "",
        image: e.image || window.PIRATI_ASSET(`contendenti/${e.id}.webp`),
        boss: Boolean(e.boss)
      };
      state.enemyById.set(clean.id, clean);
      if (clean.boss) state.bosses.push(clean);
      else state.enemies.push(clean);
    });
  }

  /* ---------- carte rotta: eventi, tesori, razzie ------------------- */

  const EVENT_SCOPES = ["mare", "isola", "tesoro", "razzia"];

  function registerEvents(list) {
    if (!Array.isArray(list)) return warn("registerEvents: serve un array.");
    list.forEach((e) => {
      if (!e.id) return warn("registerEvents: carta senza 'id'.");
      if (state.eventById.has(e.id)) return warn(`Carta rotta duplicata: "${e.id}".`);
      const scope = String(e.scope || "mare").toLowerCase();
      if (!EVENT_SCOPES.includes(scope)) warn(`Carta "${e.id}": scope "${e.scope}" sconosciuto (mare/isola/tesoro/razzia).`);
      if (!e.readAloud) warn(`Carta "${e.id}": manca 'readAloud'.`);
      const hasRoll = e.roll && STATS.includes(String(e.roll.stat || "").toLowerCase());
      const hasChoice = Array.isArray(e.choice) && e.choice.length >= 2;
      if (!hasRoll && !hasChoice) warn(`Carta "${e.id}": serve un 'roll' (stat+act) oppure un 'choice' con 2 opzioni.`);
      const clean = {
        id: e.id,
        scope,
        title: e.title || e.id,
        readAloud: e.readAloud || "",
        situation: e.situation || "",
        roll: hasRoll ? { stat: String(e.roll.stat).toLowerCase(), act: e.roll.act || "" } : null,
        success: e.success || "",
        fail: e.fail || "",
        choice: hasChoice ? e.choice.map((c) => ({ label: c.label || "Scelta", result: c.result || "", coins: Number(c.coins) || 0, danger: Number(c.danger) || 0 })) : null
      };
      state.events.push(clean);
      state.eventById.set(clean.id, clean);
    });
  }

  function eventsForScope(scope) {
    return state.events.filter((e) => e.scope === scope);
  }

  /* ---------- parole del Pesce Crostone ------------------------------- */

  function registerWords(list) {
    if (!Array.isArray(list)) return warn("registerWords: serve un array.");
    list.forEach((w) => {
      if (!w || !w.id) return warn("registerWords: parola senza 'id'.");
      if (state.wordById.has(w.id)) return warn(`Parola duplicata: "${w.id}".`);
      if (!w.parola) warn(`Parola "${w.id}": manca 'parola'.`);
      if (!w.significato) warn(`Parola "${w.id}": manca 'significato'.`);
      const clean = {
        id: w.id,
        parola: w.parola || w.id,
        significato: w.significato || "",
        esempio: w.esempio || "",
        tranello: w.tranello || ""
      };
      state.words.push(clean);
      state.wordById.set(clean.id, clean);
    });
  }

  /* ---------- mappa dell'arcipelago ----------------------------------- */

  const SPACE_TYPES = ["mare", "costa", "evento", "mostro", "assalto", "razzia", "tesoro", "quest", "sbarco", "porto"];

  function registerMap(map) {
    if (!map || typeof map !== "object") return warn("registerMap: mappa non valida.");
    if (state.map) return warn("registerMap: una mappa e' gia' registrata.");
    if (!map.start) warn("registerMap: manca 'start' (nodo di partenza).");

    const nodes = {};
    (map.nodes || []).forEach((node) => {
      if (!node.id) return warn("registerMap: nodo senza 'id'.");
      nodes[node.id] = {
        id: node.id,
        name: node.name || node.id,
        icon: node.icon || "•",
        x: Number(node.x) || 50,
        y: Number(node.y) || 50,
        home: Boolean(node.home),
        island: node.island || null,   // id isola collegata (per le quest)
        loop: Array.isArray(node.loop) ? node.loop.slice() : null  // giro a terra
      };
    });

    const legs = {};
    (map.legs || []).forEach((leg) => {
      if (!leg.id || !leg.from || !leg.to) return warn(`registerMap: tratta incompleta (${leg.id}).`);
      if (!nodes[leg.from] || !nodes[leg.to]) warn(`registerMap: tratta "${leg.id}" collega nodi inesistenti.`);
      (leg.spaces || []).forEach((sp) => {
        const t = String(sp).split(":")[0];
        if (!SPACE_TYPES.includes(t)) warn(`registerMap: tratta "${leg.id}" ha una casella sconosciuta: "${sp}".`);
      });
      legs[leg.id] = { id: leg.id, from: leg.from, to: leg.to, spaces: (leg.spaces || []).slice() };
    });

    state.map = { id: map.id || "mappa", start: map.start, nodes, legs, routes: map.routes || {} };
  }

  function mapNode(id) { return state.map ? state.map.nodes[id] || null : null; }
  function mapLeg(id) { return state.map ? state.map.legs[id] || null : null; }
  function legsFrom(nodeId) {
    if (!state.map) return [];
    return Object.values(state.map.legs).filter((leg) => leg.from === nodeId || leg.to === nodeId);
  }

  /* ---------- letture ---------------------------------------------------- */

  function islandQuests(islandId) {
    return state.quests.filter((q) => q.island === islandId);
  }

  function questsForGrade(grade) {
    return state.powers.filter((p) => p.grade <= grade);
  }

  function gradeForCompleted(count) {
    let current = state.gradeLadder[0];
    state.gradeLadder.forEach((step) => { if (count >= step.questsNeeded) current = step; });
    return current;
  }

  function nextGrade(count) {
    return state.gradeLadder.find((step) => count < step.questsNeeded) || null;
  }

  /* ---------- ricompense: espansione premi in oggetti concreti ---------- */

  function expandRewards(quest) {
    // trasforma quest.rewards (riferimenti) in card visibili con testo pronto
    return (quest.rewards || []).map((r) => {
      if (r.type === "coins") return { type: "coins", icon: "🪙", name: `${r.amount} monete`, amount: r.amount, rarity: "comune" };
      if (r.type === "fame") return { type: "fame", icon: "⭐", name: `${r.amount} Fama`, amount: r.amount, rarity: "raro" };
      if (r.type === "power") {
        const p = state.powerById.get(r.id);
        return p
          ? { type: "power", id: p.id, icon: p.icon, name: p.name, rarity: p.grade >= 3 ? "epico" : "raro", text: `${cap(p.category)} · ${p.effect}` }
          : missing("power", r.id);
      }
      const e = state.rewardById.get(r.id);
      if (!e) return missing(r.type, r.id);
      return { type: r.type, id: e.id, icon: e.icon, name: e.name, rarity: e.rarity, text: e.text };
    });
  }

  function missing(type, id) {
    warn(`Premio "${id}" (${type}) non esiste nel catalogo. Aggiungilo in catalog/premi.js o catalog/poteri.js.`);
    return { type, id, icon: "❔", name: id || "premio sconosciuto", rarity: "comune", text: "(da definire nel catalogo)" };
  }

  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  /* ---------- diagnostica --------------------------------------------- */

  function report() {
    const lines = [
      `Pacchetti: ${state.packs.length}`,
      `Isole: ${state.islands.length}`,
      `Quest: ${state.quests.length} (${state.quests.filter((q) => q.storyFlow).length} guidate)`,
      `Premi a catalogo: ${state.rewardById.size}`,
      `Poteri a catalogo: ${state.powers.length}`,
      `Nemici: ${state.enemies.length} + ${state.bosses.length} boss`,
      `Carte rotta: ${state.events.length}`,
      `Parole Pesce Crostone: ${state.words.length}`,
      `Mappa: ${state.map ? Object.keys(state.map.nodes).length + " nodi, " + Object.keys(state.map.legs).length + " tratte" : "nessuna"}`,
      `Avvisi: ${state.problems.length}`
    ];
    console.log("%c[PIRATI] " + lines.join("  |  "), "font-weight:bold");
    if (state.problems.length) console.warn("[PIRATI] Avvisi:\n- " + state.problems.join("\n- "));
    return { ...state };
  }

  return {
    _state: state,
    registerPack,
    registerRewards,
    registerPowers,
    registerEnemies,
    registerEvents,
    registerWords,
    registerMap,
    get packs() { return state.packs; },
    get islands() { return state.islands; },
    get quests() { return state.quests; },
    get powers() { return state.powers; },
    get enemies() { return state.enemies; },
    get bosses() { return state.bosses; },
    get boss() { return state.bosses[0] || null; },
    enemy: (id) => state.enemyById.get(id) || null,
    get events() { return state.events; },
    event: (id) => state.eventById.get(id) || null,
    eventsForScope,
    get words() { return state.words; },
    word: (id) => state.wordById.get(id) || null,
    get gradeLadder() { return state.gradeLadder; },
    get problems() { return state.problems; },
    get map() { return state.map; },
    mapNode,
    mapLeg,
    legsFrom,
    island: (id) => state.islandById.get(id) || null,
    quest: (id) => state.questById.get(id) || null,
    power: (id) => state.powerById.get(id) || null,
    reward: (id) => state.rewardById.get(id) || null,
    islandQuests,
    questsForGrade,
    gradeForCompleted,
    nextGrade,
    expandRewards,
    report
  };
})();
