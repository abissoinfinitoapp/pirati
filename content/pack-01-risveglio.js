/* =============================================================================
   PACCHETTO 01 - Ciclo I: Le rotte del risveglio
   8 isole, 16 avventure. Questo file e' SOLO contenuti: nessuna logica.
   Per crearne uno nuovo copia questo file, cambia 'id' e i testi,
   e aggiungi la riga <script> in index.html. Guida completa:
   content/_COME-SCRIVERE-UNA-QUEST.md
   ========================================================================== */

PIRATI.registerPack({
  id: "risveglio",
  name: "Ciclo I · Le rotte del risveglio",

  islands: [
    { id: "rovine",    name: "Rovine della Giungla",     icon: "♜", color: "green",  blurb: "Templi che respirano e ponti rubati dai pappagalli." },
    { id: "vulcano",   name: "Vulcano Ruggente",         icon: "▲", color: "red",    blurb: "Un cratere che borbotta come una pentola dimenticata sul fuoco." },
    { id: "corallo",   name: "Forte di Corallo",         icon: "♛", color: "coral",  blurb: "Statue che pongono domande e pavimenti che ballano con le onde." },
    { id: "palude",    name: "Mangrovie Sussurranti",    icon: "♧", color: "moss",   blurb: "Radici che parlano e case che decidono di andarsene a spasso." },
    { id: "grotta",    name: "Grotta della Luna",        icon: "☾", color: "violet", blurb: "L'eco e' stata rubata e le lucciole sollevano i sassi in aria." },
    { id: "cascata",   name: "Laguna delle Cascate",     icon: "≋", color: "blue",   blurb: "Una sirena che sbadiglia e un fiume che ha deciso di risalire." },
    { id: "scogliere", name: "Scogliere del Vento",      icon: "⌁", color: "sky",    blurb: "Un mulino macina le nuvole e tre uova custodiscono piccoli venti." },
    { id: "tesoro",    name: "Spiaggia Dorata",          icon: "◆", color: "gold",   blurb: "Un granchio con gli occhiali tiene la Banca delle Maree." }
  ],

  quests: [

    /* ---- ROVINE DELLA GIUNGLA ------------------------------------------- */
    {
      id: "tempio-starnutisce", island: "rovine", order: 1,
      title: "Il Tempio che Starnutisce", kind: "Mistero comico",
      difficulty: 5, minutes: 55,
      readAloud: "Le porte del tempio tremano. Dall'interno arriva un gigantesco... ECCIÙ! Una nuvola di polvere disegna una freccia nell'aria.",
      readKids: {
        facile: [
          "Il tempio trema forte.",
          "Fa un grande ECCIÙ!",
          "La polvere disegna una freccia."
        ],
        avanzato: [
          "Le porte del tempio tremano come se avessero freddo.",
          "Da dentro arriva uno starnuto enorme: ECCIÙ!",
          "Una nuvola di polvere resta sospesa nell'aria.",
          "Piano piano la polvere prende la forma di una freccia."
        ]
      },
      goal: "Recuperare la Tavoletta del Primo Vento senza far crollare il tempio.",
      beats: [
        "Fate inventare ai bambini perché il tempio starnutisce.",
        "Tre statue hanno nasi diversi: solo una apre il passaggio sicuro.",
        "La tavoletta è protetta da una piuma che fa starnutire chi mente."
      ],
      choices: [
        { label: "Curare il tempio", stat: "astuzia", target: 6, result: "Preparano un rimedio con foglie e acqua salata e il tempio si calma." },
        { label: "Seguire gli starnuti", stat: "fortuna", target: 5, result: "Ogni starnuto rivela per un attimo il percorso giusto." }
      ],
      groupChallenge: "Inventate insieme una medicina per un tempio che starnutisce: serve un ingrediente, un modo per darlo e una parola magica.",
      rewards: [
        { type: "loot", id: "tavoletta-vento" },
        { type: "coins", amount: 10 },
        { type: "trophy", id: "eroe-del-tempio" },
        { type: "power", id: "soffio-starnuto" }
      ],
      growth: "Chi ascolta l'idea di un compagno e la migliora segna 1 crescita Astuzia.",
      fail: "Una sala crolla: Pericolo +1, ma il crollo apre una scorciatoia inattesa.",
      escape: "Costruire una slitta di foglie: prova di Astuzia 6, poi scivolare fino alla costa."
    },
    {
      id: "ponte-pappagalli", island: "rovine", order: 2,
      title: "Il Ponte dei Pappagalli", kind: "Trattativa",
      difficulty: 6, minutes: 55,
      readAloud: "Centinaia di pappagalli hanno rubato le assi del ponte e chiedono come pedaggio una parola nuova. Una parola che nessuno abbia mai detto!",
      readKids: {
        facile: [
          "I pappagalli hanno rubato il ponte.",
          "Vogliono una parola nuova.",
          "Una parola che non esiste ancora!"
        ],
        avanzato: [
          "Centinaia di pappagalli si sono presi tutte le assi del ponte.",
          "Gridano tutti insieme e chiedono un pedaggio.",
          "Non vogliono monete: vogliono una parola nuova.",
          "Deve essere una parola che nessuno ha mai pronunciato prima."
        ]
      },
      goal: "Attraversare il burrone e convincere lo stormo a ricostruire il ponte.",
      beats: [
        "Ogni bambino propone una parola inventata e il suo significato.",
        "Il Re Pappagallo sceglie le tre più buffe.",
        "Una scimmia gelosa porta via l'ultima asse."
      ],
      choices: [
        { label: "Inventare una storia", stat: "astuzia", target: 6, result: "Le parole nuove diventano una storia che convince lo stormo." },
        { label: "Recuperare l'asse", stat: "coraggio", target: 6, result: "Inseguimento tra le liane, senza combattere, per riprendere l'asse." }
      ],
      groupChallenge: "Create una parola che non esiste, decidete insieme cosa significa e usatela in una frase da pirati.",
      rewards: [
        { type: "loot", id: "richiamo-stormo" },
        { type: "coins", amount: 9 },
        { type: "trophy", id: "voce-dello-stormo" },
        { type: "power", id: "fionda-parole" }
      ],
      growth: "Chi inventa la parola scelta dal Re Pappagallo segna 1 crescita Fortuna.",
      fail: "Il ponte regge solo una persona alla volta: il gruppo si separa per un tratto.",
      escape: "Chiamare i pappagalli con una filastrocca e farsi trasportare: prova di Fortuna 7."
    },

    /* ---- VULCANO RUGGENTE --------------------------------------------- */
    {
      id: "zuppa-vulcano", island: "vulcano", order: 1,
      title: "La Zuppa del Vulcano", kind: "Emergenza",
      difficulty: 6, minutes: 60,
      readAloud: "Il cratere borbotta come una pentola. Un piccolo gigante assaggia la lava con un mestolo e grida: «Manca qualcosa!».",
      readKids: {
        facile: [
          "Il vulcano borbotta come una pentola.",
          "Un gigante assaggia la lava.",
          "Dice: «Manca un ingrediente!»"
        ],
        avanzato: [
          "Il cratere gorgoglia piano, come una minestra sul fuoco.",
          "Un piccolo gigante ci tuffa dentro un mestolo enorme.",
          "Assaggia, storce il naso e scuote la testa.",
          "«Manca qualcosa!» grida. «Portatemi l'ingrediente giusto!»"
        ]
      },
      goal: "Calmare il vulcano preparando l'ingrediente fantastico richiesto dal gigante.",
      beats: [
        "I bambini decidono che sapore dovrebbe avere una zuppa di lava.",
        "Servono tre ingredienti nascosti su sentieri diversi.",
        "L'ultimo ingrediente va aggiunto tutti insieme al conto di tre."
      ],
      choices: [
        { label: "Ricetta precisa", stat: "astuzia", target: 7, result: "Capiscono l'ordine esatto degli ingredienti e la zuppa si calma." },
        { label: "Assaggio coraggioso", stat: "coraggio", target: 6, result: "Una goccia magica è caldissima ma non brucia: funziona." }
      ],
      groupChallenge: "Quali tre ingredienti fantastici calmano un vulcano senza spegnerlo? Spiegate perché funzionano insieme.",
      rewards: [
        { type: "loot", id: "pietra-tiepida" },
        { type: "coins", amount: 11 },
        { type: "trophy", id: "cuoco-del-cratere" },
        { type: "power", id: "cucchiaione-gigante" }
      ],
      growth: "Chi tiene calmo il gruppo e dà il ritmo del «uno, due, tre» segna 1 crescita Coraggio.",
      fail: "Il vulcano fa un rutto di cenere: tutti tornano al molo, Rifornimenti −1.",
      escape: "Creare una zattera di pietra pomice che galleggia: prova di Astuzia 6."
    },
    {
      id: "salamandra-smemorata", island: "vulcano", order: 2,
      title: "La Salamandra Smemorata", kind: "Salvataggio",
      difficulty: 6, minutes: 55,
      readAloud: "Una salamandra luminosa corre in cerchio: ha dimenticato dove ha nascosto il suo uovo e il guscio sta iniziando a cantare.",
      readKids: {
        facile: [
          "Una salamandra corre in tondo.",
          "Ha perso il suo uovo.",
          "L'uovo canta piano piano."
        ],
        avanzato: [
          "Una salamandra tutta luce corre in cerchio, agitata.",
          "Ha nascosto il suo uovo e non ricorda più dove.",
          "In lontananza il guscio dell'uovo comincia a cantare.",
          "Più il tempo passa, più il canto diventa forte."
        ]
      },
      goal: "Ritrovare l'uovo seguendo indizi di calore prima del tramonto.",
      beats: [
        "Tre rocce calde contengono falsi indizi divertenti.",
        "Il canto dell'uovo cambia nota vicino alla strada giusta.",
        "Un fiume di lava lenta separa il gruppo dal nido."
      ],
      choices: [
        { label: "Ascoltare il canto", stat: "fortuna", target: 6, result: "Seguono la nota più limpida e arrivano al nido." },
        { label: "Costruire un passaggio", stat: "astuzia", target: 6, result: "Un ponte di gusci minerali attraversa la lava lenta." }
      ],
      groupChallenge: "Costruite una catena di tre indizi che aiuti la salamandra a ricordare dove ha nascosto l'uovo.",
      rewards: [
        { type: "loot", id: "scaglia-lucente" },
        { type: "coins", amount: 10 },
        { type: "trophy", id: "amico-della-salamandra" },
        { type: "power", id: "scaglia-salamandra" }
      ],
      growth: "Chi protegge l'uovo e lo tiene al sicuro segna 1 crescita Coraggio.",
      fail: "L'uovo si schiude in anticipo e il cucciolo sceglie un bambino da seguire ovunque.",
      escape: "Bere una Pozione delle Bolle Volanti nascosta nel nido: prova di Fortuna 6."
    },

    /* ---- FORTE DI CORALLO -------------------------------------------- */
    {
      id: "guardiani-corallo", island: "corallo", order: 1,
      title: "I Guardiani di Corallo", kind: "Enigma",
      difficulty: 7, minutes: 60,
      readAloud: "Le statue del forte aprono gli occhi. Non impugnano armi: porgono tre conchiglie e chiedono quale voce merita di entrare.",
      readKids: {
        facile: [
          "Le statue aprono gli occhi.",
          "Hanno tre conchiglie in mano.",
          "Chiedono: «Chi può entrare?»"
        ],
        avanzato: [
          "Le grandi statue del forte spalancano gli occhi di pietra.",
          "Non hanno spade: tendono verso di voi tre conchiglie.",
          "Da ogni conchiglia esce una voce diversa.",
          "«Quale di queste voci dice la verità?» chiedono i guardiani."
        ]
      },
      goal: "Aprire il forte scegliendo la conchiglia che racconta la verità.",
      beats: [
        "Una conchiglia esagera, una dimentica un pezzo, una dice la verità.",
        "Ogni guardiano pone una domanda sulla ciurma.",
        "La porta si apre solo se due bambini danno fiducia allo stesso compagno."
      ],
      choices: [
        { label: "Confrontare i racconti", stat: "astuzia", target: 7, result: "Trovano le differenze fra i tre racconti e scoprono quello vero." },
        { label: "Fidarsi dell'istinto", stat: "fortuna", target: 7, result: "Scelgono dal suono del mare dentro la conchiglia." }
      ],
      groupChallenge: "Inventate tre frasi: una vera, una esagerata e una incompleta. Poi spiegate come si riconosce quella vera.",
      rewards: [
        { type: "loot", id: "conchiglia-veritiera-loot" },
        { type: "coins", amount: 12 },
        { type: "trophy", id: "custode-della-verita" },
        { type: "power", id: "conchiglia-veritiera" }
      ],
      growth: "I due che si danno fiducia a vicenda segnano 1 crescita Astuzia ciascuno.",
      fail: "Entrano comunque, ma una porta segreta si chiude alle loro spalle.",
      escape: "Attivare un arco di teletrasporto del forte: prova di Astuzia 7."
    },
    {
      id: "ballo-maree", island: "corallo", order: 2,
      title: "Il Ballo delle Maree", kind: "Festa pericolosa",
      difficulty: 6, minutes: 55,
      readAloud: "Il pavimento del forte si alza e si abbassa con le onde. I granchi musicisti gridano: «Solo chi balla può raggiungere la torre!».",
      readKids: {
        facile: [
          "Il pavimento sale e scende.",
          "I granchi suonano la musica.",
          "«Balla per salire sulla torre!»"
        ],
        avanzato: [
          "Il pavimento del forte respira su e giù come il mare.",
          "In un angolo un'orchestra di granchi suona senza fermarsi mai.",
          "«Solo chi balla a tempo raggiunge la torre!» gridano.",
          "In cima alla torre c'è una campana d'argento che aspetta."
        ]
      },
      goal: "Seguire il ritmo delle maree e arrivare alla campana della torre.",
      beats: [
        "Insieme si crea un ritmo battendo le mani.",
        "Ogni errore sposta un ponte in una direzione buffa.",
        "La campana va suonata con un passo di danza inventato dalla ciurma."
      ],
      choices: [
        { label: "Imparare il ritmo", stat: "astuzia", target: 5, result: "Memorizzano la sequenza delle piattaforme e attraversano sicuri." },
        { label: "Danzare senza paura", stat: "coraggio", target: 6, result: "Attraversano anche quando l'acqua sale all'improvviso." }
      ],
      groupChallenge: "Create un ritmo di quattro gesti che tutta la ciurma riesca a ripetere nello stesso ordine.",
      rewards: [
        { type: "loot", id: "campanella-marea" },
        { type: "coins", amount: 9 },
        { type: "trophy", id: "ballerino-delle-onde" },
        { type: "power", id: "tamburo-marea" }
      ],
      growth: "Chi aiuta un compagno rimasto fuori tempo segna 1 crescita Fortuna.",
      fail: "Un'onda alta divide la ciurma su due terrazze diverse del forte.",
      escape: "Suonare la campanella e guidare una barca di corallo fino alla costa: prova di Fortuna 6."
    },

    /* ---- MANGROVIE SUSSURRANTI -------------------------------------- */
    {
      id: "radici-sussurranti", island: "palude", order: 1,
      title: "Le Radici Sussurranti", kind: "Mistero",
      difficulty: 6, minutes: 55,
      readAloud: "Le radici pronunciano i nomi dei pirati, ma ogni voce arriva da una direzione diversa. Una sola conduce alla casa sull'albero.",
      readKids: {
        facile: [
          "Le radici dicono i vostri nomi.",
          "Le voci arrivano da ogni parte.",
          "Solo una porta alla casa giusta."
        ],
        avanzato: [
          "Nella nebbia le radici sussurrano i nomi di tutta la ciurma.",
          "Ma ogni voce sembra venire da una direzione diversa.",
          "Alcune voci vogliono aiutarvi, altre vogliono confondervi.",
          "Una sola strada porta davvero alla casa sull'albero della Custode."
        ]
      },
      goal: "Raggiungere la casa della Custode senza perdersi nella nebbia.",
      beats: [
        "Una voce imita un compagno e propone una scorciatoia sospetta.",
        "I bambini devono creare un segnale per riconoscersi tra loro.",
        "La Custode chiede perché la ciurma è rimasta unita."
      ],
      choices: [
        { label: "Segnare il percorso", stat: "astuzia", target: 6, result: "Lasciano nodi e simboli sulle radici e non si perdono." },
        { label: "Seguire la voce gentile", stat: "fortuna", target: 6, result: "La palude aiuta chi risponde con cortesia." }
      ],
      groupChallenge: "Scegliete una parola d'ordine, un gesto e un suono per riconoscervi nella nebbia senza confondervi.",
      rewards: [
        { type: "loot", id: "seme-bussola-loot" },
        { type: "coins", amount: 10 },
        { type: "trophy", id: "guida-nella-nebbia" },
        { type: "power", id: "seme-bussola" }
      ],
      growth: "Chi inventa il segnale di riconoscimento segna 1 crescita Astuzia.",
      fail: "Il gruppo raggiunge la casa ma perde 1 Rifornimento nella nebbia.",
      escape: "Far crescere una canoa di radici cantando una filastrocca: prova di Astuzia 6."
    },
    {
      id: "casa-cammina", island: "palude", order: 2,
      title: "La Casa che Cammina", kind: "Inseguimento",
      difficulty: 6, minutes: 60,
      readAloud: "La casa sulle palafitte solleva quattro zampe di legno e parte nella palude. Da una finestra una nonna pirata urla: «Fermatemi, ho dimenticato il freno!».",
      readKids: {
        facile: [
          "La casa ha quattro zampe di legno.",
          "Si mette a camminare!",
          "La nonna grida: «Non ho il freno!»"
        ],
        avanzato: [
          "La casa sulle palafitte si scrolla e tira fuori quattro zampe di legno.",
          "Poi parte a passo svelto in mezzo alla palude.",
          "Da una finestra una nonna pirata sventola le braccia.",
          "«Fermatemi!» urla. «Sono partita senza montare il freno!»"
        ]
      },
      goal: "Raggiungere la casa e costruire un freno prima che finisca in mare.",
      beats: [
        "Ogni sentiero permette a un gruppo di raggiungere una zampa diversa.",
        "Servono idee differenti per rallentarla senza romperla.",
        "Il freno finale funziona solo se attivato da tutti nello stesso momento."
      ],
      choices: [
        { label: "Saltare a bordo", stat: "coraggio", target: 6, result: "Raggiungono il portico aggrappandosi alle liane." },
        { label: "Inventare il freno", stat: "astuzia", target: 7, result: "Costruiscono un sistema di corde e foglie che rallenta la casa." }
      ],
      groupChallenge: "Progettate un freno usando solo tre oggetti trovati in una palude e date un compito preciso a ogni pirata.",
      rewards: [
        { type: "loot", id: "palafitta-loot" },
        { type: "coins", amount: 11 },
        { type: "trophy", id: "domatore-di-case" },
        { type: "power", id: "palafitta-pieghevole" }
      ],
      growth: "Ogni gruppo che porta a termine il proprio compito segna 1 crescita condivisa.",
      fail: "La casa arriva in riva al mare e diventa una buffa barca a quattro zampe.",
      escape: "Usare la casa stessa come nave e governarla con quattro remi: prova di Coraggio 6."
    },

    /* ---- GROTTA DELLA LUNA ----------------------------------------- */
    {
      id: "eco-rubata", island: "grotta", order: 1,
      title: "L'Eco Rubata", kind: "Indagine",
      difficulty: 7, minutes: 60,
      readAloud: "Nella grotta nessun suono ritorna indietro. Una creatura d'ombra ha raccolto tutte le eco dentro barattoli luminosi.",
      readKids: {
        facile: [
          "Nella grotta l'eco non risponde.",
          "Un'ombra l'ha messa nei barattoli.",
          "I barattoli brillano nel buio."
        ],
        avanzato: [
          "Provate a gridare, ma nella grotta nessun suono torna indietro.",
          "Sugli scaffali ci sono decine di barattoli che brillano.",
          "Dentro ogni barattolo è chiusa un'eco: una voce, una risata, un tonfo.",
          "Una creatura fatta d'ombra le ha rubate tutte, una per una."
        ]
      },
      goal: "Liberare le eco senza svegliare il grande cristallo addormentato.",
      beats: [
        "Ogni barattolo contiene una voce o un rumore buffo.",
        "Per un tratto i bambini possono comunicare solo a gesti.",
        "L'ombra restituisce le eco se riceve un suono mai sentito prima."
      ],
      choices: [
        { label: "Muoversi in silenzio", stat: "astuzia", target: 7, result: "Evitano le pietre musicali e raggiungono i barattoli." },
        { label: "Inventare un suono", stat: "fortuna", target: 6, result: "La creatura si meraviglia e apre da sola i barattoli." }
      ],
      groupChallenge: "Inventate un suono mai sentito prima combinando voce, mani e un oggetto che avete sul tavolo.",
      rewards: [
        { type: "loot", id: "barattolo-eco-loot" },
        { type: "coins", amount: 12 },
        { type: "trophy", id: "liberatore-di-eco" },
        { type: "power", id: "barattolo-eco" }
      ],
      growth: "Chi riesce a farsi capire meglio senza parlare segna 1 crescita Astuzia.",
      fail: "Il cristallo si sveglia e canta: la grotta cambia forma e percorso.",
      escape: "Pronunciare tutti insieme la parola «casa» dentro il cerchio di teletrasporto: prova di Fortuna 7."
    },
    {
      id: "lucciole-volanti", island: "grotta", order: 2,
      title: "Le Lucciole che Fanno Volare", kind: "Raccolta magica",
      difficulty: 6, minutes: 55,
      readAloud: "Migliaia di lucciole azzurre sollevano sassolini in aria. Una pozionista intrappolata sul soffitto chiede ingredienti per scendere.",
      readKids: {
        facile: [
          "Le lucciole azzurre fanno volare i sassi.",
          "Una maga è bloccata sul soffitto.",
          "Chiede aiuto per scendere."
        ],
        avanzato: [
          "Migliaia di lucciole azzurre riempiono la grotta.",
          "Dove passano, i sassolini si staccano da terra e galleggiano.",
          "In alto, appiccicata al soffitto, c'è una pozionista.",
          "«Portatemi gli ingredienti giusti e vi insegno a volare!» dice."
        ]
      },
      goal: "Preparare pozioni di volo controllato e riportare la pozionista a terra.",
      beats: [
        "Raccogliere tre colori di luce in zone diverse.",
        "Decidere quante gocce fanno salire e quante fanno scendere.",
        "Provare la pozione con una corda di sicurezza legata in vita."
      ],
      choices: [
        { label: "Dosare la pozione", stat: "astuzia", target: 6, result: "La miscela porta esattamente all'altezza voluta." },
        { label: "Primo volo", stat: "coraggio", target: 6, result: "Un bambino guida la cordata in aria e tutti lo seguono." }
      ],
      groupChallenge: "Decidete una ricetta di tre colori: quale fa salire, quale tiene fermi in aria e quale fa scendere?",
      rewards: [
        { type: "loot", id: "fiala-lucciole" },
        { type: "coins", amount: 10 },
        { type: "trophy", id: "primo-volo" },
        { type: "power", id: "pozione-volo" }
      ],
      growth: "Il primo volontario che si stacca da terra segna 1 crescita Coraggio.",
      fail: "La pozione funziona troppo bene: atterrano su un sentiero completamente diverso.",
      escape: "Bere una Pozione di Volo e seguire le lucciole fino al porto: nessuna prova, consuma la pozione."
    },

    /* ---- LAGUNA DELLE CASCATE ------------------------------------- */
    {
      id: "sirena-sbadigliona", island: "cascata", order: 1,
      title: "La Sirena Sbadigliona", kind: "Aiuto",
      difficulty: 5, minutes: 50,
      readAloud: "Una sirena gigantesca dorme sotto la cascata. Ogni suo sbadiglio risucchia l'acqua e lascia i pesci sospesi a mezz'aria.",
      readKids: {
        facile: [
          "Una sirena enorme dorme.",
          "Ogni sbadiglio beve l'acqua.",
          "I pesci restano fermi in aria."
        ],
        avanzato: [
          "Sotto la cascata dorme una sirena grande come una collina.",
          "Ogni volta che sbadiglia, tira dentro tutta l'acqua della cascata.",
          "Per qualche secondo i pesci restano sospesi a mezz'aria, sorpresi.",
          "Poi l'acqua torna, e la sirena sbadiglia di nuovo."
        ]
      },
      goal: "Svegliare la sirena con gentilezza e rimettere in moto la cascata.",
      beats: [
        "I bambini scelgono una ninna nanna da cantare al contrario.",
        "Tre pesci parlanti danno consigli completamente diversi.",
        "La sirena si sveglia solo ascoltando un sogno inventato per lei."
      ],
      choices: [
        { label: "Raccontare un sogno", stat: "fortuna", target: 5, result: "Il sogno incuriosisce la sirena, che apre un occhio e sorride." },
        { label: "Liberare i pesci", stat: "coraggio", target: 5, result: "Saltano fra le pozze e li rimettono in acqua prima del prossimo sbadiglio." }
      ],
      groupChallenge: "Inventate insieme un sogno breve con un luogo, un animale e una sorpresa che svegli la sirena facendola sorridere.",
      rewards: [
        { type: "loot", id: "perla-respiro-loot" },
        { type: "coins", amount: 8 },
        { type: "trophy", id: "voce-gentile" },
        { type: "power", id: "perla-respiro" }
      ],
      growth: "Chi racconta il sogno alla sirena segna 1 crescita Fortuna.",
      fail: "La sirena si gira nel sonno e, senza volerlo, apre un passaggio dietro la cascata.",
      escape: "Chiedere alla sirena una bolla gigante che porti il gruppo fino al mare aperto."
    },
    {
      id: "fiume-contrario", island: "cascata", order: 2,
      title: "Il Fiume al Contrario", kind: "Esplorazione",
      difficulty: 6, minutes: 55,
      readAloud: "Il fiume sale verso la montagna e si porta dietro barche, pesci e perfino una capra molto sorpresa.",
      readKids: {
        facile: [
          "Il fiume va all'insù.",
          "Trascina barche e pesci.",
          "Anche una capra sorpresa!"
        ],
        avanzato: [
          "Qualcosa non torna: il fiume scorre verso l'alto, non verso il mare.",
          "L'acqua risale la montagna trascinando con sé tutto.",
          "Passano barche capovolte, banchi di pesci e rami spezzati.",
          "In mezzo alla corrente c'è anche una capra, aggrappata a un tronco."
        ]
      },
      goal: "Scoprire cosa ha invertito la corrente e riportare l'acqua verso il mare.",
      beats: [
        "Navigare contro il cielo su una piccola zattera.",
        "Tre ruote di pietra controllano direzione, velocità e altezza.",
        "La capra conosce l'ordine giusto, ma risponde solo a domande in rima."
      ],
      choices: [
        { label: "Guidare la zattera", stat: "coraggio", target: 6, result: "Tengono l'equilibrio anche sulla corrente verticale." },
        { label: "Regolare le ruote", stat: "astuzia", target: 7, result: "Rimettono il fiume nella direzione corretta." }
      ],
      groupChallenge: "Create una domanda in rima per la capra e trovate una risposta che indichi l'ordine delle tre ruote.",
      rewards: [
        { type: "loot", id: "bottiglia-corrente-loot" },
        { type: "coins", amount: 11 },
        { type: "trophy", id: "raddrizza-fiumi" },
        { type: "power", id: "bottiglia-corrente" }
      ],
      growth: "Chi risolve l'ordine delle ruote segna 1 crescita Astuzia.",
      fail: "La corrente cambia lato e deposita il gruppo in un'altra zona dell'isola.",
      escape: "Costruire una zattera e lasciarsi portare dalla corrente riparata: prova di Astuzia 5."
    },

    /* ---- SCOGLIERE DEL VENTO ------------------------------------- */
    {
      id: "mulino-nuvole", island: "scogliere", order: 1,
      title: "Il Mulino delle Nuvole", kind: "Riparazione",
      difficulty: 7, minutes: 60,
      readAloud: "Un mulino enorme macina le nuvole e produce vento. Una pala si è staccata: sopra l'isola sta crescendo una tempesta a forma di coniglio.",
      readKids: {
        facile: [
          "Il mulino macina le nuvole.",
          "Una pala si è rotta.",
          "La tempesta ha la forma di un coniglio!"
        ],
        avanzato: [
          "In cima alla scogliera un mulino gigante macina le nuvole.",
          "Da quella farina di nuvola nasce tutto il vento dell'isola.",
          "Ma una pala si è staccata e ora il mulino gira storto.",
          "Sopra le vostre teste una tempesta prende la forma di un coniglio enorme."
        ]
      },
      goal: "Riparare il mulino prima che il coniglio-tempesta salti sul porto.",
      beats: [
        "Recuperare la pala sospesa tra due correnti d'aria.",
        "Un gruppo tiene ferme le corde mentre l'altro sale.",
        "Il mulino va riavviato scegliendo una velocità sicura."
      ],
      choices: [
        { label: "Scalata nelle nuvole", stat: "coraggio", target: 7, result: "Raggiungono la pala con aquiloni e corde ben legate." },
        { label: "Riparare gli ingranaggi", stat: "astuzia", target: 7, result: "Rimontano la pala senza accelerare la tempesta." }
      ],
      groupChallenge: "Dividete tre compiti fra i pirati: recuperare la pala, tenere le corde e riparare il mulino, tutto nello stesso momento.",
      rewards: [
        { type: "loot", id: "vela-nuvola-loot" },
        { type: "coins", amount: 13 },
        { type: "trophy", id: "riparatore-del-cielo" },
        { type: "power", id: "vela-nuvola" }
      ],
      growth: "Chi resta a sostenere gli altri senza mollare le corde segna 1 crescita Coraggio.",
      fail: "Il coniglio-tempesta salta via, ma nel salto lascia Pericolo +2.",
      escape: "Cucire una vela volante con un pezzo di nuvola e planare fino al porto: prova di Astuzia 7."
    },
    {
      id: "nido-vento", island: "scogliere", order: 2,
      title: "Il Nido del Vento", kind: "Protezione",
      difficulty: 6, minutes: 55,
      readAloud: "In cima alla scogliera tre uova trasparenti contengono piccoli venti. I bracconieri non sono ancora arrivati, ma le uova stanno per rotolare giù.",
      readKids: {
        facile: [
          "Tre uova trasparenti sul bordo.",
          "Dentro ci sono piccoli venti.",
          "Stanno per cadere!"
        ],
        avanzato: [
          "Sull'orlo della scogliera ci sono tre uova di vetro trasparente.",
          "Dentro ognuna si vede muoversi un piccolo vento vivo.",
          "Il bordo è in pendenza e le uova hanno già cominciato a dondolare.",
          "E da lontano stanno arrivando i bracconieri di venti."
        ]
      },
      goal: "Mettere in sicurezza le uova e trovare per loro un nido migliore.",
      beats: [
        "Ogni uovo soffia in una direzione diversa.",
        "I bambini progettano tre protezioni con materiali dell'isola.",
        "Il vento più piccolo sceglie dove costruire il nuovo nido."
      ],
      choices: [
        { label: "Fermare le uova", stat: "coraggio", target: 6, result: "Si coordinano e le bloccano senza romperle." },
        { label: "Progettare il nido", stat: "astuzia", target: 6, result: "Creano una struttura che si piega al vento invece di rompersi." }
      ],
      groupChallenge: "Progettate un nido che non voli via: scegliete forma, materiale e posto, poi difendete insieme la vostra idea.",
      rewards: [
        { type: "loot", id: "uovo-brezza-loot" },
        { type: "coins", amount: 10 },
        { type: "trophy", id: "custode-dei-venti" },
        { type: "power", id: "uovo-brezza" }
      ],
      growth: "Chi rinuncia a un premio pur di proteggere il nido segna 1 crescita Fortuna.",
      fail: "Un uovo rotola fino alla costa e si trasforma in un venticello birichino che tornerà a disturbare.",
      escape: "Farsi trasportare dai venti appena nati usando mantelli come paracadute: prova di Fortuna 6."
    },

    /* ---- SPIAGGIA DORATA --------------------------------------- */
    {
      id: "granchio-banchiere", island: "tesoro", order: 1,
      title: "Il Granchio Banchiere", kind: "Scambio",
      difficulty: 6, minutes: 55,
      readAloud: "Un enorme granchio con minuscoli occhiali conta monete nella sabbia. Dice che ogni tesoro dell'isola appartiene alla Banca delle Maree.",
      readKids: {
        facile: [
          "Un granchio con gli occhiali conta le monete.",
          "Dice che i tesori sono suoi.",
          "È il capo della Banca delle Maree."
        ],
        avanzato: [
          "Sulla spiaggia un granchio grande come una barca conta monete.",
          "Porta un paio di occhialini minuscoli sul naso.",
          "«Ogni tesoro di quest'isola appartiene alla Banca delle Maree» dice.",
          "«E la banca sono io. Se volete la chiave del caveau, dobbiamo trattare.»"
        ]
      },
      goal: "Ottenere una chiave del caveau convincendo il granchio con uno scambio creativo.",
      beats: [
        "Il granchio non vuole monete: colleziona storie e oggetti buffi.",
        "Ogni proposta riceve una controproposta.",
        "Una moneta falsa nel mucchio rischia di far saltare l'accordo."
      ],
      choices: [
        { label: "Negoziare", stat: "astuzia", target: 6, result: "Costruiscono uno scambio vantaggioso per tutti e due." },
        { label: "Trovare la moneta falsa", stat: "fortuna", target: 6, result: "La riconoscono dal solletico che fa quando la tocchi." }
      ],
      groupChallenge: "Proponete al granchio uno scambio che non usi monete e che sia utile sia alla banca sia alla ciurma.",
      rewards: [
        { type: "loot", id: "chiave-maree-loot" },
        { type: "coins", amount: 14 },
        { type: "trophy", id: "amico-della-banca" },
        { type: "power", id: "chiave-maree" }
      ],
      growth: "Chi propone uno scambio generoso, che dà più di quanto chiede, segna 1 crescita Astuzia.",
      fail: "Il granchio presta la chiave, ma in cambio vorrà un favore nel ciclo successivo.",
      escape: "Pagare un passaggio sul traghetto-granchio con una storia mai raccontata prima."
    },
    {
      id: "forziere-desideri", island: "tesoro", order: 2,
      title: "Il Forziere dei Desideri", kind: "Finale del ciclo",
      difficulty: 7, minutes: 60,
      readAloud: "Il forziere si apre da solo. Dentro non c'è oro: galleggiano sedici piccole stelle, e ognuna mostra un desiderio della ciurma.",
      readKids: {
        facile: [
          "Il forziere si apre da solo.",
          "Dentro non c'è oro.",
          "Ci sono sedici stelle di desideri."
        ],
        avanzato: [
          "Il forziere scatta e si apre senza che nessuno lo tocchi.",
          "Dentro non c'è nessun tesoro d'oro.",
          "Galleggiano nell'aria sedici piccole stelle luminose.",
          "Ogni stella mostra il desiderio di un pirata della ciurma."
        ]
      },
      goal: "Scegliere un desiderio comune senza lasciare indietro nessuno.",
      beats: [
        "Ogni bambino dice cosa desidera il proprio pirata.",
        "Le stelle si uniscono quando due desideri possono aiutarsi a vicenda.",
        "Il forziere chiede quale promessa la ciurma farà per il prossimo ciclo."
      ],
      choices: [
        { label: "Unire i desideri", stat: "astuzia", target: 7, result: "Trovano un obiettivo che contiene un pezzo del sogno di tutti." },
        { label: "Affidarsi alla stella", stat: "fortuna", target: 7, result: "Una stella sceglie il desiderio più generoso e lo fa brillare." }
      ],
      groupChallenge: "Unite tre desideri diversi in una sola promessa che aiuti tutta la ciurma nel prossimo ciclo.",
      rewards: [
        { type: "loot", id: "stella-ciurma-loot" },
        { type: "coins", amount: 16 },
        { type: "fame", amount: 2 },
        { type: "trophy", id: "stella-della-ciurma" },
        { type: "power", id: "stella-ciurma" }
      ],
      growth: "Tutta la ciurma segna 1 crescita nella caratteristica che ha usato meglio durante il ciclo.",
      fail: "Il forziere conserva il desiderio: servirà completare una quest ricorrente nel ciclo seguente.",
      escape: "La Stella della Ciurma apre un portale luminoso che riporta tutti al Porto centrale."
    }

  ]
});
