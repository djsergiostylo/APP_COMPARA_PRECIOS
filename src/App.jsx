import React, { useState } from 'react';
import { useAppState } from './useAppState.js';
import Search from './screens/Search.jsx';
import Basket from './screens/Basket.jsx';
import Deals from './screens/Deals.jsx';

const TABS = [['search', 'Buscar', Search], ['basket', 'Cesta', Basket], ['deals', 'Ofertas', Deals]];

export default function App() {
  const app = useAppState();
  const [tab, setTab] = useState('search');
  const Screen = TABS.find(t => t[0] === tab)[2];
  return (
    <div className="app">
      <Screen app={app} />
      <nav className="tabbar" aria-label="Secciones">
        {TABS.map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}
      </nav>
    </div>
  );
}
