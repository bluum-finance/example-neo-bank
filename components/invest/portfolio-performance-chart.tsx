'use client';

import { useState, useMemo } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldIcon } from '../icons/shield.icon';
export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'All';

interface PerformanceDataPoint {
  date: string;
  portfolio: number;
}

interface PortfolioPerformanceChartProps {
  data?: PerformanceDataPoint[];
  portfolioPerformance?: number; // Percentage gain for selected period
  portfolioValue?: number; // Current portfolio value in USD
  summaryData?: PortfolioSummary | null;
  summaryLoading?: boolean;
  summaryError?: string | null;
  onRangeChange?: (range: TimeRange) => void; // Callback when range changes
  accountId?: string; // Account ID for reloading data
  portfolioId?: string; // Portfolio ID for reloading data
  hideSummary?: boolean;
}

interface AllocationEntry {
  asset_class: string;
  value: string;
  percent: string;
}

interface RebalancingStatus {
  needs_rebalancing?: boolean;
  last_rebalanced_at?: string;
  next_scheduled?: string;
  max_deviation_percent?: string;
}

interface PortfolioSummary {
  valuation: {
    total_value: string;
    cash_value?: string;
    positions_value?: string;
    unrealized_gain_loss?: string;
    unrealized_gain_loss_percent?: string;
    as_of?: string;
  };
  allocation?: {
    by_asset_class?: AllocationEntry[];
    by_sector?: Array<{
      sector: string;
      value: string;
      percent: string;
    }>;
  };
  rebalancing_status?: RebalancingStatus;
  value_history?: Array<{ date: string; value: string }>;
}

const summaryMetricEntries = (summary?: PortfolioSummary | null): [string, string | undefined][] => [
  ['Cash value', summary?.valuation?.cash_value],
  ['Positions value', summary?.valuation?.positions_value],
  ['Unrealized gain/loss', summary?.valuation?.unrealized_gain_loss],
  ['Unrealized gain/loss %', summary?.valuation?.unrealized_gain_loss_percent],
];

const hasMetric = (entry: [string, string | undefined]): entry is [string, string] => typeof entry[1] === 'string';

