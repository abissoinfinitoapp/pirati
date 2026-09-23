/* =============================================================================
   Fortress Army — Catalogo Armi (100).
   Nomi originali in italiano, ispirati alle famiglie tipiche del genere
   battle royale (fucili d'assalto, shotgun, SMG, cecchini, mischia, ecc.)
   ma NON ricalcano nomi coperti da marchio/copyright di giochi o franchise
   esistenti — niente personaggi, saghe o oggetti da collaborazioni.

   Bilanciamento centralizzato: ogni arma eredita bonus/costo dalla sua
   rarità (RARITA). Cambia quei numeri per ribilanciare tutto il catalogo
   in un colpo solo, senza toccare le 100 righe sotto.
   ========================================================================= */

(function () {
const RARITA_ARMI = {
  comune:       { bonus: 1, cost: 12  },
  "non-comune": { bonus: 2, cost: 22  },
  rara:         { bonus: 3, cost: 38  },
  epica:        { bonus: 4, cost: 58  },
  leggendaria:  { bonus: 5, cost: 85  },
  mitica:       { bonus: 6, cost: 130 }
};

const CATEGORIE_ARMI = {
  assalto: "Fucili d'assalto",
  shotgun: "Shotgun",
  smg: "SMG",
  pistola: "Pistole e revolver",
  cecchino: "Cecchini",
  dmr: "DMR / Marksman",
  arco: "Archi e balestre",
  esplosivo: "Lanciarazzi ed esplosivi",
  pesante: "Armi pesanti",
  mischia: "Mischia",
  energia: "Armi a energia",
  esotica: "Esotiche e mitiche"
};

function fortressSlug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* [nome, categoria, rarità] */
const ARMI_GREZZE = [
  // --- Fucili d'assalto (14) ---
  ["Fucile d'Assalto Standard", "assalto", "comune"],
  ["Fucile a Raffica Corta", "assalto", "comune"],
  ["Fucile Fulmine", "assalto", "comune"],
  ["Fucile d'Assalto Pesante", "assalto", "non-comune"],
  ["Fucile Silenziato", "assalto", "non-comune"],
  ["Fucile di Precisione Tattico", "assalto", "non-comune"],
  ["Fucile da Battaglia", "assalto", "non-comune"],
  ["Fucile da Ranger", "assalto", "rara"],
  ["Fucile a Doppio Caricatore", "assalto", "rara"],
  ["Fucile Cromato", "assalto", "rara"],
  ["Fucile Occhio Rosso", "assalto", "rara"],
  ["Fucile Nemesi", "assalto", "epica"],
  ["Fucile del Cacciatore", "assalto", "epica"],
  ["Fucile del Fabbro", "assalto", "leggendaria"],

  // --- Shotgun (12) ---
  ["Fucile a Pompa Base", "shotgun", "comune"],
  ["Doppietta", "shotgun", "comune"],
  ["Fucile a Leva", "shotgun", "comune"],
  ["Fucile Primitivo", "shotgun", "comune"],
  ["Fucile Improvvisato", "shotgun", "comune"],
  ["Fucile a Pompa Tattico", "shotgun", "non-comune"],
  ["Fucile da Combattimento", "shotgun", "non-comune"],
  ["Fucile a Pompa Pesante", "shotgun", "rara"],
  ["Fucile a Tamburo", "shotgun", "rara"],
  ["Fucile Automatico da Guerra", "shotgun", "rara"],
  ["Fucile del Drago", "shotgun", "epica"],
  ["Fucile dell'Annientatore", "shotgun", "leggendaria"],

  // --- SMG (10) ---
  ["Mitraglietta Base", "smg", "comune"],
  ["Mitraglietta Compatta", "smg", "comune"],
  ["Mitraglietta Tattica", "smg", "non-comune"],
  ["Mitraglietta Silenziata", "smg", "non-comune"],
  ["Mitraglietta da Combattimento", "smg", "non-comune"],
  ["Mitraglietta a Raffica", "smg", "rara"],
  ["Mitraglietta Rapida", "smg", "rara"],
  ["Mitraglietta Pungiglione", "smg", "epica"],
  ["Mitraglietta dell'Araldo", "smg", "epica"],
  ["Mitraglietta Iperveloce", "smg", "leggendaria"],

  // --- Pistole e revolver (10) ---
  ["Pistola Base", "pistola", "comune"],
  ["Pistola Silenziata", "pistola", "comune"],
  ["Revolver", "pistola", "comune"],
  ["Pistola Tattica", "pistola", "non-comune"],
  ["Revolver a Mirino", "pistola", "non-comune"],
  ["Pistola da Combattimento", "pistola", "non-comune"],
  ["Doppia Pistola", "pistola", "rara"],
  ["Sei Colpi", "pistola", "rara"],
  ["Cannone da Mano", "pistola", "epica"],
  ["Pistola del Fuorilegge", "pistola", "leggendaria"],

  // --- Cecchini (10) ---
  ["Fucile di Precisione a Otturatore", "cecchino", "comune"],
  ["Fucile da Caccia", "cecchino", "comune"],
  ["Fucile di Precisione Semi-Automatico", "cecchino", "non-comune"],
  ["Fucile da Cecchino Silenziato", "cecchino", "non-comune"],
  ["Fucile dell'Esploratore", "cecchino", "non-comune"],
  ["Fucile da Cecchino Pesante", "cecchino", "rara"],
  ["Fucile da Cecchino Automatico", "cecchino", "rara"],
  ["Fucile del Cobra", "cecchino", "epica"],
  ["Fucile del Vendicatore", "cecchino", "epica"],
  ["Fucile del Mietitore", "cecchino", "leggendaria"],

  // --- DMR / Marksman (6) ---
  ["Fucile di Marcatura Base", "dmr", "comune"],
  ["Fucile Termico", "dmr", "non-comune"],
  ["Fucile Tattico di Precisione", "dmr", "rara"],
  ["Fucile della Cacciatrice", "dmr", "epica"],
  ["Fucile Sguardo Fermo", "dmr", "epica"],
  ["Fucile del Marchio Nero", "dmr", "leggendaria"],

  // --- Archi e balestre (6) ---
  ["Balestra Base", "arco", "comune"],
  ["Balestra dell'Amore", "arco", "comune"],
  ["Balestra da Caccia", "arco", "non-comune"],
  ["Arco Meccanico", "arco", "rara"],
  ["Arco Primordiale", "arco", "rara"],
  ["Arco Esplosivo", "arco", "epica"],

  // --- Lanciarazzi ed esplosivi (8) ---
  ["Bastone di Dinamite", "esplosivo", "comune"],
  ["Mina di Prossimità", "esplosivo", "comune"],
  ["Granata a Mano", "esplosivo", "comune"],
  ["Lanciagranate", "esplosivo", "non-comune"],
  ["Lanciarazzi", "esplosivo", "rara"],
  ["Lanciagranate a Prossimità", "esplosivo", "rara"],
  ["Lanciagranate a Grappolo", "esplosivo", "epica"],
  ["Missile Guidato", "esplosivo", "leggendaria"],

  // --- Armi pesanti (6) ---
  ["Fucile a Tamburo Pesante", "pesante", "non-comune"],
  ["Mitragliatrice Leggera", "pesante", "rara"],
  ["Minigun", "pesante", "epica"],
  ["Lanciafiamme Sperimentale", "pesante", "epica"],
  ["Cannone al Plasma", "pesante", "leggendaria"],
  ["Fucile a Rotaia", "pesante", "leggendaria"],

  // --- Mischia (8) ---
  ["Spada Corta", "mischia", "comune"],
  ["Ascia da Battaglia", "mischia", "comune"],
  ["Mazza Chiodata", "mischia", "non-comune"],
  ["Lama Ricurva", "mischia", "rara"],
  ["Martello da Guerra", "mischia", "rara"],
  ["Artigli d'Acciaio", "mischia", "rara"],
  ["Falce Oscura", "mischia", "epica"],
  ["Lama Senza Fine", "mischia", "leggendaria"],

  // --- Armi a energia (6) ---
  ["Pistola a Raggi", "energia", "comune"],
  ["Fucile a Impulsi", "energia", "non-comune"],
  ["Fucile a Raffica ad Impulsi", "energia", "rara"],
  ["Fucile Laser da Ricognizione", "energia", "rara"],
  ["Fucile Fotonico", "energia", "epica"],
  ["Cannone ad Arco Elettrico", "energia", "leggendaria"],

  // --- Esotiche e mitiche (4): pezzi unici del mondo di Fortress Army ---
  ["Il Fulmine del Boia", "esotica", "mitica"],
  ["La Lama del Re Sepolto", "esotica", "mitica"],
  ["Il Grido dell'Assedio", "esotica", "mitica"],
  ["L'Ultimo Sussurro", "esotica", "mitica"]
];

window.FORTRESS_ARMI = ARMI_GREZZE.map(([name, category, rarity]) => {
  const r = RARITA_ARMI[rarity];
  return { id: fortressSlug(name), name, category, rarity, cost: r.cost, bonus: r.bonus };
});
window.FORTRESS_CATEGORIE_ARMI = CATEGORIE_ARMI;
})();
