'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { initials } from '@/lib/utils';

const nav = [
  { s:'Overview', items:[{h:'/dashboard',i:'📊',l:'Dashboard'},{h:'/dashboard/markets',i:'📈',l:'Markets'}] },
  { s:'Investing', items:[{h:'/dashboard/portfolio',i:'💼',l:'Portfolio'},{h:'/dashboard/watchlist',i:'⭐',l:'Watchlist'},{h:'/dashboard/funds',i:'🏦',l:'Funds'}] },
  { s:'Intelligence', items:[{h:'/dashboard/insights',i:'🤖',l:'AI Insights'},{h:'/dashboard/tax',i:'🧾',l:'Tax Planner'}] },
  { s:'Tools', items:[{h:'/dashboard/calculator',i:'🧮',l:'Calculator'},{h:'/dashboard/settings',i:'⚙️',l:'Settings'}] },
];

export default function Sidebar() {
  const path = usePathname();
  const { user, logout } = useAuth();
  return (
    <aside className="dash-side">
      <div style={{padding:'14px 14px 12px',display:'flex',alignItems:'center',gap:8,borderBottom:'1px solid var(--b0)'}}>
        <div className="nav-mark" style={{width:28,height:28,fontSize:11,borderRadius:6}}>IX</div>
        <div><div className="gradient-text" style={{fontSize:13,fontWeight:700,lineHeight:1}}>Indx</div><div style={{fontSize:8,color:'var(--t4)',letterSpacing:1.5,textTransform:'uppercase',marginTop:1}}>Market Intel</div></div>
      </div>
      <nav style={{flex:1,overflowY:'auto',padding:'6px 8px'}}>
        {nav.map(s=><div key={s.s}><div className="side-sec">{s.s}</div>
          {s.items.map(it=><Link key={it.h} href={it.h} className={`side-link ${path===it.h?'on':''}`}><span style={{fontSize:14,width:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{it.i}</span>{it.l}</Link>)}
        </div>)}
      </nav>
      <div onClick={logout} style={{padding:'10px 12px',borderTop:'1px solid var(--b0)',display:'flex',alignItems:'center',gap:8,cursor:'pointer',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,var(--accent),#ec4899)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:10,color:'#fff',flexShrink:0}}>{user?initials(user.name):'??'}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name||'User'}</div><div style={{fontSize:9,color:'var(--t4)'}}>Sign out →</div></div>
      </div>
    </aside>
  );
}
