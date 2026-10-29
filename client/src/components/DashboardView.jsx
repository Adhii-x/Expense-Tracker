import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowUpRight as ArrowTrend, BriefcaseBusiness, CalendarDays, Clock3, ShoppingCart, WalletCards } from 'lucide-react';
import BalanceChartCard from './BalanceChartCard';
import CardsWidget from './CardsWidget';
import AiAgentWidget from './AiAgentWidget';
import InvestmentsBarChart from './InvestmentsBarChart';
import BudgetTracker from './BudgetTracker';
import DashboardCalendar from './DashboardCalendar';
import { formatCurrency, formatDate, formatMonthYear } from '../utils';

export default function DashboardView({
  totalBalance,
  totalIncome,
  totalExpenses,
  cards,
  subscriptions,
  transactions,
  currency,
  budget,
  currentMonthExpenses,
  activeMonthLabel,
  onSaveBudget,
  onTransferClick,
  onRequestClick,
  onViewAllClick,
  onSelectCalendarDate,
  onOpenAiAgent,
  healthScore,
  onNavigateWellthPlan
}) {
  const recentTransactions = transactions.slice(0, 5);
  const upcomingPayments = [...(subscriptions || [])]
    .filter((subscription) => subscription.nextBilling)
    .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())
    .slice(0, 2);
  const activeMonthKey = /^\d{4}-\d{2}/.test(activeMonthLabel || '')
    ? activeMonthLabel.slice(0, 7)
    : (() => {
      const monthDate = new Date(activeMonthLabel);
      return Number.isNaN(monthDate.getTime())
        ? ''
        : `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    })();
  const categorySpending = transactions.reduce((totals, transaction) => {
    if (transaction.type !== 'expense' || !transaction.category) return totals;
    if (activeMonthKey && (!transaction.date || !transaction.date.startsWith(activeMonthKey))) return totals;
    totals[transaction.category] = (totals[transaction.category] || 0) + (Number(transaction.amount) || 0);
    return totals;
  }, {});
  const categoryTotals = Object.entries(categorySpending)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  const categoryTotal = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="overview-grid">
        <section className="overview-main">
          <div className="overview-heading">
            <div>
              <span className="overview-eyebrow">YOUR ACCOUNT</span>
              <h2>Dashboard</h2>
            </div>
            <span className="overview-period">
              <Clock3 size={14} />
              {formatMonthYear(activeMonthLabel)}
            </span>
          </div>

          <div className="dashboard-payment-row">
            <CardsWidget
              cards={cards}
              currency={currency}
              onTransferClick={onTransferClick}
              onRequestClick={onRequestClick}
            />
            <section className="upcoming-payments">
              <div className="upcoming-payments-heading">
                <h3>Upcoming payments</h3>
                <button type="button" onClick={onViewAllClick}>View all</button>
              </div>
              {upcomingPayments.length > 0 ? (
                <div className="upcoming-payment-list">
                  {upcomingPayments.map((payment) => (
                    <article className="upcoming-payment-card" key={payment.id}>
                      <span className="upcoming-payment-icon">
                        <BriefcaseBusiness size={17} />
                      </span>
                      <strong>{payment.name}</strong>
                      <span>{payment.billingCycle || 'Recurring'} · {formatDate(payment.nextBilling)}</span>
                      <b>{formatCurrency(payment.amount, currency)}</b>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="upcoming-payments-empty">
                  <CalendarDays size={18} />
                  <span>No scheduled payments yet</span>
                </div>
              )}
            </section>
          </div>

          <section className="activity-panel glass-panel">
            <div className="activity-panel-heading">
              <div>
                <span className="activity-overline">YOUR LEDGER</span>
                <h3>Recent activity</h3>
              </div>
              <button type="button" onClick={onViewAllClick}>View all</button>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="activity-list">
                {recentTransactions.map((transaction, index) => {
                  const isIncome = transaction.type === 'income';
                  const title = transaction.title || transaction.category || 'Transaction';

                  return (
                    <div className="activity-item" key={transaction.id || `${title}-${index}`}>
                      <span className={`activity-icon ${isIncome ? 'is-income' : 'is-expense'}`}>
                        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowTrend size={16} />}
                      </span>
                      <div className="activity-description">
                        <strong title={title}>{title}</strong>
                        <span>{transaction.category || formatDate(transaction.date)}</span>
                      </div>
                      <div className={`activity-amount ${isIncome ? 'is-income' : 'is-expense'}`}>
                        <strong>{isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}</strong>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="activity-empty">
                <WalletCards size={21} />
                <p>Your transactions will appear here.</p>
              </div>
            )}

            {recentTransactions.length > 0 && (
              <button type="button" className="activity-footer-link" onClick={onViewAllClick}>
                Open transaction history <ArrowUpRight size={14} />
              </button>
            )}
          </section>

          <section className="dashboard-categories">
            <div className="dashboard-categories-heading">
              <div>
                <span className="dashboard-section-eyebrow">WHERE IT WENT</span>
                <h3>Categories</h3>
              </div>
              <button type="button" onClick={onViewAllClick}>
                See all <ArrowUpRight size={14} />
              </button>
            </div>
            {categoryTotals.length ? (
              <div className="dashboard-category-grid">
                {categoryTotals.slice(0, 3).map(({ category, amount }) => (
                  <article className="dashboard-category-card" key={category}>
                    <span className="dashboard-category-icon">
                      <ShoppingCart size={17} />
                    </span>
                    <span className="dashboard-category-name">{category}</span>
                    <strong>{formatCurrency(amount, currency)}</strong>
                    <span className="dashboard-category-share">
                      {categoryTotal > 0 ? Math.round((amount / categoryTotal) * 100) : 0}%
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-categories-empty">
                No expenses recorded for this month yet.
              </div>
            )}
          </section>

          <div className="overview-secondary-grid">
            <InvestmentsBarChart currency={currency} />
            <AiAgentWidget
              onOpenAiAgent={onOpenAiAgent}
              healthScore={healthScore || 92}
              onNavigateWellthPlan={onNavigateWellthPlan}
            />
          </div>

        </section>

        <aside className="overview-rail">
          <BalanceChartCard
            totalBalance={totalBalance}
            savedThisMonth={totalIncome - totalExpenses}
            currency={currency}
          />

          <button
            type="button"
            className="plan-progress-card"
            onClick={onNavigateWellthPlan}
            aria-label={`View WellthPlan. Financial health score ${healthScore || 92} percent`}
          >
            <span className="plan-progress-backdrop" />
            <span className="plan-progress-content">
              <span className="plan-progress-label">WellthPlan</span>
              <strong>Financial health</strong>
              <span>View your savings plan</span>
            </span>
            <span className="plan-progress-ring" style={{ '--progress': `${healthScore || 92}%` }}>
              <span>{healthScore || 92}%</span>
            </span>
          </button>

          <DashboardCalendar
            transactions={transactions}
            activeMonthLabel={activeMonthLabel}
            onSelectDate={onSelectCalendarDate}
          />
        </aside>

        <BudgetTracker
          currentMonthExpenses={currentMonthExpenses}
          budgetLimit={budget.monthlyLimit}
          onSaveBudget={onSaveBudget}
          currency={currency}
          activeMonth={activeMonthLabel}
        />
      </div>
    </div>
  );
}
