# Come scrivere un'avventura guidata (`storyFlow` v2)

Struttura definita nel contratto tecnico:
`quest_json/quest-director-v2-tempio-contratto-tecnico.json`.
Esempio completo e funzionante: la quest **`tempio-starnutisce`** in
`content/pack-01-risveglio.js`.

Un `storyFlow` trasforma una quest in una **sequenza di momenti di gioco**.
La UI si comporta come una macchina a stati: mostra **una fase per volta**
(SCENE → RESOLUTION → OUTCOME → … → REWARDS), non tutta la scheda insieme.

È **opzionale e additivo**: si aggiunge il campo `storyFlow` a una quest già
esistente. Tutti gli altri campi (`rewards`, `growth`, `fail`, `escape`,
`choices`, `beats`…) restano e diventano la "Scheda tecnica completa",
sempre in fondo. Le quest **senza** `storyFlow` non cambiano.

---

## Struttura

```js
storyFlow: {
  start: "arrivo",
  progression: [
    { scene_id: "arrivo",  ...scena... },
    { scene_id: "tre-nasi", ...scena... },
    { scene_id: "finale",  ...scena... }
  ],
  reward_screen: {
    headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
    subtitle: "Il Tempio che Starnutisce",
    final_read: "Testo narrativo finale.",
    close_button: "⛵ Torna alla rotta"
  }
}
```

`progression` è un **array** di scene. I collegamenti sono per `scene_id`.
Per far **riconvergere** i percorsi, basta puntarli alla stessa scena.

---

## Una scena

```js
{
  scene_id: "cura",
  phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],   // documentazione: le fasi che attraversa

  scene: {                     // fase SCENE
    read: "Testo da leggere parola per parola.",
    ask: "Domanda ai bambini.",
    hints: ["spunto 1", "spunto 2", "spunto 3"],    // servono se c'è 'ask'
    rescue: "Frase pronta se nessuno parte.",       // serve se c'è 'ask'
    masterTip: "Indicazione di regia, discreta."
  },

  // UNO di questi tre, secondo il tipo di scena:

  // A) bivio → fase RESOLUTION mostra la reaction come card centrale
  choices: [
    { id: "cura", label: "💊 Curiamo il tempio",
      reaction_title: "La ciurma prepara una cura",
      reaction: "Conseguenza immediata della scelta.",
      next: "cura" }
  ],

  // B) prova → fase RESOLUTION poi OUTCOME
  resolution: {
    policy: "destiny_group_or_dice",         // vedi tabella
    destiny: { group: 60, dice: 40 },        // pesi (per le policy destiny*)
    destiny_screen: {
      title: "✦ Il Destino ascolta la vostra medicina",
      button: "Affidiamoci al Destino",
      group_result: "Testo se il Destino sceglie 'group' (= successo).",
      dice_result: "Testo se il Destino sceglie 'dice'.",
      narrative_result: "Testo se il Destino sceglie 'narrative' (= successo)."
    },
    dice: { stat: "astuzia", target: 6 }
  },
  outcomes: {                                // fase OUTCOME (con resolution)
    success:      { title, text, audio: "win-event", next: "piuma" },
    fail_forward: { title, text, effects: ["Pericolo +1"], audio: "fallimento", next: "piuma" }
  },

  // C) scena senza prova (o resolution.policy "narrative") → SCENE poi OUTCOME
  outcome: { title, text, audio: "click", next: "tre-nasi" },

  // D) finale
  completion: { action_label: "🏴‍☠️ Concludi l'avventura" }
}
```

### Avvistamento piratesco (`type: "raid"`)

Uno step può aprire il saccheggio giornaliero al posto di una scena ordinaria:

```js
{
  id: "navi-dolci",
  type: "raid",
  pairId: "dolce-freddo",
  skippedText: "Tra una discussione e l'altra, le due navi spariscono oltre l'orizzonte."
}
```

`pairId` deve essere l'ID di una coppia registrata nel catalogo dei saccheggi.
Quando il saccheggio si chiude, l'avventura riprende dallo step immediatamente
successivo nell'array `progression`: lo step `raid` non richiede quindi un campo
`next`. Se il tentativo giornaliero è già stato usato, non costa nulla e mostra
subito `skippedText`; se manca, usa “Le due navi sono ormai troppo lontane.”.

Il successo o il fallimento del saccheggio assegna soltanto gli eventuali premi
del saccheggio: **non modifica l'esito della quest**, non risolve una prova dello
StoryFlow e non decide se l'avventura è completata.

### `resolution.policy`

| policy | fase RESOLUTION |
|---|---|
| `narrative` | nessun dado: SCENE → OUTCOME diretto (serve comunque `outcome`) |
| `group` | sfida collaborativa: il Master preme "riusciti insieme" o "non del tutto" → `outcomes.success` / `outcomes.fail_forward` |
| `dice` | tutti i pirati in gioco tirano 1d6 + `dice.stat`, media ≥ `dice.target` |
| `destiny` | il Destino sceglie fra `narrative` (= successo) e `dice` |
| `destiny_group_or_dice` | il Destino sceglie fra `group` (= successo) e `dice` |

Nelle policy `destiny*`, l'esito **morbido** (`group` / `narrative`) è un
successo narrativo senza fallimento: si mostra `group_result` /
`narrative_result`. La strada `dice` è l'unica dove può scattare il
`fail_forward`. Il risultato del Destino è **salvato**: il refresh non lo ri-tira.

### `effects`

Array di stringhe applicate all'esito, es. `["Pericolo +1"]` → `state.session.danger += 1`
(applicato una sola volta). Riconosce `Pericolo +N` / `Pericolo -N`.

### Carte

Se la ciurma ha carte/poteri giocabili, compaiono da sole nella fase
RESOLUTION prima del tiro. `bonus`/`teambonus` alzano la media; `auto`/`skip`
risolvono la scena; `narrative` mostra l'effetto (lo applica il Master).

---

## Fase REWARDS

Il pulsante del `finale` NON chiude subito la quest: crea uno snapshot
prima/dopo, applica premi/crescita/Grado **una volta**, e mostra la
schermata **AVVENTURA COMPLETATA** con monete, Potenza della Ciurma, Grado,
crescita dei pirati e nuove carte. È persistente e idempotente: il refresh
non riassegna i premi. Solo `close_button` chiude e torna alla mappa.

---

## Audio (solo suoni esistenti)

`click` · `star` · `win-event` · `fallimento` · `minaccia` · `trionfo` · `grado`.
Si impostano nei campi `audio` di `outcome` / `outcomes.*`.

---

## Regole d'oro

- **4-7 scene**. 1-2 bivi veri, che riconvergono.
- Ogni `ask` ha `hints` **e** `rescue`.
- Ogni `choice` ha `reaction_title` + `reaction`.
- Non tutte le scene hanno un dado.
- Un `fail_forward` è un esito completo, mai un blocco.

## Controllo

`PIRATI.report()` in console (F12) dice quante quest sono "guidate" e segnala:
`ask` senza `hints`/`rescue`, `next` verso scene inesistenti, scene
irraggiungibili, `policy` sconosciuta.
