# Saccheggi giornalieri — specifica di design

## Obiettivo

Introdurre un momento piratesco cooperativo, volontario e utilizzabile una volta per
giornata di gioco. I bambini avvistano due navi assurde, discutono quale
saccheggiare e tirano tutti i dadi. Il bottino resta nascosto fino alla
risoluzione.

La meccanica deve creare attesa, confronto e risate. Un fallimento non sottrae
risorse e non aumenta il Pericolo: produce soltanto una delusione comica e rivela il
premio favoloso che si trovava sulla nave lasciata andare.

## Esperienza di gioco

1. Il Master vede l'azione **Navi all'orizzonte!** quando il saccheggio della
   giornata è ancora disponibile.
2. L'avvistamento può essere aperto liberamente dalla Mappa oppure proposto da una quest
   in un punto previsto dall'autore.
3. La schermata mostra due navi. Per ciascuna sono visibili nome, illustrazione,
   descrizione sospetta, caratteristica richiesta e difficoltà in parole semplici.
   Il carico e la ricompensa non sono visibili.
4. I bambini discutono e scelgono una nave. La scelta viene salvata subito e
   consuma il saccheggio giornaliero.
5. Tutti i pirati presenti tirano `1d6 + caratteristica richiesta`. Sono
   supportati sia i dadi fisici sia quelli digitali.
6. L'app calcola la media dei risultati e la confronta con la soglia della nave.
7. Se il primo tiro riesce, assegna e mostra il bottino scelto. La nave scartata
   fugge e il suo contenuto non viene rivelato.
8. Se il primo tiro fallisce, mostra la beffa innocua trovata sulla nave scelta
   e rivela il bottino della nave scartata. La ciurma ottiene un secondo e ultimo
   tentativo: può insistere sulla stessa nave oppure inseguire l'altra, ora
   conoscendone il premio.
9. Se il secondo tiro riesce, assegna il bottino della nave scelta per il
   secondo tentativo. Se fallisce, entrambe le navi fuggono con una conclusione
   comica e non viene assegnato alcun premio.
10. Il risultato viene registrato nel Diario e si torna al contesto precedente.

Non esistono ulteriori tentativi dopo il secondo tiro. Un tiro fallito non causa
perdita di monete, oggetti o Fama e non modifica il Pericolo. Cambiare bersaglio
non modifica la caratteristica o la soglia definite dalla nuova nave.

Le soglie iniziali sono `5` (**abbordaggio facile**), `6` (**abbordaggio
audace**) e `7` (**abbordaggio leggendario**). Le due navi di una coppia possono
richiedere caratteristiche o soglie differenti: il rischio è quindi una parte
visibile della scelta, mentre il premio resta segreto. La soglia non cresce con
il ciclo o il Grado della ciurma.

Le Carte Potere che aggiungono un bonus a una prova possono essere giocate prima
della risoluzione e vengono consumate secondo le regole esistenti. Carte che
saltano incontri, muovono la nave o producono successi automatici non si
applicano ai saccheggi. Le abilità dei personaggi restano affidate al Master come
nel resto del gioco; il motore non introduce eccezioni specifiche.

## Regola giornaliera e calendario

La disponibilità è legata all'identificatore della giornata già usato dal gioco,
non alle 24 ore reali. Lo stato conserva il giorno dell'ultimo tentativo: quando
la campagna avanza al giorno successivo, il saccheggio torna automaticamente
disponibile.

Il tentativo viene consumato e salvato al momento della scelta della nave, prima
dei tiri. Chi ricarica la pagina ritrova quindi la scelta già effettuata e può
soltanto completare il tiro. Importazione ed esportazione devono conservare anche
questo stato.

Se una quest raggiunge un avvistamento dopo che il tentativo quotidiano è già
stato usato, mostra un breve testo di continuità (le navi sono ormai troppo
lontane) e permette di proseguire senza penalità né blocchi.

## Catalogo dei saccheggi

I contenuti vivranno in un catalogo separato dal motore. La prima versione
contiene dodici coppie curate:

