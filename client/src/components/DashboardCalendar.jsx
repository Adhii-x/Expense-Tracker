import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function toDateKey(date) {
  return `${monthKey(date)}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseMonthKey(value) {
  const match = /^(\d{4})-(\d{2})/.exec(value || '');
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

export default function DashboardCalendar({ transactions, activeMonthLabel, onSelectDate }) {
  const [monthView, setMonthView] = useState(() => ({
    sourceMonth: activeMonthLabel,
    date: parseMonthKey(activeMonthLabel)
  }));
  const [todayKey] = useState(() => toDateKey(new Date()));
  const visibleMonth = monthView.sourceMonth === activeMonthLabel
    ? monthView.date
    : parseMonthKey(activeMonthLabel);
  const selectedMonthKey = monthKey(visibleMonth);
  const monthTransactions = useMemo(() => transactions.filter(transaction => (
    transaction.date?.slice(0, 7) === selectedMonthKey
  )), [transactions, selectedMonthKey]);

  const dayCounts = useMemo(() => {
    const counts = new Map();
    monthTransactions.forEach(transaction => {
      const date = transaction.date?.slice(0, 10);
      if (!date) return;
      const current = counts.get(date) || { transactions: 0, expenses: 0, income: 0 };
      current.transactions += 1;
      if (transaction.type === 'expense') current.expenses += Number(transaction.amount) || 0;
      if (transaction.type === 'income') current.income += Number(transaction.amount) || 0;
      counts.set(date, current);
    });
    return counts;
  }, [monthTransactions]);

  const firstWeekday = (new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ];

  const changeMonth = offset => {
    setMonthView({
      sourceMonth: activeMonthLabel,
      date: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    });
  };

  return (
    <section className="dashboard-calendar" aria-label="Transaction calendar">
      <div className="dashboard-calendar-heading">
        <div>
          <span className="dashboard-section-eyebrow">YOUR ACTIVITY</span>
          <h3>Calendar</h3>
        </div>
        <CalendarDays />
      </div>

      <div className="dashboard-calendar-month">
        <strong>{visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
        <div>
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <ChevronLeft />
          </button>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="dashboard-calendar-grid" role="grid" aria-label={selectedMonthKey}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <span className="dashboard-calendar-weekday" key={`${day}-${index}`} role="columnheader">{day}</span>
        ))}
        {calendarCells.map((day, index) => {
          if (!day) {
            return <span className="dashboard-calendar-empty" key={`empty-${index}`} role="gridcell" />;
          }
          const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
          const dateKey = toDateKey(date);
          const count = dayCounts.get(dateKey);
          return (
            <button
              type="button"
              className={`dashboard-calendar-day ${dateKey === todayKey ? 'is-today' : ''} ${count ? 'has-activity' : ''}`}
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              aria-label={`${date.toLocaleDateString(undefined, { dateStyle: 'full' })}${count ? `, ${count.transactions} transactions, ${count.expenses.toFixed(2)} in expenses` : ', no transactions'}`}
              title={count ? `${count.transactions} transaction${count.transactions === 1 ? '' : 's'} · ${count.expenses.toFixed(2)} expenses` : 'No transactions'}
              role="gridcell"
            >
              <span>{day}</span>
              {count && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="dashboard-calendar-legend">
        <span><i /> Days with transactions</span>
        <small>Select a date to view its transactions</small>
      </div>
    </section>
  );
}
