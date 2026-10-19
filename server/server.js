import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'url';
import { createDataStore } from './database.js';
import { validateEnvironment } from './config/env.js';
import { createAuthOriginGuard } from './middleware/authOrigin.js';
import { createAuthRouter } from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const { mode: authMode } = validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(value => value.trim()).filter(Boolean);
app.disable('x-powered-by');
app.use(helmet());
const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/oauth/') && req.path.endsWith('/callback')) return next();
  return corsMiddleware(req, res, next);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

const { Pool } = pg;
const authPool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;
const sessionMaxAge = Number(process.env.SESSION_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;
const sessionSecret = process.env.SESSION_SECRET || randomBytes(48).toString('base64url');
const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'expense.sid';

if (authPool) {
  await authPool.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
      email TEXT NOT NULL,
      password_hash TEXT,
      email_verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );
    CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_active_uq
      ON auth_users (lower(email)) WHERE deleted_at IS NULL;
    CREATE TABLE IF NOT EXISTS oauth_identities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL CHECK (provider IN ('google','github','microsoft','apple')),
      provider_subject TEXT NOT NULL, email TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(provider, provider_subject)
    );
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL CHECK (purpose IN ('verify_email','reset_password','magic_link','email_otp','sms_otp')),
      token_hash BYTEA NOT NULL, destination TEXT, attempts SMALLINT NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ NOT NULL, consumed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS auth_tokens_lookup_idx ON auth_tokens(purpose, token_hash) WHERE consumed_at IS NULL;
    CREATE TABLE IF NOT EXISTS mfa_methods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      method TEXT NOT NULL CHECK (method IN ('totp','email','sms')), secret_ciphertext BYTEA,
      enabled_at TIMESTAMPTZ, last_totp_counter BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, method)
    );
    ALTER TABLE mfa_methods ADD COLUMN IF NOT EXISTS last_totp_counter BIGINT NOT NULL DEFAULT 0;
    CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      code_hash BYTEA NOT NULL, consumed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS passkey_credentials (
      credential_id TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      public_key BYTEA NOT NULL, counter BIGINT NOT NULL DEFAULT 0, transports TEXT[] NOT NULL DEFAULT '{}',
      label TEXT NOT NULL DEFAULT 'Passkey', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_used_at TIMESTAMPTZ, revoked_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS security_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL, ip_hash BYTEA, user_agent TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
} else {
  console.warn('Authentication is using temporary in-memory users and sessions. Set DATABASE_URL for persistence.');
}

if (authMode === 'authenticated') {
  const PgSessionStore = connectPgSimple(session);
  const sessionStore = authPool
    ? new PgSessionStore({ pool: authPool, tableName: 'web_sessions', createTableIfMissing: true, pruneSessionInterval: 15 })
    : undefined;
  app.use(session({
    name: sessionCookieName,
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionMaxAge,
      path: '/'
    }
  }));
}

const authOriginGuard = createAuthOriginGuard(clientOrigins);
app.use('/api/auth', (req, res, next) => req.path.startsWith('/oauth/') ? next() : authOriginGuard(req, res, next));
app.use('/api/auth', createAuthRouter({ pool: authPool }));
app.use('/api', (req, res, next) => {
  if (authMode !== 'authenticated' || req.path === '/health' || req.path.startsWith('/auth/')) return next();
  if (!req.session?.userId) return res.status(401).json({ success: false, error: 'Sign in to continue.' });
  return res.status(503).json({ success: false, error: 'Per-user financial storage is not configured yet.' });
});

