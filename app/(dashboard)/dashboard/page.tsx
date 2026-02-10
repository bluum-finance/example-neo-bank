'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftRight, Plus, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BalanceCard } from '@/components/balance-card';
import { TransactionItem } from '@/components/transaction-item';
import { Separator } from '@/components/ui/separator';
import { mockUserAccount, getTransactions, type Transaction } from '@/lib/mock-data';
import { getInAppBalance } from '@/lib/auth';
import { InvestingAnnouncementPopup } from '@/components/invest/announcement-popup';
import { InvestingInvitation } from '@/components/invest/investing-invitation';
import { getAuth, setInvestingChoice } from '@/lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInvestmentAccount, setHasInvestmentAccount] = useState(false);

  useEffect(() => {
    getTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });

    // Check if user has an investment account
    const user = getAuth();
    setHasInvestmentAccount(!!user?.externalAccountId);
  }, []);

  const recentTransactions = transactions.slice(0, 5);
  const [inAppBalance, setInAppBalance] = useState<number>(0);

  useEffect(() => {
    setInAppBalance(getInAppBalance());
  }, []);

  const handleGetStarted = () => {
    // Set default to AI Wealth and navigate to invest page
    const user = getAuth();
    if (!user?.investingChoice) {
      setInvestingChoice('ai-wealth');
    }
    router.push('/invest');
  };

  const handleInvestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const user = getAuth();
    if (user?.externalAccountId) {
      // User already has account, go directly to invest page
      router.push('/invest');
    } else {
      // Set default to AI Wealth and navigate to invest page
      if (!user?.investingChoice) {
        setInvestingChoice('ai-wealth');
      }
      router.push('/invest');
    }
  };

  return (
    <>
      {/* Announcement Popup */}
      {!hasInvestmentAccount && (
        <InvestingAnnouncementPopup onGetStarted={handleGetStarted} />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account
          </p>
        </div>

        {/* Balance Card */}
        <BalanceCard
          balance={inAppBalance}
          accountNumber={mockUserAccount.accountNumber}
        />

        {/* Investing Invitation Section */}
        {!hasInvestmentAccount && (
          <InvestingInvitation onClick={handleGetStarted} />
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/transfers">
              <ArrowLeftRight className="h-5 w-5" />
              <span className="text-sm">Send Money</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={handleInvestClick}
            style={{ backgroundColor: '#edf9cd', borderColor: '#edf9cd', color: '#083423' }}
          >
            <TrendingUp className="h-5 w-5" style={{ color: '#083423' }} />
            <span className="text-sm">Invest</span>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/savings">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Save</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/cards">
              <Receipt className="h-5 w-5" />
              <span className="text-sm">Cards</span>
            </Link>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/transfers">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading transactions...
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-1">
                {recentTransactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <TransactionItem transaction={transaction} />
                    {index < recentTransactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

