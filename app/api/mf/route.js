import { mfSchemes } from '@/lib/data';
import { NextResponse } from 'next/server';

function calcRet(navs, yrs) {
  if (!navs||navs.length<2) return null;
  const cur = parseFloat(navs[0].nav);
  const tgt = new Date(); tgt.setFullYear(tgt.getFullYear()-yrs);
  let closest=null, minD=Infinity;
  for (const e of navs) { const p=e.date.split('-'); const d=new Date(p[2],p[1]-1,p[0]); const diff=Math.abs(d-tgt); if(diff<minD){minD=diff;closest=e;} }
  if (!closest||minD>30*864e5) return null;
  const old = parseFloat(closest.nav); if(old<=0) return null;
  if(yrs<=1) return Math.round(((cur-old)/old)*10000)/100;
  return Math.round((Math.pow(cur/old,1/yrs)-1)*10000)/100;
}

export async function GET() {
  try {
    const ps = mfSchemes.map(async s => {
      try {
        const r = await fetch(`https://api.mfapi.in/mf/${s.code}`, {signal:AbortSignal.timeout(10000)});
        if(!r.ok) return null; const d = await r.json();
        const navs=d.data||[], meta=d.meta||{};
        const cur = navs.length>0?parseFloat(navs[0].nav):0;
        const prev = navs.length>1?parseFloat(navs[1].nav):cur;
        return { code:s.code, name:meta.scheme_name||s.name, house:meta.fund_house||s.house, category:meta.scheme_category||'', nav:Math.round(cur*100)/100, dayChange:prev>0?Math.round(((cur-prev)/prev)*10000)/100:0, navDate:navs[0]?.date||'', ret1y:calcRet(navs,1), ret3y:calcRet(navs,3), ret5y:calcRet(navs,5), history:navs.slice(0,30).reverse().map(n=>parseFloat(n.nav)) };
      } catch { return null; }
    });
    return NextResponse.json({ funds:(await Promise.all(ps)).filter(Boolean) }, { headers:{'Cache-Control':'public, s-maxage=3600'} });
  } catch { return NextResponse.json({ funds:[] }); }
}
