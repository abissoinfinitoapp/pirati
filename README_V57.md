# V57 — Diagnostica Rive Arena

Partenza: V56. Sostituire solo `fortress-game-ui.js`.

La V56 considerava il `onLoad` come prova di rendering. La V57 prova prima lo state machine sul default artboard, poi esplicitamente su `Artboard 1`, ridimensiona il canvas dopo frame effettivi, verifica che il canvas abbia pixel e segnala nel pannello se rimane vuoto.

Non modifica regole, dadi, rarità o premi. I test qui inclusi sono statici; **rendering e trigger devono essere verificati in browser con l'asset del progetto**.
