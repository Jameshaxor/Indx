'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchMarket } from '@/lib/api';
import { fmt } from '@/lib/utils';
import Chart from '@/components/dashboard/Chart';

export default function MarketsPage() {
  const [mkt, setMkt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('indices');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sym');
  const [sortDir, setSortDir] = useState('asc');
  const [sectorFilter, setSectorFilter] = useState('All');

  const load = useCallback(async () => {
    const m = await fetchMarket();
    if (m) setMkt(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, [load]);

  const idx = mkt?.indices || [];
  const stk = mkt?.stocks || [];
  const sec = mkt?.sectors || [];
  const isOpen = mkt?.marketState === 'REGULAR';

  const allSectors = useMemo(() => {
    const s = new Set(stk.map(x => x.sector).filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [stk]);

  const filtered = useMemo(() => {
    let arr = [...stk];
    if (sectorFilter !== 'All') arr = arr.filter(s => s.sector === sectorFilter);
    if (search) arr = arr.filter(s => s.sym?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()));
    arr.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [stk, search, sortBy, sortDir, sectorFilter]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const advancers = stk.filter(s => s.change > 0).length;
  const decliners = stk.filter(s => s.change < 0).length;
  const unchanged = stk.filter(s => s.change === 0).length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
      <div className="spinner" />
      <div style={{ color: 'var(--t2)', fontSize: 13 }}>Loading market data...</div>
    </div>
  );

  return (
    <div className="page-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Markets</span></h2>
          <p className="caption" style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            Real-time Indian market data
            <span className="live" />
            <span style={{ fontSize: 10, color: isOpen ? 'var(--green)' : 'var(--t3)', fontWeight: 600 }}>{isOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}</span>
          </p>
        </div>
        <button className="btn btn-s btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      {/* Market Breadth */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Advancers</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{advancers}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Decliners</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{decliners}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Unchanged</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{unchanged}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">A/D Ratio</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{decliners ? (advancers / decliners).toFixed(2) : '∞'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg1)', borderRadius: 10, padding: 4 }}>
        {['indices', 'stocks', 'sectors', 'heatmap'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === t ? 'var(--accent)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--t2)',
            transition: 'all .2s'
          }}>
            {t === 'indices' && '📊 '}{t === 'stocks' && '📈 '}{t === 'sectors' && '🏭 '}{t === 'heatmap' && '🗺️ '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Indices Tab */}
      {tab === 'indices' && (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {idx.map((ind, j) => {
            const up = ind.change >= 0;
            return (
              <div key={j} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{ind.displayName}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--mono)', marginTop: 4 }}>
                      {ind.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className={up ? 'badge bg-green' : 'badge bg-red'} style={{ fontSize: 12 }}>
                    {up ? '▲' : '▼'} {up ? '+' : ''}{ind.change?.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 8 }}>
                  <span>Prev: {ind.prevClose?.toLocaleString('en-IN')}</span>
                  <span>Chg: <span style={{ color: up ? 'var(--green)' : 'var(--red)' }}>{up ? '+' : ''}{Math.abs((ind.price || 0) - (ind.prevClose || 0)).toFixed(2)}</span></span>
                </div>
                {ind.history?.length > 2 && <Chart data={ind.history} color={up ? '#10b981' : '#ef4444'} height={60} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Stocks Tab */}
      {tab === 'stocks' && (
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <input
              type="text" placeholder="🔍 Search stocks..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="input" style={{ flex: 1, minWidth: 200 }}
            />
            <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} className="input" style={{ minWidth: 140 }}>
              {allSectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('sym')} style={{ cursor: 'pointer' }}>Symbol {sortBy === 'sym' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Sector</th>
                  <th onClick={() => toggleSort('price')} style={{ cursor: 'pointer', textAlign: 'right' }}>Price {sortBy === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => toggleSort('change')} style={{ cursor: 'pointer', textAlign: 'right' }}>Change {sortBy === 'change' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th style={{ textAlign: 'right' }}>Volume</th>
                  <th style={{ textAlign: 'right' }}>Day Range</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const up = s.change >= 0;
                  return (
                    <tr key={s.sym}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="sicon" style={{ background: (s.color || '#666') + '20', color: s.color || '#666', width: 28, height: 28, fontSize: 10 }}>{s.sym?.slice(0, 2)}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 12 }}>{s.sym}</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{s.name}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge bg-blue" style={{ fontSize: 9 }}>{s.sector}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 12 }}>{fmt(s.price)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={up ? 'badge bg-green' : 'badge bg-red'}>{up ? '+' : ''}{s.change?.toFixed(2)}%</span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>
                        {s.volume ? (s.volume / 100000).toFixed(1) + 'L' : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
                        {s.dayLow?.toFixed(0)} - {s.dayHigh?.toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="caption" style={{ marginTop: 10 }}>{filtered.length} stocks shown</div>
        </div>
      )}

      {/* Sectors Tab */}
      {tab === 'sectors' && (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
          {sec.map(s => {
            const up = s.change >= 0;
            return (
              <div key={s.name} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                  <span className={up ? 'badge bg-green' : 'badge bg-red'}>{up ? '+' : ''}{s.change}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--b0)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(Math.abs(s.change) * 20, 100)}%`,
                    height: '100%', borderRadius: 4,
                    background: up ? 'var(--green)' : 'var(--red)',
                    transition: 'width .5s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Heatmap Tab */}
      {tab === 'heatmap' && (
        <div className="card">
          <div className="h-s" style={{ marginBottom: 12 }}>Market Heatmap</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 4 }}>
            {stk.slice(0, 50).map(s => {
              const a = Math.abs(s.change || 0);
              const op = Math.min(.25 + a * .15, .85);
              const bg = (s.change || 0) >= 0 ? `rgba(16,185,129,${op})` : `rgba(239,68,68,${op})`;
              return (
                <div key={s.sym} className="hm" style={{ background: bg, padding: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700 }}>{s.sym}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--mono)' }}>
                    {(s.change || 0) > 0 ? '+' : ''}{s.change?.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 9, opacity: .7 }}>{fmt(s.price)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
