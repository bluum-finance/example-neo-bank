'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deposit } from '@/components/payment/deposit';
import { Withdrawal } from '@/components/payment/withdrawal';
import { getAuth } from '@/lib/auth';
import { AccountService } from '@/services/account.service';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  route: string;
}

// Static UI data for quick actions - not fetched from service
const defaultQuickActions: Omit<QuickAction, 'icon'>[] = [
  {
    id: 'deposit',
    title: 'Deposit Funds',
    description: 'Add money to your portfolio',
    iconColor: '#10B981',
    route: '/invest?action=deposit',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    description: 'Transfer to your bank account',
    iconColor: '#F97316',
    route: '/invest?action=withdraw',
  },
  {
    id: 'allocation',
    title: 'Trade Assets',
    description: 'Buy and sell stocks and ETFs',
    iconColor: '#9333EA',
    route: '/invest/trade',
  },
  {
    id: 'auto-invest',
    title: 'Set Up Auto-Invest',
    description: 'Schedule recurring deposits',
    iconColor: '#3B82F6',
    route: '/invest?action=auto-invest',
  },
];

export function QuickActionsWidget() {
  const router = useRouter();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  // Get account ID and balance
  useEffect(() => {
    const loadAccount = async () => {
      const user = getAuth();
      const userAccountId = user?.externalAccountId;
      
      if (userAccountId) {
        setAccountId(userAccountId);
        try {
          const account = await AccountService.getAccount(userAccountId);
          const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
          setAvailableBalance(balanceValue);
        } catch (error) {
          console.error('Failed to load account balance:', error);
          setAvailableBalance(0);
        }
      }
    };

    loadAccount();
  }, []);

  // Map action IDs to their corresponding icons
  const getIconForAction = (id: string): React.ReactNode => {
    switch (id) {
      case 'deposit':
        return <ArrowUp className="h-5 w-5" />;
      case 'withdraw':
        return <ArrowDown className="h-5 w-5" />;
      case 'allocation':
        return <TrendingUp className="h-5 w-5" />;
      case 'auto-invest':
        return <Clock className="h-5 w-5" />;
      default:
        return <ArrowUp className="h-5 w-5" />;
    }
  };

  // Handle action click
  const handleActionClick = (action: QuickAction) => {
    if (action.id === 'deposit') {
      if (accountId) {
        setShowDepositModal(true);
      } else {
        router.push(action.route);
      }
    } else if (action.id === 'withdraw') {
      if (accountId) {
        setShowWithdrawModal(true);
      } else {
        router.push(action.route);
      }
    } else {
      router.push(action.route);
    }
  };

  const handleDepositSuccess = () => {
    setShowDepositModal(false);
    // Reload account balance
    if (accountId) {
      AccountService.getAccount(accountId)
        .then((account) => {
          const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
          setAvailableBalance(balanceValue);
        })
        .catch(console.error);
    }
  };

  const handleWithdrawSuccess = () => {
    setShowWithdrawModal(false);
    // Reload account balance
    if (accountId) {
      AccountService.getAccount(accountId)
        .then((account) => {
          const balanceValue = account?.balance ? parseFloat(account.balance) : 0;
          setAvailableBalance(balanceValue);
        })
        .catch(console.error);
    }
  };

  // Convert static data to component format with icons
  const quickActions: QuickAction[] = defaultQuickActions.map((action) => ({
    ...action,
    icon: getIconForAction(action.id),
  }));

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="w-full flex items-center gap-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#1A3A2C' }}
                >
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{action.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      {showDepositModal && accountId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(8, 52, 35, 0.5)' }}>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(8, 52, 35, 0.5)' }}>
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <Withdrawal
                accountId={accountId}
                availableBalance={availableBalance}
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
