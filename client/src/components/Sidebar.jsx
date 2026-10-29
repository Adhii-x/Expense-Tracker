import React from 'react';
import {
  FileText,
  BarChart2,
  Wallet,
  House,
  Sliders,
  Bot,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenAiAgent,
  isCollapsed,
  setIsCollapsed
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'wellthplan', label: 'WellthPlan 2.0', icon: ShieldCheck, badge: 'CFO' },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'ai', label: 'AI Copilot', icon: Bot, badge: 'AI' }
  ];

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      <button
        type="button"
        onClick={() => setActiveTab('dashboard')}
        className="sidebar-brand"
        title="Expense Tracker dashboard"
        aria-label="Go to dashboard"
      >
        <span className="sidebar-brand-mark"><TrendingUp size={19} /></span>
        {!isCollapsed && <span className="sidebar-brand-name">Spendwise</span>}
      </button>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => item.id === 'ai' ? onOpenAiAgent() : setActiveTab(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`sidebar-link ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-link sidebar-collapse"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
        {!isCollapsed && <span className="sidebar-caption">YOUR MONEY, IN FOCUS</span>}
      </div>
    </aside>
  );
}
