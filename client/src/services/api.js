import { INITIAL_TRANSACTIONS } from '../constants';

const STORAGE_KEY_TX = 'expensetracker_transactions_v1';
const STORAGE_KEY_BUDGET = 'expensetracker_budget_v1';
const STORAGE_KEY_CARDS = 'expensetracker_cards_v1';
const STORAGE_KEY_SUBS = 'expensetracker_subscriptions_v1';
const STORAGE_KEY_GOALS = 'expensetracker_goals_v1';

const API_BASE = '/api';

// Shared credential-aware request helper for cookie-authenticated endpoints.
export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error('Can’t reach the authentication service. Check that the API server is running.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'This authentication feature is not available on the server yet.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const INITIAL_CARDS = [
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
];

export const INITIAL_SUBSCRIPTIONS = [
  { id: 'sub-1', name: 'GitHub Copilot Pro', amount: 10.00, billingCycle: 'monthly', nextBilling: '2026-11-01', category: 'Education & Books', icon: 'Code' },
  { id: 'sub-2', name: 'Spotify Student Pass', amount: 5.99, billingCycle: 'monthly', nextBilling: '2026-10-25', category: 'Entertainment', icon: 'Music' },
  { id: 'sub-3', name: 'ChatGPT Plus', amount: 20.00, billingCycle: 'monthly', nextBilling: '2026-11-05', category: 'Education & Books', icon: 'Bot' },
  { id: 'sub-4', name: 'Campus Rec Fitness', amount: 25.00, billingCycle: 'monthly', nextBilling: '2026-10-28', category: 'Healthcare', icon: 'Dumbbell' }
];

export const INITIAL_GOALS = [
  { id: 'goal-1', title: 'MacBook Pro M3 Fund', targetAmount: 1800, currentAmount: 1350, deadline: '2026-12-15', category: 'Tech' },
  { id: 'goal-2', title: 'Emergency Reserve Buffer', targetAmount: 3000, currentAmount: 2450, deadline: '2027-01-31', category: 'Safety' },
  { id: 'goal-3', title: 'Summer Hackathon Trip', targetAmount: 600, currentAmount: 430, deadline: '2027-04-10', category: 'Travel' }
];

export async function testBackendConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
}

// ----------------- LOCAL STORAGE HELPERS -----------------
export function getLocalTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TX);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveLocalTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function getLocalBudget() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BUDGET);
    if (!stored) {
      const def = { monthlyLimit: 25000, currency: 'INR' };
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(def));
      return def;
    }
    const budget = { ...JSON.parse(stored), currency: 'INR' };
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));
    return budget;
  } catch (e) {
    return { monthlyLimit: 25000, currency: 'INR' };
  }
}

export function saveLocalBudget(budget) {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));
  } catch (e) {
    console.error('Error saving budget to localStorage:', e);
  }
}

export function getLocalCards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CARDS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(INITIAL_CARDS));
      return INITIAL_CARDS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_CARDS;
  }
}

export function saveLocalCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Error saving cards to localStorage:', e);
  }
}

export function getLocalSubscriptions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUBS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_SUBSCRIPTIONS;
  }
}

export function saveLocalSubscriptions(subs) {
  try {
    localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(subs));
  } catch (e) {}
}

export function getLocalGoals() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GOALS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(INITIAL_GOALS));
      return INITIAL_GOALS;
    }
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_GOALS;
  }
}

export function saveLocalGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  } catch (e) {}
}

// ----------------- UNIFIED API CLIENT -----------------

export async function fetchTransactionsApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      if (res.ok) {
        const json = await res.json();
        saveLocalTransactions(json.data);
        return json.data;
      }
    } catch (e) {}
  }
  return getLocalTransactions();
}

export async function createTransactionApi(transactionData, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (res.ok) {
        const json = await res.json();
        const current = getLocalTransactions();
        saveLocalTransactions([json.data, ...current]);
        return json.data;
      }
    } catch (e) {}
  }

  const current = getLocalTransactions();
  const newTx = {
    ...transactionData,
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
  };
  const updated = [newTx, ...current];
  saveLocalTransactions(updated);
  return newTx;
}

export async function updateTransactionApi(id, transactionData, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (res.ok) {
        const json = await res.json();
        const current = getLocalTransactions();
        const updated = current.map(t => (t.id === id ? json.data : t));
        saveLocalTransactions(updated);
        return json.data;
      }
    } catch (e) {}
  }

  const current = getLocalTransactions();
  const updated = current.map(t => (t.id === id ? { ...t, ...transactionData } : t));
  saveLocalTransactions(updated);
  return { id, ...transactionData };
}

