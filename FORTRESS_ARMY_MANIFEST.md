# FORTRESS ARMY — MANIFEST DI CONTINUITÀ

Data snapshot: **25/09/2026**

Questo manifest accompagna il cumulativo Fortress Army preparato per proseguire in una nuova chat. Il repository completo dell'utente contiene anche Pirati/hub, ma **lo scope di questo snapshot è Fortress Army**. Non modificare file Pirati salvo una dipendenza condivisa esplicitamente necessaria.

## 1. Stato Git noto

Ultimo commit esplicitamente confermato e pushato dall'utente/Claude:

- `d39f1d6` — **Enemy Squads / Multi-node Encounter V1** — già committato e pushato.

Commit precedenti confermati nella cronologia di lavoro:

- `94dd458f712245c269abb40aa8934a39d4cd95c5` — Guided Turn / aggregazione annunci Tempesta, pushato.
- `2f637b8` — initial encounter per zona, poi mantenuto solo come fallback legacy.
- `458be7c` — Loot / Inventory / Arsenal.
- `7343eb4` — map layout + boss config data-driven.
- `4443145` — Battlefield turn rotation.
- `5ba505f` — guardaroba skin.

**Importante:** il cumulativo allegato contiene anche modifiche successive a `d39f1d6` che non sono dichiarate come già pushate: 40 nuove armi speciali, chiarezza del riepilogo combattimento, loadout iniziale/weapon-first targeting e Action Hub. Prima di fare un nuovo commit in Git, confrontare il cumulativo con il branch reale e non sovrascrivere lavoro più recente.

## 2. Principi di prodotto

Fortress Army è un gioco cooperativo per bambini, **2–10 giocatori**.

Regola centrale: **i dadi sono rigorosamente fisici**. L'app non tira mai dadi durante la partita; indica quanti d6 tirare, il bambino/Master inserisce i risultati 1–6 e il motore risolve gli effetti.

Principio UX: **DIFFICILE DA VINCERE = OK; DIFFICILE DA CAPIRE = NO.** La UI deve guidare il bambino senza costringere il Master a spiegare continuamente chi gioca, cosa può fare, chi può attaccare e quanti dadi deve tirare.

Architettura desiderata: **ENGINE → MAP DEFINITION → CONTENT**. Evitare hardcode globali specifici di Map 01.

## 3. Mappa / Node Graph

Map 01 usa 9 zone world:

- `abandoned-city`
- `forest`
- `hill-outpost`
- `frontier-camp`
- `industrial-zone`
- `ancient-ruins`
- `military-base`
- `supply-depot`
- `central-fortress`

La Forest è il pilota del **Zone Magnify / Node Graph**. Il giocatore mantiene `zoneId` come posizione World e `nodeId` come posizione locale.

Regole Node Graph:

- movimento locale massimo 1 nodo per round;
- movimento locale usa lo stesso budget `movedThisRound` del movimento World;
- azione principale separata (`actedThisRound`);
- Party/Battlefield restano zone-level;
- interazioni fisiche locali (attacco, loot, rianima, aiuta, scambia) sono node-aware quando la zona usa Node Graph.

Distanza combattimento derivata dal grafo:

- stesso nodo → **Vicino**
- 1 collegamento → **Medio**
- 2+ collegamenti → **Lontano**

Il calcolo usa shortest path/BFS; coordinate `x/y` sono solo visuali.

## 4. Enemy Squads

`d39f1d6` ha introdotto **Enemy Squads / Multi-node Encounter V1** sulla Forest.

Un solo Encounter può contenere più nemici su più nodi, mantenendo `zoneId === battlefield identity`.

Forest pilota: **6 nemici su 3 nodi**.

Comportamento nemici V1:

- una sola attivazione per round;
- **movimento O attacco**, mai entrambi;
- se può attaccare dalla posizione/range corrente, attacca;
- altrimenti si muove di 1 nodo verso un bersaglio valido;
- KO esclusi dal targeting;
- ranged non avanza inutilmente se può già colpire.

`fortress-combat.js` non è stato modificato per Enemy Squads: la posizione determina la distanza, il Combat continua a calcolare dadi/danno.

## 5. Battlefield Director / Guided Turn

Il Director costruisce una queue interleavata tra zone Battlefield; non risolve una zona completamente prima delle altre.

