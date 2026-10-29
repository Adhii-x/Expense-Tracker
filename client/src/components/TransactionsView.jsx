import React, { useState, useMemo } from 'react';
import { 
  Search,
  Download,
  Trash2,
  Edit3,
  Calendar,
  Package,
  Plus,
  X,
  SlidersHorizontal,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  Check,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { formatCurrency, formatDate } from '../utils';

const DEFAULT_FILTERS = {
  sortBy: 'newest',
  dateRange: 'all',
  customStart: '',
  customEnd: '',
  category: 'All',
  type: 'All'
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first', icon: ArrowDown },
  { value: 'oldest', label: 'Oldest first', icon: ArrowUp },
  { value: 'highest', label: 'Highest amount', icon: TrendingUp },
  { value: 'lowest', label: 'Lowest amount', icon: TrendingDown }
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'threeMonths', label: '3 months' },
  { value: 'custom', label: 'Custom range' }
];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRangeBounds(filters) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (filters.dateRange === 'week') {
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - ((startOfToday.getDay() + 6) % 7));
    return { start: toDateKey(startOfWeek), end: toDateKey(startOfToday) };
  }
  if (filters.dateRange === 'month') {
    return {
      start: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
      end: toDateKey(startOfToday)
    };
  }
  if (filters.dateRange === 'lastMonth') {
    return {
      start: toDateKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      end: toDateKey(new Date(today.getFullYear(), today.getMonth(), 0))
    };
  }
  if (filters.dateRange === 'threeMonths') {
    const start = new Date(startOfToday);
    start.setMonth(start.getMonth() - 3);
    return { start: toDateKey(start), end: toDateKey(startOfToday) };
  }
  if (filters.dateRange === 'custom') {
    return { start: filters.customStart, end: filters.customEnd };
  }
  return { start: '', end: '' };
}

