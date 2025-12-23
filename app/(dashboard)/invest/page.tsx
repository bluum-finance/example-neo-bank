'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BalanceCard } from '@/components/balance-card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InvestOnboarding } from '@/components/invest/onboarding';
import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { hasAcceptedInvestTerms, acceptInvestTerms, getAuth, setAuth } from '@/lib/auth';
import { toast } from 'sonner';

export default function Invest() {
  const router = useRouter();
  const [hasAccepted, setHasAccepted] = useState(hasAcceptedInvestTerms());
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [portfolioGains, setPortfolioGains] = useState({
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
      const accountId = user?.externalAccountId;

      if (!accountId) {
        // No account ID found - user needs to create one
        setError('No investment account found. Please create an account first.');
        setLoading(false);
        return;
      }

      setAccountId(accountId);
      let account;
      try {
        account = await AccountService.getAccount(accountId);
      } catch (err) {
        setError('Error fetching account. Please try again later.');
        setLoading(false);
        return;
      }

      const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
      setAccountBalance(balanceValue);

      // Fetch positions, orders, and transactions in parallel
      const [positionsData, ordersData, transactionsData] = await Promise.all([
        InvestmentService.getPositions(accountId),
        InvestmentService.getOrders(accountId, { limit: 50 }),
        InvestmentService.getTransactions(accountId, { limit: 50 }),
      ]);

      setPositions(positionsData);
      setOrders(ordersData);
      setTransactions(transactionsData);

      // Calculate portfolio gains (for display in BalanceCard)
      const totals = InvestmentService.calculatePortfolioTotals(positionsData);
      setPortfolioGains({
        totalGain: totals.totalGain,
        totalGainPercent: totals.totalGainPercent,
      });
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
        balance={accountBalance}
        label="Investment Balance"
        portfolioValue={{
          totalGain: portfolioGains.totalGain,
          totalGainPercent: portfolioGains.totalGainPercent,
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

      {/* Positions, Orders, and Transactions Tabs */}
      <Card>
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
          ) : (
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              {/* Positions Tab */}
              <TabsContent value="positions" className="mt-4">
                {positions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No positions yet. Start investing!
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
                                <p className="text-sm font-medium">
                                  ${position.value.toFixed(2)}
                                </p>
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
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="mt-4">
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No orders yet. Place your first order!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => {
                      const getStatusIcon = () => {
                        switch (order.status) {
                          case 'filled':
                            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
                          case 'canceled':
                          case 'rejected':
                            return <XCircle className="h-4 w-4 text-red-600" />;
                          default:
                            return <Clock className="h-4 w-4 text-yellow-600" />;
                        }
                      };

                      const getStatusColor = () => {
                        switch (order.status) {
                          case 'filled':
                            return 'text-green-600';
                          case 'canceled':
                          case 'rejected':
                            return 'text-red-600';
                          default:
                            return 'text-yellow-600';
                        }
                      };

                      return (
                        <div key={order.id || index}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{order.symbol}</h3>
                                <Badge
                                  variant={order.side === 'buy' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {order.side.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {order.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Quantity</p>
                                  <p className="text-sm font-medium">
                                    {order.qty || order.filled_qty || 'N/A'}
                                  </p>
                                </div>
                                {order.average_price && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Avg Price</p>
                                    <p className="text-sm font-medium">
                                      ${parseFloat(order.average_price).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                                {order.limit_price && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Limit Price
                                    </p>
                                    <p className="text-sm font-medium">
                                      ${parseFloat(order.limit_price).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {order.submitted_at && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(order.submitted_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {getStatusIcon()}
                                <span className={`text-sm font-semibold ${getStatusColor()}`}>
                                  {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              {order.filled_qty && order.qty && (
                                <p className="text-xs text-muted-foreground">
                                  {order.filled_qty} / {order.qty} filled
                                </p>
                              )}
                            </div>
                          </div>
                          {index < orders.length - 1 && <Separator className="mt-4" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="mt-4">
                {transactions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No transactions yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction, index) => {
                      const isDeposit = transaction.type === 'deposit';
                      return (
                        <div key={transaction.id || transaction.transaction_id || index}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {isDeposit ? 'Deposit' : 'Withdrawal'}
                                </h3>
                                <Badge
                                  variant={isDeposit ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {transaction.type.toUpperCase()}
                                </Badge>
                                <Badge
                                  variant={
                                    transaction.status === 'settled'
                                      ? 'default'
                                      : transaction.status === 'failed'
                                      ? 'destructive'
                                      : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Amount</p>
                                  <p className="text-sm font-medium">
                                    ${parseFloat(transaction.amount || '0').toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Currency</p>
                                  <p className="text-sm font-medium">
                                    {transaction.currency || 'USD'}
                                  </p>
                                </div>
                                {transaction.fee && parseFloat(transaction.fee) > 0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Fee</p>
                                    <p className="text-sm font-medium">
                                      ${parseFloat(transaction.fee).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {transaction.description && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {transaction.description}
                                </p>
                              )}
                              {transaction.created_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(transaction.created_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                {isDeposit ? (
                                  <ArrowDown className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowUp className="h-4 w-4 text-red-600" />
                                )}
                                <span
                                  className={`text-sm font-semibold ${
                                    isDeposit ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {isDeposit ? '+' : '-'}$
                                  {parseFloat(transaction.amount || '0').toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {index < transactions.length - 1 && <Separator className="mt-4" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
