'use client';

import React, { useEffect } from 'react';
import { ArrowUpRight, History } from 'lucide-react';
import Link from 'next/link';
import { type Position } from '@/services/investment.service';
import { useAccountStore } from '@/store/account.store';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';

const FALLBACK_POSITIONS: Position[] = [
  { symbol: 'MSFT', name: 'Microsoft Corp.', currency: 'USD', shares: 10, currentPrice: 380.25, purchasePrice: 375.00, value: 3802.50, gain: 52.50, gainPercent: 1.40 },
  { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', shares: 15, currentPrice: 175.50, purchasePrice: 165.00, value: 2632.50, gain: 157.50, gainPercent: 6.36 },
  { symbol: 'NVDA', name: 'Nvidia Corp.', currency: 'USD', shares: 5, currentPrice: 501.12, purchasePrice: 480.00, value: 2505.60, gain: 105.60, gainPercent: 4.42 },
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
              positions.map((position, index) => (
                <tr key={`${position.symbol}-${index}`} className="group transition-colors hover:bg-white/5">
                  <td className="py-3 font-normal text-white sm:text-sm">
                    <Link href={`/assets/${position.symbol.toLowerCase()}`} className="hover:text-[#30d158] transition-colors">
                      {position.symbol}
                    </Link>
                  </td>
                  <td className="py-3 font-normal text-white/90 tabular-nums sm:text-sm">
                    {position.shares}
                  </td>
                  <td className="py-3 text-right text-white/90 tabular-nums sm:text-sm">
                    {displayAmount(position.currentPrice, position.currency as CurrencyCode)}
                  </td>
                  <td className="py-3 text-right text-white/90 tabular-nums sm:text-sm">
                    {displayAmount(position.value, position.currency as CurrencyCode)}
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
