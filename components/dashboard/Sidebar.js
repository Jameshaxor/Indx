'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const nav = [
  { label: 'OVERVIEW' },
  { href: '/dashboard', icon: '📊', name: 'Dashboard' },
  { href: '/dashboard/markets', icon: '📈', name: 'Markets' },
  { label: 'INVESTING' },
  { href: '/dashboard/portfolio', icon: '💼', name: 'Portfolio' },
  { href: '/dashboard/watchlist', icon: '⭐', name: 'Watchlist' },
  { href: '/dashboard/funds', icon: '🏦', name: 'Funds' },
  { label: 'INTELLIGENCE' },
  { href: '/dashboard/insights', icon: '🤖', name: 'AI Insights' },
  { href: '/dashboard/tax', icon: '📋', name: 'Tax Planner' },
  { label: 'TOOLS' },
  { href: '/dashboard/calculator', icon: '🧮', name: 'Calculator' },
  { href: '/dashboard/settings', icon: '⚙️', name: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const path = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`dash-sidebar ${open ? 'open' : ''}`} style={{
        background: 'var(--bg1)', borderRight: '1px solid var(--b0)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 18px 10px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: '#fff'
            }}>IX</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Indx</div>
              <div style={{ fontSize: 8, color: 'var(--t3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Market Intel</div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            className="hamburger"
            onClick={onClose}
            style={{ fontSize: 18 }}
          >✕</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 10px' }}>
          {nav.map((item, i) =>
            item.label ? (
              <div key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: 1.2, padding: '14px 8px 4px', textTransform: 'uppercase' }}>
                {item.label}
              </div>
            ) : (
              <Link key={i} href={item.href} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                borderRadius: 9, fontSize: 13, fontWeight: path === item.href ? 700 : 500,
                background: path === item.href ? 'var(--accent)' : 'transparent',
                color: path === item.href ? '#fff' : 'var(--t2)',
                marginBottom: 2, textDecoration: 'none',
                transition: 'all .15s'
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>{item.name}
              </Link>
            )
          )}
        </nav>

        {/* User */}
        <div style={{ padding: 14, borderTop: '1px solid var(--b0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#fff'
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <button onClick={logout} style={{
                background: 'none', border: 'none', color: 'var(--t3)',
                fontSize: 10, cursor: 'pointer', padding: 0
              }}>Sign out →</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
