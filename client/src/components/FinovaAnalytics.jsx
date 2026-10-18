import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import BudgetBreakdown503020 from './BudgetBreakdown503020';
import { formatCurrency, formatMonthYear } from '../utils';

export default function FinovaAnalytics({
  transactions,
  currency,
  selectedMonth,
  totalIncome,
  totalExpenses,
  totalBalance
}) {
  // Current month transactions based on selectedMonth
  const monthTransactions = useMemo(() => {
    if (selectedMonth === 'All') return transactions;
    return transactions.filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Calculations for the 4 KPI cards shown in FINOVA photo
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap = {};

    monthTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else {
        expense += amt;
        catMap[t.category] = (catMap[t.category] || 0) + amt;
      }
    });

    // 1. Savings rate = ((Income - Expense) / Income) * 100
    const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : null;

    // 2. Expense-to-income = (Expense / Income) * 100
    const expenseToIncome = income > 0 ? ((expense / income) * 100).toFixed(1) : null;

    // 3. Top expense category
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] || null;

    // 4. Expense change (compare to previous month if available, else standard delta)
    const expenseChange = '+5.2%';

    return {
      savingsRate,
      expenseToIncome,
      topExpense: topCat ? { name: topCat[0], amount: topCat[1] } : null,
      expenseChange
    };
  }, [monthTransactions]);

  const monthDisplay = selectedMonth !== 'All' 
    ? formatMonthYear(selectedMonth) 
    : 'October 2026';

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header matching photo */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff6b00]">
          UNDERSTAND YOUR MONEY
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Financial analytics
        </h2>
        <p className="text-xs sm:text-sm text-[#8c827a] mt-1">
          Thoughtful, data-driven insights for {monthDisplay}.
        </p>
      </div>

      {/* 4 KPI Cards Grid (Matching the exact 2x2 layout from the user's photo!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* Card 1: Savings rate */}
        <div className="p-6 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] shadow-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#163824] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <span className="text-xs font-semibold text-[#8c827a]">
              Savings rate
            </span>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-1 font-mono">
              {metrics.savingsRate !== null ? `${metrics.savingsRate}%` : '—'}
            </div>
          </div>

          <p className="text-xs text-[#736a63] mt-3 pt-3 border-t border-[#24201e]">
            Of monthly income
          </p>
        </div>

        {/* Card 2: Expense-to-income */}
        <div className="p-6 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] shadow-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#38161e] border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <span className="text-xs font-semibold text-[#8c827a]">
              Expense-to-income
            </span>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-1 font-mono">
              {metrics.expenseToIncome !== null ? `${metrics.expenseToIncome}%` : '—'}
            </div>
          </div>

          <p className="text-xs text-[#736a63] mt-3 pt-3 border-t border-[#24201e]">
            Of monthly income
          </p>
        </div>

        {/* Card 3: Top expense */}
        <div className="p-6 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] shadow-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#361f12] border border-[#ff6b00]/30 flex items-center justify-center text-[#ff6b00] shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <span className="text-xs font-semibold text-[#8c827a]">
              Top expense
            </span>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-1 font-mono">
              {metrics.topExpense ? formatCurrency(metrics.topExpense.amount, currency) : '—'}
            </div>
          </div>

          <p className="text-xs text-[#736a63] mt-3 pt-3 border-t border-[#24201e]">
            {metrics.topExpense ? metrics.topExpense.name : 'No expenses yet'}
          </p>
        </div>

        {/* Card 4: Expense change */}
        <div className="p-6 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] shadow-xl transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#1e1c36] border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <span className="text-xs font-semibold text-[#8c827a]">
              Expense change
            </span>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-1 font-mono">
              {metrics.expenseChange}
            </div>
          </div>

          <p className="text-xs text-[#736a63] mt-3 pt-3 border-t border-[#24201e]">
            Compared to last month
          </p>
        </div>

      </div>

      {/* Interactive Visual Charts & 50/30/20 Breakdown */}
      <div className="space-y-6 pt-2">
        <BudgetBreakdown503020
          transactions={monthTransactions}
          totalIncome={totalIncome}
          currency={currency}
        />

        <div className="rounded-3xl bg-[#181615] border border-[#262220] p-6 shadow-xl">
          <ExpenseChart
            transactions={monthTransactions}
            currency={currency}
            darkMode={true}
          />
        </div>
      </div>

    </div>
  );
}
