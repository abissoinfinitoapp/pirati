# Saccheggi giornalieri Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un avvistamento cooperativo giornaliero nel quale la ciurma sceglie una di due navi buffe, tira insieme e, dopo un primo fallimento, può fare un secondo e ultimo tentativo sulla stessa nave o sull'altra.

**Architecture:** Un catalogo dichiarativo registra dodici coppie nel motore contenuti esistente. Un piccolo modulo puro calcola selezione, disponibilità e risultati; `app.js` orchestra persistenza, ricompense, Diario e navigazione, mentre una vista modale dedicata gestisce scelta, tiri e rivelazioni.

**Tech Stack:** HTML/CSS/JavaScript senza build, API globali browser, `localStorage`, test integrati con `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-03-saccheggi-giornalieri-design.md`

## Global Constraints

- Un solo avvistamento per giornata della campagna; il consumo avviene alla prima scelta.
- Tutti i pirati presenti tirano `1d6 + caratteristica`; l'esito usa la media.
- Soglie consentite: 5 “abbordaggio facile”, 6 “abbordaggio audace”, 7 “abbordaggio leggendario”; non scalano con ciclo o Grado.
- Il primo fallimento non penalizza e concede un solo secondo tentativo, sulla stessa nave o sull'altra.
- Il secondo fallimento chiude senza premio e senza un terzo tentativo.
- Il premio della nave scartata resta segreto dopo un successo; viene rivelato dopo il primo fallimento.
- Nessun fallimento modifica monete, Fama, oggetti o Pericolo.
- Carte bonus applicabili alle prove sono ammesse; carte skip, movimento e successo automatico non lo sono.
- I vecchi salvataggi e gli asset mancanti devono degradare in modo sicuro.
- Nessuna nuova dipendenza o fase di build.

---

## File map

- Create: `engine/saccheggi-core.js` — funzioni pure per regole e calcolo.
- Create: `catalog/saccheggi.js` — dodici coppie curate e 24 navi.
- Create: `tests/saccheggi-core.test.js` — test unitari del motore.
- Create: `tests/saccheggi-catalog.test.js` — validazione completa del catalogo.
- Create: `docs/saccheggi-prompt-immagini.txt` — 24 prompt finali.
- Modify: `engine/pirati-core.js` — registro, normalizzazione e diagnostica del catalogo.
- Modify: `catalog/premi.js` — soli oggetti-bottino nuovi citati dalle navi.
- Modify: `gioco.html` — caricamento script, ingresso dalla Mappa e modale.
- Modify: `app.js` — stato persistente, controller, ricompense, Diario ed evento quest.
- Modify: `styles.css` — layout responsive e stati visivi.
- Modify: `content/_COME-SCRIVERE-UNO-STORYFLOW.md` — contratto dell'aggancio nelle quest.
- Modify: `package.json` — comando di test privo di dipendenze.

### Task 1: Motore puro delle regole

**Files:**
- Create: `engine/saccheggi-core.js`
- Create: `tests/saccheggi-core.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `PIRATI_SACCH_CORE.dayAvailable(raid, day): boolean`
- Produces: `PIRATI_SACCH_CORE.pickPair(pairs, recentIds, random): object|null`
- Produces: `PIRATI_SACCH_CORE.scoreRolls(players, rolls, stat, cardBonus): {entries, average}`
- Produces: `PIRATI_SACCH_CORE.resolveAttempt(average, target, attempt): {success, nextPhase}`
- Produces: `PIRATI_SACCH_CORE.withRaidDefaults(savedRaid): RaidState`
- Produces: `PIRATI_SACCH_CORE.applyRaidRewardsOnce(state, ship): boolean`
- Produces: CommonJS export delle stesse funzioni per `node:test`.

- [ ] **Step 1: Scrivere test fallenti per disponibilità e rotazione**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/saccheggi-core.js");

test("un tentativo consumato resta indisponibile soltanto nello stesso giorno", () => {
  assert.equal(core.dayAvailable({ usedDay: 8 }, 8), false);
  assert.equal(core.dayAvailable({ usedDay: 8 }, 9), true);
});

test("pickPair esclude le ultime quattro coppie quando restano alternative", () => {
  const pairs = ["a", "b", "c", "d", "e", "f"].map(id => ({ id }));
  assert.equal(core.pickPair(pairs, ["a", "b", "c", "d"], () => 0).id, "e");
});
```

