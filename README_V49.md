# Fortress Army V49 — Arena Caos, fase 2

Baseline: V48. Il pacchetto è un overlay, non un repository completo.

## Modifiche
- Cinque creature assurde nel pool delle due ondate: Pollo Terminator, Banana Ninja, WC Corazzato, Cactus Pugile, Papera Infernale. Condividono il sistema di combattimento, vittoria e Splatter House degli animali.
- Fino a 2 ondate di 3 avversari ciascuna, pescati senza duplicati da un pool complessivo di 14 (9 animali + 5 creature).
- Potenziamenti casuali degli avversari vivi tra gli scontri dal terzo scambio: CORAZZA (+60 scudo), FURIA (+2 attacco), GIGANTE (+40 HP massimi e correnti).
- Ogni avversario può ricevere al massimo un potenziamento, che rimane fino all'eliminazione. L'elefante con CORAZZA appare come «ELEFANTE CORAZZATO».
- Visualizzazione del potenziamento nel roster e durante il tiro dell'avversario.
- Splatter House elimina immediatamente anche le creature/potenziate, con messaggio di riepilogo.

Non modificati: dadi fisici 2D6, premi del campione, PvP, scelta bersaglio Sfida Diretta, logica Splatter House, Avventura. Nessun asset immagine richiesto.

## Installazione
Sostituire **solo** `fortress-game-ui.js` con quello del pacchetto. Non sostituire altri file applicativi.

## Test
- `node --check fortress-game-ui.js`
- `node tests/fortress-arena-loot-v48.test.js`
- `node tests/fortress-arena-chaos-v49.test.js`

Resta da verificare il bilanciamento in playtest mobile: frequenza potenziamenti, durata torneo e visibilità annunci. Nessun commit è stato effettuato.