// Database file path used for JSON storage and one-time PostgreSQL import.
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Initial seed data
const initialData = {
  budget: {
    monthlyLimit: 25000,
    currency: 'INR'
  },
  cards: [
    {
      id: 'card-1',
      holder: 'Ethan Reynolds',
      type: 'VISA',
      last4: '4892',
      expiry: '08/28',
      balance: 12850.00,
      color: 'gradient-orange',
      isPrimary: true
    },
    {
      id: 'card-2',
      holder: 'Ethan Reynolds',
      type: 'Mastercard',
      last4: '6150',
      expiry: '11/27',
      balance: 6150.00,
      color: 'dark-glass',
      isPrimary: false
    },
    {
      id: 'card-3',
      holder: 'Ethan Reynolds',
      type: 'VISA',
      last4: '3140',
      expiry: '03/29',
      balance: 3140.00,
      color: 'gradient-charcoal',
      isPrimary: false
    }
  ],
  subscriptions: [
    { id: 'sub-1', name: 'GitHub Copilot Pro', amount: 10.00, billingCycle: 'monthly', nextBilling: '2026-11-01', category: 'Education & Books', icon: 'Code' },
    { id: 'sub-2', name: 'Spotify Student Pass', amount: 5.99, billingCycle: 'monthly', nextBilling: '2026-10-25', category: 'Entertainment', icon: 'Music' },
    { id: 'sub-3', name: 'ChatGPT Plus', amount: 20.00, billingCycle: 'monthly', nextBilling: '2026-11-05', category: 'Education & Books', icon: 'Bot' },
    { id: 'sub-4', name: 'Campus Rec Fitness', amount: 25.00, billingCycle: 'monthly', nextBilling: '2026-10-28', category: 'Healthcare', icon: 'Dumbbell' }
  ],
  goals: [
    { id: 'goal-1', title: 'MacBook Pro M3 Fund', targetAmount: 1800, currentAmount: 1350, deadline: '2026-12-15', category: 'Tech' },
    { id: 'goal-2', title: 'Emergency Reserve Buffer', targetAmount: 3000, currentAmount: 2450, deadline: '2027-01-31', category: 'Safety' },
    { id: 'goal-3', title: 'Summer Hackathon Trip', targetAmount: 600, currentAmount: 430, deadline: '2027-04-10', category: 'Travel' }
  ],
  transactions: [
    {
      id: 'tx-1',
      title: 'Campus Bookstore - Textbooks',
      amount: 145.50,
      type: 'expense',
      category: 'Education & Books',
      date: '2026-10-02',
      notes: 'Semester textbooks'
    },
    {
      id: 'tx-2',
      title: 'Monthly University Grant / Scholarship',
      amount: 1200.00,
      type: 'income',
      category: 'Scholarship / Grant',
      date: '2026-10-01',
      notes: 'Direct deposit'
    },
    {
      id: 'tx-3',
      title: 'Grocery Store Essentials',
      amount: 86.20,
      type: 'expense',
      category: 'Groceries',
      date: '2026-10-05',
      notes: 'Weekly groceries'
    },
    {
      id: 'tx-4',
      title: 'Part-Time Web Tutor',
      amount: 450.00,
      type: 'income',
      category: 'Freelance / Tutoring',
      date: '2026-10-08',
      notes: 'Coding lessons for freshman'
    },
    {
      id: 'tx-5',
      title: 'Student Apartment Rent & Utilities',
      amount: 650.00,
      type: 'expense',
      category: 'Housing & Rent',
      date: '2026-10-01',
      notes: 'Rent split with roommate'
    },
    {
      id: 'tx-6',
      title: 'Monthly Metro Transit Pass',
      amount: 60.00,
      type: 'expense',
      category: 'Transportation',
      date: '2026-10-03',
      notes: 'Subway & bus monthly pass'
    },
    {
      id: 'tx-7',
      title: 'Streaming & Tech Subscriptions',
      amount: 24.99,
      type: 'expense',
      category: 'Entertainment',
      date: '2026-10-10',
      notes: 'Spotify + GitHub Copilot'
    },
    {
      id: 'tx-8',
      title: 'Campus Coffee & Snacks',
      amount: 32.50,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-10-12',
      notes: 'Study session treats'
    },
    {
      id: 'tx-9',
      title: 'September Internship Stipend',
      amount: 1800.00,
      type: 'income',
      category: 'Salary',
      date: '2026-09-28',
      notes: 'Summer/Fall internship stipend'
    },
    {
      id: 'tx-10',
      title: 'Laptop Repair & Charger',
      amount: 120.00,
      type: 'expense',
      category: 'Shopping',
      date: '2026-09-15',
      notes: 'Replacement USB-C power adapter'
    }
  ]
};

const dataStore = createDataStore({
  databaseUrl: process.env.DATABASE_URL,
  filePath: DB_FILE,
  initialData
});
let currentData = await dataStore.initialize();

function readDb() {
  return currentData;
}

