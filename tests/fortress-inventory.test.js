const test = require("node:test");
const assert = require("node:assert/strict");
const loop = require("../engine/fortress-loop.js");
const loot = require("../engine/fortress-loot.js");
const arsenal = require("../engine/fortress-arsenal-core.js");
const armiCatalog = require("../catalog/fortress-armi.js");
const itemsCatalog = require("../catalog/fortress-items.js");

function makePlayers(n) {
  return Array.from({ length: n }, (_, i) => ({ id: "p" + (i + 1), name: "Giocatore " + (i + 1) }));
}
function newGame(n) {
  const state = loop.createGame({ players: makePlayers(n) });
  state.players.forEach((p) => { p.zoneId = null; });
  return state;
}
function landAll(state, zoneId) {
  state.players.forEach((p) => loop.landPlayer(state, p.id, zoneId, () => 0.99));
  // Isola i test di inventario dal loot ambientale generato dall'atterraggio
  // stesso (§7, sempre 1 per zona): qui vogliamo solo i fixture espliciti.
  loop.getZone(state, zoneId).groundLoot.length = 0;
}
function pushFixtureLoot(state, zoneId, entry) {
  loop.getZone(state, zoneId).groundLoot.push(entry);
  return entry;
}
function weapon(id) { return armiCatalog.ARMI.find((w) => w.id === id); }

/* =========================================================================
   PARTY — deriva sempre da zoneId+status, mai una struttura persistita
   ========================================================================= */

test("1 solo attivo nella zona -> isSolo, non in party", () => {
  const state = newGame(1);
  landAll(state, "e1");
  assert.equal(loop.isSolo(state, "p1"), true);
  assert.equal(loop.isInParty(state, "p1"), false);
  assert.equal(loop.getActivePartyMembers(state, "e1").length, 1);
});

test("2+ attivi nella stessa zona -> party", () => {
  const state = newGame(2);
  landAll(state, "e1");
  assert.equal(loop.isSolo(state, "p1"), false);
  assert.equal(loop.isInParty(state, "p1"), true);
  assert.equal(loop.getActivePartyMembers(state, "e1").length, 2);
});

test("il party si aggiorna quando un terzo entra nella zona", () => {
  const state = newGame(3);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e1", () => 0.99);
  loop.landPlayer(state, "p3", "e2", () => 0.99);
  loop.beginExploration(state, () => 0.99);
  assert.equal(loop.getActivePartyMembers(state, "e1").length, 2);
  loop.moveAction(state, "p3", "e1");
  assert.equal(loop.getActivePartyMembers(state, "e1").length, 3);
  assert.equal(loop.isInParty(state, "p3"), true);
});

test("il party si aggiorna quando qualcuno esce dalla zona", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.moveAction(state, "p1", "e2");
  assert.equal(loop.getActivePartyMembers(state, "e1").length, 1);
  assert.equal(loop.isSolo(state, "p2"), true);
});

test("un giocatore KO non conta come membro attivo del party ma resta fisicamente nella zona", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.setPlayerKO(state, loop.getPlayer(state, "p2"));
  assert.equal(loop.getActivePartyMembers(state, "e1").length, 1);
  assert.equal(loop.isSolo(state, "p1"), true);
  assert.equal(loop.getPlayer(state, "p2").zoneId, "e1", "il KO resta nella zona, non sparisce");
});

/* =========================================================================
   INVENTARIO — 2 slot arma, 1 Cura, 1 Scudo, 1 Utility. Sostituzione
   atomica: il nuovo entra, il vecchio (se presente) va SEMPRE a terra.
   ========================================================================= */

test("equipFoundWeapon: due slot arma (primary/secondary)", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");
  pushFixtureLoot(state, "e1", { kind: "weapon", weaponId: "melee_shortsword", instanceId: 1 });
  loop.equipFoundWeapon(state, "p1", "primary", 1, weapon("melee_shortsword"));
  assert.equal(p.equipment.primary.id, "melee_shortsword");

  pushFixtureLoot(state, "e1", { kind: "weapon", weaponId: "pistol_base", instanceId: 2 });
  loop.equipFoundWeapon(state, "p1", "secondary", 2, weapon("pistol_base"));
  assert.equal(p.equipment.secondary.id, "pistol_base");
});

