'use client';
import { useState, useEffect, useMemo } from 'react';
import { fetchFunds } from '@/lib/api';
import { fmt, fmtLakh } from '@/lib/utils';

export default function FundsPage() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('returns3y');
  const [selected, setSelected] = useState(null);
  const [sipAmt, setSipAmt] = useState(5000);
  const [sipYears, setSipYears] = useState(10);

  useEffect(() => {
    (async () => {
      const f = await fetchFunds();
      if (f?.funds) setFunds(f.funds);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const c = new Set(funds.map(f => f.category).filter(Boolean));
    return ['All', ...Array.from(c).sort()];
  }, [funds]);

  const filtered = useMemo(() => {
    let arr = [...funds];
    if (category !== 'All') arr = arr.filter(f => f.category === category);
    if (search) arr = arr.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
    arr.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    return arr;
  }, [funds, search, category, sortBy]);

  const sipCalc = useMemo(() => {
    if (!selected) return null;
    const rate = (selected.returns3y || 12) / 100 / 12;
    const months = sipYears * 12;
    const invested = sipAmt * months;
    const fv = sipAmt * ((Math.pow(1 + rate, months) - 1) / rate) * (1 + rate);
    const wealth = fv - invested;
    return { invested, fv, wealth };
  }, [selected, sipAmt, sipYears]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
      <div className="spinner" /><div style={{ color: 'var(--t2)', fontSize: 13 }}>Loading mutual funds...</div>
    </div>
  );

  return (
    <div className="page-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Mutual Funds</span></h2>
          <p className="caption" style={{ marginTop: 3 }}>Explore top Indian mutual funds · {funds.length} funds</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" placeholder="🔍 Search funds..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ minWidth: 140 }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ minWidth: 140 }}>
            <option value="returns1y">Sort: 1Y Returns</option>
            <option value="returns3y">Sort: 3Y Returns</option>
            <option value="returns5y">Sort: 5Y Returns</option>
            <option value="aum">Sort: AUM</option>
            <option value="nav">Sort: NAV</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 14 }}>
        {/* Fund List */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="dtable">
            <thead>
              <tr>
                <th>Fund Name</th>
                <th style={{ textAlign: 'right' }}>NAV</th>
                <th style={{ textAlign: 'right' }}>1Y</th>
                <th style={{ textAlign: 'right' }}>3Y</th>
                <th style={{ textAlign: 'right' }}>5Y</th>
                <th style={{ textAlign: 'right' }}>AUM</th>
                <th style={{ textAlign: 'center' }}>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map((f, i) => (
                <tr key={i} onClick={() => setSelected(f)} style={{ cursor: 'pointer', background: selected?.name === f.name ? 'var(--accent)10' : '' }}>
                  <td>
                    <div style={{ maxWidth: 250 }}>
                      <div style={{ fontWeight: 600, fontSize: 11, lineHeight: 1.3 }}>{f.name}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                        <span className="badge bg-blue" style={{ fontSize: 8 }}>{f.category}</span>
                        {f.plan && <span className="badge bg-purple" style={{ fontSize: 8 }}>{f.plan}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 }}>₹{f.nav?.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={(f.returns1y || 0) >= 0 ? 'badge bg-green' : 'badge bg-red'} style={{ fontSize: 9 }}>
                      {(f.returns1y || 0) >= 0 ? '+' : ''}{f.returns1y?.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={(f.returns3y || 0) >= 0 ? 'badge bg-green' : 'badge bg-red'} style={{ fontSize: 9 }}>
                      {(f.returns3y || 0) >= 0 ? '+' : ''}{f.returns3y?.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={(f.returns5y || 0) >= 0 ? 'badge bg-green' : 'badge bg-red'} style={{ fontSize: 9 }}>
                      {f.returns5y ? `${f.returns5y > 0 ? '+' : ''}${f.returns5y.toFixed(1)}%` : '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
                    {f.aum ? `₹${(f.aum / 100).toFixed(0)}Cr` : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${f.risk === 'High' ? 'bg-red' : f.risk === 'Moderate' ? 'bg-amber' : 'bg-green'}`} style={{ fontSize: 9 }}>
                      {f.risk || 'Moderate'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="caption" style={{ marginTop: 10 }}>{filtered.length} funds found</div>
        </div>

        {/* Selected Fund Detail + SIP Calc */}
        {selected && (
          <div>
            <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div className="h-s" style={{ fontSize: 12, lineHeight: 1.4, maxWidth: 260 }}>{selected.name}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8 }}>
                  <div className="caption">NAV</div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--mono)' }}>₹{selected.nav?.toFixed(2)}</div>
                </div>
                <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8 }}>
                  <div className="caption">Category</div>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{selected.category}</div>
                </div>
                <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8 }}>
                  <div className="caption">1Y Returns</div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', color: (selected.returns1y || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {(selected.returns1y || 0) >= 0 ? '+' : ''}{selected.returns1y?.toFixed(2)}%
                  </div>
                </div>
                <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8 }}>
                  <div className="caption">3Y Returns</div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', color: (selected.returns3y || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {(selected.returns3y || 0) >= 0 ? '+' : ''}{selected.returns3y?.toFixed(2)}%
                  </div>
                </div>
                <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8 }}>
                  <div className="caption">5Y Returns</div>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', color: (selected.returns5y || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {selected.returns5y ? `${selected.returns5y > 0 ? '+' : ''}${selected.returns5y.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
                <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8 }}>
                  <div className="caption">Risk</div>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{selected.risk || 'Moderate'}</div>
                </div>
              </div>
            </div>

            {/* SIP Calculator for this fund */}
            <div className="card">
              <div className="h-s" style={{ marginBottom: 10 }}>📊 SIP Projection</div>
              <div style={{ marginBottom: 10 }}>
                <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Monthly SIP: ₹{sipAmt.toLocaleString()}</label>
                <input type="range" min={500} max={100000} step={500} value={sipAmt} onChange={e => setSipAmt(+e.target.value)} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Duration: {sipYears} years</label>
                <input type="range" min={1} max={30} step={1} value={sipYears} onChange={e => setSipYears(+e.target.value)} style={{ width: '100%' }} />
              </div>
              {sipCalc && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                    <div className="caption">Invested</div>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 12 }}>{fmtLakh(sipCalc.invested)}</div>
                  </div>
                  <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                    <div className="caption">Est. Value</div>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)' }}>{fmtLakh(sipCalc.fv)}</div>
                  </div>
                  <div style={{ padding: 8, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                    <div className="caption">Wealth Gain</div>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)' }}>{fmtLakh(sipCalc.wealth)}</div>
                  </div>
                </div>
              )}
              <div className="caption" style={{ marginTop: 8 }}>*Based on 3Y returns ({selected.returns3y?.toFixed(1)}% CAGR). Past performance doesn't guarantee future results.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