async function writeDb(data) {
  await dataStore.save(data);
  currentData = dataStore.read();
}

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

let mutationQueue = Promise.resolve();
app.use('/api', (req, res, next) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    next();
    return;
  }

  const previous = mutationQueue;
  let release;
  mutationQueue = new Promise(resolve => {
    release = resolve;
  });
  previous.then(() => {
    res.once('finish', release);
    res.once('close', release);
    next();
  }, next);
});

// ======================== API ROUTES ========================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Expense Tracker REST API is operating smoothly',
    database: dataStore.mode,
    timestamp: new Date().toISOString()
  });
});

// GET all transactions
app.get('/api/transactions', (req, res) => {
  const db = readDb();
  let list = [...(db.transactions || [])];

  const { category, month, type, search } = req.query;

  if (category && category !== 'All') {
    list = list.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (type && type !== 'All') {
    list = list.filter(t => t.type.toLowerCase() === type.toLowerCase());
  }

  if (month && month !== 'All') {
    list = list.filter(t => t.date && t.date.startsWith(month));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// POST new transaction
app.post('/api/transactions', asyncHandler(async (req, res) => {
  const { title, amount, type, category, date, notes } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Transaction title is required.' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Amount must be a positive number greater than 0.' });
  }

  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Type must be either "income" or "expense".' });
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ success: false, error: 'Category is required.' });
  }

  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ success: false, error: 'A valid date (YYYY-MM-DD) is required.' });
  }

  const db = readDb();
  const newTransaction = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: title.trim(),
    amount: parseFloat(numericAmount.toFixed(2)),
    type: type.toLowerCase(),
    category: category.trim(),
    date: date.substring(0, 10),
    notes: (notes || '').trim()
  };

  db.transactions.unshift(newTransaction);
  await writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Transaction recorded successfully',
    data: newTransaction
  });
}));

// PUT update transaction
app.put('/api/transactions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category, date, notes } = req.body;

  const db = readDb();
  const index = db.transactions.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: `Transaction with ID "${id}" not found.` });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Transaction title cannot be empty.' });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Amount must be a positive number greater than 0.' });
  }

  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Type must be either "income" or "expense".' });
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ success: false, error: 'Category is required.' });
  }

  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ success: false, error: 'A valid date is required.' });
  }

  db.transactions[index] = {
    ...db.transactions[index],
    title: title.trim(),
    amount: parseFloat(numericAmount.toFixed(2)),
    type: type.toLowerCase(),
    category: category.trim(),
    date: date.substring(0, 10),
    notes: (notes || '').trim()
  };

  await writeDb(db);

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    data: db.transactions[index]
  });
}));

// DELETE transaction
app.delete('/api/transactions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.transactions.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: `Transaction with ID "${id}" not found.` });
  }

  const deleted = db.transactions.splice(index, 1)[0];
  await writeDb(db);

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
    data: deleted
  });
}));

// GET & POST cards
app.get('/api/cards', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.cards || [] });
});

app.post('/api/cards', asyncHandler(async (req, res) => {
  const { holder, type, last4, expiry, balance, color } = req.body;
  const db = readDb();
  const newCard = {
    id: 'card-' + Date.now(),
    holder: holder || 'Ethan Reynolds',
    type: type || 'VISA',
    last4: last4 || Math.floor(1000 + Math.random() * 9000).toString(),
    expiry: expiry || '12/28',
    balance: parseFloat(balance || 0),
    color: color || 'gradient-orange',
    isPrimary: false
  };
  db.cards = db.cards || [];
  db.cards.push(newCard);
  await writeDb(db);
  res.json({ success: true, data: newCard });
}));

// GET & POST Subscriptions
app.get('/api/subscriptions', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.subscriptions || [] });
});

app.post('/api/subscriptions', asyncHandler(async (req, res) => {
  const { name, amount, billingCycle, nextBilling, category, icon } = req.body;
  if (!name || !amount) {
    return res.status(400).json({ success: false, error: 'Subscription name and amount required.' });
  }
  const db = readDb();
  const newSub = {
    id: 'sub-' + Date.now(),
    name: name.trim(),
    amount: parseFloat(amount),
    billingCycle: billingCycle || 'monthly',
    nextBilling: nextBilling || new Date().toISOString().substring(0, 10),
    category: category || 'Entertainment',
    icon: icon || 'CreditCard'
  };
  db.subscriptions = db.subscriptions || [];
  db.subscriptions.push(newSub);
  await writeDb(db);
  res.json({ success: true, data: newSub });
}));

