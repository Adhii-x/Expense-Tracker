import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import BalanceChartCard from './components/BalanceChartCard';
import CardsWidget from './components/CardsWidget';
import AiAgentWidget from './components/AiAgentWidget';
import InvestmentsBarChart from './components/InvestmentsBarChart';
import BudgetTracker from './components/BudgetTracker';
import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import EditModal from './components/EditModal';
import QuickTransferModal from './components/QuickTransferModal';
import AiCopilotModal from './components/AiCopilotModal';
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
  seedDemoDataApi
} from './services/api';
import { downloadCsv } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true); // Default to ultra sleek dark theme matching reference
  const [currency, setCurrency] = useState('USD');
  const [searchTerm, setSearchTerm] = useState('');

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [budget, setBudget] = useState({ monthlyLimit: 1500, currency: 'USD' });
  const [backendOnline, setBackendOnline] = useState(false);

  // Filters & Modals
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [quickModal, setQuickModal] = useState(null); // null | 'expense' | 'income' | 'card'
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

  // Load data
  const loadData = useCallback(async () => {
    const isOnline = await testBackendConnection();
    setBackendOnline(isOnline);

    const [txData, budgetData, cardsData] = await Promise.all([
      fetchTransactionsApi(isOnline),
      fetchBudgetApi(isOnline),
      fetchCardsApi(isOnline)
    ]);

    setTransactions(txData);
    if (budgetData) {
      setBudget(budgetData);
      if (budgetData.currency) setCurrency(budgetData.currency);
    }
    if (cardsData) {
      setCards(cardsData);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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

  // Export to CSV
  const handleExportCsv = () => {
    downloadCsv(transactions, currency);
    showToast(`Exported ${transactions.length} transactions to CSV spreadsheet!`, 'success');
  };

  // Reset demo data
  const handleResetDemo = async () => {
    if (window.confirm('Reload realistic student sample demo data?')) {
      const demoList = await seedDemoDataApi(backendOnline);
      setTransactions(demoList);
      showToast('Loaded sample demo records!', 'info');
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

  // Current month expenses
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

  // Global search filtering across transactions
  const searchedTransactions = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    const q = searchTerm.toLowerCase();
    return transactions.filter(t => 
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }, [transactions, searchTerm]);

  return (
    <div className="min-h-screen bg-[#0e0d0d] text-[#e6ded8] flex flex-row overflow-x-hidden font-sans antialiased selection:bg-[#ff6b00] selection:text-white">
      
      {/* 1. Left Vertical Sidebar (Matching Reference Image) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAgent={() => setIsAiOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation (REST API status removed as requested) */}
        <TopHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currency={currency}
          setCurrency={setCurrency}
          onRefresh={loadData}
          onExportCsv={handleExportCsv}
          onResetDemo={handleResetDemo}
          onOpenAiAgent={() => setIsAiOpen(true)}
        />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          
          {/* Navigation View Switcher */}
          {activeTab === 'dashboard' && (
            <>
              {/* ROW 1: Total Balance Chart (Left 8 cols) & My Cards (Right 4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Total Balance Chart Card */}
                <div className="lg:col-span-8">
                  <BalanceChartCard
                    totalBalance={totalBalance}
                    currency={currency}
                  />
                </div>

                {/* My Cards & Recent Transactions Panel */}
                <div className="lg:col-span-4">
                  <CardsWidget
                    cards={cards}
                    transactions={searchedTransactions}
                    currency={currency}
                    onTransferClick={(mode) => setQuickModal(mode || 'expense')}
                    onRequestClick={() => setQuickModal('income')}
                    onViewAllClick={() => setActiveTab('ledger')}
                  />
                </div>

              </div>

              {/* ROW 2: FinAI Copilot Card (Left 4 cols), Investments Bar Chart (Middle 4 cols), Budget Tracker (Right 4 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                
                {/* AI Financial Agent Card (Matching reference image bottom-left glowing card) */}
                <div className="lg:col-span-4">
                  <AiAgentWidget
                    onOpenAiAgent={() => setIsAiOpen(true)}
                    healthScore={Math.min(100, Math.max(35, Math.round((totalBalance / (totalIncome || 1)) * 100 + 42)))}
                  />
                </div>

                {/* Investments & Monthly Peak Bar Chart (Matching reference image bottom-middle card) */}
                <div className="lg:col-span-4">
                  <InvestmentsBarChart currency={currency} />
                </div>

                {/* Monthly Budget Threshold Warning Card */}
                <div className="lg:col-span-4">
                  <BudgetTracker
                    currentMonthExpenses={currentMonthExpenses}
                    budgetLimit={budget.monthlyLimit}
                    onSaveBudget={handleSaveBudget}
                    currency={currency}
                    activeMonth={activeMonthLabel}
                  />
                </div>

              </div>

              {/* Quick Transaction Ledger Preview below */}
              <div className="pt-2">
                <TransactionList
                  transactions={searchedTransactions}
                  onEdit={(tx) => setEditingTransaction(tx)}
                  onDelete={handleDeleteTransaction}
                  currency={currency}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </div>
            </>
          )}

          {/* VIEW: Full Transactions Ledger */}
          {activeTab === 'ledger' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Full Financial Ledger
                  </h2>
                  <p className="text-xs text-[#8c827a] mt-0.5">
                    Filter by category, billing period, or export directly to CSV spreadsheet
                  </p>
                </div>
                <button
                  onClick={() => setQuickModal('expense')}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ea580c] text-white text-xs font-bold shadow-lg shadow-[#ff6b00]/25"
                >
                  + Add Entry
                </button>
              </div>

              <TransactionList
                transactions={searchedTransactions}
                onEdit={(tx) => setEditingTransaction(tx)}
                onDelete={handleDeleteTransaction}
                currency={currency}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          )}

          {/* VIEW: Charts & Visual Analytics */}
          {(activeTab === 'charts' || activeTab === 'analytics') && (
            <div className="space-y-6 animate-fade-in">
              <SummaryCards
                totalBalance={totalBalance}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                currency={currency}
                incomeCount={incomeCount}
                expenseCount={expenseCount}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <ExpenseChart
                    transactions={transactions}
                    currency={currency}
                    darkMode={true}
                  />
                </div>
                <div className="lg:col-span-5">
                  <TransactionForm
                    onAddTransaction={handleAddTransaction}
                    currency={currency}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW: My Cards */}
          {activeTab === 'cards' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Virtual & Physical Cards Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                  <div key={card.id || i} className="p-6 rounded-3xl bg-gradient-to-br from-[#262220] to-[#141211] border border-[#3d3733] shadow-xl text-white">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-extrabold tracking-widest">{card.type}</span>
                      <span className="text-xs text-[#22c55e] font-bold">Active</span>
                    </div>
                    <div className="text-3xl font-extrabold mb-4">
                      ${card.balance?.toLocaleString()}
                    </div>
                    <div className="flex justify-between text-xs font-mono text-[#a89d95]">
                      <span>•••• {card.last4}</span>
                      <span>Exp: {card.expiry}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-[#24201e] py-6 px-6 text-center text-xs text-[#736a63]">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Expense Tracker Pro with FinAI Agent • Final Year Computer Science Project</p>
            <p className="flex items-center gap-2">
              <span>Client: React 19 + Tailwind</span>
              <span>•</span>
              <span>Server: Express + AI Engine</span>
            </p>
          </div>
        </footer>

      </div>

      {/* 3. Floating Interactive Modals */}

      {/* AI Copilot Drawer / Modal */}
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

      {/* Quick Transfer & Request Modal */}
      <QuickTransferModal
        isOpen={Boolean(quickModal)}
        defaultType={quickModal || 'expense'}
        onClose={() => setQuickModal(null)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
      />

      {/* Edit Modal */}
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
