import React, { useState } from 'react';
import { ArrowUpDown, ChevronDown, TrendingUp, PieChart, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function InvestmentsBarChart({ currency }) {
  const [viewMode, setViewMode] = useState('investments'); // 'investments' | 'categories'
  const [selectedSort, setSelectedSort] = useState('default');

  const monthlyBars = [
    { month: 'Sep', amount: 200, isPeak: false },
    { month: 'Oct', amount: 300, isPeak: false },
    { month: 'Nov', amount: 400, isPeak: false },
    { month: 'Dec', amount: 400, isPeak: false },
    { month: 'Jan', amount: 500, isPeak: true },
    { month: 'Feb', amount: 400, isPeak: false }
  ];

  const maxAmount = 550;

  return (
    <div className="investments-widget rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between transition-all">
      
      {/* Top Header: Title, Value, +1.52% & Controls */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Investments & Yield
          </span>

          {/* Controls: Sort and Month dropdowns */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSort(selectedSort === 'default' ? 'desc' : 'default')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-violet-50 text-[11px] font-semibold text-slate-600 hover:text-violet-800 border border-slate-200 transition-all"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort</span>
            </button>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-[11px] font-semibold text-slate-600 border border-slate-200 cursor-pointer">
              <span>Month</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Big Amount + Percentage */}
        <div className="flex items-baseline gap-3 mb-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ₹3,200.00
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 1.52%</span>
          </span>
        </div>
      </div>

      {/* Styled Bar Chart matching the reference image */}
      <div className="pt-4 pb-2">
        <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-40 sm:h-44">
          {monthlyBars.map((item, idx) => {
            const heightPct = (item.amount / maxAmount) * 100;

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                
                {/* Floating Amount Tag */}
                <div className={`mb-1.5 transition-transform group-hover:-translate-y-1 ${
                  item.isPeak ? 'scale-105' : ''
                }`}>
                  {item.isPeak ? (
                    <span className="px-2 py-0.5 rounded-lg bg-violet-600 text-white font-extrabold text-[11px] shadow-lg shadow-violet-600/20">
                      ${item.amount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                      ${item.amount}
                    </span>
                  )}
                </div>

                {/* Vertical Bar */}
                <div className="w-full max-w-[42px] bg-violet-50 rounded-xl overflow-hidden flex items-end h-32">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ${
                      item.isPeak
                        ? 'bg-gradient-to-t from-[#5a4a9e] via-[#7868bd] to-[#a99be8] shadow-lg shadow-violet-500/20'
                        : 'bg-gradient-to-t from-[#c8c0e8] to-[#8879c3] group-hover:to-[#6f60b0]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                {/* Month Label */}
                <span className={`mt-2 text-[11px] font-semibold ${
                  item.isPeak ? 'text-violet-700' : 'text-slate-500'
                }`}>
                  {item.month}
                </span>

              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Subtext */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Portfolio health: <strong className="text-slate-800">Diversified</strong></span>
        <span className="text-violet-700 font-semibold cursor-pointer hover:underline">Rebalance</span>
      </div>

    </div>
  );
}
