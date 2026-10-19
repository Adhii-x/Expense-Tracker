import AccountSecurity from './AccountSecurity';
export default function MfaSetup({ user, onLogout }) { return <AccountSecurity user={user} onLogout={onLogout} />; }
