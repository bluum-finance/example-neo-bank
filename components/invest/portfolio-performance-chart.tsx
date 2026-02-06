'use client';

import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { TrendingUp, Shield, List, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const hasMetric = (entry: [string, string | undefined]): entry is [string, string] =>
  typeof entry[1] === 'string';


// Calculate performance percentage
const calculatePerformance = (data: PerformanceDataPoint[]): { portfolio: number } => {
  if (data.length === 0) return { portfolio: 0 };

  const startPortfolio = data[0].portfolio;
  const endPortfolio = data[data.length - 1].portfolio;

  return {
    portfolio: ((endPortfolio - startPortfolio) / startPortfolio) * 100,
  };
};

export function PortfolioPerformanceChart({
  data: externalData,
  portfolioPerformance,
  portfolioValue,
  summaryData,
  summaryLoading,
  summaryError,
}: PortfolioPerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [viewMode, setViewMode] = useState<'chart' | 'summary'>('chart');

  const chartData = useMemo(() => {
    const emptyData: PerformanceDataPoint[] = [
      {
        date: '2026-01-01',
        portfolio: 0,
      },
      {
        date: '2026-01-02',
        portfolio: 0,
      },
      {
        date: '2026-01-03',
        portfolio: 0,
      },
      {
        date: '2026-01-04',
        portfolio: 0,
      },
      {
        date: '2026-01-05',
        portfolio: 0,
      },
      {
        date: '2026-01-06',
        portfolio: 0,
      },
    ];
    let result: PerformanceDataPoint[] = [];

    if (externalData && externalData.length > 0) {
      result = externalData;
    }

    const history = summaryData?.value_history;
    if (!history || history.length === 0) {
      result = [];
    }

    if (history && history.length > 0) {
      result = history.map((point) => ({
        date: point.date,
        portfolio: parseFloat(point.value),
      }));
    }

    return result.length > 0 ? result : emptyData;
  }, [externalData, summaryData]);

  const performance = useMemo(() => {
    if (portfolioPerformance !== undefined) {
      return { portfolio: portfolioPerformance };
    }
    return calculatePerformance(chartData);
  }, [chartData, portfolioPerformance]);

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
            Your Portfolio: {new Intl.NumberFormat('en-US', {
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
    <>
      <div className="mb-2">
        <select
          value={selectedRange}
          onChange={(event) => setSelectedRange(event.target.value as TimeRange)}
          className="text-xs text-muted-foreground px-0 border-0 outline-none"
        >
          {timeRanges.map((range) => (
            <option key={range} value={range}>
              {rangeLabels[range]}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            className="dark:[&_text]:fill-gray-400"
            tickLine={false}
            axisLine={false}
            height={32}
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
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="#22C55E"
            strokeWidth={2}
            fill="url(#colorPortfolio)"
            name="Your Portfolio"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );

  // Render summary view
  const renderSummaryView = () => (
    <div className="">
      <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-muted-foreground">
        Portfolio summary
      </span>

      {summaryMetrics.length === 0 ? (
        <div className="text-sm py-8 text-muted-foreground dark:text-white/70">
          No data available
        </div>
      ) : (
        summaryMetrics.map(([label, value]) => (
          <div key={label} className="card flex justify-between text-sm text-gray-600 dark:text-muted-foreground">
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-gray-900 dark:text-white">
                {value}
              </span>
            </CardContent>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className='gap-4'>
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left Side - Portfolio Info */}
          <div className="flex flex-col gap-1">
            {/* Portfolio balance label with icon */}
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-500 dark:text-muted-foreground">
                Portfolio balance
              </div>
              <div className="p-1.5 bg-green-100 dark:bg-[#1A3A2C] rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-[#66D07A]" />
              </div>
            </div>

            {/* Masked portfolio value */}
            {portfolioValue !== undefined && (
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(portfolioValue)}
              </div>
            )}


          </div>

          <div className="bg-[#0F2A20] dark:bg-[#0F2A20] rounded-lg border border-[#2A4D3C] dark:border-[#2A4D3C] flex items-start">
            {/* Chart View Button (Active) */}
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${viewMode === 'chart'
                ? 'bg-[#1E3D2F] dark:bg-[#1E3D2F]'
                : 'bg-transparent'
                }`}
            >
              <div className="p-1">
                <BarChart3 className={`w-4 h-4 ${viewMode === 'chart' ? 'text-white' : 'text-gray-400 dark:text-muted-foreground'
                  }`} />
              </div>
            </button>

            {/* Summary View Button */}
            <button
              onClick={() => setViewMode('summary')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${viewMode === 'summary'
                ? 'bg-[#1E3D2F] dark:bg-[#1E3D2F]'
                : 'bg-transparent'
                }`}
            >
              <div className="p-1">
                <List className={`w-4 h-4 ${viewMode === 'summary' ? 'text-white' : 'text-gray-400 dark:text-muted-foreground'
                  }`} />
              </div>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="">
        {viewMode === 'chart'
          ? renderChartView()
          : summaryLoadingState
            ? (
              <div className="flex justify-center items-center py-12 text-sm text-gray-500 dark:text-muted-foreground">
                Loading summary…
              </div>
            )
            : summaryErrorState
              ? (
                <div className="text-sm text-red-500 text-center py-12">{summaryErrorState}</div>
              )
              : renderSummaryView()}
      </CardContent>
    </Card>
  );
}
