import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Bell, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import { CURRENCIES } from '../constants';
import { formatMonthYear } from '../utils';

export default function TopHeader({
  activeTab,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  searchTerm,
  setSearchTerm,
  currency,
  setCurrency,
  onAddTransactionClick,
  onOpenCommandPalette
}) {
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Month navigation: step backward or forward
  const currentMonthIndex = availableMonths.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    if (selectedMonth === 'All') {
      if (availableMonths.length > 0) setSelectedMonth(availableMonths[0]);
    } else if (currentMonthIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentMonthIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'All') {
      if (availableMonths.length > 0) setSelectedMonth(availableMonths[0]);
    } else if (currentMonthIndex > 0) {
      setSelectedMonth(availableMonths[currentMonthIndex - 1]);
    }
  };

  // Capitalize active tab title
  const pageTitles = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    analytics: 'Analytics',
    wellthplan: 'WellthPlan 2.0',
    budgets: 'Budgets',
    settings: 'Settings',
    ai: 'FinAI Copilot'
  };

  const currentTitle = pageTitles[activeTab] || 'Dashboard';
  const currentDateFormatted = 'Friday, 16 October 2026';

  const notifications = [
    { id: 1, title: 'AI Spending Alert', desc: 'Dining out is 38% above usual pace.', time: '10m ago' },
    { id: 2, title: 'Scholarship Deposited', desc: '+$1,200.00 credited to account.', time: '2h ago' },
    { id: 3, title: 'Budget Limit', desc: 'You have used 68% of monthly limit.', time: '1d ago' },
  ];

  return (
    <header className="min-h-20 bg-[#0e0d0d] border-b border-[#24201e] px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 select-none">
      
      {/* Left: Date Subtitle + Main Page Title matching photo */}
      <div className="flex flex-col justify-center">
        <span className="text-[11px] font-medium text-[#8c827a]">
          {currentDateFormatted}
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {currentTitle}
        </h1>
      </div>

      {/* Center: Search Transactions Input matching photo */}
      <div className="flex-1 max-w-md w-full">
        <div className="relative">
          <Search className="w-4 h-4 text-[#736a63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-9 py-2 rounded-2xl bg-[#181615] border border-[#2b2725] focus:border-[#ff6b00] text-xs sm:text-sm text-white placeholder-[#736a63] focus:outline-none transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#736a63] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls matching photo: < [calendar icon] Oct 2026 ⌄ > | Bell | + Add transaction | User pill */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        
        {/* Month Stepper Selector matching photo */}
        <div className="flex items-center bg-[#181615] border border-[#2b2725] rounded-2xl p-1 text-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-xl text-[#8c827a] hover:text-white hover:bg-[#24201e] transition-colors cursor-pointer"
            title="Previous billing month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Month Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#d4ccc5] hover:text-white transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#ff6b00]" />
              <span>{selectedMonth === 'All' ? 'All Months' : formatMonthYear(selectedMonth)}</span>
              <ChevronDown className="w-3 h-3 text-[#736a63]" />
            </button>

            {showMonthDropdown && (
              <div className="absolute left-0 mt-2 w-40 rounded-2xl bg-[#181615] border border-[#2e2a27] shadow-2xl p-2 z-50 animate-fade-in">
                <button
                  onClick={() => { setSelectedMonth('All'); setShowMonthDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedMonth === 'All' ? 'bg-[#ff6b00] text-white' : 'text-[#a89d95] hover:text-white hover:bg-[#201d1b]'
                  }`}
                >
                  All Months
                </button>
                {availableMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      selectedMonth === m ? 'bg-[#ff6b00] text-white' : 'text-[#a89d95] hover:text-white hover:bg-[#201d1b]'
                    }`}
                  >
                    {formatMonthYear(m)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded-xl text-[#8c827a] hover:text-white hover:bg-[#24201e] transition-colors cursor-pointer"
            title="Next billing month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Currency Selector */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="appearance-none bg-[#181615] hover:bg-[#201d1b] text-xs font-semibold text-[#d4ccc5] py-2 pl-2.5 pr-6 rounded-xl border border-[#2b2725] focus:outline-none focus:border-[#ff6b00] cursor-pointer"
            title="Currency"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="bg-[#181615]">
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#736a63] text-[9px]">
            ▼
          </span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-[#181615] hover:bg-[#201d1b] text-[#a89d95] hover:text-white border border-[#2b2725] transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6b00] ring-2 ring-[#0e0d0d]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#181615] border border-[#2e2a27] shadow-2xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2b2725]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-[#ff6b00] font-semibold cursor-pointer">Clear</span>
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 rounded-xl bg-[#1f1d1b] text-xs">
                    <div className="font-semibold text-white">{n.title}</div>
                    <div className="text-[11px] text-[#8c827a]">{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* + Add transaction prominent button matching photo */}
        <button
          onClick={onAddTransactionClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ea580c] hover:from-[#ff771a] hover:to-[#f97316] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#ff6b00]/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add transaction</span>
        </button>

        {/* User Avatar Letter Circle matching photo ("T") */}
        <div 
          className="w-9 h-9 rounded-2xl bg-[#262220] border border-[#38332f] flex items-center justify-center font-bold text-sm text-white shadow-sm cursor-pointer hover:border-[#ff6b00] transition-colors"
          title="Account Profile"
        >
          T
        </div>

      </div>

    </header>
  );
}