- [ ] **Step 2: Eseguire i test e verificare il rosso**

Run: `node --test tests/saccheggi-core.test.js`

Expected: FAIL con `Cannot find module '../engine/saccheggi-core.js'`.

- [ ] **Step 3: Implementare disponibilità e selezione deterministica**

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_SACCH_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const dayAvailable = (raid, day) => !raid || raid.usedDay !== day;
  function pickPair(pairs, recentIds, random) {
    if (!Array.isArray(pairs) || !pairs.length) return null;
    const recent = new Set((recentIds || []).slice(-4));
    const unseen = pairs.filter(pair => !recent.has(pair.id));
    const pool = unseen.length >= 1 && pairs.length >= 5 ? unseen : pairs;
    const rng = typeof random === "function" ? random : Math.random;
    return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  }
  return { dayAvailable, pickPair };
});
```

- [ ] **Step 4: Scrivere test fallenti per media ed esiti**

```js
test("scoreRolls somma statistiche e bonus di squadra", () => {
  const players = [
    { id: "p1", stats: { astuzia: 3 } },
    { id: "p2", stats: { astuzia: 1 } }
  ];
  const score = core.scoreRolls(players, { p1: 4, p2: 6 }, "astuzia", 1);
  assert.deepEqual(score.entries.map(x => x.total), [7, 7]);
  assert.equal(score.average, 8);
});