export async function deleteTransactionApi(id, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const current = getLocalTransactions();
        saveLocalTransactions(current.filter(t => t.id !== id));
        return true;
      }
    } catch (e) {}
  }

  const current = getLocalTransactions();
  const filtered = current.filter(t => t.id !== id);
  saveLocalTransactions(filtered);
  return true;
}

export async function fetchBudgetApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/budget`);
      if (res.ok) {
        const json = await res.json();
        saveLocalBudget(json.data);
        return json.data;
      }
    } catch (e) {}
  }
  return getLocalBudget();
}

export async function saveBudgetApi(budgetData, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
      });
      if (res.ok) {
        const json = await res.json();
        saveLocalBudget(json.data);
        return json.data;
      }
    } catch (e) {}
  }

  saveLocalBudget(budgetData);
  return budgetData;
}

export async function fetchCardsApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/cards`);
      if (res.ok) {
        const json = await res.json();
        saveLocalCards(json.data);
        return json.data;
      }
    } catch (e) {}
  }
  return getLocalCards();
}

// Subscriptions
export async function fetchSubscriptionsApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/subscriptions`);
      if (res.ok) {
        const json = await res.json();
        saveLocalSubscriptions(json.data);
        return json.data;
      }
    } catch (e) {}
  }
  return getLocalSubscriptions();
}

export async function createSubscriptionApi(sub, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
      if (res.ok) {
        const json = await res.json();
        const cur = getLocalSubscriptions();
        saveLocalSubscriptions([...cur, json.data]);
        return json.data;
      }
    } catch (e) {}
  }
  const cur = getLocalSubscriptions();
  const created = { ...sub, id: 'sub-' + Date.now() };
  saveLocalSubscriptions([...cur, created]);
  return created;
}

export async function deleteSubscriptionApi(id, isBackendOnline) {
  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/subscriptions/${id}`, { method: 'DELETE' });
    } catch (e) {}
  }
  const cur = getLocalSubscriptions();
  saveLocalSubscriptions(cur.filter(s => s.id !== id));
  return true;
}

// Goals
export async function fetchGoalsApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/goals`);
      if (res.ok) {
        const json = await res.json();
        saveLocalGoals(json.data);
        return json.data;
      }
    } catch (e) {}
  }
  return getLocalGoals();
}

export async function createGoalApi(goal, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      if (res.ok) {
        const json = await res.json();
        const cur = getLocalGoals();
        saveLocalGoals([...cur, json.data]);
        return json.data;
      }
    } catch (e) {}
  }
  const cur = getLocalGoals();
  const created = { ...goal, id: 'goal-' + Date.now() };
  saveLocalGoals([...cur, created]);
  return created;
}

export async function depositGoalApi(id, amount, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/goals/${id}/deposit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const json = await res.json();
        const cur = getLocalGoals();
        saveLocalGoals(cur.map(g => (g.id === id ? json.data : g)));
        return json.data;
      }
    } catch (e) {}
  }
  const cur = getLocalGoals();
  const updated = cur.map(g => {
    if (g.id === id) {
      return { ...g, currentAmount: parseFloat((g.currentAmount + parseFloat(amount)).toFixed(2)) };
    }
    return g;
  });
  saveLocalGoals(updated);
  return updated.find(g => g.id === id);
}

export async function deleteGoalApi(id, isBackendOnline) {
  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/goals/${id}`, { method: 'DELETE' });
    } catch (e) {}
  }
  const cur = getLocalGoals();
  saveLocalGoals(cur.filter(g => g.id !== id));
  return true;
}

// Receipt Scanning
export async function scanReceiptApi(sampleReceipt, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/ai/scan-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleReceipt })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
  }

  // Client-side OCR fallback
  const samples = {
    campus_cafe: {
      title: 'University Campus Brew & Cafe',
      amount: 14.75,
      type: 'expense',
      category: 'Food & Dining',
      items: ['Caramel Oat Latte (₹5.50)', 'Avocado Sourdough Toast (₹8.25)', 'Tax (₹1.00)'],
      notes: 'Scanned with FinAI Vision OCR (Confidence: 98.4%)'
    },
    bookstore: {
      title: 'University Academic Bookstore',
      amount: 124.99,
      type: 'expense',
      category: 'Education & Books',
      items: ['Algorithms & Data Structures (4th Ed)', 'Engineering Graph Pad'],
      notes: 'Scanned with FinAI Vision OCR (Confidence: 99.1%)'
    },
    tech_store: {
      title: 'Apex Tech & Electronics',
      amount: 68.50,
      type: 'expense',
      category: 'Shopping',
      items: ['USB-C Multiport Hub 100W', 'Ergonomic Desk Mat'],
      notes: 'Scanned with FinAI Vision OCR (Confidence: 97.8%)'
    }
  };

  const detected = samples[sampleReceipt] || samples.campus_cafe;
  return {
    ...detected,
    date: new Date().toISOString().substring(0, 10)
  };
}

