import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Sparkles, 
  PiggyBank, 
  Flame, 
  HeartHandshake, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  Info,
  ChevronRight,
  Zap,
  Target
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function WellthPlanHealthScore({ healthData, onOpenAiAgent }) {
  const [timeframe, setTimeframe] = useState('30d'); // '30d' | '90d' | '180d'

  if (!healthData) return null;

  const { score, tier, pillars, history, scoreFactors, improvementTips } = healthData;

  const currentHistory = history ? history[timeframe] : null;

  // Chart data for historical score changes
  const chartLabels = currentHistory ? currentHistory.points.map(p => p.label) : ['30d ago', '20d ago', '10d ago', 'Today'];
  const chartPoints = currentHistory ? currentHistory.points.map(p => p.score) : [78, 80, 82, score];

  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartPoints,
        fill: true,
        borderColor: '#0056ff',
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 160);
          gradient.addColorStop(0, 'rgba(0, 86, 255, 0.24)');
          gradient.addColorStop(1, 'rgba(0, 86, 255, 0.0)');
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2277ff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1918',
        titleColor: '#8c827a',
        bodyColor: '#ffffff',
        borderColor: '#ff6b00',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (item) => `Health Score: ${item.raw} pts`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#736a63', font: { size: 10 } }
      },
      y: {
        min: 30,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#736a63', font: { size: 10 }, stepSize: 20 }
      }
    }
  };

  return (
    <div className="wellthplan-view space-y-6 animate-fade-in">
      
      {/* Hero Section: Score Ring + Title + Personal CFO Banner */}
      <div className="wellthplan-hero p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1c1613] via-[#171413] to-[#0f0e0d] border border-[#ff6b00]/30 shadow-2xl relative overflow-hidden">
        
        {/* Glow orb */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#ff6b00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left: Score Badge + Headline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6b00]/20 border border-[#ff6b00]/40 text-[#ff8c33] text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                WellthPlan • Personal CFO 2.0
              </span>
              <span className="text-[11px] font-bold text-[#22c55e] bg-[#163824] px-2.5 py-0.5 rounded-full border border-[#22c55e]/30">
                {currentHistory?.change || '+4 pts'} (Last {timeframe})
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Financial Health Score
            </h2>
            <p className="text-xs sm:text-sm text-[#a89d95] max-w-xl leading-relaxed">
              Continuous intelligence analyzing your savings rate, spending habits, emergency reserve buffer, and monthly budget adherence.
            </p>
          </div>

          {/* Right: Big Circular Score Meter */}
          <div className="flex items-center gap-4 bg-[#181615] p-5 rounded-2xl border border-[#2b2725] shrink-0 self-start lg:self-auto shadow-xl">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#262220"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="#ff6b00"
                  strokeWidth="8"
                  strokeDasharray={238.76}
                  strokeDashoffset={238.76 - (238.76 * score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white font-mono">{score}</span>
                <span className="text-[9px] text-[#8c827a] font-bold uppercase">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#8c827a] block">Status Tier</span>
              <h4 className="text-base font-extrabold text-white">{tier}</h4>
              <p className="text-[11px] text-[#22c55e] font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Audited by FinAI Engine
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Pillars Breakdown Grid (4 Core Pillars out of 25 pts each) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Health Score Breakdown (4 Pillars)
          </h3>
          <span className="text-xs text-[#8c827a]">
            Max 25 pts each • Total 100 pts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, idx) => {
            const pct = Math.round((p.score / p.maxScore) * 100);

            return (
              <div
                key={idx}
                className="wellthplan-pillar-card p-5 rounded-3xl bg-[#181615] hover:bg-[#1d1a19] border border-[#262220] hover:border-[#ff6b00]/30 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#24201e] text-[#ff8c33] border border-[#38332f]">
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {p.score}
                    </span>
                    <span className="text-xs text-[#8c827a] font-semibold">
                      /{p.maxScore} pts
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#262220] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 80 ? 'bg-[#22c55e]' : pct >= 60 ? 'bg-[#ff6b00]' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="text-[11px] font-bold text-white font-mono">
                    {p.metric}
                  </div>
                </div>

                <p className="text-[10px] text-[#736a63] mt-3 pt-2.5 border-t border-[#24201e]">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Two-Column Layout: Historical Timeline (Left) & Why Score Changed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Score Change Timeline (30, 90, 180 days) - 7 cols */}
        <div className="wellthplan-detail-card lg:col-span-7 p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-white text-base">
                Score Timeline & Trends
              </h3>
              <p className="text-xs text-[#8c827a]">
                Historical trajectory across your financial milestones
              </p>
            </div>

            {/* 30d / 90d / 180d Switcher */}
            <div className="flex items-center p-1 bg-[#12100f] rounded-2xl border border-[#262220] self-start sm:self-auto">
              {['30d', '90d', '180d'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    timeframe === t
                      ? 'bg-[#262220] text-white shadow-md'
                      : 'text-[#8c827a] hover:text-white'
                  }`}
                >
                  {t === '30d' ? '30 Days' : t === '90d' ? '90 Days' : '180 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Spline Chart */}
          <div className="h-44 sm:h-48 w-full pt-2">
            <Line data={lineData} options={lineOptions} />
          </div>

          <div className="pt-3 border-t border-[#24201e] flex items-center justify-between text-xs text-[#8c827a]">
            <span>Net Momentum: <strong className="text-[#22c55e]">{currentHistory?.change}</strong></span>
            <span>Refreshed daily based on live ledger entries</span>
          </div>
        </div>

        {/* Right: Why Your Score Changed (Explainable AI) - 5 cols */}
        <div className="wellthplan-detail-card lg:col-span-5 p-6 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">
              Why Your Score Changed
            </h3>
            <p className="text-xs text-[#8c827a]">
              Transparent factors influencing your credit & health rating
            </p>
          </div>

          <div className="space-y-3">
            {scoreFactors.map((factor, idx) => (
              <div
                key={idx}
                className="wellthplan-factor-card p-3.5 rounded-2xl bg-[#1c1918] border border-[#282422] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {factor.title}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono ${
                    factor.type === 'positive'
                      ? 'bg-[#163824] text-[#22c55e] border border-[#22c55e]/30'
                      : 'bg-[#38161e] text-rose-400 border border-rose-500/30'
                  }`}>
                    {factor.impact}
                  </span>
                </div>
                <p className="text-[11px] text-[#8c827a] leading-relaxed">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Personalized AI Improvement Tips (Personal CFO Action Items) */}
      <div className="wellthplan-detail-card p-6 sm:p-7 rounded-3xl bg-[#181615] border border-[#262220] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base">
              Personalized Improvement Tips (AI Personal CFO)
            </h3>
            <p className="text-xs text-[#8c827a]">
              High-impact recommended actions to elevate your score to 90+
            </p>
          </div>

          <button
            onClick={onOpenAiAgent}
            className="flex items-center gap-1.5 text-xs font-bold text-[#ff6b00] hover:underline cursor-pointer"
          >
            <span>Ask FinAI Copilot</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {improvementTips.map((tip) => (
            <div
              key={tip.id}
              className="wellthplan-tip-card p-4 rounded-2xl bg-[#1f1d1b] border border-[#2e2a27] hover:border-[#ff6b00]/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#8c827a] uppercase">
                    {tip.pillar}
                  </span>
                  <span className="text-xs font-extrabold text-[#22c55e] bg-[#163824] px-2 py-0.5 rounded-md font-mono border border-[#22c55e]/30">
                    {tip.potentialGain}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white mb-1.5 group-hover:text-[#ff6b00] transition-colors">
                  {tip.title}
                </h4>
                <p className="text-xs text-[#8c827a] leading-relaxed">
                  {tip.desc}
                </p>
              </div>

              <button
                onClick={onOpenAiAgent}
                className="mt-3.5 w-full py-2 px-3 rounded-xl bg-[#262220] hover:bg-[#ff6b00] text-[#a89d95] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Execute Recommendation</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
