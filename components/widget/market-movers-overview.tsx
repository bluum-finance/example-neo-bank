'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { InvestmentService, type AssetQuote } from '@/services/investment.service';
import { assetDetailHref } from '@/lib/market';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';
import { isAssetDemo } from '@/lib/demo-mode';

const GAINERS: AssetQuote[] = [
  { symbol: 'AMD', name: 'AMD Inc.', price: 115.2, change: 3.23, changePercent: 2.8, market: 'XNAS', currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms', price: 312.45, change: 13.12, changePercent: 4.2, market: 'XNAS', currency: 'USD' },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: 501.12, change: 17.04, changePercent: 3.5, market: 'XNAS', currency: 'USD' },
  { symbol: 'MTNN', name: 'MTN Nigeria', price: 185.0, change: 4.5, changePercent: 2.5, market: 'XNSA', currency: 'NGN' },
  { symbol: 'SCOM', name: 'Safaricom', price: 28.5, change: 0.35, changePercent: 1.24, market: 'XNAI', currency: 'KES' },
];

const LOSERS: AssetQuote[] = [
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 250.65, change: -2.01, changePercent: -0.8, market: 'XNYS', currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 176.35, change: -2.12, changePercent: -1.2, market: 'XNAS', currency: 'USD' },
  { symbol: 'NFLX', name: 'Netflix', price: 420.1, change: -5.04, changePercent: -1.2, market: 'XNAS', currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.3, change: -4.12, changePercent: -2.9, market: 'XNAS', currency: 'USD' },
  { symbol: 'EQTY', name: 'Equity Group Holdings', price: 52.75, change: -0.85, changePercent: -1.59, market: 'XNAI', currency: 'KES' },
];

const MOVER_SYMBOLS = ['META', 'NVDA', 'AMD', 'MTNN', 'SCOM', 'TSLA', 'AAPL', 'NFLX', 'GOOGL', 'EQTY'];

interface MarketMover {
  symbol: string;
  name: string;
  category: string;
  market?: string;
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
    <Link href={assetDetailHref(mover.symbol, mover.market)} className="group flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-opacity hover:opacity-90 cursor-pointer">
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
        console.error('Failed to fetch market mover quotes', err);
        if (!isAssetDemo()) {
          setQuotes([...GAINERS, ...LOSERS]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const { gainers, losers } = useMemo(() => {
    // Use live quotes if available, updating the fixed lists with live prices
    if (quotes.length > 0) {
      const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
      const liveGainers = GAINERS.map((g) => quoteMap.get(g.symbol) || g);
      const liveLosers = LOSERS.map((l) => quoteMap.get(l.symbol) || l);
      return { gainers: liveGainers, losers: liveLosers };
    }
    return { gainers: GAINERS, losers: LOSERS };
  }, [quotes]);

  const toMover = (q: AssetQuote): MarketMover => ({
    symbol: q.symbol ?? '',
    name: q.name || q.symbol || '',
    category: q.currency ?? q.symbol ?? '',
    market: q.market,
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
          currentMovers.map((q, index) => (
            <MarketMoverItem key={`${activeTab}-${q.symbol}-${index}`} mover={toMover(q)} />
          ))
        )}
      </ul>
    </section>
  );
}
