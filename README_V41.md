# Fortress Army V41 — turnazione dadi
Base: V40. Cumulativo: sostituire soltanto `fortress-game-ui.js` e `styles-fortress.css`.

- Due slot chiaramente numerati per ogni tiro, tre soltanto con bonus potenza in attacco.
- Un giocatore tira tutti i propri dadi e inserisce i risultati uno alla volta.
- Il passaggio dall'attacco alla difesa avviene soltanto premendo CONFERMA ATTACCO.
- La risoluzione dello scontro avviene soltanto premendo CONFERMA DIFESA.
- CORREGGI ULTIMO DADO rimane attivo prima di confermare.
- Danni, parata, KO, roster e Avventura invariati.

Verifica automatica: `node tests/fortress-arena-dice-v41.test.js`.
