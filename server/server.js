import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialData = {
  budget: {
    monthlyLimit: 1500,
    currency: 'USD'
  },
  transactions: [
    {
      id: 'tx-1',
      title: 'Campus Bookstore - Textbooks',
      amount: 145.50,
      type: 'expense',
      category: 'Education',
      date: '2026-10-02',
      notes: 'Semester textbooks'
    },
    {
      id: 'tx-2',
      title: 'Monthly University Grant / Scholarship',
      amount: 1200.00,
      type: 'income',
      category: 'Scholarship',
      date: '2026-10-01',
      notes: 'Direct deposit'
    },
    {
      id: 'tx-3',
      title: 'Grocery Store Essentials',
      amount: 86.20,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-10-05',
      notes: 'Weekly groceries'
    },
    {
      id: 'tx-4',
      title: 'Part-Time Web Tutor',
      amount: 450.00,
      type: 'income',
      category: 'Freelance',
      date: '2026-10-08',
      notes: 'Coding lessons for freshman'
    },
    {
      id: 'tx-5',
      title: 'Student Apartment Rent & Utilities',
      amount: 650.00,
      type: 'expense',
      category: 'Housing',
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

// Helper to read database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(initialData);
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database, resetting to initial data:', err);
    writeDb(initialData);
    return initialData;
  }
}

// Helper to write database
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// Initialize on start
readDb();

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Expense Tracker REST API is operating smoothly',
    timestamp: new Date().toISOString()
  });
});

// GET all transactions (with optional category, month, and type query params)
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
    // Month is expected as 'YYYY-MM'
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

  // Sort by date descending by default
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// POST new transaction
app.post('/api/transactions', (req, res) => {
  const { title, amount, type, category, date, notes } = req.body;

  // Validation
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
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Transaction recorded successfully',
    data: newTransaction
  });
});

// PUT update transaction
app.put('/api/transactions/:id', (req, res) => {
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

  writeDb(db);

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    data: db.transactions[index]
  });
});

// DELETE transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.transactions.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: `Transaction with ID "${id}" not found.` });
  }

  const deleted = db.transactions.splice(index, 1)[0];
  writeDb(db);

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
    data: deleted
  });
});

// GET budget settings
app.get('/api/budget', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db.budget || { monthlyLimit: 1500, currency: 'USD' }
  });
});

// POST / PUT budget settings
app.post('/api/budget', (req, res) => {
  const { monthlyLimit, currency } = req.body;
  const limit = parseFloat(monthlyLimit);

  if (isNaN(limit) || limit < 0) {
    return res.status(400).json({ success: false, error: 'Monthly budget limit must be a non-negative number.' });
  }

  const db = readDb();
  db.budget = {
    monthlyLimit: limit,
    currency: currency || db.budget?.currency || 'USD'
  };
  writeDb(db);

  res.json({
    success: true,
    message: 'Budget settings updated',
    data: db.budget
  });
});

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

// POST seed sample data
app.post('/api/seed', (req, res) => {
  writeDb(initialData);
  res.json({
    success: true,
    message: 'Sample demo data successfully reloaded',
    data: initialData
  });
});

// GET CSV export directly
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

// Serve frontend production build if exists
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker API Server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
});
