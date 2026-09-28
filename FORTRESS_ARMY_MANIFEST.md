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
- i KO restano nella queue: al proprio turno tentano il **rialzo del destino** con 1 D6 fisico; non vengono più espulsi da un countdown.

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
- armi a terra: `EQUIPAGGIA COME PRIMARIA` / `EQUIPAGGIA COME SECONDARIA` (una sola arma, scelta dello slot esplicita);
- `USA CURA`;
- `USA SCUDO`;
- `USA UTILITY`;
- `RIANIMA`;
- `SUPPORTA <giocatore> · +1 DADO AL SUO ATTACCO` solo durante un ingaggio reale sullo stesso nodo;
- dono tra compagni solo se il giocatore possiede davvero almeno un oggetto; con un solo oggetto il pulsante ne mostra direttamente il nome;
- `FINE TURNO`;
- le altre azioni realmente fornite dal Director.

Quando il giocatore è nel piccolo Hub locale, `ATTACCA` usa direttamente l'arma attiva già evidenziata; quindi il flusso diventa **seleziona arma attiva → ATTACCA → scegli bersaglio → preview**. Se il giocatore apre comunque il cambio arma dentro il flow d'attacco, la scelta resta sincronizzata con l'Hub.

Le sequenze **scegli arma → scegli bersaglio → preview** e **cassa → scegli cosa prendere** restano nello stesso Action Hub invece di aprire un pannello lontano. Il modale rimane per il tiro fisico/risultato, dove serve interrompere chiaramente il flusso.

Su schermi stretti l'Hub va sotto il pad di movimento ma resta nello stesso blocco immediatamente sotto la mappa; su viewport più larghe movimento e azioni sono affiancati.

Chiarezza Node Graph: l'azione zone-level `sposta` è presentata come **CAMBIA ZONA** (le frecce restano il movimento interno). Il nodo `entryNodeId` viene marcato visivamente come **ZONA SICURA** con la nota “Qui sei al riparo. Per combattere entra nel nodo dei nemici.”


### Chiarezza gameplay — passaggio successivo verificato

- **Atterraggio neutro nel Node Graph**: l'entry node è una vera area sicura/neutra. I nemici della Forest restano visibili sui loro nodi fin dall'ingresso, ma da lì `ATTACCA` non compare e l'engine rifiuta comunque una dichiarazione d'attacco. Anche i nemici ignorano i giocatori rimasti sull'entry: non li attaccano e non li inseguono. L'ingaggio inizia solo quando il giocatore lascia volontariamente l'entry e raggiunge un nodo di combattimento. `Situazione` elenca solo nemici/casse presenti sul nodo corrente nelle zone a nodi.
- **Dono tra compagni**: il vecchio `SCAMBIA` era fuorviante. Il comando compare solo se il mittente possiede almeno un oggetto cedibile. Se ne possiede uno solo, il pulsante dice direttamente cosa sta per dare (`DAI <NOME OGGETTO> A ...`); con più oggetti apre la scelta tra Primary, Secondary, Cura, Scudo e Utility realmente posseduti. Il loot ancora a terra non è cedibile. Il trasferimento resta a senso unico; se lo slot del destinatario era occupato, il suo vecchio oggetto cade a terra sul nodo dello scambio.
- **Supporto compagno**: l'ex `AIUTA` non è un generico "combatti insieme". Costa l'azione del helper e assegna **+1 dado al prossimo attacco del compagno**. Perciò non compare sul nodo neutro e l'engine lo rifiuta se non c'è un ingaggio reale sul nodo.
- **Armi a terra**: i vecchi pulsanti `RACCOGLI · PRIMARY/SECONDARY` erano ambigui. Ora dicono `EQUIPAGGIA COME PRIMARIA/SECONDARIA` e specificano che si tratta di **una sola arma**; una volta equipaggiate due armi, quella usata da `ATTACCA` si sceglie nella sezione `ARMA ATTIVA`.
- **Cura/Scudo**: le azioni mostrano il nome reale dell'oggetto e l'effetto (`USA KIT MEDICO · VITA PIENA`, `USA MEDIKIT · +6 VITA`, ecc.). `USA ORA` compare solo se la statistica può davvero aumentare: Cura nascosta a 10/10 HP, Scudo nascosto a 10/10 Shield. L'engine applica lo stesso vincolo e rifiuta l'uso a statistica piena senza consumare l'oggetto.
- **Risultato combattimento**: oltre a danni e transizione `prima → dopo`, il risultato evidenzia lo stato finale. Se subisci: `TI RESTANO ❤️ X/10 · 🛡️ Y/10`; se attacchi: `<BERSAGLIO> ORA HA ❤️ X/max · 🛡️ Y/max`.

## 9B. Combat V2 — baseline implementata 25/09/2026

Combat V2 sostituisce il vecchio scambio passivo di soli danni con **scontro + scelta di reazione**, mantenendo i dadi rigorosamente fisici.

### Bilanciamento nemici

- Normale: `8 HP`, attacco `1d6+1`;
- Aggressivo: `10 HP`, attacco `2d6+1`;
- Distanza: `8 HP + 2 Shield`, attacco `1d6+2`;
- Resistente: `16 HP + 4 Shield`, attacco `1d6+2`, perforante;
- Elite: `56 HP + 6 Shield`, attacco `2d6+2`, Area.

Ogni istanza nemico riceve un'identità persistente (`Occhio Rosso`, `Mastino`, `Bunker`, `Cerbero`, ecc.); `Normale/Aggressivo/Distanza/Resistente/Elite` sono archetipi, non più nomi mostrati come identità principale.

### Reazioni agli attacchi

Quando un nemico attacca, prima del tiro il bersaglio sceglie:

- **DIFENDITI**: 1 D6; risultati 1–6 bloccano rispettivamente `0/2/4/6/8/tutto`;
- **SCHIVA**: 1–2 danno pieno, 3–4 metà, 5 zero, 6 zero + movimento gratuito;
- **RITIRATI**: 1–2 fallisce/danno pieno, 3–4 fuga + metà danno, 5–6 fuga + zero danni;
- **CONTRATTACCA**: scambio simultaneo di danni e consumo dell'azione offensiva del round;
- **FUMOGENO**: se posseduto, fuga sicura a `0 danni` verso nodo collegato.

