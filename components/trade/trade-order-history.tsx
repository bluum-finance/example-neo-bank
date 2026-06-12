'use client';

import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrders, useAccountStore } from '@/store/account.store';
import type { ExternalOrderStatus } from '@/lib/bluum-api.types';

function OrderStatusBadge({ status }: { status: ExternalOrderStatus | string }) {
  const cfg: Record<string, { label: string; classes: string; dot: string }> = {
    filled: { label: 'Filled', classes: 'text-[#30D158]', dot: 'bg-[#30D158]' },
    partial: { label: 'Partial', classes: 'text-blue-400', dot: 'bg-blue-400' },
    open: { label: 'Open', classes: 'text-sky-400', dot: 'bg-sky-400' },
    pending: { label: 'Pending', classes: 'text-amber-400', dot: 'bg-amber-400' },
    cancelled: { label: 'Cancelled', classes: 'text-[#9DB9AB]', dot: 'bg-[#9DB9AB]/40' },
    failed: { label: 'Failed', classes: 'text-red-400', dot: 'bg-red-400' },
  };

  const { label, classes, dot } = cfg[status] ?? {
    label: status.replace(/_/g, ' '),
    classes: 'text-[#9DB9AB]',
    dot: 'bg-[#9DB9AB]/40',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase', classes)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />
      {label}
    </span>
  );
}

function formatOrderDate(created?: number | null) {
  if (!created) return '—';
  try {
    return new Date(created * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

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
          <p className="text-[11px] text-[#9DB9AB] mt-0.5 tracking-wide">Recent orders across all assets</p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9DB9AB] hover:text-white border border-[#1F4536] rounded-lg px-2.5 py-1.5 hover:bg-[#1F4536]/40 transition-colors disabled:opacity-50"
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
            <p className="text-xs text-[#9DB9AB] mt-1">Place a trade to see your order history here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#0F2A20]">
              <tr className="border-b border-[#1E3D2F] text-[10px] uppercase tracking-wider text-[#9DB9AB]">
                <th className="text-left px-5 py-3 font-semibold">Symbol</th>
                <th className="text-left px-3 py-3 font-semibold">Side</th>
                <th className="text-left px-3 py-3 font-semibold">Type</th>
                <th className="text-right px-3 py-3 font-semibold">Qty</th>
                <th className="text-right px-3 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3D2F]/60">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#07120F]/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/assets/${order.symbol.toLowerCase()}`}
                      className="font-mono font-bold text-white hover:text-[#57B75C] transition-colors"
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
                  <td className="px-5 py-3 text-right text-[#9DB9AB] text-xs tabular-nums">
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
