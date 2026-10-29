import React from 'react';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function AiAgentWidget({ onOpenAiAgent, healthScore = 92, onNavigateWellthPlan }) {
  return (
    <div className="financial-ai-card relative rounded-3xl overflow-hidden p-6 sm:p-7 border border-violet-300 shadow-xl bg-gradient-to-br from-[#7566b9] via-[#6657a8] to-[#52458e] flex flex-col justify-between transition-all group">
      
      {/* Background glowing sphere visuals matching reference image */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none group-hover:bg-white/30 transition-all" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-pink-300/20 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative 3D spheres outline in corner */}
      <div className="absolute right-4 bottom-16 opacity-30 pointer-events-none hidden sm:block">
        <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-white/20" />
        </div>
      </div>

      <div>
        {/* Top badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3 text-amber-200" />
            AI Financial Agent
          </span>
          <span 
            onClick={onNavigateWellthPlan}
            className={`text-[11px] font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 ${
              onNavigateWellthPlan ? 'cursor-pointer hover:bg-[#1f4e32] transition-colors' : ''
            }`}
            title="WellthPlan 2.0 AI Health Score"
          >
            Score: {healthScore}/100
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2 tracking-tight">
          Intelligent Copilot <br />
          Always Watching Your Money
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#c4b5aa] leading-relaxed max-w-xs mb-6">
          Autonomous budgeting, proactive leak detection, and natural language quick-logging.
        </p>

        {/* User face bubbles matching reference image */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full ring-2 ring-[#6556a7] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
            <div className="w-8 h-8 rounded-full ring-2 ring-[#6556a7] bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white">
              EL
            </div>
            <div className="w-8 h-8 rounded-full ring-2 ring-[#6556a7] bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-[10px] font-bold text-white">
              ER
            </div>
            <div className="w-8 h-8 rounded-full ring-2 ring-[#6556a7] bg-violet-400 flex items-center justify-center text-[10px] font-bold text-white">
              +4
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#c4b5aa]">
            Trusted by students worldwide
          </span>
        </div>
      </div>

      {/* Solid White Action Button (matching reference image "Request") */}
      <button
        onClick={onOpenAiAgent}
        className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-violet-50 text-violet-900 font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-violet-600" />
        <span>Ask FinAI Copilot</span>
        <ArrowRight className="w-4 h-4 text-[#1a1410] ml-1" />
      </button>

    </div>
  );
}
