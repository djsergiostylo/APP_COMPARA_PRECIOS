// Carrefour: API interna de supermercado online (sin documentar; puede cambiar o bloquear bots).
import { getJson, makeOffer, num, scrapeByTerms } from './search.js';

const BASE = process.env.CARREFOUR_BASE || 'https://www.carrefour.es';

export function parseCarrefour(json) {
  const docs = (json.content && json.content.docs) || json.docs || json.products || [];
  return docs.map(p => makeOffer('Carrefour', {
    id: p.product_id || p.ean || p.id,
    name: p.display_name || p.name,
    unit: p.unit_of_measure || p.format || '',
    category: p.section || p.category || undefined,
    price: num(p.active_price ?? p.price),
    was: num(p.strikethrough_price ?? p.previous_price),
    image: p.image_path,
    url: p.url && (p.url.startsWith('http') ? p.url : `${BASE}${p.url}`)
  }));
}

export const scrapeCarrefour = () => scrapeByTerms({
  store: 'Carrefour',
  fetchTerm: async t => parseCarrefour(await getJson(`${BASE}/cloud-api/plp-food-papi/v1/supermercado?query=${encodeURIComponent(t)}&scope=desktop&lang=es&offset=0&rows=24`))
});
