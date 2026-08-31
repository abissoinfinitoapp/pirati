/* Mini server statico per lo sviluppo: `node dev-server.js` poi apri
   http://localhost:4173  (aprire index.html da file:// non carica i moduli).
   Non serve per pubblicare: online bastano i file statici. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 4173;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml"
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("403"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("404 - " + urlPath); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Pirati dev server → http://localhost:${PORT}`));
