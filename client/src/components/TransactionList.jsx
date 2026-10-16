import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar, 
  ArrowUpDown, 
  Tag, 
  Inbox, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { formatCurrency, formatDate, formatMonthYear } from '../utils';

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  currency,
  selectedMonth,
  setSelectedMonth,
  selectedCategory,
  setSelectedCategory
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'income' | 'expense'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Extract all unique months from transactions
  const availableMonths = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Extract combined unique categories
  const allCategories = useMemo(() => {
    const list = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
    return list.sort();
  }, []);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Month filter
      if (selectedMonth !== 'All' && (!t.date || !t.date.startsWith(selectedMonth))) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'All' && t.type !== typeFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = t.title && t.title.toLowerCase().includes(q);
        const matchesNotes = t.notes && t.notes.toLowerCase().includes(q);
        const matchesCat = t.category && t.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes && !matchesCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === 'amount-asc') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });
  }, [transactions, selectedMonth, selectedCategory, typeFilter, searchTerm, sortBy]);

  const hasActiveFilters = selectedMonth !== 'All' || selectedCategory !== 'All' || typeFilter !== 'All' || searchTerm !== '';

  const handleClearFilters = () => {
    setSelectedMonth('All');
    setSelectedCategory('All');
    setTypeFilter('All');
    setSearchTerm('');
    setSortBy('date-desc');
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      
      {/* Title & Filter Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>Transaction History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredTransactions.length} of {transactions.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, filter, edit or delete recorded ledger entries
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Month Filter */}
        <div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Months</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {formatMonthYear(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (Highest)</option>
            <option value="amount-asc">Amount (Lowest)</option>
          </select>
        </div>

      </div>

      {/* Type Tabs (All, Expense, Income) */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setTypeFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            typeFilter === 'All'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Types
        </button>
        <button
          onClick={() => setTypeFilter('expense')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            typeFilter === 'expense'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Expenses Only
        </button>
        <button
          onClick={() => setTypeFilter('income')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            typeFilter === 'income'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Income Only
        </button>
      </div>

      {/* Transaction List Entries */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const catColor = CATEGORY_COLORS[tx.category] || '#64748B';

            return (
              <div
                key={tx.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm transition-all gap-3"
              >
                
                {/* Left: Info */}
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 mt-1 sm:mt-0"
                    style={{ backgroundColor: catColor }}
                    title={tx.category}
                  />

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {tx.title}
                      </h4>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: catColor }}
                      >
                        {tx.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tx.date)}
                      </span>
                      {tx.notes && (
                        <span>• {tx.notes}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                  <span
                    className={`font-mono font-bold text-sm sm:text-base ${
                      isIncome 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${tx.title}"?`)) {
                          onDelete(tx.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Inbox className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No transactions found
            </p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or month/category filters.' 
                : 'Start recording your expenses and income using the form above.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
