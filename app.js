const DATA = {
  characters: [
    {
      id: "luna",
      name: "Luna Occhio di Stella",
      role: "Cartografa",
      stats: { coraggio: 1, astuzia: 3, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/luna.webp"),
      skill: "Rotta Sicura: una volta al giorno, prima che la ciurma tiri per navigare, guarda la casella dove arrivereste. Il Master dice che tipo è: potete salpare o cambiare rotta.",
      flaw: "Se la ciurma va lo stesso dove Luna ha visto un pericolo: Pericolo +1.",
      goal: "Guida la ciurma a completare un'avventura su tre isole diverse."
    },
    {
      id: "rocco",
      name: "Rocco Barilotto",
      role: "Forzuto",
      stats: { coraggio: 3, astuzia: 1, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/rocco.webp"),
      skill: "Spallata: una volta per incontro, Rocco ripete il suo dado in una prova di Coraggio e tiene il risultato migliore.",
      flaw: "Trappole ed enigmi lo confondono: −1 alle sue prove di Astuzia.",
      goal: "Fai da scudo a un compagno in tre incontri diversi."
    },
    {
      id: "mina",
      name: "Mina Miccia Corta",
      role: "Frastuono",
      stats: { coraggio: 2, astuzia: 2, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/mina.webp"),
      skill: "Gran Baccano: quando c'è da spaventare, distrarre o spazzare via qualcosa con rumore, vento e colori, Mina fa +2 al tiro.",
      flaw: "Se sul suo dado esce 1, il baccano spaventa anche la ciurma: Pericolo +1.",
      goal: "Risolvi tre situazioni diverse con un gran baccano di colori e rumore."
    },
    {
      id: "tito",
      name: "Tito Tre Denti",
      role: "Furfante",
      stats: { coraggio: 1, astuzia: 3, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/tito.webp"),
      skill: "Mano Lesta: quando la ciurma vince monete da un tesoro o una razzia, Tito ne intasca +2 per la ciurma. Non due incontri di fila.",
      flaw: "Se una prova furtiva fallisce, viene scoperto: Pericolo +2.",
      goal: "Fai guadagnare alla ciurma 15 monete senza mai iniziare un combattimento."
    },
    {
      id: "sofia",
      name: "Sofia Ventoalto",
      role: "Navigatrice",
      stats: { coraggio: 2, astuzia: 2, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/sofia.webp"),
      skill: "Vento in Poppa: una volta al giorno, Sofia aggiunge +1 alle miglia della ciurma in un tiro di navigazione.",
      flaw: "A terra, sulle isole, perde il tocco: niente bonus e −1 alle prove di movimento a piedi.",
      goal: "Porta la ciurma a un'isola nuova due giorni di fila."
    },
    {
      id: "nino",
      name: "Nino Nodi",
      role: "Soccorritore",
      stats: { coraggio: 2, astuzia: 3, fortuna: 1 },
      image: window.PIRATI_ASSET("personaggi/nino.webp"),
      skill: "Corda al Volo: se un compagno resta bloccato o indietro (fallimento, trappola), Nino lo libera senza che nessuno tiri.",
      flaw: "Se agisce da solo, senza nessun altro pirata nella scena: −1 al tiro.",
      goal: "Tira fuori dai guai tre compagni diversi."
    },
    {
      id: "zoe",
      name: "Capitanina Zoe",
      role: "Capitana",
      stats: { coraggio: 2, astuzia: 2, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/zoe.webp"),
      skill: "Ordine di Capitana: una volta per prova, Zoe dà +2 al dado di un altro pirata.",
      flaw: "Non può usare nessun bonus su se stessa.",
      goal: "Fai superare a un compagno una prova che senza il tuo aiuto sarebbe fallita."
    },
    {
      id: "bruno",
      name: "Bruno Pancia di Ferro",
      role: "Scudo",
      stats: { coraggio: 3, astuzia: 1, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/bruno.webp"),
      skill: "Muro: una volta al giorno, Bruno annulla del tutto la conseguenza di un fallimento (niente Pericolo, niente monete perse, niente complicazione).",
      flaw: "Quando c'è da scappare, Bruno non scappa: la ciurma non può usare la fuga se Bruno è nella scena.",
      goal: "Reggi l'urto di un contendente forte (soglia 8+) e resta in piedi."
    },
    {
      id: "pepita",
      name: "Pepita Cercatesori",
      role: "Cercatrice",
      stats: { coraggio: 1, astuzia: 2, fortuna: 3 },
      image: window.PIRATI_ASSET("personaggi/pepita.webp"),
      skill: "Fiuto d'Oro: su una casella Tesoro, Pepita fa pescare due ricompense e la ciurma sceglie quale tenere.",
      flaw: "Dopo un tesoro raro o epico, l'avidità si fa sentire: Pericolo +1.",
      goal: "Porta a casa tre oggetti di bottino diversi in un solo ciclo."
    },
    {
      id: "gigi",
      name: "Gigi Pappagallo",
      role: "Buffone",
      stats: { coraggio: 1, astuzia: 3, fortuna: 2 },
      image: window.PIRATI_ASSET("personaggi/gigi.webp"),
      skill: "Sceneggiata: davanti a un mostro o un assalto, Gigi prova a evitarlo con una prova di Astuzia (invece di Coraggio). Se riesce, l'incontro finisce senza scontro.",
      flaw: "Se la prova fallisce, la sceneggiata va male: tutti ridono, Pericolo +1.",
      goal: "Evita tre combattimenti facendo ridere o confondendo i nemici."
    },
    {
      id: "nerina",
      name: "Nerina la Silenziosa",
      role: "Esploratrice",
      stats: { coraggio: 2, astuzia: 3, fortuna: 1 },
      image: window.PIRATI_ASSET("personaggi/nerina.webp"),
      skill: "Passo di Piuma: una volta per avventura, Nerina supera una guardia, una porta o una trappola senza far tirare nessuno.",
      flaw: "Se la ciurma si carica di bottino pesante (3+ oggetti presi nella stessa scena), Nerina perde la furtività: niente potere.",
      goal: "Entra per prima in una zona pericolosa e torna con un indizio, in tre avventure."
    },
    {
      id: "arturo",
      name: "Arturo Mezzabussola",
      role: "Inventore",
      stats: { coraggio: 1, astuzia: 2, fortuna: 3 },
      image: window.PIRATI_ASSET("personaggi/arturo.webp"),
      skill: "Arnese Improvvisato: una volta al giorno, Arturo costruisce sul momento un attrezzo che vale come una Carta Potere \"Salta\" (superi un ostacolo, nessun tiro).",
      flaw: "Se sul suo dado esce 1, l'arnese funziona al contrario e combina un guaio (decide il Master).",
      goal: "Risolvi tre situazioni diverse con un'invenzione."
    }
  ],
  missions: [
    {
      id: "mappa-strappata",
      title: "La Mappa Strappata",
      difficulty: 5,
      turns: 12,
      text: "Tre pezzi di mappa sono nascosti tra porto, giungla e grotta. Servono almeno due pezzi per scoprire la rotta.",
      win: "+2 Fama e un tesoro raro se trovano almeno due indizi.",
      fail: "La mappa finisce a una ciurma rivale. Domani il primo combattimento sara piu duro."
    },
    {
      id: "pappagallo-scomparso",
      title: "Il Pappagallo Scomparso",
      difficulty: 4,
      turns: 10,
      text: "Un pappagallo conosce una parola segreta. Va recuperato prima che impari a insultare il Governatore.",
      win: "+1 Fama e un aiuto gratuito in una prova di Astuzia.",
      fail: "Il pappagallo rivela dove si trova la nave: Pericolo iniziale +2 domani."
    },
    {
      id: "forte-corallo",
      title: "Il Forte di Corallo",
      difficulty: 6,
      turns: 12,
      text: "Un vecchio forte contiene una chiave. Si puo entrare con forza, furtivita o trattativa.",
      win: "+3 Fama e sblocca le missioni con porte sigillate.",
      fail: "Il forte chiude le saracinesche. Serve pagare 3 monete per riprovare."
    },
    {
      id: "campana-abissi",
      title: "La Campana degli Abissi",
      difficulty: 7,
      turns: 14,
      text: "Una campana sommersa sveglia creature marine ogni volta che il Pericolo cresce.",
      win: "+3 Fama e una protezione contro tempeste.",
      fail: "Le onde spingono la nave fuori rotta: perdono un tesoro comune."
    },
    {
      id: "duello-capitano",
      title: "Duello con Capitan Salsedine",
      difficulty: 7,
      turns: 12,
      text: "Un capitano rivale sfida la ciurma. I bambini possono batterlo con duello, trucco o colpo di scena.",
      win: "+4 Fama e una carta trofeo.",
      fail: "Il rivale ruba il prossimo tesoro trovato."
    }
  ],
  events: [
    { title: "Nebbia Fitta", type: "Mare", text: "La prossima prova di Astuzia ha +1, ma se fallisce il Pericolo sale di 2." },
    { title: "Scimmia Ladra", type: "Isola", text: "Ruba una moneta. Con Fortuna 6+ la riprende e trova anche un indizio." },
    { title: "Bottiglia in Mare", type: "Indizio", text: "Scegli: leggi il messaggio e guadagni un indizio, oppure vendilo per 2 monete." },
    { title: "Guardia Sonnacchiosa", type: "Quest", text: "Astuzia 6+ per passare gratis. Fallimento: combattimento leggero." },
    { title: "Pioggia Calda", type: "Mare", text: "Riposo vale doppio, ma cercare tesori questo turno vale -1." },
    { title: "Mercante Nervoso", type: "Porto", text: "Compra un oggetto comune per 2 monete o prova Astuzia 7+ per uno sconto." },
    { title: "Tamburi nella Giungla", type: "Pericolo", text: "Se il Pericolo e 5 o piu, arriva un nemico. Altrimenti Pericolo +1." },
    { title: "Corda Spezzata", type: "Trappola", text: "Un pirata resta bloccato finche qualcuno supera Coraggio o Astuzia 6+." },
    { title: "Mappa Capovolta", type: "Comico", text: "Il gruppo sceglie: perde un turno o accetta un evento casuale in piu." },
    { title: "Granchio Gigante", type: "Nemico", text: "Combattimento medio. Se vinto, guadagnano una chela-trofeo da vendere." },
    { title: "Canto Misterioso", type: "Mistero", text: "Fortuna 7+ per ottenere +1 Fama. Fallimento: tutti devono parlare sussurrando per un turno." },
    { title: "Vela Strappata", type: "Mare", text: "Riparare richiede Astuzia 6+ o 2 monete. Finche non riparano, Pericolo +1 a ogni turno." },
    { title: "Festa al Porto", type: "Porto", text: "Ogni pirata puo scambiare 1 moneta per un rilancio futuro." },
    { title: "X sulla Sabbia", type: "Tesoro", text: "Cerca tesoro subito. Se questa zona e gia stata cercata, trova solo 1 moneta." },
    { title: "Occhi nel Buio", type: "Pericolo", text: "La prossima azione ripetuta costa Pericolo +2 invece di +1." },
    { title: "Vecchio Marinaio", type: "Quest", text: "Racconta un indovinello. Se il tavolo risponde bene, ottiene un indizio." },
    { title: "Corrente Favorevole", type: "Mare", text: "Il prossimo turno non consuma tempo se cambiano zona." },
    { title: "Bandiera Nera", type: "Nemico", text: "Una ciurma rivale appare. Combatti o paga 2 monete per distrarla." },
    { title: "Conchiglia Parlante", type: "Mistero", text: "Un bambino fa una promessa pirata. Se la mantiene entro fine giorno: +1 Fama." },
    { title: "Sabbiemobili", type: "Trappola", text: "Serve aiuto di gruppo. Ogni fallimento aumenta Pericolo di 1." }
  ],
  treasures: [
    { title: "Doblone Lucente", rarity: "Comune", text: "+2 monete." },
    { title: "Bussola Testarda", rarity: "Comune", text: "+1 a una prova di navigazione o mappa." },
    { title: "Benda Elegante", rarity: "Comune", text: "+1 Fama se il bambino racconta come l'ha ottenuta." },
    { title: "Corda Infinita", rarity: "Comune", text: "Annulla una trappola di movimento." },
    { title: "Biscotti del Capitano", rarity: "Comune", text: "Riposo cura anche un compagno." },
    { title: "Chiave Salata", rarity: "Raro", text: "Apre una porta o forziere senza prova." },
    { title: "Cannocchiale Lunare", rarity: "Raro", text: "Guarda due eventi e scegli quale affrontare." },
    { title: "Moneta Maledetta", rarity: "Raro", text: "+4 monete ora, ma Pericolo +2." },
    { title: "Stivali Silenziosi", rarity: "Raro", text: "+2 a una prova furtiva." },
    { title: "Medaglia del Porto", rarity: "Raro", text: "Un mercante fa uno sconto di 2 monete." },
    { title: "Teschio d'Ambra", rarity: "Epico", text: "+2 Fama. Ogni nemico importante vorra rubarlo." },
    { title: "Mappa che Ride", rarity: "Epico", text: "Trasforma un fallimento in successo, poi cambia missione secondaria." }
  ],
  enemies: [
    { title: "Mozzo Rivale", threat: 5, reward: "1 moneta", trick: "Si arrende se qualcuno lo fa ridere." },
    { title: "Granchio Corazzato", threat: 6, reward: "Chela-trofeo", trick: "Astuzia batte Coraggio." },
    { title: "Guardia del Forte", threat: 6, reward: "Chiave o indizio", trick: "Si puo corrompere con 2 monete." },
    { title: "Scimmia Bucaniera", threat: 7, reward: "Oggetto rubato", trick: "Fortuna +1 se la attirano con cibo." },
    { title: "Spadaccino Sbadato", threat: 7, reward: "2 monete", trick: "Con 1 naturale cade da solo." },
    { title: "Totem Animato", threat: 8, reward: "Indizio antico", trick: "Non subisce trucchi ripetuti." },
    { title: "Capitan Salsedine", threat: 9, reward: "Trofeo rivale", trick: "Ogni bambino deve contribuire almeno una volta." },
    { title: "Ombra del Galeone", threat: 10, reward: "Tesoro epico", trick: "Perde forza se il Pericolo scende sotto 5." },
    { title: "Polpo Furbo", threat: 9, reward: "Perla nera", trick: "Afferra oggetti: gli oggetti usati hanno il 50% di rischio." },
    { title: "Marina Reale", threat: 11, reward: "Fama +3", trick: "Compare se la ciurma farma troppo tesoro." }
  ],
  quests: [
    "Convincere un mercante a fidarsi della ciurma.",
    "Attraversare un ponte che scricchiola senza urlare.",
    "Decifrare tre simboli su una porta antica.",
    "Aiutare un abitante dell'isola e scegliere una ricompensa.",
    "Recuperare una bandiera prima che finisca in mare.",
    "Fare pace tra due pirati che vogliono lo stesso tesoro.",
    "Inventare una parola d'ordine e usarla al momento giusto.",
    "Spostare un masso senza usare solo la forza."
  ],
  board: [
    ["Porto Calmo", "porto", "Compra oggetti e scegli missioni."],
    ["Baia delle Vele", "mare", "Prova di navigazione."],
    ["Scoglio Rosso", "pericolo", "Evento mare obbligatorio."],
    ["Spiaggia X", "tesoro", "Cerca tesoro una volta."],
    ["Giungla Fitta", "pericolo", "Trappola o quest."],
    ["Grotta Umida", "tesoro", "Tesoro con Pericolo +1."],
    ["Villaggio", "porto", "Riposo o trattativa."],
    ["Rovine", "pericolo", "Prova Astuzia."],
    ["Cascata", "mare", "Scorciatoia se Fortuna 6+."],
    ["Forte Corallo", "pericolo", "Nemico o chiave."],
    ["Laguna Blu", "mare", "Riduci Pericolo di 1."],
    ["Isola Teschio", "tesoro", "Tesoro raro se missione attiva."],
    ["Relitto", "tesoro", "Oggetto comune o nemico."],
    ["Palude", "pericolo", "Pericolo +1 se si ripete azione."],
    ["Ponte Rotto", "pericolo", "Serve aiuto di gruppo."],
    ["Mercato", "porto", "Scambia monete e oggetti."],
    ["Tempesta", "mare", "Turno extra o danno."],
    ["Vulcano", "pericolo", "Ricompensa alta, rischio alto."]
  ]
};

const SPECIAL_ITEMS = {
  luna: [
    { id: "bussola-stellare", icon: "✦", name: "Bussola Stellare", type: "Rotta", effect: "Ottieni +2 a una prova di Astuzia per trovare una rotta o leggere una mappa." },
    { id: "inchiostro-luna", icon: "☾", name: "Inchiostro di Luna", type: "Indizio", effect: "Guarda due eventi: affrontane uno e rimetti l'altro in fondo al mazzo." },
    { id: "monocolo-astrale", icon: "◉", name: "Monocolo Astrale", type: "Scoperta", effect: "Rivela un indizio nascosto senza consumare un turno." }
  ],
  rocco: [
    { id: "barile-scudo", icon: "◒", name: "Barile Scudo", type: "Difesa", effect: "Ignora una perdita o proteggi un compagno dalla conseguenza di un fallimento." },
    { id: "cintura-uragano", icon: "≋", name: "Cintura dell'Uragano", type: "Forza", effect: "Ottieni +2 Coraggio per spostare, rompere o sostenere qualcosa." },
    { id: "biscotto-gigante", icon: "●", name: "Biscotto Gigante", type: "Energia", effect: "Un compagno recupera subito e il prossimo Riposo non consuma tempo." }
  ],
  mina: [
    { id: "polvere-arcobaleno", icon: "❋", name: "Polvere Arcobaleno", type: "Diversivo", effect: "Lancia una nuvola di colori: distrai un gruppo e la ciurma evita un combattimento leggero." },
    { id: "girandola-vento", icon: "✿", name: "Girandola del Vento", type: "Invenzione", effect: "Falla girare forte: una folata spazza via un ostacolo leggero senza tirare." },
    { id: "fischietto-tuonante", icon: "♬", name: "Fischietto Tuonante", type: "Controllo", effect: "Un fischio enorme copre ogni rumore e annulla il guaio in più causato da un 1 sul dado." }
  ],
  tito: [
    { id: "tasca-impossibile", icon: "◇", name: "Tasca Impossibile", type: "Nascondiglio", effect: "Metti al sicuro un oggetto che verrebbe perso o rubato: resta tuo." },
    { id: "dado-portafortuna", icon: "✦", name: "Dado Portafortuna", type: "Fortuna", effect: "Dopo un tiro, aggiungi +1 al risultato senza rilanciare." },
    { id: "chiave-curiosa", icon: "⚷", name: "Chiave Curiosa", type: "Apertura", effect: "Apre una porta comune che si è incantata, senza prova e senza far rumore." }
  ],
  sofia: [
    { id: "vela-tascabile", icon: "◁", name: "Vela Tascabile", type: "Navigazione", effect: "Il prossimo spostamento via mare non consuma un turno." },
    { id: "rosa-venti", icon: "✣", name: "Rosa dei Venti", type: "Rotta", effect: "Riduci di 2 il Pericolo causato da mare, vento o tempesta." },
    { id: "conchiglia-brezza", icon: "◌", name: "Conchiglia della Brezza", type: "Soccorso", effect: "Allontana nebbia o fumo e concede +1 alla prova di tutta la ciurma." }
  ],
  nino: [
    { id: "corda-amica", icon: "∞", name: "Corda Amica", type: "Salvataggio", effect: "Libera o recupera un compagno senza prova e senza consumare turno." },
    { id: "nodo-cento", icon: "⌘", name: "Nodo dei Cento Usi", type: "Attrezzo", effect: "Crea al momento un ponte, una carrucola o una presa sicura." },
    { id: "fischietto-soccorso", icon: "♪", name: "Fischietto di Soccorso", type: "Squadra", effect: "Tutti possono contribuire alla stessa prova con +1 complessivo." }
  ],
  zoe: [
    { id: "cannocchiale-capitana", icon: "⌕", name: "Cannocchiale da Capitana", type: "Comando", effect: "Scegli chi agirà nella prossima prova e concedigli +2." },
    { id: "bandiera-coraggio", icon: "⚑", name: "Bandiera del Coraggio", type: "Ciurma", effect: "Tutti ignorano la paura e il primo fallimento non aumenta il Pericolo." },
    { id: "medaglia-parola", icon: "✪", name: "Medaglia della Parola", type: "Leadership", effect: "Trasforma una discussione in accordo oppure ottieni uno sconto dal mercante." }
  ],
  bruno: [
    { id: "scudo-tartaruga", icon: "⬡", name: "Scudo Tartaruga", type: "Difesa", effect: "Annulla completamente un attacco o una conseguenza fisica per la squadra." },
    { id: "borraccia-ferro", icon: "♨", name: "Borraccia di Ferro", type: "Resistenza", effect: "Rimani in piedi e ottieni +2 Coraggio fino alla fine della scena." },
    { id: "ancora-portatile", icon: "⚓", name: "Ancora Portatile", type: "Blocco", effect: "Ferma una fuga, una caduta o un veicolo in movimento." }
  ],
  pepita: [
    { id: "setaccio-fortuna", icon: "❖", name: "Setaccio della Fortuna", type: "Tesoro", effect: "Pesca tre tesori, scegline uno e rimetti gli altri nel mazzo." },
    { id: "pepita-canta", icon: "♦", name: "Pepita che Canta", type: "Ricerca", effect: "Indica se nella zona esiste un tesoro raro o un falso." },
    { id: "sacchetto-doppio", icon: "▣", name: "Sacchetto a Doppio Fondo", type: "Bottino", effect: "Raddoppia le monete di un tesoro comune appena trovato." }
  ],
  gigi: [
    { id: "piuma-eco", icon: "〽", name: "Piuma dell'Eco", type: "Imitazione", effect: "Ripeti perfettamente una voce e supera una guardia senza combattere." },
    { id: "cracker-comando", icon: "✤", name: "Cracker del Comando", type: "Pappagallo", effect: "Il pappagallo distrae un nemico: annulla il suo prossimo attacco." },
    { id: "maschera-risata", icon: "☻", name: "Maschera della Risata", type: "Diversivo", effect: "Trasforma una scena pericolosa in una prova di Astuzia soglia 5." }
  ],
  nerina: [
    { id: "lanterna-ombra", icon: "✺", name: "Lanterna d'Ombra", type: "Esplorazione", effect: "Rivela trappole e passaggi segreti senza farti notare." },
    { id: "mantello-notte", icon: "◐", name: "Mantello della Notte", type: "Furtività", effect: "Attraversa una zona sorvegliata senza prova e porta con te un compagno." },
    { id: "gesso-silenzioso", icon: "⌁", name: "Gesso Silenzioso", type: "Traccia", effect: "Segna una via sicura: la ciurma può tornare indietro senza eventi." }
  ],
  arturo: [
    { id: "bussola-contraria", icon: "↻", name: "Bussola Contraria", type: "Invenzione", effect: "Inverti l'effetto negativo di un evento in un piccolo vantaggio." },
    { id: "molla-meraviglie", icon: "⌇", name: "Molla delle Meraviglie", type: "Meccanismo", effect: "Ripara o attiva un congegno antico senza spendere monete." },
    { id: "occhiali-possibilita", icon: "◎", name: "Occhiali delle Possibilità", type: "Idea", effect: "Proponi una soluzione impossibile: il Master la rende possibile con soglia 6." }
  ]
};

const TUTORIAL_STEPS = [
  { icon: "☠", kicker: "Passo 1 · Preparazione", title: "Crea la ciurma", text: "Apri Giocatori → Ciurma. Inserisci il nome di ogni bambino e assegna un pirata diverso. Da 6 a 10 giocatori è il gruppo ideale.", tip: "Lascia scegliere il personaggio guardando prima i ritratti: l'identificazione rende la storia più coinvolgente." },
  { icon: "⚓", kicker: "Passo 2 · Inizio", title: "Apri un nuovo giorno", text: "Vai nella Plancia Master e premi Nuovo giorno. L'app sceglie la missione, mostra il numero di turni e azzera gli oggetti speciali.", tip: "Leggi ad alta voce il testo della missione e chiedi alla ciurma quale rotta vuole seguire." },
  { icon: "✦", kicker: "Passo 3 · Turno", title: "Scegli cosa accade", text: "Usa Evento, Combattimento, Cerca tesoro, Quest, Mercante o Riposo. Ogni scelta fa avanzare la giornata e prepara una prova.", tip: "Non cercare la scelta perfetta: segui l'idea più divertente proposta dai bambini." },
  { icon: "⚄", kicker: "Passo 4 · Prova", title: "Fate rotolare il dado vero", text: "Seleziona il bambino che agisce. Lui tira 1d6 sul tavolo; tu inserisci il numero uscito. L'app aggiunge Coraggio, Astuzia o Fortuna e registra l'esito.", tip: "Un fallimento non elimina mai un pirata: introduce un costo, un guaio o una nuova possibilità narrativa." },
  { icon: "❖", kicker: "Passo 5 · Carte", title: "Ricorda gli oggetti", text: "Apri Giocatori → Oggetti. Ogni membro ha tre carte personali, utilizzabili una volta nel giorno. Premi Usa questa carta quando entra in gioco.", tip: "Invita i bambini a descrivere come impiegano l'oggetto: l'effetto è una scintilla per inventare la scena." },
  { icon: "✎", kicker: "Passo 6 · Chiusura", title: "Conserva l'avventura", text: "Nel menu Master trovi Quest, Diario e Stampa. Quest prepara la scena, il Diario conserva ogni scelta e Stampa crea i materiali fisici.", tip: "Chiudi la sessione con una domanda: qual è stato il momento più coraggioso o più buffo della giornata?" }
];

/* Isole e quest arrivano dal motore modulare (engine/pirati-core.js).
   I contenuti veri sono in content/pack-*.js. Qui teniamo solo dei riferimenti
   comodi con gli stessi nomi di prima, così il resto del codice non cambia. */
const QUEST_ISLANDS = PIRATI.islands;

const CYCLE_ONE_QUESTS = PIRATI.quests;

/* La domanda collaborativa ora vive dentro ogni quest (campo groupChallenge). */
function questGroupChallenge(quest) {
  return (quest && quest.groupChallenge) || "";
}

const STORAGE_KEY = "pirati-master-state-v1";

const defaultState = {
  day: 1,
  fame: 0,
  players: [],
  selectedPlayerId: null,
  usedSpecialItems: {},
  crew: {
    grade: 1,
    coins: 0,
    trophies: [],   // [{ id, questId, day }]
    loot: [],       // [{ id, questId, day }]
    powers: [],     // [{ id, questId, day }]
    readingLevel: "facile",
    cardUse: {},        // { powerId: token }  quali carte sono già state giocate nel periodo
    encounterCount: 0,  // contatore incontri/quest, per il cooldown "quest"
    minQuestRollers: 2  // quanti pirati fa tirare il sistema in una quest
  },
  schoolCalendar: {
    week: 1,
    weekday: 1      // 1 = Lunedì ... 5 = Venerdì
  },
  crostone: {
    today: null,    // { wordId, day, status: "aperta" | "vinta" | "persa" }
    taccuino: [],    // [{ wordId, day }]  parole non indovinate, da ripetere
    libro: [],       // [{ wordId, day, recuperata }]  parole archiviate (imparate)
    pass: [],        // [day, ...]  giorni in cui la ciurma ha ottenuto il lasciapassare
    usate: []        // [wordId, ...]  parole già uscite (non tornano)
  },
  voyage: {
    cursor: { at: "node", node: "porto" },
    choosing: null,
    pending: null,
    lastRoll: null,
    moveRoll: { rolls: {} },
    message: "La ciurma è al Porto del Teschio. Scegliete la rotta, poi tutti i pirati tirano per salpare."
  },
  questCampaign: {
    cycle: 1,
    selectedIslandId: "rovine",
    revealedQuestId: null,
    completedQuestIds: [],
    supplies: 8,
    resolution: null
  },
  session: {
    missionId: "mappa-strappata",
    turn: 0,
    danger: 0,
    maxTurns: 12,
    repeatedAction: "",
    repeatedCount: 0,
    searchedZones: 0,
    current: null,
    history: []
  },
  log: []
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(defaultState);
  try {
    return withDefaults(JSON.parse(saved));
  } catch (error) {
    // Non cancellare il salvataggio: tienilo da parte e segnala in console.
    console.error("[Pirati] Salvataggio non caricato:", error);
    try { localStorage.setItem(STORAGE_KEY + "-backup", saved); } catch (e) {}
    return clone(defaultState);
  }
}

/* Fonde un salvataggio con la struttura di default, anche sui blocchi annidati:
   così i salvataggi vecchi ricevono i campi nuovi (crew, ecc.) senza rompersi. */
function withDefaults(saved) {
  const base = clone(defaultState);
  const merged = { ...base, ...saved };
  ["crew", "questCampaign", "session", "schoolCalendar", "voyage", "crostone"].forEach((key) => {
    merged[key] = { ...base[key], ...(saved && saved[key] ? saved[key] : {}) };
  });
  ["taccuino", "libro", "pass", "usate"].forEach((key) => {
    if (!Array.isArray(merged.crostone[key])) merged.crostone[key] = [];
  });
  if (!merged.voyage.cursor || typeof merged.voyage.cursor !== "object") {
    merged.voyage.cursor = { at: "node", node: "porto" };
  }
  ["trophies", "loot", "powers"].forEach((key) => {
    if (!Array.isArray(merged.crew[key])) merged.crew[key] = [];
  });
  if (!merged.crew.cardUse || typeof merged.crew.cardUse !== "object") merged.crew.cardUse = {};
  if (typeof merged.crew.encounterCount !== "number") merged.crew.encounterCount = 0;
  (merged.players || []).forEach((player) => {
    if (!player.growth || typeof player.growth !== "object") player.growth = {};
    ["coraggio", "astuzia", "fortuna"].forEach((s) => {
      if (typeof player.growth[s] !== "number") player.growth[s] = 0;
    });
    if (typeof player.questsPlayed !== "number") player.questsPlayed = 0;
    if (typeof player.active !== "boolean") player.active = true;
  });
  if (merged.voyage && !merged.voyage.moveRoll) merged.voyage.moveRoll = { rolls: {} };
  return merged;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getMission() {
  return DATA.missions.find((mission) => mission.id === state.session.missionId) || DATA.missions[0];
}

function getCharacter(id) {
  return DATA.characters.find((character) => character.id === id);
}

/* Nemici: dal catalogo modulare (catalog/nemici.js), con fallback ai dati storici. */
function allEnemies() {
  return (PIRATI.enemies && PIRATI.enemies.length) ? PIRATI.enemies : DATA.enemies;
}
function theBoss() {
  return PIRATI.boss || DATA.enemies[DATA.enemies.length - 1];
}

function selectedPlayer() {
  return state.players.find((player) => player.id === state.selectedPlayerId) || state.players[0] || null;
}

function pushLog(text) {
  const entry = {
    day: state.day,
    turn: state.session.turn,
    text,
    time: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  };
  state.log.unshift(entry);
  state.log = state.log.slice(0, 80);
}

function snapshot() {
  state.session.history.push(JSON.stringify({
    day: state.day,
    fame: state.fame,
    session: state.session,
    log: state.log
  }));
  state.session.history = state.session.history.slice(-12);
}

function restoreSnapshot() {
  const raw = state.session.history.pop();
  if (!raw) return;
  const restored = JSON.parse(raw);
  state.day = restored.day;
  state.fame = restored.fame;
  state.session = restored.session;
  state.log = restored.log;
  saveState();
  render();
}

function applyAction(action) {
  snapshot();
  const session = state.session;
  const mission = getMission();
  session.turn += 1;

  if (session.repeatedAction === action) {
    session.repeatedCount += 1;
  } else {
    session.repeatedAction = action;
    session.repeatedCount = 1;
  }

  let dangerGain = action === "rest" ? -1 : 1;
  if (session.repeatedCount >= 2 && ["treasure", "market", "rest"].includes(action)) {
    dangerGain += session.repeatedCount;
  }
  if (session.turn > mission.turns) dangerGain += 2;
  session.danger = Math.max(0, Math.min(12, session.danger + dangerGain));

  let result;
  if (action === "event") result = drawEvent();
  if (action === "combat") result = drawCombat();
  if (action === "treasure") result = drawTreasure();
  if (action === "quest") result = drawQuest();
  if (action === "market") result = drawMarket();
  if (action === "rest") result = drawRest();

  if (session.danger >= 10 && action !== "combat") {
    const enemy = theBoss();
    result.extra = `Allarme massimo: arriva ${enemy.title}. Soglia ${enemy.threat}.`;
  }

  session.current = result;
  pushLog(`${result.title}: ${result.text}${result.extra ? " " + result.extra : ""}`);
  saveState();
  render();
}

function drawEvent() {
  const event = pick(DATA.events);
  const roll = suggestedRollForEvent(event);
  return {
    kind: "Evento",
    title: event.title,
    text: event.text,
    tags: [event.type, `Pericolo ${state.session.danger}`],
    roll
  };
}

function drawCombat() {
  const roster = allEnemies();
  const enemyPool = roster.filter((enemy) => enemy.threat <= 6 + state.session.danger);
  const enemy = pick(enemyPool.length ? enemyPool : roster);
  return {
    kind: "Combattimento",
    title: enemy.title,
    text: `Soglia ${enemy.threat}. Ogni pirata puo attaccare, aiutare, distrarre o tentare una manovra rischiosa.`,
    tags: [`Ricompensa: ${enemy.reward}`, enemy.trick],
    roll: { stat: "coraggio", target: enemy.threat, label: "Attacco, difesa o manovra rischiosa" }
  };
}

function drawTreasure() {
  const session = state.session;
  session.searchedZones += 1;
  const farmingPenalty = Math.max(0, session.searchedZones - 2);
  const rareAllowed = session.danger >= 3 || session.searchedZones <= 2;
  const pool = DATA.treasures.filter((treasure) => rareAllowed || treasure.rarity === "Comune");
  const treasure = pick(pool);
  if (farmingPenalty > 0) session.danger = Math.min(12, session.danger + farmingPenalty);
  return {
    kind: "Tesoro",
    title: treasure.title,
    text: `${treasure.text} ${farmingPenalty ? "Zona gia sfruttata: ricompensa ridotta o Pericolo extra." : ""}`.trim(),
    tags: [treasure.rarity, `Ricerche oggi: ${session.searchedZones}`],
    roll: { stat: "fortuna", target: 5 + farmingPenalty, label: "Scavare, cercare indizi o aprire il forziere" }
  };
}

function drawQuest() {
  const quest = pick(DATA.quests);
  const target = getMission().difficulty + Math.floor(state.session.danger / 4);
  return {
    kind: "Quest",
    title: "Incarico rapido",
    text: `${quest} Soglia consigliata ${target}. Successo: indizio, moneta o Fama. Fallimento: scegli tra Pericolo +1 o perdita di tempo.`,
    tags: ["Scelta di gruppo", "No farming"],
    roll: { stat: "astuzia", target, label: "Prova scelta dal Master in base alla soluzione proposta" }
  };
}

function drawMarket() {
  const prices = state.session.repeatedCount > 1 ? "Prezzi alti: +1 moneta perche la ciurma insiste troppo." : "Prezzi normali.";
  return {
    kind: "Mercante",
    title: "Bancarella del Porto",
    text: `${prices} Oggetto comune 2 monete, oggetto raro 5 monete, indizio 3 monete.`,
    tags: ["Limite: un acquisto utile per bambino", "Ripetere alza Pericolo"],
    roll: { stat: "astuzia", target: 7, label: "Contrattare, distrarre o ottenere uno sconto" }
  };
}

function drawRest() {
  return {
    kind: "Riposo",
    title: "Pausa in Coperta",
    text: "Ogni pirata recupera un problema leggero. Se riposano due volte di fila, la ciurma rivale avanza.",
    tags: ["Pericolo -1", "Non cura missioni fallite"],
    roll: { stat: "fortuna", target: 6, label: "Raccontare una scena di riposo per ottenere un piccolo bonus" }
  };
}

function suggestedRollForEvent(event) {
  const baseTarget = getMission().difficulty + Math.floor(state.session.danger / 5);
  const typeToStat = {
    Mare: "fortuna",
    Isola: "astuzia",
    Indizio: "astuzia",
    Quest: "astuzia",
    Porto: "astuzia",
    Pericolo: "coraggio",
    Trappola: "astuzia",
    Comico: "fortuna",
    Nemico: "coraggio",
    Mistero: "fortuna",
    Tesoro: "fortuna"
  };
  return {
    stat: typeToStat[event.type] || "fortuna",
    target: Math.max(4, baseTarget),
    label: "Prova suggerita dall'evento"
  };
}

function startNewSession() {
  snapshot();
  const nextMission = DATA.missions[(DATA.missions.findIndex((mission) => mission.id === state.session.missionId) + 1) % DATA.missions.length];
  state.day += 1;
  state.session = {
    missionId: nextMission.id,
    turn: 0,
    danger: 0,
    maxTurns: nextMission.turns,
    repeatedAction: "",
    repeatedCount: 0,
    searchedZones: 0,
    current: {
      kind: "Missione",
      title: nextMission.title,
      text: nextMission.text,
      tags: [`Soglia ${nextMission.difficulty}`, `${nextMission.turns} turni`]
    },
    history: state.session.history
  };
  pushLog(`Inizia il giorno ${state.day}: ${nextMission.title}.`);
  saveState();
  render();
}

function addPlayer() {
  const nameInput = $("#player-name");
  const characterSelect = $("#character-select");
  const name = nameInput.value.trim() || `Pirata ${state.players.length + 1}`;
  const characterId = characterSelect.value;
  if (state.players.length >= 10) return;
  if (state.players.some((player) => player.characterId === characterId)) return;
  const player = {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    characterId,
    coins: 0,
    notes: "",
    growth: { coraggio: 0, astuzia: 0, fortuna: 0 },
    questsPlayed: 0
  };
  state.players.push(player);
  state.selectedPlayerId = player.id;
  nameInput.value = "";
  pushLog(`${name} entra nella ciurma come ${getCharacter(characterId).name}.`);
  saveState();
  render();
}

function removePlayer(id) {
  state.players = state.players.filter((player) => player.id !== id);
  if (state.selectedPlayerId === id) state.selectedPlayerId = state.players[0]?.id || null;
  saveState();
  render();
}

/* I pirati "in gioco" oggi: quelli non messi Assente. Un pirata assente
   tiene tutti i suoi progressi e torna in gioco quando riappare. */
function activePlayers() {
  return state.players.filter((player) => player.active !== false);
}

function togglePlayerActive(id) {
  const player = state.players.find((p) => p.id === id);
  if (!player) return;
  player.active = player.active === false ? true : false;
  pushLog(`${player.name} è ${player.active === false ? "assente" : "di nuovo in gioco"}.`);
  saveState();
  render();
}

/* Aggiunge in fretta una ciurma finta per provare il gioco. */
function seedTestCrew() {
  const names = ["Leo", "Mia", "Sara", "Nina", "Bea", "Tom", "Gio"];
  names.forEach((name) => {
    if (state.players.length >= 10) return;
    if (state.players.some((p) => p.name === name)) return;
    const taken = new Set(state.players.map((p) => p.characterId));
    const character = DATA.characters.find((c) => !taken.has(c.id));
    if (!character) return;
    state.players.push({
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name, characterId: character.id, coins: 0, notes: "",
      growth: { coraggio: 0, astuzia: 0, fortuna: 0 }, questsPlayed: 0
    });
  });
  state.selectedPlayerId = state.players[0]?.id || null;
  pushLog("Aggiunta una ciurma di prova.");
  saveState();
  render();
}

function recordPhysicalRoll(die) {
  const player = selectedPlayer();
  const stat = $("#dice-stat").value;
  const bonus = Number($("#dice-bonus").value || 0);
  const target = Number($("#dice-target").value || getMission().difficulty);
  if (!player) {
    $("#dice-result").textContent = `Sul dado e uscito ${die}. Aggiungi o seleziona un pirata per calcolare il totale.`;
    return;
  }
  const character = getCharacter(player.characterId);
  const total = die + character.stats[stat] + bonus;
  const outcome = total >= target ? "SUCCESSO" : "FALLIMENTO";
  const text = `${player.name}: dado ${die} + ${character.stats[stat]} ${stat} + ${bonus} bonus = ${total}. Soglia ${target}: ${outcome}.`;
  $("#dice-result").textContent = text;
  pushLog(`Tiro fisico - ${text}`);
  saveState();
  renderLog();
}

function showSaveMessage(text) {
  const message = $("#save-message");
  if (!message) return;
  message.textContent = text;
}

function exportSave() {
  const payload = {
    game: "Pirati: Isole del Teschio d'Oro",
    version: 1,
    exportedAt: new Date().toISOString(),
    state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `pirati-salvataggio-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showSaveMessage("Salvataggio esportato.");
}

function importSave(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(String(reader.result));
      const importedState = payload.state || payload;
      if (!importedState.session || !Array.isArray(importedState.players) || !Array.isArray(importedState.log)) {
        throw new Error("Formato salvataggio non valido.");
      }
      state = withDefaults(importedState);
      state.session.history = [];
      saveState();
      render();
      showSaveMessage("Salvataggio importato.");
    } catch (error) {
      showSaveMessage("Importazione fallita: file non valido.");
    }
  });
  reader.readAsText(file);
}

function renderMission() {
  const mission = getMission();
  $("#active-mission").innerHTML = `
    <h3>${mission.title}</h3>
    <p>${mission.text}</p>
    <div class="mission-meta">
      <span>Soglia ${mission.difficulty}</span>
      <span>${mission.turns} turni</span>
      <span>Vittoria: ${mission.win}</span>
    </div>
  `;
  $("#day-value").textContent = state.day;
  $("#turn-value").textContent = `${state.session.turn}/${mission.turns}`;
  $("#danger-value").textContent = state.session.danger;
  $("#fame-value").textContent = state.fame;
  $("#danger-fill").style.width = `${Math.min(100, (state.session.danger / 12) * 100)}%`;
}

function renderResult() {
  const current = state.session.current || {
    kind: "Pronto",
    title: "Scegli la prossima azione",
    text: "Usa i pulsanti Master per far avanzare il giorno. Le azioni ripetute aumentano il Pericolo.",
    tags: ["30 minuti", "Anti-farming attivo"]
  };
  $("#result-card").innerHTML = `
    <p class="eyebrow">${current.kind}</p>
    <h3>${current.title}</h3>
    <p>${current.text}</p>
    ${current.extra ? `<p><strong>${current.extra}</strong></p>` : ""}
    <div class="tag-row">${(current.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
  `;
  renderRollPrompt(current);
}

function renderRollPrompt(current) {
  const roll = current.roll || { stat: "fortuna", target: getMission().difficulty, label: "Prova libera scelta dal Master" };
  $("#roll-prompt").textContent = `${roll.label}: tira 1d6 + ${roll.stat} contro soglia ${roll.target}.`;
  $("#dice-stat").value = roll.stat;
  $("#dice-target").value = roll.target;
}

function renderCrew() {
  const activeCrew = $("#active-crew");
  if (!state.players.length) {
    activeCrew.innerHTML = `<p class="helper-text">Aggiungi da 6 a 10 giocatori nella sezione Ciurma.</p>`;
  } else {
    activeCrew.innerHTML = state.players.map((player) => {
      const character = getCharacter(player.characterId);
      return `
        <button type="button" class="crew-card ${state.selectedPlayerId === player.id ? "is-selected" : ""}" data-select-player="${player.id}">
          <h3>${player.name}</h3>
          <p>${character.name} - ${character.role}</p>
          ${statsMarkup(character)}
        </button>
      `;
    }).join("");
  }

  const activeN = activePlayers().length;
  $("#player-list").innerHTML = state.players.length ? `
    <p class="crew-presence">In gioco oggi: <strong>${activeN}</strong> di ${state.players.length}. Metti <em>Assente</em> chi non c'è: tiene tutti i progressi e rientra quando torna.</p>
    ${state.players.map((player) => {
      const character = getCharacter(player.characterId);
      const away = player.active === false;
      return `
      <div class="player-row ${away ? "is-away" : ""}">
        <div>
          <h3>${player.name}</h3>
          <p>${character.name} - ${character.role}</p>
        </div>
        <div class="button-row">
          <button type="button" class="secondary-button ${away ? "" : "is-on"}" data-toggle-active="${player.id}">${away ? "Assente" : "In gioco"}</button>
          <button type="button" class="secondary-button" data-remove-player="${player.id}">Rimuovi</button>
        </div>
      </div>
    `;
    }).join("")}` : `<p class="helper-text">Nessun giocatore ancora inserito.</p>`;

  const used = new Set(state.players.map((player) => player.characterId));
  $("#character-select").innerHTML = DATA.characters.map((character) => {
    const disabled = used.has(character.id) ? "disabled" : "";
    return `<option value="${character.id}" ${disabled}>${character.name} - ${character.role}</option>`;
  }).join("");
}

function statsMarkup(character) {
  return `
    <div class="stat-line">
      <span class="stat-pill">Coraggio<strong>${character.stats.coraggio}</strong></span>
      <span class="stat-pill">Astuzia<strong>${character.stats.astuzia}</strong></span>
      <span class="stat-pill">Fortuna<strong>${character.stats.fortuna}</strong></span>
    </div>
  `;
}

let characterCarouselIndex = 0;
let characterDetailsOpen = false;
let previousCarouselDistances = new Map();
let itemsCharacterId = null;
let expandedItemId = null;
let tutorialStepIndex = 0;
let treasuryTab = "trofei";
let lastShownCoins = null;

function circularDistance(index, active, total) {
  let distance = index - active;
  if (distance > total / 2) distance -= total;
  if (distance < -total / 2) distance += total;
  return distance;
}

function selectCarouselCharacter(index) {
  characterCarouselIndex = (index + DATA.characters.length) % DATA.characters.length;
  characterDetailsOpen = false;
  renderLibrary();
}

function carouselPose(distance) {
  const absDistance = Math.abs(distance);
  const spacing = window.innerWidth <= 520 ? 185 : 255;
  return {
    xPercent: -50,
    x: distance * spacing,
    y: absDistance * 42,
    rotationY: distance * -18,
    scale: 1 - absDistance * 0.13,
    opacity: absDistance <= 2 ? 1 - absDistance * 0.25 : 0,
    zIndex: 10 - absDistance
  };
}

function animateCarousel() {
  const cards = $$("[data-carousel-card]");
  cards.forEach((card) => {
    const index = Number(card.dataset.carouselCard);
    const nextDistance = circularDistance(index, characterCarouselIndex, DATA.characters.length);
    const previousDistance = previousCarouselDistances.has(index)
      ? previousCarouselDistances.get(index)
      : nextDistance;
    const fromPose = carouselPose(previousDistance);
    const toPose = carouselPose(nextDistance);
    previousCarouselDistances.set(index, nextDistance);

    if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(card, fromPose, { ...toPose, duration: 0.72, ease: "power3.inOut", overwrite: true });
    } else {
      Object.assign(card.style, {
        transform: `translate(-50%, ${toPose.y}px) translateX(${toPose.x}px) rotateY(${toPose.rotationY}deg) scale(${toPose.scale})`,
        opacity: toPose.opacity,
        zIndex: toPose.zIndex
      });
    }
  });
}

function renderLibrary() {
  const total = DATA.characters.length;
  $("#character-names").innerHTML = DATA.characters.map((character, index) => `
    <button type="button" role="tab" aria-selected="${index === characterCarouselIndex}" class="character-name ${index === characterCarouselIndex ? "is-active" : ""}" data-character-jump="${index}">${character.name.split(" ")[0]}</button>
  `).join("");

  $("#character-library").innerHTML = DATA.characters.map((character, index) => {
    const distance = circularDistance(index, characterCarouselIndex, total);
    const visible = Math.abs(distance) <= 2;
    return `
      <article class="character-card ${distance === 0 ? "is-active" : ""} ${distance === 0 && characterDetailsOpen ? "is-reading" : ""}" data-carousel-card="${index}" aria-hidden="${!visible}">
        <div class="character-portrait portrait-${index}" role="img" aria-label="Ritratto di ${character.name}"></div>
        <div class="character-copy">
          <p class="character-role">${character.role}</p>
          <h3>${character.name}</h3>
          ${distance === 0 ? `<button type="button" class="read-character-button" data-read-character aria-expanded="${characterDetailsOpen}">${characterDetailsOpen ? "Torna al ritratto" : "Leggi le caratteristiche"}</button>` : ""}
          <div class="character-details" aria-hidden="${!(distance === 0 && characterDetailsOpen)}">
            ${statsMarkup(character)}
            <p class="character-skill"><strong>Potere speciale</strong>${character.skill}</p>
            <p class="character-limit"><strong>Punto debole</strong>${character.flaw}</p>
            <p class="character-goal"><strong>La tua missione</strong>${character.goal}</p>
          </div>
        </div>
      </article>`;
  }).join("");

  animateCarousel();

  const gallery = $("#character-gallery");
  if (gallery && !gallery.dataset.built) {
    gallery.innerHTML = DATA.characters.map((character, index) => `
      <button type="button" class="gallery-card" data-character-jump="${index}" title="${character.name}">
        <img src="${character.image}" alt="${character.name}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'gallery-fallback',textContent:'${character.name}'}))">
      </button>`).join("");
    gallery.dataset.built = "1";
  }
  gallery && $$("#character-gallery .gallery-card").forEach((btn, i) => btn.classList.toggle("is-current", i === characterCarouselIndex));

  const namesTrack = $("#character-names");
  const activeName = $(".character-name.is-active");
  if (namesTrack && activeName) {
    const targetLeft = activeName.offsetLeft - (namesTrack.clientWidth - activeName.offsetWidth) / 2;
    namesTrack.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }
}

function getItemOwners() {
  return state.players.map((player) => ({
    ownerKey: player.id,
    playerName: player.name,
    character: getCharacter(player.characterId)
  })).filter((owner) => owner.character);
}

function itemUsageKey(ownerKey, itemId) {
  return `${ownerKey}:${itemId}`;
}

function renderItems() {
  const owners = getItemOwners();
  $("#items-day").textContent = state.day;

  if (!owners.length) {
    $("#item-crew-tabs").innerHTML = "";
    $("#item-owner").innerHTML = `<p class="helper-text">Prima aggiungi almeno un bambino alla Ciurma: qui compariranno i suoi tre oggetti personali.</p>`;
    $("#special-item-grid").innerHTML = "";
    return;
  }

  if (!itemsCharacterId || !owners.some((owner) => owner.character.id === itemsCharacterId)) {
    itemsCharacterId = owners[0].character.id;
  }
  const owner = owners.find((entry) => entry.character.id === itemsCharacterId) || owners[0];
  const items = SPECIAL_ITEMS[owner.character.id] || [];

  $("#item-crew-tabs").innerHTML = owners.map((entry) => `
    <button type="button" role="tab" aria-selected="${entry.character.id === owner.character.id}" class="item-crew-tab ${entry.character.id === owner.character.id ? "is-active" : ""}" data-item-character="${entry.character.id}">
      <span class="mini-portrait portrait-${DATA.characters.findIndex((character) => character.id === entry.character.id)}"></span>
      <span><strong>${entry.playerName}</strong><small>${entry.character.name}</small></span>
    </button>
  `).join("");

  $("#item-owner").innerHTML = `<p class="eyebrow">Baule di ${owner.playerName}</p><h3>${owner.character.name}</h3><p>Tre carte personali, una a testa da giocare ogni giorno.</p>`;
  $("#special-item-grid").innerHTML = items.map((item, index) => {
    const used = state.usedSpecialItems[itemUsageKey(owner.ownerKey, item.id)] === state.day;
    const expanded = expandedItemId === item.id;
    return `
      <article class="special-item-card ${used ? "is-used" : ""} ${expanded ? "is-expanded" : ""}" data-item-card="${item.id}" style="--item-index:${index}">
        <div class="item-card-art">
          <img src="${window.PIRATI_ASSET(`oggetti/${item.id}.webp`)}" alt="${item.name}: ${item.effect}" onerror="this.closest('.item-card-art').classList.add('no-img'); this.remove();">
          <span class="item-card-fallback" aria-hidden="true">${item.icon}<b>${item.name}</b></span>
        </div>
        <p class="item-card-status">${used ? "Usata oggi · torna domani" : "Pronta"}</p>
        <div class="item-card-details" aria-hidden="${!expanded}">
          <p>${item.effect}</p>
          <button type="button" class="use-item-button" data-use-item="${item.id}" data-owner-key="${owner.ownerKey}" data-character-id="${owner.character.id}" ${used ? "disabled" : ""}>${used ? "Torna domani" : "Usa questa carta"}</button>
        </div>
        <button type="button" class="expand-item-button" data-expand-item="${item.id}" aria-expanded="${expanded}">${expanded ? "Richiudi" : "Cosa fa"}</button>
      </article>`;
  }).join("");

  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo(".special-item-card", { y: 35, opacity: 0, rotationY: -8 }, { y: 0, opacity: 1, rotationY: 0, duration: 0.55, stagger: 0.09, ease: "back.out(1.4)" });
  }
}

function useSpecialItem(ownerKey, characterId, itemId) {
  const item = (SPECIAL_ITEMS[characterId] || []).find((entry) => entry.id === itemId);
  const owner = state.players.find((player) => player.id === ownerKey);
  if (!item || !owner) return;
  const key = itemUsageKey(ownerKey, itemId);
  if (state.usedSpecialItems[key] === state.day) return;

  state.usedSpecialItems[key] = state.day;
  pushLog(`${owner.name} usa ${item.name}: ${item.effect}`);
  saveState();
  $("#item-message").textContent = `${item.name} attivato. Tornerà disponibile al giorno ${state.day + 1}.`;
  renderItems();
  if (window.gsap) gsap.fromTo("#item-message", { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 });
}

/* =========================================================================
   Tesoro della Ciurma: Sala dei Trofei + Baule dei Poteri
   ===================================================================== */

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateNumber(el, from, to) {
  if (!el) return;
  if (from === to || !window.gsap || prefersReducedMotion()) { el.textContent = to; return; }
  const box = { v: from };
  gsap.to(box, { v: to, duration: 0.8, ease: "power1.out", onUpdate: () => { el.textContent = Math.round(box.v); } });
}

const POWER_GROUPS = [
  { key: "carta", label: "Carte", icon: "🃏" },
  { key: "magia", label: "Magie", icon: "✨" },
  { key: "arma", label: "Armi", icon: "⚔️" },
  { key: "marchingegno", label: "Marchingegni", icon: "⚙️" }
];
const COOLDOWN_LABEL = { quest: "1 volta a quest", giorno: "1 volta al giorno", permanente: "sempre attivo" };

function ownedPowerIds() {
  return new Set((state.crew.powers || []).map((entry) => entry.id));
}

function renderTreasury() {
  const crew = state.crew;
  const completed = state.questCampaign.completedQuestIds.length;
  const gradeStep = PIRATI.gradeForCompleted(completed);
  const nextStep = PIRATI.nextGrade(completed);
  const viewActive = $("#view-tesoreria") && $("#view-tesoreria").classList.contains("is-active");

  if ($("#tesoreria-grade")) $("#tesoreria-grade").textContent = gradeStep.grade;
  if ($("#tesoreria-grade-name")) $("#tesoreria-grade-name").textContent = gradeStep.name;

  const coinsEl = $("#tesoreria-coins");
  if (coinsEl) {
    const previous = lastShownCoins == null ? crew.coins : lastShownCoins;
    if (viewActive) animateNumber(coinsEl, previous, crew.coins);
    else coinsEl.textContent = crew.coins;
    lastShownCoins = crew.coins;
  }

  const fill = $("#grade-track-fill");
  const label = $("#grade-track-label");
  if (fill && label) {
    if (nextStep) {
      const span = nextStep.questsNeeded - gradeStep.questsNeeded;
      const pct = span > 0 ? Math.min(100, Math.max(0, ((completed - gradeStep.questsNeeded) / span) * 100)) : 100;
      fill.style.width = `${pct}%`;
      label.textContent = `Mancano ${nextStep.questsNeeded - completed} quest al Grado ${nextStep.grade} · ${nextStep.name}`;
    } else {
      fill.style.width = "100%";
      label.textContent = `Grado massimo raggiunto: ${gradeStep.name}!`;
    }
  }

  $$("[data-treasury-tab]").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.treasuryTab === treasuryTab));
  const panel = $("#treasury-panel");
  if (!panel) return;
  panel.innerHTML = treasuryTab === "poteri" ? treasuryPowersMarkup()
    : treasuryTab === "potenza" ? treasuryScoreboardMarkup()
    : treasuryTrophiesMarkup();

  if (viewActive && window.gsap && !prefersReducedMotion()) {
    gsap.fromTo("#treasury-panel .pop-in", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, stagger: 0.03, ease: "back.out(1.4)" });
  }
}

function treasuryTrophiesMarkup() {
  const crew = state.crew;
  const allTrophies = PIRATI._state.rewards.trophy;
  const earned = new Map((crew.trophies || []).map((entry) => [entry.id, entry]));
  const lootOwned = (crew.loot || []).map((entry) => ({ entry, reward: PIRATI.reward(entry.id) })).filter((row) => row.reward);

  const trophyCards = allTrophies.map((trophy) => {
    const got = earned.get(trophy.id);
    if (got) {
      return `<article class="collectible pop-in is-earned">
        <span class="collectible-icon" aria-hidden="true">${trophy.icon}</span>
        <strong>${trophy.name}</strong>
        <small>${trophy.text}</small>
        <em>Giorno ${got.day}</em>
      </article>`;
    }
    return `<article class="collectible pop-in is-locked">
      <span class="collectible-icon" aria-hidden="true">?</span>
      <strong>Trofeo misterioso</strong>
      <small>Si conquista completando un'altra avventura.</small>
    </article>`;
  }).join("");

  const lootCards = lootOwned.length
    ? lootOwned.map(({ entry, reward }) => `<article class="collectible pop-in is-earned rarity-${reward.rarity}">
        <span class="collectible-icon" aria-hidden="true">${reward.icon}</span>
        <strong>${reward.name}</strong>
        <small>${reward.text}</small>
        <em>Giorno ${entry.day}</em>
      </article>`).join("")
    : `<p class="helper-text">Ancora nessun oggetto nel baule. Completa una quest per riempirlo.</p>`;

  return `
    <div class="treasury-section">
      <h3>Bottino della ciurma <span class="count-pill">${lootOwned.length}</span></h3>
      <div class="collectible-grid">${lootCards}</div>
    </div>
    <div class="treasury-section">
      <h3>Sala dei Trofei <span class="count-pill">${earned.size}/${allTrophies.length}</span></h3>
      <div class="collectible-grid">${trophyCards}</div>
    </div>`;
}

/* Etichetta breve del "potere numerico" di una carta (null se non ne ha uno). */
function powerNumber(power) {
  const p = power.play || {};
  if (p.type === "bonus") return `+${p.amount}${p.stat ? " " + titleCase(p.stat) : ""}`;
  if (p.type === "teambonus") return `+${p.amount} ciurma`;
  if (p.type === "move") return `Nave +${p.spaces}`;
  if (p.type === "auto") return "Successo";
  if (p.type === "skip") return "Salta";
  return null;
}

function treasuryPowersMarkup() {
  const crew = state.crew;
  const owned = ownedPowerIds();
  const ownedStamp = new Map((crew.powers || []).map((entry) => [entry.id, entry]));
  const grade = crew.grade || 1;

  const powerCardMarkup = (power) => {
    const isOwned = owned.has(power.id);
    const stamp = ownedStamp.get(power.id);
    const gradeLocked = !isOwned && !power.legendary && power.grade > grade;
    let statusText, statusKind, cardKind;
    if (isOwned) { statusText = `Conquistato · Giorno ${stamp.day}`; statusKind = "earned"; cardKind = "is-owned"; }
    else if (power.legendary) { statusText = "Impresa leggendaria"; statusKind = "legendary"; cardKind = "is-legendary-locked"; }
    else if (gradeLocked) { statusText = `Si sblocca al Grado ${power.grade}`; statusKind = "locked"; cardKind = "is-grade-locked"; }
    else { statusText = "Da trovare in missione"; statusKind = "findable"; cardKind = "is-findable"; }
    const tip = power.legendary && !isOwned ? power.howTo : `${power.name} — ${power.effect}`;
    return `<article class="power-card pop-in ${cardKind}" title="${tip}">
      <div class="power-card-art">
        <img src="${power.image}" alt="${power.name}: ${power.effect}" onerror="this.closest('.power-card-art').classList.add('no-img'); this.remove();">
        <span class="power-card-fallback" aria-hidden="true">${power.icon}<b>${power.name}</b></span>
      </div>
      <p class="power-status ${statusKind}">${statusText}</p>
    </article>`;
  };

  const groups = POWER_GROUPS.map((group) => {
    const powers = PIRATI.powers
      .filter((power) => power.category === group.key && !power.legendary)
      .sort((a, b) => a.grade - b.grade);
    if (!powers.length) return "";
    const haveCount = powers.filter((power) => owned.has(power.id)).length;
    return `<div class="treasury-section">
      <h3><span aria-hidden="true">${group.icon}</span> ${group.label} <span class="count-pill">${haveCount}/${powers.length}</span></h3>
      <div class="power-grid">${powers.map(powerCardMarkup).join("")}</div>
    </div>`;
  }).join("");

  const legendaries = PIRATI.powers.filter((p) => p.legendary);
  const legendarySection = legendaries.length ? `
    <div class="treasury-section legendary-section">
      <h3><span aria-hidden="true">✨</span> Carte Leggendarie <span class="count-pill">${legendaries.filter((p) => owned.has(p.id)).length}/${legendaries.length}</span></h3>
      <p class="treasury-hint">Non si pescano dalle quest. Si conquistano con un'impresa: passa il mouse sulla carta per sapere come.</p>
      <div class="power-grid">${legendaries.map(powerCardMarkup).join("")}</div>
    </div>` : "";

  return `<p class="treasury-hint">I poteri restano vostri per sempre. Salite di Grado completando le quest per sbloccarne di più forti.</p>${groups}${legendarySection}`;
}

const STAT_META = {
  coraggio: { icon: "🔥", label: "Coraggio" },
  astuzia:  { icon: "🧠", label: "Astuzia" },
  fortuna:  { icon: "🍀", label: "Fortuna" }
};

function treasuryScoreboardMarkup() {
  const players = state.players.slice().sort((a, b) => playerPower(b) - playerPower(a));
  if (!players.length) {
    return `<p class="helper-text">Aggiungi i bambini nella sezione Ciurma: qui vedrai la potenza di ognuno.</p>`;
  }

  const crewPower = players.reduce((sum, p) => sum + playerPower(p), 0);
  const crewGrowth = players.reduce((sum, p) => sum + playerTotalGrowth(p), 0);
  const crewQuests = players.reduce((sum, p) => sum + (p.questsPlayed || 0), 0);
  const topPower = playerPower(players[0]) || 1;

  const totals = `
    <div class="scoreboard-totals">
      <div><span>Potenza ciurma</span><strong>${crewPower}</strong></div>
      <div><span>Crescite totali</span><strong>${crewGrowth}</strong></div>
      <div><span>Grado</span><strong>${state.crew.grade}</strong></div>
      <div><span>Monete</span><strong>${state.crew.coins}</strong></div>
      <div><span>Trofei</span><strong>${state.crew.trophies.length}</strong></div>
      <div><span>Poteri</span><strong>${state.crew.powers.length}</strong></div>
    </div>`;

  const SCALE = 14; // larghezza massima barra = valore 14

  const rows = players.map((player, index) => {
    const character = getCharacter(player.characterId);
    const power = playerPower(player);
    const bars = STAT_KEYS.map((stat) => {
      const base = playerBaseStat(player, stat);
      const grown = playerGrowth(player, stat);
      const pas = passiveBonus(stat);
      const total = base + grown + pas;
      return `<div class="score-stat">
        <span class="score-stat-name">${STAT_META[stat].icon} ${STAT_META[stat].label}</span>
        <div class="score-bar" role="img" aria-label="${STAT_META[stat].label} ${total}">
          <i class="seg-base" style="width:${(base / SCALE) * 100}%"></i>
          <i class="seg-grow" style="width:${(grown / SCALE) * 100}%"></i>
          <i class="seg-pass" style="width:${(pas / SCALE) * 100}%"></i>
        </div>
        <strong class="score-stat-val">${total}</strong>
        <span class="score-steppers">
          <button type="button" data-award-growth data-player="${player.id}" data-stat="${stat}" data-delta="-1" aria-label="Togli crescita ${STAT_META[stat].label} a ${player.name}">−</button>
          <button type="button" data-award-growth data-player="${player.id}" data-stat="${stat}" data-delta="1" aria-label="Aggiungi crescita ${STAT_META[stat].label} a ${player.name}">+</button>
        </span>
      </div>`;
    }).join("");

    const charIndex = DATA.characters.findIndex((c) => c.id === player.characterId);
    return `<article class="score-row pop-in ${index === 0 ? "is-top" : ""}">
      <div class="score-id">
        <span class="score-avatar">
          <span class="score-portrait mini-portrait portrait-${charIndex}" role="img" aria-label="Ritratto di ${character ? character.name : player.name}"></span>
          <span class="score-rank">${index + 1}</span>
        </span>
        <div class="score-name">
          <strong>${player.name}</strong>
          <small>${character ? character.name : ""}${character ? " · " + character.role : ""}</small>
        </div>
        <div class="score-power" title="Coraggio + Astuzia + Fortuna">
          <span>Potenza</span>
          <strong>${power}</strong>
        </div>
      </div>
      <div class="score-stats">${bars}</div>
      <p class="score-foot">Avventure giocate: <b>${player.questsPlayed || 0}</b> · Crescite guadagnate: <b>${playerTotalGrowth(player)}</b></p>
    </article>`;
  }).join("");

  return `
    <p class="treasury-hint">La Potenza è Coraggio + Astuzia + Fortuna insieme. Ogni avventura completata dà +1 nella caratteristica giusta; i pulsanti + / − servono solo per correggere a mano.</p>
    <div class="scoreboard-legend">
      <span><i style="background:var(--sea)"></i>Base del personaggio</span>
      <span><i style="background:var(--gold)"></i>Crescite guadagnate</span>
      <span><i style="background:var(--green)"></i>Bonus dei poteri</span>
    </div>
    ${totals}
    <div class="scoreboard">${rows}</div>`;
}

/* =========================================================================
   MAPPA: navigazione della ciurma (una pedina per tutti)
   Il bambino tira il d6 vero, il Master inserisce il numero, la nave si sposta.
   Ci si ferma sulla prima casella speciale: il sistema dice cosa fare.
   ===================================================================== */

const SPACE_INFO = {
  mare:    { icon: "🌊", label: "Mare calmo" },
  costa:   { icon: "🚩", label: "Approdo" },
  evento:  { icon: "❔", label: "Evento" },
  mostro:  { icon: "👹", label: "Mostro" },
  assalto: { icon: "⚔️", label: "Assalto" },
  razzia:  { icon: "🪙", label: "Razzia" },
  tesoro:  { icon: "💎", label: "Tesoro" },
  quest:   { icon: "⭐", label: "Avventura" },
  porto:   { icon: "⚓", label: "Porto" }
};
const SPECIAL_SPACES = ["evento", "mostro", "assalto", "razzia", "tesoro", "quest"];

function voyage() { return state.voyage; }

function legSpaces(legId, dir) {
  const leg = PIRATI.mapLeg(legId);
  if (!leg) return [];
  return dir === -1 ? leg.spaces.slice().reverse() : leg.spaces.slice();
}
function legEndNode(legId, dir) {
  const leg = PIRATI.mapLeg(legId);
  return dir === -1 ? leg.from : leg.to;
}
function legStartNode(legId, dir) {
  const leg = PIRATI.mapLeg(legId);
  return dir === -1 ? leg.to : leg.from;
}
function loopSpaces(nodeId) {
  const node = PIRATI.mapNode(nodeId);
  return node && Array.isArray(node.loop) && node.loop[0] !== "porto" ? node.loop : [];
}

function nextIslandQuestId(islandId) {
  const done = new Set(state.questCampaign.completedQuestIds || []);
  const q = PIRATI.islandQuests(islandId).find((entry) => !done.has(entry.id));
  return q ? q.id : null;
}

function resolvedSpaceType(spaceRaw, islandId) {
  const type = String(spaceRaw).split(":")[0];
  if (type === "quest" && !nextIslandQuestId(islandId)) return "costa"; // isola già finita
  return type;
}

/* --- geometria: punto (x,y 0..100) della casella corrente ---------------- */

function lerp(a, b, t) { return a + (b - a) * t; }

function pointOfCursor(cur) {
  const map = PIRATI.map;
  if (!map) return { x: 50, y: 50 };
  if (cur.at === "node") {
    const n = map.nodes[cur.node];
    return { x: n.x, y: n.y };
  }
  if (cur.at === "leg") {
    const a = map.nodes[legStartNode(cur.leg, cur.dir)];
    const b = map.nodes[legEndNode(cur.leg, cur.dir)];
    const len = legSpaces(cur.leg, cur.dir).length;
    const t = (cur.i + 1) / (len + 1);
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }
  // loop: cerchietto attorno all'isola
  const n = map.nodes[cur.node];
  const len = Math.max(1, loopSpaces(cur.node).length);
  const ang = (cur.i / len) * Math.PI * 2 - Math.PI / 2;
  const r = 8;
  return { x: n.x + Math.cos(ang) * r, y: n.y + Math.sin(ang) * r };
}

/* --- avanzamento di un passo -------------------------------------------- */

function stepCursor(cur) {
  if (cur.at === "leg") {
    const spaces = legSpaces(cur.leg, cur.dir);
    if (cur.i + 1 < spaces.length) {
      const next = { at: "leg", leg: cur.leg, dir: cur.dir, i: cur.i + 1 };
      return { cursor: next, space: spaces[cur.i + 1] };
    }
    return { cursor: { at: "node", node: legEndNode(cur.leg, cur.dir) }, space: "arrivo" };
  }
  if (cur.at === "loop") {
    const spaces = loopSpaces(cur.node);
    if (cur.i + 1 < spaces.length) {
      const next = { at: "loop", node: cur.node, i: cur.i + 1 };
      return { cursor: next, space: spaces[cur.i + 1] };
    }
    return { cursor: { at: "node", node: cur.node }, space: "sbarco" };
  }
  return { cursor: cur, space: "fermo" };
}

function currentIslandId() {
  const cur = voyage().cursor;
  if (cur.at === "loop") return PIRATI.mapNode(cur.node).island;
  if (cur.at === "node") return PIRATI.mapNode(cur.node).island;
  return null;
}

/* Movimento: tutti i pirati in gioco tirano, la media = miglia nautiche. */
function setMoveDie(playerId, n) {
  const v = voyage();
  if (v.pending || v.choosing) return;
  v.moveRoll = v.moveRoll || { rolls: {} };
  if (v.moveRoll.rolls[playerId] === n) delete v.moveRoll.rolls[playerId];
  else v.moveRoll.rolls[playerId] = n;
  saveState();
  renderMap();
}

function doCrewMove() {
  const v = voyage();
  const roster = activePlayers();
  if (!roster.length) return;
  const rolls = roster.map((p) => Number(v.moveRoll && v.moveRoll.rolls[p.id]));
  if (rolls.some((n) => !(n >= 1 && n <= 6))) return; // manca qualche tiro
  const avg = rolls.reduce((a, b) => a + b, 0) / rolls.length;
  const miles = Math.max(1, Math.round(avg));
  v.moveRoll = { rolls: {} };
  pushLog(`Navigazione: ${rolls.join(" + ")} → media ${avg.toFixed(1)} → ${miles} miglia.`);
  sail(miles, { crew: true, avg });
}

function sail(steps, opts) {
  opts = opts || {};
  const v = voyage();
  if (v.pending || v.choosing) return;
  if (v.cursor.at === "node") { openRouteChoice(); return; }

  v.lastRoll = steps;
  v.lastMoveWasCrew = Boolean(opts.crew);
  const points = [];
  let arrived = null;
  let landed = null;

  for (let k = 0; k < steps; k++) {
    const res = stepCursor(v.cursor);
    v.cursor = res.cursor;
    points.push(pointOfCursor(v.cursor));

    if (res.space === "arrivo" || res.space === "sbarco") { arrived = v.cursor.node; break; }

    const islandId = v.cursor.at === "loop" ? PIRATI.mapNode(v.cursor.node).island : null;
    const type = resolvedSpaceType(res.space, islandId);
    landed = type;
    if (SPECIAL_SPACES.includes(type)) {
      bumpEncounter();
      v.pending = buildEncounter(type, islandId);
      const roller = pick(activePlayers());
      if (roller && v.pending && v.pending.roll) v.pending.actorId = roller.id;
      break;
    }
  }

  animateToken(points);

  const lead = opts.crew
    ? `La ciurma naviga di ${steps} miglia`
    : `${steps} caselle`;

  if (v.pending) {
    v.message = v.pending.kind === "quest"
      ? `${lead}. La ciurma mette piede sull'isola: c'è un'avventura!`
      : `${lead}. La rotta si ferma: leggete l'incontro qui sotto.`;
  } else if (arrived) {
    handleArrival(arrived);
  } else {
    v.message = `${lead}. Mare calmo, la ciurma prosegue. Tutti tirano ancora.`;
  }
  saveState();
  renderMap();
}

function handleArrival(nodeId) {
  const v = voyage();
  const node = PIRATI.mapNode(nodeId);
  if (node.home) {
    const before = state.session.danger;
    state.session.danger = Math.max(0, state.session.danger - 2);
    state.questCampaign.supplies = Math.min(12, (state.questCampaign.supplies || 0) + 2);
    v.message = `Approdate al ${node.name}. Base sicura: rifornimenti +2, Pericolo ${before} → ${state.session.danger}. Scegliete la prossima rotta.`;
    pushLog(`La ciurma rientra al ${node.name}. Rifornimenti e riposo.`);
  } else if (nextIslandQuestId(node.island)) {
    v.message = `Approdate a ${node.name}. C'è un'avventura che vi aspetta: sbarcate a esplorare o proseguite in mare?`;
  } else {
    v.message = `Approdate a ${node.name}. Qui avete già fatto tutto: scegliete dove salpare.`;
  }
  openRouteChoice();
}

function openRouteChoice() {
  const v = voyage();
  const cur = v.cursor;
  if (cur.at !== "node") return;
  const node = PIRATI.mapNode(cur.node);
  const options = [];

  if (loopSpaces(cur.node).length && nextIslandQuestId(node.island)) {
    options.push({ label: `⚑ Sbarca ed esplora ${node.name}`, kind: "loop", node: cur.node });
  }
  PIRATI.legsFrom(cur.node).forEach((leg) => {
    const dir = leg.from === cur.node ? 1 : -1;
    const destId = legEndNode(leg.id, dir);
    const dest = PIRATI.mapNode(destId);
    options.push({ label: `⛵ Rotta per ${dest.name}`, kind: "leg", leg: leg.id, dir });
  });

  v.choosing = options;
  if (cur.node === PIRATI.map.start && !v.message) {
    v.message = "La ciurma è al Porto del Teschio. Scegliete la rotta, poi tirate il dado per salpare.";
  }
}

function chooseRoute(index) {
  const v = voyage();
  const opt = (v.choosing || [])[index];
  if (!opt) return;
  if (opt.kind === "loop") {
    v.cursor = { at: "loop", node: opt.node, i: 0 };  // 0 = costa, sicura
    v.message = `Sbarcate su ${PIRATI.mapNode(opt.node).name}. Tirate il dado per avanzare sull'isola.`;
  } else {
    v.cursor = { at: "leg", leg: opt.leg, dir: opt.dir, i: -1 };
    v.message = `Rotta tracciata verso ${PIRATI.mapNode(legEndNode(opt.leg, opt.dir)).name}. Tirate il dado per navigare.`;
  }
  v.choosing = null;
  saveState();
  renderMap();
}

/* --- incontri ---------------------------------------------------------- */

function passiveBonus(stat) {
  return (state.crew.powers || []).reduce((sum, owned) => {
    const power = PIRATI.power(owned.id);
    return power && power.passive && power.passive.stat === stat ? sum + (power.passive.amount || 0) : sum;
  }, 0);
}

/* --- potenza dei pirati ------------------------------------------------- */

const STAT_KEYS = ["coraggio", "astuzia", "fortuna"];

function playerBaseStat(player, stat) {
  const character = getCharacter(player.characterId);
  return character ? (character.stats[stat] || 0) : 0;
}
function playerGrowth(player, stat) {
  return (player.growth && player.growth[stat]) || 0;
}
function playerStatTotal(player, stat) {
  return playerBaseStat(player, stat) + playerGrowth(player, stat) + passiveBonus(stat);
}
function playerPower(player) {
  return STAT_KEYS.reduce((sum, stat) => sum + playerStatTotal(player, stat), 0);
}
function playerTotalGrowth(player) {
  return STAT_KEYS.reduce((sum, stat) => sum + playerGrowth(player, stat), 0);
}

function awardGrowth(playerId, stat, delta) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || !STAT_KEYS.includes(stat)) return;
  player.growth = player.growth || { coraggio: 0, astuzia: 0, fortuna: 0 };
  const next = Math.max(0, (player.growth[stat] || 0) + delta);
  if (next === player.growth[stat]) return;
  player.growth[stat] = next;
  if (delta > 0) pushLog(`${player.name}: +1 crescita ${titleCase(stat)} (ora ${next}).`);
  saveState();
  renderTreasury();
}

/* =========================================================================
   Gioca una carta: la mano della ciurma durante gli incontri
   ===================================================================== */

function cardPeriodToken(power) {
  return power.cooldown === "giorno" ? "d" + state.day : "e" + (state.crew.encounterCount || 0);
}
function isCardPlayed(power) {
  if (!power || power.cooldown === "permanente") return false;
  return (state.crew.cardUse || {})[power.id] === cardPeriodToken(power);
}
function markCardPlayed(power) {
  state.crew.cardUse = state.crew.cardUse || {};
  state.crew.cardUse[power.id] = cardPeriodToken(power);
}
function playableCards() {
  const owned = ownedPowerIds();
  const grade = state.crew.grade || 1;
  return PIRATI.powers.filter((p) =>
    owned.has(p.id) && p.cooldown !== "permanente" && (p.legendary || p.grade <= grade));
}
function bumpEncounter() {
  state.crew.encounterCount = (state.crew.encounterCount || 0) + 1;
}

function playCard(powerId) {
  const power = PIRATI.power(powerId);
  if (!power || isCardPlayed(power)) return;
  const p = power.play || { type: "narrative" };
  const v = voyage();
  const enc = v.pending;

  // --- durante un incontro con tiro: bonus "in gioco" fino alla risoluzione ---
  if (enc && enc.roll && (p.type === "bonus" || p.type === "teambonus")) {
    enc.cardBonuses = enc.cardBonuses || [];
    if (enc.cardBonuses.some((c) => c.id === power.id)) return;
    enc.cardBonuses.push({ id: power.id, name: power.name, amount: p.amount, stat: p.stat || null, team: p.type === "teambonus" });
    v.message = `${power.name} in gioco: +${p.amount}${p.stat ? " " + titleCase(p.stat) : ""} a questo tiro.`;
    saveState(); renderMap(); return;
  }

  // --- salta l'incontro ---
  if (enc && p.type === "skip") {
    markCardPlayed(power);
    v.pending = null;
    pushLog(`Carta giocata: ${power.name}. ${power.effect}`);
    v.message = `✓ ${power.name}: ${power.effect} Tirate per proseguire la rotta.`;
    saveState(); renderMap(); return;
  }

  // --- successo automatico su questo incontro ---
  if (enc && enc.roll && p.type === "auto") {
    markCardPlayed(power);
    pushLog(`Carta giocata: ${power.name} — successo automatico.`);
    resolveMapEncounter(0, { forcedSuccess: true, cardName: power.name });
    return;
  }

  // --- sposta la nave, quando non c'è un incontro ---
  if (!enc && p.type === "move") {
    if (v.cursor.at === "node") { v.message = `Scegli prima una rotta, poi gioca ${power.name}.`; renderMap(); return; }
    markCardPlayed(power);
    pushLog(`Carta giocata: ${power.name}. La nave avanza di ${p.spaces} caselle senza tiro.`);
    sail(p.spaces);
    if (!v.pending) v.message = `${power.name}: la nave avanza di ${p.spaces} caselle. ${v.message}`;
    saveState(); renderMap(); return;
  }

  // --- narrativa / info: l'app mostra, il Master applica ---
  markCardPlayed(power);
  pushLog(`Carta giocata: ${power.name} — ${power.effect}`);
  v.message = `${power.name} giocata. ${power.effect} (il Master applica l'effetto).`;
  saveState(); renderMap();
}

function pickScene(scope) {
  const pool = (PIRATI.eventsForScope && PIRATI.eventsForScope(scope)) || [];
  return pool.length ? pick(pool) : null;
}

function sceneEncounter(kind, scope, baseTarget) {
  const scene = pickScene(scope);
  if (!scene) return null;
  const base = {
    kind, scene,
    prompt: scene.readAloud,
    choice: scene.choice || null
  };
  if (scene.roll) {
    base.roll = { stat: scene.roll.stat, target: baseTarget, act: scene.roll.act };
  }
  return base;
}

function buildEncounter(type, islandId) {
  const danger = state.session.danger;
  if (type === "quest") {
    const questId = nextIslandQuestId(islandId);
    const quest = PIRATI.quest(questId);
    return { kind: "quest", questId, prompt: `Avventura sull'isola: “${quest ? quest.title : "?"}”. Aprite la scheda per giocarla tutti insieme.` };
  }
  if (type === "tesoro") {
    const scene = sceneEncounter("tesoro", "tesoro", 5);
    const treasure = pick(DATA.treasures);
    if (scene) return { ...scene, treasure };
    return { kind: "tesoro", treasure, roll: { stat: "fortuna", target: 5 },
      prompt: `Una X sulla sabbia! Forziere in vista: ${treasure.title}. Un pirata tira 1d6 di Fortuna.` };
  }
  if (type === "razzia") {
    const scene = sceneEncounter("razzia", "razzia", 5 + Math.floor(danger / 4));
    if (scene) return scene;
    return { kind: "razzia", roll: { stat: "astuzia", target: 5 + Math.floor(danger / 4), act: "Chi fa razzia senza farsi male" },
      prompt: `Un relitto abbandonato ondeggia tra gli scogli.` };
  }
  if (type === "assalto") {
    const enemy = pick(allEnemies().filter((e) => e.threat <= 7 + danger)) || pick(allEnemies());
    return { kind: "assalto", enemy, roll: { stat: "coraggio", target: enemy.threat, act: "Chi guida la difesa e respinge l'abbordaggio" },
      prompt: `All'arrembaggio! ${enemy.title} vi punta contro (soglia ${enemy.threat}). ${enemy.trick}` };
  }
  if (type === "mostro") {
    const enemy = pick(allEnemies().filter((e) => e.threat <= 6 + danger)) || pick(allEnemies());
    return { kind: "mostro", enemy, roll: { stat: "coraggio", target: enemy.threat, act: "Chi affronta la creatura o mette in pratica il trucco" },
      prompt: `${enemy.title} sbuca dalle onde! Soglia ${enemy.threat}. ${enemy.trick}` };
  }
  // evento
  const scope = islandId ? "isola" : "mare";
  const target = Math.max(4, 5 + Math.floor(danger / 5));
  const scene = sceneEncounter("evento", scope, target);
  if (scene) return scene;
  return { kind: "evento", roll: { stat: "fortuna", target, act: "Prova libera scelta dal Master" },
    prompt: "Succede qualcosa lungo la rotta. Il Master descrive la scena." };
}

function eventStat(eventType) {
  const map = { Mare: "fortuna", Isola: "astuzia", Indizio: "astuzia", Quest: "astuzia", Porto: "astuzia", Pericolo: "coraggio", Trappola: "astuzia", Comico: "fortuna", Nemico: "coraggio", Mistero: "fortuna", Tesoro: "fortuna" };
  return map[eventType] || "fortuna";
}

/* Legge dal testo della scena i due numeri che contano (Pericolo, Fama) e li applica. */
function applySceneWords(text) {
  const parts = [];
  let m = /Pericolo\s*\+\s*(\d)/i.exec(text || "");
  if (m) { state.session.danger = Math.min(12, state.session.danger + Number(m[1])); parts.push(`Pericolo +${m[1]}`); }
  m = /Pericolo\s*[−-]\s*(\d)/i.exec(text || "");
  if (m) { state.session.danger = Math.max(0, state.session.danger - Number(m[1])); parts.push(`Pericolo -${m[1]}`); }
  m = /\+\s*(\d)\s*Fama/i.exec(text || "");
  if (m) { state.fame += Number(m[1]); parts.push(`Fama +${m[1]}`); }
  return parts;
}

function resolveMapEncounter(die, opts) {
  opts = opts || {};
  const v = voyage();
  const enc = v.pending;
  if (!enc || !enc.roll) return;
  const player = state.players.find((p) => p.id === enc.actorId) || activePlayers()[0] || selectedPlayer();
  if (!player) { v.message = "Aggiungi almeno un pirata in gioco per affrontare l'incontro."; renderMap(); return; }
  const character = getCharacter(player.characterId);
  const stat = enc.roll.stat;
  const bonus = passiveBonus(stat);
  const cardList = enc.cardBonuses || [];
  const cardBonus = cardList.reduce((s, c) => s + ((!c.stat || c.stat === stat) ? c.amount : 0), 0);
  cardList.forEach((c) => { const pw = PIRATI.power(c.id); if (pw) markCardPlayed(pw); });
  const total = die + character.stats[stat] + bonus + cardBonus;
  const success = opts.forcedSuccess || total >= enc.roll.target;
  const cardTxt = cardList.length ? " + " + cardList.map((c) => `${c.amount} (${c.name})`).join(" + ") : "";
  const formula = opts.forcedSuccess
    ? `${opts.cardName || "Carta"}: successo automatico`
    : `${player.name}: dado ${die} + ${character.stats[stat]} ${stat}${bonus ? " + " + bonus + " poteri" : ""}${cardTxt} = ${total} (soglia ${enc.roll.target})`;

  const scene = enc.scene;
  const narrative = scene ? (success ? scene.success : scene.fail) : "";
  const effects = applySceneWords(narrative);
  const gains = [];

  if (enc.kind === "tesoro") {
    if (success) {
      const coins = 6 + Math.ceil(Math.random() * 7);
      state.crew.coins += coins;
      if (enc.treasure) state.crew.loot.push({ id: null, name: enc.treasure.title, text: enc.treasure.text, day: state.day, fromMap: true });
      gains.push(`${coins} monete`);
      if (enc.treasure) gains.push(enc.treasure.title);
    } else {
      const coins = 1 + Math.floor(Math.random() * 2);
      state.crew.coins += coins;
      gains.push(`${coins} monete`);
    }
  } else if (enc.kind === "razzia") {
    if (success) {
      const coins = 6 + Math.ceil(Math.random() * 7);
      state.crew.coins += coins;
      gains.push(`${coins} monete`);
    }
  } else if (enc.kind === "mostro" || enc.kind === "assalto") {
    if (success) {
      state.session.danger = Math.max(0, state.session.danger - 1);
      const coins = 3 + Math.ceil(Math.random() * 4);
      state.crew.coins += coins;
      gains.push(`${coins} monete`, `bottino: ${enc.enemy.reward}`, "Pericolo -1");
    } else {
      const hit = enc.kind === "assalto" ? Math.min(state.crew.coins, 3 + Math.floor(Math.random() * 3)) : 0;
      state.crew.coins -= hit;
      state.session.danger = Math.min(12, state.session.danger + 2);
      if (hit) gains.push(`perse ${hit} monete`);
      gains.push("Pericolo +2");
    }
  } else if (success) { // evento riuscito
    const coins = 3 + Math.ceil(Math.random() * 3);
    state.crew.coins += coins;
    gains.push(`${coins} monete`);
  }

  const mech = effects.concat(gains).filter(Boolean).join(" · ");
  pushLog(`Mappa — ${scene ? scene.title : enc.kind}: ${formula}. ${success ? "SUCCESSO" : "FALLIMENTO"}. ${narrative}${mech ? " (" + mech + ")" : ""}`);
  refreshGrade();
  v.pending = null;
  v.message = `${success ? "✓ " : "✗ "}${narrative || (success ? "Riuscito!" : "Non è andata.")}${mech ? " — " + mech : ""} Tirate il dado per proseguire.`;
  if (state.session.danger >= 12 && !bossOnCooldown()) { startBossEncounter(); return; }
  saveState();
  renderMap();
}

function resolveEventChoice(index) {
  const v = voyage();
  const enc = v.pending;
  const options = enc && (enc.choice || (enc.scene && enc.scene.choice));
  if (!options || !options[index]) return;
  const opt = options[index];
  const gains = [];
  if (opt.coins) { state.crew.coins += opt.coins; gains.push(`${opt.coins} monete`); }
  if (opt.danger) {
    state.session.danger = Math.min(12, Math.max(0, state.session.danger + opt.danger));
    gains.push(`Pericolo ${opt.danger > 0 ? "+" : ""}${opt.danger}`);
  }
  pushLog(`Mappa — ${enc.scene ? enc.scene.title : "scelta"}: "${opt.label}". ${opt.result}${gains.length ? " (" + gains.join(" · ") + ")" : ""}`);
  refreshGrade();
  v.pending = null;
  v.message = `✓ ${opt.result}${gains.length ? " — " + gains.join(" · ") : ""} Tirate il dado per proseguire.`;
  if (state.session.danger >= 12 && !bossOnCooldown()) { startBossEncounter(); return; }
  saveState();
  renderMap();
}

function skipMapEncounter() {
  const v = voyage();
  if (!v.pending) return;
  if (v.pending.kind === "quest" || v.pending.kind === "boss") return;
  v.message = "Passate oltre senza fermarvi. Tirate per proseguire.";
  v.pending = null;
  saveState();
  renderMap();
}

function openMapQuest() {
  const v = voyage();
  if (!v.pending || v.pending.kind !== "quest" || !v.pending.questId) return;
  const questId = v.pending.questId;
  showView("quests");
  prepareTodayQuest(questId);
}

/* =========================================================================
   Barbabisso, il boss: non si batte a forza. Ogni pirata gli offre qualcosa
   per farlo tornare a dormire. Compare quando il Pericolo va al massimo,
   oppure lo evoca il Master (finale di ciclo).
   ===================================================================== */

const BOSS_OFFERINGS = [
  { label: "Una ninna nanna", stat: "fortuna", target: 4, hint: "cantatela piano piano, tutti insieme" },
  { label: "Un oggetto che brilla", stat: "astuzia", target: 4, hint: "qualcosa di lucente dal vostro baule" },
  { label: "Una storia mai raccontata", stat: "astuzia", target: 5, hint: "inventatela adesso, in tre frasi" },
  { label: "Un nodo speciale", stat: "coraggio", target: 4, hint: "annodate qualcosa di vostro e regàlaglielo" }
];

function bossActive() {
  return state.voyage.pending && state.voyage.pending.kind === "boss";
}
function bossOnCooldown() {
  return state.voyage.bossCooldownDay === state.day;
}

function startBossEncounter() {
  const v = voyage();
  const boss = theBoss();
  const first = activePlayers()[0];
  v.pending = {
    kind: "boss",
    enemy: boss,
    offerings: {},                 // { playerId: { label } }
    currentPlayerId: first ? first.id : null,
    offerIndex: null,              // indice in BOSS_OFFERINGS scelto per il pirata corrente
    attempts: 0
  };
  v.message = `Il mare ribolle e si spalanca: ${boss ? boss.title : "il Vecchio del Fondale"} si solleva dagli abissi!`;
  bumpEncounter();
  saveState();
  renderMap();
}

function bossNextPirate() {
  const enc = voyage().pending;
  const done = new Set(Object.keys(enc.offerings));
  const next = activePlayers().find((p) => !done.has(p.id));
  enc.currentPlayerId = next ? next.id : null;
  enc.offerIndex = null;
}

function chooseBossOffer(index) {
  const enc = voyage().pending;
  if (!enc || enc.kind !== "boss" || !BOSS_OFFERINGS[index]) return;
  enc.offerIndex = index;
  const off = BOSS_OFFERINGS[index];
  const player = state.players.find((p) => p.id === enc.currentPlayerId);
  voyage().message = `${player ? player.name : "Un pirata"} offre: ${off.label}. Tira 1d6 di ${titleCase(off.stat)} (serve ${off.target}). ${off.hint}.`;
  saveState();
  renderMap();
}

function resolveBossOffer(die) {
  const v = voyage();
  const enc = v.pending;
  if (!enc || enc.kind !== "boss" || enc.offerIndex == null) return;
  const off = BOSS_OFFERINGS[enc.offerIndex];
  const player = state.players.find((p) => p.id === enc.currentPlayerId);
  if (!player) return;
  const character = getCharacter(player.characterId);
  const bonus = passiveBonus(off.stat);
  const total = die + character.stats[off.stat] + bonus;
  const ok = total >= off.target;
  enc.attempts += 1;

  if (ok) {
    enc.offerings[player.id] = { label: off.label };
    pushLog(`Barbabisso — ${player.name}: ${off.label} (${die} + ${character.stats[off.stat]} ${off.stat}${bonus ? " +" + bonus : ""} = ${total}). Accettata.`);
    bossNextPirate();
    if (!enc.currentPlayerId) { calmBoss(); return; }
    v.message = `Barbabisso accetta il dono di ${player.name} e sbadiglia. Tocca al prossimo pirata.`;
  } else {
    pushLog(`Barbabisso — ${player.name}: ${off.label} non basta (${total}, serviva ${off.target}). Riprova con un altro dono.`);
    enc.offerIndex = null;
    v.message = `Barbabisso si rigira brontolando: il dono non basta. ${player.name} prova con qualcos'altro.`;
  }
  saveState();
  renderMap();
}

function calmBoss() {
  const v = voyage();
  const boss = v.pending && v.pending.enemy;
  state.session.danger = 0;
  state.fame += 4;
  state.crew.coins += 20;
  if (!state.crew.trophies.some((t) => t.id === "sonno-dell-abisso")) {
    state.crew.trophies.push({ id: "sonno-dell-abisso", questId: null, day: state.day });
  }
  grantLegendary("cuore-abisso", "Barbabisso è tornato a dormire e vi ha lasciato il suo cuore di luce.");
  pushLog(`✨ ${boss ? boss.title : "Barbabisso"} torna a dormire! Fama +4, +20 monete, Pericolo azzerato. Trofeo: Il Sonno dell'Abisso.`);
  v.pending = null;
  v.bossCooldownDay = state.day;
  v.message = `Un ultimo, lunghissimo sbadiglio e ${boss ? boss.title : "il Vecchio del Fondale"} scivola giù negli abissi. Vi riporta a galla con una corrente gentile. Fama +4 · +20 monete · Pericolo a 0.`;
  refreshGrade();
  saveState();
  render();
}

function bossEncounterMarkup(enc) {
  const boss = enc.enemy;
  const roster = activePlayers();
  const doneCount = Object.keys(enc.offerings).length;
  const portrait = boss && boss.image
    ? `<figure class="foe-portrait is-boss"><img src="${boss.image}" alt="${boss.title}" onerror="this.closest('.foe-portrait').remove()"><figcaption><strong>${boss.title}</strong><span>${boss.vibe || ""}</span></figcaption></figure>`
    : "";
  const pirateList = roster.map((p) => {
    const got = enc.offerings[p.id];
    const current = p.id === enc.currentPlayerId;
    return `<li class="boss-pirate ${got ? "is-done" : current ? "is-current" : ""}">
      <strong>${p.name}</strong>
      <small>${got ? "✓ " + got.label : current ? "tocca a lui" : "in attesa"}</small>
    </li>`;
  }).join("");

  let action = "";
  const current = state.players.find((p) => p.id === enc.currentPlayerId);
  if (current) {
    if (enc.offerIndex == null) {
      action = `<p class="map-console-label">Cosa offre ${current.name} a Barbabisso?</p>
        <div class="boss-offers">${BOSS_OFFERINGS.map((o, i) => `<button type="button" data-boss-offer="${i}"><strong>${o.label}</strong><small>${titleCase(o.stat)} · serve ${o.target}</small></button>`).join("")}</div>`;
    } else {
      const o = BOSS_OFFERINGS[enc.offerIndex];
      action = `<p class="encounter-act"><strong>${titleCase(o.stat)} · serve ${o.target}</strong> ${current.name}: ${o.hint}. Premi il numero uscito sul dado.</p>`;
    }
  }

  return `<div class="map-encounter-card kind-boss ${portrait ? "has-portrait" : ""}">
    ${portrait}
    <div class="map-encounter-body">
      <span class="map-encounter-tag">☠ Barbabisso, il Vecchio del Fondale</span>
      <p class="encounter-read">“${boss ? boss.trick : "Ogni pirata deve dargli qualcosa per farlo tornare a dormire."}”</p>
      <ul class="boss-pirates">${pirateList}</ul>
      <p class="boss-progress">${doneCount}/${roster.length} doni accettati</p>
      ${action}
    </div>
  </div>`;
}

/* --- rendering della mappa -------------------------------------------- */

function animateToken(points) {
  const token = $("#map-token");
  if (!token || !points || !points.length) {
    if (token) { const p = pointOfCursor(voyage().cursor); token.setAttribute("transform", `translate(${p.x} ${p.y})`); }
    return;
  }
  const setPos = (x, y) => token.setAttribute("transform", `translate(${x} ${y})`);
  if (!window.gsap || prefersReducedMotion()) { const last = points[points.length - 1]; setPos(last.x, last.y); return; }
  const start = tokenPos(token);
  const proxy = { x: start.x, y: start.y };
  const tl = gsap.timeline();
  points.forEach((p) => tl.to(proxy, { x: p.x, y: p.y, duration: 0.3, ease: "sine.inOut", onUpdate: () => setPos(proxy.x, proxy.y) }));
}

function tokenPos(token) {
  const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(token.getAttribute("transform") || "");
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : pointOfCursor(voyage().cursor);
}

function mapSvgMarkup() {
  const map = PIRATI.map;
  const done = new Set(state.questCampaign.completedQuestIds || []);
  const legLines = Object.values(map.legs).map((leg) => {
    const a = map.nodes[leg.from], b = map.nodes[leg.to];
    const dots = leg.spaces.map((sp, i) => {
      const t = (i + 1) / (leg.spaces.length + 1);
      const x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t);
      const type = String(sp).split(":")[0];
      const cls = type === "mare" ? "dot-sea" : "dot-special";
      return `<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.9"></circle>`;
    }).join("");
    return `<line class="leg-line" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>${dots}`;
  }).join("");

  const nodeMarks = Object.values(map.nodes).map((node) => {
    const island = node.island ? PIRATI.island(node.island) : null;
    const total = node.island ? PIRATI.islandQuests(node.island).length : 0;
    const finished = node.island ? PIRATI.islandQuests(node.island).filter((q) => done.has(q.id)).length : 0;
    const complete = total > 0 && finished === total;
    return `<g class="map-node ${node.home ? "is-home" : ""} ${complete ? "is-complete" : ""}" transform="translate(${node.x} ${node.y})">
      <circle class="node-blob" r="${node.home ? 5.4 : 4.6}"></circle>
      <text class="node-icon" y="1.6">${node.icon}</text>
      <text class="node-label" y="9">${node.name}${total ? ` (${finished}/${total})` : ""}</text>
    </g>`;
  }).join("");

  const p = pointOfCursor(voyage().cursor);
  return `
    <g class="map-legs">${legLines}</g>
    <g class="map-nodes">${nodeMarks}</g>
    <g id="map-token" transform="translate(${p.x} ${p.y})">
      <circle class="token-halo" r="3.4"></circle>
      <text class="token-ship" y="1.4">⛵</text>
    </g>`;
}

function renderMap() {
  const stage = $("#archipelago");
  if (!stage || !PIRATI.map) return;
  const v = voyage();

  if (v.cursor.at === "node" && !v.pending && !v.choosing) openRouteChoice();

  stage.innerHTML = mapSvgMarkup();

  const dangerFill = $("#map-danger-fill");
  if (dangerFill) dangerFill.style.width = `${Math.min(100, (state.session.danger / 12) * 100)}%`;
  if ($("#map-danger-value")) $("#map-danger-value").textContent = state.session.danger;
  if ($("#map-potenza-value")) {
    $("#map-potenza-value").textContent = state.players.reduce((sum, p) => sum + playerPower(p), 0);
  }
  if ($("#map-week")) {
    const cal = state.schoolCalendar || { week: 1, weekday: 1 };
    $("#map-week").textContent = `Settimana ${cal.week} · ${WEEKDAYS[(cal.weekday - 1) % 5]}`;
  }

  if ($("#map-message")) $("#map-message").textContent = v.message || "";

  // scelta rotta
  const choicesBox = $("#map-choices");
  if (choicesBox) {
    if (v.choosing && v.choosing.length) {
      choicesBox.innerHTML = `<p class="map-console-label">Dove vira la ciurma?</p>` +
        v.choosing.map((opt, i) => `<button type="button" class="map-route-button" data-map-route="${i}">${opt.label}</button>`).join("");
      choicesBox.hidden = false;
    } else {
      choicesBox.innerHTML = "";
      choicesBox.hidden = true;
    }
  }

  // incontro
  const encBox = $("#map-encounter");
  if (encBox) {
    if (v.pending) {
      encBox.hidden = false;
      encBox.innerHTML = mapEncounterMarkup(v.pending);
    } else {
      encBox.hidden = true;
      encBox.innerHTML = "";
    }
  }

  // dadi singoli: risolvere un incontro (un pirata tira) o un dono a Barbabisso
  const diceBox = $("#map-dice");
  if (diceBox) {
    const bossRoll = v.pending && v.pending.kind === "boss" && v.pending.offerIndex != null;
    diceBox.hidden = !((v.pending && v.pending.roll) || bossRoll);
    const hint = $("#map-dice-hint");
    if (hint) hint.textContent = bossRoll ? "Il pirata tira 1d6: premi il numero uscito." : "Premi il numero uscito sul dado per risolvere l'incontro.";
  }

  // movimento: tutti i pirati in gioco tirano, la media = miglia
  const moveBox = $("#map-move");
  if (moveBox) {
    const navigating = v.cursor.at !== "node" && !v.pending && !v.choosing;
    if (!navigating) {
      moveBox.hidden = true;
      moveBox.innerHTML = "";
    } else {
      const roster = activePlayers();
      v.moveRoll = v.moveRoll || { rolls: {} };
      const rolls = v.moveRoll.rolls;
      const vals = roster.map((p) => Number(rolls[p.id])).filter((n) => n >= 1 && n <= 6);
      const allIn = roster.length > 0 && vals.length === roster.length;
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      moveBox.hidden = false;
      moveBox.innerHTML = `
        <p class="map-console-label">Tutti tirano per navigare <span class="count-pill">${vals.length}/${roster.length}</span></p>
        ${roster.length ? roster.map((p) => {
          const cur = Number(rolls[p.id]) || 0;
          return `<div class="move-roll-row">
            <span class="move-roll-name">${p.name}</span>
            <span class="move-dice">${[1, 2, 3, 4, 5, 6].map((n) => `<button type="button" class="${cur === n ? "is-picked" : ""}" data-move-die="${p.id}:${n}">${n}</button>`).join("")}</span>
          </div>`;
        }).join("") : `<p class="helper-text">Nessun pirata in gioco. Aggiungi la ciurma (Giocatori) o riattiva un pirata assente.</p>`}
        ${roster.length ? `<div class="move-foot">
          <span class="move-avg">${vals.length ? `Media ${avg.toFixed(1)} → <strong>${Math.max(1, Math.round(avg))} miglia</strong>` : "In attesa dei tiri…"}</span>
          <button type="button" class="primary-button" data-crew-sail ${allIn ? "" : "disabled"}>Salpa! ⛵</button>
        </div>` : ""}`;
    }
  }

  // mano della ciurma
  const handBox = $("#map-hand");
  if (handBox) {
    const cards = (v.pending && v.pending.kind === "boss") ? [] : playableCards();
    if (!cards.length) {
      handBox.hidden = true;
      handBox.innerHTML = "";
    } else {
      const enc = v.pending;
      handBox.hidden = false;
      handBox.innerHTML = `<p class="map-console-label">Carte della ciurma <span class="count-pill">${cards.length}</span></p>
        <div class="hand-row">${cards.map((pw) => {
          const staged = enc && (enc.cardBonuses || []).some((c) => c.id === pw.id);
          const spent = isCardPlayed(pw);
          const num = powerNumber(pw);
          return `<button type="button" class="hand-card ${staged ? "is-staged" : ""} ${spent ? "is-spent" : ""}" data-play-card="${pw.id}" ${spent ? "disabled" : ""} title="${pw.name} — ${pw.effect}">
            <img src="${pw.image}" alt="${pw.name}" loading="lazy" onerror="this.remove();">
            <span class="hand-card-name">${pw.name}</span>
            ${num ? `<span class="hand-num">${num}</span>` : ""}
            ${spent ? `<span class="hand-spent-tag">giocata</span>` : ""}
          </button>`;
        }).join("")}</div>`;
    }
  }

  // evoca Barbabisso: quando il mare è pericoloso, o per il finale di ciclo
  const extraBox = $("#map-extra");
  if (extraBox) {
    const canSummon = !v.pending && !v.choosing && !bossOnCooldown() && theBoss()
      && (state.session.danger >= 6 || (state.questCampaign.completedQuestIds || []).length >= 14);
    if (canSummon) {
      extraBox.hidden = false;
      extraBox.innerHTML = `<button type="button" class="map-summon-button" data-summon-boss>☠ Le acque ribollono… evoca Barbabisso</button>`;
    } else {
      extraBox.hidden = true;
      extraBox.innerHTML = "";
    }
  }
}

function mapEncounterMarkup(enc) {
  if (enc.kind === "quest") {
    return `<div class="map-encounter-card is-quest">
      <span class="map-encounter-tag">★ Avventura</span>
      <p>${enc.prompt}</p>
      <button type="button" class="primary-button" data-map-open-quest>Apri la scheda dell'avventura</button>
    </div>`;
  }
  if (enc.kind === "boss") return bossEncounterMarkup(enc);
  const scene = enc.scene;
  const info = SPACE_INFO[enc.kind] || { icon: "❈", label: enc.kind };
  const tag = `<span class="map-encounter-tag">${info.icon} ${scene ? scene.title : info.label}</span>`;

  const foe = enc.enemy;
  const portrait = foe && foe.image
    ? `<figure class="foe-portrait">
         <img src="${foe.image}" alt="${foe.title}" loading="lazy" onerror="this.closest('.foe-portrait').remove()">
         <figcaption><strong>${foe.title}</strong><span>${foe.vibe || ""} · soglia ${foe.threat}</span></figcaption>
       </figure>`
    : "";

  const readAloud = scene
    ? `<p class="encounter-read">“${scene.readAloud}”</p>${scene.situation ? `<p class="encounter-situation">${scene.situation}</p>` : ""}`
    : `<p>${enc.prompt}</p>`;

  let action;
  if (enc.choice || (scene && scene.choice)) {
    const options = enc.choice || scene.choice;
    action = `<p class="map-console-label">La ciurma decide</p>
      <div class="encounter-choices">${options.map((opt, i) => `<button type="button" class="encounter-choice" data-event-choice="${i}">${opt.label}</button>`).join("")}</div>`;
  } else if (enc.roll) {
    const roster = activePlayers();
    const actorId = enc.actorId || (roster[0] && roster[0].id) || "";
    const chips = roster.map((player) => {
      const character = getCharacter(player.characterId);
      return `<button type="button" class="map-actor-chip ${player.id === actorId ? "is-selected" : ""}" data-map-actor="${player.id}">
        <strong>${player.name}</strong><small>${character ? character.stats[enc.roll.stat] : 0} ${enc.roll.stat}</small></button>`;
    }).join("");
    action = `${enc.roll.act ? `<p class="encounter-act"><strong>${titleCase(enc.roll.stat)} · soglia ${enc.roll.target}</strong> ${enc.roll.act}</p>` : ""}
      <p class="map-console-label">Tira ${state.players.find((p) => p.id === actorId)?.name || "un pirata"} <small>(il sistema sceglie, tocca un altro per cambiare)</small></p>
      <div class="map-actor-row">${chips || `<span class="helper-text">Nessun pirata in gioco.</span>`}</div>`;
  } else {
    action = "";
  }

  return `<div class="map-encounter-card kind-${enc.kind} ${portrait ? "has-portrait" : ""}">
    ${portrait}
    <div class="map-encounter-body">
      ${tag}
      ${readAloud}
      ${action}
      <button type="button" class="secondary-button" data-map-skip>Passa oltre (nessun bottino)</button>
    </div>
  </div>`;
}

function showView(viewName) {
  const button = $(`.nav-item[data-view="${viewName}"]`);
  if (button) button.click();
}

/* --- Bestiario: galleria dei contendenti ------------------------------- */

function foeCardMarkup(foe, opts) {
  const big = opts && opts.big;
  return `<article class="foe-card ${big ? "is-boss" : ""}">
    <div class="foe-card-img">
      <img src="${foe.image}" alt="${foe.title}" loading="lazy"
           onerror="this.parentNode.classList.add('missing'); this.remove();">
      <span class="foe-threat">Soglia ${foe.threat}</span>
    </div>
    <div class="foe-card-body">
      <h3>${foe.title}</h3>
      ${foe.vibe ? `<p class="foe-vibe">${foe.vibe}</p>` : ""}
      <p class="foe-trick"><strong>Trucco</strong> ${foe.trick}</p>
      <p class="foe-reward"><strong>Se lo batti</strong> ${foe.reward}</p>
    </div>
  </article>`;
}

function renderBestiario() {
  const grid = $("#bestiario-grid");
  if (!grid) return;
  const foes = allEnemies().slice().sort((a, b) => a.threat - b.threat);
  grid.innerHTML = foes.map((foe) => foeCardMarkup(foe)).join("");
  const bossBox = $("#bestiario-boss");
  if (bossBox) {
    const boss = PIRATI.boss;
    bossBox.innerHTML = boss
      ? `<p class="bestiario-boss-label">Il boss di fine ciclo</p>${foeCardMarkup(boss, { big: true })}`
      : "";
  }
}

/* =========================================================================
   Il Pesce Crostone: la parola difficile del giorno (lasciapassare)
   ===================================================================== */

const CROSTONE_COINS_SUBITO = 5;    // indovinata al primo colpo
const CROSTONE_COINS_RECUPERO = 3;  // ripetuta dal Taccuino Nero il giorno dopo

function crostoneWord(id) {
  return PIRATI.word(id) || { id, parola: id, significato: "(parola non nel catalogo)", esempio: "", tranello: "" };
}

/* Pesca la parola del giorno, se non c'è già per il giorno corrente. */
function ensureWordOfDay() {
  const c = state.crostone;
  // parola vecchia rimasta "aperta": finisce sul Taccuino Nero
  if (c.today && c.today.day !== state.day) {
    if (c.today.status === "aperta") {
      c.taccuino.push({ wordId: c.today.wordId, day: c.today.day });
      pushLog(`Pesce Crostone: «${crostoneWord(c.today.wordId).parola}» non affrontata, va sul Taccuino Nero.`);
    }
    c.today = null;
  }
  if (c.today && c.today.day === state.day) return;
  const disponibili = (PIRATI.words || []).filter((w) => !c.usate.includes(w.id));
  if (!disponibili.length) { c.today = null; return; }
  const scelta = disponibili[Math.floor(Math.random() * disponibili.length)];
  c.usate.push(scelta.id);
  c.today = { wordId: scelta.id, day: state.day, status: "aperta" };
  saveState();
}

function crostoneIndovinata() {
  const c = state.crostone;
  if (!c.today || c.today.status !== "aperta") return;
  c.libro.push({ wordId: c.today.wordId, day: state.day, recuperata: false });
  c.today.status = "vinta";
  if (!c.pass.includes(state.day)) c.pass.push(state.day);
  state.crew.coins += CROSTONE_COINS_SUBITO;
  pushLog(`Pesce Crostone: la ciurma spiega «${crostoneWord(c.today.wordId).parola}». Lasciapassare ottenuto, +${CROSTONE_COINS_SUBITO} monete.`);
  saveState();
  lastShownCoins = state.crew.coins - CROSTONE_COINS_SUBITO;
  render();
}

function crostoneSbagliata() {
  const c = state.crostone;
  if (!c.today || c.today.status !== "aperta") return;
  c.taccuino.push({ wordId: c.today.wordId, day: state.day });
  c.today.status = "persa";
  pushLog(`Pesce Crostone: «${crostoneWord(c.today.wordId).parola}» finisce sul Taccuino Nero. Stasera il Master ne spiega il significato.`);
  saveState();
  render();
}

/* Master: "passa al Libro delle Parole Impossibili" -> parola recuperata. */
function crostoneRecupera(wordId) {
  const c = state.crostone;
  const i = c.taccuino.findIndex((e) => e.wordId === wordId);
  if (i === -1) return;
  c.taccuino.splice(i, 1);
  c.libro.push({ wordId, day: state.day, recuperata: true });
  state.crew.coins += CROSTONE_COINS_RECUPERO;
  pushLog(`Pesce Crostone: la ciurma ripete «${crostoneWord(wordId).parola}». Archiviata nel Libro delle Parole Impossibili, +${CROSTONE_COINS_RECUPERO} monete.`);
  saveState();
  lastShownCoins = state.crew.coins - CROSTONE_COINS_RECUPERO;
  render();
}

function crostoneWordRow(entry, opts) {
  const w = crostoneWord(entry.wordId);
  const showActions = opts && opts.recover;
  return `<li class="crostone-word">
    <div class="crostone-word-head">
      <strong>${w.parola}</strong>
      ${entry.recuperata ? '<span class="crostone-tag recuperata">recuperata</span>' : ""}
      ${showActions ? '<span class="crostone-tag attesa">da ripetere</span>' : ""}
    </div>
    <p class="crostone-word-mean">${w.significato}</p>
    ${w.esempio ? `<p class="crostone-word-ex">${w.esempio}</p>` : ""}
    ${showActions ? `<button type="button" class="primary-button" data-crostone-recover="${w.id}">Ripetuta bene → al Libro (+${CROSTONE_COINS_RECUPERO} monete)</button>` : ""}
  </li>`;
}

function renderCrostone() {
  const oggiBox = $("#crostone-oggi");
  if (!oggiBox) return;
  ensureWordOfDay();
  const c = state.crostone;

  const portrait = $("#crostone-portrait");
  if (portrait && !portrait.src) portrait.src = window.PIRATI_ASSET("contendenti/pesce-crostone.webp");

  const totali = (PIRATI.words || []).length;
  const imparate = c.libro.length;
  $("#crostone-counters").innerHTML = `
    <div><span>Parole imparate</span><strong>${imparate}${totali ? " / " + totali : ""}</strong></div>
    <div><span>Sul Taccuino Nero</span><strong>${c.taccuino.length}</strong></div>
    <div><span>Lasciapassare</span><strong>${c.pass.length}</strong></div>`;

  // Ripasso: le parole di ieri da ripetere
  const ripassoBox = $("#crostone-ripasso");
  if (c.taccuino.length) {
    ripassoBox.innerHTML = `
      <div class="crostone-block crostone-ripasso">
        <p class="eyebrow">Prima di tutto: il ripasso</p>
        <h3>Ripetete il significato di ieri</h3>
        <p class="crostone-hint">Il Master ha spiegato queste parole. La ciurma le ripete: se ci siamo, il Master dà l'ok e la parola passa al Libro delle Parole Impossibili.</p>
        <ul class="crostone-word-list">
          ${c.taccuino.map((e) => crostoneWordRow(e, { recover: true })).join("")}
        </ul>
      </div>`;
  } else {
    ripassoBox.innerHTML = "";
  }

  // Parola di oggi
  if (!c.today) {
    oggiBox.innerHTML = `
      <div class="crostone-block">
        <h3>Il Pesce Crostone ha finito le parole</h3>
        <p class="crostone-hint">Aggiungi altre parole in <code>catalog/parole.js</code> per continuare.</p>
      </div>`;
  } else {
    const w = crostoneWord(c.today.wordId);
    if (c.today.status === "aperta") {
      oggiBox.innerHTML = `
        <div class="crostone-block crostone-oggi is-open">
          <p class="eyebrow">La parola di oggi</p>
          <p class="crostone-parola">${w.parola}</p>
          <p class="crostone-ask">Cosa vuol dire? Fatela spiegare alla ciurma con parole loro.</p>
          <details class="crostone-reveal">
            <summary>Mostra il significato (per il Master)</summary>
            <p class="crostone-word-mean">${w.significato}</p>
            ${w.esempio ? `<p class="crostone-word-ex">${w.esempio}</p>` : ""}
            ${w.tranello ? `<p class="crostone-word-trap">⚠ ${w.tranello}</p>` : ""}
          </details>
          <div class="crostone-actions">
            <button type="button" class="primary-button" data-crostone-ok>Indovinata! +${CROSTONE_COINS_SUBITO} monete e lasciapassare</button>
            <button type="button" class="secondary-button" data-crostone-ko>Non ci sono arrivati → Taccuino Nero</button>
          </div>
        </div>`;
    } else if (c.today.status === "vinta") {
      oggiBox.innerHTML = `
        <div class="crostone-block crostone-oggi is-won">
          <p class="eyebrow">La parola di oggi</p>
          <p class="crostone-parola">${w.parola}</p>
          <p class="crostone-verdict">✓ Indovinata! La ciurma ha il lasciapassare di oggi. +${CROSTONE_COINS_SUBITO} monete.</p>
          <p class="crostone-word-mean">${w.significato}</p>
          <p class="crostone-hint">Nuova parola alla prossima giornata di scuola.</p>
        </div>`;
    } else {
      oggiBox.innerHTML = `
        <div class="crostone-block crostone-oggi is-lost">
          <p class="eyebrow">La parola di oggi</p>
          <p class="crostone-parola">${w.parola}</p>
          <p class="crostone-verdict">Il Pesce Crostone l'ha segnata sul Taccuino Nero.</p>
          <p class="crostone-word-mean">${w.significato}</p>
          ${w.esempio ? `<p class="crostone-word-ex">${w.esempio}</p>` : ""}
          <p class="crostone-hint">Stasera il Master rilegge il significato alla ciurma. Domani si ripete: se ci arrivano, la parola passa al Libro (+${CROSTONE_COINS_RECUPERO} monete).</p>
        </div>`;
    }
  }

  // Taccuino Nero
  $("#crostone-taccuino").innerHTML = `
    <div class="crostone-block crostone-taccuino">
      <h3>📓 Taccuino Nero <span class="crostone-count">${c.taccuino.length}</span></h3>
      ${c.taccuino.length
        ? `<ul class="crostone-word-list">${c.taccuino.map((e) => crostoneWordRow(e, { recover: true })).join("")}</ul>`
        : `<p class="crostone-hint">Nessuna parola in sospeso. La ciurma le ha spiegate tutte.</p>`}
    </div>`;

  // Libro delle Parole Impossibili
  const libroOrdinato = c.libro.slice().reverse();
  $("#crostone-libro").innerHTML = `
    <div class="crostone-block crostone-libro">
      <h3>📖 Libro delle Parole Impossibili <span class="crostone-count">${c.libro.length}</span></h3>
      ${c.libro.length
        ? `<ul class="crostone-word-list">${libroOrdinato.map((e) => crostoneWordRow(e)).join("")}</ul>`
        : `<p class="crostone-hint">Ancora vuoto. La prima parola indovinata finisce qui.</p>`}
    </div>`;
}

function setNavDrawer(open) {
  const nav = $("#app-nav");
  const toggle = $("#nav-toggle");
  const scrim = $("#nav-scrim");
  if (!nav) return;
  const shouldOpen = Boolean(open);
  nav.classList.toggle("is-open", shouldOpen);
  if (toggle) toggle.setAttribute("aria-expanded", String(shouldOpen));
  if (scrim) scrim.hidden = !shouldOpen;
}

function closeNavDrawer() {
  setNavDrawer(false);
}

function renderTutorialStep(direction = 1) {
  const step = TUTORIAL_STEPS[tutorialStepIndex];
  $("#tutorial-content").innerHTML = `
    <div class="tutorial-step-icon" aria-hidden="true">${step.icon}</div>
    <p class="tutorial-kicker">${step.kicker}</p>
    <h3>${step.title}</h3>
    <p class="tutorial-text">${step.text}</p>
    <aside class="tutorial-tip"><strong>Consiglio del vecchio capitano</strong><span>${step.tip}</span></aside>
  `;
  $("#tutorial-progress").innerHTML = TUTORIAL_STEPS.map((entry, index) => `<button type="button" class="tutorial-progress-step ${index === tutorialStepIndex ? "is-active" : ""} ${index < tutorialStepIndex ? "is-done" : ""}" data-tutorial-step="${index}"><span>${index + 1}</span><small>${entry.title}</small></button>`).join("");
  $("#tutorial-counter").textContent = `${tutorialStepIndex + 1} / ${TUTORIAL_STEPS.length}`;
  $("#tutorial-prev").disabled = tutorialStepIndex === 0;
  $("#tutorial-next").textContent = tutorialStepIndex === TUTORIAL_STEPS.length - 1 ? "Ho capito" : "Avanti";

  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo("#tutorial-content > *:not(.tutorial-tip)", { x: direction * 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.42, stagger: 0.055, ease: "power2.out" });
    gsap.fromTo(".tutorial-tip", { y: 24, scale: 0.78, opacity: 0, rotation: 4 }, { y: 0, scale: 1, opacity: 1, rotation: -1, duration: 0.58, delay: 0.22, ease: "back.out(2)" });
  }
}

function setTutorialOverlay(open) {
  const overlay = $("#tutorial-overlay");
  const trigger = $("[data-tutorial-toggle]");
  const shouldOpen = Boolean(open);
  overlay.classList.toggle("is-open", shouldOpen);
  overlay.setAttribute("aria-hidden", String(!shouldOpen));
  trigger.setAttribute("aria-expanded", String(shouldOpen));
  trigger.classList.toggle("is-active", shouldOpen);
  document.body.classList.toggle("tutorial-open", shouldOpen);
  closeNavDrawer();
  if (!shouldOpen) return;
  renderTutorialStep();
  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo(".tutorial-panel", { y: 45, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.58, ease: "back.out(1.35)" });
  }
  $(".tutorial-close").focus();
}

/* Il sistema sceglie chi tira: fra i pirati in gioco, prima chi ha
   partecipato a meno quest (a parità, a caso). */
function pickQuestRollers(count) {
  const pool = activePlayers().slice();
  if (pool.length <= count) return pool.map((p) => p.id);
  const order = pool
    .map((p) => ({ id: p.id, played: p.questsPlayed || 0, r: Math.random() }))
    .sort((a, b) => a.played - b.played || a.r - b.r);
  return order.slice(0, count).map((e) => e.id);
}

function createQuestResolution(questId) {
  const count = Math.max(2, state.crew.minQuestRollers || 2);
  return { questId, mode: "dice", approachIndex: 0, rollerCount: count, playerIds: pickQuestRollers(count), rolls: {}, cardBonuses: [], answer: "", result: null };
}

/* --- carte giocate nella prova della quest --- */

function questHandMarkup(resolution) {
  const cards = playableCards();
  if (!cards.length) return "";
  return `<div class="quest-hand">
    <p class="resolution-label">Carte della ciurma</p>
    <div class="hand-row">${cards.map((pw) => {
      const staged = (resolution.cardBonuses || []).some((c) => c.id === pw.id);
      const spent = isCardPlayed(pw);
      const num = powerNumber(pw);
      return `<button type="button" class="hand-card ${staged ? "is-staged" : ""} ${spent ? "is-spent" : ""}" data-play-quest-card="${pw.id}" ${spent ? "disabled" : ""} title="${pw.name} — ${pw.effect}">
        <img src="${pw.image}" alt="${pw.name}" onerror="this.remove();">
        <span class="hand-card-name">${pw.name}</span>
        ${num ? `<span class="hand-num">${num}</span>` : ""}
        ${spent ? `<span class="hand-spent-tag">giocata</span>` : ""}
      </button>`;
    }).join("")}</div>
  </div>`;
}

function playQuestCard(id) {
  const power = PIRATI.power(id);
  const r = state.questCampaign.resolution;
  if (!power || !r || isCardPlayed(power)) return;
  const p = power.play || { type: "narrative" };
  if (p.type === "bonus" || p.type === "teambonus") {
    r.cardBonuses = r.cardBonuses || [];
    if (r.cardBonuses.some((c) => c.id === id)) return;
    r.cardBonuses.push({ id, name: power.name, amount: p.amount });
  } else if (p.type === "skip" || p.type === "auto") {
    markCardPlayed(power);
    const approach = PIRATI.quest(r.questId)?.choices[r.approachIndex || 0];
    r.result = { success: true, title: `${power.name}!`, text: `${power.effect} ${approach ? approach.result : "La prova è superata."}` };
  } else {
    markCardPlayed(power);
    r.result = null;
    pushLog(`Quest — carta giocata: ${power.name}. ${power.effect} (il Master applica).`);
  }
  saveState();
  renderQuestCycle();
}

function rerollQuestRollers() {
  const r = state.questCampaign.resolution;
  if (!r) return;
  r.playerIds = pickQuestRollers(r.rollerCount || 2);
  r.rolls = {};
  r.result = null;
  saveState();
  renderQuestCycle();
}

function setQuestRollerCount(delta) {
  const r = state.questCampaign.resolution;
  if (!r) return;
  const maxN = Math.max(2, activePlayers().length);
  r.rollerCount = Math.min(maxN, Math.max(2, (r.rollerCount || 2) + delta));
  state.crew.minQuestRollers = r.rollerCount;
  r.playerIds = pickQuestRollers(r.rollerCount);
  r.rolls = {};
  r.result = null;
  saveState();
  renderQuestCycle();
}

function questResolutionMarkup(quest, campaign) {
  const resolution = campaign.resolution && campaign.resolution.questId === quest.id
    ? campaign.resolution
    : createQuestResolution(quest.id);
  campaign.resolution = resolution;
  const approach = quest.choices[resolution.approachIndex] || quest.choices[0];
  const statKey = approach.stat.toLowerCase();
  const players = state.players;
  const activeCount = activePlayers().length;
  resolution.rollerCount = Math.min(Math.max(2, activeCount || 2), Math.max(2, resolution.rollerCount || 2));
  resolution.playerIds = (resolution.playerIds || []).filter((id) => activePlayers().some((p) => p.id === id));
  if (resolution.playerIds.length < Math.min(resolution.rollerCount, activeCount)) {
    resolution.playerIds = pickQuestRollers(resolution.rollerCount);
  }
  resolution.rolls = resolution.rolls && typeof resolution.rolls === "object" ? resolution.rolls : {};
  const target = approach.target + Math.max(0, campaign.cycle - 1);
  const result = resolution.result;

  const rollerCount = resolution.rollerCount;
  const playerSelector = activeCount
    ? resolution.playerIds.map((id) => {
      const player = players.find((p) => p.id === id);
      if (!player) return "";
      const character = getCharacter(player.characterId);
      const idx = DATA.characters.findIndex((c) => c.id === player.characterId);
      return `<span class="roller-chip"><span class="mini-portrait portrait-${idx}"></span><span><strong>${player.name}</strong><small>${character.name}</small></span></span>`;
    }).join("")
    : `<p class="helper-text">Aggiungi bambini nella Ciurma (e assicurati che almeno 2 siano "in gioco").</p>`;

  const diceInputs = resolution.playerIds.map((playerId) => {
    const player = players.find((entry) => entry.id === playerId);
    if (!player) return "";
    const character = getCharacter(player.characterId);
    const statValue = character.stats[statKey] || 0;
    const roll = resolution.rolls[playerId] || "";
    return `<label class="crew-roll-card"><span><strong>${player.name}</strong><small>${character.name}</small></span><span class="roll-formula">d6 + ${approach.stat} ${statValue}</span><input type="number" inputmode="numeric" min="1" max="6" value="${roll}" data-quest-roll="${player.id}" aria-label="Risultato del dado di ${player.name}"></label>`;
  }).join("");

  return `
    <section class="quest-resolution-panel">
      <div class="resolution-heading"><div><p class="eyebrow">Risoluzione completa</p><h4>Chi affronta la prova</h4></div></div>
      <div class="resolution-modes">
        <button type="button" class="resolution-mode ${resolution.mode === "dice" ? "is-active" : ""}" data-resolution-mode="dice">⚄ Prova con i dadi</button>
        <button type="button" class="resolution-mode ${resolution.mode === "question" ? "is-active" : ""}" data-resolution-mode="question">✦ Sfida collaborativa</button>
      </div>
      <div class="resolution-block">
        <div class="rollers-head">
          <strong class="resolution-label">Il sistema ha scelto chi tira</strong>
          <div class="roller-count">
            <button type="button" data-roller-count="-1" ${rollerCount <= 2 ? "disabled" : ""} aria-label="Meno pirati">−</button>
            <span>${rollerCount} pirati</span>
            <button type="button" data-roller-count="1" ${rollerCount >= Math.max(2, activeCount) ? "disabled" : ""} aria-label="Più pirati">+</button>
            <button type="button" class="reroll-btn" data-reroll-rollers>↻ Rimescola</button>
          </div>
        </div>
        <div class="chosen-rollers">${playerSelector}</div>
        <p class="selection-warning" id="quest-selection-warning"></p>
      </div>
      ${resolution.mode === "dice" ? `
        <div class="resolution-block"><strong class="resolution-label">Scegli l'approccio</strong><div class="resolution-approach-buttons">${quest.choices.map((choice, index) => `<button type="button" class="${index === resolution.approachIndex ? "is-active" : ""}" data-resolution-approach="${index}"><strong>${choice.label}</strong><small>${choice.stat} · soglia ${choice.target + Math.max(0, campaign.cycle - 1)}</small></button>`).join("")}</div></div>
        <div class="crew-rolls">${diceInputs || `<p class="resolution-placeholder">Scegli almeno un membro della ciurma: comparirà qui il suo dado.</p>`}</div>
        ${questHandMarkup(resolution)}
        <div class="average-rule"><span>Regola</span><p>Ogni bambino tira 1d6 e aggiunge la caratteristica del proprio pirata. La media dei risultati deve raggiungere <strong>${target}</strong>.</p></div>
        <button type="button" class="resolve-crew-button" data-resolve-dice>Calcola la media della ciurma</button>
      ` : `
        <div class="group-question-card"><span>Domanda per tutta la ciurma</span><p>${questGroupChallenge(quest)}</p></div>
        <label class="group-answer-label">La soluzione inventata insieme<textarea data-quest-answer rows="3" placeholder="Annota qui la parola, il piano o la risposta della ciurma...">${resolution.answer || ""}</textarea></label>
        <div class="question-resolution-actions"><button type="button" data-question-hint>Serve un indizio</button><button type="button" class="success" data-resolve-question>La soluzione funziona!</button></div>
      `}
      ${result ? `<div class="crew-resolution-result ${result.success ? "is-success" : result.hint ? "is-hint" : "is-failure"}"><strong>${result.title}</strong><p>${result.text}</p>${result.breakdown ? `<small>${result.breakdown}</small>` : ""}</div>` : ""}
    </section>`;
}

/* =========================================================================
   Piano di Bordo: la giornata di scuola (~1 ora, lun-ven)
   ===================================================================== */

const WEEKDAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

function nextCampaignQuest() {
  const done = new Set(state.questCampaign.completedQuestIds || []);
  return PIRATI.quests.find((quest) => !done.has(quest.id)) || null;
}

function stampedToday(list) {
  return (list || []).filter((entry) => entry.day === state.day);
}

function renderTodayPlan() {
  const box = $("#today-plan");
  if (!box) return;
  const cal = state.schoolCalendar || { week: 1, weekday: 1 };
  const weekdayName = WEEKDAYS[(cal.weekday - 1) % 5] || "Lunedì";
  const done = new Set(state.questCampaign.completedQuestIds || []);
  const total = PIRATI.quests.length;

  const revealed = PIRATI.quest(state.questCampaign.revealedQuestId);
  const inProgress = revealed && !done.has(revealed.id) ? revealed : null;
  const suggested = inProgress || nextCampaignQuest();

  const island = suggested ? PIRATI.island(suggested.island) : null;
  const questLine = suggested
    ? `<div class="today-quest">
         <div>
           <p class="eyebrow">${inProgress ? "Riprendete da dove eravate" : "Avventura di oggi"}</p>
           <h4>${suggested.title}</h4>
           <p class="today-quest-meta">${island ? island.icon + " " + island.name : ""} · ${suggested.kind} · ~${suggested.minutes} min</p>
         </div>
         <button type="button" class="primary-button" data-prepare-today="${suggested.id}">${inProgress ? "Torna alla scheda" : "Prepara l'avventura"}</button>
       </div>`
    : `<div class="today-quest"><div><h4>Ciclo completato!</h4><p class="today-quest-meta">La ciurma ha finito tutte le ${total} avventure. Aggiungi un nuovo pacchetto in <code>content/</code> per continuare.</p></div></div>`;

  const gainedToday = stampedToday(state.crew.powers).length + stampedToday(state.crew.trophies).length;

  const cro = state.crostone || {};
  let crostoneLine = "";
  if (PIRATI.words && PIRATI.words.length) {
    const t = cro.today && cro.today.day === state.day ? cro.today : null;
    const daRipetere = (cro.taccuino || []).length;
    let stato = "Da fare: fatela spiegare alla ciurma.";
    if (t && t.status === "vinta") stato = "✓ Indovinata, lasciapassare ottenuto.";
    else if (t && t.status === "persa") stato = "Segnata sul Taccuino Nero.";
    else if (!t) stato = "Parole esaurite — aggiungine in catalog/parole.js.";
    crostoneLine = `<div class="today-crostone">
        <div>
          <p class="eyebrow">Il lasciapassare · Pesce Crostone</p>
          <h4>La parola del giorno${t ? `: “${crostoneWord(t.wordId).parola}”` : ""}</h4>
          <p class="today-quest-meta">${stato}${daRipetere ? ` · ${daRipetere} da ripetere dal Taccuino Nero` : ""}</p>
        </div>
        <button type="button" class="secondary-button" data-view="crostone">Apri il Pesce Crostone</button>
      </div>`;
  }

  box.innerHTML = `
    <div class="today-head">
      <div class="today-when">
        <span class="today-week">Settimana ${cal.week}</span>
        <strong class="today-day">${weekdayName}</strong>
      </div>
      <div class="today-progress">
        <span>Avventura ${Math.min(done.size + 1, total)} di ${total}</span>
        <span>Grado ${state.crew.grade}</span>
        ${gainedToday ? `<span class="today-gained">+${gainedToday} premi oggi</span>` : ""}
      </div>
      <button type="button" class="secondary-button" data-end-school-day>Chiudi la giornata ▸</button>
    </div>
    <ol class="today-steps">
      <li><span>1</span><div><strong>Apertura · 5 min</strong><p>Rileggete l'ultimo trofeo vinto e chiedete: "dove eravamo rimasti?"</p></div></li>
      <li><span>2</span><div><strong>Avventura · ~${suggested ? suggested.minutes : 50} min</strong><p>Lettura a turni, scelte di gruppo, prove con i dadi.</p></div></li>
      <li><span>3</span><div><strong>Chiusura · 10 min</strong><p>Incassate il bottino, segnate le crescite, una domanda finale: il momento più coraggioso o più buffo?</p></div></li>
    </ol>
    ${questLine}
    ${crostoneLine}`;
}

function prepareTodayQuest(questId) {
  const quest = PIRATI.quest(questId);
  if (!quest) return;
  state.questCampaign.selectedIslandId = quest.island;
  if (!state.questCampaign.completedQuestIds.includes(questId)) {
    state.questCampaign.revealedQuestId = questId;
    if (!state.questCampaign.resolution || state.questCampaign.resolution.questId !== questId) {
      state.questCampaign.resolution = createQuestResolution(questId);
    }
  }
  saveState();
  renderQuestCycle();
  const sheet = $("#quest-master-sheet");
  if (sheet) sheet.scrollIntoView({ behavior: "smooth", block: "start" });
}

function endSchoolDay() {
  const cal = state.schoolCalendar;
  const questsToday = stampedToday(state.crew.trophies).length;
  const powersToday = stampedToday(state.crew.powers).length;
  pushLog(`Fine giornata: Settimana ${cal.week}, ${WEEKDAYS[(cal.weekday - 1) % 5]}. Oggi: ${questsToday} avventure concluse, ${powersToday} poteri nuovi.`);

  if (cal.weekday >= 5) { cal.week += 1; cal.weekday = 1; }
  else cal.weekday += 1;
  state.day += 1;

  saveState();
  render();
  const box = $("#today-plan");
  if (box && window.gsap && !prefersReducedMotion()) {
    gsap.fromTo(box, { y: -12, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" });
  }
}

function renderQuestCycle() {
  renderTodayPlan();
  const campaign = { ...clone(defaultState.questCampaign), ...(state.questCampaign || {}) };
  campaign.completedQuestIds = Array.isArray(campaign.completedQuestIds) ? campaign.completedQuestIds : [];
  campaign.supplies = Number.isFinite(Number(campaign.supplies)) ? Number(campaign.supplies) : 8;
  state.questCampaign = campaign;
  const completed = new Set(campaign.completedQuestIds || []);
  const totalQuests = CYCLE_ONE_QUESTS.length;
  const selectedIsland = QUEST_ISLANDS.find((island) => island.id === campaign.selectedIslandId) || QUEST_ISLANDS[0];
  const islandQuests = CYCLE_ONE_QUESTS.filter((quest) => quest.island === selectedIsland.id);
  refreshGrade();
  const gradeStep = PIRATI.gradeForCompleted(completed.size);
  const nextStep = PIRATI.nextGrade(completed.size);
  $("#quest-completed-count").textContent = `${completed.size}/${totalQuests}`;
  $("#quest-supplies").textContent = campaign.supplies;
  if ($("#quest-grade")) $("#quest-grade").textContent = gradeStep.grade;
  if ($("#quest-grade-name")) $("#quest-grade-name").textContent = nextStep
    ? `${gradeStep.name} · al Grado ${nextStep.grade} con ${nextStep.questsNeeded - completed.size} quest`
    : `${gradeStep.name} · grado massimo`;
  if ($("#quest-coins")) $("#quest-coins").textContent = state.crew.coins;
  if ($("#quest-trophy-count")) $("#quest-trophy-count").textContent = state.crew.trophies.length;

  $("#quest-islands").innerHTML = QUEST_ISLANDS.map((island) => {
    const done = CYCLE_ONE_QUESTS.filter((quest) => quest.island === island.id && completed.has(quest.id)).length;
    return `<button type="button" role="tab" aria-selected="${island.id === selectedIsland.id}" class="quest-island-button ${island.id === selectedIsland.id ? "is-active" : ""} ${done === 2 ? "is-complete" : ""}" data-quest-island="${island.id}" data-color="${island.color}"><span>${island.icon}</span><strong>${island.name}</strong><small>${done}/2 concluse</small></button>`;
  }).join("");

  $("#quest-event-choices").innerHTML = islandQuests.map((quest) => {
    const isDone = completed.has(quest.id);
    const isRevealed = campaign.revealedQuestId === quest.id;
    return `<button type="button" class="quest-choice-card ${isDone ? "is-complete" : ""} ${isRevealed ? "is-active" : ""}" data-reveal-quest="${quest.id}" ${isDone ? "disabled" : ""}><span>${quest.kind}</span><strong>${quest.title}</strong><small>Soglia base ${quest.difficulty}</small><em>${isDone ? "Completata" : isRevealed ? "In preparazione" : "Prepara la quest"}</em></button>`;
  }).join("");

  const quest = CYCLE_ONE_QUESTS.find((entry) => entry.id === campaign.revealedQuestId);
  if (!quest) {
    $("#quest-master-sheet").innerHTML = completed.size >= totalQuests
      ? `<div class="quest-empty-state cycle-complete"><span>✦</span><h3>Primo ciclo completato</h3><p>La ciurma ha attraversato tutte le otto isole. La Stella della Ciurma è pronta ad aprire il ciclo della vittoria.</p></div>`
      : `<div class="quest-empty-state"><span>${selectedIsland.icon}</span><h3>Scegli una delle due avventure</h3><p>La scheda operativa del Master comparirà qui. I bambini vedranno soltanto ciò che deciderai di raccontare.</p></div>`;
    return;
  }
  if (!campaign.resolution || campaign.resolution.questId !== quest.id) campaign.resolution = createQuestResolution(quest.id);
  const target = Math.min(10, quest.difficulty + Math.max(0, campaign.cycle - 1));
  $("#quest-master-sheet").innerHTML = `
    <div class="quest-sheet-heading"><div><p class="eyebrow">${selectedIsland.name} · ${quest.kind}</p><h3>${quest.title}</h3></div><span class="quest-difficulty">Soglia ${target}</span><span class="quest-minutes">~${quest.minutes} min</span></div>
    <div class="read-aloud-card"><span>Da leggere ai bambini · voce del Master</span><p>“${quest.readAloud}”</p></div>
    ${questReadKidsMarkup(quest)}
    <div class="quest-sheet-grid">
      <section><h4>Obiettivo chiaro</h4><p>${quest.goal}</p><h4>Tre scene da guidare</h4><ol>${quest.beats.map((beat) => `<li>${beat}</li>`).join("")}</ol></section>
      <section><h4>Approcci possibili</h4><div class="quest-approaches">${quest.choices.map((choice) => `<article><strong>${choice.label}</strong><span>${titleCase(choice.stat)} · soglia ${choice.target + Math.max(0, campaign.cycle - 1)}</span><p>${choice.result}</p></article>`).join("")}</div></section>
    </div>
    <div class="quest-reward-block">
      <h4>Bottino della quest <small>si aggiunge alla Sala dei Trofei quando la segni completata</small></h4>
      ${rewardCardsMarkup(quest)}
    </div>
    <div class="quest-outcomes">
      <article class="growth"><strong>Crescita</strong><p>${quest.growth}</p></article>
      <article class="complication"><strong>Se falliscono</strong><p>${quest.fail}</p></article>
      <article class="escape"><strong>Fuga se restano bloccati</strong><p>${quest.escape}</p></article>
    </div>
    ${questResolutionMarkup(quest, campaign)}
    <button type="button" class="complete-quest-button" data-complete-quest="${quest.id}">Segna quest completata e incassa i premi</button>
  `;
  if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo("#quest-master-sheet > *", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, stagger: 0.06, ease: "power2.out" });
  }
}

function revealQuest(questId) {
  if (state.questCampaign.completedQuestIds.includes(questId)) return;
  state.questCampaign.revealedQuestId = questId;
  state.questCampaign.resolution = createQuestResolution(questId);
  bumpEncounter();
  saveState();
  renderQuestCycle();
}

function resolveCrewDice() {
  const campaign = state.questCampaign;
  const resolution = campaign.resolution;
  const quest = CYCLE_ONE_QUESTS.find((entry) => entry.id === resolution?.questId);
  if (!quest || !resolution.playerIds.length) {
    resolution.result = { success: false, title: "Manca la ciurma", text: "Scegli almeno un pirata prima di risolvere la prova." };
    saveState(); renderQuestCycle(); return;
  }
  const approach = quest.choices[resolution.approachIndex] || quest.choices[0];
  const statKey = approach.stat.toLowerCase();
  const entries = resolution.playerIds.map((playerId) => {
    const player = state.players.find((entry) => entry.id === playerId);
    const character = player && getCharacter(player.characterId);
    const roll = Number(resolution.rolls[playerId]);
    if (!player || !character || roll < 1 || roll > 6) return null;
    const stat = character.stats[statKey] || 0;
    return { name: player.name, roll, stat, total: roll + stat };
  });
  if (entries.some((entry) => !entry)) {
    resolution.result = { success: false, title: "Manca un risultato", text: "Ogni pirata selezionato deve inserire il numero uscito sul proprio d6." };
    saveState(); renderQuestCycle(); return;
  }
  const cardList = resolution.cardBonuses || [];
  const cardBonus = cardList.reduce((s, c) => s + c.amount, 0);
  cardList.forEach((c) => { const pw = PIRATI.power(c.id); if (pw) markCardPlayed(pw); });
  const average = entries.reduce((sum, entry) => sum + entry.total, 0) / entries.length + cardBonus;
  const target = approach.target + Math.max(0, campaign.cycle - 1);
  const success = average >= target;
  const cardTxt = cardList.length ? ` + ${cardList.map((c) => `${c.amount} (${c.name})`).join(" + ")}` : "";
  resolution.result = {
    success,
    title: success ? "La ciurma riesce insieme!" : "La ciurma ha bisogno di una nuova idea",
    text: success ? approach.result : `${quest.fail} Il Master può offrire un indizio oppure accettare un costo narrativo e far proseguire la storia.`,
    breakdown: `${entries.map((entry) => `${entry.name}: ${entry.roll} + ${entry.stat} = ${entry.total}`).join(" · ")}${cardTxt} · Media ${average.toFixed(1)} contro ${target}`
  };
  saveState();
  renderQuestCycle();
}

function resolveGroupQuestion(success) {
  const resolution = state.questCampaign.resolution;
  const quest = CYCLE_ONE_QUESTS.find((entry) => entry.id === resolution?.questId);
  if (!quest || !resolution) return;
  if (!resolution.playerIds.length) {
    resolution.result = { success: false, title: "Manca la ciurma", text: "Scegli almeno un pirata che collabori alla risposta." };
  } else if (success && !(resolution.answer || "").trim()) {
    resolution.result = { success: false, title: "Annota la soluzione", text: "Scrivi almeno la parola o l'idea trovata insieme, così resterà nella storia della ciurma." };
  } else if (success) {
    resolution.result = { success: true, title: "Soluzione accettata!", text: `${resolution.playerIds.length} pirati hanno costruito insieme la risposta. ${quest.choices[0].result}` };
  } else {
    resolution.result = { hint: true, title: "Indizio del Master", text: quest.beats[1] };
  }
  saveState();
  renderQuestCycle();
}

function titleCase(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/* --- Premi e Gradi -------------------------------------------------------- */

function rewardCardsMarkup(quest) {
  const items = PIRATI.expandRewards(quest);
  if (!items.length) return "";
  return `<div class="quest-reward-strip">${items.map((item) => `
    <article class="reward-chip rarity-${item.rarity || "comune"}">
      <span class="reward-chip-icon" aria-hidden="true">${item.icon}</span>
      <strong>${item.name}</strong>
      ${item.text ? `<small>${item.text}</small>` : ""}
    </article>`).join("")}</div>`;
}

function questReadKidsMarkup(quest) {
  const level = state.crew.readingLevel === "avanzato" ? "avanzato" : "facile";
  const lines = (quest.readKids && quest.readKids[level]) || [];
  if (!lines.length) return "";
  return `
    <div class="read-kids-card">
      <div class="read-kids-head">
        <span>Leggono i bambini · un turno a testa</span>
        <div class="reading-level-toggle" role="group" aria-label="Livello di lettura">
          <button type="button" class="${level === "facile" ? "is-active" : ""}" data-reading-level="facile">Facile</button>
          <button type="button" class="${level === "avanzato" ? "is-active" : ""}" data-reading-level="avanzato">Avanzato</button>
        </div>
      </div>
      <ol class="read-kids-lines">
        ${lines.map((line) => `<li><span class="read-turn-badge" aria-hidden="true">☞</span><span>${line}</span></li>`).join("")}
      </ol>
    </div>`;
}

function grantQuestRewards(quest) {
  const items = PIRATI.expandRewards(quest);
  const crew = state.crew;
  const stamp = { questId: quest.id, day: state.day };
  const gained = [];
  items.forEach((item) => {
    if (item.type === "coins") { crew.coins += item.amount; gained.push(`${item.amount} monete`); }
    else if (item.type === "fame") { state.fame += item.amount; gained.push(`${item.amount} Fama`); }
    else if (item.type === "trophy") { crew.trophies.push({ id: item.id, ...stamp }); gained.push(`trofeo "${item.name}"`); }
    else if (item.type === "loot") { crew.loot.push({ id: item.id, ...stamp }); gained.push(item.name); }
    else if (item.type === "power") {
      if (!crew.powers.some((p) => p.id === item.id)) crew.powers.push({ id: item.id, ...stamp });
      gained.push(`potere "${item.name}"`);
    }
  });
  return gained;
}

/* --- carte leggendarie: si conquistano con un'impresa --------------------- */

function grantLegendary(id, reason) {
  if (!state.crew.powers) state.crew.powers = [];
  if (state.crew.powers.some((p) => p.id === id)) return false;
  const power = PIRATI.power(id);
  if (!power) return false;
  state.crew.powers.push({ id, questId: null, day: state.day, legendary: true });
  pushLog(`✨ CARTA LEGGENDARIA! La ciurma conquista "${power.name}". ${reason}`);
  return true;
}

/* Il Master può assegnarla a mano dalla console: piratiLeggendaria("cuore-abisso") */
window.piratiLeggendaria = function (id) {
  const ok = grantLegendary(id, "Assegnata dal Master.");
  if (ok) { saveState(); render(); }
  return ok;
};

function checkLegendaryGrants() {
  const done = new Set(state.questCampaign.completedQuestIds || []);
  const islandsCovered = PIRATI.islands.every((isl) =>
    PIRATI.islandQuests(isl.id).some((q) => done.has(q.id)));
  if (islandsCovered) {
    grantLegendary("bussola-sette-mari", "Un'avventura completata su ogni isola dell'arcipelago.");
  }
  if (state.players.length >= 4 && activePlayers().length === state.players.length && done.size >= 3) {
    grantLegendary("vessillo-ciurma", "La giornata perfetta: tutta la ciurma in gioco e un'avventura conclusa insieme.");
  }
}

function refreshGrade() {
  const done = state.questCampaign.completedQuestIds.length;
  const step = PIRATI.gradeForCompleted(done);
  const changed = step.grade !== state.crew.grade;
  state.crew.grade = step.grade;
  return changed ? step : null;
}

function questGrowthStat(quest, resolution) {
  const match = /crescita\s+(Coraggio|Astuzia|Fortuna)/i.exec(quest.growth || "");
  if (match) return match[1].toLowerCase();
  const approach = quest.choices[resolution?.approachIndex || 0];
  return approach ? approach.stat : "fortuna";
}

function completeQuest(questId) {
  const quest = CYCLE_ONE_QUESTS.find((entry) => entry.id === questId);
  if (!quest || state.questCampaign.completedQuestIds.includes(questId)) return;
  const resolution = state.questCampaign.resolution;
  const participantIds = (resolution?.playerIds || []).filter((id) => state.players.some((p) => p.id === id));
  const growthTargets = participantIds.length ? participantIds : state.players.map((p) => p.id);
  const growthStat = questGrowthStat(quest, resolution);
  growthTargets.forEach((id) => {
    const p = state.players.find((x) => x.id === id);
    if (!p) return;
    p.growth = p.growth || { coraggio: 0, astuzia: 0, fortuna: 0 };
    p.growth[growthStat] = (p.growth[growthStat] || 0) + 1;
    p.questsPlayed = (p.questsPlayed || 0) + 1;
  });
  const participantNames = (resolution?.playerIds || []).map((playerId) => state.players.find((player) => player.id === playerId)?.name).filter(Boolean);
  const resolutionNote = resolution?.mode === "question" && resolution.answer
    ? ` Soluzione della ciurma: ${resolution.answer}`
    : resolution?.result?.breakdown
      ? ` Prova di ${participantNames.join(", ")}: ${resolution.result.breakdown}.`
      : participantNames.length ? ` Hanno collaborato: ${participantNames.join(", ")}.` : "";
  state.questCampaign.completedQuestIds.push(questId);
  state.questCampaign.revealedQuestId = null;
  state.questCampaign.resolution = null;

  const gained = grantQuestRewards(quest);
  pushLog(`Quest completata: ${quest.title}.${resolutionNote} Premi: ${gained.join(", ")}. +1 crescita ${titleCase(growthStat)} a ${growthTargets.length} pirati.`);
  const gradeUp = refreshGrade();
  if (gradeUp) pushLog(`La ciurma sale al Grado ${gradeUp.grade}: ${gradeUp.name}! Nuovi poteri sbloccati.`);
  checkLegendaryGrants();

  if (state.voyage && state.voyage.pending && state.voyage.pending.questId === questId) {
    state.voyage.pending = null;
    state.voyage.message = `Avventura "${quest.title}" conclusa! Tornate alla Mappa e proseguite la rotta.`;
  }

  saveState();
  render();
}

function renderLog() {
  $("#log-list").innerHTML = state.log.length ? state.log.map((entry) => `
    <li><strong>Giorno ${entry.day}, turno ${entry.turn}</strong> <span>${entry.time}</span><br>${entry.text}</li>
  `).join("") : `<li>Il diario e vuoto.</li>`;
}

function renderPrint() {
  $("#print-board").innerHTML = DATA.board.map((space, index) => `
    <div class="board-space" data-kind="${space[1]}">
      <strong>${index + 1}. ${space[0]}</strong>
      <span>${space[2]}</span>
    </div>
  `).join("");

  $("#print-characters").innerHTML = DATA.characters.map((character) => `
    <figure class="print-power-card">
      <img src="${character.image}" alt="${character.name}"
        onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'print-card',innerHTML:'<h3>${character.name}</h3><p><strong>${character.role}</strong></p><p>${character.skill}</p>'}))">
    </figure>
  `).join("");

  const powersBox = $("#print-powers");
  if (powersBox) {
    powersBox.innerHTML = PIRATI.powers
      .slice()
      .sort((a, b) => a.grade - b.grade || a.category.localeCompare(b.category))
      .map((power) => `<figure class="print-power-card">
        <img src="${power.image}" alt="${power.name}">
      </figure>`).join("");
  }

  const oggettiBox = $("#print-oggetti");
  if (oggettiBox) {
    oggettiBox.innerHTML = DATA.characters.flatMap((character) =>
      (SPECIAL_ITEMS[character.id] || []).map((item) => `<figure class="print-power-card">
        <img src="${window.PIRATI_ASSET(`oggetti/${item.id}.webp`)}" alt="${item.name}">
      </figure>`)).join("");
  }

  const SCOPE_LABEL = { mare: "Mare", isola: "Isola", tesoro: "Tesoro", razzia: "Razzia" };
  const eventCards = (PIRATI.events && PIRATI.events.length ? PIRATI.events : []);
  $("#print-events").innerHTML = eventCards.length
    ? eventCards.map((sc) => `
      <article class="print-card">
        <p class="eyebrow">${SCOPE_LABEL[sc.scope] || sc.scope}</p>
        <h3>${sc.title}</h3>
        <p><em>“${sc.readAloud}”</em></p>
        ${sc.roll ? `<p><strong>${titleCase(sc.roll.stat)}:</strong> ${sc.roll.act}</p>` : ""}
        ${sc.choice ? `<p><strong>Scelta:</strong> ${sc.choice.map((c) => c.label).join(" / ")}</p>` : ""}
        ${sc.success ? `<p><strong>Riesce:</strong> ${sc.success}</p>` : ""}
        ${sc.fail ? `<p><strong>Fallisce:</strong> ${sc.fail}</p>` : ""}
      </article>`).join("")
    : DATA.events.map((event) => `
      <article class="print-card">
        <p class="eyebrow">${event.type}</p>
        <h3>${event.title}</h3>
        <p>${event.text}</p>
      </article>`).join("");

  const loot = DATA.treasures.map((treasure) => `
    <article class="print-card">
      <p class="eyebrow">Tesoro - ${treasure.rarity}</p>
      <h3>${treasure.title}</h3>
      <p>${treasure.text}</p>
    </article>
  `).join("");
  const enemies = allEnemies().concat(PIRATI.bosses || []).map((enemy) => `
    <article class="print-card">
      <p class="eyebrow">${enemy.boss ? "Boss" : "Nemico"} - Soglia ${enemy.threat}</p>
      <h3>${enemy.title}</h3>
      ${enemy.vibe ? `<p><em>${enemy.vibe}</em></p>` : ""}
      <p><strong>Ricompensa:</strong> ${enemy.reward}</p>
      <p><strong>Trucco:</strong> ${enemy.trick}</p>
    </article>
  `).join("");
  $("#print-loot-enemies").innerHTML = loot + enemies;
}

function render() {
  renderMission();
  renderResult();
  renderCrew();
  renderLibrary();
  renderItems();
  renderQuestCycle();
  renderTreasury();
  renderMap();
  renderBestiario();
  renderCrostone();
  renderLog();
  renderPrint();
}

function bindEvents() {
  $$('[data-view]').forEach((button) => {
    button.addEventListener("click", () => {
      const viewName = button.dataset.view;
      $$(".nav-item[data-view]").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === viewName));
      $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === `view-${viewName}`));
      closeNavDrawer();
      if (viewName === "crew" && window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY);
      }
      window.scrollTo(0, 0);
      if (button.dataset.view === "tesoreria") {
        lastShownCoins = 0;          // effetto: le monete "salgono" all'apertura
        renderTreasury();
      }
      const activeView = $(`#view-${button.dataset.view}`);
      if (activeView && window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(activeView, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" });
      }
    });
  });

  $$(".action-button").forEach((button) => {
    button.addEventListener("click", () => applyAction(button.dataset.action));
  });

  $("[data-tutorial-toggle]").addEventListener("click", () => {
    setTutorialOverlay($("#tutorial-overlay").getAttribute("aria-hidden") === "true");
  });
  $("#tutorial-prev").addEventListener("click", () => {
    if (tutorialStepIndex === 0) return;
    tutorialStepIndex -= 1;
    renderTutorialStep(-1);
  });
  $("#tutorial-next").addEventListener("click", () => {
    if (tutorialStepIndex === TUTORIAL_STEPS.length - 1) {
      setTutorialOverlay(false);
      return;
    }
    tutorialStepIndex += 1;
    renderTutorialStep(1);
  });

  const logoutBtn = $("#logout-btn");
  if (logoutBtn && window.PIRATI_AUTH && window.PIRATI_AUTH.enabled) {
    logoutBtn.hidden = false;
    logoutBtn.addEventListener("click", () => window.PIRATI_AUTH.signOut());
    window.PIRATI_AUTH.currentUser().then((u) => {
      const label = $("#logout-label");
      if (label && u && u.email) label.textContent = "Esci (" + u.email.split("@")[0] + ")";
    });
  }

  $("#new-session-btn").addEventListener("click", startNewSession);
  $("#add-player-btn").addEventListener("click", addPlayer);
  $("#seed-crew-btn")?.addEventListener("click", seedTestCrew);
  $("#undo-btn").addEventListener("click", restoreSnapshot);
  $("#print-btn").addEventListener("click", () => window.print());
  $("#export-save-btn").addEventListener("click", exportSave);
  $("#import-save-input").addEventListener("change", (event) => {
    importSave(event.target.files[0]);
    event.target.value = "";
  });
  $("#clear-log-btn").addEventListener("click", () => {
    state.log = [];
    saveState();
    render();
  });

  const particles = $("#magic-particles");
  particles.innerHTML = Array.from({ length: 32 }, (_, index) => `<i style="--x:${(index * 37) % 100}%;--y:${(index * 61) % 100}%;--delay:${(index % 11) * -0.7}s;--duration:${5 + (index % 6)}s;--size:${2 + (index % 4)}px"></i>`).join("");

  $("#character-prev").addEventListener("click", () => selectCarouselCharacter(characterCarouselIndex - 1));
  $("#character-next").addEventListener("click", () => selectCarouselCharacter(characterCarouselIndex + 1));
  let carouselStartX = null;
  $("#character-library").addEventListener("pointerdown", (event) => { carouselStartX = event.clientX; });
  $("#character-library").addEventListener("pointerup", (event) => {
    if (carouselStartX === null) return;
    const delta = event.clientX - carouselStartX;
    if (Math.abs(delta) > 45) selectCarouselCharacter(characterCarouselIndex + (delta < 0 ? 1 : -1));
    carouselStartX = null;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if ($("#tutorial-overlay").classList.contains("is-open")) setTutorialOverlay(false);
      else closeNavDrawer();
    }
    if (!$("#view-crew").classList.contains("is-active")) return;
    if (event.key === "ArrowLeft") selectCarouselCharacter(characterCarouselIndex - 1);
    if (event.key === "ArrowRight") selectCarouselCharacter(characterCarouselIndex + 1);
  });

  document.addEventListener("input", (event) => {
    const resolution = state.questCampaign?.resolution;
    if (!resolution) return;
    if (event.target.matches("[data-quest-roll]")) {
      resolution.rolls[event.target.dataset.questRoll] = event.target.value;
      resolution.result = null;
      saveState();
    }
    if (event.target.matches("[data-quest-answer]")) {
      resolution.answer = event.target.value;
      resolution.result = null;
      saveState();
    }
  });

  $("#nav-toggle").addEventListener("click", () => {
    setNavDrawer(!$("#app-nav").classList.contains("is-open"));
  });
  $("#nav-scrim").addEventListener("click", closeNavDrawer);

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-tutorial-close]")) setTutorialOverlay(false);
    const tutorialStep = event.target.closest("[data-tutorial-step]");
    if (tutorialStep) {
      const nextStep = Number(tutorialStep.dataset.tutorialStep);
      const direction = nextStep >= tutorialStepIndex ? 1 : -1;
      tutorialStepIndex = nextStep;
      renderTutorialStep(direction);
    }
    const dieButton = event.target.closest("[data-die]");
    if (dieButton) recordPhysicalRoll(Number(dieButton.dataset.die));

    const selectButton = event.target.closest("[data-select-player]");
    if (selectButton) {
      state.selectedPlayerId = selectButton.dataset.selectPlayer;
      saveState();
      render();
    }
    const removeButton = event.target.closest("[data-remove-player]");
    if (removeButton) removePlayer(removeButton.dataset.removePlayer);
    const toggleActiveButton = event.target.closest("[data-toggle-active]");
    if (toggleActiveButton) togglePlayerActive(toggleActiveButton.dataset.toggleActive);

    const characterJump = event.target.closest("[data-character-jump]");
    if (characterJump) selectCarouselCharacter(Number(characterJump.dataset.characterJump));
    const readCharacter = event.target.closest("[data-read-character]");
    if (readCharacter) {
      event.stopPropagation();
      characterDetailsOpen = !characterDetailsOpen;
      renderLibrary();
      return;
    }
    const carouselCard = event.target.closest("[data-carousel-card]");
    if (carouselCard) selectCarouselCharacter(Number(carouselCard.dataset.carouselCard));

    const itemCharacter = event.target.closest("[data-item-character]");
    if (itemCharacter) {
      itemsCharacterId = itemCharacter.dataset.itemCharacter;
      expandedItemId = null;
      $("#item-message").textContent = "";
      renderItems();
    }
    const expandItem = event.target.closest("[data-expand-item]");
    if (expandItem) {
      expandedItemId = expandedItemId === expandItem.dataset.expandItem ? null : expandItem.dataset.expandItem;
      renderItems();
    }
    const useItem = event.target.closest("[data-use-item]");
    if (useItem) useSpecialItem(useItem.dataset.ownerKey, useItem.dataset.characterId, useItem.dataset.useItem);

    const questIsland = event.target.closest("[data-quest-island]");
    if (questIsland) {
      state.questCampaign.selectedIslandId = questIsland.dataset.questIsland;
      state.questCampaign.revealedQuestId = null;
      saveState();
      renderQuestCycle();
    }
    const revealQuestButton = event.target.closest("[data-reveal-quest]");
    if (revealQuestButton) revealQuest(revealQuestButton.dataset.revealQuest);
    const readingLevelButton = event.target.closest("[data-reading-level]");
    if (readingLevelButton) {
      state.crew.readingLevel = readingLevelButton.dataset.readingLevel;
      saveState();
      renderQuestCycle();
    }
    const treasuryTabButton = event.target.closest("[data-treasury-tab]");
    if (treasuryTabButton) {
      treasuryTab = treasuryTabButton.dataset.treasuryTab;
      renderTreasury();
    }
    const awardGrowthButton = event.target.closest("[data-award-growth]");
    if (awardGrowthButton) {
      awardGrowth(awardGrowthButton.dataset.player, awardGrowthButton.dataset.stat, Number(awardGrowthButton.dataset.delta));
    }
    const prepareTodayButton = event.target.closest("[data-prepare-today]");
    if (prepareTodayButton) prepareTodayQuest(prepareTodayButton.dataset.prepareToday);
    if (event.target.closest("[data-end-school-day]")) endSchoolDay();

    const viewJump = event.target.closest("[data-view]");
    if (viewJump && !viewJump.classList.contains("nav-item")) showView(viewJump.dataset.view);

    if (event.target.closest("[data-crostone-ok]")) crostoneIndovinata();
    if (event.target.closest("[data-crostone-ko]")) crostoneSbagliata();
    const crostoneRecoverBtn = event.target.closest("[data-crostone-recover]");
    if (crostoneRecoverBtn) crostoneRecupera(crostoneRecoverBtn.dataset.crostoneRecover);

    const mapDie = event.target.closest("[data-map-die]");
    if (mapDie && state.voyage.pending) {
      const n = Number(mapDie.dataset.mapDie);
      if (state.voyage.pending.kind === "boss") resolveBossOffer(n);
      else if (state.voyage.pending.roll) resolveMapEncounter(n);
    }
    const bossOffer = event.target.closest("[data-boss-offer]");
    if (bossOffer) chooseBossOffer(Number(bossOffer.dataset.bossOffer));
    if (event.target.closest("[data-summon-boss]")) startBossEncounter();
    const moveDie = event.target.closest("[data-move-die]");
    if (moveDie) {
      const [pid, n] = moveDie.dataset.moveDie.split(":");
      setMoveDie(pid, Number(n));
    }
    if (event.target.closest("[data-crew-sail]")) doCrewMove();
    const mapRoute = event.target.closest("[data-map-route]");
    if (mapRoute) chooseRoute(Number(mapRoute.dataset.mapRoute));
    const mapActor = event.target.closest("[data-map-actor]");
    if (mapActor && state.voyage.pending) {
      state.voyage.pending.actorId = mapActor.dataset.mapActor;
      saveState();
      renderMap();
    }
    if (event.target.closest("[data-map-skip]")) skipMapEncounter();
    if (event.target.closest("[data-map-open-quest]")) openMapQuest();
    const eventChoice = event.target.closest("[data-event-choice]");
    if (eventChoice) resolveEventChoice(Number(eventChoice.dataset.eventChoice));
    const playCardBtn = event.target.closest("[data-play-card]");
    if (playCardBtn) playCard(playCardBtn.dataset.playCard);
    if (event.target.closest("[data-open-potenza]")) {
      treasuryTab = "potenza";
      showView("tesoreria");
    }
    const resolutionMode = event.target.closest("[data-resolution-mode]");
    if (resolutionMode && state.questCampaign.resolution) {
      state.questCampaign.resolution.mode = resolutionMode.dataset.resolutionMode;
      state.questCampaign.resolution.result = null;
      saveState();
      renderQuestCycle();
    }
    if (event.target.closest("[data-reroll-rollers]")) rerollQuestRollers();
    const rollerCountBtn = event.target.closest("[data-roller-count]");
    if (rollerCountBtn) setQuestRollerCount(Number(rollerCountBtn.dataset.rollerCount));
    const resolutionApproach = event.target.closest("[data-resolution-approach]");
    if (resolutionApproach && state.questCampaign.resolution) {
      state.questCampaign.resolution.approachIndex = Number(resolutionApproach.dataset.resolutionApproach);
      state.questCampaign.resolution.result = null;
      saveState();
      renderQuestCycle();
    }
    const playQuestCardBtn = event.target.closest("[data-play-quest-card]");
    if (playQuestCardBtn) playQuestCard(playQuestCardBtn.dataset.playQuestCard);
    if (event.target.closest("[data-resolve-dice]")) resolveCrewDice();
    if (event.target.closest("[data-question-hint]")) resolveGroupQuestion(false);
    if (event.target.closest("[data-resolve-question]")) resolveGroupQuestion(true);
    const completeQuestButton = event.target.closest("[data-complete-quest]");
    if (completeQuestButton) completeQuest(completeQuestButton.dataset.completeQuest);
    const supplyButton = event.target.closest("[data-supplies]");
    if (supplyButton) {
      state.questCampaign.supplies = Math.max(0, Math.min(12, state.questCampaign.supplies + Number(supplyButton.dataset.supplies)));
      saveState();
      renderQuestCycle();
    }
  });
}

bindEvents();
render();
