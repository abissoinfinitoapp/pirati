/* =============================================================================
   CATALOGO SACCHEGGI - dodici coppie di navi all'orizzonte
   -----------------------------------------------------------------------------
   Il bottino di un galeone e' un CARICO VERO: barili, casse, quintali di merce.
   Le monete qui scritte sono il valore di quel carico al mercato di Porto,
   gia' per intero (niente "3 monete": un veliero pieno vale centinaia di
   migliaia). Difficolta' e valore vanno di pari passo:
     soglia 5 (facile)      ~  400.000 - 700.000
     soglia 6 (audace)      ~  800.000 - 1.400.000
     soglia 7 (leggendario) ~ 1.800.000 - 3.000.000
   Le navi con un oggetto-bottino o con la Fama danno comunque anche un carico
   di monete: nessun arrembaggio si chiude per una manciata di spiccioli.
   ========================================================================== */

PIRATI.registerRaidPairs([
  {
    id: "dolce-freddo",
    ships: [
      { id: "nave-gelato", name: "La Gelatiera del Mare", sighting: "A prua spunta una nuvola bianca: sembra panna, ma forse è una vela gelata.", stat: "coraggio", target: 5, rewards: [{ type: "coins", amount: 480000 }], success: "Svuotate la stiva: quattro quintali di gelato che non si scioglie mai. Al mercato di Porto valgono 480.000 monete.", fail: "Una pallina di gelato rimbalza sul timone e vi fa fare un girotondo in mare.", missed: "La Gelatiera fugge portandosi via un carico da 480.000 monete di gelato eterno." },
      { id: "nave-zucchero-filato", name: "La Nuvola Zuccherina", sighting: "Dall'albero maestro pende una massa rosa: pare una nuvola, forse una parrucca gigante.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 950000 }], success: "Sciogliete l'enigma appiccicoso e nella stiva trovate montagne di zucchero filato: 950.000 monete di dolcezza.", fail: "Le corde vi incollano i cappelli uno all'altro: per un minuto siete una piramide pirata.", missed: "La Nuvola Zuccherina si allontana con 950.000 monete di zucchero soffice." }
    ]
  },
  {
    id: "salti-morbidi",
    ships: [
      { id: "galeone-cuscini", name: "Il Galeone Pisolone", sighting: "Le vele sembrano gonfie e morbide; forse nascondono un enorme sbadiglio.", stat: "fortuna", target: 6, rewards: [{ type: "loot", id: "cuscino-capitano" }, { type: "coins", amount: 350000 }], success: "Atterrate senza rumore: conquistate il Cuscino del Capitano e una stiva di piume pregiate da 350.000 monete.", fail: "Un cuscino vi lancia una piuma nel naso: l'arrembaggio finisce in una gara di starnuti.", missed: "Il Galeone Pisolone porta via il Cuscino del Capitano e 350.000 monete di piume." },
      { id: "brigantino-trampolini", name: "Il Brigantino Balzellante", sighting: "Il ponte sobbalza da solo: sembra che sotto ci sia un branco di rane educate.", stat: "coraggio", target: 7, rewards: [{ type: "coins", amount: 2200000 }], success: "Saltate tutti insieme e atterrate nella stiva: casse di molle d'acciaio pregiato per 2.200.000 monete.", fail: "Rimbalzate così in alto da salutare un gabbiano, che vi risponde con un inchino.", missed: "Il Brigantino salta oltre l'orizzonte con un carico di molle da 2.200.000 monete." }
    ]
  },
  {
    id: "merenda-mare",
    ships: [
      { id: "nave-patatine", name: "La Croccantina", sighting: "Dal ponte arriva un cric-croc: potrebbe essere una battaglia, oppure una merenda segreta.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 850000 }], success: "Seguite il ritmo croccante fino alla stiva: mille sacchi di patatine sempre fragranti, 850.000 monete.", fail: "Una patatina volante si posa sulla vostra benda e vi elegge Capitani del Crunch.", missed: "La Croccantina scappa con 850.000 monete di patatine croccanti." },
      { id: "veliero-cioccolata-calda", name: "Il Veliero Fumante", sighting: "Un vapore profumato esce dalla cabina: forse è nebbia, forse una tazza gigante.", stat: "fortuna", target: 5, rewards: [{ type: "coins", amount: 600000 }], success: "Remate tra i vapori e svuotate la caldaia: duecento barili di cioccolata calda, 600.000 monete.", fail: "Il cacao fa appannare il cannocchiale: vedete tre lune e una ciambella marina.", missed: "Il Veliero Fumante si tiene i suoi barili di cioccolata da 600.000 monete." }
    ]
  },
  {
    id: "giocattoli-scomposti",
    ships: [
      { id: "caravella-dinosauri", name: "La Caravella Ruggente", sighting: "Sopra la cabina spunta una coda verde: pare un dinosauro, o forse una scopa molto ambiziosa.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 1000000 }], success: "Convincete il dinosauro di gomma a fare da vedetta e la stiva vi apre: un milione di monete in dinosauri giocattolo.", fail: "Il dinosauro starnutisce coriandoli e vi lascia le sopracciglia tutte colorate.", missed: "La Caravella Ruggente parte con un carico di dinosauri da 1.000.000 di monete." },
      { id: "nave-robot-svitati", name: "La Meccanica Svitata", sighting: "Dal ponte arrivano tin-tin e bozzi: forse sono robot, forse pentole che discutono.", stat: "astuzia", target: 6, rewards: [{ type: "fame", amount: 1 }, { type: "coins", amount: 880000 }], success: "Rimettete una vite al posto giusto: i robot vi acclamano (1 Fama) e vi regalano casse di ingranaggi d'ottone per 880.000 monete.", fail: "Un robot vi scambia per una lampada e prova ad accendervi con un cucchiaino.", missed: "La Meccanica Svitata naviga via con 1 Fama e 880.000 monete di ottone." }
    ]
  },
  {
    id: "festa-impossibile",
    ships: [
      { id: "vascello-bolle", name: "Il Vascello Frizzante", sighting: "Una fila di bolle viola galleggia sopra le vele: sembra un messaggio, ma non si legge.", stat: "fortuna", target: 6, rewards: [{ type: "coins", amount: 1100000 }], success: "Seguite le bolle fino alla cambusa: fiale di sapone iridescente per 1.100.000 monete.", fail: "Una bolla gigante vi mette tutti nello stesso cappello per un buffissimo secondo.", missed: "Il Vascello Frizzante scivola via con 1.100.000 monete di bolle." },
      { id: "galeone-fuochi-silenziosi", name: "Il Galeone Muto", sighting: "Luci colorate esplodono senza un suono: forse festeggiano, forse stanno facendo le smorfie.", stat: "coraggio", target: 7, rewards: [{ type: "coins", amount: 2500000 }], success: "Entrate nel silenzio scintillante e portate via l'intera santabarbara di fuochi muti: 2.500.000 monete.", fail: "Un fuoco d'artificio silenzioso disegna un baffo luminoso sopra ogni cappello.", missed: "Il Galeone Muto spegne le luci e sparisce con 2.500.000 monete di fuochi." }
    ]
  },
  {
    id: "piedi-in-fuga",
    ships: [
      { id: "nave-calzini-spaiati", name: "La Spaiatissima", sighting: "Alle sartie sventolano calzini uno diverso dall'altro: forse stanno cercando i propri piedi.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 800000 }], success: "Abbinate i calzini giusti e il capitano vi apre la stiva: balle di lana finissima per 800.000 monete.", fail: "Un calzino vi salta in testa e vi nomina Ammiragli del Bucato.", missed: "La Spaiatissima fugge con 800.000 monete di lana in calzini a righe." },
      { id: "veliero-scarpe-saltellanti", name: "Il Veliero Saltellone", sighting: "Due scarpe corrono sul ponte senza pirata: sembrano in ritardo per una festa segreta.", stat: "fortuna", target: 6, rewards: [{ type: "loot", id: "scarpe-saltellanti-loot" }, { type: "coins", amount: 420000 }], success: "Inseguite il passo giusto: conquistate le Scarpe Saltellanti e casse di scarpe a molla per 420.000 monete.", fail: "Le scarpe vi fanno danzare una polka sul parapetto, applaudita da un granchio.", missed: "Il Veliero Saltellone sparisce con le Scarpe Saltellanti e 420.000 monete." }
    ]
  },
  {
    id: "dolci-giganti",
    ships: [
      { id: "galeone-torte", name: "Il Galeone a Strati", sighting: "Una torre di panna ondeggia sul ponte: forse è una vela, forse una torta troppo coraggiosa.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 1300000 }], success: "Scalate gli strati senza assaggiarli tutti: la stiva è piena di torte giganti che non seccano mai, 1.300.000 monete.", fail: "Una ciliegia rotola al timone e il capitano urla: «Attenti al frutto comandante!».", missed: "Il Galeone a Strati salpa con 1.300.000 monete di torte giganti." },
      { id: "nave-caramelle-mutacolore", name: "La Cambiacolore", sighting: "Le assi cambiano tinta a ogni onda: pare magia, oppure pennelli nascosti sottocoperta.", stat: "astuzia", target: 5, rewards: [{ type: "coins", amount: 550000 }], success: "Indovinate il prossimo colore e la stiva si apre: barattoli di caramelle che cambiano tinta, 550.000 monete.", fail: "Le caramelle tingono i vostri stivali di sette colori, uno per ogni dito del piede.", missed: "La Cambiacolore porta via 550.000 monete di caramelle arcobaleno." }
    ]
  },
  {
    id: "ciurme-tenere",
    ships: [
      { id: "nave-pappagalli-cantanti", name: "La Corale Alata", sighting: "Un coro di pappagalli canta una nota lunghissima: forse è un saluto, forse un indovinello.", stat: "fortuna", target: 6, rewards: [{ type: "fame", amount: 1 }, { type: "coins", amount: 850000 }], success: "Azzeccate la nota finale: la Corale vi dedica una canzone (1 Fama) e vi lascia lo scrigno delle offerte, 850.000 monete.", fail: "I pappagalli imitano le vostre voci così bene che nessuno sa più chi ha dato l'ordine.", missed: "La Corale Alata vola via con 1 Fama e 850.000 monete nello scrigno." },
      { id: "caravella-cuccioli-pirata", name: "La Caravella Bau Bau", sighting: "Piccole impronte bagnate attraversano il ponte: sembrano di cuccioli con stivali troppo grandi.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 1050000 }], success: "Aiutate i cuccioli a ritrovare la ciotola e la loro ciurma vi ricompensa col forziere di bordo: 1.050.000 monete.", fail: "Un cucciolo nasconde il vostro cappello e lo riporta fiero con un pesce di gomma.", missed: "La Caravella Bau Bau parte con un forziere da 1.050.000 monete." }
    ]
  },
  {
    id: "storie-colorate",
    ships: [
      { id: "vascello-pennarelli-magici", name: "Il Vascello Disegnato", sighting: "Una freccia azzurra compare sull'acqua e poi fa la linguaccia: forse indica una rotta.", stat: "astuzia", target: 6, rewards: [{ type: "loot", id: "pennarello-magico" }, { type: "coins", amount: 450000 }], success: "Seguite il disegno ribelle: conquistate il Pennarello Magico e casse di colori che non finiscono mai, 450.000 monete.", fail: "Un pennarello vi disegna un monocolo baffuto che non vuole proprio cancellarsi.", missed: "Il Vascello Disegnato cancella la rotta e porta via il Pennarello Magico e 450.000 monete." },
      { id: "nave-libri-parlanti", name: "La Biblioteca Galleggiante", sighting: "Dalla stiva esce un «psst»: sembra un libro che vuole raccontare un segreto.", stat: "fortuna", target: 7, rewards: [{ type: "fame", amount: 1 }, { type: "coins", amount: 2000000 }], success: "Rispondete alla domanda della copertina: i libri vi nominano narratori (1 Fama) e vi affidano l'intera biblioteca rilegata in oro, 2.000.000 di monete.", fail: "Un libro vi legge una filastrocca al contrario finché persino il timone ride.", missed: "La Biblioteca Galleggiante chiude le pagine con 1 Fama e 2.000.000 di monete." }
    ]
  },
  {
    id: "cielo-da-gioco",
    ships: [
      { id: "galeone-palloni-infiniti", name: "Il Galeone Gonfiabile", sighting: "Palloni colorati escono dalla stiva senza smettere: forse il mare sta facendo il compleanno.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 900000 }], success: "Fate spazio tra i palloni e raggiungete il forziere: palloni che non si sgonfiano mai, 900.000 monete.", fail: "Un pallone vi solleva per il codino e vi riporta giù con un plop gentile.", missed: "Il Galeone Gonfiabile vola via con 900.000 monete di palloni infiniti." },
      { id: "nave-aquiloni-cavalcabili", name: "La Nave degli Aquiloni", sighting: "Un aquilone enorme tira la prua verso le nuvole: sembra voler fare una passeggiata in cielo.", stat: "astuzia", target: 7, rewards: [{ type: "loot", id: "aquilone-cavalcabile" }, { type: "coins", amount: 700000 }], success: "Sciogliete il nodo del vento: conquistate l'Aquilone Cavalcabile e la stiva di seta da cielo, 700.000 monete.", fail: "L'aquilone vi trascina in un giro elegante attorno all'albero maestro.", missed: "La Nave degli Aquiloni prende il volo con l'Aquilone Cavalcabile e 700.000 monete di seta." }
    ]
  },
  {
    id: "esperimenti-molli",
    ships: [
      { id: "nave-mostri-gelatina", name: "La Gelatinosa", sighting: "Una gobba tremolante fa ciao dal ponte: potrebbe essere un mostro, o un budino con cappello.", stat: "fortuna", target: 6, rewards: [{ type: "fame", amount: 1 }, { type: "coins", amount: 950000 }], success: "Fate ridere il mostro gelatina: vi nomina amici gentili (1 Fama) e vi apre la dispensa di gelatina profumata, 950.000 monete.", fail: "La gelatina copia ogni vostra mossa con tre secondi di ritardo e vi prende in giro.", missed: "La Gelatinosa ondeggia via con 1 Fama e 950.000 monete di gelatina." },
      { id: "vascello-pozioni-ruttanti", name: "Il Vascello Gorgogliante", sighting: "Boccette verdi fanno bolle in coperta: forse stanno preparando una zuppa per sirene.", stat: "coraggio", target: 5, rewards: [{ type: "loot", id: "pozione-rutto" }, { type: "coins", amount: 380000 }], success: "Superate la nuvola di bollicine: prendete la Pozione Ruttante e una cassa di boccette pregiate, 380.000 monete.", fail: "Una pozione vi fa emettere un rutto a forma di nota musicale, sentito fin dall'isola vicina.", missed: "Il Vascello Gorgogliante si allontana con la Pozione Ruttante e 380.000 monete." }
    ]
  },
  {
    id: "guardaroba-regale",
    ships: [
      { id: "caravella-corone-assurde", name: "La Caravella Incoronata", sighting: "Sulle vele brillano corone con molle: forse cercano una testa abbastanza buffa.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 1400000 }], success: "Scegliete la corona meno starnutibile e il re vi paga il baule reale: 1.400.000 monete in corone a molla.", fail: "Una corona vi rimbalza sul naso e vi proclama Re dei Pesciolini Dispettosi.", missed: "La Caravella Incoronata scappa con un baule reale da 1.400.000 monete." },
      { id: "nave-mantelli-meta-invisibili", name: "La Mezza Sparita", sighting: "A poppa si vedono soltanto mezzi marinai: forse l'altra metà sta facendo il bucato invisibile.", stat: "fortuna", target: 6, rewards: [{ type: "loot", id: "mantello-meta-invisibile" }, { type: "coins", amount: 480000 }], success: "Trovate l'orlo visibile: conquistate il Mantello Invisibile a Metà e rotoli di stoffa mezza-sparita per 480.000 monete.", fail: "Il mantello nasconde solo le vostre ginocchia, che iniziano a salutare per conto proprio.", missed: "La Mezza Sparita svanisce con il Mantello Invisibile a Metà e 480.000 monete di stoffa." }
    ]
  }
]);
