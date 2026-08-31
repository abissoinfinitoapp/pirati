/* =============================================================================
   CATALOGO POTERI - carte, magie, armi, marchingegni
   -----------------------------------------------------------------------------
   I poteri si GUADAGNANO dalle quest (campo rewards: { type:"power", id:"..." })
   e si accumulano per tutta la campagna. Non si perdono mai.
   Sono anche le CARTE che i bambini tengono in mano e giocano.

   category : "carta" | "magia" | "arma" | "marchingegno"
   grade    : Grado minimo della ciurma per usarlo (1..5).
   cooldown : "quest" (1 volta a quest) | "giorno" (1 volta al giorno) | "permanente"
   passive  : opzionale, bonus fisso sempre attivo, es. { stat:"coraggio", amount:1 }

   play     : cosa succede quando un bambino GIOCA la carta.
              type "bonus"     -> { amount, stat? }  somma al tiro (stat opzionale)
              type "teambonus" -> { amount }         somma al tiro di TUTTA la ciurma
              type "skip"      -> salti un ostacolo / un incontro, senza tiro
              type "auto"      -> successo automatico su UNA prova
              type "move"      -> { spaces }          sposta la nave di N caselle
              type "passive"   -> non si "gioca", e' sempre attivo
              type "narrative" -> l'app mostra l'effetto, lo racconta il Master

   art      : descrizione per generare l'immagine della carta.
   image    : assets/carte/<id>.png  (riempito da solo)

   STILE IMMAGINI CARTE:
     l'OGGETTO magico al centro, illustrazione da libro per bambini, pittorico,
     colori caldi, l'oggetto che emana un po' di luce, sfondo neutro o a vignetta,
     formato verticale da carta da gioco. Coerente coi ritratti della ciurma.
   ========================================================================== */

