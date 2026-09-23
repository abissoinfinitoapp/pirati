const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("../catalog/fortress-armi.js");
const combat = require("../engine/fortress-combat.js");

test("il catalogo ha esattamente 100 armi", () => {
  assert.equal(catalog.ARMI.length, 100);
  assert.equal(catalog.ARMI_100.length, 100);
});

test("100 id univoci", () => {
  const ids = catalog.ARMI.map((w) => w.id);
  assert.equal(new Set(ids).size, 100);
});

test("100 nomi validi e univoci", () => {
  const names = catalog.ARMI.map((w) => w.name);
  names.forEach((n) => assert.ok(n && n.trim().length > 0));
  assert.equal(new Set(names).size, 100);
});

test("nessun problema di validazione rilevato a caricamento", () => {
  assert.deepEqual(catalog.catalogProblems, []);
});

test("category e archetype sempre validi tra loro", () => {
  catalog.ARMI.forEach((w) => {
    assert.ok(catalog.ARCHETYPES[w.category], `category sconosciuta: ${w.category}`);
    assert.ok(catalog.ARCHETYPES[w.category][w.archetype], `archetype invalido: ${w.category}/${w.archetype}`);
  });
});

test("rarity sempre valida", () => {
  catalog.ARMI.forEach((w) => assert.ok(catalog.RARITY_BONUS[w.rarity] !== undefined, w.id));
});

test("special sempre valido", () => {
  catalog.ARMI.forEach((w) => assert.ok(catalog.SPECIAL_TYPES.indexOf(w.special.type) !== -1, w.id));
});

test("tutte le POTENZE sono calcolabili e sono numeri interi", () => {
  catalog.ARMI.forEach((w) => {
    assert.equal(typeof w.potenza, "number");
    assert.ok(Number.isInteger(w.potenza));
    assert.ok(w.potenza > 0);
  });
});

test("nessun power o specialValue scritto a mano nel dato grezzo", () => {
  catalog.ARMI_100.forEach((w) => {
    assert.equal("power" in w, false, w.id);
    assert.equal("specialValue" in w, false, w.id);
    assert.equal("potenza" in w, false, w.id);
    assert.equal("baseDice" in w, false, w.id);
    assert.equal("range" in w, false, w.id);
  });
});

test("power deriva sempre da rarityBonus + archetypeBonus (mai un'eccezione manuale)", () => {
  catalog.ARMI.forEach((w) => {
    const arch = catalog.getArchetype(w.category, w.archetype);
    const expected = catalog.RARITY_BONUS[w.rarity] + arch.bonus;
    assert.equal(w.power, expected, w.id);
  });
});

test("baseDice non è mai 3 nel catalogo statico (il 3 nasce solo a runtime dai modificatori)", () => {
  catalog.ARMI.forEach((w) => assert.ok(w.baseDice === 1 || w.baseDice === 2, w.id));
});

test("nessun equivalentGroup su Rara/Epica/Leggendaria/Mitica", () => {
  const highTiers = ["rara", "epica", "leggendaria", "mitica"];
  catalog.ARMI.forEach((w) => {
    if (w.equivalentGroup) assert.equal(highTiers.includes(w.rarity), false, `${w.id} (${w.rarity}) ha un equivalentGroup`);
  });
});

test("nessuna coppia di armi Rara+ è statisticamente duplicata (stesso archetipo+special)", () => {
  const highTiers = ["rara", "epica", "leggendaria", "mitica"];
  const seen = new Map();
  catalog.ARMI.filter((w) => highTiers.includes(w.rarity)).forEach((w) => {
    const sig = [w.category, w.archetype, w.rarity, w.special.type, w.special.n || ""].join("|");
    assert.ok(!seen.has(sig), `duplicato: ${w.id} vs ${seen.get(sig)} (${sig})`);
    seen.set(sig, w.id);
  });
});

