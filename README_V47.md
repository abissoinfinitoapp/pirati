# Fortress Army V47 — Correzione turni Animal Battle

Base: V46. Sostituire soltanto `fortress-game-ui.js`.

Problema: il selettore degli scontri misti poteva privilegiare ripetutamente l'animale come attaccante; quando il giocatore si difendeva con un tiro maggiore, risultava correttamente una parata, non un danno all'animale.

Fix minimo: quando la coppia comprende un giocatore e un animale, i ruoli di attaccante/difensore si alternano a ogni scontro misto tramite `arena.mixedExchanges`, salvato assieme allo stato Arena. Il primo scontro misto mette il giocatore in attacco; il secondo l'animale, e così via. I duelli fra giocatori sono invariati, così come 2D6, danni, Splatter House e skill.

Test nuovo: `tests/fortress-arena-mixed-turn-v47.test.js`: alternanza, KO di animale con attacco umano e persistenza contatore.

Verifiche: `node --check fortress-game-ui.js` e test V47 PASS.

Nota: il test V46 originale `fortress-arena-skills-v46.test.js` fallisce anche sulla baseline V46 alla riga 51: si attende HP 70 ma ottiene 50 in una verifica del Vampiro; non modificato nel bugfix perché preesistente e non attinente alla turnazione.

Da verificare in playtest mobile.