Guided Turn UI già presente:

- `TOCCA A ...`
- avatar, zona, HP, Shield;
- azioni realmente disponibili;
- scelta bersaglio solo quando serve;
- scelta arma solo quando serve;
- numero di dadi fisici derivato dalla preview reale del motore;
- nessun avanzamento mentre `awaitingRoll` è pendente;
- transizione `ORA TOCCA A ...`;
- KO saltati correttamente.

Gli annunci Tempesta simultanei sono aggregati in un solo `storm-batch` invece di una sequenza di modali.

## 6. Combattimento

Attacchi: massimo runtime **1–3 d6 fisici**.

Danno giocatore: `somma dadi + weapon.power`.

`POTENZA` è solo una statistica visuale e non entra nel danno.

Range:

- Vicino
- Medio
- Lontano

Differenza tra gittata arma e distanza dello scontro:

- differenza 0 → +1 dado
- differenza 1 → 0
- differenza 2 → -1 dado
- clamp 1–3

Special esistenti comprendono:

`critOnSix`, `rerollOnes`, `ignoreShield`, `areaDamage`, `suppress`, `silent`, `silentKill`, `chainStrike`, `executionerStrike`.

`rerollOnes` richiede un nuovo tiro fisico reale.

### Chiarezza risultato combattimento — modifica locale nel cumulativo

Il vecchio riepilogo ambiguo `8 DANNI!` è stato sostituito da una sequenza esplicita:

- chi attacca;
- chi subisce;
- risultato dei dadi;
- Power;
- `HAI INFLITTO X DANNI` oppure `GIOCATORE X SUBISCE X DANNI`;
- variazione Scudo solo se significativa;
- variazione HP;
- eventuale KO/eliminazione.

Esempio nemico: `NORMALE ATTACCA GIOCATORE 1` → `TIRO DEL NEMICO: 6` → `POWER NEMICO +2` → `GIOCATORE 1 SUBISCE 8 DANNI` → `Salute 2 → 0` → `GIOCATORE 1 È A TERRA`.

## 7. Armi / catalogo

Il catalogo corrente contiene **140 armi**: 100 originali + 40 nuove armi speciali.

Schema: l'arma dichiara dati grezzi; `power`, `baseDice`, `range`, `specialValue` sono derivati dal sistema category/archetype/rarity quando previsto dal catalogo.

Starter: `assault_base`.

Regole starter:

- equipaggiata automaticamente se non viene scelta un'altra arma di partenza sbloccata;
- non conta come trovata;
- non entra in `collectedWeaponIds`;
- non è premio finale.

Le 40 nuove armi vanno da `rocket_hound` a `rocket_umbrella`; il catalogo del cumulativo include gli aggiustamenti di archetipo necessari a evitare collisioni statistiche Rara+ mantenendo ID, nome, range e special canonici.

Gli asset originali `armi-new-1.webp` e `armi-new-2.webp` NON sono inclusi nel cumulativo perché l'utente ha scelto di non trasferire le immagini. Lo script `scripts/crop-armi-new.mjs` resta incluso come riferimento del workflow.

## 8. Weapon Clarity / loadout iniziale — modifica locale nel cumulativo

Problema emerso dal playtest: non era evidente quale arma fosse in uso né perché la gittata dovesse influenzare il bersaglio.

Flusso aggiornato:

**ATTACCA → ARMA → BERSAGLIO → PREVIEW DADI → TIRO FISICO**.

Se c'è una sola arma o un solo bersaglio, la UI salta automaticamente le scelte inutili.

Nella scelta bersaglio sono visibili:

- arma selezionata;
- gittata dell'arma;
- distanza dal bersaglio;
- numero di dadi effettivi per quel bersaglio.

### Loadout iniziale

Nel setup, dopo l'avatar, ogni player può scegliere l'arma di partenza tra:

- `assault_base`, sempre disponibile;
- armi realmente **SBLOCCATE** nel suo Arsenal locale.

La Primary parte con la scelta, la Secondary vuota. Le armi sbloccate non vengono automaticamente considerate raccolte nella run.

La persistenza Arsenal attuale è locale/in-memory/local profile secondo il codice disponibile; collegamento definitivo account/backend e sblocco end-run restano da consolidare.

