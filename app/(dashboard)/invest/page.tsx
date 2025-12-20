'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BalanceCard } from '@/components/balance-card';
import { Separator } from '@/components/ui/separator';
import { InvestOnboarding } from '@/components/invest/onboarding';
import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { hasAcceptedInvestTerms, acceptInvestTerms, getAuth, setAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function Invest() {
  const router = useRouter();
  const [hasAccepted, setHasAccepted] = useState(hasAcceptedInvestTerms());
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [portfolioTotals, setPortfolioTotals] = useState({
    balance: 0,
    totalGain: 0,
    totalGainPercent: 0,
  });

  useEffect(() => {
    if (hasAccepted) {
      loadPortfolio();
    } else {
      setLoading(false);
    }
  }, [hasAccepted]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get account ID from user object
      const user = getAuth();
      let accountId = user?.externalAccountId;

      if (!accountId) {
        // Try to get existing accounts first
        try {
          const accounts = await AccountService.getAccounts();
          if (accounts && accounts.length > 0) {
            accountId = accounts[0].id;
          } else {
            // No account exists yet - user needs to create one
            setError('No investment account found. Please create an account first.');
            setLoading(false);
            return;
          }
        } catch (err) {
          setError('Failed to load accounts. Please try again later.');
          setLoading(false);
          return;
        }
      }

      // Store account ID
      setAccountId(accountId);

      // Fetch positions
      const positionsData = await InvestmentService.getPositions(accountId);
      setPositions(positionsData);

      // Calculate portfolio totals
      const totals = InvestmentService.calculatePortfolioTotals(positionsData);
      setPortfolioTotals(totals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTerms = (accountId?: string) => {
    acceptInvestTerms();
    setHasAccepted(true);

    // Update user with account ID if provided
    if (accountId) {
      const user = getAuth();
      if (user) {
        setAuth({
          ...user,
          externalAccountId: accountId,
        });
      }
    }

    toast.success('Welcome to investing!');
  };

  const handleBuy = () => {
    router.push('/invest/trade?side=buy');
  };

  const handleSell = () => {
    router.push('/invest/trade?side=sell');
  };

  const handleRetry = () => {
    loadPortfolio();
  };

  // Show onboarding if terms not accepted
  if (!hasAccepted) {
    return (
      <div className="">
        <InvestOnboarding onAccept={handleAcceptTerms} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Invest</h1>
        <p className="text-muted-foreground mt-1">Manage your investment portfolio</p>
      </div>

      {/* Investment Balance Card */}
      <BalanceCard
        balance={portfolioTotals.balance}
        label="Investment Balance"
        portfolioValue={{
          totalGain: portfolioTotals.totalGain,
          totalGainPercent: portfolioTotals.totalGainPercent,
        }}
        accountId={accountId || undefined}
        onSuccess={loadPortfolio}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleBuy} className="h-auto flex-col gap-2 py-4">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm">Buy</span>
        </Button>
        <Button onClick={handleSell} variant="outline" className="h-auto flex-col gap-2 py-4">
          <TrendingUp className="h-5 w-5 rotate-180" />
          <span className="text-sm">Sell</span>
        </Button>
      </div>

      {/* Stock Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading portfolio...</div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : positions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No holdings yet. Start investing!
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div key={position.symbol}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{position.symbol}</h3>
                        <Badge variant="outline" className="text-xs">
                          {position.shares} shares
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{position.name}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                          <p className="text-sm font-medium">
                            ${position.currentPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Value</p>
                          <p className="text-sm font-medium">${position.value.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {position.gain >= 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            position.gain >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {position.gain >= 0 ? '+' : ''}${position.gain.toFixed(2)}
                        </span>
                      </div>
                      <p
                        className={`text-xs ${
                          position.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {position.gainPercent >= 0 ? '+' : ''}
                        {position.gainPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  {index < positions.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