app.delete('/api/subscriptions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.subscriptions = (db.subscriptions || []).filter(s => s.id !== id);
  await writeDb(db);
  res.json({ success: true });
}));

// GET & POST Savings Goals
app.get('/api/goals', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.goals || [] });
});

app.post('/api/goals', asyncHandler(async (req, res) => {
  const { title, targetAmount, currentAmount, deadline, category } = req.body;
  if (!title || !targetAmount) {
    return res.status(400).json({ success: false, error: 'Goal title and target amount required.' });
  }
  const db = readDb();
  const newGoal = {
    id: 'goal-' + Date.now(),
    title: title.trim(),
    targetAmount: parseFloat(targetAmount),
    currentAmount: parseFloat(currentAmount || 0),
    deadline: deadline || '2027-01-01',
    category: category || 'General'
  };
  db.goals = db.goals || [];
  db.goals.push(newGoal);
  await writeDb(db);
  res.json({ success: true, data: newGoal });
}));

app.put('/api/goals/:id/deposit', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const db = readDb();
  const goal = (db.goals || []).find(g => g.id === id);
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  goal.currentAmount = parseFloat((goal.currentAmount + parseFloat(amount || 0)).toFixed(2));
  await writeDb(db);
  res.json({ success: true, data: goal });
}));

app.delete('/api/goals/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.goals = (db.goals || []).filter(g => g.id !== id);
  await writeDb(db);
  res.json({ success: true });
}));

// GET & POST budget settings
app.get('/api/budget', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: { ...(db.budget || { monthlyLimit: 25000 }), currency: 'INR' }
  });
});

app.post('/api/budget', asyncHandler(async (req, res) => {
  const { monthlyLimit } = req.body;
  const limit = parseFloat(monthlyLimit);

  if (isNaN(limit) || limit < 0) {
    return res.status(400).json({ success: false, error: 'Monthly budget limit must be a non-negative number.' });
  }

  const db = readDb();
  db.budget = {
    monthlyLimit: limit,
    currency: 'INR'
  };
  await writeDb(db);

  res.json({
    success: true,
    message: 'Budget settings updated',
    data: db.budget
  });
}));

// GET analytics summary
app.get('/api/summary', (req, res) => {
  const db = readDb();
  const transactions = db.transactions || [];

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryExpenses = {};
  const monthlyData = {};

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    const monthKey = t.date ? t.date.substring(0, 7) : 'Unknown';

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    if (t.type === 'income') {
      totalIncome += amt;
      monthlyData[monthKey].income += amt;
    } else {
      totalExpenses += amt;
      monthlyData[monthKey].expenses += amt;
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + amt;
    }
  });

  const totalBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      savingsRate: Number(savingsRate),
      transactionCount: transactions.length,
      categoryExpenses,
      monthlyData,
      budget: db.budget
    }
  });
});

// ======================== WELLTHPLAN: AI HEALTH SCORE 2.0 ========================

