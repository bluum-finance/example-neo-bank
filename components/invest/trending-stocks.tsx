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
        <h2 className="text-2xl font-bold" style={{ color: '#081c14' }}>
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
              href={`/invest/assets/${stock.symbol}`}
              className="block"
            >
              <Card
                className="cursor-pointer transition-all hover:shadow-md h-full"
                style={{ backgroundColor: '#edf9cd', borderColor: '#edf9cd' }}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#081c14' }}>
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stock.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-semibold" style={{ color: '#081c14' }}>
                      ${stock.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
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

