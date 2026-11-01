import React from 'react';
import { P, S, STORE_KEYS, eur, stats } from '../data.js';
import { DENS, K, hdrBase, hdrMuted } from '../look.js';

const qBtn = { width: 44, height: 44, background: 'transparent', border: 0, fontSize: 18, cursor: 'pointer', color: 'var(--color-text)' };

export default function Basket({ app }) {
  const { basket, changeQty } = app;
  const items = P.filter(p => basket[p.id]);
  const totals = STORE_KEYS.map(k => {
    let t = 0, miss = 0;
    items.forEach(p => { if (p.p[k] != null) t += p.p[k] * basket[p.id]; else miss++; });
    return { k, t, miss };
  }).sort((a, b) => (a.miss - b.miss) || (a.t - b.t));
  const full = totals.filter(t => !t.miss);
  const best = full[0], worst = full[full.length - 1];

  const groups = {};
  let split = 0;
  items.forEach(p => {
    const [k, v] = stats(p).best;
    split += v * basket[p.id];
    (groups[k] = groups[k] || { t: 0, n: [] });
    groups[k].t += v * basket[p.id];
    groups[k].n.push(`${basket[p.id]}× ${p.name}`);
  });
  const units = items.reduce((a, p) => a + basket[p.id], 0);
  const add = P.filter(p => !basket[p.id]);

  return (
    <>
      <div style={{ ...hdrBase, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 20px 14px' }}>
        <h1 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em' }}>Mi cesta</h1>
        <span style={hdrMuted}>{units} unidades</span>
      </div>
      <div className="scroll">
        <div style={{ padding: `${18 * DENS}px 20px`, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
          <span className="kicker" style={{ color: 'inherit' }}>Mejor súper para tu cesta</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 26, fontWeight: 800 }}>{best ? S[best.k] : '—'}</span>
            <span style={{ fontSize: 40 * K, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em' }}>{best ? eur(best.t) : '—'}</span>
          </div>
          <span style={{ fontSize: 13, marginTop: 6 }}>{best && worst && worst.t > best.t ? `${eur(worst.t - best.t)} menos que en ${S[worst.k]}` : 'Añade productos para comparar'}</span>
        </div>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--color-divider)' }}>
          <div className="kicker" style={{ marginBottom: 6 }}>Total por súper</div>
          {totals.map((t, i) => {
            const isBest = best && t.k === best.k;
            const col = isBest ? 'var(--color-accent-700)' : (t.miss ? 'var(--color-neutral-600)' : 'var(--color-text)');
            return (
              <div key={t.k} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr) auto', gap: 10, alignItems: 'center', padding: `${8 * DENS}px 0`, borderBottom: '1px solid var(--color-neutral-300)', fontSize: 14 * K }}>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{i + 1}</span>
                <span style={{ fontWeight: isBest ? 800 : 400, color: col }}>{S[t.k]} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-neutral-700)' }}>{t.miss ? `faltan ${t.miss}` : ''}</span></span>
                <span style={{ fontWeight: isBest ? 800 : 400, color: col }}>{t.miss ? eur(t.t) + '*' : eur(t.t)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '2px solid var(--color-divider)', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><span className="kicker">Compra dividida</span><span style={{ fontSize: 20, fontWeight: 800 }}>{eur(split)}</span></div>
          <span style={{ fontSize: 13 }}>{best && best.t - split > 0.005 ? `Ahorras ${eur(best.t - split)} más repartiendo la compra en ${Object.keys(groups).length} súper.` : 'Tu mejor súper ya tiene todo al precio más bajo.'}</span>
          {Object.entries(groups).sort((a, b) => b[1].t - a[1].t).map(([k, g]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid var(--color-divider)', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}><span>{S[k]}</span><span>{eur(g.t)}</span></div>
              <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{g.n.join(' · ')}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column' }}>
          <span className="kicker" style={{ marginBottom: 4 }}>Tu cesta</span>
          {items.map(p => {
            const x = stats(p);
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{p.unit} · {eur(x.best[1])} en {S[x.best[0]]}</span>
                </div>
                <div style={{ display: 'flex', border: '1px solid var(--color-divider)' }}>
                  <button aria-label={`Quitar ${p.name}`} onClick={() => changeQty(p.id, -1)} style={qBtn}>−</button>
                  <span style={{ width: 32, display: 'grid', placeItems: 'center', fontWeight: 800, borderLeft: '1px solid var(--color-divider)', borderRight: '1px solid var(--color-divider)' }}>{basket[p.id]}</span>
                  <button aria-label={`Añadir ${p.name}`} onClick={() => changeQty(p.id, 1)} style={qBtn}>+</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="kicker">Añadir</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {add.map(p => <button key={p.id} className="row-hover" onClick={() => changeQty(p.id, 1)} style={{ minHeight: 40, padding: '0 12px', background: 'transparent', border: '1px solid var(--color-divider)', fontSize: 13, cursor: 'pointer', color: 'var(--color-text)' }}>+ {p.name}</button>)}
          </div>
        </div>
      </div>
    </>
  );
}