test("una terza arma richiede sostituzione esplicita: la precedente va a terra, mai persa", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");
  pushFixtureLoot(state, "e1", { kind: "weapon", weaponId: "melee_shortsword", instanceId: 1 });
  loop.equipFoundWeapon(state, "p1", "primary", 1, weapon("melee_shortsword"));

  pushFixtureLoot(state, "e1", { kind: "weapon", weaponId: "bow_base", instanceId: 2 });
  loop.equipFoundWeapon(state, "p1", "primary", 2, weapon("bow_base")); // sostituzione esplicita
  assert.equal(p.equipment.primary.id, "bow_base");

  const zone = loop.getZone(state, "e1");
  const onGround = zone.groundLoot.find((g) => g.kind === "weapon" && g.weaponId === "melee_shortsword");
  assert.ok(onGround, "l'arma sostituita deve tornare a terra, mai distrutta silenziosamente");
});

test("lascia a terra: se non si equipaggia nulla, l'oggetto resta semplicemente in groundLoot", () => {
  const state = newGame(1);
  landAll(state, "e1");
  pushFixtureLoot(state, "e1", { kind: "cura", itemId: "bende", instanceId: 1 });
  assert.equal(loop.getZone(state, "e1").groundLoot.length, 1);
});

test("Cura/Scudo/Utility: un solo slot ciascuno, stessa sostituzione atomica", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");

  pushFixtureLoot(state, "e1", { kind: "cura", itemId: "bende", instanceId: 1 });
  loop.equipFoundSupportItem(state, "p1", "cura", 1, itemsCatalog.findItem("bende"));
  assert.equal(p.equipment.cura.id, "bende");

  pushFixtureLoot(state, "e1", { kind: "cura", itemId: "medikit", instanceId: 2 });
  loop.equipFoundSupportItem(state, "p1", "cura", 2, itemsCatalog.findItem("medikit"));
  assert.equal(p.equipment.cura.id, "medikit");
  const onGround = loop.getZone(state, "e1").groundLoot.find((g) => g.kind === "cura" && g.itemId === "bende");
  assert.ok(onGround, "le Bende sostituite tornano a terra");
});

test("equipFoundWeapon rifiuta se l'istanza non è (più) a terra in quella zona", () => {
  const state = newGame(1);
  landAll(state, "e1");
  assert.throws(() => loop.equipFoundWeapon(state, "p1", "primary", 9999, weapon("bow_base")));
});

/* =========================================================================
   SCAMBIA — a senso unico: il mittente dà, il suo slot resta vuoto. Se il
   destinatario aveva già qualcosa, va a terra (mai sovrascritto/distrutto).
   ========================================================================= */

test("SCAMBIA con slot destinatario libero: trasferimento diretto", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getPlayer(state, "p1").equipment.primary = weapon("pistol_base");
  loop.scambiaAction(state, "p1", "p2", "primary");
  assert.equal(loop.getPlayer(state, "p2").equipment.primary.id, "pistol_base");
  assert.equal(loop.getPlayer(state, "p1").equipment.primary, null, "il mittente resta senza: SCAMBIA è a senso unico");
});

test("SCAMBIA con slot destinatario occupato: l'oggetto precedente va a terra, mai distrutto", () => {
  const state = newGame(2);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getPlayer(state, "p1").equipment.primary = weapon("pistol_base");
  loop.getPlayer(state, "p2").equipment.primary = weapon("bow_base");
  loop.scambiaAction(state, "p1", "p2", "primary");
  assert.equal(loop.getPlayer(state, "p2").equipment.primary.id, "pistol_base");
  const onGround = loop.getZone(state, "e1").groundLoot.find((g) => g.kind === "weapon" && g.weaponId === "bow_base");
  assert.ok(onGround, "l'arma del destinatario, spodestata, non deve sparire");
});

/* =========================================================================
   CONSUMABILI — Cura/Scudo, clamp a 10
   ========================================================================= */