test("il primo fallimento porta alla seconda scelta, il secondo chiude", () => {
  assert.deepEqual(core.resolveAttempt(5.9, 6, 1), { success: false, nextPhase: "retry-choice" });
  assert.deepEqual(core.resolveAttempt(5.9, 6, 2), { success: false, nextPhase: "result" });
  assert.deepEqual(core.resolveAttempt(6, 6, 2), { success: true, nextPhase: "result" });
});
```

- [ ] **Step 5: Implementare calcolo e macchina degli esiti**

```js
function scoreRolls(players, rolls, stat, cardBonus) {
  const entries = players.map(player => {
    const die = Number(rolls[player.id]);
    if (!Number.isInteger(die) || die < 1 || die > 6) throw new RangeError("Ogni dado deve essere fra 1 e 6.");
    const statValue = Number(player.stats[stat]) || 0;
    return { id: player.id, die, stat: statValue, total: die + statValue };
  });
  if (!entries.length) throw new RangeError("Serve almeno un pirata presente.");
  const average = entries.reduce((sum, entry) => sum + entry.total, 0) / entries.length + (Number(cardBonus) || 0);
  return { entries, average };
}
function resolveAttempt(average, target, attempt) {
  const success = average >= target;
  return { success, nextPhase: success || attempt >= 2 ? "result" : "retry-choice" };
}
```

Aggiornare il valore restituito dal factory a `{ dayAvailable, pickPair, scoreRolls, resolveAttempt }`.

- [ ] **Step 6: Aggiungere ed eseguire il comando di test**

```json
{
  "scripts": { "test": "node --test tests/*.test.js" },
  "dependencies": { "sharp": "^0.35.4" }
}
```

Run: `npm test`

Expected: 4 test PASS.

- [ ] **Step 7: Commit**

```bash
git add engine/saccheggi-core.js tests/saccheggi-core.test.js package.json
git commit -m "test: definisci le regole dei saccheggi"
```

### Task 2: Registro e validazione del catalogo

**Files:**
- Modify: `engine/pirati-core.js`
- Create: `catalog/saccheggi.js`
- Create: `tests/saccheggi-catalog.test.js`

**Interfaces:**
- Produces: `PIRATI.registerRaidPairs(pairs): void`
- Produces: `PIRATI.raidPairs: RaidPair[]`
- Produces: `PIRATI.raidPair(id): RaidPair|null`
- `RaidPair = {id, ships: [RaidShip, RaidShip]}`
- `RaidShip = {id, name, image, sighting, stat, target, rewards, success, fail, missed}`

- [ ] **Step 1: Scrivere il validatore fallente**

Creare un test che avvia `pirati-core.js` e `catalog/saccheggi.js` in un
`vm` con `window`, `console` e `PIRATI_ASSET: p => "assets/" + p`, quindi verifica:

```js
assert.equal(PIRATI.raidPairs.length, 12);
assert.equal(PIRATI.raidPairs.flatMap(pair => pair.ships).length, 24);
assert.equal(new Set(PIRATI.raidPairs.map(pair => pair.id)).size, 12);
assert.equal(new Set(PIRATI.raidPairs.flatMap(pair => pair.ships.map(ship => ship.id))).size, 24);
assert.ok(PIRATI.raidPairs.every(pair => pair.ships.length === 2));
assert.ok(PIRATI.raidPairs.flatMap(pair => pair.ships).every(ship =>
  ["coraggio", "astuzia", "fortuna"].includes(ship.stat) &&
  [5, 6, 7].includes(ship.target) &&
  ship.image.endsWith(".webp") &&
  ship.sighting && ship.success && ship.fail && ship.missed &&
  Array.isArray(ship.rewards) && ship.rewards.length
));
assert.deepEqual(PIRATI.problems.filter(p => p.includes("saccheggio")), []);
```

- [ ] **Step 2: Eseguire il test e verificare il rosso**

Run: `node --test tests/saccheggi-catalog.test.js`

Expected: FAIL perché `registerRaidPairs` non esiste.

- [ ] **Step 3: Estendere il registro**

In `state` aggiungere `raidPairs: []` e `raidPairById: new Map()`. Creare
`registerRaidPairs(pairs)` che rifiuta coppie duplicate, richiede esattamente
due navi, convalida campi, statistiche, soglie e ricompense, normalizza
`image` con `PIRATI_ASSET("saccheggi/" + ship.id + ".webp")`, quindi esportare:

```js
registerRaidPairs,
get raidPairs() { return state.raidPairs; },
raidPair: (id) => state.raidPairById.get(id) || null,
```

- [ ] **Step 4: Scrivere le dodici coppie complete**

In `catalog/saccheggi.js` chiamare `PIRATI.registerRaidPairs([...])` usando
questi ID di coppia e nave:

```text
dolce-freddo: nave-gelato / nave-zucchero-filato
salti-morbidi: galeone-cuscini / brigantino-trampolini
merenda-mare: nave-patatine / veliero-cioccolata-calda
giocattoli-scomposti: caravella-dinosauri / nave-robot-svitati
festa-impossibile: vascello-bolle / galeone-fuochi-silenziosi
piedi-in-fuga: nave-calzini-spaiati / veliero-scarpe-saltellanti
dolci-giganti: galeone-torte / nave-caramelle-mutacolore
ciurme-tenere: nave-pappagalli-cantanti / caravella-cuccioli-pirata
storie-colorate: vascello-pennarelli-magici / nave-libri-parlanti
cielo-da-gioco: galeone-palloni-infiniti / nave-aquiloni-cavalcabili
esperimenti-molli: nave-mostri-gelatina / vascello-pozioni-ruttanti
guardaroba-regale: caravella-corone-assurde / nave-mantelli-meta-invisibili
```

Distribuire equamente le tre statistiche e usare prevalentemente soglia 6, con
quattro navi a soglia 5 e quattro a soglia 7. Ogni `sighting` deve contenere
un indizio ambiguo; ogni `fail` una beffa unica; ogni `missed` deve nominare
chiaramente il premio perso. Usare ricompense piccole: 2–5 monete per i premi
comuni, 1 Fama per quattro navi e un oggetto per le sei navi definite nel task 3.

- [ ] **Step 5: Caricare il catalogo nella pagina e rieseguire i test**

In `gioco.html`, dopo `catalog/premi.js`, aggiungere:

```html
<script src="catalog/saccheggi.js"></script>
```

Run: `npm test`

Expected: tutti i test PASS e nessun problema catalogo.

- [ ] **Step 6: Commit**

```bash
git add engine/pirati-core.js catalog/saccheggi.js tests/saccheggi-catalog.test.js gioco.html
git commit -m "feat: aggiungi il catalogo dei saccheggi"
```

### Task 3: Premi e prompt delle 24 illustrazioni

**Files:**
- Modify: `catalog/premi.js`
- Create: `docs/saccheggi-prompt-immagini.txt`
- Modify: `tests/saccheggi-catalog.test.js`

**Interfaces:**
- Consumes: `RaidShip.rewards`
- Produces: sei reward `loot` risolvibili tramite `PIRATI.reward(id)`

- [ ] **Step 1: Estendere il test del catalogo con i riferimenti ai premi**

```js
for (const reward of PIRATI.raidPairs.flatMap(p => p.ships).flatMap(s => s.rewards)) {
  assert.ok(["coins", "fame", "loot"].includes(reward.type));
  if (reward.type === "loot") assert.ok(PIRATI.reward(reward.id), `premio mancante: ${reward.id}`);
}
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca sui nuovi ID**