export function PortfolioPerformanceChart({
  data: externalData,
  portfolioPerformance,
  portfolioValue,
  summaryData,
  summaryLoading,
  summaryError,
  onRangeChange,
  accountId,
  portfolioId,
  hideSummary,
}: PortfolioPerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [viewMode, setViewMode] = useState<'chart' | 'summary'>('chart');
  const [hideAmount, setHideAmount] = useState(true);

  const handleRangeChange = (newRange: TimeRange) => {
    setSelectedRange(newRange);
    if (onRangeChange) {
      onRangeChange(newRange);
    }
  };

  const chartData = useMemo(() => {
    if (externalData && externalData.length > 0) {
      return externalData;
    }

    return [
      { date: '2026-01-01', portfolio: 0 },
      { date: '2026-01-02', portfolio: 0 },
      { date: '2026-01-03', portfolio: 0 },
      { date: '2026-01-04', portfolio: 0 },
      { date: '2026-01-05', portfolio: 0 },
    ];
  }, [externalData, summaryData]);

  const timeRanges: TimeRange[] = ['1W', '1M', '3M', '1Y', 'All'];
  const summaryLoadingState = !!summaryLoading;
  const summaryErrorState = summaryError;
  const summaryPayload = summaryData;
  const summaryMetrics: readonly [string, string][] = summaryMetricEntries(summaryPayload).filter(hasMetric);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as PerformanceDataPoint;

      return (
        <div className="rounded-lg border border-gray-200 dark:border-border bg-card p-3 shadow-lg">
          <p className="text-xs font-medium text-gray-900 dark:text-foreground mb-2">{dataPoint.date}</p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Your Portfolio:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(dataPoint.portfolio)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render chart view
  const rangeLabels: Record<TimeRange, string> = {
    '1W': 'Last 7 days',
    '1M': 'Last 30 days',
    '3M': 'Last 90 days',
    '1Y': 'Last 12 months',
    All: 'All time',
  };

  const renderChartView = () => (
    <div className="mb-[-28px]">
      <div className="mb-4 flex justify-between items-center">
        <select
          value={selectedRange}
          onChange={(event) => handleRangeChange(event.target.value as TimeRange)}
          className="text-xs text-muted-foreground px-0 border-0 outline-none"
        >
          {timeRanges.map((range) => (
            <option key={range} value={range}>
              {rangeLabels[range]}
            </option>
          ))}
        </select>

        {/* Growth/Loss */}
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="pt-[2px] pb-[2px]">
              <div className="w-3 h-3 relative">
                <div className="w-[7.5px] h-[7.5px] absolute left-[1.99px] top-[2.51px] bg-[#22C55E]" />
              </div>
            </div>
            <div className="text-xs leading-4 text-[#A1BEAD]" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
              $••K
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="pt-[2px] pb-[2px]">
              <div className="w-3 h-3 relative">
                <div className="w-[7.5px] h-[7.5px] absolute left-[1.99px] top-[1.99px] bg-[#EF4444]" />
              </div>
            </div>
            <div className="text-xs leading-4 text-[#A1BEAD]" style={{ fontFamily: 'Inter', fontWeight: 400 }}>
              $••K
            </div>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            className="dark:[&_text]:fill-gray-400"
            tickLine={false}
            axisLine={false}
            height={32}
            tickFormatter={(value) => {
              try {
                const date = new Date(value);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const day = date.getDate();
                return `${month} ${day}`;
              } catch {
                return value;
              }
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            className="dark:[&_text]:fill-gray-400"
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="portfolio" stroke="#22C55E" strokeWidth={2} fill="url(#colorPortfolio)" name="Your Portfolio" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  // Render summary view
  const renderSummaryView = () => (
    <div className="mb-4">
      <div className="text-xs mt-4 mb-5 uppercase tracking-wide text-gray-500 dark:text-muted-foreground">Portfolio summary</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaryMetrics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-border/50 bg-white/70 dark:bg-[#0F2A20]/80 p-4 text-sm text-center text-muted-foreground dark:text-white/70">
            No data available
          </div>
        ) : (
          summaryMetrics.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-[#0F2A20]/60 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-muted-foreground">{label}</span>
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                {label.includes('%')
                  ? `${parseFloat(value).toFixed(2)}%`
                  : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Card className="gap-4">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Side - Portfolio Info */}
          <div className="flex flex-col gap-1">
            {/* Portfolio balance label with icon */}
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-500 dark:text-muted-foreground">Portfolio balance</div>
              <div className="p-0 bg-green-100 dark:bg-[#1A3A2C] rounded-full flex items-center justify-center">
                <ShieldIcon className="w-7 h-7" />
              </div>
            </div>

            {portfolioValue !== undefined && (
              <div
                className="text-[30px] leading-[36px] font-semibold text-white tracking-[3px] cursor-pointer"
                onClick={() => setHideAmount(!hideAmount)}
              >
                {hideAmount ? (
                  <span>$ • • • • • • •</span>
                ) : (
                  <span>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(portfolioValue)}
                  </span>
                )}
              </div>
            )}
          </div>

          {!hideSummary && (
            <div className="w-fit bg-[#0F2A20] rounded-lg border-[0.70px] border-[#2A4D3C] flex items-start">
              {/* Chart View Button */}
              <button
                onClick={() => setViewMode('chart')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${viewMode === 'chart' ? 'bg-[#1E3D2F]' : 'bg-transparent'}`}
              >
                <div className="py-1">
                  <div className="w-4 h-4 relative">
                    {viewMode === 'chart' ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path
                          d="M2.34375 12.3125L6.34375 8.3125L9 11L14.6562 4.625L13.7188 3.6875L9 9L6.34375 6.3125L1.34375 11.3125L2.34375 12.3125Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path
                          d="M11.3438 0H1.34375C0.59375 0 0 0.59375 0 1.34375V10.6562C0 11.4062 0.59375 12 1.34375 12H11.3438C12.0625 12 12.6562 11.4062 12.6562 10.6562V1.34375C12.6562 0.59375 12.0625 0 11.3438 0ZM11.3438 1.34375V3.34375H1.34375V1.34375H11.3438ZM8 10.6562H4.65625V4.65625H8V10.6562ZM1.34375 4.65625H3.34375V10.6562H1.34375V4.65625ZM9.34375 10.6562V4.65625H11.3438V10.6562H9.34375Z"
                          fill="#B0B8BD"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>

              {/* Summary View Button */}
              <button
                onClick={() => setViewMode('summary')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${viewMode === 'summary' ? 'bg-[#1E3D2F]' : 'bg-transparent'}`}
              >
                <div className="py-1">
                  <div className="w-4 h-4 relative">
                    {viewMode === 'summary' ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path
                          d="M2.34375 12.3125L6.34375 8.3125L9 11L14.6562 4.625L13.7188 3.6875L9 9L6.34375 6.3125L1.34375 11.3125L2.34375 12.3125Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path
                          d="M11.3438 0H1.34375C0.59375 0 0 0.59375 0 1.34375V10.6562C0 11.4062 0.59375 12 1.34375 12H11.3438C12.0625 12 12.6562 11.4062 12.6562 10.6562V1.34375C12.6562 0.59375 12.0625 0 11.3438 0ZM11.3438 1.34375V3.34375H1.34375V1.34375H11.3438ZM8 10.6562H4.65625V4.65625H8V10.6562ZM1.34375 4.65625H3.34375V10.6562H1.34375V4.65625ZM9.34375 10.6562V4.65625H11.3438V10.6562H9.34375Z"
                          fill="#B0B8BD"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="">
        {viewMode === 'chart' ? (
          renderChartView()
        ) : summaryLoadingState ? (
          <div className="flex justify-center items-center py-12 text-sm text-gray-500 dark:text-muted-foreground">Loading summary…</div>
        ) : summaryErrorState ? (
          <div className="text-sm text-red-500 text-center py-12">{summaryErrorState}</div>
        ) : (
          renderSummaryView()
        )}
      </CardContent>
    </Card>
  );
}
