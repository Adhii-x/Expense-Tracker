import React, { useState } from 'react';
import { Target, Plus, Calendar, Sparkles, Check, Trash2, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function SavingsGoals({ 
  goals, 
  currency, 
  onCreateGoal, 
  onDepositGoal, 
  onDeleteGoal 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('50');

  // New goal state
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('2027-01-31');
  const [newCategory, setNewCategory] = useState('General');

  const totalSaved = goals.reduce((acc, g) => acc + Number(g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + Number(g.targetAmount || 0), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget || parseFloat(newTarget) <= 0) return;
    onCreateGoal({
      title: newTitle.trim(),
      targetAmount: parseFloat(newTarget),
      currentAmount: 0,
      deadline: newDeadline,
      category: newCategory
    });
    setNewTitle('');
    setNewTarget('');
    setShowAddModal(false);
  };

  const handleDeposit = () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0 || !depositModalGoal) return;
    onDepositGoal(depositModalGoal.id, val);
    setDepositModalGoal(null);
    setDepositAmount('50');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Stats */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1c1713] via-[#241a12] to-[#1a1411] border border-[#ff6b00]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Target className="w-5 h-5 text-[#ff6b00]" />
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              Target Savings Goals & Piggy Banks
            </h3>
          </div>
          <p className="text-xs text-[#a89d95]">
            Total Allocated: <strong className="text-white">{formatCurrency(totalSaved, currency)}</strong> of {formatCurrency(totalTarget, currency)} ({overallPct}% achieved)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="button-primary flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {goals.map((g) => {
          const current = Number(g.currentAmount) || 0;
          const target = Number(g.targetAmount) || 1;
          const pct = Math.min(100, Math.round((current / target) * 100));
          const remaining = Math.max(0, target - current);

          return (
            <div
              key={g.id}
              className="p-5 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] hover:border-[#ff6b00]/40 shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#262220] text-[#a89d95] uppercase tracking-wider">
                    {g.category || 'Goal'}
                  </span>
                  <button
                    onClick={() => onDeleteGoal(g.id)}
                    className="p-1 rounded-lg text-[#736a63] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-extrabold text-white text-base tracking-tight mb-1">
                  {g.title}
                </h4>

                <div className="flex items-baseline justify-between mt-3 mb-2">
                  <span className="text-xl font-extrabold text-white font-mono">
                    {formatCurrency(current, currency)}
                  </span>
                  <span className="text-xs text-[#8c827a]">
                    Target: {formatCurrency(target, currency)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#262220] h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct >= 100
                        ? 'bg-[#22c55e]'
                        : 'bg-gradient-to-r from-[#ff6b00] to-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8c827a] mb-4">
                  <span>{pct}% funded</span>
                  <span>{remaining > 0 ? `${formatCurrency(remaining, currency)} left` : '🎯 Completed!'}</span>
                </div>
              </div>

              {/* Deposit Action */}
              <button
                onClick={() => setDepositModalGoal(g)}
                className="button-primary w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Deposit to Goal</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl p-6">
            <h4 className="font-extrabold text-white text-base mb-1">
              Deposit to: {depositModalGoal.title}
            </h4>
            <p className="text-xs text-[#8c827a] mb-4">
              Allocate funds from your active card reserve
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex gap-2">
                {['25', '50', '100', '250'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      depositAmount === amt
                        ? 'bg-[#ff6b00] border-[#ff6b00] text-white'
                        : 'bg-[#1c1918] border-[#2e2a27] text-[#a89d95]'
                    }`}
                  >
                    +${amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="1"
                step="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white font-mono text-sm focus:outline-none focus:border-[#ff6b00]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDepositModalGoal(null)}
                className="flex-1 py-2.5 rounded-2xl bg-[#201d1b] text-xs font-bold text-[#8c827a] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="button-primary flex-1 py-2.5 rounded-2xl text-xs font-bold shadow-lg"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl p-6">
            <h4 className="font-extrabold text-white text-base mb-1">
              Create New Savings Target
            </h4>
            <p className="text-xs text-[#8c827a] mb-4">
              Set a dedicated savings milestone for student life
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tuition Buffer, Conference Pass"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white text-sm focus:outline-none focus:border-[#ff6b00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white font-mono text-sm focus:outline-none focus:border-[#ff6b00]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white text-sm focus:outline-none focus:border-[#ff6b00]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#201d1b] text-xs font-bold text-[#8c827a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary flex-1 py-2.5 rounded-2xl text-xs font-bold shadow-lg"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
