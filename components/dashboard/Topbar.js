'use client';
import { useState, useEffect } from 'react';
import { fetchMarket } from '@/lib/api';

export default function Topbar({ onMenuClick }) {
  const [mkt, setMkt] = useState(null);

  useEffect(() => {
    fetchMarket().then(m => { if (m) setMkt(m); });
    const i = setInterval(() => fetchMarket().then(m => { if (m) setMkt(m); }), 60000);
    return () => clearInterval(i);
  }, []);

  const idx = mkt?.indices || [];

  return (
    <div style={{
      height: 44, borderBottom: '1px solid var(--b0)', background: 'var(--bg1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', flexShrink: 0, gap: 10
    }}>
      {/* Left: hamburger + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="hamburger" onClick={onMenuClick}>☰</button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg0)', borderRadius: 8, padding: '6px 14px',
          border: '1px solid var(--b0)', minWidth: 180
        }}>
          <span style={{ fontSize: 13, opacity: .5 }}>🔍</span>
          <input placeholder="Search..." style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 12, color: 'var(--t1)', width: '100%'
          }} />
        </div>
      </div>

      {/* Right: ticker (hidden on mobile via CSS) */}
      <div className="ticker-bar" style={{
        display: 'flex', alignItems: 'center', gap: 16, fontSize: 11,
        fontFamily: 'var(--mono)', overflow: 'hidden', whiteSpace: 'nowrap'
      }}>
        {idx.slice(0, 3).map((ind, i) => {
          const up = ind.change >= 0;
          return (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 10 }}>{ind.displayName}</span>
              <span style={{ fontWeight: 600 }}>{ind.price?.toLocaleString('en-IN')}</span>
              <span style={{ color: up ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize: 10 }}>
                {up ? '+' : ''}{ind.change}%
              </span>
            </span>
          );
        })}
        <span className="live" />
        <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600 }}>LIVE</span>
      </div>
    </div>
  );
}
