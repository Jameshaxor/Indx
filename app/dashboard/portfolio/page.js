'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchMarket } from '@/lib/api';
import { fmt, fmtLakh } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Chart from '@/components/dashboard/Chart';

const EMPTY = { holdings: [] };

export default function PortfolioPage() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(EMPTY);
  const [mkt, setMkt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({ sym: '', qty: '', avg: '', date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const [snap, m] = await Promise.all([
          getDoc(doc(db, 'portfolios', user.uid)),
          fetchMarket()
        ]);
        if (snap.exists()) setPortfolio(snap.data());
        if (m) setMkt(m);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const stocks = mkt?.stocks || [];
  const priceMap = useMemo(() => {
    const map = {};
    stocks.forEach(s => { map[s.sym] = s; });
    return map;
  }, [stocks]);

  const holdings = portfolio.holdings || [];

  const summary = useMemo(() => {
    let invested = 0, current = 0;
    holdings.forEach(h => {
      const price = priceMap[h.sym]?.price || h.avg;
      invested += h.qty * h.avg;
      current += h.qty * price;
    });
    const pnl = current - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return { invested, current, pnl, pnlPct };
  }, [holdings, priceMap]);

  const enriched = useMemo(() => {
    return holdings.map(h => {
      const live = priceMap[h.sym];
      const price = live?.price || h.avg;
      const invested = h.qty * h.avg;
      const current = h.qty * price;
      const pnl = current - invested;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
      const dayChange = live?.change || 0;
      return { ...h, price, invested, current, pnl, pnlPct, dayChange, color: live?.color, sector: live?.sector };
    }).sort((a, b) => b.current - a.current);
  }, [holdings, priceMap]);

  const save = async (newHoldings) => {
    setSaving(true);
    const data = { holdings: newHoldings, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'portfolios', user.uid), data);
      setPortfolio(data);
    } catch (e) { alert('Save failed: ' + e.message); }
    setSaving(false);
  };

  const addOrUpdate = async () => {
    if (!form.sym || !form.qty || !form.avg) return alert('Fill all fields');
    const entry = { sym: form.sym.toUpperCase().trim(), qty: parseFloat(form.qty), avg: parseFloat(form.avg), date: form.date || new Date().toISOString().split('T')[0] };
    let newH;
    if (editIdx >= 0) {
      newH = [...holdings];
      newH[editIdx] = entry;
    } else {
      newH = [...holdings, entry];
    }
    await save(newH);
    setForm({ sym: '', qty: '', avg: '', date: '' });
    setShowAdd(false);
    setEditIdx(-1);
  };

  const remove = async (idx) => {
    if (!confirm('Remove this holding?')) return;
    const newH = holdings.filter((_, i) => i !== idx);
    await save(newH);
  };

  const startEdit = (idx) => {
    const h = holdings[idx];
    setForm({ sym: h.sym, qty: String(h.qty), avg: String(h.avg), date: h.date || '' });
    setEditIdx(idx);
    setShowAdd(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
      <div className="spinner" /><div style={{ color: 'var(--t2)', fontSize: 13 }}>Loading portfolio...</div>
    </div>
  );

  return (
    <div className="page-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Portfolio</span></h2>
          <p className="caption" style={{ marginTop: 3 }}>Track your investments & P&L</p>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => { setShowAdd(!showAdd); setEditIdx(-1); setForm({ sym: '', qty: '', avg: '', date: '' }); }}>
          {showAdd ? '✕ Close' : '+ Add Stock'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Invested</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--mono)' }}>{fmtLakh(summary.invested)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Current Value</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--mono)' }}>{fmtLakh(summary.current)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Total P&L</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--mono)', color: summary.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {summary.pnl >= 0 ? '+' : ''}{fmtLakh(summary.pnl)}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="caption">Returns</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--mono)', color: summary.pnlPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {summary.pnlPct >= 0 ? '+' : ''}{summary.pnlPct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--accent)', borderRadius: 12 }}>
          <div className="h-s" style={{ marginBottom: 12 }}>{editIdx >= 0 ? '✏️ Edit Holding' : '➕ Add Holding'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
            <div>
              <label className="caption" style={{ marginBottom: 4, display: 'block' }}>Symbol</label>
              <input className="input" placeholder="e.g. RELIANCE" value={form.sym} onChange={e => setForm({ ...form, sym: e.target.value })} />
            </div>
            <div>
              <label className="caption" style={{ marginBottom: 4, display: 'block' }}>Quantity</label>
              <input className="input" type="number" placeholder="e.g. 10" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            </div>
            <div>
              <label className="caption" style={{ marginBottom: 4, display: 'block' }}>Avg Price (₹)</label>
              <input className="input" type="number" placeholder="e.g. 2450" value={form.avg} onChange={e => setForm({ ...form, avg: e.target.value })} />
            </div>
            <div>
              <label className="caption" style={{ marginBottom: 4, display: 'block' }}>Buy Date</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-p btn-sm" onClick={addOrUpdate} disabled={saving}>
              {saving ? '⏳ Saving...' : editIdx >= 0 ? '✅ Update' : '➕ Add'}
            </button>
            <button className="btn btn-s btn-sm" onClick={() => { setShowAdd(false); setEditIdx(-1); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      {enriched.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No Holdings Yet</div>
          <div className="caption">Click "Add Stock" to start tracking your portfolio</div>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="h-s" style={{ marginBottom: 12 }}>Holdings ({enriched.length})</div>
          <table className="dtable">
            <thead>
              <tr>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Avg</th>
                <th style={{ textAlign: 'right' }}>LTP</th>
                <th style={{ textAlign: 'right' }}>Invested</th>
                <th style={{ textAlign: 'right' }}>Current</th>
                <th style={{ textAlign: 'right' }}>P&L</th>
                <th style={{ textAlign: 'right' }}>Day</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((h, i) => {
                const up = h.pnl >= 0;
                const dayUp = h.dayChange >= 0;
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="sicon" style={{ background: (h.color || '#666') + '20', color: h.color || '#666', width: 28, height: 28, fontSize: 10 }}>{h.sym?.slice(0, 2)}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{h.sym}</div>
                          {h.sector && <div style={{ fontSize: 9, color: 'var(--t3)' }}>{h.sector}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>{h.qty}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>{fmt(h.avg)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700 }}>{fmt(h.price)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>{fmtLakh(h.invested)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtLakh(h.current)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
                        {up ? '+' : ''}{fmtLakh(h.pnl)}
                      </div>
                      <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: up ? 'var(--green)' : 'var(--red)' }}>
                        {up ? '+' : ''}{h.pnlPct.toFixed(1)}%
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={dayUp ? 'badge bg-green' : 'badge bg-red'} style={{ fontSize: 9 }}>
                        {dayUp ? '+' : ''}{h.dayChange?.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => startEdit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Edit">✏️</button>
                        <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocation Chart */}
      {enriched.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 12 }}>📊 Allocation by Stock</div>
            {enriched.map((h, i) => {
              const pct = summary.current > 0 ? (h.current / summary.current) * 100 : 0;
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600 }}>{h.sym}</span>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--t3)' }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--b0)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: h.color || 'var(--accent)', borderRadius: 3, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 12 }}>📈 Sector Allocation</div>
            {(() => {
              const sectorMap = {};
              enriched.forEach(h => {
                const s = h.sector || 'Other';
                sectorMap[s] = (sectorMap[s] || 0) + h.current;
              });
              const sorted = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);
              return sorted.map(([s, val]) => {
                const pct = summary.current > 0 ? (val / summary.current) * 100 : 0;
                return (
                  <div key={s} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>{s}</span>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--t3)' }}>{pct.toFixed(1)}% · {fmtLakh(val)}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--b0)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
