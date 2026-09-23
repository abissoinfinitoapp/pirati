/* =============================================================================
   Fortress Army — Catalogo Armi v2.4 (100 voci).

   Fonte di verità unica: ARMI_100 (dati grezzi). Ogni altro numero — power,
   specialValue, POTENZA, baseDice, range — è SEMPRE derivato da
   category + archetype + rarity + special, mai scritto a mano qui sotto.

   Nomi originali in italiano, ispirati alle famiglie tipiche del genere
   battle royale ma senza ricalcare nomi coperti da marchio/copyright.

   Compatibile Node (require, per i test) e browser (window.FORTRESS_*).
   ========================================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.FORTRESS_ARMI = api.ARMI;
    root.FORTRESS_CATEGORIE_ARMI = api.CATEGORIE_ARMI;
    root.FORTRESS_ARMI_API = api;
  }
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null), function () {
  "use strict";

  /* ---- Rarità: unico punto in cui si bilancia la progressione ---- */
  const RARITY_BONUS = {
    comune: 0, "non-comune": 1, rara: 2, epica: 3, leggendaria: 4, mitica: 5
  };
  const RARITY_ORDER = ["comune", "non-comune", "rara", "epica", "leggendaria", "mitica"];

  /* ---- Archetipi: baseDice + gittata + bonus di categoria, per category ---- */
  const ARCHETYPES = {
    assalto: {
      standard: { baseDice: 2, range: "medio", bonus: 0 },
      precision: { baseDice: 1, range: "medio", bonus: 1 }
    },
    shotgun: {
      standard: { baseDice: 2, range: "vicino", bonus: 0 },
      oneshot: { baseDice: 1, range: "vicino", bonus: 2 }
    },
    smg: {
      standard: { baseDice: 2, range: "vicino", bonus: 0 },
      compact: { baseDice: 1, range: "vicino", bonus: 1 }
    },
    pistola: {
      standard: { baseDice: 1, range: "medio", bonus: 0 },
      revolver: { baseDice: 1, range: "medio", bonus: 1 },
      dualwield: { baseDice: 2, range: "vicino", bonus: 0 }
    },
    cecchino: {
      bolt: { baseDice: 1, range: "lontano", bonus: 2 },
      semiauto: { baseDice: 2, range: "lontano", bonus: 0 }
    },
    dmr: {
      standard: { baseDice: 2, range: "lontano", bonus: 1 }
    },
    arco: {
      standard: { baseDice: 1, range: "medio", bonus: 0 }
    },
    esplosivo: {
      standard: { baseDice: 1, range: "medio", bonus: 0 }
    },
    pesante: {
      standard: { baseDice: 2, range: "medio", bonus: 1 }
    },
    mischia: {
      standard: { baseDice: 2, range: "vicino", bonus: 0 }
    },
    energia: {
      sidearm: { baseDice: 1, range: "medio", bonus: 0 },
      rifle: { baseDice: 2, range: "medio", bonus: 0 },
      sniper: { baseDice: 1, range: "lontano", bonus: 2 },
      arc: { baseDice: 2, range: "vicino", bonus: 0 }
    },
    esotica: {
      melee: { baseDice: 2, range: "vicino", bonus: 0 },
      siege: { baseDice: 1, range: "lontano", bonus: 0 },
      ghost: { baseDice: 1, range: "lontano", bonus: 2 }
    }
  };

  const CATEGORIE_ARMI = {
    assalto: "Fucili d'assalto", shotgun: "Shotgun", smg: "SMG",
    pistola: "Pistole e revolver", cecchino: "Cecchini", dmr: "DMR / Marksman",
    arco: "Archi e balestre", esplosivo: "Lanciarazzi ed esplosivi",
    pesante: "Armi pesanti", mischia: "Mischia", energia: "Armi a energia",
    esotica: "Esotiche e mitiche"
  };

  /* ---- Vocabolario special: tipi validi + derivazione di specialValue.
     Mai un valore scritto a mano sull'arma: si calcola sempre da qui. ---- */
  const SPECIAL_TYPES = [
    "none", "rangeless", "ignoreShield", "critOnSix", "rerollOnes",
    "areaDamage", "suppress", "silent", "chainStrike", "executionerStrike", "silentKill"
  ];

  function getArchetype(category, archetype) {
    const cat = ARCHETYPES[category];
    const arch = cat && cat[archetype];
    if (!arch) throw new Error(`Archetipo sconosciuto: ${category}/${archetype}`);
    return arch;
  }

  function computeSpecialValue(weapon) {
    const special = weapon.special || { type: "none" };
    if (SPECIAL_TYPES.indexOf(special.type) === -1) throw new Error(`Special sconosciuto: ${special.type}`);
    const arch = getArchetype(weapon.category, weapon.archetype);
    switch (special.type) {
      case "none": return 0;
      case "rangeless": return 0.5;
      case "ignoreShield": return (special.n === 2 ? 2 : 1) * 1;
      case "critOnSix": return arch.baseDice * 1.0;
      case "rerollOnes": return arch.baseDice * 0.4167;
      case "areaDamage": return 2;
      case "suppress": return 1.5;
      case "silent": return 0.5;
      case "chainStrike": return 1.5;
      case "executionerStrike": return 1.5;
      case "silentKill": return 1.5;
      default: return 0;
    }
  }

  function computePower(weapon) {
    const arch = getArchetype(weapon.category, weapon.archetype);
    const rarityBonus = RARITY_BONUS[weapon.rarity];
    if (rarityBonus === undefined) throw new Error(`Rarità sconosciuta: ${weapon.rarity}`);
    return rarityBonus + arch.bonus;
  }

  function computePotenza(weapon) {
    const arch = getArchetype(weapon.category, weapon.archetype);
    return Math.round(arch.baseDice * 3.5 + computePower(weapon) + computeSpecialValue(weapon));
  }

  function getRange(weapon) { return getArchetype(weapon.category, weapon.archetype).range; }
  function getBaseDice(weapon) { return getArchetype(weapon.category, weapon.archetype).baseDice; }
  function getImage(weapon) { return "assets/fortress/weapons/" + weapon.id + ".webp"; }

  /* =========================================================================
     LE 100 ARMI — dati grezzi. MAI: baseDice, range, power, specialValue,
     POTENZA. Solo: id, name, description, role, category, archetype, rarity,
     special, equivalentGroup (solo pochi casi Comune/Non comune).
     ========================================================================= */
  const ARMI_100 = [
    // --- Fucili d'assalto (14): standard 2 dadi / precision 1 dado ---
    { id: "assault_base", name: "Fucile d'Assalto Standard", category: "assalto", archetype: "standard", rarity: "comune", special: { type: "none" }, equivalentGroup: "assault-standard-equivalent-a", description: "Il fucile base, nessun punto debole.", role: "assalto baseline" },
    { id: "assault_burst", name: "Fucile a Raffica Corta", category: "assalto", archetype: "precision", rarity: "comune", special: { type: "none" }, description: "Leggero, un dado solo.", role: "assalto entry-level a dado singolo" },
    { id: "assault_lightning", name: "Fucile Fulmine", category: "assalto", archetype: "standard", rarity: "comune", special: { type: "none" }, equivalentGroup: "assault-standard-equivalent-a", description: "Variante estetica del fucile base.", role: "assalto baseline (reskin)" },
    { id: "assault_heavy", name: "Fucile d'Assalto Pesante", category: "assalto", archetype: "standard", rarity: "non-comune", special: { type: "none" }, description: "Standard potenziato.", role: "assalto standard, tappa intermedia" },
    { id: "assault_suppressed", name: "Fucile Silenziato", category: "assalto", archetype: "standard", rarity: "non-comune", special: { type: "silent" }, description: "Non attira attenzioni.", role: "assalto furtivo" },
    { id: "assault_precision_tactical", name: "Fucile di Precisione Tattico", category: "assalto", archetype: "precision", rarity: "non-comune", special: { type: "none" }, description: "Un colpo alla volta, più preciso.", role: "assalto a dado singolo, tappa intermedia" },
    { id: "assault_battle", name: "Fucile da Battaglia", category: "assalto", archetype: "standard", rarity: "non-comune", special: { type: "ignoreShield", n: 1 }, description: "Perfora l'armatura leggera.", role: "assalto perforante" },
    { id: "assault_ranger", name: "Fucile da Ranger", category: "assalto", archetype: "standard", rarity: "rara", special: { type: "none" }, description: "Solido, senza sorprese.", role: "assalto rara pura" },
    { id: "assault_dualmag", name: "Fucile a Doppio Caricatore", category: "assalto", archetype: "standard", rarity: "rara", special: { type: "rerollOnes" }, description: "Cadenza più affidabile.", role: "assalto affidabile" },
    { id: "assault_chrome", name: "Fucile Cromato", category: "assalto", archetype: "precision", rarity: "rara", special: { type: "none" }, description: "Precisione rara a dado singolo.", role: "assalto a dado singolo, fascia rara" },
    { id: "assault_redeye", name: "Fucile Occhio Rosso", category: "assalto", archetype: "standard", rarity: "rara", special: { type: "silent" }, description: "Mira che non si fa notare.", role: "assalto furtivo, fascia rara" },
    { id: "assault_nemesis", name: "Fucile Nemesi", category: "assalto", archetype: "standard", rarity: "epica", special: { type: "rerollOnes" }, description: "Cadenza epica, sempre affidabile.", role: "assalto affidabile, fascia epica" },
    { id: "assault_hunter", name: "Fucile del Cacciatore", category: "assalto", archetype: "precision", rarity: "epica", special: { type: "critOnSix" }, description: "Un ibrido tra assalto e cecchino.", role: "ibrido assalto/cecchino, rischio ridotto" },
    { id: "assault_smith", name: "Fucile del Fabbro", category: "assalto", archetype: "standard", rarity: "leggendaria", special: { type: "critOnSix" }, description: "L'assalto più vicino alla perfezione.", role: "assalto definitivo, sempre valido" },

    // --- Shotgun (12): standard 2 dadi vicino / oneshot 1 dado vicino ---
    { id: "shotgun_base", name: "Fucile a Pompa Base", category: "shotgun", archetype: "standard", rarity: "comune", special: { type: "none" }, equivalentGroup: "shotgun-standard-equivalent-a", description: "Il classico fucile a pompa.", role: "shotgun baseline" },
    { id: "shotgun_doublebarrel", name: "Doppietta", category: "shotgun", archetype: "oneshot", rarity: "comune", special: { type: "none" }, equivalentGroup: "shotgun-oneshot-equivalent-a", description: "Un colpo solo, ma pesante.", role: "shotgun a colpo singolo, alto rischio" },
    { id: "shotgun_lever", name: "Fucile a Leva", category: "shotgun", archetype: "standard", rarity: "comune", special: { type: "none" }, equivalentGroup: "shotgun-standard-equivalent-a", description: "Variante estetica del fucile a pompa.", role: "shotgun baseline (reskin)" },
    { id: "shotgun_primitive", name: "Fucile Primitivo", category: "shotgun", archetype: "oneshot", rarity: "comune", special: { type: "none" }, equivalentGroup: "shotgun-oneshot-equivalent-a", description: "Variante estetica della doppietta.", role: "shotgun a colpo singolo (reskin)" },
    { id: "shotgun_makeshift", name: "Fucile Improvvisato", category: "shotgun", archetype: "standard", rarity: "comune", special: { type: "silent" }, description: "Rudimentale ma discreto.", role: "shotgun furtiva, entry-level" },
    { id: "shotgun_tactical", name: "Fucile a Pompa Tattico", category: "shotgun", archetype: "standard", rarity: "non-comune", special: { type: "none" }, description: "Pompa standard potenziato.", role: "shotgun standard, tappa intermedia" },
    { id: "shotgun_combat", name: "Fucile da Combattimento", category: "shotgun", archetype: "oneshot", rarity: "non-comune", special: { type: "none" }, description: "Un colpo solo, potenziato.", role: "shotgun a colpo singolo, tappa intermedia" },
    { id: "shotgun_heavy", name: "Fucile a Pompa Pesante", category: "shotgun", archetype: "standard", rarity: "rara", special: { type: "ignoreShield", n: 1 }, description: "Perfora corazze da vicino.", role: "shotgun perforante" },
    { id: "shotgun_drum", name: "Fucile a Tamburo", category: "shotgun", archetype: "standard", rarity: "rara", special: { type: "rerollOnes" }, description: "Cadenza affidabile.", role: "shotgun affidabile" },
    { id: "shotgun_war_auto", name: "Fucile Automatico da Guerra", category: "shotgun", archetype: "oneshot", rarity: "rara", special: { type: "none" }, description: "Colpo singolo di fascia rara.", role: "shotgun a colpo singolo, fascia rara" },
    { id: "shotgun_dragon", name: "Fucile del Drago", category: "shotgun", archetype: "standard", rarity: "epica", special: { type: "ignoreShield", n: 1 }, description: "Brucia le difese nemiche.", role: "shotgun perforante, fascia epica" },
    { id: "shotgun_annihilator", name: "Fucile dell'Annientatore", category: "shotgun", archetype: "standard", rarity: "leggendaria", special: { type: "ignoreShield", n: 1 }, description: "La shotgun definitiva.", role: "shotgun definitiva" },

    // --- SMG (10): standard 2 dadi / compact 1 dado ---
    { id: "smg_base", name: "Mitraglietta Base", category: "smg", archetype: "standard", rarity: "comune", special: { type: "rerollOnes" }, description: "Affidabile fin da subito.", role: "SMG baseline affidabile" },
    { id: "smg_compact", name: "Mitraglietta Compatta", category: "smg", archetype: "compact", rarity: "comune", special: { type: "none" }, description: "Leggera, un dado solo.", role: "SMG entry-level a dado singolo" },
    { id: "smg_tactical", name: "Mitraglietta Tattica", category: "smg", archetype: "standard", rarity: "non-comune", special: { type: "none" }, description: "Standard potenziata.", role: "SMG standard, tappa intermedia" },
    { id: "smg_suppressed", name: "Mitraglietta Silenziata", category: "smg", archetype: "standard", rarity: "non-comune", special: { type: "silent" }, description: "Non fa rumore.", role: "SMG furtiva" },
    { id: "smg_combat", name: "Mitraglietta da Combattimento", category: "smg", archetype: "compact", rarity: "non-comune", special: { type: "none" }, description: "Compatta potenziata.", role: "SMG a dado singolo, tappa intermedia" },
    { id: "smg_burst", name: "Mitraglietta a Raffica", category: "smg", archetype: "standard", rarity: "rara", special: { type: "rerollOnes" }, description: "Cadenza rara e affidabile.", role: "SMG affidabile, fascia rara" },
    { id: "smg_rapid", name: "Mitraglietta Rapida", category: "smg", archetype: "compact", rarity: "rara", special: { type: "rerollOnes" }, description: "Compatta e affidabile.", role: "SMG a dado singolo, affidabile" },
    { id: "smg_stinger", name: "Mitraglietta Pungiglione", category: "smg", archetype: "standard", rarity: "epica", special: { type: "rerollOnes" }, description: "Cadenza epica.", role: "SMG affidabile, fascia epica" },
    { id: "smg_herald", name: "Mitraglietta dell'Araldo", category: "smg", archetype: "compact", rarity: "epica", special: { type: "critOnSix" }, description: "Compatta ad alto rischio.", role: "SMG a dado singolo, alto rischio" },
    { id: "smg_hyper", name: "Mitraglietta Iperveloce", category: "smg", archetype: "standard", rarity: "leggendaria", special: { type: "rerollOnes" }, description: "L'SMG definitiva.", role: "SMG definitiva" },

    // --- Pistole e revolver (10): standard 1 dado / revolver 1 dado ap+1 / dualwield 2 dadi vicino ---
    { id: "pistol_base", name: "Pistola Base", category: "pistola", archetype: "standard", rarity: "comune", special: { type: "none" }, description: "L'arma secondaria di partenza.", role: "pistola baseline" },
    { id: "pistol_suppressed", name: "Pistola Silenziata", category: "pistola", archetype: "standard", rarity: "comune", special: { type: "silent" }, description: "Discreta fin da subito.", role: "pistola furtiva" },
    { id: "pistol_revolver", name: "Revolver", category: "pistola", archetype: "revolver", rarity: "comune", special: { type: "none" }, description: "Colpo più corposo della pistola base.", role: "revolver baseline" },
    { id: "pistol_tactical", name: "Pistola Tattica", category: "pistola", archetype: "standard", rarity: "non-comune", special: { type: "ignoreShield", n: 1 }, description: "Munizioni perforanti.", role: "pistola perforante" },
    { id: "pistol_revolver_scope", name: "Revolver a Mirino", category: "pistola", archetype: "revolver", rarity: "non-comune", special: { type: "critOnSix" }, description: "Revolver di precisione.", role: "revolver preciso, tappa intermedia" },
    { id: "pistol_combat", name: "Pistola da Combattimento", category: "pistola", archetype: "standard", rarity: "non-comune", special: { type: "none" }, description: "Standard potenziata.", role: "pistola standard, tappa intermedia" },
    { id: "pistol_dual", name: "Doppia Pistola", category: "pistola", archetype: "dualwield", rarity: "rara", special: { type: "rerollOnes" }, description: "Due pistole, ravvicinato.", role: "pistola dual-wield ravvicinata" },
    { id: "pistol_sixshooter", name: "Sei Colpi", category: "pistola", archetype: "revolver", rarity: "rara", special: { type: "critOnSix" }, description: "Revolver raro e preciso.", role: "revolver preciso, fascia rara" },
    { id: "pistol_handcannon", name: "Cannone da Mano", category: "pistola", archetype: "revolver", rarity: "epica", special: { type: "ignoreShield", n: 2 }, description: "Perfora corazze pesanti.", role: "revolver perforante, fascia epica" },
    { id: "pistol_outlaw", name: "Pistola del Fuorilegge", category: "pistola", archetype: "revolver", rarity: "leggendaria", special: { type: "ignoreShield", n: 2 }, description: "Il colpo che decide tutto.", role: "revolver definitivo" },

    // --- Cecchini (10): bolt 1 dado ap+2 / semiauto 2 dadi ap+0 ---
    { id: "sniper_bolt_base", name: "Fucile di Precisione a Otturatore", category: "cecchino", archetype: "bolt", rarity: "comune", special: { type: "critOnSix" }, description: "Alto rischio, alta resa.", role: "cecchino baseline ad alto rischio" },
    { id: "sniper_hunting", name: "Fucile da Caccia", category: "cecchino", archetype: "bolt", rarity: "comune", special: { type: "none" }, description: "Semplice, un colpo alla volta.", role: "cecchino entry-level" },
    { id: "sniper_semiauto_base", name: "Fucile di Precisione Semi-Automatico", category: "cecchino", archetype: "semiauto", rarity: "non-comune", special: { type: "none" }, equivalentGroup: "sniper-semiauto-equivalent-a", description: "Più dadi, meno picco.", role: "cecchino semi-automatico, affidabile" },
    { id: "sniper_suppressed", name: "Fucile da Cecchino Silenziato", category: "cecchino", archetype: "bolt", rarity: "non-comune", special: { type: "silent" }, description: "Furtivo ad alto rischio.", role: "cecchino furtivo" },
    { id: "sniper_scout", name: "Fucile dell'Esploratore", category: "cecchino", archetype: "semiauto", rarity: "non-comune", special: { type: "none" }, equivalentGroup: "sniper-semiauto-equivalent-a", description: "Variante del semi-automatico.", role: "cecchino semi-automatico (reskin)" },
    { id: "sniper_heavy", name: "Fucile da Cecchino Pesante", category: "cecchino", archetype: "bolt", rarity: "rara", special: { type: "ignoreShield", n: 1 }, description: "Perfora corazze da lontano.", role: "cecchino perforante" },
    { id: "sniper_auto", name: "Fucile da Cecchino Automatico", category: "cecchino", archetype: "semiauto", rarity: "rara", special: { type: "rerollOnes" }, description: "Semi-automatico affidabile.", role: "cecchino semi-automatico, fascia rara" },
    { id: "sniper_cobra", name: "Fucile del Cobra", category: "cecchino", archetype: "bolt", rarity: "epica", special: { type: "critOnSix" }, description: "Rischio epico.", role: "cecchino ad alto rischio, fascia epica" },
    { id: "sniper_avenger", name: "Fucile del Vendicatore", category: "cecchino", archetype: "semiauto", rarity: "epica", special: { type: "ignoreShield", n: 1 }, description: "Semi-automatico perforante.", role: "cecchino semi-automatico perforante" },
    { id: "sniper_reaper", name: "Fucile del Mietitore", category: "cecchino", archetype: "bolt", rarity: "leggendaria", special: { type: "critOnSix" }, description: "Il cecchino definitivo.", role: "cecchino definitivo" },

    // --- DMR (6): 2 dadi lontano ap+1 ---
    { id: "dmr_base", name: "Fucile di Marcatura Base", category: "dmr", archetype: "standard", rarity: "comune", special: { type: "none" }, description: "Il cecchino più flessibile.", role: "DMR baseline" },
    { id: "dmr_thermal", name: "Fucile Termico", category: "dmr", archetype: "standard", rarity: "non-comune", special: { type: "ignoreShield", n: 1 }, description: "Perforante di fascia intermedia.", role: "DMR perforante" },
    { id: "dmr_tactical", name: "Fucile Tattico di Precisione", category: "dmr", archetype: "standard", rarity: "rara", special: { type: "none" }, description: "Solido, senza sorprese.", role: "DMR rara pura" },
    { id: "dmr_huntress", name: "Fucile della Cacciatrice", category: "dmr", archetype: "standard", rarity: "epica", special: { type: "rerollOnes" }, description: "Cadenza affidabile.", role: "DMR affidabile, fascia epica" },
    { id: "dmr_steadyeye", name: "Fucile Sguardo Fermo", category: "dmr", archetype: "standard", rarity: "epica", special: { type: "ignoreShield", n: 1 }, description: "Perforante di fascia epica.", role: "DMR perforante, fascia epica" },
    { id: "dmr_blackmark", name: "Fucile del Marchio Nero", category: "dmr", archetype: "standard", rarity: "leggendaria", special: { type: "critOnSix" }, description: "Il DMR definitivo.", role: "DMR definitivo" },

    // --- Archi e balestre (6): 1 dado medio ---
    { id: "bow_base", name: "Balestra Base", category: "arco", archetype: "standard", rarity: "comune", special: { type: "none" }, equivalentGroup: "bow-standard-equivalent-a", description: "Semplice e silenziosa di natura.", role: "arco baseline" },
    { id: "bow_love", name: "Balestra dell'Amore", category: "arco", archetype: "standard", rarity: "comune", special: { type: "none" }, equivalentGroup: "bow-standard-equivalent-a", description: "Variante scherzosa della balestra base.", role: "arco baseline (reskin)" },
    { id: "bow_hunting", name: "Balestra da Caccia", category: "arco", archetype: "standard", rarity: "non-comune", special: { type: "silent" }, description: "Discreta a caccia.", role: "arco furtivo" },
    { id: "bow_mechanical", name: "Arco Meccanico", category: "arco", archetype: "standard", rarity: "rara", special: { type: "none" }, description: "Solido, fascia rara.", role: "arco rara pura" },
    { id: "bow_primal", name: "Arco Primordiale", category: "arco", archetype: "standard", rarity: "rara", special: { type: "silent" }, description: "Furtivo, fascia rara.", role: "arco furtivo, fascia rara" },
    { id: "bow_explosive", name: "Arco Esplosivo", category: "arco", archetype: "standard", rarity: "epica", special: { type: "areaDamage" }, description: "Frecce che colpiscono più bersagli.", role: "ibrido arco/esplosivo" },

    // --- Lanciarazzi ed esplosivi (8): 1 dado medio, quasi tutte areaDamage ---
    { id: "explosive_dynamite", name: "Bastone di Dinamite", category: "esplosivo", archetype: "standard", rarity: "comune", special: { type: "none" }, description: "Esplosivo semplice, un solo bersaglio.", role: "esplosivo entry-level senza area" },
    { id: "explosive_mine", name: "Mina di Prossimità", category: "esplosivo", archetype: "standard", rarity: "comune", special: { type: "areaDamage" }, equivalentGroup: "explosive-standard-equivalent-a", description: "Prima area accessibile.", role: "esplosivo anti-gruppo baseline" },
    { id: "explosive_grenade", name: "Granata a Mano", category: "esplosivo", archetype: "standard", rarity: "comune", special: { type: "areaDamage" }, equivalentGroup: "explosive-standard-equivalent-a", description: "Variante della mina di prossimità.", role: "esplosivo anti-gruppo (reskin)" },
    { id: "explosive_launcher", name: "Lanciagranate", category: "esplosivo", archetype: "standard", rarity: "non-comune", special: { type: "areaDamage" }, description: "Standard anti-gruppo.", role: "esplosivo anti-gruppo, tappa intermedia" },
    { id: "explosive_rocket", name: "Lanciarazzi", category: "esplosivo", archetype: "standard", rarity: "rara", special: { type: "areaDamage" }, description: "Anti-gruppo di fascia rara.", role: "esplosivo anti-gruppo, fascia rara" },
    { id: "explosive_proximity", name: "Lanciagranate a Prossimità", category: "esplosivo", archetype: "standard", rarity: "rara", special: { type: "ignoreShield", n: 1 }, description: "Esplode a contatto, ignora la corazza leggera.", role: "esplosivo perforante a colpo singolo" },
    { id: "explosive_cluster", name: "Lanciagranate a Grappolo", category: "esplosivo", archetype: "standard", rarity: "epica", special: { type: "areaDamage" }, description: "Anti-gruppo di fascia epica.", role: "esplosivo anti-gruppo, fascia epica" },
    { id: "explosive_guided", name: "Missile Guidato", category: "esplosivo", archetype: "standard", rarity: "leggendaria", special: { type: "areaDamage" }, description: "L'anti-gruppo definitivo.", role: "esplosivo anti-gruppo definitivo" },

    // --- Armi pesanti (6): 2 dadi medio ap+1 ---
    { id: "heavy_drum", name: "Fucile a Tamburo Pesante", category: "pesante", archetype: "standard", rarity: "non-comune", special: { type: "none" }, description: "Baseline della categoria.", role: "pesante baseline" },
    { id: "heavy_lmg", name: "Mitragliatrice Leggera", category: "pesante", archetype: "standard", rarity: "rara", special: { type: "rerollOnes" }, description: "Affidabile, fascia rara.", role: "pesante affidabile" },
    { id: "heavy_minigun", name: "Minigun", category: "pesante", archetype: "standard", rarity: "epica", special: { type: "suppress" }, description: "Aiuta il prossimo alleato a colpire meglio.", role: "pesante da supporto squadra" },
    { id: "heavy_flamethrower", name: "Lanciafiamme Sperimentale", category: "pesante", archetype: "standard", rarity: "epica", special: { type: "areaDamage" }, description: "Brucia più nemici insieme.", role: "pesante anti-gruppo" },
    { id: "heavy_plasma", name: "Cannone al Plasma", category: "pesante", archetype: "standard", rarity: "leggendaria", special: { type: "ignoreShield", n: 2 }, description: "Perforante definitivo.", role: "pesante perforante definitivo" },
    { id: "heavy_railgun", name: "Fucile a Rotaia", category: "pesante", archetype: "standard", rarity: "leggendaria", special: { type: "critOnSix" }, description: "Precisione pesante.", role: "pesante di precisione" },

    // --- Mischia (8): 2 dadi vicino ---
    { id: "melee_shortsword", name: "Spada Corta", category: "mischia", archetype: "standard", rarity: "comune", special: { type: "none" }, description: "L'arma da mischia di partenza.", role: "mischia baseline" },
    { id: "melee_axe", name: "Ascia da Battaglia", category: "mischia", archetype: "standard", rarity: "comune", special: { type: "ignoreShield", n: 1 }, description: "Prima arma perforante.", role: "mischia perforante, entry-level" },
    { id: "melee_mace", name: "Mazza Chiodata", category: "mischia", archetype: "standard", rarity: "non-comune", special: { type: "ignoreShield", n: 1 }, description: "Perforante potenziata.", role: "mischia perforante, tappa intermedia" },
    { id: "melee_curvedblade", name: "Lama Ricurva", category: "mischia", archetype: "standard", rarity: "rara", special: { type: "critOnSix" }, description: "Precisa e tagliente.", role: "mischia precisa, fascia rara" },
    { id: "melee_warhammer", name: "Martello da Guerra", category: "mischia", archetype: "standard", rarity: "rara", special: { type: "ignoreShield", n: 2 }, description: "Schiaccia gli scudi.", role: "mischia perforante pesante, fascia rara" },
    { id: "melee_steelclaws", name: "Artigli d'Acciaio", category: "mischia", archetype: "standard", rarity: "rara", special: { type: "rerollOnes" }, description: "Colpi multipli, sempre affidabili.", role: "mischia affidabile, fascia rara" },
    { id: "melee_darkscythe", name: "Falce Oscura", category: "mischia", archetype: "standard", rarity: "epica", special: { type: "ignoreShield", n: 2 }, description: "Perforante di fascia epica.", role: "mischia perforante pesante, fascia epica" },
    { id: "melee_endless", name: "Lama Senza Fine", category: "mischia", archetype: "standard", rarity: "leggendaria", special: { type: "ignoreShield", n: 2 }, description: "L'arma da mischia definitiva.", role: "mischia definitiva" },

    // --- Armi a energia (6): sperimentale, ogni arma il proprio archetipo ---
    { id: "energy_raygun", name: "Pistola a Raggi", category: "energia", archetype: "sidearm", rarity: "comune", special: { type: "none" }, description: "Sidearm energetica di base.", role: "energia sidearm baseline" },
    { id: "energy_pulse", name: "Fucile a Impulsi", category: "energia", archetype: "rifle", rarity: "non-comune", special: { type: "none" }, description: "Standard energetico.", role: "energia rifle baseline" },
    { id: "energy_pulseburst", name: "Fucile a Raffica ad Impulsi", category: "energia", archetype: "rifle", rarity: "rara", special: { type: "rerollOnes" }, description: "Cadenza affidabile.", role: "energia rifle affidabile" },
    { id: "energy_recon_laser", name: "Fucile Laser da Ricognizione", category: "energia", archetype: "sniper", rarity: "rara", special: { type: "critOnSix" }, description: "Laser da lungo raggio.", role: "energia sniper, fascia rara" },
    { id: "energy_photon", name: "Fucile Fotonico", category: "energia", archetype: "sniper", rarity: "epica", special: { type: "critOnSix" }, description: "Precisione epica a energia.", role: "energia sniper, fascia epica" },
    { id: "energy_arcannon", name: "Cannone ad Arco Elettrico", category: "energia", archetype: "arc", rarity: "leggendaria", special: { type: "areaDamage" }, description: "L'arco elettrico salta tra i nemici.", role: "energia anti-gruppo definitivo" },

    // --- Esotiche e mitiche (4): pezzi unici del mondo di Fortress Army ---
    { id: "exotic_executioner_bolt", name: "Il Fulmine del Boia", category: "esotica", archetype: "melee", rarity: "mitica", special: { type: "chainStrike" }, description: "Colpisce anche un secondo nemico vicino.", role: "mitica anti-2-bersagli ravvicinata" },
    { id: "exotic_buried_king", name: "La Lama del Re Sepolto", category: "esotica", archetype: "melee", rarity: "mitica", special: { type: "executionerStrike" }, description: "Devastante contro un nemico già ferito.", role: "mitica melee da colpo di grazia" },
    { id: "exotic_siege_cry", name: "Il Grido dell'Assedio", category: "esotica", archetype: "siege", rarity: "mitica", special: { type: "areaDamage" }, description: "Area d'effetto da lunga distanza.", role: "mitica ad area da lungo raggio" },
    { id: "exotic_last_whisper", name: "L'Ultimo Sussurro", category: "esotica", archetype: "ghost", rarity: "mitica", special: { type: "silentKill" }, description: "Un'uccisione silenziosa non richiama nessuno.", role: "mitica utility, uccisione silenziosa" }
  ];

  /* ---- Validazione a caricamento: avvisi in console, non blocca l'app ---- */
  function validateCatalog(list) {
    const problems = [];
    const seenIds = new Set();
    const seenNames = new Set();
    list.forEach((w, i) => {
      const where = `#${i + 1} (${w.id || "senza id"})`;
      if (!w.id || seenIds.has(w.id)) problems.push(`${where}: id mancante o duplicato`);
      seenIds.add(w.id);
      if (!w.name || seenNames.has(w.name)) problems.push(`${where}: nome mancante o duplicato`);
      seenNames.add(w.name);
      if (!ARCHETYPES[w.category]) problems.push(`${where}: category sconosciuta "${w.category}"`);
      else if (!ARCHETYPES[w.category][w.archetype]) problems.push(`${where}: archetype "${w.archetype}" non valido per ${w.category}`);
      if (RARITY_BONUS[w.rarity] === undefined) problems.push(`${where}: rarity sconosciuta "${w.rarity}"`);
      if (!w.special || SPECIAL_TYPES.indexOf(w.special.type) === -1) problems.push(`${where}: special non valido`);
      if (w.equivalentGroup) {
        const idx = RARITY_ORDER.indexOf(w.rarity);
        if (idx > RARITY_ORDER.indexOf("non-comune")) problems.push(`${where}: equivalentGroup non ammesso su rarità ${w.rarity}`);
      }
      if ("power" in w || "specialValue" in w || "potenza" in w || "baseDice" in w || "range" in w) {
        problems.push(`${where}: campo derivato scritto a mano nel dato grezzo`);
      }
    });
    return problems;
  }

  const catalogProblems = validateCatalog(ARMI_100);
  if (catalogProblems.length && typeof console !== "undefined") {
    console.warn("[Fortress Army] Catalogo armi: " + catalogProblems.length + " problemi:\n" + catalogProblems.join("\n"));
  }

  /* ---- Vista "pronta all'uso": stessi 100 oggetti + i campi calcolati.
     Non è una seconda fonte di verità: è una mappa 1:1 su ARMI_100. ---- */
  const ARMI = ARMI_100.map((w) => Object.freeze(Object.assign({}, w, {
    baseDice: getBaseDice(w),
    range: getRange(w),
    power: computePower(w),
    specialValue: computeSpecialValue(w),
    potenza: computePotenza(w),
    image: getImage(w)
  })));

  return {
    ARMI_100, ARMI, CATEGORIE_ARMI, ARCHETYPES, RARITY_BONUS, RARITY_ORDER, SPECIAL_TYPES,
    getArchetype, getRange, getBaseDice, getImage, computePower, computeSpecialValue, computePotenza,
    validateCatalog, catalogProblems
  };
});
