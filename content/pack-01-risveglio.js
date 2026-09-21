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
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "eroe-del-tempio" },
        { type: "power", id: "soffio-starnuto" }
      ],
      growth: "Chi ascolta l'idea di un compagno e la migliora segna 1 crescita Astuzia.",
      fail: "Una sala crolla: Pericolo +1, ma il crollo apre una scorciatoia inattesa.",
      escape: "Costruire una slitta di foglie: prova di Astuzia 6, poi scivolare fino alla costa.",

      /* --- AVVENTURA GUIDATA (storyFlow) -----------------------------------
         Struttura definita in
         quest_json/quest-director-v2-tempio-contratto-tecnico.json
         (sezione "tempio_starnutisce"). Trascritta alla lettera.
         Guida: content/_COME-SCRIVERE-UNO-STORYFLOW.md */
      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Le porte del tempio tremano e — ECCIÙ! — una nuvola di polvere resta sospesa nell'aria. Piano piano prende la forma di una freccia che punta verso l'interno.",
              ask: "Secondo voi, perché un tempio grande e antico si mette a starnutire?",
              askOptions: [
                { id: "solletico", label: "😮 Ha il solletico da dentro", reply: "«Qualcuno lo sta solleticando!» esclama un pirata. Il tempio scuote i muri come per confermarlo." },
                { id: "polvere", label: "🌫️ È pieno di polvere di mille anni", reply: "«Mille anni di polvere nel naso di pietra» dice un altro. In effetti la nuvola non sembra finire mai." },
                { id: "allergico", label: "🤧 È allergico a noi", reply: "«E se fossimo allergici NOI a lui?» ridacchia qualcuno. Il tempio starnutisce ancora più forte, quasi per rispondere." }
              ],
              masterTip: "Fai il rumore dello starnuto che monta e trattienilo: i bambini si sbrigano a rispondere."
            },
            interaction: "Nessun tiro. Lascia scegliere i bambini.",
            outcome: {
              title: "Il tempio vi ha sentiti",
              text: "Qualunque teoria abbiano scelto, il tempio risponde con un altro ECCIÙ! La freccia di polvere punta verso l'atrio.",
              audio: "click",
              next: "tre-nasi"
            }
          },
          {
            scene_id: "tre-nasi",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Nell'atrio ci sono tre statue enormi con tre nasi diversi: uno all'insù, uno schiacciato, uno lungo lungo. Sotto ognuna, una galleria buia.",
              ask: "Come facciamo a capire quale strada affrontare senza andare alla cieca?"
            },
            choices: [
              {
                id: "cura",
                label: "💊 Curiamo il tempio",
                reaction_title: "La ciurma prepara una cura",
                reaction: "Gli starnuti scuotono i muri. Avete deciso che prima di entrare bisogna calmare il tempio.",
                next: "cura"
              },
              {
                id: "starnuti",
                label: "🌬 Seguiamo gli starnuti",
                reaction_title: "La ciurma segue il ritmo del tempio",
                reaction: "A ogni ECCIÙ una galleria si illumina di polvere per un istante. Avete deciso di usare gli starnuti come guida.",
                next: "starnuti"
              },
              {
                id: "statue",
                label: "🗿 Studiamo le statue",
                reaction_title: "La ciurma cerca la risposta nei nasi",
                reaction: "Sotto il mento delle statue compaiono incisioni. Avete deciso di capire il loro enigma.",
                next: "statue"
              }
            ],
            rule: "Dopo il click su una scelta, NON mostrare subito la scena successiva. Mostrare prima la reaction come card principale con pulsante 'Segui questa strada'."
          },
          {
            scene_id: "cura",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Per calmare un tempio che starnutisce serve un rimedio. Non uno qualsiasi: un rimedio inventato bene.",
              ask: "Che medicina preparate? Serve un ingrediente, un modo per darla al tempio e una parola magica.",
              askOptions: [
                { id: "foglie", label: "🍃 Foglie che fanno il solletico al contrario", reply: "Le foglie sfiorano le colonne piano piano: invece di far ridere, calmano. «Ssh, va tutto bene» sussurrate insieme." },
                { id: "acqua", label: "🌊 Acqua di mare e polvere di conchiglia", reply: "L'acqua salata scivola lungo le crepe, la polvere di conchiglia brilla come tante stelline. Il tempio trattiene il fiato." },
                { id: "miele", label: "🍯 Miele di palma e una ninna nanna", reply: "Spalmate il miele dorato sulle colonne e intonate una ninna nanna stonata ma piena di cuore." }
              ],
              masterTip: "Fatti dare ingrediente, metodo e parola magica da tre bambini diversi."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino ascolta la vostra medicina",
                button: "Affidiamoci al Destino",
                group_result: "La vostra idea è abbastanza forte: il tempio accetta la medicina senza bisogno di dadi.",
                dice_result: "Il tempio esita... il mare vuole una prova di Astuzia."
              },
              dice: { stat: "astuzia", target: 6 },
              cards: "Mostrare carte/poteri giocabili prima del tiro se disponibili."
            },
            outcomes: {
              success: {
                title: "✨ IL TEMPIO SI CALMA",
                text: "Il tempio fa un ultimo, lungo sospiro... e si calma. Una porta segreta scivola di lato senza un rumore.",
                audio: "win-event",
                next: "piuma"
              },
              fail_forward: {
                title: "💥 ECCIÙ! CHE BOTTA!",
                text: "Uno starnuto gigante vi spettina tutti: Pericolo +1. Ma la scossa spalanca comunque la porta segreta.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "piuma"
              }
            }
          },
          {
            scene_id: "starnuti",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Vi mettete in fila e aspettate. ECCIÙ! — si illumina la galleria di destra. Cinque passi. ECCIÙ! — a sinistra. Il tempio vi guida... o vi prende in giro?",
              ask: "Qual è il piano per non perdervi, seguendo una luce che dura mezzo secondo?",
              askOptions: [
                { id: "contare", label: "🔢 Contare i passi ad alta voce", reply: "«Uno, due, tre...» — vi tenete per mano e contate insieme, così nessuno resta indietro." },
                { id: "sassolino", label: "🪨 Un sassolino a ogni svolta", reply: "Ogni volta che il corridoio gira, lasciate cadere un sassolino: la strada del ritorno resta segnata." },
                { id: "scattare", label: "🏃 Muoversi solo durante lo starnuto", reply: "Fermi, fermi... ECCIÙ! — scattate tutti insieme, poi vi bloccate di nuovo ad aspettare il prossimo." }
              ]
            },
            resolution: {
              policy: "destiny",
              destiny: { narrative: 45, dice: 55 },
              destiny_screen: {
                title: "✦ Il Destino segue i vostri passi",
                narrative_result: "Il piano funziona: niente dado.",
                dice_result: "Le luci durano troppo poco: serve Fortuna."
              },
              dice: { stat: "fortuna", target: 6 },
              cards: "Mostrare carte/poteri utili prima del tiro."
            },
            outcomes: {
              success: {
                title: "✨ AVETE SEGUITO IL RESPIRO DEL TEMPIO",
                text: "Starnuto dopo starnuto arrivate davanti alla stanza della Piuma della Verità.",
                audio: "win-event",
                next: "piuma"
              },
              fail_forward: {
                title: "🕸 STRADA SBAGLIATA... MA NON TROPPO",
                text: "Finite tra le ragnatele: Pericolo +1. Da lì però vedete una scorciatoia che porta alla piuma.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "piuma"
              }
            }
          },
          {
            scene_id: "statue",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Sotto le statue ci sono tre frasi: «Il primo respira e non parla», «Il secondo parla e non respira», «Il terzo fa tutt'e due, ma solo se lo saluti».",
              ask: "Cosa vogliono dire? Quale naso è quello giusto, e perché?",
              askOptions: [
                { id: "primo", label: "😤 Il primo: respira ma non parla", reply: "«C'è aria ma niente eco» — provate ad ascoltarlo, ma resta silenzioso." },
                { id: "secondo", label: "🗣️ Il secondo: parla ma non respira", reply: "Un'eco vi risponde, ma non sentite aria muoversi: non è ancora quello giusto." },
                { id: "terzo", label: "👋 Il terzo: fa tutt'e due, se lo saluti", reply: "«Buongiorno, naso lungo!» — e per un istante vi sembra che qualcosa, dentro la statua, vi ascolti davvero." }
              ]
            },
            resolution: {
              policy: "group",
              group: "La ciurma sceglie quale naso e cosa dire alla statua.",
              cards: "Carte narrative/skip possono essere usate se già compatibili."
            },
            outcomes: {
              success: {
                title: "✨ LA STATUA VI HA ASCOLTATI",
                text: "Salutate la terza statua e il suo naso si apre come una porta. Dentro vi aspetta la Piuma della Verità.",
                audio: "win-event",
                next: "piuma"
              },
              fail_forward: {
                title: "🌪 POLVERE OVUNQUE!",
                text: "Provate il naso sbagliato: una ventata vi investe, Pericolo +1. Tossendo capite l'enigma e imboccate quello giusto.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "piuma"
              }
            }
          },
          {
            scene_id: "piuma",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Al centro galleggia la Piuma della Verità: fa starnutire chiunque dica una bugia. Per prenderla, passate davanti uno alla volta e dite ad alta voce una cosa vera su di voi — ci vuole coraggio.",
              ask: "Chi va per primo? E che verità dite, per convincere la Piuma che siete sinceri?",
              askOptions: [
                { id: "paura", label: "😨 Una piccola paura", reply: "«Ho avuto paura sul ponte dei pappagalli» dice qualcuno a bassa voce. La piuma trema appena." },
                { id: "marachella", label: "🍪 Una marachella", reply: "«Una volta ho mangiato la merenda di mio fratello» confessa un altro, un po' rosso in viso." },
                { id: "difetto", label: "🪢 Una cosa che non sapete fare", reply: "«Non so ancora fare il nodo del marinaio» ammette l'ultimo. La piuma fluttua, in ascolto." }
              ],
              masterTip: "Vai per primo tu con una verità piccola e buffa: la Piuma è severa, non chiede però che sia perfetta."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 5 },
              cards: "Mostrare carte/poteri giocabili prima del tiro se disponibili."
            },
            outcomes: {
              success: {
                title: "✨ LA PIUMA VI CREDE",
                text: "Le vostre verità erano vere fino in fondo: la piuma si posa nella mano dell'ultimo che ha parlato e indica una nicchia nel muro.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "😳 LA PIUMA ESITA",
                text: "Le parole escono un po' impastate, un po' timide: la piuma non si convince del tutto e resta indecisa a mezz'aria. Il muro dietro di lei si apre comunque, ma solo di uno spiraglio.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Nella nicchia c'è la Tavoletta del Primo Vento, tiepida come una pietra al sole. Quando la sollevate, il tempio fa un ultimo minuscolo «etcì»... e poi silenzio. Vi ha solo salutato.",
              masterTip: "Chiedi: qual è stata la verità più coraggiosa detta alla piuma?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Attraverso lo spiraglio raggiungete comunque la Tavoletta del Primo Vento, ma è più fredda del previsto, come se il tempio non fosse del tutto convinto di lasciarvela andare. Fa un ultimo, breve «etcì» — non proprio un saluto, più un «va bene, andate pure».",
              masterTip: "Chiedi: la prossima volta, quale verità vorrebbero dire più forte?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Tempio che Starnutisce",
          final_read: "Il tempio fa un ultimo minuscolo «etcì». La Tavoletta del Primo Vento brilla tra le mani della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ IL TEMPIO VI LASCIA ANDARE",
          fail_subtitle: "Il Tempio che Starnutisce — un finale diverso",
          fail_final_read: "La Tavoletta del Primo Vento è vostra, ma il tempio resta un po' in dubbio su di voi. Va bene così: ci riproverete la prossima volta."
        }
      }
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
        { type: "coins", amount: 225000 },
        { type: "trophy", id: "voce-dello-stormo" },
        { type: "power", id: "fionda-parole" }
      ],
      growth: "Chi inventa la parola scelta dal Re Pappagallo segna 1 crescita Fortuna.",
      fail: "Il ponte regge solo una persona alla volta: il gruppo si separa per un tratto.",
      escape: "Chiamare i pappagalli con una filastrocca e farsi trasportare: prova di Fortuna 7.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Il burrone è profondo e il ponte non c'è più: centinaia di pappagalli hanno portato via ogni asse. Il Re Pappagallo gonfia il petto: «Pedaggio! Voglio una parola NUOVA. Una parola che nessuno ha mai detto!»",
              ask: "Come si inventa una parola che non esiste ancora?",
              askOptions: [
                { id: "unire", label: "🔗 Uniamo due parole che non stanno mai insieme", reply: "«Scarpa-tuono!» propone qualcuno ridendo. Il Re Pappagallo inclina la testa, curioso." },
                { id: "suono", label: "🎵 Partiamo da un suono buffo e lo allunghiamo", reply: "«Bzzzlurp... bzzzlurpiglione!» Lo stormo scoppia in uno svolazzo di risate." },
                { id: "verso", label: "🐦 Prendiamo il verso di un animale", reply: "Qualcuno imita un grugnito e lo trasforma in parola: «Grugnolino!». Un pappagallo lo ripete subito." }
              ],
              masterTip: "Ripeti «nuovaaa» come un pappagallo impaziente finché non parte la prima idea."
            },
            interaction: "Nessun tiro: lascia inventare i bambini.",
            outcome: {
              title: "Lo stormo fa silenzio",
              text: "Per un attimo tutti i pappagalli smettono di gridare e vi guardano. Vogliono sentire cosa proponete.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Il Re Pappagallo indica due strade: «O mi regalate una parola con dentro una storia... oppure vi riprendete da soli l'ultima asse. Ce l'ha una scimmia molto dispettosa.»",
              ask: "Cosa scegliamo: la parola-storia o l'inseguimento alla scimmia?"
            },
            choices: [
              {
                id: "parola",
                label: "🦜 Inventiamo una parola e la sua storia",
                reaction_title: "La ciurma sceglie le parole",
                reaction: "Vi mettete in cerchio: serve una parola nuova, il suo significato e una frase da pirati per provarla.",
                next: "parola"
              },
              {
                id: "scimmia",
                label: "🐒 Rincorriamo la scimmia con l'ultima asse",
                reaction_title: "La ciurma parte all'inseguimento",
                reaction: "La scimmia salta di liana in liana stringendo l'asse. Dovete fermarla senza farle del male e senza cadere.",
                next: "scimmia"
              }
            ]
          },
          {
            scene_id: "parola",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il Re Pappagallo si accomoda su un ramo e apre le orecchie sotto le piume. «Sentiamo questa parola. E niente trucchi.»",
              ask: "Qual è la parola? Cosa vuol dire? Usatela in una frase da pirati.",
              askOptions: [
                { id: "utile", label: "⚓ Qualcosa che serve davvero a un pirata", reply: "«Sacca-vento: la tasca segreta dove tieni il coraggio quando il mare fa paura» — il Re Pappagallo si ferma ad ascoltare." },
                { id: "buffa", label: "😂 Una parola che fa ridere solo a dirla", reply: "«Ciuffapallo!» — la ciurma non riesce più a dirla senza ridere, e nemmeno i pappagalli." },
                { id: "racconto", label: "📖 Una parola dentro una piccola storia", reply: "«Era una notte di sfuffolino, quando il mare...» — la frase prende forma pezzo per pezzo." }
              ],
              masterTip: "Fatti dire parola, significato e frase da tre bambini diversi."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LO STORMO IMPARA LA PAROLA",
                text: "Il Re Pappagallo grida la vostra parola e cento pappagalli la ripetono. In un batter d'ali riportano ogni asse al suo posto.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🌀 CHE CONFUSIONE!",
                text: "Metà stormo grida la parola giusta, metà ne inventa una sbagliata: Pericolo +1. Nel caos, il ponte torna solo a metà: si passerà con più attenzione.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "scimmia",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La scimmia si ferma a metà liana, stringe l'asse e vi fa una linguaccia. Sotto di lei, solo burrone.",
              ask: "Come la convincete a lasciare l'asse, senza spaventarla e senza rischiare la caduta?",
              askOptions: [
                { id: "luccicante", label: "✨ Le offriamo qualcosa di più luccicante", reply: "Una conchiglia iridescente cattura subito il suo sguardo: comincia a dondolarsi, incuriosita." },
                { id: "ridere", label: "😆 La facciamo ridere fino a farla mollare", reply: "Qualcuno fa la faccia più buffa della ciurma: la scimmia si scompiscia e quasi perde l'equilibrio." },
                { id: "circondare", label: "🤝 Due la aspettano ai lati, uno si avvicina piano", reply: "Vi disponete piano piano, senza far rumore, stringendo il cerchio attorno a lei." }
              ]
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ SCAMBIO RIUSCITO",
                text: "Le allungate una piuma coloratissima: la scimmia lascia cadere l'asse tra le vostre mani e se ne va tutta contenta col suo nuovo tesoro.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🙊 L'ASSE VOLA VIA",
                text: "La scimmia lancia l'asse dall'altra parte del burrone: Pericolo +1. Fate il giro lungo e recuperate quel che potete, ma qualcosa resta indietro nella corsa.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il ponte è di nuovo intero. Mentre lo attraversate, tutti i pappagalli in coro gridano la vostra parola nuova, felici di averla imparata. Da oggi è la loro preferita.",
              masterTip: "Chiedi: se doveste tenere una sola parola inventata oggi, quale?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il ponte è tornato, ma non è più solido come prima: qualche asse è storta, qualche corda tirata male. Lo stormo grida la vostra parola lo stesso, un po' distratto — già litiga per un frutto caduto. Passate comunque, con attenzione.",
              masterTip: "Chiedi: la prossima volta, quale parola vorrebbero provare a inventare?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Ponte dei Pappagalli",
          final_read: "Lo stormo vi accompagna oltre il burrone gridando la vostra parola nuova. Il Richiamo dello Stormo è vostro.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ IL PONTE REGGE, A MODO SUO",
          fail_subtitle: "Il Ponte dei Pappagalli — un finale diverso",
          fail_final_read: "Il ponte è di nuovo in piedi, un po' storto. Lo stormo canta la vostra parola lo stesso: non era perfetta, ma è bastata."
        }
      }
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
        { type: "coins", amount: 275000 },
        { type: "trophy", id: "cuoco-del-cratere" },
        { type: "power", id: "cucchiaione-gigante" }
      ],
      growth: "Chi tiene calmo il gruppo e dà il ritmo del «uno, due, tre» segna 1 crescita Coraggio.",
      fail: "Il vulcano fa un rutto di cenere: tutti tornano al molo, Rifornimenti −1.",
      escape: "Creare una zattera di pietra pomice che galleggia: prova di Astuzia 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Il cratere gorgoglia piano, come una minestra sul fuoco. Un piccolo gigante ci tuffa un mestolo enorme, assaggia, storce il naso: «Manca qualcosa! Portatemi l'ingrediente giusto o questa zuppa trabocca!»",
              ask: "Che sapore dovrebbe avere una zuppa di lava per essere calma e buona?",
              askOptions: [
                { id: "fresco", label: "❄️ Qualcosa di fresco, che calma senza spegnere", reply: "«Un ghiacciolo di nuvola!» — il gigante ci pensa su, il mestolo fermo a mezz'aria." },
                { id: "dolce", label: "🍯 Qualcosa di dolce, che la fa addormentare", reply: "«Miele di stelle cadenti» propone qualcuno. Il gigante si lecca i baffi, tentato." },
                { id: "frizzante", label: "🫧 Qualcosa di frizzante, che la fa ridere", reply: "«Bollicine che fanno il solletico!» Il gigante scoppia a ridere e per un attimo il cratere ride con lui." }
              ],
              masterTip: "Fai la faccia schifata del gigante che assaggia: parte subito la gara di idee."
            },
            interaction: "Nessun tiro: si inventa il sapore.",
            outcome: {
              title: "Il gigante annuisce",
              text: "«Interessante...» borbotta il gigante, leccandosi il mestolo. «Adesso però servono gli ingredienti. E sono su tre sentieri diversi.»",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "I tre sentieri fumano. Il gigante vi guarda: «Potete studiare la ricetta esatta, oppure fidarvi del naso e assaggiare mentre raccogliete. Come preferite fare?»",
              ask: "Andiamo con la ricetta precisa o con l'assaggio coraggioso?"
            },
            choices: [
              {
                id: "ricetta",
                label: "📜 Studiamo la ricetta esatta",
                reaction_title: "La ciurma cerca l'ordine giusto",
                reaction: "Vi sedete con le foglie-ricetta del gigante: bisogna capire quali tre ingredienti servono e in che ordine metterli.",
                next: "ricetta"
              },
              {
                id: "assaggio",
                label: "😋 Assaggiamo mentre raccogliamo",
                reaction_title: "La ciurma si fida del naso",
                reaction: "Correte sui sentieri annusando e assaggiando. Qualche goccia è caldissima: ci vuole fegato.",
                next: "assaggio"
              }
            ]
          },
          {
            scene_id: "ricetta",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le foglie-ricetta sono scritte al contrario e macchiate di cenere. Ogni ingrediente ha un disegno e un numero mezzo cancellato.",
              ask: "Quali tre ingredienti fantastici calmano un vulcano senza spegnerlo? E in che ordine vanno aggiunti?",
              askOptions: [
                { id: "ordine-classico", label: "❄️🍯 Prima il fresco, poi il dolce", reply: "«Prima si raffredda, poi si addolcisce» spiegate al gigante, che annuisce serio come uno chef." },
                { id: "legante", label: "🔗 L'ultimo lega gli altri due insieme", reply: "«E per finire, qualcosa che li tenga uniti» — il gigante controlla le foglie-ricetta, sorpreso che coincida." },
                { id: "storia", label: "📖 La raccontiamo come una storia", reply: "«C'era una volta un vulcano che aveva freddo...» — il gigante si ferma ad ascoltare, incantato." }
              ],
              masterTip: "Fatti dire i tre ingredienti e il perché stanno bene insieme."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino legge la vostra ricetta",
                button: "Affidiamoci al Destino",
                group_result: "La ricetta ha un senso perfetto: il gigante la segue alla lettera, niente prove.",
                dice_result: "I numeri sulle foglie sono confusi: serve una prova di Astuzia per rimetterli in ordine."
              },
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ LA ZUPPA SI CALMA",
                text: "Il gigante versa gli ingredienti nell'ordine giusto. Il cratere fa un ultimo sbuffo, poi gorgoglia piano e contento come una tisana.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "💥 RUTTO DI CENERE!",
                text: "Un ingrediente va nel momento sbagliato: PFFF! Una nuvola di cenere vi copre, Rifornimenti −1. Ma il gigante corregge al volo e la zuppa si stabilizza lo stesso.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "assaggio",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Raccogliete di corsa: una goccia di rugiada-di-fuoco, un fiore che sa di menta calda, una scintilla dolce. L'ultimo boccone però brilla arancione e sembra scottare.",
              ask: "Chi lo assaggia? E come lo fate senza bruciarvi la lingua?",
              askOptions: [
                { id: "soffiare", label: "💨 Ci soffiamo sopra tutti insieme", reply: "Un coro di soffi fa tremolare la goccia dorata, che si intiepidisce appena." },
                { id: "punta", label: "👅 Solo la punta della lingua, per prova", reply: "Un pirata coraggioso assaggia appena appena, gli occhi stretti, pronto a scappare." },
                { id: "foglia", label: "🍃 La facciamo raffreddare su una foglia larga", reply: "Posate la goccia su una foglia enorme e aspettate, impazienti, che smetta di fumare." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ CALDISSIMO MA BUONO",
                text: "Un pirata assaggia la goccia magica: è caldissima e non brucia affatto. La zuppa la accetta e smette di ribollire.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "😵 AHIA, LA LINGUA!",
                text: "L'assaggio è più caldo del previsto: qualcuno salta in aria, Rifornimenti −1. Ma nel salto rovescia la goccia dritta nel cratere — e funziona.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "insieme",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Manca l'ultimo gesto: l'ingrediente finale va aggiunto da tutti nello stesso identico momento, o non lega.",
              ask: "Qual è il vostro segnale per farlo tutti insieme al momento giusto?",
              askOptions: [
                { id: "conto", label: "🗣️ Un «uno, due, tre» gridato forte", reply: "Chi ha la voce più potente si prepara: «UNO... DUE...»" },
                { id: "battito", label: "👏 Un battito di mani che accelera", reply: "Le mani cominciano a battere piano, poi sempre più veloce, come un cuore che si emoziona." },
                { id: "respiro", label: "👀 Ci guardiamo negli occhi e respiriamo insieme", reply: "Vi mettete in cerchio, mano nella mano, e respirate tutti alla stessa velocità." }
              ],
              masterTip: "Il momento del \"tre!\" è il vero cuore della scena: lascialo montare."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ TUTTI INSIEME!",
                text: "Al vostro «tre!» ogni mano lascia cadere l'ingrediente nello stesso momento. Il cratere sospira e si addormenta.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🌋 QUASI IN TEMPO",
                text: "Qualcuno parte un attimo dopo: il vulcano fa un ultimo brontolìo, Pericolo +1. La zuppa si calma solo a metà — resta un ribollio leggero, ma niente di pericoloso.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il gigante assaggia un'ultima volta, chiude gli occhi e sorride grande. «Perfetta.» Vi porge una pietra tiepida, presa dal fondo del cratere: pulsa piano, come un cuore contento.",
              masterTip: "Chiedi: qual è stato il momento in cui la ciurma è stata più in sincrono?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il gigante assaggia un'ultima volta e storce appena il naso. «Non è perfetta... ma va bene lo stesso.» Vi porge comunque una pietra, più fredda del previsto: pulsa piano, come se dormisse a metà.",
              masterTip: "Chiedi: la prossima volta, come vi allenereste a essere più sincroni?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Zuppa del Vulcano",
          final_read: "Il vulcano gorgoglia piano e felice. La Pietra Tiepida batte nel palmo della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ IL VULCANO SI ACCONTENTA",
          fail_subtitle: "La Zuppa del Vulcano — un finale diverso",
          fail_final_read: "Il vulcano smette di ribollire, ma resta un po' agitato. La pietra che vi porge il gigante è più fredda del solito: funziona lo stesso."
        }
      }
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
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "amico-della-salamandra" },
        { type: "power", id: "scaglia-salamandra" }
      ],
      growth: "Chi protegge l'uovo e lo tiene al sicuro segna 1 crescita Coraggio.",
      fail: "L'uovo si schiude in anticipo e il cucciolo sceglie un bambino da seguire ovunque.",
      escape: "Bere una Pozione delle Bolle Volanti nascosta nel nido: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Una salamandra tutta luce corre in cerchio, agitatissima: ha nascosto il suo uovo e non ricorda più dove. In lontananza il guscio ha cominciato a cantare, e più passa il tempo più il canto diventa forte.",
              ask: "Cosa può aiutare la salamandra a ricordarsi dove ha nascosto l'uovo?",
              askOptions: [
                { id: "ripercorrere", label: "👣 Rifacciamo insieme la sua strada", reply: "La salamandra chiude gli occhi e prova a ricordare i suoi passi, un piede tremante dopo l'altro." },
                { id: "caldo", label: "🔥 Cerchiamo dove il terreno è ancora caldo", reply: "Toccate il suolo qua e là: «Questo punto scotta ancora!» esclama qualcuno." },
                { id: "canto", label: "🎶 Seguiamo il canto, che si sente sempre di più", reply: "Vi fermate zitti zitti: in lontananza, una nota dolce sale e scende." }
              ],
              masterTip: "Parla veloce e affannato come la salamandra: trasmette la fretta ai bambini."
            },
            interaction: "Nessun tiro: si cerca insieme un modo per ricordare.",
            outcome: {
              title: "La salamandra si calma un po'",
              text: "Respira, smette di correre in tondo e vi indica tre rocce calde da cui partire. Il canto dell'uovo, intanto, non si ferma.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Le tre rocce calde nascondono indizi, ma alcuni sono scherzi. E il canto dell'uovo cambia nota: più limpido verso una direzione, stonato verso le altre.",
              ask: "Ci fidiamo dell'orecchio e seguiamo il canto, o costruiamo un passaggio sicuro sopra la lava lenta?"
            },
            choices: [
              {
                id: "canto",
                label: "🎵 Seguiamo il canto dell'uovo",
                reaction_title: "La ciurma tende le orecchie",
                reaction: "Vi fermate a turno, in silenzio, per capire da dove arriva la nota più pulita. La salamandra trattiene il fiato.",
                next: "canto"
              },
              {
                id: "passaggio",
                label: "🌉 Costruiamo un passaggio sulla lava",
                reaction_title: "La ciurma mette insieme un ponte",
                reaction: "Raccogliete gusci minerali e rami: bisogna gettare un passaggio che regga il gruppo sopra la lava lenta.",
                next: "passaggio"
              }
            ]
          },
          {
            scene_id: "canto",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il canto rimbalza tra le rocce e si sdoppia: due note simili, una vera e una eco. Sbagliare vuol dire tornare indietro e perdere minuti preziosi.",
              ask: "Come fate a distinguere il canto vero dalla sua eco?",
              askOptions: [
                { id: "ritardo", label: "⏱️ L'eco arriva un attimo dopo, più debole", reply: "Contate in silenzio tra una nota e l'altra: una arriva sempre un filo in ritardo." },
                { id: "orecchio", label: "👂 Ci copriamo un orecchio per volta", reply: "A turno vi tappate un orecchio: «Da questo lato sento meglio!»" },
                { id: "muoversi", label: "🚶 Facciamo pochi passi e sentiamo quale nota cresce", reply: "Vi spostate piano: una nota si fa più forte, l'altra sparisce quasi del tutto." }
              ]
            },
            resolution: {
              policy: "destiny",
              destiny: { narrative: 45, dice: 55 },
              destiny_screen: {
                title: "✦ Il Destino ascolta con voi",
                narrative_result: "Il vostro orecchio è sicuro: la nota vera vi porta dritti. Niente dado.",
                dice_result: "Le due note sono troppo simili: serve una prova di Fortuna."
              },
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ IL CANTO VI GUIDA",
                text: "Seguite la nota più limpida di roccia in roccia e arrivate a un cespuglio caldo: l'uovo è lì, che canta felice.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "🔁 GIRO SBAGLIATO",
                text: "Seguite l'eco e finite in una conca cieca: Pericolo +1, e il sole scende ancora. Ma da lassù vedete brillare il cespuglio giusto, poco più in là.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "passaggio",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La lava lenta avanza come miele rovente. Avete gusci, rami e una corda: il passaggio deve reggere tutti, uno dopo l'altro.",
              ask: "Come lo costruite perché non ceda e non prenda fuoco?",
              askOptions: [
                { id: "gusci", label: "🐚 Gusci minerali come base, non bruciano", reply: "Incastrate i gusci più larghi uno accanto all'altro: sembrano tenere bene." },
                { id: "corda", label: "🪢 Uno alla volta, gli altri tengono la corda", reply: "Vi mettete in fila, la corda tesa tra le mani, pronti a fare da appoggio." },
                { id: "prova-peso", label: "🪨 Lo proviamo prima con qualcosa di pesante", reply: "Lanciate sopra una roccia grossa: il passaggio scricchiola ma regge." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ PONTE SOLIDO",
                text: "Il passaggio di gusci regge benissimo. Attraversate uno alla volta e raggiungete il nido dall'altra parte.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "🕳 UN GUSCIO CEDE",
                text: "A metà, un guscio si spezza: un salto, una corda tesa, Pericolo +1. Nessuno si fa male e dall'altra parte ci arrivate lo stesso.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "insieme",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "L'uovo è trovato, ma la salamandra tremola: ha paura di dimenticarsi di nuovo. Vuole un modo per ricordare, per sempre.",
              ask: "Costruite per lei una catena di tre indizi che la porti sempre all'uovo.",
              askOptions: [
                { id: "sensi", label: "👁️👂✋ Un indizio per vista, udito e tatto", reply: "«Guarda la roccia a cuore, ascolta il vento tra le canne, tocca la pietra tiepida» — la salamandra ripete piano, concentrata." },
                { id: "catena", label: "🔗 Ogni indizio punta al successivo", reply: "Costruite la catena come una filastrocca: il primo indizio nasconde dove trovare il secondo." },
                { id: "permanenti", label: "⏳ Solo cose che non cambiano col tempo", reply: "Scegliete solo pietre e forme del terreno: nulla che una pioggia o un vento possano spostare." }
              ],
              masterTip: "Fatti costruire la catena a voce alta, un indizio per bambino."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "astuzia", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ ORA NON DIMENTICHERÀ PIÙ",
                text: "La salamandra ripete la catena di indizi due volte, poi tre. Sorride: adesso l'uovo è al sicuro per sempre.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🌫 UN INDIZIO CONFUSO",
                text: "Un indizio resta troppo vago e la salamandra si imbroglia lo stesso: Pericolo +1. La catena regge solo a metà: qualche volta la seguirà, qualche volta no.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il guscio smette di cantare: adesso fa le fusa. La salamandra vi stacca dalla schiena una scaglia luminosa, ancora tiepida, e ve la mette in mano come un grazie.",
              masterTip: "Chiedi: quale indizio della catena vi piace di più, e perché?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il guscio smette di cantare, ma la salamandra resta un po' agitata: ripete la catena di indizi a bassa voce, incerta. Vi stacca comunque una scaglia, più opaca del solito, e ve la mette in mano.",
              masterTip: "Chiedi: quale indizio della catena renderebbero più semplice, la prossima volta?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Salamandra Smemorata",
          final_read: "Il guscio fa le fusa e la salamandra veglia sul nido. La Scaglia Lucente brilla nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ LA SALAMANDRA FA DEL SUO MEGLIO",
          fail_subtitle: "La Salamandra Smemorata — un finale diverso",
          fail_final_read: "Il guscio smette di cantare, ma la salamandra resta un po' distratta. Vi affida comunque una scaglia, più opaca del solito: un grazie sincero, anche se incompleto."
        }
      }
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
        { type: "coins", amount: 300000 },
        { type: "trophy", id: "custode-della-verita" },
        { type: "power", id: "conchiglia-veritiera" }
      ],
      growth: "I due che si danno fiducia a vicenda segnano 1 crescita Astuzia ciascuno.",
      fail: "Entrano comunque, ma una porta segreta si chiude alle loro spalle.",
      escape: "Attivare un arco di teletrasporto del forte: prova di Astuzia 7.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Le grandi statue del forte spalancano gli occhi di pietra. Non hanno spade: tendono verso di voi tre conchiglie, e da ognuna esce una voce diversa. «Quale di queste dice la verità?» chiedono i guardiani.",
              ask: "Come si fa a capire quale voce dice la verità, senza conoscerla?",
              askOptions: [
                { id: "non-esagera", label: "🎯 Chi dice il vero di solito non esagera", reply: "«La voce più semplice è spesso quella giusta» pensa ad alta voce qualcuno." },
                { id: "dimentica", label: "🕳️ Chi mente si dimentica un pezzo", reply: "«Attenti ai buchi nella storia!» — un guardiano sembra quasi annuire." },
                { id: "confronto", label: "🔍 Confrontiamo le tre versioni", reply: "«Mettiamole a confronto, una per una» decidete, pronti a fare i detective." }
              ],
              masterTip: "Fai tre vocine diverse per le tre conchiglie: una sicura, una pomposa, una insicura."
            },
            interaction: "Nessun tiro: si ragiona insieme.",
            outcome: {
              title: "I guardiani aspettano",
              text: "Le statue restano immobili, le conchiglie tese. Hanno tutto il tempo del mondo. Voi no.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Le tre voci raccontano la stessa storia in tre modi. Una sembra troppo bella, una salta un passaggio, una è semplice e precisa.",
              ask: "Confrontiamo per bene i tre racconti, o ci fidiamo dell'istinto e del suono del mare dentro le conchiglie?"
            },
            choices: [
              {
                id: "confronto",
                label: "🔎 Confrontiamo i tre racconti",
                reaction_title: "La ciurma cerca le differenze",
                reaction: "Vi fate ripetere ogni storia e segnate dove i dettagli non combaciano. Un racconto comincia a puzzare.",
                next: "confronto"
              },
              {
                id: "istinto",
                label: "🐚 Ci fidiamo del suono del mare",
                reaction_title: "La ciurma ascolta le conchiglie",
                reaction: "Portate ogni conchiglia all'orecchio, a turno, in silenzio. Una ha un suono più pulito, più vero.",
                next: "istinto"
              }
            ]
          },
          {
            scene_id: "confronto",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Sul pavimento disegnate tre colonne, una per racconto. Ogni volta che un dettaglio cambia, ci mettete un sassolino.",
              ask: "Quali frasi non combaciano? E quale racconto resta in piedi senza buchi e senza esagerazioni?",
              askOptions: [
                { id: "al-contrario", label: "🔄 Proviamo a raccontarla al contrario", reply: "Una storia, ripetuta all'indietro, comincia a scricchiolare qua e là." },
                { id: "esagerazione", label: "🎈 Cerchiamo cosa è stato aggiunto di troppo", reply: "«Un drago dorato? Non c'era scritto da nessuna parte prima» nota qualcuno, sospettoso." },
                { id: "buco", label: "❓ Cerchiamo il punto dove manca un pezzo", reply: "«E poi? E poi cosa?» — un racconto si interrompe proprio lì, senza finale." }
              ],
              masterTip: "Fatti dire da tre bambini quale racconto scartano e perché."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ I guardiani soppesano le vostre ragioni",
                button: "Affidiamoci al Destino",
                group_result: "Il vostro ragionamento non fa una piega: le statue si scostano senza chiedere altro.",
                dice_result: "Due racconti si somigliano troppo: serve una prova di Astuzia per scegliere."
              },
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ RACCONTO SMASCHERATO",
                text: "Indicate la conchiglia della verità. I guardiani annuiscono lentamente e la porta di corallo si apre come un fiore.",
                audio: "win-event",
                next: "fiducia"
              },
              fail_forward: {
                title: "🚪 PORTA SBAGLIATA",
                text: "Scegliete la conchiglia dell'esagerazione: una porta si apre, ma è quella di servizio, stretta e polverosa. Pericolo +1. Da lì però si arriva lo stesso al cuore del forte.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "fiducia"
              }
            }
          },
          {
            scene_id: "istinto",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le tre conchiglie all'orecchio danno tre mari diversi: uno calmo, uno in tempesta, uno che sembra... trattenere il fiato.",
              ask: "Quale suono vi dà la sensazione della verità? E chi lo ascolta per primo?",
              askOptions: [
                { id: "calmo", label: "🌊 Il mare più calmo e regolare", reply: "Un pirata resta immobile ad ascoltare: «Questo... respira piano, come quando dici la verità»." },
                { id: "occhi-chiusi", label: "😌 Chiudiamo gli occhi per sentire meglio", reply: "Tutti chiudono gli occhi in cerchio, in silenzio, mentre la conchiglia gira di mano in mano." },
                { id: "istinto-primo", label: "⚡ Ci fidiamo della prima sensazione", reply: "«Questa!» dice subito qualcuno, senza nemmeno pensarci — e nessuno la contraddice." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "fortuna", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ IL MARE NON MENTE",
                text: "Scegliete la conchiglia dal mare calmo. È quella giusta: le statue si inchinano e vi lasciano passare.",
                audio: "win-event",
                next: "fiducia"
              },
              fail_forward: {
                title: "🌊 MARE INGANNEVOLE",
                text: "Il suono più bello era una trappola: la porta principale resta chiusa, Pericolo +1. Ma un guardiano, quasi dispiaciuto, vi indica un cunicolo laterale.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "fiducia"
              }
            }
          },
          {
            scene_id: "fiducia",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Oltre la porta, un ultimo guardiano. «Il forte si apre davvero solo se due di voi si fidano dello stesso compagno. Ditemi di chi, e perché.»",
              ask: "Due pirati scelgono lo stesso compagno di cui fidarsi: chi è, e cosa ha fatto per meritarselo?",
              askOptions: [
                { id: "aiuto-silenzioso", label: "🤫 Chi ha aiutato senza farsi vedere", reply: "Due pirati si guardano e sorridono: sanno benissimo di chi si tratta." },
                { id: "errore-ammesso", label: "🙋 Chi ha ammesso un errore", reply: "«Ha detto subito \"ho sbagliato io\", senza scuse» ricordano insieme." },
                { id: "calma", label: "🧘 Chi ha tenuto la calma quando gli altri no", reply: "«Mentre tutti gridavano, lui è rimasto tranquillo» concordano." }
              ],
              masterTip: "Lascia che siano davvero due bambini a dire lo stesso nome, senza suggerirlo tu."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "fortuna", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ IL FORTE SI FIDA DI VOI",
                text: "I due nomi combaciano. Il guardiano sorride con la bocca di pietra e tutte le porte del forte si spalancano insieme.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🤔 QUASI D'ACCORDO",
                text: "I due scelgono compagni diversi, o il guardiano non si convince fino in fondo: socchiude un occhio, Pericolo +1. Vi lascia entrare lo stesso, da un varco più stretto.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Dentro il forte, su un cuscino di alghe, c'è la Conchiglia Veritiera: se qualcuno mente tenendola in mano, lei fischia piano. I guardiani tornano di pietra, con gli occhi chiusi e un mezzo sorriso.",
              masterTip: "Chiedi: qual è stata la bugia più difficile da smascherare?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Dentro il forte, su un cuscino di alghe, c'è comunque la Conchiglia Veritiera — ma è più silenziosa del previsto, come se non si fidasse fino in fondo. I guardiani tornano di pietra, un po' più seri del solito.",
              masterTip: "Chiedi: la prossima volta, di chi si fiderebbero e perché?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "I Guardiani di Corallo",
          final_read: "I guardiani chiudono gli occhi di pietra. La Conchiglia Veritiera fischia piano tra le mani della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ I GUARDIANI VI LASCIANO PASSARE",
          fail_subtitle: "I Guardiani di Corallo — un finale diverso",
          fail_final_read: "I guardiani tornano di pietra, non del tutto convinti. La Conchiglia Veritiera che vi lasciano è più silenziosa del solito, ma è comunque vostra."
        }
      }
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
        { type: "coins", amount: 225000 },
        { type: "trophy", id: "ballerino-delle-onde" },
        { type: "power", id: "tamburo-marea" }
      ],
      growth: "Chi aiuta un compagno rimasto fuori tempo segna 1 crescita Fortuna.",
      fail: "Un'onda alta divide la ciurma su due terrazze diverse del forte.",
      escape: "Suonare la campanella e guidare una barca di corallo fino alla costa: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Il pavimento del forte respira su e giù come il mare. In un angolo un'orchestra di granchi suona senza fermarsi mai. «Solo chi balla a tempo raggiunge la torre!» gridano. In cima c'è una campana d'argento che aspetta.",
              ask: "Come si fa ad attraversare un pavimento che si alza e si abbassa a tempo di musica?",
              askOptions: [
                { id: "in-alto", label: "⬆️ Muoversi solo quando il pavimento è in alto", reply: "Aspettate il momento giusto e scattate proprio mentre il pavimento sale." },
                { id: "contare", label: "🗣️ Contiamo il ritmo tutti insieme, a voce alta", reply: "«Uno, due, tre!» gridate in coro, seguendo i granchi." },
                { id: "mani", label: "🤝 Ci teniamo per mano e partiamo insieme", reply: "Vi mettete in fila, mano nella mano, pronti a muovervi come un solo corpo." }
              ],
              masterTip: "Batti il tempo sul tavolo mentre parli: i bambini si sincronizzano da soli."
            },
            interaction: "Nessun tiro: si trova il ritmo insieme.",
            outcome: {
              title: "L'orchestra alza il volume",
              text: "I granchi suonano più forte e più veloce: hanno capito che ci provate davvero. Il pavimento ondeggia.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Le piattaforme salgono e scendono in una sequenza precisa. Potete imparare a memoria l'ordine, oppure lanciarvi a tempo di musica e fidarvi del corpo.",
              ask: "Studiamo la sequenza a mente fredda, o balliamo senza paura?"
            },
            choices: [
              {
                id: "ritmo",
                label: "🧠 Impariamo la sequenza a memoria",
                reaction_title: "La ciurma studia le piattaforme",
                reaction: "Osservate due giri interi e ripetete a bassa voce: su, giù, su-su, giù. Adesso lo sapete a memoria.",
                next: "ritmo"
              },
              {
                id: "danza",
                label: "💃 Balliamo senza paura",
                reaction_title: "La ciurma si lancia a tempo",
                reaction: "Vi prendete per mano e partite col ritmo dei granchi. Il forte trema, l'acqua schizza, ma voi ridete.",
                next: "danza"
              }
            ]
          },
          {
            scene_id: "ritmo",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La sequenza è lunga e i granchi ogni tanto cambiano una nota per confondervi. Sbagliare un passo sposta un ponte in una direzione buffa.",
              ask: "Chi tiene il conto per tutti? E come fate a non perdere il ritmo se i granchi barano?",
              askOptions: [
                { id: "conta-voce", label: "🗣️ Uno conta a voce alta senza fermarsi mai", reply: "Un pirata si fa avanti e scandisce il tempo, senza perdere un colpo." },
                { id: "guardare-piedi", label: "👣 Guardiamo i piedi di chi ci sta davanti", reply: "Vi mettete in fila indiana, gli occhi puntati sui talloni di chi guida." },
                { id: "aspettare-battito", label: "⏸️ Se barano, aspettiamo un battito e ripartiamo", reply: "Quando un granchio cambia nota, vi fermate un attimo tutti insieme, poi ripartite in sincrono." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ SEQUENZA PERFETTA",
                text: "Passo dopo passo, senza un errore, attraversate tutto il salone e arrivate ai piedi della torre.",
                audio: "win-event",
                next: "campana"
              },
              fail_forward: {
                title: "🌊 SPLASH!",
                text: "Un passo sbagliato e un ponte scivola via: qualcuno finisce in acqua ridendo, Pericolo +1. Vi ripescate a vicenda e proseguite, tutti bagnati.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "campana"
              }
            }
          },
          {
            scene_id: "danza",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Ballando ci si arriva, ma a metà salone l'acqua sale all'improvviso e le piattaforme diventano scivolose.",
              ask: "Come tenete il gruppo unito quando il pavimento scivola e l'acqua sale?",
              askOptions: [
                { id: "mai-lasciare", label: "🤝 Non ci lasciamo mai la mano", reply: "Stringete forte le mani dei vicini, anche quando il pavimento vi fa vacillare." },
                { id: "rallentare", label: "🐢 Rallentiamo invece di accelerare", reply: "Invece di correre per la paura, rallentate il passo e respirate insieme." },
                { id: "tirare-su", label: "⬆️ Chi scivola viene tirato su dagli altri", reply: "Appena qualcuno vacilla, due mani lo afferrano al volo, senza fermare il ballo." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ CHE BALLO!",
                text: "Attraversate anche l'onda a sorpresa senza mollarvi la mano. I granchi vi applaudono con le chele.",
                audio: "win-event",
                next: "campana"
              },
              fail_forward: {
                title: "🌀 ONDA DISPETTOSA",
                text: "Un'onda alta vi divide su due terrazze: Pericolo +1. Ballate ognuno per conto proprio fino a ritrovarvi sotto la torre, un po' spettinati.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "campana"
              }
            }
          },
          {
            scene_id: "campana",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La campana d'argento è in cima alla torre. I granchi spiegano: si suona solo con un passo di danza inventato dalla ciurma, fatto tutti insieme.",
              ask: "Inventate un ritmo di quattro gesti che tutti sappiate ripetere nello stesso ordine.",
              askOptions: [
                { id: "classico", label: "👏🦶🔄🦘 Battito, pestata, giro, salto", reply: "Provate la sequenza classica: batti, pesta, gira, salta — semplice e diretta." },
                { id: "facili", label: "😊 Gesti facili, così nessuno resta indietro", reply: "Scegliete quattro mosse semplicissime, pensando anche al pirata più piccolo." },
                { id: "lento-poi-tempo", label: "🐌➡️⚡ Prima lento, poi a tempo", reply: "Provate tutto al rallentatore una volta, poi accelerate insieme fino al ritmo giusto." }
              ],
              masterTip: "Il momento più bello è quando tutti fanno il gesto sbagliato insieme: lascialo succedere."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "fortuna", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ DON! DON! DON!",
                text: "Fate il vostro ballo tutti insieme e la campana suona tre volte, chiara come argento. Il forte si calma di colpo.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🔔 QUASI A TEMPO",
                text: "Un gesto va storto e la campana fa un DONG stonato: Pericolo +1. Suona comunque, ma con un rintocco strano, come se non fosse del tutto convinta.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il pavimento smette di respirare e resta fermo, finalmente. I granchi vi consegnano una campanella di marea: se la agiti, il mare vicino si calma per un momento.",
              masterTip: "Chiedi: qual è stato il gesto più difficile del vostro ballo?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il pavimento smette di respirare, ma la campana resta con un rintocco strano nell'aria, come se non fosse del tutto convinta del vostro ballo. I granchi vi consegnano comunque una campanella di marea, un po' opaca.",
              masterTip: "Chiedi: la prossima volta, quale gesto vorrebbero migliorare?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Ballo delle Maree",
          final_read: "La campana d'argento tace e il pavimento resta fermo. La Campanella di Marea tintinna nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ LA CAMPANA SUONA COMUNQUE",
          fail_subtitle: "Il Ballo delle Maree — un finale diverso",
          fail_final_read: "La campana suona con un rintocco un po' storto, ma suona. I granchi vi porgono comunque una campanella, più opaca del solito."
        }
      }
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
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "guida-nella-nebbia" },
        { type: "power", id: "seme-bussola" }
      ],
      growth: "Chi inventa il segnale di riconoscimento segna 1 crescita Astuzia.",
      fail: "Il gruppo raggiunge la casa ma perde 1 Rifornimento nella nebbia.",
      escape: "Far crescere una canoa di radici cantando una filastrocca: prova di Astuzia 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Nella nebbia le radici sussurrano i nomi di tutta la ciurma, ma ogni voce sembra venire da una direzione diversa. Alcune vogliono aiutarvi, altre confondervi. Una sola strada porta davvero alla casa sull'albero della Custode.",
              ask: "Come facciamo a non perderci e a non farci separare da voci che ci imitano?",
              askOptions: [
                { id: "restare-attaccati", label: "🤝 Restiamo attaccati, mai da soli", reply: "Vi stringete in gruppo, spalla contro spalla, decisi a non separarvi." },
                { id: "parola-decisa", label: "🔑 Rispondiamo solo con una parola decisa prima", reply: "«Se non sa la parola, non è uno di noi» concordate sottovoce." },
                { id: "fretta", label: "🐌 Le voci gentili non hanno fretta, quelle false sì", reply: "«Attenti a chi vi mette fretta» sussurra qualcuno, guardingo." }
              ],
              masterTip: "Sussurra i nomi dei bambini da direzioni diverse: senti quanto è facile confondersi."
            },
            interaction: "Nessun tiro: si decide come restare uniti.",
            outcome: {
              title: "La nebbia si fa più fitta",
              text: "Le voci aumentano, tutte insieme. Se non avete un modo per riconoscervi, tra un po' non saprete più chi è chi.",
              audio: "minaccia",
              next: "segnale"
            }
          },
          {
            scene_id: "segnale",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Prima di muovervi, vi fermate in cerchio. Serve un modo per essere sicuri, sempre, di parlare col compagno vero e non con un'eco.",
              ask: "Scegliete una parola d'ordine, un gesto e un suono per riconoscervi nella nebbia.",
              askOptions: [
                { id: "parola-strana", label: "🗝️ Una parola strana e improbabile", reply: "«Ananas-tuono» decidete. Nessuna radice indovinerebbe mai una parola così assurda." },
                { id: "gesto", label: "👉 Un gesto veloce, tipo toccarsi il gomito", reply: "Vi allenate a toccarvi il gomito due volte, veloci: un gesto che solo voi conoscete." },
                { id: "suono", label: "🎵 Un suono corto: un fischio o uno schiocco", reply: "Provate un fischio breve, tutti uguale, finché non vi viene naturale." }
              ]
            },
            resolution: {
              policy: "group",
              group: "Decidete insieme parola d'ordine, gesto e suono, poi provateli una volta tutti."
            },
            outcomes: {
              success: {
                title: "✨ ORA VI RICONOSCETE",
                text: "Parola, gesto e suono: ogni volta che li usate, sapete di parlare col compagno vero. Le voci bugiarde non possono copiarli.",
                audio: "win-event",
                next: "bivio"
              },
              fail_forward: {
                title: "🌫 SEGNALE CONFUSO",
                text: "Il segnale è troppo complicato e nella fretta qualcuno lo sbaglia: Pericolo +1. Lo semplificate al volo — solo il fischio — e funziona lo stesso.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "bivio"
              }
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Davanti a voi tre sentieri di radici. Le voci indicano tutte una direzione diversa e sono molto convincenti.",
              ask: "Ci segniamo la strada con simboli, o seguiamo la voce più gentile della palude?"
            },
            choices: [
              {
                id: "segnare",
                label: "🪢 Segniamo il percorso con nodi e simboli",
                reaction_title: "La ciurma marca la strada",
                reaction: "A ogni bivio legate un nodo e disegnate una freccia sul fango. Adesso non potete più perdervi.",
                next: "segnare"
              },
              {
                id: "voce",
                label: "🍃 Seguiamo la voce gentile",
                reaction_title: "La ciurma risponde con cortesia",
                reaction: "Rispondete «grazie» e «per favore» a ogni sussurro. La palude sembra apprezzare le buone maniere.",
                next: "voce"
              }
            ]
          },
          {
            scene_id: "segnare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "I nodi tengono, ma la nebbia sposta i suoni e a volte una freccia sembra puntare in due direzioni insieme.",
              ask: "Come tenete dritta la rotta quando anche i vostri segni sembrano confondersi?",
              askOptions: [
                { id: "contare-passi", label: "🔢 Contiamo i passi tra un nodo e l'altro", reply: "Un pirata conta ad alta voce, così sapete sempre quanto manca al prossimo segno." },
                { id: "controllo", label: "👀 Uno resta indietro a controllare l'ultimo segno", reply: "Qualcuno si volta spesso a controllare che il nodo sia ancora lì, ben visibile." },
                { id: "fidarsi-nodi", label: "🪢 Ci fidiamo dei nodi, non delle voci", reply: "«I nodi non mentono» ripetete come un mantra, ignorando i sussurri." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ ROTTA SICURA",
                text: "Nodo dopo nodo, senza sbagliare un bivio, arrivate ai piedi dell'albero della Custode.",
                audio: "win-event",
                next: "custode"
              },
              fail_forward: {
                title: "🌫 UN GIRO A VUOTO",
                text: "Un segno si cancella nel fango e fate un giro inutile: perdete 1 Rifornimento nella nebbia. Ma ritrovate il nodo e riprendete la strada giusta.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "custode"
              }
            }
          },
          {
            scene_id: "voce",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Rispondere con gentilezza funziona: molte radici si abbassano al vostro passaggio. Ma una voce dolcissima vi propone una scorciatoia che scende verso l'acqua nera.",
              ask: "La scorciatoia è un regalo o una trappola? Come lo capite?",
              askOptions: [
                { id: "mai-buio", label: "🌑 La vera gentilezza non porta mai verso il buio", reply: "«Perché verso l'acqua nera, se è un regalo?» chiede qualcuno, sospettoso." },
                { id: "invito", label: "🚶 Chiediamo alla voce di venire con noi", reply: "«Vieni con noi allora!» proponete. Un lungo silenzio risponde." },
                { id: "segnale-test", label: "🔔 Proviamo il nostro segnale su di lei", reply: "Fischiate il vostro segnale segreto: la voce dolce resta muta, senza saper rispondere." }
              ]
            },
            resolution: {
              policy: "destiny",
              destiny: { narrative: 50, dice: 50 },
              destiny_screen: {
                title: "✦ La palude ascolta le vostre maniere",
                narrative_result: "La vostra cortesia è sincera: le radici gentili vi guidano, niente dado.",
                dice_result: "La voce dolce insiste: serve una prova di Fortuna per non cadere nell'inganno."
              },
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LA PALUDE VI VUOLE BENE",
                text: "Ignorate la scorciatoia e seguite i sussurri gentili. Vi accompagnano dolcemente fino all'albero della Custode.",
                audio: "win-event",
                next: "custode"
              },
              fail_forward: {
                title: "🕳 SCORCIATOIA SBAGLIATA",
                text: "Fate due passi verso l'acqua nera prima di accorgervene: Pericolo +1. Tornate indietro e la palude, quasi in colpa, vi indica la via giusta.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "custode"
              }
            }
          },
          {
            scene_id: "custode",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La Custode vi accoglie sulla sua casa fra i rami. Vi guarda uno per uno. «La nebbia divide quasi tutti. Voi siete arrivati interi. Perché siete rimasti uniti?»",
              ask: "Rispondete alla Custode: cosa vi ha tenuti insieme là dentro?",
              askOptions: [
                { id: "segnale-risposta", label: "🔔 Il segnale che abbiamo inventato", reply: "«Il nostro fischio ci ha tenuti insieme» rispondete, e la Custode annuisce lentamente." },
                { id: "mai-soli", label: "🚫 Non abbiamo mai seguito una voce da soli", reply: "«Restavamo sempre in due, almeno» spiegate. La Custode sembra approvare." },
                { id: "fidarsi", label: "❤️ Ci siamo fidati dei compagni più che delle voci", reply: "«Le voci finte sembravano vere, ma i nostri amici lo erano davvero» dite. La Custode sorride appena." }
              ],
              masterTip: "Lascia rispondere due o tre bambini, poi vai avanti."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "fortuna", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ LA CUSTODE ANNUISCE",
                text: "«Buona risposta» dice. E dal tronco fa spuntare un piccolo seme che gira sempre verso casa.",
                audio: "star",
                next: "finale"
              },
              fail_forward: {
                title: "🌫 LA CUSTODE RESTA PENSIEROSA",
                text: "La risposta non la convince del tutto: resta in silenzio un lungo momento, Pericolo +1. Poi vi porge comunque un piccolo seme, ma più spento del solito.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La nebbia si dirada intorno alla casa sull'albero. La Custode vi mette in mano il Seme-Bussola: piantatelo dove volete e vi indicherà sempre la strada del ritorno.",
              masterTip: "Chiedi: se doveste dare un nome al vostro segnale, quale sarebbe?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La nebbia si dirada solo in parte intorno alla casa sull'albero. La Custode vi mette comunque in mano un seme, più spento del solito: gira verso casa, ma più piano, come se esitasse anche lui.",
              masterTip: "Chiedi: la prossima volta, cosa direbbero alla Custode per convincerla di più?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Le Radici Sussurranti",
          final_read: "La nebbia si apre e le radici tacciono. Il Seme-Bussola gira piano verso casa nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ LA CUSTODE VI LASCIA ANDARE",
          fail_subtitle: "Le Radici Sussurranti — un finale diverso",
          fail_final_read: "La nebbia si apre solo in parte. Il seme che vi affida la Custode è più spento del solito, ma gira ancora verso casa."
        }
      }
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
        { type: "coins", amount: 275000 },
        { type: "trophy", id: "domatore-di-case" },
        { type: "power", id: "palafitta-pieghevole" }
      ],
      growth: "Ogni gruppo che porta a termine il proprio compito segna 1 crescita condivisa.",
      fail: "La casa arriva in riva al mare e diventa una buffa barca a quattro zampe.",
      escape: "Usare la casa stessa come nave e governarla con quattro remi: prova di Coraggio 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "La casa sulle palafitte si scrolla, tira fuori quattro zampe di legno e parte a passo svelto in mezzo alla palude. Da una finestra una nonna pirata sventola le braccia: «Fermatemi! Sono partita senza montare il freno!»",
              ask: "Come si ferma una casa che cammina, senza romperla e senza farsi calpestare?",
              askOptions: [
                { id: "a-pezzi", label: "🐢 Rallentiamola un pezzo alla volta", reply: "«Non tutto insieme, un passo alla volta» decidete, osservando le zampe di legno." },
                { id: "morbido", label: "🍃 La facciamo inciampare in qualcosa di morbido", reply: "«Un mucchio di foglie davanti a una zampa!» propone qualcuno." },
                { id: "dall-interno", label: "🏠 Saliamo a bordo e cerchiamo dall'interno", reply: "«Deve esserci un freno da qualche parte dentro» pensate, guardando le finestre che ballonzolano." }
              ],
              masterTip: "Cammina sul posto a passo pesante mentre parli: la casa 'traballa' anche a voce."
            },
            interaction: "Nessun tiro: si cerca un modo per rallentarla.",
            outcome: {
              title: "La casa punta al mare",
              text: "Le zampe di legno accelerano verso la riva. Se arriva all'acqua, la nonna e la sua casa finiscono alla deriva.",
              audio: "minaccia",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Tre sentieri corrono a fianco della casa. Potete provare a salirci a bordo aggrappandovi alle liane, oppure restare a terra e costruirle un freno al volo.",
              ask: "Saltiamo a bordo, o costruiamo un freno da qui?"
            },
            choices: [
              {
                id: "bordo",
                label: "🪢 Saltiamo a bordo",
                reaction_title: "La ciurma si aggrappa alle liane",
                reaction: "Vi lanciate una dopo l'altra e afferrate il portico che ballonzola. Da qui si può raggiungere la nonna.",
                next: "bordo"
              },
              {
                id: "freno",
                label: "🔧 Costruiamo un freno da terra",
                reaction_title: "La ciurma progetta un freno",
                reaction: "Raccogliete corde, foglie larghe e un tronco. Serve un'idea che rallenti la casa senza farla ribaltare.",
                next: "freno"
              }
            ]
          },
          {
            scene_id: "bordo",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il portico ondeggia come una barca in tempesta. Dentro, la nonna vi indica una leva enorme: «Il freno va lì! Ma tenetevi forte, questa vecchia salta i fossi!»",
              ask: "Come attraversate il portico che sbatte per arrivare alla leva del freno?",
              askOptions: [
                { id: "piedi-a-terra", label: "👣 Muoversi solo con entrambi i piedi a terra", reply: "Aspettate il momento in cui la casa tocca terra con due zampe insieme, poi scattate." },
                { id: "catena", label: "⛓️ Facciamo una catena, mano nella mano", reply: "Vi allacciate le mani in fila, avanzando come un unico corpo tremolante." },
                { id: "leggero-avanti", label: "🪶 Il più leggero va avanti, gli altri fanno da ancora", reply: "Il pirata più agile scatta in avanti, mentre gli altri lo tengono saldo da dietro." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ ALLA LEVA!",
                text: "Attraversate il portico che sbatte e afferrate la leva tutti insieme. La casa rallenta con un lungo scricchiolìo.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "🏚 CHE SCOSSONE!",
                text: "La casa salta un fosso e vi sballotta di qua e di là: Pericolo +1. Nessuno cade, ma arrivate alla leva un po' ammaccati e in ritardo.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "freno",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Correte di fianco alla casa con le braccia piene di roba. Il freno va inventato adesso, con quel poco che avete: corde, foglie giganti, un tronco.",
              ask: "Che freno costruite con tre oggetti della palude? E chi fa cosa?",
              askOptions: [
                { id: "paracadute", label: "🍃 Foglie giganti come paracadute dietro", reply: "Legate le foglie più larghe alla schiena della casa: sventolano come una vela al contrario." },
                { id: "tronco", label: "🪵 Un tronco tra le zampe, per farla inciampare piano", reply: "Incastrate un tronco robusto proprio nel punto giusto, con cautela." },
                { id: "corde-zampe", label: "🪢 Corde per legare due zampe e accorciare il passo", reply: "Annodate le corde tra due zampe di legno, stringendo il passo della casa." }
              ],
              masterTip: "Fatti dire da tre bambini i tre oggetti e il compito di ognuno."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino prova il vostro freno",
                button: "Affidiamoci al Destino",
                group_result: "Il freno è pensato così bene che funziona al primo colpo, senza prove.",
                dice_result: "I pezzi sono tenuti insieme male: serve una prova di Astuzia per farlo reggere."
              },
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ FRENO A POSTO",
                text: "Le foglie si gonfiano dietro, il tronco fa attrito, le corde accorciano il passo. La casa rallenta fino a fermarsi con un sospiro di legno.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "💨 SI STACCA TUTTO",
                text: "Metà del freno si sfascia alla prima buca: Pericolo +1. Ma quella metà basta a rallentarla abbastanza da starle dietro.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "insieme",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La casa è quasi ferma, ma il freno vero — quello di legno, dentro — funziona solo se lo tirano tutti nello stesso identico momento. La riva è vicina.",
              ask: "Qual è il vostro segnale per tirare il freno tutti insieme all'ultimo secondo?",
              askOptions: [
                { id: "adesso", label: "📣 Un «adesso!» gridato dalla nonna", reply: "La nonna si prepara a gridare, la mano già sulla leva." },
                { id: "contare-passi", label: "🔢 Contiamo i passi: al quarto, tutti insieme", reply: "«Uno... due... tre... QUATTRO!» — contate i passi della casa in coro." },
                { id: "respiro", label: "👀 Ci guardiamo e tiriamo al respiro", reply: "Vi scambiate un'occhiata, tutti pronti, e aspettate il momento giusto insieme." }
              ],
              masterTip: "Fai crescere la tensione: la riva si avvicina, il tempo stringe."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ FERMA!",
                text: "Al segnale, ogni mano tira. La casa si pianta a due passi dall'acqua e si siede sulle quattro zampe come un cane stanco.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🌊 UN PIEDE IN ACQUA",
                text: "Qualcuno tira in ritardo: la casa mette una zampa in acqua, Pericolo +1. Diventa una specie di barca a zampe — funziona, ma non è più la stessa casa di prima.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La nonna scende dal portico, monta finalmente il freno vero e vi abbraccia tutti insieme. «La prossima volta parto col freno, promesso.» Vi regala una palafitta pieghevole: una casetta da tenere in tasca.",
              masterTip: "Chiedi: qual è stato il compito più importante, e chi l'ha fatto?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La nonna scende dal portico, un po' scossa, e monta il freno vero. «Be', ora sono anche un pochino una barca» ride, guardando la zampa bagnata. Vi regala comunque una palafitta pieghevole, con un angolo un po' storto.",
              masterTip: "Chiedi: la prossima volta, chi darebbe il segnale per tirare il freno?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Casa che Cammina",
          final_read: "La casa si siede sulle quattro zampe e la nonna monta il freno. La Palafitta Pieghevole sta comoda nella tasca della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ LA CASA SI FERMA, QUASI",
          fail_subtitle: "La Casa che Cammina — un finale diverso",
          fail_final_read: "La casa si ferma con una zampa già in acqua. La nonna ride e vi regala comunque una palafitta pieghevole, un po' storta."
        }
      }
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
        { type: "coins", amount: 300000 },
        { type: "trophy", id: "liberatore-di-eco" },
        { type: "power", id: "barattolo-eco" }
      ],
      growth: "Chi riesce a farsi capire meglio senza parlare segna 1 crescita Astuzia.",
      fail: "Il cristallo si sveglia e canta: la grotta cambia forma e percorso.",
      escape: "Pronunciare tutti insieme la parola «casa» dentro il cerchio di teletrasporto: prova di Fortuna 7.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Provate a gridare, ma nella grotta nessun suono torna indietro. Sugli scaffali decine di barattoli brillano: dentro ogni barattolo è chiusa un'eco — una voce, una risata, un tonfo. Una creatura fatta d'ombra le ha rubate tutte.",
              ask: "Perché un'ombra dovrebbe rubare le eco? E cosa potrebbe convincerla a ridarle indietro?",
              askOptions: [
                { id: "sola", label: "😔 Forse è sola e le eco le fanno compagnia", reply: "«Magari ha solo bisogno di voci intorno» pensate, osservando l'ombra silenziosa." },
                { id: "colleziona", label: "🗃️ Forse colleziona suoni come noi le conchiglie", reply: "«Un collezionista di rumori!» esclama qualcuno, quasi ammirato." },
                { id: "suono-nuovo", label: "🎁 Forse le basterebbe un suono mai sentito", reply: "«Se le regalassimo qualcosa di nuovo...» propone qualcuno, pensieroso." }
              ],
              masterTip: "Parla piano e ovattato, come se la grotta si mangiasse le tue parole."
            },
            interaction: "Nessun tiro: si ragiona sull'ombra.",
            outcome: {
              title: "L'ombra vi osserva",
              text: "Si sposta tra gli scaffali senza fare rumore — ovvio, il rumore ce l'ha lei nei barattoli. Aspetta di vedere cosa fate.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Il pavimento è disseminato di pietre musicali: se le calpesti suonano, e potrebbero svegliare il grande cristallo addormentato in fondo. L'ombra, intanto, si è avvicinata incuriosita.",
              ask: "Ci muoviamo in silenzio tra le pietre, o proviamo subito a stupire l'ombra con un suono nuovo?"
            },
            choices: [
              {
                id: "silenzio",
                label: "🤫 Ci muoviamo in silenzio assoluto",
                reaction_title: "La ciurma trattiene il fiato",
                reaction: "Comunicate solo a gesti e appoggiate i piedi tra una pietra musicale e l'altra. Un passo falso e il cristallo si sveglia.",
                next: "silenzio"
              },
              {
                id: "suono",
                label: "🎺 Inventiamo subito un suono mai sentito",
                reaction_title: "La ciurma prova a stupire l'ombra",
                reaction: "Vi mettete in cerchio: serve un suono che nessuno abbia mai fatto, fatto con voce, mani e un oggetto.",
                next: "suono"
              }
            ]
          },
          {
            scene_id: "silenzio",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le pietre musicali sono ovunque e in penombra si vedono male. Per un tratto potete comunicare solo a gesti: chi guida indica dove mettere i piedi.",
              ask: "Come vi date gli ordini senza fare un solo rumore?",
              askOptions: [
                { id: "gesti-base", label: "✋ Tre gesti: fermi, di qua, piano", reply: "Inventate tre segnali muti e li provate in silenzio, un dito alla volta." },
                { id: "capofila", label: "🥇 Il primo decide, gli altri copiano", reply: "Un pirata si mette in testa alla fila: gli altri seguono ogni suo movimento, identico." },
                { id: "guardare-piedi", label: "👣 Guardiamo sempre i piedi di chi precede", reply: "Vi mettete in fila strettissima, gli occhi fissi sui talloni davanti a voi." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ NEANCHE UN SUONO",
                text: "Passo silenzioso dopo passo silenzioso, raggiungete gli scaffali senza svegliare il cristallo. L'ombra vi guarda ammirata.",
                audio: "win-event",
                next: "dono"
              },
              fail_forward: {
                title: "🔔 UNA PIETRA CANTA",
                text: "Un tallone sfiora una pietra: DING! Il cristallo si gira nel sonno e la grotta cambia forma, Pericolo +1. Il nuovo percorso però vi porta lo stesso ai barattoli.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "dono"
              }
            }
          },
          {
            scene_id: "suono",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "L'ombra si china verso di voi, in attesa. Ha sentito milioni di suoni: risate, tuoni, campane, starnuti. Serve qualcosa che non abbia mai sentito.",
              ask: "Qual è il suono nuovo? Combinate voce, mani e un oggetto che avete sul tavolo.",
              askOptions: [
                { id: "combinazione", label: "🎶 Verso + battito + oggetto strofinato", reply: "Mescolate un fischio, un battito di mani e lo sfregamento di una tasca: nasce qualcosa di strano e nuovo." },
                { id: "cambia", label: "🔄 Un suono che cambia mentre lo fate", reply: "Cominciate piano e lo fate crescere, cambiare, quasi trasformarsi in volo." },
                { id: "tutti-insieme", label: "👥 Lo facciamo tutti insieme, più grosso", reply: "Vi mettete in cerchio e producete il suono in coro, così risuona più forte." }
              ]
            },
            resolution: {
              policy: "destiny",
              destiny: { narrative: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino ascolta il vostro suono",
                narrative_result: "L'ombra non l'aveva mai sentito: spalanca gli occhi e apre i barattoli da sola.",
                dice_result: "L'ombra tende l'orecchio, non convinta: serve una prova di Fortuna per stupirla davvero."
              },
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ UN SUONO MAI SENTITO",
                text: "L'ombra resta a bocca aperta. Poi, felice, apre ogni barattolo: la grotta si riempie di risate, voci e tonfi liberati.",
                audio: "win-event",
                next: "dono"
              },
              fail_forward: {
                title: "🎵 GIÀ SENTITO",
                text: "L'ombra scuote la testa: quel suono lo conosceva. Delusa, ne fa cadere un barattolo: DONG! Il cristallo si sveglia un po', Pericolo +1. Ma nella confusione afferrate qualche barattolo.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "dono"
              }
            }
          },
          {
            scene_id: "dono",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le eco sono quasi tutte libere, ma l'ombra ne stringe ancora una: la sua preferita, la prima che ha rubato. Non vuole restare di nuovo in silenzio.",
              ask: "Cosa le lasciate in cambio, così non si sente più sola?",
              askOptions: [
                { id: "insegnare-suono", label: "🎵 Le insegniamo il nostro suono nuovo", reply: "Ripetete il suono lentamente, finché l'ombra non riesce a rifarlo da sola." },
                { id: "frase-barattolo", label: "🗣️ Registriamo una frase per lei in un barattolo", reply: "Uno di voi parla piano dentro il barattolo vuoto: «Non sei sola» — e lo richiude con cura." },
                { id: "promessa", label: "🤝 Promettiamo di tornare con nuovi suoni", reply: "«Torneremo a trovarti» promettete, e l'ombra sembra tendere l'orecchio a quella promessa." }
              ],
              masterTip: "Lascia che il dono venga davvero da un'idea dei bambini, non suggerirlo tu."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "fortuna", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ NON PIÙ SOLA",
                text: "L'ombra chiude il barattolo del vostro dono e se lo stringe al petto. Poi vi restituisce l'ultima eco e vi saluta con un cenno.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🌑 UN PO' TRISTE",
                text: "Il regalo non la convince fino in fondo e trattiene un po' l'ultima eco: Pericolo +1. Ve la restituisce comunque, ma piano, quasi sottovoce.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Gridate «CIAO!» e la parola torna indietro dieci volte, felice di poterlo fare di nuovo. L'ombra vi regala un barattolo speciale: catturaci dentro un rumore utile e lo userai una volta quando vuoi.",
              masterTip: "Chiedi: che suono nuovo vorreste inventare per la prossima volta?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Gridate «CIAO!» e la parola torna indietro, ma più flebile del previsto — l'ombra non si è ancora convinta fino in fondo. Vi lascia comunque un barattolo, un po' opaco, con dentro un rumore utile.",
              masterTip: "Chiedi: la prossima volta, cosa regalerebbero all'ombra per conquistarla del tutto?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "L'Eco Rubata",
          final_read: "La grotta ripete ogni parola, felice. Il Barattolo dell'Eco aspetta un rumore utile nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ L'OMBRA VI LASCIA ANDARE",
          fail_subtitle: "L'Eco Rubata — un finale diverso",
          fail_final_read: "Le vostre grida tornano indietro, più flebili del previsto. L'ombra vi lascia comunque un barattolo, un po' opaco, come ricordo."
        }
      }
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
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "primo-volo" },
        { type: "power", id: "pozione-volo" }
      ],
      growth: "Il primo volontario che si stacca da terra segna 1 crescita Coraggio.",
      fail: "La pozione funziona troppo bene: atterrano su un sentiero completamente diverso.",
      escape: "Bere una Pozione di Volo e seguire le lucciole fino al porto: nessuna prova, consuma la pozione.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Migliaia di lucciole azzurre riempiono la grotta e dove passano i sassolini si staccano da terra e galleggiano. In alto, appiccicata al soffitto, c'è una pozionista: «Portatemi gli ingredienti giusti e vi insegno a volare!»",
              ask: "Se le lucciole fanno volare i sassi, come possiamo usarle per far scendere lei e far salire noi?",
              askOptions: [
                { id: "raccogliere", label: "🫙 Raccogliamo la luce delle lucciole in qualcosa", reply: "«Servono delle fiale!» decidete, guardando lo sciame azzurro intorno a voi." },
                { id: "colori-diversi", label: "🎨 Servono colori diversi per salire e scendere", reply: "«Non può essere un solo colore» ragionate, osservando le sfumature della grotta." },
                { id: "prova-sasso", label: "🪨 Proviamo prima con un sasso", reply: "«Meglio testarlo su qualcosa che non siamo noi» propone qualcuno, prudente." }
              ],
              masterTip: "Fai svolazzare le mani come lucciole mentre parli: l'idea del volo entra subito."
            },
            interaction: "Nessun tiro: si pensa alla ricetta.",
            outcome: {
              title: "Le lucciole si radunano",
              text: "Uno sciame azzurro vi gira intorno, curioso. Aspettano solo che qualcuno decida dove mandarle.",
              audio: "click",
              next: "colori"
            }
          },
          {
            scene_id: "colori",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "In tre zone della grotta le lucciole brillano di colori diversi: una luce chiara, una calda, una blu profondo. Ognuna spinge in un modo.",
              ask: "Decidete la ricetta di tre colori: quale fa salire, quale tiene fermi in aria, quale fa scendere?",
              askOptions: [
                { id: "chiara-su", label: "☀️ La luce chiara fa salire", reply: "«È la più leggera, deve tirare su» decidete, versando la prima fiala." },
                { id: "calda-ferma", label: "🔥 Quella calda tiene fermi a mezz'aria", reply: "«Tiepida e stabile, perfetta per restare sospesi» concordate." },
                { id: "blu-scende", label: "🌊 Il blu profondo fa scendere", reply: "«Pesante come l'acqua profonda, tira giù piano» spiegate alla pozionista." }
              ]
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino prova la vostra ricetta",
                button: "Affidiamoci al Destino",
                group_result: "La ricetta ha una logica perfetta: le pozioni funzionano subito, senza prove.",
                dice_result: "I colori si mescolano male nelle fiale: serve una prova di Astuzia per dosarli."
              },
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ TRE POZIONI PERFETTE",
                text: "Una fa salire dritti, una tiene fermi a mezz'aria, una fa scendere dolci come piume. La pozionista applaude dal soffitto.",
                audio: "win-event",
                next: "volo"
              },
              fail_forward: {
                title: "🌈 MISCELA PAZZA",
                text: "Una fiala fa sia salire che girare su se stessi: qualche giravolta di troppo, Pericolo +1. Ma capite lo sbaglio e correggete le altre due.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "volo"
              }
            }
          },
          {
            scene_id: "volo",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Le pozioni sono pronte. Ora bisogna usarle davvero: prima per far scendere la pozionista, poi per portare tutta la ciurma giù sana e salva.",
              ask: "Chi guida il primo volo di prova, e con quale pozione?"
            },
            choices: [
              {
                id: "dosare",
                label: "🧪 Dosiamo con precisione, poche gocce alla volta",
                reaction_title: "La ciurma va cauta",
                reaction: "Contate le gocce a voce alta e salite un pezzetto per volta, controllando ogni volta l'altezza.",
                next: "dosare"
              },
              {
                id: "primo",
                label: "🚀 Un volontario guida la cordata su, subito",
                reaction_title: "La ciurma si affida al coraggio",
                reaction: "Un pirata si stacca da terra per primo, la corda tesa dietro di sé, e tutti gli altri si preparano a seguirlo.",
                next: "primo"
              }
            ]
          },
          {
            scene_id: "dosare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Goccia dopo goccia, salite piano verso la pozionista. Ma più siete in alto, più le lucciole vi girano intorno e confondono le dosi.",
              ask: "Come tenete la calma e il conto delle gocce a dieci metri da terra?",
              askOptions: [
                { id: "uno-conta", label: "🧮 Uno solo tiene le fiale e conta per tutti", reply: "Un pirata si assume la responsabilità delle gocce, mentre gli altri si fidano e respirano piano." },
                { id: "sospensione", label: "⏸️ Ci fermiamo con la pozione di sospensione se serve", reply: "Al primo capogiro, qualcuno beve una goccia di quella calda e resta fermo a mezz'aria, tranquillo." },
                { id: "scendere-goccia", label: "⬇️ Scendiamo di una goccia se saliamo troppo in fretta", reply: "Appena la salita accelera troppo, aggiungete una goccia di blu per rallentare." }
              ]
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ DISCESA MORBIDA",
                text: "Portate giù la pozionista e poi voi stessi, goccia dopo goccia, fino a toccare terra come piume.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🍃 ATTERRAGGIO A SORPRESA",
                text: "Una dose sbagliata vi fa planare lontano: Pericolo +1. Atterrate su un sentiero diverso da quello voluto — la pozionista è con voi, ma stavolta la scorciatoia non basta a rimettere tutto a posto.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "primo",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il primo volontario è già a mezz'aria, la corda tesa. Sotto, la ciurma tiene forte; sopra, la pozionista aspetta con le braccia aperte.",
              ask: "Come segue tutta la cordata il primo, senza che nessuno resti indietro o vada troppo su?",
              askOptions: [
                { id: "stessa-dose", label: "🥤 Beviamo tutti la stessa dose insieme", reply: "Contate «uno, due, tre» e bevete tutti nello stesso istante, per salire alla pari." },
                { id: "guardare-vicini", label: "👀 Guardiamo sempre chi sta sopra e sotto di noi", reply: "Ognuno tiene d'occhio i due compagni più vicini, pronto ad avvisare se qualcosa non va." },
                { id: "correzione-blu", label: "🔵 Chi sale troppo beve una goccia di blu", reply: "Chi si stacca troppo dal gruppo sorseggia una goccia di blu per riallinearsi." }
              ]
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ TUTTI IN VOLO",
                text: "La cordata sale unita, prende la pozionista e scende insieme, ridendo. Il primo volo della ciurma è un successo.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🎈 UNO VOLA TROPPO",
                text: "Un pirata sale più del previsto e trascina un po' gli altri: qualche spavento, Pericolo +1. La pozionista li acchiappa al volo, ma l'atterraggio resta un po' scomposto.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Piedi a terra, tutti. La pozionista, felice di essere scesa, vi riempie una fiala di pozione di volo controllato: una scorta per quando ne avrete davvero bisogno.",
              masterTip: "Chiedi: com'è stato staccarsi da terra la prima volta?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Piedi a terra, ma non proprio dove speravate. La pozionista, un po' scarmigliata anche lei, vi riempie comunque una fiala di pozione di volo — meno potente del previsto, ma funzionante.",
              masterTip: "Chiedi: la prossima volta, quale dose vorrebbero dosare meglio?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Le Lucciole che Fanno Volare",
          final_read: "Le lucciole azzurre tornano a sollevare sassolini. La Pozione di Volo riposa nella sacca della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ ATTERRAGGIO UN PO' STORTO",
          fail_subtitle: "Le Lucciole che Fanno Volare — un finale diverso",
          fail_final_read: "L'atterraggio è un po' scomposto, ma tutti sono a terra sani e salvi. La pozionista vi affida comunque una fiala, meno potente del previsto."
        }
      }
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
        { type: "coins", amount: 200000 },
        { type: "trophy", id: "voce-gentile" },
        { type: "power", id: "perla-respiro" }
      ],
      growth: "Chi racconta il sogno alla sirena segna 1 crescita Fortuna.",
      fail: "La sirena si gira nel sonno e, senza volerlo, apre un passaggio dietro la cascata.",
      escape: "Chiedere alla sirena una bolla gigante che porti il gruppo fino al mare aperto.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Sotto la cascata dorme una sirena grande come una collina. Ogni volta che sbadiglia, tira dentro tutta l'acqua e per qualche secondo i pesci restano sospesi a mezz'aria, sorpresi. Poi l'acqua torna, e lei sbadiglia di nuovo.",
              ask: "Come si sveglia una sirena gigante con gentilezza, senza spaventarla?",
              askOptions: [
                { id: "canto-contrario", label: "🎵 Le cantiamo qualcosa di dolce, al contrario", reply: "Provate a cantare una ninna nanna alla rovescia: suona buffa, ma dolce." },
                { id: "storia", label: "📖 Le raccontiamo una storia bella", reply: "Cominciate a sussurrare una storia, piano piano, come si fa con chi dorme." },
                { id: "aspettare", label: "⏳ Aspettiamo tra uno sbadiglio e l'altro", reply: "Vi avvicinate un passo alla volta, solo nei momenti di calma tra uno sbadiglio e l'altro." }
              ],
              masterTip: "Sbadiglia piano mentre parli (fai finta): è contagioso, i bambini si calmano."
            },
            interaction: "Nessun tiro: si cerca il modo gentile.",
            outcome: {
              title: "La sirena sorride nel sonno",
              text: "Un angolo della bocca gigante si alza appena. Qualsiasi cosa stia sognando, le piace. Continuate voi.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Tre pesci parlanti, rimasti a bocca aperta a mezz'aria, vi danno tre consigli completamente diversi e tutti sicurissimi.",
              ask: "Le raccontiamo un sogno bello, o intanto rimettiamo in acqua i pesci prima del prossimo sbadiglio?"
            },
            choices: [
              {
                id: "sogno",
                label: "🌙 Le raccontiamo un sogno inventato per lei",
                reaction_title: "La ciurma inventa un sogno",
                reaction: "Vi avvicinate all'orecchio gigante e cominciate a raccontare piano. La sirena smette di russare per ascoltare.",
                next: "sogno"
              },
              {
                id: "pesci",
                label: "🐟 Rimettiamo in acqua i pesci sospesi",
                reaction_title: "La ciurma salva i pesci",
                reaction: "Correte tra le pozze passandovi i pesci di mano in mano, prima che l'acqua se ne vada di nuovo.",
                next: "pesci"
              }
            ]
          },
          {
            scene_id: "sogno",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La sirena ascolta con gli occhi chiusi. Un sogno per svegliarla deve avere qualcosa di suo: un posto, un amico, e una sorpresa che la faccia sorridere davvero.",
              ask: "Inventate il sogno: un luogo, un animale e una sorpresa che svegli la sirena facendola sorridere.",
              askOptions: [
                { id: "posto-morbido", label: "🪶 Un posto morbido, come una spiaggia di piume", reply: "«C'era una spiaggia fatta tutta di piume soffici...» comincia il racconto." },
                { id: "animale-buffo", label: "🐭 Un animale piccolo e buffo che le fa il solletico", reply: "«...e un topolino con i baffi lunghissimi le faceva il solletico sul naso...»" },
                { id: "sorpresa", label: "🎉 Una sorpresa che non si aspetta", reply: "«...e all'improvviso, la cascata si mise a cantare!» — la sorpresa arriva al momento giusto." }
              ],
              masterTip: "Fatti dire luogo, animale e sorpresa da tre bambini diversi e legali in una frase."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "fortuna", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ LA SIRENA SI SVEGLIA",
                text: "Al finale del sogno la sirena apre gli occhi grandi come lune e ride. La cascata riparte a scrosciare, allegra.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "😴 SI GIRA NEL SONNO",
                text: "Il sogno si perde a metà e la sirena si rigira nel sonno: Pericolo +1. Con la coda apre un passaggio dietro la cascata, ma resta addormentata — non proprio come speravate.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "pesci",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "I pesci galleggiano a mezz'aria per pochi secondi ogni volta. Bisogna essere veloci e delicati: un pesce lasciato cadere si fa male.",
              ask: "Come organizzate la catena umana per rimettere in acqua più pesci possibile, prima dello sbadiglio?",
              askOptions: [
                { id: "fila", label: "🐟 Una fila dalle pozze all'acqua, pesce per pesce", reply: "Vi disponete in fila e passate i pesci di mano in mano, veloci." },
                { id: "veloce-corre", label: "🏃 Il più veloce corre, gli altri passano i pesci", reply: "Il pirata più veloce fa la spola, mentre gli altri preparano i pesci pronti da consegnare." },
                { id: "contare-sbadigli", label: "🔢 Contiamo gli sbadigli per sapere quanto tempo resta", reply: "Uno tiene il conto ad alta voce: «Prossimo sbadiglio tra... tre... due...»" }
              ]
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ TUTTI IN ACQUA",
                text: "Passo dopo passo, pesce dopo pesce, li rimettete tutti a mollo. I pesci parlanti, riconoscenti, svegliano loro la sirena con un coro di grazie.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🐠 QUALCUNO SCIVOLA",
                text: "Un pesce vi sguscia di mano e finisce in una pozza sbagliata: qualche corsa in più, Pericolo +1. Salvate quasi tutti i pesci, ma la sirena resta addormentata, indifferente al trambusto.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La sirena si stiracchia, la cascata torna a scrosciare piena e i pesci nuotano felici. Prima di rituffarsi, la sirena vi soffia in mano una perla che tiene il respiro: chi la stringe può restare sott'acqua a lungo.",
              masterTip: "Chiedi: com'era la sorpresa del vostro sogno?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La cascata riparte, un po' a singhiozzo, ma la sirena resta addormentata — non vi ha sentiti fino in fondo. Prima di sprofondare di nuovo nel sonno, soffia comunque in acqua una perla, più opaca del solito.",
              masterTip: "Chiedi: la prossima volta, come proverebbero a svegliarla del tutto?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Sirena Sbadigliona",
          final_read: "La cascata torna a scrosciare e la sirena riprende il suo sonno sorridente. La Perla del Respiro luccica nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ LA CASCATA RIPARTE COMUNQUE",
          fail_subtitle: "La Sirena Sbadigliona — un finale diverso",
          fail_final_read: "La cascata torna a scorrere, ma la sirena resta addormentata. Vi lascia comunque una perla, più opaca del solito, prima di riaddormentarsi."
        }
      }
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
        { type: "coins", amount: 275000 },
        { type: "trophy", id: "raddrizza-fiumi" },
        { type: "power", id: "bottiglia-corrente" }
      ],
      growth: "Chi risolve l'ordine delle ruote segna 1 crescita Astuzia.",
      fail: "La corrente cambia lato e deposita il gruppo in un'altra zona dell'isola.",
      escape: "Costruire una zattera e lasciarsi portare dalla corrente riparata: prova di Astuzia 5.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Qualcosa non torna: il fiume scorre verso l'alto, non verso il mare. L'acqua risale la montagna trascinando con sé barche capovolte, banchi di pesci e rami. In mezzo alla corrente c'è anche una capra, aggrappata a un tronco.",
              ask: "Cosa può aver messo un fiume al contrario? E come si torna a farlo scendere?",
              askOptions: [
                { id: "girato", label: "🔧 Qualcuno ha girato qualcosa in cima alla montagna", reply: "«Deve esserci un meccanismo lassù» ipotizzate, guardando in alto." },
                { id: "pompa", label: "⚙️ Forse c'è una pompa gigante o una ruota", reply: "«Una ruota che spinge l'acqua all'insù» pensate, osservando la corrente impazzita." },
                { id: "capra-sa", label: "🐐 La capra sembra sapere qualcosa", reply: "«Viene da lassù, forse ha visto tutto» notate, seguendo la capra con lo sguardo." }
              ],
              masterTip: "Racconta il fiume che sale con la voce che 'sale' anche lei, di tono."
            },
            interaction: "Nessun tiro: si indaga sul mistero.",
            outcome: {
              title: "La corrente vi trascina su",
              text: "Anche voi cominciate a scivolare verso l'alto. Tanto vale seguire il fiume fino alla sua sorgente sbagliata.",
              audio: "minaccia",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Per risalire serve una piccola zattera sulla corrente verticale. In cima ci sono tre ruote di pietra: una gira la direzione, una la velocità, una l'altezza.",
              ask: "Ci concentriamo sul guidare la zattera senza ribaltarci, o sul capire l'ordine delle tre ruote?"
            },
            choices: [
              {
                id: "zattera",
                label: "🛶 Guidiamo la zattera sulla corrente verticale",
                reaction_title: "La ciurma tiene l'equilibrio",
                reaction: "Vi spostate tutti al centro e usate i remi come bilancieri. La zattera risale la parete d'acqua traballando.",
                next: "zattera"
              },
              {
                id: "ruote",
                label: "⚙️ Studiamo l'ordine delle tre ruote",
                reaction_title: "La ciurma affronta l'enigma",
                reaction: "Vi arrampicate accanto alle ruote di pietra: direzione, velocità, altezza. In che ordine si toccano?",
                next: "ruote"
              }
            ]
          },
          {
            scene_id: "zattera",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La corrente verticale è liscia come vetro e ogni movimento brusco fa sbandare la zattera. Sotto di voi, tanto vuoto.",
              ask: "Come tenete la zattera dritta risalendo una cascata al contrario?",
              askOptions: [
                { id: "insieme", label: "🤝 Ci muoviamo tutti insieme, mai da soli", reply: "Vi spostate in sincrono, un passo alla volta, senza mai lasciare il centro della zattera." },
                { id: "guardare-alto", label: "👆 Guardiamo in alto, verso dove andiamo", reply: "Tenete lo sguardo fisso sulla cima, ignorando il vuoto sotto di voi." },
                { id: "remo-piano", label: "🚣 Il remo si usa piano, come un timone", reply: "Chi tiene il remo lo muove con calma, piccoli aggiustamenti invece di colpi bruschi." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ SU FINO ALLA CIMA",
                text: "Tenete la zattera dritta fino in cima, dove le tre ruote di pietra vi aspettano immobili.",
                audio: "win-event",
                next: "capra"
              },
              fail_forward: {
                title: "🌊 SBANDATA!",
                text: "La zattera si gira e la corrente vi molla in un'altra zona dell'isola: Pericolo +1. Da lì c'è un sentiero a piedi che porta comunque alle ruote.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "capra"
              }
            }
          },
          {
            scene_id: "ruote",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le tre ruote sono coperte di simboli. Girarle nell'ordine sbagliato fa impennare il fiume ancora di più.",
              ask: "In che ordine girate direzione, velocità e altezza per rimettere il fiume verso il mare?",
              askOptions: [
                { id: "direzione-prima", label: "🧭 Prima la direzione, poi il resto", reply: "«Prima decidiamo dove deve andare» spiegate, girando la prima ruota." },
                { id: "altezza-ultima", label: "📏 L'altezza per ultima", reply: "«L'altezza si sistema solo alla fine, quando il verso è giusto» ragionate." },
                { id: "velocita-piano", label: "🐢 La velocità va girata piano", reply: "«Piano, piano, o l'acqua impazzisce di nuovo» avvisate, girando con cautela." }
              ],
              masterTip: "Fatti dire l'ordine dai bambini e il perché di ogni passaggio."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ IL FIUME RALLENTA",
                text: "Verso, velocità, altezza: nell'ordine giusto. Il fiume si ferma un attimo a mezz'aria, poi ricomincia a scendere verso il mare, sollevato.",
                audio: "win-event",
                next: "capra"
              },
              fail_forward: {
                title: "🌀 IMPENNATA",
                text: "Una ruota va nel momento sbagliato e il fiume schizza in alto: Pericolo +1. Ma la spinta vi sbatte proprio sulla ruota della direzione, che stavolta girate per bene.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "capra"
              }
            }
          },
          {
            scene_id: "capra",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La capra si è calmata e adesso vi guarda seria. «Conosco il blocco che teneva il fiume al contrario. Ve lo dico. Ma solo se me lo chiedete... in rima.»",
              ask: "Inventate una domanda in rima per la capra, e una risposta che dica come togliere l'ultimo blocco.",
              askOptions: [
                { id: "rime-facili", label: "🎵 Rime facili: -ella, -are, -etto", reply: "«Capretta bella, dove sta la cosa che il fiume ribalta?» tentate, con rime semplici." },
                { id: "domanda-diretta", label: "❓ Chiediamo: cosa tiene il fiume all'insù?", reply: "«Cosa tiene il fiume all'insù, capra che sai tutto tu?» chiedete, dritti al punto." },
                { id: "gesto", label: "👉 Rispondiamo anche con un gesto", reply: "Oltre alle parole, indicate il punto esatto dove pensate sia il blocco, sperando di indovinare." }
              ],
              masterTip: "Non serve una rima perfetta: basta che faccia ridere anche solo un po'."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "astuzia", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ LA CAPRA È SODDISFATTA",
                text: "La rima le piace così tanto che vi svela tutto: togliete l'ultimo tappo di pietra e il fiume torna a scendere pieno e felice, capra compresa.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🐐 RIMA ZOPPA",
                text: "La rima non sta in piedi e la capra fa la difficile: Pericolo +1. Vi indica solo a metà dove si trova il tappo — il resto dovrete scoprirlo un'altra volta.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il fiume scroscia di nuovo verso il mare, portandosi dietro barche, pesci e una capra molto più tranquilla. Dall'acqua raccogliete una bottiglia sigillata: dentro, un pezzetto di corrente pronto all'uso.",
              masterTip: "Chiedi: qual è stata la rima più bella della vostra filastrocca?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il fiume torna a scendere, ma più lento e incerto del previsto: il tappo non è stato tolto del tutto. Dall'acqua raccogliete comunque una bottiglia, con dentro solo un filo di corrente.",
              masterTip: "Chiedi: la prossima volta, che rima proverebbero per convincere la capra?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Fiume al Contrario",
          final_read: "Il fiume torna a scendere verso il mare. La Bottiglia della Corrente gorgoglia piano nella sacca della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ IL FIUME SCENDE, UN PO' PIANO",
          fail_subtitle: "Il Fiume al Contrario — un finale diverso",
          fail_final_read: "Il fiume torna a scendere, ma più lento del previsto. Nella bottiglia che raccogliete resta solo un filo di corrente."
        }
      }
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
        { type: "coins", amount: 325000 },
        { type: "trophy", id: "riparatore-del-cielo" },
        { type: "power", id: "vela-nuvola" }
      ],
      growth: "Chi resta a sostenere gli altri senza mollare le corde segna 1 crescita Coraggio.",
      fail: "Il coniglio-tempesta salta via, ma nel salto lascia Pericolo +2.",
      escape: "Cucire una vela volante con un pezzo di nuvola e planare fino al porto: prova di Astuzia 7.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "In cima alla scogliera un mulino gigante macina le nuvole: da quella farina nasce tutto il vento dell'isola. Ma una pala si è staccata e il mulino gira storto. Sopra le vostre teste una tempesta prende la forma di un coniglio enorme.",
              ask: "Come si ripara un mulino gigante senza far arrabbiare ancora di più la tempesta?",
              askOptions: [
                { id: "pala-prima", label: "🔩 Recuperiamo prima la pala mancante", reply: "«Senza quella pala non si ripara niente» concordate, guardando dove galleggia." },
                { id: "piano", label: "🤫 Ci muoviamo piano, senza agitare il coniglio", reply: "«Calma, niente scatti bruschi» sussurrate, mentre il coniglio-tempesta vi osserva." },
                { id: "rallentare", label: "🐢 Rallentiamo il mulino prima di toccarlo", reply: "«Fermiamolo un po', prima di metterci le mani» proponete, guardando le pale sferragliare." }
              ],
              masterTip: "Fai la voce del vento che fischia forte quando nomini il coniglio-tempesta."
            },
            interaction: "Nessun tiro: si pianifica la riparazione.",
            outcome: {
              title: "Il coniglio-tempesta cresce",
              text: "Ogni giro storto del mulino lo fa più grande. Se salta giù dalla scogliera, finisce dritto sul porto.",
              audio: "minaccia",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "La pala staccata galleggia sospesa tra due correnti d'aria, poco lontano. Il mulino, intanto, macina a vuoto e sferraglia.",
              ask: "Andiamo a recuperare la pala volando tra le correnti, o ci concentriamo prima sugli ingranaggi del mulino?"
            },
            choices: [
              {
                id: "scalata",
                label: "🪁 Voliamo a recuperare la pala",
                reaction_title: "La ciurma sale tra le nuvole",
                reaction: "Con aquiloni e corde ben legate vi lanciate verso la pala sospesa. Il vento vi spinge di qua e di là.",
                next: "scalata"
              },
              {
                id: "ingranaggi",
                label: "🔧 Sistemiamo prima gli ingranaggi",
                reaction_title: "La ciurma apre il mulino",
                reaction: "Vi infilate dentro la pancia di legno del mulino, tra ruote dentate grandi come voi. Serve rimettere tutto in fase.",
                next: "ingranaggi"
              }
            ]
          },
          {
            scene_id: "scalata",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La pala fluttua nel punto in cui due venti si scontrano. Sbagliare la presa vuol dire farsi portare via.",
              ask: "Come afferrate la pala tenendo tutti al sicuro, in mezzo a due correnti che tirano da parti opposte?",
              askOptions: [
                { id: "corda-unica", label: "🪢 Ci leghiamo tutti alla stessa corda", reply: "Vi assicurate l'uno all'altro come una vera cordata di montagna, pronti a resistere insieme." },
                { id: "leggero-avanti", label: "🪶 Il più leggero va avanti, gli altri fanno peso", reply: "Il pirata più agile si spinge in avanti, ancorato saldamente dagli altri dietro." },
                { id: "momento-calma", label: "⏸️ Aspettiamo un momento di calma tra le raffiche", reply: "Restate immobili, contando i secondi tra una folata e l'altra, pronti a scattare." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "coraggio", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ PALA RECUPERATA",
                text: "Approfittate di un attimo di calma e afferrate la pala tutti insieme. Il vento riprende, ma voi la tenete stretta e tornate giù.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "💨 CHE RAFFICA!",
                text: "Una folata vi trascina lontano prima che riusciate a scendere: Pericolo +1. Atterrate scomodi dall'altra parte della scogliera, ma con la pala in mano.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "ingranaggi",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Dentro il mulino, decine di ruote dentate girano fuori tempo. Toccare quella sbagliata potrebbe accelerare tutto e ingrandire il coniglio-tempesta.",
              ask: "Come capite quali ingranaggi rimettere in fase, e in che ordine?",
              askOptions: [
                { id: "ruota-grande", label: "⚙️ Seguiamo la ruota grande, da cui partono le altre", reply: "«Tutto parte da quella grande al centro» osservate, tracciando il movimento con un dito." },
                { id: "bastone", label: "🪵 Fermiamo una ruota alla volta con un bastone", reply: "Incastrate un bastone tra i denti di una ruota, bloccandola con cautela." },
                { id: "ascoltare", label: "👂 Ascoltiamo il ritmo: quando è regolare, va bene", reply: "Chiudete gli occhi e ascoltate: un tic-tic regolare vi dice quando una ruota è a posto." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ INGRANAGGI IN FASE",
                text: "Ruota dopo ruota, rimettete tutto in ordine. Il mulino gira più liscio e più lento: pronto per la pala.",
                audio: "win-event",
                next: "insieme"
              },
              fail_forward: {
                title: "⚙️ SI ACCELERA!",
                text: "Un ingranaggio parte per conto suo e il mulino accelera: il coniglio-tempesta cresce, Pericolo +1. Bloccate la ruota giusta appena in tempo e la fermate.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "insieme"
              }
            }
          },
          {
            scene_id: "insieme",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Ultimo passo: rimontare la pala e riavviare il mulino alla velocità giusta. Va fatto in tre cose nello stesso momento — chi rimette la pala, chi tiene le corde, chi gira la leva.",
              ask: "Dividete i tre compiti fra i pirati: chi rimette la pala, chi tiene le corde, chi riavvia il mulino? E qual è il segnale per farlo insieme?",
              askOptions: [
                { id: "forti-corde", label: "💪 I più forti tengono le corde", reply: "Assegnate i pirati più robusti alle corde, pronti a reggere lo strappo." },
                { id: "preciso-pala", label: "🎯 Il più preciso monta la pala", reply: "Chi ha mani più ferme si occupa di incastrare la pala al punto giusto." },
                { id: "via-gridato", label: "📣 Un «via!» gridato da chi vede tutti", reply: "Uno si posiziona al centro, da dove vede tutti e tre i gruppi, pronto a dare il segnale." }
              ],
              masterTip: "Fai crescere la tensione: il coniglio-tempesta si accovaccia, pronto a saltare."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ IL MULINO RIPARTE GIUSTO",
                text: "Al «via!» la pala scatta al suo posto, le corde tengono, la leva gira. Il mulino riprende il ritmo e il coniglio-tempesta si sgonfia in una nuvoletta innocua.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🐰 IL CONIGLIO SALTA",
                text: "Un compito parte in ritardo e il coniglio-tempesta salta via: Pericolo +1. Il mulino riparte, ma gira ancora un po' storto — funziona, non benissimo.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il mulino macina di nuovo nuvole con calma e il vento dell'isola torna gentile. Da una pala staccata prima raccogliete un lembo di nuvola cucito: una vela che, spiegata, prende sempre un filo di vento.",
              masterTip: "Chiedi: qual è stato il compito più difficile da fare 'nello stesso momento'?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il mulino torna a girare, ma con un leggero scricchiolio che prima non c'era. Il coniglio-tempesta è sparito, però il vento dell'isola resta un po' irregolare. Raccogliete comunque un lembo di nuvola cucito, meno morbido del previsto.",
              masterTip: "Chiedi: la prossima volta, chi darebbe il segnale del «via!»?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Mulino delle Nuvole",
          final_read: "Il mulino macina piano e il coniglio-tempesta è solo una nuvoletta. La Vela di Nuvola ondeggia leggera tra le mani della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ IL MULINO RIPARTE, UN PO' STORTO",
          fail_subtitle: "Il Mulino delle Nuvole — un finale diverso",
          fail_final_read: "Il mulino gira di nuovo, ma con uno scricchiolio che prima non c'era. La vela che raccogliete è meno morbida del previsto, ma funziona."
        }
      }
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
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "custode-dei-venti" },
        { type: "power", id: "uovo-brezza" }
      ],
      growth: "Chi rinuncia a un premio pur di proteggere il nido segna 1 crescita Fortuna.",
      fail: "Un uovo rotola fino alla costa e si trasforma in un venticello birichino che tornerà a disturbare.",
      escape: "Farsi trasportare dai venti appena nati usando mantelli come paracadute: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Sull'orlo della scogliera ci sono tre uova di vetro trasparente. Dentro ognuna si vede muoversi un piccolo vento vivo. Il bordo è in pendenza e le uova hanno già cominciato a dondolare. E da lontano stanno arrivando i bracconieri di venti.",
              ask: "Cosa facciamo per primo: fermare le uova che scivolano, o pensare a dove nasconderle?",
              askOptions: [
                { id: "fretta-rottura", label: "⏱️ Se rotolano giù si rompono: fretta!", reply: "«Non c'è tempo da perdere, dobbiamo fermarle subito» decidete, guardando le uova dondolare." },
                { id: "bracconieri-lontani", label: "👀 I bracconieri non sono ancora qui", reply: "«Abbiamo ancora un attimo, ma non tanto» osservate le vele scure in lontananza." },
                { id: "due-gruppi", label: "👥 Un gruppo blocca, un gruppo prepara un riparo", reply: "«Dividiamoci: chi ferma le uova, chi costruisce un riparo» organizzate in fretta." }
              ],
              masterTip: "Trattieni il respiro guardando 'l'uovo' immaginario dondolare: la tensione passa ai bambini."
            },
            interaction: "Nessun tiro: si decide la priorità.",
            outcome: {
              title: "Le uova dondolano",
              text: "Il vento fa oscillare le tre uova avanti e indietro sul bordo. E all'orizzonte le vele scure dei bracconieri si fanno più grandi.",
              audio: "minaccia",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Ogni uovo soffia in una direzione diversa: uno tira verso il mare, uno verso l'alto, uno gira in tondo. Tenerle ferme non è semplice.",
              ask: "Le blocchiamo di forza con le mani e col corpo, o costruiamo al volo una trappola morbida che le raccolga?"
            },
            choices: [
              {
                id: "fermare",
                label: "🙌 Le fermiamo subito con mani e corpo",
                reaction_title: "La ciurma fa da scudo",
                reaction: "Vi buttate sulle uova facendo da parete col corpo. Il vento dentro spinge e voi resistete.",
                next: "fermare"
              },
              {
                id: "trappola",
                label: "🕸 Costruiamo una trappola morbida",
                reaction_title: "La ciurma tende una rete d'alghe",
                reaction: "Intrecciate mantelli e alghe in una conca soffice sotto il bordo: se un uovo cade, ci finisce dentro senza rompersi.",
                next: "trappola"
              }
            ]
          },
          {
            scene_id: "fermare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Tenere ferme tre uova che soffiano in tre direzioni diverse è come tenere tre palloni sott'acqua. E il bordo è scivoloso.",
              ask: "Come vi coordinate per non lasciarne scappare nemmeno una?",
              askOptions: [
                { id: "coppia-uovo", label: "👫 Una coppia per uovo, schiena contro schiena", reply: "Vi dividete in coppie, ognuna piantata saldamente davanti al proprio uovo." },
                { id: "rinforzo", label: "🆘 Chi resta libero fa da rinforzo", reply: "Un pirata resta pronto a correre dove serve più forza, occhi su tutte e tre le uova." },
                { id: "contare-stringere", label: "🔢 Contiamo insieme e stringiamo tutti a tempo", reply: "«Uno, due, tre... stringi!» — contate ad alta voce per agire tutti insieme." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ TENUTE TUTTE E TRE",
                text: "Vi puntate i piedi e resistete. Le uova si calmano tra le vostre braccia, al sicuro dai bracconieri.",
                audio: "win-event",
                next: "nido"
              },
              fail_forward: {
                title: "🌬 UNO SCAPPA",
                text: "Un uovo vi sfugge e rotola fino alla costa: si rompe in un venticello birichino, Pericolo +1. Gli altri due li tenete stretti, e il venticello — dispettoso ma innocuo — vi gira intorno.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "nido"
              }
            }
          },
          {
            scene_id: "trappola",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La rete d'alghe e mantelli va tesa bene: troppo lenta e l'uovo rimbalza fuori, troppo tesa e non attutisce.",
              ask: "Come costruite la conca morbida perché regga un uovo che cade soffiando?",
              askOptions: [
                { id: "doppio-strato", label: "🧣 Doppio strato: mantelli sopra, alghe sotto", reply: "Stendete prima le alghe morbide, poi i mantelli sopra, per un cuscino a doppio strato." },
                { id: "quattro-rocce", label: "🪨 La leghiamo a quattro rocce, una per angolo", reply: "Fissate ogni angolo della rete a una roccia solida, tirando bene le corde." },
                { id: "prova-frutto", label: "🍈 La proviamo con un frutto pesante", reply: "Lanciate un frutto grosso nella rete per testarne la tenuta prima che arrivi un uovo vero." }
              ]
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino prova la vostra trappola",
                button: "Affidiamoci al Destino",
                group_result: "La rete è pensata alla perfezione: raccoglie le uova morbida come una mano.",
                dice_result: "Un angolo è legato male: serve una prova di Astuzia per stringerlo in tempo."
              },
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ RETE PERFETTA",
                text: "Le uova che dondolano finiscono una dopo l'altra nella conca morbida. Rimbalzano piano e si fermano, intatte.",
                audio: "win-event",
                next: "nido"
              },
              fail_forward: {
                title: "🪺 UN ANGOLO CEDE",
                text: "Un angolo si slega e un uovo scappa verso la costa: si rompe in un venticello birichino, Pericolo +1. Riparate la rete e salvate gli altri due.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "nido"
              }
            }
          },
          {
            scene_id: "nido",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le uova sono al sicuro, ma la scogliera non è un posto per loro. Il vento più piccolo, quello curioso, sbuca fuori e vi guarda: aspetta che decidiate dove costruire il nuovo nido.",
              ask: "Progettate un nido che non voli via: che forma ha, di che materiale è, e dove lo mettete?",
              askOptions: [
                { id: "basso-pesante", label: "⬇️ Basso e pesante alla base", reply: "«Se sta basso, il vento non riesce a sollevarlo» spiegate, ammucchiando pietre alla base." },
                { id: "materiale-flessibile", label: "🌿 Materiale che si piega invece di rompersi", reply: "Intrecciate rami sottili ed elastici, che ondeggiano senza spezzarsi." },
                { id: "posto-riparato", label: "🕳️ Un posto riparato, come l'incavo di una roccia", reply: "Scegliete un anfratto nascosto, protetto dal vento su tre lati." }
              ],
              masterTip: "Fatti dire forma, materiale e posto da tre bambini, poi chiedi di 'difendere' la scelta."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "astuzia", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ UN NIDO CHE RESTA",
                text: "Costruite il nido nell'incavo della roccia, basso e intrecciato di rami elastici. I venticelli ci si sistemano dentro e i bracconieri, trovando solo pietre, se ne vanno delusi.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🌪 TROPPO LEGGERO",
                text: "Il primo nido è troppo arioso e il vento lo scompiglia: Pericolo +1. Lo sistemate alla bell'e meglio — regge, ma non è proprio quello che avevate in mente.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "I tre piccoli venti girano contenti nel loro nuovo nido riparato. Il più curioso vi si posa in mano un momento, poi vi lascia un uovo di vetro vuoto: soffiaci dentro e ne uscirà una brezza amica quando ti serve.",
              masterTip: "Chiedi: qualcuno ha rinunciato a qualcosa per proteggere il nido?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "I tre piccoli venti si sistemano nel nido, un po' spettinati anche loro. Non è perfetto — una raffica forte potrebbe ancora scompigliarlo — ma per ora regge. Il più curioso vi lascia comunque un uovo di vetro vuoto, un po' incrinato.",
              masterTip: "Chiedi: la prossima volta, come renderebbero il nido più solido?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Nido del Vento",
          final_read: "I piccoli venti girano felici nel nido riparato. L'Uovo di Brezza aspetta un soffio nella sacca della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ UN NIDO CHE REGGE A MALAPENA",
          fail_subtitle: "Il Nido del Vento — un finale diverso",
          fail_final_read: "Il nido regge, ma è meno solido del previsto. Il vento piccolo vi lascia comunque un uovo di vetro, un po' incrinato."
        }
      }
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
        { type: "coins", amount: 350000 },
        { type: "trophy", id: "amico-della-banca" },
        { type: "power", id: "chiave-maree" }
      ],
      growth: "Chi propone uno scambio generoso, che dà più di quanto chiede, segna 1 crescita Astuzia.",
      fail: "Il granchio presta la chiave, ma in cambio vorrà un favore nel ciclo successivo.",
      escape: "Pagare un passaggio sul traghetto-granchio con una storia mai raccontata prima.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Sulla spiaggia un granchio grande come una barca conta monete, con un paio di occhialini minuscoli sul naso. «Ogni tesoro di quest'isola appartiene alla Banca delle Maree. E la banca sono io. Se volete la chiave del caveau, dobbiamo trattare.»",
              ask: "Cosa possiamo offrire a un granchio che ha già tutte le monete del mondo?",
              askOptions: [
                { id: "non-si-compra", label: "📖 Qualcosa che non si compra: una storia", reply: "«Una storia vera, mai raccontata prima» proponete, e il granchio alza un sopracciglio... se ce l'ha." },
                { id: "oggetto-buffo", label: "🎈 Un oggetto buffo che lui non ha", reply: "«Deve avere qualcosa che manca alla sua collezione» pensate, frugando nelle tasche." },
                { id: "aiuto-banca", label: "🏦 Un aiuto per la banca, non solo per noi", reply: "«E se gli dessimo qualcosa che aumenta il valore della banca?» propone qualcuno, pensieroso." }
              ],
              masterTip: "Parla lento e impettito come un banchiere che si annoia di tutto."
            },
            interaction: "Nessun tiro: si pensa allo scambio.",
            outcome: {
              title: "Il granchio abbassa gli occhialini",
              text: "Vi guarda sopra le lenti, incuriosito. «Avanti. Ma niente monete: quelle le ho già.»",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Il granchio colleziona storie e oggetti strani. Ma nel suo mucchio di monete, notate, ce n'è una che luccica in modo sbagliato: forse è falsa. Se se ne accorge durante la trattativa, l'accordo salta.",
              ask: "Puntiamo tutto su una trattativa creativa, o prima gli facciamo un favore trovando la moneta falsa nel mucchio?"
            },
            choices: [
              {
                id: "negozia",
                label: "🤝 Proponiamo uno scambio creativo",
                reaction_title: "La ciurma apre la trattativa",
                reaction: "Vi mettete in cerchio a decidere l'offerta: qualcosa che sia utile alla banca e alla ciurma insieme, senza usare monete.",
                next: "negozia"
              },
              {
                id: "moneta",
                label: "🔍 Cerchiamo la moneta falsa nel mucchio",
                reaction_title: "La ciurma frruga tra le monete",
                reaction: "Vi tuffate nel mucchio di monete cercando quella che suona, pesa o luccica diversa dalle altre.",
                next: "moneta"
              }
            ]
          },
          {
            scene_id: "negozia",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il granchio ascolta ogni proposta e risponde sempre con una controproposta. Vuole un affare vero, non un regalo.",
              ask: "Proponete uno scambio che non usi monete e che convenga sia alla banca sia alla ciurma.",
              askOptions: [
                { id: "servizio-storie", label: "📚 Una storia nuova ogni volta che passiamo", reply: "«Vi porteremo sempre una storia fresca» promettete. Il granchio si aggiusta gli occhialini, interessato." },
                { id: "oggetto-raro", label: "💎 Un oggetto raro in prestito per la chiave", reply: "Mostrate il vostro oggetto più bizzarro. Il granchio lo esamina con occhio esperto." },
                { id: "insegnare-gioco", label: "🎲 Gli insegniamo un gioco nuovo", reply: "«Un banchiere annoiato ha bisogno di svago» dite, e cominciate a spiegargli le regole." }
              ],
              masterTip: "Fai controproposte finché l'offerta dei bambini non è generosa davvero (dà più di quanto chiede)."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ AFFARE FATTO",
                text: "Il granchio timbra un contrattino con la chela e vi consegna la chiave del caveau, lucidata a nuovo. «Piacere fare affari con voi.»",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "📄 CLAUSOLA NASCOSTA",
                text: "Il granchio non si convince fino in fondo e stringe la chela solo a metà: Pericolo +1. Vi presta la chiave, ma con una clausola scomoda in fondo al contratto — gli dovrete un favore, prima o poi.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "moneta",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il mucchio di monete è enorme e tutte sembrano uguali. La falsa, dice il granchio, «fa il solletico quando la tocchi». Ma con migliaia di monete, trovarla è come cercare un granello.",
              ask: "Come cercate la moneta falsa senza doverle toccare tutte a una a una?",
              askOptions: [
                { id: "dividere-squadre", label: "👥 Dividiamo il mucchio in squadre", reply: "Vi dividete il mucchio in settori, ognuno con il proprio angolo da controllare." },
                { id: "ascoltare-suono", label: "👂 Ascoltiamo: la falsa suona più sorda", reply: "Battete piano ogni monetina vicino all'orecchio, cercando quella con il suono diverso." },
                { id: "guardare-bordi", label: "👁️ Guardiamo i bordi, tagliati peggio", reply: "Esaminate i bordi delle monete uno per uno, cercando una lavorazione imperfetta." }
              ]
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ ECCOLA!",
                text: "Uno di voi la tocca e ride: fa il solletico. Il granchio è così contento di essersi liberato del 'granello marcio' che vi regala la chiave del caveau su due chele.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "🪙 MONETA SBAGLIATA",
                text: "Ne pescate una che sembrava falsa ma è vera: il granchio si insospettisce, Pericolo +1. Alla fine vi presta la chiave lo stesso, ma con aria poco convinta, tenendo d'occhio ogni vostra mossa.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il caveau si apre con un CLICK gigante. Dentro, tra i tesori della Banca delle Maree, c'è il vostro: una chiave-maree, che apre una porta chiusa dalle onde una volta per avventura. Il granchio vi saluta agitando gli occhialini.",
              masterTip: "Chiedi: la vostra offerta dava davvero più di quanto chiedeva?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il caveau si apre, ma con un click più stridulo del solito. Il granchio vi porge la chiave-maree con la chela, gli occhialini storti, non del tutto convinto dell'affare. «Va bene così... per questa volta.»",
              masterTip: "Chiedi: la prossima volta, che offerta farebbero al granchio?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Granchio Banchiere",
          final_read: "Il caveau si richiude e il granchio torna a contare, di buon umore. La Chiave delle Maree pende dalla cintura della ciurma.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ UN AFFARE UN PO' TIRATO",
          fail_subtitle: "Il Granchio Banchiere — un finale diverso",
          fail_final_read: "Il granchio vi consegna la chiave, non del tutto convinto. «Affare fatto... quasi» borbotta, sistemandosi gli occhialini."
        }
      }
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
        { type: "coins", amount: 400000 },
        { type: "fame", amount: 2 },
        { type: "trophy", id: "stella-della-ciurma" },
        { type: "power", id: "stella-ciurma" }
      ],
      growth: "Tutta la ciurma segna 1 crescita nella caratteristica che ha usato meglio durante il ciclo.",
      fail: "Il forziere conserva il desiderio: servirà completare una quest ricorrente nel ciclo seguente.",
      escape: "La Stella della Ciurma apre un portale luminoso che riporta tutti al Porto centrale.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Il forziere scatta e si apre senza che nessuno lo tocchi. Dentro non c'è nessun tesoro d'oro. Galleggiano nell'aria sedici piccole stelle luminose, e ogni stella mostra il desiderio di un pirata della ciurma.",
              ask: "Cosa desidera il vostro pirata, davvero? Ognuno dice la sua stella.",
              askOptions: [
                { id: "piccolo-vero", label: "🏠 Un desiderio piccolo e vero", reply: "«Vorrei rivedere mia sorella» sussurra un pirata. La sua stella si accende piano." },
                { id: "un-momento", label: "✨ Non un tesoro, ma un momento", reply: "«Vorrei che questo momento non finisse mai» dice qualcuno, guardando la ciurma intorno." },
                { id: "buffo", label: "😄 Anche un desiderio buffo va bene", reply: "«Vorrei un pappagallo che canta solo canzoni vere» ride un pirata, e la sua stella ride con lui." }
              ],
              masterTip: "Fai dire a ogni bambino il desiderio del proprio pirata, senza fretta: è il cuore del finale."
            },
            interaction: "Nessun tiro: è il momento in cui ognuno parla.",
            outcome: {
              title: "Le stelle si mettono in cerchio",
              text: "Man mano che i desideri vengono detti, le sedici stelle si dispongono in un cerchio lento sopra le vostre teste. Aspettano.",
              audio: "star",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Il forziere sussurra: «Un solo desiderio si avvera stanotte. Ma nessuno deve restare indietro.» Le stelle si accendono più forte quando due desideri si somigliano.",
              ask: "Uniamo i desideri con la testa, cercando quello che li contiene tutti, o ci affidiamo alla stella che brilla di più?"
            },
            choices: [
              {
                id: "unire",
                label: "🧩 Uniamo i desideri in uno solo",
                reaction_title: "La ciurma cerca il desiderio comune",
                reaction: "Vi sedete in cerchio sotto le stelle e cominciate ad ascoltarvi: dove si toccano i vostri desideri?",
                next: "unire"
              },
              {
                id: "stella",
                label: "🌟 Ci affidiamo alla stella più generosa",
                reaction_title: "La ciurma lascia scegliere il cielo",
                reaction: "Alzate le mani verso il cerchio di stelle e chiedete: quale desiderio, se si avvera, aiuta di più tutti gli altri?",
                next: "stella"
              }
            ]
          },
          {
            scene_id: "unire",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Sedici desideri sono tanti. Ma se li ascoltate bene, alcuni sono lo stesso desiderio detto in modi diversi, e altri si aiutano a vicenda.",
              ask: "Unite tre desideri diversi in un solo obiettivo che tenga dentro un pezzo del sogno di tutti.",
              askOptions: [
                { id: "parola-comune", label: "🔤 Cerchiamo la parola che torna più spesso", reply: "«Insieme» ricorre in quasi tutti i desideri, notate. Forse è da lì che si parte." },
                { id: "grande-piccoli", label: "🌟 Un desiderio grande fa spazio a due piccoli", reply: "Scegliete il desiderio più ampio e ci infilate dentro, con cura, gli altri due." },
                { id: "frase-sola", label: "✍️ Lo scriviamo come una frase sola", reply: "«Vogliamo...» cominciate, e la frase si completa pezzo dopo pezzo, voce dopo voce." }
              ],
              masterTip: "Fatti dire da tre bambini i loro desideri e aiutali a trovare il filo comune."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 70, dice: 30 },
              destiny_screen: {
                title: "✦ Il Destino guarda il vostro desiderio comune",
                button: "Affidiamoci al Destino",
                group_result: "Il desiderio unito contiene un pezzo del cuore di tutti: le stelle si fondono in una sola, enorme e calda.",
                dice_result: "Un desiderio resta fuori dal cerchio: serve una prova di Astuzia per farcelo entrare."
              },
              dice: { stat: "astuzia", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ UN SOLO DESIDERIO, DI TUTTI",
                text: "Le sedici stelle si stringono in una sola luce grande. Nessuno è rimasto indietro: il desiderio comune brilla per tutta la ciurma.",
                audio: "win-event",
                next: "promessa"
              },
              fail_forward: {
                title: "🌠 UNA STELLA RESTA FUORI",
                text: "Un desiderio non trova posto e la sua stella resta in disparte: il forziere lo conserva per il prossimo ciclo, Pericolo +1. Le altre quindici però si uniscono in una luce piena.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "promessa"
              }
            }
          },
          {
            scene_id: "stella",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le stelle roteano più in fretta. Una di loro, poco per volta, brilla più delle altre: è il desiderio più generoso, quello che regala qualcosa a tutti.",
              ask: "Quale desiderio si sta accendendo? E siete d'accordo a lasciarlo avverare al posto del vostro?",
              askOptions: [
                { id: "per-la-ciurma", label: "💛 Quello che comincia con «per la ciurma...»", reply: "Una stella brilla più forte proprio mentre qualcuno dice «vorrei qualcosa per tutti noi»." },
                { id: "regalo", label: "🎁 Lasciamo avverare quello di un altro, come regalo", reply: "«Va bene, lasciamo che si avveri il suo» dice qualcuno, sorridendo a un compagno." },
                { id: "occhi-chiusi", label: "😌 Chiudiamo gli occhi e sentiamo quale scalda di più", reply: "Tutti chiudono gli occhi, le mani alzate verso il cielo di stelle, in attesa." }
              ]
            },
            resolution: {
              policy: "dice",
              dice: { stat: "fortuna", target: 7 }
            },
            outcomes: {
              success: {
                title: "✨ LA STELLA PIÙ GENEROSA",
                text: "La stella scelta esplode piano in una pioggia di scintille che tocca ogni pirata. Il desiderio più generoso si avvera, e con lui un pezzetto di quello di tutti.",
                audio: "win-event",
                next: "promessa"
              },
              fail_forward: {
                title: "🌌 IL CIELO ESITA",
                text: "Due stelle brillano uguali e il cielo non sa scegliere: il forziere trattiene un desiderio per il prossimo ciclo, Pericolo +1. Poi una delle due si accende decisa e la sua luce vi raggiunge tutti.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "promessa"
              }
            }
          },
          {
            scene_id: "promessa",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La luce si posa dentro il forziere e lì resta, viva. Il forziere fa un'ultima domanda: «Quale promessa fa questa ciurma per il ciclo che comincia?»",
              ask: "Unite tre desideri diversi in una sola promessa che aiuti tutta la ciurma nel prossimo ciclo.",
              askOptions: [
                { id: "breve", label: "✂️ Una promessa breve, facile da ricordare", reply: "«Restare uniti, sempre» decidete: poche parole, ma vere." },
                { id: "per-tutti", label: "👥 Una promessa che valga per tutti", reply: "«Nessuno di noi resta mai indietro» dite insieme, guardandovi negli occhi." },
                { id: "prometteremo", label: "🤝 Cominciamo con «Prometteremo di...»", reply: "«Prometteremo di ascoltarci, anche nei giorni difficili» — la frase prende forma piano piano." }
              ],
              masterTip: "Lascia che la promessa esca dalle parole dei bambini, non dalle tue."
            },
            resolution: {
              policy: "dice",
              critical: true,
              dice: { stat: "coraggio", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ LA PROMESSA È FATTA",
                text: "Pronunciate la promessa tutti insieme e il forziere la incide sul coperchio in lettere di luce. Da domani, quella frase viaggia con voi.",
                audio: "win-event",
                next: "finale"
              },
              fail_forward: {
                title: "📜 PROMESSA DA LIMARE",
                text: "La prima promessa è troppo lunga e nessuno la ricorda bene: Pericolo +1. Il forziere la incide comunque, ma le lettere restano un po' sbiadite, come se aspettasse una versione migliore.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "finale-dubbio"
              }
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il forziere si richiude piano. Sul coperchio, la vostra promessa brilla ancora. Dentro il legno resta una piccola luce: la Stella della Ciurma, che d'ora in poi vi accompagna. Il primo ciclo è finito. Siete cresciuti insieme.",
              masterTip: "Chiedi a ognuno: qual è stato il tuo momento più bello di tutto il ciclo?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi il ciclo"
            }
          },
          {
            scene_id: "finale-dubbio",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il forziere si richiude piano. Sul coperchio, la vostra promessa brilla, ma più debole del previsto — come se aspettasse ancora di essere detta per bene. Dentro il legno resta comunque una piccola luce: la Stella della Ciurma, un po' più fioca, ma vostra. Il primo ciclo è finito. Siete cresciuti insieme, anche così.",
              masterTip: "Chiedi a ognuno: qual è stato il tuo momento più bello di tutto il ciclo?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi comunque il ciclo"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ CICLO COMPLETATO!",
          subtitle: "Il Forziere dei Desideri",
          final_read: "La promessa della ciurma brilla sul coperchio del forziere. La Stella della Ciurma vi accompagna nel ciclo che comincia.",
          close_button: "⛵ Torna alla rotta",
          fail_headline: "⚓ UNA PROMESSA ANCORA DA LIMARE",
          fail_subtitle: "Il Forziere dei Desideri — un finale diverso",
          fail_final_read: "La promessa brilla più debole del previsto, ma la Stella della Ciurma resta comunque vostra. Ci sarà tempo per dirla meglio."
        }
      }
    }

  ]
});
