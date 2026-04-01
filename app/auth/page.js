'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

export default function AuthPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (e) {
      setError(e.message || 'Google sign-in failed');
    }
    setLoading(false);
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Fill all fields');
    if (isSignUp && !name) return setError('Enter your name');
    if (password.length < 6) return setError('Password must be 6+ characters');

    if (!auth) {
      return setError('Firebase not connected. Please check environment variables and redeploy.');
    }

    setLoading(true);
    try {
      // Dynamic import to avoid build-time issues
      const {
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        updateProfile
      } = await import('firebase/auth');

      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await cred.user.getIdToken(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      const code = err.code || '';
      const msg =
        code === 'auth/email-already-in-use' ? 'Email already registered. Sign in instead.' :
        code === 'auth/invalid-credential' ? 'Invalid email or password.' :
        code === 'auth/user-not-found' ? 'No account found. Create one first.' :
        code === 'auth/wrong-password' ? 'Incorrect password.' :
        code === 'auth/weak-password' ? 'Password too weak (6+ chars).' :
        code === 'auth/invalid-email' ? 'Invalid email address.' :
        err.message || 'Authentication failed';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 60px', background: 'var(--bg0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 16, color: '#fff'
          }}>IX</div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Indx</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
          <span className="gradient-text">Indian markets,{'\n'}decoded by AI.</span>
        </h1>
        <p style={{ color: 'var(--t3)', fontSize: 15, lineHeight: 1.6, maxWidth: 420, marginBottom: 30 }}>
          Real-time NSE/BSE data, Gemini-powered insights, and portfolio analytics in one place.
        </p>
        {[
          ['📊', 'Live NIFTY, SENSEX & 25+ stocks'],
          ['🤖', 'Gemini AI analyzing your portfolio'],
          ['📋', '80C/80D tracking + tax optimization'],
          ['🔒', 'Firebase auth, encrypted data'],
        ].map(([icon, text], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--bg1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
            }}>{icon}</div>
            <span style={{ fontSize: 13, color: 'var(--t2)' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{
        width: 420, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 40px', background: 'var(--bg1)', borderLeft: '1px solid var(--b0)'
      }}>
        <button onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: 12, marginBottom: 20, textAlign: 'left' }}>
          ← Back
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ color: 'var(--t3)', fontSize: 13, marginBottom: 24 }}>
          {isSignUp ? 'Start your investing journey.' : 'Sign in to Indx.'}
        </p>

        <button onClick={handleGoogle} disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--b0)',
            background: 'var(--bg0)', color: 'var(--t1)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, marginBottom: 20
          }}>
          <span style={{ fontSize: 18 }}>G</span> Continue with Google
        </button>

        <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 12, marginBottom: 20, position: 'relative' }}>
          <span style={{ background: 'var(--bg1)', padding: '0 12px', position: 'relative', zIndex: 1 }}>or email</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--b0)' }} />
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 14,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontSize: 12
          }}>{error}</div>
        )}

        <form onSubmit={handleEmail}>
          {isSignUp && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Name</label>
              <input className="input" placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: 6 }}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-p"
            style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700 }}>
            {loading ? '⏳ Please wait...' : isSignUp ? 'Create Account →' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--t3)' }}>
          {isSignUp ? 'Already have an account? ' : 'No account? '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            {isSignUp ? 'Sign in' : 'Create free'}
          </button>
        </p>
      </div>
    </div>
  );
}
