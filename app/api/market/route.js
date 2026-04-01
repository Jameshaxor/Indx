import { stockMeta, indexSymbols } from '@/lib/data';
import { NextResponse } from 'next/server';

async function yf(sym) {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1mo`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) return null;
    const j = await r.json(), m = j.chart?.result?.[0]?.meta;
    if (!m) return null;
    const closes = (j.chart.result[0].indicators?.quote?.[0]?.close||[]).filter(c=>c!=null);
    const price = m.regularMarketPrice, prev = m.chartPreviousClose||m.previousClose||price;
    return { price: Math.round(price*100)/100, change: Math.round(((price-prev)/prev)*10000)/100, prevClose: Math.round(prev*100)/100, dayHigh:m.regularMarketDayHigh, dayLow:m.regularMarketDayLow, w52H:m.fiftyTwoWeekHigh, w52L:m.fiftyTwoWeekLow, vol:m.regularMarketVolume, history:closes.slice(-30), state:m.marketState };
  } catch { return null; }
}

export async function GET() {
  try {
    const idxP = indexSymbols.map(async i => { const d = await yf(i.symbol); return d ? { ...d, displayName:i.name } : null; });
    const stkP = Object.entries(stockMeta).map(async ([yahoo, meta]) => {
      const d = await yf(yahoo);
      return d ? { sym:meta.sym, name:meta.name, sector:meta.sector, color:meta.color, ...d } : null;
    });
    const [indices, stocks] = await Promise.all([Promise.all(idxP), Promise.all(stkP)]);
    const idx = indices.filter(Boolean), stk = stocks.filter(Boolean);
    const secMap = {};
    stk.forEach(s => { if (!secMap[s.sector]) secMap[s.sector] = []; secMap[s.sector].push(s.change); });
    const sectors = Object.entries(secMap).map(([n,c]) => ({ name:n, change: Math.round((c.reduce((a,v)=>a+v,0)/c.length)*100)/100 })).sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));
    return NextResponse.json({ indices:idx, stocks:stk, sectors, marketState:idx[0]?.state||'CLOSED', lastUpdated:new Date().toISOString() }, { headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=120'} });
  } catch (e) { return NextResponse.json({ error:e.message }, { status:500 }); }
}
