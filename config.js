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
  // Immagini su R2 (bucket abisso-assets, cartella img/pirati/).
  // Per lo sviluppo offline si può rimettere "assets".
  assetBase: "https://assets.abissoinfinito.it/img/pirati",

  // Login (Supabase). Progetto "pirati".
  supabaseUrl: "https://abzawcwdubrakppobvyk.supabase.co",
  supabaseAnonKey: "sb_publishable_XNC9vaJ-md3waXOfYVI9dg_RsCt6xRf",

  // Email per le richieste di accesso.
  contactEmail: "abissoinfinitoapp@gmail.com",

  // Lista di RISERVA (bootstrap). Gli altri giocatori si aggiungono nella
  // tabella `giocatori_autorizzati` su Supabase, non qui.
  allowedEmails: [
    "dipaolo1974@gmail.com",
    "abissoinfinitoapp@gmail.com"
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
