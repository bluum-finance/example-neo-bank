'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, DollarSign, BarChart3, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { MarketDataAsset } from '@/lib/bluum-api.types';
import { InvestmentService } from '@/services/investment.service';
import { toast } from 'sonner';
import TradingViewChart from '@/components/invest/trading-view-chart';
import { useCurrency, type CurrencyCode } from '@/lib/hooks/use-currency';
import { useUserStore } from '@/store/user.store';

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string)?.toUpperCase();

  const [asset, setAsset] = useState<MarketDataAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load asset details
  useEffect(() => {
    const loadAsset = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        setError(null);

        const assetData = await InvestmentService.getAssetBySymbol(symbol);
        setAsset(assetData);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load asset';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [symbol]);

  const currentPrice = asset?.price;
  const priceChange = asset?.change ?? 0;
  const priceChangePercent = asset?.changePercent ?? 0;
  const isPositive = priceChange >= 0;
  const { displayAmount } = useCurrency();

  const watchlistSymbols = useUserStore((state) => state.user?.watchlistSymbols);
  const addToWatchlist = useUserStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useUserStore((state) => state.removeFromWatchlist);
  const isInWatchlist = !!symbol && watchlistSymbols?.includes(symbol);

  const toggleWatchlist = () => {
    if (!symbol) return;
    const upper = symbol.toUpperCase();
    if (isInWatchlist) {
      removeFromWatchlist(upper);
      toast.info(`${upper} removed from watchlist`);
    } else {
      addToWatchlist(upper);
      toast.success(`${upper} added to watchlist`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/invest')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Asset Details</h1>
            <p className="text-muted-foreground mt-1">View asset information and price history</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">{error || 'Asset not found'}</p>
            <Button onClick={() => router.push('/invest')} variant="outline">
              Back to Portfolio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displaySymbol = asset.symbol ?? symbol;
  const displayName = asset.name ?? asset.display_name ?? displaySymbol;
  const assetClass = asset.class ?? asset.asset_class;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/invest')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{displaySymbol}</h1>
          <p className="text-muted-foreground mt-1">{displayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleWatchlist}
            className={isInWatchlist ? 'border-yellow-500 text-yellow-500' : ''}
            aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Star className="h-4 w-4" fill={isInWatchlist ? 'currentColor' : 'none'} />
          </Button>
          <Button
            onClick={() => {
              const qs = new URLSearchParams({ side: 'buy', symbol: displaySymbol });
              if (asset?.market) qs.set('market', asset.market);
              router.push(`/trade?${qs.toString()}`);
            }}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trade Asset
          </Button>
        </div>
      </div>

      {/* Asset Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold mt-1">
                  {currentPrice != null ? displayAmount(currentPrice, asset.currency as CurrencyCode) : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <div className="flex items-center gap-2 mt-1">
                  {isPositive ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                  <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChange >= 0 ? '+' : '-'}
                    {displayAmount(Math.abs(priceChange), asset.currency as CurrencyCode)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Change %</p>
                <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChangePercent >= 0 ? '+' : ''}
                  {priceChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Previous Close</p>
                <p className="text-2xl font-bold mt-1">
                  {asset.previousClose != null ? displayAmount(asset.previousClose, asset.currency as CurrencyCode) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-medium">{displaySymbol}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-right">{displayName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asset Class</span>
              <Badge variant="outline">{assetClass || 'N/A'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.bidPrice != null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bid Price</span>
                  <span className="font-medium">{displayAmount(asset.bidPrice, asset.currency as CurrencyCode)}</span>
                </div>
                <Separator />
              </>
            )}
            {asset.askPrice != null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ask Price</span>
                  <span className="font-medium">{displayAmount(asset.askPrice, asset.currency as CurrencyCode)}</span>
                </div>
                {asset.bidPrice != null && <Separator />}
              </>
            )}
            {asset.bidPrice != null && asset.askPrice != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spread</span>
                <span className="font-medium">{displayAmount(asset.askPrice - asset.bidPrice, asset.currency as CurrencyCode)}</span>
              </div>
            )}
            {!asset.bidPrice && !asset.askPrice && (
              <p className="text-sm text-muted-foreground text-center py-4">Market data not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden gap-4">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Price History</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] w-full">
            <TradingViewChart symbol={symbol} theme="light" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
