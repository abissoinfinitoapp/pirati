/* =============================================================================
   CATALOGO — La Nave Domandona
   -----------------------------------------------------------------------------
   Ogni domanda ha tre indizi, dal più vago al più chiaro: se la ciurma sbaglia,
   la STESSA domanda torna al prossimo incontro con l'indizio successivo.
   "risposta" è solo per il Master, che giudica a orecchio quello che dicono
   i bambini (non c'è una scelta multipla da cliccare).

   "level": "facile" (6-8 anni) o "avanzato" (9-10 anni) — il Master sceglie
   con lo stesso interruttore usato per il testo delle avventure.
   ========================================================================== */

PIRATI.registerDomandonaQuestions([

  /* --- FACILE — 6-8 anni ------------------------------------------------- */
  {
    id: "settimana-giorni",
    level: "facile",
    categoria: "logica",
    domanda: "Quanti giorni ha una settimana?",
    risposta: "7",
    indizi: [
      "È un numero più piccolo di dieci.",
      "Il primo giorno si chiama lunedì e l'ultimo domenica.",
      "È lo stesso numero dei nani di Biancaneve."
    ],
    rewards: [{ type: "coins", amount: 3500000 }]
  },
  {
    id: "colori-giallo-blu",
    level: "facile",
    categoria: "scienza",
    domanda: "Che colore diventa il giallo mescolato con il blu?",
    risposta: "verde",
    indizi: [
      "È il colore che si vede di più in un prato o in una foresta.",
      "È il colore delle foglie e dell'erba.",
      "Fa rima con... niente, ma è il colore dei broccoli!"
    ],
    rewards: [{ type: "coins", amount: 4000000 }]
  },
  {
    id: "zampe-ragno",
    level: "facile",
    categoria: "natura",
    domanda: "Quante zampe ha un ragno?",
    risposta: "8",
    indizi: [
      "Sono più delle zampe di un cane.",
      "Sono il doppio delle zampe di un granchio... no aspetta, uguali! Sono tante.",
      "Se ne conti quattro per lato, il totale è questo numero."
    ],
    rewards: [{ type: "coins", amount: 3500000 }]
  },
  {
    id: "pianeta-terra",
    level: "facile",
    categoria: "spazio",
    domanda: "Come si chiama il pianeta dove viviamo?",
    risposta: "Terra",
    indizi: [
      "Da lontano, nello spazio, sembra una biglia blu e verde.",
      "Ha lo stesso nome della sabbia bagnata e dei campi coltivati.",
      "Inizia con la lettera T."
    ],
    rewards: [{ type: "coins", amount: 4000000 }]
  },
  {
    id: "dita-mano",
    level: "facile",
    categoria: "corpo",
    domanda: "Quante dita ci sono in una mano?",
    risposta: "5",
    indizi: [
      "Sono meno delle dita di due mani insieme.",
      "È lo stesso numero delle punte di una stella marina.",
      "Guardati una mano e contale: pollice, indice, medio, anulare e..."
    ],
    rewards: [{ type: "coins", amount: 3000000 }]
  },
  {
    id: "animale-piu-grande-mare",
    level: "facile",
    categoria: "natura",
    domanda: "Qual è l'animale più grande che vive nel mare?",
    risposta: "la balena",
    indizi: [
      "È così grande che a volte viene scambiata per un'isola.",
      "Respira aria come noi e ogni tanto spruzza acqua dalla testa.",
      "È un cugino enorme del delfino, ma molto, molto più grande."
    ],
    rewards: [{ type: "coins", amount: 4500000 }]
  },
  {
    id: "colore-cielo-sereno",
    level: "facile",
    categoria: "scienza",
    domanda: "Di che colore è il cielo in una giornata serena?",
    risposta: "azzurro",
    indizi: [
      "È lo stesso colore di molti mari tropicali.",
      "È un colore chiaro, tra il blu e il bianco.",
      "Fa rima con... è il colore preferito di tanti pirati per le bandane!"
    ],
    rewards: [{ type: "coins", amount: 3000000 }]
  },
  {
    id: "mesi-anno",
    level: "facile",
    categoria: "logica",
    domanda: "Quanti mesi ha un anno?",
    risposta: "12",
    indizi: [
      "È un numero più grande di dieci.",
      "È lo stesso numero delle ore che segna un orologio prima di ricominciare.",
      "Gennaio, Febbraio, Marzo... continua a contare fino a Dicembre."
    ],
    rewards: [{ type: "coins", amount: 4000000 }]
  },
  {
    id: "casa-delle-api",
    level: "facile",
    categoria: "natura",
    domanda: "Come si chiama la casa delle api?",
    risposta: "alveare",
    indizi: [
      "È piena di piccole celle a forma esagonale.",
      "Dentro ci si trova il miele.",
      "Inizia con la lettera A, come 'ape'."
    ],
    rewards: [{ type: "coins", amount: 4500000 }]
  },
  {
    id: "contrario-giorno",
    level: "facile",
    categoria: "logica",
    domanda: "Qual è il contrario di 'giorno'?",
    risposta: "notte",
    indizi: [
      "È quando in cielo si vedono la luna e le stelle.",
      "È quando i bambini di solito dormono.",
      "Fa rima con 'botte' e con 'grotte'."
    ],
    rewards: [{ type: "coins", amount: 3000000 }]
  },
  {
    id: "ruote-bicicletta",
    level: "facile",
    categoria: "logica",
    domanda: "Quante ruote ha una normale bicicletta?",
    risposta: "2",
    indizi: [
      "Sono meno delle ruote di un'automobile.",
      "È lo stesso numero degli occhi di una persona.",
      "Una davanti e una dietro: contale sul disegno di una bici."
    ],
    rewards: [{ type: "coins", amount: 3000000 }]
  },
  {
    id: "verso-mucca",
    level: "facile",
    categoria: "natura",
    domanda: "Quale animale della fattoria fa il verso 'muu'?",
    risposta: "la mucca",
    indizi: [
      "È un animale grande, spesso bianco e nero o marrone.",
      "Da lei arriva il latte che beviamo a colazione.",
      "Vive nei prati e mangia erba tutto il giorno."
    ],
    rewards: [{ type: "coins", amount: 3500000 }]
  },
  {
    id: "lati-triangolo",
    level: "facile",
    categoria: "logica",
    domanda: "Quanti lati ha un triangolo?",
    risposta: "3",
    indizi: [
      "È un numero più piccolo di cinque.",
      "È lo stesso numero delle ruote di un tricycle... cioè un triciclo!",
      "Il nome della figura comincia con 'tri', come questo numero."
    ],
    rewards: [{ type: "coins", amount: 3000000 }]
  },
  {
    id: "da-dove-viene-miele",
    level: "facile",
    categoria: "natura",
    domanda: "Da dove viene il miele che mangiamo?",
    risposta: "dalle api (dai fiori, tramite le api)",
    indizi: [
      "Lo fanno dei piccoli insetti gialli e neri che ronzano.",
      "Questi insetti volano di fiore in fiore a raccogliere qualcosa di dolce.",
      "Vivono tutte insieme dentro un alveare."
    ],
    rewards: [{ type: "coins", amount: 4000000 }, { type: "fame", amount: 1 }]
  },

  /* --- AVANZATO — 9-10 anni ----------------------------------------------- */
  {
    id: "fiume-piu-lungo-italia",
    level: "avanzato",
    categoria: "geografia",
    domanda: "Qual è il fiume più lungo d'Italia?",
    risposta: "il Po",
    indizi: [
      "Scorre nel nord Italia e sfocia nel Mar Adriatico.",
      "Nasce in Piemonte, ai piedi delle Alpi, e attraversa città come Torino.",
      "Il suo nome ha solo due lettere."
    ],
    rewards: [{ type: "coins", amount: 6000000 }]
  },
  {
    id: "continenti-terra",
    level: "avanzato",
    categoria: "geografia",
    domanda: "Quanti continenti ci sono sulla Terra?",
    risposta: "7",
    indizi: [
      "Sono più di cinque ma meno di dieci.",
      "Europa, Asia, Africa, Nord America, Sud America, Oceania e uno ghiacciato al polo.",
      "L'ultimo, tutto ghiaccio, si chiama Antartide: contali tutti insieme."
    ],
    rewards: [{ type: "coins", amount: 5500000 }]
  },
  {
    id: "pianeta-vicino-sole",
    level: "avanzato",
    categoria: "spazio",
    domanda: "Qual è il pianeta più vicino al Sole?",
    risposta: "Mercurio",
    indizi: [
      "Nel nostro sistema solare è il primo della fila, prima di Venere.",
      "Ha lo stesso nome di un metallo liquido color argento.",
      "Inizia con la lettera M."
    ],
    rewards: [{ type: "coins", amount: 6000000 }]
  },
  {
    id: "moltiplicazione-7x8",
    level: "avanzato",
    categoria: "matematica",
    domanda: "Quanto fa 7 per 8?",
    risposta: "56",
    indizi: [
      "È un numero tra 50 e 60.",
      "È lo stesso risultato di 8 per 7 (l'ordine non cambia il risultato).",
      "7×7 fa 49: aggiungi ancora un 7 e trovi la risposta."
    ],
    rewards: [{ type: "coins", amount: 5000000 }]
  },
  {
    id: "oceano-piu-grande",
    level: "avanzato",
    categoria: "geografia",
    domanda: "Qual è l'oceano più grande del mondo?",
    risposta: "l'Oceano Pacifico",
    indizi: [
      "Bagna sia le coste dell'Asia sia quelle dell'America.",
      "Il suo nome significa anche 'calmo, tranquillo'.",
      "Inizia con la lettera P."
    ],
    rewards: [{ type: "coins", amount: 6500000 }]
  },
  {
    id: "atmosfera-terra",
    level: "avanzato",
    categoria: "scienza",
    domanda: "Come si chiama lo strato di gas che avvolge la Terra e ci fa respirare?",
    risposta: "atmosfera",
    indizi: [
      "Senza di lei non arriverebbe l'aria per respirare, né la pioggia.",
      "Protegge anche la Terra da molte rocce spaziali che bruciano attraversandola.",
      "Comincia con 'atmo-', come 'atmosferico' nelle previsioni del tempo."
    ],
    rewards: [{ type: "coins", amount: 6000000 }]
  },
  {
    id: "montagna-piu-alta",
    level: "avanzato",
    categoria: "geografia",
    domanda: "Qual è la montagna più alta del mondo?",
    risposta: "l'Everest",
    indizi: [
      "Si trova in Asia, tra Nepal e Tibet, nella catena dell'Himalaya.",
      "Pochissimi alpinisti riescono ad arrivare in cima: manca l'aria.",
      "Il suo nome ricorda la parola inglese 'ever' (sempre)."
    ],
    rewards: [{ type: "coins", amount: 7000000 }]
  },
  {
    id: "stato-ghiaccio",
    level: "avanzato",
    categoria: "scienza",
    domanda: "In che stato della materia si trova il ghiaccio?",
    risposta: "solido",
    indizi: [
      "Non è liquido come l'acqua che scorre nel rubinetto.",
      "Mantiene sempre la sua forma, a differenza di un liquido o di un gas.",
      "È il contrario dello stato in cui si trova l'acqua bollente che diventa vapore."
    ],
    rewards: [{ type: "coins", amount: 5000000 }]
  },
  {
    id: "ossa-scheletro-umano",
    level: "avanzato",
    categoria: "corpo",
    domanda: "Circa quante ossa ha lo scheletro di un adulto?",
    risposta: "circa 206",
    indizi: [
      "Sono più di 100 ma meno di 300.",
      "Un neonato ne ha addirittura di più: alcune, crescendo, si uniscono tra loro.",
      "Il numero comincia con 2 ed è vicino a 200 (206, per la precisione)."
    ],
    rewards: [{ type: "coins", amount: 6500000 }]
  },
  {
    id: "mare-venezia",
    level: "avanzato",
    categoria: "geografia",
    domanda: "Come si chiama il mare che bagna Venezia?",
    risposta: "il mare Adriatico",
    indizi: [
      "È il mare che divide l'Italia dalla penisola balcanica (Croazia, Grecia).",
      "Bagna tutta la costa orientale dell'Italia, da Trieste fino in Puglia.",
      "Il suo nome viene dalla città di Adria."
    ],
    rewards: [{ type: "coins", amount: 6000000 }]
  },
  {
    id: "unita-peso-tonnellata",
    level: "avanzato",
    categoria: "matematica",
    domanda: "Come si chiama l'unità di misura del peso usata per le cose molto pesanti, pari a 1.000 kg?",
    risposta: "tonnellata",
    indizi: [
      "È molto più grande del chilogrammo che si usa per pesare la frutta.",
      "Un'automobile piccola pesa circa una di queste unità.",
      "È la stessa parola che si usa per Nonna Belarda e le sue case che esplodono!"
    ],
    rewards: [{ type: "coins", amount: 7000000 }]
  },
  {
    id: "scoperta-america",
    level: "avanzato",
    categoria: "storia",
    domanda: "Chi è il navigatore che, nel 1492, arrivò per primo (tra gli europei) in America?",
    risposta: "Cristoforo Colombo",
    indizi: [
      "Era un navigatore italiano, partito con tre caravelle.",
      "Le sue navi si chiamavano Niña, Pinta e Santa Maria.",
      "Il suo cognome, 'Colombo', è anche il nome di un uccello."
    ],
    rewards: [{ type: "coins", amount: 6500000 }]
  },
  {
    id: "minuti-ora-e-mezza",
    level: "avanzato",
    categoria: "matematica",
    domanda: "Quanti minuti ci sono in un'ora e mezza?",
    risposta: "90",
    indizi: [
      "Sono più di 60 ma meno di 100.",
      "Un'ora sono 60 minuti: a questi aggiungi metà di 60.",
      "60 più 30 fa questo numero."
    ],
    rewards: [{ type: "coins", amount: 5500000 }]
  },
  {
    id: "deserto-piu-grande-caldo",
    level: "avanzato",
    categoria: "geografia",
    domanda: "Qual è il più grande deserto caldo del mondo?",
    risposta: "il Sahara",
    indizi: [
      "Si trova nel nord dell'Africa.",
      "È enorme quanto quasi tutta l'Europa messa insieme.",
      "Il suo nome, in arabo, significa proprio 'deserto'."
    ],
    rewards: [{ type: "coins", amount: 7000000 }, { type: "fame", amount: 1 }]
  }
]);
