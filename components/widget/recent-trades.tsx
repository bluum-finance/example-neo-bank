'use client';

import React, { useEffect } from 'react';
import { ArrowUpRight, History } from 'lucide-react';
import Link from 'next/link';
import type { Position } from '@/lib/bluum-api.types';
import { useAccountStore } from '@/store/account.store';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';

function parseDecimal(value?: string | null): number {
  return parseFloat(value || '0') || 0;
}

const FALLBACK_POSITIONS: Position[] = [
  {
    id: 'pos_msft',
    investor_id: 'demo',
    symbol: 'MSFT',
    currency: 'USD',
    quantity: '10',
    average_cost_basis: '375.00',
    current_price: '380.25',
    market_value: '3802.50',
    unrealized_pl: '52.50',
    unrealized_pl_percent: '1.40',
  },
  {
    id: 'pos_aapl',
    investor_id: 'demo',
    symbol: 'AAPL',
    currency: 'USD',
    quantity: '15',
    average_cost_basis: '165.00',
    current_price: '175.50',
    market_value: '2632.50',
    unrealized_pl: '157.50',
    unrealized_pl_percent: '6.36',
  },
  {
    id: 'pos_nvda',
    investor_id: 'demo',
    symbol: 'NVDA',
    currency: 'USD',
    quantity: '5',
    average_cost_basis: '480.00',
    current_price: '501.12',
    market_value: '2505.60',
    unrealized_pl: '105.60',
    unrealized_pl_percent: '4.42',
  },
];

export function RecentTrades() {
  const account = useAccountStore((state) => state.account);
  const positions = useAccountStore((state) => state.positions);
  const isPositionsLoading = useAccountStore((state) => state.isPositionsLoading);
  const fetchPositions = useAccountStore((state) => state.fetchPositions);
  const { displayAmount } = useCurrency();

  useEffect(() => {
    if (account?.id) {
      fetchPositions(account.id).catch((err) => {
        console.error('Failed to fetch positions', err);
      });
    }
  }, [account?.id, fetchPositions]);

  const displayPositions = positions.length > 0 ? positions : FALLBACK_POSITIONS;
  const loading = isPositionsLoading;

  return (
    <section className="flex flex-1 flex-col w-full rounded-xl bg-[#0f2a20] border border-[#1e3d2f] p-6 text-left font-inter text-white">
      {/* Header Section */}
      <header className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#30d158]" />
          <h2 className="text-base font-normal leading-6">Recent Trades</h2>
        </div>
        <Link href="/trade" className="flex items-center gap-1 text-xs font-normal text-[#30d158] hover:opacity-80 transition-opacity">
          View All
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </header>

      {/* Trades Table */}
      <div className="w-full overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#2a4d3c] text-[#a1bead]">
              <th className="pb-2 font-medium">Asset</th>
              <th className="pb-2 font-medium">Shares</th>
              <th className="pb-2 text-right font-medium">Price</th>
              <th className="pb-2 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent font-inter">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-[#a1bead]">Loading positions...</td>
              </tr>
            ) : (
              displayPositions.map((position, index) => (
                <tr key={`${position.symbol}-${index}`} className="group transition-colors hover:bg-white/5">
                  <td className="py-3 font-normal text-white sm:text-sm">
                    <Link href={`/assets/${position.symbol.toLowerCase()}`} className="hover:text-[#30d158] transition-colors">
                      {position.symbol}
                    </Link>
                  </td>
                  <td className="py-3 font-normal text-white/90 tabular-nums sm:text-sm">
                    {parseDecimal(position.quantity)}
                  </td>
                  <td className="py-3 text-right text-white/90 tabular-nums sm:text-sm">
                    {displayAmount(parseDecimal(position.current_price), position.currency as CurrencyCode)}
                  </td>
                  <td className="py-3 text-right text-white/90 tabular-nums sm:text-sm">
                    {displayAmount(parseDecimal(position.market_value), position.currency as CurrencyCode)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