export async function seedDemoDataApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/seed`, { method: 'POST' });
    } catch (e) {}
  }
  saveLocalTransactions(INITIAL_TRANSACTIONS);
  saveLocalCards(INITIAL_CARDS);
  saveLocalSubscriptions(INITIAL_SUBSCRIPTIONS);
  saveLocalGoals(INITIAL_GOALS);
  return INITIAL_TRANSACTIONS;
}

// AI Agent
export async function askAiAgentApi(prompt, context, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
  }

  const { totalBalance = 0, totalIncome = 0, totalExpenses = 0, transactions = [], budget = {} } = context || {};
  const query = (prompt || '').toLowerCase();

  const categoryMap = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    }
  });

  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0] || ['Living Expenses', 0];
  const budgetLimit = budget.monthlyLimit || 1500;
  const pct = budgetLimit > 0 ? Math.round((totalExpenses / budgetLimit) * 100) : 0;
  const healthScore = Math.min(100, Math.max(35, Math.round((totalBalance / (totalIncome || 1)) * 100 + 42)));

  let reply = '';
  let suggestedActions = [];

  if (query.includes('save') || query.includes('cut') || query.includes('reduce')) {
    reply = `💡 **FinAI Personalized Savings Strategy:**\n\n1. **High Outflow Area:** Your top expense driver is **${topCategory[0]}** (₹${topCategory[1].toFixed(2)}). Reducing this by 15% recovers **₹${(topCategory[1] * 0.15).toFixed(2)}** every month.\n2. **Micro-Spends Alert:** Small daily purchases accumulate rapidly. Setting a ₹10/day discretionary cap yields **₹300/mo** in surplus cashflow.\n3. **Automate the 20% Rule:** Move ₹${(totalIncome * 0.20).toFixed(2)} straight to your savings card on deposit day.`;
    suggestedActions = ['Set strict budget limit', 'Export CSV ledger', 'Review category pie chart'];
  } else if (query.includes('budget') || query.includes('limit') || query.includes('warning')) {
    reply = `📊 **Real-time Budget Audit:**\n\n- **Monthly Allowance:** ₹${budgetLimit.toLocaleString('en-IN')}\n- **Current Spend:** ₹${totalExpenses.toFixed(2)} (${pct}% allocated)\n- **Status:** ${pct >= 100 ? '🚨 Exceeded threshold by ₹' + (totalExpenses - budgetLimit).toFixed(2) : pct >= 80 ? '⚠️ Warning: Near maximum allocation' : '✅ Optimal budget buffer remaining'}.\n\n*Recommendation:* Allocate 50% for Essentials, 30% for Personal Lifestyle, and 20% for Wealth Creation.`;
    suggestedActions = ['Adjust budget threshold', 'Audit recent transactions'];
  } else if (query.includes('afford') || query.includes('buy') || query.includes('purchase')) {
    const nums = query.match(/\d+(\.\d+)?/g);
    const amount = nums ? parseFloat(nums[0]) : 120;
    const canAfford = totalBalance >= amount && (totalExpenses + amount) <= budgetLimit;

    reply = canAfford
      ? `✅ **Affordability Approved:** You can safely afford **₹${amount.toFixed(2)}**!\n\nYour net reserve is **₹${totalBalance.toFixed(2)}**. Following this purchase, you'll still hold **₹${(totalBalance - amount).toFixed(2)}** in liquidity.`
      : `⚠️ **Caution Advised:** Spending **₹${amount.toFixed(2)}** will reduce your reserves to **₹${(totalBalance - amount).toFixed(2)}** and drive budget utilization to ${Math.round(((totalExpenses + amount) / budgetLimit) * 100)}%. We suggest waiting until the next income cycle.`;
    suggestedActions = ['Log as planned expense', 'Check card balances'];
  } else if (query.includes('predict') || query.includes('forecast') || query.includes('trend')) {
    reply = `🔮 **30-Day Predictive Cashflow Model:**\n\n- **Projected Inflow:** ~₹${totalIncome.toFixed(2)}\n- **Projected Outflow:** ~₹${(totalExpenses * 0.94).toFixed(2)}\n- **Expected Net Surplus:** ~₹${(totalBalance + 150).toFixed(2)}\n\nYour cash retention rate has improved by **+3.52%** compared to previous cycles!`;
    suggestedActions = ['View monthly bar chart', 'Lock target savings'];
  } else {
    reply = `🤖 **FinAI Copilot Intelligence Report:**\n\n- **Net Balance:** ₹${totalBalance.toFixed(2)}\n- **Income Flow:** +₹${totalIncome.toFixed(2)}\n- **Expense Outflow:** -₹${totalExpenses.toFixed(2)}\n- **Financial Health Score:** ${healthScore} / 100\n- **Dominant Category:** ${topCategory[0]} (₹${topCategory[1].toFixed(2)})\n\nAsk me anything about budgeting, or say *"Spent ₹45 on groceries"* to quick-record entries!`;
    suggestedActions = ['How can I save ₹200?', 'Can I afford a ₹100 purchase?', 'Audit my budget limit'];
  }

  return {
    success: true,
    agent: 'FinAI Agent v2.5 (Smart Client Mode)',
    reply,
    suggestedActions,
    healthScore,
    timestamp: new Date().toISOString()
  };
}

