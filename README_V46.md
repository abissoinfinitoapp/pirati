# Fortress Army V46 — Skill del Campione

Baseline: V45. Modificato **solo** `fortress-game-ui.js`. Nessun CSS o asset aggiunto.

## Nuovo premio
Alla vittoria umana vengono estratte 3 delle 9 skill; il bambino ne sceglie 1. L'assegnazione viene registrata separatamente nel localStorage (`fortress-army-arena-champion-skills-v1`). Si attiva alla successiva nuova partita in cui il giocatore partecipa. Una sola skill per persona, la nuova scelta sovrascrive la precedente. Alla prima eliminazione, anche da Splatter House, la skill viene eliminata. Le abilità non hanno effetto sui dadi di Splatter House; HP/scudo ordinari continuano ad applicarsi.

Skill: Potenza di Fuoco (+2 a un dado attacco), Potenza Devastante (+2 a ogni dado attacco), Difesa Eccellente (200 HP e 200 scudo iniziali), Contrattacco Fulmineo (1 rilancio completo opzionale per scambio, senza secondo attacco), Schivata Fantasma (1 annullamento di danno per torneo), Cuore di Fenice (1 salvataggio da KO a 40% HP), Dado del Destino (3 dadi attacco), Armatura del Re (1 livello di danno in meno), Vampiro dell'Arena (cura 20% HP massimi quando infligge danno).

Le armi leggendarie dei vecchi premi non vengono più assegnate con V46. Lo storico precedente resta nel localStorage, inalterato.

## Installazione
Sostituire soltanto il file `fortress-game-ui.js` della V45. Il file di test è separato e non deve essere distribuito nell'app. Non copiare le versioni precedenti.

## Verifiche
`node --check fortress-game-ui.js`; eseguire `node tests/fortress-arena-skills-v46.test.js`. Regressioni V43 e V44 eseguite sulla baseline V45. Da verificare con il telefono: scelta premio, turno con rilancio, persistenza dopo reload e successivo torneo. Il progetto completo e il browser mobile non sono stati eseguiti.
