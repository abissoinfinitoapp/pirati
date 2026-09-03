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
    { id: "foglia-finale",             name: "Foglia del Finale",         icon: "🍂", rarity: "comune", text: "Sussurrata a un racconto, gli regala un finale a scelta della ciurma." }
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
    { id: "voce-degli-alberi",       name: "Voce degli Alberi",       icon: "🌳", text: "Hai ridato un finale a ogni storia della Biblioteca degli Alberi." }
  ],

  /* --- TITOLI: onorificenze della ciurma (per usi futuri / Gradi) ------- */
  title: [
    { id: "ciurma-dei-mille-premi", name: "Ciurma dei Mille Premi", icon: "👑", text: "Avete riempito una Sala dei Trofei intera." }
  ]

});
