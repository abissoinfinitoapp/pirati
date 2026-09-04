# Come aggiungere quest senza toccare il codice

Tutti i contenuti di gioco stanno in file separati. Per aggiungere avventure
**non serve modificare `app.js`**: si crea (o si allunga) un file "pacchetto".

```
content/
  pack-01-risveglio.js      ← Ciclo I (8 isole, 16 quest) - esempio completo
  pack-02-....js            ← i tuoi nuovi pacchetti
catalog/
  premi.js                  ← elenco di bottino e trofei
  poteri.js                 ← elenco di carte, magie, armi, marchingegni
```

## 1. Creare un nuovo pacchetto

1. Copia `pack-01-risveglio.js` e rinominalo, es. `pack-02-tempesta.js`.
2. Cambia `id` (deve essere unico) e `name`.
3. Riscrivi le `islands` e le `quests`.
4. Apri `index.html` e aggiungi **una riga** vicino alle altre:

```html
<script src="content/pack-02-tempesta.js"></script>
```

Ricarica la pagina. In basso nella console del browser (tasto F12) comparirà
un riepilogo tipo `[PIRATI] Pacchetti: 2 | Isole: 12 | Quest: 30 ...`
e l'elenco degli eventuali **avvisi** (campi dimenticati, premi non a catalogo).

L'ordine delle quest nella campagna = ordine dei pacchetti + campo `order`
dentro ogni quest.

## 2. Schema di una quest

```js
{
  id: "nome-unico-quest",        // obbligatorio, minuscolo-con-trattini
  island: "id-isola",            // deve esistere nell'array islands
  order: 1,                      // ordine dentro l'isola / campagna
  title: "Il Titolo dell'Avventura",
  kind: "Mistero comico",        // etichetta libera (Trattativa, Salvataggio...)
  difficulty: 6,                 // soglia base 4-8
  minutes: 55,                   // durata indicativa: guida il piano giornaliero

  // Testo che legge l'ADULTO ad alta voce per aprire la scena:
  readAloud: "Una frase o due, evocative, che mettono i bambini nella scena.",

  // Testo che leggono i BAMBINI a turno (uno legge una riga).
  // Due livelli: il Master sceglie con il pulsante Facile / Avanzato.
  readKids: {
    facile:   ["Frase corta.", "Un'altra corta.", "Ultima corta."],
    avanzato: ["Frase più ricca.", "Con qualche parola nuova.", "…", "…"]
  },

  goal: "Una riga: cosa devono ottenere.",

  beats: [                       // 2-3 scene che il Master guida
    "Prima cosa che succede / da far inventare.",
    "Complicazione o scelta di mezzo.",
    "Ostacolo finale prima della ricompensa."
  ],

  // Da 1 a 3 modi di risolvere. 'stat' = coraggio | astuzia | fortuna
  choices: [
    { label: "Approccio A", stat: "astuzia", target: 6, result: "Cosa succede se riesce." },
    { label: "Approccio B", stat: "coraggio", target: 6, result: "Cosa succede se riesce." }
  ],

  // Sfida collaborativa: una domanda aperta per tutto il gruppo
  groupChallenge: "Inventate insieme...",

  // PREMI: tanti, sempre visibili. type ammessi:
  //   loot   -> id da catalog/premi.js  (oggetto utile che resta)
  //   trophy -> id da catalog/premi.js  (ricordo per la Sala dei Trofei)
  //   power  -> id da catalog/poteri.js (carta/magia/arma/marchingegno)
  //   coins  -> { type:"coins", amount: 250000 }
  //             Le monete si scrivono GRANDI, per intero: una quest vale
  //             ~200.000-400.000, un saccheggio ~500.000-3.000.000, il boss
  //             ~500.000. I bambini vogliono numeri da veri pirati.
  //   fame   -> { type:"fame",  amount: 2 }  (resta piccola: 1-2, per i finali)
  rewards: [
    { type: "loot",   id: "nome-oggetto" },
    { type: "coins",  amount: 250000 },
    { type: "trophy", id: "nome-trofeo" },
    { type: "power",  id: "nome-potere" }
  ],

  growth: "Chi fa X segna 1 crescita in <caratteristica>.  (= +100 Potenza, mostrato x100)",
  fail:   "Cosa succede se falliscono: mai eliminazione, sempre un costo o una svolta.",
  escape: "Via di fuga se la ciurma resta bloccata su quest'isola."
}
```

