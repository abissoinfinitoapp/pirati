/* =============================================================================
   Ritaglia le 40 armi speciali dalle due tavole sorgente (armi-new-1/2.webp)
   in assets/fortress/weapons/<id>.webp — stesso identico metodo usato per le
   100 armi esistenti (vedi commit e32512a): griglia 5 colonne x 4 righe,
   confini di cella Math.round(i*dim/n), crop puro (nessuna modifica
   artistica), ordine riga per riga da sinistra a destra come le tavole.
   Le tavole originali restano in assets/fortress-img/, invariate.
   Uso: node scripts/crop-armi-new.mjs
   ========================================================================= */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT_DIR = "assets/fortress/weapons";
mkdirSync(OUT_DIR, { recursive: true });

const COLS = 5, ROWS = 4;

const SHEET_1_IDS = [
  "rocket_hound", "grenade_bouncer", "titan_slingshot", "magnetic_harpoon", "reactive_crossbow",
  "sonic_cannon", "industrial_nailer", "disc_launcher", "junk_cannon", "plunger_blaster",
  "pulse_boomerang", "scrap_launcher", "goo_cannon", "ball_launcher", "tesla_gauntlet",
  "magnet_blaster", "spring_launcher", "dual_pulse", "gravity_cannon", "fish_launcher"
];

const SHEET_2_IDS = [
  "bee_swarm_launcher", "freeze_ray", "bubble_bazooka", "barrel_launcher", "vacuum_cannon",
  "meteor_slinger", "popcorn_blaster", "shock_hammer", "tornado_blaster", "rubber_chicken_launcher",
  "paint_blast", "pizza_cannon", "rocket_boot_blaster", "snowball_mortar", "toy_tank_launcher",
  "banana_boomerang", "magnetic_yoyo", "lava_sprayer", "cloud_cannon", "rocket_umbrella"
];

async function cropSheet(sheetPath, ids) {
  const { width, height } = await sharp(sheetPath).metadata();
  const colBound = (c) => Math.round((c * width) / COLS);
  const rowBound = (r) => Math.round((r * height) / ROWS);
  for (let i = 0; i < ids.length; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const left = colBound(col), top = rowBound(row);
    const w = colBound(col + 1) - left, h = rowBound(row + 1) - top;
    const outPath = `${OUT_DIR}/${ids[i]}.webp`;
    await sharp(sheetPath).extract({ left, top, width: w, height: h }).webp({ quality: 90 }).toFile(outPath);
    console.log(`  ${sheetPath} [r${row}c${col}] -> ${outPath} (${w}x${h})`);
  }
}

await cropSheet("assets/fortress-img/armi-new-1.webp", SHEET_1_IDS);
await cropSheet("assets/fortress-img/armi-new-2.webp", SHEET_2_IDS);
console.log(`\nFatto: ${SHEET_1_IDS.length + SHEET_2_IDS.length} immagini generate.`);
