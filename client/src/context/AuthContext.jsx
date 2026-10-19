import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);
// Default to the auth UI. The shared sample dashboard is an explicit demo mode.
const authMode = import.meta.env.VITE_AUTH_MODE !== 'demo';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(authMode);
  const [serviceError, setServiceError] = useState('');

  const refresh = useCallback(async () => {
    if (!authMode) return null;
    setLoading(true);
    try {
      const result = await authApi.me();
      setUser(result.user || null);
      setServiceError('');
      return result.user || null;
    } catch (error) {
      setUser(null);
      setServiceError(error.status === 401 ? '' : error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const runAuth = useCallback(async (action, ...args) => {
    setServiceError('');
    try {
      const result = await action(...args);
      if (result.user && !result.requiresMfa) setUser(result.user);
      return result;
    } catch (error) {
      setServiceError(error.message);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    enabled: authMode,
    user,
    loading,
    serviceError,
    refresh,
    clearError: () => setServiceError(''),
    login: (data) => runAuth(authApi.login, data),
    register: async (data) => { const result = await runAuth(authApi.register, data); setUser(null); return result; },
    logout: async () => { await runAuth(authApi.logout); setUser(null); },
    forgotPassword: (email) => runAuth(authApi.forgotPassword, email),
    resetPassword: (token, password) => runAuth(authApi.resetPassword, token, password),
    verifyEmail: (token) => runAuth(authApi.verifyEmail, token)
  }), [user, loading, serviceError, refresh, runAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
