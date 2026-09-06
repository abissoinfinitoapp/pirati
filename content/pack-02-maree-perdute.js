/* =============================================================================
   PACCHETTO 02 - Ciclo II: La Rotta delle Maree Perdute
   Stesse 8 isole del Ciclo I (non le ri-registra). 16 avventure.
   Concept: quest_json/ciclo-02-maree-perdute-16-quest-concept.json
   Formato storyFlow: content/_COME-SCRIVERE-UNO-STORYFLOW.md
   ========================================================================== */

PIRATI.registerPack({
  id: "maree-perdute",
  name: "Ciclo II · La Rotta delle Maree Perdute",

  /* niente 'islands': si riusano quelle del Ciclo I (rovine, vulcano, ...) */

  quests: [

    /* ---- ROVINE DELLA GIUNGLA ----------------------------------------- */
    {
      id: "giorno-senza-ombre", island: "rovine", order: 1,
      title: "Il Giorno Senza Ombre", kind: "Mistero fantastico",
      difficulty: 6, minutes: 55,
      readAloud: "A mezzogiorno le ombre dei pirati si staccano dai piedi e corrono via, tutte verso le rovine. Non sono spaventate: sembra che qualcuno le abbia chiamate.",
      readKids: {
        facile: [
          "Le ombre si staccano dai piedi.",
          "Corrono verso le rovine.",
          "Qualcuno le ha chiamate."
        ],
        avanzato: [
          "È mezzogiorno e il sole è alto, ma le vostre ombre non stanno ferme.",
          "Una dopo l'altra si staccano dai piedi e scappano.",
          "Corrono tutte nella stessa direzione, verso le rovine.",
          "Da lontano una voce sottile le chiama, e loro rispondono."
        ]
      },
      goal: "Recuperare le ombre e capire perché sono fuggite.",
      beats: [
        "Ogni ombra ha un motivo diverso per essere scappata.",
        "Nelle rovine c'è un'ombra di troppo: la tredicesima.",
        "Una voce lontana promette alle ombre una vita vera."
      ],
      choices: [
        { label: "Parlare con le ombre", stat: "astuzia", target: 6, result: "Le ombre spiegano cosa le ha convinte e tornano se le ascoltate davvero." },
        { label: "Seguirle di nascosto", stat: "fortuna", target: 6, result: "Le seguite senza farvi notare fino a chi le sta chiamando." }
      ],
      groupChallenge: "Inventate insieme cosa direbbe la vostra ombra se potesse parlare: una cosa che le piace di voi e una che vorrebbe fare da sola.",
      rewards: [
        { type: "loot", id: "frammento-ombra" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "luce-delle-ombre" },
        { type: "power", id: "richiamo-ombra" }
      ],
      growth: "Chi promette alla propria ombra qualcosa che poi mantiene segna 1 crescita Astuzia.",
      fail: "Un'ombra fa il dispetto e nasconde qualcosa della ciurma: Pericolo +1, ma nel cercarla trovate un passaggio nuovo.",
      escape: "Muoversi solo dove non batte il sole, di ombra in ombra, fino alla costa: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Le vostre ombre sono in fila indiana e corrono via senza di voi. Dalla parte delle rovine, una vocina le chiama per nome — nomi che non sapevate nemmeno avessero.",
              ask: "Se la tua ombra potesse parlare, cosa direbbe di te? E perché scapperebbe?",
              hints: [
                "È stanca di copiare sempre gli stessi movimenti.",
                "Vuole vivere un'avventura tutta sua.",
                "Qualcuno le ha promesso che potrebbe diventare vera.",
                "Si sente ignorata: nessuno la guarda mai."
              ],
              rescue: "Un'ombra si volta un attimo, ti fa ciao con la mano, e riprende a correre.",
              masterTip: "Muovi la mano e guarda la tua ombra sul muro: chiedi ai bambini cosa sta pensando in quel momento."
            },
            interaction: "Nessun tiro: si dà voce alle ombre.",
            outcome: {
              title: "Le ombre rallentano",
              text: "Sentendovi parlare di loro, per un attimo si fermano tutte. Poi la vocina chiama ancora e riprendono, ma più piano: vogliono essere seguite.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Le ombre si infilano tra le colonne delle rovine. Potete raggiungerle e parlarci a viso aperto, oppure seguirle senza farvi vedere per scoprire chi le chiama.",
              ask: "Le fermiamo per parlarci, o le seguiamo di nascosto?",
              hints: [
                "Parlare è diretto, ma un'ombra offesa potrebbe non ascoltare.",
                "Seguirle di nascosto è più lento, ma scopri di più.",
                "Si può parlare a una e seguire le altre."
              ],
              rescue: "Un raggio di sole taglia il pavimento: da una parte c'è luce, dall'altra ombra fitta dove nascondersi."
            },
            choices: [
              {
                id: "parlare",
                label: "🗣 Parliamo con le ombre",
                reaction_title: "La ciurma affronta le ombre",
                reaction: "Vi mettete davanti alle vostre ombre e chiedete, senza arrabbiarvi: «Cosa vi manca?» Loro si guardano tra di loro.",
                next: "parlare"
              },
              {
                id: "seguire",
                label: "🤫 Le seguiamo di nascosto",
                reaction_title: "La ciurma si muove nell'ombra",
                reaction: "Vi appiattite contro le colonne e avanzate solo quando le ombre non guardano. La vocina si fa più vicina.",
                next: "seguire"
              }
            ]
          },
          {
            scene_id: "parlare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le ombre parlano tutte insieme, sovrapposte. Ognuna ha una lamentela diversa: chi vuole riposare, chi vuole fare cose sue, chi si sente invisibile.",
              ask: "Come ascoltate dodici ombre che parlano insieme senza perdere quello che dicono?",
              hints: [
                "Farle parlare una alla volta, dando un turno a ognuna.",
                "Chiedere a ogni pirata di ascoltare solo la propria.",
                "Ripetere a voce alta quello che avete capito, per controllare."
              ],
              rescue: "Un'ombra alza la mano, come a scuola: vuole parlare per prima.",
              masterTip: "Fai dire a tre bambini cosa vuole la loro ombra, con parole loro."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino ascolta le ombre",
                button: "Affidiamoci al Destino",
                group_result: "Le ombre si sentono capite: annuiscono e tornano ai vostri piedi da sole.",
                dice_result: "Un'ombra non è convinta e fa storie: serve una prova di Astuzia per rassicurarla."
              },
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LE OMBRE TORNANO",
                text: "Una per una, le ombre riscivolano sotto ai vostri piedi. Ma restano un po' più vive di prima: adesso vi seguono, non vi copiano soltanto.",
                audio: "win-event",
                next: "tredicesima"
              },
              fail_forward: {
                title: "🌑 UN'OMBRA FA I CAPRICCI",
                text: "L'ombra più testarda scappa di nuovo e vi nasconde una cosa: Pericolo +1. Cercandola, però, entrate in una sala che non avevate visto.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "tredicesima"
              }
            }
          },
          {
            scene_id: "seguire",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le ombre si radunano al centro di una sala crollata. La vocina viene da un pozzo asciutto, che rimanda l'eco come un imbuto verso il cielo.",
              ask: "Come vi avvicinate al pozzo senza che le ombre — o la voce — si accorgano di voi?",
              hints: [
                "Muoversi solo mentre la voce parla e copre i vostri passi.",
                "Restare nell'ombra delle colonne, non nella luce.",
                "Uno si avvicina, gli altri fanno il palo."
              ],
              rescue: "Un sassolino cade nel pozzo e la voce si zittisce per un secondo, in ascolto."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ AVETE SENTITO TUTTO",
                text: "Rannicchiati sul bordo, sentite la voce fare la sua promessa alle ombre: una nave, un mondo dove essere vere. Poi tace, e le ombre restano lì, indecise.",
                audio: "win-event",
                next: "tredicesima"
              },
              fail_forward: {
                title: "👣 UN PASSO DI TROPPO",
                text: "Fate scricchiolare una pietra: le ombre si voltano di scatto e una vi soffia addosso una folata di buio, Pericolo +1. Ma nella confusione riuscite comunque a sbirciare dentro il pozzo.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "tredicesima"
              }
            }
          },
          {
            scene_id: "tredicesima",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Contate le ombre: sono tredici. Ma i pirati sono dodici. Una di quelle ombre non è di nessuno di voi: è più lunga, un po' consumata ai bordi, e trema come se avesse freddo.",
              ask: "Di chi è la tredicesima ombra? E cosa le dite?",
              hints: [
                "È di qualcuno che è lontano, su una nave.",
                "È venuta a chiamare le altre perché il suo pirata l'ha persa.",
                "Ha bisogno di sentirsi dire qualcosa di gentile."
              ],
              rescue: "La tredicesima ombra si avvicina alla vostra e le si appoggia contro, come un cane infreddolito.",
              masterTip: "Chiedi: cosa direste a un'ombra che ha perso il suo pirata?"
            },
            interaction: "Nessun tiro: è un momento di parole.",
            outcome: {
              title: "L'ombra straniera vi ascolta",
              text: "Qualunque cosa le dite, la tredicesima ombra smette di tremare. Prima di scivolare via nel pozzo, disegna sul muro, con un dito di buio, la sagoma di una nave dalle vele piene di ombre.",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Le vostre dodici ombre sono di nuovo ai vostri piedi, ma cambiate: più attente, quasi complici. Nel punto dove stava la tredicesima resta un pezzetto di buio solido, freddo come una pietra di fiume.",
              masterTip: "Chiudi con la domanda: cosa prometti alla tua ombra, adesso che sai che ti ascolta?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Giorno Senza Ombre",
          final_read: "Le ombre tornano ai vostri piedi, un po' più vive. Il Frammento d'Ombra è freddo nella mano della ciurma — e punta lontano.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    {
      id: "biblioteca-degli-alberi", island: "rovine", order: 2,
      title: "La Biblioteca degli Alberi", kind: "Storie perdute",
      difficulty: 7, minutes: 55,
      readAloud: "Gli alberi delle rovine raccontano storie: le parole scorrono sulle foglie come acqua. Ma ogni racconto si interrompe di colpo — qualcuno ha strappato via tutti i finali.",
      readKids: {
        facile: [
          "Gli alberi raccontano storie sulle foglie.",
          "Ma le storie si fermano a metà.",
          "Qualcuno ha rubato i finali."
        ],
        avanzato: [
          "Le foglie degli alberi sono coperte di parole che si muovono.",
          "Sono storie: se segui una foglia, segui un racconto.",
          "Ma arrivati a un certo punto, le parole finiscono di colpo.",
          "In ogni storia manca l'ultima pagina: qualcuno se l'è portata via."
        ]
      },
      goal: "Ridare un finale alle storie e capire dove sono finite le conclusioni originali.",
      beats: [
        "Ogni storia dell'albero si ferma un attimo prima della fine.",
        "I personaggi delle storie escono dalle foglie e chiedono aiuto.",
        "Un ramo scrive da solo un messaggio sulla nave che colleziona le cose impossibili."
      ],
      choices: [
        { label: "Inventare nuovi finali", stat: "fortuna", target: 6, result: "I finali inventati dalla ciurma attecchiscono sulle foglie come germogli." },
        { label: "Chiedere ai personaggi", stat: "astuzia", target: 7, result: "I personaggi delle storie dicono che finale vorrebbero, e gli alberi lo accettano." }
      ],
      groupChallenge: "Scegliete una storia e inventatele un finale che non sia né felice né triste, ma sorprendente: una cosa che nessuno si aspetta.",
      rewards: [
        { type: "loot", id: "foglia-finale" },
        { type: "coins", amount: 275000 },
        { type: "trophy", id: "voce-degli-alberi" },
        { type: "power", id: "pagina-bianca" }
      ],
      growth: "Chi ascolta il finale proposto da un compagno e lo migliora invece di scartarlo segna 1 crescita Fortuna.",
      fail: "Un finale storto fa arrabbiare un personaggio, che esce dalla foglia e combina un guaio: Pericolo +1, poi si calma e vi aiuta.",
      escape: "Salire su una foglia grande come una barca e lasciarsi portare dal vento delle storie fino alla costa: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Seguite una foglia con gli occhi: c'è un drago, una principessa che non vuole essere salvata, un tesoro nascosto. Poi, di colpo, la foglia diventa bianca. La storia si ferma proprio sul più bello.",
              ask: "Perché qualcuno ruberebbe solo i finali delle storie, e non le storie intere?",
              hints: [
                "Un finale è la parte che ti fa sentire qualcosa.",
                "Forse gli servono per finire una storia sua.",
                "Forse un finale vale più di tutto il resto messo insieme."
              ],
              rescue: "Un rametto ti sfiora la spalla e scrive nell'aria: «Aiutami a finire».",
              masterTip: "Racconta l'inizio di una storia e fermati a metà frase: i bambini vorranno subito continuarla."
            },
            interaction: "Nessun tiro: si ragiona sul furto dei finali.",
            outcome: {
              title: "Gli alberi frusciano forte",
              text: "Tutte le foglie bianche si girano verso di voi nello stesso momento. Aspettano. Hanno bisogno di un finale, e in fretta.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Dai tronchi escono i personaggi delle storie interrotte: il drago si gratta la testa, la principessa sbadiglia, il tesoro rotola qua e là. Nessuno sa come va a finire.",
              ask: "Inventiamo noi i finali, o chiediamo ai personaggi come vorrebbero che la loro storia finisca?",
              hints: [
                "Inventare è più libero, ma potreste non azzeccare quello che sentono loro.",
                "Chiedere ai personaggi è più giusto, ma qualcuno non lo sa nemmeno.",
                "Si può inventare insieme a loro."
              ],
              rescue: "Il drago vi guarda speranzoso: «Per favore, non fatemi combattere. Sono stanco.»"
            },
            choices: [
              {
                id: "inventare",
                label: "✍️ Inventiamo noi i finali",
                reaction_title: "La ciurma prende in mano la penna",
                reaction: "Vi mettete in cerchio e cominciate a proporre finali. Le foglie bianche tremano, pronte a scrivere quello che decidete.",
                next: "inventare"
              },
              {
                id: "chiedere",
                label: "🙋 Chiediamo ai personaggi",
                reaction_title: "La ciurma intervista le storie",
                reaction: "Vi sedete con il drago, la principessa e il tesoro e chiedete a ognuno: «Tu, come vorresti che andasse a finire?»",
                next: "chiedere"
              }
            ]
          },
          {
            scene_id: "inventare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Un finale, se non ci pensi bene, diventa banale: e vissero felici e contenti, come sempre. Gli alberi lo accettano lo stesso, ma le foglie restano un po' spente.",
              ask: "Qual è il vostro finale per la storia del drago stanco? Fatelo diverso dal solito: né tutto felice, né triste, ma a sorpresa.",
              hints: [
                "Il drago potrebbe non voler combattere e aprire una scuola di volo.",
                "Il tesoro potrebbe non essere oro, ma un baule pieno di lettere.",
                "Il cattivo potrebbe aver bisogno di aiuto, non di essere sconfitto.",
                "La storia potrebbe finire con una nuova domanda invece che con una risposta."
              ],
              rescue: "Una foglia scrive da sola le prime tre parole del vostro finale e aspetta il resto.",
              masterTip: "Fai proporre un finale a un bambino, poi chiedi a un altro di aggiungerci una sorpresa."
            },
            resolution: {
              policy: "destiny",
              destiny: { narrative: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino sceglie quale finale prende vita",
                narrative_result: "Il vostro finale è così bello che l'albero lo fa germogliare subito, senza prove.",
                dice_result: "Due finali si contendono la stessa storia: serve una prova di Fortuna per farne attecchire uno."
              },
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LE FOGLIE SI RIEMPIONO",
                text: "Il vostro finale scorre sulle foglie bianche come inchiostro verde. Il drago apre la sua scuola di volo, la principessa si iscrive, e la storia respira di nuovo.",
                audio: "win-event",
                next: "ramo"
              },
              fail_forward: {
                title: "😤 UN PERSONAGGIO NON CI STA",
                text: "La principessa non accetta il finale che le avete scritto ed esce dalla foglia sbattendo la porta: Pericolo +1. Poi però vi propone lei un finale migliore, e l'albero lo prende.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "ramo"
              }
            }
          },
          {
            scene_id: "chiedere",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "I personaggi si aprono a fatica. Il drago dice piano che non ha mai voluto combattere. La principessa vuole partire, non essere salvata. Il tesoro... il tesoro non parla, ma luccica in modo strano quando dici la parola «casa».",
              ask: "Come mettete insieme tre desideri così diversi in un finale che stia in piedi?",
              hints: [
                "Il drago accompagna la principessa nel suo viaggio.",
                "Il tesoro non è un premio: è quello che cercavano tutti, cioè un posto dove stare.",
                "Ognuno rinuncia a un pezzetto del suo desiderio per farci stare gli altri."
              ],
              rescue: "Il tesoro rotola fino ai piedi del drago e ci si appoggia. Forse il finale è già lì."
            },
            resolution: {
              policy: "group",
              group: "Costruite un finale che accontenti drago, principessa e tesoro tutti e tre insieme, anche solo un po' ciascuno."
            },
            outcomes: {
              success: {
                title: "✨ TUTTI DENTRO LA STESSA PAGINA",
                text: "Il finale che avete cucito insieme entra nelle foglie e ci resta, saldo. I tre personaggi si guardano, sorpresi di essere finiti nella stessa storia — e contenti.",
                audio: "win-event",
                next: "ramo"
              },
              fail_forward: {
                title: "📖 FINALE TROPPO STRETTO",
                text: "Il finale lascia fuori qualcuno e la storia si sgualcisce: Pericolo +1. Lo allargate un po', ci fate entrare anche il personaggio dimenticato, e stavolta regge.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "ramo"
              }
            }
          },
          {
            scene_id: "ramo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Mentre le storie ripartono, un ramo si muove da solo e incide qualcosa sulla corteccia dell'albero più vecchio, come se prendesse appunti.",
              ask: "Cosa avrà scritto il ramo? Provate a leggere insieme.",
              hints: [
                "Qualcosa su chi porta via le cose che non si possono comprare.",
                "Un avviso: state attenti, non siete i soli a cui manca qualcosa.",
                "Il disegno di una nave con le vele fatte di pagine."
              ],
              rescue: "Il ramo finisce di scrivere e resta immobile, indicando l'orizzonte con la punta.",
              masterTip: "Leggi la frase del ramo con voce misteriosa, poi vai avanti."
            },
            interaction: "Nessun tiro: si legge l'indizio.",
            outcome: {
              title: "L'indizio del ramo",
              text: "«Qualcuno colleziona ciò che non si può comprare — le fini delle storie, le risate, i nomi — e le porta su una nave.» Sotto, il ramo ha disegnato una prua che fende le onde.",
              audio: "minaccia",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Ogni foglia bianca è di nuovo piena di parole. Le storie hanno tutte un finale — non sempre quello di prima, ma un finale vero. L'albero più vecchio lascia cadere in mano vostra una foglia che non appassisce mai.",
              masterTip: "Chiudi con la domanda: se potessi cambiare il finale di una storia che conosci, cosa cambieresti?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Biblioteca degli Alberi",
          final_read: "Le foglie tornano piene di parole e ogni storia ha il suo finale. La Foglia del Finale non appassirà mai, nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    /* ---- VULCANO RUGGENTE -------------------------------------------- */
    {
      id: "vulcano-ha-paura", island: "vulcano", order: 1,
      title: "Il Vulcano ha Paura", kind: "Aiuto emotivo comico",
      difficulty: 6, minutes: 55,
      readAloud: "Il Vulcano Ruggente non ruggisce più. Ogni volta che sta per eruttare si trattiene, diventa rosso di vergogna e mormora: «Scusate, scusate, non volevo spaventarvi». Dentro, però, la pressione sale.",
      readKids: {
        facile: [
          "Il vulcano non erutta più.",
          "Ha paura di spaventare tutti.",
          "Continua a chiedere scusa.",
          "Ma dentro sta per scoppiare."
        ],
        avanzato: [
          "Il Vulcano Ruggente è tutto tremante.",
          "Ogni volta che sta per eruttare si ferma all'ultimo.",
          "«Scusate», dice piano, «non volevo fare paura a nessuno».",
          "Ma se non butta fuori un po' di fumo, prima o poi scoppia sul serio."
        ]
      },
      goal: "Aiutare il vulcano a ritrovare il coraggio di ruggire senza diventare un pericolo.",
      beats: [
        "Il vulcano si scusa in continuazione e trattiene tutto.",
        "Serve un modo di 'fare rumore' che non spaventi gli abitanti.",
        "Il vulcano ricorda una nave che sembrava aspirare il rumore dalle montagne."
      ],
      choices: [
        { label: "Incoraggiarlo con le parole", stat: "coraggio", target: 6, result: "Trovate le parole giuste e il vulcano si fida abbastanza da provare un piccolo sbuffo." },
        { label: "Insegnargli un'eruzione buffa", stat: "astuzia", target: 6, result: "Gli fate provare eruzioni ridicole finché una funziona: rumore sì, paura no." }
      ],
      groupChallenge: "Inventate insieme il 'ruggito educato' del vulcano: che suono fa, cosa butta fuori al posto della lava, e come avvisa prima di partire.",
      rewards: [
        { type: "loot", id: "fischietto-coraggio" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "amico-del-vulcano" },
        { type: "power", id: "boato-gentile" }
      ],
      growth: "Chi trova le parole per rassicurare il vulcano segna 1 crescita Coraggio.",
      fail: "Il vulcano si spaventa di sé stesso e sbuffa una nuvola di cenere: Pericolo +1, ma la cenere disegna in aria la sagoma di una nave.",
      escape: "Scendere dal cono seguendo un ruscello di acqua calda fino alla costa: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Il vulcano vi vede arrivare e sussurra: «Oh no, ci sono anche i bambini. State indietro, potrei... potrei fare un rumore bruttissimo». Ma trema tutto, e dai fianchi escono nuvolette di vapore trattenuto.",
              ask: "Come si rassicura un vulcano gigante che ha paura di essere sé stesso?",
              hints: [
                "Dirgli che un po' di rumore va benissimo.",
                "Raccontargli una volta in cui voi avete avuto paura di fare qualcosa.",
                "Fargli capire che forte e spaventoso non sono la stessa cosa.",
                "Chiedergli cosa succederebbe di brutto, secondo lui."
              ],
              rescue: "Un sasso rotola giù dal cono, il vulcano fa un piccolo «hop!» di paura e poi si scusa anche col sasso.",
              masterTip: "Chiedi ai bambini di una volta in cui avevano paura di fare una cosa (parlare in pubblico, tuffarsi) e l'hanno fatta lo stesso."
            },
            interaction: "Nessun tiro: si parla col vulcano.",
            outcome: {
              title: "Il vulcano si asciuga una lacrima di lava",
              text: "Sentendovi parlare così, il vulcano fa un lungo respiro. «Va bene», dice. «Provo. Ma restate lì e ditemi se faccio troppa paura».",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Il vulcano è pronto a provare, ma non sa come. Potete dargli coraggio a parole, come si fa con un amico, oppure allenarlo: fargli provare tante piccole eruzioni finché ne trova una che va bene.",
              ask: "Lo incoraggiamo e basta, o gli insegniamo un'eruzione tutta nuova?",
              hints: [
                "Le parole giuste bastano se il vulcano si fida di voi.",
                "Allenarlo è più lungo, ma alla fine ha una mossa sicura.",
                "Si può incoraggiare mentre si allena."
              ],
              rescue: "Il vulcano borbotta: «Contate voi. Al tre parto. Forse»."
            },
            choices: [
              {
                id: "incoraggiare",
                label: "💪 Gli diamo coraggio",
                reaction_title: "La ciurma fa il tifo per il vulcano",
                reaction: "Vi mettete in cerchio ai piedi del cono e cominciate a incoraggiarlo, ognuno con parole sue. Il vulcano si scalda — nel senso buono.",
                next: "incoraggiare"
              },
              {
                id: "allenare",
                label: "🎪 Gli insegniamo un'eruzione buffa",
                reaction_title: "La ciurma apre una palestra per vulcani",
                reaction: "Iniziate a proporre eruzioni assurde: di bolle, di coriandoli, di fischi. Il vulcano prova, sbaglia, riprova, e piano piano si diverte.",
                next: "allenare"
              }
            ]
          },
          {
            scene_id: "incoraggiare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il vulcano gonfia i fianchi, arriva quasi al momento... e si ferma. «E se scappano tutti? E se poi nessuno mi vuole più vicino?» Adesso serve qualcosa di più di un semplice «dai che ce la fai».",
              ask: "Cosa gli dite adesso, che lo convinca davvero che va bene ruggire?",
              hints: [
                "Che gli abitanti sono abituati e sanno che non è cattivo.",
                "Che voi restate lì anche mentre erutta.",
                "Che tenersi tutto dentro fa più male che buttarlo fuori.",
                "Che un vulcano che non ruggisce non è più un vulcano."
              ],
              rescue: "Un abitante del villaggio, in fondo, alza un cartello: «FORZA VULCANO».",
              masterTip: "Fai dire a due bambini la frase esatta che direbbero al vulcano in quel momento."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino misura il coraggio del vulcano",
                button: "Affidiamoci al Destino",
                group_result: "Le vostre parole arrivano dritte: il vulcano fa un respiro e si lascia andare.",
                dice_result: "Al vulcano trema ancora la voce: serve una prova di Coraggio di tutta la ciurma per stargli vicino mentre parte."
              },
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ IL RUGGITO PIÙ GENTILE DEL MONDO",
                text: "Il vulcano ruggisce: un boato caldo che fa vibrare i denti ma non fa paura, e sopra ci piovono petali di roccia leggera come neve. Il villaggio applaude.",
                audio: "win-event",
                next: "eco-della-nave"
              },
              fail_forward: {
                title: "🌋 UNO SBUFFO DI TROPPO",
                text: "Il vulcano parte prima del previsto e vi copre di cenere tiepida: Pericolo +1. Ma tossendo e ridendo notate una cosa: la cenere in aria prende sempre la stessa forma, quella di una nave.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "eco-della-nave"
              }
            }
          },
          {
            scene_id: "allenare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Il vulcano ha provato l'eruzione di bolle (troppo bagnata), quella di fischi (troppo acuta) e quella di coriandoli (bella, ma finiscono subito). Ne manca una che sia sua davvero.",
              ask: "Qual è l'eruzione perfetta per QUESTO vulcano? Fatela provare.",
              hints: [
                "Un boato che diventa una canzone verso la fine.",
                "Fumo colorato che disegna qualcosa nel cielo.",
                "Un rutto gigantesco e educatissimo, con tanto di «scusate».",
                "Sassolini caldi che rimbalzano come popcorn."
              ],
              rescue: "Il vulcano fa un piccolo «pff» timido e vi guarda: era giusto?",
              masterTip: "Fai scegliere ai bambini una delle eruzioni e mimatela insieme, suono compreso."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ L'ERUZIONE DELLA CASA",
                text: "Alla decima prova ci siete: il vulcano trova la sua eruzione, quella che lo fa sentire forte e non cattivo. La ripete tre volte solo per la gioia di farla.",
                audio: "win-event",
                next: "eco-della-nave"
              },
              fail_forward: {
                title: "🎇 PROVA GENERALE ANDATA STORTA",
                text: "L'eruzione di prova va per traverso e spegne tutte le torce del sentiero: Pericolo +1. Al buio, però, vedete che il fumo del vulcano brilla, e disegna una nave.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "eco-della-nave"
              }
            }
          },
          {
            scene_id: "eco-della-nave",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Adesso che il vulcano si fida, vi racconta una cosa. «Prima che mi venisse questa paura», dice, «è passata una nave. Silenziosa. E dopo che se n'è andata, il mio ruggito... non c'era più. Come se se lo fosse portato via nella stiva».",
              ask: "Cosa vuol dire, secondo voi, che una nave si porta via il rumore di una montagna?",
              hints: [
                "È la stessa nave delle ombre e delle altre cose sparite.",
                "Qualcuno raccoglie le cose che rendono speciali le isole.",
                "Il vulcano non ha perso il ruggito: si è solo dimenticato di come si fa."
              ],
              rescue: "Il vulcano fa un boato piano, quasi un sospiro, e per un attimo l'eco disegna una vela.",
              masterTip: "Chiedi: cosa collezionereste voi, se poteste mettere in un baule cose che non si comprano?"
            },
            interaction: "Nessun tiro: è il momento dell'indizio.",
            outcome: {
              title: "L'indizio del fumo",
              text: "Il vulcano soffia un ultimo anello di fumo. Resta appeso in aria più del normale, e ha la forma inconfondibile di una nave con le vele gonfie di suoni.",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il Vulcano Ruggente ruggisce di nuovo, ogni sera, alla sua ora. Il villaggio ci ha fatto l'abitudine e qualcuno ci mette persino la sveglia. Prima che andiate, il vulcano lascia rotolare fino ai vostri piedi un piccolo fischietto di ossidiana ancora caldo.",
              masterTip: "Chiudi con la domanda: quando sei molto forte, come fai a non usare male la tua forza?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Vulcano ha Paura",
          final_read: "Il vulcano ruggisce di nuovo, gentile e puntuale. Il Fischietto del Coraggio è caldo nella mano della ciurma.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    {
      id: "gara-giganti-minuscoli", island: "vulcano", order: 2,
      title: "La Gara dei Giganti Minuscoli", kind: "Competizione assurda",
      difficulty: 6, minutes: 50,
      readAloud: "La famiglia del piccolo gigante organizza le sue Olimpiadi: la corsa più lenta, il salto più basso, l'urlo silenzioso. Vince chi fa PEGGIO. C'è un solo problema: un concorrente sta barando, cioè... fa troppo bene le cose fatte male.",
      readKids: {
        facile: [
          "I giganti minuscoli fanno le gare al contrario.",
          "Vince chi corre più piano.",
          "Ma uno bara.",
          "Bara facendo troppo bene le cose fatte male."
        ],
        avanzato: [
          "I giganti minuscoli gareggiano a chi fa PEGGIO.",
          "Corsa lentissima, salto bassissimo, urlo silenziosissimo.",
          "Uno dei concorrenti però vince sempre, in ogni gara.",
          "Nessuno può essere così bravo a fare tutto male: sta imbrogliando."
        ]
      },
      goal: "Portare a termine le gare al contrario e decidere cosa fare di chi bara.",
      beats: [
        "Le gare assurde vanno provate davvero: è più difficile di quanto sembri.",
        "Il baro ha un trucco: qualcosa che gli sussurra come vincere.",
        "Il trucco è una medaglia che non viene dalle isole."
      ],
      choices: [
        { label: "Smascherare il baro davanti a tutti", stat: "astuzia", target: 6, result: "Trovate la prova e la mostrate alla giuria: il baro non può più negare." },
        { label: "Aiutarlo a confessare da solo", stat: "coraggio", target: 6, result: "Gli parlate in disparte finché non trova il coraggio di dirlo lui." }
      ],
      groupChallenge: "Inventate insieme una gara assurda nuova in cui barare è proprio impossibile: qual è la regola, come si vince, come si perde.",
      rewards: [
        { type: "loot", id: "medaglia-bel-gioco" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "giudice-gara-storta" },
        { type: "power", id: "mossa-rallentatore" }
      ],
      growth: "Chi propone il modo più giusto di trattare il baro segna 1 crescita Coraggio.",
      fail: "La gara finisce nel caos e la giuria vi squalifica per un giro: Pericolo +1, ma nella confusione recuperate la medaglia che bara.",
      escape: "Uscire dal campo gara camminando all'indietro il più lentamente possibile, così sembra che stiate ancora gareggiando: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "La giuria vi iscrive d'ufficio alla prima gara: la Corsa dei Cento Passi Lentissimi. Chi arriva ULTIMO vince. Al via, un concorrente — un gigante minuscolo con un cappello a punta — parte lentissimo, perfetto, come se qualcuno gli suggerisse ogni passo.",
              ask: "Come si corre una gara in cui bisogna arrivare ultimi, ma senza fermarsi del tutto (fermarsi è squalifica)?",
              hints: [
                "Fare passi microscopici, contandoli a voce.",
                "Muoversi come al rallentatore, un pezzo di corpo alla volta.",
                "Guardare chi ti sta davanti e stare sempre un pochino più indietro.",
                "Distrarsi apposta a guardare le nuvole."
              ],
              rescue: "Un giudice fischia: «Troppo veloci! Rallentare!» — e siete già i più lenti.",
              masterTip: "Fate provare ai bambini a fare tre passi nel modo più lento possibile, contandoli."
            },
            interaction: "Nessun tiro: si prova la gara più assurda.",
            outcome: {
              title: "Ultimi, ma non abbastanza",
              text: "Arrivate penultimi: bravi, ma il gigante col cappello a punta è arrivato ultimo di mezz'ora, senza il minimo sforzo. Troppo perfetto. La giuria non se ne accorge, ma voi sì.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Lo tenete d'occhio. A ogni gara vince, e ogni volta si tocca il cappello e china la testa come per ascoltare. Sotto il cappello c'è qualcosa che luccica. Potete smascherarlo davanti a tutti, o provare a parlargli in disparte.",
              ask: "Lo smascheriamo davanti alla giuria, o proviamo ad aiutarlo a dirlo da solo?",
              hints: [
                "Smascherarlo è rapido e giusto, ma lui ci farà una figura terribile.",
                "Aiutarlo a confessare è più lento, ma forse capisce davvero perché ha sbagliato.",
                "Forse bara perché ha una paura, non perché è cattivo."
              ],
              rescue: "Il gigante col cappello vi vede guardarlo, arrossisce e si tocca di nuovo il cappello."
            },
            choices: [
              {
                id: "smascherare",
                label: "🔎 Lo smascheriamo davanti a tutti",
                reaction_title: "La ciurma raccoglie le prove",
                reaction: "Cominciate a seguirlo da vicino, prendendo nota di ogni volta che si tocca il cappello. Vi serve una prova che la giuria non possa ignorare.",
                next: "smascherare"
              },
              {
                id: "confessare",
                label: "🤝 Lo aiutiamo a confessare",
                reaction_title: "La ciurma lo prende da parte",
                reaction: "Aspettate che sia solo, dietro le tribune, e vi sedete vicino a lui senza accusarlo di niente. «Bella la gara, eh?» dite. Lui non risponde subito.",
                next: "confessare"
              }
            ]
          },
          {
            scene_id: "smascherare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Durante l'Urlo Silenzioso (vince chi urla più piano), lo vedete benissimo: si toglie il cappello un secondo per grattarsi, e sotto c'è una medaglia appesa a un filo, che gli parla all'orecchio con una vocina metallica.",
              ask: "Come mostrate la medaglia alla giuria senza che lui la nasconda di nuovo prima?",
              hints: [
                "Chiedere una foto di gruppo proprio mentre lui non ha il cappello.",
                "Far cadere il cappello 'per sbaglio' davanti ai giudici.",
                "Registrare la vocina della medaglia e farla sentire a tutti.",
                "Chiedere alla giuria di controllare i cappelli di TUTTI, così non si offende nessuno."
              ],
              rescue: "Un giudice starnutisce e il cappello del gigante vola via da solo per mezzo secondo.",
              masterTip: "Fai scegliere ai bambini il modo di mostrare la prova e mimatelo."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ PROVA IN BELLA VISTA",
                text: "La medaglia finisce sotto il naso della giuria, che la sente sussurrare «vai più piano, ecco, così» e resta a bocca aperta. Il gigante col cappello si mette a piangere: «Non volevo, è che... vince sempre lei per me».",
                audio: "win-event",
                next: "medaglia-che-sussurra"
              },
              fail_forward: {
                title: "🎪 CACCIA AL CAPPELLO",
                text: "Provate a strappargli il cappello e finisce in una rincorsa comica per tutto il campo: la giuria vi squalifica per un giro, Pericolo +1. Ma nella corsa il cappello vola via e la medaglia resta in mano vostra.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "medaglia-che-sussurra"
              }
            }
          },
          {
            scene_id: "confessare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Seduto dietro le tribune, il gigante col cappello finalmente parla. «La mia famiglia vince sempre. Io no, mai, in niente. Poi ho trovato questa medaglia in mare e mi ha detto: adesso vinci tu. E vinco. Ma non è divertente per niente».",
              ask: "Cosa gli dite per aiutarlo a fare la cosa giusta, senza fargli sentire che è una persona cattiva?",
              hints: [
                "Che perdere davanti alla sua famiglia non lo rende meno importante.",
                "Che una vittoria che non ti sei guadagnato non riempie il vuoto.",
                "Che confessare adesso è più coraggioso di qualsiasi gara.",
                "Che potete stargli vicino mentre lo dice alla giuria."
              ],
              rescue: "Il gigante si toglie il cappello da solo e lo tiene in mano, guardandolo.",
              masterTip: "Fai dire a un bambino la frase con cui convincerebbe qualcuno a confessare un piccolo imbroglio."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino aspetta la sua decisione",
                button: "Affidiamoci al Destino",
                group_result: "Le vostre parole gli danno la spinta: si alza e va dritto dalla giuria a dire tutto.",
                dice_result: "All'ultimo si blocca: serve una prova di Coraggio della ciurma per accompagnarlo davanti a tutti."
              },
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LA CONFESSIONE PIÙ CORAGGIOSA",
                text: "Il gigante col cappello va davanti alla giuria, posa la medaglia sul tavolo e dice tutto. La sua famiglia, invece di arrabbiarsi, gli fa il tifo per la prima volta. Perde la gara e vince qualcos'altro.",
                audio: "win-event",
                next: "medaglia-che-sussurra"
              },
              fail_forward: {
                title: "😰 PAROLE CHE NON ESCONO",
                text: "Davanti alla giuria si impappina e scappa via, e voi lo rincorrete: caos totale, squalifica di un giro, Pericolo +1. Ma la medaglia gli cade e la raccogliete voi, prima di lui.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "medaglia-che-sussurra"
              }
            }
          },
          {
            scene_id: "medaglia-che-sussurra",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "La medaglia è nelle vostre mani. Non è d'oro: è di un metallo scuro che non avete mai visto sulle isole. Continua a sussurrare, ma adesso a voi: «Posso farti vincere. Basta che mi lasci salire a bordo. Come ho fatto con tutti gli altri».",
              ask: "Cosa risponde la ciurma a una medaglia che promette di farvi vincere sempre?",
              hints: [
                "Che vincere così non conta niente.",
                "Che «come ho fatto con tutti gli altri» vuol dire che gira di mano in mano lasciando solo tristezza.",
                "Che viene dalla nave che raccoglie le cose delle isole.",
                "Che la buttate in mare, o la tenete come prova."
              ],
              rescue: "La medaglia cambia voce e prova ad essere gentile: «Ma dai, solo una gara...».",
              masterTip: "Chiedi: è più importante vincere, o essere fieri di come hai giocato?"
            },
            interaction: "Nessun tiro: la ciurma risponde alla medaglia.",
            outcome: {
              title: "L'indizio della medaglia",
              text: "Qualunque cosa decidiate di farne, sul retro della medaglia c'è un'incisione minuscola: la stessa nave dalle vele piene, e sotto tre parole — «Presto sarai mia».",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Le Olimpiadi dei Giganti Minuscoli finiscono con una gara nuova, inventata da voi, in cui barare è impossibile. Vince chi ride di più mentre perde. Il gigante col cappello arriva primo, e stavolta se l'è guadagnato. Vi consegna una medaglia vera, di quelle che valgono perché te le danno gli amici.",
              masterTip: "Chiudi con la domanda: cosa conta di più, vincere o essere fieri di come si è giocato?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Gara dei Giganti Minuscoli",
          final_read: "Le gare al contrario tornano a essere divertenti e oneste. La Medaglia del Bel Gioco resta alla ciurma: quella vera.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    /* ---- FORTE DI CORALLO ------------------------------------------- */
    {
      id: "processo-alla-ciurma", island: "corallo", order: 1,
      title: "Il Processo alla Ciurma", kind: "Tribunale fantastico",
      difficulty: 6, minutes: 55,
      readAloud: "Le statue di corallo del forte ricordano tutto. Anche gli errori della ciurma. Un giorno smettono di sorridere, allungano un braccio di pietra e vi indicano una porta: «Tribunale del Corallo. La ciurma è convocata».",
      readKids: {
        facile: [
          "Le statue di corallo ricordano tutto.",
          "Anche gli sbagli della ciurma.",
          "Vi portano davanti a un tribunale.",
          "Dovete dire cosa avete imparato."
        ],
        avanzato: [
          "Le statue del Forte di Corallo hanno una memoria lunghissima.",
          "Si ricordano ogni scelta che avete fatto, comprese quelle sbagliate.",
          "Vi convocano davanti al Tribunale del Corallo.",
          "Non per punirvi: per sentire cosa quegli errori vi hanno insegnato."
        ]
      },
      goal: "Mostrare al tribunale cosa la ciurma ha imparato, e decidere come dovrebbe rimediare un altro personaggio che ha sbagliato.",
      beats: [
        "Il tribunale non vuole scuse: vuole capire cosa è cambiato in voi.",
        "Compare un testimone a sorpresa: qualcuno che la ciurma ha aiutato o deluso.",
        "Una statua ricorda una figura incappucciata di passaggio."
      ],
      choices: [
        { label: "Difendere una vecchia decisione", stat: "coraggio", target: 6, result: "Spiegate perché quella scelta, allora, aveva senso: il tribunale ascolta." },
        { label: "Ammettere che si poteva fare meglio", stat: "coraggio", target: 6, result: "Dite ad alta voce cosa rifareste in modo diverso: ci vuole coraggio, e il tribunale lo nota." }
      ],
      groupChallenge: "Il tribunale vi chiede di giudicare un altro: un pirata che ha rotto qualcosa di un amico e non l'ha detto. Decidete insieme cosa dovrebbe fare per rimediare (non per essere punito).",
      rewards: [
        { type: "loot", id: "sigillo-del-perdono" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "ciurma-assolta" },
        { type: "power", id: "seconda-possibilita" }
      ],
      growth: "Chi ammette per primo un proprio errore, davanti a tutti, segna 1 crescita Coraggio.",
      fail: "Vi impuntate e il tribunale sospende l'udienza: Pericolo +1, ma nell'aula vuota trovate l'archivio delle statue.",
      escape: "Chiedere un rinvio molto formale e uscire dalla porta laterale mentre le statue si consultano: prova di Astuzia 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "L'aula è fatta tutta di corallo. Tre statue enormi vi guardano dall'alto. La più vecchia parla con una voce che sembra il mare in una conchiglia: «Raccontateci un errore. Uno dei vostri. E cosa vi ha insegnato».",
              ask: "Quale errore della ciurma vi ha insegnato qualcosa? Sceglietene uno da raccontare.",
              hints: [
                "Una volta in cui avete deciso di corsa e vi è andata male.",
                "Una volta in cui non avete ascoltato qualcuno che aveva ragione.",
                "Una promessa che poi è stato difficile mantenere.",
                "Una volta in cui avete avuto paura e siete scappati."
              ],
              rescue: "Una statua si china appena e sussurra: «Anche noi, un tempo, abbiamo sbagliato. Le statue non nascono sagge».",
              masterTip: "Va bene qualsiasi episodio, anche inventato al momento dai bambini: conta che ci sia un 'e poi ho capito che...'."
            },
            interaction: "Nessun tiro: si racconta.",
            outcome: {
              title: "Le statue prendono nota",
              text: "Mentre parlate, sui muri di corallo si formano da sole delle parole, come appunti. Il tribunale annuisce piano. «Bene», dice la statua vecchia. «Adesso, come volete affrontare questo processo?»",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Potete difendere una decisione che avete preso e in cui credete ancora, spiegando bene perché. Oppure potete alzarvi e dire ad alta voce cosa, oggi, rifareste in modo diverso.",
              ask: "Difendiamo quello che abbiamo fatto, o ammettiamo che potevamo fare meglio?",
              hints: [
                "Difendere non è fare i testardi: è saper spiegare le proprie ragioni.",
                "Ammettere non è dire che siete stati cattivi: è dire cosa avete capito.",
                "Tutte e due le cose, insieme, sono possibili."
              ],
              rescue: "Una statua batte un dito di pietra sul bracciolo, paziente: non c'è fretta."
            },
            choices: [
              {
                id: "difendere",
                label: "🛡 Difendiamo la nostra scelta",
                reaction_title: "La ciurma prende la parola",
                reaction: "Vi alzate in piedi e cominciate a spiegare, con calma, perché allora quella decisione aveva senso, con quello che sapevate.",
                next: "difendere"
              },
              {
                id: "ammettere",
                label: "🙌 Ammettiamo che potevamo fare meglio",
                reaction_title: "La ciurma abbassa la guardia",
                reaction: "Uno alla volta, dite cosa oggi fareste diversamente. Nell'aula di corallo cala un silenzio che non è imbarazzo: è rispetto.",
                next: "ammettere"
              }
            ]
          },
          {
            scene_id: "difendere",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Mentre difendete la vostra decisione, si apre la porta in fondo. Entra un testimone a sorpresa: qualcuno che quella scelta ha toccato da vicino — un abitante, un animale, un'isola intera che ha una voce. Vuole dire la sua.",
              ask: "Come ascoltate un testimone che potrebbe non essere d'accordo con voi, senza interromperlo e senza offendervi?",
              hints: [
                "Lasciarlo parlare fino in fondo prima di rispondere.",
                "Ringraziarlo per essere venuto, anche se dice cose scomode.",
                "Trovare la parte vera in quello che dice.",
                "Chiedergli cosa avrebbe voluto che faceste."
              ],
              rescue: "Il testimone si ferma a metà, insicuro: forse ha bisogno che qualcuno gli dica «continua, ti ascoltiamo».",
              masterTip: "Interpreta tu il testimone con una lamentela ragionevole; guarda come i bambini reagiscono."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino pesa le vostre parole",
                button: "Affidiamoci al Destino",
                group_result: "Ascoltate il testimone davvero: le statue vedono che sapete difendervi senza chiudere le orecchie.",
                dice_result: "Il testimone si accalora e serve una prova di Coraggio per restare calmi e rispondergli con gentilezza."
              },
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ DIFESA CON LE ORECCHIE APERTE",
                text: "Il testimone finisce di parlare, voi rispondete senza scaldarvi, e alla fine vi stringete la mano. Le statue scrivono sul muro una parola sola: «ONESTI».",
                audio: "win-event",
                next: "figura-incappucciata"
              },
              fail_forward: {
                title: "⚖️ UDIENZA SOSPESA",
                text: "La discussione si accende, il tribunale batte il martelletto: udienza sospesa. Pericolo +1. Ma restati soli nell'aula, notate un archivio di corallo pieno di ricordi delle statue.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "figura-incappucciata"
              }
            }
          },
          {
            scene_id: "ammettere",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Ammettere gli errori a voce alta è più difficile di quanto sembri. A metà, uno di voi si blocca: le parole non vogliono uscire. Le statue aspettano, senza fretta e senza giudizio.",
              ask: "Come vi aiutate a dire una cosa vera che fa un po' vergognare?",
              hints: [
                "Dirla in due, così il peso è diviso.",
                "Cominciare da «la prossima volta io...» invece che da «ho sbagliato».",
                "Ricordarsi che il tribunale è lì per capire, non per punire.",
                "Prendere un bel respiro tutti insieme prima di parlare."
              ],
              rescue: "Una statua allunga un dito di corallo e appoggia la punta sulla spalla di chi si è bloccato: pesa come una mano vera.",
              masterTip: "Fai finire la frase «la prossima volta noi...» a tre bambini diversi."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 65, dice: 35 },
              destiny_screen: {
                title: "✦ Il Destino ascolta l'ammissione",
                button: "Affidiamoci al Destino",
                group_result: "Vi aiutate a vicenda e la frase esce, intera e sincera: le statue non chiedono altro.",
                dice_result: "Serve un ultimo scatto di Coraggio della ciurma per dirla davanti a tutti senza cambiarla."
              },
              dice: { stat: "coraggio", target: 5 }
            },
            outcomes: {
              success: {
                title: "✨ L'AMMISSIONE PIÙ CORAGGIOSA",
                text: "Lo dite. Tutto. Senza sconti e senza scuse inutili. Le statue si guardano tra loro e sul muro compare: «CRESCIUTI».",
                audio: "win-event",
                next: "figura-incappucciata"
              },
              fail_forward: {
                title: "🤐 PAROLE CHE RESTANO IN GOLA",
                text: "Non riuscite a dirlo tutto, e il tribunale rimanda a domani: Pericolo +1. Nell'attesa, però, una statua vi lascia sfogliare il suo archivio di ricordi.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "figura-incappucciata"
              }
            }
          },
          {
            scene_id: "figura-incappucciata",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Prima di emettere il verdetto, la statua più vecchia ricorda una cosa. «Poco tempo fa è passato di qui un giovane incappucciato. Non voleva rubare niente. Faceva solo domande strane: quali sono le cose più preziose che non si possono comprare con le monete? E prendeva appunti».",
              ask: "Cosa collezionava, secondo voi, quel viaggiatore incappucciato?",
              hints: [
                "Le stesse cose sparite dalle altre isole: ombre, storie, ruggiti.",
                "Cose che tengono insieme una ciurma: ricordi, risate, fiducia.",
                "È lo stesso della nave che avete già incrociato.",
                "Forse le raccoglieva perché a lui mancavano tutte."
              ],
              rescue: "Su un muro di corallo, da sola, si forma la sagoma di una nave con le vele piene di cose diverse.",
              masterTip: "Chiedi: qual è una cosa preziosissima che avete e che non si può comprare?"
            },
            interaction: "Nessun tiro: è il momento dell'indizio.",
            outcome: {
              title: "L'indizio del corallo",
              text: "La statua conclude: «Se n'è andato verso il mare aperto, su una nave dalle vele strane. E da allora, qui, qualcuno ricorda di aver dimenticato qualcosa». Sul muro resta incisa la nave.",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Il Tribunale del Corallo non vi condanna a niente. Vi consegna un Sigillo del Perdono e vi dice: «Portatelo a chi sbaglia. Serve a ricordare che dopo un errore si può sempre rimediare». Le statue tornano a sorridere.",
              masterTip: "Chiudi con la domanda: cosa conta di più dopo un errore, chiedere scusa o rimediare?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Processo alla Ciurma",
          final_read: "Il tribunale vi assolve e vi affida il Sigillo del Perdono. Le statue di corallo sorridono di nuovo.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    {
      id: "porta-dice-no", island: "corallo", order: 2,
      title: "La Porta che Dice Sempre No", kind: "Enigma comico",
      difficulty: 6, minutes: 50,
      readAloud: "In fondo al forte c'è una porta di legno con una faccia intagliata. A qualunque cosa proviate — spingere, bussare, chiedere gentilmente — risponde con voce annoiata: «No». Sempre e solo: «No».",
      readKids: {
        facile: [
          "C'è una porta con una faccia.",
          "Qualunque cosa chiedi, dice: «No».",
          "Sempre no.",
          "Bisogna capire cosa vuole davvero."
        ],
        avanzato: [
          "La porta in fondo al Forte di Corallo ha una bocca intagliata nel legno.",
          "Provate a spingerla: «No». A bussare: «No». A dire «per favore»: «No».",
          "Non è rotta e non è cattiva: dice no e basta.",
          "Deve esserci un motivo, e una domanda giusta per farla aprire."
        ]
      },
      goal: "Capire cosa vuole davvero la porta e attraversarla senza forzarla.",
      beats: [
        "Provare le idee normali non serve: la porta le rifiuta tutte.",
        "La porta dice no perché è stanca di gente che entra per prendere qualcosa.",
        "Dietro la porta c'è il simbolo della nave e una frase graffiata sul muro."
      ],
      choices: [
        { label: "Provare idee sempre più assurde", stat: "astuzia", target: 6, result: "A furia di proposte strampalate ne trovate una a cui la porta non sa dire no." },
        { label: "Chiederle perché dice sempre no", stat: "fortuna", target: 6, result: "Vi fermate ad ascoltarla e la porta, spiazzata, comincia a raccontare." }
      ],
      groupChallenge: "Inventate insieme tre domande a cui la risposta «no» in realtà è un «sì» (tipo: «Ti dà fastidio se ti lasciamo in pace?»).",
      rewards: [
        { type: "loot", id: "chiave-del-forse" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "passa-porte" },
        { type: "power", id: "domanda-che-apre" }
      ],
      growth: "Chi trova la domanda che fa aprire la porta segna 1 crescita Astuzia.",
      fail: "Insistete troppo e la porta si incastra del tutto: Pericolo +1, ma il legno si spacca in un punto e ci si vede attraverso.",
      escape: "Rinunciare alla porta e passare da una finestrella laterale che nessuno aveva notato: prova di Fortuna 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "La faccia sulla porta vi guarda con gli occhi socchiusi. «Lasciate che indovini», dice. «Volete entrare. La risposta è no». Sbadiglia, con un cigolio.",
              ask: "Cosa chiedereste a una porta che, qualunque cosa dite, risponde no?",
              hints: [
                "Chiederle se PREFERISCE restare chiusa.",
                "Chiederle cosa è successo l'ultima volta che qualcuno è entrato.",
                "Non chiederle di aprirsi, ma qualcosa a cui 'no' vi va bene.",
                "Chiederle se possiamo restare a farle compagnia."
              ],
              rescue: "La porta borbotta da sola: «Tutti che vogliono entrare. Nessuno che chiede come sto».",
              masterTip: "Fai provare ai bambini a fare una domanda a cui vorrebbero sentirsi rispondere di no."
            },
            interaction: "Nessun tiro: si parla con la porta.",
            outcome: {
              title: "La porta si insospettisce (in senso buono)",
              text: "Nessuno vi ha mai fatto tante domande senza spingere. La porta socchiude un occhio in più. «Uhm», dice. «Allora, cosa avete in mente di preciso?»",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Potete tempestarla di idee sempre più assurde, finché una la coglie di sorpresa. Oppure potete smettere di provare ad aprirla e chiederle, semplicemente, perché dice sempre no.",
              ask: "La bombardiamo di idee strampalate, o le chiediamo il motivo?",
              hints: [
                "Le idee assurde funzionano se siete abbastanza veloci e creativi.",
                "Chiederle il motivo è più lento, ma scoprite cos'ha davvero questa porta.",
                "Una porta che parla ha probabilmente qualcosa da raccontare."
              ],
              rescue: "La porta tamburella le dita di legno che non ha: «Allora? Non ho tutto il giorno. Anzi sì. Ma decidetevi»."
            },
            choices: [
              {
                id: "assurde",
                label: "🤪 Idee sempre più assurde",
                reaction_title: "La ciurma spara proposte a raffica",
                reaction: "Cominciate: «Ci apri se camminiamo all'indietro?» «E se ci presentiamo per finta come un armadio?» La porta risponde no, no, no — ma sempre più incerta.",
                next: "assurde"
              },
              {
                id: "perche",
                label: "❓ Le chiediamo perché dice no",
                reaction_title: "La ciurma si siede ad ascoltare",
                reaction: "Vi sedete sul pavimento di corallo, davanti alla porta, e chiedete piano: «Perché dici sempre no?» La faccia di legno resta zitta per un lungo momento.",
                next: "perche"
              }
            ]
          },
          {
            scene_id: "assurde",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La porta sta reggendo bene: ha detto no a ventisette proposte assurde di fila. Ma si vede che è stanca. Ne manca una, quella giusta: una richiesta a cui il suo «no» automatico si trasformi in un sì.",
              ask: "Qual è la domanda a cui la porta, dicendo «no», in realtà vi apre?",
              hints: [
                "«Ti dispiace se NON entriamo di corsa e stiamo attenti a tutto?»",
                "«Hai qualcosa in contrario a lasciarci passare piano piano?»",
                "«Ti secca se entriamo solo per guardare e non prendiamo niente?»",
                "«Preferisci restare chiusa per sempre?» (a cui il no è un sì)."
              ],
              rescue: "La porta socchiude la bocca per dire no e ci mette più del solito: la battuta giusta la sta quasi disarmando.",
              masterTip: "Fai formulare la domanda-trappola a due bambini; scegliete la più furba."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ NO CHE VUOL DIRE SÌ",
                text: "Fate la domanda giusta. La porta apre la bocca, dice «No» come sempre... e si accorge troppo tardi che stavolta «no» significava «prego, accomodatevi». Si spalanca, offesissima con sé stessa.",
                audio: "win-event",
                next: "dietro-la-porta"
              },
              fail_forward: {
                title: "🚪 PORTA INCASTRATA",
                text: "A furia di scuoterla con le parole, la porta si impunta e si incastra nel telaio: Pericolo +1. Ma nell'incastrarsi il legno si crepa, e dalla fessura vedete cosa c'è dall'altra parte.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "dietro-la-porta"
              }
            }
          },
          {
            scene_id: "perche",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La porta finalmente parla. «L'ultima volta che ho lasciato entrare qualcuno», dice piano, «è uscito portandosi via una cosa che non gli apparteneva. Da allora dico no. È più semplice». Adesso serve la cosa giusta da dirle.",
              ask: "Cosa dite a una porta che dice no perché ha paura che le rubino qualcosa?",
              hints: [
                "Che voi entrate solo per guardare, non per prendere.",
                "Che potete lasciarle una cosa vostra in pegno mentre siete dentro.",
                "Che le raccontate cosa c'è dentro quando uscite, così controlla.",
                "Che dire no a tutti per colpa di uno non è giusto neanche per lei."
              ],
              rescue: "La porta si commuove un pochino: dal legno esce una gocciolina di resina come una lacrima.",
              masterTip: "Fai dire a un bambino la promessa esatta che farebbe alla porta."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino ascolta la promessa",
                button: "Affidiamoci al Destino",
                group_result: "La porta vi crede: gira il chiavistello da sola, con un cigolio quasi contento.",
                dice_result: "La porta è ancora diffidente: serve una prova di Fortuna perché si fidi di voi."
              },
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LA PORTA SI FIDA",
                text: "«Va bene», dice la porta. «Ma se toccate qualcosa che non è vostro, lo saprò». E si apre, cigolando, per la prima volta da tanto tempo.",
                audio: "win-event",
                next: "dietro-la-porta"
              },
              fail_forward: {
                title: "🔒 UN GIRO A VUOTO",
                text: "La porta ci ripensa all'ultimo e resta chiusa: Pericolo +1. Ma vi lascia sbirciare da uno spiraglio: giusto abbastanza per leggere cosa c'è scritto sul muro dietro.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "dietro-la-porta"
              }
            }
          },
          {
            scene_id: "dietro-la-porta",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Dietro la porta c'è una stanza vuota. Non un tesoro, non una trappola: vuota. Su una parete, però, qualcuno ha graffiato di recente un disegno — una nave con le vele piene — e sotto una frase: «QUI NON C'ERA NULLA DA PRENDERE».",
              ask: "Perché qualcuno è entrato in una stanza vuota e ha lasciato quel messaggio?",
              hints: [
                "È lo stesso viaggiatore incappucciato che cerca cose speciali.",
                "Era deluso: sperava di trovare qui una di quelle cose.",
                "Voleva avvertire chi arriva dopo che qui non c'è niente.",
                "La porta diceva no anche a lui: e lui è entrato lo stesso."
              ],
              rescue: "La porta, alle vostre spalle, mormora: «Ecco. Lui non ha chiesto. È entrato e basta»."
            },
            interaction: "Nessun tiro: si legge il messaggio.",
            outcome: {
              title: "L'indizio sulla parete",
              text: "Passate un dito sui graffi: sono freschi. La nave disegnata è la stessa delle altre isole. Qualcuno la sta cercando anche lui — o ci è già stato sopra.",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "Uscite dalla stanza senza aver preso niente, e la porta lo nota. «Grazie», dice, quasi controvoglia. E vi lascia andare con un piccolo dono: una chiave che non apre niente di preciso, ma funziona con qualsiasi porta a cui saprete fare la domanda giusta.",
              masterTip: "Chiudi con la domanda: quando qualcuno dice no, cosa possiamo fare invece di insistere?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Porta che Dice Sempre No",
          final_read: "La porta impara a dire anche sì, alle persone giuste. La Chiave del Forse resta alla ciurma.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    /* ---- MANGROVIE SUSSURRANTI ------------------------------------- */
    {
      id: "villaggio-senza-nomi", island: "palude", order: 1,
      title: "Il Villaggio che ha Dimenticato i Nomi", kind: "Mistero linguistico",
      difficulty: 6, minutes: 55,
      readAloud: "Nel villaggio delle mangrovie tutti sanno chi sono, ma nessuno ricorda come si chiama. «Io sono... quello che fa il pane», dice il fornaio. Anche gli oggetti hanno perso il nome: la forchetta è «la cosa a punte», il mare è «il grande bagnato».",
      readKids: {
        facile: [
          "Nel villaggio nessuno ricorda il proprio nome.",
          "Neanche le cose hanno più un nome.",
          "La forchetta è «la cosa a punte».",
          "Bisogna ritrovare i nomi."
        ],
        avanzato: [
          "Gli abitanti del villaggio ricordano tutto di sé: cosa fanno, chi amano, cosa sanno cucinare.",
          "Solo il nome, no. Quello è sparito.",
          "E anche gli oggetti l'hanno perso: la forchetta è «la cosa a punte».",
          "«Buongiorno», si salutano, «tu... come-ti-chiami». Vogliono indietro i loro nomi."
        ]
      },
      goal: "Restituire i nomi al villaggio e trovare chi li ha raccolti.",
      beats: [
        "Senza nomi il villaggio funziona male: gli ordini si confondono, gli amici si perdono di vista.",
        "Le parole-nome scappano ancora, come pesciolini: si può seguirle.",
        "I nomi rubati sono chiusi in bottiglie col simbolo della nave."
      ],
      choices: [
        { label: "Inventare nomi temporanei per tutti", stat: "astuzia", target: 6, result: "Trovate nomi provvisori così buffi e azzeccati che il villaggio ricomincia a funzionare." },
        { label: "Seguire le parole-nome che scappano", stat: "fortuna", target: 6, result: "Inseguite le parole scivolose fin dove qualcuno le sta raccogliendo." }
      ],
      groupChallenge: "Ogni pirata inventa un nome nuovo per un oggetto comune (una scopa, un cucchiaio, una benda) e uno per sé come pirata. Il villaggio vota il preferito.",
      rewards: [
        { type: "loot", id: "taccuino-dei-nomi" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "ridai-i-nomi" },
        { type: "power", id: "nome-giusto" }
      ],
      growth: "Chi inventa il nome che il villaggio sceglie come preferito segna 1 crescita Astuzia.",
      fail: "Un nome sbagliato fa arrabbiare un abitante permaloso: Pericolo +1, ma seguendolo mentre borbotta arrivate alla riva delle bottiglie.",
      escape: "Farsi dare un nome falso dagli abitanti e uscire dal villaggio fingendo di essere «quelli che sanno la strada»: prova di Astuzia 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Al mercato è il caos gentile: «Dammi due di quelli!» «Quelli quali?» «Quelli lì, i tondi gialli che fanno crunch!» Nessuno riesce a dire «mele», perché la parola «mela» è volata via stamattina.",
              ask: "Come chiamereste una forchetta, se la parola «forchetta» non esistesse più?",
              hints: [
                "Descrivendo cosa fa: «l'infilza-bocconi».",
                "Con un suono che ricorda l'oggetto.",
                "Con un nome buffo e facile da ricordare.",
                "Con il nome di chi la usa di più."
              ],
              rescue: "Un bambino del villaggio vi porge un cucchiaio e vi guarda speranzoso: «Tu sai come si chiama?»",
              masterTip: "Fai battezzare a ogni bambino un oggetto della classe con un nome inventato: vince il più chiaro."
            },
            interaction: "Nessun tiro: si inventano nomi.",
            outcome: {
              title: "Il mercato ricomincia a girare",
              text: "Con i vostri nomi provvisori, il mercato riprende: «Due infilza-bocconi e un pane-morbido!» Funziona. Ma è una toppa, non una soluzione. I nomi veri sono da qualche parte.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Potete restare e dare al villaggio un set completo di nomi nuovi, così ricomincia a vivere. Oppure potete inseguire le parole-nome che ancora scappano: guizzano tra le radici come pesci d'argento.",
              ask: "Restiamo a inventare i nomi, o inseguiamo quelli veri che scappano?",
              hints: [
                "I nomi nuovi risolvono adesso, ma i nomi veri hanno i ricordi attaccati.",
                "Le parole scappano verso il mare: chi le sta chiamando è da quella parte.",
                "Si può fare in due gruppi."
              ],
              rescue: "Una parola-nome vi passa tra i piedi, si ferma un attimo a guardarvi, e riparte."
            },
            choices: [
              {
                id: "inventare",
                label: "✏️ Diamo al villaggio nomi nuovi",
                reaction_title: "La ciurma apre un ufficio dei nomi",
                reaction: "Mettete un banchetto in piazza e cominciate a battezzare tutto e tutti. Si forma la fila. Ognuno vuole un nome che gli assomigli.",
                next: "inventare"
              },
              {
                id: "inseguire",
                label: "🏃 Inseguiamo le parole che scappano",
                reaction_title: "La ciurma parte a caccia di parole",
                reaction: "Vi lanciate dietro alle parole-nome tra le radici delle mangrovie. Sono veloci e scivolose, e vanno tutte nella stessa direzione: verso la riva.",
                next: "inseguire"
              }
            ]
          },
          {
            scene_id: "inventare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La fila è lunga. Ognuno ha una richiesta: «Un nome che faccia ridere», «Un nome serio, sono un capo», «Un nome uguale a quello di mia sorella, così non lo scordo». Serve dare a tutti un nome giusto, non a caso.",
              ask: "Come si trova il nome giusto per una persona che non ricordi come si chiama?",
              hints: [
                "Chiedendole tre cose che le piacciono e costruendo il nome da lì.",
                "Guardando cosa fa meglio di tutti.",
                "Ascoltando come la chiamano gli amici quando non ci pensano.",
                "Facendole scegliere tra due nomi che le proponete."
              ],
              rescue: "Il fornaio si illumina: «Chiamatemi come l'odore del pane appena sfornato!»",
              masterTip: "Assegna un 'abitante' a tre bambini e falli trovare il nome adatto in un minuto."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ IL VILLAGGIO HA DI NUOVO I NOMI",
                text: "A sera ogni abitante e ogni oggetto ha un nome. Non quelli di prima — ma nomi scelti bene, che raccontano qualcosa. Il villaggio se li ripete a voce alta per non scordarli più.",
                audio: "win-event",
                next: "riva-delle-bottiglie"
              },
              fail_forward: {
                title: "🏷️ NOME SBAGLIATO",
                text: "Date a un abitante permaloso un nome che non gli piace e se ne va offesissimo: Pericolo +1. Ma lo seguite mentre borbotta, e vi porta dritti alla riva dove qualcuno raccoglie i nomi.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "riva-delle-bottiglie"
              }
            }
          },
          {
            scene_id: "inseguire",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Le parole-nome vi portano fino a una riva nascosta tra le mangrovie. Lì, decine di bottiglie galleggiano legate a una corda. Dentro ogni bottiglia, una parola che si agita: sono i nomi del villaggio.",
              ask: "Come recuperate le bottiglie senza far scappare di nuovo i nomi e senza cadere nel fango?",
              hints: [
                "Tirare piano la corda tutti insieme, senza strappi.",
                "Passarsi le bottiglie in catena, di mano in mano.",
                "Tappare bene ogni bottiglia appena la prendete.",
                "Uno tiene la corda, gli altri raccolgono."
              ],
              rescue: "Una bottiglia si stappa da sola e la parola «nonna» vola via: la riprendete al volo per un pelo.",
              masterTip: "Fate mimare la catena umana per passarsi le bottiglie."
            },
            resolution: {
              policy: "dice",
              dice: { stat: "fortuna", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ NOMI IN SALVO",
                text: "Bottiglia dopo bottiglia, tirate su tutti i nomi. Sono lì che frizzano, impazienti di tornare a casa. Sulla corda che li teneva c'è un'etichetta con un disegno.",
                audio: "win-event",
                next: "riva-delle-bottiglie"
              },
              fail_forward: {
                title: "🌊 BOTTIGLIE ALLA DERIVA",
                text: "La corda si spezza e metà bottiglie partono con la corrente: Pericolo +1. Le rincorrete lungo la riva e, recuperandole, leggete cosa c'è scritto sull'etichetta della corda.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "riva-delle-bottiglie"
              }
            }
          },
          {
            scene_id: "riva-delle-bottiglie",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Sull'etichetta della corda, o sul fondo di una bottiglia, c'è sempre lo stesso segno: una nave con le vele piene di parole. E una nota, scritta piccola: «I nomi sono la prima cosa che una ciurma si scambia. Ne raccolgo tanti. Poi capirò quale mettermi».",
              ask: "Perché qualcuno raccoglie i nomi di un intero villaggio?",
              hints: [
                "È lo stesso della nave: raccoglie le cose che rendono speciale stare insieme.",
                "Forse non ha un nome suo, o non gli piace.",
                "Un nome dato dagli altri vuol dire che qualcuno ti ha scelto.",
                "Sta cercando di costruirsi un posto dove sentirsi qualcuno."
              ],
              rescue: "Una parola-nome nella bottiglia si mette a brillare quando le passate accanto la Stella della Ciurma."
            },
            interaction: "Nessun tiro: è il momento dell'indizio.",
            outcome: {
              title: "L'indizio nella bottiglia",
              text: "Rimettete le bottiglie nella corrente giusta, verso il villaggio. Ma tenete l'etichetta: la nave disegnata sopra è la stessa che avete già incrociato. Qualcuno colleziona nomi come voi collezionate ricordi.",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "I nomi tornano al villaggio come un'onda. «Marisol!» «Beto!» «Nonna Quila!» Ci sono abbracci e qualche pianto. Vi regalano un taccuino di corteccia: ci si scrive il nome di qualcosa che l'ha perso, e per un giorno quel nome torna vero.",
              masterTip: "Chiudi con la domanda: se potessi sceglierti un nome nuovo da pirata, quale sarebbe e perché?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "Il Villaggio che ha Dimenticato i Nomi",
          final_read: "Il villaggio si riprende i suoi nomi. Il Taccuino dei Nomi resta alla ciurma.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    },

    {
      id: "bestia-nessuno-ha-visto", island: "palude", order: 2,
      title: "La Bestia che Nessuno ha Visto", kind: "Creazione collettiva",
      difficulty: 7, minutes: 55,
      readAloud: "Il villaggio ha una paura enorme di una bestia. Nessuno l'ha mai vista, ma tutti la descrivono — e ognuno in modo diverso. E la cosa strana è che, più la descrivono, più le impronte nel fango diventano vere.",
      readKids: {
        facile: [
          "Tutti hanno paura di una bestia.",
          "Nessuno l'ha vista davvero.",
          "Ognuno la descrive in modo diverso.",
          "E più ne parlano, più diventa vera."
        ],
        avanzato: [
          "Nel villaggio si parla solo della Bestia.",
          "Uno dice che ha sei zampe, un altro che vola, un altro che è fatta di fango.",
          "Nessuno l'ha vista: la conoscono solo per sentito dire.",
          "Ma nel fango sono comparse impronte, e ogni giorno assomigliano di più a quello che la gente racconta."
        ]
      },
      goal: "Capire cosa sia davvero la bestia e impedire che la paura la renda sempre più spaventosa.",
      beats: [
        "Ogni descrizione della bestia è diversa e le sta dando forma.",
        "Se la ciurma sceglie insieme com'è la bestia, quella forma diventa quella definitiva.",
        "La bestia è comparsa nei sogni degli abitanti dopo il passaggio della nave."
      ],
      choices: [
        { label: "Raccogliere tutte le descrizioni", stat: "astuzia", target: 6, result: "Mettete insieme i racconti e vi accorgete che non combaciano: la bestia è fatta di paura, non di carne." },
        { label: "Inventarle una versione meno paurosa", stat: "coraggio", target: 6, result: "Raccontate voi com'è la bestia — buffa, non terribile — e la voce si sparge prima dell'altra." }
      ],
      groupChallenge: "Inventate insieme la Bestia definitiva: quante zampe, che rumore fa, la cosa più buffa che ha, e di cosa ha paura LEI.",
      rewards: [
        { type: "loot", id: "lente-della-calma" },
        { type: "coins", amount: 250000 },
        { type: "trophy", id: "domatore-di-paure" },
        { type: "power", id: "guarda-meglio" }
      ],
      growth: "Chi propone la caratteristica buffa che entra nella Bestia definitiva segna 1 crescita Coraggio.",
      fail: "Una descrizione spaventosa prende il sopravvento e la bestia diventa enorme per un attimo: Pericolo +1, ma nella corsa vedete che è fatta di fango e foglie.",
      escape: "Camminare all'indietro raccontando ad alta voce una versione ridicola della bestia, così le impronte davanti a voi si fanno buffe: prova di Coraggio 6.",

      storyFlow: {
        start: "arrivo",
        progression: [
          {
            scene_id: "arrivo",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Vi mostrano un'impronta nel fango. È grande, ma i bordi cambiano mentre la guardate: adesso ha artigli, adesso è tonda, adesso ci spunta un sesto dito. Cambia a seconda di chi la sta guardando e a cosa sta pensando.",
              ask: "Se doveste immaginare questa bestia, come sarebbe? Ognuno dica una cosa.",
              hints: [
                "Quante zampe? Di che colore?",
                "Fa un rumore? Quale?",
                "Ha qualcosa di buffo?",
                "È grande come una casa o come un gatto?"
              ],
              rescue: "L'impronta, sentendovi parlare senza urlare, per un secondo diventa una zampetta piccola e goffa.",
              masterTip: "Raccogli 4-5 dettagli dai bambini senza scartarne nessuno: sono il materiale della bestia."
            },
            interaction: "Nessun tiro: si immagina la bestia.",
            outcome: {
              title: "L'impronta ascolta",
              text: "Ogni cosa che dite, l'impronta la prova: cresce, si restringe, mette e toglie corna. Capite una cosa importante: questa bestia non esiste ancora davvero. La state facendo voi, con le parole.",
              audio: "click",
              next: "bivio"
            }
          },
          {
            scene_id: "bivio",
            phase_flow: ["SCENE", "DECISION", "RESOLUTION"],
            scene: {
              read: "Potete girare il villaggio e raccogliere tutte le descrizioni della bestia, per capire cosa c'è davvero sotto. Oppure potete mettervi voi a raccontare una versione della bestia — buffa, gentile — e farla girare prima che vinca quella spaventosa.",
              ask: "Raccogliamo le descrizioni degli altri, o ne inventiamo una nostra più tranquilla?",
              hints: [
                "Raccogliere aiuta a capire; ma intanto la paura corre.",
                "Inventare una versione buffa è veloce, ma va raccontata bene per convincere.",
                "Si può raccogliere le descrizioni e poi montarle in una versione simpatica."
              ],
              rescue: "Un vecchio del villaggio si avvicina: «Io la bestia me la sogno ogni notte. Volete che ve la racconti?»"
            },
            choices: [
              {
                id: "raccogliere",
                label: "🗒 Raccogliamo tutte le descrizioni",
                reaction_title: "La ciurma fa il giro delle voci",
                reaction: "Andate porta a porta a chiedere: «Com'è la bestia, secondo te?» Nessuna risposta è uguale a un'altra. Riempite un foglio di zampe, corna, rumori.",
                next: "raccogliere"
              },
              {
                id: "inventare",
                label: "🎭 Inventiamo noi una versione buffa",
                reaction_title: "La ciurma racconta la sua bestia",
                reaction: "Vi mettete al centro della piazza e cominciate: «La bestia? Ah, quella. Ha sei zampe ma con sei scarpe diverse, e starnutisce ogni volta che qualcuno ride». La gente si ferma ad ascoltare.",
                next: "inventare"
              }
            ]
          },
          {
            scene_id: "raccogliere",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "Avete venti descrizioni e nessuna combacia. Chi dice che vola, chi che scava. Chi dice grande come una nave, chi come una scarpa. Adesso dovete mostrare al villaggio cosa vuol dire questo: che la bestia è fatta di paura, non di verità.",
              ask: "Come spiegate a un villaggio spaventato che la loro bestia non ha una forma vera?",
              hints: [
                "Mettendo tutte le descrizioni una accanto all'altra, così vedono che si contraddicono.",
                "Chiedendo a due persone di disegnarla insieme e ridere di quanto vengono diverse.",
                "Facendo notare che nessuno l'ha vista, solo sentita nominare.",
                "Raccontando una volta in cui anche voi avevate paura di una cosa che poi non esisteva."
              ],
              rescue: "Due abitanti disegnano la bestia sullo stesso foglio e vengono fuori due mostri opposti: ridono, nonostante tutto.",
              masterTip: "Fai elencare ai bambini tre descrizioni che si contraddicono a vicenda."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 55, dice: 45 },
              destiny_screen: {
                title: "✦ Il Destino soffia sulla paura",
                button: "Affidiamoci al Destino",
                group_result: "Il villaggio guarda le venti descrizioni tutte insieme e comincia a ridere: la paura si sgonfia.",
                dice_result: "Un abitante non si convince e alza la voce: serve una prova di Astuzia per tenere il ragionamento chiaro davanti a tutti."
              },
              dice: { stat: "astuzia", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LA BESTIA SI SGONFIA",
                text: "Vedendo le sue mille forme contraddittorie appese al muro, il villaggio capisce. Le impronte nel fango si fanno piccole, poi buffe, poi sono solo quelle di un animaletto spaventato quanto loro.",
                audio: "win-event",
                next: "sogno-della-nave"
              },
              fail_forward: {
                title: "🐾 UN ULTIMO SPAVENTO",
                text: "Una descrizione particolarmente terribile prende piede e per un attimo la bestia si fa gigantesca: Pericolo +1. Ma correndo le passate accanto e la vedete bene: è tutta fango e foglie appiccicate.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "sogno-della-nave"
              }
            }
          },
          {
            scene_id: "inventare",
            phase_flow: ["SCENE", "RESOLUTION", "OUTCOME"],
            scene: {
              read: "La vostra bestia buffa sta piacendo. Ma quella spaventosa è ancora in giro, e ogni tanto qualcuno la nomina e le impronte si fanno di nuovo grosse. Dovete far vincere la vostra versione, quella che si può guardare senza tremare.",
              ask: "Come rendete la vostra bestia buffa più forte di quella spaventosa, nella testa della gente?",
              hints: [
                "Darle un nome tenero, così è difficile averne paura.",
                "Farla comparire in una storia dove aiuta qualcuno.",
                "Far ripetere ai bambini del villaggio la descrizione buffa, come una filastrocca.",
                "Dire di cosa ha paura LEI, così sembra meno terribile."
              ],
              rescue: "Un bambino del villaggio ripete a memoria la vostra descrizione buffa, con le zampe e lo starnuto: gli altri ridono.",
              masterTip: "Fai inventare ai bambini il nome tenero della bestia e la sua paura."
            },
            resolution: {
              policy: "destiny_group_or_dice",
              destiny: { group: 60, dice: 40 },
              destiny_screen: {
                title: "✦ Il Destino sceglie quale bestia resta",
                button: "Affidiamoci al Destino",
                group_result: "La vostra versione buffa si sparge come una canzone: la bestia diventa quella, e nessuno ha più paura.",
                dice_result: "La vecchia paura resiste: serve un'ultima prova di Coraggio per raccontare la vostra bestia forte e chiara davanti a tutti."
              },
              dice: { stat: "coraggio", target: 6 }
            },
            outcomes: {
              success: {
                title: "✨ LA BESTIA BUFFA HA VINTO",
                text: "Il villaggio adotta la vostra versione. La bestia adesso ha un nome tenero, sei scarpe spaiate e lo starnuto da ridere. Quando compare per davvero, è esattamente così — e tutti le vogliono bene.",
                audio: "win-event",
                next: "sogno-della-nave"
              },
              fail_forward: {
                title: "😱 LA PAURA RIALZA LA TESTA",
                text: "Per un attimo la versione spaventosa torna gigante e vi fa correre tutti: Pericolo +1. Ma nella fuga la sfiorate e sentite che è morbida, fatta di fango e paura, niente di più.",
                effects: ["Pericolo +1"],
                audio: "fallimento",
                next: "sogno-della-nave"
              }
            }
          },
          {
            scene_id: "sogno-della-nave",
            phase_flow: ["SCENE", "OUTCOME"],
            scene: {
              read: "Il vecchio che sogna la bestia ogni notte vi racconta una cosa. «Ha cominciato dopo che è passata una nave. Silenziosa. Da quella notte tutti sognano la stessa ombra che chiede: di cosa avete paura? E la mattina, nel fango, ci sono le impronte».",
              ask: "Cosa c'entra la nave con una bestia fatta di paura?",
              hints: [
                "La nave raccoglie cose delle isole: forse anche i sogni, o le paure.",
                "Chi è sulla nave vuole sapere cosa spaventa la gente.",
                "Forse la 'bestia' è quello che resta quando qualcuno ti porta via il coraggio.",
                "È lo stesso che ha preso le ombre, i nomi, il ruggito del vulcano."
              ],
              rescue: "Nel fango, un'impronta si forma da sola e ha la forma di una prua."
            },
            interaction: "Nessun tiro: è il momento dell'indizio.",
            outcome: {
              title: "L'indizio nel fango",
              text: "Guardate a lungo l'ultima impronta. Non è di una zampa: è di una chiglia. La nave è passata di qui, ha chiesto a tutti di cosa avevano paura, e ha lasciato che quella paura camminasse da sola.",
              audio: "star",
              next: "finale"
            }
          },
          {
            scene_id: "finale",
            phase_flow: ["SCENE", "REWARDS"],
            scene: {
              read: "La bestia, adesso che ha una forma sola e un nome gentile, si fa vedere davvero: è piccola, impacciata, e ha più paura lei di voi. Il villaggio le porta da mangiare. Un abitante vi regala una lente di vetro liscio: chi ci guarda attraverso vede le cose spaventose come sono, senza la paura addosso.",
              masterTip: "Chiudi con la domanda: una cosa fa meno paura quando la conosci?"
            },
            completion: {
              action_label: "🏴‍☠️ Concludi l'avventura"
            }
          }
        ],
        reward_screen: {
          headline: "🏴‍☠️ AVVENTURA COMPLETATA!",
          subtitle: "La Bestia che Nessuno ha Visto",
          final_read: "La Bestia diventa piccola, buffa e amica del villaggio. La Lente della Calma resta alla ciurma.",
          close_button: "⛵ Torna alla rotta"
        }
      }
    }

  ]
});
