'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

const Ctx = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fb) => {
      if (fb) {
        const u = { uid: fb.uid, email: fb.email, name: fb.displayName || fb.email.split('@')[0], photo: fb.photoURL };
        setUser(u);
        const ref = doc(db, 'users', fb.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) await setDoc(ref, { ...u, watchlist: [], createdAt: new Date().toISOString() });
      } else setUser(null);
      setLoading(false);
    });
  }, []);

  const loginEmail = (e, p) => signInWithEmailAndPassword(auth, e, p);
  const signupEmail = async (e, p, n) => { const c = await createUserWithEmailAndPassword(auth, e, p); await updateProfile(c.user, { displayName: n }); return c; };
  const loginGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return <Ctx.Provider value={{ user, loading, loginEmail, signupEmail, loginGoogle, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
