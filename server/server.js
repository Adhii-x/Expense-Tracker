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
app.use(express.json({ limit: '10mb' }));

// Database file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialData = {
  budget: {
    monthlyLimit: 1500,
    currency: 'USD'
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

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(initialData);
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.cards) parsed.cards = initialData.cards;
    if (!parsed.subscriptions) parsed.subscriptions = initialData.subscriptions;
    if (!parsed.goals) parsed.goals = initialData.goals;
    return parsed;
  } catch (err) {
    console.error('Error reading database, resetting to initial data:', err);
    writeDb(initialData);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

readDb();

// ======================== API ROUTES ========================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Expense Tracker REST API is operating smoothly',
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
app.post('/api/transactions', (req, res) => {
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

// GET & POST cards
app.get('/api/cards', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.cards || [] });
});

app.post('/api/cards', (req, res) => {
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
  writeDb(db);
  res.json({ success: true, data: newCard });
});

// GET & POST Subscriptions
app.get('/api/subscriptions', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.subscriptions || [] });
});

app.post('/api/subscriptions', (req, res) => {
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
  writeDb(db);
  res.json({ success: true, data: newSub });
});

app.delete('/api/subscriptions/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.subscriptions = (db.subscriptions || []).filter(s => s.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// GET & POST Savings Goals
app.get('/api/goals', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.goals || [] });
});

app.post('/api/goals', (req, res) => {
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
  writeDb(db);
  res.json({ success: true, data: newGoal });
});

app.put('/api/goals/:id/deposit', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const db = readDb();
  const goal = (db.goals || []).find(g => g.id === id);
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  goal.currentAmount = parseFloat((goal.currentAmount + parseFloat(amount || 0)).toFixed(2));
  writeDb(db);
  res.json({ success: true, data: goal });
});

app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.goals = (db.goals || []).filter(g => g.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// GET & POST budget settings
app.get('/api/budget', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db.budget || { monthlyLimit: 1500, currency: 'USD' }
  });
});

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
    reply = `💡 **AI Savings Plan for You:**\n\n1. **Largest Spending Drain:** Your biggest expense category is **${topCategory[0]}** ($${topCategory[1].toFixed(2)}). Trimming this by just 15% would save you **$${(topCategory[1] * 0.15).toFixed(2)}** each month.\n2. **Subscription Audit:** Review recurring memberships (streaming, cloud tools). Halving discretionary spending can free up **$50–$100/mo**.\n3. **Automate Transfers:** Set aside 20% ($${(income * 0.20).toFixed(2)}) the moment income lands.`;
    suggestedActions = ['Set budget limit to $' + Math.max(500, Math.round(expenses * 0.85)), 'Export CSV Report', 'View Category Chart'];
  } else if (query.includes('budget') || query.includes('limit') || query.includes('warning')) {
    reply = `📊 **Budget Status Analysis:**\n\n- **Monthly Limit:** $${budgetLimit.toLocaleString()}\n- **Total Spent:** $${expenses.toFixed(2)} (${pctOfBudget}%)\n- **Status:** ${pctOfBudget >= 100 ? '🚨 Over budget by $' + (expenses - budgetLimit).toFixed(2) : pctOfBudget >= 80 ? '⚠️ Warning: Approaching 80% threshold' : '✅ Healthy (<80% allocated)'}.\n\nAccording to the **50/30/20 rule**, allocate 50% for Needs, 30% for Wants, and 20% for Savings ($${(income * 0.2).toFixed(2)}).`;
    suggestedActions = ['Adjust Monthly Budget', 'Check Recent Expenses', 'Simulate Next Month'];
  } else if (query.includes('afford') || query.includes('can i buy') || query.includes('purchase')) {
    const numbers = query.match(/\d+(\.\d+)?/g);
    const amountToCheck = numbers ? parseFloat(numbers[0]) : 100;
    const canAfford = balance >= amountToCheck && (expenses + amountToCheck) <= budgetLimit;

    reply = canAfford
      ? `✅ **Affordability Verdict:** Yes, you can comfortably afford **$${amountToCheck.toFixed(2)}**!\n\nYour net balance is **$${balance.toFixed(2)}**, and after this purchase you will still have **$${(balance - amountToCheck).toFixed(2)}** buffer remaining.`
      : `⚠️ **Caution:** A purchase of **$${amountToCheck.toFixed(2)}** will push your current balance to **$${(balance - amountToCheck).toFixed(2)}** and utilize ${Math.round(((expenses + amountToCheck) / budgetLimit) * 100)}% of your monthly budget limit. Consider deferring non-essentials.`;
    suggestedActions = ['Add as Pending Expense', 'Review Bank Balance'];
  } else if (query.includes('predict') || query.includes('forecast') || query.includes('next month')) {
    reply = `🔮 **AI Cashflow Projection for Next Month:**\n\n- **Projected Inflow:** ~$${income.toFixed(2)}\n- **Projected Outflow:** ~$${(expenses * 0.96).toFixed(2)} (if current pacing holds)\n- **Forecast Net Balance:** ~$${(balance + 120).toFixed(2)}\n\n*Pro-tip:* If you maintain dining out under $150, you'll hit a record **28% net savings rate**!`;
    suggestedActions = ['Lock Target Savings', 'View Bar Chart'];
  } else {
    reply = `🤖 **FinAI Financial Copilot Report:**\n\n- **Current Balance:** $${balance.toFixed(2)}\n- **Total Income:** +$${income.toFixed(2)}\n- **Total Expenses:** -$${expenses.toFixed(2)}\n- **Dominant Outflow:** ${topCategory[0]} ($${topCategory[1].toFixed(2)})\n- **Financial Health Score:** ${Math.min(100, Math.max(30, Math.round((balance / (income || 1)) * 100 + 40)))} / 100\n\nYou can ask me: *"How can I save $200?"*, *"Can I afford $150?"*, or type natural phrases like *"Spent $40 on fuel today"* to quick-log transactions!`;
    suggestedActions = ['How to save $200?', 'Can I afford a $150 item?', 'Analyze my biggest expense'];
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
  const amountMatch = text.match(/\$?(\d+(\.\d{1,2})?)/);
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
    .replace(/\$?(\d+(\.\d{1,2})?)/g, '')
    .replace(/(spent|paid|bought|received|earned|for|on|yesterday|today|dollars|usd)/gi, '')
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
      items: ['Caramel Oat Latte ($5.50)', 'Avocado Sourdough Toast ($8.25)', 'Sales Tax ($1.00)'],
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
app.post('/api/seed', (req, res) => {
  writeDb(initialData);
  res.json({
    success: true,
    message: 'Sample demo data successfully reloaded',
    data: initialData
  });
});

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

app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker API Server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
  console.log(`   AI Agent: http://localhost:${PORT}/api/ai/chat`);
});