Run: `node --test tests/saccheggi-catalog.test.js`

Expected: FAIL con il primo `premio mancante`.

- [ ] **Step 3: Registrare sei bottini tematici**

Inserire in `catalog/premi.js`:

```js
{ id: "cuscino-capitano", name: "Cuscino del Capitano", icon: "🛏️", rarity: "comune", text: "Una volta, trasforma un riposo scomodo in un riposo perfetto." },
{ id: "scarpe-saltellanti-loot", name: "Scarpe Saltellanti", icon: "👟", rarity: "raro", text: "Una volta al giorno superano un piccolo ostacolo con un balzo." },
{ id: "pennarello-magico", name: "Pennarello Magico", icon: "🖍️", rarity: "raro", text: "Disegna una freccia o un simbolo che resta visibile per una scena." },
{ id: "aquilone-cavalcabile", name: "Aquilone Cavalcabile", icon: "🪁", rarity: "raro", text: "Porta un pirata oltre un ostacolo o fino a un punto alto." },
{ id: "pozione-rutto", name: "Pozione Ruttante", icon: "🧪", rarity: "comune", text: "Produce un rutto così forte da distrarre tutti per un istante." },
{ id: "mantello-meta-invisibile", name: "Mantello Invisibile a Metà", icon: "🧥", rarity: "raro", text: "Nasconde perfettamente metà di chi lo indossa; la ciurma decide quale." },
```

- [ ] **Step 4: Scrivere i 24 prompt**

Il file deve iniziare con una base comune: “illustrazione pittorica da libro per
bambini, nave intera in vista tre quarti, mare fantastico, luce morbida, forme
leggibili, umorismo visivo, nessuna violenza, nessun testo o logo, formato 4:3”.
Creare poi una sezione numerata per ogni ID nave del Task 2, aggiungendo:

- sagoma distinta della nave e carico suggerito ma non svelato completamente;
- palette di 3–5 colori;
- marinai buffi e mai terrorizzati;
- un dettaglio visivo specifico coerente con `sighting`;
- chiusura “stile coerente con Pirati: Isole del Teschio d'Oro, sfondo semplice”.

- [ ] **Step 5: Rieseguire la validazione**

Run: `npm test`

Expected: tutti i test PASS.

- [ ] **Step 6: Commit**

```bash
git add catalog/premi.js catalog/saccheggi.js tests/saccheggi-catalog.test.js docs/saccheggi-prompt-immagini.txt
git commit -m "feat: aggiungi bottini e prompt delle navi"
```

### Task 4: Stato persistente e controller del saccheggio

**Files:**
- Modify: `app.js` presso `defaultState`, `withDefaults`, `saveState` e le funzioni di dominio.
- Modify: `engine/saccheggi-core.js`
- Create: `tests/saccheggi-state.test.js`

**Interfaces:**
- Consumes: `PIRATI.raidPairs`, `PIRATI.raidPair(id)`, `PIRATI_SACCH_CORE.*`
- Produces: `startRaid(pairId, returnTo): void`
- Produces: `chooseRaidShip(shipId): void`
- Produces: `setRaidRoll(playerId, die): void`
- Produces: `resolveRaidAttempt(): void`
- Produces: `closeRaid(): void`
- State shape: `raid: {usedDay, pairId, shipId, attempt, phase, rolls, outcome, recentPairIds, returnTo, rewardsApplied}`

- [ ] **Step 1: Scrivere test di migrazione e idempotenza del modulo puro**

Importare `engine/saccheggi-core.js` e verificare:

```js
assert.deepEqual(core.withRaidDefaults({}).recentPairIds, []);
assert.equal(core.withRaidDefaults({ usedDay: 4 }).usedDay, 4);
assert.equal(core.applyRaidRewardsOnce(resultState, ship), true);
assert.equal(core.applyRaidRewardsOnce(resultState, ship), false);
assert.equal(resultState.crew.coins, 3);
```

Il fixture `ship` assegna 3 monete e `resultState.raid.rewardsApplied` parte
`false`.

- [ ] **Step 2: Eseguire il test e verificare il rosso**

