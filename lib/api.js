export async function fetchMarket() {
  try { const r = await fetch('/api/market'); return r.ok ? r.json() : null; } catch { return null; }
}
export async function fetchNews() {
  try { const r = await fetch('/api/news'); return r.ok ? r.json() : null; } catch { return null; }
}
export async function fetchFunds() {
  try { const r = await fetch('/api/mf'); return r.ok ? r.json() : null; } catch { return null; }
}
export async function fetchAI(marketData, portfolio) {
  try {
    const r = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ marketData, portfolio }) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}