Se il giocatore **inizia** uno scontro e il nemico sopravvive, il nemico risponde immediatamente. Se il nemico viene eliminato dal colpo iniziale non risponde. Un nemico che ha già risposto a un ingaggio viene escluso dalla successiva fase nemici dello stesso round, evitando il doppio attacco gratuito.

L'Elite `areaDamage` non applica più danno secondario automatico: i bersagli secondari sullo stesso nodo ricevono **una reazione separata**, uno alla volta.

### Attacco di squadra

Sul medesimo nodo, massimo **3 giocatori** possono partecipare allo stesso attacco. Il leader usa l'arma attiva; per ogni compagno si sceglie esplicitamente Primary/Secondary. Ogni partecipante tira fisicamente i dadi reali della propria arma. Il totale è la somma dei contributi senza bonus artificiale.

Il riepilogo mostra per ciascun partecipante:

`nome → dadi → POWER → contributo`, più il totale squadra e HP/Shield residui del nemico.

Partecipare consuma l'**azione offensiva** del round, non l'intero turno successivo del compagno. Se il nemico sopravvive risponde una sola volta contro uno dei partecipanti; questo rende il Team Attack più efficiente di una sequenza di attacchi solitari senza renderlo gratuito.

### ATTENDI LA SQUADRA

Su un nodo di combattimento il giocatore può scegliere `ATTENDI LA SQUADRA`: chiude la propria azione/turno, resta esposto alla successiva fase nemici ma **non consuma l'azione offensiva**. Se un compagno arriva più tardi nello stesso round, il giocatore che stava aspettando può ancora essere invitato nell'Attacco di Squadra. Il pannello Party lo marca con `⏳ ATTENDE LA SQUADRA`. All'inizio del round successivo il flag viene azzerato.

### KO / resurrezione

A `0 HP` il giocatore va **KO**, non viene eliminato da un countdown.

- un compagno sullo stesso nodo può `RIALZA <nome> · COSTA 2 HP`; il soccorritore consuma l'azione, perde 2 HP e il KO torna con 3 HP;
- al proprio turno un KO può tirare **1 D6 del destino**: `1` resta KO, `2–5` torna con 2 HP, `6` torna con 4 HP;
- se tutti i giocatori sono contemporaneamente KO/eliminati, la run è sconfitta.

Il giocatore tiene anche contributi runtime distinti: `damage / defenses / supports / rescues`. Il pannello squadra sullo stesso nodo mostra HP/Shield, risorse Cura/Scudo/Utility e questi contributi per favorire decisioni cooperative.

Le ricompense persistenti per soglie di `rescues` (consumabile / arma / skin) sono progettate ma **non ancora collegate alla persistenza dell'account**: non vengono simulate in questo snapshot.

Il Boss mantiene ancora il proprio flow legacy dedicato; l'allineamento delle reazioni Combat V2 al Boss è il prossimo pass specifico e non va confuso con il sistema nemici già migrato.

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

### Assegnazione loot da combattimento

Il loot lasciato da un nemico eliminato non apre una discussione su chi debba prenderlo:

- eliminazione **in solitaria** → ogni drop è assegnato al giocatore che ha eliminato il nemico;
- **Attacco di Squadra** → ogni singolo drop viene assegnato dal sistema con una rotazione deterministica tra i partecipanti (`teamLootCursor`); un Elite con arma+supporto può quindi assegnare i due oggetti a due partecipanti diversi;
- il drop resta fisicamente a terra con `ownerPlayerId` e la UI mostra `ASSEGNATO A <nome>`;
- soltanto il giocatore assegnatario può raccoglierlo/equipaggiarlo;
- gli altri possono vederlo ma non prenderlo; dopo la raccolta il proprietario può usare il normale flusso `DAI/SCAMBIA`.

I drop da nemico nel Node Graph conservano anche il `nodeId` del nemico eliminato: non diventano loot raccoglibile da qualunque punto della zona.

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

Utility: Scanner, Fumogeno, Stim. **Scanner** ora è locale al Node Graph: compare solo sul nodo di una cassa chiusa, consuma Utility + azione, rivela il contenuto esatto senza aprire la cassa e congela quel contenuto fino all'apertura successiva; non apre più la World Map e non scansiona zone adiacenti. Stim mantiene l'uso attivo; il **Fumogeno** in Combat V2 può anche essere consumato come reazione per una **fuga sicura a 0 danni** verso un nodo collegato.

## 11. Arsenale permanente

Stati:

`SCONOSCIUTA → SCOPERTA → SBLOCCATA`

Quando un'arma viene rivelata, gli attivi presenti nella zona la scoprono. `collectedWeaponIds` tiene le armi raccolte nella run.

Regola vittoria prevista: ogni giocatore può sbloccare 1 arma raccolta nella run; Mitiche eleggibili solo se ancora equipaggiate alla vittoria.

Le armi sbloccate non vengono portate automaticamente nella run successiva: servono come scelta di loadout iniziale.

## 12. Test nello snapshot

Suite **Fortress-only** nel cumulativo:

- totale: **384 test**;
- verdi: **380**;
- fallimenti: **4**, tutti dovuti esclusivamente agli asset immagini volutamente omessi dal pacchetto:
  1. file immagini armi mancanti;
  2. directory `assets/fortress/weapons` assente;
  3. immagini personaggi mancanti;
  4. immagini zone mancanti.

Test specifici `fortress-game-ui.test.js`: **21/21 verdi**, inclusi i nuovi test su arma attiva e selezione univoca nello Action Hub.

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

### A. Verifica browser Combat V2

Playtest prioritario:

`ingaggio volontario → ATTACCA solo/team → risposta nemico → DIFESA/SCHIVA/RITIRATA/CONTRATTACCO → risultato HP residui`

più KO/destino, rialzo compagno e Fumogeno di emergenza. Verificare soprattutto leggibilità mobile e che ogni bambino capisca perché sta tirando ciascun dado.

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

