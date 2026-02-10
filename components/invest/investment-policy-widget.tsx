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
  Check,
  Lock,
  CheckCircle,
  ChartPieIcon,
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
  const riskTolerance = policy?.risk_profile?.risk_tolerance;
  const riskScore = policy?.risk_profile?.risk_score;
  const riskLevels: Record<string, string> = {
    conservative: 'Conservative',
    moderate_conservative: 'Moderate-Conservative',
    moderate: 'Moderate',
    moderate_high: 'Moderate-High',
    moderate_aggressive: 'Moderate-Aggressive',
    aggressive: 'Aggressive',
  };
  const riskLevel = riskTolerance
    ? (riskLevels[riskTolerance] || riskTolerance.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
    : undefined;
  // Convert risk_score - handle both 0-10 and 0-100 scales
  const riskPosition = riskScore !== undefined
    ? riskScore > 10
      ? riskScore // Already 0-100 scale
      : (riskScore / 10) * 100 // Convert 0-10 to 0-100
    : undefined;

  const timeHorizonYears = policy?.time_horizon?.years;
  const timeHorizonCategory = policy?.time_horizon?.category;
  const timeHorizonDisplay = timeHorizonYears !== undefined
    ? `${timeHorizonYears} ${timeHorizonYears === 1 ? 'Year' : 'Years'}`
    : undefined;
  // Handle both old format (short_term, medium_term, long_term) and new format (15-20 years)
  const timeHorizonDescription = timeHorizonCategory
    ? timeHorizonCategory.includes('-') || timeHorizonCategory.includes('years')
      ? timeHorizonCategory // Already readable format
      : timeHorizonCategory.replace(/_/g, '-') + ' investment horizon'
    : undefined;

  // Calculate progress bar width based on years (assuming max 20 years for display)
  const maxDisplayYears = 20;
  const timeHorizonProgress =
    timeHorizonYears !== undefined ? Math.min((timeHorizonYears / maxDisplayYears) * 100, 100) : undefined;

  const liquidityPercent = policy?.constraints?.liquidity_requirements?.minimum_cash_percent
    ? parseFloat(policy.constraints.liquidity_requirements.minimum_cash_percent)
    : undefined;
  const liquidityDescription = liquidityPercent !== undefined
    ? `Maintain ${liquidityPercent}% in cash/equivalents for operational needs.`
    : undefined;

  const taxConsiderations = (() => {
    const tax = policy?.constraints?.tax_considerations;
    if (!tax) return undefined;

    const parts: string[] = [];
    if (tax.prefer_tax_advantaged) {
      parts.push('Prioritize tax-advantaged accounts');
    }
    if (tax.tax_loss_harvesting) {
      parts.push('harvest losses annually');
    }
    if (tax.tax_bracket) {
      parts.push(`Tax bracket: ${tax.tax_bracket}%`);
    }
    return parts.length > 0 ? parts.join('; ') + '.' : undefined;
  })();

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
  // Support both old structure (equities/fixed_income) and new structure (stocks/bonds)
  const allocationData: Array<{ name: string; value: number; color: string }> = [];
  if (policy?.target_allocation) {
    const ta = policy.target_allocation;

    // Handle stocks (new) or equities (old)
    const stocks = ta.stocks || ta.equities;
    if (stocks?.target_percent) {
      allocationData.push({
        name: 'Stocks',
        value: parseFloat(stocks.target_percent || '0'),
        color: '#22C55E',
      });
    }

    // Handle bonds (new) or fixed_income (old)
    const bonds = ta.bonds || ta.fixed_income;
    if (bonds?.target_percent) {
      allocationData.push({
        name: 'Bonds',
        value: parseFloat(bonds.target_percent || '0'),
        color: '#3B82F6',
      });
    }

    // Handle treasury
    if (ta.treasury?.target_percent) {
      allocationData.push({
        name: 'Treasury',
        value: parseFloat(ta.treasury.target_percent || '0'),
        color: '#9333EA',
      });
    }

    // Handle alternatives
    if (ta.alternatives?.target_percent) {
      allocationData.push({
        name: 'Alternatives',
        value: parseFloat(ta.alternatives.target_percent || '0'),
        color: '#F97316',
      });
    }
  }

  const formatSectorName = (sector: string) => {
    return sector.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const restrictions = (() => {
    const restr = policy?.constraints?.restrictions;
    if (!restr) return undefined;

    const parts: string[] = [];

    // Excluded sectors
    if (restr.excluded_sectors && restr.excluded_sectors.length > 0) {
      parts.push(`Excluded sectors: ${restr.excluded_sectors.map(formatSectorName).join(', ')}`);
    }

    // Excluded securities
    if (restr.excluded_securities && restr.excluded_securities.length > 0) {
      parts.push(`Excluded securities: ${restr.excluded_securities.join(', ')}`);
    }

    // No individual stocks
    if (restr.no_individual_stocks) {
      parts.push('No individual stocks');
    }

    // ESG screening
    if (restr.esg_screening) {
      if (restr.esg_criteria && Array.isArray(restr.esg_criteria) && restr.esg_criteria.length > 0) {
        const criteria = restr.esg_criteria.map((c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())).join(', ');
        parts.push(`ESG screening (${criteria})`);
      } else {
        parts.push('ESG screening on all holdings');
      }
    }

    return parts.length > 0 ? parts.join('. ') + '.' : undefined;
  })();

  const rebalancing = policy?.constraints?.rebalancing_policy
    ? `${policy.constraints.rebalancing_policy.frequency} review; rebalance when drift exceeds ±${policy.constraints.rebalancing_policy.threshold_percent}%`
    : undefined;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* 1. Risk Tolerance */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-medium text-muted-foreground dark:text-[#D1D5DB]">
              Risk Tolerance
            </div>
          </div>

          {policy?.risk_profile && riskTolerance && riskScore !== undefined ? (
            <>
              <div className="flex flex-col gap-1">
                {/* Slider */}
                <div className="relative h-2 rounded-[5px] overflow-visible">
                  <div
                    className="absolute inset-0 rounded-[5px]"
                    style={{
                      background: 'linear-gradient(60deg, #E8FFF0 0%, #10A144 100%)',
                    }}
                  />
                  {riskPosition !== undefined && (
                    <div
                      className="absolute top-1/2 w-[26.72px] h-[18px] bg-white rounded-[9px] border-[3px] border-[#57B75C] shadow-lg -translate-y-1/2 z-10"
                      style={{
                        left: `clamp(0px, calc(${riskPosition}% - 13.36px), calc(100% - 26.72px))`,
                      }}
                    />
                  )}
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
                {riskLevel && (
                  <div className="w-full text-center text-base font-semibold leading-6 text-[#57B75C]">
                    {riskLevel}
                  </div>
                )}
                {policy?.risk_profile?.volatility_tolerance && (
                  <div className="w-full text-center text-[10px] leading-[15px] font-normal text-gray-500 dark:text-muted-foreground">
                    {policy.risk_profile.volatility_tolerance} volatility tolerance
                  </div>
                )}
              </div>
            </>
          ) : (
            <NoDataAvailable />
          )}
        </div>

        {/* 2. Time Horizon */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-medium text-muted-foreground dark:text-[#D1D5DB]">
              Time Horizon
            </div>
          </div>

          {policy?.time_horizon && timeHorizonYears !== undefined ? (
            <>
              <div className="flex flex-col gap-1">
                {/* Progress bar */}
                <div className="w-full h-2 dark:bg-[#2A4D3C] bg-gray-200 rounded-full overflow-hidden">
                  {timeHorizonProgress !== undefined && (
                    <div
                      className="h-full bg-[#57B75C] rounded-l-full"
                      style={{ width: `${timeHorizonProgress}%` }}
                    />
                  )}
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
                {timeHorizonDescription && (
                  <div
                    className="w-full text-center text-base font-semibold leading-6 text-[#57B75C]"
                    style={{ fontFamily: 'Inter', fontWeight: 600 }}
                  >
                    {timeHorizonDescription}
                  </div>
                )}
                <div
                  className="w-full text-center text-[10px] leading-[15px] text-gray-500 dark:text-muted-foreground"
                  style={{ fontFamily: 'Inter', fontWeight: 400 }}
                >
                  Growth-oriented portfolio
                </div>
              </div>
            </>
          ) : (
            <NoDataAvailable />
          )}
        </div>

        {/* 5. Objectives */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1A3A2C]">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-medium text-muted-foreground dark:text-[#D1D5DB]">
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
              <ChartPieIcon className="h-4 w-4 text-white" />
            </div>
            <div className="text-xs font-medium text-muted-foreground dark:text-[#D1D5DB]">
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
                        outerRadius={28}
                        innerRadius={20}
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
                <div className="flex-1 flex flex-col gap-2">
                  {allocationData.map((item, index) => (
                    <div key={item.name} className="relative h-[15px]">
                      <div
                        className="absolute left-0 top-[3.5px] w-2 h-2 rounded-xs"
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

              <div className="relative mt-1 flex items-center gap-2 px-2 py-1.5 w-full h-full rounded-[6px] bg-[rgba(48,209,88,0.12)]">
                <CheckCircle className="h-3 w-3 text-[#30D158]" />

                <div className="text-[11px] leading-[15px] font-light text-[#30D158]">
                  Within ±3% of target allocation
                </div>
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
          <div className="text-xs font-medium text-muted-foreground dark:text-[#D1D5DB]">
            Constraints & Guidelines
          </div>
        </div>

        {/* Guidelines List */}
        {policy?.constraints ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Liquidity */}
            {liquidityDescription && (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                  <Droplets className="h-3.5 w-3.5 text-green-600 dark:text-white" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="text-[13px] font-medium text-gray-900 dark:text-foreground">
                    Liquidity
                  </div>
                  <div className="text-xs leading-[18px] text-gray-600 dark:text-muted-foreground">
                    {liquidityDescription}
                  </div>
                </div>
              </div>
            )}

            {/* Tax Considerations */}
            {taxConsiderations && (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                  <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-white" />
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
            )}

            {/* Restrictions */}
            {restrictions && (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                  <Ban className="h-3.5 w-3.5 text-green-600 dark:text-white" />
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
            )}

            {/* Rebalancing */}
            {rebalancing && (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-border flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                  <RotateCcw className="h-3.5 w-3.5 text-green-600 dark:text-white" />
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
            )}
          </div>
        ) : (
          <NoDataAvailable />
        )}
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