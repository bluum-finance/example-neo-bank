'use client';

import { useCallback, useEffect } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAccountStore, useOrders, useOrdersLoading } from '@/store/account.store';
import { useUser } from '@/store/user.store';
import { isTradingDemo } from '@/lib/demo-mode';
import { resolveDemoInvestorKey } from '@/lib/demo/trading-store';
import { OrderStatusBadge, formatOrderDate } from '@/components/trade/order-display';

const MAX_RECENT_TRADES = 5;

export function RecentTrades() {
  const user = useUser();
  const accountRecord = useAccountStore((state) => state.account);
  const fetchOrders = useAccountStore((state) => state.fetchOrders);
  const orders = useOrders();
  const isLoading = useOrdersLoading();

  const investorKey = resolveDemoInvestorKey(user?.externalAccountId ?? user?.email ?? 'local-demo');
  const accountId = isTradingDemo() ? investorKey : (accountRecord?.id ?? user?.externalAccountId ?? investorKey);

  const loadOrders = useCallback(() => {
    if (!accountId) return;
    void fetchOrders(accountId, { limit: MAX_RECENT_TRADES });
  }, [accountId, fetchOrders]);

  useEffect(() => {
    if (!isTradingDemo()) return;
    const onDemoUpdate = () => loadOrders();
    window.addEventListener('demo-trading-updated', onDemoUpdate);
    return () => window.removeEventListener('demo-trading-updated', onDemoUpdate);
  }, [loadOrders]);

  const recentOrders = orders.slice(0, MAX_RECENT_TRADES);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#1E3D2F] bg-[#0F2A20]">
      <div className="flex mb-2 shrink-0 items-center justify-between border-[#1E3D2F] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Recent Trades</h2>
        </div>
        <Link
          href="/trade"
          className="flex items-center gap-1 text-[11px] font-semibold text-[#9DB9AB] transition-colors hover:text-white"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto">
        {isLoading && recentOrders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#57B75C]" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-semibold text-white">No orders yet</p>
            <p className="mt-1 text-xs text-[#9DB9AB]">Place a trade to see your order history here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[#1E3D2F]/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-[#07120F]/50">
                  <td className="px-5 py-4">
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
