'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/lib/hooks/use-currency';
import { usePositions, useAccountStore } from '@/store/account.store';

function parseDecimal(value?: string | null): number {
  return parseFloat(value || '0') || 0;
}

export function TradePositionsPanel() {
  const positions = usePositions();
  const isLoading = useAccountStore((s) => s.isPositionsLoading);
  const { displayAmount } = useCurrency();

  const displayPositions = positions.slice(0, 8);
  const totalValue = displayPositions.reduce((sum, p) => sum + parseDecimal(p.market_value), 0);

  const positionsWithMeta = displayPositions.map((p) => {
    const value = parseDecimal(p.market_value);
    const pct = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
    const unrealizedPL = parseDecimal(p.unrealized_pl);
    const unrealizedPct = parseDecimal(p.unrealized_pl_percent);
    return { ...p, value, pct, unrealizedPL, unrealizedPct };
  });

  return (
    <div className="rounded-xl border border-[#1E3D2F] bg-[#0F2A20] overflow-hidden h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E3D2F]">
        <div>
          <h2 className="text-sm font-semibold text-white">My Positions</h2>
          <p className="text-[11px] text-[#9DB9AB] mt-0.5 tracking-wide">Holdings by market value</p>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#57B75C]" />
          </div>
        ) : positionsWithMeta.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <p className="text-sm font-semibold text-white mt-0.5">No positions yet</p>
            <p className="text-xs text-[#9DB9AB] max-w-[200px] leading-relaxed">
              Start trading to see your portfolio here.
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-[#1E3D2F]/60">
              {positionsWithMeta.map((p) => {
                const isGain = p.unrealizedPL >= 0;
                return (
                  <li key={p.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 shrink-0 rounded bg-[#1E3D2F] flex items-center justify-center text-[8px] font-bold text-white uppercase">
                        {p.symbol.slice(0, 4)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/assets/${p.symbol.toLowerCase()}`}
                          className="font-mono font-bold text-sm leading-tight hover:text-[#57B75C] text-white block"
                        >
                          {p.symbol}
                        </Link>
                        <span className="text-[10px] text-[#6B7280]">{p.pct}% allocation</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums font-mono text-white">
                        {displayAmount(p.value, p.currency)}
                      </p>
                      <p className={cn('text-[10px] font-semibold tabular-nums', isGain ? 'text-[#30D158]' : 'text-red-400')}>
                        {isGain ? '+' : ''}{displayAmount(p.unrealizedPL, p.currency)}
                        {p.unrealizedPct !== 0 && (
                          <span className="ml-1 opacity-70">({isGain ? '+' : ''}{p.unrealizedPct.toFixed(2)}%)</span>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {totalValue > 0 && (
              <div className="mt-4 pt-3 border-t border-[#1E3D2F]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#9DB9AB] font-medium uppercase tracking-wider">Total Value</span>
                <span className="font-mono font-bold text-sm tabular-nums text-white">{displayAmount(totalValue)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