### Correzione Party V2 — attesa, 2 giocatori e fase nemici locale (25/09/2026)
- L'Attacco di Squadra resta valido con **2 o 3 giocatori**; 3 e' il massimo, non il minimo.
- Se il giocatore corrente trova sul proprio nodo un compagno con `waitingForPartyThisRound=true`, l'Action Hub propone direttamente `ATTACCO DI SQUADRA · 2 GIOCATORI` (o 3 se due compagni sono gia' in attesa) e preseleziona i compagni in attesa.
- `ATTENDI LA SQUADRA` non viene mostrato se, dopo il giocatore corrente, non esiste alcun compagno attivo nella stessa zona capace di raggiungere quel nodo nello stesso round. Evita il caso a 2 giocatori in cui anche il secondo preme ATTENDI senza che nessuno possa piu' arrivare.
- Il secondo ATTENDI non trasforma automaticamente l'azione in un attacco: attendere significa sempre rinunciare all'attacco corrente e concedere l'iniziativa alla fase nemici.
- Durante `enemy-phase` la UI mantiene aperta la Node Graph locale usando il bersaglio/reazione o il nemico corrente come focus. I controlli di movimento vengono sostituiti dal banner `FASE NEMICI · RESTATE SUL NODO`, cosi' Difesa/Schivata/Ritirata avvengono senza perdere il contesto visivo dello scontro.

## Persistence V1 + Presenze — 25/09/2026

Implementata la persistenza locale della run e il roster stabile dei bambini.

### Session save
- `localStorage` key: `fortress-army-active-session-v1`.
- autosave ad ogni render significativo della partita;
- salva `state`, `dir`, avatar, landing progress e anche lo stato UI transitorio (dadi in corso, Team Attack, cassa, reazioni, ecc.);
- al reload il setup mostra `PARTITA IN CORSO` con `CONTINUA PARTITA` / `NUOVA PARTITA`;
- `NUOVA PARTITA` cancella solo la sessione attiva, non il roster/progressi permanenti.

### Roster stabile
- `localStorage` key: `fortress-army-roster-v1`;
- fino a 10 bambini con id stabili `p1..p10`, nome/avatar/loadout conservati;
- ogni bambino ha presenza `PRESENTE OGGI` indipendente dalla sua identità permanente;
- minimo 2 presenti per iniziare una nuova run.

### Presenze durante la run
- pulsante `GESTISCI PRESENZE` durante la partita;
- `ATTIVA`: il bambino già registrato entra dalla Zona Sicura della zona corrente;
- se la fase giocatori è in corso viene aggiunto in fondo al round corrente; se arriva durante fase nemici/boss entra dal round successivo;
- `DISATTIVA`: non viene più scelto come bersaglio, non conta nel Party/turni/tempesta e conserva HP/inventario/progressi della run;
- la riattivazione non rigenera casse, loot o nemici;
- `initialPlayerCount` resta invariato, quindi lo scaling iniziale non cambia quando varia la presenza.

### Test
Suite Fortress snapshot: **388 totali / 384 verdi / 4 asset-only**. I 4 fail restano esclusivamente immagini volutamente omesse dal cumulativo. Nuovi test presenza/persistenza engine: 4/4 verdi.


## LANDING ROLL V1 — 25/09/2026

Nuova regola globale di ingresso zona tramite lancio:

- ogni atterraggio iniziale e ogni `CAMBIA ZONA` richiede 1 D6 fisico prima di risolvere l'ingresso;
- 1–2: `ATTERRAGGIO DISASTROSO`, -4 HP diretti;
- 3–4: `ATTERRAGGIO OSTILE`, -2 HP diretti;
- 5–6: `ATTERRAGGIO PERFETTO`, nessun danno;
- il danno da atterraggio bypassa lo Scudo;
- il giocatore entra comunque nella zona e, nelle zone Node Graph, compare sull'entry node / Zona Sicura;
- il tiro e la destinazione in corso sono persistiti tramite `launchFlow`, quindi un refresh non perde il passaggio;
- `player.launchKitBonus` è già previsto (default 0) e modifica il risultato effettivo con clamp massimo 6; i Kit di Lancio non sono ancora contenuto giocabile;
- se il danno di atterraggio porta a 0 HP, il giocatore va KO ma resta nella zona di arrivo.

Verifica snapshot: **394 test totali / 390 verdi / 4 asset-only**. I 6 test specifici Landing Roll sono verdi.

## 2026-09-25 — STRUTTURE OPERATIVE + MEZZI PESANTI V1

Pilot iniziale: `forest`, implementazione generica/data-driven.

### Struttura operativa
- `Forest`: **Accampamento Blindato** sul nodo `forest-n04`.
- 40 HP, Corazza 3, stato visibile con barra unica.
- Tag iniziali: `TORRI ATTIVE`, `RADAR ATTIVO`.
- La struttura entra in una propria `structure-phase` dopo la fase nemici e prima del Boss.
- Tiro struttura fisico: 2d6 + 2 nel pilot.
- Se esiste un mezzo pesante occupato lo prende di mira per primo; altrimenti prende di mira un giocatore attivo nella zona.
- A 0 HP la struttura è distrutta e non agisce più.

