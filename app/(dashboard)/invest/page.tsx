'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowDown, ArrowUp, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BalanceCard } from '@/components/balance-card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InvestOnboarding } from '@/components/invest/onboarding';
import { InvestingChoiceModal, type InvestingChoice } from '@/components/invest/investing-choice-modal';
import { AIWealthLanding } from '@/components/invest/ai-wealth-landing';
import { InvestmentService, type Position } from '@/services/investment.service';
import { AccountService } from '@/services/account.service';
import { getAuth, setExternalAccountId, clearExternalAccountId, getInvestingChoice } from '@/lib/auth';
import { toast } from 'sonner';

export default function Invest() {
  const router = useRouter();
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
  const [hasAccountId, setHasAccountId] = useState<boolean>(false);
  const [showChoiceModal, setShowChoiceModal] = useState<boolean>(false);
  const [showAIOnboarding, setShowAIOnboarding] = useState<boolean>(false);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get account ID from user object
      const user = getAuth();
      const userAccountId = user?.externalAccountId;

      if (!userAccountId) {
        // No account ID found - user needs to create one
        setError('No investment account found. Please create an account first.');
        setLoading(false);
        return;
      }

      setAccountId(userAccountId);
      let account;
      try {
        account = await AccountService.getAccount(userAccountId);
      } catch (err) {
        const is404 = err instanceof Error && 'status' in err && (err as any).status === 404;
        if (is404) {
          // Clear externalAccountId since the account doesn't exist
          clearExternalAccountId();
          setHasAccountId(false);
          setAccountId(null);
          setLoading(false);
          return;
        }

        setError('Error fetching account. Please try again later.');
        setLoading(false);
        return;
      }

      const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
      setAccountBalance(balanceValue);

      // Fetch positions, orders, and transactions in parallel
      const [positionsData, ordersData, transactionsData] = await Promise.all([
        InvestmentService.getPositions(userAccountId),
        InvestmentService.getOrders(userAccountId, { limit: 50 }),
        InvestmentService.getTransactions(userAccountId, { limit: 50 }),
      ]);

      setPositions(positionsData);
      console.log('positionsData', positionsData);

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

  useEffect(() => {
    // Check if user has externalAccountId
    const user = getAuth();
    const userAccountId = user?.externalAccountId;

    if (userAccountId) {
      setHasAccountId(true);
      setAccountId(userAccountId);
      loadPortfolio();
    } else {
      setHasAccountId(false);
      setLoading(false);
      
      // Check if user has made a choice
      const choice = getInvestingChoice();
      if (!choice) {
        // Show choice modal if no choice has been made
        setShowChoiceModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccountCreated = (newAccountId?: string) => {
    if (!newAccountId) return;

    setExternalAccountId(newAccountId);
    setAccountId(newAccountId);
    setHasAccountId(true);
    loadPortfolio();
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

  const handleChoiceSelect = (choice: InvestingChoice) => {
    setShowChoiceModal(false);
    // Choice is already stored by the modal component
    // Proceed to onboarding (component will re-render and show onboarding)
  };

  const handleChoiceModalClose = (open: boolean) => {
    if (!open) {
      // If modal is being closed, check if user has made a choice
      const choice = getInvestingChoice();
      if (!choice) {
        // No choice made, redirect back to dashboard
        router.push('/dashboard');
        return;
      }
    }
    setShowChoiceModal(open);
  };

  // Show choice modal if no choice has been made and no account
  if (!hasAccountId && showChoiceModal) {
    return (
      <InvestingChoiceModal
        open={showChoiceModal}
        onOpenChange={handleChoiceModalClose}
        onSelect={handleChoiceSelect}
      />
    );
  }

  // Show AI Wealth Landing or Self-Directed Onboarding based on choice
  if (!hasAccountId) {
    const user = getAuth();
    const choice = user?.investingChoice || getInvestingChoice();

    if (choice === 'ai-wealth') {
      // If user clicked "Get Started", show onboarding directly
      if (showAIOnboarding) {
        return <InvestOnboarding onAccept={handleAccountCreated} />;
      }
      // Otherwise show the landing page
      return (
        <AIWealthLanding
          onStartOnboarding={() => setShowAIOnboarding(true)}
          showOnboarding={false}
          onAccountCreated={handleAccountCreated}
        />
      );
    } else {
      // Self-directed onboarding
      return (
        <div className="">
          <InvestOnboarding onAccept={handleAccountCreated} />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#081c14' }}>Invest</h1>
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
        <Button 
          onClick={handleBuy} 
          className="h-auto flex-col gap-2 py-4"
          style={{ backgroundColor: '#081c14', color: 'white' }}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm">Buy</span>
        </Button>
        <Button 
          onClick={handleSell} 
          variant="outline" 
          className="h-auto flex-col gap-2 py-4"
          style={{ borderColor: '#081c14', color: '#081c14' }}
        >
          <TrendingUp className="h-5 w-5 rotate-180" style={{ color: '#081c14' }} />
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
              <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: '#edf9cd' }}>
                <TabsTrigger 
                  value="positions" 
                  className="hover:bg-[#081c14]/10 [&.bg-background]:bg-[#081c14]/20 [&.bg-background]:text-[#081c14]"
                  style={{ color: '#081c14' }}
                >
                  Positions
                </TabsTrigger>
                <TabsTrigger 
                  value="orders"
                  className="hover:bg-[#081c14]/10 [&.bg-background]:bg-[#081c14]/20 [&.bg-background]:text-[#081c14]"
                  style={{ color: '#081c14' }}
                >
                  Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions"
                  className="hover:bg-[#081c14]/10 [&.bg-background]:bg-[#081c14]/20 [&.bg-background]:text-[#081c14]"
                  style={{ color: '#081c14' }}
                >
                  Transactions
                </TabsTrigger>
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
                              <Link
                                href={`/invest/assets/${position.symbol}`}
                                className="font-semibold hover:underline cursor-pointer"
                                style={{ color: '#081c14' }}
                              >
                                {position.symbol}
                              </Link>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Current Price</p>
                                <p className="text-sm font-medium">
                                  $
                                  {position.currentPrice != null
                                    ? position.currentPrice.toFixed(2)
                                    : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Value</p>
                                <p className="text-sm font-medium">
                                  ${position.value != null ? position.value.toFixed(2) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                          {position.gain != null && (
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
                                  {position.gain >= 0 ? '+' : ''}$
                                  {position.gain != null ? position.gain.toFixed(2) : 'N/A'}
                                </span>
                              </div>
                              <p
                                className={`text-xs ${
                                  position.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {position.gainPercent >= 0 ? '+' : ''}
                                {position.gainPercent != null
                                  ? position.gainPercent.toFixed(2)
                                  : 'N/A'}
                                %
                              </p>
                            </div>
                          )}
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
                                <Link
                                  href={`/invest/assets/${order.symbol}`}
                                  className="font-semibold hover:underline cursor-pointer"
                                  style={{ color: '#081c14' }}
                                >
                                  {order.symbol}
                                </Link>
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
                                      $
                                      {order.average_price != null &&
                                      !isNaN(parseFloat(order.average_price))
                                        ? parseFloat(order.average_price).toFixed(2)
                                        : 'N/A'}
                                    </p>
                                  </div>
                                )}
                                {order.limit_price && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Limit Price
                                    </p>
                                    <p className="text-sm font-medium">
                                      $
                                      {order.limit_price != null &&
                                      !isNaN(parseFloat(order.limit_price))
                                        ? parseFloat(order.limit_price).toFixed(2)
                                        : 'N/A'}
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
                                    transaction.status === 'settled' ||
                                    transaction.status === 'completed'
                                      ? 'success'
                                      : transaction.status === 'failed' ||
                                        transaction.status === 'canceled'
                                      ? 'destructive'
                                      : transaction.status === 'pending' ||
                                        transaction.status === 'processing'
                                      ? 'warning'
                                      : 'secondary'
                                  }
                                  className="text-xs capitalize"
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Amount</p>
                                  <p className="text-sm font-medium">
                                    $
                                    {transaction.amount != null &&
                                    !isNaN(parseFloat(transaction.amount))
                                      ? parseFloat(transaction.amount).toFixed(2)
                                      : '0.00'}
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
                                      $
                                      {transaction.fee != null &&
                                      !isNaN(parseFloat(transaction.fee))
                                        ? parseFloat(transaction.fee).toFixed(2)
                                        : 'N/A'}
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
                                  {transaction.amount != null &&
                                  !isNaN(parseFloat(transaction.amount))
                                    ? parseFloat(transaction.amount).toFixed(2)
                                    : '0.00'}
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
