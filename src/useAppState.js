import { useEffect, useState } from 'react';

const KEY = 'compara-precios:v1';
const initial = {
  favs: ['aove', 'cafe'],
  alerts: {},
  targets: {},
  basket: { leche: 2, aove: 1, huevos: 1, pasta: 2, cafe: 1, platano: 1 },
  copied: []
};

function load() {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return initial; }
}

// Estado compartido (favoritos, alertas, cesta, cupones) persistido en localStorage.
export function useAppState() {
  const [state, setState] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sin storage */ } }, [state]);
  const toggleFav = id => setState(s => ({ ...s, favs: s.favs.includes(id) ? s.favs.filter(x => x !== id) : [...s.favs, id] }));
  const setTarget = (id, v) => setState(s => ({ ...s, targets: { ...s.targets, [id]: v } }));
  const toggleAlert = id => setState(s => ({ ...s, alerts: { ...s.alerts, [id]: !s.alerts[id] } }));
  const changeQty = (id, d) => setState(s => {
    const basket = { ...s.basket };
    basket[id] = (basket[id] || 0) + d;
    if (basket[id] <= 0) delete basket[id];
    return { ...s, basket };
  });
  const toggleCoupon = id => setState(s => ({ ...s, copied: s.copied.includes(id) ? s.copied.filter(x => x !== id) : [...s.copied, id] }));
  return { ...state, toggleFav, setTarget, toggleAlert, changeQty, toggleCoupon };
}
