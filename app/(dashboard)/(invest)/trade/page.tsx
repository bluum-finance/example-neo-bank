'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoldingsWidget } from '@/components/invest/holdings-widget';
import { QuickTrade } from '@/components/trade/quick-trade';

export default function TradeStock() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/invest')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Trade Stock</h1>
          <p className="text-muted-foreground mt-1">Buy or sell stocks</p>
        </div>
      </div>

      {/* Quick Trade Component */}
      <QuickTrade />

      {/* Holdings Widget */}
      <HoldingsWidget />
    </div>
  );
}
