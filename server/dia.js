// Dia: API interna de la tienda online (sin documentar; puede cambiar o bloquear bots).
import { getJson, makeOffer, num, scrapeByTerms } from './search.js';

const BASE = process.env.DIA_BASE || 'https://www.dia.es';

export function parseDia(json) {
  const items = json.search_items || json.products || json.items || [];
  return items.map(p => {
    const pr = p.prices || {};
    return makeOffer('Dia', {
      id: p.object_id || p.sku_id || p.id,
      name: p.display_name || p.name,
      unit: p.unit || p.size || '',
      category: (p.categories && p.categories[0] && (p.categories[0].name || p.categories[0])) || undefined,
      price: num(pr.price ?? p.price),
      was: num(pr.strikethrough_price ?? pr.previous_price ?? p.strikethrough_price),
      image: p.image && (p.image.startsWith('http') ? p.image : `${BASE}${p.image}`),
      url: p.url && (p.url.startsWith('http') ? p.url : `${BASE}${p.url}`)
    });
  });
}

export const scrapeDia = () => scrapeByTerms({
  store: 'Dia',
  fetchTerm: async t => parseDia(await getJson(`${BASE}/api/v1/search-back/search/reduced?q=${encodeURIComponent(t)}&page=1`))
});
