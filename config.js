/* =============================================================================
   CONFIGURAZIONE — deve caricarsi PRIMA di tutto il resto.
   -----------------------------------------------------------------------------
   assetBase : da dove arrivano le immagini.
     ""  oppure  "assets"   -> cartella locale (dev, o se le pubblichi con il sito)
     "https://cdn.tuodominio.it/pirati"  -> bucket R2 / CDN (senza slash finale)
     La struttura dentro deve rispettare le cartelle:
       carte/  contendenti/  personaggi/  oggetti/  ciurma/  pirati-character-atlas.webp

   supabaseUrl / supabaseAnonKey : per il login. Lasciare vuoto = login disattivato.
   ========================================================================== */

window.PIRATI_CONFIG = {
  assetBase: "assets",

  // Login (Supabase). Vuoti = login disattivato (sviluppo).
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Solo queste email possono entrare. Vuoto = chiunque abbia un account.
  allowedEmails: [
    // "dipaolo1974@gmail.com",
  ]
};

/* Costruisce l'URL di un'immagine: PIRATI_ASSET("carte/soffio-starnuto.webp") */
window.PIRATI_ASSET = function (path) {
  var base = (window.PIRATI_CONFIG && window.PIRATI_CONFIG.assetBase) || "assets";
  return base.replace(/\/+$/, "") + "/" + String(path).replace(/^\/+/, "");
};

/* Rende disponibile l'atlante alla CSS come variabile. */
try {
  document.documentElement.style.setProperty(
    "--atlas-url",
    "url(\"" + window.PIRATI_ASSET("pirati-character-atlas.webp") + "\")"
  );
} catch (e) {}
