import React, { useState } from 'react';
import { P, S, STORE_KEYS, COUPONS, eur, pct, hist } from '../data.js';
import { DENS, K, tab, hdrMuted } from '../look.js';
import Star from '../Star.jsx';

const chip = on => ({ flex: 'none', minHeight: 36, padding: '0 12px', fontSize: 13, cursor: 'pointer', border: '1px solid ' + (on ? 'var(--color-text)' : 'var(--color-divider)'), background: on ? 'var(--color-text)' : 'transparent', color: on ? 'var(--color-bg)' : 'var(--color-text)' });

const deals = [];
P.forEach(p => {
  if (!p.w) return;
  const low = Math.min(...hist(p));
  Object.entries(p.w).forEach(([k, w]) => deals.push({ p, k, price: p.p[k], w, pc: pct(p.p[k], w), low: p.p[k] <= low }));
});

export default function Deals({ app }) {
  const [minPct, setMinPct] = useState(0);
  const [store, setStore] = useState('all');
  const fd = deals.filter(d => d.pc >= minPct && (store === 'all' || d.k === store)).sort((a, b) => b.pc - a.pc);
  const stores = [['all', 'Todos'], ...STORE_KEYS.filter(k => deals.some(d => d.k === k)).map(k => [k, S[k]])];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 0 14px', borderBottom: '2px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 20px 12px' }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em' }}>Ofertas</h1>
          <span style={hdrMuted}>{deals.length} activas</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid var(--color-divider)', margin: '0 20px' }}>
          {[0, 10, 20, 30].map((v, i) => <button key={v} onClick={() => setMinPct(v)} style={{ ...tab(minPct === v), minHeight: 40, borderLeft: i ? '1px solid var(--color-divider)' : 0 }}>{v ? `−${v} %` : 'Todas'}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 20px' }}>
          {stores.map(([k, l]) => <button key={k} onClick={() => setStore(k)} style={chip(store === k)}>{l}</button>)}
        </div>
      </div>
      <div className="scroll">
        <div style={{ padding: '14px 0 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="kicker" style={{ padding: '0 20px' }}>Cupones</span>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 8px' }}>
            {COUPONS.map(c => {
              const on = app.copied.includes(c.id);
              return (
                <div key={c.id} style={{ flex: 'none', width: 200, border: '1px dashed var(--color-text)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-accent-700)' }}>{c.store}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{c.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>Hasta {c.until}</span>
                  <button onClick={() => app.toggleCoupon(c.id)} aria-pressed={on} style={{ marginTop: 4, minHeight: 36, padding: '0 10px', textAlign: 'left', fontSize: 12, fontWeight: 800, cursor: 'pointer', border: on ? '1px solid var(--color-text)' : 0, background: on ? 'transparent' : 'var(--color-accent)', color: on ? 'var(--color-text)' : 'var(--color-bg)' }}>{on ? 'Guardado en tu tarjeta ✓' : 'Añadir a mi tarjeta'}</button>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '2px solid var(--color-divider)' }}>
          {fd.map(d => (
            <div key={d.p.id + d.k} style={{ display: 'flex', flexDirection: 'column', gap: 6 * DENS, padding: `${12 * DENS}px 14px ${14 * DENS}px`, borderBottom: '1px solid var(--color-divider)', borderRight: '1px solid var(--color-divider)', minHeight: 170 * DENS }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', fontWeight: 800, fontSize: 15, padding: '2px 8px' }}>−{d.pc} %</span>
                <button aria-label="Favorito" aria-pressed={app.favs.includes(d.p.id)} onClick={() => app.toggleFav(d.p.id)} style={{ width: 36, height: 36, margin: '-6px -8px 0 0', display: 'grid', placeItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--color-text)' }}><Star on={app.favs.includes(d.p.id)} size={18} /></button>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25, flex: 1 }}>{d.p.name} · {d.p.unit}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22 * K, fontWeight: 800, letterSpacing: '-0.02em' }}>{eur(d.price)}</span>
                <span style={{ fontSize: 12, textDecoration: 'line-through', color: 'var(--color-neutral-600)' }}>{eur(d.w)}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{S[d.k]}</span>
              {d.low && <span style={{ fontSize: 11, color: 'var(--color-accent-700)', fontWeight: 600 }}>Mínimo de 12 semanas</span>}
            </div>
          ))}
        </div>
        {fd.length === 0 && <div style={{ padding: '32px 20px', fontSize: 14, color: 'var(--color-neutral-700)' }}>No hay ofertas con ese descuento en este súper.</div>}
      </div>
    </>
  );
}
