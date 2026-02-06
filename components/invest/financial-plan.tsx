'use client';

import { Umbrella, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { type FinancialGoal } from '@/services/widget.service';

interface FinancialPlanProps {
  goals?: FinancialGoal[];
  onViewDetails?: () => void;
}

// Helper function to get icon based on goal type
const getGoalIcon = (goalType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    retirement: <Umbrella className="h-5 w-5 text-white" />,
    emergency: <Shield className="h-5 w-5 text-white" />,
    wealth_growth: <TrendingUp className="h-5 w-5 text-white" />,
    education: <Umbrella className="h-5 w-5 text-white" />,
    home_purchase: <TrendingUp className="h-5 w-5 text-white" />,
    custom: <TrendingUp className="h-5 w-5 text-white" />,
  };
  return iconMap[goalType] || <Umbrella className="h-5 w-5 text-white" />;
};

export function FinancialPlan({ goals = [] }: FinancialPlanProps) {
  const formatCurrency = (value: number, compact: boolean = false) => {
    if (compact) {
      if (value >= 1000000) {
        const millions = value / 1000000;
        // Format like $2.75M or $675K
        if (millions >= 1) {
          return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2)}M`;
        } else {
          const thousands = value / 1000;
          return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(0)}K`;
        }
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatRemaining = (current: number, target: number) => {
    const remaining = target - current;
    if (remaining <= 0) return null;
    return formatCurrency(remaining, true);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          Financial Plan
        </div>

        {goals.length > 0 && (
          <Link
            href="/invest?tab=plan"
            className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          >
            <span
              className="text-xs font-normal text-blue-500 dark:text-blue-400"
              style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 400, }}
            >
              View all goals
            </span>
            <ChevronRight className="w-3 h-3 text-blue-500 dark:text-blue-400" />
          </Link>
        )}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal) => {
          const currentAmount = parseFloat(goal.current_amount || goal.current_value || '0');
          const targetAmount = parseFloat(goal.target_amount || '0');
          const progressPercentage = goal.progress_percent || (targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0);
          const progressBarWidth = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
          const remaining = formatRemaining(currentAmount, targetAmount);
          const targetText = goal.target_date
            ? `Target: ${formatCurrency(targetAmount, true)} by ${new Date(goal.target_date).getFullYear()}`
            : `Target: ${formatCurrency(targetAmount, true)}`;

          return (
            <div
              key={goal.goal_id}
              className="p-4 rounded-xl flex flex-col gap-3.5 bg-white dark:bg-card border border-gray-100 dark:border-border"
              style={{
                borderRadius: 12,
              }}
            >
              {/* Icon and Percentage Badge */}
              <div className="flex justify-between items-start">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#1E3D2F] dark:bg-emerald-900/30"
                  style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                  }}
                >
                  {getGoalIcon(goal.goal_type)}
                </div>
                <div
                  className="px-1 rounded-2xl flex items-center justify-center bg-green-500/15 dark:bg-green-500/20"
                  style={{
                    borderRadius: 16,
                  }}
                >
                  <span
                    className="text-xs font-medium text-center leading-[18px]"
                    style={{
                      color: '#22C55E',
                      fontSize: 12,
                      fontFamily: 'Inter',
                      fontWeight: 500,
                    }}
                  >
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Title and Target */}
              <div className="flex flex-col gap-0.5">
                <div
                  className="text-sm font-semibold text-gray-900 dark:text-foreground"
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    height: 21,
                  }}
                >
                  {goal.name}
                </div>
                <div
                  className="text-xs font-normal text-gray-500 dark:text-muted-foreground"
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    height: 16.5,
                  }}
                >
                  {targetText}
                </div>
              </div>

              {/* Progress Bar and Amounts */}
              <div className="flex flex-col gap-2.5">
                <div className="relative h-1.5 overflow-hidden rounded bg-gray-100 dark:bg-emerald-900/20">
                  <div
                    className="absolute left-0 top-0 h-full rounded bg-emerald-500"
                    style={{
                      width: `${progressBarWidth}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div
                    className="text-xs font-medium text-gray-900 dark:text-foreground"
                    style={{
                      fontSize: 12,
                      fontFamily: 'Inter',
                      fontWeight: 500,
                    }}
                  >
                    {formatCurrency(currentAmount)}
                  </div>
                  {remaining && (
                    <div
                      className="text-xs font-normal text-gray-500 dark:text-muted-foreground"
                      style={{
                        fontSize: 12,
                        fontFamily: 'Inter',
                        fontWeight: 400,
                      }}
                    >
                      {remaining} to go
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <NoDataAvailable />
      )}
    </div>
  );
}

const NoDataAvailable = () => {
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      <div className="w-full text-base font-normal text-gray-500 dark:text-muted-foreground">
        No financial goals found
      </div>
    </div>
  );
};
