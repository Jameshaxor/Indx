'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchMarket } from '@/lib/api';
import { fmt } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function WatchlistPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [mkt, setMkt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const [snap, m] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          fetchMarket()
        ]);
        if (snap.exists() && snap.data().watchlist) setWatchlist(snap.data().watchlist);
        if (m) setMkt(m);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  // Refresh prices periodically
  useEffect(() => {
    const i = setInterval(async () => {
      const m = await fetchMarket();
      if (m) setMkt(m);
    }, 60000);
    return () => clearInterval(i);
  }, []);

  const stocks = mkt?.stocks || [];
  const priceMap = useMemo(() => {
    const map = {};
    stocks.forEach(s => { map[s.sym] = s; });
    return map;
  }, [stocks]);

  const saveWatchlist = async (newList) => {
    setSaving(true);
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      await setDoc(ref, { ...existing, watchlist: newList, updatedAt: new Date().toISOString() });
      setWatchlist(newList);
    } catch (e) { alert('Save failed: ' + e.message); }
    setSaving(false);
  };

  const addToWatchlist = async (sym) => {
    if (watchlist.includes(sym)) return;
    await saveWatchlist([...watchlist, sym]);
    setSearch('');
    setShowSearch(false);
  };

  const removeFromWatchlist = async (sym) => {
    await saveWatchlist(watchlist.filter(s => s !== sym));
  };

  const searchResults = useMemo(() => {
    if (!search || search.length < 1) return [];
    return stocks.filter(s =>
      !watchlist.includes(s.sym) &&
      (s.sym?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 8);
  }, [search, stocks, watchlist]);

  const watchlistData = useMemo(() => {
    return watchlist.map(sym => {
      const s = priceMap[sym];
      return s || { sym, price: 0, change: 0, name: sym, color: '#666' };
    });
  }, [watchlist, priceMap]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
      <div className="spinner" /><div style={{ color: 'var(--t2)', fontSize: 13 }}>Loading watchlist...</div>
    </div>
  );

  return (
    <div className="page-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Watchlist</span></h2>
          <p className="caption" style={{ marginTop: 3 }}>Track stocks you're interested in · {watchlist.length} stocks</p>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => setShowSearch(!showSearch)}>
          {showSearch ? '✕ Close' : '+ Add Stock'}
        </button>
      </div>

      {/* Search to Add */}
      {showSearch && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--accent)', position: 'relative' }}>
          <div className="h-s" style={{ marginBottom: 10 }}>🔍 Search & Add</div>
          <input
            className="input" placeholder="Type stock name or symbol..."
            value={search} onChange={e => setSearch(e.target.value)} autoFocus
            style={{ width: '100%', marginBottom: 8 }}
          />
          {searchResults.length > 0 && (
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {searchResults.map(s => (
                <div key={s.sym} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--b0)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="sicon" style={{ background: (s.color || '#666') + '20', color: s.color || '#666', width: 28, height: 28, fontSize: 10 }}>{s.sym?.slice(0, 2)}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{s.sym}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{s.sector}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700 }}>{fmt(s.price)}</span>
                    <span className={s.change >= 0 ? 'badge bg-green' : 'badge bg-red'} style={{ fontSize: 9 }}>
                      {s.change >= 0 ? '+' : ''}{s.change?.toFixed(1)}%
                    </span>
                    <button className="btn btn-p btn-sm" style={{ padding: '3px 10px', fontSize: 10 }} onClick={() => addToWatchlist(s.sym)} disabled={saving}>
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {search && searchResults.length === 0 && (
            <div className="caption" style={{ padding: 10, textAlign: 'center' }}>No matching stocks found</div>
          )}
        </div>
      )}

      {/* Watchlist Grid */}
      {watchlistData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👀</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Watchlist is empty</div>
          <div className="caption">Click "Add Stock" to start tracking</div>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
          {watchlistData.map(s => {
            const up = (s.change || 0) >= 0;
            return (
              <div key={s.sym} className="card" style={{ position: 'relative' }}>
                <button onClick={() => removeFromWatchlist(s.sym)} disabled={saving}
                  style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: .5 }}
                  title="Remove">✕</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className="sicon" style={{ background: (s.color || '#666') + '20', color: s.color || '#666' }}>{s.sym?.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.sym}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{s.sector || s.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--mono)' }}>{fmt(s.price)}</div>
                  <span className={up ? 'badge bg-green' : 'badge bg-red'}>
                    {up ? '▲' : '▼'} {up ? '+' : ''}{s.change?.toFixed(2)}%
                  </span>
                </div>
                {s.dayLow && s.dayHigh && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                      <span>L: {s.dayLow?.toFixed(0)}</span>
                      <span>H: {s.dayHigh?.toFixed(0)}</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--b0)', borderRadius: 3, marginTop: 3, position: 'relative' }}>
                      <div style={{
                        position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', top: -1.5,
                        left: `${s.dayHigh - s.dayLow > 0 ? ((s.price - s.dayLow) / (s.dayHigh - s.dayLow)) * 100 : 50}%`,
                        transform: 'translateX(-50%)'
                      }} />
                    </div>
                  </div>
                )}
                {s.volume && <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 6 }}>Vol: {(s.volume / 100000).toFixed(1)}L</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
