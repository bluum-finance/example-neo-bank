'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickTrade } from '@/components/trade/quick-trade';
import { TradePositionsPanel } from '@/components/trade/trade-positions-panel';
import { TradeOrderHistory } from '@/components/trade/trade-order-history';
import { useUser } from '@/store/user.store';
import { useAccountStore } from '@/store/account.store';

function TradePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUser();
  const accountId = user?.externalAccountId;

  const fetchPositions = useAccountStore((s) => s.fetchPositions);
  const fetchOrders = useAccountStore((s) => s.fetchOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initialSymbol = searchParams.get('symbol') ?? undefined;
  const initialMarket = searchParams.get('market') ?? undefined;
  const initialSide = (searchParams.get('side') === 'sell' ? 'sell' : searchParams.get('side') === 'buy' ? 'buy' : undefined) as
    | 'buy'
    | 'sell'
    | undefined;

  const refreshData = useCallback(async () => {
    if (!accountId) return;
    setIsRefreshing(true);
    try {
      await Promise.all([fetchPositions(accountId), fetchOrders(accountId)]);
    } finally {
      setIsRefreshing(false);
    }
  }, [accountId, fetchPositions, fetchOrders]);

  useEffect(() => {
    if (!accountId) return;
    void refreshData();
  }, [accountId, refreshData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/invest')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Trade</h1>
          <p className="text-[#9DB9AB] mt-1">Buy or sell stocks and ETFs</p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <QuickTrade
            initialSymbol={initialSymbol}
            initialMarket={initialMarket}
            initialSide={initialSide}
            onOrderPlaced={refreshData}
          />
          <TradePositionsPanel />
        </div>
        <TradeOrderHistory onRefresh={refreshData} isRefreshing={isRefreshing} />
      </section>
    </div>
  );
}

export default function TradeStock() {
  return (
    <Suspense fallback={<div className="text-[#9DB9AB] text-sm py-8">Loading trade…</div>}>
      <TradePageContent />
    </Suspense>
  );
}
