import React from 'react';
import { 
  LayoutGrid, 
  FileText, 
  BarChart2, 
  Wallet, 
  Sliders, 
  Bot, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenAiAgent, 
  darkMode, 
  setDarkMode, 
  isCollapsed, 
  setIsCollapsed,
  currency 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'ai', label: 'AI Copilot', icon: Bot, isAi: true, badge: 'AI' }
  ];

  const currencyUnit = currency === 'INR' ? 'rupee' : 'dollar';

  return (
    <aside 
      className={`bg-[#0d0c0c] border-r border-[#24201e] flex flex-col justify-between py-5 select-none shrink-0 z-40 min-h-screen transition-all duration-300 ${
        isCollapsed ? 'w-20 px-2' : 'w-64 px-4'
      }`}
    >
      
      {/* Top Brand & Nav */}
      <div className="space-y-6">
        
        {/* Brand / Logo Header */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 px-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff6b00] to-amber-500 border border-[#ff6b00]/40 flex items-center justify-center text-white shadow-lg shadow-[#ff6b00]/25 group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>

          {!isCollapsed && (
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-white tracking-tight">
                  FINOVA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#ff6b00]/20 text-[#ff8c33] border border-[#ff6b00]/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#8c827a]">
                Your money, in focus.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Menu matching user's photo */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAi) {
                    onOpenAiAgent();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                title={item.label}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff6b00] to-[#ea580c] text-white shadow-lg shadow-[#ff6b00]/25'
                    : 'text-[#8c827a] hover:text-white hover:bg-[#181615]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {/* White active dot on the right edge matching FINOVA photo */}
                {!isCollapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                )}

                {isCollapsed && item.badge && (
                  <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Motivational Card docked in sidebar matching photo */}
        {!isCollapsed && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1918] to-[#121110] border border-[#ff6b00]/30 shadow-xl relative overflow-hidden group">
            <div className="w-8 h-8 rounded-xl bg-[#ff6b00]/20 border border-[#ff6b00]/40 flex items-center justify-center text-[#ff6b00] mb-2.5">
              <Sparkles className="w-4 h-4" />
            </div>

            <h4 className="text-xs font-extrabold text-white leading-snug">
              Make every {currencyUnit} count.
            </h4>
            <p className="text-[11px] text-[#8c827a] leading-relaxed mt-1">
              Small steps today. Big wins tomorrow.
            </p>
          </div>
        )}

      </div>

      {/* Bottom Sidebar Controls: Dark appearance + Collapse toggle */}
      <div className="space-y-3 pt-4 border-t border-[#24201e]">
        
        {/* Dark appearance toggle matching photo */}
        <div 
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#8c827a] hover:text-white hover:bg-[#181615] cursor-pointer transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Toggle appearance"
        >
          <div className="flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-[#ff6b00] shrink-0" />
            {!isCollapsed && <span className="font-semibold text-white">Dark appearance</span>}
          </div>

          {!isCollapsed && (
            <div className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
              darkMode ? 'bg-[#ff6b00]' : 'bg-[#332e2b]'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          )}
        </div>

        {/* Collapse sidebar toggle button matching photo */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#8c827a] hover:text-white hover:bg-[#181615] transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">Collapse sidebar</span>
            </>
          )}
        </button>

        {!isCollapsed && (
          <p className="text-[10px] text-[#736a63] text-center pt-1">
            FINOVA © 2026 • Made with care
          </p>
        )}

      </div>

    </aside>
  );
}
