/* =============================================================================
   MAPPA - Arcipelago del Teschio d'Oro
   -----------------------------------------------------------------------------
   Solo dati. La nave della ciurma si muove su queste caselle.
   Coordinate x,y su una griglia 0..100 (la mappa SVG le usa per disegnare).

   Caselle ammesse in "spaces" e "loop":
     mare   - rotta tranquilla, non succede niente
     costa  - approdo tranquillo su un'isola
     evento - pesca una carta Evento
     mostro - creatura marina o di terra: prova di Coraggio
     assalto- una ciurma rivale attacca: prova, in caso di sconfitta si perde qualcosa
     razzia - relitto / accampamento da saccheggiare: prova di Astuzia, si guadagna
     tesoro - forziere: prova di Fortuna, si guadagna bottino
     quest  - avventura dell'isola: apre la scheda quest completa
   ========================================================================== */

PIRATI.registerMap({
  id: "arcipelago-teschio",
  start: "porto",

  nodes: [
    { id: "porto",     name: "Porto del Teschio", icon: "⚓", x: 50, y: 50, home: true,
      loop: ["porto"] },

    { id: "rovine",    name: "Rovine della Giungla",  icon: "♜", x: 50, y: 13, island: "rovine",
      loop: ["costa", "quest", "tesoro", "quest", "mostro"] },
    { id: "vulcano",   name: "Vulcano Ruggente",      icon: "▲", x: 78, y: 23, island: "vulcano",
      loop: ["costa", "mostro", "quest", "quest", "tesoro"] },
    { id: "corallo",   name: "Forte di Corallo",      icon: "♛", x: 88, y: 50, island: "corallo",
      loop: ["costa", "quest", "evento", "quest", "razzia"] },
    { id: "palude",    name: "Mangrovie Sussurranti", icon: "♧", x: 78, y: 77, island: "palude",
      loop: ["costa", "quest", "mostro", "quest", "tesoro"] },
    { id: "grotta",    name: "Grotta della Luna",     icon: "☾", x: 50, y: 87, island: "grotta",
      loop: ["costa", "quest", "tesoro", "quest", "evento"] },
    { id: "cascata",   name: "Laguna delle Cascate",  icon: "≋", x: 22, y: 77, island: "cascata",
      loop: ["costa", "quest", "evento", "quest", "mostro"] },
    { id: "scogliere", name: "Scogliere del Vento",   icon: "⌁", x: 12, y: 50, island: "scogliere",
      loop: ["costa", "quest", "mostro", "quest", "tesoro"] },
    { id: "tesoro",    name: "Spiaggia Dorata",       icon: "◆", x: 22, y: 23, island: "tesoro",
      loop: ["costa", "quest", "razzia", "quest", "tesoro"] }
  ],

  /* Tratte di mare. Sono bidirezionali: se le percorri al contrario
     le caselle vengono lette in ordine inverso. */
  legs: [
    /* raggi: dal Porto centrale a ogni isola */
    { id: "porto-rovine",    from: "porto", to: "rovine",    spaces: ["mare", "evento", "mare", "mostro", "mare", "tesoro"] },
    { id: "porto-vulcano",   from: "porto", to: "vulcano",   spaces: ["mare", "mare", "razzia", "mare", "evento", "mare"] },
    { id: "porto-corallo",   from: "porto", to: "corallo",   spaces: ["mare", "mostro", "mare", "mare", "tesoro", "mare"] },
    { id: "porto-palude",    from: "porto", to: "palude",    spaces: ["mare", "evento", "mare", "assalto", "mare", "mare"] },
    { id: "porto-grotta",    from: "porto", to: "grotta",    spaces: ["mare", "mare", "tesoro", "mare", "mostro", "mare"] },
    { id: "porto-cascata",   from: "porto", to: "cascata",   spaces: ["mare", "razzia", "mare", "mare", "evento", "mare"] },
    { id: "porto-scogliere", from: "porto", to: "scogliere", spaces: ["mare", "mare", "evento", "mostro", "mare", "mare"] },
    { id: "porto-tesoro",    from: "porto", to: "tesoro",    spaces: ["mare", "tesoro", "mare", "assalto", "mare", "evento"] },

    /* anello: da un'isola alla successiva senza tornare al Porto */
    { id: "rovine-vulcano",     from: "rovine",    to: "vulcano",   spaces: ["mare", "mostro", "mare", "evento"] },
    { id: "vulcano-corallo",    from: "vulcano",   to: "corallo",   spaces: ["mare", "mare", "tesoro", "mare"] },
    { id: "corallo-palude",     from: "corallo",   to: "palude",    spaces: ["mare", "evento", "mare", "mostro"] },
    { id: "palude-grotta",      from: "palude",    to: "grotta",    spaces: ["mare", "razzia", "mare", "mare"] },
    { id: "grotta-cascata",     from: "grotta",    to: "cascata",   spaces: ["mare", "mare", "evento", "tesoro"] },
    { id: "cascata-scogliere",  from: "cascata",   to: "scogliere", spaces: ["mare", "mostro", "mare", "mare"] },
    { id: "scogliere-tesoro",   from: "scogliere", to: "tesoro",    spaces: ["mare", "evento", "mare", "razzia"] },
    { id: "tesoro-rovine",      from: "tesoro",    to: "rovine",    spaces: ["mare", "mare", "mostro", "mare"] }
  ]
});
