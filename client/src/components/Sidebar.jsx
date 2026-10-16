import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  BarChart3, 
  Bot, 
  CreditCard, 
  Briefcase, 
  Calendar, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenAiAgent }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: LayoutGrid },
    { id: 'charts', label: 'Charts & Trends', icon: BarChart3 },
    { id: 'ai', label: 'FinAI Agent', icon: Bot, badge: 'AI', isAi: true },
    { id: 'cards', label: 'My Cards', icon: CreditCard },
    { id: 'ledger', label: 'Transactions', icon: Briefcase },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <aside className="w-18 md:w-20 lg:w-22 bg-[#0d0c0c] border-r border-[#24201e] flex flex-col items-center py-6 justify-between select-none shrink-0 z-40 min-h-screen">
      
      {/* Top Logo / Brand Icon */}
      <div className="flex flex-col items-center gap-6">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1f1d1c] to-[#2e2a27] border border-[#3d3733] flex items-center justify-center cursor-pointer hover:border-[#f97316] transition-all shadow-lg shadow-black/60 group"
          title="ExpenseTracker Pro"
        >
          {/* Hexagonal / Clover fintech logo matching reference */}
          <div className="w-6 h-6 flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#22c55e]">
              <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
            </svg>
          </div>
        </div>

        {/* Navigation Items Dock */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
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
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#ff6b00] to-[#f97316] text-white shadow-lg shadow-[#ff6b00]/30 scale-105'
                    : 'text-[#8c827a] hover:text-white hover:bg-[#1a1716]'
                }`}
              >
                <Icon className="w-5 h-5" />
                
                {/* AI / Notification Badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6b00] text-[9px] font-extrabold text-white shadow-md animate-pulse">
                    <Sparkles className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Settings & Logout */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setActiveTab('ledger')}
          title="Settings & Preferences"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#8c827a] hover:text-white hover:bg-[#1a1716] transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={() => alert('Logged in as Ethan Reynolds (@ethan_reynolds)')}
          title="Session Details"
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#8c827a] hover:text-[#f43f5e] hover:bg-[#1a1716] transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

    </aside>
  );
}
