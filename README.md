# Pirati: Isole del Teschio d'Oro

Struttura del gioco:

- `index.html`: app Master e sezione materiali stampabili.
- `styles.css`: layout, plancia, carte e stampa.
- `app.js`: flusso sessione, anti-farming, diario, salvataggio locale, premi e Gradi.
- `engine/pirati-core.js`: motore modulare (registro pacchetti). Nessun contenuto di gioco.
- `content/pack-*.js`: le avventure (isole + quest). Aggiungerne = copiare un file. Guida: `content/_COME-SCRIVERE-UNA-QUEST.md`.
- `content/mappa.js`: l'arcipelago (9 isole, rotte di mare, caselle). Solo dati.
- `catalog/premi.js`, `catalog/poteri.js`, `catalog/nemici.js`, `catalog/eventi.js`: bottino/trofei, poteri (carte/magie/armi/marchingegni), bestiario (10 contendenti + boss), carte rotta (eventi/tesori/razzie con scena e contesto).
- `dev-server.js`: `node dev-server.js` per provare in locale su `http://localhost:4173` (aprire `index.html` da `file://` non carica i moduli).

L'app salva i progressi in `localStorage`.
Nessun database, nessun server e nessuna build: puo essere pubblicata come file statici su Neocities.

La sezione Diario include anche esportazione/importazione del salvataggio in JSON.
Questo serve per spostare la campagna su un altro browser o recuperarla se il browser cancella i dati locali.

## Ciclo di gioco

1. Aggiungi 6-10 bambini nella sezione Ciurma.
2. Avvia o continua il giorno nella Plancia Master.
3. Usa Evento, Combattimento, Tesoro, Quest, Mercante o Riposo per avanzare.
4. L'app propone caratteristica e soglia, ma i bambini tirano il d6 fisico.
5. Inserisci nell'app il numero uscito sul dado per calcolare e registrare l'esito.
6. Le azioni ripetute, specialmente tesori/mercante/riposo, aumentano il Pericolo.
7. Stampa plancia e carte dalla sezione Stampa.

## Bilanciamento iniziale

- Sessione: 10-14 turni, pensata per circa 30 minuti.
- Prove: dado fisico `1d6 + statistica + bonus` contro la soglia missione o nemico.
- Anti-farming: cercare tesori troppe volte aumenta Pericolo e riduce valore narrativo.
- Nessuna eliminazione: i fallimenti generano costo, complicazione o perdita di tempo.