test("Cura: Bende +3, Medikit +6, Kit Medico riporta al massimo, sempre clamp a 10", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");

  p.hp = 5; p.equipment.cura = itemsCatalog.findItem("bende");
  loop.usaCuraAction(state, "p1");
  assert.equal(p.hp, 8);

  p.actedThisRound = false; p.hp = 5; p.equipment.cura = itemsCatalog.findItem("medikit");
  loop.usaCuraAction(state, "p1");
  assert.equal(p.hp, 10, "5+6=11, clampato a 10");

  p.actedThisRound = false; p.hp = 3; p.equipment.cura = itemsCatalog.findItem("kit_medico");
  loop.usaCuraAction(state, "p1");
  assert.equal(p.hp, 10);
});

test("Scudo: stessa logica di Cura, +3/+6/pieno, clamp a 10", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");

  p.shield = 0; p.equipment.scudo = itemsCatalog.findItem("mini_scudo");
  loop.usaScudoAction(state, "p1");
  assert.equal(p.shield, 3);

  p.actedThisRound = false; p.shield = 8; p.equipment.scudo = itemsCatalog.findItem("batteria_scudo");
  loop.usaScudoAction(state, "p1");
  assert.equal(p.shield, 10, "8+6=14, clampato a 10");
});

/* =========================================================================
   UTILITY — Scanner/Fumogeno/Stim consumano TUTTI E TRE l'azione principale
   oltre all'oggetto Utility stesso (nessuna eccezione tra loro), si
   consumano una sola volta, mai un dado digitale.
   ========================================================================= */

test("Scanner rivela nemici vivi e casse non aperte di una zona adiacente, costa l'azione", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.spawnEnemy(state, "normale", "e2");
  loop.getZone(state, "e2").chests.push({ id: "cX", opened: false }, { id: "cY", opened: true });
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("scanner");
  const result = loop.usaUtilityAction(state, "p1", "e2");
  assert.equal(result.enemyCount, 1);
  assert.equal(result.chestCount, 1);
  assert.equal(p.equipment.utility, null);
  assert.equal(p.actedThisRound, true);
});

test("Scanner rifiuta una zona non adiacente", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  loop.getPlayer(state, "p1").equipment.utility = itemsCatalog.findItem("scanner");
  assert.throws(() => loop.usaUtilityAction(state, "p1", "e3"), "e3 non è adiacente a e1");
});

test("Fumogeno: -1 dado (min 1) al PROSSIMO attacco nemico nella zona, consuma l'azione principale", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("fumogeno");
  loop.usaUtilityAction(state, "p1", null);
  assert.equal(p.actedThisRound, true, "Fumogeno consuma l'azione principale come Scanner/Stim");
  assert.equal(loop.getZone(state, "e1").smokeActive, true);

  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.effectBonus, -1);
  assert.equal(loop.getZone(state, "e1").smokeActive, false, "consumato da questo attacco");
});

test("Fumogeno non si consuma su un passo di movimento/idle (nessun bersaglio nella zona)", () => {
  const state = newGame(1);
  landAll(state, "e3");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1"); // nessun giocatore in e1: idle
  loop.getZone(state, "e1").smokeActive = true;
  const prepared = loop.prepareEnemyStep(state, enemyId);
  assert.equal(prepared.type, "idle");
  assert.equal(loop.getZone(state, "e1").smokeActive, true, "un idle non consuma il Fumogeno");
});

test("Fumogeno non stacka (è un booleano, non un contatore)", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("fumogeno");
  loop.usaUtilityAction(state, "p1", null);
  assert.equal(loop.getZone(state, "e1").smokeActive, true);
  // riattivarlo (ipoteticamente) non lo farebbe "contare doppio": resta true
  loop.getZone(state, "e1").smokeActive = true;
  assert.equal(loop.getZone(state, "e1").smokeActive, true);
});

