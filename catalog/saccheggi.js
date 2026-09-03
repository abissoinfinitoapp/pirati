/* =============================================================================
   CATALOGO SACCHEGGI - dodici coppie di navi all'orizzonte
   ========================================================================== */

PIRATI.registerRaidPairs([
  {
    id: "dolce-freddo",
    ships: [
      { id: "nave-gelato", name: "La Gelatiera del Mare", sighting: "A prua spunta una nuvola bianca: sembra panna, ma forse è una vela gelata.", stat: "coraggio", target: 5, rewards: [{ type: "coins", amount: 3 }], success: "Con un arrembaggio fresco fresco, riempite il baule di monete brillanti.", fail: "Una pallina di gelato rimbalza sul timone e vi fa fare un girotondo in mare.", missed: "La nave svanisce lasciandovi il rimpianto di 3 monete al gusto di vaniglia." },
      { id: "nave-zucchero-filato", name: "La Nuvola Zuccherina", sighting: "Dall'albero maestro pende una massa rosa: pare una nuvola, forse una parrucca gigante.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 4 }], success: "Sciogliete l'enigma appiccicoso e trovate monete nascoste tra i fili rosa.", fail: "Le corde vi incollano i cappelli uno all'altro: per un minuto siete una piramide pirata.", missed: "La nave soffice si allontana con le sue 4 monete zuccherose." }
    ]
  },
  {
    id: "salti-morbidi",
    ships: [
      { id: "galeone-cuscini", name: "Il Galeone Pisolone", sighting: "Le vele sembrano gonfie e morbide; forse nascondono un enorme sbadiglio.", stat: "fortuna", target: 6, rewards: [{ type: "loot", id: "cuscino-capitano" }], success: "Atterrate senza rumore e conquistate il Cuscino del Capitano.", fail: "Un cuscino vi lancia una piuma nel naso: l'arrembaggio finisce in una gara di starnuti.", missed: "Il Galeone Pisolone porta via il Cuscino del Capitano." },
      { id: "brigantino-trampolini", name: "Il Brigantino Balzellante", sighting: "Il ponte sobbalza da solo: sembra che sotto ci sia un branco di rane educate.", stat: "coraggio", target: 7, rewards: [{ type: "coins", amount: 5 }], success: "Saltate tutti insieme e atterrate proprio sul baule da 5 monete.", fail: "Rimbalzate così in alto da salutare un gabbiano, che vi risponde con un inchino.", missed: "Il brigantino salta oltre l'orizzonte con 5 monete nel baule." }
    ]
  },
  {
    id: "merenda-mare",
    ships: [
      { id: "nave-patatine", name: "La Croccantina", sighting: "Dal ponte arriva un cric-croc: potrebbe essere una battaglia, oppure una merenda segreta.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 2 }], success: "Seguendo il ritmo croccante trovate 2 monete dentro una scatola di patatine.", fail: "Una patatina volante si posa sulla vostra benda e vi elegge Capitani del Crunch.", missed: "La Croccantina scappa con 2 monete croccanti." },
      { id: "veliero-cioccolata-calda", name: "Il Veliero Fumante", sighting: "Un vapore profumato esce dalla cabina: forse è nebbia, forse una tazza gigante.", stat: "fortuna", target: 5, rewards: [{ type: "coins", amount: 4 }], success: "Remate tra i vapori e pescate 4 monete da una tazza enorme.", fail: "Il cacao fa appannare il cannocchiale: vedete tre lune e una ciambella marina.", missed: "Il Veliero Fumante si tiene le sue 4 monete calde." }
    ]
  },
  {
    id: "giocattoli-scomposti",
    ships: [
      { id: "caravella-dinosauri", name: "La Caravella Ruggente", sighting: "Sopra la cabina spunta una coda verde: pare un dinosauro, o forse una scopa molto ambiziosa.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 3 }], success: "Convincete il dinosauro di gomma a fare da vedetta e trovate 3 monete.", fail: "Il dinosauro starnutisce coriandoli e vi lascia le sopracciglia tutte colorate.", missed: "La Caravella Ruggente parte con 3 monete tra le zampe." },
      { id: "nave-robot-svitati", name: "La Meccanica Svitata", sighting: "Dal ponte arrivano tin-tin e bozzi: forse sono robot, forse pentole che discutono.", stat: "astuzia", target: 6, rewards: [{ type: "fame", amount: 1 }], success: "Rimettete una vite al posto giusto e guadagnate 1 Fama da inventori pirata.", fail: "Un robot vi scambia per una lampada e prova ad accendervi con un cucchiaino.", missed: "La Meccanica Svitata naviga via con il vostro 1 punto Fama." }
    ]
  },
  {
    id: "festa-impossibile",
    ships: [
      { id: "vascello-bolle", name: "Il Vascello Frizzante", sighting: "Una fila di bolle viola galleggia sopra le vele: sembra un messaggio, ma non si legge.", stat: "fortuna", target: 6, rewards: [{ type: "coins", amount: 4 }], success: "Seguite le bolle fino a un baule con 4 monete frizzanti.", fail: "Una bolla gigante vi mette tutti nello stesso cappello per un buffissimo secondo.", missed: "Il Vascello Frizzante scivola via con 4 monete nelle bolle." },
      { id: "galeone-fuochi-silenziosi", name: "Il Galeone Muto", sighting: "Luci colorate esplodono senza un suono: forse festeggiano, forse stanno facendo le smorfie.", stat: "coraggio", target: 7, rewards: [{ type: "coins", amount: 5 }], success: "Entrate nel silenzio scintillante e recuperate 5 monete luccicanti.", fail: "Un fuoco d'artificio silenzioso disegna un baffo luminoso sopra ogni cappello.", missed: "Il Galeone Muto spegne le luci e porta via 5 monete." }
    ]
  },
  {
    id: "piedi-in-fuga",
    ships: [
      { id: "nave-calzini-spaiati", name: "La Spaiatissima", sighting: "Alle sartie sventolano calzini uno diverso dall'altro: forse stanno cercando i propri piedi.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 2 }], success: "Abbinate i calzini giusti e il capitano vi consegna 2 monete di gratitudine.", fail: "Un calzino vi salta in testa e vi nomina Ammiragli del Bucato.", missed: "La Spaiatissima fugge con 2 monete dentro un calzino a righe." },
      { id: "veliero-scarpe-saltellanti", name: "Il Veliero Saltellone", sighting: "Due scarpe corrono sul ponte senza pirata: sembrano in ritardo per una festa segreta.", stat: "fortuna", target: 6, rewards: [{ type: "loot", id: "scarpe-saltellanti-loot" }], success: "Inseguite il passo giusto e conquistate le Scarpe Saltellanti.", fail: "Le scarpe vi fanno danzare una polka sul parapetto, applaudita da un granchio.", missed: "Il Veliero Saltellone sparisce con le Scarpe Saltellanti." }
    ]
  },
  {
    id: "dolci-giganti",
    ships: [
      { id: "galeone-torte", name: "Il Galeone a Strati", sighting: "Una torre di panna ondeggia sul ponte: forse è una vela, forse una torta troppo coraggiosa.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 5 }], success: "Scalate gli strati senza assaggiarli tutti e trovate 5 monete.", fail: "Una ciliegia rotola al timone e il capitano urla: «Attenti al frutto comandante!».", missed: "Il Galeone a Strati salpa con 5 monete sotto la panna." },
      { id: "nave-caramelle-mutacolore", name: "La Cambiacolore", sighting: "Le assi cambiano tinta a ogni onda: pare magia, oppure pennelli nascosti sottocoperta.", stat: "astuzia", target: 5, rewards: [{ type: "coins", amount: 3 }], success: "Indovinate il prossimo colore e il baule vi regala 3 monete.", fail: "Le caramelle tingono i vostri stivali di sette colori, uno per ogni dito del piede.", missed: "La Cambiacolore porta via 3 monete color arcobaleno." }
    ]
  },
  {
    id: "ciurme-tenere",
    ships: [
      { id: "nave-pappagalli-cantanti", name: "La Corale Alata", sighting: "Un coro di pappagalli canta una nota lunghissima: forse è un saluto, forse un indovinello.", stat: "fortuna", target: 6, rewards: [{ type: "fame", amount: 1 }], success: "Azzeccate la nota finale e la Corale Alata vi regala 1 Fama musicale.", fail: "I pappagalli imitano le vostre voci così bene che nessuno sa più chi ha dato l'ordine.", missed: "La Corale Alata vola via con il vostro 1 punto Fama." },
      { id: "caravella-cuccioli-pirata", name: "La Caravella Bau Bau", sighting: "Piccole impronte bagnate attraversano il ponte: sembrano di cuccioli con stivali troppo grandi.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 4 }], success: "Aiutate i cuccioli a ritrovare la ciotola e ricevete 4 monete scodinzolanti.", fail: "Un cucciolo nasconde il vostro cappello e lo riporta fiero con un pesce di gomma.", missed: "La Caravella Bau Bau parte con 4 monete nella ciotola." }
    ]
  },
  {
    id: "storie-colorate",
    ships: [
      { id: "vascello-pennarelli-magici", name: "Il Vascello Disegnato", sighting: "Una freccia azzurra compare sull'acqua e poi fa la linguaccia: forse indica una rotta.", stat: "astuzia", target: 6, rewards: [{ type: "loot", id: "pennarello-magico" }], success: "Seguite il disegno ribelle e conquistate il Pennarello Magico.", fail: "Un pennarello vi disegna un monocolo baffuto che non vuole proprio cancellarsi.", missed: "Il Vascello Disegnato cancella la rotta e porta via il Pennarello Magico." },
      { id: "nave-libri-parlanti", name: "La Biblioteca Galleggiante", sighting: "Dalla stiva esce un «psst»: sembra un libro che vuole raccontare un segreto.", stat: "fortuna", target: 7, rewards: [{ type: "fame", amount: 1 }], success: "Rispondete alla domanda della copertina e guadagnate 1 Fama da narratori pirata.", fail: "Un libro vi legge una filastrocca al contrario finché persino il timone ride.", missed: "La Biblioteca Galleggiante chiude le pagine con il vostro 1 punto Fama." }
    ]
  },
  {
    id: "cielo-da-gioco",
    ships: [
      { id: "galeone-palloni-infiniti", name: "Il Galeone Gonfiabile", sighting: "Palloni colorati escono dalla stiva senza smettere: forse il mare sta facendo il compleanno.", stat: "coraggio", target: 6, rewards: [{ type: "coins", amount: 2 }], success: "Fate spazio tra i palloni e recuperate 2 monete che rimbalzavano sul ponte.", fail: "Un pallone vi solleva per il codino e vi riporta giù con un plop gentile.", missed: "Il Galeone Gonfiabile vola via con 2 monete legate ai palloni." },
      { id: "nave-aquiloni-cavalcabili", name: "La Nave degli Aquiloni", sighting: "Un aquilone enorme tira la prua verso le nuvole: sembra voler fare una passeggiata in cielo.", stat: "astuzia", target: 7, rewards: [{ type: "loot", id: "aquilone-cavalcabile" }], success: "Sciogliete il nodo del vento e conquistate l'Aquilone Cavalcabile.", fail: "L'aquilone vi trascina in un giro elegante attorno all'albero maestro.", missed: "La Nave degli Aquiloni prende il volo con l'Aquilone Cavalcabile." }
    ]
  },
  {
    id: "esperimenti-molli",
    ships: [
      { id: "nave-mostri-gelatina", name: "La Gelatinosa", sighting: "Una gobba tremolante fa ciao dal ponte: potrebbe essere un mostro, o un budino con cappello.", stat: "fortuna", target: 6, rewards: [{ type: "fame", amount: 1 }], success: "Riuscite a far ridere il mostro gelatina e guadagnate 1 Fama da domatori gentili.", fail: "La gelatina copia ogni vostra mossa con tre secondi di ritardo e vi prende in giro.", missed: "La Gelatinosa ondeggia via con il vostro 1 punto Fama." },
      { id: "vascello-pozioni-ruttanti", name: "Il Vascello Gorgogliante", sighting: "Boccette verdi fanno bolle in coperta: forse stanno preparando una zuppa per sirene.", stat: "coraggio", target: 5, rewards: [{ type: "loot", id: "pozione-rutto" }], success: "Superate la nuvola di bollicine e prendete la Pozione Ruttante.", fail: "Una pozione vi fa emettere un rutto a forma di nota musicale, sentito fin dall'isola vicina.", missed: "Il Vascello Gorgogliante si allontana con la Pozione Ruttante." }
    ]
  },
  {
    id: "guardaroba-regale",
    ships: [
      { id: "caravella-corone-assurde", name: "La Caravella Incoronata", sighting: "Sulle vele brillano corone con molle: forse cercano una testa abbastanza buffa.", stat: "astuzia", target: 6, rewards: [{ type: "coins", amount: 5 }], success: "Scegliete la corona meno starnutibile e il re vi paga 5 monete.", fail: "Una corona vi rimbalza sul naso e vi proclama Re dei Pesciolini Dispettosi.", missed: "La Caravella Incoronata scappa con 5 monete regali." },
      { id: "nave-mantelli-meta-invisibili", name: "La Mezza Sparita", sighting: "A poppa si vedono soltanto mezzi marinai: forse l'altra metà sta facendo il bucato invisibile.", stat: "fortuna", target: 6, rewards: [{ type: "loot", id: "mantello-meta-invisibile" }], success: "Trovate l'orlo visibile e conquistate il Mantello Invisibile a Metà.", fail: "Il mantello nasconde solo le vostre ginocchia, che iniziano a salutare per conto proprio.", missed: "La Mezza Sparita svanisce portando via il Mantello Invisibile a Metà." }
    ]
  }
]);
