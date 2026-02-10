'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Loader2,
  DollarSign,
  Hash,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { getAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { HoldingsWidget } from '@/components/invest/holdings-widget';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  class: string;
  status: string;
  tradable: boolean;
  current_price?: number;
}

export default function TradeStock() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSide = searchParams.get('side') === 'sell' ? 'sell' : 'buy';

  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>(initialSide);
  const [symbolQuery, setSymbolQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetPrice, setAssetPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoLookedUp, setHasAutoLookedUp] = useState(false);

  // Order form state
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderBy, setOrderBy] = useState<'quantity' | 'dollar'>('quantity');
  const [quantity, setQuantity] = useState('');
  const [dollarAmount, setDollarAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  // Get account ID and positions on mount
  useEffect(() => {
    const loadAccount = async () => {
      try {
        const user = getAuth();
        const accId = user?.externalAccountId;

        if (!accId) {
          toast.error('No investment account found. Please create an account first.');
          router.push('/invest');
          return;
        }

        setAccountId(accId);
        // Load positions for sell orders
        if (orderSide === 'sell') {
          setLoadingPositions(true);
          try {
            const positionsData = await InvestmentService.getPositions(accId);
            setPositions(positionsData);
          } catch (error) {
            console.error('Error loading positions:', error);
            setPositions([]);
          } finally {
            setLoadingPositions(false);
          }
        }
      } catch (error) {
        toast.error('Failed to load account');
        router.push('/invest');
      }
    };

    loadAccount();
  }, [router, orderSide]);

  // When switching to sell, load positions
  useEffect(() => {
    if (orderSide === 'sell' && accountId) {
      setLoadingPositions(true);
      InvestmentService.getPositions(accountId)
        .then(setPositions)
        .catch((error) => {
          console.error('Error loading positions:', error);
          setPositions([]);
        })
        .finally(() => {
          setLoadingPositions(false);
        });
    } else {
      setPositions([]);
      setSelectedPosition(null);
      setLoadingPositions(false);
    }
  }, [orderSide, accountId]);

  // Load asset by symbol
  const handleLookupAsset = useCallback(
    async (symbol: string) => {
      if (!symbol || symbol.trim().length === 0) {
        setError('Please enter a symbol');
        return;
      }

      const symbolUpper = symbol.trim().toUpperCase();
      setLoading(true);
      setError(null);
      setSelectedAsset(null);
      setAssetPrice(null);
      setSelectedPosition(null);

      try {
        const assetData = await InvestmentService.getAssetBySymbol(symbolUpper);

        // Map the asset data to our Asset interface
        const asset: Asset = {
          id: assetData.id || symbolUpper,
          symbol: assetData.symbol || symbolUpper,
          name: assetData.name || assetData.display_name || symbolUpper,
          class: assetData.class || assetData.asset_class || '',
          status: assetData.status || 'active',
          tradable: assetData.tradable !== false,
          current_price: assetData.current_price || assetData.price,
        };

        setSelectedAsset(asset);
        setSymbolQuery(asset.symbol);

        // Extract price from asset data
        if (assetData?.current_price) {
          setAssetPrice(
            typeof assetData.current_price === 'number'
              ? assetData.current_price
              : parseFloat(assetData.current_price)
          );
        } else if (assetData?.price) {
          setAssetPrice(
            typeof assetData.price === 'number' ? assetData.price : parseFloat(assetData.price)
          );
        } else if (assetData?.data?.current_price) {
          setAssetPrice(
            typeof assetData.data.current_price === 'number'
              ? assetData.data.current_price
              : parseFloat(assetData.data.current_price)
          );
        } else if (assetData?.data?.price) {
          setAssetPrice(
            typeof assetData.data.price === 'number'
              ? assetData.data.price
              : parseFloat(assetData.data.price)
          );
        }

        // If selling, check if we have a position
        if (orderSide === 'sell') {
          const position = positions.find((p) => p.symbol === asset.symbol);
          if (position) {
            setSelectedPosition(position);
            setQuantity(position.shares.toString());
            setOrderBy('quantity');
          }
        }
      } catch (error: any) {
        console.error('Error loading asset:', error);
        const errorMessage = error.message || 'Failed to load asset';
        setError(`Asset "${symbolUpper}" not found. Please check the symbol and try again.`);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [orderSide, positions]
  );

  // Auto-lookup symbol from query parameter
  useEffect(() => {
    const symbolParam = searchParams.get('symbol');
    if (
      symbolParam &&
      symbolParam.trim().length > 0 &&
      !selectedAsset &&
      !hasAutoLookedUp &&
      accountId &&
      (orderSide === 'buy' || (orderSide === 'sell' && positions.length >= 0))
    ) {
      setHasAutoLookedUp(true);
      setSymbolQuery(symbolParam);
      // Small delay to ensure positions are loaded for sell orders
      const timer = setTimeout(
        () => {
          handleLookupAsset(symbolParam);
        },
        orderSide === 'sell' ? 200 : 0
      );
      return () => clearTimeout(timer);
    }
  }, [
    searchParams,
    handleLookupAsset,
    selectedAsset,
    accountId,
    orderSide,
    positions.length,
    hasAutoLookedUp,
  ]);

  // Handle Enter key press in symbol input
  const handleSymbolKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookupAsset(symbolQuery);
    }
  };

  // Calculate order values
  const calculateOrderValues = () => {
    const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : assetPrice;

    if (!price) {
      if (orderBy === 'dollar' && dollarAmount) {
        return { quantity: 0, total: parseFloat(dollarAmount) };
      } else if (orderBy === 'quantity' && quantity) {
        return { quantity: parseFloat(quantity), total: 0 };
      }
      return { quantity: 0, total: 0 };
    }

    if (orderBy === 'dollar' && dollarAmount) {
      const amount = parseFloat(dollarAmount);
      const qty = amount / price;
      return { quantity: qty, total: amount };
    } else if (orderBy === 'quantity' && quantity) {
      const qty = parseFloat(quantity);
      const total = qty * price;
      return { quantity: qty, total };
    }

    return { quantity: 0, total: 0 };
  };

  const { quantity: calculatedQuantity, total: calculatedTotal } = calculateOrderValues();

  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedAsset || !accountId) {
      toast.error('Please select a stock and ensure you have an account');
      return;
    }

    // For sell orders, validate we have enough shares
    if (orderSide === 'sell') {
      if (!quantity) {
        toast.error('Please enter a quantity');
        return;
      }

      const qty = parseFloat(quantity);
      const position = positions.find((p) => p.symbol === selectedAsset.symbol);
      if (!position || position.shares < qty) {
        toast.error(`You don't have enough shares. You own ${position?.shares || 0} shares.`);
        return;
      }
    } else {
      // For buy orders
      if (orderBy === 'dollar' && !dollarAmount) {
        toast.error('Please enter a dollar amount');
        return;
      }

      if (orderBy === 'quantity' && !quantity) {
        toast.error('Please enter a quantity');
        return;
      }
    }

    if (orderType === 'limit' && !limitPrice) {
      toast.error('Please enter a limit price');
      return;
    }

    setPlacingOrder(true);

    try {
      const orderData: any = {
        symbol: selectedAsset.symbol,
        side: orderSide,
        type: orderType,
        time_in_force: 'day',
      };

      // For sell orders, only quantity is allowed
      if (orderSide === 'sell') {
        const qtyValue = parseFloat(quantity);
        orderData.qty = !isNaN(qtyValue) ? qtyValue.toFixed(4) : '0.0000';
      } else {
        // For buy orders, can use dollar amount or quantity
        if (orderBy === 'dollar') {
          const dollarValue = parseFloat(dollarAmount);
          orderData.notional = !isNaN(dollarValue) ? dollarValue.toFixed(2) : '0.00';
        } else {
          const qtyValue = parseFloat(quantity);
          orderData.qty = !isNaN(qtyValue) ? qtyValue.toFixed(4) : '0.0000';
        }
      }

      if (orderType === 'limit') {
        const limitValue = parseFloat(limitPrice);
        orderData.limit_price = !isNaN(limitValue) ? limitValue.toFixed(2) : '0.00';
      }

      await InvestmentService.placeOrder(accountId, orderData);
      toast.success(`${orderSide === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
      router.push('/invest');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to place order';
      toast.error(errorMessage);
      console.error('Order error:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Reset form when switching sides
  const handleSideChange = (side: 'buy' | 'sell') => {
    setOrderSide(side);
    setSelectedAsset(null);
    setSelectedPosition(null);
    setQuantity('');
    setDollarAmount('');
    setLimitPrice('');
    setSymbolQuery('');
    setAssetPrice(null);
    setError(null);
    setOrderBy('quantity');
  };

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

      <div className="grid gap-6">
        {/* Left Column: Asset Lookup and Stock Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lookup Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buy/Sell Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={orderSide === 'buy' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleSideChange('buy')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={orderSide === 'sell' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleSideChange('sell')}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Sell
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter symbol (e.g., AAPL, MSFT)"
                    value={symbolQuery}
                    onChange={(e) => {
                      setSymbolQuery(e.target.value);
                      setError(null);
                    }}
                    onKeyPress={handleSymbolKeyPress}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  className="w-24"
                  onClick={() => handleLookupAsset(symbolQuery)}
                  disabled={loading || !symbolQuery.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>
              )}

              {/* Selected Stock */}
              {selectedAsset && (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedAsset.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{selectedAsset.name}</p>
                    </div>
                    {orderSide === 'buy' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  {assetPrice !== null ? (
                    <div className="mt-2">
                      <p className="text-2xl font-bold">${assetPrice.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Current Price</p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Price will be determined at market execution
                      </p>
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">Loading details...</span>
                    </div>
                  )}
                  <div className="mt-4 flex justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/assets/${selectedAsset.symbol}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Owned Assets List - Only show on sell side if user owns assets */}
              {orderSide === 'sell' && (loadingPositions || positions.length > 0) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your Holdings</Label>
                    {loadingPositions ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">
                          Loading your holdings...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {positions.map((position) => (
                          <button
                            key={position.symbol}
                            type="button"
                            onClick={() => {
                              setSymbolQuery(position.symbol);
                              handleLookupAsset(position.symbol);
                            }}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${
                              selectedAsset?.symbol === position.symbol
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {position.symbol}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {position.shares}{' '}
                                    {position.shares === 1 ? 'share' : 'shares'}
                                  </Badge>
                                </div>
                                {position.name && position.name !== position.symbol && (
                                  <p className="text-xs text-muted-foreground">
                                    {position.name}
                                  </p>
                                )}

                                {position.value != null && (
                                  <div className="text-sm font-medium text-muted-foreground mt-2">
                                    ${position.value.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div className="text-right ml-4">
                                {position.currentPrice != null && (
                                  <div className="font-medium text-sm">
                                    ${position.currentPrice.toFixed(2)}
                                  </div>
                                )}

                                {position.gain != null && position.gainPercent != null && (
                                  <div
                                    className={`text-xs font-medium mt-1 ${
                                      position.gain >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {position.gain >= 0 ? '+' : ''}
                                    {position.gainPercent.toFixed(2)}%
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Place {orderSide === 'buy' ? 'Buy' : 'Sell'} Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedAsset ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Select a stock to place an order</p>
                </div>
              ) : (
                <>
                  {/* Order Type */}
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
                    >
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </Select>
                  </div>

                  {/* Limit Price (if limit order) */}
                  {orderType === 'limit' && (
                    <div className="space-y-2">
                      <Label>Limit Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Order By - Only for buy orders */}
                  {orderSide === 'buy' && (
                    <div className="space-y-2">
                      <Label>Order By</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={orderBy === 'quantity' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setOrderBy('quantity')}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          Quantity
                        </Button>

                        <Button
                          type="button"
                          variant={orderBy === 'dollar' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setOrderBy('dollar')}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Dollar Amount
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Dollar Amount Input - Only for buy orders */}
                  {orderSide === 'buy' && orderBy === 'dollar' && (
                    <div className="space-y-2">
                      <Label>Dollar Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={dollarAmount}
                        onChange={(e) => setDollarAmount(e.target.value)}
                      />
                      {dollarAmount && (
                        <p className="text-xs text-muted-foreground">
                          {calculatedQuantity > 0
                            ? `≈ ${calculatedQuantity.toFixed(4)} shares`
                            : 'Shares will be calculated at execution'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quantity Input - Show for sell orders or buy orders when orderBy is quantity */}
                  {(orderSide === 'sell' ||
                    (orderSide === 'buy' && orderBy === 'quantity')) && (
                    <div className="space-y-2">
                      <Label>Quantity (Shares)</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={orderSide === 'sell' && selectedAsset && !selectedPosition}
                      />
                      {orderSide === 'sell' && selectedAsset && !selectedPosition && (
                        <p className="text-xs text-destructive">
                          You don't have a position in {selectedAsset.symbol}. You can only
                          sell assets you own.
                        </p>
                      )}
                      {orderSide === 'sell' && selectedPosition && (
                        <p className="text-xs text-muted-foreground">
                          You own {selectedPosition.shares} shares
                        </p>
                      )}
                      {orderSide === 'buy' && orderBy === 'quantity' && quantity && (
                        <p className="text-xs text-muted-foreground">
                          {calculatedTotal > 0
                            ? `≈ $${
                                !isNaN(calculatedTotal) ? calculatedTotal.toFixed(2) : '0.00'
                              } total`
                            : 'Total will be calculated at execution'}
                        </p>
                      )}
                      {orderSide === 'sell' && quantity && assetPrice && (
                        <p className="text-xs text-muted-foreground">
                          ≈ $
                          {!isNaN(parseFloat(quantity) * assetPrice)
                            ? (parseFloat(quantity) * assetPrice).toFixed(2)
                            : '0.00'}{' '}
                          total
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Order Summary */}
                  {(dollarAmount || quantity) && (
                    <div className="space-y-2 p-4 bg-muted/30 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shares:</span>
                        <span className="font-medium">
                          {orderSide === 'buy' && orderBy === 'dollar'
                            ? calculatedQuantity > 0
                              ? calculatedQuantity.toFixed(4)
                              : 'TBD'
                            : parseFloat(quantity || '0').toFixed(4)}
                        </span>
                      </div>
                      {(assetPrice || (orderType === 'limit' && limitPrice)) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price per share:</span>
                          <span className="font-medium">
                            {orderType === 'limit' && limitPrice
                              ? `$${
                                  !isNaN(parseFloat(limitPrice))
                                    ? parseFloat(limitPrice).toFixed(2)
                                    : '0.00'
                                }`
                              : assetPrice != null
                              ? `$${assetPrice.toFixed(2)}`
                              : 'Market Price'}
                          </span>
                        </div>
                      )}
                      {calculatedTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated total:</span>
                          <span className="font-semibold">
                            ${!isNaN(calculatedTotal) ? calculatedTotal.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      )}
                      {orderSide === 'sell' &&
                        quantity &&
                        assetPrice &&
                        calculatedTotal === 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Estimated total:</span>
                            <span className="font-semibold">
                              $
                              {!isNaN(parseFloat(quantity) * assetPrice)
                                ? (parseFloat(quantity) * assetPrice).toFixed(2)
                                : '0.00'}
                            </span>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !accountId}
                    className={`w-full ${
                      orderSide === 'buy'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    size="lg"
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        {orderSide === 'buy' ? (
                          <TrendingUp className="h-4 w-4 mr-2" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-2" />
                        )}
                        Place {orderSide === 'buy' ? 'Buy' : 'Sell'} Order
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Holdings Widget */}
      <HoldingsWidget />
    </div>
  );
}
