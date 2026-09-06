/* =============================================================================
   CATALOGO — Lo Show del Teschio Multicolore
   -----------------------------------------------------------------------------
   Sfide fisiche assurde e innocue: nessuna acrobazia, niente che possa far
   male. Tutti i pirati le fanno INSIEME, allo stesso momento, per pochi
   secondi. Alla fine il Master (cioe' il Teschio) decide chi ha tenuto.

   sfida     - l'istruzione chiara per i bambini
   annuncio  - la battuta del Teschio da leggere ad alta voce
   durata    - secondi del conto alla rovescia (8-30)
   premio    - monete personali a ogni pirata che ha tenuto
   ========================================================================== */

PIRATI.registerTeschioSfide([

  /* --- POSE: restare fermi in una posizione buffa --------------------- */
  { id: "gamba-sola", categoria: "posa", durata: 20, premio: 300000,
    sfida: "In piedi su una gamba sola. L'altro piede non tocca terra fino a STOP.",
    annuncio: "CIURMAAA! Tutti come i fenicotteri: su UNA gamba sola! Chi tocca terra, il Teschio lo fischia!" },
  { id: "albero", categoria: "posa", durata: 18, premio: 260000,
    sfida: "Fate l'albero: braccia dritte in alto, piedi uniti, immobili.",
    annuncio: "Diventate alberi! Braccia al cielo, radici ai piedi, e NON vi muove nemmeno il vento!" },
  { id: "statua-buffa", categoria: "posa", durata: 15, premio: 240000,
    sfida: "Ognuno sceglie una posa buffissima e resta congelato lì, fermo come una statua.",
    annuncio: "SIETE STATUE! Fate la faccia e la posa più assurde che avete... e adesso NON respirate. Ehm, respirate, ma non muovetevi!" },
  { id: "mani-in-testa", categoria: "posa", durata: 15, premio: 200000,
    sfida: "Mani intrecciate sopra la testa, gomiti in fuori, immobili.",
    annuncio: "Mani sulla testa come dei teschi che si tengono il cappello! E fermi!" },
  { id: "braccia-a-t", categoria: "posa", durata: 18, premio: 240000,
    sfida: "Braccia aperte a croce, dritte, parallele al pavimento. Non si abbassano.",
    annuncio: "Braccia a croce come le vele! Se una vela si affloscia, quel pirata è a terra!" },
  { id: "seduti-senza-schienale", categoria: "posa", durata: 20, premio: 280000,
    sfida: "Seduti sulla sedia con la schiena DRITTA, senza mai appoggiarsi allo schienale.",
    annuncio: "Schiena dritta, staccata dallo schienale! Il Teschio detesta i pirati mollicci!" },
  { id: "punta-di-piedi", categoria: "posa", durata: 12, premio: 220000,
    sfida: "In piedi sulle punte dei piedi, talloni sollevati, senza appoggiarsi a niente.",
    annuncio: "Tutti sulle punte! Più in alto! Come se steste sbirciando oltre il parapetto!" },
  { id: "occhi-chiusi-fermi", categoria: "posa", durata: 20, premio: 260000,
    sfida: "In piedi, occhi chiusi, immobili. Chi barcolla o riapre gli occhi è fuori.",
    annuncio: "Occhi CHIUSI e fermi come pietre. Il Teschio vede tutto anche al buio!" },

  /* --- SMORFIE: facce e gesti buffi da tenere senza ridere ----------- */
  { id: "dito-nel-naso", categoria: "smorfia", durata: 15, premio: 240000,
    sfida: "Un dito appoggiato (solo appoggiato!) sulla punta del naso. Senza ridere.",
    annuncio: "Dito sul naso, e guai a chi ride! Il Teschio non ride mai... o forse sì. Comunque VOI no!" },
  { id: "guance-gonfie", categoria: "smorfia", durata: 12, premio: 200000,
    sfida: "Guance gonfie piene d'aria, come dei palloni. Non si sgonfiano fino a STOP.",
    annuncio: "Guance da criceto! Riempitele d'aria e NON sbuffate! Il primo che fa PFFF è spacciato!" },
  { id: "linguaccia", categoria: "smorfia", durata: 12, premio: 200000,
    sfida: "Linguaccia fuori, più lunga che potete, ferma. Senza tirarla dentro.",
    annuncio: "LINGUACCIA! Fuori la lingua, tutti, come i cani stanchi! E tenetela fuori!" },
  { id: "occhi-spalancati", categoria: "smorfia", durata: 12, premio: 220000,
    sfida: "Occhi spalancati il più possibile senza sbattere le palpebre.",
    annuncio: "Occhi GIGANTI! Spalancati! Chi sbatte le palpebre... clap, il Teschio lo sente!" },
  { id: "bocca-a-pesce", categoria: "smorfia", durata: 12, premio: 190000,
    sfida: "Bocca a pesce (labbra in fuori) e fate finta di nuotare, fermi sul posto.",
    annuncio: "SIETE PESCI! Bocca a pesce, occhioni, e nuotate senza muovervi. Bloop bloop!" },
  { id: "sopracciglia-su", categoria: "smorfia", durata: 12, premio: 190000,
    sfida: "Sopracciglia alzate al massimo, faccia stupitissima, ferma.",
    annuncio: "Faccia da: «MA DAVVERO?!» Sopracciglia alle stelle e tenetele su!" },
  { id: "sorriso-forzato", categoria: "smorfia", durata: 15, premio: 220000,
    sfida: "Sorriso larghissimo, tutti i denti, fermo. Anche se non vi va per niente.",
    annuncio: "SORRIDETE! Tutti i denti! Il sorriso più finto e più largo del mondo. E non mollate!" },

  /* --- VERSI: fare un suono buffo tutti insieme ---------------------- */
  { id: "verso-gabbiano", categoria: "verso", durata: 10, premio: 170000,
    sfida: "Tutti insieme fate il verso del gabbiano, forte, senza fermarvi.",
    annuncio: "GABBIANI! Tutti a fare «KREEE KREEE» fino a STOP! Chi si zittisce è a terra!" },
  { id: "verso-motore", categoria: "verso", durata: 10, premio: 170000,
    sfida: "Fate il rumore di un motore che parte: «brum brum brummm», continuo.",
    annuncio: "ACCENDETE I MOTORI! «Brum brummm»! Tenete il motore acceso, niente pause!" },
  { id: "ronzio-api", categoria: "verso", durata: 12, premio: 180000,
    sfida: "Ronzate come api: «zzzzzz» ininterrotto, senza riprendere fiato rumorosamente.",
    annuncio: "Siete uno sciame! «ZZZZZZ» tutti insieme! L'ape che smette di ronzare... plof." },
  { id: "risata-finta", categoria: "verso", durata: 12, premio: 190000,
    sfida: "Ridete FINTO, «ah ah ah» a scatti, senza smettere e senza ridere per davvero.",
    annuncio: "Ridete finto! «AH. AH. AH.» Come i cattivi dei film! Ma se ridete VERO, avete perso!" },
  { id: "fischio-continuo", categoria: "verso", durata: 12, premio: 200000,
    sfida: "Fischio continuo (o «fiuuu» con la bocca se non sapete fischiare), senza pause.",
    annuncio: "Tutti a fischiare! Una nota sola, lunghissima! Chi resta senza fiato... è fuori!" },

  /* --- SCIOGLILINGUA: da dire INSIEME, 3 volte, senza sbagliare ------ */
  { id: "capra-campa", categoria: "scioglilingua", durata: 18, premio: 280000,
    sfida: "Dite insieme, TRE volte di fila, senza inciampare: «Sopra la panca la capra campa, sotto la panca la capra crepa».",
    annuncio: "SCIOGLILINGUA! Tutti insieme, tre volte: «Sopra la panca la capra campa, sotto la panca la capra crepa». Chi si imbroglia... crepa (per finta)!" },
  { id: "trentatre-trentini", categoria: "scioglilingua", durata: 20, premio: 320000,
    sfida: "Dite insieme, TRE volte: «Trentatré trentini entrarono a Trento tutti e trentatré trotterellando».",
    annuncio: "Il grande scioglilingua di Trento! «Trentatré trentini entrarono a Trento...» Tre volte, tutti in coro, e senza inciampi!" },
  { id: "tre-tigri", categoria: "scioglilingua", durata: 18, premio: 300000,
    sfida: "Dite insieme, TRE volte: «Tre tigri contro tre tigri».",
    annuncio: "«Tre tigri contro tre tigri»! Sembra facile. Non lo è. Tre volte, tutti insieme, VELOCI!" },
  { id: "cuoco-cuoce", categoria: "scioglilingua", durata: 18, premio: 280000,
    sfida: "Dite insieme, TRE volte: «Se il cuoco cuoce in cucina, chi cuoce in cucina se il cuoco non c'è?».",
    annuncio: "In cambusa! «Se il cuoco cuoce in cucina...» Tre volte, in coro, senza fare pasticci!" },
  { id: "apelle-apollo", categoria: "scioglilingua", durata: 15, premio: 250000,
    sfida: "Dite insieme, TRE volte: «Apelle figlio di Apollo fece una palla di pelle di pollo».",
    annuncio: "«Apelle figlio di Apollo fece una palla di pelle di pollo»! Tre volte! Chi dice «pelle di Apollo» ha perso!" },
  { id: "orologio", categoria: "scioglilingua", durata: 15, premio: 240000,
    sfida: "Dite insieme, TRE volte: «Sul tagliere l'aglio taglia, non tagliare la tovaglia».",
    annuncio: "«Sul tagliere l'aglio taglia, non tagliare la tovaglia»! Tre volte, tutti, e attenti alla tovaglia!" }

]);

