import { useEffect, useMemo, useState } from 'react';
import { Activity, Apple, ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';

const providers = [
  { id: 'google', label: 'Google', icon: 'G' },
  { id: 'github', label: 'GitHub', icon: 'GH' },
  { id: 'microsoft', label: 'Microsoft', icon: '⊞' },
  { id: 'apple', label: 'Apple', icon: Apple }
];

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function BrandPanel() {
  return (
    <aside className="hidden lg:flex lg:w-[43%] flex-col justify-between p-12 bg-[#141210] border-r border-[#292420] relative overflow-hidden">
      <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-[#ff6b00]/10 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ff8a24] to-[#dc4d00] flex items-center justify-center shadow-lg shadow-orange-950/50"><Activity className="w-5 h-5 text-white" /></div>
        <div><p className="font-black text-white tracking-tight">Expense Tracker <span className="text-[#ff8a24]">PRO</span></p><p className="text-xs text-[#8e847c]">Your money, in focus.</p></div>
      </div>
      <div className="relative max-w-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff8a24] mb-4">A clearer view of your money</p>
        <h1 className="text-4xl xl:text-5xl leading-[1.08] font-black text-white tracking-tight">Spend with intent.<br /><span className="text-[#ff8a24]">Save with confidence.</span></h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-[#a49a91]">One calm space for the everyday decisions that shape your financial future.</p>
        <div className="mt-10 grid grid-cols-2 gap-3">
          {[
            ['01', 'Your ledger, organized'],
            ['02', 'Budgets that make sense'],
            ['03', 'Progress you can see'],
            ['04', 'Security built in']
          ].map(([number, label]) => <div key={number} className="rounded-2xl border border-[#332c27] bg-[#1b1816]/80 p-4"><span className="text-[10px] font-black text-[#ff8a24]">{number}</span><p className="mt-2 text-xs font-semibold text-[#e4dcd5]">{label}</p></div>)}
        </div>
      </div>
      <p className="relative text-[11px] text-[#746b64]">Private by design <span className="mx-2">·</span> Secure account access</p>
    </aside>
  );
}

function PasswordField({ value, onChange, label = 'Password', autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false);
  return <div>
    <label htmlFor="auth-password" className="block text-xs font-semibold text-[#c8bfb8] mb-2">{label}</label>
    <div className="relative">
      <input id="auth-password" type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} className="auth-input pr-12" required minLength={8} />
      <button type="button" onClick={() => setVisible(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8e847c] hover:text-white rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff8a24]" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
  </div>;
}

export default function LoginPage({ initialView }) {
  const auth = useAuth();
  const params = new URLSearchParams(window.location.search);
  const [view, setView] = useState(initialView || (params.get('token') ? (params.get('purpose') === 'reset' ? 'reset' : 'verify') : 'login'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [challengeId, setChallengeId] = useState('');
  const strength = useMemo(() => passwordStrength(password), [password]);
  const isRegister = view === 'register';

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const run = async (operation) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };

  const submit = (event) => {
    event.preventDefault();
    if (isRegister && password !== confirm) { setError('Those passwords don’t match.'); return; }
    if (isRegister && strength < 3) { setError('Choose a stronger password before continuing.'); return; }
    run(async () => {
      if (isRegister) {
        await auth.register({ name: name.trim(), email: email.trim(), password, confirmPassword: confirm });
        setNotice('If the address can be registered, you’ll receive a verification email shortly.');
        setView('verify');
      } else {
        const result = await auth.login({ email: email.trim(), password });
        if (result.requiresMfa) setView('otp');
        else await auth.refresh();
      }
    });
  };

  const requestEmailOtp = () => run(async () => {
    const result = await authApi.requestOtp(email.trim());
    setChallengeId(result.challengeId || '');
    setView('otp'); setSeconds(30);
    setNotice('If this address is eligible, a verification code is on its way.');
  });

  const submitOtp = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await authApi.verifyOtp(challengeId, code);
      if (result.user) await auth.refresh();
      else setNotice('Code accepted by the service. Continue the sign-in flow to finish.');
    });
  };

  const submitForgot = (event) => {
    event.preventDefault();
    run(async () => {
      await auth.forgotPassword(email.trim());
      setNotice('If an account matches, password reset instructions will be sent.');
    });
  };

  const submitVerify = (event) => {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');
    run(async () => {
      if (!token) throw new Error('Open the verification link from your email to continue.');
      await auth.verifyEmail(token);
      setNotice('Email verified. You can now sign in.');
      setView('login');
    });
  };

  const submitReset = (event) => {
    event.preventDefault();
    const token = params.get('token');
    run(async () => {
      if (!token) throw new Error('This reset link is missing its secure token. Request a new link.');
      if (password !== confirm) throw new Error('Those passwords don’t match.');
      if (strength < 3) throw new Error('Choose a stronger password before continuing.');
      await auth.resetPassword(token, password);
      setNotice('Your password has been changed. Sign in with the new password.');
      setView('login');
    });
  };

  const title = ({ login: 'Welcome back', register: 'Create your account', forgot: 'Reset your password', reset: 'Choose a new password', verify: 'Check your email', otp: 'Verify it’s you' })[view];
  const subtitle = ({ login: 'Sign in to your personal finance space.', register: 'Start with a secure account for your finances.', forgot: 'We’ll send a secure link if the account exists.', reset: 'Create a new password for your account.', verify: 'Confirm your email to protect your account.', otp: 'Enter the one-time code to continue.' })[view];

  return <div className="min-h-screen bg-[#0e0d0c] text-[#e6ded8] flex">
    <BrandPanel />
    <main className="flex-1 min-w-0 flex flex-col items-center justify-center p-5 sm:p-10 relative">
      <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff8a24] to-[#dc4d00] flex items-center justify-center"><Activity size={17} /></div><span className="font-extrabold text-white">Expense Tracker <b className="text-[#ff8a24]">PRO</b></span></div>
      <div className="w-full max-w-[430px] mt-14 lg:mt-0 animate-fade-in">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff8a24]"><ShieldCheck size={14} /> Account security</div>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-sm text-[#938980]">{subtitle}</p>

        {(view === 'login' || view === 'register') && <>
          <div className="mt-7 grid grid-cols-2 gap-2">
            {providers.map(({ id, label, icon: Icon }) => <button key={id} type="button" disabled title={`${label} sign-in is not configured on this server`} className="flex items-center justify-center gap-2 rounded-xl border border-[#302a26] bg-[#171513] px-3 py-3 text-xs font-semibold text-[#91877e] disabled:cursor-not-allowed disabled:opacity-60"><span className="text-sm font-black">{typeof Icon === 'string' ? Icon : <Icon size={15} />}</span>{label}<span className="sr-only">(not configured)</span></button>)}
          </div>
          <div className="my-6 flex items-center gap-3 text-[10px] text-[#716860]"><span className="h-px flex-1 bg-[#2b2622]" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-[#2b2622]" /></div>
        </>}

        {view === 'login' && <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="auth-email" className="block text-xs font-semibold text-[#c8bfb8] mb-2">Email address</label><input id="auth-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required /></div>
          <PasswordField value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex justify-end"><button type="button" onClick={() => setView('forgot')} className="text-xs font-semibold text-[#ff9b52] hover:text-white">Forgot password?</button></div>
          <button disabled={busy} className="auth-primary"><span>{busy ? 'Signing in…' : 'Sign in securely'}</span><ArrowRight size={17} /></button>
          <button type="button" onClick={requestEmailOtp} disabled={busy || !email} className="auth-secondary"><Mail size={16} /> Continue with email code</button>
          <p className="text-center text-xs text-[#8e847c] pt-2">New to Expense Tracker? <button type="button" onClick={() => { setView('register'); setError(''); }} className="font-bold text-[#ff9b52] hover:text-white">Create an account</button></p>
        </form>}

        {view === 'register' && <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="auth-name" className="block text-xs font-semibold text-[#c8bfb8] mb-2">Full name</label><input id="auth-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="auth-input" required maxLength={120} /></div>
          <div><label htmlFor="auth-email" className="block text-xs font-semibold text-[#c8bfb8] mb-2">Email address</label><input id="auth-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required /></div>
          <PasswordField value={password} onChange={e => setPassword(e.target.value)} label="Create password" autoComplete="new-password" />
          <div aria-live="polite"><div className="grid grid-cols-5 gap-1.5">{[0,1,2,3,4].map(i => <span key={i} className={`h-1 rounded-full ${strength > i ? 'bg-[#ff8a24]' : 'bg-[#302a26]'}`} />)}</div><p className="mt-1 text-[10px] text-[#8e847c]">{password ? ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength] : 'Use 12+ characters with a mix of letters, numbers, and symbols.'}</p></div>
          <div><label htmlFor="auth-confirm" className="block text-xs font-semibold text-[#c8bfb8] mb-2">Confirm password</label><input id="auth-confirm" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="auth-input" required minLength={8} /></div>
          <button disabled={busy} className="auth-primary"><span>{busy ? 'Creating account…' : 'Create secure account'}</span><ArrowRight size={17} /></button>
          <p className="text-center text-xs text-[#8e847c] pt-2">Already registered? <button type="button" onClick={() => { setView('login'); setError(''); }} className="font-bold text-[#ff9b52] hover:text-white">Sign in</button></p>
        </form>}

        {view === 'forgot' && <form onSubmit={submitForgot} className="space-y-4">
          <div><label htmlFor="auth-email" className="block text-xs font-semibold text-[#c8bfb8] mb-2">Email address</label><input id="auth-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" required /></div>
          <button disabled={busy} className="auth-primary">{busy ? 'Sending…' : 'Send reset link'}<ArrowRight size={17} /></button>
          <button type="button" onClick={() => setView('login')} className="auth-back"><ArrowLeft size={15} /> Back to sign in</button>
        </form>}

        {view === 'verify' && <form onSubmit={submitVerify} className="space-y-4">
          <div className="rounded-2xl border border-[#332b25] bg-[#171513] p-4 text-sm text-[#a99f97]"><Mail className="text-[#ff9b52] mb-2" size={20} />We use email verification to help protect account access. Check your inbox for a secure, single-use link.</div>
          <button disabled={busy} className="auth-primary">{busy ? 'Verifying…' : 'Verify email'}<Check size={17} /></button>
          <button type="button" onClick={() => setView('login')} className="auth-back"><ArrowLeft size={15} /> Back to sign in</button>
        </form>}

        {view === 'reset' && <form onSubmit={submitReset} className="space-y-4">
          <PasswordField value={password} onChange={e => setPassword(e.target.value)} label="New password" autoComplete="new-password" />
          <div aria-live="polite"><div className="grid grid-cols-5 gap-1.5">{[0,1,2,3,4].map(i => <span key={i} className={`h-1 rounded-full ${strength > i ? 'bg-[#ff8a24]' : 'bg-[#302a26]'}`} />)}</div><p className="mt-1 text-[10px] text-[#8e847c]">Use 12+ characters with a mix of letters, numbers, and symbols.</p></div>
          <div><label htmlFor="auth-confirm" className="block text-xs font-semibold text-[#c8bfb8] mb-2">Confirm new password</label><input id="auth-confirm" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="auth-input" required minLength={8} /></div>
          <button disabled={busy} className="auth-primary">{busy ? 'Updating…' : 'Update password'}<Check size={17} /></button>
        </form>}

        {view === 'otp' && <form onSubmit={submitOtp} className="space-y-4">
          <div><label htmlFor="auth-code" className="block text-xs font-semibold text-[#c8bfb8] mb-2">6-digit verification code</label><input id="auth-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="auth-input text-center tracking-[0.5em] text-lg font-bold" required /></div>
          <button disabled={busy || code.length !== 6} className="auth-primary">{busy ? 'Verifying…' : 'Verify and continue'}<KeyRound size={17} /></button>
          <button type="button" disabled={seconds > 0 || busy} onClick={() => { setSeconds(30); requestEmailOtp(); }} className="auth-back disabled:opacity-50">{seconds ? `Resend available in ${seconds}s` : 'Resend code'}</button>
        </form>}

        {(error || auth.serviceError) && <div role="alert" className="mt-4 rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-xs text-red-200">{error || auth.serviceError}</div>}
        {notice && <div role="status" className="mt-4 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-200">{notice}</div>}
        <p className="mt-8 flex justify-center gap-2 text-[10px] text-[#746b64]"><ShieldCheck size={13} /> Your password is never stored in this browser.</p>
      </div>
    </main>
  </div>;
}

export { passwordStrength };
