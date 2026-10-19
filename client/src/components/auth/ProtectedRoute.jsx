import { useAuth } from '../../context/AuthContext';
import LoginPage from './LoginPage';

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  if (!auth.enabled) return children;
  if (auth.loading) return <div className="min-h-screen bg-[#0e0d0c] grid place-items-center text-sm text-[#a99f97]" role="status">Checking your secure session…</div>;
  if (!auth.user) return <LoginPage />;
  return children;
}
