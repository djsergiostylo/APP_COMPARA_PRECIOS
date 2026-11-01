import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { eur } from '../data.js';
import { tab, hdrMuted } from '../look.js';

const chip = on => ({ flex: 'none', minHeight: 36, padding: '0 12px', fontSize: 13, cursor: 'pointer', border: '1px solid ' + (on ? 'var(--color-text)' : 'var(--color-divider)'), background: on ? 'var(--color-text)' : 'transparent', color: on ? 'var(--color-bg)' : 'var(--color-text)' });
const fmtDate = iso => iso ? new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Deals({ app }) {
  const [data, setData] = useState({ offers: [], updatedAt: null, error: null, running: false, progress: null });
  const [netErr, setNetErr] = useState(null);
  const [minPct, setMinPct] = useState(0);
  const [cat, setCat] = useState('all');
  const [store, setStore] = useState('all');
  const [q, setQ] = useState('');
  const [onlySel, setOnlySel] = useState(false);

  const load = useCallback(async () => {
    try { setData(await (await fetch('/api/offers')).json()); setNetErr(null); } catch { setNetErr('No hay conexión con el servidor. Arráncalo con npm start.'); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!data.running) return; const t = setInterval(load, 1500); return () => clearInterval(t); }, [data.running, load]);

  const refresh = async () => { await fetch('/api/refresh', { method: 'POST' }).catch(() => {}); setTimeout(load, 300); };

  const cats = useMemo(() => ['all', ...new Set(data.offers.map(o => o.category))], [data.offers]);
  const list = data.offers.filter(o => o.pct >= minPct && (cat === 'all' || o.category === cat) && (store === 'all' || o.store === store) && (!onlySel || app.selected[o.id]) && o.name.toLowerCase().includes(q.trim().toLowerCase()));
  const storeNames = ['Mercadona', 'Dia', 'Carrefour'];
  const sel = Object.values(app.selected);
  const total = sel.reduce((a, o) => a + o.price, 0), saved = sel.reduce((a, o) => a + (o.was - o.price), 0);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 0 12px', borderBottom: '2px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 20px 0' }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em' }}>Ofertas</h1>
          <span style={hdrMuted}>{data.offers.length} activas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontSize: 12, color: 'var(--color-neutral-700)' }}>
          <span>{data.running ? `Actualizando… ${data.progress ? `${data.progress.done}/${data.progress.total}` : ''}` : `Actualizado: ${fmtDate(data.updatedAt)}`}</span>
          <button onClick={refresh} disabled={data.running} style={{ minHeight: 36, padding: '0 12px', fontWeight: 800, fontSize: 13, cursor: 'pointer', border: '1px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)', opacity: data.running ? .45 : 1 }}>Actualizar ofertas</button>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar ofertas…" aria-label="Filtrar ofertas" style={{ margin: '0 20px', height: 40, padding: '0 12px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', fontSize: 14, color: 'var(--color-text)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid var(--color-divider)', margin: '0 20px' }}>
          {[0, 10, 20, 30].map((v, i) => <button key={v} onClick={() => setMinPct(v)} style={{ ...tab(minPct === v), minHeight: 40, borderLeft: i ? '1px solid var(--color-divider)' : 0 }}>{v ? `−${v} %` : 'Todas'}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 20px' }}>
          {['all', ...storeNames].map(s => <button key={s} onClick={() => setStore(s)} style={chip(store === s)}>{s === 'all' ? 'Todos los súper' : `${s}${data.stores?.[s] && !data.stores[s].ok ? ' ⚠' : ''}`}</button>)}
          <button onClick={() => setOnlySel(s => !s)} style={chip(onlySel)}>Seleccionadas · {sel.length}</button>
          {cats.map(c => <button key={c} onClick={() => setCat(c)} style={chip(cat === c)}>{c === 'all' ? 'Todas las categorías' : c}</button>)}
        </div>
      </div>
      <div className="scroll">
        {(netErr || data.error) && <div role="alert" style={{ padding: '14px 20px', fontSize: 13, background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', borderBottom: '1px solid var(--color-divider)' }}>{netErr || `No se pudo actualizar: ${data.error}`}{data.offers.length ? ' Se muestran las últimas ofertas guardadas.' : ''}</div>}
        {list.map(o => {
          const on = !!app.selected[o.id];
          return (
            <label key={o.id} className="row-hover" style={{ display: 'grid', gridTemplateColumns: '28px 56px minmax(0,1fr) auto', gap: 10, alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--color-divider)', cursor: 'pointer', background: on ? 'var(--color-accent-100)' : undefined }}>
              <input type="checkbox" checked={on} onChange={() => app.toggleSelect(o)} aria-label={`Seleccionar ${o.name}`} style={{ width: 20, height: 20, accentColor: 'var(--color-accent)' }} />
              {o.image ? <img src={o.image} alt="" loading="lazy" className="grayscale" style={{ width: 56, height: 56, objectFit: 'cover' }} /> : <span />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{o.name}</span>
                <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}><b>{o.store}</b> · {o.unit}{o.unit ? ' · ' : ''}{o.category}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', fontWeight: 800, fontSize: 12, padding: '1px 6px' }}>−{o.pct} %</span>
                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em' }}>{eur(o.price)}</span>
                <span style={{ fontSize: 11, textDecoration: 'line-through', color: 'var(--color-neutral-600)' }}>{eur(o.was)}</span>
              </div>
            </label>
          );
        })}
        {!list.length && !data.running && <div style={{ padding: '32px 20px', fontSize: 14, color: 'var(--color-neutral-700)' }}>{data.offers.length ? 'No hay ofertas con esos filtros.' : 'Aún no hay ofertas. Pulsa «Actualizar ofertas».'}</div>}
      </div>
      {sel.length > 0 && (
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderTop: '2px solid var(--color-text)', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
          <span style={{ fontSize: 13 }}>{sel.length} seleccionadas · pagas <b>{eur(total)}</b> · ahorras <b>{eur(saved)}</b></span>
          <button onClick={app.clearSelected} style={{ minHeight: 36, background: 'transparent', border: '1px solid var(--color-bg)', color: 'var(--color-bg)', padding: '0 10px', cursor: 'pointer', fontSize: 12 }}>Limpiar</button>
        </div>
      )}
    </>
  );
}
