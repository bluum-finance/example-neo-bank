'use client';

import { useEffect, useState } from 'react';
import {
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNetWorthChartData, type NetWorthDataPoint } from '@/lib/mock-data';
import { TrendingUp, Target, Zap, Calendar } from 'lucide-react';

export function NetWorthChart() {
  const [data, setData] = useState<NetWorthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetWorthChartData().then((chartData) => {
      setData(chartData);
      setLoading(false);
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Target className="h-4 w-4" />;
      case 'action':
        return <Zap className="h-4 w-4" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as NetWorthDataPoint;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{dataPoint.month}</p>
          <p className="text-sm" style={{ color: '#081c14' }}>
            Net Worth: {formatCurrency(dataPoint.netWorth)}
          </p>
          {dataPoint.event && (
            <div className="mt-2 pt-2 border-t flex items-center gap-2">
              {getEventIcon(dataPoint.event.type)}
              <span className="text-xs">{dataPoint.event.label}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentNetWorth = data.length > 0 ? data[data.length - 1].netWorth : 0;
  const startMonth = data.length > 0 ? data[0].month : '';
  const endMonth = data.length > 0 ? data[data.length - 1].month : '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Net Worth Growth</CardTitle>
            <div className="mt-2">
              <p className="text-3xl font-bold" style={{ color: '#081c14' }}>
                {formatCurrency(currentNetWorth)}
              </p>
              <p className="text-sm text-muted-foreground">Current Net Worth</p>
            </div>
          </div>
          <Badge variant="outline" style={{ borderColor: '#081c14', color: '#081c14' }}>
            Example Portfolio
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#081c14" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#edf9cd" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => {
                  // Only show first and last month
                  if (index === 0) return startMonth;
                  if (index === data.length - 1) return endMonth;
                  return '';
                }}
                height={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#081c14"
                strokeWidth={2}
                fill="url(#colorNetWorth)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Event Markers */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t">
            {data
              .filter((d) => d.event)
              .map((dataPoint, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg"
                  style={{ backgroundColor: '#edf9cd' }}
                >
                  <div style={{ color: '#081c14' }}>{getEventIcon(dataPoint.event!.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: '#081c14' }}>
                      {dataPoint.month}
                    </p>
                    <p className="text-xs text-muted-foreground">{dataPoint.event!.label}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

