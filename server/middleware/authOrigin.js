export function createAuthOriginGuard(allowedOrigins) {
  const allowlist = new Set(allowedOrigins.map(value => new URL(value).origin));
  return function authOriginGuard(req, res, next) {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (origin && !allowlist.has(origin)) {
      return res.status(403).json({ success: false, error: 'Request origin is not allowed.' });
    }
    return next();
  };
}
