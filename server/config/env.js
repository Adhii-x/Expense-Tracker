export function validateEnvironment(env = process.env) {
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'Production startup is disabled: this build still uses shared financial storage and has no enforced user sessions. Do not expose it to users.'
    );
  }

  const mode = env.AUTH_MODE || 'authenticated';
  if (!['demo', 'authenticated'].includes(mode)) {
    throw new Error('AUTH_MODE must be either demo or authenticated.');
  }
  return { mode };
}
