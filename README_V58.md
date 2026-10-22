# Fortress Army V58 — Gift Machine: dipendenza mancante

Diagnosi: i pulsanti risultano inerti se nel progetto resta il vecchio `fortress-gift-machine.js`: il vecchio modulo espone `drawWeapon()` (Avventura), ma non `drawArenaWeapon()` (Arena). La UI V57 usciva senza messaggi al click.

## Installazione
Sostituire ENTRAMBI i file nelle rispettive posizioni del progetto:
- `fortress-game-ui.js` (V58)
- `fortress-gift-machine.js` (versione Arena V54, invariata)

Ricaricare forzatamente la pagina (Ctrl+F5) e verificare dal browser `typeof window.FORTRESS_GIFT_MACHINE?.drawArenaWeapon` → `function`.

V58 aggiunge un messaggio d'errore visibile se la dipendenza non è caricata. Non modifica danni, rarità o flusso dell'Avventura. Il corretto funzionamento dell'animazione Rive richiede comunque prova reale nel browser.
