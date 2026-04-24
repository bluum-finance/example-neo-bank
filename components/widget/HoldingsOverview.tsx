'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAccountStore } from '@/store/account.store';
import { WidgetService } from '@/services/widget.service';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';

const ASSET_CLASS_COLORS: Record<string, string> = {
  stocks: '#30D158',
  bonds: '#0A84FF',
  treasury: '#FFD60A',
  alternatives: '#BF5AF2',
};

const FALLBACK_ALLOCATION = [
  { asset_class: 'stocks', value: '2194920.00', percent: '52.00' },
  { asset_class: 'bonds', value: '991935.00', percent: '23.50' },
  { asset_class: 'treasury', value: '835758.00', percent: '19.80' },
  { asset_class: 'alternatives', value: '198387.00', percent: '4.70' },
];

interface AllocationEntry {
  asset_class: string;
  value: string;
  percent: string;
}

interface PortfolioSummary {
  portfolio_id: string;
  account_id: string;
  name: string;
  currency: string;
  valuation: {
    total_value: string;
    cash_value: string;
    positions_value: string;
    unrealized_gain_loss: string;
    unrealized_gain_loss_percent: string;
    as_of: string;
  };
  allocation: {
    by_asset_class: AllocationEntry[];
  };
  rebalancing_status: {
    needs_rebalancing: boolean;
    last_rebalanced_at: string;
    max_deviation_percent: string;
  };
  linked_goals: Array<{
    goal_id: string;
    name: string;
  }>;
}

export const HoldingsOverview = () => {
  const account = useAccountStore((state) => state.account);
  const portfolioId = useAccountStore((state) => state.portfolioId);
  const summaryData = useAccountStore((state) => state.summaryData) as PortfolioSummary | null;
  const isSummaryLoading = useAccountStore((state) => state.isSummaryLoading);
  const fetchSummary = useAccountStore((state) => state.fetchSummary);
  const { displayAmount } = useCurrency();

  useEffect(() => {
    const accountId = account?.id;
    if (!accountId) return;
    // Only fetch if we don't have summary data yet
    if (!summaryData) {
      fetchSummary(accountId, portfolioId).catch(console.error);
    }
  }, [account?.id, portfolioId, fetchSummary]);

  const allocation = summaryData?.allocation?.by_asset_class?.length
    ? summaryData.allocation.by_asset_class
    : FALLBACK_ALLOCATION;

  const currency = (summaryData?.currency || 'USD') as CurrencyCode;
  const totalValue = summaryData?.valuation?.total_value
    ? parseFloat(summaryData.valuation.total_value)
    : null;

  const chartData = useMemo(
    () =>
      allocation.map((entry) => ({
        name: entry.asset_class,
        value: parseFloat(entry.percent),
        amount: parseFloat(entry.value),
        color: ASSET_CLASS_COLORS[entry.asset_class] || '#A1BEAD',
      })),
    [allocation]
  );

  const assetCount = allocation.length;

  return (
    <div className="h-full w-full relative rounded-xl bg-card border border-border flex flex-col items-start p-6 text-left font-sans text-white">
      <div className="w-full flex flex-col items-start pb-4">
        <div className="self-stretch flex flex-col items-start">
          <div className="self-stretch relative leading-6 font-normal">Allocation</div>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
        {isSummaryLoading ? (
          <div className="py-8 text-sm text-[#A1BEAD]">Loading allocation...</div>
        ) : (
          <div className="w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F2A20',
                    border: '1px solid #1E3D2F',
                    borderRadius: '8px',
                    color: '#fff',
                    textTransform: 'capitalize',
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number | undefined, name: string | undefined, props: any) => {
                    const amount = props.payload?.amount;
                    const displayName = name ?? 'Allocation';
                    if (amount != null) {
                      return [displayAmount(amount, currency), displayName];
                    }
                    return [`${(value ?? 0).toFixed(1)}%`, displayName];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="flex flex-col items-start">
                <b className="text-lg leading-8 flex items-center font-bold font-mono">
                  {totalValue != null ? displayAmount(totalValue, currency) : `${assetCount}`}
                </b>
              </div>
              <div className="flex flex-col items-start text-xs text-[#A1BEAD]">
                <div className="tracking-[0.6px] leading-4 uppercase flex items-center">
                  {totalValue != null ? 'Total Value' : 'Assets'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="self-stretch flex flex-col items-start pt-6 text-sm text-[#A1BEAD]">
        <div className="self-stretch flex flex-col items-start gap-3">
          {allocation.map((item) => (
            <div key={item.asset_class} className="self-stretch flex items-center justify-between gap-5">
              <div className="flex items-center">
                <div className="h-3 w-5 flex flex-col items-start pr-2">
                  <div
                    className="w-3 h-3 relative rounded-full"
                    style={{ backgroundColor: ASSET_CLASS_COLORS[item.asset_class] || '#A1BEAD' }}
                  />
                </div>
                <div className="flex flex-col items-start">
                  <div className="leading-5 flex items-center text-[#A1BEAD] capitalize">{item.asset_class}</div>
                </div>
              </div>
              <div className="flex flex-col items-start text-white">
                <div className="leading-5 font-medium flex items-center">{parseFloat(item.percent).toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoldingsOverview;
