import { stockMeta, indexSymbols } from '@/lib/data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function yf(sym) {
  try {
    const res = await fetch(
      `https://yahoo-finance15.p.rapidapi.com/api/yahoo/quote/${sym}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
        next: { revalidate: 60 }
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      price: Math.round(data.price * 100) / 100,
      change: Math.round(data.changePercent * 100) / 100,
      prevClose: Math.round(data.previousClose * 100) / 100,
      dayHigh: data.dayHigh,
      dayLow: data.dayLow,
      history: []
    };

  } catch {
    return null;
  }
}

export async function GET() {
  try {

    // ✅ Run ALL requests IN PARALLEL (not one after another)
    const indexPromises = indexSymbols.map(async i => {
      const d = await yf(i.symbol);
      return d ? { ...d, displayName: i.name } : null;
    });

    const stockPromises = Object.entries(stockMeta).map(async ([yahoo, meta]) => {
      const d = await yf(yahoo);
      return d ? { sym: meta.sym, name: meta.name, sector: meta.sector, color: meta.color, ...d } : null;
    });

    const [indices, stocks] = await Promise.all([
      Promise.all(indexPromises),
      Promise.all(stockPromises)
    ]);

    // Filter out failed requests
    const idx = indices.filter(Boolean);
    const stk = stocks.filter(Boolean);

    // Calculate sector averages
    const secMap = {};
    stk.forEach(s => {
      if (!secMap[s.sector]) secMap[s.sector] = [];
      secMap[s.sector].push(s.change);
    });
    const sectors = Object.entries(secMap).map(([n,c]) => ({
      name:n,
      change: Math.round((c.reduce((a,v)=>a+v,0)/c.length)*100)/100
    })).sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));

    const marketState = idx[0]?.state || 'CLOSED';

    return NextResponse.json({
      indices: idx,
      stocks: stk,
      sectors,
      marketState,
      lastUpdated: new Date().toISOString()
    }, {
      headers:{'Cache-Control':'public, s-maxage=60, stale-while-revalidate=120'}
    });

  } catch (e) {
    console.error("Market API Error:", e);
    return NextResponse.json({
      indices: [],
      stocks: [],
      sectors: [],
      marketState: 'CLOSED',
      error: e.message
    }, { status: 500 });
  }
}
