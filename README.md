# Compara precios · Buscador de ofertas

App móvil (React + Vite) con un servidor Node que scrapea las ofertas actuales de Mercadona, Dia y Carrefour y las sirve a la app.

## Arrancar

```bash
npm install
npm start        # compila y sirve en http://localhost:8787
```

Al arrancar, el servidor scrapea si no hay caché o tiene más de 6 h (`data/offers.json`).
En la pestaña **Ofertas**: «Actualizar ofertas» vuelve a scrapear, y puedes seleccionar ofertas
(casilla) para ver el total y lo que ahorras. La selección se guarda en el navegador.

Variables: `PORT`, `MERCADONA_WH` (almacén, p. ej. `bcn1`), `MERCADONA_BASE`.

## Notas
- Buscar y Cesta siguen usando los datos de ejemplo del diseño (`src/data.js`); solo Ofertas es real.
- Mercadona usa su API pública (almacén `mad1`). Dia y Carrefour usan APIs internas sin documentar, buscando ~30 productos básicos (`server/search.js`); **no verificadas contra los sitios reales** y pueden bloquear bots o cambiar. Si un súper falla, la app lo marca con ⚠, conserva sus últimas ofertas y no afecta a los demás. Los endpoints se ajustan en `server/dia.js` y `server/carrefour.js` (o con `DIA_BASE`/`CARREFOUR_BASE`).
- Añadir otro súper = un módulo en `server/` que devuelva ofertas con `makeOffer` y registrarlo en `SCRAPERS`.
- Desarrollo con recarga: `npm run dev` (vite en :5173 proxy a la API en :8787).
