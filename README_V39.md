# Fortress Army V39 — Selezione partecipanti Deathmatch

Baseline: V38 Arena PvP. Patch esclusiva alla modalità Arena.

## Correzione
- Il Deathmatch non usa più implicitamente i `present` dell'Avventura.
- La schermata iniziale Arena presenta 10 righe con scelta giocatore, nome e avatar.
- Necessari da 2 a 10 giocatori; avatar distinti tra i selezionati.
- Scelte salvate separatamente in `fortress-army-arena-roster-v1`.
- Al termine di un torneo, «NUOVO DEATHMATCH» torna alla selezione giocatori.
- L'Avventura e i suoi salvataggi non vengono modificati.

## Installazione
Sovrascrivere **solo** `fortress-game-ui.js` e `styles-fortress.css` con questi file nelle stesse posizioni del repository. Nessun HTML modificato.

## Verifica
`node --check fortress-game-ui.js` e `node tests/fortress-arena-roster-v39.test.js` OK.
La suite completa del repository e il test su telefono restano da eseguire.
