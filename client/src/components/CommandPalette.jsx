import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  PlusCircle, 
  Camera, 
  Download, 
  Moon, 
  Sun, 
  RotateCcw, 
  LayoutGrid, 
  Calendar, 
  CreditCard, 
  Target,
  ArrowRight,
  X
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenAiAgent,
  onOpenQuickModal,
  onOpenReceiptScanner,
  onExportCsv,
  onResetDemo,
  darkMode,
  setDarkMode,
  setActiveTab
}) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const actions = [
    {
      id: 'ai-agent',
      title: 'Ask FinAI Copilot',
      subtitle: 'Ask savings questions or dictate transactions',
      icon: Sparkles,
      color: 'text-[#ff6b00]',
      action: () => { onClose(); onOpenAiAgent(); }
    },
    {
      id: 'scan-receipt',
      title: 'Scan Receipt with AI OCR',
      subtitle: 'Extract merchant, items, and total from receipt',
      icon: Camera,
      color: 'text-violet-400',
      action: () => { onClose(); onOpenReceiptScanner(); }
    },
    {
      id: 'add-expense',
      title: 'Transfer / Add Expense',
      subtitle: 'Record an outflow transaction with category & date',
      icon: PlusCircle,
      color: 'text-rose-400',
      action: () => { onClose(); onOpenQuickModal('expense'); }
    },
    {
      id: 'add-income',
      title: 'Request / Add Income',
      subtitle: 'Record an inflow deposit or salary',
      icon: PlusCircle,
      color: 'text-emerald-400',
      action: () => { onClose(); onOpenQuickModal('income'); }
    },
    {
      id: 'view-goals',
      title: 'View Savings Goals',
      subtitle: 'Check target deadlines and deposit savings',
      icon: Target,
      color: 'text-amber-400',
      action: () => { onClose(); setActiveTab('goals'); }
    },
    {
      id: 'view-subs',
      title: 'Manage Subscriptions',
      subtitle: 'Audit monthly recurring bills & active memberships',
      icon: CreditCard,
      color: 'text-blue-400',
      action: () => { onClose(); setActiveTab('subscriptions'); }
    },
    {
      id: 'view-calendar',
      title: 'Financial Calendar View',
      subtitle: 'Inspect daily transactions & projected renewals',
      icon: Calendar,
      color: 'text-indigo-400',
      action: () => { onClose(); setActiveTab('calendar'); }
    },
    {
      id: 'export-csv',
      title: 'Export Transactions to CSV',
      subtitle: 'Download spreadsheet compatible ledger file',
      icon: Download,
      color: 'text-teal-400',
      action: () => { onClose(); onExportCsv(); }
    },
    {
      id: 'demo-data',
      title: 'Reload Student Demo Data',
      subtitle: 'Reset sample transactions, cards and goals for presentation',
      icon: RotateCcw,
      color: 'text-orange-400',
      action: () => { onClose(); onResetDemo(); }
    },
    {
      id: 'toggle-theme',
      title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle dashboard appearance theme',
      icon: darkMode ? Sun : Moon,
      color: 'text-yellow-400',
      action: () => { onClose(); setDarkMode(!darkMode); }
    }
  ];

  const filtered = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#141211] border border-[#2e2a27] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#292523] bg-[#1a1715]">
          <Search className="w-5 h-5 text-[#8c827a] shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action (e.g. AI, Receipt, Export)..."
            className="w-full bg-transparent text-sm text-white placeholder-[#736a63] focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#8c827a] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-3 max-h-[380px] overflow-y-auto space-y-1.5">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#201d1b] border border-transparent hover:border-[#2b2725] cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl bg-[#1c1918] ${item.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ff6b00] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#8c827a]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#736a63] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-[#8c827a]">
              No actions match "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-[#171513] border-t border-[#24201e] flex items-center justify-between text-[11px] text-[#736a63]">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-[#24201e] text-[10px] text-[#a89d95]">ESC</kbd>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-[#24201e] text-[10px] text-[#a89d95]">↵</kbd>
            <span>to select</span>
          </div>
        </div>

      </div>
    </div>
  );
}
