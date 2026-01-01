'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NetWorthChart } from './net-worth-chart';
import { PersonalizedInsights } from './insights-cards';
import { TrendingStocks } from './trending-stocks';
import { InvestOnboarding } from './onboarding';

interface AIWealthLandingProps {
  onStartOnboarding: () => void;
  showOnboarding?: boolean;
  onAccountCreated?: (accountId?: string) => void;
}

export function AIWealthLanding({
  onStartOnboarding,
  showOnboarding = false,
  onAccountCreated,
}: AIWealthLandingProps) {
  if (showOnboarding && onAccountCreated) {
    return <InvestOnboarding onAccept={onAccountCreated} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2" style={{ backgroundColor: '#edf9cd' }}>
            <Sparkles className="h-6 w-6" style={{ color: '#081c14' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#081c14' }}>
              AI Personalized Wealth Management
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                style={{ borderColor: '#081c14', color: '#081c14', backgroundColor: '#edf9cd' }}
              >
                AI-Powered
              </Badge>
              <p className="text-sm text-muted-foreground">
                Let AI optimize your portfolio for maximum growth
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground max-w-3xl">
          Experience the future of investing with AI-driven portfolio management. Our advanced
          algorithms analyze market trends, your financial goals, and risk tolerance to create a
          personalized investment strategy that adapts to your life events and market conditions.
        </p>

        <Button
          onClick={onStartOnboarding}
          size="lg"
          style={{ backgroundColor: '#081c14', color: 'white' }}
          className="mt-4"
        >
          Get Started with AI Wealth Management
        </Button>
      </div>

      {/* Net Worth Growth Chart */}
      <NetWorthChart />

      {/* Personalized Insights */}
      <PersonalizedInsights />

      {/* Trending Stocks */}
      <TrendingStocks />
    </div>
  );
}