app.get('/api/health-score', (req, res) => {
  const db = readDb();
  const transactions = db.transactions || [];
  const budget = db.budget || { monthlyLimit: 25000, currency: 'INR' };

  let totalIncome = 0;
  let totalExpenses = 0;
  let needsTotal = 0;
  let wantsTotal = 0;

  const needsCategories = ['Housing & Rent', 'Groceries', 'Education & Books', 'Transportation', 'Utilities & Bills', 'Healthcare'];

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      totalIncome += amt;
    } else {
      totalExpenses += amt;
      if (needsCategories.includes(t.category)) {
        needsTotal += amt;
      } else {
        wantsTotal += amt;
      }
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRatePct = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const budgetUtilizationPct = budget.monthlyLimit > 0 ? (totalExpenses / budget.monthlyLimit) * 100 : 0;
  const averageMonthlyExpense = totalExpenses > 0 ? totalExpenses : 1200;
  const emergencyReserveMonths = (netSavings > 0 ? netSavings : 2500) / (averageMonthlyExpense / 2 || 600);
  const wantsRatio = (needsTotal + wantsTotal) > 0 ? wantsTotal / (needsTotal + wantsTotal) : 0.35;

  let pSavings = 10;
  if (savingsRatePct >= 25) pSavings = 25;
  else if (savingsRatePct >= 20) pSavings = 22;
  else if (savingsRatePct >= 10) pSavings = 17;
  else if (savingsRatePct > 0) pSavings = 12;
  else pSavings = 4;

  let pBudget = 10;
  if (budgetUtilizationPct <= 70) pBudget = 25;
  else if (budgetUtilizationPct <= 85) pBudget = 21;
  else if (budgetUtilizationPct <= 100) pBudget = 15;
  else pBudget = 5;

  let pEmergency = 12;
  if (emergencyReserveMonths >= 3.5) pEmergency = 25;
  else if (emergencyReserveMonths >= 2.0) pEmergency = 20;
  else if (emergencyReserveMonths >= 1.0) pEmergency = 14;
  else pEmergency = 7;

  let pSpending = 12;
  if (wantsRatio <= 0.28) pSpending = 25;
  else if (wantsRatio <= 0.38) pSpending = 21;
  else if (wantsRatio <= 0.48) pSpending = 15;
  else pSpending = 8;

  const totalScore = Math.min(100, Math.max(0, pSavings + pBudget + pEmergency + pSpending));

  let tier = 'Good Momentum';
  let badgeColor = '#22c55e';
  if (totalScore >= 85) { tier = 'Excellent Standing'; badgeColor = '#22c55e'; }
  else if (totalScore >= 70) { tier = 'Good Financial Health'; badgeColor = '#ff6b00'; }
  else if (totalScore >= 50) { tier = 'Fair (Needs Tuning)'; badgeColor = '#f59e0b'; }
  else { tier = 'Critical Action Required'; badgeColor = '#ef4444'; }

  const history = {
    '30d': {
      change: '+4 pts',
      trend: 'up',
      points: [
        { label: '30d ago', score: Math.max(40, totalScore - 5) },
        { label: '20d ago', score: Math.max(40, totalScore - 3) },
        { label: '10d ago', score: Math.max(40, totalScore - 1) },
        { label: 'Today', score: totalScore }
      ]
    },
    '90d': {
      change: '+9 pts',
      trend: 'up',
      points: [
        { label: '90d ago', score: Math.max(35, totalScore - 9) },
        { label: '60d ago', score: Math.max(35, totalScore - 6) },
        { label: '30d ago', score: Math.max(35, totalScore - 4) },
        { label: 'Today', score: totalScore }
      ]
    },
    '180d': {
      change: '+14 pts',
      trend: 'up',
      points: [
        { label: '180d ago', score: Math.max(30, totalScore - 14) },
        { label: '120d ago', score: Math.max(30, totalScore - 10) },
        { label: '60d ago', score: Math.max(30, totalScore - 5) },
        { label: 'Today', score: totalScore }
      ]
    }
  };

  const scoreFactors = [
    {
      type: 'positive',
      impact: '+5 pts',
      title: 'Healthy Budget Discipline',
      description: `Maintained total monthly expenses at ${budgetUtilizationPct.toFixed(0)}% of your limit, avoiding overage penalties.`
    },
    {
      type: 'positive',
      impact: '+3 pts',
      title: 'Emergency Cushion Growth',
      description: `Reserve liquid capital covers approximately ${emergencyReserveMonths.toFixed(1)} months of baseline living expenses.`
    },
    {
      type: 'negative',
      impact: '-2 pts',
      title: 'Discretionary Outflow Spike',
      description: 'Dining out and subscriptions accounted for over 35% of total deductions in the past 14 days.'
    }
  ];

  const improvementTips = [
    {
      id: 'tip-1',
      title: 'Cap Dining & Snacks for +5 pts',
      desc: 'Trimming non-essential cafe and dining orders by 15% recovers surplus cash and lifts Spending Habits to 24/25.',
      potentialGain: '+5 pts',
      pillar: 'Spending Habits'
    },
    {
      id: 'tip-2',
      title: 'Automate 20% Income Retention',
      desc: 'Transferring 20% on paycheck day safeguards your savings buffer and secures a top-tier Savings Score.',
      potentialGain: '+3 pts',
      pillar: 'Savings Rate'
    },
    {
      id: 'tip-3',
      title: 'Consolidate Recurring Subscriptions',
      desc: 'Auditing active memberships can save recurring capital, directly enhancing your monthly budget buffer.',
      potentialGain: '+2 pts',
      pillar: 'Budget Adherence'
    }
  ];

  res.json({
    success: true,
    score: totalScore,
    tier,
    badgeColor,
    pillars: [
      {
        name: 'Savings Rate',
        score: pSavings,
        maxScore: 25,
        status: pSavings >= 20 ? 'Optimal' : pSavings >= 14 ? 'On Track' : 'Needs Work',
        metric: `${savingsRatePct.toFixed(1)}% saved`,
        desc: 'Evaluates percentage of monthly income retained'
      },
      {
        name: 'Budget Adherence',
        score: pBudget,
        maxScore: 25,
        status: pBudget >= 20 ? 'Optimal' : pBudget >= 14 ? 'Moderate' : 'Risk of Overage',
        metric: `${budgetUtilizationPct.toFixed(0)}% budget used`,
        desc: 'Measures adherence to your monthly spending cap'
      },
      {
        name: 'Emergency Reserves',
        score: pEmergency,
        maxScore: 25,
        status: pEmergency >= 20 ? 'Strong Buffer' : pEmergency >= 14 ? 'Building' : 'Low Reserve',
        metric: `${emergencyReserveMonths.toFixed(1)} months covered`,
        desc: 'Readiness for unforeseen medical or academic costs'
      },
      {
        name: 'Spending Habits',
        score: pSpending,
        maxScore: 25,
        status: pSpending >= 20 ? 'Disciplined' : pSpending >= 14 ? 'Balanced' : 'High Discretionary',
        metric: `${(wantsRatio * 100).toFixed(0)}% discretionary`,
        desc: 'Ratio of wants vs essential living necessities'
      }
    ],
    history,
    scoreFactors,
    improvementTips,
    lastUpdated: new Date().toISOString()
  });
});