PIRATI.registerPowers([

  /* --- GRADO 1 --------------------------------------------------------- */
  {
    id: "soffio-starnuto", name: "Soffio dello Starnuto", icon: "🌬️",
    category: "magia", grade: 1, cooldown: "quest",
    effect: "Soffi via nebbia, polvere, fumo o un piccolo ostacolo leggero senza tirare il dado.",
    play: { type: "skip", note: "un ostacolo leggero (nebbia, fumo, polvere, foglie)" },
    art: "Una piccola sfera di vento azzurra e vorticosa con una faccina buffa che sta per starnutire, soffia via foglie e polvere. Scintille bianche intorno, sfondo chiaro neutro."
  },
  {
    id: "fionda-parole", name: "Fionda delle Parole", icon: "🪃",
    category: "arma", grade: 1, cooldown: "giorno",
    effect: "+2 a una prova per colpire, spaventare o distrarre qualcosa a distanza.",
    play: { type: "bonus", amount: 2 },
    art: "Una fionda di legno intrecciato, la sacca fatta con una pagina di libro appallottolata, lettere dell'alfabeto che svolazzano intorno come proiettili. Un nastro rosso legato al manico."
  },
  {
    id: "seme-bussola", name: "Seme Bussola", icon: "🧭",
    category: "marchingegno", grade: 1, cooldown: "permanente",
    effect: "Sempre attivo: la ciurma sa sempre da che parte è la costa o l'uscita e non si perde.",
    play: { type: "passive" },
    art: "Un seme grosso come una noce, mezzo germogliato, con una minuscola bussola d'ottone incastonata al centro che punta a nord. Un pizzico di terra e una fogliolina verde."
  },
  {
    id: "scaglia-salamandra", name: "Scaglia di Salamandra", icon: "🔥",
    category: "carta", grade: 1, cooldown: "permanente",
    effect: "Chi la porta illumina il buio e dà +1 Coraggio ai compagni vicini.",
    passive: { stat: "coraggio", amount: 1 },
    play: { type: "passive", stat: "coraggio", amount: 1 },
    art: "Una scaglia a forma di goccia color fuoco, semitrasparente, con dentro una fiammella viva che si muove. Emana una luce calda arancione. Sfondo scuro per far risaltare il bagliore."
  },

  /* --- GRADO 2 --------------------------------------------------------- */
  {
    id: "conchiglia-veritiera", name: "Conchiglia Veritiera", icon: "🐚",
    category: "magia", grade: 2, cooldown: "quest",
    effect: "Una volta per quest scopri se un personaggio sta dicendo la verità o mentendo.",
    play: { type: "narrative", note: "chiedi al Master se il personaggio sta mentendo" },
    art: "Una conchiglia a spirale rosa perlato con un occhio gentile dipinto sulla superficie che sembra guardarti. Piccole onde sonore luminose escono dall'apertura."
  },
  {
    id: "cucchiaione-gigante", name: "Cucchiaione Gigante", icon: "🥄",
    category: "arma", grade: 2, cooldown: "giorno",
    effect: "+3 Coraggio per spingere, spazzare via, sbattere o mescolare qualcosa di grosso.",
    play: { type: "bonus", stat: "coraggio", amount: 3 },
    art: "Un enorme cucchiaio di legno da cuoco più alto di un bambino, manico consumato, tacche di battaglia sulla parte tonda, una goccia di zuppa dorata che cola dalla punta."
  },
  {
    id: "tamburo-marea", name: "Tamburo di Marea", icon: "🥁",
    category: "arma", grade: 2, cooldown: "quest",
    effect: "Batti il ritmo: tutta la ciurma fa +1 alla prossima prova.",
    play: { type: "teambonus", amount: 1 },
    art: "Un tamburo fatto con mezzo guscio di tartaruga e pelle tesa, bacchette di corallo bianco, cinghia di alghe intrecciate. Onde concentriche di suono che si allargano."
  },
  {
    id: "palafitta-pieghevole", name: "Palafitta Pieghevole", icon: "🏕️",
    category: "marchingegno", grade: 2, cooldown: "giorno",
    effect: "Monti un riparo sicuro: la ciurma salta un evento di pericolo.",
    play: { type: "skip", note: "un incontro di pericolo (evento o mostro)" },
    art: "Una casetta di legno in miniatura che si apre come un origami su quattro gambe a molla, tetto di foglie di palma, una lanterna accesa alla finestra. Aria accogliente."
  },
  {
    id: "perla-respiro", name: "Perla del Respiro", icon: "🫧",
    category: "carta", grade: 2, cooldown: "quest",
    effect: "Respiri sott'acqua per un'intera scena.",
    play: { type: "narrative", note: "un pirata (o il gruppo) respira sott'acqua per una scena" },
    art: "Una perla grigio-azzurra grande come una prugna, con una bollicina d'aria che sale al suo interno all'infinito. Riflessi d'acqua sulla superficie, sfondo blu profondo."
  },

  /* --- GRADO 3 --------------------------------------------------------- */
  {
    id: "pozione-volo", name: "Pozione di Volo", icon: "🧪",
    category: "magia", grade: 3, cooldown: "quest",
    effect: "Un gruppo vola per una scena e raggiunge un punto altrimenti irraggiungibile.",
    play: { type: "narrative", note: "il gruppo vola per una scena, raggiunge un punto alto o lontano" },
    art: "Una boccetta di vetro con liquido azzurro luminoso e piccole ali di libellula che sbattono da sole intorno al tappo di sughero. Alcune piume bianche galleggiano vicino."
  },
  {
    id: "uovo-brezza", name: "Uovo di Brezza", icon: "🥚",
    category: "magia", grade: 3, cooldown: "quest",
    effect: "Liberi un vento che spazza via gas, fumo, insetti o una piccola minaccia in aria.",
    play: { type: "skip", note: "una minaccia leggera in aria (gas, fumo, sciame)" },
    art: "Un uovo trasparente come vetro con dentro un piccolo tornado bianco che gira piano. Sul guscio, sottili crepe da cui esce un filo di vento visibile a spirale."
  },
  {
    id: "bottiglia-corrente", name: "Bottiglia di Corrente", icon: "🍾",
    category: "marchingegno", grade: 3, cooldown: "giorno",
    effect: "Sposti subito la nave di tre caselle nella direzione scelta, senza tirare il dado.",
    play: { type: "move", spaces: 3 },
    art: "Una bottiglia di vetro spesso tappata con cera rossa, dentro una corrente marina in miniatura che scorre veloce trascinando una barchetta di carta. Etichetta ingiallita e strappata."
  },
  {
    id: "barattolo-eco", name: "Barattolo d'Eco", icon: "📣",
    category: "carta", grade: 3, cooldown: "quest",
    effect: "Registri un suono o una voce e li riusi per distrarre una guardia o aprire un passaggio.",
    play: { type: "skip", note: "superi una guardia o apri un passaggio con il suono registrato" },
    art: "Un barattolo di vetro con coperchio di sughero, dentro onde sonore luminose intrappolate che rimbalzano contro il vetro. Un'etichetta con disegnata una bocca aperta."
  },

  /* --- GRADO 4 --------------------------------------------------------- */
  {
    id: "vela-nuvola", name: "Vela di Nuvola", icon: "⛵",
    category: "marchingegno", grade: 4, cooldown: "quest",
    effect: "La nave attraversa una rotta intera senza spendere Rifornimenti.",
    play: { type: "narrative", note: "la prossima rotta non costa Rifornimenti" },
    art: "Una vela da barca fatta di nuvola solida e morbida, cordami di pioggia sottile, un pezzetto di cielo azzurro col sole cucito in un angolo. Galleggia leggera."
  },
  {
    id: "chiave-maree", name: "Chiave delle Maree", icon: "🗝️",
    category: "carta", grade: 4, cooldown: "quest",
    effect: "Apri un forziere o una porta rara senza prova e senza fare rumore.",
    play: { type: "auto", note: "apertura di un forziere o di una porta (successo automatico)" },
    art: "Una chiave d'oro e madreperla a forma di onda, i denti fatti come piccole creste di mare schiumose. Gocce d'acqua salata sospese e luccicanti tutto intorno."
  },

  /* --- GRADO 5 --------------------------------------------------------- */
  {
    id: "stella-ciurma", name: "Stella della Ciurma", icon: "🌟",
    category: "carta", grade: 5, cooldown: "permanente",
    effect: "Quando la ciurma agisce davvero unita, +1 a TUTTE le prove. Apre il ciclo successivo.",
    play: { type: "passive", allstats: 1, note: "+1 a ogni prova quando la ciurma agisce unita" },
    art: "Una stella marina a cinque punte che brilla di luce dorata, ogni punta di un colore diverso che si fondono verso il centro luminoso. Sospesa e riflessa nell'acqua nera calma."
  },

  /* --- CARTE LEGGENDARIE ---------------------------------------------
     Non si pescano dalle quest. Si conquistano con un'impresa (campo howTo).
     Per ora il Master le assegna a mano quando la ciurma se le merita. */
  {
    id: "cuore-abisso", name: "Il Cuore dell'Abisso", icon: "🫀",
    category: "magia", grade: 5, cooldown: "giorno", legendary: true,
    howTo: "Quando incontrate Barbabisso, il Vecchio del Fondale (il boss), ogni pirata presente deve dargli qualcosa per farlo tornare a dormire: una ninna nanna, un oggetto che brilla, una storia mai raccontata, un nodo speciale. Quando li ha ricevuti da tutti, sbadiglia, vi riporta a galla e lascia cadere il suo cuore di luce.",
    effect: "Una volta al giorno la ciurma dice «Silenzio, Abisso»: il Pericolo torna a 0 e per il resto della scena nessun incontro può fermare la nave.",
    play: { type: "narrative", note: "Pericolo a 0 + nessun incontro per una scena" },
    art: "Una sfera di luce blu bioluminescente che pulsa piano come un cuore, dentro nuotano minuscoli pesci-lanterna e si vedono lanterne appese; tenuta a due mani, gocce di luce che colano. Sfondo nero abissale."
  },
  {
    id: "bussola-sette-mari", name: "La Bussola dei Sette Mari", icon: "🧭",
    category: "marchingegno", grade: 5, cooldown: "quest", legendary: true,
    howTo: "Completa almeno un'avventura su tutte e 8 le isole dell'arcipelago. Tornati al Porto del Teschio, il vecchio guardiano del faro apre un cassetto e vi consegna la bussola che ha guidato ogni capitano leggendario prima di voi.",
    effect: "Una volta per avventura, invece di tirare, la ciurma sceglie il numero di un dado (da 1 a 6) — di navigazione o di prova.",
    play: { type: "narrative", note: "scegli il risultato di un dado da 1 a 6" },
    art: "Una grande bussola di ottone e vetro con sette aghi sottili che puntano in direzioni diverse, una rosa dei venti dorata incisa, sospesa sopra una mappa antica ingiallita, riflessi caldi di lanterna."
  },
  {
    id: "vessillo-ciurma", name: "Il Vessillo della Ciurma Intera", icon: "🏴",
    category: "carta", grade: 5, cooldown: "permanente", legendary: true,
    howTo: "In una sola giornata, tutta la ciurma è presente — nessun assente — e insieme completa un'avventura facendo tirare a turno pirati diversi. La giornata perfetta. Quella sera trovate sul molo una bandiera nuova, cucita da mani sconosciute.",
    effect: "Quando tutta la ciurma è in gioco (nessun assente): +1 a ogni prova e +1 miglio a ogni navigazione. Se anche un solo pirata è assente, il vessillo resta arrotolato.",
    play: { type: "passive", note: "+1 a ogni prova e +1 miglio, solo a ciurma al completo" },
    art: "Una grande bandiera pirata fatta di tanti pezzi di stoffa diversi cuciti insieme, ognuno di un colore, un teschio sorridente al centro disegnato con puntini di stelle, sventola fiera contro un cielo al tramonto."
  }

]);
