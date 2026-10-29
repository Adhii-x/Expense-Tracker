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
import { TrendingUp } from 'lucide-react';
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

export default function BalanceChartCard({ totalBalance, savedThisMonth = totalBalance, currency }) {
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
        borderColor: '#101522',
        borderWidth: 2.5,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(34, 119, 255, 0.22)');
          gradient.addColorStop(0.65, 'rgba(34, 119, 255, 0.07)');
          gradient.addColorStop(1, 'rgba(34, 119, 255, 0.0)');
          return gradient;
        },
        tension: 0.45,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2277ff',
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
        bodyColor: '#0056ff',
        bodyFont: { weight: 'bold', size: 13 },
        borderColor: '#c5d5ff',
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
          color: 'rgba(16, 21, 34, 0.08)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(16, 21, 34, 0.62)',
          font: { size: 11, weight: '500' }
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(16, 21, 34, 0.08)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(16, 21, 34, 0.62)',
          font: { size: 11 },
          callback: (val) => `₹${val / 1000}k`
        }
      }
    }
  };

  return (
    <div className="balance-card rounded-3xl bg-gradient-to-br from-white to-[#e3e7fc] p-6 sm:p-7 border border-[#dce3f6] shadow-xl relative overflow-hidden transition-all">
      
      {/* Top Header: Total Balance + Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            Saved this month
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {formatCurrency(savedThisMonth, currency)}
            </h2>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 2.92%</span>
            </div>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="balance-timeframe-switcher flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-blue-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart Canvas */}
      <div className="h-56 sm:h-64 w-full my-2">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Bottom Timeline & Legend Indicators */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Timeline Month Tracker */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Balance trend:</span>
          <span className="font-bold text-slate-800 tracking-wide">Live overview</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#101522]" />
            <span className="text-slate-500 text-[11px]">Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2277ff]" />
            <span className="text-slate-500 text-[11px]">Monthly trend</span>
          </div>
        </div>

      </div>

    </div>
  );
}
