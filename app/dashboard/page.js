'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchMarket, fetchNews } from '@/lib/api';
import { fmt, fmtLakh, greeting, today, spark } from '@/lib/utils';
import Chart from '@/components/dashboard/Chart';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [mkt, setMkt] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ts, setTs] = useState(null);

  const load = useCallback(async () => {
    const [m, n] = await Promise.all([fetchMarket(), fetchNews()]);
    if (m) setMkt(m); if (n) setNews(n); setTs(new Date()); setLoading(false);
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const idx = mkt?.indices || [], stk = mkt?.stocks || [], sec = mkt?.sectors || [];
  const gainers = useMemo(() => stk.filter(s=>s.change>0).sort((a,b)=>b.change-a.change).slice(0,5), [stk]);
  const losers = useMemo(() => stk.filter(s=>s.change<0).sort((a,b)=>a.change-b.change).slice(0,5), [stk]);
  const nws = news?.news || [];
  const isOpen = mkt?.marketState === 'REGULAR';

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:14}}>
      <div className="spinner"/>
      <div style={{color:'var(--t2)',fontSize:13}}>Loading live data...</div>
    </div>
  );

  return (
    <div className="page-in">
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:800}}>
            <span className="gradient-text">Good {greeting()}, {name}</span> 👋
          </h2>
          <p className="caption" style={{marginTop:3,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
            {today()} {ts && <span>· {ts.toLocaleTimeString('en-IN')}</span>}
            <span className="live"/>
            <span style={{fontSize:10,color:isOpen?'var(--green)':'var(--t3)',fontWeight:600}}>
              {isOpen?'OPEN':'CLOSED'}
            </span>
          </p>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <button className="btn btn-s btn-sm" onClick={load}>🔄 Refresh</button>
          <Link href="/dashboard/insights" className="btn btn-p btn-sm">🤖 AI Insights</Link>
        </div>
      </div>

      {/* Index Cards */}
      {idx.length>0 && (
        <div className="dash-index-grid" style={{marginBottom:16}}>
          {idx.map((i,j)=>{
            const u=i.change>=0;
            return(
              <div key={j} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <div className="caption" style={{fontWeight:500}}>{i.displayName}</div>
                    <div style={{fontSize:20,fontWeight:800,fontFamily:'var(--mono)',marginTop:2}}>
                      {i.price?.toLocaleString('en-IN',{maximumFractionDigits:2})}
                    </div>
                  </div>
                  <span className={u?'badge bg-green':'badge bg-red'}>
                    {u?'+':''}{i.change?.toFixed(2)}%
                  </span>
                </div>
                <div style={{fontSize:11,color:u?'var(--green)':'var(--red)',fontFamily:'var(--mono)'}}>
                  {u?'▲':'▼'} {Math.abs((i.price||0)-(i.prevClose||0)).toFixed(2)}
                </div>
                {i.history?.length>2 && (
                  <div style={{marginTop:6}}>
                    <Chart data={i.history} color={u?'#10b981':'#ef4444'} height={50}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sectors + Gainers + Losers */}
      <div className="dash-three-grid" style={{marginBottom:16}}>
        {/* Sectors */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span className="h-s">Sectors</span><span className="live"/>
          </div>
          <div className="dash-sector-grid">
            {sec.slice(0,12).map(s=>{
              const a=Math.abs(s.change);
              const op=Math.min(.25+a*.15,.85);
              const bg=s.change>=0
                ?`rgba(16,185,129,${op})`
                :`rgba(239,68,68,${op})`;
              return(
                <div key={s.name} className="hm" style={{background:bg}}>
                  <div style={{fontSize:9,fontWeight:600,opacity:.9}}>{s.name}</div>
                  <div style={{fontSize:11,fontWeight:800,fontFamily:'var(--mono)'}}>
                    {s.change>0?'+':''}{s.change}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gainers */}
        <div className="card">
          <div className="h-s" style={{marginBottom:8}}>🚀 Gainers</div>
          {gainers.length === 0 && <div className="caption">No gainers today</div>}
          {gainers.map(s=><SR key={s.sym} s={s}/>)}
        </div>

        {/* Losers */}
        <div className="card">
          <div className="h-s" style={{marginBottom:8}}>📉 Losers</div>
          {losers.length === 0 && <div className="caption">No losers today</div>}
          {losers.map(s=><SR key={s.sym} s={s}/>)}
        </div>
      </div>

      {/* News */}
      {nws.length>0 && (
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span className="h-s">📰 Live News</span>
            <span className="caption">Google News India</span>
          </div>
          {nws.slice(0,6).map((n,i)=>(
            <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
              className="dash-news-item"
              style={{borderBottom:i<5?'1px solid var(--b0)':'none'}}>
              <span style={{fontSize:10,color:'var(--t3)',fontFamily:'var(--mono)',minWidth:40,flexShrink:0}}>
                {n.time}
              </span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,lineHeight:1.3,marginBottom:2}}>{n.title}</div>
                <span style={{fontSize:10,color:'var(--accentT)',fontWeight:600,textTransform:'uppercase',letterSpacing:.3}}>
                  {n.source}
                </span>
                <span className="badge bg-blue" style={{marginLeft:6,fontSize:9,padding:'1px 5px'}}>
                  {n.tag}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function SR({s}){
  const u=s.change>=0;
  return(
    <div className="srow">
      <div className="sicon" style={{background:(s.color||'#666')+'20',color:s.color||'#666'}}>
        {s.sym?.slice(0,2)}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:11,fontWeight:600}}>{s.sym}</div>
        <div style={{fontSize:9,color:'var(--t3)'}}>{s.sector}</div>
      </div>
      <div style={{textAlign:'right'}}>
        <div style={{fontSize:11,fontWeight:700,fontFamily:'var(--mono)'}}>{fmt(s.price)}</div>
        <div style={{fontSize:10,fontFamily:'var(--mono)',color:u?'var(--green)':'var(--red)'}}>
          {u?'+':''}{s.change}%
        </div>
      </div>
    </div>
  );
}
