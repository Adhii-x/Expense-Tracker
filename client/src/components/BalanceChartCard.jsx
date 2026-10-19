import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function BalanceChartCard({ totalBalance, currency }) {
  const [timeframe, setTimeframe] = useState('6 month'); // '1 year' | '6 month' | '3 month' | '1 month'

  const timeframes = ['1 year', '6 month', '3 month', '1 month'];

  // Dynamic datasets based on timeframe
  const dataConfig = {
    '1 year': {
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec', 'Feb'],
      data: [7200, 7850, 8100, 8600, 9200, 9780.90, 10450, totalBalance > 0 ? totalBalance : 10120.50]
    },
    '6 month': {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      data: [8200, 8650, 9100, 9780.90, 10050, totalBalance > 0 ? totalBalance : 10120.50]
    },
    '3 month': {
      labels: ['Dec', 'Jan', 'Feb'],
      data: [9400, 9850, totalBalance > 0 ? totalBalance : 10120.50]
    },
    '1 month': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [9800, 9950, 10050, totalBalance > 0 ? totalBalance : 10120.50]
    }
  };

  const current = dataConfig[timeframe] || dataConfig['6 month'];

  const chartData = {
    labels: current.labels,
    datasets: [
      {
        label: 'Actual Balance',
        data: current.data,
        fill: true,
        borderColor: '#ff6b00',
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(255, 107, 0, 0.35)');
          gradient.addColorStop(0.65, 'rgba(255, 107, 0, 0.08)');
          gradient.addColorStop(1, 'rgba(255, 107, 0, 0.0)');
          return gradient;
        },
        tension: 0.45,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#ff6b00',
        pointBorderWidth: 2,
        pointRadius: (ctx) => (ctx.dataIndex === current.data.length - 3 ? 6 : 0),
        pointHoverRadius: 7,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#ff6b00',
        bodyFont: { weight: 'bold', size: 13 },
        borderColor: '#ff6b00',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          title: (items) => `${items[0].label}, 2026 ↗`,
          label: (item) => formatCurrency(item.raw)
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#736a63',
          font: { size: 11, weight: '500' }
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#736a63',
          font: { size: 11 },
          callback: (val) => `₹${val / 1000}k`
        }
      }
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#181615] to-[#121110] p-6 sm:p-7 border border-[#262220] shadow-xl relative overflow-hidden transition-all">
      
      {/* Top Header: Total Balance + Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#8c827a]">
            Total Balance
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalBalance > 0 ? totalBalance : 10120.50, currency)}
            </h2>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#163824] border border-[#22c55e]/30 text-[#22c55e] text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 2.92%</span>
            </div>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center p-1 bg-[#12100f] rounded-2xl border border-[#2b2725] self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-[#262220] text-white shadow-md'
                  : 'text-[#8c827a] hover:text-[#e6ded8]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Highlight Callout Box (matching reference image) */}
      <div className="hidden sm:flex absolute right-44 top-28 z-10 px-3.5 py-2 rounded-xl bg-white text-slate-900 shadow-2xl flex-col items-start border border-slate-200 animate-pulse">
        <span className="text-[10px] font-semibold text-slate-500">09 Dec, 2026 ↗</span>
        <span className="text-xs font-extrabold text-slate-900">₹9,780.90 INR</span>
      </div>

      {/* Area Chart Canvas */}
      <div className="h-56 sm:h-64 w-full my-2">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Bottom Timeline & Legend Indicators */}
      <div className="pt-4 border-t border-[#24201e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Timeline Month Tracker */}
        <div className="flex items-center gap-3">
          <span className="text-[#8c827a]">Average annual rate:</span>
          <span className="font-bold text-white tracking-wide">₹84,000</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-white" />
            <span className="text-[#a89d95] text-[11px]">Actual balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]" />
            <span className="text-[#a89d95] text-[11px]">Total monthly balance</span>
          </div>
        </div>

      </div>

    </div>
  );
}
