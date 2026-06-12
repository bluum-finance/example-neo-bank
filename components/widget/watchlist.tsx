'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Star, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { assetDetailHref } from '@/lib/market';
import { InvestmentService, type AssetQuote } from '@/services/investment.service';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';
import { useUserStore } from '@/store/user.store';
import { isAssetDemo } from '@/lib/demo-mode';
import { DEFAULT_WATCHLIST_SYMBOLS, getDemoWatchlistQuotes } from '@/lib/demo/assets';
import { toast } from 'sonner';

const WATCHLIST_FALLBACK = getDemoWatchlistQuotes(DEFAULT_WATCHLIST_SYMBOLS);

interface WatchlistItemProps {
  name: string;
  symbol: string;
  market?: string;
  price: string;
  change: string;
  isPositive: boolean;
  onRemove?: (symbol: string) => void;
}

function WatchlistItem({ name, symbol, market, price, change, isPositive, onRemove }: WatchlistItemProps) {
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/5 active:bg-white/10 cursor-pointer">
      <Link href={assetDetailHref(symbol, market)} className="flex items-center justify-between flex-1">
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
      const symbolsToFetch =
        watchlistSymbols && watchlistSymbols.length > 0 ? watchlistSymbols : [...DEFAULT_WATCHLIST_SYMBOLS];
      try {
        setLoading(true);
        const data = await InvestmentService.getAssetQuotes(symbolsToFetch);
        setQuotes(data);
      } catch (err) {
        console.error('Failed to fetch watchlist quotes', err);
        setQuotes(
          isAssetDemo()
            ? getDemoWatchlistQuotes(symbolsToFetch)
            : WATCHLIST_FALLBACK.filter((f) => f.symbol != null && symbolsToFetch.includes(f.symbol))
        );
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

  const items: WatchlistItemProps[] = (
    quotes.length > 0 ? quotes : isAssetDemo() ? getDemoWatchlistQuotes([...DEFAULT_WATCHLIST_SYMBOLS]) : WATCHLIST_FALLBACK
  ).map((q) => ({
    name: q.name || q.symbol || '',
    symbol: q.symbol ?? '',
    market: q.market,
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
          items.map((item, index) => (
            <WatchlistItem key={`${item.symbol}-${index}`} {...item} onRemove={item.onRemove} />
          ))
        )}
      </ul>
    </section>
  );
}