### Campi obbligatori
`id`, `island`, `title`, `readAloud`, almeno 1 `beat`, almeno 1 `choice`,
`readKids.facile`, `readKids.avanzato`, almeno 1 premio in `rewards`.
Gli altri campi, se mancano, vengono riempiti con valori neutri e un avviso.

## 3. Aggiungere un premio nuovo

In `catalog/premi.js`:

```js
loot: [
  { id: "lanterna-abissale", name: "Lanterna Abissale", icon: "🏮",
    rarity: "raro", text: "Illumina anche sott'acqua per una scena." }
]
```

`rarity` è `"comune"`, `"raro"` o `"epico"` e cambia solo il colore/brillìo della carta.
`icon` può essere una emoji o un simbolo.

## 4. Aggiungere un potere nuovo

In `catalog/poteri.js`:

```js
{ id: "ancora-fantasma", name: "Àncora Fantasma", icon: "⚓",
  category: "marchingegno",   // carta | magia | arma | marchingegno
  grade: 2,                   // Grado minimo della ciurma (1..5)
  cooldown: "giorno",         // quest | giorno | permanente
  effect: "Ferma qualsiasi cosa in movimento per un turno." }
```

I poteri **si accumulano per tutto l'anno** e non si perdono. La ciurma sale di
**Grado** ogni tot quest completate (scala in `engine/pirati-core.js`, campo
`gradeLadder`): a ogni Grado si sbloccano i poteri con `grade` uguale o inferiore.

## 5. Provare le modifiche

Apri un terminale nella cartella del progetto:

```bash
node dev-server.js
```

poi vai su `http://localhost:4173`. Apri la console del browser (F12) e controlla
la riga `[PIRATI]` e gli avvisi. Correggi finché "Avvisi: 0".

## 6. La mappa (`content/mappa.js`)

La mappa è un file di soli dati. Struttura:

- `nodes`: le 9 isole. Ognuna ha `x,y` (0..100, dove la disegna la mappa SVG),
  `icon`, `name`. Le 8 isole esterne hanno `island` (l'id dell'isola delle quest)
  e un `loop`: il giro a terra, una lista di caselle. Il Porto centrale ha `home: true`.
- `legs`: le rotte di mare. Ogni rotta ha `from`, `to` e `spaces` (lista di caselle).
  Sono bidirezionali (al ritorno le caselle si leggono al contrario).

Caselle ammesse in `spaces` e `loop`:
`mare` `costa` `evento` `mostro` `assalto` `razzia` `tesoro` `quest`.

- `quest` prende automaticamente la prossima avventura non ancora fatta di
  quell'isola. Quando l'isola è finita, la casella `quest` diventa mare.
- `evento` / `mostro` / `assalto` / `tesoro` pescano dai mazzi in `app.js`
  (`DATA.events`, `DATA.enemies`, `DATA.treasures`).

Per allungare una rotta o cambiare gli incontri basta modificare le liste
`spaces`. Per aggiungere un'isola: aggiungi un `node` (con `x,y` liberi) e le
`legs` che la collegano.

## 6bis. I nemici (`catalog/nemici.js`)

Array di contendenti + il boss. Ogni voce:

```js
{ id: "id-unico", name: "Nome Soprannome", vibe: "pauroso ma divertente",
  threat: 7,                  // soglia della prova (5 facile .. 9 tosto, boss 11-12)
  reward: "cosa si guadagna",
  trick: "punto debole / come batterlo, utile anche per raccontare",
  art:  "descrizione per generare l'immagine",
  boss: true }                // solo per il boss
```

Il gioco pesca da qui per le caselle `mostro` e `assalto` della mappa e per il
Combattimento; il boss compare quando il Pericolo va al massimo. L'immagine va in
`assets/contendenti/<id>.png` (campo `image`, riempito da solo): appena il file
esiste il gioco lo mostra.

## 7. Pubblicare

Non cambia nulla: carica tutti i file (compresa la cartella `content/`,
`catalog/`, `engine/`) sul tuo hosting statico. Nessun database, nessuna build.
