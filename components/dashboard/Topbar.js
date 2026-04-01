'use client';
import { useState, useEffect } from 'react';
import { fetchMarket } from '@/lib/api';

export default function Topbar() {
  const [idx, setIdx] = useState([]);
  useEffect(() => { fetchMarket().then(d => { if(d?.indices) setIdx(d.indices); }); }, []);
  return (
    <header className="dash-top">
      <div style={{flex:1,maxWidth:340,position:'relative'}}>
        <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--t4)',fontSize:12}}>🔍</span>
        <input className="input" placeholder="Search..." style={{paddingLeft:30,fontSize:12,height:34,background:'var(--bg2)'}} />
      </div>
      <div className="hide-m" style={{display:'flex',alignItems:'center',gap:14,marginLeft:'auto'}}>
        {idx.slice(0,3).map((i,j)=>{const u=i.change>=0;return(
          <div key={j} style={{display:'flex',alignItems:'center',gap:5,fontSize:11}}>
            <span style={{color:'var(--t3)',fontWeight:500}}>{i.displayName}</span>
            <span style={{fontWeight:600,fontFamily:'var(--mono)',fontSize:11}}>{i.price?.toLocaleString('en-IN',{maximumFractionDigits:0})}</span>
            <span className={u?'badge bg-green':'badge bg-red'} style={{fontSize:9,padding:'1px 5px'}}>{u?'+':''}{i.change?.toFixed(2)}%</span>
          </div>
        )})}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:5,marginLeft:idx.length?14:'auto'}}><div className="live"/><span style={{fontSize:10,color:'var(--green)',fontWeight:600}}>LIVE</span></div>
    </header>
  );
}
