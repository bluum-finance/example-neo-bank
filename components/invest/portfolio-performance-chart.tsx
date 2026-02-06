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
  Line,
  ComposedChart,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'All';

interface PerformanceDataPoint {
  date: string;
  portfolio: number;
  sp500: number;
}

interface PortfolioPerformanceChartProps {
  data?: PerformanceDataPoint[];
  portfolioPerformance?: number; // Percentage gain for selected period
  sp500Performance?: number; // Percentage gain for selected period
  portfolioValue?: number; // Current portfolio value in USD
}


// Calculate performance percentage
const calculatePerformance = (data: PerformanceDataPoint[]): { portfolio: number; sp500: number } => {
  if (data.length === 0) return { portfolio: 0, sp500: 0 };

  const startPortfolio = data[0].portfolio;
  const endPortfolio = data[data.length - 1].portfolio;
  const startSp500 = data[0].sp500;
  const endSp500 = data[data.length - 1].sp500;

  return {
    portfolio: ((endPortfolio - startPortfolio) / startPortfolio) * 100,
    sp500: ((endSp500 - startSp500) / startSp500) * 100,
  };
};

export function PortfolioPerformanceChart({
  data: externalData,
  portfolioPerformance,
  sp500Performance,
  portfolioValue,
}: PortfolioPerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');

  const chartData = useMemo(() => {
    return externalData || [];
  }, [externalData]);

  const performance = useMemo(() => {
    if (portfolioPerformance !== undefined && sp500Performance !== undefined) {
      return { portfolio: portfolioPerformance, sp500: sp500Performance };
    }
    return calculatePerformance(chartData);
  }, [chartData, portfolioPerformance, sp500Performance]);

  const timeRanges: TimeRange[] = ['1W', '1M', '3M', '1Y', 'All'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as PerformanceDataPoint;
      const portfolioPercent = ((dataPoint.portfolio - 100) / 100) * 100;
      const sp500Percent = ((dataPoint.sp500 - 100) / 100) * 100;

      return (
        <div className="rounded-lg border border-gray-200 dark:border-border bg-card p-3 shadow-lg">
          <p className="text-xs font-medium text-gray-900 dark:text-foreground mb-2">{dataPoint.date}</p>
          {payload.map((entry: any, index: number) => {
            const percent = entry.dataKey === 'portfolio' ? portfolioPercent : sp500Percent;
            return (
              <p
                key={index}
                className={`text-xs ${entry.dataKey === 'portfolio' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-muted-foreground'}`}
              >
                {entry.dataKey === 'portfolio' ? 'Your Portfolio' : 'S&P 500'}:{' '}
                {percent >= 0 ? '+' : ''}
                {percent.toFixed(2)}%
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <CardTitle className="text-sm font-medium text-foreground/70 dark:text-white/70">Portfolio balance</CardTitle>
              {portfolioValue !== undefined && (
                <p className="text-2xl font-semibold text-gray-900 dark:text-foreground mt-2">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(portfolioValue)}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-colors ${selectedRange === range
                  ? 'bg-green-900 dark:bg-green-900 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-accent'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="">
        <div className="rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30 px-4">
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
              <Line
                type="monotone"
                dataKey="sp500"
                stroke="#6B7280"
                className="dark:stroke-gray-400"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                name="S&P 500"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
