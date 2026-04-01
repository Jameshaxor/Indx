// app/api/market/route.js
export async function GET() {
  try {
    // 1. Fetch Nifty 50 data from Yahoo Finance
    const niftyRes = await fetch(
      'https://yahoo-finance15.p.rapidapi.com/api/yahoo/quote/^NSEI',
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
      }
    );
    const niftyData = await niftyRes.json();
    
    // 2. Fetch Sensex
    const sensexRes = await fetch(
      'https://yahoo-finance15.p.rapidapi.com/api/yahoo/quote/^BSESN',
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
      }
    );
    const sensexData = await sensexRes.json();

    // 3. Fetch Nifty Bank
    const bankRes = await fetch(
      'https://yahoo-finance15.p.rapidapi.com/api/yahoo/quote/^NSEBANK',
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
      }
    );
    const bankData = await bankRes.json();

    // 4. Fetch Nifty IT
    const itRes = await fetch(
      'https://yahoo-finance15.p.rapidapi.com/api/yahoo/quote/^NSEIT',
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        },
      }
    );
    const itData = await itRes.json();

    // Helper to format numbers
    const formatNum = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

    return Response.json({
      nifty50: {
        value: formatNum(niftyData.price),
        change: niftyData.change,
        changePercent: niftyData.changePercent,
        prevClose: formatNum(niftyData.previousClose),
      },
      sensex: {
        value: formatNum(sensexData.price),
        change: sensexData.change,
        changePercent: sensexData.changePercent,
        prevClose: formatNum(sensexData.previousClose),
      },
      bank: {
        value: formatNum(bankData.price),
        change: bankData.change,
        changePercent: bankData.changePercent,
        prevClose: formatNum(bankData.previousClose),
      },
      it: {
        value: formatNum(itData.price),
        change: itData.change,
        changePercent: itData.changePercent,
        prevClose: formatNum(itData.previousClose),
      },
      news: [
        { title: "RBI keeps repo rate unchanged at 6.5%", source: "Bloomberg", time: "2h ago" },
        { title: "Tata Motors rallies 4% on strong JLR sales", source: "Moneycontrol", time: "4h ago" },
        { title: "Nifty IT index hits record high", source: "ET Markets", time: "6h ago" },
      ]
    });
  } catch (error) {
    console.error("Market API Error:", error);
    // Fallback mock data if API fails
    return Response.json({
      nifty50: { value: "22,679.40", change: "-2499.25", changePercent: "-9.93", prevClose: "25,178.65" },
      sensex: { value: "73,134.32", change: "-8152.87", changePercent: "-10.03", prevClose: "81,287.19" },
      bank: { value: "51,448.65", change: "-9080.35", changePercent: "-15.00", prevClose: "60,529.00" },
      it: { value: "11,008.05", change: "0.00", changePercent: "+0.00", prevClose: "11,008.05" },
      news: []
    });
  }
}
