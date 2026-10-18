import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import FinovaDashboard from './components/FinovaDashboard';
import FinovaTransactions from './components/FinovaTransactions';
import FinovaAnalytics from './components/FinovaAnalytics';
import FinovaBudgets from './components/FinovaBudgets';
import FinovaSettings from './components/FinovaSettings';
import QuickTransferModal from './components/QuickTransferModal';
import AiCopilotModal from './components/AiCopilotModal';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import CommandPalette from './components/CommandPalette';
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
  fetchCardsApi,
  fetchGoalsApi,
  createGoalApi,
  depositGoalApi,
  deleteGoalApi,
  fetchSubscriptionsApi,
  createSubscriptionApi,
  deleteSubscriptionApi,
  seedDemoDataApi
} from './services/api';
import { downloadCsv } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // Initial view matching the photo!
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('INR'); // User photos showed rupees "Make every rupee count"
  const [selectedMonth, setSelectedMonth] = useState('2026-10'); // October 2026 matching photo
  const [searchTerm, setSearchTerm] = useState('');

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [budget, setBudget] = useState({ monthlyLimit: 25000, currency: 'INR' });
  const [backendOnline, setBackendOnline] = useState(false);

  // Modals state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [quickModal, setQuickModal] = useState(null); // null | 'expense' | 'income'
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load all data
  const loadData = useCallback(async () => {
    const isOnline = await testBackendConnection();
    setBackendOnline(isOnline);

    const [txData, budgetData, cardsData, goalsData, subsData] = await Promise.all([
      fetchTransactionsApi(isOnline),
      fetchBudgetApi(isOnline),
      fetchCardsApi(isOnline),
      fetchGoalsApi(isOnline),
      fetchSubscriptionsApi(isOnline)
    ]);

    setTransactions(txData);
    if (budgetData) {
      setBudget(budgetData);
      if (budgetData.currency) setCurrency(budgetData.currency);
    }
    if (cardsData) setCards(cardsData);
    if (goalsData) setGoals(goalsData);
    if (subsData) setSubscriptions(subsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Available unique months from transactions
  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });
    // Ensure 2026-10 is present
    set.add('2026-10');
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Add transaction
  const handleAddTransaction = async (data) => {
    try {
      const created = await createTransactionApi(data, backendOnline);
      setTransactions(prev => [created, ...prev]);
      showToast(`${created.type === 'income' ? 'Income' : 'Expense'} recorded: "${created.title}"`);
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to record entry', 'warning');
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
    showToast('Monthly budget threshold updated!');
  };

  // Goals operations
  const handleCreateGoal = async (g) => {
    const created = await createGoalApi(g, backendOnline);
    setGoals(prev => [...prev, created]);
    showToast(`Created savings goal: "${created.title}"`);
  };

  const handleDepositGoal = async (id, amount) => {
    const updated = await depositGoalApi(id, amount, backendOnline);
    setGoals(prev => prev.map(g => (g.id === id ? updated : g)));
    showToast(`Deposited ${amount} to goal!`);
  };

  const handleDeleteGoal = async (id) => {
    await deleteGoalApi(id, backendOnline);
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('Savings goal deleted', 'info');
  };

  // Subscriptions operations
  const handleCreateSub = async (s) => {
    const created = await createSubscriptionApi(s, backendOnline);
    setSubscriptions(prev => [...prev, created]);
    showToast(`Added subscription: "${created.name}"`);
  };

  const handleDeleteSub = async (id) => {
    await deleteSubscriptionApi(id, backendOnline);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    showToast('Subscription removed', 'info');
  };

  // Export CSV
  const handleExportCsv = () => {
    downloadCsv(transactions, currency);
    showToast(`Exported ${transactions.length} transactions to CSV spreadsheet!`, 'success');
  };

  // Reset demo data
  const handleResetDemo = async () => {
    if (window.confirm('Reset sample records to initial student evaluation dataset?')) {
      const demoList = await seedDemoDataApi(backendOnline);
      setTransactions(demoList);
      showToast('Sample evaluation data reloaded!', 'info');
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

  // Expenses for the currently active/selected month
  const currentMonthExpenses = useMemo(() => {
    const targetMonth = selectedMonth !== 'All' 
      ? selectedMonth 
      : '2026-10';

    return transactions
      .filter(t => t.type === 'expense' && t.date && t.date.startsWith(targetMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, selectedMonth]);

  const activeMonthLabel = selectedMonth !== 'All' 
    ? selectedMonth 
    : 'October 2026';

  return (
    <div className="min-h-screen bg-[#0e0d0d] text-[#e6ded8] flex flex-row overflow-x-hidden font-sans antialiased selection:bg-[#ff6b00] selection:text-white">
      
      {/* 1. Left Vertical Sidebar (Matching FINOVA photo design) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAgent={() => setIsAiOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        currency={currency}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation (Matching FINOVA photo with date subtitle, search, month stepper, + Add transaction, and user avatar T) */}
        <TopHeader
          activeTab={activeTab}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          availableMonths={availableMonths}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currency={currency}
          setCurrency={setCurrency}
          onAddTransactionClick={() => setQuickModal('expense')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic Page Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          
          {/* VIEW: Analytics Page (Matching Photos 1 & 2) */}
          {activeTab === 'analytics' && (
            <FinovaAnalytics
              transactions={transactions}
              currency={currency}
              selectedMonth={selectedMonth}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              totalBalance={totalBalance}
            />
          )}

          {/* VIEW: Transactions History (Matching Photos 3, 4, 5) */}
          {activeTab === 'transactions' && (
            <FinovaTransactions
              transactions={transactions}
              onEdit={(tx) => setEditingTransaction(tx)}
              onDelete={handleDeleteTransaction}
              onNewTransaction={() => setQuickModal('expense')}
              onExportCsv={handleExportCsv}
              currency={currency}
              selectedMonth={selectedMonth}
            />
          )}

          {/* VIEW: Dashboard */}
          {activeTab === 'dashboard' && (
            <FinovaDashboard
              totalBalance={totalBalance}
              cards={cards}
              transactions={transactions}
              currency={currency}
              budget={budget}
              currentMonthExpenses={currentMonthExpenses}
              activeMonthLabel={activeMonthLabel}
              onSaveBudget={handleSaveBudget}
              onTransferClick={() => setQuickModal('expense')}
              onRequestClick={() => setQuickModal('income')}
              onViewAllClick={() => setActiveTab('transactions')}
              onOpenAiAgent={() => setIsAiOpen(true)}
            />
          )}

          {/* VIEW: Budgets, Savings Goals & Subscriptions */}
          {activeTab === 'budgets' && (
            <FinovaBudgets
              currentMonthExpenses={currentMonthExpenses}
              budget={budget}
              onSaveBudget={handleSaveBudget}
              currency={currency}
              activeMonthLabel={activeMonthLabel}
              goals={goals}
              onCreateGoal={handleCreateGoal}
              onDepositGoal={handleDepositGoal}
              onDeleteGoal={handleDeleteGoal}
              subscriptions={subscriptions}
              onCreateSub={handleCreateSub}
              onDeleteSub={handleDeleteSub}
            />
          )}

          {/* VIEW: Settings */}
          {activeTab === 'settings' && (
            <FinovaSettings
              currency={currency}
              setCurrency={setCurrency}
              onResetDemo={handleResetDemo}
              onExportCsv={handleExportCsv}
              totalTransactions={transactions.length}
              backendOnline={backendOnline}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-[#24201e] py-5 px-6 text-center text-xs text-[#736a63]">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>FINOVA • Expense Tracker Pro with FinAI Copilot • Final Year Computer Science Project</p>
            <p className="flex items-center gap-2">
              <span>React 19 + Tailwind CSS</span>
              <span>•</span>
              <span>Express REST API</span>
            </p>
          </div>
        </footer>

      </div>

      {/* 3. Floating Interactive Modals */}

      {/* AI Copilot Drawer / Modal with Voice Dictation */}
      <AiCopilotModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        transactions={transactions}
        budget={budget}
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        onAddTransaction={handleAddTransaction}
        currency={currency}
        backendOnline={backendOnline}
      />

      {/* Quick Add / Transfer Modal */}
      <QuickTransferModal
        isOpen={Boolean(quickModal)}
        defaultType={quickModal || 'expense'}
        onClose={() => setQuickModal(null)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
      />

      {/* AI Receipt Vision OCR Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
        backendOnline={backendOnline}
      />

      {/* Command Palette (⌘ + Space / Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAiAgent={() => setIsAiOpen(true)}
        onOpenQuickModal={(type) => setQuickModal(type)}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onExportCsv={handleExportCsv}
        onResetDemo={handleResetDemo}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setActiveTab={setActiveTab}
      />

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
