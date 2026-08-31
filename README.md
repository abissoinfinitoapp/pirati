# Pirati: Isole del Teschio d'Oro

Gioco di ruolo da **Master** per bambini (6-10 anni): l'adulto guida, la ciurma
tira dadi fisici. Mappa dell'arcipelago, navigazione a dadi, incontri, avventure
da leggere, carte (poteri, leggendarie, oggetti), boss. Un gioco spalla di Abisso.

Nessun database per il gioco: la campagna vive nel `localStorage` del browser,
con esportazione/importazione JSON dal Diario.

## File

| | |
|---|---|
| `index.html` | **home pubblica + login** |
| `gioco.html` | il gioco (protetto dal login) |
| `config.js` | **configurazione** (immagini, Supabase) — vedi sotto |
| `auth.js` | login con Supabase Auth (lato browser) |
| `app.js`, `styles.css` | logica e stile del gioco |
| `engine/pirati-core.js` | motore contenuti modulare (nessun contenuto di gioco) |
| `content/pack-*.js` | le avventure. Guida: `content/_COME-SCRIVERE-UNA-QUEST.md` |
| `catalog/*.js` | premi, poteri, contendenti, eventi, parole del Pesce Crostone |
| `assets/` | immagini (WebP) |
| `vendor/` | gsap, supabase-js |

## Sviluppo in locale

```bash
node dev-server.js      # -> http://localhost:4173
```
(aprire i file da `file://` non carica i moduli)

## Configurazione — `config.js`

```js
window.PIRATI_CONFIG = {
  // Immagini: "assets" (locali) oppure un URL R2/CDN senza slash finale
  assetBase: "assets",

  // Login. Vuoti = login disattivato (chiunque entra).
  supabaseUrl: "https://XXXX.supabase.co",
  supabaseAnonKey: "sb_publishable_...",

  // Solo queste email possono entrare. Vuoto = chiunque abbia un account.
  allowedEmails: ["dipaolo1974@gmail.com"]
};
```

## Deploy (Vercel)

Sito statico, nessun build. `git push` → Vercel deploya. `vercel.json` gestisce
cache immagini, header e clean URL. `.vercelignore` tiene fuori i file di sviluppo.

## Strumenti (non pubblicati)

- `comprimi-immagini.mjs` — PNG → WebP (`node comprimi-immagini.mjs`, poi `--pulisci`)
- `tools/affetta-atlante.html` — taglia l'atlante nei 12 ritratti singoli
