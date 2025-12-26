import { Eye, EyeOff, ArrowDown, ArrowUp, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Deposit } from './payment/deposit';
import { Withdrawal } from './payment/withdrawal';

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

  const handleDepositSuccess = () => {
      setShowDepositModal(false);
      onSuccess?.();
  };

  const handleWithdrawSuccess = () => {
      setShowWithdrawModal(false);
      onSuccess?.();
  };

  return (
    <>
      <Card className={cn('bg-gradient-to-br from-primary to-primary/80', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between text-primary-foreground">
            <div className="flex flex-col gap-1">
              <p className="text-sm opacity-90">{label}</p>
              {accountNumber && <p className="text-xs opacity-75">Account: {accountNumber}</p>}
            </div>
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-primary-foreground">
              {isVisible
                ? `$${balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '••••••'}
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
                  {portfolioValue.totalGain >= 0 ? '+' : ''}$
                  {Math.abs(portfolioValue.totalGain).toLocaleString()} (
                  {portfolioValue.totalGainPercent > 0 ? '+' : ''}
                  {portfolioValue.totalGainPercent != null
                    ? portfolioValue.totalGainPercent.toFixed(2)
                    : '0.00'}
                  %)
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
      {showDepositModal && accountId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <Deposit
                accountId={accountId}
                onSuccess={handleDepositSuccess}
                onCancel={() => setShowDepositModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && accountId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <Withdrawal
                accountId={accountId}
                availableBalance={balance}
                onSuccess={handleWithdrawSuccess}
                onCancel={() => setShowWithdrawModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
