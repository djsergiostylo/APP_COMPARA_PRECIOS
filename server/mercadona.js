// Scraper de Mercadona usando su API pública de tienda online (sin clave).
const BASE = process.env.MERCADONA_BASE || 'https://tienda.mercadona.es';
const WH = process.env.MERCADONA_WH || 'mad1'; // almacén virtual (mad1 = Madrid)
const HEADERS = { 'user-agent': 'Mozilla/5.0 (compatible; compara-precios/0.1)', accept: 'application/json' };

async function getJson(path) {
  const res = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}lang=es&wh=${WH}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Mercadona ${res.status} en ${path}`);
  return res.json();
}

const num = v => (v == null || v === '' ? null : Number(String(v).replace(',', '.')));

export function toOffer(p, category) {
  const pi = p.price_instructions || {};
  const price = num(pi.unit_price);
  const was = num(pi.previous_unit_price);
  if (price == null || was == null || was <= price) return null; // solo rebajas reales
  return {
    id: `mercadona:${p.id}`,
    store: 'Mercadona',
    name: p.display_name,
    unit: [p.packaging, pi.size_format && pi.unit_size ? `${pi.unit_size} ${pi.size_format}` : ''].filter(Boolean).join(' · '),
    category,
    price,
    was,
    pct: Math.round((was - price) / was * 100),
    image: p.thumbnail || null,
    url: p.share_url || null,
    seenAt: new Date().toISOString()
  };
}

async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]).catch(e => ({ error: e.message })); }
  }));
  return out;
}

export async function scrapeMercadona(onProgress = () => {}) {
  const top = await getJson('/api/categories/');
  const subs = top.results.flatMap(g => (g.categories || []).map(c => ({ id: c.id, group: g.name })));
  let done = 0;
  const pages = await pool(subs, 4, async s => {
    const d = await getJson(`/api/categories/${s.id}/`);
    onProgress(++done, subs.length);
    return (d.categories || []).flatMap(c => (c.products || []).map(p => toOffer(p, s.group))).filter(Boolean);
  });
  const errors = pages.filter(p => p && p.error).length;
  const offers = pages.filter(Array.isArray).flat();
  if (!offers.length && errors) throw new Error('No se pudo leer ninguna categoría de Mercadona');
  return { offers, errors };
}
