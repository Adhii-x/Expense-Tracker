import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown, 
  Download, 
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import { CURRENCIES } from '../constants';

export default function TopHeader({
  searchTerm,
  setSearchTerm,
  darkMode,
  setDarkMode,
  currency,
  setCurrency,
  onRefresh,
  onExportCsv,
  onResetDemo,
  onOpenAiAgent
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Spending Alert', desc: 'Dining out is 38% above usual pace.', time: '10m ago', unread: true },
    { id: 2, title: 'Scholarship Deposited', desc: '+$1,200.00 credited to account.', time: '2h ago', unread: false },
    { id: 3, title: 'Budget Limit', desc: 'You have used 68% of monthly limit.', time: '1d ago', unread: false },
  ];

  return (
    <header className="h-20 bg-[#0e0d0d] border-b border-[#24201e] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      
      {/* Left: Search Bar with ⌘ + Space shortcut pill */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <div className="flex items-center bg-[#181615] hover:bg-[#1f1d1b] focus-within:bg-[#1f1d1b] border border-[#2b2725] focus-within:border-[#ff6b00] rounded-2xl px-4 py-2.5 transition-all shadow-inner">
            <Search className="w-4 h-4 text-[#8c827a] shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-[#e6ded8] placeholder-[#736a63] focus:outline-none w-full"
            />
            {searchTerm ? (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-[#8c827a] hover:text-white ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#262220] border border-[#38332f] text-[11px] font-semibold text-[#a89d95] tracking-tight shrink-0">
                <span>⌘</span>
                <span>+</span>
                <span>Space</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Refresh, Notifications, Dark Mode, Currency & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        
        {/* Currency Switcher */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="appearance-none bg-[#181615] hover:bg-[#201d1b] text-xs sm:text-sm font-semibold text-[#d4ccc5] py-2 pl-3 pr-7 rounded-xl border border-[#2b2725] focus:outline-none focus:border-[#ff6b00] cursor-pointer transition-all"
            title="Display Currency"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="bg-[#181615] text-[#d4ccc5]">
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#736a63] text-[10px]">
            ▼
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Refresh Financial Data"
          className="p-2.5 rounded-xl bg-[#181615] hover:bg-[#201d1b] text-[#a89d95] hover:text-white border border-[#2b2725] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Export CSV Button */}
        <button
          onClick={onExportCsv}
          title="Export CSV Spreadsheet"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#181615] hover:bg-[#201d1b] text-[#d4ccc5] border border-[#2b2725] transition-all"
        >
          <Download className="w-3.5 h-3.5 text-[#ff6b00]" />
          <span>Export</span>
        </button>

        {/* Demo Data Button */}
        <button
          onClick={onResetDemo}
          title="Reset to Sample Demo Transactions"
          className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#ff6b00]/15 hover:bg-[#ff6b00]/25 text-[#ff6b00] border border-[#ff6b00]/30 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Data</span>
        </button>

        {/* Notifications Bell with Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-[#181615] hover:bg-[#201d1b] text-[#a89d95] hover:text-white border border-[#2b2725] transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ff6b00] ring-2 ring-[#0e0d0d]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#181615] border border-[#2e2a27] shadow-2xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2b2725]">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-[#ff6b00] font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-[#1f1d1b] hover:bg-[#262321] transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{n.title}</span>
                      <span className="text-[10px] text-[#8c827a]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#a89d95]">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className="p-2.5 rounded-xl bg-[#181615] hover:bg-[#201d1b] text-[#a89d95] hover:text-white border border-[#2b2725] transition-all"
        >
          {darkMode ? (
            <Moon className="w-4 h-4 text-[#ff6b00]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* User Profile Pill matching reference image */}
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl bg-[#181615] hover:bg-[#201d1b] border border-[#2b2725] cursor-pointer transition-all"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#ff6b00]/40 shrink-0 bg-gradient-to-tr from-[#ff6b00] to-amber-500 flex items-center justify-center text-xs font-bold text-white">
            ER
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-white tracking-tight">
              Ethan Reynolds
            </div>
            <div className="text-[10px] font-medium text-[#8c827a]">
              @ethan_reynolds
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8c827a] ml-0.5" />
        </div>

      </div>

    </header>
  );
}
