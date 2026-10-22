# Fortress Army V55 — Gift Machine Rive e griglia D6

Baseline: V54. Unico file applicativo modificato: `fortress-game-ui.js`. Non sostituire `fortress-gift-machine.js` V54.

- La schermata di estrazione Arena mostra il canvas con lo stesso asset `assets/fortress/rive/macchinario_regali.riv` dell'Avventura.
- Il tiro del D6 resta fisico. Al tap sul risultato l'animazione parte tramite trigger Rive `start`; dopo il tempo di reveal già usato nell'Avventura appare l'arma.
- I sei pulsanti D6 sono in una griglia 3x2 con altezza ridotta, anche sui telefoni stretti.
- Un reload durante l'animazione permette di recuperare l'arma già assegnata senza ritirare il D6.
- Nessuna variazione a rarità, bonus delle armi o Avventura.

## Installazione
Sostituire solo `fortress-game-ui.js` della V54. L'asset Rive e il runtime devono essere già serviti nella stessa posizione usata dalla Gift Machine dell'Avventura.

## Verifiche
Sintassi e test automatici V48–V55. Da verificare visivamente su telefono l'animazione Rive effettiva (asset/runtime non inclusi in questo overlay).
