import React, { useMemo, useState } from 'react';
import { P, S, eur, pct, stats, hist } from '../data.js';
import { DENS, K, SORT_BY, SHOW_SAVING, tab, hdrBase, hdrMuted } from '../look.js';
import Star from '../Star.jsx';

const spread = p => { const x = stats(p); return x.worst[1] - x.best[1]; };
const stepBtn = { width: 44, height: 44, background: 'transparent', border: 0, fontSize: 20, cursor: 'pointer', color: 'var(--color-text)' };

export default function Search({ app }) {
  const [q, setQ] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [sel, setSel] = useState(null);

  const list = useMemo(() => {
    const l = P.filter(p => p.name.toLowerCase().includes(q.trim().toLowerCase()) && (!onlyFav || app.favs.includes(p.id)));
    if (SORT_BY === 'Mayor ahorro') l.sort((a, b) => spread(b) - spread(a));
    else if (SORT_BY === 'Precio') l.sort((a, b) => stats(a).best[1] - stats(b).best[1]);
    else l.sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [q, onlyFav, app.favs]);

  const product = P.find(p => p.id === sel);
  if (product) return <Detail p={product} app={app} onBack={() => setSel(null)} />;

  return (
    <>
      <div style={{ ...hdrBase, display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em' }}>Ofertas</h1>
          <span style={hdrMuted}>Madrid · 8 súper</span>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: '0 12px', height: 44 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Leche, aceite, huevos…" aria-label="Buscar producto" style={{ flex: 1, border: 0, background: 'transparent', font: 'inherit', fontSize: 15, color: 'var(--color-text)', outline: 'none', height: '100%' }} />
        </label>
        <div style={{ display: 'flex', border: '1px solid var(--color-divider)', width: 'max-content' }}>
          <button onClick={() => setOnlyFav(false)} style={tab(!onlyFav)}>Todo</button>
          <button onClick={() => setOnlyFav(true)} style={{ ...tab(onlyFav), borderLeft: '1px solid var(--color-divider)' }}>Favoritos · {app.favs.length}</button>
        </div>
      </div>
      <div className="scroll">
        {list.map(p => {
          const x = stats(p);
          return (
            <div key={p.id} role="button" tabIndex={0} className="row-hover" onClick={() => setSel(p.id)} onKeyDown={e => e.key === 'Enter' && setSel(p.id)}
              style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto 44px', gap: 10, alignItems: 'center', padding: `${12 * DENS}px 8px ${12 * DENS}px 20px`, borderBottom: '1px solid var(--color-divider)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{SHOW_SAVING ? `${p.unit} · hasta ${eur(x.worst[1] - x.best[1])} más en ${S[x.worst[0]]}` : `${p.unit} · ${x.e.length} súper`}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontSize: 20 * K, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>{eur(x.best[1])}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-700)' }}>{S[x.best[0]]}</span>
              </div>
              <button aria-label="Favorito" aria-pressed={app.favs.includes(p.id)} onClick={e => { e.stopPropagation(); app.toggleFav(p.id); }} style={{ width: 44, height: 44, display: 'grid', placeItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--color-text)' }}>
                <Star on={app.favs.includes(p.id)} />
              </button>
            </div>
          );
        })}
        {list.length === 0 && <div style={{ padding: '32px 20px', fontSize: 14, color: 'var(--color-neutral-700)' }}>Sin resultados. Prueba con otro producto o marca favoritos con la estrella.</div>}
      </div>
    </>
  );
}

function Detail({ p, app, onBack }) {
  const x = stats(p), h = hist(p), mn = Math.min(...h), mx = Math.max(...h);
  const y = v => 90 - (v - mn) / ((mx - mn) || 1) * 70;
  const target = app.targets[p.id] ?? Math.round(x.best[1] * 0.95 * 20) / 20;
  const on = !!app.alerts[p.id];
  const fav = app.favs.includes(p.id);
  const spark = h.map((v, i) => `${(10 + i * 300 / 11).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const section = { padding: '16px 20px', borderBottom: '2px solid var(--color-divider)' };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '2px solid var(--color-divider)' }}>
        <button onClick={onBack} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'transparent', border: 0, fontWeight: 800, fontSize: 14, cursor: 'pointer', color: 'var(--color-text)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>Volver
        </button>
        <button onClick={() => app.toggleFav(p.id)} aria-pressed={fav} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'transparent', border: 0, fontSize: 13, cursor: 'pointer', color: 'var(--color-text)' }}>
          <Star on={fav} size={18} />{fav ? 'En favoritos' : 'Favorito'}
        </button>
      </div>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...section, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.015em' }}>{p.name}</span>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{p.unit} · {p.real ? 'precio publicado oct 2026' : 'datos de ejemplo'}</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span className="kicker">Más barato en</span><span style={{ fontSize: 22, fontWeight: 800 }}>{S[x.best[0]]}</span></div>
            <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 0.9, color: 'var(--color-accent)', letterSpacing: '-0.03em' }}>{eur(x.best[1])}</span>
          </div>
          <span style={{ fontSize: 13, marginTop: 8 }}>{x.worst[1] > x.best[1] ? `Ahorras ${eur(x.worst[1] - x.best[1])} (${pct(x.best[1], x.worst[1])} %) frente a ${S[x.worst[0]]}.` : 'Mismo precio en todos los súper.'}</span>
        </div>
        <div style={{ ...section, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="kicker">Comparativa · {x.e.length} súper</span>
          {x.e.map(([k, v]) => {
            const best = v === x.best[1];
            return (
              <React.Fragment key={k}>
                <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0,1fr) 64px', gap: 10, alignItems: 'center', fontSize: 13 }}>
                  <span style={{ fontWeight: best ? 800 : 400 }}>{S[k]}</span>
                  <div style={{ height: 10, background: 'var(--color-neutral-200)' }}><div style={{ height: 10, width: (v / x.worst[1] * 100).toFixed(1) + '%', background: best ? 'var(--color-accent)' : 'var(--color-neutral-500)' }} /></div>
                  <span style={{ textAlign: 'right', fontWeight: best ? 800 : 400 }}>{eur(v)}</span>
                </div>
                {p.w?.[k] && <span style={{ fontSize: 11, color: 'var(--color-accent-700)', margin: '-6px 0 0 94px' }}>Oferta −{pct(v, p.w[k])} % · antes {eur(p.w[k])}</span>}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ ...section, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="kicker">Historial · 12 semanas</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-700)' }}>{h[11] <= mn ? 'Precio más bajo del periodo' : ''}</span>
          </div>
          <svg viewBox="0 0 320 100" width="100%" height="100" style={{ display: 'block', background: 'var(--color-surface)' }} role="img" aria-label="Historial de precio de 12 semanas">
            <line x1="0" y1="20" x2="320" y2="20" stroke="var(--color-neutral-300)" />
            <line x1="0" y1="90" x2="320" y2="90" stroke="var(--color-neutral-300)" />
            <polyline points={spark} fill="none" stroke="var(--color-text)" strokeWidth="2" />
            <circle cx="310" cy={y(h[11]).toFixed(1)} r="4" fill="var(--color-accent)" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-neutral-700)' }}><span>Mín. {eur(mn)}</span><span>Máx. {eur(mx)}</span></div>
        </div>
        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /></svg>Avísame si baja de
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-divider)' }}>
              <button aria-label="Bajar objetivo" onClick={() => app.setTarget(p.id, Math.max(0.05, Math.round((target - 0.05) * 100) / 100))} style={stepBtn}>−</button>
              <span style={{ minWidth: 84, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17, borderLeft: '1px solid var(--color-divider)', borderRight: '1px solid var(--color-divider)' }}>{eur(target)}</span>
              <button aria-label="Subir objetivo" onClick={() => app.setTarget(p.id, Math.round((target + 0.05) * 100) / 100)} style={stepBtn}>+</button>
            </div>
            <button onClick={() => app.toggleAlert(p.id)} aria-pressed={on} style={{ flex: 1, minHeight: 44, padding: '0 14px', textAlign: 'left', fontWeight: 800, fontSize: 14, cursor: 'pointer', border: on ? '1px solid var(--color-text)' : '1px solid transparent', background: on ? 'transparent' : 'var(--color-accent)', color: on ? 'var(--color-text)' : 'var(--color-bg)' }}>{on ? 'Alerta activa ✓' : 'Crear alerta'}</button>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>Te avisamos en cualquiera de los súper comparados.</span>
        </div>
      </div>
    </>
  );
}