Run: `node --test tests/saccheggi-state.test.js`

Expected: FAIL perché helper e blocco `raid` non esistono.

- [ ] **Step 3: Aggiungere helper puro, stato predefinito e migrazione**

```js
raid: {
  usedDay: null, pairId: null, shipId: null, attempt: 1, phase: "idle",
  rolls: {}, outcome: null, recentPairIds: [], returnTo: "map", rewardsApplied: false
}
```

Aggiungere `raid` alla fusione annidata di `withDefaults`, con controllo array
per `recentPairIds` e controllo oggetto per `rolls`. Se coppia/nave salvata
non esiste, azzerare il flusso; conservare `usedDay` quando `shipId` era già
stato scelto.

In `engine/saccheggi-core.js`, `withRaidDefaults` deve fondere esattamente la
struttura sopra; `applyRaidRewardsOnce` deve restituire `false` quando
`rewardsApplied` è già vero, altrimenti applicare `coins`, `fame` e
`loot`, impostare il flag e restituire `true`. `app.js` usa questi helper
senza mantenere una seconda implementazione. Una ricompensa con tipo o ID
sconosciuto viene ignorata, aggiunta a `PIRATI._state.problems` tramite il
percorso diagnostico esistente e non impedisce l'applicazione delle altre.

- [ ] **Step 4: Implementare avvio e prima scelta**

`startRaid` usa la coppia richiesta o `pickPair`, salva la coppia nei recenti
(ultimi quattro), imposta `phase: "choice"` e conserva `returnTo`.
`chooseRaidShip` accetta soltanto una nave della coppia corrente, imposta
`usedDay: state.day`, `phase: "roll"`, azzera tiri/esito e salva subito.

- [ ] **Step 5: Implementare risoluzione e singola assegnazione**

`resolveRaidAttempt` costruisce i partecipanti da `activePlayers()` e
`getCharacter`, somma soltanto le carte bonus valide, chiama il motore puro e:

- successo: applica una sola volta `coins`, `fame` e `loot`, registra il
  Diario, imposta `phase: "result"`;
- primo fallimento: imposta `phase: "retry-choice"`, `attempt: 2`, conserva
  l'esito narrativo e azzera i tiri;
- secondo fallimento: registra il Diario e imposta `phase: "result"` senza
  modificare risorse.

`closeRaid` torna a `returnTo`, pulisce lo stato transitorio senza cancellare
`usedDay` o i recenti.

- [ ] **Step 6: Eseguire i test**

Run: `npm test`

Expected: test di migrazione, idempotenza, primo/secondo tentativo PASS.

- [ ] **Step 7: Commit**

```bash
git add app.js tests/saccheggi-state.test.js
git commit -m "feat: salva e risolvi i saccheggi giornalieri"
```

### Task 5: Interfaccia completa e responsive

**Files:**
- Modify: `gioco.html` nella console Mappa e prima di `card-magnifier`
- Modify: `styles.css`
- Modify: `app.js` presso `renderMap`, `render` e `bindEvents`

**Interfaces:**
- Consumes: controller del Task 4.
- Produces: `renderRaid(): void` e controlli `data-raid-*`.

- [ ] **Step 1: Aggiungere il contenitore e l'ingresso dalla Mappa**

Nella console Mappa aggiungere `<div id="map-raid-entry"></div>`. Prima della
lente carte aggiungere un overlay `#raid-overlay` con dialog, titolo,
`#raid-content` e attributi `aria-modal="true"`, `aria-labelledby`.
Caricare `engine/saccheggi-core.js` dopo `engine/pirati-core.js`.

- [ ] **Step 2: Rendere gli stati dell'ingresso**

`renderMap` deve mostrare:

- disponibile: pulsante `data-raid-start` “🏴‍☠️ Navi all'orizzonte!”;
- in corso: pulsante `data-raid-resume` “Riprendi il saccheggio”;
- usato oggi: testo “Il saccheggio di oggi è concluso”.

Disabilitare l'ingresso quando non ci sono pirati presenti.

- [ ] **Step 3: Rendere scelta e tiri**

`renderRaid` crea due carte con immagine, `onerror` verso un'immagine di
riserva esistente, nome, avvistamento, statistica, difficoltà e pulsante
`data-raid-choose`. In fase tiro mostra ogni pirata con input 1–6
`data-raid-roll`, formula e pulsante digitale `data-raid-roll-all`.
Il pulsante `data-raid-resolve` resta disabilitato finché manca un tiro.