1. Nave del Gelato / Nave dello Zucchero Filato
2. Galeone dei Cuscini / Brigantino dei Trampolini
3. Nave delle Patatine / Veliero della Cioccolata Calda
4. Caravella dei Dinosauri Giocattolo / Nave dei Robot Svitati
5. Vascello delle Bolle di Sapone / Galeone dei Fuochi d'Artificio Silenziosi
6. Nave dei Calzini Spaiati / Veliero delle Scarpe Saltellanti
7. Galeone delle Torte Giganti / Nave delle Caramelle Mutacolore
8. Nave dei Pappagalli Cantanti / Caravella dei Cuccioli Pirata
9. Vascello dei Pennarelli Magici / Nave dei Libri che Raccontano da Soli
10. Galeone dei Palloni Infiniti / Nave degli Aquiloni Cavalcabili
11. Nave dei Mostri di Gelatina / Vascello delle Pozioni Ruttanti
12. Caravella delle Corone Assurde / Nave dei Mantelli Invisibili a Metà

Ogni coppia ha un identificatore univoco e due navi definite esplicitamente.
Ogni nave contiene almeno:

- identificatore, nome e percorso immagine;
- frase di avvistamento;
- caratteristica (`coraggio`, `astuzia` o `fortuna`);
- soglia numerica e relativa etichetta di difficoltà;
- ricompense strutturate;
- testo di successo;
- testo di fallimento comico;
- testo usato quando il suo bottino viene rivelato come alternativa perduta.

Le ricompense ammesse nella prima versione sono monete, Fama e oggetti-bottino
registrati nel catalogo premi. Nessuna ricompensa è necessaria per proseguire una
quest o completare la campagna. La maggioranza dei premi sarà costituita da
monete; oggetti e Fama saranno più rari.

## Selezione delle coppie

Un avvistamento libero sceglie casualmente una coppia dal catalogo. Lo stato
mantiene gli identificatori delle ultime quattro coppie mostrate e le esclude
quando esistono almeno cinque alternative. Quando il catalogo è troppo piccolo
per applicare l'esclusione, tutte le coppie tornano eleggibili. La coppia viene
salvata non appena appare, così un aggiornamento della pagina non cambia le due
navi proposte.

Una quest può chiedere una coppia precisa tramite un riferimento al suo
identificatore. Se il riferimento manca o non è valido, il sistema usa una
coppia casuale e segnala l'errore nella diagnostica per autori, senza bloccare i
bambini.

## Integrazione con le quest

Il motore espone un'azione di storia dedicata che riceve l'identificatore della
coppia. L'azione sospende temporaneamente il flusso guidato, apre il saccheggio e,
alla sua chiusura, riprende esattamente dalla scena successiva. Il risultato del
saccheggio non decide il successo o il fallimento della quest.

Le quest esistenti non vengono riscritte nella prima versione. Il pulsante libero
rende subito utilizzabile la funzione; gli agganci specifici verranno aggiunti
alle quest nuove o riviste. La guida per gli autori documenterà sintassi,
comportamento quando il tentativo è già stato usato e fallback per identificatori
errati.

## Interfaccia

L'ingresso libero sarà collocato nella console della Mappa, con stato chiaramente
leggibile: disponibile, in corso oppure già usato oggi. La schermata dedicata
presenterà le due navi affiancate su schermi ampi e impilate sui telefoni.

Dopo la scelta, l'interfaccia riutilizzerà il modello dei tiri cooperativi delle
quest: un risultato per ogni pirata presente, pulsante collettivo per i dadi
digitali e inserimento manuale per quelli fisici. Durante un saccheggio in corso
non sarà possibile scegliere una rotta o aprire un secondo avvistamento.

I testi distingueranno nettamente scelta, tiro, rivelazione, seconda scelta ed
esito finale. Dopo il primo fallimento, la beffa della nave scelta apparirà prima
del tesoro alternativo, per conservare il tempo comico. I due bersagli saranno
poi nuovamente selezionabili e mostreranno chiaramente che resta un solo tiro.

