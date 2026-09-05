/* =============================================================================
   MOTORE PURO — Il Negozio delle Cose Inutili
   -----------------------------------------------------------------------------
   Il Prestigio di un pirata si guadagna SOLO comprando montagne di oggetti
   inutili. Ogni oggetto ha un "perPrestigio": quanti pezzi servono per +1
   punto. Si possono mischiare oggetti diversi: il progresso è la somma delle
   frazioni, il Prestigio è la parte intera.

   A Prestigio 3 il pirata diventa Capitano del giorno. Ogni giorno si azzera.

   Nessun dado, nessun timer qui: solo funzioni pure e testabili.
   ========================================================================== */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PIRATI_NEGOZIO_CORE = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PRESTIGIO_CAPITANO = 3;

  function withPlayerShopDefaults(saved, day) {
    const today = Number.isFinite(day) ? Math.round(day) : 0;
    const source = saved && typeof saved === "object" ? saved : {};
    const bought = source.bought && typeof source.bought === "object" && !Array.isArray(source.bought)
      ? source.bought : {};
    const clean = {};
    // il negozio si azzera ogni giorno: se il salvataggio è di ieri, si riparte da zero
    if (Number(source.day) === today) {
      Object.keys(bought).forEach((id) => {
        const n = Number(bought[id]);
        if (Number.isFinite(n) && n > 0) clean[id] = Math.round(n);
      });
    }
    return { day: today, bought: clean };
  }

  /* progress = somma di (pezzi comprati / perPrestigio) per ogni oggetto.
     points = parte intera. Restituisce anche quanto manca al punto dopo. */
  function prestigioFromBought(bought, items) {
    const byId = new Map((Array.isArray(items) ? items : []).map((it) => [it.id, it]));
    let progress = 0;
    let spent = 0;
    const source = bought && typeof bought === "object" ? bought : {};
    Object.keys(source).forEach((id) => {
      const item = byId.get(id);
      const qty = Number(source[id]);
      if (!item || !Number.isFinite(qty) || qty <= 0) return;
      progress += qty / item.perPrestigio;
      spent += qty * item.price;
    });
    const points = Math.floor(progress + 1e-9);
    return {
      points,
      progress,
      spent,
      fractionToNext: progress - points,      // 0..1 verso il prossimo punto
      isCaptainEligible: points >= PRESTIGIO_CAPITANO
    };
  }

  function canAfford(coins, price, qty) {
    const c = Number(coins) || 0;
    const p = Number(price) || 0;
    const q = Math.max(0, Math.round(Number(qty) || 0));
    return q > 0 && p > 0 && c >= p * q;
  }

  /* Turno successivo nel giro di shopping sfrenato. Ritorna il nuovo indice
     o -1 quando la coda è finita. */
  function spreeNextIndex(currentIndex, queueLength) {
    const i = Number.isFinite(currentIndex) ? currentIndex : -1;
    const len = Number.isFinite(queueLength) && queueLength > 0 ? Math.round(queueLength) : 0;
    if (!len) return -1;
    return i + 1 < len ? i + 1 : -1;
  }

  return { PRESTIGIO_CAPITANO, withPlayerShopDefaults, prestigioFromBought, canAfford, spreeNextIndex };
});