test("Stim: consuma l'azione principale SUBITO; il +1 dado resta in sospeso fino al prossimo attacco (turno/round successivo)", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("stim");
  loop.usaUtilityAction(state, "p1", null);
  assert.equal(p.actedThisRound, true, "Stim consuma l'azione principale come Scanner/Fumogeno");
  // Stim ha già consumato l'unica azione principale del round: attaccare
  // nello stesso turno è impossibile, esattamente come con Scanner/Fumogeno.
  assert.throws(() => loop.declarePlayerAttack(state, "p1", enemyId, { baseDice: 1, range: "medio", power: 0, special: { type: "none" } }));

  loop.endRound(state, () => 0.99);
  loop.startRound(state, () => 0.99); // azzera actedThisRound, MA NON pendingStim
  assert.equal(state.pendingStim["p1"], true, "il bonus Stim resta in sospeso finché non viene usato in un attacco");

  const zone = loop.getZone(state, "e1");
  zone.encounterRange = "medio";
  const weaponObj = { baseDice: 2, range: "medio", power: 1, special: { type: "none" } }; // mod gittata +1, stim +1 -> 4 -> clamp 3
  const declared = loop.declarePlayerAttack(state, "p1", enemyId, weaponObj);
  assert.equal(declared.effectBonus, 1);
  assert.equal(declared.diceCount, 3, "2 base + 1 gittata + 1 stim = 4, clampato a 3 (nessuna nuova formula)");

  const outcome = loop.resolvePlayerAttackFromRolls(state, declared, [3, 3, 3]);
  assert.equal(outcome.status, "resolved");
  assert.equal(state.pendingStim["p1"], undefined, "Stim consumato dopo l'attacco");
});

test("Stim non stacka: il flag resta un booleano anche se marcato due volte", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  state.pendingStim["p1"] = true;
  state.pendingStim["p1"] = true; // "riattivazione" ipotetica
  const weaponObj = { baseDice: 1, range: "medio", power: 0, special: { type: "none" } };
  const declared = loop.declarePlayerAttack(state, "p1", enemyId, weaponObj);
  assert.equal(declared.effectBonus, 1, "mai +2");
});

/* =========================================================================
   UTILITY — nessuna delle tre può convivere con un'altra azione principale
   nello stesso turno (decisione presa): stessa regola per tutte e tre.
   ========================================================================= */

test("dopo Scanner non si può fare un'altra azione principale nello stesso turno", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("scanner");
  loop.usaUtilityAction(state, "p1", "e2");
  assert.throws(() => loop.interagisciAction(state, "p1"));
});

test("dopo Fumogeno non si può fare un'altra azione principale nello stesso turno", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("fumogeno");
  loop.usaUtilityAction(state, "p1", null);
  assert.throws(() => loop.interagisciAction(state, "p1"));
});

test("dopo Stim non si può fare un'altra azione principale nello stesso turno", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const p = loop.getPlayer(state, "p1");
  p.equipment.utility = itemsCatalog.findItem("stim");
  loop.usaUtilityAction(state, "p1", null);
  assert.throws(() => loop.interagisciAction(state, "p1"));
});

/* =========================================================================
   DADI FISICI — Utility non reintroduce mai un tiro digitale nel gameplay
   ========================================================================= */

test("declarePlayerAttack non tira mai un dado: calcola solo diceCount, i risultati arrivano da submitRoll", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const weaponObj = { baseDice: 1, range: "medio", power: 0, special: { type: "none" } };
  const declared = loop.declarePlayerAttack(state, "p1", enemyId, weaponObj);
  assert.equal(typeof declared.diceCount, "number");
  assert.equal("rolls" in declared, false, "nessun risultato di dado generato qui dentro");
});

/* =========================================================================
   BOSS — nessun loot da run, mai
   ========================================================================= */

test("il Boss non genera mai loot: groundLoot invariato attraverso l'intero combattimento", () => {
  const bossConfig = {
    hpPerPlayer: 1, summonEvery: 3, summonArchetype: "normale",
    phases: [{ threshold: 1.0, attackProfile: { baseDice: 1, power: 0, range: "medio", special: { type: "none" } } }]
  };
  const state = loop.createGame({ players: makePlayers(1), bossConfig });
  state.players.forEach((p) => { p.zoneId = null; });
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  // Sposato subito al centro: le zone esterne diventano "eliminated" con la
  // Tempesta prima del round 10, cosa irrilevante per questo test.
  state.players[0].zoneId = "centro";
  while (state.round < 10) { loop.endRound(state, () => 0.99); loop.startRound(state, () => 0.99); }
  const before = loop.getZone(state, "centro").groundLoot.length;
  loop.attackBossAction(state, "p1", { baseDice: 2, range: "medio", power: 5, special: { type: "none" } }, () => 6);
  assert.equal(state.phase, "vittoria");
  assert.equal(loop.getZone(state, "centro").groundLoot.length, before, "il boss non lascia mai nulla a terra");
});

