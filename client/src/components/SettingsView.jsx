import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Download, 
  Wallet,
  ShieldCheck, 
  Database, 
  Sparkles,
  Info
} from 'lucide-react';

export default function SettingsView({
  onResetDemo,
  onExportCsv,
  totalTransactions,
  backendOnline
}) {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      
      {/* Header */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff6b00]">
          PREFERENCES & SYSTEM
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Settings & Configurations
        </h2>
        <p className="text-xs sm:text-sm text-[#8c827a] mt-1">
          Manage project records and export your INR transaction reports.
        </p>
      </div>

      {/* Currency Preference Card */}
      <div className="p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#ff6b00]/15 text-[#ff6b00]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Transaction Currency
            </h3>
            <p className="text-xs text-[#8c827a]">
              All transactions, budgets, charts, and exports use Indian Rupees.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-3 p-3.5 rounded-2xl bg-[#2a1708] border border-[#ff6b00] shadow-md shadow-[#ff6b00]/20">
          <span className="text-lg font-bold font-mono text-white">₹</span>
          <div>
            <div className="text-xs font-bold text-white">INR</div>
            <div className="text-[10px] text-[#8c827a]">Indian Rupee</div>
          </div>
        </div>
      </div>

      {/* Demo Data & Reset Card */}
      <div className="p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#ff6b00]/15 text-[#ff6b00]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">
              Sample Data & Evaluation Mode
            </h3>
            <p className="text-xs text-[#8c827a]">
              Reset sample records for project presentations or clear ledger
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onResetDemo}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#ff6b00]/15 hover:bg-[#ff6b00]/25 text-[#ff6b00] text-xs font-bold border border-[#ff6b00]/40 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Student Demo Data</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#24201e] hover:bg-[#2e2a27] text-white text-xs font-bold border border-[#332e2b] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ff6b00]" />
            <span>Export All Transactions ({totalTransactions})</span>
          </button>
        </div>
      </div>

      {/* Project Information */}
      <div className="p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs text-[#a89d95] leading-relaxed space-y-1">
          <h4 className="font-bold text-white text-sm">
            Expense Tracker • Final Year Computer Science Project
          </h4>
          <p>
            Full-stack expense tracking & data visual analytics platform built with React 19, Vite, Tailwind CSS, Chart.js, Express.js REST API, and AI Copilot Reasoning.
          </p>
          <p className="text-[11px] text-[#736a63] pt-1">
            Engineered with dual persistence (Browser LocalStorage + REST backend fallback).
          </p>
        </div>
      </div>

    </div>
  );
}
