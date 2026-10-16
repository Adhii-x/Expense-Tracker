import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import SummaryCards from './components/SummaryCards';
import BudgetTracker from './components/BudgetTracker';
import TransactionForm from './components/TransactionForm';
import ExpenseChart from './components/ExpenseChart';
import TransactionList from './components/TransactionList';
import EditModal from './components/EditModal';
import Toast from './components/Toast';

import {
  testBackendConnection,
  fetchTransactionsApi,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
  fetchBudgetApi,
  saveBudgetApi,
  seedDemoDataApi
} from './services/api';
import { downloadCsv } from './utils';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('expensetracker_theme') === 'dark' ||
      (!('expensetracker_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // State
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({ monthlyLimit: 1500, currency: 'USD' });
  const [currency, setCurrency] = useState('USD');
  const [backendOnline, setBackendOnline] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  
  // Filters & Modal
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('expensetracker_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('expensetracker_theme', 'light');
    }
  }, [darkMode]);

  // Check backend and load initial data
  const checkBackendAndLoad = useCallback(async () => {
    setIsCheckingBackend(true);
    const isOnline = await testBackendConnection();
    setBackendOnline(isOnline);
    setIsCheckingBackend(false);

    // Fetch transactions
    const txData = await fetchTransactionsApi(isOnline);
    setTransactions(txData);

    // Fetch budget
    const budgetData = await fetchBudgetApi(isOnline);
    if (budgetData) {
      setBudget(budgetData);
      if (budgetData.currency) {
        setCurrency(budgetData.currency);
      }
    }
  }, []);

  useEffect(() => {
    checkBackendAndLoad();
  }, [checkBackendAndLoad]);

  // Update currency when changed
  const handleCurrencyChange = async (newCurr) => {
    setCurrency(newCurr);
    const updatedBudget = { ...budget, currency: newCurr };
    setBudget(updatedBudget);
    await saveBudgetApi(updatedBudget, backendOnline);
    showToast(`Currency changed to ${newCurr}`, 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Add transaction
  const handleAddTransaction = async (data) => {
    try {
      const created = await createTransactionApi(data, backendOnline);
      setTransactions(prev => [created, ...prev]);
      showToast(`${created.type === 'income' ? 'Income' : 'Expense'} "${created.title}" added successfully!`);
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to add transaction', 'warning');
      return false;
    }
  };

  // Update transaction
  const handleUpdateTransaction = async (updatedTx) => {
    try {
      const updated = await updateTransactionApi(updatedTx.id, updatedTx, backendOnline);
      setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setEditingTransaction(null);
      showToast(`Updated "${updated.title}" successfully!`);
    } catch (err) {
      showToast('Failed to update transaction', 'warning');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransactionApi(id, backendOnline);
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast('Transaction deleted', 'info');
    } catch (err) {
      showToast('Failed to delete transaction', 'warning');
    }
  };

  // Save budget limit
  const handleSaveBudget = async (newLimit) => {
    const updated = { ...budget, monthlyLimit: newLimit };
    setBudget(updated);
    await saveBudgetApi(updated, backendOnline);
    showToast('Monthly budget limit updated!');
  };

  // Export to CSV
  const handleExportCsv = () => {
    // If month/category filter is active, export filtered transactions
    const toExport = transactions.filter(t => {
      if (selectedMonth !== 'All' && (!t.date || !t.date.startsWith(selectedMonth))) return false;
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      return true;
    });

    downloadCsv(toExport.length > 0 ? toExport : transactions, currency);
    showToast(`Exported ${toExport.length > 0 ? toExport.length : transactions.length} transactions to CSV!`, 'success');
  };

  // Reset to Demo Data
  const handleResetDemo = async () => {
    if (window.confirm('Reset transactions to student sample demo data? (Existing records will be refreshed)')) {
      const demoList = await seedDemoDataApi(backendOnline);
      setTransactions(demoList);
      showToast('Loaded sample demo transactions!', 'info');
    }
  };

  // Financial calculations
  const { totalIncome, totalExpenses, totalBalance, incomeCount, expenseCount } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let incCount = 0;
    let expCount = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
        incCount++;
      } else {
        expenses += amt;
        expCount++;
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses,
      incomeCount: incCount,
      expenseCount: expCount
    };
  }, [transactions]);

  // Expenses for the currently active/selected month (or current calendar month)
  const currentMonthExpenses = useMemo(() => {
    const targetMonth = selectedMonth !== 'All' 
      ? selectedMonth 
      : new Date().toISOString().substring(0, 7);

    return transactions
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, selectedMonth]);

  const activeMonthLabel = selectedMonth !== 'All' 
    ? selectedMonth 
    : `${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} (Current)`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sticky Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currency={currency}
        setCurrency={handleCurrencyChange}
        backendOnline={backendOnline}
        checkBackend={checkBackendAndLoad}
        onExportCsv={handleExportCsv}
        onResetDemo={handleResetDemo}
        isCheckingBackend={isCheckingBackend}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero / Header greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Health Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track income, manage expenses, monitor budget thresholds, and explore visual data insights.
          </p>
        </div>

        {/* 1. Summary Metric Cards */}
        <SummaryCards
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          currency={currency}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
        />

        {/* 2. Monthly Budget Tracker with Visual Warning Alerts */}
        <BudgetTracker
          currentMonthExpenses={currentMonthExpenses}
          budgetLimit={budget.monthlyLimit}
          onSaveBudget={handleSaveBudget}
          currency={currency}
          activeMonth={activeMonthLabel}
        />

        {/* 3. Two-Column Layout: Add Transaction Form & Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-8">
          
          {/* Left Column: Form to Add Transaction (5 cols) */}
          <div className="lg:col-span-5">
            <TransactionForm
              onAddTransaction={handleAddTransaction}
              currency={currency}
            />
          </div>

          {/* Right Column: Visual Charts (7 cols) */}
          <div className="lg:col-span-7">
            <ExpenseChart
              transactions={transactions}
              currency={currency}
              darkMode={darkMode}
            />
          </div>

        </div>

        {/* 4. Transaction List with Real-time Filters & Actions */}
        <div className="mb-12">
          <TransactionList
            transactions={transactions}
            onEdit={(tx) => setEditingTransaction(tx)}
            onDelete={handleDeleteTransaction}
            currency={currency}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} Expense Tracker with Chart • Final Year Computer Science Project
          </p>
          <p className="flex items-center gap-2">
            <span>Client: React + Vite + Tailwind CSS</span>
            <span>•</span>
            <span>Server: Express REST API + SQLite/JSON</span>
          </p>
        </div>
      </footer>

      {/* Edit Transaction Modal */}
      <EditModal
        transaction={editingTransaction}
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateTransaction}
        currency={currency}
      />

      {/* Toast Alert Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
