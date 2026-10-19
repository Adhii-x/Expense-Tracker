import { Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AccountSecurity from './AccountSecurity';

export default function AuthenticatedShell() {
  const { user, logout } = useAuth();
  return <div className="min-h-screen bg-[#0e0d0c] text-[#e6ded8]">
    <header className="border-b border-[#292420] bg-[#12100f] px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a24] to-[#dc4d00]"><Activity size={17} /></div><span className="font-extrabold text-white">Expense Tracker <b className="text-[#ff8a24]">PRO</b></span><span className="ml-auto rounded-full border border-emerald-900/70 bg-emerald-950/30 px-3 py-1 text-[10px] font-semibold text-emerald-200">Signed in</span></div>
    </header>
    <AccountSecurity user={user} onLogout={logout} />
    <p className="mx-auto max-w-5xl px-5 pb-8 text-[11px] leading-5 text-[#716860] sm:px-8">Financial dashboard access stays disabled in authenticated mode until the backend provides user-owned financial APIs. This prevents an authenticated UI from displaying the shared demo ledger.</p>
  </div>;
}
