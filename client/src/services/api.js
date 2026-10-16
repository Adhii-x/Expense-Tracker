import { INITIAL_TRANSACTIONS } from '../constants';

const STORAGE_KEY_TX = 'expensetracker_transactions_v1';
const STORAGE_KEY_BUDGET = 'expensetracker_budget_v1';

// Base API URL (proxied in Vite or direct)
const API_BASE = '/api';

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

// ----------------- UNIFIED API CLIENT -----------------

export async function fetchTransactionsApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      if (res.ok) {
        const json = await res.json();
        saveLocalTransactions(json.data); // sync local cache
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

  // Local storage creation
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

  // Local storage update
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

  // Local storage delete
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

export async function seedDemoDataApi(isBackendOnline) {
  if (isBackendOnline) {
    try {
      await fetch(`${API_BASE}/seed`, { method: 'POST' });
    } catch (e) {
      console.warn('Backend seed failed');
    }
  }
  saveLocalTransactions(INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
}
