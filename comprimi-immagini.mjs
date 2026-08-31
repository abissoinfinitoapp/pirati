/* =============================================================================
   Comprimi le immagini del gioco: PNG -> WebP, ridimensionate.
   -----------------------------------------------------------------------------
   Uso:
     node comprimi-immagini.mjs           crea i .webp accanto ai .png
     node comprimi-immagini.mjs --pulisci elimina i .png originali (dopo aver
                                          verificato che il gioco funzioni)

   Alla prima esecuzione installa "sharp" (serve solo per comprimere, non viene
   pubblicato). Non tocca assets/maps/ (sorgenti della mappa).
   ========================================================================== */

import { existsSync, readdirSync, statSync, renameSync, mkdirSync } from "node:fs";
import { join, extname, basename, relative } from "node:path";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ASSETS = join(ROOT, "assets");

const FOLDERS = ["carte", "contendenti", "personaggi", "oggetti", "ciurma"];
const LOOSE = ["pirati-character-atlas.png"];

const MAX_WIDTH = 1200;   // le carte si vedono molto più piccole; ok anche per la stampa casalinga
const QUALITY = 84;
const clean = process.argv.includes("--pulisci");

/* --- sharp: installalo se manca ---------------------------------------- */
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.log("Installo 'sharp' (una volta sola)…\n");
  execSync("npm install sharp", { cwd: ROOT, stdio: "inherit" });
  sharp = require("sharp");
}

const kb = (n) => (n / 1024).toFixed(0) + " KB";
let totIn = 0, totOut = 0, count = 0;

async function convert(pngPath) {
  const webpPath = pngPath.slice(0, -4) + ".webp";
  const before = statSync(pngPath).size;
  await sharp(pngPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(webpPath);
  const after = statSync(webpPath).size;
  totIn += before; totOut += after; count++;
  console.log(`  ${basename(pngPath).padEnd(34)} ${kb(before).padStart(9)} -> ${kb(after).padStart(9)}`);
  if (clean) {
    const dest = join(ROOT, "_png-originali", relative(ASSETS, pngPath));
    mkdirSync(join(dest, ".."), { recursive: true });
    renameSync(pngPath, dest);
  }
}

async function run() {
  const targets = [];
  for (const folder of FOLDERS) {
    const dir = join(ASSETS, folder);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (extname(f).toLowerCase() === ".png") targets.push(join(dir, f));
    }
  }
  for (const name of LOOSE) {
    const p = join(ASSETS, name);
    if (existsSync(p)) targets.push(p);
  }

  if (!targets.length) { console.log("Nessun .png da comprimere."); return; }

  console.log(`${clean ? "PULIZIA — " : ""}Comprimo ${targets.length} immagini in WebP (max ${MAX_WIDTH}px, qualità ${QUALITY})\n`);
  let lastDir = "";
  for (const p of targets) {
    const d = p.split(/[\\/]/).slice(-2, -1)[0];
    if (d !== lastDir) { console.log(`\n[${d}]`); lastDir = d; }
    await convert(p);
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`${count} immagini: ${(totIn / 1048576).toFixed(1)} MB -> ${(totOut / 1048576).toFixed(1)} MB  (${(100 - totOut / totIn * 100).toFixed(0)}% in meno)`);
  if (!clean) {
    console.log(`\nI .png originali sono ancora lì. Prova il gioco, poi:`);
    console.log(`  node comprimi-immagini.mjs --pulisci`);
  } else {
    console.log(`\nI .png originali sono stati spostati in _png-originali/ (fuori da assets/).`);
    console.log(`Puoi cancellare quella cartella quando sei sicuro, o tenerla come backup.`);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
