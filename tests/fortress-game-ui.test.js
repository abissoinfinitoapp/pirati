const test = require("node:test");
const assert = require("node:assert/strict");
const {
  pickAutoTarget, pickAutoWeaponSlot, getEquippedWeaponSlots, resolvePreferredWeaponSlot, buildInitialAttackFlow, buildAttackFlowFromSelectedSlot, getStartingWeaponChoices, getActionHubMode, shouldUseActionHub, buildCombatResultView
} = require("../fortress-game-ui.js");

/* Guided Turn UI: "salta la schermata di scelta se non c'è davvero una
   scelta da fare". Queste due funzioni sono pure (nessun DOM, nessun
   Director/loop): ricevono solo dati già filtrati dal chiamante e decidono
   se serve un tap in più al bambino. Nessuna regola di gioco qui — solo
   "quanti elementi ci sono". */

test("pickAutoTarget: un solo bersaglio -> selezionato subito", () => {
  const targets = [{ kind: "enemy", id: "e1", hp: 5, maxHp: 10 }];
  assert.deepEqual(pickAutoTarget(targets), targets[0]);
});

test("pickAutoTarget: più bersagli -> nessuna auto-selezione, serve la scelta", () => {
  const targets = [
    { kind: "enemy", id: "e1", hp: 5, maxHp: 10 },
    { kind: "enemy", id: "e2", hp: 8, maxHp: 10 }
  ];
  assert.equal(pickAutoTarget(targets), null);
});

test("pickAutoTarget: nessun bersaglio -> null (nessun crash)", () => {
  assert.equal(pickAutoTarget([]), null);
  assert.equal(pickAutoTarget(null), null);
  assert.equal(pickAutoTarget(undefined), null);
});

test("pickAutoWeaponSlot: una sola arma equipaggiata -> quello slot", () => {
  const equipment = { primary: { id: "w1" }, secondary: null, cura: null, scudo: null, utility: null };
  assert.equal(pickAutoWeaponSlot(equipment), "primary");
});

test("pickAutoWeaponSlot: solo secondary equipaggiata -> secondary", () => {
  const equipment = { primary: null, secondary: { id: "w2" } };
  assert.equal(pickAutoWeaponSlot(equipment), "secondary");
});

test("pickAutoWeaponSlot: due armi equipaggiate -> null, serve la scelta", () => {
  const equipment = { primary: { id: "w1" }, secondary: { id: "w2" } };
  assert.equal(pickAutoWeaponSlot(equipment), null);
});

test("pickAutoWeaponSlot: nessuna arma equipaggiata -> null", () => {
  assert.equal(pickAutoWeaponSlot({ primary: null, secondary: null }), null);
  assert.equal(pickAutoWeaponSlot(null), null);
});


test("resolvePreferredWeaponSlot: usa la preferenza se valida, altrimenti ripiega su Primary", () => {
  const equipment = { primary: { id: "w1" }, secondary: { id: "w2" } };
  assert.deepEqual(getEquippedWeaponSlots(equipment), ["primary", "secondary"]);
  assert.equal(resolvePreferredWeaponSlot(equipment, "secondary"), "secondary");
  assert.equal(resolvePreferredWeaponSlot(equipment, "missing"), "primary");
});

test("Action Hub: ATTACCA usa direttamente l'arma attiva invece di far sembrare che spari con entrambe", () => {
  const primary = { id: "short", range: "vicino" };
  const secondary = { id: "long", range: "lontano" };
  const equipment = { primary, secondary };
  const flow = buildAttackFlowFromSelectedSlot(equipment, [{ kind: "enemy", id: "e1" }], "secondary");
  assert.equal(flow.step, "preview");
  assert.equal(flow.weaponSlot, "secondary");
  assert.equal(flow.weapon, secondary);
  assert.equal(flow.targetId, "e1");
});


test("attacco: con due armi si sceglie PRIMA l'arma anche se c'e un solo bersaglio", () => {
  const equipment = { primary: { id: "short", range: "vicino" }, secondary: { id: "long", range: "lontano" } };
  const flow = buildInitialAttackFlow(equipment, [{ kind: "enemy", id: "e1" }]);
  assert.deepEqual(flow, { step: "weapon" });
});

test("attacco: con una sola arma e piu bersagli l'arma e gia nota quando si sceglie il target", () => {
  const weapon = { id: "short", range: "vicino" };
  const equipment = { primary: weapon, secondary: null };
  const flow = buildInitialAttackFlow(equipment, [{ kind: "enemy", id: "e1" }, { kind: "enemy", id: "e2" }]);
  assert.equal(flow.step, "target");
  assert.equal(flow.weapon, weapon);
});

test("attacco: una sola arma e un solo bersaglio saltano entrambe le scelte inutili", () => {
  const weapon = { id: "w1" };
  const flow = buildInitialAttackFlow({ primary: weapon, secondary: null }, [{ kind: "enemy", id: "e1" }]);
  assert.equal(flow.step, "preview");
  assert.equal(flow.weapon, weapon);
  assert.equal(flow.targetId, "e1");
});