// ======================== AI AGENT ENDPOINTS ========================

app.post('/api/ai/chat', (req, res) => {
  const { prompt, context } = req.body;
  const db = readDb();
  const transactions = db.transactions || [];
  const query = (prompt || '').toLowerCase().trim();

  let income = 0;
  let expenses = 0;
  const categoryMap = {};

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      income += amt;
    } else {
      expenses += amt;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
    }
  });

  const balance = income - expenses;
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
  const budgetLimit = db.budget?.monthlyLimit || 1500;
  const pctOfBudget = budgetLimit > 0 ? Math.round((expenses / budgetLimit) * 100) : 0;

  let reply = '';
  let suggestedActions = [];

  if (query.includes('save') || query.includes('cut') || query.includes('reduce')) {
    reply = `💡 **AI Savings Plan for You:**\n\n1. **Largest Spending Drain:** Your biggest expense category is **${topCategory[0]}** (₹${topCategory[1].toFixed(2)}). Trimming this by just 15% would save you **₹${(topCategory[1] * 0.15).toFixed(2)}** each month.\n2. **Subscription Audit:** Review recurring memberships (streaming, cloud tools). Halving discretionary spending can free up **₹50–₹100/mo**.\n3. **Automate Transfers:** Set aside 20% (₹${(income * 0.20).toFixed(2)}) the moment income lands.`;
    suggestedActions = ['Set budget limit to ₹' + Math.max(500, Math.round(expenses * 0.85)), 'Export CSV Report', 'View Category Chart'];
  } else if (query.includes('budget') || query.includes('limit') || query.includes('warning')) {
    reply = `📊 **Budget Status Analysis:**\n\n- **Monthly Limit:** ₹${budgetLimit.toLocaleString('en-IN')}\n- **Total Spent:** ₹${expenses.toFixed(2)} (${pctOfBudget}%)\n- **Status:** ${pctOfBudget >= 100 ? '🚨 Over budget by ₹' + (expenses - budgetLimit).toFixed(2) : pctOfBudget >= 80 ? '⚠️ Warning: Approaching 80% threshold' : '✅ Healthy (<80% allocated)'}.\n\nAccording to the **50/30/20 rule**, allocate 50% for Needs, 30% for Wants, and 20% for Savings (₹${(income * 0.2).toFixed(2)}).`;
    suggestedActions = ['Adjust Monthly Budget', 'Check Recent Expenses', 'Simulate Next Month'];
  } else if (query.includes('afford') || query.includes('can i buy') || query.includes('purchase')) {
    const numbers = query.match(/\d+(\.\d+)?/g);
    const amountToCheck = numbers ? parseFloat(numbers[0]) : 100;
    const canAfford = balance >= amountToCheck && (expenses + amountToCheck) <= budgetLimit;

    reply = canAfford
      ? `✅ **Affordability Verdict:** Yes, you can comfortably afford **₹${amountToCheck.toFixed(2)}**!\n\nYour net balance is **₹${balance.toFixed(2)}**, and after this purchase you will still have **₹${(balance - amountToCheck).toFixed(2)}** buffer remaining.`
      : `⚠️ **Caution:** A purchase of **₹${amountToCheck.toFixed(2)}** will push your current balance to **₹${(balance - amountToCheck).toFixed(2)}** and utilize ${Math.round(((expenses + amountToCheck) / budgetLimit) * 100)}% of your monthly budget limit. Consider deferring non-essentials.`;
    suggestedActions = ['Add as Pending Expense', 'Review Bank Balance'];
  } else if (query.includes('predict') || query.includes('forecast') || query.includes('next month')) {
    reply = `🔮 **AI Cashflow Projection for Next Month:**\n\n- **Projected Inflow:** ~₹${income.toFixed(2)}\n- **Projected Outflow:** ~₹${(expenses * 0.96).toFixed(2)} (if current pacing holds)\n- **Forecast Net Balance:** ~₹${(balance + 120).toFixed(2)}\n\n*Pro-tip:* If you maintain dining out under ₹150, you'll hit a record **28% net savings rate**!`;
    suggestedActions = ['Lock Target Savings', 'View Bar Chart'];
  } else {
    reply = `🤖 **FinAI Financial Copilot Report:**\n\n- **Current Balance:** ₹${balance.toFixed(2)}\n- **Total Income:** +₹${income.toFixed(2)}\n- **Total Expenses:** -₹${expenses.toFixed(2)}\n- **Dominant Outflow:** ${topCategory[0]} (₹${topCategory[1].toFixed(2)})\n- **Financial Health Score:** ${Math.min(100, Math.max(30, Math.round((balance / (income || 1)) * 100 + 40)))} / 100\n\nYou can ask me: *"How can I save ₹200?"*, *"Can I afford ₹150?"*, or type natural phrases like *"Spent ₹40 on fuel today"* to quick-log transactions!`;
    suggestedActions = ['How to save ₹200?', 'Can I afford a ₹150 item?', 'Analyze my biggest expense'];
  }

  res.json({
    success: true,
    agent: 'FinAI Agent v2.5',
    reply,
    suggestedActions,
    healthScore: Math.min(100, Math.max(30, Math.round((balance / (income || 1)) * 100 + 40))),
    timestamp: new Date().toISOString()
  });
});

