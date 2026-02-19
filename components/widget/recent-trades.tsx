'use client';

import React from 'react';
import { ArrowUpRight, History } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Trade {
  asset: string;
  type: 'BUY' | 'SELL';
  amount: string;
}

const trades: Trade[] = [
  { asset: 'MSFT', type: 'BUY', amount: '$1,250' },
  { asset: 'MTN Nigeria', type: 'SELL', amount: '₦65,300' },
  { asset: 'Satrix Top 40 ETF', type: 'BUY', amount: 'R6,520' },
];

/**
 * RecentTrades Component
 * Optimized for performance and clean semantic HTML.
 */
export function RecentTrades() {
  return (
    <section className="flex flex-1 flex-col w-full rounded-xl bg-[#0f2a20] border border-[#1e3d2f] p-6 text-left font-inter text-white">
      {/* Header Section */}
      <header className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#30d158]" />
          <h2 className="text-base font-normal leading-6">Recent Trades</h2>
        </div>
        <button className="flex items-center gap-1 text-xs font-normal text-[#30d158] hover:opacity-80 transition-opacity">
          View All
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </header>

      {/* Trades Table */}
      <div className="w-full overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#2a4d3c] text-[#a1bead]">
              <th className="pb-2 font-medium">Asset</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent font-inter">
            {trades.map((trade, index) => (
              <tr key={`${trade.asset}-${index}`} className="group transition-colors hover:bg-white/5">
                <td className="py-3 font-normal text-white sm:text-sm">{trade.asset}</td>
                <td className="py-3">
                  <span
                    className={cn(
                      'text-[10px] font-normal tracking-wider sm:text-xs',
                      trade.type === 'BUY' ? 'text-[#30d158]' : 'text-[#a1bead]'
                    )}
                  >
                    {trade.type}
                  </span>
                </td>
                <td className="py-3 text-right text-white/90 tabular-nums sm:text-sm">{trade.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
