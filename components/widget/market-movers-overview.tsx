'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { InvestmentService, type AssetQuote } from '@/services/investment.service';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';

const MOVER_SYMBOLS = ['META', 'MTNN', 'AMD', 'TSLA', 'NFLX', 'NVDA', 'MSFT', 'GOOGL'];

const FALLBACK_QUOTES: AssetQuote[] = [
  { symbol: 'META', name: 'Meta Platforms', price: 312.45, change: 13.12, changePercent: 4.2 },
  { symbol: 'AMD', name: 'AMD Inc.', price: 115.20, change: 3.23, changePercent: 2.8 },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: 501.12, change: 17.04, changePercent: 3.5 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 240.50, change: -7.46, changePercent: -3.1 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.20, change: -3.15, changePercent: -1.8 },
  { symbol: 'NFLX', name: 'Netflix', price: 420.10, change: -5.04, changePercent: -1.2 },
];

interface MarketMover {
  symbol: string;
  name: string;
  category: string;
  price: string;
  change: string;
  isPositive: boolean | null;
}

interface MarketMoverItemProps {
  mover: MarketMover;
}

function MarketMoverItem({ mover }: MarketMoverItemProps) {
  const Icon = mover.isPositive === null ? null : mover.isPositive ? TrendingUp : TrendingDown;
  const changeColor =
    mover.isPositive === null ? 'text-[#A1BEAD]' : mover.isPositive ? 'text-[#30D158]' : 'text-[#FF453A]';

  return (
    <Link href={`/assets/${mover.symbol.toLowerCase()}`} className="group flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-opacity hover:opacity-90 cursor-pointer">
      <div className="flex items-center gap-3">
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
        <div className={cn('flex items-center gap-1 text-xs font-normal', changeColor)}>
          {Icon && <Icon className="h-3 w-3" />}
          <span>{mover.change}</span>
        </div>
      </div>
    </Link>
  );
}

export function MarketMoversOverview() {
  const [quotes, setQuotes] = useState<AssetQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const { displayAmount } = useCurrency();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await InvestmentService.getAssetQuotes(MOVER_SYMBOLS);
        setQuotes(data);
      } catch (err) {
        console.error('Failed to fetch market mover quotes, using fallback', err);
        setQuotes(FALLBACK_QUOTES);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const { gainers, losers } = useMemo(() => {
    const source = quotes.length > 0 ? quotes : FALLBACK_QUOTES;
    const sorted = [...source].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
    const positive = sorted.filter((q) => (q.changePercent ?? 0) >= 0).slice(0, 4);
    const negative = sorted.filter((q) => (q.changePercent ?? 0) < 0).slice(0, 4);
    return { gainers: positive, losers: negative };
  }, [quotes]);

  const toMover = (q: AssetQuote): MarketMover => ({
    symbol: q.symbol,
    name: q.name || q.symbol,
    category: q.symbol,
    price: q.price != null ? displayAmount(q.price, q.currency as CurrencyCode) : '—',
    change: q.changePercent != null ? `${Math.abs(q.changePercent).toFixed(2)}%` : '—',
    isPositive: q.changePercent == null ? null : q.changePercent >= 0,
  });

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
        {loading ? (
          <li className="py-8 text-center text-sm text-[#A1BEAD]">Loading market data...</li>
        ) : currentMovers.length === 0 ? (
          <li className="py-8 text-center text-sm text-[#A1BEAD]">No market data available</li>
        ) : (
          currentMovers.map((q) => <MarketMoverItem key={q.symbol} mover={toMover(q)} />)
        )}
      </ul>
    </section>
  );
}
