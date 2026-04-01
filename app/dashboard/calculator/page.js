'use client';
import { useState, useMemo } from 'react';
import { fmtLakh } from '@/lib/utils';

export default function CalculatorPage() {
  const [tab, setTab] = useState('sip');

  // SIP
  const [sipAmt, setSipAmt] = useState(10000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  const [sipStep, setSipStep] = useState(10);

  // Lumpsum
  const [lsAmt, setLsAmt] = useState(500000);
  const [lsRate, setLsRate] = useState(12);
  const [lsYears, setLsYears] = useState(10);

  // EMI
  const [emiPrincipal, setEmiPrincipal] = useState(5000000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiYears, setEmiYears] = useState(20);

  // FD
  const [fdAmt, setFdAmt] = useState(500000);
  const [fdRate, setFdRate] = useState(7);
  const [fdYears, setFdYears] = useState(5);
  const [fdFreq, setFdFreq] = useState(4);

  const sipResult = useMemo(() => {
    const r = sipRate / 100 / 12;
    const n = sipYears * 12;
    const invested = sipAmt * n;
    const fv = sipAmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    // Step-up SIP
    let stepFv = 0, stepInvested = 0, annualAmt = sipAmt;
    for (let y = 0; y < sipYears; y++) {
      for (let m = 0; m < 12; m++) {
        stepInvested += annualAmt;
        stepFv = (stepFv + annualAmt) * (1 + r);
      }
      annualAmt = annualAmt * (1 + sipStep / 100);
    }
    // Yearly breakdown
    const yearly = [];
    let cumInv = 0, cumVal = 0;
    for (let y = 1; y <= sipYears; y++) {
      cumInv = sipAmt * y * 12;
      const rr = sipRate / 100 / 12;
      const nn = y * 12;
      cumVal = sipAmt * ((Math.pow(1 + rr, nn) - 1) / rr) * (1 + rr);
      yearly.push({ year: y, invested: cumInv, value: cumVal });
    }
    return { invested, fv, wealth: fv - invested, stepFv, stepInvested, stepWealth: stepFv - stepInvested, yearly };
  }, [sipAmt, sipRate, sipYears, sipStep]);

  const lsResult = useMemo(() => {
    const fv = lsAmt * Math.pow(1 + lsRate / 100, lsYears);
    const yearly = [];
    for (let y = 1; y <= lsYears; y++) {
      yearly.push({ year: y, value: lsAmt * Math.pow(1 + lsRate / 100, y) });
    }
    return { fv, wealth: fv - lsAmt, yearly };
  }, [lsAmt, lsRate, lsYears]);

  const emiResult = useMemo(() => {
    const r = emiRate / 100 / 12;
    const n = emiYears * 12;
    const emi = emiPrincipal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPay = emi * n;
    const totalInt = totalPay - emiPrincipal;
    return { emi, totalPay, totalInt };
  }, [emiPrincipal, emiRate, emiYears]);

  const fdResult = useMemo(() => {
    const maturity = fdAmt * Math.pow(1 + fdRate / 100 / fdFreq, fdFreq * fdYears);
    const interest = maturity - fdAmt;
    return { maturity, interest };
  }, [fdAmt, fdRate, fdYears, fdFreq]);

  const tabs = [
    { id: 'sip', emoji: '📈', label: 'SIP' },
    { id: 'lumpsum', emoji: '💰', label: 'Lumpsum' },
    { id: 'emi', emoji: '🏠', label: 'EMI' },
    { id: 'fd', emoji: '🏦', label: 'FD' },
  ];

  return (
    <div className="page-in">
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Calculator</span></h2>
        <p className="caption" style={{ marginTop: 3 }}>Financial planning tools for Indian investors</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg1)', borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === t.id ? 'var(--accent)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--t2)',
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* SIP */}
      {tab === 'sip' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>📈 SIP Calculator</div>
            <Slider label={`Monthly SIP: ₹${sipAmt.toLocaleString()}`} min={500} max={200000} step={500} value={sipAmt} onChange={setSipAmt} />
            <Slider label={`Expected Returns: ${sipRate}%`} min={1} max={30} step={0.5} value={sipRate} onChange={setSipRate} />
            <Slider label={`Duration: ${sipYears} years`} min={1} max={40} step={1} value={sipYears} onChange={setSipYears} />
            <Slider label={`Annual Step-up: ${sipStep}%`} min={0} max={25} step={1} value={sipStep} onChange={setSipStep} />
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <ResultBox label="Invested" value={fmtLakh(sipResult.invested)} />
              <ResultBox label="Est. Value" value={fmtLakh(sipResult.fv)} color="var(--green)" />
              <ResultBox label="Wealth Gain" value={fmtLakh(sipResult.wealth)} color="var(--green)" />
              <ResultBox label="Multiplier" value={`${(sipResult.fv / sipResult.invested).toFixed(1)}x`} color="var(--accent)" />
            </div>
            <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, marginBottom: 10 }}>
              <div className="caption" style={{ marginBottom: 4 }}>With {sipStep}% annual step-up:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11 }}>Invested: <b>{fmtLakh(sipResult.stepInvested)}</b></span>
                <span style={{ fontSize: 11, color: 'var(--green)' }}>Value: <b>{fmtLakh(sipResult.stepFv)}</b></span>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="caption" style={{ marginBottom: 6 }}>Growth Over Time</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
              {sipResult.yearly.map((y, i) => {
                const maxVal = sipResult.yearly[sipResult.yearly.length - 1].value;
                const h = (y.value / maxVal) * 100;
                const invH = (y.invested / maxVal) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }} title={`Y${y.year}: ${fmtLakh(y.value)}`}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 80 }}>
                      <div style={{ height: `${h}%`, background: 'var(--accent)', borderRadius: '2px 2px 0 0', minHeight: 2, position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${invH / h * 100}%`, background: 'var(--b0)', borderRadius: '0 0 0 0' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--t3)', marginTop: 3 }}>
              <span>Y1</span><span>Y{sipYears}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lumpsum */}
      {tab === 'lumpsum' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>💰 Lumpsum Calculator</div>
            <Slider label={`Investment: ₹${lsAmt.toLocaleString()}`} min={10000} max={10000000} step={10000} value={lsAmt} onChange={setLsAmt} />
            <Slider label={`Expected Returns: ${lsRate}%`} min={1} max={30} step={0.5} value={lsRate} onChange={setLsRate} />
            <Slider label={`Duration: ${lsYears} years`} min={1} max={40} step={1} value={lsYears} onChange={setLsYears} />
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <ResultBox label="Invested" value={fmtLakh(lsAmt)} />
              <ResultBox label="Est. Value" value={fmtLakh(lsResult.fv)} color="var(--green)" />
              <ResultBox label="Wealth Gain" value={fmtLakh(lsResult.wealth)} color="var(--green)" />
              <ResultBox label="Multiplier" value={`${(lsResult.fv / lsAmt).toFixed(1)}x`} color="var(--accent)" />
            </div>
          </div>
        </div>
      )}

      {/* EMI */}
      {tab === 'emi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>🏠 EMI Calculator</div>
            <Slider label={`Loan Amount: ₹${emiPrincipal.toLocaleString()}`} min={100000} max={50000000} step={100000} value={emiPrincipal} onChange={setEmiPrincipal} />
            <Slider label={`Interest Rate: ${emiRate}%`} min={5} max={20} step={0.1} value={emiRate} onChange={setEmiRate} />
            <Slider label={`Tenure: ${emiYears} years`} min={1} max={30} step={1} value={emiYears} onChange={setEmiYears} />
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <ResultBox label="Monthly EMI" value={`₹${Math.round(emiResult.emi).toLocaleString()}`} color="var(--accent)" />
              <ResultBox label="Total Payment" value={fmtLakh(emiResult.totalPay)} />
              <ResultBox label="Principal" value={fmtLakh(emiPrincipal)} color="var(--green)" />
              <ResultBox label="Total Interest" value={fmtLakh(emiResult.totalInt)} color="var(--red)" />
            </div>
            {/* Pie-like visualization */}
            <div className="caption" style={{ marginBottom: 6 }}>Payment Breakdown</div>
            <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(emiPrincipal / emiResult.totalPay) * 100}%`, background: 'var(--green)' }} />
              <div style={{ flex: 1, background: 'var(--red)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4, color: 'var(--t3)' }}>
              <span>🟢 Principal ({((emiPrincipal / emiResult.totalPay) * 100).toFixed(0)}%)</span>
              <span>🔴 Interest ({((emiResult.totalInt / emiResult.totalPay) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* FD */}
      {tab === 'fd' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>🏦 FD Calculator</div>
            <Slider label={`Deposit: ₹${fdAmt.toLocaleString()}`} min={10000} max={10000000} step={10000} value={fdAmt} onChange={setFdAmt} />
            <Slider label={`Interest Rate: ${fdRate}%`} min={3} max={12} step={0.1} value={fdRate} onChange={setFdRate} />
            <Slider label={`Duration: ${fdYears} years`} min={1} max={10} step={1} value={fdYears} onChange={setFdYears} />
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Compounding</label>
              <select className="input" value={fdFreq} onChange={e => setFdFreq(+e.target.value)}>
                <option value={1}>Yearly</option>
                <option value={2}>Half-Yearly</option>
                <option value={4}>Quarterly</option>
                <option value={12}>Monthly</option>
              </select>
            </div>
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <ResultBox label="Deposit" value={fmtLakh(fdAmt)} />
              <ResultBox label="Maturity" value={fmtLakh(fdResult.maturity)} color="var(--green)" />
              <ResultBox label="Interest Earned" value={fmtLakh(fdResult.interest)} color="var(--green)" />
              <ResultBox label="Effective Rate" value={`${((Math.pow(fdResult.maturity / fdAmt, 1 / fdYears) - 1) * 100).toFixed(2)}%`} color="var(--accent)" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="caption" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ width: '100%' }} />
    </div>
  );
}

function ResultBox({ label, value, color }) {
  return (
    <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
      <div className="caption">{label}</div>
      <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14, color: color || 'var(--t1)', marginTop: 2 }}>{value}</div>
    </div>
  );
}
