import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  RotateCcw, 
  Calendar, 
  Tag,
  FileText,
  AlertCircle 
} from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

export default function TransactionForm({ onAddTransaction }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  
  // Validation error state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update default category when type changes
  useEffect(() => {
    if (type === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [type]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required and cannot be empty.';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid numeric amount.';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0 (no negative or zero values).';
    }

    if (!date) {
      newErrors.date = 'Please pick a valid date.';
    }

    if (!category) {
      newErrors.category = 'Please select a category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await onAddTransaction({
      title: title.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      type,
      category,
      date,
      notes: notes.trim()
    });

    setIsSubmitting(false);

    if (success !== false) {
      // Clear form
      setTitle('');
      setAmount('');
      setNotes('');
      setErrors({});
    }
  };

  const handleReset = () => {
    setTitle('');
    setAmount('');
    setNotes('');
    setDate(new Date().toISOString().substring(0, 10));
    setType('expense');
    setCategory(EXPENSE_CATEGORIES[0]);
    setErrors({});
  };

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Add New Transaction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record cash inflow or expense outflow
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Type Toggle (Income / Expense) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              - Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              + Income
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Title / Description *
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              placeholder={type === 'expense' ? 'e.g. Campus groceries, Textbook' : 'e.g. Tutoring stipend, Internship salary'}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.title 
                  ? 'border-rose-400 focus:ring-rose-400' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors.title && (
            <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Amount & Date in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: null });
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-mono ${
                  errors.amount 
                    ? 'border-rose-400 focus:ring-rose-400' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors({ ...errors, date: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.date 
                    ? 'border-rose-400 focus:ring-rose-400' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />
            </div>
            {errors.date && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.date}
              </p>
            )}
          </div>

        </div>

        {/* Category & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with roomie, bill receipt"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
            type === 'expense'
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <PlusCircle className="w-4 h-4" />
          {isSubmitting 
            ? 'Saving...' 
            : `Add ${type === 'expense' ? 'Expense' : 'Income'} (₹${amount ? parseFloat(amount || '0').toFixed(2) : '0.00'})`}
        </button>

      </form>
    </div>
  );
}