## 9. Action Hub — ultima modifica locale del cumulativo

Ultimo intervento di questa chat: spostare il centro decisionale **accanto al movimento nel Zone Magnify**, soprattutto per telefono.

Sotto la mappa ora esiste una riga/componente composta da:

- Movement Hub con `PUOI MUOVERTI UNA VOLTA` / `MOVIMENTO USATO` e frecce;
- **Action Hub** dinamico `COSA PUOI FARE QUI`.

L'Action Hub mostra localmente:

- sezione **ARMA ATTIVA** con slot `P` / `S` selezionabili;
- una sola arma attiva per volta (mai uso simultaneo delle due armi);
- microcopy esplicita: `ATTACCA userà solo l'arma evidenziata`;
- legenda nodi sempre visibile sotto la mappa: `🎁 Cassa`, `📦 Oggetti`, `👾 Nemici`, `N/A/R/D/E` con nome completo dell'archetipo;
- marker nemico valorizzati con icona mostro `👾` + codice archetipo + stat compatta;
- nella Forest l'Encounter multi-nodo viene materializzato **subito all'ingresso della zona**, così i nodi pericolosi risultano visibili immediatamente; il player resta comunque sull'entry node sicuro e non vengono creati marker finti;
- `ATTACCA`;
- `APRI CASSA`;
- `RACCOGLI` / scelta slot;
- `USA CURA`;
- `USA SCUDO`;
- `USA UTILITY`;
- `RIANIMA`;
- `AIUTA`;
- `SCAMBIA`;
- `FINE TURNO`;
- le altre azioni realmente fornite dal Director.

Quando il giocatore è nel piccolo Hub locale, `ATTACCA` usa direttamente l'arma attiva già evidenziata; quindi il flusso diventa **seleziona arma attiva → ATTACCA → scegli bersaglio → preview**. Se il giocatore apre comunque il cambio arma dentro il flow d'attacco, la scelta resta sincronizzata con l'Hub.

Le sequenze **scegli arma → scegli bersaglio → preview** e **cassa → scegli cosa prendere** restano nello stesso Action Hub invece di aprire un pannello lontano. Il modale rimane per il tiro fisico/risultato, dove serve interrompere chiaramente il flusso.

Su schermi stretti l'Hub va sotto il pad di movimento ma resta nello stesso blocco immediatamente sotto la mappa; su viewport più larghe movimento e azioni sono affiancati.

## 10. Party / inventario / loot

Party derivato dalla posizione:

- 1 giocatore attivo nella zona → SOLO;
- 2+ attivi nella stessa zona → PARTY;
- nessun `partyId` persistente;
- KO resta fisicamente presente ma non conta tra gli attivi.

Inventario V1:

- Primary
- Secondary
- Cura
- Scudo
- Utility

Oggetto sostituito → `groundLoot` secondo l'implementazione attuale.

### Chiarezza loot a terra
La UI distingue ora esplicitamente tre stati:
- `A TERRA — <oggetto>`: l'oggetto è visibile nella zona/nodo ma **non** è ancora nell'inventario;
- `RACCOGLI`: azione esplicita nell'Action Hub;
- `RACCOLTO — <oggetto>`: solo dopo l'equip effettivo nel relativo slot.

Gli eventi ambientali non usano più `HAI TROVATO` per oggetti non raccolti. Le casse usano `CASSA APERTA — a terra: ...` finché gli oggetti restano disponibili ma non equipaggiati.

Loot:

- cassa = 1 arma + 1 supporto;
- Elite = 1 arma + 1 supporto;
- normali/aggressivi/resistenti/distanza = 75% niente / 25% supporto;
- Boss finale = nessun loot post-finale.

Supporto:

- Cura 40%
- Scudo 40%
- Utility 20%

Cure: Bende +3, Medikit +6, Kit Medico full.

Scudi: Mini +3, Batteria +6, Totale full.

Utility: Scanner, Fumogeno, Stim. Tutte consumano Utility + azione principale secondo il blocco già corretto.

## 11. Arsenale permanente

Stati:

`SCONOSCIUTA → SCOPERTA → SBLOCCATA`

Quando un'arma viene rivelata, gli attivi presenti nella zona la scoprono. `collectedWeaponIds` tiene le armi raccolte nella run.

