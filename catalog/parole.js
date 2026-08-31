/* =============================================================================
   IL PESCE CROSTONE - le parole difficili del giorno
   -----------------------------------------------------------------------------
   Ogni giorno di scuola il Pesce Crostone tira fuori UNA parola difficile.
   La ciurma deve spiegare cosa vuol dire: è il lasciapassare per l'avventura.

     - indovinata subito  -> monete + lasciapassare del giorno, parola nel
                             "Libro delle Parole Impossibili"
     - non indovinata     -> il Pesce Crostone la segna sul "Taccuino Nero".
                             Stasera il Master spiega il significato; il giorno
                             dopo la ciurma lo ripete. Se il Master dà l'ok,
                             la parola passa al Libro (con un po' di monete).

   COME AGGIUNGERE PAROLE: copia un blocco qui sotto. Campi:
     id          identificatore unico (minuscolo, di solito = parola)
     parola      la parola come va mostrata
     significato spiegazione a misura di bambino (6-10 anni), una frase
     esempio     una frase d'esempio, meglio se "sa di mare"
     tranello    (facoltativo) l'errore tipico da cui mettere in guardia

   Le parole si "consumano": una volta uscite non tornano. Aggiungine quante
   ne servono (una al giorno, ~5 a settimana di scuola).
   ========================================================================== */

