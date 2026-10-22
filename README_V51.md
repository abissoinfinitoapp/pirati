# Fortress Army V51 — Barre vita/scudo e difesa dinamica

Baseline: V50. Modificato soltanto `fortress-game-ui.js`.

- HP e scudo appaiono come barre durante il tiro, nel risultato e nel roster.
- Scudo iniziale standard: 40; skill Difesa Eccellente: 200. Valori modificabili dopo playtest.
- Scarto attacco-difesa <= -4: difesa perfetta, costo 0.
- Scarto da -3 a -1: pressione 10, prima sullo scudo, poi sugli HP.
- Scarto 0: pressione 20, prima sullo scudo, poi sugli HP.
- Scarto positivo: tabella danni V50 invariata (40/70/80% e KO a +4), danni assorbiti prima da scudo salvo KO.
- Protezioni monouso e Splatter House non vengono ribilanciate in questa versione.
- Nessun cambiamento al motore Avventura e nessuna simulazione dei dadi.

## Test
Eseguire `node tests/*.test.js` singolarmente o `for f in tests/*.test.js; do node "$f"; done`.
Verificare su telefono leggibilità delle barre e sensazione dei danni.