Regola vittoria prevista: ogni giocatore può sbloccare 1 arma raccolta nella run; Mitiche eleggibili solo se ancora equipaggiate alla vittoria.

Le armi sbloccate non vengono portate automaticamente nella run successiva: servono come scelta di loadout iniziale.

## 12. Test nello snapshot

Suite **Fortress-only** nel cumulativo:

- totale: **356 test**;
- verdi: **352**;
- fallimenti: **4**, tutti dovuti esclusivamente agli asset immagini volutamente omessi dal pacchetto:
  1. file immagini armi mancanti;
  2. directory `assets/fortress/weapons` assente;
  3. immagini personaggi mancanti;
  4. immagini zone mancanti.

Test specifici `fortress-game-ui.test.js`: **21/21 verdi**, inclusi i nuovi test su arma attiva e selezione univoca nello Action Hub.

Suite completa del repository copiato (comprende anche Pirati): **440 totali / 436 verdi / 4 asset-only fail**.

Questi numeri descrivono lo snapshot senza immagini; con gli asset reali al loro posto i 4 test devono essere rieseguiti, non marcati come ignorati.

## 13. File Fortress principali

UI:

- `fortress-army.html`
- `fortress-army.js`
- `fortress-game-ui.js`
- `styles-fortress.css`

Cataloghi:

- `catalog/fortress-armi.js`
- `catalog/fortress-characters.js`
- `catalog/fortress-items.js`
- `catalog/fortress-skins.js`
- `catalog/fortress-zones.js`

Engine:

- `engine/fortress-combat.js`
- `engine/fortress-loop.js`
- `engine/fortress-director.js`
- `engine/fortress-loot.js`
- `engine/fortress-arsenal-core.js`
- `engine/fortress-skins-core.js`

Test:

- tutti i `tests/fortress-*.test.js`.

## 14. Prossimi blocchi concordati

### A. Verifica browser Action Hub

Prima cosa nella nuova chat: test mobile/browser reale della nuova disposizione sotto la mappa.

Flusso da verificare:

`movimento → Action Hub → ATTACCA → arma → bersaglio → dadi → risultato`

e

`movimento → nodo cassa → APRI CASSA → PRENDI → scelta slot`.

La domanda UX è semplice: **il bambino deve guardare un solo punto sotto la mappa per decidere cosa fare.**

### B. Party Boost

Evento secondario già progettato, non ancora implementato.

Idea concordata:

- non sempre, ma nemmeno raro;
- preferibilmente nodo/evento nel Node Graph;
- ogni membro del Party dichiara un numero 1–6 e tira 1d6 fisico;
- almeno 1 successo → `PARTY BOOST`: +1 dado al prossimo attacco del Party;
- almeno 2 successi → `BIG BOOST`: +1 dado ai prossimi 2 attacchi del Party;
- clamp massimo 3 dadi;
- bonus del Party, non del singolo;
- niente stacking incontrollato.

### C. Migrazione altre zone

Dopo validazione Forest/Action Hub, estendere il Node Graph alle altre 8 zone principalmente come **content/data**, non duplicando engine.

Target MVP discusso: circa 4–6 nodi per zona, topologie diverse, Encounter distribuiti.

### D. Mega Encounter

Dopo il pilota da 6 nemici, possibilità di Encounter da 10–15 mostri distribuiti su più nodi. Difficoltà basata su numero + posizione + range + comportamento, non solo su HP elevati.

### E. K-Pack

Economia personale cosmetica, non ancora implementata. K-Pack personali, saldo visibile, usati solo per skin/cosmetici. Non usare per comprare armi.

## 15. Regole operative per la prossima chat

- Usare questo cumulativo come snapshot tecnico, ma confrontare con il branch Git reale prima di modificare se nel frattempo sono stati fatti push.
- Non inventare contenuto di file non letti.
- Non modificare Pirati salvo richiesta esplicita.
- Per bug: trovare la causa reale, cambiare il minimo indispensabile, testare e verificare prima di suggerire commit.
- Non cambiare `fortress-combat.js` per problemi puramente UI.
- Dadi sempre fisici: mai aggiungere RNG digitale al gameplay.
- Mantenere il Director come fonte delle azioni disponibili; la UI traduce, non reinventa regole.
