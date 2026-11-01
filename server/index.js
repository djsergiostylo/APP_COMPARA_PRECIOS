// Servidor: scrapea ofertas, las cachea en data/offers.json y sirve la app compilada (dist/).
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeMercadona } from './mercadona.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'data', 'offers.json');
const PORT = Number(process.env.PORT || 8787);
const MAX_AGE = 6 * 3600 * 1000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

let state = { offers: [], updatedAt: null, error: null, running: false, progress: null, errors: 0 };

async function loadCache() {
  try { const c = JSON.parse(await fs.readFile(CACHE, 'utf8')); state = { ...state, offers: c.offers, updatedAt: c.updatedAt }; } catch { /* sin caché */ }
}

async function refresh() {
  if (state.running) return;
  state.running = true; state.error = null; state.progress = { done: 0, total: 0 };
  try {
    const { offers, errors } = await scrapeMercadona((done, total) => { state.progress = { done, total }; });
    offers.sort((a, b) => b.pct - a.pct);
    state = { ...state, offers, errors, updatedAt: new Date().toISOString() };
    await fs.mkdir(path.dirname(CACHE), { recursive: true });
    await fs.writeFile(CACHE, JSON.stringify({ offers, updatedAt: state.updatedAt }));
  } catch (e) {
    state.error = e.message; // se conserva la última caché buena
  } finally { state.running = false; state.progress = null; }
}

const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/offers') return send(res, 200, state);
  if (url.pathname === '/api/refresh' && req.method === 'POST') { refresh(); return send(res, 202, { started: true }); }
  const file = path.join(ROOT, 'dist', url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(path.join(ROOT, 'dist'))) return send(res, 403, 'Prohibido', 'text/plain');
  try { send(res, 200, await fs.readFile(file), MIME[path.extname(file)] || 'application/octet-stream'); }
  catch { try { send(res, 200, await fs.readFile(path.join(ROOT, 'dist', 'index.html')), MIME['.html']); } catch { send(res, 404, 'Ejecuta npm run build', 'text/plain'); } }
}).listen(PORT, async () => {
  console.log(`Compara precios en http://localhost:${PORT}`);
  await loadCache();
  if (!state.updatedAt || Date.now() - Date.parse(state.updatedAt) > MAX_AGE) refresh();
});
