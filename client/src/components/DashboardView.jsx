import React from 'react';
import BalanceChartCard from './BalanceChartCard';
import CardsWidget from './CardsWidget';
import AiAgentWidget from './AiAgentWidget';
import InvestmentsBarChart from './InvestmentsBarChart';
import BudgetTracker from './BudgetTracker';

export default function DashboardView({
  totalBalance,
  cards,
  transactions,
  currency,
  budget,
  currentMonthExpenses,
  activeMonthLabel,
  onSaveBudget,
  onTransferClick,
  onRequestClick,
  onViewAllClick,
  onOpenAiAgent,
  healthScore,
  onNavigateWellthPlan
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ROW 1: Total Balance Chart (Left 8 cols) & My Cards (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Total Balance Chart Card */}
        <div className="lg:col-span-8">
          <BalanceChartCard
            totalBalance={totalBalance}
            currency={currency}
          />
        </div>

        {/* My Cards & Recent Transactions Panel */}
        <div className="lg:col-span-4">
          <CardsWidget
            cards={cards}
            transactions={transactions}
            currency={currency}
            onTransferClick={onTransferClick}
            onRequestClick={onRequestClick}
            onViewAllClick={onViewAllClick}
          />
        </div>

      </div>

      {/* ROW 2: FinAI Copilot Card (Left 4 cols), Investments Bar Chart (Middle 4 cols), Budget Tracker (Right 4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* AI Financial Agent Card */}
        <div className="lg:col-span-4">
          <AiAgentWidget
            onOpenAiAgent={onOpenAiAgent}
            healthScore={healthScore || 92}
            onNavigateWellthPlan={onNavigateWellthPlan}
          />
        </div>

        {/* Investments & Monthly Peak Bar Chart */}
        <div className="lg:col-span-4">
          <InvestmentsBarChart currency={currency} />
        </div>

        {/* Monthly Budget Threshold Warning Card */}
        <div className="lg:col-span-4">
          <BudgetTracker
            currentMonthExpenses={currentMonthExpenses}
            budgetLimit={budget.monthlyLimit}
            onSaveBudget={onSaveBudget}
            currency={currency}
            activeMonth={activeMonthLabel}
          />
        </div>

      </div>

    </div>
  );
}
