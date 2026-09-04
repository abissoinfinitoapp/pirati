/* =============================================================================
   CARTE ROTTA - eventi, tesori e razzie che il sistema pesca sulla mappa
   -----------------------------------------------------------------------------
   Non le tengono in mano i bambini: le pesca l'app quando la nave finisce su
   una casella Evento / Tesoro / Razzia. Il Master legge "readAloud" ad alta
   voce, poi la ciurma risolve con un tiro di dado oppure con una scelta.

   Ogni carta:
     id        - identificatore unico
     scope     - dove puo' uscire:  mare | isola | tesoro | razzia
     title     - nome della carta
     readAloud - 1-2 righe da leggere ai bambini: la scena
     situation - 1 riga per il Master: cos'e' e come inquadrarla
     roll      - { stat, act }  la prova: quale caratteristica e COSA fa il pirata
     success   - cosa succede se il tiro riesce (parole; l'effetto meccanico
                 lo mette l'app in base allo scope)
     fail      - cosa succede se il tiro fallisce (parole)
     choice    - opzionale, AL POSTO del roll: 2 opzioni { label, result, coins?, danger? }
   ========================================================================== */

PIRATI.registerEvents([

  /* ---- MARE ---------------------------------------------------------- */
  {
    id: "nebbia-fitta", scope: "mare", title: "Nebbia Fitta",
    readAloud: "Un muro di nebbia bianca inghiotte la prua. Sparisce la vela, sparisce il mare, sparisce tutto.",
    situation: "Bisogna tenere la rotta a naso, senza vedere niente.",
    roll: { stat: "astuzia", act: "Chi tiene il timone leggendo le correnti dal rumore dell'acqua" },
    success: "La nebbia si apre di colpo su una scia luminosa che indica la rotta giusta.",
    fail: "Girano in tondo per ore. La ciurma litiga su chi ha sbagliato."
  },
  {
    id: "corrente-favorevole", scope: "mare", title: "Corrente Favorevole",
    readAloud: "L'acqua sotto la chiglia cambia colore: una corrente veloce corre proprio dove volete andare.",
    situation: "Se la prendono al volo guadagnano tempo. Se sbagliano, la perdono e basta.",
    roll: { stat: "fortuna", act: "Chi molla le vele nell'istante esatto per agganciare la corrente" },
    success: "La nave schizza avanti come una freccia: la prossima rotta la fate senza spendere Rifornimenti.",
    fail: "La corrente li supera e se ne va. Niente di grave, solo un'occasione persa."
  },
  {
    id: "vela-strappata", scope: "mare", title: "Vela Strappata",
    readAloud: "CRAC. Una folata apre uno squarcio nella vela grande, che sbatte come un lenzuolo impazzito.",
    situation: "Va ricucita subito, arrampicandosi mentre il vento tira.",
    roll: { stat: "astuzia", act: "Chi sale sull'albero con ago e sagola e ricuce lo strappo" },
    success: "Vela come nuova, e sul pennone trovano un vecchio nido con dentro delle monete.",
    fail: "Riparata male: finché non toccate un porto la nave è lenta. Pericolo +1."
  },
  {
    id: "bottiglia-in-mare", scope: "mare", title: "Bottiglia in Mare",
    readAloud: "Una bottiglia verde sbatte contro lo scafo. Dentro, un foglio arrotolato e un po' di sabbia dorata.",
    situation: "Possono leggere il messaggio o venderlo così com'è al primo che passa.",
    choice: [
      { label: "Leggere il messaggio", result: "È un pezzo di mappa: la prossima casella Tesoro sarà più facile del solito.", danger: 0 },
      { label: "Venderla chiusa", result: "Un mercante di passaggio la paga bene per la curiosità.", coins: 100000 }
    ]
  },
  {
    id: "canto-delle-onde", scope: "mare", title: "Il Canto delle Onde",
    readAloud: "Dal nulla arriva un canto bellissimo e triste. Un marinaio ha già gli occhi lucidi e molla il timone.",
    situation: "Il canto vuole distrarli. Bisogna restare lucidi.",
    roll: { stat: "fortuna", act: "Chi canta una canzone da pirati più forte e più allegra per coprire il canto" },
    success: "La ciurma canta talmente male e forte che il canto misterioso si arrende. +1 Fama per il coraggio.",
    fail: "Restano incantati per un pezzo di rotta. Pericolo +2 quando si riscuotono."
  },
  {
    id: "relitto-alla-deriva", scope: "mare", title: "Relitto alla Deriva",
    readAloud: "Un pezzo di nave galleggia storto. Sopra, aggrappato, un pappagallo bagnato che urla: «AIUTO! ...e biscotti!».",
    situation: "Potrebbe esserci qualcuno da salvare, o solo un pappagallo affamato.",
    roll: { stat: "coraggio", act: "Chi salta sul relitto ballerino per controllare e riportare indietro chi trova" },
    success: "Salvano il pappagallo e una cassa di provviste. Il pappagallo conosce una parolaccia utilissima.",
    fail: "Il relitto si spezza sotto i piedi: tutti in acqua, tutti salvi, ma Pericolo +1 e si perde tempo."
  },
  {
    id: "tempesta-lampo", scope: "mare", title: "Tempesta Lampo",
    readAloud: "Il cielo diventa nero in un minuto. Il primo tuono fa tremare i denti.",
    situation: "Non c'è tempo di scappare: si passa dentro la tempesta.",
    roll: { stat: "coraggio", act: "Chi lega ogni cosa al suo posto e tiene la barra dritta contro le onde" },
    success: "Escono dall'altra parte fradici ma interi, e la tempesta ha spinto la nave avanti di parecchio.",
    fail: "Un'onda porta via qualcosa dal ponte. Pericolo +2."
  },
  {
    id: "pesci-volanti", scope: "mare", title: "Il Banco dei Pesci Volanti",
    readAloud: "Migliaia di pesci argentati saltano fuori dall'acqua e volano sopra il ponte come uno sciame.",
    situation: "Possono acchiapparne un po' per cena, oppure lasciarli passare e seguire dove vanno.",
    choice: [
      { label: "Acchiapparne per cena", result: "Cena abbondante per tutti: la ciurma è di ottimo umore e recupera le forze.", coins: 50000 },
      { label: "Seguire lo sciame", result: "I pesci volanti conoscono le rotte sicure: vi portano lontano dai guai.", danger: -1 }
    ]
  },

  /* ---- ISOLA -------------------------------------------------------- */
  {
    id: "scimmia-ladra", scope: "isola", title: "Scimmia Ladra",
    readAloud: "Una scimmietta sfreccia tra le gambe della ciurma, afferra un oggetto lucente e scappa sull'albero più alto ridendo.",
    situation: "Ha preso qualcosa di utile. Rincorrerla di forza non serve.",
    roll: { stat: "fortuna", act: "Chi le offre in cambio qualcosa di ancora più lucente e interessante" },
    success: "Lo scambio funziona: riavete l'oggetto e la scimmia vi mostra pure un sentiero nascosto.",
    fail: "La scimmia sparisce con il bottino. Restate senza e un po' arrabbiati."
  },
  {
    id: "tamburi-nella-giungla", scope: "isola", title: "Tamburi nella Giungla",
    readAloud: "Dal folto arrivano tamburi. Non li vedete, ma vi stanno di sicuro guardando.",
    situation: "Non sono per forza nemici: dipende da come rispondete.",
    roll: { stat: "coraggio", act: "Chi risponde battendo lo stesso ritmo su una cassa, per dire «siamo amici»" },
    success: "I tamburi rispondono allegri: gli abitanti escono e vi regalano frutta e un consiglio sulla rotta.",
    fail: "I tamburi si fanno minacciosi. Vi ritirate in fretta: Pericolo +2."
  },
  {
    id: "guardia-sonnacchiosa", scope: "isola", title: "Guardia Sonnacchiosa",
    readAloud: "Davanti al passaggio c'è una guardia enorme, appoggiata alla lancia... che russa.",
    situation: "Si può passare senza svegliarla, se si è silenziosi.",
    roll: { stat: "astuzia", act: "Chi guida la fila in punta di piedi, scegliendo dove mettere i piedi" },
    success: "Passano tutti. Uno riesce pure a sfilarle le chiavi dalla cintura.",
    fail: "Qualcuno pesta un rametto. La guardia si sveglia di malumore: scontro leggero, Pericolo +1."
  },
  {
    id: "sabbie-mobili", scope: "isola", title: "Sabbie Mobili",
    readAloud: "Il terreno diventa molle. Un pirata affonda fino alle ginocchia in un attimo e si spaventa.",
    situation: "Da soli non se ne esce: serve la ciurma unita.",
    roll: { stat: "coraggio", act: "Chi organizza la catena umana e coordina il «TIRA!» tutti insieme" },
    success: "Lo tirano fuori con un botto ridicolo. Nella sabbia resta impigliato anche un vecchio forziere.",
    fail: "Lo salvano, ma nel trambusto si perde uno zaino di provviste. Pericolo +1."
  },
  {
    id: "rovine-che-parlano", scope: "isola", title: "Le Rovine che Parlano",
    readAloud: "Tra i muri crollati, il vento fa un suono strano: sembra che le pietre stiano bisbigliando dei nomi.",
    situation: "Gli echi indicano la strada, per chi sa ascoltare senza spaventarsi.",
    roll: { stat: "astuzia", act: "Chi si ferma, chiude gli occhi e segue l'eco più chiaro" },
    success: "L'eco li porta dritti a una stanza segreta piena di roba utile.",
    fail: "Si perdono nel labirinto di rovine. Quando riescono a uscire hanno perso tempo: Pericolo +1."
  },
  {
    id: "vecchio-eremita", scope: "isola", title: "Il Vecchio Eremita",
    readAloud: "Un vecchietto con la barba lunga fino ai piedi è seduto su un sasso. «Nessuno passa senza pagare... in indovinelli o in cena.»",
    situation: "Vuole compagnia. Sceglie la ciurma: sfida di indovinelli o offrirgli da mangiare.",
    choice: [
      { label: "Rispondere all'indovinello", result: "Se il tavolo indovina, l'eremita rivela una scorciatoia sicura.", danger: -1 },
      { label: "Offrirgli la cena", result: "Commosso, vi disegna la mappa dei pericoli qui intorno e vi dà la sua benedizione.", coins: 0 }
    ]
  },
  {
    id: "fiori-che-dormono", scope: "isola", title: "Il Campo dei Fiori che Dormono",
    readAloud: "Un prato di fiori viola blocca il sentiero. Il loro profumo è dolcissimo... e fa cadere una lucertola addormentata proprio davanti a voi.",
    situation: "Attraversarlo respirando quel profumo significa addormentarsi a metà.",
    roll: { stat: "fortuna", act: "Chi guida la ciurma trattenendo il respiro, tappandosi il naso con un panno bagnato" },
    success: "Passano di corsa senza respirare e dall'altra parte trovano l'alveare di miele dei fiori.",
    fail: "Un paio si appisolano in mezzo al campo. Bisogna tornare a prenderli: tempo perso, Pericolo +1."
  },
  {
    id: "ponte-di-liane", scope: "isola", title: "Il Ponte di Liane",
    readAloud: "Un ponte di liane traballante attraversa un burrone profondissimo. Metà tavole sono marce.",
    situation: "Si passa una persona alla volta, provando ogni tavola.",
    roll: { stat: "coraggio", act: "Chi va per primo, prova ogni tavola col piede e indica dove mettere i piedi agli altri" },
    success: "Passano tutti. A metà ponte, incastrato tra le liane, c'è un sacchetto perso da qualcuno prima di voi.",
    fail: "Una tavola cede: nessuno si fa male ma qualcosa cade nel burrone. Pericolo +1."
  },

  /* ---- TESORO ----------------------------------------------------- */
  {
    id: "forziere-nella-scogliera", scope: "tesoro", title: "Il Forziere nella Scogliera",
    readAloud: "Incastrato tra due rocce a pelo d'acqua c'è un forziere, ancora chiuso col lucchetto tutto arrugginito.",
    situation: "Si apre, ma le onde lo sbattono contro gli scogli: bisogna fare in fretta.",
    roll: { stat: "fortuna", act: "Chi si tuffa e cerca a tastoni la chiave nascosta sotto il forziere" },
    success: "Aperto appena in tempo! E sotto un doppio fondo c'è ancora roba.",
    fail: "Un'onda porta via il forziere. Riuscite ad afferrare solo due monete. Pericolo +1."
  },
  {
    id: "albero-dei-dobloni", scope: "tesoro", title: "L'Albero dei Dobloni",
    readAloud: "Un albero storto ha i rami carichi di monete che tintinnano al vento. In cima, però, c'è un enorme nido di vespe.",
    situation: "Vanno prese le monete scuotendo il ramo giusto, senza svegliare le vespe.",
    roll: { stat: "astuzia", act: "Chi studia i rami e sceglie quale scuotere piano stando lontano dal nido" },
    success: "Scelta perfetta: una pioggia di dobloni, zero vespe.",
    fail: "Ramo sbagliato. Fuga generale inseguiti dalle vespe: prendete poco e Pericolo +1."
  },
  {
    id: "tomba-del-pirata", scope: "tesoro", title: "La Tomba del Vecchio Capitano",
    readAloud: "Una lapide di legno, una spada piantata nella sabbia e sotto, si intravede, un baule. Sopra è scritto: «Prendi pure. Ma con rispetto.»",
    situation: "Il bottino c'è. Basta prenderlo senza combinare pasticci né toccare le ossa.",
    roll: { stat: "coraggio", act: "Chi entra per primo, saluta il vecchio capitano ad alta voce e prende solo il baule" },
    success: "Il baule è pieno. Uscendo, il vento sembra dire «grazie»: +1 Fama.",
    fail: "Qualcuno inciampa e sparge tutto. Raccogliete di fretta metà bottino. Pericolo +1."
  },
  {
    id: "granchio-tesoriere", scope: "tesoro", title: "Il Granchio Tesoriere",
    readAloud: "Un granchio grosso come un cane è seduto su un mucchietto di monete e vi fissa. Non scappa. Aspetta.",
    situation: "Non vuole combattere: colleziona cose. Si tratta o si aspetta.",
    choice: [
      { label: "Offrirgli qualcosa di buffo", result: "Adora il vostro oggetto strano e in cambio vi lascia prendere tutto il mucchietto.", coins: 200000 },
      { label: "Aspettare che si distragga", result: "Prima o poi arriva un gabbiano: il granchio si volta e voi arraffate quello che potete.", coins: 125000 }
    ]
  },
  {
    id: "sacco-sepolto", scope: "tesoro", title: "Il Sacco Sepolto",
    readAloud: "Un pezzo di mappa strappata indica una X su questa spiaggia. Sotto la X, la sabbia è più scura.",
    situation: "Va scavato nel punto esatto: sbagliare di poco vuol dire scavare un'ora per niente.",
    roll: { stat: "fortuna", act: "Chi confronta la mappa con le rocce intorno e pianta la pala nel punto giusto" },
    success: "Due palate e via: un sacco pesante che tintinna promettente.",
    fail: "Scavano tre buche sbagliate. Alla fine trovano solo un vecchio stivale con dentro qualche moneta."
  },

  /* ---- RAZZIA ---------------------------------------------------- */
  {
    id: "accampamento-abbandonato", scope: "razzia", title: "L'Accampamento Abbandonato",
    readAloud: "Tende strappate, un fuoco ancora tiepido, casse mezze aperte. Chi c'era se n'è andato di fretta... o si è nascosto.",
    situation: "C'è roba buona, ma potrebbe essere una trappola o il proprietario potrebbe tornare.",
    roll: { stat: "astuzia", act: "Chi controlla le casse per fili e trappole prima di aprirle" },
    success: "Bottino pieno e via prima che qualcuno torni: monete e provviste.",
    fail: "Era una trappola: rete addosso e fuga a mani quasi vuote. Pericolo +1."
  },
  {
    id: "carovana-di-terra", scope: "razzia", title: "La Carovana di Terra",
    readAloud: "Un carretto tirato da due tartarughe giganti avanza lento sul sentiero, carico di sacchi. Il conducente dorme.",
    situation: "Un pedaggio si può chiedere. Con la faccia giusta.",
    roll: { stat: "coraggio", act: "Chi si para davanti alle tartarughe e chiede il pedaggio con la voce più grossa che ha" },
    success: "Il conducente si sveglia, si spaventa, molla un sacco di monete e riparte di corsa (si fa per dire).",
    fail: "Il conducente scoppia a ridere: non fate abbastanza paura. Ve ne andate a mani vuote e un po' offesi."
  },
  {
    id: "deposito-sulla-scogliera", scope: "razzia", title: "Il Deposito sulla Scogliera",
    readAloud: "A metà parete di roccia, dentro una fenditura, qualcuno ha nascosto delle casse. La marea sta salendo.",
    situation: "Si cala una corda e si risale col bottino prima che l'acqua arrivi lì.",
    roll: { stat: "fortuna", act: "Chi si cala sulla parete, riempie il sacco e risale contro il tempo" },
    success: "Su tutto, con un secondo di margine. Dentro le casse: parecchie monete.",
    fail: "La marea li batte sul tempo: recuperano una cassa sola e si prendono un bello spavento."
  },
  {
    id: "nave-mercantile-arenata", scope: "razzia", title: "La Mercantile Arenata",
    readAloud: "Una nave da carico si è incagliata su un banco di sabbia. L'equipaggio è in panico e vi vede arrivare.",
    situation: "Con la faccia tosta giusta, potete farvi consegnare parte del carico «per il disturbo».",
    roll: { stat: "astuzia", act: "Chi si presenta come «i soccorritori ufficiali del porto» e si fa pagare in anticipo" },
    success: "Ci cascano: vi caricano di merce «di ringraziamento» e vi salutano pure.",
    fail: "Il capitano non ci casca e chiama a raccolta i suoi. Meglio ritirarsi: Pericolo +1."
  }

]);