PIRATI.registerTeschioFacce([
  { id: "sorpreso",     nome: "Il Teschio Sorpreso",        art: "a cartoon skull painted in rainbow stripes with huge round surprised eyes and a small 'o' mouth, toy figurine on white" },
  { id: "linguaccia",   nome: "Il Teschio Linguaccia",      art: "a rainbow-painted cartoon skull sticking out a long pink tongue, cheeky expression, toy figurine on white" },
  { id: "addormentato", nome: "Il Teschio Addormentato",    art: "a rainbow cartoon skull with closed eyes and a sleepy 'zzz', tiny nightcap, toy figurine on white" },
  { id: "furioso-buffo", nome: "Il Teschio Furioso Buffo",  art: "a rainbow cartoon skull with angry cartoon eyebrows but a goofy smile, steam from the ears, toy figurine on white" },
  { id: "occhiali",     nome: "Il Teschio con gli Occhiali", art: "a rainbow cartoon skull wearing oversized round glasses, wise look, toy figurine on white" },
  { id: "innamorato",   nome: "Il Teschio Innamorato",      art: "a rainbow cartoon skull with heart-shaped eyes and a dreamy smile, tiny floating hearts, toy figurine on white" },
  { id: "ciclope",      nome: "Il Teschio Ciclope",         art: "a rainbow cartoon skull with a single big eye in the middle, curious expression, toy figurine on white" },
  { id: "pois",         nome: "Il Teschio a Pois",          art: "a cartoon skull covered in big colorful polka dots, cheerful grin, toy figurine on white" },
  { id: "fluo",         nome: "Il Teschio Fluo",            art: "a cartoon skull glowing in neon green, pink and yellow, wide electric smile, toy figurine on white" },
  { id: "ghignante",    nome: "Il Teschio Ghignante",       art: "a rainbow cartoon skull with an enormous toothy mischievous grin, one raised brow, toy figurine on white" },
  { id: "timido",       nome: "Il Teschio Timido",          art: "a rainbow cartoon skull blushing, looking away shyly, tiny hands covering part of the face, toy figurine on white" },
  { id: "cantante",     nome: "Il Teschio Cantante",        art: "a rainbow cartoon skull singing into a tiny microphone, eyes shut, music notes around, toy figurine on white" },
  { id: "corona",       nome: "Il Teschio con la Corona",   art: "a rainbow cartoon skull wearing a small golden crown, regal but silly smile, toy figurine on white" },
  { id: "bagnato",      nome: "Il Teschio Bagnato",         art: "a rainbow cartoon skull dripping with water, a small rain cloud above, grumpy-funny face, toy figurine on white" },
  { id: "fischione",    nome: "Il Teschio Fischione",       art: "a rainbow cartoon skull whistling with pursed lips, one eye winking, sound lines, toy figurine on white" },
  { id: "perplesso",    nome: "Il Teschio Perplesso",       art: "a rainbow cartoon skull with a crooked mouth and one eye bigger than the other, confused look, toy figurine on white" },
  { id: "baffuto",      nome: "Il Teschio Baffuto",         art: "a rainbow cartoon skull with a huge curly fake moustache, proud expression, toy figurine on white" },
  { id: "esploso",      nome: "Il Teschio Esploso",         art: "a rainbow cartoon skull with hair standing on end and spiral eyes, as if just startled, toy figurine on white" }
]);