// Natural language transaction parser
app.post('/api/ai/parse-transaction', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Text prompt is required.' });
  }

  const raw = text.toLowerCase();
  const amountMatch = text.match(/(?:₹|rs\.?\s*)?(\d+(\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 25.00;

  const isIncome = raw.includes('received') || raw.includes('earned') || raw.includes('got paid') || raw.includes('salary') || raw.includes('stipend') || raw.includes('grant') || raw.includes('income') || raw.includes('deposit');
  const type = isIncome ? 'income' : 'expense';

  let category = isIncome ? 'Other Income' : 'Other Expense';
  if (raw.includes('food') || raw.includes('dinner') || raw.includes('lunch') || raw.includes('coffee') || raw.includes('cafe') || raw.includes('snack') || raw.includes('restaurant')) {
    category = 'Food & Dining';
  } else if (raw.includes('grocery') || raw.includes('groceries') || raw.includes('market') || raw.includes('supermarket')) {
    category = 'Groceries';
  } else if (raw.includes('book') || raw.includes('tuition') || raw.includes('course') || raw.includes('exam') || raw.includes('college') || raw.includes('university')) {
    category = 'Education & Books';
  } else if (raw.includes('uber') || raw.includes('lyft') || raw.includes('bus') || raw.includes('metro') || raw.includes('transit') || raw.includes('gas') || raw.includes('fuel')) {
    category = 'Transportation';
  } else if (raw.includes('rent') || raw.includes('apartment') || raw.includes('housing') || raw.includes('room')) {
    category = 'Housing & Rent';
  } else if (raw.includes('netflix') || raw.includes('spotify') || raw.includes('movie') || raw.includes('game') || raw.includes('subscription')) {
    category = 'Entertainment';
  } else if (raw.includes('salary') || raw.includes('job') || raw.includes('paycheck')) {
    category = 'Salary';
  } else if (raw.includes('tutor') || raw.includes('freelance') || raw.includes('client')) {
    category = 'Freelance / Tutoring';
  } else if (raw.includes('scholarship') || raw.includes('grant')) {
    category = 'Scholarship / Grant';
  } else if (raw.includes('cloth') || raw.includes('shoes') || raw.includes('shopping') || raw.includes('amazon')) {
    category = 'Shopping';
  }

  let cleanTitle = text
    .replace(/(?:₹|rs\.?\s*)?(\d+(\.\d{1,2})?)/gi, '')
    .replace(/(spent|paid|bought|received|earned|for|on|yesterday|today|rupees|rs)/gi, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = `${category} Transaction`;
  }
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  const date = new Date().toISOString().substring(0, 10);

  res.json({
    success: true,
    data: {
      title: cleanTitle,
      amount,
      type,
      category,
      date,
      notes: `Quick-added via FinAI natural language: "${text}"`
    }
  });
});

// AI Receipt Scanner Simulation endpoint
app.post('/api/ai/scan-receipt', (req, res) => {
  const { sampleReceipt } = req.body;
  
  const receipts = {
    'campus_cafe': {
      merchant: 'University Campus Brew & Cafe',
      amount: 14.75,
      type: 'expense',
      category: 'Food & Dining',
      items: ['Caramel Oat Latte (₹5.50)', 'Avocado Sourdough Toast (₹8.25)', 'Sales Tax (₹1.00)'],
      confidence: 98.4
    },
    'bookstore': {
      merchant: 'University Academic Bookstore',
      amount: 124.99,
      type: 'expense',
      category: 'Education & Books',
      items: ['Database Systems Concept (7th Ed)', 'Engineering Graph Pad', 'Uni Pen Pack'],
      confidence: 99.1
    },
    'tech_store': {
      merchant: 'Apex Tech & Electronics',
      amount: 68.50,
      type: 'expense',
      category: 'Shopping',
      items: ['USB-C Multiport Adapter 100W', 'Ergonomic Mouse Mat'],
      confidence: 97.8
    }
  };

  const detected = receipts[sampleReceipt] || receipts['campus_cafe'];
  const date = new Date().toISOString().substring(0, 10);

  res.json({
    success: true,
    data: {
      title: detected.merchant,
      amount: detected.amount,
      type: detected.type,
      category: detected.category,
      date,
      notes: `Scanned with FinAI Vision OCR (Confidence: ${detected.confidence}%)`,
      items: detected.items
    }
  });
});

// Seed demo data
app.post('/api/seed', asyncHandler(async (req, res) => {
  await writeDb(initialData);
  res.json({
    success: true,
    message: 'Sample demo data successfully reloaded',
    data: initialData
  });
}));

// CSV export
app.get('/api/export/csv', (req, res) => {
  const db = readDb();
  const transactions = db.transactions || [];

  let csv = 'ID,Date,Title,Type,Category,Amount,Notes\n';
  transactions.forEach(t => {
    const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
    const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
    csv += `${t.id},${t.date},${cleanTitle},${t.type},"${t.category}",${t.amount},${cleanNotes}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.status(200).send(csv);
});

// Serve static
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((error, req, res, next) => {
  console.error('API request failed:', error);
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'The request could not be completed.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker API Server running at http://localhost:${PORT}`);
  console.log(`   Database: ${dataStore.mode}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
  console.log(`   AI Agent: http://localhost:${PORT}/api/ai/chat`);
});
