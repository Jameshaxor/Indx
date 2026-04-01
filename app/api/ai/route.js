import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error:'GEMINI_API_KEY not set' }, { status:500 });
    const { marketData, portfolio } = await req.json();
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model:'gemini-1.5-flash' });

    let ctx = 'No live data.';
    if (marketData) {
      const idx = (marketData.indices||[]).map(i=>`${i.displayName}: ${i.price} (${i.change>=0?'+':''}${i.change}%)`).join(', ');
      const top = (marketData.stocks||[]).sort((a,b)=>b.change-a.change).slice(0,5).map(s=>`${s.sym} ${s.change>0?'+':''}${s.change}%`).join(', ');
      const bot = (marketData.stocks||[]).sort((a,b)=>a.change-b.change).slice(0,5).map(s=>`${s.sym} ${s.change}%`).join(', ');
      const sec = (marketData.sectors||[]).map(s=>`${s.name} ${s.change>0?'+':''}${s.change}%`).join(', ');
      ctx = `LIVE DATA (${new Date().toLocaleDateString('en-IN')}):\nIndices: ${idx}\nGainers: ${top}\nLosers: ${bot}\nSectors: ${sec}\nMarket: ${marketData.marketState||'Unknown'}`;
    }
    let pCtx = 'No portfolio.';
    if (portfolio?.length) pCtx = 'Portfolio: ' + portfolio.map(h=>`${h.sym} ${h.qty}@₹${h.avg} LTP:₹${h.ltp||h.avg}`).join(', ');

    const prompt = `You are an expert Indian stock market analyst. Analyze this REAL data:\n\n${ctx}\n\n${pCtx}\n\nGive exactly 5 actionable insights. Use actual stock names and numbers from above. Include Indian tax angles where relevant. Be specific, 2-3 sentences each.\n\nRespond ONLY with valid JSON array (no markdown):\n[{"title":"5-8 word title","text":"2-3 sentence insight","confidence":65-92,"type":"bullish/bearish/neutral","icon":"🎯 or ⚠️ or 📊 or 💰 or 🔮"}]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```')) text = text.replace(/```json?\n?/g,'').replace(/```/g,'').trim();
    return NextResponse.json({ insights:JSON.parse(text), generatedAt:new Date().toISOString() });
  } catch (e) { return NextResponse.json({ error:e.message }, { status:500 }); }
}