test("loadout iniziale: starter sempre disponibile + sole armi sbloccate valide", () => {
  const catalog = [{ id: "assault_base" }, { id: "w1" }, { id: "w2" }];
  const choices = getStartingWeaponChoices(catalog, "assault_base", ["w2", "missing", "assault_base"]);
  assert.deepEqual(choices.map((w) => w.id), ["assault_base", "w2"]);
});

test("loadout iniziale: senza sblocchi rimane solo lo starter", () => {
  const catalog = [{ id: "assault_base" }, { id: "w1" }];
  assert.deepEqual(getStartingWeaponChoices(catalog, "assault_base", []).map((w) => w.id), ["assault_base"]);
});


test("result UI nemico: chiarisce chi subisce il danno e nasconde Scudo 0 -> 0", () => {
  const view = buildCombatResultView({
    actorType: "enemy", attackerName: "Normale", targetName: "Giocatore 1",
    total: 8, shieldBefore: 0, shieldAfter: 0, ignoreShieldN: 0
  });
  assert.equal(view.heading, "NORMALE ATTACCA GIOCATORE 1");
  assert.equal(view.rollLabel, "TIRO DEL NEMICO");
  assert.equal(view.powerLabel, "POWER NEMICO");
  assert.equal(view.damageLabel, "GIOCATORE 1 SUBISCE 8 DANNI");
  assert.equal(view.healthLabel, "❤️ Salute Giocatore 1");
  assert.equal(view.showShield, false);
});

test("result UI giocatore: usa HAI INFLITTO e mostra lo scudo quando assorbe danno", () => {
  const view = buildCombatResultView({
    actorType: "player", attackerName: "Mattia", targetName: "Resistente",
    total: 11, shieldBefore: 5, shieldAfter: 0, ignoreShieldN: 0
  });
  assert.equal(view.heading, "MATTIA ATTACCA RESISTENTE");
  assert.equal(view.rollLabel, "I TUOI DADI");
  assert.equal(view.powerLabel, "POWER ARMA");
  assert.equal(view.damageLabel, "HAI INFLITTO 11 DANNI");
  assert.equal(view.shieldLabel, "🛡️ Scudo Resistente");
  assert.equal(view.showShield, true);
});

test("result UI perforante: mostra lo scudo invariato se il danno lo ha ignorato", () => {
  const view = buildCombatResultView({
    actorType: "player", attackerName: "Bob", targetName: "Elite",
    total: 6, shieldBefore: 5, shieldAfter: 5, ignoreShieldN: 1
  });
  assert.equal(view.showShield, true);
});

test("result UI boss: distingue il tiro del Boss", () => {
  const view = buildCombatResultView({
    actorType: "boss", attackerName: "Boss", targetName: "Carla",
    total: 9, shieldBefore: 3, shieldAfter: 0, ignoreShieldN: 0
  });
  assert.equal(view.heading, "BOSS ATTACCA CARLA");
  assert.equal(view.rollLabel, "TIRO DEL BOSS");
  assert.equal(view.damageLabel, "CARLA SUBISCE 9 DANNI");
});


test("Action Hub: attacco e cassa sostituiscono la lista azioni nello stesso centro decisionale", () => {
  assert.equal(getActionHubMode({ attackFlow: { step: "weapon" }, chestResult: { weapon: {} } }), "attack");
  assert.equal(getActionHubMode({ attackFlow: null, chestResult: { weapon: {} } }), "chest");
  assert.equal(getActionHubMode({ attackFlow: null, chestResult: null }), "actions");
});

test("Action Hub: attivo solo nel Node Graph durante il turno giocatore", () => {
  assert.equal(shouldUseActionHub({ magnifyMode: true, nodeId: "forest-n01", directorPhase: "player-turn", moveMode: false, scannerMode: false }), true);
  assert.equal(shouldUseActionHub({ magnifyMode: false, nodeId: "forest-n01", directorPhase: "player-turn", moveMode: false, scannerMode: false }), false);
  assert.equal(shouldUseActionHub({ magnifyMode: true, nodeId: null, directorPhase: "player-turn", moveMode: false, scannerMode: false }), false);
  assert.equal(shouldUseActionHub({ magnifyMode: true, nodeId: "forest-n01", directorPhase: "enemy-phase", moveMode: false, scannerMode: false }), false);
});

test("Action Hub: SPOSTATI e Scanner lasciano il centro locale per la World Map", () => {
  const base = { magnifyMode: true, nodeId: "forest-n01", directorPhase: "player-turn" };
  assert.equal(shouldUseActionHub({ ...base, moveMode: true, scannerMode: false }), false);
  assert.equal(shouldUseActionHub({ ...base, moveMode: false, scannerMode: true }), false);
});