- [ ] **Step 4: Rendere rivelazione e seconda scelta**

In `retry-choice`, mostra prima `fail` della nave scelta, poi `missed`
dell'altra, quindi entrambe le carte con `data-raid-retry`; evidenziare il
premio ormai noto dell'altra e scrivere “Secondo e ultimo tentativo”.
In `result`, mostra successo o fuga finale e un solo pulsante
`data-raid-close`.

- [ ] **Step 5: Collegare input e click**

Nel listener `input`, salvare i valori `data-raid-roll`. Nel listener click
collegare start/resume, choose/retry, roll-all, resolve e close. Durante overlay
aperto, Escape non deve abbandonare un flusso consumato: chiude soltanto la vista
e lascia disponibile “Riprendi”. I controlli di rotta e gli ingressi a nuove
quest restano disabilitati finché `raid.phase` non torna a `idle`.

- [ ] **Step 6: Aggiungere stile e accessibilità**

Creare classi `.raid-overlay`, `.raid-dialog`, `.raid-ships`,
`.raid-ship-card`, `.raid-rolls`, `.raid-reveal`. Desktop: due colonne
simmetriche; sotto 720px: una colonna, immagini con `aspect-ratio: 4 / 3`,
controlli minimi 44px. Rispettare `prefers-reduced-motion`.

- [ ] **Step 7: Verifica manuale**

Run: `node dev-server.js`

Aprire `http://localhost:4173/gioco.html` e verificare con ciurma di prova:
prima scelta, dadi fisici, primo fallimento, retry stessa nave, retry altra nave,
successo al primo/secondo tiro, secondo fallimento, ricarica in ogni fase e
layout a 390×844 e 1366×768.

- [ ] **Step 8: Commit**

```bash
git add gioco.html styles.css app.js
git commit -m "feat: aggiungi la schermata dei saccheggi"
```

### Task 6: Aggancio nelle avventure guidate

**Files:**
- Modify: `app.js` nelle funzioni dello StoryFlow.
- Modify: `engine/pirati-core.js` nella validazione StoryFlow.
- Modify: `content/_COME-SCRIVERE-UNO-STORYFLOW.md`
- Modify: `tests/saccheggi-catalog.test.js`

**Interfaces:**
- Consumes: step StoryFlow `{type: "raid", pairId: string, skippedText: string}`.
- Produces: apertura con `startRaid(pairId, "story")` e ripresa della scena
  successiva tramite `closeRaid()`.

- [ ] **Step 1: Scrivere un test fallente per riferimenti quest**

Registrare un pack fixture con uno step `raid`, verificare che un `pairId`
valido non produca problemi e uno inesistente produca esattamente un avviso
contenente `coppia di saccheggio sconosciuta`.

- [ ] **Step 2: Eseguire il test e verificare il rosso**

Run: `node --test tests/saccheggi-catalog.test.js`

Expected: FAIL perché lo step `raid` non viene validato.

- [ ] **Step 3: Validare e interpretare lo step**

Il normalizzatore StoryFlow conserva `type: "raid"`, `pairId` e
`skippedText`. Il renderer mostra “Avvistamento piratesco” e avvia il flusso.
Se il giorno è già consumato, mostra `skippedText || "Le due navi sono ormai
troppo lontane."` e abilita subito il passo successivo. Un ID invalido usa una
coppia casuale e mantiene l'avviso diagnostico.

- [ ] **Step 4: Documentare il contratto esatto**

```js
{
  id: "navi-dolci",
  type: "raid",
  pairId: "dolce-freddo",
  skippedText: "Tra una discussione e l'altra, le due navi spariscono oltre l'orizzonte."
}
```

Spiegare che l'esito non modifica quello della quest e che il passo viene saltato
senza costo se il tentativo giornaliero è già stato usato.

- [ ] **Step 5: Eseguire test e prova manuale con fixture locale**

Run: `npm test`

Expected: tutti i test PASS. In browser, chiudendo il saccheggio si ritorna allo
step successivo della stessa quest; se già usato compare il testo di passaggio.

- [ ] **Step 6: Commit**

```bash
git add app.js engine/pirati-core.js content/_COME-SCRIVERE-UNO-STORYFLOW.md tests/saccheggi-catalog.test.js
git commit -m "feat: collega i saccheggi alle quest guidate"
```

