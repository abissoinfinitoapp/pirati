# Fortress Army V52 — Scheda dotazioni Arena

Base: V51. Sostituire esclusivamente `fortress-game-ui.js`.

- Barra HP e scudo conservate dalla V51.
- Roster e schede dei due combattenti: dotazioni con nome, tipo, effetto sintetico (arma persistente, speciale monouso, skill, boost, sfida diretta, upgrade animale).
- Gli elementi sono letti dallo stato Arena già esistente, senza inventario parallelo.
- I consumabili non più presenti nello stato spariscono al rendering successivo.
- Nessuna modifica a combattimento, dadi, salvataggi o Avventura.

Test: `node tests/fortress-arena-equipment-v52.test.js` e regression suite inclusa.
Verificare sul telefono la leggibilità delle dotazioni con 10 giocatori e la loro scomparsa dopo consumo/eliminazione.
