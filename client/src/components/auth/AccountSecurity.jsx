import { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, Check, Copy, Download, Fingerprint, Laptop, LogOut, RefreshCw, Shield, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { authApi } from '../../services/authApi';
import { clearLocalAccountData, getLocalBudget, getLocalCards, getLocalGoals, getLocalSubscriptions, getLocalTransactions } from '../../services/api';

function Panel({ icon: Icon, title, description, children }) {
  return <section className="rounded-2xl border border-[#302923] bg-[#171513] p-5 sm:p-6">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-[#ff6b00]/10 p-2.5 text-[#ff9b52]"><Icon size={18} /></div><div><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-[#8f857c]">{description}</p></div></div>
    <div className="mt-5">{children}</div>
  </section>;
}

export default function AccountSecurity({ user, onLogout }) {
  const [code, setCode] = useState('');
  const [qr, setQr] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [passkeys, setPasskeys] = useState([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState({ totp: false });

  const loadSecurityData = useCallback(async () => {
    setLoading(true); setError('');
    const results = await Promise.allSettled([authApi.sessions(), authApi.events(), authApi.passkeys()]);
    if (results[0].status === 'fulfilled') setSessions(results[0].value.sessions || results[0].value.data || []);
    if (results[1].status === 'fulfilled') setEvents(results[1].value.events || results[1].value.data || []);
    if (results[2].status === 'fulfilled') setPasskeys(results[2].value.passkeys || results[2].value.data || []);
    const failed = results.find(result => result.status === 'rejected');
    if (failed) setError(failed.reason.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSecurityData();
    authApi.providers().then(result => setCapabilities(result)).catch(() => setCapabilities({ totp: false }));
  }, [loadSecurityData]);

  const act = async (action, success) => {
    setLoading(true); setError(''); setNotice('');
    try { const result = await action(); if (success) setNotice(success); await loadSecurityData(); return result; }
    catch (failure) { setError(failure.message); return null; }
    finally { setLoading(false); }
  };

  const startTotp = async () => {
    const result = await act(() => authApi.startTotp());
    if (result?.qrCodeDataUrl) setQr(result.qrCodeDataUrl);
    else if (result?.qrCode) setQr(result.qrCode);
  };

  const confirmTotp = async (event) => {
    event.preventDefault();
    const result = await act(() => authApi.verifyTotp(code), 'Authenticator app enabled. Save the recovery codes somewhere safe.');
    if (result?.recoveryCodes) { setRecoveryCodes(result.recoveryCodes); setQr(''); setCode(''); authApi.providers().then(setCapabilities); }
  };

  const disableAuthenticator = async (event) => {
    event.preventDefault();
    const result = await act(() => authApi.disableTotp(password, code), 'Authenticator app disabled.');
    if (result) { setCode(''); setPassword(''); authApi.providers().then(setCapabilities); }
  };

  const exportRecovery = () => {
    const blob = new Blob([recoveryCodes.join('\n') + '\n'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'expense-tracker-recovery-codes.txt'; link.click(); URL.revokeObjectURL(url);
  };

  const exportData = async () => {
    const result = await act(() => authApi.exportData(), 'Your account export is ready.');
    if (result) {
      const exportData = {
        ...result,
        financialData: {
          transactions: getLocalTransactions(),
          budget: getLocalBudget(),
          cards: getLocalCards(),
          subscriptions: getLocalSubscriptions(),
          goals: getLocalGoals(),
          storage: 'This browser, scoped to the signed-in account'
        }
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'expense-tracker-account-export.json'; link.click(); URL.revokeObjectURL(url);
    }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    if (!window.confirm('Permanently delete your account and personal data? This cannot be undone.')) return;
    const result = await act(() => authApi.deleteAccount(password));
    if (result) { clearLocalAccountData(user?.id); onLogout(); }
  };

  const addPasskey = () => act(async () => {
    const { options } = await authApi.passkeyRegistrationOptions();
    const response = await startRegistration({ optionsJSON: options });
    return authApi.passkeyRegistrationVerify(response, `${user?.name || 'Account'} passkey`);
  }, 'Passkey added.');

  return <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ff9b52]"><ShieldCheck size={14} /> Account protection</div><h1 className="mt-2 text-3xl font-black tracking-tight text-white">Security & privacy</h1><p className="mt-1 text-sm text-[#8e847c]">Manage sign-in methods and account access.</p></div>
      <button onClick={onLogout} className="auth-secondary sm:w-auto"><LogOut size={15} /> Sign out</button>
    </header>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#302923] bg-[#171513] px-5 py-4">
      <div><p className="text-xs text-[#8e847c]">Signed in as</p><p className="mt-1 text-sm font-bold text-white">{user?.name || user?.email || 'Account'}</p><p className="text-xs text-[#82786f]">{user?.email}</p></div>
      <button onClick={loadSecurityData} disabled={loading} className="auth-icon-button" aria-label="Refresh security details"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Panel icon={Smartphone} title="Authenticator app" description="Use a TOTP app such as Google Authenticator or Microsoft Authenticator for an additional sign-in check.">
        {capabilities.totpEnabled ? <form onSubmit={disableAuthenticator} className="space-y-3"><p className="text-xs font-semibold text-emerald-200">Authenticator app is enabled.</p>{user?.hasPassword && <><label htmlFor="totp-disable-password" className="block text-xs font-semibold text-[#c8bfb8]">Confirm password</label><input id="totp-disable-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="auth-input" required /></>}<label htmlFor="totp-disable-code" className="block text-xs font-semibold text-[#c8bfb8]">Authenticator code</label><input id="totp-disable-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="auth-input tracking-[0.4em]" maxLength={6} required /><button className="auth-danger" disabled={loading || code.length !== 6}>Disable authenticator</button></form> : qr ? <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><img src={qr} alt="Authenticator enrollment QR code" className="h-48 w-48 rounded-xl bg-white p-2" /><form onSubmit={confirmTotp} className="w-full space-y-3"><label htmlFor="totp-confirm" className="block text-xs font-semibold text-[#c8bfb8]">Enter the 6-digit code from your app</label><input id="totp-confirm" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="auth-input tracking-[0.4em]" maxLength={6} required /><button className="auth-primary" disabled={loading || code.length !== 6}>Confirm and enable</button></form></div> : <><button className="auth-secondary sm:w-auto" onClick={startTotp} disabled={loading || !capabilities.totp} title={!capabilities.totp ? 'Configure PostgreSQL and MFA secrets on the server first' : undefined}><Shield size={15} /> Set up authenticator</button>{!capabilities.totp && <p className="mt-2 text-xs text-[#81766d]">Requires PostgreSQL plus MFA_ENCRYPTION_KEY and RECOVERY_CODE_PEPPER in server/.env.</p>}</>}
        {recoveryCodes.length > 0 && <div className="mt-4 rounded-xl border border-amber-700/40 bg-amber-950/20 p-4"><p className="text-xs font-bold text-amber-100">Save these one-time recovery codes</p><div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-[#f4d5b6]">{recoveryCodes.map(codeItem => <span key={codeItem}>{codeItem}</span>)}</div><div className="mt-4 flex gap-2"><button onClick={() => navigator.clipboard?.writeText(recoveryCodes.join('\n'))} className="auth-small-button"><Copy size={14} /> Copy</button><button onClick={exportRecovery} className="auth-small-button"><Download size={14} /> Download</button></div></div>}
      </Panel>

      <Panel icon={Fingerprint} title="Passkeys" description="Use a device screen lock or security key for passwordless sign-in.">
        {passkeys.length ? <ul className="space-y-2">{passkeys.map(item => <li key={item.id} className="flex items-center justify-between rounded-xl bg-[#211d19] p-3 text-xs text-white"><span>{item.name || item.label || 'Passkey'}<small className="block text-[#82786f]">Added {item.createdAt || item.created_at || ''}</small></span><button onClick={() => act(() => authApi.revokePasskey(item.id), 'Passkey removed.')} className="text-red-300">Remove</button></li>)}</ul> : <div className="rounded-xl border border-dashed border-[#38302a] p-4 text-xs text-[#898077]">No passkeys are registered.</div>}
        <button onClick={addPasskey} disabled={loading} className="auth-secondary mt-3 sm:w-auto"><Fingerprint size={15} /> Add a passkey</button>
      </Panel>

      <Panel icon={Laptop} title="Active sessions" description="Review devices that have access to your account and revoke sessions you no longer use.">
        {sessions.length ? <ul className="space-y-2">{sessions.map(session => <li key={session.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#211d19] p-3"><span className="min-w-0 text-xs text-white">{session.device || session.userAgent || 'Signed-in device'}<small className="block truncate text-[#82786f]">Last active {session.lastActivity || session.last_activity_at || 'recently'}</small></span><button onClick={() => act(() => authApi.revokeSession(session.id), 'Session revoked.')} className="text-xs text-red-300">Revoke</button></li>)}</ul> : <p className="rounded-xl border border-dashed border-[#38302a] p-4 text-xs text-[#898077]">{loading ? 'Loading sessions…' : 'Session management is not available from the server yet.'}</p>}
        <button onClick={() => act(() => authApi.logoutOtherSessions(), 'Other sessions signed out.')} className="auth-small-button mt-3"><LogOut size={14} /> Sign out other sessions</button>
      </Panel>

      <Panel icon={Activity} title="Security activity" description="Recent sign-ins and account-security changes.">
        {events.length ? <ul className="max-h-44 space-y-2 overflow-auto">{events.map((event, index) => <li key={event.id || index} className="flex gap-2 text-xs text-[#c7bdb5]"><Activity size={14} className="mt-0.5 text-[#ff9b52]" />{event.label || event.eventType || event.event_type}<span className="ml-auto text-[#82786f]">{event.createdAt || event.created_at}</span></li>)}</ul> : <p className="rounded-xl border border-dashed border-[#38302a] p-4 text-xs text-[#898077]">No security events to show.</p>}
      </Panel>

      <Panel icon={Download} title="Your account data" description="Download a copy of your personal account data. Financial exports include only the signed-in account when supported by the server.">
        <button onClick={exportData} className="auth-secondary sm:w-auto" disabled={loading}><Download size={15} /> Export my data</button>
      </Panel>

      <Panel icon={AlertTriangle} title="Delete account" description="Account deletion is permanent and requires a recent sign-in.">
        <form onSubmit={deleteAccount} className="space-y-3">{user?.hasPassword && <><label htmlFor="delete-password" className="block text-xs font-semibold text-[#c8bfb8]">Password confirmation</label><input id="delete-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" required /></>}<button className="auth-danger" disabled={loading}><Trash2 size={15} /> Delete account</button></form>
      </Panel>
    </div>

    {error && <div role="alert" className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-xs text-red-200">{error}</div>}
    {notice && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-200"><Check size={15} />{notice}</div>}
  </div>;
}
