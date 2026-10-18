import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Calendar, 
  Package, 
  ChevronDown,
  Plus,
  Filter,
  X
} from 'lucide-react';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { formatCurrency, formatDate } from '../utils';

export default function FinovaTransactions({
  transactions,
  onEdit,
  onDelete,
  onNewTransaction,
  onExportCsv,
  currency,
  selectedMonth
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'income' | 'expense'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Combined categories
  const allCategories = useMemo(() => {
    return [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].sort();
  }, []);

  // Filter and sort transactions
  const filtered = useMemo(() => {
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
        const mTitle = t.title && t.title.toLowerCase().includes(q);
        const mNotes = t.notes && t.notes.toLowerCase().includes(q);
        const mCat = t.category && t.category.toLowerCase().includes(q);
        if (!mTitle && !mNotes && !mCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return Number(b.amount) - Number(a.amount);
      if (sortBy === 'lowest') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }, [transactions, selectedMonth, selectedCategory, typeFilter, searchTerm, sortBy]);

  const hasFilters = searchTerm !== '' || selectedCategory !== 'All' || typeFilter !== 'All' || sortBy !== 'newest';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setTypeFilter('All');
    setSortBy('newest');
  };

  const currencyUnitText = currency === 'INR' ? 'RUPEE' : 'CURRENCY';

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header matching photos 3, 4, 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff6b00]">
            EVERY {currencyUnitText}, ACCOUNTED FOR
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Transaction history
          </h2>
          <p className="text-xs sm:text-sm text-[#8c827a] mt-1">
            Review, find, edit and export your income and expenses.
          </p>
        </div>

        {/* Large + New transaction button matching the photo */}
        <button
          onClick={onNewTransaction}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ea580c] hover:from-[#ff771a] hover:to-[#f97316] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#ff6b00]/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New transaction</span>
        </button>
      </div>

      {/* Main Filter Container Card matching photo */}
      <div className="rounded-3xl bg-[#181615] border border-[#262220] shadow-xl p-6 sm:p-7 space-y-5">
        
        {/* Top line of card: All transactions • X matching + Export CSV */}
        <div className="flex items-center justify-between pb-4 border-b border-[#24201e]">
          <div>
            <h3 className="font-extrabold text-white text-base">
              All transactions
            </h3>
            <p className="text-xs text-[#8c827a]">
              {filtered.length} matching {filtered.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#24201e] hover:bg-[#2e2a27] text-[#d4ccc5] hover:text-white border border-[#332e2b] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Toolbar matching photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
          
          {/* Search Input (5 cols) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[#736a63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your transactions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-xs sm:text-sm text-white placeholder-[#736a63] focus:outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736a63] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown (2 cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-xs sm:text-sm text-[#d4ccc5] focus:outline-none cursor-pointer pr-8"
            >
              <option value="newest" className="bg-[#1c1918]">Newest first</option>
              <option value="oldest" className="bg-[#1c1918]">Oldest first</option>
              <option value="highest" className="bg-[#1c1918]">Amount: High to Low</option>
              <option value="lowest" className="bg-[#1c1918]">Amount: Low to High</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#736a63] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Dropdown (2 cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-xs sm:text-sm text-[#d4ccc5] focus:outline-none cursor-pointer pr-8"
            >
              <option value="All" className="bg-[#1c1918]">All categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat} className="bg-[#1c1918]">{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#736a63] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Dropdown (2 cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-xs sm:text-sm text-[#d4ccc5] focus:outline-none cursor-pointer pr-8"
            >
              <option value="All" className="bg-[#1c1918]">All types</option>
              <option value="expense" className="bg-[#1c1918]">Expenses only</option>
              <option value="income" className="bg-[#1c1918]">Income only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#736a63] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters (1 col) */}
          <div className="lg:col-span-1 flex items-center justify-center">
            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="text-xs text-[#ff6b00] hover:underline font-semibold"
                title="Reset filters"
              >
                Clear
              </button>
            ) : null}
          </div>

        </div>

        {/* Transactions Table / List or Empty State matching photo */}
        <div className="pt-2">
          {filtered.length > 0 ? (
            <div className="space-y-2.5">
              {filtered.map((tx) => {
                const isIncome = tx.type === 'income';
                const catColor = CATEGORY_COLORS[tx.category] || '#8c827a';

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#1c1918] hover:bg-[#221f1d] border border-[#262220] hover:border-[#ff6b00]/30 transition-all gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: catColor }}
                        title={tx.category}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-white tracking-tight">
                            {tx.title}
                          </h4>
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: catColor }}
                          >
                            {tx.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8c827a] mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(tx.date)}
                          </span>
                          {tx.notes && <span>• {tx.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                      <span className={`font-mono font-bold text-sm sm:text-base ${
                        isIncome ? 'text-[#22c55e]' : 'text-[#e6ded8]'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </span>

                      <div className="flex items-center gap-1 opacity-90 sm:opacity-30 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 rounded-lg text-[#8c827a] hover:text-[#ff6b00] hover:bg-[#262220] transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                              onDelete(tx.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#8c827a] hover:text-rose-400 hover:bg-[#262220] transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State exactly matching the user's photo! */
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#24201e] border border-[#332e2b] flex items-center justify-center text-[#ff6b00] mb-3 shadow-inner">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                No transactions found
              </h4>
              <p className="text-xs text-[#8c827a] max-w-xs">
                {hasFilters ? 'Try adjusting your search query or filters.' : 'Click "+ New transaction" to record your first entry.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