export async function parseNaturalLanguageTransactionApi(text, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/ai/parse-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
  }

  const raw = text.toLowerCase();
  const amountMatch = text.match(/(?:₹|rs\.?\s*)?(\d+(\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 25.00;

  const isIncome = raw.includes('received') || raw.includes('earned') || raw.includes('got paid') || raw.includes('salary') || raw.includes('stipend') || raw.includes('grant') || raw.includes('income');
  const type = isIncome ? 'income' : 'expense';

  let category = isIncome ? 'Other Income' : 'Other Expense';
  if (raw.includes('food') || raw.includes('dinner') || raw.includes('lunch') || raw.includes('coffee') || raw.includes('cafe')) category = 'Food & Dining';
  else if (raw.includes('grocery') || raw.includes('groceries')) category = 'Groceries';
  else if (raw.includes('book') || raw.includes('tuition') || raw.includes('course')) category = 'Education & Books';
  else if (raw.includes('uber') || raw.includes('lyft') || raw.includes('bus') || raw.includes('transit') || raw.includes('gas')) category = 'Transportation';
  else if (raw.includes('rent') || raw.includes('apartment') || raw.includes('housing')) category = 'Housing & Rent';
  else if (raw.includes('netflix') || raw.includes('spotify') || raw.includes('movie') || raw.includes('subscription')) category = 'Entertainment';
  else if (raw.includes('salary') || raw.includes('paycheck')) category = 'Salary';
  else if (raw.includes('tutor') || raw.includes('freelance')) category = 'Freelance / Tutoring';
  else if (raw.includes('scholarship')) category = 'Scholarship / Grant';
  else if (raw.includes('shoes') || raw.includes('cloth') || raw.includes('shopping')) category = 'Shopping';

  let cleanTitle = text
    .replace(/(?:₹|rs\.?\s*)?(\d+(\.\d{1,2})?)/gi, '')
    .replace(/(spent|paid|bought|received|earned|for|on|yesterday|today|rupees|rs)/gi, '')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = `${category} Entry`;
  }
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  return {
    title: cleanTitle,
    amount,
    type,
    category,
    date: new Date().toISOString().substring(0, 10),
    notes: `Quick-added via FinAI Copilot: "${text}"`
  };
}

// ----------------- WELLTHPLAN: HEALTH SCORE 2.0 -----------------

export async function fetchHealthScoreApi(isBackendOnline, context) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/health-score`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
  }

  // Client-side calculations fallback for 100% Vercel / Offline autonomy
  const { totalBalance = 0, totalIncome = 0, totalExpenses = 0, transactions = [], budget = { monthlyLimit: 1500 } } = context || {};

  let needsTotal = 0;
  let wantsTotal = 0;
  const needsCategories = ['Housing & Rent', 'Groceries', 'Education & Books', 'Transportation', 'Utilities & Bills', 'Healthcare'];

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'expense') {
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
  const emergencyReserveMonths = (netSavings > 0 ? netSavings : 2500) / (totalExpenses > 0 ? totalExpenses / 2 : 600);
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

  return {
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
  };
}
