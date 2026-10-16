import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';
import { formatCurrency, formatMonthYear } from '../utils';

// Register Chart.js modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function ExpenseChart({ transactions, currency, darkMode }) {
  const [chartMode, setChartMode] = useState('doughnut'); // 'doughnut' | 'bar'

  // Filter only expenses for category breakdown
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  // Compute category totals
  const categoryTotals = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });

  const categoryLabels = Object.keys(categoryTotals);
  const categoryData = Object.values(categoryTotals);
  const totalExpenseSum = categoryData.reduce((a, b) => a + b, 0);

  const backgroundColors = categoryLabels.map(
    cat => CATEGORY_COLORS[cat] || '#8B5CF6'
  );

  // Doughnut chart data
  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryData,
        backgroundColor: backgroundColors,
        borderColor: darkMode ? '#0f172a' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#cbd5e1' : '#475569',
          padding: 12,
          boxWidth: 12,
          font: { size: 11, family: 'sans-serif' }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            const pct = totalExpenseSum > 0 ? ((val / totalExpenseSum) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${formatCurrency(val, currency)} (${pct}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  // Compute monthly data for Bar Chart
  const monthlyMap = {};
  transactions.forEach(t => {
    const monthKey = t.date ? t.date.substring(0, 7) : 'Unknown';
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyMap[monthKey].income += Number(t.amount);
    } else {
      monthlyMap[monthKey].expense += Number(t.amount);
    }
  });

  const sortedMonths = Object.keys(monthlyMap).sort();
  const barLabels = sortedMonths.map(m => formatMonthYear(m));
  const incomeMonthlyData = sortedMonths.map(m => monthlyMap[m].income);
  const expenseMonthlyData = sortedMonths.map(m => monthlyMap[m].expense);

  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: 'Income',
        data: incomeMonthlyData,
        backgroundColor: '#10B981',
        borderRadius: 6
      },
      {
        label: 'Expense',
        data: expenseMonthlyData,
        backgroundColor: '#F43F5E',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#cbd5e1' : '#475569',
          boxWidth: 12,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.dataset.label}: ${formatCurrency(context.raw, currency)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#94a3b8' : '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: darkMode ? '#334155' : '#f1f5f9' },
        ticks: {
          color: darkMode ? '#94a3b8' : '#64748b',
          font: { size: 10 },
          callback: function (val) {
            return formatCurrency(val, currency);
          }
        }
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col h-full">
      
      {/* Header & Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            {chartMode === 'doughnut' ? (
              <PieChart className="w-5 h-5" />
            ) : (
              <BarChart3 className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {chartMode === 'doughnut' ? 'Expense Category Breakdown' : 'Monthly Income vs Expense'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chartMode === 'doughnut' 
                ? `${categoryLabels.length} categories • Total: ${formatCurrency(totalExpenseSum, currency)}` 
                : `${sortedMonths.length} active billing periods`}
            </p>
          </div>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('doughnut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'doughnut'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Category Pie</span>
          </button>

          <button
            type="button"
            onClick={() => setChartMode('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              chartMode === 'bar'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monthly Bar</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 min-h-[280px] sm:min-h-[320px] flex items-center justify-center">
        {chartMode === 'doughnut' ? (
          categoryLabels.length > 0 ? (
            <div className="w-full h-[280px] sm:h-[320px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No expense data for this selection
              </p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Add your first expense or clear filters to see your visual breakdown.
              </p>
            </div>
          )
        ) : (
          sortedMonths.length > 0 ? (
            <div className="w-full h-[280px] sm:h-[320px]">
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No monthly data available
              </p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