PIRATI.registerWords([

  {
    id: "abbacinato",
    parola: "abbacinato",
    significato: "accecato per un attimo da una luce fortissima, tanto forte che non riesci più a vedere.",
    esempio: "Quando il sole colpì l'oro del forziere, il capitano restò abbacinato e dovette chiudere gli occhi.",
    tranello: "Non c'entra il bacio né il bacino: c'entra la luce."
  },
  {
    id: "guazzabuglio",
    parola: "guazzabuglio",
    significato: "un gran disordine, un miscuglio confuso di tante cose messe insieme senza ordine.",
    esempio: "Nella stiva c'era un guazzabuglio di corde, mappe, calzini e gusci di noce di cocco."
  },
  {
    id: "trasecolare",
    parola: "trasecolare",
    significato: "restare a bocca aperta per la sorpresa, quasi non riuscire a crederci.",
    esempio: "La ciurma trasecolò: l'isola si era mossa! Non era un'isola, era una tartaruga gigante."
  },
  {
    id: "cianfrusaglia",
    parola: "cianfrusaglia",
    significato: "oggetti di poco valore, robetta inutile ammucchiata alla rinfusa.",
    esempio: "Il mercante svuotò il sacco: solo cianfrusaglie, bottoni spaiati e conchiglie rotte."
  },
  {
    id: "brulicare",
    parola: "brulicare",
    significato: "muoversi tutti insieme in tanti, fitti fitti, come fanno le formiche.",
    esempio: "Il molo brulicava di gabbiani in attesa che qualcuno lasciasse cadere un'aringa."
  },
  {
    id: "sgangherato",
    parola: "sgangherato",
    significato: "rotto e malandato, che sta insieme per miracolo e traballa da tutte le parti.",
    esempio: "Salirono su una barchetta sgangherata che perdeva acqua da tre punti diversi."
  },
  {
    id: "cocciuto",
    parola: "cocciuto",
    significato: "testardo: non cambia idea nemmeno quando ha torto marcio.",
    esempio: "Il mozzo era così cocciuto che remò contro corrente per un'ora pur di non ammettere lo sbaglio.",
    tranello: "Non vuol dire «pieno di cocci»: vuol dire testardo."
  },
  {
    id: "tramortito",
    parola: "tramortito",
    significato: "mezzo svenuto, stordito per un colpo o per un grande spavento.",
    esempio: "La botta d'onda lo lasciò tramortito sul ponte per qualche secondo."
  },
  {
    id: "farabutto",
    parola: "farabutto",
    significato: "una persona disonesta e imbrogliona, un mascalzone di cui non fidarsi.",
    esempio: "Quel farabutto aveva venduto la stessa mappa del tesoro a tre capitani diversi."
  },
  {
    id: "gongolare",
    parola: "gongolare",
    significato: "essere felicissimi e contenti, e non riuscire a nasconderlo.",
    esempio: "Il capitano gongolava: aveva indovinato l'indovinello della sirena al primo colpo."
  },
  {
    id: "rocambolesco",
    parola: "rocambolesco",
    significato: "pieno di colpi di scena avventurosi, così incredibile da sembrare inventato.",
    esempio: "Fu una fuga rocambolesca: saltarono di nave in nave inseguiti da un polpo gigante."
  },
  {
    id: "scombussolare",
    parola: "scombussolare",
    significato: "mettere sottosopra, confondere tutto e mandare all'aria i piani.",
    esempio: "La tempesta scombussolò la rotta: al mattino nessuno sapeva più dove fosse il nord."
  },
  {
    id: "sbigottito",
    parola: "sbigottito",
    significato: "molto stupito e un po' spaventato, così tanto da restare senza parole.",
    esempio: "Sbigottiti, guardarono la bottiglia galleggiare contro corrente, come spinta da una mano."
  },
  {
    id: "grattacapo",
    parola: "grattacapo",
    significato: "un problema fastidioso e difficile, di quelli che ti fanno grattare la testa.",
    esempio: "La serratura a tre chiavi fu un bel grattacapo: ci vollero due giorni per aprirla."
  },
  {
    id: "arcigno",
    parola: "arcigno",
    significato: "con la faccia dura e scontrosa, poco gentile e per niente sorridente.",
    esempio: "Il guardiano del faro era un tipo arcigno che rispondeva solo a grugniti."
  },
  {
    id: "temerario",
    parola: "temerario",
    significato: "coraggioso fino a essere imprudente: rischia anche quando non dovrebbe.",
    esempio: "Fu una scelta temeraria attraversare gli scogli di notte, ma andò bene.",
    tranello: "Non è proprio uguale a «coraggioso»: il temerario esagera col rischio."
  },
  {
    id: "guardingo",
    parola: "guardingo",
    significato: "che sta molto attento e sospettoso, con gli occhi bene aperti.",
    esempio: "Guardinghi, avanzarono nella caverna tastando ogni pietra prima di appoggiare il piede."
  },
  {
    id: "trambusto",
    parola: "trambusto",
    significato: "una gran confusione rumorosa: gente che corre, grida e sbatte cose.",
    esempio: "Al grido di «Terra!» sul ponte scoppiò un trambusto di stivali e ordini urlati."
  },
  {
    id: "scaltro",
    parola: "scaltro",
    significato: "furbo e sveglio: sa sempre come cavarsela con l'astuzia.",
    esempio: "La più scaltra della ciurma capì subito che la scorciatoia era una trappola."
  },
  {
    id: "melenso",
    parola: "melenso",
    significato: "sciocco e lento, un po' tonto e senza vivacità.",
    esempio: "Il pappagallo ripeteva la parola d'ordine con aria melensa, senza capirci niente."
  },
  {
    id: "esiguo",
    parola: "esiguo",
    significato: "piccolissimo come quantità: scarso, appena appena, quasi niente.",
    esempio: "Le scorte d'acqua erano ormai esigue: un sorso a testa e non di più."
  },
  {
    id: "meandro",
    parola: "meandro",
    significato: "una curva larga di un fiume; anche un percorso pieno di giri complicati.",
    esempio: "Risalirono i meandri del fiume per mezza giornata prima di trovare la cascata."
  },
  {
    id: "abborracciare",
    parola: "abborracciare",
    significato: "fare una cosa in fretta e male, alla buona, senza cura.",
    esempio: "Aveva abborracciato la riparazione della vela, e infatti si strappò di nuovo."
  },
  {
    id: "impavido",
    parola: "impavido",
    significato: "che non ha paura di niente, che resta calmo anche nel pericolo.",
    esempio: "Impavido, il timoniere tenne la rotta dritta dentro la nebbia."
  },
  {
    id: "bisbigliare",
    parola: "bisbigliare",
    significato: "parlare pianissimo, quasi soffiando le parole, per non farsi sentire.",
    esempio: "«C'è qualcuno nella stiva» bisbigliò, indicando l'ombra dietro i barili."
  },
  {
    id: "strampalato",
    parola: "strampalato",
    significato: "strano e un po' matto, fuori dal comune, che fa ridere per come è fatto.",
    esempio: "Aveva uno strampalato cappello con dentro una pianta, una bussola e un topo addormentato."
  },
  {
    id: "corroso",
    parola: "corroso",
    significato: "mangiato via a poco a poco dalla ruggine, dal sale o dal tempo.",
    esempio: "L'ancora era così corrosa dal mare che si sbriciolò appena la toccarono."
  },
  {
    id: "indomito",
    parola: "indomito",
    significato: "che non si lascia domare né fermare: non si arrende mai.",
    esempio: "Il vecchio capitano aveva un carattere indomito: più cadeva, più si rialzava."
  },
  {
    id: "sornione",
    parola: "sornione",
    significato: "furbo che fa finta di niente, con un sorrisetto che nasconde qualcosa.",
    esempio: "Il gatto di bordo se ne stava sornione sul sacco: sapeva benissimo dov'era finito il pesce."
  },
  {
    id: "baldanzoso",
    parola: "baldanzoso",
    significato: "pieno di sicurezza e di allegria, quasi spavaldo, senza un filo di timore.",
    esempio: "Sbarcarono baldanzosi, sicuri che l'isola fosse deserta. Non lo era."
  },
  {
    id: "lercio",
    parola: "lercio",
    significato: "sporchissimo, incrostato di sudiciume da tanto tempo.",
    esempio: "Le tende della locanda erano così lerce che non si capiva più di che colore fossero."
  },
  {
    id: "acciuffare",
    parola: "acciuffare",
    significato: "riuscire ad afferrare qualcuno o qualcosa che sta scappando.",
    esempio: "Acciuffò la mappa per un pelo, un attimo prima che il vento la portasse in mare."
  },
  {
    id: "sbertucciare",
    parola: "sbertucciare",
    significato: "prendere in giro qualcuno apertamente, sfotterlo davanti a tutti.",
    esempio: "Smettetela di sbertucciare il mozzo solo perché ha paura delle onde alte."
  },
  {
    id: "pavido",
    parola: "pavido",
    significato: "pauroso, che si spaventa facilmente. È il contrario di impavido.",
    esempio: "Non era pavido: era prudente. C'è differenza.",
    tranello: "Attenti: pavido = pauroso, impavido = senza paura. Cambia tutto per una sillaba."
  },
  {
    id: "fragoroso",
    parola: "fragoroso",
    significato: "che fa un rumore enorme, un gran fracasso.",
    esempio: "Un tuono fragoroso fece tremare l'albero maestro da cima a fondo."
  },
  {
    id: "cimentarsi",
    parola: "cimentarsi",
    significato: "mettersi alla prova in qualcosa di difficile, provarci davvero.",
    esempio: "Chi vuole cimentarsi col nodo del marinaio? Chi lo scioglie tiene la lanterna stanotte."
  }

]);