/* =========================================================================
   LOOT ALLA MORTE DI UN NEMICO — idempotente
   ========================================================================= */

test("un Elite morto genera loot una sola volta, mai due volte anche se richiamato di nuovo", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "elite", "e1");
  const enemy = loop.getEnemy(state, enemyId);
  enemy.hp = 0; // simuliamo l'eliminazione
  const first = loop.resolveEnemyDeathLoot(state, enemy, () => 0.5);
  assert.ok(first);
  assert.equal(enemy.lootResolved, true);
  const second = loop.resolveEnemyDeathLoot(state, enemy, () => 0.5);
  assert.equal(second, null);
  assert.equal(loop.getZone(state, "e1").groundLoot.length, 2, "1 arma + 1 supporto, non il doppio");
});

test("un nemico vivo non genera mai loot", () => {
  const state = newGame(1);
  landAll(state, "e1");
  loop.beginExploration(state, () => 0.99);
  const enemyId = loop.spawnEnemy(state, "normale", "e1");
  const drop = loop.resolveEnemyDeathLoot(state, loop.getEnemy(state, enemyId), () => 0.1);
  assert.equal(drop, null);
});

/* =========================================================================
   ARMA INIZIALE — mai comprata, mai nell'Arsenale allo sblocco
   ========================================================================= */

test("la starter non entra mai in collectedWeaponIds: è assegnata direttamente, mai via equipFoundWeapon", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");
  p.equipment.primary = weapon(loot.STARTER_WEAPON_ID); // stessa assegnazione diretta del bootstrap UI
  assert.deepEqual(p.collectedWeaponIds, []);
});

test("equipFoundWeapon invece registra sempre l'arma in collectedWeaponIds", () => {
  const state = newGame(1);
  landAll(state, "e1");
  const p = loop.getPlayer(state, "p1");
  pushFixtureLoot(state, "e1", { kind: "weapon", weaponId: "bow_base", instanceId: 1 });
  loop.equipFoundWeapon(state, "p1", "primary", 1, weapon("bow_base"));
  assert.deepEqual(p.collectedWeaponIds, ["bow_base"]);
});

/* =========================================================================
   DISCOVERY — composizione loop (Party) + arsenal-core, mai un secondo
   registro "chi ha scoperto cosa" dentro il loop
   ========================================================================= */

test("arma rivelata: tutti gli active nella stessa zona scoprono, un giocatore in un'altra zona no", () => {
  const state = newGame(3);
  loop.landPlayer(state, "p1", "e1", () => 0.99);
  loop.landPlayer(state, "p2", "e1", () => 0.99);
  loop.landPlayer(state, "p3", "e2", () => 0.99);
  loop.beginExploration(state, () => 0.99);

  let arsenals = { p1: arsenal.createArsenalState(), p2: arsenal.createArsenalState(), p3: arsenal.createArsenalState() };
  const witnesses = loop.getActivePartyMembers(state, "e1");
  witnesses.forEach((p) => { arsenals[p.id] = arsenal.discoverWeapon(arsenals[p.id], "assault_redeye"); });

  assert.equal(arsenal.getWeaponCollectionStatus(arsenals.p1, "assault_redeye"), "scoperta");
  assert.equal(arsenal.getWeaponCollectionStatus(arsenals.p2, "assault_redeye"), "scoperta");
  assert.equal(arsenal.getWeaponCollectionStatus(arsenals.p3, "assault_redeye"), "sconosciuta");
});

test("la perdita della partita non cancella la discovery: l'Arsenale è uno stato indipendente dal gameState", () => {
  const state = newGame(1);
  landAll(state, "e1");
  let a = arsenal.createArsenalState();
  a = arsenal.discoverWeapon(a, "assault_redeye");
  state.players.forEach((p) => { p.status = "eliminated"; });
  loop.checkVictoryOrDefeat(state);
  assert.equal(state.phase, "sconfitta");
  assert.equal(arsenal.getWeaponCollectionStatus(a, "assault_redeye"), "scoperta");
});
