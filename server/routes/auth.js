import argon2 from 'argon2';
import { randomBytes, randomUUID } from 'node:crypto';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

const profile = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: Boolean(user.emailVerified)
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

export function createAuthRouter({ pool = null }) {
  const router = express.Router();
  const usersByEmail = new Map();
  const usersById = new Map();
  const dummyPasswordHash = argon2.hash(randomBytes(32), { type: argon2.argon2id });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, error: 'Too many sign-in attempts. Try again later.' }
  });

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
        `SELECT id, name, email, email_verified_at FROM auth_users
         WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      const row = result.rows[0];
      return row && { id: row.id, name: row.name, email: row.email, emailVerified: Boolean(row.email_verified_at) };
    }
    return usersById.get(id);
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
      if (existing) return res.status(202).json({ success: true, message: 'If this address is eligible, the account is ready. You can try signing in.' });

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

      res.status(201).json({
        success: true,
        message: 'Account created. Sign in to continue. Email verification delivery is not configured.',
        user: profile(user)
      });
    } catch (error) {
      if (error.code === '23505') return res.status(202).json({ success: true, message: 'If this address is eligible, the account is ready. You can try signing in.' });
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
      if (!user || !valid) return res.status(401).json({ success: false, error: 'Email or password is incorrect.' });
      await regenerateSession(req, user.id);
      res.json({ success: true, user: profile(user) });
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
