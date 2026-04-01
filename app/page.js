'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const FEATURES = [
  { icon:'📊', t:'Portfolio X-Ray', d:'XIRR, sector allocation, and real-time P&L. Connect Zerodha or Upstox via OAuth — your passwords never touch our servers.' },
  { icon:'🤖', t:'Gemini AI Analyst', d:'Google Gemini analyzes live NIFTY data, FII flows, and your portfolio to generate actionable insights with confidence scores.' },
  { icon:'🧾', t:'Tax Optimizer', d:'Track 80C/80D utilization. Get loss-harvesting suggestions. Compare old vs new regime based on your actual deductions.' },
  { icon:'📈', t:'Live Market Data', d:'Real prices from Yahoo Finance. Sector heatmaps calculated from actual stock movements. Auto-refreshes every 60 seconds.' },
  { icon:'🏦', t:'Mutual Fund Lab', d:'Live NAVs from MFAPI.in. 1Y/3Y/5Y CAGR calculated from real historical data. 30-day trend charts for every scheme.' },
  { icon:'🧮', t:'SIP Calculator', d:'Interactive sliders with step-up projection. See exactly where your money will be in 10, 20, 30 years with real return assumptions.' },
];

const FAQS = [
  { q:'Where does the market data come from?', a:'Stock prices come from Yahoo Finance (15-min delayed for free tier). Mutual fund NAVs come from MFAPI.in (official AMFI data). News is parsed from Google News India RSS.' },
  { q:'How does the AI analysis work?', a:'We send live market data (indices, stock prices, sectors) and your portfolio to Google Gemini 1.5 Flash. It generates insights with confidence scores. Your data is not stored by Google.' },
  { q:'Is my data safe?', a:'Authentication is handled by Firebase (Google). Portfolio data is stored in Firestore with per-user security rules — only you can read your own data. Broker connections use OAuth tokens.' },
  { q:'Can I cancel anytime?', a:'Yes. One click. No questions, no hidden fees. Free plan has no time limit.' },
  { q:'Is this SEBI-registered investment advice?', a:'No. Indx is a research and analytics tool. AI insights are informational, not personalized financial advice. Always do your own research.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(e => e.forEach(x => { if (x.isIntersecting) x.target.classList.add('v'); }), { threshold:.12, rootMargin:'0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const h = e => document.querySelectorAll('.card-glow').forEach(c => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--gx',(e.clientX-r.left)+'px');
      c.style.setProperty('--gy',(e.clientY-r.top)+'px');
    });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const cta = user ? '/dashboard' : '/auth';
  const ctaT = user ? 'Open Dashboard' : 'Get Started Free';

  return (
    <>
      <nav className={`site-nav ${scrolled?'scrolled':''}`}>
        <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:'100%',maxWidth:1120,margin:'0 auto',padding:'0 24px'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:8,fontWeight:800,fontSize:'1.05rem',letterSpacing:'-0.03em'}}>
            <div className="nav-mark">IX</div>Indx
          </Link>
          <div className="hide-m" style={{display:'flex',gap:24}}>
            <a href="#features" style={{fontSize:13,color:'var(--t2)',fontWeight:500,transition:'color .15s'}} onMouseEnter={e=>e.target.style.color='var(--t0)'} onMouseLeave={e=>e.target.style.color='var(--t2)'}>Features</a>
            <a href="#pricing" style={{fontSize:13,color:'var(--t2)',fontWeight:500,transition:'color .15s'}} onMouseEnter={e=>e.target.style.color='var(--t0)'} onMouseLeave={e=>e.target.style.color='var(--t2)'}>Pricing</a>
            <a href="#faq" style={{fontSize:13,color:'var(--t2)',fontWeight:500,transition:'color .15s'}} onMouseEnter={e=>e.target.style.color='var(--t0)'} onMouseLeave={e=>e.target.style.color='var(--t2)'}>FAQ</a>
          </div>
          <div style={{display:'flex',gap:8}}>
            {!user && <Link href="/auth" className="btn btn-g hide-m">Sign in</Link>}
            <Link href={cta} className="btn btn-p btn-sm">{ctaT} →</Link>
          </div>
        </div>
      </nav>

      <section style={{padding:'140px 0 80px',position:'relative',overflow:'hidden'}}>
        <div className="orb" style={{width:500,height:500,background:'rgba(124,92,231,.08)',top:-100,left:'20%'}} />
        <div className="orb" style={{width:400,height:400,background:'rgba(167,139,250,.05)',top:200,right:'10%',animationDelay:'-7s'}} />
        <div className="container" style={{maxWidth:1120,margin:'0 auto',padding:'0 24px',position:'relative',zIndex:1}}>
          <div className="reveal" style={{marginBottom:20}}>
            <span className="badge bg-purple" style={{padding:'5px 12px',fontSize:12,borderRadius:100,border:'1px solid rgba(124,92,231,.12)'}}>Live NSE/BSE data · Gemini AI</span>
          </div>
          <h1 className="h-xl reveal" style={{maxWidth:680}}>Indian markets,<br/>decoded by <span className="gradient-text">intelligence.</span></h1>
          <p className="body-l reveal" style={{maxWidth:500,marginTop:16,marginBottom:32}}>Real-time stock data, AI-powered insights, and tax optimization — purpose-built for NIFTY, SENSEX, and Indian mutual funds.</p>
          <div className="reveal" style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <Link href={cta} className="btn btn-p btn-lg">{ctaT} →</Link>
            <a href="#features" className="btn btn-s btn-lg">See what&apos;s inside</a>
          </div>
          <div className="reveal caption" style={{marginTop:10}}>Free plan · No credit card · 2 min setup</div>
        </div>
      </section>

      <section style={{padding:'36px 0',borderTop:'1px solid var(--b0)',borderBottom:'1px solid var(--b0)'}}>
        <div className="container" style={{maxWidth:1120,margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,textAlign:'center'}}>
          {[['25+','Live NSE stocks'],['10','MF schemes tracked'],['~60s','Data refresh rate'],['Free','Gemini AI built-in']].map(([n,l],i)=>(
            <div key={i} className={`reveal rd${i+1}`}><div style={{fontSize:'1.5rem',fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-0.03em'}}>{n}</div><div className="caption" style={{marginTop:4}}>{l}</div></div>
          ))}
        </div>
      </section>

      <section className="section" id="features" style={{padding:'100px 0'}}>
        <div className="container" style={{maxWidth:1120,margin:'0 auto',padding:'0 24px'}}>
          <div className="reveal" style={{textAlign:'center',marginBottom:48}}>
            <div className="overline" style={{marginBottom:10}}>Features</div>
            <h2 className="h-l">Built for how Indians actually invest.</h2>
            <p className="body-l" style={{maxWidth:460,margin:'14px auto 0'}}>Not a generic finance app. Every feature uses real Indian market data and tax rules.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
            {FEATURES.map((f,i)=>(
              <div key={i} className={`card card-glow reveal rd${Math.min(i+1,5)}`} style={{padding:24,transition:'border-color .25s,box-shadow .25s,transform .25s',cursor:'default'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.boxShadow='0 4px 24px rgba(0,0,0,.3)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b0)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{width:40,height:40,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',background:'var(--accentM)',border:'1px solid rgba(124,92,231,.08)',marginBottom:16}}>{f.icon}</div>
                <h3 className="h-s" style={{marginBottom:6}}>{f.t}</h3>
                <p className="body-s">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{padding:'100px 0',background:'var(--bg1)'}}>
        <div className="container" style={{maxWidth:900,margin:'0 auto',padding:'0 24px'}}>
          <div className="reveal" style={{textAlign:'center',marginBottom:40}}>
            <div className="overline" style={{marginBottom:10}}>Pricing</div>
            <h2 className="h-l">Simple pricing. Start free.</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
            {[
              {plan:'Free',price:'₹0',sub:'forever',features:['5 watchlist stocks','Market overview','SIP calculator','Basic screener','5 news articles']},
              {plan:'Pro',price:'₹499',sub:'/month',featured:true,features:['Unlimited watchlist','AI insights (Gemini)','Portfolio analytics','Tax optimizer','Price alerts','Full news feed','Broker integration']},
              {plan:'Team',price:'₹1,999',sub:'/month',features:['Everything in Pro','Multi-portfolio','API access','Export reports','Priority support']},
            ].map((p,i)=>(
              <div key={i} className={`card reveal rd${i+1}`} style={{padding:'28px 24px',display:'flex',flexDirection:'column',position:'relative',...(p.featured?{borderColor:'var(--accent)',boxShadow:'0 0 0 1px var(--accent),0 0 32px var(--accentG)'}:{})}}>
                {p.featured && <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'var(--accent)',color:'#fff',padding:'2px 12px',borderRadius:100,fontSize:11,fontWeight:650}}>Recommended</div>}
                <div className="overline" style={{color:'var(--t2)',marginBottom:2}}>{p.plan}</div>
                <div style={{fontSize:'2rem',fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-0.04em'}}>{p.price}<span style={{fontSize:14,fontWeight:400,color:'var(--t3)'}}>{p.sub}</span></div>
                <ul style={{listStyle:'none',margin:'20px 0',flex:1}}>
                  {p.features.map((f,j)=><li key={j} style={{padding:'5px 0',fontSize:13,color:'var(--t2)',display:'flex',alignItems:'center',gap:8}}><span style={{color:'var(--green)',fontSize:11,fontWeight:700}}>✓</span>{f}</li>)}
                </ul>
                <Link href={cta} className={`btn btn-block ${p.featured?'btn-p':'btn-s'}`}>{p.plan==='Free'?'Get Started':'Start Trial'}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{padding:'100px 0'}}>
        <div className="container" style={{maxWidth:640,margin:'0 auto',padding:'0 24px'}}>
          <div className="reveal" style={{textAlign:'center',marginBottom:40}}>
            <div className="overline" style={{marginBottom:10}}>FAQ</div>
            <h2 className="h-l">Common questions.</h2>
          </div>
          <div className="reveal">
            {FAQS.map((f,i)=>(
              <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
                <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?-1:i)}>
                  <span>{f.q}</span>
                  <span style={{color:'var(--t3)',flexShrink:0,transition:'transform .3s',transform:openFaq===i?'rotate(180deg)':'none'}}>▾</span>
                </div>
                <div className="faq-a"><p className="body">{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'80px 0'}}>
        <div className="container" style={{maxWidth:1120,margin:'0 auto',padding:'0 24px'}}>
          <div className="reveal" style={{background:'var(--bg2)',border:'1px solid rgba(124,92,231,.12)',borderRadius:'var(--rxl)',padding:'56px 36px',textAlign:'center',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-40%',left:'50%',transform:'translateX(-50%)',width:500,height:500,background:'radial-gradient(circle,rgba(124,92,231,.08),transparent 60%)',pointerEvents:'none'}} />
            <h2 className="h-l" style={{position:'relative',marginBottom:10}}>Ready to invest with clarity?</h2>
            <p className="body-l" style={{position:'relative',maxWidth:400,margin:'0 auto 24px'}}>Live data. Real insights. No fake numbers.</p>
            <Link href={cta} className="btn btn-p btn-lg" style={{position:'relative'}}>{ctaT} →</Link>
            <p className="caption" style={{position:'relative',marginTop:14}}>Free plan · No credit card · Open source</p>
          </div>
        </div>
      </section>

      <footer style={{borderTop:'1px solid var(--b0)',padding:'32px 0'}}>
        <div className="container" style={{maxWidth:1120,margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <span className="caption">© 2025 Indx</span>
          <span className="caption">Built in India · Not SEBI-registered advice</span>
        </div>
      </footer>
    </>
  );
}
