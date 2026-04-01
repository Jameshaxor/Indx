'use client';
import { useState, useMemo } from 'react';
import { fmtLakh } from '@/lib/utils';

export default function TaxPage() {
  const [tab, setTab] = useState('cg');

  // Capital Gains
  const [buyPrice, setBuyPrice] = useState(100000);
  const [sellPrice, setSellPrice] = useState(150000);
  const [holdMonths, setHoldMonths] = useState(18);
  const [assetType, setAssetType] = useState('equity');

  // Income Tax
  const [salary, setSalary] = useState(1200000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [deductions80C, setDeductions80C] = useState(150000);
  const [deductions80D, setDeductions80D] = useState(25000);
  const [hra, setHra] = useState(0);
  const [regime, setRegime] = useState('new');

  const cgResult = useMemo(() => {
    const gain = sellPrice - buyPrice;
    if (gain <= 0) return { gain, tax: 0, type: 'No Gain', rate: 0, net: sellPrice };

    let isLong, rate, exemption = 0, taxable, tax;

    if (assetType === 'equity') {
      isLong = holdMonths >= 12;
      if (isLong) {
        rate = 12.5; // Updated LTCG rate
        exemption = 125000; // ₹1.25L exemption
        taxable = Math.max(gain - exemption, 0);
        tax = taxable * rate / 100;
      } else {
        rate = 20; // STCG
        taxable = gain;
        tax = taxable * rate / 100;
      }
    } else if (assetType === 'debt') {
      isLong = holdMonths >= 36;
      // Post-2023: Debt funds taxed at slab rate regardless
      rate = 30; // Assuming highest slab
      taxable = gain;
      tax = taxable * rate / 100;
    } else {
      isLong = holdMonths >= 24;
      if (isLong) {
        rate = 20; // With indexation benefit
        taxable = gain * 0.7; // Approximate indexation
        tax = taxable * rate / 100;
      } else {
        rate = 30;
        taxable = gain;
        tax = taxable * rate / 100;
      }
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      gain, isLong,
      type: isLong ? 'Long Term (LTCG)' : 'Short Term (STCG)',
      rate, exemption, taxable: taxable || gain, tax: totalTax,
      net: sellPrice - totalTax, effectiveRate: (totalTax / gain * 100)
    };
  }, [buyPrice, sellPrice, holdMonths, assetType]);

  const taxResult = useMemo(() => {
    const gross = salary + otherIncome;

    if (regime === 'new') {
      // New regime FY 2024-25
      const std = 75000;
      const taxable = Math.max(gross - std, 0);
      let tax = 0;
      const slabs = [
        { upto: 300000, rate: 0 },
        { upto: 700000, rate: 5 },
        { upto: 1000000, rate: 10 },
        { upto: 1200000, rate: 15 },
        { upto: 1500000, rate: 20 },
        { upto: Infinity, rate: 30 },
      ];
      let remaining = taxable;
      let prev = 0;
      const breakdown = [];
      for (const slab of slabs) {
        const slabAmt = Math.min(remaining, slab.upto - prev);
        if (slabAmt <= 0) break;
        const slabTax = slabAmt * slab.rate / 100;
        tax += slabTax;
        breakdown.push({ range: `${fmtLakh(prev)} - ${slab.upto === Infinity ? '∞' : fmtLakh(slab.upto)}`, rate: slab.rate, amount: slabAmt, tax: slabTax });
        remaining -= slabAmt;
        prev = slab.upto;
      }
      // Section 87A rebate
      if (taxable <= 700000) tax = 0;
      const cess = tax * 0.04;
      return { taxable, tax, cess, total: tax + cess, effective: gross > 0 ? ((tax + cess) / gross * 100) : 0, breakdown, regime: 'New' };
    } else {
      // Old regime
      const totalDeductions = Math.min(deductions80C, 150000) + Math.min(deductions80D, 75000) + hra;
      const taxable = Math.max(gross - 50000 - totalDeductions, 0); // 50k standard deduction
      let tax = 0;
      const slabs = [
        { upto: 250000, rate: 0 },
        { upto: 500000, rate: 5 },
        { upto: 1000000, rate: 20 },
        { upto: Infinity, rate: 30 },
      ];
      let remaining = taxable;
      let prev = 0;
      const breakdown = [];
      for (const slab of slabs) {
        const slabAmt = Math.min(remaining, slab.upto - prev);
        if (slabAmt <= 0) break;
        const slabTax = slabAmt * slab.rate / 100;
        tax += slabTax;
        breakdown.push({ range: `${fmtLakh(prev)} - ${slab.upto === Infinity ? '∞' : fmtLakh(slab.upto)}`, rate: slab.rate, amount: slabAmt, tax: slabTax });
        remaining -= slabAmt;
        prev = slab.upto;
      }
      if (taxable <= 500000) tax = 0;
      const cess = tax * 0.04;
      return { taxable, tax, cess, total: tax + cess, effective: gross > 0 ? ((tax + cess) / gross * 100) : 0, breakdown, totalDeductions, regime: 'Old' };
    }
  }, [salary, otherIncome, deductions80C, deductions80D, hra, regime]);

  return (
    <div className="page-in">
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}><span className="gradient-text">Tax Calculator</span></h2>
        <p className="caption" style={{ marginTop: 3 }}>Indian tax planning tools · FY 2024-25</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg1)', borderRadius: 10, padding: 4 }}>
        {[{ id: 'cg', label: '📊 Capital Gains' }, { id: 'income', label: '💼 Income Tax' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === t.id ? 'var(--accent)' : 'transparent',
            color: tab === t.id ? '#fff' : 'var(--t2)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Capital Gains */}
      {tab === 'cg' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>📊 Capital Gains Tax</div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Asset Type</label>
              <select className="input" value={assetType} onChange={e => setAssetType(e.target.value)}>
                <option value="equity">Equity / Equity MF</option>
                <option value="debt">Debt MF / Bonds</option>
                <option value="property">Property / Gold</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Buy Price: ₹{buyPrice.toLocaleString()}</label>
              <input type="range" min={10000} max={10000000} step={10000} value={buyPrice} onChange={e => setBuyPrice(+e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Sell Price: ₹{sellPrice.toLocaleString()}</label>
              <input type="range" min={10000} max={10000000} step={10000} value={sellPrice} onChange={e => setSellPrice(+e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Holding Period: {holdMonths} months</label>
              <input type="range" min={1} max={120} step={1} value={holdMonths} onChange={e => setHoldMonths(+e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>Results</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Capital Gain</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14, color: cgResult.gain >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {fmtLakh(cgResult.gain)}
                </div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Type</div>
                <span className={cgResult.isLong ? 'badge bg-green' : 'badge bg-amber'} style={{ fontSize: 10 }}>
                  {cgResult.type}
                </span>
              </div>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Tax Rate</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14 }}>{cgResult.rate}%</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Tax Payable</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--red)' }}>{fmtLakh(cgResult.tax)}</div>
              </div>
            </div>
            {cgResult.exemption > 0 && (
              <div style={{ padding: 8, background: 'rgba(16,185,129,0.1)', borderRadius: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--green)' }}>✅ LTCG exemption of ₹{cgResult.exemption.toLocaleString()} applied</span>
              </div>
            )}
            <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
              <div className="caption">Net Proceeds (After Tax)</div>
              <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--green)' }}>{fmtLakh(cgResult.net)}</div>
            </div>
            <div className="caption" style={{ marginTop: 10 }}>
              *Includes 4% Health & Education Cess. Surcharge not included. Consult a CA for exact calculations.
            </div>
          </div>
        </div>
      )}

      {/* Income Tax */}
      {tab === 'income' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>💼 Income Tax Calculator</div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Tax Regime</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['new', 'old'].map(r => (
                  <button key={r} onClick={() => setRegime(r)} className={`btn ${regime === r ? 'btn-p' : 'btn-s'} btn-sm`} style={{ flex: 1 }}>
                    {r === 'new' ? '🆕 New Regime' : '📋 Old Regime'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Annual Salary: ₹{salary.toLocaleString()}</label>
              <input type="range" min={300000} max={10000000} step={50000} value={salary} onChange={e => setSalary(+e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="caption" style={{ display: 'block', marginBottom: 4 }}>Other Income: ₹{otherIncome.toLocaleString()}</label>
              <input type="range" min={0} max={2000000} step={10000} value={otherIncome} onChange={e => setOtherIncome(+e.target.value)} style={{ width: '100%' }} />
            </div>
            {regime === 'old' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label className="caption" style={{ display: 'block', marginBottom: 4 }}>80C (PPF, ELSS etc): ₹{deductions80C.toLocaleString()}</label>
                  <input type="range" min={0} max={150000} step={10000} value={deductions80C} onChange={e => setDeductions80C(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="caption" style={{ display: 'block', marginBottom: 4 }}>80D (Health Ins): ₹{deductions80D.toLocaleString()}</label>
                  <input type="range" min={0} max={75000} step={5000} value={deductions80D} onChange={e => setDeductions80D(+e.target.value)} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="caption" style={{ display: 'block', marginBottom: 4 }}>HRA Exemption: ₹{hra.toLocaleString()}</label>
                  <input type="range" min={0} max={500000} step={10000} value={hra} onChange={e => setHra(+e.target.value)} style={{ width: '100%' }} />
                </div>
              </>
            )}
          </div>
          <div className="card">
            <div className="h-s" style={{ marginBottom: 14 }}>Results ({taxResult.regime} Regime)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Gross Income</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 13 }}>{fmtLakh(salary + otherIncome)}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Taxable Income</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 13 }}>{fmtLakh(taxResult.taxable)}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Tax + Cess</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--red)' }}>{fmtLakh(taxResult.total)}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center' }}>
                <div className="caption">Effective Rate</div>
                <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 14 }}>{taxResult.effective.toFixed(1)}%</div>
              </div>
            </div>
            <div style={{ padding: 10, background: 'var(--bg0)', borderRadius: 8, textAlign: 'center', marginBottom: 14 }}>
              <div className="caption">Monthly Take-Home (Approx)</div>
              <div style={{ fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--green)' }}>
                ₹{Math.round(((salary + otherIncome) - taxResult.total) / 12).toLocaleString()}
              </div>
            </div>
            <div className="caption" style={{ marginBottom: 6 }}>Slab Breakdown</div>
            <table className="dtable">
              <thead>
                <tr>
                  <th>Slab</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Tax</th>
                </tr>
              </thead>
              <tbody>
                {taxResult.breakdown?.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 10 }}>{s.range}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{s.rate}%</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtLakh(s.amount)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, color: s.tax > 0 ? 'var(--red)' : 'var(--t3)' }}>{fmtLakh(s.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
