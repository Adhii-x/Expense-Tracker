import { useState } from 'react';
import { Activity, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AccountSecurity from './AccountSecurity';

export default function AuthenticatedShell({ children }) {
  const [showSecurity, setShowSecurity] = useState(false);
  const { user, logout } = useAuth();
  return <div className="min-h-screen bg-[#0e0d0c] text-[#e6ded8]">
    <header className="border-b border-[#292420] bg-[#12100f] px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a24] to-[#dc4d00]"><Activity size={17} /></div><span className="font-extrabold text-white">Expense Tracker <b className="text-[#ff8a24]">PRO</b></span><span className="ml-auto hidden text-xs text-[#a99f97] sm:block">{user?.name || user?.email}</span><button type="button" onClick={() => setShowSecurity(value => !value)} className="inline-flex items-center gap-2 rounded-lg border border-[#39312b] px-3 py-2 text-xs font-semibold hover:border-[#ff8a24]"> <ShieldCheck size={15} /> {showSecurity ? 'Dashboard' : 'Security'}</button><button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-[#39312b] px-3 py-2 text-xs font-semibold hover:border-[#ff8a24]"><LogOut size={15} /> Sign out</button></div>
    </header>
    {showSecurity ? <AccountSecurity user={user} onLogout={logout} /> : <>{children}<p className="border-t border-[#292420] px-5 py-3 text-center text-[11px] text-[#716860]">Your dashboard data is saved in this browser for this account.</p></>}
  </div>;
}
