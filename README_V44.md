# FORTRESS ARMY — V44 Animal Battle

Base: V43 Splatter House. Cumulativo overlay, **non** repository completo.

## Installazione
Copia nel progetto SOLO `fortress-game-ui.js` e `styles-fortress.css`, sovrascrivendo i file della V43. Non sostituire altri file.

## Funzioni
- Bestiario di 9: Puma 70, Tigre 90, Elefante 150, Orso 120, Toro 110, Lupo 65, Rinoceronte 140, Cinghiale 80, Gorilla 125 HP.
- Animali rappresentati da icone/emoji provvisorie: nessun asset immagine animale è disponibile nel pacchetto.
- Prima ondata di 3 animali dopo almeno 2 scambi, seconda dopo almeno 6, se torneo ancora in corso; nessun duplicato di specie nella stessa partita.
- PvP non interrotto: selettore include uomini e animali, evita duelli animale-animale. Il Master tira i dadi fisici degli animali.
- HP animali persistenti, scarti/danni 2D6 come Arena V43 (calcolo proporzionale agli HP massimi; KO con scarto >=4).
- Splatter House fa tirare soltanto gli umani ed elimina tutti gli animali presenti DOPO l'ultimo tiro, senza dado.
- Vince l'unico umano rimasto soltanto se non ci sono animali vivi. Se non ci sono umani e sopravvivono animali, vince Animal Battle. Se Splatter elimina tutti, vince Splatter House.
- Nessun premio ai vincitori non umani. Contatori di vittorie separati.
- V43 salvataggi già in corso compatibili: vengono caricati senza azzerare lo stato; per avere entrambe le ondate conviene iniziare un nuovo torneo.

## Test
```
node --check fortress-game-ui.js
node tests/fortress-arena-splatter-v43.test.js
node tests/fortress-arena-animals-v44.test.js
```

## Da verificare sul telefono
Ritmo e durata degli scontri con 10 bambini + 6 animali, UI a schermo stretto, persistenza dopo refresh, volume degli effetti; timer dei 5 minuti è un obiettivo e non è garantito.