export default function TransactionsView({
  transactions,
  onEdit,
  onDelete,
  onNewTransaction,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  currency,
  selectedMonth,
  selectedDate,
  onClearSelectedDate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Combined categories
  const allCategories = useMemo(() => {
    return [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].sort();
  }, []);

  // Filter and sort transactions
  const filtered = useMemo(() => {
    const { start, end } = getDateRangeBounds(filters);
    return transactions.filter(t => {
      const transactionDate = t.date ? t.date.slice(0, 10) : '';
      if (selectedDate && transactionDate !== selectedDate) return false;
      // Month filter
      if (selectedMonth !== 'All' && (!t.date || !t.date.startsWith(selectedMonth))) {
        return false;
      }
      if ((start && (!transactionDate || transactionDate < start)) ||
        (end && (!transactionDate || transactionDate > end))) {
        return false;
      }
      // Category filter
      if (filters.category !== 'All' && t.category !== filters.category) {
        return false;
      }
      // Type filter
      if (filters.type !== 'All' && t.type !== filters.type) {
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
      if (filters.sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (filters.sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (filters.sortBy === 'highest') return Number(b.amount) - Number(a.amount);
      if (filters.sortBy === 'lowest') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }, [transactions, selectedMonth, selectedDate, filters, searchTerm]);

  const hasFilters = searchTerm !== '' ||
    Boolean(selectedDate) ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.dateRange !== DEFAULT_FILTERS.dateRange ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.type !== DEFAULT_FILTERS.type;

  const clearFilters = () => {
    setSearchTerm('');
    setFilters(DEFAULT_FILTERS);
    setDraftFilters(DEFAULT_FILTERS);
    onClearSelectedDate?.();
  };

  const updateDraftFilter = (key, value) => {
    setDraftFilters(current => ({ ...current, [key]: value }));
  };

  return (
    <div className="transactions-view animate-fade-in">
      <div className="transactions-page-heading">
        <div>
          <span className="transactions-eyebrow">
            EVERY RUPEE, ACCOUNTED FOR
          </span>
          <h2>
            Transaction history
          </h2>
          <p>
            Review, find, edit and export your income and expenses.
          </p>
        </div>

        <button
          onClick={onNewTransaction}
          className="transaction-create-button button-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New transaction</span>
        </button>
      </div>

      <section className="transaction-browser glass-panel">
        <div className="transaction-browser-heading">
          <div>
            <h3>{selectedDate ? 'Transactions by date' : 'All transactions'}</h3>
            <p>
              {selectedDate
                ? `${new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })} · ${filtered.length} ${filtered.length === 1 ? 'transaction' : 'transactions'}`
                : `${filtered.length} matching ${filtered.length === 1 ? 'transaction' : 'transactions'}`}
            </p>
          </div>

          <div className="transaction-export-actions">
            <button
              type="button"
              onClick={() => onExportCsv(filtered)}
              className="transaction-export-button"
              aria-label="Export filtered transactions as CSV"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => onExportExcel(filtered)}
              className="transaction-export-button"
              aria-label="Export filtered transactions as Excel"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={() => onExportPdf(filtered)}
              className="transaction-export-button"
              aria-label="Export filtered transactions as PDF"
              title="Export PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {selectedDate && (
          <div className="transaction-selected-date">
            <Calendar size={14} />
            <span>Showing transactions for {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            <button type="button" onClick={onClearSelectedDate}>Clear date</button>
          </div>
        )}

        <div className="transaction-toolbar">
          <div className="transaction-search">
            <Search className="transaction-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your transactions..."
              aria-label="Search transactions"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="transaction-search-clear" aria-label="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            className={`transaction-filter-button ${hasFilters && !searchTerm ? 'is-active' : ''}`}
            onClick={() => {
              setDraftFilters(filters);
              setShowFilterPanel(true);
            }}
            aria-haspopup="dialog"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter &amp; Sort</span>
          </button>

          <div className="transaction-clear-container">
            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="transaction-clear-button"
                title="Reset filters"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {showFilterPanel && (
          <div
            className="transaction-filter-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowFilterPanel(false);
            }}
          >
            <section className="transaction-filter-panel" role="dialog" aria-modal="true" aria-labelledby="transaction-filter-title">
              <div className="transaction-filter-heading">
                <div className="transaction-filter-title">
                  <span className="transaction-filter-title-icon"><SlidersHorizontal /></span>
                  <h3 id="transaction-filter-title">Filter &amp; Sort</h3>
                </div>
                <button type="button" className="transaction-filter-reset" onClick={clearFilters}>Reset</button>
                <button type="button" className="transaction-filter-close" onClick={() => setShowFilterPanel(false)} aria-label="Close filters">
                  <X />
                </button>
              </div>

              <div className="transaction-filter-content">
                <section className="transaction-filter-section">
                  <h4>Sort by</h4>
                  <div className="transaction-sort-options">
                    {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        className={`transaction-filter-choice ${draftFilters.sortBy === value ? 'is-selected' : ''}`}
                        onClick={() => updateDraftFilter('sortBy', value)}
                        aria-pressed={draftFilters.sortBy === value}
                      >
                        <Icon />
                        <span>{label}</span>
                        {draftFilters.sortBy === value && <span className="transaction-choice-indicator" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="transaction-filter-section">
                  <h4>Date range</h4>
                  <div className="transaction-filter-chips">
                    {DATE_RANGE_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        className={`transaction-filter-chip ${draftFilters.dateRange === value ? 'is-selected' : ''}`}
                        onClick={() => updateDraftFilter('dateRange', value)}
                        aria-pressed={draftFilters.dateRange === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {draftFilters.dateRange === 'custom' && (
                    <div className="transaction-custom-date-range">
                      <label>
                        From
                        <input
                          type="date"
                          value={draftFilters.customStart}
                          max={draftFilters.customEnd || undefined}
                          onChange={(event) => updateDraftFilter('customStart', event.target.value)}
                        />
                      </label>
                      <label>
                        To
                        <input
                          type="date"
                          value={draftFilters.customEnd}
                          min={draftFilters.customStart || undefined}
                          onChange={(event) => updateDraftFilter('customEnd', event.target.value)}
                        />
                      </label>
                    </div>
                  )}
                </section>

                <section className="transaction-filter-section">
                  <h4>Type</h4>
                  <div className="transaction-filter-chips">
                    {[
                      { value: 'All', label: 'All types' },
                      { value: 'expense', label: 'Expenses' },
                      { value: 'income', label: 'Income' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        className={`transaction-filter-chip ${draftFilters.type === value ? 'is-selected' : ''}`}
                        onClick={() => updateDraftFilter('type', value)}
                        aria-pressed={draftFilters.type === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="transaction-filter-section">
                  <h4>Category</h4>
                  <div className="transaction-filter-chips">
                    {['All', ...allCategories].map(category => (
                      <button
                        key={category}
                        type="button"
                        className={`transaction-filter-chip ${draftFilters.category === category ? 'is-selected' : ''}`}
                        onClick={() => updateDraftFilter('category', category)}
                        aria-pressed={draftFilters.category === category}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <button
                type="button"
                className="transaction-filter-apply button-primary"
                onClick={() => {
                  setFilters(draftFilters);
                  setShowFilterPanel(false);
                }}
              >
                <Check />
                <span>Apply filters</span>
              </button>
            </section>
          </div>
        )}

        <div className="transaction-list">
          {filtered.length > 0 ? (
            <div className="transaction-list-items">
              {filtered.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="transaction-row"
                  >
                    <div className="transaction-row-main">
                      <span className={`transaction-type-icon ${isIncome ? 'is-income' : 'is-expense'}`} aria-hidden="true">
                        {isIncome ? '+' : '−'}
                      </span>
                      <div className="transaction-row-description">
                        <div className="transaction-row-title">
                          <h4>{tx.title}</h4>
                          <span className={`transaction-category ${isIncome ? 'is-income' : 'is-expense'}`}>
                            {tx.category}
                          </span>
                        </div>
                        <div className="transaction-row-meta">
                          <span>
                            <Calendar />
                            {formatDate(tx.date)}
                          </span>
                          {tx.notes && <span className="transaction-note">{tx.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="transaction-row-actions">
                      <span className={`transaction-amount ${isIncome ? 'is-income' : 'is-expense'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </span>

                      <div className="transaction-action-buttons">
                        <button
                          onClick={() => onEdit(tx)}
                          className="transaction-action-button"
                          title="Edit transaction"
                          aria-label={`Edit ${tx.title}`}
                        >
                          <Edit3 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                              onDelete(tx.id);
                            }
                          }}
                          className="transaction-action-button is-delete"
                          title="Delete transaction"
                          aria-label={`Delete ${tx.title}`}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="transaction-empty-state">
              <div className="transaction-empty-icon">
                <Package />
              </div>
              <h4>No transactions found</h4>
              <p>
                {hasFilters ? 'Try adjusting your search query or filters.' : 'Click "+ New transaction" to record your first entry.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
