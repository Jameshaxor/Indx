'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { loginEmail, signupEmail, loginGoogle } = useAuth();
  const router = useRouter();
  const isS = mode === 'signup';

  const submit = async e => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (isS) await signupEmail(email, pw, name); else await loginEmail(email, pw);
      router.push('/dashboard');
    } catch (e) { setErr(e.message.replace('Firebase: ','').replace(/\(auth\/.*\)/,'').trim()); }
    setBusy(false);
  };

  const google = async () => {
    setErr(''); setBusy(true);
    try { await loginGoogle(); router.push('/dashboard'); }
    catch (e) { setErr(e.message.replace('Firebase: ','').replace(/\(auth\/.*\)/,'').trim()); }
    setBusy(false);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex'}}>
      <div className="hide-m" style={{flex:1,background:'var(--bg1)',display:'flex',flexDirection:'column',justifyContent:'center',padding:'48px 56px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'15%',left:'25%',width:450,height:450,background:'radial-gradient(circle,rgba(124,92,231,.06),transparent)',pointerEvents:'none',borderRadius:'50%',filter:'blur(60px)'}} />
        <div style={{position:'relative',zIndex:1}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:8,fontWeight:800,fontSize:'1.05rem',marginBottom:48}}>
            <div className="nav-mark">IX</div>Indx
          </Link>
          <h1 style={{fontSize:'2.25rem',fontWeight:800,lineHeight:1.1,letterSpacing:'-0.04em',marginBottom:20}}>
            Indian markets,<br/><span className="gradient-text">decoded by AI.</span>
          </h1>
          <p className="body-l" style={{maxWidth:380,marginBottom:32}}>Real-time NSE/BSE data, Gemini-powered insights, and portfolio analytics in one place.</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[['📈','Live NIFTY, SENSEX & 25+ stocks'],['🤖','Gemini AI analyzing your portfolio'],['🧾','80C/80D tracking + tax optimization'],['🔒','Firebase auth, encrypted data']].map(([i,t],j)=>(
              <div key={j} style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:34,height:34,borderRadius:8,background:'var(--accentM)',border:'1px solid rgba(124,92,231,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{i}</div>
                <span className="body-s" style={{color:'var(--t1)'}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{width:440,display:'flex',flexDirection:'column',justifyContent:'center',padding:'36px 44px',background:'var(--surface)',borderLeft:'1px solid var(--b0)'}}>
        <div style={{maxWidth:320,width:'100%',margin:'0 auto',animation:'pi .35s ease'}}>
          <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--t3)',fontSize:13,marginBottom:28}} onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}>← Back</Link>
          <h2 style={{fontSize:'1.5rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:4}}>{isS?'Create account':'Welcome back'}</h2>
          <p className="body-s" style={{marginBottom:24}}>{isS?'Start your investing journey.':'Sign in to Indx.'}</p>

          <button onClick={google} disabled={busy} className="btn btn-s btn-block" style={{padding:11,fontSize:13,gap:10,marginBottom:10}}>
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,margin:'18px 0',color:'var(--t4)',fontSize:12}}><div style={{flex:1,height:1,background:'var(--b1)'}} />or email<div style={{flex:1,height:1,background:'var(--b1)'}} /></div>

          {err && <div style={{background:'var(--redM)',border:'1px solid rgba(239,68,68,.15)',borderRadius:'var(--rs)',padding:'10px 14px',marginBottom:14,fontSize:12,color:'var(--red)'}}>{err}</div>}

          <form onSubmit={submit}>
            {isS && <div style={{marginBottom:12}}><label className="label">Name</label><input className="input" placeholder="Rajesh Agarwal" value={name} onChange={e=>setName(e.target.value)} required/></div>}
            <div style={{marginBottom:12}}><label className="label">Email</label><input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div style={{marginBottom:18}}><label className="label">Password</label><input className="input" type="password" placeholder={isS?'Min 6 characters':'••••••••'} value={pw} onChange={e=>setPw(e.target.value)} required minLength={6}/></div>
            <button type="submit" disabled={busy} className="btn btn-p btn-block" style={{padding:12}}>{busy?'Please wait...':isS?'Create Account →':'Sign In →'}</button>
          </form>

          <p style={{textAlign:'center',marginTop:24,fontSize:13,color:'var(--t2)'}}>
            {isS?'Have an account? ':'No account? '}
            <button onClick={()=>{setMode(isS?'login':'signup');setErr('')}} style={{color:'var(--accentT)',fontWeight:600,background:'none',border:'none',cursor:'pointer',fontSize:'inherit',fontFamily:'inherit'}}>{isS?'Sign in':'Create free'}</button>
          </p>
        </div>
      </div>
      <style jsx>{`@media(max-width:900px){div[style*="width:440px"]{width:100%!important;border-left:none!important}}`}</style>
    </div>
  );
}
