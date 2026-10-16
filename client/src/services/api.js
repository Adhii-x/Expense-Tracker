import { INITIAL_TRANSACTIONS } from '../constants';

const STORAGE_KEY_TX = 'expensetracker_transactions_v1';
const STORAGE_KEY_BUDGET = 'expensetracker_budget_v1';
const STORAGE_KEY_CARDS = 'expensetracker_cards_v1';

const API_BASE = '/api';

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

// Helper to check if backend is reachable
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
    console.error('Error reading localStorage:', e);
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
      const def = { monthlyLimit: 1500, currency: 'USD' };
      localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(def));
      return def;
    }
    return JSON.parse(stored);
  } catch (e) {
    return { monthlyLimit: 1500, currency: 'USD' };
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
    } catch (e) {
      console.warn('Backend fetch failed, falling back to localStorage');
    }
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
      } else {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create transaction on server');
      }
    } catch (e) {
      console.warn('Backend creation failed, creating locally:', e.message);
    }
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
    } catch (e) {
      console.warn('Backend update failed, updating locally');
    }
  }

  const current = getLocalTransactions();
  const updated = current.map(t => (t.id === id ? { ...t, ...transactionData } : t));
  saveLocalTransactions(updated);
  return { id, ...transactionData };
}

export async function deleteTransactionApi(id, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const current = getLocalTransactions();
        saveLocalTransactions(current.filter(t => t.id !== id));
        return true;
      }
    } catch (e) {
      console.warn('Backend delete failed, deleting locally');
    }
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
    } catch (e) {
      console.warn('Backend budget fetch failed');
    }
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
    } catch (e) {
      console.warn('Backend budget save failed');
    }
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
    } catch (e) {
      console.warn('Backend cards fetch failed');
    }
  }
  return getLocalCards();
}

export async function seedDemoDataApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/seed`, { method: 'POST' });
    } catch (e) {
      console.warn('Backend seed failed');
    }
  }
  saveLocalTransactions(INITIAL_TRANSACTIONS);
  saveLocalCards(INITIAL_CARDS);
  return INITIAL_TRANSACTIONS;
}

// ----------------- AI AGENT INTEGRATION -----------------

export async function askAiAgentApi(prompt, context, isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn('Backend AI failed, using client-side AI heuristics');
    }
  }

  // Client-Side AI Heuristics Engine (Runs smoothly anywhere, including Vercel!)
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
    reply = `💡 **FinAI Personalized Savings Strategy:**\n\n1. **High Outflow Area:** Your top expense driver is **${topCategory[0]}** ($${topCategory[1].toFixed(2)}). Reducing this by 15% recovers **$${(topCategory[1] * 0.15).toFixed(2)}** every month.\n2. **Micro-Spends Alert:** Small daily purchases accumulate rapidly. Setting a $10/day discretionary cap yields **$300/mo** in surplus cashflow.\n3. **Automate the 20% Rule:** Move $${(totalIncome * 0.20).toFixed(2)} straight to your savings card on deposit day.`;
    suggestedActions = ['Set strict budget limit', 'Export CSV ledger', 'Review category pie chart'];
  } else if (query.includes('budget') || query.includes('limit') || query.includes('warning')) {
    reply = `📊 **Real-time Budget Audit:**\n\n- **Monthly Allowance:** $${budgetLimit.toLocaleString()}\n- **Current Spend:** $${totalExpenses.toFixed(2)} (${pct}% allocated)\n- **Status:** ${pct >= 100 ? '🚨 Exceeded threshold by $' + (totalExpenses - budgetLimit).toFixed(2) : pct >= 80 ? '⚠️ Warning: Near maximum allocation' : '✅ Optimal budget buffer remaining'}.\n\n*Recommendation:* Allocate 50% for Essentials, 30% for Personal Lifestyle, and 20% for Wealth Creation.`;
    suggestedActions = ['Adjust budget threshold', 'Audit recent transactions'];
  } else if (query.includes('afford') || query.includes('buy') || query.includes('purchase')) {
    const nums = query.match(/\d+(\.\d+)?/g);
    const amount = nums ? parseFloat(nums[0]) : 120;
    const canAfford = totalBalance >= amount && (totalExpenses + amount) <= budgetLimit;

    reply = canAfford
      ? `✅ **Affordability Approved:** You can safely afford **$${amount.toFixed(2)}**!\n\nYour net reserve is **$${totalBalance.toFixed(2)}**. Following this purchase, you'll still hold **$${(totalBalance - amount).toFixed(2)}** in liquidity.`
      : `⚠️ **Caution Advised:** Spending **$${amount.toFixed(2)}** will reduce your reserves to **$${(totalBalance - amount).toFixed(2)}** and drive budget utilization to ${Math.round(((totalExpenses + amount) / budgetLimit) * 100)}%. We suggest waiting until the next income cycle.`;
    suggestedActions = ['Log as planned expense', 'Check card balances'];
  } else if (query.includes('predict') || query.includes('forecast') || query.includes('trend')) {
    reply = `🔮 **30-Day Predictive Cashflow Model:**\n\n- **Projected Inflow:** ~$${totalIncome.toFixed(2)}\n- **Projected Outflow:** ~$${(totalExpenses * 0.94).toFixed(2)}\n- **Expected Net Surplus:** ~$${(totalBalance + 150).toFixed(2)}\n\nYour cash retention rate has improved by **+3.52%** compared to previous cycles!`;
    suggestedActions = ['View monthly bar chart', 'Lock target savings'];
  } else {
    reply = `🤖 **FinAI Copilot Intelligence Report:**\n\n- **Net Balance:** $${totalBalance.toFixed(2)}\n- **Income Flow:** +$${totalIncome.toFixed(2)}\n- **Expense Outflow:** -$${totalExpenses.toFixed(2)}\n- **Financial Health Score:** ${healthScore} / 100\n- **Dominant Category:** ${topCategory[0]} ($${topCategory[1].toFixed(2)})\n\nAsk me anything about budgeting, or say *"Spent $45 on groceries"* to quick-record entries!`;
    suggestedActions = ['How can I save $200?', 'Can I afford a $100 purchase?', 'Audit my budget limit'];
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
    } catch (e) {
      console.warn('Backend parse failed, parsing locally');
    }
  }

  const raw = text.toLowerCase();
  const amountMatch = text.match(/\$?(\d+(\.\d{1,2})?)/);
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
    .replace(/\$?(\d+(\.\d{1,2})?)/g, '')
    .replace(/(spent|paid|bought|received|earned|for|on|yesterday|today|dollars|usd)/gi, '')
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
