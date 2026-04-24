'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { InvestmentService, type AssetQuote } from '@/services/investment.service';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';
import { useUserStore } from '@/store/user.store';
import { toast } from 'sonner';

const DEFAULT_WATCHLIST_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'META', 'MSFT'];
const FALLBACK_DATA = [
  { name: 'Apple Inc.', symbol: 'AAPL', price: 176.35, change: 2.12, changePercent: 1.2 },
  { name: 'Tesla, Inc.', symbol: 'TSLA', price: 250.65, change: -2.01, changePercent: -0.8 },
  { name: 'Nvidia Corp.', symbol: 'NVDA', price: 501.12, change: 17.04, changePercent: 3.5 },
  { name: 'Meta Platforms', symbol: 'META', price: 312.45, change: 13.12, changePercent: 4.2 },
  { name: 'Microsoft Corp.', symbol: 'MSFT', price: 380.25, change: 5.32, changePercent: 1.4 },
];

interface WatchlistItemProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  onRemove?: (symbol: string) => void;
}

function WatchlistItem({ name, symbol, price, change, isPositive, onRemove }: WatchlistItemProps) {
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/5 active:bg-white/10 cursor-pointer">
      <Link href={`/assets/${symbol.toLowerCase()}`} className="flex items-center justify-between flex-1">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-normal text-white leading-tight">{name}</h3>
          <p className="text-xs font-light text-[#A1BEAD] uppercase tracking-wide">{symbol}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 tabular-nums">
          <p className="text-sm font-normal text-white">{price}</p>
          {change !== '—' ? (
            <div className={cn('flex items-center gap-1 text-xs font-normal', isPositive ? 'text-[#30D158]' : 'text-[#FF5F5F]')}>
              <Icon className="h-3 w-3 stroke-3" />
              <span>{isPositive && !change.startsWith('+') && !change.startsWith('0') ? `+${change}` : change}</span>
            </div>
          ) : (
            <span className="text-xs font-normal text-[#A1BEAD]">—</span>
          )}
        </div>
      </Link>
    </div>
  );
}

export function Watchlist() {
  const [quotes, setQuotes] = useState<AssetQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const { displayAmount } = useCurrency();
  const watchlistSymbols = useUserStore((state) => state.user?.watchlistSymbols);
  const removeFromWatchlist = useUserStore((state) => state.removeFromWatchlist);

  useEffect(() => {
    const fetchQuotes = async () => {
      const symbolsToFetch = watchlistSymbols && watchlistSymbols.length > 0 ? watchlistSymbols : DEFAULT_WATCHLIST_SYMBOLS;
      try {
        setLoading(true);
        const data = await InvestmentService.getAssetQuotes(symbolsToFetch);
        setQuotes(data);
      } catch (err) {
        console.error('Failed to fetch watchlist quotes, using fallback', err);
        setQuotes(FALLBACK_DATA.filter((f) => symbolsToFetch.includes(f.symbol)));
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [watchlistSymbols]);

  const formatPrice = (quote: AssetQuote) => {
    if (quote.price != null) {
      return displayAmount(quote.price, quote.currency as CurrencyCode);
    }
    return '—';
  };

  const formatChange = (quote: AssetQuote) => {
    if (quote.changePercent != null) {
      const sign = quote.changePercent >= 0 ? '+' : '';
      return `${sign}${quote.changePercent.toFixed(2)}%`;
    }
    return '—';
  };

  const items: WatchlistItemProps[] = (quotes.length > 0 ? quotes : FALLBACK_DATA).map((q) => ({
    name: q.name || q.symbol,
    symbol: q.symbol,
    price: formatPrice(q),
    change: formatChange(q),
    isPositive: (q.changePercent ?? 0) >= 0,
    onRemove: (sym: string) => {
      removeFromWatchlist(sym);
      toast.info(`${sym} removed from watchlist`);
    },
  }));

  return (
    <section className="flex w-full flex-col rounded-xl border border-[#1E3D2F] bg-[#0F2A20] p-6 shadow-sm transition-all hover:border-[#2a5240]">
      <header className="mb-6 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#30D158]" />
          <h2 className="text-base font-normal text-white tracking-tight">Watchlist</h2>
        </div>
        <Star className="h-4 w-4 text-[#30D158]" />
      </header>

      <ul className="flex flex-col gap-1">
        {loading ? (
          <li className="py-8 text-center text-sm text-[#A1BEAD]">Loading quotes...</li>
        ) : (
          items.map((item) => <WatchlistItem key={item.symbol} {...item} onRemove={item.onRemove} />)
        )}
      </ul>
    </section>
  );
}
