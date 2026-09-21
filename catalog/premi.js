/* =============================================================================
   CATALOGO PREMI - bottino, trofei, titoli
   -----------------------------------------------------------------------------
   Ogni quest, nel suo campo "rewards", cita questi premi per 'id'.
   Se aggiungi un premio a una quest, aggiungilo anche qui (o il motore
   scrivera' un avviso in console).

   rarity: "comune" | "raro" | "epico"   -> cambia solo il colore della carta
   ========================================================================== */

PIRATI.registerRewards({

  /* --- BOTTINO: oggetti utili che restano alla ciurma -------------------- */
  loot: [
    { id: "tavoletta-vento",           name: "Tavoletta del Vento",       icon: "🪨", rarity: "raro",   text: "Una rotta via terra diventa sicura: niente eventi di pericolo mentre la seguite." },
    { id: "richiamo-stormo",           name: "Richiamo dello Stormo",     icon: "🦜", rarity: "raro",   text: "Un messaggio può raggiungere qualsiasi isola in una notte." },
    { id: "pietra-tiepida",            name: "Pietra Tiepida",            icon: "🔆", rarity: "comune", text: "Annulla una conseguenza di freddo, ghiaccio o tempesta." },
    { id: "scaglia-lucente",           name: "Scaglia Lucente",           icon: "✨", rarity: "comune", text: "Illumina una stanza buia senza torcia e senza fumo." },
    { id: "conchiglia-veritiera-loot", name: "Conchiglia della Verità",   icon: "🐚", rarity: "raro",   text: "Una volta per giorno rivela se una frase appena detta è vera o falsa." },
    { id: "campanella-marea",          name: "Campanella di Marea",       icon: "🔔", rarity: "comune", text: "Richiama una piccola barca fino alla costa più vicina." },
    { id: "seme-bussola-loot",         name: "Seme Bussola",              icon: "🧭", rarity: "comune", text: "Piantato a terra, indica sempre da che parte è la costa." },
    { id: "palafitta-loot",            name: "Palafitta Pieghevole",      icon: "🏚️", rarity: "raro",   text: "Si apre in un riparo sicuro per tutta la ciurma bloccata su un'isola." },
    { id: "barattolo-eco-loot",        name: "Barattolo d'Eco",           icon: "🫙", rarity: "raro",   text: "Conserva una parola d'ordine o un rumore e lo ripete quando serve." },
    { id: "fiala-lucciole",            name: "Fiala di Lucciole",         icon: "🪔", rarity: "comune", text: "Luce azzurra che fa galleggiare gli oggetti piccoli per una scena." },
    { id: "perla-respiro-loot",        name: "Perla del Respiro",         icon: "🫧", rarity: "raro",   text: "Chi la tiene in bocca respira sott'acqua per un'intera scena." },
    { id: "bottiglia-corrente-loot",   name: "Bottiglia di Corrente",     icon: "🌊", rarity: "raro",   text: "Versata in acqua, spinge la nave di tre zone nella direzione scelta." },
    { id: "vela-nuvola-loot",          name: "Vela di Nuvola",            icon: "☁️", rarity: "epico",  text: "La nave attraversa una rotta senza consumare Rifornimenti." },
    { id: "uovo-brezza-loot",          name: "Uovo di Brezza",            icon: "🥚", rarity: "raro",   text: "Aprendolo, libera un vento che soffia via nebbia, gas o fumo." },
    { id: "chiave-maree-loot",         name: "Chiave delle Maree",        icon: "🗝️", rarity: "epico",  text: "Apre un forziere o una porta rara senza bisogno di una prova." },
    { id: "stella-ciurma-loot",        name: "Frammento di Stella",       icon: "💫", rarity: "epico",  text: "Custodito insieme, ricorda alla ciurma tutte le avventure del ciclo." },
    { id: "cuscino-capitano",          name: "Cuscino del Capitano",      icon: "🛏️", rarity: "comune", text: "Una volta, trasforma un riposo scomodo in un riposo perfetto." },
    { id: "scarpe-saltellanti-loot",   name: "Scarpe Saltellanti",        icon: "👟", rarity: "raro",   text: "Una volta al giorno superano un piccolo ostacolo con un balzo." },
    { id: "pennarello-magico",         name: "Pennarello Magico",         icon: "🖍️", rarity: "raro",   text: "Disegna una freccia o un simbolo che resta visibile per una scena." },
    { id: "aquilone-cavalcabile",      name: "Aquilone Cavalcabile",      icon: "🪁", rarity: "raro",   text: "Porta un pirata oltre un ostacolo o fino a un punto alto." },
    { id: "pozione-rutto",             name: "Pozione Ruttante",          icon: "🧪", rarity: "comune", text: "Produce un rutto così forte da distrarre tutti per un istante." },
    { id: "mantello-meta-invisibile",  name: "Mantello Invisibile a Metà", icon: "🧥", rarity: "raro",   text: "Nasconde perfettamente metà di chi lo indossa; la ciurma decide quale." },

    /* --- Ciclo II · La Rotta delle Maree Perdute --- */
    { id: "frammento-ombra",           name: "Frammento d'Ombra",         icon: "🌑", rarity: "raro",   text: "Illuminato dalla Stella della Ciurma, punta verso la nave misteriosa." },
    { id: "foglia-finale",             name: "Foglia del Finale",         icon: "🍂", rarity: "comune", text: "Sussurrata a un racconto, gli regala un finale a scelta della ciurma." },
    { id: "fischietto-coraggio",       name: "Fischietto del Coraggio",    icon: "🎺", rarity: "comune", text: "Soffiato piano, dà a chi ha paura la spinta per fare comunque la cosa giusta. Una volta." },
    { id: "medaglia-bel-gioco",        name: "Medaglia del Bel Gioco",     icon: "🏅", rarity: "comune", text: "Chi la porta può ripetere una prova andata male per colpa di un imbroglio altrui." },
    { id: "sigillo-del-perdono",       name: "Sigillo del Perdono",        icon: "📜", rarity: "comune", text: "Mostrato a chi ha sbagliato, gli apre una via per rimediare invece di una punizione." },
    { id: "chiave-del-forse",          name: "Chiave del Forse",           icon: "🗝️", rarity: "raro",   text: "Apre una porta che ha detto no, se le fai la domanda giusta. Una volta." },
    { id: "taccuino-dei-nomi",         name: "Taccuino dei Nomi",          icon: "📓", rarity: "comune", text: "Ci scrivi il nome di qualcosa che l'ha perso: per un giorno quel nome torna vero." },
    { id: "lente-della-calma",         name: "Lente della Calma",          icon: "🔍", rarity: "raro",   text: "Guardata attraverso, una cosa spaventosa mostra com'è davvero, senza la paura addosso." },
    { id: "boccetta-di-colore",        name: "Boccetta di Colore",         icon: "🎨", rarity: "comune", text: "Versata su qualcosa di grigio o spento, gli ridà un colore vivo per una scena." },
    { id: "coperta-presentazioni",     name: "Coperta delle Presentazioni", icon: "🛏️", rarity: "raro",   text: "Sotto questa coperta due che si temono possono parlarsi senza vedersi, finché non sono pronti." },
    { id: "bolla-di-risata",           name: "Bolla di Risata",            icon: "🫧", rarity: "comune", text: "Aperta, libera una risata contagiosa: per una scena tutti nei paraggi hanno voglia di ridere." },
    { id: "ciottolo-delle-scelte",     name: "Ciottolo delle Scelte",      icon: "🪨", rarity: "raro",   text: "Tenuto in mano da tutta la ciurma mentre si decide, aiuta a scegliere insieme senza litigare." },
    { id: "banderuola-sincera",        name: "Banderuola Sincera",         icon: "🧭", rarity: "comune", text: "Puntata verso chi sta parlando, si gira davvero verso di lui solo se dice la verità." },
    { id: "rete-del-vento",            name: "Rete del Vento",             icon: "🪤", rarity: "raro",   text: "Lanciata in aria, ferma per un momento tutto quello che il vento sta portando via." },
    { id: "pacchetto-che-non-finisce", name: "Pacchetto che Non Finisce",  icon: "🎁", rarity: "raro",   text: "Dentro c'è sempre il regalo giusto per la persona che hai davanti. Una volta." },
    { id: "bussola-oltre-i-confini",   name: "Bussola Oltre i Confini",    icon: "🧭", rarity: "epico",  text: "Non punta al nord: punta alla prossima avventura che la ciurma non ha ancora vissuto." },

    /* --- La casa di Nonna Belarda: quando esplode, tocca a queste ---
       'id' = nome file in assets/premi/ (e su R2 in img/pirati/premi/), niente
       corrispondenza col testo del nome: le immagini sono già state disegnate
       con questi nomi più corti, l'id le segue invece di rinominarle. --- */
    { id: "barchetta-latta",     name: "Barchetta di Latta",         icon: "🛶", rarity: "comune", image: window.PIRATI_ASSET("premi/barchetta-latta.webp"),        text: "Galleggia davvero in una bacinella: perfetta per provare in anticipo se una rotta è sicura." },
    { id: "galeone-bottiglia",   name: "Galeone in Bottiglia",       icon: "🍾", rarity: "raro",   image: window.PIRATI_ASSET("premi/galeone-bottiglia.webp"),      text: "Un veliero perfetto, incastrato per sempre dentro il vetro. Nessuno sa come ci sia entrato." },
    { id: "vascello-sogni",      name: "Vascello dei Sogni",         icon: "⛵", rarity: "epico",  image: window.PIRATI_ASSET("premi/vascello-sogni.webp"),         text: "Tenuto vicino al cuscino, si dice regali il sogno più bello della settimana." },
    { id: "collana-perle",       name: "Collana di Perle Vere",      icon: "📿", rarity: "raro",   image: window.PIRATI_ASSET("premi/collana-perle.webp"),          text: "Ogni perla è un po' storta: Nonna Belarda giura di averle pescate una a una." },
    { id: "anello-gemma",        name: "Anello con la Gemma Verde",  icon: "💍", rarity: "epico",  image: window.PIRATI_ASSET("premi/anello-gemma.webp"),           text: "La gemma cambia leggermente colore quando chi lo indossa dice una bugia." },
    { id: "corona-ammaccata",    name: "Corona Ammaccata",           icon: "👑", rarity: "raro",   image: window.PIRATI_ASSET("premi/corona-ammaccata.webp"),       text: "Ha una punta per ogni pirata della ciurma, tranne una: quella manca da sempre." },
    { id: "moneta-gigante",      name: "Moneta d'Oro Gigante",       icon: "🪙", rarity: "comune", image: window.PIRATI_ASSET("premi/moneta-gigante.webp"),         text: "Troppo grande per spenderla: va solo mostrata in giro con orgoglio." },
    { id: "scrigno-velluto",     name: "Scrigno di Velluto",         icon: "🎁", rarity: "raro",   image: window.PIRATI_ASSET("premi/scrigno-velluto.webp"),        text: "Vuoto quando lo trovate: perfetto per custodire il prossimo tesoro della ciurma." },
    { id: "occhiali-vetro",      name: "Occhiale con un Solo Vetro", icon: "🕶️", rarity: "comune", image: window.PIRATI_ASSET("premi/occhiali-vetro.webp"),         text: "Chi lo indossa vede tutto doppio da un lato e benissimo dall'altro." },
    { id: "pappagallo-canta",    name: "Pappagallo Impagliato che Canta Ancora", icon: "🦜", rarity: "raro", image: window.PIRATI_ASSET("premi/pappagallo-canta.webp"),  text: "Ogni tanto, senza motivo, intona due note di una vecchia canzone di mare." },
    { id: "mappa-isola",         name: "Mappa di un'Isola che Non Esiste", icon: "🗺️", rarity: "epico", image: window.PIRATI_ASSET("premi/mappa-isola.webp"),       text: "Segnata con una X bellissima, in un punto dove il mare è solo mare." },
    { id: "cannocchiale-arruginito", name: "Cannocchiale Arrugginito ma Preciso", icon: "🔭", rarity: "comune", image: window.PIRATI_ASSET("premi/cannocchiale-arruginito.webp"), text: "Scricchiola tutto, ma inquadra le cose lontane meglio di uno nuovo." },
    { id: "vecchio-timone",      name: "Vecchio Timone di Legno",    icon: "☸️", rarity: "raro",   image: window.PIRATI_ASSET("premi/vecchio-timone.webp"),         text: "Consumato da mille mani: si dice ricordi da solo le rotte già navigate." },
    { id: "bussola-nord",        name: "Bussola che Punta Sempre a Nord-Ovest", icon: "🧭", rarity: "comune", image: window.PIRATI_ASSET("premi/bussola-nord.webp"),      text: "Rotta o no, l'ago non ne vuole sapere di guardare altrove." }
  ],

  /* --- TROFEI: ricordi da appendere nella Sala dei Trofei --------------- */
  trophy: [
    { id: "eroe-del-tempio",         name: "Eroe del Tempio",         icon: "🏆", text: "Hai calmato il Tempio che Starnutisce." },
    { id: "voce-dello-stormo",       name: "Voce dello Stormo",       icon: "🎖️", text: "Hai convinto mille pappagalli a ricostruire il ponte." },
    { id: "cuoco-del-cratere",       name: "Cuoco del Cratere",       icon: "🍲", text: "Hai preparato la zuppa che ha calmato il vulcano." },
    { id: "amico-della-salamandra",  name: "Amico della Salamandra",  icon: "🦎", text: "Hai ritrovato l'uovo perduto prima del tramonto." },
    { id: "custode-della-verita",    name: "Custode della Verità",    icon: "⚖️", text: "Hai scelto la conchiglia che diceva il vero." },
    { id: "ballerino-delle-onde",    name: "Ballerino delle Onde",    icon: "💃", text: "Hai raggiunto la campana ballando sul pavimento del mare." },
    { id: "guida-nella-nebbia",      name: "Guida nella Nebbia",      icon: "🌫️", text: "Hai tenuto unita la ciurma fino alla casa della Custode." },
    { id: "domatore-di-case",        name: "Domatore di Case",        icon: "🏠", text: "Hai fermato la casa che camminava prima del mare." },
    { id: "liberatore-di-eco",       name: "Liberatore di Eco",       icon: "📣", text: "Hai riaperto tutti i barattoli senza svegliare il cristallo." },
    { id: "primo-volo",              name: "Primo Volo",              icon: "🪁", text: "Sei stato il primo a staccarti da terra con la pozione." },
    { id: "voce-gentile",            name: "Voce Gentile",            icon: "🌸", text: "Hai svegliato la sirena con un sogno, non con un urlo." },
    { id: "raddrizza-fiumi",         name: "Raddrizza-Fiumi",        icon: "🏞️", text: "Hai rimesso il fiume nella direzione giusta." },
    { id: "riparatore-del-cielo",    name: "Riparatore del Cielo",    icon: "🛠️", text: "Hai rimontato la pala del Mulino delle Nuvole." },
    { id: "custode-dei-venti",       name: "Custode dei Venti",       icon: "🪺", text: "Hai messo al sicuro le tre uova di vento." },
    { id: "amico-della-banca",       name: "Amico della Banca",       icon: "🦀", text: "Hai convinto il Granchio Banchiere con uno scambio giusto." },
    { id: "stella-della-ciurma",     name: "Stella della Ciurma",     icon: "🌟", text: "Avete scelto un desiderio comune e chiuso il primo ciclo." },
    { id: "sonno-dell-abisso",       name: "Il Sonno dell'Abisso",    icon: "🌊", text: "Avete fatto tornare a dormire Barbabisso, il Vecchio del Fondale." },

    /* --- Ciclo II · La Rotta delle Maree Perdute --- */
    { id: "luce-delle-ombre",        name: "Luce delle Ombre",        icon: "🕯️", text: "Hai riportato a casa le ombre della ciurma e sentito la voce sulla nave." },
    { id: "voce-degli-alberi",       name: "Voce degli Alberi",       icon: "🌳", text: "Hai ridato un finale a ogni storia della Biblioteca degli Alberi." },
    { id: "amico-del-vulcano",       name: "Amico del Vulcano",       icon: "🌋", text: "Hai insegnato al Vulcano Ruggente a fare rumore senza fare paura." },
    { id: "giudice-gara-storta",     name: "Giudice della Gara Storta", icon: "🐌", text: "Hai finito la gara dei giganti minuscoli e sistemato chi barava." },
    { id: "ciurma-assolta",          name: "Ciurma Assolta",          icon: "⚖️", text: "Hai mostrato al Tribunale del Corallo cosa la ciurma ha imparato dai suoi errori." },
    { id: "passa-porte",             name: "Passa-Porte",             icon: "🚪", text: "Hai attraversato la Porta che Dice Sempre No senza forzarla." },
    { id: "ridai-i-nomi",            name: "Ridai-Nomi",              icon: "🏷️", text: "Hai restituito il suo nome a ogni cosa del villaggio che li aveva persi." },
    { id: "domatore-di-paure",       name: "Domatore di Paure",       icon: "👁️", text: "Hai guardato in faccia la Bestia che Nessuno aveva Visto." },
    { id: "libera-colori",           name: "Libera-Colori",           icon: "🌈", text: "Hai liberato i colori della Grotta della Luna e li hai messi d'accordo." },
    { id: "pace-tra-mostri",         name: "Pace tra Mostri",         icon: "🤝", text: "Hai fatto diventare amici un gigante e il mostro sotto il suo letto." },
    { id: "ridai-le-risate",         name: "Ridai-Risate",            icon: "😄", text: "Hai ripescato dalla laguna la risata di ogni abitante delle Cascate." },
    { id: "strada-scelta-insieme",   name: "Strada Scelta Insieme",   icon: "🛤️", text: "Hai preso la Cascata delle Decisioni e ne hai accettato le conseguenze con la ciurma." },
    { id: "smonta-bugie",            name: "Smonta-Bugie",            icon: "🕵️", text: "Hai scoperto la regola del Vento che Dice Bugie e sei arrivato in cima." },
    { id: "salva-cose-che-volano",   name: "Salva-Volanti",           icon: "🎈", text: "Hai deciso cosa salvare nel Paese dove Tutto Vola, e l'hai salvato." },
    { id: "tesoro-donato",           name: "Tesoro Donato",           icon: "🎁", text: "Hai capito la regola del Tesoro che Vuole Essere Regalato e l'hai distribuito." },
    { id: "liberatore-cose-impossibili", name: "Liberatore delle Cose Impossibili", icon: "🌟", text: "Hai liberato ombre, nomi, colori, risate e vento dalla nave misteriosa, e deciso cosa fare del pirata solitario." }
  ],

  /* --- TITOLI: onorificenze della ciurma (per usi futuri / Gradi) ------- */
  title: [
    { id: "ciurma-dei-mille-premi", name: "Ciurma dei Mille Premi", icon: "👑", text: "Avete riempito una Sala dei Trofei intera." }
  ]

});
