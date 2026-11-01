// Datos de ejemplo. Solo leche y aceite (marca propia, 1 L) son precios publicados:
// leche según El Confidencial Digital (30 sep 2026), aceite según El Demócrata (31 oct 2026).
export const S = { M: 'Mercadona', C: 'Carrefour', L: 'Lidl', D: 'Dia', A: 'Alcampo', Co: 'Consum', Al: 'Aldi', E: 'Eroski' };
export const STORE_KEYS = Object.keys(S);

// p = precio actual por súper; w = precio anterior (oferta) por súper.
export const P = [
  { id: 'leche', name: 'Leche entera marca propia', unit: '1 L', real: true, p: { M: .96, C: .94, D: .96, A: .96, Co: .96, E: .96 } },
  { id: 'aove', name: 'Aceite de oliva virgen extra', unit: '1 L', real: true, p: { M: 4.35, C: 4.34, D: 4.35, A: 4.34, Co: 4.35 } },
  { id: 'huevos', name: 'Huevos L', unit: '12 u', p: { M: 2.65, C: 2.29, L: 2.59, D: 2.75, A: 2.69, Co: 2.85, Al: 2.59, E: 2.89 }, w: { C: 2.79 } },
  { id: 'arroz', name: 'Arroz redondo', unit: '1 kg', p: { M: 1.35, C: 1.29, L: 1.19, D: 1.39, A: 1.25, Co: 1.45, Al: 1.19, E: 1.49 } },
  { id: 'pasta', name: 'Macarrones', unit: '500 g', p: { M: .85, C: .79, L: .69, D: .89, A: .75, Co: .95, Al: .69, E: .99 }, w: { L: .89 } },
  { id: 'tomate', name: 'Tomate frito', unit: '400 g', p: { M: .95, C: .89, L: .85, D: .99, A: .82, Co: .99, Al: .79, E: 1.05 } },
  { id: 'cafe', name: 'Café molido natural', unit: '250 g', p: { M: 3.20, C: 2.49, L: 2.99, D: 3.29, A: 2.95, Co: 3.40, Al: 2.89, E: 3.45 }, w: { C: 3.35 } },
  { id: 'yogur', name: 'Yogur natural', unit: '8 u', p: { M: 1.48, C: 1.39, L: 1.29, D: 1.10, A: 1.35, Co: 1.55, Al: 1.29, E: 1.59 }, w: { D: 1.55 } },
  { id: 'papel', name: 'Papel higiénico doble capa', unit: '12 rollos', p: { M: 4.50, C: 3.60, L: 4.29, D: 4.75, A: 4.39, Co: 4.99, Al: 4.19, E: 5.10 }, w: { C: 4.80 } },
  { id: 'platano', name: 'Plátano de Canarias', unit: '1 kg', p: { M: 2.39, C: 2.49, L: 1.99, D: 2.45, A: 2.29, Co: 2.55, Al: 2.19, E: 2.65 }, w: { L: 2.59 } },
  { id: 'pollo', name: 'Pechuga de pollo fileteada', unit: '1 kg', p: { M: 6.95, C: 6.49, L: 6.29, D: 7.15, A: 5.99, Co: 7.25, Al: 6.39, E: 7.45 }, w: { A: 7.49 } },
  { id: 'deter', name: 'Detergente líquido', unit: '40 lavados', p: { M: 6.50, C: 4.95, L: 5.99, D: 6.85, A: 5.49, Co: 7.20, Al: 5.79, E: 7.45 }, w: { C: 7.50 } }
];

export const COUPONS = [
  { id: 'k1', store: 'Carrefour', title: '−5 € en compras desde 50 €', until: '15 nov' },
  { id: 'k2', store: 'Lidl', title: '−15 % en panadería', until: '7 nov' },
  { id: 'k3', store: 'Dia', title: '−10 % en frescos', until: '10 nov' },
  { id: 'k4', store: 'Eroski', title: '2.ª unidad −70 % lácteos', until: '12 nov' }
];

export const eur = n => n.toFixed(2).replace('.', ',') + ' €';
export const pct = (p, w) => Math.round((w - p) / w * 100);

export function stats(pr) {
  const e = Object.entries(pr.p).sort((a, b) => a[1] - b[1]);
  return { e, best: e[0], worst: e[e.length - 1] };
}

// Historial de 12 semanas determinista (muestra); la última semana es el precio actual más bajo.
export function hist(pr) {
  const m = stats(pr).best[1];
  let s = pr.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const h = [];
  for (let i = 0; i < 11; i++) h.push(m * (1.03 + 0.07 * Math.sin(i * 0.8 + s % 7) + r() * 0.05));
  h.push(m);
  return h;
}
