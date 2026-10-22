# Fortress Army V48 — Arena ritrovamenti (prima fase)
Base: V47. Sostituire solo `fortress-game-ui.js`.

- Rimossa scelta iniziale cosmetica dell'arma.
- Armi trovate durante gli scontri con bonus reale: Pistola al Plasma +1 attacco, Fucile d'Assalto +2 attacco, Cannone Devastante +3 attacco, Lanciarazzi 3 dadi in attacco, Scudo Balistico +2 difesa, Arma Maledetta +4 attacco e -20% HP a chi attacca.
- Una sola arma per giocatore: nuova arma sostituisce precedente. Alla morte arma rimossa.
- Bonus Sfida Diretta: il beneficiario seleziona il bersaglio vivo, incluso animale, e attacca una volta, senza contrattacco.
- Splatter House non si attiva prima del quinto scambio e attende almeno 4 scambi per ricomparire; prima ondata Animal Battle ancora al secondo scambio.
- Solo gameplay Arena modificato. Skill campione invariata. Nessun asset.
- Questa è la prima fase V48: i personaggi comici e i potenziamenti agli animali verranno aggiunti separatamente.

Test: `node --check fortress-game-ui.js` e `node tests/fortress-arena-loot-v48.test.js`. Regressione V47 effettuata sul file prima di confezionare il cumulativo.
