# Fortress Army V43 — Splatter House PvP

Base cumulativa: V42. Sostituire **solo** `fortress-game-ui.js` e `styles-fortress.css` nel progetto. Il test è separato e opzionale.

- Evento Splatter House tra gli scambi PvP: prima del primo scontro e, quando ancora possibile, dopo almeno 3 scambi. Il torneo prevede 1 o 2 eventi, ma può terminare prima del secondo.
- Tutti i sopravvissuti tirano 1 dado fisico, uno alla volta, inserendo il valore da 1 a 6.
- D6 1–2: 40% degli HP massimi di danno (scudo assorbe normalmente); D6 3–6: salvezza.
- I danni sono applicati solo dopo che tutti i sopravvissuti hanno tirato.
- Se tutti muoiono: `SPLATTER HOUSE VINCE`, nessun campione né premio; contatore persistente dedicato.
- Se rimane uno solo: campione; altrimenti si riprende con un nuovo scontro.
- Reset torneo e salvataggio Avventura preservati; nessuna modifica all'engine Avventura.

Test: `node tests/fortress-arena-splatter-v43.test.js`. Verificare l'interfaccia su telefono con un playtest reale.
