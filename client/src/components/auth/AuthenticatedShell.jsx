import { useState } from 'react';
import { Activity, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AccountSecurity from './AccountSecurity';

export default function AuthenticatedShell({ children }) {
  const [showSecurity, setShowSecurity] = useState(false);
  const { user, logout } = useAuth();
  return <div className="min-h-screen bg-[#e5e8f3] text-[#29273b]">
    <header className="border-b border-white/80 bg-white/90 px-5 py-4 shadow-sm sm:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8777c9] to-[#6252a5] text-white"><Activity size={17} /></div><span className="font-extrabold text-[#302d45]">Expense Tracker <b className="text-[#7463b9]">PRO</b></span><span className="ml-auto hidden text-xs text-[#85849a] sm:block">{user?.name || user?.email}</span><button type="button" onClick={() => setShowSecurity(value => !value)} className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5ef] px-3 py-2 text-xs font-semibold text-[#625b80] hover:border-[#a99be8]"> <ShieldCheck size={15} /> {showSecurity ? 'Dashboard' : 'Security'}</button><button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5ef] px-3 py-2 text-xs font-semibold text-[#625b80] hover:border-[#a99be8]"><LogOut size={15} /> Sign out</button></div>
    </header>
    {showSecurity ? <AccountSecurity user={user} onLogout={logout} /> : <>{children}<p className="border-t border-[#292420] px-5 py-3 text-center text-[11px] text-[#716860]">Your dashboard data is saved on the server for this account.</p></>}
  </div>;
}