### Demolizione
- La struttura è attaccabile a piedi solo dal proprio nodo.
- Lanciarazzi/granate/bazooka/cannoni/missili/esplosivi riconosciuti ricevono bonus Demolizione V1 (+5 se l'arma non dichiara un bonus specifico).
- Le armi possono in futuro dichiarare direttamente `demolitionBonus`.
- La Corazza della struttura riduce il danno finale.

### Mezzi pesanti temporanei
- Opportunità di visita, non ownership e non inventario persistente.
- Richiedono almeno 3 giocatori attivi nella zona.
- Equipaggio V1: esattamente 1 pilota + 2 tiratori, tutti nella Zona Sicura.
- Forest ritira a ogni visita con chance 80% tra: Camion Blindato, Ruspa d'Assalto, Autobus Corazzato.
- Quando la zona torna completamente vuota il mezzo viene eliminato; al ritorno la disponibilità viene ritirata da zero.
- Salva fisicamente 3 D6: dado 1 pilota, dadi 2-3 tiratori.
- Pilota 1: -8 Integrità; 2: -5; 5-6: +1 mira ai tiratori.
- Tiratore: 1-2 manca, 3-4 = 6 danni, 5 = 8, 6 = 10; bonus mezzo Demolizione applicato contro la struttura, poi Corazza.
- Tutti e tre consumano l'azione offensiva del round.

### Test
- Suite Fortress: **395 test / 391 verdi / 4 asset-only**.
- I 4 fail restano esclusivamente gli asset volutamente assenti nello snapshot.
- Test specifici strutture/mezzi: equipaggio minimo 3, danno pilotaggio, demolizione, reset visita, struttura offensiva e priorità mezzo verificati.

## UI Shell V2 — map-first

- Eliminata la rail laterale permanente durante il normale turno giocatore.
- Aggiunta shell bar compatta con round, giocatore attivo, HP/scudo, zona, presenze, B-Pack e accessi World Map/Utilità.
- Mappa/Zone Magnify a piena larghezza; Action Hub resta sotto la mappa come punto unico delle azioni immediate.
- Il pannello turno legacy resta visibile solo per fasi che richiedono controllo esplicito (atterraggio, enemy/structure/boss phase, reazioni/roll, fine round).
- Utility modal centralizza Sessione, Inventario, Armi, Cosmetici, Presenze e Progressi/B-Pack.
- Nessuna modifica alle regole/engine di gioco.

## UI Shell V2.2 — Libreria Armi inline
- La tab `Armi` del Centro Utilità non apre più la Libreria come overlay separato.
- I controlli, filtri, conteggio e griglia della Libreria vengono riutilizzati inline nella tab, senza duplicare dati o logica.
- Alla chiusura del Centro Utilità i nodi DOM della Libreria vengono ripristinati nella loro sede originale, mantenendo compatibilità con il pulsante Libreria esterno.
- Il dettaglio singola arma continua a usare il modal esistente sopra la UI.

## UI V2.3 — Presenze / Player Cards

La tab `Presenze` della modale Utilità è stata trasformata da elenco tecnico a roster visuale:
- avatar/skin del giocatore in formato grande;
- nome e stato PRESENTE/ASSENTE;
- HP, Scudo, zona corrente e arma primaria;
- ATTIVA/DISATTIVA direttamente sulla card;
- gli assenti restano visibili ma attenuati;
- nessuna nuova authority: usa roster, stato sessione e `setRosterPresence` esistenti.

La tab non richiede più il secondo click `GESTISCI PRESENZE`: entrando in Presenze il roster è subito visibile.

## UI mezzi pesanti — Discovery / Crew Flow (26/09/2026)

Corretto il flusso UX dei mezzi pesanti:
- il mezzo disponibile è visibile direttamente nel Node Graph, vicino alla Zona Sicura, con nome e Integrità;
- interagire col mezzo NON apre più immediatamente i dadi;
- nuovo flusso: mezzo → assegna PILOTA + TIRATORE 1 + TIRATORE 2 → conferma equipaggio → scegli struttura operativa → AVVIA ATTACCO → 3 D6 fisici;
- i tre ruoli devono essere occupati da giocatori diversi e disponibili nella Zona Sicura;
- il giocatore che apre il mezzo resta l'iniziatore del turno, ma il ruolo PILOTA può essere assegnato a qualunque membro eleggibile del trio;
- il flusso UI `vehicleFlow` è incluso nel salvataggio della sessione, quindi un refresh durante la preparazione non perde la selezione;
- nessuna modifica ai valori di danno, Integrità, Demolizione, corazza o spawn 80%.

Verifica suite snapshot senza asset: 395 test / 391 verdi / 4 asset-only già noti.

## Mezzi pesanti — multi-target per tiratore
- Ogni tiratore del mezzo sceglie il proprio bersaglio.
- Bersagli eleggibili: struttura operativa viva + nemici vivi presenti nella zona.
- I due tiratori possono dividere il fuoco o concentrare entrambi sullo stesso bersaglio.
- La demolizione si applica solo ai colpi diretti contro la struttura; i nemici usano il normale assorbimento Scudo/HP.
- L'equipaggio scelto nella UI viene ora passato realmente al Director/engine; non viene più sostituito automaticamente dai primi giocatori disponibili.
- Un nemico eliminato dal mezzo risolve il loot come ricompensa di squadra dell'equipaggio.

## RIPARI + TRAPPOLE V1 — 26/09/2026

Implementato il primo sistema generico di Ripari/Trappole sopra il Node Graph.

### Ripari temporanei di visita
- La topologia dei nodi non cambia.
- La prima entrata in una zona con `shelterOpportunity` genera 0–2 Ripari casuali.
- Forest pilot: distribuzione V1 20% nessun riparo / 50% un riparo / 30% due ripari.
- Entry/Zona Sicura e nodo della Struttura Operativa sono esclusi; un nodo cassa o encounter può diventare Riparo.
- I Ripari sono visibili subito sulla mappa locale con marker `🏚️` e nome.
- Quando tutti lasciano la zona la visita viene chiusa: Ripari e trappole vengono rimossi; una nuova visita ritira tutto.

### NASCONDITI
- Disponibile solo sul nodo Riparo.
- Consuma l'azione principale.
- Un giocatore nascosto non viene scelto come bersaglio finché esiste almeno un giocatore esposto raggiungibile.
- Se tutti i bersagli sono nascosti, restano attaccabili ma l'attacco nemico riceve `-1 dado` (clamp Combat V2 invariato).
- Muoversi o dichiarare un attacco rompe immediatamente lo stato nascosto.
- Anche la Struttura Operativa preferisce bersagli esposti quando possibile.

### Mina Improvvisata
- Nuova Utility catalogo: `mina_improvvisata`.
- Si piazza solo su un Riparo sgombro da nemici e senza un'altra trappola armata.
- Consuma Utility + azione principale.
- Scatta quando il primo nemico entra nel nodo durante il proprio movimento.
- V1: 8 danni fissi, poi la mina viene consumata.
- Se elimina il nemico, il normale loot death viene risolto e assegnato al proprietario della trappola.
- UI: marker `🪤` sul nodo e feedback esplicito nella fase nemici quando la trappola scatta.

### Test
Suite Fortress snapshot: **404 test / 400 verdi / 4 asset-only**.
I 4 fallimenti restano esclusivamente gli asset volutamente omessi (armi/personaggi/zone).
Nuovi test Ripari/Trappole: generazione 0–2, reset visita, targeting nascosto/esposto, malus -1 dado, piazzamento/consumo mina, trigger su movimento, API Director e rottura stealth all'attacco.


## UI — Tactical map visibility
- Regola fissata: tutti gli elementi tattici generati sono visibili subito nel Node Graph.
- Ripari, casse, loot, nemici, trappole e mezzi restano visibili come già implementato.
- Aggiunto marker persistente della Struttura Operativa sul proprio nodo con HP/corazza.
- La casualità determina cosa esiste nella visita, non se il Party riesce a vederlo sulla mappa.

## Weapon Index / Loot Inspector V2 — 26/09/2026
- Ricerca Libreria Armi globale su nome, id, categoria, rarità, archetipo, descrizione, ruolo, special, gittata, power/potenza; normalizza accenti e punteggiatura.
- `Mina di Prossimità`, `mitraglietta` e sinonimi/categorie diventano ricercabili correttamente.
- Le armi a terra mostrano 🔍 per aprire il dettaglio arma senza raccoglierla.
- Il dettaglio arma mostra statistiche complete e `VEDI NELL'INDICE ARMI`, che apre Utilità > Armi già focalizzata su quella voce.
- Nessuna modifica alla generazione loot o alle statistiche di combattimento.

## Party Boost V1 — 26/09/2026

- Forest pilota: `partyBoostOpportunity.chance = 0.6`.
- Una sola opportunità per visita; il marker `⚡ PARTY BOOST` è visibile sul Node Graph appena generato.
- Il nodo non può coincidere con Zona Sicura o Struttura Operativa.
- Attivazione possibile con almeno 2 giocatori attivi sullo stesso nodo.
- Tutti i membri del Party presenti sul nodo dichiarano un numero 1–6 e tirano 1 D6 fisico.
- 0 successi: nessun bonus, evento consumato.
- 1 successo: PARTY BOOST, `+1 dado` al prossimo Attacco di Squadra.
- 2+ successi: BIG BOOST, `+1 dado` ai prossimi 2 Attacchi di Squadra.
- Il bonus usa `effectBonus` del Combat esistente ed è sempre clampato al massimo di 3 dadi per arma.
- Il bonus non si applica ad attacchi individuali né ai mezzi.
- Una carica viene consumata solo quando l'Attacco di Squadra viene realmente risolto.
- L'evento e le cariche si azzerano quando la visita della zona si chiude completamente.
- UI: flow `scelta numeri -> tiro fisico -> risultato`, persistito nel session save.
- Test dedicati: spawn, 1 carica, BIG BOOST 2 cariche, applicazione/consumo sul Team Attack.
- Suite snapshot senza asset: 405 test / 401 verdi / 4 asset-only fail noti.

---

## 26/09/2026 — Map 01 MVP / Zone Director V1

La logica Node Graph validata sulla Forest è stata estesa alle altre sette zone esplorative senza duplicare engine per zona.

Nuovo cervello centrale:
- `engine/fortress-zone-director.js`
- profili riutilizzabili: wilderness, urban, highground, frontier, industrial, ruins, military, depot
- template topologici riutilizzabili: fork4, diamond5, corridor5, cross5, loop5, split6
- materializzazione automatica di node id, collegamenti, chest slot, Encounter e nodo struttura
- validazione dei riferimenti del grafo e dei contenuti

`catalog/fortress-zones.js` è ora principalmente una dichiarazione dati della Map 01.

Zone Node Graph attive:
- Abandoned City — 5 nodi / Centro Radio Fortificato
- Forest — 4 nodi / Accampamento Blindato (pilot originale invariato)
- Hill Outpost — 5 nodi / Radar di Vetta
- Frontier Camp — 5 nodi / Torre di Frontiera
- Industrial Zone — 6 nodi / Generatore Corazzato
- Ancient Ruins — 5 nodi / Sigillo Meccanico Antico
- Military Base — 6 nodi / Centro Comando Blindato / Elite nell'Encounter
- Supply Depot — 5 nodi / Deposito Munizioni Corazzato

Ogni zona esplorativa usa le stesse feature engine generiche quando abilitate dai dati:
- Safe Entry
- Encounter multi-nodo
- casse / ground loot
- ripari + trappole
- Party Boost
- mezzi pesanti
- struttura operativa
- Enemy Phase node-aware

`central-fortress` resta volutamente speciale e continua a usare il flusso Boss/finale esistente.

World Map: la rete delle 9 zone è interamente raggiungibile da ogni zona esterna. Il movimento reale Forest → Ancient Ruins → Central Fortress è coperto da test runtime.

Test aggiunti: `tests/fortress-zone-director.test.js`.
Suite corrente code-only: 412 test, 408 verdi, 4 fallimenti asset-only già noti (immagini armi, directory weapons, immagini personaggi, immagini zone omesse dallo snapshot).

## Node Layout Editor V1 — 26/09/2026

Aggiunto un editor Master separato dal gameplay:

- accesso diretto dall'header con `EDITOR MAPPE`;
- selezione di tutte le 9 zone, anche se non raggiungibili nel flusso corrente;
- trascinamento dei nodi sulla mappa con coordinate percentuali;
- scelta permanente dell'Entry Node;
- creazione/rimozione collegamenti tra nodi;
- Central Fortress, che non aveva Node Graph, può ricevere un layout base da 5 nodi;
- `SALVA LAYOUT` persiste gli override in `localStorage` (`fortress-army-node-layouts-v1`) e li ricarica automaticamente;
- se una partita è già in corso, il layout salvato viene sincronizzato anche nello stato runtime senza consumare round o azioni;
- il contenuto dinamico resta responsabilità del Zone Director: il layout non duplica regole di encounter/loot/ripari/mezzi/Party Boost.

Nuove funzioni pure in `engine/fortress-zone-director.js`:
`cloneNodeLayout`, `applyNodeLayout`, `inferConnectionDirection`, `toggleNodeConnection`, `createTemplateLayout`.

Suite dopo l'editor: 415 test totali / 411 verdi / 4 asset-only già noti.

## Map 01 — Layout nodi ufficiali (26/09/2026)

I layout disegnati manualmente nell'Editor Mappe sono ora integrati come configurazione ufficiale per tutte le 9 zone di Map 01.

- coordinate e collegamenti non dipendono più dal localStorage;
- il formato canonico portabile è `fortress-army-zone-layout` V2 con `edges` liberi;
- `abandoned-city` originale V1 è stato convertito automaticamente in V2;
- `central-fortress` ora possiede il proprio Node Graph a 5 nodi, mantenendo invariata la logica Boss/finale;
- il Zone Director converte gli `edges` V2 nel grafo runtime e conserva i metadati di contenuto dei nodi (casse/Encounter/strutture);
- copia JSON normalizzata: `config/map01-official-layouts-v2.json`.

Verifica specifica Zone Director/layout: 12/12 verde. La suite storica contiene ancora test che codificano la vecchia geometria Forest (direzioni/distanze fisse): quei test vanno resi data-driven e non indicano un errore dei nuovi layout.

## Macchina Regali Rive V1 — 27/09/2026

- Asset Rive: `assets/fortress/rive/macchinario_regali.riv`.
- Integrazione runtime Web Canvas via `@rive-app/canvas`.
- State Machine candidata: `regalo` (fallback `State Machine 1`), trigger `next`.
- Accesso: Utilità → `🎁 Regali`; dopo vittoria compare anche `🎁 VAI ALLA MACCHINA REGALI`.
- Loop premio: handoff esplicito `TOCCA A <NOME>` → 1 D6 fisico → trigger Rive → reveal arma reale → `RACCOGLI` → giocatore successivo.
- Ogni bambino presente riceve un tentativo nel giro.
- Il risultato 3 ha la probabilità più alta di Rara/Epica; il 6 non garantisce la rarità migliore.
- Le armi arrivano dal catalogo reale e la starter è esclusa dai premi.
- Se Primary/Secondary sono entrambi occupati, `RACCOGLI` chiede quale sostituire; l'arma vecchia torna a terra usando la stessa economia loot della run.
- Test mirati Macchina Regali + Inventory + Game UI: 53/53 verdi.
- La suite completa mantiene i fallimenti baseline già noti legati agli asset omessi e ai test storici che codificano la vecchia geometria Forest dopo l'introduzione dei layout ufficiali modificabili.

## Tactical Slot Editor V2 — 28/09/2026

Evoluto il precedente sistema di Tactical Anchors senza modificare le regole del Node Graph.

Architettura:
- i nodi principali restano gli unici nodi di gameplay per movimento, distanza, encounter e AI;
- ogni nodo principale può possedere un numero libero di **slot tattici** grafici per `players`, `enemies`, `vehicle`, `structure`, `chest`, `loot`, `shelter`, `trap`, `boost`, `entry`;
- ogni slot ha un ID persistente (`<nodeId>-<type>-NN`), `parentNodeId`, tipo e coordinate percentuali indipendenti;
- gli slot possono essere trascinati liberamente su tutta la scena: il legame al nodo padre è logico e non impone prossimità geometrica;
- nell'editor, quando un nodo principale è selezionato, linee tratteggiate mostrano la relazione padre → slot senza alterare i collegamenti di movimento;
- tutte le categorie possono avere più slot, così una scena può predisporre più posti per nemici, giocatori, loot, mezzi o strutture.

Determinismo runtime:
- giocatori e nemici non vengono più associati agli slot in base all'indice dell'array;
- l'assegnazione usa l'ID stabile dell'entità e conserva l'occupazione precedente finché l'entità resta sul nodo;
- se un nemico viene eliminato, gli altri token mantengono il proprio slot e lo slot liberato torna disponibile;
- se gli slot disponibili sono meno dei token, gli elementi eccedenti usano il rendering fallback già esistente.

Compatibilità/persistenza:
- storage tactical anchors portato a V2;
- i vecchi anchor V1 vengono normalizzati automaticamente nel nuovo formato senza perdere le coordinate;
- import JSON V1/V3 con vecchi `anchors` resta supportato;
- export layout portato a config V4 con slot persistenti incorporati nei nodi.

File modificati:
- `fortress-game-ui.js`
- `styles-fortress.css`
- `tests/fortress-tactical-slots.test.js` (nuovo)
- `FORTRESS_ARMY_MANIFEST.md`

Verifica mirata:
- sintassi `fortress-game-ui.js`: OK;
- test Tactical Slots + Zone Layout: 9/9 verdi;
- i test specifici verificano migrazione V1 → V2, ID slot stabili, indipendenza dall'ordine array, mantenimento dello slot dei superstiti e fallback quando i token superano gli slot.

Nota suite completa del pacchetto ricevuto:
- alcuni test asset falliscono perché nello ZIP consegnato non è presente la cartella `assets/fortress/...`;
- alcuni test storici `fortress-node-graph.test.js` assumono direzioni nominali non più coincidenti con gli attuali layout ufficiali e risultano già disallineati; nessun engine Node Graph è stato modificato in questo intervento.

### 2026-09-28 — Tactical layout sizing
- Ridotti i marker degli slot tattici nell'editor da 28px a 18px per aumentare la precisione di piazzamento.
- Nella vista tattica i token giocatore vengono renderizzati al 50% della dimensione precedente tramite `transform: scale(.5)` sul contenuto, mantenendo invariata la coordinata centrale dello slot.
- Nessuna modifica a movimento, assegnazione deterministica degli slot o dimensioni dei token nelle altre viste UI.
- Ridotta solo la resa dei mostri/nemici nella vista tattica a `scale(.6)` rispetto alla dimensione precedente, per allinearli meglio alla scala ambientale degli alberi.
- Mezzi e strutture restano invariati; coordinate, slot e logica deterministica non cambiano.


## Tactical Enemy Scale V5
- Riduzione applicata direttamente a `.fa-enemy-visual` nella vista tattica: 34×34 px.
- Strutture e mezzi invariati; riferimento struttura standard 76×62 px.
- Rimossa la dipendenza da `transform: scale(.6)` sul marker completo.


### Tactical enemy scale V6 — 28/09/2026
- Correzione effettiva della scala nemici nella Zone Magnify/tactical map.
- Il marker nemico tattico completo viene scalato inline a `0.52`, quindi sprite, nome e HP si riducono insieme.
- Strutture, mezzi, player, slot e coordinate restano invariati.
- `fortress-army.html` forza il refresh di `fortress-game-ui.js` con query version per evitare cache del vecchio renderer.


### Tactical enemy sizing V7
- Rimossa la scala del marker tattico introdotta nelle prove precedenti.
- La dimensione approvata in browser viene applicata direttamente a `.fa-enemy-visual`: `width: 39px; height: 58px`.
- Mezzi, strutture, player, slot e coordinate restano invariati.


### 2026-09-28 — Tactical enemy size V8
- Corretto override responsive: `.fa-enemy-visual` resta `39px × 58px` anche sotto 700px.
- Aggiunto cache-busting a `styles-fortress.css?v=8` in `fortress-army.html` per evitare CSS obsoleto in browser.
- Nessuna modifica a strutture, mezzi, player, slot o logica gameplay.


## Tactical enemy sizing V9
- Corretto il ridimensionamento dei mostri: `width: 39px`, altezza non più forzata a 58px.
- `.fa-enemy-map-img` usa `height:auto` per mantenere il rapporto originale dello sprite.
- Rimossa anche la forzatura `58px` nel breakpoint mobile.

### Tactical enemy force override
- Aggiunta in fondo a `styles-fortress.css` una regola finale specifica per `.fa-tactical-render-anchor.is-enemy`.
- Desktop: marker nemico `scale(.58)`.
- Mobile <=700px: marker nemico `scale(.42)`.
- `.fa-enemy-visual` forzato a `width:39px` con `!important`.
- Nessuna modifica a strutture, mezzi, player, slot o coordinate.


### Tactical enemy desktop size V11 — 28/09/2026
- Desktop: `.fa-enemy-visual` portato a `width:50px` come misura approvata in browser.
- Mobile <=700px: mantenuta la misura precedente `width:39px` e `scale(.42)`.
- Strutture, mezzi, player, slot e coordinate invariati.


### Tactical enemy device breakpoint V12 — 28/09/2026
- Corretto il breakpoint mobile: non dipende più solo dalla larghezza viewport.
- Desktop, anche con finestra <=700px, mantiene `.fa-enemy-visual` a `50px` e `scale(.58)`.
- La variante mobile (`39px`, `scale(.42)`) si applica solo a dispositivi touch/coarse pointer con viewport <=700px.
- Strutture, mezzi, player, slot e coordinate invariati.

### Tactical visual sizing V13
- Desktop enemy tactical width fixed to 45px.
- Vehicle map sprites reduced by ~20%: desktop 70x53px, mobile 58x43px.
- Mobile enemy sizing remains unchanged (39px with the existing touch-device scale).


### Official Forest layout V14 — 28/09/2026
- Il layout `forest` esportato dall'editor è ora la baseline ufficiale incorporata nel progetto (`fortress-army-zone-layout`, V4).
- `forest-n01` resta l'entry node ufficiale; 4 nodi principali e 4 collegamenti vengono applicati all'avvio prima degli eventuali override locali.
- Gli slot tattici ufficiali vengono usati come fallback runtime/editor quando non esiste un layout tattico salvato in `localStorage`.
- Forest ufficiale contiene 68 slot tattici: 10 player, 35 enemy, 4 vehicle, 4 chest, 4 loot, 4 shelter, 3 trap, 2 boost, 2 structure.
- `ENTRY +` rimosso dai Tactical Slots: l'entry è solo una proprietà del nodo principale (`entryNodeId`).
- `Ripristina` nell'editor riporta Forest alla baseline ufficiale, inclusi gli slot tattici; un successivo `Salva Layout` può ancora creare un override locale esplicito.
- Nessuna modifica a combat, Director, movimento o regole di distanza.

File modificati:
- `fortress-game-ui.js`
- `tests/fortress-official-forest-layout.test.js` (nuovo)
- `FORTRESS_ARMY_MANIFEST.md`

Verifica:
- sintassi `fortress-game-ui.js`: OK;
- test ufficializzazione Forest: OK;
- test Tactical Slots esistenti: 5/5 verdi;
- test UI puri esistenti: 19/19 verdi.

## Fase Nemici breve + rotazione equa — test bambini 28/09/2026

Feedback da sessione reale con 3 bambini: un giocatore è rimasto sul nodo di approdo, uno ha avanzato e uno si è nascosto. Nella fase nemici tutti i mostri disponibili concentravano gli attacchi sul solo giocatore esposto, allungando eccessivamente l'attesa prima del cambio fase.

Regola aggiornata:
- nella `enemy-phase` del Director **agisce un solo nemico**; dopo la sua azione la fase nemici termina immediatamente e il flusso prosegue verso strutture/Boss/fine round;
- l'attaccante ruota deterministicamente tra una fase nemici e la successiva tramite `lastEnemyPhaseActorId`, senza RNG;
- il bersaglio usa una rotazione condivisa di fase (`lastEnemyPhaseTargetId`) quando più giocatori sono equivalenti/validi, evitando che nemici differenti ripartano tutti dal primo giocatore della lista;
- restano valide le regole esistenti di ingaggio: nodo `entryNodeId` neutro, distanza/range del Node Graph, riparo/nascondersi e giocatori non attivi esclusi;
- le risposte immediate dopo un attacco iniziato dal giocatore restano separate e non consumano la singola azione della successiva `enemy-phase`;
- dadi sempre fisici e sistema reazioni invariato.

Test dedicati: 4/4 verdi, incluso lo scenario reale `entry sicura + giocatore esposto + giocatore nascosto + due mostri`. Suite `fortress-loop + fortress-director + nuovo test`: 87/87 verdi.

## 2026-09-28 — Tactical Player Miniatures V1
- Nella vista tattica i giocatori non usano più il token/avatar circolare: vengono renderizzati con i 10 nuovi WEBP dedicati in `assets/fortress-img/tactical-characters/`.
- Lo slot tattico resta la coordinata deterministica del giocatore e ora rappresenta il punto a terra: la miniatura viene ancorata con i piedi sullo slot.
- Setup, header e World Map compatta continuano a usare gli avatar/token già esistenti; la modifica riguarda solo la Tactical Map.
- Evidenziazione giocatore attivo, KO e stato nascosto sono preservati. Se l'asset tattico non carica, resta disponibile il fallback all'avatar classico.
- Asset: `automate`, `cat`, `duck`, `ghost`, `icekron`, `omalma`, `pandax`, `robotron`, `skulldrome`, `travis`.


## 2026-09-28 — Utilità / Schede Giocatore V19
- `UTILITÀ` apre ora direttamente la sezione `GIOCATORI`.
- Nuova card sintetica per ogni player: personaggio, HP, Scudo, zona/nodo, stato e contatori Arsenale.
- Click sulla card apre la scheda completa con render isometrico grande, skin equipaggiata, Arsenale permanente e loadout della run.
- I dati Arsenale arrivano esclusivamente da `FORTRESS_ARSENAL_API`; nessuna duplicazione di stato.
- Nessuna modifica a combat, loop, Director o Gift Machine.


## 2026-09-28 — PLAYER PROFILE CARD V20
- Rifatta la scheda dettaglio giocatore in Utilità come card compatta e strutturata.
- Desktop: personaggio contenuto a sinistra, dati/stato/arsenale/equipaggiamento a destra.
- Footer separato per inventario e skin.
- Mobile: layout compatto a due colonne con sezioni impilate dove necessario.
- Nessuna modifica a dati arsenale, combat, loop o Gift Machine.


## 2026-09-28 — Player selector V21
- L'anteprima `UTILITÀ → GIOCATORI` è stata ridotta a un selettore visuale compatto.
- Ogni voce mostra miniatura personaggio, nome, personaggio e stato essenziale.
- Rimossi dall'anteprima HP/scudo/posizione/arsenale: restano nella scheda interna completa V20.
- Click sulla miniatura apre direttamente la scheda giocatore.

## 2026-09-28 — Tactical Map Zoom V22
- Aggiunto viewport visuale per la Zone/Tactical Map senza modificare coordinate, nodi o gameplay.
- Zoom manuale: `1x`–`2.5x`, controlli `− / +`, rotellina mouse e pinch su touch.
- Pan manuale con trascinamento quando la mappa è zoomata.
- Pulsante `🎯 ON`: centra il giocatore attivo e porta la vista a `1.6x` solo su comando esplicito.
- Pulsante `↺`: ritorna alla vista completa `1x`.
- Nessun focus automatico al cambio turno; lo stato è solo UI e viene resettato cambiando zona.


## 2026-09-28 — Tactical Map Zoom V23 (sharp zoom)
- Sostituito lo zoom GPU `transform: scale(...)` con ridimensionamento reale della scena (`width/height` percentuali).
- Pan applicato tramite `left/top`; nessuna scala CSS dell'intero layer.
- Rimosso `will-change: transform` dalla scena tattica per evitare rasterizzazione preventiva.
- Focus manuale `🎯 ON`, pinch, wheel, pan e limiti 1×–2.5× restano invariati.
- Il focus calcola ora la posizione dal size base della scena, mantenendo il giocatore centrato anche dopo zoom precedenti.
- Nessuna modifica a coordinate, tactical slot o gameplay.


## 2026-09-28 — Tactical Map Zoom V24 (marker compensation)
- Mantenuto lo sharp zoom V23 basato su `width/height` reali della scena.
- `applyMagnifyView()` espone `--fa-tactical-content-scale` con il livello di zoom corrente.
- `.fa-node` e `.fa-tactical-render-anchor` scalano dello stesso fattore della mappa.
- Player, nemici, mezzi, strutture, casse, loot e marker mantengono quindi la stessa proporzione visiva durante zoom/focus.
- Nessuna modifica a coordinate, tactical slots, focus manuale o gameplay.


## 2026-09-28 — Tactical node tap movement V25
- I nodi direttamente collegati al nodo corrente diventano selezionabili sulla Tactical Map durante il turno del player ON.
- Il tap riusa `handleMoveNode()` e quindi `director.performMoveNode()`: nessuna seconda logica di movimento.
- Dopo che il movimento del round è stato consumato, i nodi non sono più target interattivi.
- Aggiunto stato visivo/glow solo sui nodi raggiungibili e hit-area touch più ampia del punto visivo.
- Pan e pinch impostano una breve soppressione del tap per evitare movimenti accidentali dopo un trascinamento.
- Il pulsante direzionale esistente resta disponibile come alternativa.


## 2026-09-28 — Shelter tactical player anchor V26
- I giocatori con `hiddenInShelter === true` non usano più uno slot `players` nella Tactical Map.
- Restano logicamente sullo stesso `nodeId`, ma vengono renderizzati sullo slot `shelter` del nodo.
- Quando escono dal rifugio tornano automaticamente nel normale pool di slot `players`.
- Se lo slot `shelter` non è disponibile, resta attivo il fallback precedente.
- Nessuna modifica a movimento, distanze o combat.


## 2026-09-28 — Shelter visual binding V27
- Fix rendering immediato di `NASCONDITI` dopo un movimento.
- I player normali vengono assegnati agli slot `players` usando `nodeId`.
- I player nascosti vengono esclusi completamente dal pool `players` e renderizzati sugli slot `shelter` usando `hiddenNodeId` come fonte visiva ufficiale.
- Nessuna modifica alla logica del rifugio, al movimento, al combat o al Director.


## 2026-09-28 — Ground loot support clarity V28
- Corretto il caso ambiguo Cura/Scudo/Utility nell'Action Hub.
- Se lo slot supporto è libero il comando resta `RACCOGLI`.
- Se nello slot c'è un oggetto diverso il comando diventa `SOSTITUISCI` e la UI dichiara quale oggetto verrà lasciato a terra.
- Se il giocatore possiede già lo stesso oggetto, il pulsante di raccolta non viene mostrato e compare `GIÀ NEL TUO INVENTARIO`; una copia duplicata resta correttamente a terra.
- Cure e scudi mostrano l'effetto sintetico, distinguendo ad esempio `Medikit` (+6 HP) da `Kit Medico` (cura completa).
- Nessuna modifica all'economia di loot o agli slot inventario.
