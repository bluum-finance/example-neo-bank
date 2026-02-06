'use client';

import {
  Shield,
  Clock,
  Droplets,
  DollarSign,
  Target,
  RotateCcw,
  Ban,
  CheckCircle2,
  FileText,
  Circle,
  BarChart3,
  List,
  Check,
  Lock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { type InvestmentPolicy } from '@/services/widget.service';

interface InvestmentPolicyWidgetProps {
  policy?: InvestmentPolicy;
}

// Custom label for donut chart - showing percentage in center
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function InvestmentPolicyWidget({ policy }: InvestmentPolicyWidgetProps) {
  // Extract values from API response
  const riskTolerance = policy?.risk_profile?.risk_tolerance || 'moderate';
  const riskScore = policy?.risk_profile?.risk_score || 50;
  const riskLevels: Record<string, string> = {
    conservative: 'Conservative',
    moderate: 'Moderate',
    'moderate-high': 'Moderate-High',
    aggressive: 'Aggressive',
  };
  const riskLevel = riskLevels[riskTolerance] || 'Moderate';
  const riskPosition = riskScore; // Use risk_score as position (0-100)

  const timeHorizonYears = policy?.time_horizon?.years || 15;
  const timeHorizonCategory = policy?.time_horizon?.category || 'long_term';
  const timeHorizonRange =
    timeHorizonYears < 5
      ? '0-5 Years'
      : timeHorizonYears < 10
        ? '5-10 Years'
        : timeHorizonYears < 15
          ? '10-15 Years'
          : '15-20 Years';
  const timeHorizonDescription = timeHorizonCategory.replace('_', '-') + ' investment horizon';

  const liquidityPercent = parseFloat(policy?.constraints?.liquidity_requirements?.minimum_cash_percent || '5');
  const liquidityDescription = `Maintain ${liquidityPercent}% in cash/equivalents for operational needs.`;

  const taxConsiderations = policy?.constraints?.tax_considerations?.tax_loss_harvesting
    ? 'Prioritize tax-advantaged accounts; harvest losses annually.'
    : policy?.constraints?.tax_considerations?.tax_bracket
      ? `Tax bracket: ${policy?.constraints?.tax_considerations?.tax_bracket}%`
      : 'Prioritize tax-advantaged accounts; harvest losses annually.';

  // Build objectives array
  const objectives: Array<{ text: string; tag: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' }> = [];
  if (policy?.investment_objectives?.primary) {
    objectives.push({
      text: policy?.investment_objectives?.primary?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      tag: 'PRIMARY',
    });
  }
  if (policy?.investment_objectives?.secondary && Array.isArray(policy?.investment_objectives?.secondary)) {
    policy?.investment_objectives?.secondary?.forEach((obj: string) => {
      objectives.push({
        text: obj.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        tag: 'SECONDARY',
      });
    });
  }
  if (policy?.investment_objectives?.tertiary && Array.isArray(policy?.investment_objectives?.tertiary)) {
    policy?.investment_objectives?.tertiary?.forEach((obj: string) => {
      objectives.push({
        text: obj.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        tag: 'TERTIARY',
      });
    });
  }

  // Build target allocation array
  const allocationData: Array<{ name: string; value: number; color: string }> = [];
  if (policy?.target_allocation) {
    if (policy?.target_allocation?.equities) {
      allocationData.push({
        name: 'Stocks',
        value: parseFloat(policy?.target_allocation?.equities?.target_percent || '0'),
        color: '#22C55E',
      });
    }
    if (policy.target_allocation.fixed_income) {
      allocationData.push({
        name: 'Bonds',
        value: parseFloat(policy.target_allocation.fixed_income.target_percent || '0'),
        color: '#3B82F6',
      });
    }
    if (policy.target_allocation.treasury) {
      allocationData.push({
        name: 'Treasury',
        value: parseFloat(policy.target_allocation.treasury.target_percent || '0'),
        color: '#9333EA',
      });
    }
    if (policy.target_allocation.alternatives) {
      allocationData.push({
        name: 'Alternatives',
        value: parseFloat(policy.target_allocation.alternatives.target_percent || '0'),
        color: '#F97316',
      });
    }
  }

  const restrictions = policy?.constraints?.restrictions?.excluded_sectors
    ? `Excluded sectors: ${policy?.constraints?.restrictions?.excluded_sectors?.join(', ')}. ${policy?.constraints?.restrictions?.esg_screening ? 'ESG screening on all holdings.' : ''}`
    : policy?.constraints?.restrictions?.esg_screening
      ? 'ESG screening on all holdings.'
      : 'No restrictions specified.';

  const rebalancing = policy?.constraints?.rebalancing_policy
    ? `${policy.constraints.rebalancing_policy.frequency} review; rebalance when drift exceeds ±${policy.constraints.rebalancing_policy.threshold_percent}%`
    : 'Quarterly review; rebalance when drift exceeds ±5%.';

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 flex flex-col justify-start items-start">
          <div className="text-base font-semibold text-gray-900 dark:text-white">
            Investment Policy Statement
          </div>
          <div className="text-xs font-normal pt-2 text-gray-500 dark:text-muted-foreground">
            Your personalized investment guidelines
          </div>
        </div>

        <div className="px-2 py-1 bg-[rgba(129,140,248,0.12)] rounded-2xl flex items-center justify-center">
          <span className="text-xs font-medium leading-[18px] text-[#818CF8]">
            On Track
          </span>
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* 1. Risk Tolerance */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground dark:text-white/80">
              Risk Tolerance
            </div>
          </div>

          {policy?.risk_profile ? (
            <>
              <div className="flex flex-col gap-1">
                {/* Slider */}
                <div className="relative h-2 rounded-[5px] overflow-visible">
                  <div
                    className="absolute inset-0 rounded-[5px]"
                    style={{
                      background: 'linear-gradient(60deg, #10A144 0%, #E8FFF0 100%)',
                    }}
                  />
                  <div
                    className="absolute top-1/2 w-[26.72px] h-[18px] bg-white rounded-[9px] border-[3px] border-[#57B75C] shadow-lg -translate-y-1/2 z-10"
                    style={{
                      left: `clamp(0px, calc(${riskPosition}% - 13.36px), calc(100% - 26.72px))`,
                    }}
                  />
                </div>
                {/* Labels */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] leading-[13.5px] font-normal text-gray-500 dark:text-muted-foreground">
                    Conservative
                  </span>
                  <span className="text-[10px] leading-[13.5px] font-normal text-gray-500 dark:text-muted-foreground">
                    Moderate
                  </span>
                  <span className="text-[10px] leading-[13.5px] font-normal text-gray-500 dark:text-muted-foreground">
                    Aggressive
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0">
                <div className="w-full text-center text-base font-semibold leading-6 text-[#57B75C]">
                  {riskLevel}
                </div>
                <div className="w-full text-center text-[10px] leading-[15px] font-normal text-gray-500 dark:text-muted-foreground">
                  {policy.risk_profile?.volatility_tolerance
                    ? `${policy.risk_profile.volatility_tolerance} volatility tolerance`
                    : 'Growth-oriented portfolio'}
                </div>
              </div>
            </>
          ) :
            (
              <NoDataAvailable />
            )
          }
        </div>

        {/* 2. Time Horizon */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground dark:text-white/80">
              Time Horizon
            </div>
          </div>

          {policy?.time_horizon ? (
            <>
              <div className="flex flex-col gap-1">
                {/* Progress bar */}
                <div className="w-full h-2 dark:bg-[#2A4D3C] bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#57B75C] rounded-l-full"
                    style={{ width: '24.89%' }}
                  />
                </div>
                {/* Time labels */}
                <div className="flex justify-between items-center w-full">
                  {['Now', '5yr', '10yr', '15yr', '20yr+'].map((period) => (
                    <span
                      key={period}
                      className="text-[10px] leading-[13.5px] text-gray-500 dark:text-muted-foreground"
                      style={{ fontFamily: 'Inter', fontWeight: 400 }}
                    >
                      {period}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-0">
                <div
                  className="w-full text-center text-base font-semibold leading-6 text-[#57B75C]"
                  style={{ fontFamily: 'Inter', fontWeight: 600 }}
                >
                  {timeHorizonRange}
                </div>
                <div
                  className="w-full text-center text-[10px] leading-[15px] text-gray-500 dark:text-muted-foreground"
                  style={{ fontFamily: 'Inter', fontWeight: 400 }}
                >
                  {timeHorizonDescription}
                </div>
              </div>
            </>
          ) : (
            <NoDataAvailable />
          )
          }
        </div>

        {/* 5. Objectives */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground dark:text-white/80">
              Objectives
            </div>
          </div>

          {objectives.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {objectives.map((obj: { text: string; tag: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' }) => {
                // Map tag colors based on tag type
                const tagStyles: Record<'PRIMARY' | 'SECONDARY' | 'TERTIARY', string> = {
                  PRIMARY: 'bg-[rgba(255,105,97,0.12)] text-[#FF6961]',
                  SECONDARY: 'bg-[rgba(255,159,10,0.12)] text-[#FF9F0A]',
                  TERTIARY: 'bg-[rgba(94,158,255,0.15)] text-[#5E9EFF]',
                };
                const tagStyle = tagStyles[obj.tag] || tagStyles.PRIMARY;

                return (
                  <div
                    key={obj.text}
                    className="py-2 rounded-md flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-5 h-5 bg-[rgba(48,209,88,0.12)] dark:bg-[rgba(48,209,88,0.12)] rounded-lg flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-green-800 dark:text-[#30D158]" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-normal text-muted-foreground dark:text-white/80">
                        {obj.text}
                      </span>
                    </div>
                    <div className={`h-4 px-1.25 py-0.75 rounded-[3px] flex items-center justify-center shrink-0 ${tagStyle}`}>
                      <span className="text-[8px] leading-3 font-semibold uppercase">
                        {obj.tag.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <NoDataAvailable />
          )
          }
        </div>

        {/* 6. Target Allocation */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <RotateCcw className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-semibold text-muted-foreground dark:text-white/80">
              Target Allocation
            </div>
          </div>

          {allocationData.length > 0 ? (
            <>
              {/* Chart, Legend, and Percentages Row */}
              <div className="flex items-center gap-3.5">
                {/* Donut Chart */}
                <div className="relative w-[80px] h-[80px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData as any[]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={25.2}
                        innerRadius={15.12}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#2C2C2E"
                        strokeWidth={1}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 flex flex-col gap-0">
                  {allocationData.map((item, index) => (
                    <div key={item.name} className="relative h-[15px]">
                      <div
                        className="absolute left-0 top-[3.5px] w-2 h-2 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="absolute left-3.5 top-0 text-[10px] leading-[15px] font-normal text-gray-500 dark:text-muted-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Percentages */}
                <div className="flex flex-col gap-1 items-end shrink-0">
                  {allocationData.map((item) => (
                    <div
                      key={item.name}
                      className="text-[10px] leading-[15px] font-semibold text-gray-500 dark:text-muted-foreground"
                    >
                      {item.value}%
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-[27px] relative dark:bg-[rgba(48,209,88,0.12)] bg-green-100 rounded-md flex items-center pl-[28px]">
                <CheckCircle2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 dark:text-[#30D158] text-green-800" />
                <span className="text-[10px] leading-[15px] font-medium dark:text-[#30D158] text-green-800">
                  Within ±3% of target allocation
                </span>
              </div>
            </>) : (
            <NoDataAvailable />
          )
          }
        </div>

      </div>

      {/* Constraints & Guidelines Card */}
      <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
            <Lock className="h-4 w-4 text-white" />
          </div>
          <div className="text-xs font-semibold text-muted-foreground dark:text-white/80">
            Constraints & Guidelines
          </div>
        </div>

        {/* Guidelines List */}
        {policy?.constraints ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Liquidity */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                <FileText className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                  Liquidity
                </div>
                <div className="text-xs leading-[18px] text-gray-600 dark:text-muted-foreground">
                  {liquidityDescription}
                </div>
              </div>
            </div>

            {/* Tax Considerations */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                <FileText className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                  Tax Considerations
                </div>
                <div className="text-xs leading-[18px] text-gray-600 dark:text-muted-foreground">
                  {taxConsiderations}
                </div>
              </div>
            </div>

            {/* Restrictions */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                <Circle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                  Restrictions
                </div>
                <div className="text-xs leading-[18px] text-gray-600 dark:text-muted-foreground">
                  {restrictions}
                </div>
              </div>
            </div>

            {/* Rebalancing */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                <BarChart3 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                  Rebalancing
                </div>
                <div className="text-xs leading-[18px] text-gray-600 dark:text-muted-foreground">
                  {rebalancing}
                </div>
              </div>
            </div>
          </div>) : (
          <NoDataAvailable />
        )
        }
      </div>
    </div>
  );
}

const NoDataAvailable = () => {
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      <div className="w-full text-sm font-normal text-gray-500 dark:text-muted-foreground">
        No data available
      </div>
    </div>
  );
};