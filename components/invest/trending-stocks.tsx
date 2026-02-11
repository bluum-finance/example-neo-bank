'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { getTrendingStocks, type TrendingStock } from '@/lib/mock-data';

export function TrendingStocks() {
  const [stocks, setStocks] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingStocks().then((data) => {
      setStocks(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-24 flex items-center justify-center text-muted-foreground text-xs">
                Loading...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Top Trending Stocks
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Market movers and trending opportunities
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0;
          return (
            <Link
              key={stock.symbol}
              href={`/assets/${stock.symbol}`}
              className="block cursor-pointer"
            >
              <Card className="cursor-pointer transition-all hover:shadow-md h-full border border-border bg-card dark:bg-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stock.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">
                      ${stock.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowUp className="h-3 w-3 text-emerald-500 dark:text-emerald-300" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-rose-500 dark:text-rose-300" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isPositive
                            ? 'text-emerald-500 dark:text-emerald-300'
                            : 'text-rose-500 dark:text-rose-300'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

