import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../utils';

export default function SummaryCards({ 
  totalBalance, 
  totalIncome, 
  totalExpenses, 
  currency, 
  incomeCount, 
  expenseCount 
}) {
  const isBalancePositive = totalBalance >= 0;
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 
    ? Math.max(-100, Math.min(100, ((totalBalance / totalIncome) * 100))).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      
      {/* 1. Total Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Balance
          </span>
          <div className={`p-2 rounded-xl ${
            isBalancePositive 
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          }`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isBalancePositive 
              ? 'text-slate-900 dark:text-white' 
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(totalBalance, currency)}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {isBalancePositive ? (
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Healthy Standing
            </span>
          ) : (
            <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              Negative Balance
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500">• Net Cashflow</span>
        </div>
      </div>

      {/* 2. Total Income Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Income
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(totalIncome, currency)}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            {incomeCount} {incomeCount === 1 ? 'source' : 'sources'}
          </span>
          <span>recorded</span>
        </div>
      </div>

      {/* 3. Total Expenses Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Expenses
          </span>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
            -{formatCurrency(totalExpenses, currency)}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            {expenseCount} {expenseCount === 1 ? 'item' : 'items'}
          </span>
          <span>deducted</span>
        </div>
      </div>

      {/* 4. Savings Rate Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Savings Rate
          </span>
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {savingsRate}%
          </h2>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              Number(savingsRate) >= 20 
                ? 'bg-emerald-500' 
                : Number(savingsRate) > 0 
                  ? 'bg-amber-500' 
                  : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, Number(savingsRate)))}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {Number(savingsRate) >= 20 ? 'Optimal rate (>20%)' : Number(savingsRate) > 0 ? 'Modest savings' : 'High spending alert'}
        </p>
      </div>

    </div>
  );
}
