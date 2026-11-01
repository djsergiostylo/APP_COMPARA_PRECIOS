// Valores por defecto del diseño: Énfasis «Rojo», Densidad «Compacta», Orden «Mayor ahorro», Ahorro visible.
export const DENS = 0.65;
export const K = 0.9;
export const SORT_BY = 'Mayor ahorro';
export const SHOW_SAVING = true;
export const tab = on => ({ minHeight: 36, padding: '0 14px', border: 0, cursor: 'pointer', fontSize: 13, background: on ? 'var(--color-text)' : 'transparent', color: on ? 'var(--color-bg)' : 'var(--color-text)', fontWeight: on ? 800 : 400 });
export const hdrBase = { borderBottom: '2px solid var(--color-divider)' };
export const hdrMuted = { fontSize: 12, color: 'var(--color-neutral-700)' };
