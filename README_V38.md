# Fortress Army V38 — Arena Deathmatch PvP

Base: V37 handoff 12/10/2026. Overlay con soli file modificati e test nuovo.

## Installazione
Sovrascrivere nella medesima posizione del repository reale:
- `fortress-game-ui.js`
- `styles-fortress.css`

Non cambiare l'HTML: la nuova modalità compare nella schermata di setup Avventura. Richiede gli script originali del repository, non contenuti nello ZIP. Non sovrascrivere gli altri file.

## Modalità
- Aprire setup; selezionare **DEATHMATCH · TUTTI CONTRO TUTTI**.
- Roster presente/assente e avatar provengono dal setup esistente; prima impostare da 2 a 10 presenti con avatar.
- Tre armi random per giocatore, uguali dadi per tutti (l'arma scelta è solo identificativa nel PvP V38).
- Una coppia per scambio; attaccante 2D6 e difensore 2D6, inserimento manuale di ogni dado. Evento potenza concede 3D6 all'attaccante nel suo prossimo attacco.
- Differenza <=0 parata, +1 40%, +2 70%, +3 80%, >=4 KO. Scudi proteggono dai danni parziali (il KO diretto li supera).
- Il sistema privilegia i partecipanti con meno scambi. Eventi casuali al 17% fra scontri (solo >2 in gara): kit, scudo, bonus potenza.
- Rimane un campione, viene assegnato trofeo leggendario se disponibile o trofeo potenza cosmetico, e può iniziare il successivo torneo.
- Stato PvP distinto in `fortress-army-arena-pvp-v1`; premi in `fortress-army-arena-prizes-v1`. Non interviene sul salvataggio Avventura.

## Verifica
- `node tests/fortress-arena-pvp-v38.test.js`: OK.
- Regressioni V34 13/13, V35 6/6, V36 9/9, V37 8/8, diagnostica 9/9, loot-UI 5/5: OK.
- Test `fortress-ground-loot-swap-lock.test.js` non eseguibile dal solo overlay: dipendenze dell'engine mancanti nel pacchetto.

## Limiti consapevoli della V38
- Il PvP ha un **resolver Arena dedicato** perché nell'handoff manca `engine/fortress-combat.js` e il Director corrente completo. Non è una nuova logica Avventura; prima di rendere definitiva la modalità occorre confrontarlo con il motore del repository, in particolare defeat ed effetti delle armi.
- Le armi non applicano le loro abilità in PvP V38, per conservare la parità 2D6. La ricompensa è persistente come trofeo, non sblocca armi dell'Arsenale originale.
- Il limite 5 minuti è un obiettivo da misurare, non un timer garantito.
- L'estrazione/eventi usano `Math.random` mentre i dadi restano **sempre fisici**.
- Test reale touch/integrazione end-to-end ancora da eseguire nel repository completo.
