'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => { if(!loading){ if(!user) router.push('/auth'); else setOk(true); } }, [user,loading,router]);
  if (!ok) return <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg0)',flexDirection:'column',gap:14}}><div className="spinner"/><div style={{color:'var(--t3)',fontSize:13}}>Loading Indx...</div></div>;
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <Sidebar/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <Topbar/>
        <main style={{flex:1,overflowY:'auto',padding:18,background:'var(--bg0)'}}>{children}</main>
      </div>
    </div>
  );
}
