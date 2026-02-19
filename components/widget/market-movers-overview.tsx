import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketMover {
  symbol: string;
  name: string;
  category: string;
  price: string;
  change: string;
  isPositive: boolean;
}

interface MarketMoverItemProps {
  mover: MarketMover;
}

/**
 * Optimized Market Mover Item
 * Uses semantic HTML and minimal wrappers.
 */
function MarketMoverItem({ mover }: MarketMoverItemProps) {
  return (
    <li className="group flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-opacity hover:opacity-90 cursor-pointer">
      <div className="flex items-center gap-3">
        {/* Symbol badge - using a simple div for the ticker logo */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#1E3D2F] font-manrope text-[8px] font-bold text-white uppercase tracking-tighter">
          {mover.symbol}
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-normal text-white leading-tight">{mover.name}</h3>
          <p className="text-xs text-[#A1BEAD]">{mover.category}</p>
        </div>
      </div>

      <div className="flex flex-col items-end tabular-nums">
        <span className="text-sm font-normal text-white">{mover.price}</span>
        <div className={cn('flex items-center gap-1 text-xs font-normal', mover.isPositive ? 'text-[#30D158]' : 'text-[#FF453A]')}>
          {mover.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>
            {mover.isPositive ? '+' : ''}
            {mover.change}
          </span>
        </div>
      </div>
    </li>
  );
}

/**
 * MarketMoversOverview Component
 * A premium widget showing gainers and losers in the market.
 */
export function MarketMoversOverview() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

  const gainers: MarketMover[] = [
    { symbol: 'META', name: 'Meta Platforms', category: 'Tech', price: '$312.45', change: '4.2%', isPositive: true },
    { symbol: 'AMD', name: 'AMD Inc.', category: 'Semiconductors', price: '$115.20', change: '2.8%', isPositive: true },
    { symbol: 'DANG', name: 'Dangote Cement', category: '(Industrial, NGX)', price: '₦799.90', change: '1.9%', isPositive: true },
  ];

  const losers: MarketMover[] = [
    { symbol: 'TSLA', name: 'Tesla, Inc.', category: 'Automotive', price: '$240.50', change: '3.1%', isPositive: false },
    { symbol: 'AAPL', name: 'Apple Inc.', category: 'Tech', price: '$175.20', change: '1.8%', isPositive: false },
    { symbol: 'NFLX', name: 'Netflix', category: 'Entertainment', price: '$420.10', change: '1.2%', isPositive: false },
  ];

  const currentMovers = activeTab === 'gainers' ? gainers : losers;

  return (
    <section className="flex w-full flex-col gap-4 rounded-xl border border-[#1E3D2F] bg-[#0F2A20] p-6 text-left font-inter shadow-xl">
      <header className="flex items-center justify-between pb-3">
        <h2 className="text-base font-normal text-white">Market Movers</h2>

        <nav className="flex items-center gap-8 text-xs">
          <button
            onClick={() => setActiveTab('gainers')}
            className={cn(
              'relative pb-2 font-medium transition-colors',
              activeTab === 'gainers' ? 'text-[#30D158]' : 'text-[#A1BEAD] hover:text-white'
            )}
          >
            Gainers
            {activeTab === 'gainers' && <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[#30D158]" />}
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={cn(
              'relative pb-2 font-medium transition-colors',
              activeTab === 'losers' ? 'text-[#30D158]' : 'text-[#A1BEAD] hover:text-white'
            )}
          >
            Losers
            {activeTab === 'losers' && <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[#30D158]" />}
          </button>
        </nav>
      </header>

      <ul className="flex flex-col divide-y divide-[#1E3D2F]/50 min-h-[180px]">
        {currentMovers.map((mover) => (
          <MarketMoverItem key={mover.symbol} mover={mover} />
        ))}
      </ul>

      {/* <button className="flex items-center gap-1.5 self-start text-xs font-semibold text-[#30D158] hover:opacity-80 transition-opacity">
        View detailed market data
        <ArrowUpRight className="h-3 w-3" />
      </button> */}
    </section>
  );
}