### Task 7: Generazione e ottimizzazione delle 24 immagini

**Files:**
- Create: `assets/saccheggi/*.webp` — un file per ciascun ID nave.
- Consume: `docs/saccheggi-prompt-immagini.txt`

**Interfaces:**
- Consumes: i 24 prompt e gli ID del catalogo.
- Produces: 24 immagini WebP 4:3, nominate esattamente `<ship-id>.webp`.

- [ ] **Step 1: Generare le immagini a gruppi coerenti**

Usare la skill `imagegen` e il relativo strumento con i prompt del documento,
mantenendo lo stesso riferimento stilistico fra una generazione e la successiva.
Generare una nave per immagine, senza testo incorporato, marchi o cornici.

- [ ] **Step 2: Ispezionare ogni gruppo**

Controllare che ogni immagine mostri una sola nave, sia adatta a bambini di 6–10
anni, distingua chiaramente il tema, non riveli interamente il premio nascosto e
non contenga testo illeggibile o elementi paurosi.

- [ ] **Step 3: Esportare con nomi esatti**

Salvare i file in `assets/saccheggi/` usando i 24 ID elencati nel Task 2.
Convertire con lo strumento `sharp` già installato a 1200×900 WebP, qualità 82,
senza ingrandire immagini sorgente più piccole.

- [ ] **Step 4: Verificare quantità, formato e dimensioni**

Run:
`node -e "const fs=require('fs'),sharp=require('sharp');const d='assets/saccheggi';Promise.all(fs.readdirSync(d).filter(x=>x.endsWith('.webp')).map(async x=>({x,m:await sharp(d+'/'+x).metadata()}))).then(a=>{if(a.length!==24||a.some(v=>v.m.width!==1200||v.m.height!==900))process.exit(1);console.log('24 immagini 1200x900');})"`

Expected: `24 immagini 1200x900`.

- [ ] **Step 5: Commit**

```bash
git add assets/saccheggi docs/saccheggi-prompt-immagini.txt
git commit -m "feat: aggiungi le illustrazioni dei saccheggi"
```

### Task 8: Verifica finale e rifinitura

**Files:**
- Inspect: `engine/saccheggi-core.js`, `engine/pirati-core.js`, `catalog/saccheggi.js`, `catalog/premi.js`, `app.js`, `gioco.html`, `styles.css`, `tests/*.test.js`, `assets/saccheggi/*.webp`

**Interfaces:**
- Consumes: feature completa.
- Produces: evidenza di test automatici e controllo visivo senza regressioni.

- [ ] **Step 1: Eseguire l'intera suite**

Run: `npm test`

Expected: tutti i test PASS, zero test saltati.

- [ ] **Step 2: Eseguire diagnostica contenuti**

Nel browser eseguire `PIRATI.report()`.

Expected: nessun avviso relativo a saccheggi, premi o coppie quest.

- [ ] **Step 3: Verificare compatibilità salvataggi**

Importare un salvataggio esportato prima della feature, aprire la Mappa e
controllare che “Navi all'orizzonte!” sia disponibile. Esportare durante il
secondo tentativo, reimportare e verificare che coppia, nave, tentativo e tiri
siano conservati senza duplicare ricompense.

- [ ] **Step 4: Verificare i 24 asset e il fallback**

Controllare che ogni percorso del catalogo punti a
`assets/saccheggi/<ship-id>.webp`. Finché le immagini definitive non sono
presenti, verificare che tutte le carte mostrino il fallback senza icona rotta.

- [ ] **Step 5: Controllo visivo e regressioni**

Verificare Mappa, Quest, Tesoreria e Diario su desktop e mobile; controllare dadi
fisici/digitali, focus tastiera, Escape, testo lungo e `prefers-reduced-motion`.

- [ ] **Step 6: Controllare diff e stato**

Run: `git diff --check`

Expected: nessun output.

Run: `git status --short`

Expected: nessun file temporaneo o modifica non intenzionale.

- [ ] **Step 7: Registrare l'esito della verifica**

Se i controlli dei passi 1–6 sono puliti, non creare un commit vuoto. Se un
controllo fallisce, tornare al task proprietario del requisito, aggiungere prima
un test che riproduca il difetto, correggerlo e ripetere integralmente questo
task prima di dichiarare la feature completa.
