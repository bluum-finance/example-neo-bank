'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { InvestmentService, type Position } from '@/services/investment.service';
import { useUser } from '@/store/user.store';

export type AssetCategory = 'all' | 'treasury' | 'stocks' | 'bonds';

interface ExtendedPosition extends Position {
  assetType?: 'Money Market' | 'Ultra-Short Bond' | 'US Equity ETF' | 'Bond ETF' | 'Treasury Bill ETF' | 'Stock';
  category?: AssetCategory;
  todayChange?: number;
  allocation?: number;
  iconColor?: string;
}

export function HoldingsWidget() {
  const [holdings, setHoldings] = useState<ExtendedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const accountId = user?.externalAccountId;

  useEffect(() => {
    const loadHoldings = async () => {
      setLoading(true);
      try {
        if (accountId) {
          // Try to load real positions
          const positions = await InvestmentService.getPositions(accountId);
          if (positions && positions.length > 0) {
            // Transform positions to ExtendedPosition format
            const totalValue = positions.reduce((sum, pos) => sum + (pos.value || 0), 0);
            const extendedPositions: ExtendedPosition[] = positions.map((pos, index) => {
              // Determine category based on symbol/name
              const symbol = pos.symbol.toUpperCase();
              let category: AssetCategory = 'stocks';
              let assetType: ExtendedPosition['assetType'] = 'Stock';
              let iconColor = '#083423'; // default

              if (symbol.includes('TREASURY') || symbol.includes('SGOV') || symbol.includes('JTC')) {
                category = 'treasury';
                assetType = symbol.includes('SGOV') ? 'Treasury Bill ETF' : 'Money Market';
                iconColor = symbol.includes('SGOV') ? '#3B82F6' : '#4B5563';
              } else if (symbol.includes('BND') || symbol.includes('MULSX')) {
                category = 'bonds';
                assetType = symbol.includes('BND') ? 'Bond ETF' : 'Ultra-Short Bond';
                iconColor = symbol.includes('BND') ? '#F97316' : '#9333EA';
              } else if (symbol.includes('VTI')) {
                category = 'stocks';
                assetType = 'US Equity ETF';
                iconColor = '#10B981';
              }

              return {
                ...pos,
                assetType,
                category,
                todayChange: pos.gain || 0,
                allocation: totalValue > 0 ? ((pos.value || 0) / totalValue) * 100 : 0,
                iconColor,
              };
            });
            setHoldings(extendedPositions);
          } else {
            setHoldings([]);
          }
        } else {
          // Use mock data if no account
          setHoldings([]);
        }
      } catch (error) {
        console.error('Failed to load holdings:', error);
        // Fallback to mock data
        setHoldings([]);
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();
  }, [accountId]);

  const filteredHoldings = holdings;

  const totalValue = useMemo(() => {
    return filteredHoldings.reduce((sum, holding) => sum + (holding.value || 0), 0);
  }, [filteredHoldings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getTickerFromSymbol = (symbol: string) => {
    // Extract ticker (first 2-4 letters) from symbol
    return symbol.substring(0, 4).toUpperCase();
  };

  const getAssetTypeLabel = (holding: ExtendedPosition) => {
    if (holding.assetType) return holding.assetType;
    // Fallback logic
    const symbol = holding.symbol.toUpperCase();
    if (symbol.includes('TREASURY') || symbol.includes('SGOV')) return 'Treasury';
    if (symbol.includes('BND') || symbol.includes('BOND')) return 'Bond ETF';
    if (symbol.includes('VTI') || symbol.includes('ETF')) return 'US Equity ETF';
    return 'Stock';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">Loading holdings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredHoldings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No holdings found</div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredHoldings.map((holding, index) => {
                const ticker = getTickerFromSymbol(holding.symbol);
                const isPositive = (holding.todayChange || 0) >= 0;
                const allocation = holding.allocation || 0;

                return (
                  <div
                    key={holding.symbol || index}
                    className="border border-border rounded-xl bg-card dark:bg-card dark:border-border/70 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-10 rounded flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: holding.iconColor || '#083423' }}
                        >
                          {ticker}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{holding.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {holding.symbol}
                            {holding.assetType && ` • ${getAssetTypeLabel(holding)}`}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          isPositive ? 'text-emerald-500 dark:text-emerald-300' : 'text-rose-500 dark:text-rose-300'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(holding.todayChange || 0)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Value</div>
                        <div className="text-foreground font-semibold">{formatCurrency(holding.value || 0)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Shares</div>
                        <div className="text-foreground font-semibold">{formatNumber(holding.shares || 0, 2)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Price</div>
                        <div className="text-foreground font-semibold">{formatCurrency(holding.currentPrice || 0)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Allocation</div>
                        <div className="text-foreground font-semibold">{allocation.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${allocation}%`,
                          backgroundColor: holding.iconColor || '#083423',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left py-3 px-4 font-semibold">ASSET</th>
                  <th className="text-right py-3 px-4 font-semibold">VALUE</th>
                  <th className="text-right py-3 px-4 font-semibold">SHARES</th>
                  <th className="text-right py-3 px-4 font-semibold">PRICE</th>
                  <th className="text-right py-3 px-4 font-semibold">TODAY</th>
                  <th className="text-right py-3 px-4 font-semibold">ALLOCATION</th>
                </tr>
              </thead>
                <tbody>
                {filteredHoldings.map((holding, index) => {
                  const ticker = getTickerFromSymbol(holding.symbol);
                  const isPositive = (holding.todayChange || 0) >= 0;
                  const allocation = holding.allocation || 0;

                  return (
                    <tr
                      key={holding.symbol || index}
                      className="border-b border-border transition-colors hover:bg-muted/40 dark:hover:bg-muted/30"
                    >
                      {/* ASSET */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-12 rounded flex items-center justify-center text-white font-semibold text-sm"
                            style={{ backgroundColor: holding.iconColor || '#083423' }}
                          >
                            {ticker}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{holding.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {holding.symbol}
                              {holding.assetType && ` • ${getAssetTypeLabel(holding)}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VALUE */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-semibold text-foreground">
                          {formatCurrency(holding.value || 0)}
                        </div>
                      </td>

                      {/* SHARES */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-foreground">{formatNumber(holding.shares || 0, 2)}</div>
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-4 text-right">
                        <div className="text-foreground">
                          {formatCurrency(holding.currentPrice || 0)}
                        </div>
                      </td>

                      {/* TODAY */}
                      <td className="py-4 px-4 text-right">
                        <div
                          className={`flex items-center justify-end gap-1 font-medium ${
                            isPositive ? 'text-emerald-500 dark:text-emerald-300' : 'text-rose-500 dark:text-rose-300'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          <span>
                            {isPositive ? '+' : ''}
                            {formatCurrency(holding.todayChange || 0)}
                          </span>
                        </div>
                      </td>

                      {/* ALLOCATION */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex-1 max-w-[100px] h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${allocation}%`,
                                backgroundColor: holding.iconColor || '#083423',
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground min-w-[45px] text-right">
                            {allocation.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
