'use client';

import { Umbrella, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { type FinancialGoal as WidgetFinancialGoal } from '@/services/widget.service';

export interface FinancialGoal {
  id: string;
  title: string;
  target: string;
  currentAmount: number;
  targetAmount: number;
  progress: number; // 0-100
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  barColor: string;
  status?: 'complete' | 'in-progress';
}

interface FinancialPlanProps {
  goals?: WidgetFinancialGoal[];
  onViewDetails?: () => void;
}

// Helper function to convert widget service goal to component goal
const convertGoalToComponentFormat = (goal: WidgetFinancialGoal): FinancialGoal => {
  const iconMap: Record<string, React.ReactNode> = {
    umbrella: <Umbrella className="h-6 w-6" style={{ color: goal.iconColor }} />,
    shield: <Shield className="h-6 w-6" style={{ color: goal.iconColor }} />,
    'trending-up': <TrendingUp className="h-6 w-6" style={{ color: goal.iconColor }} />,
  };

  return {
    ...goal,
    icon: iconMap[goal.icon] || <Umbrella className="h-6 w-6" style={{ color: goal.iconColor }} />,
  };
};

export function FinancialPlan({ goals = [], onViewDetails }: FinancialPlanProps) {
  const displayGoals = goals.map(convertGoalToComponentFormat);
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
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div
          className="text-base font-semibold text-gray-900 dark:text-foreground"
          style={{ fontSize: 16, fontFamily: 'Inter', fontWeight: 600, }}
        >
          Financial Plan
        </div>
        {onViewDetails ? (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          >
            <span
              className="text-xs font-normal text-blue-500 dark:text-blue-400"
              style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 400, }}
            >
              View all goals
            </span>
            <ChevronRight className="w-3 h-3 text-blue-500 dark:text-blue-400" />
          </button>
        ) : (
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
        {displayGoals.map((goal) => {
          const remaining = formatRemaining(goal.currentAmount, goal.targetAmount);
          const progressPercentage = Math.min(goal.progress, 100);
          const progressBarWidth = (goal.currentAmount / goal.targetAmount) * 100;

          return (
            <div
              key={goal.id}
              className="p-4 rounded-xl flex flex-col gap-3.5 bg-card border border-gray-200 dark:border-border"
              style={{
                borderRadius: 12,
              }}
            >
              {/* Icon and Percentage Badge */}
              <div className="flex justify-between items-start">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{
                    background: goal.iconBgColor || 'rgba(191, 90, 242, 0.12)',
                    paddingLeft: 13,
                    paddingRight: 13,
                  }}
                >
                  <div style={{ color: goal.iconColor || '#9333EA' }}>{goal.icon}</div>
                </div>
                <div
                  className="px-1 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
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
                  {goal.title}
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
                  {goal.target}
                </div>
              </div>

              {/* Progress Bar and Amounts */}
              <div className="flex flex-col gap-2.5">
                <div className="relative h-1.5 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    className="absolute left-0 top-0 h-full rounded"
                    style={{
                      width: `${progressBarWidth}%`,
                      background: '#22C55E',
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
                    {formatCurrency(goal.currentAmount)}
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
    </div>
  );
}
