// Utilidades comunes para scrapers basados en búsqueda por términos (Dia, Carrefour).
export const TERMS = ['leche', 'aceite', 'huevos', 'arroz', 'pasta', 'tomate', 'café', 'yogur', 'queso', 'jamón', 'pollo', 'ternera', 'pescado', 'atún', 'pan', 'galletas', 'cereales', 'agua', 'refresco', 'cerveza', 'vino', 'detergente', 'papel higiénico', 'champú', 'fruta', 'verdura', 'patatas', 'legumbres', 'chocolate', 'congelados'];

export const HEADERS = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  accept: 'application/json, text/plain, */*',
  'accept-language': 'es-ES,es;q=0.9'
};

export const num = v => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    const blocked = res.status === 403 && /cloudflare|just a moment/i.test((await res.text().catch(() => '')) + (res.headers.get('server') || ''));
    throw new Error(blocked ? `${new URL(url).host} bloquea scrapers (desafío anti-bot de Cloudflare)` : `${res.status} en ${new URL(url).host}`);
  }
  return res.json();
}

export function makeOffer(store, { id, name, unit, category, price, was, image, url }) {
  if (!id || !name || price == null || was == null || was <= price) return null; // solo rebajas reales
  return { id: `${store.toLowerCase()}:${id}`, store, name, unit: unit || '', category: category || 'Varios', price, was, pct: Math.round((was - price) / was * 100), image: image || null, url: url || null, seenAt: new Date().toISOString() };
}

// Recorre TERMS (con límite de concurrencia), dedup por id y devuelve { offers, errors }.
export async function scrapeByTerms({ store, fetchTerm, concurrency = 3 }) {
  const byId = new Map(); let errors = 0, ok = 0, i = 0, lastError = '';
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (i < TERMS.length) {
      const term = TERMS[i++];
      try { (await fetchTerm(term)).forEach(o => o && byId.set(o.id, o)); ok++; } catch (e) { errors++; lastError = e.message; }
      await new Promise(r => setTimeout(r, 250));
    }
  }));
  if (!ok) throw new Error(`${store}: ${lastError || 'ninguna búsqueda respondió'}`);
  return { offers: [...byId.values()], errors };
}
