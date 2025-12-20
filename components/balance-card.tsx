import { Eye, EyeOff, ArrowDown, ArrowUp, Plus, Minus, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { InvestmentService } from '@/services/investment.service';
import { toast } from 'sonner';

interface BalanceCardProps {
  balance: number;
  accountNumber?: string;
  label?: string;
  className?: string;
  portfolioValue?: {
    totalGain: number;
    totalGainPercent: number;
  };
  accountId?: string;
  onSuccess?: () => void;
}

export function BalanceCard({
  balance,
  accountNumber,
  label = 'Account Balance',
  className,
  portfolioValue,
  accountId,
  onSuccess,
}: BalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleDeposit = async () => {
    if (!accountId) {
      toast.error('Account ID is required');
      return;
    }

    const depositAmount = parseFloat(amount);
    if (!amount || depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      await InvestmentService.fundAccount({
        account_id: accountId,
        amount: depositAmount.toFixed(2),
        currency: 'USD',
        funding_type: 'fiat',
      });
      toast.success('Deposit successful!');
      setShowDepositModal(false);
      setAmount('');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to deposit funds';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!accountId) {
      toast.error('Account ID is required');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (!amount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setProcessing(true);
    try {
      // Create withdrawal API route if it doesn't exist
      const response = await fetch('/api/investment/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: accountId,
          amount: withdrawAmount.toFixed(2),
          currency: 'USD',
          funding_type: 'fiat',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to withdraw funds' }));
        throw new Error(error.error || 'Failed to withdraw funds');
      }

      toast.success('Withdrawal successful!');
      setShowWithdrawModal(false);
      setAmount('');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to withdraw funds';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Card className={cn('bg-gradient-to-br from-primary to-primary/80', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between text-primary-foreground">
            <div className="flex flex-col gap-1">
              <p className="text-sm opacity-90">{label}</p>
              {accountNumber && (
                <p className="text-xs opacity-75">Account: {accountNumber}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-primary-foreground">
              {isVisible ? `₦${balance.toLocaleString()}` : '••••••'}
            </p>
            {portfolioValue && isVisible && (
              <div className="flex items-center gap-2 mt-3">
                {portfolioValue.totalGain >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-200" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-200" />
                )}
                <span
                  className={cn(
                    'text-sm font-semibold',
                    portfolioValue.totalGain >= 0 ? 'text-green-200' : 'text-red-200'
                  )}
                >
                  {portfolioValue.totalGain >= 0 ? '+' : ''}₦
                  {Math.abs(portfolioValue.totalGain).toLocaleString()} (
                  {portfolioValue.totalGainPercent > 0 ? '+' : ''}
                  {portfolioValue.totalGainPercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          {accountId && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-primary-foreground border border-white/30"
                onClick={() => setShowDepositModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Deposit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 bg-white/20 hover:bg-white/30 text-primary-foreground border border-white/30"
                onClick={() => setShowWithdrawModal(true)}
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Deposit Funds</h2>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setAmount('');
                  }}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={processing}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDepositModal(false);
                      setAmount('');
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleDeposit}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Deposit'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Withdraw Funds</h2>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setAmount('');
                  }}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={processing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: ${balance.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setAmount('');
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleWithdraw}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Withdraw'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

