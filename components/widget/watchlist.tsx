import { TrendingUp, TrendingDown, Activity, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistItemProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
}

/**
 * Individual watchlist item component.
 * Uses semantic HTML and clean Tailwind classes to replace nested flex wrappers.
 */
function WatchlistItem({ name, symbol, price, change, isPositive }: WatchlistItemProps) {
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <li className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/5 active:bg-white/10 cursor-pointer">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-normal text-white leading-tight">{name}</h3>
        <p className="text-xs font-light text-[#A1BEAD] uppercase tracking-wide">{symbol}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 tabular-nums">
        <p className="text-sm font-normal text-white">{price}</p>
        <div className={cn('flex items-center gap-1 text-xs font-normal', isPositive ? 'text-[#30D158]' : 'text-[#FF5F5F]')}>
          <Icon className="h-3 w-3 stroke-[3]" />
          <span>{isPositive && !change.startsWith('+') && !change.startsWith('0') ? `+${change}` : change}</span>
        </div>
      </div>
    </li>
  );
}

/**
 * Watchlist component providing a summary of tracked assets.
 */
export function Watchlist() {
  const stocks = [
    { name: 'Dangote Cement Plc', symbol: 'DANGCEM', price: '₦799.90', change: '0.16%', isPositive: true },
    { name: 'Safaricom Plc', symbol: 'SCOM', price: 'KES 19.80', change: '0.16%', isPositive: true },
    { name: 'Apple Inc.', symbol: 'AAPL', price: '$178.35', change: '1.2%', isPositive: true },
    { name: 'Tesla, Inc.', symbol: 'TSLA', price: '$245.60', change: '-0.8%', isPositive: false },
    { name: 'Nvidia Corp.', symbol: 'NVDA', price: '$460.12', change: '3.5%', isPositive: true },
  ];

  return (
    <section className="flex w-full flex-col rounded-xl border border-[#1E3D2F] bg-[#0F2A20] p-6 shadow-sm transition-all hover:border-[#2a5240]">
      <header className="mb-6 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#30D158]" />
          <h2 className="text-base font-normal text-white tracking-tight">Watchlist</h2>
        </div>
        <Pencil className="h-4 w-4 text-[#30D158]" />
      </header>

      <ul className="flex flex-col gap-1">
        {stocks.map((stock) => (
          <WatchlistItem key={stock.symbol} {...stock} />
        ))}
      </ul>
    </section>
  );
}
