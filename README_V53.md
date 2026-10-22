# Fortress Army V53 — legenda dadi e danni

Baseline: V52. Unico file applicativo modificato: `fortress-game-ui.js`.

La schermata dei dadi include una legenda espandibile, aperta per impostazione predefinita, che illustra lo scarto attacco − difesa e i punti associati alla scala del risolutore corrente. I valori degli attacchi +1/+2/+3 sono calcolati sugli HP massimi del difensore. La legenda precisa che lo scudo assorbe prima del danno HP e che il KO immediato ignora lo scudo. Le skill e le armi possono modificare il risultato.

La schermata di risultato mostra separatamente danno base, scudo assorbito e HP persi. Non sono cambiate le regole di combattimento.

Eseguire i test Node dalla cartella `tests/`. Verificare sul telefono leggibilità e scroll. Installazione: copiare soltanto `fortress-game-ui.js` sul file della V52.
