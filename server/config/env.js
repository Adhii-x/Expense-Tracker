export function validateEnvironment(env = process.env) {
  const mode = env.AUTH_MODE || 'authenticated';
  if (!['demo', 'authenticated'].includes(mode)) {
    throw new Error('AUTH_MODE must be either demo or authenticated.');
  }
  if (env.NODE_ENV === 'production') {
    if (mode !== 'authenticated') {
      throw new Error('Production requires AUTH_MODE=authenticated.');
    }
    if (!env.DATABASE_URL || !env.SESSION_SECRET) {
      throw new Error('Production requires DATABASE_URL and SESSION_SECRET for persistent accounts and sessions.');
    }
  }
  return { mode };
}
