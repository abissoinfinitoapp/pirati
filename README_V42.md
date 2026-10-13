# Fortress Army V42 — reset torneo Deathmatch
Base: V41. Cumulativo: sovrascrivere soltanto `fortress-game-ui.js` e `styles-fortress.css`.

- Durante ogni fase del torneo Arena compare **↻ RESET TORNEO** nell’intestazione.
- Il reset richiede conferma e cancella la run in corso, anche durante il tiro dei dadi.
- Dopo il reset si torna al roster PvP: selezionare subito il nuovo arrivato e avviare un altro torneo.
- Restano invariati il roster Arena (nomi, avatar, presenze), i premi già registrati e il salvataggio Avventura.
- `ESCI DALL'ARENA` continua a nascondere la schermata senza cancellare il torneo salvato.

Test: `node tests/fortress-arena-reset-v42.test.js`; `node tests/fortress-arena-dice-v41.test.js`.
