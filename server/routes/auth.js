import argon2 from 'argon2';
import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'jose';
import {
  generateAuthenticationOptions, generateRegistrationOptions,
  verifyAuthenticationResponse, verifyRegistrationResponse
} from '@simplewebauthn/server';
import { createTotpEnrollment, enableTotp, verifyEnabledTotp, consumeRecoveryCode, disableTotp } from '../services/mfaService.js';

const profile = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: Boolean(user.emailVerified),
  hasPassword: Boolean(user.passwordHash)
});

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().optional()
}).refine(value => !value.confirmPassword || value.password === value.confirmPassword);

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128)
});

function regenerateSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(error => {
      if (error) return reject(error);
      req.session.userId = userId;
      req.session.authenticatedAt = Date.now();
      req.session.save(saveError => saveError ? reject(saveError) : resolve());
    });
  });
}

const tokenHash = value => createHash('sha256').update(value).digest('hex');
const safeEqual = (left, right) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};
const oauthStates = new Map();

export function createAuthRouter({ pool = null }) {
  const router = express.Router();
  const usersByEmail = new Map();
  const usersById = new Map();
  const oauthUsers = new Map();
  const memoryTokens = new Map();
  const memoryPasskeys = new Map();
  const memoryEvents = new Map();
  const pendingWebAuthn = new Map();
  const dummyPasswordHash = argon2.hash(randomBytes(32), { type: argon2.argon2id });
  const publicClientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  const mailEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);
  const mailer = mailEnabled ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USERNAME, pass: process.env.SMTP_PASSWORD }
  }) : null;
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, error: 'Too many sign-in attempts. Try again later.' }
  });

  const oauthConfig = {
    google: { id: process.env.GOOGLE_CLIENT_ID, secret: process.env.GOOGLE_CLIENT_SECRET, callback: process.env.GOOGLE_CALLBACK_URL },
    github: { id: process.env.GITHUB_CLIENT_ID, secret: process.env.GITHUB_CLIENT_SECRET, callback: process.env.GITHUB_CALLBACK_URL },
    microsoft: { id: process.env.MICROSOFT_CLIENT_ID, secret: process.env.MICROSOFT_CLIENT_SECRET, callback: process.env.MICROSOFT_CALLBACK_URL },
    apple: { id: process.env.APPLE_CLIENT_ID, callback: process.env.APPLE_CALLBACK_URL }
  };
  const providerAvailable = provider => {
    const config = oauthConfig[provider];
    if (!config?.id || !config.callback) return false;
    if (provider === 'apple') return Boolean(process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY);
    return Boolean(config.secret);
  };

  async function saveToken(userId, purpose, raw, destination, expiresMinutes = 20) {
    if (pool) await pool.query('DELETE FROM auth_tokens WHERE expires_at < now() OR consumed_at < now() - interval \'1 day\'');
    else for (const [id, item] of memoryTokens) if (item.expiresAt <= Date.now() || item.consumed) memoryTokens.delete(id);
    const hash = tokenHash(raw);
    if (pool) {
      const result = await pool.query(
        `INSERT INTO auth_tokens (user_id, purpose, token_hash, destination, expires_at)
         VALUES ($1, $2, decode($3, 'hex'), $4, now() + ($5 * interval '1 minute')) RETURNING id`,
        [userId, purpose, hash, destination, expiresMinutes]
      );
      return result.rows[0].id;
    }
    const id = randomUUID();
    memoryTokens.set(id, { userId, purpose, hash, destination, expiresAt: Date.now() + expiresMinutes * 60_000, attempts: 0, consumed: false });
    return id;
  }

  async function getToken(id, purpose) {
    if (pool) {
      const result = await pool.query(
        `SELECT id, user_id, purpose, encode(token_hash, 'hex') AS token_hash, destination, attempts
         FROM auth_tokens WHERE id = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > now()`,
        [id, purpose]
      );
      const row = result.rows[0];
      return row && { id: row.id, userId: row.user_id, purpose: row.purpose, hash: row.token_hash, destination: row.destination, attempts: row.attempts };
    }
    const value = memoryTokens.get(id);
    return value && !value.consumed && value.expiresAt > Date.now() && value.purpose === purpose ? { ...value, id } : null;
  }

  async function consumeToken(id) {
    if (pool) await pool.query('UPDATE auth_tokens SET consumed_at = now() WHERE id = $1 AND consumed_at IS NULL', [id]);
    else if (memoryTokens.has(id)) memoryTokens.get(id).consumed = true;
  }

  async function incrementTokenAttempts(id) {
    if (pool) await pool.query('UPDATE auth_tokens SET attempts = attempts + 1 WHERE id = $1 AND consumed_at IS NULL', [id]);
    else if (memoryTokens.has(id)) memoryTokens.get(id).attempts += 1;
  }

  async function sendMail(to, subject, text, html) {
    if (!mailer) throw Object.assign(new Error('Email sign-in is not configured. Add SMTP settings to server/.env and restart the API.'), { status: 503 });
    await mailer.sendMail({ from: process.env.SMTP_FROM, to, subject, text, html });
  }

  async function addSecurityEvent(userId, eventType, req) {
    const event = { id: randomUUID(), eventType, createdAt: new Date().toISOString() };
    if (!pool) {
      const events = memoryEvents.get(userId) || [];
      memoryEvents.set(userId, [event, ...events].slice(0, 50));
      return;
    }
    await pool.query(
      `INSERT INTO security_events (user_id, event_type, ip_hash, user_agent)
       VALUES ($1, $2, decode($3, 'hex'), $4)`,
      [userId, eventType, tokenHash(req.ip || ''), String(req.get('user-agent') || '').slice(0, 500)]
    );
  }

  async function findByEmail(email) {
    if (pool) {
      const result = await pool.query(
        `SELECT id, name, email, password_hash, email_verified_at
         FROM auth_users WHERE lower(email) = $1 AND deleted_at IS NULL`,
        [email]
      );
      const row = result.rows[0];
      return row && { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, emailVerified: Boolean(row.email_verified_at) };
    }
    return usersByEmail.get(email);
  }

  async function findById(id) {
    if (pool) {
      const result = await pool.query(
        `SELECT id, name, email, password_hash, email_verified_at FROM auth_users
         WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      const row = result.rows[0];
      return row && { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, emailVerified: Boolean(row.email_verified_at) };
    }
    return usersById.get(id);
  }

  async function findByOAuth(provider, subject) {
    if (pool) {
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.password_hash, u.email_verified_at
         FROM oauth_identities i JOIN auth_users u ON u.id = i.user_id
         WHERE i.provider = $1 AND i.provider_subject = $2 AND u.deleted_at IS NULL`,
        [provider, subject]
      );
      const row = result.rows[0];
      return row && { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, emailVerified: Boolean(row.email_verified_at) };
    }
    const userId = oauthUsers.get(`${provider}:${subject}`);
    return userId ? usersById.get(userId) : null;
  }

  async function createOAuthIdentity(provider, subject, identity) {
    let user = await findByOAuth(provider, subject);
    if (user) return user;
    const email = identity.email && identity.emailVerified
      ? String(identity.email).trim().toLowerCase()
      : `${provider}-${tokenHash(subject).slice(0, 24)}@oauth.invalid`;
    user = identity.email && identity.emailVerified ? await findByEmail(email) : null;
    if (user && identity.emailVerified && !user.emailVerified) {
      if (pool) await pool.query('UPDATE auth_users SET email_verified_at = now(), updated_at = now() WHERE id = $1', [user.id]);
      user.emailVerified = true;
    }
    if (!user) {
      user = {
        id: randomUUID(), name: String(identity.name || email.split('@')[0]).slice(0, 120), email,
        passwordHash: null, emailVerified: Boolean(identity.emailVerified)
      };
      if (pool) {
        await pool.query(
          `INSERT INTO auth_users (id, name, email, email_verified_at)
           VALUES ($1, $2, $3, CASE WHEN $4 THEN now() ELSE NULL END)`,
          [user.id, user.name, user.email, user.emailVerified]
        );
      } else {
        usersByEmail.set(email, user);
        usersById.set(user.id, user);
      }
    }
    if (pool) {
      await pool.query(
        'INSERT INTO oauth_identities (user_id, provider, provider_subject, email) VALUES ($1, $2, $3, $4) ON CONFLICT (provider, provider_subject) DO NOTHING',
        [user.id, provider, subject, identity.email || null]
      );
    } else {
      oauthUsers.set(`${provider}:${subject}`, user.id);
    }
    return user;
  }

  async function issueSession(req, user) {
    await regenerateSession(req, user.id);
    req.session.authenticatedAt = Date.now();
    req.session.userAgent = String(req.get('user-agent') || '').slice(0, 500);
    if (pool) await addSecurityEvent(user.id, 'sign_in', req);
  }

  async function startMfaChallenge(req, user) {
    if (!pool) return false;
    const mfa = await pool.query("SELECT 1 FROM mfa_methods WHERE user_id = $1 AND method = 'totp' AND enabled_at IS NOT NULL", [user.id]);
    if (!mfa.rowCount) return false;
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.mfaPendingUserId = user.id;
    req.session.mfaExpiresAt = Date.now() + 5 * 60_000;
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    return true;
  }

  async function completePrimaryAuthentication(req, res, user) {
    if (await startMfaChallenge(req, user)) return res.json({ success: true, requiresMfa: true, mfaType: 'totp' });
    await issueSession(req, user);
    return res.json({ success: true, user: profile(user) });
  }

  function requireUser(req, res, next) {
    if (!req.session?.userId) return res.status(401).json({ success: false, error: 'Sign in to continue.' });
    next();
  }

  function requireFreshAuth(req, res, next) {
    if (!req.session?.authenticatedAt || Date.now() - req.session.authenticatedAt > 5 * 60_000) {
      return res.status(401).json({ success: false, error: 'Sign in again before making this security change.' });
    }
    next();
  }

  function getMemorySessions(req) {
    return new Promise((resolve, reject) => req.sessionStore.all((error, sessions) => error ? reject(error) : resolve(sessions || {})));
  }

  function getMemorySession(req, sessionId) {
    return new Promise((resolve, reject) => req.sessionStore.get(sessionId, (error, value) => error ? reject(error) : resolve(value)));
  }

  router.get('/providers', async (req, res, next) => {
    try {
      let totpEnabled = false;
      if (pool && req.session?.userId) {
        const result = await pool.query("SELECT 1 FROM mfa_methods WHERE user_id = $1 AND method = 'totp' AND enabled_at IS NOT NULL", [req.session.userId]);
        totpEnabled = result.rowCount > 0;
      }
      res.json({ success: true, providers: Object.fromEntries(Object.keys(oauthConfig).map(name => [name, providerAvailable(name)])), email: mailEnabled, database: Boolean(pool), totp: Boolean(pool && process.env.MFA_ENCRYPTION_KEY && process.env.RECOVERY_CODE_PEPPER), totpEnabled });
    } catch (error) { next(error); }
  });

  router.get('/oauth/:provider', authLimiter, (req, res) => {
    const provider = req.params.provider;
    if (!oauthConfig[provider]) return res.redirect(`${publicClientUrl}/?auth_error=unknown_provider`);
    if (!providerAvailable(provider)) return res.redirect(`${publicClientUrl}/?auth_error=${provider}_not_configured`);
    const config = oauthConfig[provider];
    const state = randomBytes(32).toString('base64url');
    const nonce = randomBytes(32).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    oauthStates.set(state, { provider, nonce, verifier, expiresAt: Date.now() + 10 * 60_000 });
    for (const [key, value] of oauthStates) if (value.expiresAt <= Date.now()) oauthStates.delete(key);

    const urls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      github: 'https://github.com/login/oauth/authorize',
      microsoft: `https://login.microsoftonline.com/${encodeURIComponent(process.env.MICROSOFT_TENANT_ID || 'common')}/oauth2/v2.0/authorize`,
      apple: 'https://appleid.apple.com/auth/authorize'
    };
    const url = new URL(urls[provider]);
    url.searchParams.set('client_id', config.id);
    url.searchParams.set('redirect_uri', config.callback);
    url.searchParams.set('response_type', provider === 'apple' ? 'code id_token' : 'code');
    url.searchParams.set('state', state);
    if (provider === 'github') {
      url.searchParams.set('scope', 'read:user user:email');
    } else {
      url.searchParams.set('scope', provider === 'apple' ? 'name email' : 'openid email profile');
      url.searchParams.set('nonce', nonce);
      if (provider === 'apple') url.searchParams.set('response_mode', 'form_post');
    }
    if (provider !== 'apple') {
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }
    if (provider === 'google') url.searchParams.set('access_type', 'online');
    res.cookie('expense.oauth_state', state, {
      httpOnly: true,
      secure: provider === 'apple' || process.env.NODE_ENV === 'production',
      sameSite: provider === 'apple' ? 'none' : 'lax',
      maxAge: 10 * 60_000,
      path: '/api/auth/oauth'
    });
    res.redirect(url.toString());
  });

  const oauthCallback = async (req, res) => {
    try {
      const provider = req.params.provider;
      const params = req.method === 'POST' ? req.body : req.query;
      const state = String(params.state || '');
      const cookieState = String(req.get('cookie') || '').split(';').map(part => part.trim()).find(part => part.startsWith('expense.oauth_state='))?.slice('expense.oauth_state='.length) || '';
      const flow = oauthStates.get(state);
      oauthStates.delete(state);
      if (!flow || flow.provider !== provider || flow.expiresAt <= Date.now() || !safeEqual(cookieState, state)) throw new Error('The sign-in session expired. Please try again.');
      res.clearCookie('expense.oauth_state', { httpOnly: true, secure: provider === 'apple' || process.env.NODE_ENV === 'production', sameSite: provider === 'apple' ? 'none' : 'lax', path: '/api/auth/oauth' });
      if (params.error || !params.code) throw new Error('The identity provider did not complete sign-in.');
      const config = oauthConfig[provider];
      let clientSecret = config.secret;
      if (provider === 'apple') {
        const key = await importPKCS8(process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'ES256');
        clientSecret = await new SignJWT({})
          .setProtectedHeader({ alg: 'ES256', kid: process.env.APPLE_KEY_ID })
          .setIssuer(process.env.APPLE_TEAM_ID).setSubject(config.id)
          .setAudience('https://appleid.apple.com').setIssuedAt().setExpirationTime('5m').sign(key);
      }
      const tokenUrl = provider === 'google' ? 'https://oauth2.googleapis.com/token'
        : provider === 'github' ? 'https://github.com/login/oauth/access_token'
          : provider === 'microsoft' ? `https://login.microsoftonline.com/${encodeURIComponent(process.env.MICROSOFT_TENANT_ID || 'common')}/oauth2/v2.0/token`
            : 'https://appleid.apple.com/auth/token';
      const body = new URLSearchParams({ grant_type: 'authorization_code', code: String(params.code), redirect_uri: config.callback, client_id: config.id, client_secret: clientSecret });
      if (provider !== 'apple') body.set('code_verifier', flow.verifier);
      const tokenResponse = await fetch(tokenUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }, body });
      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || !tokens.access_token) throw new Error('The identity provider could not verify this sign-in. Check its callback and credentials.');

      let identity;
      if (provider === 'github') {
        const headers = { authorization: `Bearer ${tokens.access_token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' };
        const [userResponse, emailsResponse] = await Promise.all([fetch('https://api.github.com/user', { headers }), fetch('https://api.github.com/user/emails', { headers })]);
        if (!userResponse.ok || !emailsResponse.ok) throw new Error('GitHub did not return a verified account profile.');
        const githubUser = await userResponse.json();
        const emails = await emailsResponse.json();
        const verified = emails.find(item => item.primary && item.verified) || emails.find(item => item.verified);
        if (!verified?.email || !githubUser.id) throw new Error('Verify an email address with GitHub before using it to sign in.');
        identity = { subject: String(githubUser.id), email: verified.email, emailVerified: true, name: githubUser.name || githubUser.login };
      } else {
        if (!tokens.id_token) throw new Error('The identity provider did not return an identity token.');
        const issuer = provider === 'google' ? ['https://accounts.google.com', 'accounts.google.com']
          : provider === 'apple' ? 'https://appleid.apple.com' : undefined;
        const jwksUrl = provider === 'google' ? 'https://www.googleapis.com/oauth2/v3/certs'
          : provider === 'apple' ? 'https://appleid.apple.com/auth/keys'
            : 'https://login.microsoftonline.com/common/discovery/v2.0/keys';
        const options = { audience: config.id, algorithms: ['RS256'] };
        if (issuer) options.issuer = issuer;
        const { payload } = await jwtVerify(tokens.id_token, createRemoteJWKSet(new URL(jwksUrl)), options);
        if (payload.nonce !== flow.nonce || !payload.sub) throw new Error('Identity token validation failed. Please retry sign-in.');
        if (provider === 'microsoft') {
          const tenant = String(payload.tid || '');
          if (!/^[0-9a-f-]{36}$/i.test(tenant) || payload.iss !== `https://login.microsoftonline.com/${tenant}/v2.0`) throw new Error('Microsoft tenant validation failed.');
        }
        if (provider === 'google' && payload.email_verified !== true) throw new Error('Verify your email with Google before signing in.');
        if (provider === 'apple' && !payload.email) throw new Error('Apple did not share an email address for this account.');
        identity = {
          subject: String(payload.sub),
          email: payload.email || (provider === 'microsoft' ? payload.preferred_username : undefined),
          emailVerified: payload.email_verified === true || payload.email_verified === 'true',
          name: payload.name || payload.email || payload.preferred_username || `${provider} user`
        };
      }
      if (provider === 'apple' && params.user) {
        try {
          const appleProfile = JSON.parse(String(params.user));
          const candidateName = [appleProfile.name?.firstName, appleProfile.name?.lastName].filter(value => typeof value === 'string').join(' ').replace(/[\u0000-\u001f\u007f]/g, '').trim();
          if (candidateName) identity.name = candidateName.slice(0, 120);
        } catch { /* Apple may omit this one-time profile field on later sign-ins. */ }
      }
      const user = await createOAuthIdentity(provider, identity.subject, identity);
      if (await startMfaChallenge(req, user)) return res.redirect(`${publicClientUrl}/?mfa_required=totp`);
      await issueSession(req, user);
      return res.redirect(`${publicClientUrl}/?oauth=success`);
    } catch (error) {
      const code = error.message.includes('not configured') ? 'provider_not_configured' : 'provider_sign_in_failed';
      console.error(`OAuth sign-in failed for ${req.params.provider}: ${code}`);
      return res.redirect(`${publicClientUrl}/?auth_error=${code}`);
    }
  };
  router.get('/oauth/:provider/callback', oauthCallback);
  router.post('/oauth/:provider/callback', oauthCallback);

  async function sendVerification(user) {
    const token = randomBytes(32).toString('base64url');
    await saveToken(user.id, 'verify_email', token, user.email, 60);
    const link = `${publicClientUrl}/?purpose=verify&token=${encodeURIComponent(token)}`;
    await sendMail(user.email, 'Verify your Expense Tracker Pro account', `Verify your email: ${link}`, `<p>Verify your email address to protect your Expense Tracker Pro account.</p><p><a href="${link}">Verify email</a></p><p>This link expires in 60 minutes.</p>`);
  }

  router.get('/me', async (req, res, next) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ success: false, error: 'Not signed in.' });
      const user = await findById(req.session.userId);
      if (!user) {
        return req.session.destroy(() => res.status(401).json({ success: false, error: 'Not signed in.' }));
      }
      res.json({ success: true, user: profile(user) });
    } catch (error) { next(error); }
  });

  router.post('/register', authLimiter, async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, error: 'Enter a valid name, email, and password.' });
      const data = parsed.data;
      const email = data.email.toLowerCase();
      const existing = await findByEmail(email);
      if (existing) return res.status(202).json({ success: true, message: 'If this address can be used, you can proceed to sign in. Check your inbox if email verification is enabled.' });

      const user = {
        id: randomUUID(),
        name: data.name,
        email,
        passwordHash: await argon2.hash(data.password, {
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 1
        }),
        emailVerified: false
      };

      if (pool) {
        await pool.query(
          `INSERT INTO auth_users (id, name, email, password_hash)
           VALUES ($1, $2, $3, $4)`,
          [user.id, user.name, user.email, user.passwordHash]
        );
      } else {
        usersByEmail.set(email, user);
        usersById.set(user.id, user);
      }

      const message = 'If this address can be used, you can proceed to sign in. Check your inbox if email verification is enabled.';
      if (mailer) {
        try { await sendVerification(user); }
        catch { /* Keep the response generic to avoid account enumeration. */ }
      }
      res.status(202).json({
        success: true,
        message,
      });
    } catch (error) {
      if (error.code === '23505') return res.status(202).json({ success: true, message: 'If this address can be used, you can proceed to sign in. Check your inbox if email verification is enabled.' });
      next(error);
    }
  });

  router.post('/login', authLimiter, async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
      const email = parsed.data.email.toLowerCase();
      const user = await findByEmail(email);
      const encodedHash = user?.passwordHash || await dummyPasswordHash;
      const valid = await argon2.verify(encodedHash, parsed.data.password).catch(() => false);
      if (!user || !valid || (mailer && !user.emailVerified)) return res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
      await completePrimaryAuthentication(req, res, user);
    } catch (error) { next(error); }
  });

  router.post('/email/verification/request', authLimiter, async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!z.string().email().safeParse(email).success) return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
      if (!mailer) return res.status(503).json({ success: false, error: 'Email delivery is not configured. Add SMTP settings to server/.env.' });
      const user = await findByEmail(email);
      if (user && !user.emailVerified) {
        try { await sendVerification(user); } catch { /* Keep the response indistinguishable for unknown accounts. */ }
      }
      res.json({ success: true, message: 'If this account needs verification, a link will be sent.' });
    } catch (error) { next(error); }
  });

  router.post('/verify-email', authLimiter, async (req, res, next) => {
    try {
      const raw = String(req.body?.token || '');
      const hash = tokenHash(raw);
      let record;
      if (pool) {
        const result = await pool.query(
          `SELECT id, user_id FROM auth_tokens WHERE purpose = 'verify_email' AND token_hash = decode($1, 'hex') AND consumed_at IS NULL AND expires_at > now() LIMIT 1`,
          [hash]
        );
        record = result.rows[0] && { id: result.rows[0].id, userId: result.rows[0].user_id };
      } else {
        record = [...memoryTokens.entries()].map(([id, token]) => ({ id, ...token })).find(token => token.purpose === 'verify_email' && !token.consumed && token.expiresAt > Date.now() && safeEqual(token.hash, hash));
      }
      if (!record) return res.status(400).json({ success: false, error: 'This verification link is invalid or expired. Request a new one.' });
      if (pool) await pool.query('UPDATE auth_users SET email_verified_at = now(), updated_at = now() WHERE id = $1', [record.userId]);
      else { const user = usersById.get(record.userId); if (user) user.emailVerified = true; }
      await consumeToken(record.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.post('/forgot-password', authLimiter, async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!z.string().email().safeParse(email).success) return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
      if (!mailer) return res.status(503).json({ success: false, error: 'Password recovery email is not configured. Add SMTP settings to server/.env.' });
      const user = await findByEmail(email);
      if (user) {
        const token = randomBytes(32).toString('base64url');
        await saveToken(user.id, 'reset_password', token, user.email, 30);
        const link = `${publicClientUrl}/?purpose=reset&token=${encodeURIComponent(token)}`;
        try { await sendMail(user.email, 'Reset your Expense Tracker Pro password', `Reset your password: ${link}`, `<p>A password reset was requested for your account.</p><p><a href="${link}">Choose a new password</a></p><p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>`); }
        catch { /* Keep the response indistinguishable for unknown accounts. */ }
      }
      res.json({ success: true, message: 'If an account matches that address, password reset instructions will be sent.' });
    } catch (error) { next(error); }
  });

  router.post('/reset-password', authLimiter, async (req, res, next) => {
    try {
      const parsed = z.object({ token: z.string().min(20), password: z.string().min(8).max(128) }).safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, error: 'Enter a valid reset link and a password of at least 8 characters.' });
      const hash = tokenHash(parsed.data.token);
      let record;
      if (pool) {
        const result = await pool.query(
          `SELECT id, user_id FROM auth_tokens WHERE purpose = 'reset_password' AND token_hash = decode($1, 'hex') AND consumed_at IS NULL AND expires_at > now() LIMIT 1`, [hash]
        );
        record = result.rows[0] && { id: result.rows[0].id, userId: result.rows[0].user_id };
      } else {
        record = [...memoryTokens.entries()].map(([id, token]) => ({ id, ...token })).find(token => token.purpose === 'reset_password' && !token.consumed && token.expiresAt > Date.now() && safeEqual(token.hash, hash));
      }
      if (!record) return res.status(400).json({ success: false, error: 'This reset link is invalid or expired. Request a new one.' });
      const passwordHash = await argon2.hash(parsed.data.password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 });
      if (pool) {
        await pool.query('UPDATE auth_users SET password_hash = $2, updated_at = now() WHERE id = $1', [record.userId, passwordHash]);
        await pool.query("DELETE FROM web_sessions WHERE sess->>'userId' = $1", [record.userId]);
      } else { const user = usersById.get(record.userId); if (user) user.passwordHash = passwordHash; }
      await consumeToken(record.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.post('/otp/request', authLimiter, async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!z.string().email().safeParse(email).success) return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
      if (!mailer) return res.status(503).json({ success: false, error: 'Email-code sign-in is not configured. Add SMTP settings to server/.env.' });
      const challengeId = randomUUID();
      const user = await findByEmail(email);
      if (user) {
        const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
        const tokenId = await saveToken(user.id, 'email_otp', code, email, 10);
        if (pool) await pool.query('UPDATE auth_tokens SET id = $2 WHERE id = $1', [tokenId, challengeId]);
        else { const item = memoryTokens.get(tokenId); memoryTokens.delete(tokenId); memoryTokens.set(challengeId, item); }
        try { await sendMail(email, 'Your Expense Tracker Pro sign-in code', `Your one-time code is ${code}. It expires in 10 minutes.`, `<p>Your one-time sign-in code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px">${code}</p><p>It expires in 10 minutes.</p>`); }
        catch { /* Keep the response indistinguishable for unknown accounts. */ }
      }
      res.json({ success: true, challengeId, message: 'If an account matches that address, a sign-in code will be sent.' });
    } catch (error) { next(error); }
  });

  router.post('/otp/verify', authLimiter, async (req, res, next) => {
    try {
      const challengeId = String(req.body?.challengeId || '');
      const code = String(req.body?.code || '');
      if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, error: 'Enter the six-digit code.' });
      const record = await getToken(challengeId, 'email_otp');
      if (!record || record.attempts >= 5 || !safeEqual(record.hash, tokenHash(code))) {
        if (record) await incrementTokenAttempts(challengeId);
        return res.status(401).json({ success: false, error: 'That sign-in code is invalid or expired.' });
      }
      await consumeToken(challengeId);
      const user = await findById(record.userId);
      if (!user) return res.status(401).json({ success: false, error: 'That sign-in code is invalid or expired.' });
      await completePrimaryAuthentication(req, res, user);
    } catch (error) { next(error); }
  });

  router.post('/mfa/totp/enroll', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      if (!pool) return res.status(503).json({ success: false, error: 'Authenticator enrollment requires PostgreSQL. Set DATABASE_URL and restart the API.' });
      if (!process.env.MFA_ENCRYPTION_KEY || !process.env.RECOVERY_CODE_PEPPER) return res.status(503).json({ success: false, error: 'Authenticator enrollment requires MFA_ENCRYPTION_KEY and RECOVERY_CODE_PEPPER in server/.env.' });
      res.json({ success: true, ...(await createTotpEnrollment(pool, req.session.userId, (await findById(req.session.userId)).email)) });
    } catch (error) { next(error); }
  });

  router.post('/mfa/totp/verify', authLimiter, async (req, res, next) => {
    try {
      if (!pool) return res.status(503).json({ success: false, error: 'Authenticator verification requires PostgreSQL.' });
      const code = String(req.body?.code || '');
      if (req.session?.mfaPendingUserId && req.session.mfaExpiresAt > Date.now()) {
        const user = await findById(req.session.mfaPendingUserId);
        if (!user || !(await verifyEnabledTotp(pool, user.id, code)) && !(await consumeRecoveryCode(pool, user.id, code))) return res.status(401).json({ success: false, error: 'The verification code is incorrect.' });
        await issueSession(req, user);
        return res.json({ success: true, user: profile(user) });
      }
      if (!req.session?.userId) return res.status(401).json({ success: false, error: 'Sign in to continue.' });
      if (!req.session.authenticatedAt || Date.now() - req.session.authenticatedAt > 5 * 60_000) return res.status(401).json({ success: false, error: 'Sign in again before enabling authenticator protection.' });
      const codes = await enableTotp(pool, req.session.userId, code);
      if (!codes) return res.status(400).json({ success: false, error: 'The authenticator code is incorrect or the enrollment expired.' });
      await addSecurityEvent(req.session.userId, 'mfa_enabled', req);
      res.json({ success: true, recoveryCodes: codes });
    } catch (error) { next(error); }
  });

  router.post('/mfa/totp/disable', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      if (!pool) return res.status(503).json({ success: false, error: 'Authenticator management requires PostgreSQL.' });
      const user = await findById(req.session.userId);
      const validPassword = user && (!user.passwordHash || await argon2.verify(user.passwordHash, String(req.body?.password || '')).catch(() => false));
      const validCode = pool && await verifyEnabledTotp(pool, req.session.userId, String(req.body?.code || ''));
      if (!validPassword || !validCode) return res.status(401).json({ success: false, error: 'Password or authenticator code is incorrect.' });
      await disableTotp(pool, req.session.userId);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.get('/sessions', requireUser, async (req, res, next) => {
    try {
      if (!pool) {
        const sessions = await getMemorySessions(req);
        return res.json({ success: true, sessions: Object.entries(sessions).filter(([, item]) => item.userId === req.session.userId).map(([id, item]) => ({ id, device: item.userAgent || 'Signed-in device', current: id === req.sessionID, lastActivity: item.authenticatedAt ? new Date(item.authenticatedAt).toISOString() : null })) });
      }
      const result = await pool.query("SELECT sid, sess, expire FROM web_sessions WHERE sess->>'userId' = $1 ORDER BY expire DESC", [req.session.userId]);
      return res.json({ success: true, sessions: result.rows.map(row => ({ id: row.sid, device: row.sess.userAgent || 'Signed-in device', current: row.sid === req.sessionID, lastActivity: row.sess.lastActivity || row.expire })) });
    } catch (error) { next(error); }
  });

  router.delete('/sessions/:id', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      if (req.params.id === req.sessionID || req.params.id === 'current') {
        return req.session.destroy(error => {
          if (error) return next(error);
          res.clearCookie(process.env.SESSION_COOKIE_NAME || 'expense.sid', { path: '/' });
          return res.json({ success: true, signedOut: true });
        });
      }
      if (pool) await pool.query("DELETE FROM web_sessions WHERE sid = $1 AND sess->>'userId' = $2", [req.params.id, req.session.userId]);
      else {
        const target = await getMemorySession(req, req.params.id);
        if (target?.userId === req.session.userId) await new Promise((resolve, reject) => req.sessionStore.destroy(req.params.id, error => error ? reject(error) : resolve()));
      }
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.post('/logout-all', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      if (pool) await pool.query("DELETE FROM web_sessions WHERE sess->>'userId' = $1 AND sid <> $2", [req.session.userId, req.sessionID]);
      else {
        const sessions = await getMemorySessions(req);
        await Promise.all(Object.entries(sessions).filter(([id, item]) => id !== req.sessionID && item.userId === req.session.userId).map(([id]) => new Promise((resolve, reject) => req.sessionStore.destroy(id, error => error ? reject(error) : resolve()))));
      }
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.get('/security/events', requireUser, async (req, res, next) => {
    try {
      if (!pool) return res.json({ success: true, events: memoryEvents.get(req.session.userId) || [] });
      const result = await pool.query('SELECT id, event_type, created_at FROM security_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.session.userId]);
      res.json({ success: true, events: result.rows.map(row => ({ id: row.id, eventType: row.event_type, createdAt: row.created_at })) });
    } catch (error) { next(error); }
  });

  const rpName = process.env.WEBAUTHN_RP_NAME || 'Expense Tracker Pro';
  const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
  const webauthnOrigin = (process.env.WEBAUTHN_ORIGIN || publicClientUrl).split(',').map(value => value.trim());
  const getPasskeys = async userId => {
    if (pool) {
      const result = await pool.query("SELECT credential_id, public_key, counter, transports, label, created_at FROM passkey_credentials WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
      return result.rows.map(row => ({ id: row.credential_id, publicKey: new Uint8Array(row.public_key), counter: Number(row.counter), transports: row.transports || [], label: row.label, createdAt: row.created_at }));
    }
    return memoryPasskeys.get(userId) || [];
  };

  router.post('/passkeys/authenticate/options', authLimiter, async (req, res, next) => {
    try {
      const options = await generateAuthenticationOptions({ rpID, userVerification: 'required' });
      pendingWebAuthn.set(options.challenge, { expiresAt: Date.now() + 5 * 60_000 });
      res.json({ success: true, options });
    } catch (error) { next(error); }
  });

  router.post('/passkeys/authenticate/verify', authLimiter, async (req, res, next) => {
    try {
      const response = req.body?.response;
      const clientData = JSON.parse(Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8'));
      const challenge = String(clientData.challenge || '');
      const challengeFlow = pendingWebAuthn.get(challenge);
      pendingWebAuthn.delete(challenge);
      if (!challengeFlow || challengeFlow.expiresAt <= Date.now()) return res.status(400).json({ success: false, error: 'Passkey sign-in expired. Start again.' });
      let user;
      let credential;
      if (pool) {
        const result = await pool.query(
          `SELECT c.credential_id, c.public_key, c.counter, c.transports, c.label, u.id AS user_id
           FROM passkey_credentials c JOIN auth_users u ON u.id = c.user_id
           WHERE c.credential_id = $1 AND c.revoked_at IS NULL AND u.deleted_at IS NULL`, [response.id]
        );
        const row = result.rows[0];
        if (row) {
          credential = { id: row.credential_id, publicKey: new Uint8Array(row.public_key), counter: Number(row.counter), transports: row.transports || [] };
          user = await findById(row.user_id);
        }
      } else {
        for (const [userId, rows] of memoryPasskeys.entries()) {
          const match = rows.find(item => item.id === response.id);
          if (match) { credential = match; user = await findById(userId); break; }
        }
      }
      if (!user || !credential) return res.status(401).json({ success: false, error: 'This passkey is not registered to an active account.' });
      const verification = await verifyAuthenticationResponse({ response, expectedChallenge: challenge, expectedOrigin: webauthnOrigin, expectedRPID: rpID, credential, requireUserVerification: true });
      if (!verification.verified) return res.status(401).json({ success: false, error: 'Passkey verification failed.' });
      if (pool) await pool.query('UPDATE passkey_credentials SET counter = $2, last_used_at = now() WHERE credential_id = $1', [credential.id, verification.authenticationInfo.newCounter]);
      else credential.counter = verification.authenticationInfo.newCounter;
      await completePrimaryAuthentication(req, res, user);
    } catch (error) { next(error); }
  });

  router.get('/passkeys', requireUser, async (req, res, next) => {
    try { res.json({ success: true, passkeys: (await getPasskeys(req.session.userId)).map(item => ({ id: item.id, label: item.label, createdAt: item.createdAt })) }); }
    catch (error) { next(error); }
  });

  router.post('/passkeys/register/options', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      const user = await findById(req.session.userId);
      const existing = await getPasskeys(user.id);
      const options = await generateRegistrationOptions({
        rpName, rpID, userID: new Uint8Array(Buffer.from(user.id)), userName: user.email,
        userDisplayName: user.name, attestationType: 'none',
        excludeCredentials: existing.map(item => ({ id: item.id, transports: item.transports })),
        authenticatorSelection: { residentKey: 'required', userVerification: 'required' }
      });
      req.session.passkeyRegistrationChallenge = options.challenge;
      req.session.save(error => error ? next(error) : res.json({ success: true, options }));
    } catch (error) { next(error); }
  });

  router.post('/passkeys/register/verify', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      const expectedChallenge = req.session.passkeyRegistrationChallenge;
      delete req.session.passkeyRegistrationChallenge;
      if (!expectedChallenge) return res.status(400).json({ success: false, error: 'Passkey registration expired. Start again.' });
      const verification = await verifyRegistrationResponse({ response: req.body?.response, expectedChallenge, expectedOrigin: webauthnOrigin, expectedRPID: rpID, requireUserVerification: true });
      if (!verification.verified || !verification.registrationInfo) return res.status(400).json({ success: false, error: 'The passkey could not be verified.' });
      const credential = verification.registrationInfo.credential;
      const label = String(req.body?.label || 'Passkey').slice(0, 80);
      const value = { id: credential.id, publicKey: credential.publicKey, counter: credential.counter, transports: req.body?.response?.response?.transports || [], label, createdAt: new Date().toISOString() };
      if (pool) await pool.query(
        `INSERT INTO passkey_credentials (credential_id, user_id, public_key, counter, transports, label)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [value.id, req.session.userId, Buffer.from(value.publicKey), value.counter, value.transports, label]
      );
      else memoryPasskeys.set(req.session.userId, [...(memoryPasskeys.get(req.session.userId) || []), value]);
      await addSecurityEvent(req.session.userId, 'passkey_added', req);
      res.json({ success: true, passkey: { id: value.id, label: value.label, createdAt: value.createdAt } });
    } catch (error) { next(error); }
  });

  router.delete('/passkeys/:id', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      if (pool) await pool.query('UPDATE passkey_credentials SET revoked_at = now() WHERE credential_id = $1 AND user_id = $2 AND revoked_at IS NULL', [req.params.id, req.session.userId]);
      else memoryPasskeys.set(req.session.userId, (memoryPasskeys.get(req.session.userId) || []).filter(item => item.id !== req.params.id));
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  router.get('/account/export', requireUser, requireFreshAuth, async (req, res, next) => {
    try {
      const user = await findById(req.session.userId);
      const passkeys = await getPasskeys(user.id);
      res.json({ success: true, exportedAt: new Date().toISOString(), account: profile(user), security: { passkeys: passkeys.map(item => ({ label: item.label, createdAt: item.createdAt })) }, financialData: { transactions: [], budget: null, note: 'Financial data export will be included when account-owned server storage is enabled.' } });
    } catch (error) { next(error); }
  });

  router.post('/account/delete', requireUser, requireFreshAuth, authLimiter, async (req, res, next) => {
    try {
      const user = await findById(req.session.userId);
      if (Date.now() - Number(req.session.authenticatedAt || 0) > 5 * 60_000) return res.status(401).json({ success: false, error: 'Sign in again before deleting your account.' });
      if (user?.passwordHash && !(await argon2.verify(user.passwordHash, String(req.body?.password || '')).catch(() => false))) return res.status(401).json({ success: false, error: 'Password confirmation failed.' });
      const userId = req.session.userId;
      if (pool) {
        await pool.query("DELETE FROM web_sessions WHERE sess->>'userId' = $1", [userId]);
        await pool.query('DELETE FROM auth_users WHERE id = $1', [userId]);
      } else {
        const existing = usersById.get(userId);
        if (existing) usersByEmail.delete(existing.email);
        usersById.delete(userId);
        memoryPasskeys.delete(userId);
        memoryEvents.delete(userId);
        for (const [id, token] of memoryTokens) if (token.userId === userId) memoryTokens.delete(id);
        for (const [identityKey, mappedUserId] of oauthUsers) if (mappedUserId === userId) oauthUsers.delete(identityKey);
      }
      req.session.destroy(error => {
        if (error) return next(error);
        res.clearCookie(process.env.SESSION_COOKIE_NAME || 'expense.sid', { path: '/' });
        return res.json({ success: true });
      });
    } catch (error) { next(error); }
  });

  router.post('/logout', (req, res) => {
    if (!req.session) return res.json({ success: true });
    req.session.destroy(error => {
      if (error) return res.status(500).json({ success: false, error: 'Could not end this session.' });
      res.clearCookie(process.env.SESSION_COOKIE_NAME || 'expense.sid', { path: '/' });
      return res.json({ success: true });
    });
  });

  return router;
}
