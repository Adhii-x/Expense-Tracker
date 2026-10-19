export function validateEnvironment(env = process.env) {
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'Production startup is disabled: this build still uses shared financial storage and has no enforced user sessions. Do not expose it to users.'
    );
  }

  if (env.AUTH_MODE && env.AUTH_MODE !== 'demo') {
    throw new Error('Only AUTH_MODE=demo is implemented in this build.');
  }
  return { mode: 'demo' };
}
