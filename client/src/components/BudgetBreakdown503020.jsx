import React from 'react';
import { PieChart, ShieldCheck, Heart, PiggyBank, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function BudgetBreakdown503020({ transactions, totalIncome, currency }) {
  const needsCategories = ['Housing & Rent', 'Groceries', 'Education & Books', 'Transportation', 'Utilities & Bills', 'Healthcare'];
  const wantsCategories = ['Food & Dining', 'Entertainment', 'Shopping', 'Personal Care', 'Other Expense'];

  let needsTotal = 0;
  let wantsTotal = 0;

  transactions.forEach(t => {
    if (t.type === 'expense') {
      const amt = Number(t.amount) || 0;
      if (needsCategories.includes(t.category)) {
        needsTotal += amt;
      } else {
        wantsTotal += amt;
      }
    }
  });

  const baseIncome = totalIncome > 0 ? totalIncome : (needsTotal + wantsTotal + 500);
  const actualSavings = Math.max(0, baseIncome - (needsTotal + wantsTotal));

  const needsPct = Math.round((needsTotal / baseIncome) * 100);
  const wantsPct = Math.round((wantsTotal / baseIncome) * 100);
  const savingsPct = Math.round((actualSavings / baseIncome) * 100);

  return (
    <div className="p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ff6b00]/15 text-[#ff6b00]">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              50/30/20 Financial Budget Rule Analysis
            </h3>
            <p className="text-xs text-[#8c827a]">
              Gold standard budgeting framework for students & young professionals
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Needs (50% target) */}
        <div className="p-4 rounded-2xl bg-[#1f1d1b] border border-[#2e2a27]">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              Needs (Target: 50%)
            </span>
            <span className="text-xs font-mono font-bold text-white">{needsPct}%</span>
          </div>

          <div className="text-xl font-extrabold text-white font-mono mb-2">
            {formatCurrency(needsTotal, currency)}
          </div>

          <div className="w-full bg-[#262220] h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${needsPct <= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, needsPct)}%` }}
            />
          </div>

          <p className="text-[10px] text-[#8c827a]">
            Rent, utilities, transit, textbooks & healthcare
          </p>
        </div>

        {/* Wants (30% target) */}
        <div className="p-4 rounded-2xl bg-[#1f1d1b] border border-[#2e2a27]">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <Heart className="w-4 h-4" />
              Wants (Target: 30%)
            </span>
            <span className="text-xs font-mono font-bold text-white">{wantsPct}%</span>
          </div>

          <div className="text-xl font-extrabold text-white font-mono mb-2">
            {formatCurrency(wantsTotal, currency)}
          </div>

          <div className="w-full bg-[#262220] h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${wantsPct <= 30 ? 'bg-purple-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, wantsPct)}%` }}
            />
          </div>

          <p className="text-[10px] text-[#8c827a]">
            Dining out, hobbies, subscriptions & shopping
          </p>
        </div>

        {/* Savings (20% target) */}
        <div className="p-4 rounded-2xl bg-[#1f1d1b] border border-[#2e2a27]">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#22c55e]">
              <PiggyBank className="w-4 h-4" />
              Savings (Target: 20%)
            </span>
            <span className="text-xs font-mono font-bold text-white">{savingsPct}%</span>
          </div>

          <div className="text-xl font-extrabold text-white font-mono mb-2">
            {formatCurrency(actualSavings, currency)}
          </div>

          <div className="w-full bg-[#262220] h-2 rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full ${savingsPct >= 20 ? 'bg-[#22c55e]' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, savingsPct)}%` }}
            />
          </div>

          <p className="text-[10px] text-[#8c827a]">
            Emergency buffer, investments & surplus capital
          </p>
        </div>

      </div>
    </div>
  );
}
