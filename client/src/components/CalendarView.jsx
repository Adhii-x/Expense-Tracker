import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function CalendarView({ 
  transactions, 
  currency, 
  onQuickAdd 
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().substring(0, 10));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, etc.

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map transactions by YYYY-MM-DD
  const transactionsByDay = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.date) {
        if (!map[t.date]) map[t.date] = [];
        map[t.date].push(t);
      }
    });
    return map;
  }, [transactions]);

  // Selected day transactions
  const selectedDayTx = transactionsByDay[selectedDay] || [];
  const dayIncome = selectedDayTx.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const dayExpense = selectedDayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      
      {/* Month Navigation Header */}
      <div className="p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">
              {monthLabel}
            </h3>
            <p className="text-xs text-[#8c827a]">
              Interactive ledger calendar & daily cashflow audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#201d1b] hover:bg-[#282523] text-[#a89d95] hover:text-white border border-[#2e2a27] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#201d1b] hover:bg-[#282523] text-[#a89d95] hover:text-white border border-[#2e2a27] transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl">
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-[#8c827a] uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank padding for first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-16 sm:h-20 rounded-2xl bg-[#131110]/40 border border-transparent" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayList = transactionsByDay[dateStr] || [];
              const isSelected = selectedDay === dateStr;
              const hasIncome = dayList.some(t => t.type === 'income');
              const hasExpense = dayList.some(t => t.type === 'expense');

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`h-16 sm:h-20 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#26211e] border-[#ff6b00] shadow-lg shadow-[#ff6b00]/20'
                      : dayList.length > 0
                        ? 'bg-[#1c1918] hover:bg-[#24201e] border-[#2e2a27]'
                        : 'bg-[#141211] hover:bg-[#1c1918] border-[#221f1d]'
                  }`}
                >
                  <span className={`text-xs font-bold ${
                    isSelected ? 'text-[#ff6b00]' : 'text-white'
                  }`}>
                    {dayNum}
                  </span>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1">
                    {hasIncome && (
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" title="Income recorded" />
                    )}
                    {hasExpense && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Expense recorded" />
                    )}
                    {dayList.length > 0 && (
                      <span className="text-[10px] font-mono text-[#a89d95] hidden sm:inline ml-auto font-bold">
                        {dayList.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#262220] flex items-center justify-between text-xs text-[#8c827a]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Income Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Expense Day
              </span>
            </div>
            <span>Click any date to inspect details</span>
          </div>

        </div>

        {/* Selected Date Detail Drawer (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#262220]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8c827a]">Selected Date</span>
                <h4 className="text-base font-extrabold text-white">
                  {formatDate(selectedDay)}
                </h4>
              </div>
              <button
                onClick={() => onQuickAdd('expense')}
                className="p-2 rounded-xl bg-[#ff6b00]/15 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all"
                title="Add transaction on this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Daily Net Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-2xl bg-[#1f1d1b] border border-[#2b2725]">
                <span className="text-[10px] text-[#8c827a] block">Inflow</span>
                <span className="text-xs font-mono font-bold text-[#22c55e]">
                  +{formatCurrency(dayIncome, currency)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#1f1d1b] border border-[#2b2725]">
                <span className="text-[10px] text-[#8c827a] block">Outflow</span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  -{formatCurrency(dayExpense, currency)}
                </span>
              </div>
            </div>

            {/* Transaction Items */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {selectedDayTx.length > 0 ? (
                selectedDayTx.map(tx => (
                  <div key={tx.id} className="p-3 rounded-2xl bg-[#1c1918] border border-[#282422] flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{tx.title}</h5>
                      <span className="text-[10px] text-[#8c827a]">{tx.category}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      tx.type === 'income' ? 'text-[#22c55e]' : 'text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#8c827a]">
                  No transactions recorded on this date.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
