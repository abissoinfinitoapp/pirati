/* =============================================================================
   BESTIARIO - i contendenti dell'Arcipelago del Teschio d'Oro
   -----------------------------------------------------------------------------
   Solo dati. Il gioco pesca da qui per gli incontri "mostro" e "assalto"
   sulla mappa e per il Combattimento.

   Campi:
     id      - identificatore unico (minuscolo-con-trattini). Sara' anche il
               nome del file immagine: assets/contendenti/<id>.png
     name    - nome del personaggio (stile ciurma: nome + soprannome)
     vibe    - "pauroso ma divertente" oppure "goffo ma pericoloso"
     threat  - soglia della prova (5 = facile ... 9 = tosto, boss 11-12)
     reward  - cosa si guadagna sconfiggendolo
     trick   - il punto debole / trucco: utile in gioco e per raccontare la scena
     art     - descrizione per generare l'immagine (aspetto, colori, posa)
     boss    - true solo per il boss di fine ciclo

   STILE IMMAGINI (comune a tutti):
     illustrazione da libro per bambini, pittorica, mezzobusto o figura intera,
     colori caldi (pergamena, oro, verde-mare, ruggine), luce morbida,
     espressione tra il buffo e il minaccioso mai davvero cattiva,
     sfondo neutro o appena accennato. Coerente con i ritratti della ciurma.
   ========================================================================== */

