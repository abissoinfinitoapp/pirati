# Fortress Army V54 — Gift Machine per Deathmatch

Base: V53. Solo due file applicativi modificati: `fortress-game-ui.js` e `fortress-gift-machine.js`.

## Installazione
- Sostituire il `fortress-game-ui.js` della V53 nella stessa posizione esistente.
- Sostituire `fortress-gift-machine.js` nella sua posizione attuale del progetto (modulo della Gift Machine; non spostarlo in un'altra cartella).
- Non toccare l'Avventura e il catalogo armi.

## Funzione
- Preparazione Arena: un D6 fisico a giocatore, rarità deterministica (1 Comune, 2 Non Comune, 3 Rara, 4 Epica, 5 Leggendaria, 6 Mitica). L'arma specifica è pescata dal catalogo nella rarità corretta.
- Bonus iniziale da +0 a +5 sul totale dell'attacco. Se raccolta un'arma Arena persistente, essa sostituisce completamente quella iniziale e il relativo bonus.
- Aggiunta giocatore fra gli scontri, fino a 10 partecipanti; nuovo entrante con 100 HP, 40 scudo, arma casuale Comune, nessuna skill ereditata.
- Le skill del campione e i colpi monouso funzionano come in V53.
- V54 riutilizza API di estrazione e catalogo della Gift Machine, ma non riproduce ancora la sua animazione Rive: la fase premio in Arena è una schermata dedicata con tiro/risultato. Per l'animazione identica servirà integrare il componente Rive nel contesto Arena e verificarlo sul telefono.
- Se la rarità scelta dal D6 non è disponibile nel catalogo, l'app comunica l'errore senza assegnare un'arma di rarità differente.

## Verifiche
Test V48–V54 nel pacchetto, sintassi JS, senza test su telefono. Inserimento giocatori possibile in `ready`, `result` e `splatter-result`, mai a dadi in corso né dopo proclamazione del vincitore.
