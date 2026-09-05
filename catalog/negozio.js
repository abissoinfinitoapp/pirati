/* =============================================================================
   CATALOGO — Il Negozio delle Cose Inutili
   -----------------------------------------------------------------------------
   Oggetti che non servono a NIENTE, ma comprarne a valanghe alza il Prestigio
   del pirata. Il Prestigio si guadagna SOLO qui, comprando a quintali.

   Ogni oggetto:
     price       - quanto costa UNO (monete personali del pirata)
     perPrestigio - quanti pezzi servono per +1 punto Prestigio
   Il costo per un punto di Prestigio è price × perPrestigio: sta più o meno
   tra 40.000 e 250.000. Le figure stilizzate ("action figure") costano di più
   per punto: fare un esercito di 1.000 supereroi è più assurdo di 1.000 elastici.

   "art" è il prompt per generare l'immagine (vedi docs/negozio-prompt-immagini.txt).
   Le figure di persone famose NON sono realistiche: sono giocattoli di plastica
   in stile action figure, nomi inventati, nessuna somiglianza reale.
   ========================================================================== */

PIRATI.registerNegozio([

  /* --- Cianfrusaglie assurde ------------------------------------------- */
  { id: "unicorno-rosa",     name: "Unicorno Rosa in Miniatura",        categoria: "assurdo", price: 10,   perPrestigio: 5000, art: "tiny glossy pink plastic unicorn figurine, toy photography on white" },
  { id: "banana-gomma",      name: "Banana di Gomma",                    categoria: "assurdo", price: 1000, perPrestigio: 200,  art: "a single rubber banana toy, bright yellow, studio product shot on white" },
  { id: "elastico-arcobaleno", name: "Elastico Arcobaleno",             categoria: "assurdo", price: 5,    perPrestigio: 8000, art: "one colorful rubber loom band, close-up product shot on white" },
  { id: "calzino-spaiato",   name: "Calzino Spaiato da Collezione",      categoria: "assurdo", price: 50,   perPrestigio: 1500, art: "one lonely mismatched striped sock, folded, product shot on white" },
  { id: "sasso-faccina",     name: "Sasso Dipinto con la Faccina",       categoria: "assurdo", price: 30,   perPrestigio: 2200, art: "a smooth pebble hand-painted with a smiling face, product shot on white" },
  { id: "graffetta-oro",     name: "Graffetta Dorata Firmata",           categoria: "assurdo", price: 20,   perPrestigio: 3000, art: "a single gold-coloured paperclip on a tiny display stand, product shot on white" },
  { id: "papera-mini",       name: "Paperella di Gomma Minuscola",       categoria: "assurdo", price: 80,   perPrestigio: 900,  art: "a very small yellow rubber duck, macro product shot on white" },
  { id: "adesivi-brillanti", name: "Foglio di Adesivi Brillantinati",    categoria: "assurdo", price: 200,  perPrestigio: 500,  art: "a sheet of glittery star and heart stickers, flat lay on white" },
  { id: "baffo-finto",       name: "Baffo Finto Adesivo",               categoria: "assurdo", price: 120,  perPrestigio: 700,  art: "a fake self-adhesive black curly moustache, product shot on white" },
  { id: "biglia-galassia",   name: "Biglia Galassia",                    categoria: "assurdo", price: 40,   perPrestigio: 1800, art: "a swirled blue and purple glass marble, macro product shot on white" },
  { id: "cuscino-pernacchia", name: "Cuscino Pernacchia Tascabile",      categoria: "assurdo", price: 300,  perPrestigio: 400,  art: "a small folded whoopee cushion, red rubber, product shot on white" },
  { id: "dado-24-facce",     name: "Dado a 24 Facce (inutile)",          categoria: "assurdo", price: 250,  perPrestigio: 450,  art: "an unusual 24-sided polyhedral die, teal, product shot on white" },
  { id: "cappello-cono",     name: "Cappellino a Cono da Festa",         categoria: "assurdo", price: 150,  perPrestigio: 650,  art: "a striped cone-shaped party hat with elastic string, product shot on white" },
  { id: "girandola-plastica", name: "Girandola di Plastica",             categoria: "assurdo", price: 90,   perPrestigio: 850,  art: "a colorful plastic pinwheel toy on a stick, product shot on white" },
  { id: "tappo-firmato",     name: "Tappo di Sughero Autografato",       categoria: "assurdo", price: 15,   perPrestigio: 4000, art: "a cork stopper with a tiny scribbled autograph, product shot on white" },

  /* --- Action figure: campioni dello sport (stilizzate, non reali) ----- */
  { id: "fenomeno-gol",      name: "Action Figure «Il Fenomeno del Gol»",   categoria: "sport",   price: 500,  perPrestigio: 400, art: "stylized plastic action figure of a cartoonish football striker mid-kick, generic blue kit, no real likeness, blister-pack toy photography on white" },
  { id: "bomber-mancino",    name: "Action Figure «Il Bomber Mancino»",     categoria: "sport",   price: 600,  perPrestigio: 380, art: "stylized plastic action figure of a chunky cartoon footballer celebrating, generic red kit, no real likeness, toy photography on white" },
  { id: "portiere-volante",  name: "Action Figure «Il Portiere Volante»",   categoria: "sport",   price: 450,  perPrestigio: 420, art: "stylized plastic action figure of a cartoon goalkeeper diving sideways, generic green jersey and gloves, no real likeness, toy photography on white" },
  { id: "regista-numero10",  name: "Action Figure «Il Numero Dieci»",       categoria: "sport",   price: 550,  perPrestigio: 400, art: "stylized plastic action figure of a small cartoon playmaker footballer with a ball, generic white kit, number 10, no real likeness, toy photography on white" },
  { id: "maratoneta-oro",    name: "Action Figure «La Maratoneta d'Oro»",   categoria: "sport",   price: 400,  perPrestigio: 450, art: "stylized plastic action figure of a cartoon runner breaking a finish-line ribbon, generic tracksuit, no real likeness, toy photography on white" },

  /* --- Action figure: eroi dei cartoni (parodie, nomi inventati) ------- */
  { id: "idraulico-baffuto", name: "Action Figure «L'Idraulico Baffuto Saltatore»", categoria: "cartoni", price: 400, perPrestigio: 480, art: "stylized plastic action figure of a stout moustached plumber in red cap and blue overalls, jumping pose, parody design, no real likeness, toy photography on white" },
  { id: "riccio-turbo",      name: "Action Figure «Il Riccio Turbo Blu»",   categoria: "cartoni", price: 400,  perPrestigio: 480, art: "stylized plastic action figure of a spiky blue cartoon hedgehog running fast, parody design, no real likeness, toy photography on white" },
  { id: "ninja-guscio",      name: "Action Figure «Il Ninja col Guscio»",   categoria: "cartoni", price: 500,  perPrestigio: 440, art: "stylized plastic action figure of a cartoon turtle ninja with a colored bandana and nunchaku, parody design, no real likeness, toy photography on white" },
  { id: "maga-stelline",     name: "Action Figure «La Maghetta delle Stelline»", categoria: "cartoni", price: 450, perPrestigio: 460, art: "stylized plastic action figure of a cheerful magical girl with a star wand, pastel outfit, parody design, no real likeness, toy photography on white" },
  { id: "robot-camion",      name: "Action Figure «Il Robot che si Fa Camion»", categoria: "cartoni", price: 900, perPrestigio: 300, art: "stylized chunky plastic transforming robot toy, half robot half truck, primary colors, parody design, no real likeness, toy photography on white" },

  /* --- Action figure: eroi ed esploratori (stilizzati) --------------- */
  { id: "supereroe-mantello", name: "Action Figure «Il Supereroe dal Mantello Rosso»", categoria: "eroi", price: 700, perPrestigio: 360, art: "stylized plastic superhero action figure with a flowing red cape, generic blue bodysuit, heroic pose, no real likeness, toy photography on white" },
  { id: "uomo-ragnatela",    name: "Action Figure «L'Uomo Ragnatela»",      categoria: "eroi", price: 700,  perPrestigio: 360, art: "stylized plastic action figure of a masked hero in a webbed suit, crouching pose, parody design, no real likeness, toy photography on white" },
  { id: "cavaliere-luce",    name: "Action Figure «Il Cavaliere dalla Spada di Luce»", categoria: "eroi", price: 800, perPrestigio: 340, art: "stylized plastic action figure of a hooded knight holding a glowing energy sword, brown robes, parody design, no real likeness, toy photography on white" },
  { id: "esploratrice-zaino", name: "Action Figure «L'Esploratrice dello Zaino»", categoria: "eroi", price: 350, perPrestigio: 500, art: "stylized plastic action figure of a young cartoon explorer girl with a big backpack and map, jungle outfit, parody design, no real likeness, toy photography on white" },
  { id: "astronauta-bandiera", name: "Action Figure «L'Astronauta con la Bandierina»", categoria: "eroi", price: 600, perPrestigio: 380, art: "stylized plastic astronaut action figure planting a tiny flag, white space suit, no real likeness, toy photography on white" }

]);