## Stato persistente

Il salvataggio aggiungerà un blocco isolato dedicato ai saccheggi con:

- giorno dell'ultimo tentativo;
- coppia corrente, nave scelta, numero del tentativo e fase del flusso;
- tiri già inseriti;
- risultato risolto, finché la schermata non viene chiusa;
- cronologia recente delle coppie mostrate.

La fusione con i valori predefiniti deve inizializzare questi campi per i vecchi
salvataggi. Dati incompleti o riferimenti a contenuti rimossi devono essere
ricondotti in sicurezza alla Mappa, preservando la regola giornaliera se la nave
era già stata scelta.

## Illustrazioni

Ogni nave avrà un'immagine WebP dedicata in `assets/saccheggi/`, per un totale di
24 immagini. Un documento di supporto conterrà un prompt completo per ciascuna
nave. Tutti i prompt manterranno lo stile del progetto: illustrazione pittorica
da libro per bambini, forme leggibili, colori caldi e vivaci, umorismo visivo,
nessuna violenza o espressione realmente minacciosa, sfondo marino semplice e
inquadratura coerente fra tutte le carte.

Il catalogo userà un'immagine di riserva se un file manca, così un asset non
disponibile non interrompe il gioco.

## Separazione delle responsabilità

- Il catalogo descrive coppie, navi, testi e premi senza manipolare lo stato.
- Il motore del saccheggio seleziona contenuti, gestisce fasi, tiri, esiti e
  ricompense.
- La vista rende lo stato e inoltra le azioni dell'utente.
- L'integrazione quest apre e chiude il flusso tramite un'interfaccia limitata,
  senza duplicare le regole del saccheggio.
- La persistenza passa dal sistema di salvataggio già esistente.

## Gestione degli errori

- Nessun pirata presente: il tiro resta disabilitato e viene spiegato come
  rendere presente almeno un membro della ciurma.
- Tiri fisici mancanti o fuori dall'intervallo 1–6: il risultato non viene
  calcolato e i campi errati vengono evidenziati.
- Coppia o nave sconosciuta in uno stato importato: ritorno sicuro alla Mappa e
  messaggio non tecnico; nessuna ricompensa duplicata.
- Ricompensa sconosciuta: viene ignorata, registrata nella diagnostica e il resto
  dell'esito viene comunque applicato.
- Doppio clic o riapertura della pagina dei risultati: ricompense e Diario vengono
  applicati una sola volta.

## Verifica

La realizzazione sarà verificata almeno sui seguenti casi:

- disponibilità una sola volta per ogni giornata della campagna;
- consumo salvato al momento della scelta;
- ripresa dopo ricaricamento nelle fasi di prima scelta, primo tiro, seconda
  scelta, secondo tiro e risultato;
- media cooperativa corretta con uno e più pirati presenti;
- flussi con dadi fisici e dadi digitali;
- successo con assegnazione unica di monete, Fama e bottino;
- primo fallimento senza penalità, con rivelazione della nave scartata;
- secondo tentativo sulla stessa nave e sull'altra nave;
- secondo fallimento senza penalità e senza un terzo tentativo;
- successo al secondo tentativo con assegnazione del solo premio allora scelto;
- successo senza rivelazione della nave scartata;
- esclusione delle quattro coppie viste più recentemente;
- apertura libera dalla Mappa;
- apertura e ritorno da una quest;
- quest che incontra il saccheggio già consumato;
- importazione di un vecchio salvataggio privo del nuovo blocco;
- dati catalogo validi, identificatori unici e 24 riferimenti immagine;
- resa su schermo ampio e telefono, inclusa la leggibilità dei controlli.

## Fuori ambito

La prima versione non include combattimenti contro i contendenti, danni,
Pericolo, furto tra giocatori, inventari individuali, generazione procedurale di
navi, più tentativi acquistabili, classifiche o premi indispensabili alle quest.
