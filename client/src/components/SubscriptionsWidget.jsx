import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Check,
  RefreshCw 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function SubscriptionsWidget({ 
  subscriptions, 
  currency, 
  onCreateSub, 
  onDeleteSub 
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBilling, setNextBilling] = useState(new Date().toISOString().substring(0, 10));
  const [category, setCategory] = useState('Entertainment');

  const totalMonthlyCost = subscriptions.reduce((acc, s) => {
    const cost = Number(s.amount) || 0;
    return acc + (s.billingCycle === 'yearly' ? cost / 12 : cost);
  }, 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) return;
    onCreateSub({
      name: name.trim(),
      amount: parseFloat(amount),
      billingCycle,
      nextBilling,
      category
    });
    setName('');
    setAmount('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171b26] via-[#151722] to-[#121110] border border-blue-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              Subscriptions & Recurring Bills
            </h3>
          </div>
          <p className="text-xs text-[#a89d95]">
            Monthly Outflow: <strong className="text-white font-mono">{formatCurrency(totalMonthlyCost, currency)}</strong> across {subscriptions.length} recurring services
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="button-primary flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* AI Subscription Advisory */}
      <div className="p-4 rounded-2xl bg-[#1c1815] border border-[#ff6b00]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#ff6b00] shrink-0 mt-0.5" />
        <div className="text-xs text-[#d4ccc5] leading-relaxed">
          <strong className="text-white">FinAI Optimization Alert: </strong>
          You are currently allocating <strong>{formatCurrency(totalMonthlyCost, currency)}/mo</strong> to software & fitness recurring subscriptions. Utilizing student discounts on Spotify and GitHub Developer Pack can unlock an estimated <strong>₹14.00/mo</strong> in surplus savings.
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptions.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] hover:border-blue-500/40 shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#24201e] text-[#a89d95] uppercase">
                  {s.billingCycle}
                </span>
                <button
                  onClick={() => onDeleteSub(s.id)}
                  className="p-1 rounded-lg text-[#736a63] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove Subscription"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-extrabold text-white text-base tracking-tight mb-1">
                {s.name}
              </h4>

              <div className="text-2xl font-extrabold text-white font-mono my-2">
                {formatCurrency(s.amount, currency)}
                <span className="text-xs font-sans text-[#8c827a] font-normal"> /mo</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#262220] flex items-center justify-between text-[11px] text-[#8c827a]">
              <span>Next bill:</span>
              <span className="font-semibold text-white">{formatDate(s.nextBilling)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subscription Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl p-6">
            <h4 className="font-extrabold text-white text-base mb-1">
              Add Recurring Subscription
            </h4>
            <p className="text-xs text-[#8c827a] mb-4">
              Track renewals and keep tabs on monthly leakage
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Netflix 4K, Notion Plus"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                    Cost *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="9.99"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                    Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8c827a] uppercase mb-1">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  value={nextBilling}
                  onChange={(e) => setNextBilling(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1c1918] border border-[#2e2a27] text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-[#201d1b] text-xs font-bold text-[#8c827a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary flex-1 py-2.5 rounded-2xl text-xs font-bold shadow-lg"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