PIRATI.registerEnemies([

  {
    id: "sbadiglio-il-mozzo",
    name: "Sbadiglio il Mozzo",
    vibe: "goffo ma pericoloso",
    threat: 5,
    reward: "2 monete e una coperta calda",
    trick: "Cantagli una ninna nanna: se si addormenta del tutto, si arrende senza combattere.",
    art: "Ragazzino pirata magrolino con grandi occhiaie viola, bocca spalancata in uno sbadiglio enorme. Berretto a righe storto che gli scivola sugli occhi, camicia sbottonata, una pantofola al posto di uno stivale. Impugna una sciabola troppo grande che gli sta scivolando di mano. Colori spenti, azzurro notte e grigio, aria assonnata."
  },
  {
    id: "nonna-cannonata",
    name: "Nonna Cannonata",
    vibe: "pauroso ma divertente",
    threat: 6,
    reward: "Un barattolo di biscotti esplosivi (fanno un gran botto, sapore ottimo)",
    trick: "Falle un complimento sincero sul suo scialle a fiori: abbassa il cannone e offre il tè.",
    art: "Vecchia pirata minuta con crocchia bianca e occhialini tondi, seduta su una sedia a dondolo montata sopra un piccolo cannone di ottone lucido. Scialle a fiori sulle spalle, sorriso dolcissimo ma sguardo di ferro. In una mano una palla di cannone, nell'altra un vassoio di biscotti. Palette calda: rosa polvere, ottone, legno miele."
  },
  {
    id: "ossobello-il-traballante",
    name: "Ossobello il Traballante",
    vibe: "goffo ma pericoloso",
    threat: 6,
    reward: "Un dito-grimaldello: apre le serrature comuni",
    trick: "Raccogli un osso che ha perso e restituiglielo: si ferma per rimontarselo e perde il turno.",
    art: "Scheletro pirata sgangherato tenuto insieme da corde e nastri colorati, un braccio piu lungo dell'altro, un dente d'oro nel sorriso storto. Gli sta cadendo un femore che sembra scappare da solo. Tricorno sdrucito, benda su un'orbita vuota. Ossa color avorio, legni scuri, un fiocco rosso alla caviglia."
  },
  {
    id: "zia-rete-la-polposa",
    name: "Zia Rete, la Polposa",
    vibe: "pauroso ma divertente",
    threat: 6,
    reward: "Una rete tascabile che non si aggroviglia mai",
    trick: "Nascondile gli occhiali: senza non vede la ciurma e continua a lavorare a maglia.",
    art: "Grande polpo color prugna con espressione da zia premurosa, indossa uno scialle di lana e occhialetti in equilibrio sulla punta di un tentacolo. Quattro tentacoli lavorano a maglia una rete enorme, gli altri quattro cercano qualcosa a tastoni. Sfondo acqua verde torbida, gomitoli di lana che galleggiano."
  },
  {
    id: "ruggine-squittio",
    name: "Ruggine Squittìo",
    vibe: "goffo ma pericoloso",
    threat: 7,
    reward: "Una piastra-scudo che para un colpo al giorno",
    trick: "Versagli addosso acqua salata o olio: le giunture si inchiodano e resta bloccato in posa.",
    art: "Pirata dentro un'armatura tutta arrugginita e ammaccata, chiodi e cardini che spuntano, chiazze arancioni ovunque. Da ogni giuntura esce un piccolo fumetto con scritto SQUIIC. Elmo con la visiera bloccata a meta, due occhi che sbirciano dalla fessura. Marrone ruggine, grigio ferro, qualche rivetto dorato."
  },
  {
    id: "fifi-ombralunga",
    name: "Fifì Ombralunga",
    vibe: "pauroso ma divertente",
    threat: 7,
    reward: "Un mantello di penombra: rende invisibili per una scena",
    trick: "Puntagli addosso una luce forte (lanterna, specchio, torcia): si rimpicciolisce fino a diventare una pozzanghera.",
    art: "Pirata fatto di ombra viola-blu semitrasparente, altissimo e sottile come al tramonto, cappello a punta e sciabola di fumo. Posa spavalda, petto in fuori, ma un occhio sbircia indietro spaventato. Ai suoi piedi la stessa ombra si scioglie in una pozzanghera scura. Controluce arancione dietro di lui."
  },
  {
    id: "capitan-vongola",
    name: "Capitan Vongola",
    vibe: "goffo ma pericoloso",
    threat: 8,
    reward: "La Perla del Comando: una volta al giorno un ordine viene eseguito subito",
    trick: "Batti un ritmo con le mani: la conchiglia si apre e si chiude a tempo e resta spalancata sul battito giusto.",
    art: "Pirata robusto che sbuca da una conchiglia gigante a ventaglio, grande come una scialuppa: fuori solo testa e braccia, cappello da capitano con piuma. Ai lati della conchiglia due sportelli-cannone veri. Faccia decisa ma un filo imbarazzata dalla situazione. Madreperla rosa e crema, oro, alghe."
  },
  {
    id: "le-sorelle-mordicchio",
    name: "Le Sorelle Mordicchio",
    vibe: "pauroso ma divertente",
    threat: 8,
    reward: "Tre denti-fischietto: ognuno fa un suono diverso",
    trick: "Proponi una gara (chi salta piu in alto, chi trattiene il fiato): si mettono a litigare su chi ha vinto e si dimenticano di voi.",
    art: "Tre piccole sirene-piraña identiche con dentoni sporgenti e pinna dorsale a cresta, che litigano puntandosi il dito a vicenda, le code intrecciate in un nodo. Squame verde lime e argento, treccine con lische di pesce come fermagli. Bolle e alghe intorno. Buffe ma con i denti aguzzi ben in vista."
  },
  {
    id: "bombolo-micciacorta",
    name: "Bombolo Micciacorta",
    vibe: "goffo ma pericoloso",
    threat: 8,
    reward: "Una bomba-coriandoli: scoppia in festa, non in danni",
    trick: "Passagli un secchio d'acqua: deve correre a spegnere tutte le micce una per una e non pensa piu ad attaccare.",
    art: "Pirata piccolo e rotondissimo tutto coperto di bombe nere sfrigolanti appese a bandoliere incrociate; una gli sta rotolando via da sotto il braccio. Faccia paffuta preoccupata, sopracciglia bruciacchiate, mezzo baffo. Rosso e nero, scintille arancioni, un filo di fumo che sale."
  },
  {
    id: "ammiraglia-salamoia",
    name: "Ammiraglia Salamoia",
    vibe: "pauroso ma divertente",
    threat: 9,
    reward: "Fama +3 e una medaglia rubata alla Marina Reale",
    trick: "Lasciala iniziare il discorso: e' cosi lungo e noioso che la ciurma puo fuggire o compiere un'azione gratis mentre parla.",
    art: "Comandante della Marina Reale conservata in salamoia da 200 anni: pelle verdolina raggrinzita, uniforme fradicia coperta di alghe e cirripedi, bicorno ammuffito. Bocca spalancata a meta di un discorso interminabile, un dito puntato in avanti. Medaglie appannate sul petto. Verde bottiglia, oro annerito, gocce che colano."
  },

  /* ---- BOSS DI FINE CICLO -------------------------------------------- */
  {
    id: "barbabisso",
    name: "Barbabisso, il Vecchio del Fondale",
    vibe: "pauroso ma divertente",
    threat: 12,
    boss: true,
    reward: "La Corona di Lanterne (Fama +4) e la rotta segreta verso il fondale",
    trick: "Non si sconfigge a forza. Ogni bambino della ciurma deve dargli qualcosa per farlo tornare a dormire: una ninna nanna, un oggetto lucente, una storia mai raccontata, un nodo speciale, un disegno. Quando ha ricevuto un dono da tutti, sbadiglia e vi riporta a galla.",
    art: "Creatura colossale del mare profondo, mezzo pesce-lanterna e mezzo paguro: al posto della conchiglia porta sulla schiena un galeone naufragato incastrato di traverso. Barba lunghissima fatta di alghe e di lanterne-esca bioluminescenti azzurre, due file di denti spuntati, occhi enormi lattiginosi e stanchissimi. Cappello da capitano incrostato di cirripedi, un grosso rampino arrugginito al posto di una chela. Espressione non malvagia, solo tremendamente scocciato di essere stato svegliato. Nero abisso, blu bioluminescente, legno marcio, ottone. Inquadratura eroica dal basso, la ciurma minuscola in primo piano."
  }

]);
