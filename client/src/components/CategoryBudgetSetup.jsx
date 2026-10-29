import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  Plus,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wallet,
  X
} from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils';

const BUDGET_LIMIT = 6;

const STARTER_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transportation',
  'Utilities & Bills',
  'Housing & Rent'
];

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  Groceries: ShoppingCart,
  Shopping: ShoppingBag,
  Transportation: Wallet,
  'Utilities & Bills': CircleDollarSign,
  'Housing & Rent': Wallet
};

function createDraftRows(savedBudgets) {
  const saved = savedBudgets.map(budget => ({
    category: budget.category,
    amount: String(budget.limit)
  }));
  const usedCategories = new Set(saved.map(budget => budget.category));
  const starterRows = STARTER_CATEGORIES
    .filter(category => !usedCategories.has(category))
    .map(category => ({ category, amount: '' }));

  return [...saved, ...starterRows].slice(0, BUDGET_LIMIT);
}

function monthKeyFromLabel(monthLabel) {
  if (/^\d{4}-\d{2}/.test(monthLabel || '')) return monthLabel.slice(0, 7);
  const date = new Date(monthLabel);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function CategoryBudgetSetup({
  categoryBudgets = [],
  transactions = [],
  activeMonth,
  currency,
  onSave
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftRows, setDraftRows] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const monthKey = monthKeyFromLabel(activeMonth);
  const configuredBudgets = useMemo(() => (
    categoryBudgets.map(item => ({
      category: item.category,
      limit: Number(item.limit) || 0
    }))
  ), [categoryBudgets]);

  const spendingByCategory = useMemo(() => {
    const spending = new Map();
    transactions.forEach(transaction => {
      if (transaction.type !== 'expense' || !transaction.category) return;
      if (monthKey && (!transaction.date || !transaction.date.startsWith(monthKey))) return;
      spending.set(
        transaction.category,
        (spending.get(transaction.category) || 0) + (Number(transaction.amount) || 0)
      );
    });
    return spending;
  }, [transactions, monthKey]);

  const totalAllocated = configuredBudgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = configuredBudgets.reduce(
    (sum, item) => sum + (spendingByCategory.get(item.category) || 0),
    0
  );
  const availableCategories = EXPENSE_CATEGORIES.filter(
    category => !draftRows.some(row => row.category === category)
  );

  const openSetup = () => {
    setDraftRows(createDraftRows(configuredBudgets));
    setNewCategory('');
    setError('');
    setIsOpen(true);
  };

  const updateRow = (index, key, value) => {
    setDraftRows(rows => rows.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [key]: value } : row
    )));
  };

  const removeRow = index => {
    setDraftRows(rows => rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const addCategory = () => {
    if (!newCategory || draftRows.length >= BUDGET_LIMIT) return;
    setDraftRows(rows => [...rows, { category: newCategory, amount: '' }]);
    setNewCategory('');
  };

  const saveBudgets = async () => {
    const budgetsToSave = [];
    for (const row of draftRows) {
      if (!row.amount.trim()) continue;
      const limit = Number(row.amount);
      if (!Number.isFinite(limit) || limit <= 0) {
        setError(`Enter a budget greater than zero for ${row.category}, or clear the amount.`);
        return;
      }
      budgetsToSave.push({ category: row.category, limit });
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave(budgetsToSave);
      setIsOpen(false);
    } catch (saveError) {
      setError(saveError.message || 'Could not save category budgets. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="category-budget-card">
        <div className="category-budget-card-heading">
          <div>
            <span className="category-budget-eyebrow">CATEGORY LIMITS</span>
            <h3>Quick setup</h3>
            <p>Set monthly spending limits for the categories you care about.</p>
          </div>
          <button type="button" className="category-budget-edit" onClick={openSetup}>
            <Plus />
            <span>{configuredBudgets.length ? 'Edit budgets' : 'Set budgets'}</span>
          </button>
        </div>

        <div className="category-budget-summary">
          <span>{configuredBudgets.length} of {BUDGET_LIMIT} budgets set</span>
          <span>{formatCurrency(totalSpent, currency)} spent · {formatCurrency(totalAllocated, currency)} allocated</span>
        </div>

        {configuredBudgets.length ? (
          <div className="category-budget-list">
            {configuredBudgets.map(item => {
              const Icon = CATEGORY_ICONS[item.category] || CircleDollarSign;
              const spent = spendingByCategory.get(item.category) || 0;
              const percentage = item.limit > 0 ? Math.min(100, (spent / item.limit) * 100) : 0;
              return (
                <div className="category-budget-row" key={item.category}>
                  <span className="category-budget-icon"><Icon /></span>
                  <div className="category-budget-info">
                    <div className="category-budget-row-heading">
                      <strong>{item.category}</strong>
                      <span>{formatCurrency(spent, currency)} / {formatCurrency(item.limit, currency)}</span>
                    </div>
                    <div className="category-budget-progress">
                      <span style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="category-budget-empty">
            <span>Choose up to 6 categories and set a monthly limit for each.</span>
            <button type="button" className="button-primary" onClick={openSetup}>Create your first category budget</button>
          </div>
        )}

        <div className="category-budget-plan">Free plan · Up to {BUDGET_LIMIT} category budgets</div>
      </section>

      {isOpen && (
        <div
          className="category-budget-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !isSaving) setIsOpen(false);
          }}
        >
          <section className="category-budget-sheet" role="dialog" aria-modal="true" aria-labelledby="category-budget-title">
            <div className="category-budget-sheet-heading">
              <span className="category-budget-sheet-icon"><Wallet /></span>
              <div>
                <h3 id="category-budget-title">Quick Setup</h3>
                <p>Fill in your category limits. One tap saves all.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close setup" disabled={isSaving}>
                <X />
              </button>
            </div>

            <div className="category-budget-sheet-content">
              {draftRows.map((row, index) => {
                const Icon = CATEGORY_ICONS[row.category] || CircleDollarSign;
                return (
                  <div className="category-budget-edit-row" key={`${row.category}-${index}`}>
                    <span className="category-budget-icon"><Icon /></span>
                    <label className="category-budget-select">
                      <select
                        value={row.category}
                        onChange={event => updateRow(index, 'category', event.target.value)}
                        aria-label={`Budget category ${index + 1}`}
                      >
                        {EXPENSE_CATEGORIES.map(category => (
                          <option
                            key={category}
                            value={category}
                            disabled={draftRows.some((other, otherIndex) => otherIndex !== index && other.category === category)}
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown />
                    </label>
                    <label className="category-budget-amount">
                      <span>{currency === 'INR' ? '₹' : currency}</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={row.amount}
                        onChange={event => updateRow(index, 'amount', event.target.value)}
                        placeholder="0"
                        aria-label={`${row.category} monthly limit`}
                      />
                    </label>
                    <button
                      type="button"
                      className="category-budget-remove"
                      onClick={() => removeRow(index)}
                      aria-label={`Remove ${row.category} budget`}
                    >
                      <X />
                    </button>
                  </div>
                );
              })}

              {draftRows.length < BUDGET_LIMIT && availableCategories.length > 0 && (
                <div className="category-budget-add-row">
                  <label>
                    <span className="sr-only">Choose a category to add</span>
                    <select value={newCategory} onChange={event => setNewCategory(event.target.value)}>
                      <option value="">Add a category...</option>
                      {availableCategories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={addCategory} disabled={!newCategory}>
                    <Plus />
                    Add
                  </button>
                </div>
              )}

              {error && <p className="category-budget-error" role="alert">{error}</p>}
            </div>

            <div className="category-budget-sheet-footer">
              <span><RotateCcw /> Free plan · {BUDGET_LIMIT} budget limit</span>
              <button type="button" className="button-primary" onClick={saveBudgets} disabled={isSaving}>
                <Check />
                {isSaving ? 'Saving...' : 'Save budgets'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