test("monotonicità: a parità di category+archetype, la POTENZA massima non decresce salendo di rarità", () => {
  const groups = {};
  catalog.ARMI.forEach((w) => {
    const key = w.category + "/" + w.archetype;
    (groups[key] = groups[key] || []).push(w);
  });
  Object.entries(groups).forEach(([key, items]) => {
    const maxByRarity = {};
    items.forEach((w) => { maxByRarity[w.rarity] = Math.max(maxByRarity[w.rarity] || 0, w.potenza); });
    const present = catalog.RARITY_ORDER.filter((r) => maxByRarity[r] !== undefined);
    for (let i = 1; i < present.length; i++) {
      assert.ok(
        maxByRarity[present[i]] >= maxByRarity[present[i - 1]],
        `${key}: ${present[i - 1]}=${maxByRarity[present[i - 1]]} > ${present[i]}=${maxByRarity[present[i]]}`
      );
    }
  });
});

test("un'arma equipaggiata dalla vista window.FORTRESS_ARMI mostra power/nome corretti (mai undefined)", () => {
  // Riproduce esattamente il percorso di fortress-army.js:
  //   const ARMI = window.FORTRESS_ARMI || [];
  //   const arma = (id) => ARMI.find((a) => a.id === id);
  //   const w = arma(state.equippedWeaponId);
  //   `${w.name} (+${w.power})`
  const arma = (id) => catalog.ARMI.find((a) => a.id === id);

  const w = arma("assault_smith"); // Fucile del Fabbro, leggendaria: power atteso 4+2(critOnSix baseDice2)=... verifichiamo dal catalogo stesso
  assert.ok(w, "l'arma di test deve esistere nel catalogo");
  assert.equal(typeof w.power, "number");
  assert.ok(!Number.isNaN(w.power));
  assert.equal(w.name, "Fucile del Fabbro");

  const testoEquipaggiata = `${w.name} (+${w.power})`;
  assert.equal(testoEquipaggiata.includes("undefined"), false);
  assert.equal(testoEquipaggiata, "Fucile del Fabbro (+4)");

  // e per un'arma senza equip (id inesistente), il ramo "Nessuna" di fortress-army.js
  // non deve mai arrivare a leggere .power su null
  const nessuna = arma("id-che-non-esiste");
  assert.equal(nessuna, undefined);
});

test("le 4 Mitiche non dominano tutte le distanze: alla gittata opposta alla loro, una leggendaria fa più danno", () => {
  // danno atteso medio (senza critOnSix/rerollOnes, per un confronto lineare) a una gittata data
  function dannoAtteso(weapon, encounterRange) {
    const dice = combat.computeDiceCount({
      baseDice: weapon.baseDice, weaponRange: weapon.range, encounterRange,
      isRangeless: weapon.special.type === "rangeless", aiuto: false, effectBonus: 0
    });
    return dice * 3.5 + weapon.power;
  }
  const opposti = { vicino: "lontano", lontano: "vicino" };
  const mitiche = catalog.ARMI.filter((w) => w.rarity === "mitica" && opposti[w.range]);
  const leggendarie = catalog.ARMI.filter((w) => w.rarity === "leggendaria");
  assert.ok(mitiche.length > 0, "servono mitiche con gittata Vicino/Lontano da testare");
  mitiche.forEach((m) => {
    const gittataOpposta = opposti[m.range];
    const dannoMiticaFuoriGittata = dannoAtteso(m, gittataOpposta);
    const megliorLeggendariaLi = Math.max(...leggendarie.map((l) => dannoAtteso(l, gittataOpposta)));
    assert.ok(
      megliorLeggendariaLi > dannoMiticaFuoriGittata,
      `${m.id} a ${gittataOpposta} (${dannoMiticaFuoriGittata}) dovrebbe essere superata da almeno una leggendaria (miglior risultato: ${megliorLeggendariaLi})`
    );
  });
});
