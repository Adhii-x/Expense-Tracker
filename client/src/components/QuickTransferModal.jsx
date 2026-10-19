import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

export default function QuickTransferModal({ 
  isOpen, 
  onClose, 
  defaultType = 'expense', 
  onAddTransaction
}) {
  if (!isOpen) return null;

  const [type, setType] = useState(defaultType === 'card' ? 'expense' : defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setType(defaultType === 'card' ? 'expense' : defaultType);
  }, [defaultType]);

  useEffect(() => {
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }, [type]);

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title / Recipient is required.';
    }
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      errs.amount = 'Amount must be greater than 0.';
    }
    if (!date) {
      errs.date = 'Valid date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl p-6 transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292523] mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${
              type === 'expense' ? 'bg-[#ff6b00]' : 'bg-[#22c55e]'
            }`}>
              {type === 'expense' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                {type === 'expense' ? 'Transfer & Pay' : 'Request & Deposit'}
              </h3>
              <p className="text-[11px] text-[#8c827a]">
                Quick ledger entry to your account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8c827a] hover:text-white hover:bg-[#201d1b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#1a1715] rounded-2xl mb-4 border border-[#2b2725]">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-gradient-to-r from-[#ff6b00] to-[#ea580c] text-white shadow-md'
                : 'text-[#8c827a] hover:text-white'
            }`}
          >
            Transfer (Expense)
          </button>

          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-[#8c827a] hover:text-white'
            }`}
          >
            Request (Income)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title / Recipient */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8c827a] mb-1.5">
              {type === 'expense' ? 'Recipient / Store Title *' : 'Income Source / Payer *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'e.g. Nike Store, Google Drive, Cafe' : 'e.g. Internship Stipend, Lucas Bennett'}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-sm text-white placeholder-[#736a63] focus:outline-none transition-all"
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8c827a] mb-1.5">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-sm text-white font-mono placeholder-[#736a63] focus:outline-none transition-all"
              />
              {errors.amount && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8c827a] mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-sm text-white focus:outline-none transition-all"
              />
              {errors.date && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8c827a] mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-sm text-white focus:outline-none transition-all cursor-pointer"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat} className="bg-[#1c1918] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8c827a] mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with Lucas, Monthly recurring bill"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] focus:border-[#ff6b00] text-sm text-white placeholder-[#736a63] focus:outline-none transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292523]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-2xl bg-[#201d1b] text-[#a89d95] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-extrabold rounded-2xl text-white shadow-lg transition-all ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-[#ff6b00] to-[#ea580c] shadow-[#ff6b00]/25'
                  : 'bg-[#22c55e] text-black shadow-[#22c55e]/25'
              }`}
            >
              {isSubmitting ? 'Recording...' : `Confirm ${type === 'expense' ? 'Transfer' : 'Deposit'}`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
