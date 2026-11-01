// Servidor: scrapea ofertas, las cachea en data/offers.json y sirve la app compilada (dist/).
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeMercadona } from './mercadona.js';
import { scrapeDia } from './dia.js';
import { scrapeCarrefour } from './carrefour.js';

const SCRAPERS = { Mercadona: scrapeMercadona, Dia: scrapeDia, Carrefour: scrapeCarrefour };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'data', 'offers.json');
const PORT = Number(process.env.PORT || 8787);
const MAX_AGE = 6 * 3600 * 1000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

let state = { offers: [], updatedAt: null, error: null, running: false, progress: null, stores: {} };

async function loadCache() {
  try { const c = JSON.parse(await fs.readFile(CACHE, 'utf8')); state = { ...state, offers: c.offers, updatedAt: c.updatedAt, stores: c.stores || {} }; } catch { /* sin caché */ }
}

async function refresh() {
  if (state.running) return;
  state.running = true; state.error = null; state.progress = { done: 0, total: Object.keys(SCRAPERS).length };
  try {
    const names = Object.keys(SCRAPERS);
    const stores = { ...state.stores };
    let kept = state.offers;
    const fresh = [];
    await Promise.all(names.map(async n => {
      try {
        const { offers, errors } = await SCRAPERS[n]();
        fresh.push(...offers); kept = kept.filter(o => o.store !== n);
        stores[n] = { ok: true, count: offers.length, errors, at: new Date().toISOString() };
      } catch (e) {
        stores[n] = { ok: false, error: e.message, count: kept.filter(o => o.store === n).length, at: new Date().toISOString() };
      } finally { state.progress.done++; }
    }));
    const offers = [...kept, ...fresh].sort((a, b) => b.pct - a.pct); // un súper que falla conserva su última caché
    const failed = names.filter(n => !stores[n].ok);
    state = { ...state, offers, stores, error: failed.length ? `Fallaron: ${failed.map(n => `${n} (${stores[n].error})`).join('; ')}` : null };
    if (fresh.length) {
      state.updatedAt = new Date().toISOString();
      await fs.mkdir(path.dirname(CACHE), { recursive: true });
      await fs.writeFile(CACHE, JSON.stringify({ offers, updatedAt: state.updatedAt, stores }));
    }
  } catch (e) {
    state.error = e.message;
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
