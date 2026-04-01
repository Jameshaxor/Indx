'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    name: '', email: '', phone: '', pan: '',
    theme: 'system', currency: 'INR',
    notifications: true, dailyDigest: true, priceAlerts: true,
    riskProfile: 'moderate', experience: 'intermediate',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDanger, setShowDanger] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setSettings(prev => ({ ...prev, ...snap.data(), name: user.displayName || snap.data().name || '', email: user.email || '' }));
        } else {
          setSettings(prev => ({ ...prev, name: user.displayName || '', email: user.email || '' }));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Save failed: ' + e.message); }
    setSaving(false);
  };

  const applyTheme = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 14 }}>
      <div className="spinner" /><div style={{ color: 'var(--t2)', fontSize: 13 }}>Loading settings...</div>
    </div>
  );

  return (
    <div className="page-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Settings</span></h2>
          <p className="caption" style={{ marginTop: 3 }}>Manage your Indx profile & preferences</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {saved && <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600, alignSelf: 'center' }}>✅ Saved!</span>}
          <button className="btn btn-p btn-sm" onClick={saveSettings} disabled={saving}>
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Profile */}
        <div className="card">
          <div className="h-s" style={{ marginBottom: 14 }}>👤 Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff'
            }}>
              {(settings.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{settings.name || 'User'}</div>
              <div className="caption">{settings.email}</div>
              <div className="caption" style={{ fontSize: 9 }}>UID: {user?.uid?.slice(0, 12)}...</div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Full Name</label>
              <input className="input" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
            </div>
            <div>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Email</label>
              <input className="input" value={settings.email} disabled style={{ opacity: .6 }} />
            </div>
            <div>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Phone</label>
              <input className="input" placeholder="+91 99999 99999" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
            </div>
            <div>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>PAN (for tax calculations)</label>
              <input className="input" placeholder="ABCDE1234F" value={settings.pan} onChange={e => setSettings({ ...settings, pan: e.target.value.toUpperCase() })} maxLength={10} />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <div className="h-s" style={{ marginBottom: 14 }}>🎨 Appearance</div>
          <div style={{ marginBottom: 14 }}>
            <label className="caption" style={{ display: 'block', marginBottom: 8 }}>Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[
                { id: 'light', label: '☀️ Light' },
                { id: 'dark', label: '🌙 Dark' },
                { id: 'system', label: '💻 System' }
              ].map(t => (
                <button key={t.id} onClick={() => applyTheme(t.id)}
                  style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: settings.theme === t.id ? '2px solid var(--accent)' : '2px solid var(--b0)',
                    background: settings.theme === t.id ? 'var(--accent)10' : 'var(--bg0)',
                    color: 'var(--t1)', transition: 'all .2s'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Currency</label>
            <select className="input" value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD</option>
            </select>
          </div>

          <div className="h-s" style={{ marginBottom: 10, marginTop: 16 }}>📊 Investor Profile</div>
          <div style={{ marginBottom: 10 }}>
            <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Risk Profile</label>
            <select className="input" value={settings.riskProfile} onChange={e => setSettings({ ...settings, riskProfile: e.target.value })}>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div>
            <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Experience</label>
            <select className="input" value={settings.experience} onChange={e => setSettings({ ...settings, experience: e.target.value })}>
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="h-s" style={{ marginBottom: 14 }}>🔔 Notifications</div>
          {[
            { key: 'notifications', label: 'Push Notifications', desc: 'Get notified about important market events' },
            { key: 'dailyDigest', label: 'Daily Market Digest', desc: 'Morning summary of market outlook' },
            { key: 'priceAlerts', label: 'Price Alerts', desc: 'Alert when watchlist stocks move significantly' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--b0)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{item.label}</div>
                <div className="caption" style={{ fontSize: 10 }}>{item.desc}</div>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: settings[item.key] ? 'var(--accent)' : 'var(--b0)',
                  position: 'relative', transition: 'background .2s'
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: settings[item.key] ? 23 : 3,
                  transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)'
                }} />
              </button>
            </div>
          ))}
        </div>

        {/* Account Actions */}
        <div className="card">
          <div className="h-s" style={{ marginBottom: 14 }}>⚙️ Account</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: 12, background: 'var(--bg0)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>📊 Data Export</div>
              <div className="caption" style={{ fontSize: 10, marginBottom: 6 }}>Download your portfolio and settings</div>
              <button className="btn btn-s btn-sm" onClick={() => {
                const data = JSON.stringify({ settings, portfolio: 'Export from portfolio page' }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'indx-data.json'; a.click();
              }}>📥 Export JSON</button>
            </div>

            <div style={{ padding: 12, background: 'var(--bg0)', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>📱 App Info</div>
              <div className="caption" style={{ fontSize: 10, marginTop: 4 }}>
                Indx v1.0.0 · Built with Next.js · Market data from Yahoo Finance
              </div>
            </div>

            <button className="btn btn-s" style={{ width: '100%', marginTop: 8, color: 'var(--red)', borderColor: 'var(--red)' }} onClick={logout}>
              🚪 Sign Out
            </button>

            <button
              className="btn btn-s" onClick={() => setShowDanger(!showDanger)}
              style={{ width: '100%', fontSize: 11, color: 'var(--t3)' }}>
              ⚠️ Danger Zone
            </button>

            {showDanger && (
              <div style={{ padding: 12, background: 'rgba(239,68,68,0.05)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--red)' }}>Delete Account</div>
                <div className="caption" style={{ fontSize: 10, marginBottom: 8 }}>This will permanently delete all your data. This action cannot be undone.</div>
                <button className="btn btn-sm" style={{ background: 'var(--red)', color: '#fff', border: 'none' }}
                  onClick={() => alert('Please contact support@indx.app to delete your account.')}>
                  🗑️ Delete My Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
