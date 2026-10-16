import React, { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle, 
  Edit2, 
  Check, 
  X 
} from 'lucide-react';
import { formatCurrency } from '../utils';

export default function BudgetTracker({ 
  currentMonthExpenses, 
  budgetLimit, 
  onSaveBudget, 
  currency, 
  activeMonth 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState(budgetLimit.toString());
  const [error, setError] = useState('');

  const limitNumber = Number(budgetLimit) || 0;
  const spentNumber = Number(currentMonthExpenses) || 0;

  const percentageUsed = limitNumber > 0 
    ? Math.min(200, ((spentNumber / limitNumber) * 100))
    : 0;

  const isOverBudget = limitNumber > 0 && spentNumber > limitNumber;
  const isNearLimit = limitNumber > 0 && !isOverBudget && percentageUsed >= 80;
  const remaining = Math.max(0, limitNumber - spentNumber);
  const overspent = Math.max(0, spentNumber - limitNumber);

  const handleSave = () => {
    const val = parseFloat(tempLimit);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a budget amount greater than 0.');
      return;
    }
    setError('');
    onSaveBudget(val);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempLimit(budgetLimit.toString());
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Monthly Budget Tracker & Limit Warning
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active Scope: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeMonth || 'Current Period'}</span>
            </p>
          </div>
        </div>

        {/* Limit Display or Edit */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  min="1"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-32 px-3 py-1.5 text-sm rounded-lg border border-indigo-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Set budget"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                title="Save Budget"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Monthly Target:
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(limitNumber, currency)}
              </span>
              <button
                onClick={() => {
                  setTempLimit(budgetLimit.toString());
                  setIsEditing(true);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                title="Edit Budget Limit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {error && (
        <p className="text-xs text-rose-500 mb-2 font-medium">{error}</p>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-slate-600 dark:text-slate-300">
            Spent: <span className="font-bold">{formatCurrency(spentNumber, currency)}</span> ({percentageUsed.toFixed(0)}%)
          </span>
          <span className={isOverBudget ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
            {isOverBudget 
              ? `Over limit by ${formatCurrency(overspent, currency)}`
              : `Remaining: ${formatCurrency(remaining, currency)}`}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isOverBudget
                ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                : isNearLimit
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>
      </div>

      {/* Warning & Alert Messages */}
      {isOverBudget && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-800 dark:text-rose-300">
            <span className="font-bold">Budget Alert! </span>
            You have exceeded your monthly spending threshold by <span className="font-bold underline">{formatCurrency(overspent, currency)}</span>. Consider curbing non-essential expenses for the remainder of this cycle.
          </div>
        </div>
      )}

      {isNearLimit && !isOverBudget && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <span className="font-bold">Budget Warning: </span>
            You have used <span className="font-bold">{percentageUsed.toFixed(0)}%</span> of your monthly allowance. Only <span className="font-bold">{formatCurrency(remaining, currency)}</span> is left.
          </div>
        </div>
      )}

      {!isOverBudget && !isNearLimit && limitNumber > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-800 dark:text-emerald-300">
            Great financial discipline! Spending is well within your monthly allocation.
          </span>
        </div>
      )}

    </div>
  );
}
