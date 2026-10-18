import React from 'react';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import SubscriptionsWidget from './SubscriptionsWidget';

export default function BudgetsView({
  currentMonthExpenses,
  budget,
  onSaveBudget,
  currency,
  activeMonthLabel,
  goals,
  onCreateGoal,
  onDepositGoal,
  onDeleteGoal,
  subscriptions,
  onCreateSub,
  onDeleteSub
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff6b00]">
          BUDGET & SAVINGS TARGETS
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Budget management
        </h2>
        <p className="text-xs sm:text-sm text-[#8c827a] mt-1">
          Plan limits, monitor thresholds, build savings goals, and audit recurring bills.
        </p>
      </div>

      {/* 1. Monthly Budget Threshold Tracker */}
      <BudgetTracker
        currentMonthExpenses={currentMonthExpenses}
        budgetLimit={budget.monthlyLimit}
        onSaveBudget={onSaveBudget}
        currency={currency}
        activeMonth={activeMonthLabel}
      />

      {/* 2. Target Savings Goals */}
      <SavingsGoals
        goals={goals}
        currency={currency}
        onCreateGoal={onCreateGoal}
        onDepositGoal={onDepositGoal}
        onDeleteGoal={onDeleteGoal}
      />

      {/* 3. Subscriptions & Recurring Bills */}
      <SubscriptionsWidget
        subscriptions={subscriptions}
        currency={currency}
        onCreateSub={onCreateSub}
        onDeleteSub={onDeleteSub}
      />

    </div>
  );
}
