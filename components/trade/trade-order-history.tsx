'use client';

import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrders, useAccountStore } from '@/store/account.store';
import { OrderStatusBadge, formatOrderDate } from '@/components/trade/order-display';

interface TradeOrderHistoryProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TradeOrderHistory({ onRefresh, isRefreshing }: TradeOrderHistoryProps) {
  const orders = useOrders();
  const isLoading = useAccountStore((s) => s.isOrdersLoading);

  return (
    <div className="flex max-h-[min(32rem,calc(100vh-10rem))] flex-col overflow-hidden rounded-xl border border-[#1E3D2F] bg-[#0F2A20] lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[#1E3D2F] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Order History</h2>
          <p className="mt-0.5 text-[11px] tracking-wide text-[#9DB9AB]">Recent orders across all assets</p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-[#1F4536] px-2.5 py-1.5 text-[11px] font-semibold text-[#9DB9AB] transition-colors hover:bg-[#1F4536]/40 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3 w-3', (isRefreshing || isLoading) && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {isLoading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#57B75C]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-semibold text-white">No orders yet</p>
            <p className="mt-1 text-xs text-[#9DB9AB]">Place a trade to see your order history here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#0F2A20]">
              <tr className="border-b border-[#1E3D2F] text-[10px] uppercase tracking-wider text-[#9DB9AB]">
                <th className="px-5 py-3 text-left font-semibold">Symbol</th>
                <th className="px-3 py-3 text-left font-semibold">Side</th>
                <th className="px-3 py-3 text-left font-semibold">Type</th>
                <th className="px-3 py-3 text-right font-semibold">Qty</th>
                <th className="px-3 py-3 text-right font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3D2F]/60">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-[#07120F]/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/assets/${order.symbol.toLowerCase()}`}
                      className="font-mono font-bold text-white transition-colors hover:text-[#57B75C]"
                    >
                      {order.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-3 capitalize text-[#A1BEAD]">{order.side}</td>
                  <td className="px-3 py-3 capitalize text-[#A1BEAD]">{order.type}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-white">
                    {order.quantity ? parseFloat(order.quantity).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-right text-xs tabular-nums text-[#9DB9AB]">
                    {formatOrderDate(order.created)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
