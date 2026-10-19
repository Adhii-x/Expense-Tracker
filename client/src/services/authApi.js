import { apiRequest } from './api';

const post = (path, data) => apiRequest(path, { method: 'POST', body: JSON.stringify(data) });

export const authApi = {
  me: () => apiRequest('/auth/me'),
  login: (data) => post('/auth/login', data),
  register: (data) => post('/auth/register', data),
  logout: () => post('/auth/logout', {}),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => post('/auth/verify-email', { token }),
  requestOtp: (email) => post('/auth/otp/request', { email }),
  verifyOtp: (challengeId, code) => post('/auth/otp/verify', { challengeId, code }),
  startTotp: () => post('/auth/mfa/totp/enroll', {}),
  verifyTotp: (code) => post('/auth/mfa/totp/verify', { code }),
  disableTotp: (password, code) => post('/auth/mfa/totp/disable', { password, code }),
  sessions: () => apiRequest('/auth/sessions'),
  revokeSession: (id) => apiRequest(`/auth/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  logoutOtherSessions: () => post('/auth/logout-all', {}),
  events: () => apiRequest('/auth/security/events'),
  exportData: () => apiRequest('/auth/account/export'),
  deleteAccount: (password) => post('/auth/account/delete', { password }),
  passkeys: () => apiRequest('/auth/passkeys'),
  revokePasskey: (id) => apiRequest(`/auth/passkeys/${encodeURIComponent(id)}`, { method: 'DELETE' })
};

export function startOAuth(provider) {
  window.location.assign(`/api/oauth/${encodeURIComponent(provider)}`);
}
