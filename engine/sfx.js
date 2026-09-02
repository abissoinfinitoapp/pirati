/* =============================================================================
   SUONI — piccolo motore per gli effetti sonori del gioco.
   -----------------------------------------------------------------------------
     PIRATI_SFX.play("click")     riproduce un effetto
     PIRATI_SFX.toggle()          silenzia / riattiva (ricordato in localStorage)
     PIRATI_SFX.isMuted()         stato attuale

   I file stanno in  assets/suoni/<nome>.mp3  (già serviti dal sito).
   Per servirli dal CDN/R2: cambia BASE in  window.PIRATI_ASSET("suoni/").

   AGGIUNGERE UN SUONO: metti il file in assets/suoni/ e aggiungi una riga in
   SOUNDS con il volume (0..1). Nessun'altra modifica: se il file manca, play()
   semplicemente non fa nulla.
   ========================================================================== */
(function () {
  "use strict";

  var BASE = "assets/suoni/";

  /* volume per effetto (0..1): i "click" bassi, le fanfare più presenti.
     Il gioco chiama già anche i suoni "consigliati" qui sotto: appena metti il
     file in assets/suoni/ e aggiungi la riga, si attivano da soli. Finché la
     riga non c'è, play() ignora quel nome (nessun errore).

     Consigliati da aggiungere (nome file → quando suona):
       monete.mp3   la ciurma incassa un forziere o una razzia riuscita
       trionfo.mp3  avventura completata / boss placato (fanfara ~2s)
       grado.mp3    la ciurma sale di Grado
       abisso.mp3   si sveglia Barbabisso (il boss)
       salpa.mp3    la ciurma salpa e naviga
       campana.mp3  si chiude la giornata di scuola
  */
  var SOUNDS = {
    click:        0.28,  // tap sui pulsanti principali (menu, primari, ...)
    "click-home": 0.30,  // tap "leggero" su tutti gli altri pulsanti
    fallimento:   0.55,  // una prova va male (mappa / quest / parola sbagliata)
    minaccia:     0.60,  // compare un mostro o un assalto
    quest:        0.55,  // si apre / si rivela un'avventura
    star:         0.50,  // si gioca una carta potere, una magia, un oggetto
    "win-event":  0.60   // prova riuscita / parola indovinata

    // monete:   0.50,
    // trionfo:  0.60,
    // grado:    0.60,
    // abisso:   0.60,
    // salpa:    0.40,
    // campana:  0.50
  };

  var MUTE_KEY = "pirati-sfx-muted";
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  var pools = {};       // nome -> [Audio]  (piccolo pool per suoni ravvicinati)
  var lastAt = {};      // nome -> timestamp (evita il "raffica" sui click rapidi)
  var MAX_POOL = 4;

  function make(name) {
    var el = new Audio(BASE + name + ".mp3");
    el.preload = "auto";
    return el;
  }

  function play(name) {
    if (muted) return;
    if (!(name in SOUNDS)) return;
    var now = Date.now();
    if (lastAt[name] && now - lastAt[name] < 70) return;
    lastAt[name] = now;

    var pool = pools[name] || (pools[name] = []);
    var el = null;
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].paused || pool[i].ended) { el = pool[i]; break; }
    }
    if (!el) {
      if (pool.length >= MAX_POOL) el = pool[0];
      else { el = make(name); pool.push(el); }
    }
    try {
      el.currentTime = 0;
      el.volume = SOUNDS[name];
      var p = el.play();
      if (p && p.catch) p.catch(function () {});   // autoplay bloccato / file mancante: silenzio
    } catch (e) {}
  }

  function setMuted(v) {
    muted = Boolean(v);
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (e) {}
  }

  window.PIRATI_SFX = {
    play: play,
    setMuted: setMuted,
    toggle: function () { setMuted(!muted); return muted; },
    isMuted: function () { return muted; }
  };
})();
